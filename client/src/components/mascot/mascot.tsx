import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import mascotLevel1 from "@assets/WhatsApp Image 2025-11-05 at 5.52.21 PM_1762780944775.jpeg";

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
          text: `Yay ${username}! ✨ Your beautiful ${scanColor} aura is shining so bright today! You're amazing!`,
          color: getColorHex(scanColor),
          emotion: 'excited'
        };
      }
      
      // Low credits warning
      const creditThreshold = userType === 'healer' ? 30 : 20;
      if (credits < creditThreshold) {
        return {
          text: `Oh no ${username}! 🥺 Only ${credits} credits left! Let's get you some more energy soon!`,
          color: "#f59e0b",
          emotion: 'neutral'
        };
      }
      
      return {
        text: `Hi ${username}! 🌸 I'm so happy to see you! What magical journey shall we take today?`,
        color: "#06b6d4",
        emotion: 'happy'
      };
    }

    // Dashboard messages
    if (path.includes("dashboard")) {
      if (energy > 150) {
        return {
          text: `WOW ${username}! 🎉 ${energy} soul energy?! You're absolutely glowing! I'm so proud of you!`,
          color: "#f59e0b",
          emotion: 'excited'
        };
      } else if (energy > 80) {
        return {
          text: `Yay ${username}! 🌟 Your ${energy} soul energy is growing so beautifully! Keep shining!`,
          color: "#10b981",
          emotion: 'happy'
        };
      }
      
      // Show color-based message if available
      if (scanColor) {
        return {
          text: `${username}, your lovely ${scanColor} aura holds ${energy} soul energy! You're doing great! 💖`,
          color: getColorHex(scanColor),
          emotion: 'happy'
        };
      }
      
      return {
        text: `${username}, I see ${energy} soul energy in you! Every moment of growth makes me happy! 🌸`,
        color: "#8b5cf6",
        emotion: 'neutral'
      };
    }

    // Aura analysis pages
    if (path.includes("aura") || path.includes("vibe")) {
      if (userType === 'healer') {
        const healerMessage = scanColor 
          ? `${username}, you revealed such a gorgeous ${scanColor} energy! You're an amazing healer! 💚✨`
          : `${username}, your healing gift is so special! Let's help someone discover their light! 💚`;
        return {
          text: healerMessage,
          color: scanColor ? getColorHex(scanColor) : "#10b981",
          emotion: 'excited'
        };
      }
      
      // Client messages with color memory
      if (scanColor) {
        return {
          text: `Ooh ${username}! 🌈 Your ${scanColor} aura was SO pretty last time! Want to see your new colors?`,
          color: getColorHex(scanColor),
          emotion: 'excited'
        };
      }
      
      return {
        text: `${username}, I can't wait to see your aura colors! This is going to be magical! 🎨💫`,
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
        text: `Hi ${username}! 💕 Your ${scanColor} aura is so special! With ${energy} soul energy, what adventure today?`,
        color: getColorHex(scanColor),
        emotion: 'happy'
      };
    }
    
    return {
      text: `Hello ${username}! 🌟 You have ${energy} soul energy! I'm here to help you shine brighter!`,
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

  const getMascotImage = (energy: number) => {
    // Energy level based mascot evolution
    // Level 1: 0-50 energy
    // Level 2: 51-100 energy (add image when available)
    // Level 3: 101-150 energy (add image when available)
    // Level 4: 150+ energy (add image when available)
    
    if (energy > 150) {
      return mascotLevel1; // Replace with mascotLevel4 when available
    } else if (energy > 100) {
      return mascotLevel1; // Replace with mascotLevel3 when available
    } else if (energy > 50) {
      return mascotLevel1; // Replace with mascotLevel2 when available
    } else {
      return mascotLevel1;
    }
  };

  if (!isVisible || !message) return null;

  const mascotImage = getMascotImage(soulEnergy);

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

      {/* Mascot - Cute Blob Character */}
      <div 
        className="relative cursor-pointer hover:scale-110 transition-all duration-300"
        onClick={() => setIsVisible(false)}
        data-testid="mascot-image"
        style={{
          animation: 'float 4s ease-in-out infinite'
        }}
      >
        <img 
          src={mascotImage} 
          alt="Auri Mascot"
          className="w-32 h-32 object-contain drop-shadow-2xl"
          style={{
            filter: `drop-shadow(0 0 20px ${message.color}80)`
          }}
        />
      </div>
    </div>
  );
}
