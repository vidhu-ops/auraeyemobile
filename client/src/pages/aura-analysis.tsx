import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Sparkles, Zap, Download, Star, MessageSquare, CheckCircle2, Users, Upload, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Color code mapping function - moved outside component for global access
const getAccurateColorCode = (colorName: string): string => {
  const colorCodes: Record<string, string> = {
    'black': '#000000',
    'Black': '#000000',
    'white': '#FFFFFF',
    'White': '#FFFFFF',
    'brown': '#A52A2A',
    'Brown': '#A52A2A',
    'red': '#FF0000',
    'Red': '#FF0000',
    'yellow': '#FFFF00',
    'Yellow': '#FFFF00',
    'blue': '#0000FF',
    'Blue': '#0000FF',
    'green': '#00FF00',
    'Green': '#00FF00',
    'violet': '#8A2BE2',
    'Violet': '#8A2BE2',
    'indigo': '#4B0082',
    'Indigo': '#4B0082',
    'gold': '#FFD700',
    'Gold': '#FFD700',
    'silver': '#C0C0C0',
    'Silver': '#C0C0C0',
    'orange': '#FFA500',
    'Orange': '#FFA500',
    'pink': '#FFC0CB',
    'Pink': '#FFC0CB',
    'gray': '#808080',
    'Gray': '#808080',
  };
  
  return colorCodes[colorName] || '#FFFFFF'; // Default to white if color not found
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
    'Pink': 'Divine love and emotional healing. This gentle frequency promotes unconditional love and emotional nurturing.',
    'Gold': 'Divine wisdom and spiritual illumination. This sacred frequency represents enlightened consciousness and spiritual mastery.',
    'White': 'Pure divine light and spiritual protection. This pristine frequency indicates angelic connection and spiritual purity.',
    'Silver': 'Lunar energy and psychic sensitivity. This reflective frequency enhances intuitive abilities and emotional receptivity.',
    'black': 'Shadow work and transformative energy. This deep frequency represents deep spiritual integration and shadow healing.',
    'grey': 'Neutral balance and adaptable wisdom. This balanced frequency indicates wise neutrality and peaceful resolution.',
    'brown': 'Earth connection and grounding stability. This practical frequency represents natural wisdom and earth-based spiritual growth.',
    
  };
  return meanings[color] || 'This unique aura color carries special spiritual significance and represents your individual soul expression.';
};

