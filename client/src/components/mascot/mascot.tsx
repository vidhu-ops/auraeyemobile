import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocation } from "wouter";

interface MascotMessage {
  text: string;
  color?: string;
  emotion?: 'happy' | 'neutral' | 'excited';
}

export default function Mascot() {
  const { user } = useAuth();
  const { soulEnergy } = useSoulEnergy();
  const [location] = useLocation();
  const [message, setMessage] = useState<MascotMessage | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScanColor, setLastScanColor] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState(location);

  // Get last scan color from localStorage
  useEffect(() => {
    const storedColor = localStorage.getItem("lastAuraColor");
    if (storedColor) {
      setLastScanColor(storedColor);
    }
  }, [location]);

  // Reappear when page changes
  useEffect(() => {
    if (location !== lastLocation) {
      setIsVisible(true);
      setLastLocation(location);
    }
  }, [location, lastLocation]);

  // Generate contextual messages based on page and user state
  useEffect(() => {
    if (!user) {
      setMessage({
        text: "Hi! I'm Auri, your spiritual companion! ✨ Sign in to start your journey!",
        color: "#06b6d4",
        emotion: 'happy'
      });
      return;
    }

    const messages = getContextualMessage(location, user.userType, soulEnergy, lastScanColor);
    setMessage(messages);
  }, [location, user, soulEnergy, lastScanColor]);

  const getContextualMessage = (
    path: string, 
    userType: string, 
    energy: number, 
    scanColor: string | null
  ): MascotMessage => {
    const userName = userType === 'healer' ? 'Healer' : 'Friend';
    
    // Home page messages
    if (path === "/") {
      if (scanColor) {
        return {
          text: `Welcome back, ${userName}! 💫 Your ${scanColor} aura is shining beautifully today!`,
          color: getColorHex(scanColor),
          emotion: 'excited'
        };
      }
      return {
        text: `Hello ${userName}! 🌟 Ready to explore your spiritual energy today?`,
        color: "#06b6d4",
        emotion: 'happy'
      };
    }

    // Dashboard messages
    if (path.includes("dashboard")) {
      if (energy > 150) {
        return {
          text: `Wow! Your soul energy is at ${energy}! 🔥 You're radiating powerful vibes!`,
          color: "#f59e0b",
          emotion: 'excited'
        };
      } else if (energy > 80) {
        return {
          text: `Great energy, ${userName}! Keep nurturing your spiritual growth! 🌱`,
          color: "#10b981",
          emotion: 'happy'
        };
      }
      return {
        text: `Building your energy! Every scan brings you closer to enlightenment! ✨`,
        color: "#8b5cf6",
        emotion: 'neutral'
      };
    }

    // Aura analysis pages
    if (path.includes("aura") || path.includes("vibe")) {
      return {
        text: userType === 'healer' 
          ? "Help souls discover their true colors! Your healing touch makes a difference! 💚"
          : "Ready to see your aura? Every color tells your unique story! 🎨",
        color: scanColor ? getColorHex(scanColor) : "#ec4899",
        emotion: 'excited'
      };
    }

    // Meditation page
    if (path.includes("meditation")) {
      return {
        text: "Find your inner peace... Breathe in light, breathe out love. 🧘‍♀️",
        color: "#3b82f6",
        emotion: 'neutral'
      };
    }

    // Journal page
    if (path.includes("journal")) {
      return {
        text: "Your thoughts are sacred. Write your spiritual journey today! 📖",
        color: "#a855f7",
        emotion: 'happy'
      };
    }

    // Color meanings page
    if (path.includes("color")) {
      return {
        text: "Each color is a window to your soul! Discover their meanings! 🌈",
        color: "#ec4899",
        emotion: 'excited'
      };
    }

    // Healers page
    if (path.includes("healers")) {
      return {
        text: userType === 'healer'
          ? "Your fellow healers are here to support and inspire! 🤝"
          : "Connect with amazing healers who can guide your journey! 🌟",
        color: "#14b8a6",
        emotion: 'happy'
      };
    }

    // Help page
    if (path.includes("help")) {
      return {
        text: "I'm here to guide you! Let's find the answers you seek! 💡",
        color: "#06b6d4",
        emotion: 'happy'
      };
    }

    // Default message
    return {
      text: `Hi ${userName}! I'm Auri, your spiritual guide! How can I help you today? 🌟`,
      color: "#06b6d4",
      emotion: 'happy'
    };
  };

  const getColorHex = (colorName: string | null): string => {
    if (!colorName) return "#06b6d4";
    
    const colorMap: Record<string, string> = {
      red: "#ef4444",
      orange: "#f97316",
      yellow: "#eab308",
      green: "#22c55e",
      blue: "#3b82f6",
      indigo: "#6366f1",
      violet: "#8b5cf6",
      purple: "#a855f7",
      pink: "#ec4899",
      cyan: "#06b6d4",
      teal: "#14b8a6"
    };

    return colorMap[colorName.toLowerCase()] || "#06b6d4";
  };

  const getMascotFace = (emotion: 'happy' | 'neutral' | 'excited' = 'happy') => {
    const faces = {
      happy: { eyes: '• ‿ •', mouth: '‿' },
      neutral: { eyes: '• – •', mouth: '–' },
      excited: { eyes: '• ᴗ •', mouth: 'ᴗ' }
    };
    return faces[emotion];
  };

  if (!isVisible || !message) return null;

  const face = getMascotFace(message.emotion);

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-bounce-slow">
      {/* Thought Bubble */}
      <div className="relative mb-3 mr-2">
        <Card 
          className="relative bg-white dark:bg-slate-800 border-2 shadow-xl max-w-xs p-4 rounded-2xl"
          style={{ 
            borderColor: message.color,
            boxShadow: `0 4px 20px ${message.color}40`
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white"
            data-testid="button-close-mascot"
          >
            <X className="h-3 w-3" />
          </button>

          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {message.text}
          </p>

          {/* Speech bubble tail */}
          <div 
            className="absolute -bottom-3 right-8 w-6 h-6 bg-white dark:bg-slate-800 border-r-2 border-b-2 transform rotate-45"
            style={{ borderColor: message.color }}
          ></div>
        </Card>

        {/* Small floating bubbles */}
        <div 
          className="absolute -bottom-1 right-10 w-2 h-2 rounded-full bg-white dark:bg-slate-800 border"
          style={{ borderColor: message.color }}
        ></div>
        <div 
          className="absolute -bottom-2 right-6 w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-800 border"
          style={{ borderColor: message.color }}
        ></div>
      </div>

      {/* Mascot - Cute Gradient Blob */}
      <div 
        className="relative w-20 h-20 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 shadow-2xl animate-pulse-slow"
        style={{ 
          background: `linear-gradient(135deg, ${message.color}40, #ec489960, #06b6d440)`,
          boxShadow: `0 0 40px ${message.color}60, inset 0 0 30px rgba(255,255,255,0.3)`
        }}
        onClick={() => setIsVisible(false)}
        data-testid="mascot-image"
      >
        {/* Soft glow overlay */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)`
          }}
        ></div>

        {/* Cute Face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800">
          <div className="text-xl font-bold mb-1" style={{ letterSpacing: '0.3em' }}>
            {face.eyes}
          </div>
          <div className="text-2xl">
            {face.mouth}
          </div>
        </div>
        
        {/* Glowing ring animation */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: message.color }}
        ></div>

        {/* Outer soft glow */}
        <div 
          className="absolute -inset-2 rounded-full blur-xl opacity-30 animate-pulse-slow"
          style={{ backgroundColor: message.color }}
        ></div>
      </div>
    </div>
  );
}
