import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import sharp from "sharp";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeAuraImage, generateNumerologyReading, AuraAnalysisResult } from "./api/openai-minimal";
import { analyzeImageWithGemini, generateAuraVisualization } from "./api/gemini";
import { enhancedAuraAnalysis } from "./api/enhanced-aura";
import { analyzeImageColors } from "./api/image-color-analysis";
import { getHoroscopeForSign, calculateNumerologyProfile, getPersonalizedHoroscope } from "./api/horoscope";
import { configureFileUpload } from "./api/upload";
import { NumerologyResult } from "../client/src/lib/openai";
import { sendHealerBookingNotification } from "./email-service";
import { insertHealerSchema, insertHealerBookingSchema, insertJournalSchema } from "../shared/schema";



// Optimized fast aura analysis function for sub-1000ms performance with varied results
// Only approved aura colors - restricted to 17 colors (added Gray, reduced Black frequency)
const ENHANCED_COLORS = [
  { name: "Violet", hex: "#8A2BE2" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Red", hex: "#FF0000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Brown", hex: "#8B4513" }
];

function generateFastAuraAnalysis(imageBuffer?: Buffer) {
  // Optimized hash generation - use only first 1KB for speed
  let seed = 12345;
  if (imageBuffer) {
    const sampleSize = Math.min(1024, imageBuffer.length);
    const sample = imageBuffer.subarray(0, sampleSize);
    seed = 0;
    for (let i = 0; i < sample.length; i += 4) {
      seed = (seed * 31 + sample[i]) >>> 0;
    }
  }
  
  // Fast inline random generator
  const seededRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  
  // Prioritize spiritual colors - exclude black from main selections
  const spiritualColors = [
    { name: "Purple", hex: "#800080" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Green", hex: "#00FF00" },
    { name: "Gold", hex: "#FFD700" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Indigo", hex: "#4B0082" },
    { name: "Violet", hex: "#8A2BE2" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Turquoise", hex: "#40E0D0" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Red", hex: "#FF0000" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Gray", hex: "#808080" }
  ];
  
  // Use spiritual colors 80% of the time for dominant/secondary
  const getDominantColor = () => {
    return seededRandom() < 0.8 
      ? spiritualColors[Math.floor(seededRandom() * 9)] // First 9 are most spiritual
      : spiritualColors[Math.floor(seededRandom() * spiritualColors.length)];
  };
  
  const getSecondaryColor = (avoid: string) => {
    const availableColors = spiritualColors.filter(c => c.name !== avoid);
    return seededRandom() < 0.7
      ? availableColors[Math.floor(seededRandom() * Math.min(9, availableColors.length))]
      : availableColors[Math.floor(seededRandom() * availableColors.length)];
  };
  
  // Generate unique colors
  const dominantColor = getDominantColor();
  const secondaryColor = getSecondaryColor(dominantColor.name);
  
  // Spectrum includes variety but still avoids black in main positions
  const spectrumColors = [
    dominantColor,
    secondaryColor,
    spiritualColors[Math.floor(seededRandom() * spiritualColors.length)],
    spiritualColors[Math.floor(seededRandom() * spiritualColors.length)]
  ];
  
  const auraColorSpectrum = spectrumColors.map(color => color.name);
  const energyLevel = 5 + Math.floor(seededRandom() * 6);
  
  return {
    dominantColor: dominantColor.name,
    secondaryColor: secondaryColor.name,
    auraColors: auraColorSpectrum,
    auraColorSpectrum: auraColorSpectrum,
    auraLayerColors: {
      inner: dominantColor.name,
      middle: spectrumColors[2].name,
      outer: spectrumColors[3].name
    },
    personalityTraits: ["Intuitive", "Creative", "Healing", "Wise"],
    energyLevel: energyLevel,
    spiritualGuidance: `Your aura reveals ${dominantColor.name} energy representing spiritual wisdom and ${secondaryColor.name} energy indicating creative transformation.`,
    zones: {
      giving: {
        colors: [dominantColor.name],
        interpretation: `Giving energy of ${dominantColor.name}`
      },
      receiving: {
        colors: [secondaryColor.name],
        interpretation: `Receptive energy of ${secondaryColor.name}`
      },
      thinking: {
        colors: [spectrumColors[2].name],
        interpretation: `Mental energy of ${spectrumColors[2].name}`
      },
      overall: {
        colors: [dominantColor.name, secondaryColor.name],
        interpretation: `Overall energy of ${dominantColor.name} and ${secondaryColor.name}`
      }
    },
    spiritualGifts: ["Intuitive", "Creative", "Healing"],
    currentChallenges: ["Learning to trust intuition"],
    recommendations: ["Meditation practices"],
    balanceState: "Harmonious",
    detailedAnalysis: `Your aura shows ${dominantColor.name} and ${secondaryColor.name} energies with intuitive and creative qualities.`,
    colorMeanings: {
      [dominantColor.name]: `${dominantColor.name} energy`,
      [secondaryColor.name]: `${secondaryColor.name} energy`
    },
    chakraAlignment: `Strong ${dominantColor.name} frequency alignment`,
    elementalConnection: `${dominantColor.name} elemental resonance`,
    chakraActivity: {
      root: Math.floor(seededRandom() * 4) + 6,
      sacral: Math.floor(seededRandom() * 4) + 6,
      solarPlexus: Math.floor(seededRandom() * 4) + 6,
      heart: Math.floor(seededRandom() * 4) + 7,
      throat: Math.floor(seededRandom() * 4) + 6,
      thirdEye: Math.floor(seededRandom() * 4) + 7,
      crown: Math.floor(seededRandom() * 4) + 7
    },
    auricLayers: spectrumColors.slice(0, 4).map((color, index) => ({
      layer: index + 1,
      color: color.name,
      meaning: `${color.name} layer energy`,
      strength: Math.floor(seededRandom() * 40) + 60
    }))
  };
}

// Helper function to identify typical aura color patterns
function isTypicalAuraColor(r: number, g: number, b: number): boolean {
  // Identify common aura color signatures
  const colorRatios = {
    redDominant: r > g * 1.3 && r > b * 1.3,
    blueDominant: b > r * 1.3 && b > g * 1.3,
    greenDominant: g > r * 1.3 && g > b * 1.3,
    purpleViolet: r > 100 && b > 100 && Math.abs(r - b) < 50,
    yellow: r > 150 && g > 150 && b < 100,
    orange: r > 150 && g > 100 && g < r && b < g,
    pink: r > 150 && g > 100 && b > 100 && r > g,
    turquoise: g > 120 && b > 120 && r < g * 0.8
  };
  
  return Object.values(colorRatios).some(ratio => ratio);
}

// Calculate priority score for aura colors based on visibility and significance
function calculateAuraPriority(r: number, g: number, b: number, saturation: number, brightness: number): number {
  let priority = 0;
  
  // Base priority from saturation (most important for aura colors)
  priority += saturation * 2;
  
  // Brightness contribution (visible aura colors are typically bright)
  if (brightness > 100) priority += 30;
  if (brightness > 150) priority += 20;
  
  // Color-specific bonuses for typical aura colors
  if (r > 150 && b > 150 && Math.abs(r - b) < 50) priority += 40; // Purple/Violet
  if (b > r * 1.5 && b > g * 1.5) priority += 35; // Blue
  if (g > r * 1.5 && g > b * 1.5) priority += 35; // Green
  if (r > g * 1.5 && r > b * 1.5) priority += 35; // Red
  if (r > 150 && g > 150 && b < 80) priority += 30; // Yellow/Gold
  if (r > 150 && g > 100 && g < r && b < g) priority += 30; // Orange
  
  // Penalty for skin tones and common backgrounds
  if (r > 120 && g > 90 && b > 70 && Math.abs(r - g) < 30) priority -= 50; // Skin tones
  if (r < 80 && g < 80 && b < 80) priority -= 30; // Very dark colors
  if (r > 200 && g > 200 && b > 200) priority -= 20; // Very light/white
  
  return Math.max(0, priority);
}

// Analyze image buffer to extract actual visible aura colors from processed aura photographs
function analyzeImageBufferColors(imageBuffer: Buffer) {
  const colors = [];
  const step = 10; // Very fine sampling for maximum precision in aura color detection
  
  // Enhanced color extraction specifically targeting visible aura energy patterns
  for (let i = 0; i < imageBuffer.length - 3; i += step) {
    const r = imageBuffer[i] || 0;
    const g = imageBuffer[i + 1] || 0;
    const b = imageBuffer[i + 2] || 0;
    
    // Focus on aura-specific color ranges while filtering skin tones and backgrounds
    if ((r + g + b) > 40 && (r + g + b) < 700) {
      // Calculate color properties for aura identification
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      const brightness = (r + g + b) / 3;
      
      // Enhanced criteria for aura colors: high saturation or specific color signatures
      const isAuraColor = saturation > 25 || 
                         (brightness > 80 && saturation > 10) || // Bright, moderately saturated
                         isTypicalAuraColor(r, g, b); // Known aura color patterns
      
      if (isAuraColor) {
        colors.push({ 
          r, g, b, 
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          saturation,
          brightness,
          priority: calculateAuraPriority(r, g, b, saturation, brightness)
        });
      }
    }
  }
  
  // Sort colors by aura priority to get the most significant visible colors
  colors.sort((a, b) => b.priority - a.priority);
  
  // Enhanced zone detection for aura photography - map actual visible colors to body zones
  const totalColors = colors.length;
  const highSaturationColors = colors.filter(c => c.saturation > 30);
  
  const zones = {
    crown: colors.slice(0, Math.floor(totalColors * 0.15)), // Top 15% - crown/head aura
    heart: colors.slice(Math.floor(totalColors * 0.25), Math.floor(totalColors * 0.55)), // Heart center
    solar: colors.slice(Math.floor(totalColors * 0.55), Math.floor(totalColors * 0.80)), // Solar plexus
    aura: highSaturationColors.length > 0 ? highSaturationColors : colors.filter((_, index) => index % 3 === 0)
  };
  
  // Find dominant colors in each zone
  const dominantColors: Record<string, string> = {};
  for (const [zoneName, zoneColors] of Object.entries(zones)) {
    const colorFreq: Record<string, number> = {};
    zoneColors.forEach(color => {
      const groupedColor = groupSimilarColors(color.hex);
      colorFreq[groupedColor] = (colorFreq[groupedColor] || 0) + 1;
    });
    
    const sortedColors = Object.entries(colorFreq).sort(([,a], [,b]) => (b as number) - (a as number));
    dominantColors[zoneName] = sortedColors[0]?.[0] || '#FF6B6B';
  }
  
  // Enhanced analysis for full body images
  const uniqueColors = new Set(colors.map(c => groupSimilarColors(c.hex)));
  const dominantColorsList = Object.values(dominantColors).filter(color => color !== '#FF6B6B');
  
  return {
    totalColors: colors.length,
    zones: dominantColors,
    overallDominant: dominantColorsList[0] || dominantColors.crown || '#FF6B6B',
    overallSecondary: dominantColorsList[1] || dominantColors.heart || '#4ECDC4',
    colorVariety: uniqueColors.size,
    energyIntensity: colors.length > 0 ? colors.reduce((sum, c) => sum + (c.r + c.g + c.b), 0) / colors.length / 3 : 50,
    imageType: colors.length > 1000 ? 'full_body' : 'portrait' // Detect image type based on color sampling
  };
}

function groupSimilarColors(hex: string): string {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  
  const threshold = 30;
  
  // Map detected colors to only the 16 approved aura colors
  
  // Black spectrum
  if (r < 50 && g < 50 && b < 50) return '#000000';
  
  // White spectrum
  if (r > 220 && g > 220 && b > 220) return '#FFFFFF';
  
  // Brown spectrum (earth tones)
  if (r > 100 && g > 50 && b < 80 && r > g && g > b) return '#A52A2A';
  
  // Turquoise spectrum (blue-green)
  if (g > 150 && b > 150 && r < 100) return '#40E0D0';
  
  // Red spectrum
  if (r > g + threshold && r > b + threshold) return '#FF0000';
  
  // Yellow spectrum
  if (r > 150 && g > 150 && b < 100) return '#FFFF00';
  
  // Blue spectrum
  if (b > r + threshold && b > g + threshold) return '#0000FF';
  
  // Green spectrum
  if (g > r + threshold && g > b + threshold) return '#00FF00';
  
  // Violet spectrum (high red and blue)
  if (r > 130 && b > 130 && g < 80) return '#8A2BE2';
  
  // Indigo spectrum (dark blue-purple)
  if (b > 80 && r > 50 && r < b && g < r) return '#4B0082';
  
  // Purple spectrum maps to violet (restricted colors only)
  if (r > 80 && b > 80 && Math.abs(r - b) < 50 && g < r) return '#8A2BE2'; // Purple -> Violet
  
  // Gold spectrum
  if (r > 200 && g > 180 && b < 50) return '#FFD700';
  
  // Silver spectrum (balanced grays)
  if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 150) return '#C0C0C0';
  
  // Orange spectrum
  if (r > 200 && g > 100 && g < r && b < 100) return '#FFA500';
  
  // Pink spectrum
  if (r > 200 && g > 150 && b > 150 && r > b) return '#FFC0CB';
  
  // Default to red if no clear match
  return '#FF0000';
}

function findClosestEnhancedColor(detectedHex: string, enhancedColors: any[]) {
  const detectedRgb = {
    r: parseInt(detectedHex.substring(1, 3), 16),
    g: parseInt(detectedHex.substring(3, 5), 16),
    b: parseInt(detectedHex.substring(5, 7), 16)
  };
  
  let closestColor = enhancedColors[0];
  let minDistance = Infinity;
  
  for (const color of enhancedColors) {
    const colorRgb = {
      r: parseInt(color.hex.substring(1, 3), 16),
      g: parseInt(color.hex.substring(3, 5), 16),
      b: parseInt(color.hex.substring(5, 7), 16)
    };
    
    // Calculate color distance using weighted RGB
    const distance = Math.sqrt(
      Math.pow(detectedRgb.r - colorRgb.r, 2) * 0.3 +
      Math.pow(detectedRgb.g - colorRgb.g, 2) * 0.59 +
      Math.pow(detectedRgb.b - colorRgb.b, 2) * 0.11
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }
  
  return closestColor;
}

// Function to generate completely random aura analysis for maximum variety
function generateDeterministicAuraAnalysis(imageBuffer: Buffer) {
  // Create deterministic seed from image content
  const generateHash = (buffer: Buffer): number => {
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  };
  
  let seed = generateHash(imageBuffer);
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Only approved aura colors - restricted to 17 colors (added Gray, reduced Black frequency)
  const enhancedColors = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Turquoise", hex: "#40E0D0" },
    { name: "Red", hex: "#FF0000" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Green", hex: "#00FF00" },
    { name: "Violet", hex: "#8A2BE2" },
    { name: "Indigo", hex: "#4B0082" },
    { name: "Purple", hex: "#800080" },
    { name: "Gold", hex: "#FFD700" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Gray", hex: "#808080" },
    { name: "Black", hex: "#000000" } // Only when truly detected
  ];
  
  // Deterministic color selection using seeded random - 17 approved colors, avoid black as default
  const colorCount = enhancedColors.length;
  const auraColors = [
    enhancedColors[Math.floor(seededRandom() * (colorCount - 1))], // Exclude black from primary selection
    enhancedColors[Math.floor(seededRandom() * (colorCount - 1))], // Exclude black from secondary selection  
    enhancedColors[Math.floor(seededRandom() * colorCount)], // Allow all colors for spectrum
    enhancedColors[Math.floor(seededRandom() * colorCount)],
    enhancedColors[Math.floor(seededRandom() * colorCount)],
    enhancedColors[Math.floor(seededRandom() * colorCount)]
  ];
  
  const dominantColor = auraColors[0];
  const secondaryColor = auraColors[1] || auraColors[0];
  
  // Optimized selections for speed
  const selectedTraits = ["Intuitive", "Creative", "Healing", "Wise"];
  const energyLevel = 7;
  const auraColorSpectrum = auraColors.map(color => color.name);
  const selectedChallenges = ["Learning to trust intuition"];
  const selectedRecommendations = ["Meditation practices"];
  
  const auraLayerColors = {
    inner: auraColors[0].name,
    middle: auraColors[2].name,
    outer: auraColors[4].name
  };

  // Zone colors for 4-Zone Energy Map
  const giveZoneColors = auraColors.slice(0, 2);
  const receiveZoneColors = auraColors.slice(1, 3);
  const thinkZoneColors = auraColors.slice(2, 4);
  const overallZoneColors = [dominantColor, secondaryColor];

  return {
    dominantColor: dominantColor.name,
    secondaryColor: secondaryColor.name,
    auraColors: auraColorSpectrum,
    auraColorSpectrum: auraColorSpectrum,
    auraLayerColors,
    personalityTraits: selectedTraits,
    energyLevel,
    spiritualGuidance: `Your aura reveals ${dominantColor.name} energy representing spiritual wisdom and ${secondaryColor.name} energy indicating creative transformation. This combination suggests a period of spiritual growth where you're developing both inner wisdom and creative expression.`,
    chakraActivity: {
      root: Math.floor(seededRandom() * 3) + 6,
      sacral: Math.floor(seededRandom() * 3) + 7,
      solarPlexus: Math.floor(seededRandom() * 3) + 6,
      heart: Math.floor(seededRandom() * 3) + 8,
      throat: Math.floor(seededRandom() * 3) + 6,
      thirdEye: Math.floor(seededRandom() * 3) + 7,
      crown: Math.floor(seededRandom() * 3) + 7
    },
    detailedAnalysis: `Your aura shows ${dominantColor.name} and ${secondaryColor.name} energies with ${selectedTraits.slice(0, 2).join(' and ').toLowerCase()} qualities. The ${dominantColor.name} energy indicates a strong connection to spiritual wisdom and intuitive insights, while the ${secondaryColor.name} energy represents creative transformation and emotional healing. This combination suggests you're in a powerful phase of spiritual development where your intuitive abilities are expanding alongside your creative expression.`,
    zones: {
      giving: {
        colors: giveZoneColors.map(c => c.name),
        interpretation: `Energy of ${giveZoneColors.map(c => c.name).join(' and ')}`
      },
      receiving: {
        colors: receiveZoneColors.map(c => c.name),
        interpretation: `Receptive energy of ${receiveZoneColors.map(c => c.name).join(' and ')}`
      },
      thinking: {
        colors: thinkZoneColors.map(c => c.name),
        interpretation: `Mental energy of ${thinkZoneColors.map(c => c.name).join(' and ')}`
      },
      overall: {
        colors: overallZoneColors.map(c => c.name),
        interpretation: `Overall energy of ${overallZoneColors.map(c => c.name).join(' and ')}`
      }
    },
    spiritualGifts: selectedTraits.slice(0, 3),
    currentChallenges: selectedChallenges,
    recommendations: selectedRecommendations,
    balanceState: "Harmonious",
    colorMeanings: {
      [dominantColor.name]: `${dominantColor.name} energy`,
      [secondaryColor.name]: `${secondaryColor.name} energy`
    },
    chakraAlignment: `Strong ${dominantColor.name} frequency alignment`,
    elementalConnection: `${dominantColor.name} elemental resonance`,
    auricLayers: auraColors.slice(0, 7).map((color, index) => ({
      layer: index + 1,
      color: color.name,
      meaning: `${color.name} layer energy`,
      strength: Math.floor(seededRandom() * 40) + 60
    }))
  };
}

// Function to generate deterministic analysis based on image hash
function generateDeterministicObjectAnalysis(imageBuffer: Buffer) {
  const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  
  // For object analysis, we want consistency for same image but diversity across different images
  // Use only image-based entropy without time/random components for consistency
  
  // Extract multiple seeds from different hash segments for image-specific diversity
  const seed1 = parseInt(hash.substring(0, 8), 16);
  const seed2 = parseInt(hash.substring(8, 16), 16);
  const seed3 = parseInt(hash.substring(16, 24), 16);
  const seed4 = parseInt(hash.substring(24, 32), 16);
  const seed5 = parseInt(hash.substring(32, 40), 16);
  const seed6 = parseInt(hash.substring(40, 48), 16);
  
  // Enhanced object types with more variety and better detection
  const objectTypes = [
    "Crystal", "Stone", "Jewelry", "Artifact", "Ornament", "Talisman", 
    "Figurine", "Coin", "Ring", "Pendant", "Sculpture", "Charm",
    "Amulet", "Gemstone", "Relic", "Totem", "Medallion", "Compass",
    "Mirror", "Vessel", "Sphere", "Pyramid", "Wand", "Bracelet",
    "Book", "Candle", "Bell", "Key", "Locket", "Watch", "Bottle",
    "Bowl", "Plate", "Cup", "Vase", "Statue", "Mask", "Box"
  ];
  
  // Only approved aura colors - restricted to 17 colors (added Gray)
  const auraColors = [
    "White", "Brown", "Turquoise", "Red", "Yellow", "Blue", "Green", 
    "Violet", "Indigo", "Purple", "Gold", "Silver", "Orange", "Pink", "Gray", "Black"
  ];
  
  // Enhanced energy qualities with more variety
  const energyQualities = [
    ["Calming", "Protective", "Grounding"],
    ["Energizing", "Inspiring", "Creative"],
    ["Healing", "Nurturing", "Compassionate"],
    ["Intuitive", "Mystical", "Spiritual"],
    ["Balancing", "Harmonizing", "Peaceful"],
    ["Empowering", "Confident", "Strong"],
    ["Transformative", "Cleansing", "Purifying"],
    ["Manifesting", "Attracting", "Abundant"],
    ["Communicative", "Expressive", "Truthful"],
    ["Illuminating", "Enlightening", "Wise"]
  ];
  
  // Enhanced selection logic using only image-based entropy for consistency
  const imageSize = imageBuffer.length;
  const sizeVariation = imageSize % 10000;
  
  // Create diverse seeds using image-based entropy only (no time/random for consistency)
  const complexSeed1 = (seed1 ^ seed2 ^ seed3) + sizeVariation;
  const complexSeed2 = (seed2 ^ seed3 ^ seed4) + (imageSize % 7919);
  const complexSeed3 = (seed3 ^ seed4 ^ seed5) + (seed6 % 5003);
  const complexSeed4 = (seed4 ^ seed5 ^ seed6) + (imageSize % 3001);
  
  let objectTypeIndex = Math.abs(complexSeed1) % objectTypes.length;
  // Exclude black from object analysis unless specifically detected
  const nonBlackColors = auraColors.filter(color => color !== "Black");
  let auraColorIndex = Math.abs(complexSeed2) % nonBlackColors.length;
  let energyIndex = Math.abs(complexSeed3) % energyQualities.length;
  
  const energyLevel = 3 + (Math.abs(complexSeed1 + complexSeed2) % 8); // Energy level between 3-10
  
  const selectedObjectType = objectTypes[objectTypeIndex] || "Crystal";
  const selectedAuraColor = nonBlackColors[auraColorIndex] || "Purple";
  const selectedQualities = energyQualities[energyIndex] || ["Calming", "Protective", "Grounding"];
  
  // Ensure we have valid qualities
  const primaryQuality = selectedQualities[0] || "Calming";
  const qualitiesText = selectedQualities.length > 0 ? selectedQualities.join(', ') : "Calming, Protective";
  
  // Only approved object colors - restricted to 17 colors (added Gray)
  const objectColorMeanings: Record<string, string> = {
    'Black': 'Shadow mastery - transformation power, void consciousness, deep inner work, spiritual rebirth',
    'White': 'Divine purity - spiritual protection, angelic presence, sacred innocence, light energy',
    'Brown': 'Earth wisdom - grounding energy, material stability, natural healing, physical connection',
    'Turquoise': 'Healing waters - emotional cleansing, heart-throat bridge, therapeutic communication, soul washing',
    'Red': 'Life force - passionate power, primal energy, warrior strength, bold manifestation',
    'Yellow': 'Mental brilliance - intellectual power, solar energy, conscious awakening, wisdom activation',
    'Blue': 'Truth crystal - divine wisdom, spiritual insight, celestial knowledge, sacred communication',
    'Green': 'Heart mastery - unconditional love, emotional healing, compassionate wisdom, soul connection',
    'Violet': 'Crown connection - divine consciousness, spiritual mastery, enlightened awareness, cosmic unity',
    'Indigo': 'Third eye wisdom - psychic insight, inner knowing, intuitive mastery, mystical awareness',
    'Purple': 'Royal mysticism - noble spirituality, regal intuition, aristocratic wisdom, refined consciousness',
    'Gold': 'Divine illumination - cosmic consciousness, spiritual mastery, sacred geometry, enlightened awareness',
    'Silver': 'Lunar wisdom - psychic sensitivity, reflective power, intuitive enhancement, feminine energy',
    'Orange': 'Creative fire - artistic inspiration, joyful expression, playful energy, innovative spirit',
    'Pink': 'Divine love - unconditional acceptance, heart opening, compassionate healing, soul recognition',
    'Gray': 'Neutral balance - wisdom through experience, practical spirituality, balanced perspective, grounded insight',



    'Pearl': 'Ocean treasure - hidden wisdom, deep mysteries, lunar magic, feminine power',
    'Opal': 'Rainbow consciousness - multi-dimensional awareness, spectrum energy, prismatic wisdom, colorful insight',
    'Moonstone': 'Cyclical wisdom - natural rhythms, feminine cycles, intuitive timing, lunar connection',
    'Crystal': 'Pure amplification - energy enhancement, clarity magnification, spiritual broadcasting, divine transmission'
  };

  const colorMeaning = objectColorMeanings[selectedAuraColor] || `${selectedAuraColor} consciousness - divine soul frequency activation and spiritual purpose alignment`;

  return {
    objectName: selectedObjectType,
    objectDescription: `This ${selectedObjectType.toLowerCase()} channels ${colorMeaning.toLowerCase()} through its crystalline structure and sacred geometry.`,
    objectPurpose: `Sacred ${selectedObjectType.toLowerCase()} for ${colorMeaning.split(' - ')[1] || 'spiritual awakening and consciousness expansion'}.`,
    auraColor: selectedAuraColor,
    auraDescription: `${selectedAuraColor} aura emanation - ${colorMeaning.split(' - ')[1] || 'divine consciousness activation and soul purpose alignment'}.`,
    energyLevel: energyLevel,
    energyQualities: selectedQualities,
    historicalSignificance: `Sacred ${selectedObjectType.toLowerCase()} traditionally used for ${colorMeaning.split(' - ')[1]?.split(',')[0] || 'spiritual transformation'} in ancient wisdom traditions.`,
    spiritualSignificance: `This object resonates with ${colorMeaning.split(' - ')[0] || selectedAuraColor + ' consciousness'} frequencies for spiritual development and soul evolution.`,
    detailedAnalysis: `Energy signature: ${colorMeaning}. This sacred ${selectedObjectType.toLowerCase()} activates specific chakra frequencies and enhances spiritual practices through authentic color vibration.`
  };
}

// Helper functions for numerology calculations
function getColorForNumber(num: number): string {
  // Standardized color mappings based on remedies data
  const colorMap: { [key: number]: string } = {
    1: "Yellow",   // Solar Plexus Chakra - Sun
    2: "Green",    // Heart Chakra - Moon
    3: "Violet",   // Crown Chakra - Jupiter
    4: "Brown",    // Earth Star Chakra - Rahu
    5: "Blue",     // Throat Chakra - Mercury
    6: "Orange",   // Sacral Chakra - Venus
    7: "White",    // Soul Star Chakra - Ketu
    8: "Indigo",   // Third Eye Chakra - Saturn
    9: "Red"       // Root Chakra - Mars
  };
  return colorMap[num] || "White";
}

function letterToNumber(letter: string): number {
  // Based on the numerology chart provided
  const letterMap: Record<string, number> = {
    'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
    'B': 2, 'K': 2, 'R': 2,
    'C': 3, 'G': 3, 'L': 3, 'S': 3,
    'D': 4, 'M': 4, 'T': 4,
    'E': 5, 'H': 5, 'N': 5, 'X': 5,
    'F': 6, 'O': 6, 'U': 6, 'V': 6, 'W': 6,
    'Z': 7,
    'P': 8
  };
  
  return letterMap[letter.toUpperCase()] || 0;
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
  // Sum all digits from the birth date (e.g., 1996-08-23 = 1+9+9+6+0+8+2+3 = 38 = 3+8 = 11)
  const digits = date.replace(/\D/g, '');
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit);
  }
  return reduceNumber(sum);
}

function calculateDestiny(fullName: string): number {
  // Sum all letters in the full name using the numerology chart
  let sum = 0;
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    sum += letterToNumber(char);
  }
  return reduceNumber(sum);
}

function calculateSoulUrge(fullName: string): number {
  // Sum only vowels (A, E, I, O, U, Y) using the numerology chart
  let sum = 0;
  const vowels = 'AEIOUY';
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    if (vowels.includes(char.toUpperCase())) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

function calculatePersonality(birthDate: string): number {
  // Decision-Making Chakra: Sum of digits from the day only (e.g., 02 = 0+2 = 2)
  const parts = birthDate.split('-');
  if (parts.length !== 3) return 5; // Default fallback
  
  const day = parts[2]; // Get the day part (DD)
  let sum = 0;
  
  // Sum all digits in the day
  for (const digit of day) {
    sum += parseInt(digit);
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
  
  // Configure file upload first (lightweight operation)
  const upload = configureFileUpload();
  
  // Seed initial healer data asynchronously (don't block server startup)
  setImmediate(async () => {
    try {
      await seedHealers();
      console.log("Healer data seeded successfully");
    } catch (error) {
      console.error("Failed to seed healers, continuing without seeding:", error);
    }
  });

  // Helper function to resize images to uniform dimensions for consistent aura visualization
  const resizeImageToStandard = async (inputBuffer: Buffer): Promise<Buffer> => {
    try {
      // Resize all aura analysis images to uniform 1600x900 resolution for consistent appearance
      const resizedBuffer = await sharp(inputBuffer)
        .resize(1600, 900, {
          fit: 'cover', // Crop to exact dimensions for uniform appearance
          position: 'center' // Center crop to maintain subject focus
        })
        .jpeg({ 
          quality: 90, // Higher quality for 200kb target size
          progressive: true,
          mozjpeg: true // Enable mozjpeg for better compression
        })
        .toBuffer();
      
      // Check if file size is close to 200kb target
      const fileSizeKB = resizedBuffer.length / 1024;
      console.log(`Image resized to ${1600}x${900}, file size: ${fileSizeKB.toFixed(1)}kb`);
      
      // If file is significantly larger than 200kb, reduce quality further
      if (fileSizeKB > 220) {
        const optimizedBuffer = await sharp(inputBuffer)
          .resize(1600, 900, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: 80, // Lower quality for size optimization while staying under 200kb
            progressive: true,
            mozjpeg: true
          })
          .toBuffer();
        
        const optimizedSizeKB = optimizedBuffer.length / 1024;
        console.log(`Image optimized to ${optimizedSizeKB.toFixed(1)}kb`);
        
        // If still over 200kb, reduce quality more aggressively
        if (optimizedSizeKB > 200) {
          const finalOptimizedBuffer = await sharp(inputBuffer)
            .resize(1600, 900, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ 
              quality: 70, // Final optimization to ensure under 200kb
              progressive: true,
              mozjpeg: true
            })
            .toBuffer();
          
          const finalSizeKB = finalOptimizedBuffer.length / 1024;
          console.log(`Image final optimization to ${finalSizeKB.toFixed(1)}kb`);
          return finalOptimizedBuffer;
        }
        
        return optimizedBuffer;
      }
      
      return resizedBuffer;
    } catch (error) {
      console.error("Error resizing image:", error);
      // Return original buffer if resize fails
      return inputBuffer;
    }
  };

  // API routes
  // Object Analysis API endpoint
  app.post("/api/analyze-object", upload.single("image"), async (req, res) => {
    try {
      // Get image data either from file or base64 string
      let imgBuffer: Buffer;
      
      if (req.file) {
        // If image was uploaded as file
        imgBuffer = req.file.buffer;
      } else if (req.body.image) {
        // If image was sent as base64 string
        imgBuffer = Buffer.from(req.body.image, 'base64');
      } else {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Resize image to standard dimensions (1600x900px)
      imgBuffer = await resizeImageToStandard(imgBuffer);

      // Check if image contains a human using Gemini vision API - object analysis should reject human images
      const hasHuman = await detectHumanInImage(imgBuffer);
      console.log('Object analysis - Gemini human detection result:', hasHuman);
      if (hasHuman) {
        return res.status(400).json({ 
          error: "HUMAN_DETECTED",
          message: "Human detected in image. Object analysis is for inanimate objects only. Please use the Aura Analysis section for images containing people, or upload an image of an object, item, or thing only.",
          suggestion: "Try uploading: jewelry, crystals, artwork, furniture, electronics, tools, or any non-living object."
        });
      }
      
      // If no human detected, proceed with object analysis

      // Use deterministic analysis based on image hash for consistent results
      const deterministicResult = generateDeterministicObjectAnalysis(imgBuffer);
      
      // Get the name from request body
      const analysisName = req.body.name || 'Unnamed';

      // Save the object analysis to database if user is authenticated
      let savedAnalysis = null;
      if (req.isAuthenticated() && req.user) {
        try {
          // Create a temporary image URL (in production, you'd upload to cloud storage)
          const imageUrl = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
          
          savedAnalysis = await storage.saveObjectAnalysis({
            userId: req.user.id,
            name: analysisName,
            imageUrl,
            objectName: deterministicResult.objectName,
            objectDescription: deterministicResult.objectDescription,
            objectPurpose: deterministicResult.objectPurpose,
            auraColor: deterministicResult.auraColor,
            auraDescription: deterministicResult.auraDescription,
            energyLevel: deterministicResult.energyLevel,
            energyQualities: JSON.stringify(deterministicResult.energyQualities),
            historicalSignificance: deterministicResult.historicalSignificance,
            spiritualSignificance: deterministicResult.spiritualSignificance,
            detailedAnalysis: deterministicResult.detailedAnalysis
          });
        } catch (saveError) {
          console.error("Error saving object analysis:", saveError);
          // Continue even if saving fails
        }
      }
      
      // Include the analysis ID in the response for the review system
      const responseData = {
        ...deterministicResult,
        id: savedAnalysis?.id || null
      };
      
      res.json(responseData);
    } catch (error) {
      console.error("Error processing object analysis:", error);
      res.status(500).json({ message: "An error occurred during analysis" });
    }
  });

  // Image hash cache for consistent results
  const imageHashCache = new Map<string, any>();

  // Enhanced function to detect human presence vs room/area images
  // Enhanced human detection for real-world photo uploads
// Backup human detection when OpenAI API fails
function performBackupHumanDetection(imageBuffer: Buffer): boolean {
  // Ultra-aggressive backup detection to catch humans when OpenAI fails
  let humanScore = 0;
  let eyePatterns = 0;
  let skinPatterns = 0;
  let facePatterns = 0;
  let totalSamples = 0;
  
  // More aggressive sampling for backup detection
  const sampleStep = Math.max(150, Math.floor(imageBuffer.length / 1000));
  
  for (let i = 0; i < imageBuffer.length - 30; i += sampleStep) {
    const pixels = [];
    for (let j = 0; j < 30; j += 3) {
      if (i + j + 2 < imageBuffer.length) {
        pixels.push({
          r: imageBuffer[i + j] || 0,
          g: imageBuffer[i + j + 1] || 0,
          b: imageBuffer[i + j + 2] || 0
        });
      }
    }
    
    if (pixels.length < 8) continue;
    totalSamples++;
    
    // Eye detection: look for dark spots with light surroundings
    let darkSpots = 0;
    let lightAreas = 0;
    for (const pixel of pixels) {
      const brightness = pixel.r + pixel.g + pixel.b;
      if (brightness < 60) darkSpots++;
      else if (brightness > 160) lightAreas++;
    }
    
    if (darkSpots >= 2 && lightAreas >= 4) {
      eyePatterns++;
      humanScore += 3;
    }
    
    // Skin tone detection - very broad range
    let skinTones = 0;
    for (const pixel of pixels) {
      const r = pixel.r, g = pixel.g, b = pixel.b;
      
      // Detect any skin-like colors
      const isPossibleSkin = (
        (r > 80 && r < 255 && g > 60 && g < 200 && b > 40 && b < 180) &&
        (r >= g && g >= b * 0.8) // Skin tone ratio
      );
      
      if (isPossibleSkin) skinTones++;
    }
    
    if (skinTones >= 4) {
      skinPatterns++;
      humanScore += 2;
    }
    
    // Face pattern detection
    let centerBrightness = 0;
    let edgeBrightness = 0;
    const center = pixels.slice(4, 8);
    const edges = pixels.slice(0, 4).concat(pixels.slice(8, 12));
    
    center.forEach(p => centerBrightness += (p.r + p.g + p.b));
    edges.forEach(p => edgeBrightness += (p.r + p.g + p.b));
    
    if (center.length > 0) centerBrightness /= center.length;
    if (edges.length > 0) edgeBrightness /= edges.length;
    
    // Face-like brightness pattern
    if (centerBrightness > edgeBrightness + 15 && centerBrightness < edgeBrightness + 100) {
      facePatterns++;
      humanScore += 1;
    }
  }
  
  // Calculate ratios
  const eyeRatio = eyePatterns / totalSamples;
  const skinRatio = skinPatterns / totalSamples;
  const faceRatio = facePatterns / totalSamples;
  const overallScore = humanScore / totalSamples;
  
  // Very aggressive detection thresholds
  const hasHuman = (
    eyeRatio > 0.03 ||           // Very low eye threshold
    skinRatio > 0.08 ||          // Low skin threshold
    faceRatio > 0.05 ||          // Low face pattern threshold
    overallScore > 0.6 ||        // Overall score threshold
    (eyeRatio > 0.01 && skinRatio > 0.04) // Combined low thresholds
  );
  
  console.log('Backup human detection:', {
    eyeRatio: eyeRatio.toFixed(3),
    skinRatio: skinRatio.toFixed(3),
    faceRatio: faceRatio.toFixed(3),
    overallScore: overallScore.toFixed(3),
    totalSamples,
    isHuman: hasHuman
  });
  
  return hasHuman;
}

async function detectHumanInImage(imageBuffer: Buffer): Promise<boolean> {
  // Use Gemini's vision API to accurately detect humans in images
  try {
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Detect if there is any human in this image, yes or no"
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, response.statusText, errorText);
      
      // If API fails, use backup human detection
      console.log('Gemini API failed - using backup human detection');
      return performBackupHumanDetection(imageBuffer);
    }

    const result = await response.json();
    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || '';
    
    console.log('Gemini human detection result:', answer);
    
    // Return true if human detected (yes), false if no human (no)
    const hasHuman = answer.includes('yes');
    
    // Log the decision for debugging
    console.log(`Image ${hasHuman ? 'BLOCKED (human detected)' : 'ALLOWED (no human)'}`);
    
    return hasHuman;
    
  } catch (error) {
    console.error('Error calling Gemini for human detection:', error);
    // If API fails, use backup human detection
    console.log('Gemini API error - using backup human detection');
    return performBackupHumanDetection(imageBuffer);
  }
}

  // Aura Analysis API endpoint
  app.post("/api/analyze-aura", upload.single("image"), async (req, res) => {
    try {
      // Get image data either from file or base64 string
      let imageData: string;
      let imgBuffer: Buffer;
      
      if (req.file) {
        // If image was uploaded as file
        imgBuffer = req.file.buffer;
      } else if (req.body.image) {
        // If image was sent as base64 string
        imgBuffer = Buffer.from(req.body.image, 'base64');
      } else {
        return res.status(400).json({ message: "No image provided" });
      }

      // CRITICAL: Check if image contains a human BEFORE any processing
      // Aura analysis requires human images - this is a strict requirement
      const hasHuman = await detectHumanInImage(imgBuffer);
      
      if (!hasHuman) {
        console.log("Image BLOCKED (no human detected)");
        return res.status(400).json({ 
          message: "Please upload a photo containing a person for aura analysis. Use Object Analysis for items or objects." 
        });
      }

      console.log("Human detected - proceeding with aura analysis");

      // Resize image to standard dimensions (1600x900px)
      imgBuffer = await resizeImageToStandard(imgBuffer);
      imageData = imgBuffer.toString("base64");

      // Skip all validation and logging for maximum speed

      // Get the name from request body
      const analysisName = req.body.name || 'Unnamed';

      // Use ultra-fast analysis for immediate response
      const auraAnalysis = generateFastAuraAnalysis(imgBuffer) as any;

      // Save the aura reading to database if user is authenticated
      let savedReading = null;
      if (req.isAuthenticated() && req.user) {
        try {
          // Create a temporary image URL (in production, you'd upload to cloud storage)
          const imageUrl = `data:image/jpeg;base64,${imageData}`;
          
          savedReading = await storage.saveAuraReading({
            userId: req.user.id,
            name: analysisName,
            imageUrl,
            dominantColor: auraAnalysis.dominantColor || 'Unknown',
            secondaryColor: auraAnalysis.secondaryColor || 'Unknown',
            energyLevel: auraAnalysis.energyLevel || 5,
            analysis: JSON.stringify(auraAnalysis)
          });
          
          // Add the saved reading ID to the response
          auraAnalysis.id = savedReading.id;
        } catch (saveError) {
          console.error("Error saving aura reading:", saveError);
          // Don't fail the whole request if saving fails
        }
      }

      // Skip AI visualization for maximum speed - return analysis immediately
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
          personalityNumber: calculatePersonality(birthDate),
          soulChakraNumber: calculateDominantSoulChakra(birthDate),
          interpretation: `Your Life Path Number ${calculateLifePath(birthDate)} indicates your life's journey. Your Destiny Number ${calculateDestiny(name)} reveals your goals and abilities. Your Soul Urge Number ${calculateSoulUrge(name)} shows your inner desires, while your Personality Number ${calculatePersonality(birthDate)} represents your decision-making chakra. Your Soul Chakra Number ${calculateDominantSoulChakra(birthDate)} reveals your spiritual energy center.`,
          colorAssociations: {
            lifePathColor: getColorForNumber(calculateLifePath(birthDate)),
            destinyColor: getColorForNumber(calculateDestiny(name)),
            soulUrgeColor: getColorForNumber(calculateSoulUrge(name)),
            personalityColor: getColorForNumber(calculatePersonality(birthDate)),
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
  
  // Personalized horoscope endpoint based on user's birth date
  app.get("/api/personalized-horoscope", async (req, res) => {
    try {
      // Check if user is authenticated and has birth date
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Authentication required for personalized horoscope" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user || !user.birthDate) {
        return res.status(400).json({ 
          message: "Birth date required for personalized horoscope. Please update your profile." 
        });
      }

      // Generate comprehensive horoscope based on user's birth date
      const personalizedHoroscope = await getPersonalizedHoroscope(user.birthDate);
      
      res.json(personalizedHoroscope);
    } catch (error) {
      console.error("Error generating personalized horoscope:", error);
      res.status(500).json({ message: "Failed to generate personalized horoscope" });
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
          personalityNumber: calculatePersonality(birthDate),
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

  // Add review to aura reading
  app.post("/api/aura-readings/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, reviewText } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const readingId = parseInt(id);
      const updatedReading = await storage.updateAuraReadingReview(readingId, rating, reviewText);
      
      if (!updatedReading) {
        return res.status(404).json({ error: "Aura reading not found" });
      }

      res.json(updatedReading);
    } catch (error) {
      console.error("Error saving review:", error);
      res.status(500).json({ error: "Failed to save review" });
    }
  });
  
// Helper functions for fallback numerology calculations
function calculateLifePath(date: string): number {
  // Sum all digits from the birth date (e.g., 1996-08-23 = 1+9+9+6+0+8+2+3 = 38 = 3+8 = 11)
  const digits = date.replace(/\D/g, '');
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit);
  }
  return reduceNumber(sum);
}

function calculateDestiny(fullName: string): number {
  // Sum all letters in the full name using the numerology chart
  let sum = 0;
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    sum += letterToNumber(char);
  }
  return reduceNumber(sum);
}

function calculateSoulUrge(fullName: string): number {
  // Sum only vowels (A, E, I, O, U, Y) using the numerology chart
  let sum = 0;
  const vowels = 'AEIOUY';
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    if (vowels.includes(char.toUpperCase())) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

function calculatePersonality(birthDate: string): number {
  // Decision-Making Chakra: Sum of digits from the day only (e.g., 02 = 0+2 = 2)
  const parts = birthDate.split('-');
  if (parts.length !== 3) return 5; // Default fallback
  
  const day = parts[2]; // Get the day part (DD)
  let sum = 0;
  
  // Sum all digits in the day
  for (const digit of day) {
    sum += parseInt(digit);
  }
  
  return reduceNumber(sum);
}

// Decision-making chakra (Personality) number - sum of the two digits of birth date
function calculateDecisionMakingChakra(birthDate: string): number {
  // Decision-Making Chakra: Sum of digits from the day only (e.g., 02 = 0+2 = 2)
  const parts = birthDate.split('-');
  if (parts.length !== 3) return 5; // Default fallback
  
  const day = parts[2]; // Get the day part (DD)
  let sum = 0;
  
  // Sum all digits in the day
  for (const digit of day) {
    sum += parseInt(digit);
  }
  
  return reduceNumber(sum);
}

// Removed duplicate - using the calculateDominantSoulChakra function defined later

// Duplicate function implementations removed - using standardized versions from above

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

  // Get user's healer bookings
  app.get("/api/user-bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const bookings = await storage.getHealerBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error retrieving user bookings:", error);
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });

  // Get healer's booking requests (for healer dashboard)
  app.get("/api/healer-bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.userType !== 'healer') {
      return res.status(403).json({ message: "Access denied - healer account required" });
    }

    try {
      // First get the healer record for this user
      const healers = await storage.getAllHealers();
      
      // Try multiple ways to match the user to a healer record
      const healer = healers.find(h => 
        h.email === req.user.username || 
        h.email === `${req.user.username}@spiritualwellness.com` ||
        h.email === `${req.user.username}@aurafy.com` ||
        h.name.toLowerCase().replace(/\s+/g, '') === req.user.username.toLowerCase()
      );
      
      if (!healer) {
        // For now, return empty bookings array instead of error to allow healers to see dashboard
        console.log(`Healer profile not found for user: ${req.user.username}`);
        return res.json([]);
      }

      const bookings = await storage.getHealerBookingsByHealer(healer.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error retrieving healer bookings:", error);
      res.status(500).json({ message: "Failed to retrieve healer bookings" });
    }
  });

  // Update booking status (accept/reject) with healer response
  app.patch("/api/booking/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const bookingId = parseInt(req.params.id);
      const { status, healerResponse } = req.body;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
      }

      // Check if this healer has permission to modify this booking
      const booking = await storage.getHealerBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Get healer record to verify permissions
      const healers = await storage.getAllHealers();
      const healer = healers.find(h => 
        h.email === req.user.username || 
        h.email === `${req.user.username}@spiritualwellness.com` ||
        h.email === `${req.user.username}@aurafy.com` ||
        h.name.toLowerCase().replace(/\s+/g, '') === req.user.username.toLowerCase()
      );
      
      if (!healer || healer.id !== booking.healerId) {
        console.log(`Healer auth failed: user=${req.user.username}, healer=${healer?.name}, booking healerId=${booking.healerId}`);
        return res.status(403).json({ message: "Access denied - not authorized for this booking" });
      }

      // Update booking status with healer response
      const updatedBooking = await storage.updateBookingStatusWithResponse(
        bookingId, 
        status, 
        healerResponse || null
      );
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Failed to update booking" });
      }

      res.json({ 
        message: `Booking ${status} successfully`, 
        booking: updatedBooking 
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Get healer analytics and client stats
  app.get("/api/healer-analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.userType !== 'healer') {
      return res.status(403).json({ message: "Access denied - healer account required" });
    }

    try {
      const healers = await storage.getAllHealers();
      const healer = healers.find(h => 
        h.email === req.user.username || 
        h.email === `${req.user.username}@spiritualwellness.com` ||
        h.email === `${req.user.username}@aurafy.com` ||
        h.name.toLowerCase().replace(/\s+/g, '') === req.user.username.toLowerCase()
      );
      
      if (!healer) {
        return res.json({ 
          totalBookings: 0,
          recentBookings: 0,
          acceptedBookings: 0,
          rejectedBookings: 0,
          pendingBookings: 0,
          totalClients: 0,
          acceptanceRate: 0
        });
      }

      const stats = await storage.getHealerClientStats(healer.id);
      res.json(stats);
    } catch (error) {
      console.error("Error retrieving healer analytics:", error);
      res.status(500).json({ message: "Failed to retrieve healer analytics" });
    }
  });

  // Get healer booking trends
  app.get("/api/healer-trends", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.userType !== 'healer') {
      return res.status(403).json({ message: "Access denied - healer account required" });
    }

    try {
      const healers = await storage.getAllHealers();
      const healer = healers.find(h => 
        h.email === req.user.username || 
        h.email === `${req.user.username}@spiritualwellness.com` ||
        h.email === `${req.user.username}@aurafy.com` ||
        h.name.toLowerCase().replace(/\s+/g, '') === req.user.username.toLowerCase()
      );
      
      if (!healer) {
        return res.json([]);
      }

      const trends = await storage.getHealerBookingTrends(healer.id);
      res.json(trends);
    } catch (error) {
      console.error("Error retrieving healer trends:", error);
      res.status(500).json({ message: "Failed to retrieve healer trends" });
    }
  });

  // Quick vibe check - simplified aura analysis for home page
  app.post("/api/quick-vibe", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageBuffer = req.file.buffer;
      
      // Detect human in image first
      const hasHuman = await detectHumanInImage(imageBuffer);
      if (!hasHuman) {
        return res.status(400).json({ 
          message: "Please upload an image with a person for vibe analysis",
          isHuman: false 
        });
      }

      // Generate quick aura analysis - focus on personality color only
      const fastAnalysis = generateFastAuraAnalysis(imageBuffer);
      
      // Get personality color (dominant color from the analysis)
      let personalityColor = fastAnalysis.dominantColor;
      
      // Map any non-approved colors to the closest approved color
      const approvedColors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Indigo', 'White', 'Brown', 'Gold', 'Silver', 'Black'];
      if (!approvedColors.includes(personalityColor)) {
        // Map common variations to approved colors
        const colorMapping: { [key: string]: string } = {
          'Purple': 'Violet',
          'Turquoise': 'Blue',
          'Pink': 'Red',
          'Teal': 'Green',
          'Magenta': 'Violet',
          'Cyan': 'Blue',
          'Lime': 'Green',
          'Maroon': 'Red',
          'Navy': 'Blue',
          'Olive': 'Green',
          'Aqua': 'Blue',
          'Fuchsia': 'Violet'
        };
        personalityColor = colorMapping[personalityColor] || 'Violet'; // Default to violet if not found
      }
      
      // Color meanings for quick vibe analysis - only 12 approved aura colors
      const colorMeanings = {
        'Red': {
          positive: 'Passionate, energetic, courageous, and determined. You have strong life force energy.',
          negative: 'May indicate anger, stress, or being overwhelmed. Could suggest need for grounding.'
        },
        'Orange': {
          positive: 'Creative, enthusiastic, confident, and joyful. You radiate warmth and optimism.',
          negative: 'Might show restlessness, impatience, or scattered energy needing focus.'
        },
        'Yellow': {
          positive: 'Intelligent, cheerful, analytical, and mentally active. You have bright mental energy.',
          negative: 'Could indicate overthinking, anxiety, or mental exhaustion needing rest.'
        },
        'Green': {
          positive: 'Balanced, healing, compassionate, and growth-oriented. You have natural healing abilities.',
          negative: 'May show jealousy, possessiveness, or feeling stuck in growth patterns.'
        },
        'Blue': {
          positive: 'Calm, communicative, trustworthy, and peaceful. You express truth and authenticity.',
          negative: 'Might indicate sadness, depression, or difficulty with self-expression.'
        },
        'Violet': {
          positive: 'Spiritual, intuitive, magical, and visionary. You have strong psychic abilities.',
          negative: 'Could show disconnection from reality or being too focused on spiritual matters.'
        },
        'Indigo': {
          positive: 'Wise, perceptive, deep-thinking, and spiritually aware. You see beyond the surface.',
          negative: 'May indicate isolation, depression, or being too serious about life.'
        },
        'White': {
          positive: 'Pure, protective, enlightened, and spiritually advanced. You radiate divine energy.',
          negative: 'Might show spiritual bypassing or avoiding earthly responsibilities.'
        },
        'Brown': {
          positive: 'Grounded, practical, reliable, and earth-connected. You provide stable energy.',
          negative: 'Could indicate being stuck, materialistic, or lacking spiritual connection.'
        },
        'Gold': {
          positive: 'Divine, illuminated, successful, and spiritually gifted. You have golden light energy.',
          negative: 'May show ego issues, materialism, or spiritual pride needing humility.'
        },
        'Silver': {
          positive: 'Intuitive, psychic, moon-connected, and emotionally balanced. You have lunar wisdom.',
          negative: 'Might indicate moodiness, emotional instability, or being too receptive to others.'
        },
        'Black': {
          positive: 'Protective, mysterious, transformative, and deep. You absorb negative energy.',
          negative: 'Could show depression, negative thinking, or being overwhelmed by darkness.'
        }
      };

      const meaning = colorMeanings[personalityColor as keyof typeof colorMeanings] || {
        positive: 'You have a unique and special energy signature.',
        negative: 'Your energy may need balancing and harmonizing.'
      };

      res.json({
        dominantColor: personalityColor,
        colorMeaning: meaning,
        energyLevel: fastAnalysis.energyLevel,
        message: `Your vibe is radiating ${personalityColor.toLowerCase()} energy!`
      });

    } catch (error) {
      console.error("Quick vibe analysis error:", error);
      res.status(500).json({ message: "Failed to analyze your vibe. Please try again." });
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
        // Based on the numerology chart provided
        const letterMap: Record<string, number> = {
          'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
          'B': 2, 'K': 2, 'R': 2,
          'C': 3, 'G': 3, 'L': 3, 'S': 3,
          'D': 4, 'M': 4, 'T': 4,
          'E': 5, 'H': 5, 'N': 5, 'X': 5,
          'F': 6, 'O': 6, 'U': 6, 'V': 6, 'W': 6,
          'Z': 7,
          'P': 8
        };
        
        return letterMap[letter.toUpperCase()] || 0;
      };

      // Calculate Life Path Number
      const calculateLifePath = (date: string): number => {
        // Sum all digits from the birth date (e.g., 1996-08-23 = 1+9+9+6+0+8+2+3 = 38 = 3+8 = 11)
        const digits = date.replace(/\D/g, '');
        let sum = 0;
        for (const digit of digits) {
          sum += parseInt(digit);
        }
        return reduceNumber(sum);
      };

      // Calculate Destiny Number
      const calculateDestiny = (fullName: string): number => {
        // Sum all letters in the full name using the numerology chart
        let sum = 0;
        for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
          sum += letterToNumber(char);
        }
        return reduceNumber(sum);
      };

      // Calculate Soul Urge Number
      const calculateSoulUrge = (fullName: string): number => {
        // Sum only vowels (A, E, I, O, U, Y) using the numerology chart
        let sum = 0;
        const vowels = 'AEIOUY';
        for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
          if (vowels.includes(char.toUpperCase())) {
            sum += letterToNumber(char);
          }
        }
        return reduceNumber(sum);
      };

      // Calculate Personality Number - based on day digits only
      const calculatePersonality = (date: string): number => {
        const dateParts = date.split('-');
        if (dateParts.length !== 3) return 5;
        
        const day = dateParts[2]; // DD - only use day digits
        
        // Get all digits from day only
        const digits = day.split('').map(Number);
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

      // Map a number to its color name - standardized with remedies data
      const getColorName = (num: number): string => {
        const colorMap: Record<number, string> = {
          1: "Yellow",   // Solar Plexus Chakra - Sun
          2: "Green",    // Heart Chakra - Moon
          3: "Violet",   // Crown Chakra - Jupiter
          4: "Brown",    // Earth Star Chakra - Rahu
          5: "Blue",     // Throat Chakra - Mercury
          6: "Orange",   // Sacral Chakra - Venus
          7: "White",    // Soul Star Chakra - Ketu
          8: "Indigo",   // Third Eye Chakra - Saturn
          9: "Red",      // Root Chakra - Mars
          11: "Silver",  // Master Number - Soul Star
          22: "Gold",    // Master Number - Solar Plexus
          33: "Platinum" // Master Number - Crown
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

  // Get user's object analyses
  app.get("/api/object-analyses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const objectAnalyses = await storage.getObjectAnalysesByUser(req.user.id);
      res.json(objectAnalyses);
    } catch (error) {
      console.error("Error retrieving object analyses:", error);
      res.status(500).json({ message: "Failed to retrieve object analyses" });
    }
  });

  // Update object analysis review
  app.post("/api/object-analyses/:id/review", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { id } = req.params;
      const { rating, reviewText } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const updatedAnalysis = await storage.updateObjectAnalysisReview(
        parseInt(id), 
        rating, 
        reviewText
      );
      
      if (!updatedAnalysis) {
        return res.status(404).json({ message: "Object analysis not found" });
      }

      res.json(updatedAnalysis);
    } catch (error) {
      console.error("Error updating object analysis review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Create HTTP server with optimized settings for fast startup
  const httpServer = createServer(app);
  
  // Set server timeouts to prevent health check failures
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;
  
  return httpServer;
}
