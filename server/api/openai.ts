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
 * @param base64Image The base64 encoded image
 * @param customPrompt Optional custom prompt to use for the analysis
 */
export async function analyzeAuraImage(base64Image: string, customPrompt?: string): Promise<AuraAnalysisResult> {
  // Default result for fallback
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

  try {
    // Check if API key is missing or invalid format
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_KEY_HERE") {
      console.log("Using fallback aura analysis due to missing API key");
      return generateFallbackAuraAnalysis();
    }

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
          content: customPrompt
            ? `You are an expert spiritual healer and energy reader with decades of experience. 
            Analyze the image as requested and provide insightful observations.
            Respond with valid JSON data containing the following fields:
            - dominantColor: the primary aura color (e.g., "Purple", "Blue", "Green", etc.)
            - secondaryColor: a secondary aura color if present, otherwise null
            - energyLevel: a number from 1 to 5 indicating energy intensity
            - personalityTraits: an array of 3-5 traits associated with the energy
            - spiritualGuidance: personalized spiritual insights based on the energy (150-200 words)
            - chakraActivity: an object with numeric values (1-10) for each of the 7 chakras (root, sacral, solarPlexus, heart, throat, thirdEye, crown)
            - detailedAnalysis: a comprehensive analysis of the energy patterns (200-300 words)`
            : `You are an expert spiritual healer and aura reader with decades of experience in analyzing aura photographs. 
            Carefully examine the colors surrounding the person in the image. These colors represent their actual aura.
            Look specifically for luminous/glowing colored halos, outlines, or fields that surround the person's body.
            The colors visible around them (whether subtle or vibrant) are the actual aura colors, not just artistic effects or clothing colors.
            
            Respond with valid JSON data containing the following fields:
            - dominantColor: the primary aura color you can see surrounding the person (e.g., "Purple", "Blue", "Green", etc.)
            - secondaryColor: a secondary aura color you can see surrounding the person, or null if only one color is visible
            - energyLevel: a number from 1 to 5 indicating the intensity of the aura's glow/radiance
            - personalityTraits: an array of 3-5 personality traits associated with these specific aura colors
            - spiritualGuidance: personalized spiritual guidance based on the specific aura colors you observed (150-200 words)
            - chakraActivity: an object with numeric values (1-10) for each of the 7 chakras (root, sacral, solarPlexus, heart, throat, thirdEye, crown) based on the aura colors observed
            - detailedAnalysis: a comprehensive analysis of the aura colors and energy patterns visible in the image (200-300 words)`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: customPrompt 
                ? customPrompt 
                : "Please analyze the aura colors visible around this person in the photograph. Focus specifically on identifying the colored energy field surrounding them, and provide a detailed spiritual reading based on these actual aura colors."
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
    // Return a fallback response instead of throwing an error
    return generateFallbackAuraAnalysis();
  }
}

/**
 * Generates a fallback aura analysis for when the API is unavailable
 */
