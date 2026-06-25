import { useEffect, useRef, useCallback } from 'react';

interface DeckAudio {
  gainNode: GainNode;
  oscillators: OscillatorNode[];
  eqLow: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  filter: BiquadFilterNode;
  analyser: AnalyserNode;
  playing: boolean;
  bpm: number;
  beatInterval: ReturnType<typeof setInterval> | null;
}

let globalContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalContext || globalContext.state === 'closed') {
    globalContext = new AudioContext();
  }
  return globalContext;
}

function createBeatSequence(ctx: AudioContext): {
  gainNode: GainNode;
  oscillators: OscillatorNode[];
  eqLow: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  filter: BiquadFilterNode;
  analyser: AnalyserNode;
} {
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

  return { gainNode, oscillators: [], eqLow, eqMid, eqHigh, filter, analyser };
}

// Generate a simple beat pattern using Web Audio
function scheduleBeat(ctx: AudioContext, gainNode: GainNode, bpm: number, startTime: number) {
  const beatDuration = 60 / bpm;
  const now = startTime;

  // Kick drum on beats 1 and 3
  for (let i = 0; i < 4; i++) {
    const t = now + i * beatDuration;
    if (i === 0 || i === 2) {
      const kick = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kick.connect(kickGain);
      kickGain.connect(gainNode);
      kick.frequency.setValueAtTime(150, t);
      kick.frequency.exponentialRampToValueAtTime(0.01, t + 0.15);
      kickGain.gain.setValueAtTime(1, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      kick.start(t);
      kick.stop(t + 0.15);
    }

    // Snare on beats 2 and 4
    if (i === 1 || i === 3) {
      const snare = ctx.createOscillator();
      const snareGain = ctx.createGain();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(gainNode);
      snare.connect(snareGain);
      snareGain.connect(gainNode);
      snare.frequency.value = 200;
      snareGain.gain.setValueAtTime(0.3, t);
      snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      snare.start(t);
      snare.stop(t + 0.1);
      noise.start(t);
      noise.stop(t + 0.1);
    }

    // Hi-hat on every beat
    const hihat = ctx.createOscillator();
    const hihatGain = ctx.createGain();
    const hihatFilter = ctx.createBiquadFilter();
    hihatFilter.type = 'highpass';
    hihatFilter.frequency.value = 8000;
    hihat.connect(hihatFilter);
    hihatFilter.connect(hihatGain);
    hihatGain.connect(gainNode);
    hihat.type = 'square';
    hihat.frequency.value = 12000;
    hihatGain.gain.setValueAtTime(0.1, t);
    hihatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    hihat.start(t);
    hihat.stop(t + 0.05);

    // Offbeat hi-hat
    const offT = t + beatDuration * 0.5;
    const hihat2 = ctx.createOscillator();
    const hihatGain2 = ctx.createGain();
    const hihatFilter2 = ctx.createBiquadFilter();
    hihatFilter2.type = 'highpass';
    hihatFilter2.frequency.value = 8000;
    hihat2.connect(hihatFilter2);
    hihatFilter2.connect(hihatGain2);
    hihatGain2.connect(gainNode);
    hihat2.type = 'square';
    hihat2.frequency.value = 12000;
    hihatGain2.gain.setValueAtTime(0.06, offT);
    hihatGain2.gain.exponentialRampToValueAtTime(0.001, offT + 0.03);
    hihat2.start(offT);
    hihat2.stop(offT + 0.03);
  }

  // Bass synth
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = 'lowpass';
  bassFilter.frequency.value = 300;
  bassOsc.type = 'sawtooth';
  bassOsc.frequency.value = 55; // A1
  bassOsc.connect(bassFilter);
  bassFilter.connect(bassGain);
  bassGain.connect(gainNode);
  bassGain.gain.setValueAtTime(0, now);
  bassGain.gain.setValueAtTime(0.4, now + 0.01);
  bassGain.gain.setValueAtTime(0.3, now + beatDuration);
  bassGain.gain.setValueAtTime(0, now + beatDuration * 3.9);
  bassOsc.start(now);
  bassOsc.stop(now + beatDuration * 4);
}

export function useAudioEngine() {
  const decksRef = useRef<{ a: DeckAudio | null; b: DeckAudio | null }>({ a: null, b: null });
  const animFrameRef = useRef<number | null>(null);

  const initDeck = useCallback((deckId: 'a' | 'b') => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const deck = createBeatSequence(ctx);
    decksRef.current[deckId] = {
      ...deck,
      playing: false,
      bpm: 128,
      beatInterval: null,
    };
    return decksRef.current[deckId]!;
  }, []);

  const getDeck = useCallback((deckId: 'a' | 'b') => {
    return decksRef.current[deckId] || initDeck(deckId);
  }, [initDeck]);

  const setPlaying = useCallback((deckId: 'a' | 'b', playing: boolean, bpm: number) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const deck = getDeck(deckId);
    deck.playing = playing;
    deck.bpm = bpm;

    if (playing) {
      deck.gainNode.gain.setTargetAtTime(0.7, ctx.currentTime, 0.1);

      if (deck.beatInterval) clearInterval(deck.beatInterval);
      const beatMs = (60 / bpm) * 4 * 1000;
      const scheduleNext = () => {
        if (deck.playing) {
          scheduleBeat(ctx, deck.gainNode, deck.bpm, ctx.currentTime + 0.05);
        }
      };
      scheduleNext();
      deck.beatInterval = setInterval(scheduleNext, beatMs) as any;
    } else {
      deck.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      if (deck.beatInterval) {
        clearInterval(deck.beatInterval);
        deck.beatInterval = null;
      }
    }
  }, [getDeck]);

  const setVolume = useCallback((deckId: 'a' | 'b', volume: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    if (deck.playing) {
      deck.gainNode.gain.setTargetAtTime(volume * 0.7, ctx.currentTime, 0.05);
    }
  }, [getDeck]);

  const setEQ = useCallback((deckId: 'a' | 'b', band: 'low' | 'mid' | 'high', value: number) => {
    const deck = getDeck(deckId);
    const gain = value * 12; // -12 to +12 dB
    if (band === 'low') deck.eqLow.gain.value = gain;
    if (band === 'mid') deck.eqMid.gain.value = gain;
    if (band === 'high') deck.eqHigh.gain.value = gain;
  }, [getDeck]);

  const setFilter = useCallback((deckId: 'a' | 'b', value: number) => {
    const ctx = getAudioContext();
    const deck = getDeck(deckId);
    // 0 = fully closed (20Hz), 1 = fully open (Nyquist)
    const freq = 20 + (ctx.sampleRate / 2 - 20) * Math.pow(value, 3);
    deck.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
  }, [getDeck]);

  const setCrossfader = useCallback((value: number) => {
    const ctx = getAudioContext();
    const deckA = decksRef.current.a;
    const deckB = decksRef.current.b;
    if (!deckA || !deckB) return;

    // Equal-power crossfade
    const angleA = value * Math.PI * 0.5;
    const gainA = Math.cos(angleA);
    const gainB = Math.sin(angleA);

    if (deckA.playing) deckA.gainNode.gain.setTargetAtTime(gainA * 0.7, ctx.currentTime, 0.02);
    if (deckB.playing) deckB.gainNode.gain.setTargetAtTime(gainB * 0.7, ctx.currentTime, 0.02);
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
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const { a, b } = decksRef.current;
      if (a?.beatInterval) clearInterval(a.beatInterval);
      if (b?.beatInterval) clearInterval(b.beatInterval);
    };
  }, []);

  return { setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck };
}
