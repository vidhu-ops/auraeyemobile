import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

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

  // Get user's credits
  const { data: creditsData } = useQuery<{ credits: number }>({
    queryKey: ["/api/credits"],
    enabled: !!user,
  });

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

    const messages = getContextualMessage(
      location, 
      user.username, 
      user.userType, 
      soulEnergy, 
      lastScanColor,
      creditsData?.credits || 0
    );
    setMessage(messages);
  }, [location, user, soulEnergy, lastScanColor, creditsData]);

  const getContextualMessage = (
    path: string, 
    username: string,
    userType: string, 
    energy: number,
    scanColor: string | null,
    credits: number
  ): MascotMessage => {
    
    // Home page messages
    if (path === "/") {
      if (scanColor) {
        return {
          text: `Welcome back, ${username}! 💫 Your ${scanColor} aura is absolutely radiant today! Your energy signature is unique!`,
          color: getColorHex(scanColor),
          emotion: 'excited'
        };
      }
      
      // Low credits warning
      const creditThreshold = userType === 'healer' ? 30 : 20;
      if (credits < creditThreshold) {
        return {
          text: `${username}, you're running low on energy! Only ${credits} credits left. Time to recharge! ⚡`,
          color: "#f59e0b",
          emotion: 'neutral'
        };
      }
      
      return {
        text: `Hey ${username}! 🌟 What spiritual adventure calls to you today? Your energy awaits!`,
        color: "#06b6d4",
        emotion: 'happy'
      };
    }

    // Dashboard messages
    if (path.includes("dashboard")) {
      if (energy > 150) {
        return {
          text: `Incredible, ${username}! Your ${energy} soul energy is blazing bright! 🔥 You're a beacon of light!`,
          color: "#f59e0b",
          emotion: 'excited'
        };
      } else if (energy > 80) {
        return {
          text: `${username}, your spiritual energy (${energy}) is flourishing! 🌱 I can feel your growth!`,
          color: "#10b981",
          emotion: 'happy'
        };
      }
      
      // Show color-based message if available
      if (scanColor) {
        return {
          text: `${username}, your ${scanColor} aura shows you have ${energy} soul energy! Keep nurturing it! ✨`,
          color: getColorHex(scanColor),
          emotion: 'happy'
        };
      }
      
      return {
        text: `${username}, your journey shows ${energy} soul energy! Every step matters! ✨`,
        color: "#8b5cf6",
        emotion: 'neutral'
      };
    }

    // Aura analysis pages
    if (path.includes("aura") || path.includes("vibe")) {
      if (userType === 'healer') {
        const healerMessage = scanColor 
          ? `${username}, your healing touch reveals ${scanColor} energy! Guide them to their truth! 💚`
          : `${username}, use your gift to illuminate someone's soul! Your healing touch matters! 💚`;
        return {
          text: healerMessage,
          color: scanColor ? getColorHex(scanColor) : "#10b981",
          emotion: 'excited'
        };
      }
      
      // Client messages with color memory
      if (scanColor) {
        return {
          text: `${username}, your ${scanColor} aura was beautiful! Ready to see how your colors have evolved? 🎨✨`,
          color: getColorHex(scanColor),
          emotion: 'excited'
        };
      }
      
      return {
        text: `${username}, let's discover your aura! Your colors hold the secrets of your soul! 🎨✨`,
        color: "#ec4899",
        emotion: 'excited'
      };
    }

    // Meditation page
    if (path.includes("meditation")) {
      return {
        text: `${username}, find your inner peace... Your ${energy} soul energy awaits harmony. 🧘‍♀️`,
        color: "#3b82f6",
        emotion: 'neutral'
      };
    }

    // Journal page
    if (path.includes("journal")) {
      return {
        text: `${username}, your spiritual journey matters. Document your ${energy} soul energy today! 📖`,
        color: "#a855f7",
        emotion: 'happy'
      };
    }

    // Color meanings page
    if (path.includes("color")) {
      if (scanColor) {
        return {
          text: `${username}, learn what your ${scanColor} aura truly means! 🌈`,
          color: getColorHex(scanColor),
          emotion: 'excited'
        };
      }
      return {
        text: `${username}, each color reveals YOUR soul's secrets! Discover their meanings! 🌈`,
        color: "#ec4899",
        emotion: 'excited'
      };
    }

    // Healers page
    if (path.includes("healers")) {
      return {
        text: userType === 'healer'
          ? `${username}, connect with your fellow healers! You're part of something special! 🤝`
          : `${username}, these gifted healers can guide YOUR unique spiritual path! 🌟`,
        color: "#14b8a6",
        emotion: 'happy'
      };
    }

    // Help page
    if (path.includes("help")) {
      return {
        text: `${username}, I'm here just for you! What do you need help with today? 💡`,
        color: "#06b6d4",
        emotion: 'happy'
      };
    }

    // Numerology pages
    if (path.includes("numerology")) {
      return {
        text: `${username}, the numbers of your life hold profound wisdom! Let's uncover them! 🔢✨`,
        color: "#a855f7",
        emotion: 'excited'
      };
    }

    // Default message with color memory
    if (scanColor) {
      return {
        text: `Hi ${username}! Your ${scanColor} aura energy (${energy}) is with you! What shall we explore? 🌟`,
        color: getColorHex(scanColor),
        emotion: 'happy'
      };
    }
    
    return {
      text: `Hi ${username}! Your spiritual energy is at ${energy}! Ready to explore your path? 🌟`,
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

      {/* Mascot - Cute Gradient Blob - FULLY VISIBLE */}
      <div 
        className="relative w-24 h-24 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 shadow-2xl"
        style={{ 
          background: `linear-gradient(135deg, ${message.color}F5, #ec4899F8, #06b6d4F5)`,
          boxShadow: `0 0 50px ${message.color}CC, inset 0 0 40px rgba(255,255,255,0.6)`,
          animation: 'float 4s ease-in-out infinite, gradient-shift 8s ease infinite'
        }}
        onClick={() => setIsVisible(false)}
        data-testid="mascot-image"
      >
        {/* Bright highlight overlay for 3D effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 60%)`
          }}
        ></div>

        {/* Cute Face - DARKER FOR VISIBILITY */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900 drop-shadow-sm">
          <div className="text-2xl font-bold mb-1 transition-all duration-500" style={{ letterSpacing: '0.3em' }}>
            {face.eyes}
          </div>
          <div className="text-3xl transition-all duration-500">
            {face.mouth}
          </div>
        </div>
        
        {/* Rotating ring animation */}
        <div 
          className="absolute inset-0 rounded-full border-2 opacity-40"
          style={{ 
            borderColor: message.color,
            animation: 'spin 10s linear infinite'
          }}
        ></div>

        {/* Pulsing glow ring */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: message.color }}
        ></div>

        {/* Strong outer glow */}
        <div 
          className="absolute -inset-3 rounded-full blur-2xl opacity-70 animate-pulse"
          style={{ 
            backgroundColor: message.color,
            animation: 'pulse 3s ease-in-out infinite'
          }}
        ></div>
      </div>
    </div>
  );
}
