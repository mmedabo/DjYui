import { useEffect, useRef, useCallback } from 'react';
import type { SweepFxType } from '../types';

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

// ─── Reverb impulse response ─────────────────────────────────────────────────

function createReverbBuffer(ctx: AudioContext, duration = 1.5, decay = 2.5): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.ceil(sr * duration);
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

// ─── Deck chain ──────────────────────────────────────────────────────────────

interface DeckChain {
  audioEl: HTMLAudioElement;
  source: MediaElementAudioSourceNode | null;
  // Channel insert filter (sweep FX + deck filter)
  filterNode: BiquadFilterNode | null;
  // 3-band EQ
  filters: { high: BiquadFilterNode; mid: BiquadFilterNode; low: BiquadFilterNode } | null;
  // Channel volume + crossfader
  gainNode: GainNode | null;
  // Beat delay / echo (BPM-synced)
  delayNode: DelayNode | null;
  delayFeedback: GainNode | null;
  delayWet: GainNode | null;
  // Reverb
  reverbNode: ConvolverNode | null;
  reverbWet: GainNode | null;
  // Flanger (separate short-delay node)
  flangerNode: DelayNode | null;
  flangerFeedback: GainNode | null;
  flangerWet: GainNode | null;
  // Analyser
  analyser: AnalyserNode | null;
  // Playback state
  playing: boolean;
  bpm: number;
  volume: number;
  // Loop region cleanup
  loopCleanup: (() => void) | null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const decksRef = useRef<{ a: DeckChain | null; b: DeckChain | null }>({ a: null, b: null });
  // Per-deck flanger LFO timers (outside DeckChain to avoid serialisation issues)
  const flangerTimers = useRef<{ a: ReturnType<typeof setInterval> | null; b: ReturnType<typeof setInterval> | null }>({ a: null, b: null });

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
    let filterNode: BiquadFilterNode | null = null;
    let filters: DeckChain['filters'] = null;
    let gainNode: GainNode | null = null;
    let delayNode: DelayNode | null = null;
    let delayFeedback: GainNode | null = null;
    let delayWet: GainNode | null = null;
    let reverbNode: ConvolverNode | null = null;
    let reverbWet: GainNode | null = null;
    let flangerNode: DelayNode | null = null;
    let flangerFeedback: GainNode | null = null;
    let flangerWet: GainNode | null = null;
    let analyser: AnalyserNode | null = null;

    try {
      const ctx = getCtx();

      // ── Channel insert filter (sweep FX / deck filter) ──
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 20000; // fully open by default
      filt.Q.value = 0.7;
      filterNode = filt;

      // ── 3-band EQ ──
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

      // ── Channel gain ──
      const gain = ctx.createGain();
      gain.gain.value = 0.85;

      // ── Analyser ──
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 64;
      analyserNode.smoothingTimeConstant = 0.8;

      // ── Delay / Echo (BPM-synced, max 2.5s for slow tempos) ──
      const delay = ctx.createDelay(2.5);
      delay.delayTime.value = 0.375; // ~1 beat at 160 BPM
      const fbGain = ctx.createGain();
      fbGain.gain.value = 0;        // silence until activated
      const delayOut = ctx.createGain();
      delayOut.gain.value = 0;      // dry by default
      // feedback loop: delay → fbGain → delay
      delay.connect(fbGain);
      fbGain.connect(delay);
      delay.connect(delayOut);

      // ── Reverb ──
      const reverb = ctx.createConvolver();
      try { reverb.buffer = createReverbBuffer(ctx); } catch (_) {}
      const revWet = ctx.createGain();
      revWet.gain.value = 0;

      // ── Flanger (separate short-delay node, ~1–7 ms) ──
      const flanger = ctx.createDelay(0.02);
      flanger.delayTime.value = 0.004;
      const flangerFB = ctx.createGain();
      flangerFB.gain.value = 0;
      const flangerOut = ctx.createGain();
      flangerOut.gain.value = 0;
      flanger.connect(flangerFB);
      flangerFB.connect(flanger);
      flanger.connect(flangerOut);

      // ── Wire main chain ──
      // source → filterNode → high → mid → low → gain → analyser → dest
      const src = ctx.createMediaElementSource(audioEl);
      source = src;
      src.connect(filt);
      filt.connect(high);
      high.connect(mid);
      mid.connect(low);
      low.connect(gain);
      gain.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      // Parallel wet paths from gain node:
      gain.connect(delay);           // → delay → delayOut → dest
      delayOut.connect(ctx.destination);
      gain.connect(reverb);          // → reverb → revWet → dest
      revWet.connect(ctx.destination);
      gain.connect(flanger);         // → flanger → flangerOut → dest
      flangerOut.connect(ctx.destination);

      filters = { high, mid, low };
      gainNode = gain;
      delayNode = delay;
      delayFeedback = fbGain;
      delayWet = delayOut;
      reverbNode = reverb;
      reverbWet = revWet;
      flangerNode = flanger;
      flangerFeedback = flangerFB;
      flangerWet = flangerOut;
      analyser = analyserNode;
    } catch (e) {
      console.warn('Web Audio chain failed, EQ/FX disabled:', e);
      if (source && ctxRef.current) {
        try { source.connect(ctxRef.current.destination); } catch (_) {}
      }
    }

