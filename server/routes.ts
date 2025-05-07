import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeAuraImage } from "./api/openai";
import { analyzeImageWithGemini } from "./api/gemini";
import { getHoroscopeForSign } from "./api/horoscope";
import { configureFileUpload } from "./api/upload";
import { calculateNumerologyProfile } from "./api/horoscope";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up user authentication routes
  setupAuth(app);

  // Configure file upload
  const upload = configureFileUpload();

  // API routes
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

      // Analyze the aura using OpenAI
      const auraAnalysis = await analyzeAuraImage(imageData);

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
      res.status(500).json({ message: "Failed to analyze aura" });
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

      const geminiAnalysis = await analyzeImageWithGemini(imageData);
      res.json(geminiAnalysis);
    } catch (error) {
      console.error("Error with Gemini analysis:", error);
      res.status(500).json({ message: "Failed to analyze with Gemini" });
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

  // Numerology calculation endpoint
  app.post("/api/numerology", async (req, res) => {
    try {
      const { name, birthDate } = req.body;
      
      if (!name || !birthDate) {
        return res.status(400).json({ message: "Name and birth date are required" });
      }
      
      const numerologyProfile = calculateNumerologyProfile(name, birthDate);
      
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
      
      res.json(numerologyProfile);
    } catch (error) {
      console.error("Error calculating numerology:", error);
      res.status(500).json({ message: "Failed to calculate numerology profile" });
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

  const httpServer = createServer(app);
  return httpServer;
}
