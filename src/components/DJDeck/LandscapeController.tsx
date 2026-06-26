import { useCallback } from 'react';
import { Play, Pause, SkipBack, Repeat, ChevronLeft } from 'lucide-react';
import { Knob } from './Knob';
import { AudioVisualizer } from './AudioVisualizer';
import { TrackSelector } from './TrackSelector';
import type { DeckState, MixerState } from '../../types/index';

const CUE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

interface Props {
  deckA: DeckState;
  deckB: DeckState;
  mixer: MixerState;
  customNameA?: string;
  customNameB?: string;
  bpmA: number;
  bpmB: number;
  updateDeckA: (p: Partial<DeckState>) => void;
  updateDeckB: (p: Partial<DeckState>) => void;
  updateMixer: (p: Partial<MixerState>) => void;
  onPlayA: (v: boolean) => void;
  onPlayB: (v: boolean) => void;
  onCueA: () => void;
  onCueB: () => void;
  onSyncA: () => void;
  onSyncB: () => void;
  onSelectA: (id: string) => void;
  onSelectB: (id: string) => void;
  onUploadA: (url: string, name: string) => void;
  onUploadB: (url: string, name: string) => void;
  onCrossfaderChange: (v: number) => void;
  getAnalyserDataA: () => Uint8Array;
  getAnalyserDataB: () => Uint8Array;
  isRecording: boolean;
  recordingTime: number;
  onToggleRecord: () => void;
  onBack: () => void;
}

const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

