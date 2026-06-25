import { motion } from 'framer-motion';
import { ChevronRight, Music, Headphones, Zap, Star, Trophy, BookOpen } from 'lucide-react';
import { YUICharacter } from '../components/YUI/YUICharacter';
import { useAppStore } from '../store/appStore';

const FEATURES = [
  { icon: BookOpen,   title: '12 Sessions',          desc: 'Beginner to pro curriculum — real skills, real techniques', color: '#cc00ff' },
  { icon: Headphones, title: 'Virtual DJ Deck',       desc: 'Two turntables, mixer, EQ, FX, scratching — all in browser', color: '#00ffff' },
  { icon: Zap,        title: 'Live Audio Engine',     desc: 'Real-time beat generation via Web Audio API', color: '#ff6600' },
  { icon: Star,       title: 'Endless Compositions',  desc: 'Create & save your own mixes. Build your portfolio!', color: '#ff1493' },
  { icon: Trophy,     title: '20 Achievements',       desc: 'Unlock badges as you master each skill and milestone', color: '#ffcc00' },
  { icon: Music,      title: 'YUI AI Tutor',          desc: 'Personal DJ tutor with tips, challenges & encouragement', color: '#00ff88' },
];

// Stable pre-computed particles (no Math.random() on render)
const PARTICLES = [
  { color: '#ff00ff', x: 8,  delay: 0,    dur: 4.2 },
  { color: '#00ffff', x: 16, delay: 0.7,  dur: 3.8 },
  { color: '#ff6600', x: 24, delay: 1.4,  dur: 4.6 },
  { color: '#cc00ff', x: 32, delay: 0.3,  dur: 3.5 },
  { color: '#ffcc00', x: 40, delay: 1.1,  dur: 4.0 },
  { color: '#00ff88', x: 48, delay: 0.6,  dur: 3.3 },
  { color: '#ff1493', x: 56, delay: 1.8,  dur: 4.8 },
  { color: '#00ffff', x: 64, delay: 0.2,  dur: 3.9 },
  { color: '#ff00ff', x: 72, delay: 1.5,  dur: 4.1 },
  { color: '#ffcc00', x: 80, delay: 0.9,  dur: 3.6 },
  { color: '#cc00ff', x: 88, delay: 0.4,  dur: 4.4 },
  { color: '#ff6600', x: 92, delay: 1.2,  dur: 3.7 },
  { color: '#00ff88', x: 96, delay: 2.0,  dur: 4.3 },
  { color: '#ff1493', x: 4,  delay: 1.6,  dur: 3.4 },
  { color: '#00ffff', x: 20, delay: 2.3,  dur: 4.7 },
  { color: '#ff00ff', x: 44, delay: 0.1,  dur: 3.2 },
  { color: '#ffcc00', x: 68, delay: 1.9,  dur: 4.5 },
  { color: '#cc00ff', x: 84, delay: 0.8,  dur: 3.1 },
];

const JOURNEY = [
  { level: 'Beginner',     color: '#10b981', sessions: '1–4',   desc: 'Gear, BPM, first mix'   },
  { level: 'Intermediate', color: '#f59e0b', sessions: '5–8',   desc: 'EQ, FX, transitions'   },
  { level: 'Advanced',     color: '#cc00ff', sessions: '9–10',  desc: 'Scratch, live remix'   },
  { level: 'Pro',          color: '#ff1493', sessions: '11–12', desc: 'Full sets, production' },
];

