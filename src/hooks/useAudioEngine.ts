import { useEffect, useRef, useCallback } from 'react';

interface DeckAudio {
  gainNode: GainNode;
  eqLow: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  filter: BiquadFilterNode;
  analyser: AnalyserNode;
  sourceNode: AudioBufferSourceNode | null;
  playing: boolean;
  bpm: number;
}

let globalContext: AudioContext | null = null;
const bufferCache = new Map<number, AudioBuffer>();

function getAudioContext(): AudioContext {
  if (!globalContext || globalContext.state === 'closed') {
    globalContext = new AudioContext();
  }
  return globalContext;
}

function generateBeatBuffer(ctx: AudioContext, bpm: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;
  const len = Math.ceil(barSec * sr);
  const buf = ctx.createBuffer(2, len, sr);
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);

  const write = (start: number, durSec: number, fn: (t: number, env: number) => number) => {
    const n = Math.ceil(durSec * sr);
    const decay = 1 / durSec;
    for (let i = 0; i < n; i++) {
      const idx = start + i;
      if (idx >= len) break;
      const t = i / sr;
      const env = Math.exp(-t * decay * 5);
      const v = fn(t, env);
      L[idx] = Math.max(-1, Math.min(1, (L[idx] || 0) + v));
      R[idx] = L[idx];
    }
  };

  for (let beat = 0; beat < 4; beat++) {
    const bs = Math.round(beat * beatSec * sr);
    const hs = Math.round((beat + 0.5) * beatSec * sr);

    if (beat === 0 || beat === 2) {
      // Kick: pitch-swept sine
      write(bs, 0.22, (t, env) =>
        Math.sin(2 * Math.PI * (90 * Math.exp(-t * 28)) * t) * env * 0.9
      );
    }

    if (beat === 1 || beat === 3) {
      // Snare: noise + tone
      write(bs, 0.16, (_t, env) => (Math.random() * 2 - 1) * env * 0.5);
      write(bs, 0.10, (t, env) => Math.sin(2 * Math.PI * 190 * t) * env * 0.3);
    }

    // Hi-hat on every beat + off-beat
    write(bs, 0.04, (_t, env) => (Math.random() * 2 - 1) * env * 0.22);
    write(hs, 0.03, (_t, env) => (Math.random() * 2 - 1) * env * 0.15);

    // Bass on beats 1 and 3
    if (beat === 0 || beat === 2) {
      const freq = beat === 0 ? 55 : 49;
      write(bs, 0.38, (t, env) =>
        (Math.sin(2 * Math.PI * freq * t) * 0.7 +
         Math.sin(2 * Math.PI * freq * 2 * t) * 0.15) * env * 0.45
      );
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

function createDeckChain(ctx: AudioContext): Omit<DeckAudio, 'playing' | 'bpm' | 'sourceNode'> {
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  const eqLow = ctx.createBiquadFilter();
  eqLow.type = 'lowshelf';
  eqLow.frequency.value = 250;

  const eqMid = ctx.createBiquadFilter();
  eqMid.type = 'peaking';
  eqMid.frequency.value = 1000;
  eqMid.Q.value = 1;

  const eqHigh = ctx.createBiquadFilter();
  eqHigh.type = 'highshelf';
  eqHigh.frequency.value = 4000;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = ctx.sampleRate / 2;

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

  const initDeck = useCallback((deckId: 'a' | 'b'): DeckAudio => {
    const ctx = getAudioContext();
    const chain = createDeckChain(ctx);
    const deck: DeckAudio = { ...chain, sourceNode: null, playing: false, bpm: 128 };
    decksRef.current[deckId] = deck;
    return deck;
  }, []);

  const getDeck = useCallback((deckId: 'a' | 'b'): DeckAudio => {
    return decksRef.current[deckId] ?? initDeck(deckId);
  }, [initDeck]);

  // Call this directly inside a user tap handler to unlock iOS audio
  const unlockAudio = useCallback(() => {
    const ctx = getAudioContext();
    const warm = () => {
      // Pre-generate buffers for common BPMs while context is running
      [118, 120, 122, 124, 126, 128, 130, 132, 134, 140, 142, 145, 148, 170, 174, 176].forEach(b => {
        getCachedBuffer(ctx, b);
      });
      // Play a silent blip to confirm audio pipeline is open
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      g.gain.value = 0.001;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(warm);
    } else {
      warm();
    }
  }, []);

  const setPlaying = useCallback((deckId: 'a' | 'b', playing: boolean, bpm: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    deck.playing = playing;
    deck.bpm = bpm;

    const doPlay = () => {
      if (deck.sourceNode) {
        try { deck.sourceNode.stop(); } catch (_) {}
        deck.sourceNode.disconnect();
        deck.sourceNode = null;
      }
      if (playing) {
        const buf = getCachedBuffer(ctx, bpm);
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.loop = true;
        source.connect(deck.gainNode);
        source.start(0);
        deck.sourceNode = source;
        deck.gainNode.gain.setTargetAtTime(0.85, ctx.currentTime, 0.04);
      } else {
        deck.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay);
    } else {
      doPlay();
    }
  }, [getDeck]);

  const setVolume = useCallback((deckId: 'a' | 'b', volume: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    if (deck.playing) {
      deck.gainNode.gain.setTargetAtTime(volume * 0.85, ctx.currentTime, 0.05);
    }
  }, [getDeck]);

  const setEQ = useCallback((deckId: 'a' | 'b', band: 'low' | 'mid' | 'high', value: number) => {
    const deck = getDeck(deckId);
    const g = value * 12;
    if (band === 'low') deck.eqLow.gain.value = g;
    if (band === 'mid') deck.eqMid.gain.value = g;
    if (band === 'high') deck.eqHigh.gain.value = g;
  }, [getDeck]);

  const setFilter = useCallback((deckId: 'a' | 'b', value: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    const freq = 20 + (ctx.sampleRate / 2 - 20) * Math.pow(value, 3);
    deck.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
  }, [getDeck]);

  const setCrossfader = useCallback((value: number) => {
    const ctx = getAudioContext();
    const a = decksRef.current.a;
    const b = decksRef.current.b;
    if (!a || !b) return;
    const angle = value * Math.PI * 0.5;
    if (a.playing) a.gainNode.gain.setTargetAtTime(Math.cos(angle) * 0.85, ctx.currentTime, 0.02);
    if (b.playing) b.gainNode.gain.setTargetAtTime(Math.sin(angle) * 0.85, ctx.currentTime, 0.02);
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
        if (d?.sourceNode) { try { d.sourceNode.stop(); } catch (_) {} }
      });
    };
  }, []);

  return { setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck, unlockAudio };
}
