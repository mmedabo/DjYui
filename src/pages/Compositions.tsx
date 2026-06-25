import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, Trash2, Music, Plus, Clock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { TRACKS } from '../data/tracks';
import { YUICharacter } from '../components/YUI/YUICharacter';

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Compositions() {
  const { progress, removeComposition, setPage } = useAppStore();
  const compositions = progress.compositions;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(236,72,153,0.06) 0%, transparent 60%)'
      }} />

      {/* Header */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-sm">Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <Music size={16} className="text-pink-400" />
          <span className="font-bold text-white text-sm">My Compositions</span>
        </div>
        <button
          onClick={() => setPage('studio')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass text-white/70 hover:text-white transition-colors"
        >
          <Plus size={12} /> New Mix
        </button>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: 'Total Mixes', value: compositions.length, color: '#a855f7' },
            {
              label: 'Total Time',
              value: formatDuration(compositions.reduce((a, c) => a + c.duration, 0)),
              color: '#06b6d4',
            },
            {
              label: 'Tracks Used',
              value: new Set([...compositions.map(c => c.trackA), ...compositions.map(c => c.trackB)].filter(Boolean)).size,
              color: '#ec4899',
            },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Compositions list */}
        {compositions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-20 text-center"
          >
            <YUICharacter
              expression="encouraging"
              size="lg"
              message="No mixes yet! Head to the studio and create your first composition! 🎛️"
              showBubble={true}
              floating={true}
            />
            <button
              onClick={() => setPage('studio')}
              className="px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 6px 20px rgba(168,85,247,0.4)' }}
            >
              Open Studio → Create First Mix
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {compositions.map((comp, i) => {
                const trackA = TRACKS.find(t => t.id === comp.trackA);
                const trackB = TRACKS.find(t => t.id === comp.trackB);

                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Color thumbnail */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 font-black text-xl"
                        style={{
                          background: `linear-gradient(135deg, ${comp.thumbnail}, ${comp.thumbnail}88)`,
                          boxShadow: `0 4px 15px ${comp.thumbnail}40`,
                        }}
                      >
                        💿
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{comp.name}</h3>

                        {/* Track info */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {trackA && (
                            <span className="text-xs px-2 py-0.5 rounded-full text-white/60"
                              style={{ background: `${trackA.color}20`, border: `1px solid ${trackA.color}30` }}>
                              {trackA.name}
                            </span>
                          )}
                          {trackA && trackB && <span className="text-xs text-white/20">×</span>}
                          {trackB && (
                            <span className="text-xs px-2 py-0.5 rounded-full text-white/60"
                              style={{ background: `${trackB.color}20`, border: `1px solid ${trackB.color}30` }}>
                              {trackB.name}
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-white/30">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {formatDuration(comp.duration)}
                          </span>
                          <span>{formatDate(comp.createdAt)}</span>
                          {comp.bpmA > 0 && <span>{comp.bpmA} BPM</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPage('studio')}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}
                          title="Remix in Studio"
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                        <button
                          onClick={() => removeComposition(comp.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* YUI encouragement at bottom */}
        {compositions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 glass rounded-2xl p-4 mt-6"
          >
            <YUICharacter
              expression="celebrating"
              size="sm"
              showBubble={false}
              floating={true}
            />
            <div>
              <p className="text-white/70 text-sm">
                {compositions.length === 1
                  ? "Your first mix! Every DJ legend started exactly here. Keep going! 🌟"
                  : `${compositions.length} mixes and counting! You're building your portfolio! 🎉`
                }
              </p>
              <button
                onClick={() => setPage('studio')}
                className="text-xs mt-1 font-semibold"
                style={{ color: '#a855f7' }}
              >
                Create another mix →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
