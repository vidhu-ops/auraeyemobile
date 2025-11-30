import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { getSoulEnergyMilestone, calculateTreeGrowth, getProgressToNextMilestone, energyMilestones, SOUL_ENERGY_PER_SCAN } from "@/lib/soul-energy-utils";
import AvatarSoulTree from "@/components/avatar-soul-tree";
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
  Key,
  Sparkles,
  Zap,
  Heart,
  Camera,
  Circle,
  Trophy,
  Target,
  Award
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { CHAKRA_KEYS, CHAKRA_DISPLAY_NAMES, getChakraStatus, calculateChakraGroupPercentages, ChakraActivity, type ChakraKey } from "../../../shared/chakra";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState, useEffect, memo, useMemo, lazy, Suspense } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import NotificationSettings from "@/components/notification-settings";
import { AchievementsBadges } from "@/components/gamification/achievements-badge";
import { ColorCollector } from "@/components/gamification/color-collector";
import { ChakraMastery } from "@/components/gamification/chakra-mastery";
import { HealerLeaderboard } from "@/components/gamification/healer-leaderboard";
import { BadgeTargets } from "@/components/gamification/badge-targets";
import { BadgeShowcase } from "@/components/gamification/badge-showcase";
import { ProfilePictureUploadDialog } from "@/components/profile/profile-picture-upload";
import { useBadgeContext } from "@/hooks/use-badge-context";

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

interface HealerBadge {
  id: number;
  healerId: number;
  badgeType: string;
  badgeTitle: string;
  badgeIcon: string;
  awardedAt: string;
  expiresAt: string;
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
  const { checkBadges, showBadges } = useBadgeContext();
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
        const data = await response.json();
        toast({
          title: "Numerology Reading Created",
          description: `Personal numerology reading for ${name} has been generated`,
        });
        
        // Reset form
        setName("");
        setBirthDate("");
        
        // Refresh the readings list and badge-related queries immediately
        queryClient.invalidateQueries({ queryKey: ['/api/healer-numerology-readings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user-achievements'] });
        queryClient.invalidateQueries({ queryKey: ['/api/healer-badges', user?.id] });
        // Force immediate refetch
        await queryClient.refetchQueries({ queryKey: ['/api/user-achievements'] });
        await queryClient.refetchQueries({ queryKey: ['/api/healer-badges', user?.id] });
        