const getColorMeditationFocus = (color: string): string => {
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Name input state
  const [nameEntered, setNameEntered] = useState(false);
  const [analysisName, setAnalysisName] = useState("");
  
  // Image hash storage for consistent results
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());
  
  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userName, setUserName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } } as any);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze your aura.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStage("Preparing image for analysis...");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", userName);

      const response = await apiRequest("POST", "/api/analyze-aura", formData);
      
      if (response.ok) {
        const analysisResult = await response.json();
        setResult(analysisResult);
        setCurrentAnalysisId(analysisResult.id);
        setAnalysisProgress(100);
        setAnalysisStage("Analysis complete!");
        
        toast({
          title: "Aura Analysis Complete",
          description: "Your spiritual energy analysis is ready!",
        });
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      console.error("Error analyzing aura:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your aura. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to get color hex code
  const getColorHex = (colorName: string): string => {
    return getAccurateColorCode(colorName);
  };

  // Helper function to get color name from hex
  const getColorNameFromHex = (hex: string): string => {
    const colorMap: Record<string, string> = {
      '#FF0000': 'Red',
      '#FF4500': 'Orange',
      '#FFFF00': 'Yellow',
      '#00FF00': 'Green',
      '#0000FF': 'Blue',
      '#4B0082': 'Indigo',
      '#EE82EE': 'Violet',
      '#800080': 'Purple',
      '#FFC0CB': 'Pink',
      '#FFD700': 'Gold',
      '#C0C0C0': 'Silver',
      '#FFFFFF': 'White',
      '#000000': 'Black',
      '#808080': 'Gray',
      '#A52A2A': 'Brown'
    };
    return colorMap[hex] || 'Purple';
  };

  // Helper function to get color keyword
  const getColorKeyword = (color: string): string => {
    const keywords: Record<string, string> = {
      'Red': 'Passion & Power',
      'Orange': 'Creativity & Joy',
      'Yellow': 'Wisdom & Confidence',
      'Green': 'Healing & Growth',
      'Blue': 'Peace & Communication',
      'Indigo': 'Intuition & Insight',
      'Violet': 'Spirituality & Transformation',
      'Purple': 'Mysticism & Magic',
      'Pink': 'Love & Compassion',
      'Gold': 'Divine Wisdom',
      'Silver': 'Psychic Sensitivity',
      'White': 'Purity & Protection',
      'Black': 'Mystery & Depth',
      'Gray': 'Balance & Neutrality',
      'Brown': 'Grounding & Stability'
    };
    return keywords[color] || 'Spiritual Energy';
  };

  // Helper function to get spectrum position
  const getSpectrumPosition = (color: string): number | null => {
    const positions: Record<string, number> = {
      'Red': 0,
      'Orange': 16,
      'Yellow': 33,
      'Green': 50,
      'Blue': 67,
      'Indigo': 83,
      'Violet': 100
    };
    return positions[color] || null;
  };

  // Helper function to get color meaning for energy tab
  const getColorMeaningForEnergyTab = (color: string): string => {
    return getColorSpiritalMeaning(color);
  };

  // Helper function to calculate Earth Star chakra
  const calculateEarthStarChakra = (result: AuraAnalysisResult): number => {
    if (!result.chakraActivity) return 50;
    const { root, sacral } = result.chakraActivity;
    return Math.round(((root + sacral) / 2) * 10);
  };

  // Helper function to get detailed placement
  const getDetailedPlacement = (color: string): string => {
    const placements: Record<string, string> = {
      'Red': 'Connected to Root Chakra - represents grounding, survival, and physical vitality',
      'Orange': 'Connected to Sacral Chakra - represents creativity, sexuality, and emotional flow',
      'Yellow': 'Connected to Solar Plexus Chakra - represents personal power, confidence, and mental clarity',
      'Green': 'Connected to Heart Chakra - represents love, compassion, and emotional healing',
      'Blue': 'Connected to Throat Chakra - represents communication, truth, and self-expression',
      'Indigo': 'Connected to Third Eye Chakra - represents intuition, wisdom, and spiritual insight',
      'Violet': 'Connected to Crown Chakra - represents spiritual connection and divine consciousness',
      'Purple': 'Connected to Crown Chakra - represents mystical wisdom and spiritual mastery',
      'Pink': 'Connected to Heart Chakra - represents unconditional love and emotional nurturing',
      'Gold': 'Connected to all chakras - represents divine wisdom and spiritual enlightenment',
      'Silver': 'Connected to Third Eye and Crown - represents psychic abilities and lunar wisdom',
      'White': 'Connected to Crown Chakra - represents purity, protection, and divine light',
      'Black': 'Connected to Root Chakra - represents shadow work and deep transformation',
      'Gray': 'Connected to all chakras - represents balance and neutral energy flow',
      'Brown': 'Connected to Earth Star Chakra - represents earthly grounding and stability'
    };
    return placements[color] || 'Connected to the chakra system for spiritual alignment';
  };

  // Helper function to get color healing
  const getColorHealing = (primary: string, secondary: string): string => {
    const healing: Record<string, string> = {
      'Red': 'Focus on grounding exercises, physical activity, and root chakra meditation',
      'Orange': 'Engage in creative activities, emotional expression, and sacral chakra healing',
      'Yellow': 'Practice confidence building, mental clarity exercises, and solar plexus work',
      'Green': 'Spend time in nature, practice heart-opening meditations, and compassion work',
      'Blue': 'Focus on communication, throat chakra clearing, and truthful expression',
      'Indigo': 'Develop intuition, practice third eye meditation, and inner wisdom work',
      'Violet': 'Engage in spiritual practices, crown chakra meditation, and divine connection',
      'Purple': 'Focus on mystical studies, spiritual development, and magical practices',
      'Pink': 'Practice self-love, emotional healing, and heart chakra nurturing',
      'Gold': 'Seek divine wisdom, practice enlightenment work, and spiritual teaching',
      'Silver': 'Develop psychic abilities, lunar work, and emotional sensitivity healing',
      'White': 'Practice purification, protection work, and divine light meditation',
      'Black': 'Focus on shadow work, transformation, and deep inner healing',
      'Gray': 'Seek balance, neutrality, and harmonious energy flow',
      'Brown': 'Practice earthly grounding, stability work, and environmental connection'
    };
    
    const primaryHealing = healing[primary] || 'Focus on spiritual alignment and energy work';
    const secondaryHealing = healing[secondary] || 'Support with complementary energy practices';
    
    return `${primaryHealing}. Additionally, ${secondaryHealing.toLowerCase()} to create a balanced energy field.`;
  };

  // Helper function to get energy pattern
  const getEnergyPattern = (primary: string, secondary: string): string => {
    return `Your energy pattern shows a ${primary.toLowerCase()} foundation with ${secondary.toLowerCase()} influences, creating a unique spiritual signature that guides your life path and relationships.`;
  };

  // Helper function to calculate aura strength
  const calculateAuraStrength = (result: AuraAnalysisResult): number => {
    if (!result.chakraActivity) return 75;
    const values = Object.values(result.chakraActivity);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(average * 10);
  };

  // Helper function to calculate energy balance
  const calculateEnergyBalance = (result: AuraAnalysisResult): number => {
    if (!result.chakraActivity) return 80;
    const values = Object.values(result.chakraActivity);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const balance = 100 - ((max - min) * 10);
    return Math.round(Math.max(0, balance));
  };

  // Helper function to calculate vulnerability
  const calculateVulnerability = (result: AuraAnalysisResult): number => {
    if (!result.chakraActivity) return 25;
    const values = Object.values(result.chakraActivity);
    const weakest = Math.min(...values);
    return Math.round((10 - weakest) * 10);
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
    ctx.globalAlpha = 0.4; // 80% opacity for better visibility
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add strong text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    // Draw watermark text
    ctx.fillText('Aurafy', centerX, centerY);
    
    // Add a second layer for extra visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('Aurafy', centerX, centerY);
    
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
    if (!result || !processedAuraImage) {
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
        img.src = processedAuraImage;
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
      ctx.fillText('Discover your spiritual energy with Aurafy', canvas.width / 2, canvas.height - 70);
      
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
          text: `Check out my aura analysis! My dominant color is ${result.dominantColor} with an energy level of ${result.energyLevel}/10. Discover your spiritual energy with Aurfy!`,
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
        const shareText = `Check out my aura analysis! My dominant color is ${result.dominantColor} with an energy level of ${result.energyLevel}/10. Discover your spiritual energy with Aurfy! ${window.location.href}`;
        
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

  // Enhanced PDF Download with Screenshot Capture of All 8 Tabs
  const downloadAuraPDF = async () => {
    if (!result) return;

    try {
      setIsGeneratingPDF(true);
      
      toast({
        title: "Generating PDF with Screenshots",
        description: "Capturing all 8 tabs with exact UI/UX components...",
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Get user name
      const userName = analysisName || 'User';
      
      // Create professional header
      pdf.setFontSize(24);
      pdf.setTextColor(147, 51, 234);
      pdf.text('COMPLETE AURA ANALYSIS REPORT', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`Name: ${userName}`, pageWidth / 2, 45, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      const date = new Date().toLocaleDateString();
      pdf.text(`Analysis Date: ${date}`, pageWidth / 2, 55, { align: 'center' });
      
      // Add horizontal line
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, pageWidth - 20, 65);
      
      // Add processed aura image if available
      if (processedAuraImage) {
        try {
          pdf.addPage();
          
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('AURA VISUALIZATION', pageWidth / 2, 25, { align: 'center' });
          
          // Add image centered
          const imgWidth = 160;
          const imgHeight = 90; // 16:9 aspect ratio
          const imgX = (pageWidth - imgWidth) / 2;
          
          pdf.addImage(processedAuraImage, 'JPEG', imgX, 35, imgWidth, imgHeight);
          
          pdf.setFontSize(12);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Your Processed Aura Energy Visualization', pageWidth / 2, 135, { align: 'center' });
          
        } catch (error) {
          console.error('Error adding aura image to PDF:', error);
        }
      }
      
      // Get the tab container element
      const tabContainer = document.getElementById('aura-reading-section');
      if (!tabContainer) {
        throw new Error('Tab container not found');
      }
      
      // All 8 tabs in the aura analysis
      const tabs = ['analysis', 'energy-reading', 'chakras', 'guidance', 'spectrum', 'energy-map', 'detailed', 'combined'];
      const tabNames = {
        'analysis': 'Analysis - Complete Aura Reading',
        'energy-reading': 'Chakra Score - Energy Levels',
        'chakras': 'Detailed Chakras Analysis',
        'guidance': 'Spiritual Guidance',
        'spectrum': 'Color Spectrum Analysis',
        'energy-map': 'Energy Map Visualization',
        'detailed': 'Detailed Analysis Report',
        'combined': 'Combined Analysis Summary'
      };
      
      // Capture each tab
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabName = tabNames[tab];
        
        // Switch to the tab
        setActiveTab(tab);
        
        // Wait for tab to render completely
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Find the active tab content
        const tabContent = tabContainer.querySelector(`[data-state="active"]`);
        if (!tabContent) {
          console.error(`Tab content not found for ${tab}`);
          continue;
        }
        
        // Capture screenshot of the tab with high quality
        const canvas = await html2canvas(tabContent as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: tabContent.scrollWidth,
          height: tabContent.scrollHeight,
          logging: false,
          imageTimeout: 0,
          removeContainer: true
        });
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Add new page for each tab
        pdf.addPage();
        
        // Add tab title
        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`TAB ${i + 1}: ${tabName.toUpperCase()}`, 20, 25);
        
        // Add subtitle with user info
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`User: ${userName} | Date: ${date}`, 20, 35);
        
        // Add horizontal line
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.5);
        pdf.line(20, 40, pageWidth - 20, 40);
        
        // Calculate image dimensions to fit page
        const maxWidth = pageWidth - 40;
        const maxHeight = pageHeight - 60;
        
        let imgWidth = Math.min(maxWidth, canvas.width * 0.264583); // Convert pixels to mm
        let imgHeight = Math.min(maxHeight, canvas.height * 0.264583);
        
        // Maintain aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        if (imgWidth / imgHeight > aspectRatio) {
          imgWidth = imgHeight * aspectRatio;
        } else {
          imgHeight = imgWidth / aspectRatio;
        }
        
        // Center the image
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = 50;
        
        // Add the screenshot to PDF
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
        
        // Add tab number at bottom
        pdf.setFontSize(10);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Tab ${i + 1} of ${tabs.length} - ${tabName}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Update progress
        toast({
          title: `Capturing Tab ${i + 1}/${tabs.length}`,
          description: `Processing ${tabName}...`,
        });
      }
      
      // Add summary page
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.setTextColor(147, 51, 234);
      pdf.text('REPORT SUMMARY', pageWidth / 2, 50, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`User: ${userName}`, pageWidth / 2, 70, { align: 'center' });
      pdf.text(`Analysis Date: ${date}`, pageWidth / 2, 85, { align: 'center' });
      pdf.text(`Total Tabs Captured: ${tabs.length}`, pageWidth / 2, 100, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text('This report contains complete screenshot captures of all aura analysis tabs', pageWidth / 2, 120, { align: 'center' });
      pdf.text('All UI/UX components, graphs, bars, and visual elements included', pageWidth / 2, 130, { align: 'center' });
      pdf.text('Generated by Aurfy - Spiritual Wellness Platform', pageWidth / 2, 140, { align: 'center' });
      
      // Save PDF with enhanced filename
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`complete-aura-analysis-${userName}-${timestamp}-all-tabs.pdf`);
      
      toast({
        title: "Complete Screenshot PDF Generated",
        description: `Professional report for ${userName} with all ${tabs.length} tab screenshots has been downloaded`,
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper function to get color meanings with positive and shadow aspects
  const getColorMeaning = (colorName: string): string => {
    const redMeaning = {
      color: 'Red',
      chakra: 'Root Chakra Power',
      number: '1',
      meaning: 'Root chakra vitality emanating passionate life force energy and fierce determination through grounded spiritual power. This dynamic frequency channels physical strength and survival wisdom through courageous leadership and protective instincts.'
    };
    
    const orangeMeaning = {
      color: 'Orange',
      chakra: 'Sacral Chakra Flow',
      number: '2',
      meaning: 'Sacral chakra abundance flowing creative sexual energy and artistic inspiration through joyful emotional expression. This vibrant frequency channels artistic creativity and sensual wisdom through passionate relationship dynamics and emotional intelligence.'
    };
    
    const yellowMeaning = {
      color: 'Yellow',
      chakra: 'Solar Plexus Radiance',
      number: '3',
      meaning: 'Solar plexus radiance generating confident personal power and intellectual brilliance through optimistic spiritual wisdom. This luminous frequency channels mental clarity and decisive leadership through authentic self-expression and empowered boundaries.'
    };
    
    const greenMeaning = {
      color: 'Green',
      chakra: 'Heart Chakra Harmony',
      number: '4',
      meaning: 'Heart chakra harmony radiating unconditional love and natural healing energy through compassionate spiritual service. This nurturing frequency channels emotional healing and relationship wisdom through environmental connection and empathetic understanding.'
    };
    
    const blueMeaning = {
      color: 'Blue',
      chakra: 'Throat Chakra Truth',
      number: '5',
      meaning: 'Throat chakra truth expressing authentic communication and spiritual teaching through clear divine expression. This flowing frequency channels healing wisdom and honest communication through artistic expression and spiritual guidance.'
    };
    
    const indigoMeaning = {
      color: 'Indigo',
      chakra: 'Third Eye Insight',
      number: '6',
      meaning: 'Third eye insight activating psychic abilities and intuitive wisdom through deep spiritual perception. This mystical frequency channels prophetic vision and psychic healing through meditation mastery and spiritual counseling.'
    };
    
    const violetMeaning = {
      color: 'Violet',
      chakra: 'Crown Chakra Unity',
      number: '7',
      meaning: 'Crown chakra unity connecting divine consciousness and cosmic wisdom through enlightened spiritual leadership. This transcendent frequency channels universal love and spiritual mastery through divine service and cosmic consciousness.'
    };
    
    const purpleMeaning = {
      color: 'Purple',
      chakra: 'Spiritual Mastery',
      number: '7',
      meaning: 'Spiritual mastery frequency channeling mystical wisdom and magical abilities through transformed consciousness. This royal frequency enables spiritual teaching and energetic healing through ancient wisdom and mystical understanding.'
    };
    
    const pinkMeaning = {
      color: 'Pink',
      chakra: 'Heart Healing Light',
      number: '4',
      meaning: 'Heart healing light emanating gentle love and emotional nurturing through compassionate service. This tender frequency channels healing energy and unconditional acceptance through caring relationships and emotional support.'
    };
    
    const goldMeaning = {
      color: 'Gold',
      chakra: 'Divine Light Activation',
      number: '3',
      meaning: 'Divine light activation manifesting spiritual abundance and enlightened wisdom through golden consciousness. This precious frequency channels divine guidance and material mastery through spiritual leadership and abundant manifestation.'
    };
    
    const silverMeaning = {
      color: 'Silver',
      chakra: 'Lunar Wisdom Flow',
      number: '6',
      meaning: 'Lunar wisdom flow channeling psychic intuition and emotional intelligence through reflective spiritual insight. This luminous frequency enables psychic protection and emotional healing through lunar connection and intuitive guidance.'
    };
    
    const whiteMeaning = {
      color: 'White',
      chakra: 'Crown Chakra Pure Light',
      number: '7',
      meaning: 'Pure divine light emanation providing angelic protection and spiritual clarity through cosmic consciousness connection. This pristine frequency channels divine guidance and universal wisdom through clear spiritual perception and enlightened awareness.'
    };
    
    const blackMeaning = {
      color: 'Black',
      chakra: 'Shadow Integration Center',
      number: '0',
      meaning: 'Blockages : Shadow integration power activating deep inner work and transformative healing through void consciousness. This transformative frequency enables the ability to embrace darkness and manifest spiritual rebirth through shadow work and purification.'
    };

    const grayMeaning = {
      color: 'Gray',
      chakra: 'Neutral Balance Center',
      number: '0',
      meaning: 'Blockages - Neutral balance frequency providing spiritual equilibrium and wise neutrality through cosmic neutrality. This balanced frequency channels diplomatic wisdom and peaceful resolution through adaptable spiritual insight and emotional intelligence.'
    };

    
    
    const colorMeanings: Record<string, string> = {
      'Red': redMeaning.meaning,
      'Orange': orangeMeaning.meaning,
      'Yellow': yellowMeaning.meaning, 
      'Green': greenMeaning.meaning,
      'Blue': blueMeaning.meaning,
      'Indigo': indigoMeaning.meaning,
      'Violet': violetMeaning.meaning,
      'Purple': purpleMeaning.meaning,
      'Pink': pinkMeaning.meaning,
      'Gold': goldMeaning.meaning,
      'Silver': silverMeaning.meaning,
      'White': whiteMeaning.meaning,
      'black': blackMeaning.meaning,
      'gray': grayMeaning.meaning,
    };
    
    return colorMeanings[colorName] || colorMeanings['Purple'];
  }



  const getColorNegativeMeaning = (colorName: string): string => {
    const redShadow = {
      color: 'Red',
      chakra: 'Root Chakra Imbalance',
      number: '1',
      meaning: 'Root chakra imbalance manifesting through survival fears and aggressive tendencies that create blood pressure issues and adrenal exhaustion. This overactive frequency can lead to destructive anger patterns and inability to ground spiritual energy properly.'
    };
    
    const orangeShadow = {
      color: 'Orange',
      chakra: 'Sacral Chakra Blockage',
      number: '2',
      meaning: 'Sacral chakra blockage creating creative stagnation and sexual dysfunction while causing reproductive system imbalances and emotional instability. This restricted frequency prevents authentic creative expression and healthy emotional flow.'
    };
    
    const yellowShadow = {
      color: 'Yellow',
      chakra: 'Solar Plexus Weakness',
      number: '3',
      meaning: 'Solar plexus weakness generating digestive problems and low self-esteem that manifests as anxiety disorders and constant power struggles. This diminished frequency creates mental confusion and inability to maintain personal boundaries.'
    };
    
    const greenShadow = {
      color: 'Green',
      chakra: 'Heart Chakra Closure',
      number: '4',
      meaning: 'Heart chakra closure building emotional walls that create relationship difficulties and immune system weakness while manifesting lung problems. This protected frequency prevents authentic love expression and emotional vulnerability.'
    };
    
    const blueShadow = {
      color: 'Blue',
      chakra: 'Throat Chakra Blockage',
      number: '5',
      meaning: 'Throat chakra blockage causing communication fears and thyroid imbalances that create neck tension and truth suppression. This constricted frequency prevents authentic voice expression and honest spiritual communication.'
    };
    
    const indigoShadow = {
      color: 'Indigo',
      chakra: 'Third Eye Cloudiness',
      number: '6',
      meaning: 'Third eye cloudiness creating intuitive blocks and chronic headaches while causing vision problems and spiritual confusion. This clouded frequency prevents psychic development and clear spiritual perception.'
    };
    
    const violetShadow = {
      color: 'Violet',
      chakra: 'Crown Chakra Disconnection',
      number: '7',
      meaning: 'Crown chakra disconnection triggering spiritual crisis and depression while causing neurological issues and complete isolation from divine connection. This severed frequency creates existential emptiness and spiritual despair.'
    };
    
    const purpleShadow = {
      color: 'Purple',
      chakra: 'Spiritual Bypassing',
      number: '7',
      meaning: 'Spiritual bypassing tendencies creating ego inflation and mental health struggles while causing dangerous disconnection from physical reality. This distorted frequency prevents authentic spiritual growth through shadow integration.'
    };
    
    const pinkShadow = {
      color: 'Pink',
      chakra: 'Heart Wounds',
      number: '4',
      meaning: 'Heart wounds creating codependency patterns and boundary dissolution that leads to emotional manipulation and excessive self-sacrifice. This wounded frequency attracts unhealthy relationship dynamics and emotional exploitation.'
    };
    
    const goldShadow = {
      color: 'Gold',
      chakra: 'Spiritual Materialism',
      number: '3',
      meaning: 'Spiritual materialism creating ego attachment and fear of divine responsibility while manifesting perfectionism and disconnection from authentic spiritual service. This corrupted frequency prevents humble spiritual development.'
    };
    
    const silverShadow = {
      color: 'Silver',
      chakra: 'Emotional Volatility',
      number: '6',
      meaning: 'Emotional volatility causing psychic overwhelm and hormonal imbalances that create mood disorders and excessive lunar sensitivity. This unstable frequency prevents emotional regulation and psychic protection.'
    };
    
    const whiteShadow = {
      color: 'White',
      chakra: 'Spiritual Bypassing',
      number: '7',
      meaning: 'Because they are so in tune with the spiritual realm, white auras might be detached from the material world and ungrounded. They are trusting and discerning but may give people the benefit of the doubt even when they do not deserve it. Because they are good-natured and see the best in everyone, young and inexperienced white auras can fall prey to trickery and manipulation.'
    };
    
    const blackShadow = {
      color: 'Black',
      chakra: 'Shadow Obsession',
      number: '0',
      meaning: 'Shadow obsession creating negative energy absorption and depression depths while fostering complete isolation patterns from others. This dark frequency prevents healthy shadow integration through darkness addiction and social withdrawal.'
    };

    const grayShadow = {
      color: 'Gray',
      chakra: 'Emotional Detachment',
      number: '0',
      meaning: 'Emotional numbness creating spiritual detachment and complete avoidance of life engagement while fostering depression tendencies. This void frequency prevents authentic feeling and spiritual connection through emotional disconnection.'
    };
    
    const negativeMeanings: Record<string, string> = {
      'Red': redShadow.meaning,
      'Orange': orangeShadow.meaning,
      'Yellow': yellowShadow.meaning,
      'Green': greenShadow.meaning,
      'Blue': blueShadow.meaning,
      'Indigo': indigoShadow.meaning,
      'Violet': violetShadow.meaning,
      'Purple': purpleShadow.meaning,
      'Pink': pinkShadow.meaning,
      'Gold': goldShadow.meaning,
      'Silver': silverShadow.meaning,
      'White': whiteShadow.meaning,
      'Black': blackShadow.meaning,
      'Gray': grayShadow.meaning,
    };
    
    return negativeMeanings[colorName] || negativeMeanings['Purple'];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Aura Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your spiritual energy field through advanced AI-powered aura reading
          </p>
        </div>

        {!result ? (
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-gray-800">Upload Your Photo</CardTitle>
                <p className="text-gray-600">Upload a clear photo of yourself for AI aura analysis</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragOver 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Choose a photo or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Selected Image Preview */}
                  {selectedImage && (
                    <div className="text-center">
                      <img 
                        src={selectedImage} 
                        alt="Selected" 
                        className="max-w-full h-48 object-cover mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-gray-600 mt-2">Image selected successfully</p>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name (for personalized reading)
                    </label>
                    <Input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full"
                    />
                  </div>

                  {/* Analysis Button */}
                  <Button 
                    onClick={() => selectedFile && handleImageSelect(selectedFile)}
                    disabled={!selectedFile || !userName.trim() || isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Your Aura...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Analyze My Aura (1 Credit)
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    <p>✨ Advanced AI-powered spiritual analysis</p>
                    <p>🔮 Personalized chakra and energy reading</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Results Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Your Aura Analysis Results</h2>
                  <p className="text-lg text-gray-600">Analyzed for {userName}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={generateScreenshotPDF}
                    disabled={isGeneratingPDF}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Complete PDF
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setResult(null);
                      setSelectedImage(null);
                      setSelectedFile(null);
                      setUserName('');
                      setActiveTab('analysis');
                    }}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New Analysis
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 border-b border-gray-200">
                  {[
                    { id: 'analysis', name: 'Analysis', icon: '🔮' },
                    { id: 'energy-reading', name: 'Energy Reading', icon: '⚡' },
                    { id: 'chakras', name: 'Chakras', icon: '🌈' },
                    { id: 'guidance', name: 'Guidance', icon: '✨' },
                    { id: 'spectrum', name: 'Spectrum', icon: '🎨' },
                    { id: 'energy-map', name: 'Energy Map', icon: '🗺️' },
                    { id: 'detailed', name: 'Detailed', icon: '📊' },
                    { id: 'combined', name: 'Combined', icon: '🔗' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div id={`tab-${activeTab}`} className="bg-white rounded-lg shadow-lg p-6">
                {activeTab === 'analysis' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Basic Aura Analysis</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Aura Colors</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Primary Color:</span>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: getColorHex(result.dominantColor) }}
                                ></div>
                                <span className="font-semibold">{result.dominantColor}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Secondary Color:</span>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: getColorHex(result.secondaryColor) }}
                                ></div>
                                <span className="font-semibold">{result.secondaryColor}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Energy Level:</span>
                              <span className="font-semibold text-green-600">{result.energyLevel}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Spiritual Guidance</h4>
                          <p className="text-gray-700 leading-relaxed">{result.spiritualGuidance}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {result.processedAuraImage && (
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Aura Visualization</h4>
                            <div className="text-center">
                              <img 
                                src={result.processedAuraImage} 
                                alt="Processed Aura" 
                                className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                              />
                              <p className="text-sm text-gray-600 mt-2">Your energy field visualization</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'energy-reading' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Energy Reading Analysis</h3>
                      <p className="text-gray-600">Deep dive into your spiritual energy patterns</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-3 border-2 border-gray-300"
                            style={{ backgroundColor: getColorHex(result.dominantColor) }}
                          ></div>
                          Primary Energy - {result.dominantColor}
                        </h4>
                        <p className="text-sm text-gray-700">{getColorMeaningForEnergyTab(result.dominantColor)}</p>
                      </div>

                      {result.secondaryColor && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                          <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <div 
                              className="w-6 h-6 rounded-full mr-3 border-2 border-gray-300"
                              style={{ backgroundColor: getColorHex(result.secondaryColor) }}
                            ></div>
                            Secondary Energy - {result.secondaryColor}
                          </h4>
                          <p className="text-sm text-gray-700">{getColorMeaningForEnergyTab(result.secondaryColor)}</p>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Energy Harmony Analysis</h4>
                        <p className="text-sm text-gray-700">
                          {getColorHarmonyAnalysis(result.dominantColor, result.secondaryColor, result.auraColorSpectrum)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'chakras' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Chakra Activity Analysis</h3>
                      <p className="text-gray-600">Your energy centers and their current state</p>
                    </div>
                    
                    <div className="grid gap-6">
                      {/* Main 7 Chakras */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-6">Your 8-Chakra Energy System</h4>
                        <div className="space-y-4">
                          {[
                            { name: 'Crown Chakra', key: 'crown', color: 'Violet', score: result.chakraActivity?.crown || 5 },
                            { name: 'Third Eye Chakra', key: 'thirdEye', color: 'Indigo', score: result.chakraActivity?.thirdEye || 5 },
                            { name: 'Throat Chakra', key: 'throat', color: 'Blue', score: result.chakraActivity?.throat || 5 },
                            { name: 'Heart Chakra', key: 'heart', color: 'Green', score: result.chakraActivity?.heart || 5 },
                            { name: 'Solar Plexus Chakra', key: 'solarPlexus', color: 'Yellow', score: result.chakraActivity?.solarPlexus || 5 },
                            { name: 'Sacral Chakra', key: 'sacral', color: 'Orange', score: result.chakraActivity?.sacral || 5 },
                            { name: 'Root Chakra', key: 'root', color: 'Red', score: result.chakraActivity?.root || 5 },
                            { name: 'Earth Star Chakra', key: 'earthStar', color: 'Brown', score: Math.round(calculateEarthStarChakra(result)/10) }
                          ].map((chakra) => (
                            <div key={chakra.key} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: getColorHex(chakra.color) }}
                                ></div>
                                <span className="font-medium text-gray-800">{chakra.name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${(chakra.score / 10) * 100}%`,
                                      backgroundColor: getColorHex(chakra.color)
                                    }}
                                  ></div>
                                </div>
                                <span className="font-semibold text-gray-700 min-w-[60px]">
                                  {chakra.score}/10
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chakra Profile */}
                      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Chakra Profile</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {(() => {
                            // Calculate chakra groups for 8-chakra system
                            const higherChakras = ['crown', 'thirdEye', 'throat'];
                            const middleChakras = ['heart', 'solarPlexus'];
                            const lowerChakras = ['sacral', 'root', 'earthStar'];
                            
                            const higherAvg = higherChakras.reduce((sum, key) => 
                              sum + (result.chakraActivity?.[key] || 5), 0) / higherChakras.length;
                            const middleAvg = middleChakras.reduce((sum, key) => 
                              sum + (result.chakraActivity?.[key] || 5), 0) / middleChakras.length;
                            const lowerAvg = lowerChakras.reduce((sum, key) => {
                              if (key === 'earthStar') {
                                return sum + Math.round(calculateEarthStarChakra(result)/10);
                              }
                              return sum + (result.chakraActivity?.[key] || 5);
                            }, 0) / lowerChakras.length;
                            
                            const total = higherAvg + middleAvg + lowerAvg;
                            const higherPercent = Math.round((higherAvg / total) * 100);
                            const middlePercent = Math.round((middleAvg / total) * 100);
                            const lowerPercent = 100 - higherPercent - middlePercent; // Ensure they sum to 100
                            
                            return [
                              { name: 'Higher Chakras', percent: higherPercent, color: 'bg-purple-500' },
                              { name: 'Middle Chakras', percent: middlePercent, color: 'bg-green-500' },
                              { name: 'Lower Chakras', percent: lowerPercent, color: 'bg-red-500' }
                            ];
                          })().map((group) => (
                            <div key={group.name} className="text-center">
                              <div className={`w-16 h-16 ${group.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                                <span className="text-white font-bold text-lg">{group.percent}%</span>
                              </div>
                              <p className="font-medium text-gray-800">{group.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'guidance' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Spiritual Guidance & Insights</h3>
                      <p className="text-gray-600">Personalized guidance for your spiritual journey</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Spiritual Guidance</h4>
                        <p className="text-gray-700 leading-relaxed">{result.spiritualGuidance}</p>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Spiritual Gifts & Traits</h4>
                        <div className="flex flex-wrap gap-2">
                          {(result.personalityTraits || result.spiritualGifts || []).map((trait, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Recommended Focus Areas</h4>
                        <div className="space-y-2">
                          {getRecommendedFocusAreas(result).map((area, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-gray-700">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'spectrum' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Complete Aura Color Spectrum</h3>
                      <p className="text-gray-600">Your full energy color profile and meanings</p>
                    </div>
                    
                    <div className="grid gap-6">
                      {/* Primary spectrum display */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-6">Primary Spectrum (Red to Violet)</h4>
                        <div className="relative">
                          <div className="h-8 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 mb-4"></div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Red</span>
                            <span>Orange</span>
                            <span>Yellow</span>
                            <span>Green</span>
                            <span>Blue</span>
                            <span>Indigo</span>
                            <span>Violet</span>
                          </div>
                          {/* Position markers for detected colors */}
                          {[
                            { color: result.dominantColor, position: getSpectrumPosition(result.dominantColor) },
                            { color: result.secondaryColor, position: getSpectrumPosition(result.secondaryColor) }
                          ].filter(item => item.color && item.position !== null).map((item, index) => (
                            <div 
                              key={index}
                              className="absolute top-0 transform -translate-x-1/2"
                              style={{ left: `${item.position}%` }}
                            >
                              <div className="w-4 h-4 bg-white border-2 border-gray-800 rounded-full -mt-2"></div>
                              <div className="text-xs text-gray-800 mt-1 text-center font-medium">
                                {item.color}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Secondary spectrum: Purple to Green */}
                      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-6">Secondary Spectrum (Purple to Green)</h4>
                        <div className="relative">
                          <div className="h-8 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-500 via-blue-500 via-cyan-400 to-green-500 mb-4"></div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Purple</span>
                            <span>Indigo</span>
                            <span>Blue</span>
                            <span>Cyan</span>
                            <span>Green</span>
                          </div>
                          {/* Add some fixed markers for reference */}
                          {[
                            { name: 'Blue', position: 67 },
                            { name: 'Green', position: 45 }
                          ].map((marker, index) => (
                            <div 
                              key={index}
                              className="absolute top-0 transform -translate-x-1/2"
                              style={{ left: `${marker.position}%` }}
                            >
                              <div className="w-3 h-3 bg-gray-800 rounded-full -mt-1.5"></div>
                              <div className="text-xs text-gray-600 mt-1 text-center">
                                {marker.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Complete color profile */}
                      <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-6">Complete Aura Color Profile</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
                            // Create a unique set of colors, ensuring Blue and Green are always included
                            const allColors = [
                              result.dominantColor,
                              result.secondaryColor,
                              ...(result.auraColorSpectrum || []),
                              'Blue',  // Always include Blue
                              'Green'  // Always include Green
                            ].filter(Boolean);
                            
                            // Remove duplicates while preserving order, limit to 8 colors max
                            const uniqueColors = Array.from(new Set(allColors)).slice(0, 8);
                            
                            return uniqueColors;
                          })().map((color, index) => (
                            <div key={`${color}-${index}`} className="text-center p-4 bg-white rounded-lg shadow-sm">
                              <div 
                                className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white shadow-lg"
                                style={{ 
                                  backgroundColor: getColorHex(color),
                                  boxShadow: `0 0 20px ${getColorHex(color)}40`
                                }}
                              ></div>
                              <h5 className="font-semibold text-gray-800 mb-2">{color}</h5>
                              <p className="text-xs text-gray-600">{getColorKeyword(color)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'energy-map' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Energy Map & Flow Patterns</h3>
                      <p className="text-gray-600">Understanding your energy dynamics and patterns</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Energy Flow Analysis</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {getColorHarmonyAnalysis(result.dominantColor, result.secondaryColor, result.auraColorSpectrum)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Energy Patterns</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {getEnergyPattern(result.dominantColor, result.secondaryColor)}
                        </p>
                      </div>

                      {/* Energy Statistics */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-6">Energy Metrics</h4>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{calculateAuraStrength(result)}</span>
                            </div>
                            <h5 className="font-semibold text-gray-800">Aura Strength</h5>
                            <p className="text-sm text-gray-600">Overall energy intensity</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{calculateEnergyBalance(result)}</span>
                            </div>
                            <h5 className="font-semibold text-gray-800">Energy Balance</h5>
                            <p className="text-sm text-gray-600">Chakra harmony level</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{100 - calculateVulnerability(result)}</span>
                            </div>
                            <h5 className="font-semibold text-gray-800">Protection Level</h5>
                            <p className="text-sm text-gray-600">Spiritual resilience</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'detailed' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Detailed Analysis Report</h3>
                      <p className="text-gray-600">Comprehensive breakdown of your spiritual profile</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Primary Color Analysis - {result.dominantColor}</h4>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Positive Aspects:</h5>
                            <p className="text-gray-600">{getColorMeaning(result.dominantColor)}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Shadow Aspects to Balance:</h5>
                            <p className="text-gray-600">{getColorNegativeMeaning(result.dominantColor)}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Chakra Connection:</h5>
                            <p className="text-gray-600">{getDetailedPlacement(result.dominantColor)}</p>
                          </div>
                        </div>
                      </div>

                      {result.secondaryColor && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                          <h4 className="text-xl font-semibold text-gray-800 mb-4">Secondary Color Analysis - {result.secondaryColor}</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Positive Aspects:</h5>
                              <p className="text-gray-600">{getColorMeaning(result.secondaryColor)}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Shadow Aspects to Balance:</h5>
                              <p className="text-gray-600">{getColorNegativeMeaning(result.secondaryColor)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Healing Recommendations</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {getColorHealing(result.dominantColor, result.secondaryColor || 'White')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'combined' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Combined Analysis</h3>
                      <p className="text-gray-600">Integrated insights from all aspects of your reading</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Holistic Energy Profile</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {getEnergyPattern(result.dominantColor, result.secondaryColor)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Spiritual Development Path</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-semibold text-gray-700">Current Life Phase:</h5>
                            <p className="text-gray-600">{getCurrentLifePhase(result.dominantColor, result.secondaryColor)}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700">Growth Areas:</h5>
                            <div className="space-y-1">
                              {getRecommendedFocusAreas(result).slice(0, 3).map((area, index) => (
                                <p key={index} className="text-gray-600">• {area}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Integration Guidance</h4>
                        <p className="text-gray-700 leading-relaxed">
                          To achieve optimal spiritual balance, focus on integrating your {result.dominantColor.toLowerCase()} energy 
                          with the complementary qualities of {result.secondaryColor?.toLowerCase() || 'supportive colors'}. 
                          This creates a harmonious energy field that supports both personal growth and spiritual service.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}


