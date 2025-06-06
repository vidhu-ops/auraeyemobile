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
export async function analyzeAuraImage(base64Image: string): Promise<AuraAnalysisResult> {
  try {
    const response = await fetch("/api/analyze-aura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    // Ensure energy level is within valid range
    if (result.energyLevel) {
      result.energyLevel = Math.max(1, Math.min(10, result.energyLevel));
    }

    return result;
  } catch (error) {
    console.error("Error analyzing aura:", error);
    throw error;
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
  const response = await fetch('/api/numerology', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, birthDate }),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate numerology');
  }

  return response.json();
}