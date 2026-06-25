import { motion } from 'framer-motion';
import { ChevronRight, Music, Headphones, Zap, Star, Trophy, BookOpen } from 'lucide-react';
import { YUICharacter } from '../components/YUI/YUICharacter';
import { useAppStore } from '../store/appStore';

const FEATURES = [
  { icon: BookOpen, title: '12 Learning Sessions', desc: 'From scratch to pro — step-by-step curriculum designed for real skill building', color: '#a855f7' },
  { icon: Headphones, title: 'Virtual DJ Studio', desc: 'Interactive turntables, mixer, EQ, and FX — practice anytime, anywhere', color: '#06b6d4' },
  { icon: Zap, title: 'Live Beat Matching', desc: 'Real-time audio engine with Web Audio API for authentic DJ experience', color: '#f59e0b' },
  { icon: Star, title: 'Endless Compositions', desc: 'Create, save, and replay your own mixes. Track your creative journey!', color: '#ec4899' },
  { icon: Trophy, title: 'XP & Progression', desc: 'Earn experience points, unlock sessions, and level up from beginner to pro', color: '#10b981' },
  { icon: Music, title: 'YUI Tutor AI', desc: 'Your personal DJ tutor guides you with tips, challenges, and encouragement', color: '#8b5cf6' },
];

export function Landing() {
  const { setPage } = useAppStore();

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.05) 0%, transparent 60%)'
        }} />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b'][i % 4],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            🎧
          </div>
          <span className="font-bold text-white">DJ YUI</span>
        </div>
        <button
          onClick={() => setPage('dashboard')}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Skip intro →
        </button>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-8 pb-20">
        {/* YUI Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl w-full mb-20"
        >
          {/* Left: Character */}
          <div className="flex flex-col items-center">
            <YUICharacter
              expression="excited"
              size="lg"
              showBubble={true}
              message="Hey! I'm YUI — your DJ tutor! I'll teach you everything from your first beat to full pro sets! Ready? Let's GO! 🎧"
              floating={true}
            />
          </div>

          {/* Right: Hero text */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
                🎵 From Scratch to Pro
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-none mb-4">
                Learn{' '}
                <span className="neon-purple" style={{ color: '#a855f7' }}>DJing</span>
                <br />with{' '}
                <span className="neon-pink" style={{ color: '#ec4899' }}>YUI</span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                Your personal AI DJ tutor. Master beatmatching, EQ, effects, scratching, and full set building — one session at a time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => setPage('dashboard')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  boxShadow: '0 8px 30px rgba(168,85,247,0.4)',
                }}
              >
                Start Learning Free
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setPage('studio')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white/70 text-lg transition-all hover:text-white glass"
              >
                🎛️ Open Studio
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex gap-6 justify-center lg:justify-start"
            >
              {[
                { value: '12', label: 'Sessions' },
                { value: '50+', label: 'Lessons' },
                { value: '∞', label: 'Compositions' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-white neon-purple" style={{ color: '#a855f7' }}>{stat.value}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          <h2 className="text-center text-2xl font-bold text-white mb-8">
            Everything you need to become a{' '}
            <span style={{ color: '#a855f7' }}>pro DJ</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="glass rounded-2xl p-5 hover:border-white/15 transition-all group cursor-pointer"
                onClick={() => setPage('dashboard')}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}22` }}
                >
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level path preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-3xl mt-20"
        >
          <h2 className="text-center text-2xl font-bold text-white mb-8">Your DJ journey</h2>
          <div className="flex items-center justify-between">
            {[
              { level: 'Beginner', color: '#10b981', sessions: '1-4', desc: 'Gear, BPM, first mix' },
              { level: 'Intermediate', color: '#f59e0b', sessions: '5-8', desc: 'EQ, FX, transitions' },
              { level: 'Advanced', color: '#a855f7', sessions: '9-10', desc: 'Scratch, live remix' },
              { level: 'Pro', color: '#ec4899', sessions: '11-12', desc: 'Full sets, production' },
            ].map((stage, i, arr) => (
              <div key={stage.level} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xs text-center leading-tight"
                    style={{ background: `${stage.color}22`, border: `2px solid ${stage.color}`, color: stage.color }}
                  >
                    {stage.sessions}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-white">{stage.level}</div>
                    <div className="text-xs text-white/30">{stage.desc}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 mx-2 h-px bg-gradient-to-r from-current to-transparent"
                    style={{ color: stage.color }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-20 text-center"
        >
          <button
            onClick={() => setPage('dashboard')}
            className="px-10 py-5 rounded-2xl font-black text-xl text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
              boxShadow: '0 10px 40px rgba(168,85,247,0.5)',
            }}
          >
            Begin Your DJ Journey 🎧
          </button>
          <p className="text-white/30 text-sm mt-3">Free forever • No registration required • Learn at your own pace</p>
        </motion.div>
      </main>
    </div>
  );
}
