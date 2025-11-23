import { useQuery } from "@tanstack/react-query";
import { PhysicalBadge } from "./physical-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export interface EarnedBadge {
  type: string;
  title: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  description: string;
  icon?: string;
}

export function BadgeShowcase() {
  const { data: earnedBadgesData, isLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  // Ensure earned badges have all necessary fields for display
  const earnedBadges: EarnedBadge[] = Array.isArray(earnedBadgesData) 
    ? earnedBadgesData.map((badge: any) => ({
        type: badge.type || badge.achievementType,
        title: badge.title || '',
        level: (badge.level || badge.badgeType || 'bronze') as "bronze" | "silver" | "gold" | "platinum",
        description: badge.description || '',
        icon: badge.icon || '⭐',
      }))
    : [];

  // Demo badges to showcase the badge system
  const demoBadges: EarnedBadge[] = [
    {
      type: 'first_aura',
      title: 'First Glimpse 👀',
      level: 'bronze',
      description: 'Completed your first aura analysis',
      icon: '🎨'
    },
    {
      type: 'third_aura',
      title: 'Aura Explorer 🔍',
      level: 'silver',
      description: 'Completed 3 aura analyses',
      icon: '🔍'
    },
    {
      type: 'aura_master',
      title: 'Aura Master 🌟',
      level: 'gold',
      description: 'Completed 10 aura analyses',
      icon: '⭐'
    },
    {
      type: 'aura_legend',
      title: 'Aura Legend 👑',
      level: 'platinum',
      description: 'Completed 25 aura analyses',
      icon: '👑'
    },
  ];

  const badgesToShow = earnedBadges.length > 0 ? earnedBadges : demoBadges;
  const isShowingDemo = earnedBadges.length === 0;

  if (isLoading) {
    return <div className="text-white text-center py-4">Loading badges...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-white font-semibold">
          Your Badges {!isShowingDemo && `(${badgesToShow.length})`}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badgesToShow.map((badge) => (
          <div key={badge.type} data-testid={`earned-badge-${badge.type}`}>
            <PhysicalBadge
              title={badge.title}
              level={badge.level}
              description={badge.description}
              icon={badge.icon}
              isEarned={!isShowingDemo}
            />
          </div>
        ))}
      </div>

      {isShowingDemo && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-400/30 rounded-lg">
          <p className="text-amber-200 text-xs leading-relaxed">
            <span className="font-semibold">✨ Badge Demo:</span> These are example badges showing all tiers (Bronze, Silver, Gold, Platinum). Complete activities to unlock and earn your own badges!
          </p>
        </div>
      )}

      <div className="mt-2 p-3 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-400/30 rounded-lg">
        <p className="text-blue-200 text-xs leading-relaxed">
          <span className="font-semibold">🏆 Badge Tiers:</span> Bronze (Beginner)
          • Silver (Growing) • Gold (Expert) • Platinum (Master)
        </p>
      </div>
    </div>
  );
}
