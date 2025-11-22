export interface BadgeDefinition {
  type: string;
  title: string;
  description: string;
  icon: string;
  activity: 'aura' | 'vibe' | 'journal' | 'numerology' | 'general';
  requirement: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  color: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // AURA BADGES
  {
    type: 'first_aura',
    title: 'First Glimpse 👀',
    description: 'Completed your first aura analysis',
    icon: '🎨',
    activity: 'aura',
    requirement: 'Scan 1 aura',
    level: 'bronze',
    color: 'from-amber-500 to-orange-600'
  },
  {
    type: 'third_aura',
    title: 'Aura Explorer 🔍',
    description: 'Completed 3 aura analyses',
    icon: '🔍',
    activity: 'aura',
    requirement: 'Scan 3 auras',
    level: 'silver',
    color: 'from-slate-400 to-slate-600'
  },
  {
    type: 'aura_master',
    title: 'Aura Master 🌟',
    description: 'Completed 10 aura analyses',
    icon: '⭐',
    activity: 'aura',
    requirement: 'Scan 10 auras',
    level: 'gold',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    type: 'aura_legend',
    title: 'Aura Legend 👑',
    description: 'Completed 25 aura analyses',
    icon: '👑',
    activity: 'aura',
    requirement: 'Scan 25 auras',
    level: 'platinum',
    color: 'from-cyan-300 to-blue-600'
  },

  // VIBE CHECK BADGES
  {
    type: 'first_vibe',
    title: 'Vibe Check ✨',
    description: 'Completed your first vibe scan',
    icon: '✨',
    activity: 'vibe',
    requirement: 'Check vibe 1x',
    level: 'bronze',
    color: 'from-pink-500 to-rose-600'
  },
  {
    type: 'vibe_enthusiast',
    title: 'Vibe Enthusiast 💫',
    description: 'Completed 5 vibe checks',
    icon: '💫',
    activity: 'vibe',
    requirement: 'Check vibe 5x',
    level: 'silver',
    color: 'from-purple-400 to-purple-600'
  },
  {
    type: 'vibe_master',
    title: 'Vibe Master 🎯',
    description: 'Completed 15 vibe checks',
    icon: '🎯',
    activity: 'vibe',
    requirement: 'Check vibe 15x',
    level: 'gold',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    type: 'vibe_legend',
    title: 'Vibe Legend 🌈',
    description: 'Completed 30 vibe checks',
    icon: '🌈',
    activity: 'vibe',
    requirement: 'Check vibe 30x',
    level: 'platinum',
    color: 'from-cyan-300 to-blue-600'
  },

  // JOURNAL BADGES
  {
    type: 'first_journal',
    title: 'Thoughts Flow 📖',
    description: 'Wrote your first journal entry',
    icon: '📝',
    activity: 'journal',
    requirement: 'Write 1 entry',
    level: 'bronze',
    color: 'from-orange-500 to-red-600'
  },
  {
    type: 'journal_keeper',
    title: 'Journal Keeper 📚',
    description: 'Wrote 5 journal entries',
    icon: '📚',
    activity: 'journal',
    requirement: 'Write 5 entries',
    level: 'silver',
    color: 'from-slate-400 to-slate-600'
  },
  {
    type: 'journal_master',
    title: 'Journal Master 🖋️',
    description: 'Wrote 20 journal entries',
    icon: '🖋️',
    activity: 'journal',
    requirement: 'Write 20 entries',
    level: 'gold',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    type: 'journal_legend',
    title: 'Journal Legend 📜',
    description: 'Wrote 50 journal entries',
    icon: '📜',
    activity: 'journal',
    requirement: 'Write 50 entries',
    level: 'platinum',
    color: 'from-cyan-300 to-blue-600'
  },

  // NUMEROLOGY BADGES
  {
    type: 'first_numerology',
    title: 'Number Seeker 🔢',
    description: 'Completed your first numerology reading',
    icon: '🔢',
    activity: 'numerology',
    requirement: 'Read 1 numerology',
    level: 'bronze',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    type: 'numerology_explorer',
    title: 'Numerology Explorer 🧮',
    description: 'Completed 5 numerology readings',
    icon: '🧮',
    activity: 'numerology',
    requirement: 'Read 5 numerologies',
    level: 'silver',
    color: 'from-slate-400 to-slate-600'
  },
  {
    type: 'numerology_master',
    title: 'Numerology Master 🎲',
    description: 'Completed 15 numerology readings',
    icon: '🎲',
    activity: 'numerology',
    requirement: 'Read 15 numerologies',
    level: 'gold',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    type: 'numerology_legend',
    title: 'Numerology Legend 🔮',
    description: 'Completed 30 numerology readings',
    icon: '🔮',
    activity: 'numerology',
    requirement: 'Read 30 numerologies',
    level: 'platinum',
    color: 'from-cyan-300 to-blue-600'
  },

  // GENERAL BADGES
  {
    type: 'seven_day_streak',
    title: 'Week Warrior 🔥',
    description: 'Maintained a 7-day login streak',
    icon: '🔥',
    activity: 'general',
    requirement: '7-day streak',
    level: 'gold',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    type: 'spiritual_guardian',
    title: 'Spiritual Guardian 🧘',
    description: 'Completed 50 total spiritual services',
    icon: '🧘',
    activity: 'general',
    requirement: '50 services',
    level: 'platinum',
    color: 'from-cyan-300 to-blue-600'
  },

  // HEALER BADGES
  {
    type: 'healer_five_replies',
    title: 'Healing Heart 💚',
    description: 'Provided 5 healing replies as a healer',
    icon: '💚',
    activity: 'general',
    requirement: '5 healer replies',
    level: 'silver',
    color: 'from-green-500 to-emerald-600'
  },
  {
    type: 'healer_most_replies',
    title: 'Most Trusted Healer 👑',
    description: 'Became the top healer with most replies',
    icon: '👑',
    activity: 'general',
    requirement: 'Most healer replies',
    level: 'platinum',
    color: 'from-yellow-400 to-orange-600'
  },
  {
    type: 'best_healer_rating',
    title: 'Best Healer ⭐',
    description: 'Achieved the highest healer rating',
    icon: '⭐',
    activity: 'general',
    requirement: 'Highest rating',
    level: 'platinum',
    color: 'from-purple-400 to-pink-600'
  },

  // JOURNALING TIME BADGES
  {
    type: 'journaling_one_hour',
    title: 'Reflection Hour 📝',
    description: 'Spent 1 hour total journaling',
    icon: '📝',
    activity: 'journal',
    requirement: '1 hour journaling',
    level: 'bronze',
    color: 'from-amber-500 to-orange-600'
  },
  {
    type: 'journaling_ten_hours',
    title: 'Inner Voice 🎧',
    description: 'Spent 10 hours journaling',
    icon: '🎧',
    activity: 'journal',
    requirement: '10 hours journaling',
    level: 'gold',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    type: 'journaling_master',
    title: 'Stream of Consciousness 🌊',
    description: 'Spent 50+ hours journaling',
    icon: '🌊',
    activity: 'journal',
    requirement: '50+ hours journaling',
    level: 'platinum',
    color: 'from-blue-400 to-cyan-600'
  },
];

