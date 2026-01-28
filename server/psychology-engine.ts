/**
 * Psychology Engine
 * Generates intelligent, personalized prompts based on user behavior, mood, and psychological patterns
 */

interface UserPsychologyData {
  energyLevel?: number;
  journalEntries?: number;
  lastMood?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  recentActivity?: string;
  stressLevel?: 'low' | 'medium' | 'high';
}

interface PsychologicalPrompt {
  message: string;
  color: string; // Hex color that matches the psychological state
  type: 'motivation' | 'calm' | 'growth' | 'encouragement' | 'reflection';
  suggestedGradient?: string;
}

/**
 * Get time-based psychological context
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Morning prompts - Focus on motivation, energy, and setting intentions
 */
const morningPrompts = [
  {
    message: "Today is a fresh canvas - what beautiful energy will you create? ✨",
    color: "#fbbf24", // Golden yellow for optimism
    type: "motivation" as const,
    suggestedGradient: "uplifting"
  },
  {
    message: "Your spiritual journey awaits. Let's set a positive intention for today. 🌅",
    color: "#f59e0b", // Warm orange for energy
    type: "motivation" as const,
    suggestedGradient: "energizing"
  },
  {
    message: "Take a deep breath and center yourself. What wisdom does your soul seek today? 🙏",
    color: "#8b5cf6", // Purple for spirituality
    type: "reflection" as const,
    suggestedGradient: "healing"
  }
];

/**
 * Afternoon prompts - Focus on maintaining energy and progress
 */
const afternoonPrompts = [
  {
    message: "How is your energy flowing? Remember to take mindful breaks. 💚",
    color: "#10b981", // Green for balance
    type: "calm" as const,
    suggestedGradient: "balanced"
  },
  {
    message: "You're doing great! Keep that positive energy flowing through the rest of your day. ⭐",
    color: "#14b8a6", // Teal for progress
    type: "encouragement" as const,
    suggestedGradient: "balanced"
  },
  {
    message: "Mid-day wisdom: Sometimes the best progress happens when we pause and breathe. 🌬️",
    color: "#06b6d4", // Cyan for calm
    type: "calm" as const,
    suggestedGradient: "calming"
  }
];

/**
 * Evening prompts - Focus on reflection and winding down
 */
const eveningPrompts = [
  {
    message: "What are three things that brought you joy today? 🌙",
    color: "#a855f7", // Soft purple for reflection
    type: "reflection" as const,
    suggestedGradient: "healing"
  },
  {
    message: "As the day winds down, take a moment to honor your journey. You did your best. 💜",
    color: "#8b5cf6", // Purple for compassion
    type: "encouragement" as const,
    suggestedGradient: "healing"
  },
  {
    message: "Time to release the day's energy. Journal your thoughts or meditate for clarity. 📝",
    color: "#06b6d4", // Calming blue
    type: "reflection" as const,
    suggestedGradient: "calming"
  }
];

/**
 * Night prompts - Focus on rest, gratitude, and letting go
 */
const nightPrompts = [
  {
    message: "Rest well, beautiful soul. Tomorrow brings new light and possibilities. 🌟",
    color: "#6366f1", // Deep indigo for rest
    type: "calm" as const,
    suggestedGradient: "calming"
  },
  {
    message: "Before sleep, send gratitude to your spirit guides. You are loved and protected. 💫",
    color: "#8b5cf6", // Purple for spirituality
    type: "reflection" as const,
    suggestedGradient: "healing"
  },
  {
    message: "Release today's worries. Trust that you are exactly where you need to be. 🌙",
    color: "#06b6d4", // Peaceful cyan
    type: "calm" as const,
    suggestedGradient: "calming"
  }
];

/**
 * Energy-based prompts - Respond to user's current energy state
 */
const lowEnergyPrompts = [
  {
    message: "Your energy feels low today. That's okay - even spiritual warriors need rest. 💙",
    color: "#06b6d4", // Soothing cyan
    type: "calm" as const,
    suggestedGradient: "calming"
  },
  {
    message: "Gentle reminder: You don't always need to be 'on'. Rest is sacred too. 🕊️",
    color: "#8b5cf6", // Nurturing purple
    type: "encouragement" as const,
    suggestedGradient: "healing"
  },
  {
    message: "Low energy is your body's wisdom speaking. Listen with compassion, not judgment. 🌸",
    color: "#ec4899", // Compassionate pink
    type: "calm" as const,
    suggestedGradient: "healing"
  }
];

