import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Sparkles, Zap, Eye, CheckCircle, AlertTriangle, Play, BookOpen, Upload, RotateCcw, X } from "lucide-react";
import ImageUpload from "@/components/forms/image-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { PremiumContentVideoModal } from "@/components/PremiumContentVideoModal";
import { useBadgeContext } from "@/hooks/use-badge-context";
import logoImage from "@assets/new-logo.jpeg";
import meditationVideo from "@assets/WhatsApp Video 2025-08-11 at 3.45.29 AM_1755201271313.mp4";
import demoPdfReport from "@assets/AURA & CHAKRA ALIGNMENT REPORT Client jhon doe Report created by healer Analysis Date 01301000_1764454162994.pdf";

interface VibeResult {
  dominantColor: string;
  colorMeaning: {
    positive: string[];
    negative: string[];
    remedy: string;
  };
  energyLevel: number;
  message: string;
  readingId: number | null;
}

// Color to Hex mapping
const colorToHex: { [key: string]: string } = {
  'Red': '#FF6B6B',
  'Orange': '#FFA500',
  'Yellow': '#FFD700',
  'Green': '#6BB66B',
  'Blue': '#4A90E2',
  'Indigo': '#4B0082',
  'Violet': '#EE82EE',
  'White': '#FFFFFF',
  'Brown': '#8B4513',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Black': '#000000',
  'Pink': '#FF69B4',
};

const getColorHex = (colorName: string): string => {
  return colorToHex[colorName] || '#4A90E2';
};

