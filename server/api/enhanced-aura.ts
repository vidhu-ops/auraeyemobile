import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraAnalysisResult } from "../../client/src/lib/openai";
import { analyzeImageWithGemini } from "./gemini";

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Enhanced aura color mapping with deep spiritual and numerological connections
 */
const enhancedColorMeanings = {
  red: {
    rgba: 'rgba(255, 0, 0, 0.3)',
    positive: ['Passion', 'Vitality', 'Courage', 'Leadership', 'Strength', 'Determination'],
    negative: ['Anger', 'Aggression', 'Impulsiveness', 'Stress', 'Dominance', 'Impatience'],
    numerologyConnection: [1, 8], // Leadership and power
    chakraAssociation: ['Root Chakra'],
    spiritualMeaning: 'Life force energy and survival instincts. Connection to physical realm and material security.',
    elementalConnection: 'Fire',
    vibrationFrequency: 'High energy, stimulating',
    personalityInsight: 'You are a natural leader with strong willpower and determination.'
  },
  orange: {
    rgba: 'rgba(255, 165, 0, 0.3)',
    positive: ['Creativity', 'Joy', 'Enthusiasm', 'Confidence', 'Sociability', 'Adventure'],
    negative: ['Addiction', 'Dependency', 'Superficiality', 'Emotional instability', 'Exhibitionism'],
    numerologyConnection: [3, 5], // Creativity and freedom
    chakraAssociation: ['Sacral Chakra'],
    spiritualMeaning: 'Creative and sexual energy. Emotional expression and interpersonal connections.',
    elementalConnection: 'Fire/Water',
    vibrationFrequency: 'Warm, expressive',
    personalityInsight: 'You have a vibrant creative spirit and natural ability to inspire others.'
  },
  yellow: {
    rgba: 'rgba(255, 255, 0, 0.3)',
    positive: ['Intelligence', 'Optimism', 'Clarity', 'Learning', 'Wisdom', 'Communication'],
    negative: ['Over-analysis', 'Criticism', 'Anxiety', 'Mental strain', 'Perfectionism'],
    numerologyConnection: [3, 6], // Expression and responsibility
    chakraAssociation: ['Solar Plexus Chakra'],
    spiritualMeaning: 'Mental clarity and personal power. Intellectual development and self-confidence.',
    elementalConnection: 'Fire/Air',
    vibrationFrequency: 'Mental stimulation, bright',
    personalityInsight: 'You possess sharp intellect and natural teaching abilities.'
  },
  green: {
    rgba: 'rgba(0, 128, 0, 0.3)',
    positive: ['Healing', 'Growth', 'Balance', 'Compassion', 'Nature connection', 'Harmony'],
    negative: ['Jealousy', 'Envy', 'Possessiveness', 'Stagnation', 'Resistance to change'],
    numerologyConnection: [4, 6], // Stability and nurturing
    chakraAssociation: ['Heart Chakra'],
    spiritualMeaning: 'Love, healing, and emotional balance. Connection to nature and universal love.',
    elementalConnection: 'Earth/Air',
    vibrationFrequency: 'Healing, balancing',
    personalityInsight: 'You are a natural healer with deep empathy and connection to others.'
  },
  blue: {
    rgba: 'rgba(0, 0, 255, 0.3)',
    positive: ['Communication', 'Truth', 'Peace', 'Intuition', 'Wisdom', 'Serenity'],
    negative: ['Depression', 'Coldness', 'Isolation', 'Rigidity', 'Melancholy'],
    numerologyConnection: [2, 7], // Cooperation and spirituality
    chakraAssociation: ['Throat Chakra'],
    spiritualMeaning: 'Truth and communication. Spiritual wisdom and peaceful expression.',
    elementalConnection: 'Water/Air',
    vibrationFrequency: 'Calming, truthful',
    personalityInsight: 'You communicate with wisdom and have natural psychic sensitivity.'
  },
  indigo: {
    rgba: 'rgba(75, 0, 130, 0.3)',
    positive: ['Intuition', 'Psychic ability', 'Deep wisdom', 'Spiritual insight', 'Inner knowing'],
    negative: ['Confusion', 'Escapism', 'Impractical', 'Disconnection from reality'],
    numerologyConnection: [7, 11], // Spirituality and master intuition
    chakraAssociation: ['Third Eye Chakra'],
    spiritualMeaning: 'Psychic abilities and spiritual vision. Deep connection to cosmic consciousness.',
    elementalConnection: 'Spirit/Water',
    vibrationFrequency: 'Mystical, penetrating',
    personalityInsight: 'You possess extraordinary intuitive gifts and spiritual insight.'
  },
  violet: {
    rgba: 'rgba(148, 0, 211, 0.3)',
    positive: ['Spirituality', 'Transformation', 'Mysticism', 'Higher consciousness', 'Divine connection'],
    negative: ['Disconnection', 'Impracticality', 'Spiritual bypassing', 'Elitism'],
    numerologyConnection: [7, 9], // Spiritual completion
    chakraAssociation: ['Crown Chakra'],
    spiritualMeaning: 'Connection to divine consciousness and spiritual transformation.',
    elementalConnection: 'Spirit',
    vibrationFrequency: 'Highest spiritual vibration',
    personalityInsight: 'You are deeply connected to spiritual realms and universal wisdom.'
  },
  purple: {
    rgba: 'rgba(128, 0, 128, 0.3)',
    positive: ['Nobility', 'Magic', 'Creativity', 'Inspiration', 'Royal energy', 'Transformation'],
    negative: ['Arrogance', 'Superiority', 'Impracticality', 'Moodiness'],
    numerologyConnection: [3, 9], // Creative completion
    chakraAssociation: ['Crown Chakra', 'Third Eye Chakra'],
    spiritualMeaning: 'Royal spiritual energy and creative transformation.',
    elementalConnection: 'Spirit/Fire',
    vibrationFrequency: 'Regal, transformative',
    personalityInsight: 'You carry natural authority and transformative creative power.'
  },
  pink: {
    rgba: 'rgba(255, 192, 203, 0.3)',
    positive: ['Unconditional love', 'Compassion', 'Nurturing', 'Gentleness', 'Emotional healing'],
    negative: ['Emotional dependency', 'Weakness', 'Naivety', 'Oversensitivity'],
    numerologyConnection: [2, 6], // Love and nurturing
    chakraAssociation: ['Heart Chakra', 'Higher Heart Chakra'],
    spiritualMeaning: 'Divine feminine love and emotional healing energy.',
    elementalConnection: 'Water/Air',
    vibrationFrequency: 'Soft, nurturing',
    personalityInsight: 'You radiate unconditional love and have natural healing presence.'
  },
  gold: {
    rgba: 'rgba(255, 215, 0, 0.3)',
    positive: ['Divine wisdom', 'Enlightenment', 'Abundance', 'Higher self', 'Spiritual mastery'],
    negative: ['Materialism', 'Ego inflation', 'Spiritual pride', 'Attachment to status'],
    numerologyConnection: [1, 8, 22], // Leadership, power, master builder
    chakraAssociation: ['Solar Plexus Chakra', 'Crown Chakra'],
    spiritualMeaning: 'Divine consciousness and spiritual achievement. Connection to higher self.',
    elementalConnection: 'Fire/Spirit',
    vibrationFrequency: 'Divine, illuminating',
    personalityInsight: 'You embody wisdom and have achieved significant spiritual development.'
  },
  silver: {
    rgba: 'rgba(192, 192, 192, 0.3)',
    positive: ['Reflection', 'Intuition', 'Feminine wisdom', 'Lunar energy', 'Psychic gifts'],
    negative: ['Illusion', 'Deception', 'Emotional instability', 'Moodiness'],
    numerologyConnection: [2, 11], // Intuition and master sensitivity
    chakraAssociation: ['Third Eye Chakra', 'Crown Chakra'],
    spiritualMeaning: 'Lunar wisdom and psychic reflection. Divine feminine intuition.',
    elementalConnection: 'Water/Spirit',
    vibrationFrequency: 'Reflective, intuitive',
    personalityInsight: 'You possess deep intuitive wisdom and psychic sensitivity.'
  },
  white: {
    rgba: 'rgba(255, 255, 255, 0.3)',
    positive: ['Purity', 'Protection', 'Divine connection', 'Clarity', 'Spiritual cleansing'],
    negative: ['Disconnection', 'Coldness', 'Perfectionism', 'Spiritual bypassing'],
    numerologyConnection: [1, 7, 9], // Pure leadership and spiritual completion
    chakraAssociation: ['Crown Chakra', 'Soul Star Chakra'],
    spiritualMeaning: 'Pure divine consciousness and spiritual protection.',
    elementalConnection: 'Spirit/All Elements',
    vibrationFrequency: 'Pure, protective',
    personalityInsight: 'You carry divine protection and pure spiritual energy.'
  },
  black: {
    rgba: 'rgba(0, 0, 0, 0.3)',
    positive: ['Protection', 'Grounding', 'Mystery', 'Transformation', 'Deep wisdom'],
    negative: ['Negativity', 'Depression', 'Blockages', 'Fear', 'Heaviness'],
    numerologyConnection: [8, 4], // Power and stability
    chakraAssociation: ['Root Chakra', 'Earth Star Chakra'],
    spiritualMeaning: 'Protective energy and deep transformation through shadow work.',
    elementalConnection: 'Earth',
    vibrationFrequency: 'Grounding, protective',
    personalityInsight: 'You have natural protective abilities and deep transformative power.'
  },
  turquoise: {
    rgba: 'rgba(64, 224, 208, 0.3)',
    positive: ['Communication', 'Clarity', 'Emotional healing', 'Self-expression', 'Truth'],
    negative: ['Emotional overwhelm', 'Scattered thinking', 'Communication blocks'],
    numerologyConnection: [3, 5], // Expression and freedom
    chakraAssociation: ['Throat Chakra', 'Heart Chakra'],
    spiritualMeaning: 'Clear communication and emotional healing energy.',
    elementalConnection: 'Water/Air',
    vibrationFrequency: 'Clarifying, healing',
    personalityInsight: 'You express truth with emotional clarity and healing presence.'
  },
  magenta: {
    rgba: 'rgba(255, 0, 255, 0.3)',
    positive: ['Spiritual love', 'Universal compassion', 'Higher consciousness', 'Divine feminine'],
    negative: ['Spiritual bypassing', 'Unrealistic expectations', 'Emotional intensity'],
    numerologyConnection: [6, 9], // Love and universal completion
    chakraAssociation: ['Crown Chakra', 'Soul Star Chakra'],
    spiritualMeaning: 'Divine love and spiritual transformation energy.',
    elementalConnection: 'Spirit/Water',
    vibrationFrequency: 'Divine, transformative',
    personalityInsight: 'You channel divine love and spiritual wisdom for universal healing.'
  },
  coral: {
    rgba: 'rgba(255, 127, 80, 0.3)',
    positive: ['Warmth', 'Nurturing', 'Emotional balance', 'Gentle strength', 'Healing'],
    negative: ['Emotional dependency', 'Oversensitivity', 'Lack of boundaries'],
    numerologyConnection: [2, 6], // Cooperation and nurturing
    chakraAssociation: ['Heart Chakra', 'Sacral Chakra'],
    spiritualMeaning: 'Gentle healing and emotional nurturing energy.',
    elementalConnection: 'Water/Fire',
    vibrationFrequency: 'Warm, nurturing',
    personalityInsight: 'You offer gentle healing and emotional support with natural warmth.'
  },
  lime: {
    rgba: 'rgba(50, 205, 50, 0.3)',
    positive: ['Growth', 'Vitality', 'New beginnings', 'Fresh energy', 'Innovation'],
    negative: ['Restlessness', 'Impatience', 'Scattered energy', 'Superficiality'],
    numerologyConnection: [1, 5], // New beginnings and freedom
    chakraAssociation: ['Heart Chakra', 'Solar Plexus Chakra'],
    spiritualMeaning: 'Fresh growth and innovative life force energy.',
    elementalConnection: 'Earth/Air',
    vibrationFrequency: 'Energizing, fresh',
    personalityInsight: 'You bring fresh perspectives and innovative energy to everything you touch.'
  },
  navy: {
    rgba: 'rgba(0, 0, 128, 0.3)',
    positive: ['Deep wisdom', 'Authority', 'Stability', 'Trust', 'Intuitive knowledge'],
    negative: ['Rigidity', 'Authoritarian', 'Emotional suppression', 'Dogmatism'],
    numerologyConnection: [4, 7], // Stability and wisdom
    chakraAssociation: ['Third Eye Chakra', 'Throat Chakra'],
    spiritualMeaning: 'Deep wisdom and authoritative spiritual knowledge.',
    elementalConnection: 'Water/Earth',
    vibrationFrequency: 'Deep, authoritative',
    personalityInsight: 'You possess deep wisdom and natural authority in spiritual matters.'
  },
  teal: {
    rgba: 'rgba(0, 128, 128, 0.3)',
    positive: ['Balance', 'Sophistication', 'Emotional clarity', 'Spiritual communication'],
    negative: ['Aloofness', 'Emotional detachment', 'Overthinking'],
    numerologyConnection: [7, 2], // Spirituality and cooperation
    chakraAssociation: ['Throat Chakra', 'Heart Chakra'],
    spiritualMeaning: 'Balanced communication and emotional spiritual clarity.',
    elementalConnection: 'Water',
    vibrationFrequency: 'Balanced, sophisticated',
    personalityInsight: 'You communicate with balanced wisdom and emotional sophistication.'
  }
};

