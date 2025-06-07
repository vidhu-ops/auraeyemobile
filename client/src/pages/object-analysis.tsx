import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import { Loader2, Upload, Crown, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/forms/image-upload";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

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
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handlePremiumUpgrade = () => {
    showPremiumModal("general");
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
      'gold': 'sepia(100%) saturate(200%) hue-rotate(40deg) brightness(1.3)',
      'silver': 'grayscale(30%) brightness(1.2) contrast(110%)',
      'turquoise': 'sepia(100%) saturate(200%) hue-rotate(180deg) brightness(1.2)',
      'magenta': 'sepia(100%) saturate(200%) hue-rotate(300deg) brightness(1.1)'
    };
    
    return colorFilters[auraColor.toLowerCase()] || 'sepia(50%) saturate(150%) hue-rotate(270deg) brightness(1.1)';
  };

  // Function to get hex color for aura overlay
  const getAuraColorHex = (auraColor: string): string => {
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00',
      'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500',
      'pink': '#FFC0CB', 'violet': '#8A2BE2', 'indigo': '#4B0082',
      'gold': '#FFD700', 'silver': '#C0C0C0', 'white': '#FFFFFF',
      'black': '#000000', 'turquoise': '#40E0D0', 'magenta': '#FF00FF'
    };
    return colorMap[auraColor.toLowerCase()] || '#800080';
  };

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setAnalysisProgress(0);
    setAnalysisStage("Initializing object scanning...");

    // Store original image
    const imageUrl = URL.createObjectURL(file);
    setOriginalImage(imageUrl);

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

      // Set processed image immediately with aura overlay effect
      setProcessedImage(imageUrl);

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
      <Navbar />
      <div className="bg-gradient-to-r from-primary-dark to-dark text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-heading font-bold">Object Analysis</h1>
          <p className="opacity-80">Discover the energy and spiritual significance of objects</p>
        </div>
      </div>
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
                          <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic">
                          <div className="space-y-6">
                            {/* Image Comparison Section */}
                            {originalImage && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <ImageIcon className="h-5 w-5 text-purple-600" />
                                  Aura Visualization
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Original Image */}
                                  <div className="space-y-3">
                                    <div className="text-center">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Original Image</h5>
                                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img 
                                          src={originalImage} 
                                          alt="Original object"
                                          className="w-full h-64 object-cover"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Processed Image with Aura Gradient */}
                                  <div className="space-y-3">
                                    <div className="text-center">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        Aura Enhanced View
                                      </h5>
                                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                                        {processedImage ? (
                                          <div className="relative">
                                            <img 
                                              src={processedImage} 
                                              alt="Object with aura gradient"
                                              className="w-full h-64 object-cover"
                                              style={{ 
                                                filter: getAuraFilter(result.auraColor),
                                                transition: 'filter 0.5s ease-in-out'
                                              }}
                                            />
                                            <div 
                                              className="absolute inset-0 pointer-events-none"
                                              style={{
                                                background: `radial-gradient(circle, ${getAuraColorHex(result.auraColor)}40 0%, transparent 70%)`,
                                                opacity: 0.3
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full h-64 flex items-center justify-center">
                                            <div className="text-center">
                                              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                                              <p className="text-sm text-gray-500">Processing aura visualization...</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Color Legend */}
                                <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                                  <span className="text-sm text-gray-600">Aura Color:</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block w-6 h-6 rounded-full border-2 border-white shadow-sm ${getColorClass(result.auraColor)}`}></span>
                                    <span className="font-medium text-gray-800">{result.auraColor}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-lg">{result.objectName}</h3>
                                <p className="text-sm text-gray-600">{result.objectDescription}</p>
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
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full ${getColorClass(result.auraColor)} mr-3`}></div>
                              <h3 className="font-medium text-lg">Advanced Analysis</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                                <h4 className="font-medium mb-3">Historical Significance</h4>
                                <p className="text-sm text-gray-700">
                                  {result.historicalSignificance || 
                                    `Objects with ${result.auraColor.toLowerCase()} auras have historically been associated with ${
                                      result.auraColor.toLowerCase() === 'red' ? 'power and protection rituals' :
                                      result.auraColor.toLowerCase() === 'blue' ? 'communication and truth-seeking' :
                                      result.auraColor.toLowerCase() === 'green' ? 'healing and balance' :
                                      result.auraColor.toLowerCase() === 'purple' ? 'spiritual wisdom and connection' :
                                      result.auraColor.toLowerCase() === 'yellow' ? 'optimism and mental clarity' :
                                      result.auraColor.toLowerCase() === 'orange' ? 'creativity and enthusiasm' :
                                      result.auraColor.toLowerCase() === 'pink' ? 'love and compassion' :
                                      result.auraColor.toLowerCase() === 'white' ? 'purity and protection' :
                                      result.auraColor.toLowerCase() === 'black' ? 'grounding and protection' :
                                      result.auraColor.toLowerCase() === 'gold' ? 'divine connection and wisdom' :
                                      'various ceremonial and ritual purposes'
                                    }. Throughout different cultures, similar objects have been used for ${
                                      result.objectPurpose.toLowerCase().includes('healing') ? 'healing ceremonies and energy balancing' :
                                      result.objectPurpose.toLowerCase().includes('protect') ? 'protection against negative influences' :
                                      result.objectPurpose.toLowerCase().includes('commun') ? 'communication with higher realms' :
                                      result.objectPurpose.toLowerCase().includes('wisdom') ? 'gaining wisdom and insight' :
                                      'enhancing spiritual practices and daily rituals'
                                    }.`
                                  }
                                </p>
                              </div>
                              
                              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-5 border border-violet-100">
                                <h4 className="font-medium mb-3">Spiritual Significance</h4>
                                <p className="text-sm text-gray-700">
                                  {result.spiritualSignificance || 
                                    `This object carries energies that can potentially influence ${
                                      result.energyQualities.some(q => q.toLowerCase().includes('heal')) ? 'healing and restoration' :
                                      result.energyQualities.some(q => q.toLowerCase().includes('protect')) ? 'protection and safety' :
                                      result.energyQualities.some(q => q.toLowerCase().includes('calm')) ? 'peace and tranquility' :
                                      result.energyQualities.some(q => q.toLowerCase().includes('focus')) ? 'focus and concentration' :
                                      result.energyQualities.some(q => q.toLowerCase().includes('creative')) ? 'creativity and expression' :
                                      'spiritual awareness and connection'
                                    }. Its ${result.auraColor.toLowerCase()} aura suggests alignment with ${
                                      result.auraColor.toLowerCase() === 'red' ? 'the root chakra, grounding physical energy' :
                                      result.auraColor.toLowerCase() === 'orange' ? 'the sacral chakra, enhancing creative flow' :
                                      result.auraColor.toLowerCase() === 'yellow' ? 'the solar plexus chakra, boosting personal power' :
                                      result.auraColor.toLowerCase() === 'green' ? 'the heart chakra, opening to love and compassion' :
                                      result.auraColor.toLowerCase() === 'blue' ? 'the throat chakra, facilitating clear expression' :
                                      result.auraColor.toLowerCase() === 'indigo' ? 'the third eye chakra, enhancing intuition' :
                                      result.auraColor.toLowerCase() === 'purple' || result.auraColor.toLowerCase() === 'violet' ? 
                                        'the crown chakra, connecting to higher consciousness' :
                                      'multiple chakra centers, offering balanced energy work'
                                    }.`
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-100">
                              <h4 className="font-medium mb-3">Energy Interactions & Recommendations</h4>
                              <p className="text-sm text-gray-700 mb-4">
                                This object's energy signature interacts with human energy fields in 
                                {result.energyLevel > 7 ? ' powerful and immediate ways' : 
                                 result.energyLevel > 4 ? ' noticeable and consistent ways' : 
                                 ' subtle but significant ways'}.
                                Its vibration may {result.energyLevel > 6 ? 'actively transform' : 'gently influence'} 
                                surrounding energies.
                              </p>
                              
                              <h5 className="font-medium text-sm mb-2">Recommendations for Use:</h5>
                              <ul className="text-sm list-disc list-inside space-y-1 text-gray-700">
                                <li>Place in a {result.energyLevel > 6 ? 'central' : 'thoughtfully chosen'} location 
                                  where you spend {result.energyLevel > 5 ? 'focused time' : 'restful moments'}</li>
                                <li>Consider combining with {
                                  result.auraColor.toLowerCase() === 'red' ? 'black tourmaline for grounding excess energy' :
                                  result.auraColor.toLowerCase() === 'blue' ? 'clear quartz to amplify communication properties' :
                                  result.auraColor.toLowerCase() === 'green' ? 'rose quartz to enhance heart-centered healing' :
                                  result.auraColor.toLowerCase() === 'purple' ? 'amethyst to deepen spiritual awareness' :
                                  result.auraColor.toLowerCase() === 'yellow' ? 'citrine to boost positive mental energy' :
                                  'complementary crystals or objects to balance its energetic properties'
                                }</li>
                                <li>For maximum benefit, {
                                  result.energyLevel > 7 ? 'use mindfully and in moderation' :
                                  result.energyLevel > 4 ? 'incorporate into daily rituals' :
                                  'keep in your environment consistently'
                                }</li>
                                <li>Cleanse regularly with {
                                  result.auraColor.toLowerCase().includes('water') || 
                                  result.auraColor.toLowerCase() === 'blue' ? 'moonlight or sound' :
                                  result.auraColor.toLowerCase().includes('fire') || 
                                  result.auraColor.toLowerCase() === 'red' || 
                                  result.auraColor.toLowerCase() === 'orange' ? 'sunlight or smoke' :
                                  'your preferred energy clearing method'
                                } to maintain its optimal vibration</li>
                              </ul>
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