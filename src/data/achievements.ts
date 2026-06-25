export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: AchievementStats) => boolean;
  category: 'learning' | 'studio' | 'composition' | 'milestone';
}

export interface AchievementStats {
  totalXP: number;
  completedSessions: number[];
  completedLessons: string[];
  compositions: number;
  deckAPlays: number;
  deckBPlays: number;
  crossfaderMoves: number;
  eqAdjustments: number;
  scratchCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Learning achievements
  { id: 'first-lesson',    title: 'First Step',        description: 'Complete your first lesson',            icon: '🎵', xpReward: 50,   category: 'learning',     condition: s => s.completedLessons.length >= 1 },
  { id: 'five-lessons',    title: 'Getting Into It',   description: 'Complete 5 lessons',                    icon: '📚', xpReward: 100,  category: 'learning',     condition: s => s.completedLessons.length >= 5 },
  { id: 'ten-lessons',     title: 'Dedicated Learner', description: 'Complete 10 lessons',                   icon: '🎓', xpReward: 200,  category: 'learning',     condition: s => s.completedLessons.length >= 10 },
  { id: 'all-beginner',    title: 'Foundations Laid',  description: 'Complete all Beginner sessions (1-4)',  icon: '🏗️', xpReward: 300,  category: 'learning',     condition: s => [1,2,3,4].every(id => s.completedSessions.includes(id)) },
  { id: 'all-intermediate',title: 'Level Up!',         description: 'Complete all Intermediate sessions',    icon: '⚡', xpReward: 500,  category: 'learning',     condition: s => [5,6,7,8].every(id => s.completedSessions.includes(id)) },
  { id: 'all-advanced',    title: 'Advanced DJ',       description: 'Complete all Advanced sessions',        icon: '🔥', xpReward: 750,  category: 'learning',     condition: s => [9,10].every(id => s.completedSessions.includes(id)) },
  { id: 'all-pro',         title: 'Pro Status',        description: 'Complete ALL 12 sessions',              icon: '👑', xpReward: 1000, category: 'learning',     condition: s => [1,2,3,4,5,6,7,8,9,10,11,12].every(id => s.completedSessions.includes(id)) },
  { id: 'scratch-session', title: 'Turntablist',       description: 'Complete the Scratching session',       icon: '💿', xpReward: 250,  category: 'learning',     condition: s => s.completedSessions.includes(9) },

  // Studio achievements
  { id: 'first-play',      title: 'Press Play!',       description: 'Play a track on any deck',              icon: '▶️',  xpReward: 25,   category: 'studio',       condition: s => s.deckAPlays + s.deckBPlays >= 1 },
  { id: 'both-decks',      title: 'Two Turntables',    description: 'Play on both Deck A and Deck B',        icon: '🎛️', xpReward: 75,   category: 'studio',       condition: s => s.deckAPlays >= 1 && s.deckBPlays >= 1 },
  { id: 'eq-master',       title: 'EQ Master',         description: 'Adjust the EQ 20 times',                icon: '📊', xpReward: 100,  category: 'studio',       condition: s => s.eqAdjustments >= 20 },
  { id: 'crossfader',      title: 'The Cross',         description: 'Move the crossfader 10 times',          icon: '🔀', xpReward: 75,   category: 'studio',       condition: s => s.crossfaderMoves >= 10 },
  { id: 'scratch-star',    title: 'Scratch Star',      description: 'Perform 5 vinyl scratches in the studio',icon: '⭐', xpReward: 150,  category: 'studio',       condition: s => s.scratchCount >= 5 },

  // Composition achievements
  { id: 'first-mix',       title: 'First Mix!',        description: 'Save your first composition',           icon: '💾', xpReward: 150,  category: 'composition',  condition: s => s.compositions >= 1 },
  { id: 'three-mixes',     title: 'Mix Tape',          description: 'Save 3 compositions',                   icon: '📼', xpReward: 250,  category: 'composition',  condition: s => s.compositions >= 3 },
  { id: 'ten-mixes',       title: 'Prolific Producer', description: 'Save 10 compositions',                  icon: '🎤', xpReward: 500,  category: 'composition',  condition: s => s.compositions >= 10 },

  // XP milestones
  { id: 'xp-500',          title: 'Rising Star',       description: 'Earn 500 XP',                           icon: '🌟', xpReward: 0,    category: 'milestone',    condition: s => s.totalXP >= 500 },
  { id: 'xp-1000',         title: 'DJ in Training',    description: 'Earn 1,000 XP',                         icon: '🏅', xpReward: 0,    category: 'milestone',    condition: s => s.totalXP >= 1000 },
  { id: 'xp-2500',         title: 'Skilled Mixer',     description: 'Earn 2,500 XP',                         icon: '🥈', xpReward: 0,    category: 'milestone',    condition: s => s.totalXP >= 2500 },
  { id: 'xp-5000',         title: 'Pro DJ',            description: 'Earn 5,000 XP — You\'re a Pro!',        icon: '🥇', xpReward: 0,    category: 'milestone',    condition: s => s.totalXP >= 5000 },
];
