import { motion } from 'framer-motion';
import { ChevronRight, Lock, CheckCircle, Zap, Music2, Play, Trophy, Disc3 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SESSIONS } from '../data/sessions';
import type { Level } from '../types';

const LEVEL_COLORS: Record<Level, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#a855f7',
  pro: '#ec4899',
};

const LEVEL_ORDER: Level[] = ['beginner', 'intermediate', 'advanced', 'pro'];

const XP_RANGES: Record<Level, [number, number]> = {
  beginner:     [0,    800],
  intermediate: [800,  2000],
  advanced:     [2000, 5000],
  pro:          [5000, 5000],
};

const NEXT_LEVEL: Partial<Record<Level, Level>> = {
  beginner: 'intermediate',
  intermediate: 'advanced',
  advanced: 'pro',
};

export function Dashboard() {
  const { progress, setPage, setActiveSession, completedLessons } = useAppStore();
  const { totalXP, level, completedSessions, streak } = progress;

  const [xpMin, xpMax] = XP_RANGES[level];
  const xpPct = xpMax > xpMin ? Math.min(1, (totalXP - xpMin) / (xpMax - xpMin)) : 1;
  const nextLevel = NEXT_LEVEL[level];
  const color = LEVEL_COLORS[level];

  const sessionsByLevel: Record<Level, typeof SESSIONS> = {
    beginner: SESSIONS.filter(s => s.level === 'beginner'),
    intermediate: SESSIONS.filter(s => s.level === 'intermediate'),
    advanced: SESSIONS.filter(s => s.level === 'advanced'),
    pro: SESSIONS.filter(s => s.level === 'pro'),
  };

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #141414' }}>
        <button onClick={() => setPage('landing')} className="flex items-center gap-2">
          <Disc3 size={14} style={{ color: '#a855f7' }} />
          <span className="font-black text-white text-sm">DJ YUI</span>
        </button>
        <div className="flex items-center gap-1.5">
          {([
            { label: 'Studio', icon: Music2, page: 'studio' },
            { label: 'Mixes', icon: Play, page: 'compositions' },
            { label: 'Awards', icon: Trophy, page: 'achievements' },
          ] as const).map(item => (
            <button
              key={item.label}
              onClick={() => setPage(item.page)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: '#111', border: '1px solid #1e1e1e', color: '#666' }}
            >
              <item.icon size={11} /> {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: '#333' }}>Your Level</div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-black capitalize" style={{ color }}>{level}</span>
                <span className="text-xs font-mono" style={{ color: '#444' }}>{totalXP.toLocaleString()} XP</span>
                {streak > 0 && (
                  <span className="text-xs" style={{ color: '#f97316' }}>🔥 {streak}d</span>
                )}
              </div>
            </div>
            <div className="flex gap-5">
              <div className="text-right">
                <div className="text-xl font-black text-white">{completedSessions.length}</div>
                <div className="text-xs" style={{ color: '#333' }}>Sessions</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black" style={{ color }}>{completedLessons.length}</div>
                <div className="text-xs" style={{ color: '#333' }}>Lessons</div>
              </div>
            </div>
          </div>

          <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: '#1a1a1a' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          {nextLevel && (
            <div className="text-xs" style={{ color: '#333' }}>
              {(XP_RANGES[nextLevel][0] - totalXP).toLocaleString()} XP to {nextLevel}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {([
            { label: 'Studio', sub: 'Mix now', icon: Music2, page: 'studio' as const, accent: '#a855f7' },
            { label: 'Mixes', sub: `${progress.compositions.length} saved`, icon: Play, page: 'compositions' as const, accent: '#06b6d4' },
            { label: 'Awards', sub: `${totalXP} XP`, icon: Trophy, page: 'achievements' as const, accent: '#f59e0b' },
          ]).map(item => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPage(item.page)}
              className="flex flex-col items-start p-3 rounded-xl"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
            >
              <item.icon size={13} style={{ color: item.accent, marginBottom: 6 }} />
              <div className="text-xs font-bold text-white">{item.label}</div>
              <div className="text-xs" style={{ color: '#3a3a3a' }}>{item.sub}</div>
            </motion.button>
          ))}
        </div>

        {/* Sessions by level */}
        {LEVEL_ORDER.map((lvl) => {
          const sessions = sessionsByLevel[lvl];
          const lc = LEVEL_COLORS[lvl];
          const isUnlocked = LEVEL_ORDER.indexOf(lvl) <= LEVEL_ORDER.indexOf(level);

          return (
            <motion.div
              key={lvl}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: LEVEL_ORDER.indexOf(lvl) * 0.05 }}
              className="mb-5"
            >
              <div className="flex items-center gap-2 mb-2 px-1">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isUnlocked ? lc : '#252525' }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest capitalize"
                  style={{ color: isUnlocked ? lc : '#2a2a2a' }}
                >
                  {lvl}
                </span>
                {!isUnlocked && (
                  <span className="text-xs ml-1" style={{ color: '#252525' }}>
                    — unlock by completing previous level
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sessions.map((session) => {
                  const done = completedSessions.includes(session.id);
                  const current = progress.currentSession === session.id;
                  const canOpen = isUnlocked;

                  return (
                    <motion.div
                      key={session.id}
                      whileTap={canOpen ? { scale: 0.98 } : {}}
                      className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                      style={{
                        background: done ? `${lc}0c` : '#0d0d0d',
                        border: `1px solid ${done ? lc + '28' : current ? lc + '20' : '#1a1a1a'}`,
                        opacity: canOpen ? 1 : 0.35,
                        cursor: canOpen ? 'pointer' : 'not-allowed',
                        boxShadow: current && canOpen ? `0 0 16px ${lc}15` : 'none',
                      }}
                      onClick={() => {
                        if (!canOpen) return;
                        setActiveSession(session.id);
                        setPage('session');
                      }}
                    >
                      <span className="text-xl shrink-0">{session.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{session.title}</div>
                        <div className="text-xs truncate" style={{ color: '#444' }}>{session.subtitle}</div>
                        <div className="text-xs mt-1" style={{ color: '#333' }}>
                          {session.duration} · {session.lessons.length} lessons
                        </div>
                      </div>
                      <div className="shrink-0">
                        {done ? (
                          <CheckCircle size={14} style={{ color: lc }} />
                        ) : !canOpen ? (
                          <Lock size={12} style={{ color: '#2a2a2a' }} />
                        ) : current ? (
                          <Zap size={14} style={{ color: lc }} />
                        ) : (
                          <ChevronRight size={14} style={{ color: '#2a2a2a' }} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
