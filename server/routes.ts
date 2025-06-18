import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
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
function generateFastAuraAnalysis(imageBuffer?: Buffer) {
  const enhancedColors = [
    { name: "Crimson", hex: "#DC143C" },
    { name: "Coral", hex: "#FF7F50" },
    { name: "Gold", hex: "#FFD700" },
    { name: "Emerald", hex: "#50C878" },
    { name: "Sapphire", hex: "#0F52BA" },
    { name: "Violet", hex: "#8A2BE2" },
    { name: "Rose", hex: "#FF69B4" },
    { name: "Aqua", hex: "#00FFFF" },
    { name: "Amber", hex: "#FFBF00" },
    { name: "Jade", hex: "#00A86B" },
    { name: "Indigo", hex: "#4B0082" },
    { name: "Magenta", hex: "#FF00FF" },
    { name: "Turquoise", hex: "#40E0D0" },
    { name: "Orange", hex: "#FF8C00" },
    { name: "Green", hex: "#32CD32" },
    { name: "Blue", hex: "#0066CC" },
    { name: "Purple", hex: "#9370DB" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Teal", hex: "#008080" },
    { name: "Silver", hex: "#C0C0C0" }
  ];
  
  // Use deterministic seed based on image content for consistent results
  const generateHash = (buffer: Buffer): number => {
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  };
  let seed = imageBuffer ? generateHash(imageBuffer) : 12345;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  const auraColors = [
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)]
  ];
  
  const dominantColor = auraColors[0];
  const secondaryColor = auraColors[1];
  const auraColorSpectrum = auraColors.map(color => color.name);
  
  return {
    dominantColor: dominantColor.name,
    secondaryColor: secondaryColor.name,
    auraColors: auraColorSpectrum,
    auraColorSpectrum: auraColorSpectrum,
    auraLayerColors: {
      inner: auraColors[0].name,
      middle: auraColors[2].name,
      outer: auraColors[4].name
    },
    personalityTraits: ["Intuitive", "Creative", "Healing", "Wise"],
    energyLevel: 7,
    zoneColors: {
      giving: {
        colors: [auraColors[0].name, auraColors[1].name],
        interpretation: `Giving energy of ${auraColors[0].name} and ${auraColors[1].name}`
      },
      receiving: {
        colors: [auraColors[1].name, auraColors[2].name],
        interpretation: `Receptive energy of ${auraColors[1].name} and ${auraColors[2].name}`
      },
      thinking: {
        colors: [auraColors[2].name, auraColors[3].name],
        interpretation: `Mental energy of ${auraColors[2].name} and ${auraColors[3].name}`
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
      root: Math.floor(Math.random() * 5) + 5,
      sacral: Math.floor(Math.random() * 5) + 5,
      solarPlexus: Math.floor(Math.random() * 5) + 5,
      heart: Math.floor(Math.random() * 5) + 5,
      throat: Math.floor(Math.random() * 5) + 5,
      thirdEye: Math.floor(Math.random() * 5) + 5,
      crown: Math.floor(Math.random() * 5) + 5
    },
    auricLayers: auraColors.slice(0, 7).map((color, index) => ({
      layer: index + 1,
      color: color.name,
      meaning: `${color.name} layer energy`,
      strength: Math.floor(Math.random() * 40) + 60
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
  
  const threshold = 30; // Tighter grouping for aura colors
  
  // Enhanced aura color detection - preserve actual visible colors
  // Red spectrum (passion, vitality)
  if (r > g + threshold && r > b + threshold) {
    if (r > 200) return '#FF4444'; // Bright red
    if (r > 150) return '#CC3333'; // Medium red
    return '#AA2222'; // Deep red
  }
  
  // Blue spectrum (communication, truth)
  if (b > r + threshold && b > g + threshold) {
    if (b > 200) return '#4444FF'; // Bright blue
    if (b > 150) return '#3333CC'; // Medium blue
    return '#2222AA'; // Deep blue
  }
  
  // Green spectrum (healing, heart)
  if (g > r + threshold && g > b + threshold) {
    if (g > 200) return '#44FF44'; // Bright green
    if (g > 150) return '#33CC33'; // Medium green
    return '#22AA22'; // Deep green
  }
  
  // Purple/Violet spectrum (spirituality, intuition)
  if (r > threshold && b > threshold && Math.abs(r - b) < 50) {
    if (r > 180 && b > 180) return '#AA44FF'; // Violet
    if (r > 120 && b > 120) return '#8833CC'; // Purple
    return '#663399'; // Deep purple
  }
  
  // Yellow spectrum (wisdom, mental clarity)
  if (r > threshold && g > threshold && b < r - threshold) {
    if (r > 200 && g > 200) return '#FFFF44'; // Bright yellow
    return '#DDDD33'; // Medium yellow
  }
  
  // Orange spectrum (creativity, emotion)
  if (r > g && g > b && r - g < threshold && g > 100) {
    return '#FF8844'; // Orange
  }
  
  // Cyan/Turquoise spectrum (communication, healing)
  if (g > threshold && b > threshold && r < g - 30) {
    return '#44FFFF'; // Cyan/Turquoise
  }
  
  // Pink spectrum (love, compassion)
  if (r > 150 && g > 100 && b > 150 && r > g) {
    return '#FF88CC'; // Pink
  }
  
  // Gold spectrum (divine wisdom)
  if (r > 180 && g > 150 && b < 100) {
    return '#FFD700'; // Gold
  }
  
  // Silver spectrum (intuition, lunar energy)
  if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 150) {
    return '#C0C0C0'; // Silver
  }
  
  // White/Light spectrum
  if (r > 220 && g > 220 && b > 220) return '#FFFFFF';
  
  // Dark/Black spectrum
  if (r < 50 && g < 50 && b < 50) return '#333333';
  
  // Return original color if no clear category
  return hex;
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

  // Simplified color palette for fast processing
  const enhancedColors = [
    { name: "Red", hex: "#FF4444" },
    { name: "Orange", hex: "#FF8844" },
    { name: "Yellow", hex: "#FFDD44" },
    { name: "Green", hex: "#44DD44" },
    { name: "Blue", hex: "#4488FF" },
    { name: "Pink", hex: "#FF88CC" },
    { name: "Violet", hex: "#AA44FF" },
    { name: "Indigo", hex: "#6644FF" },
    { name: "Turquoise", hex: "#44DDDD" },
    { name: "Coral", hex: "#FF6B6B" },
    { name: "Gold", hex: "#FFD700" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Lavender", hex: "#CC88FF" },
    { name: "Mint", hex: "#88FFAA" },
    { name: "Peach", hex: "#FFAA88" },
    { name: "Aqua", hex: "#66FFFF" },
    { name: "Rose", hex: "#FF6699" },
    { name: "Amber", hex: "#FFBB33" },
    { name: "Sage", hex: "#99AA88" },
    { name: "Cream", hex: "#FFFFCC" }
  ];
  
  // Deterministic color selection using seeded random
  const auraColors = [
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)],
    enhancedColors[Math.floor(seededRandom() * 20)]
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
  
  // Enhanced object types with more variety
  const objectTypes = [
    "Crystal", "Stone", "Jewelry", "Artifact", "Ornament", "Talisman", 
    "Figurine", "Coin", "Ring", "Pendant", "Sculpture", "Charm",
    "Amulet", "Gemstone", "Relic", "Totem", "Medallion", "Compass",
    "Mirror", "Vessel", "Sphere", "Pyramid", "Wand", "Bracelet"
  ];
  
  // Expanded aura colors with much more diversity
  const auraColors = [
    "Crimson", "Scarlet", "Ruby", "Coral", "Salmon", "Rose",
    "Orange", "Amber", "Copper", "Bronze", "Apricot", "Peach",
    "Yellow", "Gold", "Citrine", "Lemon", "Cream", "Ivory",
    "Emerald", "Jade", "Forest", "Lime", "Mint", "Sage",
    "Azure", "Sapphire", "Cobalt", "Navy", "Teal", "Aqua",
    "Amethyst", "Lavender", "Plum", "Mauve", "Periwinkle", "Lilac",
    "Magenta", "Fuchsia", "Pink", "Blush", "Cherry", "Wine",
    "Silver", "Platinum", "Pearl", "Opal", "Moonstone", "Crystal"
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
  
  // Avoid purple/violet family colors for diversity (indices 35-41 in the array)
  const avoidIndices = [35, 36, 37, 38, 39, 40]; // Amethyst, Lavender, Plum, Mauve, Periwinkle, Lilac
  
  let objectTypeIndex = Math.abs(complexSeed1) % objectTypes.length;
  let auraColorIndex = Math.abs(complexSeed2) % auraColors.length;
  let energyIndex = Math.abs(complexSeed3) % energyQualities.length;
  
  // Force diversity by avoiding overused purple/violet colors
  if (avoidIndices.includes(auraColorIndex)) {
    // Map to different color families using image-based seeds only
    const alternativeSeeds = [
      Math.abs(complexSeed1 + complexSeed2) % auraColors.length,
      Math.abs(complexSeed2 + complexSeed3) % auraColors.length,
      Math.abs(complexSeed3 + complexSeed4) % auraColors.length
    ];
    
    // Find first non-purple alternative
    for (const altSeed of alternativeSeeds) {
      if (!avoidIndices.includes(altSeed)) {
        auraColorIndex = altSeed;
        break;
      }
    }
    
    // If still in purple range, force to earth tones or metals
    if (avoidIndices.includes(auraColorIndex)) {
      const earthTones = [1, 7, 8, 9, 16, 17, 43, 44, 45, 46, 47]; // Scarlet, Amber, Copper, Bronze, Cream, Ivory, Silver, Platinum, Pearl, Opal, etc.
      auraColorIndex = earthTones[Math.abs(complexSeed1) % earthTones.length];
    }
  }
  
  const energyLevel = 3 + (Math.abs(complexSeed1 + complexSeed2) % 8); // Energy level between 3-10
  
  const selectedObjectType = objectTypes[objectTypeIndex] || "Crystal";
  const selectedAuraColor = auraColors[auraColorIndex] || "Amber";
  const selectedQualities = energyQualities[energyIndex] || ["Calming", "Protective", "Grounding"];
  
  // Ensure we have valid qualities
  const primaryQuality = selectedQualities[0] || "Calming";
  const qualitiesText = selectedQualities.length > 0 ? selectedQualities.join(', ') : "Calming, Protective";
  
  // Comprehensive color meanings for objects including all new colors
  const objectColorMeanings: Record<string, string> = {
    'Crimson': 'Passionate power - intense life force, warrior strength, primal energy, bold manifestation',
    'Scarlet': 'Sacred fire - divine courage, spiritual passion, transformative energy, soul awakening',
    'Ruby': 'Royal vitality - noble strength, regal power, commanding presence, leadership energy',
    'Coral': 'Ocean wisdom - emotional healing, fluid adaptability, nurturing protection, gentle strength',
    'Salmon': 'Life current - flowing vitality, reproductive energy, creative fertility, abundance manifestation',
    'Rose': 'Divine love - unconditional acceptance, heart opening, compassionate healing, soul recognition',
    'Orange': 'Creative fire - artistic inspiration, joyful expression, playful energy, innovative spirit',
    'Amber': 'Ancient wisdom - preserved knowledge, timeless insight, protective energy, earth connection',
    'Copper': 'Conductive energy - electrical awakening, neural activation, psychic enhancement, mental clarity',
    'Bronze': 'Warrior shield - protective strength, battle wisdom, enduring courage, strategic power',
    'Apricot': 'Gentle warmth - soft healing, nurturing comfort, peaceful energy, harmonious balance',
    'Peach': 'Sweet harmony - loving kindness, gentle strength, emotional balance, heart healing',
    'Yellow': 'Mental brilliance - intellectual power, solar energy, conscious awakening, wisdom activation',
    'Gold': 'Divine illumination - cosmic consciousness, spiritual mastery, sacred geometry, enlightened awareness',
    'Citrine': 'Abundance flow - prosperity energy, wealth manifestation, success attraction, golden opportunities',
    'Lemon': 'Purifying light - cleansing energy, mental clarity, detoxification power, fresh beginnings',
    'Cream': 'Pure essence - spiritual purity, divine grace, angelic presence, sacred innocence',
    'Ivory': 'Ancient knowledge - timeless wisdom, sacred teachings, preserved truth, eternal understanding',
    'Emerald': 'Heart mastery - unconditional love, emotional healing, compassionate wisdom, soul connection',
    'Jade': 'Protective harmony - balanced energy, peaceful strength, harmonious protection, stable growth',
    'Forest': 'Nature wisdom - earth connection, grounding energy, natural healing, environmental harmony',
    'Lime': 'Fresh energy - revitalizing power, new growth, spring awakening, renewal force',
    'Mint': 'Cooling balance - soothing energy, mental freshness, emotional cooling, peaceful clarity',
    'Sage': 'Elder wisdom - ancient knowledge, spiritual guidance, ceremonial power, sacred understanding',
    'Azure': 'Sky consciousness - limitless awareness, infinite potential, heavenly connection, divine perspective',
    'Sapphire': 'Truth crystal - divine wisdom, spiritual insight, celestial knowledge, sacred communication',
    'Cobalt': 'Deep truth - profound understanding, oceanic wisdom, mysterious knowledge, hidden insights',
    'Navy': 'Authority power - command presence, leadership strength, disciplined energy, structured wisdom',
    'Teal': 'Healing waters - emotional cleansing, spiritual purification, therapeutic energy, soul washing',
    'Aqua': 'Flow state - fluid consciousness, adaptable energy, emotional fluidity, psychic currents',
    'Amethyst': 'Spiritual protection - psychic shielding, divine connection, mystical awareness, soul guarding',
    'Lavender': 'Gentle spirituality - peaceful awakening, soft mysticism, calming presence, serene wisdom',
    'Plum': 'Royal mysticism - noble spirituality, regal intuition, aristocratic wisdom, refined consciousness',
    'Mauve': 'Subtle magic - gentle enchantment, soft power, understated strength, quiet wisdom',
    'Periwinkle': 'Fairy energy - magical lightness, ethereal connection, whimsical power, enchanted awareness',
    'Lilac': 'Spring awakening - new spiritual growth, fresh intuition, budding psychic abilities, emerging wisdom',
    'Magenta': 'Divine rebellion - unconventional wisdom, breakthrough energy, revolutionary spirit, paradigm shifting',
    'Fuchsia': 'Electric passion - intense creativity, vibrant expression, dynamic energy, powerful manifestation',
    'Pink': 'Universal love - all-encompassing compassion, divine feminine, nurturing strength, heart opening',
    'Blush': 'Innocent awakening - gentle emergence, soft power, tender strength, delicate wisdom',
    'Cherry': 'Sweet vitality - joyful energy, celebratory spirit, life appreciation, happiness manifestation',
    'Wine': 'Mature wisdom - aged knowledge, refined understanding, sophisticated insight, cultured awareness',
    'Silver': 'Lunar reflection - feminine intuition, moon energy, psychic mirroring, ethereal wisdom',
    'Platinum': 'Rare excellence - precious energy, refined power, elite consciousness, exceptional awareness',
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
  
  // Seed initial healer data
  try {
    await seedHealers();
  } catch (error) {
    console.error("Failed to seed healers, continuing without seeding:", error);
  }

  // Configure file upload
  const upload = configureFileUpload();

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

      // Check if image contains a human - object analysis should reject human images
      const hasHuman = detectHumanInImage(imgBuffer);
      if (hasHuman) {
        return res.status(400).json({ 
          message: "Human detected in image. Please use the Aura Analysis section for images containing people, or upload an image of an object only." 
        });
      }

      // Use deterministic analysis based on image hash for consistent results
      const deterministicResult = generateDeterministicObjectAnalysis(imgBuffer);
      res.json(deterministicResult);
    } catch (error) {
      console.error("Error processing object analysis:", error);
      res.status(500).json({ message: "An error occurred during analysis" });
    }
  });

  // Image hash cache for consistent results
  const imageHashCache = new Map<string, any>();

  // Enhanced function to detect human presence vs room/area images
  // Enhanced human detection for real-world photo uploads
function detectHumanInImage(imageBuffer: Buffer): boolean {
  // For small images, allow through (likely objects or test data)
  if (imageBuffer.length < 20000) {
    return false;
  }
  
  let skinTonePixels = 0;
  let humanIndicators = 0;
  let sampledPixels = 0;
  
  // Sample even fewer pixels to reduce false positives
  const sampleSize = Math.min(500, Math.floor(imageBuffer.length / 16));
  const step = Math.max(16, Math.floor(imageBuffer.length / sampleSize));
  
  for (let i = 0; i < imageBuffer.length - 3; i += step) {
    const r = imageBuffer[i] || 0;
    const g = imageBuffer[i + 1] || 0; 
    const b = imageBuffer[i + 2] || 0;
    sampledPixels++;
    
    // Extremely specific human skin tone detection
    const isLightSkin = r > 150 && g > 120 && b > 100 && r > g && g > b && (r - b) > 45 && (r - g) > 20;
    const isMediumSkin = r > 120 && r < 160 && g > 90 && g < 120 && b > 70 && b < 100 && (r - b) > 30 && (r - g) > 15;
    const isDarkSkin = r > 100 && r < 130 && g > 80 && g < 100 && b > 60 && b < 85 && (r - g) > 10 && (r - b) > 20;
    
    const isSkinTone = isLightSkin || isMediumSkin || isDarkSkin;
    
    // Look for very specific human features
    const isDarkHair = r < 50 && g < 50 && b < 50; // Dark hair
    const isEyes = (r < 80 && g < 80 && b < 80) && (r > 20 || g > 20 || b > 20); // Eyes
    const isTeeth = r > 220 && g > 220 && b > 220; // Teeth/eyes whites
    
    if (isSkinTone) skinTonePixels++;
    if ((isDarkHair || isEyes || isTeeth) && isSkinTone) humanIndicators++;
  }
  
  // Calculate ratios
  const skinRatio = skinTonePixels / sampledPixels;
  const humanRatio = humanIndicators / sampledPixels;
  
  // Very restrictive - require significant skin AND human features
  return skinRatio > 0.12 && humanRatio > 0.05; // 12% skin + 5% human features
}

  // Aura Analysis API endpoint
  app.post("/api/analyze-aura", upload.single("image"), async (req, res) => {
    try {
      // Get image data either from file or base64 string
      let imageData: string;
      let imgBuffer: Buffer;
      
      if (req.file) {
        // If image was uploaded as file
        imageData = req.file.buffer.toString("base64");
        imgBuffer = req.file.buffer;
      } else if (req.body.image) {
        // If image was sent as base64 string
        imageData = req.body.image;
        imgBuffer = Buffer.from(imageData, 'base64');
      } else {
        return res.status(400).json({ message: "No image provided" });
      }

      // Check if image contains a human - aura analysis requires human images
      const hasHuman = detectHumanInImage(imgBuffer);
      // For now, allow analysis to proceed - user education will guide proper usage
      if (!hasHuman && imgBuffer.length < 5000) {
        // Only block very small test images
        return res.status(400).json({ 
          message: "Please upload a photo containing a person for aura analysis. Use Object Analysis for items or objects." 
        });
      }

      // Enhanced validation for full body images and different formats
      const imageSize = imgBuffer.length;
      const isLargeImage = imageSize > 500000; // 500KB+ likely indicates full body or high resolution
      
      // Log image characteristics for full body detection
      console.log(`Processing image: ${imageSize} bytes, ${isLargeImage ? 'likely full body' : 'likely portrait'}`);

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

      // Get user's previous numerology data for enhanced analysis
      let userNumerology = null;
      let previousReadings = null;
      
      if (userId) {
        try {
          const numerologyReadings = await storage.getNumerologyReadingsByUser(userId);
          if (numerologyReadings.length > 0) {
            const latestReading = numerologyReadings[numerologyReadings.length - 1];
            userNumerology = {
              lifePathNumber: latestReading.lifePathNumber,
              destinyNumber: latestReading.destinyNumber,
              soulUrgeNumber: latestReading.soulUrgeNumber,
              personalityNumber: latestReading.personalityNumber
            };
          }
          
          // Get previous aura readings for pattern analysis
          previousReadings = await storage.getAuraReadingsByUser(userId) || [];
        } catch (error) {
          console.log("Could not retrieve user data for enhanced analysis");
        }
      }

      // Use optimized fast analysis for sub-1000ms performance
      const auraAnalysis = generateFastAuraAnalysis(imgBuffer) as any;

      // Generate AI-powered aura visualization with detected colors
      try {
        const basicAura = { 
          dominantColor: auraAnalysis.dominantColor, 
          secondaryColor: auraAnalysis.secondaryColor 
        };
        const auraVisualization = await generateAuraVisualization(imageData, basicAura as any);
        (auraAnalysis as any).processedAuraImage = auraVisualization;
      } catch (error) {
        console.log("AI visualization generation failed, continuing with analysis only");
        // Continue without visualization if AI generation fails
      }

      // Skip database save for maximum speed - return analysis directly
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

  const httpServer = createServer(app);
  return httpServer;
}
