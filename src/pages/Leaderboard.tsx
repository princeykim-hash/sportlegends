import React from 'react';
import { LeaderboardEntry } from '@/types';

const LEADERBOARD_KEY = 'cbc_football_leaderboard';

const Leaderboard: React.FC = () => {
  const raw = localStorage.getItem(LEADERBOARD_KEY);
  const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];

  const getRankStyle = (i: number) => {
    if (i === 0) return 'from-yellow-400 to-yellow-600 text-yellow-900';
    if (i === 1) return 'from-gray-300 to-gray-500 text-gray-800';
    if (i === 2) return 'from-amber-600 to-amber-800 text-amber-100';
    return 'from-muted to-muted text-muted-foreground';
  };

  const getRankIcon = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 text-center slide-up">
          <h1 className="font-sports text-4xl text-foreground">🏆 LEADERBOARD</h1>
          <p className="mt-1 text-muted-foreground">Top players in CBC Football Career Academy</p>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-border gradient-card p-10 text-center shadow-elevated">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="font-sports text-xl text-foreground mb-2">NO PLAYERS YET</h2>
            <p className="text-muted-foreground text-sm">Play matches and answer quizzes to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-border gradient-card p-4 shadow-card slide-up flex items-center gap-4 ${i < 3 ? 'border-yellow-500/30' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Rank */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-sports text-lg ${getRankStyle(i)}`}>
                  {getRankIcon(i)}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-2xl">
                    {entry.avatar || '⚽'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-sports text-base text-foreground truncate">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">Grade {entry.grade} • {entry.matchesPlayed} matches</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-right shrink-0">
                  <div>
                    <div className="font-sports text-sm text-accent">Lvl {entry.level}</div>
                    <div className="text-xs text-muted-foreground">{entry.badges} badges</div>
                  </div>
                  <div>
                    <div className="font-sports text-base text-primary">{entry.xp.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>

                {/* Mobile XP only */}
                <div className="flex sm:hidden flex-col items-end shrink-0">
                  <div className="font-sports text-sm text-primary">{entry.xp.toLocaleString()} XP</div>
                  <div className="text-xs text-muted-foreground">Lv.{entry.level}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <div className="mt-6 rounded-xl border border-border gradient-card p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Leaderboard updates as you play matches and complete quizzes. Earn XP to climb the ranks! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