export default function VibePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { checkBadges, showBadges } = useBadgeContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vibeResult, setVibeResult] = useState<VibeResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showPremiumVideo, setShowPremiumVideo] = useState(false);
  const [showMeditationVideo, setShowMeditationVideo] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showPostMeditationOptions, setShowPostMeditationOptions] = useState(false);
  const [showPremiumPdf, setShowPremiumPdf] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze your vibe');
      }
      
      const data = await response.json();
      
      setVibeResult({
        dominantColor: data.dominantColor,
        colorMeaning: data.colorMeaning,
        energyLevel: data.energyLevel,
        message: data.message,
        readingId: data.readingId
      });
      
      // Save last scan color for mascot
      localStorage.setItem("lastAuraColor", data.dominantColor);
      
      toast({
        title: "Vibe analysis complete!",
        description: `Your dominant vibe is ${data.dominantColor}`,
      });
      
      // Invalidate queries to refresh vibe readings and achievements
      queryClient.invalidateQueries({ queryKey: ['/api/vibe-readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/badge-progress'] });
      
      // Show badges if they came in the response, otherwise check for new badges
      if (data.newBadges && data.newBadges.length > 0) {
        showBadges(data.newBadges);
      } else {
        // Check for new badges as fallback
        await checkBadges();
      }
    } catch (error: any) {
      // Reset image preview on error so user can try again
      setImagePreview(null);
      
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
    setUserFeedback(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h2 className="text-2xl font-bold mb-2">What's My Vibe?</h2>
            <p className="text-gray-200 mb-4">Please log in to discover your dominant energy</p>
            <Link href="/auth">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vibeResult) {
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <Navbar />
        
        {/* Hero Section */}
        <div className="flex-grow bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Your Energy, Made Visible
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">
                <span className="text-yellow-400">Scan</span>
                <span className="text-white"> . </span>
                <span className="text-cyan-400">Heal</span>
                <span className="text-white"> . </span>
                <span className="text-green-400">Transform</span>
              </h2>
              <p className="text-lg md:text-xl text-cyan-100 mb-12 max-w-2xl mx-auto">
                Unlock the power of your personal energy field with aura readings, personalized spiritual guidance, and healing practices.
              </p>

              {/* Service Buttons */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/aura-analysis">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-full text-lg shadow-lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Human Aura & Chakra Analysis
                  </Button>
                </Link>
                
                <Link href="/object-analysis">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 rounded-full text-lg shadow-lg">
                    <Eye className="mr-2 h-5 w-5" />
                    Object & Space Aura Analysis
                  </Button>
                </Link>
                
                <Button 
                  onClick={() => document.getElementById('vibe-upload')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-6 rounded-full text-lg shadow-lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  What's My Vibe!
                </Button>
              </div>

              {/* Upload Section */}
              <div id="vibe-upload" className="mt-16">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <Sparkles className="h-8 w-8 text-yellow-400" />
                      <h3 className="text-2xl font-bold text-white">Quick Vibe Check</h3>
                    </div>
                    
                    <p className="text-cyan-100 mb-6">
                      Upload your photo to discover your dominant energy color
                    </p>

                    <div className="max-w-md mx-auto">
                      <ImageUpload
                        onImageSelect={handleImageSelect}
                        isLoading={isAnalyzing}
                      />
                    </div>

                    {isAnalyzing && (
                      <div className="text-center py-8 mt-4">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        <p className="mt-4 text-white">Analyzing your vibe...</p>
                      </div>
                    )}

                    <div className="mt-6 bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4">
                      <p className="text-sm text-yellow-100">
                        <strong>Quick Check:</strong> 1 credit • For comprehensive analysis with detailed chakra insights, try Human Aura Analysis (15 credits)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <MobileNavigation />
      </div>
    );
  }

  // Result view
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gradient-to-br from-slate-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black">
              Your Vibe: <span style={{ color: vibeResult.dominantColor.toLowerCase() }}>{vibeResult.dominantColor}</span>
            </h1>
            <p className="text-lg text-purple-600 font-medium">{vibeResult.message}</p>
            <div className="mt-4 text-sm text-slate-600">
              <p>Today's Scan: 1/1</p>
              <p>Next free scan in 30 days</p>
              <p className="text-purple-600">Upgrade for daily scans</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Image */}
            <div className="flex justify-center items-start">
              {imagePreview && vibeResult && (
                <div className="relative inline-block">
                  <div className="relative max-w-sm">
                    <img 
                      src={imagePreview} 
                      alt="Your vibe" 
                      className="rounded-lg shadow-lg block w-full"
                    />
                    {/* Colored overlay based on vibe */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-40 pointer-events-none"
                      style={{
                        backgroundColor: getColorHex(vibeResult.dominantColor),
                        mixBlendMode: 'screen'
                      }}
                    />
                    {/* Glowing border effect */}
                    <div 
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        boxShadow: `0 0 40px ${getColorHex(vibeResult.dominantColor)}, inset 0 0 20px ${getColorHex(vibeResult.dominantColor)}40`,
                        border: `2px solid ${getColorHex(vibeResult.dominantColor)}80`
                      }}
                    />
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded font-semibold text-sm tracking-wider">
                    AuraEye
                  </div>
                </div>
              )}
            </div>

            {/* Analysis */}
            <div className="space-y-4">
              {/* Positive Section */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Positive Traits</h3>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-3">What's bright right now</h4>
                  <ul className="space-y-2">
                    {vibeResult.colorMeaning.positive.map((trait, idx) => (
                      <li key={idx} className="text-green-700 text-sm flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Negative/Balance Section */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-900">Areas to Balance</h3>
                  </div>
                  <h4 className="font-semibold text-orange-800 mb-3">What needs grounding</h4>
                  <ul className="space-y-2">
                    {vibeResult.colorMeaning.negative.map((trait, idx) => (
                      <li key={idx} className="text-orange-700 text-sm flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Remedy Section */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Remedy & Guidance</h3>
                  </div>
                  <p className="text-blue-700 text-sm leading-relaxed">{vibeResult.colorMeaning.remedy}</p>
                </CardContent>
              </Card>

              {/* Premium Content */}
              <Card className="border-slate-300 bg-slate-100">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-900">Premium Content</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Upgrade to unlock detailed insights
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Watch the video to get a glimpse of the report. This video is just a small part of the provided detailed report
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button 
                      onClick={() => setShowPremiumVideo(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch Now
                    </Button>
                    <Button 
                      onClick={() => setShowPremiumPdf(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      See Demo Premium Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feedback Section */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-blue-900 mb-2">Which do you relate to more?</h3>
              <p className="text-sm text-blue-700 mb-4">Your feedback helps us improve our spiritual analysis accuracy.</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => {
                    setUserFeedback('positive');
                    setShowThankYou(true);
                  }}
                  variant={userFeedback === 'positive' ? 'default' : 'outline'}
                  className={userFeedback === 'positive' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600'}
                >
                  Positive
                </Button>
                <Button 
                  onClick={() => {
                    setUserFeedback('negative');
                    setShowMeditationVideo(true);
                  }}
                  variant={userFeedback === 'negative' ? 'default' : 'outline'}
                  className={userFeedback === 'negative' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600'}
                >
                  Negative
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link href="/aura-analysis" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6">
                Get Full Analysis
              </Button>
            </Link>
            
            <Link href="/journal" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
                <BookOpen className="mr-2 h-4 w-4" />
                Journal with us
              </Button>
            </Link>
            
            <Button onClick={resetAnalysis} variant="outline" className="w-full py-6 bg-green-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Another Photo
            </Button>
          </div>

          {/* Upgrade Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Connect to Healer */}
            <Card className="border-cyan-300 bg-gradient-to-br from-cyan-50 to-teal-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-cyan-900 mb-2">Connect to a Healer</h3>
                <p className="text-sm text-cyan-700 mb-4">
                  Unlock live full report via a certified healer • Costs 1 credit
                </p>
                <Link href="/healers">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Book Now
                  </Button>
                </Link>
                <p className="text-xs text-cyan-600 mt-3 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Watermark on all reports (anti-abuse)
                </p>
              </CardContent>
            </Card>

            {/* Professional Healer Dashboard */}
            <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-purple-900 mb-2">Upgrade to Professional Healer Dashboard</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Full Aura + Chakra Numerology + Weekly Plan + Daily Scans + talent management
                </p>
                <Link href="/pricing">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3">
                    Upgrade Now
                  </Button>
                </Link>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  One-tap connection or upgrade
                </p>
              </CardContent>
            </Card>

            {/* Elite Healer Dashboard */}
            <Card className="border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-pink-900 mb-2">Upgrade to Elite Healer Dashboard</h3>
                <p className="text-sm text-pink-700 mb-4">
                  Everything in Pro + Object 1st Scans + Professional listing + Recommended against in our list of healers
                </p>
                <Link href="/pricing">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white mb-3">
                    Upgrade Elite
                  </Button>
                </Link>
                <p className="text-xs text-pink-600 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Bonus: 3 object scans on first upgrade
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="grid md:grid-cols-4 gap-4 text-center text-sm text-slate-600">
            <div>
              <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p>Watermark on all reports</p>
            </div>
            <div>
              <Zap className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <p>One-tap connection or upgrade</p>
            </div>
            <div>
              <Zap className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p>Bonus: 3 object scans on first upgrade</p>
            </div>
            <div>
              <Zap className="h-5 w-5 mx-auto mb-1 text-slate-500" />
              <p>Priority support for paid plans</p>
            </div>
          </div>
        </div>
      </div>
      
      
      <MobileNavigation />
      
      {/* Premium Video Modal */}
      <PremiumContentVideoModal 
        isOpen={showPremiumVideo} 
        onClose={() => setShowPremiumVideo(false)} 
      />
      
      {/* Meditation Video Modal */}
      {showMeditationVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-black">Meditation Guide</h2>
              <button
                onClick={() => {
                  setShowMeditationVideo(false);
                  setShowPostMeditationOptions(true);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full rounded-lg"
                onEnded={() => {
                  setShowMeditationVideo(false);
                  setShowPostMeditationOptions(true);
                }}
              >
                <source src={meditationVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
      
      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="mb-4 text-4xl">🙏</div>
            <h2 className="text-2xl font-bold text-black mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your feedback helps us improve your spiritual journey. We appreciate you!</p>
            <Button 
              onClick={() => {
                setShowThankYou(false);
                resetAnalysis();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Try Another Scan
            </Button>
          </div>
        </div>
      )}
      
      {/* Post-Meditation Options Modal */}
      {showPostMeditationOptions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4">How are you feeling?</h2>
            <p className="text-gray-600 mb-6">Would you like to continue with another vibe scan or journal about your experience?</p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  setShowPostMeditationOptions(false);
                  resetAnalysis();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap className="mr-2 h-4 w-4" />
                Take Another Vibe Scan
              </Button>
              <Link href="/journal" className="w-full">
                <Button 
                  onClick={() => setShowPostMeditationOptions(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Journal About It
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Premium PDF Report Modal */}
      {showPremiumPdf && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPremiumPdf(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={demoPdfReport}
              className="w-full h-full rounded-lg"
              title="Premium Aura & Chakra Analysis Report"
            />
          </div>
        </div>
      )}
    </div>
  );
}
