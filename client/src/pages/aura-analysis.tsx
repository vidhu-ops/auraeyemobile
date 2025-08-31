import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ImageUpload from "@/components/forms/image-upload";
import NameInput from "@/components/forms/name-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PremiumFeature } from "@/components/premium/premium-feature";
import { analyzeAuraImage, AuraAnalysisResult, calculateNumerology, NumerologyResult } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Sparkles, Zap, Star, MessageSquare, CheckCircle2, Users, Download, Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Declare global window property for screenshot functionality
declare global {
  interface Window {
    currentAnalysisIdForScreenshot?: number;
  }
}

// Enhanced color code mapping function with all specified colors
const getAccurateColorCode = (colorName: string): string => {
  const colorCodes: Record<string, string> = {
    // Core spiritual colors with enhanced visibility
    'Pink': '#FF69B4',      // Hot pink for visibility
    'pink': '#FF69B4',
    'Gray': '#A9A9A9',      // Dark gray for visibility
    'gray': '#A9A9A9',
    'Grey': '#A9A9A9',      // Alternative spelling
    'grey': '#A9A9A9',
    'Blue': '#1E90FF',      // Dodger blue
    'blue': '#1E90FF',
    'Green': '#32CD32',     // Lime green for visibility
    'green': '#32CD32',
    'Violet': '#9400D3',    // Dark violet
    'violet': '#9400D3',
    'Indigo': '#4B0082',    // Indigo
    'indigo': '#4B0082',
    'White': '#FFFFFF',     // Pure white
    'white': '#FFFFFF',
    'Gold': '#FFD700',      // Gold
    'gold': '#FFD700',
    'Yellow': '#FFE600',    // Bright yellow
    'yellow': '#FFE600',
    'Orange': '#FF8C00',    // Dark orange
    'orange': '#FF8C00',
    'Purple': '#8A2BE2',    // Blue violet
    'purple': '#8A2BE2',
    'Silver': '#C0C0C0',    // Silver
    'silver': '#C0C0C0',
    'Black': '#2F2F2F',     // Dark gray for visibility (not pure black)
    'black': '#2F2F2F',
    'Red': '#FF3232',       // Vibrant red
    'red': '#FF3232',
    'Brown': '#A52A2A',     // Brown
    'brown': '#A52A2A'
  };
  
  return colorCodes[colorName] || '#1E90FF'; // Default to blue if color not found
};

function getColorMeditationFocus(color: string): string {
    const focuses: Record<string, string> = {
        'Red': 'Focus on root chakra grounding meditations and earth connection practices',
        'Orange': 'Practice creative visualization and emotional flow meditations',
        'Yellow': 'Concentrate on solar plexus strengthening and confidence-building meditations',
        'Green': 'Engage in heart-opening meditations and loving-kindness practices',
        'Blue': 'Focus on throat chakra activation and truth expression meditations',
        'Indigo': 'Practice third eye opening and intuitive development meditations',
        'Violet': 'Engage in crown chakra connection and divine consciousness meditations',
        'Pink': 'Practice unconditional love and emotional healing meditations',
        'Gold': 'Concentrate on divine wisdom and enlightenment meditations',
        'White': 'Focus on pure light meditation and spiritual protection practices',
        'Silver': 'Practice lunar energy and psychic sensitivity meditations',
        'Black': 'Requires intensive shadow work, inner healing, and confronting darkness',
        'gray': 'Meditation to address emotional detachment and spiritual numbness'
    };
    return focuses[color] || 'Focus on connecting with your unique aura color energy during meditation';
}

const getColorEnergyWork = (color: string): string => {
  const practices: Record<string, string> = {
    'Red': 'Practice grounding exercises, work with earth elements, and strengthen physical vitality',
    'Orange': 'Engage in creative expression, emotional release work, and sacral chakra healing',
    'Yellow': 'Work on personal power development, mental clarity exercises, and confidence building',
    'Green': 'Practice healing touch, heart chakra work, and compassionate service',
    'Blue': 'Focus on authentic communication, throat chakra clearing, and truth expression',
    'Indigo': 'Develop psychic abilities, third eye activation, and intuitive practices',
    'Violet': 'Work on spiritual connection, crown chakra opening, and divine consciousness',
    'Purple': 'Practice mystical awareness, spiritual wisdom development, and ancient knowledge study',
    'Pink': 'Focus on unconditional love practices, emotional healing, and nurturing energy',
    'Gold': 'Work on divine wisdom integration, spiritual mastery, and enlightened service',
    'White': 'Practice light work, spiritual protection, and angelic connection',
    'Silver': 'Develop lunar sensitivity, psychic protection, and emotional attunement'
  };
  return practices[color] || 'Work with your unique aura energy through specialized spiritual practices';
};

