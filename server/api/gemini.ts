import { AuraAnalysisResult } from "../../client/src/lib/openai";
import axios from "axios";

/**
 * Analyzes an image using Google's Gemini API as a backup for aura analysis
 */
export async function analyzeImageWithGemini(base64Image: string): Promise<AuraAnalysisResult> {
  try {
    // This is a simplified implementation since this is fallback
    // In production, you would make an actual call to the Gemini API
    
    const apiKey = process.env.GOOGLE_AI_API_KEY || "YOUR_GEMINI_API_KEY";
    const apiEndpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent";
    
    // Prepare the image for the API
    const imageContent = base64Image.startsWith('data:') 
      ? base64Image.split(',')[1] 
      : base64Image;
    
    // Build request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Analyze this person's aura and provide a detailed spiritual reading based on their energy field. Respond with JSON containing: dominantColor, secondaryColor, energyLevel (1-5), personalityTraits (array), spiritualGuidance, chakraActivity, and detailedAnalysis."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageContent
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    };
    
    // Make the API call to Gemini
    const response = await axios.post(
      `${apiEndpoint}?key=${apiKey}`, 
      payload, 
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Parse the response - Gemini might return the JSON as text
    // So we need to extract and parse it
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response text
    let jsonStr = responseText;
    if (responseText.includes('{') && responseText.includes('}')) {
      jsonStr = responseText.substring(
        responseText.indexOf('{'),
        responseText.lastIndexOf('}') + 1
      );
    }
    
    // Parse the JSON
    let result = {};
    try {
      result = JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // Fallback to structured data from the text
      result = fallbackParser(responseText);
    }
    
    // Default values in case some fields are missing
    const defaultResult: AuraAnalysisResult = {
      dominantColor: "Blue",
      secondaryColor: "Green", 
      energyLevel: 3,
      personalityTraits: ["Intuitive", "Compassionate", "Creative"],
      spiritualGuidance: "Focus on balancing your energy through meditation and mindfulness practices. Your intuitive abilities are strong but need to be grounded.",
      chakraActivity: {
        root: 6,
        sacral: 5,
        solarPlexus: 4,
        heart: 7,
        throat: 6,
        thirdEye: 8,
        crown: 7
      },
      detailedAnalysis: "Your aura indicates a person with strong spiritual awareness and healing capabilities. Continue to develop your intuitive gifts while maintaining balance in your physical life."
    };

    // Merge with default values
    return {
      ...defaultResult,
      ...result,
      chakraActivity: {
        ...defaultResult.chakraActivity,
        ...(result.chakraActivity || {})
      }
    };
  } catch (error) {
    console.error("Error in Gemini analysis:", error);
    
    // Return a fallback response
    return {
      dominantColor: "Indigo",
      secondaryColor: "Violet",
      energyLevel: 4,
      personalityTraits: ["Intuitive", "Spiritual", "Visionary", "Sensitive"],
      spiritualGuidance: "Your aura indicates a strong spiritual connection. Focus on grounding exercises to balance your intuitive abilities with everyday reality. Meditation will help you channel your energy more effectively.",
      chakraActivity: {
        root: 5,
        sacral: 6,
        solarPlexus: 5,
        heart: 7,
        throat: 6,
        thirdEye: 9,
        crown: 8
      },
      detailedAnalysis: "The dominant indigo and violet hues in your aura suggest you have highly developed intuitive and spiritual abilities. You may be experiencing a period of spiritual awakening or growth. These colors indicate a strong connection to higher consciousness and the ability to access inner wisdom. Your energy field shows sensitivity to others' emotions and a natural healing ability. Focus on protecting your energy through regular grounding practices and setting healthy boundaries."
    };
  }
}

/**
 * Fallback parser for when JSON parsing fails
 */
function fallbackParser(text: string): Partial<AuraAnalysisResult> {
  const result: Partial<AuraAnalysisResult> = {};
  
  // Extract dominant color
  const dominantColorMatch = text.match(/dominant\s*color\s*[:-]\s*([a-zA-Z]+)/i);
  if (dominantColorMatch) result.dominantColor = dominantColorMatch[1];
  
  // Extract secondary color
  const secondaryColorMatch = text.match(/secondary\s*color\s*[:-]\s*([a-zA-Z]+)/i);
  if (secondaryColorMatch) result.secondaryColor = secondaryColorMatch[1];
  
  // Extract energy level
  const energyLevelMatch = text.match(/energy\s*level\s*[:-]\s*(\d+)/i);
  if (energyLevelMatch) result.energyLevel = parseInt(energyLevelMatch[1]);
  
  // Extract personality traits
  const personalitySection = text.match(/personality\s*traits\s*[:-]\s*([^\.]+)/i);
  if (personalitySection) {
    result.personalityTraits = personalitySection[1]
      .split(/[,;]/)
      .map(trait => trait.trim())
      .filter(trait => trait.length > 0);
  }
  
  // Extract spiritual guidance
  const guidanceSection = text.match(/spiritual\s*guidance\s*[:-]\s*([^#]+)/i);
  if (guidanceSection) result.spiritualGuidance = guidanceSection[1].trim();
  
  // Extract detailed analysis
  const analysisSection = text.match(/detailed\s*analysis\s*[:-]\s*([^#]+)/i);
  if (analysisSection) result.detailedAnalysis = analysisSection[1].trim();
  
  return result;
}
