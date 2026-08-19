import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

interface ChakraUnlockData {
  unlockedChakras: number[];
  totalUnlocked: number;
  masteryProgress: Record<number, number>;
}

const CHAKRAS = [
  { number: 1, name: "Root", color: "#ef4444", meaning: "Grounding & Stability" },
  { number: 2, name: "Sacral", color: "#f97316", meaning: "Creativity & Pleasure" },
  { number: 3, name: "Solar Plexus", color: "#eab308", meaning: "Personal Power" },
  { number: 4, name: "Heart", color: "#22c55e", meaning: "Love & Emotions" },
  { number: 5, name: "Throat", color: "#3b82f6", meaning: "Communication & Truth" },
  { number: 6, name: "Third Eye", color: "#6366f1", meaning: "Intuition & Insight" },
  { number: 7, name: "Crown", color: "#8b5cf6", meaning: "Spiritual Connection" },
  { number: 8, name: "Soul", color: "#a855f7", meaning: "Divine Essence" },
  { number: 9, name: "Higher Self", color: "#d946ef", meaning: "Universal Energy" },
];

export function ChakraMastery() {
  const { user } = useAuth();

  const { data: chakras } = useQuery<ChakraUnlockData>({
    queryKey: ["/api/chakra-unlocks"],
    enabled: !!user,
  });

  if (!chakras) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-600">
      <div className="flex items-center gap-3 mb-6">
        <Wand2 className="w-6 h-6 text-purple-300" />
        <div>
          <h3 className="text-xl font-bold text-purple-200">Chakra Mastery Path</h3>
          <p className="text-sm text-purple-300">{chakras.totalUnlocked} / 9 Chakras Unlocked</p>
        </div>
      </div>

      <div className="space-y-3">
        {CHAKRAS.map((chakra) => {
          const isUnlocked = chakras.unlockedChakras.includes(chakra.number);
          const progress = chakras.masteryProgress[chakra.number] || 0;

          return (
            <div
              key={chakra.number}
              className={`p-3 rounded-lg border transition-all ${
                isUnlocked
                  ? "bg-opacity-100 border-purple-400"
                  : "bg-opacity-30 border-purple-700 opacity-60"
              }`}
              style={{ backgroundColor: `${chakra.color}20` }}
              data-testid={`chakra-${chakra.number}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: chakra.color }}
                  >
                    {chakra.number}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: chakra.color }}>
                      {chakra.name} Chakra
                    </p>
                    <p className="text-xs text-purple-300">{chakra.meaning}</p>
                  </div>
                </div>
                {isUnlocked && <span className="text-2xl">✨</span>}
              </div>

              <div className="w-full bg-purple-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r transition-all duration-500"
                  style={{
                    width: `${Math.round(progress * 100)}%`,
                    backgroundImage: `linear-gradient(90deg, ${chakra.color}, ${chakra.color}cc)`,
                  }}
                ></div>
              </div>

              <p className="text-xs text-purple-300 mt-1">
                {Math.round(progress * 100)}% Mastery
              </p>
            </div>
          );
        })}
      </div>

      {chakras.totalUnlocked === 9 && (
        <div className="mt-4 p-4 bg-purple-700 border border-purple-400 rounded-lg text-center">
          <p className="text-purple-100 font-semibold">🧘 All Chakras Unlocked! You are a Chakra Master!</p>
        </div>
      )}
    </Card>
  );
}
