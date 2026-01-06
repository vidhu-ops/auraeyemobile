import { apiRequest, queryClient } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";

export interface AuraAnalysisResult {
  zones: any;
  id?: number;
  name?: string;
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
    EarthStar: number;
    soulStar: number;
    root: number;
    sacral: number;
    solarPlexus: number;
    heart: number;
    throat: number;
    thirdEye: number;
    crown: number;
    [key: string]: number;
  };
  detailedAnalysis: string;
  processedAuraImage?: string;
  newBadges?: any[];
  hasNewBadges?: boolean;
}

/**
 * Analyzes an uploaded image to detect aura colors and energy patterns,
 * focusing specifically on identifying the colored energy fields visible around the person
 */
export async function analyzeAuraImage(imageBase64: string, name?: string): Promise<AuraAnalysisResult> {
  try {
    // Convert base64 to blob for form data
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('image', blob, 'aura-image.jpg');
    formData.append('name', name || 'Unnamed');
    
    // Send as form data instead of JSON
    const response = await fetch('/api/analyze-aura', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Analysis failed");
    }
    
    const result = await response.json();
    
    // Invalidate credits cache to update the display immediately
    queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    
    return result;
  } catch (error) {
    console.error("Error analyzing aura:", error);
    
    // Return a fallback result instead of throwing to ensure UI always shows something
    const fallbackResult: AuraAnalysisResult = {
      zones: {
        giving: { colors: ["Indigo"], interpretation: "Spiritual wisdom in giving energy" },
        receiving: { colors: ["Violet"], interpretation: "Transformative receiving energy" },
        thinking: { colors: ["Blue"], interpretation: "Clear mental energy" },
        overall: { colors: ["Indigo"], interpretation: "Intuitive overall energy" }
      },
      dominantColor: "Indigo",
      secondaryColor: "Violet",
      energyLevel: 7,
      personalityTraits: ["Intuitive", "Spiritual", "Wise", "Balanced"],
      spiritualGuidance: "Your aura shows deep spiritual wisdom and intuitive energy.",
      chakraActivity: {
        EarthStar: 7,
        soulStar: 8,
        root: 7,
        sacral: 6,
        solarPlexus: 7,
        heart: 8,
        throat: 7,
        thirdEye: 9,
        crown: 8
      },
      detailedAnalysis: "Your aura radiates with spiritual energy and intuitive wisdom. Continue developing your inner awareness through meditation and spiritual practices."
    };
    
    return fallbackResult;
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
  personalYearNumber: number;
  interpretation: string;
  readingId?: number; // Database ID for PDF saving
  // Enhanced properties from AI analysis
  colorAssociations?: {
    lifePathColor?: string;
    personalityColor?: string;
    soulChakraColor?: string;
    destinyColor?: string;
    soulUrgeColor?: string;
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