    const chain: DeckChain = {
      audioEl, source, filterNode, filters, gainNode,
      delayNode, delayFeedback, delayWet,
      reverbNode, reverbWet,
      flangerNode, flangerFeedback, flangerWet,
      analyser, playing: false, bpm: 128, volume: 1, loopCleanup: null,
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

    // Keep delay time synced to BPM (1 beat)
    if (deck.delayNode) {
      deck.delayNode.delayTime.value = Math.min(60 / bpm, 2.0);
    }

    if (!playing) {
      deck.audioEl.pause();
      return;
    }

    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const url = customUrl ?? getBeatBlobUrl(bpm);
    if (deck.audioEl.src !== url) deck.audioEl.src = url;
    deck.audioEl.loop = deck.loopCleanup === null; // honour active loop region
    if (!deck.gainNode) deck.audioEl.volume = deck.volume * 0.85;
    deck.audioEl.play().catch(e => console.error('play error', e));

    // Safety net: fallback to plain HTML5 element if AudioContext stays suspended
    if (deck.source) {
      const savedUrl = url;
      setTimeout(() => {
        const d = decksRef.current[deckId];
        if (!d?.playing || ctxRef.current?.state === 'running') return;
        const el = new Audio();
        el.loop = true;
        el.src = savedUrl;
        el.volume = d.volume * 0.85;
        d.audioEl.pause();
        d.audioEl = el;
        d.source = null;
        d.filterNode = null;
        d.filters = null;
        d.gainNode = null;
        d.delayNode = null;
        d.delayFeedback = null;
        d.delayWet = null;
        d.reverbNode = null;
        d.reverbWet = null;
        d.flangerNode = null;
        d.flangerFeedback = null;
        d.flangerWet = null;
        d.analyser = null;
        el.play().catch(e => console.error('fallback play error', e));
      }, 400);
    }
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

  // EQ: value −1..+1 maps to ±15 dB
  const setEQ = useCallback((deckId: 'a' | 'b', band: 'low' | 'mid' | 'high', value: number) => {
    const deck = getDeck(deckId);
    if (!deck?.filters) return;
    deck.filters[band].gain.value = value * 15;
  }, [getDeck]);

  // Deck-level filter (filterFreq 0-1): 0 = closed (200 Hz), 1 = open (20 kHz)
  const setFilter = useCallback((deckId: 'a' | 'b', value: number) => {
    const deck = getDeck(deckId);
    if (!deck?.filterNode) return;
    // Logarithmic: 200 * 100^value → 200 Hz at 0, ~20 kHz at 1
    const freq = 200 * Math.pow(100, value);
    deck.filterNode.type = 'lowpass';
    deck.filterNode.frequency.value = Math.min(freq, 20000);
  }, [getDeck]);

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

  // ── Pitch / tempo ─────────────────────────────────────────────────────────

  const setPitch = useCallback((deckId: 'a' | 'b', pitch: number) => {
    const deck = getDeck(deckId);
    // pitch range −1..+1 → playbackRate 0.92..1.08 (±8%)
    deck.audioEl.playbackRate = Math.max(0.25, Math.min(4, 1 + pitch * 0.08));
  }, [getDeck]);

  // ── Seek ─────────────────────────────────────────────────────────────────

  const seekTo = useCallback((deckId: 'a' | 'b', position: number) => {
    const deck = getDeck(deckId);
    const dur = deck.audioEl.duration;
    if (!isFinite(dur) || dur <= 0) return;
    deck.audioEl.currentTime = Math.max(0, Math.min(position * dur, dur - 0.01));
  }, [getDeck]);

  // ── Loop region ──────────────────────────────────────────────────────────

  const setLoop = useCallback((deckId: 'a' | 'b', active: boolean, loopStart: number, loopEnd: number) => {
    const deck = getDeck(deckId);

    // Remove any previous loop listener
    deck.loopCleanup?.();
    deck.loopCleanup = null;

    if (!active) {
      deck.audioEl.loop = true;
      return;
    }

    // Disable native looping; enforce the region with timeupdate
    deck.audioEl.loop = false;

    const handler = () => {
      const dur = deck.audioEl.duration;
      if (!isFinite(dur) || dur <= 0) return;
      if (deck.audioEl.currentTime >= loopEnd * dur) {
        deck.audioEl.currentTime = loopStart * dur;
      }
    };

    deck.audioEl.addEventListener('timeupdate', handler);
    deck.loopCleanup = () => deck.audioEl.removeEventListener('timeupdate', handler);

    // Jump to loop start immediately
    const dur = deck.audioEl.duration;
    if (isFinite(dur) && dur > 0) {
      deck.audioEl.currentTime = loopStart * dur;
    }
  }, [getDeck]);

  // ── Beat FX knobs (REV / DLY / FLT / ECH / FLG) ─────────────────────────

  const setFX = useCallback((deckId: 'a' | 'b', fx: 'reverb' | 'delay' | 'filter' | 'echo' | 'flanger', value: number) => {
    const deck = getDeck(deckId);

    switch (fx) {
      case 'reverb':
        if (deck.reverbWet) deck.reverbWet.gain.value = value * 0.5;
        break;

      case 'delay':
        if (deck.delayWet) deck.delayWet.gain.value = value * 0.45;
        if (deck.delayFeedback) deck.delayFeedback.gain.value = 0.2;
        // restore BPM-synced delay time
        if (deck.delayNode) deck.delayNode.delayTime.value = Math.min(60 / deck.bpm, 2.0);
        break;

      case 'echo':
        // Echo = delay + heavy feedback (multiple repeats)
        if (deck.delayWet) deck.delayWet.gain.value = value * 0.55;
        if (deck.delayFeedback) deck.delayFeedback.gain.value = value * 0.45;
        if (deck.delayNode) deck.delayNode.delayTime.value = Math.min(60 / deck.bpm, 2.0);
        break;

      case 'filter': {
        // Beat FX filter: bandpass sweep (0 = off/transparent, 1 = narrow mid peak)
        if (!deck.filterNode) break;
        if (value < 0.05) {
          deck.filterNode.type = 'lowpass';
          deck.filterNode.frequency.value = 20000;
          deck.filterNode.Q.value = 0.7;
        } else {
          deck.filterNode.type = 'bandpass';
          // Sweep 200 Hz → 4 kHz
          deck.filterNode.frequency.value = 200 * Math.pow(20, value);
          deck.filterNode.Q.value = 2 + value * 8;
        }
        break;
      }

      case 'flanger': {
        // Animated flanger: very short delay (1–7 ms) with LFO
        const timer = flangerTimers.current[deckId];
        if (value < 0.02) {
          // Turn off
          if (timer) { clearInterval(timer); flangerTimers.current[deckId] = null; }
          if (deck.flangerWet) deck.flangerWet.gain.value = 0;
          if (deck.flangerFeedback) deck.flangerFeedback.gain.value = 0;
        } else {
          // Turn on (start LFO if not running)
          if (deck.flangerWet) deck.flangerWet.gain.value = value * 0.5;
          if (deck.flangerFeedback) deck.flangerFeedback.gain.value = value * 0.3;
          if (!timer && deck.flangerNode) {
            let phase = 0;
            flangerTimers.current[deckId] = setInterval(() => {
              if (!deck.flangerNode) return;
              phase += 0.08; // ~0.3 Hz LFO at 25 ms tick
              deck.flangerNode.delayTime.value = 0.001 + 0.006 * (Math.sin(phase) * 0.5 + 0.5);
            }, 25);
          }
        }
        break;
      }
    }
  }, [getDeck]);

  // ── Channel sweep FX (FLT / GATE / ECHO selector) ───────────────────────

  const setSweepFX = useCallback((deckId: 'a' | 'b', type: SweepFxType) => {
    const deck = getDeck(deckId);

    switch (type) {
      case 'off':
        // Restore filter to fully open
        if (deck.filterNode) {
          deck.filterNode.type = 'lowpass';
          deck.filterNode.frequency.value = 20000;
          deck.filterNode.Q.value = 0.7;
        }
        // Disable sweep echo (leave beat FX echo alone if non-zero)
        break;

      case 'filter':
        // Classic low-pass at ~1.2 kHz — noticeably dark/muffled
        if (deck.filterNode) {
          deck.filterNode.type = 'lowpass';
          deck.filterNode.frequency.value = 1200;
          deck.filterNode.Q.value = 2.0;
        }
        break;

      case 'gate':
        // Approximate gate with a high-pass: removes bass, sounds thin/gated
        if (deck.filterNode) {
          deck.filterNode.type = 'highpass';
          deck.filterNode.frequency.value = 600;
          deck.filterNode.Q.value = 1.0;
        }
        break;

      case 'echo':
        // Channel echo at fixed intensity
        if (deck.delayWet) deck.delayWet.gain.value = 0.5;
        if (deck.delayFeedback) deck.delayFeedback.gain.value = 0.45;
        if (deck.delayNode) deck.delayNode.delayTime.value = Math.min(60 / deck.bpm, 2.0);
        break;
    }
  }, [getDeck]);

  // ── Analyser data ─────────────────────────────────────────────────────────

  const getAnalyserData = useCallback((deckId: 'a' | 'b'): Uint8Array => {
    const deck = decksRef.current[deckId];
    const SIZE = 32;
    const data = new Uint8Array(SIZE);
    if (!deck?.playing) return data;

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

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // Stop flanger LFOs
      (['a', 'b'] as const).forEach(id => {
        const t = flangerTimers.current[id];
        if (t) clearInterval(t);
        flangerTimers.current[id] = null;
      });
      [decksRef.current.a, decksRef.current.b].forEach(d => {
        if (!d) return;
        d.loopCleanup?.();
        try { d.audioEl.pause(); } catch (_) {}
      });
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, []);

  return {
    setPlaying, setVolume, setEQ, setFilter, setCrossfader, getAnalyserData, initDeck, unlockAudio,
    setPitch, seekTo, setLoop, setFX, setSweepFX,
  } as const;
}
