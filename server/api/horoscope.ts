import { generateHoroscope, generateNumerologyReading } from "./openai";
import { HoroscopeResult, NumerologyResult } from "../../client/src/lib/openai";

// Cache for horoscopes to reduce API calls
const horoscopeCache = new Map<string, { data: HoroscopeResult; timestamp: number; dateGenerated: string }>();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper function to get current date string for cache invalidation
function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Extended horoscope types for comprehensive readings
export interface ExtendedHoroscopeResult {
  sign: string;
  date: string;
  daily: {
    reading: string;
    love: number;
    career: number;
    health: number;
    spirituality: number;
    luckyNumbers: number[];
    luckyColor: string;
    guidance: string;
  };
  monthly: {
    reading: string;
    themes: string[];
    opportunities: string;
    challenges: string;
    guidance: string;
    keyDates: string[];
  };
  yearly: {
    reading: string;
    majorThemes: string[];
    growthAreas: string[];
    relationships: string;
    career: string;
    health: string;
    spirituality: string;
    guidance: string;
  };
}

/**
 * Calculates zodiac sign from birth date
 */
function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "pisces";
  
  return "aries"; // fallback
}

/**
 * Gets comprehensive horoscope reading based on user's birth date
 */
export async function getPersonalizedHoroscope(birthDate: string): Promise<ExtendedHoroscopeResult> {
  const sign = getZodiacSign(birthDate);
  const today = new Date();
  const cacheKey = `extended-${sign}-${today.toISOString().split('T')[0]}`;
  
  // Check cache first - validate both expiry and date
  const cached = horoscopeCache.get(cacheKey);
  const currentDate = getCurrentDateString();
  if (cached && cached.dateGenerated === currentDate && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data as any;
  }

  // Generate comprehensive horoscope
  const result = await generateComprehensiveHoroscope(sign, birthDate);
  
  // Cache the result with current date
  horoscopeCache.set(cacheKey, {
    data: result as any,
    timestamp: Date.now(),
    dateGenerated: currentDate
  });
  
  return result;
}

/**
 * Generates comprehensive horoscope with daily, monthly, and yearly readings
 */
async function generateComprehensiveHoroscope(sign: string, birthDate: string): Promise<ExtendedHoroscopeResult> {
  const today = new Date();
  
  // Generate authentic astrological reading based on sign characteristics
  return generateAuthenticHoroscope(sign, birthDate, today);
}

/**
 * Generates authentic horoscope based on astrological principles
 */
