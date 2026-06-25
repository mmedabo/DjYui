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

// ─── Deck chain ──────────────────────────────────────────────────────────────

interface DeckChain {
  audioEl: HTMLAudioElement;
  // Web Audio nodes (null when Web Audio is unavailable)
  source: MediaElementAudioSourceNode | null;
  filters: { high: BiquadFilterNode; mid: BiquadFilterNode; low: BiquadFilterNode } | null;
  gainNode: GainNode | null;
  analyser: AnalyserNode | null;
  playing: boolean;
  bpm: number;
  volume: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const decksRef = useRef<{ a: DeckChain | null; b: DeckChain | null }>({ a: null, b: null });

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const initDeck = useCallback((id: 'a' | 'b'): DeckChain => {
    const audioEl = new Audio();
    audioEl.loop = true;

    let source: MediaElementAudioSourceNode | null = null;
    let filters: DeckChain['filters'] = null;
    let gainNode: GainNode | null = null;
    let analyser: AnalyserNode | null = null;

    try {
      const ctx = getCtx();
      source = ctx.createMediaElementSource(audioEl);

      const high = ctx.createBiquadFilter();
      high.type = 'highshelf';
      high.frequency.value = 8000;
      high.gain.value = 0;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;
      mid.gain.value = 0;

      const low = ctx.createBiquadFilter();
      low.type = 'lowshelf';
      low.frequency.value = 200;
      low.gain.value = 0;

      gainNode = ctx.createGain();
      gainNode.gain.value = 0.85;

      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      source
        .connect(high)
        .connect(mid)
        .connect(low)
        .connect(gainNode)
        .connect(analyser)
        .connect(ctx.destination);

      filters = { high, mid, low };
    } catch (e) {
      // Web Audio unavailable — fall back to plain HTML5 Audio (no EQ)
      console.warn('Web Audio chain failed, EQ disabled:', e);
    }

    const chain: DeckChain = {
      audioEl, source, filters, gainNode, analyser,
      playing: false, bpm: 128, volume: 1,
    };
    decksRef.current[id] = chain;
    return chain;
  }, [getCtx]);

  const getDeck = useCallback((id: 'a' | 'b') => decksRef.current[id] ?? initDeck(id), [initDeck]);

  const unlockAudio = useCallback((onStatus?: (s: string) => void): string => {
    const da = getDeck('a');
    const db = getDeck('b');
    const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    da.audioEl.src = SILENT;
    db.audioEl.src = SILENT;

    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    Promise.all([da.audioEl.play(), db.audioEl.play()])
      .then(() => {
        da.audioEl.pause(); db.audioEl.pause();
        da.audioEl.removeAttribute('src'); db.audioEl.removeAttribute('src');
        onStatus?.(`audio unlocked ✓ ctx:${ctx.state}`);
      })
      .catch(e => onStatus?.(`unlock error: ${e}`));

    return 'unlocking audio…';
  }, [getDeck, getCtx]);

  const setPlaying = useCallback((deckId: 'a' | 'b', playing: boolean, bpm: number, customUrl?: string) => {
    const deck = getDeck(deckId);
    deck.playing = playing;
    deck.bpm = bpm;

    if (!playing) {
      deck.audioEl.pause();
      return;
    }

    // Resume AudioContext synchronously within the user gesture (Play button click)
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const url = customUrl ?? getBeatBlobUrl(bpm);
    if (deck.audioEl.src !== url) deck.audioEl.src = url;
    deck.audioEl.loop = true;
    // Volume: use gainNode when Web Audio chain is active, else set directly
    if (!deck.gainNode) deck.audioEl.volume = deck.volume * 0.85;
    deck.audioEl.play().catch(e => console.error('play error', e));
  }, [getDeck, getCtx]);

  const setVolume = useCallback((deckId: 'a' | 'b', volume: number) => {
    const deck = getDeck(deckId);
    deck.volume = volume;
    if (deck.gainNode) {
      deck.gainNode.gain.value = volume * 0.85;
    } else {
      deck.audioEl.volume = volume * 0.85;
    }
  }, [getDeck]);

  // EQ: value -1..1 maps to ±15 dB on the biquad filter
  const setEQ = useCallback((deckId: 'a' | 'b', band: 'low' | 'mid' | 'high', value: number) => {
    const deck = getDeck(deckId);
    if (!deck?.filters) return;
    deck.filters[band].gain.value = value * 15;
  }, [getDeck]);

  const setFilter = useCallback((_deckId: 'a' | 'b', _value: number) => {}, []);

  const setCrossfader = useCallback((value: number) => {
    const a = decksRef.current.a;
    const b = decksRef.current.b;
    if (!a || !b) return;
    const angle = value * Math.PI * 0.5;
    const aVol = Math.cos(angle) * a.volume * 0.85;
    const bVol = Math.sin(angle) * b.volume * 0.85;
    if (a.gainNode) a.gainNode.gain.value = aVol;
    else if (a.playing) a.audioEl.volume = aVol;
    if (b.gainNode) b.gainNode.gain.value = bVol;
    else if (b.playing) b.audioEl.volume = bVol;
  }, []);

  const getAnalyserData = useCallback((deckId: 'a' | 'b'): Uint8Array => {
    const deck = decksRef.current[deckId];
    const SIZE = 32;
    const data = new Uint8Array(SIZE);
    if (!deck?.playing) return data;

    // Use real FFT data when Web Audio chain is active
    if (deck.analyser) {
      const buf = new Uint8Array(deck.analyser.frequencyBinCount);
      deck.analyser.getByteFrequencyData(buf);
      for (let i = 0; i < SIZE; i++) {
        data[i] = buf[Math.floor(i * buf.length / SIZE)];
      }
      return data;
    }

    // Fallback: BPM-reactive fake spectrum
    const t = deck.audioEl.currentTime;
    const bpm = deck.bpm;
    const beatPos = ((t * bpm) / 60) % 4;
    const beatFrac = beatPos % 1;
    const kickEnv = (beatPos < 2 && beatFrac < 0.25) ? (1 - beatFrac / 0.25) : 0;
    const snareEnv = (beatPos >= 1 && beatFrac < 0.2) ? (1 - beatFrac / 0.2) : 0;
    for (let i = 0; i < SIZE; i++) {
      const f = i / SIZE;
      let lvl = 15 + Math.random() * 10;
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
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, []);

  return { setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck, unlockAudio } as const;
}
