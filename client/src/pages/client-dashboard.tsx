import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Sparkles,
  Calendar,
  ArrowRight,
  Hash,
  Download,
  Loader2,
  TrendingUp,
  Award,
  Smile,
  AlertTriangle,
  Target,
  Palette
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import jsPDF from 'jspdf';

interface AuraReading {
  id: number;
  userId: number;
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

export default function ClientDashboard() {
  const { user } = useAuth();
  const [selectedSign, setSelectedSign] = useState("aries");

  // Fetch user data
  const { data: auraReadings, isLoading: isLoadingAura } = useQuery({
    queryKey: ["/api/aura-readings"],
  });

  const { data: journalEntries, isLoading: isLoadingJournal } = useQuery({
    queryKey: ["/api/journal-entries"],
  });

  const { data: numerologyReadings, isLoading: isLoadingNumerology } = useQuery({
    queryKey: ["/api/numerology-readings"],
  });

  const { data: horoscope, isLoading: isLoadingHoroscope } = useQuery({
    queryKey: ["/api/horoscope", selectedSign],
  });

  const { data: numerology, isLoading: isLoadingNumerologyAnalysis } = useQuery({
    queryKey: ["/api/numerology-analysis"],
    enabled: !!user?.birthDate,
  });

  // Helper functions
  const generateStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const analyzeProgress = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAuraReadings = Array.isArray(auraReadings) ? 
      auraReadings.filter((reading: AuraReading) => new Date(reading.createdAt) >= thirtyDaysAgo) : [];
    
    const recentJournalEntries = Array.isArray(journalEntries) ? 
      journalEntries.filter((entry: JournalEntry) => new Date(entry.createdAt) >= thirtyDaysAgo) : [];
    
    const weeklyJournalEntries = Array.isArray(journalEntries) ? 
      journalEntries.filter((entry: JournalEntry) => new Date(entry.createdAt) >= sevenDaysAgo) : [];
    
    const averageEnergy = weeklyJournalEntries.length > 0 ? 
      recentJournalEntries.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / recentJournalEntries.length : 0;

    // Analyze growth indicators
    const growthIndicators = [];
    if (recentJournalEntries.length >= 7) {
      growthIndicators.push("Consistent journaling practice established");
    }
    if (recentAuraReadings.length >= 3) {
      growthIndicators.push("Regular aura monitoring for self-awareness");
    }
    if (averageEnergy >= 7) {
      growthIndicators.push("Maintaining high energy levels");
    }

    // Analyze positive changes
    const positiveChanges = [];
    if (weeklyJournalEntries.length > 0) {
      const recentEnergy = weeklyJournalEntries.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / weeklyJournalEntries.length;
      if (recentEnergy > 6) {
        positiveChanges.push("Energy levels showing positive trend");
      }
    }
    if (recentAuraReadings.length > 0) {
      positiveChanges.push("Active engagement with spiritual practices");
    }

    // Identify challenges
    const challenges = [];
    if (averageEnergy < 5) {
      challenges.push("Energy levels could benefit from attention");
    }
    if (recentJournalEntries.length < 3) {
      challenges.push("Consider more frequent reflection and journaling");
    }

    // Dominant colors analysis
    const colorCounts: { [key: string]: number } = {};
    recentAuraReadings.forEach((reading: AuraReading) => {
      if (reading.dominantColor) {
        colorCounts[reading.dominantColor] = (colorCounts[reading.dominantColor] || 0) + 1;
      }
    });
    
    const dominantColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    // Energy trend
    let energyTrend = 'stable';
    if (weeklyJournalEntries.length >= 2) {
      const firstHalf = weeklyJournalEntries.slice(0, Math.floor(weeklyJournalEntries.length / 2));
      const secondHalf = weeklyJournalEntries.slice(Math.floor(weeklyJournalEntries.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg + 0.5) {
        energyTrend = 'increasing';
      } else if (secondHalfAvg < firstHalfAvg - 0.5) {
        energyTrend = 'decreasing';
      }
    }

    return {
      totalReadings: recentAuraReadings.length,
      totalJournalEntries: recentJournalEntries.length,
      averageEnergy,
      energyTrend,
      growthIndicators,
      positiveChanges,
      challenges,
      dominantColors
    };
  };

  const downloadAuraPDF = async (reading: AuraReading) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Aura Reading Report', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(reading.createdAt).toLocaleDateString()}`, 20, 50);
    
    // Dominant Color
    doc.setFontSize(14);
    doc.text(`Dominant Aura Color: ${reading.dominantColor}`, 20, 70);
    
    if (reading.secondaryColor) {
      doc.text(`Secondary Color: ${reading.secondaryColor}`, 20, 85);
    }
    
    // Energy Level
    doc.text(`Energy Level: ${reading.energyLevel}/10`, 20, 100);
    
    // Analysis
    doc.setFontSize(12);
    doc.text('Analysis:', 20, 120);
    
    const splitAnalysis = doc.splitTextToSize(reading.analysis, 170);
    doc.text(splitAnalysis, 20, 135);
    
    doc.save(`aura-reading-${new Date(reading.createdAt).toISOString().split('T')[0]}.pdf`);
  };

