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

export function BadgeNotification({ title, description, icon, level, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500); // Wait for fade out
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-[100] max-w-sm p-4 rounded-xl border-2 shadow-2xl animate-in slide-in-from-right fade-in duration-500 bg-gradient-to-br ${levelColors[level].bg} ${levelColors[level].border}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl animate-bounce">{icon}</div>
        <div className="flex-1">
          <h3 className={`font-bold ${levelColors[level].text}`}>{title}</h3>
          <p className={`text-sm opacity-90 ${levelColors[level].text}`}>{description}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/20 ${levelColors[level].text}`}>
              {level} Badge Earned!
            </span>
          </div>
        </div>
        <button 
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 500);
          }}
          className={`p-1 rounded-full hover:bg-white/20 transition-colors ${levelColors[level].text}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
