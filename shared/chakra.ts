export type ChakraKey = 'soulStar' | 'crown' | 'thirdEye' | 'throat' | 'heart' | 'solarPlexus' | 'sacral' | 'root' | 'earthStar';

export interface ChakraStatus {
  status: string;
  color: string;
  bgColor: string;
}

export type ChakraActivity = Record<ChakraKey, number>;

export const CHAKRA_KEYS: ChakraKey[] = ['soulStar', 'crown', 'thirdEye', 'throat', 'heart', 'solarPlexus', 'sacral', 'root', 'earthStar'];

export const CHAKRA_DISPLAY_NAMES: Record<ChakraKey, string> = {
  'soulStar': 'Soul Star Chakra',
  'crown': 'Crown Chakra',
  'thirdEye': 'Third Eye Chakra',
  'throat': 'Throat Chakra',
  'heart': 'Heart Chakra',
  'solarPlexus': 'Solar Plexus Chakra',
  'sacral': 'Sacral Chakra',
  'root': 'Root Chakra',
  'earthStar': 'Earth Star Chakra'
};

export const HIGHER_CHAKRAS: ChakraKey[] = ['soulStar', 'crown', 'thirdEye'];
export const MIDDLE_CHAKRAS: ChakraKey[] = ['throat', 'heart', 'solarPlexus'];
export const LOWER_CHAKRAS: ChakraKey[] = ['sacral', 'root', 'earthStar'];

/**
 * Get chakra status based on score using requested ranges:
 * 1-3: "blocked"
 * 4-6: "imbalanced patterns" 
 * 7-8: "developing balance"
 * 9-10: "mastered or balanced"
 */
export function getChakraStatus(score: number): ChakraStatus {
  if (score >= 1 && score <= 3) {
    return { 
      status: "blocked", 
      color: "text-red-600", 
      bgColor: "from-red-50 to-red-100" 
    };
  }
  if (score >= 4 && score <= 6) {
    return { 
      status: "imbalanced patterns", 
      color: "text-orange-600", 
      bgColor: "from-orange-50 to-orange-100" 
    };
  }
  if (score >= 7 && score <= 8) {
    return { 
      status: "developing balance", 
      color: "text-green-600", 
      bgColor: "from-green-50 to-green-100" 
    };
  }
  if (score === 10) {
    return { 
      status: "overdrive", 
      color: "text-purple-600", 
      bgColor: "from-purple-50 to-purple-100" 
    };
  }
  if (score === 9) {
    return { 
      status: "balanced", 
      color: "text-blue-600", 
      bgColor: "from-blue-50 to-blue-100" 
    };
  }
  return { 
    status: "unknown", 
    color: "text-gray-600", 
    bgColor: "from-gray-50 to-gray-100" 
  };
}

/**
 * Calculate chakra group percentages with error handling
 */
export function calculateChakraGroupPercentages(chakraActivity: Partial<ChakraActivity>): {
  higherPercent: string;
  middlePercent: string; 
  lowerPercent: string;
} {
  const higherAvg = HIGHER_CHAKRAS.reduce((sum, chakra) => sum + (chakraActivity[chakra] || 5), 0) / HIGHER_CHAKRAS.length;
  const middleAvg = MIDDLE_CHAKRAS.reduce((sum, chakra) => sum + (chakraActivity[chakra] || 5), 0) / MIDDLE_CHAKRAS.length;
  const lowerAvg = LOWER_CHAKRAS.reduce((sum, chakra) => sum + (chakraActivity[chakra] || 5), 0) / LOWER_CHAKRAS.length;
  
  const total = higherAvg + middleAvg + lowerAvg;
  
  // Handle division by zero edge case
  if (total === 0) {
    return {
      higherPercent: "33.3",
      middlePercent: "33.3", 
      lowerPercent: "33.4"
    };
  }
  
  // Calculate raw percentages
  const higherRaw = (higherAvg / total) * 100;
  const middleRaw = (middleAvg / total) * 100;
  const lowerRaw = (lowerAvg / total) * 100;
  
  // Round each to 1 decimal place
  let higherRounded = Math.round(higherRaw * 10) / 10;
  let middleRounded = Math.round(middleRaw * 10) / 10;
  let lowerRounded = Math.round(lowerRaw * 10) / 10;
  
  // Calculate the sum and adjust to ensure exactly 100%
  const currentSum = higherRounded + middleRounded + lowerRounded;
  const difference = 100.0 - currentSum;
  
  // If there's a difference, adjust the largest value by the difference
  if (Math.abs(difference) >= 0.1) {
    const values = [
      { value: higherRounded, index: 0 },
      { value: middleRounded, index: 1 },
      { value: lowerRounded, index: 2 }
    ];
    
    // Sort by value to find the largest
    values.sort((a, b) => b.value - a.value);
    
    // Adjust the largest value
    if (values[0].index === 0) {
      higherRounded += difference;
    } else if (values[0].index === 1) {
      middleRounded += difference;
    } else {
      lowerRounded += difference;
    }
  }
  
  return {
    higherPercent: higherRounded.toFixed(1),
    middlePercent: middleRounded.toFixed(1),
    lowerPercent: lowerRounded.toFixed(1)
  };
}