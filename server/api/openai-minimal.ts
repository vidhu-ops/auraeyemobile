import OpenAI from "openai";

// Define the AuraAnalysisResult interface directly in server
export interface AuraAnalysisResult {
  id?: number;
  dominantColor: string;
  secondaryColor: string;
  auraColorSpectrum?: string[];
  auraLayerColors?: {
    inner?: string;
    middle?: string;
    outer?: string;
  };
  energyLevel: number;
  personalityTraits: string[];
  spiritualGuidance: string;
  chakraActivity: {
    root: number;
    sacral: number;
    solarPlexus: number;
    heart: number;
    throat: number;
    thirdEye: number;
    crown: number;
  };
  detailedAnalysis: string;
  processedAuraImage?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "YOUR_KEY_HERE" 
});

/**
 * Analyzes an uploaded image to detect aura colors and energy patterns
 */
export async function analyzeAuraImage(imageBase64: string): Promise<AuraAnalysisResult> {
  const defaultResult: AuraAnalysisResult = {
    dominantColor: "Indigo",
    secondaryColor: "Violet",
    energyLevel: 7,
    personalityTraits: ["Intuitive", "Creative", "Spiritual", "Wise"],
    spiritualGuidance: "Your aura shows strong spiritual energy with creative potential and deep intuitive wisdom.",
    chakraActivity: {
      root: 6,
      sacral: 7,
      solarPlexus: 6,
      heart: 8,
      throat: 7,
      thirdEye: 9,
      crown: 8
    },
    detailedAnalysis: "Your aura displays beautiful indigo and violet energies, indicating strong intuitive abilities and spiritual awareness. The indigo energy suggests deep wisdom and spiritual insight, while the violet energy represents transformation and higher consciousness."
  };

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_KEY_HERE") {
      return defaultResult;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for aura colors and spiritual energy patterns. Focus on detecting actual color patterns visible around the person. Return a JSON response with dominantColor, secondaryColor, energyLevel (1-10), personalityTraits (array), spiritualGuidance (string), chakraActivity (object with root, sacral, solarPlexus, heart, throat, thirdEye, crown values 1-10), and detailedAnalysis (string)."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return defaultResult;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return defaultResult;

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      dominantColor: parsed.dominantColor || defaultResult.dominantColor,
      secondaryColor: parsed.secondaryColor || defaultResult.secondaryColor,
      energyLevel: parsed.energyLevel || defaultResult.energyLevel,
      personalityTraits: parsed.personalityTraits || defaultResult.personalityTraits,
      spiritualGuidance: parsed.spiritualGuidance || defaultResult.spiritualGuidance,
      chakraActivity: parsed.chakraActivity || defaultResult.chakraActivity,
      detailedAnalysis: parsed.detailedAnalysis || defaultResult.detailedAnalysis
    };

  } catch (error) {
    console.error("Error analyzing aura image:", error);
    return defaultResult;
  }
}

/**
 * Generates numerology reading based on name and birth date
 */
export async function generateNumerologyReading(name: string, birthDate: string): Promise<any> {
  // Helper function to reduce numbers to single digit
  const reduceNumber = (num: number): number => {
    while (num > 9 && ![11, 22, 33].includes(num)) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  // Helper function to convert letter to number
  const letterToNumber = (char: string): number => {
    const charUpperCase = char.toUpperCase();
    if (charUpperCase === 'A' || charUpperCase === 'J' || charUpperCase === 'S') return 1;
    if (charUpperCase === 'B' || charUpperCase === 'K' || charUpperCase === 'T') return 2;
    if (charUpperCase === 'C' || charUpperCase === 'L' || charUpperCase === 'U') return 3;
    if (charUpperCase === 'D' || charUpperCase === 'M' || charUpperCase === 'V') return 4;
    if (charUpperCase === 'E' || charUpperCase === 'N' || charUpperCase === 'W') return 5;
    if (charUpperCase === 'F' || charUpperCase === 'O' || charUpperCase === 'X') return 6;
    if (charUpperCase === 'G' || charUpperCase === 'P' || charUpperCase === 'Y') return 7;
    if (charUpperCase === 'H' || charUpperCase === 'Q' || charUpperCase === 'Z') return 8;
    if (charUpperCase === 'I' || charUpperCase === 'R') return 9;
    return 0;
  };

  // Calculate Life Path Number
  const calculateLifePath = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5;
    
    let sum = 0;
    for (const digit of parts.join('')) {
      sum += parseInt(digit);
    }
    return reduceNumber(sum);
  };

  // Calculate Destiny Number
  const calculateDestiny = (fullName: string): number => {
    let sum = 0;
    for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
      sum += letterToNumber(char);
    }
    return reduceNumber(sum);
  };

  // Calculate Soul Urge Number
  const calculateSoulUrge = (fullName: string): number => {
    let sum = 0;
    for (const char of fullName.toLowerCase()) {
      if ('aeiou'.includes(char)) {
        sum += letterToNumber(char);
      }
    }
    return reduceNumber(sum);
  };

  // Calculate Personality Number from day digits
  const calculatePersonality = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5;
    
    const day = parts[2];
    let sum = 0;
    for (const digit of day) {
      sum += parseInt(digit);
    }
    return reduceNumber(sum);
  };

  // Calculate Personal Year with 2026
  const calculatePersonalYear = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5;
    
    const month = parts[1];
    const day = parts[2];
    const currentYear = "2026";
    
    let sum = 0;
    for (const digit of month) {
      sum += parseInt(digit);
    }
    for (const digit of day) {
      sum += parseInt(digit);
    }
    for (const digit of currentYear) {
      sum += parseInt(digit);
    }
    
    return reduceNumber(sum);
  };

  // Calculate all numbers
  const lifePathNumber = calculateLifePath(birthDate);
  const destinyNumber = calculateDestiny(name);
  const soulUrgeNumber = calculateSoulUrge(name);
  const personalityNumber = calculatePersonality(birthDate);
  const personalYearNumber = calculatePersonalYear(birthDate);

  return {
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    personalYearNumber,
    interpretation: `Your numerology profile shows a strong spiritual path. Life Path ${lifePathNumber} reveals your core nature, Destiny ${destinyNumber} shows your life purpose, Soul Urge ${soulUrgeNumber} represents your inner desires, Personality ${personalityNumber} is how you present yourself, and Personal Year ${personalYearNumber} guides your current cycle for 2026.`
  };
}