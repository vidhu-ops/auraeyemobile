import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeAuraImage, generateNumerologyReading } from "./api/openai";
import { analyzeImageWithGemini } from "./api/gemini";
import { getHoroscopeForSign, calculateNumerologyProfile } from "./api/horoscope";
import { configureFileUpload } from "./api/upload";
import { NumerologyResult } from "../client/src/lib/openai";
import { sendHealerBookingNotification } from "./email-service";
import { insertHealerSchema, insertHealerBookingSchema, insertJournalSchema } from "../shared/schema";

// Function to generate deterministic aura analysis based on image hash
function generateDeterministicAuraAnalysis(imageBuffer: Buffer) {
  const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
  const seed = parseInt(hash.substring(0, 8), 16);
  
  // Enhanced aura colors with accurate hex values
  const auraColors = [
    { name: "Red", hex: "#FF0000", meaning: "Passion, vitality, grounding energy" },
    { name: "Orange", hex: "#FF7F00", meaning: "Creativity, enthusiasm, emotional balance" }, 
    { name: "Yellow", hex: "#FFFF00", meaning: "Intelligence, optimism, personal power" },
    { name: "Green", hex: "#00FF00", meaning: "Healing, love, growth, heart-centered energy" },
    { name: "Blue", hex: "#0080FF", meaning: "Communication, truth, peace, intuition" },
    { name: "Indigo", hex: "#4B0082", meaning: "Psychic ability, deep intuition, wisdom" },
    { name: "Violet", hex: "#8A2BE2", meaning: "Spiritual connection, transformation, mysticism" },
    { name: "Purple", hex: "#800080", meaning: "Spiritual awareness, nobility, magic" },
    { name: "Pink", hex: "#FF69B4", meaning: "Unconditional love, compassion, nurturing" },
    { name: "Gold", hex: "#FFD700", meaning: "Divine wisdom, enlightenment, abundance" },
    { name: "Silver", hex: "#C0C0C0", meaning: "Intuitive gifts, feminine energy, reflection" },
    { name: "Turquoise", hex: "#40E0D0", meaning: "Healing communication, emotional clarity" }
  ];
  
  // Enhanced secondary/tertiary colors
  const secondaryColors = [
    { name: "White", hex: "#FFFFFF", meaning: "Purity, protection, divine connection" },
    { name: "Lavender", hex: "#E6E6FA", meaning: "Gentle spirituality, peace, calm" },
    { name: "Coral", hex: "#FF7F50", meaning: "Gentle passion, warmth, social energy" },
    { name: "Mint", hex: "#98FB98", meaning: "Fresh healing energy, renewal, growth" },
    { name: "Peach", hex: "#FFCBA4", meaning: "Gentle love, caring, emotional warmth" },
    { name: "Sky Blue", hex: "#87CEEB", meaning: "Clear communication, freedom, openness" },
    { name: "Rose", hex: "#FF66CC", meaning: "Deep love, emotional healing, romance" },
    { name: "Amber", hex: "#FFBF00", meaning: "Ancient wisdom, protection, grounding" }
  ];
  
  // Enhanced personality traits with deeper meanings
  const personalityTraits = [
    ["Creative", "Artistic", "Passionate", "Expressive"],
    ["Calm", "Peaceful", "Balanced", "Harmonious"],
    ["Energetic", "Dynamic", "Inspiring", "Motivating"],
    ["Intuitive", "Mystical", "Spiritual", "Visionary"],
    ["Healing", "Nurturing", "Compassionate", "Empathetic"],
    ["Strong", "Confident", "Protective", "Grounded"],
    ["Wise", "Analytical", "Thoughtful", "Insightful"],
    ["Joyful", "Optimistic", "Uplifting", "Radiant"]
  ];
  
  const dominantIndex = seed % auraColors.length;
  const secondaryIndex = (seed >> 4) % secondaryColors.length;
  const tertiaryIndex = (seed >> 8) % auraColors.length;
  const quaternaryIndex = (seed >> 12) % secondaryColors.length;
  const traitsIndex = (seed >> 16) % personalityTraits.length;
  const energyLevel = 4 + (seed % 7); // Energy level between 4-10
  
  const selectedDominant = auraColors[dominantIndex];
  const selectedSecondary = secondaryColors[secondaryIndex];
  const selectedTertiary = auraColors[tertiaryIndex];
  const selectedQuaternary = secondaryColors[quaternaryIndex];
  const selectedTraits = personalityTraits[traitsIndex];
  
  // Create a spectrum of at least 4 unique colors
  const auraColorSpectrum = [selectedDominant.name, selectedSecondary.name];
  if (!auraColorSpectrum.includes(selectedTertiary.name)) {
    auraColorSpectrum.push(selectedTertiary.name);
  }
  if (!auraColorSpectrum.includes(selectedQuaternary.name)) {
    auraColorSpectrum.push(selectedQuaternary.name);
  }
  
  // Ensure we have at least 4 colors
  while (auraColorSpectrum.length < 4) {
    const additionalColor = auraColors[(seed + auraColorSpectrum.length) % auraColors.length];
    if (!auraColorSpectrum.includes(additionalColor.name)) {
      auraColorSpectrum.push(additionalColor.name);
    }
  }
  
  // Create aura layer colors for multi-dimensional analysis
  const auraLayerColors = {
    inner: selectedDominant.name,
    middle: selectedSecondary.name,
    outer: auraColorSpectrum[2]
  };
  
  // Generate deterministic chakra activity based on seed
  const baseChakraValue = 4 + (seed % 4); // Base value between 4-7
  const chakraActivity = {
    root: baseChakraValue + ((seed >> 12) % 3),
    sacral: baseChakraValue + ((seed >> 15) % 3),
    solarPlexus: baseChakraValue + ((seed >> 18) % 3),
    heart: baseChakraValue + ((seed >> 21) % 3),
    throat: baseChakraValue + ((seed >> 24) % 3),
    thirdEye: baseChakraValue + ((seed >> 27) % 3),
    crown: baseChakraValue + ((seed >> 30) % 3)
  };

  // Enhanced spiritual guidance based on color combinations
  const colorMeanings = `${selectedDominant.meaning} combined with ${selectedSecondary.meaning}`;
  const detailedAnalysis = `Your aura displays a rich spectrum of ${auraColorSpectrum.length} colors, with ${selectedDominant.name} as your dominant energy (${selectedDominant.meaning}) and ${selectedSecondary.name} as your supporting energy (${selectedSecondary.meaning}). The presence of ${selectedTertiary.name} in your aura adds ${selectedTertiary.meaning}, while ${auraColorSpectrum[3]} brings ${auraColors.find(c => c.name === auraColorSpectrum[3])?.meaning || 'additional spiritual depth'}. This multi-layered energy signature indicates ${selectedTraits.join(', ').toLowerCase()} qualities in your spiritual nature.`;

  return {
    dominantColor: selectedDominant.name,
    secondaryColor: selectedSecondary.name,
    auraColorSpectrum: auraColorSpectrum,
    auraLayerColors: auraLayerColors,
    personalityTraits: selectedTraits,
    energyLevel: energyLevel,
    spiritualGuidance: `Your ${selectedDominant.name.toLowerCase()} dominant aura with ${selectedSecondary.name.toLowerCase()} secondary tones suggests ${selectedTraits.join(', ').toLowerCase()} energy patterns. ${colorMeanings}.`,
    detailedAnalysis: detailedAnalysis,
    chakraActivity: chakraActivity,
    colorMeanings: {
      [selectedDominant.name]: selectedDominant.meaning,
      [selectedSecondary.name]: selectedSecondary.meaning,
      [selectedTertiary.name]: selectedTertiary.meaning,
      [auraColorSpectrum[3]]: auraColors.find(c => c.name === auraColorSpectrum[3])?.meaning || secondaryColors.find(c => c.name === auraColorSpectrum[3])?.meaning || 'Spiritual enhancement'
    },
    colorHexValues: {
      [selectedDominant.name]: selectedDominant.hex,
      [selectedSecondary.name]: selectedSecondary.hex,
      [selectedTertiary.name]: selectedTertiary.hex,
      [auraColorSpectrum[3]]: auraColors.find(c => c.name === auraColorSpectrum[3])?.hex || secondaryColors.find(c => c.name === auraColorSpectrum[3])?.hex || '#FFFFFF'
    }
  };
}

