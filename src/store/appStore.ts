import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppProgress, DeckState, MixerState, Composition } from '../types';

export interface StudioStats {
  deckAPlays: number;
  deckBPlays: number;
  crossfaderMoves: number;
  eqAdjustments: number;
  scratchCount: number;
}

interface AppStore {
  // Navigation
  currentPage: 'landing' | 'dashboard' | 'session' | 'studio' | 'compositions' | 'achievements';
  activeSessionId: number | null;
  activeLessonIndex: number;
  setPage: (page: AppStore['currentPage']) => void;
  setActiveSession: (id: number | null) => void;
  setActiveLessonIndex: (idx: number) => void;

  // Progress
  progress: AppProgress;
  completeLesson: (sessionId: number, lessonId: string) => void;
  completeSession: (sessionId: number) => void;
  addXP: (amount: number) => void;

  // Deck A
  deckA: DeckState;
  updateDeckA: (partial: Partial<DeckState>) => void;

  // Deck B
  deckB: DeckState;
  updateDeckB: (partial: Partial<DeckState>) => void;

  // Mixer
  mixer: MixerState;
  updateMixer: (partial: Partial<MixerState>) => void;

  // Compositions
  addComposition: (comp: Composition) => void;
  removeComposition: (id: string) => void;

  // YUI state
  yuiMessage: string;
  yuiExpression: string;
  yuiVisible: boolean;
  setYUIMessage: (msg: string, expression?: string) => void;
  setYUIVisible: (v: boolean) => void;

  // Completed lessons tracking
  completedLessons: string[];
  markLessonComplete: (lessonId: string) => void;

  // Studio stats (for achievements)
  studioStats: StudioStats;
  incrementStat: (stat: keyof StudioStats, by?: number) => void;

  // Unlocked achievements
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;
}

const defaultDeck = (): DeckState => ({
  trackId: null,
  isPlaying: false,
  bpm: 128,
  pitch: 0,
  volume: 0.8,
  eqHigh: 0,
  eqMid: 0,
  eqLow: 0,
  filterFreq: 1,
  vinylAngle: 0,
  loopActive: false,
  loopStart: 0,
  loopEnd: 0.25,
  position: 0,
  cues: [],
  slipMode: false,
  stems: { vocal: false, drums: false, inst: false },
  rollActive: false,
  rollSize: 1,
  samplerSlots: [false, false, false, false],
  keyLock: false,
  quantize: false,
  beatLoopSize: 4,
});

const defaultStats = (): StudioStats => ({
  deckAPlays: 0,
  deckBPlays: 0,
  crossfaderMoves: 0,
  eqAdjustments: 0,
  scratchCount: 0,
});

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentPage: 'landing',
      activeSessionId: null,
      activeLessonIndex: 0,
      setPage: (page) => set({ currentPage: page }),
      setActiveSession: (id) => set({ activeSessionId: id, activeLessonIndex: 0 }),
      setActiveLessonIndex: (idx) => set({ activeLessonIndex: idx }),

      progress: {
        currentSession: 1,
        completedSessions: [],
        totalXP: 0,
        level: 'beginner',
        streak: 0,
        lastPlayed: Date.now(),
        compositions: [],
      },

      completeLesson: (sessionId, lessonId) => {
        set((s) => ({
          progress: { ...s.progress, totalXP: s.progress.totalXP + 50 },
          completedLessons: s.completedLessons.includes(lessonId)
            ? s.completedLessons
            : [...s.completedLessons, lessonId],
        }));
        void sessionId;
      },

      completeSession: (sessionId) => {
        set((s) => {
          const already = s.progress.completedSessions.includes(sessionId);
          if (already) return s;
          const completedSessions = [...s.progress.completedSessions, sessionId];
          const totalXP = s.progress.totalXP + 200;
          let level: AppProgress['level'] = 'beginner';
          if (totalXP >= 5000) level = 'pro';
          else if (totalXP >= 2000) level = 'advanced';
          else if (totalXP >= 800) level = 'intermediate';
          return {
            progress: {
              ...s.progress,
              completedSessions,
              totalXP,
              level,
              currentSession: Math.max(s.progress.currentSession, sessionId + 1),
            },
          };
        });
      },

      addXP: (amount) => {
        set((s) => {
          const totalXP = s.progress.totalXP + amount;
          let level: AppProgress['level'] = 'beginner';
          if (totalXP >= 5000) level = 'pro';
          else if (totalXP >= 2000) level = 'advanced';
          else if (totalXP >= 800) level = 'intermediate';
          return { progress: { ...s.progress, totalXP, level } };
        });
      },

      deckA: defaultDeck(),
      updateDeckA: (partial) => set((s) => ({ deckA: { ...s.deckA, ...partial } })),

      deckB: defaultDeck(),
      updateDeckB: (partial) => set((s) => ({ deckB: { ...s.deckB, ...partial } })),

      mixer: {
        crossfader: 0.5,
        masterVolume: 0.85,
        fxA: { reverb: 0, delay: 0, filter: 0, echo: 0, flanger: 0 },
        fxB: { reverb: 0, delay: 0, filter: 0, echo: 0, flanger: 0 },
        sweepFxA: 'off' as const,
        sweepFxB: 'off' as const,
      },
      updateMixer: (partial) => set((s) => ({ mixer: { ...s.mixer, ...partial } })),

      addComposition: (comp) => {
        set((s) => ({
          progress: { ...s.progress, compositions: [comp, ...s.progress.compositions] },
        }));
      },

      removeComposition: (id) => {
        set((s) => ({
          progress: { ...s.progress, compositions: s.progress.compositions.filter(c => c.id !== id) },
        }));
      },

      yuiMessage: "Hey! I'm YUI, your DJ tutor! Ready to learn? 🎧",
      yuiExpression: 'excited',
      yuiVisible: true,
      setYUIMessage: (msg, expression = 'teaching') => set({ yuiMessage: msg, yuiExpression: expression }),
      setYUIVisible: (v) => set({ yuiVisible: v }),

      completedLessons: [],
      markLessonComplete: (lessonId) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(lessonId)
            ? s.completedLessons
            : [...s.completedLessons, lessonId],
        })),

      studioStats: defaultStats(),
      incrementStat: (stat, by = 1) =>
        set((s) => ({ studioStats: { ...s.studioStats, [stat]: s.studioStats[stat] + by } })),

      unlockedAchievements: [],
      unlockAchievement: (id) =>
        set((s) => ({
          unlockedAchievements: s.unlockedAchievements.includes(id)
            ? s.unlockedAchievements
            : [...s.unlockedAchievements, id],
        })),
    }),
    {
      name: 'djyui-app-v2',
      partialize: (s) => ({
        progress: s.progress,
        completedLessons: s.completedLessons,
        studioStats: s.studioStats,
        unlockedAchievements: s.unlockedAchievements,
      }),
    }
  )
);