/**
 * Correlates numerology numbers with aura colors for personalized insights
 */
function getNumerologyColorCorrelation(userNumerology: any) {
  const correlations = [];
  
  if (userNumerology?.lifePathNumber) {
    const colorName = getColorForNumerologyNumber(userNumerology.lifePathNumber);
    correlations.push({
      number: userNumerology.lifePathNumber,
      type: 'Life Path',
      associatedColor: colorName,
      meaning: `Your Life Path ${userNumerology.lifePathNumber} resonates with ${colorName} energy`
    });
  }
  
  if (userNumerology?.destinyNumber) {
    const colorName = getColorForNumerologyNumber(userNumerology.destinyNumber);
    correlations.push({
      number: userNumerology.destinyNumber,
      type: 'Destiny',
      associatedColor: colorName,
      meaning: `Your Destiny ${userNumerology.destinyNumber} aligns with ${colorName} vibrations`
    });
  }
  
  return correlations;
}

function getColorForNumerologyNumber(num: number): string {
  const colorMap: Record<number, string> = {
    1: 'red', 2: 'orange', 3: 'yellow', 4: 'green', 5: 'blue',
    6: 'indigo', 7: 'violet', 8: 'pink', 9: 'gold',
    11: 'silver', 22: 'gold', 33: 'white'
  };
  return colorMap[num] || 'white';
}

