import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Palette } from "lucide-react";

interface ColorCollectorData {
  collectedColors: string[];
  totalCollected: number;
  completionPercentage: number;
  badgeUnlocked: boolean;
}

const ALL_COLORS = [
  { name: "Red", hex: "#ef4444", icon: "🔴" },
  { name: "Orange", hex: "#f97316", icon: "🟠" },
  { name: "Yellow", hex: "#eab308", icon: "🟡" },
  { name: "Green", hex: "#22c55e", icon: "🟢" },
  { name: "Blue", hex: "#3b82f6", icon: "🔵" },
  { name: "Indigo", hex: "#6366f1", icon: "🟣" },
  { name: "Violet", hex: "#8b5cf6", icon: "🟣" },
  { name: "Pink", hex: "#ec4899", icon: "🩷" },
];

export function ColorCollector() {
  const { user } = useAuth();

  const { data: collector } = useQuery<ColorCollectorData>({
    queryKey: ["/api/color-collector"],
    enabled: !!user,
  });

  if (!collector) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-900 to-red-900 border-pink-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-pink-300" />
          <div>
            <h3 className="text-xl font-bold text-pink-200">Color Collector</h3>
            <p className="text-sm text-pink-300">{collector.totalCollected} / {ALL_COLORS.length} colors</p>
          </div>
        </div>
        {collector.badgeUnlocked && (
          <div className="text-4xl animate-bounce">🌈</div>
        )}
      </div>

      <div className="w-full bg-pink-950 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all duration-500"
          style={{ width: `${collector.completionPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ALL_COLORS.map((color) => (
          <div
            key={color.name}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              collector.collectedColors.includes(color.name.toLowerCase())
                ? "bg-opacity-100 border-2 border-yellow-300"
                : "bg-opacity-30 border border-pink-600 opacity-50"
            }`}
            style={{
              backgroundColor: `${color.hex}40`,
              borderColor: collector.collectedColors.includes(color.name.toLowerCase())
                ? "#fbbf24"
                : "#db2777",
            }}
            data-testid={`color-${color.name.toLowerCase()}`}
          >
            <span className="text-2xl">{color.icon}</span>
            <p className="text-xs font-semibold mt-1">{color.name}</p>
          </div>
        ))}
      </div>

      {collector.badgeUnlocked && (
        <div className="mt-4 p-3 bg-yellow-900 border border-yellow-500 rounded-lg text-center">
          <p className="text-yellow-200 font-semibold">✨ Rainbow Collector Badge Unlocked! +100 credits!</p>
        </div>
      )}
    </Card>
  );
}
