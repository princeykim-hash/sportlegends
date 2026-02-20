import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import QuizComponent from '@/components/QuizComponent';
import { getRandomQuestions, COMPETENCY_LABELS } from '@/data/quizQuestions';
import { QuizQuestion as QType } from '@/types';

type CompetencyArea = QType['competencyArea'];

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, recordQuizAnswer, addXP } = usePlayerProfile();
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<CompetencyArea | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QType[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number; xpEarned: number } | null>(null);

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

  const topics: { value: CompetencyArea | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Topics', icon: '📚' },
    { value: 'rules', label: 'Rules', icon: '📋' },
    { value: 'teamwork', label: 'Teamwork', icon: '🤝' },
    { value: 'positions', label: 'Positions', icon: '🗺️' },
    { value: 'safety', label: 'Safety', icon: '🛡️' },
    { value: 'tactics', label: 'Tactics', icon: '🎯' },
  ];

  const handleStart = () => {
    const qs = getRandomQuestions(questionCount, selectedTopic === 'all' ? undefined : selectedTopic);
    setQuestions(qs);
    setQuizStarted(true);
    setQuizComplete(false);
    setResults(null);
  };

  const handleAnswerRecorded = (correct: boolean) => {
    recordQuizAnswer(correct);
  };

  const handleComplete = (correct: number, total: number, xpEarned: number) => {
    setResults({ correct, total, xpEarned });
    setQuizComplete(true);
    if (xpEarned > 0) addXP(xpEarned);
  };

  if (quizStarted && !quizComplete) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto max-w-xl px-4 py-6">
          <button
            onClick={() => setQuizStarted(false)}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground font-sports"
          >
            ← EXIT QUIZ
          </button>
          <QuizComponent
            questions={questions}
            onComplete={handleComplete}
            onAnswerRecorded={handleAnswerRecorded}
          />
        </div>
      </div>
    );
  }

  if (quizComplete && results) {
    const pct = Math.round((results.correct / results.total) * 100);
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto max-w-lg px-4 py-10">
          <div className="rounded-2xl border border-border gradient-card p-8 text-center shadow-elevated slide-up">
            <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '⚽' : '📚'}</div>
            <h2 className="font-sports text-3xl text-foreground mb-2">QUIZ COMPLETE!</h2>
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="font-sports text-2xl text-primary">{results.correct}/{results.total}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="font-sports text-2xl text-accent">{pct}%</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="font-sports text-2xl text-green-400">+{results.xpEarned}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleStart} className="w-full rounded-xl gradient-primary py-3 font-sports text-primary-foreground">
                🔄 PLAY AGAIN
              </button>
              <button onClick={() => { setQuizStarted(false); setQuizComplete(false); }} className="w-full rounded-xl border border-border py-3 font-sports text-muted-foreground">
                CHANGE TOPIC
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl border border-border py-3 font-sports text-muted-foreground">
                📊 DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-4xl block mb-2">🧠</span>
          <h1 className="font-sports text-3xl text-foreground">CBC QUIZ CHALLENGE</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile.quizTotal > 0 ? `${profile.quizTotal} questions answered • ${Math.round((profile.quizCorrect / profile.quizTotal) * 100)}% accuracy` : 'Test your football knowledge!'}
          </p>
        </div>

        <div className="rounded-2xl border border-border gradient-card p-5 shadow-elevated space-y-5">
          {/* Topic selection */}
          <div>
            <label className="block font-sports text-sm text-muted-foreground mb-3">SELECT TOPIC</label>
            <div className="grid grid-cols-3 gap-2">
              {topics.map(t => (
                <button
                  key={t.value}
                  onClick={() => setSelectedTopic(t.value)}
                  className={`rounded-xl border p-2.5 text-center transition-all ${
                    selectedTopic === t.value
                      ? 'border-primary bg-primary/20 glow-green'
                      : 'border-border bg-muted/50 hover:border-primary/30'
                  }`}
                >
                  <div className="text-xl mb-0.5">{t.icon}</div>
                  <div className={`font-sports text-xs ${selectedTopic === t.value ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div>
            <label className="block font-sports text-sm text-muted-foreground mb-3">
              NUMBER OF QUESTIONS: <span className="text-foreground">{questionCount}</span>
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 rounded-lg border py-2 font-sports text-sm transition-all ${
                    questionCount === n
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* XP preview */}
          <div className="rounded-xl border border-accent/20 bg-accent/10 p-3">
            <p className="text-xs text-accent font-sports">
              💰 Earn up to {questionCount * 30} XP for correct answers
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full rounded-xl gradient-primary py-4 font-sports text-lg text-primary-foreground transition-opacity hover:opacity-90 pulse-green"
          >
            🚀 START QUIZ
          </button>
        </div>

        {/* CBC Topic Overview */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <h3 className="font-sports text-sm text-muted-foreground mb-3">CBC LEARNING AREAS</h3>
          <div className="space-y-2">
            {(Object.entries(COMPETENCY_LABELS) as [CompetencyArea, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{label}</span>
                <button
                  onClick={() => { setSelectedTopic(key); handleStart(); }}
                  className="text-xs text-primary font-sports hover:underline"
                >
                  PRACTICE →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
