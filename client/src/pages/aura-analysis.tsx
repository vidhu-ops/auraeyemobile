import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Navigation from "@/components/layout/navbar";
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
import { Loader2, Crown, Sparkles, Zap, Download, Star, MessageSquare, CheckCircle2, Users } from "lucide-react";
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
  
  // Name input state
  const [nameEntered, setNameEntered] = useState(false);
  const [analysisName, setAnalysisName] = useState("");
  
  // Image hash storage for consistent results
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());
  
  // Missing state variables for full functionality
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handler for image selection
  const handleImageSelect = async (file: File) => {
    setLoading(true);
    setResult(null);
    setOriginalImage(null);
    setProcessedAuraImage(null);
    setAnalysisProgress(0);
    setAnalysisStage("Initializing aura scanning...");

    try {
      // Store original image
      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);
      setImageFile(file);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", analysisName || 'Unnamed');

      // Send to API
      const response = await fetch("/api/analyze-aura", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data: AuraAnalysisResult = await response.json();
      setResult(data);
      setAnalysisProgress(100);
      setActiveTab("overview");
      
      // Reset review system for new analysis
      setReviewSubmitted(false);
      setRating(0);
      setReviewText("");
      setCurrentAnalysisId(data.id || null);

      toast({
        title: "Analysis Complete",
        description: "Your aura analysis has been completed successfully!",
      });

    } catch (error) {
      console.error('Error in aura analysis:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for sharing aura image
  const shareAuraImage = async () => {
    if (!processedAuraImage) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Aura Analysis',
          text: 'Check out my spiritual aura analysis!',
          url: processedAuraImage,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Analysis link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Error",
        description: "Unable to share at this time",
        variant: "destructive",
      });
    }
  };

  // Handler for downloading PDF with comprehensive manual UI/UX recreation
  const downloadAuraPDF = async () => {
    if (!result) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // HEADER
      pdf.setFontSize(22);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Aura and Chakra Alignment Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // SUBHEADER
      pdf.setFontSize(14);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Comprehensive Spiritual Energy Analysis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // OVERVIEW TAB CONTENT
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Overview', 20, yPosition);
      yPosition += 15;
      
      // Primary Aura Color Box
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 20, 'F');
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Primary Aura Color:', 25, yPosition + 5);
      pdf.text(result.dominantColor, 25, yPosition + 12);
      yPosition += 30;
      
      // Secondary Aura Color Box (if exists)
      if (result.secondaryColor) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, yPosition - 5, pageWidth - 40, 20, 'F');
        pdf.text('Secondary Aura Color:', 25, yPosition + 5);
        pdf.text(result.secondaryColor, 25, yPosition + 12);
        yPosition += 30;
      }
      
      // Energy Level Box
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 20, 'F');
      pdf.text('Energy Level:', 25, yPosition + 5);
      pdf.text(result.energyLevel?.toString() || 'N/A', 25, yPosition + 12);
      yPosition += 30;
      
      // Spiritual Guidance Box
      if (result.spiritualGuidance) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, yPosition - 5, pageWidth - 40, 40, 'F');
        pdf.text('Spiritual Guidance:', 25, yPosition + 5);
        const guidanceLines = pdf.splitTextToSize(result.spiritualGuidance, pageWidth - 50);
        pdf.text(guidanceLines, 25, yPosition + 12);
        yPosition += 50;
      }
      
      // NEW PAGE FOR CHAKRAS
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // CHAKRAS TAB CONTENT
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Chakra Activity Levels', 20, yPosition);
      yPosition += 15;
      
      if (result.chakraActivity) {
        Object.entries(result.chakraActivity).forEach(([chakra, activity]) => {
          pdf.setFontSize(12);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`${chakra}:`, 25, yPosition);
          
          // Progress bar visualization
          const barWidth = 100;
          const barHeight = 5;
          const barX = 25;
          const barY = yPosition + 3;
          
          // Background bar
          pdf.setFillColor(229, 231, 235);
          pdf.rect(barX, barY, barWidth, barHeight, 'F');
          
          // Progress bar
          const progressWidth = (activity / 10) * barWidth;
          pdf.setFillColor(59, 130, 246);
          pdf.rect(barX, barY, progressWidth, barHeight, 'F');
          
          // Score text
          pdf.text(`${activity}/10`, barX + barWidth + 10, yPosition + 3);
          yPosition += 12;
        });
      }
      
      // NEW PAGE FOR COLORS
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // COLORS TAB CONTENT
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Four Aura Colors', 20, yPosition);
      yPosition += 15;
      
      const fourColors = [
        { label: 'Personality', color: result.personalityColor },
        { label: 'Giving', color: result.givingColor },
        { label: 'Receiving', color: result.receivingColor },
        { label: 'Thinking', color: result.thinkingColor }
      ];
      
      fourColors.forEach((item) => {
        if (item.color) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(20, yPosition - 5, pageWidth - 40, 20, 'F');
          pdf.setFontSize(12);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`${item.label}:`, 25, yPosition + 5);
          pdf.text(item.color, 25, yPosition + 12);
          yPosition += 25;
        }
      });
      
      // Color Meanings
      if (result.colorMeanings) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Color Meanings', 20, yPosition);
        yPosition += 15;
        
        Object.entries(result.colorMeanings).forEach(([color, meaning]) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          pdf.setFillColor(249, 250, 251);
          pdf.rect(20, yPosition - 5, pageWidth - 40, 30, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`${color}:`, 25, yPosition + 5);
          const meaningLines = pdf.splitTextToSize(meaning, pageWidth - 50);
          pdf.text(meaningLines, 25, yPosition + 12);
          yPosition += 35;
        });
      }
      
      // NEW PAGE FOR ANALYSIS
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // ANALYSIS TAB CONTENT
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Detailed Analysis', 20, yPosition);
      yPosition += 15;
      
      if (result.detailedAnalysis) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, yPosition - 5, pageWidth - 40, 60, 'F');
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Detailed Analysis:', 25, yPosition + 5);
        const analysisLines = pdf.splitTextToSize(result.detailedAnalysis, pageWidth - 50);
        pdf.text(analysisLines, 25, yPosition + 12);
        yPosition += 70;
      }
      
      // Personality Traits
      if (result.personalityTraits) {
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Personality Traits', 20, yPosition);
        yPosition += 15;
        
        result.personalityTraits.forEach((trait, index) => {
          pdf.setFillColor(219, 234, 254);
          pdf.rect(20 + (index % 3) * 60, yPosition, 55, 10, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(30, 64, 175);
          pdf.text(trait, 23 + (index % 3) * 60, yPosition + 6);
          
          if ((index + 1) % 3 === 0) {
            yPosition += 15;
          }
        });
      }
      
      // Save PDF
      const fileName = `aura-chakra-alignment-report-${analysisName || 'analysis'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF Downloaded",
        description: "Your comprehensive aura analysis report has been downloaded!",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Error",
        description: "Unable to generate PDF at this time",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
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
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  
  const handlePremiumUpgrade = () => {
    showPremiumModal("aura");
  };

  // Function to download complete aura and numerology analysis as PDF
      
      yPosition += 10;
      pdf.setFontSize(22);
      pdf.text('Alignment Report', 105, yPosition, { align: 'center' });
      
      yPosition += 20;
      pdf.setFontSize(12);
      const date = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${date}`, 105, yPosition, { align: 'center' });

      yPosition += 30;
      pdf.setFontSize(14);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Analysis for: ${name}`, 105, yPosition, { align: 'center' });

      // Add aura visualization image if available
      if (processedAuraImage) {
        try {
          pdf.addPage();
          yPosition = 30;
          
          pdf.setFontSize(18);
          pdf.setTextColor(75, 85, 99);
          pdf.text('Aura Visualization', 20, yPosition);
          yPosition += 15;
          
          // Create a temporary image to get actual dimensions
          const tempImg = new Image();
          tempImg.crossOrigin = 'anonymous';
          
          // Wait for image to load to get accurate dimensions
          await new Promise<void>((resolve) => {
            tempImg.onload = () => resolve();
            tempImg.onerror = () => resolve(); // Continue even if image fails to load
            tempImg.src = processedAuraImage;
          });
          
          // Use full page width for the image (A4 page width minus margins)
          const margin = 20; // Margins in mm
          const maxImageWidth = pageWidth - (margin * 2); // 170mm
          
          // Calculate height maintaining exact aspect ratio from processed aura image
          // Default to 1600:900 aspect ratio (our standard aura image dimensions)
          const originalAspectRatio = tempImg.naturalWidth && tempImg.naturalHeight 
            ? tempImg.naturalWidth / tempImg.naturalHeight 
            : 1600/900; // Standard aura image aspect ratio (16:9)
          
          const imageWidth = maxImageWidth;
          const imageHeight = imageWidth / originalAspectRatio;
          
          // Ensure image doesn't exceed page height
          const maxImageHeight = 120; // Maximum height in mm
          let finalImageWidth = imageWidth;
          let finalImageHeight = imageHeight;
          
          if (imageHeight > maxImageHeight) {
            finalImageHeight = maxImageHeight;
            finalImageWidth = finalImageHeight * originalAspectRatio;
          }
          
          // Check if image fits on current page, if not start new page
          if (yPosition + finalImageHeight > 270) {
            pdf.addPage();
            yPosition = 30;
            pdf.setFontSize(18);
            pdf.setTextColor(75, 85, 99);
            pdf.text('Aura Visualization', 20, yPosition);
            yPosition += 15;
          }
          
          const imageX = (pageWidth - finalImageWidth) / 2; // Center horizontally
          
          pdf.addImage(processedAuraImage, 'JPEG', imageX, yPosition, finalImageWidth, finalImageHeight);
          yPosition += finalImageHeight + 15;
          
          // Add image description
          pdf.setFontSize(10);
          pdf.setTextColor(100, 116, 139);
          pdf.text('Your complete aura visualization with energy colors and patterns', 105, yPosition, { align: 'center' });
          yPosition += 20;
          
        } catch (imageError) {
          console.error('Error adding aura image to PDF:', imageError);
          // Continue without the image if there's an error
        }
      }

      // TAB 1: OVERVIEW - Recreate exact UI/UX
      pdf.addPage();
      yPosition = 30;
      
      // Tab title with styling
      pdf.setFontSize(20);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Overview', 20, yPosition);
      yPosition += 20;
      
      // Primary aura color section (recreate card-like appearance)
      pdf.setFillColor(248, 250, 252); // Light gray background
      pdf.rect(20, yPosition, 170, 25, 'F');
      pdf.setDrawColor(226, 232, 240); // Border color
      pdf.rect(20, yPosition, 170, 25, 'S');
      
      pdf.setFontSize(14);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Primary Aura Color', 25, yPosition + 8);
      
      // Color circle representation
      const primaryColorCode = getAccurateColorCode(result.dominantColor);
      pdf.setFillColor(parseInt(primaryColorCode.slice(1, 3), 16), 
                       parseInt(primaryColorCode.slice(3, 5), 16), 
                       parseInt(primaryColorCode.slice(5, 7), 16));
      pdf.circle(150, yPosition + 12, 8, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(75, 85, 99);
      pdf.text(result.dominantColor, 25, yPosition + 20);
      yPosition += 35;
      
      // Secondary aura color section
      if (result.secondaryColor) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(20, yPosition, 170, 25, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(20, yPosition, 170, 25, 'S');
        
        pdf.setFontSize(14);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Secondary Aura Color', 25, yPosition + 8);
        
        const secondaryColorCode = getAccurateColorCode(result.secondaryColor);
        pdf.setFillColor(parseInt(secondaryColorCode.slice(1, 3), 16), 
                         parseInt(secondaryColorCode.slice(3, 5), 16), 
                         parseInt(secondaryColorCode.slice(5, 7), 16));
        pdf.circle(150, yPosition + 12, 8, 'F');
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        pdf.text(result.secondaryColor, 25, yPosition + 20);
        yPosition += 35;
      }
      
      // Energy level section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, yPosition, 170, 25, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(20, yPosition, 170, 25, 'S');
      
      pdf.setFontSize(14);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Energy Level', 25, yPosition + 8);
      
      pdf.setFontSize(12);
      pdf.setTextColor(75, 85, 99);
      pdf.text(result.energyLevel, 25, yPosition + 20);
      yPosition += 35;
      
      // Spiritual guidance section
      if (result.spiritualGuidance) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(20, yPosition, 170, 40, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(20, yPosition, 170, 40, 'S');
        
        pdf.setFontSize(14);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Spiritual Guidance', 25, yPosition + 8);
        
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        const guidanceLines = pdf.splitTextToSize(result.spiritualGuidance, 160);
        pdf.text(guidanceLines, 25, yPosition + 20);
        yPosition += 50;
      }
      
      // TAB 2: CHAKRAS - Recreate exact UI/UX
      pdf.addPage();
      yPosition = 30;
      
      pdf.setFontSize(20);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Chakras', 20, yPosition);
      yPosition += 20;
      
      // Chakra activity section
      if (result.chakraActivity) {
        pdf.setFontSize(16);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Chakra Activity Levels', 20, yPosition);
        yPosition += 15;
        
        Object.entries(result.chakraActivity).forEach(([chakraName, activity]) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          // Chakra name
          pdf.setFontSize(12);
          pdf.setTextColor(75, 85, 99);
          pdf.text(`${chakraName}:`, 25, yPosition);
          
          // Progress bar representation
          const progressWidth = 100;
          const progressHeight = 6;
          const progressX = 80;
          const progressY = yPosition - 3;
          
          // Background bar
          pdf.setFillColor(229, 231, 235);
          pdf.rect(progressX, progressY, progressWidth, progressHeight, 'F');
          
          // Progress fill
          const fillWidth = (activity / 10) * progressWidth;
          pdf.setFillColor(59, 130, 246); // Blue progress
          pdf.rect(progressX, progressY, fillWidth, progressHeight, 'F');
          
          // Activity score
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          pdf.text(`${activity}/10`, progressX + progressWidth + 5, yPosition);
          
          yPosition += 15;
        });
        yPosition += 10;
      }
      
      // TAB 3: COLORS - Recreate exact UI/UX
      pdf.addPage();
      yPosition = 30;
      
      pdf.setFontSize(20);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Colors', 20, yPosition);
      yPosition += 20;
      
      // Four aura colors section
      if (result.personalityColor || result.givingColor || result.receivingColor || result.thinkingColor) {
        pdf.setFontSize(16);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Four Aura Colors', 20, yPosition);
        yPosition += 15;
        
        // Create color cards layout
        const colorData = [
          { label: 'Personality', color: result.personalityColor },
          { label: 'Giving', color: result.givingColor },
          { label: 'Receiving', color: result.receivingColor },
          { label: 'Thinking', color: result.thinkingColor }
        ];
        
        colorData.forEach((item, index) => {
          if (item.color) {
            const cardX = 20 + (index % 2) * 85;
            const cardY = yPosition + Math.floor(index / 2) * 35;
            
            // Card background
            pdf.setFillColor(248, 250, 252);
            pdf.rect(cardX, cardY, 80, 30, 'F');
            pdf.setDrawColor(226, 232, 240);
            pdf.rect(cardX, cardY, 80, 30, 'S');
            
            // Color circle
            const colorCode = getAccurateColorCode(item.color);
            pdf.setFillColor(parseInt(colorCode.slice(1, 3), 16), 
                             parseInt(colorCode.slice(3, 5), 16), 
                             parseInt(colorCode.slice(5, 7), 16));
            pdf.circle(cardX + 15, cardY + 15, 8, 'F');
            
            // Labels
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81);
            pdf.text(item.label, cardX + 25, cardY + 12);
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            pdf.text(item.color, cardX + 25, cardY + 20);
          }
        });
        yPosition += 80;
      }
      
      // Color meanings section
      if (result.colorMeanings) {
        pdf.setFontSize(16);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Color Meanings', 20, yPosition);
        yPosition += 15;
        
        Object.entries(result.colorMeanings).forEach(([color, meaning]) => {
          if (yPosition > 240) {
            pdf.addPage();
            yPosition = 30;
          }
          
          // Color header
          pdf.setFontSize(12);
          pdf.setTextColor(75, 85, 99);
          pdf.text(`${color}:`, 25, yPosition);
          yPosition += 8;
          
          // Meaning text
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          const meaningLines = pdf.splitTextToSize(meaning, 160);
          pdf.text(meaningLines, 25, yPosition);
          yPosition += meaningLines.length * 5 + 10;
        });
      }
      
      // TAB 4: ANALYSIS - Recreate exact UI/UX
      pdf.addPage();
      yPosition = 30;
      
      pdf.setFontSize(20);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Analysis', 20, yPosition);
      yPosition += 20;
      
      // Detailed analysis section
      if (result.detailedAnalysis) {
        pdf.setFontSize(16);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Detailed Analysis', 20, yPosition);
        yPosition += 15;
        
        // Create styled text box
        pdf.setFillColor(248, 250, 252);
        const analysisHeight = 60;
        pdf.rect(20, yPosition, 170, analysisHeight, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(20, yPosition, 170, analysisHeight, 'S');
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const analysisLines = pdf.splitTextToSize(result.detailedAnalysis, 160);
        pdf.text(analysisLines, 25, yPosition + 10);
        yPosition += analysisHeight + 15;
      }
      
      // Personality traits section
      if (result.personalityTraits) {
        pdf.setFontSize(16);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Personality Traits', 20, yPosition);
        yPosition += 15;
        
        result.personalityTraits.forEach((trait, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          // Trait badge styling
          pdf.setFillColor(219, 234, 254); // Light blue background
          pdf.setDrawColor(147, 197, 253); // Blue border
          const traitWidth = pdf.getTextWidth(trait) + 10;
          pdf.rect(25, yPosition - 5, traitWidth, 12, 'FD');
          
          pdf.setFontSize(10);
          pdf.setTextColor(30, 58, 138); // Dark blue text
          pdf.text(trait, 30, yPosition + 2);
          
          yPosition += 20;
        });
        yPosition += 10;
      }

      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text('Generated by Aurafy - Your Spiritual Wellness Platform', 105, 285, { align: 'center' });
        pdf.text(`Page ${i} of ${totalPages}`, 190, 285, { align: 'right' });
      }

      // Add metadata
      pdf.setProperties({
        title: 'Aura and Chakra Alignment Report',
        subject: 'Complete Aura Analysis with All Tabs',
        author: 'Aurafy Spiritual Wellness Platform'
      });

      // Download
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`aura-chakra-alignment-report-${name}-${timestamp}.pdf`);

      toast({
        title: "PDF Downloaded Successfully", 
        description: "Your complete aura analysis report with all tabs has been saved",
      });

    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get accurate color codes for PDF visualization
  const getAccurateColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'Red': '#DC2626',
      'Orange': '#EA580C', 
      'Yellow': '#D97706',
      'Green': '#059669',
      'Blue': '#2563EB',
      'Indigo': '#4F46E5',
      'Violet': '#7C3AED',
      'Purple': '#9333EA',
      'Pink': '#EC4899',
      'Gold': '#D97706',
      'Silver': '#6B7280',
      'White': '#F9FAFB',
      'Black': '#111827',
      'Brown': '#92400E',
      'Gray': '#6B7280'
    };
    return colorMap[colorName] || '#6B7280';
  };

  // Helper function to get color meanings with positive and shadow aspects
  const getColorMeaning = (colorName: string): string => {
    const meaningMap: Record<string, string> = {
      'Red': 'Root chakra kundalini activation flowing with primal life force energy that empowers your physical vitality and natural leadership magnetism. This fundamental frequency channels courageous action and manifestation power through your earthly presence.',
      'Orange': 'Sacral chakra creative fire igniting passionate artistic expression and joyful emotional flow. This vibrant frequency awakens sensual pleasure, creative abundance, and the ability to manifest dreams through inspired action.',
      'Yellow': 'Solar plexus radiance illuminating personal power and intellectual brilliance. This golden frequency activates confidence, mental clarity, and the ability to transform knowledge into wisdom while maintaining optimistic leadership.',
      'Green': 'Heart chakra emerald light radiating unconditional love and natural healing abilities. This nurturing frequency opens compassionate service, emotional balance, and the gift of creating harmony while facilitating deep healing.',
      'Blue': 'Throat chakra sapphire truth activating authentic communication and peaceful wisdom. This calming frequency enables honest expression, trustworthy leadership, and the ability to speak divine truth with compassion.',
      'Indigo': 'Third eye indigo flame awakening psychic abilities and intuitive wisdom. This mystical frequency opens spiritual sight, enhances dream work, and develops the ability to see beyond physical reality into deeper truths.',
      'Violet': 'Crown chakra violet ray connecting to cosmic consciousness and divine guidance. This transcendent frequency opens spiritual channels, enhances meditation, and develops the ability to access higher wisdom.',
      'Purple': 'Higher crown mystical purple activating spiritual mastery and divine authority. This regal frequency channels cosmic wisdom, enables spiritual teaching, and develops the ability to bridge earthly and heavenly realms.',
      'Pink': 'Higher heart rose frequency radiating unconditional divine love and emotional healing. This gentle frequency opens soul-level compassion, enables heart healing, and develops the ability to love without conditions.',
      'Gold': 'Christ consciousness golden flame illuminating soul purpose and divine wisdom. This sacred frequency activates spiritual mastery, enables divine teaching, and develops the ability to guide others toward enlightenment.',
      'Silver': 'Lunar silver light activating intuitive wisdom and psychic protection. This reflective frequency enhances feminine wisdom, enables emotional sensitivity, and develops the ability to reflect truth.',
      'White': 'Pure divine light encompassing all frequencies in perfect spiritual protection. This transcendent frequency provides angelic connection, enables spiritual purification, and develops the ability to channel pure divine energy.',
    };
    const additionalMeanings: Record<string, string> = {
      'Gray': 'Neutral wisdom - but requires work',
      'Black': 'Shadow integration - requires work related to transformation power, deep inner work, void consciousness',
      'Brown': 'Earth connection - material stability, physical grounding, natural wisdom',
    };
    
    return meaningMap[colorName] || additionalMeanings[colorName] || additionalMeanings[colorName.toLowerCase()] || meaningMap[colorName.toLowerCase()] || 'Unknown color meaning';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Aura Analysis</h1>
          
          {!result ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload Image for Aura Analysis
                </label>
                <p className="text-gray-500 mt-2">
                  Upload a clear photo of yourself for spiritual aura analysis
                </p>
              </div>
              
              {loading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your aura...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <div className="flex gap-2">
                  <Button onClick={shareAuraImage} variant="outline" size="sm">
                    Share Results
                  </Button>
                  <Button onClick={downloadAuraPDF} variant="outline" size="sm">
                    Download PDF
                  </Button>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="chakras">Chakras</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Primary Aura Color</h3>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{backgroundColor: getAccurateColorCode(result.dominantColor)}}
                        ></div>
                        <span>{result.dominantColor}</span>
                      </div>
                    </div>
                    
                    {result.secondaryColor && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Secondary Aura Color</h3>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{backgroundColor: getAccurateColorCode(result.secondaryColor)}}
                          ></div>
                          <span>{result.secondaryColor}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Energy Level</h3>
                      <span>{result.energyLevel}</span>
                    </div>
                  </div>
                  
                  {result.spiritualGuidance && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Spiritual Guidance</h3>
                      <p className="text-sm text-gray-700">{result.spiritualGuidance}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="chakras" className="space-y-4">
                  <h3 className="font-semibold">Chakra Activity Levels</h3>
                  {result.chakraActivity && Object.entries(result.chakraActivity).map(([chakra, activity]) => (
                    <div key={chakra} className="flex items-center gap-4">
                      <span className="w-32 text-sm">{chakra}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{width: `${(activity / 10) * 100}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{activity}/10</span>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="colors" className="space-y-4">
                  <h3 className="font-semibold">Four Aura Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Personality', color: result.personalityColor },
                      { label: 'Giving', color: result.givingColor },
                      { label: 'Receiving', color: result.receivingColor },
                      { label: 'Thinking', color: result.thinkingColor }
                    ].map((item) => (
                      item.color && (
                        <div key={item.label} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{backgroundColor: getAccurateColorCode(item.color)}}
                            ></div>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-sm text-gray-600">{item.color}</span>
                        </div>
                      )
                    ))}
                  </div>
                  
                  {result.colorMeanings && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Color Meanings</h4>
                      {Object.entries(result.colorMeanings).map(([color, meaning]) => (
                        <div key={color} className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">{color}:</h5>
                          <p className="text-xs text-gray-700">{meaning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4">
                  {result.detailedAnalysis && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Detailed Analysis</h3>
                      <p className="text-sm text-gray-700">{result.detailedAnalysis}</p>
                    </div>
                  )}
                  
                  {result.personalityTraits && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Personality Traits</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.personalityTraits.map((trait, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
