import React, { useEffect, useRef } from 'react';

interface FootballGameProps {
  onGoalScored?: (playerGoals: number, opponentGoals: number) => void;
  onGameEnd?: (playerGoals: number, opponentGoals: number) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const FootballGame: React.FC<FootballGameProps> = ({ onGoalScored, onGameEnd, difficulty = 'easy' }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;
    let game: Phaser.Game | null = null;

    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default;

      const FIELD_WIDTH = 900;
      const FIELD_HEIGHT = 540;
      const GOAL_HALF = 65;

      // Difficulty scaling
      const PLAYER_SPEED = difficulty === 'easy' ? 210 : difficulty === 'medium' ? 230 : 255;
      const DEFENDER_SPEED = difficulty === 'easy' ? 110 : difficulty === 'medium' ? 155 : 195;
      const NUM_DEFENDERS = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
      const GK_SPEED = difficulty === 'easy' ? 110 : difficulty === 'medium' ? 150 : 200;
      const DEFENDER_INTERCEPT_RANGE = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 280 : 360;
      const MATCH_DURATION = 90;

      let playerGoals = 0;
      let opponentGoals = 0;
      let timeLeft = MATCH_DURATION;
      let gameActive = true;

      /* ===================== DEFENDER AI STATE MACHINE ===================== */
      type DefState = 'patrol' | 'press' | 'intercept' | 'clearBall';

      interface DefenderData {
        state: DefState;
        homeX: number;
        homeY: number;
        stateTimer: number;
      }

      class GameScene extends Phaser.Scene {
        private player!: Phaser.GameObjects.Container;
        private ball!: Phaser.GameObjects.Arc;
        private defenders: { sprite: Phaser.GameObjects.Container; data: DefenderData }[] = [];
        private goalkeeper!: Phaser.GameObjects.Container;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private scoreText!: Phaser.GameObjects.Text;
        private timerText!: Phaser.GameObjects.Text;
        private statusText!: Phaser.GameObjects.Text;
        private hasBall = false;
        private kickCooldown = 0;
        private timerEvent!: Phaser.Time.TimerEvent;
        private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

        // Joystick
        private joystickBase?: Phaser.GameObjects.Arc;
        private joystickThumb?: Phaser.GameObjects.Arc;
        private joystickPointer?: Phaser.Input.Pointer;
        private joystickVelocity = { x: 0, y: 0 };

        constructor() { super({ key: 'GameScene' }); }

        create() {
          this.drawField();
          this.createParticles();

          // Ball
          this.ball = this.add.circle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 11, 0xffffff);
          this.add.circle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 4, 0x333333).setDepth(2);
          this.physics.add.existing(this.ball);
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          ballBody.setCollideWorldBounds(true);
          ballBody.setBounce(0.55, 0.55);
          ballBody.setDamping(true);
          ballBody.setDrag(0.88);
          ballBody.setCircle(11);

          // Player
          this.player = this.createPlayer(150, FIELD_HEIGHT / 2, 0x22c55e, '10');
          this.physics.add.existing(this.player);
          const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
          playerBody.setCollideWorldBounds(true);
          playerBody.setCircle(16, 0, 0);

          // Goalkeeper
          this.goalkeeper = this.createPlayer(FIELD_WIDTH - 55, FIELD_HEIGHT / 2, 0xf59e0b, 'GK');
          this.physics.add.existing(this.goalkeeper);
          const gkBody = this.goalkeeper.body as Phaser.Physics.Arcade.Body;
          gkBody.setCollideWorldBounds(true);
          gkBody.setCircle(16, 0, 0);

          // Defenders with AI state
          for (let i = 0; i < NUM_DEFENDERS; i++) {
            const x = FIELD_WIDTH * 0.45 + (i % 2) * 100;
            const y = 110 + i * ((FIELD_HEIGHT - 220) / Math.max(NUM_DEFENDERS - 1, 1));
            const color = difficulty === 'hard' ? 0xdc2626 : difficulty === 'medium' ? 0xf97316 : 0xef4444;
            const sprite = this.createPlayer(x, y, color, String(i + 1));
            this.physics.add.existing(sprite);
            const dBody = sprite.body as Phaser.Physics.Arcade.Body;
            dBody.setCollideWorldBounds(true);
            dBody.setCircle(14, 0, 0);
            this.defenders.push({
              sprite,
              data: { state: 'patrol', homeX: x, homeY: y, stateTimer: 0 },
            });
          }

          // Controls
          this.cursors = this.input.keyboard!.createCursorKeys();

          // HUD
          this.createHUD();

          // Timer
          this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true,
          });

          // Mobile controls
          const isMobile = window.innerWidth < 768;
          if (isMobile) this.setupMobileControls();

          // Overlaps
          this.physics.add.overlap(this.player, this.ball, () => {
            if (!this.hasBall) this.hasBall = true;
          });
        }

        private createPlayer(x: number, y: number, color: number, label: string): Phaser.GameObjects.Container {
          const container = this.add.container(x, y);
          const body = this.add.circle(0, 0, 16, color);
          const shadow = this.add.circle(2, 2, 16, 0x000000, 0.3);
          const rim = this.add.circle(0, 0, 16, 0xffffff, 0);
          rim.setStrokeStyle(2, 0xffffff, 0.5);
          const text = this.add.text(0, 0, label, {
            fontSize: '9px', color: '#ffffff', fontStyle: 'bold',
          }).setOrigin(0.5);
          container.add([shadow, body, rim, text]);
          container.setDepth(3);
          return container;
        }

        private createParticles() {
          // Particle emitter for goals — using graphics
          const g = this.add.graphics();
          g.fillStyle(0xfbbf24);
          g.fillCircle(4, 4, 4);
          g.generateTexture('spark', 8, 8);
          g.destroy();

          this.particles = this.add.particles(0, 0, 'spark', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            lifespan: 800,
            quantity: 30,
            emitting: false,
          });
          this.particles.setDepth(20);
        }

        private createHUD() {
          // Score panel
          const hudBg = this.add.rectangle(FIELD_WIDTH / 2, 22, 220, 36, 0x000000, 0.6).setDepth(10);
          hudBg.setStrokeStyle(1, 0x22c55e, 0.5);

          this.scoreText = this.add.text(FIELD_WIDTH / 2, 22, '🟢 0 — 0 🔴', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Oswald', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(11);

          // Timer
          const timerBg = this.add.rectangle(FIELD_WIDTH - 45, 22, 70, 32, 0x000000, 0.6).setDepth(10);
          timerBg.setStrokeStyle(1, 0xfbbf24, 0.5);
          this.timerText = this.add.text(FIELD_WIDTH - 45, 22, `${MATCH_DURATION}s`, {
            fontSize: '16px', color: '#fbbf24', fontFamily: 'Oswald',
          }).setOrigin(0.5).setDepth(11);

          // Difficulty badge
          const diffColor = difficulty === 'hard' ? '#ef4444' : difficulty === 'medium' ? '#f97316' : '#22c55e';
          this.add.text(50, 22, difficulty.toUpperCase(), {
            fontSize: '11px', color: diffColor, fontFamily: 'Oswald',
          }).setOrigin(0.5).setDepth(11);

          // Status text
          this.statusText = this.add.text(FIELD_WIDTH / 2, FIELD_HEIGHT / 2 - 90, '', {
            fontSize: '32px', color: '#fbbf24', fontFamily: 'Oswald', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 5,
          }).setOrigin(0.5).setDepth(15);
        }

        private drawField() {
          const g = this.add.graphics();

          // Multi-shade pitch stripes
          const stripeCount = 10;
          const stripeW = FIELD_WIDTH / stripeCount;
          for (let i = 0; i < stripeCount; i++) {
            g.fillStyle(i % 2 === 0 ? 0x15803d : 0x16a34a);
            g.fillRect(i * stripeW, 0, stripeW, FIELD_HEIGHT);
          }

          // Field markings
          g.lineStyle(2.5, 0xffffff, 0.92);

          // Outer border
          g.strokeRect(30, 28, FIELD_WIDTH - 60, FIELD_HEIGHT - 56);

          // Halfway line
          g.lineBetween(FIELD_WIDTH / 2, 28, FIELD_WIDTH / 2, FIELD_HEIGHT - 28);

          // Center circle
          g.strokeCircle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 75);
          g.fillStyle(0xffffff, 0.8);
          g.fillCircle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 5);

          // Penalty areas
          // Left
          g.strokeRect(30, FIELD_HEIGHT / 2 - 95, 130, 190);
          g.strokeRect(30, FIELD_HEIGHT / 2 - 50, 55, 100);
          // Right
          g.strokeRect(FIELD_WIDTH - 160, FIELD_HEIGHT / 2 - 95, 130, 190);
          g.strokeRect(FIELD_WIDTH - 85, FIELD_HEIGHT / 2 - 50, 55, 100);

          // Penalty spots
          g.fillStyle(0xffffff, 0.9);
          g.fillCircle(110, FIELD_HEIGHT / 2, 4);
          g.fillCircle(FIELD_WIDTH - 110, FIELD_HEIGHT / 2, 4);

          // Arc at penalty areas (use arc + stroke)
          g.beginPath();
          g.arc(110, FIELD_HEIGHT / 2, 65, -0.93, 0.93, false);
          g.stroke();
          g.beginPath();
          g.arc(FIELD_WIDTH - 110, FIELD_HEIGHT / 2, 65, Math.PI - 0.93, Math.PI + 0.93, false);
          g.stroke();

          // Corner arcs
          g.beginPath();
          g.arc(30, 28, 12, 0, Math.PI / 2, false);
          g.stroke();
          g.beginPath();
          g.arc(FIELD_WIDTH - 30, 28, 12, Math.PI / 2, Math.PI, false);
          g.stroke();
          g.beginPath();
          g.arc(30, FIELD_HEIGHT - 28, 12, -Math.PI / 2, 0, false);
          g.stroke();
          g.beginPath();
          g.arc(FIELD_WIDTH - 30, FIELD_HEIGHT - 28, 12, Math.PI, Math.PI * 1.5, false);
          g.stroke();

          // Goals with fill
          // Left goal (opponent attacks, player defends from left)
          g.fillStyle(0xffffff, 0.15);
          g.fillRect(0, FIELD_HEIGHT / 2 - GOAL_HALF, 30, GOAL_HALF * 2);
          g.lineStyle(5, 0xffffff, 1);
          g.strokeRect(0, FIELD_HEIGHT / 2 - GOAL_HALF, 30, GOAL_HALF * 2);

          // Right goal (player scores here)
          g.fillStyle(0xffffff, 0.15);
          g.fillRect(FIELD_WIDTH - 30, FIELD_HEIGHT / 2 - GOAL_HALF, 30, GOAL_HALF * 2);
          g.lineStyle(5, 0x22c55e, 1);
          g.strokeRect(FIELD_WIDTH - 30, FIELD_HEIGHT / 2 - GOAL_HALF, 30, GOAL_HALF * 2);

          // Goal net lines
          g.lineStyle(1, 0xffffff, 0.25);
          for (let row = 1; row < 6; row++) {
            g.lineBetween(0, FIELD_HEIGHT / 2 - GOAL_HALF + row * (GOAL_HALF * 2 / 6), 30, FIELD_HEIGHT / 2 - GOAL_HALF + row * (GOAL_HALF * 2 / 6));
            g.lineBetween(FIELD_WIDTH - 30, FIELD_HEIGHT / 2 - GOAL_HALF + row * (GOAL_HALF * 2 / 6), FIELD_WIDTH, FIELD_HEIGHT / 2 - GOAL_HALF + row * (GOAL_HALF * 2 / 6));
          }
          for (let col = 1; col < 4; col++) {
            g.lineBetween(col * 7.5, FIELD_HEIGHT / 2 - GOAL_HALF, col * 7.5, FIELD_HEIGHT / 2 + GOAL_HALF);
            g.lineBetween(FIELD_WIDTH - 30 + col * 7.5, FIELD_HEIGHT / 2 - GOAL_HALF, FIELD_WIDTH - 30 + col * 7.5, FIELD_HEIGHT / 2 + GOAL_HALF);
          }
        }

        private setupMobileControls() {
          const baseX = 80;
          const baseY = FIELD_HEIGHT - 80;

          this.joystickBase = this.add.circle(baseX, baseY, 48, 0xffffff, 0.12).setDepth(20);
          this.joystickBase.setStrokeStyle(2, 0x22c55e, 0.4);
          this.joystickThumb = this.add.circle(baseX, baseY, 22, 0x22c55e, 0.75).setDepth(21);

          // Kick button
          const kickBg = this.add.circle(FIELD_WIDTH - 75, FIELD_HEIGHT - 75, 44, 0x22c55e, 0.25).setDepth(20);
          kickBg.setStrokeStyle(2, 0x22c55e, 0.5);
          this.add.text(FIELD_WIDTH - 75, FIELD_HEIGHT - 75, '⚡\nKICK', {
            fontSize: '13px', color: '#ffffff', fontFamily: 'Oswald', align: 'center',
          }).setOrigin(0.5).setDepth(21);

          this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < FIELD_WIDTH * 0.42) {
              this.joystickPointer = pointer;
            } else {
              this.kickBall();
            }
          });
          this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
              const dx = pointer.x - baseX;
              const dy = pointer.y - baseY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const maxDist = 42;
              if (dist > 0) {
                const normX = (dx / dist) * Math.min(dist, maxDist);
                const normY = (dy / dist) * Math.min(dist, maxDist);
                this.joystickThumb!.setPosition(baseX + normX, baseY + normY);
                this.joystickVelocity = { x: normX / maxDist, y: normY / maxDist };
              }
            }
          });
          this.input.on('pointerup', () => {
            this.joystickPointer = undefined;
            this.joystickVelocity = { x: 0, y: 0 };
            this.joystickThumb?.setPosition(baseX, baseY);
          });
        }

        private kickBall() {
          if (!gameActive || this.kickCooldown > 0) return;
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          const dx = this.ball.x - this.player.x;
          const dy = this.ball.y - this.player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 65) {
            const speed = 450 + Math.random() * 80;
            ballBody.setVelocity(
              dx !== 0 || dy !== 0 ? (dx / dist) * speed : speed,
              dy !== 0 ? (dy / dist) * speed : 0,
            );
            this.hasBall = false;
            this.kickCooldown = 450;
          }
        }

        private tickTimer() {
          if (!gameActive) return;
          timeLeft--;
          this.timerText.setText(`${timeLeft}s`);
          if (timeLeft <= 15) this.timerText.setStyle({ color: '#ef4444', fontFamily: 'Oswald', fontSize: '16px' });
          if (timeLeft <= 0) {
            gameActive = false;
            this.timerEvent.remove();
            this.statusText.setText('⏱ FULL TIME!');
            this.time.delayedCall(2500, () => onGameEnd?.(playerGoals, opponentGoals));
          }
        }

        private checkGoals() {
          const bx = this.ball.x;
          const by = this.ball.y;
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;

          // Player scores in RIGHT goal
          if (bx > FIELD_WIDTH - 12 && by > FIELD_HEIGHT / 2 - GOAL_HALF && by < FIELD_HEIGHT / 2 + GOAL_HALF) {
            playerGoals++;
            this.scoreText.setText(`🟢 ${playerGoals} — ${opponentGoals} 🔴`);
            this.statusText.setText('⚽ GOAL!!');
            this.statusText.setStyle({ color: '#22c55e', fontSize: '36px', fontFamily: 'Oswald', stroke: '#000', strokeThickness: 6 });
            this.particles.setPosition(FIELD_WIDTH - 30, FIELD_HEIGHT / 2);
            this.particles.explode(40);
            this.cameras.main.shake(300, 0.012);
            onGoalScored?.(playerGoals, opponentGoals);
            this.time.delayedCall(1800, () => { this.statusText.setText(''); this.resetBall(); });
          }

          // Opponent scores in LEFT goal
          if (bx < 12 && by > FIELD_HEIGHT / 2 - GOAL_HALF && by < FIELD_HEIGHT / 2 + GOAL_HALF) {
            opponentGoals++;
            this.scoreText.setText(`🟢 ${playerGoals} — ${opponentGoals} 🔴`);
            this.statusText.setText('❌ CONCEDED!');
            this.statusText.setStyle({ color: '#ef4444', fontSize: '30px', fontFamily: 'Oswald', stroke: '#000', strokeThickness: 5 });
            this.cameras.main.shake(200, 0.008);
            this.time.delayedCall(1800, () => { this.statusText.setText(''); this.resetBall(); });
          }
        }

        private resetBall() {
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          ballBody.reset(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);
          ballBody.setVelocity(0, 0);
          this.hasBall = false;
          // Reset player to center-ish
          const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
          playerBody.reset(180, FIELD_HEIGHT / 2);
        }

        /* ============= SMART DEFENDER AI ============= */
        private updateDefender(def: { sprite: Phaser.GameObjects.Container; data: DefenderData }, delta: number) {
          const d = def.data;
          const sprite = def.sprite;
          const dBody = sprite.body as Phaser.Physics.Arcade.Body;

          const distToBall = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.ball.x, this.ball.y);
          const distToPlayer = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.player.x, this.player.y);

          d.stateTimer -= delta;

          // STATE TRANSITIONS
          if (d.state === 'patrol') {
            if (distToBall < DEFENDER_INTERCEPT_RANGE || distToPlayer < DEFENDER_INTERCEPT_RANGE * 0.7) {
              d.state = distToBall < 80 ? 'clearBall' : 'press';
              d.stateTimer = 1200;
            }
          } else if (d.state === 'press') {
            if (distToBall < 40) {
              d.state = 'clearBall';
              d.stateTimer = 600;
            } else if (distToBall > DEFENDER_INTERCEPT_RANGE * 1.3 && d.stateTimer < 0) {
              d.state = 'patrol';
            }
          } else if (d.state === 'clearBall') {
            if (distToBall > 50) {
              d.state = distToPlayer < DEFENDER_INTERCEPT_RANGE ? 'press' : 'patrol';
              d.stateTimer = 800;
            }
          } else if (d.state === 'intercept') {
            if (distToBall < 30) {
              d.state = 'clearBall';
            } else if (d.stateTimer < 0) {
              d.state = 'press';
            }
          }

          // STATE BEHAVIORS
          let targetX = sprite.x;
          let targetY = sprite.y;

          if (d.state === 'patrol') {
            // Return to home position in a sweeping motion
            targetX = d.homeX + Math.sin(Date.now() / 2000) * 40;
            targetY = d.homeY + Math.cos(Date.now() / 1600) * 30;
            const moveToHome = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
            const homeDist = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY);
            if (homeDist > 15) {
              dBody.setVelocity(
                Math.cos(moveToHome) * DEFENDER_SPEED * 0.5,
                Math.sin(moveToHome) * DEFENDER_SPEED * 0.5,
              );
            } else {
              dBody.setVelocity(0, 0);
            }
          } else if (d.state === 'press') {
            // Predict ball position and intercept
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            const predictFrames = 0.4;
            targetX = this.ball.x + ballBody.velocity.x * predictFrames;
            targetY = this.ball.y + ballBody.velocity.y * predictFrames;

            // Bias toward cutting off player's path to goal
            if (this.hasBall) {
              const goalX = FIELD_WIDTH - 30;
              const goalY = FIELD_HEIGHT / 2;
              targetX = this.player.x * 0.3 + goalX * 0.35 + targetX * 0.35;
              targetY = this.player.y * 0.3 + goalY * 0.35 + targetY * 0.35;
            }

            const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
            dBody.setVelocity(
              Math.cos(angle) * DEFENDER_SPEED,
              Math.sin(angle) * DEFENDER_SPEED,
            );
          } else if (d.state === 'clearBall') {
            // Kick ball away — back toward center or player's half
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            ballBody.setVelocity(-220 + Math.random() * 80, (Math.random() - 0.5) * 250);
            this.hasBall = false;
            dBody.setVelocity(0, 0);
          } else if (d.state === 'intercept') {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            const predictT = 0.5;
            targetX = this.ball.x + ballBody.velocity.x * predictT;
            targetY = this.ball.y + ballBody.velocity.y * predictT;
            const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
            dBody.setVelocity(
              Math.cos(angle) * DEFENDER_SPEED * 1.2,
              Math.sin(angle) * DEFENDER_SPEED * 1.2,
            );
          }
        }

        update(_time: number, delta: number) {
          if (!gameActive) return;

          const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
          playerBody.setVelocity(0, 0);

          // Keyboard controls
          const vx = this.cursors.left.isDown ? -PLAYER_SPEED : this.cursors.right.isDown ? PLAYER_SPEED : 0;
          const vy = this.cursors.up.isDown ? -PLAYER_SPEED : this.cursors.down.isDown ? PLAYER_SPEED : 0;
          playerBody.setVelocity(vx, vy);

          // Kick
          if (Phaser.Input.Keyboard.JustDown(this.cursors.space!)) this.kickBall();

          // Mobile joystick
          if (this.joystickVelocity.x !== 0 || this.joystickVelocity.y !== 0) {
            playerBody.setVelocity(
              this.joystickVelocity.x * PLAYER_SPEED,
              this.joystickVelocity.y * PLAYER_SPEED,
            );
          }

          this.kickCooldown = Math.max(0, this.kickCooldown - delta);

          // Ball control when touching
          if (this.hasBall) {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            const angle = Phaser.Math.Angle.Between(this.ball.x, this.ball.y, this.player.x, this.player.y);
            const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, this.player.x, this.player.y);
            if (dist > 22) {
              ballBody.setVelocity(Math.cos(angle) * 280, Math.sin(angle) * 280);
            }
          }

          // Defender AI updates
          this.defenders.forEach(def => this.updateDefender(def, delta));

          // Goalkeeper AI — predictive lateral movement
          const gkBody = this.goalkeeper.body as Phaser.Physics.Arcade.Body;
          const gkMinY = FIELD_HEIGHT / 2 - GOAL_HALF + 5;
          const gkMaxY = FIELD_HEIGHT / 2 + GOAL_HALF - 5;
          const gkFixedX = FIELD_WIDTH - 50;

          // Predict ball trajectory to GK line
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          let targetGkY = this.ball.y;
          if (Math.abs(ballBody.velocity.x) > 50 && this.ball.x > FIELD_WIDTH / 2) {
            const timeToGoal = (gkFixedX - this.ball.x) / (ballBody.velocity.x || 1);
            targetGkY = this.ball.y + ballBody.velocity.y * timeToGoal * 0.7;
          }
          targetGkY = Phaser.Math.Clamp(targetGkY, gkMinY, gkMaxY);

          const gkDiff = targetGkY - this.goalkeeper.y;
          if (Math.abs(gkDiff) > 5) {
            gkBody.setVelocity(0, Math.sign(gkDiff) * GK_SPEED);
          } else {
            gkBody.setVelocity(0, 0);
          }

          // Keep GK at fixed x
          this.goalkeeper.x = gkFixedX;

          // GK blocks ball
          if (Phaser.Math.Distance.Between(this.goalkeeper.x, this.goalkeeper.y, this.ball.x, this.ball.y) < 32) {
            ballBody.setVelocity(-320 + Math.random() * 100, (Math.random() - 0.5) * 350);
            this.hasBall = false;
            this.cameras.main.shake(80, 0.005);
          }

          this.checkGoals();
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        backgroundColor: '#15803d',
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: [GameScene],
        parent: gameRef.current!,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        audio: { disableWebAudio: true },
      };

      game = new Phaser.Game(config);
      phaserRef.current = game;
    };

    initPhaser();

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [difficulty, onGoalScored, onGameEnd]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full overflow-hidden rounded-2xl border-2 border-primary/40 shadow-elevated" style={{ maxWidth: 900 }}>
        <div ref={gameRef} className="w-full" />
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <span>⬆️⬇️⬅️➡️ Move</span>
        <span>⎵ Kick ball</span>
        <span className="md:hidden">👆 Left = joystick | Right = kick</span>
      </div>
    </div>
  );
};

export default FootballGame;
