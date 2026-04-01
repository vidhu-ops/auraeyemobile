import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import { queryClient } from "@/lib/queryClient";
import { useBadgeContext } from "@/hooks/use-badge-context";
import { canAccessObjectScanning } from "@/lib/profile-access";
import ServiceUpgrade from "@/components/service-upgrade";
import { Loader2, Upload, Crown, Image as ImageIcon, Sparkles, Star, MessageSquare, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/forms/image-upload";
import NameInput from "@/components/forms/name-input";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";

interface ObjectAnalysisResult {
  newBadges?: Array<{ id: number; name: string; description: string; icon: string }>;
  id?: number;
  objectName: string;
  objectDescription: string;
  objectPurpose: string;
  auraColor: string;
  auraDescription: string;
  energyLevel: number;
  energyQualities: string[];
  historicalSignificance?: string;
  spiritualSignificance?: string;
  detailedAnalysis: string;
}

export default function ObjectAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showPremiumModal } = usePremium();
  const { checkBadges, showBadges } = useBadgeContext();
  
  // Check if user can access object scanning
  const hasAccess = canAccessObjectScanning(user?.userType);
  
  // If user doesn't have access (e.g., semi-healer or client), show upgrade page
  if (user && !hasAccess) {
    return <ServiceUpgrade 
      serviceName="Object Scanning"
      serviceDescription="Spiritual energy analysis of objects and artifacts"
      upgradeMessage="Object scanning is an exclusive feature for premium healers. Upgrade your account to access this advanced spiritual service."
      icon="✨"
    />;
  }
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ObjectAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing object scanning...");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | null>(null);
  
  // Review system state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  // Name input state
  const [name, setName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState(true);

  const handlePremiumUpgrade = () => {
    showPremiumModal("general");
  };

  // Handle name submission
  const handleNameSubmit = (submittedName: string) => {
    setName(submittedName);
    setShowNameInput(false);
  };

  // Reset form for new analysis
  const resetForNewAnalysis = () => {
    setResult(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setEnhancedAuraImage(null);
    setAnalysisProgress(0);
    setAnalysisStage("Initializing object scanning...");
    setShowReviewForm(false);
    setRating(0);
    setReviewText("");
    setReviewSubmitted(false);
    setCurrentAnalysisId(null);
    setName('');
    setShowNameInput(true);
  };

  // Submit review for object analysis
  const submitReview = async () => {
    if (rating === 0) return;

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review for your object analysis.",
        variant: "destructive",
      });
      return;
    }

    // Check if we have an analysis ID to review
    if (!currentAnalysisId) {
      toast({
        title: "No Analysis Found",
        description: "Unable to submit review. Please try analyzing an object again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`/api/object-analyses/${currentAnalysisId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, reviewText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setReviewSubmitted(true);
      setRating(0);
      setReviewText("");
    } catch (error) {
      console.error("Review submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Function to convert hex to RGB for smokey aura effects
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 };
  };

  // Using existing getAccurateColorCode function defined later in the file

  // Function to create smokey aura effects around objects
  const createObjectAuraVisualization = (originalImageBase64: string, auraColor: string, energyLevel: number) => {
    const img = new Image();
    img.src = originalImageBase64;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Enhanced color mapping for object auras with comprehensive color palette
      const objectColorMap: Record<string, string> = {
        'Red': '#FF0000',
        'Orange': '#FF8C00', 
        'Yellow': '#FFFF00',
        'Green': '#00FF00',
        'Blue': '#0000FF',
        'Indigo': '#4B0082',
        'Violet': '#8B00FF',
        'Purple': '#800080',
        'Pink': '#FFC0CB',
        'White': '#FFFFFF',
        'Black': '#000000',
        'Gold': '#FFD700',
        'Silver': '#C0C0C0',
        'Brown': '#8B4513',
        'Gray': '#808080',
        'Grey': '#808080'
      };
      const auraHex = objectColorMap[auraColor] || '#9370DB';
      const auraRgb = hexToRgb(auraHex);
      
      // Create smokey aura around object
      createObjectSmokeyAura(ctx, img.width, img.height, auraRgb, energyLevel);
      
      // Convert back to base64
      const enhancedImageBase64 = canvas.toDataURL('image/jpeg');
      setEnhancedAuraImage(enhancedImageBase64);
    };
  };

  // Function to create smooth smokey diffused gradients around objects
  const createObjectSmokeyAura = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    auraColor: { r: number, g: number, b: number },
    energyLevel: number
  ) => {
    // Detect object area (assume object is in center 60% of image)
    const objectX = width * 0.2;
    const objectY = height * 0.2;
    const objectWidth = width * 0.6;
    const objectHeight = height * 0.6;
    const centerX = objectX + objectWidth / 2;
    const centerY = objectY + objectHeight / 2;

    // Create multiple smooth gradient layers for natural smoky diffusion
    ctx.globalCompositeOperation = 'source-over';

    // Layer 1: Outer atmospheric haze - creates the base smoky environment
    const outerHaze = ctx.createRadialGradient(
      centerX, centerY, Math.min(objectWidth, objectHeight) * 0.2,
      centerX, centerY, Math.max(width, height) * 0.9
    );
    outerHaze.addColorStop(0, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.03)`);
    outerHaze.addColorStop(0.3, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.13)`);
    outerHaze.addColorStop(0.6, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.3)`);
    outerHaze.addColorStop(0.8, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.6)`);
    outerHaze.addColorStop(1, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.9)`);
    
    ctx.fillStyle = outerHaze;
    ctx.fillRect(0, 0, width, height);

    // Layer 2: Medium intensity smoke ring - builds up density
    ctx.globalCompositeOperation = 'overlay';
    const mediumSmoke = ctx.createRadialGradient(
      centerX, centerY, Math.min(objectWidth, objectHeight) * 0.3,
      centerX, centerY, Math.max(width, height) * 0.7
    );
    mediumSmoke.addColorStop(0, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0)`);
    mediumSmoke.addColorStop(0.4, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.35)`);
    mediumSmoke.addColorStop(0.7, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.50)`);
    mediumSmoke.addColorStop(1, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.5)`);
    
    ctx.fillStyle = mediumSmoke;
    ctx.fillRect(0, 0, width, height);

    // Layer 3: Close energy field - concentrated around object
    ctx.globalCompositeOperation = 'soft-light';
    const closeField = ctx.createRadialGradient(
      centerX, centerY, Math.min(objectWidth, objectHeight) * 0.35,
      centerX, centerY, Math.min(objectWidth, objectHeight) * 0.8
    );
    closeField.addColorStop(0, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0)`);
    closeField.addColorStop(0.5, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.25)`);
    closeField.addColorStop(0.8, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.18)`);
    closeField.addColorStop(1, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.6)`);
    
    ctx.fillStyle = closeField;
    ctx.fillRect(0, 0, width, height);

    // Layer 4: Concentrated energy around object edges - enhanced for higher energy
    ctx.globalCompositeOperation = 'color-dodge';
    const energyMultiplier = Math.min(1.5, 0.8 + (energyLevel / 10) * 0.7);
    const edgeGlow = ctx.createRadialGradient(
      centerX, centerY, Math.min(objectWidth, objectHeight) * 0.4,
      centerX, centerY, Math.min(objectWidth, objectHeight) * 0.65
    );
    edgeGlow.addColorStop(0, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0)`);
    edgeGlow.addColorStop(0.6, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, ${0.12 * energyMultiplier})`);
    edgeGlow.addColorStop(0.9, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, ${0.08 * energyMultiplier})`);
    edgeGlow.addColorStop(1, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.3)`);
    
    ctx.fillStyle = edgeGlow;
    ctx.fillRect(0, 0, width, height);

    // Layer 5: Subtle atmospheric blend for seamless integration
    ctx.globalCompositeOperation = 'source-over';
    const atmosphericBlend = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(width, height) * 0.8
    );
    atmosphericBlend.addColorStop(0, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.02)`);
    atmosphericBlend.addColorStop(0.5, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.04)`);
    atmosphericBlend.addColorStop(1, `rgba(${auraColor.r}, ${auraColor.g}, ${auraColor.b}, 0.7)`);
    
    ctx.fillStyle = atmosphericBlend;
    ctx.fillRect(0, 0, width, height);

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    // Add "AuraEye" watermark in the center
    addAuraEyeWatermark(ctx, width, height);
  };

  // Function to draw advanced smoke particles with natural flow
  const drawAdvancedObjectSmoke = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: { r: number, g: number, b: number },
    opacity: number,
    seededRandom: () => number
  ) => {
    // Create organic, flowing smoke with multiple layers
    const smokeLayers = [
      { sizeMultiplier: 0.8, opacityMultiplier: 0.5, blur: 8 },
    ];
    
    smokeLayers.forEach(layer => {
      const layerSize = size * layer.sizeMultiplier;
      const layerOpacity = Math.min(0.6, opacity * layer.opacityMultiplier);
      
      if (layer.blur > 0) {
        ctx.filter = `blur(${layer.blur}px)`;
      }
      
      // Create natural smoke gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity})`);
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.7})`);
      gradient.addColorStop(0.8, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, layerSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.filter = 'none';
    });
  };

  // Function to add AuraEye watermark to object analysis
  const addAuraEyeWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Save the current context
    ctx.save();
    
    // Calculate center position
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Set font properties - responsive to image size
    ctx.font = `bold 100px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow/outline for better visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 0;
    ctx.strokeText('AuraEye™', centerX, centerY);
    
    // Add main watermark text in white
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('AuraEye™', centerX, centerY);
    
    // Restore the context
    ctx.restore();
  };

  // Function to draw energy wisps around object
  const drawEnergyWisp = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: { r: number, g: number, b: number },
    opacity: number,
    seededRandom: () => number
  ) => {
    // Create flowing wisp effect
    const wispGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    wispGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    wispGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`);
    wispGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    ctx.fillStyle = wispGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  };



  // Function to get CSS filter for aura color overlay
  const getAuraFilter = (auraColor: string): string => {
    const colorFilters: { [key: string]: string } = {
      'red': 'sepia(100%) saturate(200%) hue-rotate(0deg) brightness(1.1)',
      'blue': 'sepia(100%) saturate(200%) hue-rotate(220deg) brightness(1.1)',
      'green': 'sepia(100%) saturate(200%) hue-rotate(90deg) brightness(1.1)',
      'yellow': 'sepia(100%) saturate(200%) hue-rotate(50deg) brightness(1.2)',
      'purple': 'sepia(100%) saturate(200%) hue-rotate(270deg) brightness(1.1)',
      'orange': 'sepia(100%) saturate(200%) hue-rotate(25deg) brightness(1.2)',
      'pink': 'sepia(100%) saturate(150%) hue-rotate(320deg) brightness(1.2)',
      'violet': 'sepia(100%) saturate(200%) hue-rotate(260deg) brightness(1.1)',
      'indigo': 'sepia(100%) saturate(200%) hue-rotate(240deg) brightness(1.0)',
      'gold': 'sepia(90%) saturate(90%) hue-rotate(10deg) brightness(1.2)',
      'silver': 'grayscale(30%) brightness(1.2) contrast(110%)'
    };
    
    return colorFilters[auraColor.toLowerCase()] || 'sepia(20%) saturate(70%) hue-rotate(150deg) brightness(1.3)';
  };

  // Function to get hex color for aura overlay
  const getAuraColorHex = (auraColor: string): string => {
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00',
      'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FF8C00',
      'pink': '#FFC0CB', 'violet': '#8B00FF', 'indigo': '#4B0082',
      'gold': '#FFD700', 'silver': '#C0C0C0', 'white': '#FFFFFF',
      'black': '#000000',
      'brown': '#8B4513', 'gray': '#808080', 'grey': '#808080'
    };
    return colorMap[auraColor.toLowerCase()] || '#800080';
  };

  // Function to detect faces using facial structure geometry (no color detection)
  const detectFaces = (file: File): Promise<boolean> => {
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
          let eyePatterns = 0;
          let nosePatterns = 0;
          let mouthPatterns = 0;
          let symmetryPatterns = 0;
          let manufacturedPatterns = 0;
          let totalSamples = 0;
          
          // Sample image for facial feature patterns
          const sampleStep = Math.max(20, Math.floor(data.length / 2000));
          
          for (let i = 0; i < data.length - 60; i += sampleStep) {
            const pixels = [];
            for (let j = 0; j < 60; j += 4) {
              if (i + j + 3 < data.length) {
                pixels.push({
                  r: data[i + j],
                  g: data[i + j + 1],
                  b: data[i + j + 2],
                  brightness: data[i + j] + data[i + j + 1] + data[i + j + 2]
                });
              }
            }
            
            if (pixels.length < 10) continue;
            totalSamples++;
            
            // Check for manufactured object patterns (electronics, text, UI)
            let hasSharpEdges = false;
            let hasUniformBlocks = false;
            let hasTextPattern = false;
            
            for (let p = 0; p < pixels.length - 1; p++) {
              const brightnessDiff = Math.abs(pixels[p].brightness - pixels[p + 1].brightness);
              
              // Sharp edges (electronics, text, buttons)
              if (brightnessDiff > 300) {
                hasSharpEdges = true;
              }
              
              // Uniform color blocks (UI elements)
              if (Math.abs(pixels[p].r - pixels[p + 1].r) < 5 &&
                  Math.abs(pixels[p].g - pixels[p + 1].g) < 5 &&
                  Math.abs(pixels[p].b - pixels[p + 1].b) < 5) {
                hasUniformBlocks = true;
              }
              
              // High contrast text patterns
              if ((pixels[p].brightness < 50 && pixels[p + 1].brightness > 250) ||
                  (pixels[p].brightness > 250 && pixels[p + 1].brightness < 50)) {
                hasTextPattern = true;
              }
            }
            
            if (hasSharpEdges || hasUniformBlocks || hasTextPattern) {
              manufacturedPatterns++;
              continue; // Skip facial analysis for manufactured patterns
            }
            
            // Facial structure detection only if no manufactured patterns
            
            // Eye pattern: Dark spots with lighter surroundings
            const darkSpots = pixels.filter(p => p.brightness < 120).length;
            const lightAreas = pixels.filter(p => p.brightness > 150 && p.brightness < 220).length;
            
            if (darkSpots >= 2 && lightAreas >= 4) {
              eyePatterns++;
            }
            
            // Nose pattern: Central elevation with gradual brightness transitions
            const centerIdx = Math.floor(pixels.length / 2);
            const centerBrightness = pixels[centerIdx]?.brightness || 0;
            const edgeBrightness = (pixels[0]?.brightness || 0) + (pixels[pixels.length - 1]?.brightness || 0);
            
            if (centerBrightness > edgeBrightness / 2 + 30 && centerBrightness < edgeBrightness / 2 + 100) {
              nosePatterns++;
            }
            
            // Mouth pattern: Horizontal brightness variation
            let horizontalVariation = 0;
            for (let p = 0; p < pixels.length - 3; p += 3) {
              horizontalVariation += Math.abs(pixels[p].brightness - pixels[p + 3].brightness);
            }
            
            if (horizontalVariation > 200 && horizontalVariation < 800) {
              mouthPatterns++;
            }
            
            // Facial symmetry: Compare left and right halves
            const midPoint = Math.floor(pixels.length / 2);
            const leftHalf = pixels.slice(0, midPoint);
            const rightHalf = pixels.slice(midPoint);
            
            if (leftHalf.length === rightHalf.length) {
              let symmetryScore = 0;
              for (let s = 0; s < leftHalf.length; s++) {
                if (Math.abs(leftHalf[s].brightness - rightHalf[s].brightness) < 80) {
                  symmetryScore++;
                }
              }
              
              if (symmetryScore >= leftHalf.length * 0.6) {
                symmetryPatterns++;
              }
            }
          }
          
          // Calculate ratios
          const eyeRatio = eyePatterns / totalSamples;
          const noseRatio = nosePatterns / totalSamples;
          const mouthRatio = mouthPatterns / totalSamples;
          const symmetryRatio = symmetryPatterns / totalSamples;
          const manufacturedRatio = manufacturedPatterns / totalSamples;
          
          // Client-side detection is now only for logging - server uses OpenAI for accurate detection
          const hasHumanFace = false; // Always allow on client side, server will handle with OpenAI
          
          console.log('Client-side face detection:', {
            eyeRatio: eyeRatio.toFixed(3),
            noseRatio: noseRatio.toFixed(3),
            mouthRatio: mouthRatio.toFixed(3),
            symmetryRatio: symmetryRatio.toFixed(3),
            manufacturedRatio: manufacturedRatio.toFixed(3),
            totalSamples,
            hasHumanFace
          });
          
          resolve(hasHumanFace);
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
    setOriginalImage(null);
    setProcessedImage(null);
    setAnalysisProgress(0);
    setAnalysisStage("Checking image content...");

    try {
      // Check for human faces first
      setAnalysisProgress(10);
      setAnalysisStage("Scanning for human faces...");
      
      const hasFaces = await detectFaces(file);
      
      if (hasFaces) {
        setIsAnalyzing(false);
        toast({
          title: "Error Detected",
          description: "Please Upload another image",
          variant: "destructive",
        });
        return;
      }

      setAnalysisProgress(20);
      setAnalysisStage("Initializing object scanning...");

      // Store original image
      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          
          const increment = Math.random() * 10;
          const newProgress = prev + increment > 95 ? 95 : prev + increment;
          
          // Update the analysis stage based on progress
          if (newProgress > 20 && newProgress <= 40) {
            setAnalysisStage("Identifying object characteristics...");
          } else if (newProgress > 40 && newProgress <= 60) {
            setAnalysisStage("Detecting energy patterns...");
          } else if (newProgress > 60 && newProgress <= 80) {
            setAnalysisStage("Analyzing object aura...");
          } else if (newProgress > 80) {
            setAnalysisStage("Finalizing analysis...");
          }
          
          return newProgress;
        });
      }, 800);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", name || 'Unnamed');

      // Send to API
      const response = await fetch("/api/analyze-object", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "HUMAN_DETECTED") {
          setIsAnalyzing(false);
          setAnalysisProgress(0);
          toast({
            title: "Human Detected", 
            description: errorData.message,
            variant: "destructive"
          });
          return;
        }
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data: ObjectAnalysisResult = await response.json();
      console.log('Object analysis result:', data);
      setResult(data);
      setAnalysisProgress(100);
      setActiveTab("basic");
      
      // Invalidate queries to refresh user's reading history immediately
      queryClient.invalidateQueries({ queryKey: ['/api/object-analyses'] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/badge-progress'] });
      
      // Reset review system for new analysis and set current analysis ID
      setReviewSubmitted(false);
      setRating(0);
      setReviewText("");
      setCurrentAnalysisId(data.id || null);
      
      // Show badges if returned from server
      if (data.newBadges && data.newBadges.length > 0) {
        showBadges(data.newBadges as any);
      } else {
        // Check for new badges as fallback
        await checkBadges();
      }

      // Set processed image immediately with aura overlay effect
      setProcessedImage(imageUrl);

      // Create smokey aura visualization for the object
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          createObjectAuraVisualization(e.target.result as string, data.auraColor, data.energyLevel);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing object:", error);
      
      // Check if it's a human detection error
      if (error instanceof Error && (error.message.includes("Human face detected") || error.message.includes("Error: 400"))) {
        toast({
          title: "Human Face Detected",
          description: "Please use the Aura Analysis section for images containing people, or upload an image of an object only.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: error instanceof Error ? error.message : "An error occurred during analysis",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced color meanings for aura analysis
  const getEnhancedColorMeaning = (color: string): string => {
    const colorMeanings: Record<string, string> = {
      "Purple": "Purple in an object's aura represents profound spiritual transformation, divine wisdom, and connection to higher realms. This color indicates the object carries ancient knowledge, mystical properties, and serves as a bridge between physical and spiritual dimensions. Purple energy suggests the object enhances intuition, meditation practices, and spiritual awakening.",
      "Red": "Red aura energy signifies powerful life force, grounding strength, and physical vitality. Objects with red auras possess intense energy that stimulates action, courage, and survival instincts. This color indicates strong connection to Earth elements and material world manifestation.",
      "Orange": "Orange aura represents creative expression, emotional healing, and personal power. Objects carrying orange energy enhance artistic abilities, emotional balance, and sacred sexuality. This vibration supports creative projects and emotional transformation.",
      "Yellow": "Yellow aura embodies mental clarity, intellectual power, and solar energy. Objects with yellow vibrations enhance learning, memory, communication, and personal confidence. This color indicates connection to solar plexus chakra and mental empowerment.",
      "Green": "Green aura signifies heart healing, natural harmony, and abundance manifestation. Objects with green energy promote emotional healing, nature connection, prosperity, and unconditional love. This vibration supports heart chakra opening and emotional balance.",
      "Blue": "Blue aura represents divine communication, truth expression, and peaceful wisdom. Objects carrying blue energy enhance clear communication, spiritual teaching, and throat chakra activation. This color indicates connection to divine truth and peaceful expression.",
      "Indigo": "Indigo aura embodies psychic abilities, deep intuition, and third eye activation. Objects with indigo energy enhance clairvoyance, spiritual seeing, and intuitive knowledge. This vibration supports mystical experiences and inner knowing.",
      "Pink": "Pink aura signifies unconditional love, emotional healing, and heart chakra opening. Objects with pink energy promote self-love, compassion, and emotional nurturing. This color indicates divine feminine energy and heart healing properties.",
      "White": "White aura represents pure divine energy, spiritual protection, and cosmic consciousness. Objects carrying white energy provide spiritual cleansing, divine connection, and energetic purification. This vibration indicates highest spiritual attunement.",
      "Black": "Black aura signifies deep shadow work required, emotional blockages, and spiritual darkness. Objects with black energy carry heavy negative vibrations, suppressed trauma, and dark spiritual influences that require intensive healing and cleansing.",
      "Gold": "Gold aura embodies divine wisdom, spiritual mastery, and enlightened consciousness. Objects with gold energy enhance spiritual teaching, divine connection, and wisdom transmission. This vibration indicates advanced spiritual development.",
      "Silver": "Silver aura represents lunar energy, psychic sensitivity, and emotional intuition. Objects carrying silver energy enhance psychic abilities, dream work, and emotional clarity. This color indicates connection to lunar cycles and feminine wisdom."
        
    };
    return colorMeanings[color] || `${color} aura embodies unique spiritual frequencies and metaphysical properties. Objects carrying ${color.toLowerCase()} energy provide specialized vibrational healing and consciousness expansion through distinctive color therapy principles.`;
  };

  const getColorPositiveTraits = (color: string): string => {
    const positiveTraits: Record<string, string> = {
      // Red Family
      "Red": "Increases physical vitality, strengthens willpower, enhances survival instincts, promotes courage, grounds excess energy",
      
      // Orange Family  
      
      "Orange": "Stimulates creativity, balances emotions, enhances personal power, supports artistic expression, promotes emotional healing",
      
      // Yellow Family
         "Yellow": "Boosts mental clarity, enhances communication, increases confidence, supports learning, amplifies personal power",
      "Gold": "Enhances wisdom, promotes enlightenment, connects to divine mind, supports teaching, amplifies spiritual power",
      
      // Green Family
      "Green": "Opens heart chakra, promotes healing, attracts abundance, enhances compassion, connects to nature",
      
      // Blue Family
      "Blue": "Enhances communication, promotes truth, brings peace, supports teaching, activates throat chakra",
      
      // Purple Family
      "Purple": "Enhances spiritual awareness, deepens meditation practice, amplifies intuitive abilities, connects to divine guidance, promotes mystical experiences",
      "Indigo": "Amplifies psychic abilities, enhances intuition, supports spiritual seeing, deepens meditation, activates third eye",
      "Violet": "Promotes spiritual transformation, enhances consciousness elevation, supports mystical awakening, brings divine connection, activates soul evolution",
      
      // Pink/Magenta Family
      "Pink": "Promotes self-love, enhances compassion, supports emotional healing, opens heart, brings nurturing energy",
      
      // Metallic Family
      "Silver": "Enhances psychic sensitivity, supports dream work, amplifies intuition, connects to lunar energy, promotes emotional clarity",
      
      // Neutral Family
      "White": "Provides spiritual protection, purifies energy, connects to divine, enhances clarity, promotes peace",
      "Black": "Indicates negative energy buildup, spiritual blockages, shadow aspects requiring healing, emotional darkness, suppressed trauma"
    };
    
    // Return specific color meaning or generate a meaningful default based on the color name
    return positiveTraits[color] || `Enhances ${color.toLowerCase()} energy frequencies, promotes spiritual development through unique vibrational qualities, supports personal transformation and consciousness expansion`;
  };

  const getColorEnergyProperties = (color: string): string => {
    const energyProperties: Record<string, string> = {
      "Purple": "High-frequency spiritual vibration, crown chakra activation, connects to cosmic consciousness, transmutes lower energies, facilitates spiritual awakening",
      "Red": "Root chakra activation, grounding earth energy, physical vitality boost, survival instinct enhancement, material manifestation",
      "Orange": "Sacral chakra activation, creative life force, emotional balance, sexual energy, artistic inspiration",
      "Yellow": "Solar plexus activation, mental energy amplification, confidence building, intellectual power, personal will enhancement",
      "Green": "Heart chakra opening, healing energy transmission, nature connection, abundance attraction, emotional equilibrium",
      "Blue": "Throat chakra activation, communication enhancement, truth vibration, peaceful energy, divine expression",
      "Indigo": "Third eye activation, psychic energy amplification, spiritual sight enhancement, intuitive knowing, mystical connection",
      "Pink": "Heart healing frequency, unconditional love vibration, emotional nurturing, compassion amplification, feminine divine energy",
      "White": "Highest spiritual frequency, divine protection energy, purification vibration, cosmic consciousness connection, spiritual clarity",
      "Black": "Protective energy absorption, grounding earth frequency, shadow integration, mystery exploration, transformative power",
      "Gold": "Divine wisdom frequency, enlightenment energy, spiritual mastery vibration, cosmic intelligence, advanced consciousness",
      "Silver": "Lunar frequency vibration, psychic enhancement energy, emotional intuition, feminine wisdom, dream consciousness"
    };
    return energyProperties[color] || `${color} energy carries unique vibrational frequencies that activate specific spiritual centers and enhance consciousness through distinctive metaphysical properties and energy field interactions.`;
  };

  // Enhanced energy influence functions

  const getChakraInfluence = (color: string): string => {
    const chakraEffects: Record<string, string> = {
      "Purple": "Directly activates the crown chakra (Sahasrara) and soul star chakra, creating a powerful vortex of spiritual energy that connects to cosmic consciousness. This activation facilitates enlightenment experiences, divine downloads, and spiritual awakening processes.",
      "Red": "Powerfully stimulates the root chakra (Muladhara) and earth star chakra, creating strong grounding connections that anchor spiritual energies into physical reality. This activation enhances survival instincts, physical vitality, and material manifestation abilities.",
      "Orange": "Activates the sacral chakra (Svadhishthana) and creative centers, generating passionate life force energy that enhances creativity, sexuality, and personal power. This stimulation supports artistic expression and emotional healing processes.",
      "Yellow": "Energizes the solar plexus chakra (Manipura) and mental body centers, boosting personal power, confidence, and intellectual abilities. This activation enhances decision-making capabilities and mental clarity while strengthening personal will.",
      "Green": "Opens and balances the heart chakra (Anahata) and higher heart center, creating powerful healing energy that promotes love, compassion, and emotional balance. This activation facilitates heart-centered living and unconditional love expression.",
      "Blue": "Activates the throat chakra (Vishuddha) and communication centers, enhancing truth expression, clear communication, and spiritual teaching abilities. This stimulation supports authentic self-expression and divine truth transmission.",
      "Indigo": "Stimulates the third eye chakra (Ajna) and psychic centers, opening channels of intuitive knowing and spiritual sight. This activation enhances clairvoyance, prophetic abilities, and connection to cosmic wisdom.",
      "Pink": "Gently opens the heart chakra and higher heart center with divine feminine energy, promoting unconditional love, emotional healing, and compassion. This activation supports self-love development and heart wound healing.",
      "White": "Activates all chakras simultaneously with pure divine light, creating perfect energetic alignment and spiritual purification. This comprehensive activation facilitates cosmic consciousness and divine union experiences.",
      "Black": "Grounds and protects all chakra centers while facilitating deep shadow work and transformational processes. This protective activation supports spiritual evolution through darkness integration.",
      "Gold": "Illuminates the crown chakra and higher spiritual centers with divine wisdom, facilitating spiritual mastery and enlightenment experiences. This golden activation enhances spiritual teaching abilities and cosmic knowledge transmission.",
      "Silver": "Activates the sacral and third eye chakras with lunar feminine energy, enhancing psychic abilities, emotional intuition, and dream consciousness. This lunar activation supports feminine wisdom and psychic development."
    };
    return chakraEffects[color] || `${color} energy activates specific chakra centers through resonant vibrational frequencies, creating targeted energy vortexes that enhance spiritual development and consciousness expansion through unique color therapy principles.`;
  };


  const getSpiritualInfluence = (color: string): string => {
    const spiritualEffects: Record<string, string> = {
      "Purple": "Accelerates spiritual awakening and facilitates direct communication with higher dimensional beings, spirit guides, and ascended masters. Enhances meditation practices, mystical experiences, and connection to divine wisdom while opening portals to cosmic consciousness.",
      "Red": "Grounds spiritual energies into physical reality and enhances manifestation of spiritual goals in material world. Supports earthly spiritual service, sacred activism, and integration of spiritual wisdom into daily life while maintaining strong connection to Earth energies.",
      "Orange": "Enhances spiritual creativity and sacred sexuality while promoting emotional healing on spiritual levels. Supports tantric practices, creative spiritual expression, and healing of spiritual wounds related to personal power and creative expression.",
      "Yellow": "Illuminates spiritual understanding and enhances spiritual communication abilities. Supports spiritual teaching, wisdom sharing, and mental clarity in spiritual studies while connecting to solar spiritual consciousness and divine illumination.",
      "Green": "Facilitates spiritual healing and connection to nature's wisdom while promoting heart-centered spirituality. Supports healing work, environmental spiritual practices, and abundance consciousness while connecting to Earth's spiritual energies.",
      "Blue": "Enhances spiritual communication and connection to divine truth while promoting peaceful spiritual practices. Supports spiritual teaching, truthful spiritual expression, and connection to divine wisdom while facilitating clear spiritual communication.",
      "Indigo": "Opens psychic spiritual abilities and facilitates deep spiritual sight and knowing. Supports mystical experiences, prophetic spiritual abilities, and connection to cosmic spiritual wisdom while enhancing spiritual intuition and inner knowing.",
      "Pink": "Promotes unconditional spiritual love and healing of spiritual heart wounds. Supports compassionate spiritual service, self-love spiritual practices, and healing of spiritual relationship wounds while connecting to divine feminine spiritual energy.",
      "White": "Facilitates direct connection to divine source and cosmic consciousness while promoting spiritual purification. Supports all spiritual practices, divine union experiences, and connection to highest spiritual realms while clearing spiritual blockages.",
      "Black": "Indicates spiritual darkness, blocked spiritual development, and negative spiritual influences. Creates spiritual stagnation, disconnection from divine light, and requires intensive spiritual cleansing and healing work.",
      "Gold": "Enhances spiritual mastery and connection to divine wisdom while promoting enlightenment experiences. Supports advanced spiritual practices, spiritual teaching abilities, and transmission of cosmic spiritual knowledge while connecting to divine intelligence.",
      "Silver": "Enhances psychic spiritual abilities and connection to lunar spiritual wisdom. Supports dream spiritual work, psychic spiritual development, and feminine spiritual practices while connecting to lunar spiritual consciousness."
    };
    return spiritualEffects[color] || `${color} energy facilitates unique spiritual experiences through specific vibrational frequencies, opening portals to higher consciousness and enhancing spiritual development through distinctive metaphysical pathways and divine connections.`;
  };

  const getOptimalPlacement = (color: string): string[] => {
    const placementTips: Record<string, string[]> = {
      "Purple": [
        
        "Position near crown chakra level (head height) for maximum spiritual activation",
        "Combine with amethyst or clear quartz to amplify spiritual energy"
      ],
      "Red": [
        "Use in protection rituals or spaces requiring energetic boundaries",
        "Combine with black tourmaline or hematite for enhanced grounding"
      ],
      "Orange": [
        "Position at sacral chakra level (lower abdomen height) for creative activation",
        "Combine with carnelian or orange calcite for amplified creative energy"
      ],
      "Yellow": [
        "Place at solar plexus level for personal power activation",
        "Combine with citrine or golden topaz for enhanced confidence"
      ],
      "Green": [
        "Position at heart level for maximum heart chakra activation",
        "Combine with rose quartz or green aventurine for enhanced healing"
      ],
      "Blue": [
        "Place at throat chakra level for enhanced truthful expression",
        "Combine with blue lace agate or sodalite for enhanced communication"
      ],
      "Indigo": [
        "Position at third eye level for psychic activation",
        "Combine with indigo agate or lapis lazuli for enhanced intuition"
      ],
      "Gold": [
        "Position at heart chakra level for enhanced divine connection",
        "Combine with golden citrine or yellow sapphire for amplified abundance energy"
      ]
    };
    return placementTips[color] || [
      `Place ${color.toLowerCase()} objects in meditation spaces for enhanced spiritual connection`
    ];
  };

  // Helper to get CSS color class from aura color
  // Get accurate color codes for proper color display
  const getAccurateColorCode = (color: string): string => {
    const colorMap: Record<string, string> = {
      "Red": "#FF0000",
      "Orange": "#FF8C00", 
      "Yellow": "#FFFF00",
      "Green": "#00FF00",
      "Blue": "#0000FF",
      "Indigo": "#4B0082",
      "Violet": "#8B00FF",
      "Purple": "#800080",
      "Pink": "#FFC0CB",
      "White": "#FFFFFF",
      "Black": "#000000",
      "Gold": "#FFD700",
      "Silver": "#C0C0C0",
      "Brown": "#8B4513",
      "Gray": "#808080",
      "Grey": "#808080"
    };
    return colorMap[color] || "#808080";
  };

  function getColorClass(color: string): string {
        const colorMap: Record<string, string> = {
            "Red": "bg-red-500",
            "Orange": "bg-orange-500",
            "Yellow": "bg-yellow-400",
            "Green": "bg-green-500",
            "Blue": "bg-blue-500",
            "Indigo": "bg-indigo-500",
            "Purple": "bg-purple-500",
            "Pink": "bg-pink-500",
            "Brown": "bg-amber-700",
            "White": "bg-gray-100",
            "Black": "bg-gray-900",
            "Silver": "bg-gray-300",
            "Gold": "bg-yellow-600",
            "Violet": "bg-violet-500",
            "Gray": "bg-gray-500"
        };

        // Default fallback color or try to match parts of the color name
        if (!colorMap[color]) {
            const colorKeys = Object.keys(colorMap);
            const matchedColor = colorKeys.find(key => color.toLowerCase().includes(key.toLowerCase())
            );
            return matchedColor ? colorMap[matchedColor] : "bg-gray-400";
        }

        return colorMap[color];
    }

  // Check if user is a healer
  const isHealer = user?.userType === 'healer' || false;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar />
      <div className="bg-gradient-to-r from-primary-dark to-dark text-white py-8 align-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-heading font-bold"></h1>
          <p className="opacity-80 text-center">Discover the energy and spiritual significance of objects</p>
        </div>
      </div>
      <main className="flex-grow">
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Object Energy Analysis</h1>
                <p className="text-secondary max-w-2xl mx-auto">
                  Upload a photo of any object to discover its aura, energy patterns, and spiritual significance.
                </p>
              </div>
              
              <div className="mb-12 py-10">
                <Card className="overflow-hidden border-none shadow-md">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <p className="text-center text-white">
                        Every object carries its own unique energy signature. Upload a photo of an object 
                        to discover its aura color, energy qualities, and spiritual significance.
                      </p>
                      
                      <div className="flex flex-col items-center justify-center text-black font-medium">
                        {showNameInput ? (
                          <NameInput
                            onNameSubmit={handleNameSubmit}
                            title="Object Analysis"
                            description="Enter your name to begin analyzing your object's energy"
                            placeholder="Enter your name"
                          />
                        ) : (
                          <ImageUpload 
                            onImageSelect={handleImageSelect}
                            isLoading={isAnalyzing}
                          />
                        )}
                        
                        {isAnalyzing && (
                          <div className="mt-4 text-center w-full max-w-md">
                            <p className="text-sm text-muted-foreground mb-2">{analysisStage}</p>
                            <Progress value={analysisProgress} className="h-2 mb-1" />
                            <p className="text-xs text-muted-foreground">{Math.round(analysisProgress)}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {result && (
                <div className="space-y-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Complete Analysis</h2>
                        <Button
                          onClick={resetForNewAnalysis}
                          variant="outline"
                          className="ml-4"
                        >
                          New Analysis
                        </Button>
                      </div>
                      
                      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-1 mb-6">
                          <TabsTrigger value="basic">Complete Analysis</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic">
                          <div className="space-y-6">
                            {/* Image Comparison Section */}
                            {originalImage && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                  <ImageIcon className="h-5 w-5 text-purple-200" />
                                  Aura Visualization
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Original Image */}
                                  <div className="space-y-3">
                                    <div className="text-center">
                                      <h5 className="text-sm font-medium text-white mb-2">Original Image</h5>
                                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img 
                                          src={originalImage} 
                                          alt="Original object"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Processed Image with Smokey Aura Effect */}
                                  <div className="space-y-3">
                                    <div className="text-center">
                                      <h5 className="text-sm font-medium text-white mb-2 flex items-center justify-center gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-200" />
                                        With Aura Visualisation
                                      </h5>
                                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                                        {enhancedAuraImage ? (
                                          <img 
                                            src={enhancedAuraImage} 
                                            alt="Object with smokey aura effect"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : processedImage ? (
                                          <div className="relative">
                                            <img 
                                              src={processedImage} 
                                              alt="Object with aura gradient"
                                              className="w-full h-full object-cover"
                                              style={{ 
                                                filter: getAuraFilter(result.auraColor),
                                                transition: 'filter 0.5s ease-in-out'
                                              }}
                                            />
                                            <div 
                                              className="absolute inset-0 pointer-events-none"
                                              style={{
                                                background: `radial-gradient(circle, ${getAuraColorHex(result.auraColor)}40 0%, transparent 30%)`,
                                                opacity: 0.5
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full h-64 flex items-center justify-center">
                                            <div className="text-center">
                                              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                                              <p className="text-sm text-gray-500">Creating smokey aura visualization...</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      {enhancedAuraImage && (
                                        <p className="text-xs text-white mt-2">
                                          Aura color: {result.auraColor}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Color Legend */}
                                <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                                  <span className="text-sm text-gray-600">Aura Color:</span>
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className="inline-block w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: getAccurateColorCode(result.auraColor) }}
                                    ></span>
                                    <span className="font-medium text-gray-800">{result.auraColor}</span>
                                  </div>
                                </div>
                              </div>
                            )}


                            
                            <div>
                              <h4 className="text-sm text-white mb-1">Aura Color</h4>
                              <div className="flex items-center">
                                <span 
                                  className="inline-block w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: getAccurateColorCode(result.auraColor) }}
                                ></span>
                                <span className="font-medium text-white">{result.auraColor}</span>
                              </div>
                              <p className="text-sm mt-2 text-white">{result.auraDescription}</p>

                              
                             
                              {/* Enhanced Color Meaning Section */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Aura Color Spiritual Meaning</h5>
                                <p className="text-xs text-gray-600 mb-2">{getEnhancedColorMeaning(result.auraColor)}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                  <div className="p-2 bg-green-50 rounded border border-green-200">
                                    <div className="text-xs font-medium text-green-800 mb-1">✓ Positive Energy</div>
                                    <div className="text-xs text-green-700">{getColorPositiveTraits(result.auraColor)}</div>
                                  </div>
                                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="text-xs font-medium text-blue-800 mb-1">⚡ Energy Properties</div>
                                    <div className="text-xs text-blue-700">{getColorEnergyProperties(result.auraColor)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm text-white mb-1">Energy Level</h4>
                              <Progress value={result.energyLevel * 10} className="h-2" />
                              <div className="flex justify-between text-xs text-white mt-1">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                              </div>
                            </div>
                            
                            {/* Energy Qualities Section */}
                            <div>
                              <h4 className="text-sm text-white mb-2">Energy Qualities</h4>
                              <div className="flex flex-wrap gap-2 text-white">
                                {result.energyQualities.map((quality, index) => (
                                  <Badge key={index} variant="secondary" className="rounded-full">
                                    {quality}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {/* Energy Profile Section */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Energy Profile</h4>
                              <p className="text-sm text-gray-600">{result.detailedAnalysis}</p>
                            </div>
                            
                            {/* Enhanced Energy Influence Section */}
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-100">
                              <h4 className="font-medium text-lg mb-4 flex items-center">
                                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                Detailed Energy Influence Analysis
                              </h4>
                              
                              <div className="space-y-4">
                                <div>
                                  
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Chakra System Activation</h5>
                                  <p className="text-sm text-gray-700 mb-2">{getChakraInfluence(result.auraColor)}</p>
                                </div>
                                
                                <div>
                                 
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Spiritual Development Support</h5>
                                  <p className="text-sm text-gray-700 mb-2">{getSpiritualInfluence(result.auraColor)}</p>
                                </div>
                                
                                <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Optimal Placement & Usage</h5>
                                  <ul className="text-sm list-disc list-inside space-y-1 text-gray-700">
                                    {getOptimalPlacement(result.auraColor).map((tip, index) => (
                                      <li key={index}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Spiritual Significance Section */}
                            {result.spiritualSignificance && (
                              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
                                <h4 className="font-medium text-sm mb-2">Spiritual Significance</h4>
                                <p className="text-sm text-gray-700">
                                  {result.spiritualSignificance}
                                </p>
                              </div>
                            )}
                            

                          </div>
                        </TabsContent>
                        


                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* 5-Star Review System */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mt-8">
                    {reviewSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-green-800 mb-2">Review Submitted!</h4>
                        <p className="text-green-700">Thank you for your feedback. Your review helps us improve our object analysis experience.</p>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-lg mb-4 flex items-center text-black">
                          <Star className="w-5 h-5 mr-2 text-black" />
                          Rate Your Object Analysis Experience
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-700 mb-3">How accurate and helpful was your object reading?</p>
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
                            <label className="text-sm font-medium text-black mb-2 block">
                              Share your thoughts (optional)
                            </label>
                            <Textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Tell us about your experience with the object analysis..."
                              className="resize-none"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={submitReview}
                              disabled={rating === 0 || isSubmittingReview}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
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
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                    <h3 className="font-medium text-lg mb-2 text-black">Discover More Object Secrets</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload another photo to explore different objects and their sacred chakra frequencies. 
                      Each object channels divine consciousness through specific color vibrations and spiritual activation.
                    </p>
                    <div className="flex justify-center">
                      <Button variant="secondary" onClick={() => setResult(null)}>
                        Analyze Another Object
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      
      <MobileNavigation />
    </div>
  );
}