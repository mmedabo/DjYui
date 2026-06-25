import { AnimatePresence, motion } from 'framer-motion';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { SessionView } from './pages/SessionView';
import { DJStudio } from './pages/DJStudio';
import { Compositions } from './pages/Compositions';
import { YUIPanel } from './components/YUI/YUIPanel';
import { AchievementsPanel } from './components/Achievements/AchievementsPanel';
import { useAppStore } from './store/appStore';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

export default function App() {
  const { currentPage, setPage } = useAppStore();

  return (
    <div style={{ minHeight: '100vh', background: '#000000' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {currentPage === 'landing' && <Landing />}
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'session' && <SessionView />}
          {currentPage === 'studio' && <DJStudio />}
          {currentPage === 'compositions' && <Compositions />}
          {currentPage === 'achievements' && (
            <AchievementsPanel onClose={() => setPage('dashboard')} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* YUI persistent panel — not on landing, studio, achievements, or session (session has inline YUI) */}
      {currentPage !== 'landing' && currentPage !== 'studio' && currentPage !== 'achievements' && currentPage !== 'session' && <YUIPanel />}
    </div>
  );
}
