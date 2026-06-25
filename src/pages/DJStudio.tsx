import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Save, Volume2, Headphones } from 'lucide-react';
import { Turntable } from '../components/DJDeck/Turntable';
import { Mixer } from '../components/DJDeck/Mixer';
import { Waveform } from '../components/DJDeck/Waveform';
import { TrackSelector } from '../components/DJDeck/TrackSelector';
import { YUICharacter } from '../components/YUI/YUICharacter';
import { useAppStore } from '../store/appStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { TRACKS } from '../data/tracks';
import type { Composition, YUIExpression } from '../types';

const YUI_TIPS = [
  { msg: "Use the crossfader to blend between Deck A and B smoothly! 🎛️", expr: 'teaching' },
  { msg: "Try matching the BPM on both decks before mixing them together! 🥁", expr: 'teaching' },
  { msg: "The EQ knobs control bass, mid, and treble — kill the bass when switching tracks! ⚡", expr: 'encouraging' },
  { msg: "Pitch fader adjusts tempo. Double-click a knob to reset it to center! 🎵", expr: 'neutral' },
  { msg: "Hot cues (1-4) let you jump to marked positions instantly! 🎯", expr: 'excited' },
  { msg: "Try using reverb for smooth track exits! Let it wash out beautifully! ✨", expr: 'excited' },
  { msg: "Loading different BPM tracks? Use the pitch fader to match them! 💪", expr: 'encouraging' },
];