const highEnergyPrompts = [
  {
    message: "What amazing energy you have today! Channel it into something beautiful. ⚡",
    color: "#f59e0b", // Vibrant orange
    type: "motivation" as const,
    suggestedGradient: "energizing"
  },
  {
    message: "Your vibration is soaring! This is a perfect time for manifestation and creation. ✨",
    color: "#fbbf24", // Golden yellow
    type: "motivation" as const,
    suggestedGradient: "uplifting"
  },
  {
    message: "Such radiant energy! Share your light with others today. 🌟",
    color: "#10b981", // Bright green
    type: "encouragement" as const,
    suggestedGradient: "energizing"
  }
];

/**
 * Stress-responsive prompts - Help users manage stress
 */
const stressManagementPrompts = [
  {
    message: "I sense tension. Let's breathe together: In through your nose... Out through your mouth. 🌬️",
    color: "#06b6d4", // Calming blue
    type: "calm" as const,
    suggestedGradient: "calming"
  },
  {
    message: "Feeling overwhelmed? Remember: You can't pour from an empty cup. Self-care isn't selfish. 💚",
    color: "#10b981", // Healing green
    type: "encouragement" as const,
    suggestedGradient: "balanced"
  },
  {
    message: "Ground yourself: Name 5 things you see, 4 you hear, 3 you can touch. You're safe. 🌿",
    color: "#14b8a6", // Grounding teal
    type: "calm" as const,
    suggestedGradient: "calming"
  }
];

/**
 * Growth-focused prompts - Encourage personal development
 */
const growthPrompts = [
  {
    message: "Every challenge is your soul's invitation to grow. What is yours teaching you? 🌱",
    color: "#10b981", // Growth green
    type: "growth" as const,
    suggestedGradient: "balanced"
  },
  {
    message: "You're not the same person you were last month. Celebrate your evolution! 🦋",
    color: "#14b8a6", // Transformative teal
    type: "encouragement" as const,
    suggestedGradient: "balanced"
  },
  {
    message: "Discomfort means you're expanding beyond your limits. That's beautiful courage. 💪",
    color: "#f59e0b", // Empowering orange
    type: "motivation" as const,
    suggestedGradient: "energizing"
  }
];

/**
 * Generate a personalized prompt based on user psychology
 */
export function generatePersonalizedPrompt(data: UserPsychologyData): PsychologicalPrompt {
  const { energyLevel, journalEntries, lastMood, timeOfDay, recentActivity, stressLevel } = data;

  // Priority 1: Address high stress levels
  if (stressLevel === 'high' || stressLevel === 'medium') {
    return stressManagementPrompts[Math.floor(Math.random() * stressManagementPrompts.length)];
  }

  // Priority 2: Respond to energy levels
  if (energyLevel !== undefined) {
    if (energyLevel <= 3) {
      return lowEnergyPrompts[Math.floor(Math.random() * lowEnergyPrompts.length)];
    } else if (energyLevel >= 8) {
      return highEnergyPrompts[Math.floor(Math.random() * highEnergyPrompts.length)];
    }
  }

  // Priority 3: Encourage journaling if user hasn't journaled recently
  if (journalEntries !== undefined && journalEntries === 0 && (timeOfDay === 'evening' || timeOfDay === 'night')) {
    return {
      message: "Your journal misses you! 📔 Reflecting on your day can bring so much clarity and peace.",
      color: "#a855f7",
      type: "reflection",
      suggestedGradient: "healing"
    };
  }

  // Priority 4: Time-based prompts
  switch (timeOfDay) {
    case 'morning':
      return morningPrompts[Math.floor(Math.random() * morningPrompts.length)];
    case 'afternoon':
      return afternoonPrompts[Math.floor(Math.random() * afternoonPrompts.length)];
    case 'evening':
      return eveningPrompts[Math.floor(Math.random() * eveningPrompts.length)];
    case 'night':
      return nightPrompts[Math.floor(Math.random() * nightPrompts.length)];
  }

  // Default: Growth-focused prompt
  return growthPrompts[Math.floor(Math.random() * growthPrompts.length)];
}

