import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

interface HealerRank {
  rank: number;
  username: string;
  sessionCount: number;
  badge: string;
}

export function HealerLeaderboard() {
  const { data: healers = [] } = useQuery<HealerRank[]>({
    queryKey: ["/api/leaderboard/healers"],
  });

  if (!healers.length) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-900 to-orange-900 border-amber-600">
      <div className="flex items-center gap-3 mb-4">
        <Award className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-yellow-300">Master Healers</h3>
      </div>

      <div className="space-y-2">
        {healers.slice(0, 10).map((healer) => (
          <div
            key={healer.username}
            className="flex items-center justify-between p-3 bg-orange-800 rounded-lg border border-amber-600 hover:border-yellow-400 transition-colors"
            data-testid={`healer-rank-${healer.rank}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">
                {healer.rank <= 3 ? medals[healer.rank - 1] : `#${healer.rank}`}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-200">{healer.username}</p>
                <p className="text-xs text-orange-200">{healer.badge}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-yellow-300">{healer.sessionCount}</p>
              <p className="text-xs text-orange-300">sessions</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
