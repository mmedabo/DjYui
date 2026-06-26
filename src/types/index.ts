export type Level = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type YUIExpression = 'neutral' | 'excited' | 'teaching' | 'encouraging' | 'celebrating' | 'thinking';

export interface SessionLesson {
  id: string;
  title: string;
  content: string;
  tips: string[];
  challenge?: string;
  yuiDialog: string[];
}

export interface Session {
  id: number;
  title: string;
  subtitle: string;
  level: Level;
  icon: string;
  color: string;
  duration: string;
  lessons: SessionLesson[];
  skills: string[];
  completed: boolean;
  locked: boolean;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  bpm: number;
  key: string;
  genre: string;
  color: string;
  duration: number; // seconds
}

export interface DeckState {
  trackId: string | null;
  isPlaying: boolean;
  bpm: number;
  pitch: number;      // -8 to +8 semitones
  volume: number;     // 0-1
  eqHigh: number;     // -12 to +12 dB, center = 0
  eqMid: number;
  eqLow: number;
  filterFreq: number; // 0-1
  vinylAngle: number;
  loopActive: boolean;
  loopStart: number;
  loopEnd: number;
  position: number;   // 0-1 playback position
  cues: number[];     // hot cue positions 0-1
  slipMode: boolean;
  keyLock: boolean;
  quantize: boolean;
  beatLoopSize: number; // in beats: 0.5, 1, 2, 4, 8, 16, 32
}

export interface MixerState {
  crossfader: number; // 0 = deck A, 1 = deck B
  masterVolume: number;
  fxA: { reverb: number; delay: number; filter: number };
  fxB: { reverb: number; delay: number; filter: number };
}

export interface Composition {
  id: string;
  name: string;
  createdAt: number;
  duration: number;
  trackA: string | null;
  trackB: string | null;
  bpmA: number;
  bpmB: number;
  thumbnail: string;
}

export interface AppProgress {
  currentSession: number;
  completedSessions: number[];
  totalXP: number;
  level: Level;
  streak: number;
  lastPlayed: number;
  compositions: Composition[];
}
