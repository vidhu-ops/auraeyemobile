import { useQuery } from "@tanstack/react-query";
import { PhysicalBadge } from "./physical-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export interface EarnedBadge {
  type: string;
  title: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  description: string;
}

export function BadgeShowcase() {
  const { data: earnedBadges = [], isLoading } = useQuery({
    queryKey: ["/api/earned-badges"],
  });

  if (isLoading) {
    return <div className="text-white text-center py-4">Loading badges...</div>;
  }

  if (earnedBadges.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-white font-semibold">Your Badges</h2>
        </div>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-white/70 text-center text-sm">
              No badges earned yet. Complete activities to unlock your first badge!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-white font-semibold">
          Your Badges ({earnedBadges.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {earnedBadges.map((badge) => (
          <div key={badge.type} data-testid={`earned-badge-${badge.type}`}>
            <PhysicalBadge
              title={badge.title}
              level={badge.level}
              description={badge.description}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-400/30 rounded-lg">
        <p className="text-blue-200 text-xs leading-relaxed">
          <span className="font-semibold">🏆 Badge Tiers:</span> Bronze (Beginner)
          • Silver (Growing) • Gold (Expert) • Platinum (Master)
        </p>
      </div>
    </div>
  );
}
