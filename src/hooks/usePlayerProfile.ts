import { useState, useEffect, useCallback } from 'react';
import { PlayerProfile, ALL_BADGES, getLevelFromXP } from '@/types';

const STORAGE_KEY = 'cbc_football_player';
const LEADERBOARD_KEY = 'cbc_football_leaderboard';

const DEFAULT_PROFILE: PlayerProfile = {
  name: '',
  grade: 6,
  avatar: '⚽',
  level: 1,
  xp: 0,
  matchesPlayed: 0,
  goalsScored: 0,
  quizCorrect: 0,
  quizTotal: 0,
  badges: [],
  unlockedDifficulties: ['easy'],
  createdAt: new Date().toISOString(),
};

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old profiles without avatar
        if (!parsed.avatar) parsed.avatar = '⚽';
        setProfile(parsed);
      } catch {
        setProfile(null);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateLeaderboard = useCallback((p: PlayerProfile) => {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      const board = raw ? JSON.parse(raw) : [];
      const idx = board.findIndex((e: { name: string }) => e.name === p.name);
      const entry = {
        name: p.name,
        avatar: p.avatar,
        level: p.level,
        xp: p.xp,
        grade: p.grade,
        badges: p.badges.length,
        matchesPlayed: p.matchesPlayed,
      };
      if (idx >= 0) {
        board[idx] = entry;
      } else {
        board.push(entry);
      }
      board.sort((a: { xp: number }, b: { xp: number }) => b.xp - a.xp);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 20)));
    } catch {
      // silent fail
    }
  }, []);

  const saveProfile = useCallback((p: PlayerProfile) => {
    const newLevel = getLevelFromXP(p.xp);
    const updated = { ...p, level: newLevel };

    // Unlock difficulties based on level
    if (newLevel >= 3 && !updated.unlockedDifficulties.includes('medium')) {
      updated.unlockedDifficulties = [...updated.unlockedDifficulties, 'medium'];
    }
    if (newLevel >= 5 && !updated.unlockedDifficulties.includes('hard')) {
      updated.unlockedDifficulties = [...updated.unlockedDifficulties, 'hard'];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfile(updated);
    updateLeaderboard(updated);
    return updated;
  }, [updateLeaderboard]);

  const createProfile = useCallback((name: string, grade: number, avatar: string) => {
    const newProfile: PlayerProfile = {
      ...DEFAULT_PROFILE,
      name,
      grade,
      avatar: avatar || '⚽',
      createdAt: new Date().toISOString(),
    };
    return saveProfile(newProfile);
  }, [saveProfile]);

  const addXP = useCallback((amount: number) => {
    if (!profile) return;
    const updated = { ...profile, xp: profile.xp + amount };
    checkAndAwardBadges(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const recordGoal = useCallback(() => {
    if (!profile) return;
    const updated = { ...profile, goalsScored: profile.goalsScored + 1 };
    checkAndAwardBadges(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const recordMatch = useCallback((playerGoals: number, opponentGoals: number, xpEarned: number, difficulty?: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      matchesPlayed: profile.matchesPlayed + 1,
      goalsScored: profile.goalsScored + playerGoals,
      xp: profile.xp + xpEarned,
    };
    checkAndAwardBadges(updated, { playerGoals, opponentGoals, difficulty });
    saveProfile(updated);
  }, [profile, saveProfile]);

  const recordQuizAnswer = useCallback((correct: boolean) => {
    if (!profile) return;
    const updated = {
      ...profile,
      quizTotal: profile.quizTotal + 1,
      quizCorrect: profile.quizCorrect + (correct ? 1 : 0),
      xp: profile.xp + (correct ? 30 : 0),
    };
    checkAndAwardBadges(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const checkAndAwardBadges = (
    p: PlayerProfile,
    matchContext?: { playerGoals: number; opponentGoals: number; difficulty?: string }
  ) => {
    const newBadges = [...p.badges];
    const add = (id: string) => { if (!newBadges.includes(id)) newBadges.push(id); };

    // First match
    if (p.matchesPlayed >= 1) add('first_kick');
    // Goals
    if (p.goalsScored >= 10) add('goal_machine');
    if (p.goalsScored >= 100) add('century_scorer');
    // Quiz
    if (p.quizCorrect >= 50) add('quiz_champion');
    if (p.quizCorrect >= 100) add('quiz_master');
    // 100% quiz accuracy session
    if (p.quizTotal >= 5 && p.quizCorrect === p.quizTotal) add('fair_play_star');
    // Veteran
    if (p.matchesPlayed >= 25) add('veteran');
    // Level achievements
    if (p.level >= 10) add('level_10');
    if (p.level >= 20) add('level_20');
    if (p.level >= 30) add('level_30');

    // Match-context badges
    if (matchContext) {
      const { playerGoals, opponentGoals, difficulty } = matchContext;
      if (playerGoals >= 3) add('hat_trick');
      if (playerGoals >= 3 && playerGoals > opponentGoals) add('passing_pro');
      if (playerGoals > opponentGoals && opponentGoals === 0) add('defensive_wall');
      if (difficulty === 'hard' && playerGoals > opponentGoals) add('hard_mode');
    }

    p.badges = newBadges;
    return p;
  };

  const deleteProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  const quizAccuracy = profile && profile.quizTotal > 0
    ? Math.round((profile.quizCorrect / profile.quizTotal) * 100)
    : 0;

  return {
    profile,
    isLoaded,
    createProfile,
    saveProfile,
    addXP,
    recordGoal,
    recordMatch,
    recordQuizAnswer,
    deleteProfile,
    quizAccuracy,
    earnedBadges: ALL_BADGES.filter(b => profile?.badges.includes(b.id)),
    lockedBadges: ALL_BADGES.filter(b => !profile?.badges.includes(b.id)),
  };
}
