import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ImageUpload from "@/components/forms/image-upload";
import { Card, CardContent } from "@/components/ui/card";
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
  
  const handlePremiumUpgrade = () => {
    showPremiumModal("aura");
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
        const base64data = reader.result?.toString().split(",")[1];
        
        if (base64data) {
          // Call API to analyze the image
          const analysisResult = await analyzeAuraImage(base64data);
          setResult(analysisResult);
          
          // Ensure progress shows 100% at the end
          setAnalysisProgress(100);
          setAnalysisStage("Analysis complete! Preparing your results...");
          
          // Clear interval if it's still running
          clearInterval(progressInterval);
          
          // Small delay to show the 100% state before removing loading
          setTimeout(() => {
            setIsAnalyzing(false);
          }, 800);
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
  
  const getEnergyLevelText = (level: number): string => {
    if (level <= 1) return "very low";
    if (level <= 2) return "low";
    if (level <= 3) return "moderate";
    if (level <= 4) return "high";
    return "very high";
  };
  
  const getEnergyAdvice = (level: number, color: string): string => {
    if (level <= 2) {
      return " You may benefit from energy-enhancing practices such as pranayama breathing, solar gazing meditation, or crystal healing with citrine or carnelian.";
    } else if (level <= 3) {
      return " Your energy is balanced but could be optimized through regular energy maintenance practices like tai chi, qigong, or rhythm-based meditation.";
    } else {
      return " Your abundant energy should be channeled purposefully through grounding practices, creative expression, or service to others to prevent energetic burnout.";
    }
  };
  
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
                          <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                            <TabsTrigger value="chakras">Chakras</TabsTrigger>
                            <TabsTrigger value="guidance">Guidance</TabsTrigger>
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
                          
                          <TabsContent value="analysis">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">Your Aura Colors</h3>
                                </div>
                                <div className="flex gap-2">
                                  <span className={`inline-block w-6 h-6 rounded-full ${getColorClass(result.dominantColor)}`}></span>
                                  {result.secondaryColor && (
                                    <span className={`inline-block w-6 h-6 rounded-full ${getColorClass(result.secondaryColor)}`}></span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">Dominant Color</h4>
                                <div className="flex items-center">
                                  <span className={`inline-block w-4 h-4 rounded-full ${getColorClass(result.dominantColor)} mr-2`}></span>
                                  <span className="font-medium">{result.dominantColor}</span>
                                </div>
                                
                                {result.secondaryColor && (
                                  <div className="mt-2">
                                    <h4 className="text-sm text-gray-500 mb-1">Secondary Color</h4>
                                    <div className="flex items-center">
                                      <span className={`inline-block w-4 h-4 rounded-full ${getColorClass(result.secondaryColor)} mr-2`}></span>
                                      <span className="font-medium">{result.secondaryColor}</span>
                                    </div>
                                  </div>
                                )}
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
                                <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full border border-amber-300">
                                  Premium Feature
                                </div>
                                <h3 className="font-medium text-lg mb-4 text-primary">Comprehensive Aura Analysis</h3>
                                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                                  <p className="text-gray-700 whitespace-pre-line mb-4">{result.detailedAnalysis}</p>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Aura Layers Interpretation</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1">Etheric Layer</h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("etheric", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1">Emotional Layer</h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("emotional", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1">Mental Layer</h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("mental", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1">Spiritual Layer</h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("spiritual", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Energy Flow Analysis</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm mb-4">
                                    <p className="text-sm text-gray-700">
                                      Your energy level is <span className="font-medium">{getEnergyLevelText(result.energyLevel)}</span>. 
                                      {getEnergyAdvice(result.energyLevel, result.dominantColor)}
                                    </p>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Personality Integration</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-700 mb-2">
                                      Your dominant traits combine to form a unique spiritual signature:
                                    </p>
                                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                      {result.personalityTraits.map((trait, index) => (
                                        <li key={index}><span className="font-medium">{trait}</span>: {getTraitExplanation(trait, result.dominantColor)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-center">
                                <Button 
                                  variant="default" 
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                                  onClick={handlePremiumUpgrade}
                                >
                                  <Crown className="w-4 h-4 mr-2" />
                                  Unlock Premium Aura Analysis
                                </Button>
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
        
        {/* Premium Features Section */}
        <section className="py-16 bg-gradient-to-br from-primary-dark/5 to-secondary-dark/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Aura Analysis Options</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Choose the level of insight that best suits your spiritual journey.
                </p>
              </div>
              
              <PremiumFeature
                title="Aura Analysis"
                description="Discover the colors and energy patterns of your aura"
                basicFeatures={[
                  "Basic aura color identification",
                  "Primary personality traits",
                  "Energy level assessment",
                  "Basic chakra activity visualization"
                ]}
                premiumFeatures={[
                  "Advanced multi-layer aura color analysis",
                  "Detailed chakra balancing recommendations",
                  "Personalized spiritual practice suggestions",
                  "Temporal aura pattern tracking",
                  "30-day aura energy forecast"
                ]}
                ctaText="Unlock Premium Aura Analysis"
                onUpgrade={handlePremiumUpgrade}
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
