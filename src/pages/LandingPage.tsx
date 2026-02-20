import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroField from '@/assets/hero-field.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '🧠', title: 'CBC Curriculum', desc: 'Aligned with Kenya\'s competency-based curriculum for grades 4-9' },
    { icon: '⚽', title: '2D Football Game', desc: 'Play interactive top-down football with AI defenders' },
    { icon: '📝', title: 'Quiz Engine', desc: '30+ questions on rules, tactics, sportsmanship & safety' },
    { icon: '🏆', title: 'Career Mode', desc: 'Level up, earn badges, unlock stadiums and harder opponents' },
  ];

  const grades = ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroField})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

        <div className="relative container mx-auto px-4 py-20 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <span className="text-sm font-sports text-primary">🇰🇪 Kenya CBC Curriculum</span>
          </div>

          {/* Title */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl bounce-ball">⚽</span>
            <div>
              <h1 className="font-sports text-4xl sm:text-5xl md:text-6xl text-foreground leading-none">
                CBC FOOTBALL
              </h1>
              <h1 className="font-sports text-4xl sm:text-5xl md:text-6xl text-primary leading-none">
                CAREER ACADEMY
              </h1>
            </div>
          </div>

          <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground md:text-lg">
            Learn football the CBC way. Play, quiz, and level up through Kenya's Physical & Health Education curriculum for Grades 4–9.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-xl gradient-primary px-8 py-4 font-sports text-lg text-primary-foreground shadow-elevated glow-green transition-transform hover:scale-105 pulse-green"
            >
              ⚽ START YOUR CAREER
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border border-border bg-card px-8 py-4 font-sports text-lg text-foreground transition-colors hover:border-primary/50"
            >
              📊 CONTINUE PLAYING
            </button>
          </div>

          {/* Grade badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {grades.map(g => (
              <span key={g} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-8 text-center font-sports text-2xl text-foreground md:text-3xl">
          WHAT YOU'LL LEARN & DO
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-border gradient-card p-5 shadow-card transition-transform hover:-translate-y-1 slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-1 font-sports text-base text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border border-border gradient-card p-6">
          {[
            { value: '30+', label: 'CBC Quiz Questions' },
            { value: '6', label: 'Grade Levels' },
            { value: '6', label: 'Achievement Badges' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-sports text-3xl text-primary md:text-4xl">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Curriculum alignment */}
        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/10 p-6">
          <h3 className="mb-3 font-sports text-xl text-primary">📚 CBC Curriculum Alignment</h3>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-sm text-muted-foreground">
            {[
              '✅ Rules of Football',
              '✅ Teamwork & Sportsmanship',
              '✅ Player Positions & Roles',
              '✅ Safety in Sports',
              '✅ Basic Tactics & Strategy',
              '✅ Physical Health Education',
            ].map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        CBC Football Career Academy — Aligned with Kenya's Physical & Health Education Curriculum
      </footer>
    </div>
  );
};

export default LandingPage;
