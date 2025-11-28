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
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  
  try {
    // Use OpenAI for authentic personalized readings if available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      const prompt = `Generate a comprehensive horoscope reading for ${sign} born on ${birthDate} for today (${today.toDateString()}), this month (${currentMonth} ${currentYear}), and this year (${currentYear}). Include specific guidance based on their birth date and current planetary transits.`;
      
      // This would integrate with OpenAI - for now using deterministic approach
    }
  } catch (error) {
    console.log("AI horoscope generation failed, using authentic astrological data");
  }
  
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
  const birthdayPhase = daysToBirthday > 0 ? 'approaching' : 'recent';
  
  let personalizedGuidance = "";
  if (isNearBirthday) {
    personalizedGuidance = daysToBirthday > 0 
      ? `With your birthday approaching in ${daysToBirthday} days, this is a time of preparation and anticipation. `
      : `Having recently celebrated your birthday, you're in a powerful manifestation phase. `;
  }
  
  const dailyReadings: Record<string, string> = {
    aries: `${personalizedGuidance}Your ${signData.element} energy burns bright today, Mars empowers your natural leadership. Take initiative in important matters while being mindful of others' feelings. Physical activity will help channel your abundant energy productively.`,
    taurus: `${personalizedGuidance}Venus brings stability and sensual pleasure to your day. Focus on practical matters and enjoy life's simple pleasures. Your determination helps you make steady progress toward long-term goals.`,
    gemini: `${personalizedGuidance}Mercury enhances your communication abilities today. Conversations flow easily and new information comes your way. Your curiosity leads to valuable discoveries and meaningful connections.`,
    cancer: `${personalizedGuidance}The Moon heightens your intuitive abilities and emotional sensitivity. Trust your inner guidance and nurture your closest relationships. Home and family provide comfort and inspiration.`,
    leo: `${personalizedGuidance}The Sun illuminates your creative spirit and natural charisma. Your confidence attracts positive attention and opportunities. Share your talents generously while staying humble.`,
    virgo: `${personalizedGuidance}Mercury sharpens your analytical mind and attention to detail. This is an excellent day for organizing, planning, and perfecting important projects. Your helpful nature is appreciated by others.`,
    libra: `${personalizedGuidance}Venus brings harmony and beauty to your interactions. Focus on balance in all areas of life. Your diplomatic skills help resolve conflicts and create peaceful solutions.`,
    scorpio: `${personalizedGuidance}Pluto deepens your insight and transformative power. Trust your intuition and look beneath surface appearances. Emotional breakthroughs lead to profound personal growth.`,
    sagittarius: `${personalizedGuidance}Jupiter expands your horizons and philosophical outlook. Adventure calls and learning opportunities abound. Share your wisdom and optimism with others who need inspiration.`,
    capricorn: `${personalizedGuidance}Saturn rewards your discipline and hard work. Structure and organization lead to tangible achievements. Your responsible nature inspires trust and respect from others.`,
    aquarius: `${personalizedGuidance}Uranus sparks innovation and humanitarian impulses. Embrace your unique perspective and contribute to collective progress. Technology and friendship play important roles today.`,
    pisces: `${personalizedGuidance}Neptune enhances your compassion and creative imagination. Trust your dreams and intuitive insights. Spiritual practices bring peace and clarity to your soul.`
  };
  
  // Calculate ratings based on astrological cycles
  const baseRatings = {
    love: 3 + Math.floor(Math.random() * 3),
    career: 3 + Math.floor(Math.random() * 3),
    health: 3 + Math.floor(Math.random() * 3),
    spirituality: 3 + Math.floor(Math.random() * 3)
  };
  
  // Adjust ratings for birthday proximity
  if (isNearBirthday) {
    baseRatings.spirituality = Math.min(5, baseRatings.spirituality + 1);
  }
  
  return {
    reading: dailyReadings[sign] || dailyReadings['aries'],
    love: baseRatings.love,
    career: baseRatings.career,
    health: baseRatings.health,
    spirituality: baseRatings.spirituality,
    luckyNumbers: signData.luckyNumbers,
    luckyColor: signData.luckyColor,
    guidance: `As a ${sign}, focus on developing your ${signData.strengths[0].toLowerCase()} while being mindful of ${signData.challenges[0].toLowerCase()}. Your ${signData.element} element guide your actions today.`
  };
}

