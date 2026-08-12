import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Trophy, CheckCircle } from "lucide-react";

interface Achievement {
  id: number;
  userId: number;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export function AchievementsBadges() {
  const { user } = useAuth();

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  if (!achievements.length) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-600">
        <div className="flex items-center gap-3 text-center">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <p className="text-purple-200">No achievements yet. Start your journey to unlock badges! 🚀</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-600">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-yellow-300">Achievements ({achievements.length})</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="relative flex flex-col items-center p-3 bg-indigo-800 rounded-lg border border-purple-500 hover:border-yellow-400 transition-colors text-center"
            data-testid={`achievement-${achievement.achievementType}`}
          >
            {/* Checkmark indicator for earned badge */}
            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5 shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-3xl mb-2">{achievement.icon}</div>
            <h4 className="font-semibold text-sm text-yellow-300">{achievement.title}</h4>
            <p className="text-xs text-purple-200 mt-1">{achievement.description}</p>
            <p className="text-xs text-purple-400 mt-2">
              {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : 'Just now'}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
