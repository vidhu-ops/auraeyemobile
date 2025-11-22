import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useMascot, type MascotPosition } from "@/hooks/use-mascot";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface MoodSnapshot {
  dominantMood: string;
  energyLevel: string;
}

interface JournalEntry {
  content: string;
}
import mascotExplorer from "@assets/WhatsApp_Image_2025-11-05_at_5.52.21_PM-removebg-preview_1762855217308.png";
import mascotBeginner from "@assets/WhatsApp_Image_2025-11-15_at_10.14.47_PM-removebg-preview_1763506298018.png";
import mascotIntermediate from "@assets/WhatsApp_Image_2025-11-15_at_10.14.47_PM__1_-removebg-preview_1763506521677.png";
import mascotAdvanced from "@assets/WhatsApp_Image_2025-11-15_at_10.23.51_PM-removebg-preview_1763505956955.png";
import mascotAwakened from "@assets/WhatsApp_Image_2025-11-15_at_10.15.23_PM-removebg-preview_1763505956954.png";
import mascotGif from "@assets/Recording-2025-11-19-023915-unscreen_1763500213527.gif";

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
  const [hasBeenClickedPermanently, setHasBeenClickedPermanently] = useState(
    () => localStorage.getItem("mascotClicked") === "true"
  );

  // Listen for summon event
  useEffect(() => {
    const handleSummon = () => {
      setHasBeenClickedPermanently(false);
      setHasBeenClosedOnThisPage(false);
      setIsVisible(true);
    };

    window.addEventListener('summon-mascot', handleSummon);
    return () => window.removeEventListener('summon-mascot', handleSummon);
  }, []);

  // Get user's credits
  const { data: creditsData } = useQuery<{ credits: number }>({
    queryKey: ["/api/credits"],
    enabled: !!user,
  });

  // Get mood and journal data
  const { data: moodData } = useQuery<MoodSnapshot>({
    queryKey: ["/api/mood-snapshots"],
    enabled: !!user,
  });

  const { data: journalData } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    enabled: !!user,
  });

  // Get last scan color from localStorage
  useEffect(() => {
    const storedColor = localStorage.getItem("lastAuraColor");
    if (storedColor) {
      setLastScanColor(storedColor);
    }
  }, [location]);

  // Reappear when page changes - always show on home page, otherwise respect permanent click state
  useEffect(() => {
    const isHomePage = location === "/";
    
    // Show on page change if: going to home page OR not permanently clicked
    if (location !== lastLocation && (isHomePage || !hasBeenClickedPermanently)) {
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
    } else if (location !== lastLocation) {
      // Just update the last location without showing mascot
      setLastLocation(location);
    }
  }, [location, lastLocation, isVisible, setPosition, hasBeenClickedPermanently]);

  // Initial appearance animation - always show on home page, otherwise respect permanent click state
  useEffect(() => {
    const isHomePage = location === "/";
    
    // Always show on home page, or show on other pages if not permanently clicked
    if (!hasBeenClosedOnThisPage && (isHomePage || !hasBeenClickedPermanently)) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasBeenClosedOnThisPage, hasBeenClickedPermanently, location]);

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
      creditsData?.credits || 0,
      moodData,
      journalData
    );
    setMessage(messages);
  }, [location, user, soulEnergy, lastScanColor, creditsData, moodData, journalData]);

  // Chakra color mapping for numerology-based prompts
  const chakraColorMap: Record<number, { color: string; hex: string; meaning: string }> = {
    1: { color: 'Yellow', hex: '#eab308', meaning: 'Personal Power & Will' },
    2: { color: 'Green', hex: '#22c55e', meaning: 'Heart & Emotions' },
    3: { color: 'Violet', hex: '#8b5cf6', meaning: 'Intuition & Wisdom' },
    4: { color: 'Brown', hex: '#8B4513', meaning: 'Grounding & Stability' },
    5: { color: 'Blue', hex: '#3b82f6', meaning: 'Communication & Truth' },
    6: { color: 'Orange', hex: '#f97316', meaning: 'Creativity & Pleasure' },
    7: { color: 'White', hex: '#ffffff', meaning: 'Spiritual Connection' },
    8: { color: 'Indigo', hex: '#6366f1', meaning: 'Inner Vision & Insight' },
    9: { color: 'Red', hex: '#ef4444', meaning: 'Life Force & Energy' },
  };

  const getChakraColor = (): { number: number; color: string; hex: string; meaning: string } | null => {
    const randomChakra = Math.floor(Math.random() * 9) + 1;
    const chakra = chakraColorMap[randomChakra];
    return { number: randomChakra, ...chakra };
  };

  const getMoodBasedPrompt = (mood: string | undefined, journal: JournalEntry[] | undefined): string | null => {
    if (!mood && !journal) return null;

    const moodPrompts: Record<string, string[]> = {
      'calm': [
        'Your peaceful energy is beautiful. Keep nurturing this serenity. 🧘',
        'The calm within you is your greatest strength. Stay centered. 💚',
        'Your tranquility radiates outward. What a gift you are! ✨'
      ],
      'energetic': [
        'Your vibrant energy is magnetic! Channel it into your dreams! ⚡',
        'I feel your enthusiasm! Your dynamism is inspiring! 🔥',
        'Your energy is contagious! Keep shining brilliantly! ✨'
      ],
      'reflective': [
        'Your introspection is wisdom in motion. Honor this moment. 🔮',
        'Deep reflection leads to profound growth. You\'re on the right path! 📖',
        'Your thoughtful nature is your superpower. Keep pondering! 💭'
      ],
      'happy': [
        'Your joy is radiant! It lights up the spiritual realm! 😊',
        'Happiness looks beautiful on you! Spread it everywhere! 💫',
        'Your smile carries celestial energy! Keep beaming! ✨'
      ],
      'anxious': [
        'I sense tension. Take a deep breath and ground yourself. 🌍',
        'Your worries are temporary. Trust the journey. 🙏',
        'Let go of what you cannot control. Peace awaits you. 🕊️'
      ],
      'default': [
        'Your journal reflections show real growth. I\'m proud of you! 📝',
        'Your thoughts and feelings matter deeply. Keep expressing them. 💭',
        'Your journey of self-discovery is beautiful. Continue exploring! 🌟'
      ]
    };

    const category = (mood?.toLowerCase() || 'default') as keyof typeof moodPrompts;
    const prompts = moodPrompts[category] || moodPrompts['default'];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const getContextualMessage = (
    path: string, 
    username: string,
    userType: string, 
    energy: number,
    scanColor: string | null,
    credits: number,
    mood: MoodSnapshot | undefined,
    journal: JournalEntry[] | undefined
  ): MascotMessage => {
    
    // Home page messages
    if (path === "/") {
      const moodPrompt = getMoodBasedPrompt(mood?.dominantMood, journal);
      if (moodPrompt) {
        const chakra = getChakraColor();
        return {
          text: `${username}, I feel your ${mood?.dominantMood || 'spiritual'} energy today. ${moodPrompt} 🌟`,
          color: chakra?.hex || "#06b6d4",
          emotion: 'happy'
        };
      }

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
      const moodPrompt = getMoodBasedPrompt(mood?.dominantMood, journal);
      if (moodPrompt) {
        const chakra = getChakraColor();
        return {
          text: `${username}, your journal is a sacred space. ${moodPrompt} 📖`,
          color: chakra?.hex || "#a855f7",
          emotion: 'happy'
        };
      }
      return {
        text: `${username}, your spiritual journey matters. Document your feelings today! 📖✨`,
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
      const chakra = getChakraColor();
      return {
        text: `${username}, the ${chakra?.color} chakra energy aligns with your numerological path! Discover the ${chakra?.meaning}! 🔢✨`,
        color: chakra?.hex || "#a855f7",
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
    // Energy level based mascot evolution stages:
    // Explorer (0-2000): Current mascot
    // Beginner (2001-4000): Open eyes, no rings
    // Intermediate (4001-6000): Open third eye with 1 ring
    // Advanced (6001-8000): Open eye with 1 ring, glowing/winking
    // Awakened (8001+): 2 rings, fully evolved
    
    if (energy >= 8001) {
      return mascotAwakened; // 2 rings - fully awakened
    } else if (energy >= 6001) {
      return mascotAdvanced; // 1 ring, glowing, winking
    } else if (energy >= 4001) {
      return mascotIntermediate; // 1 ring, open third eye
    } else if (energy >= 2001) {
      return mascotBeginner; // Open eyes, no rings
    } else {
      return mascotExplorer; // Explorer stage - current mascot
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
    }, 200);
  };

  const handleMascotClick = () => {
    // Show GIF instantly
    setShowVideo(true);
    
    // Mark as permanently clicked in localStorage
    localStorage.setItem("mascotClicked", "true");
    setHasBeenClickedPermanently(true);
    setHasBeenClosedOnThisPage(true);
    
    // After 2 seconds (gif duration), hide everything immediately without showing static image
    setTimeout(() => {
      setIsVisible(false);
      setShowVideo(false);
      setIsAnimatingOut(false);
    }, 2000);
  };

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-40 transition-all duration-300 ease-in-out ${
        isAnimatingOut ? 'animate-mascot-scale-out' : 'animate-mascot-scale-in'
      }`}
    >
      {/* Thought Bubble - hide when showing video */}
      {!showVideo && <div className="relative mb-3 mr-3">
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
      </div>}

      {/* Mascot - Cute Blob Character or GIF */}
      <div 
        className={`relative cursor-pointer hover:glow transition-transform duration-200 ${
          shouldGlow ? 'animate-mascot-glow' : ''
        }`}
        onClick={handleMascotClick}
        data-testid="mascot-image"
        style={{
          animation: showVideo ? 'none' : 'float infinite'
        }}
      >
        {showVideo ? (
          <img 
            src={mascotGif}
            alt="Auri Animation"
            className="w-40 h-40 object-contain drop-shadow-2xl"
            style={{
              filter: `drop-shadow(0 0 40px ${message.color}) drop-shadow(0 0 60px ${message.color})`
            }}
          />
        ) : (
          <img 
            src={mascotImage} 
            alt="Auri Mascot"
            className="w-40 h-40 object-contain drop-shadow-2xl"
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
