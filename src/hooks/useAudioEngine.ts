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

function getAudioContext(): AudioContext {
  if (!globalContext || globalContext.state === 'closed') {
    globalContext = new AudioContext();
  }
  return globalContext;
}

// Build a one-bar beat loop as raw PCM samples — no scheduling needed, works reliably on iOS
function generateBeatBuffer(ctx: AudioContext, bpm: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;
  const len = Math.ceil(barSec * sr);
  const buf = ctx.createBuffer(2, len, sr);
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);

  const write = (startSample: number, durationSamples: number, fn: (t: number, env: number) => number) => {
    for (let i = 0; i < durationSamples; i++) {
      const idx = startSample + i;
      if (idx >= len) break;
      const t = i / sr;
      const env = Math.exp(-t * (durationSamples / sr < 0.05 ? 80 : 18));
      const v = fn(t, env);
      L[idx] = Math.max(-1, Math.min(1, (L[idx] || 0) + v));
      R[idx] = Math.max(-1, Math.min(1, (R[idx] || 0) + v));
    }
  };

  for (let beat = 0; beat < 4; beat++) {
    const beatStart = Math.round(beat * beatSec * sr);
    const halfStart = Math.round((beat + 0.5) * beatSec * sr);

    // Kick on beats 0 and 2 (1 and 3)
    if (beat === 0 || beat === 2) {
      write(beatStart, Math.ceil(0.25 * sr), (t, env) =>
        Math.sin(2 * Math.PI * (80 * Math.exp(-t * 25)) * t) * env * 0.9
      );
    }

    // Snare on beats 1 and 3 (2 and 4)
    if (beat === 1 || beat === 3) {
      // noise component
      write(beatStart, Math.ceil(0.18 * sr), (_t, env) =>
        (Math.random() * 2 - 1) * env * 0.55
      );
      // tonal body
      write(beatStart, Math.ceil(0.12 * sr), (t, env) =>
        Math.sin(2 * Math.PI * 185 * t) * env * 0.3
      );
    }

    // Hi-hat on every beat (short noise burst)
    write(beatStart, Math.ceil(0.04 * sr), (_t, env) =>
      (Math.random() * 2 - 1) * env * 0.25
    );
    // Off-beat hi-hat
    write(halfStart, Math.ceil(0.03 * sr), (_t, env) =>
      (Math.random() * 2 - 1) * env * 0.18
    );

    // Bass line (beats 0 and 2, lower note on 2)
    if (beat === 0 || beat === 2) {
      const freq = beat === 0 ? 55 : 49;
      write(beatStart, Math.ceil(0.35 * sr), (t, env) =>
        (Math.sin(2 * Math.PI * freq * t) * 0.6 +
         Math.sin(2 * Math.PI * freq * 2 * t) * 0.15) * env * 0.5
      );
    }
  }

  return buf;
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

  const setPlaying = useCallback((deckId: 'a' | 'b', playing: boolean, bpm: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    deck.playing = playing;
    deck.bpm = bpm;

    const doPlay = () => {
      // Stop existing source
      if (deck.sourceNode) {
        try { deck.sourceNode.stop(); } catch (_) {}
        deck.sourceNode.disconnect();
        deck.sourceNode = null;
      }

      if (playing) {
        const buf = generateBeatBuffer(ctx, bpm);
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.loop = true;
        source.connect(deck.gainNode);
        source.start(0);
        deck.sourceNode = source;
        deck.gainNode.gain.setTargetAtTime(0.8, ctx.currentTime, 0.05);
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
      deck.gainNode.gain.setTargetAtTime(volume * 0.8, ctx.currentTime, 0.05);
    }
  }, [getDeck]);

  const setEQ = useCallback((deckId: 'a' | 'b', band: 'low' | 'mid' | 'high', value: number) => {
    const deck = getDeck(deckId);
    const gain = value * 12;
    if (band === 'low') deck.eqLow.gain.value = gain;
    if (band === 'mid') deck.eqMid.gain.value = gain;
    if (band === 'high') deck.eqHigh.gain.value = gain;
  }, [getDeck]);

  const setFilter = useCallback((deckId: 'a' | 'b', value: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    const freq = 20 + (ctx.sampleRate / 2 - 20) * Math.pow(value, 3);
    deck.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
  }, [getDeck]);

  const setCrossfader = useCallback((value: number) => {
    const ctx = getAudioContext();
    const deckA = decksRef.current.a;
    const deckB = decksRef.current.b;
    if (!deckA || !deckB) return;
    const angleA = value * Math.PI * 0.5;
    if (deckA.playing) deckA.gainNode.gain.setTargetAtTime(Math.cos(angleA) * 0.8, ctx.currentTime, 0.02);
    if (deckB.playing) deckB.gainNode.gain.setTargetAtTime(Math.sin(angleA) * 0.8, ctx.currentTime, 0.02);
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
      const stop = (d: DeckAudio | null) => {
        if (!d) return;
        if (d.sourceNode) { try { d.sourceNode.stop(); } catch (_) {} }
      };
      stop(decksRef.current.a);
      stop(decksRef.current.b);
    };
  }, []);

  return { setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck };
}
