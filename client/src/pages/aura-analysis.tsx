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
import { ImageManipulator } from "@/components/image-manipulator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

// Helper function to get chakra status message based on score
const getChakraStatus = (score: number): string => {
  if (score >= 1 && score <= 3) return "blocked";
  if (score >= 4 && score <= 6) return "imbalanced patterns";
  if (score >= 7 && score <= 8) return "developing balance";
  if (score >= 9 && score <= 10) return "mastered or balanced";
  return "unknown";
};

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

  // Image confirmation states
  const [showImageConfirmation, setShowImageConfirmation] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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
    ctx.font = 'bold 60px Arial, sans-serif';
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
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // No shadow at all to prevent any black spots
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw watermark text as pure white overlay
    ctx.fillText('Left', centerX-190, centerY+300);
    // Draw watermark text as pure white overlay
    // Apply watermark with pure white text and no background interference
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.32; // High opacity for visibility
    ctx.fillStyle = 'white';
    ctx.font = 'bold 45px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // No shadow at all to prevent any black spots
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw watermark text as pure white overlay
    ctx.fillText('Right', centerX+190, centerY+300);
   
    
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
        description: "Creating your professional aura analysis report...",
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
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 20;

      // Professional helper functions
      const addHeader = (pageNum: number) => {
        // Professional background
        pdf.setFillColor(240, 243, 255);
        pdf.rect(0, 0, pageWidth, 60, 'F');
        
        // Decorative border
        pdf.setLineWidth(2);
        pdf.setDrawColor(147, 51, 234);
        pdf.line(margin, 55, pageWidth - margin, 55);
        
        // Sacred symbol and branding
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.setTextColor(147, 51, 234);
        pdf.text('~* AuraEye Sacred Report *~', pageWidth / 2, 25, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Professional Spiritual Analysis', pageWidth / 2, 35, { align: 'center' });
        
        // Dynamic page numbering
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${pageNum}`, pageWidth - margin, 50, { align: 'right' });
      };

      const createTable = (startY: number, headers: string[], rows: string[][], columnWidths: number[]) => {
        let currentY = startY;
        const rowHeight = 8;
        const headerHeight = 10;
        
        // Table header
        pdf.setFillColor(230, 230, 250);
        pdf.rect(margin, currentY, contentWidth, headerHeight, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        
        let currentX = margin + 5;
        headers.forEach((header, index) => {
          pdf.text(header, currentX, currentY + 6);
          currentX += columnWidths[index];
        });
        
        currentY += headerHeight;
        
        // Table rows with alternating colors
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        
        rows.forEach((row, rowIndex) => {
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(252, 252, 255);
            pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
          }
          
          currentX = margin + 5;
          row.forEach((cell, cellIndex) => {
            const cellText = pdf.splitTextToSize(cell, columnWidths[cellIndex] - 5);
            pdf.text(cellText, currentX, currentY + 5);
            currentX += columnWidths[cellIndex];
          });
          
          currentY += rowHeight;
        });
        
        // Table border
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, startY, contentWidth, currentY - startY);
        
        return currentY + 10;
      };

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

      // PAGE 1: PROFESSIONAL OVERVIEW WITH HEADER
      addHeader(uploadedImageAdded ? 2 : 1);
      yPos = 70;

      // Client information section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Client Information', margin + 10, yPos + 10);
      
      yPos += 25;
      
      // Client details table
      const nameToUse = analysisName || result?.name || 'Unnamed Analysis';
      const clientHeaders = ['Field', 'Details'];
      const clientData = [
        ['Client Name', nameToUse],
        ['Report Created By', user?.username || 'Anonymous User'],
        ['Analysis Date', new Date().toLocaleDateString()],
        ['Energy Level', `${result.energyLevel}/10`]
      ];
      
      yPos = createTable(yPos, clientHeaders, clientData, [60, 110]);
      
      // Basic aura analysis section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Aura Zone Analysis', margin + 10, yPos + 10);
      
      yPos += 25;
      
      // Aura zones table
      const zoneHeaders = ['Zone', 'Color', 'Interpretation'];
      const zoneData = [
        ['Dominant Energy', result.dominantColor || 'Not specified', 'Primary spiritual essence'],
        ['Secondary Energy', result.secondaryColor || 'Not specified', 'Supporting energy pattern'],
        ['Personality Core', result.personalityColor || 'Not detected', 'Core essence and fundamental nature'],
        ['Giving Energy', result.givingColor || 'Not detected', 'How you share energy with others'],
        ['Receiving Energy', result.receivingColor || 'Not detected', 'How you absorb environmental energy'],
        ['Thinking Energy', result.thinkingColor || 'Not detected', 'Mental and spiritual processing patterns']
      ];
      
      yPos = createTable(yPos, zoneHeaders, zoneData, [45, 45, 90]);
      
      // Professional footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', margin, pageHeight - 15);
      pdf.text(`Page ${uploadedImageAdded ? 2 : 1}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

      // PAGE 2: AURA VISUALIZATION & CHAKRA ANALYSIS
      pdf.addPage();
      addHeader(uploadedImageAdded ? 3 : 2);
      
      yPos = 70;
      
      // Aura visualization section
      const auraImageForPDF = processedAuraImage || enhancedAuraImage;
      if (auraImageForPDF) {
        try {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPos, contentWidth, 15, 'F');
          
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 41, 59);
          pdf.text('Aura Visualization', margin + 10, yPos + 10);
          
          yPos += 25;
          
          // Add aura image centered
          const imgWidth = 120;
          const imgHeight = 80;
          const imgX = (pageWidth - imgWidth) / 2;
          
          pdf.addImage(auraImageForPDF, 'JPEG', imgX, yPos, imgWidth, imgHeight);
          
          yPos += imgHeight + 15;
          
          pdf.setFontSize(10);
          pdf.setTextColor(75, 85, 99);
          pdf.text('Your Personal Aura Energy Field Visualization', pageWidth / 2, yPos, { align: 'center' });
          pdf.text('This image reveals the spiritual energy colors and patterns surrounding your energy field.', pageWidth / 2, yPos + 8, { align: 'center' });
          
          yPos += 25;
          
        } catch (error) {
          console.error('Error adding aura image to PDF:', error);
          pdf.setFontSize(12);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Aura visualization is being processed and will be available shortly.', pageWidth / 2, yPos + 20, { align: 'center' });
          yPos += 40;
        }
      } else {
        yPos += 20;
      }
      
      // Chakra analysis section
      if (result.chakraActivity) {
        try {
          const chakraData = typeof result.chakraActivity === 'string' ? 
            JSON.parse(result.chakraActivity) : result.chakraActivity;
          
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPos, contentWidth, 15, 'F');
          
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 41, 59);
          pdf.text('Chakra Energy Analysis', margin + 10, yPos + 10);
          
          yPos += 25;
          
          // Chakra table
          const chakraHeaders = ['Chakra', 'Energy Level', 'Status', 'Significance'];
          const chakraMap = {
            root: 'Root Chakra',
            sacral: 'Sacral Chakra', 
            solarPlexus: 'Solar Plexus',
            heart: 'Heart Chakra',
            throat: 'Throat Chakra',
            thirdEye: 'Third Eye',
            crown: 'Crown Chakra'
          };
          
          const chakraRows = Object.entries(chakraData).map(([key, value]) => {
            const level = Number(value);
            const status = level >= 7 ? 'Balanced' : level >= 4 ? 'Developing' : 'Blocked';
            const significance = level >= 7 ? 'Optimal energy flow' : level >= 4 ? 'Growth potential' : 'Needs attention';
            return [chakraMap[key as keyof typeof chakraMap] || key, `${level}/10`, status, significance];
          });
          
          yPos = createTable(yPos, chakraHeaders, chakraRows, [45, 25, 30, 60]);
          
        } catch (error) {
          console.error('Error parsing chakra data:', error);
        }
      }
      
      // Energy level section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Energy Level Analysis', margin + 10, yPos + 10);
      
      yPos += 25;
      
      const energyDescription = result.energyLevel >= 8 ? 'Very High Energy - Vibrant and Active' :
                              result.energyLevel >= 6 ? 'High Energy - Strong and Focused' :
                              result.energyLevel >= 4 ? 'Moderate Energy - Balanced and Steady' :
                              'Low Energy - Calm and Gentle';
      
      // Energy analysis table
      const energyHeaders = ['Metric', 'Value', 'Description'];
      const energyData = [
        ['Overall Energy Level', `${result.energyLevel}/10`, energyDescription],
        ['Energy Classification', result.energyLevel >= 7 ? 'High Vibration' : result.energyLevel >= 4 ? 'Balanced' : 'Gentle', 'Current spiritual activity level'],
        ['Dominant Frequency', result.dominantColor || 'Undefined', 'Primary energy color signature'],
        ['Secondary Support', result.secondaryColor || 'None detected', 'Supporting energy pattern']
      ];
      
      yPos = createTable(yPos, energyHeaders, energyData, [50, 40, 70]);
      
      // Professional footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', margin, pageHeight - 15);
      pdf.text(`Page ${uploadedImageAdded ? 3 : 2}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

      // PAGE 3: DETAILED SPIRITUAL ANALYSIS
      pdf.addPage();
      addHeader(uploadedImageAdded ? 4 : 3);
      
      yPos = 70;
      
      // Analysis content section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Detailed Spiritual Analysis', margin + 10, yPos + 10);
      
      yPos += 25;
      
      // Analysis content with better formatting
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      const analysisText = result.analysis || 'Your aura displays beautiful spiritual energy patterns with unique characteristics that reveal your current spiritual state and growth potential.';
      const splitAnalysis = pdf.splitTextToSize(analysisText, contentWidth - 20);
      
      // Add background for analysis text
      pdf.setFillColor(252, 252, 255);
      pdf.rect(margin + 10, yPos - 5, contentWidth - 20, splitAnalysis.length * 5 + 15, 'F');
      
      pdf.text(splitAnalysis, margin + 15, yPos + 5);
      yPos += splitAnalysis.length * 5 + 25;

      // Color meanings section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Color Meanings & Interpretations', margin + 10, yPos + 10);
      
      yPos += 25;

      // Color analysis table
      const colorHeaders = ['Color', 'Energy Type', 'Spiritual Meaning'];
      const colorData = [
        [result.dominantColor || 'Not detected', 'Dominant Energy', 'Primary spiritual essence and life force'],
        [result.secondaryColor || 'Not detected', 'Secondary Energy', 'Supporting and balancing spiritual pattern'],
        [result.personalityColor || 'Not detected', 'Personality Core', 'Core essence and fundamental nature'],
        [result.givingColor || 'Not detected', 'Giving Energy', 'How you share energy with others'],
        [result.receivingColor || 'Not detected', 'Receiving Energy', 'How you absorb environmental energy'],
        [result.thinkingColor || 'Not detected', 'Thinking Energy', 'Mental and spiritual processing patterns']
      ];
      
      yPos = createTable(yPos, colorHeaders, colorData, [40, 50, 70]);
      
      // Professional footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', margin, pageHeight - 15);
      pdf.text(`Page ${uploadedImageAdded ? 4 : 3}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

      // PAGE 4: RECOMMENDATIONS & SUMMARY
      pdf.addPage();
      addHeader(uploadedImageAdded ? 5 : 4);
      
      yPos = 70;
      
      // Spiritual guidance section
      if (result.spiritualGuidance) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPos, contentWidth, 15, 'F');
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('Spiritual Guidance', margin + 10, yPos + 10);
        
        yPos += 25;
        
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const splitGuidance = pdf.splitTextToSize(result.spiritualGuidance, contentWidth - 20);
        
        // Add background for guidance text
        pdf.setFillColor(252, 252, 255);
        pdf.rect(margin + 10, yPos - 5, contentWidth - 20, splitGuidance.length * 5 + 15, 'F');
        
        pdf.text(splitGuidance, margin + 15, yPos + 5);
        yPos += splitGuidance.length * 5 + 25;
      }
      
      // Recommendations section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Spiritual Development Recommendations', margin + 10, yPos + 10);
      
      yPos += 25;
      
      // Recommendations table
      const recHeaders = ['Category', 'Recommendation', 'Benefits'];
      const recData = [
        ['Meditation', 'Practice daily 10-15 minute meditation', 'Strengthens energy field & awareness'],
        ['Journaling', 'Keep spiritual journal for energy tracking', 'Monitors patterns & growth'],
        ['Community', 'Connect with like-minded individuals', 'Shared wisdom & support'],
        ['Professional', 'Consider working with healers', 'Deeper guidance & healing'],
        ['Intuition', 'Trust your inner guidance', 'Authentic spiritual development']
      ];
      
      yPos = createTable(yPos, recHeaders, recData, [30, 70, 60]);
      yPos += 20;
      
      // Closing message
      pdf.setFillColor(240, 240, 255);
      pdf.rect(margin, yPos, contentWidth, 25, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(147, 51, 234);
      pdf.text('Your Spiritual Journey Continues', pageWidth / 2, yPos + 10, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Trust your unique energy signature and share your light with the world.', pageWidth / 2, yPos + 20, { align: 'center' });
      
      // Professional footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', margin, pageHeight - 15);
      pdf.text(`Page ${uploadedImageAdded ? 5 : 4}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

      // Save the PDF with filename
      const filename = `aura-analysis-${nameToUse}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your professional aura analysis report has been downloaded.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Main component return statement placeholder
  return <div>PDF System Ready</div>;
}
