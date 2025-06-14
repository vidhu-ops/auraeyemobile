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

interface AuraAnalysisResult {
  dominantColor: string;
  secondaryColor: string;
  colorMeanings: Record<string, string>;
  energyLevel: number;
  emotionalState: string;
  spiritualInsights: string;
  chakraActivity: Record<string, number>;
  personalityTraits: string[];
  recommendations: string[];
  detailedAnalysis: string;
  enhancedGuidance?: string;
  soulPurpose?: string;
  lifePathInsights?: string;
  relationshipDynamics?: string;
  careerAlignment?: string;
  shadowWork?: string;
  spiritualGifts?: string[];
  numerologyCorrelation?: string;
}

interface NumerologyResult {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthDay: number;
  maturity: number;
  lifePathMeaning: string;
  destinyMeaning: string;
  soulUrgeMeaning: string;
  personalityMeaning: string;
  overallInterpretation: string;
  yearlyForecast: string;
  monthlyInsights: string;
  compatibility: Record<number, string>;
  challenges: string[];
  strengths: string[];
  recommendations: string[];
}

export default function AuraAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedAuraImage, setProcessedAuraImage] = useState<string>('');
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string>('');
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
  
  const getColorPositiveMeaning = (colorName: string): string => {
    return getColorDetails(colorName).positiveMeaning;
  };

  const getColorNegativeMeaning = (colorName: string): string => {
    return getColorDetails(colorName).shadowMeaning;
  };

  const getColorMeaningShort = (colorName: string): string => {
    return getColorDetails(colorName).colorMeaning;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Aura Analysis Portal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover your unique energy signature through advanced AI-powered aura reading and spiritual insights
            </p>
          </div>

          {/* Multi-dimensional Aura Colors Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Multi-dimensional Aura Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Purple', 'Pink', 'Gold', 'Silver', 'Turquoise', 'White', 'Lime', 'Navy', 'Teal'].map((color) => {
                  const details = getColorDetails(color);
                  return (
                    <Card key={color} className="border-l-4" style={{ borderLeftColor: color.toLowerCase() }}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{color}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{details.colorMeaning}</p>
                        <div className="space-y-2">
                          <div>
                            <h5 className="text-xs font-medium text-green-600">Positive Aspect:</h5>
                            <p className="text-xs">{details.positiveMeaning}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-red-600">Shadow Aspect:</h5>
                            <p className="text-xs">{details.shadowMeaning}</p>
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
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Your Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={() => {}}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Select Your Photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a clear photo of yourself for accurate aura analysis
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for Results */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Your Aura Analysis Will Appear Here</h3>
              <p className="text-muted-foreground">
                Upload a photo to begin your spiritual journey of self-discovery
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}