import React from 'react';
import { getXPProgress, getXPForCurrentLevel, XP_PER_LEVEL } from '@/types';

interface XPBarProps {
  xp: number;
  level: number;
  showDetails?: boolean;
  compact?: boolean;
}

const XPBar: React.FC<XPBarProps> = ({ xp, level, showDetails = true, compact = false }) => {
  const progress = getXPProgress(xp);
  const currentLevelXP = getXPForCurrentLevel(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-sports text-xs text-accent">LVL {level}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="xp-bar-fill h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{currentLevelXP}/{XP_PER_LEVEL}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-sports text-base text-accent">LEVEL {level}</span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
              {xp} Total XP
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentLevelXP} / {XP_PER_LEVEL} XP
          </span>
        </div>
      )}
      <div className="relative h-4 overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className="xp-bar-fill h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-sports text-xs text-pitch-dark drop-shadow-sm">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default XPBar;
