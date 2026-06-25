import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, Repeat } from 'lucide-react';
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

export function Turntable({ deck, state, onUpdate, onPlay, onCue, onSync, syncBpm, customTrackName }: Props) {
  const track = TRACKS.find(t => t.id === state.trackId);
  const isDragging = useRef(false);
  const dragStartAngle = useRef(0);
  const [angle, setAngle] = useState(0);
  const animRef = useRef<number | undefined>(undefined);
  const vinylRef = useRef<HTMLDivElement>(null);

  const deckColor = deck === 'A' ? '#a855f7' : '#06b6d4';
  const color = track?.color || deckColor;

  // BPM accounting for pitch: pitch is -1..1 representing ±8% tempo change
  const actualBpm = track ? Math.round(track.bpm * (1 + state.pitch * 0.08)) : state.bpm;
  const pitchPercent = (state.pitch * 8).toFixed(1);

  // Vinyl spin animation
  useEffect(() => {
    if (state.isPlaying && !isDragging.current) {
      const rps = actualBpm / 60 / 4;
      const degPerMs = rps * 360 / 1000;
      let last = performance.now();

      const animate = (now: number) => {
        const delta = now - last;
        last = now;
        setAngle(a => (a + degPerMs * delta) % 360);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [state.isPlaying, actualBpm]);

  // Scratch / jog wheel drag
  const getAngleFromEvent = useCallback((cx: number, cy: number, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(cy - centerY, cx - centerX) * (180 / Math.PI);
  }, []);

  const onVinylMouseDown = useCallback((e: React.MouseEvent) => {
    if (!vinylRef.current) return;
    e.preventDefault();
    isDragging.current = true;
    const rect = vinylRef.current.getBoundingClientRect();
    dragStartAngle.current = angle;
    const startEventAngle = getAngleFromEvent(e.clientX, e.clientY, rect);

    const onMove = (me: MouseEvent) => {
      if (!isDragging.current || !vinylRef.current) return;
      const r = vinylRef.current.getBoundingClientRect();
      const diff = getAngleFromEvent(me.clientX, me.clientY, r) - startEventAngle;
      setAngle((dragStartAngle.current + diff) % 360);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [angle, getAngleFromEvent]);

  const onVinylTouchStart = useCallback((e: React.TouchEvent) => {
    if (!vinylRef.current || e.touches.length === 0) return;
    isDragging.current = true;
    const rect = vinylRef.current.getBoundingClientRect();
    dragStartAngle.current = angle;
    const startEventAngle = getAngleFromEvent(e.touches[0].clientX, e.touches[0].clientY, rect);

    const onMove = (te: TouchEvent) => {
      if (!isDragging.current || !vinylRef.current || te.touches.length === 0) return;
      te.preventDefault();
      const r = vinylRef.current.getBoundingClientRect();
      const diff = getAngleFromEvent(te.touches[0].clientX, te.touches[0].clientY, r) - startEventAngle;
      setAngle((dragStartAngle.current + diff) % 360);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [angle, getAngleFromEvent]);

  // Hot cue handlers
  const handleHotCue = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCues = [...state.cues];
    if (e.shiftKey && newCues[i] !== undefined) {
      // Shift+click: delete cue
      newCues.splice(i, 1, undefined as unknown as number);
      onUpdate({ cues: newCues.filter(c => c !== undefined) as number[] });
    } else if (newCues[i] !== undefined) {
      // Jump to cue
      onUpdate({ position: newCues[i] });
    } else {
      // Set cue at current position
      newCues[i] = state.position;
      onUpdate({ cues: newCues as number[] });
    }
  }, [state.cues, state.position, onUpdate]);

  const canSync = onSync && syncBpm && syncBpm > 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Track info */}
      <div className="text-center w-full">
        <div className="text-xs text-white/30 uppercase tracking-widest mb-1">DECK {deck}</div>
        {(track || customTrackName) ? (
          <>
            <div className="font-bold text-white text-sm leading-tight truncate">{customTrackName ?? track?.name}</div>
            <div className="text-xs text-white/40 truncate">{customTrackName ? 'Your upload' : track?.artist}</div>
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
                style={{ background: color + '22', border: `1px solid ${color}44`, color }}>
                {actualBpm} BPM
              </span>
              {track && <>
                <span className="text-xs rounded px-1.5 py-0.5" style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.5)' }}>{track.key}</span>
                <span className="text-xs text-white/30">{track.genre}</span>
              </>}
            </div>
          </>
        ) : (
          <div className="text-sm text-white/20 italic py-1">No track loaded</div>
        )}
      </div>

      {/* Vinyl record */}
      <div className="relative" style={{ width: 176, height: 176 }}>
        {/* Platter base */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #222238, #0d0d1a)',
            boxShadow: `0 0 30px ${deckColor}18, inset 0 2px 12px rgba(0,0,0,0.9)`,
          }}
        />

        {/* Spinning vinyl */}
        <div
          ref={vinylRef}
          className="absolute inset-2 rounded-full cursor-grab active:cursor-grabbing"
          style={{ transform: `rotate(${angle}deg)` }}
          onMouseDown={onVinylMouseDown}
          onTouchStart={onVinylTouchStart}
        >
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`vg-${deck}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor="#1e1e1e" />
                <stop offset="100%" stopColor="#080808" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="80" r="78" fill={`url(#vg-${deck})`} />
            {/* Grooves */}
            {[18, 24, 30, 38, 46, 54, 60, 66].map(r => (
              <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="#1e1e24" strokeWidth="0.6" />
            ))}
            {/* Colored label */}
            <circle cx="80" cy="80" r="23" fill={color} opacity="0.12" />
            <circle cx="80" cy="80" r="21" fill="#0f0f18" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
            <text x="80" y="76" textAnchor="middle" fill={color} fontSize="5" fontWeight="700" opacity="0.9">
              {track?.genre?.toUpperCase().slice(0, 8) || 'DJ YUI'}
            </text>
            <text x="80" y="84" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="4">
              {track?.name?.slice(0, 12) || ''}
            </text>
            <circle cx="80" cy="80" r="3" fill="#0a0a0f" />
            {/* Reflection */}
            <ellipse cx="62" cy="52" rx="9" ry="3" fill="white" opacity="0.025" transform="rotate(-30,62,52)" />
          </svg>
        </div>

        {/* Center spindle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full border border-zinc-600" style={{ background: '#111' }} />
        </div>

        {/* Playing glow ring */}
        {state.isPlaying && (
          <motion.div
            className="absolute -inset-1.5 rounded-full pointer-events-none"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ border: `2px solid ${deckColor}`, boxShadow: `0 0 16px ${deckColor}` }}
          />
        )}
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCue}
          title="Return to Cue"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors"
          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <SkipBack size={13} />
        </button>

        <button
          onClick={() => onPlay(!state.isPlaying)}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            background: state.isPlaying ? `${deckColor}22` : `linear-gradient(135deg, ${deckColor}dd, ${deckColor}88)`,
            border: `2px solid ${deckColor}`,
            boxShadow: state.isPlaying ? `0 0 18px ${deckColor}60` : `0 4px 12px ${deckColor}40`,
          }}
        >
          {state.isPlaying
            ? <Pause size={16} className="text-white" fill="white" />
            : <Play size={16} className="text-white" fill="white" />}
        </button>

        <button
          onClick={() => onUpdate({ loopActive: !state.loopActive })}
          title="Loop"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: state.loopActive ? `${deckColor}30` : '#1a1a2e',
            border: `1px solid ${state.loopActive ? deckColor : 'rgba(255,255,255,0.08)'}`,
            color: state.loopActive ? deckColor : 'rgba(255,255,255,0.4)',
          }}
        >
          <Repeat size={13} />
        </button>

        {/* SYNC button */}
        {canSync && (
          <button
            onClick={onSync}
            title={`Sync to ${syncBpm} BPM`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-105"
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.5)',
              color: '#10b981',
            }}
          >
            ⟲
          </button>
        )}
      </div>

      {/* Pitch fader */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 uppercase tracking-wider">Pitch</span>
          {state.pitch !== 0 && (
            <button
              onClick={() => onUpdate({ pitch: 0 })}
              className="text-xs text-white/20 hover:text-white/50 transition-colors"
              title="Reset pitch"
            >
              ×
            </button>
          )}
        </div>
        <input
          type="range"
          min={-1} max={1} step={0.005}
          value={state.pitch}
          onChange={e => onUpdate({ pitch: parseFloat(e.target.value) })}
          className="w-28"
          style={{ accentColor: deckColor }}
        />
        <span
          className="text-xs font-mono tabular-nums"
          style={{ color: Math.abs(state.pitch) < 0.01 ? '#10b981' : deckColor }}
        >
          {state.pitch > 0.005 ? '+' : state.pitch < -0.005 ? '' : '±'}{pitchPercent}%
        </span>
      </div>

      {/* Hot Cues */}
      <div className="w-full">
        <div className="text-xs text-white/20 uppercase tracking-widest text-center mb-1.5">Hot Cues</div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map(i => {
            const hasCue = state.cues[i] !== undefined;
            return (
              <button
                key={i}
                onClick={e => handleHotCue(i, e)}
                title={hasCue ? 'Jump to cue · Shift+click to delete' : 'Set hot cue here'}
                className="h-8 rounded-lg text-xs font-bold transition-all hover:brightness-125 active:scale-95 flex flex-col items-center justify-center"
                style={{
                  background: hasCue ? CUE_COLORS[i] + '30' : '#1a1a2e',
                  border: `1px solid ${hasCue ? CUE_COLORS[i] : 'rgba(255,255,255,0.08)'}`,
                  color: hasCue ? CUE_COLORS[i] : 'rgba(255,255,255,0.2)',
                  boxShadow: hasCue ? `0 0 8px ${CUE_COLORS[i]}40` : 'none',
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <p className="text-center text-xs text-white/15 mt-1">Click=jump · Shift+click=delete · Empty=set</p>
      </div>
    </div>
  );
}
