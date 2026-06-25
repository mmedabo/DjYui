import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { YUICharacter } from './YUICharacter';
import { useAppStore } from '../../store/appStore';
import type { YUIExpression } from '../../types';

export function YUIPanel() {
  const { yuiMessage, yuiExpression, yuiVisible, setYUIVisible } = useAppStore();
  const [minimized, setMinimized] = useState(false);

  return (
    <AnimatePresence>
      {yuiVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
        >
          <motion.div
            animate={{ height: minimized ? 'auto' : 'auto' }}
            className="glass-dark rounded-3xl overflow-hidden"
            style={{ maxWidth: 280 }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-sm font-semibold text-purple-300">YUI - DJ Tutor</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMinimized(m => !m)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  onClick={() => setYUIVisible(false)}
                  className="text-white/50 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col items-center gap-3 p-4"
                >
                  <YUICharacter
                    expression={yuiExpression as YUIExpression}
                    size="md"
                    showBubble={false}
                    floating={true}
                  />
                  {yuiMessage && (
                    <motion.p
                      key={yuiMessage}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-white/90 text-center leading-relaxed"
                    >
                      {yuiMessage}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
