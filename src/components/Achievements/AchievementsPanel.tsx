import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/achievements';
import { useAppStore } from '../../store/appStore';

interface Props {
  onClose: () => void;
}

const CATEGORY_LABELS = {
  learning: '📚 Learning',
  studio: '🎛️ Studio',
  composition: '🎵 Compositions',
  milestone: '🏆 Milestones',
};

export function AchievementsPanel({ onClose }: Props) {
  const { progress, completedLessons, studioStats } = useAppStore();

  const stats = {
    totalXP: progress.totalXP,
    completedSessions: progress.completedSessions,
    completedLessons,
    compositions: progress.compositions.length,
    deckAPlays: studioStats.deckAPlays,
    deckBPlays: studioStats.deckBPlays,
    crossfaderMoves: studioStats.crossfaderMoves,
    eqAdjustments: studioStats.eqAdjustments,
    scratchCount: studioStats.scratchCount,
  };

  const unlocked = ACHIEVEMENTS.filter(a => a.condition(stats));

  const categories = ['learning', 'studio', 'composition', 'milestone'] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-dark rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            <h2 className="font-bold text-white">Achievements</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #a855f7, #f59e0b)' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/30">{unlocked.length} unlocked</span>
            <span className="text-xs text-white/30">
              {ACHIEVEMENTS.reduce((a, ach) => a + (ach.condition(stats) ? ach.xpReward : 0), 0)} bonus XP earned
            </span>
          </div>
        </div>

        {/* Achievement list by category */}
        <div className="overflow-y-auto flex-1 px-3 py-3">
          {categories.map(cat => {
            const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
            return (
              <div key={cat} className="mb-5">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2 px-2">
                  {CATEGORY_LABELS[cat]}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {catAchs.map(ach => {
                    const earned = ach.condition(stats);
                    return (
                      <motion.div
                        key={ach.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                        style={{
                          background: earned ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${earned ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)'}`,
                          opacity: earned ? 1 : 0.5,
                        }}
                      >
                        <span className="text-xl shrink-0" style={{ filter: earned ? 'none' : 'grayscale(100%)' }}>
                          {ach.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold" style={{ color: earned ? 'white' : 'rgba(255,255,255,0.4)' }}>
                            {ach.title}
                          </div>
                          <div className="text-xs text-white/30 leading-tight">{ach.description}</div>
                        </div>
                        {ach.xpReward > 0 && (
                          <span
                            className="text-xs font-mono shrink-0"
                            style={{ color: earned ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}
                          >
                            +{ach.xpReward} XP
                          </span>
                        )}
                        {earned && (
                          <span className="text-green-400 text-xs shrink-0">✓</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
