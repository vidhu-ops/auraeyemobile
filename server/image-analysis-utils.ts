import crypto from 'crypto';

// Deterministic color mapping based on image characteristics
export function generateDeterministicAuraColor(imageData: string): string {
  // Create a hash from the image data to ensure consistency
  const hash = crypto.createHash('md5').update(imageData.substring(0, 1000)).digest('hex');
  
  // Use the hash to deterministically select colors
  const colorIndex = parseInt(hash.substring(0, 2), 16) % 13;
  const colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 
    'Pink', 'Violet', 'Indigo', 'Gold', 'Silver', 'Turquoise', 'Magenta'
  ];
  
  return colors[colorIndex];
}

export function generateDeterministicSecondaryColor(imageData: string): string {
  const hash = crypto.createHash('md5').update(imageData.substring(500, 1500)).digest('hex');
  const colorIndex = parseInt(hash.substring(2, 4), 16) % 13;
  const colors = [
    'Orange', 'Green', 'Purple', 'Blue', 'Yellow', 'Red',
    'Violet', 'Pink', 'Gold', 'Turquoise', 'Silver', 'Indigo', 'Magenta'
  ];
  
  return colors[colorIndex];
}

export function generateDeterministicEnergyLevel(imageData: string): number {
  const hash = crypto.createHash('md5').update(imageData.substring(200, 800)).digest('hex');
  const energyValue = parseInt(hash.substring(4, 6), 16) % 10 + 1; // 1-10
  return energyValue;
}

export function generateDeterministicPersonalityTraits(imageData: string): string[] {
  const hash = crypto.createHash('md5').update(imageData.substring(100, 600)).digest('hex');
  
  const allTraits = [
    'Intuitive', 'Creative', 'Peaceful', 'Energetic', 'Protective',
    'Wise', 'Compassionate', 'Strong', 'Balanced', 'Spiritual',
    'Healing', 'Grounding', 'Uplifting', 'Calming', 'Inspiring'
  ];
  
  const trait1Index = parseInt(hash.substring(6, 8), 16) % allTraits.length;
  const trait2Index = parseInt(hash.substring(8, 10), 16) % allTraits.length;
  const trait3Index = parseInt(hash.substring(10, 12), 16) % allTraits.length;
  
  // Ensure we don't have duplicate traits
  const selectedTraits = new Set([
    allTraits[trait1Index],
    allTraits[trait2Index],
    allTraits[trait3Index]
  ]);
  
  return Array.from(selectedTraits).slice(0, 3);
}

export function generateDeterministicSpiritualGuidance(dominantColor: string, traits: string[]): string {
  const colorGuidance: { [key: string]: string } = {
    'Red': 'Focus on grounding your passionate energy and channeling it constructively.',
    'Blue': 'Trust your intuition and embrace peaceful communication in your relationships.',
    'Green': 'Nurture your connection with nature and focus on healing and growth.',
    'Yellow': 'Embrace your intellectual gifts and share your wisdom with others.',
    'Purple': 'Develop your spiritual awareness and trust your psychic abilities.',
    'Orange': 'Balance your creative expression with practical action.',
    'Pink': 'Open your heart to love and practice compassion in all interactions.',
    'Violet': 'Explore your mystical nature and deepen your spiritual practice.',
    'Indigo': 'Trust your inner vision and develop your psychic sensitivity.',
    'Gold': 'Embrace your natural leadership abilities and inspire others.',
    'Silver': 'Reflect on your inner wisdom and trust your intuitive insights.',
    'Turquoise': 'Communicate your truth with clarity and emotional balance.',
    'Magenta': 'Combine spiritual wisdom with practical action in your daily life.'
  };
  
  return colorGuidance[dominantColor] || 'Focus on balancing your spiritual and physical energies.';
}

