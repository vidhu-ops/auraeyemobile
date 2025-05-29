import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";

export interface AuraAnalysisResult {
  dominantColor: string;
  secondaryColor: string;
  // Extended color spectrum for more detailed aura analysis
  auraColorSpectrum?: string[]; // Array of 4-5 colors in order of prominence
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
}

/**
 * Analyzes an uploaded image to detect aura colors and energy patterns,
 * focusing specifically on identifying the colored energy fields visible around the person
 */
export async function analyzeAuraImage(imageBase64: string): Promise<AuraAnalysisResult> {
  try {
    // First, analyze the image for visible aura colors
    const response = await apiRequest("POST", "/api/analyze-aura", {
      image: imageBase64,
      detectVisibleAura: true // Flag to indicate we want to focus on detecting actual visible aura colors
    });
    
    const result = await response.json();
    
    // Optional: Could add client-side color enhancement/visualization here
    // based on the detected dominant and secondary colors

    return result;
  } catch (error) {
    console.error("Error analyzing aura:", error);
    throw new Error("Failed to analyze aura. Please try again.");
  }
}

export interface HoroscopeResult {
  sign: string;
  date: string;
  reading: string;
  love: number;
  career: number;
  health: number;
  spirituality: number;
}

/**
 * Gets daily horoscope for a specific zodiac sign
 */
export async function getDailyHoroscope(sign: string): Promise<HoroscopeResult> {
  try {
    const response = await apiRequest("GET", `/api/horoscope/${sign}`);
    return await response.json();
  } catch (error) {
    console.error("Error getting horoscope:", error);
    throw new Error("Failed to get horoscope. Please try again.");
  }
}

export interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  soulChakraNumber: number;
  interpretation: string;
  // Enhanced properties from AI analysis
  colorAssociations?: {
    lifePathColor?: string;
    destinyColor?: string;
    soulUrgeColor?: string;
    personalityColor?: string;
    soulChakraColor?: string;
  };
  energyPattern?: string;
  strengths?: string[];
  challenges?: string[];
  guidance?: string;
}

/**
 * Calculates numerology values based on name and birth date
 */
export async function calculateNumerology(name: string, birthDate: string): Promise<NumerologyResult> {
  try {
    console.log("Calculating numerology for:", name, birthDate);
    const response = await apiRequest("POST", "/api/numerology", {
      name,
      birthDate
    });
    
    const data = await response.json();
    console.log("Numerology result:", data);
    return data;
  } catch (error) {
    console.error("Error calculating numerology:", error);
    throw new Error("Failed to calculate numerology. Please try again.");
  }
}
