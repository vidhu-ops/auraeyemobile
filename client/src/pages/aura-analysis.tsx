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
    'brown': '#A52A2A',
    // Additional color variations for diversity
    'Turquoise': '#40E0D0',
    'turquoise': '#40E0D0',
    'Teal': '#008080',
    'teal': '#008080',
    'Magenta': '#FF00FF',
    'magenta': '#FF00FF',
    'Cyan': '#00FFFF',
    'cyan': '#00FFFF'
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
  
  // Healer notes state (only for healers)
  const [healerNotes, setHealerNotes] = useState("");
  const [isHealerNotesExpanded, setIsHealerNotesExpanded] = useState(false);
  const [isSavingHealerNotes, setIsSavingHealerNotes] = useState(false);
  
  // Additional state variables
  const [numerologyResult, setNumerologyResult] = useState<any>(null);
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  const [numerologyName, setNumerologyName] = useState("");
  const [numerologyBirthDate, setNumerologyBirthDate] = useState("");

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

  // Helper functions for energy calculations
  const calculateGivingEnergy = (aura: AuraAnalysisResult): number => {
    const givingEnergyMap: Record<string, number> = {
      'Red': 85, 'Orange': 90, 'Yellow': 88, 'Green': 95, 'Blue': 82, 
      'Indigo': 78, 'Violet': 92, 'White': 89, 'Gold': 94, 'Silver': 80, 
      'Brown': 75, 'Black': 70
    };
    const base = givingEnergyMap[aura.dominantColor] || 72;
    const variation = Math.sin(aura.energyLevel * 0.1) * 8;
    const calculated = base + variation + (aura.energyLevel - 50) * 0.3;
    return Math.round(Math.max(0, Math.min(100, calculated)));
  };

  const calculateReceivingEnergy = (aura: AuraAnalysisResult): number => {
    const receivingEnergyMap: Record<string, number> = {
      'Red': 75, 'Orange': 88, 'Yellow': 80, 'Green': 92, 'Blue': 95, 
      'Indigo': 90, 'Violet': 88, 'White': 85, 'Gold': 87, 'Silver': 93, 
      'Brown': 78, 'Black': 82
    };
    const base = receivingEnergyMap[aura.dominantColor] || 70;
    const variation = Math.cos(aura.energyLevel * 0.15) * 6;
    const calculated = base + variation + (aura.energyLevel - 45) * 0.4;
    return Math.round(Math.max(0, Math.min(100, calculated)));
  };

  const calculateEarthStarChakra = (aura: AuraAnalysisResult): number => {
    const baseValue = aura.energyLevel * 8;
    const colorModifier = ['Brown', 'Black', 'Gray', 'Maroon'].includes(aura.dominantColor) ? 15 : 0;
    return Math.round(Math.max(0, Math.min(100, baseValue + colorModifier)));
  };

  const calculateSoulStarChakra = (aura: AuraAnalysisResult): number => {
    const baseValue = aura.energyLevel * 7;
    const colorModifier = ['Violet', 'White', 'Gold', 'Silver'].includes(aura.dominantColor) ? 20 : 0;
    return Math.round(Math.max(0, Math.min(100, baseValue + colorModifier)));
  };

  // Color mapping for aura visualization
  const getAuraColorRGB = (colorName: string): [number, number, number] => {
    const colorMap: Record<string, [number, number, number]> = {
      'Red': [255, 0, 0],
      'Orange': [255, 165, 0],
      'Yellow': [255, 255, 0],
      'Green': [0, 255, 0],
      'Blue': [0, 0, 255],
      'Indigo': [75, 0, 130],
      'Violet': [138, 43, 226],
      'White': [255, 255, 255],
      'Gold': [255, 215, 0],
      'Silver': [192, 192, 192],
      'Brown': [139, 69, 19],
      'Black': [0, 0, 0],
      'Purple': [128, 0, 128],
      'Pink': [255, 192, 203],
      'Gray': [128, 128, 128]
    };
    return colorMap[colorName] || [128, 128, 128];
  };

  // Enhanced face preservation function
  const preservePersonInFaceArea = (
    ctx: CanvasRenderingContext2D,
    originalImageData: ImageData,
    centerX: number,
    centerY: number,
    width: number,
    height: number
  ): void => {
    const faceRadius = Math.min(width, height) * 0.45; // Increased protection radius
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const originalData = originalImageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance < faceRadius) {
          const index = (y * width + x) * 4;
          // Create smooth gradient transition from center to edge
          const fadeStart = faceRadius * 0.6;
          const fadeEnd = faceRadius;
          
          if (distance < fadeStart) {
            // Full original image in center
            data[index] = originalData[index];
            data[index + 1] = originalData[index + 1];
            data[index + 2] = originalData[index + 2];
            data[index + 3] = originalData[index + 3];
          } else if (distance < fadeEnd) {
            // Gradient blend zone
            const blendFactor = (fadeEnd - distance) / (fadeEnd - fadeStart);
            data[index] = originalData[index] * blendFactor + data[index] * (1 - blendFactor);
            data[index + 1] = originalData[index + 1] * blendFactor + data[index + 1] * (1 - blendFactor);
            data[index + 2] = originalData[index + 2] * blendFactor + data[index + 2] * (1 - blendFactor);
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Create smokey aura layers with enhanced diffusion
  const createSmokeyAuraLayers = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    colors: {
      personality: string;
      giving: string;
      receiving: string;
      thinking: string;
    }
  ): void => {
    const personRadius = Math.min(width, height) * 0.25;

    // Energy zones with enhanced positioning
    const zones = [
      { name: 'thinking', color: colors.thinking, x: centerX, y: centerY - height * 0.3, radius: height * 0.4 },
      { name: 'receiving', color: colors.receiving, x: centerX - width * 0.35, y: centerY, radius: width * 0.45 },
      { name: 'giving', color: colors.giving, x: centerX + width * 0.35, y: centerY, radius: width * 0.45 },
      { name: 'personality', color: colors.personality, x: centerX, y: centerY + height * 0.3, radius: height * 0.4 }
    ];

    // Create multiple layers for ultra-smooth blending
    const layers = [
      { blur: 50, opacity: 0.25, particleCount: 80 },
      { blur: 35, opacity: 0.20, particleCount: 60 },
      { blur: 20, opacity: 0.15, particleCount: 40 },
      { blur: 15, opacity: 0.10, particleCount: 30 },
      { blur: 25, opacity: 0.12, particleCount: 50 }
    ];

    layers.forEach((layer, layerIndex) => {
      zones.forEach(zone => {
        const [r, g, b] = getAuraColorRGB(zone.color);
        
        // Create gradient base for this zone
        const gradient = ctx.createRadialGradient(
          zone.x, zone.y, personRadius,
          zone.x, zone.y, zone.radius
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${layer.opacity * 0.8})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${layer.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${layer.opacity * 0.2})`);

        ctx.save();
        ctx.filter = `blur(${layer.blur}px)`;
        ctx.globalCompositeOperation = layerIndex % 2 === 0 ? 'multiply' : 'soft-light';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Add diffused particles for smokey effect
        for (let i = 0; i < layer.particleCount; i++) {
          const angle = (Math.PI * 2 * i) / layer.particleCount + layerIndex * 0.5;
          const distance = personRadius + (zone.radius - personRadius) * (0.3 + Math.random() * 0.7);
          const particleX = zone.x + Math.cos(angle) * distance + (Math.random() - 0.5) * zone.radius * 0.4;
          const particleY = zone.y + Math.sin(angle) * distance + (Math.random() - 0.5) * zone.radius * 0.4;
          
          const particleSize = 120 + Math.random() * 120; // Large diffused particles
          const particleOpacity = layer.opacity * (0.2 + Math.random() * 0.4);

          const particleGradient = ctx.createRadialGradient(
            particleX, particleY, 0,
            particleX, particleY, particleSize
          );
          particleGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particleOpacity})`);
          particleGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${particleOpacity * 0.5})`);
          particleGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          ctx.save();
          ctx.filter = `blur(${layer.blur * 0.8}px)`;
          ctx.globalCompositeOperation = 'color-dodge';
          ctx.fillStyle = particleGradient;
          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    });

    // Cross-zone blending for seamless transitions
    zones.forEach((zone1, i) => {
      zones.forEach((zone2, j) => {
        if (i < j) {
          const [r1, g1, b1] = getAuraColorRGB(zone1.color);
          const [r2, g2, b2] = getAuraColorRGB(zone2.color);
          const blendR = Math.round((r1 + r2) / 2);
          const blendG = Math.round((g1 + g2) / 2);
          const blendB = Math.round((b1 + b2) / 2);

          const midX = (zone1.x + zone2.x) / 2;
          const midY = (zone1.y + zone2.y) / 2;
          const blendRadius = Math.min(zone1.radius, zone2.radius) * 0.6;

          for (let k = 0; k < 30; k++) {
            const angle = (Math.PI * 2 * k) / 30;
            const distance = blendRadius * (0.5 + Math.random() * 0.5);
            const particleX = midX + Math.cos(angle) * distance;
            const particleY = midY + Math.sin(angle) * distance;
            const particleSize = 80 + Math.random() * 80;

            const blendGradient = ctx.createRadialGradient(
              particleX, particleY, 0,
              particleX, particleY, particleSize
            );
            blendGradient.addColorStop(0, `rgba(${blendR}, ${blendG}, ${blendB}, 0.15)`);
            blendGradient.addColorStop(1, `rgba(${blendR}, ${blendG}, ${blendB}, 0)`);

            ctx.save();
            ctx.filter = 'blur(40px)';
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = blendGradient;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });
    });
  };

  // Generate aura visualization function
  const generateAuraVisualization = (originalImageBase64: string | undefined, auraData: AuraAnalysisResult): void => {
    if (!originalImageBase64) return;

    const img = new Image();
    img.src = originalImageBase64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to standard aura format
      canvas.width = 1600;
      canvas.height = 900;

      // Draw original image scaled to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Store original image data for face preservation
      const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Detect person center (simplified - center of image)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Define aura colors (using dynamic colors from analysis)
      const auraColors = {
        personality: auraData.dominantColor,
        giving: auraData.secondaryColor || 'Blue',
        receiving: 'Green',
        thinking: 'Violet'
      };

      // Create smokey aura layers
      createSmokeyAuraLayers(ctx, canvas.width, canvas.height, centerX, centerY, auraColors);

      // Preserve person's face with enhanced diffused edges
      preservePersonInFaceArea(ctx, originalImageData, centerX, centerY, canvas.width, canvas.height);

      // Add Aurafy watermark
      ctx.save();
      ctx.font = 'bold 100px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      ctx.fillText('Aurafy', canvas.width / 2, canvas.height / 2);
      ctx.restore();

      // Convert to base64 and set as processed image
      const processedImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setProcessedAuraImage(processedImageDataUrl);
    };
  };

  // Check if user is a healer (password healer123)
  const isHealer = user?.userType === 'healer' || false;

  // Upload and analysis handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisStage("Initializing aura scanning...");

      // Create image from file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageBase64 = e.target?.result as string;
        setOriginalImage(imageBase64);

        // Generate visualization
        const mockResult: AuraAnalysisResult = {
          id: Date.now(),
          dominantColor: 'Blue',
          secondaryColor: 'Purple',
          energyLevel: 75,
          spiritualGuidance: 'You have a strong spiritual connection.',
          personalityTraits: ['Intuitive', 'Calm', 'Wise'],
          chakraActivity: {
            soulStar: 8,
            root: 7,
            sacral: 6,
            solarPlexus: 8,
            heart: 9,
            throat: 7,
            thirdEye: 8,
            crown: 9
          },
          zones: [],
          colorMeanings: {},
          detailedAnalysis: 'Your aura shows strong spiritual energy.',
          auraColorSpectrum: [],
          processedAuraImage: '',
          createdAt: new Date().toISOString(),
          name: analysisName
        };

        generateAuraVisualization(imageBase64, mockResult);
        setResult(mockResult);
        setActiveTab('analysis');
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error during analysis:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Please try again with a different image.",
        variant: "destructive",
      });
    }
  };

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
                  Aura analysis requires professional interpretation for accurate spiritual guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Link href="/healers">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3">
                      <Users className="w-5 h-5 mr-2" />
                      Connect with a Healer
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main healer interface for aura analysis
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
              Advanced spiritual energy analysis and chakra reading
            </p>
          </div>

          {!nameEntered ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>Enter Client Name</CardTitle>
                <CardDescription className="text-white/70">
                  Please enter the name for this aura analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={analysisName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnalysisName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button
                    onClick={() => {
                      if (analysisName.trim()) {
                        setNameEntered(true);
                      }
                    }}
                    disabled={!analysisName.trim() || isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {!result && !isAnalyzing && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Upload Image for Aura Analysis</CardTitle>
                    <CardDescription className="text-white/70">
                      Analysis for: {analysisName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="w-full p-4 border-2 border-dashed border-white/30 rounded-lg bg-white/5 text-white"
                    />
                  </CardContent>
                </Card>
              )}

              {isAnalyzing && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                      <p className="text-lg">{analysisStage}</p>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Aura Analysis Complete</CardTitle>
                    <CardDescription className="text-white/70">
                      Analysis for: {analysisName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/70">Dominant Color</p>
                          <p className="text-lg font-semibold">{result.dominantColor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Energy Level</p>
                          <p className="text-lg font-semibold">{result.energyLevel}/100</p>
                        </div>
                      </div>
                      
                      {processedAuraImage && (
                        <div className="text-center">
                          <img
                            src={processedAuraImage}
                            alt="Processed Aura"
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-white/70 mb-2">Spiritual Guidance</p>
                        <p className="text-white">{result.spiritualGuidance}</p>
                      </div>

                      <div>
                        <p className="text-sm text-white/70 mb-2">Personality Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {result.personalityTraits.map((trait, index) => (
                            <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setResult(null);
                          setNameEntered(false);
                          setAnalysisName("");
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        New Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
