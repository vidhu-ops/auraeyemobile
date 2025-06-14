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
import { Loader2, Crown, Sparkles, Zap, Download, Star, MessageSquare, CheckCircle2, Palette } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Color code mapping function
const getAccurateColorCode = (colorName: string): string => {
  const colorCodes: Record<string, string> = {
    'red': '#FF0000', 'Red': '#FF0000',
    'orange': '#FFA500', 'Orange': '#FFA500',
    'yellow': '#FFFF00', 'Yellow': '#FFFF00',
    'green': '#00FF00', 'Green': '#00FF00',
    'blue': '#0000FF', 'Blue': '#0000FF',
    'purple': '#800080', 'Purple': '#800080',
    'pink': '#FFC0CB', 'Pink': '#FFC0CB',
    'white': '#FFFFFF', 'White': '#FFFFFF',
    'black': '#000000', 'Black': '#000000',
    'silver': '#C0C0C0', 'Silver': '#C0C0C0',
    'gold': '#FFD700', 'Gold': '#FFD700',
    'lime': '#32CD32', 'Lime': '#32CD32',
    'turquoise': '#40E0D0', 'Turquoise': '#40E0D0',
    'teal': '#008080', 'Teal': '#008080',
    'navy': '#000080', 'Navy': '#000080',
    'indigo': '#4B0082', 'Indigo': '#4B0082',
    'violet': '#8A2BE2', 'Violet': '#8A2BE2'
  };
  return colorCodes[colorName] || '#800080';
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

  // Multi-dimensional aura color meanings with your specified format
  const getColorDetails = (colorName: string) => {
    const colorDetails: Record<string, any> = {
      'Red': { 
        chakra: 'Root Chakra Imbalance', 
        number: '1', 
        shadowMeaning: 'Root chakra imbalance manifesting through survival fears and aggressive tendencies that create blood pressure issues and adrenal exhaustion. This overactive frequency can lead to destructive anger patterns and inability to ground spiritual energy properly.',
        positiveMeaning: 'Root chakra kundalini activation flowing with primal life force energy that empowers your physical vitality and natural leadership magnetism. This fundamental frequency channels courageous action and manifestation power through your earthly presence.',
        colorMeaning: 'Passion & Vitality - Root chakra energy, life force activation, courage and strength, survival instincts, grounding power'
      },
      'Orange': { 
        chakra: 'Sacral Chakra Blockage', 
        number: '2', 
        shadowMeaning: 'Sacral chakra blockage creating creative stagnation and sexual dysfunction while causing reproductive system imbalances and emotional instability. This restricted frequency prevents authentic creative expression and healthy emotional flow.',
        positiveMeaning: 'Sacral chakra harmonization creating perfect balance for creative manifestation and sacred sexual vitality. This dynamic frequency liberates emotional expression while awakening your inner artistic genius and creative soul purpose.',
        colorMeaning: 'Creativity & Joy - Sacral chakra energy, creative expression, artistic flow, sensuality, emotional liberation'
      },
      'Yellow': { 
        chakra: 'Solar Plexus Weakness', 
        number: '3', 
        shadowMeaning: 'Solar plexus weakness generating digestive problems and low self-esteem that manifests as anxiety disorders and constant power struggles. This diminished frequency creates mental confusion and inability to maintain personal boundaries.',
        positiveMeaning: 'Solar plexus power center radiating brilliant mental clarity and digestive harmony while strengthening your personal will and intellectual mastery. This golden frequency illuminates your path to confident self-expression and mental sovereignty.',
        colorMeaning: 'Wisdom & Clarity - Solar plexus energy, personal power, mental clarity, confidence, intellectual mastery'
      },
      'Green': { 
        chakra: 'Heart Chakra Closure', 
        number: '4', 
        shadowMeaning: 'Heart chakra closure building emotional walls that create relationship difficulties and immune system weakness while manifesting lung problems. This protected frequency prevents authentic love expression and emotional vulnerability.',
        positiveMeaning: 'Heart chakra opening into unconditional love consciousness with natural healing abilities flowing through your emotional center. This healing frequency creates perfect emotional balance while manifesting prosperity consciousness through heart-centered living.',
        colorMeaning: 'Love & Healing - Heart chakra energy, unconditional love, healing abilities, compassion, emotional balance'
      },
      'Blue': { 
        chakra: 'Throat Chakra Blockage', 
        number: '5', 
        shadowMeaning: 'Throat chakra blockage causing communication fears and thyroid imbalances that create neck tension and truth suppression. This constricted frequency prevents authentic voice expression and honest spiritual communication.',
        positiveMeaning: 'Throat chakra clarity channeling divine truth expression through psychic communication abilities and spiritual teaching gifts. This truth frequency establishes peaceful authority while enabling authentic voice expression and sacred communication.',
        colorMeaning: 'Truth & Communication - Throat chakra energy, authentic expression, truth speaking, peaceful wisdom, divine communication'
      },
      'Indigo': { 
        chakra: 'Third Eye Cloudiness', 
        number: '6', 
        shadowMeaning: 'Third eye cloudiness creating intuitive blocks and chronic headaches while causing vision problems and spiritual confusion. This clouded frequency prevents psychic development and clear spiritual perception.',
        positiveMeaning: 'Third eye awakening with clairvoyant sight activation bringing profound spiritual wisdom and intuitive knowing. This mystical frequency opens doorways to higher understanding and psychic perception through divine inner sight.',
        colorMeaning: 'Intuition & Vision - Third eye energy, psychic abilities, spiritual sight, inner wisdom, mystical perception'
      },
      'Violet': { 
        chakra: 'Crown Chakra Disconnection', 
        number: '7', 
        shadowMeaning: 'Crown chakra disconnection triggering spiritual crisis and depression while causing neurological issues and complete isolation from divine connection. This severed frequency creates existential emptiness and spiritual despair.',
        positiveMeaning: 'Crown chakra activation establishing direct divine connection for spiritual mastery and cosmic consciousness expansion. This enlightened frequency brings awakened awareness and connection to universal wisdom and divine guidance.',
        colorMeaning: 'Spiritual Connection - Crown chakra energy, divine consciousness, enlightenment, universal wisdom, cosmic awareness'
      },
      'Purple': { 
        chakra: 'Higher Crown Chakra Disconnection', 
        number: '7', 
        shadowMeaning: 'Higher crown chakra disconnection creating spiritual arrogance and ego inflation while manifesting neurological imbalances and severe mental health struggles. This distorted frequency prevents authentic spiritual growth through dangerous disconnection from physical reality and shadow integration work.',
        positiveMeaning: 'Higher crown chakra transformation integrating spiritual wisdom with earthly experience creating authentic spiritual authority. This royal frequency balances mystical insight with practical application.',
        colorMeaning: 'Transformation & Mystery - Higher crown energy, spiritual transformation, mystical wisdom, magical consciousness, divine mystery'
      },
      'Pink': { 
        chakra: 'Heart Wounds', 
        number: '4', 
        shadowMeaning: 'Heart wounds creating codependency patterns and boundary dissolution that leads to emotional manipulation and excessive self-sacrifice. This wounded frequency attracts unhealthy relationship dynamics and emotional exploitation.',
        positiveMeaning: 'Divine feminine love frequency expressing emotional healing mastery through nurturing power and compassionate leadership. This heart wisdom frequency creates healing through unconditional love and gentle strength expression.',
        colorMeaning: 'Unconditional Love - Higher heart energy, divine compassion, emotional healing, nurturing wisdom, soul connection'
      },
      'Gold': { 
        chakra: 'Spiritual Materialism', 
        number: '3', 
        shadowMeaning: 'Spiritual materialism creating ego attachment and fear of divine responsibility while manifesting perfectionism and disconnection from authentic spiritual service. This corrupted frequency prevents humble spiritual development.',
        positiveMeaning: 'Christ consciousness frequency radiating divine wisdom and spiritual wealth through enlightened mastery. This golden frequency provides cosmic protection while channeling divine authority and spiritual abundance through sacred service.',
        colorMeaning: 'Divine Illumination - Christ consciousness, divine wisdom, spiritual mastery, enlightened authority, sacred service'
      },
      'Silver': { 
        chakra: 'Emotional Volatility', 
        number: '6', 
        shadowMeaning: 'Emotional volatility causing psychic overwhelm and hormonal imbalances that create mood disorders and excessive lunar sensitivity. This unstable frequency prevents emotional regulation and psychic protection.',
        positiveMeaning: 'Lunar intuition activation providing psychic protection through feminine wisdom and emotional intelligence mastery. This reflective frequency enhances intuitive abilities and creates energetic boundaries through divine feminine power.',
        colorMeaning: 'Lunar Intuition - Psychic protection, feminine wisdom, emotional intelligence, intuitive mastery, reflective insight'
      },
      'Turquoise': { 
        chakra: 'Communication Breakdown', 
        number: '4.5', 
        shadowMeaning: 'Communication breakdown causing emotional flooding and healer burnout while creating severe throat chakra strain. This overwhelmed frequency prevents sustainable healing work and authentic guidance expression.',
        positiveMeaning: 'Advanced heart-throat communication bridging emotional healing with spiritual teaching through higher truth expression. This therapeutic frequency combines wisdom with compassion for powerful healing communication and authentic guidance.',
        colorMeaning: 'Healing Communication - Heart-throat bridge, healing words, divine truth expression, therapeutic wisdom, authentic guidance'
      },
      'White': { 
        chakra: 'Spiritual Bypassing', 
        number: '7', 
        shadowMeaning: 'Spiritual detachment creating reality avoidance and material world disconnection while fostering naive trust and manipulation vulnerability. This ungrounded frequency prevents shadow integration and authentic human experience through excessive spiritual perfectionism.',
        positiveMeaning: 'Pure divine light emanation providing angelic protection and spiritual clarity through cosmic consciousness connection. This pristine frequency channels divine guidance and universal wisdom through clear spiritual perception and enlightened awareness.',
        colorMeaning: 'Pure Light - Divine protection, angelic connection, spiritual clarity, cosmic consciousness, universal wisdom'
      },
      'Lime': { 
        chakra: 'Heart Impatience', 
        number: '4', 
        shadowMeaning: 'Impatience with natural healing processes creating forced spiritual growth that leads to emotional instability and restless energy patterns. This overstimulated frequency can cause spiritual burnout when growth is rushed without proper integration time.',
        positiveMeaning: 'Heart healing chakra activation bringing powerful renewal energy that stimulates fresh emotional growth and deep spiritual cleansing. This vibrant frequency accelerates vitality restoration while catalyzing transformative new beginnings in your spiritual journey.',
        colorMeaning: 'Growth & Renewal - Heart renewal energy, fresh emotional growth, spiritual cleansing, vitality restoration, transformative beginnings'
      },
      'Navy': { 
        chakra: 'Mental Rigidity', 
        number: '6', 
        shadowMeaning: 'Mental rigidity creating spiritual arrogance and intellectual superiority while hoarding wisdom for personal power. This closed frequency prevents humble learning and authentic spiritual authority through knowledge accumulation.',
        positiveMeaning: 'Deep wisdom chakra activation accessing profound spiritual knowledge and cosmic intelligence stored in your soul memory. This mystical frequency brings divine authority through connection to ancient wisdom and universal understanding.',
        colorMeaning: 'Deep Wisdom - Soul memory access, cosmic intelligence, profound knowledge, ancient wisdom, mystical authority'
      },
      'Teal': { 
        chakra: 'Communication Overwhelm', 
        number: '4.5', 
        shadowMeaning: 'Heart-throat communication overwhelm creating emotional flooding and healer burnout while causing severe throat chakra strain. This overwhelmed frequency prevents sustainable healing work and authentic guidance expression.',
        positiveMeaning: 'Heart-throat bridge chakra activation combining emotional healing wisdom with authentic communication. This balanced frequency enables healing words, compassionate truth-telling, and the ability to speak from the heart with clarity and love.',
        colorMeaning: 'Emotional Healing - Heart-throat connection, healing communication, emotional clarity, compassionate expression, authentic voice'
      }
    };
    
    return colorDetails[colorName] || colorDetails['Purple'];
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      showPremiumModal();
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStage("Preparing image for analysis...");

    try {
      const formData = new FormData();
      formData.append('image', file);

      setAnalysisProgress(25);
      setAnalysisStage("Analyzing aura patterns...");

      const response = await apiRequest('/api/analyze-aura', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      setAnalysisProgress(75);
      setAnalysisStage("Processing insights...");

      setResult(data.result);
      setCurrentAnalysisId(data.id);
      setOriginalImage(URL.createObjectURL(file));
      
      setAnalysisProgress(100);
      setAnalysisStage("Analysis complete!");
      
      setTimeout(() => {
        setActiveTab("analysis");
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Please try again with a different image.",
        variant: "destructive",
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
          <AuraGlow 
            colors={[
              { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
                Aura Analysis Portal
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover your unique energy signature through advanced AI-powered aura reading and spiritual insights
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          {/* Multi-dimensional Aura Colors Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Palette className="h-6 w-6" />
                Multi-dimensional Aura Colors
              </CardTitle>
              <CardDescription>
                Explore the authentic meanings and spiritual significance of each aura color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Purple', 'Pink', 'Gold', 'Silver', 'Turquoise', 'White', 'Lime', 'Navy', 'Teal'].map((color) => {
                  const details = getColorDetails(color);
                  return (
                    <Card key={color} className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: getAccurateColorCode(color) }}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300" 
                            style={{ backgroundColor: getAccurateColorCode(color) }}
                          ></div>
                          <h4 className="font-semibold text-lg">{color}</h4>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-4">{details.colorMeaning}</p>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Positive Aspect:</h5>
                            <p className="text-sm leading-relaxed">{details.positiveMeaning}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Shadow Aspect:</h5>
                            <p className="text-sm leading-relaxed">{details.shadowMeaning}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Your Photo for Aura Analysis</CardTitle>
              <CardDescription>
                Upload a clear photo of yourself to begin your spiritual journey of discovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageUpload={handleImageUpload}
                isAnalyzing={isAnalyzing}
                analysisProgress={analysisProgress}
                analysisStage={analysisStage}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="spectrum">Color Spectrum</TabsTrigger>
                  <TabsTrigger value="guidance">Spiritual Guidance</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Your Aura Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Dominant Color</h3>
                          <Badge 
                            variant="secondary" 
                            className="text-lg px-4 py-2"
                            style={{ backgroundColor: getAccurateColorCode(result.dominantColor), color: 'white' }}
                          >
                            {result.dominantColor}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Secondary Color</h3>
                          <Badge 
                            variant="secondary" 
                            className="text-lg px-4 py-2"
                            style={{ backgroundColor: getAccurateColorCode(result.secondaryColor), color: 'white' }}
                          >
                            {result.secondaryColor}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h3 className="font-semibold mb-2">Detailed Analysis</h3>
                        <p className="text-muted-foreground leading-relaxed">{result.detailedAnalysis}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="spectrum" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Color Spectrum</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div 
                            className="h-24 rounded-lg border-2 border-white shadow-md"
                            style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                          ></div>
                          <div 
                            className="h-24 rounded-lg border-2 border-white shadow-md"
                            style={{ backgroundColor: getAccurateColorCode(result.secondaryColor) }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <h4 className="font-semibold">{result.dominantColor}</h4>
                            <p className="text-sm text-muted-foreground">{getColorDetails(result.dominantColor).colorMeaning}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">{result.secondaryColor}</h4>
                            <p className="text-sm text-muted-foreground">{getColorDetails(result.secondaryColor).colorMeaning}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="guidance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        Spiritual Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Spiritual Insights</h3>
                          <p className="text-muted-foreground leading-relaxed">{result.spiritualInsights}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Recommendations</h3>
                          <ul className="space-y-2">
                            {result.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}