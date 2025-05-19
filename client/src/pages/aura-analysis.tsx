import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import ImageUpload from "@/components/forms/image-upload";
import { AuraGlow } from "@/components/ui/aura-glow";
import { AuraAnalysisResult } from "@/lib/openai";
import Footer from "@/components/layout/footer";

export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium } = usePremium();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing aura scanning...");
  const [originalImage, setOriginalImage] = useState<string | undefined>();
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("analysis");

  // Function to generate aura visualization with colored clouds
  const generateAuraVisualization = (originalImageBase64: string | undefined, auraData: AuraAnalysisResult) => {
    if (!originalImageBase64) return;

    try {
      // Create a new image element to load the original photo
      const img = new Image();
      img.onload = () => {
        // Create a canvas element to draw the enhanced aura visualization
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Get the 2D drawing context
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Extract colors from aura data
        const dominantColor = auraData.dominantColor.toLowerCase();
        const secondaryColor = auraData.secondaryColor?.toLowerCase() || dominantColor;
        
        // Draw aura clouds
        drawAuraClouds(ctx, img.width, img.height, dominantColor, secondaryColor, auraData.energyLevel);
        
        // Convert the canvas to a data URL and set it as the enhanced image
        const enhancedImageDataUrl = canvas.toDataURL("image/jpeg");
        setEnhancedAuraImage(enhancedImageDataUrl);
      };
      
      // Load the original image
      img.src = originalImageBase64;
    } catch (error) {
      console.error("Error generating aura visualization:", error);
    }
  };
  
  // Function to draw aura cloud effects
  const drawAuraClouds = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    primaryColor: string, 
    secondaryColor: string,
    energyLevel: number
  ) => {
    // Convert color names to RGBA format
    const colorMap: Record<string, string> = {
      "red": "rgba(255, 0, 0, 0.4)",
      "orange": "rgba(255, 165, 0, 0.4)",
      "yellow": "rgba(255, 255, 0, 0.4)",
      "green": "rgba(0, 128, 0, 0.4)",
      "blue": "rgba(0, 0, 255, 0.4)",
      "indigo": "rgba(75, 0, 130, 0.4)",
      "violet": "rgba(238, 130, 238, 0.4)",
      "purple": "rgba(128, 0, 128, 0.4)",
      "pink": "rgba(255, 192, 203, 0.4)",
      "white": "rgba(255, 255, 255, 0.4)",
      "gold": "rgba(255, 215, 0, 0.4)",
      "silver": "rgba(192, 192, 192, 0.4)",
    };
    
    // Default colors if not found in map
    const primaryRgba = colorMap[primaryColor] || "rgba(255, 255, 255, 0.4)";
    const secondaryRgba = colorMap[secondaryColor] || "rgba(230, 230, 250, 0.4)";
    
    // Create a radial gradient for the aura effect
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Intensity of the aura based on energy level (1-10)
    const intensityFactor = energyLevel / 10;
    const auraSize = Math.max(width, height) * (0.2 + intensityFactor * 0.3);
    
    // Draw multiple layers of aura clouds with different opacities and sizes
    for (let i = 0; i < 3; i++) {
      const radius = auraSize * (0.6 + i * 0.1);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.2,
        centerX, centerY, radius
      );
      
      // First color stop (inner)
      gradient.addColorStop(0, i === 0 ? primaryRgba : secondaryRgba);
      
      // Last color stop (outer)
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      // Set the gradient as fill style
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      
      // Draw a circle with the gradient
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add particle effects for enhanced visualization
    const particles = 50 + energyLevel * 10; // More particles for higher energy
    const particleColor = energyLevel > 7 ? primaryRgba : secondaryRgba;
    
    ctx.fillStyle = particleColor;
    ctx.globalCompositeOperation = "lighter";
    
    for (let i = 0; i < particles; i++) {
      // Random position within the aura radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * auraSize;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Random size based on energy
      const size = Math.random() * 3 + (energyLevel / 10) * 4;
      
      // Draw the particle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  };

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);
    setOriginalImage(undefined);
    setEnhancedAuraImage(undefined);
    setAnalysisStage("Initializing aura scanning...");

    try {
      // Convert the file to a base64 string for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          setOriginalImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          
          const increment = Math.random() * 10;
          const newProgress = prev + increment > 95 ? 95 : prev + increment;
          
          // Update analysis stage based on progress
          if (newProgress > 15 && newProgress <= 40) {
            setAnalysisStage("Detecting energy patterns in your aura...");
          } else if (newProgress > 40 && newProgress <= 75) {
            setAnalysisStage("Analyzing chakra alignment and energy flows...");
          } else if (newProgress > 75) {
            setAnalysisStage("Finalizing your personalized aura reading...");
          }
          
          return newProgress;
        });
      }, 600);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("analysisType", "detailed");

      // Send to backend API
      const response = await fetch("/api/analyze-aura", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze aura");
      }

      const data: AuraAnalysisResult = await response.json();
      
      // Set result and complete progress
      setResult(data);
      setAnalysisProgress(100);
      
      // Generate enhanced aura image with colored clouds
      if (originalImage) {
        generateAuraVisualization(originalImage, data);
      }
      
      toast({
        title: "Aura Analysis Complete", 
        description: "Your personalized aura reading is ready to explore.",
      });
    } catch (error) {
      console.error("Error analyzing aura:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed", 
        description: "Unable to analyze your aura. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to get color class from color name
  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      "red": "text-red-500",
      "orange": "text-orange-500",
      "yellow": "text-yellow-500",
      "green": "text-green-500",
      "blue": "text-blue-500",
      "indigo": "text-indigo-500",
      "violet": "text-violet-500",
      "purple": "text-purple-500",
      "pink": "text-pink-500",
      "white": "text-gray-100",
      "gold": "text-amber-400"
    };
    
    return colorMap[color.toLowerCase()] || "text-gray-600";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Aura Analysis</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Upload a photo to discover your aura colors, energy patterns, and spiritual insights.
                </p>
              </div>
              
              <div className="mb-12">
                <Card className="overflow-hidden border-none shadow-md">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      <p className="text-center text-muted-foreground">
                        Your aura is a unique energy field that surrounds your physical body. Upload a clear, 
                        well-lit portrait photo to reveal your aura colors and energy patterns.
                      </p>
                      
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-full max-w-md">
                          <ImageUpload 
                            onImageSelect={handleImageSelect}
                            isLoading={isAnalyzing}
                          />
                        </div>
                        
                        {isAnalyzing && (
                          <div className="mt-6 text-center w-full max-w-md">
                            <AuraGlow />
                            <p className="text-sm text-muted-foreground mt-4 mb-2">{analysisStage}</p>
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
                      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                          <TabsTrigger value="analysis">Analysis</TabsTrigger>
                          <TabsTrigger value="chakras">Chakras</TabsTrigger>
                          <TabsTrigger value="guidance">Guidance</TabsTrigger>
                          <TabsTrigger value="detailed">Detailed</TabsTrigger>
                        </TabsList>
                        
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
                                {/* Enhanced aura visualization with original photo */}
                                <div className="w-full md:w-1/3">
                                  {enhancedAuraImage ? (
                                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                                      <img 
                                        src={enhancedAuraImage} 
                                        alt="Your Aura Visualization" 
                                        className="w-full h-auto"
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                        <p className="text-xs text-white">Enhanced Aura Visualization</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative w-48 h-48 mx-auto">
                                      {/* Fallback aura visualization with colors detected */}
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
                                          background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)`,
                                        }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Aura color information */}
                                <div className="flex-1">
                                  <h4 className="font-medium mb-3">Your Aura Colors</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium mb-1">Dominant Color</p>
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className="inline-block w-4 h-4 rounded-full" 
                                          style={{ backgroundColor: result.dominantColor.toLowerCase() }}
                                        ></span>
                                        <span className={`text-sm ${getColorClass(result.dominantColor)}`}>
                                          {result.dominantColor}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {result.dominantColor === "Red" ? "Passionate & energetic" : 
                                          result.dominantColor === "Orange" ? "Creative & joyful" :
                                          result.dominantColor === "Yellow" ? "Intellectual & optimistic" :
                                          result.dominantColor === "Green" ? "Balanced & healing" :
                                          result.dominantColor === "Blue" ? "Intuitive & calm" :
                                          result.dominantColor === "Purple" ? "Spiritual & visionary" :
                                          result.dominantColor === "Pink" ? "Loving & kind" :
                                          result.dominantColor === "Gold" ? "Enlightened & divine" :
                                          result.dominantColor === "White" ? "Pure & transcendent" :
                                          "Unique & special"}
                                      </p>
                                    </div>
                                    
                                    {result.secondaryColor && (
                                      <div>
                                        <p className="text-sm font-medium mb-1">Secondary Color</p>
                                        <div className="flex items-center gap-2">
                                          <span 
                                            className="inline-block w-4 h-4 rounded-full" 
                                            style={{ backgroundColor: result.secondaryColor.toLowerCase() }}
                                          ></span>
                                          <span className={`text-sm ${getColorClass(result.secondaryColor)}`}>
                                            {result.secondaryColor}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {result.secondaryColor === "Red" ? "Passionate & energetic" : 
                                            result.secondaryColor === "Orange" ? "Creative & joyful" :
                                            result.secondaryColor === "Yellow" ? "Intellectual & optimistic" :
                                            result.secondaryColor === "Green" ? "Balanced & healing" :
                                            result.secondaryColor === "Blue" ? "Intuitive & calm" :
                                            result.secondaryColor === "Purple" ? "Spiritual & visionary" :
                                            result.secondaryColor === "Pink" ? "Loving & kind" :
                                            result.secondaryColor === "Gold" ? "Enlightened & divine" :
                                            result.secondaryColor === "White" ? "Pure & transcendent" :
                                            "Unique & special"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="mt-4">
                                    <p className="text-sm font-medium mb-1">Energy Level</p>
                                    <Progress value={result.energyLevel * 10} className="h-2 mb-1" />
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>Low</span>
                                      <span>Medium</span>
                                      <span>High</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Personality Traits</p>
                                    <div className="flex flex-wrap gap-2">
                                      {result.personalityTraits.map((trait, index) => (
                                        <Badge key={index} variant="outline" className="rounded-full">
                                          {trait}
                                        </Badge>
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
                                  <span className="text-xs">{Math.round(result.chakraActivity.crown * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-violet-500" 
                                    style={{ width: `${result.chakraActivity.crown * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Third Eye Chakra</span>
                                  <span className="text-xs">{Math.round(result.chakraActivity.thirdEye * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500" 
                                    style={{ width: `${result.chakraActivity.thirdEye * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Throat Chakra</span>
                                  <span className="text-xs">{Math.round(result.chakraActivity.throat * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${result.chakraActivity.throat * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Heart Chakra</span>
                                  <span className="text-xs">{Math.round(result.chakraActivity.heart * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${result.chakraActivity.heart * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Solar Plexus Chakra</span>
                                  <span className="text-xs">{Math.round(result.chakraActivity.solarPlexus * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-500" 
                                    style={{ width: `${result.chakraActivity.solarPlexus * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Sacral Chakra</span>
                                  <span className="text-xs">{Math.round(result.chakraActivity.sacral * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-orange-500" 
                                    style={{ width: `${result.chakraActivity.sacral * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Root Chakra</span>
                                  <span className="text-xs">{Math.round(result.chakraActivity.root * 10)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500" 
                                    style={{ width: `${result.chakraActivity.root * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                              <h4 className="text-sm font-medium mb-2">Aura and Chakra Interaction</h4>
                              <p className="text-sm text-gray-600">
                                Your {result.dominantColor.toLowerCase()} aura shows strongest resonance with your 
                                {result.chakraActivity.crown > 0.7 ? " crown" : 
                                  result.chakraActivity.thirdEye > 0.7 ? " third eye" :
                                  result.chakraActivity.throat > 0.7 ? " throat" :
                                  result.chakraActivity.heart > 0.7 ? " heart" :
                                  result.chakraActivity.solarPlexus > 0.7 ? " solar plexus" :
                                  result.chakraActivity.sacral > 0.7 ? " sacral" :
                                  " root"} chakra.
                                This suggests a natural alignment between your energy field and your spiritual awareness.
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="guidance">
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-medium mb-2">Spiritual Guidance</h3>
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {result.spiritualGuidance}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                                <h4 className="text-sm font-medium mb-2">
                                  <Sparkles className="h-4 w-4 inline-block mr-1 text-indigo-500" />
                                  Energy Practices
                                </h4>
                                <ul className="text-sm space-y-2">
                                  <li className="flex items-start gap-2">
                                    <span className="rounded-full bg-indigo-100 text-indigo-800 h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                                    <span>Meditate with {result.dominantColor.toLowerCase()} crystals to amplify your natural energy</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="rounded-full bg-indigo-100 text-indigo-800 h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                                    <span>Practice mindful breathing focused on your {
                                      result.chakraActivity.crown > 0.7 ? "crown" : 
                                      result.chakraActivity.thirdEye > 0.7 ? "third eye" :
                                      result.chakraActivity.throat > 0.7 ? "throat" :
                                      result.chakraActivity.heart > 0.7 ? "heart" :
                                      result.chakraActivity.solarPlexus > 0.7 ? "solar plexus" :
                                      result.chakraActivity.sacral > 0.7 ? "sacral" :
                                      "root"
                                    } chakra</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="rounded-full bg-indigo-100 text-indigo-800 h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                                    <span>Engage in creative expression that aligns with your {result.personalityTraits[0]?.toLowerCase()} nature</span>
                                  </li>
                                </ul>
                              </div>
                              
                              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                                <h4 className="text-sm font-medium mb-2">
                                  <Sparkles className="h-4 w-4 inline-block mr-1 text-amber-500" />
                                  Daily Affirmations
                                </h4>
                                <ul className="text-sm space-y-2">
                                  <li className="flex items-start gap-2">
                                    <span className="rounded-full bg-amber-100 text-amber-800 h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                                    <span>"I embrace my {result.dominantColor.toLowerCase()} energy and allow it to guide my spiritual journey."</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="rounded-full bg-amber-100 text-amber-800 h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                                    <span>"My {
                                      result.chakraActivity.crown > 0.7 ? "wisdom" : 
                                      result.chakraActivity.thirdEye > 0.7 ? "intuition" :
                                      result.chakraActivity.throat > 0.7 ? "voice" :
                                      result.chakraActivity.heart > 0.7 ? "compassion" :
                                      result.chakraActivity.solarPlexus > 0.7 ? "personal power" :
                                      result.chakraActivity.sacral > 0.7 ? "creativity" :
                                      "stability"
                                    } flows freely through me."</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="rounded-full bg-amber-100 text-amber-800 h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                                    <span>"I am {result.personalityTraits[1]?.toLowerCase() || 'powerful'} and {result.personalityTraits[2]?.toLowerCase() || 'connected'} in all that I do."</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="detailed">
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-medium mb-2">Detailed Aura Analysis</h3>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{result.detailedAnalysis}</p>
                            </div>
                            
                            {result.auraColorSpectrum && result.auraColorSpectrum.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Full Aura Color Spectrum</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {result.auraColorSpectrum.map((color, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                      <span 
                                        className="inline-block w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: color.toLowerCase() }}
                                      ></span>
                                      <span className={`text-xs ${getColorClass(color)}`}>{color}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {result.auraLayerColors && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Aura Layer Colors</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {result.auraLayerColors.inner && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-gray-500 mb-2">Inner Layer</p>
                                      <div className="mx-auto w-8 h-8 rounded-full mb-1" style={{ backgroundColor: result.auraLayerColors.inner.toLowerCase() }}></div>
                                      <p className="text-sm">{result.auraLayerColors.inner}</p>
                                    </div>
                                  )}
                                  
                                  {result.auraLayerColors.middle && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-gray-500 mb-2">Middle Layer</p>
                                      <div className="mx-auto w-8 h-8 rounded-full mb-1" style={{ backgroundColor: result.auraLayerColors.middle.toLowerCase() }}></div>
                                      <p className="text-sm">{result.auraLayerColors.middle}</p>
                                    </div>
                                  )}
                                  
                                  {result.auraLayerColors.outer && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-gray-500 mb-2">Outer Layer</p>
                                      <div className="mx-auto w-8 h-8 rounded-full mb-1" style={{ backgroundColor: result.auraLayerColors.outer.toLowerCase() }}></div>
                                      <p className="text-sm">{result.auraLayerColors.outer}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}