function generateFallbackAuraAnalysis(): AuraAnalysisResult {
  // Create a randomized aura reading
  const auraColors = [
    "Purple", "Blue", "Green", "Yellow", "Orange", "Red", "Indigo", "Violet", "Turquoise", "Gold"
  ];
  
  const traits = [
    "Intuitive", "Spiritual", "Creative", "Empathetic", "Analytical", "Practical", 
    "Compassionate", "Energetic", "Visionary", "Grounded", "Sensitive", "Resilient"
  ];
  
  // Select random colors and traits
  const dominantColor = auraColors[Math.floor(Math.random() * auraColors.length)];
  let secondaryColor = auraColors[Math.floor(Math.random() * auraColors.length)];
  // Ensure secondary color is different from dominant
  while (secondaryColor === dominantColor) {
    secondaryColor = auraColors[Math.floor(Math.random() * auraColors.length)];
  }
  
  // Generate random personality traits (3-5)
  const traitCount = Math.floor(Math.random() * 3) + 3; // 3-5
  const shuffledTraits = [...traits].sort(() => 0.5 - Math.random());
  const personalityTraits = shuffledTraits.slice(0, traitCount);
  
  // Energy level (1-5)
  const energyLevel = Math.floor(Math.random() * 5) + 1;
  
  // Generate chakra activity (values 1-10)
  const chakraActivity = {
    root: Math.floor(Math.random() * 10) + 1,
    sacral: Math.floor(Math.random() * 10) + 1,
    solarPlexus: Math.floor(Math.random() * 10) + 1,
    heart: Math.floor(Math.random() * 10) + 1,
    throat: Math.floor(Math.random() * 10) + 1,
    thirdEye: Math.floor(Math.random() * 10) + 1,
    crown: Math.floor(Math.random() * 10) + 1
  };
  
  // Spiritual guidance messages by color
  const guidanceByColor: Record<string, string> = {
    "Purple": "Your spiritual awareness is highly developed. Continue exploring mystical practices and trust your intuition as it serves as a powerful guide in your life. Take time for meditation to connect with your higher consciousness.",
    "Blue": "You have natural healing abilities and strong communication skills. Focus on expressing your truth with compassion and clarity. Regular throat chakra work through chanting or singing can help maintain your energetic balance.",
    "Green": "Your heart-centered energy radiates compassion and growth. Nurture your connections with others and with nature to maintain balance. Activities like gardening or forest walks can help ground and rejuvenate your energy.",
    "Yellow": "Your intellectual and creative powers are strong. Channel this energy into pursuits that stimulate both mind and spirit. Regular solar plexus exercises can help you maintain confidence and personal power.",
    "Orange": "Your creative and emotional energy is vibrant. Embrace artistic expression and allow yourself to experience joy without reservation. Pay attention to your emotional needs and honor your sensitivity.",
    "Red": "You possess strong life force energy and determination. Ground this powerful energy through physical activity and connection with the earth. Practice root chakra meditations to maintain stability.",
    "Indigo": "Your intuitive and psychic abilities are extraordinarily developed. Set aside regular time for spiritual practice to further enhance these gifts. Consider keeping a dream journal to track insights from your subconscious.",
    "Violet": "You have a profound connection to universal wisdom and spiritual transformation. Continue your spiritual studies and share your insights with others who may benefit from your guidance.",
    "Turquoise": "You bridge the physical and spiritual realms with ease. Your healing abilities are powerful, particularly when working with others. Develop these gifts through study and practice.",
    "Gold": "Your spiritual development is advanced, reflecting wisdom accumulated over many lifetimes. Share your knowledge with others but remember to maintain energetic boundaries."
  };
  
  // Detailed analysis templates
  const analysisTemplates = [
    `Your aura's ${dominantColor.toLowerCase()} and ${secondaryColor.toLowerCase()} colors reveal a spiritual seeker with natural ${personalityTraits[0].toLowerCase()} tendencies. The interplay between these colors suggests you're experiencing a period of spiritual growth and transformation. Your energy field shows sensitivity to environments and people around you, which is both a gift and a challenge. Work on establishing stronger energetic boundaries while maintaining your compassionate nature. The ${chakraActivity.crown > 7 ? "strong" : "moderate"} activity in your crown chakra indicates a connection to higher consciousness, while your ${chakraActivity.root > 7 ? "strong" : "moderate"} root chakra energy helps keep you grounded in physical reality. This balance allows you to bring spiritual insights into practical application.`,
    
    `The prominent ${dominantColor.toLowerCase()} in your aura indicates ${dominantColor === "Purple" || dominantColor === "Blue" || dominantColor === "Indigo" ? "spiritual depth and intuitive abilities" : dominantColor === "Green" || dominantColor === "Pink" ? "healing capacity and compassionate nature" : "creative force and vitality"}. Combined with ${secondaryColor.toLowerCase()} undertones, this creates a unique energy signature that attracts ${secondaryColor === "Gold" || secondaryColor === "Yellow" ? "abundance and intellectual stimulation" : secondaryColor === "Blue" || secondaryColor === "Turquoise" ? "truth-seekers and authentic connections" : "transformative experiences and growth opportunities"}. Your chakra system shows particular activity in the ${Object.entries(chakraActivity).sort((a, b) => b[1] - a[1])[0][0]} area, suggesting this is a focal point for your current spiritual development. Regular meditation focusing on this center can help you harness this energy more effectively.`,
    
    `Your aura analysis reveals a complex energy pattern dominated by ${dominantColor.toLowerCase()} with ${secondaryColor.toLowerCase()} influences. This combination suggests you're naturally ${personalityTraits.slice(0, 2).join(" and ")}, with an innate ability to ${dominantColor === "Purple" || dominantColor === "Indigo" || dominantColor === "Violet" ? "access intuitive wisdom and spiritual insights" : dominantColor === "Blue" || dominantColor === "Turquoise" ? "communicate healing energy and truth" : dominantColor === "Green" ? "foster growth and harmony in yourself and others" : "energize and transform situations"}. Your chakra alignment shows particular strength in the ${Object.entries(chakraActivity).sort((a, b) => b[1] - a[1])[0][0]} and ${Object.entries(chakraActivity).sort((a, b) => b[1] - a[1])[1][0]} centers, with opportunity for development in the ${Object.entries(chakraActivity).sort((a, b) => a[1] - b[1])[0][0]} area. Working with crystals associated with this chakra could help balance your overall energy system.`
  ];
  
  return {
    dominantColor,
    secondaryColor,
    energyLevel,
    personalityTraits,
    spiritualGuidance: guidanceByColor[dominantColor] || guidanceByColor["Blue"],
    chakraActivity,
    detailedAnalysis: analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)]
  };
}

