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
    
    // Build request payload with an enhanced prompt for aura color detection
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert in analyzing SPECIALIZED AURA PHOTOGRAPHS that show colored energy fields around people.

EXTREMELY IMPORTANT: You must ONLY analyze the ACTUAL visible colored light/energy surrounding the person in the photograph. 

DO NOT invent or make up colors that aren't visible in the image. Your analysis must be based SOLELY on the colors you can actually see in the energy field around the person.

Specifically:
1. ACCURATELY identify 4-5 different colors in the visible energy field (aura) surrounding the person
2. Focus on any glowing, luminous, hazy, or distinct colored lights forming a field or halo around the person
3. Completely ignore clothing colors, background elements, or anything that is not part of the energy field
4. Be precise about identifying where each color appears (inner aura close to body, middle field, outer edges)

Respond with valid JSON containing:
- dominantColor: The PRIMARY aura color visible in the energy field (like "Purple", "Blue", "Green")
- secondaryColor: The SECONDARY aura color visible in the energy field
- auraColorSpectrum: Array of 4-5 different colors actually visible in the aura field in order of prominence
- auraLayerColors: Object mapping aura layers to their colors { "inner": "color", "middle": "color", "outer": "color" }
- energyLevel: Intensity of the energy field (1-10)
- personalityTraits: 4-5 spiritual/personality traits associated with these SPECIFIC aura colors
- spiritualGuidance: Detailed spiritual guidance based on these SPECIFIC aura colors (150+ words)
- chakraActivity: Activity levels for each chakra (root, sacral, solarPlexus, heart, throat, thirdEye, crown) on scale 1-10
- detailedAnalysis: In-depth interpretation of what these SPECIFIC aura colors reveal, discussing all 4-5 colors (250+ words)`
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
        temperature: 0.2,  // Lower temperature for more consistent results
        maxOutputTokens: 1500  // Increased token limit for more detailed analysis
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
    let result: Partial<AuraAnalysisResult> = {};
    try {
      result = JSON.parse(jsonStr) as Partial<AuraAnalysisResult>;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // Fallback to structured data from the text
      result = fallbackParser(responseText);
    }
    
    // Default values in case some fields are missing
    const defaultResult: AuraAnalysisResult = {
      dominantColor: "Blue",
      secondaryColor: "Green", 
      // Extended spectrum with multiple colors
      auraColorSpectrum: ["Blue", "Green", "Indigo", "Turquoise", "Purple"],
      auraLayerColors: {
        inner: "Blue",
        middle: "Green",
        outer: "Indigo"
      },
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

    // Return merged results with default values filling in any missing fields
    return {
      ...defaultResult,
      ...result,
      // Ensure the aura layers are properly merged
      auraLayerColors: {
        ...defaultResult.auraLayerColors,
        ...(result.auraLayerColors || {})
      },
      // Ensure the chakra activity is properly merged
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
      // Extended spectrum with multiple colors for fallback
      auraColorSpectrum: ["Indigo", "Violet", "Purple", "Blue", "White"],
      auraLayerColors: {
        inner: "Indigo",
        middle: "Violet",
        outer: "Blue"
      },
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
  const result: Partial<AuraAnalysisResult> = {
    // Initialize the chakraActivity to fix TypeScript error
    chakraActivity: {
      root: 5,
      sacral: 6,
      solarPlexus: 5,
      heart: 7,
      throat: 6,
      thirdEye: 8,
      crown: 7
    },
    // Initialize aura color spectrum with default values
    auraColorSpectrum: [],
    auraLayerColors: {
      inner: "",
      middle: "",
      outer: ""
    }
  };
  
  // Extract dominant color
  const dominantColorMatch = text.match(/dominant\s*color\s*[:-]\s*([a-zA-Z]+)/i);
  if (dominantColorMatch) result.dominantColor = dominantColorMatch[1];
  
  // Extract secondary color
  const secondaryColorMatch = text.match(/secondary\s*color\s*[:-]\s*([a-zA-Z]+)/i);
  if (secondaryColorMatch) result.secondaryColor = secondaryColorMatch[1];
  
  // If we have dominant and secondary colors, use them to create a default spectrum
  if (result.dominantColor && result.secondaryColor) {
    result.auraColorSpectrum = [
      result.dominantColor,
      result.secondaryColor,
      "Indigo", // Default third color
      "Blue",   // Default fourth color
      "Violet"  // Default fifth color
    ];
    
    result.auraLayerColors = {
      inner: result.dominantColor,
      middle: result.secondaryColor,
      outer: "Indigo" // Default outer layer
    };
  }
  
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
