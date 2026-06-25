import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Star, Lightbulb, Target, BookOpen, Play, Trophy } from 'lucide-react';
import { YUICharacter } from '../components/YUI/YUICharacter';
import { useAppStore } from '../store/appStore';
import { SESSIONS } from '../data/sessions';
import type { YUIExpression } from '../types';

const LEVEL_COLORS = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#a855f7',
  pro: '#ec4899',
};

export function SessionView() {
  const {
    activeSessionId, activeLessonIndex, setActiveLessonIndex,
    setPage, completeLesson, completeSession, markLessonComplete,
    completedLessons, addXP
  } = useAppStore();

  const session = SESSIONS.find(s => s.id === activeSessionId);
  const [yuiDialogIdx, setYuiDialogIdx] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-white/40">Session not found</div>
    </div>
  );

  const lesson = session.lessons[activeLessonIndex];
  const color = LEVEL_COLORS[session.level];
  const isLastLesson = activeLessonIndex === session.lessons.length - 1;
  const isLessonDone = completedLessons.includes(lesson.id);

  const yuiExpression: YUIExpression =
    yuiDialogIdx === 0 ? 'excited' :
    yuiDialogIdx === lesson.yuiDialog.length - 1 ? 'encouraging' :
    'teaching';

  const handleNextDialog = () => {
    if (yuiDialogIdx < lesson.yuiDialog.length - 1) {
      setYuiDialogIdx(d => d + 1);
    }
  };

  const handleCompleteLesson = () => {
    if (!isLessonDone) {
      markLessonComplete(lesson.id);
      completeLesson(session.id, lesson.id);
      addXP(50);
    }
    setLessonComplete(true);
  };

  const handleNextLesson = () => {
    if (isLastLesson) {
      completeSession(session.id);
      addXP(200);
      setPage('dashboard');
    } else {
      setActiveLessonIndex(activeLessonIndex + 1);
      setYuiDialogIdx(0);
      setLessonComplete(false);
      setShowChallenge(false);
    }
  };

  useEffect(() => {
    setYuiDialogIdx(0);
    setLessonComplete(isLessonDone);
    setShowChallenge(false);
  }, [activeLessonIndex, lesson.id, isLessonDone]);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 50% 0%, ${color}08 0%, transparent 60%)`
      }} />

      {/* Top bar */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg">{session.icon}</span>
          <div className="text-center hidden sm:block">
            <div className="text-sm font-bold text-white">{session.title}</div>
            <div className="text-xs text-white/40 capitalize">{session.level} • Session {session.id}</div>
          </div>
        </div>

        {/* Lesson progress pills */}
        <div className="flex gap-1">
          {session.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { setActiveLessonIndex(i); setYuiDialogIdx(0); }}
              className="w-6 h-2 rounded-full transition-all"
              style={{
                background: completedLessons.includes(l.id)
                  ? color
                  : i === activeLessonIndex
                    ? `${color}88`
                    : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        {/* Lesson header */}
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full font-semibold capitalize"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
              {session.level}
            </span>
            <span className="text-xs text-white/30">
              Lesson {activeLessonIndex + 1} of {session.lessons.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{lesson.title}</h1>
        </motion.div>

        {/* YUI Dialog section */}
        <motion.div
          key={lesson.id + '-yui'}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-5 mb-5 flex items-start gap-4"
        >
          <div className="shrink-0">
            <YUICharacter
              expression={yuiExpression}
              size="sm"
              showBubble={false}
              floating={true}
            />
          </div>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={yuiDialogIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-white/90 leading-relaxed text-sm"
              >
                {lesson.yuiDialog[yuiDialogIdx]}
              </motion.p>
            </AnimatePresence>

            {yuiDialogIdx < lesson.yuiDialog.length - 1 && (
              <button
                onClick={handleNextDialog}
                className="mt-3 text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color }}
              >
                Continue <ChevronRight size={12} />
              </button>
            )}

            {/* Dialog dots */}
            <div className="flex gap-1 mt-3">
              {lesson.yuiDialog.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === yuiDialogIdx ? color : 'rgba(255,255,255,0.2)' }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          key={lesson.id + '-content'}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} style={{ color }} />
            <h2 className="font-bold text-white">Lesson Content</h2>
          </div>
          <p className="text-white/70 leading-relaxed text-sm">{lesson.content}</p>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} style={{ color: '#f59e0b' }} />
            <h2 className="font-bold text-white">Pro Tips from YUI</h2>
          </div>
          <div className="flex flex-col gap-3">
            {lesson.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}20` }}>
                  <Star size={10} style={{ color }} />
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Challenge */}
        {lesson.challenge && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-5"
          >
            <button
              onClick={() => setShowChallenge(c => !c)}
              className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
              style={{
                background: showChallenge ? `${color}15` : '#111',
                border: `1px solid ${showChallenge ? color + '60' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}20` }}>
                <Target size={18} style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">Practice Challenge</div>
                <div className="text-xs text-white/40 mt-0.5">+100 XP — Click to reveal</div>
              </div>
              <ChevronRight size={16} className={`text-white/30 transition-transform ${showChallenge ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showChallenge && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass rounded-2xl p-4 mt-2 flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="text-white/80 text-sm leading-relaxed">{lesson.challenge}</p>
                      <button
                        onClick={() => { addXP(100); setShowChallenge(false); }}
                        className="mt-3 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ background: `${color}30`, color, border: `1px solid ${color}50` }}
                      >
                        ✓ Mark Challenge Complete (+100 XP)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Complete & Navigate */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3"
        >
          {activeLessonIndex > 0 && (
            <button
              onClick={() => { setActiveLessonIndex(activeLessonIndex - 1); setYuiDialogIdx(0); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl glass text-white/60 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={14} /> Prev
            </button>
          )}

          <button
            onClick={lessonComplete ? handleNextLesson : handleCompleteLesson}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105 active:scale-95 text-sm"
            style={{
              background: lessonComplete
                ? `linear-gradient(135deg, ${color}, ${color}88)`
                : `linear-gradient(135deg, #a855f7, #ec4899)`,
              boxShadow: `0 6px 20px ${color}40`,
            }}
          >
            {lessonComplete ? (
              isLastLesson ? (
                <><Trophy size={16} /> Complete Session! (+200 XP)</>
              ) : (
                <><ChevronRight size={16} /> Next Lesson</>
              )
            ) : (
              <><CheckCircle size={16} /> Mark Complete (+50 XP)</>
            )}
          </button>

          {/* Studio shortcut */}
          <button
            onClick={() => setPage('studio')}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl glass text-white/60 hover:text-white transition-colors text-sm"
            title="Practice in Studio"
          >
            <Play size={14} /> Studio
          </button>
        </motion.div>

        {/* Navigation hint */}
        {lessonComplete && !isLastLesson && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-white/30 mt-3"
          >
            Great work! Lesson {activeLessonIndex + 1} complete. +50 XP earned!
          </motion.p>
        )}
      </div>
    </div>
  );
}
