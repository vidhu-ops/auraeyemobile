import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import { HoroscopeResult } from '../client/src/lib/openai';

// Daily horoscope cache with date-based invalidation
const dailyHoroscopeCache = new Map<string, { data: HoroscopeResult; date: string }>();

// Zodiac signs array for iteration
const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

/**
 * Get horoscope from free API Ninjas service (primary source)
 */
async function getHoroscopeFromAPINinjas(sign: string): Promise<HoroscopeResult | null> {
  try {
    // API Ninjas free horoscope API (no key required for basic usage)
    const response = await axios.get(`https://api.api-ninjas.com/v1/horoscope?zodiac=${sign}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.data && response.data.horoscope) {
      return {
        sign: sign,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        reading: response.data.horoscope,
        love: Math.floor(Math.random() * 3) + 3, // 3-5 rating
        career: Math.floor(Math.random() * 3) + 3,
        health: Math.floor(Math.random() * 3) + 3,
        spirituality: Math.floor(Math.random() * 3) + 3
      };
    }
    return null;
  } catch (error: any) {
    console.log(`API Ninjas failed for ${sign}:`, error?.message || error);
    return null;
  }
}

/**
 * Scrape horoscope from Astrology.com (fallback source)
 */
async function getHoroscopeFromAstrologyCom(sign: string): Promise<HoroscopeResult | null> {
  try {
    const url = `https://www.astrology.com/horoscope/daily/${sign}.html`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Try multiple selectors to find horoscope content
    let horoscopeText = '';
    
    // Common selectors for horoscope content
    const selectors = [
      '.horoscope-content p',
      '.daily-horoscope p',
      '.horoscope-text',
      '[data-testid="horoscope-content"]',
      '.entry-content p:first-of-type',
      'p[class*="horoscope"]'
    ];
    
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 50) {
        horoscopeText = element.text().trim();
        break;
      }
    }
    
    if (horoscopeText && horoscopeText.length > 30) {
      return {
        sign: sign,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        reading: horoscopeText,
        love: Math.floor(Math.random() * 3) + 3,
        career: Math.floor(Math.random() * 3) + 3,
        health: Math.floor(Math.random() * 3) + 3,
        spirituality: Math.floor(Math.random() * 3) + 3
      };
    }
    return null;
  } catch (error: any) {
    console.log(`Astrology.com scraping failed for ${sign}:`, error?.message || error);
    return null;
  }
}

/**
 * Get horoscope with multiple fallback sources
 */
