import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Download, Upload, Eye, Heart, Brain, Zap, Shield, Camera, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AuraAnalysisResult {
  dominantColor: string;
  secondaryColor?: string;
  energyLevel: number;
  spiritualInsights: string;
  colorMeanings: {
    positive: string;
    negative: string;
  };
  chakras: {
    [key: string]: number;
  };
  recommendations: string[];
  detailedAnalysis: string;
  auraStrength: number;
  energyBalance: number;
  spiritualGrowth: string;
}

interface NumerologyResult {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  interpretation: string;
  chakraConnections: {
    [key: string]: number;
  };
}

export default function AuraAnalysis() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [numerologyName, setNumerologyName] = useState('');
  const [numerologyBirthDate, setNumerologyBirthDate] = useState('');
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { toast } = useToast();

  // Color mappings for accurate aura colors
  const auraColorMeanings = {
    red: {
      positive: "Passionate, strong-willed, energetic, courageous, confident",
      negative: "Aggressive, impatient, quick-tempered, stress-prone"
    },
    orange: {
      positive: "Creative, enthusiastic, social, optimistic, adventurous",
      negative: "Attention-seeking, scattered energy, emotional instability"
    },
    yellow: {
      positive: "Intelligent, cheerful, confident, analytical, inspiring",
      negative: "Overly critical, perfectionist, anxiety-prone, judgmental"
    },
    green: {
      positive: "Healing, loving, nurturing, balanced, growth-oriented",
      negative: "Jealous, possessive, self-doubt, fear of change"
    },
    blue: {
      positive: "Calm, intuitive, spiritual, honest, loyal",
      negative: "Melancholic, overly emotional, escapist tendencies"
    },
    indigo: {
      positive: "Psychic, intuitive, deep thinker, spiritual seeker",
      negative: "Overly serious, judgmental, difficulty with reality"
    },
    violet: {
      positive: "Spiritual, intuitive, artistic, visionary, magical",
      negative: "Impractical, superiority complex, disconnected from reality"
    },
    purple: {
      positive: "Spiritual, intuitive, artistic, visionary, magical",
      negative: "Impractical, superiority complex, disconnected from reality"
    },
    pink: {
      positive: "Loving, compassionate, artistic, gentle, romantic",
      negative: "Immature, unrealistic expectations, emotional dependency"
    },
    turquoise: {
      positive: "Healing ability, spiritual teacher, natural therapist",
      negative: "Emotional overwhelm, difficulty setting boundaries"
    },
    white: {
      positive: "Pure, spiritual, protective, enlightened, truth-seeking",
      negative: "Unrealistic, perfectionist, disconnected from emotions"
    },
    gold: {
      positive: "Divine protection, spiritual teacher, enlightened being",
      negative: "Spiritual pride, superiority complex, ego inflation"
    },
    silver: {
      positive: "Intuitive, psychic, receptive, nurturing, feminine energy",
      negative: "Overly sensitive, moody, unstable emotions"
    },
    brown: {
      positive: "Grounded, practical, reliable, hard-working, stable",
      negative: "Materialistic, stubborn, fear-based, low self-esteem"
    },
    black: {
      positive: "Protective, grounding, mysterious, transformative",
      negative: "Negative energy, depression, illness, unforgiving"
    },
    gray: {
      positive: "Neutral, balanced, diplomatic, adaptable",
      negative: "Indecisive, dull, lacking energy, depression"
    }
  };

  const getAccurateColorCode = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#DC2626',
      orange: '#EA580C',
      yellow: '#FACC15',
      green: '#16A34A',
      blue: '#2563EB',
      indigo: '#4F46E5',
      violet: '#7C3AED',
      purple: '#7C3AED',
      pink: '#EC4899',
      turquoise: '#06B6D4',
      white: '#F8FAFC',
      gold: '#F59E0B',
      silver: '#94A3B8',
      brown: '#A16207',
      black: '#1F2937',
      gray: '#6B7280'
    };
    return colorMap[colorName.toLowerCase()] || '#6B7280';
  };

  const getColorClass = (colorName: string): string => {
    return getAccurateColorCode(colorName);
  };

  const getReceivingEnergyColor = (auraData: AuraAnalysisResult): string => {
    // Dynamic color based on environmental interactions
    if (auraData.energyLevel > 80) return 'gold';
    if (auraData.energyBalance > 75) return 'turquoise';
    if (auraData.chakras.heart > 80) return 'green';
    return auraData.secondaryColor || 'blue';
  };

  const getGivingEnergyColor = (auraData: AuraAnalysisResult): string => {
    // Dynamic color based on life patterns and giving energy
    if (auraData.chakras.solar > 85) return 'yellow';
    if (auraData.chakras.throat > 80) return 'blue';
    if (auraData.auraStrength > 85) return 'orange';
    return auraData.dominantColor;
  };

  const getPersonalityColor = (auraData: AuraAnalysisResult): string => {
    // Static personality color - why things happen to you
    return auraData.dominantColor;
  };

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/aura-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      setOriginalImage(data.originalImage);
      setProcessedImage(data.processedImage);
      setResult(data.auraData);
      setActiveTab('overview');
      
      toast({
        title: "Analysis complete!",
        description: "Your aura has been successfully analyzed.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageSelect(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const calculateNumerologyData = async (name: string, birthDate: string) => {
    if (!name || !birthDate) return;
    
    setIsCalculatingNumerology(true);
    try {
      const response = await fetch('/api/numerology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, birthDate }),
      });

      if (!response.ok) {
        throw new Error('Numerology calculation failed');
      }

      const data = await response.json();
      setNumerologyResult(data);
      setActiveTab('combined');
      
      toast({
        title: "Numerology calculated!",
        description: "Your enhanced spiritual reading is ready.",
      });
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingNumerology(false);
    }
  };

  const getCombinedInsights = (aura: AuraAnalysisResult, numerology: NumerologyResult) => {
    if (!numerology) return null;
    
    return {
      dominantColor: aura.dominantColor,
      lifePath: numerology.lifePath,
      destiny: numerology.destiny,
      spiritualGuidance: `Your ${aura.dominantColor} aura combined with Life Path ${numerology.lifePath} reveals a soul focused on ${aura.spiritualInsights}. This powerful combination suggests you're meant to heal and inspire others through your unique energy signature.`,
      strengths: `Natural ${aura.dominantColor} energy amplifies your Life Path ${numerology.lifePath} gifts, creating exceptional abilities in spiritual healing and intuitive guidance.`,
      challenges: `Balance your intense ${aura.dominantColor} energy with your Destiny number ${numerology.destiny} calling to avoid spiritual overwhelm and maintain grounded presence.`,
      recommendedCrystals: [
        { name: 'Amethyst', purpose: 'Spiritual clarity', emoji: '🔮' },
        { name: 'Clear Quartz', purpose: 'Energy amplification', emoji: '💎' },
        { name: 'Rose Quartz', purpose: 'Heart healing', emoji: '💗' }
      ],
      practices: {
        morning: `Begin each day with ${aura.dominantColor} visualization and Life Path ${numerology.lifePath} affirmations`,
        affirmation: `I embrace my ${aura.dominantColor} energy and fulfill my destiny as a spiritual healer`,
        evening: `Reflect on how you shared your ${aura.dominantColor} gifts today`,
        additional: [
          { name: 'Meditation', description: 'Daily energy alignment', emoji: '🧘' },
          { name: 'Journaling', description: 'Track spiritual growth', emoji: '📝' },
          { name: 'Crystal work', description: 'Amplify healing energy', emoji: '✨' }
        ]
      }
    };
  };

  const submitReview = async (auraReadingId: number, rating: number, reviewText?: string) => {
    setIsSubmittingReview(true);
    try {
      const response = await fetch(`/api/aura-readings/${auraReadingId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, reviewText }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setReviewSubmitted(true);
      setRating(0);
      setReviewText('');
      
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
    } catch (error) {
      toast({
        title: "Review failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI-Powered Aura Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your spiritual energy through advanced AI technology. Upload your photo to receive personalized insights about your aura colors, chakra alignment, and spiritual guidance.
          </p>
        </div>

        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload/Display */}
              <div className="space-y-6">
                {!originalImage ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl animate-pulse">
                          <Camera />
                        </div>
                        <p className="text-lg font-medium text-gray-700">Analyzing your aura...</p>
                        <Progress value={60} className="w-64 mx-auto" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                          <Upload />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            {isDragActive ? 'Drop your photo here...' : 'Upload Your Photo'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Drag & drop or click to select • JPG, PNG up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={processedImage || originalImage} 
                        alt="Your aura analysis" 
                        className="w-full rounded-xl shadow-lg"
                      />
                      {processedImage && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Enhanced
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOriginalImage(null);
                          setProcessedImage(null);
                          setResult(null);
                          setNumerologyResult(null);
                        }}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        New Analysis
                      </Button>
                      {processedImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = processedImage;
                            link.download = 'aura-analysis.png';
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              <div>
                {result ? (
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="chakras">Chakras</TabsTrigger>
                          <TabsTrigger value="energy-map">Energy Map</TabsTrigger>
                          <TabsTrigger value="combined">Enhanced</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-6 mt-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Aura Reading</h3>
                            <div className="flex justify-center items-center space-x-4 mb-4">
                              <div 
                                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                                style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                              ></div>
                              <div className="text-left">
                                <p className="font-semibold text-lg capitalize">{result.dominantColor}</p>
                                <p className="text-sm text-gray-600">Dominant Color</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                              <h4 className="font-semibold text-green-800 mb-2">Positive Aspects</h4>
                              <p className="text-sm text-green-700">
                                {auraColorMeanings[result.dominantColor as keyof typeof auraColorMeanings]?.positive || 'Spiritual and intuitive energy'}
                              </p>
                            </div>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                              <h4 className="font-semibold text-orange-800 mb-2">Growth Areas</h4>
                              <p className="text-sm text-orange-700">
                                {auraColorMeanings[result.dominantColor as keyof typeof auraColorMeanings]?.negative || 'Areas for spiritual development'}
                              </p>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-800 mb-2">Spiritual Insights</h4>
                              <p className="text-sm text-blue-700">{result.spiritualInsights}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">{result.energyLevel}%</div>
                              <p className="text-sm text-gray-600">Energy Level</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-indigo-600">{result.auraStrength}%</div>
                              <p className="text-sm text-gray-600">Aura Strength</p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="chakras" className="space-y-6 mt-6">
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Chakra Analysis</h3>
                            <p className="text-sm text-gray-600">Energy centers aligned with your aura</p>
                          </div>

                          <div className="space-y-4">
                            {Object.entries(result.chakras).map(([chakra, level]) => (
                              <div key={chakra} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium capitalize">{chakra}</span>
                                  <span className="text-sm text-gray-600">{level}%</span>
                                </div>
                                <Progress value={level} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="energy-map" className="space-y-6 mt-6">
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">4-Zone Energy Map</h3>
                            <p className="text-sm text-gray-600">Complete breakdown of your energy zones</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                              <div className="flex items-center space-x-3 mb-3">
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                                  style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                                ></div>
                                <div>
                                  <h4 className="font-semibold">Crown Energy</h4>
                                  <p className="text-xs text-gray-600">How you think</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                Your {result.dominantColor} crown energy reveals {result.dominantColor === 'purple' ? 'spiritual wisdom and intuitive thinking' : 'focused mental patterns and clear decision-making'}.
                              </p>
                            </div>

                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                              <div className="flex items-center space-x-3 mb-3">
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                                  style={{ backgroundColor: getAccurateColorCode(getReceivingEnergyColor(result)) }}
                                ></div>
                                <div>
                                  <h4 className="font-semibold">Receiving Energy</h4>
                                  <p className="text-xs text-gray-600">From environment</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                You naturally receive {getReceivingEnergyColor(result)} energy from your surroundings, indicating openness to healing and positive influences.
                              </p>
                            </div>

                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                              <div className="flex items-center space-x-3 mb-3">
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                                  style={{ backgroundColor: getAccurateColorCode(getGivingEnergyColor(result)) }}
                                ></div>
                                <div>
                                  <h4 className="font-semibold">Giving Energy</h4>
                                  <p className="text-xs text-gray-600">Life patterns</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                Your {getGivingEnergyColor(result)} giving energy shows how you create and influence your life experiences through dynamic energy flow.
                              </p>
                            </div>

                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                              <div className="flex items-center space-x-3 mb-3">
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                                  style={{ backgroundColor: getAccurateColorCode(getPersonalityColor(result)) }}
                                ></div>
                                <div>
                                  <h4 className="font-semibold">Personality Color</h4>
                                  <p className="text-xs text-gray-600">Core essence</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                Your {getPersonalityColor(result)} personality color represents your stable core essence and explains why certain experiences are drawn to you.
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="combined" className="space-y-6 mt-6">
                          {!numerologyResult ? (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                              <div className="text-center mb-6">
                                <h3 className="font-medium text-lg mb-2">Enhanced Aura & Numerology Integration</h3>
                                <p className="text-sm text-gray-600">
                                  Unlock deeper spiritual insights by combining your aura colors with numerological analysis
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                  <input
                                    type="text"
                                    value={numerologyName}
                                    onChange={(e) => setNumerologyName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                                  <input
                                    type="date"
                                    value={numerologyBirthDate}
                                    onChange={(e) => setNumerologyBirthDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                </div>
                                
                                <Button
                                  onClick={() => calculateNumerologyData(numerologyName, numerologyBirthDate)}
                                  disabled={!numerologyName || !numerologyBirthDate || isCalculatingNumerology}
                                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                >
                                  {isCalculatingNumerology ? 'Calculating...' : 'Calculate Enhanced Reading'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                                <h3 className="text-xl font-bold text-center mb-6 text-indigo-800">
                                  Complete Spiritual Analysis
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                                      <span className="mr-2">🎨</span> Aura Profile
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center space-x-3">
                                        <div 
                                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                                          style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                                        ></div>
                                        <div>
                                          <p className="font-medium text-sm">{result.dominantColor}</p>
                                          <p className="text-xs text-gray-600">Dominant Energy</p>
                                        </div>
                                      </div>
                                      {result.secondaryColor && (
                                        <div className="flex items-center space-x-3">
                                          <div 
                                            className="w-8 h-8 rounded-full border-2 border-gray-200"
                                            style={{ backgroundColor: getAccurateColorCode(result.secondaryColor) }}
                                          ></div>
                                          <div>
                                            <p className="font-medium text-sm">{result.secondaryColor}</p>
                                            <p className="text-xs text-gray-600">Supporting Energy</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                                      <span className="mr-2">🔢</span> Numerology Profile
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="text-center">
                                        <div 
                                          className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-bold"
                                          style={{ backgroundColor: getColorClass(result.dominantColor) }}
                                        >
                                          {numerologyResult.lifePath}
                                        </div>
                                        <p className="text-xs text-gray-600">Life Path</p>
                                      </div>
                                      <div className="text-center">
                                        <div 
                                          className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-bold"
                                          style={{ backgroundColor: getColorClass(result.dominantColor) }}
                                        >
                                          {numerologyResult.destiny}
                                        </div>
                                        <p className="text-xs text-gray-600">Destiny</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {getCombinedInsights(result, numerologyResult) && (
                                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-5">
                                    <h4 className="font-bold text-lg mb-3 text-center text-purple-800">
                                      Integrated Spiritual Insights
                                    </h4>
                                    <div 
                                      className="rounded-lg p-4 text-white mb-4"
                                      style={{ backgroundColor: getColorClass(result.dominantColor) }}
                                    >
                                      <p className="text-sm leading-relaxed">
                                        {getCombinedInsights(result, numerologyResult)?.spiritualGuidance}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
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
          </div>
        </section>

        {/* Review Section */}
        {result && !reviewSubmitted && (
          <section className="py-12 bg-white rounded-xl shadow-sm mb-12">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Rate Your Reading</h3>
                <p className="text-gray-600 mb-6">How accurate was your aura analysis?</p>
                
                <div className="space-y-6">
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRating(star)}
                        className={`p-2 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </Button>
                    ))}
                  </div>
                  
                  <div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      if (rating > 0) {
                        setReviewSubmitted(true);
                        setRating(0);
                        setReviewText('');
                        toast({
                          title: "Thank you!",
                          description: "Your feedback helps us improve our readings.",
                        });
                      }
                    }}
                    disabled={rating === 0 || isSubmittingReview}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Aura Color Guide Section */}
        <section className="py-12 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Understanding Aura Colors</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover the meanings behind the colors in your aura and how they reflect your spiritual energy
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(auraColorMeanings).map(([color, meaning]) => (
                <div key={color} className="bg-white rounded-lg p-6 shadow-md border">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: getAccurateColorCode(color) }}
                    ></div>
                    <h3 className="font-semibold text-lg capitalize">{color}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-green-700 mb-1">Positive Aspects</h4>
                      <p className="text-sm text-gray-600">{meaning.positive}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-700 mb-1">Growth Areas</h4>
                      <p className="text-sm text-gray-600">{meaning.negative}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}