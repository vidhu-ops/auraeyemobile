import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState, memo, useMemo, lazy, Suspense } from "react";
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
      
      // Add original image if available
      if (reading.imageUrl) {
        try {
          const imgWidth = 90;
          const imgHeight = 160;
          const imgX = (pageWidth - imgWidth);
          const imgY = 100;
          
          // Handle different image formats
          let imageSrc = reading.imageUrl;
          
          // If imageUrl is a hash/filename, use our image serving API
          if (!reading.imageUrl.startsWith('http') && !reading.imageUrl.startsWith('data:')) {
            imageSrc = `/api/image/${reading.imageUrl}`;
          }
          
          console.log('Adding original image to PDF:', imageSrc);
          pdf.addImage(imageSrc, 'JPEG', imgX, imgY, imgWidth, imgHeight);
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Original Image', pageWidth/2, imgY + imgHeight + 8, { align: 'center' });
          console.log('Original image added successfully to PDF');
        } catch (imageError) {
          console.error('Error adding original image to PDF:', imageError);
          // Add placeholder text if image fails
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Original image not available', pageWidth / 2, 125, { align: 'center' });
        }
      }
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(1);
      pdf.line(30, 160, pageWidth - 30, 160);
      
      // Aura Color Analysis
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Complete Aura Color Analysis', 20, 170);
      
      let yPos = 185;
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Personality Color: ${reading.personalityColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Your core essence and fundamental nature', 30, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Giving Color: ${reading.givingColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('How you share energy with others', 30, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Receiving Color: ${reading.receivingColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('How you absorb energy from your environment', 30, yPos);
      yPos += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(147, 51, 234);
      pdf.text(`Thinking Color: ${reading.thinkingColor}`, 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Your mental and spiritual processing patterns', 30, yPos);
      yPos += 20;
      
      // Energy Level Assessment
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Energy Assessment', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Overall Energy Level: ${reading.energyLevel}/10`, 25, yPos);
      
      pdf.setFontSize(8);
      pdf.text('Page 1 of 8', 20, pageHeight - 10);
      
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
          
          // Calculate image dimensions - much larger for better visibility
          const imgWidth = 75;  // Increased from 90
          const imgHeight = 108; // Maintaining 550x800 aspect ratio (550/800 * 75 = 51.5, rounded to 108 for better visibility)
          const spacing = 10;
          const totalWidth = (imgWidth * 2) + spacing;
          const startX = (pageWidth - totalWidth) / 2;
          
          // Original Photo label and image
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Original Photo', startX + (imgWidth / 2), 45, { align: 'center' });
          
          // Add original image
          let originalImageSrc = '';
          if (reading.imageUrl) {
            if (!reading.imageUrl.startsWith('http') && !reading.imageUrl.startsWith('data:')) {
              originalImageSrc = `/api/image/${reading.imageUrl}`;
            } else {
              originalImageSrc = reading.imageUrl;
            }
            
            console.log('Adding original image to PDF:', originalImageSrc.substring(0, 100));
            pdf.addImage(originalImageSrc, 'JPEG', startX, 50, imgWidth, imgHeight);
            console.log('Original image added successfully to PDF');
          }
          
          // With Aura Colors label and image
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          pdf.text('With Aura Colors', startX + imgWidth + spacing + (imgWidth / 2), 45, { align: 'center' });
          
          console.log('Adding processed aura image to PDF...');
          // Add processed aura image
          let finalImageSrc = '';
          if (reading.processedAuraImage) {
            if (!reading.processedAuraImage.startsWith('data:')) {
              finalImageSrc = `data:image/jpeg;base64,${reading.processedAuraImage}`;
            } else {
              finalImageSrc = reading.processedAuraImage;
            }
            console.log('Using processed aura image for PDF');
          } else if (reading.imageUrl) {
            // Fallback to original if no processed image
            finalImageSrc = originalImageSrc;
            console.log('Using original image as fallback for PDF');
          }
          
          console.log('Final image source for aura visualization:', finalImageSrc.substring(0, 100));
          pdf.addImage(finalImageSrc, 'JPEG', startX + imgWidth + spacing, 50, imgWidth, imgHeight);
          console.log('Aura image added successfully to PDF');
          
          // Description text
          pdf.setFontSize(11);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Processed Aura Analysis Visualization with Energy Fields', pageWidth / 2, 170, { align: 'center' });
          
          pdf.setFontSize(9);
          pdf.text('This image shows the spiritual energy colors surrounding your aura field.', pageWidth / 2, 180, { align: 'center' });
          pdf.text('Colors represent different aspects of your personality and energy flow.', pageWidth / 2, 190, { align: 'center' });
          
          pdf.setFontSize(8);
          pdf.text('Page 2 of 8', 20, pageHeight - 10);
          
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
          
          pdf.setFontSize(8);
          pdf.text('Page 2 of 8', 20, pageHeight - 10);
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
        
        pdf.setFontSize(8);
        pdf.text('Page 2 of 8', 20, pageHeight - 10);
        
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
      
      // Extract ALL chakra data from the reading
      const allChakraData = {
        'soulStar': chakraActivity.soulStar || 7,
        'crown': chakraActivity.crown || 6,
        'thirdEye': chakraActivity.thirdEye || 7,
        'throat': chakraActivity.throat || 6,
        'heart': chakraActivity.heart || 8,
        'solarPlexus': chakraActivity.solarPlexus || 7,
        'sacral': chakraActivity.sacral || 6,
        'root': chakraActivity.root || 8,
        'earthStar': chakraActivity.earthStar || 7
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
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 3 of 8', 20, pageHeight - 10);
      
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
      
      // Calculate chakra percentages
      const higherChakras = ['Soul Star Chakra', 'Crown Chakra', 'Third Eye Chakra'];
      const middleChakras = ['Throat Chakra', 'Heart Chakra', 'Solar Plexus Chakra'];
      const lowerChakras = ['Sacral Chakra', 'Root Chakra', 'Earth Star Chakra'];
      
      const higherAvg = higherChakras.reduce((sum, chakra) => sum + (chakraActivity[chakra] || 5), 0) / higherChakras.length;
      const middleAvg = middleChakras.reduce((sum, chakra) => sum + (chakraActivity[chakra] || 5), 0) / middleChakras.length;
      const lowerAvg = lowerChakras.reduce((sum, chakra) => sum + (chakraActivity[chakra] || 5), 0) / lowerChakras.length;
      
      const total = higherAvg + middleAvg + lowerAvg;
      const higherPercent = ((higherAvg / total) * 100).toFixed(1);
      const middlePercent = ((middleAvg / total) * 100).toFixed(1);
      const lowerPercent = ((lowerAvg / total) * 100).toFixed(1);
      
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
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 4 of 8', 20, pageHeight - 10);
      
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
        { position: 'Personality', color: reading.personalityColor, meaning: 'Your core essence and fundamental spiritual nature' },
        { position: 'Giving', color: reading.givingColor, meaning: 'How you share and project energy to others' },
        { position: 'Receiving', color: reading.receivingColor, meaning: 'How you absorb and process energy from environment' },
        { position: 'Thinking', color: reading.thinkingColor, meaning: 'Your mental and spiritual processing patterns' }
      ];
      
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
        
        // Add color-specific meanings from the data
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
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 5 of 8', 20, pageHeight - 10);
      
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
      const zonesData = parseJsonField(reading.zones);
      if (zonesData && Object.keys(zonesData).length > 0) {
        // Check if we need a new page
        if (yPos > 200) {
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('ENERGY ZONES ANALYSIS', pageWidth / 2, 25, { align: 'center' });
          yPos = 45;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Energy Zones Detailed Analysis', 20, yPos);
        yPos += 15;
        
        // Process each zone
        Object.entries(zonesData).forEach(([zoneName, zoneData]: [string, any]) => {
          if (zoneData && typeof zoneData === 'object') {
            pdf.setFontSize(14);
            pdf.setTextColor(147, 51, 234);
            pdf.text(`${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)} Zone:`, 25, yPos);
            yPos += 10;
            
            if (zoneData.colors && Array.isArray(zoneData.colors)) {
              pdf.setFontSize(11);
              pdf.setTextColor(55, 65, 81);
              pdf.text(`Colors: ${zoneData.colors.join(', ')}`, 30, yPos);
              yPos += 8;
            }
            
            if (zoneData.traits && Array.isArray(zoneData.traits)) {
              pdf.setFontSize(11);
              pdf.setTextColor(55, 65, 81);
              pdf.text(`Traits: ${zoneData.traits.join(', ')}`, 30, yPos);
              yPos += 8;
            }
            
            if (zoneData.description) {
              pdf.setFontSize(10);
              pdf.setTextColor(55, 65, 81);
              const zoneLines = pdf.splitTextToSize(zoneData.description, pageWidth - 60);
              pdf.text(zoneLines, 30, yPos);
              yPos += zoneLines.length * 4 + 10;
            }
            
            yPos += 5;
            
            // Check if we need a new page
            if (yPos > 240) {
              pdf.addPage();
              pdf.setFontSize(18);
              pdf.setTextColor(147, 51, 234);
              pdf.text('ZONES ANALYSIS (CONTINUED)', pageWidth / 2, 25, { align: 'center' });
              yPos = 45;
            }
          }
        });
      }
      
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
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 6', 20, pageHeight - 10);
      
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
          
          // Get color meaning from colorMeanings if available
          const colorMeaningsData = parseJsonField(reading.colorMeanings);
          const meaning = colorMeaningsData && colorMeaningsData[color];
          
          if (meaning) {
            if (meaning.description) {
              pdf.setFontSize(10);
              pdf.setTextColor(55, 65, 81);
              const descLines = pdf.splitTextToSize(meaning.description, pageWidth - 60);
              pdf.text(descLines, 30, yPos);
              yPos += descLines.length * 4 + 5;
            }
            
            if (meaning.positive) {
              pdf.setFontSize(9);
              pdf.setTextColor(34, 197, 94);
              pdf.text('Positive Aspects:', 35, yPos);
              yPos += 5;
              const positiveLines = pdf.splitTextToSize(meaning.positive, pageWidth - 70);
              pdf.text(positiveLines, 40, yPos);
              yPos += positiveLines.length * 4 + 3;
            }
            
            if (meaning.growth) {
              pdf.setFontSize(9);
              pdf.setTextColor(239, 68, 68);
              pdf.text('Growth Areas:', 35, yPos);
              yPos += 5;
              const growthLines = pdf.splitTextToSize(meaning.growth, pageWidth - 70);
              pdf.text(growthLines, 40, yPos);
              yPos += growthLines.length * 4 + 8;
            }
          } else {
            // Basic color information if detailed meaning not available
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81);
            pdf.text(`${color} energy contributes to your overall aura composition and spiritual development.`, 30, yPos);
            yPos += 12;
          }
          
          yPos += 8;
        });
        
        pdf.setFontSize(8);
        pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 7', 20, pageHeight - 10);
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
          title: `${reading.personalityColor} Personality Enhancement`,
          content: `Wear ${reading.personalityColor.toLowerCase()} clothing or carry ${reading.personalityColor.toLowerCase()} crystals to amplify your natural personality traits. This color supports your core essence and authentic self-expression.`
        },
        {
          title: `${reading.givingColor} Giving Energy Balance`,
          content: `Incorporate ${reading.givingColor.toLowerCase()} elements in your environment to enhance your natural giving abilities. This helps balance how you share energy with others.`
        },
        {
          title: `${reading.receivingColor} Receiving Energy Optimization`,
          content: `Practice meditation with ${reading.receivingColor.toLowerCase()} visualization to improve your ability to receive and process external energies effectively.`
        },
        {
          title: `${reading.thinkingColor} Mental Clarity Enhancement`,
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
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Final Page', 20, pageHeight - 10);
      
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
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 7 of 8', 20, pageHeight - 10);
      
      // PAGE 8: DETAILED ANALYSIS & HEALER NOTES
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('DETAILED ANALYSIS & PROFESSIONAL NOTES', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, pageWidth - 30, 35);
      
      yPos = 50;
      
      // Advanced Aura Field Analysis
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Advanced Aura Field Analysis', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      const detailedAnalysisText = detailedAnalysis || reading.analysis || 'Complete spiritual analysis of your aura field energy patterns and their significance for personal growth and spiritual development.';
      const detailedLines = pdf.splitTextToSize(detailedAnalysisText, pageWidth - 40);
      pdf.text(detailedLines, 25, yPos);
      yPos += detailedLines.length * 6 + 20;
      
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chakras">Chakras</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
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
                <p className="text-sm font-medium">Personality</p>
                <p className="text-xs text-gray-600">{reading.personalityColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.givingColor)}`}></div>
                <p className="text-sm font-medium">Giving</p>
                <p className="text-xs text-gray-600">{reading.givingColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.receivingColor)}`}></div>
                <p className="text-sm font-medium">Receiving</p>
                <p className="text-xs text-gray-600">{reading.receivingColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.thinkingColor)}`}></div>
                <p className="text-sm font-medium">Thinking</p>
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
              {Object.entries(chakraActivity).map(([chakra, score]) => {
                  return (
                      <div key={chakra} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{chakra.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-sm font-bold text-indigo-600">{Number(score)}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${(Number(score) / 10) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                  );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-6">
            <h4 className="font-semibold text-lg mb-3">Color Meanings</h4>
            <div className="space-y-4">
              {Object.entries(colorMeanings).map(([color, meaning]) => (
                <div key={color} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColorClass(color)}`}></div>
                    <h5 className="font-medium text-gray-800">{color}</h5>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{String(meaning)}</p>
                </div>
              ))}
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
            <p className="text-sm font-medium text-emerald-700">Personal Year 2025</p>
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
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingTab, setBookingTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState<HealerBooking | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch healer's own numerology readings
  const { data: healerNumerologyReadings = [] } = useQuery<NumerologyReading[]>({
    queryKey: ["/api/healer-numerology-readings"],
    enabled: !!user,
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
            <p className="text-gray-600">Welcome back, {user?.username}! Manage your practice and connect with clients.</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <p className="text-sm text-gray-600 mb-4">Analyze your own spiritual energy and aura colors</p>
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
                <Link to="/object-analysis">
                  <Button className="w-full">Analyze Object</Button>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}