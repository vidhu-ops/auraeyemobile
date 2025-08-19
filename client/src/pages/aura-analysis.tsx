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
const getColorSpiritualMeaning = (color: string): string => {
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
    'Black': 'Shadow work and transformative energy. This deep frequency represents deep spiritual integration and shadow healing.',
    'Gray': 'Neutral balance and adaptable wisdom. This balanced frequency indicates wise neutrality and peaceful resolution.',
    'Brown': 'Earth connection and grounding stability. This practical frequency represents natural wisdom and earth-based spiritual growth.'
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
    'Black': 'Focus on shadow work and inner transformation meditations',
    'Gray': 'Practice balance and neutral awareness meditations',
    'Brown': 'Focus on earth connection and grounding stability meditations'
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
    'Indigo': 'Develop psychic abilities, practice meditation, and enhance intuitive gifts',
    'Violet': 'Engage in spiritual practices, divine connection work, and consciousness expansion',
    'Pink': 'Practice unconditional love, emotional healing, and nurturing energy work',
    'Gold': 'Work with divine wisdom, spiritual teaching, and enlightened consciousness',
    'White': 'Focus on purification, spiritual protection, and angelic connection',
    'Silver': 'Develop psychic sensitivity, lunar energy work, and intuitive practices',
    'Black': 'Engage in shadow work, deep transformation, and healing integration',
    'Gray': 'Practice neutral observation, balanced wisdom, and peaceful resolution',
    'Brown': 'Work with earth energies, grounding practices, and natural wisdom'
  };
  return practices[color] || 'Work with your unique aura color energy in personal practice';
};

// Image compression utility
const compressImageTo60KB = async (dataUrl: string, targetSizeKB: number = 60): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Start with original dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      let quality = 0.9;
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until we reach target size
      while (compressedDataUrl.length > targetSizeKB * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.05;
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressedDataUrl);
    };
    
    img.src = dataUrl;
  });
};

