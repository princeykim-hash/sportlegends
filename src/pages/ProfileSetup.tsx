import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { createProfile } = usePlayerProfile();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(6);
  const [step, setStep] = useState<'name' | 'grade' | 'done'>('name');
  const [error, setError] = useState('');

  const handleNameNext = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter at least 2 characters for your name');
      return;
    }
    setError('');
    setStep('grade');
  };

  const handleCreate = () => {
    createProfile(name.trim(), grade);
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

  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center slide-up">
          <div className="text-6xl mb-4 bounce-ball">⚽</div>
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
          <span className="text-5xl bounce-ball block mb-4">⚽</span>
          <h1 className="font-sports text-3xl text-foreground">CREATE YOUR PLAYER</h1>
          <p className="mt-1 text-muted-foreground">Set up your CBC Football Career profile</p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-2">
          {['name', 'grade'].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                (s === 'name' && (step === 'name' || step === 'grade')) || (s === 'grade' && step === 'grade')
                  ? 'gradient-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border gradient-card p-6 shadow-elevated">
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
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 font-sports text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
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
                    Questions will be tailored to your level
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('name')}
                  className="flex-1 rounded-xl border border-border py-3 font-sports text-sm text-muted-foreground hover:text-foreground"
                >
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
