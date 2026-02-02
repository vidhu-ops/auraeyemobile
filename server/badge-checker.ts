import { db } from "./db";
import { achievements, auraReadings, vibeReadings, numerologyReadings, objectAnalyses, journals, meditationSessions, users } from "../shared/schema";
import { eq, or, sql } from "drizzle-orm";

export interface BadgeReward {
  type: string;
  title: string;
  description: string;
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum";
}

const BADGE_THRESHOLDS = {
  // Aura badges
  first_aura: { count: 1, activity: "aura" },
  third_aura: { count: 3, activity: "aura" },
  aura_master: { count: 10, activity: "aura" },
  aura_legend: { count: 25, activity: "aura" },
  
  // Vibe badges
  first_vibe: { count: 1, activity: "vibe" },
  vibe_enthusiast: { count: 5, activity: "vibe" },
  vibe_master: { count: 15, activity: "vibe" },
  vibe_legend: { count: 30, activity: "vibe" },
  
  // Numerology badges
  first_numerology: { count: 1, activity: "numerology" },
  numerology_explorer: { count: 3, activity: "numerology" },
  numerology_master: { count: 10, activity: "numerology" },
  numerology_sage: { count: 20, activity: "numerology" },
  
  // Object scan badges
  first_object: { count: 1, activity: "object" },
  object_explorer: { count: 5, activity: "object" },
  object_master: { count: 15, activity: "object" },
  object_sage: { count: 30, activity: "object" },
  
  // Journal badges
  first_journal: { count: 1, activity: "journal" },
  journal_keeper: { count: 5, activity: "journal" },
  journal_master: { count: 20, activity: "journal" },
  journal_legend: { count: 50, activity: "journal" },
  
  // Meditation badges
  first_meditation: { count: 1, activity: "meditation" },
  meditation_seeker: { count: 5, activity: "meditation" },
  meditation_master: { count: 15, activity: "meditation" },
  
  // Streaks (These need separate logic but we'll include thresholds for consistency)
  seven_day_streak: { count: 7, activity: "login_streak" },
};

const BADGE_DEFINITIONS: Record<string, BadgeReward> = {
  // Aura badges
  first_aura: {
    type: "first_aura",
    title: "First Glimpse 👀",
    description: "Completed your first aura analysis",
    icon: "🎨",
    level: "bronze",
  },
  third_aura: {
    type: "third_aura",
    title: "Aura Explorer 🔍",
    description: "Completed 3 aura analyses",
    icon: "🔍",
    level: "silver",
  },
  aura_master: {
    type: "aura_master",
    title: "Aura Master 🌟",
    description: "Completed 10 aura analyses",
    icon: "⭐",
    level: "gold",
  },
  aura_legend: {
    type: "aura_legend",
    title: "Aura Legend 👑",
    description: "Completed 25 aura analyses",
    icon: "👑",
    level: "platinum",
  },
  
  // Vibe badges
  first_vibe: {
    type: "first_vibe",
    title: "Vibe Check ✨",
    description: "Completed your first vibe scan",
    icon: "✨",
    level: "bronze",
  },
  vibe_enthusiast: {
    type: "vibe_enthusiast",
    title: "Vibe Enthusiast 💫",
    description: "Completed 5 vibe checks",
    icon: "💫",
    level: "silver",
  },
  vibe_master: {
    type: "vibe_master",
    title: "Vibe Master 🎯",
    description: "Completed 15 vibe checks",
    icon: "🎯",
    level: "gold",
  },
  vibe_legend: {
    type: "vibe_legend",
    title: "Vibe Legend 👑",
    description: "Completed 30 vibe checks",
    icon: "👑",
    level: "platinum",
  },
  
  // Numerology badges
  first_numerology: {
    type: "first_numerology",
    title: "Number Vision 🔢",
    description: "Completed your first numerology reading",
    icon: "🔢",
    level: "bronze",
  },
  numerology_explorer: {
    type: "numerology_explorer",
    title: "Numerology Explorer 📊",
    description: "Completed 3 numerology readings",
    icon: "📊",
    level: "silver",
  },
  numerology_master: {
    type: "numerology_master",
    title: "Numerology Master 🧮",
    description: "Completed 10 numerology readings",
    icon: "🧮",
    level: "gold",
  },
  numerology_sage: {
    type: "numerology_sage",
    title: "Numerology Sage 🔮",
    description: "Completed 20 numerology readings",
    icon: "🔮",
    level: "platinum",
  },
  
  // Object scan badges
  first_object: {
    type: "first_object",
    title: "Object Insight 🏛️",
    description: "Completed your first object analysis",
    icon: "🏛️",
    level: "bronze",
  },
  object_explorer: {
    type: "object_explorer",
    title: "Object Explorer 🔎",
    description: "Completed 5 object scans",
    icon: "🔎",
    level: "silver",
  },
  object_master: {
    type: "object_master",
    title: "Object Master 🎭",
    description: "Completed 15 object scans",
    icon: "🎭",
    level: "gold",
  },
  object_sage: {
    type: "object_sage",
    title: "Object Sage 🌿",
    description: "Completed 30 object scans",
    icon: "🌿",
    level: "platinum",
  },
  
  // Journal badges
  first_journal: {
    type: "first_journal",
    title: "Thoughts Flow 📖",
    description: "Wrote your first journal entry",
    icon: "📝",
    level: "bronze",
  },
  journal_keeper: {
    type: "journal_keeper",
    title: "Journal Keeper 📚",
    description: "Wrote 5 journal entries",
    icon: "📚",
    level: "silver",
  },
  journal_master: {
    type: "journal_master",
    title: "Journal Master ✍️",
    description: "Wrote 20 journal entries",
    icon: "✍️",
    level: "gold",
  },
  journal_legend: {
    type: "journal_legend",
    title: "Journal Legend 🏆",
    description: "Wrote 50 journal entries",
    icon: "🏆",
    level: "platinum",
  },
  
  // Meditation badges
  first_meditation: {
    type: "first_meditation",
    title: "Inner Peace 🧘",
    description: "Completed your first meditation",
    icon: "🧘",
    level: "bronze",
  },
  meditation_seeker: {
    type: "meditation_seeker",
    title: "Meditation Seeker 🌸",
    description: "Completed 5 meditation sessions",
    icon: "🌸",
    level: "silver",
  },
  meditation_master: {
    type: "meditation_master",
    title: "Meditation Master 💎",
    description: "Completed 15 meditation sessions",
    icon: "💎",
    level: "gold",
  },
  seven_day_streak: {
    type: "seven_day_streak",
    title: "Week Warrior 🔥",
    description: "Maintained a 7-day login streak",
    icon: "🔥",
    level: "bronze",
  },
};

