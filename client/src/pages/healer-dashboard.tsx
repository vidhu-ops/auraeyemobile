import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  User,
  MessageSquare,
  TrendingUp,
  Users,
  Activity,
  Eye,
  Palette,
  Calculator,
  BarChart3,
  Download,
  Edit3,
  Save,
  X,
  Plus,
  FileText,
  Key
} from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { CHAKRA_KEYS, CHAKRA_DISPLAY_NAMES, getChakraStatus, calculateChakraGroupPercentages, ChakraActivity, type ChakraKey } from "../../../shared/chakra";
import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState, memo, useMemo, lazy, Suspense } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface HealerBooking {
  id: number;
  userId: number;
  healerId: number;
  message?: string;
  status: string;
  healerResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

interface HealerAnalytics {
  totalBookings: number;
  recentBookings: number;
  acceptedBookings: number;
  rejectedBookings: number;
  pendingBookings: number;
  totalClients: number;
  acceptanceRate: number;
}

interface BookingTrend {
  date: string;
  bookings: number;
  accepted: number;
  rejected: number;
  pending: number;
}

interface AuraReading {
  id: number;
  userId: number;
  name: string;
  imageUrl: string;
  dominantColor: string;
  secondaryColor: string;
  energyLevel: number;
  analysis: string;
  createdAt: string;
}

interface NumerologyReading {
  id: number;
  userId: number;
  name: string;
  birthDate: string;
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  personalYearNumber: number;
  interpretation: string;
  createdAt: string;
}

interface VibeReading {
  id: number;
  userId: number;
  personalityColor: string;
  colorMeaning: string;
  uploadedImage?: string;
  visualizedImage?: string;
  sessionId?: string;
  clientName?: string;
  fullAnalysis?: string;
  createdAt: string;
}

// Helper function to get color codes for vibe colors
const getVibeColorCode = (colorName: string): string => {
  const colorCodes: Record<string, string> = {
    'Pink': '#FF69B4',
    'Gray': '#A9A9A9', 'Grey': '#A9A9A9',
    'Blue': '#1E90FF',
    'Green': '#32CD32',
    'Violet': '#9400D3', 'Purple': '#8A2BE2',
    'Indigo': '#4B0082',
    'White': '#FFFFFF',
    'Gold': '#FFD700',
    'Yellow': '#FFE600',
    'Orange': '#FF8C00',
    'Silver': '#C0C0C0',
    'Black': '#2F2F2F',
    'Red': '#FF3232',
    'Brown': '#A52A2A'
  };
  return colorCodes[colorName] || '#1E90FF';
};

// Numerology Input Form Component for Spiritual Tools
function NumerologyInputForm() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !birthDate) {
      toast({
        title: "Missing Information",
        description: "Please enter both full name and birth date.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to numerology page with URL parameters
    const params = new URLSearchParams({
      healerName: fullName.trim(),
      healerBirthDate: birthDate,
      fromHealer: 'true'
    });
    
    window.location.href = `/numerology?${params.toString()}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter client's full name"
            className="w-full"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full"
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Calculator className="w-4 h-4 mr-2" />
        Generate Numerology Analysis
      </Button>
    </form>
  );
}

function HealerNumerologyInput({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and birth date",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/healer-numerology", {
        name: name.trim(),
        birthDate
      });

      if (response.ok) {
        toast({
          title: "Numerology Reading Created",
          description: `Personal numerology reading for ${name} has been generated`,
        });
        
        // Reset form
        setName("");
        setBirthDate("");
        
        // Refresh the readings list
        queryClient.invalidateQueries({ queryKey: ['/api/healer-numerology-readings'] });
        onSuccess();
      } else {
        throw new Error("Failed to create numerology reading");
      }
    } catch (error) {
      console.error("Error creating numerology reading:", error);
      toast({
        title: "Error",
        description: "Failed to create numerology reading. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Person's Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            className="w-full"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full"
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Numerology Reading...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4 mr-2" />
            Generate Personal Numerology Reading
          </>
        )}
      </Button>
    </form>
  );
}

// Comprehensive Aura Reading Card Component with Full Analysis
const DetailedAuraReadingCard = memo(function DetailedAuraReadingCard({ reading }: { reading: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(reading.healerNotes || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateReadingMutation = useMutation({
    mutationFn: async (notes: string) => {
      await apiRequest('PATCH', `/api/aura-readings/${reading.id}/notes`, { healerNotes: notes });
    },
    onSuccess: () => {
      toast({
        title: "Notes Updated",
        description: "Your reading notes have been saved successfully."
      });
      setIsEditing(false);
    }
  });

  const saveNotes = () => {
    updateReadingMutation.mutate(editedNotes);
  };

  // Memoize JSON parsing for better performance
  const parsedData = useMemo(() => {
    const parseJsonField = (field: string) => {
      try {
        return JSON.parse(field || '{}');
      } catch {
        return {};
      }
    };

    return {
      chakraActivity: parseJsonField(reading.chakraActivity),
      zones: parseJsonField(reading.zones),
      colorMeanings: parseJsonField(reading.colorMeanings),
      personalityTraits: parseJsonField(reading.personalityTraits),
      auraColorSpectrum: parseJsonField(reading.auraColorSpectrum)
    };
  }, [reading.chakraActivity, reading.zones, reading.colorMeanings, reading.personalityTraits, reading.auraColorSpectrum]);

  const { chakraActivity, zones, colorMeanings, personalityTraits, auraColorSpectrum } = parsedData;

  // Chakra calculation functions - matches actual human aura analysis
  const calculateSoulStarChakra = (reading: any): number => {
    // Soul Star Chakra - based on energy level and dominant color
    const baseValue = (reading.energyLevel || 5) * 7;
    const colorModifier = ['White', 'Silver', 'Gold', 'Violet'].includes(reading.dominantColor) ? 20 : 0;
    return Math.min(100, baseValue + colorModifier);
  };

  const calculateEarthStarChakra = (reading: any): number => {
    // Earth Star Chakra - based on energy level and grounding colors
    const baseValue = (reading.energyLevel || 5) * 8;
    const colorModifier = ['Brown', 'Black', 'Gray', 'Maroon'].includes(reading.dominantColor) ? 15 : 0;
    return Math.min(100, baseValue + colorModifier);
  };

  // Color mapping for visualization
  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'Red': 'from-red-400 to-red-600',
      'Orange': 'from-orange-400 to-orange-600',
      'Yellow': 'from-yellow-400 to-yellow-600',
      'Green': 'from-green-400 to-green-600',
      'Blue': 'from-blue-400 to-blue-600',
      'Indigo': 'from-indigo-400 to-indigo-600',
      'Violet': 'from-violet-400 to-violet-600',
      'White': 'from-gray-100 to-gray-300',
      'Black': 'from-gray-800 to-gray-900',
      'Gold': 'from-yellow-300 to-yellow-500',
      'Silver': 'from-gray-300 to-gray-500',
      'Brown': 'from-amber-600 to-amber-800'
    };
    return colorMap[color] || 'from-gray-400 to-gray-600';
  };

  // Helper functions for astrological-style mappings
  const getGemstoneForColor = (color: string): string => {
    const gemstoneMap: Record<string, string> = {
      'Red': 'Ruby', 'Orange': 'Carnelian', 'Yellow': 'Citrine', 'Green': 'Emerald',
      'Blue': 'Sapphire', 'Indigo': 'Lapis Lazuli', 'Violet': 'Amethyst', 
      'Purple': 'Amethyst', 'Pink': 'Rose Quartz', 'White': 'Diamond',
      'Black': 'Onyx', 'Brown': 'Tiger Eye', 'Gold': 'Topaz', 'Silver': 'Moonstone'
    };
    return gemstoneMap[color] || 'Quartz';
  };

  const getDayForColor = (color: string): string => {
    const dayMap: Record<string, string> = {
      'Red': 'Tuesday', 'Orange': 'Sunday', 'Yellow': 'Wednesday', 'Green': 'Friday',
      'Blue': 'Thursday', 'Indigo': 'Saturday', 'Violet': 'Saturday', 
      'Purple': 'Saturday', 'Pink': 'Friday', 'White': 'Monday',
      'Black': 'Saturday', 'Brown': 'Tuesday', 'Gold': 'Sunday', 'Silver': 'Monday'
    };
    return dayMap[color] || 'Sunday';
  };

  // Enhanced personality analysis helper functions
  const getPersonalityTrait = (color: string): string => {
    const traits: Record<string, string> = {
      'Red': 'passionate, determined, leadership-oriented',
      'Orange': 'creative, enthusiastic, socially vibrant',
      'Yellow': 'intelligent, optimistic, mentally focused',
      'Green': 'healing-oriented, balanced, compassionate',
      'Blue': 'communicative, peaceful, spiritually aware',
      'Indigo': 'intuitive, wise, psychically sensitive',
      'Violet': 'spiritually advanced, transformative, mystical',
      'White': 'pure, protective, divinely connected',
      'Black': 'protective, transformative, mystery-oriented',
      'Pink': 'loving, nurturing, emotionally healing',
      'Gold': 'wise, abundant, spiritually accomplished',
      'Silver': 'intuitive, receptive, lunar-aligned'
    };
    return traits[color] || 'unique spiritual';
  };

  const getEnergyLevelTrait = (level: number): string => {
    if (level >= 9) return 'exceptionally high vibration and dynamic';
    if (level >= 7) return 'strong, confident, and energetically powerful';
    if (level >= 5) return 'balanced, steady, and harmoniously grounded';
    if (level >= 3) return 'gentle, contemplative, and introspectively focused';
    return 'deeply reflective and spiritually transitional';
  };

  const getColorInfluence = (color: string): string => {
    const influences: Record<string, string> = {
      'Red': 'courage, passion, and dynamic action energy',
      'Orange': 'creativity, joy, and social magnetism',
      'Yellow': 'wisdom, clarity, and intellectual brilliance',
      'Green': 'healing abilities, balance, and heart-centered compassion',
      'Blue': 'peaceful communication and spiritual truth expression',
      'Indigo': 'deep intuition and psychic awareness',
      'Violet': 'spiritual mastery and transformative wisdom',
      'White': 'divine protection and pure spiritual light',
      'Black': 'protective boundaries and transformative power',
      'Pink': 'unconditional love and emotional healing gifts',
      'Gold': 'divine wisdom and spiritual abundance',
      'Silver': 'intuitive sensitivity and lunar wisdom'
    };
    return influences[color] || 'unique spiritual gifts and abilities';
  };

  const getStrongestChakra = (chakraData: any): string => {
    const entries = Object.entries(chakraData);
    const strongest = entries.reduce((max, current) => 
      (current[1] as number) > (max[1] as number) ? current : max
    );
    
    const chakraNames: Record<string, string> = {
      'soulStar': 'Soul Star (divine purpose)',
      'crown': 'Crown (spiritual connection)',
      'thirdEye': 'Third Eye (intuition)',
      'throat': 'Throat (communication)',
      'heart': 'Heart (love and healing)',
      'solarPlexus': 'Solar Plexus (personal power)',
      'sacral': 'Sacral (creativity)',
      'root': 'Root (grounding)',
      'earthStar': 'Earth Star (earth connection)'
    };
    
    return chakraNames[strongest[0] as string] || 'balanced energy';
  };

  const getIntuitiveNature = (thirdEye: number, crown: number): string => {
    const combined = (thirdEye + crown) / 2;
    if (combined >= 8) return 'Highly intuitive with strong psychic abilities and clear spiritual insight';
    if (combined >= 6) return 'Well-developed intuition with growing spiritual awareness and inner wisdom';
    if (combined >= 4) return 'Developing intuitive abilities with potential for spiritual growth';
    return 'Emerging intuitive gifts that need nurturing and development';
  };

  const getHealingAbilities = (heart: number, color: string): string => {
    const healingColors = ['Green', 'Pink', 'White', 'Gold', 'Blue'];
    const isHealingColor = healingColors.includes(color);
    
    if (heart >= 8 && isHealingColor) return 'Strong natural healing abilities with heart-centered wisdom and compassionate energy';
    if (heart >= 8) return 'Powerful healing presence through personal strength and empathetic connection';
    if (heart >= 6 && isHealingColor) return 'Good healing potential with developing heart chakra energy and natural compassion';
    if (heart >= 6) return 'Growing healing abilities through emotional balance and supportive energy';
    return 'Emerging healing gifts that develop through heart chakra work and self-compassion practices';
  };

  const getPsychicSensitivity = (thirdEye: number, soulStar: number): string => {
    const combined = (thirdEye + soulStar) / 2;
    if (combined >= 8) return 'High psychic sensitivity with clear spiritual perception and divine connection';
    if (combined >= 6) return 'Good psychic awareness with developing spiritual abilities and higher consciousness';
    if (combined >= 4) return 'Moderate psychic sensitivity that grows with spiritual practice and meditation';
    return 'Latent psychic abilities that awaken through dedicated spiritual development';
  };

  const getSpiritualLeadership = (throat: number, crown: number): string => {
    const combined = (throat + crown) / 2;
    if (combined >= 8) return 'Strong spiritual leadership abilities with clear divine communication and wisdom sharing';
    if (combined >= 6) return 'Developing leadership qualities with growing spiritual authority and teaching potential';
    if (combined >= 4) return 'Emerging leadership skills through authentic self-expression and spiritual growth';
    return 'Potential spiritual leadership that develops through personal growth and truth expression';
  };

  const getGrowthAreas = (chakraData: any): string => {
    const entries = Object.entries(chakraData);
    const weakest = entries.reduce((min, current) => 
      (current[1] as number) < (min[1] as number) ? current : min
    );
    
    const growthAreas: Record<string, string> = {
      'soulStar': 'Develop deeper connection to divine purpose and soul mission through spiritual study',
      'crown': 'Strengthen spiritual connection through meditation, prayer, and consciousness expansion',
      'thirdEye': 'Enhance intuitive abilities through meditation, dreamwork, and psychic development',
      'throat': 'Improve authentic self-expression and truth communication through voice work',
      'heart': 'Develop emotional healing and compassion through heart-opening practices',
      'solarPlexus': 'Build personal power and confidence through empowerment and boundary work',
      'sacral': 'Enhance creativity and emotional flow through artistic expression and emotional healing',
      'root': 'Strengthen grounding and security through earth connection and stability practices',
      'earthStar': 'Deepen earth connection through nature work and ancestral healing'
    };
    
    return growthAreas[weakest[0] as string] || 'Continue balanced spiritual development across all energy centers';
  };

  const getRecommendedPractices = (color: string, chakraData: any): string => {
    const colorPractices: Record<string, string> = {
      'Red': 'Grounding meditation, physical exercise, earth connection, courage-building practices',
      'Orange': 'Creative expression, emotional release work, social connection, joy cultivation',
      'Yellow': 'Mental clarity meditation, study, teaching, confidence-building practices',
      'Green': 'Heart-opening meditation, healing work, nature connection, compassion practices',
      'Blue': 'Truth expression, communication work, peaceful meditation, spiritual study',
      'Indigo': 'Third eye meditation, intuitive development, dreamwork, wisdom practices',
      'Violet': 'Crown chakra meditation, spiritual study, divine connection, transformation work',
      'White': 'Light meditation, purification practices, spiritual protection, angelic connection',
      'Black': 'Shadow work, protection practices, transformation meditation, boundary setting',
      'Pink': 'Love meditation, emotional healing, nurturing practices, heart chakra work',
      'Gold': 'Wisdom practices, abundance work, spiritual mastery, divine connection',
      'Silver': 'Lunar meditation, intuitive development, feminine energy work, psychic protection'
    };
    
    return colorPractices[color] || 'Balanced spiritual practices including meditation, energy work, and conscious living';
  };

  const getEnergyWorkFocus = (chakraData: any): string => {
    const entries = Object.entries(chakraData);
    const sorted = entries.sort((a, b) => (a[1] as number) - (b[1] as number));
    const weakest = sorted.slice(0, 2);
    
    const focusAreas = weakest.map(([chakra]) => {
      const focuses: Record<string, string> = {
        'soulStar': 'soul purpose alignment and divine connection',
        'crown': 'spiritual consciousness and divine wisdom',
        'thirdEye': 'intuitive development and inner sight',
        'throat': 'authentic expression and truth communication',
        'heart': 'love cultivation and emotional healing',
        'solarPlexus': 'personal power and confidence building',
        'sacral': 'creative expression and emotional flow',
        'root': 'grounding and security strengthening',
        'earthStar': 'earth connection and ancestral healing'
      };
      return focuses[chakra] || 'balanced energy development';
    });
    
    return `Primary focus areas: ${focusAreas.join(' and ')}`;
  };

  const getLifePathGuidance = (color: string, energyLevel: number): string => {
    const pathGuidance: Record<string, string> = {
      'Red': 'Your path involves leadership, taking action, and pioneering new directions with courage and determination',
      'Orange': 'Your journey centers on creative expression, bringing joy to others, and building meaningful social connections',
      'Yellow': 'Your purpose involves teaching, sharing wisdom, and illuminating truth through intellectual and spiritual insights',
      'Green': 'Your path is one of healing - bringing balance, growth, and compassion to yourself and others',
      'Blue': 'Your journey involves authentic communication, bringing peace, and expressing spiritual truth',
      'Indigo': 'Your path centers on intuitive development, sharing wisdom, and bridging spiritual and physical realms',
      'Violet': 'Your purpose involves spiritual transformation, mystical understanding, and guiding others toward enlightenment',
      'White': 'Your path is one of purity, protection, and serving as a beacon of divine light for others',
      'Black': 'Your journey involves transformation, protection work, and helping others through shadow integration',
      'Pink': 'Your purpose centers on unconditional love, emotional healing, and nurturing spiritual growth in others',
      'Gold': 'Your path involves wisdom sharing, spiritual mastery, and creating abundance through divine connection',
      'Silver': 'Your journey centers on intuitive guidance, lunar wisdom, and psychic service to others'
    };
    
    const levelGuidance = energyLevel >= 7 ? 
      ' Your high energy levels indicate you are ready to take on significant spiritual responsibilities and leadership roles.' :
      energyLevel >= 5 ?
      ' Your balanced energy suggests steady progress through consistent spiritual practice and gradual expansion.' :
      ' Your gentle energy indicates this is a time for inner development, healing, and building a strong spiritual foundation.';
    
    return (pathGuidance[color] || 'Your unique spiritual path involves discovering and expressing your authentic gifts') + levelGuidance;
  };

  // Chakra karmic lessons helper function
  const getChakraKarmicLesson = (chakraKey: string): string => {
    const karmicLessons: Record<string, string> = {
      'soulStar': 'Remembering your soul purpose & connection with your soul mission and divine calling',
      'crown': 'Reconnecting with Source beyond and trusting the divine timing of your spiritual journey',
      'thirdEye': 'Breaking illusions and mental control to trust intuition and remove self doubt',
      'throat': 'Healing silenced expression from past lifetimes and speaking your truth and sharing what you feel',
      'heart': 'Releasing fear of vulnerability and being able to give and receive with balanced boundaries',
      'solarPlexus': 'Stepping into your personal power & confidence by letting go of the self-sacrificial nature',
      'sacral': 'Reclaiming emotional freedom and self-worth by letting go of guilt, shame, unworthiness around pleasure and emotional feelings',
      'root': 'Ability to trust life decisions, take actions to create stability & security in life',
      'earthStar': 'Grounding ancestral wisdom and healing generational patterns for earth connection'
    };
    return karmicLessons[chakraKey] || 'Continue spiritual development and energy balance work';
  };

  // Chakra healing recommendations helper function
  const getChakraHealingRecommendations = (chakraKey: string, score: number): string => {
    const baseRecommendations: Record<string, string> = {
      'soulStar': 'Meditation on divine purpose, spiritual study, connection with higher guidance',
      'crown': 'Crown chakra meditation, prayer, spiritual connection practices, violet light visualization',
      'thirdEye': 'Third eye activation, intuitive development, meditation, indigo light visualization',
      'throat': 'Voice work, truth expression, blue light visualization, authentic communication practices',
      'heart': 'Heart-opening meditation, love practices, green light visualization, compassion work',
      'solarPlexus': 'Confidence building, personal power work, yellow light visualization, boundary setting',
      'sacral': 'Creative expression, emotional healing, orange light visualization, pleasure acceptance',
      'root': 'Grounding exercises, earth connection, red light visualization, stability practices',
      'earthStar': 'Earth connection rituals, ancestral healing, grounding in nature, stability work'
    };
    
    const urgencyLevel = score <= 3 ? 'PRIORITY: ' :
                        score <= 6 ? 'FOCUS: ' :
                        score >= 9 ? 'BALANCE: ' :
                        'CONTINUE: ';
    
    return urgencyLevel + (baseRecommendations[chakraKey] || 'Balanced energy practices');
  };

  const generateComprehensivePDF = async (reading: any) => {
    setIsGeneratingPDF(true);
    
    try {
      // Generate a new PDF with enhanced layout
      const { jsPDF } = await import('jspdf');
      const { format } = await import('date-fns');
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Import paper texture for background using @assets
      let paperTextureDataUrl = '';
      try {
        const response = await fetch('/attached_assets/white-paper-texture-with-flecks_1757451226299.jpg');
        const blob = await response.blob();
        paperTextureDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.log('Paper texture not loaded, using white background');
      }
      
      // Helper function to add paper texture background to each page
      const addPaperBackground = () => {
        if (paperTextureDataUrl) {
          try {
            // Add paper texture as background covering the entire page
            pdf.addImage(paperTextureDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
          } catch (error) {
            console.log('Error adding paper texture:', error);
          }
        }
      };
      
      // Add background to first page
      addPaperBackground();
      const healerName = user?.username || 'Professional Healer';
      
      // Helper function to parse JSON fields safely
      const parseJsonField = (field: string) => {
        try {
          return JSON.parse(field || '{}');
        } catch {
          return {};
        }
      };
      
      // Helper function to draw decorative title line (like in screenshots)
      const drawTitleWithLine = (title: string, y: number, fontSize: number = 18) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(30, 41, 59);
        const textWidth = pdf.getTextWidth(title);
        const startX = (pageWidth - textWidth) / 2;
        
        // Draw horizontal lines on both sides
        pdf.setDrawColor(212, 175, 55); // Golden color
        pdf.setLineWidth(1);
        const lineY = y - 2;
        pdf.line(20, lineY, startX - 10, lineY);
        pdf.line(startX + textWidth + 10, lineY, pageWidth - 20, lineY);
        
        // Draw the title
        pdf.text(title, pageWidth / 2, y, { align: 'center' });
        
        return y + 15;
      };
      
      // Helper function to draw trait bubbles (like in screenshots)
      const drawTraitBubbles = (traits: string[], startY: number, title: string, isPositive: boolean = true) => {
        if (!traits || traits.length === 0) return startY;
        
        pdf.setFontSize(14);
        pdf.setTextColor(30, 41, 59);
        pdf.text(title, pageWidth / 2, startY, { align: 'center' });
        
        let currentY = startY + 15;
        let currentX = 30;
        const bubbleWidth = 35;
        const bubbleHeight = 12;
        const spacing = 5;
        
        traits.forEach((trait, index) => {
          if (currentX + bubbleWidth > pageWidth - 30) {
            currentX = 30;
            currentY += bubbleHeight + spacing + 5;
          }
          
          // Set bubble colors based on positive/negative
          if (isPositive) {
            pdf.setFillColor(147, 51, 234); // Purple for positive
            pdf.setTextColor(255, 255, 255);
          } else {
            pdf.setFillColor(239, 68, 68); // Red for negative
            pdf.setTextColor(255, 255, 255);
          }
          
          // Draw rounded rectangle bubble
          pdf.roundedRect(currentX, currentY - bubbleHeight + 2, bubbleWidth, bubbleHeight, 3, 3, 'F');
          
          // Add text
          pdf.setFontSize(8);
          const textWidth = pdf.getTextWidth(trait);
          const textX = currentX + (bubbleWidth - textWidth) / 2;
          pdf.text(trait, textX, currentY - 2);
          
          currentX += bubbleWidth + spacing;
        });
        
        return currentY + 20;
      };
      
      // Helper function to draw info box (like in screenshots)
      const drawInfoBox = (title: string, info: any, startY: number) => {
        pdf.setFillColor(255, 255, 255); // Light yellow background
        pdf.setDrawColor(255, 255, 255); // Golden border
        pdf.rect(30, startY, pageWidth - 60, 45, 'FD');
        
        pdf.setFontSize(12);
        pdf.setTextColor(30, 41, 59);
        pdf.text(title, 35, startY + 10);
        
        let yOffset = 20;
        Object.entries(info).forEach(([key, value]) => {
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`${key}: ${value}`, 35, startY + yOffset);
          yOffset += 8;
        });
        
        return startY + 55;
      };
      
      // Parse all data fields with error handling
      let spiritualGuidance, detailedAnalysis, colorMeanings, personalityTraits, chakraActivity;
      
      try {
        spiritualGuidance = reading.spiritualGuidance || 'Your aura reveals unique energy patterns representing spiritual growth and development.';
        detailedAnalysis = reading.detailedAnalysis || 'Advanced spiritual development with balanced energy flow.';
        colorMeanings = parseJsonField(reading.colorMeanings) || {};
        personalityTraits = parseJsonField(reading.personalityTraits) || [];
        chakraActivity = parseJsonField(reading.chakraActivity) || {};
      } catch (parseError) {
        console.error('Error parsing reading data:', parseError);
        spiritualGuidance = 'Your aura reveals unique energy patterns representing spiritual growth and development.';
        detailedAnalysis = 'Advanced spiritual development with balanced energy flow.';
        colorMeanings = {};
        personalityTraits = [];
        chakraActivity = {};
      }
      
      // PAGE 1: COVER PAGE WITH ASCENDANT REPORT STYLE
      let yPos = drawTitleWithLine('Ascendant Report', 40, 24);
      
      // Subtitle
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Spiritual Advice', pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;
      
      // Spiritual guidance in center
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      const guidanceLines = pdf.splitTextToSize(spiritualGuidance, pageWidth - 80);
      const guidanceHeight = guidanceLines.length * 5;
      const guidanceY = yPos + 10;
      pdf.text(guidanceLines, pageWidth / 2, guidanceY, { align: 'center' });
      yPos = guidanceY + guidanceHeight + 20;
      
      // Extract positive and negative traits from personality traits and analysis
      const positiveTraits = personalityTraits.slice(0, Math.ceil(personalityTraits.length / 2)) || ['Intuitive', 'Motivated', 'Emotionally Stable', 'Imaginative'];
      const negativeTraits = personalityTraits.slice(Math.ceil(personalityTraits.length / 2)) || ['Impatient', 'Anxious', 'Disconnected', 'Restless'];
      
      // Positive Traits Section
      yPos = drawTraitBubbles(positiveTraits, yPos, 'Positive Traits', true);
      
      // Negative Traits Section  
      yPos = drawTraitBubbles(negativeTraits, yPos + 10, 'More Traits', false);
      
      // PAGE 2: ASCENDANT REPORT DETAILS
      pdf.addPage();
      addPaperBackground();
      yPos = drawTitleWithLine('Ascendant Report', 30);
      
      // Add decorative image area (similar to screenshot 2)
      if (reading.processedAuraImage || reading.imageUrl) {
        try {
          const imgWidth = 60;
          const imgHeight = 80;
          const imgX = 30;
          const imgY = yPos + 10;
          
          let finalImageSrc = '';
          if (reading.processedAuraImage) {
            if (!reading.processedAuraImage.startsWith('data:')) {
              finalImageSrc = `data:image/jpeg;base64,${reading.processedAuraImage}`;
            } else {
              finalImageSrc = reading.processedAuraImage;
            }
            pdf.addImage(finalImageSrc, 'JPEG', imgX, imgY, imgWidth, imgHeight);
          }
        } catch (error) {
          console.error('Error adding aura image to PDF:', error);
        }
      }
      
      // Ascendant Details Box (similar to screenshot 2)
      const ascendantInfo = {
        'Major Color': reading.personalityColor,
        'Secondary': `${reading.thinkingColor} Energy`,
        'Dynamic Colors': `${reading.givingColor}, ${reading.receivingColor}`,
        'Lucky Gems': getGemstoneForColor(reading.personalityColor),
        
      };
      
      yPos = drawInfoBox('Ascendant Report Details', ascendantInfo, yPos + 100);
      
      // Add detailed analysis text
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      const analysisText = detailedAnalysis || 'Your aura reveals unique spiritual characteristics that guide your life path and energy expression.';
      const analysisLines = pdf.splitTextToSize(analysisText, pageWidth - 60);
      pdf.text(analysisLines, 30, yPos + 10);
      
      // PAGE 3: ENERGY POSITIONS (similar to Planetary Positions from screenshot 3)
      pdf.addPage();
      addPaperBackground();
      yPos = drawTitleWithLine('Energy Positions', 30);
      
      // Create a table similar to the planetary positions table in screenshot 3
      const energyPositions = [
        { position: 'Thinking', energy: reading.personalityColor, degree: `Above head`, sign: 'Primary', nakshatra: 'Core' },
        { position: 'Giving', energy: reading.receivingColor, degree: `Right`, sign: 'Expression', nakshatra: 'Outward' },
        { position: 'Receiving', energy: reading.givingColor, degree: `Left`, sign: 'Absorption', nakshatra: 'Inward' },
        { position: 'Personality', energy: reading.thinkingColor, degree: `overall`, sign: 'Essence', nakshatra: 'Identity' }
      ];
      
      // Draw table header
      yPos += 10;
      pdf.setFillColor(212, 175, 55); // Golden header
      pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Position', 25, yPos + 8);
      pdf.text('Energy', 55, yPos + 8);
      pdf.text('Position', 85, yPos + 8);
      pdf.text('Nature', 115, yPos + 8);
      pdf.text('Movement', 145, yPos + 8);
     
      
      yPos += 12;
      
      // Draw table rows
      energyPositions.forEach((row, index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(248, 248, 248); // Alternate row color
          pdf.rect(20, yPos, pageWidth - 40, 10, 'F');
        }
        
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text(row.position, 25, yPos + 7);
        pdf.text(row.energy, 55, yPos + 7);
        pdf.text(row.degree, 85, yPos + 7);
        pdf.text(row.sign, 115, yPos + 7);
        pdf.text(row.nakshatra, 145, yPos + 7)
        
        
        yPos += 10;
      });
      
      // Add energy status indicators (similar to planet status in screenshot 3)
      yPos += 20;
      const energyStatuses = [
        { energy: reading.personalityColor, status: 'Highly Active', type: 'benefic' },
        { energy: reading.receivingColor, status: 'Moderately Active', type: 'neutral' },
        { energy: reading.givingColor, status: 'Balanced', type: 'benefic' },
        { energy: reading.thinkingColor, status: 'Stable', type: 'neutral' }
      ];
      
      let statusX = 30;
      let statusY = yPos;
      energyStatuses.forEach((status, index) => {
        if (index % 3 === 0 && index > 0) {
          statusY += 35;
          statusX = 30;
        }
        
        // Draw status box
        const boxColor = status.type === 'benefic' ? [34, 197, 94] : status.type === 'malefic' ? [239, 68, 68] : [156, 163, 175];
        pdf.setFillColor(254, 248, 220);
        pdf.setDrawColor(boxColor[0], boxColor[1], boxColor[2]);
        pdf.rect(statusX, statusY, 45, 25, 'FD');
        
        pdf.setFontSize(8);
        pdf.setTextColor(30, 41, 59);
        pdf.text(status.energy, statusX + 2, statusY + 8);
        pdf.text(status.status, statusX + 2, statusY + 15);
        pdf.setTextColor(boxColor[0], boxColor[1], boxColor[2]);
        pdf.text(status.type.toUpperCase(), statusX + 2, statusY + 22);
        
        statusX += 50;
      });
      
      // Basic Astrological Details page removed as requested by user
      
      // PAGE 5: COMPREHENSIVE CHAKRA ANALYSIS WITH ENHANCED DATA
      pdf.addPage();
      addPaperBackground();
      yPos = drawTitleWithLine('Comprehensive Chakra Analysis', 30);
      
      // Extract ALL chakra data from the reading - using calculated values for Soul Star and Earth Star
      const allChakraData = {
        'soulStar': Math.round(calculateSoulStarChakra(reading) / 10),
        'crown': chakraActivity.crown || 6,
        'thirdEye': chakraActivity.thirdEye || 7,
        'throat': chakraActivity.throat || 6,
        'heart': chakraActivity.heart || 8,
        'solarPlexus': chakraActivity.solarPlexus || 7,
        'sacral': chakraActivity.sacral || 6,
        'root': chakraActivity.root || 8,
        'earthStar': Math.round(calculateEarthStarChakra(reading) / 10)
      };
      
      const chakraDisplayNames = {
        'soulStar': 'Soul Star Chakra',
        'crown': 'Crown Chakra',
        'thirdEye': 'Third Eye Chakra',
        'throat': 'Throat Chakra',
        'heart': 'Heart Chakra',
        'solarPlexus': 'Solar Plexus Chakra',
        'sacral': 'Sacral Chakra',
        'root': 'Root Chakra',
        'earthStar': 'Earth Star Chakra'
      };
      
      const chakraDescriptions = {
        'soulStar': 'Higher spiritual purpose, divine connection, soul mission and connection to your highest spiritual calling',
        'crown': 'Spiritual connection, divine wisdom, universal consciousness and connection to Source energy',
        'thirdEye': 'Intuition, inner wisdom, psychic abilities and capacity to see beyond the physical realm',
        'throat': 'Communication, truth, self-expression and ability to voice your authentic self',
        'heart': 'Love, compassion, emotional healing and your capacity to give and receive love',
        'solarPlexus': 'Personal power, confidence, willpower and your ability to assert yourself in the world',
        'sacral': 'Creativity, sexuality, emotional flow and your connection to pleasure and creative expression',
        'root': 'Grounding, survival, physical vitality and your connection to safety and security',
        'earthStar': 'Earth connection, grounding, ancestral wisdom and your relationship with the material world'
      };
      
      // Draw comprehensive chakra table
      yPos += 10;
      pdf.setFillColor(212, 175, 55);
      pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Chakra', 25, yPos + 8);
      pdf.text('Activity Level', 80, yPos + 8);
      pdf.text('Percentage', 130, yPos + 8);
      pdf.text('Status', 160, yPos + 8);
      
      yPos += 12;
      
      Object.entries(allChakraData).forEach(([chakraKey, score], index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
        }
        
        const chakraName = chakraDisplayNames[chakraKey as keyof typeof chakraDisplayNames];
        const percentage = score * 10;
        const chakraStatus = getChakraStatus(score);
        
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text(chakraName, 25, yPos + 8);
        pdf.text(`${score}/10`, 85, yPos + 8);
        pdf.text(`${percentage}%`, 135, yPos + 8);
        
        // Color-code status with proper chakra status
        const statusColor = score >= 9 ? [59, 130, 246] : // Blue for balanced
                           score >= 7 ? [34, 197, 94] : // Green for developing balance  
                           score >= 4 ? [251, 146, 60] : // Orange for imbalanced
                           score >= 1 ? [239, 68, 68] : // Red for blocked
                           [156, 163, 175]; // Gray for unknown
        
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(chakraStatus.status, 165, yPos + 8);
        
        yPos += 12;
      });
      
      // Add comprehensive detailed chakra analysis section after the table
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Detailed Chakra Analysis with Karmic Insights', 20, yPos);
      yPos += 15;
      
      // Enhanced chakra analysis with meanings, karmic lessons, and healing
      Object.entries(allChakraData).forEach(([chakraKey, score]) => {
        const chakraName = chakraDisplayNames[chakraKey as keyof typeof chakraDisplayNames];
        const description = chakraDescriptions[chakraKey as keyof typeof chakraDescriptions];
        const chakraStatus = getChakraStatus(score);
        const percentage = score * 10;
        
        // Check if we need a new page
        if (yPos > 220) {
          pdf.addPage();
          addPaperBackground();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('DETAILED CHAKRA ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
        
        // Chakra header with name and score
        pdf.setFontSize(13);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`${chakraName}: ${score}/10 (${percentage}%) - ${chakraStatus.status}`, 20, yPos);
        yPos += 12;
        
        // Chakra meaning and function
        pdf.setFontSize(9);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Meaning & Function:', 25, yPos);
        yPos += 5;
        const meaningLines = pdf.splitTextToSize(description, pageWidth - 50);
        pdf.text(meaningLines, 30, yPos);
        yPos += meaningLines.length * 4 + 5;
        
        // Karmic lessons for each chakra
        const karmicLessons = getChakraKarmicLesson(chakraKey);
        if (karmicLessons) {
          pdf.setFontSize(9);
          pdf.setTextColor(147, 51, 234);
          pdf.text('Karmic Lesson:', 25, yPos);
          yPos += 5;
          
          pdf.setTextColor(75, 85, 99);
          const karmicLines = pdf.splitTextToSize(karmicLessons, pageWidth - 50);
          pdf.text(karmicLines, 30, yPos);
          yPos += karmicLines.length * 4 + 5;
        }
        
        // Healing recommendations for this chakra
        const healingRecommendations = getChakraHealingRecommendations(chakraKey, score);
        if (healingRecommendations) {
          pdf.setFontSize(9);
          pdf.setTextColor(34, 197, 94);
          pdf.text('Healing Focus:', 25, yPos);
          yPos += 5;
          
          const healingLines = pdf.splitTextToSize(healingRecommendations, pageWidth - 50);
          pdf.text(healingLines, 30, yPos);
          yPos += healingLines.length * 4 + 8;
        }
        
        yPos += 8; // Space between chakras
      });
      
      // PAGE 6: ENHANCED AURA VISUALIZATION AND ANALYSIS
      if (reading.processedAuraImage || reading.imageUrl) {
        try {
          pdf.addPage();
          addPaperBackground();
          
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('AURA VISUALIZATION', pageWidth / 2, 25, { align: 'center' });
          
          // Only show processed aura image centered - no original photo
          const imgWidth = 120;  // Larger width since only one image
          const imgHeight = 160; // Larger height for better visibility
          const startX = (pageWidth - imgWidth) / 2; // Center the single image
          
          // Aura Visualization label
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Processed Aura Analysis with Energy Fields', pageWidth / 2, 45, { align: 'center' });
          
          console.log('Adding processed aura image to PDF...');
          // Add only the processed aura image (no original photo)
          let finalImageSrc = '';
          if (reading.processedAuraImage) {
            if (!reading.processedAuraImage.startsWith('data:')) {
              finalImageSrc = `data:image/jpeg;base64,${reading.processedAuraImage}`;
            } else {
              finalImageSrc = reading.processedAuraImage;
            }
            console.log('Using processed aura image for PDF');
            
            console.log('Final image source for aura visualization:', finalImageSrc.substring(0, 100));
            pdf.addImage(finalImageSrc, 'JPEG', startX, 55, imgWidth, imgHeight);
            console.log('Aura image added successfully to PDF');
          } else {
            // Show message if no processed image available
            pdf.setFontSize(12);
            pdf.setTextColor(107, 114, 128);
            pdf.text('Aura visualization processing in progress...', pageWidth / 2, 120, { align: 'center' });
          }
          
          // Description text - adjusted for much larger images
          pdf.setFontSize(11);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Processed Aura Analysis Visualization with Energy Fields', pageWidth / 2, 190, { align: 'center' });
          
          pdf.setFontSize(9);
          pdf.text('This image shows the spiritual energy colors surrounding your aura field.', pageWidth / 2, 200, { align: 'center' });
          pdf.text('Colors represent different aspects of your personality and energy flow.', pageWidth / 2, 210, { align: 'center' });
          
            
        } catch (error) {
          console.error('Error adding aura image to PDF:', error);
          // Add a page explaining the visualization issue
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('AURA VISUALIZATION', pageWidth / 2, 25, { align: 'center' });
          
          pdf.setFontSize(12);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Aura visualization processing in progress...', pageWidth / 2, 100, { align: 'center' });
          pdf.text('Your aura analysis is complete but visualization is being processed.', pageWidth / 2, 120, { align: 'center' });
          pdf.text('Please check back later for the complete visual analysis.', pageWidth / 2, 140, { align: 'center' });
          
        
        }
      } else {
        // Add page explaining missing visualization
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        pdf.text('AURA VISUALIZATION', pageWidth / 2, 25, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setTextColor(107, 114, 128);
        pdf.text('No visualization image available for this reading.', pageWidth / 2, 100, { align: 'center' });
        pdf.text('The aura analysis data is included in the following pages.', pageWidth / 2, 120, { align: 'center' });
        
        
        console.log('No processed aura image found in reading data');
      }
      
      // PAGE 7: DETAILED SPIRITUAL ANALYSIS AND HEALING RECOMMENDATIONS
      pdf.addPage();
      yPos = drawTitleWithLine('Detailed Spiritual Analysis', 30);
      
      // Complete Detailed Analysis Text with Enhanced Personality & Spiritual Insights
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Comprehensive Personality & Spiritual Analysis', 20, yPos);
      yPos += 15;
      
      // Enhanced personality traits based on aura colors and energy patterns
      const enhancedPersonalityTraits = {
        'Core Personality Traits': {
          'Primary Energy': `Your ${reading.personalityColor} aura reveals strong ${getPersonalityTrait(reading.personalityColor)} characteristics`,
          'Energy Expression': `With an energy level of ${reading.energyLevel}/10, you demonstrate ${getEnergyLevelTrait(reading.energyLevel)} spiritual presence`,
          'Color Influence': `${reading.personalityColor} energy brings ${getColorInfluence(reading.personalityColor)} to your personality`,
          'Chakra Dominance': `Your chakra profile shows strength in ${getStrongestChakra(allChakraData)} energy center`
        },
        'Spiritual Characteristics': {
          'Intuitive Nature': getIntuitiveNature(allChakraData.thirdEye, allChakraData.crown),
          'Healing Abilities': getHealingAbilities(allChakraData.heart, reading.personalityColor),
          'Psychic Sensitivity': getPsychicSensitivity(allChakraData.thirdEye, allChakraData.soulStar),
          'Spiritual Leadership': getSpiritualLeadership(allChakraData.throat, allChakraData.crown)
        },
        'Growth Opportunities': {
          'Areas for Development': getGrowthAreas(allChakraData),
          'Spiritual Practices': getRecommendedPractices(reading.personalityColor, allChakraData),
          'Energy Work Focus': getEnergyWorkFocus(allChakraData),
          'Life Path Guidance': getLifePathGuidance(reading.personalityColor, reading.energyLevel)
        }
      };
      
      Object.entries(enhancedPersonalityTraits).forEach(([category, traits]) => {
        if (yPos > 240) {
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('PERSONALITY ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(category, 20, yPos);
        yPos += 12;
        
        Object.entries(traits as Record<string, string>).forEach(([trait, description]) => {
          if (yPos > 250) {
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.setTextColor(147, 51, 234);
            pdf.text('PERSONALITY ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
            yPos = 40;
          }
          
          pdf.setFontSize(11);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`• ${trait}:`, 25, yPos);
          yPos += 8;
          
          pdf.setFontSize(9);
          pdf.setTextColor(75, 85, 99);
          const descLines = pdf.splitTextToSize(description, pageWidth - 45);
          pdf.text(descLines, 30, yPos);
          yPos += descLines.length * 4 + 8;
        });
        
        yPos += 10;
      });
      
      // Original detailed analysis if available
      if (detailedAnalysis && detailedAnalysis !== 'Advanced spiritual development with balanced energy flow.' && detailedAnalysis.length > 50) {
        if (yPos > 200) {
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('PROFESSIONAL ANALYSIS', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Professional Healer Analysis', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const analysisLines = pdf.splitTextToSize(detailedAnalysis, pageWidth - 40);
        pdf.text(analysisLines, 25, yPos);
        yPos += analysisLines.length * 4 + 20;
      }
      
      // Healing Recommendations
      yPos = drawInfoBox('Professional Healing Recommendations', {
        'Color Therapy': `Use ${reading.personalityColor.toLowerCase()} in meditation and surroundings`,
        'Gemstone Healing': `Carry ${getGemstoneForColor(reading.personalityColor)} for energy balance`,
        'Chakra Work': 'Focus on balancing your most active energy centers',
        'Daily Practice': `Meditate on ${getDayForColor(reading.personalityColor)} for optimal results`,
        'Energy Protection': 'Use white light visualization for spiritual protection'
      }, yPos);
      
      // Professional Healer Notes
      if (reading.healerNotes || editedNotes) {
        yPos += 20;
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Professional Healer Notes', 20, yPos);
        yPos += 15;
        
        // Add notes in a styled box
        pdf.setFillColor(254, 252, 232);
        pdf.rect(15, yPos - 5, pageWidth - 30, 40, 'F');
        pdf.setDrawColor(251, 191, 36);
        pdf.setLineWidth(1);
        pdf.rect(15, yPos - 5, pageWidth - 30, 40, 'S');
        
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const notes = editedNotes || reading.healerNotes || "Professional insights and recommendations will be added here.";
        const notesLines = pdf.splitTextToSize(notes, pageWidth - 40);
        pdf.text(notesLines, 20, yPos + 5);
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated by AuraEye - Professional Report for ${reading.name}`, 20, pageHeight - 10);
      pdf.text(`Analysis Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, pageWidth - 80, pageHeight - 10);
      
      // Save the PDF and store it for future retrieval
      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const fileName = `ascendant-aura-report-${reading.name}-${timestamp}.pdf`;
      
      // Get PDF as base64 string for storage
      let pdfData;
      try {
        pdfData = pdf.output('datauristring').split(',')[1]; // Remove data:application/pdf;base64, prefix
        console.log('PDF generated successfully, size:', pdfData.length, 'characters');
      } catch (pdfError: any) {
        console.error('Error converting PDF to base64:', pdfError);
        throw new Error('Failed to convert PDF to base64: ' + String(pdfError?.message || pdfError));
      }
      
      // Store the PDF in database for exact retrieval later
      try {
        await fetch('/api/pdf-storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            auraReadingId: reading.id,
            fileName: fileName,
            pdfData: pdfData,
            clientName: reading.name
          }),
        });
        console.log('PDF stored successfully for future retrieval');
      } catch (error) {
        console.error('Error storing PDF:', error);
        // Continue with download even if storage fails
      }
      
      // Download the PDF
      pdf.save(fileName);
      
      toast({
        title: "PDF Generated",
        description: `Enhanced Ascendant Report downloaded successfully`,
      });
      
      // PAGE 4: OLD DETAILED CHAKRA ANALYSIS (keeping this for compatibility)
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('DETAILED CHAKRA ANALYSIS', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Chakra Profile
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Your Chakra Profile', 20, yPos);
      yPos += 15;
      
      // Calculate chakra percentages using shared utility
      const { higherPercent, middlePercent, lowerPercent } = calculateChakraGroupPercentages(allChakraData);
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`• Higher Chakras (Spiritual): ${higherPercent}%`, 25, yPos);
      yPos += 10;
      pdf.text(`• Middle Chakras (Emotional): ${middlePercent}%`, 25, yPos);
      yPos += 10;
      pdf.text(`• Lower Chakras (Physical): ${lowerPercent}%`, 25, yPos);
      yPos += 20;
      
      // Detailed Analysis
      pdf.setFontSize(14);
      pdf.text('Primary Chakra Connection - ' + reading.personalityColor + ':', 20, yPos);
      pdf.setFontSize(11);
      const primaryConnection = `Personal power radiating from your core, giving you confidence and strong willpower. This energy helps you assert yourself and make decisions from a place of inner strength.`;
      const primaryLines = pdf.splitTextToSize(primaryConnection, pageWidth - 40);
      pdf.text(primaryLines, 20, yPos + 15);
      
      yPos += primaryLines.length * 6 + 30;
      
      pdf.setFontSize(14);
      pdf.text('Secondary Chakra Connection - ' + reading.givingColor + ':', 20, yPos);
      pdf.setFontSize(11);
      const secondaryConnection = `Protection of the divine and of spiritual connection.`;
      const secondaryLines = pdf.splitTextToSize(secondaryConnection, pageWidth - 40);
      pdf.text(secondaryLines, 20, yPos + 15);
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      
      // PAGE 5: COMPLETE COLOR ANALYSIS & LIFE SCORES
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('COMPLETE COLOR ANALYSIS & LIFE SCORES', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Complete Color Position Analysis
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('4-Position Aura Color Analysis', 20, yPos);
      yPos += 15;
      
      // All 4 aura colors with detailed meanings
      const colorPositions = [
        { position: 'Thinking', color: reading.personalityColor, meaning: 'Your thinking essence and thought nature' },
        { position: 'Receiving', color: reading.givingColor, meaning: 'How you recieve and absorb energy to others' },
        { position: 'Giving', color: reading.receivingColor, meaning: 'How you give and project energy to environment' },
        { position: 'Personality', color: reading.thinkingColor, meaning: 'Your core and patterns' }
      ];
      
      // Use same comprehensive color meanings from COMPLETE COLOR SPECTRUM section
      const auraColorMeanings: { [key: string]: string } = {
        'Red': 'Passion, vitality, courage, strength, leadership energy',
        'Orange': 'Creativity, enthusiasm, confidence, social energy, motivation',  
        'Yellow': 'Intelligence, wisdom, optimism, mental clarity, joy',
        'Green': 'Healing, balance, growth, nature connection, heart energy',
        'Blue': 'Communication, truth, peace, spiritual insight, self-expression',
        'Indigo': 'Intuition, psychic abilities, deep wisdom, spiritual awareness',
        'Violet': 'Spirituality, transformation, divine connection, mysticism',
        'Purple': 'Royalty, mystery, spiritual mastery, higher consciousness',
        'Pink': 'Love, compassion, nurturing, emotional healing, kindness',
        'Brown': 'Grounding, stability, earth connection, practical wisdom',
        'Black': 'Protection, mystery, transformation, shadow work, absorption',
        'White': 'Purity, divine light, spiritual protection, clarity, truth',
        'Gold': 'Divine wisdom, enlightenment, spiritual achievement, abundance',
        'Silver': 'Intuitive insight, feminine energy, lunar connection, psychic gift',
        'Gray': 'Neutrality, balance, contemplation, spiritual transition',
        'Turquoise': 'Healing communication, emotional clarity, spiritual growth',
        'Magenta': 'Universal love, spiritual service, compassion, divine purpose',
        'Coral': 'Emotional warmth, creative expression, gentle strength'
      };

      colorPositions.forEach((pos) => {
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`${pos.position} Energy: ${pos.color}`, 25, yPos);
        yPos += 8;
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const posLines = pdf.splitTextToSize(pos.meaning, pageWidth - 50);
        pdf.text(posLines, 30, yPos);
        yPos += posLines.length * 5 + 3;
        
        // Add comprehensive color meaning for the zone color
        const comprehensiveColorMeaning = auraColorMeanings[pos.color];
        if (comprehensiveColorMeaning) {
          pdf.setFontSize(9);
          pdf.setTextColor(34, 197, 94); // Green color for spiritual meaning
          pdf.text(`${pos.color} Meaning:`, 35, yPos);
          yPos += 5;
          
          pdf.setFontSize(9);
          pdf.setTextColor(75, 85, 99);
          const colorMeaningLines = pdf.splitTextToSize(comprehensiveColorMeaning, pageWidth - 70);
          pdf.text(colorMeaningLines, 40, yPos);
          yPos += colorMeaningLines.length * 4 + 5;
        }
        
        // Add color-specific meanings from stored data (if available)
        const meaning = colorMeanings[pos.color];
        if (meaning && typeof meaning === 'object') {
          if (meaning.positive) {
            pdf.setFontSize(9);
            pdf.setTextColor(34, 197, 94);
            pdf.text('Positive Traits:', 35, yPos);
            yPos += 5;
            const positiveLines = pdf.splitTextToSize(meaning.positive, pageWidth - 60);
            pdf.text(positiveLines, 40, yPos);
            yPos += positiveLines.length * 4 + 3;
          }
          
          if (meaning.negative) {
            pdf.setFontSize(9);
            pdf.setTextColor(239, 68, 68);
            pdf.text('Growth Areas:', 35, yPos);
            yPos += 5;
            const negativeLines = pdf.splitTextToSize(meaning.negative, pageWidth - 60);
            pdf.text(negativeLines, 40, yPos);
            yPos += negativeLines.length * 4 + 5;
          }
        }
        yPos += 8;
        
        if (yPos > 250) {
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('COLOR ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
      });
      
      // Enhanced Life Score Analysis with Comprehensive Assessment
      if (yPos < 150) {
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Complete Life Assessment & Spiritual Development', 20, yPos);
        yPos += 15;
        
        // Calculate comprehensive life scores using exact formulas from aura analysis
        const comprehensiveLifeScores = {
          'Love & Relationships': {
            score: ((0.4 * allChakraData.heart) + (0.3 * allChakraData.sacral) + (0.3 * allChakraData.throat)).toFixed(1),
            description: 'Emotional openness & authentic expression, capacity for love, intimacy, emotional connection',
            guidance: 'Heart chakra healing, emotional expression, relationship work, authentic communication'
          },
          'Emotional Stability': {
            score: ((0.4 * allChakraData.sacral) + (0.3 * allChakraData.heart) + (0.3 * allChakraData.root)).toFixed(1),
            description: 'Emotional maturity & self-soothing ability, resilience under stress and emotional regulation',
            guidance: 'Emotional healing, self-care practices, grounding work, stress management techniques'
          },
          'Protection Score': {
            score: ((0.4 * allChakraData.root) + (0.3 * allChakraData.soulStar) + (0.2 * allChakraData.solarPlexus) + (0.1 * allChakraData.thirdEye)).toFixed(1),
            description: 'Spiritual boundary & auric shield strength, energetic protection and boundary maintenance',
            guidance: 'Boundary setting, protection rituals, energy shielding practices, spiritual cleansing'
          },
          'Money & Abundance': {
            score: ((0.3 * allChakraData.root) + (0.3 * allChakraData.solarPlexus) + (0.4 * allChakraData.earthStar)).toFixed(1),
            description: 'Groundedness & wealth mindset, financial flow and material manifestation ability',
            guidance: 'Abundance mindset work, financial healing, earth connection, material grounding practices'
          },
          'Career & Purpose': {
            score: ((0.4 * allChakraData.solarPlexus) + (0.3 * allChakraData.thirdEye) + (0.3 * allChakraData.crown)).toFixed(1),
            description: 'Vision, action & divine guidance alignment, professional fulfillment and life direction',
            guidance: 'Personal power development, vision clarity work, spiritual guidance connection'
          },
          'Spiritual Growth': {
            score: ((0.4 * allChakraData.crown) + (0.3 * allChakraData.thirdEye) + (0.3 * allChakraData.soulStar)).toFixed(1),
            description: 'Higher wisdom & divine intuition, connection to higher consciousness and spiritual expansion',
            guidance: 'Meditation practice, divine connection, spiritual study, crown chakra activation'
          },
          'Physical Vitality': {
            score: ((0.4 * allChakraData.root) + (0.3 * allChakraData.solarPlexus) + (0.3 * allChakraData.sacral)).toFixed(1),
            description: 'Physical health, energy levels, material world grounding and bodily vitality',
            guidance: 'Grounding exercises, physical activity, earth connection, energetic vitality work'
          },
          'Manifestation Power': {
            score: ((0.4 * allChakraData.solarPlexus) + (0.3 * allChakraData.root) + (0.2 * allChakraData.thirdEye) + (0.1 * allChakraData.sacral)).toFixed(1),
            description: 'Converting visions into tangible results, creative manifestation and reality creation ability',
            guidance: 'Vision work, action taking skills, creative practices, manifestation techniques'
          }
        };
        
        Object.entries(comprehensiveLifeScores).forEach(([area, details]) => {
          if (yPos > 240) {
            pdf.addPage();
            addPaperBackground();
            pdf.setFontSize(18);
            pdf.setTextColor(147, 51, 234);
            pdf.text('LIFE ASSESSMENT (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
            yPos = 40;
          }
          
          const percentage = details.score * 10;
          pdf.setFontSize(12);
          pdf.setTextColor(147, 51, 234);
          pdf.text(`${area}: ${details.score}/10 (${percentage}%)`, 25, yPos);
          yPos += 8;
          
          pdf.setFontSize(9);
          pdf.setTextColor(55, 65, 81);
          const descLines = pdf.splitTextToSize(details.description, pageWidth - 50);
          pdf.text(descLines, 30, yPos);
          yPos += descLines.length * 4 + 2;
          
          pdf.setFontSize(8);
          pdf.setTextColor(34, 197, 94);
          const guidanceLines = pdf.splitTextToSize(`Focus: ${details.guidance}`, pageWidth - 50);
          pdf.text(guidanceLines, 30, yPos);
          yPos += guidanceLines.length * 3 + 8;
        });
        
        // Overall Assessment
        const totalScore = Object.values(comprehensiveLifeScores).reduce((sum, item) => sum + item.score, 0);
        const averageScore = Math.round(totalScore / Object.keys(comprehensiveLifeScores).length);
        
        if (yPos > 240) {
          pdf.addPage();
          addPaperBackground();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('OVERALL ASSESSMENT', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
        
        yPos += 10;
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPos - 5, pageWidth - 30, 30, 'F');
        pdf.setDrawColor(147, 51, 234);
        pdf.setLineWidth(1);
        pdf.rect(15, yPos - 5, pageWidth - 30, 30, 'S');
        
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`Overall Life Balance: ${averageScore}/10 (${averageScore * 10}%)`, 20, yPos + 8);
        
        const overallStatus = averageScore >= 8 ? 'Excellent - Thriving in most life areas' : 
                             averageScore >= 6 ? 'Good - Strong foundation with room for growth' : 
                             averageScore >= 4 ? 'Developing - Building balance across life areas' : 
                             'Growth Phase - Focus on foundational healing';
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`Assessment: ${overallStatus}`, 20, yPos + 18);
        yPos += 35;
      }
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      
      // PAGE 6: DETAILED ANALYSIS FROM ANALYSIS TABS
      pdf.addPage();
      addPaperBackground();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('DETAILED AURA ANALYSIS', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Complete Detailed Analysis Text
      if (detailedAnalysis && detailedAnalysis !== 'Advanced spiritual development with balanced energy flow.') {
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Complete Detailed Analysis', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const analysisLines = pdf.splitTextToSize(detailedAnalysis, pageWidth - 40);
        pdf.text(analysisLines, 25, yPos);
        yPos += analysisLines.length * 4 + 20;
        
        // Check if we need a new page
        if (yPos > 220) {
          pdf.addPage();
          addPaperBackground();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('DETAILED ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 45;
        }
      }
      
      // Spiritual Guidance Section
      if (spiritualGuidance && spiritualGuidance !== 'No spiritual guidance available') {
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Spiritual Guidance', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const guidanceLines = pdf.splitTextToSize(spiritualGuidance, pageWidth - 40);
        pdf.text(guidanceLines, 25, yPos);
        yPos += guidanceLines.length * 4 + 20;
      }
      
      // Zone-specific Analysis (from Zones tab)
    
      
      // Personality Traits Section
      if (personalityTraits && personalityTraits.length > 0) {
        if (yPos > 200) {
          pdf.addPage();
          addPaperBackground();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('PERSONALITY TRAITS', pageWidth / 2, 25, { align: 'center' });
          yPos = 45;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Personality Traits & Characteristics', 20, yPos);
        yPos += 15;
        
        personalityTraits.forEach((trait: any) => {
          pdf.setFontSize(12);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`• ${trait}`, 25, yPos);
          yPos += 12;
        });
        yPos += 15;
      }
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      
      // PAGE 7: COMPLETE AURA COLOR SPECTRUM ANALYSIS
      const auraSpectrumData = parseJsonField(reading.auraColorSpectrum);
      if (auraSpectrumData && Array.isArray(auraSpectrumData) && auraSpectrumData.length > 0) {
        pdf.addPage();
        addPaperBackground();
        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        pdf.text('COMPLETE AURA COLOR SPECTRUM', pageWidth / 2, 25, { align: 'center' });
        
        pdf.setDrawColor(147, 51, 234);
        pdf.setLineWidth(0.5);
        pdf.line(30, 35, pageWidth - 30, 35);
        
        yPos = 50;
        
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Full Aura Color Analysis', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`Complete color spectrum detected: ${auraSpectrumData.join(', ')}`, 25, yPos);
        yPos += 20;
        
        // Color meanings for comprehensive aura analysis
        const auraColorMeanings: { [key: string]: string } = {
          'Red': 'Passion, vitality, courage, strength, leadership energy',
          'Orange': 'Creativity, enthusiasm, confidence, social energy, motivation',  
          'Yellow': 'Intelligence, wisdom, optimism, mental clarity, joy',
          'Green': 'Healing, balance, growth, nature connection, heart energy',
          'Blue': 'Communication, truth, peace, spiritual insight, self-expression',
          'Indigo': 'Intuition, psychic abilities, deep wisdom, spiritual awareness',
          'Violet': 'Spirituality, transformation, divine connection, mysticism',
          'Purple': 'Royalty, mystery, spiritual mastery, higher consciousness',
          'Pink': 'Love, compassion, nurturing, emotional healing, kindness',
          'Brown': 'Grounding, stability, earth connection, practical wisdom',
          'Black': 'Protection, mystery, transformation, shadow work, absorption',
          'White': 'Purity, divine light, spiritual protection, clarity, truth',
          'Gold': 'Divine wisdom, enlightenment, spiritual achievement, abundance',
          'Silver': 'Intuitive insight, feminine energy, lunar connection, psychic gift',
          'Gray': 'Neutrality, balance, contemplation, spiritual transition',
          'Turquoise': 'Healing communication, emotional clarity, spiritual growth',
          'Magenta': 'Universal love, spiritual service, compassion, divine purpose',
          'Coral': 'Emotional warmth, creative expression, gentle strength'
        };

        // Individual color analysis from the spectrum
        auraSpectrumData.forEach((color: string, index: number) => {
          if (yPos > 240) {
            pdf.addPage();
            addPaperBackground();
            pdf.setFontSize(18);
            pdf.setTextColor(147, 51, 234);
            pdf.text('COLOR SPECTRUM (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
            yPos = 45;
          }
          
          pdf.setFontSize(14);
          pdf.setTextColor(147, 51, 234);
          pdf.text(`${index + 1}. ${color} Energy`, 25, yPos);
          yPos += 12;
          
          // Use comprehensive color meanings first, with stored data as fallback
          const colorMeaningsData = parseJsonField(reading.colorMeanings);
          const storedMeaning = colorMeaningsData && colorMeaningsData[color];
          const comprehensiveMeaning = auraColorMeanings[color];
          
          if (storedMeaning && storedMeaning.description) {
            // Use stored detailed meaning if available
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81);
            const descLines = pdf.splitTextToSize(storedMeaning.description, pageWidth - 60);
            pdf.text(descLines, 30, yPos);
            yPos += descLines.length * 4 + 5;
            
            if (storedMeaning.positive) {
              pdf.setFontSize(9);
              pdf.setTextColor(34, 197, 94);
              pdf.text('Positive Aspects:', 35, yPos);
              yPos += 5;
              const positiveLines = pdf.splitTextToSize(storedMeaning.positive, pageWidth - 70);
              pdf.text(positiveLines, 40, yPos);
              yPos += positiveLines.length * 4 + 3;
            }
            
            if (storedMeaning.growth) {
              pdf.setFontSize(9);
              pdf.setTextColor(239, 68, 68);
              pdf.text('Growth Areas:', 35, yPos);
              yPos += 5;
              const growthLines = pdf.splitTextToSize(storedMeaning.growth, pageWidth - 70);
              pdf.text(growthLines, 40, yPos);
              yPos += growthLines.length * 4 + 8;
            }
          } else if (comprehensiveMeaning) {
            // Use comprehensive color meaning
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81);
            const meaningLines = pdf.splitTextToSize(comprehensiveMeaning, pageWidth - 60);
            pdf.text(meaningLines, 30, yPos);
            yPos += meaningLines.length * 4 + 8;
          } else {
            // Fallback message
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81);
            pdf.text(`${color} energy contributes to your overall aura composition and spiritual development.`, 30, yPos);
            yPos += 12;
          }
          
          yPos += 8;
        });
        
        pdf.setFontSize(8);
        pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      }
      
      // PAGE 8: HEALING RECOMMENDATIONS & REMEDIES
      pdf.addPage();
      addPaperBackground();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('HEALING RECOMMENDATIONS', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Personalized healing recommendations based on colors
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Personalized Healing Guidance', 20, yPos);
      yPos += 15;
      
      // Color-specific recommendations
      const healingRecommendations = [
        {
          title: `${reading.personalityColor} Thinking Enhancement`,
          content: `Wear ${reading.personalityColor.toLowerCase()} clothing or carry ${reading.personalityColor.toLowerCase()} crystals to amplify your natural personality traits. This color supports your core essence and authentic self-expression.`
        },
        {
          title: `${reading.givingColor} Receiving Energy Balance`,
          content: `Incorporate ${reading.givingColor.toLowerCase()} elements in your environment to enhance your natural giving abilities. This helps balance how you share energy with others.`
        },
        {
          title: `${reading.receivingColor} Giving Energy Optimization`,
          content: `Practice meditation with ${reading.receivingColor.toLowerCase()} visualization to improve your ability to receive and process external energies effectively.`
        },
        {
          title: `${reading.thinkingColor} Personality Enhancement`,
          content: `Use ${reading.thinkingColor.toLowerCase()} light therapy or surround yourself with this color during mental activities to support clear thinking and spiritual processing.`
        }
      ];
      
      healingRecommendations.forEach((rec) => {
        if (yPos > 220) {
          pdf.addPage();
          addPaperBackground();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('HEALING GUIDANCE (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 45;
        }
        
        pdf.setFontSize(12);
        pdf.setTextColor(147, 51, 234);
        pdf.text(rec.title, 25, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const recLines = pdf.splitTextToSize(rec.content, pageWidth - 50);
        pdf.text(recLines, 30, yPos);
        yPos += recLines.length * 4 + 15;
      });
      
      // General healing practices
      if (yPos > 180) {
        pdf.addPage();
        addPaperBackground();
        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        pdf.text('GENERAL HEALING PRACTICES', pageWidth / 2, 25, { align: 'center' });
        yPos = 45;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Daily Spiritual Practices', 20, yPos);
      yPos += 15;
      
      const generalPractices = [
        'Color breathing exercises with your primary aura colors',
        'Crystal meditation using stones that match your aura spectrum',
        'Chakra balancing focused on your most active energy centers',
        'Energy protection visualizations before entering crowded spaces',
        'Regular aura cleansing through sage, sound healing, or salt baths',
        'Journaling to track energy patterns and spiritual growth'
      ];
      
      generalPractices.forEach((practice) => {
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`• ${practice}`, 25, yPos);
        yPos += 12;
      });
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      
      // PAGE 7: CHAKRA REMEDIES & HEALING GUIDANCE
      pdf.addPage();
      addPaperBackground();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('CHAKRA REMEDIES & HEALING GUIDANCE', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Comprehensive Chakra Healing Information
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Complete Healing Guidance for All Chakras', 20, yPos);
      yPos += 15;
      
      const chakraRemedies = {
        'Root Chakra': {
          mantras: 'LAM (pronounced LAHM)',
          affirmations: 'I am safe, grounded, and secure',
          colors: 'Red, Black, Brown',
          crystals: 'Red Jasper, Hematite, Garnet',
          essentialOils: 'Cedarwood, Patchouli, Vetiver',
          practices: 'Walking barefoot, gardening, grounding exercises'
        },
        'Sacral Chakra': {
          mantras: 'VAM (pronounced VAHM)', 
          affirmations: 'I embrace creativity and joy',
          colors: 'Orange, Coral',
          crystals: 'Carnelian, Orange Calcite, Moonstone',
          essentialOils: 'Sweet Orange, Ylang-ylang, Sandalwood',
          practices: 'Creative arts, dancing, water meditation'
        },
        'Solar Plexus Chakra': {
          mantras: 'RAM (pronounced RAHM)',
          affirmations: 'I am confident and powerful',
          colors: 'Yellow, Gold',
          crystals: 'Citrine, Yellow Topaz, Tiger\'s Eye',
          essentialOils: 'Lemon, Ginger, Bergamot',
          practices: 'Sun meditation, core strengthening, breathwork'
        },
        'Heart Chakra': {
          mantras: 'YAM (pronounced YAHM)',
          affirmations: 'I give and receive love freely',
          colors: 'Green, Pink',
          crystals: 'Rose Quartz, Green Aventurine, Malachite',
          essentialOils: 'Rose, Eucalyptus, Pine',
          practices: 'Loving-kindness meditation, heart opening yoga'
        },
        'Throat Chakra': {
          mantras: 'HAM (pronounced HAHM)',
          affirmations: 'I speak my truth with confidence',
          colors: 'Blue, Turquoise',
          crystals: 'Blue Lace Agate, Sodalite, Aquamarine',
          essentialOils: 'Eucalyptus, Chamomile, Frankincense',
          practices: 'Chanting, singing, authentic communication'
        },
        'Third Eye Chakra': {
          mantras: 'OM (pronounced AUM)',
          affirmations: 'I trust my inner wisdom and intuition',
          colors: 'Indigo, Purple',
          crystals: 'Amethyst, Lapis Lazuli, Fluorite',
          essentialOils: 'Lavender, Clary Sage, Rosemary',
          practices: 'Meditation, visualization, dream work'
        },
        'Crown Chakra': {
          mantras: 'OM or Silence',
          affirmations: 'I am connected to divine wisdom',
          colors: 'Violet, White, Gold',
          crystals: 'Clear Quartz, Amethyst, Selenite',
          essentialOils: 'Frankincense, Lavender, Sandalwood',
          practices: 'Silent meditation, prayer, spiritual study'
        },
        'Soul Star Chakra': {
          mantras: 'AH (pronounced AHH)',
          affirmations: 'I align with my soul purpose',
          colors: 'White, Magenta, Gold',
          crystals: 'Moldavite, Phenacite, Clear Quartz',
          essentialOils: 'Frankincense, Sandalwood, Lotus',
          practices: 'Soul meditation, past-life work, spiritual connection'
        },
        'Earth Star Chakra': {
          mantras: 'UH (pronounced UHH)',
          affirmations: 'I am connected to Earth energy',
          colors: 'Brown, Black, Deep Red',
          crystals: 'Hematite, Black Tourmaline, Smoky Quartz',
          essentialOils: 'Vetiver, Patchouli, Cedarwood',
          practices: 'Earth connection, ancestral healing, grounding'
        }
      };
      
      Object.entries(chakraRemedies).forEach(([chakraName, remedies]) => {
        if (yPos > 220) {
          pdf.addPage();
          addPaperBackground();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('CHAKRA REMEDIES (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(chakraName, 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(9);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`Mantras: ${remedies.mantras}`, 25, yPos);
        yPos += 6;
        pdf.text(`Affirmations: ${remedies.affirmations}`, 25, yPos);
        yPos += 6;
        pdf.text(`Colors: ${remedies.colors}`, 25, yPos);
        yPos += 6;
        pdf.text(`Crystals: ${remedies.crystals}`, 25, yPos);
        yPos += 6;
        pdf.text(`Essential Oils: ${remedies.essentialOils}`, 25, yPos);
        yPos += 6;
        pdf.text(`Practices: ${remedies.practices}`, 25, yPos);
        yPos += 12;
      });
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform ', 20, pageHeight - 10);
      
     
      
      // Professional Healer Notes
      if (reading.healerNotes || editedNotes) {
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Professional Healer Notes', 20, yPos);
        yPos += 15;
        
        // Add notes in a styled box
        pdf.setFillColor(254, 252, 232);
        pdf.rect(15, yPos - 5, pageWidth - 30, 40, 'F');
        pdf.setDrawColor(251, 191, 36);
        pdf.setLineWidth(1);
        pdf.rect(15, yPos - 5, pageWidth - 30, 40, 'S');
        
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const notes = editedNotes || reading.healerNotes || "Professional insights and recommendations will be added here.";
        const notesLines = pdf.splitTextToSize(notes, pageWidth - 40);
        pdf.text(notesLines, 20, yPos + 5);
      }
      
      // This duplicate section removed - PDF completion handled above
      
    } catch (error) {
      console.error('PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Full error details:', errorMessage);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "PDF Generation Failed",
        description: `Error: ${errorMessage}. Please check console for details.`,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-purple-800">{reading.name}</CardTitle>
            <CardDescription className="text-purple-600">
              {format(new Date(reading.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              Energy: {reading.energyLevel}/10
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateComprehensivePDF(reading)}
              disabled={isGeneratingPDF}
              title="Download Complete PDF Report"
            >
              {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-reading-id={reading.id}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chakras">Chakras</TabsTrigger>
           
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Aura Visualization Image */}
            {(reading.processedAuraImage || reading.imageUrl) && (
              <div className="text-center mb-6">
                <h4 className="font-semibold text-lg mb-3">Aura Visualization</h4>
                <div className="flex justify-center">
                  <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-purple-200">
                    <img
                      src={reading.processedAuraImage ? 
                        (reading.processedAuraImage.startsWith('data:') ? 
                          reading.processedAuraImage : 
                          `data:image/jpeg;base64,${reading.processedAuraImage}`
                        ) : 
                        (reading.imageUrl.startsWith('http') || reading.imageUrl.startsWith('data:') ? 
                          reading.imageUrl : 
                          `/api/image/${reading.imageUrl}`
                        )
                      }
                      alt={`Aura visualization for ${reading.name}`}
                      className="max-w-sm max-h-64 object-contain"
                      onError={(e) => {
                        // Fallback to original image if processed image fails
                        const img = e.target as HTMLImageElement;
                        if (reading.imageUrl && !img.src.includes(reading.imageUrl)) {
                          img.src = reading.imageUrl.startsWith('http') || reading.imageUrl.startsWith('data:') ? 
                            reading.imageUrl : 
                            `/api/image/${reading.imageUrl}`;
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Aura Colors Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.personalityColor)}`}></div>
                <p className="text-sm font-medium">Thinking</p>
                <p className="text-xs text-gray-600">{reading.personalityColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.receivingColor)}`}></div>
                <p className="text-sm font-medium">Giving</p>
                <p className="text-xs text-gray-600">{reading.receivingColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.givingColor)}`}></div>
                <p className="text-sm font-medium">Receiving</p>
                <p className="text-xs text-gray-600">{reading.givingColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.thinkingColor)}`}></div>
                <p className="text-sm font-medium">Personality</p>
                <p className="text-xs text-gray-600">{reading.thinkingColor}</p>
              </div>
            </div>

            {/* Spiritual Guidance Section */}
            {reading.spiritualGuidance && (
              <div className="bg-white border border-slate-300 rounded-lg p-4">
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h3 className="text-lg font-bold text-slate-800">SPIRITUAL GUIDANCE</h3>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{reading.spiritualGuidance}</p>
                </div>
              </div>
            )}

            {/* Personality Traits Section */}
            {Array.isArray(personalityTraits) && personalityTraits.length > 0 && (
              <div className="bg-white border border-slate-300 rounded-lg p-4">
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h3 className="text-lg font-bold text-slate-800">PERSONALITY TRAITS</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {personalityTraits.map((trait, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-lg px-3 py-2 text-center">
                      <span className="text-sm font-semibold text-purple-800">{trait}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chakras" className="space-y-6">
            <h4 className="font-semibold text-lg mb-3">Chakra Activity Levels</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHAKRA_KEYS.map(chakraKey => {
                  // Use calculated values for Soul Star and Earth Star chakras, basic chakraActivity for others
                  const getChakraScore = (key: ChakraKey): number => {
                    if (key === 'soulStar') {
                      return Math.round(calculateSoulStarChakra(reading) / 10);
                    }
                    if (key === 'earthStar') {
                      return Math.round(calculateEarthStarChakra(reading) / 10);
                    }
                    // For all other chakras, use stored values with proper defaults
                    const defaults = {
                      'crown': 6,
                      'thirdEye': 7,
                      'throat': 6,
                      'heart': 8,
                      'solarPlexus': 7,
                      'sacral': 6,
                      'root': 8
                    };
                    return chakraActivity[key] || defaults[key] || 5;
                  };
                  
                  const score = getChakraScore(chakraKey);
                  const numScore = Number(score);
                  const chakraStatus = getChakraStatus(numScore);
                  
                  return (
                      <div key={chakraKey} className={`p-4 bg-gradient-to-r ${chakraStatus.bgColor} rounded-lg`}>
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{CHAKRA_DISPLAY_NAMES[chakraKey]}</span>
                              <span className="text-sm font-bold text-indigo-600">{numScore}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${(numScore / 10) * 100}%` }}
                              ></div>
                          </div>
                          <div className={`text-xs font-medium ${chakraStatus.color} capitalize`}>
                              {chakraStatus.status}
                          </div>
                      </div>
                  );
              })}
            </div>
          </TabsContent>
          
          
          
          <TabsContent value="analysis" className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Complete Analysis</h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reading.detailedAnalysis || reading.analysis}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Healer Notes Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-lg mb-3">Professional Notes</h4>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add your professional insights, additional observations, or recommendations..."
                className="min-h-32"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  disabled={updateReadingMutation.isPending}
                  size="sm"
                >
                  {updateReadingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {editedNotes || reading.healerNotes ? (
                <p className="text-sm text-gray-700">{editedNotes || reading.healerNotes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No professional notes added yet. Click edit to add your insights.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Detailed Numerology Reading Card Component
function DetailedNumerologyReadingCard({ reading }: { reading: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(reading.healerNotes || "");
  const { toast } = useToast();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  
  const updateReadingMutation = useMutation({
    mutationFn: async (notes: string) => {
      await apiRequest('PATCH', `/api/numerology-readings/${reading.id}/notes`, { healerNotes: notes });
    },
    onSuccess: () => {
      toast({
        title: "Notes Updated",
        description: "Your reading notes have been saved successfully."
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/healer-numerology-readings"] });
    }
  });

  const saveNotes = () => {
    updateReadingMutation.mutate(editedNotes);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Numerology Reading Report", 105, 20, { align: "center" });
    
    // Client information
    pdf.setFontSize(12);
    pdf.text(`Client: ${reading.name}`, 20, 40);
    pdf.text(`Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, 20, 50);
    pdf.text(`Healer: ${user?.username || 'Unknown'}`, 20, 60);
    
    // Core numbers
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Core Numbers", 20, 80);
    
    pdf.setFontSize(11);
    pdf.text(`Life Path Number: ${reading.lifePathNumber}`, 20, 95);
    pdf.text(`Destiny Number: ${reading.destinyNumber}`, 20, 105);
    pdf.text(`Soul Urge Number: ${reading.soulUrgeNumber}`, 20, 115);
    pdf.text(`Personality Number: ${reading.personalityNumber}`, 20, 125);
    
    // Interpretation
    pdf.setFontSize(14);
    pdf.text("Complete Interpretation", 20, 145);
    
    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(reading.interpretation, 170);
    pdf.text(splitText, 20, 155);
    
    // Healer notes if available
    if (reading.healerNotes) {
      const notesY = 155 + (splitText.length * 4) + 10;
      pdf.setFontSize(14);
      pdf.text("Healer Notes", 20, notesY);
      
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(reading.healerNotes, 170);
      pdf.text(splitNotes, 20, notesY + 10);
    }
    
    // Save the PDF
    pdf.save(`numerology-reading-${reading.name}-${format(new Date(reading.createdAt), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <Card className="border-2 border-slate-200 shadow-lg">
      {/* Professional Numerology Report Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-100 border-b-2 border-slate-200">
        <div className="px-6 py-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">NUMEROLOGY READING REPORT</h2>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto w-36"></div>
          </div>
          
          {/* Report Info Table */}
          <div className="bg-white rounded-lg border border-slate-300 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="font-semibold text-slate-700">Client Name:</span>
                  <span className="text-slate-900 font-bold">{reading.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="font-semibold text-slate-700">Birth Date:</span>
                  <span className="text-slate-900">{reading.birthDate}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="font-semibold text-slate-700">Reading Date:</span>
                  <span className="text-slate-900">{format(new Date(reading.createdAt), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="font-semibold text-slate-700">Reading Time:</span>
                  <span className="text-slate-900">{format(new Date(reading.createdAt), "h:mm a")}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Cancel Edit' : 'Edit Notes'}
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* Core Numbers Section */}
        <div className="bg-white border border-slate-300 rounded-lg p-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h3 className="text-lg font-bold text-slate-800">CORE NUMEROLOGY NUMBERS</h3>
          </div>
          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700">Number Type</th>
                  <th className="border border-slate-300 px-4 py-3 text-center font-semibold text-slate-700">Value</th>
                  <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700">Significance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-3 font-medium text-slate-700">Life Path Number</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-800 font-bold text-xl rounded-full">
                      {reading.lifePathNumber}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-600">Your soul's journey and life purpose</td>
                </tr>
                <tr className="bg-slate-25">
                  <td className="border border-slate-300 px-4 py-3 font-medium text-slate-700">Destiny Number</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-800 font-bold text-xl rounded-full">
                      {reading.destinyNumber}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-600">Your life mission and ultimate goal</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-3 font-medium text-slate-700">Soul Urge Number</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-800 font-bold text-xl rounded-full">
                      {reading.soulUrgeNumber}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-600">Your heart's deepest desires and motivations</td>
                </tr>
                <tr className="bg-slate-25">
                  <td className="border border-slate-300 px-4 py-3 font-medium text-slate-700">Personality Number</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-800 font-bold text-xl rounded-full">
                      {reading.personalityNumber}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-600">How others perceive you externally</td>
                </tr>
                <tr className="bg-gradient-to-r from-emerald-25 to-green-25">
                  <td className="border border-slate-300 px-4 py-3 font-medium text-emerald-700">Personal Year 2025</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 font-bold text-xl rounded-full border-2 border-emerald-300">
                      {reading.personalYearNumber}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-emerald-700 font-medium">Your current year's energy and opportunities</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Interpretation Section */}
        <div className="bg-white border border-slate-300 rounded-lg p-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h3 className="text-lg font-bold text-slate-800">COMPLETE NUMEROLOGY INTERPRETATION</h3>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 max-h-96 overflow-y-auto">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{reading.interpretation}</p>
          </div>
        </div>

        {/* Healer Notes Section */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Professional Notes</h4>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add your professional insights, additional observations, or recommendations..."
                className="min-h-32"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  disabled={updateReadingMutation.isPending}
                  size="sm"
                >
                  {updateReadingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {editedNotes || reading.healerNotes ? (
                <p className="text-sm text-gray-700">{editedNotes || reading.healerNotes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No professional notes added yet. Click edit to add your insights.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HealerDashboard() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingTab, setBookingTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState<HealerBooking | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Password change form schema
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password")
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
      return apiRequest("POST", "/api/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated. Please log in with your new password.",
      });
      passwordForm.reset();
      setIsChangePasswordOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onPasswordSubmit = (data: z.infer<typeof changePasswordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  // Fetch healer's bookings with real-time updates
  const { data: bookings = [], isLoading: isLoadingBookings, refetch } = useQuery<HealerBooking[]>({
    queryKey: ["/api/healer-bookings"],
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Fetch healer analytics
  const { data: analytics } = useQuery<HealerAnalytics>({
    queryKey: ["/api/healer-analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch booking trends
  const { data: trends = [] } = useQuery<BookingTrend[]>({
    queryKey: ["/api/healer-trends"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch healer's own aura readings with immediate updates
  const { data: healerAuraReadings = [], isLoading: isLoadingAuraReadings, refetch: refetchAuraReadings } = useQuery<AuraReading[]>({
    queryKey: ["/api/healer-aura-readings"],
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 30 * 1000, // Keep in cache for 30 seconds only for immediate updates
    refetchInterval: 3000, // Refetch every 3 seconds for very fast updates
  });

  // Fetch healer's own numerology readings with real-time updates
  const { data: healerNumerologyReadings = [] } = useQuery<NumerologyReading[]>({
    queryKey: ["/api/healer-numerology-readings"],
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 0, // Don't cache - always fetch fresh data
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch on reconnection
  });

  // Fetch healer's own vibe readings with immediate updates
  const { data: healerVibeReadings = [], isLoading: isLoadingVibeReadings, refetch: refetchVibeReadings } = useQuery<VibeReading[]>({
    queryKey: ["/api/vibe-readings"],
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 0, // Don't cache - always fetch fresh data
    refetchInterval: 5000, // Refetch every 5 seconds for faster updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch on reconnection
  });

  // State for live numerology calculator
  // Removed numerology state variables as numerology analysis was removed from Spiritual Tools tab

  // Mutation for responding to bookings
  const respondToBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, healerResponse }: { 
      bookingId: number; 
      status: string; 
      healerResponse?: string 
    }) => {
      return apiRequest("PATCH", `/api/booking/${bookingId}/status`, { status, healerResponse });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking response sent successfully",
      });
      setIsDialogOpen(false);
      setSelectedBooking(null);
      setResponseMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/healer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/healer-analytics"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to booking",
        variant: "destructive",
      });
    },
  });

  const handleBookingResponse = (booking: HealerBooking, status: 'accepted' | 'rejected') => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
    // Pre-fill response based on status
    if (status === 'accepted') {
      setResponseMessage("Thank you for booking with me! I'll be happy to help you on your spiritual journey.");
    } else {
      setResponseMessage("I appreciate your interest, but I'm currently unable to take on new clients at this time.");
    }
  };

  const submitResponse = () => {
    if (!selectedBooking) return;
    
    const status = responseMessage.toLowerCase().includes('thank you') || 
                  responseMessage.toLowerCase().includes('happy') ? 'accepted' : 'rejected';
    
    respondToBookingMutation.mutate({
      bookingId: selectedBooking.id,
      status,
      healerResponse: responseMessage,
    });
  };

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const renderBookingCard = (booking: HealerBooking) => (
    <Card key={booking.id} className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Client #{booking.userId}</span>
              <Badge variant={
                booking.status === 'accepted' ? 'default' :
                booking.status === 'rejected' ? 'destructive' : 'secondary'
              }>
                {booking.status}
              </Badge>
            </div>
            
            {booking.message && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  {booking.message}
                </p>
              </div>
            )}
            
            {booking.healerResponse && (
              <div className="mb-2 p-2 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Your response:</strong> {booking.healerResponse}
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              <Clock className="h-3 w-3 inline mr-1" />
              {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
              {booking.respondedAt && (
                <span className="ml-2">
                  • Responded: {format(new Date(booking.respondedAt), "MMM d, yyyy")}
                </span>
              )}
            </p>
            

          </div>
          
          {booking.status === 'pending' && (
            <div className="flex gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => handleBookingResponse(booking, 'accepted')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleBookingResponse(booking, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Healer Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">Welcome back, {user?.username}! Manage your practice and connect with clients.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center gap-2 text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Key className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
            <div className="text-violet-600">💳</div>
            <span className="font-medium text-violet-800">{credits} credits</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="readings">My Readings</TabsTrigger>
          <TabsTrigger value="tools">Spiritual Tools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                    <p className="text-3xl font-bold text-orange-600">{analytics?.pendingBookings || 0}</p>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Accepted Sessions</p>
                    <p className="text-3xl font-bold text-green-600">{analytics?.acceptedBookings || 0}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Clients</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics?.totalClients || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Acceptance Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics?.acceptanceRate?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
              <CardDescription>Latest client requests for spiritual guidance</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No pending booking requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.slice(0, 3).map(renderBookingCard)}
                  {pendingBookings.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("bookings")}
                    >
                      View All {pendingBookings.length} Pending Requests
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>Manage client booking requests and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Tabs value={bookingTab} onValueChange={setBookingTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="pending" className="relative">
                      Pending Requests
                      {pendingBookings.length > 0 && (
                        <Badge className="ml-2 bg-orange-500 text-white">
                          {pendingBookings.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {pendingBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No pending booking requests</p>
                        </div>
                      ) : (
                        pendingBookings.map(renderBookingCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="accepted">
                    <div className="space-y-4">
                      {acceptedBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No accepted bookings yet</p>
                        </div>
                      ) : (
                        acceptedBookings.map(renderBookingCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="rejected">
                    <div className="space-y-4">
                      {rejectedBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No rejected bookings</p>
                        </div>
                      ) : (
                        rejectedBookings.map(renderBookingCard)
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Statistics</CardTitle>
                <CardDescription>Your practice performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Bookings</span>
                    <span className="font-semibold">{analytics?.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent Bookings (30 days)</span>
                    <span className="font-semibold">{analytics?.recentBookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acceptance Rate</span>
                    <span className="font-semibold text-green-600">{analytics?.acceptanceRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unique Clients</span>
                    <span className="font-semibold">{analytics?.totalClients || 0}</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>Booking activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {format(new Date(trend.date), "MMM d")}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {trend.bookings} total
                        </Badge>
                        {trend.accepted > 0 && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                            {trend.accepted} accepted
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Readings Tab */}
        <TabsContent value="readings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aura Readings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    My Aura Readings
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchAuraReadings()}
                    disabled={isLoadingAuraReadings}
                    className="text-xs"
                  >
                    {isLoadingAuraReadings ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </CardTitle>
                <CardDescription>Your personal spiritual energy analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAuraReadings ? (
                  <div className="space-y-4">
                    {/* Loading skeleton */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : healerAuraReadings.length === 0 ? (
                  <div className="text-center py-8">
                    <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No aura readings yet</p>
                    <Link to="/aura-analysis">
                      <Button>Get Your First Reading</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      Showing latest {healerAuraReadings.length} readings
                    </div>
                    {healerAuraReadings.map((reading) => (
                      <Suspense key={reading.id} fallback={
                        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
                      }>
                        <DetailedAuraReadingCard reading={reading} />
                      </Suspense>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Numerology Readings (Historical) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  My Numerology Readings
                </CardTitle>
                <CardDescription>Your saved numerology readings and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {healerNumerologyReadings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No numerology readings yet</p>
                    <p className="text-sm text-gray-400">Use the Personal Numerology Generator in Spiritual Tools to create readings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {healerNumerologyReadings.map((reading) => (
                        <div key={reading.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg text-purple-800">{reading.name}</h3>
                                    <p className="text-sm text-gray-600">{format(new Date(reading.createdAt), "PPp")}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Create a simplified PDF download function
                                    const pdf = new jsPDF();
                                    
                                    // Title
                                    pdf.setFontSize(20);
                                    pdf.setTextColor(0, 0, 0);
                                    pdf.text("Numerology Reading Report", 105, 20, { align: "center" });
                                    
                                    // Client information
                                    pdf.setFontSize(12);
                                    pdf.text(`Client: ${reading.name}`, 20, 40);
                                    pdf.text(`Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, 20, 50);
                                    pdf.text(`Healer: ${user?.username || 'Unknown'}`, 20, 60);
                                    
                                    // Core numbers
                                    pdf.setFontSize(14);
                                    pdf.setTextColor(0, 0, 0);
                                    pdf.text("Core Numbers", 20, 80);
                                    
                                    pdf.setFontSize(11);
                                    pdf.text(`Life Path Number: ${reading.lifePathNumber}`, 20, 95);
                                    pdf.text(`Destiny Number: ${reading.destinyNumber}`, 20, 105);
                                    pdf.text(`Soul Urge Number: ${reading.soulUrgeNumber}`, 20, 115);
                                    pdf.text(`Personality Number: ${reading.personalityNumber}`, 20, 125);
                                    pdf.text(`Personal Year 2025: ${reading.personalYearNumber}`, 20, 135);
                                    
                                    // Interpretation
                                    pdf.setFontSize(14);
                                    pdf.text("Complete Interpretation", 20, 155);
                                    
                                    pdf.setFontSize(10);
                                    const splitText = pdf.splitTextToSize(reading.interpretation, 170);
                                    pdf.text(splitText, 20, 165);
                                    
                                    // Save the PDF
                                    pdf.save(`numerology-reading-${reading.name}-${format(new Date(reading.createdAt), "yyyy-MM-dd")}.pdf`);
                                  }}
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <div className="text-2xl font-bold text-purple-600">{reading.lifePathNumber}</div>
                                    <div className="text-xs text-gray-500">Life Path</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <div className="text-2xl font-bold text-blue-600">{reading.destinyNumber}</div>
                                    <div className="text-xs text-gray-500">Destiny</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <div className="text-2xl font-bold text-green-600">{reading.soulUrgeNumber}</div>
                                    <div className="text-xs text-gray-500">Soul Urge</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <div className="text-2xl font-bold text-orange-600">{reading.personalityNumber}</div>
                                    <div className="text-xs text-gray-500">Personality</div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                                    <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{reading.personalYearNumber}</div>
                                    <div className="text-xs text-emerald-700">Personal 2025</div>
                                </div>
                            </div>

                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm text-gray-700 line-clamp-3">{reading.interpretation}</p>
                            </div>
                        </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's My Vibe Readings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    What's My Vibe History
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchVibeReadings()}
                    disabled={isLoadingVibeReadings}
                    className="text-xs"
                  >
                    {isLoadingVibeReadings ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </CardTitle>
                <CardDescription>Your vibe analysis readings history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingVibeReadings ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : healerVibeReadings.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No vibe readings yet</p>
                    <Link to="/">
                      <Button>Try What's My Vibe</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      Showing latest {healerVibeReadings.length} vibe readings
                    </div>
                    {healerVibeReadings.map((reading) => {
                      let colorMeaningData;
                      let fullAnalysisData;
                      
                      try {
                        colorMeaningData = JSON.parse(reading.colorMeaning);
                        fullAnalysisData = reading.fullAnalysis ? JSON.parse(reading.fullAnalysis) : null;
                      } catch (e) {
                        colorMeaningData = { positive: reading.colorMeaning, negative: '' };
                        fullAnalysisData = null;
                      }

                      return (
                        <div key={reading.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {reading.uploadedImage && (
                                <img 
                                  src={reading.uploadedImage} 
                                  alt="Uploaded for vibe analysis"
                                  className="w-16 h-16 rounded-lg object-cover border"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: getVibeColorCode(reading.personalityColor) }}
                                  />
                                  <h3 className="font-semibold text-lg text-green-800">
                                    {reading.personalityColor} Vibe
                                  </h3>
                                </div>
                                {reading.clientName && (
                                  <p className="text-sm text-gray-600">Client: {reading.clientName}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                  {format(new Date(reading.createdAt), "PPp")}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border">
                              <h4 className="font-medium text-green-700 mb-2">Positive Traits</h4>
                              <p className="text-sm text-gray-700">{colorMeaningData.positive}</p>
                            </div>
                            
                            {colorMeaningData.negative && (
                              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <h4 className="font-medium text-orange-700 mb-2">Areas to Watch</h4>
                                <p className="text-sm text-gray-700">{colorMeaningData.negative}</p>
                              </div>
                            )}
                            
                            {fullAnalysisData?.message && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-700 font-medium">{fullAnalysisData.message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spiritual Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          {/* Numerology Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                Numerology Analysis
              </CardTitle>
              <CardDescription>Generate comprehensive numerology readings by entering client information</CardDescription>
              <CardDescription className="text-red-500">3 credits</CardDescription>
            </CardHeader>
            <CardContent>
              <NumerologyInputForm />
            </CardContent>
          </Card>

          {/* Spiritual Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Aura Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">Analyze your own spiritual energy and aura colors(</p>
                <p className="text-sm text-red-600 mb-4">5 credits</p>
                <Link to="/aura-analysis">
                  <Button className="w-full">Start Analysis</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Object Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">Analyze the spiritual energy of objects</p>
                <p className="text-sm text-red-600 mb-4">1 credit</p>
                <Link to="/object-analysis">
                  <Button className="w-full">Analyze Object</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">What's My vibe</h3>
                <p className="text-sm text-gray-600 mb-4">Analyze the spiritual energy of a person in short</p>
                <p className="text-sm text-red-600 mb-4">1 credit</p>
                <Link to="/#vibe-check-section">
                  <Button className="w-full">Analyze</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Journal</h3>
                <p className="text-sm text-gray-600 mb-4">Journal and write your thoughts</p>
                <p className="text-sm text-green-600 mb-4">0 credit</p>
                <Link to="/journal">
                  <Button className="w-full">Journal</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Horoscope</h3>
                <p className="text-sm text-gray-600 mb-4">find horoscope</p>
                <p className="text-sm text-green-600 mb-4">0 credit</p>
                <Link to="/daily-horoscope">
                  <Button className="w-full">Find</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Client Message:</strong>
                </p>
                <p className="text-sm">{selectedBooking.message || "No message provided"}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Response</label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Write your response to the client..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={submitResponse}
                disabled={!responseMessage.trim() || respondToBookingMutation.isPending}
                className="flex-1"
              >
                {respondToBookingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send Response
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    passwordForm.reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}