export async function fetchDailyHoroscope(sign: string): Promise<HoroscopeResult> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${sign}-${today}`;
  
  // Check cache first
  const cached = dailyHoroscopeCache.get(cacheKey);
  if (cached && cached.date === today) {
    return cached.data;
  }
  
  console.log(`Fetching fresh horoscope for ${sign}...`);
  
  // Try API Ninjas first (free and reliable)
  let horoscope = await getHoroscopeFromAPINinjas(sign);
  
  // Fallback to scraping if API fails
  if (!horoscope) {
    console.log(`Trying fallback scraping for ${sign}...`);
    horoscope = await getHoroscopeFromAstrologyCom(sign);
  }
  
  // Final fallback to generated content
  if (!horoscope) {
    console.log(`Using generated fallback for ${sign}`);
    horoscope = getFallbackHoroscope(sign);
  }
  
  // Cache the result
  dailyHoroscopeCache.set(cacheKey, {
    data: horoscope,
    date: today
  });
  
  console.log(`✓ Horoscope cached for ${sign}`);
  return horoscope;
}

/**
 * Fallback horoscope generator with quality content
 */
function getFallbackHoroscope(sign: string): HoroscopeResult {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const horoscopes: Record<string, string> = {
    aries: "Your pioneering spirit is especially strong today. Take initiative in areas where others hesitate. Bold decisions made now will benefit you in the long term. Trust your instincts when it comes to new opportunities.",
    taurus: "Stability and comfort are your focus today. Material security becomes important, and your practical nature will guide you well. Take time to appreciate the simple pleasures in life and strengthen existing relationships.",
    gemini: "Communication flows effortlessly today. Your curiosity leads to fascinating discoveries and meaningful connections. Embrace flexibility as circumstances shift, and trust your ability to adapt quickly.",
    cancer: "Your intuitive abilities are heightened today. Pay attention to subtle emotional undercurrents in your relationships. Home and family matters may require your nurturing touch and understanding.",
    leo: "Your natural charisma shines brightly today. Creative projects receive positive attention, and your leadership qualities inspire others. Take center stage when opportunities arise, but remain gracious.",
    virgo: "Attention to detail serves you well today. Organization and methodical approaches yield excellent results. Health and wellness routines benefit from your careful consideration and implementation.",
    libra: "Balance and harmony guide your decisions today. Relationships benefit from your diplomatic approach and fair-minded perspective. Beauty and aesthetics play an important role in your environment.",
    scorpio: "Deep insights and transformative experiences mark this day. Your investigative nature uncovers hidden truths. Embrace emotional intensity as a path to personal growth and understanding.",
    sagittarius: "Adventure and expansion call to you today. Your optimistic outlook attracts positive opportunities. Learning and teaching bring fulfillment, and distant horizons capture your imagination.",
    capricorn: "Discipline and determination drive your success today. Long-term goals receive your focused attention. Your natural authority and organizational skills help others achieve their objectives too.",
    aquarius: "Innovation and original thinking set you apart today. Humanitarian causes resonate with your idealistic nature. Technology and progressive ideas play a significant role in your activities.",
    pisces: "Intuition and creativity flow strongly today. Your compassionate nature draws others to seek your guidance. Artistic pursuits and spiritual practices provide deep satisfaction and insight."
  };
  
  return {
    sign: sign,
    date: today,
    reading: horoscopes[sign] || horoscopes.aries,
    love: Math.floor(Math.random() * 3) + 3,
    career: Math.floor(Math.random() * 3) + 3,
    health: Math.floor(Math.random() * 3) + 3,
    spirituality: Math.floor(Math.random() * 3) + 3
  };
}

/**
 * Pre-fetch all horoscopes at midnight (12 AM)
 */
export function startDailyHoroscopeCron() {
  console.log('🔮 Starting daily horoscope cron job...');
  
  // Run at 12:00 AM every day
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Daily horoscope refresh started at 12:00 AM');
    
    // Clear old cache
    dailyHoroscopeCache.clear();
    
    // Pre-fetch all zodiac signs
    const promises = zodiacSigns.map(async (sign) => {
      try {
        await fetchDailyHoroscope(sign);
        console.log(`✓ Pre-cached horoscope for ${sign}`);
      } catch (error: any) {
        console.error(`❌ Failed to pre-cache horoscope for ${sign}:`, error?.message || error);
      }
    });
    
    await Promise.all(promises);
    console.log('🎯 Daily horoscope refresh completed');
  }, {
    timezone: "UTC"
  });
  
  // Also run immediately on startup to populate cache
  setTimeout(async () => {
    console.log('🚀 Pre-populating horoscope cache on startup...');
    const promises = zodiacSigns.slice(0, 3).map(async (sign) => {
      try {
        await fetchDailyHoroscope(sign);
      } catch (error: any) {
        console.error(`Failed to pre-populate ${sign}:`, error?.message || error);
      }
    });
    await Promise.all(promises);
    console.log('✅ Startup horoscope cache population completed');
  }, 2000);
  
  console.log('✅ Daily horoscope cron job initialized');
}

/**
 * Get cached horoscope or fetch if not available
 */
export function getCachedHoroscope(sign: string): HoroscopeResult | null {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${sign}-${today}`;
  const cached = dailyHoroscopeCache.get(cacheKey);
  
  return cached && cached.date === today ? cached.data : null;
}