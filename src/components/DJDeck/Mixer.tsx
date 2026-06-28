import { useRef } from 'react';
import { Knob } from './Knob';
import { useAppStore } from '../../store/appStore';
import type { SweepFxType } from '../../types';

const SWEEP_FX: { key: SweepFxType; label: string }[] = [
  { key: 'filter', label: 'FLT' },
  { key: 'gate', label: 'GATE' },
  { key: 'echo', label: 'ECHO' },
];

function SweepFxRow({ value, color, onChange }: {
  value: SweepFxType; color: string; onChange: (v: SweepFxType) => void;
}) {
  return (
    <div className="flex gap-1 mt-2">
      {SWEEP_FX.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(value === key ? 'off' : key)}
          className="flex-1 py-0.5 rounded text-xs font-bold uppercase transition-all"
          style={{
            background: value === key ? `${color}25` : '#0d0d0d',
            border: `1px solid ${value === key ? color : '#1e1e1e'}`,
            color: value === key ? color : '#2a2a2a',
            fontSize: 9,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface Props {
  onCrossfaderChange?: (v: number) => void;
}

export function Mixer({ onCrossfaderChange }: Props) {
  const { deckA, deckB, mixer, updateDeckA, updateDeckB, updateMixer, incrementStat } = useAppStore();
  const lastEqRef = useRef(0);
  const lastCfRef = useRef(0);

  const handleCrossfader = (v: number) => {
    const norm = (v + 1) / 2; // -1..1 → 0..1
    updateMixer({ crossfader: norm });
    onCrossfaderChange?.(norm);
    const now = Date.now();
    if (now - lastCfRef.current > 800) {
      incrementStat('crossfaderMoves');
      lastCfRef.current = now;
    }
  };

  const trackEq = () => {
    const now = Date.now();
    if (now - lastEqRef.current > 800) {
      incrementStat('eqAdjustments');
      lastEqRef.current = now;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Master section header */}
      <div className="text-center">
        <div className="text-xs text-white/30 uppercase tracking-widest mb-1">MIXER</div>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      </div>

      {/* EQ Section — Deck A */}
      <div className="w-full">
        <div className="text-xs text-purple-400 text-center uppercase tracking-widest mb-3">Deck A — EQ</div>
        <div className="flex justify-around">
          <Knob value={deckA.eqHigh} min={-1} max={1} onChange={v => { updateDeckA({ eqHigh: v }); trackEq(); }} label="HIGH" color="#06b6d4" size={44} />
          <Knob value={deckA.eqMid} min={-1} max={1} onChange={v => { updateDeckA({ eqMid: v }); trackEq(); }} label="MID" color="#a855f7" size={44} />
          <Knob value={deckA.eqLow} min={-1} max={1} onChange={v => { updateDeckA({ eqLow: v }); trackEq(); }} label="LOW" color="#ec4899" size={44} />
        </div>
        {/* Channel Sweep FX — Deck A */}
        <SweepFxRow value={mixer.sweepFxA} color="#a855f7" onChange={v => updateMixer({ sweepFxA: v })} />
      </div>

      {/* Channel Faders */}
      <div className="flex justify-around w-full gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-28 flex items-center justify-center">
            <input type="range" className="vertical" min={0} max={1} step={0.01}
              value={deckA.volume} onChange={e => updateDeckA({ volume: parseFloat(e.target.value) })}
              style={{ height: 100, writingMode: 'vertical-lr', direction: 'rtl' }} />
          </div>
          <span className="text-xs text-white/40">A VOL</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Knob value={mixer.masterVolume} min={0} max={1} onChange={v => updateMixer({ masterVolume: v })} label="MASTER" color="#f59e0b" size={48} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-28 flex items-center justify-center">
            <input type="range" className="vertical" min={0} max={1} step={0.01}
              value={deckB.volume} onChange={e => updateDeckB({ volume: parseFloat(e.target.value) })}
              style={{ height: 100, writingMode: 'vertical-lr', direction: 'rtl' }} />
          </div>
          <span className="text-xs text-white/40">B VOL</span>
        </div>
      </div>

      {/* EQ Section — Deck B */}
      <div className="w-full">
        <div className="text-xs text-cyan-400 text-center uppercase tracking-widest mb-3">Deck B — EQ</div>
        <div className="flex justify-around">
          <Knob value={deckB.eqHigh} min={-1} max={1} onChange={v => { updateDeckB({ eqHigh: v }); trackEq(); }} label="HIGH" color="#06b6d4" size={44} />
          <Knob value={deckB.eqMid} min={-1} max={1} onChange={v => { updateDeckB({ eqMid: v }); trackEq(); }} label="MID" color="#a855f7" size={44} />
          <Knob value={deckB.eqLow} min={-1} max={1} onChange={v => { updateDeckB({ eqLow: v }); trackEq(); }} label="LOW" color="#ec4899" size={44} />
        </div>
        {/* Channel Sweep FX — Deck B */}
        <SweepFxRow value={mixer.sweepFxB} color="#06b6d4" onChange={v => updateMixer({ sweepFxB: v })} />
      </div>

      {/* FX Section — Beat FX knobs */}
      <div className="w-full">
        <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-3">Beat FX</div>
        <div className="grid grid-cols-5 gap-1 mb-2">
          <Knob value={mixer.fxA.reverb} onChange={v => updateMixer({ fxA: { ...mixer.fxA, reverb: v } })} label="REV" color="#a855f7" size={34} min={0} max={1} />
          <Knob value={mixer.fxA.delay} onChange={v => updateMixer({ fxA: { ...mixer.fxA, delay: v } })} label="DLY" color="#a855f7" size={34} min={0} max={1} />
          <Knob value={mixer.fxA.filter} onChange={v => updateMixer({ fxA: { ...mixer.fxA, filter: v } })} label="FLT" color="#a855f7" size={34} min={0} max={1} />
          <Knob value={mixer.fxA.echo} onChange={v => updateMixer({ fxA: { ...mixer.fxA, echo: v } })} label="ECH" color="#a855f7" size={34} min={0} max={1} />
          <Knob value={mixer.fxA.flanger} onChange={v => updateMixer({ fxA: { ...mixer.fxA, flanger: v } })} label="FLG" color="#a855f7" size={34} min={0} max={1} />
        </div>
        <div className="text-xs text-purple-400/40 text-center mb-2" style={{ fontSize: 9 }}>▲ DECK A · DECK B ▼</div>
        <div className="grid grid-cols-5 gap-1">
          <Knob value={mixer.fxB.reverb} onChange={v => updateMixer({ fxB: { ...mixer.fxB, reverb: v } })} label="REV" color="#06b6d4" size={34} min={0} max={1} />
          <Knob value={mixer.fxB.delay} onChange={v => updateMixer({ fxB: { ...mixer.fxB, delay: v } })} label="DLY" color="#06b6d4" size={34} min={0} max={1} />
          <Knob value={mixer.fxB.filter} onChange={v => updateMixer({ fxB: { ...mixer.fxB, filter: v } })} label="FLT" color="#06b6d4" size={34} min={0} max={1} />
          <Knob value={mixer.fxB.echo} onChange={v => updateMixer({ fxB: { ...mixer.fxB, echo: v } })} label="ECH" color="#06b6d4" size={34} min={0} max={1} />
          <Knob value={mixer.fxB.flanger} onChange={v => updateMixer({ fxB: { ...mixer.fxB, flanger: v } })} label="FLG" color="#06b6d4" size={34} min={0} max={1} />
        </div>
      </div>

      {/* Crossfader */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-xs font-bold text-purple-400">A</span>
          <span className="text-xs text-white/30 uppercase tracking-wider">Crossfader</span>
          <span className="text-xs font-bold text-cyan-400">B</span>
        </div>
        <div className="relative w-full">
          <input
            type="range" min={-1} max={1} step={0.01}
            value={(mixer.crossfader * 2) - 1}
            onChange={e => handleCrossfader(parseFloat(e.target.value))}
            className="w-full"
          />
          {/* Center mark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-px h-4 bg-white/20" />
          </div>
        </div>
        {/* Position label */}
        <div className="text-xs text-white/30 font-mono">
          {mixer.crossfader === 0.5 ? 'CENTER'
            : mixer.crossfader < 0.5 ? `A ${Math.round((0.5 - mixer.crossfader) * 200)}%`
            : `B ${Math.round((mixer.crossfader - 0.5) * 200)}%`}
        </div>
      </div>
    </div>
  );
}
