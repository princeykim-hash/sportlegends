import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import XPBar from '@/components/XPBar';
import { BadgeDisplay } from '@/components/BadgeCard';
import { ALL_BADGES, MAX_LEVEL } from '@/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isLoaded, quizAccuracy, earnedBadges } = usePlayerProfile();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl bounce-ball mb-4">⚽</div>
          <p className="text-muted-foreground font-sports">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center">
          <div className="text-5xl mb-4">⚽</div>
          <h2 className="font-sports text-2xl text-foreground mb-3">NO PLAYER FOUND</h2>
          <p className="text-muted-foreground mb-6">Create your player profile to get started</p>
          <button
            onClick={() => navigate('/profile')}
            className="rounded-xl gradient-primary px-6 py-3 font-sports text-primary-foreground"
          >
            CREATE PLAYER
          </button>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: '🧠', label: 'Take a Quiz', desc: 'Test your CBC knowledge', path: '/quiz', color: 'border-blue-500/30 bg-blue-500/10' },
    { icon: '⚽', label: 'Play Football', desc: 'Jump into a match', path: '/game', color: 'border-primary/30 bg-primary/10' },
  ];

  const stats = [
    { label: 'Matches Played', value: profile.matchesPlayed, icon: '🏟️' },
    { label: 'Goals Scored', value: profile.goalsScored, icon: '⚽' },
    { label: 'Questions Answered', value: profile.quizTotal, icon: '📝' },
    { label: 'Quiz Accuracy', value: `${quizAccuracy}%`, icon: '🎯' },
  ];

  const nextUnlock = profile.level < 5 ? `Medium Difficulty at Level 5` : profile.level < 10 ? `Hard Difficulty at Level 10` : 'All difficulties unlocked!';

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-6">
        {/* Player Header */}
        <div className="mb-6 rounded-2xl border border-border gradient-card p-5 shadow-elevated slide-up">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-primary font-sports text-2xl text-primary-foreground shadow-elevated">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-sports text-2xl text-foreground">{profile.name.toUpperCase()}</h1>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-sports text-primary">
                  Grade {profile.grade}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Joined {new Date(profile.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <XPBar xp={profile.xp} level={profile.level} />
            </div>
          </div>

          {/* Next unlock hint */}
          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2">
            <p className="text-xs text-accent">🔓 Next unlock: {nextUnlock}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-border gradient-card p-4 text-center shadow-card"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-sports text-xl text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`rounded-xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-elevated ${action.color}`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-sports text-lg text-foreground">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.desc}</div>
            </button>
          ))}
        </div>

        {/* Badges */}
        <div className="rounded-2xl border border-border gradient-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sports text-xl text-foreground">ACHIEVEMENTS</h2>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-sports text-accent">
              {earnedBadges.length}/{ALL_BADGES.length} Earned
            </span>
          </div>
          <BadgeDisplay earnedIds={profile.badges} small />
        </div>

        {/* Difficulty unlocks */}
        <div className="mt-6 rounded-2xl border border-border gradient-card p-5 shadow-card">
          <h2 className="font-sports text-xl text-foreground mb-4">CAREER PROGRESS</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { level: 1, diff: 'easy', label: '⚽ Easy Mode', desc: '2 defenders, slow pace', color: 'border-green-500/30 bg-green-500/10' },
              { level: 5, diff: 'medium', label: '🔥 Medium Mode', desc: '3 defenders, normal pace', color: 'border-yellow-500/30 bg-yellow-500/10' },
              { level: 10, diff: 'hard', label: '💀 Hard Mode', desc: '4 defenders, fast pace', color: 'border-red-500/30 bg-red-500/10' },
            ].map(d => {
              const unlocked = profile.unlockedDifficulties.includes(d.diff as 'easy' | 'medium' | 'hard');
              return (
                <div key={d.diff} className={`rounded-xl border p-3 ${unlocked ? d.color : 'border-border bg-muted/30 opacity-50'}`}>
                  <div className="font-sports text-sm text-foreground">{d.label}</div>
                  <div className="text-xs text-muted-foreground">{d.desc}</div>
                  {!unlocked && <div className="mt-1 text-xs text-accent">🔒 Reach Level {d.level}</div>}
                  {unlocked && <div className="mt-1 text-xs text-primary">✓ Unlocked</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