export function DJStudio() {
  const { deckA, deckB, mixer, updateDeckA, updateDeckB, setPage, addComposition } = useAppStore();
  const audio = useAudioEngine();

  const [yuiTipIdx, setYuiTipIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mixName, setMixName] = useState('');
  const [audioStarted, setAudioStarted] = useState(false);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const yuiTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Rotate YUI tips
  useEffect(() => {
    yuiTimerRef.current = setInterval(() => {
      setYuiTipIdx(i => (i + 1) % YUI_TIPS.length);
    }, 8000);
    return () => clearInterval(yuiTimerRef.current);
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      clearInterval(recordTimerRef.current);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [isRecording]);

  const handlePlayA = useCallback((playing: boolean) => {
    setAudioStarted(true);
    updateDeckA({ isPlaying: playing });
    const track = TRACKS.find(t => t.id === deckA.trackId);
    audio.setPlaying('a', playing, track?.bpm || deckA.bpm);
    if (playing) audio.setCrossfader(mixer.crossfader);
  }, [deckA.trackId, deckA.bpm, mixer.crossfader, audio, updateDeckA]);

  const handlePlayB = useCallback((playing: boolean) => {
    setAudioStarted(true);
    updateDeckB({ isPlaying: playing });
    const track = TRACKS.find(t => t.id === deckB.trackId);
    audio.setPlaying('b', playing, track?.bpm || deckB.bpm);
    if (playing) audio.setCrossfader(mixer.crossfader);
  }, [deckB.trackId, deckB.bpm, mixer.crossfader, audio, updateDeckB]);

  const handleCrossfader = useCallback((v: number) => {
    audio.setCrossfader(v);
  }, [audio]);

  const handleSelectTrackA = (trackId: string) => {
    const track = TRACKS.find(t => t.id === trackId)!;
    updateDeckA({ trackId, bpm: track.bpm, isPlaying: false, position: 0 });
    audio.setPlaying('a', false, track.bpm);
  };

  const handleSelectTrackB = (trackId: string) => {
    const track = TRACKS.find(t => t.id === trackId)!;
    updateDeckB({ trackId, bpm: track.bpm, isPlaying: false, position: 0 });
    audio.setPlaying('b', false, track.bpm);
  };

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

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const currentTip = YUI_TIPS[yuiTipIdx];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070710' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(6,182,212,0.04) 0%, transparent 50%)'
        }} className="absolute inset-0" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-sm">Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <Headphones size={16} className="text-purple-400" />
          <span className="font-bold text-white text-sm">DJ Studio</span>
          {isRecording && (
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/40"
            >
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-400 font-mono">{formatTime(recordingTime)}</span>
            </motion.div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsRecording(r => !r); if (isRecording && recordingTime > 0) setShowSaveModal(true); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={isRecording
              ? { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {isRecording ? '⏹ Stop' : '⏺ Record'}
          </button>
          {!isRecording && recordingTime > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold glass text-white/70 hover:text-white flex items-center gap-1"
            >
              <Save size={11} /> Save Mix
            </button>
          )}
        </div>
      </header>

      {/* Main studio layout */}
      <div className="relative z-10 flex flex-col gap-4 p-4 flex-1">
        {/* Waveforms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Deck A</span>
              {deckA.trackId && (
                <span className="text-xs text-white/30 font-mono">{TRACKS.find(t=>t.id===deckA.trackId)?.bpm} BPM</span>
              )}
            </div>
            <Waveform
              trackId={deckA.trackId}
              position={deckA.position}
              isPlaying={deckA.isPlaying}
              color="#a855f7"
            />
            <div className="mt-2">
              <TrackSelector deck="A" currentTrackId={deckA.trackId} onSelect={handleSelectTrackA} />
            </div>
          </div>
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Deck B</span>
              {deckB.trackId && (
                <span className="text-xs text-white/30 font-mono">{TRACKS.find(t=>t.id===deckB.trackId)?.bpm} BPM</span>
              )}
            </div>
            <Waveform
              trackId={deckB.trackId}
              position={deckB.position}
              isPlaying={deckB.isPlaying}
              color="#06b6d4"
            />
            <div className="mt-2">
              <TrackSelector deck="B" currentTrackId={deckB.trackId} onSelect={handleSelectTrackB} />
            </div>
          </div>
        </div>

        {/* Decks + Mixer */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Deck A */}
          <div className="glass rounded-3xl p-4">
            <Turntable
              deck="A"
              state={deckA}
              onUpdate={updateDeckA}
              onPlay={handlePlayA}
              onCue={() => updateDeckA({ position: 0, isPlaying: false })}
            />
          </div>

          {/* Center Mixer */}
          <div className="glass rounded-3xl py-4" style={{ minWidth: 200 }}>
            <Mixer onCrossfaderChange={handleCrossfader} />
          </div>

          {/* Deck B */}
          <div className="glass rounded-3xl p-4">
            <Turntable
              deck="B"
              state={deckB}
              onUpdate={updateDeckB}
              onPlay={handlePlayB}
              onCue={() => updateDeckB({ position: 0, isPlaying: false })}
            />
          </div>
        </div>

        {/* YUI tip bar */}
        <motion.div
          className="glass rounded-2xl p-3 flex items-center gap-3"
          key={yuiTipIdx}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="shrink-0">
            <YUICharacter
              expression={currentTip.expr as YUIExpression}
              size="sm"
              showBubble={false}
              floating={false}
            />
          </div>
          <p className="text-sm text-white/70">{currentTip.msg}</p>
          <button onClick={() => setYuiTipIdx(i => (i + 1) % YUI_TIPS.length)}
            className="shrink-0 text-xs text-white/30 hover:text-white/60 transition-colors">
            next tip →
          </button>
        </motion.div>

        {/* Audio not started notice */}
        {!audioStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-2xl glass-dark text-sm text-white/60 z-50"
          >
            <Volume2 size={14} className="text-purple-400" />
            Click Play on either deck to start the audio engine
          </motion.div>
        )}
      </div>

      {/* Save Mix Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-dark rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">💿</div>
                <h2 className="text-xl font-black text-white">Save Your Mix</h2>
                <p className="text-sm text-white/50 mt-1">
                  {formatTime(recordingTime)} • {TRACKS.find(t=>t.id===deckA.trackId)?.name || 'No track'} × {TRACKS.find(t=>t.id===deckB.trackId)?.name || 'No track'}
                </p>
              </div>

              <input
                type="text"
                value={mixName}
                onChange={e => setMixName(e.target.value)}
                placeholder="Mix name..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 mb-4 text-sm"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveMix()}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 rounded-xl glass text-white/50 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMix}
                  disabled={!mixName.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
                >
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
