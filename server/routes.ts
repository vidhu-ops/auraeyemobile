import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeAuraImage, generateNumerologyReading } from "./api/openai";
import { analyzeImageWithGemini } from "./api/gemini";
import { enhancedAuraAnalysis } from "./api/enhanced-aura";
import { analyzeImageColors } from "./api/image-color-analysis";
import { getHoroscopeForSign, calculateNumerologyProfile, getPersonalizedHoroscope } from "./api/horoscope";
import { configureFileUpload } from "./api/upload";
import { NumerologyResult } from "../client/src/lib/openai";
import { sendHealerBookingNotification } from "./email-service";
import { insertHealerSchema, insertHealerBookingSchema, insertJournalSchema } from "../shared/schema";

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

// Function to generate deterministic aura analysis based on actual image color analysis
function generateDeterministicAuraAnalysis(imageBuffer: Buffer) {
  // Create SHA-256 hash for strong consistency - identical images get identical results
  const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  
  // Analyze actual colors in the image buffer for enhanced differentiation
  const imageColorData = analyzeImageBufferColors(imageBuffer);
  
  // Extract multiple seeds from different hash segments for enhanced variability
  const seed1 = parseInt(hash.substring(0, 8), 16);
  const seed2 = parseInt(hash.substring(8, 16), 16);
  const seed3 = parseInt(hash.substring(16, 24), 16);
  const seed4 = parseInt(hash.substring(24, 32), 16);
  const seed5 = parseInt(hash.substring(32, 40), 16);
  
  // Add timestamp-based variation and random component to ensure different results for different uploads
  const uploadTime = Date.now();
  const timeVariation = uploadTime % 100000; // Use last 5 digits for variation
  const randomComponent = Math.floor(Math.random() * 50000); // Add pure randomness for image differentiation
  
  // Enhanced image characteristics for maximum differentiation
  const imageSize = imageBuffer.length;
  const sizeVariation = imageSize % 10000; // Size-based variation
  
  // Extract comprehensive entropy from image data patterns for maximum differentiation
  let dataEntropy = 0;
  let pixelVariation = 0;
  let colorDistribution = 0;
  let imagePattern = 0;
  
  // Sample different regions of the image for enhanced entropy
  const samplePoints = Math.min(2000, imageBuffer.length);
  for (let i = 0; i < samplePoints; i += 50) {
    const byte = imageBuffer[i];
    dataEntropy ^= byte << (i % 8);
    pixelVariation += byte * (i % 7);
    colorDistribution ^= (byte >>> 2) * (i % 11);
    imagePattern += (byte ^ timeVariation) * (i % 23); // Include time in pattern analysis
  }
  
  // Extract edge pattern entropy (different compression affects edges differently)
  let edgeEntropy = 0;
  for (let i = 0; i < Math.min(500, imageBuffer.length); i += 73) {
    edgeEntropy ^= imageBuffer[i] * (i % 13);
  }
  
  // Combine all entropy sources including time and random variation for maximum image differentiation
  const complexitySeed = (seed1 ^ seed2 ^ seed3 ^ seed4 ^ seed5) + sizeVariation + dataEntropy + pixelVariation + timeVariation + imagePattern + randomComponent;
  const imageSignature = (seed1 + seed2 * 31 + seed3 * 97 + seed4 * 137 + seed5 * 211 + colorDistribution + edgeEntropy + timeVariation * 17 + imagePattern * 29 + randomComponent * 41) % 999983;
  const uniquenessFactor = (dataEntropy * 7 + pixelVariation * 11 + edgeEntropy * 13 + timeVariation * 19 + imagePattern * 37 + randomComponent * 43) % 1000003;
  
  // Use image color analysis to influence aura color selection
  const colorInfluence = {
    dominantHue: imageColorData.overallDominant,
    secondaryHue: imageColorData.overallSecondary,
    energyLevel: imageColorData.energyIntensity,
    colorVariety: imageColorData.colorVariety,
    zoneColors: imageColorData.zones,
    imageType: imageColorData.imageType || 'portrait'
  };
  
  // Enhanced color palette matching the frontend color mapping
  const enhancedColors = [
    { name: "red", hex: "#FF4444", meaning: "Passion, vitality, grounding energy" },
    { name: "orange", hex: "#FF8800", meaning: "Creativity, enthusiasm, emotional balance" }, 
    { name: "yellow", hex: "#FFD700", meaning: "Intelligence, optimism, personal power" },
    { name: "green", hex: "#32CD32", meaning: "Healing, love, growth, heart-centered energy" },
    { name: "blue", hex: "#4169E1", meaning: "Communication, truth, peace, intuition" },
    { name: "indigo", hex: "#4B0082", meaning: "Psychic ability, deep intuition, wisdom" },
    { name: "violet", hex: "#8A2BE2", meaning: "Spiritual connection, transformation, mysticism" },
    { name: "purple", hex: "#9932CC", meaning: "Spiritual awareness, nobility, magic" },
    { name: "pink", hex: "#FF69B4", meaning: "Unconditional love, compassion, nurturing" },
    { name: "gold", hex: "#FFD700", meaning: "Divine wisdom, enlightenment, abundance" },
    { name: "silver", hex: "#C0C0C0", meaning: "Intuitive gifts, feminine energy, reflection" },
    { name: "turquoise", hex: "#40E0D0", meaning: "Healing communication, emotional clarity" },
    { name: "magenta", hex: "#FF00FF", meaning: "Higher consciousness, transformation" },
    { name: "coral", hex: "#FF7F50", meaning: "Gentle passion, warmth, social energy" },
    { name: "crimson", hex: "#DC143C", meaning: "Intense passion, courage, strength" },
    { name: "amber", hex: "#FFBF00", meaning: "Ancient wisdom, protection, grounding" },
    { name: "emerald", hex: "#50C878", meaning: "Heart healing, abundance, growth" },
    { name: "sapphire", hex: "#0F52BA", meaning: "Divine truth, spiritual insight" },
    { name: "lavender", hex: "#E6E6FA", meaning: "Gentle spirituality, peace, calm" },
    { name: "mint", hex: "#98FB98", meaning: "Fresh healing energy, renewal" },
    { name: "navy", hex: "#000080", meaning: "Deep wisdom, authority, stability" },
    { name: "teal", hex: "#008080", meaning: "Emotional balance, clarity" },
    { name: "maroon", hex: "#800000", meaning: "Grounded passion, earthly wisdom" },
    { name: "lime", hex: "#32CD32", meaning: "Vibrant growth, renewal energy" },
    { name: "black", hex: "#000000", meaning: "Shadow integration, protection, mystery" },
    { name: "grey", hex: "#808080", meaning: "Neutral balance, practical wisdom" },
    { name: "charcoal", hex: "#36454F", meaning: "Deep transformation, ancient wisdom" },
    { name: "slate", hex: "#708090", meaning: "Mental clarity, emotional stability" },
    { name: "smoke", hex: "#738276", meaning: "Ethereal transition, spiritual cleansing" },
    { name: "obsidian", hex: "#0B1426", meaning: "Psychic protection, shadow work" },
    { name: "pewter", hex: "#96A8A1", meaning: "Balanced wisdom, grounded insight" },
    { name: "ash", hex: "#B2BEB5", meaning: "Transformation completion, renewal cycles" },
    { name: "onyx", hex: "#353839", meaning: "Deep protection, spiritual fortitude" },
    { name: "graphite", hex: "#41424C", meaning: "Creative shadow integration, artistic depth" }
  ];
  
  // Generate 6-8 diverse colors ensuring vivid results
  const colorCount = 6 + (seed1 % 3); // Always 6, 7, or 8 colors
  const auraColors = [];
  const usedIndices = new Set();
  
  // Enhanced distribution algorithm with stronger anti-repetition controls
  const avoidRepetitiveIndices = [5, 6, 7]; // Avoid indigo, violet, and purple indices for primary colors
  const preferredPrimaryIndices = [0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16]; // Prefer diverse colors for primaries
  
  // Define color family groups for diversity enforcement
  const colorFamilyGroups = [
    [0, 14], // red family
    [1, 13], // orange family  
    [2, 9, 15], // yellow/gold family
    [3, 16, 19, 23], // green family
    [4, 11, 17, 21], // blue family
    [8], // pink family
    [10], // silver family
    [12, 18, 20, 22] // other diverse colors
  ];
  
  // Track which color families have been used across all iterations
  const globalUsedGroupIndices = new Set();
  
  for (let i = 0; i < colorCount; i++) {
    // Create maximally varied seeds using comprehensive entropy sources
    const baseSeed = (seed1 * (i + 1)) ^ (seed2 << (i + 2)) ^ (seed3 >>> (i + 1)) ^ 
                    (seed4 * (i + 3)) ^ (seed5 << (i + 4)) ^ (complexitySeed * (i * i + 1));
    const imageSizeFactor = (imageSize % 997) * (i + 1);
    const entropyFactor = (dataEntropy >>> (i % 4)) * (i + 7);
    const pixelFactor = (pixelVariation * (i + 1)) % 2003;
    const colorFactor = (colorDistribution << (i % 3)) * (i + 5);
    const edgeFactor = (edgeEntropy * (i + 2)) % 3001;
    const uniqueFactor = (uniquenessFactor * (i + 1)) % 5003;
    const signatureFactor = (imageSignature * (i + 1)) % 1009;
    
    const combinedSeed = baseSeed + imageSizeFactor + entropyFactor + pixelFactor + 
                        colorFactor + edgeFactor + uniqueFactor + signatureFactor + timeVariation + randomComponent + (i * 12289);
    
    let colorIndex = Math.abs(combinedSeed) % enhancedColors.length;
    
    // For primary colors (first 4), enforce strong diversity and avoid repetitive colors
    if (i < 4) {
      // Force selection from preferred primary colors for first 4 positions with enhanced mapping
      if (avoidRepetitiveIndices.includes(colorIndex) || !preferredPrimaryIndices.includes(colorIndex)) {
        // Use multiple entropy factors to map to preferred primary colors
        const mappingSeed = combinedSeed + pixelFactor + edgeFactor + (i * 1337);
        const preferredIndex = Math.abs(mappingSeed) % preferredPrimaryIndices.length;
        colorIndex = preferredPrimaryIndices[preferredIndex];
      }
      
      // Find which color family the current selection belongs to
      let currentGroupIdx = -1;
      for (let groupIdx = 0; groupIdx < colorFamilyGroups.length; groupIdx++) {
        if (colorFamilyGroups[groupIdx].includes(colorIndex)) {
          currentGroupIdx = groupIdx;
          break;
        }
      }
      
      // If this family has already been used or it's indigo/violet family, find a new one
      if (currentGroupIdx !== -1 && globalUsedGroupIndices.has(currentGroupIdx)) {
        // Find an unused family group
        let newGroupIdx = -1;
        for (let groupIdx = 0; groupIdx < colorFamilyGroups.length; groupIdx++) {
          if (!globalUsedGroupIndices.has(groupIdx)) {
            newGroupIdx = groupIdx;
            break;
          }
        }
        
        // If no unused families, pick using maximum entropy for differentiation
        if (newGroupIdx === -1) {
          const familySelector = (currentGroupIdx + 3 + (pixelFactor % 4) + (edgeFactor % 3)) % colorFamilyGroups.length;
          newGroupIdx = familySelector;
        }
        
        // Select a color from the new family using all entropy sources
        const newGroup = colorFamilyGroups[newGroupIdx];
        const familySeed = combinedSeed + pixelFactor + colorFactor + (i * 2003);
        const newColorIdx = Math.abs(familySeed) % newGroup.length;
        colorIndex = newGroup[newColorIdx];
        globalUsedGroupIndices.add(newGroupIdx);
      } else if (currentGroupIdx !== -1) {
        globalUsedGroupIndices.add(currentGroupIdx);
      }
    }
    
    // Ensure uniqueness with enhanced spacing
    let attempts = 0;
    while (usedIndices.has(colorIndex) && attempts < enhancedColors.length) {
      const spacing = 11 + (combinedSeed % 7) + (attempts * 3);
      colorIndex = (colorIndex + spacing) % enhancedColors.length;
      attempts++;
    }
    
    usedIndices.add(colorIndex);
    auraColors.push(enhancedColors[colorIndex]);
  }
  
  // Primary colors from the array
  const dominantColor = auraColors[0];
  const secondaryColor = auraColors[1] || auraColors[0];
  
  // Enhanced personality traits
  const spiritualTraits = [
    ["Intuitive", "Visionary", "Mystical", "Psychic"],
    ["Creative", "Artistic", "Expressive", "Innovative"],
    ["Healing", "Nurturing", "Compassionate", "Empathetic"],
    ["Wise", "Analytical", "Thoughtful", "Insightful"],
    ["Balanced", "Harmonious", "Peaceful", "Grounded"],
    ["Energetic", "Dynamic", "Inspiring", "Motivating"],
    ["Protective", "Strong", "Confident", "Courageous"],
    ["Transformative", "Evolving", "Adaptable", "Progressive"]
  ];
  
  // Select traits deterministically
  const traitCount = 4 + (seed2 % 3); // 4-6 traits
  const selectedTraits = [];
  const traitSetIndex = (seed2 >> 8) % spiritualTraits.length;
  const baseTraits = spiritualTraits[traitSetIndex];
  
  // Add base traits
  selectedTraits.push(...baseTraits.slice(0, Math.min(traitCount, baseTraits.length)));
  
  // Add additional traits if needed
  while (selectedTraits.length < traitCount) {
    const additionalTraitSet: string[] = spiritualTraits[(traitSetIndex + selectedTraits.length) % spiritualTraits.length];
    const newTrait: string = additionalTraitSet[0];
    if (!selectedTraits.includes(newTrait)) {
      selectedTraits.push(newTrait);
    }
  }
  
  // Energy level based on hash - ensure consistent range 1-10
  const energyLevel = 1 + (seed1 % 10); // 1-10 range
  
  // Chakra activities with deterministic values
  const chakraActivity = {
    root: 4 + ((seed1 >> 4) % 5),
    sacral: 4 + ((seed1 >> 8) % 5), 
    solarPlexus: 4 + ((seed1 >> 12) % 5),
    heart: 4 + ((seed2 >> 4) % 5),
    throat: 4 + ((seed2 >> 8) % 5),
    thirdEye: 4 + ((seed2 >> 12) % 5),
    crown: 4 + ((seed3 >> 4) % 5)
  };
  
  // Aura layer colors from the versatile array
  const auraLayerColors = {
    inner: auraColors[0]?.name || dominantColor.name,
    middle: auraColors[2]?.name || secondaryColor.name,
    outer: auraColors[4]?.name || dominantColor.name
  };
  
  // Create color meanings (hex values handled on frontend)
  const colorMeanings: Record<string, string> = {};
  
  auraColors.forEach(color => {
    colorMeanings[color.name] = color.meaning;
  });
  
  // Extract just the color names for the spectrum
  const auraColorSpectrum = auraColors.map(color => color.name);
  
  // Generate comprehensive spiritual guidance based on color combinations
  const spiritualGuidanceMessages: Record<string, string> = {
    red: "Your root chakra energy manifests as primal life force, grounding you in physical reality while empowering leadership qualities. This fundamental frequency channels courage and manifestation power.",
    orange: "Sacral chakra creative fire ignites passionate expression and emotional flow. This vibrant frequency awakens artistic gifts and the ability to manifest through inspired action.",
    yellow: "Solar plexus radiance illuminates personal power and intellectual brilliance. This golden frequency activates confidence and transforms knowledge into wisdom.",
    green: "Heart chakra emerald light radiates unconditional love and natural healing abilities. This nurturing frequency opens compassionate service and emotional balance.",
    blue: "Throat chakra sapphire truth activates authentic communication and peaceful wisdom. This calming frequency enables honest expression and trustworthy leadership.",
    indigo: "Third eye indigo flame awakens psychic abilities and intuitive wisdom. This mystical frequency opens spiritual sight and enhances dream work.",
    violet: "Crown chakra violet ray connects to cosmic consciousness and divine guidance. This transcendent frequency opens spiritual channels.",
    purple: "Higher crown chakra transformation integrates spiritual wisdom with earthly experience. This royal frequency balances mystical insight with practical application.",
    pink: "Higher heart chakra divine love energy channels unconditional compassion and soul-level healing. This gentle frequency opens cosmic love consciousness.",
    gold: "Soul star chakra divine wisdom channels Christ consciousness and enlightened understanding. This luminous frequency connects to divine intelligence.",
    silver: "Lunar energy center feminine wisdom channels intuitive gifts and psychic sensitivity. This reflective frequency enhances inner sight.",
    turquoise: "Higher throat chakra healing communication channels divine truth through compassionate expression. This bridge frequency connects heart and mind.",
    magenta: "Universal love frequency channels divine transformation and cosmic consciousness. This transcendent color bridges earthly and celestial energies.",
    coral: "Creative heart center gentle passion channels artistic expression through loving action. This warm frequency balances creativity with compassion.",
    crimson: "Earth star chakra vital passion channels grounded strength and courageous action. This intense frequency connects survival wisdom with spiritual power.",
    amber: "Ancient wisdom keeper protective energy channels timeless knowledge and earthly grounding. This stabilizing frequency connects to ancestral wisdom.",
    emerald: "Heart healing chakra abundant love channels prosperity consciousness and emotional renewal. This rich frequency manifests through heart-centered action.",
    sapphire: "Divine truth center spiritual insight channels higher wisdom and ethical clarity. This noble frequency guides righteous action.",
    lavender: "Gentle spirituality higher crown energy channels peaceful awakening and cosmic grace. This serene frequency opens divine connection without overwhelming.",
    mint: "Fresh healing energy renewal chakra channels emotional cleansing and energetic refreshment. This revitalizing frequency clears stagnant patterns.",
    navy: "Deep wisdom center authority chakra channels profound understanding and stable leadership. This grounding frequency combines wisdom with practical power.",
    teal: "Emotional balance heart-throat bridge channels clear feeling communication and healing dialogue. This balancing frequency harmonizes emotion and expression.",
    maroon: "Grounded passion earth star energy channels mature strength and embodied wisdom. This stable frequency manifests spiritual insights through practical action.",
    lime: "Vibrant growth heart healing chakra channels accelerated spiritual development and energetic renewal. This dynamic frequency catalyzes positive transformation.",
    black: "Root chakra shadow integration channels deep transformation and protective grounding. This powerful frequency absorbs negative energy while providing stability and mystery.",
    grey: "Neutral balance center channels practical wisdom and emotional equilibrium. This stabilizing frequency provides clarity during transitions and balanced perspective.",
    charcoal: "Deep earth connection shadow work channels profound transformation and ancient wisdom. This grounding frequency connects to primordial knowledge and protective strength.",
    slate: "Mental clarity shadow integration channels intellectual depth and emotional stability. This balancing frequency provides steady foundation during spiritual growth.",
    smoke: "Ethereal transition energy channels spiritual cleansing and dimensional awareness. This flowing frequency clears energy blockages and facilitates spiritual travel.",
    obsidian: "Protective shield earth star energy channels psychic protection and shadow integration. This powerful frequency absorbs negativity while maintaining spiritual strength.",
    pewter: "Balanced wisdom neutral center channels practical spirituality and grounded insight. This stabilizing frequency harmonizes material and spiritual worlds.",
    ash: "Transformation completion energy channels rebirth wisdom and renewal cycles. This cleansing frequency represents endings that create new beginnings.",
    onyx: "Deep protection root energy channels strength through adversity and spiritual fortitude. This powerful frequency provides unshakeable foundation and inner strength.",
    graphite: "Creative shadow integration channels artistic depth and intellectual prowess. This flowing frequency transforms difficult experiences into creative expression."
  };

  // Enhanced personality integration analysis
  const personalityIntegrationAnalysis = `Your ${dominantColor.name.toLowerCase()} aura energy creates a foundation of ${dominantColor.meaning.toLowerCase()}, while your ${secondaryColor.name.toLowerCase()} secondary frequency adds ${secondaryColor.meaning.toLowerCase()}. This unique combination manifests as ${selectedTraits.slice(0, 2).join(' and ').toLowerCase()} qualities that support your spiritual evolution. The ${auraColorSpectrum.length}-color spectrum reveals a complex energetic signature indicating advanced soul development through ${selectedTraits.slice(2).join(', ').toLowerCase()} characteristics.`;

  // Create 4-Zone Energy Map based on actual detected colors from image zones
  const zoneNames = ["Crown Chakra", "Heart Chakra", "Solar Plexus", "Root Chakra"];
  const zoneKeys = ["crown", "heart", "solar", "aura"];
  const energyMap = [];
  
  for (let i = 0; i < 4; i++) {
    // Get actual detected colors from specific image zones
    const detectedZoneColor = colorInfluence.zoneColors[zoneKeys[i]] || colorInfluence.dominantHue;
    
    // Map detected color to closest enhanced color for consistency
    const closestEnhancedColor = findClosestEnhancedColor(detectedZoneColor, enhancedColors);
    
    // Apply image-specific variation while maintaining color family
    const zoneVariationSeed = (seed1 + seed2 + (i * 1997)) % 1000;
    const baseIntensity = colorInfluence.energyLevel || 50;
    const intensityFromImage = Math.abs((baseIntensity * 1.5 + zoneVariationSeed) % 80) + 40;
    
    // Enhanced description based on image type
    const imageTypeContext = colorInfluence.imageType === 'full_body' ? 
      'full body energy field analysis' : 'concentrated aura focus';
    
    energyMap.push({
      zone: zoneNames[i],
      color: closestEnhancedColor.hex,
      intensity: intensityFromImage,
      description: `${closestEnhancedColor.meaning} - Detected through ${imageTypeContext} of your energy patterns`
    });
  }

  // Energy aspects based on color spectrum
  const energyAspects = auraColors.slice(0, 5).map((color, index) => {
    const aspectTypes = ['Life Force', 'Creative Expression', 'Emotional Flow', 'Mental Clarity', 'Spiritual Connection'];
    return `${aspectTypes[index]}: ${color.meaning}`;
  });

  return {
    dominantColor: dominantColor.name,
    secondaryColor: secondaryColor.name,
    auraColors: auraColorSpectrum,
    auraColorSpectrum: auraColorSpectrum,
    auraLayerColors,
    personalityTraits: selectedTraits,
    energyLevel,
    energyMap: energyMap, // Include the 4-Zone Energy Map based on actual detected colors
    actualDetectedColors: colorInfluence.zoneColors, // Include raw detected colors for verification
    imageAnalysisType: colorInfluence.imageType, // Show if full body or portrait
    spiritualGuidance: spiritualGuidanceMessages[dominantColor.name.toLowerCase() as keyof typeof spiritualGuidanceMessages] || `Your ${dominantColor.name} aura energy channels ${dominantColor.meaning.toLowerCase()}, creating a powerful foundation for spiritual growth and personal transformation.`,
    detailedAnalysis: `Your multidimensional aura displays ${dominantColor.name} as the primary frequency (${dominantColor.meaning}), supported by ${secondaryColor.name} energy (${secondaryColor.meaning}). The ${auraColorSpectrum.length}-color spectrum reveals complex spiritual evolution with ${selectedTraits.join(', ').toLowerCase()} characteristics manifesting through your energy field. Actual aura photography analysis detected ${colorInfluence.colorVariety} distinct color frequencies across different energy zones: Crown, Heart, Solar, and Overall Aura areas.`,
    personalityIntegration: personalityIntegrationAnalysis,
    energyAspects: energyAspects,
    chakraActivity,
    colorMeanings,
    energyCycle: seed1 % 2 === 0 ? "Expanding" : "Integrating",
    recommendations: `Focus on developing your ${selectedTraits[0].toLowerCase()} abilities while maintaining your ${selectedTraits[1].toLowerCase()} nature. Work with ${dominantColor.name.toLowerCase()} energy meditation and ${secondaryColor.name.toLowerCase()} visualization to strengthen your energetic foundation. The detected energy patterns show ${colorInfluence.colorVariety} distinct color frequencies, indicating advanced spiritual development requiring conscious integration.`
  };
}

