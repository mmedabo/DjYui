import { motion } from 'framer-motion';
import { ChevronRight, Lock, CheckCircle, Star, Zap, Music, BookOpen, Play, Trophy } from 'lucide-react';
import { YUICharacter } from '../components/YUI/YUICharacter';
import { useAppStore } from '../store/appStore';
import { SESSIONS } from '../data/sessions';
import type { Level } from '../types';

const LEVEL_COLORS: Record<Level, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#a855f7',
  pro: '#ec4899',
};

const XP_THRESHOLDS = { beginner: 0, intermediate: 800, advanced: 2000, pro: 5000 };

function getNextLevel(xp: number): { next: Level | null; threshold: number } {
  if (xp < 800) return { next: 'intermediate', threshold: 800 };
  if (xp < 2000) return { next: 'advanced', threshold: 2000 };
  if (xp < 5000) return { next: 'pro', threshold: 5000 };
  return { next: null, threshold: 5000 };
}

export function Dashboard() {
  const { progress, setPage, setActiveSession, completedLessons } = useAppStore();
  const { totalXP, level, completedSessions, streak } = progress;

  const nextLevel = getNextLevel(totalXP);
  const xpProgress = nextLevel.next
    ? (totalXP - XP_THRESHOLDS[level]) / (nextLevel.threshold - XP_THRESHOLDS[level])
    : 1;

  const yuiMessages: Record<Level, string> = {
    beginner: "You're just starting your DJ journey! Let's nail the fundamentals first! 🎵",
    intermediate: "Great progress! Your mixes are getting cleaner. Now let's add effects! ✨",
    advanced: "Wow, look at you! Advanced techniques await — ready to scratch? 🔥",
    pro: "You're a PRO DJ now! The world needs to hear your sets! 🎤",
  };

  const sessionsByLevel = {
    beginner: SESSIONS.filter(s => s.level === 'beginner'),
    intermediate: SESSIONS.filter(s => s.level === 'intermediate'),
    advanced: SESSIONS.filter(s => s.level === 'advanced'),
    pro: SESSIONS.filter(s => s.level === 'pro'),
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.06) 0%, transparent 60%)'
      }} />

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={() => setPage('landing')}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            🎧
          </div>
          <span className="font-bold text-white text-sm">DJ YUI</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage('studio')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass text-white/70 hover:text-white transition-colors">
            <Music size={12} /> Studio
          </button>
          <button onClick={() => setPage('compositions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass text-white/70 hover:text-white transition-colors">
            <Play size={12} /> Mixes
          </button>
          <button onClick={() => setPage('achievements')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass text-white/70 hover:text-white transition-colors">
            <Trophy size={12} className="text-yellow-400" /> Achievements
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Header with YUI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-8 glass rounded-3xl p-5"
        >
          <YUICharacter
            expression={level === 'beginner' ? 'teaching' : level === 'pro' ? 'celebrating' : 'encouraging'}
            size="md"
            showBubble={true}
            message={yuiMessages[level]}
            floating={false}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white mb-1">
              Welcome back! 👋
            </h1>
            <p className="text-white/50 text-sm mb-4">{yuiMessages[level]}</p>

            {/* XP / Level bar */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: LEVEL_COLORS[level] }}>
                  <Star size={10} fill="white" className="text-white" />
                </div>
                <span className="text-sm font-bold capitalize" style={{ color: LEVEL_COLORS[level] }}>
                  {level}
                </span>
              </div>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-xs text-white/50 font-mono">{totalXP} XP</span>
              {streak > 0 && (
                <>
                  <span className="text-white/30 text-xs">•</span>
                  <span className="text-xs text-orange-400">🔥 {streak} day streak</span>
                </>
              )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpProgress * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full progress-bar"
              />
            </div>
            {nextLevel.next && (
              <div className="text-xs text-white/30 mt-1">
                {nextLevel.threshold - totalXP} XP to {nextLevel.next}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="hidden md:flex flex-col gap-3 shrink-0">
            <div className="glass-dark rounded-xl p-3 text-center min-w-[80px]">
              <div className="text-xl font-black text-white">{completedSessions.length}</div>
              <div className="text-xs text-white/40">Sessions</div>
            </div>
            <div className="glass-dark rounded-xl p-3 text-center">
              <div className="text-xl font-black" style={{ color: '#f59e0b' }}>{completedLessons.length}</div>
              <div className="text-xs text-white/40">Lessons</div>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🎛️', label: 'Open Studio', action: () => setPage('studio'), color: '#a855f7' },
            { icon: '📼', label: 'My Mixes', action: () => setPage('compositions'), color: '#06b6d4' },
            { icon: '🏆', label: `${totalXP} XP`, action: () => setPage('achievements'), color: '#f59e0b' },
          ].map(item => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={item.action}
              className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Sessions by level */}
        {(Object.keys(sessionsByLevel) as Level[]).map((lvl) => {
          const sessions = sessionsByLevel[lvl];
          const color = LEVEL_COLORS[lvl];
          const levelOrder: Level[] = ['beginner', 'intermediate', 'advanced', 'pro'];
          const isUnlocked = levelOrder.indexOf(lvl) <= levelOrder.indexOf(level);

          return (
            <motion.div
              key={lvl}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: levelOrder.indexOf(lvl) * 0.1 }}
              className="mb-6"
            >
              {/* Level header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: color, opacity: isUnlocked ? 1 : 0.4 }}>
                  {isUnlocked ? <BookOpen size={12} className="text-white" /> : <Lock size={12} className="text-white" />}
                </div>
                <h2 className="font-bold capitalize" style={{ color: isUnlocked ? color : 'rgba(255,255,255,0.3)' }}>
                  {lvl} Track
                </h2>
                <div className="flex-1 h-px" style={{ background: isUnlocked ? `${color}44` : 'rgba(255,255,255,0.06)' }} />
                {!isUnlocked && (
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Lock size={10} /> Complete previous level
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sessions.map((session) => {
                  const isCompleted = completedSessions.includes(session.id);
                  const isCurrent = progress.currentSession === session.id;
                  const isAccessible = isUnlocked;

                  return (
                    <motion.div
                      key={session.id}
                      whileHover={isAccessible ? { scale: 1.02 } : {}}
                      whileTap={isAccessible ? { scale: 0.98 } : {}}
                      className="relative rounded-2xl p-4 transition-all cursor-pointer"
                      style={{
                        background: isCompleted
                          ? `${color}15`
                          : isCurrent
                            ? `${color}10`
                            : '#111',
                        border: `1px solid ${isCompleted ? color + '60' : isCurrent ? color + '40' : 'rgba(255,255,255,0.06)'}`,
                        opacity: isAccessible ? 1 : 0.45,
                        cursor: isAccessible ? 'pointer' : 'not-allowed',
                        boxShadow: isCurrent ? `0 0 20px ${color}20` : 'none',
                      }}
                      onClick={() => {
                        if (!isAccessible) return;
                        setActiveSession(session.id);
                        setPage('session');
                      }}
                    >
                      {/* Session number */}
                      <div className="absolute top-3 right-3">
                        {isCompleted ? (
                          <CheckCircle size={18} style={{ color }} />
                        ) : !isAccessible ? (
                          <Lock size={14} className="text-white/20" />
                        ) : isCurrent ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Zap size={16} style={{ color }} />
                          </motion.div>
                        ) : (
                          <span className="text-xs text-white/20 font-mono">#{session.id}</span>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{session.icon}</span>
                        <div className="flex-1 min-w-0 pr-6">
                          <h3 className="font-bold text-white text-sm leading-tight">{session.title}</h3>
                          <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{session.subtitle}</p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${color}15`, color: `${color}cc`, border: `1px solid ${color}30` }}>
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                            <span>⏱ {session.duration}</span>
                            <span>📚 {session.lessons.length} lessons</span>
                          </div>
                        </div>
                      </div>

                      {isCurrent && isAccessible && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
                            <Play size={10} fill="currentColor" /> Continue
                          </div>
                          <ChevronRight size={14} style={{ color }} />
                        </div>
                      )}
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