const getColorChakraGuidance = (color: string): string => {
  const guidance: Record<string, string> = {
    'Red': 'Strengthen root chakra through grounding, stability practices, and earth connection',
    'Orange': 'Balance sacral chakra through creativity, emotional flow, and healthy boundaries',
    'Yellow': 'Energize solar plexus through confidence building, personal power, and mental clarity',
    'Green': 'Open heart chakra through love practices, compassion, and emotional healing',
    'Blue': 'Clear throat chakra through authentic expression, truth telling, and communication',
    'Indigo': 'Activate third eye through intuition development, inner wisdom, and perception',
    'Violet': 'Connect crown chakra through spiritual practices, divine connection, and meditation',
    'Pink': 'Heal heart chakra through unconditional love, emotional nurturing, and compassion',
    'Gold': 'Illuminate all chakras through divine wisdom and spiritual enlightenment',
    'White': 'Purify all chakras through light work and spiritual protection practices',
    'Silver': 'Sensitize all chakras through lunar energy and psychic development',
    'Black': 'work on Shadow Integration Center',
    'Gray': 'requires work',
    'Brown': 'Ground earth star chakra through earth connection and stability practices'
  };
  return guidance[color] || 'Work with your corresponding chakra system for optimal energy alignment';
};

  // Zone-specific color meanings for 4-Zone Energy Map
  const getThinkingEnergyMeaning = (color: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'Thinking about taking action, reacting to pressure, or inner drive.',
      'Orange': 'Creative ideas, desires, inspiration or sensual exploration.',
      'Yellow': 'Focused on achieving, leading, or being seen as capable.',
      'Green': 'Healing thoughts, compassion, desire to help others.',
      'Blue': 'Thinking about how to express, speak truth, or find inner peace.',
      'Indigo': 'Focused on intuition, psychic insights, inner knowing.',
      'Violet': 'Spiritual downloads, deep inner wisdom, connection to divine truth.',
      'Pink': 'Emotionally open, thinking about love, relationships, or self-worth.',
      'White': 'Spiritual sensitivity, thinking of higher dimensions or purity.',
      'Gold': 'Divine thoughts, wisdom, teaching, spiritual mastery.',
      'Silver': 'Receiving higher guidance, sensitive to unseen messages.',
      'Gray': 'work on Neutral analytical mind - processes information without emotional bias',
      'Black': ' work on Deep transformative thinking - penetrates mysteries and embraces shadow wisdom',
      'Brown': 'Grounded mindset, focused on stability, home or practical matters.'
    };
    return meanings[color] || 'Unique mental processing pattern - develops individual thinking approach';
  };

  const getReceivingEnergyMeaning = (color: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'Receiving urgent energy, competition or stress from environment.',
      'Orange': 'Attracting joy, creative people or stimulating situations.',
      'Yellow': 'Feeling pressure to succeed, being challenged to lead or perform.',
      'Green': 'Receiving kindness, appreciation or emotional requests from others.',
      'Blue': 'Receiving calming, nurturing energy or silence from others.',
      'Indigo': 'Receiving intuitive nudges, environmental clues from the unseen.',
      'Violet': 'Absorbs spiritual transmissions - draws divine energy from higher realms',
      'Pink': 'Absorbing emotional energy, feeling others’ affection or needs.',
      'White': 'Absorbing emotions, energy of others, or angelic frequencies.',
      'Gold': 'Recognized by others as powerful or spiritually influential.',
      'Silver': 'Surrounded by spiritually activated or highly sensitive people.',
      'Black': 'work on transformative power - attracts deep change energy from shadow work',
      'Brown': 'Receiving grounding or responsibilities from others.',
      'Purple': 'Receives mystical energy - attracts ancient wisdom and divine guidance'
    };
    return meanings[color] ||'Receives unique energy signature - attracts special vibrations suited to your soul';
  };

  const getGivingEnergyMeaning = (color: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'Actively working hard, expressing passion or dealing with anger.',
      'Orange': 'Actively expressing creativity, pleasure, or passion.',
      'Yellow': 'Taking leadership action, pushing forward with confidence.',
      'Green': 'Giving healing, nurturing others, or working in service roles.',
      'Blue': 'Speaking up, setting boundaries, or seeking emotional resolution.',
      'Indigo': 'Taking intuitive action, trusting gut feelings and visions.',
      'Violet': 'Channeling divine energy into actions, using intuition to lead.',
      'Pink': 'Expressing love, being vulnerable, or emotionally reaching out.',
      'White': 'Acting from innocence, vulnerability or spiritual ideals.',
      'Gold': 'Taking action with purpose, guiding or mentoring others.',
      'Silver': 'Channeling energy, guiding others, or practicing intuition.',
      'Gray': 'Work on blockages to emmenate balanced perspective - helps others find neutral ground in conflicts',
      'Black': 'work on transformative power - to catalyzes deep change and shadow integration',
      'Brown': 'Taking practical steps, helping others or organizing life.',
      'Purple': 'Activates mystical energy - channels ancient wisdom and divine guidance'
    };
    return meanings[color] || 'Projects unique energy signature - shares special gifts that only you can offer';
  };

  const getPersonalityEnergyMeaning = (color: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'Highly energized, action-focused, experiencing dynamic transformation.',
      'Orange': 'Joyful and magnetic energy, radiating enthusiasm for life.',
      'Yellow': 'Radiant, confident, strong-willed individual in active growth.',
      'Green': 'Healer presence with calm and heart-centered frequency.',
      'Blue': 'Balanced communicator with peaceful, harmonious energy field.',
      'Indigo': 'Psychic abilities - your core nature operates through intuitive awareness',
      'Violet': 'Highly spiritual phase, embodying divine purpose and deep alignment.',
      'Pink': 'Loving and gentle presence with a sensitive, empathetic core.',
      'White': 'Spiritually elevated being, sensitive and light-filled energy field.',
      'Gold': 'Masterful healer energy, a teacher and guide on a mission.',
      'Silver': 'Mystic presence, sensitive soul with energetic wisdom.',
      'Gray': 'Blockages in Balanced core nature - your essence maintains spiritual equilibrium in all situations',
      'Black': 'Blockages in Transformative soul foundation - your core purpose involves deep shadow integration',
      'Brown': 'Deeply rooted energy, wise, nurturing and structured.',
      'Purple': 'Mystical presence, deeply spiritual and wise, with a regal aura.'
    };
    return meanings[color] || 'Unique soul signature - your core essence carries special spiritual gifts';
  };

  // Dynamic Life Phase based on aura colors
  const getCurrentLifePhase = (dominantColor: string, secondaryColor: string): string => {
    const phases: Record<string, string> = {
      'Red': 'You are in a dynamic action phase, initiating powerful changes and manifesting new realities through raw determination and courage.',
      'Orange': 'You are in a creative expansion phase, exploring artistic expression and deepening emotional connections while embracing joy and passion.',
      'Yellow': 'You are in an intellectual mastery phase, developing leadership abilities and gaining confidence in your personal power and wisdom.',
      'Green': 'You are in a healing integration phase, focusing on emotional balance and nurturing relationships while developing your healing gifts.',
      'Blue': 'You are in a truth-seeking phase, learning to communicate authentically and finding your voice in expressing deeper spiritual wisdom.',
      'Indigo': 'You are in a psychic awakening phase, developing intuitive abilities and connecting to higher dimensional awareness.',
      'Violet': 'You are in a spiritual ascension phase, aligning with divine purpose and integrating cosmic consciousness into daily life.',
      'Gold': 'You are in a wisdom teaching phase, stepping into your role as a spiritual guide and sharing divine knowledge with others.',
      'Silver': 'You are in a mystic development phase, enhancing psychic sensitivity and learning to channel higher guidance.',
      'White': 'You are in a purification phase, clearing old patterns and elevating your spiritual vibration to new heights.',
      'Black': 'You are in a shadow integration phase, courageously facing deep transformation and embracing your hidden power.',
      'Gray': 'You are in a neutrality phase, finding balance and learning to maintain equilibrium during times of change.',
      'Brown': 'You are in a grounding phase, building solid foundations and connecting deeply with earth energies and practical wisdom.',
      'Purple': 'You are in a mystical mastery phase, accessing ancient wisdom and integrating royal spiritual authority.'
    };
    
    const primaryPhase = phases[dominantColor] || 'You are in a unique spiritual development phase, discovering your individual path to growth.';
    const secondaryInfluence = secondaryColor && secondaryColor !== dominantColor ? 
      ` Your ${secondaryColor.toLowerCase()} energy adds layers of complexity to this journey.` : '';
    
    return primaryPhase + secondaryInfluence;
  };

  // Dynamic Focus Areas based on all four aura colors
  const getRecommendedFocusAreas = (result: AuraAnalysisResult): string[] => {
    const colors = extractAllAuraColors(result);
    const personalityColor = getColorNameFromHex(colors.personality);
    const thinkingColor = getColorNameFromHex(colors.thinking);
    const givingColor = getColorNameFromHex(colors.giving);
    const receivingColor = getColorNameFromHex(colors.receiving);
    
    const focusAreaMap: Record<string, string> = {
      'Red': 'Build physical stamina and channel your passion into constructive action',
      'Orange': 'Explore creative outlets and deepen emotional intelligence through artistic expression',
      'Yellow': 'Develop leadership skills and strengthen your personal confidence and authority',
      'Green': 'Practice healing modalities and cultivate compassion for yourself and others',
      'Blue': 'Improve communication skills and express your truth with clarity and wisdom',
      'Indigo': 'Develop psychic abilities through meditation and trust your intuitive insights',
      'Violet': 'Deepen spiritual practices and align with your higher purpose and divine mission',
      'Gold': 'Share your wisdom through teaching and guide others on their spiritual journey',
      'Silver': 'Enhance psychic sensitivity and learn to channel divine guidance effectively',
      'White': 'Practice spiritual purification and maintain high vibrational energy alignment',
      'Black': 'Embrace shadow work and transform limiting beliefs through deep inner exploration',
      'Gray': 'Cultivate emotional balance and learn to remain centered during challenging times',
      'Brown': 'Strengthen earth connection and focus on practical manifestation of your goals',
      'Purple': 'Access mystical knowledge and integrate ancient wisdom into modern spiritual practice'
    };
    
    const areas = [
      focusAreaMap[personalityColor] || 'Develop your core spiritual essence and authentic self-expression',
      focusAreaMap[thinkingColor] || 'Cultivate mindful awareness and expand your mental clarity',
      focusAreaMap[givingColor] || 'Share your gifts generously and express your true nature',
      focusAreaMap[receivingColor] || 'Open to receive guidance and allow divine energy to flow through you'
    ];
    
    return areas.filter((area, index, arr) => arr.indexOf(area) === index); // Remove duplicates
  };

  // Generate deterministic hash from image data for consistent results
  const generateImageHash = (imageData: string): string => {
    // Use multiple sections of the image for better uniqueness
    const sections = [
      imageData.substring(0, 500),
      imageData.substring(Math.floor(imageData.length * 0.25), Math.floor(imageData.length * 0.25) + 500),
      imageData.substring(Math.floor(imageData.length * 0.5), Math.floor(imageData.length * 0.5) + 500),
      imageData.substring(Math.floor(imageData.length * 0.75), Math.floor(imageData.length * 0.75) + 500),
      imageData.substring(imageData.length - 500)
    ];
    
    let combinedHash = '';
    sections.forEach((section, index) => {
      let hash = 0;
      for (let i = 0; i < section.length; i++) {
        const char = section.charCodeAt(i);
        hash = ((hash << 5) - hash) + char + index;
        hash = hash & hash; // Convert to 32-bit integer
      }
      combinedHash += Math.abs(hash).toString(36);
    });
    
    return combinedHash;
  };

  // Add watermark to canvas
  const addWatermark = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Set watermark properties
    ctx.save();
    
    // Apply watermark with pure white text and no background interference
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.32; // High opacity for visibility
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // No shadow at all to prevent any black spots
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw watermark text as pure white overlay
    ctx.fillText('AuraEye™', centerX-2, centerY);
    // Apply watermark with pure white text and no background interference
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.32; // High opacity for visibility
    ctx.fillStyle = 'white';
    ctx.font = 'bold 70px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // No shadow at all to prevent any black spots
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw watermark text as pure white overlay
    ctx.fillText('Left', centerX-320, centerY+380);
    // Draw watermark text as pure white overlay
    // Apply watermark with pure white text and no background interference
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.32; // High opacity for visibility
    ctx.fillStyle = 'white';
    ctx.font = 'bold 70px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // No shadow at all to prevent any black spots
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw watermark text as pure white overlay
    ctx.fillText('Right', centerX+320, centerY+380);
   
    
    ctx.restore();
  };



  const getColorCompleteInfo = (colorName: string): { 
    chakra: string; 
    number: string; 
    shadowMeaning: string; 
    positiveMeaning: string; 
    colorMeaning: string; 
  } => {
    const colorInfoMap: Record<string, { 
      chakra: string; 
      number: string; 
      shadowMeaning: string; 
      positiveMeaning: string; 
      colorMeaning: string; 
    }> = {
      'Red': { 
        chakra: 'Root chakra kundalini activation flowing with primal life force energy that empowers your physical vitality and natural leadership magnetism. This fundamental frequency channels courageous action and manifestation power through your earthly presence',  
        number: 'Healing & Vitality',
        shadowMeaning: 'Root chakra imbalance manifesting through survival fears and aggressive tendencies that create blood pressure issues and adrenal exhaustion. This overactive frequency can lead to destructive anger patterns and inability to ground spiritual energy properly.',
        positiveMeaning: 'Root chakra kundalini activation flowing with primal life force energy that empowers your physical vitality and natural leadership magnetism. This fundamental frequency channels courageous action and manifestation power through your earthly presence.',
        colorMeaning: 'Healing & Vitality - Root chakra energy, survival instinct, life force, physical vitality, grounding power'
      },
      'Orange': { 
        chakra: 'Sacred creative fire flowing through your sacral chakra expressing divine feminine and masculine energies in perfect creative harmony. This passionate frequency manifests artistic inspiration and authentic emotional expression.', 
        number: 'Creativity & Passion', 
        shadowMeaning: 'Sacral chakra blockage creating creative stagnation and sexual dysfunction while causing reproductive system imbalances and emotional instability. This restricted frequency prevents authentic creative expression and healthy emotional flow.',
        positiveMeaning: 'Sacred creative fire flowing through your sacral chakra expressing divine feminine and masculine energies in perfect creative harmony. This passionate frequency manifests artistic inspiration and authentic emotional expression.',
        colorMeaning: 'Creativity & Passion - Sacral chakra energy, creative expression, emotional flow, artistic inspiration, sensual vitality'
      },
      'Yellow': { 
        chakra: 'Solar plexus power radiating confident personal authority and mental clarity that transforms knowledge into wisdom. This brilliant frequency empowers authentic self-expression and intellectual leadership.', 
        number: 'Personal Power & Intellect', 
        shadowMeaning: 'Solar plexus weakness generating digestive problems and low self-esteem that manifests as anxiety disorders and constant power struggles. This diminished frequency creates mental confusion and inability to maintain personal boundaries.',
        positiveMeaning: 'Solar plexus power radiating confident personal authority and mental clarity that transforms knowledge into wisdom. This brilliant frequency empowers authentic self-expression and intellectual leadership.',
        colorMeaning: 'Personal Power & Intellect - Solar plexus energy, mental clarity, confidence, intellectual power, self-authority'
      },
      'Green': { 
        chakra: 'Heart chakra unconditional love flowing through your being creating healing energy that nurtures both yourself and others. This harmonious frequency attracts healthy relationships and emotional balance.', 
        number: 'Love & Healing', 
        shadowMeaning: 'Heart chakra closure building emotional walls that create relationship difficulties and immune system weakness while manifesting lung problems. This protected frequency prevents authentic love expression and emotional vulnerability.',
        positiveMeaning: 'Heart chakra unconditional love flowing through your being creating healing energy that nurtures both yourself and others. This harmonious frequency attracts healthy relationships and emotional balance.',
        colorMeaning: 'Love & Healing - Heart chakra energy, unconditional love, emotional balance, healing power, relationship harmony'
      },
      'Blue': { 
        chakra: 'Throat chakra divine communication flowing through your voice expressing higher truth and authentic wisdom. This clear frequency channels spiritual guidance and honest self-expression.', 
        number: 'Communication & Truth', 
        shadowMeaning: 'Throat chakra blockage causing communication fears and thyroid imbalances that create neck tension and truth suppression. This constricted frequency prevents authentic voice expression and honest spiritual communication.',
        positiveMeaning: 'Throat chakra divine communication flowing through your voice expressing higher truth and authentic wisdom. This clear frequency channels spiritual guidance and honest self-expression.',
        colorMeaning: 'Communication & Truth - Throat chakra energy, authentic expression, spiritual communication, truth speaking, divine guidance'
      },
      'Indigo': { 
        chakra: 'Third eye psychic vision opening to higher dimensional awareness and intuitive knowing that guides spiritual development. This mystical frequency enhances meditation and spiritual perception.', 
        number: 'Intuition & Wisdom', 
        shadowMeaning: 'NEGATIVE : Third eye cloudiness creating intuitive blocks and chronic headaches while causing vision problems and spiritual confusion. This clouded frequency prevents psychic development and clear spiritual perception.',
        positiveMeaning: 'Third eye psychic vision opening to higher dimensional awareness and intuitive knowing that guides spiritual development. This mystical frequency enhances meditation and spiritual perception.',
        colorMeaning: 'Intuition & Wisdom - Third eye energy, psychic abilities, spiritual insight, intuitive knowing, higher perception'
      },
      'Violet': { 
        chakra: 'Crown chakra divine connection opening to cosmic consciousness and spiritual enlightenment that transcends material limitations. This sacred frequency channels universal wisdom and divine purpose.', 
        number: 'Spiritual Connection', 
        shadowMeaning: 'Crown chakra disconnection triggering spiritual crisis and depression while causing neurological issues and complete isolation from divine connection. This severed frequency creates existential emptiness and spiritual despair.',
        positiveMeaning: 'Crown chakra divine connection opening to cosmic consciousness and spiritual enlightenment that transcends material limitations. This sacred frequency channels universal wisdom and divine purpose.',
        colorMeaning: 'Spiritual Connection - Crown chakra energy, divine consciousness, spiritual enlightenment, cosmic awareness, universal wisdom'
      },
      'Purple': { 
        chakra: 'Higher crown chakra transformation integrating spiritual wisdom with earthly experience creating authentic spiritual authority. This royal frequency balances mystical insight with practical application.', 
        number: 'Transformation & Mystery', 
        shadowMeaning: 'Higher crown chakra disconnection creating spiritual arrogance and ego inflation while manifesting neurological imbalances and severe mental health struggles. This distorted frequency prevents authentic spiritual growth through dangerous disconnection from physical reality and shadow integration work.',
        positiveMeaning: 'Higher crown chakra transformation integrating spiritual wisdom with earthly experience creating authentic spiritual authority. This royal frequency balances mystical insight with practical application.',
        colorMeaning: 'Transformation & Mystery - Higher crown energy, spiritual transformation, mystical wisdom, magical consciousness, divine mystery'
      },
      'Pink': { 
        chakra: 'Higher heart chakra divine love expressing compassionate service and emotional healing that nurtures spiritual growth. This gentle frequency channels unconditional love and emotional wisdom.', 
        number: 'Divine Love & Compassion', 
        shadowMeaning: 'Heart wounds creating codependency patterns and boundary dissolution that leads to emotional manipulation and excessive self-sacrifice. This wounded frequency attracts unhealthy relationship dynamics and emotional exploitation.',
        positiveMeaning: 'Higher heart chakra divine love expressing compassionate service and emotional healing that nurtures spiritual growth. This gentle frequency channels unconditional love and emotional wisdom.',
        colorMeaning: 'Divine Love & Compassion - Higher heart energy, unconditional love, emotional healing, compassionate service, spiritual nurturing'
      },
      'Gold': { 
        chakra: 'Soul star chakra divine wisdom flowing through your being expressing spiritual mastery and enlightened consciousness. This luminous frequency channels cosmic intelligence and spiritual authority.', 
        number: 'Divine Wisdom & Mastery', 
        shadowMeaning: 'Spiritual materialism creating ego attachment and fear of divine responsibility while manifesting perfectionism and disconnection from authentic spiritual service. This corrupted frequency prevents humble spiritual development.',
        positiveMeaning: 'Soul star chakra divine wisdom flowing through your being expressing spiritual mastery and enlightened consciousness. This luminous frequency channels cosmic intelligence and spiritual authority.',
        colorMeaning: 'Divine Wisdom & Mastery - Soul star energy, spiritual mastery, cosmic intelligence, divine authority, enlightened consciousness'
      },
      'Silver': { 
        chakra: 'Lunar energy center flowing with intuitive feminine wisdom and psychic sensitivity that enhances emotional intelligence. This reflective frequency channels lunar consciousness and intuitive healing.', 
        number: 'Psychic Sensitivity & Intuition', 
        shadowMeaning: 'Emotional volatility causing psychic overwhelm and hormonal imbalances that create mood disorders and excessive lunar sensitivity. This unstable frequency prevents emotional regulation and psychic protection.',
        positiveMeaning: 'Lunar energy center flowing with intuitive feminine wisdom and psychic sensitivity that enhances emotional intelligence. This reflective frequency channels lunar consciousness and intuitive healing.',
        colorMeaning: 'Psychic Sensitivity & Intuition - Lunar energy, psychic abilities, emotional intelligence, intuitive wisdom, feminine consciousness'
      },
      'White': { 
        chakra: 'Divine light center radiating pure consciousness and spiritual protection that purifies energy fields. This crystalline frequency channels divine clarity and spiritual purification.', 
        number: 'Purity & Protection', 
        shadowMeaning: 'Spiritual bypassing creating avoidance of necessary shadow work while manifesting perfectionism and complete disconnection from earthly matters. This dissociated frequency prevents grounded spiritual integration.',
        positiveMeaning: 'Divine light center radiating pure consciousness and spiritual protection that purifies energy fields. This crystalline frequency channels divine clarity and spiritual purification.',
        colorMeaning: 'Purity & Protection - Divine light energy, spiritual purification, energy cleansing, divine protection, crystalline consciousness'
      },
      'Grey': { 
        chakra: 'Balance Center', 
        number: 'blockages', 
        shadowMeaning: 'Emotional detachment creating spiritual apathy and lack of passion while manifesting depression and complete disconnection from life force energy. This neutral frequency prevents authentic engagement and emotional expression.',
        positiveMeaning: 'requires work',
        colorMeaning: 'Connect to a healer'
      },
      // Lowercase versions for case-insensitive matching

      'green': { 
        chakra: 'Heart Center Depletion', 
        number: '4', 
        shadowMeaning: 'Heart center depletion creating emotional numbness and relationship withdrawal while manifesting cardiovascular stress and immune system weakness. This closed frequency prevents authentic love expression and emotional healing.',
        positiveMeaning: 'Heart chakra flowing with unconditional love and emotional healing that creates harmony in relationships. This nurturing frequency channels compassionate love and natural healing energy.',
        colorMeaning: 'Love & Healing - Heart chakra energy, unconditional love, emotional healing, relationship harmony, natural growth'
      },
      'purple': { 
        chakra: 'Higher Crown Chakra Disconnection', 
        number: '7', 
        shadowMeaning: 'Higher crown chakra disconnection creating spiritual arrogance and ego inflation while manifesting neurological imbalances and severe mental health struggles. This distorted frequency prevents authentic spiritual growth through dangerous disconnection from physical reality and shadow integration work.',
        positiveMeaning: 'Higher crown chakra transformation integrating spiritual wisdom with earthly experience creating authentic spiritual authority. This royal frequency balances mystical insight with practical application.',
        colorMeaning: 'Transformation & Mystery - Higher crown energy, spiritual transformation, mystical wisdom, magical consciousness, divine mystery'
      }
    };
    
    // Try exact match first, then case-insensitive match
    if (colorInfoMap[colorName]) {
      return colorInfoMap[colorName];
    }
    
    // Try case-insensitive match
    const lowerColorName = colorName.toLowerCase();
    const matchingKey = Object.keys(colorInfoMap).find(key => key.toLowerCase() === lowerColorName);
    if (matchingKey) {
      return colorInfoMap[matchingKey];
    }
    
    // Default fallback
    return colorInfoMap['Purple'];
  };

  const getColorHarmonyAnalysis = (dominant: string, secondary: string | null, spectrum: string[] | undefined): string => {
    const chakraConnections: Record<string, string> = {
      'Red': 'Root Chakra (Muladhara)',
      'Orange': 'Sacral Chakra (Svadhisthana)', 
      'Yellow': 'Solar Plexus Chakra (Manipura)',
      'Green': 'Heart Chakra (Anahata)',
      'Blue': 'Throat Chakra (Vishuddha)',
      'Indigo': 'Third Eye Chakra (Ajna)',
      'Violet': 'Crown Chakra (Sahasrara)',
      'Purple': 'Higher Crown Chakra',
      'Pink': 'Higher Heart Chakra',
      'Gold': 'Soul Star Chakra',
      'Silver': 'Lunar Energy Center',
      'White': 'Divine Light Center',
      'Black': 'work on Shadow Integration Center',
      'Gray': 'requires work',
      'Brown': 'Earth star Connection Center',
    };

    const colorMeanings: Record<string, string> = {
      'Red': 'grounding, vitality, survival strength',
      'Orange': 'creativity, passion, emotional flow',
      'Yellow': 'personal power, mental clarity, confidence',
      'Green': 'healing love, compassion, heart wisdom',
      'Blue': 'truth, peace, authentic communication',
      'Indigo': 'intuition, psychic sight, inner knowing',
      'Violet': 'spiritual connection, divine consciousness',
      'Pink': 'unconditional love, divine compassion',
      'Gold': 'divine wisdom, Christ consciousness',
      'Silver': 'lunar intuition, feminine wisdom',
      'White': 'pure light, spiritual protection',
      'Grey': 'work on balanced wisdom, neutral authority',
      'Black': ' work on shadow integration, transformative power',
      'Brown': 'earth-star connection, practical wisdom'
    };

    const totalColors = spectrum ? spectrum.length : 2;
    const dominantChakra = chakraConnections[dominant] || chakraConnections['Purple'];
    const secondaryChakra = secondary ? chakraConnections[secondary] || chakraConnections['Purple'] : '';
    const dominantMeaning = colorMeanings[dominant] || colorMeanings['Purple'];
    const secondaryMeaning = secondary ? colorMeanings[secondary] || colorMeanings['Purple'] : '';

    let analysis = `Your ${totalColors}-color aura spectrum reveals ${dominantChakra} dominance with ${dominantMeaning}`;
    
    if (secondary) {
      analysis += ` harmonizing with ${secondaryChakra} expressing ${secondaryMeaning}`;
    }

    if (spectrum && spectrum.length > 2) {
      const supportingColors = spectrum.slice(2, 4);
      const supportingChakras = supportingColors.map(color => 
        chakraConnections[color] || chakraConnections['Purple']
      ).join(' and ');
      analysis += `. Supporting energy from ${supportingChakras} creates multi-dimensional chakra activation`;
    }

    analysis += '. This chakra combination indicates advanced spiritual development with balanced energy flow across multiple dimensional frequencies.';
    
    return analysis;
  };

