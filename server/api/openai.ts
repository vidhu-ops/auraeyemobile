import OpenAI from "openai";
import { AuraAnalysisResult } from "../../client/src/lib/openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "YOUR_KEY_HERE" 
});

/**
 * Analyzes an image to determine aura colors and energy patterns
 */
export async function analyzeAuraImage(base64Image: string): Promise<AuraAnalysisResult> {
  try {
    // Prepare the image for API call
    const imageContent = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    // Call OpenAI API with the image
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert spiritual healer and aura reader with decades of experience. 
          Analyze the person in the image and determine their aura colors, energy levels, and provide a spiritual interpretation.
          Respond with valid JSON data containing the following fields:
          - dominantColor: the primary aura color (e.g., "Purple", "Blue", "Green", etc.)
          - secondaryColor: a secondary aura color if present, otherwise null
          - energyLevel: a number from 1 to 5 indicating energy intensity
          - personalityTraits: an array of 3-5 personality traits associated with their aura
          - spiritualGuidance: personalized spiritual guidance based on their aura (150-200 words)
          - chakraActivity: an object with numeric values (1-10) for each of the 7 chakras (root, sacral, solarPlexus, heart, throat, thirdEye, crown)
          - detailedAnalysis: a comprehensive analysis of their aura and energy patterns (200-300 words)`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this person's aura and provide a detailed spiritual reading based on their energy field."
            },
            {
              type: "image_url",
              image_url: {
                url: imageContent
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure all required fields are present
    const defaultResult: AuraAnalysisResult = {
      dominantColor: "Blue",
      secondaryColor: "Purple",
      energyLevel: 3,
      personalityTraits: ["Intuitive", "Spiritual", "Sensitive"],
      spiritualGuidance: "Your aura suggests you are on a spiritual journey. Continue to nurture your intuitive abilities and stay connected to your higher self.",
      chakraActivity: {
        root: 5,
        sacral: 6,
        solarPlexus: 5,
        heart: 7,
        throat: 6,
        thirdEye: 8,
        crown: 7
      },
      detailedAnalysis: "Your aura shows a blend of spiritual awareness and intuitive abilities. Focus on grounding practices to balance your energy."
    };

    // Merge with default values to ensure all fields are present
    return {
      ...defaultResult,
      ...result,
      chakraActivity: {
        ...defaultResult.chakraActivity,
        ...(result.chakraActivity || {})
      }
    };
  } catch (error) {
    console.error("Error in OpenAI aura analysis:", error);
    throw new Error("Failed to analyze aura image with OpenAI");
  }
}

/**
 * Generates daily horoscope for a specific zodiac sign
 */
export async function generateHoroscope(sign: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert astrologer with deep knowledge of zodiac signs and planetary influences. 
          Create a personalized daily horoscope for ${sign}. 
          Respond with valid JSON containing:
          - sign: the zodiac sign
          - date: today's date
          - reading: a detailed horoscope reading (200-250 words)
          - love: a rating from 1-5
          - career: a rating from 1-5
          - health: a rating from 1-5
          - spirituality: a rating from 1-5`
        },
        {
          role: "user",
          content: `Generate today's horoscope for ${sign}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating horoscope:", error);
    throw new Error("Failed to generate horoscope");
  }
}

/**
 * Generates a numerology analysis based on name and birth date
 */
export async function generateNumerologyReading(name: string, birthDate: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert numerologist with decades of experience analyzing numbers and their spiritual significance.
          Generate a comprehensive numerology reading based on the provided name and birth date.
          Use authentic numerological calculations to derive all numbers.
          Respond with valid JSON containing:
          - lifePathNumber: calculated from birth date (single digit, except for master numbers 11, 22, 33)
          - destinyNumber: calculated from full name (single digit, except for master numbers)
          - soulUrgeNumber: calculated from vowels in name (single digit, except for master numbers)
          - personalityNumber: calculated from consonants in name (single digit, except for master numbers)
          - interpretation: a detailed interpretation of all numbers and their interaction (300-400 words)`
        },
        {
          role: "user",
          content: `Generate a numerology reading for Name: ${name}, Birth Date: ${birthDate}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating numerology reading:", error);
    throw new Error("Failed to generate numerology reading");
  }
}
