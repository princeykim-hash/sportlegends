export interface PlayerProfile {
  name: string;
  grade: number; // 4–9
  avatar: string; // emoji avatar
  level: number;
  xp: number;
  matchesPlayed: number;
  goalsScored: number;
  quizCorrect: number;
  quizTotal: number;
  badges: string[];
  unlockedDifficulties: ('easy' | 'medium' | 'hard')[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  competencyArea: 'rules' | 'teamwork' | 'positions' | 'safety' | 'tactics';
  learningOutcome: string;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
  xpReward: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameResult {
  playerGoals: number;
  opponentGoals: number;
  xpEarned: number;
  duration: number;
}

export interface LeaderboardEntry {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  grade: number;
  badges: number;
  matchesPlayed: number;
}

export const XP_PER_LEVEL = 150;
export const MAX_LEVEL = 30;

export function getLevelFromXP(xp: number): number {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
}

export function getXPForCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function getXPForNextLevel(): number {
  return XP_PER_LEVEL;
}

export function getXPProgress(xp: number): number {
  return (getXPForCurrentLevel(xp) / XP_PER_LEVEL) * 100;
}

export const LEVEL_REWARDS: Record<number, string> = {
  3: '🔓 Unlocks Medium Difficulty',
  5: '🎯 Unlocks Hard Difficulty',
  7: '⚡ +25% XP Bonus per goal',
  10: '🌟 Legendary Player Title',
  15: '👑 Elite Defender AI unlocked',
  20: '💎 Diamond Badge unlocked',
  25: '🔥 Inferno Mode unlocked',
  30: '🏆 GOAT Status — Max Level!',
};

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_kick',
    name: 'First Kick',
    description: 'Play your very first match',
    icon: '👟',
    requirement: 'Play 1 match',
    color: 'from-green-400 to-green-600',
    rarity: 'common',
  },
  {
    id: 'passing_pro',
    name: 'Passing Pro',
    description: 'Score 3+ goals in a single match',
    icon: '🎯',
    requirement: 'Score 3+ goals in a match',
    color: 'from-blue-500 to-blue-700',
    rarity: 'common',
  },
  {
    id: 'defensive_wall',
    name: 'Defensive Wall',
    description: 'Win a match without conceding a goal',
    icon: '🛡️',
    requirement: 'Win 1-0 or more',
    color: 'from-gray-500 to-gray-700',
    rarity: 'rare',
  },
  {
    id: 'goal_machine',
    name: 'Goal Machine',
    description: 'Score 10 total goals across all matches',
    icon: '⚽',
    requirement: 'Score 10 total goals',
    color: 'from-yellow-500 to-orange-600',
    rarity: 'common',
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick Hero',
    description: 'Score 3 goals in one match',
    icon: '🎩',
    requirement: 'Score 3 goals in one match',
    color: 'from-red-500 to-red-700',
    rarity: 'rare',
  },
  {
    id: 'fair_play_star',
    name: 'Fair Play Star',
    description: 'Complete a quiz session with 100% accuracy (5+ questions)',
    icon: '⭐',
    requirement: 'Get 100% quiz accuracy (5+ questions)',
    color: 'from-yellow-400 to-yellow-600',
    rarity: 'rare',
  },
  {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Answer 50 quiz questions correctly',
    icon: '🧠',
    requirement: 'Answer 50 questions correctly',
    color: 'from-purple-500 to-purple-700',
    rarity: 'epic',
  },
  {
    id: 'century_scorer',
    name: 'Century Scorer',
    description: 'Score 100 total goals',
    icon: '💯',
    requirement: 'Score 100 total goals',
    color: 'from-orange-400 to-red-600',
    rarity: 'epic',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 25 matches',
    icon: '🎖️',
    requirement: 'Play 25 matches',
    color: 'from-amber-600 to-amber-800',
    rarity: 'rare',
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach Level 10',
    icon: '🌟',
    requirement: 'Reach Level 10',
    color: 'from-cyan-400 to-blue-600',
    rarity: 'epic',
  },
  {
    id: 'level_20',
    name: 'Elite Player',
    description: 'Reach Level 20',
    icon: '💎',
    requirement: 'Reach Level 20',
    color: 'from-violet-500 to-purple-800',
    rarity: 'epic',
  },
  {
    id: 'level_30',
    name: 'GOAT',
    description: 'Reach the maximum Level 30',
    icon: '🐐',
    requirement: 'Reach Level 30',
    color: 'from-yellow-300 to-orange-500',
    rarity: 'legendary',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Answer 100 questions correctly',
    icon: '🎓',
    requirement: 'Answer 100 questions correctly',
    color: 'from-indigo-500 to-indigo-800',
    rarity: 'legendary',
  },
  {
    id: 'hard_mode',
    name: 'Fearless',
    description: 'Win a match on Hard difficulty',
    icon: '💀',
    requirement: 'Win on Hard mode',
    color: 'from-red-700 to-red-900',
    rarity: 'epic',
  },
  {
    id: 'clean_sheet_5',
    name: 'Iron Curtain',
    description: 'Win 5 matches without conceding',
    icon: '🧱',
    requirement: 'Win 5 clean sheets',
    color: 'from-slate-500 to-slate-800',
    rarity: 'legendary',
  },
];