function generateAuthenticHoroscope(sign: string, birthDate: string, currentDate: Date): ExtendedHoroscopeResult {
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const birthDateObj = new Date(birthDate);
  
  // Calculate age and life cycle position for personalized guidance
  const age = currentYear - birthDateObj.getFullYear();
  const birthdayThisYear = new Date(currentYear, birthDateObj.getMonth(), birthDateObj.getDate());
  const daysToBirthday = Math.ceil((birthdayThisYear.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Astrological data for each sign
  const signData = getSignAstrologicalData(sign);
  
  // Generate personalized daily reading
  const dailyReading = generateDailyReading(sign, signData, daysToBirthday, age);
  
  // Generate monthly themes
  const monthlyReading = generateMonthlyReading(sign, signData, currentMonth, daysToBirthday);
  
  // Generate yearly forecast
  const yearlyReading = generateYearlyReading(sign, signData, currentYear, age);
  
  return {
    sign: sign,
    date: currentDate.toISOString().split('T')[0],
    daily: dailyReading,
    monthly: monthlyReading,
    yearly: yearlyReading
  };
}

/**
 * Gets astrological data for each zodiac sign
 */
function getSignAstrologicalData(sign: string) {
  const data: Record<string, any> = {
    aries: {
      element: 'Fire',
      ruler: 'Mars',
      quality: 'Cardinal',
      strengths: ['Leadership', 'Courage', 'Initiative', 'Energy'],
      challenges: ['Impatience', 'Impulsiveness', 'Anger'],
      luckyNumbers: [1, 8, 17, 26],
      luckyColor: 'Red',
      keywords: ['Pioneer', 'Leader', 'Warrior', 'Innovator']
    },
    taurus: {
      element: 'Earth',
      ruler: 'Venus',
      quality: 'Fixed',
      strengths: ['Stability', 'Determination', 'Sensuality', 'Reliability'],
      challenges: ['Stubbornness', 'Materialism', 'Resistance to change'],
      luckyNumbers: [2, 6, 9, 12, 24],
      luckyColor: 'Green',
      keywords: ['Builder', 'Stabilizer', 'Lover of beauty', 'Persistent']
    },
    gemini: {
      element: 'Air',
      ruler: 'Mercury',
      quality: 'Mutable',
      strengths: ['Communication', 'Adaptability', 'Intelligence', 'Curiosity'],
      challenges: ['Inconsistency', 'Superficiality', 'Restlessness'],
      luckyNumbers: [5, 7, 14, 23],
      luckyColor: 'Yellow',
      keywords: ['Communicator', 'Learner', 'Connector', 'Versatile']
    },
    cancer: {
      element: 'Water',
      ruler: 'Moon',
      quality: 'Cardinal',
      strengths: ['Nurturing', 'Intuition', 'Emotional depth', 'Protection'],
      challenges: ['Moodiness', 'Over-sensitivity', 'Clinging'],
      luckyNumbers: [2, 7, 11, 16, 20, 25],
      luckyColor: 'Silver',
      keywords: ['Nurturer', 'Protector', 'Intuitive', 'Home-maker']
    },
    leo: {
      element: 'Fire',
      ruler: 'Sun',
      quality: 'Fixed',
      strengths: ['Creativity', 'Confidence', 'Generosity', 'Leadership'],
      challenges: ['Pride', 'Stubbornness', 'Self-centeredness'],
      luckyNumbers: [1, 3, 10, 19],
      luckyColor: 'Gold',
      keywords: ['Creator', 'Performer', 'Leader', 'Generous']
    },
    virgo: {
      element: 'Earth',
      ruler: 'Mercury',
      quality: 'Mutable',
      strengths: ['Analysis', 'Service', 'Perfection', 'Practicality'],
      challenges: ['Criticism', 'Worry', 'Over-thinking'],
      luckyNumbers: [6, 15, 20, 27],
      luckyColor: 'Navy Blue',
      keywords: ['Healer', 'Analyst', 'Server', 'Perfectionist']
    },
    libra: {
      element: 'Air',
      ruler: 'Venus',
      quality: 'Cardinal',
      strengths: ['Balance', 'Harmony', 'Justice', 'Relationships'],
      challenges: ['Indecision', 'People-pleasing', 'Avoidance'],
      luckyNumbers: [4, 6, 13, 15, 24],
      luckyColor: 'Pink',
      keywords: ['Harmonizer', 'Diplomat', 'Artist', 'Peacemaker']
    },
    scorpio: {
      element: 'Water',
      ruler: 'Pluto',
      quality: 'Fixed',
      strengths: ['Intensity', 'Transformation', 'Intuition', 'Depth'],
      challenges: ['Jealousy', 'Secrecy', 'Vindictiveness'],
      luckyNumbers: [8, 11, 18, 22],
      luckyColor: 'Deep Red',
      keywords: ['Transformer', 'Detective', 'Healer', 'Intense']
    },
    sagittarius: {
      element: 'Fire',
      ruler: 'Jupiter',
      quality: 'Mutable',
      strengths: ['Adventure', 'Philosophy', 'Optimism', 'Freedom'],
      challenges: ['Restlessness', 'Bluntness', 'Over-promising'],
      luckyNumbers: [3, 9, 15, 21, 29],
      luckyColor: 'Purple',
      keywords: ['Explorer', 'Philosopher', 'Teacher', 'Adventurer']
    },
    capricorn: {
      element: 'Earth',
      ruler: 'Saturn',
      quality: 'Cardinal',
      strengths: ['Ambition', 'Discipline', 'Structure', 'Achievement'],
      challenges: ['Pessimism', 'Rigidity', 'Over-working'],
      luckyNumbers: [6, 9, 15, 18, 26],
      luckyColor: 'Brown',
      keywords: ['Achiever', 'Builder', 'Authority', 'Ambitious']
    },
    aquarius: {
      element: 'Air',
      ruler: 'Uranus',
      quality: 'Fixed',
      strengths: ['Innovation', 'Humanitarianism', 'Independence', 'Vision'],
      challenges: ['Detachment', 'Rebellion', 'Unpredictability'],
      luckyNumbers: [4, 7, 11, 22, 29],
      luckyColor: 'Electric Blue',
      keywords: ['Innovator', 'Humanitarian', 'Rebel', 'Visionary']
    },
    pisces: {
      element: 'Water',
      ruler: 'Neptune',
      quality: 'Mutable',
      strengths: ['Compassion', 'Imagination', 'Spirituality', 'Empathy'],
      challenges: ['Escapism', 'Confusion', 'Over-sensitivity'],
      luckyNumbers: [3, 9, 12, 15, 18, 24],
      luckyColor: 'Sea Green',
      keywords: ['Dreamer', 'Healer', 'Artist', 'Mystic']
    }
  };
  
  return data[sign] || data['aries'];
}

/**
 * Generates personalized daily reading
 */
function generateDailyReading(sign: string, signData: any, daysToBirthday: number, age: number) {
  const isNearBirthday = Math.abs(daysToBirthday) <= 30;
  let personalizedGuidance = "";
  if (isNearBirthday) {
    personalizedGuidance = daysToBirthday > 0 
      ? `With your birthday approaching in ${daysToBirthday} days, this is a time of preparation and anticipation. `
      : `Having recently celebrated your birthday, you're in a powerful manifestation phase. `;
  }
  
  const dailyReadings: Record<string, string> = {
    aries: `${personalizedGuidance}Your ${signData.element} energy burns bright today, Mars empowers your natural leadership. Take initiative in important matters while being mindful of others' feelings.`,
    taurus: `${personalizedGuidance}Venus brings stability and sensual pleasure to your day. Focus on practical matters and enjoy life's simple pleasures.`,
    gemini: `${personalizedGuidance}Mercury enhances your communication abilities today. Conversations flow easily and new information comes your way.`,
    cancer: `${personalizedGuidance}The Moon heightens your intuitive abilities and emotional sensitivity. Trust your inner guidance and nurture your closest relationships.`,
    leo: `${personalizedGuidance}The Sun illuminates your creative spirit and natural charisma. Your confidence attracts positive attention and opportunities.`,
    virgo: `${personalizedGuidance}Mercury sharpens your analytical mind and attention to detail. This is an excellent day for organizing and planning.`,
    libra: `${personalizedGuidance}Venus brings harmony and beauty to your interactions. Focus on balance in all areas of life.`,
    scorpio: `${personalizedGuidance}Pluto deepens your insight and transformative power. Trust your intuition and look beneath surface appearances.`,
    sagittarius: `${personalizedGuidance}Jupiter expands your horizons and philosophical outlook. Adventure calls and learning opportunities abound.`,
    capricorn: `${personalizedGuidance}Saturn rewards your discipline and hard work. Structure and organization lead to tangible achievements.`,
    aquarius: `${personalizedGuidance}Uranus sparks innovation and humanitarian impulses. Embrace your unique perspective.`,
    pisces: `${personalizedGuidance}Neptune enhances your compassion and creative imagination. Trust your dreams and intuitive insights.`
  };
  
  return {
    reading: dailyReadings[sign] || dailyReadings['aries'],
    love: 3 + Math.floor(Math.random() * 3),
    career: 3 + Math.floor(Math.random() * 3),
    health: 3 + Math.floor(Math.random() * 3),
    spirituality: 3 + Math.floor(Math.random() * 3),
    luckyNumbers: signData.luckyNumbers,
    luckyColor: signData.luckyColor,
    guidance: `As a ${sign}, focus on developing your ${signData.strengths[0].toLowerCase()}.`
  };
}

/**
 * Generates monthly reading
 */
function generateMonthlyReading(sign: string, signData: any, currentMonth: string, daysToBirthday: number) {
  return {
    reading: `This month brings significant focus to your ${signData.strengths[0].toLowerCase()} and ${signData.strengths[1].toLowerCase()}.`,
    themes: [signData.strengths[0], signData.strengths[1]],
    opportunities: `Your ${signData.element} element is supported this month.`,
    challenges: `Be mindful of your tendency toward ${signData.challenges[0].toLowerCase()}.`,
    guidance: `Focus on your role as a ${signData.keywords[0].toLowerCase()}.`,
    keyDates: [`${currentMonth} 8-10`, `${currentMonth} 15-17`]
  };
}

/**
 * Generates yearly reading
 */
function generateYearlyReading(sign: string, signData: any, currentYear: number, age: number) {
  return {
    reading: `${currentYear} is a significant year for you.`,
    majorThemes: [signData.strengths[0], signData.strengths[1]],
    growthAreas: [`Developing your ${signData.strengths[0].toLowerCase()}`],
    relationships: `Focus on expressing your ${signData.strengths[1].toLowerCase()}.`,
    career: `Professional growth comes through embracing your role as a ${signData.keywords[0].toLowerCase()}.`,
    health: `Physical and emotional well-being benefit from honoring your ${signData.element.toLowerCase()} needs.`,
    spirituality: `Deepen your connection to your ${signData.keywords[2] || signData.keywords[1]} nature.`,
    guidance: `Trust your natural ${signData.keywords[0].toLowerCase()} instincts.`
  };
}

/**
 * Gets daily horoscope for a specific zodiac sign
 */
export async function getHoroscopeForSign(sign: string): Promise<HoroscopeResult> {
  const { fetchDailyHoroscope, getCachedHoroscope } = await import('../horoscope-scraper');
  const cached = getCachedHoroscope(sign);
  if (cached) return cached;
  try {
    return await fetchDailyHoroscope(sign);
  } catch (error) {
    return getFallbackHoroscope(sign);
  }
}

function getFallbackHoroscope(sign: string): HoroscopeResult {
  return {
    sign: sign,
    date: new Date().toLocaleDateString(),
    reading: "Today brings a mix of opportunities and challenges. Stay focused.",
    love: 3,
    career: 3,
    health: 3,
    spirituality: 4
  };
}

/**
 * Calculates numerology profile based on name and birth date
 */
export async function calculateNumerologyProfile(name: string, birthDate: string): Promise<NumerologyResult> {
  try {
    return await generateNumerologyReading(name, birthDate);
  } catch (error) {
    return algorithmicNumerologyCalculation(name, birthDate);
  }
}

function algorithmicNumerologyCalculation(name: string, birthDate: string): NumerologyResult {
  const reduceNumber = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };
  
  const letterToNumber = (letter: string): number => {
    const value = letter.toLowerCase().charCodeAt(0) - 96;
    return value >= 1 && value <= 26 ? (value % 9 || 9) : 0;
  };
  
  const calculateLifePath = (date: string): number => {
    const parts = date.split('-');
    if (parts.length !== 3) return 5;
    const year = parts[0].split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return reduceNumber(reduceNumber(year) + reduceNumber(month) + reduceNumber(day));
  };
  
  const calculateDestiny = (fullName: string): number => {
    let sum = 0;
    for (const char of fullName.replace(/[^a-zA-Z]/g, '')) sum += letterToNumber(char);
    return reduceNumber(sum);
  };
  
  const calculateSoulUrge = (fullName: string): number => {
    let sum = 0;
    const vowels = 'aeiou';
    for (const char of fullName.toLowerCase()) if (vowels.includes(char)) sum += letterToNumber(char);
    return reduceNumber(sum);
  };
  
  const calculatePersonality = (fullName: string): number => {
    let sum = 0;
    const vowels = 'aeiou';
    for (const char of fullName.replace(/[^a-zA-Z]/g, '').toLowerCase()) {
      if (!vowels.includes(char)) sum += letterToNumber(char);
    }
    return reduceNumber(sum);
  };
  
  const calculatePersonalYear = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5;
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const currentYear = new Date().getFullYear();
    const yearSum = currentYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    return reduceNumber(reduceNumber(month) + reduceNumber(day) + reduceNumber(yearSum));
  };

  const lifePathNumber = calculateLifePath(birthDate);
  const destinyNumber = calculateDestiny(name);
  const soulUrgeNumber = calculateSoulUrge(name);
  const personalityNumber = calculatePersonality(name);
  const soulChakraNumber = reduceNumber(lifePathNumber + destinyNumber);
  const personalYearNumber = calculatePersonalYear(birthDate);
  
  return {
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    soulChakraNumber,
    personalYearNumber,
    interpretation: `Your Life Path ${lifePathNumber} and Destiny ${destinyNumber} reveal a powerful spiritual path.`,
    strengths: ["Intuitive", "Creative"],
    challenges: ["Balance"],
    guidance: "Trust your inner wisdom."
  };
}
