import { useRef, useCallback, useEffect, useState } from 'react';

interface KnobProps {
  value: number;
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
  const currentValue = useRef(value);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    currentValue.current = value;
    setLocalValue(value);
  }, [value]);

  const normalized = (localValue - min) / (max - min) * 2 - 1;
  const rotation = normalized * 135;

  // Fix: read currentValue from ref so callback doesn't need localValue in deps
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = currentValue.current;

    const onMove = (me: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = (startY.current - me.clientY) / 120;
      const range = max - min;
      const newVal = Math.max(min, Math.min(max, startValue.current + delta * range));
      currentValue.current = newVal;
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
  }, [min, max, onChange]); // removed localValue from deps

  const onDoubleClick = useCallback(() => {
    const center = (min + max) / 2;
    currentValue.current = center;
    setLocalValue(center);
    onChange(center);
  }, [min, max, onChange]);

  // Touch support
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    startValue.current = currentValue.current;

    const onMove = (te: TouchEvent) => {
      if (!isDragging.current) return;
      const delta = (startY.current - te.touches[0].clientY) / 120;
      const range = max - min;
      const newVal = Math.max(min, Math.min(max, startValue.current + delta * range));
      currentValue.current = newVal;
      setLocalValue(newVal);
      onChange(newVal);
    };

    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, [min, max, onChange]);

  const circumference = Math.PI * (size * 0.35) * 2;
  const trackLength = circumference * 0.75;
  const fillLength = trackLength * ((normalized + 1) / 2);
  const gradId = `knobGrad-${label?.replace(/\s/g, '')}`;

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        className="relative cursor-pointer touch-none"
        style={{ width: size, height: size }}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        title="Drag up/down · Double-click to reset"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id={gradId} cx="40%" cy="35%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Track background */}
          <circle
            cx={size / 2} cy={size / 2} r={size * 0.35}
            fill="none" stroke="#2d2d3a" strokeWidth="3"
            strokeDasharray={`${trackLength} ${circumference - trackLength}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135, ${size / 2}, ${size / 2})`}
          />
          {/* Value arc */}
          <circle
            cx={size / 2} cy={size / 2} r={size * 0.35}
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${Math.max(0, fillLength)} ${circumference - Math.max(0, fillLength)}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135, ${size / 2}, ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          {/* Knob body */}
          <circle cx={size / 2} cy={size / 2} r={size * 0.28} fill="#1a1a2e" />
          <circle cx={size / 2} cy={size / 2} r={size * 0.28} fill={`url(#${gradId})`} opacity="0.6" />
          {/* Indicator */}
          <line
            x1={size / 2} y1={size / 2}
            x2={size / 2} y2={size * 0.17}
            stroke={color} strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        </svg>
      </div>
      {label && (
        <span className="text-xs text-white/50 font-medium tracking-wider uppercase leading-none">{label}</span>
      )}
    </div>
  );
}
