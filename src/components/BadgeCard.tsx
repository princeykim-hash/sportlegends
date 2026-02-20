import React from 'react';
import { Badge, ALL_BADGES } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  small?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, earned, small = false }) => {
  if (small) {
    return (
      <div
        className={`relative flex flex-col items-center gap-1 ${!earned ? 'badge-locked' : ''}`}
        title={earned ? badge.name : `Locked: ${badge.requirement}`}
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
          earned ? 'border-accent bg-gradient-to-br ' + badge.color + ' shadow-elevated glow-gold' : 'border-border bg-muted'
        }`}>
          <span className="text-xl">{badge.icon}</span>
        </div>
        <span className="max-w-[56px] text-center text-[10px] font-sports leading-tight text-muted-foreground">
          {badge.name.split(' ').slice(0, 2).join(' ')}
        </span>
        {!earned && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted">
            <span className="text-[8px]">🔒</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      earned
        ? 'border-accent/30 gradient-card glow-gold'
        : 'border-border bg-card opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${
          earned
            ? 'border-accent/50 bg-gradient-to-br ' + badge.color
            : 'border-border bg-muted'
        }`}>
          <span className="text-2xl">{badge.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sports text-base text-foreground">{badge.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{badge.description}</p>
          {!earned && (
            <p className="mt-1 text-xs text-accent/70">
              🔒 {badge.requirement}
            </p>
          )}
          {earned && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-sports text-accent">
              ✓ Earned
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface BadgeDisplayProps {
  earnedIds: string[];
  small?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ earnedIds, small = false }) => {
  return (
    <div className={`flex flex-wrap gap-3 ${small ? '' : 'gap-4'}`}>
      {ALL_BADGES.map(badge => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          earned={earnedIds.includes(badge.id)}
          small={small}
        />
      ))}
    </div>
  );
};

export default BadgeCard;
