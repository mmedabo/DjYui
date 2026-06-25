import { useEffect, useRef, useState } from 'react';
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
}

export function Turntable({ deck, state, onUpdate, onPlay, onCue }: Props) {
  const track = TRACKS.find(t => t.id === state.trackId);
  const isDragging = useRef(false);
  const [angle, setAngle] = useState(0);
  const animRef = useRef<number | undefined>(undefined);

  // Animate vinyl spinning
  useEffect(() => {
    if (state.isPlaying && !isDragging.current) {
      const rps = state.bpm / 60 / 4; // rotations per second at 4 beats per rotation
      const degreesPerMs = rps * 360 / 1000;
      let lastTime = performance.now();

      const animate = (now: number) => {
        const delta = now - lastTime;
        lastTime = now;
        setAngle(a => (a + degreesPerMs * delta) % 360);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [state.isPlaying, state.bpm, isDragging]);

  const color = track?.color || (deck === 'A' ? '#a855f7' : '#06b6d4');
  const deckColor = deck === 'A' ? '#a855f7' : '#06b6d4';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Track info */}
      <div className="text-center">
        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">DECK {deck}</div>
        {track ? (
          <>
            <div className="font-bold text-white text-sm leading-tight">{track.name}</div>
            <div className="text-xs text-white/50">{track.artist}</div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-mono"
                style={{ background: color + '33', border: `1px solid ${color}44` }}>
                {track.bpm + Math.round(state.pitch * 8)} BPM
              </span>
              <span className="text-xs text-white/40">{track.key}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-white/30 italic">No track loaded</div>
        )}
      </div>

      {/* Vinyl record */}
      <div className="relative" style={{ width: 180, height: 180 }}>
        {/* Platter */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, #1a1a2e 0%, #0d0d1a 100%)',
            boxShadow: `0 0 30px ${deckColor}22, inset 0 2px 10px rgba(0,0,0,0.8)`,
          }}
        />

        {/* Rotating vinyl */}
        <motion.div
          className="absolute inset-2 rounded-full cursor-grab active:cursor-grabbing"
          style={{ rotate: angle }}
        >
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`vinyl-${deck}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </radialGradient>
            </defs>

            {/* Vinyl base */}
            <circle cx="80" cy="80" r="78" fill={`url(#vinyl-${deck})`} />

            {/* Grooves */}
            {[20, 28, 36, 44, 52, 58, 64].map((r) => (
              <circle key={r} cx="80" cy="80" r={r}
                fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
            ))}

            {/* Label */}
            <circle cx="80" cy="80" r="22" fill={color} opacity="0.15" />
            <circle cx="80" cy="80" r="20" fill="#111" stroke={color} strokeWidth="1" opacity="0.8" />

            {/* Label design */}
            <text x="80" y="76" textAnchor="middle" fill={color} fontSize="5" fontWeight="bold">
              {track?.genre?.toUpperCase() || 'DJ'}
            </text>
            <text x="80" y="83" textAnchor="middle" fill="white" fontSize="4.5" opacity="0.7">
              {track?.name?.slice(0, 10) || 'YUI'}
            </text>

            {/* Spindle hole */}
            <circle cx="80" cy="80" r="3" fill="#0a0a0f" />

            {/* Highlight streak */}
            <ellipse cx="65" cy="55" rx="8" ry="3"
              fill="white" opacity="0.03"
              transform="rotate(-30, 65, 55)" />
          </svg>
        </motion.div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700" />
        </div>

        {/* Playing indicator */}
        {state.isPlaying && (
          <motion.div
            className="absolute -inset-1 rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ border: `2px solid ${deckColor}`, boxShadow: `0 0 15px ${deckColor}` }}
          />
        )}
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCue}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors"
          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
          title="Cue"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => onPlay(!state.isPlaying)}
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all"
          style={{
            background: state.isPlaying
              ? `${deckColor}22`
              : `linear-gradient(135deg, ${deckColor}, ${deckColor}aa)`,
            border: `2px solid ${deckColor}`,
            boxShadow: state.isPlaying ? `0 0 15px ${deckColor}60` : 'none',
          }}
        >
          {state.isPlaying
            ? <Pause size={18} fill="white" className="text-white" />
            : <Play size={18} fill="white" className="text-white" />
          }
        </button>
        <button
          onClick={() => onUpdate({ loopActive: !state.loopActive })}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: state.loopActive ? `${deckColor}33` : '#1a1a2e',
            border: `1px solid ${state.loopActive ? deckColor : 'rgba(255,255,255,0.1)'}`,
            color: state.loopActive ? deckColor : 'rgba(255,255,255,0.6)',
          }}
          title="Loop"
        >
          <Repeat size={14} />
        </button>
      </div>

      {/* Pitch fader */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Pitch</span>
        <div className="relative h-24 flex items-center">
          <input
            type="range"
            className="vertical"
            min={-1} max={1} step={0.01}
            value={state.pitch}
            onChange={e => onUpdate({ pitch: parseFloat(e.target.value) })}
            style={{ height: 88, writingMode: 'vertical-lr', direction: 'rtl' }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: state.pitch === 0 ? '#10b981' : deckColor }}>
          {state.pitch > 0 ? '+' : ''}{(state.pitch * 8).toFixed(1)}%
        </span>
      </div>

      {/* Hot Cues */}
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => {
          const cueColors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'];
          return (
            <button
              key={i}
              className="w-9 h-9 rounded-lg text-xs font-bold transition-all hover:brightness-125 active:scale-95"
              style={{
                background: state.cues[i] !== undefined ? cueColors[i] + '33' : '#1a1a2e',
                border: `1px solid ${state.cues[i] !== undefined ? cueColors[i] : 'rgba(255,255,255,0.1)'}`,
                color: state.cues[i] !== undefined ? cueColors[i] : 'rgba(255,255,255,0.3)',
              }}
              title={`Hot Cue ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