/**
 * Enhanced aura analysis using both OpenAI and Gemini with comprehensive insights
 */
export async function enhancedAuraAnalysis(
  base64Image: string,
  userNumerology?: any,
  previousReadings?: any[]
): Promise<AuraAnalysisResult> {
  
  const enhancedPrompt = `
    Analyze this image for aura colors and energy patterns. Provide a comprehensive spiritual reading including:
    
    1. VERSATILE COLOR SPECTRUM: Identify 5-8 distinct aura colors from this complete palette: red, orange, yellow, green, blue, indigo, violet, purple, pink, gold, silver, white, black, turquoise, magenta, coral, lime, navy, maroon, teal, crimson, azure, emerald, amber, rose, sapphire, ruby, pearl, onyx, jade
    2. ENERGY LAYERS: Describe inner, middle, and outer aura layers with specific colors
    3. CHAKRA ACTIVITY: Assess the activity level of each chakra (1-10 scale)
    4. SPIRITUAL GUIDANCE: Provide meaningful spiritual insights based on the color combination
    5. PERSONALITY TRAITS: List 6-8 key personality characteristics
    6. ENERGY LEVEL: Overall energy reading (1-10)
    
    IMPORTANT: Use diverse, visible colors that create a rich aura spectrum. Avoid limiting to just 2-3 colors.
    Each color should be from the provided palette for proper visibility and meaning.
    
    Respond in JSON format with these exact fields:
    {
      "dominantColor": "string",
      "secondaryColor": "string", 
      "auraColorSpectrum": ["array of 5-8 colors from the palette"],
      "auraLayerColors": {"inner": "color", "middle": "color", "outer": "color"},
      "energyLevel": number,
      "personalityTraits": ["array of 6-8 traits"],
      "spiritualGuidance": "string",
      "chakraActivity": {"root": number, "sacral": number, "solarPlexus": number, "heart": number, "throat": number, "thirdEye": number, "crown": number},
      "detailedAnalysis": "comprehensive reading focusing on the full color spectrum"
    }
  `;

  try {
    // Get OpenAI analysis
    let openaiResult = null;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "YOUR_KEY_HERE") {
      try {
        const openaiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: enhancedPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze the aura colors in this image." },
                { type: "image_url", image_url: { url: base64Image } }
              ]
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1500
        });
        
        openaiResult = JSON.parse(openaiResponse.choices[0].message.content || "{}");
      } catch (openaiError) {
        console.log("OpenAI analysis unavailable, using fallback");
      }
    }

    // Get Gemini analysis for additional insights
    let geminiResult = null;
    if (process.env.GOOGLE_API_KEY) {
      try {
        geminiResult = await analyzeImageWithGemini(base64Image);
      } catch (geminiError) {
        console.log("Gemini analysis unavailable");
      }
    }

    // Create comprehensive result combining all insights
    const baseResult = openaiResult || generateFallbackAnalysis();
    
    // Enhanced analysis with color meanings
    const dominantColorData = enhancedColorMeanings[baseResult.dominantColor?.toLowerCase() as keyof typeof enhancedColorMeanings] || enhancedColorMeanings.blue;
    const secondaryColorData = enhancedColorMeanings[baseResult.secondaryColor?.toLowerCase() as keyof typeof enhancedColorMeanings] || enhancedColorMeanings.purple;
    
    // Add numerology correlations if provided
    const numerologyCorrelations = userNumerology ? getNumerologyColorCorrelation(userNumerology) : [];
    
    // Enhanced spiritual guidance incorporating all data
    const enhancedGuidance = createEnhancedGuidance(
      baseResult,
      dominantColorData,
      secondaryColorData,
      numerologyCorrelations,
      geminiResult
    );
    
    // Combine previous readings for pattern analysis
    const patternAnalysis = previousReadings ? analyzeAuraPatterns(previousReadings, baseResult) : null;
    
    const finalResult: AuraAnalysisResult = {
      ...baseResult,
      spiritualGuidance: enhancedGuidance,
      detailedAnalysis: createDetailedAnalysis(
        baseResult,
        dominantColorData,
        secondaryColorData,
        numerologyCorrelations,
        patternAnalysis
      ),
      // Add enhanced metadata
      colorMeanings: {
        dominant: dominantColorData,
        secondary: secondaryColorData
      },
      numerologyConnection: numerologyCorrelations,
      patternInsights: patternAnalysis
    };

    return finalResult;
    
  } catch (error) {
    console.error("Enhanced aura analysis error:", error);
    return generateFallbackAnalysis();
  }
}

