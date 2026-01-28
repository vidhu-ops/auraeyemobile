/**
 * Mood-Based Psychological Banner
 * Displays personalized psychological prompts and color-based guidance
 */

import { usePsychologyPrompt, getTimeOfDay, getPsychologicalColor } from "@/hooks/use-psychology";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Zap, Moon, Sun, CloudRain } from "lucide-react";

interface MoodBannerProps {
  variant?: 'subtle' | 'prominent';
  showIcon?: boolean;
}

export function MoodBanner({ variant = 'subtle', showIcon = true }: MoodBannerProps) {
  const { data: prompt, isLoading, error } = usePsychologyPrompt();
  const timeOfDay = getTimeOfDay();

  // Show loading state
  if (isLoading) {
    return (
      <div className="px-4 py-2 rounded-lg text-sm text-gray-400 bg-slate-700/50 animate-pulse" data-testid="mood-banner-loading">
        Loading your personalized insight...
      </div>
    );
  }

  // If there's an error or no prompt, use a default based on time of day
  if (error || !prompt) {
    const defaultPrompts = {
      morning: { message: "Positive intentions matter the most, its the seed for a thought ✨", color: "#fbbf24", type: 'motivation' as const },
      afternoon: { message: "Keep going! You're doing great 🌟", color: "#10b981", type: 'encouragement' as const },
      evening: { message: "Take a moment to reflect on your good deeds", color: "#a855f7", type: 'reflection' as const },
      night: { message: "Make the most of every moment 💫", color: "#06b6d4", type: 'calm' as const },
    };
    const defaultPrompt = defaultPrompts[timeOfDay];
    
    // Use default prompt
    const fallbackPrompt = {
      message: defaultPrompt.message,
      color: defaultPrompt.color,
      type: defaultPrompt.type
    };
    
    return renderBanner(fallbackPrompt, variant, showIcon, timeOfDay);
  }

  return renderBanner(prompt, variant, showIcon, timeOfDay);
}

function renderBanner(
  prompt: { message: string; color: string; type: string },
  variant: 'subtle' | 'prominent',
  showIcon: boolean,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
) {

  // Select icon based on prompt type
  const getIcon = () => {
    switch (prompt.type) {
      case 'motivation':
        return <Zap className="h-5 w-5" />;
      case 'calm':
        return <CloudRain className="h-5 w-5" />;
      case 'growth':
        return <Sparkles className="h-5 w-5" />;
      case 'encouragement':
        return <Heart className="h-5 w-5" />;
      case 'reflection':
        return timeOfDay === 'night' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  // Subtle variant - small banner
  if (variant === 'subtle') {
    return (
      <div 
        className="px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
        style={{ 
          backgroundColor: prompt.color,
          boxShadow: `0 4px 12px ${prompt.color}40`
        }}
        data-testid="mood-banner-subtle"
      >
        {showIcon && <span className="opacity-90">{getIcon()}</span>}
        <span className="flex-1">{prompt.message}</span>
      </div>
    );
  }

  // Prominent variant - larger card
  return (
    <Card 
      className="p-6 border-2 shadow-xl relative overflow-hidden"
      style={{ 
        borderColor: prompt.color,
        background: `linear-gradient(135deg, ${prompt.color}10, ${prompt.color}05)`
      }}
      data-testid="mood-banner-prominent"
    >
      {/* Background gradient accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: prompt.color }}
      />
      
      <div className="relative flex items-start gap-4">
        {showIcon && (
          <div 
            className="p-3 rounded-full text-white shadow-lg"
            style={{ backgroundColor: prompt.color }}
          >
            {getIcon()}
          </div>
        )}
        <div className="flex-1">
          <p className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
            {prompt.message}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Personalized guidance based on your energy patterns
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Simple color indicator - shows current mood color
 */
export function MoodColorIndicator() {
  const { data: prompt } = usePsychologyPrompt();
  const timeOfDay = getTimeOfDay();
  const fallbackColor = getPsychologicalColor(timeOfDay);
  const color = prompt?.color || fallbackColor;

  return (
    <div className="flex items-center gap-2" data-testid="mood-color-indicator">
      <div 
        className="w-3 h-3 rounded-full shadow-md animate-pulse"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80`
        }}
      />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        Your energy color
      </span>
    </div>
  );
}

/**
 * Time-based greeting with psychological color
 */
export function PsychologicalGreeting({ username }: { username: string }) {
  const timeOfDay = getTimeOfDay();
  const color = getPsychologicalColor(timeOfDay);

  const greetings = {
    morning: `Hello, ${username}! `,
    afternoon: `How are you?, ${username}! `,
    evening: `Hi There, ${username}! `,
    night: `How was your day?, ${username}! `
  };

  return (
    <h2 
      className="text-2xl md:text-3xl font-bold mb-4"
      style={{ color }}
      data-testid="psychological-greeting"
    >
      {}
    </h2>
  );
}
