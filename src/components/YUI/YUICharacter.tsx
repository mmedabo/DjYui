import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { YUIExpression } from '../../types';

interface Props {
  expression?: YUIExpression;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showBubble?: boolean;
  floating?: boolean;
}

const EXPRESSION_COLORS: Record<YUIExpression, string> = {
  neutral: '#a855f7',
  excited: '#ec4899',
  teaching: '#06b6d4',
  encouraging: '#10b981',
  celebrating: '#f59e0b',
  thinking: '#8b5cf6',
};

const EXPRESSION_EMOJIS: Record<YUIExpression, string> = {
  neutral: '😊',
  excited: '🤩',
  teaching: '🎓',
  encouraging: '💪',
  celebrating: '🎉',
  thinking: '🤔',
};

function YuiSVG({ expression = 'neutral', size = 'md' }: { expression: YUIExpression; size: string }) {
  const color = EXPRESSION_COLORS[expression];
  const px = size === 'sm' ? 80 : size === 'lg' ? 160 : 120;
  const isExcited = expression === 'excited' || expression === 'celebrating';
  const isThinking = expression === 'thinking';

  return (
    <svg width={px} height={px} viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glow effect */}
      <defs>
        <radialGradient id="yuiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="headGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fde8d8" />
          <stop offset="100%" stopColor="#f5c5a3" />
        </radialGradient>
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color === '#a855f7' ? '#6d28d9' : color} />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <circle cx="60" cy="75" r="55" fill="url(#yuiGlow)" />

      {/* Body / outfit */}
      <ellipse cx="60" cy="125" rx="28" ry="20" fill={color} opacity="0.9" />
      {/* DJ jacket */}
      <path d="M32 115 Q40 105 50 108 L60 120 L70 108 Q80 105 88 115 L88 140 L32 140Z" fill={color} />
      {/* Shirt detail */}
      <path d="M50 108 L60 120 L70 108 L60 125Z" fill="white" opacity="0.3" />

      {/* Headphone band */}
      <path d="M20 62 Q20 30 60 30 Q100 30 100 62" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Headphone cups */}
      <ellipse cx="20" cy="65" rx="8" ry="10" fill={color} />
      <ellipse cx="100" cy="65" rx="8" ry="10" fill={color} />
      <ellipse cx="20" cy="65" rx="5" ry="7" fill="#1a1a2e" />
      <ellipse cx="100" cy="65" rx="5" ry="7" fill="#1a1a2e" />

      {/* Hair - side pieces */}
      <path d="M25 55 Q15 70 18 90 Q22 98 28 95 Q24 78 28 65Z" fill="url(#hairGrad)" />
      <path d="M95 55 Q105 70 102 90 Q98 98 92 95 Q96 78 92 65Z" fill="url(#hairGrad)" />

      {/* Head */}
      <ellipse cx="60" cy="65" rx="32" ry="35" fill="url(#headGrad)" />

      {/* Hair top */}
      <path d="M28 55 Q30 25 60 22 Q90 25 92 55 Q85 35 60 33 Q35 35 28 55Z" fill="url(#hairGrad)" />
      {/* Hair bangs */}
      <path d="M32 47 Q40 38 50 42 Q45 50 40 52Z" fill="url(#hairGrad)" />
      <path d="M88 47 Q80 38 70 42 Q75 50 80 52Z" fill="url(#hairGrad)" />
      <path d="M48 38 Q60 32 72 38 Q60 46 48 38Z" fill="url(#hairGrad)" />

      {/* Eyes */}
      {isThinking ? (
        <>
          <ellipse cx="48" cy="64" rx="7" ry="5" fill="white" />
          <ellipse cx="72" cy="64" rx="7" ry="5" fill="white" />
          <circle cx="49" cy="64" r="3.5" fill="#1a1a2e" />
          <circle cx="73" cy="64" r="3.5" fill="#1a1a2e" />
          <circle cx="50" cy="63" r="1.5" fill="white" />
          <circle cx="74" cy="63" r="1.5" fill="white" />
          {/* Thinking brow */}
          <path d="M42 58 Q48 55 54 58" stroke="#8b6548" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M66 58 Q72 55 78 58" stroke="#8b6548" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : isExcited ? (
        <>
          {/* Sparkly excited eyes */}
          <ellipse cx="48" cy="64" rx="8" ry="8" fill="white" />
          <ellipse cx="72" cy="64" rx="8" ry="8" fill="white" />
          <circle cx="48" cy="64" r="5" fill={color} />
          <circle cx="72" cy="64" r="5" fill={color} />
          <circle cx="46" cy="62" r="2" fill="white" />
          <circle cx="70" cy="62" r="2" fill="white" />
          {/* Stars in eyes */}
          <text x="44" y="67" fontSize="6" fill="white">★</text>
          <text x="68" y="67" fontSize="6" fill="white">★</text>
        </>
      ) : (
        <>
          <ellipse cx="48" cy="64" rx="7" ry="6" fill="white" />
          <ellipse cx="72" cy="64" rx="7" ry="6" fill="white" />
          <circle cx="49" cy="65" r="4" fill="#1a1a2e" />
          <circle cx="73" cy="65" r="4" fill="#1a1a2e" />
          <circle cx="50" cy="64" r="1.5" fill="white" />
          <circle cx="74" cy="64" r="1.5" fill="white" />
          {/* Eyelashes */}
          <path d="M42 60 Q45 58 48 60" stroke="#3d2314" strokeWidth="1.5" fill="none" />
          <path d="M66 60 Q69 58 72 60" stroke="#3d2314" strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* Blush */}
      <ellipse cx="38" cy="73" rx="7" ry="4" fill="#f87171" opacity="0.4" />
      <ellipse cx="82" cy="73" rx="7" ry="4" fill="#f87171" opacity="0.4" />

      {/* Mouth */}
      {isExcited ? (
        <path d="M50 79 Q60 88 70 79" stroke="#8b4513" strokeWidth="2" fill="#ec4899" />
      ) : isThinking ? (
        <path d="M52 82 Q60 80 68 82" stroke="#8b4513" strokeWidth="2" fill="none" />
      ) : expression === 'encouraging' ? (
        <>
          <path d="M50 79 Q60 87 70 79" stroke="#8b4513" strokeWidth="2" fill="#f97316" />
          <path d="M54 79 Q60 84 66 79" fill="#fca5a5" />
        </>
      ) : (
        <path d="M52 80 Q60 86 68 80" stroke="#8b4513" strokeWidth="2" fill="none" />
      )}

      {/* Nose */}
      <ellipse cx="60" cy="74" rx="3" ry="2" fill="#f5c5a3" />

      {/* Earrings */}
      <circle cx="28" cy="72" r="3" fill={color} />
      <circle cx="92" cy="72" r="3" fill={color} />

      {/* Music note decoration */}
      {isExcited && (
        <>
          <text x="5" y="50" fontSize="12" fill={color} opacity="0.8">♪</text>
          <text x="100" y="45" fontSize="10" fill={color} opacity="0.6">♫</text>
          <text x="8" y="90" fontSize="8" fill={color} opacity="0.5">♩</text>
        </>
      )}

      {/* Thinking bubble dots */}
      {isThinking && (
        <>
          <circle cx="85" cy="45" r="3" fill={color} opacity="0.4" />
          <circle cx="93" cy="38" r="5" fill={color} opacity="0.5" />
          <circle cx="103" cy="28" r="8" fill={color} opacity="0.6" />
        </>
      )}
    </svg>
  );
}

export function YUICharacter({ expression = 'neutral', message, size = 'md', showBubble = true, floating = true }: Props) {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [bubbleKey, setBubbleKey] = useState(0);

  useEffect(() => {
    if (message !== displayMessage) {
      setDisplayMessage(message);
      setBubbleKey(k => k + 1);
    }
  }, [message]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && displayMessage && (
          <motion.div
            key={bubbleKey}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 z-10"
          >
            <div
              className="relative rounded-2xl p-3 text-sm text-white leading-relaxed shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(30,20,60,0.95), rgba(20,10,40,0.95))',
                border: `1.5px solid ${EXPRESSION_COLORS[expression]}`,
                boxShadow: `0 0 20px ${EXPRESSION_COLORS[expression]}40`,
              }}
            >
              <span className="mr-1">{EXPRESSION_EMOJIS[expression]}</span>
              {displayMessage}
              {/* Bubble tail */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid ${EXPRESSION_COLORS[expression]}`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <motion.div
        animate={floating ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <YuiSVG expression={expression} size={size} />
      </motion.div>
    </div>
  );
}
