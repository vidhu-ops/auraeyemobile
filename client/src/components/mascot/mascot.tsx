import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useMascot, type MascotPosition } from "@/hooks/use-mascot";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import mascotLevel1 from "@assets/WhatsApp_Image_2025-11-05_at_5.52.21_PM-removebg-preview_1762855217308.png";
import mascotVideo from "@assets/Recording 2025-11-18 002854_1763406692020.mp4";

interface MascotMessage {
  text: string;
  color?: string;
  emotion?: 'happy' | 'neutral' | 'excited';
}

export default function Mascot() {
  const { user } = useAuth();
  const { soulEnergy } = useSoulEnergy();
  const { shouldGlow, position, setPosition } = useMascot();
  const [location] = useLocation();
  const [message, setMessage] = useState<MascotMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [lastScanColor, setLastScanColor] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState(location);
  const [hasBeenClosedOnThisPage, setHasBeenClosedOnThisPage] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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

  // Reappear when page changes - keeping mascot at bottom
  useEffect(() => {
    if (location !== lastLocation) {
      // Reset the closed flag when navigating to a new page
      setHasBeenClosedOnThisPage(false);
      
      // First hide with scale-out animation
      if (isVisible) {
        setIsAnimatingOut(true);
        setTimeout(() => {
          // Keep mascot at bottom-right
          setPosition("bottom-right");
          setIsAnimatingOut(false);
          setIsVisible(true);
          setLastLocation(location);
        }, 500);
      } else {
        // Just appear if already hidden
        setPosition("bottom-right");
        setIsVisible(true);
        setLastLocation(location);
      }
    }
  }, [location, lastLocation, isVisible, setPosition]);

  // Initial appearance animation - only if not closed on this page
  useEffect(() => {
    if (!hasBeenClosedOnThisPage) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasBeenClosedOnThisPage]);

  const getPositionForPage = (path: string): MascotPosition => {
    // Mascot is now fixed at the bottom of the screen
    return "bottom-right";
  };

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

  if (!message) return null;

  // Don't render at all if mascot has been closed and is not visible
  if (!isVisible && !isAnimatingOut) return null;

  const mascotImage = getMascotImage(soulEnergy);

  // Position classes based on mascot position
  const getPositionClasses = (): string => {
    switch (position) {
      case "bottom-right":
        return "bottom-20 right-4";
      case "bottom-left":
        return "bottom-20 left-4";
      case "top-right":
        return "top-20 right-4";
      case "top-left":
        return "top-20 left-4";
      case "middle-right":
        return "top-1/2 -translate-y-1/2 right-4";
      case "middle-left":
        return "top-1/2 -translate-y-1/2 left-4";
      default:
        return "bottom-20 right-4";
    }
  };

  const handleClose = () => {
    setIsAnimatingOut(true);
    setHasBeenClosedOnThisPage(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 500);
  };

  const handleMascotClick = () => {
    // Show video instead of closing
    setShowVideo(true);
    
    // Hide video after 3 seconds
    setTimeout(() => {
      setShowVideo(false);
    }, 3000);
  };

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-40 transition-all duration-700 ease-in-out ${
        isAnimatingOut ? 'animate-mascot-scale-out' : 'animate-mascot-scale-in'
      }`}
    >
      {/* Thought Bubble */}
      <div className="relative mb-3 mr-3">
        <Card 
          className="relative bg-white dark:bg-slate-800 border-2 shadow-xl max-w-xs p-4 rounded-2xl"
          style={{ 
            borderColor: message.color,
            boxShadow: `0 4px 20px ${message.color}40`
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
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

      {/* Mascot - Cute Blob Character or Video */}
      <div 
        className={`relative cursor-pointer hover:glow transition-transform duration-300 ${
          shouldGlow ? 'animate-mascot-glow' : ''
        }`}
        onClick={handleMascotClick}
        data-testid="mascot-image"
        style={{
          animation: showVideo ? 'none' : 'float infinite'
        }}
      >
        {showVideo ? (
          <video 
            src={mascotVideo}
            autoPlay
            muted
            className="w-52 h-52 object-contain rounded-lg shadow-2xl"
            style={{
              filter: `drop-shadow(0 0 30px ${message.color})`
            }}
          />
        ) : (
          <img 
            src={mascotImage} 
            alt="Auri Mascot"
            className="w-52 h-52 object-contain drop-shadow-2xl"
            style={{
              filter: shouldGlow 
                ? `drop-shadow(0 0 40px ${message.color}) drop-shadow(0 0 60px ${message.color})`
                : `drop-shadow(0 0 20px ${message.color}80)`
            }}
          />
        )}
      </div>
    </div>
  );
}
