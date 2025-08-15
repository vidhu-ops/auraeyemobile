import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ImageUpload from "@/components/forms/image-upload";
import NameInput from "@/components/forms/name-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeAuraImage, AuraAnalysisResult } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AuraAnalysisPage() {
  const [nameEntered, setNameEntered] = useState(false);
  const [analysisName, setAnalysisName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    if (!analysisName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const analysisResult = await analyzeAuraImage(base64, analysisName);
      setResult(analysisResult);
      toast({
        title: "Analysis Complete",
        description: "Your aura analysis is ready!"
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your aura. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white py-16">
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
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Name input */}
                {!nameEntered ? (
                  <div className="flex justify-center">
                    <NameInput
                      onNameSubmit={(name) => {
                        setAnalysisName(name);
                        setNameEntered(true);
                      }}
                      title="Enter Your Name"
                      description="Please provide your name to begin the aura analysis."
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <>
                    {/* Upload section */}
                    <div>
                      <h2 className="font-heading font-semibold text-xl mb-4">Upload Your Photo</h2>
                      <p className="text-sm text-gray-600 mb-4">Analysis for: <span className="font-medium">{analysisName}</span></p>
                      <ImageUpload onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
                    </div>
                    
                    {/* Results section */}
                    {result && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Aura Reading</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">Dominant Colors</h3>
                              <p className="text-gray-700">{result.dominantColor}</p>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold mb-2">Energy Level</h3>
                              <p className="text-gray-700">Level: {result.energyLevel}/10</p>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold mb-2">Spiritual Guidance</h3>
                              <p className="text-gray-700">{result.spiritualGuidance}</p>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold mb-2">Detailed Analysis</h3>
                              <p className="text-gray-700">{result.detailedAnalysis}</p>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold mb-2">Personality Traits</h3>
                              <p className="text-gray-700">{result.personalityTraits?.join(', ')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Loading state */}
                    {isAnalyzing && (
                      <Card>
                        <CardContent className="p-8">
                          <div className="flex items-center justify-center space-x-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing your aura...</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Placeholder when no result */}
                    {!result && !isAnalyzing && (
                      <Card className="h-64 flex items-center justify-center bg-gray-50 border-dashed border-2">
                        <div className="text-center p-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-30"></div>
                          <p className="text-gray-600">Upload your photo to see your aura analysis</p>
                          <p className="text-gray-500 text-sm mt-2">Your reading will be private and secure</p>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}