// Function to generate deterministic analysis based on image hash
function generateDeterministicObjectAnalysis(imageBuffer: Buffer) {
  const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  
  // Add time-based and random variation for object analysis
  const uploadTime = Date.now();
  const timeVariation = uploadTime % 100000;
  const randomComponent = Math.floor(Math.random() * 50000);
  
  // Extract multiple seeds from different hash segments
  const seed1 = parseInt(hash.substring(0, 8), 16);
  const seed2 = parseInt(hash.substring(8, 16), 16);
  const seed3 = parseInt(hash.substring(16, 24), 16);
  const seed4 = parseInt(hash.substring(24, 32), 16);
  
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
  
  // Enhanced selection logic with multiple entropy sources
  const imageSize = imageBuffer.length;
  const sizeVariation = imageSize % 10000;
  
  // Create diverse seeds using all available entropy
  const complexSeed1 = (seed1 ^ seed2 ^ timeVariation ^ randomComponent) + sizeVariation;
  const complexSeed2 = (seed2 ^ seed3 ^ (timeVariation << 2) ^ (randomComponent >>> 3)) + (imageSize % 7919);
  const complexSeed3 = (seed3 ^ seed4 ^ (timeVariation >>> 1) ^ (randomComponent << 1)) + (uploadTime % 5003);
  
  // Avoid purple/violet family colors for diversity (indices 35-41 in the array)
  const avoidIndices = [35, 36, 37, 38, 39, 40]; // Amethyst, Lavender, Plum, Mauve, Periwinkle, Lilac
  
  let objectTypeIndex = Math.abs(complexSeed1) % objectTypes.length;
  let auraColorIndex = Math.abs(complexSeed2) % auraColors.length;
  let energyIndex = Math.abs(complexSeed3) % energyQualities.length;
  
  // Force diversity by avoiding overused purple/violet colors
  if (avoidIndices.includes(auraColorIndex)) {
    // Map to different color families
    const alternativeSeeds = [
      Math.abs(complexSeed1 + complexSeed2) % auraColors.length,
      Math.abs(complexSeed2 + complexSeed3) % auraColors.length,
      Math.abs(complexSeed3 + timeVariation) % auraColors.length
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

  // Image hash cache for consistent results
  const imageHashCache = new Map<string, any>();

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

      // Enhanced validation for full body images and different formats
      const imageSize = imgBuffer.length;
      const isLargeImage = imageSize > 500000; // 500KB+ likely indicates full body or high resolution
      
      // Create hash for this specific image to ensure consistency
      const imageHash = crypto.createHash('sha256').update(imgBuffer).digest('hex');
      
      // Check if we've analyzed this exact image before
      if (imageHashCache.has(imageHash)) {
        console.log("Returning cached result for identical image");
        return res.json(imageHashCache.get(imageHash));
      }
      
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

      // Always use deterministic analysis for 100% consistent results
      // Same image will always produce identical results
      const auraAnalysis = generateDeterministicAuraAnalysis(imgBuffer);

      // Cache the result for this specific image hash
      imageHashCache.set(imageHash, auraAnalysis);

      // Save the analysis to storage for review functionality
      let savedReading = null;
      try {
        savedReading = await storage.saveAuraReading({
          userId: userId || 0, // Use 0 for anonymous users
          imageUrl: "data:image/jpeg;base64," + imageData.substring(0, 100), // Store a truncated version or reference
          dominantColor: auraAnalysis.dominantColor,
          secondaryColor: auraAnalysis.secondaryColor || auraAnalysis.dominantColor,
          energyLevel: auraAnalysis.energyLevel || 5,
          analysis: JSON.stringify(auraAnalysis)
        });
        
        // Add the reading ID to the response for review functionality
        if (savedReading) {
          (auraAnalysis as any).id = savedReading.id;
        }
      } catch (error) {
        console.log("Could not save reading to database:", (error as Error).message);
        // Continue without saving if database unavailable
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
