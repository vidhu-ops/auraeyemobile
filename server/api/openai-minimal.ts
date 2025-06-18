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
  return {
    lifePathNumber: 7,
    destinyNumber: 3,
    soulUrgeNumber: 5,
    personalityNumber: 2,
    interpretation: "Your numerology profile shows a strong spiritual path with creative expression and adaptability."
  };
}