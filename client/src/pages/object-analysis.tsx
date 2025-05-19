import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import { Loader2, Upload, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/forms/image-upload";
import Footer from "@/components/layout/footer";

interface ObjectAnalysisResult {
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ObjectAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing object scanning...");

  const handlePremiumUpgrade = () => {
    showPremiumModal("general");
  };

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);
    setAnalysisStage("Initializing object scanning...");

    try {
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
          if (newProgress > 10 && newProgress <= 30) {
            setAnalysisStage("Identifying object characteristics...");
          } else if (newProgress > 30 && newProgress <= 60) {
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

      // Send to API
      const response = await fetch("/api/analyze-object", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: ObjectAnalysisResult = await response.json();
      setResult(data);
      setAnalysisProgress(100);
      setActiveTab("basic");

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed the object: ${data.objectName}`,
      });
    } catch (error) {
      console.error("Error analyzing object:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to get CSS color class from aura color
  const getColorClass = (color: string): string => {
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
      "Bronze": "bg-amber-600",
      "Copper": "bg-amber-500",
      "Turquoise": "bg-teal-400",
      "Violet": "bg-violet-500",
    };

    // Default fallback color or try to match parts of the color name
    if (!colorMap[color]) {
      const colorKeys = Object.keys(colorMap);
      const matchedColor = colorKeys.find(key => 
        color.toLowerCase().includes(key.toLowerCase())
      );
      return matchedColor ? colorMap[matchedColor] : "bg-gray-400";
    }

    return colorMap[color];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Object Energy Analysis</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Upload a photo of any object to discover its aura, energy patterns, and spiritual significance.
                </p>
              </div>
              
              <div className="mb-12">
                <Card className="overflow-hidden border-none shadow-md">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <p className="text-center text-muted-foreground">
                        Every object carries its own unique energy signature. Upload a photo of an object 
                        to discover its aura color, energy qualities, and spiritual significance.
                      </p>
                      
                      <div className="flex flex-col items-center justify-center">
                        <ImageUpload 
                          onImageSelect={handleImageSelect}
                          isLoading={isAnalyzing}
                        />
                        
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
                      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="basic">Basic Analysis</TabsTrigger>
                          <TabsTrigger value="energy">Energy Profile</TabsTrigger>
                          <TabsTrigger value="advanced">
                            Advanced Analysis
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-lg">{result.objectName}</h3>
                                <p className="text-sm text-gray-600">{result.objectDescription}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <span className={`inline-block w-8 h-8 rounded-full ${getColorClass(result.auraColor)}`}></span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Object Purpose</h4>
                              <p className="text-sm">{result.objectPurpose}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Aura Color</h4>
                              <div className="flex items-center">
                                <span className={`inline-block w-4 h-4 rounded-full ${getColorClass(result.auraColor)} mr-2`}></span>
                                <span className="font-medium">{result.auraColor}</span>
                              </div>
                              <p className="text-sm mt-2">{result.auraDescription}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Energy Level</h4>
                              <Progress value={result.energyLevel * 10} className="h-2" />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="energy">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm text-gray-500 mb-2">Energy Qualities</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.energyQualities.map((quality, index) => (
                                  <Badge key={index} variant="outline" className="rounded-full">
                                    {quality}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Energy Profile</h4>
                              <p className="text-sm text-gray-600">{result.detailedAnalysis}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                                <h4 className="font-medium text-sm mb-2">Energy Classification</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Receptive vs. Projective</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                        style={{ width: `${Math.random() * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Static vs. Dynamic</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                        style={{ width: `${Math.random() * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Grounding vs. Elevating</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                        style={{ width: `${Math.random() * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                                <h4 className="font-medium text-sm mb-2">Energy Influence</h4>
                                <p className="text-sm">This object may influence its surroundings by:</p>
                                <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                                  <li>Affecting emotional states</li>
                                  <li>Influencing spatial energy</li>
                                  <li>Connecting to specific chakras</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="advanced">
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-medium text-lg mb-2">Advanced Analysis</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Detailed insights into the object's energy field, historical connections, and spiritual significance.
                              </p>
                            </div>
                            
                            {result.historicalSignificance && (
                              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                <h4 className="font-medium text-sm mb-2">Historical Significance</h4>
                                <p className="text-sm">{result.historicalSignificance}</p>
                              </div>
                            )}
                            
                            {result.spiritualSignificance && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <h4 className="font-medium text-sm mb-2">Spiritual Significance</h4>
                                <p className="text-sm">{result.spiritualSignificance}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="font-medium text-sm mb-2">Energetic Resonance</h4>
                                <p className="text-sm">This object resonates with the following energies:</p>
                                <div className="mt-3 space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Earth Connection</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full" 
                                        style={{ width: `${55 + Math.random() * 30}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Celestial Connection</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                        style={{ width: `${55 + Math.random() * 30}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Emotional Influence</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" 
                                        style={{ width: `${55 + Math.random() * 30}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                                <h4 className="font-medium text-sm mb-2">Recommended Practices</h4>
                                <p className="text-sm">Based on this object's energy:</p>
                                <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                                  <li>Place in areas where you need more {result.energyQualities[0]?.toLowerCase() || 'calming'} energy</li>
                                  <li>Meditate with this object to enhance {result.energyQualities[1]?.toLowerCase() || 'focus'}</li>
                                  <li>Use during {result.auraColor.toLowerCase()} color therapy sessions</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                    <h3 className="font-medium text-lg mb-2">Discover More Object Secrets</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload another photo to explore different objects and their energy signatures. 
                      Each object has its own unique spiritual fingerprint to discover.
                    </p>
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => setResult(null)}>
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
      
      <Footer />
    </div>
  );
}