/**
 * Analyze mood from journal entry text using keyword matching
 */
export function analyzeMoodFromText(text: string): {
  mood: string;
  intensity: number;
  stressLevel: 'low' | 'medium' | 'high';
} {
  const lowerText = text.toLowerCase();

  // Positive mood indicators
  const positiveKeywords = ['happy', 'joy', 'grateful', 'blessed', 'peaceful', 'calm', 'love', 'wonderful', 'amazing', 'great'];
  const energeticKeywords = ['excited', 'energized', 'motivated', 'inspired', 'powerful'];
  
  // Negative/stress indicators
  const stressKeywords = ['stress', 'anxious', 'worried', 'overwhelm', 'tired', 'exhausted', 'difficult', 'hard', 'struggle'];
  const sadKeywords = ['sad', 'down', 'depressed', 'lonely', 'hurt', 'pain'];

  let positiveCount = 0;
  let stressCount = 0;
  let energyCount = 0;

  positiveKeywords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });

  energeticKeywords.forEach(word => {
    if (lowerText.includes(word)) energyCount++;
  });

  stressKeywords.forEach(word => {
    if (lowerText.includes(word)) stressCount++;
  });

  sadKeywords.forEach(word => {
    if (lowerText.includes(word)) stressCount++;
  });

  // Determine dominant mood
  let mood = 'neutral';
  let intensity = 5;

  if (stressCount > 2) {
    mood = 'anxious';
    intensity = 3;
  } else if (energyCount > 1) {
    mood = 'energized';
    intensity = 8;
  } else if (positiveCount > 2) {
    mood = 'joyful';
    intensity = 8;
  } else if (positiveCount > 0) {
    mood = 'peaceful';
    intensity = 7;
  }

  // Determine stress level
  const stressLevel: 'low' | 'medium' | 'high' = 
    stressCount >= 3 ? 'high' :
    stressCount >= 1 ? 'medium' :
    'low';

  return { mood, intensity, stressLevel };
}

/**
 * Get color recommendation based on mood
 */
export function getColorForMood(mood: string): string {
  const moodColors: Record<string, string> = {
    'joyful': '#fbbf24', // Golden yellow
    'peaceful': '#06b6d4', // Calming cyan
    'anxious': '#10b981', // Balancing green
    'energized': '#f59e0b', // Vibrant orange
    'reflective': '#8b5cf6', // Thoughtful purple
    'grateful': '#ec4899', // Loving pink
    'neutral': '#14b8a6', // Balanced teal
  };

  return moodColors[mood] || moodColors['neutral'];
}

/**
 * Generate activity recommendations based on psychological state
 */
export function getActivityRecommendations(data: UserPsychologyData): string[] {
  const { energyLevel, stressLevel, timeOfDay } = data;
  const recommendations: string[] = [];

  if (stressLevel === 'high') {
    recommendations.push('Try a 5-minute breathing meditation');
    recommendations.push('Take a grounding walk in nature');
    recommendations.push('Journal about what\'s weighing on your mind');
  }

  if (energyLevel && energyLevel <= 3) {
    recommendations.push('Rest is productive - honor your need for downtime');
    recommendations.push('Gentle yoga or stretching');
    recommendations.push('Listen to calming music or nature sounds');
  }

  if (energyLevel && energyLevel >= 7) {
    recommendations.push('This is a great time for manifestation work');
    recommendations.push('Creative expression - art, writing, or music');
    recommendations.push('Help or inspire someone else with your energy');
  }

  if (timeOfDay === 'morning') {
    recommendations.push('Set your intentions for the day');
    recommendations.push('Practice sun salutations or energizing movement');
  }

  if (timeOfDay === 'evening' || timeOfDay === 'night') {
    recommendations.push('Reflect on gratitude from today');
    recommendations.push('Release the day through meditation or journaling');
  }

  return recommendations;
}

export { getTimeOfDay };
