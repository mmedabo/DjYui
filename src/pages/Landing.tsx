import { motion } from 'framer-motion';
import { ChevronRight, Disc3, LayoutGrid, Award } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const LEVEL_COLORS = ['#10b981', '#f59e0b', '#a855f7', '#ec4899'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

export function Landing() {
  const { setPage } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #141414' }}>
        <div className="flex items-center gap-2">
          <Disc3 size={16} style={{ color: '#a855f7' }} />
          <span className="font-black text-white tracking-wider text-sm">DJ YUI</span>
        </div>
        <button
          onClick={() => setPage('studio')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: '#141414', border: '1px solid #252525', color: '#666' }}
        >
          Open Studio
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#3a3a3a' }}>
            DJ Training Platform
          </p>

          <h1
            className="font-black text-white leading-none mb-4"
            style={{ fontSize: 'clamp(64px, 18vw, 120px)', letterSpacing: '-0.03em' }}
          >
            DJ YUI
          </h1>

          <p className="text-base mb-8" style={{ color: '#555' }}>
            Learn to mix. Master the decks. Build your sound.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setPage('dashboard')}
              className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            >
              Start Learning <ChevronRight size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setPage('studio')}
              className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm"
              style={{ background: '#111', border: '1px solid #222', color: '#aaa' }}
            >
              Open Studio
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 mb-12"
          >
            {[
              { val: '12', label: 'Sessions' },
              { val: '50+', label: 'Lessons' },
              { val: '20', label: 'Awards' },
              { val: '∞', label: 'Mixes' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black text-white">{s.val}</div>
                <div className="text-xs uppercase tracking-widest" style={{ color: '#3a3a3a' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left mb-10"
          >
            {[
              { icon: LayoutGrid, label: '12 Learning Sessions', sub: 'Beginner through Pro curriculum' },
              { icon: Disc3, label: 'Full DJ Controller', sub: '2 decks · EQ · FX · loops · hot cues' },
              { icon: Award, label: 'Achievements', sub: 'Track your skills and progress' },
            ].map(f => (
              <button
                key={f.label}
                onClick={() => setPage('dashboard')}
                className="p-4 rounded-xl text-left transition-colors hover:border-white/10"
                style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}
              >
                <f.icon size={14} style={{ color: '#444', marginBottom: 8 }} />
                <div className="text-xs font-semibold text-white">{f.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#3a3a3a' }}>{f.sub}</div>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Level path footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-5 py-4 flex items-center justify-center gap-2"
        style={{ borderTop: '1px solid #111' }}
      >
        {LEVELS.map((lvl, i) => (
          <div key={lvl} className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: LEVEL_COLORS[i] }}>{lvl}</span>
            {i < LEVELS.length - 1 && (
              <span style={{ color: '#1e1e1e' }}>→</span>
            )}
          </div>
        ))}
      </motion.footer>
    </div>
  );
}
