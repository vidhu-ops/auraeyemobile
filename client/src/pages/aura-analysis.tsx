import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ImageUpload from "@/components/forms/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PremiumFeature } from "@/components/premium/premium-feature";
import { analyzeAuraImage, AuraAnalysisResult } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Sparkles } from "lucide-react";

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
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | null>(null);
  
  // Numerology states
  const [numerologyName, setNumerologyName] = useState("");
  const [numerologyBirthDate, setNumerologyBirthDate] = useState("");
  const [numerologyResult, setNumerologyResult] = useState<any>(null);
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  
  const handlePremiumUpgrade = () => {
    showPremiumModal("aura");
  };
  
  // Function to generate aura visualization with colored clouds
  const generateAuraVisualization = (originalImageBase64: string | undefined, auraData: AuraAnalysisResult) => {
    if (!originalImageBase64) return;
    
    // Create a new image element to work with
    const img = new Image();
    img.src = originalImageBase64;
    
    img.onload = () => {
      // Create a canvas to draw on
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Get dominant and secondary colors
      const dominantColor = auraData.dominantColor.toLowerCase();
      const secondaryColor = auraData.secondaryColor?.toLowerCase() || dominantColor;
      
      // Draw aura clouds
      drawAuraClouds(ctx, img.width, img.height, dominantColor, secondaryColor, auraData.energyLevel);
      
      // Convert back to base64
      const enhancedImageBase64 = canvas.toDataURL('image/jpeg');
      setEnhancedAuraImage(enhancedImageBase64);
    };
  };
  
  // Function to draw aura cloud effects
  const drawAuraClouds = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dominantColor: string, 
    secondaryColor: string,
    energyLevel: number
  ) => {
    // Map color names to rgba values
    const colorMap: Record<string, string> = {
      red: 'rgba(255, 0, 0, 0.3)',
      orange: 'rgba(255, 165, 0, 0.3)',
      yellow: 'rgba(255, 255, 0, 0.3)',
      green: 'rgba(0, 128, 0, 0.3)',
      blue: 'rgba(0, 0, 255, 0.3)',
      indigo: 'rgba(75, 0, 130, 0.3)',
      violet: 'rgba(148, 0, 211, 0.3)',
      purple: 'rgba(128, 0, 128, 0.3)',
      pink: 'rgba(255, 182, 193, 0.3)',
      white: 'rgba(255, 255, 255, 0.3)',
      gold: 'rgba(255, 215, 0, 0.3)',
      silver: 'rgba(192, 192, 192, 0.3)',
      black: 'rgba(0, 0, 0, 0.3)',
    };
    
    // Get RGBA values for dominant and secondary colors
    const dominantRgba = colorMap[dominantColor] || 'rgba(255, 255, 255, 0.3)';
    const secondaryRgba = colorMap[secondaryColor] || 'rgba(128, 128, 255, 0.3)';
    
    // Create a radial gradient for the aura effect
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Intensity of the aura based on energy level (1-10)
    const intensityFactor = energyLevel / 10;
    const auraSize = Math.max(width, height) * (0.2 + intensityFactor * 0.3);
    
    // Draw multiple layers of aura clouds with different opacities and sizes
    for (let i = 0; i < 5; i++) {
      const radius = auraSize * (0.6 + i * 0.1);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.2,
        centerX, centerY, radius
      );
      
      // Add color stops with varying opacity
      const opacity = 0.15 - i * 0.02;
      gradient.addColorStop(0, dominantRgba.replace('0.3', `${opacity + 0.1}`));
      gradient.addColorStop(0.4, dominantRgba.replace('0.3', `${opacity}`));
      gradient.addColorStop(0.6, secondaryRgba.replace('0.3', `${opacity}`));
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      // Apply the gradient
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'screen';
      
      // Draw cloud-like shapes
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const cloudX = centerX + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
        const cloudY = centerY + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
        const cloudRadius = radius * 0.3 * (0.7 + Math.random() * 0.6);
        
        ctx.moveTo(cloudX + cloudRadius, cloudY);
        ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
      }
      
      ctx.fill();
    }
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  // Function to calculate numerology based on name and birth date
  const calculateNumerology = async (name: string, birthDate: string) => {
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
      const response = await fetch('/api/calculate-numerology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, birthDate })
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate numerology profile');
      }
      
      const data = await response.json();
      setNumerologyResult(data);
      
      if (activeTab !== "numerology") {
        setActiveTab("numerology");
      }
      
      toast({
        title: "Numerology Calculated",
        description: `Your Life Path Number is ${data.lifePathNumber}`,
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
  
  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);
    setAnalysisStage("Initializing aura scanning...");

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          
          // Update stage text based on progress
          if (prev < 20) {
            setAnalysisStage("Preparing image for analysis...");
          } else if (prev < 40) {
            setAnalysisStage("Detecting energy patterns in your aura...");
          } else if (prev < 60) {
            setAnalysisStage("Analyzing color vibrations and frequencies...");
          } else if (prev < 80) {
            setAnalysisStage("Connecting with your chakra energy centers...");
          } else {
            setAnalysisStage("Finalizing your personalized aura reading...");
          }
          
          return prev + Math.random() * 5 + 1;
        });
      }, 800);

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
            // Call API to analyze the image
            const analysisResult = await analyzeAuraImage(base64data);
            setResult(analysisResult);
            
            // Generate enhanced aura image with aura clouds
            if (base64String) {
              setAnalysisStage("Creating your aura visualization...");
              generateAuraVisualization(base64String, analysisResult);
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
            }, 800);
          } catch (error) {
            console.error("Error in aura analysis:", error);
            // Use fallback analysis if API has issues
            setAnalysisProgress(100);
            setAnalysisStage("Analysis complete!");
            clearInterval(progressInterval);
            setTimeout(() => { setIsAnalyzing(false); }, 800);
          }
        }
      };
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your aura. Please try again.",
        variant: "destructive",
      });
      console.error("Error analyzing image:", error);
      setIsAnalyzing(false);
    }
  };

  // Helper function to get color class based on aura color
  const getColorClass = (color: string) => {
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
      silver: "bg-gray-300"
    };

    const lowerColor = color.toLowerCase();
    return colorMap[lowerColor] || "bg-gray-400";
  };

  // Helper function to get text color class based on aura color
  const getTextColorClass = (color: string) => {
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
      silver: "text-gray-300"
    };

    const lowerColor = color.toLowerCase();
    return colorMap[lowerColor] || "text-gray-400";
  };



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
        turquoise: 65,
        magenta: 78,
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
        "Purple": "Yellow",
        "Pink": "Turquoise",
        "Gold": "Violet",
        "Silver": "Magenta",
        "White": "Black",
        "Black": "White",
        "Turquoise": "Pink",
        "Magenta": "Silver",
        "Brown": "Blue"
      };
      
      return colorMap[color] || "White";
    },
    
    // Get energy cycle pattern
    getEnergyCycle: (energyLevel: number, color: string): string => {
      const highEnergy = energyLevel >= 7;
      const mediumEnergy = energyLevel >= 4 && energyLevel < 7;
      
      const colorLower = color.toLowerCase();
      
      if (["red", "orange", "yellow"].includes(colorLower)) {
        return highEnergy ? "rapid and intense" : mediumEnergy ? "steady and consistent" : "slow-building";
      } else if (["green", "blue", "turquoise"].includes(colorLower)) {
        return highEnergy ? "flowing and wave-like" : mediumEnergy ? "rhythmic and balanced" : "gentle and steady";
      } else if (["purple", "violet", "indigo"].includes(colorLower)) {
        return highEnergy ? "pulsating and dynamic" : mediumEnergy ? "cyclical and intuitive" : "subtle and intermittent";
      } else {
        return mediumEnergy ? "moderate and balanced" : "variable";
      }
    },
    
    // Get energy level text
    getEnergyLevelText: (level: number): string => {
      if (level >= 8) return "Extremely High";
      if (level >= 6) return "Very High";
      if (level >= 4) return "Above Average";
      if (level >= 2) return "Moderate";
      return "Reserved";
    },
    
    // Get energy advice
    getEnergyAdvice: (level: number, color: string): string => {
      const colorLower = color.toLowerCase();
      
      if (level >= 8) {
        return ` Your energy appears intensely vibrant in your aura photograph. Consider grounding practices to balance this powerful energy.`;
      } else if (level >= 6) {
        if (["purple", "blue", "indigo"].includes(colorLower)) {
          return ` This high spiritual energy visible in your aura field suggests focusing on channeling your intuitive gifts.`;
        } else if (["red", "orange"].includes(colorLower)) {
          return ` The high physical/emotional energy visible in your aura suggests finding healthy outlets for expression.`;
        } else {
          return ` Your aura shows vibrant energy flow that could benefit from regular creative or spiritual practices.`;
        }
      } else if (level >= 3) {
        return ` This balanced energy state visible in your aura photograph indicates a good equilibrium of giving and receiving energy.`;
      } else {
        return ` The calmer energy visible in your aura field suggests a period of energy conservation. Gentle energy practices may be beneficial.`;
      }
    }
  };

  // Helper functions for the detailed analysis tab
  const getAuraLayerAnalysis = (layer: string, color: string): string => {
    const layerAnalysis: Record<string, Record<string, string>> = {
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
        "Pink": "Your etheric layer resonates with unconditional love and compassion. Physical health is enhanced through heart-centered practices."
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
        "Pink": "Your emotional layer is suffused with love and compassion. Your emotional responses are heart-centered and nurturing."
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
        "Pink": "Your mental layer processes thoughts through the lens of compassion. Your thinking is heart-centered and loving."
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
  
  const getTraitExplanation = (trait: string, color: string): string => {
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
      "Expansive": "Your energy field extends widely, connecting with collective consciousness and universal mind."
    };
    
    return traitExplanations[trait] || "This trait represents a unique expression of your spiritual signature.";
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
                {/* Upload section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="font-heading font-semibold text-xl mb-4">Upload Your Photo</h2>
                    <ImageUpload onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
                  </div>
                  
                  <div>
                    {originalImage && (
                      <div className="mb-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Original Image</h3>
                          <img 
                            src={originalImage} 
                            alt="Original upload" 
                            className="w-full rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    )}
                    {result?.processedImage && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Your Aura Visualization</h3>
                        <div className="relative">
                          <img 
                            src={result.processedImage} 
                            alt="Aura visualization" 
                            className="w-full rounded-lg shadow-lg"
                          />
                          <div 
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: `radial-gradient(circle at center, ${result.dominantColor.toLowerCase()}40 0%, transparent 70%)`,
                              mixBlendMode: 'overlay'
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          AI-enhanced visualization with {result.dominantColor.toLowerCase()} aura energy
                        </p>
                      </div>
                    )}
              <div className="h-full p-4 bg-white/70 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-800 mb-2">Tips for the best aura reading:</h3>
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
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Results section - full width */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-semibold text-xl">Your Aura Reading</h2>
                    
                    {result && !isAnalyzing && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-sm"
                          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`My aura today is ${result.dominantColor}! Check out my spiritual energy reading from Aurfy.`)}`, '_blank')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                          </svg>
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-sm"
                          onClick={() => window.open(`https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428.247-.67.636-1.276 1.153-1.772a4.91 4.91 0 011.772-1.153c.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.669.01 2.986.058 4.04.045.976.207 1.504.344 1.857.181.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.669 0 2.986-.01 4.04-.058.976-.045 1.504-.207 1.857-.344.466-.181.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.04 0-2.669-.01-2.986-.058-4.04-.045-.976-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15c-.35-.35-.683-.567-1.15-.748-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.469a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>
                          </svg>
                          Share
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isAnalyzing ? (
                    <Card className="h-96 flex flex-col items-center justify-center">
                      <div className="text-center w-full max-w-md px-6">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Analyzing your aura energy...</p>
                        
                        <div className="space-y-6 w-full">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Scanning energy field</span>
                              <span className="text-primary">{Math.round(analysisProgress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
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
                      <CardContent className="p-6">
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-5 mb-6">
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                            <TabsTrigger value="chakras">Chakras</TabsTrigger>
                            <TabsTrigger value="guidance">Guidance</TabsTrigger>
                            <TabsTrigger value="numerology" className="relative">
                              Numerology
                              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 items-center justify-center">
                                  <span className="text-[10px] text-white font-bold">9</span>
                                </span>
                              </span>
                            </TabsTrigger>
                            <TabsTrigger value="detailed" className="relative">
                              Detailed
                              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center">
                                  <Crown className="h-2 w-2 text-white" />
                                </span>
                              </span>
                            </TabsTrigger>
                          </TabsList>
                          
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
                                      onClick={() => calculateNumerology(numerologyName, numerologyBirthDate)}
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
                          
                          <TabsContent value="analysis">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">Your Aura Photo Analysis</h3>
                                  <p className="text-sm text-gray-500">Analysis of the visible energy fields in your specialized aura photograph</p>
                                </div>
                                <div className="flex gap-2">
                                  <span 
                                    className="inline-block w-6 h-6 rounded-full border border-gray-200" 
                                    style={{ 
                                      backgroundColor: result.dominantColor.toLowerCase(),
                                      boxShadow: `0 0 8px 1px ${result.dominantColor.toLowerCase()}80`
                                    }}
                                  ></span>
                                  {result.secondaryColor && (
                                    <span 
                                      className="inline-block w-6 h-6 rounded-full border border-gray-200" 
                                      style={{ 
                                        backgroundColor: result.secondaryColor.toLowerCase(),
                                        boxShadow: `0 0 8px 1px ${result.secondaryColor.toLowerCase()}80`
                                      }}
                                    ></span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Aura visualization */}
                              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                  <div className="relative w-48 h-48">
                                    {/* Aura visualization with actual colors detected */}
                                    <div 
                                      className="absolute inset-0 rounded-full animate-pulse" 
                                      style={{
                                        background: `radial-gradient(circle at center, 
                                          ${result.dominantColor.toLowerCase()} 30%, 
                                          ${result.secondaryColor?.toLowerCase() || 'transparent'} 70%)`,
                                        boxShadow: `0 0 30px 10px ${result.dominantColor.toLowerCase()}80`,
                                        opacity: 0.7
                                      }}
                                    ></div>
                                    <div 
                                      className="absolute inset-8 rounded-full" 
                                      style={{
                                        background: `radial-gradient(circle at center, 
                                          ${result.dominantColor.toLowerCase()}99 40%, 
                                          ${result.secondaryColor?.toLowerCase() || 'transparent'}99 80%)`,
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
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                          <div 
                                            className="w-10 h-10 rounded-full flex-shrink-0" 
                                            style={{ 
                                              backgroundColor: result.dominantColor.toLowerCase(),
                                              boxShadow: `0 0 10px 2px ${result.dominantColor.toLowerCase()}60`
                                            }}
                                          ></div>
                                          <div>
                                            <div className="text-xs text-gray-500">Primary Aura</div>
                                            <div className="text-base font-bold">{result.dominantColor}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {result.secondaryColor && (
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                          <div className="flex items-center gap-3">
                                            <div 
                                              className="w-10 h-10 rounded-full flex-shrink-0" 
                                              style={{ 
                                                backgroundColor: result.secondaryColor.toLowerCase(),
                                                boxShadow: `0 0 10px 2px ${result.secondaryColor.toLowerCase()}60`
                                              }}
                                            ></div>
                                            <div>
                                              <div className="text-xs text-gray-500">Secondary Aura</div>
                                              <div className="text-base font-bold">{result.secondaryColor}</div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">Energy Level</h4>
                                <Progress value={result.energyLevel * 20} className="h-2" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>Low</span>
                                  <span>Medium</span>
                                  <span>High</span>
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-3 text-center border border-amber-200">
                                    <div className="text-amber-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Vitality</h5>
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
                                    <h5 className="font-medium text-sm">Balance</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor(result.chakraActivity.heart / 2) ? 'bg-purple-500' : 'bg-purple-200'}`}></span>
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
                                    <h5 className="font-medium text-sm">Resilience</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor(result.chakraActivity.root / 2) ? 'bg-blue-500' : 'bg-blue-200'}`}></span>
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
                                    <h5 className="font-medium text-sm">Harmony</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.ceil(result.chakraActivity.heart / 2) ? 'bg-green-500' : 'bg-green-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="chakras">
                            <div className="space-y-4">
                              <h3 className="font-medium">Chakra Activity</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Crown Chakra</span>
                                    <span className="text-purple-600">{result.chakraActivity.crown * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.crown * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(139, 92, 246, 0.2)" }} />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Third Eye Chakra</span>
                                    <span className="text-indigo-600">{result.chakraActivity.thirdEye * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.thirdEye * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(79, 70, 229, 0.2)" }} />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Throat Chakra</span>
                                    <span className="text-blue-600">{result.chakraActivity.throat * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.throat * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(59, 130, 246, 0.2)" }} />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Heart Chakra</span>
                                    <span className="text-green-600">{result.chakraActivity.heart * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.heart * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(34, 197, 94, 0.2)" }} />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Solar Plexus Chakra</span>
                                    <span className="text-yellow-600">{result.chakraActivity.solarPlexus * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.solarPlexus * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(234, 179, 8, 0.2)" }} />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Sacral Chakra</span>
                                    <span className="text-orange-600">{result.chakraActivity.sacral * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.sacral * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(249, 115, 22, 0.2)" }} />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Root Chakra</span>
                                    <span className="text-red-600">{result.chakraActivity.root * 10}%</span>
                                  </div>
                                  <Progress value={result.chakraActivity.root * 10} className="h-2 bg-gray-200" 
                                    style={{ backgroundColor: "rgb(239, 68, 68, 0.2)" }} />
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="guidance">
                            <div>
                              <h3 className="font-medium mb-3">Spiritual Guidance</h3>
                              <p className="text-gray-700 whitespace-pre-line">{result.spiritualGuidance}</p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="detailed">
                            <div>
                              <div className="mb-6 relative">
                                <div className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-300 z-10">
                                  Advanced Feature
                                </div>
                                <h3 className="font-medium text-lg mb-4 text-primary">Advanced Aura Field Analysis</h3>
                                
                                {/* Premium Aura Visualization */}
                                <div className="relative h-56 mb-6 overflow-hidden rounded-lg">
                                  {/* Background gradient animation */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 z-10"></div>
                                  <div 
                                    className="absolute inset-0 animate-pulse-slow" 
                                    style={{
                                      background: `radial-gradient(ellipse at center, 
                                        ${result.dominantColor.toLowerCase()}99 20%, 
                                        ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}70 60%, 
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
                                            ${result.dominantColor.toLowerCase()}99 0%, 
                                            ${result.dominantColor.toLowerCase()}20 70%, 
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
                                            ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}99 0%, 
                                            ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}30 80%, 
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
                                            ${result.dominantColor.toLowerCase()}90 0%, 
                                            ${result.dominantColor.toLowerCase()}40 70%, 
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
                                            ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}70 70%, 
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
                                  <p className="text-gray-700 whitespace-pre-line mb-5">{result.detailedAnalysis}</p>
                                  
                                  {/* Comprehensive Aura Color Spectrum */}
                                  <div className="mb-6">
                                    <h4 className="font-medium text-sm text-secondary mb-3">Complete Aura Color Spectrum</h4>
                                    <div className="relative h-14 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-violet-600 rounded-md mb-2 overflow-hidden">
                                      {/* Frequency markers */}
                                      <div className="absolute inset-0 flex justify-between px-1">
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                      </div>
                                      
                                      {/* Primary and secondary colors */}
                                      {auraHelpers.getColorPosition(result.dominantColor) !== null && (
                                        <div 
                                          className="absolute top-0 bottom-0 w-6 border-2 border-white rounded-sm" 
                                          style={{ 
                                            left: `${auraHelpers.getColorPosition(result.dominantColor)}%`,
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)' 
                                          }}
                                        ></div>
                                      )}
                                      
                                      {result.secondaryColor && auraHelpers.getColorPosition(result.secondaryColor) !== null && (
                                        <div 
                                          className="absolute top-0 bottom-0 w-6 border-2 border-white rounded-sm opacity-70" 
                                          style={{ 
                                            left: `${auraHelpers.getColorPosition(result.secondaryColor)}%`,
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)' 
                                          }}
                                        ></div>
                                      )}
                                      
                                      {/* Additional aura colors from the spectrum (if available) */}
                                      {result.auraColorSpectrum && result.auraColorSpectrum.slice(2).map((color, index) => 
                                        auraHelpers.getColorPosition(color) !== null && (
                                          <div 
                                            key={`spectrum-${index}`}
                                            className="absolute top-0 bottom-0 w-4 border border-white rounded-sm opacity-40" 
                                            style={{ 
                                              left: `${auraHelpers.getColorPosition(color)}%`,
                                              transform: 'translateX(-50%)',
                                              boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)' 
                                            }}
                                          ></div>
                                        )
                                      )}
                                    </div>
                                    
                                    {/* Frequency labels */}
                                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                                      <span>Physical (Lower Hz)</span>
                                      <span>Emotional</span>
                                      <span>Mental</span>
                                      <span>Spiritual (Higher Hz)</span>
                                    </div>
                                    
                                    {/* Aura color spectrum display */}
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-2">Complete Aura Color Profile</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                        {/* Always show primary color */}
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                          <div 
                                            className="w-8 h-8 rounded-full flex-shrink-0" 
                                            style={{ 
                                              backgroundColor: result.dominantColor.toLowerCase(),
                                              boxShadow: `0 0 10px ${result.dominantColor.toLowerCase()}60`
                                            }}
                                          ></div>
                                          <div>
                                            <div className="text-xs text-gray-500">Primary</div>
                                            <div className="text-sm font-medium">{result.dominantColor}</div>
                                          </div>
                                        </div>
                                        
                                        {/* Show secondary color if present */}
                                        {result.secondaryColor && (
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                            <div 
                                              className="w-8 h-8 rounded-full flex-shrink-0" 
                                              style={{ 
                                                backgroundColor: result.secondaryColor.toLowerCase(),
                                                boxShadow: `0 0 10px ${result.secondaryColor.toLowerCase()}60`
                                              }}
                                            ></div>
                                            <div>
                                              <div className="text-xs text-gray-500">Secondary</div>
                                              <div className="text-sm font-medium">{result.secondaryColor}</div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Show additional colors from spectrum if available */}
                                        {result.auraColorSpectrum ? (
                                          result.auraColorSpectrum.slice(2).map((color, index) => (
                                            <div key={`color-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0" 
                                                style={{ 
                                                  backgroundColor: color.toLowerCase(),
                                                  boxShadow: `0 0 10px ${color.toLowerCase()}60`
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">Complementary</div>
                                                <div className="text-sm font-medium">{color}</div>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          // Fallback colors when auraColorSpectrum isn't available
                                          <>
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0 bg-opacity-70"
                                                style={{ 
                                                  backgroundColor: result.dominantColor.toLowerCase(),
                                                  opacity: 0.6,
                                                  boxShadow: `0 0 10px ${result.dominantColor.toLowerCase()}30`
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">Complementary</div>
                                                <div className="text-sm font-medium">{auraHelpers.getComplementaryColor(result.dominantColor)}</div>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0 bg-opacity-70"
                                                style={{ 
                                                  backgroundColor: result.secondaryColor?.toLowerCase() || 
                                                    (auraHelpers.getComplementaryColor(result.dominantColor) || "white").toLowerCase(),
                                                  opacity: 0.6,
                                                  boxShadow: `0 0 10px ${(result.secondaryColor?.toLowerCase() || 
                                                    (auraHelpers.getComplementaryColor(result.dominantColor) || "white").toLowerCase())}30`
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">Complementary</div>
                                                <div className="text-sm font-medium">{auraHelpers.getComplementaryColor(result.secondaryColor || result.dominantColor)}</div>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Aura Layers Interpretation</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Etheric Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("etheric", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Emotional Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("emotional", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Mental Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("mental", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Spiritual Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("spiritual", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Energy Flow Analysis</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center mb-2">
                                      <div className="relative w-20 h-20 mr-4 flex-shrink-0">
                                        <div 
                                          className="absolute inset-0 rounded-full animate-ping" 
                                          style={{
                                            background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
                                            animation: `ping ${7 - result.energyLevel}s cubic-bezier(0, 0, 0.2, 1) infinite`
                                          }}
                                        ></div>
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                          <div 
                                            className="w-12 h-12 rounded-full" 
                                            style={{
                                              background: `conic-gradient(${result.dominantColor.toLowerCase()} ${result.energyLevel * 36}deg, transparent 0deg)`,
                                              boxShadow: `0 0 15px ${result.dominantColor.toLowerCase()}60`
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
                                    
                                    <div className="text-xs text-gray-700 mt-2">
                                      <strong>Energy Cycles:</strong> Your aura indicates a {auraHelpers.getEnergyCycle(result.energyLevel, result.dominantColor)} energy cycle currently. 
                                      Pay attention to how your energy fluctuates throughout the day and week.
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Personality Integration</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-700 mb-2">
                                      Your aura field reveals these dominant traits that combine to form your unique spiritual signature:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {result.personalityTraits.map((trait, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded-md text-sm border border-gray-100">
                                          <span className="font-medium block">{trait}</span>
                                          <span className="text-xs text-gray-600 block">{getTraitExplanation(trait, result.dominantColor)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Demo mode - showing premium features without upgrade */}
                              <div className="flex justify-center mt-4">
                                <div className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 border border-green-200">
                                  <span className="mr-1.5">✓</span> Premium Analysis Demo Mode Active
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center bg-white/50 border-dashed border-2">
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
