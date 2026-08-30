import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface PsychologicalPrompt {
  message: string;
  color: string;
  type: 'motivation' | 'calm' | 'growth' | 'encouragement' | 'reflection';
  suggestedGradient?: string;
}

/**
 * Hook to get personalized psychological prompts based on user state
 */
export function usePsychologyPrompt() {
  const { user } = useAuth();

  return useQuery<PsychologicalPrompt>({
    queryKey: ["/api/psychology/prompt"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Refresh every 5 minutes for fresh prompts
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
}

/**
 * Get time of day for client-side
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get psychological color based on current time and mood
 */
export function getPsychologicalColor(timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'): string {
  const time = timeOfDay || getTimeOfDay();
  
  const timeColors = {
    morning: '#fbbf24', // Golden yellow - energizing
    afternoon: '#10b981', // Green - balancing
    evening: '#a855f7', // Purple - reflective
    night: '#06b6d4', // Cyan - calming
  };
  
  return timeColors[time];
}

/**
 * Get gradient class based on psychological state
 */
export function getPsychologicalGradient(state: 'calm' | 'energized' | 'balanced' | 'uplifting' | 'healing'): string {
  const gradients = {
    calm: 'bg-gradient-calming',
    energized: 'bg-gradient-energizing',
    balanced: 'bg-gradient-balanced',
    uplifting: 'bg-gradient-uplifting',
    healing: 'bg-gradient-healing',
  };
  
  return gradients[state];
}
