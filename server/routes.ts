import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeAuraImage, generateNumerologyReading } from "./api/openai";
import { analyzeImageWithGemini } from "./api/gemini";
import { getHoroscopeForSign, calculateNumerologyProfile } from "./api/horoscope";
import { configureFileUpload } from "./api/upload";
import { NumerologyResult } from "../client/src/lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up user authentication routes
  setupAuth(app);

  // Configure file upload
  const upload = configureFileUpload();

  // API routes
  // Object Analysis API endpoint
  app.post("/api/analyze-object", upload.single("image"), async (req, res) => {
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
      
      try {
        // Use OpenAI to analyze the object
        const prompt = "Analyze this object in the image and identify exactly what type of object it is. Give detailed information about it, including its potential purpose, materials, and intuitively understand and describe the aura or energy of the object.";
        
        // Call OpenAI with the prompt
        // Note: We're using the same analyzeAuraImage function but with a different prompt
        // In a production app, you'd want to create a separate function for object analysis
        let objectAnalysis;
        try {
          objectAnalysis = await analyzeAuraImage(imageData, prompt);
          
          // Extract the actual object type from the first sentence of the detailed analysis
          let objectType = "Object";
          const firstSentence = objectAnalysis.detailedAnalysis.split(".")[0];
          
          // Look for common patterns that might indicate the object type
          if (firstSentence.toLowerCase().includes("appears to be")) {
            const match = firstSentence.match(/appears to be (a|an) ([^,\.]+)/i);
            if (match && match[2]) objectType = match[2].trim();
          } else if (firstSentence.toLowerCase().includes("this is")) {
            const match = firstSentence.match(/this is (a|an) ([^,\.]+)/i);
            if (match && match[2]) objectType = match[2].trim();
          } else if (firstSentence.toLowerCase().includes("object is")) {
            const match = firstSentence.match(/object is (a|an) ([^,\.]+)/i);
            if (match && match[2]) objectType = match[2].trim();
          }
          
          // Transform the result to match the ObjectAnalysisResult interface
          const result = {
            objectName: objectType.charAt(0).toUpperCase() + objectType.slice(1),
            objectDescription: objectAnalysis.detailedAnalysis.split(".")[0] + ".",
            objectPurpose: "This " + objectType.toLowerCase() + " appears to serve a purpose related to " + objectAnalysis.personalityTraits.join(", "),
            auraColor: objectAnalysis.dominantColor,
            auraDescription: "The object emanates a " + objectAnalysis.dominantColor.toLowerCase() + " aura, which suggests " + objectAnalysis.spiritualGuidance,
            energyLevel: objectAnalysis.energyLevel,
            energyQualities: objectAnalysis.personalityTraits,
            historicalSignificance: "The object's energy signature suggests historical connections to traditions of harmony and balance.",
            spiritualSignificance: objectAnalysis.spiritualGuidance,
            detailedAnalysis: objectAnalysis.detailedAnalysis
          };
          
          res.json(result);
        } catch (aiError) {
          console.error("Error in OpenAI object analysis:", aiError);
          
          // Fallback response if OpenAI analysis fails
          const fallbackResult = {
            objectName: "Mystical Object",
            objectDescription: "This appears to be an object with significant spiritual energy.",
            objectPurpose: "This object seems designed to enhance spiritual awareness and energy flow.",
            auraColor: "Blue-Purple",
            auraDescription: "The object emanates a calming blue-purple aura, suggesting wisdom and spiritual intuition.",
            energyLevel: 7,
            energyQualities: ["Calming", "Intuitive", "Protective", "Enlightening"],
            historicalSignificance: "Objects with this energy signature have historically been used in meditation and spiritual practices.",
            spiritualSignificance: "This object may help in deepening meditation and accessing higher states of consciousness.",
            detailedAnalysis: "The object shows signs of being energetically charged. It appears to resonate with the third eye and crown chakras, potentially enhancing intuition and connection to higher wisdom. The energy pattern suggests it could be useful for spiritual development practices."
          };
          
          res.json(fallbackResult);
        }
      } catch (error) {
        console.error("Error analyzing object:", error);
        
        // Even if everything fails, provide a fallback response
        const emergencyFallback = {
          objectName: "Mystical Artifact",
          objectDescription: "This object appears to be a spiritually significant item.",
          objectPurpose: "This object seems to serve as a focus for meditation and energy work.",
          auraColor: "Indigo",
          auraDescription: "The object emanates an indigo aura, suggesting connection to intuition and the third eye chakra.",
          energyLevel: 6,
          energyQualities: ["Intuitive", "Calming", "Focusing", "Protective"],
          historicalSignificance: "Similar objects have been used in spiritual practices across various cultures.",
          spiritualSignificance: "This object may enhance meditation and spiritual awareness practices.",
          detailedAnalysis: "The energy signature of this object suggests it resonates with the third eye chakra. It may be useful for enhancing intuition and inner vision during meditation or spiritual work."
        };
        
        res.json(emergencyFallback);
      }
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

      // Try to analyze the aura using OpenAI, but use fallback if OpenAI fails
      let auraAnalysis;
      try {
        auraAnalysis = await analyzeAuraImage(imageData, customPrompt);
      } catch (aiError) {
        console.error("Error in OpenAI analysis:", aiError);
        // Already using fallback inside analyzeAuraImage, this is just a safeguard
        auraAnalysis = {
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
      }

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
          personalityNumber: calculatePersonality(name),
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
  for (const char of fullName.toLowerCase().replace(/[^a-zA-Z]/g, '')) {
    if (!'aeiou'.includes(char)) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
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
};

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
      
      // Calculate the numerology profile algorithmically
      const result = calculateNumerologyProfile(name, birthDate);
      console.log("Calculated numerology profile:", result);
      
      // Create the return object with the basic numerology values
      const numerologyProfile = {
        lifePathNumber: result.lifePathNumber,
        destinyNumber: result.destinyNumber,
        soulUrgeNumber: result.soulUrgeNumber,
        personalityNumber: result.personalityNumber,
        interpretation: result.interpretation,
        // Add default values for enhanced properties
        colorAssociations: {
          lifePathColor: getColorName(result.lifePathNumber),
          destinyColor: getColorName(result.destinyNumber),
          soulUrgeColor: getColorName(result.soulUrgeNumber),
          personalityColor: getColorName(result.personalityNumber)
        }
      };
      
      // If user is authenticated, save the reading to their profile
      if (req.isAuthenticated()) {
        try {
          const readingToSave = {
            userId: req.user.id,
            name,
            birthDate,
            lifePathNumber: numerologyProfile.lifePathNumber,
            destinyNumber: numerologyProfile.destinyNumber,
            soulUrgeNumber: numerologyProfile.soulUrgeNumber,
            personalityNumber: numerologyProfile.personalityNumber,
            interpretation: numerologyProfile.interpretation
          };
          
          await storage.saveNumerologyReading(readingToSave);
        } catch (saveError) {
          console.error("Error saving numerology reading:", saveError);
          // Continue even if saving fails
        }
      }
      
      // Return the calculated numerology profile
      res.json(numerologyProfile);
    } catch (error) {
      console.error("Error calculating numerology:", error);
      res.status(500).json({ message: "Failed to calculate numerology" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