export const getActivityBadges = (activity: 'aura' | 'vibe' | 'journal' | 'numerology' | 'general') => {
  return BADGE_DEFINITIONS.filter(b => b.activity === activity);
};

export const getBadgeByType = (type: string) => {
  return BADGE_DEFINITIONS.find(b => b.type === type);
};

export const getActivityColor = (activity: string) => {
  const colors: Record<string, string> = {
    aura: 'from-cyan-600 to-blue-700',
    vibe: 'from-pink-600 to-rose-700',
    journal: 'from-orange-600 to-red-700',
    numerology: 'from-indigo-600 to-purple-700',
    general: 'from-slate-600 to-slate-800'
  };
  return colors[activity] || colors.general;
};

export const getActivityEmoji = (activity: string) => {
  const emojis: Record<string, string> = {
    aura: '🎨',
    vibe: '✨',
    journal: '📖',
    numerology: '🔢',
    general: '🏆'
  };
  return emojis[activity] || '🏆';
};

export const getLevelColor = (level: 'bronze' | 'silver' | 'gold' | 'platinum') => {
  const colors: Record<string, string> = {
    bronze: 'from-amber-500 to-orange-600',
    silver: 'from-slate-400 to-slate-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-300 to-blue-600'
  };
  return colors[level];
};
