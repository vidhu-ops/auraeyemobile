/**
 * Mood-Based Psychological Recommendations
 * Provides personalized tips, somatic exercises, and breathing techniques
 */

export interface MoodRecommendations {
  psychologicalTips: string[];
  breathingTechniques: BreathingTechnique[];
  somaticExercises: SomaticExercise[];
  affirmations: string[];
  colorTherapy: {
    color: string;
    meaning: string;
  };
}

export interface BreathingTechnique {
  name: string;
  description: string;
  steps: string[];
  duration: string;
  benefits: string;
}

export interface SomaticExercise {
  name: string;
  description: string;
  steps: string[];
  duration: string;
  benefits: string;
}

interface MoodCheckInData {
  emotion: string;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  socialConnection: number;
  physicalActivity: number;
}

// Breathing Techniques Library
const breathingTechniques = {
  boxBreathing: {
    name: "Box Breathing",
    description: "A calming technique used by Navy SEALs to manage stress",
    steps: [
      "Inhale slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 4 counts",
      "Hold empty for 4 counts",
      "Repeat 4-6 times"
    ],
    duration: "2-3 minutes",
    benefits: "Reduces anxiety, improves focus, calms nervous system"
  },
  
  deepBelly: {
    name: "Deep Belly Breathing",
    description: "Activates the body's relaxation response",
    steps: [
      "Place one hand on your chest, one on your belly",
      "Breathe in deeply through your nose, expanding your belly",
      "Your chest should stay relatively still",
      "Exhale slowly through your mouth",
      "Repeat for 5-10 breaths"
    ],
    duration: "3-5 minutes",
    benefits: "Lowers heart rate, reduces stress hormones, promotes relaxation"
  },
  
  fourSevenEight: {
    name: "4-7-8 Breathing",
    description: "Natural tranquilizer for the nervous system",
    steps: [
      "Exhale completely through your mouth",
      "Inhale quietly through your nose for 4 counts",
      "Hold your breath for 7 counts",
      "Exhale completely through your mouth for 8 counts",
      "Repeat 3-4 times"
    ],
    duration: "2 minutes",
    benefits: "Helps fall asleep, manages anxiety, reduces stress"
  },
  
  energizing: {
    name: "Energizing Breath",
    description: "Quick way to boost alertness and energy",
    steps: [
      "Sit up straight with shoulders relaxed",
      "Take quick, forceful inhales through your nose",
      "Quick, forceful exhales through your nose",
      "Do this rapidly for 10-15 breaths",
      "Return to normal breathing"
    ],
    duration: "1 minute",
    benefits: "Increases alertness, boosts energy, clears mental fog"
  },
  
  alternateNostril: {
    name: "Alternate Nostril Breathing",
    description: "Balances left and right brain hemispheres",
    steps: [
      "Close right nostril with right thumb",
      "Inhale slowly through left nostril",
      "Close left nostril with ring finger, release right",
      "Exhale through right nostril",
      "Inhale through right, then switch and exhale left",
      "Repeat 5-10 cycles"
    ],
    duration: "3-5 minutes",
    benefits: "Balances emotions, improves focus, reduces anxiety"
  }
};

// Somatic Exercises Library
const somaticExercises = {
  bodyScanning: {
    name: "Body Scanning",
    description: "Progressive relaxation through body awareness",
    steps: [
      "Lie down or sit comfortably",
      "Close your eyes and take 3 deep breaths",
      "Bring attention to your toes, notice any sensations",
      "Slowly move awareness up through feet, legs, torso",
      "Continue through arms, neck, and head",
      "Notice areas of tension without judgment",
      "Breathe into tense areas, imagining them softening"
    ],
    duration: "5-10 minutes",
    benefits: "Releases physical tension, increases body awareness, promotes relaxation"
  },
  
  shoulderRolls: {
    name: "Shoulder Rolls & Release",
    description: "Releases tension held in shoulders and neck",
    steps: [
      "Stand or sit with spine straight",
      "Slowly roll shoulders backward 5 times",
      "Roll shoulders forward 5 times",
      "Lift shoulders to ears, hold for 3 seconds",
      "Drop shoulders down with a sigh",
      "Repeat 3-5 times"
    ],
    duration: "2-3 minutes",
    benefits: "Releases upper body tension, improves posture, reduces stress"
  },
  
  grounding: {
    name: "5-4-3-2-1 Grounding",
    description: "Brings you back to present moment",
    steps: [
      "Name 5 things you can see",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
      "Take a deep breath"
    ],
    duration: "3-5 minutes",
    benefits: "Reduces anxiety, stops overthinking, anchors to present"
  },
  
  shakeItOff: {
    name: "Shake It Off",
    description: "Physical release of stuck energy",
    steps: [
      "Stand with feet hip-width apart",
      "Start gently shaking your hands and arms",
      "Gradually involve your whole body",
      "Let your head, shoulders, hips move freely",
      "Make sounds if it feels natural",
      "Continue for 1-2 minutes",
      "Slowly come to stillness and notice how you feel"
    ],
    duration: "2-3 minutes",
    benefits: "Releases trapped emotions, energizes body, shifts stagnant energy"
  },
  
  progressiveRelaxation: {
    name: "Progressive Muscle Relaxation",
    description: "Systematically tense and release muscle groups",
    steps: [
      "Tense your feet for 5 seconds, then release",
      "Move to calves, tense and release",
      "Continue through thighs, abdomen, chest",
      "Tense hands, arms, shoulders, then release",
      "Tense face muscles, then release",
      "Notice the difference between tension and relaxation"
    ],
    duration: "5-10 minutes",
    benefits: "Deep physical relaxation, better sleep, reduces muscle tension"
  },
  
  gentleStretching: {
    name: "Gentle Full-Body Stretch",
    description: "Awakens the body and releases stiffness",
    steps: [
      "Reach arms overhead and lengthen your spine",
      "Slowly bend to the right, hold for 3 breaths",
      "Return to center, bend to the left",
      "Roll shoulders back and open chest",
      "Gently twist torso left and right",
      "End with a forward fold, letting head hang heavy"
    ],
    duration: "5 minutes",
    benefits: "Improves circulation, releases stiffness, increases energy"
  }
};

