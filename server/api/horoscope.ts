import { generateHoroscope, generateNumerologyReading } from "./openai";
import { HoroscopeResult, NumerologyResult } from "../../client/src/lib/openai";

// Cache for horoscopes to reduce API calls
const horoscopeCache = new Map<string, { data: HoroscopeResult; timestamp: number }>();
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Gets daily horoscope for a specific zodiac sign
 * Uses a cache to reduce API calls, refreshing every 12 hours
 */
export async function getHoroscopeForSign(sign: string): Promise<HoroscopeResult> {
  const now = Date.now();
  const cacheKey = `${sign}-${new Date().toISOString().split('T')[0]}`;
  
  // Check cache first
  const cached = horoscopeCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }
  
  // If not cached or expired, generate a new horoscope
  try {
    const horoscope = await generateHoroscope(sign);
    
    // Cache the result
    horoscopeCache.set(cacheKey, {
      data: horoscope,
      timestamp: now
    });
    
    return horoscope;
  } catch (error) {
    console.error(`Error getting horoscope for ${sign}:`, error);
    
    // Return fallback horoscope if API fails
    return getFallbackHoroscope(sign);
  }
}

/**
 * Fallback horoscope in case the API fails
 */
function getFallbackHoroscope(sign: string): HoroscopeResult {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  // Generic horoscope templates by sign
  const horoscopes: Record<string, HoroscopeResult> = {
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
  
  return horoscopes[sign] || {
    sign: sign,
    date: today,
    reading: "Today brings a mix of opportunities and challenges. Listen to your intuition and stay adaptable as circumstances evolve. Taking time for self-reflection will help you align with your higher purpose and true path.",
    love: 3,
    career: 3,
    health: 3,
    spirituality: 4
  };
}

/**
 * Calculates numerology profile based on name and birth date
 * Uses OpenAI for calculation or falls back to algorithmic calculation
 */
export async function calculateNumerologyProfile(name: string, birthDate: string): Promise<NumerologyResult> {
  try {
    // Try to use OpenAI for the calculation
    return await generateNumerologyReading(name, birthDate);
  } catch (error) {
    console.error("Error generating numerology with AI, falling back to algorithmic calculation:", error);
    
    // Fallback to algorithmic calculation
    return algorithmicNumerologyCalculation(name, birthDate);
  }
}

/**
 * Fallback numerology calculation using algorithms
 */
function algorithmicNumerologyCalculation(name: string, birthDate: string): NumerologyResult {
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
  let interpretation = generateInterpretation(lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber);
  
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
function generateInterpretation(lifePath: number, destiny: number, soulUrge: number, personality: number): string {
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
