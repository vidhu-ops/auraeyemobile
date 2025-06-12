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

  // Submit review for aura analysis
  const submitReview = async () => {
    if (!currentAnalysisId || rating === 0) return;

    setIsSubmittingReview(true);
    try {
      await fetch(`/api/aura-readings/${currentAnalysisId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim() || undefined
        }),
      });

      setReviewSubmitted(true);
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback on this aura analysis.",
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Review submission failed",
        description: "We couldn't save your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Generate PDF report
  const generatePDF = async () => {
    if (!result) return;

    try {
      const element = document.getElementById('aura-reading-section');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`aura-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Generated!",
        description: "Your aura analysis report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to analyze your aura.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStage("Preparing image for analysis...");
    setResult(null);
    setReviewSubmitted(false);
    setRating(0);
    setReviewText("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setOriginalImage(base64);

        // Simulate progress stages
        const stages = [
          "Detecting energy fields...",
          "Analyzing color frequencies...",
          "Mapping chakra alignments...",
          "Processing aura layers...",
          "Generating insights...",
          "Finalizing analysis..."
        ];

        for (let i = 0; i < stages.length; i++) {
          setAnalysisStage(stages[i]);
          setAnalysisProgress((i + 1) * (100 / stages.length));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          const analysis = await analyzeAuraImage(base64);
          setResult(analysis);

          // Save to database
          const savedReading = await apiRequest('/api/aura-readings', {
            method: 'POST',
            body: {
              imageData: base64,
              dominantColor: analysis.dominantColor,
              secondaryColor: analysis.secondaryColor || analysis.dominantColor,
              analysis: analysis.interpretation,
              energyLevel: analysis.energyLevel || 75,
              chakraAnalysis: JSON.stringify(analysis.chakras || {}),
              colorMeanings: JSON.stringify(analysis.colorMeanings || {}),
              recommendations: analysis.guidance || "",
            }
          });

          setCurrentAnalysisId(savedReading.id);
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: "Unable to complete aura analysis. Please try again.",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Unable to process your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);

  const handleNumerologyAnalysis = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access numerology features.",
        variant: "destructive",
      });
      return;
    }

    try {
      const name = user.username;
      const birthDate = "1990-01-01"; // This would come from user profile
      
      const numerology = await calculateNumerology(name, birthDate);
      setNumerologyResult(numerology);
    } catch (error) {
      console.error('Numerology error:', error);
      toast({
        title: "Numerology analysis failed",
        description: "Unable to complete numerology analysis.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="relative">
            <AuraGlow className="absolute inset-0 -z-10" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Aura Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover the colors of your energy field through advanced AI analysis. 
              Upload your photo to reveal hidden insights about your spiritual essence.
            </p>
          </div>
        </section>

        {/* Analysis Section */}
        <section className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Side */}
            <div>
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Upload Your Photo
                  </CardTitle>
                  <CardDescription>
                    Choose a clear photo of yourself for the most accurate aura reading
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload 
                    onImageUpload={handleImageUpload}
                    disabled={isAnalyzing}
                  />
                  
                  {originalImage && (
                    <div className="mt-4">
                      <img 
                        src={originalImage} 
                        alt="Uploaded for analysis" 
                        className="w-full h-48 object-cover rounded-lg border border-purple-200"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Premium Features */}
              <div className="mt-6 space-y-4">
                <PremiumFeature
                  title="Enhanced Aura Visualization"
                  description="See your actual aura colors overlaid on your photo"
                  icon={<Crown className="w-5 h-5" />}
                  onClick={() => showPremiumModal("aura")}
                />
                
                <PremiumFeature
                  title="Numerology Integration"
                  description="Combine aura reading with numerology insights"
                  icon={<Zap className="w-5 h-5" />}
                  onClick={() => showPremiumModal("numerology")}
                />
              </div>
            </div>

            {/* Results Side */}
            <div>
              {isAnalyzing ? (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">Analyzing Your Aura</h3>
                    <Progress value={analysisProgress} className="w-64 mx-auto mb-4" />
                    
                    <div className="text-xs text-gray-500 italic">
                      {analysisStage}
                    </div>
                  </div>
                </Card>
              ) : result ? (
                <Card>
                  <CardContent className="p-7" id="aura-reading-section">
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid grid-cols-2 gap-3 w-full p-2 mb-8">
                        <TabsTrigger value="analysis" className="text-sm">Analysis</TabsTrigger>
                        <TabsTrigger value="energy-reading" className="text-sm">
                          Energy Reading
                          <span className="ml-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                          </span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="analysis">
                        <div className="space-y-6">
                          <div className="text-center mb-6">
                            <h3 className="font-medium text-xl mb-2">Your Aura Analysis</h3>
                            <p className="text-sm text-gray-600">
                              Detailed interpretation of your energy field and spiritual essence
                            </p>
                          </div>

                          {/* Dominant Color */}
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                            <div className="flex items-center gap-4 mb-4">
                              <div 
                                className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: result.dominantColor }}
                              ></div>
                              <div>
                                <h4 className="font-semibold text-lg">Dominant Color</h4>
                                <p className="text-sm text-gray-600 capitalize">{result.dominantColor}</p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {result.colorMeanings?.[result.dominantColor] || 
                               `Your dominant aura color ${result.dominantColor} represents your core energy signature.`}
                            </p>
                          </div>

                          {/* Secondary Color */}
                          {result.secondaryColor && result.secondaryColor !== result.dominantColor && (
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                              <div className="flex items-center gap-4 mb-4">
                                <div 
                                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                                  style={{ backgroundColor: result.secondaryColor }}
                                ></div>
                                <div>
                                  <h4 className="font-semibold text-lg">Secondary Color</h4>
                                  <p className="text-sm text-gray-600 capitalize">{result.secondaryColor}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed">
                                {result.colorMeanings?.[result.secondaryColor] || 
                                 `Your secondary color ${result.secondaryColor} adds depth to your energy profile.`}
                              </p>
                            </div>
                          )}

                          {/* Energy Level */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <h4 className="font-semibold text-lg mb-4 flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-green-600" />
                              Energy Level
                            </h4>
                            <div className="space-y-3">
                              <Progress value={result.energyLevel || 75} className="h-3" />
                              <p className="text-sm text-gray-600">
                                Current energy reading: <span className="font-semibold">{result.energyLevel || 75}%</span>
                              </p>
                            </div>
                          </div>

                          {/* Interpretation */}
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                            <h4 className="font-semibold text-lg mb-4">Spiritual Interpretation</h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {result.interpretation}
                            </p>
                          </div>

                          {/* Guidance */}
                          {result.guidance && (
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                              <h4 className="font-semibold text-lg mb-4">Personal Guidance</h4>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {result.guidance}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="energy-reading">
                        <div className="space-y-6">
                          <div className="text-center mb-6">
                            <h3 className="font-medium text-xl mb-2">Energy Map & Chakra Analysis</h3>
                            <p className="text-sm text-gray-600">
                              Complete breakdown of your energy centers and spiritual alignment
                            </p>
                          </div>

                          {/* Chakra Analysis */}
                          {result.chakras && Object.keys(result.chakras).length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg">Chakra Alignment</h4>
                              {Object.entries(result.chakras).map(([chakra, analysis]) => (
                                <div key={chakra} className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium capitalize">{chakra} Chakra</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {typeof analysis === 'object' && analysis.level ? analysis.level : 'Balanced'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {typeof analysis === 'string' ? analysis : 
                                     typeof analysis === 'object' && analysis.description ? analysis.description :
                                     `Your ${chakra} chakra shows signs of balanced energy flow.`}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Energy Visualization */}
                          <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-xl p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                            <div className="relative z-10">
                              <h4 className="font-semibold text-lg text-white mb-4">Energy Flow Visualization</h4>
                              <div className="flex items-center space-x-4">
                                <div 
                                  className="w-16 h-16 rounded-full shadow-2xl animate-pulse"
                                  style={{ 
                                    backgroundColor: result.dominantColor,
                                    boxShadow: `0 0 30px ${result.dominantColor}50`
                                  }}
                                ></div>
                                <div className="flex-1 h-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full opacity-60"></div>
                                <div 
                                  className="w-12 h-12 rounded-full shadow-xl animate-pulse"
                                  style={{ 
                                    backgroundColor: result.secondaryColor || result.dominantColor,
                                    boxShadow: `0 0 20px ${result.secondaryColor || result.dominantColor}50`
                                  }}
                                ></div>
                              </div>
                              <p className="text-white/80 text-sm mt-4">
                                Energy radiating from {result.dominantColor} core through {result.secondaryColor || result.dominantColor} pathways
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                      <Button
                        onClick={generatePDF}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={handleNumerologyAnalysis}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          size="sm"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Add Numerology
                        </Button>
                      </div>
                    </div>

                    {/* 5-Star Review System */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mt-8">
                      {reviewSubmitted ? (
                        <div className="text-center py-4">
                          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-lg text-green-800 mb-2">Review Submitted!</h4>
                          <p className="text-green-700">Thank you for your feedback. Your review helps us improve our aura analysis experience.</p>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-lg mb-4 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-amber-500" />
                            Rate Your Aura Analysis Experience
                          </h4>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-700 mb-3">How accurate and helpful was your aura reading?</p>
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
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Share your thoughts (optional)
                              </label>
                              <Textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Tell us about your experience with this aura analysis..."
                                className="min-h-[80px] resize-none"
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRating(0);
                                  setReviewText("");
                                }}
                              >
                                Clear
                              </Button>
                              <Button
                                onClick={submitReview}
                                disabled={rating === 0 || isSubmittingReview}
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                size="sm"
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
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center bg-white/50 border-dashed border-2">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-30"></div>
                    <p className="text-gray-600">Upload your photo to see your aura analysis</p>
                    <p className="text-gray-500 text-sm mt-2">Your reading will be private and secure</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </section>
        
        {/* Aura Color Guide Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Aura Color Meanings</CardTitle>
              <CardDescription className="text-center">
                Understanding the significance of different aura colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { color: "#FF6B6B", name: "Red", meaning: "Passion, strength, vitality, and leadership energy" },
                  { color: "#4ECDC4", name: "Turquoise", meaning: "Healing abilities, compassion, and emotional balance" },
                  { color: "#45B7D1", name: "Blue", meaning: "Communication, truth, and spiritual awareness" },
                  { color: "#96CEB4", name: "Green", meaning: "Growth, healing, and connection with nature" },
                  { color: "#FFEAA7", name: "Yellow", meaning: "Optimism, creativity, and intellectual pursuits" },
                  { color: "#DDA0DD", name: "Purple", meaning: "Intuition, spirituality, and psychic abilities" },
                  { color: "#FFB3E6", name: "Pink", meaning: "Love, compassion, and nurturing energy" },
                  { color: "#C0C0C0", name: "Silver", meaning: "Intuition, dreams, and connection to higher realms" }
                ].map((aura, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: aura.color }}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-lg">{aura.name}</h4>
                      <p className="text-sm text-gray-600">{aura.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}