// Function to generate deterministic analysis based on image hash
function generateDeterministicObjectAnalysis(imageBuffer: Buffer) {
  const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
  const seed = parseInt(hash.substring(0, 8), 16);
  
  // Deterministic object types based on hash
  const objectTypes = [
    "Crystal", "Stone", "Jewelry", "Artifact", "Ornament", "Talisman", 
    "Figurine", "Coin", "Ring", "Pendant", "Sculpture", "Charm"
  ];
  
  // Deterministic aura colors
  const auraColors = [
    "Red", "Blue", "Green", "Yellow", "Purple", "Orange", 
    "Pink", "Violet", "Indigo", "Gold", "Silver", "Turquoise"
  ];
  
  // Deterministic energy qualities
  const energyQualities = [
    ["Calming", "Protective", "Grounding"],
    ["Energizing", "Inspiring", "Creative"],
    ["Healing", "Nurturing", "Compassionate"],
    ["Intuitive", "Mystical", "Spiritual"],
    ["Balancing", "Harmonizing", "Peaceful"],
    ["Empowering", "Confident", "Strong"]
  ];
  
  const objectTypeIndex = seed % objectTypes.length;
  const auraColorIndex = (seed >> 4) % auraColors.length;
  const energyIndex = (seed >> 8) % energyQualities.length;
  const energyLevel = 3 + (seed % 8); // Energy level between 3-10
  
  const selectedObjectType = objectTypes[objectTypeIndex] || "Crystal";
  const selectedAuraColor = auraColors[auraColorIndex] || "Purple";
  const selectedQualities = energyQualities[energyIndex] || ["Calming", "Protective", "Grounding"];
  
  // Ensure we have valid qualities
  const primaryQuality = selectedQualities[0] || "Calming";
  const qualitiesText = selectedQualities.length > 0 ? selectedQualities.join(', ') : "Calming, Protective";
  
  return {
    objectName: selectedObjectType,
    objectDescription: `This ${selectedObjectType.toLowerCase()} exhibits distinctive spiritual energy patterns and appears to be energetically active.`,
    objectPurpose: `This ${selectedObjectType.toLowerCase()} appears designed to enhance ${primaryQuality.toLowerCase()} energy and promote spiritual awareness.`,
    auraColor: selectedAuraColor,
    auraDescription: `The object emanates a ${selectedAuraColor.toLowerCase()} aura, suggesting ${qualitiesText.toLowerCase()} properties.`,
    energyLevel: energyLevel,
    energyQualities: selectedQualities,
    historicalSignificance: `Objects of this type have historically been used in spiritual practices for their ${primaryQuality.toLowerCase()} properties.`,
    spiritualSignificance: `This object resonates with energies that promote ${qualitiesText.toLowerCase()} states of being.`,
    detailedAnalysis: `The energy signature reveals a ${selectedAuraColor.toLowerCase()} dominant frequency with ${qualitiesText.toLowerCase()} undertones. This suggests the object can be used for meditation, energy work, and spiritual development practices.`
  };
}

