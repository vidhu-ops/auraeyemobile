import { useQuery } from "@tanstack/react-query";
import { PhysicalBadge } from "./physical-badge";
import { Trophy } from "lucide-react";

export interface EarnedBadge {
  type: string;
  title: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  description: string;
  icon?: string;
}

const ALL_BADGES: EarnedBadge[] = [
  { type: 'first_aura', title: 'First Glimpse 👀', level: 'bronze', description: 'Completed your first aura analysis', icon: '🎨' },
  { type: 'third_aura', title: 'Aura Explorer 🔍', level: 'silver', description: 'Completed 3 aura analyses', icon: '🔍' },
  { type: 'aura_master', title: 'Aura Master 🌟', level: 'gold', description: 'Completed 10 aura analyses', icon: '⭐' },
  { type: 'aura_legend', title: 'Aura Legend 👑', level: 'platinum', description: 'Completed 25 aura analyses', icon: '👑' },
  { type: 'first_vibe', title: 'Vibe Check ✨', level: 'bronze', description: 'Completed your first vibe scan', icon: '✨' },
  { type: 'vibe_enthusiast', title: 'Vibe Enthusiast 💫', level: 'silver', description: 'Completed 5 vibe checks', icon: '💫' },
  { type: 'vibe_master', title: 'Vibe Master 🎯', level: 'gold', description: 'Completed 15 vibe checks', icon: '🎯' },
  { type: 'first_numerology', title: 'Number Vision 🔢', level: 'bronze', description: 'Completed your first numerology reading', icon: '🔢' },
  { type: 'numerology_explorer', title: 'Numerology Explorer 📊', level: 'silver', description: 'Completed 3 numerology readings', icon: '📊' },
  { type: 'first_journal', title: 'Thoughts Flow 📖', level: 'bronze', description: 'Wrote your first journal entry', icon: '📝' },
  { type: 'journal_keeper', title: 'Journal Keeper 📚', level: 'silver', description: 'Wrote 5 journal entries', icon: '📚' },
  { type: 'journal_master', title: 'Journal Master ✍️', level: 'gold', description: 'Wrote 20 journal entries', icon: '✍️' },
  { type: 'seven_day_streak', title: 'Week Warrior 🔥', level: 'bronze', description: 'Maintained a 7-day login streak', icon: '🔥' },
  { type: 'first_meditation', title: 'Inner Peace 🧘', level: 'bronze', description: 'Completed your first meditation', icon: '🧘' },
  { type: 'meditation_seeker', title: 'Meditation Seeker 🌸', level: 'silver', description: 'Completed 5 meditation sessions', icon: '🌸' },
];

export function BadgeShowcase() {
  const { data: earnedBadgesData, isLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const earnedTypes = new Set<string>();
  if (Array.isArray(earnedBadgesData)) {
    earnedBadgesData.forEach((badge: any) => {
      // Try multiple possible field names for badge type
      const type = (badge.achievementType || badge.badgeType || badge.type || "").toLowerCase().trim();
      if (type) {
        earnedTypes.add(type);
        // Also add versions with underscores/spaces swapped to be safe
        earnedTypes.add(type.replace(/_/g, ' '));
        earnedTypes.add(type.replace(/ /g, '_'));
      }
    });
  }

  const earnedCount = earnedTypes.size;

  if (isLoading) {
    return <div className="text-white text-center py-4">Loading badges...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-white font-semibold">
          Your Badges ({earnedCount}/{ALL_BADGES.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ALL_BADGES.map((badge) => {
          const badgeType = badge.type.toLowerCase().trim();
          const isEarned = earnedTypes.has(badgeType) || 
                          earnedTypes.has(badgeType.replace(/_/g, ' ')) || 
                          earnedTypes.has(badgeType.replace(/ /g, '_'));
          return (
            <div key={badge.type} data-testid={`badge-${badge.type}`}>
              <PhysicalBadge
                title={badge.title}
                level={badge.level}
                description={badge.description}
                icon={badge.icon}
                isEarned={isEarned}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 p-3 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-400/30 rounded-lg">
        <p className="text-blue-200 text-xs leading-relaxed">
          <span className="font-semibold">🏆 Badge Tiers:</span> Bronze (Beginner)
          • Silver (Growing) • Gold (Expert) • Platinum (Master)
        </p>
      </div>
    </div>
  );
}
