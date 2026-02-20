import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';

const AVATARS = [
  '⚽', '🦁', '🐆', '🦅', '🐘', '🦊', '🐯', '🦓',
  '🏆', '⭐', '🔥', '💎', '🎯', '👑', '🚀', '🌟',
  '🦁', '🥷', '🧙', '⚡', '🏅', '🎖️', '🛡️', '🎩',
];

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { createProfile } = usePlayerProfile();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(6);
  const [avatar, setAvatar] = useState('⚽');
  const [step, setStep] = useState<'name' | 'avatar' | 'grade' | 'done'>('name');
  const [error, setError] = useState('');

  const handleNameNext = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter at least 2 characters for your name');
      return;
    }
    setError('');
    setStep('avatar');
  };

  const handleCreate = () => {
    createProfile(name.trim(), grade, avatar);
    setStep('done');
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const grades = [4, 5, 6, 7, 8, 9];
  const gradeLabels: Record<number, string> = {
    4: 'Upper Primary • Grade 4',
    5: 'Upper Primary • Grade 5',
    6: 'Upper Primary • Grade 6',
    7: 'Junior Secondary • Grade 7',
    8: 'Junior Secondary • Grade 8',
    9: 'Junior Secondary • Grade 9',
  };

  const steps = ['name', 'avatar', 'grade'];

  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center slide-up">
          <div className="text-6xl mb-4" style={{ animation: 'bounce-ball 1s ease-in-out infinite alternate' }}>{avatar}</div>
          <h2 className="font-sports text-3xl text-foreground mb-2">WELCOME, {name.toUpperCase()}!</h2>
          <p className="text-muted-foreground">Loading your career dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-5xl bounce-ball block mb-4">{avatar}</span>
          <h1 className="font-sports text-3xl text-foreground">CREATE YOUR PLAYER</h1>
          <p className="mt-1 text-muted-foreground">Set up your CBC Football Career profile</p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                steps.indexOf(step) >= i ? 'gradient-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border gradient-card p-6 shadow-elevated">
          {/* Step 1: Name */}
          {step === 'name' && (
            <div className="space-y-4 slide-up">
              <div>
                <label className="mb-2 block font-sports text-sm text-muted-foreground">
                  PLAYER NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-sports text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
              <button
                onClick={handleNameNext}
                className="w-full rounded-xl gradient-primary py-3 font-sports text-primary-foreground transition-opacity hover:opacity-90"
              >
                NEXT →
              </button>
            </div>
          )}

          {/* Step 2: Avatar */}
          {step === 'avatar' && (
            <div className="space-y-4 slide-up">
              <label className="block font-sports text-sm text-muted-foreground mb-3">
                CHOOSE YOUR AVATAR
              </label>
              <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-1">
                {AVATARS.map((em, i) => (
                  <button
                    key={i}
                    onClick={() => setAvatar(em)}
                    className={`aspect-square rounded-xl border text-2xl flex items-center justify-center transition-all hover:scale-110 ${
                      avatar === em
                        ? 'border-primary bg-primary/20 glow-green scale-110'
                        : 'border-border bg-muted/50 hover:border-primary/40'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <p className="font-sports text-sm text-primary">Selected Avatar</p>
                  <p className="text-xs text-muted-foreground">This will represent you on the pitch!</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('name')} className="flex-1 rounded-xl border border-border py-3 font-sports text-sm text-muted-foreground hover:text-foreground">
                  ← BACK
                </button>
                <button onClick={() => setStep('grade')} className="flex-[2] rounded-xl gradient-primary py-3 font-sports text-primary-foreground transition-opacity hover:opacity-90">
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Grade */}
          {step === 'grade' && (
            <div className="space-y-4 slide-up">
              <div>
                <label className="mb-3 block font-sports text-sm text-muted-foreground">
                  SELECT YOUR GRADE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        grade === g
                          ? 'border-primary bg-primary/20 glow-green'
                          : 'border-border bg-muted/50 hover:border-primary/30'
                      }`}
                    >
                      <div className={`font-sports text-lg ${grade === g ? 'text-primary' : 'text-foreground'}`}>
                        Grade {g}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {g <= 6 ? 'Upper Primary' : 'Junior Secondary'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {grade > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                  <p className="text-xs text-primary">📚 {gradeLabels[grade]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Questions tailored to your CBC level
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('avatar')} className="flex-1 rounded-xl border border-border py-3 font-sports text-sm text-muted-foreground hover:text-foreground">
                  ← BACK
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-[2] rounded-xl gradient-primary py-3 font-sports text-primary-foreground transition-opacity hover:opacity-90 pulse-green"
                >
                  🚀 CREATE PLAYER
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