export async function checkAndAwardBadges(userId: number): Promise<BadgeReward[]> {
  try {
    const newBadges: BadgeReward[] = [];
    
    // Count activities for this user
    const [auraCountResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(auraReadings)
      .where(eq(auraReadings.userId, userId));
    
    const [vibeCountResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(vibeReadings)
      .where(eq(vibeReadings.userId, userId));
    
    const [numerologyCountResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(numerologyReadings)
      .where(eq(numerologyReadings.userId, userId));
    
    const [objectCountResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(objectAnalyses)
      .where(eq(objectAnalyses.userId, userId));
    
    const [journalCountResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(journals)
      .where(eq(journals.userId, userId));
    
    const [meditationCountResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));

    const counts = {
      aura: Number(auraCountResult?.count || 0),
      vibe: Number(vibeCountResult?.count || 0),
      numerology: Number(numerologyCountResult?.count || 0),
      object: Number(objectCountResult?.count || 0),
      journal: Number(journalCountResult?.count || 0),
      meditation: Number(meditationCountResult?.count || 0),
      login_streak: 1, // Default to 1 if streak tracking isn't in schema yet
    };

    console.log(`[BadgeCheck] Counts for user ${userId}:`, counts);

    // Badge Type Normalization Map for Storage
    const storageBadgeTypeMap: Record<string, string> = {
      'first glimpse': 'first_aura',
      'aura explorer': 'third_aura',
      'aura master': 'aura_master',
      'aura legend': 'aura_legend',
      'number seeker': 'first_numerology',
      'number vision': 'first_numerology',
      'numerology explorer': 'numerology_explorer',
      'numerology master': 'numerology_master',
      'numerology legend': 'numerology_sage',
      'numerology sage': 'numerology_sage',
      'vibe check': 'first_vibe',
      'vibe enthusiast': 'vibe_enthusiast',
      'vibe master': 'vibe_master',
      'vibe legend': 'vibe_legend',
      'thoughts flow': 'first_journal',
      'journal keeper': 'journal_keeper',
      'journal master': 'journal_master',
      'journal legend': 'journal_master',
      'reflection hour': 'reflection_hour',
      'inner peace': 'first_meditation',
      'meditation seeker': 'meditation_seeker',
      'meditation master': 'meditation_master',
    };

    
    // Check each badge threshold
    for (const [badgeType, threshold] of Object.entries(BADGE_THRESHOLDS)) {
      const activityCount = counts[threshold.activity as keyof typeof counts];
      
      if (activityCount >= threshold.count) {
        const existing = await db.query.achievements.findFirst({
          where: (a, { and, eq: eqOp }) => and(
            eqOp(a.userId, userId),
            eqOp(a.achievementType, badgeType)
          ),
        });
        
        if (!existing) {
          const badgeInfo = BADGE_DEFINITIONS[badgeType];
          if (badgeInfo) {
            await db.insert(achievements).values({
              userId,
              achievementType: badgeType,
              title: badgeInfo.title,
              description: badgeInfo.description,
              icon: badgeInfo.icon,
              tier: badgeInfo.level.toUpperCase(),
            } as any);
            
            newBadges.push(badgeInfo);
          }
        }
      }
    }
    
    return newBadges;
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
    return [];
  }
}

export function getBadgeDefinition(badgeType: string): BadgeReward | undefined {
  return BADGE_DEFINITIONS[badgeType];
}
