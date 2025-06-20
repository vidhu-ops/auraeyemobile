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
import { analyzeAuraImage, AuraAnalysisResult, calculateNumerology, NumerologyResult } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Sparkles, Zap, Download, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Color code mapping function - moved outside component for global access
const getAccurateColorCode = (colorName: string): string => {
  const colorCodes: Record<string, string> = {
    'red': '#FF0000',
    'Red': '#FF0000',
    'orange': '#FFA500',
    'Orange': '#FFA500',
    'yellow': '#FFFF00',
    'Yellow': '#FFFF00',
    'green': '#00FF00',
    'Green': '#00FF00',
    'blue': '#0000FF',
    'Blue': '#0000FF',
    'purple': '#800080',
    'Purple': '#800080',
    'pink': '#FFC0CB',
    'Pink': '#FFC0CB',
    'white': '#FFFFFF',
    'White': '#FFFFFF',
    'black': '#000000',
    'Black': '#000000',
    'brown': '#A52A2A',
    'Brown': '#A52A2A',
    'gray': '#808080',
    'Gray': '#808080',
    'grey': '#808080',
    'Grey': '#808080',
    'silver': '#C0C0C0',
    'Silver': '#C0C0C0',
    'gold': '#FFD700',
    'Gold': '#FFD700',
    'turquoise': '#40E0D0',
    'Turquoise': '#40E0D0',
    'teal': '#008080',
    'Teal': '#008080',
    'peach': '#FFCBA4',
    'Peach': '#FFCBA4',
    'lavender': '#E6E6FA',
    'Lavender': '#E6E6FA',
    'indigo': '#4B0082',
    'Indigo': '#4B0082',
    'violet': '#8A2BE2',
    'Violet': '#8A2BE2',
  };
  
  return colorCodes[colorName] || '#FFFFFF';
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
  
  // Image hash storage for consistent results
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());

  const handleImageUpload = async (imageData: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to analyze your aura.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStage("Initializing aura scanning...");
    setOriginalImage(imageData);
    setResult(null);
    setActiveTab("analysis");

    try {
      // Progress simulation
      const progressSteps = [
        "Analyzing energy field patterns...",
        "Detecting aura colors and intensity...",
        "Mapping chakra alignments...",
        "Calculating numerological influences...",
        "Generating personalized insights...",
        "Finalizing your aura profile..."
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setAnalysisStage(progressSteps[i]);
        setAnalysisProgress((i + 1) * 16.67);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Perform the actual analysis
      const analysisResult = await analyzeAuraImage(imageData);
      
      if (analysisResult) {
        setResult(analysisResult);
        setAnalysisProgress(100);
        setAnalysisStage("Analysis complete!");

        // Save to database
        try {
          const response = await apiRequest(`/api/aura-readings`, {
            method: 'POST',
            body: JSON.stringify({
              imageData: imageData,
              dominantColor: analysisResult.dominantColor,
              secondaryColor: analysisResult.secondaryColor,
              analysis: analysisResult.analysis,
              insights: analysisResult.insights,
              recommendations: analysisResult.recommendations,
              energyLevel: analysisResult.energyLevel,
              moodIndicators: analysisResult.moodIndicators,
              chakraAnalysis: analysisResult.chakraAnalysis,
              colorSpectrum: analysisResult.auraColorSpectrum,
              numerologyData: analysisResult.numerologyIntegration ? JSON.stringify(analysisResult.numerologyIntegration) : null,
              enhancedAnalysis: analysisResult.enhancedInsights || null
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response && response.id) {
            setCurrentAnalysisId(response.id);
          }
        } catch (error) {
          console.error('Failed to save aura reading:', error);
        }

        toast({
          title: "Analysis Complete!",
          description: "Your aura has been successfully analyzed.",
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Something went wrong while analyzing your aura. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitReview = async () => {
    if (!currentAnalysisId || rating === 0) {
      toast({
        title: "Invalid Review",
        description: "Please provide a rating to submit your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await apiRequest(`/api/aura-readings/${currentAnalysisId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim() || undefined
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setReviewSubmitted(true);
      setShowReviewForm(false);
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast({
        title: "Review Failed",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
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

        {/* Upload section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Upload Your Photo
                  </CardTitle>
                  <CardDescription>
                    Choose a clear photo of yourself with good lighting for the most accurate aura analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload onImageUpload={handleImageUpload} />
                  
                  {isAnalyzing && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">{analysisStage}</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Results section */}
        {result && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-heading font-bold text-3xl mb-4">Your Aura Analysis</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Discover the energy patterns and spiritual insights revealed through your aura colors.
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="chakras">Chakras</TabsTrigger>
                    <TabsTrigger value="guidance">Guidance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="analysis" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: result.dominantColor }}
                          />
                          Dominant Aura Color: {result.dominantColor}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
                        
                        {result.secondaryColor && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: result.secondaryColor }}
                              />
                              Secondary Color: {result.secondaryColor}
                            </h4>
                            <p className="text-sm text-gray-600">
                              This secondary energy complements your dominant aura, adding depth to your spiritual profile.
                            </p>
                          </div>
                        )}

                        {result.energyLevel && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Energy Level</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={result.energyLevel} className="flex-grow" />
                              <span className="text-sm font-medium">{result.energyLevel}%</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {result.auraColorSpectrum && result.auraColorSpectrum.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Aura Color Spectrum</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {result.auraColorSpectrum.slice(0, 8).map((color, index) => (
                              <div key={index} className="text-center">
                                <div 
                                  className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-200"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-medium">{color}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{result.insights}</p>
                      </CardContent>
                    </Card>

                    {result.moodIndicators && result.moodIndicators.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Mood Indicators</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {result.moodIndicators.map((mood, index) => (
                              <Badge key={index} variant="secondary">{mood}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="chakras" className="space-y-6">
                    {result.chakraAnalysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Chakra Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">{result.chakraAnalysis}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="guidance" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personalized Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{result.recommendations}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Review Section */}
                {!reviewSubmitted && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Rate Your Experience
                      </CardTitle>
                      <CardDescription>
                        Help us improve by sharing your feedback on this aura analysis.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!showReviewForm ? (
                        <Button onClick={() => setShowReviewForm(true)}>
                          <Star className="w-4 h-4 mr-2" />
                          Leave a Review
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setRating(star)}
                                  className={`w-8 h-8 rounded ${
                                    star <= rating
                                      ? 'text-yellow-400 hover:text-yellow-500'
                                      : 'text-gray-300 hover:text-gray-400'
                                  }`}
                                >
                                  <Star className="w-full h-full fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                            <Textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Share your thoughts about this aura analysis..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={submitReview} disabled={isSubmittingReview || rating === 0}>
                              {isSubmittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Submit Review
                            </Button>
                            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {reviewSubmitted && (
                  <Card className="mt-8">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Thank you for your review!</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}