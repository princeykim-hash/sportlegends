import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import FootballGame from '@/components/FootballGame';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, recordMatch } = usePlayerProfile();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [playerGoals, setPlayerGoals] = useState(0);
  const [opponentGoals, setOpponentGoals] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Create a player profile first</p>
          <button onClick={() => navigate('/profile')} className="rounded-xl gradient-primary px-6 py-3 font-sports text-primary-foreground">
            CREATE PLAYER
          </button>
        </div>
      </div>
    );
  }

  const handleGoalScored = (pg: number, og: number) => {
    setPlayerGoals(pg);
    setOpponentGoals(og);
  };

  const handleGameEnd = (pg: number, og: number) => {
    setPlayerGoals(pg);
    setOpponentGoals(og);
    setGameOver(true);
    // XP: 40 per goal, +150 bonus for win, +60 for draw, +20 for loss. Hard mode multiplier.
    const diffMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
    const baseXP = pg * 40 + (pg > og ? 150 : pg === og ? 60 : 20);
    const xpEarned = Math.round(baseXP * diffMultiplier);
    recordMatch(pg, og, xpEarned, difficulty);
  };

  if (gameOver) {
    const won = playerGoals > opponentGoals;
    const drew = playerGoals === opponentGoals;
    const diffMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
    const baseXP = playerGoals * 40 + (won ? 150 : drew ? 60 : 20);
    const xpEarned = Math.round(baseXP * diffMultiplier);

    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border gradient-card p-8 text-center shadow-elevated slide-up">
          <div className="text-6xl mb-3">{won ? '🏆' : drew ? '🤝' : '😤'}</div>
          <h2 className="font-sports text-3xl text-foreground mb-1">
            {won ? 'VICTORY!' : drew ? 'DRAW!' : 'DEFEAT!'}
          </h2>
          <p className="text-xs text-muted-foreground mb-4 font-sports capitalize">{difficulty} mode</p>

          <div className="my-5 flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="font-sports text-5xl text-primary">{playerGoals}</div>
              <div className="text-xs text-muted-foreground">You</div>
            </div>
            <div className="font-sports text-2xl text-muted-foreground">:</div>
            <div className="text-center">
              <div className="font-sports text-5xl text-destructive">{opponentGoals}</div>
              <div className="text-xs text-muted-foreground">Opponent</div>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-accent/30 bg-accent/10 p-3">
            <p className="font-sports text-lg text-accent">+{xpEarned} XP Earned!</p>
            {difficulty !== 'easy' && (
              <p className="text-xs text-muted-foreground mt-0.5">{difficulty === 'hard' ? '1.5×' : '1.2×'} difficulty bonus applied</p>
            )}
          </div>

          {won && playerGoals >= 3 && (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-2">
              <p className="text-xs text-primary">🎩 Hat Trick Hero badge unlocked!</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setGameOver(false); setGameStarted(false); setPlayerGoals(0); setOpponentGoals(0); }}
              className="w-full rounded-xl gradient-primary py-3 font-sports text-primary-foreground"
            >
              🔄 PLAY AGAIN
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl border border-border py-3 font-sports text-muted-foreground hover:text-foreground">
              📊 DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => { setGameStarted(false); setPlayerGoals(0); setOpponentGoals(0); }}
              className="rounded-lg border border-border px-3 py-1.5 font-sports text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              ← EXIT
            </button>
            <div className="flex items-center gap-4">
              <span className="font-sports text-primary text-lg">YOU: {playerGoals}</span>
              <span className="font-sports text-muted-foreground">VS</span>
              <span className="font-sports text-destructive text-lg">OPP: {opponentGoals}</span>
            </div>
            <span className="rounded-full border border-border px-3 py-1 font-sports text-xs text-muted-foreground capitalize">{difficulty}</span>
          </div>
          <FootballGame
            difficulty={difficulty}
            onGoalScored={handleGoalScored}
            onGameEnd={handleGameEnd}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 text-center">
          <span className="text-5xl block mb-2 bounce-ball">⚽</span>
          <h1 className="font-sports text-3xl text-foreground">FOOTBALL MATCH</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose difficulty and kick off!</p>
        </div>

        <div className="rounded-2xl border border-border gradient-card p-5 shadow-elevated space-y-5">
          <div>
            <label className="block font-sports text-sm text-muted-foreground mb-3">SELECT DIFFICULTY</label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { key: 'easy', label: '⚽ Easy', desc: '2 defenders', xpNote: '1× XP', level: 1 },
                { key: 'medium', label: '🔥 Medium', desc: '3 defenders', xpNote: '1.2× XP', level: 3 },
                { key: 'hard', label: '💀 Hard', desc: '4 defenders', xpNote: '1.5× XP', level: 5 },
              ] as const).map(d => {
                const unlocked = profile.unlockedDifficulties.includes(d.key);
                return (
                  <button
                    key={d.key}
                    onClick={() => unlocked && setDifficulty(d.key)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      !unlocked ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                      : difficulty === d.key ? 'border-primary bg-primary/20 glow-green'
                      : 'border-border bg-muted/50 hover:border-primary/30 cursor-pointer'
                    }`}
                  >
                    <div className="font-sports text-sm text-foreground">{d.label}</div>
                    <div className="text-xs text-muted-foreground">{d.desc}</div>
                    <div className={`text-xs mt-0.5 ${unlocked ? 'text-accent' : 'text-muted-foreground'}`}>
                      {unlocked ? d.xpNote : `🔒 Lv.${d.level}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* XP Preview */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1.5">
            <p className="font-sports text-foreground text-xs mb-2">XP REWARDS:</p>
            <p>⚽ <span className="text-foreground">40 XP</span> per goal</p>
            <p>🏆 <span className="text-foreground">+150 XP</span> for winning</p>
            <p>🤝 <span className="text-foreground">+60 XP</span> for a draw</p>
            <p>💀 <span className="text-foreground">Hard mode:</span> 1.5× all XP</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
            <p>⬆️⬇️⬅️➡️ Arrow keys to move</p>
            <p>⎵ Spacebar to kick</p>
            <p>📱 Mobile: Left joystick to move, tap right side to kick</p>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="w-full rounded-xl gradient-primary py-4 font-sports text-lg text-primary-foreground transition-opacity hover:opacity-90 pulse-green"
          >
            ⚽ KICK OFF!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
