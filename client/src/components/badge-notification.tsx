import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface BadgeNotificationProps {
  title: string;
  description: string;
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  onClose: () => void;
}

const levelColors = {
  bronze: {
    bg: "from-amber-600 to-orange-700",
    border: "border-amber-400",
    text: "text-amber-100",
    button: "bg-amber-500 hover:bg-amber-600",
  },
  silver: {
    bg: "from-slate-500 to-slate-700",
    border: "border-slate-400",
    text: "text-slate-100",
    button: "bg-slate-400 hover:bg-slate-500",
  },
  gold: {
    bg: "from-yellow-500 to-amber-600",
    border: "border-yellow-300",
    text: "text-yellow-50",
    button: "bg-yellow-400 hover:bg-yellow-500 text-black",
  },
  platinum: {
    bg: "from-cyan-400 to-blue-600",
    border: "border-cyan-300",
    text: "text-cyan-50",
    button: "bg-cyan-300 hover:bg-cyan-400 text-black",
  },
};

export function BadgeNotification({
  title,
  description,
  icon,
  level,
  onClose,
}: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const colors = levelColors[level];

  useEffect(() => {
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      data-testid="badge-notification"
    >
      {/* Glow background */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div 
          className={`w-96 h-96 bg-gradient-to-r ${colors.bg} rounded-full opacity-20 blur-3xl animate-pulse`}
        />
      </div>

      <div
        className={`pointer-events-auto relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in fade-in slide-in-from-top-10 duration-300`}
        style={{
          boxShadow: `0 0 40px ${level === 'bronze' ? 'rgba(251, 146, 60, 0.6)' : level === 'silver' ? 'rgba(148, 163, 184, 0.6)' : level === 'gold' ? 'rgba(250, 204, 21, 0.6)' : 'rgba(34, 211, 238, 0.6)'}, 0 0 20px ${level === 'bronze' ? 'rgba(251, 146, 60, 0.4)' : level === 'silver' ? 'rgba(148, 163, 184, 0.4)' : level === 'gold' ? 'rgba(250, 204, 21, 0.4)' : 'rgba(34, 211, 238, 0.4)'}`
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full ${colors.button} transition-colors`}
          data-testid="button-close-badge"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge icon and content */}
        <div className="text-center space-y-4">
          {/* Large icon with glow */}
          <div className="relative inline-block">
            <div className="absolute inset-0 text-6xl blur-xl opacity-70 animate-pulse">{icon}</div>
            <div className="text-6xl animate-bounce relative z-10">{icon}</div>
          </div>

          {/* Achievement text */}
          <div className={colors.text}>
            <h3 className="text-2xl font-bold font-mystical">{title}</h3>
            <p className="text-sm mt-2 opacity-90">{description}</p>
          </div>

          {/* Level badge */}
          <div className={`inline-block px-4 py-2 rounded-full ${colors.text} text-xs font-bold uppercase tracking-widest`}>
            {level} Achievement Unlocked
          </div>

          {/* OK Button */}
          <Button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className={`w-full ${colors.button} text-sm font-semibold mt-4`}
            data-testid="button-ok-badge"
          >
            Awesome!
          </Button>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-2 right-4 text-2xl animate-pulse">✨</div>
          <div className="absolute bottom-4 left-4 text-2xl animate-pulse">✨</div>
        </div>
      </div>
    </div>
  );
}