export function generateConsistentAnalysis(imageData: string) {
  const dominantColor = generateDeterministicAuraColor(imageData);
  const secondaryColor = generateDeterministicSecondaryColor(imageData);
  const energyLevel = generateDeterministicEnergyLevel(imageData);
  const personalityTraits = generateDeterministicPersonalityTraits(imageData);
  const spiritualGuidance = generateDeterministicSpiritualGuidance(dominantColor, personalityTraits);
  
  // Generate detailed analysis based on the colors and traits
  const detailedAnalysis = `Your aura radiates with a beautiful ${dominantColor.toLowerCase()} energy, complemented by subtle ${secondaryColor.toLowerCase()} undertones. This combination suggests a person who is ${personalityTraits.join(', ').toLowerCase()}. Your energy level of ${energyLevel}/10 indicates ${energyLevel > 7 ? 'high vitality and strong spiritual presence' : energyLevel > 4 ? 'balanced energy with room for growth' : 'gentle energy that benefits from grounding practices'}. The ${dominantColor.toLowerCase()} in your aura represents ${getColorMeaning(dominantColor)}. This spiritual signature suggests you are naturally ${personalityTraits[0].toLowerCase()} and would benefit from practices that enhance your ${personalityTraits[1].toLowerCase()} nature.`;
  
  return {
    dominantColor,
    secondaryColor,
    energyLevel,
    personalityTraits,
    spiritualGuidance,
    detailedAnalysis,
    emotionalState: generateEmotionalState(dominantColor),
    chakraAlignment: generateChakraAlignment(dominantColor)
  };
}

function getColorMeaning(color: string): string {
  const meanings: { [key: string]: string } = {
    'Red': 'passion, strength, and life force energy',
    'Blue': 'calm wisdom, clear communication, and spiritual depth',
    'Green': 'healing energy, natural harmony, and heart-centered love',
    'Yellow': 'intellectual brilliance, optimism, and creative expression',
    'Purple': 'spiritual awareness, psychic ability, and higher consciousness',
    'Orange': 'creative vitality, enthusiasm, and emotional balance',
    'Pink': 'unconditional love, compassion, and nurturing energy',
    'Violet': 'mystical wisdom, spiritual transformation, and divine connection',
    'Indigo': 'psychic sensitivity, inner vision, and deep intuition',
    'Gold': 'divine wisdom, spiritual enlightenment, and leadership',
    'Silver': 'intuitive insights, emotional clarity, and feminine wisdom',
    'Turquoise': 'clear communication, emotional healing, and spiritual growth',
    'Magenta': 'spiritual practicality, unconventional wisdom, and creative transformation'
  };
  
  return meanings[color] || 'unique spiritual energy and personal power';
}

function generateEmotionalState(dominantColor: string): string {
  const states: { [key: string]: string } = {
    'Red': 'Passionate and energized',
    'Blue': 'Calm and centered',
    'Green': 'Peaceful and nurturing',
    'Yellow': 'Optimistic and joyful',
    'Purple': 'Spiritually awakened',
    'Orange': 'Creative and enthusiastic',
    'Pink': 'Loving and compassionate',
    'Violet': 'Mystically connected',
    'Indigo': 'Deeply intuitive',
    'Gold': 'Confidently radiant',
    'Silver': 'Reflectively wise',
    'Turquoise': 'Emotionally balanced',
    'Magenta': 'Spiritually practical'
  };
  
  return states[dominantColor] || 'Balanced and harmonious';
}

function generateChakraAlignment(dominantColor: string): string {
  const chakras: { [key: string]: string } = {
    'Red': 'Root Chakra (Grounding)',
    'Orange': 'Sacral Chakra (Creativity)',
    'Yellow': 'Solar Plexus Chakra (Power)',
    'Green': 'Heart Chakra (Love)',
    'Blue': 'Throat Chakra (Communication)',
    'Indigo': 'Third Eye Chakra (Intuition)',
    'Purple': 'Crown Chakra (Spirituality)',
    'Violet': 'Crown Chakra (Divine Connection)',
    'Pink': 'Heart Chakra (Compassion)',
    'Gold': 'Crown Chakra (Enlightenment)',
    'Silver': 'Third Eye Chakra (Wisdom)',
    'Turquoise': 'Throat Chakra (Truth)',
    'Magenta': 'Crown Chakra (Transformation)'
  };
  
  return chakras[dominantColor] || 'Heart Chakra (Balance)';
}