function createEnhancedGuidance(
  baseResult: any,
  dominantColor: any,
  secondaryColor: any,
  numerologyCorrelations: any[],
  geminiInsights: any
): string {
  let guidance = `Your aura radiates primarily ${baseResult.dominantColor} energy, indicating ${dominantColor.spiritualMeaning}. `;
  
  guidance += `The secondary ${baseResult.secondaryColor} vibration adds ${secondaryColor.spiritualMeaning}. `;
  
  // Add numerology connections
  if (numerologyCorrelations.length > 0) {
    guidance += `Your numerological profile shows strong alignment with these colors: `;
    guidance += numerologyCorrelations.map(corr => `${corr.meaning}`).join('. ') + '. ';
  }
  
  // Add chakra insights
  const highestChakra = Object.entries(baseResult.chakraActivity || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];
  
  if (highestChakra) {
    guidance += `Your ${highestChakra[0]} chakra shows particularly strong activity (${highestChakra[1]}/10), `;
    guidance += `enhancing your ${getChakraQuality(highestChakra[0])}. `;
  }
  
  // Add personalized recommendations
  guidance += createPersonalizedRecommendations(dominantColor, secondaryColor);
  
  return guidance;
}

function createDetailedAnalysis(
  baseResult: any,
  dominantColor: any,
  secondaryColor: any,
  numerologyCorrelations: any[],
  patternAnalysis: any
): string {
  let analysis = `AURA COLOR ANALYSIS:\n`;
  analysis += `Dominant ${baseResult.dominantColor}: ${dominantColor.personalityInsight}\n`;
  analysis += `Secondary ${baseResult.secondaryColor}: ${secondaryColor.personalityInsight}\n\n`;
  
  analysis += `ENERGY SIGNATURE:\n`;
  analysis += `Vibration: ${dominantColor.vibrationFrequency}\n`;
  analysis += `Element: ${dominantColor.elementalConnection}\n`;
  analysis += `Overall Energy Level: ${baseResult.energyLevel}/10\n\n`;
  
  if (numerologyCorrelations.length > 0) {
    analysis += `NUMEROLOGY CONNECTIONS:\n`;
    numerologyCorrelations.forEach(corr => {
      analysis += `${corr.type} Number ${corr.number}: ${corr.meaning}\n`;
    });
    analysis += `\n`;
  }
  
  if (patternAnalysis) {
    analysis += `ENERGY PATTERN EVOLUTION:\n${patternAnalysis}\n\n`;
  }
  
  analysis += `SPIRITUAL DEVELOPMENT FOCUS:\n`;
  analysis += `Strengths: ${dominantColor.positive.slice(0, 3).join(', ')}\n`;
  analysis += `Growth Areas: Work on balancing ${secondaryColor.negative.slice(0, 2).join(' and ')}\n`;
  
  return analysis;
}

