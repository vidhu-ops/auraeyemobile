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
import { Loader2, Crown, Sparkles, Zap, Star, MessageSquare, CheckCircle2, Users, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';


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

const getColorDailyPractice = (color: string): string => {
  const practices: Record<string, string> = {
    'Red': 'Morning grounding visualization, wear red colors, practice physical exercise',
    'Orange': 'Creative expression time, emotional check-ins, wear orange accents',
    'Yellow': 'Confidence affirmations, mental clarity exercises, wear yellow accessories',
    'Green': 'Heart-opening gratitude practice, nature connection, wear green clothing',
    'Blue': 'Truth-telling practice, clear communication, wear blue jewelry',
    'Indigo': 'Intuitive journaling, third eye meditation, wear indigo or dark blue',
    'Violet': 'Spiritual study, divine connection prayer, wear violet or purple',
    'Purple': 'Mystical awareness practice, spiritual wisdom study, wear purple accessories',
    'Pink': 'Loving-kindness meditation, emotional nurturing, wear pink or rose colors',
    'Gold': 'Divine wisdom contemplation, enlightened service, wear gold jewelry',
    'White': 'Light protection visualization, spiritual cleansing, wear white clothing',
    'Silver': 'Psychic sensitivity practice, lunar awareness, wear silver accessories'
  };
  return practices[color] || 'Incorporate your aura color into daily spiritual practices and clothing choices';
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
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5; // High opacity for visibility
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
    ctx.fillText('AuraEye', centerX-2, centerY);
    
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

      const pageWidth = 190;
      const pageHeight = 277;
      let yPosition = 20;
      
      // Helper function to add text with automatic page breaks
      const addTextWithPageBreak = (text: string, x: number, y: number, options: any = {}) => {
        try {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(text, x, y, options);
          return y;
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

      // Add the uploaded image as the first page if available
      const addUploadedImageAsFirstPage = async () => {
        try {
          // Import the uploaded image directly from attached assets  
          const uploadedImageModule = await import('@assets/WhatsApp Image 2025-07-28 at 10.02.03 PM_1753725795826.jpeg');
          const uploadedImageSrc = uploadedImageModule.default;
          
          // Create image to get dimensions
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = uploadedImageSrc;
          });
          
          // Calculate dimensions to fill entire page while maintaining aspect ratio
          const imgAspectRatio = img.width / img.height;
          const pageAspectRatio = pageWidth / pageHeight;
          
          let imgWidth, imgHeight, imgX, imgY;
          
          if (imgAspectRatio > pageAspectRatio) {
            // Image is wider than page ratio, fit to page height and crop sides
            imgHeight = pageHeight;
            imgWidth = imgHeight * imgAspectRatio;
            imgX = (pageWidth - imgWidth) / 2; // Center horizontally
            imgY = 0;
          } else {
            // Image is taller than page ratio, fit to page width and crop top/bottom
            imgWidth = pageWidth;
            imgHeight = imgWidth / imgAspectRatio;
            imgX = 0;
            imgY = (pageHeight - imgHeight) / 2; // Center vertically
          }
          
          // Add the uploaded original image as full-page first page
          pdf.addImage(uploadedImageSrc, 'JPEG', imgX, imgY, imgWidth, imgHeight);
          
          console.log('Successfully added uploaded image as first page');
          return true;
        } catch (error) {
          console.warn('Could not load uploaded image for first page:', error);
          return false;
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
      if (processedAuraImage) {
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
            tempImg.src = processedAuraImage;
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
          
          pdf.addImage(processedAuraImage, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
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

      // SECTION 2: SPIRITUAL ANALYSIS
      pdf.setFontSize(18);
      pdf.setTextColor(75, 0, 130);
      yPosition = addTextWithPageBreak('SPIRITUAL ANALYSIS', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const analysis = result.detailedAnalysis || "Your aura reveals unique spiritual patterns that guide your personal development journey. The colors detected in your energy field indicate specific aspects of your personality, emotional state, and spiritual development.";
      yPosition = addWrappedText(analysis, 20, yPosition, pageWidth - 40);
      yPosition += 10;

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
          root: 'Root Chakra'
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
        pdf.setFillColor(254, 252, 232); // Light yellow background
        pdf.rect(15, yPosition - 5, pageWidth - 30, 50, 'F'); // Filled rectangle
        pdf.setDrawColor(251, 191, 36); // Golden border
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

      // Download the PDF
      const currentDate = new Date().toISOString().split('T')[0];
      pdf.save(`aura-chakra-analysis-${nameToUse.replace(/[^a-zA-Z0-9]/g, '-')}-${currentDate}.pdf`);

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

  const getPersonalityColorInterpretation = (color: string): string => {
    const personalityInterpretations: Record<string, string> = {
      'Red': 'Your core essence pulses with primal life force and determination. You approach life with passion, courage, and a strong survival instinct. This indicates a powerful connection to earth energy and physical vitality.',
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
  };

  const getColorSpiritalMeaning = (color: string): string => {
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
  };

  const getGivingEnergyInterpretation = (color: string): string => {
    const givingInterpretations: Record<string, string> = {
      'Red': 'Action-oriented, passionate, driven, energized and grounded in goals. When balanced, you feel grounded and responsible. When imbalanced, you may have suppressed anger, burnout, aggressive behavior, or hyper-competitiveness.',
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
      'Brown': 'Receiving Zone Brown - You receive practical grounding and earthly wisdom, attracting stability and natural stability support.',
      'Red': 'Taking action with purpose, guiding or mentoring others. You master healer energy, a teacher and guide on a mission. Acting from innocence, vulnerability, or spiritual ideals.',
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
      'Red': 'Thinking Zone Red - Taking action with purpose, guiding or mentoring others, acting from innocence, vulnerability or spiritual ideals. Your mental processes focus on purposeful action and spiritual guidance through direct engagement.',
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
      'Red': 'Root chakra energy - survival instinct, life force, physical vitality',
      'Orange': 'Sacral chakra energy - creativity, sexuality, emotional flow',
      'Yellow': 'Solar plexus chakra - personal power, confidence, willpower',
      'Green': 'Heart chakra - unconditional love, healing abilities, compassion',
      'Blue': 'Throat chakra - communication, truth speaking, authentic voice',
      'Indigo': 'Third eye chakra - psychic abilities, intuition, spiritual sight',
      'Violet': 'Crown chakra - spiritual connection, divine consciousness, enlightenment',
      'Purple': 'Higher crown chakra - spiritual mastery, mystical awareness',
      'Pink': 'Higher heart chakra - unconditional love, divine compassion',
      'White': 'Pure divine light - spiritual protection, angelic connection',
      'Gold': 'Christ consciousness - divine wisdom, spiritual illumination',
      'Silver': 'Lunar energy - intuitive wisdom, feminine power, psychic protection',
      'Gray': 'Emotional numbness - detachment, avoidance, spiritual stagnation',
      'Black': 'Shadow work required - deep wounds, negativity, spiritual darkness',
      'Brown': 'Earth- star connection - grounding, stability, practical wisdom'
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

  const getColorKeyword = (color: string): string => {
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
  };



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

  const get9ChakraAnalysis = (primaryColor: string, secondaryColor: string): Array<{name: string, location: string, analysis: string}> => {
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
  };

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
      'Red': 'Root chakra support - strengthens your foundation with grounding, survival instincts, and physical vitality',
      'Orange': 'Sacral chakra support - enhances your creativity with emotional flow, artistic expression, and joyful passion',
      'Yellow': 'Solar plexus support - empowers your confidence with personal power, mental clarity, and intellectual wisdom',
      'Green': 'Heart chakra support - opens your compassion with healing love, emotional balance, and natural harmony',
      'Blue': 'Throat chakra support - clarifies your communication with truthful expression, authentic voice, and peaceful wisdom',
      'Indigo': 'Third eye support - awakens your intuition with psychic abilities, inner knowing, and spiritual sight',
      'Purple': 'Crown chakra support - connects your spirit with divine wisdom, mystical awareness, and cosmic consciousness',
      'Pink': 'Higher heart support - expands your love with unconditional compassion, divine grace, and soul connection',
      'Gold': 'Christ consciousness support - illuminates your purpose with divine wisdom, spiritual mastery, and soul mission',
      'Silver': 'Lunar energy support - activates your intuition with feminine wisdom, psychic protection, and mystical insight',
      'White': 'Pure light support - purifies your energy with spiritual protection, angelic connection, and divine grace',
      'Gray': 'Neutral wisdom support - brings balance with spiritual equilibrium, adaptable wisdom, and cosmic neutrality',
      'Black': 'Shadow integration support - initiates transformation with deep inner work, shadow healing, and spiritual rebirth',
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

  function processImageWithAura({ imageBase64, auraData }: { imageBase64: string; auraData: AuraAnalysisResult; }): Promise<string> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Set proper proportional canvas size for better visualization
                const aspectRatio = img.width / img.height;
                let canvasWidth, canvasHeight;

                // Maintain aspect ratio while ensuring adequate size
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

                // Draw original image to fill canvas with proper proportions
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

                    // Create simple but visible aura effects around the person
                    const centerX = canvasWidth / 2;
                    const centerY = canvasHeight / 2;

                    // Get dominant and secondary colors
                    const dominantColor = auraData.dominantColor || 'Blue';
                    const secondaryColor = auraData.secondaryColor || 'Purple';

                    // Enhanced color names to RGB mapping with all specified colors
                    const getColorRGB = (colorName: string) => {
                        const colorMap: Record<string, [number, number, number]> = {
                            'Red': [255, 40, 40],           // More saturated red
                            'Orange': [255, 120, 0],        // More vibrant orange
                            'Yellow': [255, 220, 0],        // Intense yellow
                            'Green': [40, 220, 40],         // More saturated green
                            'Blue': [20, 130, 255],         // More vibrant blue
                            'Purple': [150, 30, 240],       // More saturated purple
                            'Violet': [160, 0, 230],        // More intense violet
                            'Indigo': [90, 0, 150],         // Deeper indigo
                            'Pink': [255, 90, 170],         // More saturated pink
                            'Gold': [255, 200, 0],          // More vibrant gold
                            'Silver': [180, 180, 180],      // Slightly more muted silver
                            'White': [255, 255, 255],       // Pure white
                            'Gray': [150, 150, 150],        // Slightly darker gray for better contrast
                            'Grey': [150, 150, 150],        // Alternative spelling
                            'Black': [50, 50, 50],          // Slightly lighter for visibility
                            'Brown': [180, 60, 60]        // Cyan
                        };
                        return colorMap[colorName] || [20, 130, 255]; // Default to vibrant blue
                    };

                    const [dr, dg, db] = getColorRGB(dominantColor);
                    const [sr, sg, sb] = getColorRGB(secondaryColor);

                    // Create visible aura glow around the entire image edges
                    const createAuraGlow = () => {
                        // Apply subtle blur for softer glow effect
                        ctx.filter = 'diffuse(10px)';

                        // Create multiple layers of glow
                        for (let layer = 0; layer < 12; layer++) {
                            const radius = 40 + (layer * 25);
                            const opacity = 0.32 - (layer * 0.008);

                            // Use dominant color for most layers
                            const useSecondary = layer % 4 === 0;
                            const [r, g, b] = useSecondary ? [sr, sg, sb] : [dr, dg, db];

                            // Create radial gradient from center outward
                            const gradient = ctx.createRadialGradient(
                                centerX, centerY, canvasWidth * 0.12, // Inner radius - protect person
                                centerX, centerY, canvasWidth * 0.8 + radius // Outer radius
                            );

                            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
                            gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`);
                            gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity})`);
                            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${opacity * 1.8})`);

                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                        }

                        // Reset filter
                        ctx.filter = 'none';
                    };

                    // Create smokey aura effects matching reference images exactly
                    const createSmokeyAuraEffects = () => {
                        // Get the 4-zone energy colors
                        const allColors = extractAllAuraColors(auraData);

                        // Convert hex colors to RGB
                        const hexToRGB = (hex: string) => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return { r, g, b };
                        };

                        const colorsRGB = {
                            thinkingRGB: hexToRGB(allColors.thinking),
                            receivingRGB: hexToRGB(allColors.receiving),
                            givingRGB: hexToRGB(allColors.giving),
                            personalityRGB: hexToRGB(allColors.personality)
                        };

                        // Use the new improved smokey effect function
                        createSmokeyAuraParticles(ctx, canvasWidth, canvasHeight, colorsRGB, 7, Date.now());
                    };

                    // Apply aura effects
                    createAuraGlow();
                    createSmokeyAuraEffects();

                    // Add watermark as the top layer
                    addWatermark(ctx, canvasWidth, canvasHeight);
                }

                resolve(canvas.toDataURL());
            };

            img.onerror = () => {
                console.error('Failed to load image for aura processing');
                resolve(imageBase64); // Return original if processing fails
            };

            img.src = imageBase64;
        });
    }

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
  function createSeamlessColorBlending({ ctx, width, height, centerY, personHeight, colors, energyLevel, seededRandom }: { ctx: CanvasRenderingContext2D; width: number; height: number; centerX: number; centerY: number; personWidth: number; personHeight: number; colors: any; energyLevel: number; seededRandom: () => number; }): void {
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

  // Function to create natural smoke effect like real smoke around person
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
    // Create deterministic seeded random function
    let currentSeed = seed || 12345;
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create realistic smokey cloudy effect matching reference images exactly
    createRealisticSmokeEffect(ctx, width, height, colors, Math.min(width, height) * 0.40, seededRandom);
  };



  // Function to create dense cloudy particles within specific energy zones
  const createZoneCloudyParticles = (
    ctx: CanvasRenderingContext2D,
    zone: any,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    personRadius: number,
    energyLevel: number,
    seededRandom: () => number
  ) => {
    const particleCount = Math.floor(80 * zone.density); // More particles for denser clouds
    
    // Create multiple layers for authentic cloudy appearance
    const cloudLayers = [
      { size: 160, opacity: 0.15, blur: 50 }, // Large diffused clouds
      { size: 120, opacity: 0.25, blur: 35 }, // Medium clouds
      { size: 80, opacity: 0.35, blur: 20 },  // Smaller dense clouds
      { size: 60, opacity: 0.20, blur: 15 }   // Detail clouds
    ];

    cloudLayers.forEach(layer => {
      ctx.save();
      ctx.filter = `blur(${layer.blur}px)`;
      
      for (let i = 0; i < particleCount / cloudLayers.length; i++) {
        // Generate random position within zone boundaries
        const x = zone.startX + seededRandom() * (zone.endX - zone.startX);
        const y = zone.startY + seededRandom() * (zone.endY - zone.startY);
        
        // Ensure particle is outside person protection area
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        if (distanceFromCenter > personRadius * 1.8) { // Enhanced protection radius
          const particleRadius = layer.size * (0.7 + seededRandom() * 0.6);
          const opacity = layer.opacity * (0.6 + seededRandom() * 0.4);
          
          // Create cloudy gradient for natural appearance
          const cloudGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, particleRadius
          );
          
          cloudGradient.addColorStop(0, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, ${opacity})`);
          cloudGradient.addColorStop(0.4, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, ${opacity * 0.7})`);
          cloudGradient.addColorStop(0.8, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, ${opacity * 0.3})`);
          cloudGradient.addColorStop(1, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0)`);
          
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = cloudGradient;
          ctx.beginPath();
          ctx.arc(x, y, particleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    });
  };

  // Function to create seamless blending between zone boundaries
  const createZoneBoundaryBlending = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: any,
    personRadius: number,
    seededRandom: () => number
  ) => {
    const blendingParticles = 60;
    
    // Boundary areas for blending
    const boundaries = [
      // Thinking-Receiving boundary (top-left)
      { 
        startX: 0, endX: width * 0.45, 
        startY: 0, endY: height * 0.35,
        color1: colors.thinkingRGB, color2: colors.receivingRGB 
      },
      // Thinking-Giving boundary (top-right)
      { 
        startX: width * 0.55, endX: width, 
        startY: 0, endY: height * 0.35,
        color1: colors.thinkingRGB, color2: colors.givingRGB 
      },
      // Receiving-Personality boundary (left-bottom)
      { 
        startX: 0, endX: width * 0.45, 
        startY: height * 0.65, endY: height,
        color1: colors.receivingRGB, color2: colors.personalityRGB 
      },
      // Giving-Personality boundary (right-bottom)
      { 
        startX: width * 0.55, endX: width, 
        startY: height * 0.65, endY: height,
        color1: colors.givingRGB, color2: colors.personalityRGB 
      }
    ];

    boundaries.forEach(boundary => {
      for (let i = 0; i < blendingParticles / boundaries.length; i++) {
        const x = boundary.startX + seededRandom() * (boundary.endX - boundary.startX);
        const y = boundary.startY + seededRandom() * (boundary.endY - boundary.startY);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        if (distanceFromCenter > personRadius * 1.6) {
          const blendRatio = seededRandom();
          const blendedR = Math.floor(boundary.color1.r * blendRatio + boundary.color2.r * (1 - blendRatio));
          const blendedG = Math.floor(boundary.color1.g * blendRatio + boundary.color2.g * (1 - blendRatio));
          const blendedB = Math.floor(boundary.color1.b * blendRatio + boundary.color2.b * (1 - blendRatio));
          
          const particleRadius = 40 + seededRandom() * 80;
          const opacity = 0.15 + seededRandom() * 0.25;
          
          ctx.save();
          ctx.filter = 'blur(25px)';
          ctx.globalCompositeOperation = 'soft-light';
          
          const blendGradient = ctx.createRadialGradient(
            x, y, 0, x, y, particleRadius
          );
          
          blendGradient.addColorStop(0, `rgba(${blendedR}, ${blendedG}, ${blendedB}, ${opacity})`);
          blendGradient.addColorStop(0.6, `rgba(${blendedR}, ${blendedG}, ${blendedB}, ${opacity * 0.5})`);
          blendGradient.addColorStop(1, `rgba(${blendedR}, ${blendedG}, ${blendedB}, 0)`);
          
          ctx.fillStyle = blendGradient;
          ctx.beginPath();
          ctx.arc(x, y, particleRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }
    });
  };

  // Enhanced createRealisticSmokeEffect function for dense cloudy aura visualization
  const createRealisticSmokeEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: any,
    personRadius: number,
    seededRandom: () => number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Define energy zones with proper positioning - receiving LEFT, giving RIGHT, thinking TOP
    const energyZones = [
      {
        color: colors.thinkingRGB,
        zone: 'top',
        startY: 0,
        endY: height * 0.35, // Top 35% for thinking energy
        startX: width * 0.1, // 10% margin from sides
        endX: width * 0.9,
        density: 1.0,
        name: 'thinking'
      },
      {
        color: colors.receivingRGB, // RECEIVING ENERGY ON LEFT SIDE
        zone: 'left',
        startY: height * 0.10,
        endY: height * 0.90,
        startX: 0,
        endX: width * 0.45, // Left 45% for receiving energy
        density: 1.0,
        name: 'receiving'
      },
      {
        color: colors.givingRGB, // GIVING ENERGY ON RIGHT SIDE
        zone: 'right',
        startY: height * 0.10,
        endY: height * 0.90,
        startX: width * 0.55, // Right side from 55% for giving energy
        endX: width,
        density: 1.0,
        name: 'giving'
      },
      {
        color: colors.personalityRGB,
        zone: 'bottom',
        startY: height * 0.65, // Bottom zone from 65%
        endY: height,
        startX: width * 0.2,
        endX: width * 0.8,
        density: 1.0,
        name: 'personality'
      }
    ];

    // Create ultra-smooth gradient base layers for seamless blending
    energyZones.forEach(zone => {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      
      // Create diffused radial gradients for each zone
      let gradient;
      switch (zone.name) {
        case 'thinking':
          // Thinking energy from top center
          gradient = ctx.createRadialGradient(
            centerX, centerY * 0.3, personRadius * 0.5,
            centerX, centerY * 0.3, height * 0.6
          );
          break;
        case 'receiving':
          // Receiving energy from left side
          gradient = ctx.createRadialGradient(
            width * 0.2, centerY, personRadius * 0.5,
            width * 0.2, centerY, width * 0.7
          );
          break;
        case 'giving':
          // Giving energy from right side
          gradient = ctx.createRadialGradient(
            width * 0.8, centerY, personRadius * 0.5,
            width * 0.8, centerY, width * 0.7
          );
          break;
        case 'personality':
          // Personality energy from bottom
          gradient = ctx.createRadialGradient(
            centerX, height * 0.8, personRadius * 0.5,
            centerX, height * 0.8, height * 0.6
          );
          break;
      }

      if (gradient) {
        gradient.addColorStop(0, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0)`);
        gradient.addColorStop(0.3, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0.25)`);
        gradient.addColorStop(0.6, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0.35)`);
        gradient.addColorStop(0.8, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0.20)`);
        gradient.addColorStop(1, `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0.08)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
      
      ctx.restore();
    });

    // Add multiple layers of diffused smoke particles with ultra-smooth blending
    energyZones.forEach(zone => {
      // Layer 1: Large diffused clouds
      ctx.save();
      ctx.filter = 'blur(50px)';
      ctx.globalCompositeOperation = 'soft-light';
      
      const particles1 = Math.floor(30 * zone.density);
      for (let i = 0; i < particles1; i++) {
        const x = zone.startX + seededRandom() * (zone.endX - zone.startX);
        const y = zone.startY + seededRandom() * (zone.endY - zone.startY);
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 2.2) continue;
        
        const radius = 120 + seededRandom() * 160;
        const opacity = 0.12 + seededRandom() * 0.18;
        
        ctx.fillStyle = `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Layer 2: Medium density particles
      ctx.save();
      ctx.filter = 'blur(35px)';
      ctx.globalCompositeOperation = 'multiply';
      
      const particles2 = Math.floor(25 * zone.density);
      for (let i = 0; i < particles2; i++) {
        const x = zone.startX + seededRandom() * (zone.endX - zone.startX);
        const y = zone.startY + seededRandom() * (zone.endY - zone.startY);
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 2.0) continue;
        
        const radius = 80 + seededRandom() * 100;
        const opacity = 0.08 + seededRandom() * 0.12;
        
        ctx.fillStyle = `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Layer 3: Fine detail particles
      ctx.save();
      ctx.filter = 'blur(20px)';
      ctx.globalCompositeOperation = 'overlay';
      
      const particles3 = Math.floor(20 * zone.density);
      for (let i = 0; i < particles3; i++) {
        const x = zone.startX + seededRandom() * (zone.endX - zone.startX);
        const y = zone.startY + seededRandom() * (zone.endY - zone.startY);
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 1.8) continue;
        
        const radius = 50 + seededRandom() * 70;
        const opacity = 0.06 + seededRandom() * 0.10;
        
        ctx.fillStyle = `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  const processImageWithEnhancedAura = async (file: File, personalityColor: string, givingColor: string, receivingColor: string, thinkingColor: string, personName: string) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Standard canvas dimensions for consistency
          const canvasWidth = 1600;
          const canvasHeight = 900;
          
          const canvas = document.createElement('canvas');
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext('2d')!;
          
          // Draw the original image
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          
          // Convert colors to RGB
          const colors = {
            personalityRGB: hexToRgb(personalityColor),
            givingRGB: hexToRgb(givingColor),
            receivingRGB: hexToRgb(receivingColor),
            thinkingRGB: hexToRgb(thinkingColor)
          };
          
          // Create seeded random for consistency
          let seedValue = 1;
          for (let i = 0; i < file.name.length; i++) {
            seedValue = (seedValue * file.name.charCodeAt(i)) % 2147483647;
          }
          
          const seededRandom = () => {
            seedValue = (seedValue * 16807) % 2147483647;
            return (seedValue - 1) / 2147483646;
          };
          
          // Calculate person dimensions
          const personRadius = Math.min(canvasWidth, canvasHeight) * 0.40; // Increased for better face visibility
          
          // Apply enhanced cloudy aura effects
          createRealisticSmokeEffect(ctx, canvasWidth, canvasHeight, colors, personRadius, seededRandom);
          
          // Add boundary blending for smooth zone transitions
          createZoneBoundaryBlending(ctx, canvasWidth, canvasHeight, colors, personRadius, seededRandom);
          
          // Add watermark
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.font = 'bold 100px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'transparent';
          ctx.fillText('AuraEye', canvasWidth / 2, canvasHeight / 2);
          ctx.restore();
          
          const processedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(processedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Human Aura Analysis</h1>
            <p className="text-xl text-blue-200">
              Discover the spiritual energy colors that surround and define your essence
            </p>
          </motion.div>

          {/* Name Input Section - only show before analysis */}
          {!hasResults && (
            <NameInput
              onNameSubmit={setPersonName}
              currentName={personName}
            />
          )}

          {/* Analysis Results Display */}
          {hasResults && auraAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Image Display with Download Option */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  {uploadedImageUrl && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">Original Image</h3>
                      <img
                        src={uploadedImageUrl}
                        alt="Original uploaded image"
                        className="w-full h-64 object-cover rounded-lg border-2 border-purple-400"
                      />
                    </div>
                  )}

                  {/* Processed Aura Image */}
                  {processedImageUrl && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">Aura Visualization</h3>
                      <img
                        src={processedImageUrl}
                        alt="Processed aura visualization"
                        className="w-full h-64 object-cover rounded-lg border-2 border-blue-400"
                      />
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={downloadComprehensiveAuraPDF}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                    disabled={!processedImageUrl}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Complete Analysis PDF
                  </Button>
                </div>

                {/* Refresh instruction */}
                <p className="text-center text-blue-200 mt-4">
                  Refresh page for new name analysis
                </p>
              </div>

              {/* Analysis Tabs */}
              <HumanAuraAnalysisDisplay analysis={auraAnalysis} />
            </motion.div>
          )}

          {/* Upload Section - only show if no results */}
          {!hasResults && personName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8"
            >
              <div className="text-center">
                <Upload className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  Upload Image for Aura Analysis
                </h2>
                <p className="text-blue-200 mb-6">
                  Please upload a clear image of a person for spiritual aura analysis
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Aura...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Image
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
