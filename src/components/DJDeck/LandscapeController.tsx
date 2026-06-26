import { useCallback, useState } from 'react';
import { Play, Pause, SkipBack, Repeat, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Knob } from './Knob';
import { AudioVisualizer } from './AudioVisualizer';
import { TrackSelector } from './TrackSelector';
import type { DeckState, MixerState } from '../../types/index';

const CUE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
const BEAT_LOOPS = [0.5, 1, 2, 4, 8, 16];
const BEAT_JUMP_SIZES = [1, 2, 4, 8];

type PadMode = 'hotcue' | 'beatloop' | 'beatjump';

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

function HotCues({ cues, position, onUpdate }: {
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
            className="flex-1 h-7 rounded-lg text-xs font-black transition-all active:scale-95"
            style={{
              background: active ? CUE_COLORS[i] + '25' : '#111',
              border: `1px solid ${active ? CUE_COLORS[i] : '#1e1e1e'}`,
              color: active ? CUE_COLORS[i] : '#2a2a2a',
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function BeatLoops({ beatLoopSize, loopActive, position, onUpdate }: {
  beatLoopSize: number; loopActive: boolean; position: number;
  onUpdate: (p: Partial<DeckState>) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-0.5 w-full">
      {BEAT_LOOPS.map(beats => {
        const isActive = loopActive && beatLoopSize === beats;
        return (
          <button
            key={beats}
            onClick={() => onUpdate({ beatLoopSize: beats, loopActive: true, loopStart: position, loopEnd: Math.min(1, position + beats / 128) })}
            className="h-6 rounded text-xs font-black transition-all active:scale-95"
            style={{
              background: isActive ? '#a855f715' : '#0d0d0d',
              border: `1px solid ${isActive ? '#a855f7' : '#1e1e1e'}`,
              color: isActive ? '#a855f7' : '#2e2e2e',
              fontSize: 9,
            }}
          >
            {beats < 1 ? `1/${Math.round(1/beats)}` : beats}
          </button>
        );
      })}
    </div>
  );
}

function BeatJumps({ position, onUpdate }: { position: number; onUpdate: (p: Partial<DeckState>) => void }) {
  return (
    <div className="grid grid-cols-4 gap-0.5 w-full">
      {BEAT_JUMP_SIZES.map(beats => (
        <div key={beats} className="flex flex-col gap-0.5">
          <button
            onClick={() => onUpdate({ position: Math.max(0, position - beats / 128) })}
            className="h-6 rounded flex items-center justify-center transition-all active:scale-95"
            style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#333' }}
          >
            <ChevronsLeft size={10} />
          </button>
          <div className="text-center" style={{ fontSize: 8, color: '#222' }}>{beats}</div>
          <button
            onClick={() => onUpdate({ position: Math.min(1, position + beats / 128) })}
            className="h-6 rounded flex items-center justify-center transition-all active:scale-95"
            style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#333' }}
          >
            <ChevronsRight size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PadSection({ deck, padMode, onUpdate, deckColor }: {
  deck: DeckState; padMode: PadMode; onUpdate: (p: Partial<DeckState>) => void; deckColor: string;
}) {
  void deckColor;
  if (padMode === 'hotcue') return <HotCues cues={deck.cues} position={deck.position} onUpdate={onUpdate} />;
  if (padMode === 'beatloop') return <BeatLoops beatLoopSize={deck.beatLoopSize} loopActive={deck.loopActive} position={deck.position} onUpdate={onUpdate} />;
  return <BeatJumps position={deck.position} onUpdate={onUpdate} />;
}

function FeatureToggles({ deck, onUpdate, color }: { deck: DeckState; onUpdate: (p: Partial<DeckState>) => void; color: string }) {
  const tog = (key: 'slipMode' | 'keyLock' | 'quantize') => () => onUpdate({ [key]: !deck[key] });
  return (
    <div className="flex gap-1 w-full">
      {([['slipMode', 'SLIP'], ['quantize', 'QUANT'], ['keyLock', 'KEY']] as const).map(([k, lbl]) => (
        <button
          key={k}
          onClick={tog(k)}
          className="flex-1 py-1 rounded text-xs font-bold uppercase transition-all"
          style={{
            background: deck[k] ? `${color}20` : '#0d0d0d',
            border: `1px solid ${deck[k] ? color : '#1e1e1e'}`,
            color: deck[k] ? color : '#252525',
            fontSize: 9,
          }}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}

function DeckColumn({
  deck, deckId, bpm, otherBpm, customName,
  onPlay, onCue, onSync, onUpdate,
  onSelect, onUpload, getAnalyserData,
}: {
  deck: DeckState; deckId: 'A' | 'B'; bpm: number; otherBpm: number; customName?: string;
  onPlay: (v: boolean) => void; onCue: () => void; onSync: () => void;
  onUpdate: (p: Partial<DeckState>) => void;
  onSelect: (id: string) => void; onUpload: (url: string, name: string) => void;
  getAnalyserData: () => Uint8Array;
}) {
  const [padMode, setPadMode] = useState<PadMode>('hotcue');
  const deckColor = deckId === 'A' ? '#a855f7' : '#06b6d4';
  const pitchStr = (deck.pitch * 8).toFixed(1);
  const isA = deckId === 'A';

  return (
    <div
      className="flex flex-col flex-1 min-w-0 px-2 py-1.5 gap-1.5 overflow-hidden"
      style={{ borderRight: isA ? '1px solid #1a1a1a' : undefined, borderLeft: !isA ? '1px solid #1a1a1a' : undefined }}
    >
      {/* Deck label + BPM */}
      <div className={`flex items-center justify-between ${!isA ? 'flex-row-reverse' : ''}`}>
        <span className="text-xs font-black tracking-widest" style={{ color: deckColor }}>DECK {deckId}</span>
        <div className={`flex items-center gap-2 ${!isA ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-black font-mono" style={{ color: deckColor }}>{bpm}</span>
          {Math.abs(bpm - otherBpm) > 0 && (
            <span className="text-xs font-mono" style={{ color: '#f59e0b44', fontSize: 9 }}>Δ{Math.abs(bpm - otherBpm)}</span>
          )}
          <span className="text-xs font-mono" style={{ color: Math.abs(deck.pitch) < 0.01 ? '#22c55e' : '#444', fontSize: 9 }}>
            {deck.pitch > 0.005 ? '+' : deck.pitch < -0.005 ? '' : '±'}{pitchStr}%
          </span>
        </div>
      </div>

      {/* Visualizer */}
      <AudioVisualizer getAnalyserData={getAnalyserData} isPlaying={deck.isPlaying} color={deckColor} height={28} style="bars" />

      {/* Track selector */}
      <TrackSelector deck={deckId} currentTrackId={deck.trackId} currentTrackName={customName} onSelect={onSelect} onUpload={onUpload} />

      {/* Feature toggles */}
      <FeatureToggles deck={deck} onUpdate={onUpdate} color={deckColor} />

      {/* Pad mode tabs */}
      <div className="flex rounded overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
        {(['hotcue', 'beatloop', 'beatjump'] as PadMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setPadMode(mode)}
            className="flex-1 py-1 text-xs font-black uppercase transition-all"
            style={{
              background: padMode === mode ? `${deckColor}20` : '#0a0a0a',
              color: padMode === mode ? deckColor : '#252525',
              borderRight: mode !== 'beatjump' ? '1px solid #1a1a1a' : 'none',
              fontSize: 9,
            }}
          >
            {mode === 'hotcue' ? 'CUE' : mode === 'beatloop' ? 'LOOP' : 'JUMP'}
          </button>
        ))}
      </div>

      {/* Pads */}
      <PadSection deck={deck} padMode={padMode} onUpdate={onUpdate} deckColor={deckColor} />

      {/* EQ knobs */}
      <div className="flex justify-around">
        {([['eqHigh', 'H'], ['eqMid', 'M'], ['eqLow', 'L']] as const).map(([k, lbl]) => (
          <Knob key={k} value={deck[k]} min={-1} max={1} onChange={v => onUpdate({ [k]: v })} label={lbl} color={deckColor} size={32} />
        ))}
      </div>

      {/* Pitch */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs shrink-0" style={{ color: '#252525', fontSize: 9 }}>TEMPO</span>
        <input
          type="range" min={-1} max={1} step={0.005}
          value={deck.pitch}
          onChange={e => onUpdate({ pitch: parseFloat(e.target.value) })}
          className="flex-1"
          style={{ accentColor: deckColor }}
        />
        {deck.pitch !== 0 && (
          <button onClick={() => onUpdate({ pitch: 0 })} className="text-xs shrink-0" style={{ color: '#2a2a2a' }}>×</button>
        )}
      </div>

      {/* Transport */}
      <div className={`flex items-center gap-1 w-full ${!isA ? 'flex-row-reverse' : ''}`}>
        <button onClick={onCue}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
          style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#3a3a3a' }}>
          <SkipBack size={11} />
        </button>

        <button onClick={() => onPlay(!deck.isPlaying)}
          className="flex-1 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
          style={{
            background: deck.isPlaying ? `${deckColor}20` : `${deckColor}bb`,
            border: `1.5px solid ${deckColor}`,
            boxShadow: deck.isPlaying ? `0 0 10px ${deckColor}44` : 'none',
          }}>
          {deck.isPlaying ? <Pause size={13} fill="white" className="text-white" /> : <Play size={13} fill="white" className="text-white" />}
        </button>

        <button onClick={() => onUpdate({ loopActive: !deck.loopActive })}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
          style={{
            background: deck.loopActive ? `${deckColor}20` : '#0d0d0d',
            border: `1px solid ${deck.loopActive ? deckColor : '#1e1e1e'}`,
            color: deck.loopActive ? deckColor : '#2a2a2a',
          }}>
          <Repeat size={11} />
        </button>

        <button onClick={onSync}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all active:scale-95"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
          ⟲
        </button>
      </div>
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
  const cfNorm = (mixer.crossfader * 2) - 1;

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none"
      style={{ background: '#080808', color: 'white' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between shrink-0 px-3"
        style={{ height: 32, background: '#0a0a0a', borderBottom: '1px solid #141414' }}
      >
        <button onClick={onBack} className="flex items-center gap-1 transition-colors" style={{ color: '#3a3a3a' }}>
          <ChevronLeft size={13} />
          <span className="text-xs">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black font-mono" style={{ color: '#a855f7' }}>{bpmA}</span>
          <span className="text-xs" style={{ color: '#1e1e1e' }}>BPM</span>

          <button
            onClick={onToggleRecord}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono transition-all"
            style={isRecording
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }
              : { background: 'transparent', border: '1px solid #1e1e1e', color: '#2a2a2a' }}
          >
            {isRecording ? `● ${fmt(recordingTime)}` : '⏺ REC'}
          </button>

          <span className="text-xs" style={{ color: '#1e1e1e' }}>BPM</span>
          <span className="text-xs font-black font-mono" style={{ color: '#06b6d4' }}>{bpmB}</span>
        </div>

        <span className="text-xs font-black tracking-widest" style={{ color: '#252525' }}>DJ YUI</span>
      </header>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* DECK A */}
        <DeckColumn
          deck={deckA} deckId="A" bpm={bpmA} otherBpm={bpmB} customName={customNameA}
          onPlay={onPlayA} onCue={onCueA} onSync={onSyncA} onUpdate={updateDeckA}
          onSelect={onSelectA} onUpload={onUploadA} getAnalyserData={getAnalyserDataA}
        />

        {/* MIXER */}
        <div
          className="flex flex-col shrink-0 px-2 py-1.5 gap-2 overflow-hidden"
          style={{ width: 176, background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}
        >
          <div className="text-center">
            <span className="text-xs font-black tracking-widest" style={{ color: '#252525' }}>MIXER</span>
          </div>

          {/* Channel faders + master */}
          <div className="flex items-end justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-black" style={{ color: '#a855f755', fontSize: 9 }}>A</span>
              <input
                type="range" min={0} max={1} step={0.01}
                value={deckA.volume}
                onChange={e => updateDeckA({ volume: parseFloat(e.target.value) })}
                style={{ height: 64, writingMode: 'vertical-lr', direction: 'rtl', accentColor: '#a855f7' }}
              />
              <span className="text-xs font-mono" style={{ color: '#1e1e1e', fontSize: 9 }}>{Math.round(deckA.volume * 100)}</span>
            </div>

            <div className="flex flex-col items-center gap-1 pb-2">
              <Knob value={mixer.masterVolume} min={0} max={1} onChange={v => updateMixer({ masterVolume: v })} label="MSTR" color="#f59e0b" size={32} />
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-black" style={{ color: '#06b6d455', fontSize: 9 }}>B</span>
              <input
                type="range" min={0} max={1} step={0.01}
                value={deckB.volume}
                onChange={e => updateDeckB({ volume: parseFloat(e.target.value) })}
                style={{ height: 64, writingMode: 'vertical-lr', direction: 'rtl', accentColor: '#06b6d4' }}
              />
              <span className="text-xs font-mono" style={{ color: '#1e1e1e', fontSize: 9 }}>{Math.round(deckB.volume * 100)}</span>
            </div>
          </div>

          {/* Crossfader */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between px-0.5">
              <span className="text-xs font-black" style={{ color: '#a855f766', fontSize: 9 }}>A</span>
              <span className="text-xs" style={{ color: '#1a1a1a', fontSize: 9 }}>CROSSFADER</span>
              <span className="text-xs font-black" style={{ color: '#06b6d466', fontSize: 9 }}>B</span>
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 pointer-events-none"
                style={{ background: '#1e1e1e' }} />
            </div>
            <div className="text-center font-mono" style={{ color: '#252525', fontSize: 9 }}>
              {mixer.crossfader === 0.5 ? 'CENTER'
                : mixer.crossfader < 0.5 ? `A ${Math.round((0.5 - mixer.crossfader) * 200)}%`
                : `B ${Math.round((mixer.crossfader - 0.5) * 200)}%`}
            </div>
          </div>

          {/* FX A */}
          <div>
            <div className="text-center mb-1" style={{ color: '#1e1e1e', fontSize: 9 }}>FX A</div>
            <div className="flex justify-around">
              {(['reverb', 'delay', 'filter'] as const).map(fx => (
                <Knob key={fx}
                  value={mixer.fxA[fx]} min={0} max={1}
                  onChange={v => updateMixer({ fxA: { ...mixer.fxA, [fx]: v } })}
                  label={fx === 'reverb' ? 'REV' : fx === 'delay' ? 'DLY' : 'FLT'}
                  color="#a855f7" size={26}
                />
              ))}
            </div>
          </div>

          {/* FX B */}
          <div>
            <div className="text-center mb-1" style={{ color: '#1e1e1e', fontSize: 9 }}>FX B</div>
            <div className="flex justify-around">
              {(['reverb', 'delay', 'filter'] as const).map(fx => (
                <Knob key={fx}
                  value={mixer.fxB[fx]} min={0} max={1}
                  onChange={v => updateMixer({ fxB: { ...mixer.fxB, [fx]: v } })}
                  label={fx === 'reverb' ? 'REV' : fx === 'delay' ? 'DLY' : 'FLT'}
                  color="#06b6d4" size={26}
                />
              ))}
            </div>
          </div>
        </div>

        {/* DECK B */}
        <DeckColumn
          deck={deckB} deckId="B" bpm={bpmB} otherBpm={bpmA} customName={customNameB}
          onPlay={onPlayB} onCue={onCueB} onSync={onSyncB} onUpdate={updateDeckB}
          onSelect={onSelectB} onUpload={onUploadB} getAnalyserData={getAnalyserDataB}
        />
      </div>
    </div>
  );
}