export function Landing() {
  const { setPage } = useAppStore();

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#000000' }}>

      {/* ── Neon particle field ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}, 0 0 14px ${p.color}`,
              left: `${p.x}%`,
              bottom: 0,
            }}
            animate={{ y: [0, -500], opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1, 0.3] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Subtle neon glow blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '5%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(204,0,255,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '5%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(0,255,255,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '30%', width: 500, height: 200,
          background: 'radial-gradient(ellipse, rgba(255,20,147,0.04) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
      </div>

      {/* ── Nav ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: 'transparent',
              border: '1.5px solid #ff1493',
              boxShadow: '0 0 10px rgba(255,20,147,0.5)',
            }}>
            🎧
          </div>
          <span className="font-black text-white tracking-wider" style={{
            textShadow: '0 0 10px rgba(204,0,255,0.8)',
          }}>DJ YUI</span>
        </div>
        <button
          onClick={() => setPage('dashboard')}
          className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00ffff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          Skip intro →
        </button>
      </header>

      {/* ── HERO ── */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-4 pb-20">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: 'rgba(255,0,255,0.08)',
              border: '1px solid rgba(255,0,255,0.3)',
              color: '#ff00ff',
              boxShadow: '0 0 12px rgba(255,0,255,0.15)',
            }}>
            🎵 From Scratch to Pro DJ
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none mb-3 neon-rainbow-text">
            DJ YUI
          </h1>
          <p className="text-base sm:text-lg max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Your AI-powered DJ tutor. Master the decks, one beat at a time.
          </p>
        </motion.div>

        {/* Large neon dancer hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative flex items-center justify-center my-2"
        >
          {/* Floor glow beneath character */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 280,
            height: 40,
            background: 'radial-gradient(ellipse, rgba(255,0,255,0.35) 0%, rgba(0,255,255,0.15) 40%, transparent 70%)',
            filter: 'blur(12px)',
            animation: 'floor-glow-pulse 3s ease-in-out infinite',
          }} />

          <YUICharacter
            expression="excited"
            size="hero"
            showBubble={true}
            message="Hey! I'm YUI — your DJ tutor! Ready to drop some beats? 🎧"
            floating={true}
          />

          {/* Side neon sparks */}
          {[
            { side: 'left',  top: '20%', color: '#ff00ff', w: 40 },
            { side: 'left',  top: '55%', color: '#ff6600', w: 25 },
            { side: 'right', top: '30%', color: '#00ffff', w: 35 },
            { side: 'right', top: '65%', color: '#ffcc00', w: 20 },
          ].map((spark, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: spark.top,
                [spark.side]: spark.side === 'left' ? -20 : -20,
                width: spark.w,
                height: 2,
                background: spark.color,
                boxShadow: `0 0 8px ${spark.color}, 0 0 20px ${spark.color}`,
                borderRadius: 2,
              }}
              animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
              transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
            />
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex gap-8 justify-center mb-8"
        >
          {[
            { value: '12',  label: 'Sessions',     color: '#cc00ff' },
            { value: '50+', label: 'Lessons',      color: '#00ffff' },
            { value: '20',  label: 'Achievements', color: '#ff1493' },
            { value: '∞',   label: 'Mixes',        color: '#ffcc00' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black" style={{
                color: s.color,
                textShadow: `0 0 10px ${s.color}, 0 0 20px ${s.color}`,
              }}>{s.value}</div>
              <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setPage('dashboard')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-black text-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff00ff, #ff1493, #ff6600)',
              boxShadow: '0 0 20px rgba(255,0,255,0.6), 0 0 50px rgba(255,0,255,0.3)',
            }}
          >
            Start Learning Free
            <ChevronRight size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setPage('studio')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all btn-neon"
          >
            🎛️ Open Studio
          </motion.button>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="w-full max-w-4xl mb-16"
        >
          <h2 className="text-center text-xl font-bold mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Everything you need to become a{' '}
            <span className="neon-rainbow-text font-black">pro DJ</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="rounded-2xl p-4 cursor-pointer transition-all group"
                style={{
                  background: 'rgba(0,0,8,0.8)',
                  border: `1px solid ${f.color}30`,
                  boxShadow: `0 0 15px ${f.color}10`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}70`; e.currentTarget.style.boxShadow = `0 0 25px ${f.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${f.color}30`; e.currentTarget.style.boxShadow = `0 0 15px ${f.color}10`; }}
                onClick={() => setPage('dashboard')}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}18`, boxShadow: `0 0 10px ${f.color}30` }}>
                  <f.icon size={20} style={{ color: f.color, filter: `drop-shadow(0 0 4px ${f.color})` }} />
                </div>
                <h3 className="font-bold text-white mb-1 text-sm">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* DJ Journey path */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="w-full max-w-3xl mb-16"
        >
          <h2 className="text-center text-xl font-bold mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Your DJ journey
          </h2>
          <div className="flex items-center justify-between">
            {JOURNEY.map((stage, i, arr) => (
              <div key={stage.level} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <motion.div
                    animate={{ boxShadow: [`0 0 12px ${stage.color}60`, `0 0 24px ${stage.color}90`, `0 0 12px ${stage.color}60`] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs text-center leading-tight"
                    style={{
                      background: `${stage.color}18`,
                      border: `2px solid ${stage.color}`,
                      color: stage.color,
                    }}
                  >
                    {stage.sessions}
                  </motion.div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-white">{stage.level}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{stage.desc}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 h-px mx-2" style={{
                    background: `linear-gradient(to right, ${stage.color}, ${arr[i+1].color})`,
                    boxShadow: `0 0 6px ${stage.color}50`,
                    opacity: 0.6,
                  }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPage('dashboard')}
            className="px-10 py-5 rounded-2xl font-black text-xl text-black transition-all"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,0,255,0.6), 0 0 50px rgba(255,0,255,0.3)',
                '0 0 30px rgba(0,255,255,0.6), 0 0 60px rgba(0,255,255,0.3)',
                '0 0 20px rgba(255,0,255,0.6), 0 0 50px rgba(255,0,255,0.3)',
              ],
              background: [
                'linear-gradient(135deg, #ff00ff, #ff6600, #ffcc00)',
                'linear-gradient(135deg, #00ffff, #cc00ff, #ff1493)',
                'linear-gradient(135deg, #ff00ff, #ff6600, #ffcc00)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            Begin Your DJ Journey 🎧
          </motion.button>
          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Free forever · No signup required · Learn at your pace
          </p>
        </motion.div>
      </main>
    </div>
  );
}
