import ribbonBadgeImg from "@assets/Reward-Ribbon-PNG-Clipart_1763854464226.png";

export interface PhysicalBadgeProps {
  title: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  description: string;
  icon?: string;
  isEarned?: boolean;
}

const levelColors = {
  bronze: {
    bg: "from-amber-600 to-orange-700",
    text: "text-amber-100",
    badge: "from-amber-500 to-orange-600",
    border: "border-amber-400/50",
  },
  silver: {
    bg: "from-slate-500 to-slate-700",
    text: "text-slate-100",
    badge: "from-slate-400 to-slate-600",
    border: "border-slate-400/50",
  },
  gold: {
    bg: "from-yellow-500 to-amber-600",
    text: "text-yellow-50",
    badge: "from-yellow-400 to-amber-600",
    border: "border-yellow-300/50",
  },
  platinum: {
    bg: "from-cyan-400 to-blue-600",
    text: "text-cyan-50",
    badge: "from-cyan-300 to-blue-600",
    border: "border-cyan-300/50",
  },
};

export function PhysicalBadge({
  title,
  level,
  description,
  icon = "⭐",
  isEarned = false,
}: PhysicalBadgeProps) {
  const colors = levelColors[level];

  return (
    <div
      className={`relative group cursor-pointer transition-transform hover:scale-105 flex flex-col items-center`}
      data-testid={`physical-badge-${level}`}
    >
      {/* Badge Container */}
      <div className="relative w-32 flex flex-col items-center">
        {/* Glow Effect for Earned Badges */}
        {isEarned && (
          <div 
            className="absolute -inset-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 opacity-75 blur-lg animate-pulse -z-10"
            style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
          />
        )}

        {/* Ribbon Image with Overlay */}
        <div
          className={`relative w-full h-32 rounded-full shadow-lg overflow-hidden border-4 ${colors.border} ${isEarned ? "shadow-2xl" : ""}`}
          style={{
            backgroundImage: `url(${ribbonBadgeImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: isEarned ? "0 0 30px rgba(250, 204, 21, 0.8), 0 0 60px rgba(250, 204, 21, 0.4)" : undefined,
          }}
        >
          {/* Colored Overlay for Tier */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${colors.badge} opacity-60 mix-blend-multiply`}
          />

          {/* Emoji Icon - The Main Badge Visual */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl drop-shadow-lg">{icon}</span>
          </div>
        </div>

        {/* Badge Name */}
        <h3
          className={`text-center text-xs font-bold mt-2 leading-tight ${colors.text} drop-shadow-md px-1`}
        >
          {title}
        </h3>

        {/* Achieved Status */}
        {isEarned && (
          <div className="mt-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full border border-green-300">
            <span className="text-xs font-bold text-white drop-shadow-md">✓ ACHIEVED</span>
          </div>
        )}

        {/* Description Below Level Badge */}
        <p className="text-center text-xs text-purple-200 mt-2 px-2 leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
}
