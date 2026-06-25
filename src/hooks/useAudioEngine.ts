import { useEffect, useRef, useCallback } from 'react';

interface DeckAudio {
  gainNode: GainNode;
  eqLow: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  filter: BiquadFilterNode;
  analyser: AnalyserNode;
  sourceNode: AudioScheduledSourceNode | null;
  playing: boolean;
  bpm: number;
}

let globalContext: AudioContext | null = null;
const bufferCache = new Map<number, AudioBuffer>();

function getOrCreateContext(): AudioContext {
  if (!globalContext || globalContext.state === 'closed') {
    globalContext = new AudioContext();
  }
  return globalContext;
}

function generateBeatBuffer(ctx: AudioContext, bpm: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const beatSec = 60 / bpm;
  const len = Math.ceil(beatSec * 4 * sr);
  const buf = ctx.createBuffer(2, len, sr);
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);

  const add = (startSmp: number, durSec: number, sample: (i: number) => number) => {
    const n = Math.min(Math.ceil(durSec * sr), len - startSmp);
    for (let i = 0; i < n; i++) {
      const v = sample(i);
      const idx = startSmp + i;
      L[idx] = Math.max(-1, Math.min(1, (L[idx] ?? 0) + v));
      R[idx] = L[idx];
    }
  };

  for (let beat = 0; beat < 4; beat++) {
    const bs = Math.round(beat * beatSec * sr);
    const hs = Math.round((beat + 0.5) * beatSec * sr);

    // Kick on 1 & 3
    if (beat === 0 || beat === 2) {
      add(bs, 0.25, i => {
        const t = i / sr;
        return Math.sin(2 * Math.PI * 80 * Math.exp(-t * 30) * t) * Math.exp(-t * 20) * 0.9;
      });
    }
    // Snare on 2 & 4
    if (beat === 1 || beat === 3) {
      add(bs, 0.18, i => {
        const t = i / sr;
        return (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.6;
      });
      add(bs, 0.10, i => {
        const t = i / sr;
        return Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 30) * 0.3;
      });
    }
    // Hi-hat every beat + offbeat
    add(bs, 0.04, i => (Math.random() * 2 - 1) * Math.exp(-i / sr * 80) * 0.25);
    add(hs, 0.03, i => (Math.random() * 2 - 1) * Math.exp(-i / sr * 100) * 0.18);
    // Bass on 1 & 3
    if (beat === 0 || beat === 2) {
      const f = beat === 0 ? 55 : 49;
      add(bs, 0.4, i => {
        const t = i / sr;
        return (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(4 * Math.PI * f * t) * 0.15)
          * Math.exp(-t * 12) * 0.5;
      });
    }
  }
  return buf;
}

function getCachedBuffer(ctx: AudioContext, bpm: number): AudioBuffer {
  const key = Math.round(bpm);
  if (!bufferCache.has(key)) {
    bufferCache.set(key, generateBeatBuffer(ctx, bpm));
  }
  return bufferCache.get(key)!;
}

function buildChain(ctx: AudioContext): Omit<DeckAudio, 'playing' | 'bpm' | 'sourceNode'> {
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  const eqLow = ctx.createBiquadFilter();
  eqLow.type = 'lowshelf'; eqLow.frequency.value = 250;

  const eqMid = ctx.createBiquadFilter();
  eqMid.type = 'peaking'; eqMid.frequency.value = 1000; eqMid.Q.value = 1;

  const eqHigh = ctx.createBiquadFilter();
  eqHigh.type = 'highshelf'; eqHigh.frequency.value = 4000;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = ctx.sampleRate / 2;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  gainNode.connect(eqLow);
  eqLow.connect(eqMid);
  eqMid.connect(eqHigh);
  eqHigh.connect(filter);
  filter.connect(analyser);
  analyser.connect(ctx.destination);

  return { gainNode, eqLow, eqMid, eqHigh, filter, analyser };
}

