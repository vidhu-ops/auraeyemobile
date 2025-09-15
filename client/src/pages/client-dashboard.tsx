import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { SoulEnergyOrb } from "@/components/SoulEnergyOrb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Star,
  Target,
  Book,
  Heart,
  Calendar,
  Eye,
  TrendingUp,
  Sparkles,
  Loader2,
  Compass,
  Lightbulb,
  Zap,
  Download,
  Palette
} from "lucide-react";

interface UserBooking {
  id: number;
  userId: number;
  healerId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  healerResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

interface AuraReading {
  id: number;
  userId: number;
  name: string;
  dominantColor: string;
  secondaryColor?: string;
  energyLevel: number;
  analysis: string;
  spiritualGuidance?: string;
  personalityTraits?: string;
  personalityColor?: string;
  givingColor?: string;
  receivingColor?: string;
  thinkingColor?: string;
  chakraActivity?: string;
  zones?: string;
  colorMeanings?: string;
  detailedAnalysis?: string;
  auraColorSpectrum?: string;
  processedAuraImage?: string;
  imageUrl?: string;
  createdAt: string;
}

interface JournalEntry {
  id: number;
  userId: number;
  energyLevel: number;
  reflections: string;
  gratitude: string;
  createdAt: string;
}

// AuraReadingCard component for displaying individual aura readings
function AuraReadingCard({ reading }: { reading: AuraReading }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Parse JSON fields safely
  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '{}');
    } catch {
      return {};
    }
  };

  const chakraActivity = parseJsonField(reading.chakraActivity);
  const zones = parseJsonField(reading.zones);
  const colorMeanings = parseJsonField(reading.colorMeanings);
  const personalityTraits = parseJsonField(reading.personalityTraits);
  const auraColorSpectrum = parseJsonField(reading.auraColorSpectrum);

  // Color mapping for visualization
  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'Red': 'from-red-400 to-red-600',
      'Orange': 'from-orange-400 to-orange-600',
      'Yellow': 'from-yellow-400 to-yellow-600',
      'Green': 'from-green-400 to-green-600',
      'Blue': 'from-blue-400 to-blue-600',
      'Indigo': 'from-orange-400 to-orange-600',
      'Violet': 'from-pink-400 to-pink-600',
      'White': 'from-gray-100 to-gray-300',
      'Black': 'from-gray-800 to-gray-900',
      'Gold': 'from-yellow-300 to-yellow-500',
      'Silver': 'from-gray-300 to-gray-500',
      'Brown': 'from-amber-600 to-amber-800'
    };
    return colorMap[color] || 'from-gray-400 to-gray-600';
  };

  const generateComprehensivePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const { format } = await import('date-fns');
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const clientName = user?.username || 'Valued Client';
      
      // Parse all data fields
      const spiritualGuidance = reading.spiritualGuidance || 'Your aura reveals unique energy patterns representing spiritual growth and development.';
      const detailedAnalysis = reading.detailedAnalysis || 'Advanced spiritual development with balanced energy flow.';
      
      // PAGE 1: COVER PAGE & OVERVIEW
      pdf.setFontSize(24);
      pdf.setTextColor(147, 51, 234);
      pdf.text('PERSONAL AURA ANALYSIS REPORT', pageWidth / 2, 40, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Client: ${reading.name}`, pageWidth / 2, 60, { align: 'center' });
      pdf.text(`Report Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, pageWidth / 2, 75, { align: 'center' });
      
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(1);
      pdf.line(30, 90, pageWidth - 30, 90);
      
      // Aura Color Analysis
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Complete Aura Color Analysis', 20, 110);
      
      let yPos = 125;
      if (reading.personalityColor) {
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`Personality Color: ${reading.personalityColor}`, 25, yPos);
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Your core essence and fundamental nature', 30, yPos);
        yPos += 15;
      }
      
      if (reading.givingColor) {
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`Giving Color: ${reading.givingColor}`, 25, yPos);
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.text('How you share energy with others', 30, yPos);
        yPos += 15;
      }
      
      if (reading.receivingColor) {
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`Receiving Color: ${reading.receivingColor}`, 25, yPos);
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.text('How you absorb energy from your environment', 30, yPos);
        yPos += 15;
      }
      
      if (reading.thinkingColor) {
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`Thinking Color: ${reading.thinkingColor}`, 25, yPos);
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.text('Your mental and spiritual processing patterns', 30, yPos);
        yPos += 20;
      }
      
      // Energy Level Assessment
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Energy Assessment', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Overall Energy Level: ${reading.energyLevel}/10`, 25, yPos);
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 1 of 4', 20, pageHeight - 10);

      // PAGE 2: AURA VISUALIZATION (if available)
      if (reading.processedAuraImage || reading.imageUrl) {
        try {
          pdf.addPage();
          
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('AURA VISUALIZATION', pageWidth / 2, 25, { align: 'center' });
          
          // Add image centered with proper aspect ratio
          const imgWidth = 160;
          const imgHeight = 90; // 16:9 aspect ratio
          const imgX = (pageWidth - imgWidth) / 2;
          
          // Try to add the processed aura image, fall back to original if needed
          const imageToAdd = reading.processedAuraImage || reading.imageUrl;
          pdf.addImage(imageToAdd, 'JPEG', imgX, 35, imgWidth, imgHeight);
          
          pdf.setFontSize(12);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Your Personal Aura Analysis Visualization', pageWidth / 2, 135, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.text('This image shows the spiritual energy colors surrounding your aura field.', pageWidth / 2, 150, { align: 'center' });
          
          pdf.setFontSize(8);
          pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 2 of 4', 20, pageHeight - 10);
          
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
        }
      }

      // PAGE 3: DETAILED ANALYSIS
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('DETAILED SPIRITUAL ANALYSIS', pageWidth / 2, 25, { align: 'center' });
      
      yPos = 45;
      
      // Analysis text
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Complete Analysis', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      const analysisText = reading.analysis || 'Your aura displays a beautiful balance of energies.';
      const splitAnalysis = pdf.splitTextToSize(analysisText, pageWidth - 40);
      pdf.text(splitAnalysis, 20, yPos);
      yPos += splitAnalysis.length * 5 + 10;
      
      // Spiritual guidance
      if (spiritualGuidance) {
        pdf.setFontSize(14);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Spiritual Guidance', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const splitGuidance = pdf.splitTextToSize(spiritualGuidance, pageWidth - 40);
        pdf.text(splitGuidance, 20, yPos);
        yPos += splitGuidance.length * 5 + 10;
      }

      // PAGE 4: FINAL SUMMARY
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234);
      pdf.text('PERSONAL INSIGHTS & RECOMMENDATIONS', pageWidth / 2, 25, { align: 'center' });
      
      yPos = 45;
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const finalSummary = `Your aura analysis reveals a ${reading.dominantColor?.toLowerCase() || 'vibrant'} dominant energy with an energy level of ${reading.energyLevel}/10. This indicates a ${reading.energyLevel >= 7 ? 'highly active' : reading.energyLevel >= 5 ? 'balanced' : 'gentle'} spiritual presence. Continue developing your spiritual awareness through meditation, energy work, and conscious living practices. Your unique energy signature offers valuable gifts to the world - embrace your authentic spiritual self and share your light with others.`;
      
      const splitSummary = pdf.splitTextToSize(finalSummary, pageWidth - 40);
      pdf.text(splitSummary, 20, yPos);
      yPos += splitSummary.length * 5 + 20;
      
      pdf.setFontSize(12);
      pdf.setTextColor(147, 51, 234);
      pdf.text('Continue Your Spiritual Journey', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      const recommendations = [
        '• Practice daily meditation to strengthen your energy field',
        '• Keep a spiritual journal to track your energy patterns',
        '• Connect with like-minded spiritual communities',
        '• Consider working with a professional healer for deeper guidance',
        '• Trust your intuition and follow your spiritual path'
      ];
      
      recommendations.forEach(rec => {
        pdf.text(rec, 25, yPos);
        yPos += 7;
      });
      
      pdf.setFontSize(8);
      pdf.text('Generated by AuraEye - Your Spiritual Wellness Platform   Page 4 of 4', 20, pageHeight - 10);
      
      // Save the PDF
      pdf.save(`aura-analysis-${reading.name}-${format(new Date(reading.createdAt), "yyyy-MM-dd")}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your complete aura analysis report has been downloaded successfully.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Error",
        description: "There was an error downloading your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Card className="border-2 border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-orange-800">{reading.name}</CardTitle>
            <CardDescription className="text-orange-600">
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
              onClick={generateComprehensivePDF}
              disabled={isGeneratingPDF}
              title="Download Complete PDF Report"
            >
              {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Aura Colors Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {reading.personalityColor && (
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.personalityColor)}`}></div>
              <p className="text-xs font-medium">Personality</p>
              <p className="text-xs text-gray-600">{reading.personalityColor}</p>
            </div>
          )}
          {reading.givingColor && (
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.givingColor)}`}></div>
              <p className="text-xs font-medium">Giving</p>
              <p className="text-xs text-gray-600">{reading.givingColor}</p>
            </div>
          )}
          {reading.receivingColor && (
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.receivingColor)}`}></div>
              <p className="text-xs font-medium">Receiving</p>
              <p className="text-xs text-gray-600">{reading.receivingColor}</p>
            </div>
          )}
          {reading.thinkingColor && (
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.thinkingColor)}`}></div>
              <p className="text-xs font-medium">Thinking</p>
              <p className="text-xs text-gray-600">{reading.thinkingColor}</p>
            </div>
          )}
        </div>

        {/* Quick Analysis Preview */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-2">
            {reading.analysis || reading.spiritualGuidance || 'Your aura displays beautiful energy patterns representing spiritual growth and balance.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const { soulEnergy, isLoading: isSoulEnergyLoading } = useSoulEnergy();

  // Fetch user bookings
  const { data: userBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/user-bookings'],
    enabled: !!user,
  });

  // Fetch user aura readings for spiritual journey
  const { data: auraReadings = [], isLoading: isLoadingAura } = useQuery({
    queryKey: ['/api/aura-readings'],
    enabled: !!user,
  });

  // Fetch user journal entries for spiritual journey
  const { data: journalEntries = [], isLoading: isLoadingJournal } = useQuery({
    queryKey: ['/api/journal'],
    enabled: !!user,
  });

  // Fetch user credits
  useEffect(() => {
    if (user) {
      fetch('/api/user-credits')
        .then(res => res.json())
        .then(data => setCredits(data.credits || 0))
        .catch(() => setCredits(0));
    }
  }, [user]);

  // Calculate spiritual journey insights
  const calculateSpiritualJourney = () => {
    const recentDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - recentDays);

    // Filter recent data
    const recentAuraReadings = (auraReadings as AuraReading[]).filter(
      reading => new Date(reading.createdAt) >= cutoffDate
    );
    const recentJournalEntries = (journalEntries as JournalEntry[]).filter(
      entry => new Date(entry.createdAt) >= cutoffDate
    );

    // Calculate average energy levels
    const avgAuraEnergy = recentAuraReadings.length > 0 
      ? recentAuraReadings.reduce((sum, reading) => sum + reading.energyLevel, 0) / recentAuraReadings.length
      : 0;
    
    const avgJournalEnergy = recentJournalEntries.length > 0
      ? recentJournalEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / recentJournalEntries.length
      : 0;

    // Analyze dominant colors
    const colorCounts: Record<string, number> = {};
    recentAuraReadings.forEach(reading => {
      colorCounts[reading.dominantColor] = (colorCounts[reading.dominantColor] || 0) + 1;
    });
    
    const dominantColor = Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b, Object.keys(colorCounts)[0]
    );

    // Calculate consistency (how stable energy levels are)
    const energyValues = [...recentAuraReadings.map(r => r.energyLevel), ...recentJournalEntries.map(j => j.energyLevel)];
    const avgEnergy = energyValues.length > 0 ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length : 0;
    const variance = energyValues.length > 0 
      ? energyValues.reduce((sum, val) => sum + Math.pow(val - avgEnergy, 2), 0) / energyValues.length 
      : 0;
    const consistency = Math.max(0, 100 - Math.sqrt(variance) * 10); // Higher consistency = more stable energy

    // Growth trend (comparing first half vs second half of period)
    const midpoint = Math.floor(energyValues.length / 2);
    const firstHalf = energyValues.slice(0, midpoint);
    const secondHalf = energyValues.slice(midpoint);
    const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    const growthTrend = secondHalfAvg - firstHalfAvg;

    // Generate insights based on data
    const insights = [];
    
    if (avgAuraEnergy > 7) {
      insights.push("Your aura readings show high spiritual energy - you're in a powerful phase of growth!");
    } else if (avgAuraEnergy > 5) {
      insights.push("Your spiritual energy is balanced and steady - a good foundation for deeper work.");
    } else if (avgAuraEnergy > 0) {
      insights.push("Your energy levels suggest you may benefit from grounding practices and self-care.");
    }

    if (dominantColor) {
      const colorMeanings: Record<string, string> = {
        'Red': 'You\'re in an action-oriented phase, full of passion and determination',
        'Orange': 'Creativity and enthusiasm are your current strengths',
        'Yellow': 'Mental clarity and wisdom are guiding your journey',
        'Green': 'Healing and growth energies surround you',
        'Blue': 'Peace and spiritual communication are prominent themes',
        'Purple': 'You\'re accessing higher wisdom and spiritual insights',
        'Pink': 'Love and compassion are central to your current path',
        'Gold': 'Divine wisdom and enlightenment are present in your aura',
        'Silver': 'Intuition and psychic abilities are heightened',
        'White': 'Pure spiritual energy and protection surround you'
      };
      
      if (colorMeanings[dominantColor]) {
        insights.push(colorMeanings[dominantColor]);
      }
    }

    if (growthTrend > 1) {
      insights.push("Your spiritual journey shows beautiful upward momentum - keep following your current path!");
    } else if (growthTrend < -1) {
      insights.push("You may be in a phase of inner reflection and processing - this is valuable spiritual work too.");
    }

    if (consistency > 70) {
      insights.push("You maintain remarkably consistent energy levels - your spiritual practices are serving you well.");
    }

    return {
      totalReadings: recentAuraReadings.length,
      totalJournalEntries: recentJournalEntries.length,
      avgAuraEnergy: Math.round(avgAuraEnergy * 10) / 10,
      avgJournalEnergy: Math.round(avgJournalEnergy * 10) / 10,
      dominantColor,
      consistency: Math.round(consistency),
      growthTrend: Math.round(growthTrend * 10) / 10,
      insights: insights.slice(0, 3), // Limit to top 3 insights
      hasData: recentAuraReadings.length > 0 || recentJournalEntries.length > 0
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold">Welcome, {user.username}</h1>
              <p className="opacity-80">Your spiritual wellness dashboard</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <div className="text-black">💳</div>
              <span className="font-medium text-black">{credits} credits</span>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your most used spiritual tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/aura-analysis">
                      <Camera className="h-6 w-6 text-primary" />
                      <span>Scan Aura</span>
                      <span className="text-xs text-orange-600">15 credits</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-orange-300 bg-gradient-to-br from-orange-50 to-pink-50 hover:from-orange-100 hover:to-pink-100">
                    <Link href="/#vibe-check-section">
                      <Sparkles className="h-6 w-6 text-orange-500" />
                      <span className="text-xs text-center">What's My Vibe?</span>
                      <span className="text-xs text-orange-600">1 credit</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/object-analysis">
                      <span className="text-orange-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </span>
                      <span>Object Analysis</span>
                      <span className="text-xs text-orange-600">5 credits</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/daily-horoscope">
                      <Star className="h-6 w-6 text-secondary" />
                      <span>Daily Horoscope</span>
                      <span className="text-xs text-green-600">free</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-primary/50 bg-primary/5">
                    <Link href="/personalized-horoscope">
                      <Target className="h-6 w-6 text-primary" />
                      <span className="text-xs text-center">Personal Horoscope</span>
                      <span className="text-xs text-green-600">free</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/journal">
                      <Book className="h-6 w-6 text-accent" />
                      <span>Journal Entry</span>
                      
                      <span className="text-xs text-green-600">free</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Healer Booking Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Connect with Healers
                </CardTitle>
                <CardDescription>Book sessions with certified spiritual healers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Browse Healers</h3>
                        <p className="text-sm text-gray-600">Find the perfect healer for you</p>
                      </div>
                    </div>
                    <Link href="/healers">
                      <Button className="w-full" variant="outline">
                        View All Healers
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">My Bookings</h3>
                        <p className="text-sm text-gray-600">Manage your sessions</p>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      View Bookings ({userBookings.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Spiritual Journey Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-orange-500" />
                  Your Spiritual Journey
                </CardTitle>
                <CardDescription>Insights from your aura readings and journal reflections (last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const journeyData = calculateSpiritualJourney();
                  const isLoading = isLoadingAura || isLoadingJournal;

                  if (isLoading) {
                    return (
                      <div className="flex justify-center items-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    );
                  }

                  if (!journeyData.hasData) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">Start your spiritual journey to see personalized insights</p>
                        <div className="flex gap-2 justify-center">
                          <Link to="/#vibe-check-section">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Check Your Vibe
                            </Button>
                          </Link>
                          <Link to="/journal">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Book className="h-4 w-4" />
                              Start Journaling
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Energy Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-600">{journeyData.totalReadings}</div>
                          <div className="text-sm text-orange-500">Aura Readings</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg border border-pink-200">
                          <div className="text-2xl font-bold text-pink-600">{journeyData.totalJournalEntries}</div>
                          <div className="text-sm text-pink-500">Journal Entries</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{journeyData.avgAuraEnergy || journeyData.avgJournalEnergy || 'N/A'}</div>
                          <div className="text-sm text-green-500">Avg Energy Level</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-600">{journeyData.consistency}%</div>
                          <div className="text-sm text-orange-500">Consistency</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                          <div className="flex flex-col items-center">
                            <div className="mb-2">
                              <SoulEnergyOrb soulEnergy={soulEnergy} size={24} />
                            </div>
                            <div className="text-2xl font-bold text-amber-600">{isSoulEnergyLoading ? '...' : soulEnergy}</div>
                            <div className="text-sm text-amber-500">Soul Energy</div>
                          </div>
                        </div>
                      </div>

                      {/* Dominant Color & Growth Trend */}
                      {journeyData.dominantColor && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white rounded-lg border">
                            <div className="flex items-center gap-3 mb-3">
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: journeyData.dominantColor.toLowerCase() }}
                              ></div>
                              <div>
                                <h4 className="font-medium">Dominant Aura Color</h4>
                                <p className="text-sm text-gray-500">{journeyData.dominantColor}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white rounded-lg border">
                            <div className="flex items-center gap-3">
                              <TrendingUp className={`h-6 w-6 ${journeyData.growthTrend >= 0 ? 'text-green-500' : 'text-orange-500'}`} />
                              <div>
                                <h4 className="font-medium">Energy Trend</h4>
                                <p className="text-sm text-gray-500">
                                  {journeyData.growthTrend >= 0 ? 'Rising' : 'Reflecting'} ({journeyData.growthTrend >= 0 ? '+' : ''}{journeyData.growthTrend})
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personalized Insights */}
                      {journeyData.insights.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-5 w-5 text-orange-500" />
                            <h4 className="font-medium text-orange-700">Your Spiritual Insights</h4>
                          </div>
                          <div className="space-y-2">
                            {journeyData.insights.map((insight, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Zap className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-orange-600">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-2 justify-center pt-4">
                        <Link to="/#vibe-check-section">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Check Vibe Again
                          </Button>
                        </Link>
                        <Link to="/journal">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Book className="h-4 w-4" />
                            Add Journal Entry
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

           

            {/* Your Booking History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Your Booking History
                </CardTitle>
                <CardDescription>View your healer booking history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  <div className="flex justify-center items-center h-[150px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : userBookings.length === 0 ? (
                  <div className="text-center h-[150px] flex flex-col justify-center text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No healer bookings yet</p>
                    <Link to="/healers">
                      <Button className="mt-2" variant="outline" size="sm">
                        Browse Healers
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[150px] overflow-y-auto">
                    {userBookings.map((booking: UserBooking) => (
                      <div key={booking.id} className="border rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Healer Session #{booking.id}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {booking.status === 'accepted' ? 'Accepted' : 
                                 booking.status === 'rejected' ? 'Rejected' : 'Pending'}
                              </span>
                            </div>
                            {booking.message && (
                              <p className="text-xs text-gray-600 mt-1">
                                <strong>Your message:</strong> {booking.message.substring(0, 50) + (booking.message.length > 50 ? '...' : '')}
                              </p>
                            )}
                            {booking.healerResponse && (
                              <p className="text-xs text-blue-600 mt-1 p-2 bg-blue-50 rounded">
                                <strong>Healer response:</strong> {booking.healerResponse}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Requested: {format(new Date(booking.createdAt), "MMM d, yyyy")}
                              {booking.respondedAt && (
                                <span className="ml-2">• Responded: {format(new Date(booking.respondedAt), "MMM d, yyyy")}</span>
                              )}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div>
            {/* Quick Stats Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Credits</span>
                    <span className="font-medium">{credits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bookings</span>
                    <span className="font-medium">{userBookings.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}