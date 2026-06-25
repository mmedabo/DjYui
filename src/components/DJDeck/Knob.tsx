import { useRef, useCallback, useEffect, useState } from 'react';

interface KnobProps {
  value: number;    // -1 to 1 (center = 0)
  onChange: (v: number) => void;
  label?: string;
  color?: string;
  size?: number;
  min?: number;
  max?: number;
}

export function Knob({ value, onChange, label, color = '#a855f7', size = 48, min = -1, max = 1 }: KnobProps) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(value);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => { setLocalValue(value); }, [value]);

  // Map value from [min,max] to [-1,1] for display
  const normalized = (localValue - min) / (max - min) * 2 - 1;
  // Rotation: -135deg (min) to +135deg (max)
  const rotation = normalized * 135;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = localValue;

    const onMove = (me: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = (startY.current - me.clientY) / 100;
      const range = max - min;
      const newVal = Math.max(min, Math.min(max, startValue.current + delta * range));
      setLocalValue(newVal);
      onChange(newVal);
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [localValue, min, max, onChange]);

  const onDoubleClick = useCallback(() => {
    const center = (min + max) / 2;
    setLocalValue(center);
    onChange(center);
  }, [min, max, onChange]);

  const circumference = Math.PI * (size * 0.35) * 2;
  const trackLength = circumference * 0.75;
  const fillLength = trackLength * ((normalized + 1) / 2);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        className="relative cursor-pointer touch-none"
        style={{ width: size, height: size }}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track background */}
          <circle
            cx={size/2} cy={size/2} r={size*0.35}
            fill="none"
            stroke="#2d2d3a"
            strokeWidth="3"
            strokeDasharray={`${trackLength} ${circumference - trackLength}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135, ${size/2}, ${size/2})`}
          />
          {/* Value fill */}
          <circle
            cx={size/2} cy={size/2} r={size*0.35}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${fillLength} ${circumference - fillLength}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135, ${size/2}, ${size/2})`}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          {/* Knob body */}
          <circle cx={size/2} cy={size/2} r={size*0.28} fill="#1a1a2e" />
          <circle cx={size/2} cy={size/2} r={size*0.28} fill="url(#knobGrad)" opacity="0.5" />
          {/* Indicator line */}
          <line
            x1={size/2} y1={size/2}
            x2={size/2} y2={size*0.18}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${rotation}, ${size/2}, ${size/2})`}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
          <defs>
            <radialGradient id="knobGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {label && (
        <span className="text-xs text-white/50 font-medium tracking-wider uppercase">{label}</span>
      )}
    </div>
  );
}
