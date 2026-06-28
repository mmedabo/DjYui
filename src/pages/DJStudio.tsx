import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Save, Disc3, Trophy } from 'lucide-react';
import { Turntable } from '../components/DJDeck/Turntable';
import { Mixer } from '../components/DJDeck/Mixer';
import { AudioVisualizer } from '../components/DJDeck/AudioVisualizer';
import { TrackSelector } from '../components/DJDeck/TrackSelector';
import { LandscapeController } from '../components/DJDeck/LandscapeController';
import { useAppStore } from '../store/appStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { TRACKS } from '../data/tracks';
import type { Composition } from '../types';

type MobileTab = 'a' | 'mix' | 'b';

export function DJStudio() {
  const { deckA, deckB, mixer, updateDeckA, updateDeckB, updateMixer, setPage, addComposition, incrementStat } = useAppStore();
  const audio = useAudioEngine();

  const [mobileTab, setMobileTab] = useState<MobileTab>('a');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mixName, setMixName] = useState('');
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );

  // Custom uploaded track state
  const customUrlRef = useRef<{ a: string | null; b: string | null }>({ a: null, b: null });
  const [customNameA, setCustomNameA] = useState<string | null>(null);
  const [customNameB, setCustomNameB] = useState<string | null>(null);

  const recordTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      clearInterval(recordTimerRef.current);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [isRecording]);

  // ── Volume ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setVolume('a', deckA.volume); }, [deckA.volume]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setVolume('b', deckB.volume); }, [deckB.volume]);

  // ── 3-band EQ ────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setEQ('a', 'high', deckA.eqHigh); }, [deckA.eqHigh]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setEQ('a', 'mid',  deckA.eqMid);  }, [deckA.eqMid]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setEQ('a', 'low',  deckA.eqLow);  }, [deckA.eqLow]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setEQ('b', 'high', deckB.eqHigh); }, [deckB.eqHigh]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setEQ('b', 'mid',  deckB.eqMid);  }, [deckB.eqMid]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setEQ('b', 'low',  deckB.eqLow);  }, [deckB.eqLow]);

  // ── Deck filter (filterFreq) ─────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setFilter('a', deckA.filterFreq); }, [deckA.filterFreq]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setFilter('b', deckB.filterFreq); }, [deckB.filterFreq]);

  // ── Pitch / playbackRate ──────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setPitch('a', deckA.pitch); }, [deckA.pitch]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setPitch('b', deckB.pitch); }, [deckB.pitch]);

  // ── Seek on position change (hot cues, beat jumps, cue return) ───────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.seekTo('a', deckA.position); }, [deckA.position]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.seekTo('b', deckB.position); }, [deckB.position]);

  // ── Loop region ──────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setLoop('a', deckA.loopActive, deckA.loopStart, deckA.loopEnd); }, [deckA.loopActive, deckA.loopStart, deckA.loopEnd]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setLoop('b', deckB.loopActive, deckB.loopStart, deckB.loopEnd); }, [deckB.loopActive, deckB.loopStart, deckB.loopEnd]);

  // ── Beat FX knobs (REV / DLY / FLT / ECH / FLG) ─────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    audio.setFX('a', 'reverb',  mixer.fxA.reverb);
    audio.setFX('a', 'delay',   mixer.fxA.delay);
    audio.setFX('a', 'filter',  mixer.fxA.filter);
    audio.setFX('a', 'echo',    mixer.fxA.echo);
    audio.setFX('a', 'flanger', mixer.fxA.flanger);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer.fxA.reverb, mixer.fxA.delay, mixer.fxA.filter, mixer.fxA.echo, mixer.fxA.flanger]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    audio.setFX('b', 'reverb',  mixer.fxB.reverb);
    audio.setFX('b', 'delay',   mixer.fxB.delay);
    audio.setFX('b', 'filter',  mixer.fxB.filter);
    audio.setFX('b', 'echo',    mixer.fxB.echo);
    audio.setFX('b', 'flanger', mixer.fxB.flanger);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer.fxB.reverb, mixer.fxB.delay, mixer.fxB.filter, mixer.fxB.echo, mixer.fxB.flanger]);

  // ── Channel sweep FX ─────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setSweepFX('a', mixer.sweepFxA); }, [mixer.sweepFxA]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { audio.setSweepFX('b', mixer.sweepFxB); }, [mixer.sweepFxB]);

  const handlePlayA = useCallback((playing: boolean) => {
    updateDeckA({ isPlaying: playing });
    const track = TRACKS.find(t => t.id === deckA.trackId);
    const bpm = track?.bpm || deckA.bpm;
    const customUrl = deckA.trackId === 'custom-a' ? (customUrlRef.current.a ?? undefined) : undefined;
    audio.setPlaying('a', playing, bpm, customUrl);
    if (playing) { audio.setCrossfader(mixer.crossfader); incrementStat('deckAPlays'); }
  }, [deckA.trackId, deckA.bpm, mixer.crossfader, audio, updateDeckA, incrementStat]);

  const handlePlayB = useCallback((playing: boolean) => {
    updateDeckB({ isPlaying: playing });
    const track = TRACKS.find(t => t.id === deckB.trackId);
    const bpm = track?.bpm || deckB.bpm;
    const customUrl = deckB.trackId === 'custom-b' ? (customUrlRef.current.b ?? undefined) : undefined;
    audio.setPlaying('b', playing, bpm, customUrl);
    if (playing) { audio.setCrossfader(mixer.crossfader); incrementStat('deckBPlays'); }
  }, [deckB.trackId, deckB.bpm, mixer.crossfader, audio, updateDeckB, incrementStat]);

  const handleCrossfader = useCallback((v: number) => audio.setCrossfader(v), [audio]);

  const handleSelectTrackA = (trackId: string) => {
    const track = TRACKS.find(t => t.id === trackId)!;
    setCustomNameA(null);
    customUrlRef.current.a = null;
    updateDeckA({ trackId, bpm: track.bpm, isPlaying: false, position: 0 });
    audio.setPlaying('a', false, track.bpm);
  };

  const handleSelectTrackB = (trackId: string) => {
    const track = TRACKS.find(t => t.id === trackId)!;
    setCustomNameB(null);
    customUrlRef.current.b = null;
    updateDeckB({ trackId, bpm: track.bpm, isPlaying: false, position: 0 });
    audio.setPlaying('b', false, track.bpm);
  };

  const handleUploadA = (url: string, name: string) => {
    if (customUrlRef.current.a) URL.revokeObjectURL(customUrlRef.current.a);
    customUrlRef.current.a = url;
    setCustomNameA(name);
    updateDeckA({ trackId: 'custom-a', bpm: 128, isPlaying: false, position: 0 });
    audio.setPlaying('a', false, 128, url);
    setMobileTab('a');
  };

  const handleUploadB = (url: string, name: string) => {
    if (customUrlRef.current.b) URL.revokeObjectURL(customUrlRef.current.b);
    customUrlRef.current.b = url;
    setCustomNameB(name);
    updateDeckB({ trackId: 'custom-b', bpm: 128, isPlaying: false, position: 0 });
    audio.setPlaying('b', false, 128, url);
    setMobileTab('b');
  };

  const handleSyncBtoA = useCallback(() => {
    const trackA = TRACKS.find(t => t.id === deckA.trackId);
    const targetBpm = trackA?.bpm || deckA.bpm;
    const trackB = TRACKS.find(t => t.id === deckB.trackId);
    const baseBpmB = trackB?.bpm || deckB.bpm;
    updateDeckB({ pitch: Math.max(-1, Math.min(1, (targetBpm - baseBpmB) / (baseBpmB * 0.08))) });
  }, [deckA.trackId, deckA.bpm, deckB.trackId, deckB.bpm, updateDeckB]);

  const handleSyncAtoB = useCallback(() => {
    const trackB = TRACKS.find(t => t.id === deckB.trackId);
    const targetBpm = trackB?.bpm || deckB.bpm;
    const trackA = TRACKS.find(t => t.id === deckA.trackId);
    const baseBpmA = trackA?.bpm || deckA.bpm;
    updateDeckA({ pitch: Math.max(-1, Math.min(1, (targetBpm - baseBpmA) / (baseBpmA * 0.08))) });
  }, [deckA.trackId, deckA.bpm, deckB.trackId, deckB.bpm, updateDeckA]);

  const handleToggleRecord = useCallback(() => {
    const was = isRecording;
    setIsRecording(r => !r);
    if (was && recordingTime > 0) setShowSaveModal(true);
  }, [isRecording, recordingTime]);

  const handleSaveMix = () => {
    if (!mixName.trim()) return;
    const trackA = TRACKS.find(t => t.id === deckA.trackId);
    const trackB = TRACKS.find(t => t.id === deckB.trackId);
    const comp: Composition = {
      id: `mix-${Date.now()}`,
      name: mixName.trim(),
      createdAt: Date.now(),
      duration: recordingTime,
      trackA: deckA.trackId,
      trackB: deckB.trackId,
      bpmA: trackA?.bpm || deckA.bpm,
      bpmB: trackB?.bpm || deckB.bpm,
      thumbnail: trackA?.color || '#a855f7',
    };
    addComposition(comp);
    setShowSaveModal(false);
    setMixName('');
    setIsRecording(false);
    setRecordingTime(0);
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const bpmA = (() => {
    const t = TRACKS.find(t => t.id === deckA.trackId);
    return Math.round((t?.bpm || deckA.bpm) * (1 + deckA.pitch * 0.08));
  })();
  const bpmB = (() => {
    const t = TRACKS.find(t => t.id === deckB.trackId);
    return Math.round((t?.bpm || deckB.bpm) * (1 + deckB.pitch * 0.08));
  })();

  // ─── Shared deck panels ────────────────────────────────────────────────────

  const DeckAPanel = (
    <div className="rounded-2xl p-4" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
      <Turntable
        deck="A"
        state={deckA}
        onUpdate={updateDeckA}
        onPlay={handlePlayA}
        onCue={() => { updateDeckA({ position: 0, isPlaying: false }); audio.setPlaying('a', false, deckA.bpm); audio.seekTo('a', 0); }}
        onSync={handleSyncAtoB}
        syncBpm={bpmB}
        customTrackName={customNameA ?? undefined}
      />
    </div>
  );

  const MixerPanel = (
    <div className="rounded-2xl py-4" style={{ minWidth: 0, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
      <Mixer onCrossfaderChange={handleCrossfader} />
    </div>
  );

  const DeckBPanel = (
    <div className="rounded-2xl p-4" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
      <Turntable
        deck="B"
        state={deckB}
        onUpdate={updateDeckB}
        onPlay={handlePlayB}
        onCue={() => { updateDeckB({ position: 0, isPlaying: false }); audio.setPlaying('b', false, deckB.bpm); audio.seekTo('b', 0); }}
        onSync={handleSyncBtoA}
        syncBpm={bpmA}
        customTrackName={customNameB ?? undefined}
      />
    </div>
  );

  if (isLandscape) {
    return (
      <LandscapeController
        deckA={deckA}
        deckB={deckB}
        mixer={mixer}
        customNameA={customNameA ?? undefined}
        customNameB={customNameB ?? undefined}
        bpmA={bpmA}
        bpmB={bpmB}
        updateDeckA={updateDeckA}
        updateDeckB={updateDeckB}
        updateMixer={updateMixer}
        onPlayA={handlePlayA}
        onPlayB={handlePlayB}
        onCueA={() => { updateDeckA({ position: 0, isPlaying: false }); audio.setPlaying('a', false, deckA.bpm); audio.seekTo('a', 0); }}
        onCueB={() => { updateDeckB({ position: 0, isPlaying: false }); audio.setPlaying('b', false, deckB.bpm); audio.seekTo('b', 0); }}
        onSyncA={handleSyncAtoB}
        onSyncB={handleSyncBtoA}
        onSelectA={handleSelectTrackA}
        onSelectB={handleSelectTrackB}
        onUploadA={handleUploadA}
        onUploadB={handleUploadB}
        onCrossfaderChange={handleCrossfader}
        getAnalyserDataA={() => audio.getAnalyserData('a')}
        getAnalyserDataB={() => audio.getAnalyserData('b')}
        isRecording={isRecording}
        recordingTime={recordingTime}
        onToggleRecord={handleToggleRecord}
        onBack={() => setPage('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #141414' }}
      >
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: '#555' }}
        >
          <ChevronLeft size={15} />
          <span>Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <Disc3 size={14} style={{ color: '#a855f7' }} />
          <span className="font-black text-white text-sm">DJ Studio</span>
          {isRecording && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
              <span className="text-xs text-red-400 font-mono">{fmt(recordingTime)}</span>
            </motion.div>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPage('achievements')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: '#111', border: '1px solid #1e1e1e', color: '#666' }}
          >
            <Trophy size={11} style={{ color: '#f59e0b' }} />
            <span className="hidden sm:inline">Awards</span>
          </button>
          <button
            onClick={handleToggleRecord}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={isRecording
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444' }
              : { background: '#111', border: '1px solid #1e1e1e', color: '#666' }}
          >
            {isRecording ? '⏹' : '⏺'} <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Rec'}</span>
          </button>
          {!isRecording && recordingTime > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: '#111', border: '1px solid #1e1e1e', color: '#666' }}
            >
              <Save size={11} /> <span className="hidden sm:inline">Save</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-2.5 p-3 flex-1">

        {/* Visualizer row — always visible */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-2.5" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#a855f7' }}>A</span>
              <span className="text-xs font-mono" style={{ color: '#333' }}>{bpmA} BPM</span>
            </div>
            <AudioVisualizer getAnalyserData={() => audio.getAnalyserData('a')} isPlaying={deckA.isPlaying} color="#a855f7" height={32} style="bars" />
            <div className="mt-2">
              <TrackSelector
                deck="A"
                currentTrackId={deckA.trackId}
                currentTrackName={customNameA ?? undefined}
                onSelect={handleSelectTrackA}
                onUpload={handleUploadA}
              />
            </div>
          </div>

          <div className="rounded-xl p-2.5" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#06b6d4' }}>B</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: '#333' }}>{bpmB} BPM</span>
                {deckA.trackId && deckB.trackId && bpmA !== bpmB && (
                  <span className="text-xs font-mono" style={{ color: '#f59e0b66' }}>Δ{Math.abs(bpmA - bpmB)}</span>
                )}
              </div>
            </div>
            <AudioVisualizer getAnalyserData={() => audio.getAnalyserData('b')} isPlaying={deckB.isPlaying} color="#06b6d4" height={32} style="bars" />
            <div className="mt-2">
              <TrackSelector
                deck="B"
                currentTrackId={deckB.trackId}
                currentTrackName={customNameB ?? undefined}
                onSelect={handleSelectTrackB}
                onUpload={handleUploadB}
              />
            </div>
          </div>
        </div>

        {/* MOBILE: tab switcher */}
        <div className="lg:hidden">
          <div className="flex rounded-xl overflow-hidden mb-2.5" style={{ border: '1px solid #1a1a1a' }}>
            {([['a', 'Deck A', '#a855f7'], ['mix', 'Mixer', '#f59e0b'], ['b', 'Deck B', '#06b6d4']] as const).map(([tab, label, color]) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab as MobileTab)}
                className="flex-1 py-2 text-xs font-bold transition-all"
                style={{
                  background: mobileTab === tab ? `${color}18` : 'transparent',
                  color: mobileTab === tab ? color : '#2a2a2a',
                  borderBottom: `2px solid ${mobileTab === tab ? color : 'transparent'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mobileTab}
              initial={{ opacity: 0, x: mobileTab === 'a' ? -12 : mobileTab === 'b' ? 12 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {mobileTab === 'a' && DeckAPanel}
              {mobileTab === 'mix' && MixerPanel}
              {mobileTab === 'b' && DeckBPanel}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DESKTOP: 3-column grid */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_280px_1fr] gap-3 items-start">
          {DeckAPanel}
          {MixerPanel}
          {DeckBPanel}
        </div>
      </div>

      {/* Save Mix Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: '#0f0f0f', border: '1px solid #252525' }}
            >
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">💿</div>
                <h2 className="text-xl font-black text-white">Save Your Mix</h2>
                <p className="text-sm text-white/50 mt-1">
                  {fmt(recordingTime)} · {TRACKS.find(t => t.id === deckA.trackId)?.name || customNameA || 'No track'} × {TRACKS.find(t => t.id === deckB.trackId)?.name || customNameB || 'No track'}
                </p>
              </div>
              <input
                type="text" value={mixName} onChange={e => setMixName(e.target.value)}
                placeholder="Mix name…"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 mb-4 text-sm"
                autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveMix()}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 rounded-xl glass text-white/50 text-sm hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveMix} disabled={!mixName.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  Save Mix 💾
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