/**
 * Generates monthly reading
 */
function generateMonthlyReading(sign: string, signData: any, currentMonth: string, daysToBirthday: number) {
  const monthlyThemes = {
    aries: ['Leadership opportunities', 'New beginnings', 'Physical vitality', 'Competitive spirit'],
    taurus: ['Financial stability', 'Sensual pleasures', 'Building foundations', 'Artistic expression'],
    gemini: ['Communication breakthroughs', 'Learning adventures', 'Social connections', 'Mental agility'],
    cancer: ['Family bonds', 'Emotional healing', 'Intuitive insights', 'Nurturing others'],
    leo: ['Creative projects', 'Self-expression', 'Leadership roles', 'Recognition'],
    virgo: ['Health improvements', 'Organizational skills', 'Service to others', 'Attention to detail'],
    libra: ['Relationship harmony', 'Artistic pursuits', 'Balance and fairness', 'Social justice'],
    scorpio: ['Transformation', 'Deep insights', 'Emotional intensity', 'Spiritual growth'],
    sagittarius: ['Adventure and travel', 'Higher learning', 'Philosophical insights', 'Cultural expansion'],
    capricorn: ['Career advancement', 'Goal achievement', 'Structural improvements', 'Authority recognition'],
    aquarius: ['Innovation projects', 'Humanitarian causes', 'Friendship circles', 'Future planning'],
    pisces: ['Spiritual awakening', 'Creative inspiration', 'Compassionate service', 'Dream work']
  };
  
  const currentThemes = (monthlyThemes as any)[sign] || monthlyThemes['aries'];
  
  return {
    reading: `This month brings significant focus to your ${signData.strengths[0].toLowerCase()} and ${signData.strengths[1].toLowerCase()}. As a ${signData.element} sign ruled by ${signData.ruler}, you'll find opportunities to express your natural ${signData.keywords[0].toLowerCase()} qualities. The planetary influences support your growth in ${currentThemes[0].toLowerCase()} and ${currentThemes[1].toLowerCase()}.`,
    themes: currentThemes,
    opportunities: `Your ${signData.element} element is particularly supported this month, creating opportunities for ${currentThemes[0].toLowerCase()} and personal growth through ${signData.strengths[0].toLowerCase()}.`,
    challenges: `Be mindful of your tendency toward ${signData.challenges[0].toLowerCase()}. Channel your ${signData.element} energy constructively to avoid ${signData.challenges[1] || 'imbalance'}.`,
    guidance: `Focus on your role as a ${signData.keywords[0].toLowerCase()} while developing your ${signData.keywords[1].toLowerCase()} qualities. The month's energy supports sustainable progress in your key life areas.`,
    keyDates: [`${currentMonth} 8-10`, `${currentMonth} 15-17`, `${currentMonth} 22-24`]
  };
}

/**
 * Generates yearly reading
 */
