import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, Zap, ArrowLeft } from "lucide-react";
import ImageUpload from "@/components/forms/image-upload";
import { apiRequest } from "@/lib/queryClient";

export default function VibePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vibeResult, setVibeResult] = useState<{ color: string; description: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use this feature",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('analysisType', 'quick-vibe');

      const response = await apiRequest('POST', '/api/quick-vibe', formData);
      const data = await response.json();
      
      setVibeResult({
        color: data.dominantColor,
        description: data.description
      });
      
      toast({
        title: "Vibe analysis complete!",
        description: `Your dominant vibe is ${data.dominantColor}`,
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze your vibe",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setVibeResult(null);
    setImagePreview(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h2 className="text-2xl font-bold mb-2">What's My Vibe?</h2>
            <p className="text-slate-600 mb-4">Please log in to discover your dominant energy</p>
            <Link href="/auth">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">What's My Vibe?</h1>
            <p className="text-sm text-purple-100">Quick aura color reading - 1 credit</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!vibeResult ? (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-purple-600" />
                Discover Your Dominant Energy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-2">How it works:</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                    <span>Upload a clear photo of yourself</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                    <span>Our AI analyzes your energy patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                    <span>Get instant insight into your dominant aura color</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  isLoading={isAnalyzing}
                />
                
                {isAnalyzing && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-slate-600">Analyzing your vibe...</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This is a quick analysis for 1 credit. For a comprehensive aura reading with detailed chakra analysis, try our full Aura Analysis (15 credits).
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Your Vibe Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {imagePreview && (
                <div className="flex justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Your photo" 
                    className="max-w-xs rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-purple-900 mb-2">
                  Your Dominant Vibe: <span className="text-3xl">{vibeResult.color}</span>
                </h3>
                <p className="text-slate-700 mt-4">{vibeResult.description}</p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={resetAnalysis}
                  variant="outline"
                  className="flex-1"
                >
                  Analyze Again
                </Button>
                <Link href="/aura-analysis" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    Get Full Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