/**
 * Generates daily horoscope for a specific zodiac sign
 */
export async function generateHoroscope(sign: string): Promise<any> {
  try {
    // Check if API key is missing or invalid format
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_KEY_HERE") {
      console.log("Using fallback horoscope due to missing API key");
      return getFallbackHoroscope(sign);
    }
    
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
    // Use a fallback horoscope instead of throwing an error
    return getFallbackHoroscope(sign);
  }
}

/**
 * Generates a fallback horoscope when API is unavailable
 */
function getFallbackHoroscope(sign: string): any {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  // Generic horoscope templates by sign
  const horoscopes: Record<string, any> = {
    aries: {
      sign: "aries",
      date: today,
      reading: "Today brings opportunities for leadership and new beginnings. Your natural confidence will help you tackle challenges head-on. Be mindful of impatience and take time to consider others' perspectives. Physical activity will help channel your abundant energy in positive ways.",
      love: 4,
      career: 5,
      health: 4,
      spirituality: 3
    },
    taurus: {
      sign: "taurus",
      date: today,
      reading: "Stability and comfort are highlighted today. Focus on practical matters and enjoy sensory pleasures. Your determination helps you make steady progress toward goals. Take time to connect with nature and ground your energy. Financial decisions made today may have long-lasting benefits.",
      love: 5,
      career: 4,
      health: 4,
      spirituality: 3
    },
    gemini: {
      sign: "gemini",
      date: today,
      reading: "Communication flows easily today, making it ideal for important conversations. Your curiosity leads to valuable discoveries. Versatility allows you to adapt to changing circumstances. Balance mental activity with physical movement. Connections made now may offer unexpected opportunities.",
      love: 3,
      career: 4,
      health: 3,
      spirituality: 4
    },
    cancer: {
      sign: "cancer",
      date: today,
      reading: "Emotional insights bring clarity to personal matters. Home and family provide comfort and inspiration. Your intuition is especially strong—trust your inner guidance. Nurturing others brings fulfillment, but remember to care for yourself too. Creative projects flourish under today's nurturing energy.",
      love: 5,
      career: 3,
      health: 4,
      spirituality: 5
    },
    leo: {
      sign: "leo",
      date: today,
      reading: "Your natural charisma shines brightly today, drawing others to your warmth. Creative expression brings joy and recognition. Leadership opportunities arise where you can showcase your talents. Balance confidence with humility for best results. Celebrate your achievements and inspire others.",
      love: 4,
      career: 5,
      health: 4,
      spirituality: 3
    },
    virgo: {
      sign: "virgo",
      date: today,
      reading: "Analytical abilities are heightened, helping you solve complex problems. Attention to detail yields excellent results in work projects. Health routines benefit from refinement and consistency. Service to others brings emotional fulfillment. Organization creates space for unexpected opportunities.",
      love: 3,
      career: 5,
      health: 4,
      spirituality: 3
    },
    libra: {
      sign: "libra",
      date: today,
      reading: "Harmony in relationships brings joy and fulfillment. Aesthetic appreciation enhances your environment and mood. Balance between giving and receiving creates healthy dynamics. Diplomacy helps navigate challenging social situations. Beauty and art provide inspiration and spiritual connection.",
      love: 5,
      career: 3,
      health: 4,
      spirituality: 4
    },
    scorpio: {
      sign: "scorpio",
      date: today,
      reading: "Transformative insights reveal hidden truths. Emotional depth creates profound connections with others. Resourcefulness helps overcome any obstacles. Privacy and alone time rejuvenate your spirit. Investigating mysteries or occult subjects brings satisfaction and understanding.",
      love: 4,
      career: 4,
      health: 3,
      spirituality: 5
    },
    sagittarius: {
      sign: "sagittarius",
      date: today,
      reading: "Adventure and expansion highlight your day. Philosophical insights broaden your perspective. Optimism attracts positive opportunities and connections. Travel or learning about different cultures brings joy. Freedom and space allow your spirit to flourish and grow.",
      love: 3,
      career: 4,
      health: 4,
      spirituality: 5
    },
    capricorn: {
      sign: "capricorn",
      date: today,
      reading: "Discipline and persistence lead to significant accomplishments. Long-term planning pays off in unexpected ways. Professional recognition may come from past efforts. Structure provides comfort and security. Balance work with self-care for sustainable success.",
      love: 3,
      career: 5,
      health: 4,
      spirituality: 3
    },
    aquarius: {
      sign: "aquarius",
      date: today,
      reading: "Innovative ideas flow freely, inspiring new approaches. Humanitarian concerns guide your actions and decisions. Friendships and group activities bring fulfillment. Technology advances your goals and projects. Embracing your uniqueness leads to authentic connections.",
      love: 3,
      career: 4,
      health: 3,
      spirituality: 5
    },
    pisces: {
      sign: "pisces",
      date: today,
      reading: "Intuitive insights guide your decisions and interactions. Artistic expression channels your deep emotional landscape. Compassion creates healing connections with others. Spiritual practices strengthen your inner guidance. Boundaries help preserve your sensitive energy.",
      love: 4,
      career: 3,
      health: 3,
      spirituality: 5
    }
  };
  
  return horoscopes[sign.toLowerCase()] || {
    sign: sign.toLowerCase(),
    date: today,
    reading: "Today brings a mix of opportunities and challenges. Listen to your intuition and stay adaptable as circumstances evolve. Taking time for self-reflection will help you align with your higher purpose and true path.",
    love: 3,
    career: 3,
    health: 3,
    spirituality: 4
  };
}

