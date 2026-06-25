import { motion } from 'framer-motion';
import type { YUIExpression } from '../../types';

interface Props {
  expression?: YUIExpression;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBubble?: boolean;
  message?: string;
  floating?: boolean;
}

const SIZES = { sm: 72, md: 120, lg: 190, hero: 300 };

const EXPRESSION_CFG: Record<YUIExpression, { glowA: string; glowB: string; duration: number }> = {
  excited:     { glowA: '#ff00ff', glowB: '#ff1493', duration: 1.5 },
  celebrating: { glowA: '#ffcc00', glowB: '#ff00ff', duration: 1.2 },
  teaching:    { glowA: '#00ffff', glowB: '#0066ff', duration: 4   },
  encouraging: { glowA: '#ff6600', glowB: '#ff00aa', duration: 2.5 },
  neutral:     { glowA: '#cc00ff', glowB: '#00aaff', duration: 5   },
  thinking:    { glowA: '#0055ff', glowB: '#cc00ff', duration: 7   },
};

export function YUICharacter({
  expression = 'neutral',
  size = 'md',
  showBubble = false,
  message = '',
  floating = true,
}: Props) {
  const cfg = EXPRESSION_CFG[expression];
  const dim = SIZES[size];
  const uid = `yui-${expression}-${size}`;

  return (
    <motion.div
      className="relative inline-block select-none"
      animate={floating ? { y: [0, -10, 0] } : {}}
      transition={floating ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ bottom: '100%', marginBottom: 8, minWidth: 180, maxWidth: 260 }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.92)',
            border: `1px solid ${cfg.glowA}66`,
            boxShadow: `0 0 16px ${cfg.glowA}40, 0 0 40px ${cfg.glowA}18`,
            borderRadius: 14,
            padding: '9px 14px',
            color: '#fff',
            fontSize: 11,
            lineHeight: 1.6,
            textAlign: 'center',
          }}>
            {message}
          </div>
          <div style={{
            position: 'absolute',
            bottom: -7,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: `7px solid ${cfg.glowA}66`,
          }} />
        </motion.div>
      )}

      {/* Neon Dancer SVG */}
      <motion.svg
        width={dim}
        height={dim * 2}
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
        animate={{
          filter: [
            `drop-shadow(0 0 5px ${cfg.glowA}) drop-shadow(0 0 16px ${cfg.glowA}88)`,
            `drop-shadow(0 0 8px ${cfg.glowB}) drop-shadow(0 0 24px ${cfg.glowB}88)`,
            `drop-shadow(0 0 5px ${cfg.glowA}) drop-shadow(0 0 16px ${cfg.glowA}88)`,
          ],
        }}
        transition={{ duration: cfg.duration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          {/* Rainbow gradient — top (pink/purple) → bottom (cyan/blue) */}
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#cc00ff" />
            <stop offset="12%"  stopColor="#ff1493" />
            <stop offset="28%"  stopColor="#ff4400" />
            <stop offset="48%"  stopColor="#ff8800" />
            <stop offset="64%"  stopColor="#ffcc00" />
            <stop offset="80%"  stopColor="#00ff88" />
            <stop offset="90%"  stopColor="#00ffcc" />
            <stop offset="100%" stopColor="#00aaff" />
          </linearGradient>

          {/* Combined glow filter: wide bloom + tight glow + crisp line */}
          <filter id={`glow-${uid}`} x="-40%" y="-20%" width="180%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="2.5" result="b1"/>
            <feGaussianBlur stdDeviation="6"   result="b2"/>
            <feMerge>
              <feMergeNode in="b2"/>
              <feMergeNode in="b1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g
          filter={`url(#glow-${uid})`}
          stroke={`url(#grad-${uid})`}
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* ── HEADPHONES ── */}
          <path d="M 72,42 Q 72,18 100,16 Q 128,18 128,42" />
          <ellipse cx="69"  cy="50" rx="10" ry="12" />
          <ellipse cx="131" cy="50" rx="10" ry="12" />
          <line x1="69"  y1="62" x2="68"  y2="72" />
          <line x1="131" y1="62" x2="132" y2="72" />

          {/* ── HEAD ── */}
          <circle cx="100" cy="66" r="22" />

          {/* Face features */}
          <path d="M 91,63 Q 93,60 96,63" strokeWidth="1.8" />
          <path d="M 104,63 Q 107,60 110,63" strokeWidth="1.8" />
          <path d="M 94,72 Q 100,77 106,72" strokeWidth="1.8" />

          {/* ── HAIR – wild & energetic ── */}
          <path d="M 84,47 Q 66,32 52,40 Q 42,50 48,64" />
          <path d="M 80,44 Q 60,26 44,32 Q 36,44 42,58" />
          <path d="M 88,44 Q 74,28 66,34 Q 59,42 64,54" />
          <path d="M 116,47 Q 134,32 148,40 Q 158,50 152,64" />
          <path d="M 120,44 Q 140,26 156,32 Q 164,44 158,58" />
          <path d="M 112,44 Q 126,28 134,34 Q 141,42 136,54" />
          <path d="M 93,45 Q 87,28 80,22 Q 75,16 70,18" />
          <path d="M 107,45 Q 113,28 120,22 Q 125,16 130,18" />
          <path d="M 100,44 Q 100,27 95,18 Q 92,11 89,9" />

          {/* ── NECK ── */}
          <line x1="94"  y1="88" x2="93"  y2="100" />
          <line x1="106" y1="88" x2="107" y2="100" />

          {/* ── SHOULDERS ── */}
          <path d="M 93,100 Q 74,104 56,112" />
          <path d="M 107,100 Q 126,104 144,112" />

          {/* ── LEFT ARM (raised, gesture) ── */}
          <path d="M 56,112 Q 38,108 22,102 Q 14,98 12,90" />
          <path d="M 12,90 Q 8,84 13,80"  strokeWidth="1.6" />
          <path d="M 13,90 Q 6,88 9,82"   strokeWidth="1.6" />
          <path d="M 12,90 Q 8,95 12,98"  strokeWidth="1.6" />

          {/* ── RIGHT ARM (forward / DJ mixing gesture) ── */}
          <path d="M 144,112 Q 160,120 172,132 Q 178,141 174,152" />
          <path d="M 174,152 Q 176,158 172,161" strokeWidth="1.6" />
          <path d="M 173,153 Q 179,157 176,163" strokeWidth="1.6" />
          <path d="M 175,152 Q 180,148 182,155" strokeWidth="1.6" />

          {/* ── CROP TOP ── */}
          <path d="M 56,112 Q 100,106 144,112" />
          <line x1="56"  y1="112" x2="58"  y2="150" />
          <line x1="144" y1="112" x2="142" y2="150" />
          <path d="M 58,150 Q 100,158 142,150" />

          {/* ── WAIST ── */}
          <path d="M 64,162 Q 100,172 136,162" />

          {/* ── HIPS ── */}
          <path d="M 60,172 Q 100,186 140,172" />

          {/* ── SHORTS ── */}
          <line x1="60"  y1="172" x2="54"  y2="210" />
          <line x1="140" y1="172" x2="146" y2="210" />
          <path d="M 54,210 Q 100,222 146,210" />
          <line x1="100" y1="186" x2="100" y2="212" strokeWidth="1.8" />

          {/* ── LEGS ── */}
          <path d="M 69,218 Q 64,248 60,278" />
          <path d="M 59,274 Q 55,279 59,285" strokeWidth="1.6" />
          <path d="M 60,278 Q 56,306 58,334" />

          <path d="M 131,218 Q 136,248 140,278" />
          <path d="M 141,274 Q 145,279 141,285" strokeWidth="1.6" />
          <path d="M 140,278 Q 144,306 142,334" />

          {/* ── CHUNKY SNEAKERS ── */}
          <path d="M 55,332 Q 42,336 36,350 Q 36,364 54,363 Q 68,363 74,353 Q 77,341 67,333 Z" />
          <path d="M 36,362 Q 54,368 76,362" strokeWidth="1.8" />
          <path d="M 44,350 Q 60,346 72,350" strokeWidth="1.6" />

          <path d="M 145,332 Q 158,336 164,350 Q 164,364 146,363 Q 132,363 126,353 Q 123,341 133,333 Z" />
          <path d="M 164,362 Q 146,368 124,362" strokeWidth="1.8" />
          <path d="M 156,350 Q 140,346 128,350" strokeWidth="1.6" />

          {/* ── FLOOR REFLECTION ── */}
          <path d="M 36,370 Q 100,376 164,370" strokeWidth="1" opacity="0.3" />
        </g>
      </motion.svg>
    </motion.div>
  );
}
