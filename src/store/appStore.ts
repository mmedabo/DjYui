import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppProgress, DeckState, MixerState, Composition } from '../types';

interface AppStore {
  // Navigation
  currentPage: 'landing' | 'dashboard' | 'session' | 'studio' | 'compositions';
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

      completeLesson: (_sessionId, _lessonId) => {
        set((s) => ({
          progress: { ...s.progress, totalXP: s.progress.totalXP + 50 },
        }));
      },

      completeSession: (sessionId) => {
        set((s) => {
          const already = s.progress.completedSessions.includes(sessionId);
          if (already) return s;
          const completedSessions = [...s.progress.completedSessions, sessionId];
          const xpBonus = 200;
          const totalXP = s.progress.totalXP + xpBonus;
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
        set((s) => ({ progress: { ...s.progress, totalXP: s.progress.totalXP + amount } }));
      },

      deckA: defaultDeck(),
      updateDeckA: (partial) => set((s) => ({ deckA: { ...s.deckA, ...partial } })),

      deckB: defaultDeck(),
      updateDeckB: (partial) => set((s) => ({ deckB: { ...s.deckB, ...partial } })),

      mixer: {
        crossfader: 0.5,
        masterVolume: 0.85,
        fxA: { reverb: 0, delay: 0, filter: 0 },
        fxB: { reverb: 0, delay: 0, filter: 0 },
      },
      updateMixer: (partial) => set((s) => ({ mixer: { ...s.mixer, ...partial } })),

      addComposition: (comp) => {
        set((s) => ({
          progress: {
            ...s.progress,
            compositions: [comp, ...s.progress.compositions],
          },
        }));
      },

      removeComposition: (id) => {
        set((s) => ({
          progress: {
            ...s.progress,
            compositions: s.progress.compositions.filter((c) => c.id !== id),
          },
        }));
      },

      yuiMessage: "Hey! I'm YUI, your DJ tutor! Ready to learn? 🎧",
      yuiExpression: 'excited',
      yuiVisible: true,
      setYUIMessage: (msg, expression = 'teaching') =>
        set({ yuiMessage: msg, yuiExpression: expression }),
      setYUIVisible: (v) => set({ yuiVisible: v }),

      completedLessons: [],
      markLessonComplete: (lessonId) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(lessonId)
            ? s.completedLessons
            : [...s.completedLessons, lessonId],
        })),
    }),
    {
      name: 'djyui-app',
      partialize: (s) => ({
        progress: s.progress,
        completedLessons: s.completedLessons,
      }),
    }
  )
);
