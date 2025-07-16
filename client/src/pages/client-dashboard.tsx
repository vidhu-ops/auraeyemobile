import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Camera, 
  Star, 
  Book, 
  Calendar, 
  Activity,
  Loader2,
  Eye,
  Palette,
  TrendingUp,
  Heart,
  Brain,
  Sparkles,
  Download,
  Target,
  Award,
  AlertTriangle,
  Smile,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getDailyHoroscope, HoroscopeResult, calculateNumerology, NumerologyResult } from "@/lib/openai";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

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

interface JournalEntry {
  id: number;
  userId: number;
  energyLevel: number;
  reflections: string;
  gratitude: string;
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
  interpretation: string;
  createdAt: string;
}

interface ObjectAnalysis {
  id: number;
  userId: number;
  name: string;
  imageUrl: string;
  objectName: string;
  objectDescription: string;
  objectPurpose: string;
  auraColor: string;
  auraDescription: string;
  energyLevel: number;
  energyQualities: string;
  historicalSignificance?: string;
  spiritualSignificance?: string;
  detailedAnalysis: string;
  createdAt: string;
}

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const { toast } = useToast();
  const [selectedSign, setSelectedSign] = useState<string>("aries");
  const [currentAuraIndex, setCurrentAuraIndex] = useState(0);
  const [currentNumerologyIndex, setCurrentNumerologyIndex] = useState(0);
  const [activeBookingsTab, setActiveBookingsTab] = useState<string>("aura");

  // Progress tracking analysis functions
  const analyzeProgress = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter recent data
    const recentAuraReadings = Array.isArray(auraReadings) ? 
      auraReadings.filter((reading: AuraReading) => new Date(reading.createdAt) >= thirtyDaysAgo) : [];
    const recentJournalEntries = Array.isArray(journalEntries) ? 
      journalEntries.filter((entry: JournalEntry) => new Date(entry.createdAt) >= thirtyDaysAgo) : [];
    const weeklyJournalEntries = Array.isArray(journalEntries) ? 
      journalEntries.filter((entry: JournalEntry) => new Date(entry.createdAt) >= sevenDaysAgo) : [];

    // Calculate energy trends
    const energyTrend = calculateEnergyTrend(recentJournalEntries);
    const averageEnergy = recentJournalEntries.length > 0 ? 
      recentJournalEntries.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / recentJournalEntries.length : 0;

    // Analyze aura color patterns
    const colorFrequency = analyzeAuraColors(recentAuraReadings);
    const dominantColors = Object.entries(colorFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);

    // Growth indicators
    const growthIndicators = identifyGrowthAreas(recentJournalEntries, recentAuraReadings);
    
    // Challenges
    const challenges = identifyCommonChallenges(recentJournalEntries);
    
    // Positive changes
    const positiveChanges = identifyPositiveChanges(recentJournalEntries, weeklyJournalEntries);

    return {
      energyTrend,
      averageEnergy,
      dominantColors,
      growthIndicators,
      challenges,
      positiveChanges,
      totalReadings: recentAuraReadings.length,
      totalJournalEntries: recentJournalEntries.length
    };
  };

  const calculateEnergyTrend = (entries: JournalEntry[]) => {
    if (entries.length < 2) return 'stable';
    
    const sortedEntries = entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2));
    const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.energyLevel, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.energyLevel, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    if (difference > 0.5) return 'increasing';
    if (difference < -0.5) return 'decreasing';
    return 'stable';
  };

  const analyzeAuraColors = (readings: AuraReading[]) => {
    const colorCount: { [key: string]: number } = {};
    readings.forEach(reading => {
      colorCount[reading.dominantColor] = (colorCount[reading.dominantColor] || 0) + 1;
      if (reading.secondaryColor) {
        colorCount[reading.secondaryColor] = (colorCount[reading.secondaryColor] || 0) + 1;
      }
    });
    return colorCount;
  };

  const identifyGrowthAreas = (journalEntries: JournalEntry[], auraReadings: AuraReading[]) => {
    const indicators = [];
    
    if (journalEntries.length >= 5) {
      indicators.push("Consistent spiritual practice through regular journaling");
    }
    
    if (auraReadings.length >= 3) {
      const avgEnergy = auraReadings.reduce((sum, reading) => sum + reading.energyLevel, 0) / auraReadings.length;
      if (avgEnergy >= 7) {
        indicators.push("Maintaining high energy levels in aura readings");
      }
    }
    
    const recentHighEnergyDays = journalEntries.filter(entry => entry.energyLevel >= 8).length;
    if (recentHighEnergyDays >= 3) {
      indicators.push("Experiencing more high-energy days");
    }
    
    return indicators;
  };

  const identifyCommonChallenges = (entries: JournalEntry[]) => {
    const challenges = [];
    
    const lowEnergyDays = entries.filter(entry => entry.energyLevel <= 4).length;
    const totalDays = entries.length;
    
    if (lowEnergyDays / totalDays > 0.3) {
      challenges.push("Managing energy levels during stressful periods");
    }
    
    const stressfulEntries = entries.filter(entry => 
      entry.reflections.toLowerCase().includes('stress') || 
      entry.reflections.toLowerCase().includes('anxious') ||
      entry.reflections.toLowerCase().includes('overwhelmed')
    ).length;
    
    if (stressfulEntries / totalDays > 0.2) {
      challenges.push("Dealing with stress and anxiety");
    }
    
    if (entries.filter(entry => entry.energyLevel <= 3).length > 0) {
      challenges.push("Recovering from particularly low energy periods");
    }
    
    return challenges;
  };

  const identifyPositiveChanges = (allEntries: JournalEntry[], recentEntries: JournalEntry[]) => {
    const changes = [];
    
    if (recentEntries.length >= 3) {
      const recentAvgEnergy = recentEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / recentEntries.length;
      const olderEntries = allEntries.filter(entry => !recentEntries.includes(entry));
      
      if (olderEntries.length > 0) {
        const olderAvgEnergy = olderEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / olderEntries.length;
        if (recentAvgEnergy > olderAvgEnergy + 0.5) {
          changes.push("Noticeable improvement in overall energy levels");
        }
      }
    }
    
    const positiveKeywords = ['grateful', 'happy', 'peaceful', 'calm', 'balanced', 'positive', 'growth', 'progress'];
    const recentPositiveEntries = recentEntries.filter(entry =>
      positiveKeywords.some(keyword => entry.reflections.toLowerCase().includes(keyword))
    ).length;
    
    if (recentPositiveEntries >= 2) {
      changes.push("Increased focus on gratitude and positive experiences");
    }
    
    if (recentEntries.length >= 5) {
      changes.push("Developing a consistent mindfulness practice");
    }
    
    return changes;
  };

  // Function to download numerology reading as PDF
  const downloadNumerologyPDF = async (reading: NumerologyReading) => {
    try {
      toast({
        title: "Generating PDF",
        description: "Creating your numerology report...",
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Title and header
      pdf.setFontSize(20);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Numerology Analysis Report', 105, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      const date = format(new Date(reading.createdAt), "MMM d, yyyy 'at' h:mm a");
      pdf.text(`Generated on: ${date}`, 105, 45, { align: 'center' });

      // Core numbers section
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Your Core Numbers', 20, 70);

      let yPosition = 90;
      
      // Life Path Number
      pdf.setFontSize(12);
      pdf.setTextColor(147, 51, 234); // Purple
      pdf.text(`Life Path Number: ${reading.lifePathNumber}`, 20, yPosition);
      yPosition += 10;
      
      // Destiny Number
      pdf.setTextColor(59, 130, 246); // Blue
      pdf.text(`Destiny Number: ${reading.destinyNumber}`, 20, yPosition);
      yPosition += 10;
      
      // Soul Urge Number
      pdf.setTextColor(34, 197, 94); // Green
      pdf.text(`Soul Urge Number: ${reading.soulUrgeNumber}`, 20, yPosition);
      yPosition += 10;
      
      // Personality Number
      pdf.setTextColor(249, 115, 22); // Orange
      pdf.text(`Personality Number: ${reading.personalityNumber}`, 20, yPosition);
      yPosition += 20;

      // Interpretation section
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Your Numerology Interpretation', 20, yPosition);
      yPosition += 15;

      // Split interpretation into multiple lines
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      const interpretationLines = pdf.splitTextToSize(reading.interpretation, 170);
      pdf.text(interpretationLines, 20, yPosition);

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Generated by Aurafy - Your Spiritual Wellness Platform', 105, 280, { align: 'center' });

      // Save the PDF
      pdf.save(`numerology-reading-${format(new Date(reading.createdAt), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your numerology report has been saved successfully.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch user's aura readings
  const { data: auraReadings = [], isLoading: isLoadingAura } = useQuery({
    queryKey: ["/api/aura-readings"],
    enabled: !!user,
  });

  // Fetch user's journal entries
  const { data: journalEntries = [], isLoading: isLoadingJournal } = useQuery({
    queryKey: ["/api/journal"],
    enabled: !!user,
  });

  // Fetch user's numerology readings
  const { data: numerologyReadings = [], isLoading: isLoadingNumerology } = useQuery({
    queryKey: ["/api/numerology-readings"],
    enabled: !!user,
  });

  // Fetch user's object analyses
  const { data: objectAnalyses = [], isLoading: isLoadingObjectAnalyses } = useQuery<ObjectAnalysis[]>({
    queryKey: ["/api/object-analyses"],
    enabled: !!user,
  });
  
  // Fetch user's healer bookings with real-time updates
  const { data: userBookings = [], isLoading: isLoadingBookings } = useQuery<HealerBooking[]>({
    queryKey: ["/api/user-bookings"],
    enabled: !!user,
    refetchInterval: 3000, // Auto-refresh every 3 seconds to show healer responses
  });
  
  // Get daily horoscope for the selected sign
  const {
    data: horoscope,
    isLoading: isLoadingHoroscope,
    error: horoscopeError,
    refetch: refetchHoroscope
  } = useQuery<HoroscopeResult>({
    queryKey: ["/api/horoscope", selectedSign],
    queryFn: () => getDailyHoroscope(selectedSign),
    enabled: false, // Don't fetch automatically, wait for user to select sign
  });

  // Get numerology analysis if user has birth date
  const {
    data: numerology,
    isLoading: isLoadingNumerologyAnalysis,
    error: numerologyError
  } = useQuery<NumerologyResult>({
    queryKey: ["/api/numerology", user?.username, user?.birthDate],
    queryFn: () => calculateNumerology(user?.username || "", user?.birthDate || ""),
    enabled: !!(user?.birthDate && user?.username),
  });

  useEffect(() => {
    if (selectedSign) {
      refetchHoroscope();
    }
  }, [selectedSign, refetchHoroscope]);

  const generateStarRating = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-accent fill-accent' : 'text-gray-300'}`}
        />
      ));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-gradient-to-r from-primary-dark to-dark text-white py-8">
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/aura-analysis">
                      <Camera className="h-6 w-6 text-primary" />
                      <span>Scan Aura</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/object-analysis">
                      <span className="text-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </span>
                      <span>Object Analysis</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/daily-horoscope">
                      <Star className="h-6 w-6 text-secondary" />
                      <span>Daily Horoscope</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-primary/50 bg-primary/5">
                    <Link href="/personalized-horoscope">
                      <Target className="h-6 w-6 text-primary" />
                      <span className="text-xs text-center">Personal Horoscope</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/journal">
                      <Book className="h-6 w-6 text-accent" />
                      <span>Journal Entry</span>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-purple-600" />
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
                    <Button 
                      className="w-full bg-primary hover:bg-primary-dark"
                      onClick={() => setActiveBookingsTab("bookings")}
                    >
                      View Bookings ({userBookings.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* User Reading History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  Your Reading History
                </CardTitle>
                <CardDescription>View all your aura and numerology readings</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeBookingsTab} onValueChange={setActiveBookingsTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    
                    <TabsTrigger value="object">Object Analysis</TabsTrigger>
                    <TabsTrigger value="numerology">Numerology</TabsTrigger>
                    <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="aura">
                    {isLoadingAura ? (
                      <div className="flex justify-center items-center h-[150px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : Array.isArray(auraReadings) && auraReadings.length === 0 ? (
                      <div className="text-center h-[150px] flex flex-col justify-center text-gray-500">
                        <Palette className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No aura readings yet</p>
                        <Link to="/aura-analysis">
                          <Button className="mt-2" variant="outline" size="sm">
                            Get Your First Reading
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="relative h-[150px]">
                        {/* Slideshow Navigation */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">
                            {currentAuraIndex + 1} of {(auraReadings as AuraReading[]).length}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentAuraIndex(Math.max(0, currentAuraIndex - 1))}
                              disabled={currentAuraIndex === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentAuraIndex(Math.min((auraReadings as AuraReading[]).length - 1, currentAuraIndex + 1))}
                              disabled={currentAuraIndex === (auraReadings as AuraReading[]).length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Current Reading Display */}
                        {Array.isArray(auraReadings) && auraReadings.length > 0 && (
                          <div className="h-[120px] overflow-hidden border rounded-lg bg-white shadow-sm">
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-5 h-5 rounded-full border border-white shadow-sm"
                                    style={{ backgroundColor: (auraReadings as AuraReading[])[currentAuraIndex]?.dominantColor }}
                                  ></div>
                                  <div>
                                    <h3 className="text-sm font-medium">{(auraReadings as AuraReading[])[currentAuraIndex]?.name || 'Unnamed'} - {(auraReadings as AuraReading[])[currentAuraIndex]?.dominantColor} Aura</h3>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date((auraReadings as AuraReading[])[currentAuraIndex]?.createdAt), "MMM d, yyyy")}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Energy: {(auraReadings as AuraReading[])[currentAuraIndex]?.energyLevel}/10
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <p className="text-xs text-gray-700 line-clamp-3">
                                {((auraReadings as AuraReading[])[currentAuraIndex]?.analysis?.length > 100 
                                  ? (auraReadings as AuraReading[])[currentAuraIndex]?.analysis.substring(0, 100) + "..." 
                                  : (auraReadings as AuraReading[])[currentAuraIndex]?.analysis)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="object">
                    {isLoadingObjectAnalyses ? (
                      <div className="flex justify-center items-center h-[150px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : Array.isArray(objectAnalyses) && objectAnalyses.length === 0 ? (
                      <div className="text-center h-[150px] flex flex-col justify-center text-gray-500">
                        <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No object analyses yet</p>
                        <Link to="/object-analysis">
                          <Button className="mt-2" variant="outline" size="sm">
                            Analyze Your First Object
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[200px] overflow-y-auto">
                        {Array.isArray(objectAnalyses) && objectAnalyses.slice(0, 3).map((analysis: ObjectAnalysis) => (
                          <div key={analysis.id} className="border rounded-lg bg-white shadow-sm p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: analysis.auraColor }}
                                ></div>
                                <div>
                                  <h4 className="text-sm font-medium">{analysis.name || 'Unnamed'}</h4>
                                  <p className="text-xs text-gray-500">{analysis.objectName} - {analysis.auraColor} Aura</p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {format(new Date(analysis.createdAt), 'MMM dd')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {analysis.objectDescription.length > 80 
                                ? analysis.objectDescription.substring(0, 80) + "..." 
                                : analysis.objectDescription}
                            </p>
                          </div>
                        ))}
                        {Array.isArray(objectAnalyses) && objectAnalyses.length > 3 && (
                          <div className="text-center pt-2">
                            <Link to="/object-analysis">
                              <Button variant="outline" size="sm">
                                View All {objectAnalyses.length} Analyses
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="numerology">
                    {isLoadingNumerology ? (
                      <div className="flex justify-center items-center h-[150px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : Array.isArray(numerologyReadings) && numerologyReadings.length === 0 ? (
                      <div className="text-center h-[150px] flex flex-col justify-center text-gray-500">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No numerology readings yet</p>
                        <Link to="/numerology">
                          <Button className="mt-2" variant="outline" size="sm">
                            Get Your First Reading
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="relative h-[150px]">
                        {/* Slideshow Navigation */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">
                            {currentNumerologyIndex + 1} of {(numerologyReadings as NumerologyReading[]).length}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentNumerologyIndex(Math.max(0, currentNumerologyIndex - 1))}
                              disabled={currentNumerologyIndex === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentNumerologyIndex(Math.min((numerologyReadings as NumerologyReading[]).length - 1, currentNumerologyIndex + 1))}
                              disabled={currentNumerologyIndex === (numerologyReadings as NumerologyReading[]).length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Current Reading Display */}
                        {Array.isArray(numerologyReadings) && numerologyReadings.length > 0 && (
                          <div className="h-[120px] overflow-hidden border rounded-lg bg-white shadow-sm">
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="text-sm font-medium">Numerology Analysis</h3>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date((numerologyReadings as NumerologyReading[])[currentNumerologyIndex]?.createdAt), "MMM d, yyyy")}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadNumerologyPDF((numerologyReadings as NumerologyReading[])[currentNumerologyIndex])}
                                  className="flex items-center gap-1 text-xs h-6"
                                >
                                  <Download className="h-3 w-3" />
                                  PDF
                                </Button>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                <div className="text-center p-1 bg-purple-50 rounded text-xs">
                                  <div className="font-bold text-purple-600">{(numerologyReadings as NumerologyReading[])[currentNumerologyIndex]?.lifePathNumber}</div>
                                  <div className="text-purple-500 text-xs">Life</div>
                                </div>
                                <div className="text-center p-1 bg-blue-50 rounded text-xs">
                                  <div className="font-bold text-blue-600">{(numerologyReadings as NumerologyReading[])[currentNumerologyIndex]?.destinyNumber}</div>
                                  <div className="text-blue-500 text-xs">Destiny</div>
                                </div>
                                <div className="text-center p-1 bg-green-50 rounded text-xs">
                                  <div className="font-bold text-green-600">{(numerologyReadings as NumerologyReading[])[currentNumerologyIndex]?.soulUrgeNumber}</div>
                                  <div className="text-green-500 text-xs">Soul</div>
                                </div>
                                <div className="text-center p-1 bg-orange-50 rounded text-xs">
                                  <div className="font-bold text-orange-600">{(numerologyReadings as NumerologyReading[])[currentNumerologyIndex]?.personalityNumber}</div>
                                  <div className="text-orange-500 text-xs">Personality</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="bookings">
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
                        {userBookings.map((booking) => (
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>



            {/* Progress Tracking Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Your Spiritual Progress
                </CardTitle>
                <CardDescription>30-day growth summary and insights</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const progressData = analyzeProgress();
                  
                  if (progressData.totalJournalEntries === 0 && progressData.totalReadings === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Start your spiritual journey to see progress insights</p>
                        <div className="flex gap-2 justify-center mt-4">
                          <Link to="/aura-analysis">
                            <Button variant="outline" size="sm">Take Aura Reading</Button>
                          </Link>
                          <Link to="/journal">
                            <Button variant="outline" size="sm">Start Journaling</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Overview Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{progressData.totalJournalEntries}</div>
                          <div className="text-xs text-green-500">Journal Entries</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{progressData.averageEnergy.toFixed(1)}</div>
                          <div className="text-xs text-purple-500">Avg Energy</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {progressData.energyTrend === 'increasing' ? '↗️' : 
                             progressData.energyTrend === 'decreasing' ? '↘️' : '→'}
                          </div>
                          <div className="text-xs text-orange-500">Energy Trend</div>
                        </div>
                      </div>

                      {/* Growth Indicators */}
                      {progressData.growthIndicators.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Growth Areas
                          </h4>
                          <ul className="space-y-2">
                            {progressData.growthIndicators.map((indicator, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                                <span className="text-green-500 mt-1">✓</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Positive Changes */}
                      {progressData.positiveChanges.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <Smile className="h-4 w-4" />
                            Positive Changes
                          </h4>
                          <ul className="space-y-2">
                            {progressData.positiveChanges.map((change, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                                <span className="text-blue-500 mt-1">🌟</span>
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Common Challenges */}
                      {progressData.challenges.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Areas for Growth
                          </h4>
                          <ul className="space-y-2">
                            {progressData.challenges.map((challenge, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                                <span className="text-amber-500 mt-1">⚡</span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-xs text-amber-600">
                              Consider booking a session with one of our healers for personalized guidance.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Dominant Aura Colors */}
                      {progressData.dominantColors.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Your Dominant Aura Colors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {progressData.dominantColors.map(([color, count], index) => (
                              <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white border border-purple-200 rounded-lg">
                                <div 
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: color.toLowerCase() }}
                                ></div>
                                <span className="text-sm font-medium text-purple-800">{color}</span>
                                <Badge variant="secondary" className="text-xs">{count}x</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
          
          <div>
            {/* Numerology Card */}
            {user?.birthDate && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-purple-600">🔢</span>
                    Your Numerology Profile
                  </CardTitle>
                  <CardDescription>Based on your birth date and name</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingNumerology ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Calculating your numbers...</span>
                    </div>
                  ) : numerology ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {numerology.lifePathNumber}
                          </div>
                          <div className="text-sm font-medium text-purple-800">Life Path Number</div>
                          <div className="text-xs text-purple-600 mt-1">Your life's journey</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {numerology.personalityNumber}
                          </div>
                          <div className="text-sm font-medium text-blue-800">Personality Number</div>
                          <div className="text-xs text-blue-600 mt-1">How others see you</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {numerology.destinyNumber}
                          </div>
                          <div className="text-sm font-medium text-green-800">Destiny</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600 mb-1">
                            {numerology.soulUrgeNumber}
                          </div>
                          <div className="text-sm font-medium text-orange-800">Soul Urge</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-violet-600 mb-1">
                            {numerology.soulChakraNumber}
                          </div>
                          <div className="text-sm font-medium text-violet-800">Dominant Soul Chakra</div>
                          <div className="text-xs text-violet-600 mt-1"> maximum challenges</div>
                        </div>
                      </div>
                      
                      {numerology?.colorAssociations && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Your Energy Colors</h4>
                          <div className="flex gap-2 flex-wrap">
                            {numerology.colorAssociations.lifePathColor && (
                              <div className="flex items-center gap-1 text-xs">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: numerology.colorAssociations.lifePathColor.toLowerCase() }}
                                ></div>
                                <span>{numerology.colorAssociations.lifePathColor} (Life Path)</span>
                              </div>
                            )}
                            {numerology.colorAssociations.personalityColor && (
                              <div className="flex items-center gap-1 text-xs">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: numerology.colorAssociations.personalityColor.toLowerCase() }}
                                ></div>
                                <span>{numerology.colorAssociations.personalityColor} (Personality)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/numerology">
                            View Full Numerology Reading <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                          <p className="text-sm text-indigo-700 font-medium mb-2 text-center">
                            Discover Your True Self
                          </p>
                          <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            <Link href="/numerology">
                              For detailed analysis click here
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : numerologyError ? (
                    <div className="text-center py-8 text-gray-500">
                      Unable to calculate numerology. Please check your birth date.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Spiritual Stats</CardTitle>
                <CardDescription>Your wellness journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Aura Scans</span>
                      <span className="text-xs text-gray-500">3 total</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Journal Streak</span>
                      <span className="text-xs text-gray-500">5 days</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div 
                          key={day}
                          className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${
                            day <= 5 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Energy Trends</span>
                      <span className="text-xs text-gray-500">Last 7 days</span>
                    </div>
                    <div className="h-24 flex items-end gap-2">
                      {[65, 70, 50, 80, 75, 90, 85].map((value, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-t" 
                          style={{ height: `${value}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/journal">
                    <Book className="mr-2 h-4 w-4" /> Journal Today
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled healing sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Tomorrow, 3:00 PM</div>
                    <div className="font-medium">Chakra Balancing</div>
                    <div className="text-sm">with Healer Maya</div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Friday, 11:00 AM</div>
                    <div className="font-medium">Aura Cleansing</div>
                    <div className="text-sm">with Healer James</div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href="/book-session">
                      <Calendar className="mr-2 h-4 w-4" /> Book New Session
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