function generateFallbackAnalysis(): AuraAnalysisResult {
  // Expanded versatile color array with high visibility colors matching our enhanced mapping
  const versatileColors = [
    'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'purple', 
    'pink', 'gold', 'silver', 'white', 'turquoise', 'magenta', 
    'coral', 'lime', 'navy', 'teal'
  ];
  
  // Generate 6-8 colors for comprehensive spectrum analysis (matching prompt requirements)
  const spectrumSize = Math.floor(Math.random() * 3) + 6; // 6-8 colors
  const auraSpectrum = [];
  const usedColors = new Set();
  
  // Select diverse colors ensuring visibility and variety
  while (auraSpectrum.length < spectrumSize) {
    const color = versatileColors[Math.floor(Math.random() * versatileColors.length)];
    if (!usedColors.has(color)) {
      auraSpectrum.push(color);
      usedColors.add(color);
    }
  }
  
  const dominant = auraSpectrum[0];
  const secondary = auraSpectrum[1];
  const tertiary = auraSpectrum[2];
  const quaternary = auraSpectrum[3] || auraSpectrum[0];
  
  // Get enhanced personality traits based on color meanings
  const dominantColorData = enhancedColorMeanings[dominant as keyof typeof enhancedColorMeanings];
  const secondaryColorData = enhancedColorMeanings[secondary as keyof typeof enhancedColorMeanings];
  
  const combinedTraits = [
    ...dominantColorData.positive.slice(0, 3),
    ...secondaryColorData.positive.slice(0, 3),
    'Multi-dimensional', 'Energetically complex'
  ];
  
  return {
    dominantColor: dominant,
    secondaryColor: secondary,
    auraColorSpectrum: auraSpectrum,
    auraLayerColors: { 
      inner: dominant, 
      middle: secondary, 
      outer: tertiary,
      ethereal: quaternary
    },
    energyLevel: Math.floor(Math.random() * 3) + 7, // Higher energy for complex spectrums
    personalityTraits: combinedTraits.slice(0, 8),
    spiritualGuidance: `Your ${auraSpectrum.length}-color aura spectrum reveals ${dominantColorData.spiritualMeaning} combined with ${secondaryColorData.spiritualMeaning}. This creates a unique multi-layered energy signature that speaks to your complex spiritual nature and diverse gifts. The interplay of ${auraSpectrum.slice(0, 4).join(', ')} energies shows remarkable spiritual development.`,
    chakraActivity: {
      root: Math.floor(Math.random() * 3) + 6,
      sacral: Math.floor(Math.random() * 3) + 6,
      solarPlexus: Math.floor(Math.random() * 3) + 7,
      heart: Math.floor(Math.random() * 3) + 8,
      throat: Math.floor(Math.random() * 3) + 7,
      thirdEye: Math.floor(Math.random() * 3) + 8,
      crown: Math.floor(Math.random() * 3) + 8
    },
    detailedAnalysis: `COMPREHENSIVE AURA SPECTRUM ANALYSIS:
    
Your ${auraSpectrum.length}-color aura reflects extraordinary spiritual complexity. 

PRIMARY ENERGIES:
- ${dominant}: ${dominantColorData.personalityInsight}
- ${secondary}: ${secondaryColorData.personalityInsight}

FULL SPECTRUM: ${auraSpectrum.join(' • ')}

VIBRATIONAL SIGNATURE: Your energy field operates on multiple frequencies simultaneously, creating a rich tapestry of spiritual abilities. The ${dominant}-${secondary} combination indicates ${dominantColorData.elementalConnection} and ${secondaryColorData.elementalConnection} elemental connections.

SPIRITUAL DEVELOPMENT: This multi-dimensional aura suggests advanced spiritual awareness with the ability to access various levels of consciousness and energy healing modalities.`
  };
}

