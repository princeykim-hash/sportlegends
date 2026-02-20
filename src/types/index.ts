export interface PlayerProfile {
  name: string;
  grade: number; // 4–9
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
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  color: string;
}

export interface GameResult {
  playerGoals: number;
  opponentGoals: number;
  xpEarned: number;
  duration: number;
}

export const XP_PER_LEVEL = 200;
export const MAX_LEVEL = 20;

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

export const ALL_BADGES: Badge[] = [
  {
    id: 'passing_pro',
    name: 'Passing Pro',
    description: 'Complete 5 successful passes in a match',
    icon: '🎯',
    requirement: 'Score 3+ goals in a match',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'defensive_wall',
    name: 'Defensive Wall',
    description: 'Win a match without conceding',
    icon: '🛡️',
    requirement: 'Win a match 1-0 or more',
    color: 'from-gray-500 to-gray-700',
  },
  {
    id: 'goal_machine',
    name: 'Goal Machine',
    description: 'Score 10 total goals',
    icon: '⚽',
    requirement: 'Score 10 total goals',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'fair_play_star',
    name: 'Fair Play Star',
    description: 'Complete a quiz with 100% accuracy',
    icon: '⭐',
    requirement: 'Get 100% quiz accuracy',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Answer 50 questions correctly',
    icon: '🧠',
    requirement: 'Answer 50 questions correctly',
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick Hero',
    description: 'Score 3 goals in one match',
    icon: '🎩',
    requirement: 'Score 3 goals in one match',
    color: 'from-red-500 to-red-700',
  },
];