function HotCues({
  cues, position, onUpdate,
}: {
  cues: number[]; position: number; color?: string;
  onUpdate: (p: Partial<DeckState>) => void;
}) {
  const handle = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...cues];
    if (e.shiftKey && next[i] !== undefined) {
      next.splice(i, 1, undefined as unknown as number);
      onUpdate({ cues: next.filter(c => c !== undefined) as number[] });
    } else if (next[i] !== undefined) {
      onUpdate({ position: next[i] });
    } else {
      next[i] = position;
      onUpdate({ cues: next as number[] });
    }
  }, [cues, position, onUpdate]);

  return (
    <div className="flex gap-1 w-full">
      {[0, 1, 2, 3].map(i => {
        const active = cues[i] !== undefined;
        return (
          <button
            key={i}
            onClick={e => handle(i, e)}
            title={active ? 'Jump · Shift+click=delete' : 'Set cue'}
            className="flex-1 h-7 rounded-lg text-xs font-bold transition-all active:scale-95"
            style={{
              background: active ? CUE_COLORS[i] + '28' : '#0d0d1e',
              border: `1px solid ${active ? CUE_COLORS[i] : 'rgba(255,255,255,0.05)'}`,
              color: active ? CUE_COLORS[i] : 'rgba(255,255,255,0.15)',
              boxShadow: active ? `0 0 6px ${CUE_COLORS[i]}55` : 'none',
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function Transport({
  isPlaying, loopActive, deckColor,
  onPlay, onCue, onLoop, onSync,
}: {
  isPlaying: boolean; loopActive: boolean; deckColor: string;
  onPlay: () => void; onCue: () => void; onLoop: () => void; onSync: () => void;
}) {
  const btnBase = 'rounded-lg flex items-center justify-center transition-all active:scale-95';
  return (
    <div className="flex items-center gap-1.5 w-full">
      <button onClick={onCue} title="Return to cue"
        className={`${btnBase} w-9 h-9 text-white/40 hover:text-white/70`}
        style={{ background: '#0d0d1e', border: '1px solid rgba(255,255,255,0.05)' }}>
        <SkipBack size={12} />
      </button>

      <button onClick={onPlay}
        className={`${btnBase} flex-1 h-9`}
        style={{
          background: isPlaying ? `${deckColor}22` : `${deckColor}cc`,
          border: `1.5px solid ${deckColor}`,
          boxShadow: isPlaying ? `0 0 14px ${deckColor}66` : `0 0 6px ${deckColor}33`,
        }}>
        {isPlaying
          ? <Pause size={14} fill="white" className="text-white" />
          : <Play size={14} fill="white" className="text-white" />}
      </button>

      <button onClick={onLoop} title="Loop"
        className={`${btnBase} w-9 h-9`}
        style={{
          background: loopActive ? `${deckColor}25` : '#0d0d1e',
          border: `1px solid ${loopActive ? deckColor : 'rgba(255,255,255,0.05)'}`,
          color: loopActive ? deckColor : 'rgba(255,255,255,0.25)',
        }}>
        <Repeat size={12} />
      </button>

      <button onClick={onSync} title="Sync BPM"
        className={`${btnBase} w-9 h-9 text-xs font-bold`}
        style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.35)',
          color: '#10b981',
        }}>
        ⟲
      </button>
    </div>
  );
}

export function LandscapeController({
  deckA, deckB, mixer, customNameA, customNameB,
  bpmA, bpmB, updateDeckA, updateDeckB, updateMixer,
  onPlayA, onPlayB, onCueA, onCueB, onSyncA, onSyncB,
  onSelectA, onSelectB, onUploadA, onUploadB,
  onCrossfaderChange, getAnalyserDataA, getAnalyserDataB,
  isRecording, recordingTime, onToggleRecord, onBack,
}: Props) {
  const cfNorm = (mixer.crossfader * 2) - 1; // -1..1

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none"
      style={{ background: '#06060f', color: 'white' }}
    >
      {/* ── Slim header ──────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between shrink-0 px-3"
        style={{
          height: 36,
          background: '#09091a',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button onClick={onBack} className="flex items-center gap-1 text-white/30 hover:text-white/70 transition-colors">
          <ChevronLeft size={14} />
          <span className="text-xs">Back</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-purple-400">{bpmA} BPM</span>
          <span className="text-xs text-white/15">A</span>

          <button
            onClick={onToggleRecord}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono transition-all"
            style={isRecording
              ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444' }
              : { background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
          >
            {isRecording ? `● ${fmt(recordingTime)}` : '⏺ REC'}
          </button>

          <span className="text-xs text-white/15">B</span>
          <span className="text-xs font-mono font-bold text-cyan-400">{bpmB} BPM</span>
        </div>

        <span className="text-xs font-black tracking-widest text-white/70">DJ YUI</span>
      </header>

      {/* ── Main 3-column controller ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ═══ DECK A ═══════════════════════════════════════════════ */}
        <div
          className="flex flex-col flex-1 min-w-0 px-2.5 py-2 gap-2 overflow-hidden"
          style={{ borderRight: '1px solid rgba(168,85,247,0.12)' }}
        >
          {/* Deck label + pitch info */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-widest" style={{ color: '#a855f7' }}>DECK A</span>
            <div className="flex items-center gap-2">
              {Math.abs(bpmA - bpmB) > 0 && deckB.trackId && (
                <span className="text-xs text-yellow-400/60 font-mono">Δ{Math.abs(bpmA - bpmB)}</span>
              )}
              <span
                className="text-xs font-mono"
                style={{ color: Math.abs(deckA.pitch) < 0.01 ? '#10b981' : '#a855f7' }}
              >
                {deckA.pitch > 0.005 ? '+' : deckA.pitch < -0.005 ? '' : '±'}
                {(deckA.pitch * 8).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Visualizer */}
          <AudioVisualizer
            getAnalyserData={getAnalyserDataA}
            isPlaying={deckA.isPlaying}
            color="#a855f7" height={36} style="bars"
          />

          {/* Track selector */}
          <TrackSelector
            deck="A"
            currentTrackId={deckA.trackId}
            currentTrackName={customNameA}
            onSelect={onSelectA}
            onUpload={onUploadA}
          />

          {/* Hot cues */}
          <HotCues
            cues={deckA.cues} position={deckA.position}
            color="#a855f7" onUpdate={updateDeckA}
          />

          {/* EQ knobs */}
          <div className="flex justify-around">
            {([['eqHigh', 'HIGH'], ['eqMid', 'MID'], ['eqLow', 'LOW']] as const).map(([k, lbl]) => (
              <Knob key={k}
                value={deckA[k]} min={-1} max={1}
                onChange={v => updateDeckA({ [k]: v })}
                label={lbl} color="#a855f7" size={36}
              />
            ))}
          </div>

          {/* Pitch */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/20 shrink-0 w-7">PTCH</span>
            <input
              type="range" min={-1} max={1} step={0.005}
              value={deckA.pitch}
              onChange={e => updateDeckA({ pitch: parseFloat(e.target.value) })}
              className="flex-1"
              style={{ accentColor: '#a855f7' }}
            />
            {deckA.pitch !== 0 && (
              <button
                onClick={() => updateDeckA({ pitch: 0 })}
                className="text-xs text-white/20 hover:text-white/50 shrink-0"
              >×</button>
            )}
          </div>

          {/* Transport */}
          <Transport
            isPlaying={deckA.isPlaying} loopActive={deckA.loopActive}
            deckColor="#a855f7"
            onPlay={() => onPlayA(!deckA.isPlaying)}
            onCue={onCueA}
            onLoop={() => updateDeckA({ loopActive: !deckA.loopActive })}
            onSync={onSyncA}
          />
        </div>

        {/* ═══ MIXER (center) ════════════════════════════════════════ */}
        <div
          className="flex flex-col shrink-0 px-2.5 py-2 gap-2.5 overflow-hidden"
          style={{ width: 188, background: '#08081a' }}
        >
          <div className="text-center">
            <span className="text-xs text-white/15 uppercase tracking-widest">MIXER</span>
          </div>

          {/* Volume faders + master */}
          <div className="flex items-end justify-center gap-3">
            {/* Vol A */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold" style={{ color: '#a855f7', opacity: 0.7 }}>A</span>
              <input
                type="range" min={0} max={1} step={0.01}
                value={deckA.volume}
                onChange={e => updateDeckA({ volume: parseFloat(e.target.value) })}
                style={{
                  height: 72, writingMode: 'vertical-lr', direction: 'rtl',
                  accentColor: '#a855f7',
                }}
              />
              <span className="text-xs text-white/20 font-mono">{Math.round(deckA.volume * 100)}</span>
            </div>

            {/* Master */}
            <div className="flex flex-col items-center gap-1 pb-3">
              <Knob
                value={mixer.masterVolume} min={0} max={1}
                onChange={v => updateMixer({ masterVolume: v })}
                label="MSTR" color="#f59e0b" size={34}
              />
            </div>

            {/* Vol B */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold" style={{ color: '#06b6d4', opacity: 0.7 }}>B</span>
              <input
                type="range" min={0} max={1} step={0.01}
                value={deckB.volume}
                onChange={e => updateDeckB({ volume: parseFloat(e.target.value) })}
                style={{
                  height: 72, writingMode: 'vertical-lr', direction: 'rtl',
                  accentColor: '#06b6d4',
                }}
              />
              <span className="text-xs text-white/20 font-mono">{Math.round(deckB.volume * 100)}</span>
            </div>
          </div>

          {/* Crossfader */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold" style={{ color: '#a855f7' }}>A</span>
              <span className="text-xs text-white/15 uppercase tracking-wider text-center">CF</span>
              <span className="text-xs font-bold" style={{ color: '#06b6d4' }}>B</span>
            </div>
            <div className="relative">
              <input
                type="range" min={-1} max={1} step={0.01}
                value={cfNorm}
                onChange={e => {
                  const norm = (parseFloat(e.target.value) + 1) / 2;
                  updateMixer({ crossfader: norm });
                  onCrossfaderChange(norm);
                }}
                className="w-full"
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              />
            </div>
            <div className="text-center text-xs text-white/20 font-mono">
              {mixer.crossfader === 0.5 ? 'CENTER'
                : mixer.crossfader < 0.5 ? `A ${Math.round((0.5 - mixer.crossfader) * 200)}%`
                : `B ${Math.round((mixer.crossfader - 0.5) * 200)}%`}
            </div>
          </div>

          {/* FX — Deck A */}
          <div>
            <div className="text-xs text-white/15 text-center mb-1.5 uppercase tracking-wider">FX A</div>
            <div className="flex justify-around">
              {(['reverb', 'delay', 'filter'] as const).map(fx => (
                <Knob key={fx}
                  value={mixer.fxA[fx]} min={0} max={1}
                  onChange={v => updateMixer({ fxA: { ...mixer.fxA, [fx]: v } })}
                  label={fx === 'reverb' ? 'REV' : fx === 'delay' ? 'DLY' : 'FLT'}
                  color="#a855f7" size={30}
                />
              ))}
            </div>
          </div>

          {/* FX — Deck B */}
          <div>
            <div className="text-xs text-white/15 text-center mb-1.5 uppercase tracking-wider">FX B</div>
            <div className="flex justify-around">
              {(['reverb', 'delay', 'filter'] as const).map(fx => (
                <Knob key={fx}
                  value={mixer.fxB[fx]} min={0} max={1}
                  onChange={v => updateMixer({ fxB: { ...mixer.fxB, [fx]: v } })}
                  label={fx === 'reverb' ? 'REV' : fx === 'delay' ? 'DLY' : 'FLT'}
                  color="#06b6d4" size={30}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ DECK B ════════════════════════════════════════════════ */}
        <div
          className="flex flex-col flex-1 min-w-0 px-2.5 py-2 gap-2 overflow-hidden"
          style={{ borderLeft: '1px solid rgba(6,182,212,0.12)' }}
        >
          {/* Deck label + pitch info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Math.abs(bpmA - bpmB) > 0 && deckA.trackId && (
                <span className="text-xs text-yellow-400/60 font-mono">Δ{Math.abs(bpmA - bpmB)}</span>
              )}
              <span
                className="text-xs font-mono"
                style={{ color: Math.abs(deckB.pitch) < 0.01 ? '#10b981' : '#06b6d4' }}
              >
                {deckB.pitch > 0.005 ? '+' : deckB.pitch < -0.005 ? '' : '±'}
                {(deckB.pitch * 8).toFixed(1)}%
              </span>
            </div>
            <span className="text-xs font-black tracking-widest" style={{ color: '#06b6d4' }}>DECK B</span>
          </div>

          {/* Visualizer */}
          <AudioVisualizer
            getAnalyserData={getAnalyserDataB}
            isPlaying={deckB.isPlaying}
            color="#06b6d4" height={36} style="bars"
          />

          {/* Track selector */}
          <TrackSelector
            deck="B"
            currentTrackId={deckB.trackId}
            currentTrackName={customNameB}
            onSelect={onSelectB}
            onUpload={onUploadB}
          />

          {/* Hot cues */}
          <HotCues
            cues={deckB.cues} position={deckB.position}
            color="#06b6d4" onUpdate={updateDeckB}
          />

          {/* EQ knobs */}
          <div className="flex justify-around">
            {([['eqHigh', 'HIGH'], ['eqMid', 'MID'], ['eqLow', 'LOW']] as const).map(([k, lbl]) => (
              <Knob key={k}
                value={deckB[k]} min={-1} max={1}
                onChange={v => updateDeckB({ [k]: v })}
                label={lbl} color="#06b6d4" size={36}
              />
            ))}
          </div>

          {/* Pitch */}
          <div className="flex items-center gap-2">
            {deckB.pitch !== 0 && (
              <button
                onClick={() => updateDeckB({ pitch: 0 })}
                className="text-xs text-white/20 hover:text-white/50 shrink-0"
              >×</button>
            )}
            <input
              type="range" min={-1} max={1} step={0.005}
              value={deckB.pitch}
              onChange={e => updateDeckB({ pitch: parseFloat(e.target.value) })}
              className="flex-1"
              style={{ accentColor: '#06b6d4' }}
            />
            <span className="text-xs text-white/20 shrink-0 w-7 text-right">PTCH</span>
          </div>

          {/* Transport (mirrored: sync-loop-play-cue) */}
          <div className="flex items-center gap-1.5 w-full">
            <button onClick={onSyncB} title="Sync BPM"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all active:scale-95"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.35)',
                color: '#10b981',
              }}>
              ⟲
            </button>

            <button onClick={() => updateDeckB({ loopActive: !deckB.loopActive })}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95"
              style={{
                background: deckB.loopActive ? 'rgba(6,182,212,0.2)' : '#0d0d1e',
                border: `1px solid ${deckB.loopActive ? '#06b6d4' : 'rgba(255,255,255,0.05)'}`,
                color: deckB.loopActive ? '#06b6d4' : 'rgba(255,255,255,0.25)',
              }}>
              <Repeat size={12} />
            </button>

            <button onClick={() => onPlayB(!deckB.isPlaying)}
              className="flex-1 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95"
              style={{
                background: deckB.isPlaying ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.8)',
                border: '1.5px solid #06b6d4',
                boxShadow: deckB.isPlaying ? '0 0 14px rgba(6,182,212,0.5)' : '0 0 6px rgba(6,182,212,0.2)',
              }}>
              {deckB.isPlaying
                ? <Pause size={14} fill="white" className="text-white" />
                : <Play size={14} fill="white" className="text-white" />}
            </button>

            <button onClick={onCueB} title="Return to cue"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-all active:scale-95"
              style={{ background: '#0d0d1e', border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkipBack size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