export function useAudioEngine() {
  const decksRef = useRef<{ a: DeckAudio | null; b: DeckAudio | null }>({ a: null, b: null });

  const initDeck = useCallback((id: 'a' | 'b'): DeckAudio => {
    const ctx = getOrCreateContext();
    const deck: DeckAudio = { ...buildChain(ctx), sourceNode: null, playing: false, bpm: 128 };
    decksRef.current[id] = deck;
    return deck;
  }, []);

  const getDeck = useCallback((id: 'a' | 'b') => decksRef.current[id] ?? initDeck(id), [initDeck]);

  // Call inside a user tap to unlock iOS audio — plays an audible beep to confirm it works
  // Returns a debug string describing context state for diagnostics
  const unlockAudio = useCallback((): string => {
    const ctx = getOrCreateContext();
    const state0 = ctx.state;

    const doBeep = () => {
      try {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = 440;
        g.gain.value = 0.5;
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {
        console.error('beep error', e);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(doBeep).catch(e => console.error('resume error', e));
      return `ctx was ${state0} → resuming (beep pending) sr:${ctx.sampleRate}`;
    }

    doBeep();
    return `ctx:${state0} beep fired sr:${ctx.sampleRate}`;
  }, []);

  const setPlaying = useCallback((deckId: 'a' | 'b', playing: boolean, bpm: number) => {
    const ctx = getOrCreateContext();
    const deck = getDeck(deckId);
    deck.playing = playing;
    deck.bpm = bpm;

    // Stop current source
    if (deck.sourceNode) {
      try { deck.sourceNode.stop(0); } catch (_) {}
      deck.sourceNode.disconnect();
      deck.sourceNode = null;
    }

    if (!playing) {
      deck.gainNode.gain.value = 0;
      return;
    }

    const startSource = () => {
      if (!deck.playing) return; // user stopped before resume resolved
      const buf = getCachedBuffer(ctx, bpm);
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.loop = true;
      source.connect(deck.gainNode);
      deck.gainNode.gain.value = 0.85;
      source.start(ctx.currentTime);
      deck.sourceNode = source;
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(startSource).catch(e => console.error('resume error', e));
    } else {
      startSource();
    }
  }, [getDeck]);

  const setVolume = useCallback((deckId: 'a' | 'b', volume: number) => {
    const deck = getDeck(deckId);
    if (deck.playing) deck.gainNode.gain.value = volume * 0.85;
  }, [getDeck]);

  const setEQ = useCallback((deckId: 'a' | 'b', band: 'low' | 'mid' | 'high', value: number) => {
    const deck = getDeck(deckId);
    const g = value * 12;
    if (band === 'low') deck.eqLow.gain.value = g;
    if (band === 'mid') deck.eqMid.gain.value = g;
    if (band === 'high') deck.eqHigh.gain.value = g;
  }, [getDeck]);

  const setFilter = useCallback((deckId: 'a' | 'b', value: number) => {
    const ctx = getOrCreateContext();
    const deck = getDeck(deckId);
    const freq = 20 + (ctx.sampleRate / 2 - 20) * Math.pow(value, 3);
    deck.filter.frequency.value = freq;
  }, [getDeck]);

  const setCrossfader = useCallback((value: number) => {
    const a = decksRef.current.a;
    const b = decksRef.current.b;
    if (!a || !b) return;
    const angle = value * Math.PI * 0.5;
    if (a.playing) a.gainNode.gain.value = Math.cos(angle) * 0.85;
    if (b.playing) b.gainNode.gain.value = Math.sin(angle) * 0.85;
  }, []);

  const getAnalyserData = useCallback((deckId: 'a' | 'b'): Uint8Array => {
    const deck = decksRef.current[deckId];
    if (!deck) return new Uint8Array(0);
    const data = new Uint8Array(deck.analyser.frequencyBinCount);
    deck.analyser.getByteFrequencyData(data);
    return data;
  }, []);

  useEffect(() => {
    return () => {
      [decksRef.current.a, decksRef.current.b].forEach(d => {
        if (!d) return;
        try { d.sourceNode?.stop(0); } catch (_) {}
      });
    };
  }, []);

  return { setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck, unlockAudio };
}