// Helper functions for numerology calculations
function getColorForNumber(num: number): string {
  const colorMap: { [key: number]: string } = {
    1: "Red",
    2: "Orange", 
    3: "Yellow",
    4: "Green",
    5: "Blue",
    6: "Indigo",
    7: "Violet",
    8: "Gold",
    9: "White"
  };
  return colorMap[num] || "Indigo";
}

function letterToNumber(letter: string): number {
  const value = letter.toLowerCase().charCodeAt(0) - 96;
  return value >= 1 && value <= 26 ? value : 0;
}

function reduceNumber(num: number): number {
  // Master numbers are preserved
  if (num === 11 || num === 22 || num === 33) return num;
  
  // Reduce to single digit
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function calculateLifePath(date: string): number {
  // Format should be YYYY-MM-DD
  const parts = date.split('-');
  if (parts.length !== 3) return 5; // Default fallback
  
  const year = parts[0].split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  return reduceNumber(reduceNumber(year) + reduceNumber(month) + reduceNumber(day));
}

function calculateDestiny(fullName: string): number {
  let sum = 0;
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    sum += letterToNumber(char);
  }
  return reduceNumber(sum);
}

function calculateSoulUrge(fullName: string): number {
  let sum = 0;
  const vowels = 'aeiouAEIOU';
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    if (vowels.includes(char)) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

function calculatePersonality(fullName: string): number {
  let sum = 0;
  const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    if (consonants.includes(char)) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

function calculateSoulChakra(birthDate: string): number {
  // Use life path calculation for soul chakra as they're spiritually connected
  return calculateLifePath(birthDate);
}

import { seedHealers } from "./seed-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up user authentication routes
  setupAuth(app);
  
  // Seed initial healer data
  await seedHealers();

  // Configure file upload
  const upload = configureFileUpload();

  // API routes
  // Object Analysis API endpoint
  app.post("/api/analyze-object", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Use deterministic analysis based on image hash for consistent results
      const deterministicResult = generateDeterministicObjectAnalysis(req.file.buffer);
      res.json(deterministicResult);
    } catch (error) {
      console.error("Error processing object analysis:", error);
      res.status(500).json({ message: "An error occurred during analysis" });
    }
  });

  // Aura Analysis API endpoint
  app.post("/api/analyze-aura", upload.single("image"), async (req, res) => {
    try {
      // Get image data either from file or base64 string
      let imageData: string;
      
      if (req.file) {
        // If image was uploaded as file
        imageData = req.file.buffer.toString("base64");
      } else if (req.body.image) {
        // If image was sent as base64 string
        imageData = req.body.image;
      } else {
        return res.status(400).json({ message: "No image provided" });
      }

      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? req.user?.id : null;
      
      // Check if this is specifically for detecting visible aura colors in special photographs
      const detectVisibleAura = req.body.detectVisibleAura === true;
      
      // Custom prompt for aura detection in photographs with visible auras
      let customPrompt = null;
      if (detectVisibleAura) {
        customPrompt = `You are an expert aura reader analyzing a special aura photograph. 
        These photographs are taken with special equipment that captures the actual aura colors around people.
        
        IMPORTANT: In these photographs, the colored glow/haze surrounding the person IS their actual aura.
        Focus ONLY on the colored light surrounding the person - this is the true aura.
        Do NOT focus on clothing colors, background, or other elements.
        
        Analyze the visible aura colors (the glowing/hazy colored field around the person) and provide a detailed spiritual interpretation.
        Describe how the specific colors seen in the aura relate to the person's energy, personality, and spiritual state.`;
      }

      // Use deterministic analysis based on image hash for consistent results
      let imageBuffer: Buffer;
      if (req.file) {
        imageBuffer = req.file.buffer;
      } else {
        // Convert base64 to buffer for hash calculation
        imageBuffer = Buffer.from(imageData, 'base64');
      }
      
      const auraAnalysis = generateDeterministicAuraAnalysis(imageBuffer);

      // Save the analysis to storage if user is authenticated
      if (userId) {
        await storage.saveAuraReading({
          userId,
          imageUrl: "data:image/jpeg;base64," + imageData.substring(0, 100), // Store a truncated version or reference
          dominantColor: auraAnalysis.dominantColor,
          secondaryColor: auraAnalysis.secondaryColor || "",
          energyLevel: auraAnalysis.energyLevel,
          analysis: JSON.stringify(auraAnalysis)
        });
      }

      res.json(auraAnalysis);
    } catch (error) {
      console.error("Error analyzing aura:", error);
      
      // Even if everything fails, provide a fallback response
      const fallbackResult = {
        dominantColor: "Indigo",
        secondaryColor: "Violet",
        energyLevel: 4,
        personalityTraits: ["Intuitive", "Visionary", "Sensitive", "Spiritual"],
        spiritualGuidance: "Your aura indicates a strong connection to your intuition and higher guidance. Continue to develop your spiritual practices and trust your inner wisdom.",
        chakraActivity: {
          root: 5,
          sacral: 6,
          solarPlexus: 5,
          heart: 7,
          throat: 6,
          thirdEye: 9,
          crown: 8
        },
        detailedAnalysis: "The colors in your aura reveal a person with strong intuitive and psychic abilities. You likely sense energies around you and may have experienced spiritual insights or visions. Your challenge is to remain grounded while exploring higher consciousness. Regular meditation will help integrate your spiritual experiences."
      };
      
      res.json(fallbackResult);
    }
  });

  // Fallback to Gemini for aura analysis if OpenAI fails
  app.post("/api/gemini-analyze", upload.single("image"), async (req, res) => {
    try {
      let imageData: string;
      
      if (req.file) {
        imageData = req.file.buffer.toString("base64");
      } else if (req.body.image) {
        imageData = req.body.image;
      } else {
        return res.status(400).json({ message: "No image provided" });
      }

      try {
        const geminiAnalysis = await analyzeImageWithGemini(imageData);
        res.json(geminiAnalysis);
      } catch (aiError) {
        console.error("Error with Gemini analysis, using fallback:", aiError);
        // Provide a fallback response if Gemini API fails
        const fallbackResult = {
          dominantColor: "Gold",
          secondaryColor: "Green",
          energyLevel: 4,
          personalityTraits: ["Creative", "Nurturing", "Compassionate", "Grounded"],
          spiritualGuidance: "Your aura shows a blend of abundance energy (gold) and healing capacity (green). This combination suggests you're in a phase of spiritual growth that's connected to both material prosperity and heart-centered healing. Focus on balancing giving and receiving in your life.",
          chakraActivity: {
            root: 6,
            sacral: 7,
            solarPlexus: 8,
            heart: 9,
            throat: 5,
            thirdEye: 6,
            crown: 7
          },
          detailedAnalysis: "The gold in your aura indicates abundance consciousness and spiritual wisdom. This is complemented by the healing green energy that flows from your heart center. Together, these colors reveal a person who can manifest prosperity while maintaining compassion and connection to others. Your heart chakra is particularly active, suggesting that love and healing are central themes in your life right now. The high activity in your solar plexus indicates strong personal power and confidence. Continue to develop these balanced energies through both grounding practices (like walking in nature) and heart-opening exercises (such as loving-kindness meditation)."
        };
        res.json(fallbackResult);
      }
    } catch (error) {
      console.error("Error processing image for Gemini analysis:", error);
      // Even if everything fails, still return a result
      const emergencyFallback = {
        dominantColor: "Turquoise",
        secondaryColor: "Pink",
        energyLevel: 3,
        personalityTraits: ["Intuitive", "Healing", "Compassionate", "Balanced"],
        spiritualGuidance: "Your aura shows a beautiful blend of healing energy and compassionate love. Continue to nurture both yourself and others while maintaining healthy boundaries.",
        chakraActivity: {
          root: 5,
          sacral: 6,
          solarPlexus: 5,
          heart: 8,
          throat: 7,
          thirdEye: 6,
          crown: 5
        },
        detailedAnalysis: "The combination of turquoise and pink in your aura reveals someone with both healing abilities and a compassionate heart. You naturally tune into others' emotional states and may often find yourself in supportive, nurturing roles. Your strong heart chakra suggests that love and connection are important values for you. Balance your giving nature with self-care practices that replenish your energy."
      };
      res.json(emergencyFallback);
    }
  });

  // Daily horoscope endpoint
  app.get("/api/horoscope/:sign", async (req, res) => {
    try {
      const sign = req.params.sign.toLowerCase();
      const validSigns = [
        "aries", "taurus", "gemini", "cancer", "leo", "virgo",
        "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
      ];
      
      if (!validSigns.includes(sign)) {
        return res.status(400).json({ message: "Invalid zodiac sign" });
      }
      
      const horoscope = await getHoroscopeForSign(sign);
      res.json(horoscope);
    } catch (error) {
      console.error("Error getting horoscope:", error);
      res.status(500).json({ message: "Failed to get horoscope" });
    }
  });

  // Numerology calculation endpoints
  app.post("/api/numerology", async (req, res) => {
    try {
      const { name, birthDate } = req.body;
      
      console.log('Received numerology request:', { name, birthDate });
      
      if (!name || !birthDate) {
        return res.status(400).json({ message: "Name and birth date are required" });
      }
      
      let numerologyProfile: NumerologyResult;
      
      try {
        // Try using the API-based calculation
        numerologyProfile = await calculateNumerologyProfile(name, birthDate);
        
        console.log('Returning numerology profile:', numerologyProfile);
        
        // Save the numerology reading if user is authenticated
        if (req.isAuthenticated() && req.user) {
          await storage.saveNumerologyReading({
            userId: req.user.id,
            name,
            birthDate,
            lifePathNumber: numerologyProfile.lifePathNumber,
            destinyNumber: numerologyProfile.destinyNumber,
            soulUrgeNumber: numerologyProfile.soulUrgeNumber,
            personalityNumber: numerologyProfile.personalityNumber,
            interpretation: numerologyProfile.interpretation
          });
        }
      } catch (apiError) {
        console.error("Numerology API error, using fallback:", apiError);
        
        // Create a fallback calculation
        numerologyProfile = {
          lifePathNumber: calculateLifePath(birthDate),
          destinyNumber: calculateDestiny(name),
          soulUrgeNumber: calculateSoulUrge(name),
          personalityNumber: calculatePersonality(name),
          soulChakraNumber: calculateDominantSoulChakra(birthDate),
          interpretation: `Your Life Path Number ${calculateLifePath(birthDate)} indicates your life's journey. Your Destiny Number ${calculateDestiny(name)} reveals your goals and abilities. Your Soul Urge Number ${calculateSoulUrge(name)} shows your inner desires, while your Personality Number ${calculatePersonality(name)} represents how others see you. Your Soul Chakra Number ${calculateDominantSoulChakra(birthDate)} reveals your spiritual energy center.`,
          colorAssociations: {
            lifePathColor: getColorForNumber(calculateLifePath(birthDate)),
            destinyColor: getColorForNumber(calculateDestiny(name)),
            soulUrgeColor: getColorForNumber(calculateSoulUrge(name)),
            personalityColor: getColorForNumber(calculatePersonality(name)),
            soulChakraColor: getColorForNumber(calculateDominantSoulChakra(birthDate))
          },
          strengths: [
            `Natural ${getColorForNumber(calculateLifePath(birthDate))} energy enhances your leadership abilities`,
            `Your ${getColorForNumber(calculateDestiny(name))} vibration amplifies your communication skills`,
            `The ${getColorForNumber(calculateSoulUrge(name))} influence strengthens your intuitive abilities`
          ],
          challenges: [
            `Balancing ${getColorForNumber(calculateLifePath(birthDate))} intensity in daily interactions`,
            `Integrating ${getColorForNumber(calculateDestiny(name))} energy with practical matters`,
            `Managing the sensitivity that comes with ${getColorForNumber(calculateSoulUrge(name))} vibrations`
          ],
          guidance: `Focus on harmonizing the ${getColorForNumber(calculateLifePath(birthDate))} and ${getColorForNumber(calculateDestiny(name))} energies in your numerological blueprint for optimal growth and spiritual development.`
        };
        
        if (req.isAuthenticated() && req.user) {
          await storage.saveNumerologyReading({
            userId: req.user.id,
            name,
            birthDate,
            lifePathNumber: numerologyProfile.lifePathNumber,
            destinyNumber: numerologyProfile.destinyNumber,
            soulUrgeNumber: numerologyProfile.soulUrgeNumber,
            personalityNumber: numerologyProfile.personalityNumber,
            interpretation: numerologyProfile.interpretation
          });
        }
      }
      
      res.json(numerologyProfile);
    } catch (error) {
      console.error("Error calculating numerology:", error);
      
      // Ultimate fallback - always return something
      const emergencyFallback = {
        lifePathNumber: 7,
        destinyNumber: 4,
        soulUrgeNumber: 3,
        personalityNumber: 5,
        soulChakraNumber: 7,
        interpretation: "Your numerology reading indicates a balanced combination of analytical thinking (7), practical stability (4), creative expression (3), and adaptability (5). This blend of energies supports both spiritual growth and material achievement.",
        colorAssociations: {
          lifePathColor: "Violet",
          destinyColor: "Green",
          soulUrgeColor: "Yellow",
          personalityColor: "Blue",
          soulChakraColor: "Violet"
        }
      };
      
      res.json(emergencyFallback);
    }
  });
  
  app.post("/api/calculate-numerology", async (req, res) => {
    try {
      const { name, birthDate } = req.body;
      
      if (!name || !birthDate) {
        return res.status(400).json({ message: "Name and birth date are required" });
      }
      
      let numerologyProfile: NumerologyResult;
      
      try {
        // Try using the API-based calculation
        numerologyProfile = await calculateNumerologyProfile(name, birthDate);
        
        // Save the numerology reading if user is authenticated
        if (req.isAuthenticated() && req.user) {
          await storage.saveNumerologyReading({
            userId: req.user.id,
            name,
            birthDate,
            lifePathNumber: numerologyProfile.lifePathNumber,
            destinyNumber: numerologyProfile.destinyNumber,
            soulUrgeNumber: numerologyProfile.soulUrgeNumber,
            personalityNumber: numerologyProfile.personalityNumber,
            interpretation: numerologyProfile.interpretation
          });
        }
      } catch (apiError) {
        // Already using algorithmic calculation as fallback in the API
        console.error("Numerology error:", apiError);
        
        // Create a fallback in case the API function completely fails
        numerologyProfile = {
          lifePathNumber: calculateLifePath(birthDate),
          destinyNumber: calculateDestiny(name),
          soulUrgeNumber: calculateSoulUrge(name),
          personalityNumber: calculateDecisionMakingChakra(birthDate),
          soulChakraNumber: calculateDominantSoulChakra(birthDate),
          interpretation: "Based on your name and birth date, your numerological profile shows a balanced blend of energies. Your life path guides you toward personal growth and fulfillment."
        };
        
        if (req.isAuthenticated() && req.user) {
          await storage.saveNumerologyReading({
            userId: req.user.id,
            name,
            birthDate,
            ...numerologyProfile
          });
        }
      }
      
      res.json(numerologyProfile);
    } catch (error) {
      console.error("Error calculating numerology:", error);
      
      // Ultimate fallback - always return something
      const emergencyFallback = {
        lifePathNumber: 7,
        destinyNumber: 4,
        soulUrgeNumber: 3,
        personalityNumber: 5,
        interpretation: "Your numerology reading indicates a balanced combination of analytical thinking (7), practical stability (4), creative expression (3), and adaptability (5). This blend of energies supports both spiritual growth and material achievement."
      };
      
      res.json(emergencyFallback);
    }
  });
  
