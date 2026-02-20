import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  playerName?: string;
  level?: number;
}

const Navbar: React.FC<NavbarProps> = ({ playerName, level }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/quiz', label: 'Quiz', icon: '🧠' },
    { path: '/game', label: 'Play', icon: '⚽' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">⚽</span>
          <span className="font-sports text-lg text-primary">CBC Football</span>
        </button>

        {playerName && (
          <div className="hidden items-center gap-6 md:flex">
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

        {playerName && (
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end md:flex">
              <span className="font-sports text-sm text-foreground">{playerName}</span>
              <span className="text-xs text-accent">Level {level}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary font-sports text-sm text-primary-foreground">
              {playerName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
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
                  ? 'text-primary'
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