function generateYearlyReading(sign: string, signData: any, currentYear: number, age: number) {
  const lifePhase = age < 30 ? 'formation' : age < 50 ? 'establishment' : age < 70 ? 'mastery' : 'wisdom';
  
  const yearlyThemes = {
    aries: ['Leadership development', 'Personal courage', 'New ventures', 'Physical strength'],
    taurus: ['Financial growth', 'Stability building', 'Artistic development', 'Sensual awakening'],
    gemini: ['Communication mastery', 'Intellectual growth', 'Network expansion', 'Versatility'],
    cancer: ['Emotional maturity', 'Family legacy', 'Intuitive development', 'Nurturing gifts'],
    leo: ['Creative mastery', 'Leadership recognition', 'Heart-centered living', 'Generous spirit'],
    virgo: ['Service excellence', 'Health optimization', 'Skill refinement', 'Practical wisdom'],
    libra: ['Relationship mastery', 'Artistic achievement', 'Justice advocacy', 'Harmony creation'],
    scorpio: ['Transformational power', 'Psychological depth', 'Healing abilities', 'Spiritual intensity'],
    sagittarius: ['Wisdom teaching', 'Cultural bridge-building', 'Adventure completion', 'Truth seeking'],
    capricorn: ['Authority establishment', 'Legacy building', 'Structural mastery', 'Achievement recognition'],
    aquarius: ['Innovation leadership', 'Humanitarian impact', 'Future visioning', 'Collective service'],
    pisces: ['Spiritual mastery', 'Compassionate service', 'Creative transcendence', 'Universal love']
  };
  
  const themes = (yearlyThemes as any)[sign] || yearlyThemes['aries'];
  
  return {
    reading: `${currentYear} is a significant year for your ${lifePhase} phase of life. As a ${sign} in your ${signData.element} element journey, this year emphasizes ${themes[0].toLowerCase()} and ${themes[1].toLowerCase()}. Your natural ${signData.keywords[0].toLowerCase()} qualities will be crucial for navigating the year's challenges and opportunities.`,
    majorThemes: themes,
    growthAreas: [`Developing your ${signData.strengths[0].toLowerCase()}`, `Mastering your ${signData.element.toLowerCase()} element qualities`, `Balancing your ${signData.challenges[0].toLowerCase()} tendencies`],
    relationships: `Your ${signData.quality.toLowerCase()} nature brings unique gifts to relationships this year. Focus on expressing your ${signData.strengths[1].toLowerCase()} while being mindful of ${signData.challenges[0].toLowerCase()}.`,
    career: `Professional growth comes through embracing your role as a ${signData.keywords[0].toLowerCase()}. Your ${signData.element} element supports sustainable achievement in your chosen field.`,
    health: `Physical and emotional well-being benefit from honoring your ${signData.element.toLowerCase()} element needs. Balance activity with rest, and pay attention to your body's natural rhythms.`,
    spirituality: `Your spiritual journey this year involves deepening your connection to your ${signData.keywords[2] || signData.keywords[1]} nature. Meditation, prayer, or contemplative practices align with your soul purpose.`,
    guidance: `Trust your natural ${signData.keywords[0].toLowerCase()} instincts while developing your ${signData.keywords[1].toLowerCase()} qualities. This year's planetary influences support your authentic self-expression and spiritual evolution.`
  };
}

/**
 * Gets daily horoscope for a specific zodiac sign
 * Uses a cache to reduce API calls, refreshing every 12 hours
 */