// Psychological Tips by Mood/State
const psychologicalTips = {
  lowEnergy: [
    "Honor your body's need for rest - low energy is a signal, not a failure",
    "Take a 10-minute walk outside; natural light can boost energy naturally",
    "Hydrate well - even mild dehydration affects energy and mood",
    "Avoid comparing yourself to others; everyone's energy varies",
    "Do one small, manageable task to build momentum"
  ],
  
  highStress: [
    "You are safe right now. Stress is your body trying to protect you",
    "Write down what you can control and let go of what you can't",
    "Take micro-breaks: 60 seconds of deep breathing every hour helps",
    "Physical movement helps metabolize stress hormones",
    "Remember: this feeling is temporary, even if it doesn't feel that way"
  ],
  
  poorSleep: [
    "Poor sleep affects everything - be gentle with yourself today",
    "Avoid caffeine after 2 PM to improve tonight's sleep",
    "Create a wind-down routine: dim lights 1 hour before bed",
    "Keep bedroom cool (65-68°F) for optimal sleep",
    "Try the 4-7-8 breathing technique in bed to fall asleep faster"
  ],
  
  lowSocial: [
    "Connection doesn't require big gatherings - a text to a friend counts",
    "Quality over quantity: one meaningful interaction beats many shallow ones",
    "Loneliness is a human experience, not a personal failing",
    "Consider joining an online community around your interests",
    "Even 5 minutes of genuine conversation can boost mood significantly"
  ],
  
  lowActivity: [
    "Movement is medicine, but it doesn't have to be intense",
    "Start small: a 5-minute walk is infinitely better than no walk",
    "Dance to your favorite song - joy + movement combined",
    "Stretch while watching TV or listening to music",
    "Physical activity improves mood within 20 minutes"
  ],
  
  sad: [
    "Sadness is not weakness - it's your heart processing something important",
    "Let yourself feel it without judgment; emotions need to be felt to heal",
    "Do something kind for yourself, as you would for a hurting friend",
    "Reach out to someone you trust, even if it feels hard",
    "This feeling will shift - emotions are like weather, always changing"
  ],
  
  anxious: [
    "Anxiety often lives in the future - come back to right now, this moment",
    "Your body is in fight-or-flight mode; breathing signals safety",
    "Name your worry specifically: 'I'm anxious about X' helps the brain process",
    "Ask: 'What would I tell a friend feeling this way?' Then take that advice",
    "Anxiety lies. You are stronger than your worried thoughts"
  ],
  
  joyful: [
    "Savor this feeling - notice what contributed to it",
    "Share your positive energy with someone who might need it",
    "Use this state to set intentions or make plans",
    "Gratitude amplifies joy - name three things you're grateful for",
    "Take a mental snapshot - recall this feeling when times get tough"
  ]
};

// Affirmations by Mood State
const affirmations = {
  sad: [
    "I allow myself to feel, and I trust I will heal",
    "This sadness is temporary, my strength is permanent",
    "I am worthy of love and comfort, especially from myself",
    "Every emotion I feel is valid and serves a purpose"
  ],
  
  stressed: [
    "I release what I cannot control and focus on what I can",
    "I am capable of handling whatever comes my way",
    "With each breath, I become more calm and centered",
    "I choose peace over worry in this moment"
  ],
  
  tired: [
    "Rest is productive and necessary for my well-being",
    "I honor my body's need for restoration",
    "Slowing down is not giving up, it's refueling",
    "I am allowed to take breaks without guilt"
  ],
  
  joyful: [
    "I deserve this happiness and allow myself to fully feel it",
    "Joy is my natural state, and I welcome more of it",
    "I radiate positive energy that uplifts myself and others",
    "Gratitude multiplies the good in my life"
  ],
  
  calm: [
    "I am at peace with where I am right now",
    "Calmness is my superpower and my birthright",
    "I trust the flow of life and my place in it",
    "Inner peace is always available to me"
  ],
  
  energized: [
    "I channel my energy toward positive action",
    "My vitality inspires and uplifts those around me",
    "I am powerful, focused, and capable",
    "I use my energy wisely and joyfully"
  ],
  
  neutral: [
    "I am exactly where I need to be",
    "Balance and equilibrium serve me well",
    "I honor this neutral state without judgment",
    "From this calm center, I can move in any direction"
  ]
};

