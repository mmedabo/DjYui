import { useEffect, useRef, useCallback } from 'react';

// ─── WAV encoder ─────────────────────────────────────────────────────────────

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numSamples = samples.length;
  const buf = new ArrayBuffer(44 + numSamples * 2);
  const v = new DataView(buf);
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + numSamples * 2, true);
  str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, numSamples * 2, true);
  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    v.setInt16(off, Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), true);
    off += 2;
  }
  return buf;
}

// ─── Beat generator → WAV blob URL ──────────────────────────────────────────

function generateBeatSamples(bpm: number, sr = 44100): Float32Array {
  const beatSec = 60 / bpm;
  const len = Math.ceil(beatSec * 4 * sr);
  const L = new Float32Array(len);

  const add = (startSmp: number, durSec: number, fn: (i: number) => number) => {
    const n = Math.min(Math.ceil(durSec * sr), len - startSmp);
    for (let i = 0; i < n; i++) {
      const idx = startSmp + i;
      L[idx] = Math.max(-1, Math.min(1, L[idx] + fn(i)));
    }
  };

  for (let beat = 0; beat < 4; beat++) {
    const bs = Math.round(beat * beatSec * sr);
    const hs = Math.round((beat + 0.5) * beatSec * sr);
    if (beat === 0 || beat === 2) {
      add(bs, 0.25, i => { const t = i / sr; return Math.sin(2 * Math.PI * 80 * Math.exp(-t * 30) * t) * Math.exp(-t * 20) * 0.9; });
    }
    if (beat === 1 || beat === 3) {
      add(bs, 0.18, i => { const t = i / sr; return (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.6; });
      add(bs, 0.10, i => { const t = i / sr; return Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 30) * 0.3; });
    }
    add(bs, 0.04, i => (Math.random() * 2 - 1) * Math.exp(-i / sr * 80) * 0.25);
    add(hs, 0.03, i => (Math.random() * 2 - 1) * Math.exp(-i / sr * 100) * 0.18);
    if (beat === 0 || beat === 2) {
      const f = beat === 0 ? 55 : 49;
      add(bs, 0.4, i => { const t = i / sr; return (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(4 * Math.PI * f * t) * 0.15) * Math.exp(-t * 12) * 0.5; });
    }
  }
  return L;
}

const blobUrlCache = new Map<number, string>();

function getBeatBlobUrl(bpm: number): string {
  const key = Math.round(bpm);
  if (!blobUrlCache.has(key)) {
    const samples = generateBeatSamples(bpm);
    const wav = encodeWAV(samples, 44100);
    blobUrlCache.set(key, URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })));
  }
  return blobUrlCache.get(key)!;
}

// ─── Deck state ──────────────────────────────────────────────────────────────

interface DeckState {
  audioEl: HTMLAudioElement;
  playing: boolean;
  bpm: number;
  volume: number; // 0-1
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAudioEngine() {
  const decksRef = useRef<{ a: DeckState | null; b: DeckState | null }>({ a: null, b: null });

  const initDeck = useCallback((id: 'a' | 'b'): DeckState => {
    const audioEl = new Audio();
    audioEl.loop = true;
    const deck: DeckState = { audioEl, playing: false, bpm: 128, volume: 1 };
    decksRef.current[id] = deck;
    return deck;
  }, []);

  const getDeck = useCallback((id: 'a' | 'b') => decksRef.current[id] ?? initDeck(id), [initDeck]);

  // Tap inside a user gesture to pre-unlock both audio elements.
  // Returns a debug string; onStatus fires again once the promise settles.
  const unlockAudio = useCallback((onStatus?: (s: string) => void): string => {
    const da = getDeck('a');
    const db = getDeck('b');

    // A minimal silent WAV (8 bytes of audio data) to give audioEl a playable source
    // so play() doesn't immediately reject with "no supported source".
    const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    da.audioEl.src = SILENT;
    db.audioEl.src = SILENT;

    Promise.all([da.audioEl.play(), db.audioEl.play()])
      .then(() => {
        da.audioEl.pause(); db.audioEl.pause();
        da.audioEl.removeAttribute('src'); db.audioEl.removeAttribute('src');
        onStatus?.('audioEl unlocked ✓ — tap Play on a deck');
      })
      .catch(e => onStatus?.(`audioEl error: ${e}`));

    return 'unlocking audio elements…';
  }, [getDeck]);

  const setPlaying = useCallback((deckId: 'a' | 'b', playing: boolean, bpm: number) => {
    const deck = getDeck(deckId);
    deck.playing = playing;
    deck.bpm = bpm;

    if (!playing) {
      deck.audioEl.pause();
      return;
    }

    const url = getBeatBlobUrl(bpm);
    if (deck.audioEl.src !== url) {
      deck.audioEl.src = url;
    }
    deck.audioEl.loop = true;
    deck.audioEl.volume = deck.volume * 0.85;
    // setPlaying is always called from an onClick handler — this IS a user gesture
    deck.audioEl.play().catch(e => console.error('play error', e));
  }, [getDeck]);

  const setVolume = useCallback((deckId: 'a' | 'b', volume: number) => {
    const deck = getDeck(deckId);
    deck.volume = volume;
    if (deck.playing) deck.audioEl.volume = volume * 0.85;
  }, [getDeck]);

  // EQ and filter are not available in HTML5 Audio mode (visual-only)
  const setEQ = useCallback((_deckId: 'a' | 'b', _band: 'low' | 'mid' | 'high', _value: number) => {}, []);
  const setFilter = useCallback((_deckId: 'a' | 'b', _value: number) => {}, []);

  const setCrossfader = useCallback((value: number) => {
    const a = decksRef.current.a;
    const b = decksRef.current.b;
    if (!a || !b) return;
    const angle = value * Math.PI * 0.5;
    if (a.playing) a.audioEl.volume = Math.cos(angle) * a.volume * 0.85;
    if (b.playing) b.audioEl.volume = Math.sin(angle) * b.volume * 0.85;
  }, []);

  // No Web Audio analyser — return a BPM-reactive fake spectrum so the visualizer
  // still looks alive when music is playing.
  const getAnalyserData = useCallback((deckId: 'a' | 'b'): Uint8Array => {
    const deck = decksRef.current[deckId];
    const SIZE = 32;
    const data = new Uint8Array(SIZE);
    if (!deck?.playing) return data;

    const t = deck.audioEl.currentTime;
    const bpm = deck.bpm;
    const beatPos = ((t * bpm) / 60) % 4;
    const beatFrac = beatPos % 1;

    const kickEnv = (beatPos < 2 && beatFrac < 0.25) ? (1 - beatFrac / 0.25) : 0;
    const snareEnv = (beatPos >= 1 && beatFrac < 0.2) ? (1 - beatFrac / 0.2) : 0;

    for (let i = 0; i < SIZE; i++) {
      const f = i / SIZE;
      let lvl = 15 + Math.random() * 10; // noise floor
      if (f < 0.15) lvl += kickEnv * 200 * (1 - f / 0.15);
      if (f > 0.2 && f < 0.5) lvl += snareEnv * 120 * Math.random();
      if (f > 0.65) lvl += 20 * Math.random();
      data[i] = Math.min(255, Math.round(lvl));
    }
    return data;
  }, []);

  useEffect(() => {
    return () => {
      [decksRef.current.a, decksRef.current.b].forEach(d => {
        if (!d) return;
        try { d.audioEl.pause(); } catch (_) {}
      });
    };
  }, []);

  return { setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck, unlockAudio } as const;
}
