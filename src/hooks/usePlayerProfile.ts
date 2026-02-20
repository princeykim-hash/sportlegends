import { useState, useEffect, useCallback } from 'react';
import { PlayerProfile, ALL_BADGES, getLevelFromXP } from '@/types';

const STORAGE_KEY = 'cbc_football_player';

const DEFAULT_PROFILE: PlayerProfile = {
  name: '',
  grade: 6,
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
        setProfile(JSON.parse(saved));
      } catch {
        setProfile(null);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = useCallback((p: PlayerProfile) => {
    const updated = { ...p, level: getLevelFromXP(p.xp) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfile(updated);
    return updated;
  }, []);

  const createProfile = useCallback((name: string, grade: number) => {
    const newProfile: PlayerProfile = {
      ...DEFAULT_PROFILE,
      name,
      grade,
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

  const recordMatch = useCallback((playerGoals: number, opponentGoals: number, xpEarned: number) => {
    if (!profile) return;
    const updated = {
      ...profile,
      matchesPlayed: profile.matchesPlayed + 1,
      goalsScored: profile.goalsScored + playerGoals,
      xp: profile.xp + xpEarned,
    };
    // Unlock difficulties based on level
    const newLevel = getLevelFromXP(updated.xp);
    if (newLevel >= 5 && !updated.unlockedDifficulties.includes('medium')) {
      updated.unlockedDifficulties = [...updated.unlockedDifficulties, 'medium'];
    }
    if (newLevel >= 10 && !updated.unlockedDifficulties.includes('hard')) {
      updated.unlockedDifficulties = [...updated.unlockedDifficulties, 'hard'];
    }
    checkAndAwardBadges(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const recordQuizAnswer = useCallback((correct: boolean) => {
    if (!profile) return;
    const updated = {
      ...profile,
      quizTotal: profile.quizTotal + 1,
      quizCorrect: profile.quizCorrect + (correct ? 1 : 0),
      xp: profile.xp + (correct ? 25 : 0),
    };
    checkAndAwardBadges(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const checkAndAwardBadges = (p: PlayerProfile) => {
    const newBadges = [...p.badges];
    
    if (p.goalsScored >= 10 && !newBadges.includes('goal_machine')) {
      newBadges.push('goal_machine');
    }
    if (p.quizCorrect >= 50 && !newBadges.includes('quiz_champion')) {
      newBadges.push('quiz_champion');
    }
    if (p.quizTotal > 0 && p.quizCorrect === p.quizTotal && p.quizTotal >= 5 && !newBadges.includes('fair_play_star')) {
      newBadges.push('fair_play_star');
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
