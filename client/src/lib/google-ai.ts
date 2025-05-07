import { apiRequest } from "./queryClient";

/**
 * Uses Google's Gemini API as a backup/alternative to OpenAI for aura analysis
 */
export async function geminiAuraAnalysis(imageBase64: string) {
  try {
    const response = await apiRequest("POST", "/api/gemini-analyze", {
      image: imageBase64
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error with Gemini analysis:", error);
    throw new Error("Failed to analyze with Gemini. Falling back to alternative.");
  }
}