// Helper functions for fallback numerology calculations
function calculateLifePath(date: string): number {
  // Format should be YYYY-MM-DD
  const parts = date.split('-');
  if (parts.length !== 3) return 5; // Default fallback
  
  const year = parts[0].split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  return reduceNumber(reduceNumber(year) + reduceNumber(month) + reduceNumber(day));
}

function calculateDestiny(fullName: string): number {
  let sum = 0;
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    sum += letterToNumber(char);
  }
  return reduceNumber(sum);
}

function calculateSoulUrge(fullName: string): number {
  let sum = 0;
  for (const char of fullName.toLowerCase()) {
    if ('aeiou'.includes(char)) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

function calculatePersonality(fullName: string): number {
  let sum = 0;
  const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    if (consonants.includes(char)) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

// Decision-making chakra (Personality) number - sum of the two digits of birth date
function calculateDecisionMakingChakra(birthDate: string): number {
  const parts = birthDate.split('-');
  if (parts.length !== 3) return 5; // Default fallback
  
  const day = parseInt(parts[2]);
  const dayString = day.toString();
  
  if (dayString.length === 1) {
    return day;
  } else {
    const firstDigit = parseInt(dayString[0]);
    const secondDigit = parseInt(dayString[1]);
    return reduceNumber(firstDigit + secondDigit);
  }
}

// Dominant Soul Chakra number - addition of all digits in birth date
function calculateDominantSoulChakra(birthDate: string): number {
  const parts = birthDate.split('-');
  if (parts.length !== 3) return 7; // Default fallback
  
  let sum = 0;
  // Add all digits from year, month, and day
  for (const part of parts) {
    for (const digit of part) {
      sum += parseInt(digit);
    }
  }
  
  return reduceNumber(sum);
}

function getColorForNumber(num: number): string {
  const colorMap: { [key: number]: string } = {
    1: "Red",
    2: "Orange", 
    3: "Yellow",
    4: "Green",
    5: "Blue",
    6: "Indigo",
    7: "Violet",
    8: "Gold",
    9: "White"
  };
  return colorMap[num] || "Indigo";
}

function letterToNumber(letter: string): number {
  const value = letter.toLowerCase().charCodeAt(0) - 96;
  return value >= 1 && value <= 26 ? value : 0;
}

function reduceNumber(num: number): number {
  // Master numbers are preserved
  if (num === 11 || num === 22 || num === 33) return num;
  
  // Reduce to single digit
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function calculateDominantSoulChakra(birthDate: string): number {
  // Sum all digits in birth date (e.g., 01/01/1901 = 0+1+0+1+1+9+0+1 = 13 = 1+3 = 4)
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
}

  // Healers API endpoints
  app.get("/api/healers", async (req, res) => {
    try {
      const healers = await storage.getAllHealers();
      res.json(healers);
    } catch (error) {
      console.error("Error fetching healers:", error);
      res.status(500).json({ message: "Failed to fetch healers" });
    }
  });

  app.post("/api/healers", async (req, res) => {
    try {
      const healerData = insertHealerSchema.parse(req.body);
      const healer = await storage.createHealer(healerData);
      res.status(201).json(healer);
    } catch (error) {
      console.error("Error creating healer:", error);
      res.status(500).json({ message: "Failed to create healer" });
    }
  });

  // Healer booking API endpoint with email notification
  app.post("/api/book-session", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { healerId, message } = req.body;
      
      // Get healer details
      const healer = await storage.getHealer(healerId);
      if (!healer) {
        return res.status(404).json({ message: "Healer not found" });
      }

      // Create booking record
      const bookingData = insertHealerBookingSchema.parse({
        userId: user.id,
        healerId: healerId,
        message: message || null
      });
      
      const booking = await storage.createHealerBooking(bookingData);

      // Send email notification to healer
      const emailSent = await sendHealerBookingNotification(
        healer.email,
        healer.name,
        user.username,
        message
      );

      if (!emailSent) {
        console.log("Email notification failed, but booking was saved");
      }

      res.status(201).json({ 
        message: "Booking request sent successfully",
        booking: booking,
        emailSent: emailSent
      });
    } catch (error) {
      console.error("Error processing booking:", error);
      res.status(500).json({ message: "Failed to process booking" });
    }
  });

  // Journal entries API endpoints
  app.post("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { energyLevel, reflections, gratitude } = req.body;
      
      if (energyLevel === undefined || !reflections) {
        return res.status(400).json({ message: "Energy level and reflections are required" });
      }
      
      // Format gratitude entries into a string
      let gratitudeText = "";
      if (Array.isArray(req.body.gratitude)) {
        gratitudeText = req.body.gratitude.filter(Boolean).join('; ');
      } else if (typeof req.body.gratitude === 'object') {
        // Handle object format like {gratitude1: "...", gratitude2: "...", gratitude3: "..."}
        const entries = Object.values(req.body.gratitude).filter(Boolean);
        gratitudeText = entries.join('; ');
      } else {
        gratitudeText = gratitude || "";
      }
      
      const journalEntry = await storage.createJournalEntry({
        userId: req.user.id,
        energyLevel,
        reflections,
        gratitude: gratitudeText
      });
      
      res.status(201).json(journalEntry);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      res.status(500).json({ message: "Failed to save journal entry" });
    }
  });

  app.get("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const journalEntries = await storage.getJournalEntriesByUser(req.user.id);
      res.json(journalEntries);
    } catch (error) {
      console.error("Error retrieving journal entries:", error);
      res.status(500).json({ message: "Failed to retrieve journal entries" });
    }
  });

  // Get user's aura readings
  app.get("/api/aura-readings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const auraReadings = await storage.getAuraReadingsByUser(req.user.id);
      res.json(auraReadings);
    } catch (error) {
      console.error("Error retrieving aura readings:", error);
      res.status(500).json({ message: "Failed to retrieve aura readings" });
    }
  });

  // Get user's numerology readings
  app.get("/api/numerology-readings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const numerologyReadings = await storage.getNumerologyReadingsByUser(req.user.id);
      res.json(numerologyReadings);
    } catch (error) {
      console.error("Error retrieving numerology readings:", error);
      res.status(500).json({ message: "Failed to retrieve numerology readings" });
    }
  });

  // API endpoint for calculating numerology based on name and birth date
  app.post("/api/numerology", async (req, res) => {
    try {
      console.log("Received numerology request:", req.body);
      const { name, birthDate } = req.body;
      
      if (!name || !birthDate) {
        return res.status(400).json({ message: "Name and birth date are required" });
      }

      // Helper functions for numerology calculations
      const reduceNumber = (num: number): number => {
        if (num === 11 || num === 22 || num === 33) return num;
        while (num > 9) {
          num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
      };

      const letterToNumber = (letter: string): number => {
        const value = letter.toLowerCase().charCodeAt(0) - 96;
        return value >= 1 && value <= 26 ? value : 0;
      };

      // Calculate Life Path Number
      const calculateLifePath = (date: string): number => {
        const [year, month, day] = date.split('-').map(part => 
          part.split('').reduce((sum, digit) => sum + parseInt(digit), 0)
        );
        return reduceNumber(reduceNumber(year) + reduceNumber(month) + reduceNumber(day));
      };

      // Calculate Destiny Number
      const calculateDestiny = (fullName: string): number => {
        let sum = 0;
        for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
          sum += letterToNumber(char);
        }
        return reduceNumber(sum);
      };

      // Calculate Soul Urge Number
      const calculateSoulUrge = (fullName: string): number => {
        let sum = 0;
        for (const char of fullName.toLowerCase()) {
          if ('aeiou'.includes(char)) {
            sum += letterToNumber(char);
          }
        }
        return reduceNumber(sum);
      };

      // Calculate Personality Number - based on month and day digits
      const calculatePersonality = (date: string): number => {
        const dateParts = date.split('-');
        if (dateParts.length !== 3) return 5;
        
        const month = dateParts[1]; // MM
        const day = dateParts[2]; // DD
        
        // Get all digits from month and day
        const digits = (month + day).split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        
        // Keep reducing until we get a single digit (1-9)
        while (sum > 9) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };

      // Calculate Soul Chakra Number - based on all birth date digits
      const calculateSoulChakra = (date: string): number => {
        // Remove hyphens and get all digits from the date
        const digits = date.replace(/-/g, '').split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        
        // Keep reducing until we get a single digit (1-9)
        while (sum > 9) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };

      // Calculate Dominant Soul Chakra Number - sum of all birth date digits
      const calculateDominantSoulChakra = (date: string): number => {
        // Remove hyphens and get all digits from the date (YYYY-MM-DD)
        const digits = date.replace(/-/g, '').split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        
        // Keep reducing until we get a single digit (1-9)
        while (sum > 9) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };

      // Calculate all numbers
      const lifePathNumber = calculateLifePath(birthDate);
      const destinyNumber = calculateDestiny(name);
      const soulUrgeNumber = calculateSoulUrge(name);
      const personalityNumber = calculatePersonality(birthDate);
      const soulChakraNumber = calculateDominantSoulChakra(birthDate);

      // Map a number to its color name
      const getColorName = (num: number): string => {
        const colorMap: Record<number, string> = {
          1: "Red",
          2: "Orange",
          3: "Yellow",
          4: "Green",
          5: "Blue",
          6: "Indigo",
          7: "Violet",
          8: "Pink",
          9: "Gold",
          11: "Silver",
          22: "Gold",
          33: "Platinum"
        };
        return colorMap[num] || "White";
      };

      // Create the return object with calculated values
      const numerologyProfile = {
        lifePathNumber,
        destinyNumber,
        soulUrgeNumber,
        personalityNumber,
        soulChakraNumber,
        interpretation: `Your Life Path Number ${lifePathNumber} indicates your life's journey. Your Destiny Number ${destinyNumber} reveals your goals and abilities. Your Soul Urge Number ${soulUrgeNumber} shows your inner desires, while your Personality Number ${personalityNumber} represents how others see you. Your Soul Chakra Number ${soulChakraNumber} reveals your spiritual energy center.`,
        // Add enhanced properties
        colorAssociations: {
          lifePathColor: getColorName(lifePathNumber),
          destinyColor: getColorName(destinyNumber),
          soulUrgeColor: getColorName(soulUrgeNumber),
          personalityColor: getColorName(personalityNumber),
          soulChakraColor: getColorName(soulChakraNumber)
        },
        // Add additional property examples for the enhanced UI
        strengths: [
          "Natural " + getColorName(lifePathNumber) + " energy enhances your leadership abilities",
          "Your " + getColorName(destinyNumber) + " vibration amplifies your communication skills",
          "The " + getColorName(soulUrgeNumber) + " influence strengthens your intuitive abilities"
        ],
        challenges: [
          "Balancing " + getColorName(lifePathNumber) + " intensity in daily interactions", 
          "Integrating " + getColorName(destinyNumber) + " energy with practical matters",
          "Managing the sensitivity that comes with " + getColorName(soulUrgeNumber) + " vibrations"
        ],
        guidance: "Focus on harmonizing the " + getColorName(lifePathNumber) + " and " + 
                 getColorName(destinyNumber) + " energies in your numerological blueprint for optimal growth and spiritual development."
      };
      
      // If user is authenticated, save the reading to their profile
      if (req.isAuthenticated()) {
        try {
          const readingToSave = {
            userId: req.user.id,
            name,
            birthDate,
            lifePathNumber,
            destinyNumber,
            soulUrgeNumber,
            personalityNumber,
            interpretation: numerologyProfile.interpretation
          };
          
          await storage.saveNumerologyReading(readingToSave);
        } catch (saveError) {
          console.error("Error saving numerology reading:", saveError);
          // Continue even if saving fails
        }
      }
      
      // Return the enhanced numerology profile
      console.log("Returning numerology profile:", numerologyProfile);
      res.json(numerologyProfile);
    } catch (error) {
      console.error("Error calculating numerology:", error);
      res.status(500).json({ message: "Failed to calculate numerology" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
