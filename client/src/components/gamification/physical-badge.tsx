import ribbonBadgeImg from "@assets/Reward-Ribbon-PNG-Clipart_1763854464226.png";

export interface PhysicalBadgeProps {
  title: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  description: string;
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
}: PhysicalBadgeProps) {
  const colors = levelColors[level];

  return (
    <div
      className={`relative group cursor-pointer transition-transform hover:scale-105`}
      data-testid={`physical-badge-${level}`}
    >
      {/* Badge Container */}
      <div className="relative w-32 h-40 flex flex-col items-center">
        {/* Ribbon Image with Overlay */}
        <div
          className={`relative w-full h-32 rounded-full shadow-lg overflow-hidden border-4 ${colors.border}`}
          style={{
            backgroundImage: `url(${ribbonBadgeImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Colored Overlay for Tier */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${colors.badge} opacity-60 mix-blend-multiply`}
          />

          {/* Tier Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${colors.text} drop-shadow-lg`}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Badge Name */}
        <h3
          className={`text-center text-xs font-bold mt-2 leading-tight ${colors.text} drop-shadow-md`}
        >
          {title}
        </h3>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        <div className={`bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap`}>
          {description}
        </div>
      </div>
    </div>
  );
}