/**
 * Generates a numerology analysis based on name and birth date
 */
export async function generateNumerologyReading(name: string, birthDate: string): Promise<any> {
  try {
    // Check if API key is missing or invalid format
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_KEY_HERE") {
      console.log("Using algorithmic numerology calculation due to missing API key");
      return calculateNumerologyProfile(name, birthDate);
    }
    
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
    // Use algorithmic calculation instead of throwing an error
    return calculateNumerologyProfile(name, birthDate);
  }
}

/**
 * Calculates numerology profile algorithmically when API is unavailable
 */
function calculateNumerologyProfile(name: string, birthDate: string): any {
  // Helper function to reduce number to single digit unless it's a master number
  const reduceNumber = (num: number): number => {
    // Master numbers are preserved
    if (num === 11 || num === 22 || num === 33) return num;
    
    // Reduce to single digit
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };
  
  // Convert letter to numerology value (A=1, B=2, etc.)
  const letterToNumber = (letter: string): number => {
    const value = letter.toLowerCase().charCodeAt(0) - 96;
    return value >= 1 && value <= 26 ? value : 0;
  };
  
  // Calculate Life Path Number from birth date
  const calculateLifePath = (date: string): number => {
    // Format should be YYYY-MM-DD
    const parts = date.split('-');
    if (parts.length !== 3) return 5; // Default fallback
    
    const year = parts[0].split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    return reduceNumber(reduceNumber(year) + reduceNumber(month) + reduceNumber(day));
  };
  
  // Calculate Destiny Number from full name
  const calculateDestiny = (fullName: string): number => {
    let sum = 0;
    for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
      sum += letterToNumber(char);
    }
    return reduceNumber(sum);
  };
  
  // Calculate Soul Urge Number from vowels in the name
  const calculateSoulUrge = (fullName: string): number => {
    let sum = 0;
    for (const char of fullName.toLowerCase()) {
      if ('aeiou'.includes(char)) {
        sum += letterToNumber(char);
      }
    }
    return reduceNumber(sum);
  };
  
  // Calculate Personality Number from consonants in the name
  const calculatePersonality = (fullName: string): number => {
    let sum = 0;
    for (const char of fullName.toLowerCase().replace(/[^a-zA-Z]/g, '')) {
      if (!'aeiou'.includes(char)) {
        sum += letterToNumber(char);
      }
    }
    return reduceNumber(sum);
  };
  
  // Calculate all numbers
  const lifePathNumber = calculateLifePath(birthDate);
  const destinyNumber = calculateDestiny(name);
  const soulUrgeNumber = calculateSoulUrge(name);
  const personalityNumber = calculatePersonality(name);
  
  // Generate interpretation based on calculated numbers
  const interpretation = generateNumerologyInterpretation(lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber);
  
  return {
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    interpretation
  };
}