export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkLimits, checkCredits, deductCredits } = usePremium();
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [processedAuraImage, setProcessedAuraImage] = useState<string | null>(null);
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | null>(null);
  const [capturedScreenshots, setCapturedScreenshots] = useState<Map<string, string>>(new Map());
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isHealer, setIsHealer] = useState(user?.type === 'healer');
  const [healerNotes, setHealerNotes] = useState('');
  const [isSavingHealerNotes, setIsSavingHealerNotes] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<string | null>(null);
  const { showPremiumModal } = usePremium();

  // Save healer notes function
  const saveHealerNotes = async (analysisId: number, notes: string) => {
    if (!isHealer) return;
    
    try {
      setIsSavingHealerNotes(true);
      
      const response = await apiRequest('PATCH', `/api/aura-readings/${analysisId}/notes`, {
        healerNotes: notes
      });
      
      if (response.ok) {
        toast({
          title: "Notes Saved",
          description: "Healer notes have been saved successfully.",
        });
      } else {
        throw new Error('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving healer notes:', error);
      toast({
        title: "Error",
        description: "Failed to save healer notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingHealerNotes(false);
    }
  };

  const handlePremiumUpgrade = () => {
    showPremiumModal("aura");
  };

  // Function to share aura image on social media
  const shareAuraImage = async (platform: 'facebook' | 'instagram' | 'twitter') => {
    if (!result || !enhancedAuraImage) {
      toast({
        title: "No Image Available",
        description: "Please complete your aura analysis first to share the visualization.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a canvas with the processed aura image and overlay text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 800;

      // Create image element from processed aura image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = enhancedAuraImage;
      });

      // Draw the aura image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add overlay with branding and aura colors
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

      // Add text overlay
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      const dominantColor = result.colorAnalysis.dominant;
      const secondaryColor = result.colorAnalysis.secondary;
      const colors = secondaryColor ? `${dominantColor} & ${secondaryColor}` : dominantColor;
      ctx.fillText(`My Aura: ${colors} | AuraEye App`, 400, 780);

      // Convert canvas to blob and copy to clipboard for sharing
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            
            toast({
              title: "Image Copied!",
              description: "Your aura image has been copied to clipboard. You can now paste it on social media!",
            });
          } catch (clipboardError) {
            // Fallback: trigger download if clipboard fails
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-aura-${dominantColor.toLowerCase()}-auraeye.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
              title: "Image Downloaded",
              description: "Your aura image has been downloaded. Upload it to share on social media!",
            });
          }
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error sharing aura image:', error);
      toast({
        title: "Share Failed",
        description: "Failed to prepare image for sharing. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced image similarity detection for consistent results
  const findSimilarImage = (newHash: string, base64Image: string): AuraAnalysisResult | null => {
    // Check for exact match first
    if (imageCache.has(newHash)) {
      console.log('Returning cached result for identical image');
      return imageCache.get(newHash) || null;
    }
    
    // For identical images with slight compression differences, check content similarity
    const entries = Array.from(imageCache.entries());
    for (let i = 0; i < entries.length; i++) {
      const [cachedHash, cachedResult] = entries[i];
      
      // Compare hash similarity - identical images should have very similar hashes
      const similarity = calculateHashSimilarity(newHash, cachedHash);
      if (similarity > 0.95) { // 95% similarity threshold for same image
        console.log('Returning cached result for similar image (similarity:', similarity, ')');
        return cachedResult;
      }
    }
    return null;
  };

  // Calculate similarity between two hash strings
  const calculateHashSimilarity = (hash1: string, hash2: string): number => {
    if (hash1 === hash2) return 1.0;
    
    const maxLength = Math.max(hash1.length, hash2.length);
    const minLength = Math.min(hash1.length, hash2.length);
    
    // If lengths are very different, it's likely a different image
    if (maxLength - minLength > maxLength * 0.2) return 0;
    
    let matches = 0;
    for (let i = 0; i < minLength; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    
    return matches / maxLength;
  };

  // Submit review for aura analysis
  const submitReview = async () => {
    if (!currentAnalysisId || rating === 0) return;

    setIsSubmittingReview(true);
    try {
      await fetch(`/api/aura-readings/${currentAnalysisId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, reviewText })
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setReviewSubmitted(true);
      setRating(0);
      setReviewText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Continue with main component functions and JSX
  const calculateNumerologyAnalysis = async () => {
    // Numerology calculation logic will be here
  };

  // Main component JSX starts here

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white py-16">
          <AuraGlow 
            colors={[
              { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-center">Aura Analysis</h1>
            <p className="text-white/80 max-w-2xl mx-auto text-center">
              Upload your photo and our AI will analyze your energy field, revealing your aura colors and providing personalized insights.
            </p>
          </div>
        </section>
        
        {/* Upload and Analysis section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Upload area will go here */}
              <div className="text-center">
                <p>Upload and analysis functionality will continue here...</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
    console.log('Processed aura image available:', !!processedAuraImage);
    console.log('Enhanced aura image available:', !!enhancedAuraImage);
    console.log('Using image for PDF:', processedAuraImage || enhancedAuraImage || 'none available');
