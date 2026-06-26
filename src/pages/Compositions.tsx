import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, Trash2, Plus, Clock, Disc3 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { TRACKS } from '../data/tracks';

function fmtDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Compositions() {
  const { progress, removeComposition, setPage } = useAppStore();
  const comps = progress.compositions;

  const totalTime = comps.reduce((a, c) => a + c.duration, 0);
  const uniqueTracks = new Set([
    ...comps.map(c => c.trackA),
    ...comps.map(c => c.trackB),
  ].filter(Boolean)).size;

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <nav className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #141414' }}>
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#555' }}
        >
          <ChevronLeft size={16} /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Disc3 size={14} style={{ color: '#06b6d4' }} />
          <span className="font-bold text-white text-sm">My Mixes</span>
        </div>
        <button
          onClick={() => setPage('studio')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: '#111', border: '1px solid #1e1e1e', color: '#666' }}
        >
          <Plus size={11} /> New Mix
        </button>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-5">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          {[
            { label: 'Total Mixes', value: comps.length, color: '#a855f7' },
            { label: 'Total Time', value: fmtDuration(totalTime), color: '#06b6d4' },
            { label: 'Tracks Used', value: uniqueTracks, color: '#ec4899' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
            >
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#333' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Empty state */}
        {comps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-4xl mb-4">🎛️</div>
            <h2 className="text-lg font-bold text-white mb-2">No mixes yet</h2>
            <p className="text-sm mb-6" style={{ color: '#444' }}>
              Head to the studio and record your first mix.
            </p>
            <button
              onClick={() => setPage('studio')}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            >
              Open Studio
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {comps.map((comp, i) => {
                const trackA = TRACKS.find(t => t.id === comp.trackA);
                const trackB = TRACKS.find(t => t.id === comp.trackB);

                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl"
                    style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
                  >
                    {/* Color dot */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: `${comp.thumbnail}18`, border: `1px solid ${comp.thumbnail}35` }}
                    >
                      💿
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{comp.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {trackA && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: `${trackA.color}18`, color: `${trackA.color}cc` }}
                          >
                            {trackA.name}
                          </span>
                        )}
                        {trackA && trackB && <span className="text-xs" style={{ color: '#252525' }}>×</span>}
                        {trackB && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: `${trackB.color}18`, color: `${trackB.color}cc` }}
                          >
                            {trackB.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#333' }}>
                        <span className="flex items-center gap-1">
                          <Clock size={9} /> {fmtDuration(comp.duration)}
                        </span>
                        <span>{fmtDate(comp.createdAt)}</span>
                        {comp.bpmA > 0 && <span>{comp.bpmA} BPM</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPage('studio')}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}
                        title="Remix in Studio"
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                      <button
                        onClick={() => removeComposition(comp.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: '#111', color: '#333' }}
                        title="Delete"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#333'; (e.currentTarget as HTMLElement).style.background = '#111'; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-4"
            >
              <button
                onClick={() => setPage('studio')}
                className="text-xs font-semibold transition-colors"
                style={{ color: '#a855f7' }}
              >
                + Create another mix
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
