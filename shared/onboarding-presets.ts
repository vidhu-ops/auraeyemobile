export const manifestIntentions = ["Health", "Relationships", "Abundance", "Clarity"] as const;
export type ManifestIntention = typeof manifestIntentions[number];

export const energyLevels = ["Low", "Balanced", "High"] as const;
export type EnergyLevel = typeof energyLevels[number];

export const blocks = ["Health", "Money", "Relationships", "Career", "Self-Doubt", "Time", "Energy"] as const;
export type Block = typeof blocks[number];

export interface OnboardingResponses {
  manifestIntention: ManifestIntention;
  energyLevel: EnergyLevel;
  biggestBlock: Block;
}

export interface PersonalizedGuidance {
  welcomeMessage: string;
  dailyAffirmation: string;
  breathworkRecommendation: string;
  lifestyleSuggestions: string[];
  meditationFocus: string;
  chakraToBalance: string;
}

export function getPersonalizedGuidance(responses: Partial<OnboardingResponses>): PersonalizedGuidance {
  const { manifestIntention, energyLevel, biggestBlock } = responses;

  const guidance: PersonalizedGuidance = {
    welcomeMessage: "Welcome to your spiritual journey!",
    dailyAffirmation: "I am aligned with my highest purpose.",
    breathworkRecommendation: "Start with 5 minutes of deep breathing.",
    lifestyleSuggestions: ["Drink plenty of water", "Get 7-8 hours of sleep", "Practice gratitude daily"],
    meditationFocus: "Inner peace and clarity",
    chakraToBalance: "Heart Chakra"
  };

  // Customize based on manifest intention
  switch (manifestIntention) {
    case "Health":
      guidance.welcomeMessage = "Your journey to vibrant health begins now! 🌿";
      guidance.dailyAffirmation = "My body is a temple of health and vitality. I am healing every day.";
      guidance.breathworkRecommendation = "Practice healing breath: 4 counts in, hold for 4, 8 counts out. Repeat 10 times.";
      guidance.lifestyleSuggestions = [
        "Start your day with warm lemon water",
        "Move your body for at least 20 minutes daily",
        "Eat colorful, whole foods",
        "Practice body scan meditation before sleep"
      ];
      guidance.meditationFocus = "Healing energy and physical vitality";
      guidance.chakraToBalance = "Solar Plexus Chakra (for vitality and energy)";
      break;

    case "Relationships":
      guidance.welcomeMessage = "Love and connection are flowing into your life! 💕";
      guidance.dailyAffirmation = "I attract loving, supportive relationships. I am worthy of deep connection.";
      guidance.breathworkRecommendation = "Heart-opening breath: Place hand on heart, breathe deeply into your chest for 5 minutes.";
      guidance.lifestyleSuggestions = [
        "Practice active listening in conversations",
        "Express gratitude to loved ones daily",
        "Set healthy boundaries with compassion",
        "Journal about your relationship patterns"
      ];
      guidance.meditationFocus = "Heart opening and compassionate connection";
      guidance.chakraToBalance = "Heart Chakra (for love and connection)";
      break;

    case "Abundance":
      guidance.welcomeMessage = "Abundance is your birthright! Prosperity flows to you now! 💰";
      guidance.dailyAffirmation = "I am a magnet for abundance. Opportunities flow to me effortlessly.";
      guidance.breathworkRecommendation = "Abundance breath: Breathe in prosperity (4 counts), hold abundance (7 counts), release scarcity (8 counts).";
      guidance.lifestyleSuggestions = [
        "Visualize your abundant future for 5 minutes daily",
        "Declutter your space to invite new energy",
        "Practice generosity in small ways",
        "Track and celebrate small wins"
      ];
      guidance.meditationFocus = "Prosperity consciousness and receiving";
      guidance.chakraToBalance = "Root Chakra (for security and grounding in abundance)";
      break;

    case "Clarity":
      guidance.welcomeMessage = "Clear vision and wisdom are awakening within you! 🔮";
      guidance.dailyAffirmation = "I trust my inner wisdom. My path becomes clearer every day.";
      guidance.breathworkRecommendation = "Clarity breath: Alternate nostril breathing for mental clarity - 5 minutes daily.";
      guidance.lifestyleSuggestions = [
        "Journal your thoughts each morning",
        "Reduce digital distractions for 1 hour daily",
        "Practice mindful walking in nature",
        "Ask yourself clarifying questions before bed"
      ];
      guidance.meditationFocus = "Third eye activation and intuitive wisdom";
      guidance.chakraToBalance = "Third Eye Chakra (for insight and intuition)";
      break;
  }

  // Adjust based on energy level
  switch (energyLevel) {
    case "Low":
      guidance.breathworkRecommendation = "Energizing breath: Quick, rhythmic breaths (2 counts in, 2 counts out) for 2 minutes to boost energy.";
      guidance.lifestyleSuggestions = [
        ...guidance.lifestyleSuggestions,
        "Take a 20-minute power nap if needed",
        "Spend 15 minutes in sunlight daily",
        "Eat energy-boosting foods (nuts, fruits, whole grains)"
      ];
      break;

    case "Balanced":
      guidance.breathworkRecommendation += " This will help maintain your beautiful balance!";
      guidance.lifestyleSuggestions = [
        ...guidance.lifestyleSuggestions,
        "Continue your current practices - you're doing great!",
        "Share your wisdom with others who seek balance"
      ];
      break;

    case "High":
      guidance.breathworkRecommendation = "Grounding breath: Deep belly breathing (6 counts in, 6 counts out) for 10 minutes to channel your energy.";
      guidance.lifestyleSuggestions = [
        ...guidance.lifestyleSuggestions,
        "Ground your energy with barefoot walking",
        "Channel high energy into creative projects",
        "Practice gentle yoga or tai chi"
      ];
      break;
  }

  // Add specific remedies based on biggest block
  switch (biggestBlock) {
    case "Health":
      guidance.lifestyleSuggestions.unshift("Consult with healthcare professionals for any health concerns");
      guidance.meditationFocus += " with focus on body healing";
      break;

    case "Money":
      guidance.lifestyleSuggestions.unshift("Create a simple budget to bring awareness to your finances");
      guidance.dailyAffirmation += " Money flows to me in expected and unexpected ways.";
      break;

    case "Relationships":
      guidance.lifestyleSuggestions.unshift("Practice self-love rituals daily");
      guidance.meditationFocus += " and heart chakra healing";
      break;

    case "Career":
      guidance.lifestyleSuggestions.unshift("Take one small step toward your career goals today");
      guidance.dailyAffirmation += " I am guided to my perfect career path.";
      break;

    case "Self-Doubt":
      guidance.lifestyleSuggestions.unshift("Write down 3 things you're proud of each evening");
      guidance.dailyAffirmation = "I trust myself completely. I am capable and worthy.";
      break;

    case "Time":
      guidance.lifestyleSuggestions.unshift("Use time-blocking to protect your priorities");
      guidance.meditationFocus += " on present moment awareness";
      break;

    case "Energy":
      guidance.lifestyleSuggestions.unshift("Identify and eliminate one energy drain this week");
      guidance.chakraToBalance = "Solar Plexus Chakra (your power center)";
      break;
  }

  return guidance;
}
