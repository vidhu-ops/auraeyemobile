import { apiRequest, queryClient } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";

export interface AuraAnalysisResult {
  zones: any;
  id?: number; // Added for review system functionality
  name?: string; // Added for PDF generation
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
    soulStar: number;
    root: number;
    sacral: number;
    solarPlexus: number;
    heart: number;
    throat: number;
    thirdEye: number;
    crown: number;
  };
  detailedAnalysis: string;
  processedAuraImage?: string; // AI-generated aura visualization
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
    
    // Invalidate credits cache to update the display
    queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
    
    // Optional: Could add client-side color enhancement/visualization here
    // based on the detected dominant and secondary colors

    return result;
  } catch (error) {
    console.error("Error analyzing aura:", error);
    
    // Standard error handling
    
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
  personalYearNumber: number;
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
