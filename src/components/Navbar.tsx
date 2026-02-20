import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  playerName?: string;
  level?: number;
  avatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ playerName, level, avatar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/quiz', label: 'Quiz', icon: '🧠' },
    { path: '/game', label: 'Play', icon: '⚽' },
    { path: '/leaderboard', label: 'Ranks', icon: '🏆' },
  ];

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('cbc_theme', isDark ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md shadow-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">⚽</span>
          <span className="font-sports text-lg text-primary hidden sm:block">CBC Football</span>
        </button>

        {playerName && (
          <div className="hidden items-center gap-5 md:flex">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 font-sports text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted hover:bg-muted/70 transition-colors"
            title="Toggle dark/light mode"
          >
            <span className="text-base">🌙</span>
          </button>

          {playerName && (
            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end md:flex">
                <span className="font-sports text-sm text-foreground">{playerName}</span>
                <span className="text-xs text-accent">Level {level}</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-lg hover:bg-primary/20 transition-colors"
              >
                {avatar || playerName.charAt(0).toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {playerName && (
        <div className="flex border-t border-border md:hidden">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-sports transition-colors ${
                location.pathname === item.path
                  ? 'text-primary border-t-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
