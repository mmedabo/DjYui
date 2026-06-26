import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Lightbulb, Target, BookOpen, Play, Trophy } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SESSIONS } from '../data/sessions';
import type { Level } from '../types';

const LEVEL_COLORS: Record<Level, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#a855f7',
  pro: '#ec4899',
};

export function SessionView() {
  const {
    activeSessionId, activeLessonIndex, setActiveLessonIndex,
    setPage, completeLesson, completeSession, markLessonComplete,
    completedLessons, addXP,
  } = useAppStore();

  const session = SESSIONS.find(s => s.id === activeSessionId);
  const [dialogIdx, setDialogIdx] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <div style={{ color: '#444' }}>Session not found</div>
    </div>
  );

  const lesson = session.lessons[activeLessonIndex];
  const color = LEVEL_COLORS[session.level];
  const isLastLesson = activeLessonIndex === session.lessons.length - 1;
  const isLessonDone = completedLessons.includes(lesson.id);

  const handleNextDialog = () => {
    if (dialogIdx < lesson.yuiDialog.length - 1) setDialogIdx(d => d + 1);
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
      setDialogIdx(0);
      setLessonComplete(false);
      setShowChallenge(false);
    }
  };

  useEffect(() => {
    setDialogIdx(0);
    setLessonComplete(isLessonDone);
    setShowChallenge(false);
  }, [activeLessonIndex, lesson.id, isLessonDone]);

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Top nav */}
      <nav
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #141414', position: 'sticky', top: 0, zIndex: 10, background: '#080808' }}
      >
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#555' }}
        >
          <ChevronLeft size={16} />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base">{session.icon}</span>
          <div className="hidden sm:block text-center">
            <div className="text-xs font-semibold text-white">{session.title}</div>
            <div className="text-xs capitalize" style={{ color: '#444' }}>{session.level} · Session {session.id}</div>
          </div>
        </div>

        {/* Lesson progress dots */}
        <div className="flex gap-1">
          {session.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { setActiveLessonIndex(i); setDialogIdx(0); }}
              className="rounded-full transition-all"
              style={{
                width: 20,
                height: 4,
                background: completedLessons.includes(l.id)
                  ? color
                  : i === activeLessonIndex
                    ? `${color}66`
                    : '#1e1e1e',
              }}
            />
          ))}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Lesson header */}
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
              style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
            >
              {session.level}
            </span>
            <span className="text-xs" style={{ color: '#3a3a3a' }}>
              Lesson {activeLessonIndex + 1} of {session.lessons.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{lesson.title}</h1>
        </motion.div>

        {/* Tutor dialog */}
        <motion.div
          key={lesson.id + '-dialog'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl p-4 mb-4"
          style={{ background: `${color}0c`, border: `1px solid ${color}25` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${color}22` }}
            >
              <span style={{ fontSize: 10 }}>🎧</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>DJ Tutor</span>
            <div className="flex gap-1 ml-auto">
              {lesson.yuiDialog.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === dialogIdx ? 16 : 4,
                    height: 4,
                    background: i === dialogIdx ? color : `${color}33`,
                  }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={dialogIdx}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {lesson.yuiDialog[dialogIdx]}
            </motion.p>
          </AnimatePresence>

          {dialogIdx < lesson.yuiDialog.length - 1 && (
            <button
              onClick={handleNextDialog}
              className="mt-3 text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color }}
            >
              Continue <ChevronRight size={12} />
            </button>
          )}
        </motion.div>

        {/* Lesson content */}
        <motion.div
          key={lesson.id + '-content'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} style={{ color }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#666' }}>Lesson Content</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{lesson.content}</p>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#666' }}>Pro Tips</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {lesson.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.06 }}
                className="flex items-start gap-2.5"
              >
                <div
                  className="w-1 h-1 rounded-full shrink-0 mt-2"
                  style={{ background: color }}
                />
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Challenge */}
        {lesson.challenge && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mb-5"
          >
            <AnimatePresence mode="wait">
              {!showChallenge ? (
                <motion.button
                  key="reveal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowChallenge(true)}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
                  style={{
                    background: `${color}10`,
                    border: `1px solid ${color}40`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}20` }}
                  >
                    <Target size={18} style={{ color }} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Practice Challenge</div>
                    <div className="text-xs mt-0.5" style={{ color: `${color}aa` }}>+100 XP · Tap to begin</div>
                  </div>
                </motion.button>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-4"
                  style={{ background: `${color}0c`, border: `1px solid ${color}35` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={14} style={{ color }} />
                    <span className="font-bold text-white text-sm">Your Challenge</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${color}20`, color }}>+100 XP</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{lesson.challenge}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addXP(100); setShowChallenge(false); }}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black transition-all active:scale-[0.97]"
                      style={{ background: color }}
                    >
                      Done — Claim XP
                    </button>
                    <button
                      onClick={() => setShowChallenge(false)}
                      className="px-4 py-2.5 rounded-xl text-sm transition-colors"
                      style={{ background: '#111', border: '1px solid #1e1e1e', color: '#555' }}
                    >
                      Later
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="flex items-center gap-2"
        >
          {activeLessonIndex > 0 && (
            <button
              onClick={() => { setActiveLessonIndex(activeLessonIndex - 1); setDialogIdx(0); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: '#111', border: '1px solid #1e1e1e', color: '#555' }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
          )}

          <button
            onClick={lessonComplete ? handleNextLesson : handleCompleteLesson}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
            style={{
              background: lessonComplete
                ? `linear-gradient(135deg, ${color}, ${color}88)`
                : `linear-gradient(135deg, #a855f7, #ec4899)`,
              color: '#fff',
            }}
          >
            {lessonComplete ? (
              isLastLesson
                ? <><Trophy size={15} /> Complete Session (+200 XP)</>
                : <><ChevronRight size={15} /> Next Lesson</>
            ) : (
              <><CheckCircle size={15} /> Mark Complete (+50 XP)</>
            )}
          </button>

          <button
            onClick={() => setPage('studio')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: '#111', border: '1px solid #1e1e1e', color: '#555' }}
          >
            <Play size={13} /> Studio
          </button>
        </motion.div>

        {lessonComplete && !isLastLesson && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs mt-3"
            style={{ color: '#333' }}
          >
            Lesson {activeLessonIndex + 1} complete · +50 XP earned
          </motion.p>
        )}
      </div>
    </div>
  );
}