/**
 * Generate basic interpretation based on numerology numbers
 */
function generateNumerologyInterpretation(lifePath: number, destiny: number, soulUrge: number, personality: number): string {
  const lifePathMeanings: Record<number, string> = {
    1: "You are a natural leader with independence and creativity.",
    2: "Your life path centers around cooperation, diplomacy, and sensitivity to others.",
    3: "Self-expression, creativity, and joy are the hallmarks of your journey.",
    4: "Stability, order, and building solid foundations define your life path.",
    5: "Freedom, adventure, and versatility characterize your life's journey.",
    6: "Responsibility, harmony, and nurturing others are central to your path.",
    7: "Spiritual growth, analysis, and search for truth define your journey.",
    8: "Material achievement, power, and authority are key themes in your life.",
    9: "Humanitarianism, compassion, and artistic expression mark your path.",
    11: "As a master number, you have heightened intuition and spiritual insight.",
    22: "As a master builder, you have the potential to create large-scale works that benefit humanity.",
    33: "As a master teacher, you embody compassion and service to humanity."
  };
  
  const destinyMeanings: Record<number, string> = {
    1: "Your destiny involves leadership, pioneering, and innovation.",
    2: "Partnership, cooperation, and mediation are your destined path.",
    3: "Creative expression, communication, and inspiration define your destiny.",
    4: "Building, organization, and creating order are your destined work.",
    5: "Change, freedom, and versatility characterize your life's mission.",
    6: "Service, responsibility, and creating harmony are your destiny.",
    7: "Analysis, spiritual wisdom, and specialized knowledge define your path.",
    8: "Business acumen, executive ability, and material accomplishment are your destiny.",
    9: "Humanitarian service, artistic expression, and compassion define your work.",
    11: "Your destiny involves inspiring others through spiritual insight and intuition.",
    22: "Your destiny is to build structures and systems that serve humanity on a large scale.",
    33: "Your destiny is to serve humanity through compassionate healing and teaching."
  };

  return `Your Life Path number ${lifePath} indicates that ${lifePathMeanings[lifePath] || "you have a unique journey ahead"}. Your Destiny number ${destiny} suggests that ${destinyMeanings[destiny] || "your purpose involves growth and achievement"}. 

With a Soul Urge number of ${soulUrge}, your inner desires and motivations center around ${soulUrge === 1 ? "independence and leadership" : soulUrge === 2 ? "harmony and cooperation" : soulUrge === 3 ? "self-expression and joy" : soulUrge === 4 ? "stability and order" : soulUrge === 5 ? "freedom and adventure" : soulUrge === 6 ? "nurturing and responsibility" : soulUrge === 7 ? "spiritual wisdom and analysis" : soulUrge === 8 ? "achievement and authority" : soulUrge === 9 ? "humanitarian service" : soulUrge === 11 ? "spiritual insight and inspiration" : soulUrge === 22 ? "practical visionary work" : "spiritual mastery and service"}.

Your Personality number ${personality} reveals that you present yourself to others as ${personality === 1 ? "confident and independent" : personality === 2 ? "diplomatic and cooperative" : personality === 3 ? "expressive and joyful" : personality === 4 ? "reliable and organized" : personality === 5 ? "adaptable and freedom-loving" : personality === 6 ? "responsible and nurturing" : personality === 7 ? "thoughtful and analytical" : personality === 8 ? "authoritative and capable" : personality === 9 ? "compassionate and artistic" : personality === 11 ? "inspirational and intuitive" : personality === 22 ? "masterful and ambitious" : "compassionate and service-oriented"}.

The interaction between these numbers creates a unique numerological blueprint that guides your life's journey. By honoring your Life Path, working toward your Destiny, acknowledging your Soul Urge, and expressing your Personality authentically, you can align with your highest potential and purpose.`;
}
