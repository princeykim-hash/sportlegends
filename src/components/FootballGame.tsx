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

      const FIELD_WIDTH = 800;
      const FIELD_HEIGHT = 500;
      const PLAYER_SPEED = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 220 : 240;
      const DEFENDER_SPEED = difficulty === 'easy' ? 120 : difficulty === 'medium' ? 160 : 200;
      const NUM_DEFENDERS = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
      const MATCH_DURATION = 60;

      let playerGoals = 0;
      let opponentGoals = 0;
      let timeLeft = MATCH_DURATION;
      let gameActive = true;

      class GameScene extends Phaser.Scene {
        private player!: Phaser.GameObjects.Arc;
        private ball!: Phaser.GameObjects.Arc;
        private defenders: Phaser.GameObjects.Arc[] = [];
        private goalkeeper!: Phaser.GameObjects.Arc;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private playerGoalText!: Phaser.GameObjects.Text;
        private opponentGoalText!: Phaser.GameObjects.Text;
        private timerText!: Phaser.GameObjects.Text;
        private statusText!: Phaser.GameObjects.Text;
        private hasBall = false;
        private kickCooldown = 0;
        private timerEvent!: Phaser.Time.TimerEvent;

        // Joystick for mobile
        private joystickBase?: Phaser.GameObjects.Arc;
        private joystickThumb?: Phaser.GameObjects.Arc;
        private joystickPointer?: Phaser.Input.Pointer;
        private joystickVelocity = { x: 0, y: 0 };

        constructor() {
          super({ key: 'GameScene' });
        }

        create() {
          // Draw field
          this.drawField();

          // Ball
          this.ball = this.add.circle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 10, 0xffffff);
          this.physics.add.existing(this.ball);
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          ballBody.setCollideWorldBounds(true);
          ballBody.setBounce(0.5, 0.5);
          ballBody.setDamping(true);
          ballBody.setDrag(0.85);

          // Player
          this.player = this.add.circle(150, FIELD_HEIGHT / 2, 16, 0x22c55e);
          this.physics.add.existing(this.player);
          const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
          playerBody.setCollideWorldBounds(true);

          // Add number on player
          this.add.text(150, FIELD_HEIGHT / 2, '10', {
            fontSize: '10px',
            color: '#000000',
            fontFamily: 'Oswald',
          }).setOrigin(0.5);

          // Goalkeeper
          this.goalkeeper = this.add.circle(FIELD_WIDTH - 50, FIELD_HEIGHT / 2, 16, 0xf59e0b);
          this.physics.add.existing(this.goalkeeper);
          const gkBody = this.goalkeeper.body as Phaser.Physics.Arcade.Body;
          gkBody.setCollideWorldBounds(true);

          // Defenders
          for (let i = 0; i < NUM_DEFENDERS; i++) {
            const x = FIELD_WIDTH * 0.4 + (i % 2) * 120;
            const y = 100 + i * ((FIELD_HEIGHT - 200) / (NUM_DEFENDERS - 1 || 1));
            const defender = this.add.circle(x, y, 14, 0xef4444);
            this.physics.add.existing(defender);
            const dBody = defender.body as Phaser.Physics.Arcade.Body;
            dBody.setCollideWorldBounds(true);
            this.defenders.push(defender);
          }

          // Cursor keys
          this.cursors = this.input.keyboard!.createCursorKeys();

          // UI
          this.playerGoalText = this.add.text(60, 20, '🟢 0', {
            fontSize: '20px', color: '#22c55e', fontFamily: 'Oswald',
          });
          this.opponentGoalText = this.add.text(FIELD_WIDTH - 80, 20, '0 🔴', {
            fontSize: '20px', color: '#ef4444', fontFamily: 'Oswald',
          });
          this.timerText = this.add.text(FIELD_WIDTH / 2, 20, '60', {
            fontSize: '22px', color: '#fbbf24', fontFamily: 'Oswald',
          }).setOrigin(0.5);
          this.statusText = this.add.text(FIELD_WIDTH / 2, FIELD_HEIGHT / 2 - 80, '', {
            fontSize: '28px', color: '#fbbf24', fontFamily: 'Oswald', stroke: '#000', strokeThickness: 4,
          }).setOrigin(0.5).setDepth(10);

          // Timer
          this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true,
          });

          // Mobile joystick
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            this.joystickBase = this.add.circle(80, FIELD_HEIGHT - 80, 45, 0xffffff, 0.15)
              .setInteractive().setDepth(20);
            this.joystickThumb = this.add.circle(80, FIELD_HEIGHT - 80, 22, 0x22c55e, 0.7).setDepth(21);

            this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
              if (pointer.x < FIELD_WIDTH * 0.4) {
                this.joystickPointer = pointer;
              } else {
                // Kick on right side tap
                this.kickBall();
              }
            });
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
              if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
                const dx = pointer.x - 80;
                const dy = pointer.y - (FIELD_HEIGHT - 80);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 40;
                if (dist > 0) {
                  const normX = (dx / dist) * Math.min(dist, maxDist);
                  const normY = (dy / dist) * Math.min(dist, maxDist);
                  this.joystickThumb!.setPosition(80 + normX, FIELD_HEIGHT - 80 + normY);
                  this.joystickVelocity = { x: normX / maxDist, y: normY / maxDist };
                }
              }
            });
            this.input.on('pointerup', () => {
              this.joystickPointer = undefined;
              this.joystickVelocity = { x: 0, y: 0 };
              this.joystickThumb?.setPosition(80, FIELD_HEIGHT - 80);
            });

            // Kick button
            this.add.circle(FIELD_WIDTH - 70, FIELD_HEIGHT - 70, 40, 0x22c55e, 0.3).setDepth(20);
            this.add.text(FIELD_WIDTH - 70, FIELD_HEIGHT - 70, '⚽\nKICK', {
              fontSize: '14px', color: '#ffffff', fontFamily: 'Oswald', align: 'center',
            }).setOrigin(0.5).setDepth(21);
          }

          // Overlap detection
          this.physics.add.overlap(this.player, this.ball, () => {
            if (!this.hasBall) this.hasBall = true;
          });
        }

        private drawField() {
          const g = this.add.graphics();
          // Pitch background
          g.fillStyle(0x15803d);
          g.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

          // Stripes
          for (let i = 0; i < 8; i++) {
            if (i % 2 === 0) {
              g.fillStyle(0x16a34a, 0.5);
              g.fillRect(i * (FIELD_WIDTH / 8), 0, FIELD_WIDTH / 8, FIELD_HEIGHT);
            }
          }

          g.lineStyle(2, 0xffffff, 0.9);
          // Border
          g.strokeRect(30, 30, FIELD_WIDTH - 60, FIELD_HEIGHT - 60);
          // Halfway line
          g.lineBetween(FIELD_WIDTH / 2, 30, FIELD_WIDTH / 2, FIELD_HEIGHT - 30);
          // Center circle
          g.strokeCircle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 70);
          g.fillStyle(0xffffff, 0.6);
          g.fillCircle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 4);

          // Left penalty box
          g.strokeRect(30, FIELD_HEIGHT / 2 - 80, 120, 160);
          g.strokeRect(30, FIELD_HEIGHT / 2 - 40, 50, 80);
          // Right penalty box
          g.strokeRect(FIELD_WIDTH - 150, FIELD_HEIGHT / 2 - 80, 120, 160);
          g.strokeRect(FIELD_WIDTH - 80, FIELD_HEIGHT / 2 - 40, 50, 80);

          // Goals (drawn as thick lines)
          g.lineStyle(6, 0xffffff, 1);
          g.lineBetween(0, FIELD_HEIGHT / 2 - 55, 30, FIELD_HEIGHT / 2 - 55);
          g.lineBetween(0, FIELD_HEIGHT / 2 + 55, 30, FIELD_HEIGHT / 2 + 55);
          g.lineBetween(0, FIELD_HEIGHT / 2 - 55, 0, FIELD_HEIGHT / 2 + 55);

          g.lineBetween(FIELD_WIDTH, FIELD_HEIGHT / 2 - 55, FIELD_WIDTH - 30, FIELD_HEIGHT / 2 - 55);
          g.lineBetween(FIELD_WIDTH, FIELD_HEIGHT / 2 + 55, FIELD_WIDTH - 30, FIELD_HEIGHT / 2 + 55);
          g.lineBetween(FIELD_WIDTH, FIELD_HEIGHT / 2 - 55, FIELD_WIDTH, FIELD_HEIGHT / 2 + 55);
        }

        private kickBall() {
          if (!gameActive || this.kickCooldown > 0) return;
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          const dx = this.ball.x - this.player.x;
          const dy = this.ball.y - this.player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            const speed = 400;
            ballBody.setVelocity((dx / dist) * speed || speed, (dy / dist) * speed);
            this.hasBall = false;
            this.kickCooldown = 500;
          }
        }

        private tickTimer() {
          if (!gameActive) return;
          timeLeft--;
          this.timerText.setText(String(timeLeft));
          if (timeLeft <= 10) this.timerText.setStyle({ color: '#ef4444' });
          if (timeLeft <= 0) {
            gameActive = false;
            this.timerEvent.remove();
            this.statusText.setText('FULL TIME!');
            this.time.delayedCall(2000, () => {
              onGameEnd?.(playerGoals, opponentGoals);
            });
          }
        }

        private checkGoals() {
          const bx = this.ball.x;
          const by = this.ball.y;
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;

          // Right goal (player scores)
          if (bx > FIELD_WIDTH - 10 && by > FIELD_HEIGHT / 2 - 55 && by < FIELD_HEIGHT / 2 + 55) {
            playerGoals++;
            this.playerGoalText.setText(`🟢 ${playerGoals}`);
            this.statusText.setText('⚽ GOAL!');
            this.showGoalFlash();
            onGoalScored?.(playerGoals, opponentGoals);
            this.resetBall();
          }

          // Left goal (opponent scores)
          if (bx < 10 && by > FIELD_HEIGHT / 2 - 55 && by < FIELD_HEIGHT / 2 + 55) {
            opponentGoals++;
            this.opponentGoalText.setText(`${opponentGoals} 🔴`);
            this.statusText.setText('❌ Opponent scored!');
            this.resetBall();
          }
        }

        private showGoalFlash() {
          const flash = this.add.rectangle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, FIELD_WIDTH, FIELD_HEIGHT, 0xfbbf24, 0.3).setDepth(5);
          this.time.delayedCall(300, () => flash.destroy());
          this.time.delayedCall(1500, () => this.statusText.setText(''));
        }

        private resetBall() {
          const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
          ballBody.reset(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);
          this.hasBall = false;
        }

        update(_time: number, delta: number) {
          if (!gameActive) return;

          const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
          playerBody.setVelocity(0, 0);

          // Keyboard
          if (this.cursors.left.isDown) playerBody.setVelocityX(-PLAYER_SPEED);
          else if (this.cursors.right.isDown) playerBody.setVelocityX(PLAYER_SPEED);
          if (this.cursors.up.isDown) playerBody.setVelocityY(-PLAYER_SPEED);
          else if (this.cursors.down.isDown) playerBody.setVelocityY(PLAYER_SPEED);

          // Space to kick
          if (this.cursors.space?.isDown) this.kickBall();

          // Mobile joystick
          if (this.joystickVelocity.x !== 0 || this.joystickVelocity.y !== 0) {
            playerBody.setVelocity(
              this.joystickVelocity.x * PLAYER_SPEED,
              this.joystickVelocity.y * PLAYER_SPEED,
            );
          }

          this.kickCooldown = Math.max(0, this.kickCooldown - delta);

          // Ball attraction when \"has ball\"
          if (this.hasBall) {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            const angle = Phaser.Math.Angle.Between(this.ball.x, this.ball.y, this.player.x, this.player.y);
            const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, this.player.x, this.player.y);
            if (dist > 20) {
              ballBody.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
            }
          }

          // Defender AI
          this.defenders.forEach(defender => {
            const dBody = defender.body as Phaser.Physics.Arcade.Body;
            const distToBall = Phaser.Math.Distance.Between(defender.x, defender.y, this.ball.x, this.ball.y);
            const distToPlayer = Phaser.Math.Distance.Between(defender.x, defender.y, this.player.x, this.player.y);

            let targetX = this.ball.x;
            let targetY = this.ball.y;

            if (distToPlayer < 150) {
              targetX = this.player.x;
              targetY = this.player.y;
            }

            if (distToBall < 300 || distToPlayer < 150) {
              const angle = Phaser.Math.Angle.Between(defender.x, defender.y, targetX, targetY);
              dBody.setVelocity(Math.cos(angle) * DEFENDER_SPEED, Math.sin(angle) * DEFENDER_SPEED);
            } else {
              dBody.setVelocity(0, 0);
            }

            // If defender touches ball, kick it away from goal
            if (Phaser.Math.Distance.Between(defender.x, defender.y, this.ball.x, this.ball.y) < 25) {
              const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
              ballBody.setVelocity(-200 + Math.random() * 100, (Math.random() - 0.5) * 200);
              this.hasBall = false;
            }
          });

          // Goalkeeper AI — moves laterally tracking ball
          const gkBody = this.goalkeeper.body as Phaser.Physics.Arcade.Body;
          const gkMinY = FIELD_HEIGHT / 2 - 50;
          const gkMaxY = FIELD_HEIGHT / 2 + 50;
          if (this.ball.y < this.goalkeeper.y - 5 && this.goalkeeper.y > gkMinY) {
            gkBody.setVelocity(0, -100);
          } else if (this.ball.y > this.goalkeeper.y + 5 && this.goalkeeper.y < gkMaxY) {
            gkBody.setVelocity(0, 100);
          } else {
            gkBody.setVelocity(0, 0);
          }

          // GK block ball
          if (Phaser.Math.Distance.Between(this.goalkeeper.x, this.goalkeeper.y, this.ball.x, this.ball.y) < 30) {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            ballBody.setVelocity(-300 + Math.random() * 100, (Math.random() - 0.5) * 300);
            this.hasBall = false;
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
      <div className="w-full overflow-hidden rounded-xl border border-border shadow-elevated" style={{ maxWidth: 800 }}>
        <div ref={gameRef} className="w-full" />
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>⬆️⬇️⬅️➡️ Move</span>
        <span>SPACE Kick</span>
        <span className="md:hidden">Touch left: joystick | Touch right: kick</span>
      </div>
    </div>
  );
};

export default FootballGame;
