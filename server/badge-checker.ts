import { db } from "./db";
import { achievements, auraReadings, vibeReadings, numerologyReadings, objectAnalyses, journals, meditationSessions } from "../shared/schema";
import { eq, or } from "drizzle-orm";

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
  
  // Meditation badges
  first_meditation: { count: 1, activity: "meditation" },
  meditation_seeker: { count: 5, activity: "meditation" },
  meditation_master: { count: 25, activity: "meditation" },
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
    title: "Vibe Legend 🌈",
    description: "Completed 30 vibe checks",
    icon: "🌈",
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
    title: "Meditation Master 🕉️",
    description: "Completed 25 meditation sessions",
    icon: "🕉️",
    level: "gold",
  },
};

export async function checkAndAwardBadges(userId: number): Promise<BadgeReward[]> {
  try {
    const newBadges: BadgeReward[] = [];
    
    // Count activities for this user
    // For aura readings: count both readings received (userId) and performed (performedBy) for healers
    const [auraCount] = await db.select({ count: db.raw("COUNT(*)::int") })
      .from(auraReadings)
      .where(or(
        eq(auraReadings.userId, userId),
        eq(auraReadings.performedBy, userId)
      ));
    
    // For vibe readings: userId already represents the healer who performed it
    const [vibeCount] = await db.select({ count: db.raw("COUNT(*)::int") })
      .from(vibeReadings)
      .where(eq(vibeReadings.userId, userId));
    
    // For numerology readings: count both readings received (userId) and performed (performedBy) for healers
    const [numerologyCount] = await db.select({ count: db.raw("COUNT(*)::int") })
      .from(numerologyReadings)
      .where(or(
        eq(numerologyReadings.userId, userId),
        eq(numerologyReadings.performedBy, userId)
      ));
    
    // Object analyses: only tracked by userId (client activity)
    const [objectCount] = await db.select({ count: db.raw("COUNT(*)::int") })
      .from(objectAnalyses)
      .where(eq(objectAnalyses.userId, userId));
    
    // Journals: personal activity tracked by userId
    const [journalCount] = await db.select({ count: db.raw("COUNT(*)::int") })
      .from(journals)
      .where(eq(journals.userId, userId));
    
    // Meditation sessions: personal activity tracked by userId
    const [meditationCount] = await db.select({ count: db.raw("COUNT(*)::int") })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));
    
    const counts = {
      aura: auraCount?.count || 0,
      vibe: vibeCount?.count || 0,
      numerology: numerologyCount?.count || 0,
      object: objectCount?.count || 0,
      journal: journalCount?.count || 0,
      meditation: meditationCount?.count || 0,
    };
    
    // Check each badge threshold
    for (const [badgeType, threshold] of Object.entries(BADGE_THRESHOLDS)) {
      const activityCount = counts[threshold.activity as keyof typeof counts];
      
      // If user has reached the threshold
      if (activityCount >= threshold.count) {
        // Check if they already have this badge
        const existing = await db.query.achievements.findFirst({
          where: (a, { and, eq: eqOp }) => and(
            eqOp(a.userId, userId),
            eqOp(a.achievementType, badgeType)
          ),
        });
        
        // Award badge if they don't have it yet
        if (!existing) {
          const badgeInfo = BADGE_DEFINITIONS[badgeType];
          if (badgeInfo) {
            const [newBadge] = await db.insert(achievements).values({
              userId,
              achievementType: badgeType,
              title: badgeInfo.title,
              description: badgeInfo.description,
              icon: badgeInfo.icon,
              badgeType: badgeInfo.level,
            }).returning();
            
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