  const downloadNumerologyPDF = async (reading: NumerologyReading) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Numerology Report', 20, 30);
    
    // Personal Info
    doc.setFontSize(12);
    doc.text(`Name: ${reading.name}`, 20, 50);
    doc.text(`Birth Date: ${new Date(reading.birthDate).toLocaleDateString()}`, 20, 65);
    doc.text(`Report Date: ${new Date(reading.createdAt).toLocaleDateString()}`, 20, 80);
    
    // Core Numbers
    doc.setFontSize(14);
    doc.text('Core Numbers:', 20, 100);
    
    doc.setFontSize(12);
    doc.text(`Life Path Number: ${reading.lifePathNumber}`, 30, 115);
    doc.text(`Destiny Number: ${reading.destinyNumber}`, 30, 130);
    doc.text(`Soul Urge Number: ${reading.soulUrgeNumber}`, 30, 145);
    doc.text(`Personality Number: ${reading.personalityNumber}`, 30, 160);
    
    // Interpretation
    doc.setFontSize(14);
    doc.text('Interpretation:', 20, 180);
    
    const splitInterpretation = doc.splitTextToSize(reading.interpretation, 170);
    doc.text(splitInterpretation, 20, 195);
    
    doc.save(`numerology-reading-${reading.name.replace(/\s+/g, '-')}-${new Date(reading.createdAt).toISOString().split('T')[0]}.pdf`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {user.firstName || user.username}
          </h1>
          <p className="opacity-80">Your spiritual wellness dashboard</p>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Quick Actions - Full Width */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used spiritual tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button asChild className="h-20 flex-col gap-2">
                <Link to="/aura-analysis">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-sm">Aura Reading</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/numerology">
                  <Hash className="h-6 w-6" />
                  <span className="text-sm">Numerology</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/journal">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Journal Entry</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/healers">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Book Healer</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking - Full Width */}
        <Card className="mb-8">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{progressData.totalReadings}</div>
                      <div className="text-xs text-blue-500">Aura Readings</div>
                    </div>
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