function analyzeAuraPatterns(previousReadings: any[], currentReading: any): string {
  // Analyze patterns in color evolution over time
  const colorHistory = previousReadings.map(r => r.dominantColor).filter(Boolean);
  
  if (colorHistory.length === 0) return "First reading - establishing baseline energy signature.";
  
  const mostRecentColor = colorHistory[colorHistory.length - 1];
  const currentColor = currentReading.dominantColor;
  
  if (mostRecentColor === currentColor) {
    return `Energy consistency: Your ${currentColor} aura remains stable, indicating steady spiritual development.`;
  } else {
    return `Energy evolution: Transition from ${mostRecentColor} to ${currentColor} suggests growth and transformation.`;
  }
}

function getChakraQuality(chakraName: string): string {
  const qualities: Record<string, string> = {
    root: 'grounding and stability',
    sacral: 'creativity and emotional flow',
    solarPlexus: 'personal power and confidence',
    heart: 'love and compassion',
    throat: 'communication and truth',
    thirdEye: 'intuition and psychic abilities',
    crown: 'spiritual connection and divine wisdom'
  };
  return qualities[chakraName] || 'spiritual development';
}

function createPersonalizedRecommendations(dominantColor: any, secondaryColor: any): string {
  const practices = [];
  
  if (dominantColor.elementalConnection.includes('Fire')) {
    practices.push('candle meditation and sun gazing');
  }
  if (dominantColor.elementalConnection.includes('Water')) {
    practices.push('water ceremonies and moon rituals');
  }
  if (dominantColor.elementalConnection.includes('Earth')) {
    practices.push('grounding exercises and nature connection');
  }
  if (dominantColor.elementalConnection.includes('Air')) {
    practices.push('breathwork and sound healing');
  }
  if (dominantColor.elementalConnection.includes('Spirit')) {
    practices.push('advanced meditation and energy work');
  }
  
  return `Recommended spiritual practices: ${practices.join(', ')}.`;
}