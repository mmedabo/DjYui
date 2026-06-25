import { Knob } from './Knob';
import { useAppStore } from '../../store/appStore';

interface Props {
  onCrossfaderChange?: (v: number) => void;
}

export function Mixer({ onCrossfaderChange }: Props) {
  const { deckA, deckB, mixer, updateDeckA, updateDeckB, updateMixer } = useAppStore();

  const handleCrossfader = (v: number) => {
    const norm = (v + 1) / 2; // -1..1 → 0..1
    updateMixer({ crossfader: norm });
    onCrossfaderChange?.(norm);
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
          <Knob
            value={deckA.eqHigh} min={-1} max={1}
            onChange={v => updateDeckA({ eqHigh: v })}
            label="HIGH" color="#06b6d4" size={44}
          />
          <Knob
            value={deckA.eqMid} min={-1} max={1}
            onChange={v => updateDeckA({ eqMid: v })}
            label="MID" color="#a855f7" size={44}
          />
          <Knob
            value={deckA.eqLow} min={-1} max={1}
            onChange={v => updateDeckA({ eqLow: v })}
            label="LOW" color="#ec4899" size={44}
          />
        </div>
      </div>

      {/* Channel Faders */}
      <div className="flex justify-around w-full gap-4">
        {/* Deck A fader */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-28 flex items-center justify-center">
            <input
              type="range" className="vertical" min={0} max={1} step={0.01}
              value={deckA.volume}
              onChange={e => updateDeckA({ volume: parseFloat(e.target.value) })}
              style={{ height: 100, writingMode: 'vertical-lr', direction: 'rtl' }}
            />
          </div>
          <span className="text-xs text-white/40">A VOL</span>
        </div>

        {/* Master Volume */}
        <div className="flex flex-col items-center gap-2">
          <Knob
            value={mixer.masterVolume} min={0} max={1}
            onChange={v => updateMixer({ masterVolume: v })}
            label="MASTER" color="#f59e0b" size={48}
          />
        </div>

        {/* Deck B fader */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-28 flex items-center justify-center">
            <input
              type="range" className="vertical" min={0} max={1} step={0.01}
              value={deckB.volume}
              onChange={e => updateDeckB({ volume: parseFloat(e.target.value) })}
              style={{ height: 100, writingMode: 'vertical-lr', direction: 'rtl' }}
            />
          </div>
          <span className="text-xs text-white/40">B VOL</span>
        </div>
      </div>

      {/* EQ Section — Deck B */}
      <div className="w-full">
        <div className="text-xs text-cyan-400 text-center uppercase tracking-widest mb-3">Deck B — EQ</div>
        <div className="flex justify-around">
          <Knob
            value={deckB.eqHigh} min={-1} max={1}
            onChange={v => updateDeckB({ eqHigh: v })}
            label="HIGH" color="#06b6d4" size={44}
          />
          <Knob
            value={deckB.eqMid} min={-1} max={1}
            onChange={v => updateDeckB({ eqMid: v })}
            label="MID" color="#a855f7" size={44}
          />
          <Knob
            value={deckB.eqLow} min={-1} max={1}
            onChange={v => updateDeckB({ eqLow: v })}
            label="LOW" color="#ec4899" size={44}
          />
        </div>
      </div>

      {/* FX Section */}
      <div className="w-full">
        <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-3">FX</div>
        <div className="grid grid-cols-3 gap-2">
          <Knob
            value={mixer.fxA.reverb}
            onChange={v => updateMixer({ fxA: { ...mixer.fxA, reverb: v } })}
            label="REV A" color="#a855f7" size={38} min={0} max={1}
          />
          <Knob
            value={mixer.fxA.delay}
            onChange={v => updateMixer({ fxA: { ...mixer.fxA, delay: v } })}
            label="DLY A" color="#a855f7" size={38} min={0} max={1}
          />
          <Knob
            value={mixer.fxA.filter}
            onChange={v => updateMixer({ fxA: { ...mixer.fxA, filter: v } })}
            label="FLT A" color="#a855f7" size={38} min={0} max={1}
          />
          <Knob
            value={mixer.fxB.reverb}
            onChange={v => updateMixer({ fxB: { ...mixer.fxB, reverb: v } })}
            label="REV B" color="#06b6d4" size={38} min={0} max={1}
          />
          <Knob
            value={mixer.fxB.delay}
            onChange={v => updateMixer({ fxB: { ...mixer.fxB, delay: v } })}
            label="DLY B" color="#06b6d4" size={38} min={0} max={1}
          />
          <Knob
            value={mixer.fxB.filter}
            onChange={v => updateMixer({ fxB: { ...mixer.fxB, filter: v } })}
            label="FLT B" color="#06b6d4" size={38} min={0} max={1}
          />
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