        {/* Cosmic Insights - Full Width */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Cosmic Insights</CardTitle>
            <CardDescription>Today's astrological guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="horoscope" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="horoscope">Daily Horoscope</TabsTrigger>
                <TabsTrigger value="energy">Energy Forecast</TabsTrigger>
              </TabsList>
              
              <TabsContent value="horoscope">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      <select 
                        className="border rounded-md px-2 py-1 text-sm" 
                        value={selectedSign}
                        onChange={(e) => setSelectedSign(e.target.value)}
                      >
                        <option value="aries">Aries</option>
                        <option value="taurus">Taurus</option>
                        <option value="gemini">Gemini</option>
                        <option value="cancer">Cancer</option>
                        <option value="leo">Leo</option>
                        <option value="virgo">Virgo</option>
                        <option value="libra">Libra</option>
                        <option value="scorpio">Scorpio</option>
                        <option value="sagittarius">Sagittarius</option>
                        <option value="capricorn">Capricorn</option>
                        <option value="aquarius">Aquarius</option>
                        <option value="pisces">Pisces</option>
                      </select>
                      
                      <div className="text-sm text-gray-500 ml-4">
                        <Calendar className="h-4 w-4 inline-block mr-1" /> 
                        {new Date().toLocaleDateString("en-US", { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {isLoadingHoroscope ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading your cosmic insights...</span>
                    </div>
                  ) : horoscope ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{
                          selectedSign === 'aries' ? '♈' :
                          selectedSign === 'taurus' ? '♉' :
                          selectedSign === 'gemini' ? '♊' :
                          selectedSign === 'cancer' ? '♋' :
                          selectedSign === 'leo' ? '♌' :
                          selectedSign === 'virgo' ? '♍' :
                          selectedSign === 'libra' ? '♎' :
                          selectedSign === 'scorpio' ? '♏' :
                          selectedSign === 'sagittarius' ? '♐' :
                          selectedSign === 'capricorn' ? '♑' :
                          selectedSign === 'aquarius' ? '♒' : '♓'
                        }</span>
                        <h3 className="text-xl font-semibold capitalize">{selectedSign}</h3>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-l-4 border-purple-400">
                        <p className="text-gray-800 leading-relaxed">
                          {horoscope.content || horoscope.prediction || "Your cosmic energies are aligning beautifully today."}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="text-red-600 font-medium">Love</div>
                          <div className="flex justify-center mt-1">
                            {generateStarRating(horoscope.love || 4)}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-green-600 font-medium">Career</div>
                          <div className="flex justify-center mt-1">
                            {generateStarRating(horoscope.career || 3)}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-blue-600 font-medium">Health</div>
                          <div className="flex justify-center mt-1">
                            {generateStarRating(horoscope.health || 4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Unable to load horoscope. Please try again later.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="energy">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border">
                  <h3 className="text-lg font-medium mb-4">Today's Energy Forecast</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Morning Energy</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Afternoon Energy</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Evening Energy</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-end">
            <Button asChild variant="ghost">
              <Link href="/daily-horoscope">
                View Full Cosmic Report <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Numerology Card - Full Width */}
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
              {isLoadingNumerologyAnalysis ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Calculating your numbers...</span>
                </div>
              ) : numerology ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {numerology.destinyNumber}
                      </div>
                      <div className="text-sm font-medium text-green-800">Destiny Number</div>
                      <div className="text-xs text-green-600 mt-1">Your life's purpose</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {numerology.soulUrgeNumber}
                      </div>
                      <div className="text-sm font-medium text-orange-800">Soul Urge Number</div>
                      <div className="text-xs text-orange-600 mt-1">Your inner desires</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-400">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {numerology.interpretation.substring(0, 200)}...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Please update your birth date in settings to see your numerology profile.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild variant="ghost">
                <Link href="/numerology">
                  Complete Numerology Reading <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Reading History - Moved to End */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Your Reading History
            </CardTitle>
            <CardDescription>View all your aura and numerology readings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="aura" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="aura">Aura Readings</TabsTrigger>
                <TabsTrigger value="numerology">Numerology</TabsTrigger>
              </TabsList>
              
              <TabsContent value="aura">
                {isLoadingAura ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading aura readings...</span>
                  </div>
                ) : Array.isArray(auraReadings) && auraReadings.length > 0 ? (
                  <div className="space-y-4">
                    {Array.isArray(auraReadings) && auraReadings.map((reading: AuraReading) => (
                      <div key={reading.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: reading.dominantColor?.toLowerCase() || '#8B5CF6' }}
                            ></div>
                            <span className="font-medium text-gray-900 capitalize">
                              {reading.dominantColor || 'Unknown'} Aura
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(reading.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          Energy Level: <span className="font-medium">{reading.energyLevel}/10</span>
                        </div>
                        
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {reading.analysis}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {reading.secondaryColor && (
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: reading.secondaryColor.toLowerCase() }}
                                ></div>
                                <span className="text-xs text-gray-500 capitalize">
                                  {reading.secondaryColor}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAuraPDF(reading)}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="mb-4">No aura readings yet</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/aura-analysis">Take Your First Reading</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="numerology">
                {isLoadingNumerology ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading numerology readings...</span>
                  </div>
                ) : Array.isArray(numerologyReadings) && numerologyReadings.length > 0 ? (
                  <div className="space-y-4">
                    {Array.isArray(numerologyReadings) && numerologyReadings.map((reading: NumerologyReading) => (
                      <div key={reading.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{reading.name}</h4>
                            <p className="text-sm text-gray-500">
                              Born: {new Date(reading.birthDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(reading.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-lg font-bold text-purple-600">{reading.lifePathNumber}</div>
                            <div className="text-xs text-purple-500">Life Path</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">{reading.destinyNumber}</div>
                            <div className="text-xs text-blue-500">Destiny</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">{reading.soulUrgeNumber}</div>
                            <div className="text-xs text-green-500">Soul Urge</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="text-lg font-bold text-orange-600">{reading.personalityNumber}</div>
                            <div className="text-xs text-orange-500">Personality</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                          {reading.interpretation}
                        </p>
                        
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadNumerologyPDF(reading)}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Hash className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="mb-4">No numerology readings yet</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/numerology">Get Your Numbers</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Healer Sessions */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Recent Healer Sessions
              </h4>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-l-4 border-green-400">
                <p className="text-sm text-gray-600 mb-3">
                  Connect with experienced healers for personalized guidance on your spiritual journey.
                </p>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <Link to="/healers">
                    <Calendar className="mr-2 h-4 w-4" /> Book New Session
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}