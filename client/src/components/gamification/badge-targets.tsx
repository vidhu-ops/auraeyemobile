import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Clock, Heart, Flame, BookOpen } from "lucide-react";

interface BadgeProgress {
  type: string;
  title: string;
  current: number;
  target: number;
  earned: boolean;
  icon: string;
}

interface BadgeProgressResponse {
  firstReading: BadgeProgress;
  fiveReadings: BadgeProgress;
  streakBadge: BadgeProgress;
  journalingTime: BadgeProgress;
  mostRepliesHealer: BadgeProgress;
  journalingTenHours?: BadgeProgress;
  mostTrustedHealer?: BadgeProgress;
  bestHealer?: BadgeProgress;
}

export function BadgeTargets() {
  const { data: badgeProgress, isLoading, isError } = useQuery<BadgeProgressResponse>({
    queryKey: ["/api/badge-progress"],
  });

  if (isLoading) {
    return <div className="text-white text-center py-4">Loading badges...</div>;
  }

  if (isError || !badgeProgress) {
    return <div className="text-white text-center py-4">Failed to load badges</div>;
  }

  const badges = [
    badgeProgress.firstReading,
    badgeProgress.fiveReadings,
    badgeProgress.streakBadge,
    (badgeProgress as any).reflectionHour,
    badgeProgress.journalingTime,
    badgeProgress.mostRepliesHealer,
    badgeProgress.journalingTenHours,
    badgeProgress.mostTrustedHealer,
    badgeProgress.bestHealer,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-white font-semibold">Achievement Targets</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {badges.map((badge) => {
          const percentage = Math.min((badge.current / badge.target) * 100, 100);
          const isComplete = badge.earned;

          return (
            <Card
              key={badge.type}
              className={`${
                isComplete
                  ? "bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-yellow-400/50"
                  : "bg-white/5 border-white/10"
              } shadow-sm`}
              data-testid={`badge-target-${badge.type}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xl">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">
                          {badge.title}
                        </p>
                        {isComplete && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs">
                            ✅ Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-xs mt-1">
                        {badge.current} / {badge.target}
                      </p>
                    </div>
                  </div>
                </div>

                <Progress
                  value={percentage}
                  className="h-2"
                  data-testid={`progress-${badge.type}`}
                />

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/60">
                    {percentage.toFixed(0)}% complete
                  </span>
                  {!isComplete && badge.current < badge.target && (
                    <span className="text-xs text-cyan-300 font-semibold">
                      {badge.target - badge.current} more to go!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-400/30 rounded-lg">
        <p className="text-purple-200 text-xs leading-relaxed">
          <span className="font-semibold">💡 Tip:</span> Complete activities to
          unlock badges! Earn badges for reaching milestones in readings, journaling,
          streaks, and more.
        </p>
      </div>
    </div>
  );
}