// Color Therapy by Mood
const colorTherapy: Record<string, { color: string; meaning: string }> = {
  joyful: { color: "#FCD34D", meaning: "Yellow radiates joy, optimism, and mental clarity" },
  calm: { color: "#67E8F9", meaning: "Cyan promotes peace, tranquility, and emotional balance" },
  energized: { color: "#FB923C", meaning: "Orange stimulates creativity, enthusiasm, and vitality" },
  neutral: { color: "#94A3B8", meaning: "Gray provides stability, neutrality, and contemplation" },
  stressed: { color: "#86EFAC", meaning: "Green brings balance, renewal, and stress relief" },
  tired: { color: "#C084FC", meaning: "Purple supports rest, spirituality, and restoration" }
};

/**
 * Generate personalized recommendations based on mood check-in data
 */
export function generateMoodRecommendations(data: MoodCheckInData): MoodRecommendations {
  const recommendations: MoodRecommendations = {
    psychologicalTips: [],
    breathingTechniques: [],
    somaticExercises: [],
    affirmations: [],
    colorTherapy: colorTherapy[data.emotion] || colorTherapy.neutral
  };

  // Select breathing techniques based on state
  if (data.stressLevel >= 7 || data.emotion === 'stressed') {
    recommendations.breathingTechniques.push(breathingTechniques.boxBreathing);
    recommendations.breathingTechniques.push(breathingTechniques.fourSevenEight);
  } else if (data.energyLevel <= 3 || data.emotion === 'tired') {
    recommendations.breathingTechniques.push(breathingTechniques.deepBelly);
    recommendations.breathingTechniques.push(breathingTechniques.energizing);
  } else if (data.emotion === 'joyful' || data.energyLevel >= 8) {
    recommendations.breathingTechniques.push(breathingTechniques.alternateNostril);
  } else {
    recommendations.breathingTechniques.push(breathingTechniques.deepBelly);
  }

  // Select somatic exercises based on state
  if (data.stressLevel >= 7) {
    recommendations.somaticExercises.push(somaticExercises.grounding);
    recommendations.somaticExercises.push(somaticExercises.progressiveRelaxation);
    recommendations.somaticExercises.push(somaticExercises.shoulderRolls);
  } else if (data.energyLevel <= 3) {
    recommendations.somaticExercises.push(somaticExercises.bodyScanning);
    recommendations.somaticExercises.push(somaticExercises.gentleStretching);
  } else if (data.physicalActivity <= 3) {
    recommendations.somaticExercises.push(somaticExercises.gentleStretching);
    recommendations.somaticExercises.push(somaticExercises.shakeItOff);
  } else if (data.emotion === 'stressed') {
    recommendations.somaticExercises.push(somaticExercises.shakeItOff);
    recommendations.somaticExercises.push(somaticExercises.shoulderRolls);
  } else {
    recommendations.somaticExercises.push(somaticExercises.bodyScanning);
  }

  // Add psychological tips based on metrics
  if (data.energyLevel <= 3) {
    recommendations.psychologicalTips.push(...psychologicalTips.lowEnergy.slice(0, 3));
  }
  
  if (data.stressLevel >= 7) {
    recommendations.psychologicalTips.push(...psychologicalTips.highStress.slice(0, 3));
  }
  
  if (data.sleepQuality <= 4) {
    recommendations.psychologicalTips.push(...psychologicalTips.poorSleep.slice(0, 2));
  }
  
  if (data.socialConnection <= 3) {
    recommendations.psychologicalTips.push(...psychologicalTips.lowSocial.slice(0, 2));
  }
  
  if (data.physicalActivity <= 3) {
    recommendations.psychologicalTips.push(...psychologicalTips.lowActivity.slice(0, 2));
  }

  // Add emotion-specific tips
  if (data.emotion === 'stressed' && data.stressLevel < 7) {
    recommendations.psychologicalTips.push(...psychologicalTips.anxious.slice(0, 2));
  } else if (data.emotion === 'joyful') {
    recommendations.psychologicalTips.push(...psychologicalTips.joyful.slice(0, 2));
  }

  // Ensure we have at least some tips
  if (recommendations.psychologicalTips.length === 0) {
    recommendations.psychologicalTips.push(
      "You're doing well! Keep maintaining balance in your life",
      "Small daily practices create lasting well-being",
      "Be kind to yourself - you deserve compassion"
    );
  }

  // Add affirmations based on emotion
  const emotionKey = data.emotion as keyof typeof affirmations;
  recommendations.affirmations = affirmations[emotionKey] || affirmations.neutral;

  return recommendations;
}