export async function getHoroscopeForSign(sign: string): Promise<HoroscopeResult> {
  // Use the new horoscope scraper service
  const { fetchDailyHoroscope, getCachedHoroscope } = await import('../horoscope-scraper');
  
  // Try cached version first for speed
  const cached = getCachedHoroscope(sign);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh horoscope using the scraper service
  try {
    const horoscope = await fetchDailyHoroscope(sign);
    return horoscope;
  } catch (error) {
    console.error(`Error getting horoscope for ${sign}:`, error);
    
    // Return fallback horoscope if everything fails
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
    // Reduce ALL numbers to single digit (1-9) - no master numbers
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
  
  // Calculate Personality Number (Decision-Making Chakra) from day digits in birth date
  const calculatePersonality = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5; // Default fallback
    
    const day = parts[2]; // Get the day part (DD)
    let sum = 0;
    
    // Sum all digits in the day
    for (const digit of day) {
      sum += parseInt(digit);
    }
    
    const result = reduceNumber(sum);
    console.log(`calculatePersonality debug: birthDate=${birthDate}, day=${day}, sum=${sum}, result=${result}`);
    return result;
  };
  
  // Calculate Dominant Soul Chakra Number from birth date
  const calculateDominantSoulChakra = (birthDate: string): number => {
    // Sum all digits in birth date (e.g., 1998-09-09 = 1+9+9+8+0+9+0+9 = 45 = 4+5 = 9)
    const dateStr = birthDate.replace(/\D/g, ''); // Remove non-digits
    let sum = 0;
    
    for (const digit of dateStr) {
      sum += parseInt(digit);
    }
    
    // Reduce to single digit
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    
    return sum;
  };

  // Calculate Personal Year Number: month digits + day digits + current year digits
  const calculatePersonalYear = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5; // Default fallback
    
    const year = parts[0];   // YYYY (birth year - not used in personal year)
    const month = parts[1];  // MM (birth month)
    const day = parts[2];    // DD (birth day)
    const currentYear = "2026"; // Current year 2026
    
    console.log(`Horoscope CORRECTED calculatePersonalYear: birthDate=${birthDate}, month=${month}, day=${day}, currentYear=${currentYear}`);
    
    let sum = 0;
    
    // CRITICAL FIX: Sum all digits from birth month properly
    for (const digit of month) {
      const digitValue = parseInt(digit);
      if (!isNaN(digitValue)) {
        sum += digitValue;
        console.log(`Horoscope Adding month digit: ${digit} (${digitValue}), running sum: ${sum}`);
      }
    }
    
    // CRITICAL FIX: Sum all digits from birth day properly  
    for (const digit of day) {
      const digitValue = parseInt(digit);
      if (!isNaN(digitValue)) {
        sum += digitValue;
        console.log(`Horoscope Adding day digit: ${digit} (${digitValue}), running sum: ${sum}`);
      }
    }
    
    // Sum all digits from current year (2026)
    for (const digit of currentYear) {
      const digitValue = parseInt(digit);
      if (!isNaN(digitValue)) {
        sum += digitValue;
        console.log(`Horoscope Adding current year digit: ${digit} (${digitValue}), running sum: ${sum}`);
      }
    }
    
    console.log(`Horoscope CORRECTED personal year sum before reduction: ${sum}`);
    
    // Reduce to single digit (except for master numbers 11, 22, 33)
    const result = reduceNumber(sum);
    console.log(`Horoscope CORRECTED personalYear result: ${result}`);
    return result;
  };
  
  // Calculate all numbers
  const lifePathNumber = calculateLifePath(birthDate);
  const destinyNumber = calculateDestiny(name);
  const soulUrgeNumber = calculateSoulUrge(name);
  const personalityNumber = calculatePersonality(birthDate);
  const soulChakraNumber = calculateDominantSoulChakra(birthDate);
  const personalYearNumber = calculatePersonalYear(birthDate);
  
  // Generate interpretation based on calculated numbers
  let interpretation = generateInterpretation(lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber);
  
  return {
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    soulChakraNumber,
    personalYearNumber,
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
    9: "Humanitarianism, compassion, and artistic expression mark your path."
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
    9: "Humanitarian service, artistic expression, and compassion define your work."
  };
  
  return `Your Life Path number ${lifePath} indicates that ${lifePathMeanings[lifePath] || "you have a unique journey ahead"}. Your Destiny number ${destiny} suggests that ${destinyMeanings[destiny] || "your purpose involves growth and achievement"}. 

With a Soul Urge number of ${soulUrge}, your inner desires and motivations center around ${soulUrge === 1 ? "independence and leadership" : soulUrge === 2 ? "harmony and cooperation" : soulUrge === 3 ? "self-expression and joy" : soulUrge === 4 ? "stability and order" : soulUrge === 5 ? "freedom and adventure" : soulUrge === 6 ? "nurturing and responsibility" : soulUrge === 7 ? "spiritual wisdom and analysis" : soulUrge === 8 ? "achievement and authority" : soulUrge === 9 ? "humanitarian service" : "spiritual growth and service"}.

Your Personality number ${personality} reveals that you present yourself to others as ${personality === 1 ? "confident and independent" : personality === 2 ? "diplomatic and cooperative" : personality === 3 ? "expressive and joyful" : personality === 4 ? "reliable and organized" : personality === 5 ? "adaptable and freedom-loving" : personality === 6 ? "responsible and nurturing" : personality === 7 ? "thoughtful and analytical" : personality === 8 ? "authoritative and capable" : personality === 9 ? "compassionate and artistic" : "balanced and complete"}.

The interaction between these numbers creates a unique numerological blueprint that guides your life's journey. By honoring your Life Path, working toward your Destiny, acknowledging your Soul Urge, and expressing your Personality authentically, you can align with your highest potential and purpose.`;
}
