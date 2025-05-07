import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ImageUpload from "@/components/forms/image-upload";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeAuraImage, AuraAnalysisResult } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("analysis");

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Convert the image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];
        
        if (base64data) {
          // Call API to analyze the image
          const analysisResult = await analyzeAuraImage(base64data);
          setResult(analysisResult);
        }
      };
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your aura. Please try again.",
        variant: "destructive",
      });
      console.error("Error analyzing image:", error);
    } finally {
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload side */}
                <div>
                  <h2 className="font-heading font-semibold text-xl mb-4">Upload Your Photo</h2>
                  <ImageUpload onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
                  
                  <div className="mt-6 p-4 bg-white/70 rounded-lg border border-gray-200">
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
                
                {/* Results side */}
                <div>
                  <h2 className="font-heading font-semibold text-xl mb-4">Your Aura Reading</h2>
                  
                  {isAnalyzing ? (
                    <Card className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600">Analyzing your aura energy...</p>
                        <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                      </div>
                    </Card>
                  ) : result ? (
                    <Card>
                      <CardContent className="p-6">
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                            <TabsTrigger value="chakras">Chakras</TabsTrigger>
                            <TabsTrigger value="guidance">Guidance</TabsTrigger>
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
                              
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <h3 className="font-medium mb-3">Detailed Analysis</h3>
                                <p className="text-gray-700 whitespace-pre-line text-sm">{result.detailedAnalysis}</p>
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
      </main>
      
      <Footer />
    </div>
  );
}