// Main component
export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium } = usePremium();
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [activeTab, setActiveTab] = useState("aura");
  
  // Form states
  const [nameEntered, setNameEntered] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedAuraImage, setProcessedAuraImage] = useState<string | null>(null);
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | null>(null);
  
  // Review states
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  // Numerology states
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  
  // Storage and caching
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const [imageCache] = useState(new Map<string, string>());
  
  // Screenshot functionality
  const [capturedScreenshots, setCapturedScreenshots] = useState(new Map<string, string>());
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

  // Helper function to get healer notes if user is healer
  const getHealerNotes = () => {
    if (user?.userType !== 'healer' || !result) return '';
    
    return `HEALER ANALYSIS NOTES:
• Primary Aura: ${result.dominantColor} - ${getColorSpiritualMeaning(result.dominantColor)}
• Secondary Colors: ${result.secondaryColor || 'None detected'}
• Chakra Balance: ${result.chakraActivity ? Object.entries(result.chakraActivity).map(([chakra, score]) => `${chakra}: ${score}%`).join(', ') : 'Not analyzed'}
• Energy State: ${result.detailedAnalysis}
• Recommended Focus: ${getColorMeditationFocus(result.dominantColor)}
• Energy Work Suggestions: ${getColorEnergyWork(result.dominantColor)}`;
  };

  // Start analysis function
  const startAnalysis = async () => {
    if (!originalImage) {
      toast({
        title: "Image Required",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);
    setAnalysisStage('Preparing analysis...');
    setReviewSubmitted(false);
    setRating(0);
    setReviewText('');
    setCurrentAnalysisId(null);

    try {
      // Progress updates
      setAnalysisProgress(10);
      setAnalysisStage('Processing image...');

      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisProgress(30);
      setAnalysisStage('Analyzing aura energy...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisProgress(60);
      setAnalysisStage('Interpreting spiritual patterns...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisProgress(90);
      setAnalysisStage('Finalizing reading...');

      // Call analysis API
      const analysisResult = await analyzeAuraImage(originalImage, analysisName);

      if (analysisResult) {
        setResult(analysisResult);
        setProcessedAuraImage(analysisResult.processedAuraImage || null);
        setCurrentAnalysisId(analysisResult.id || null);

        // Store analysis for global access
        if (analysisResult.id) {
          window.currentAnalysisIdForScreenshot = analysisResult.id;
        }

        setAnalysisProgress(100);
        setAnalysisStage('Analysis complete!');
        setActiveTab('aura');

        toast({
          title: "Analysis Complete",
          description: "Your aura reading is ready!",
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your aura. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setNameEntered(false);
      setAnalysisName('');
    }
  };

  // Calculate numerology
  const calculateNumerologyReading = async () => {
    if (!analysisName) {
      toast({
        title: "Name Required",
        description: "Please enter your name first.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculatingNumerology(true);

    try {
      const numerologyData = await calculateNumerology(analysisName, new Date().toISOString());
      setNumerologyResult(numerologyData);
      
      if (activeTab !== 'numerology') {
        setActiveTab('numerology');
      }

      toast({
        title: "Numerology Complete",
        description: "Your numerology reading is ready!",
      });
    } catch (error) {
      console.error('Numerology calculation failed:', error);
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate numerology. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingNumerology(false);
    }
  };

  // Reset analysis
  const resetAnalysis = () => {
    setIsAnalyzing(false);
    setResult(null);
    setAnalysisProgress(0);
    setAnalysisStage('');
    setReviewSubmitted(false);
    setRating(0);
    setReviewText('');
    setCurrentAnalysisId(null);
  };

  // Screenshot capture functionality
  const captureTabScreenshot = async (tabId: string) => {
    try {
      setIsCapturingScreenshot(true);
      console.log(`🎯 Starting capture for ${tabId}...`);

      const element = document.querySelector(`[data-tab="${tabId}"]`) || document.querySelector('[data-state="active"]');
      if (!element) {
        throw new Error(`Tab ${tabId} not found`);
      }

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const compressed = await compressImageTo60KB(dataUrl);
      
      setCapturedScreenshots(prev => new Map(prev).set(tabId, compressed));
      
      toast({
        title: "Screenshot Captured",
        description: `${tabId} section captured successfully`,
      });

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast({
        title: "Capture Failed",
        description: "Unable to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    if (!result) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Aura Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      // Name
      pdf.setFontSize(14);
      pdf.text(`Analysis for: ${analysisName || 'Anonymous'}`, 20, 40);
      
      // Primary color
      pdf.text(`Primary Aura Color: ${result.dominantColor}`, 20, 60);
      
      // Interpretation
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(result.detailedAnalysis, pageWidth - 40);
      pdf.text(lines, 20, 80);
      
      // Add healer notes if applicable
      if (user?.userType === 'healer') {
        const healerNotes = getHealerNotes();
        const healerLines = pdf.splitTextToSize(healerNotes, pageWidth - 40);
        pdf.text(healerLines, 20, 120);
      }
      
      pdf.save(`aura-reading-${analysisName || 'anonymous'}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your aura reading has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Failed",
        description: "Unable to generate PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Aura Analysis & Spiritual Reading
          </h1>
          <p className="text-lg text-purple-200">
            Discover your spiritual energy and unlock cosmic insights
          </p>
        </div>

        {/* Upload and Name Input Section */}
        {!result && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-black/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-center text-white">Begin Your Reading</CardTitle>
                <CardDescription className="text-center text-purple-200">
                  Upload your image and enter your name for personalized analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload onImageSelect={(file: File) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setOriginalImage(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }} />
                
                {originalImage && !nameEntered && (
                  <NameInput 
                    title="Enter Your Name"
                    description="Your name helps us provide personalized aura insights"
                    onNameSubmit={(name: string) => {
                      setAnalysisName(name);
                      setNameEntered(true);
                    }}
                  />
                )}
                
                {nameEntered && originalImage && (
                  <div className="text-center">
                    <Button
                      onClick={startAnalysis}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="bg-black/30 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-400" />
                  <p className="text-white font-medium">{analysisStage}</p>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-center text-sm text-purple-300 mt-2">
                  {analysisProgress}% Complete
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Button
                onClick={calculateNumerologyReading}
                disabled={isCalculatingNumerology}
                variant="outline"
                className="bg-purple-600/20 border-purple-500 text-white hover:bg-purple-600/30"
              >
                {isCalculatingNumerology ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Star className="mr-2 h-4 w-4" />
                )}
                Calculate Numerology
              </Button>
              
              <Button
                onClick={generatePDFReport}
                variant="outline"
                className="bg-green-600/20 border-green-500 text-white hover:bg-green-600/30"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              
              <Button
                onClick={() => captureTabScreenshot(activeTab)}
                disabled={isCapturingScreenshot}
                variant="outline"
                className="bg-blue-600/20 border-blue-500 text-white hover:bg-blue-600/30"
              >
                {isCapturingScreenshot ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                Capture Screen
              </Button>
              
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="bg-red-600/20 border-red-500 text-white hover:bg-red-600/30"
              >
                New Analysis
              </Button>
            </div>

            {/* Results Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-black/30">
                <TabsTrigger value="aura" data-tab="aura">Aura</TabsTrigger>
                <TabsTrigger value="energy-reading" data-tab="energy-reading">Energy</TabsTrigger>
                <TabsTrigger value="chakras" data-tab="chakras">Chakras</TabsTrigger>
                <TabsTrigger value="guidance" data-tab="guidance">Guidance</TabsTrigger>
                <TabsTrigger value="spectrum" data-tab="spectrum">Spectrum</TabsTrigger>
                <TabsTrigger value="numerology" data-tab="numerology">Numerology</TabsTrigger>
              </TabsList>

              {/* Aura Tab */}
              <TabsContent value="aura" data-tab="aura">
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-center text-white">Your Aura Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-white">Original Image</h3>
                        {originalImage && (
                          <img 
                            src={originalImage} 
                            alt="Original" 
                            className="w-full rounded-lg border border-purple-500/30"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-white">Aura Visualization</h3>
                        {processedAuraImage && (
                          <div className="relative">
                            <img 
                              src={processedAuraImage} 
                              alt="Aura Visualization" 
                              className="w-full rounded-lg border border-purple-500/30"
                            />
                            <AuraGlow colors={[{
                              color: getAccurateColorCode(result.dominantColor),
                              size: 'w-32 h-32',
                              delay: '0s',
                              top: 'top-4',
                              left: 'left-4'
                            }]} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Badge 
                        className="text-lg px-4 py-2 mb-4"
                        style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                      >
                        Primary Aura: {result.dominantColor}
                      </Badge>
                      
                      {result.secondaryColor && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          <Badge 
                            variant="outline"
                            className="border-purple-400 text-white"
                            style={{ borderColor: getAccurateColorCode(result.secondaryColor) }}
                          >
                            {result.secondaryColor}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Energy Reading Tab */}
              <TabsContent value="energy-reading" data-tab="energy-reading">
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Energy Reading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Overall Interpretation</h3>
                        <p className="text-white leading-relaxed">{result.detailedAnalysis}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Spiritual Meaning</h3>
                        <p className="text-white leading-relaxed">{getColorSpiritualMeaning(result.dominantColor)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Meditation Focus</h3>
                        <p className="text-white leading-relaxed">{getColorMeditationFocus(result.dominantColor)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Chakras Tab */}
              <TabsContent value="chakras" data-tab="chakras">
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Chakra Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.chakraActivity ? (
                      <div className="space-y-4">
                        {Object.entries(result.chakraActivity).map(([chakra, score]) => (
                          <div key={chakra} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium capitalize">{chakra} Chakra</span>
                              <span className="text-purple-300">{score}%</span>
                            </div>
                            <Progress value={score as number} className="w-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-purple-200">Chakra analysis not available for this reading.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Guidance Tab */}
              <TabsContent value="guidance" data-tab="guidance">
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Spiritual Guidance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Energy Work Recommendations</h3>
                        <p className="text-white leading-relaxed">{getColorEnergyWork(result.dominantColor)}</p>
                      </div>
                      
                      {result.spiritualGuidance && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-purple-300">Personal Guidance</h3>
                          <p className="text-white leading-relaxed">{result.spiritualGuidance}</p>
                        </div>
                      )}
                      
                      {user?.userType === 'healer' && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-purple-300">Healer Notes</h3>
                          <div className="bg-purple-900/30 p-4 rounded-lg">
                            <pre className="text-sm text-purple-100 whitespace-pre-wrap font-mono">
                              {getHealerNotes()}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spectrum Tab */}
              <TabsContent value="spectrum" data-tab="spectrum">
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Color Spectrum Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white"
                            style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                          />
                          <p className="text-white font-medium">{result.dominantColor}</p>
                          <p className="text-purple-300 text-sm">Primary</p>
                        </div>
                        
                        {result.secondaryColor && (
                          <div className="text-center">
                            <div 
                              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-purple-400"
                              style={{ backgroundColor: getAccurateColorCode(result.secondaryColor) }}
                            />
                            <p className="text-white font-medium">{result.secondaryColor}</p>
                            <p className="text-purple-300 text-sm">Secondary</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 h-4 rounded-full opacity-60"></div>
                      <p className="text-center text-purple-200 text-sm">Full Spectrum Reference</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Numerology Tab */}
              <TabsContent value="numerology" data-tab="numerology">
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Numerology Reading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {numerologyResult ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2 text-purple-300">Life Path Number</h3>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white mb-2">{numerologyResult.lifePathNumber}</div>
                              <p className="text-purple-200">Life path guidance and meaning</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-2 text-purple-300">Destiny Number</h3>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white mb-2">{numerologyResult.destinyNumber}</div>
                              <p className="text-purple-200">Destiny and purpose insights</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-purple-300">Full Interpretation</h3>
                          <p className="text-white leading-relaxed">{numerologyResult.interpretation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-purple-200 mb-4">Calculate your numerology reading for deeper insights</p>
                        <Button
                          onClick={calculateNumerologyReading}
                          disabled={isCalculatingNumerology}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {isCalculatingNumerology ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Calculate Numerology
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Premium Features */}
            {!isPremium && (
              <PremiumFeature 
                title="Aura Analysis"
                description="Enhanced spiritual insights and detailed energy readings"
                basicFeatures={[
                  "Basic aura color detection",
                  "Primary energy analysis",
                  "Simple color meanings"
                ]}
                premiumFeatures={[
                  "Detailed chakra analysis with healing recommendations",
                  "Extended spiritual guidance sessions",
                  "Professional healer consultations",
                  "Advanced aura pattern recognition",
                  "Priority customer support"
                ]}
              />
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}