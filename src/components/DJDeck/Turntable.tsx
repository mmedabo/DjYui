import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, Repeat, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TRACKS } from '../../data/tracks';
import type { DeckState } from '../../types';

interface Props {
  deck: 'A' | 'B';
  state: DeckState;
  onUpdate: (partial: Partial<DeckState>) => void;
  onPlay: (playing: boolean) => void;
  onCue: () => void;
  onSync?: () => void;
  syncBpm?: number;
  customTrackName?: string;
}

const CUE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'];
const BEAT_LOOPS = [0.5, 1, 2, 4, 8, 16];
const BEAT_ROLLS = [0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8];
const BEAT_JUMP_SIZES = [1, 2, 4, 8];
const SAMPLER_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
const STEM_COLORS = { vocal: '#f59e0b', drums: '#ef4444', inst: '#10b981' } as const;

type PadMode = 'hotcue' | 'beatloop' | 'beatroll' | 'beatjump' | 'sampler';

function ToggleBtn({
  active, label, color, onClick,
}: { active: boolean; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all"
      style={{
        background: active ? `${color}22` : '#111',
        border: `1px solid ${active ? color : '#252525'}`,
        color: active ? color : '#3a3a3a',
      }}
    >
      {label}
    </button>
  );
}

export function Turntable({ deck, state, onUpdate, onPlay, onCue, onSync, syncBpm, customTrackName }: Props) {
  const track = TRACKS.find(t => t.id === state.trackId);
  const isDragging = useRef(false);
  const dragStartAngle = useRef(0);
  const [angle, setAngle] = useState(0);
  const [padMode, setPadMode] = useState<PadMode>('hotcue');
  const animRef = useRef<number | undefined>(undefined);
  const vinylRef = useRef<HTMLDivElement>(null);

  const deckColor = deck === 'A' ? '#a855f7' : '#06b6d4';
  const color = track?.color || deckColor;
  const actualBpm = track ? Math.round(track.bpm * (1 + state.pitch * 0.08)) : state.bpm;
  const pitchStr = (state.pitch * 8).toFixed(1);

  useEffect(() => {
    if (state.isPlaying && !isDragging.current) {
      const rps = actualBpm / 60 / 4;
      const degPerMs = rps * 360 / 1000;
      let last = performance.now();
      const animate = (now: number) => {
        const delta = now - last; last = now;
        setAngle(a => (a + degPerMs * delta) % 360);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [state.isPlaying, actualBpm]);

  const getAngle = useCallback((cx: number, cy: number, rect: DOMRect) => {
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    return Math.atan2(cy - y, cx - x) * (180 / Math.PI);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!vinylRef.current) return;
    e.preventDefault();
    isDragging.current = true;
    const rect = vinylRef.current.getBoundingClientRect();
    dragStartAngle.current = angle;
    const startA = getAngle(e.clientX, e.clientY, rect);
    const onMove = (me: MouseEvent) => {
      if (!isDragging.current || !vinylRef.current) return;
      const diff = getAngle(me.clientX, me.clientY, vinylRef.current.getBoundingClientRect()) - startA;
      setAngle((dragStartAngle.current + diff) % 360);
    };
    const onUp = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [angle, getAngle]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!vinylRef.current || !e.touches.length) return;
    isDragging.current = true;
    const rect = vinylRef.current.getBoundingClientRect();
    dragStartAngle.current = angle;
    const startA = getAngle(e.touches[0].clientX, e.touches[0].clientY, rect);
    const onMove = (te: TouchEvent) => {
      if (!isDragging.current || !vinylRef.current || !te.touches.length) return;
      te.preventDefault();
      const diff = getAngle(te.touches[0].clientX, te.touches[0].clientY, vinylRef.current.getBoundingClientRect()) - startA;
      setAngle((dragStartAngle.current + diff) % 360);
    };
    const onUp = () => { isDragging.current = false; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [angle, getAngle]);

  const snapToQuantize = useCallback((pos: number) => {
    if (!state.quantize) return pos;
    // Snap to nearest 1/16 beat (beat loop is 4 bars = 1.0, so 1/16 = 0.0625/4)
    const grid = 0.0625 / 4;
    return Math.round(pos / grid) * grid;
  }, [state.quantize]);

  const handleHotCue = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Use a fixed-size 4-element sparse array (undefined = empty slot)
    const newCues: (number | undefined)[] = [state.cues[0], state.cues[1], state.cues[2], state.cues[3]];
    if (e.shiftKey && newCues[i] !== undefined) {
      newCues[i] = undefined; // clear slot, preserving other slots
      onUpdate({ cues: newCues as number[] });
    } else if (newCues[i] !== undefined) {
      onUpdate({ position: newCues[i] as number });
    } else {
      newCues[i] = snapToQuantize(state.position);
      onUpdate({ cues: newCues as number[] });
    }
  }, [state.cues, state.position, onUpdate, snapToQuantize]);

  const handleBeatLoop = useCallback((beats: number) => {
    // Toggle off if same loop size already active (Pioneer behavior)
    if (state.loopActive && state.beatLoopSize === beats) {
      onUpdate({ loopActive: false });
      return;
    }
    const loopLen = beats / 128; // fraction of our 4-bar loop at 128 BPM base
    onUpdate({
      beatLoopSize: beats,
      loopActive: true,
      loopStart: snapToQuantize(state.position),
      loopEnd: Math.min(1, snapToQuantize(state.position) + loopLen),
    });
  }, [state.position, state.loopActive, state.beatLoopSize, onUpdate, snapToQuantize]);

  const handleBeatJump = useCallback((beats: number) => {
    // beats is signed: negative = backward, positive = forward
    const newPos = Math.max(0, Math.min(1, state.position + beats / 128));
    onUpdate({ position: newPos });
  }, [state.position, onUpdate]);

  const handleBeatRoll = useCallback((beats: number) => {
    if (state.rollActive && state.rollSize === beats) {
      onUpdate({ rollActive: false });
      return;
    }
    const rollLen = beats / 128;
    onUpdate({
      rollActive: true,
      rollSize: beats,
      loopActive: true,
      beatLoopSize: beats,
      loopStart: snapToQuantize(state.position),
      loopEnd: Math.min(1, snapToQuantize(state.position) + rollLen),
    });
  }, [state.position, state.rollActive, state.rollSize, onUpdate, snapToQuantize]);

  const handleSampler = useCallback((i: number) => {
    const newSlots = [...state.samplerSlots] as boolean[];
    newSlots[i] = !newSlots[i];
    onUpdate({ samplerSlots: newSlots });
  }, [state.samplerSlots, onUpdate]);

  const handleStem = useCallback((stem: 'vocal' | 'drums' | 'inst') => {
    onUpdate({ stems: { ...state.stems, [stem]: !state.stems[stem] } });
  }, [state.stems, onUpdate]);

  const canSync = onSync && syncBpm && syncBpm > 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Track info + BPM */}
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="text-xs font-black uppercase tracking-widest" style={{ color: deckColor }}>DECK {deck}</div>
          <div
            className="text-sm font-black font-mono tabular-nums px-2 py-0.5 rounded"
            style={{ background: `${deckColor}18`, color: deckColor }}
          >
            {actualBpm} BPM
          </div>
          <div
            className="text-xs font-mono"
            style={{ color: Math.abs(state.pitch) < 0.01 ? '#10b981' : '#666' }}
          >
            {state.pitch > 0.005 ? '+' : state.pitch < -0.005 ? '' : '±'}{pitchStr}%
          </div>
        </div>

        {(track || customTrackName) ? (
          <>
            <div className="font-bold text-white text-sm truncate">{customTrackName ?? track?.name}</div>
            <div className="text-xs truncate" style={{ color: '#555' }}>
              {customTrackName ? 'Your upload' : `${track?.artist} · ${track?.key} · ${track?.genre}`}
            </div>
          </>
        ) : (
          <div className="text-sm italic" style={{ color: '#2a2a2a' }}>No track loaded</div>
        )}
      </div>

      {/* Vinyl */}
      <div className="relative" style={{ width: 176, height: 176 }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #1a1a1a, #0a0a0a)',
            boxShadow: `0 0 24px ${deckColor}14, inset 0 2px 10px rgba(0,0,0,0.9)`,
          }}
        />
        <div
          ref={vinylRef}
          className="absolute inset-2 rounded-full cursor-grab active:cursor-grabbing"
          style={{ transform: `rotate(${angle}deg)` }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`vg-${deck}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#060606" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="80" r="78" fill={`url(#vg-${deck})`} />
            {[18, 24, 30, 38, 46, 54, 60, 66].map(r => (
              <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="#1c1c1c" strokeWidth="0.7" />
            ))}
            <circle cx="80" cy="80" r="23" fill={color} opacity="0.1" />
            <circle cx="80" cy="80" r="21" fill="#0a0a0a" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
            <text x="80" y="77" textAnchor="middle" fill={color} fontSize="5" fontWeight="700" opacity="0.8">
              {track?.genre?.toUpperCase().slice(0, 8) || 'DJ YUI'}
            </text>
            <text x="80" y="85" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="3.5">
              {track?.name?.slice(0, 14) || ''}
            </text>
            <circle cx="80" cy="80" r="3" fill="#080808" />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full" style={{ background: '#111', border: '1px solid #2a2a2a' }} />
        </div>
        {state.isPlaying && (
          <div
            className="absolute -inset-1.5 rounded-full pointer-events-none"
            style={{
              border: `1.5px solid ${deckColor}`,
              boxShadow: `0 0 12px ${deckColor}55`,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Feature toggles: SLIP · QUANT · KEY */}
      <div className="flex items-center gap-1.5">
        <ToggleBtn active={state.slipMode} label="SLIP" color={deckColor} onClick={() => onUpdate({ slipMode: !state.slipMode })} />
        <ToggleBtn active={state.quantize} label="QUANT" color={deckColor} onClick={() => onUpdate({ quantize: !state.quantize })} />
        <ToggleBtn active={state.keyLock} label="KEY" color={deckColor} onClick={() => onUpdate({ keyLock: !state.keyLock })} />
      </div>

      {/* STEMS: Vocal · Drums · Inst (mute buttons – lit = muted, Pioneer FLX10 style) */}
      <div className="flex items-center gap-1 w-full">
        <span className="text-xs uppercase tracking-widest shrink-0" style={{ color: '#2a2a2a', fontSize: 9 }}>STEMS</span>
        {(['vocal', 'drums', 'inst'] as const).map(stem => (
          <button
            key={stem}
            onClick={() => handleStem(stem)}
            title={`${state.stems[stem] ? 'Unmute' : 'Mute'} ${stem}`}
            className="flex-1 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background: state.stems[stem] ? `${STEM_COLORS[stem]}25` : '#0d0d0d',
              border: `1px solid ${state.stems[stem] ? STEM_COLORS[stem] : '#1e1e1e'}`,
              color: state.stems[stem] ? STEM_COLORS[stem] : '#2a2a2a',
              fontSize: 9,
            }}
          >
            {stem === 'vocal' ? 'VOC' : stem === 'drums' ? 'DRM' : 'INST'}
          </button>
        ))}
      </div>

      {/* Transport */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCue}
          title="Return to Cue"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: '#111', border: '1px solid #1e1e1e', color: '#555' }}
        >
          <SkipBack size={13} />
        </button>

        <button
          onClick={() => onPlay(!state.isPlaying)}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{
            background: state.isPlaying ? `${deckColor}20` : `${deckColor}cc`,
            border: `2px solid ${deckColor}`,
            boxShadow: state.isPlaying ? `0 0 16px ${deckColor}55` : `0 0 8px ${deckColor}33`,
          }}
        >
          {state.isPlaying
            ? <Pause size={16} className="text-white" fill="white" />
            : <Play size={16} className="text-white" fill="white" />}
        </button>

        <button
          onClick={() => onUpdate({ loopActive: !state.loopActive })}
          title="Loop"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: state.loopActive ? `${deckColor}22` : '#111',
            border: `1px solid ${state.loopActive ? deckColor : '#1e1e1e'}`,
            color: state.loopActive ? deckColor : '#444',
          }}
        >
          <Repeat size={13} />
        </button>

        {canSync && (
          <button
            onClick={onSync}
            title={`Sync to ${syncBpm} BPM`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.4)',
              color: '#22c55e',
            }}
          >
            ⟲
          </button>
        )}
      </div>

      {/* Pitch fader */}
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-xs uppercase tracking-widest" style={{ color: '#2a2a2a' }}>Tempo</span>
          {state.pitch !== 0 && (
            <button
              onClick={() => onUpdate({ pitch: 0 })}
              className="text-xs transition-colors"
              style={{ color: '#3a3a3a' }}
            >
              reset
            </button>
          )}
        </div>
        <input
          type="range" min={-1} max={1} step={0.005}
          value={state.pitch}
          onChange={e => onUpdate({ pitch: parseFloat(e.target.value) })}
          className="w-full"
          style={{ accentColor: deckColor }}
        />
      </div>

      {/* Pad mode switcher */}
      <div className="w-full">
        <div className="flex rounded-lg overflow-hidden mb-2" style={{ border: '1px solid #1e1e1e' }}>
          {([
            ['hotcue', 'CUE'],
            ['beatloop', 'LOOP'],
            ['beatroll', 'ROLL'],
            ['beatjump', 'JUMP'],
            ['sampler', 'SMPL'],
          ] as [PadMode, string][]).map(([mode, label], idx, arr) => (
            <button
              key={mode}
              onClick={() => setPadMode(mode)}
              className="flex-1 py-1.5 text-xs font-bold uppercase transition-all"
              style={{
                background: padMode === mode ? `${deckColor}22` : '#0d0d0d',
                color: padMode === mode ? deckColor : '#333',
                borderRight: idx < arr.length - 1 ? '1px solid #1e1e1e' : 'none',
                fontSize: 9,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* HOT CUE pads */}
        {padMode === 'hotcue' && (
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map(i => {
              const hasCue = state.cues[i] !== undefined;
              return (
                <button
                  key={i}
                  onClick={e => handleHotCue(i, e)}
                  title={hasCue ? 'Jump · Shift+click=delete' : 'Set cue'}
                  className="h-9 rounded-lg text-xs font-black transition-all active:scale-95"
                  style={{
                    background: hasCue ? CUE_COLORS[i] + '25' : '#0d0d0d',
                    border: `1px solid ${hasCue ? CUE_COLORS[i] : '#1e1e1e'}`,
                    color: hasCue ? CUE_COLORS[i] : '#2a2a2a',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        )}

        {/* BEAT LOOP pads */}
        {padMode === 'beatloop' && (
          <div className="grid grid-cols-6 gap-1">
            {BEAT_LOOPS.map(beats => {
              const isActive = state.loopActive && state.beatLoopSize === beats;
              return (
                <button
                  key={beats}
                  onClick={() => handleBeatLoop(beats)}
                  className="h-9 rounded-lg text-xs font-black transition-all active:scale-95"
                  style={{
                    background: isActive ? `${deckColor}28` : '#0d0d0d',
                    border: `1px solid ${isActive ? deckColor : '#1e1e1e'}`,
                    color: isActive ? deckColor : '#3a3a3a',
                    boxShadow: isActive ? `0 0 8px ${deckColor}40` : 'none',
                  }}
                >
                  {beats < 1 ? `1/${Math.round(1/beats)}` : beats}
                </button>
              );
            })}
          </div>
        )}

        {/* BEAT ROLL pads – short auto-loops, gated style */}
        {padMode === 'beatroll' && (
          <div className="grid grid-cols-4 gap-1.5">
            {BEAT_ROLLS.map(beats => {
              const isActive = state.rollActive && state.rollSize === beats;
              return (
                <button
                  key={beats}
                  onClick={() => handleBeatRoll(beats)}
                  title={`Roll ${beats < 1 ? `1/${Math.round(1/beats)}` : beats} beats`}
                  className="h-9 rounded-lg text-xs font-black transition-all active:scale-95"
                  style={{
                    background: isActive ? `${deckColor}40` : '#0d0d0d',
                    border: `1px solid ${isActive ? deckColor : '#1e1e1e'}`,
                    color: isActive ? deckColor : '#3a3a3a',
                    boxShadow: isActive ? `0 0 10px ${deckColor}60` : 'none',
                  }}
                >
                  {beats < 1 ? `1/${Math.round(1/beats)}` : beats}
                </button>
              );
            })}
          </div>
        )}

        {/* BEAT JUMP pads */}
        {padMode === 'beatjump' && (
          <div className="grid grid-cols-4 gap-1.5">
            {BEAT_JUMP_SIZES.map(beats => (
              <div key={beats} className="flex flex-col gap-1">
                <button
                  onClick={() => handleBeatJump(-beats)}
                  className="h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                  style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#444' }}
                  title={`Jump back ${beats} beats`}
                >
                  <ChevronsLeft size={11} />
                </button>
                <div className="text-center text-xs font-bold" style={{ color: '#252525' }}>{beats}</div>
                <button
                  onClick={() => handleBeatJump(beats)}
                  className="h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                  style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#444' }}
                  title={`Jump forward ${beats} beats`}
                >
                  <ChevronsRight size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SAMPLER pads – 4 trigger slots */}
        {padMode === 'sampler' && (
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map(i => {
              const isLoaded = state.samplerSlots[i];
              return (
                <button
                  key={i}
                  onClick={() => handleSampler(i)}
                  title={isLoaded ? `Trigger sample ${i + 1}` : `Load sample ${i + 1}`}
                  className="h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                  style={{
                    background: isLoaded ? `${SAMPLER_COLORS[i]}20` : '#0d0d0d',
                    border: `1px solid ${isLoaded ? SAMPLER_COLORS[i] : '#1e1e1e'}`,
                    color: isLoaded ? SAMPLER_COLORS[i] : '#2a2a2a',
                    boxShadow: isLoaded ? `0 0 8px ${SAMPLER_COLORS[i]}40` : 'none',
                    fontSize: 10,
                  }}
                >
                  {isLoaded ? `▶ SMPL ${i + 1}` : `SMPL ${i + 1}`}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs mt-1.5" style={{ color: '#252525' }}>
          {padMode === 'hotcue' && 'Tap=jump · Shift+tap=delete · Empty=set'}
          {padMode === 'beatloop' && 'Loop length in beats'}
          {padMode === 'beatroll' && 'Gated loop · tap again to release'}
          {padMode === 'beatjump' && 'Jump backward ↑ · forward ↓'}
          {padMode === 'sampler' && 'Tap=load/trigger · tap again=unload'}
        </p>
      </div>
    </div>
  );
}
