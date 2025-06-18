import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ImageUpload from "@/components/forms/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeAuraImage, AuraAnalysisResult, calculateNumerology, NumerologyResult } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { getAccurateColorCode, getColorChakra, getColorMeaning, getEnergyPattern } from "@/utils/color-mappings";

export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [numerologyName, setNumerologyName] = useState("");
  const [numerologyBirthDate, setNumerologyBirthDate] = useState("");
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);

  const stages = [
    "Initializing aura scanning...",
    "Detecting energy patterns...",
    "Analyzing color frequencies...",
    "Mapping chakra connections...",
    "Creating visualization...",
    "Finalizing results..."
  ];

  const handleImageAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setProcessedAuraImage(null);
    setAnalysisProgress(0);

    try {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);

      // Convert file to base64 for API
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      for (let i = 0; i < stages.length; i++) {
        setAnalysisStage(stages[i]);
        setAnalysisProgress((i / (stages.length - 1)) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const analysisResult = await analyzeAuraImage(base64Image);
      setResult(analysisResult);
      setActiveTab("analysis");
      
      if (user) {
        const response = await fetch('/api/aura-readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dominantColor: analysisResult.dominantColor,
            secondaryColor: analysisResult.secondaryColor,
            energyLevel: analysisResult.energyLevel,
            personalityTraits: analysisResult.personalityTraits,
            spiritualGuidance: analysisResult.spiritualGuidance,
            detailedAnalysis: analysisResult.detailedAnalysis
          })
        });
        
        if (response.ok) {
          const savedReading = await response.json();
          setCurrentAnalysisId(savedReading.id);
        }
      }

      createAuraVisualization(analysisResult);

      toast({
        title: "Aura analysis complete",
        description: "Your spiritual energy reading is ready!"
      });

    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again with a clear portrait image.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createAuraVisualization = (auraData: AuraAnalysisResult) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(200, 200, 50, 200, 200, 200);
    gradient.addColorStop(0, getAccurateColorCode(auraData.dominantColor) + '80');
    gradient.addColorStop(0.5, getAccurateColorCode(auraData.secondaryColor || auraData.dominantColor) + '40');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setProcessedAuraImage(canvas.toDataURL());
  };

  const submitReview = async () => {
    if (!currentAnalysisId || rating === 0) return;

    setIsSubmittingReview(true);
    try {
      await fetch(`/api/aura-readings/${currentAnalysisId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText })
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });

      setReviewSubmitted(true);
    } catch (error) {
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const calculateNumerologyData = async (name: string, birthDate: string) => {
    if (!name.trim() || !birthDate) {
      toast({
        title: "Missing information",
        description: "Please enter both your name and birth date.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculatingNumerology(true);
    try {
      const numerologyData = await calculateNumerology(name, birthDate);
      setNumerologyResult(numerologyData);
      
      toast({
        title: "Combined analysis complete",
        description: "Your aura and numerology insights are ready!"
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingNumerology(false);
    }
  };

  const getEnergyLevelDescription = (level: number): string => {
    if (level <= 3) return "Calm and grounded";
    if (level <= 6) return "Balanced and steady";
    if (level <= 8) return "Vibrant and active";
    return "Highly energized";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Aura Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your photo to reveal the colored energy field around you and discover your spiritual signature
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!result ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">Upload Your Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload onImageSelect={handleImageAnalysis} />
                
                {isAnalyzing && (
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-sm font-medium">{analysisStage}</p>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis">Aura Analysis</TabsTrigger>
                <TabsTrigger value="combined">Combined Insights</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aura Visualization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {processedAuraImage && (
                        <div className="relative">
                          <img 
                            src={processedAuraImage} 
                            alt="Aura visualization" 
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                          ></div>
                          <div>
                            <div className="font-medium">{result.dominantColor}</div>
                            <div className="text-sm text-gray-600">{getColorChakra(result.dominantColor)}</div>
                          </div>
                        </div>
                        
                        {result.secondaryColor && (
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: getAccurateColorCode(result.secondaryColor) }}
                            ></div>
                            <div>
                              <div className="font-medium">{result.secondaryColor}</div>
                              <div className="text-sm text-gray-600">{getColorChakra(result.secondaryColor)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Energy Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Energy Level</h4>
                        <Progress value={result.energyLevel * 10} className="h-2" />
                        <div className="text-center text-sm font-medium mt-1">
                          {result.energyLevel}/10 - {getEnergyLevelDescription(result.energyLevel)}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Personality Traits</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.personalityTraits.map((trait, index) => (
                            <Badge key={index} variant="secondary">{trait}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Energy Pattern</h4>
                        <p className="text-sm text-gray-600">
                          {getEnergyPattern(result.dominantColor, result.secondaryColor || result.dominantColor)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Spiritual Guidance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{result.spiritualGuidance}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{result.detailedAnalysis}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="combined" className="space-y-6">
                {!numerologyResult ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Enhanced Aura & Numerology Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">
                        Unlock deeper spiritual insights by combining your aura colors with numerological analysis
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your full birth name"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={numerologyName}
                            onChange={(e) => setNumerologyName(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Birth Date
                          </label>
                          <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={numerologyBirthDate}
                            onChange={(e) => setNumerologyBirthDate(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          if (!user) {
                            window.location.href = '/login';
                            return;
                          }
                          calculateNumerologyData(numerologyName, numerologyBirthDate);
                        }}
                        disabled={isCalculatingNumerology}
                      >
                        {isCalculatingNumerology ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Combined Analysis...
                          </>
                        ) : user ? "Create Combined Spiritual Analysis" : "Login to Access Combined Analysis"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Spiritual Energy Alignment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">
                          Your {result.dominantColor} aura perfectly aligns with your numerological profile, 
                          creating a harmonious spiritual signature that enhances your natural abilities.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Numerology Numbers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Life Path:</span>
                            <span className="font-bold">{numerologyResult.lifePathNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Destiny:</span>
                            <span className="font-bold">{numerologyResult.destinyNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Soul Urge:</span>
                            <span className="font-bold">{numerologyResult.soulUrgeNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Personality:</span>
                            <span className="font-bold">{numerologyResult.personalityNumber}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Aura Colors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Dominant:</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                              ></div>
                              <span className="font-bold">{result.dominantColor}</span>
                            </div>
                          </div>
                          {result.secondaryColor && (
                            <div className="flex items-center justify-between">
                              <span>Secondary:</span>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: getAccurateColorCode(result.secondaryColor) }}
                                ></div>
                                <span className="font-bold">{result.secondaryColor}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Combined Interpretation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{numerologyResult.interpretation}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="review" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rate Your Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!reviewSubmitted ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating (1-5 stars)
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                <Star className="h-6 w-6 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comments (optional)
                          </label>
                          <Textarea
                            placeholder="Share your thoughts about the aura reading..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                          />
                        </div>
                        
                        <Button
                          onClick={submitReview}
                          disabled={rating === 0 || isSubmittingReview}
                          className="w-full"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Review"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-green-600 font-medium">Thank you for your feedback!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}