        // Show badges if returned from server
        if (data.newBadges && data.newBadges.length > 0) {
          showBadges(data.newBadges);
        } else {
          // Check for new badges as fallback
          await checkBadges();
        }
        
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




  
  const generateComprehensivePDF = async (reading: any) => {
    setIsGeneratingPDF(true);
    
    try {
      // First, try to retrieve the stored PDF if it exists
      try {
        const response = await fetch(`/api/pdf-storage/aura/${reading.id}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const storedPdf = await response.json();
          // Decode the base64 PDF data and trigger download
          const byteCharacters = atob(storedPdf.pdfData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
          
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = storedPdf.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "PDF Downloaded",
            description: "Original PDF report retrieved and downloaded successfully.",
          });
          setIsGeneratingPDF(false);
          return;
        }
      } catch (error) {
        console.log('No stored PDF found, generating new one:', error);
      }
      
      // If no stored PDF exists, generate a new one
      const { jsPDF } = await import('jspdf');
      const { format } = await import('date-fns');
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const healerName = user?.username || 'Professional Healer';
      
      // Helper function to parse JSON fields safely
      const parseJsonField = (field: string) => {
        try {
          return JSON.parse(field || '{}');
        } catch {
          return {};
        }
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
        // Use default values if parsing fails
        spiritualGuidance = 'Your aura reveals unique energy patterns representing spiritual growth and development.';
        detailedAnalysis = 'Advanced spiritual development with balanced energy flow.';
        colorMeanings = {};
        personalityTraits = [];
        chakraActivity = {};
      }
      
      // PAGE 1: COVER PAGE & OVERVIEW
      pdf.setFontSize(24);
      pdf.setTextColor(147, 51, 234);
      pdf.text('AURA & CHAKRA ALIGNMENT REPORT', pageWidth / 2, 40, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Client: ${reading.name}`, pageWidth / 2, 60, { align: 'center' });
      pdf.text(`Professional Healer: ${healerName}`, pageWidth / 2, 75, { align: 'center' });
      pdf.text(`Analysis Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, pageWidth / 2, 90, { align: 'center' });
      
     
      
      
      // Aura Color Analysis - moved higher up for better visibility
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Complete Aura Color Analysis', 20, 120);
      
      let yPos = 135;
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Thinking Color: ${reading.personalityColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Your thinking essence and nature', 30, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Giving Color: ${reading.receivingColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('How you give energy to others', 30, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Receiving Color: ${reading.givingColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('How you receive energy from environment', 30, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Personality Color: ${reading.thinkingColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Your core essence', 30, yPos);
      yPos += 20;
      
      // Energy Level Assessment
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Energy Assessment', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Overall Energy Level: ${reading.energyLevel}/10`, 25, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Spiritual vibration and life force energy', 30, yPos);
      
      
      
      // PAGE 2: AURA VISUALIZATION - Before and After Comparison
      console.log('Starting PDF generation with result:', reading);
      console.log('Processed aura image available:', !!reading.processedAuraImage);
      console.log('Image URL:', reading.imageUrl);
      console.log('Name:', reading.name);
      
      if (reading.processedAuraImage || reading.imageUrl) {
        try {
          pdf.addPage();
          
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
      
      // PAGE 3: COMPREHENSIVE CHAKRA ANALYSIS
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('COMPREHENSIVE CHAKRA ANALYSIS', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Complete Chakra Activity from actual data
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('9-Chakra Energy System Activity', 20, yPos);
      yPos += 15;
      
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
        'soulStar': 'Higher spiritual purpose, divine connection, soul mission',
        'crown': 'Spiritual connection, divine wisdom, universal consciousness',
        'thirdEye': 'Intuition, inner wisdom, psychic abilities',
        'throat': 'Communication, truth, self-expression',
        'heart': 'Love, compassion, emotional healing',
        'solarPlexus': 'Personal power, confidence, willpower',
        'sacral': 'Creativity, sexuality, emotional flow',
        'root': 'Grounding, survival, physical vitality',
        'earthStar': 'Earth connection, grounding, ancestral wisdom'
      };
      
      // Create a temporary SVG-based chakra chart and capture it
      try {
        const chakraChartData = Object.entries(allChakraData).map(([key, score]) => ({
          name: chakraDisplayNames[key as keyof typeof chakraDisplayNames],
          energy: score * 10
        }));
        
        // Create temporary container for chart capture
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.style.height = '400px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.innerHTML = `
          <svg width="760" height="350" style="font-family: Arial, sans-serif;">
            <!-- Title -->
            <text x="380" y="25" font-size="18" font-weight="bold" text-anchor="middle" fill="#1f293d">Chakra Energy Levels</text>
            
            <!-- Grid and bars -->
            <g transform="translate(60, 50)">
              <!-- Y-axis -->
              <line x1="0" y1="0" x2="0" y2="250" stroke="#ccc" stroke-width="1"/>
              <!-- X-axis -->
              <line x1="0" y1="250" x2="700" y2="250" stroke="#ccc" stroke-width="1"/>
              
              <!-- Y-axis labels -->
              <text x="-10" y="5" font-size="10" text-anchor="end" fill="#666">100%</text>
              <text x="-10" y="65" font-size="10" text-anchor="end" fill="#666">75%</text>
              <text x="-10" y="125" font-size="10" text-anchor="end" fill="#666">50%</text>
              <text x="-10" y="185" font-size="10" text-anchor="end" fill="#666">25%</text>
              <text x="-10" y="255" font-size="10" text-anchor="end" fill="#666">0%</text>
              
              <!-- Horizontal grid lines -->
              <line x1="0" y1="0" x2="700" y2="0" stroke="#e5e7eb" stroke-width="0.5"/>
              <line x1="0" y1="62.5" x2="700" y2="62.5" stroke="#e5e7eb" stroke-width="0.5"/>
              <line x1="0" y1="125" x2="700" y2="125" stroke="#e5e7eb" stroke-width="0.5"/>
              <line x1="0" y1="187.5" x2="700" y2="187.5" stroke="#e5e7eb" stroke-width="0.5"/>
            </g>
          </svg>
        `;
        
        // Alternative: Create bars dynamically
        let barSvg = '<svg width="800" height="350" style="font-family: Arial, sans-serif;"><text x="400" y="25" font-size="18" font-weight="bold" text-anchor="middle" fill="#1f293d">Chakra Energy Levels</text>';
        barSvg += '<g transform="translate(40, 50)">';
        
        // Add Y-axis
        barSvg += '<line x1="0" y1="0" x2="0" y2="250" stroke="#999" stroke-width="1.5"/>';
        barSvg += '<line x1="0" y1="250" x2="720" y2="250" stroke="#999" stroke-width="1.5"/>';
        
        // Add Y-axis labels
        barSvg += '<text x="-8" y="5" font-size="11" text-anchor="end" fill="#374151">100</text>';
        barSvg += '<text x="-8" y="68" font-size="11" text-anchor="end" fill="#374151">75</text>';
        barSvg += '<text x="-8" y="130" font-size="11" text-anchor="end" fill="#374151">50</text>';
        barSvg += '<text x="-8" y="192" font-size="11" text-anchor="end" fill="#374151">25</text>';
        barSvg += '<text x="-8" y="255" font-size="11" text-anchor="end" fill="#374151">0</text>';
        
        // Add grid lines
        barSvg += '<line x1="0" y1="0" x2="720" y2="0" stroke="#e5e7eb" stroke-width="0.5"/>';
        barSvg += '<line x1="0" y1="62.5" x2="720" y2="62.5" stroke="#e5e7eb" stroke-width="0.5"/>';
        barSvg += '<line x1="0" y1="125" x2="720" y2="125" stroke="#e5e7eb" stroke-width="0.5"/>';
        barSvg += '<line x1="0" y1="187.5" x2="720" y2="187.5" stroke="#e5e7eb" stroke-width="0.5"/>';
        
        // Add bars for each chakra
        const barWidth = 75;
        const spacing = 80;
        chakraChartData.forEach((data, index) => {
          const x = index * spacing;
          const height = (data.energy / 100) * 250;
          const y = 250 - height;
          
          barSvg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${height}" fill="#9333ea" opacity="0.8" rx="4"/>`;
          barSvg += `<text x="${x + barWidth / 2}" y="270" font-size="10" text-anchor="middle" fill="#374151">${data.name.split(' ')[0]}</text>`;
          barSvg += `<text x="${x + barWidth / 2}" y="${y - 5}" font-size="10" font-weight="bold" text-anchor="middle" fill="#9333ea">${data.energy}%</text>`;
        });
        
        barSvg += '</g></svg>';
        
        const chartContainer = document.createElement('div');
        chartContainer.style.position = 'absolute';
        chartContainer.style.top = '-9999px';
        chartContainer.style.width = '800px';
        chartContainer.style.height = '350px';
        chartContainer.style.backgroundColor = 'white';
        chartContainer.innerHTML = barSvg;
        document.body.appendChild(chartContainer);
        
        // Capture the chart with html2canvas
        const chartCanvas = await html2canvas(chartContainer, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true
        });
        
        const chartImageData = chartCanvas.toDataURL('image/png');
        
        // Add chart image to PDF
        const chartImageWidth = pageWidth - 40;
        const chartImageHeight = (chartImageWidth * chartCanvas.height) / chartCanvas.width;
        pdf.addImage(chartImageData, 'PNG', 20, yPos, chartImageWidth, chartImageHeight);
        yPos += chartImageHeight + 15;
        
        // Clean up
        document.body.removeChild(chartContainer);
        
      } catch (chartError) {
        console.error('Error creating chakra chart:', chartError);
        // Continue without chart if there's an error
      }
      
      Object.entries(allChakraData).forEach(([chakraKey, score]) => {
        const chakraName = chakraDisplayNames[chakraKey as keyof typeof chakraDisplayNames];
        const description = chakraDescriptions[chakraKey as keyof typeof chakraDescriptions];
        
        pdf.setFontSize(12);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`${chakraName}: ${score}/10 (${score * 10}%)`, 20, yPos);
        yPos += 8;
        
        pdf.setFontSize(9);
        pdf.setTextColor(55, 65, 81);
        const descLines = pdf.splitTextToSize(description, pageWidth - 45);
        pdf.text(descLines, 25, yPos);
        yPos += descLines.length * 4 + 8;
        
        if (yPos > 250) {
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('CHAKRA ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
          yPos = 40;
        }
      });
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      
      // PAGE 4: DETAILED CHAKRA ANALYSIS
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
      
      // Life Score Analysis (if available)
      if (yPos < 200) {
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Life Area Assessment', 20, yPos);
        yPos += 15;
        
        // Calculate life scores based on chakra activity
        const lifeScores = {
          'Love & Relationships': Math.round((allChakraData.heart + allChakraData.sacral) / 2),
          'Career & Purpose': Math.round((allChakraData.solarPlexus + allChakraData.throat) / 2),
          'Spiritual Growth': Math.round((allChakraData.crown + allChakraData.soulStar) / 2),
          'Physical Energy': Math.round((allChakraData.root + allChakraData.earthStar) / 2),
          'Emotional Balance': Math.round((allChakraData.heart + allChakraData.solarPlexus) / 2),
          'Intuition & Wisdom': Math.round((allChakraData.thirdEye + allChakraData.crown) / 2)
        };
        
        Object.entries(lifeScores).forEach(([area, score]) => {
          pdf.setFontSize(12);
          pdf.setTextColor(55, 65, 81);
          pdf.text(`${area}: ${score}/10`, 25, yPos);
          yPos += 8;
        });
      }
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform', 20, pageHeight - 10);
      
      // PAGE 6: DETAILED ANALYSIS FROM ANALYSIS TABS
      pdf.addPage();
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
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 8 of 8', 20, pageHeight - 10);
      
      // Save the PDF and store it for future retrieval
      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const fileName = `aura-chakra-alignment-report-${reading.name}-${timestamp}.pdf`;
      
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
        description: `Report downloaded successfully`,
      });
      
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

            {/* Spiritual Guidance */}
            {reading.spiritualGuidance && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Spiritual Guidance</h4>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 leading-relaxed">{reading.spiritualGuidance}</p>
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {Array.isArray(personalityTraits) && personalityTraits.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {trait}
                    </Badge>
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
    <Card className="border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-blue-800">{reading.name}</CardTitle>
            <CardDescription className="text-blue-600">
              {format(new Date(reading.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPDF}
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Cancel Edit" : "Edit Notes"}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Core Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.lifePathNumber}</div>
            <p className="text-sm font-medium">Life Path</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.destinyNumber}</div>
            <p className="text-sm font-medium">Destiny</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.soulUrgeNumber}</div>
            <p className="text-sm font-medium">Soul Urge</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.personalityNumber}</div>
            <p className="text-sm font-medium">Personality</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{reading.personalYearNumber}</div>
            <p className="text-sm font-medium text-emerald-700">Personal Year 2026</p>
          </div>
        </div>

        {/* Full Interpretation */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Complete Interpretation</h4>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reading.interpretation}</p>
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
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { checkBadges } = useBadgeContext();
  
  // Fetch login streaks
  const { data: streakData } = useQuery({
    queryKey: ["/api/streaks"],
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(user?.profilePictureUrl || null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Use new milestone and tree growth system
  const milestone = getSoulEnergyMilestone(soulEnergy);
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestoneProgress = getProgressToNextMilestone(soulEnergy);
  
  const [bookingTab, setBookingTab] = useState("pending");
  
  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'bookings', 'analytics', 'readings', 'tools'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
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

  // Login streak data is already fetched via streakData query above

  // Fetch healer's own aura readings with immediate updates
  const { data: healerAuraReadings = [], isLoading: isLoadingAuraReadings, refetch: refetchAuraReadings } = useQuery<AuraReading[]>({
    queryKey: ["/api/healer-aura-readings"],
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 30 * 1000, // Keep in cache for 30 seconds only for immediate updates
    refetchInterval: 3000, // Refetch every 3 seconds for very fast updates
  });

  // Fetch total count of healer's aura readings
  const { data: auraReadingsCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/healer-aura-readings-count"],
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
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

  // Fetch total count of healer's numerology readings
  const { data: numerologyReadingsCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/healer-numerology-readings-count"],
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
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

  // Fetch total count of vibe readings
  const { data: vibeReadingsCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/vibe-readings-count"],
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
  });

  // Fetch healer's own object analyses with immediate updates
  const { data: healerObjectAnalyses = [], isLoading: isLoadingObjectAnalyses, refetch: refetchObjectAnalyses } = useQuery<any[]>({
    queryKey: ["/api/object-analyses"],
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 0, // Don't cache - always fetch fresh data
    refetchInterval: 5000, // Refetch every 5 seconds for faster updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch on reconnection
  });

  // Fetch stored aura PDFs
  const { data: healerPdfs = [], isLoading: isLoadingPdfs, refetch: refetchPdfs } = useQuery({
    queryKey: ["/api/healer-pdfs"],
    enabled: !!user,
    staleTime: 0,
    gcTime: 30 * 1000,
    refetchInterval: 10000,
  });

  // Fetch healer's earned badges - use user as healer ID for now
  const { data: healerBadges = [] } = useQuery<HealerBadge[]>({
    queryKey: ["/api/healer-badges", user?.id],
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time badge updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch user achievements
  const { data: achievementsData } = useQuery({
    queryKey: ["/api/user-achievements"],
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time achievement updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const achievements = achievementsData?.achievements || [];

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-none"
                onClick={() => handleBookingResponse(booking, 'accepted')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-none"
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
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white-900 mb-2">Healer Dashboard</h1>
            <p className="text-white-600">Welcome back, {user?.username}! Manage your practice and connect with clients.</p>
          </div>
          <div className="flex flex-col gap-3 items-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center gap-2 text-purple-600 border-purple-600 hover:bg-purple-50"
              data-testid="button-change-password"
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
            <div className="flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
              <div className="text-violet-600">💳</div>
              <span className="font-medium text-violet-800">{credits} credits</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="grid w-full h-32 grid-cols-3 grid-rows-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="soul-energy">Soul Energy</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="readings">My Readings</TabsTrigger>
          <TabsTrigger value="tools">Spiritual Tools</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg overflow-hidden">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt={user?.username}
                          className="w-full h-full object-cover"
                          data-testid="img-healer-profile-picture"
                        />
                      ) : (
                        user?.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <button
                      onClick={() => setUploadDialogOpen(true)}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shadow-md hover:bg-pink-600 transition-colors"
                      data-testid="button-healer-edit-photo"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white-900">{user?.username}</h2>
                    <p className="text-purple-200 font-medium">Professional Healer</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">Active</Badge>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-xs text-gray-600">Total Clients</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics?.totalClients || 0}</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-xs text-gray-600">Sessions</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics?.acceptedBookings || 0}</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-xs text-gray-600">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics?.acceptanceRate?.toFixed(0) || 0}%</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span className="text-xs text-gray-600">Soul Energy</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{soulEnergy}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Streaks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Activity Streaks
                </CardTitle>
                <CardDescription>Your consistency and dedication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Streak</span>
                    <span className="text-3xl">🔥</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {streakData?.currentStreak || 0} days
                  </div>
                  <p className="text-xs text-gray-600">Keep your momentum going!</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Longest Streak</span>
                    <span className="text-3xl">⭐</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {streakData?.longestStreak || 0} days
                  </div>
                  <p className="text-xs text-gray-600">Your personal best</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Active Days</span>
                    <span className="text-3xl">📅</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {streakData?.weeklyActiveDates?.length || 0} / 7
                  </div>
                  <p className="text-xs text-gray-600">{streakData?.weeklyActiveDates?.join(', ') || 'No activity this week'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Progress & Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Progress & Achievements
                </CardTitle>
                <CardDescription>Your spiritual journey milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black-700">Client Master</span>
                        <span className="text-xs font-semibold text-blue-600">{analytics?.totalClients || 0}/50</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((analytics?.totalClients || 0) / 50) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black-700">Session Expert</span>
                        <span className="text-xs font-semibold text-green-600">{analytics?.acceptedBookings || 0}/100</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((analytics?.acceptedBookings || 0) / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black-700">Spiritual Guide</span>
                        <span className="text-xs font-semibold text-purple-600">{Math.min(100, Math.floor(analytics?.acceptanceRate || 0))}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, analytics?.acceptanceRate || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black-700">Energy Guardian</span>
                        <span className="text-xs font-semibold text-orange-600">{soulEnergy}/500</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (soulEnergy / 500) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestone Progress & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Milestone Summary */}
            <Card className="bg-gradient-to-br from-purple-50 to-cyan-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Spiritual Milestone
                </CardTitle>
                <CardDescription>Your journey progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Current Level</p>
                      <h3 className="text-xl font-bold text-white">{milestone.level}</h3>
                    </div>
                    <Badge className={`bg-gradient-to-r ${milestone.gradient} text-white px-4 py-2`} data-testid="badge-milestone-level">
                      Level {energyMilestones.findIndex(m => m.level === milestone.level) + 1}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black-600">Progress to Next</span>
                      <span className="font-semibold text-gray-900">{milestoneProgress.current} / {milestoneProgress.total}</span>
                    </div>
                    <Progress value={milestoneProgress.percentage} className="h-2" data-testid="progress-milestone" />
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-cyan-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Tree Growth</span>
                      <span className="text-lg font-bold text-purple-600">{Math.floor(treeGrowth)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest spiritual services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics && analytics.acceptedBookings > 0 ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Accepted Session</p>
                          <p className="text-xs text-gray-600">Client booking accepted</p>
                        </div>
                        <span className="text-xs text-gray-500">Recent</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Eye className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Aura Reading Completed</p>
                          <p className="text-xs text-gray-600">+5 Soul Energy</p>
                        </div>
                        <span className="text-xs text-gray-500">Today</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                          <Calculator className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Numerology Analysis</p>
                          <p className="text-xs text-gray-600">+3 Soul Energy</p>
                        </div>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-2">Start accepting bookings to see your activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Services Overview
              </CardTitle>
              <CardDescription>Your spiritual services breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Aura Readings</p>
                      <p className="text-xl font-bold text-gray-900">{auraReadingsCountData?.count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Numerology</p>
                      <p className="text-xl font-bold text-gray-900">{numerologyReadingsCountData?.count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Circle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Vibe Checks</p>
                      <p className="text-xl font-bold text-gray-900">{vibeReadingsCountData?.count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Services</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(auraReadingsCountData?.count || 0) + (numerologyReadingsCountData?.count || 0) + (vibeReadingsCountData?.count || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Pending Requests</p>
                    <p className="text-3xl font-bold text-white-600">{analytics?.pendingBookings || 0}</p>
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
                    <p className="text-sm text-white">Accepted Sessions</p>
                    <p className="text-3xl font-bold text-white-600">{analytics?.acceptedBookings || 0}</p>
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
                    <p className="text-sm text-white">Total Clients</p>
                    <p className="text-3xl font-bold text-white-600">{analytics?.totalClients || 0}</p>
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
                    <p className="text-sm text-white">Acceptance Rate</p>
                    <p className="text-3xl font-bold text-green-500">{analytics?.acceptanceRate?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white" />
                Quick Services
              </CardTitle>
              <CardDescription>Access spiritual services and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link href="/vibe">
                  <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Circle className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold mb-1 text-sm">What's My Vibe</div>
                      <div className="text-purple-700 text-xs">Quick scan</div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/aura-analysis">
                  <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold mb-1 text-sm">Aura Scan</div>
                      <div className="text-indigo-700 text-xs">Full analysis</div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/numerology">
                  <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Calculator className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold mb-1 text-sm">Numerology</div>
                      <div className="text-cyan-700 text-xs">Life path</div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/object-analysis">
                  <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Eye className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold mb-1 text-sm">Object Scan</div>
                      <div className="text-amber-700 text-xs">Spiritual analysis</div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/daily-horoscope">
                  <Card className="bg-gradient-to-br from-pink-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Sparkles className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold mb-1 text-sm">Horoscope</div>
                      <div className="text-pink-700 text-xs">Daily reading</div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/healers">
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold mb-1 text-sm">Find Healers</div>
                      <div className="text-green-700 text-xs">Network</div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
              <CardDescription>Latest client requests for spiritual guidance</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="h-12 w-12 mx-14 mb-8 text-gray-400" />
                  <p className="text-gray-500">No pending booking requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.slice(0, 3).map(renderBookingCard)}
                  {pendingBookings.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-18"
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

        {/* Soul Energy Tab */}
        <TabsContent value="soul-energy" className="space-y-6">
          {/* Milestone Progress */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold text-xl">Current Milestone</h2>
                  <p className="text-cyan-300 text-sm">{milestone.level}</p>
                </div>
                <Badge className={`bg-gradient-to-r ${milestone.gradient} text-white px-4 py-2`}>
                  Level {energyMilestones.findIndex(m => m.level === milestone.level) + 1}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200">Progress to Next Level</span>
                  <span className="text-white font-semibold">{milestoneProgress.current} / {milestoneProgress.total}</span>
                </div>
                <Progress value={milestoneProgress.percentage} className="h-3" />
                <p className="text-xs text-cyan-300">
                  {milestone.max === Infinity ? 
                    `You've ascended! Keep growing your spiritual energy.` :
                    `${milestone.max - soulEnergy} more energy to reach ${energyMilestones[energyMilestones.findIndex(m => m.level === milestone.level) + 1]?.level || 'max level'}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Soul Tree */}
          <Card className="bg-transparent border-0">
            <CardContent className="p-0">
              <AvatarSoulTree soulEnergy={soulEnergy} />
            </CardContent>
          </Card>

          {/* Tree Growth Details */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-white font-bold text-lg mb-2">Soul Tree Growth</h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                  {Math.floor(treeGrowth)}%
                </div>
                <p className="text-cyan-300 text-sm">
                  {Math.floor((100 - treeGrowth) * 10)} more soul energy needed to reach 100%
                </p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-cyan-400 text-2xl font-bold">{soulEnergy}</div>
                    <div className="text-xs text-cyan-200">Total Energy</div>
                  </div>
                  <div>
                    <div className="text-purple-400 text-2xl font-bold">+{SOUL_ENERGY_PER_SCAN}</div>
                    <div className="text-xs text-cyan-200">Per Scan</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Goals - Final State Section */}
          <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-yellow-400/30 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-white font-bold text-2xl mb-2">✨ Your Ultimate Goal ✨</h3>
                <p className="text-yellow-200 text-sm">This is what awaits you at 100% soul energy</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Final Soul Tree */}
                <div className="text-center space-y-3">
                  <h4 className="text-cyan-300 font-semibold">Fully Evolved Soul Tree</h4>
                  <div className="bg-black/30 rounded-lg p-4 flex justify-center">
                    <img 
                      src="/attached_assets/unnamed (13)_1763058572811.jpg" 
                      alt="100% Grown Soul Tree" 
                      className="max-h-48 object-contain rounded"
                    />
                  </div>
                  <p className="text-cyan-200 text-xs">At 100% growth, your soul tree reaches its full potential 🌳</p>
                </div>

                {/* Final Auri State */}
                <div className="text-center space-y-3">
                  <h4 className="text-purple-300 font-semibold">Auri at Awakened Level</h4>
                  <div className="bg-black/30 rounded-lg p-4 flex justify-center">
                    <img 
                      src="/attached_assets/WhatsApp_Image_2025-11-15_at_10.15.23_PM-removebg-preview_1763832280129.png" 
                      alt="Auri Awakened Evolution" 
                      className="max-h-48 object-contain rounded"
                    />
                  </div>
                  <p className="text-purple-200 text-xs">Your spiritual companion reaches ultimate enlightenment 🌟</p>
                </div>
              </div>

              <div className="mt-6 bg-white/5 rounded-lg p-4 border border-yellow-400/20">
                <p className="text-yellow-100 text-sm text-center">
                  <span className="font-semibold">Awakened Level:</span> You've transcended the five soul energy tiers and reached spiritual mastery. Your tree flourishes in full bloom, and Auri has evolved into their highest consciousness form. Keep growing to unlock infinite spiritual potential! 🔮
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Energy Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Energy Sources
              </CardTitle>
              <CardDescription>Gain soul energy through spiritual services and client interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-semibold">Aura Analysis</h3>
                      <p className="text-slate-600 text-xs">+{SOUL_ENERGY_PER_SCAN} energy per reading</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <Circle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-semibold">Vibe Check</h3>
                      <p className="text-slate-600 text-xs">+{SOUL_ENERGY_PER_SCAN} energy per scan</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-semibold">Numerology</h3>
                      <p className="text-slate-600 text-xs">+{SOUL_ENERGY_PER_SCAN} energy per reading</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-semibold">Client Sessions</h3>
                      <p className="text-slate-600 text-xs">+10 energy per booking</p>
                    </div>
                  </div>
                </div>
              </div>
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
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Tabs value={bookingTab} onValueChange={setBookingTab}>
                  <TabsList className="grid w-full h-15 grid-rows-2 grid-cols-2 gap-3 mb-6">
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
                    <span className="text-sm text-white">Total Bookings</span>
                    <span className="font-semibold">{analytics?.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Recent Bookings (30 days)</span>
                    <span className="font-semibold">{analytics?.recentBookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Acceptance Rate</span>
                    <span className="font-semibold text-green-600">{analytics?.acceptanceRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Unique Clients</span>
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
                      <span className="text-sm text-white">
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

          {/* Earned Achievements */}
          <AchievementsBadges />

          {/* Physical Badges Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Physical Badges
              </CardTitle>
              <CardDescription>Spiritual achievement badges showcase</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeShowcase />
            </CardContent>
          </Card>

          {/* Achievement Targets - Badge Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-500" />
                Achievement Targets
              </CardTitle>
              <CardDescription>Track your progress toward unlocking new badges</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeTargets />
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Readings Tab */}
        <TabsContent value="readings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                        <div className="bg-gray-200 rounded-lg h-32"></div>
                      }>
                        <DetailedAuraReadingCard reading={reading} />
                      </Suspense>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aura PDF Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-500" />
                    Aura PDF Reports
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchPdfs()}
                    disabled={isLoadingPdfs}
                    className="text-xs"
                  >
                    {isLoadingPdfs ? 'Loading...' : 'Refresh'}
                  </Button>
                </CardTitle>
                <CardDescription>Client aura analysis reports</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPdfs ? (
                  <div className="text-center py-4 text-gray-500">Loading PDFs...</div>
                ) : healerPdfs.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No PDF reports yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {healerPdfs.map((pdf: any) => (
                      <div key={pdf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{pdf.clientName}</p>
                          <p className="text-xs text-gray-500">{pdf.fileName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/api/pdf/${pdf.id}/download`;
                          }}
                          className="ml-2 flex-shrink-0"
                          data-testid="button-download-pdf"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
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
                                    pdf.text(`Personal Year 2026: ${reading.personalYearNumber}`, 20, 135);
                                    
                                    // Interpretation
                                    pdf.setFontSize(14);
                                    pdf.text("Complete Interpretation", 20, 155);
                                    
                                    pdf.setFontSize(10);
                                    const splitText = pdf.splitTextToSize(reading.interpretation, 170);
                                    let currentY = 165;
                                    
                                    splitText.forEach((line: string) => {
                                      if (currentY > 280) {
                                        pdf.addPage();
                                        currentY = 20;
                                      }
                                      pdf.text(line, 20, currentY);
                                      currentY += 6;
                                    });
                                    
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
                                    <div className="text-xs text-emerald-700">Personal 2026</div>
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

            {/* Object Analysis Readings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-500" />
                    Object Analysis History
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchObjectAnalyses()}
                    disabled={isLoadingObjectAnalyses}
                    className="text-xs"
                  >
                    {isLoadingObjectAnalyses ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </CardTitle>
                <CardDescription>Your object energy analysis history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingObjectAnalyses ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : healerObjectAnalyses.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No object analyses yet</p>
                    <Link to="/object-analysis">
                      <Button>Analyze an Object</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      Showing latest {healerObjectAnalyses.length} object analyses
                    </div>
                    {healerObjectAnalyses.map((analysis) => {
                      let energyQualities = [];
                      try {
                        energyQualities = JSON.parse(analysis.energyQualities || '[]');
                      } catch (e) {
                        energyQualities = [];
                      }

                      return (
                        <div key={analysis.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {analysis.imageUrl && (
                                <img 
                                  src={analysis.imageUrl} 
                                  alt={analysis.objectName}
                                  className="w-16 h-16 rounded-lg object-cover border"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: analysis.auraColor }}
                                  />
                                </div>
                                {analysis.name && (
                                  <p className="text-sm text-gray-600">Label: {analysis.name}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                  {format(new Date(analysis.createdAt), "PPp")}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border">
                              <h4 className="font-medium text-indigo-700 mb-2">Description</h4>
                              <p className="text-sm text-gray-700">{analysis.objectDescription}</p>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border">
                              <h4 className="font-medium text-indigo-700 mb-2">Spiritual Significance</h4>
                              <p className="text-sm text-gray-700">{analysis.spiritualSignificance}</p>
                            </div>
                            
                            {analysis.auraDescription && (
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <h4 className="font-medium text-purple-700 mb-2">Aura Energy</h4>
                                <p className="text-sm text-gray-700">{analysis.auraDescription}</p>
                              </div>
                            )}
                            
                            {energyQualities.length > 0 && (
                              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <h4 className="font-medium text-indigo-700 mb-2">Energy Qualities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {energyQualities.map((quality: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">{quality}</Badge>
                                  ))}
                                </div>
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
                <h3 className="font-semibold mb-2 text-white">Aura Analysis</h3>
                <p className="text-sm text-black-600 mb-4">Analyze your own spiritual energy and aura colors(</p>
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
                <h3 className="font-semibold mb-2 text-white">Object Analysis</h3>
                <p className="text-sm text-black-600 mb-4">Analyze the spiritual energy of objects</p>
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
                <h3 className="font-semibold mb-2 text-white">What's My vibe</h3>
                <p className="text-sm text-black-600 mb-4">Analyze the spiritual energy of a person in short</p>
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
                <h3 className="font-semibold mb-2 text-white">Journal</h3>
                <p className="text-sm text-black-600 mb-4">Journal and write your thoughts</p>
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
                <h3 className="font-semibold mb-2 text-white">Horoscope</h3>
                <p className="text-sm text-black-600 mb-4">Find horoscope</p>
                <p className="text-sm text-green-600 mb-4">0 credit</p>
                <Link to="/daily-horoscope">
                  <Button className="w-full">Find</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          {/* Healer Performance Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Healer Performance Badges
              </CardTitle>
              <CardDescription>Recognition badges awarded based on your performance and client interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {healerBadges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4 text-lg">No badges earned yet</p>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Earn badges by receiving many client bookings, getting highly rated, and providing excellent service. Keep growing your practice!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {healerBadges.map((badge: HealerBadge) => (
                    <div key={badge.id} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow text-center">
                      <div className="text-6xl mb-3">{badge.badgeIcon}</div>
                      <h3 className="font-bold text-lg text-yellow-900 mb-2">{badge.badgeTitle}</h3>
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-yellow-700">
                          Awarded: {new Date(badge.awardedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-orange-600">
                          Expires: {new Date(badge.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-full h-1 bg-yellow-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                          style={{
                            width: `${Math.max(0, (new Date(badge.expiresAt).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Badges */}
          <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">🏆</span> Special Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Week Warrior */}
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg border-2 border-yellow-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🔥</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Week Warrior 🔥</h3>
                      <p className="text-sm text-yellow-100 mb-2">Maintained a 7-day login streak</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">7-day streak</span>
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">GOLD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spiritual Guardian */}
                <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg border-2 border-blue-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🙏</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Spiritual Guardian 🙏</h3>
                      <p className="text-sm text-blue-100 mb-2">Completed 50 total spiritual services</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-700 text-white text-xs font-semibold rounded">50 services</span>
                        <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded">PLATINUM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Healing Heart */}
                <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg border-2 border-green-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">💚</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Healing Heart 💚</h3>
                      <p className="text-sm text-green-100 mb-2">Provided 5 healing replies as a healer</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-700 text-white text-xs font-semibold rounded">5 healing replies</span>
                        <span className="px-3 py-1 bg-green-700 text-white text-xs font-semibold rounded">SILVER</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Trusted Healer */}
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg border-2 border-yellow-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">👑</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Most Trusted Healer 👑</h3>
                      <p className="text-sm text-yellow-100 mb-2">Become the top healer with most replies</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-orange-700 text-white text-xs font-semibold rounded">Most healer replies</span>
                        <span className="px-3 py-1 bg-orange-700 text-white text-xs font-semibold rounded">PLATINUM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Healer */}
                <div className="p-4 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg border-2 border-pink-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">⭐</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Best Healer ⭐</h3>
                      <p className="text-sm text-pink-100 mb-2">Achieved the highest healer rating</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-pink-700 text-white text-xs font-semibold rounded">Highest rating</span>
                        <span className="px-3 py-1 bg-pink-700 text-white text-xs font-semibold rounded">PLATINUM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Numerology Reading Badges */}
          <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">🔢</span> Numerology Reading Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Number Seeker */}
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg border-2 border-purple-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🔢</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Number Seeker 🔢</h3>
                      <p className="text-sm text-purple-100 mb-2">Completed your first numerology reading</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded">Read 1 numerology</span>
                        <span className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded">BRONZE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numerology Explorer */}
                <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg border-2 border-slate-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">📚</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Numerology Explorer 📚</h3>
                      <p className="text-sm text-slate-100 mb-2">Completed 5 numerology readings</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-600 text-white text-xs font-semibold rounded">Read 5 numerologies</span>
                        <span className="px-3 py-1 bg-slate-600 text-white text-xs font-semibold rounded">SILVER</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numerology Master */}
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border-2 border-yellow-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🎲</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Numerology Master 🎲</h3>
                      <p className="text-sm text-yellow-100 mb-2">Completed 15 numerology readings</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">Read 15 numerologies</span>
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">GOLD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numerology Legend */}
                <div className="p-4 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg border-2 border-blue-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🔮</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Numerology Legend 🔮</h3>
                      <p className="text-sm text-blue-100 mb-2">Completed 30+ numerology readings</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-700 text-white text-xs font-semibold rounded">Read 30+ numerologies</span>
                        <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded">PLATINUM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vibe Check Badges */}
          <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">✨</span> Vibe Check Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Vibe Check */}
                <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg border-2 border-pink-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">✨</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Vibe Check ✨</h3>
                      <p className="text-sm text-pink-100 mb-2">Completed your first vibe scan</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-pink-600 text-white text-xs font-semibold rounded">Check vibe 1x</span>
                        <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded">BRONZE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vibe Enthusiast */}
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg border-2 border-purple-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🌙</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Vibe Enthusiast 🌙</h3>
                      <p className="text-sm text-purple-100 mb-2">Completed 5 vibe checks</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded">Check vibe 5x</span>
                        <span className="px-3 py-1 bg-slate-600 text-white text-xs font-semibold rounded">SILVER</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vibe Master */}
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg border-2 border-yellow-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🎯</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Vibe Master 🎯</h3>
                      <p className="text-sm text-yellow-100 mb-2">Completed 15 vibe checks</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">Check vibe 15x</span>
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">GOLD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vibe Legend */}
                <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-cyan-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🌈</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Vibe Legend 🌈</h3>
                      <p className="text-sm text-cyan-100 mb-2">Completed 30 vibe checks</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-700 text-white text-xs font-semibold rounded">Check vibe 30x</span>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded">PLATINUM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journal Entry Badges */}
          <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">📓</span> Journal Entry Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Thoughts Flow */}
                <div className="p-4 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg border-2 border-orange-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">📝</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Thoughts Flow 📝</h3>
                      <p className="text-sm text-orange-100 mb-2">Wrote your first journal entry</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-orange-700 text-white text-xs font-semibold rounded">Write 1 entry</span>
                        <span className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded">BRONZE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journal Keeper */}
                <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg border-2 border-slate-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">📚</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Journal Keeper 📚</h3>
                      <p className="text-sm text-slate-100 mb-2">Wrote 5 journal entries</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded">Write 5 entries</span>
                        <span className="px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded">SILVER</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journal Master */}
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border-2 border-yellow-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">✒️</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Journal Master ✒️</h3>
                      <p className="text-sm text-yellow-100 mb-2">Wrote 20 journal entries</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">Write 20 entries</span>
                        <span className="px-3 py-1 bg-yellow-700 text-white text-xs font-semibold rounded">GOLD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journal Legend */}
                <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-2 border-blue-300 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">📖</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Journal Legend 📖</h3>
                      <p className="text-sm text-blue-100 mb-2">Wrote 50 journal entries</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-700 text-white text-xs font-semibold rounded">Write 50 entries</span>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded">PLATINUM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <NotificationSettings />
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
                <p className="text-sm text-black mb-2">
                  <strong>Client Message:</strong>
                </p>
                <p className="text-sm text-black">{selectedBooking.message || "No message provided"}</p>
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

      {/* Profile Picture Upload Dialog */}
      <ProfilePictureUploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={(url) => {
          setProfilePictureUrl(url);
          setUploadDialogOpen(false);
        }}
      />
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}