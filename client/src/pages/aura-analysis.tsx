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

// Helper functions for enhanced spiritual guidance
const getColorSpiritalMeaning = (color: string): string => {
  const meanings: Record<string, string> = {
    'Red': 'Root chakra energy representing grounding, survival instincts, and life force. This color indicates strong willpower, passion, and connection to earth energy.',
    'Orange': 'Sacral chakra energy embodying creativity, sexuality, and emotional flow. This vibrant frequency enhances artistic expression and emotional healing.',
    'Yellow': 'Solar plexus energy radiating personal power, confidence, and mental clarity. This golden light strengthens willpower and intellectual abilities.',
    'Green': 'Heart chakra energy emanating love, healing, and compassion. This healing frequency promotes emotional balance and natural healing abilities.',
    'Blue': 'Throat chakra energy facilitating communication, truth, and spiritual expression. This calming frequency enhances authentic self-expression.',
    'Indigo': 'Third eye chakra energy opening intuition, psychic abilities, and spiritual insight. This mystical frequency develops inner wisdom and perception.',
    'Violet': 'Crown chakra energy connecting to divine consciousness and spiritual enlightenment. This highest frequency represents spiritual mastery.',
    "_Pink": 'Divine love and emotional healing. This gentle frequency promotes unconditional love and emotional nurturing.',
    get "Pink"() {
        return this["_Pink"];
    },
    set "Pink"(value) {
        this["_Pink"] = value;
    },
    'Gold': 'Divine wisdom and spiritual illumination. This sacred frequency represents enlightened consciousness and spiritual mastery.',
    'White': 'Pure divine light and spiritual protection. This pristine frequency indicates angelic connection and spiritual purity.',
    'Silver': 'Lunar energy and psychic sensitivity. This reflective frequency enhances intuitive abilities and emotional receptivity.',
    'black': 'Shadow work and transformative energy. This deep frequency represents deep spiritual integration and shadow healing.',
    'grey': 'Neutral balance and adaptable wisdom. This balanced frequency indicates wise neutrality and peaceful resolution.',
    'brown': 'Earth connection and grounding stability. This practical frequency represents natural wisdom and earth-based spiritual growth.',
    
  };
  return meanings[color] || 'This unique aura color carries special spiritual significance and represents your individual soul expression.';
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


export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showPremiumModal } = usePremium();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("analysis");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing aura scanning...");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedAuraImage, setProcessedAuraImage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | null>(null);
  
  // Name input state
  const [nameEntered, setNameEntered] = useState(false);
  const [analysisName, setAnalysisName] = useState("");
  
  // Image hash storage for consistent results
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());
  
  // Healer notes state (only for healers)
  const [healerNotes, setHealerNotes] = useState("");
  const [isHealerNotesExpanded, setIsHealerNotesExpanded] = useState(false);
  const [isSavingHealerNotes, setIsSavingHealerNotes] = useState(false);
  
  // Check if user is a healer (password healer123)
  const isHealer = user?.userType === 'healer' || false;

  // Screenshot functionality
  const [capturedScreenshots, setCapturedScreenshots] = useState<Map<string, string>>(new Map());
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<string | null>(null);

  // If user is a client (not a healer), show locked state
  if (!isHealer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Aura Analysis
                </span>
              </h1>
              <p className="text-white/80 text-lg">
                Professional aura reading and chakra analysis
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Connect with a Professional Healer
                </CardTitle>
                <CardDescription className="text-white/70 text-lg">
                  Aura analysis requires professional interpretation for accurate spiritual guidance. You can run an analysis yourself but the healer can provide the same along with remedies and personalised guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold mb-4 text-center">Why Work with a Healer?</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Professional Interpretation</h4>
                        <p className="text-white/70 text-sm">Expert analysis of your aura colors and their spiritual meanings</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Personalized Remedies</h4>
                        <p className="text-white/70 text-sm">Custom healing suggestions and spiritual practices</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Chakra Balancing</h4>
                        <p className="text-white/70 text-sm">Detailed chakra analysis with healing recommendations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Spiritual Guidance</h4>
                        <p className="text-white/70 text-sm">Ongoing support for your spiritual journey</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-white/80">
                    Professional healers can provide comprehensive aura analysis reports with personalized remedies and spiritual guidance tailored to your unique energy signature.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/healers">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3">
                        <Users className="w-5 h-5 mr-2" />
                        Connect with a Healer
                      </Button>
                    </Link>
                    <Link href="/client-dashboard">
                      <Button className="bg-primary text-white hover:bg-white/10 px-8 py-3">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        View My Readings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
      if (similarity > 0.95) { // 85% similarity threshold for same image
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
  
  // Numerology states
  const [numerologyName, setNumerologyName] = useState("");
  const [numerologyBirthDate, setNumerologyBirthDate] = useState("");
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  
  const handlePremiumUpgrade = () => {
    showPremiumModal("aura");
  };

  // Function to download complete aura and numerology analysis as PDF
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

      // Add overlay with aura information
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

      // Add text overlay
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`My Aura: ${result.dominantColor}`, canvas.width / 2, canvas.height - 100);
      
      ctx.font = '18px Arial';
      ctx.fillText('Discover your spiritual energy with AuraEye', canvas.width / 2, canvas.height - 70);
      
      ctx.font = '16px Arial';
      ctx.fillText(`Energy Level: ${result.energyLevel}/10`, canvas.width / 2, canvas.height - 40);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 0.9);
      });

      // Check if Web Share API is supported and has file sharing capability
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'aura-analysis.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'aura-analysis.png', { type: 'image/png' });
        await navigator.share({
          title: `My Aura Analysis - ${result.dominantColor}`,
          text: `Check out my aura analysis! My dominant color is ${result.dominantColor} with an energy level of ${result.energyLevel}/10. Discover your spiritual energy with AuraEye!`,
          files: [file]
        });
      } else {
        // Fallback: Create download link and open social media sharing
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'aura-analysis.png';
        link.click();
        URL.revokeObjectURL(url);

        // Open social media sharing after download
        const shareText = `Check out my aura analysis! My dominant color is ${result.dominantColor} with an energy level of ${result.energyLevel}/10. Discover your spiritual energy with AuraEye! ${window.location.href}`;
        
        switch (platform) {
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
            break;
          case 'instagram':
            // Instagram doesn't support direct URL sharing, so we'll open Instagram and show instructions
            toast({
              title: "Image Downloaded",
              description: "Your aura image has been downloaded. Open Instagram and upload the downloaded image to share your aura analysis!",
            });
            break;
          case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
            break;
        }

        toast({
          title: "Ready to Share",
          description: "Your aura visualization has been downloaded. Upload it when sharing on social media!",
        });
      }
    } catch (error) {
      console.error('Error sharing aura image:', error);
      toast({
        title: "Share Failed",
        description: "Failed to prepare image for sharing. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function for PDF color meanings
  const getColorMeaningForPDF = (colorName: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'Red represents life force energy, passion, and survival instincts. It indicates strong physical vitality, courage, and determination. This color suggests you are action-oriented and possess natural leadership qualities.',
      'Orange': 'Orange embodies creativity, emotional expression, and social connection. It reflects your ability to bring joy and enthusiasm to relationships while maintaining healthy boundaries with others.',
      'Yellow': 'Yellow signifies mental clarity, intellectual power, and optimism. This color indicates strong analytical abilities, clear communication skills, and a natural tendency toward learning and teaching.',
      'Green': 'Green represents healing energy, balance, and heart-centered wisdom. It shows your natural ability to help others while maintaining emotional stability and compassionate understanding.',
      'Blue': 'Blue reflects peaceful communication, truth, and spiritual awareness. This color indicates your ability to express yourself authentically while maintaining calm and supportive energy.',
      'Indigo': 'Indigo represents psychic abilities, deep intuition, and spiritual insight. This color suggests you have natural access to higher wisdom and can perceive beyond the physical realm.',
      'Violet': 'Violet embodies spiritual connection, divine consciousness, and enlightenment. This color indicates your strong connection to higher spiritual realms and natural wisdom.',
      'White': 'White represents purity, divine protection, and spiritual clarity. This color indicates your connection to angelic guidance and your role as a spiritual light for others.',
      'Black': 'Black indicates deep transformation, shadow work, and protective energy. This color suggests you are processing deep spiritual changes and developing strong energetic boundaries.',
      'Gold': 'Gold represents divine wisdom, spiritual authority, and enlightened consciousness. This color indicates your connection to higher spiritual teachings and natural healing abilities.',
      'Silver': 'Silver reflects lunar wisdom, psychic protection, and intuitive insights. This color indicates your strong connection to feminine wisdom and natural psychic abilities.',
      'Brown': 'Brown represents grounding, earth connection, and practical wisdom. This color indicates your ability to bridge spiritual insights with practical everyday applications.'
    };
    return meanings[colorName] || `${colorName} energy carries unique spiritual significance that supports your personal growth and spiritual development journey.`;
  };

  // Enhanced screenshot capture function with 15% increased width and improved quality
  const captureTabScreenshot = async (tabId: string) => {
    setIsCapturingScreenshot(tabId);
    try {
      const element = document.querySelector(`[data-tab="${tabId}"]`) || document.querySelector('[data-state="active"]');
      if (!element) {
        throw new Error('Tab content not found');
      }

      const htmlElement = element as HTMLElement;
      const rect = htmlElement.getBoundingClientRect();
      
      // Get viewport dimensions for proper sizing reference
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate the full scrollable content size with 15% width increase as requested
      const baseContentWidth = Math.max(
        htmlElement.scrollWidth,
        htmlElement.offsetWidth,
        htmlElement.clientWidth,
        rect.width
      );
      
      // Increase width by 15% for better readability and visibility
      const contentWidth = Math.floor(baseContentWidth * 1.15);
      
      // Ensure comprehensive content height capture for all tabs
      let contentHeight = Math.max(
        htmlElement.scrollHeight,
        htmlElement.offsetHeight,
        htmlElement.clientHeight,
        rect.height
      );
      
      // Enhanced height detection for all tabs to ensure full content capture
      if (['chakras', 'analysis', 'guidance', 'energy-reading', 'spectrum', 'energy-map', 'detailed', 'combined'].includes(tabId)) {
        // Scroll to bottom first to ensure all content is rendered and measurable
        const originalScrollTop = htmlElement.scrollTop;
        htmlElement.scrollTop = htmlElement.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, 100)); // Let content render
        
        // Now scroll back to top for measurement
        htmlElement.scrollTop = 0;
        await new Promise(resolve => setTimeout(resolve, 100)); // Let layout stabilize
        
        // Temporarily expand element to full content size for accurate measurement
        const tempStyles = {
          overflow: htmlElement.style.overflow,
          height: htmlElement.style.height,
          maxHeight: htmlElement.style.maxHeight,
          minHeight: htmlElement.style.minHeight
        };
        
        htmlElement.style.overflow = 'visible';
        htmlElement.style.height = 'auto';
        htmlElement.style.maxHeight = 'none';
        htmlElement.style.minHeight = 'auto';
        
        // Wait for layout recalculation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Re-measure after expansion
        const expandedRect = htmlElement.getBoundingClientRect();
        let realContentHeight = Math.max(
          htmlElement.scrollHeight,
          htmlElement.offsetHeight,
          htmlElement.clientHeight,
          expandedRect.height
        );
        
        // Find all child elements and calculate total height
        const children = htmlElement.querySelectorAll('*');
        let maxBottom = 0;
        children.forEach(child => {
          const childRect = child.getBoundingClientRect();
          const elementRect = htmlElement.getBoundingClientRect();
          const relativeBottom = childRect.bottom - elementRect.top;
          maxBottom = Math.max(maxBottom, relativeBottom);
        });
        
        // Use the larger of the two measurements
        realContentHeight = Math.max(realContentHeight, maxBottom);
        
        // Restore original styles
        htmlElement.style.overflow = tempStyles.overflow;
        htmlElement.style.height = tempStyles.height;
        htmlElement.style.maxHeight = tempStyles.maxHeight;
        htmlElement.style.minHeight = tempStyles.minHeight;
        
        // Extra padding for tabs with complex content - special handling for energy-map
        const paddingMultiplier = (['analysis', 'guidance', 'spectrum'].includes(tabId) ? 300 : 
                                  (['chakras', 'detailed', 'combined'].includes(tabId) ? 200 : 
                                  (tabId === 'energy-map' ? 400 : 150))); // Extra padding for energy-map
        
        contentHeight = Math.max(contentHeight, realContentHeight + paddingMultiplier);
        console.log(`${tabId} tab enhanced height detection: original=${htmlElement.scrollHeight}, measured=${realContentHeight}, detected=${maxBottom}, final=${contentHeight}, padding=${paddingMultiplier}px`);
        
        // Special handling for specific tabs to ensure complete capture
        if (['analysis', 'guidance', 'spectrum', 'energy-map'].includes(tabId)) {
          // Look for the last meaningful content section
          const lastSections = htmlElement.querySelectorAll('.space-y-4 > div:last-child, .space-y-6 > div:last-child, .grid:last-child, .bg-gradient-to-br:last-child');
          if (lastSections.length > 0) {
            const lastSection = lastSections[lastSections.length - 1];
            const sectionRect = lastSection.getBoundingClientRect();
            const elementRect = htmlElement.getBoundingClientRect();
            const sectionBottom = sectionRect.bottom - elementRect.top;
            // Moderate padding for energy-map for PDF fitting while ensuring content capture
            const extraPadding = (tabId === 'energy-map') ? 150 : 200;
            contentHeight = Math.max(contentHeight, sectionBottom + extraPadding);
            console.log(`${tabId} last section detected at bottom: ${sectionBottom}, adjusted height: ${contentHeight} (padding: ${extraPadding}px)`);
          }
          
          // Special detection for energy-map's Energy Interaction Map section
          if (tabId === 'energy-map') {
            const energyMapSections = htmlElement.querySelectorAll('.bg-gradient-to-br.from-purple-50');
            if (energyMapSections.length > 0) {
              const lastEnergySection = energyMapSections[energyMapSections.length - 1];
              const energyRect = lastEnergySection.getBoundingClientRect();
              const elementRect = htmlElement.getBoundingClientRect();
              const energyBottom = energyRect.bottom - elementRect.top;
              contentHeight = Math.max(contentHeight, energyBottom + 100); // Moderate buffer for Energy Interaction Map
              console.log(`Energy Interaction Map detected at bottom: ${energyBottom}, adjusted height: ${contentHeight}`);
            }
          }
          
          // Force minimum height for complex tabs
          const minHeights: Record<string, number> = {
            'guidance': 2000,
            'spectrum': 1800,
            'analysis': 3000,
            'energy-map': 2800  // Optimized height for 6-section PDF fitting
          };
          contentHeight = Math.max(contentHeight, minHeights[tabId] || contentHeight);
        }
      }

      // Enhanced capture width with 15% increase for better readability and minimum thresholds
      const baseCaptureWidth = Math.max(viewportWidth, contentWidth, 1200);
      const captureWidth = Math.floor(baseCaptureWidth * 1.15); // 15% width increase as requested
      
      // Enhanced section thresholds for better PDF quality - force multi-section for long content
      const maxSingleCaptureHeight = Math.max(viewportHeight * 4, 6000); // Reduced threshold for better section quality
      const needsMultiSection = contentHeight > maxSingleCaptureHeight;
      
      // Enhanced multi-section logic for better readability across all tabs
      const forceMultiSection = (['guidance', 'spectrum'].includes(tabId) && contentHeight > 4000) ||
                                (['detailed', 'chakras', 'analysis', 'energy-map'].includes(tabId)); // Always use multi-section for critical tabs
      
      console.log(`Enhanced capture: Base ${baseCaptureWidth}x${contentHeight} → Enhanced ${captureWidth}x${contentHeight} (+15% width)`);
      console.log(`Multi-section capture needed: ${needsMultiSection || forceMultiSection}`);

      if (needsMultiSection || forceMultiSection) {
        // Capture long content in optimized sections for optimal PDF display
        const screenshots: string[] = [];
        
        // Enhanced section calculation for optimal readability and PDF presentation
        let sectionHeight: number;
        let totalSections: number;
        let enhancedCaptureWidth = captureWidth;
        
        if (tabId === 'detailed' || tabId === 'chakras' || tabId === 'analysis') {
          // Force exactly 4 sections for critical analysis tabs with enhanced dimensions
          totalSections = 4;
          sectionHeight = Math.ceil(contentHeight / 4);
          // Additional 25% width increase for critical tabs text legibility (40% total increase)
          enhancedCaptureWidth = Math.floor(captureWidth * 1.25);
        } else if (tabId === 'energy-map') {
          // Optimized sectioning for energy-map to fit properly in PDF pages
          // Use more sections to reduce individual section height for better PDF fitting
          totalSections = 6;  // More sections for better page fitting
          sectionHeight = Math.ceil(contentHeight / 6);
          // Additional width increase for text legibility
          enhancedCaptureWidth = Math.floor(captureWidth * 1.25);
        } else if (['guidance'].includes(tabId)) {
          // Optimized sectioning for complex tabs
          const idealSectionHeight = Math.min(4000, Math.ceil(contentHeight / 3)); // Target 3-4 sections max
          sectionHeight = idealSectionHeight;
          totalSections = Math.ceil(contentHeight / sectionHeight);
          // Additional 10% width increase for complex tabs
          enhancedCaptureWidth = Math.floor(captureWidth * 1.10);
        } else {
          // Standard sectioning for other tabs with optimal aspect ratio
          const targetAspectRatio = 16 / 9;
          sectionHeight = Math.floor(captureWidth / targetAspectRatio);
          totalSections = Math.ceil(contentHeight / sectionHeight);
          // Use base enhanced width (already 15% increased)
        }
        
        console.log(`Capturing ${totalSections} sections for ${tabId} tab with enhanced width ${enhancedCaptureWidth}px, each section optimized for PDF readability`);
        
        for (let section = 0; section < totalSections; section++) {
          const startY = section * sectionHeight;
          const endY = Math.min(startY + sectionHeight, contentHeight);
          const actualSectionHeight = endY - startY;
          
          // Scroll element to show this section - try multiple approaches
          try {
            if (htmlElement.scrollTo) {
              htmlElement.scrollTo({ top: startY, behavior: 'instant' });
            }
            
            // Also try scrolling any scrollable parent containers
            const scrollableParents = [];
            let parent = htmlElement.parentElement;
            while (parent) {
              const style = window.getComputedStyle(parent);
              if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
                scrollableParents.push(parent);
              }
              parent = parent.parentElement;
            }
            
            scrollableParents.forEach(scrollParent => {
              if (scrollParent.scrollTo) {
                scrollParent.scrollTo({ top: startY, behavior: 'instant' });
              }
            });
            
            // Also scroll window as fallback
            const elementTop = htmlElement.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementTop + startY, behavior: 'instant' });
            
          } catch (scrollError) {
            console.warn('Scroll failed, continuing with capture:', scrollError);
          }
          
          // Wait longer for scroll to complete and content to render
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Use enhanced width for all tabs with tab-specific optimizations
          const sectionCanvas = await html2canvas(htmlElement, {
            backgroundColor: '#ffffff',
            scale: (tabId === 'detailed' || tabId === 'chakras' || tabId === 'energy-map' || tabId === 'analysis') ? 5.0 : 3.5, // Maximum scale for critical tabs
            logging: false,
            useCORS: true,
            allowTaint: false,
            x: 0,
            y: startY,
            width: enhancedCaptureWidth,
            height: actualSectionHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: enhancedCaptureWidth,
            windowHeight: actualSectionHeight,
            removeContainer: false,
            foreignObjectRendering: false,
            imageTimeout: 5000, // Extended timeout for high-quality processing
            // Enhanced text rendering with high quality settings
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.querySelector(`[data-tab="${tabId}"]`) || clonedDoc.querySelector('[data-state="active"]');
              if (clonedElement) {
                const elem = clonedElement as HTMLElement;
                elem.style.overflow = 'visible';
                elem.style.height = 'auto';
                elem.style.maxHeight = 'none';
                elem.style.width = 'auto';
                elem.style.maxWidth = 'none';
                // Enhanced text rendering for all tabs with proper sizing for analysis tab
                if (tabId === 'detailed' || tabId === 'chakras' || tabId === 'energy-map') {
                  // High resolution for complex tabs
                  elem.style.fontSize = '20px';
                  elem.style.lineHeight = '1.8';
                  const textElements = elem.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
                  textElements.forEach(textEl => {
                    const textElement = textEl as HTMLElement;
                    textElement.style.fontSize = '20px';
                    textElement.style.fontWeight = '700';
                    textElement.style.letterSpacing = '0.4px';
                    textElement.style.textRendering = 'optimizeLegibility';
                  });
                } else if (tabId === 'analysis') {
                  // Maintain original proportions for analysis tab to match interface display exactly
                  // Don't modify fontSize at root level - preserve original element sizes
                  const textElements = elem.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
                  textElements.forEach(textEl => {
                    const textElement = textEl as HTMLElement;
                    // Keep original computed font size but enhance clarity
                    const originalStyles = window.getComputedStyle(textElement);
                    textElement.style.fontSize = originalStyles.fontSize; // Preserve exact original size
                    textElement.style.lineHeight = originalStyles.lineHeight || '1.4';
                    textElement.style.fontWeight = originalStyles.fontWeight || 'normal';
                    textElement.style.letterSpacing = '0.1px'; // Minimal adjustment for clarity
                    textElement.style.textRendering = 'optimizeLegibility';
                  });
                } else {
                  // Enhanced text for all other tabs
                  elem.style.fontSize = '15px';
                  elem.style.lineHeight = '1.6';
                  const textElements = elem.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
                  textElements.forEach(textEl => {
                    const textElement = textEl as HTMLElement;
                    textElement.style.fontSize = '15px';
                    textElement.style.fontWeight = '500';
                    textElement.style.letterSpacing = '0.2px';
                  });
                }
              }
            }
          });
          
          screenshots.push(sectionCanvas.toDataURL('image/png', 1.0)); // Maximum quality PNG
          console.log(`Section ${section + 1}/${totalSections}: ${sectionCanvas.width}x${sectionCanvas.height}`);
        }
        
        // Reset scroll position for all scrollable containers
        try {
          if (htmlElement.scrollTo) {
            htmlElement.scrollTo({ top: 0, behavior: 'instant' });
          }
          
          // Reset scroll for scrollable parent containers
          const scrollableParents = [];
          let parent = htmlElement.parentElement;
          while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
              scrollableParents.push(parent);
            }
            parent = parent.parentElement;
          }
          
          scrollableParents.forEach(scrollParent => {
            if (scrollParent.scrollTo) {
              scrollParent.scrollTo({ top: 0, behavior: 'instant' });
            }
          });
          
          // Reset window scroll
          window.scrollTo({ top: 0, behavior: 'instant' });
        } catch (resetScrollError) {
          console.warn('Failed to reset scroll position:', resetScrollError);
        }
        
        // Combine all sections into one long image for PDF with enhanced dimensions
        const combinedCanvas = document.createElement('canvas');
        const ctx = combinedCanvas.getContext('2d')!;
        
        // Calculate combined dimensions using enhanced width and scale factor
        const scaleUsed = (tabId === 'detailed' || tabId === 'chakras' || tabId === 'energy-map' || tabId === 'analysis') ? 5.0 : 3.5;
        const finalWidth = enhancedCaptureWidth * scaleUsed;
        const baseFinalHeight = screenshots.length * (sectionHeight * scaleUsed);
        
        // Add minimal bottom padding for energy-map tab for proper PDF page fitting
        const bottomPadding = (tabId === 'energy-map') ? 5 * scaleUsed : 0; // 5px padding as requested
        const finalHeight = baseFinalHeight + bottomPadding;
        
        combinedCanvas.width = finalWidth;
        combinedCanvas.height = finalHeight;
        
        // Fill canvas with white background (especially important for energy-map bottom padding)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
        
        console.log(`Canvas dimensions for ${tabId}: ${finalWidth}x${finalHeight} (base: ${baseFinalHeight}, padding: ${bottomPadding}px)`);
        
        // Draw each section onto the combined canvas
        for (let i = 0; i < screenshots.length; i++) {
          const img = new Image();
          img.src = screenshots[i];
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, 0, i * (sectionHeight * scaleUsed));
              resolve(true);
            };
          });
        }
        
        // Use PNG with 10% more compression
        const combinedImageDataUrl = combinedCanvas.toDataURL('image/png', 0.9);
        console.log(`Enhanced combined image size: ${(combinedImageDataUrl.length / 1024 / 1024).toFixed(2)} MB with improved dimensions`);
        
        // Store with much higher size limit for enhanced quality screenshots, especially for chakras and detailed tabs
        const sizeLimit = (tabId === 'chakras' || tabId === 'detailed' || tabId === 'energy-map') ? 25 * 1024 * 1024 : 15 * 1024 * 1024;
        if (combinedImageDataUrl.length < sizeLimit) {
          setCapturedScreenshots(prev => new Map(prev).set(tabId, combinedImageDataUrl));
          console.log(`✅ ${tabId} screenshot captured successfully: ${(combinedImageDataUrl.length / 1024 / 1024).toFixed(2)} MB`);
        } else {
          console.warn(`Combined image too large for ${tabId} (${(combinedImageDataUrl.length / 1024 / 1024).toFixed(2)} MB), attempting JPEG compression`);
          // Fallback to JPEG with 10% more compression
          const jpegVersion = combinedCanvas.toDataURL('image/jpeg', 0.9);
          if (jpegVersion.length < 20 * 1024 * 1024) { // Higher fallback limit
            setCapturedScreenshots(prev => new Map(prev).set(tabId, jpegVersion));
            console.log(`✅ ${tabId} screenshot captured with JPEG compression: ${(jpegVersion.length / 1024 / 1024).toFixed(2)} MB`);
          } else {
            console.error(`❌ ${tabId} screenshot too large even with JPEG compression: ${(jpegVersion.length / 1024 / 1024).toFixed(2)} MB`);
          }
        }
        
        console.log(`Multi-section capture complete: ${combinedCanvas.width}x${combinedCanvas.height} total`);
        
      } else {
        // Single capture for shorter content with optimal sizing
        console.log(`Single capture: ${captureWidth}x${contentHeight}`);

        // Ensure element is fully expanded before capture
        const originalStyles = {
          overflow: htmlElement.style.overflow,
          height: htmlElement.style.height,
          maxHeight: htmlElement.style.maxHeight
        };
        
        // Temporarily expand the element to show all content
        htmlElement.style.overflow = 'visible';
        htmlElement.style.height = `${contentHeight}px`;
        htmlElement.style.maxHeight = 'none';
        htmlElement.style.minHeight = `${contentHeight}px`;
        htmlElement.style.width = 'auto';
        htmlElement.style.maxWidth = 'none';
        
        // Force all children to be visible and properly sized
        const allChildren = htmlElement.querySelectorAll('*');
        allChildren.forEach(child => {
          const childElem = child as HTMLElement;
          if (childElem.style) {
            childElem.style.overflow = 'visible';
            childElem.style.maxHeight = 'none';
            childElem.style.height = 'auto';
            childElem.style.opacity = '1';
            childElem.style.visibility = 'visible';
          }
        });
        
        // Ensure no scrolling during capture
        htmlElement.scrollTop = 0;
        window.scrollTo(0, 0);
        
        // Wait for layout to stabilize
        await new Promise(resolve => setTimeout(resolve, 800));

        const canvas = await html2canvas(htmlElement, {
          backgroundColor: '#ffffff',
          scale: 3.5, // Enhanced scale for all single captures
          logging: false,
          useCORS: true,
          allowTaint: false,
          width: captureWidth, // Already enhanced with 15% increase
          height: contentHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: captureWidth,
          windowHeight: contentHeight,
          removeContainer: false,
          foreignObjectRendering: false,
          imageTimeout: 8000, // Longer timeout for complex content
          ignoreElements: (element) => {
            // Ignore scroll bars and other non-essential elements
            const htmlElement = element as HTMLElement;
            return element.tagName === 'NOSCRIPT' || 
                   element.className?.includes?.('scroll') ||
                   htmlElement.style?.position === 'fixed';
          },
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector(`[data-tab="${tabId}"]`) || clonedDoc.querySelector('[data-state="active"]');
            if (clonedElement) {
              const elem = clonedElement as HTMLElement;
              elem.style.overflow = 'visible';
              elem.style.height = 'auto';
              elem.style.maxHeight = 'none';
              elem.style.width = 'auto';
              elem.style.maxWidth = 'none';
              
              // Ensure all child elements are visible with enhanced text rendering
              const allChildren = elem.querySelectorAll('*');
              allChildren.forEach(child => {
                const childElem = child as HTMLElement;
                childElem.style.overflow = 'visible';
                childElem.style.maxHeight = 'none';
                childElem.style.height = 'auto';
              });
              
              // Enhanced text rendering for single captures
              elem.style.fontSize = '15px';
              elem.style.lineHeight = '1.6';
              const textElements = elem.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
              textElements.forEach(textEl => {
                const textElement = textEl as HTMLElement;
                textElement.style.fontSize = '15px';
                textElement.style.fontWeight = '500';
                textElement.style.letterSpacing = '0.2px';
              });
            }
          }
        });
        
        // Restore original styles
        htmlElement.style.overflow = originalStyles.overflow;
        htmlElement.style.height = originalStyles.height;
        htmlElement.style.maxHeight = originalStyles.maxHeight;
        htmlElement.style.minHeight = '';
        htmlElement.style.width = '';
        htmlElement.style.maxWidth = '';

        // Use PNG with 10% more compression  
        const imageDataUrl = canvas.toDataURL('image/png', 0.9);
        console.log(`Enhanced single image size: ${(imageDataUrl.length / 1024 / 1024).toFixed(2)} MB with improved quality`);
        
        // Store with higher size limit for enhanced quality screenshots
        const singleSizeLimit = (tabId === 'chakras' || tabId === 'detailed' || tabId === 'energy-map') ? 20 * 1024 * 1024 : 12 * 1024 * 1024;
        if (imageDataUrl.length < singleSizeLimit) {
          setCapturedScreenshots(prev => new Map(prev).set(tabId, imageDataUrl));
          console.log(`✅ ${tabId} single screenshot captured successfully: ${(imageDataUrl.length / 1024 / 1024).toFixed(2)} MB`);
        } else {
          console.warn(`Single image too large for ${tabId} (${(imageDataUrl.length / 1024 / 1024).toFixed(2)} MB), attempting JPEG compression`);
          // Fallback to JPEG with 10% more compression
          const jpegVersion = canvas.toDataURL('image/jpeg', 0.9);
          if (jpegVersion.length < 15 * 1024 * 1024) { // Higher fallback limit
            setCapturedScreenshots(prev => new Map(prev).set(tabId, jpegVersion));
            console.log(`✅ ${tabId} single screenshot captured with JPEG compression: ${(jpegVersion.length / 1024 / 1024).toFixed(2)} MB`);
          } else {
            console.error(`❌ ${tabId} single screenshot too large even with JPEG compression: ${(jpegVersion.length / 1024 / 1024).toFixed(2)} MB`);
          }
        }
        
        console.log(`Single screenshot: ${canvas.width}x${canvas.height}, ratio: ${(canvas.width/canvas.height).toFixed(2)}`);
      }
      
      toast({
        title: "Screenshot Captured",
        description: `High-quality screenshot of ${getTabDisplayName(tabId)} captured with proper dimensions.`,
      });
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast({
        title: "Screenshot Failed",
        description: "Could not capture screenshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturingScreenshot(null);
    }
  };

  // Helper function to get display names for tabs
  const getTabDisplayName = (tabId: string): string => {
    const names: Record<string, string> = {
      'analysis': 'Analysis',
      'energy-reading': 'Chakra Score',
      'chakras': 'Detailed Chakras',
      'guidance': 'Guidance',
      'spectrum': 'Color Spectrum',
      'energy-map': 'Energy Map',
      'detailed': 'Detailed Analysis',
      'combined': 'Combined Analysis'
    };
    return names[tabId] || tabId;
  };

  const downloadComprehensiveAuraPDF = async () => {
    if (!result) {
      console.error('No aura analysis result available for PDF generation');
      toast({
        title: "PDF Generation Failed",
        description: "No analysis data available. Please perform an aura analysis first.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting PDF generation with result:', result);
    console.log('Processed aura image available:', !!processedAuraImage);
    console.log('Enhanced aura image available:', !!enhancedAuraImage);
    console.log('Using image for PDF:', processedAuraImage || enhancedAuraImage || 'none available');

    try {
      toast({
        title: "Generating PDF",
        description: "Creating your comprehensive aura analysis report with all sections...",
      });

      // Test jsPDF initialization
      console.log('Initializing jsPDF...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      console.log('jsPDF initialized successfully');

      const pageWidth = 210;
      const pageHeight = 297;
      let yPosition = 20;
      
      // Helper function to add text with automatic page breaks
      const addTextWithPageBreak = (text: string, x: number, y: number, options: any = {}) => {
        try {
          // Ensure y is a valid number
          if (typeof y !== 'number' || isNaN(y) || y < 0) {
            y = 20; // Default to top of page if invalid
          }
          
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          
          // Ensure center alignment is properly set
          if (options.align === 'center') {
            pdf.text(text, x, y, { align: 'center' });
          } else {
            pdf.text(text, x, y, options);
          }
          return y + 5; // Return next y position
        } catch (error) {
          console.error('Error in addTextWithPageBreak:', error, 'Text:', text, 'Position:', x, y);
          throw error;
        }
      };

      // Helper function to add wrapped text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
        try {
          if (!text || typeof text !== 'string') {
            console.warn('Invalid text provided to addWrappedText:', text);
            return y;
          }
          const lines = pdf.splitTextToSize(text, maxWidth);
          for (let i = 0; i < lines.length; i++) {
            if (y > pageHeight - 20) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(lines[i], x, y);
            y += lineHeight;
          }
          return y;
        } catch (error) {
          console.error('Error in addWrappedText:', error, 'Text:', text);
          throw error;
        }
      };

      // Helper function to add screenshot images (simplified for synchronous use)
      const addScreenshotImage = (imageDataUrl: string, x: number, y: number, maxWidth: number, maxHeight: number) => {
            try {
                // Ensure y is a valid number
                if (typeof y !== 'number' || isNaN(y) || y < 0) {
                    y = 20;
                }

                if (y + maxHeight > pageHeight - 20) {
                    pdf.addPage();
                    y = 20;
                }

                // Add image with fixed dimensions for consistent layout
                pdf.addImage(imageDataUrl, 'PNG', x, y, maxWidth, maxHeight);
                return y + maxHeight + 5;
            } catch (error) {
                console.error('Error adding screenshot image:', error);
                return y + 10;
            }
        };

      // Add the uploaded image as the first page if available
      const addUploadedImageAsFirstPage = async () => {
        try {
          // Import the new cover image directly from attached assets  
          const uploadedImageModule = await import('@assets/pdf-cover-image.jpeg');
          const uploadedImageSrc = uploadedImageModule.default;
          
          // Create image to get dimensions
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = uploadedImageSrc;
          });
          
          // Calculate dimensions to cover the full page (no margins)
          const imgAspectRatio = img.width / img.height;
          const pageAspectRatio = pageWidth / pageHeight;
          
          let imgWidth, imgHeight, imgX, imgY;
          
          if (imgAspectRatio > pageAspectRatio) {
            // Image is wider than page ratio, fit to page height and extend beyond page width
            imgHeight = pageHeight;
            imgWidth = imgHeight * imgAspectRatio;
            imgX = (pageWidth - imgWidth) / 2; // Center horizontally
            imgY = 0;
          } else {
            // Image is taller than page ratio, fit to page width and extend beyond page height
            imgWidth = pageWidth;
            imgHeight = imgWidth / imgAspectRatio;
            imgX = 0;
            imgY = (pageHeight - imgHeight) / 2; // Center vertically
          }
          
          // Force full page coverage - ensure image fills entire page with zero margins
          imgWidth = pageWidth;
          imgHeight = pageHeight;
          imgX = 0;
          imgY = 0;
          
          // Add the uploaded original image as full-page first page covering entire surface
          pdf.addImage(uploadedImageSrc, 'JPEG', imgX, imgY, imgWidth, imgHeight);
          
          console.log('Successfully added uploaded image as full-page first page');
          return true;
        } catch (error) {
          console.warn('Could not load uploaded image for first page:', error);
          return false;
        }
      };

      // Helper function to compress images for PDF to prevent "Invalid string length" errors
      const compressImageForPDF = async (imageDataUrl: string, targetWidth: number, targetHeight: number) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          return new Promise<string>((resolve) => {
            img.onload = () => {
              // Set canvas size with maximum resolution for crystal clear PDF quality
              canvas.width = Math.min(targetWidth * 10, 3000); // Maximum resolution for crystal clear quality
              canvas.height = Math.min(targetHeight * 10, 4000); // Maximum resolution for crystal clear quality
              
              // Use high-quality image rendering
              ctx!.imageSmoothingEnabled = true;
              ctx!.imageSmoothingQuality = 'high';
              
              // Draw the image with high quality
              ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Use PNG with no compression for maximum crystal clear quality
              let compressedDataUrl = canvas.toDataURL('image/png');
              
              // If PNG is too large, fallback to maximum quality JPEG for crystal clear images
              if (compressedDataUrl.length > 20 * 1024 * 1024) { // Increased threshold to 20MB for maximum quality
                compressedDataUrl = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality JPEG for crystal clear images
              }
              
              resolve(compressedDataUrl);
            };
            img.src = imageDataUrl;
          });
        } catch (error) {
          console.warn('Image compression failed, using original:', error);
          return imageDataUrl;
        }
      };

      // Try to add uploaded image as first page
      const uploadedImageAdded = await addUploadedImageAsFirstPage();
      
      // If uploaded image was added, start new page for title
      if (uploadedImageAdded) {
        pdf.addPage();
        yPosition = 20;
      }

      // PAGE 1 (or 2 if uploaded image was added): TITLE AND OVERVIEW
      pdf.setFontSize(28);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('AURA & CHAKRA ALIGNMENT REPORT', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(16);
      pdf.setTextColor(80, 80, 80);
      const nameToUse = analysisName || result?.name || 'Unnamed Analysis';
      yPosition = addTextWithPageBreak(`Client: ${nameToUse}`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 8;
      yPosition = addTextWithPageBreak(`Report created by: ${user?.username || 'Anonymous User'}`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 8;
      yPosition = addTextWithPageBreak(`Analysis Date: ${new Date().toLocaleDateString()}`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 20;

      // Add decorative line
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition, pageWidth, yPosition);
      yPosition += 15;

      // SECTION 1: AURA COLOR ANALYSIS
      pdf.setFontSize(20);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('AURA COLOR ANALYSIS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.setTextColor(50, 50, 50);
      yPosition = addTextWithPageBreak(`Dominant Color: ${result.dominantColor}`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 8;
      if (result.secondaryColor) {
        yPosition = addTextWithPageBreak(`Secondary Color: ${result.secondaryColor}`, pageWidth/2, yPosition, { align: 'center' });
        yPosition += 8;
      }
      yPosition = addTextWithPageBreak(`Energy Level: ${result.energyLevel}/10`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 15;

      // ADD AURA VISUALIZATION IMAGE
      const auraImageForPDF = processedAuraImage || enhancedAuraImage;
      if (auraImageForPDF) {
        // Check if we need a new page for the image
        if (yPosition > pageHeight - 120) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(75, 0, 130);
        yPosition = addTextWithPageBreak('AURA VISUALIZATION', pageWidth/2, yPosition, { align: 'center' });
        yPosition += 10;

        try {
          // Create a new image to get actual dimensions
          const tempImg = new Image();
          await new Promise((resolve, reject) => {
            tempImg.onload = resolve;
            tempImg.onerror = reject;
            tempImg.src = auraImageForPDF;
          });
          
          // Calculate dimensions to match webapp display (larger, more prominent)
          const imgAspectRatio = tempImg.width / tempImg.height;
          const maxWidth = pageWidth - 20; // Use almost full page width with small margins
          const maxHeight = 120; // Reasonable height limit
          
          let imgWidth, imgHeight;
          if (imgAspectRatio > maxWidth / maxHeight) {
            // Image is wider, fit to page width
            imgWidth = maxWidth;
            imgHeight = imgWidth / imgAspectRatio;
          } else {
            // Image is taller, fit to height
            imgHeight = maxHeight;
            imgWidth = imgHeight * imgAspectRatio;
          }
          
          const imgX = (pageWidth - imgWidth) / 2; // Center the image
          
          pdf.addImage(auraImageForPDF, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;

          pdf.setFontSize(11);
          pdf.setTextColor(100, 100, 100);
          yPosition = addTextWithPageBreak('Your personalized aura visualization showing energy patterns and spiritual colors', pageWidth/2, yPosition, { align: 'center' });
          yPosition += 15;
        } catch (imageError) {
          console.error('Error adding aura visualization to PDF:', imageError);
          pdf.setFontSize(11);
          pdf.setTextColor(150, 150, 150);
          yPosition = addTextWithPageBreak('Aura visualization image could not be embedded in PDF', pageWidth/2, yPosition, { align: 'center' });
          yPosition += 10;
        }
      }

      // SECTION 3: ENERGY LEVEL ANALYSIS  
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('ENERGY LEVEL ANALYSIS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);
      yPosition = addTextWithPageBreak(`Overall Energy Level: ${result.energyLevel}/10`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 6;
      
      const energyDescription = result.energyLevel >= 8 ? 'Very High Energy - Vibrant and Active' :
                              result.energyLevel >= 6 ? 'High Energy - Strong and Focused' :
                              result.energyLevel >= 4 ? 'Moderate Energy - Balanced and Steady' :
                              'Low Energy - Calm and Gentle';
      
      yPosition = addTextWithPageBreak(`Energy Classification: ${energyDescription}`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      // SECTION 4: DETAILED COLOR MEANINGS
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('DETAILED COLOR MEANINGS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      // Dominant Color Analysis
      pdf.setFontSize(14);
      pdf.setTextColor(100, 0, 150);
      yPosition = addTextWithPageBreak(`Dominant Color - ${result.dominantColor}:`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const dominantMeaning = getColorMeaningForPDF(result.dominantColor);
      yPosition = addWrappedText(dominantMeaning, 20, yPosition, pageWidth - 40);
      yPosition += 10;

      // Secondary Color Analysis (if present)
      if (result.secondaryColor) {
        pdf.setFontSize(14);
        pdf.setTextColor(100, 0, 150);
        yPosition = addTextWithPageBreak(`Secondary Color - ${result.secondaryColor}:`, pageWidth/2, yPosition, { align: 'center' });
        yPosition += 8;
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 60);
        const secondaryMeaning = getColorMeaningForPDF(result.secondaryColor);
        yPosition = addWrappedText(secondaryMeaning, 20, yPosition, pageWidth - 40);
        yPosition += 10;
      }
      yPosition += 5;

      // SECTION 5: SPIRITUAL INSIGHTS & CHARACTERISTICS
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('SPIRITUAL INSIGHTS & CHARACTERISTICS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);
      
      // Color-based spiritual traits
      const spiritualTraits = result.personalityTraits || [
        `${result.dominantColor} energy promotes spiritual growth and awareness`,
        'Natural ability to sense energy fields and spiritual presence',
        'Strong intuitive connection to higher consciousness',
        'Balanced approach to spiritual and material worlds'
      ];
      spiritualTraits.forEach((trait: string) => {
        yPosition = addTextWithPageBreak(`• ${trait}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 15;

      // SECTION 6: COMPREHENSIVE ANALYSIS & RECOMMENDATIONS
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('COMPREHENSIVE ANALYSIS & RECOMMENDATIONS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const comprehensiveAnalysis = result.detailedAnalysis || "Your aura analysis reveals a complex spiritual profile with multiple energy layers that indicate your current life phase and growth opportunities.";
      yPosition = addWrappedText(comprehensiveAnalysis, 20, yPosition, pageWidth - 40);
      yPosition += 15;

      // SECTION 7: SPIRITUAL GUIDANCE
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('SPIRITUAL GUIDANCE', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const spiritualGuidance = result.spiritualGuidance || "Continue your spiritual journey with awareness and openness to the energies around you.";
      yPosition = addWrappedText(spiritualGuidance, 20, yPosition, pageWidth - 40);
      yPosition += 15;

      // SECTION 8: CHAKRA SYSTEM ANALYSIS
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('CHAKRA SYSTEM ANALYSIS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);
      
      if (result.chakraActivity) {
        const chakraNames = {
          soulStar: 'Soul Star Chakra',
          crown: 'Crown Chakra',
          thirdEye: 'Third Eye Chakra',
          throat: 'Throat Chakra',
          heart: 'Heart Chakra',
          solarPlexus: 'Solar Plexus Chakra',
          sacral: 'Sacral Chakra',
          root: 'Root Chakra',
          earthStar: 'Earth Star Chakra'
        };

        Object.entries(result.chakraActivity).forEach(([key, value]) => {
          const name = chakraNames[key as keyof typeof chakraNames] || key;
          const percentage = Math.round((value / 10) * 100);
          yPosition = addTextWithPageBreak(`${name}: ${value}/10 (${percentage}%)`, pageWidth/2, yPosition, { align: 'center' });
          yPosition += 6;
        });
      } else {
        yPosition = addWrappedText("Chakra analysis shows balanced energy flow across all seven main energy centers, supporting overall spiritual well-being.", 20, yPosition, pageWidth - 40);
      }
      yPosition += 15;

      // SECTION 8: CAPTURED TAB SCREENSHOTS (if any exist)
      if (capturedScreenshots.size > 0) {
        pdf.addPage();
        yPosition = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(75, 0, 130);
        yPosition = addTextWithPageBreak('CAPTURED ANALYSIS SCREENSHOTS', pageWidth/2, yPosition, { align: 'center' });
        yPosition += 15;
        
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 60);
        yPosition = addWrappedText('These screenshots were captured from different analysis tabs for your reference.', 20, yPosition, 170);
        yPosition += 10;
        
        // Add each captured screenshot with proper sizing and multi-page support
        for (const [tabId, imageDataUrl] of Array.from(capturedScreenshots.entries())) {
          
          try {
            // Create a temporary image to get exact dimensions
            const tempImg = new Image();
            tempImg.src = imageDataUrl;
            
            // Wait for image to load and get true dimensions
            await new Promise((resolve, reject) => {
              tempImg.onload = resolve;
              tempImg.onerror = reject;
            });
            
            const originalWidth = tempImg.naturalWidth;
            const originalHeight = tempImg.naturalHeight;
            const trueAspectRatio = originalHeight / originalWidth;
            
            // CRITICAL FIX: Maintain original aspect ratio without squishing
            const pageMaxWidth = 170; // Maximum usable page width (A4 page is 210mm, minus margins)
            const pageMaxHeight = 240; // Maximum usable page height per section (A4 page is 297mm, minus margins)
            
            // Calculate proper dimensions maintaining original aspect ratio
            let finalWidth = pageMaxWidth;
            let finalHeight = finalWidth * trueAspectRatio;
            
            // If height exceeds page, scale down proportionally
            if (finalHeight > pageMaxHeight) {
              finalHeight = pageMaxHeight;
              finalWidth = finalHeight / trueAspectRatio;
            }
            
            // If the image is very long (tall), we need to handle it differently
            // Force chakras tab to always use multi-section approach for 4-part breakdown
            const isLongScreenshot = trueAspectRatio > 3.0 || tabId === 'chakras'; // More than 3:1 ratio or chakras tab
            
            if (isLongScreenshot) {
              // Special handling for chakras tab - force exactly 4 sections
              let sectionsNeeded;
              if (tabId === 'chakras') {
                sectionsNeeded = 4; // Force exactly 4 sections for chakras
              } else {
                sectionsNeeded = Math.ceil(trueAspectRatio / 3.0); // One section per 3:1 ratio for other tabs
              }
              const sectionHeight = pageMaxHeight;
              
              console.log(`Screenshot ${tabId}: Long image detected. Original ${originalWidth}x${originalHeight}, splitting into ${sectionsNeeded} sections`);
              
              // Split the image into multiple sections
              for (let section = 0; section < sectionsNeeded; section++) {
                // Start a new page for each section after the first
                if (section > 0 || yPosition > 40) {
                  pdf.addPage();
                  yPosition = 20;
                }
                
                // Calculate the portion of the image for this section
                const sectionStartY = (section * originalHeight) / sectionsNeeded;
                const sectionEndY = Math.min(((section + 1) * originalHeight) / sectionsNeeded, originalHeight);
                const sectionImageHeight = sectionEndY - sectionStartY;
                
                // Create a canvas to extract this section
                const sectionCanvas = document.createElement('canvas');
                const sectionCtx = sectionCanvas.getContext('2d');
                sectionCanvas.width = originalWidth;
                sectionCanvas.height = sectionImageHeight;
                
                // Draw the section of the image
                sectionCtx!.drawImage(tempImg, 0, -sectionStartY);
                
                const sectionDataUrl = sectionCanvas.toDataURL('image/png'); // Maximum quality for crystal clear sections
                const sectionAspectRatio = sectionImageHeight / originalWidth;
                
                // Calculate final dimensions for this section
                let sectionFinalWidth = finalWidth;
                let sectionFinalHeight = sectionFinalWidth * sectionAspectRatio;
                
                // If this section is still too tall, fit to height
                if (sectionFinalHeight > sectionHeight) {
                  sectionFinalHeight = sectionHeight;
                  sectionFinalWidth = sectionFinalHeight / sectionAspectRatio;
                }
                
                // Special size enhancement for all tabs to make screenshots more legible
                if (tabId === 'chakras') {
                  sectionFinalWidth = sectionFinalWidth * 3.0; // Triple the size for better visibility
                  sectionFinalHeight = sectionFinalHeight * 3.0; // Triple the size for better visibility
                } else if (tabId === 'guidance') {
                  sectionFinalWidth = sectionFinalWidth * 2.0; // Double the size for better visibility  
                  sectionFinalHeight = sectionFinalHeight * 2.0; // Double the size for better visibility
                } else {
                  // Increase all other tabs by 1.5x for better legibility
                  sectionFinalWidth = sectionFinalWidth * 1.5; // 50% larger for better legibility
                  sectionFinalHeight = sectionFinalHeight * 1.5; // 50% larger for better legibility
                }
                
                // Section titles removed for continuous image flow as requested
                
                // Compress and add the section
                const compressedSectionDataUrl = await compressImageForPDF(sectionDataUrl, sectionFinalWidth, sectionFinalHeight);
                pdf.addImage(compressedSectionDataUrl, 'JPEG', 20, yPosition, sectionFinalWidth, sectionFinalHeight);
                yPosition += sectionFinalHeight + 10;
                
                console.log(`Screenshot ${tabId} section ${section + 1}/${sectionsNeeded}: PDF ${sectionFinalWidth.toFixed(1)}x${sectionFinalHeight.toFixed(1)}`);
              }
              
            } else {
              // For normal screenshots, use single page with proper aspect ratio - already calculated above
              // Ensure minimum readability while respecting page constraints
              const minWidth = 120;
              const minHeight = 160;
              
              // Only increase size if we have room and it improves readability
              if (finalWidth < minWidth && (minWidth * trueAspectRatio) <= pageMaxHeight) {
                finalWidth = minWidth;
                finalHeight = minWidth * trueAspectRatio;
              }
              
              // Final check: ensure we don't exceed page boundaries
              if (finalWidth > pageMaxWidth) {
                finalWidth = pageMaxWidth;
                finalHeight = finalWidth * trueAspectRatio;
              }
              
              if (finalHeight > pageMaxHeight) {
                finalHeight = pageMaxHeight;
                finalWidth = finalHeight / trueAspectRatio;
              }
              
              // Special size enhancement for all tabs single screenshots for better legibility
              if (tabId === 'guidance') {
                finalWidth = finalWidth * 2.0; // Double the size for better visibility
                finalHeight = finalHeight * 2.0; // Double the size for better visibility
              } else {
                // Increase all other tabs by 1.5x for better legibility
                finalWidth = finalWidth * 1.5; // 50% larger for better legibility
                finalHeight = finalHeight * 1.5; // 50% larger for better legibility
              }
              
              console.log(`Screenshot ${tabId}: original ${originalWidth}x${originalHeight}, PDF ${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}, ratio: ${trueAspectRatio.toFixed(3)}`);
              
              // Check if screenshot would exceed page height
              if (yPosition + finalHeight > pageHeight - 40) {
                pdf.addPage();
                yPosition = 20;
              }
              
              // Compress the image data before adding to PDF to prevent memory issues
              const compressedImageDataUrl = await compressImageForPDF(imageDataUrl, finalWidth, finalHeight);
              
              // Add the screenshot with preserved aspect ratio
              pdf.addImage(compressedImageDataUrl, 'JPEG', 20, yPosition, finalWidth, finalHeight);
              yPosition += finalHeight + 15;
            }
            
            console.log(`Screenshot ${tabId} added to PDF with preserved dimensions and readability`);
            
          } catch (error) {
            console.error('Error adding screenshot image:', error);
            yPosition += 25;
          }
        }
      }

      // SECTION 9: FINAL SUMMARY AND RECOMMENDATIONS
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('FINAL SUMMARY & RECOMMENDATIONS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const finalSummary = `Your aura analysis reveals a ${result.dominantColor.toLowerCase()} dominant energy with an energy level of ${result.energyLevel}/10. This indicates a ${result.energyLevel >= 7 ? 'highly active' : result.energyLevel >= 5 ? 'balanced' : 'gentle'} spiritual presence. Continue developing your spiritual awareness through meditation, energy work, and conscious living practices. Your unique energy signature offers valuable gifts to the world - embrace your authentic spiritual self and share your light with others.`;
      yPosition = addWrappedText(finalSummary, 20, yPosition, pageWidth - 40);
      yPosition += 15;

      // PROFESSIONAL HEALER NOTES SECTION
      if (healerNotes && healerNotes.trim() && isHealer) {
        // Add new page if needed
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        yPosition = addTextWithPageBreak('PROFESSIONAL HEALER NOTES', pageWidth/2, yPosition, { align: 'center' });
        yPosition += 20;

        // Add styled box background for notes
        pdf.setFillColor(255, 255, 255); // Light yellow background
        pdf.rect(15, yPosition - 5, pageWidth - 30, 50, 'F'); // Filled rectangle
        pdf.setDrawColor(255, 255, 255); // Golden border
        pdf.setLineWidth(1);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 50, 'S'); // Stroked rectangle

        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        yPosition = addWrappedText(healerNotes.trim(), 20, yPosition + 5, pageWidth - 40);
        yPosition += 60;

        // Add healer attribution
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        yPosition = addTextWithPageBreak(`Professional insights provided by: ${user?.username || 'Certified Healer'}`, 20, yPosition);
        yPosition += 15;
      }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated by AuraEye - Spiritual Wellness Platform | ${new Date().toLocaleDateString()}`, pageWidth/2, pageHeight - 10, { align: 'center' });

      // Download the PDF with proper error handling
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `aura-chakra-analysis-${nameToUse.replace(/[^a-zA-Z0-9]/g, '-')}-${currentDate}.pdf`;
        console.log('Attempting to save PDF:', fileName);
        pdf.save(fileName);
        console.log('PDF save operation completed successfully');
      } catch (saveError) {
        console.error('Error during PDF save:', saveError);
        throw new Error(`PDF save failed: ${saveError}`);
      }

      toast({
        title: "PDF Downloaded Successfully",
        description: "Your comprehensive aura analysis report has been downloaded with all sections and analysis data.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('PDF Error details:', errorMessage);
      console.error('PDF Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "PDF Generation Failed",
        description: `Failed to generate comprehensive PDF: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  function getPersonalityColorInterpretation(color: string): string {
        const personalityInterpretations: Record<string, string> = {
            'Red': 'Highly energized, action-focused, experiencing dynamic transformation. Your core essence pulses with primal life force and determination. You approach life with passion, courage, and a strong survival instinct. This indicates a powerful connection to earth energy and physical vitality.',
            'Orange': 'Your personality radiates creativity, joy, and emotional expressiveness. You have a natural ability to inspire others and bring enthusiasm to any situation. This suggests strong creative abilities and emotional intelligence.',
            'Yellow': 'Your mental energy shines bright with intelligence, optimism, and personal power. You naturally take leadership roles and approach challenges with confidence and analytical thinking.',
            'Green': 'Your heart-centered nature embodies healing, compassion, and natural wisdom. You have an innate ability to nurture others and create harmony in your environment.',
            'Blue': 'Your essence flows with truth, communication, and peaceful wisdom. You naturally express authenticity and help others find their voice through your calming presence.',
            'Indigo': 'Your intuitive nature connects deeply to spiritual wisdom and psychic insight. You have natural abilities to see beyond the physical realm and understand deeper truths.',
            'Violet': 'Your spiritual essence connects to divine consciousness and transformative energy. You naturally channel higher wisdom and help others in their spiritual development.',
            'Gold': 'Your enlightened nature embodies divine wisdom and spiritual mastery. You carry ancient knowledge and naturally inspire others toward their highest potential.',
            'Silver': 'Your psychic sensitivity attunes to lunar wisdom and emotional depths. You have natural healing abilities and deep empathy for others\' experiences.',
            'White': 'Your pure essence embodies divine light and spiritual protection. You naturally channel healing energy and provide spiritual clarity to others.',
            'Black': 'Your depth indicates powerful transformation and shadow integration. You have the ability to help others through difficult transitions and deep healing work.',
            'Brown': 'Your grounded nature provides stability, practicality, and earth wisdom. You naturally create security and help others feel stable and supported.'
        };
        return personalityInterpretations[color] || `Your ${color.toLowerCase()} personality energy reflects unique spiritual qualities that guide your life path and personal development.`;
    }

  function getColorSpiritalMeaning(color: string): string {
        const spiritualMeanings: Record<string, string> = {
            'Red': 'Represents life force, grounding, passion, and physical vitality. Connected to survival instincts and material world mastery.',
            'Orange': 'Embodies creativity, emotional expression, joy, and sexual energy. Associated with artistic abilities and emotional intelligence.',
            'Yellow': 'Symbolizes mental clarity, personal power, confidence, and intellectual abilities. Connected to leadership and analytical thinking.',
            'Green': 'Represents healing, compassion, heart-centered wisdom, and natural harmony. Associated with nurturing and emotional balance.',
            'Blue': 'Embodies truth, communication, peace, and authentic expression. Connected to clarity of thought and peaceful wisdom.',
            'Indigo': 'Represents intuition, psychic abilities, spiritual insight, and deep knowing. Associated with seeing beyond the physical realm.',
            'Violet': 'Symbolizes spiritual connection, divine consciousness, and transformation. Connected to higher wisdom and spiritual development.',
            'Gold': 'Represents enlightenment, divine wisdom, spiritual mastery, and cosmic consciousness. Associated with ancient knowledge and spiritual teaching.',
            'Silver': 'Embodies psychic sensitivity, lunar wisdom, and emotional depths. Connected to healing abilities and empathic understanding.',
            'White': 'Represents purity, divine light, spiritual protection, and cosmic consciousness. Associated with healing energy and spiritual clarity.',
            'Black': 'Symbolizes transformation, shadow integration, and deep healing work. Connected to helping others through difficult transitions.',
            'Brown': 'Represents grounding, stability, earth wisdom, and practical guidance. Associated with creating security and foundational support.'
        };
        return spiritualMeanings[color] || `${color} energy carries unique spiritual vibrations that contribute to your overall energetic signature and spiritual development.`;
    }

  const getGivingEnergyInterpretation = (color: string): string => {
    const givingInterpretations: Record<string, string> = {
      'Red': 'Actively working hard, expressing passion or dealing with anger. When balanced, you feel grounded and responsible. When imbalanced, you may have suppressed anger, burnout, aggressive behavior, or hyper-competitiveness.',
      'Yellow': 'Intelligent, optimistic, joyful, confident, creative, constantly learning new things. When balanced, you feel challenged to lead or perform. When imbalanced, you may struggle with overconfidence, fear mental challenges, or have self-worth issues.',
      'Blue': 'Clear communication, honest expression, authenticity, speaking truth with peace. When balanced, you receive kindness and emotional requests from others. When imbalanced, you may have difficulty expressing authentic truth, fear confrontation, or avoid honest conversations.',
      'Green': 'Compassionate, healer energy, emotionally balanced and nurturing. When balanced, you give healing and receive appreciation or emotional guidance. When imbalanced, you may experience overwhelming energy depletion or put others before self harmfully.',
      'Violet': 'Highly spiritual, visionary, deeply connected to purpose and divine calling. When balanced, you attract spiritual guidance and feel supported by environment. When imbalanced, you may feel disconnected from higher self, confused about life purpose, or engage in spiritual bypassing.',
      'Indigo': 'Strong intuitive abilities, psychic insight, deep inner knowing and truth-seeking. When balanced, you channel divine energy into action and feel guided. When imbalanced, you may experience overstimulation by inner visions, escapism, or fear of trusting intuition.',
      'Purple': 'Mystical wisdom and spiritual mastery. When balanced, you channel ancient wisdom and spiritual knowledge. When imbalanced, you may become overly mystical or disconnected from practical reality.',
      'Gold': 'Divine connection, enlightened, awakened soul, cosmic consciousness, spiritual mastery. When balanced, you are recognized as powerful or influential. When imbalanced, you may be over-idealistic, have difficulty with material world, or feel energetically scattered.',
      'Silver': 'Psychic, channeling divine wisdom, sensitive to spiritual realms, graceful soul. When balanced, you are surrounded by spiritually activated people. When imbalanced, you may feel energetically overloaded, ungrounded, or have difficulty being in the body.',
      'Orange': 'Creative, joyful, playful, sexually alive, loves experimenting with pleasure and life. When balanced, you increase ability to influence others. When imbalanced, you may experience restlessness, overindulgence, scattered energy, or addiction to stimulation.',
      'Pink': 'Loving, emotionally open, romantic, using beauty and art affectionately. When balanced, you feel pressure to connect and challenge yourself. When imbalanced, you may over-nurture, become overly dependent, or fear rejection and abandonment.',
      'White': 'Pure, pure light, pure consciousness, pure energy, pure love. When balanced, you are recognized as pure and protected. When imbalanced, you may feel disconnected from earth, have difficulty with material world, or feel spiritually',
      'Black': 'You may be giving from a space of obligation, fear of rejection, or energetic depletion. This suggests overgiving or empathic burnout—where your actions support others but drain your own vitality..'
    };
    return givingInterpretations[color] || `Giving Zone ${color} - You give unique ${color.toLowerCase()} energy that flows outward to support and uplift others through your natural spiritual gifts and energetic offerings.`;
  };

  const getReceivingEnergyInterpretation = (color: string): string => {
    const receivingInterpretations: Record<string, string> = {
      'Black': 'Receiving Zone Black - You may be unconsciously absorbing unresolved emotions, psychic debris, or ancestral burdens from others or your environment.You tend to take in energy that doesnt belong to you, especially from close relationships. This creates emotional heaviness and energetic fatigue.',
      'White': 'Receiving Zone White - You receive divine protection and pure spiritual energy, attracting sacred blessings that provide spiritual protection.',
      'Brown': 'Receiving Zone Brown - Receiving grounding or responsibilities from others. You receive practical grounding and earthly wisdom, attracting stability and natural stability support.',
      'Red': 'Receiving urgent energy, competition or stress from environment.',
      'Yellow': 'Actively exploring creativity, finding your voice and authentic expression. You manifest consistent change and meaningful creative self-transformation.',
      'Blue': 'Receiving kindness, appreciation or emotional requests from others. You have healer presence with calm and heart-centered frequency, giving others openness and genuine presence, generous attention.',
      'Green': 'Recieving healing, nurturing others, or working in service roles. You have healer presence with calm and heart-centered frequency, giving others presence and attention through compassionate service.',
      'Violet': 'Channeling divine energy into action, using intuition to lead. You receive divine guidance and cosmic consciousness, currently experiencing inner conviction, deep inner purpose, and wise compassion.',
      'Indigo': 'Feeling pressure to succeed, being challenged to lead or perform. You are focused on achieving, leading, or being best at capable things while navigating challenges and growth opportunities.',
      'Purple': 'Receiving Zone Purple - You receive mystical wisdom and transformative energy, attracting magical experiences and ancient knowledge that initiate spiritual evolution.',
      'Gold': 'Receiving Zone Gold - You receive enlightened wisdom and spiritual mastery from master teachers and divine sources.',
      'Silver': 'Receiving Zone Silver - You receive lunar wisdom and psychic sensitivity, attracting intuitive insights that enhance psychic abilities.',
      'Orange': ' Recieveing practical steps, helping others or organizing life. You move quickly into manifestation energy, wise, nurturing and structured. Mystic presence, sensitive and responsive, grounded guidance.',
      'Pink': 'Taking leadership action, pushing forward with confidence. You are a radiant, confident, strong-willed individual in active growth with joyful and magnetic energy, radiating enthusiasm for life.',
    };
    return receivingInterpretations[color] || `Receiving Zone ${color} - You receive unique ${color.toLowerCase()} energy from your environment that nourishes and supports your spiritual growth through cosmic alignment.`;
  };

  const getThinkingEnergyInterpretation = (color: string): string => {
    const thinkingInterpretations: Record<string, string> = {
      'Red': 'Thinking Zone Red - Thinking about taking action, reacting to pressure, or inner drive.',
      'Orange': 'Thinking Zone Orange - Channeling energy, guiding others, or practicing intuition, thinking about creativity, sexuality, relationships or passion. Your thought patterns flow with creative energy and relationship wisdom, generating passionate solutions.',
      'Yellow': 'Thinking Zone Yellow - Taking leadership action, pushing forward with confidence, actively processing problems, taking charge or being assertive. Your mental processes shine with leadership clarity and confident problem-solving through assertive thinking.',
      'Green': 'Thinking Zone Green - Giving healing, nurturing others, or working in service roles, thinking about how to help others, nurturing, guiding or teaching. Your mental energy flows through healing wisdom and nurturing insight, generating compassionate service solutions.',
      'Pink': 'Thinking Zone Pink - Experiencing gratitude, thinking about love, emotional healing, relationships, compassion or spiritual healing. Your thinking patterns flow through love-centered wisdom, creating heart-healing thoughts and emotional solutions.',
      'Blue': 'Thinking Zone Blue - Taking practical steps, helping others or organizing life, organizing energy, guiding others, or practicing intuition. Your mental processes focus on practical organization and intuitive guidance through structured thinking.',
      'Indigo': 'Thinking Zone Indigo - Taking practical steps, helping others or organizing life, organizing energy, guiding others, or practicing intuition. Your mental processes operate through psychic organization and spiritual guidance, blending intuition with practical wisdom.',
      'Violet': 'Thinking Zone Violet - Spiritual downloads, deep inner wisdom, connection to divine truth, deep meditation or receiving cosmic information. Your thought patterns connect to divine downloads and cosmic consciousness, accessing spiritual enlightenment through meditation.',
      'Brown': 'Thinking Zone Brown - Grounded mindset, focused on stability, and practical matters, receiving higher guidance, sensitive to unseen messages. Your mental energy channels practical grounding and earthly wisdom through stable, focused thinking.',
      'Silver': 'Thinking Zone Silver - Receiving higher guidance, sensitive to unseen messages, tuning into spiritual information or higher dimensional wisdom. Your mental processes flow through higher guidance and psychic sensitivity, receiving dimensional wisdom.',
      'Gold': 'Thinking Zone Gold - Divine thoughts, wisdom, teaching, spiritual mastery, receiving higher information or angelic frequencies. Your thought patterns access divine wisdom and spiritual mastery, channeling higher information and angelic guidance.',
      'White': 'Thinking Zone White - Spiritual purity, thinking of higher dimensions of purity, learning to protect energy and feel safe in the physical world. Your mental processes channel pure spiritual wisdom, focusing on energetic protection and dimensional purity.',
      'Purple': 'Thinking Zone Purple - Your mental energy channels mystical understanding and ancient wisdom, generating transformative thoughts through magical thinking and spiritual alchemy.',
      'Peach': 'Thinking Zone Peach - Your mental energy channels nurturing love and emotional support, generating compassionate healing through gentle thinking.',
      'Grey': 'Thinking Zone Grey - Your mental requires channeling balanced wisdom and neutral authority, generating peaceful resolution through adaptable thinking.',
      'Black': 'Thinking Zone Black - Your thoughts may be clouded by fear, overthinking, or limiting beliefs rooted in past trauma. This indicates a mental fog or energetic block in accessing higher clarity. You may feel disconnected from your intuitive wisdom'
      
    };
    return thinkingInterpretations[color] || `Thinking Zone ${color} - Your mental processes channel unique ${color.toLowerCase()} energy that creates distinctive thought patterns and cognitive approaches to life.`;
  };

  const getOverallEnergyInterpretation = (color: string): string => {
    const overallInterpretations: Record<string, string> = {
      'Red': 'Master healer energy, a teacher and guide on a mission. Spiritually elevated being, sensitive and light-filled energy field.',
      'Orange': 'Mystic presence, sensitive and responsive, grounded guidance. Deeply rooted energy, wise, nurturing and structured.',
      'Yellow': 'Radiant, confident, strong-willed individual in active growth. Joyful and magnetic energy, radiating enthusiasm for life.',
      'Green': 'Healer presence with calm and heart-centered frequency, giving others presence and attention, generously open and genuine presence.',
      'Pink': 'Radiant, confident, strong-willed individual in active growth. Joyful and magnetic energy, radiating enthusiasm for life.',
      'Blue': 'Healer presence with calm and heart-centered frequency, giving others openness, presence and generous attention. Learning to protect energy and feel safe in the physical world.',
      'Indigo': 'Currently in a projection of deep inner purpose, wise compassion. Difficulty balancing spiritual connection with everyday life, trusting one\'s psychic abilities and living from intuition.',
      'Violet': 'Highly spiritual phase, embodying divine purpose and deep alignment. Currently learning inner conviction, deep inner purpose, wise compassion.',
      'Brown': 'Overall Brown Energy - Bringing movement into life while staying rooted, grounding spiritual gifts with practical living. Maintaining earth connection while developing spiritual presence and practical wisdom integration.',
      'Silver': 'Overall Silver Energy - Learning to protect energy and feel safe in the physical world, enhanced intuitive abilities with emotional wisdom. Developing psychic protection while maintaining lunar sensitivity and emotional clarity.',
      'Gold': 'Overall Gold Energy - Spiritually elevated being, sensitive and light-filled energy field, master teacher energy with ancient wisdom. Living with enlightened consciousness while maintaining spiritual authority and divine wisdom integration.',
      'White': 'Overall White Energy - Learning to protect energy and feel safe in the physical world, spiritually elevated being with pure divine connection. Developing energetic boundaries while maintaining spiritual purity and divine alignment.',
      'Purple': 'Overall Purple Energy - Your core energy channels mystical transformation and ancient wisdom, manifesting magical experiences through spiritual alchemy and transformative life initiations.',
      'Black': 'You are carrying unresolved karmic patterns from past lifetimes or ancestral lines that are now seeking healing.This isn’t a punishment—it’s a sacred invitation to transmute shadow into light. You’re in a cycle of karmic cleansing, and by facing this darkness with love, you activate powerful spiritual breakthroughs and clear your soul path forward. love and emotional support, manifesting compassionate healing through gentle emotional wisdom and heart-centered living.'
      
    };
    return overallInterpretations[color] || `Overall ${color} Energy - Your fundamental life force carries unique ${color.toLowerCase()} vibration that shapes your spiritual path and life experiences through distinctive energetic resonance.`;
  };

  // Helper functions for the 4-zone aura visualization
  const getReceivingEnergyColor = (auraData: AuraAnalysisResult): string => {
    // Left side - How person receives energy from environment
    // This is dynamic and changes based on environmental interactions
    const receivingEnergyMap: Record<string, string> = {
      'Red': 'Blue',        // Fire receives from water/air elements
      'Orange': 'Green',    // Creative energy receives from nature
      'Yellow': 'Purple',   // Mental energy receives from spiritual realm
      'Green': 'Pink',      // Heart energy receives through love
      'Blue': 'Gold',       // Communication receives divine guidance
      'Indigo': 'Silver',   // Intuition receives cosmic wisdom
      'Violet': 'White',    // Spiritual crown receives pure light
      'Gold': 'Blue',       // Divine wisdom receives through truth
      'Silver': 'Indigo',   // Soul connection receives through intuition
      'White': 'Violet',    // Pure energy receives through spirituality
      'Brown': 'Yellow',    // Earth energy receives through mental clarity
      'Black': 'White'      // Shadow receives through light
    };
    return receivingEnergyMap[auraData.dominantColor] || auraData.secondaryColor || 'Blue';
  }

  const getGivingEnergyColor = (auraData: AuraAnalysisResult): string => {
    // Right side - How person gives energy and creates life patterns
    // This is dynamic and shows their active contribution to the world
    const givingEnergyMap: Record<string, string> = {
      'Red': 'Orange',      // Passionate energy gives through creativity
      'Orange': 'Yellow',   // Creative energy gives through mental stimulation
      'Yellow': 'Green',    // Mental energy gives through healing wisdom
      'Green': 'Blue',      // Healing energy gives through truth
      'Blue': 'Violet',     // Truth gives through spiritual insight
      'Indigo': 'Blue',     // Intuition gives through clear communication
      'Violet': 'Gold',     // Spiritual energy gives through divine wisdom
      'Gold': 'Yellow',     // Divine wisdom gives through grounded spirituality
      'Silver': 'White',    // Soul energy gives through pure light
      'White': 'Silver',    // Pure light gives through soul connection
      'Brown': 'Orange',    // Earth energy gives through creativity
      'Black': 'Red'        // Shadow gives through passion
    };
    return givingEnergyMap[auraData.dominantColor] || auraData.dominantColor;
  }

  const getPersonalityColor = (auraData: AuraAnalysisResult): string => {
    // Overall static background - Core personality and why things happen to them
    // This represents their fundamental nature and karmic patterns
    const personalityMap: Record<string, string> = {
      'Red': 'Maroon',      // Deep passionate nature, attracts intense experiences
      'Orange': 'Coral',    // Warm creative soul, attracts artistic opportunities
      'Yellow': 'Gold',     // Wise mental nature, attracts learning experiences
      'Green': 'Emerald',   // Pure healing heart, attracts those needing healing
      'Blue': 'Navy',       // Deep truth seeker, attracts authentic connections
      'Indigo': 'Midnight', // Profound intuitive nature, attracts mystical experiences
      'Violet': 'Lavender', // Gentle spiritual essence, attracts peaceful environments
      'Purple': 'Plum',     // Rich mystic soul, attracts transformational events
      'Pink': 'Rose',       // Loving compassionate heart, attracts relationships
      'Gold': 'Bronze',     // Ancient wisdom keeper, attracts teaching opportunities
      'Silver': 'Platinum', // Refined soul energy, attracts elevated circumstances
      'White': 'Pearl',     // Pure light being, attracts clarity and truth
      'Turquoise': 'Teal',  // Balanced healer-communicator, attracts harmony
      'Magenta': 'Fuchsia'  // Dynamic transformer, attracts change and growth
    };
    return personalityMap[auraData.dominantColor] || auraData.dominantColor;
  };

  // Helper functions for Energy Reading tab

  const calculateGivingEnergy = (aura: AuraAnalysisResult): number => {
    const givingEnergyMap: Record<string, number> = {
      'Red': 78, 'Orange': 82, 'Yellow': 75, 'Green': 71,
      'Blue': 68, 'Indigo': 64, 'Violet': 61, 'Purple': 67,
      'Pink': 74, 'White': 85, 'Gold': 88, 'Silver': 66, 'Black': 55, 'Brown': 70
    };
    const base = givingEnergyMap[aura.dominantColor] || 72;
    const variation = Math.sin(aura.energyLevel * 0.1) * 8; // Creates natural variation
    const calculated = base + variation + (aura.energyLevel - 50) * 0.3;
    return Math.max(25, Math.min(88, Math.round(calculated)));
  };

  const calculateReceivingEnergy = (aura: AuraAnalysisResult): number => {
    const receivingEnergyMap: Record<string, number> = {
      'Red': 42, 'Orange': 58, 'Yellow': 54, 'Green': 83,
      'Blue': 79, 'Indigo': 86, 'Violet': 88, 'Purple': 81,
      'Pink': 77, 'White': 85, 'Gold': 65, 'Silver': 87, 'Black': 50, 'brown': 70
    };
    const base = receivingEnergyMap[aura.dominantColor] || 70;
    const variation = Math.cos(aura.energyLevel * 0.15) * 6; // Different variation pattern than giving
    const calculated = base + variation + (aura.energyLevel - 45) * 0.4;
    return Math.max(28, Math.min(88, Math.round(calculated)));
  };

  const getGivingEnergyDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Strong radiator';
    if (percentage >= 60) return 'Balanced giver';
    if (percentage >= 40) return 'Selective sharing';
    return 'Energy conserving';
  };

  const getReceivingEnergyDescription = (percentage: number): string => {
    if (percentage >= 800) return 'Highly receptive';
    if (percentage >= 600) return 'Balanced receiver';
    if (percentage >= 400) return 'Selective absorber';
    return 'Energy filtering';
  };

  function getChakraColor({ chakra }: { chakra: string; }): string {
        const chakraColors: Record<string, string> = {
            'root': 'bg-red-500',
            'sacral': 'bg-orange-500',
            'solarPlexus': 'bg-yellow-500',
            'heart': 'bg-green-500',
            'throat': 'bg-blue-500',
            'thirdEye': 'bg-indigo-500',
            'crown': 'bg-purple-500',
            'soulStar': 'bg-pink-500',
            'earthStar': 'bg-brown-500'
        };
        return chakraColors[chakra] || 'bg-gray-400';
    }

  const calculateEarthStarChakra = (aura: AuraAnalysisResult): number => {
    // Earth Star Chakra (Number 4) - Brown/Earth colors, grounding energy
    const baseValue = aura.energyLevel * 8;
    const colorModifier = ['Brown', 'Black', 'Gray', 'Maroon'].includes(aura.dominantColor) ? 15 : 0;
    return Math.min(100, baseValue + colorModifier);
  };

  const calculateSoulStarChakra = (aura: AuraAnalysisResult): number => {
    // Soul Star Chakra (Number 7) - White/Silver colors, divine connection
    const baseValue = aura.energyLevel * 7;
    const colorModifier = ['White', 'Silver', 'Gold', 'Violet'].includes(aura.dominantColor) ? 20 : 0;
    return Math.min(100, baseValue + colorModifier);
  };

  const calculateAuraStrength = (aura: AuraAnalysisResult): number => {
    return Math.min(95, Math.max(5, (aura.energyLevel * 7) + 15));
  };

  const calculateVulnerability = (aura: AuraAnalysisResult): number => {
    // Vulnerability is always the inverse of aura strength to ensure they sum to 100
    const strength = calculateAuraStrength(aura);
    return 100 - strength;
  };

  const calculateEnergyBalance = (aura: AuraAnalysisResult): number => {
    const giving = calculateGivingEnergy(aura);
    const receiving = calculateReceivingEnergy(aura);
    const balance = 70 - Math.abs(giving - receiving);
    return Math.max(30, balance);
  };

  const getStrengthDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Powerful aura';
    if (percentage >= 60) return 'Strong presence';
    if (percentage >= 40) return 'Developing strength';
    return 'Gentle energy';
  };

  const getVulnerabilityDescription = (percentage: number): string => {
    if (percentage >= 70) return 'Highly sensitive';
    if (percentage >= 50) return 'Moderately open';
    if (percentage >= 30) return 'Well protected';
    return 'Strong boundaries';
  };



  const getBalanceDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Harmonious flow';
    if (percentage >= 60) return 'Good balance';
    if (percentage >= 40) return 'Adjusting flow';
    return 'Seeking balance';
  };

  const getEnergyLevelDescription = (level: number): string => {
    if (level >= 8) return 'Vibrant energy';
    if (level >= 6) return 'Active energy';
    if (level >= 4) return 'Steady energy';
    return 'Calm energy';
  };

  const getMorningEnergyInfluence = (dominant: string, secondary: string): string => {
    const morningInfluences: Record<string, string> = {
      'Red': 'Your red energy ignites your morning with passionate drive and determination.',
      'Orange': 'Orange energy brings creative enthusiasm and social warmth to your mornings.',
      'Yellow': 'Yellow energy illuminates your mind with clarity and optimistic thinking.',
      'Green': 'Green energy grounds you with natural balance and healing intentions.',
      'Blue': 'Blue energy flows through you with peaceful communication and truth.',
      'Indigo': 'Indigo energy opens your intuitive channels for insightful mornings.',
      'Violet': 'Violet energy connects you to higher consciousness and spiritual awareness.',
      'Purple': 'Purple energy transforms your morning with mystical understanding.',
      'Pink': 'Pink energy radiates love and emotional healing throughout your morning.',
      'White': 'White energy purifies your morning with divine protection and clarity.',
      'Gold': 'Gold energy empowers your morning with wisdom and spiritual authority.',
      'Silver': 'Silver energy reflects intuitive insights and lunar wisdom in your morning.',
        'Grey': 'Grey energy brings balanced wisdom and adaptable thinking to your mornings.',
        'Black': 'Black energy initiates transformative work and deep inner healing.',
        'Brown': 'Brown energy grounds you with practical wisdom and earth connection.'
      
    };
    return morningInfluences[dominant] || `${dominant} energy brings unique morning vibrations that awaken your spiritual essence and prepare your consciousness for the day's divine purpose.`;
  };

  const getPeakEnergyHours = (dominant: string): string => {
    const peakHours: Record<string, string> = {
      'Red': 'Your energy peaks during mid-morning (9-11am) when action-oriented tasks flow naturally.',
      'Orange': 'Peak energy flows in late morning to early afternoon (11am-2pm) for creative pursuits.',
      'Yellow': 'Mental energy peaks during late morning (10am-12pm) for learning and communication.',
      'Green': 'Balanced energy maintains consistency throughout the day with gentle peaks at sunrise and sunset.',
      'Blue': 'Communication energy peaks in afternoon (2-4pm) when truth and clarity are strongest.',
      'Indigo': 'Intuitive energy peaks during twilight hours (6-8pm) for deep insights.',
      'Violet': 'Spiritual energy peaks in early evening (7-9pm) for meditation and connection.',
      'Purple': 'Mystical energy peaks during late evening (8-10pm) for transformation work.',
      'Pink': 'Heart energy maintains steady flow with peaks during mid-afternoon (1-3pm).',
      'White': 'Divine energy flows consistently with peaks during dawn and dusk prayers.',
      'Gold': 'Wisdom energy peaks during afternoon (3-5pm) for important decisions.',
      'Silver': 'Reflective energy peaks during moonlit hours for intuitive guidance.',
      'Grey': 'Balanced energy maintains consistency throughout the day with gentle peaks at sunrise and sunset.',
      'Black': 'Shadow energy peaks during late evening (8-10pm) for transformative work.',
      'Brown': 'Grounding energy peaks during mid-morning (9-11am) and late evening (6-8pm).',
      
    };
    return peakHours[dominant] || `${dominant} energy reaches its highest vibration during specific hours when cosmic frequencies align with your personal spiritual resonance.`;
  };

  const getEveningEnergyGuidance = (dominant: string): string => {
    const eveningGuidance: Record<string, string> = {
      'Red': 'Red energy in evening calls for physical release through exercise or passionate activities.',
      'Orange': 'Orange energy encourages creative expression and social connection in evening hours.',
      'Yellow': 'Yellow energy suggests evening journaling or learning to process the days insights.',
      'Green': 'Green energy invites evening nature connection and gentle healing practices.',
      'Blue': 'Blue energy flows into evening meditation and truthful communication with loved ones.',
      'Indigo': 'Indigo energy opens evening hours for psychic development and intuitive practices.',
      'Violet': 'Violet energy elevates evening into spiritual study and consciousness expansion.',
      'Purple': 'Purple energy transforms evening into mystical exploration and magical practices.',
      'Pink': 'Pink energy wraps evening in love meditation and emotional healing rituals.',
      'White': 'White energy purifies evening with prayer, blessing, and divine connection.',
      'Gold': 'Gold energy illuminates evening with wisdom sharing and spiritual teaching.',
      'Silver': 'Silver energy reflects evening into lunar meditation and dream preparation.',
      'Grey': 'Grey energy brings balanced wisdom and adaptable thinking to evening hours.',
      'Black': 'Black energy initiates evening transformative work and deep inner healing.',
      'Brown': 'Brown energy grounds evening with practical wisdom and earth connection practices.'
      
      
    };
    return eveningGuidance[dominant] || `${dominant} energy transforms evening hours into sacred time for spiritual practices that align with your unique vibrational frequency.`;
  };

  // Helper functions for 9-chakra system calculations (using existing functions below)

  // Color spectrum analysis helper functions (duplicate removed)



  const getColorMeaningForEnergyTab = (color: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'How It makes you feel - survival instinct, life force, physical vitality',
      'Orange': 'How It makes you feel - creativity, sexuality, emotional flow',
      'Yellow': 'How It makes you feel - personal power, confidence, willpower',
      'Green': 'How It makes you feel - unconditional love, healing abilities, compassion',
      'Blue': 'How It makes you feel - communication, truth speaking, authentic voice',
      'Indigo': 'How It makes you feel - psychic abilities, intuition, spiritual sight',
      'Violet': 'How It makes you feel - spiritual connection, divine consciousness, enlightenment',
      'Purple': 'How It makes you feel - spiritual mastery, mystical awareness',
      'Pink': 'How It makes you feel - unconditional love, divine compassion',
      'White': 'How It makes you feel - spiritual protection, angelic connection',
      'Gold': 'How It makes you feel - divine wisdom, spiritual illumination',
      'Silver': 'How It makes you feel - intuitive wisdom, feminine power, psychic protection',
      'Gray': 'How It makes you feel: Emotional numbness - detachment, avoidance, spiritual stagnation',
      'Black': 'How It makes you feel: Shadow work required - deep wounds, negativity, spiritual darkness',
      'Brown': 'How It makes you feel - grounding, stability, practical wisdom'
    };
    const additionalColorMeanings: Record<string, string> = {
      'red': 'Deep passion energy - intense life force, warrior spirit, primal power',
      'silver': 'Soul love energy - divine feminine, cosmic creativity, spiritual passion',
      'purple': 'Higher communication - soul voice, mystical truth, divine expression',
      'violet': 'Deep wisdom energy - cosmic knowledge, soul memory, profound insight',
      'green': 'Renewal energy - fresh healing, growth acceleration, emotional cleansing',
      'yellow': 'Grounded passion - stable strength, earthly wisdom, enduring power',
      'brown': 'Earth star, wisdom energy - practical spirituality, natural healing, grounded insight',
      'white': 'Gentle earth energy - subtle wisdom, peaceful healing, quiet strength',
      'pink': 'Natural balance energy - earth connection, practical wisdom, stable grounding'
    };
    
    return meanings[color] || additionalColorMeanings[color] || `${color} chakra energy - unique spiritual frequency that channels specific cosmic vibrations through your energy field to create personal transformation and consciousness expansion.`;
  };

  const getColorFrequency = (color: string): string => {
    const frequencies: Record<string, string> = {
      'Red': 'Root chakra. Low frequency (430-480 THz) - Grounding and energizing vibration that connects to physical realm.',
      'Orange': 'Sacral chakra. Medium-low frequency (480-510 THz) - Creative and emotional vibration that stimulates passion.',
      'Yellow': 'Solar Plexus. Medium frequency (510-540 THz) - Mental and intellectual vibration that enhances clarity.',
      'Green': 'Heart chakra. Balanced frequency (540-580 THz) - Heart-centered vibration promoting healing and harmony.',
      'Blue': 'Throat chakra. Medium-high frequency (610-670 THz) - Communicative vibration that opens expression.',
      'Indigo': 'Third Eye Chakra. High frequency (670-700 THz) - Intuitive vibration connecting to psychic abilities.',
      'Violet': 'Crown Chakra. Highest frequency (700-750 THz) - Spiritual vibration linking to divine consciousness.',
      'Purple': 'Very high frequency (680-750 THz) - Mystical vibration enhancing spiritual power.',
      'Pink': 'Heart frequency (520-560 THz) - Love vibration that opens compassion centers.',
      'White': 'Full spectrum frequency - Contains all colors, representing complete spiritual integration.',
      'Gold': 'Divine frequency (550-570 THz) - Wisdom vibration connecting to cosmic consciousness.',
      'Silver': 'Soul star chakra. Lunar frequency (480-520 THz) - Reflective vibration enhancing intuitive abilities.',
      'Gray': 'Neutral frequency (540-580 THz) - Balanced vibration promoting spiritual equilibrium.',
      'Black': 'Shadow frequency (430-480 THz) - Transformative vibration enhancing inner work.',
      'Brown': 'Earth star chakra. Low-medium frequency (450-500 THz) - Grounding vibration connecting to earthly wisdom.',
      
    };
    return frequencies[color] || frequencies['Purple'];
  };

  const getChakraConnection = (color: string): string => {
    // Standardized chakra mappings consistent with remedies data
    const chakras: Record<string, string> = {
      'Red': 'Numerologically connected to:9. Planet:Mars. Root Chakra (Muladhara) - Grounding, survival, and physical vitality. Practice: Forgiveness meditation and grounding exercises.',
      'Orange': 'Numerologically connected to:6. Planet:Venus. Sacral Chakra (Svadhisthana) - Creativity, sexuality, and emotional flow. Practice: Creative expression and emotional healing.',
      'Yellow': 'Numerologically connected to:1. Planet:Sun. Solar Plexus Chakra (Manipura) - Personal power, confidence, and mental clarity. Practice: Goal setting and leadership development.',
      'Green': 'Numerologically connected to:2. Planet:Moon. Heart Chakra (Anahata) - Love, compassion, and emotional healing. Practice: Gratitude and relationship harmony.',
      'Blue': 'Numerologically connected to:5. Planet:Mercury. Throat Chakra (Vishuddha) - Communication, truth, and self-expression. Practice: Authentic communication and acts of kindness.',
      'Indigo': 'Numerologically connected to:8. Planet:Saturn. Third Eye Chakra (Ajna) - Intuition, psychic abilities, and inner wisdom. Practice: Meditation and intuition development.',
      'Violet': 'Numerologically connected to:3. Planet:Jupiter. Crown Chakra (Sahasrara) - Spiritual connection and divine consciousness. Practice: Expressive writing and spiritual connection.',
      'Purple': 'Numerologically connected to:3. Planet:Jupiter. Crown Chakra (Sahasrara) - Spiritual connection and divine consciousness. Practice: Mystical exploration and spiritual study.',
      'White': 'Numerologically connected to:7. Planet:Ketu. Soul Star Chakra - Complete chakra alignment and spiritual integration. Practice: Self-compassion and transcendence.',
      'Gold': 'Numerologically connected to:1. Planet:Sun. Solar Plexus Chakra (Manipura) - Divine wisdom and spiritual achievement. Practice: Leadership and confidence building.',
      'Silver': 'Numerologically connected to:7. Planet:Ketu. Soul Star Chakra - Lunar energy and psychic abilities. Practice: Intuitive development and spiritual wisdom.',
      'Brown': 'Numerologically connected to:4. Planet:Rahu. Earth Star Chakra - Grounding, stability, and deep earth connection. Practice: Mindfulness and grounding meditation.',
      'Black': 'Numerologically connected to:4. Planet:Rahu. Earth Star Chakra - Protection, transformation, and grounding. Practice: Stability building and earth connection.',
      'Pink': 'Numerologically connected to:2. Planet:Moon. Heart Chakra (Anahata) - Emotional love, compassion, and gentle healing. Practice: Self-love and emotional healing.'
    };
    return chakras[color] || chakras['Purple'] || 'Number:7. Planet:Neptune. Crown Chakra (Sahasrara) - Spiritual mastery, divine connection, and cosmic consciousness. Practice: Meditation and spiritual contemplation.';
  };

  const getColorBalance = (primary: string, secondary: string): string => {
    const balances: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Fire and water elements create dynamic balance between action and reflection.',
        'Green': 'Passion balanced with healing creates powerful manifestation abilities.',
        'Yellow': 'Physical energy combined with mental clarity creates strong leadership potential.',
        'Orange': 'Passion combined with creativity enhances artistic and teaching abilities.',
        'Purple': 'Passion combined with spiritual connection creates natural healing and teaching abilities.',
        'White': 'Passion combined with purity creates natural healing and spiritual guidance abilities.',
        'Gold': 'Passion combined with wisdom creates natural healing and spiritual guidance abilities.',
        'Indigo': 'Passion combined with intuition creates natural healing and spiritual guidance abilities.',
        'Pink': 'Passion combined with love creates natural healing and spiritual guidance abilities.',
        'Silver': 'Passion combined with intuition creates natural healing and spiritual guidance abilities.'
      },
      'Blue': {
        'Orange': 'Communication balanced with creativity enhances artistic and teaching abilities.',
        'Red': 'Calm wisdom balances intense passion, creating measured but powerful action.',
        'Yellow': 'Truth and wisdom combine to create excellent teaching and counseling abilities.',
        'Green': 'Communication combined with healing creates natural counseling and teaching abilities.',
        'Purple': 'Communication combined with spiritual connection creates natural counseling and teaching abilities.',
        'White': 'Communication combined with purity creates natural counseling and teaching abilities.',
        'Gold': 'Communication combined with wisdom creates natural counseling and teaching abilities.',
        'Indigo': 'Communication combined with intuition creates natural counseling and teaching abilities.',
        'Pink': 'Communication combined with love creates natural counseling and teaching abilities.',
        'Silver': 'Communication combined with intuition creates natural counseling and teaching abilities.',
        'Gray': 'blockages',
      },
      'Green': {
        'Purple': 'Healing energy enhanced by spiritual power creates natural healer capabilities.',
        'Red': 'Growth balanced with passion creates dynamic healing and manifestation abilities.',
        'Blue': 'Heart wisdom combined with clear communication creates excellent counseling potential.',
        'Yellow': 'Healing energy combined with mental clarity creates strong analytical healing abilities.',
        'Orange': 'Healing energy combined with creativity creates dynamic healing and artistic abilities.',
        'White': 'Healing energy combined with purity creates natural healing and spiritual guidance abilities.',
        'Gold': 'Healing energy combined with wisdom creates natural healing and spiritual guidance abilities.',
        'Indigo': 'Healing energy combined with intuition creates natural healing and spiritual guidance abilities.',
        'Pink': 'Healing energy combined with love creates natural healing and spiritual guidance abilities.',
        'Silver': 'Healing energy combined with intuition creates natural healing and spiritual guidance abilities.',
          'Peach': 'Healing energy combined with love creates natural healing and teaching abilities.',
          'Gray': 'Some Blockages. Connect to a Healer to understand more.',
          'Black': 'Some Blockages. Connect to a healer to be able to get more information',
      }
    };
    return balances[primary]?.[secondary] || balances[secondary]?.[primary] || 
           `The combination of ${primary} and ${secondary} creates a unique energetic balance specific to your spiritual path.`;
  };

  function getColorKeyword(color: string): string {
        const keywords: Record<string, string> = {
            'Red': 'Life Force & Vitality',
            'red': 'Life Force & Vitality',
            'Orange': 'Creative Expression & Sensuality',
            'orange': 'Creative Expression & Sensuality',
            'Yellow': 'Mental Clarity & Confidence',
            'yellow': 'Mental Clarity & Confidence',
            'Green': 'Heart Healing & Compassion',
            'green': 'Heart Healing & Compassion',
            'Blue': 'Authentic Communication & Truth',
            'blue': 'Authentic Communication & Truth',
            'Indigo': 'Psychic Abilities & Inner Vision',
            'indigo': 'Psychic Abilities & Inner Vision',
            'Violet': 'Divine Connection & Enlightenment',
            'violet': 'Divine Connection & Enlightenment',
            'Purple': 'Spiritual Mastery & Transformation',
            'purple': 'Spiritual Mastery & Transformation',
            'Pink': 'Unconditional Love & Tenderness',
            'pink': 'Unconditional Love & Tenderness',
            'White': 'Divine Light & Purification',
            'white': 'Divine Light & Purification',
            'Gold': 'Christ Consciousness & Illumination',
            'gold': 'Christ Consciousness & Illumination',
            'Silver': 'Feminine Intuition & Reflection',
            'silver': 'Feminine Intuition & Reflection',
            'Gray': 'Blockages',
            'gray': 'Blockages',
            'Black': 'Shadow Work & Deep Transformation blockage',
            'black': 'Shadow Work & Deep Transformation blockage',
            'brown': 'Earth Connection & Practical Wisdom',
            'Brown': 'Earth Connection & Practical Wisdom',
        };
        return keywords[color] || keywords[color.toLowerCase()] || keywords[color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()] || 'Unique Spiritual Energy';
    }



  const getLayerMeaning = (layer: string, color: string): string => {
    const layerMeanings: Record<string, Record<string, string>> = {
      'inner': {
        'Red': 'Your core essence pulses with primal life force and determination.',
        'Blue': 'Your inner truth radiates calm wisdom and spiritual guidance.',
        'Green': 'Your heart center naturally emanates healing and growth energy.',
        'Yellow': 'Your mental core shines with intelligence and spiritual illumination.',
        'Purple': 'Your spiritual essence carries ancient wisdom and mystical power.',
        'White': 'Your inner core radiates pure spiritual energy and divine connection.',
        'Gold': 'Your inner wisdom center emanates divine protection and spiritual authority.',
        'Indigo': 'Your inner intuition center radiates psychic abilities and visionary insights.',
        'Pink': 'Your inner love center emanates unconditional compassion and healing.',
        'Silver': 'Your inner core radiates protection of the divine and of spiritual connection',
        'Gray': 'Your inner core center radiates blockages',
        'Black': 'Your inner core center radiates slight blockages',
        'Violet': 'Your spiritual essence carries ancient wisdom and mystical power.',
        'Orange': 'Your inner core center radiates creativity, joy, and vital energy.',
        'Brown': 'Your inner core center radiates earth connection, grounding, and practical wisdom.',
      },
      'middle': {
        'Red': 'Your emotional body processes through passionate and intense feeling.',
        'Blue': 'Your emotional processing flows through peaceful and truthful expression.',
        'Green': 'Your emotional healing naturally balances and harmonizes energy.',
        'Yellow': 'Your emotional intelligence analyzes feelings with clarity and wisdom.',
        'Purple': 'Your emotional body connects feelings to spiritual insights.',
        'White': 'Your emotional body processes feelings with pure spiritual intention.',
        'Gold': 'Your emotional wisdom center radiates divine protection and spiritual authority.',
        'Indigo': 'Your emotional intuition center radiates psychic abilities and visionary insights.',
        'Pink': 'Your emotional love center emanates unconditional compassion and healing.',
        'Silver': 'Your emotional core radiates protection of the divine and of spiritual connection',
        'Gray': 'Your emotional core center radiates slight blockages',
        'Black': 'Your emotional core center radiates some blockages',
        'Violet': 'Your emotional body connects feelings to spiritual insights.',
        'Orange': 'Your emotional core center radiates creativity, joy, and vital energy.',
        'Brown': 'Your emotional core center radiates earth connection, grounding, and practical wisdom.'
      },
      'outer': {
        'Red': 'You project dynamic energy and commanding presence to the world.',
        'Blue': 'You emanate peaceful authority and trustworthy communication.',
        'Green': 'You radiate healing presence that others find naturally comforting.',
        'Yellow': 'You project intellectual brightness and inspiring optimism.',
        'Purple': 'You emanate spiritual authority and mystical presence.',
        'White': 'You radiate pure spiritual energy and divine connection.',
        'Gold': 'Your outer wisdom center emanates divine protection and spiritual authority.',
        'Indigo': 'Your outer intuition center radiates psychic abilities and visionary insights.',
        'Pink': 'Your outer love center emanates unconditional compassion and healing.',
        'Silver': 'Your outer core radiates protection of the divine and of spiritual connection',
        'Gray': 'Your outer core center radiates balance, neutrality, adaptability.',
        'Black': 'Your outer core center radiates power, protection, transformation.',
        'Violet': 'You emanate spiritual authority and mystical presence.',
        'Orange': 'You project creative energy and inspiring enthusiasm to the world.',
        'Brown': 'You radiate earth connection, stability, and practical wisdom to the world.'
      }
    };
    return layerMeanings[layer]?.[color] || layerMeanings[layer]?.[color.charAt(0).toUpperCase() + color.slice(1)] || 
           layerMeanings['inner']?.[color] || layerMeanings['inner']?.[color.charAt(0).toUpperCase() + color.slice(1)] ||
           'Authentic energy interpretation not available for this color combination';
  };

  const getEnergyPattern = (primary: string, secondary: string): string => {
    const patterns: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Fire-water pattern - passionate action balanced with calm wisdom, creating powerful leadership energy',
        'Green': 'Fire-earth pattern - vital force channeled through healing, creating natural healer energy',
        'Yellow': 'Fire-air pattern - physical power merged with mental clarity, creating strong manifestation energy',
        'Purple': 'Fire-spirit pattern - earthly passion elevated to spiritual service, creating warrior-mystic energy',
        'Orange': 'Double fire pattern - life force amplified through creativity, creating dynamic artistic energy',
        'Pink': 'Fire-heart pattern - passionate action softened by love, creating inspiring teacher energy',
        'White': 'Fire-light pattern - earthly passion channeled through purity, creating enlightened warrior energy',
      },
      'Blue': {
        'Red': 'Water-fire pattern - truthful communication empowered by passion, creating inspiring teacher energy',
        'Green': 'Water-earth pattern - peaceful wisdom flowing through healing love, creating gentle counselor energy',
        'Yellow': 'Water-air pattern - clear truth merged with bright intellect, creating wise communicator energy',
        'Purple': 'Water-spirit pattern - authentic voice channeling divine wisdom, creating spiritual messenger energy',
        'Pink': 'Water-heart pattern - truthful expression softened by compassion, creating loving guide energy',
        'White': 'Water-light pattern - truthful communication channeled through purity, creating enlightened teacher energy',
        'Gold': 'Water-gold pattern - truthful communication channeled through wisdom, creating enlightened teacher energy',
        'Indigo': 'Water-indigo pattern - truthful communication channeled through intuition, creating enlightened teacher energy',
        'Silver': 'Water-silver pattern - truthful communication channeled through intuition, creating enlightened teacher energy',
          
      },
      'Green': {
        'Red': 'Earth-fire pattern - healing love energized by passion, creating dynamic healer energy',
        'Blue': 'Earth-water pattern - heart wisdom expressed through clear truth, creating compassionate teacher energy',
        'Yellow': 'Earth-air pattern - healing heart illuminated by wisdom, creating enlightened healer energy',
        'Purple': 'Earth-spirit pattern - healing love elevated to divine service, creating sacred healer energy',
        'Pink': 'Double heart pattern - healing love amplified by divine compassion, creating pure love energy',
        'White': 'Earth-light pattern - healing love channeled through purity, creating enlightened healer energy',
        'Orange': 'Earth-fire pattern - healing love energized by creativity, creating dynamic healer energy',
        'Gold': 'Earth-gold pattern - healing love channeled through wisdom, creating enlightened healer energy',
        'Indigo': 'Earth-indigo pattern - healing love channeled through intuition, creating enlightened healer energy',
        'Silver': 'Earth-silver pattern - healing love channeled through intuition, creating enlightened healer energy'
      },
      'Yellow': {
        'Red': 'Air-fire pattern - brilliant mind empowered by passionate will, creating visionary leader energy',
        'Blue': 'Air-water pattern - clear wisdom expressed through peaceful truth, creating wise teacher energy',
        'Green': 'Air-earth pattern - mental clarity grounded in healing love, creating balanced teacher energy',
        'Purple': 'Air-spirit pattern - intellectual wisdom elevated to divine understanding, creating enlightened sage energy',
        'Orange': 'Air-fire pattern - mental brightness enhanced by creative joy, creating inspired teacher energy',
          'Pink': 'Air-heart pattern - intellectual wisdom softened by compassion, creating loving teacher energy',
          'White': 'Air-light pattern - mental clarity channeled through purity, creating enlightened teacher energy',
          'Gold': 'Air-gold pattern - mental clarity channeled through wisdom, creating enlightened teacher energy',
          'Indigo': 'Air-indigo pattern - mental clarity channeled through intuition, creating enlightened teacher energy',
      },
      'Purple': {
        'Red': 'Spirit-fire pattern - divine wisdom empowered by earthly passion, creating spiritual warrior energy',
        'Blue': 'Spirit-water pattern - mystical knowledge expressed through truthful communication, creating prophet energy',
        'Green': 'Spirit-earth pattern - divine love channeled through healing service, creating saint energy',
       'Yellow': 'Spirit-air pattern - cosmic wisdom merged with brilliant intellect, creating master teacher energy',
        'White': 'Double spirit pattern - divine consciousness amplified by pure light, creating avatar energy',
        'Orange': 'Spirit-fire pattern - divine wisdom empowered by creativity, creating spiritual artist energy',
        'Pink': 'Spirit-heart pattern - divine love amplified by compassion, creating divine healer energy',
        'Gold': 'Spirit-gold pattern - divine wisdom channeled through wisdom, creating enlightened teacher energy',
        'Indigo': 'Spirit-indigo pattern - divine wisdom channeled through intuition, creating enlightened teacher energy',
        'Silver': 'Spirit-silver pattern - divine wisdom channeled through intuition, creating enlightened teacher energy',
      }
    };
    
    // Comprehensive aura pattern interpretations for all color combinations
    const specificPatterns: Record<string, Record<string, string>> = {
      'Red': {
        'Orange': 'Passionate creativity - Fiery life force channeling creative manifestation through physical action and artistic expression',
        'Yellow': 'Confident action - Dynamic willpower expressing through decisive leadership and personal authority',
        'Green': 'Passionate healing - Life force energy channeling through compassionate service and healing touch',
        'Blue': 'Truthful passion - Authentic communication powered by deep conviction and honest expression',
        'Indigo': 'Intuitive action - Psychic abilities manifesting through direct action and spiritual leadership',
        'Violet': 'Spiritual warrior - Divine purpose expressing through courageous spiritual service and transformation',
        'Purple': 'Mystical power - Ancient wisdom combining with life force for magical manifestation and spiritual authority',
        'Pink': 'Loving strength - Unconditional love supported by protective strength and nurturing power',
        'White': 'Pure vitality - Divine life force expressing through blessed service and spiritual protection',
        'Gold': 'Wise leadership - Ancient wisdom combining with dynamic action for enlightened authority',
        'Silver': 'Lunar strength - Intuitive power channeling through protective action and psychic defense'
      },
      'Orange': {
        'Yellow': 'Creative confidence - Artistic expression flowing through personal empowerment and joyful manifestation',
        'Green': 'Healing creativity - Artistic abilities channeling therapeutic energy and emotional restoration',
        'Blue': 'Expressive truth - Creative communication flowing through honest artistic expression and authentic voice',
        'Indigo': 'Psychic creativity - Intuitive artistic abilities manifesting through visionary expression and spiritual art',
        'Violet': 'Sacred artistry - Divine inspiration flowing through creative expression and spiritual beauty',
        'Purple': 'Mystical creation - Ancient artistic wisdom manifesting through magical creative processes',
        'Pink': 'Loving expression - Heart-centered creativity flowing through emotional healing and compassionate art',
        'White': 'Pure creation - Divine artistic inspiration manifesting through blessed creative service',
        'Gold': 'Wise artistry - Ancient creative wisdom expressing through enlightened artistic mastery',
        'Silver': 'Intuitive art - Lunar creative energy flowing through psychic artistic expression'
      },
      'Yellow': {
        'Green': 'Wise healing - Mental clarity supporting heart-centered healing and balanced wisdom',
        'Blue': 'Clear communication - Mental power enhancing truthful expression and authentic voice',
        'Indigo': 'Intuitive wisdom - Mental clarity combining with psychic abilities for enhanced perception',
        'Violet': 'Enlightened mind - Mental power elevated to spiritual understanding and divine wisdom',
        'Purple': 'Mystical knowledge - Ancient mental wisdom accessing cosmic understanding and magical insight',
        'Pink': 'Loving wisdom - Heart-centered intelligence expressing through compassionate understanding',
        'White': 'Pure knowledge - Divine mental clarity channeling blessed wisdom and spiritual truth',
        'Gold': 'Master wisdom - Ancient enlightened knowledge expressing through spiritual teaching',
        'Silver': 'Psychic intelligence - Lunar wisdom enhancing intuitive mental abilities'
      },
      'Green': {
        'Blue': 'Healing communication - Heart-centered truth expressing through therapeutic communication',
        'Indigo': 'Psychic healing - Intuitive healing abilities enhanced by third eye perception',
        'Violet': 'Spiritual healing - Divine healing energy channeling through crown chakra connection',
        'Purple': 'Mystical healing - Ancient healing wisdom accessing magical restoration abilities',
        'Pink': 'Unconditional healing - Pure love energy manifesting through infinite compassion',
        'White': 'Divine healing - Sacred healing energy channeling through blessed service',
        'Gold': 'Master healer - Ancient healing wisdom expressing through enlightened therapeutic mastery',
        'Silver': 'Lunar healing - Intuitive healing energy flowing through psychic therapeutic touch'
      },
      'Blue': {
        'Indigo': 'Psychic communication - Intuitive truth expressing through telepathic and spiritual communication',
        'Violet': 'Divine voice - Sacred truth channeling through crown chakra spiritual expression',
        'Purple': 'Mystical communication - Ancient voice wisdom accessing cosmic truth and magical expression',
        'Pink': 'Loving truth - Heart-centered honesty expressing through compassionate communication',
        'White': 'Pure voice - Divine communication channeling through blessed truthful expression',
        'Gold': 'Wise communication - Ancient truth wisdom expressing through enlightened teaching voice',
        'Silver': 'Intuitive voice - Lunar communication energy enhancing psychic verbal expression'
      },
      'Indigo': {
        'Violet': 'Crown psychic - Third eye and crown chakra unified for supreme spiritual perception',
        'Purple': 'Mystical sight - Ancient psychic wisdom accessing cosmic vision and magical sight',
        'Pink': 'Loving intuition - Heart-centered psychic abilities expressing through compassionate insight',
        'White': 'Pure psychic - Divine intuitive abilities channeling through blessed spiritual perception',
        'Gold': 'Master psychic - Ancient intuitive wisdom expressing through enlightened spiritual sight',
        'Silver': 'Lunar psychic - Enhanced moon-connected intuitive abilities and psychic lunar wisdom'
      },
      'Violet': {
        'Purple': 'Supreme spiritual - Crown chakra and mystical wisdom unified for divine cosmic connection',
        'Pink': 'Divine love - Spiritual connection expressing through infinite unconditional compassion',
        'White': 'Pure spirit - Divine spiritual energy manifesting through blessed crown chakra connection',
        'Gold': 'Enlightened crown - Ancient spiritual wisdom expressing through supreme divine connection',
        'Silver': 'Cosmic intuition - Spiritual crown energy enhanced by lunar psychic connection'
      },
      'Purple': {
        'Pink': 'Mystical love - Ancient wisdom expressing through heart-centered magical compassion',
        'White': 'Pure mystical - Divine magical wisdom channeling through blessed spiritual transformation',
        'Gold': 'Ancient mastery - Supreme mystical wisdom expressing through enlightened magical authority',
        'Silver': 'Lunar mystical - Psychic magical abilities enhanced by intuitive lunar wisdom'
      },
      'Pink': {
        'White': 'Pure love - Divine unconditional love manifesting through blessed heart connection',
        'Gold': 'Wise love - Ancient heart wisdom expressing through enlightened compassionate service',
        'Silver': 'Intuitive love - Heart-centered compassion enhanced by lunar psychic emotional wisdom'
      },
      'White': {
        'Gold': 'Divine wisdom - Pure spiritual energy unified with ancient enlightened knowledge',
        'Silver': 'Pure intuition - Divine spiritual connection enhanced by lunar psychic wisdom'
      },
      'Gold': {
        'Silver': 'Master intuition - Ancient enlightened wisdom unified with lunar psychic abilities'
      },
    };

    return specificPatterns[primary]?.[secondary] || specificPatterns[secondary]?.[primary] || 
           `${primary}-${secondary} harmonic convergence - two distinct spiritual frequencies creating a unique energetic signature that enhances both individual color properties through synchronized vibrational resonance`;
  };

  const getColorMeditation = (color: string): string => {
    const meditations: Record<string, string> = {
      'Red': 'Visualize deep red light at your root chakra. Breathe in strength and grounding energy.',
      'Blue': 'Focus on peaceful blue light at your throat. Breathe in truth and clear communication.',
      'Green': 'Imagine healing green light at your heart center. Breathe in love and harmony.',
      'Yellow': 'Visualize golden yellow light at your solar plexus. Breathe in wisdom and confidence.',
      'Purple': 'Focus on royal purple light at your crown. Breathe in spiritual connection and wisdom.',
      'White': 'Visualize pure white light surrounding your entire aura. Breathe in purity and protection.',
      'Gold': 'Focus on divine gold light at your soul star chakra. Breathe in wisdom and protection.',
      'Indigo': 'Visualize deep indigo light at your third eye. Breathe in intuition and psychic abilities.',
      'Pink': 'Focus on loving pink light at your heart center. Breathe in compassion and healing.',
      'Silver': 'Visualize silver light at your soul star chakra. Breathe in intuition and psychic abilities.',
      'Brown': 'Visualize brown light at your earth-star chakra. Breathe in stability, grounding, practicality.',
    };
    return meditations[color] || meditations['Purple'];
  };

  const getColorHealing = (primary: string, secondary: string): string => {
    return `Wear ${primary.toLowerCase()} clothing or crystals to amplify your natural energy. Balance with ${secondary.toLowerCase()} elements in your environment. Consider ${primary.toLowerCase()} crystal therapy and ${secondary.toLowerCase()} color breathing exercises.`;
  };
  const getPositiveTraits = (color: string): string => {
    const traits: Record<string, string> = {
      'Red': 'Strong life force, physical vitality, courage, passion, grounding, survival strength, manifestation power, leadership',
      'Orange': 'Creative and sexual energy flowing, emotional expression active, joy, enthusiasm, optimism, social confidence',
      'Yellow': 'Personal power and confidence radiating, strong willpower, mental clarity, wisdom, analytical thinking',
      'Green': 'Love and healing energy flowing, compassionate nature, growth, harmony with nature, balanced emotions',
      'Blue': 'Throat area with extension to jaw and neck - Truth-speaking abilities, authentic communication, peaceful nature',
      'Purple': 'Spiritual awareness awakening, divine connection opening, mystical abilities, intuitive wisdom',
      'Gold': 'Divine wisdom and protection, spiritual achievement, enlightened consciousness, cosmic connection',
      'White': 'Purity and spiritual protection, connection to higher realms, clarity of purpose, divine guidance',
      'Pink': 'Unconditional love, compassion, nurturing energy, heart-centered healing, emotional balance',
      'Silver': 'Protection of the divine and of spiritual connection.',
      'violet': 'Divine connection, spiritual awareness, mystical abilities, intuitive wisdom',
      'brown': 'Earth connection, grounding, stability, practical wisdom, natural healing',
      
    };
    // Black and Gray only show shadow traits, no positive traits
    if (color === 'Black' || color === 'Gray' || color === 'black' || color === 'gray' || color === 'grey' || color === 'Grey') {
      return 'No positive traits - see shadow aspects for this color';
    }
    return traits[color] || traits['Purple'];
  };

  const getPositiveDescription = (color: string): string => {
    const descriptions: Record<string, string> = {
      'Red': 'Your red aura energy manifests as powerful grounding force, giving you exceptional physical vitality and the courage to take decisive action. You have natural leadership abilities and can manifest your desires into physical reality.',
      'Orange': 'This vibrant energy makes you naturally creative and socially confident. You experience life with enthusiasm and joy, expressing emotions freely and inspiring others through your optimistic presence.',
      'Yellow': 'Your solar plexus radiates confidence and personal power. You possess strong analytical abilities and mental clarity that helps you make wise decisions and teach others through your accumulated wisdom.',
      'Green': 'This healing energy makes you a natural peacemaker and healer. You create harmony wherever you go and have an innate connection to nature and growth cycles.',
      'Blue': 'Your throat chakra energy enhances truthful communication and authentic self-expression. You naturally inspire trust and can communicate complex ideas with clarity and peace.',
      'Purple': 'This spiritual energy connects you to higher dimensions and mystical understanding. You have natural psychic abilities and can access ancient wisdom.',
      'Gold': 'Your divine connection manifests as spiritual authority and wisdom. You carry protective energy and have achieved significant spiritual development.',
      'White': 'This pure energy provides spiritual protection and connects you directly to source consciousness. You embody clarity and divine guidance.',
      'Pink': 'Your heart chakra radiates unconditional love and compassion. You naturally nurture others and create healing through your loving presence.',
      'Silver': 'Your soul star chakra radiates protection of the divine and of spiritual connection.',
      'Gray': 'work on Your root chakra it will then radiate balance, neutrality, adaptability.',
      'Black': 'work on Your chakras to radiate power, protection, transformation.',
      
    };
    return descriptions[color] || 'Your unique energy signature carries powerful positive qualities.';
  };

  const getShadowTraits = (color: string): string => {
    const shadows: Record<string, string> = {
      'Red': 'Anger, aggression, impatience, survival fears, material obsession, explosive emotions, physical tension, restlessness',
      'Orange': 'Emotional overwhelm, sexual imbalance, creative blocks, attention-seeking, superficial expressions',
      'Yellow': 'Mental overthinking, ego dominance, criticism, perfectionism, intellectual arrogance, analysis paralysis',
      'Green': 'Emotional codependency, giving too much, boundary issues, jealousy, possessiveness, healing burnout',
      'Blue': 'Communication blocks, truth avoidance, throat constriction, difficulty expressing authentic self',
      'Purple': 'Spiritual bypassing, disconnection from reality, psychic overwhelm, superiority complex, mystical inflation',
      'Gold': 'Spiritual pride, divine complex, isolation from humanity, perfectionist standards, wisdom hoarding',
      'White': 'Spiritual detachment, avoidance of earthly matters, purity obsession, emotional numbness',
      'Pink': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Silver': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Turquoise': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Lavender': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Peach': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Gray': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Black': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality'
    };
    return shadows[color] || shadows['Purple'];
  };

  const getShadowDescription = (color: string): string => {
    const descriptions: Record<string, string> = {
      'Red': 'When unbalanced, this powerful energy can manifest as anger, impatience, or survival fears. You may experience explosive emotions or become overly focused on material concerns, losing connection to your spiritual nature.',
      'Orange': 'The shadow side may show up as emotional overwhelm or attention-seeking behaviors. Creative energy can become blocked, leading to frustration or superficial expressions of your true creative potential.',
      'Yellow': 'Mental energy can become overthinking and ego-driven criticism. You might fall into analysis paralysis or develop intellectual arrogance that blocks genuine wisdom and connection with others.',
      'Green': 'The healing nature can become codependent giving or boundary issues. You may exhaust yourself caring for others while neglecting your own needs, or experience jealousy and possessiveness.',
      'Blue': 'Communication blocks can manifest as difficulty expressing your authentic truth. You might avoid difficult conversations or experience throat constriction when trying to speak your truth.',
      'Purple': 'Spiritual energy can lead to disconnection from practical reality or psychic overwhelm. You might develop superiority complex or use spirituality to avoid dealing with earthly responsibilities.',
      'Gold': 'Divine wisdom can manifest as spiritual pride or perfectionist standards. You might isolate yourself from others, feeling they dont understand your elevated consciousness.',
      'White': 'Pure energy can lead to spiritual detachment or avoidance of emotional depth. You might become overly focused on perfection while avoiding the messy aspects of human experience.',
      'Pink': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
      'Silver': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
      'Black': 'Some blockages may lead to problem. Connect to healer.',
      'Gray': 'Some blockages may lead to problem. Connect to healer.',
    };
    return descriptions[color] || descriptions['Purple'];
  };

  const getPlacementDescription = (color: string): string => {
    const placements: Record<string, string> = {
      'Red': 'Base of spine radiating through legs and into earth connection',
      'Orange': 'Sacral center extending to lower abdomen and reproductive organs',
      'Yellow': 'Solar plexus center extending to stomach area',
      'Green': 'Heart center expanding outward to arms and hands',
      'Blue': 'Throat area with extension to jaw and neck',
      'Purple': 'Crown of head with upward spiritual connection',
      'Gold': 'Soul star chakra above the crown, cosmic connection',
      'White': 'Full aura field surrounding entire energy body',
      'Pink': 'Heart chakra higher octave, emotional and spiritual love center',
      'Silver': 'Soul star chakra above the crown, cosmic connection',
      'Gray': 'Bloackages in grounding and stability',
      'Black': 'Blockages in grounding and stability',
    };
    return placements[color] || placements['Purple'];
  };



  const getDetailedPlacement = (color: string): string => {
    const details: Record<string, string> = {
      'Red': 'Powerful grounding energy with strong life force and survival instincts. This energy connects you deeply to the earth and physical realm, providing stability and manifestation power.',
      'Orange': 'Creative life force and sensual energy that flows through your creative and reproductive centers. This placement enhances your ability to create, procreate, and experience joy.',
      'Yellow': 'Personal power radiating from your core, giving you confidence and strong willpower. This energy helps you assert yourself and make decisions from a place of inner strength.',
      'Green': 'Love and healing energy flowing compassionately from your heart center. This placement makes you naturally nurturing and able to heal both yourself and others.',
      'Blue': 'Truth-speaking abilities centered in your throat that enhance authentic communication. This energy helps you express your truth clearly and inspire others through your words.',
      'Purple': 'Spiritual connection opening divine awareness and mystical understanding. This placement connects you to higher dimensions and ancient wisdom.',
      'Gold': 'Divine wisdom and protection flowing from higher spiritual centers. This energy indicates advanced spiritual development and cosmic consciousness.',
      'White': 'Complete spiritual integration surrounding your entire energy field. This placement indicates purity of intention and direct connection to source energy.',
      'Pink': 'Unconditional love emanating from an elevated heart center. This energy transcends personal love and connects you to universal compassion.', 
      'Silver': 'Protection of the divine and of spiritual connection.',
      'Gray': 'Balance, neutrality, adaptability.',
      'Black': 'Power, protection, transformation.',
      'brown': 'Earth connection, grounding, stability, practical wisdom, natural healing',
    };
    return details[color] || details['Purple'];
  };

  function get9ChakraAnalysis(primaryColor: string, secondaryColor: string): Array<{ name: string; location: string; analysis: string; }> {
        const chakraColorMapping: Record<string, string> = {
            'Red': 'Root',
            'Orange': 'Sacral',
            'Yellow': 'Solar Plexus',
            'Green': 'Heart',
            'Blue': 'Throat',
            'Indigo': 'Third Eye',
            'Purple': 'Crown',
            'Violet': 'Crown',
            'Gold': 'Soul Star',
            'White': 'Soul Star',
            'Pink': 'Higher Heart',
            'Silver': 'Soul Star',
            'Brown': 'Earth Star',
        };

        const primaryChakra = chakraColorMapping[primaryColor] || 'Crown';
        const secondaryChakra = chakraColorMapping[secondaryColor] || 'Heart';

        return [
            {
                name: 'Earth Star Chakra',
                location: 'Below feet, grounding to Earth',
                analysis: `Your connection to Earth's energy shows ${primaryColor.toLowerCase()} influence, indicating ${primaryChakra === 'Root' ? 'strong grounding and stability' : 'need for deeper earth connection'}. This chakra anchors your spiritual work in physical reality.`
            },
            {
                name: 'Root Chakra (Muladhara)',
                location: 'Base of spine',
                analysis: `Your survival and grounding energy resonates with ${primaryColor} frequency. ${primaryChakra === 'Root' ? 'This chakra is powerfully activated, providing strong foundation and manifestation abilities.' : 'Focus on red energy meditation to strengthen your foundation and sense of security.'}`
            },
            {
                name: 'Sacral Chakra (Svadhisthana)',
                location: 'Lower abdomen',
                analysis: `Creative and sexual energies flow through ${secondaryColor.toLowerCase()} vibration. ${secondaryChakra === 'Sacral' ? 'Your creative expression and emotional flow are well-balanced and vibrant.' : 'Orange energy work will enhance creativity and emotional processing.'}`
            },
            {
                name: 'Solar Plexus Chakra (Manipura)',
                location: 'Upper abdomen',
                analysis: `Personal power center shows ${primaryColor === 'Yellow' ? 'bright activation with strong willpower and confidence' : 'potential for development through yellow light meditation'}. This chakra governs your sense of personal authority and decision-making abilities.`
            },
            {
                name: 'Heart Chakra (Anahata)',
                location: 'Center of chest',
                analysis: `Love and healing energies pulse with ${primaryColor === 'Green' || secondaryColor === 'Green' ? 'beautiful green harmony, indicating natural healing abilities and compassionate nature' : 'potential for deeper heart opening through green energy practices'}. Your emotional balance and relationships are influenced by this center.`
            },
            {
                name: 'Throat Chakra (Vishuddha)',
                location: 'Throat area',
                analysis: `Communication and truth expression channels ${primaryColor === 'Blue' || secondaryColor === 'Blue' ? 'clear blue energy, showing authentic self-expression and truthful communication' : 'opportunity for enhanced expression through blue energy work'}. This governs how you share your inner truth with the world.`
            },
            {
                name: 'Third Eye Chakra (Ajna)',
                location: 'Between eyebrows',
                analysis: `Intuitive sight and inner wisdom operate through ${primaryColor === 'Indigo' || primaryColor === 'Purple' ? 'activated indigo/purple frequencies, indicating strong psychic abilities and spiritual insight' : 'developing intuitive gifts that benefit from purple meditation'}. This center governs your spiritual perception and inner knowing.`
            },
            {
                name: 'Crown Chakra (Sahasrara)',
                location: 'Top of head',
                analysis: `Divine connection flows through ${primaryColor === 'Purple' || primaryColor === 'Violet' || primaryColor === 'White' ? 'luminous spiritual frequencies, showing open connection to higher consciousness and divine wisdom' : 'emerging spiritual awareness that grows through purple and white light practices'}. This is your gateway to cosmic consciousness.`
            },
            {
                name: 'Soul Star Chakra',
                location: 'Above the crown',
                analysis: `Higher spiritual purpose radiates ${primaryColor === 'Gold' || primaryColor === 'White' || secondaryColor === 'Gold' ? 'brilliant golden-white light, indicating advanced soul development and spiritual mastery' : 'developing connection to soul mission through gold and white energy meditation'}. This chakra connects you to your highest spiritual destiny and cosmic purpose.`
            }
        ];
    }

  const getSecondaryColorDescription = (color: string): string => {
    return `${getColorMeaningForEnergyTab(color)} This secondary energy creates a supportive foundation that balances and enhances your dominant energy pattern.`;
  };

  const getSupportingColorLocation = (color: string, index: number): string => {
    const locations = [
      'Heart center expanding outward to arms and hands - Love and healing energy flowing, compassionate nature',
      'Throat area with extension to jaw and neck - Truth-speaking abilities, authentic communication development',
      'Crown of head with upward spiritual connection - Spiritual awareness awakening, divine connection opening',
      'Third eye chakra showing a movemnt in the spiritual direction from you',
      'Throat chakra explanding around the face and neck shows a communication',
      'Root chakra around the body shows a grounding and stability',
      'Heart chakra around the body shows a love and compassion',
      'Crown chakra colours around the body shows a intellectual connection',
      'Sacral chakra around the body shows a creative and sensual energy',
      'Solar plexus around the body shows a personal power and confidence',
      'Third eye chakra around the body shows a spiritual awareness and divine connection',
      'Crown chakra around the body shows a spiritual awareness and divine connection',
      'Throat chakra around the body shows a truth-speaking abilities and authentic communication',
    ];
    return locations[index] || 'Divine energy anchor point - cosmic positioning for spiritual growth and soul evolution';
  };

  const getSupportingColorDescription = (color: string): string => {
    const supportingDescriptions: Record<string, string> = {
      'Red': 'How It makes you feel - strengthens your foundation with grounding, survival instincts, and physical vitality',
      'Orange': 'How It makes you feel - enhances your creativity with emotional flow, artistic expression, and joyful passion',
      'Yellow': 'How It makes you feel - empowers your confidence with personal power, mental clarity, and intellectual wisdom',
      'Green': 'How It makes you feel - opens your compassion with healing love, emotional balance, and natural harmony',
      'Blue': 'How It makes you feel - clarifies your communication with truthful expression, authentic voice, and peaceful wisdom',
      'Indigo': 'How It makes you feel - awakens your intuition with psychic abilities, inner knowing, and spiritual sight',
      'Purple': 'How It makes you feel - connects your spirit with divine wisdom, mystical awareness, and cosmic consciousness',
      'Pink': 'How It makes you feel - expands your love with unconditional compassion, divine grace, and soul connection',
      'Gold': 'How It makes you feel - illuminates your purpose with divine wisdom, spiritual mastery, and soul mission',
      'Silver': 'How It makes you feel - activates your intuition with feminine wisdom, psychic protection, and mystical insight',
      'White': 'How It makes you feel: Pure light support - purifies your energy with spiritual protection, angelic connection, and divine grace',
      'Gray': 'How It makes you feel - brings balance with spiritual equilibrium, adaptable wisdom, and cosmic neutrality',
      'Black': 'How It makes you feel: Shadow integration support - initiates transformation with deep inner work, shadow healing, and spiritual rebirth',
    };
    
    return supportingDescriptions[color] || supportingDescriptions['Purple'];
  };

  const getEnergyFlowPattern = (primary: string, secondary: string): string => {
    const flowPatterns: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Passion flows into peaceful wisdom - fiery determination channeled through calm truth-speaking',
        'Green': 'Life force flows into healing love - vital energy channeled through heart-centered compassion',
        'Yellow': 'Physical power flows into mental clarity - grounding strength channeled through brilliant wisdom',
        'Purple': 'Earthly passion flows into divine wisdom - material strength channeled through spiritual service',
        'Orange': 'Root vitality flows into creative joy - survival energy channeled through artistic expression'
      },
      'Blue': {
        'Red': 'Peaceful truth flows into passionate action - calm wisdom channeled through determined service',
        'Green': 'Clear communication flows into healing love - authentic voice channeled through heart wisdom',
        'Yellow': 'Truthful wisdom flows into mental brilliance - honest expression channeled through intellectual clarity',
        'Purple': 'Authentic voice flows into mystical knowing - truthful communication channeled through divine wisdom',
        'Pink': 'Clear truth flows into gentle love - honest expression channeled through compassionate understanding'
      },
      'Green': {
        'Red': 'Healing love flows into passionate service - heart wisdom channeled through determined action',
        'Blue': 'Heart compassion flows into truthful expression - healing love channeled through authentic communication',
        'Yellow': 'Emotional healing flows into mental clarity - heart wisdom channeled through brilliant understanding',
        'Purple': 'Heart love flows into spiritual service - healing compassion channeled through divine wisdom',
        'Pink': 'Heart healing flows into divine love - compassionate service channeled through unconditional acceptance'
      },
      'Yellow': {
        'Red': 'Mental clarity flows into passionate manifestation - brilliant wisdom channeled through determined action',
        'Blue': 'Intellectual light flows into peaceful truth - mental clarity channeled through honest communication',
        'Green': 'Brilliant wisdom flows into healing service - mental clarity channeled through heart-centered action',
        'Purple': 'Intellectual understanding flows into spiritual wisdom - mental clarity channeled through divine knowing',
        'Orange': 'Mental brightness flows into creative expression - intellectual clarity channeled through joyful creation'
      },
      'Purple': {
        'Red': 'Divine wisdom flows into earthly service - spiritual knowing channeled through passionate action',
        'Blue': 'Mystical understanding flows into truthful expression - divine wisdom channeled through authentic voice',
        'Green': 'Spiritual love flows into healing service - divine compassion channeled through heart-centered action',
        'Yellow': 'Cosmic consciousness flows into mental clarity - spiritual wisdom channeled through brilliant understanding',
        'White': 'Divine knowing flows into pure light - mystical consciousness channeled through spiritual illumination'
      },
      'White': {
        'Red': 'Pure light flows into earthly vitality - divine energy channeled through grounding strength',
        'Blue': 'Pure truth flows into peaceful wisdom - divine light channeled through calm communication',
        'Green': 'Pure love flows into healing compassion - divine light channeled through heart wisdom',
        'Yellow': 'Pure wisdom flows into mental clarity - divine light channeled through intellectual understanding',
      },
      'Orange': {
        'Red': 'Creative joy flows into passionate action - artistic expression channeled through determined service',
        'Blue': 'Creative truth flows into peaceful wisdom - artistic expression channeled through calm communication',
        'Green': 'Creative love flows into healing service - artistic expression channeled through heart-centered action',
        'Yellow': 'Creative clarity flows into mental brilliance - artistic expression channeled through intellectual understanding',
      },
      'Pink': {
        'Red': 'Gentle love flows into passionate service - compassionate care channeled through determined action',
        'Blue': 'Gentle truth flows into peaceful wisdom - compassionate expression channeled through calm communication',
        'Green': 'Gentle healing flows into heart wisdom - compassionate care channeled through heart-centered action',
        'Yellow': 'Gentle clarity flows into mental brilliance - compassionate expression channeled through intellectual understanding',
        'Purple': 'Gentle love flows into spiritual service - compassionate care channeled through divine wisdom',
        'White': 'Gentle love flows into pure light - compassionate care channeled through spiritual illumination',
        'Gold': 'Gentle love flows into divine wisdom - compassionate care channeled through enlightened understanding',
        'Indigo': 'Gentle love flows into intuitive wisdom - compassionate care channeled through psychic insight',
        'Silver': 'Gentle love flows into lunar wisdom - compassionate care channeled through intuitive understanding',
        'Gray': 'Gentle love flows into balanced wisdom - compassionate care channeled through adaptable understanding',
      },
      'Gold': {
        'Red': 'Divine wisdom flows into earthly service - spiritual knowing channeled through passionate action',
        'Blue': 'Divine truth flows into peaceful wisdom - enlightened understanding channeled through calm communication',
        'Green': 'Divine love flows into healing service - enlightened compassion channeled through heart-centered action',
        'Yellow': 'Divine clarity flows into mental brilliance - enlightened wisdom channeled through intellectual understanding',
        'Purple': 'Divine knowing flows into mystical understanding - enlightened consciousness channeled through spiritual insight',
        'White': 'Divine light flows into pure energy - enlightened wisdom channeled through spiritual illumination',
        'Pink': 'Divine love flows into gentle care - enlightened compassion channeled through compassionate care',
      }
        
    };
    
    return flowPatterns[primary]?.[secondary] || flowPatterns[secondary]?.[primary] || 
           `${primary} consciousness flows into ${secondary} expression - divine soul energy channeled through authentic spiritual service`;
  };

  const getBalancingRecommendations = (primary: string, secondary: string): string => {
    const balancingGuidance: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Balance passion with meditation - physical exercise followed by calming breathwork and truthful journaling',
        'Green': 'Balance action with compassion - grounding exercises followed by heart-opening yoga and nature connection',
        'Yellow': 'Balance strength with wisdom - weightlifting or martial arts followed by study and intellectual pursuits',
        'Purple': 'Balance earthly work with spiritual practice - physical service followed by meditation and prayer',
        'Orange': 'Balance power with creativity - strength training followed by artistic expression and joyful creation'
      },
      'Blue': {
        'Red': 'Balance communication with action - vocal exercises followed by physical movement and passionate pursuits',
        'Green': 'Balance truth with love - honest expression followed by heart-centered healing and compassionate service',
        'Yellow': 'Balance voice with mind - singing or chanting followed by intellectual study and mental clarity practices',
        'Purple': 'Balance authentic speaking with spiritual silence - truthful communication followed by mystical meditation',
        'Pink': 'Balance clear expression with gentle love - honest dialogue followed by compassionate listening and heart work'
      },
      'Green': {
        'Red': 'Balance healing with vitality - heart-opening meditation followed by energizing physical activity',
        'Blue': 'Balance love with truth - compassionate service followed by honest communication and authentic expression',
        'Yellow': 'Balance emotion with intellect - heart meditation followed by mental study and clarity practices',
        'Purple': 'Balance human love with divine love - emotional healing followed by spiritual contemplation',
        'Pink': 'Balance healing service with self-love - caring for others followed by self-compassion and inner nurturing'
      },
      'Yellow': {
        'Red': 'Balance mental work with physical action - intellectual study followed by vigorous exercise and grounding',
        'Blue': 'Balance thinking with speaking - mental clarity practices followed by truthful communication and expression',
        'Green': 'Balance mind with heart - intellectual pursuits followed by emotional healing and compassionate service',
        'Purple': 'Balance human wisdom with divine wisdom - mental study followed by spiritual contemplation and mystical practice',
        'Orange': 'Balance intellect with creativity - analytical work followed by artistic expression and joyful creation'
      },
      'Purple': {
        'Red': 'Balance spiritual practice with earthly service - meditation followed by passionate action and material work',
        'Blue': 'Balance mystical silence with truthful expression - contemplative prayer followed by authentic communication',
        'Green': 'Balance divine love with human service - spiritual communion followed by healing work and compassionate action',
        'Yellow': 'Balance cosmic consciousness with practical wisdom - mystical meditation followed by intellectual study',
        'White': 'Balance divine communion with pure service - deep spiritual practice followed by selfless action and light work'
      }
    };
    
    return balancingGuidance[primary]?.[secondary] || balancingGuidance[secondary]?.[primary] || 
           `Balance ${primary} energy with ${secondary} expression - alternate between focused spiritual practice and authentic soul service`;
  };

  const getOptimalEnergyTimes = (color: string): string => {
    const times: Record<string, string> = {
      'Red': 'Dawn and early morning hours when life force is strongest. Physical activity and grounding work are most effective during sunrise.',
      'Orange': 'Late morning to early afternoon when creative energy peaks. Best time for artistic work and emotional expression.',
      'Yellow': 'Midday when solar energy is strongest. Optimal for intellectual work, decision-making, and personal power practices.',
      'Green': 'Late afternoon and early evening when heart energy is most receptive. Perfect for healing work and compassionate activities.',
      'Blue': 'Evening hours when communication flows most clearly. Ideal time for truth-telling and authentic expression.',
      'Purple': 'Night hours and pre-dawn when spiritual veils are thinnest. Best for meditation, psychic work, and mystical practices.',
      'Gold': 'Sacred hours of dawn and dusk when divine energy is most accessible. Optimal for spiritual practices and wisdom work.',
      'White': 'All hours carry equal potential as this energy transcends time. Particularly strong during meditation and prayer.',
      'Pink': 'Heart-opening hours of sunrise and sunset when love energy is most expansive. Perfect for compassion practices.'
    };
    return times[color] || times['Purple'];
  };

  const getCompatibleEnergies = (color: string): string => {
    const compatible: Record<string, string> = {
      'Red': 'Orange (creativity), Yellow (personal power), and Earth energies. Compatible with other grounding and manifestation forces.',
      'Orange': 'Red (passion), Yellow (joy), and Water energies. Harmonizes with creative and emotional expression energies.',
      'Yellow': 'Orange (creativity), Green (balance), and Fire energies. Resonates with intellectual and solar-powered energies.',
      'Green': 'Blue (communication), Pink (love), and Earth energies. Harmonizes with heart-centered and healing energies.',
      'Blue': 'Green (healing), Purple (spirituality), and Air energies. Compatible with truth and communication frequencies.',
      'Purple': 'Blue (truth), White (purity), and Cosmic energies. Resonates with spiritual and mystical frequencies.',
      'Gold': 'Compatible with high-frequency spiritual energies.',
      'White': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      'Pink': 'Green (healing), White (purity), and Heart energies. Compatible with all love-based frequencies.',
      'Silver': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      'Gray': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      'Black': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      
    };
    const additionalCompatible: Record<string, string> = {
      'Crimson': 'Maroon (deep earth), Red (life force), and Fire energies. Resonates with intense manifestation and warrior spirit frequencies.',
      'Magenta': 'Pink (divine love), Purple (mysticism), and Cosmic feminine energies. Compatible with soul creativity and divine rebellion frequencies.',
      'Aqua': 'Turquoise (healing communication), Blue (truth), and Water energies. Harmonizes with soul voice and mystical truth frequencies.',
      'Navy': 'Indigo (wisdom), Blue (communication), and Deep water energies. Compatible with profound knowledge and soul memory frequencies.',
      'Lime': 'Green (healing), Yellow (renewal), and Fresh earth energies. Resonates with growth acceleration and emotional cleansing frequencies.',
      'Maroon': 'Red (passion), Brown (earth), and Stable earth energies. Compatible with grounded strength and enduring wisdom frequencies.',
      'Chocolate': 'Brown (earth), Green (natural), and Deep earth energies. Harmonizes with practical spirituality and natural healing frequencies.',
      'Beige': 'Brown (earth), White (peace), and Gentle earth energies. Compatible with subtle wisdom and peaceful stability frequencies.',
      'Tan': 'Brown (earth), Yellow (balance), and Natural earth energies. Resonates with earth connection and practical wisdom frequencies.'
    };
    
    return compatible[color] || additionalCompatible[color] || 'Divine soul frequency - harmonizes with cosmic consciousness and authentic spiritual vibrations.';
  };
  
  // Function to generate aura visualization with colored clouds
  // Function to process the uploaded image with aura colors


  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 150, g: 150, b: 200 };
  };

  // Function to extract all 4 distinct aura colors from analysis result
  const extractAllAuraColors = (auraData: AuraAnalysisResult) => {
    // Start with available spectrum colors
    const spectrum = auraData.auraColorSpectrum || [auraData.dominantColor, auraData.secondaryColor];
    
    // Define restricted 12-color palette only
    const colorPalette = [
      '#8A2BE2', '#4B0082', '#0000FF', '#008000', // Violet, Indigo, Blue, Green
      '#FFFF00', '#FFA500', '#FF0000', '#FFFFFF', '#ffc0cb', // Yellow, Orange, Red, White, pink
      '#000000', '#FFD700', '#C0C0C0', '#8B4513', '#808080',  // Black, Gold, Silver, Brown, gray
    ];
    
    // Collect available colors from spectrum
    const availableColors: string[] = [];
    for (let i = 0; i < spectrum.length; i++) {
      const color = getAccurateColorCode(spectrum[i]);
      if (color && !availableColors.includes(color)) {
        availableColors.push(color);
      }
    }
    
    // Fill remaining slots with palette colors that aren't already used
    let paletteIndex = 0;
    while (availableColors.length < 4 && paletteIndex < colorPalette.length) {
      const paletteColor = colorPalette[paletteIndex];
      if (!availableColors.includes(paletteColor)) {
        availableColors.push(paletteColor);
      }
      paletteIndex++;
    }
    
    // Ensure we have exactly 4 unique colors
    const uniqueColors = Array.from(new Set(availableColors)).slice(0, 4);
    
    // If still missing colors, add remaining palette colors
    while (uniqueColors.length < 4) {
      for (const paletteColor of colorPalette) {
        if (!uniqueColors.includes(paletteColor)) {
          uniqueColors.push(paletteColor);
          break;
        }
      }
    }
    
    return {
      thinking: uniqueColors[0],    // Crown energy - first unique color
      receiving: uniqueColors[1],   // Receiving energy - second unique color  
      giving: uniqueColors[2],      // Giving energy - third unique color
      personality: uniqueColors[3]  // Personality energy - fourth unique color
    };
  };

  // Function to adjust color brightness for distinction

  // Function to convert hex color back to color name
  const getColorNameFromHex = (hex: string): string => {
    const colorMap: Record<string, string> = {
      '#4B0082': 'Indigo',
      '#FF4444': 'Red',
      '#32CD32': 'Green',
      '#FFD700': 'Gold',
      '#FF6600': 'Orange',
      '#FFFF00': 'Yellow',
      '#0000FF': 'Blue',
      '#800080': 'Purple',
      '#FFC0CB': 'Pink',
      '#FFFFFF': 'White',
      '#000000': 'Black',
      '#C0C0C0': 'Silver',
      '#808080': 'Gray',
      '#A52A2A': 'Brown'
    };
    
    // Find exact match first
    const upperHex = hex.toUpperCase();
    if (colorMap[upperHex]) {
      return colorMap[upperHex];
    }
    
    // Convert hex to RGB for approximate matching
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Find closest color by dominant component
    if (r > g && r > b) {
      if (g > 100 && b > 100) return 'Pink';
      if (g > 80 && b < 80) return 'Orange';
      return 'Red';
    }
    if (g > r && g > b) {
      if (b > 100) return 'Turquoise';
      return 'Green';
    }
    if (b > r && b > g) {
      if (r > 100) return 'Purple';
      return 'Blue';
    }
    
    // Equal components suggest neutral colors
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
      if (r > 200) return 'White';
      if (r < 80) return 'Black';
      return 'Silver';
    }
    
    return 'none'; // Default fallback
  };

  // Function to create seamless gradient blending between all colors for smooth merging
  function createSeamlessColorBlending({ ctx, width, height, colors, energyLevel, seededRandom }: { ctx: CanvasRenderingContext2D; width: number; height: number; centerX: number; centerY: number; personWidth: number; personHeight: number; colors: any; energyLevel: number; seededRandom: () => number; }): void {
        // Use multiply blend mode for natural color merging
        ctx.globalCompositeOperation = 'source-over';

        // ENHANCED horizontal gradient - RECEIVING (left) to GIVING (right) with stronger zone presence
        const horizontalGradient = ctx.createLinearGradient(0, 0, width, 0);
        horizontalGradient.addColorStop(0, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.55)`); // Stronger receiving energy on LEFT
        horizontalGradient.addColorStop(0.25, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.45)`);
        horizontalGradient.addColorStop(0.50, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.20)`); // Transition zone
        horizontalGradient.addColorStop(0.75, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.45)`);
        horizontalGradient.addColorStop(1, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.55)`); // Stronger giving energy on RIGHT

        ctx.fillStyle = horizontalGradient;
        ctx.fillRect(0, 0, width, height);

        // ENHANCED vertical gradient for thinking energy (focused at top)
        const verticalGradient = ctx.createLinearGradient(0, 0, 0, height * 0.35);
        verticalGradient.addColorStop(0, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, 0.50)`); // Stronger thinking energy ABOVE
        verticalGradient.addColorStop(0.4, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, 0.35)`);
        verticalGradient.addColorStop(0.8, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, 0.15)`);
        verticalGradient.addColorStop(1, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, 0.05)`);

        ctx.fillStyle = verticalGradient;
        ctx.fillRect(0, 0, width, height * 0.35);

        // ENHANCED vertical gradient for personality energy (focused at bottom)  
        const personalityGradient = ctx.createLinearGradient(0, height * 0.65, 0, height);
        personalityGradient.addColorStop(0, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0.05)`);
        personalityGradient.addColorStop(0.3, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0.20)`);
        personalityGradient.addColorStop(0.7, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0.40)`);
        personalityGradient.addColorStop(1, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0.55)`); // Stronger personality energy at BOTTOM

        ctx.fillStyle = personalityGradient;
        ctx.fillRect(0, height * 0.65, width, height * 0.35);

        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    }

  // Function to create prominent thinking energy particle above person's head as single glowing ball
  function createThinkingEnergyParticle(ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        personHeight: number,
        thinkingColor: { r: number; g: number; b: number; },
        energyLevel: number,
        imageWidth: number = 800,
        imageHeight: number = 600) {
        // Position thinking energy ONLY above person's head - single location only
        const particleX = centerX;
        const particleY = centerY - personHeight * 0.75; // Higher above head for better visibility


        // UNIFORM PARTICLE SIZING: Fixed sizing for all 1600x900 images for consistent appearance
        const STANDARD_HEIGHT = 900;
        const baseRadius = STANDARD_HEIGHT * 0.06; // Fixed 54px radius for all images


        // Use additive blending for bright glowing effect
        ctx.globalCompositeOperation = 'overlay';

        // Create ultra-bright outer glow halo for maximum visibility
        const ultraGlow = ctx.createRadialGradient(
            particleX, particleY, 0,
            particleX, particleY, baseRadius * 6
        );
        ultraGlow.addColorStop(0, `rgba(255, 255, 255, 1)`); // Bright white center for maximum visibility
        ultraGlow.addColorStop(0.05, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        ultraGlow.addColorStop(0.15, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        ultraGlow.addColorStop(0.35, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        ultraGlow.addColorStop(0.6, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        ultraGlow.addColorStop(1, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);

        ctx.fillStyle = ultraGlow;
        ctx.beginPath();
        ctx.arc(particleX, particleY, baseRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Bright middle glow layer for enhanced visibility
        const middleGlow = ctx.createRadialGradient(
            particleX, particleY, 0,
            particleX, particleY, baseRadius * 1
        );
        middleGlow.addColorStop(0, `rgba(255, 255, 255, 1)`); // Bright white center
        middleGlow.addColorStop(0.1, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        middleGlow.addColorStop(0.3, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        middleGlow.addColorStop(0.6, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        middleGlow.addColorStop(1, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);

        ctx.fillStyle = middleGlow;
        ctx.beginPath();
        ctx.arc(particleX, particleY, baseRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Ultra-bright inner core - maximum visibility
        const innerCore = ctx.createRadialGradient(
            particleX, particleY, 0,
            particleX, particleY, baseRadius * 0.5
        );
        innerCore.addColorStop(0, `rgba(255, 255, 255, 1)`); // Pure white center
        innerCore.addColorStop(0.1, `rgba(255, 255, 255, 1)`); // Extended white core
        innerCore.addColorStop(0.3, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        innerCore.addColorStop(0.7, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);
        innerCore.addColorStop(1, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0)`);

        ctx.fillStyle = innerCore;
        ctx.beginPath();
        ctx.arc(particleX, particleY, baseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Prominent sparkle effects for enhanced visibility
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const sparkleDistance = baseRadius * (3.2 + Math.sin(angle * 4) * 0.5);
            const sparkleX = particleX + Math.cos(angle) * sparkleDistance;
            const sparkleY = particleY + Math.sin(angle) * sparkleDistance;
            const sparkleRadius = 6 + (energyLevel * 1.2);

            const sparkle = ctx.createRadialGradient(
                sparkleX, sparkleY, 0,
                sparkleX, sparkleY, sparkleRadius
            );
            sparkle.addColorStop(0, `rgba(255, 255, 255, 1)`);
            sparkle.addColorStop(0.2, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 1)`);
            sparkle.addColorStop(0.5, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0.8)`);
            sparkle.addColorStop(1, `rgba(${thinkingColor.r}, ${thinkingColor.g}, ${thinkingColor.b}, 0.6)`);

            ctx.fillStyle = sparkle;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    }

  // Function to create DISTINCT color zones with NO blending or mixing
  const createSmokeyAuraParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: {
      thinkingRGB: { r: number, g: number, b: number },
      receivingRGB: { r: number, g: number, b: number },
      givingRGB: { r: number, g: number, b: number },
      personalityRGB: { r: number, g: number, b: number }
    },
    energyLevel: number,
    seed?: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create dense, cloudy, non-transparent aura visualization
    createDenseCloudyAura(ctx, width, height, centerX, centerY, colors, energyLevel);
  };

  // Function to create ZONE-SPECIFIC DENSE SMOKEY AURA with proper energy positioning
  const createDenseCloudyAura = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    colors: {
      thinkingRGB: { r: number, g: number, b: number },
      receivingRGB: { r: number, g: number, b: number },
      givingRGB: { r: number, g: number, b: number },
      personalityRGB: { r: number, g: number, b: number }
    },
    energyLevel: number
  ) => {
    // Person protection area - face should be clearly visible (increased for better visibility)
    const personRadius = Math.min(width, height) * 0.25;
    
    console.log("Creating zone-specific dense smokey aura with proper energy positioning...");
    
    // Set heavy blur for natural smokey effect (slightly more blurred)
    ctx.filter = 'blur(30px)';
    
    // LEFT ZONE - RECEIVING COLOR ONLY (dense smokey effect to edges)
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * width * 0.5; // Strictly left half
      const y = Math.random() * height;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Skip if too close to person's face
      if (distance < personRadius) continue;
      
      // Larger particles near edges for dense coverage
      const edgeDistance = Math.min(x, width * 0.5 - x);
      const radius = 60 + Math.random() * 200 + (edgeDistance < 50 ? 80 : 0); // Extra large near edges
      const opacity = 0.3 + Math.random() * 0.4; // Dense opacity
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, ${opacity})`);
      gradient.addColorStop(0.4, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, ${opacity * 0.7})`);
      gradient.addColorStop(0.8, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // RIGHT ZONE - GIVING COLOR ONLY (dense smokey effect to edges, more to the right)
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const x = width * 0.65 + Math.random() * width * 0.35; // More to the right side (65%-100%)
      const y = Math.random() * height;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Skip if too close to person's face
      if (distance < personRadius) continue;
      
      // Larger particles near edges for dense coverage
      const edgeDistance = Math.min(x - width * 0.65, width - x);
      const radius = 60 + Math.random() * 200 + (edgeDistance < 50 ? 80 : 0); // Extra large near edges
      const opacity = 0.3 + Math.random() * 0.4; // Dense opacity
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, ${opacity})`);
      gradient.addColorStop(0.4, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, ${opacity * 0.7})`);
      gradient.addColorStop(0.8, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // TOP ZONE - THINKING COLOR ONLY (dense smokey effect to top edge)
    ctx.save();
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.4; // Top 40% of image
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Skip if too close to person's face
      if (distance < personRadius) continue;
      
      // Larger particles near top edge for dense coverage
      const radius = 60 + Math.random() * 180 + (y < 50 ? 100 : 0); // Extra large near top edge
      const opacity = 0.3 + Math.random() * 0.4; // Dense opacity
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, ${opacity})`);
      gradient.addColorStop(0.4, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, ${opacity * 0.7})`);
      gradient.addColorStop(0.8, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // EDGE ZONES - PERSONALITY COLOR ONLY (around all edges of image)
    ctx.save();
    // Top edge
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * 80; // Top edge only
      const radius = 80 + Math.random() * 120;
      const opacity = 0.2 + Math.random() * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Bottom edge
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = height - Math.random() * 80; // Bottom edge only
      const radius = 80 + Math.random() * 120;
      const opacity = 0.2 + Math.random() * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Left edge
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 80; // Left edge only
      const y = Math.random() * height;
      const radius = 80 + Math.random() * 120;
      const opacity = 0.2 + Math.random() * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Right edge
    for (let i = 0; i < 10; i++) {
      const x = width - Math.random() * 80; // Right edge only
      const y = Math.random() * height;
      const radius = 80 + Math.random() * 120;
      const opacity = 0.2 + Math.random() * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${colors.personalityRGB.r}, ${colors.personalityRGB.g}, ${colors.personalityRGB.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // Reset filter
    ctx.filter = 'none';
    
    console.log("Zone-specific dense smokey aura with proper energy positioning completed");
  };

  // Function to create DISTINCT color zones with NO mixing between colors (OLD VERSION - for reference)



  // Function to create clear face area ensuring complete visibility of facial features
  function createFaceClearanceZone(ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        personWidth: number,
        personHeight: number): void {
        // Define enhanced face clearance area for better visibility
        const faceClearanceX = centerX - personWidth * 1.0; // Increased from 0.8 to 1.0
        const faceClearanceY = centerY - personHeight * 0.7; // Increased from 0.5 to 0.7
        const faceClearanceWidth = personWidth * 1.4; // Increased from 1.0 to 1.4
        const faceClearanceHeight = personHeight * 1.6; // Increased from 1.2 to 1.6

        // Use destination-over to ensure original image shows through in face area
        ctx.globalCompositeOperation = 'destination-over';

        // Create a subtle gradient that fades smoke away from face area
        const clearanceGradient = ctx.createRadialGradient(
            centerX, centerY - personHeight * 1.4, // Face center
            Math.min(faceClearanceWidth, faceClearanceHeight) * 1.3, // Inner clear radius
            centerX, centerY - personHeight * 0.5, // Face center
            Math.min(faceClearanceWidth, faceClearanceHeight) * 0.8 // Outer fade radius
        );

        clearanceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)'); // Subtle clearing in center
        clearanceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)'); // Light fade
        clearanceGradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // No effect at edges

        ctx.fillStyle = clearanceGradient;
        ctx.fillRect(faceClearanceX, faceClearanceY, faceClearanceWidth, faceClearanceHeight);

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    }

  // Function to create natural smoke wisps that flow around the person
  function createNaturalSmokeWisps(ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        centerX: number,
        centerY: number,
        personWidth: number,
        personHeight: number,
        colors: any,
        energyLevel: number,
        seededRandom: () => number): void {
        // Define enhanced person protection area for maximum face visibility
        const faceX = centerX - personWidth * 1.1; // Increased from 0.9 to 1.1
        const faceY = centerY - personHeight * 1.0; // Increased from 0.8 to 1.0
        const faceWidth = personWidth * 1.6; // Increased from 1.2 to 1.6
        const faceHeight = personHeight * 2.6; // Increased from 2.2 to 2.6

        // Define enhanced person protection radius for better face visibility
        const personRadius = Math.min(personWidth, personHeight) * 0.6; // Increased from 0.4 to 0.6

        // Create smooth gradient-based aura field like reference image
        // Create smooth gradient-based aura without particle patches
        createDirectionalGradientZones(ctx, width, height, centerX, centerY, personWidth, personHeight, colors);

        // Create 2-Zone Energy Map (excluding thinking zone and personality zone)
        const smokeZones = [
            {
                color: colors.receivingRGB,
                startX: centerX + personWidth * 0.6,
                startY: centerY,
                direction: { x: 1, y: 0 },
                spread: height * 1.2,
                name: 'receiving_right',
                density: 30, // Increased density for better right-side coverage
                zone: 'right' // Receiving energy on right side
            },
            {
                color: colors.givingRGB,
                startX: centerX - personWidth * 0.6,
                startY: centerY,
                direction: { x: -1, y: 0 },
                spread: height * 1.2,
                name: 'giving_left',
                density: 30,
                zone: 'left' // Giving energy on left side
            }
        ];

        // Skip particle-based smoke zones to avoid patchy appearance
        // All aura effects are now handled by smooth gradients above
        // Personality color completely removed from aura visualization as requested
        // Create enhanced gradient blending between all colors for seamless merging
        createSeamlessColorBlending({ ctx, width, height, centerX, centerY, personWidth, personHeight, colors, energyLevel, seededRandom });

        // Create prominent thinking energy particle above person's head with standardized sizing
        createThinkingEnergyParticle(ctx, centerX, centerY, personHeight, colors.thinkingRGB, energyLevel, width, height);
    }

  // Function to create proper layered aura system with specific order
  const createDirectionalGradientZones = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    personWidth: number,
    personHeight: number,
    colors: any
  ) => {
    // Reset to normal blending
    ctx.globalCompositeOperation = 'source-over';
    
    // Calculate natural aura dimensions around the person
    const auraRadius = Math.max(personWidth, personHeight) * 2.2;
    const innerRadius = Math.max(personWidth, personHeight) * 0.5;
    const extendedRadius = Math.max(width, height) * 0.9; // Reaches image edges
    
    // UNIFORM SIZING SYSTEM: All images are now 600x900, so use fixed measurements for consistency
    const STANDARD_WIDTH = 600;
    const STANDARD_HEIGHT = 900;
    const standardPersonRadius = Math.min(STANDARD_WIDTH, STANDARD_HEIGHT) * 0.15; // Fixed 90px radius
    const standardExtendedRadius = Math.max(STANDARD_WIDTH, STANDARD_HEIGHT) * 0.85; // Fixed 765px reach
    
    // LAYER 1: Receiving energy layer on left side (base layer)
    ctx.globalCompositeOperation = 'source-over';
    const standardReceivingRadius = Math.min(STANDARD_WIDTH, STANDARD_HEIGHT) * 0.65; // Fixed 390px radius
    const receivingLayer = ctx.createRadialGradient(
      centerX - standardPersonRadius * 0.8, centerY, 0, // LEFT side origin for receiving energy
      centerX - standardPersonRadius * 0.8, centerY, standardReceivingRadius
    );
    receivingLayer.addColorStop(0, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.1)`);
    receivingLayer.addColorStop(0.2, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.5)`);
    receivingLayer.addColorStop(0.4, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.61)`);
    receivingLayer.addColorStop(0.6, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.71)`);
    receivingLayer.addColorStop(0.8, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.66)`);
    receivingLayer.addColorStop(1, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.3)`);
    
    ctx.fillStyle = receivingLayer;
    ctx.fillRect(0, 0, width, height);
    
    // LAYER 2: Giving energy layer on right side (on top of receiving layer)
    const standardGivingRadius = Math.min(STANDARD_WIDTH, STANDARD_HEIGHT) * 0.65; // Fixed 585px radius
    const givingLayer = ctx.createRadialGradient(
      centerX + standardPersonRadius * 0.8, centerY, 0, // RIGHT side origin for giving energy
      centerX + standardPersonRadius * 0.8, centerY, standardGivingRadius
    );
    givingLayer.addColorStop(0, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.55)`);
    givingLayer.addColorStop(0.2, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.42)`);
    givingLayer.addColorStop(0.4, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.68)`);
    givingLayer.addColorStop(0.6, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.15)`);
    givingLayer.addColorStop(0.8, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.76)`);
    givingLayer.addColorStop(1, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.4)`);
    
    ctx.fillStyle = givingLayer;
    ctx.fillRect(0, 0, width, height);
    
    // LAYER 3: Enhanced horizontal gradient blending between left receiving and right giving energies
    ctx.globalCompositeOperation = 'overlay';
    
    // Create horizontal linear gradient from left (receiving) to right (giving) for seamless blending
    const horizontalBlendingGradient = ctx.createLinearGradient(0, 0, width, 0);
    
    // Start with receiving color on left, blend through center, end with giving color on right
    horizontalBlendingGradient.addColorStop(0, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.25)`); // Pure receiving on far left
    horizontalBlendingGradient.addColorStop(0.2, `rgba(${colors.receivingRGB.r}, ${colors.receivingRGB.g}, ${colors.receivingRGB.b}, 0.25)`); // Receiving dominant
    
    // Center blend zone with both colors mixed
    const centerBlend = {
      r: Math.floor((colors.receivingRGB.r * 0.5 + colors.givingRGB.r * 0.5)),
      g: Math.floor((colors.receivingRGB.g * 0.5 + colors.givingRGB.g * 0.5)),
      b: Math.floor((colors.receivingRGB.b * 0.5 + colors.givingRGB.b * 0.5))
    };
    horizontalBlendingGradient.addColorStop(0.5, `rgba(${centerBlend.r}, ${centerBlend.g}, ${centerBlend.b}, 0.29)`); // Perfect center blend
    
    horizontalBlendingGradient.addColorStop(0.8, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.55)`); // Giving dominant
    horizontalBlendingGradient.addColorStop(1, `rgba(${colors.givingRGB.r}, ${colors.givingRGB.g}, ${colors.givingRGB.b}, 0.35)`); // Pure giving on far right
    
    ctx.fillStyle = horizontalBlendingGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Additional radial blending for smoother center merge
    ctx.globalCompositeOperation = 'soft-light';
    const centerRadialBlend = ctx.createRadialGradient(
      centerX, centerY, standardPersonRadius * 0.2,
      centerX, centerY, standardPersonRadius * 2.5
    );
    centerRadialBlend.addColorStop(0, `rgba(${centerBlend.r}, ${centerBlend.g}, ${centerBlend.b}, 0.18)`);
    centerRadialBlend.addColorStop(0.5, `rgba(${centerBlend.r}, ${centerBlend.g}, ${centerBlend.b}, 0.12)`);
    centerRadialBlend.addColorStop(1, `rgba(${centerBlend.r}, ${centerBlend.g}, ${centerBlend.b}, 0.25)`);
    
    ctx.fillStyle = centerRadialBlend;
    ctx.fillRect(0, 0, width, height);
    
    // Reset blend mode for thinking layer
    ctx.globalCompositeOperation = 'source-over';
    
    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
  };

  // Helper function to create blended colors for smooth transitions
  const createBlendedColor = (color1: any, color2: any, blend: number, opacity: number): string => {
    const r = Math.round(color1.r * (1 - blend) + color2.r * blend);
    const g = Math.round(color1.g * (1 - blend) + color2.g * blend);
    const b = Math.round(color1.b * (1 - blend) + color2.b * blend);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Helper function to create multi-color gradient with smooth fading
  const createMultiColorGradient = (ctx: CanvasRenderingContext2D, colors: any[], positions: number[], opacities: number[], isLinear: boolean = true, coords?: any) => {
    let gradient;
    if (isLinear && coords) {
      gradient = ctx.createLinearGradient(coords.x1, coords.y1, coords.x2, coords.y2);
    } else if (!isLinear && coords) {
      gradient = ctx.createRadialGradient(coords.x1, coords.y1, coords.r1, coords.x2, coords.y2, coords.r2);
    } else {
      return null;
    }

    colors.forEach((color, index) => {
      const position = positions[index] || index / (colors.length - 1);
      const opacity = opacities[index] || 0.2;
      gradient.addColorStop(position, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    });

    return gradient;
  };

  // Function to create final color integration layer for maximum merging
  function createColorIntegrationLayer(ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        centerX: number,
        centerY: number,
        personWidth: number,
        personHeight: number,
        colors: any,
        energyLevel: number,
        seededRandom: () => number,
        faceX: number,
        faceY: number,
        faceWidth: number,
        faceHeight: number): void {
        // Use color-dodge blend mode for intense color merging with thinking color integration
        ctx.globalCompositeOperation = 'screen';

        // Create enhanced cross-hatching gradients with thinking color properly distributed
        const integrationGradients = [
            // Diagonal cross-gradient 1 with thinking color integration
            {
                gradient: createMultiColorGradient(
                    ctx,
                    [colors.thinkingRGB, colors.personalityRGB, colors.thinkingRGB, colors.receivingRGB, colors.personalityRGB, colors.givingRGB],
                    [0, 0.2, 0.35, 0.5, 0.75, 1],
                    [0.1, 0.06, 0.08, 0.06, 0.05, 0.04],
                    true,
                    { x1: 0, y1: 0, x2: width, y2: height }
                )
            },
            // Diagonal cross-gradient 2 with thinking color blending
            {
                gradient: createMultiColorGradient(
                    ctx,
                    [colors.givingRGB, colors.thinkingRGB, colors.personalityRGB, colors.thinkingRGB, colors.receivingRGB, colors.personalityRGB],
                    [0, 0.25, 0.4, 0.55, 0.75, 1],
                    [0.06, 0.08, 0.05, 0.07, 0.07, 0.04],
                    true,
                    { x1: width, y1: 0, x2: 0, y2: height }
                )
            },
            // Additional vertical gradient for thinking color integration
            {
                gradient: createMultiColorGradient(
                    ctx,
                    [colors.thinkingRGB, colors.givingRGB, colors.receivingRGB, colors.thinkingRGB],
                    [0, 0.4, 0.6, 1],
                    [0.09, 0.06, 0.05, 0.06],
                    true,
                    { x1: centerX, y1: 0, x2: centerX, y2: height }
                )
            }
        ];

        integrationGradients.forEach(item => {
            if (item.gradient) {
                ctx.fillStyle = item.gradient;
                ctx.fillRect(0, 0, width, height);
            }
        });

        // Reset blend mode and add final soft overlay
        ctx.globalCompositeOperation = 'overlay';

        // Create enhanced unified gradient with only 3 colors (no personality color in center)
        const unifiedGradient = createMultiColorGradient(
            ctx,
            [colors.thinkingRGB, colors.givingRGB, colors.receivingRGB, colors.thinkingRGB],
            [0, 0.35, 0.65, 1],
            [0.04, 0.03, 0.025, 0.02],
            false,
            {
                x1: centerX, y1: centerY, r1: Math.min(personWidth, personHeight) * 0.2,
                x2: centerX, y2: centerY, r2: Math.max(width, height) * 1.2
            }
        );

        if (unifiedGradient) {
            ctx.fillStyle = unifiedGradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Add final seamless integration layer with very subtle blending
        ctx.globalCompositeOperation = 'overlay';
        const finalIntegration = ctx.createRadialGradient(
            centerX, centerY, Math.min(personWidth, personHeight) * 0.6,
            centerX, centerY, Math.max(width, height) * 0.9
        );

        // Create very smooth transitions between only 3 colors (no personality color in center)
        finalIntegration.addColorStop(0, `rgba(${colors.thinkingRGB.r}, ${colors.thinkingRGB.g}, ${colors.thinkingRGB.b}, 0)`);
        finalIntegration.addColorStop(0.3, createBlendedColor(colors.thinkingRGB, colors.givingRGB, 0.3, 0.02));
        finalIntegration.addColorStop(0.5, createBlendedColor(colors.givingRGB, colors.receivingRGB, 0.5, 0.015));
        finalIntegration.addColorStop(0.7, createBlendedColor(colors.receivingRGB, colors.thinkingRGB, 0.7, 0.015));
        finalIntegration.addColorStop(1, createBlendedColor(colors.thinkingRGB, colors.givingRGB, 0.8, 0.005));

        ctx.fillStyle = finalIntegration;
        ctx.fillRect(0, 0, width, height);

        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    }

  // Function to create personality color ONLY around image edges - 300px inward with high visibility
  function createPersonalityEdgeGlow({ ctx, width, height, personalityColor, energyLevel, seededRandom, faceX, faceY, faceWidth, faceHeight }: { ctx: CanvasRenderingContext2D; width: number; height: number; personalityColor: { r: number; g: number; b: number; }; energyLevel: number; seededRandom: () => number; faceX: number; faceY: number; faceWidth: number; faceHeight: number; }): void {
        // MAXIMUM EDGE DISTANCE: 400px from edge for maximum visibility as requested
        const EDGE_DISTANCE = 400;

        // Use multiply blend mode for seamless gradient blending
        ctx.globalCompositeOperation = 'screen';

        // Top edge gradient - maximum visibility and size 
        const topGradient = ctx.createLinearGradient(0, 0, 0, EDGE_DISTANCE);
        topGradient.addColorStop(0, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.45)`);
        topGradient.addColorStop(0.25, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.38)`);
        topGradient.addColorStop(0.5, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.68)`);
        topGradient.addColorStop(0.75, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.35)`);
        topGradient.addColorStop(1, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.5)`);
        ctx.fillStyle = topGradient;
        ctx.fillRect(0, 0, width, EDGE_DISTANCE);

        // Bottom edge gradient - maximum visibility and size
        const bottomGradient = ctx.createLinearGradient(0, height - EDGE_DISTANCE, 0, height);
        bottomGradient.addColorStop(0, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 1)`);
        bottomGradient.addColorStop(0.25, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.15)`);
        bottomGradient.addColorStop(0.5, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.28)`);
        bottomGradient.addColorStop(0.75, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.38)`);
        bottomGradient.addColorStop(1, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.45)`);
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(0, height - EDGE_DISTANCE, width, EDGE_DISTANCE);

        // Left edge gradient - maximum visibility and size
        const leftGradient = ctx.createLinearGradient(0, 0, EDGE_DISTANCE, 0);
        leftGradient.addColorStop(0, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.45)`);
        leftGradient.addColorStop(0.25, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.38)`);
        leftGradient.addColorStop(0.5, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.28)`);
        leftGradient.addColorStop(0.75, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.15)`);
        leftGradient.addColorStop(1, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 1)`);
        ctx.fillStyle = leftGradient;
        ctx.fillRect(0, 0, EDGE_DISTANCE, height);

        // Right edge gradient - maximum visibility and size
        const rightGradient = ctx.createLinearGradient(width - EDGE_DISTANCE, 0, width, 0);
        rightGradient.addColorStop(0, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 1)`);
        rightGradient.addColorStop(0.25, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.15)`);
        rightGradient.addColorStop(0.5, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.58)`);
        rightGradient.addColorStop(0.75, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.38)`);
        rightGradient.addColorStop(1, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.85)`);
        ctx.fillStyle = rightGradient;
        ctx.fillRect(width - EDGE_DISTANCE, 0, EDGE_DISTANCE, height);

        // Enhanced corner gradients for seamless blending
        const cornerGradients = [
            { x: 0, y: 0, centerX: 0, centerY: 0 }, // Top-left
            { x: width - EDGE_DISTANCE, y: 0, centerX: width, centerY: 0 }, // Top-right
            { x: 0, y: height - EDGE_DISTANCE, centerX: 0, centerY: height }, // Bottom-left
            { x: width - EDGE_DISTANCE, y: height - EDGE_DISTANCE, centerX: width, centerY: height } // Bottom-right
        ];

        cornerGradients.forEach(corner => {
            const cornerRadial = ctx.createRadialGradient(
                corner.centerX, corner.centerY, 0,
                corner.centerX, corner.centerY, EDGE_DISTANCE * 1.2
            );
            cornerRadial.addColorStop(0, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.48)`);
            cornerRadial.addColorStop(0.25, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.38)`);
            cornerRadial.addColorStop(0.5, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.28)`);
            cornerRadial.addColorStop(0.75, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0.68)`);
            cornerRadial.addColorStop(1, `rgba(${personalityColor.r}, ${personalityColor.g}, ${personalityColor.b}, 0)`);
            ctx.fillStyle = cornerRadial;
            ctx.fillRect(corner.x, corner.y, EDGE_DISTANCE, EDGE_DISTANCE);
        });

        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    }

  // Function to create concentrated color zones for maximum visibility of all 4 Energy Map colors
  function createConcentratedColorDisplay({ ctx, width, height, colors, energyLevel, seededRandom, faceX, faceY, faceWidth, faceHeight }: { ctx: CanvasRenderingContext2D; width: number; height: number; colors: any; energyLevel: number; seededRandom: () => number; faceX: number; faceY: number; faceWidth: number; faceHeight: number; }): void {
        const colorZones = [
            {
                color: colors.thinkingRGB,
                zone: 'top',
                density: 30,
                getCoords: () => ({
                    x: width * 0.1 + seededRandom() * (width * 0.8), // Match main zone restrictions
                    y: seededRandom() * (height * 0.35) // Limited to top 35% like main zones
                })
            },
            {
                color: colors.receivingRGB,
                zone: 'left',
                density: 40,
                getCoords: () => ({
                    x: seededRandom() * (width * 0.45), // LEFT side - strengthened restriction to 45%
                    y: height * 0.15 + seededRandom() * (height * 0.7) // Matches main zone Y range
                })
            },
            {
                color: colors.givingRGB,
                zone: 'right',
                density: 60,
                getCoords: () => ({
                    x: width * 0.55 + seededRandom() * (width * 0.45), // RIGHT side - strengthened restriction from 55%
                    y: height * 0.15 + seededRandom() * (height * 0.7) // Matches main zone Y range
                })
            },
        ];

        colorZones.forEach(zone => {
            const totalParticles = zone.density + Math.floor(energyLevel * 6);

            for (let i = 0; i < totalParticles; i++) {
                const coords = zone.getCoords();

                // Avoid face area
                const inFaceArea = coords.x >= faceX && coords.x <= faceX + faceWidth &&
                    coords.y >= faceY && coords.y <= faceY + faceHeight;

                if (!inFaceArea) {
                    // Fixed consistent sizing for all images regardless of original dimensions
                    const sizeFactor = 1.0; // Fixed factor for uniform appearance
                    const smokeSize = 120 + seededRandom() * 60; // Consistent particle size 120-180px
                    const smokeOpacity = 0.01 + seededRandom() * 0.25; // Higher opacity 0.35-0.60 for better visibility

                    drawNaturalSmoke(ctx, coords.x, coords.y, smokeSize, zone.color, smokeOpacity, seededRandom() * 0.9);
                }
            }
        });
    }



  // Function to create full-image smoke base coverage with proper transparency
  function createFullImageSmokeBase(ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        colors: any,
        energyLevel: number,
        seededRandom: () => number,
        faceX: number,
        faceY: number,
        faceWidth: number,
        faceHeight: number) {
        // Adaptive density based on canvas size for proper visualization
        const canvasArea = width * height;
        const baseArea = 1440000; // 1200x1200 reference area
        const densityMultiplier = Math.sqrt(canvasArea / baseArea);
        const baseSmokeDensity = Math.floor((1800 + energyLevel * 150) * densityMultiplier);
        const allColors = [colors.thinkingRGB, colors.receivingRGB, colors.givingRGB, colors.personalityRGB];

        // UNIFORM SMOKE LAYERS: Fixed sizing for all 1600x900 images to ensure consistent appearance
        const STANDARD_WIDTH = 1600;
        const STANDARD_HEIGHT = 900;
        const smokeLayers = [
            { density: baseSmokeDensity * 0.4, sizeRange: [144, 288], opacity: [0.06, 0.12] }, // Large background layer - fixed 144-288px
            { density: baseSmokeDensity * 0.3, sizeRange: [126, 216], opacity: [0.08, 0.12] }, // Medium layer - fixed 126-216px
            { density: baseSmokeDensity * 0.5, sizeRange: [108, 162], opacity: [0.06, 0.12] } // Detail layer - fixed 108-162px
        ];

        smokeLayers.forEach(layer => {
            // Create equal distribution for each of the 4 colors
            for (let colorIndex = 0; colorIndex < 4; colorIndex++) {
                const colorDensity = Math.floor(layer.density / 4);
                const smokeColor = allColors[colorIndex];

                for (let i = 0; i < colorDensity; i++) {
                    const smokeX = seededRandom() * width;
                    const smokeY = seededRandom() * height;

                    // Skip thinking color if not in top 20% of image - CRITICAL FIX
                    if (colorIndex === 0 && smokeY >= height * 0.2) {
                        continue;
                    }

                    // Skip personality color completely - handled separately by edge glow
                    if (colorIndex === 3) {
                        continue;
                    }

                    // Avoid face area
                    const inFaceArea = smokeX >= faceX && smokeX <= faceX + faceWidth &&
                        smokeY >= faceY && smokeY <= faceY + faceHeight;

                    if (!inFaceArea) {
                        const smokeSize = layer.sizeRange[0] + seededRandom() * (layer.sizeRange[1] - layer.sizeRange[0]);
                        const smokeOpacity = layer.opacity[0] + seededRandom() * (layer.opacity[1] - layer.opacity[0]);

                        drawNaturalSmoke(ctx, smokeX, smokeY, smokeSize, smokeColor, smokeOpacity, seededRandom() * 0.6);
                    }
                }
            }
        });
    }

  // Function to create dense perimeter smoke with color-specific zones
  function createPerimeterSmoke({ ctx, width, height, colors, energyLevel, seededRandom, faceX, faceY, faceWidth, faceHeight }: { ctx: CanvasRenderingContext2D; width: number; height: number; colors: any; energyLevel: number; seededRandom: () => number; faceX: number; faceY: number; faceWidth: number; faceHeight: number; }): void {
        const perimeterDensity = 180 + Math.floor(energyLevel * 60); // Dramatically increased density


        // Assign specific colors to specific zones - EXCLUDE personality color from perimeter
        const colorZones = [
            {
                name: 'top',
                color: colors.thinkingRGB,
                coords: () => ({ 
                  x: width * 0.1 + seededRandom() * (width * 0.8), // Match zone restrictions
                  y: seededRandom() * height * 0.35 // Limited to top 35%
                })
            },
            {
                name: 'left', // Note: This was incorrectly labeled 'right' but positioned left
                color: colors.receivingRGB,
                coords: () => ({ 
                  x: seededRandom() * width * 0.45, // LEFT side - receiving energy, strengthened
                  y: height * 0.15 + seededRandom() * (height * 0.7) // Match main zone Y range
                })
            },
            {
                name: 'right', // Note: This was incorrectly labeled 'left' but positioned right
                color: colors.givingRGB,
                coords: () => ({ 
                  x: width * 0.55 + seededRandom() * (width * 0.45), // RIGHT side - giving energy, strengthened
                  y: height * 0.15 + seededRandom() * (height * 0.7) // Match main zone Y range
                })
            }
        ];

        colorZones.forEach(zone => {
            const zoneDensity = Math.floor(perimeterDensity / 4);

            for (let i = 0; i < zoneDensity; i++) {
                const coords = zone.coords();
                const smokeX = coords.x;
                const smokeY = coords.y;

                // Avoid face area
                const inFaceArea = smokeX >= faceX && smokeX <= faceX + faceWidth &&
                    smokeY >= faceY && smokeY <= faceY + faceHeight;

                if (!inFaceArea) {
                    const smokeSize = 1 + seededRandom() * 10; // Smaller particles
                    const smokeOpacity = 0.002 + seededRandom() * 0.05; // Increased by 20% from 0.04 and 0.08

                    drawNaturalSmoke(ctx, smokeX, smokeY, smokeSize, zone.color, smokeOpacity, seededRandom() * 0.4);
                }
            }
        });
    }

  // Function to create dedicated edge coverage ensuring smoke reaches all borders
  function createEdgeCoverage({ ctx, width, height, colors, energyLevel, seededRandom, faceX, faceY, faceWidth, faceHeight }: { ctx: CanvasRenderingContext2D; width: number; height: number; colors: any; energyLevel: number; seededRandom: () => number; faceX: number; faceY: number; faceWidth: number; faceHeight: number; }): void {
        const allColors = [colors.thinkingRGB, colors.receivingRGB, colors.givingRGB, colors.personalityRGB];
        const edgeThickness = 80; // How far from edge to create smoke


        // Create smoke strips along each edge
        const edges = [
            { name: 'top', coords: () => ({ x: seededRandom() * width, y: seededRandom() * edgeThickness }) },
            { name: 'right', coords: () => ({ x: width - seededRandom() * edgeThickness, y: seededRandom() * height }) },
            { name: 'bottom', coords: () => ({ x: seededRandom() * width, y: height - seededRandom() * edgeThickness }) },
            { name: 'left', coords: () => ({ x: seededRandom() * edgeThickness, y: seededRandom() * height }) }
        ];

        edges.forEach((edge, edgeIndex) => {
            // Only use first 3 colors, skip personality color (index 3)
            const availableColors = [colors.thinkingRGB, colors.receivingRGB, colors.givingRGB];
            const edgeColor = availableColors[edgeIndex % 3];
            const edgeDensity = 25 + Math.floor(energyLevel * 8);

            for (let i = 0; i < edgeDensity; i++) {
                const coords = edge.coords();
                const smokeX = coords.x;
                const smokeY = coords.y;

                // Check if not in face area
                const inFaceArea = smokeX >= faceX && smokeX <= faceX + faceWidth &&
                    smokeY >= faceY && smokeY <= faceY + faceHeight;

                if (!inFaceArea) {
                    const smokeSize = 10 + seededRandom() * 45;
                    const smokeOpacity = 0.036 + seededRandom() * 0.072; // Increased by 20% from 0.03 and 0.06

                    drawNaturalSmoke(ctx, smokeX, smokeY, smokeSize, edgeColor, smokeOpacity, seededRandom() * 0.5);
                }
            }
        });

        // Add corner coverage to ensure complete border coverage - exclude personality color
        const corners = [
            { x: 0, y: 0, color: colors.thinkingRGB },
            { x: width, y: 0, color: colors.receivingRGB },
            { x: width, y: height, color: colors.givingRGB },
            { x: 0, y: height, color: colors.thinkingRGB }
        ];

        corners.forEach(corner => {
            const cornerDensity = 15;
            for (let i = 0; i < cornerDensity; i++) {
                const smokeX = corner.x + (seededRandom() - 0.5) * 120;
                const smokeY = corner.y + (seededRandom() - 0.5) * 120;

                // Clamp to image bounds
                const clampedX = Math.max(0, Math.min(width, smokeX));
                const clampedY = Math.max(0, Math.min(height, smokeY));

                const inFaceArea = clampedX >= faceX && clampedX <= faceX + faceWidth &&
                    clampedY >= faceY && clampedY <= faceY + faceHeight;

                if (!inFaceArea) {
                    const smokeSize = 20 + seededRandom() * 40;
                    const smokeOpacity = 0.04 + seededRandom() * 0.07;

                    drawNaturalSmoke(ctx, clampedX, clampedY, smokeSize, corner.color, smokeOpacity, seededRandom() * 0.6);
                }
            }
        });
    }

  // Function to draw natural smoke particles with enhanced visibility
  const drawNaturalSmoke = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rgb: { r: number, g: number, b: number },
    opacity: number,
    progress: number
  ) => {
    // Create multiple layered smoke effects for dense, mystical appearance
    const smokeLayers = [
      { sizeMultiplier: 1.2, opacityMultiplier: 0.3, blur: 100 },     // Main dense layer
      { sizeMultiplier: 0.8, opacityMultiplier: 0.5, blur: 100 },     // Core bright layer
      { sizeMultiplier: 1.1, opacityMultiplier: 0.5, blur: 100 }      // Outer haze layer
    ];
    
    const smokeR = rgb.r;
    const smokeG = rgb.g;
    const smokeB = rgb.b;
    
    smokeLayers.forEach(layer => {
      const layerSize = size * layer.sizeMultiplier;
      const layerOpacity = Math.min(0.35, opacity * 0.2 * layer.opacityMultiplier); // Much higher opacity
      
      // Apply blur for atmospheric effect
      if (layer.blur > 0) {
        ctx.filter = `blur(${layer.blur}px)`;
      }
      
      // Create dense smoke gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
      gradient.addColorStop(0, `rgba(${smokeR}, ${smokeG}, ${smokeB}, ${layerOpacity})`);
      gradient.addColorStop(0.3, `rgba(${smokeR}, ${smokeG}, ${smokeB}, ${layerOpacity * 0.85})`);
      gradient.addColorStop(0.6, `rgba(${smokeR}, ${smokeG}, ${smokeB}, ${layerOpacity * 0.5})`);
      gradient.addColorStop(0.9, `rgba(${smokeR}, ${smokeG}, ${smokeB}, ${layerOpacity * 0.2})`);
      gradient.addColorStop(1, `rgba(${smokeR}, ${smokeG}, ${smokeB}, 0.2)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, layerSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset filter
      ctx.filter = 'none';
    });
    
    // Add dense wispy tendrils for mystical billowing effect
    if (size > 35) {
      const tendrilCount = 3 + Math.floor(size / 40);
      for (let t = 0; t < tendrilCount; t++) {
        const tendrilAngle = (t / tendrilCount) * Math.PI * 2 + progress * Math.PI * 0.3;
        const tendrilLength = size * (0.8 + Math.sin(progress * Math.PI * 4) * 0.3);
        const tendrilX = x + Math.cos(tendrilAngle) * tendrilLength;
        const tendrilY = y + Math.sin(tendrilAngle) * tendrilLength;
        const tendrilSize = size * (0.6 + Math.sin(progress * Math.PI * 6) * 0.2);
        
        const tendrilGradient = ctx.createRadialGradient(tendrilX, tendrilY, 0, tendrilX, tendrilY, tendrilSize);
        const tendrilOpacity = Math.min(0.25, opacity * 0.2); // Higher tendril opacity
        tendrilGradient.addColorStop(0, `rgba(${smokeR}, ${smokeG}, ${smokeB}, ${tendrilOpacity})`);
        tendrilGradient.addColorStop(0.7, `rgba(${smokeR}, ${smokeG}, ${smokeB}, ${tendrilOpacity * 0.3})`);
        tendrilGradient.addColorStop(1, `rgba(${smokeR}, ${smokeG}, ${smokeB}, 0)`);
        
        ctx.fillStyle = tendrilGradient;
        ctx.beginPath();
        ctx.arc(tendrilX, tendrilY, tendrilSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Function to draw smooth smoke trails with realistic color blending
  function drawSmokeTrail(ctx: CanvasRenderingContext2D,
        points: Array<{ x: number; y: number; progress: number; }>,
        primaryColor: { r: number; g: number; b: number; },
        allColors: any,
        seededRandom: () => number) {
        points.forEach((point, index) => {
            if (index === 0) return;

            // Create flowing smoke particles that fade naturally
            const smokeSize = 40 + seededRandom() * 100 * (1 - point.progress * 0.2);
            const baseOpacity = 0.08 * (1 - point.progress * 0.5) * (0.6 + seededRandom() * 0.4);

            // Create realistic smoke with color blending from nearby colors
            const blendedColor = createColorBlend(primaryColor, allColors, point.progress, seededRandom);

            // Multiple smoke layers for realistic depth and merging
            const smokeLayers = [
                { sizeMultiplier: 1.2, opacityMultiplier: 0.8 }, // Outer wispy layer
                { sizeMultiplier: 0.8, opacityMultiplier: 0.8 }, // Core color layer
                { sizeMultiplier: 0.5, opacityMultiplier: 0.6 } // Inner concentrated layer
            ];

            smokeLayers.forEach(layer => {
                const layerSize = smokeSize * layer.sizeMultiplier;
                const layerOpacity = baseOpacity * layer.opacityMultiplier;

                // Create realistic smoke gradient with soft blending
                const gradient = ctx.createRadialGradient(
                    point.x, point.y, 0,
                    point.x, point.y, layerSize
                );

                // Smooth gradient transitions for realistic smoke
                gradient.addColorStop(0, `rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, ${layerOpacity})`);
                gradient.addColorStop(0.3, `rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, ${layerOpacity * 0.9})`);
                gradient.addColorStop(0.6, `rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, ${layerOpacity * 0.5})`);
                gradient.addColorStop(0.85, `rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, ${layerOpacity * 0.2})`);
                gradient.addColorStop(1, `rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, 0.2)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, layerSize, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

  // Function to create realistic color blending for smoke merging
  const createColorBlend = (
    primaryColor: { r: number, g: number, b: number },
    allColors: any,
    progress: number,
    seededRandom: () => number
  ): { r: number, g: number, b: number } => {
    // Randomly select a secondary color for blending
    const colorArray = [allColors.thinkingRGB, allColors.receivingRGB, allColors.givingRGB, allColors.personalityRGB];
    const secondaryColor = colorArray[Math.floor(seededRandom() * colorArray.length)];
    
    // Create natural color blending based on smoke flow
    const blendFactor = 0.15 + seededRandom() * 0.25; // How much to blend
    
    return {
      r: Math.round(primaryColor.r * (1 - blendFactor) + secondaryColor.r * blendFactor),
      g: Math.round(primaryColor.g * (1 - blendFactor) + secondaryColor.g * blendFactor),
      b: Math.round(primaryColor.b * (1 - blendFactor) + secondaryColor.b * blendFactor)
    };
  };

  // Function to create extra right-side coverage for receiving energy zone
  function createRightSideCoverage(ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        receivingColor: { r: number; g: number; b: number; },
        energyLevel: number,
        seededRandom: () => number,
        centerX: number,
        centerY: number,
        personWidth: number,
        personHeight: number,
        faceX: number,
        faceY: number,
        faceWidth: number,
        faceHeight: number) {
        // Create dense coverage on the right side of the image
        const rightSideParticles = 100 + energyLevel * 20;

        for (let i = 0; i < rightSideParticles; i++) {
            // Focus particles on right half of image
            const x = (width * 0.5) + (seededRandom() * width * 0.5);
            const y = seededRandom() * height;

            // Avoid face area
            const inFaceArea = x >= faceX && x <= faceX + faceWidth &&
                y >= faceY && y <= faceY + faceHeight;

            if (!inFaceArea) {
                const particleSize = 50 + seededRandom() * 90;
                const particleOpacity = 0.3 + seededRandom() * 0.4;

                // Create multiple layers for dense coverage
                const layers = [
                    { sizeMultiplier: 1.0, opacityMultiplier: 1.0 },
                    { sizeMultiplier: 0.7, opacityMultiplier: 1.2 }
                ];

                layers.forEach(layer => {
                    const layerSize = particleSize * layer.sizeMultiplier;
                    const layerOpacity = particleOpacity * layer.opacityMultiplier;

                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
                    gradient.addColorStop(0, `rgba(${receivingColor.r}, ${receivingColor.g}, ${receivingColor.b}, ${layerOpacity})`);
                    gradient.addColorStop(0.4, `rgba(${receivingColor.r}, ${receivingColor.g}, ${receivingColor.b}, ${layerOpacity * 0.7})`);
                    gradient.addColorStop(0.8, `rgba(${receivingColor.r}, ${receivingColor.g}, ${receivingColor.b}, ${layerOpacity * 0.3})`);

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, layerSize, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        }
    }

  // Function to create dense atmospheric haze that fills the entire field
  function createAtmosphericHaze(ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        colors: any,
        energyLevel: number,
        seededRandom: () => number,
        faceX: number,
        faceY: number,
        faceWidth: number,
        faceHeight: number) {
        // Dramatically increased haze coverage for mystical density
        const hazeZones = 90 + Math.floor(energyLevel * 15);
        const allColors = [colors.thinkingRGB, colors.receivingRGB, colors.givingRGB, colors.personalityRGB];

        // Create multiple haze layers for maximum mystical density
        const hazeLayers = [
            { density: hazeZones * 0.4, sizeRange: [150, 180], opacity: [0.08, 0.15] }, // Large background haze
            { density: hazeZones * 0.3, sizeRange: [100, 140], opacity: [0.12, 0.20] }, // Medium haze
            { density: hazeZones * 0.3, sizeRange: [30, 100], opacity: [0.15, 0.25] } // Dense detail haze
        ];

        hazeLayers.forEach(layer => {
            for (let zone = 0; zone < layer.density; zone++) {
                const hazeX = seededRandom() * width;
                const hazeY = seededRandom() * height;

                // Avoid face area
                const inFaceArea = hazeX >= faceX && hazeX <= faceX + faceWidth &&
                    hazeY >= faceY && hazeY <= faceY + faceHeight;

                if (!inFaceArea) {
                    const hazeSize = layer.sizeRange[0] + seededRandom() * (layer.sizeRange[1] - layer.sizeRange[0]);

                    // Select color based on position - thinking color ONLY in top 20% of image
                    let hazeColor;
                    if (hazeY < height * 0.2) {
                        // Top 20% - use ONLY thinking color for proper zone positioning
                        hazeColor = colors.thinkingRGB;
                    } else {
                        // Below top 20% - exclude thinking color completely
                        const bottomColors = [colors.receivingRGB, colors.givingRGB, colors.personalityRGB];
                        hazeColor = bottomColors[Math.floor(seededRandom() * bottomColors.length)];
                    }

                    const hazeOpacity = layer.opacity[0] + seededRandom() * (layer.opacity[1] - layer.opacity[0]);

                    const hazeGradient = ctx.createRadialGradient(hazeX, hazeY, 0, hazeX, hazeY, hazeSize);
                    hazeGradient.addColorStop(0, `rgba(${hazeColor.r}, ${hazeColor.g}, ${hazeColor.b}, ${hazeOpacity})`);
                    hazeGradient.addColorStop(0.5, `rgba(${hazeColor.r}, ${hazeColor.g}, ${hazeColor.b}, ${hazeOpacity * 0.7})`);
                    hazeGradient.addColorStop(0.8, `rgba(${hazeColor.r}, ${hazeColor.g}, ${hazeColor.b}, ${hazeOpacity * 0.3})`);
                    hazeGradient.addColorStop(1, `rgba(${hazeColor.r}, ${hazeColor.g}, ${hazeColor.b}, 0)`);

                    ctx.fillStyle = hazeGradient;
                    ctx.beginPath();
                    ctx.arc(hazeX, hazeY, hazeSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }



  const generateAuraVisualization = (originalImageBase64: string | undefined, auraData: AuraAnalysisResult): void => {
        if (!originalImageBase64) return;

        // Create a new image element to work with
        const img = new Image();
        img.src = originalImageBase64;

        img.onload = () => {
            // Create a canvas to draw on
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set proper proportional canvas dimensions for better visualization
            const aspectRatio = img.width / img.height;
            let canvasWidth, canvasHeight;

            // Maintain aspect ratio while ensuring adequate size for visualization
            if (aspectRatio > 1) {
                // Landscape image
                canvasWidth = Math.max(1200, img.width);
                canvasHeight = canvasWidth / aspectRatio;
            } else {
                // Portrait or square image
                canvasHeight = Math.max(900, img.height);
                canvasWidth = canvasHeight * aspectRatio;
            }

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Draw original image to fill the canvas with proper proportions
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

            // Get dominant and secondary colors
            const dominantColor = getAccurateColorCode(auraData.dominantColor);
            const secondaryColor = getAccurateColorCode(auraData.secondaryColor || auraData.dominantColor);

            // Extract all 4 distinct aura colors from the analysis result
            const detectedColors = extractAllAuraColors(auraData);

            const colors = {
                thinkingRGB: hexToRgb(detectedColors.thinking),
                receivingRGB: hexToRgb(detectedColors.receiving),
                givingRGB: hexToRgb(detectedColors.giving),
                personalityRGB: hexToRgb(detectedColors.personality)
            };

            createSmokeyAuraParticles(ctx, canvasWidth, canvasHeight, colors, auraData.energyLevel);

            // Add watermark
            addWatermark(ctx, canvasWidth, canvasHeight);

            // Convert back to base64
            const enhancedImageBase64 = canvas.toDataURL('image/jpeg');
            setEnhancedAuraImage(enhancedImageBase64);
            setProcessedAuraImage(enhancedImageBase64); // Store for PDF generation

            // After visualization is generated, capture the actual display screenshot
            console.log('🎨 Aura visualization generated, preparing to capture screenshot of display...');
            setTimeout(() => {
                console.log('⏰ Taking screenshot of the actual aura visualization display...');
                console.log('🆔 Analysis ID available for screenshot:', window.currentAnalysisIdForScreenshot || currentAnalysisId);
                captureActualVisualizationScreenshot();
            }, 2000); // Give time for the complete visualization to render
        };
    };

    // Function to capture actual screenshot of the aura visualization display
    const captureActualVisualizationScreenshot = async () => {
        // Get analysis ID from multiple sources - prioritize the global one
        const analysisId = window.currentAnalysisIdForScreenshot || currentAnalysisId || (result?.id);
        
        console.log('🔍 Screenshot Debug: window.currentAnalysisIdForScreenshot =', window.currentAnalysisIdForScreenshot);
        console.log('🔍 Screenshot Debug: currentAnalysisId =', currentAnalysisId);
        console.log('🔍 Screenshot Debug: result?.id =', result?.id);
        console.log('🔍 Screenshot Debug: final analysisId =', analysisId);
        
        if (!analysisId) {
            console.log('⚠️ No analysis ID found for screenshot, attempting retry in 3 seconds...');
            
            // Retry once after a delay to allow for state updates
            setTimeout(() => {
                const retryAnalysisId = window.currentAnalysisIdForScreenshot || currentAnalysisId || (result?.id);
                console.log('🔄 Retry attempt - analysis ID:', retryAnalysisId);
                
                if (retryAnalysisId) {
                    console.log('✅ Found analysis ID on retry, proceeding with screenshot...');
                    captureActualVisualizationScreenshot();
                } else {
                    console.log('❌ No analysis ID found even after retry, skipping screenshot capture');
                }
            }, 3000);
            return;
        }

        try {
            // Find the main visualization container that shows both original and aura images side by side
            // First try to find the visualization tab content, then the grid container
            let visualizationContainer = document.querySelector('[data-state="active"] .grid') || 
                                       document.querySelector('.flex.flex-col.md\\:grid.md\\:grid-cols-2') ||
                                       document.querySelector('.md\\:grid.md\\:grid-cols-2.gap-4');
            
            // If no container found, try alternative approaches
            if (!visualizationContainer) {
                console.log('⚠️ Primary container not found, trying fallback approaches...');
                
                // Try to find the aura visualization canvas directly
                const auraCanvas = document.getElementById('aura-visualization-container') || 
                                 document.querySelector('#enhanced-aura-image') ||
                                 document.querySelector('canvas');
                
                if (auraCanvas) {
                    console.log('📷 Found aura canvas element, using it for screenshot...');
                    visualizationContainer = auraCanvas.parentElement || auraCanvas;
                } else {
                    console.log('⚠️ No visualization elements found for screenshot');
                    return;
                }
            }

            console.log('📷 Found visualization container, capturing screenshot...');
            console.log('📐 Container dimensions:', visualizationContainer.scrollWidth, 'x', visualizationContainer.scrollHeight);

            // Capture the entire visualization display (original + aura side by side)
            const canvas = await html2canvas(visualizationContainer as HTMLElement, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                logging: false,
                width: visualizationContainer.scrollWidth,
                height: visualizationContainer.scrollHeight
            });

            // Convert to base64 with improved clarity
            const screenshotBase64 = canvas.toDataURL('image/jpeg', 0.95); // Enhanced screenshot quality
            console.log('📸 Screenshot captured successfully, size:', screenshotBase64.length, 'characters');

            // Send screenshot to backend to update the stored processedAuraImage
            const response = await fetch('/api/update-aura-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auraReadingId: analysisId,
                    processedImage: screenshotBase64
                })
            });

            if (response.ok) {
                console.log('✅ Screenshot of aura visualization display stored successfully');
                console.log('📸 Display screenshot stored for aura reading:', analysisId);
                
                // Invalidate healer dashboard cache to show updated screenshots immediately
                await queryClient.invalidateQueries({ queryKey: ["/api/healer-aura-readings"] });
                await queryClient.invalidateQueries({ queryKey: ["/api/aura-readings"] });
                console.log('🔄 Dashboard cache invalidated - screenshot should appear immediately');
            } else {
                const errorData = await response.json();
                console.error('❌ Failed to store screenshot:', errorData);
            }
        } catch (error) {
            console.error('Error capturing screenshot of visualization display:', error);
        }
    };

    // Function to capture and store the aura visualization image directly
    const captureAndUpdateAuraVisualization = async (visualizationImage?: string) => {
        // Use the enhanced image directly instead of screenshot
        const imageToStore = visualizationImage || enhancedAuraImage;
        
        if (!imageToStore) {
            console.log('⚠️ No visualization image available for capture');
            return;
        }

        // Get analysis ID from current analysis or result
        const analysisId = currentAnalysisId || (result?.id);
        
        console.log('🔍 Debug: currentAnalysisId =', currentAnalysisId);
        console.log('🔍 Debug: result?.id =', result?.id);
        console.log('🔍 Debug: final analysisId =', analysisId);
        
        if (!analysisId) {
            console.log('⚠️ No analysis ID found, skipping image storage');
            // Try to get the analysis ID from a recent successful analysis
            console.log('🔍 Attempting to find recent analysis ID from API calls...');
            return;
        }

        console.log('📸 Storing aura visualization for reading:', analysisId);

        try {
            // Use the enhanced image directly (no need for screenshot)
            const capturedImageBase64 = imageToStore;

            // Send to backend to update the stored processedAuraImage
            const response = await fetch('/api/update-aura-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auraReadingId: analysisId,
                    processedImage: capturedImageBase64
                })
            });

            if (response.ok) {
                console.log('✅ Aura visualization updated successfully in database');
                console.log('📸 Visualization captured and stored for aura reading:', analysisId);
                
                // Invalidate healer dashboard cache to show updated images immediately
                await queryClient.invalidateQueries({ queryKey: ["/api/healer-aura-readings"] });
                await queryClient.invalidateQueries({ queryKey: ["/api/aura-readings"] });
                console.log('🔄 Healer dashboard cache invalidated - new images should appear immediately');
            } else {
                const errorData = await response.json();
                console.error('❌ Failed to update aura visualization in database:', errorData);
            }
        } catch (error) {
            console.error('Error capturing and updating aura visualization:', error);
        }
    };
  
  // Function to draw aura cloud effects
  function drawAuraClouds({ ctx, width, height, dominantColor, secondaryColor, energyLevel }: { ctx: CanvasRenderingContext2D; width: number; height: number; dominantColor: string; secondaryColor: string; energyLevel: number; }): void {
        // Enhanced color mapping with proper hex values
        const colorMap: Record<string, { r: number; g: number; b: number; }> = {
            red: { r: 255, g: 68, b: 68 },
            orange: { r: 255, g: 136, b: 0 },
            yellow: { r: 255, g: 215, b: 0 },
            green: { r: 50, g: 205, b: 50 },
            blue: { r: 65, g: 105, b: 225 },
            indigo: { r: 75, g: 0, b: 130 },
            violet: { r: 138, g: 43, b: 226 },
            purple: { r: 153, g: 50, b: 204 },
            pink: { r: 255, g: 105, b: 180 },
            white: { r: 255, g: 255, b: 255 },
            gold: { r: 255, g: 215, b: 0 },
            silver: { r: 192, g: 192, b: 192 },
            black: { r: 0, g: 0, b: 0 },
            gray: { r: 128, g: 128, b: 128 },
            brown: { r: 165, g: 42, b: 42 }
        };

        // Get color values
        const dominantRGB = colorMap[dominantColor.toLowerCase()] || colorMap.violet;
        const secondaryRGB = colorMap[secondaryColor.toLowerCase()] || dominantRGB;

        // Create deterministic random based on image content for consistent results
        const seedValue = dominantColor.charCodeAt(0) + secondaryColor.charCodeAt(0) + energyLevel;
        let randomSeed = seedValue;
        const seededRandom = () => {
            randomSeed = (randomSeed * 9301 + 49297) % 233280;
            return randomSeed / 233280;
        };

        // Find person outline using edge detection approximation
        const centerX = width * 0.4;
        const centerY = height * 0.5; // Assume person is in lower half
        const personWidth = width * 0.3;
        const personHeight = height * 0.6;

        // Create smokey particle system around person outline
        const particleCount = 700 + (energyLevel * 80);

        for (let i = 0; i < particleCount; i++) {
            // Generate particles around person silhouette
            const angle = (seededRandom() * 2 * Math.PI);
            const distance = (seededRandom() * 100 + 20) * (energyLevel / 10);

            // Create oval distribution around person
            const ellipseX = Math.cos(angle) * (personWidth * 0.6 + distance);
            const ellipseY = Math.sin(angle) * (personHeight * 0.5 + distance * 0.7);

            const particleX = centerX + ellipseX;
            const particleY = centerY + ellipseY;

            // Skip particles that would be inside the person area
            const distanceFromCenter = Math.sqrt(
                Math.pow((particleX - centerX) / (personWidth * 0.4), 2) +
                Math.pow((particleY - centerY) / (personHeight * 0.4), 2)
            );

            if (distanceFromCenter < 1) continue;

            // Determine particle color (blend dominant and secondary)
            const colorBlend = seededRandom();
            const useSecondary = colorBlend > 0.7;
            const rgb = useSecondary ? secondaryRGB : dominantRGB;

            // Fixed consistent particle size for uniform appearance
            const sizeFactor = 1.0; // Fixed factor for consistent visualization
            const particleSize = 144 + seededRandom() * 144; // Consistent size 144-288px for all images
            const baseOpacity = Math.max(0.1, 0.6 - (distance / 150));
            const opacity = baseOpacity * (0.3 + seededRandom() * 0.4);

            // Create smokey gradient for each particle
            const gradient = ctx.createRadialGradient(
                particleX, particleY, 0,
                particleX, particleY, particleSize * 8
            );

            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
            gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.7})`);
            gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);

            // Set blend mode for smokey effect
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = gradient;

            // Draw particle as soft circle
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize * 10, 0, Math.PI * 3);
            ctx.fill();
        }

        

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    }

  // Function to get karmic indication based on chakra score
  const getKarmicIndication = (score: number): { status: string; color: string; description: string } => {
    if (score >= 1 && score <= 3) {
      return {
        status: "Karmic Block",
        color: "text-red-600",
        description: "Significant energetic blockage requiring focused healing work"
      };
    } else if (score >= 4 && score <= 6) {
      return {
        status: "Karmic Test",
        color: "text-orange-600", 
        description: "Active lessons and challenges for spiritual growth"
      };
    } else if (score >= 7 && score <= 8) {
      return {
        status: "Currently Learning",
        color: "text-green-600",
        description: "Healthy energy flow with minor refinements needed"
      };
    } else if (score >= 9 && score <= 10) {
      return {
        status: "Karmic Mastery",
        color: "text-blue-600",
        description: "Highly developed spiritual center with mastery potential"
      };
    } else {
      return {
        status: "Karmic Balance",
        color: "text-green-600",
        description: "Healthy energy flow with minor refinements needed"
      };
    }
  };

  // Function to calculate numerology based on name and birth date
  const calculateNumerologyData = async (name: string, birthDate: string) => {
    if (!name || !birthDate) {
      toast({
        title: "Missing information",
        description: "Please provide both your full name and birth date",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculatingNumerology(true);
    
    try {
      const data = await calculateNumerology(name, birthDate);
      setNumerologyResult(data);
      
      if (activeTab !== "combined") {
        setActiveTab("combined");
      }
      
      toast({
        title: "Combined Analysis Ready",
        description: `Your Life Path Number is ${data.lifePathNumber} - viewing combined insights`,
      });
      
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: error instanceof Error ? error.message : "Failed to calculate numerology",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingNumerology(false);
    }
  };

  // Helper functions for combined numerology and aura analysis
  const calculateDominantSoulChakra = (lifePathNumber: number): number => {
    const chakraMapping: Record<number, number> = {
      1: 3, 2: 4, 3: 5, 4: 1, 5: 5, 6: 4, 7: 6, 8: 1, 9: 7, 11: 6, 22: 1, 33: 4
    };
    return chakraMapping[lifePathNumber] || 7;
  };

  const getDominantSoulChakraName = (chakraNumber: number): string => {
    const chakraNames: Record<number, string> = {
      1: 'Root Chakra (Grounding & Stability)', 2: 'Sacral Chakra (Creativity & Emotion)',
      3: 'Solar Plexus Chakra (Personal Power)', 4: 'Heart Chakra (Love & Compassion)',
      5: 'Throat Chakra (Truth & Expression)', 6: 'Third Eye Chakra (Intuition & Wisdom)',
      7: 'Crown Chakra (Spiritual Connection)'
    };
    return chakraNames[chakraNumber] || 'Crown Chakra (Spiritual Connection)';
  };

  const getColorForNumber = (number: number): string => {
    const numberColorMapping: Record<number, string> = {
      1: 'Red', 2: 'Orange', 3: 'Yellow', 4: 'Green', 5: 'Blue', 6: 'Indigo', 7: 'Violet',
      8: 'Gold', 9: 'White', 11: 'Silver', 22: 'Platinum', 33: 'Rainbow'
    };
    return numberColorMapping[number] || 'Purple';
  };

  const getPersonalityTraits = (personalityNumber: number): string => {
    const traits: Record<number, string> = {
      1: 'leadership qualities and pioneering spirit', 2: 'diplomatic nature and cooperative energy',
      3: 'creative expression and inspiring communication', 4: 'practical wisdom and foundational strength',
      5: 'adventurous spirit and dynamic communication', 6: 'nurturing care and healing presence',
      7: 'mystical insight and spiritual depth', 8: 'executive ability and material mastery',
      9: 'humanitarian service and universal compassion'
    };
    return traits[personalityNumber] || 'unique spiritual gifts and authentic expression';
  };

  // Function to calculate personality number from day digits only for combined analysis
  const calculatePersonalityNumberFromBirthDate = (birthDate: string): number => {
    if (!birthDate) return numerologyResult?.personalityNumber || 1;
    
    const date = new Date(birthDate);
    const day = date.getDate();
    
    // Sum all digits of the day only (as requested by user)
    let dayDigitsSum = day.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
    
    // Reduce to single digit (1-9) unless it's 11, 22, or 33
    while (dayDigitsSum > 9 && dayDigitsSum !== 11 && dayDigitsSum !== 22 && dayDigitsSum !== 33) {
      dayDigitsSum = dayDigitsSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
    }
    
    return dayDigitsSum;
  };

  // Function to generate combined insights from aura and numerology
  const getCombinedInsights = (aura: AuraAnalysisResult, numerology: NumerologyResult, birthDate?: string) => {
    
    // Enhanced color-to-chakra-number mapping based on remedies data
    const colorToChakraMapping: Record<string, {
      number: number, 
      chakra: string, 
      planet: string, 
      color: string, 
      mantra: string, 
      crystal: string[], 
      remedies: string[],
      archangel: string,
      practices: string[]
    }> = {
      'Yellow': {
        number: 1, chakra: 'Solar Plexus Chakra', planet: 'Sun', color: 'Yellow',
        mantra: 'RAM', crystal: ['Citrine', 'Tiger\'s Eye'], archangel: 'Archangel Michael',
        remedies: ['Goal Setting and Achievement', 'Leadership Development', 'Self-Confidence Building'],
        practices: ['Set 3 short-term and 1 long-term goal weekly', 'Practice power affirmations', 'Visualize yellow light in solar plexus']
      },
      'Green': {
        number: 2, chakra: 'Heart Chakra', planet: 'Moon', color: 'Green or Pink',
        mantra: 'YAM', crystal: ['Rose Quartz', 'Green Aventurine', 'Rhodocrosite'], archangel: 'Archangel Raphael',
        remedies: ['Gratitude Practice', 'Emotional Healing', 'Relationship Harmony'],
        practices: ['Write 3 gratitudes daily', 'Practice forgiveness meditation', 'Send love to heart chakra']
      },
      'Violet': {
        number: 3, chakra: 'Crown Chakra', planet: 'Jupiter', color: 'Violet or White',
        mantra: 'AUM', crystal: ['Clear Quartz', 'Selenite', 'Lepidolite'], archangel: 'Archangel Metatron',
        remedies: ['Expressive Writing', 'Spiritual Connection', 'Divine Guidance'],
        practices: ['Write for 10 minutes daily about challenges', 'Practice crown chakra meditation', 'Connect with divine wisdom']
      },
      'Brown': {
        number: 4, chakra: 'Earth Star Chakra', planet: 'Rahu', color: 'Brown or Black',
        mantra: 'LAM', crystal: ['Smoky Quartz', 'Hematite', 'Red Jasper'], archangel: 'Archangel Ariel',
        remedies: ['Mindfulness Meditation', 'Grounding Practices', 'Stability Building'],
        practices: ['Practice 10 minutes mindfulness daily', 'Connect with earth energy', 'Focus on stability and foundation']
      },
      'Blue': {
        number: 5, chakra: 'Throat Chakra', planet: 'Mercury', color: 'Blue',
        mantra: 'HAM', crystal: ['Blue Lace Agate', 'Lapis Lazuli', 'Aquamarine'], archangel: 'Archangel Zadkiel',
        remedies: ['Communication Enhancement', 'Truth Expression', 'Random Acts of Kindness'],
        practices: ['Perform one act of kindness daily', 'Practice authentic communication', 'Chant throat chakra mantras']
      },
      'Orange': {
        number: 6, chakra: 'Sacral Chakra', planet: 'Venus', color: 'Orange',
        mantra: 'VAM', crystal: ['Carnelian', 'Moonstone', 'Orange Calcite'], archangel: 'Archangel Gabriel',
        remedies: ['Creative Expression', 'Emotional Flow', 'Strengths-Based Reflection'],
        practices: ['Identify and use personal strengths weekly', 'Express creativity daily', 'Practice emotional flow meditation']
      },
      'White': {
        number: 7, chakra: 'Soul Star Chakra', planet: 'Ketu', color: 'White or Silver',
        mantra: 'OM', crystal: ['Clear Quartz', 'Selenite', 'Moonstone'], archangel: 'Archangel Sandalphon',
        remedies: ['Self-Compassion Practice', 'Spiritual Wisdom', 'Inner Peace'],
        practices: ['Practice self-compassion daily', 'Engage in spiritual study', 'Meditate on transcendence']
      },
      'Indigo': {
        number: 8, chakra: 'Third Eye Chakra', planet: 'Saturn', color: 'Indigo or Deep Blue',
        mantra: 'OM', crystal: ['Amethyst', 'Sodalite', 'Fluorite'], archangel: 'Archangel Raziel',
        remedies: ['Strategic Planning', 'Intuition Development', 'Manifestation'],
        practices: ['Set clear intentions weekly', 'Practice third eye meditation', 'Develop intuitive abilities']
      },
      'Red': {
        number: 9, chakra: 'Root Chakra', planet: 'Mars', color: 'Red',
        mantra: 'LAM', crystal: ['Red Jasper', 'Garnet', 'Bloodstone'], archangel: 'Archangel Uriel',
        remedies: ['Forgiveness Practice', 'Physical Grounding', 'Service to Others'],
        practices: ['Write forgiveness letters weekly', 'Practice grounding exercises', 'Engage in humanitarian service']
      }
    };

    // Get mapping for dominant aura color (fallback to closest match) - restricted to 12 colors
    const getClosestColorMapping = (color: string) => {
      const colorMap: Record<string, string> = {
        'Purple': 'Violet', 'Pink': 'Red', 'Turquoise': 'Blue', 'Cyan': 'Blue',
        'Blue': 'Blue', 'Navy': 'Blue', 'Emerald': 'Green', 'Jade': 'Green', 
        'Sapphire': 'Blue', 'Topaz': 'Yellow', 'Amber': 'Yellow', 'Coral': 'Orange',
        'Lavender': 'Violet', 'Mint': 'Green', 'Peach': 'Orange', 'Rose': 'Red',
        'Sky Blue': 'Blue', 'Maroon': 'Red', 'Dark Pink': 'Red', 'Gray': 'Silver'
      };
      return colorMap[color] || color;
    };

    const dominantColorKey = getClosestColorMapping(aura.dominantColor);
    const dominantColorMapping = colorToChakraMapping[dominantColorKey] || colorToChakraMapping['White'];
    
    // Calculate dominant soul chakra based on numerology
    const dominantSoulChakra = calculateDominantSoulChakra(numerology.lifePathNumber);
    const dominantSoulChakraName = getDominantSoulChakraName(dominantSoulChakra);
    
    // Enhanced compatibility analysis
    const isNumerologyAligned = dominantColorMapping.number === numerology.lifePathNumber;
    const chakraResonance = Math.abs(dominantColorMapping.number - numerology.lifePathNumber) <= 2;
    
    const energyAlignment = isNumerologyAligned ? 'Perfect Alignment' : 
                           chakraResonance ? 'Highly Aligned' : 'Growth Opportunity';
    
    const compatibility = isNumerologyAligned ? 
      `Your ${aura.dominantColor} aura is in perfect harmony with your Life Path ${numerology.lifePathNumber}, creating powerful manifestation abilities through the ${dominantColorMapping.chakra}.` :
      chakraResonance ?
      `Your ${aura.dominantColor} aura resonates well with your Life Path ${numerology.lifePathNumber}, offering balanced energy between ${dominantColorMapping.chakra} and your natural ${dominantSoulChakraName} tendencies.` :
      `Your ${aura.dominantColor} aura presents a transformative opportunity with Life Path ${numerology.lifePathNumber}, encouraging integration of ${dominantColorMapping.chakra} energy into your ${dominantSoulChakraName} nature.`;

    // Enhanced spiritual guidance
    const spiritualGuidance = `Your ${aura.dominantColor} aura resonates with the ${dominantColorMapping.chakra}, governed by ${dominantColorMapping.planet} and supported by ${dominantColorMapping.archangel}. Combined with Life Path ${numerology.lifePathNumber}, this creates a powerful spiritual signature focused on ${dominantColorMapping.remedies[0]}. Your energy field is naturally attuned to ${dominantSoulChakraName} development, enhanced by ${dominantColorMapping.planet} planetary influences.`;

    // Calculate custom personality number for combined analysis (day + month digits)
    const customPersonalityNumber = calculatePersonalityNumberFromBirthDate(birthDate || '');
    const personalityColor = getColorForNumber(customPersonalityNumber);
    
    // Personality integration with chakra influences
    const personalityIntegration = `Your Personality Number ${customPersonalityNumber} manifests through your ${aura.dominantColor} aura energy, channeling ${dominantColorMapping.chakra} qualities. Others perceive you as someone with natural ${getPersonalityTraits(customPersonalityNumber)} enhanced by ${dominantColorMapping.remedies[1]} abilities.`;

    // Comprehensive practices based on remedies data
    const recommendedPractices = [
      `Chant "${dominantColorMapping.mantra}" mantra 45 times daily for ${dominantColorMapping.chakra} activation`,
      `Use ${dominantColorMapping.crystal.join(' or ')} crystals for energy enhancement`,
      `Practice ${dominantColorMapping.practices[0]} aligned with your ${dominantColorMapping.chakra}`,
      `Invoke ${dominantColorMapping.archangel} for guidance: "Guide me in ${dominantColorMapping.remedies[0]}"`,
      `Focus on ${dominantColorMapping.remedies[2]} based on your Life Path ${numerology.lifePathNumber}`,
      `Wear or visualize ${dominantColorMapping.color} light for chakra balancing`
    ];

    return {
      energyAlignment,
      compatibility,
      spiritualGuidance,
      personalityIntegration,
      lifePathColor: getColorForNumber(numerology.lifePathNumber),
      personalityNumber: customPersonalityNumber,
      personalityColor: personalityColor,
      dominantSoulChakra: dominantSoulChakraName,
      chakraAlignment: dominantColorMapping.chakra,
      planetaryInfluence: dominantColorMapping.planet,
      archangelGuidance: dominantColorMapping.archangel,
      sacredMantra: dominantColorMapping.mantra,
      healingCrystals: dominantColorMapping.crystal,
      recommendedPractices
    };
  };
  
  // Function to detect human presence for aura analysis (faces or full body)
  const detectHumanFace = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        if (imageData) {
          const data = imageData.data;
          let skinPixels = 0;
          let clothingPixels = 0;
          let hairPixels = 0;
          let totalPixels = data.length / 4;
          
          // Enhanced human detection for faces AND full body images
          for (let i = 0; i < data.length; i += 8) { // Sample every 2nd pixel for efficiency
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Comprehensive skin tone detection for all ethnicities
            const skinTone1 = r > 120 && g > 80 && b > 60 && r > g && r > b && 
                             Math.abs(r - g) > 15 && Math.abs(r - b) > 25;
            const skinTone2 = r > 200 && g > 160 && b > 120 && r - g < 50 && r - b < 100; // Light skin
            const skinTone3 = r > 100 && r < 160 && g > 70 && g < 120 && b > 50 && b < 100 && 
                             r > g && r > b; // Medium skin
            const skinTone4 = r > 70 && r < 130 && g > 50 && g < 100 && b > 30 && b < 80; // Dark skin
            const skinTone5 = r > 40 && r < 100 && g > 30 && g < 80 && b > 20 && b < 70; // Very dark skin
            
            // Clothing detection (common clothing colors)
            const clothing1 = r < 60 && g < 60 && b < 60; // Dark clothing (black, navy)
            const clothing2 = r > 200 && g > 200 && b > 200; // White/light clothing
            const clothing3 = b > r + 30 && b > g + 20 && b > 80; // Blue clothing (jeans, etc.)
            const clothing4 = Math.max(r, g, b) - Math.min(r, g, b) > 60 && Math.max(r, g, b) > 100; // Colorful clothing
            
            // Hair detection (various hair colors)
            const hair1 = r < 80 && g < 60 && b < 50; // Dark hair
            const hair2 = r > 80 && r < 150 && g > 60 && g < 120 && b > 40 && b < 100; // Brown hair
            const hair3 = r > 150 && g > 120 && b > 80 && r > g && g > b; // Blonde hair
            const hair4 = r > 60 && r < 120 && g > 40 && g < 100 && b > 30 && b < 90; // Medium hair
            
            if (skinTone1 || skinTone2 || skinTone3 || skinTone4 || skinTone5) {
              skinPixels++;
            }
            
            if (clothing1 || clothing2 || clothing3 || clothing4) {
              clothingPixels++;
            }
            
            if (hair1 || hair2 || hair3 || hair4) {
              hairPixels++;
            }
          }
          
          // Calculate detection ratios
          const sampledPixels = totalPixels / 2; // We sampled every 2nd pixel
          const skinRatio = skinPixels / sampledPixels;
          const clothingRatio = clothingPixels / sampledPixels;
          const hairRatio = hairPixels / sampledPixels;
          
          // Enhanced human detection criteria for full body images
          const hasEnoughSkin = skinRatio > 0.015; // Face or visible skin (lowered threshold)
          const hasClothingAndSkin = clothingRatio > 0.08 && skinRatio > 0.005; // Full body with clothes
          const hasHumanFeatures = hairRatio > 0.02 && skinRatio > 0.003; // Hair + some skin
          const hasOverallHumanPresence = (skinRatio + clothingRatio + hairRatio) > 0.12;
          
          // Accept if ANY criteria are met for full body or face detection
          const hasHuman = hasEnoughSkin || hasClothingAndSkin || hasHumanFeatures || hasOverallHumanPresence;
          resolve(hasHuman);
        } else {
          resolve(false);
        }
      };
      
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);
    setAnalysisStage("Checking image content...");
    // Reset review system for new analysis
    setReviewSubmitted(false);
    setRating(0);
    setReviewText("");
    setCurrentAnalysisId(null);

    try {
      // Check for human presence (face or full body)
      setAnalysisProgress(10);
      setAnalysisStage("Scanning for human presence...");
      
      const hasHuman = await detectHumanFace(file);
      
      if (!hasHuman) {
        setIsAnalyzing(false);
        toast({
          title: "No Human Detected",
          description: "Aura analysis requires an image with a human being. Please upload a photo of yourself or another person (face or full body).",
          variant: "destructive",
        });
        return;
      }

      setAnalysisProgress(20);
      setAnalysisStage("Initializing aura scanning...");

      // Fast progress simulation for better UX
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          
          // Update stage text based on progress
          if (prev < 40) {
            setAnalysisStage("Analyzing energy patterns...");
          } else if (prev < 70) {
            setAnalysisStage("Detecting aura colors...");
          } else {
            setAnalysisStage("Generating your reading...");
          }
          
          return prev + Math.random() * 8 + 3; // Faster progress increments
        });
      }, 100); // Ultra fast interval

      // Convert the image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result?.toString();
        const base64data = base64String?.split(",")[1];
        
        // Store original image
        setOriginalImage(base64String || null);
        
        if (base64data) {
          try {
            // Generate hash for image consistency
            const imageHash = generateImageHash(base64data);
            
            // Check if we have a cached result for this or similar image
            const cachedResult = findSimilarImage(imageHash, base64data);
            
            let analysisResult: AuraAnalysisResult;
            
            // Always call API to ensure database record and ID are created
            analysisResult = await analyzeAuraImage(base64data, analysisName || 'Unnamed');
            
            console.log('🆔 Raw API result:', analysisResult);
            console.log('🆔 Analysis ID from API:', analysisResult?.id);
            
            if (cachedResult) {
              // Use cached analysis result but keep the new ID from the API call
              setAnalysisStage("Loading cached analysis for consistency...");
              analysisResult = {
                ...cachedResult,
                id: analysisResult.id // Keep the new database ID
              };
            } else {
              // Cache the result for future consistency
              setImageCache(prev => {
                const newCache = new Map(prev);
                newCache.set(imageHash, analysisResult);
                return newCache;
              });
            }
            
            // Immediately set the current analysis ID for screenshot capture
            if (analysisResult?.id) {
              setCurrentAnalysisId(analysisResult.id);
              console.log('🆔 Current analysis ID set to:', analysisResult.id);
              
              // Store the analysis ID globally for screenshot capture
              window.currentAnalysisIdForScreenshot = analysisResult.id;
              
              // Immediately invalidate healer dashboard cache to show new reading
              queryClient.invalidateQueries({ queryKey: ["/api/healer-aura-readings"] });
              queryClient.invalidateQueries({ queryKey: ["/api/aura-readings"] });
              console.log('🔄 Cache invalidated immediately after setting analysis ID');
            } else {
              console.log('⚠️ No ID in analysis result, will retry later');
            }
            
            setResult(analysisResult);
            
            // Load processedAuraImage from backend if available
            if (analysisResult.processedAuraImage) {
              console.log('📸 Loading processed aura image from backend');
              const backendImage = analysisResult.processedAuraImage;
              setProcessedAuraImage(backendImage);
              console.log('📸 Processed image loaded from backend, length:', backendImage?.length || 0);
            }
            
            // Set analysis ID if returned from server for review functionality
            if (analysisResult.id) {
              setCurrentAnalysisId(analysisResult.id);
              console.log('✅ Analysis ID set successfully:', analysisResult.id);
              
              // Immediately try to store any existing visualization
              if (enhancedAuraImage) {
                console.log('📸 Found existing enhanced aura image, storing immediately...');
                setTimeout(() => {
                  captureAndUpdateAuraVisualization(enhancedAuraImage);
                }, 100);
              }
            } else {
              console.log('⚠️ No analysis ID in result:', analysisResult);
            }
            
            // Invalidate queries to refresh user's reading history immediately
            queryClient.invalidateQueries({ queryKey: ['/api/aura-readings'] });
            queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
            
            // Generate aura visualization using canvas overlay
            if (base64String) {
              setAnalysisStage("Creating your aura visualization...");
              generateAuraVisualization(base64String, analysisResult);
              setAnalysisStage("Aura visualization complete!");
            } else {
              setProcessedAuraImage(base64String || '');
              setAnalysisStage("Analysis complete!");
              
              // If no visualization needed, try to store any existing processed image
              if (analysisResult.id) {
                console.log('📸 Attempting to store image for analysis:', analysisResult.id);
                
                // Use any available image: enhancedAuraImage, processedAuraImage, or base64String
                const imageToStore = enhancedAuraImage || processedAuraImage || base64String;
                if (imageToStore) {
                  setTimeout(() => {
                    captureAndUpdateAuraVisualization(imageToStore);
                  }, 500);
                } else {
                  console.log('⚠️ No image available for storage');
                }
              }
            }
            
            // Ensure progress shows 100% at the end
            setAnalysisProgress(100);
            setAnalysisStage("Analysis complete! Preparing your results...");
            
            // Clear interval if it's still running
            clearInterval(progressInterval);
            
            // Small delay to show the 100% state before removing loading
            setTimeout(() => {
              setIsAnalyzing(false);
              // Set active tab to analysis to show results including visualization
              setActiveTab("analysis");
              // Keep name entered state - user must refresh for new analysis
            }, 200);
          } catch (error) {
            console.error("Error in aura analysis:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error details:", errorMessage);
            
            // Show error to user
            toast({
              title: "Analysis Failed",
              description: errorMessage.includes("human detected") ? 
                "Please upload an image containing a person for aura analysis." :
                "Unable to analyze your aura. Please try again with a different image.",
              variant: "destructive",
            });
            
            clearInterval(progressInterval);
            setIsAnalyzing(false);
            // Reset name input for retry
            setNameEntered(false);
            setAnalysisName('');
          }
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error analyzing image:", errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage.includes("human detected") ? 
          "Please upload an image containing a person for aura analysis." :
          errorMessage.includes("too large") ?
          "Image file is too large. Please use a smaller image." :
          "Unable to analyze your aura. Please try again with a different image.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      // Reset name input for retry
      setNameEntered(false);
      setAnalysisName('');
    }
  };

  // Helper function to get color class based on aura color
  function getColorClass(color: string) {
        const colorMap: Record<string, string> = {
            purple: "bg-purple-500",
            violet: "bg-purple-600",
            indigo: "bg-indigo-500",
            blue: "bg-blue-500",
            green: "bg-green-500",
            yellow: "bg-yellow-500",
            orange: "bg-orange-500",
            red: "bg-red-500",
            pink: "bg-pink-500",
            white: "bg-gray-100",
            gold: "bg-amber-400",
            silver: "bg-gray-300",
            turquoise: "bg-teal-500",
            darkpink: "bg-pink-600",
            brown: "bg-brown-500",
            black: "bg-black"
            // Add more colors as needed
        };

        const lowerColor = color.toLowerCase();
        return colorMap[lowerColor] || "bg-gray-400";
    }

  // Helper function to get text color class based on aura color
  function getTextColorClass(color: string) {
        const colorMap: Record<string, string> = {
            purple: "text-purple-500",
            violet: "text-purple-600",
            indigo: "text-indigo-500",
            blue: "text-blue-500",
            green: "text-green-500",
            yellow: "text-yellow-500",
            orange: "text-orange-500",
            red: "text-red-500",
            pink: "text-pink-500",
            white: "text-gray-100",
            gold: "text-amber-400",
            silver: "text-gray-300",
            turquoise: "text-teal-500",
            magenta: "text-pink-600",
            brown: "text-brown-500",
            black: "text-black"
        };

        const lowerColor = color.toLowerCase();
        return colorMap[lowerColor] || "text-gray-400";
    }



  // Helper functions for aura analysis and premium visualization
  const auraHelpers = {
    // Get color position on spectrum
    getColorPosition: (color: string): number | null => {
      const positionMap: Record<string, number> = {
        red: 10,
        orange: 25,
        yellow: 40,
        green: 55,
        blue: 70,
        indigo: 80,
        violet: 85,
        purple: 90,
        pink: 75,
        white: 95,
        gold: 35,
        silver: 60,
        brown: 15,
        black: 5
      };
      
      const lowerColor = color.toLowerCase();
      return positionMap[lowerColor] !== undefined ? positionMap[lowerColor] : null;
    },
    
    // Get complementary color for aura visualization
    getComplementaryColor: (color: string): string => {
      const colorMap: Record<string, string> = {
        "Red": "Green",
        "Orange": "Blue",
        "Yellow": "Purple",
        "Green": "Red",
        "Blue": "Orange",
        "Indigo": "Yellow", 
        "Violet": "Gold",
        "Gold": "Violet",
        "Silver": "Blue",
        "White": "Black",
        "Black": "White",
        "Brown": "Blue"
        
        
      };
      
      return colorMap[color] || "White";
    },
    
    // Enhanced energy cycle pattern with full 1-10 range
    getEnergyCycle: (energyLevel: number, color: string): string => {
      const colorLower = color.toLowerCase();
      
      // Fire/Earth energy colors (Red, Orange, Yellow, Brown)
      if (["red", "orange", "yellow", "brown"].includes(colorLower)) {
        if (energyLevel >= 9) return "explosive and transformative";
        if (energyLevel >= 8) return "rapid and intensely dynamic";
        if (energyLevel >= 7) return "strong and consistent";
        if (energyLevel >= 5) return "steady and building";
        if (energyLevel >= 3) return "slow-burning and persistent";
        return "dormant with potential for awakening";
      }
      
      // Water/Air energy colors (Green, Blue, Silver)
      if (["green", "blue", "silver"].includes(colorLower)) {
        if (energyLevel >= 9) return "torrential and overwhelming";
        if (energyLevel >= 8) return "flowing and wave-like";
        if (energyLevel >= 7) return "rhythmic and tidal";
        if (energyLevel >= 5) return "gentle streams and eddies";
        if (energyLevel >= 3) return "calm pools with occasional ripples";
        return "still waters with deep undercurrents";
      }
      
      // Spiritual energy colors (Violet, Indigo, Purple, White, Gold)
      if (["violet", "indigo", "purple", "white", "gold"].includes(colorLower)) {
        if (energyLevel >= 9) return "lightning-like and transcendent";
        if (energyLevel >= 8) return "pulsating and mystical";
        if (energyLevel >= 7) return "cyclical and intuitive";
        if (energyLevel >= 5) return "subtle waves of insight";
        if (energyLevel >= 3) return "intermittent spiritual downloads";
        return "quiet inner knowing and contemplation";
      }
      
      // Shadow/Transformative colors (Black)
      if (colorLower === "black") {
        if (energyLevel >= 9) return "volcanic and revolutionary";
        if (energyLevel >= 7) return "deep and transformative";
        if (energyLevel >= 5) return "steady inner work";
        if (energyLevel >= 3) return "quiet shadow integration";
        return "patient inner alchemy";
      }
      
      // Default for any other colors
      return energyLevel >= 7 ? "dynamic and variable" : energyLevel >= 4 ? "moderate and balanced" : "gentle and conserved";
    },
    
    // Enhanced energy level text with full 1-10 range
    getEnergyLevelText: (level: number): string => {
      if (level === 10) return "Maximum Intensity";
      if (level === 9) return "Extremely High";
      if (level === 8) return "Very High";
      if (level === 7) return "High";
      if (level === 6) return "Above Average";
      if (level === 5) return "Moderate";
      if (level === 4) return "Below Average";
      if (level === 3) return "Low";
      if (level === 2) return "Very Low";
      return "Minimal";
    },
    
    // Enhanced energy advice with full 1-10 range and color-specific guidance
    getEnergyAdvice: (level: number, color: string): string => {
      const colorLower = color.toLowerCase();
      
      // Maximum energy levels (9-10)
      if (level >= 9) {
        if (["red", "orange", "yellow"].includes(colorLower)) {
          return level === 10 
            ? "Your energy is at maximum intensity. Immediate grounding and energy distribution practices are essential to prevent burnout."
            : "This extremely high physical energy requires careful channeling through vigorous exercise, creative projects, or leadership activities.";
        }
        if (["violet", "indigo", "purple", "white", "gold"].includes(colorLower)) {
          return level === 10
            ? "Maximum spiritual energy activation detected. Focus on service to others and sharing your divine gifts to balance this intensity."
            : "This exceptional spiritual energy suggests you're receiving powerful downloads. Regular meditation and energy clearing are vital.";
        }
        if (["green", "blue", "silver"].includes(colorLower)) {
          return "Your emotional/healing energy is extremely elevated. Channel this through helping others or artistic expression.";
        }
        return "Intense energy activation requires immediate grounding practices and conscious energy management.";
      }
      
      // High energy levels (7-8)
      if (level >= 7) {
        if (["red", "orange", "yellow", "brown"].includes(colorLower)) {
          return "High physical/creative energy is excellent for manifesting goals. Focus on structured action and creative expression.";
        }
        if (["violet", "indigo", "purple", "white", "gold"].includes(colorLower)) {
          return "Strong spiritual energy indicates active psychic development. Regular spiritual practices will enhance your gifts.";
        }
        if (["green", "blue", "silver"].includes(colorLower)) {
          return "Elevated emotional/healing energy suggests your heart center is very active. Perfect time for relationship work and healing practices.";
        }
        return "Your vibrant energy flow indicates an active manifestation period. Focus on purposeful activities.";
      }
      
      // Moderate energy levels (5-6)
      if (level >= 5) {
        if (["red", "orange", "yellow"].includes(colorLower)) {
          return "Balanced physical energy provides steady foundation for consistent progress. Maintain regular routines.";
        }
        if (["violet", "indigo", "purple"].includes(colorLower)) {
          return "Moderate spiritual energy indicates steady inner development. Perfect for establishing regular meditation practice.";
        }
        if (["green", "blue"].includes(colorLower)) {
          return "Harmonious emotional energy shows good balance between giving and receiving. Continue current practices.";
        }
        return "Well-balanced energy state indicates healthy equilibrium. Maintain current spiritual and self-care practices.";
      }
      
      // Low energy levels (3-4)
      if (level >= 3) {
        if (["red", "orange", "yellow"].includes(colorLower)) {
          return "Lower physical energy suggests need for rest and gentle rebuilding. Focus on nutrition, sleep, and gentle movement.";
        }
        if (["violet", "indigo", "purple"].includes(colorLower)) {
          return "Quiet spiritual energy indicates an introspective phase. This is perfect for inner work and contemplation.";
        }
        if (["green", "blue"].includes(colorLower)) {
          return "Gentle emotional energy suggests a healing period. Practice self-compassion and emotional nurturing.";
        }
        return "Lower energy indicates a natural conservation phase. Honor your need for rest and gentle self-care.";
      }
      
      // Very low energy levels (1-2)
      if (level >= 1) {
        if (colorLower === "black") {
          return level === 1 
            ? "Deep transformative energy is dormant but powerful. This is a profound inner alchemy period requiring patience."
            : "Very low energy in shadow work indicates deep healing is occurring. Trust the process and be gentle with yourself.";
        }
        return level === 1
          ? "Minimal energy suggests a deep regeneration phase. Focus entirely on rest, healing, and basic self-care."
          : "Very low energy indicates recovery period. Gentle practices like meditation, light walks, and nurturing activities are ideal.";
      }
      
      return "Energy assessment indicates need for personalized spiritual guidance.";
    }
  };

  // Helper functions for the detailed analysis tab
  const getAuraLayerAnalysis = (layer: string, color: string): string => {
    const layerAnalysis: Record<string, Record<string, string>> = {
      physical: {
        "Purple": "Your physical layer shows strong spiritual vitality supporting immune system function and cellular regeneration. Purple energy enhances your body's natural healing abilities and connection to divine health.",
        "Blue": "Your physical layer indicates excellent communication between body systems and peaceful nervous system function. Blue energy supports throat, thyroid, and respiratory health.",
        "Green": "Your physical layer demonstrates powerful healing capacity and heart-centered health. Green energy supports cardiovascular function, immune strength, and natural detoxification processes.",
        "Yellow": "Your physical layer shows strong digestive fire and mental-physical coordination. Yellow energy supports metabolism, nervous system clarity, and solar plexus vitality.",
        "Orange": "Your physical layer indicates vibrant reproductive and creative energy. Orange energy supports hormonal balance, reproductive health, and creative life force circulation.",
        "Red": "Your physical layer demonstrates robust survival energy and physical strength. Red energy supports bone health, blood circulation, adrenal function, and physical endurance.",
        "White": "Your physical layer carries pure vitality and energetic protection. White energy supports overall health optimization, cellular purification, and divine healing integration.",
        "Gold": "Your physical layer resonates with divine healing wisdom. Gold energy supports regenerative health, spiritual healing integration, and advanced cellular repair mechanisms.",
        "Indigo": "Your physical layer shows enhanced nervous system sensitivity and brain-body connection. Indigo energy supports neurological health, pineal gland function, and intuitive body awareness.",
        "Pink": "Your physical layer demonstrates nurturing self-care and heart-centered health. Pink energy supports emotional-physical healing, stress reduction, and loving body relationship.",
        "Silver": "Your physical layer carries lunar wisdom affecting hormonal cycles and fluid balance. Silver energy supports reproductive health, emotional-physical integration, and psychic body awareness."
      },
      etheric: {
        "Purple": "Your etheric layer shows strong spiritual development and healing energy fields. Physical vitality is enhanced through psychic connections rather than purely physical sources.",
        "Blue": "Your etheric layer is strongly aligned with truth and clear expression. Physical health responds well to sound therapy and throat chakra work.",
        "Green": "Your etheric layer shows exceptional healing potential and natural vitality. Physical energy is balanced and flows freely through all systems.",
        "Yellow": "Your etheric layer vibrates with intellectual energy and mental stimulation. Physical vitality is strongly tied to mental engagement and learning.",
        "Orange": "Your etheric layer pulses with creative life force and sensual energy. Physical vitality is enhanced through creative expression and joy.",
        "Red": "Your etheric layer contains powerful primal energy and strong physical vitality. Your physical presence is grounded and commanding.",
        "White": "Your etheric layer is exceptionally pure and connected to higher consciousness. Physical energy is refined and spiritually aligned.",
        "Gold": "Your etheric layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
        "Indigo": "Your etheric layer is connected to higher intuition and visionary abilities. Physical body benefits from third eye meditation.",
        "Pink": "Your etheric layer resonates with unconditional love and compassion. Physical health is enhanced through heart-centered practices.",
        "Silver": "Your etheric layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices."
      },
      emotional: {
        "Purple": "Your emotional layer reveals spiritual sensitivity and intuitive emotional processing. You may experience emotions as spiritual messages.",
        "Blue": "Your emotional layer shows a peaceful approach to feelings with truthful emotional expression. You process emotions through communication.",
        "Green": "Your emotional layer indicates balance and healing in emotional patterns. You naturally create harmony in emotional environments.",
        "Yellow": "Your emotional layer shows optimism and intellectual processing of emotions. You tend to analyze feelings before expressing them.",
        "Orange": "Your emotional layer is vibrant with enthusiasm and creative emotional expression. You experience emotions intensely and expressively.",
        "Red": "Your emotional layer indicates passionate feelings and strong emotional presence. Your emotions are powerful motivators in your life.",
        "White": "Your emotional layer contains pure, unconditional emotional responses. You experience emotions with spiritual detachment.",
        "Gold": "Your emotional layer carries wisdom in emotional processing. You have access to ancient emotional patterns and healing.",
        "Indigo": "Your emotional layer connects emotions to intuitive knowing. You understand the deeper purpose behind emotional experiences.",
        "Pink": "Your emotional layer is suffused with love and compassion. Your emotional responses are heart-centered and nurturing.",
        "Silver": "Your emotional layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices."
      },
      mental: {
        "Purple": "Your mental layer shows psychic abilities integrated into thought processes. Your thinking is informed by spiritual insights.",
        "Blue": "Your mental layer reveals clear, truthful thinking and excellent communication skills. Your thoughts align with higher truth.",
        "Green": "Your mental layer indicates balanced thinking and healing thought patterns. Your mind naturally seeks harmony and growth.",
        "Yellow": "Your mental layer shows exceptional intellectual abilities and analytical thinking. Your mind is your greatest tool.",
        "Orange": "Your mental layer is highly creative with innovative thought patterns. Your thinking breaks conventional boundaries.",
        "Red": "Your mental layer indicates decisive thinking and action-oriented mental processes. Your thoughts quickly translate to action.",
        "White": "Your mental layer connects to universal consciousness. Your thinking transcends ordinary limitations.",
        "Gold": "Your mental layer accesses wisdom and higher knowledge. Your thoughts carry authority and spiritual insight.",
        "Indigo": "Your mental layer shows visionary thinking and future-oriented perspectives. Your ideas come from higher dimensions.",
        "Pink": "Your mental layer processes thoughts through the lens of compassion. Your thinking is heart-centered and loving.",
        "Silver": "Your mental layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices."
      },
      spiritual: {
        "Purple": "Your spiritual layer reveals advanced spiritual development and direct connection to higher dimensions. Your spiritual path involves psychic development.",
        "Blue": "Your spiritual layer shows alignment with truth and clear spiritual communication. You may be a channel for spiritual teachings.",
        "Green": "Your spiritual layer indicates healing abilities and balanced spiritual growth. Your spiritual path involves healing self and others.",
        "Yellow": "Your spiritual layer connects intellectual understanding with spiritual wisdom. Your spiritual path involves teaching and sharing knowledge.",
        "Orange": "Your spiritual layer shows creative spiritual expression and sensual spirituality. Your spiritual path involves creation and joy.",
        "Red": "Your spiritual layer reveals power and strength in spiritual practice. Your spiritual path involves courage and leadership.",
        "White": "Your spiritual layer connects directly to source consciousness. Your spiritual presence carries purity and higher frequency.",
        "Gold": "Your spiritual layer carries divine wisdom and protection. Your spiritual path involves becoming a wisdom keeper.",
        "Indigo": "Your spiritual layer reveals visionary abilities and psychic seeing. Your spiritual path involves bringing new visions to humanity.",
        "Pink": "Your spiritual layer emanates unconditional love. Your spiritual path involves becoming a heart-centered healer."
      }
    };
    
    return layerAnalysis[layer]?.[color] || 
      "This layer of your aura carries unique energetic signatures that reflect your personal spiritual evolution.";
  };
  
  // These functions are already defined above, so removing duplicates.

  function getTraitExplanation({ trait }: { trait: string; color: string; }): string {
        const traitExplanations: Record<string, string> = {
            "Intuitive": "You perceive information beyond the five senses, receiving guidance directly from higher consciousness.",
            "Empathetic": "You naturally sense and absorb the emotional states of others, making you a compassionate healing presence.",
            "Creative": "Your energy naturally manifests new forms and ideas, bringing previously unseen concepts into reality.",
            "Analytical": "You process energy through logical frameworks, bringing clarity and order to spiritual information.",
            "Spiritual": "Your energy vibrates at frequencies that connect easily with higher dimensions and spiritual realms.",
            "Healing": "You naturally channel universal life force energy in ways that restore balance and wholeness.",
            "Visionary": "You perceive potential futures and possibilities beyond current reality constraints.",
            "Grounded": "Your energy maintains strong earth connection while working with higher frequencies.",
            "Passionate": "Your energy field pulses with intense life force that energizes projects and relationships.",
            "Compassionate": "Your heart chakra emanates unconditional love energy that nurtures and supports others.",
            "Wise": "Your energy field contains accumulated wisdom from multiple lifetimes and dimensions.",
            "Psychic": "Your subtle energy sensors are highly developed, allowing perception beyond physical reality.",
            "Balanced": "Your energy system maintains harmonious flow between all chakras and subtle bodies.",
            "Focused": "Your energy can be precisely directed toward specific intentions with minimal scatter.",
            "Expansive": "Your energy field extends widely, connecting with collective consciousness and universal mind.",
            "Calming": "Your energy field is soothing and peaceful, creating a sense of tranquility and relaxation.",
            "Energetic": "Your energy field is vibrant and dynamic, radiating vitality and enthusiasm.",
            "Transformative": "Your energy field carries the power to shift and transform reality.",
            "Protective": "Your energy field is a barrier against negative influences and energies.",
            "Receptive": "Your energy field is open and receptive to new ideas and experiences.",
            "Projective": "Your energy field is focused and directed outward, projecting your intentions into reality.",
            "Reflective": "Your energy field is introspective and self-aware, allowing for deep self-reflection.",
            "Integrative": "Your energy field is holistic, integrating physical, emotional, mental, and spiritual aspects.",
            "Divine": "Your energy field is aligned with divine consciousness, connecting you to the source of all creation.",
        };

        return traitExplanations[trait] || "";
    }

  const getColorPersonalityInfluence = (color: string): string => {
    const influences: Record<string, string> = {
      "Red": "passionate leadership, strong will, and courageous action that drives others to follow your vision.",
      "Orange": "creative enthusiasm, social magnetism, and infectious joy that brings vitality to any environment.",
      "Yellow": "intellectual clarity, optimistic outlook, and mental agility that illuminates solutions and possibilities.",
      "Green": "balanced harmony, healing presence, and nurturing wisdom that creates growth and restoration.",
      "Blue": "truthful communication, peaceful authority, and clear expression that builds trust and understanding.",
      "Indigo": "intuitive perception, spiritual insight, and visionary awareness that sees beyond surface reality.",
      "Violet": "spiritual mastery, divine connection, and transcendent wisdom that bridges earthly and cosmic realms.",
      "Purple": "mystical understanding, transformative power, and magical consciousness that transmutes energy.",
      "Pink": "unconditional love, emotional healing, and compassionate service that nurtures heart connections.",
      "White": "pure consciousness, spiritual protection, and divine clarity that maintains energetic boundaries.",
      "Gold": "divine wisdom, spiritual achievement, and enlightened mastery that guides others toward truth.",
      "Silver": "psychic sensitivity, lunar wisdom, and reflective insight that enhances intuitive abilities.",
      "Turquoise": "healing communication, clear expression, and balanced energy that supports throat chakra health.",
      "black": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
        "gray": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
      "brown": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
      
    };
    return influences[color] || "unique spiritual qualities that shape your energetic expression.";
  };

  const getPersonalityStrengths = (color: string, traits: string[]): string => {
    const strengths: Record<string, string> = {
      "Red": "Natural leadership abilities, unwavering determination, and the courage to take decisive action in challenging situations.",
      "Orange": "Exceptional creative vision, magnetic social presence, and the ability to inspire joy and enthusiasm in others.",
      "Yellow": "Sharp intellectual capabilities, clear communication skills, and the gift of bringing clarity to complex situations.",
      "Green": "Natural healing abilities, emotional balance, and the capacity to create harmony in relationships and environments.",
      "Blue": "Authentic expression, trustworthy communication, and the ability to speak truth with compassion and wisdom.",
      "Indigo": "Highly developed intuition, psychic sensitivity, and the gift of seeing deeper meanings in life experiences.",
      "Violet": "Strong spiritual connection, transcendent awareness, and the ability to access higher wisdom and guidance.",
      "Purple": "Mystical insight, transformative presence, and the power to facilitate deep spiritual and personal change.",
      "Pink": "Unconditional love, emotional intelligence, and the natural ability to heal hearts and nurture growth.",
      "White": "Spiritual purity, energetic protection, and the gift of maintaining clarity in chaotic situations.",
      "Gold": "Divine wisdom, spiritual authority, and the ability to guide others toward enlightenment and truth.",
      "Silver": "Psychic abilities, intuitive guidance, and the gift of reflecting wisdom and insight to others.",
      "Turquoise": "Healing communication, clear expression, and balanced energy that supports throat chakra health.",
      "peach" : "creative energy, sensual vitality, and joyful expression that brings warmth and love to life.",
      "lavender": "gentle healing, nervous system support, and peaceful energy that promotes relaxation and stress relief.",
      "cyan": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
      "teal": "balanced & clear communication, and harmonious energy that supports throat chakra health.", 
      "black": "balanced & clear communication, and harmonious energy that supports throat chakra health.",
        "gray": "balanced & clear communication, and harmonious energy that supports throat chakra health.",
        "brown": "balanced & clear communication, and harmonious energy that supports throat chakra health.",
      
    };
    return strengths[color] || "Your unique combination of traits creates a powerful foundation for personal and spiritual growth.";
  };

  const getPersonalityGrowthAreas = ({ color, traits }: { color: string; traits: string[]; }): string => {
    const growthAreas: Record<string, string> = {
      "Red": "Learning patience and gentleness, balancing action with reflection, and softening intensity when needed.",
      "Orange": "Developing focus and completion skills, grounding creative energy, and maintaining emotional boundaries.",
      "Yellow": "Balancing mental analysis with heart wisdom, practicing emotional expression, and staying grounded in body.",
      "Green": "Setting healthy boundaries, avoiding over-giving, and learning to receive support from others.",
      "Blue": "Expressing emotions more freely, accepting imperfection, and allowing vulnerability in relationships.",
      "Indigo": "Grounding intuitive insights in practical action, trusting inner knowing, and maintaining physical health.",
      "Violet": "Integrating spiritual insights with earthly responsibilities and maintaining connection to physical reality.",
      "Purple": "Balancing mystical pursuits with practical needs and sharing wisdom in accessible ways.",
      "Pink": "Setting emotional boundaries, practicing self-love, and avoiding codependent patterns in relationships.",
      "White": "Integrating shadow aspects, accepting human imperfection, and balancing purity with compassion.",
      "Gold": "Remaining humble while expressing wisdom, accepting others' paths, and avoiding spiritual superiority.",
      "Silver": "Trusting psychic impressions, maintaining energetic boundaries, and grounding intuitive gifts practically.",
      "Turquoise": "Healing communication, clear expression, and balanced energy that supports throat chakra health.",
      "peach" : "creative energy, sensual vitality, and joyful expression that brings warmth and love to life.",
      "lavender": "gentle healing, nervous system support, and peaceful energy that promotes relaxation and stress relief.",
      "cyan": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
      "black": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
      "brown": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
    };
    return growthAreas[color] || "Focus on integrating all aspects of your personality for balanced growth and authentic expression.";
  };

  const getRelationshipDynamics = (primary: string, secondary: string): string => {
    const dynamics: Record<string, string> = {
      "Red": "You bring passion and excitement to relationships but may need to practice patience and gentle communication.",
      "Orange": "You create joyful, creative connections but benefit from developing deeper emotional intimacy and consistency.",
      "Yellow": "You offer intellectual stimulation and clarity but may need to express emotions more openly and vulnerably.",
      "Green": "You naturally nurture and heal relationships but must learn to receive love and set healthy boundaries.",
      "Blue": "You build trust through honest communication but may need to express emotions beyond just facts and logic.",
      "Indigo": "You offer deep understanding and insight but may struggle with practical relationship maintenance and presence.",
      "Violet": "You bring spiritual depth to connections but need to balance transcendence with earthly intimacy.",
      "Purple": "You facilitate transformation in relationships but must ensure changes serve mutual growth and healing.",
      "Pink": "You embody unconditional love but need to maintain identity and avoid losing yourself in others' needs.",
      "White": "You offer pure, honest connection but may need to embrace human messiness and emotional complexity.",
      "Gold": "You provide wisdom and guidance but must remember to be a partner, not just a teacher or advisor.",
      "Silver": "You reflect others' truth back to them but need to share your own feelings and desires openly.",
      "black": "You offer balanced healing and clear communication but may need to balance these with emotional support.",
      "brown": "You offer balanced healing and clear communication but may need to balance these with emotional support."
    };
    return dynamics[primary] || dynamics[secondary] ||"Your unique energy signature creates distinctive patterns in how you connect with others.";
  };

  const getCareerAlignment = (color: string, traits: string[]): string => {
    const careers: Record<string, string> = {
      "Red": "Leadership roles, entrepreneurship, emergency services, sports, or any field requiring decisive action and courage.",
      "Orange": "Creative industries, entertainment, teaching, marketing, event planning, or work involving artistic expression.",
      "Yellow": "Education, research, writing, consulting, technology, or careers requiring analytical thinking and communication.",
      "Green": "Healthcare, counseling, environmental work, nutrition, or any field focused on healing and nurturing others.",
      "Blue": "Communication, journalism, public speaking, mediation, or roles requiring authentic expression and truth-telling.",
      "Indigo": "Psychology, intuitive counseling, research, investigation, or work involving pattern recognition and insight.",
      "Violet": "Spiritual teaching, philosophy, metaphysics, or careers bridging spiritual wisdom with practical application.",
      "Purple": "Alternative healing, mystical studies, transformation coaching, or work facilitating deep personal change.",
      "Pink": "Caregiving, social work, nursing, childcare, or any field focused on emotional healing and support.",
      "White": "Spiritual guidance, energy healing, purification work, or roles requiring clarity and energetic sensitivity.",
      "Gold": "Teaching, mentoring, spiritual leadership, or positions requiring wisdom, authority, and guidance of others.",
      "Silver": "Intuitive services, psychic work, counseling, or careers utilizing reflective and empathetic abilities.",
      "black": "balanced healing, clear communication, and harmonious energy that supports throat chakra health.",
      
    };
    return careers[color] || "Your unique energy combination suggests success in fields that honor your authentic spiritual expression.";
  };

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
              <div className="space-y-10">
                {/* Name input or Upload section */}
                {!nameEntered && !result ? (
                  <div className="flex justify-center">
                    <NameInput
                      onNameSubmit={(name) => {
                        setAnalysisName(name);
                        setNameEntered(true);
                      }}
                      title="Enter Your Name"
                      description="Please provide your name to begin the aura analysis. This helps us track and store your reading in your profile."
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8">
                    <div className="w-full">
                      <h2 className="font-heading font-semibold text-lg lg:text-xl mb-3">Upload Your Photo</h2>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                        <p className="text-sm text-gray-600">Analysis for: <span className="font-medium">{analysisName}</span></p>
                        {result && (
                          <p className="text-xs text-gray-500 italic">Refresh page for new analysis</p>
                        )}
                      </div>
                      <ImageUpload onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
                    </div>
                  
                  <div>
              <div className="h-full p-4 bg-white/70 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-800 mb-2">
                        YOUR AURA READING MIGHT TAKE UPTO 30-60 SECONDS </h3>
                <h3 className="font-medium text-gray-800 mb-2">
                  Tips for the best aura reading: </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          Use a clear photo in good lighting
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          Your face should be clearly visible
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          A neutral background works best
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          A relaxed, natural expression reveals your true energy
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          The recommendations provided in the analysis are generic. Please connect to a healer for personalized recommendations
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary font-bold text-red mr-2">•</span>
                          Raise Your right hand and take the picture. Make sure your right hand is on the right side of the image for an accurate reading.
                        </li>
                      </ul>
                    </div>
                  </div>
                  </div>
                )}
                
                {/* Results section - full width */}
                <div>
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading font-semibold text-xl">Your Aura Reading</h2>
                      {capturedScreenshots.size > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                          {capturedScreenshots.size} screenshot{capturedScreenshots.size !== 1 ? 's' : ''} captured
                        </span>
                      )}
                    </div>
                    
                    {result && !isAnalyzing && (
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs sm:text-sm"
                          onClick={() => shareAuraImage('facebook')}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                          </svg>
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs sm:text-sm"
                          onClick={() => shareAuraImage('instagram')}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428.247-.67.636-1.276 1.153-1.772a4.91 4.91 0 011.772-1.153c.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.669.01 2.986.058 4.04.045.976.207 1.504.344 1.857.181.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.669 0 2.986-.01 4.04-.058.976-.045 1.504-.207 1.857-.344.466-.181.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.04 0-2.669-.01-2.986-.058-4.04-.045-.976-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15c-.35-.35-.683-.567-1.15-.748-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.469a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>
                          </svg>
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs sm:text-sm"
                          onClick={() => shareAuraImage('twitter')}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs sm:text-sm"
                          onClick={downloadComprehensiveAuraPDF}
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Download PDF
                        </Button>
                        {capturedScreenshots.size > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            onClick={downloadComprehensiveAuraPDF}
                          >
                            <Camera className="w-4 h-4 mr-1" />
                            PDF + Screenshots ({capturedScreenshots.size})
                          </Button>
                        )}

                      </div>
                    )}
                  </div>
                  
                  {isAnalyzing ? (
                    <Card className="h-200 flex flex-col items-center justify-center">
                      <div className="text-center w-full max-w-md px-6">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Analyzing your aura energy...</p>
                        
                        <div className="space-y-6 w-full">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Scanning energy field</span>
                            </div>
                            <div className="h-10 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${analysisProgress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 italic">
                            {analysisStage}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : result ? (
                    <Card>
                      <CardContent className="p-4 sm:p-6 lg:p-7" id="aura-reading-section">
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full p-2 mb-6 sm:mb-8 lg:mb-11 gap-1 sm:gap-2 h-auto">
                            <TabsTrigger value="analysis" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto">Analysis</TabsTrigger>
                            <TabsTrigger value="energy-reading" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto relative">
                              <span className="hidden sm:inline">Chakra Score</span>
                              <span className="sm:hidden">Chakras</span>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-cyan-500"></span>
                              </span>
                            </TabsTrigger>
                            <TabsTrigger value="chakras" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto">
                              <span className="hidden lg:inline">Remedies</span>
                              <span className="lg:hidden">Details</span>
                            </TabsTrigger>
                            <TabsTrigger value="guidance" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto">Guidance</TabsTrigger>
                            <TabsTrigger value="spectrum" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto relative">
                              <span className="hidden sm:inline">Life Score</span>
                              <span className="sm:hidden">Colors</span>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rainbow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                                  <Sparkles className="h-1 w-1 sm:h-2 sm:w-2 text-white m-auto" />
                                </span>
                              </span>
                            </TabsTrigger>
                            <TabsTrigger value="energy-map" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto relative">
                              <span className="hidden sm:inline">Energy Map</span>
                              <span className="sm:hidden">Energy</span>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-emerald-500">
                                  <Zap className="h-1 w-1 sm:h-2 sm:w-2 text-white m-auto" />
                                </span>
                              </span>
                            </TabsTrigger>
                            <TabsTrigger value="detailed" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto relative">
                              <span className="hidden lg:inline">Detailed</span>
                              <span className="lg:hidden">Advanced</span>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-amber-500">
                                  <Crown className="h-1 w-1 sm:h-2 sm:w-2 text-white m-auto" />
                                </span>
                              </span>
                            </TabsTrigger>
                            <TabsTrigger value="combined" className="text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto relative">
                              <span className="hidden lg:inline">Combined</span>
                              <span className="lg:hidden">Combined</span>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-purple-500">
                                  <span className="text-[6px] sm:text-[10px] text-white font-bold">✨</span>
                                </span>
                              </span>
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="energy-reading" data-tab="energy-reading">
                            <div className="space-y-6">
                              {/* Screenshot Button */}
                              <div className="flex justify-end mb-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => captureTabScreenshot('energy-reading')}
                                  disabled={isCapturingScreenshot === 'energy-reading'}
                                  className="flex items-center gap-2"
                                >
                                  {isCapturingScreenshot === 'energy-reading' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Camera className="h-4 w-4" />
                                  )}
                                  {isCapturingScreenshot === 'energy-reading' ? 'Capturing...' : 'Capture Screenshot'}
                                </Button>
                              </div>
                              {/* Energy Reading Content */}
                              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">

                                {/* Energy Flow Only */}
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm">Energy Flow</h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white rounded-lg border">
                                      <div className="font-medium text-sm mb-1">Giving Energy</div>
                                      <div className="text-xs text-gray-600 mb-2">How you radiate energy to others</div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${calculateGivingEnergy(result)}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">{calculateGivingEnergy(result)}% - {getGivingEnergyDescription(calculateGivingEnergy(result))}</div>
                                    </div>
                                    
                                    <div className="p-3 bg-white rounded-lg border">
                                      <div className="font-medium text-sm mb-1">Receiving Energy</div>
                                      <div className="text-xs text-gray-600 mb-2">How you absorb energy from environment</div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${calculateReceivingEnergy(result)}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">{calculateReceivingEnergy(result)}% - {getReceivingEnergyDescription(calculateReceivingEnergy(result))}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 8 Chakra Graph */}
                              <div className="bg-white rounded-xl p-1 border border-gray-200">
                             
                                
                                <div className="space-y-0">
                                  {/* Soul Star Chakra */}
                                  
                                  
                                  {/* All Chakras in consistent order */}
                                  {[
                                    { key: 'crown', name: 'Crown', color: 'bg-violet-500' },
                                    { key: 'thirdEye', name: 'Third Eye', color: 'bg-indigo-500' },
                                    { key: 'throat', name: 'Throat', color: 'bg-blue-500' },
                                    { key: 'heart', name: 'Heart', color: 'bg-green-500' },
                                    { key: 'solarPlexus', name: 'Solar Plexus', color: 'bg-yellow-500' },
                                    { key: 'sacral', name: 'Sacral', color: 'bg-orange-500' },
                                    { key: 'root', name: 'Root', color: 'bg-red-500' }
                                  ].map((chakra) => (
                                    <div key={chakra.key} className="flex items-center space-x-3">
                                    
                                      
                                      
                                    </div>
                                  ))}
                                  
                                  {/* Earth Star Chakra */}
                                 
                                </div>
                              </div>

                              {/* Energy Scores */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{calculateAuraStrength(result)}%</div>
                                    <div className="text-sm text-gray-600 mt-1">Aura Strength</div>
                                    <div className="text-xs text-gray-500 mt-2">{getStrengthDescription(calculateAuraStrength(result))}</div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{calculateVulnerability(result)}%</div>
                                    <div className="text-sm text-gray-600 mt-1">Vulnerability</div>
                                    <div className="text-xs text-gray-500 mt-2">{getVulnerabilityDescription(calculateVulnerability(result))}</div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{calculateEnergyBalance(result)}%</div>
                                    <div className="text-sm text-gray-600 mt-1">Energy Balance</div>
                                    <div className="text-xs text-gray-500 mt-2">{getBalanceDescription(calculateEnergyBalance(result))}</div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{result.energyLevel}/10</div>
                                    <div className="text-sm text-gray-600 mt-1">Overall Energy</div>
                                    <div className="text-xs text-gray-500 mt-2">{getEnergyLevelDescription(result.energyLevel)}</div>
                                  </div>
                                </div>
                              </div>

                              <h3 className="font-medium text-lg">9-Chakra Energy System Analysis</h3>
                              
                              <div className="space-y-4">

                                {/* Soul Star Chakra */}
                                <div className="bg-gradient-to-r from-white to-yellow-50 rounded-lg p-4 border border-gray-300">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Soul Star Chakra connects you to your soul's purpose, divine guidance, and highest spiritual potential beyond the physical realm.
                                    </p>
                                    {(() => {
                                      const soulStarScore = Math.round(calculateSoulStarChakra(result)/10);
                                      const karmic = getKarmicIndication(soulStarScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Remembering your soul purpose & Connection with your soul
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Soul Star Chakra</span>
                                      <span className="text-gray-700">{Math.round(calculateSoulStarChakra(result)/10)}/10 ({calculateSoulStarChakra(result)}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={calculateSoulStarChakra(result)} className="h-3 bg-gray-100" />
                                </div>

                                {/* Crown Chakra - Number 3 */}
                                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Crown Chakra governs spiritual connection, divine wisdom, and your link to universal consciousness and higher guidance.
                                    </p>
                                    {(() => {
                                      const crownScore = result.chakraActivity?.crown || 5;
                                      const karmic = getKarmicIndication(crownScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Reconnecting with Source beyond and trusting the divine timing
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Crown Chakra</span>
                                      <span className="text-violet-600">{result.chakraActivity?.crown || 5}/10 ({(result.chakraActivity?.crown || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.crown || 5) * 10} className="h-3 bg-violet-100" />
                                </div>
                                
                                {/* Third Eye Chakra - Number 8 */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Third Eye Chakra enhances intuition, psychic abilities, inner wisdom, and your capacity to see beyond the physical realm.
                                    </p>
                                    {(() => {
                                      const thirdEyeScore = result.chakraActivity?.thirdEye || 5;
                                      const karmic = getKarmicIndication(thirdEyeScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Breaking illusions and mental control to trust intuition and remove self doubt
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Third Eye Chakra</span>
                                      <span className="text-indigo-600">{result.chakraActivity?.thirdEye || 5}/10 ({(result.chakraActivity?.thirdEye || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.thirdEye || 5) * 10} className="h-3 bg-indigo-100" />
                                </div>
                                
                                {/* Throat Chakra - Number 5 */}
                                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Throat Chakra governs communication, self-expression, truth-speaking, and your ability to voice your authentic self.
                                    </p>
                                    {(() => {
                                      const throatScore = result.chakraActivity?.throat || 5;
                                      const karmic = getKarmicIndication(throatScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Healing silenced expression from past lifetimes and speaking your truth and sharing what you feel
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Throat Chakra</span>
                                      <span className="text-blue-600">{result.chakraActivity?.throat || 5}/10 ({(result.chakraActivity?.throat || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.throat || 5) * 10} className="h-3 bg-blue-100" />
                                </div>
                                
                                {/* Heart Chakra - Number 2 */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Heart Chakra controls love, compassion, emotional healing, relationships, and your ability to give and receive love.
                                    </p>
                                    {(() => {
                                      const heartScore = result.chakraActivity?.heart || 5;
                                      const karmic = getKarmicIndication(heartScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Releasing fear of vulnerability and being able to give and receive with balanced boundaries
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Heart Chakra</span>
                                      <span className="text-green-600">{result.chakraActivity?.heart || 5}/10 ({(result.chakraActivity?.heart || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.heart || 5) * 10} className="h-3 bg-green-100" />
                                </div>
                                
                                {/* Solar Plexus Chakra - Number 1 */}
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Solar Plexus Chakra governs personal power, confidence, willpower, and your sense of identity and self-worth.
                                    </p>
                                    {(() => {
                                      const solarPlexusScore = result.chakraActivity?.solarPlexus || 5;
                                      const karmic = getKarmicIndication(solarPlexusScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Stepping into your personal power & confidence to letting go of the self-sacrificial nature
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Solar Plexus Chakra</span>
                                      <span className="text-yellow-600">{result.chakraActivity?.solarPlexus || 5}/10 ({(result.chakraActivity?.solarPlexus || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.solarPlexus || 5) * 10} className="h-3 bg-yellow-100" />
                                </div>
                                
                                {/* Sacral Chakra - Number 6 */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Sacral Chakra influences creativity, sexuality, emotional flow, pleasure, and your capacity for joy and passion.
                                    </p>
                                    {(() => {
                                      const sacralScore = result.chakraActivity?.sacral || 5;
                                      const karmic = getKarmicIndication(sacralScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Reclaiming emotional freedom and self-worth and letting go of guilt, shame, unworthiness around pleasure and emotional feelings
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Sacral Chakra</span>
                                      <span className="text-orange-600">{result.chakraActivity?.sacral || 5}/10 ({(result.chakraActivity?.sacral || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.sacral || 5) * 10} className="h-3 bg-orange-100" />
                                </div>
                                
                                {/* Root Chakra - Number 9 */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Root Chakra provides grounding, survival instincts, physical vitality, and your connection to earth energy and stability.
                                    </p>
                                    {(() => {
                                      const rootScore = result.chakraActivity?.root || 5;
                                      const karmic = getKarmicIndication(rootScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Ability to trust life decisions, take actions to create stability & security in life
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Root Chakra</span>
                                      <span className="text-red-600">{result.chakraActivity?.root || 5}/10 ({(result.chakraActivity?.root || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.root || 5) * 10} className="h-3 bg-red-100" />
                                </div>

                                {/* Earth Star Chakra - Number 8 */}
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Earth Star Chakra anchors you to earth energy and ansectral energy, creates a support system nad monetary stability.
                                    </p>
                                    {(() => {
                                      const earthStarScore = Math.round(calculateEarthStarChakra(result)/10);
                                      const karmic = getKarmicIndication(earthStarScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Ancestral karmic inheritance, Money, Support from your blood line and Living your life as per your soul contract
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Earth Star Chakra</span>
                                      <span className="text-amber-600">{Math.round(calculateEarthStarChakra(result)/10)}/10 ({calculateEarthStarChakra(result)}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={calculateEarthStarChakra(result)} className="h-3 bg-amber-100" />
                                </div>

                              </div>


                            </div>
                          </TabsContent>

                          <TabsContent value="spectrum" data-tab="spectrum">
                            {/* Screenshot Button */}
                            <div className="flex justify-end mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => captureTabScreenshot('spectrum')}
                                disabled={isCapturingScreenshot === 'spectrum'}
                                className="flex items-center gap-2"
                              >
                                {isCapturingScreenshot === 'spectrum' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4" />
                                )}
                                {isCapturingScreenshot === 'spectrum' ? 'Capturing...' : 'Capture Screenshot'}
                              </Button>
                            </div>
                            <div className="space-y-6">
                              <div className="text-center mb-6">
                                <h3 className="font-medium text-xl mb-2">Complete Aura Color Spectrum Analysis</h3>
                                <p className="text-sm text-gray-600">
                                  Detailed breakdown of all colors detected in your aura field with accurate color representations
                                </p>
                              </div>

                              {/* Complete Spectrum Visualization - Moved to Top */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Your Complete Aura Spectrum</h4>
                                <div className="bg-black rounded-lg p-6 relative overflow-hidden">
                                  <div className="flex justify-center items-center space-x-4">
                                    <div className="relative">
                                      <div className="w-32 h-32 rounded-full bg-gradient-to-r opacity-80" 
                                           style={{background: `radial-gradient(circle, ${getAccurateColorCode(result.dominantColor)} 0%, ${getAccurateColorCode(result.secondaryColor)} 70%, transparent 100%)`}}>
                                      </div>
                                      <div className="absolute inset-0 w-32 h-32 rounded-full animate-pulse" 
                                           style={{background: `radial-gradient(circle, transparent 40%, ${getAccurateColorCode(result.dominantColor)}40 60%, transparent 80%)`}}>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-4">
                                    <p className="text-white text-sm">Your unique aura signature combining {result.dominantColor} and {result.secondaryColor} energies</p>
                                  </div>
                                </div>
                              </div>

                              {/* Life Score Analysis Based on Chakra Activity */}
                              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-200">
                                <h4 className="font-medium text-xl mb-4 text-rose-800">Life Score Analysis</h4>
                                <p className="text-sm text-gray-600 mb-6">
                                  Your chakra activity levels create specific life patterns. These scores reveal your current strengths and areas for growth.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  
                                  {/* Love & Relationships Score */}
                                  <div className="bg-white rounded-lg p-4 border border-pink-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-pink-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-pink-800">Love & Relationships</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-pink-600">
                                        {(() => {
                                          const score = (0.4 * (result.chakraActivity?.heart || 5)) + (0.3 * (result.chakraActivity?.sacral || 5)) + (0.3 * (result.chakraActivity?.throat || 5));
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Emotional openness & authentic expression</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const score = (0.4 * (result.chakraActivity?.heart || 5)) + (0.3 * (result.chakraActivity?.sacral || 5)) + (0.3 * (result.chakraActivity?.throat || 5));
                                        if (score <= 4) return "Emotionally blocked, finds it hard to trust or open up";
                                        if (score <= 6) return "Moderate emotional openness, some trust barriers";
                                        if (score <= 8) return "Good emotional flow, healthy relationships";
                                        return "Excellent emotional openness and authentic expression";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Money & Abundance Score */}
                                  <div className="bg-white rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-green-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-green-800">Money & Abundance</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-green-600">
                                        {(() => {
                                          const earthStarScore = calculateEarthStarChakra(result)/10;
                                          const score = (0.3 * (result.chakraActivity?.root || 5)) + (0.3 * (result.chakraActivity?.solarPlexus || 5)) + (0.4 * earthStarScore);
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Groundedness & wealth mindset</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const earthStarScore = calculateEarthStarChakra(result)/10;
                                        const score = (0.3 * (result.chakraActivity?.root || 5)) + (0.3 * (result.chakraActivity?.solarPlexus || 5)) + (0.4 * earthStarScore);
                                        if (score <= 4) return "Money anxiety, scarcity mindset, karmic blocks";
                                        if (score <= 6) return "Developing abundance mindset, some financial blocks";
                                        if (score <= 8) return "Good financial flow, stable wealth mindset";
                                        return "Excellent abundance consciousness and financial stability";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Career & Purpose Score */}
                                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-blue-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-blue-800">Career & Purpose</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {(() => {
                                          const score = (0.4 * (result.chakraActivity?.solarPlexus || 5)) + (0.3 * (result.chakraActivity?.thirdEye || 5)) + (0.3 * (result.chakraActivity?.crown || 5));
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Vision, action & divine guidance alignment</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const score = (0.4 * (result.chakraActivity?.solarPlexus || 5)) + (0.3 * (result.chakraActivity?.thirdEye || 5)) + (0.3 * (result.chakraActivity?.crown || 5));
                                        if (score <= 4) return "Feels lost or stuck, lacks clarity of life direction";
                                        if (score <= 6) return "Developing purpose clarity, some direction uncertainty";
                                        if (score <= 8) return "Good career alignment, clear life direction";
                                        return "Excellent purpose clarity and career fulfillment";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Emotional Stability Score */}
                                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-purple-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-purple-800">Emotional Stability</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-purple-600">
                                        {(() => {
                                          const score = (0.4 * (result.chakraActivity?.sacral || 5)) + (0.3 * (result.chakraActivity?.heart || 5)) + (0.3 * (result.chakraActivity?.root || 5));
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Emotional maturity & self-soothing ability</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const score = (0.4 * (result.chakraActivity?.sacral || 5)) + (0.3 * (result.chakraActivity?.heart || 5)) + (0.3 * (result.chakraActivity?.root || 5));
                                        if (score <= 4) return "Emotionally reactive, overwhelmed easily";
                                        if (score <= 6) return "Moderate emotional stability, occasional overwhelm";
                                        if (score <= 8) return "Good emotional balance, handles stress well";
                                        return "Excellent emotional stability and resilience";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Spiritual Growth Score */}
                                  <div className="bg-white rounded-lg p-4 border border-indigo-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-indigo-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-indigo-800">Spiritual Growth</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-indigo-600">
                                        {(() => {
                                          const soulStarScore = calculateSoulStarChakra(result)/10;
                                          const score = (0.4 * (result.chakraActivity?.crown || 5)) + (0.3 * (result.chakraActivity?.thirdEye || 5)) + (0.3 * soulStarScore);
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Higher wisdom & divine intuition</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const soulStarScore = calculateSoulStarChakra(result)/10;
                                        const score = (0.4 * (result.chakraActivity?.crown || 5)) + (0.3 * (result.chakraActivity?.thirdEye || 5)) + (0.3 * soulStarScore);
                                        if (score <= 4) return "Spiritually disconnected or resisting inner voice";
                                        if (score <= 6) return "Developing spiritual awareness, some resistance";
                                        if (score <= 8) return "Good spiritual connection, regular inner guidance";
                                        return "Excellent spiritual openness and divine connection";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Physical Energy Score */}
                                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-orange-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-orange-800">Physical Energy</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-orange-600">
                                        {(() => {
                                          const score = (0.4 * (result.chakraActivity?.root || 5)) + (0.3 * (result.chakraActivity?.solarPlexus || 5)) + (0.3 * (result.chakraActivity?.sacral || 5));
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Stamina, vitality & body-mind connection</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const score = (0.4 * (result.chakraActivity?.root || 5)) + (0.3 * (result.chakraActivity?.solarPlexus || 5)) + (0.3 * (result.chakraActivity?.sacral || 5));
                                        if (score <= 4) return "Low vitality, potential health or energy blocks";
                                        if (score <= 6) return "Moderate energy levels, some vitality blocks";
                                        if (score <= 8) return "Good physical energy, healthy vitality";
                                        return "Excellent physical energy and vibrant health";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Manifestation Score */}
                                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-yellow-500 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-yellow-800">Manifestation</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-yellow-600">
                                        {(() => {
                                          const score = (0.4 * (result.chakraActivity?.solarPlexus || 5)) + (0.3 * (result.chakraActivity?.root || 5)) + (0.2 * (result.chakraActivity?.thirdEye || 5)) + (0.1 * (result.chakraActivity?.sacral || 5));
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Converting visions into tangible results</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const score = (0.4 * (result.chakraActivity?.solarPlexus || 5)) + (0.3 * (result.chakraActivity?.root || 5)) + (0.2 * (result.chakraActivity?.thirdEye || 5)) + (0.1 * (result.chakraActivity?.sacral || 5));
                                        if (score <= 4) return "Energies are scattered or sabotaged";
                                        if (score <= 6) return "Moderate manifestation ability, some blocks";
                                        if (score <= 8) return "Good manifestation skills, visions becoming reality";
                                        return "Excellent manifestation power, dreams easily realized";
                                      })()}
                                    </div>
                                  </div>

                                  {/* Protection Score */}
                                  <div className="bg-white rounded-lg p-4 border border-gray-300">
                                    <div className="flex items-center mb-3">
                                      <div className="w-5 h-5 rounded-full bg-gray-600 mr-2"></div>
                                      <h5 className="font-semibold text-sm text-gray-800">Protection</h5>
                                    </div>
                                    <div className="text-center mb-3">
                                      <div className="text-2xl font-bold text-gray-600">
                                        {(() => {
                                          const soulStarScore = calculateSoulStarChakra(result)/10;
                                          const score = (0.4 * (result.chakraActivity?.root || 5)) + (0.3 * soulStarScore) + (0.2 * (result.chakraActivity?.solarPlexus || 5)) + (0.1 * (result.chakraActivity?.thirdEye || 5));
                                          return score.toFixed(1);
                                        })()}/10
                                      </div>
                                      <div className="text-xs text-gray-500">Spiritual boundary & auric shield strength</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {(() => {
                                        const soulStarScore = calculateSoulStarChakra(result)/10;
                                        const score = (0.4 * (result.chakraActivity?.root || 5)) + (0.3 * soulStarScore) + (0.2 * (result.chakraActivity?.solarPlexus || 5)) + (0.1 * (result.chakraActivity?.thirdEye || 5));
                                        if (score <= 4) return "Highly vulnerable to others' energies";
                                        if (score <= 6) return "Moderate protection, some energetic vulnerability";
                                        if (score <= 8) return "Good energetic boundaries, stable protection";
                                        return "Excellent auric shield, strong energetic protection";
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Primary Color Analysis */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-2`} style={{backgroundColor: getAccurateColorCode(result.dominantColor)}}></div>
                                  Dominant Aura Color: {result.dominantColor}
                                </h4>
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Spiritual Meaning</h5>
                                      <p className="text-sm text-gray-700">{getColorMeaningForEnergyTab(result.dominantColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Energy Frequency</h5>
                                      <p className="text-sm text-gray-700">{getColorFrequency(result.dominantColor)}</p>
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>

                              {/* Secondary Color Analysis */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-2`} style={{backgroundColor: getAccurateColorCode(result.secondaryColor)}}></div>
                                  Overall Aura Color: {result.secondaryColor}
                                </h4>
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">How this energy makes you feel</h5>
                                      <p className="text-sm text-gray-700">{getColorMeaningForEnergyTab(result.secondaryColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Balancing Influence</h5>
                                      <p className="text-sm text-gray-700">{getColorBalance(result.dominantColor, result.secondaryColor)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>


                             
                              {/* Color Harmony Analysis */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Color Harmony & Energy Flow</h4>
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                                  <div className="space-y-3">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Dominant Energy Pattern</h5>
                                      <p className="text-sm text-gray-700">{getEnergyPattern(result.dominantColor, result.secondaryColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Recommended Color Meditation</h5>
                                      <p className="text-sm text-gray-700">{getColorMeditation(result.dominantColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Color Healing Suggestions</h5>
                                      <p className="text-sm text-gray-700">{getColorHealing(result.dominantColor, result.secondaryColor)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>




                            </div>
                          </TabsContent>
                          
                          <TabsContent value="energy-map" data-tab="energy-map">
                            {/* Screenshot Button */}
                            <div className="flex justify-end mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => captureTabScreenshot('energy-map')}
                                disabled={isCapturingScreenshot === 'energy-map'}
                                className="flex items-center gap-2"
                              >
                                {isCapturingScreenshot === 'energy-map' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4" />
                                )}
                                {isCapturingScreenshot === 'energy-map' ? 'Capturing...' : 'Capture Screenshot'}
                              </Button>
                            </div>
                            <div className="space-y-6">
                              <div className="text-center mb-6">
                                <h3 className="font-medium text-xl mb-2">Energy Map & Color Analysis</h3>
                                <p className="text-sm text-gray-600">
                                  Complete breakdown of your dominant energy and supporting color influences
                                </p>
                              </div>

                              {/* Visual Energy Map - Moved to Top */}
                              <div className="bg-black rounded-lg p-10 relative overflow-hidden">
                                
                                <div className="flex justify-center items-center space-x-8">
                                  <div className="relative">
                                    {/* Dominant Energy Visualization */}
                                    <div 
                                      className="w-24 h-24 rounded-full opacity-90 animate-pulse"
                                      style={{background: `radial-gradient(circle, ${getAccurateColorCode(result.dominantColor)} 0%, ${getAccurateColorCode(result.dominantColor)}80 50%, transparent 100%)`}}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">Dominant</span>
                                    </div>
                                  </div>
                                  
                                  {/* Secondary Energy */}
                                  <div className="relative">
                                    <div 
                                      className="w-16 h-16 rounded-full opacity-75 animate-pulse"
                                      style={{background: `radial-gradient(circle, ${getAccurateColorCode(result.secondaryColor)} 0%, ${getAccurateColorCode(result.secondaryColor)}60 50%, transparent 100%)`, animationDelay: '0.5s'}}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white font-medium text-xs">Overall</span>
                                    </div>
                                  </div>

                                  {/* Supporting energies */}
                                  {result.auraColorSpectrum && result.auraColorSpectrum.slice(2, 4).map((color, index) => (
                                    <div key={index} className="relative">
                                      <div 
                                        className="w-12 h-12 rounded-full opacity-60 animate-pulse"
                                        style={{
                                          background: `radial-gradient(circle, ${getAccurateColorCode(color)} 0%, ${getAccurateColorCode(color)}40 50%, transparent 100%)`,
                                          animationDelay: `${1 + index * 0.5}s`
                                        }}
                                      ></div>
                                    </div>
                                  ))}
                                </div>
                                <div className="text-center mt-4">
                                  <p className="text-white/80 text-xs">Energy radiating from {result.dominantColor} core through {result.secondaryColor || result.dominantColor} pathways</p>
                                </div>
                              </div>

                              <div className="space-y-6">
                                {/* 4-Zone Energy Visualization */}
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                                  <h4 className="font-semibold text-lg mb-4 text-center">Your 4-Zone Energy Map</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Receiving Energy */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: (() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return detectedColors.receiving;
                                          })()}}
                                        >
                                          <span className="text-white font-bold">⬅️</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-blue-800">{(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.receiving);
                                          })()}</h5>
                                          <p className="text-sm text-blue-600">Receiving Energy (Dynamic) - What you recieve from the enviornment</p>
                                        </div>
                                      </div>
                                      <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                                        <p className="text-sm font-medium text-blue-800">
                                          {getReceivingEnergyInterpretation((() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.receiving);
                                          })())}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Crown/Thinking Energy */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: (() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return detectedColors.thinking;
                                          })()}}
                                        >
                                          <span className="text-white font-bold">🧠</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-purple-800">{(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.thinking);
                                          })()}</h5>
                                          <p className="text-sm text-purple-600">Crown Energy (Dynamic) - How You Think and process the world that you have recieved</p>
                                        </div>
                                      </div>
                                      <div className="mt-3 p-2 bg-purple-50 rounded border-l-4 border-purple-300">
                                        <p className="text-sm font-medium text-purple-800">
                                          {getThinkingEnergyInterpretation((() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.thinking);
                                          })())}
                                        </p>
                                      </div>
                                    </div>

                                   
                                    {/* Giving Energy */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: (() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return detectedColors.giving;
                                          })()}}
                                        >
                                          <span className="text-white font-bold">➡️</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-orange-800">{(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.giving);
                                          })()}</h5>
                                          <p className="text-sm text-orange-600">Giving Energy (Dynamic) - What you give to the enviornment</p>
                                        </div>
                                      </div>
                                      <div className="mt-3 p-2 bg-orange-50 rounded border-l-4 border-orange-300">
                                        <p className="text-sm font-medium text-orange-800">
                                          {getGivingEnergyInterpretation((() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.giving);
                                          })())}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Personality Color */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-mb"
                                          style={{backgroundColor: (() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return detectedColors.personality;
                                          })()}}
                                        >
                                          <span className="text-white font-bold">🌈</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-amber-800">{(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.personality);
                                          })()}</h5>
                                          <p className="text-sm text-amber-600">Personality Color (Static) - Why you do what you do</p>
                                        </div>
                                      </div>
                                      <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-300">
                                        <p className="text-sm font-medium text-amber-800">
                                          {getOverallEnergyInterpretation((() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return getColorNameFromHex(detectedColors.personality);
                                          })())}
                                        </p>
                                      </div>
                                    </div>

                                  </div>
                                </div>

                                {/* Complete Aura Color Profile - All 4 Colors */}
                               

                                {/* Detailed Analysis Section - Specialized Aura Interpretation */}
                                <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
                                  
                                  


                                  {/* Color Composition Analysis */}
                                  <div className="mb-8 p-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border">
                                    <h4 className="font-bold text-amber-800 mb-3 flex items-center">
                                      <span className="mr-2">🎨</span>
                                      Aura Color Composition & Balance
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 mb-3">Color Dominance:</p>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Dominant Color</span>
                                            <span className="text-sm font-bold text-amber-700">{result.dominantColor} (35%)</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Secondary Color</span>
                                            <span className="text-sm font-bold text-amber-700">{result.secondaryColor} (25%)</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Supporting Colors</span>
                                            <span className="text-sm font-bold text-amber-700">{(result.auraColorSpectrum?.length || 2) - 2} colors (40%)</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 mb-3">Energy Distribution:</p>
                                        <div className="space-y-2">
                                          {(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            return [
                                              { zone: 'Crown/Thinking', percentage: 30 },
                                              { zone: 'Receiving Energy', percentage: 25 },
                                              { zone: 'Giving Energy', percentage: 25 }
                                            ].map((item, index) => (
                                              <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">{item.zone}</span>
                                                <span className="text-sm font-bold text-amber-700">{item.percentage}%</span>
                                              </div>
                                            ));
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Comprehensive Color Meanings */}
                                  <div className="mb-6 p-10 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border">
                                    <h4 className="font-bold text-green-800 mb-3 flex items-center">
                                      <span className="mr-2">📚</span>
                                      Comprehensive Color Meanings & Interpretations
                                    </h4>
                                    <div className="space-y-4">
                                      {(() => {
                                        const detectedColors = extractAllAuraColors(result);
                                        return [
                                          { 
                                            zone: 'Crown/Thinking Energy',
                                            color: getColorNameFromHex(detectedColors.thinking),
                                            hex: detectedColors.thinking,
                                            meaning: getThinkingEnergyMeaning(getColorNameFromHex(detectedColors.thinking))
                                          },
                                          { 
                                            zone: 'Receiving Energy Field',
                                            color: getColorNameFromHex(detectedColors.receiving),
                                            hex: detectedColors.receiving,
                                            meaning: getReceivingEnergyMeaning(getColorNameFromHex(detectedColors.receiving))
                                          },
                                          { 
                                            zone: 'Giving Energy Projection',
                                            color: getColorNameFromHex(detectedColors.giving),
                                            hex: detectedColors.giving,
                                            meaning: getGivingEnergyMeaning(getColorNameFromHex(detectedColors.giving))
                                          },
                                          { 
                                            zone: 'Core Personality Foundation',
                                            color: getColorNameFromHex(detectedColors.personality),
                                            hex: detectedColors.personality,
                                            meaning: getPersonalityEnergyMeaning(getColorNameFromHex(detectedColors.personality))
                                          }
                                        ].map((item, index) => (
                                          <div key={index} className="border-l-4 border-green-400 pl-4">
                                            <div className="flex items-center space-x-3 mb-2">
                                              <div className="w-6 h-6 rounded" style={{backgroundColor: item.hex}}></div>
                                              <h5 className="font-bold text-green-800">{item.zone}: {item.color}</h5>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{item.meaning}</p>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </div>

                                  {/* Spiritual & Emotional Insights */}
                                  <div className="p-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                    <h4 className="font-bold text-indigo-800 mb-3 flex items-center">
                                      <span className="mr-2">🔮</span>
                                      Spiritual & Emotional Insights
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h5 className="font-semibold text-indigo-700 mb-2">Current Life Phase:</h5>
                                        <p className="text-sm text-gray-700 mb-3">
                                          {getCurrentLifePhase(result.dominantColor, result.secondaryColor)}
                                        </p>
                                        <h5 className="font-semibold text-indigo-700 mb-2">Spiritual Strengths:</h5>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                          {(result.personalityTraits || ['Intuitive', 'Compassionate']).slice(0, 3).map((trait, index) => (
                                            <li key={index} className="flex items-center">
                                              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                                              {trait} nature
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-indigo-700 mb-2">Recommended Focus Areas:</h5>
                                        <div className="text-sm text-gray-700 space-y-2">
                                          {getRecommendedFocusAreas(result).map((area, index) => (
                                            <p key={index}>• {area}</p>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Traditional Color Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Primary Color Details */}
                                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center space-x-4 mb-4">
                                      <div 
                                        className="w-16 h-16 rounded-full flex items-center justify-center "
                                        style={{backgroundColor: getAccurateColorCode(result.dominantColor)}}
                                      >
                                        <span className="text-white font-bold text-lg">
                                          {result.dominantColor.charAt(0)}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-lg">{result.dominantColor}</h4>
                                        <p className="text-sm text-gray-600">Primary Crown Energy</p>
                                      </div>
                                    </div>

                                    {/* Positive Aspects */}
                                    <div className="mb-4">
                                      <h5 className="font-semibold text-sm text-green-700 mb-2">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Positive: {getPositiveTraits(result.dominantColor)}
                                      </h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getPositiveDescription(result.dominantColor)}
                                      </p>
                                    </div>

                                    {/* Shadow Aspects */}
                                    <div className="mb-4">
                                      <h5 className="font-semibold text-sm text-amber-700 mb-2">
                                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                        Areas for Growth: {getShadowTraits(result.dominantColor)}
                                      </h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getShadowDescription(result.dominantColor)}
                                      </p>
                                    </div>

                                    {/* Spiritual Placement */}
                                    <div>
                                      <h5 className="font-semibold text-sm text-blue-700 mb-2">
                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                        Energy Placement: {getPlacementDescription(result.dominantColor)}
                                      </h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getDetailedPlacement(result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Secondary & Supporting Colors */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-lg">Secondary & Supporting Colors</h4>
                                    
                                    {/* Secondary Color */}
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                      <div 
                                        className="w-8 h-8 rounded-full"
                                        style={{backgroundColor: getAccurateColorCode(result.secondaryColor)}}
                                      ></div>
                                      <div>
                                        <h5 className="font-medium">{result.secondaryColor}</h5>
                                        <p className="text-xs text-gray-600">Location: Right side of lower abdomen, 2 inches below navel</p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      {getSecondaryColorDescription(result.secondaryColor)}
                                    </p>
                                  </div>

                                  {/* Extended Color Spectrum */}
                                  {result.auraColorSpectrum && result.auraColorSpectrum.length > 2 && (
                                    <>
                                      {result.auraColorSpectrum.slice(2, 5).map((color, index) => (
                                        <div key={index} className="bg-gray-50 border rounded-lg p-4">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <div 
                                              className="w-8 h-8 rounded-full"
                                              style={{backgroundColor: getAccurateColorCode(color)}}
                                            ></div>
                                            <div>
                                              <h5 className="font-medium">{color}</h5>
                                              <p className="text-xs text-gray-600">{getSupportingColorLocation(color, index)}</p>
                                            </div>
                                          </div>
                                          <p className="text-sm text-gray-700">
                                            {getSupportingColorDescription(color)}
                                          </p>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Energy Interaction Map */}
                              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                                <h4 className="font-semibold text-lg mb-4">Energy Interaction Map</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Energy Flow Pattern</h5>
                                    <p className="text-sm text-gray-700">
                                      {getEnergyFlowPattern(result.dominantColor, result.secondaryColor)}
                                    </p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Compatible Energies</h5>
                                    <p className="text-sm text-gray-700">
                                      {getCompatibleEnergies(result.dominantColor)}
                                    </p>
                                  </div>
                                </div>
                              </div>



                            </div>
                          </div>
                          </TabsContent>
                          
                          <TabsContent value="combined" data-tab="combined">
                            {/* Screenshot Button */}
                            <div className="flex justify-end mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => captureTabScreenshot('combined')}
                                disabled={isCapturingScreenshot === 'combined'}
                                className="flex items-center gap-2"
                              >
                                {isCapturingScreenshot === 'combined' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4" />
                                )}
                                {isCapturingScreenshot === 'combined' ? 'Capturing...' : 'Capture Screenshot'}
                              </Button>
                            </div>
                            <div className="space-y-6">
                              {!numerologyResult ? (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                  <div className="text-center mb-6">
                                    <h3 className="font-medium text-lg mb-2">Enhanced Aura & Numerology Integration</h3>
                                    <p className="text-sm text-gray-600">
                                      Unlock deeper spiritual insights by combining your aura colors with numerological chakra analysis
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Aura Color Display */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Your Current Aura Signature</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                          <div 
                                            className="w-8 h-8 rounded-full border-2 border-white"
                                            style={{ 
                                              backgroundColor: getAccurateColorCode(result.dominantColor)
                                            }}
                                          ></div>
                                          <div>
                                            <div className="font-medium text-sm">{result.dominantColor} - Dominant</div>
                                            <div className="text-xs text-gray-600">
                                              {(() => {
                                                const connection = getChakraConnection(result.dominantColor);
                                                const parts = connection.split('. ');
                                                const numerologyPart = parts[0].replace('Numerologically connected to:', '');
                                                const planetPart = parts[1].replace('Planet:', '');
                                                const chakraPart = parts[2].split(' - ')[0];
                                                return `This color is connected to the number ${numerologyPart} and also connected to the ${chakraPart}.`;
                                              })()}
                                            </div>
                                          </div>
                                        </div>
                                        {result.secondaryColor && (
                                          <div className="flex items-center space-x-3">
                                            <div 
                                              className="w-6 h-6 rounded-full border-2 border-white"
                                              style={{ 
                                                backgroundColor: getAccurateColorCode(result.secondaryColor)
                                              }}
                                            ></div>
                                            <div>
                                              <div className="font-medium text-sm">{result.secondaryColor} - Secondary</div>
                                              <div className="text-xs text-gray-600">
                                                {(() => {
                                                  const connection = getChakraConnection(result.secondaryColor);
                                                  const parts = connection.split('. ');
                                                  const numerologyPart = parts[0].replace('Numerologically connected to:', '');
                                                  const planetPart = parts[1].replace('Planet:', '');
                                                  const chakraPart = parts[2].split(' - ')[0];
                                                  return `This color is connected to the number ${numerologyPart} and also connected to the ${chakraPart}.`;
                                                })()}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Chakra Preview */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Dominant Chakra Energy</h4>
                                      <div className="text-center">
                                        <div 
                                          className="w-16 h-16 rounded-full mx-auto mb-2 opacity-80"
                                          style={{ 
                                            backgroundColor: getAccurateColorCode(result.dominantColor)
                                          }}
                                        ></div>
                                        <div className="text-sm font-medium">{getChakraConnection(result.dominantColor).split('Chakra')[0]}Chakra</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Energy Level: {result.energyLevel}/10
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Enter your full birth name"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyName}
                                        onChange={(e) => setNumerologyName(e.target.value)}
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Birth Date
                                      </label>
                                      <input
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyBirthDate}
                                        onChange={(e) => setNumerologyBirthDate(e.target.value)}
                                      />
                                    </div>
                                    
                                    <Button 
                                      className="w-full"
                                      onClick={() => {
                                        if (!user) {
                                          window.location.href = '/login';
                                          return;
                                        }
                                        calculateNumerologyData(numerologyName, numerologyBirthDate);
                                      }}
                                      disabled={isCalculatingNumerology}
                                    >
                                      {isCalculatingNumerology ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Creating Combined Analysis...
                                        </>
                                      ) : user ? "Create Combined Spiritual Analysis" : "Login to Access Combined Analysis"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Energy Alignment Status */}
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-medium text-lg">Spiritual Energy Alignment</h3>
                                      <Badge variant={getCombinedInsights(result, numerologyResult, numerologyBirthDate).energyAlignment === 'Highly Aligned' ? 'default' : 'secondary'}>
                                        {getCombinedInsights(result, numerologyResult, numerologyBirthDate).energyAlignment}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                      {getCombinedInsights(result, numerologyResult, numerologyBirthDate).compatibility}
                                    </p>
                                  </div>

                                  {/* Combined Numbers and Colors */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Aura & Life Path Connection</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Dominant Aura Color</span>
                                          <div className="flex items-center space-x-2">
                                            <div 
                                              className="w-4 h-4 rounded-full"
                                              style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                                            ></div>
                                            <span className="text-sm font-medium">{result.dominantColor}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Life Path Number</span>
                                          <span className="text-2xl font-bold text-purple-600">{numerologyResult.lifePathNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Life Path Color</span>
                                          <div className="flex items-center space-x-2">
                                            <div 
                                              className="w-4 h-4 rounded-full"
                                              style={{ backgroundColor: getAccurateColorCode(getCombinedInsights(result, numerologyResult, numerologyBirthDate).lifePathColor) }}
                                            ></div>
                                            <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).lifePathColor}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Personality Integration</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Energy Level</span>
                                          <span className="text-sm font-medium">{result.energyLevel}/10</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Personality Number</span>
                                          <span className="text-2xl font-bold text-indigo-600">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).personalityNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Personality Color</span>
                                          <div className="flex items-center space-x-2">
                                            <div 
                                              className="w-4 h-4 rounded-full"
                                              style={{ backgroundColor: getAccurateColorCode(getCombinedInsights(result, numerologyResult, numerologyBirthDate).personalityColor) }}
                                            ></div>
                                            <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).personalityColor}</span>
                                          </div>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                          {getCombinedInsights(result, numerologyResult, numerologyBirthDate).personalityIntegration}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Enhanced Chakra & Planetary Analysis */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Chakra Alignment Details */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-100">
                                      <h4 className="font-medium mb-4 flex items-center">
                                        <div 
                                          className="w-4 h-4 rounded-full mr-2"
                                          style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                                        ></div>
                                        Dominant Soul Chakra Analysis
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Most Influential Chakra/Active Chakra</span>
                                          <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).chakraAlignment}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Planetary Influence</span>
                                          <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).planetaryInfluence}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Sacred Mantra</span>
                                          <span className="text-sm font-mono bg-white px-2 py-1 rounded">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).sacredMantra}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">The Chakra that you use most   </span>
                                          <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).dominantSoulChakra}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Archangel & Crystal Guidance */}
                                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-100">
                                      <h4 className="font-medium mb-4">Spiritual Support System</h4>
                                      <div className="space-y-3">
                                        <div>
                                          <span className="text-sm text-gray-600 block">Archangel Guidance</span>
                                          <span className="text-sm font-medium text-purple-700">{getCombinedInsights(result, numerologyResult, numerologyBirthDate).archangelGuidance}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-600 block">Healing Crystals</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {getCombinedInsights(result, numerologyResult, numerologyBirthDate).healingCrystals.map((crystal, index) => (
                                              <span key={index} className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                                                {crystal}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-600 block">Energy Alignment</span>
                                          <div className="mt-1">
                                            <Badge variant={getCombinedInsights(result, numerologyResult, numerologyBirthDate).energyAlignment === 'Perfect Alignment' ? 'default' : 
                                                           getCombinedInsights(result, numerologyResult, numerologyBirthDate).energyAlignment === 'Highly Aligned' ? 'secondary' : 'outline'}>
                                              {getCombinedInsights(result, numerologyResult, numerologyBirthDate).energyAlignment}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Combined Spiritual Guidance */}
                                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
                                    <h4 className="font-medium mb-3">Integrated Spiritual Guidance</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                      {getCombinedInsights(result, numerologyResult, numerologyBirthDate).spiritualGuidance}
                                    </p>
                                    
                                    <div className="bg-white rounded-lg p-4 border border-amber-200 mb-4">
                                      <h5 className="font-medium text-sm mb-2 text-amber-800">Personality Integration Insight</h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getCombinedInsights(result, numerologyResult, numerologyBirthDate).personalityIntegration}
                                      </p>
                                    </div>
                                    
                                    <h5 className="font-medium text-sm mb-3">Personalized Spiritual Practices</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {getCombinedInsights(result, numerologyResult, numerologyBirthDate).recommendedPractices.map((practice, index) => (
                                        <div key={index} className="flex items-start text-sm text-gray-600 bg-white p-3 rounded border border-amber-100">
                                          <span className="text-amber-500 mr-2 flex-shrink-0">•</span>
                                          <span>{practice}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Reset Option */}
                                  <div className="flex items-center justify-between pt-4 border-t">
                                    <p className="text-sm text-gray-500">
                                      Based on: {numerologyName}, {new Date(numerologyBirthDate).toLocaleDateString()}
                                    </p>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          setNumerologyResult(null);
                                          setNumerologyName("");
                                          setNumerologyBirthDate("");
                                        }}
                                      >
                                        New Analysis
                                      </Button>
                                      <Button 
                                        variant="default" 
                                        size="sm"
                                        onClick={() => {
                                          window.location.href = '/services#numerology';
                                        }}
                                      >
                                        Know More
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="numerology">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">Numerology Profile</h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Discover how your birth date and name influence your spiritual journey
                                  </p>
                                </div>
                              </div>
                              
                              {!numerologyResult ? (
                                <div className="space-y-6 bg-gray-50 rounded-lg p-6">
                                  <div className="text-center">
                                    <h4 className="font-medium">Enter Your Details</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      We'll calculate your numerology profile based on your name and birth date
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label htmlFor="fullName" className="text-sm font-medium">
                                        Full Name
                                      </label>
                                      <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyName}
                                        onChange={(e) => setNumerologyName(e.target.value)}
                                      />
                                      <p className="text-xs text-gray-500">Use your full birth name for the most accurate results</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <label htmlFor="birthDate" className="text-sm font-medium">
                                        Birth Date
                                      </label>
                                      <input
                                        id="birthDate"
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyBirthDate}
                                        onChange={(e) => setNumerologyBirthDate(e.target.value)}
                                      />
                                    </div>
                                    
                                    <Button 
                                      className="w-full"
                                      onClick={() => calculateNumerologyData(numerologyName, numerologyBirthDate)}
                                      disabled={isCalculatingNumerology}
                                    >
                                      {isCalculatingNumerology ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Calculating...
                                        </>
                                      ) : "Calculate Numerology Profile"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                                      <div className="text-3xl font-bold text-purple-800">{numerologyResult.lifePathNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Life Path Number</div>
                                    </div>
                                    
                                    <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                                      <div className="text-3xl font-bold text-indigo-800">{numerologyResult.destinyNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Destiny Number</div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                                      <div className="text-3xl font-bold text-blue-800">{numerologyResult.soulUrgeNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Soul Urge Number</div>
                                    </div>
                                    
                                    <div className="bg-sky-50 rounded-lg p-4 text-center border border-sky-100">
                                      <div className="text-3xl font-bold text-sky-800">{numerologyResult.personalityNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Personality Number</div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 text-center border border-emerald-100">
                                      <div className="text-3xl font-bold text-emerald-800">{numerologyResult.personalYearNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Personal Year Number ({new Date().getFullYear()})</div>
                                      <div className="text-xs text-gray-500 mt-1">Based on birth month + day + current year</div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                    <h4 className="font-medium mb-2">Your Numerology Interpretation</h4>
                                    <p className="text-sm text-gray-600">
                                      {numerologyResult.interpretation}
                                    </p>
                                  </div>
                                  
                                  <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                      Based on: {numerologyName}, {new Date(numerologyBirthDate).toLocaleDateString()}
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setNumerologyResult(null);
                                        setNumerologyName("");
                                        setNumerologyBirthDate("");
                                      }}
                                    >
                                      Calculate New Profile
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center">
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Tip:</span> Combine your aura colors with your numerology for deeper spiritual insights
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    if (result) setActiveTab("analysis");
                                  }}
                                >
                                  View Aura Analysis
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="analysis" data-tab="analysis">
                            {/* Screenshot Button */}
                            <div className="flex justify-end mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => captureTabScreenshot('analysis')}
                                disabled={isCapturingScreenshot === 'analysis'}
                                className="flex items-center gap-2"
                              >
                                {isCapturingScreenshot === 'analysis' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4" />
                                )}
                                {isCapturingScreenshot === 'analysis' ? 'Capturing...' : 'Capture Screenshot'}
                              </Button>
                            </div>
                            <div className="space-y-10">


                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-lg mt-2.5">Your Aura Photo Analysis</h3>
                                  <p className="text-sm text-gray-500">Analysis of the visible energy fields in your specialized aura photograph</p>
                                </div>
                                <div className="flex gap-2">
                                  <span 
                                    className="inline-block w-6 h-6 rounded-full border border-gray-200" 
                                    style={{ 
                                      backgroundColor: getAccurateColorCode(result.dominantColor)
                                    }}
                                  ></span>
                                  {(() => {
                                    // Show personality color instead of secondary color
                                    const detectedColors = extractAllAuraColors(result);
                                    const personalityColor = getColorNameFromHex(detectedColors.personality);
                                    return personalityColor && (
                                      <span 
                                        className="inline-block w-6 h-6 rounded-full border border-gray-200" 
                                        style={{ 
                                          backgroundColor: getAccurateColorCode(personalityColor)
                                        }}
                                      ></span>
                                    );
                                  })()}
                                </div>
                              </div>
                              
                              {/* Image Comparison Section */}
                              {originalImage && (
                                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                                  <h3 className="font-medium text-lg mb-4 text-center">Image Comparison: Original vs Aura Visualization</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Original Image */}
                                    <div className="text-center">
                                      <h4 className="font-medium mb-3">Original Photo</h4>
                                      <div className="relative bg-white rounded-lg shadow-sm border p-4">
                                        <img 
                                          src={originalImage} 
                                          alt="Original uploaded image" 
                                          className="w-full aspect-aura object-cover rounded-lg"
                                          style={{ maxWidth: '600px', height: 'auto' }}
                                        />
                                      </div>
                                    </div>
                                    
                                    {/* Processed Aura Image */}
                                    <div className="text-center">
                                      <h4 className="font-medium mb-3">With Aura Colors</h4>
                                      <div id="aura-visualization-container" className="relative bg-white rounded-lg shadow-sm border p-4">
                                        {enhancedAuraImage ? (
                                          <img 
                                            src={enhancedAuraImage} 
                                            alt="Image with aura colors" 
                                            className="w-full aspect-aura object-cover rounded-lg"
                                            style={{ maxWidth: '600px', height: 'auto' }}
                                          />
                                        ) : (
                                          <div className="w-full aspect-aura flex items-center justify-center bg-gray-100 rounded-lg" style={{ maxWidth: '600px' }}>
                                            <span className="text-gray-500 text-sm">Processing aura visualization...</span>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 mt-2">
                                        Dominant Aura Color: {result.dominantColor}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Aura visualization */}
                              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                  <div className="relative w-48 h-48">
                                    {/* Aura visualization with actual colors detected */}
                                    <div 
                                      className="absolute inset-0 rounded-full animate-pulse" 
                                      style={{
                                        background: `radial-gradient(circle at center, 
                                          ${getAccurateColorCode(result.dominantColor)} 80%, 
                                          ${(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            const personalityColor = getColorNameFromHex(detectedColors.personality);
                                            return getAccurateColorCode(personalityColor || result.dominantColor);
                                          })()} 70%)`
                                      }}
                                    ></div>
                                    <div 
                                      className="absolute inset-8 rounded-full" 
                                      style={{
                                        background: `radial-gradient(circle at center, 
                                          ${getAccurateColorCode(result.dominantColor)}99 90%, 
                                          ${(() => {
                                            const detectedColors = extractAllAuraColors(result);
                                            const personalityColor = getColorNameFromHex(detectedColors.personality);
                                            return getAccurateColorCode(personalityColor || result.dominantColor);
                                          })()}99 80%)`,
                                        opacity: 0.8
                                      }}
                                    ></div>
                                    <div className="absolute inset-16 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-sm">
                                      <Sparkles className="h-8 w-8 text-gray-700/60" />
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Detected Aura Colors</h4>
                                      <p className="text-sm text-gray-600 mb-3">
                                        The colored energy field visible around you in your specialized aura photograph reveals your spiritual signature:
                                      </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex items-start gap-4">
                                          <div 
                                            className="w-12 h-12 rounded-full flex-shrink-0" 
                                            style={{ 
                                              backgroundColor: getAccurateColorCode(result.dominantColor)
                                            }}
                                          ></div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="text-xs text-gray-500">Dominant Aura (Thinking Colour)</div>
                                              <div className="text-base font-bold">{result.dominantColor}</div>
                                            </div>
                                            {(() => {
                                              const colorInfo = getColorCompleteInfo(result.dominantColor);
                                              return (
                                                <div className="space-y-2">
                                                  <div className="text-xs text-gray-600">
                                                    <span className="font-medium">POSITIVE</span> {colorInfo.chakra} | 
                                                    <span className="font-medium ml-2"> Meaning: </span> {colorInfo.number}
                                                  </div>
                                                  <div className="text-xs text-gray-700 leading-relaxed">
                                                    {colorInfo.shadowMeaning}
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {(() => {
                                        // Get personality color from energy map instead of secondary color
                                        const detectedColors = extractAllAuraColors(result);
                                        const personalityColor = getColorNameFromHex(detectedColors.personality);
                                        return personalityColor && (
                                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                            <div className="flex items-start gap-4">
                                              <div 
                                                className="w-12 h-12 rounded-full flex-shrink-0" 
                                                style={{ 
                                                  backgroundColor: getAccurateColorCode(personalityColor)
                                                }}
                                              ></div>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <div className="text-xs text-gray-500">Personality Color</div>
                                                  <div className="text-base font-bold">{personalityColor}</div>
                                                </div>
                                                {(() => {
                                                  const colorInfo = getColorCompleteInfo(personalityColor);
                                                  return (
                                                    <div className="space-y-2">
                                                      <div className="text-xs text-gray-600">
                                                        <span className="font-medium">POSITIVE </span> {colorInfo.chakra} | 
                                                        <span className="font-medium ml-2">Meaning: </span> {colorInfo.number}
                                                      </div>
                                                      <div className="text-xs text-gray-700 leading-relaxed">
                                                        {colorInfo.shadowMeaning}
                                                      </div>
                                                    </div>
                                                  );
                                                })()}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-lg text-gray-500 mb-1">Aura Size</h4>
                                <Progress value={result.energyLevel * 10} className="h-2" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>Low</span>
                                  <span>Medium</span>
                                  <span>High</span>
                                </div>
                                <div className="text-center text-sm font-medium mt-1">
                                  {result.energyLevel}/10 - {getEnergyLevelDescription(result.energyLevel)}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm text-gray-500 mb-2">Personality Traits</h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.personalityTraits.map((trait, index) => (
                                    <Badge key={index} variant="outline" className="rounded-full">
                                      {trait}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Energy Aspects Section */}
                              <div>
                                <h4 className="text-sm text-gray-500 mb-4">Energy Aspects</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-3 text-center border border-amber-200">
                                    <div className="text-amber-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Recieving Energy</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.ceil(result.energyLevel * 5 / 10) ? 'bg-amber-500' : 'bg-amber-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 text-center border border-purple-200">
                                    <div className="text-purple-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Giving Energy</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor((result.chakraActivity?.heart || 5 || 5) / 2) ? 'bg-purple-500' : 'bg-purple-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-3 text-center border border-pink-200">
                                    <div className="text-pink-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2001/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Aura Quality</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor((result.chakraActivity?.solarPlexus || 5 || 5) / 2) ? 'bg-pink-500' : 'bg-pink-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                                    <div className="text-blue-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Overall Strength</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor((result.chakraActivity?.root || 5 || 5) / 2) ? 'bg-blue-500' : 'bg-blue-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                                    <div className="text-green-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Alignment</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.ceil((result.chakraActivity?.heart || 5 || 5) / 2) ? 'bg-green-500' : 'bg-green-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Personality Integration */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Personality Integration</h4>
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                                  <div className="mb-6">
                                    <p className="text-sm text-gray-700 mb-4">
                                      Your aura field reveals these dominant traits that combine to form your unique spiritual signature. 
                                      These characteristics are energetically embedded in your personal vibration and influence how you interact with the world.
                                    </p>
                                    
                                    {/* Color-Personality Connection */}
                                    <div className="mb-4 p-3 bg-white rounded-lg border border-indigo-100">
                                      <h5 className="font-medium text-sm mb-2 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                                        ></span>
                                        {result.dominantColor} Energy Influence
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        Your dominant {result.dominantColor.toLowerCase()} aura creates a personality foundation of {getColorPersonalityInfluence(result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Core Personality Traits */}
                                  <div className="mb-6">
                                    <h5 className="font-medium text-sm mb-3 text-indigo-800">Core Personality Traits</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {result.personalityTraits.map((trait, index) => (
                                        <div key={index} className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                          <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1 flex-shrink-0"></div>
                                            <div>
                                              <span className="font-medium block text-sm text-indigo-900">{trait}</span>
                                              <span className="text-xs text-gray-600 block mt-1 leading-relaxed">
                                                {getTraitExplanation({ trait, color: result.dominantColor })}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Personality Strengths & Growth Areas */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                      <h5 className="font-medium text-sm mb-2 text-green-800 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Natural Strengths
                                      </h5>
                                      <p className="text-xs text-green-700">
                                        {getPersonalityStrengths(result.dominantColor, result.personalityTraits)}
                                      </p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                      <h5 className="font-medium text-sm mb-2 text-amber-800 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Growth Opportunities
                                      </h5>
                                      <p className="text-xs text-amber-700">
                                        {getPersonalityGrowthAreas({ color: result.dominantColor, traits: result.personalityTraits })}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Relationship Dynamics */}
                                  <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 mb-6">
                                    <h5 className="font-medium text-sm mb-2 text-rose-800 flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                      </svg>
                                      Relationship Dynamics
                                    </h5>
                                    <p className="text-xs text-rose-700">
                                      {getRelationshipDynamics(result.dominantColor, result.secondaryColor)}
                                    </p>
                                  </div>

                                  {/* Career & Life Path Alignment */}
                                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h5 className="font-medium text-sm mb-2 text-blue-800 flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Career & Life Path Alignment
                                    </h5>
                                    <p className="text-xs text-blue-700">
                                      {getCareerAlignment(result.dominantColor, result.personalityTraits)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="chakras" data-tab="chakras">
                            {/* Screenshot Button */}
                            <div className="flex justify-center mb-4">
                              <p className="text-sm text-gray-600 mb-6">
                          This tab is for reference only. Please copy and paste the remedies you need in the healers notes at the bottom of the tab.
                              </p>
                              
                            </div>
                            
                            <div className="space-y-6">
                              {/* Detailed Chakra Scoring Analysis Section */}
                              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg p-6 border border-violet-200 mb-6">
                                <h4 className="font-medium text-xl mb-4 text-violet-800 flex items-center">
                                  <span className="mr-3">📊</span>
                                  Detailed Chakra Scoring Analysis
                                </h4>
                                <p className="text-sm text-gray-600 mb-6">
                                  Understanding your chakra scores and their karmic significance for spiritual development and healing.
                                </p>

                                <div className="space-y-4">
                                  {/* Chakra Score Ranges Guide */}
                                  <div className="bg-white rounded-lg p-5 border border-violet-200">
                                    <h5 className="font-semibold text-lg mb-4 text-violet-800">Chakra Score Interpretation Guide</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                      
                                      {/* Karmically Aligned (9-10) */}
                                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-emerald-600">9-10</div>
                                          <div className="text-sm font-medium text-emerald-700">Karmically Aligned</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-emerald-800">Meaning:</p>
                                          <p>Your soul is highly aligned with this lesson and you have almost learnt this lesson or not this lesson is fully mastered</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-emerald-100 rounded-full">
                                            <span className="text-xs font-medium text-emerald-700">✨ Mastered</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Currently Learning (7-8) */}
                                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-blue-600">7-8</div>
                                          <div className="text-sm font-medium text-blue-700">Currently Learning</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-blue-800">Meaning:</p>
                                          <p>You are actively working on healing and understanding this area</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-blue-100 rounded-full">
                                            <span className="text-xs font-medium text-blue-700">📚 Learning</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Karmic Test (4-6) */}
                                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-amber-600">4-6</div>
                                          <div className="text-sm font-medium text-amber-700">Karmic Test</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-amber-800">Meaning:</p>
                                          <p>You are undergoing challenges in this aspect of life and you will notice repetitive patterns in this area until you break the pattern</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-amber-100 rounded-full">
                                            <span className="text-xs font-medium text-amber-700">⚡ Testing</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Karmic Block (1-3) */}
                                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-red-600">1-3</div>
                                          <div className="text-sm font-medium text-red-700">Karmic Block</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-red-800">Meaning:</p>
                                          <p>Deep-rooted block or ancestral karma making you feel stuck; urgent healing required</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-red-100 rounded-full">
                                            <span className="text-xs font-medium text-red-700">🚫 Blocked</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                              
                                 

                                  {/* Healing Priority Guide */}
                                  <div className="bg-white rounded-lg p-5 border border-violet-200">
                                    
                                   
                                  
                                  </div>
                                </div>
                              </div>

                              <h3 className="font-medium text-lg">9-Chakra Energy System Analysis</h3>
                              
                              <div className="space-y-4">

                                {/* Soul Star Chakra */}
                                <div className="bg-gradient-to-r from-white to-yellow-50 rounded-lg p-4 border border-gray-300">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Soul Star Chakra connects you to your soul's purpose, divine guidance, and highest spiritual potential beyond the physical realm.
                                    </p>
                                    {(() => {
                                      const soulStarScore = Math.round(calculateSoulStarChakra(result)/10);
                                      const karmic = getKarmicIndication(soulStarScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Remembering your soul purpose & Connection with your soul
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Soul Star Chakra</span>
                                      <span className="text-gray-700">{Math.round(calculateSoulStarChakra(result)/10)}/10 ({calculateSoulStarChakra(result)}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={calculateSoulStarChakra(result)} className="h-3 bg-gray-100" />
                                </div>

                                {/* Crown Chakra - Number 3 */}
                                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Crown Chakra governs spiritual connection, divine wisdom, and your link to universal consciousness and higher guidance.
                                    </p>
                                    {(() => {
                                      const crownScore = result.chakraActivity?.crown || 5;
                                      const karmic = getKarmicIndication(crownScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Reconnecting with Source beyond and trusting the divine timing
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Crown Chakra</span>
                                      <span className="text-violet-600">{result.chakraActivity?.crown || 5}/10 ({(result.chakraActivity?.crown || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.crown || 5) * 10} className="h-3 bg-violet-100" />
                                </div>
                                
                                {/* Third Eye Chakra - Number 8 */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Third Eye Chakra enhances intuition, psychic abilities, inner wisdom, and your capacity to see beyond the physical realm.
                                    </p>
                                    {(() => {
                                      const thirdEyeScore = result.chakraActivity?.thirdEye || 5;
                                      const karmic = getKarmicIndication(thirdEyeScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Breaking illusions and mental control to trust intuition and remove self doubt
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Third Eye Chakra</span>
                                      <span className="text-indigo-600">{result.chakraActivity?.thirdEye || 5}/10 ({(result.chakraActivity?.thirdEye || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.thirdEye || 5) * 10} className="h-3 bg-indigo-100" />
                                </div>
                                
                                {/* Throat Chakra - Number 5 */}
                                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Throat Chakra governs communication, self-expression, truth-speaking, and your ability to voice your authentic self.
                                    </p>
                                    {(() => {
                                      const throatScore = result.chakraActivity?.throat || 5;
                                      const karmic = getKarmicIndication(throatScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Healing silenced expression from past lifetimes and speaking your truth and sharing what you feel
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Throat Chakra</span>
                                      <span className="text-blue-600">{result.chakraActivity?.throat || 5}/10 ({(result.chakraActivity?.throat || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.throat || 5) * 10} className="h-3 bg-blue-100" />
                                </div>
                                
                                {/* Heart Chakra - Number 2 */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Heart Chakra controls love, compassion, emotional healing, relationships, and your ability to give and receive love.
                                    </p>
                                    {(() => {
                                      const heartScore = result.chakraActivity?.heart || 5;
                                      const karmic = getKarmicIndication(heartScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Releasing fear of vulnerability and being able to give and receive with balanced boundaries
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Heart Chakra</span>
                                      <span className="text-green-600">{result.chakraActivity?.heart || 5}/10 ({(result.chakraActivity?.heart || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.heart || 5) * 10} className="h-3 bg-green-100" />
                                </div>
                                
                                {/* Solar Plexus Chakra - Number 1 */}
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Solar Plexus Chakra governs personal power, confidence, willpower, and your sense of identity and self-worth.
                                    </p>
                                    {(() => {
                                      const solarPlexusScore = result.chakraActivity?.solarPlexus || 5;
                                      const karmic = getKarmicIndication(solarPlexusScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Stepping into your personal power & confidence to letting go of the self-sacrificial nature
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Solar Plexus Chakra</span>
                                      <span className="text-yellow-600">{result.chakraActivity?.solarPlexus || 5}/10 ({(result.chakraActivity?.solarPlexus || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.solarPlexus || 5) * 10} className="h-3 bg-yellow-100" />
                                </div>
                                
                                {/* Sacral Chakra - Number 6 */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Sacral Chakra influences creativity, sexuality, emotional flow, pleasure, and your capacity for joy and passion.
                                    </p>
                                    {(() => {
                                      const sacralScore = result.chakraActivity?.sacral || 5;
                                      const karmic = getKarmicIndication(sacralScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Reclaiming emotional freedom and self-worth and letting go of guilt, shame, unworthiness around pleasure and emotional feelings
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Sacral Chakra</span>
                                      <span className="text-orange-600">{result.chakraActivity?.sacral || 5}/10 ({(result.chakraActivity?.sacral || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.sacral || 5) * 10} className="h-3 bg-orange-100" />
                                </div>
                                
                                {/* Root Chakra - Number 9 */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Root Chakra provides grounding, survival instincts, physical vitality, and your connection to earth energy and stability.
                                    </p>
                                    {(() => {
                                      const rootScore = result.chakraActivity?.root || 5;
                                      const karmic = getKarmicIndication(rootScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Ability to trust life decisions, take actions to create stability & security in life
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Root Chakra</span>
                                      <span className="text-red-600">{result.chakraActivity?.root || 5}/10 ({(result.chakraActivity?.root || 5) * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={(result.chakraActivity?.root || 5) * 10} className="h-3 bg-red-100" />
                                </div>

                                {/* Earth Star Chakra - Number 8 */}
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Earth Star Chakra anchors you to earth energy and ansectral energy, creates a support system nad monetary stability.
                                    </p>
                                    {(() => {
                                      const earthStarScore = Math.round(calculateEarthStarChakra(result)/10);
                                      const karmic = getKarmicIndication(earthStarScore);
                                      return (
                                        <p className="text-sm text-gray-600 mb-3">
                                          <span className={`font-semibold ${karmic.color}`}>{karmic.status}</span> - Karmic Lesson: Ancestral karmic inheritance, Money, Support from your blood line and Living your life as per your soul contract
                                        </p>
                                      );
                                    })()}
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Earth Star Chakra</span>
                                      <span className="text-amber-600">{Math.round(calculateEarthStarChakra(result)/10)}/10 ({calculateEarthStarChakra(result)}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={calculateEarthStarChakra(result)} className="h-3 bg-amber-100" />
                                </div>

                              </div>

                              {/* Detailed Chakra Scoring Analysis Section */}
                              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg p-6 border border-violet-200 mb-6">
                                <h4 className="font-medium text-xl mb-4 text-violet-800 flex items-center">
                                  <span className="mr-3">📊</span>
                                  Detailed Chakra Scoring Analysis
                                </h4>
                                <p className="text-sm text-gray-600 mb-6">
                                  Understanding your chakra scores and their karmic significance for spiritual development and healing.
                                </p>

                                <div className="space-y-4">
                                  {/* Chakra Score Ranges Guide */}
                                  <div className="bg-white rounded-lg p-5 border border-violet-200">
                                    <h5 className="font-semibold text-lg mb-4 text-violet-800">Chakra Score Interpretation Guide</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                      
                                      {/* Karmically Aligned (9-10) */}
                                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-emerald-600">9-10</div>
                                          <div className="text-sm font-medium text-emerald-700">Karmically Aligned</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-emerald-800">Meaning:</p>
                                          <p>Your soul is highly aligned with this lesson and you have almost learnt this lesson or not this lesson is fully mastered</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-emerald-100 rounded-full">
                                            <span className="text-xs font-medium text-emerald-700">✨ Mastered</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Currently Learning (7-8) */}
                                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-blue-600">7-8</div>
                                          <div className="text-sm font-medium text-blue-700">Currently Learning</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-blue-800">Meaning:</p>
                                          <p>You are actively working on healing and understanding this area</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-blue-100 rounded-full">
                                            <span className="text-xs font-medium text-blue-700">📚 Learning</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Karmic Test (4-6) */}
                                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-amber-600">4-6</div>
                                          <div className="text-sm font-medium text-amber-700">Karmic Test</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-amber-800">Meaning:</p>
                                          <p>You are undergoing challenges in this aspect of life and you will notice repetitive patterns in this area until you break the pattern</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-amber-100 rounded-full">
                                            <span className="text-xs font-medium text-amber-700">⚡ Testing</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Karmic Block (1-3) */}
                                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                                        <div className="text-center mb-3">
                                          <div className="text-2xl font-bold text-red-600">1-3</div>
                                          <div className="text-sm font-medium text-red-700">Karmic Block</div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <p className="font-medium text-red-800">Meaning:</p>
                                          <p>Deep-rooted block or ancestral karma making you feel stuck; urgent healing required</p>
                                        </div>
                                        <div className="mt-3 flex justify-center">
                                          <div className="px-3 py-1 bg-red-100 rounded-full">
                                            <span className="text-xs font-medium text-red-700">🚫 Blocked</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                              
                                 

                                  {/* Healing Priority Guide */}
                                  <div className="bg-white rounded-lg p-5 border border-violet-200">
                                    <h5 className="font-semibold text-lg mb-4 text-violet-800">Recommended Healing Priority</h5>
                                    <div className="space-y-3">
                                      {(() => {
                                        const chakras = [
                                          { name: 'Soul Star Chakra', score: Math.round(calculateSoulStarChakra(result)/10) },
                                          { name: 'Crown Chakra', score: result.chakraActivity?.crown || 5 },
                                          { name: 'Third Eye Chakra', score: result.chakraActivity?.thirdEye || 5 },
                                          { name: 'Throat Chakra', score: result.chakraActivity?.throat || 5 },
                                          { name: 'Heart Chakra', score: result.chakraActivity?.heart || 5 },
                                          { name: 'Solar Plexus Chakra', score: result.chakraActivity?.solarPlexus || 5 },
                                          { name: 'Sacral Chakra', score: result.chakraActivity?.sacral || 5 },
                                          { name: 'Root Chakra', score: result.chakraActivity?.root || 5 },
                                          { name: 'Earth Star Chakra', score: Math.round(calculateEarthStarChakra(result)/10) },
                                        ];

                                        // Sort chakras by score (lowest first for healing priority)
                                        const sortedChakras = [...chakras].sort((a, b) => a.score - b.score);
                                        
                                        return sortedChakras.slice(0, 3).map((chakra, index) => {
                                          const priority = index === 0 ? 'Highest Priority' : index === 1 ? 'Medium Priority' : 'Lower Priority';
                                          const priorityColor = index === 0 ? 'red' : index === 1 ? 'amber' : 'blue';
                                          
                                          return (
                                            <div key={index} className={`flex items-center justify-between p-3 bg-${priorityColor}-50 rounded-lg border border-${priorityColor}-200`}>
                                              <div className="flex items-center">
                                                <span className={`text-lg font-bold text-${priorityColor}-600 mr-3`}>{index + 1}</span>
                                                <span className="font-medium text-gray-800">{chakra.name}</span>
                                              </div>
                                              <div className="flex items-center">
                                                <span className="text-sm text-gray-600 mr-3">Score: {chakra.score}/10</span>
                                                <div className={`px-3 py-1 bg-${priorityColor}-100 rounded-full`}>
                                                  <span className={`text-xs font-medium text-${priorityColor}-700`}>{priority}</span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4 italic">
                                      Focus on healing the chakras with lowest scores first, as they represent the most urgent areas needing attention.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Comprehensive Chakra Remedies & Guidance Section */}
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                                <h4 className="font-medium text-xl mb-4 text-indigo-800">Chakra Remedies & Healing Guidance</h4>
                                <p className="text-sm text-gray-600 mb-6">
                                  Based on your chakra activity levels, here are specific remedies and practices to enhance your energy flow and spiritual balance.
                                </p>

                                <div className="space-y-6">
                                  
                                  {/* Root Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-red-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-red-500 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-red-800">Root Chakra (Muladhara) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Action, Stability, Security, Passion, Decisions</li>
                                          <li>• Physical symptoms: Lower back pain, constipation, fatigue</li>
                                          <li>• Emotional: Financial insecurity, lack of confidence</li>
                                          <li>• Spiritual: Disconnection from earth energy</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> LAM, Hanuman Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I am full of energy and confident"</li>
                                          <li>• <strong>Colors:</strong> Bright Red clothing/surroundings</li>
                                          <li>• <strong>Crystals:</strong> Red Jasper, Red Garnet</li>
                                          <li>• <strong>Essential Oils:</strong> Cedarwood, Patchouli, Clove</li>
                                          <li>• <strong>Rudraksha:</strong> 11 Mukhi (main), 3 Mukhi (alternative)</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sacral Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-orange-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-orange-500 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-orange-800">Sacral Chakra (Svadhishthana) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Sexuality, Creativity, Balance, Passion, Emotions</li>
                                          <li>• Physical: Reproductive issues, lower back pain, kidney problems</li>
                                          <li>• Emotional: Guilt, shame, lack of creative expression</li>
                                          <li>• Karmic: Feeling guilty when not helping others</li>
                                          <li>• Spiritual: Imbalanced creative and sexual energy </li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> VAM, Brahma Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I embrace my creativity and emotions"</li>
                                          <li>• <strong>Colors:</strong> Orange clothing, foods, flowers</li>
                                          <li>• <strong>Crystals:</strong> Carnelian, Orange Calcite</li>
                                          <li>• <strong>Essential Oils:</strong> Sandalwood, Orange, Ylang Ylang</li>
                                          <li>• <strong>Rudraksha:</strong> 6 Mukhi for emotional balance</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Solar Plexus Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-yellow-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-yellow-400 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-yellow-700">Solar Plexus Chakra (Manipura) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Personal Power, Confidence, Will, Self-esteem</li>
                                          <li>• Physical: Digestive issues, stomach problems, diabetes</li>
                                          <li>• Emotional: Low self-worth, lack of confidence</li>
                                          <li>• Mental: Poor decision-making, lack of willpower</li>
                                          <li>• Spiritual: Confidance Imbalance</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> RAM, Surya Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I am powerful and confident"</li>
                                          <li>• <strong>Colors:</strong> Bright Yellow, Golden colors</li>
                                          <li>• <strong>Crystals:</strong> Citrine, Yellow Topaz, Tiger's Eye</li>
                                          <li>• <strong>Essential Oils:</strong> Lemon, Ginger, Peppermint</li>
                                          <li>• <strong>Rudraksha:</strong> 3 Mukhi for confidence</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Heart Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-green-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-green-500 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-green-800">Heart Chakra (Anahata) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Love, Compassion, Relationships, Forgiveness</li>
                                          <li>• Physical: Heart problems, lung issues, circulation</li>
                                          <li>• Emotional: Difficulty loving, relationship issues</li>
                                          <li>• Social: Problems with giving and receiving love</li>
                                          <li>• Spiritual: Imbalanced Relationships </li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> YAM, Krishna Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I give and receive love freely"</li>
                                          <li>• <strong>Colors:</strong> Green, Pink heart-healing colors</li>
                                          <li>• <strong>Crystals:</strong> Rose Quartz, Green Aventurine</li>
                                          <li>• <strong>Essential Oils:</strong> Rose, Lavender, Eucalyptus</li>
                                          <li>• <strong>Rudraksha:</strong> 4 Mukhi for emotional healing</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Throat Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-blue-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-blue-500 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-blue-800">Throat Chakra (Vishuddha) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Communication, Truth, Expression, Authenticity</li>
                                          <li>• Physical: Throat issues, neck pain, thyroid problems</li>
                                          <li>• Emotional: Fear of speaking truth, suppressed voice</li>
                                    
                                          <li>• Spiritual: Self Expression Problems</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> HAM, Saraswati Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I speak my truth with clarity"</li>
                                          <li>• <strong>Colors:</strong> Blue, turquoise communication colors</li>
                                          <li>• <strong>Crystals:</strong> Blue Lace Agate, Sodalite</li>
                                          <li>• <strong>Essential Oils:</strong> Eucalyptus, Tea Tree, Chamomile</li>
                                          <li>• <strong>Rudraksha:</strong> 5 Mukhi for communication</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Third Eye Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-indigo-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-indigo-500 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-indigo-800">Third Eye Chakra (Ajna) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Intuition, Wisdom, Psychic Abilities, Inner Vision</li>
                                          <li>• Physical: Headaches, eye problems, sleep issues</li>
                                          <li>• Mental: Lack of clarity, poor intuition</li>
                                          <li>• Spiritual: Disconnection from higher guidance</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> OM, Shiva Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I trust my inner wisdom"</li>
                                          <li>• <strong>Colors:</strong> Indigo, deep purple for insight</li>
                                          <li>• <strong>Crystals:</strong> Amethyst, Lapis Lazuli</li>
                                          <li>• <strong>Essential Oils:</strong> Frankincense, Clary Sage</li>
                                          <li>• <strong>Rudraksha:</strong> 6 Mukhi for intuition</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Crown Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-purple-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-purple-500 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-purple-800">Crown Chakra (Sahasrara) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Spiritual Connection, Divine Wisdom, Enlightenment</li>
                                          <li>• Physical: Top of head sensitivity, brain fog</li>
                                          <li>• Mental: Lack of purpose, spiritual emptiness</li>
                                          <li>• Spiritual: Disconnection from divine source</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> Silence, OM, Divine Gayatri</li>
                                          <li>• <strong>Affirmation:</strong> "I am connected to divine wisdom"</li>
                                          <li>• <strong>Colors:</strong> Violet, white, gold spiritual colors</li>
                                          <li>• <strong>Crystals:</strong> Clear Quartz, Selenite</li>
                                          <li>• <strong>Essential Oils:</strong> Lotus, Frankincense</li>
                                          <li>• <strong>Rudraksha:</strong> 1 Mukhi for spiritual connection</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Earth Star Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-gray-400">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-yellow-600 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-yellow-800">Earth Star Chakra (Prithvi) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Grounding, Earth Connection, Physical Stability, Ancestral Wisdom</li>
                                          <li>• Physical: Leg/foot problems, low energy, immune issues</li>
                                          <li>• Emotional: Feeling ungrounded, disconnected from nature</li>
                                          <li>• Spiritual: Lack of earth connection, ancestral blockages</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> "Prithvi Shaktya" (Earth Power)</li>
                                          <li>• <strong>Affirmation:</strong> "I am deeply rooted in Earth's wisdom"</li>
                                          <li>• <strong>Colors:</strong> Black, brown, deep earth tones</li>
                                          <li>• <strong>Crystals:</strong> Hematite, Black Tourmaline, Smoky Quartz</li>
                                          <li>• <strong>Essential Oils:</strong> Vetiver, Patchouli, Cedarwood</li>
                                          <li>• <strong>Practices:</strong> Walking barefoot, gardening, nature meditation</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Soul Star Chakra Remedies */}
                                  <div className="bg-white rounded-lg p-5 border border-pink-200">
                                    <div className="flex items-center mb-4">
                                      <div className="w-6 h-6 rounded-full bg-pink-300 mr-3"></div>
                                      <h5 className="font-semibold text-lg text-pink-800">Soul Star Chakra (Antahkarana) Healing</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Core Lessons & Symptoms</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• Soul Purpose, Divine Mission, Cosmic Connection, Higher Self</li>
                                          <li>• Physical: Top of head tingling, light sensitivity</li>
                                          <li>• Mental: Confusion about life purpose, spiritual overwhelm</li>
                                          <li>• Spiritual: Disconnection from soul mission, cosmic isolation</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">Remedies & Practices</h6>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          <li>• <strong>Mantra:</strong> "So Hum" (I am that I am)</li>
                                          <li>• <strong>Affirmation:</strong> "I am aligned with my soul's purpose"</li>
                                          <li>• <strong>Colors:</strong> Brilliant white, magenta, cosmic silver</li>
                                          <li>• <strong>Crystals:</strong> Moldavite, Phenakite, Clear Quartz</li>
                                          <li>• <strong>Essential Oils:</strong> White Lotus, Sandalwood, Rose</li>
                                          <li>• <strong>Practices:</strong> Star gazing, soul retrieval meditation, past-life healing</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                </div>

                                {/* General Healing Instructions */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200 mt-6">
                                  <h5 className="font-semibold text-lg text-blue-800 mb-3">Universal Healing Guidelines</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h6 className="font-medium text-sm text-gray-800 mb-2">Affirmation Practice</h6>
                                      <p className="text-xs text-gray-600">
                                        Write affirmations with colored pens matching the chakra color. Practice before sleeping for subconscious programming.
                                      </p>
                                    </div>
                                    <div>
                                      <h6 className="font-medium text-sm text-gray-800 mb-2">Crystal Care</h6>
                                      <p className="text-xs text-gray-600">
                                        Cleanse crystals weekly in salt water, sun-dry, and program with healing intentions for maximum effectiveness.
                                      </p>
                                    </div>
                                    <div>
                                      <h6 className="font-medium text-sm text-gray-800 mb-2">Mantra Timing</h6>
                                      <p className="text-xs text-gray-600">
                                        Chant mantras minimum 27 rounds, followed by 5 minutes silence. Set intention to balance chakras before chanting.
                                      </p>
                                    </div>
                                    <div>
                                      <h6 className="font-medium text-sm text-gray-800 mb-2">Essential Oil Usage</h6>
                                      <p className="text-xs text-gray-600">
                                        Dilute with carrier oils, diffuse in aroma lamps, or use as perfume. Consider oil properties for proper timing.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                              {/* Chakra Summary */}
                              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                                <h4 className="font-medium text-lg mb-3">Your Chakra Profile</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {(() => {
                                    // Calculate raw averages for each chakra group (9 chakras total)
                                    const higherRaw = (calculateSoulStarChakra(result)/10 + result.chakraActivity?.crown || 5 + result.chakraActivity?.thirdEye || 5) / 3;
                                    const middleRaw = (result.chakraActivity?.throat || 5 + result.chakraActivity?.heart || 5 + result.chakraActivity?.solarPlexus || 5) / 3;
                                    const lowerRaw = (result.chakraActivity?.sacral || 5 + result.chakraActivity?.root || 5 + calculateEarthStarChakra(result)/10) / 3;
                                    
                                    // Calculate total and normalize to 100%
                                    const total = higherRaw + middleRaw + lowerRaw;
                                    const higherPercent = Math.round((higherRaw / total) * 100);
                                    const middlePercent = Math.round((middleRaw / total) * 100);
                                    const lowerPercent = 100 - higherPercent - middlePercent; // Ensure exact 100% total
                                    
                                    return (
                                      <>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-purple-600 mb-1">
                                            {higherPercent}%
                                          </div>
                                          <div className="text-sm text-gray-600">Higher Chakras</div>
                                          <div className="text-xs text-gray-500">Spiritual Connection</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-green-600 mb-1">
                                            {middlePercent}%
                                          </div>
                                          <div className="text-sm text-gray-600">Middle Chakras</div>
                                          <div className="text-xs text-gray-500">Emotional Balance</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-red-600 mb-1">
                                            {lowerPercent}%
                                          </div>
                                          <div className="text-sm text-gray-600">Lower Chakras</div>
                                          <div className="text-xs text-gray-500">Physical Grounding</div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Life Score Analysis Based on Chakra Activity */}
                              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-200">
                                
                               

                                
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                          
                          <TabsContent value="guidance" data-tab="guidance">
                            {/* Screenshot Button */}
                            <div className="flex justify-end mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => captureTabScreenshot('guidance')}
                                disabled={isCapturingScreenshot === 'guidance'}
                                className="flex items-center gap-2"
                              >
                                {isCapturingScreenshot === 'guidance' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4" />
                                )}
                                {isCapturingScreenshot === 'guidance' ? 'Capturing...' : 'Capture Screenshot'}
                              </Button>
                            </div>
                            <div className="space-y-6">
                              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                                  <Sparkles className="h-5 w-5" />
                                  Spiritual Guidance
                                </h3>
                                
                                {/* Main spiritual guidance */}
                                <div className="mb-4">
                                  <p className="text-sm text-purple-700 leading-relaxed">
                                    {result.spiritualGuidance || `Your ${result.dominantColor} aura carries deep spiritual significance, representing a unique energy signature that connects you to higher realms. This color frequency resonates with transformation, healing, and spiritual awakening. Your aura reflects your soul's journey toward enlightenment and your natural ability to channel divine energy for healing and guidance.`}
                                  </p>
                                </div>

                                {/* Enhanced guidance based on colors */}
                                <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                                  <h4 className="font-medium text-purple-800 mb-3">Aura Color Meanings</h4>
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                     
                                      <div>
                                        <p className="font-medium text-sm text-gray-800">{result.dominantColor} (Thinking)</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                          {(() => {
                                            const meanings: Record<string, string> = {
                                              'Black': 'Shadow integration and transformation energy representing deep inner work, void consciousness, and spiritual rebirth through darkness.',
                                              'White': 'Spiritually pure, transcendent, deeply sensitive, universal connection. Energetically vulnerable, escapist tendencies, difficulty being grounded.       Learning to protect energy and feel safe in the physical world.',
                                              'Brown': 'Humble, grounded, connected to nature and body, down-to-earth wisdom.   Stagnation, lack of ambition, heaviness, resistance to change.  Bringing movement into life while staying rooted.',
                                              'Red': 'Action-oriented, passionate, driven, energized and grounded in goals. Could indicate Suppressed anger, burnout, aggressive or reactive behavior, hyper competitiveness.   Balancing drive with emotional regulation.',
                                              'Yellow': 'Confident, radiant, strong leadership energy, optimistic and intelligent.      Perfectionist, controlling, rigid expectations, critical of self and others.    Letting go of control and embracing flow.',
                                              'Blue': 'Peaceful communicator, emotionally calm, expressive and serene presence. Lethargy, emotional shutdown, fear of speaking up, hidden sadness.      Learning to express needs clearly and calmly.',
                                              'Green': 'Compassionate, healer energy, emotionally balanced and nurturing.       Overgiving, energy depletion, putting others before self to a harmful degree.   Setting boundaries while nurturing others.',
                                              'Violet': 'Highly spiritual, visionary, deeply connected to purpose and divine calling.   Disconnected from higher self, confusion about life purpose, escapism or spiritual bypassing.   Difficulty balancing spiritual connection with everyday life.',
                                              'Indigo': 'Strong intuitive abilities, psychic insight, deep inner knowing and truth-seeking.     Overwhelmed by inner visions, escapism, fear of trusting intuition or self-doubt.       Trusting one’s psychic abilities and grounding insights..',
                                              'Purple': 'Spiritual wisdom and mystical awareness. This royal frequency indicates deep spiritual development and connection to higher realms.',
                                              'Gold': 'Divinely protected, powerful soul guide, radiant and healed presence.    Ego inflation, spiritual superiority, loneliness from being different.  Staying humble while embracing one’s light.',
                                              'Silver': 'Psychic, channeling divine wisdom, sensitive to spiritual realms, graceful soul.       Energetic overload, anxiety, unclear boundaries, difficulty being in the body.  Grounding spiritual gifts with practical living.',
                                              'Orange': 'Creative, joyful, playful, sensually alive, loves experiencing pleasure and life.      Restlessness, overindulgence, scattered energy, addicted to stimulation.        Channeling creativity in consistent and meaningful ways.',
                                              'Pink': 'Loving, emotionally open, romantic, deeply caring and affectionate.      Over-sensitive, emotionally dependent, fear of rejection or abandonment.        Balancing love with self-worth and independence.'
                                            };
                                            return meanings[result.dominantColor] || 'This unique aura color carries special spiritual significance and represents your individual soul expression.';
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {result.secondaryColor && (
                                      <div className="flex items-start gap-3">
                                      
                                        <div>
                                          <p className="font-medium text-sm text-gray-800">{result.secondaryColor} (Receiving)</p>
                                          <p className="text-xs text-gray-600 leading-relaxed">
                                            {(() => {
                                              const meanings: Record<string, string> = {
                                                'Black': 'Secondary shadow work support adding transformation power and deep inner healing to your spiritual path.',
                                                'White': 'Secondary purification support cleansing and protecting your spiritual energy field.',
                                                'Brown': 'Secondary grounding support adding earthly stability and material wisdom to your spiritual expression.',
                                                'Turquoise': 'Secondary communication healing support blending emotional wisdom with clear authentic expression.',
                                                'Red': 'Action-oriented, passionate, driven, energized and grounded in goals.   Suppressed anger, burnout, aggressive or reactive behavior, hyper competitiveness.      Balancing drive with emotional regulation.',
                                                'Yellow': 'Secondary mental clarity enhancement bringing intellectual wisdom to complement your dominant frequency.',
                                                'Blue': 'Secondary communication enhancement supporting truth and authentic expression in all interactions.',
                                                'Green': 'Secondary healing support energy that nurtures and balances your primary spiritual expression.',
                                                'Violet': 'Secondary divine connection support elevating your consciousness to higher spiritual realms.',
                                                'Indigo': 'Secondary intuitive support opening deeper psychic awareness and spiritual perception.',
                                                'Purple': 'Secondary mystical wisdom support enhancing your spiritual development and inner knowing.',
                                                'Gold': 'Secondary divine wisdom support illuminating your path with sacred knowledge and enlightenment.',
                                                'Silver': 'Secondary psychic enhancement supporting your intuitive abilities and emotional sensitivity.',
                                                'Orange': 'Secondary creative spark supporting your main energy with artistic inspiration and emotional flow.',
                                                'Pink': 'Secondary love support bringing gentle nurturing energy to balance your spiritual journey.'
                                              };
                                              return meanings[result.secondaryColor] || 'This unique aura color carries special spiritual significance and represents your individual soul expression.';
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Spiritual practices and recommendations */}
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                  <h4 className="font-medium text-amber-800 mb-3">Recommended Spiritual Practices</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs font-medium text-amber-700 mb-1">Meditation Focus</p>
                                      <p className="text-xs text-amber-600">
                                        {(() => {
                                          const focuses: Record<string, string> = {
                                            'Red': 'Focus on root chakra grounding meditations and earth connection practices',
                                            'Orange': 'Practice creative visualization and emotional flow meditations',
                                            'Yellow': 'Concentrate on solar plexus strengthening and confidence-building meditations',
                                            'Green': 'Engage in heart-opening meditations and loving-kindness practices',
                                            'Blue': 'Focus on throat chakra activation and truth expression meditations',
                                            'Indigo': 'Practice third eye opening and intuitive development meditations',
                                            'Violet': 'Engage in crown chakra connection and divine consciousness meditations',
                                            'Purple': 'Focus on spiritual wisdom and mystical awareness practices',
                                            'Pink': 'Practice unconditional love and emotional healing meditations',
                                            'Gold': 'Concentrate on divine wisdom and enlightenment meditations',
                                            'White': 'Focus on pure light meditation and spiritual protection practices',
                                            'Silver': 'Practice lunar energy and psychic sensitivity meditations'
                                          };
                                          return focuses[result.dominantColor] || 'Focus on connecting with your unique aura color energy during meditation';
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-amber-700 mb-1">Energy Work</p>
                                      <p className="text-xs text-amber-600">
                                        {(() => {
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
                                          return practices[result.dominantColor] || 'Work with your unique aura energy through specialized spiritual practices';
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-amber-700 mb-1">Chakra Alignment</p>
                                      <p className="text-xs text-amber-600">
                                        {(() => {
                                          const guidance: Record<string, string> = {
                                            'Black': 'Integrate shadow aspects through transformation work, void consciousness, and spiritual rebirth',
                                            'White': 'Purify all chakras through light work and spiritual protection practices',
                                            'Brown': 'Ground all chakras through earth connection, material stability, and natural wisdom',
                                            'Turquoise': 'Bridge heart and throat chakras through healing communication and emotional truth',
                                            'Red': 'Strengthen root chakra through grounding, stability practices, and earth connection',
                                            'Yellow': 'Energize solar plexus through confidence building, personal power, and mental clarity',
                                            'Blue': 'Clear throat chakra through authentic expression, truth telling, and communication',
                                            'Green': 'Open heart chakra through love practices, compassion, and emotional healing',
                                            'Violet': 'Connect crown chakra through spiritual practices, divine connection, and meditation',
                                            'Indigo': 'Activate third eye through intuition development, inner wisdom, and perception',
                                            'Purple': 'Balance all chakras through spiritual wisdom and mystical awareness practices',
                                            'Gold': 'Illuminate all chakras through divine wisdom and spiritual enlightenment',
                                            'Silver': 'Sensitize all chakras through lunar energy and psychic development',
                                            'Orange': 'Balance sacral chakra through creativity, emotional flow, and healthy boundaries',
                                            'Pink': 'Heal heart chakra through unconditional love, emotional nurturing, and compassion'
                                          };
                                          return guidance[result.dominantColor] || 'Work with your corresponding chakra system for optimal energy alignment';
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-amber-700 mb-1">Daily Practice</p>
                                      <p className="text-xs text-amber-600">
                                        {(() => {
                                          const practices: Record<string, string> = {
                                            'Black': 'Intensive shadow work, addressing negativity, healing deep trauma and darkness',
                                            'White': 'Light protection visualization, spiritual cleansing, wear white clothing',
                                            'Brown': 'Earth connection walks, grounding meditation, wear brown or earth tones',
                                            'Turquoise': 'Healing communication practice, emotional truth expression, wear turquoise jewelry',
                                            'Red': 'Morning grounding visualization, wear red colors, practice physical exercise',
                                            'Yellow': 'Confidence affirmations, mental clarity exercises, wear yellow accessories',
                                            'Blue': 'Truth-telling practice, clear communication, wear blue jewelry',
                                            'Green': 'Heart-opening gratitude practice, nature connection, wear green clothing',
                                            'Violet': 'Spiritual study, divine connection prayer, wear violet or purple',
                                            'Indigo': 'Intuitive journaling, third eye meditation, wear indigo or dark blue',
                                            'Purple': 'Mystical awareness practice, spiritual wisdom study, wear purple accessories',
                                            'Gold': 'Divine wisdom contemplation, enlightened service, wear gold jewelry',
                                            'Silver': 'Psychic sensitivity practice, lunar awareness, wear silver accessories',
                                            'Orange': 'Creative expression time, emotional check-ins, wear orange accents',
                                            'Pink': 'Loving-kindness meditation, emotional nurturing, wear pink or rose colors'
                                          };
                                          return practices[result.dominantColor] || 'Incorporate your aura color into daily spiritual practices and clothing choices';
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Connect to Healers Button */}
                              
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="detailed" data-tab="detailed">
                            {/* Screenshot Button */}
                            <div className="flex justify-end mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => captureTabScreenshot('detailed')}
                                disabled={isCapturingScreenshot === 'detailed'}
                                className="flex items-center gap-2"
                              >
                                {isCapturingScreenshot === 'detailed' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4" />
                                )}
                                {isCapturingScreenshot === 'detailed' ? 'Capturing...' : 'Capture Screenshot'}
                              </Button>
                            </div>
                            <div>
                              <div className="mb-6 relative">
                              
                                <h3 className="font-medium text-lg mb-5 text-primary">Advanced Aura Field Analysis</h3>
                                
                                {/* Premium Aura Visualization */}
                                <div className="relative h-56 mb-6 overflow-hidden rounded-lg">
                                  {/* Background gradient animation */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 z-10"></div>
                                  <div 
                                    className="absolute inset-0 animate-pulse-slow" 
                                    style={{
                                      background: `radial-gradient(ellipse at center, 
                                        ${getAccurateColorCode(result.dominantColor)}99 20%, 
                                        ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}70 60%, 
                                        rgba(0,0,0,0) 70%)`,
                                      filter: 'blur(20px)',
                                      transformOrigin: 'center',
                                      animation: 'pulse 8s infinite ease-in-out'
                                    }}
                                  ></div>
                                  
                                  {/* Multiple energy layers */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-40 h-40">
                                      {/* Etheric Layer */}
                                      <div 
                                        className="absolute inset-0 rounded-full animate-pulse-slow opacity-70" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            ${getAccurateColorCode(result.dominantColor)}99 0%, 
                                            ${getAccurateColorCode(result.dominantColor)}20 70%, 
                                            transparent 100%)`,
                                          animation: 'pulse 10s infinite ease-in-out',
                                          animationDelay: '0.5s'
                                        }}
                                      ></div>
                                      
                                      {/* Emotional Layer */}
                                      <div 
                                        className="absolute inset-4 rounded-full animate-pulse-slow opacity-80" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}99 0%, 
                                            ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}30 80%, 
                                            transparent 100%)`,
                                          animation: 'pulse 8s infinite ease-in-out',
                                          animationDelay: '1s'
                                        }}
                                      ></div>
                                      
                                      {/* Mental Layer */}
                                      <div 
                                        className="absolute inset-8 rounded-full animate-pulse-slow opacity-90" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            ${getAccurateColorCode(result.dominantColor)}90 0%, 
                                            ${getAccurateColorCode(result.dominantColor)}40 70%, 
                                            transparent 100%)`,
                                          animation: 'pulse 6s infinite ease-in-out',
                                          animationDelay: '1.5s'
                                        }}
                                      ></div>
                                      
                                      {/* Spiritual Core */}
                                      <div 
                                        className="absolute inset-12 rounded-full animate-pulse-slow opacity-95 flex items-center justify-center" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            white 0%, 
                                            ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}70 70%, 
                                            transparent 100%)`,
                                          animation: 'pulse 4s infinite ease-in-out',
                                          animationDelay: '2s'
                                        }}
                                      >
                                        <Sparkles className="w-6 h-6 text-white/90" />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Labels */}
                                  <div className="absolute top-3 left-3 text-white text-xs font-medium bg-black/30 px-2 py-1 rounded z-20">
                                    Multi-Layer Aura Visualization
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                                  <h4 className="font-medium text-base mb-3">Specialized Aura Interpretation</h4>
                                  <div className="text-gray-700 mb-5 space-y-3">
                                    {(() => {
                                      // Parse the detailed analysis to separate different aspects
                                      const analysisText = result.detailedAnalysis;
                                      const aspects = ['Personality:', 'Giving:', 'Receiving:', 'Thinking:'];
                                      const lines: Array<{type: string, content: string}> = [];
                                      
                                      // Split by common patterns
                                      let currentText = analysisText;
                                      aspects.forEach(aspect => {
                                        if (currentText.includes(aspect)) {
                                          const parts = currentText.split(aspect);
                                          if (parts.length > 1) {
                                            const nextAspectIndex = parts[1].search(/\b(Personality|Giving|Receiving|Thinking):/);
                                            const aspectContent = nextAspectIndex > -1 ? parts[1].substring(0, nextAspectIndex) : parts[1];
                                            lines.push({
                                              type: aspect.replace(':', ''),
                                              content: aspectContent.trim()
                                            });
                                            currentText = nextAspectIndex > -1 ? parts[1].substring(nextAspectIndex) : '';
                                          }
                                        }
                                      });
                                      
                                      // If no specific aspects found, try to parse by sentences
                                      if (lines.length === 0) {
                                        const sentences = analysisText.split('. ').filter(s => s.length > 20);
                                        const aspectKeywords = {
                                          'Personality': ['personality', 'leader', 'magnetic', 'presence', 'nature'],
                                          'Giving': ['giving', 'gives', 'shares', 'offers', 'provides'],
                                          'Receiving': ['receiving', 'receives', 'draws', 'attracts', 'gains'],
                                          'Thinking': ['thinking', 'thoughts', 'mental', 'wisdom', 'mind']
                                        };
                                        
                                        Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
                                          const matchingSentence = sentences.find(sentence => 
                                            keywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))
                                          );
                                          if (matchingSentence) {
                                            lines.push({
                                              type: aspect,
                                              content: matchingSentence + '.'
                                            });
                                          }
                                        });
                                      }
                                      
                                      // If still no lines, show the original text as fallback
                                      if (lines.length === 0) {
                                        return (
                                          <p className="text-gray-700">{analysisText}</p>
                                        );
                                      }
                                      
                                      return lines.map((line, index) => (
                                        <div key={index} className="border-l-4 border-purple-300 pl-4 py-2 bg-white/50 rounded-r">
                                          <div className="font-semibold text-purple-800 mb-1">
                                            {line.type}:
                                          </div>
                                          <p className="text-gray-700 text-sm leading-relaxed">
                                            {line.content}
                                          </p>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  
                                  {/* Comprehensive Aura Color Spectrum */}
                                  <div className="mb-6">
                                    
                                  
                                    
                                    {/* Frequency labels */}
                                    
                                    
                                    {/* Secondary Purple to Green Spectrum */}
                                    
                                    
                                    {/* Purple to Green spectrum labels */}
                                    
                                    
                                    {/* Aura color spectrum display */}
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-2">Complete Aura Color Profile</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                        {(() => {
                                          // Create a unique set of colors to avoid duplicates
                                          const uniqueColors = new Set();
                                          const colorTiles = [];
                                          
                                          // Always add primary color
                                          uniqueColors.add(result.dominantColor);
                                          colorTiles.push({
                                            color: result.dominantColor,
                                            label: 'Dominant'
                                          });
                                          
                                          // Add secondary color if different from primary
                                          if (result.secondaryColor && result.secondaryColor !== result.dominantColor) {
                                            uniqueColors.add(result.secondaryColor);
                                            colorTiles.push({
                                              color: result.secondaryColor,
                                              label: 'Overall'
                                            });
                                          }
                                          
                                          // Add additional spectrum colors if available, avoiding duplicates
                                          if (result.auraColorSpectrum) {
                                            result.auraColorSpectrum.forEach(color => {
                                              if (!uniqueColors.has(color) && colorTiles.length < 5) {
                                                uniqueColors.add(color);
                                                colorTiles.push({
                                                  color: color,
                                                  label: 'Complementary'
                                                });
                                              }
                                            });
                                          }
                                          
                                          return colorTiles.map((tile, index) => (
                                            <div key={`color-tile-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0" 
                                                style={{ 
                                                  backgroundColor: getAccurateColorCode(tile.color)
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">{tile.label}</div>
                                                <div className="text-sm font-medium">{tile.color}</div>
                                              </div>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Aura Layers Interpretation</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                       
                                        Physical Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("physical", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        
                                       
                                        Emotional Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("emotional", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                       
                                        Mental Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("mental", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                       
                                        Astral Layer
                                          </h5>
                                          <p className="text-xs text-gray-600">
                                            {getAuraLayerAnalysis("etheric", result.dominantColor)}
                                          </p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                          <h5 className="text-sm font-medium mb-1 flex items-center">
                                            
                                        Spiritual Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("spiritual", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Energy Flow Analysis</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center mb-3">
                                      <div className="relative w-20 h-20 mr-4 flex-shrink-0">
                                        <div 
                                          className="absolute inset-0 rounded-full animate-ping" 
                                          style={{
                                            background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
                                            animation: `ping ${Math.max(1, 11 - result.energyLevel)}s cubic-bezier(0, 0, 0.2, 1) infinite`
                                          }}
                                        ></div>
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                          <div 
                                            className="w-12 h-12 rounded-full" 
                                            style={{
                                              background: `conic-gradient(${getAccurateColorCode(result.dominantColor)} ${result.energyLevel * 36}deg, transparent 0deg)`,
                                              boxShadow: `0 0 15px ${getAccurateColorCode(result.dominantColor)}60`
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">Energy Intensity: <span className="font-bold">{auraHelpers.getEnergyLevelText(result.energyLevel)}</span></div>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {auraHelpers.getEnergyAdvice(result.energyLevel, result.dominantColor)}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                      <div className="text-xs text-gray-700">
                                        <strong>Energy Cycles:</strong> Your aura indicates a {auraHelpers.getEnergyCycle(result.energyLevel, result.dominantColor)} energy cycle currently. 
                                        Pay attention to how your energy fluctuates throughout the day and week.
                                      </div>
                                      
                                     
                                      
                                      {/* Energy flow integration */}
                                      <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                        <strong>Integration Pattern:</strong> {(() => {
                                          const level = result.energyLevel;
                                          if (level >= 9) return "All energy centers highly synchronized with intense circulation throughout your entire field.";
                                          if (level >= 7) return "Strong integration between all four energy zones with active communication and balanced flow.";
                                          if (level >= 5) return "Moderate integration with steady communication between core, mental, giving, and receiving energies.";
                                          if (level >= 3) return "Gentle integration with subtle energy exchange between your four primary energy zones.";
                                          return "Quiet integration phase with energy consolidating in core areas for deeper development.";
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                  

                                </div>
                              </div>
                              
                              {/* Demo mode - showing premium features without upgrade */}
                              <div className="flex justify-center mt-4">
                                
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Healer Notes Section - Only visible to healers */}
                        {isHealer && result && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium text-lg text-purple-800">Professional Healer Notes</h3>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                Healer Only
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              Add your professional insights and recommendations for this aura analysis. These notes will be included in the downloaded PDF.
                            </p>
                            
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Enter your professional insights, recommendations, or additional observations about this aura analysis..."
                                value={healerNotes}
                                onChange={(e) => setHealerNotes(e.target.value)}
                                className="min-h-[120px] resize-none"
                                rows={6}
                              />
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  {healerNotes.length} characters
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setHealerNotes("")}
                                    disabled={!healerNotes.trim()}
                                  >
                                    Clear
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (currentAnalysisId) {
                                        saveHealerNotes(currentAnalysisId, healerNotes);
                                      }
                                    }}
                                    disabled={isSavingHealerNotes || !healerNotes.trim() || !currentAnalysisId}
                                  >
                                    {isSavingHealerNotes ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Save Notes
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5-Star Review System */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mt-8">
                          {reviewSubmitted ? (
                            <div className="text-center py-4">
                              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                              </div>
                              <h4 className="font-semibold text-lg text-green-800 mb-2">Review Submitted!</h4>
                              <p className="text-green-700">Thank you for your feedback. Your review helps us improve our aura analysis experience.</p>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-semibold text-lg mb-4 flex items-center">
                                <Star className="w-5 h-5 mr-2 text-amber-500" />
                                Rate Your Aura Analysis Experience
                              </h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-700 mb-3">How accurate and helpful was your aura reading?</p>
                                  <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`w-8 h-8 rounded-full transition-all duration-200 ${
                                          star <= rating 
                                            ? 'text-amber-500 scale-110' 
                                            : 'text-gray-300 hover:text-amber-400'
                                        }`}
                                      >
                                        <Star className="w-full h-full fill-current" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Share your thoughts (optional)
                                  </label>
                                  <Textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Tell us about your experience with this aura analysis..."
                                    className="min-h-[80px] resize-none"
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setRating(0);
                                      setReviewText("");
                                    }}
                                  >
                                    Clear
                                  </Button>
                                  <Button
                                    onClick={submitReview}
                                    disabled={rating === 0 || isSubmittingReview}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                    size="sm"
                                  >
                                    {isSubmittingReview ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Submit Review
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center bg-gray border-dashed border-2">
                      <div className="text-center p-6">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-30`}></div>
                        <p className="text-gray-600">Upload your photo to see your aura analysis</p>
                        <p className="text-gray-500 text-sm mt-2">Your reading will be private and secure</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Aura Color Guide Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8 text-center">Aura Color Guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-purple-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-purple-700">Purple Aura</h3>
                  <p className="text-gray-600">
                    Indicates spiritual awareness, wisdom and intuition. People with purple auras often have psychic abilities and a strong connection to higher consciousness.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-blue-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-blue-700">Blue Aura</h3>
                  <p className="text-gray-600">
                    Represents calm communication, truth, and self-expression. People with blue auras are often peaceful, trustworthy and have strong intuitive abilities.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-green-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-green-700">Green Aura</h3>
                  <p className="text-gray-600">
                    Symbolizes healing, growth and balance. Those with green auras often have a natural ability to heal others and foster growth in all areas of life.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-yellow-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-yellow-700">Yellow Aura</h3>
                  <p className="text-gray-600">
                    Reflects joy, intellect and optimism. People with yellow auras tend to be analytical, playful, and have an energetic approach to life challenges.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-orange-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-orange-700">Orange Aura</h3>
                  <p className="text-gray-600">
                    Indicates creativity, courage and enthusiasm. Those with orange auras are often adventurous, expressive and have a strong sense of personal power.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-red-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-red-700">Red Aura</h3>
                  <p className="text-gray-600">
                    Represents passion, energy and strong will. People with red auras are often action-oriented, bold and have powerful physical energy reserves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advanced Features Section */}
        <section className="py-16 bg-gradient-to-br from-primary-dark/5 to-secondary-dark/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Complete Aura Analysis Features</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore the full range of our aura analysis capabilities.
                </p>
              </div>
              
              <div className="my-6 grid md:grid-cols-1 gap-6">
                <Card className="relative overflow-hidden border-2 border-primary/20">
                  <div className="absolute top-0 right-0 bg-green-100 px-3 py-1 rounded-bl-md">
                    <span className="text-sm font-medium text-green-800">All Features Included</span>
                  </div>
                  <CardHeader>
                    <CardTitle>Complete Aura Analysis</CardTitle>
                    <CardDescription>Discover the colors and energy patterns of your aura with our comprehensive analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Includes:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Basic aura color identification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Primary personality traits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Energy level assessment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Basic chakra activity visualization</span>
                        </li>
                      </ul>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Advanced multi-layer aura color analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Detailed chakra balancing recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Personalized spiritual practice suggestions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Temporal aura pattern tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>30-day aura energy forecast</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Healers Connection Section */}
        {result && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="relative mb-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">CONNECT WITH HEALERS</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4 text-center">Recommended Healers</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-center">
                    Based on your aura reading, these certified healers specialize in working with your energy signature and can help guide your spiritual journey.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Healer 1 */}
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-purple-200 to-indigo-100 relative">
                      <div className="absolute inset-0 bg-center bg-cover opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80')" }}></div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="font-medium">Specializes in:</span> Energy Balancing
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">Sarah Johnson</h3>
                      <p className="text-sm text-gray-600 mb-2">Reiki Master & Spiritual Coach</p>
                      <div className="flex items-center text-amber-500 mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span className="ml-1 text-xs">(48 reviews)</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">$85 / session</span>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Healer 2 */}
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-blue-200 to-indigo-100 relative">
                      <div className="absolute inset-0 bg-center bg-cover opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541576980233-97577392db9a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80')" }}></div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="font-medium">Specializes in:</span> Chakra Alignment
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">Michael Chen</h3>
                      <p className="text-sm text-gray-600 mb-2">Energy Healer & Meditation Guide</p>
                      <div className="flex items-center text-amber-500 mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span className="ml-1 text-xs">(36 reviews)</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">$75 / session</span>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Healer 3 */}
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-amber-200 to-orange-100 relative">
                      <div className="absolute inset-0 bg-center bg-cover opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=922&q=80')" }}></div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="font-medium">Specializes in:</span> Aura Cleansing
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">Jessica Rivera</h3>
                      <p className="text-sm text-gray-600 mb-2">Spiritual Mentor & Intuitive Guide</p>
                      <div className="flex items-center text-amber-500 mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span className="ml-1 text-xs">(52 reviews)</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">$95 / session</span>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button>
                    View All Healers
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    All healers on our platform are certified and have undergone background checks
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

function createSeamlessBlendingOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number, personWidth: number, personHeight: number, colors: any) {
    throw new Error("Function not implemented.");
}
