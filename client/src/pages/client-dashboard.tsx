import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
  Smile
} from "lucide-react";
import { getDailyHoroscope, HoroscopeResult, calculateNumerology, NumerologyResult } from "@/lib/openai";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

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
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [selectedSign, setSelectedSign] = useState("aries");

  const { data: auraReadings, isLoading: isLoadingAura } = useQuery({
    queryKey: ["/api/aura-readings"],
    enabled: !!user,
  });

  const { data: journalEntries, isLoading: isLoadingJournal } = useQuery({
    queryKey: ["/api/journal"],
    enabled: !!user,
  });

  const { data: numerologyReadings, isLoading: isLoadingNumerology } = useQuery({
    queryKey: ["/api/numerology-readings"],
    enabled: !!user,
  });

  const { data: horoscope, isLoading: isLoadingHoroscope, error: horoscopeError } = useQuery({
    queryKey: ["/api/horoscope", selectedSign],
    enabled: !!user,
  });

  const { data: numerology, isLoading: isLoadingNumerologyCalc, error: numerologyError } = useQuery({
    queryKey: ["/api/numerology", user?.username, "1996-08-23"],
    enabled: !!user?.username,
  });

  // Helper function to generate star ratings
  const generateStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Progress analysis function
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

    const averageEnergy = recentJournalEntries.length > 0 ? 
      recentJournalEntries.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / recentJournalEntries.length : 0;

    // Energy trend analysis
    const firstHalfEntries = recentJournalEntries.slice(0, Math.floor(recentJournalEntries.length / 2));
    const secondHalfEntries = recentJournalEntries.slice(Math.floor(recentJournalEntries.length / 2));
    
    const firstHalfAvg = firstHalfEntries.length > 0 ? 
      firstHalfEntries.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / firstHalfEntries.length : 0;
    const secondHalfAvg = secondHalfEntries.length > 0 ? 
      secondHalfEntries.reduce((sum: number, entry: JournalEntry) => sum + entry.energyLevel, 0) / secondHalfEntries.length : 0;
    
    let energyTrend = 'stable';
    if (secondHalfAvg > firstHalfAvg + 0.5) energyTrend = 'increasing';
    else if (secondHalfAvg < firstHalfAvg - 0.5) energyTrend = 'decreasing';

    // Growth indicators
    const growthIndicators = [];
    if (recentAuraReadings.length >= 2) growthIndicators.push('Regular aura monitoring shows commitment to self-awareness');
    if (weeklyJournalEntries.length >= 5) growthIndicators.push('Consistent journaling practice developing strong introspection');
    if (averageEnergy >= 7) growthIndicators.push('Maintaining high energy levels indicates good spiritual balance');
    if (energyTrend === 'increasing') growthIndicators.push('Energy levels are trending upward, showing positive progress');

    // Positive changes
    const positiveChanges = [];
    if (recentAuraReadings.length > 0) positiveChanges.push('Active engagement with spiritual practices');
    if (averageEnergy > 6) positiveChanges.push('Above-average energy maintenance');
    if (recentJournalEntries.length > 10) positiveChanges.push('Strong commitment to personal reflection');

    // Challenges
    const challenges = [];
    if (averageEnergy < 5) challenges.push('Energy levels could benefit from focused healing practices');
    if (weeklyJournalEntries.length < 3) challenges.push('More consistent journaling could enhance self-awareness');
    if (energyTrend === 'decreasing') challenges.push('Recent energy decline suggests need for renewal practices');

    // Dominant colors
    const colorCounts: { [key: string]: number } = {};
    recentAuraReadings.forEach((reading: AuraReading) => {
      colorCounts[reading.dominantColor] = (colorCounts[reading.dominantColor] || 0) + 1;
    });
    const dominantColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return {
      totalReadings: Array.isArray(auraReadings) ? auraReadings.length : 0,
      totalJournalEntries: Array.isArray(journalEntries) ? journalEntries.length : 0,
      averageEnergy,
      energyTrend,
      growthIndicators,
      positiveChanges,
      challenges,
      dominantColors
    };
  };

  const downloadNumerologyPDF = async (reading: NumerologyReading) => {
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Numerology Reading Report', 20, 30);
      
      // Personal Info
      pdf.setFontSize(14);
      pdf.text(`Name: ${reading.name}`, 20, 50);
      pdf.text(`Birth Date: ${format(new Date(reading.birthDate), "MMMM d, yyyy")}`, 20, 65);
      pdf.text(`Reading Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, 20, 80);
      
      // Core Numbers
      pdf.setFontSize(16);
      pdf.text('Core Numbers:', 20, 100);
      
      pdf.setFontSize(12);
      pdf.text(`Life Path Number: ${reading.lifePathNumber}`, 30, 115);
      pdf.text(`Destiny Number: ${reading.destinyNumber}`, 30, 130);
      pdf.text(`Soul Urge Number: ${reading.soulUrgeNumber}`, 30, 145);
      pdf.text(`Personality Number: ${reading.personalityNumber}`, 30, 160);
      
      // Interpretation
      pdf.setFontSize(14);
      pdf.text('Interpretation:', 20, 180);
      
      pdf.setFontSize(10);
      const splitText = pdf.splitTextToSize(reading.interpretation, 170);
      pdf.text(splitText, 20, 195);
      
      pdf.save(`numerology-reading-${reading.name}-${format(new Date(reading.createdAt), "yyyy-MM-dd")}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your numerology reading has been saved as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingAuth) {
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
          <h1 className="text-3xl font-heading font-bold">Welcome, {user?.username}</h1>
          <p className="opacity-80">Your spiritual wellness dashboard</p>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access your most used spiritual tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                
                <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Link href="/journal">
                    <Book className="h-6 w-6 text-accent" />
                    <span>Journal Entry</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cosmic Insights */}
          <Card>
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
                            weekday: "long", 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {isLoadingHoroscope ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading cosmic insights...</span>
                      </div>
                    ) : horoscope ? (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">{horoscope.content || horoscope.prediction}</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Love</div>
                            <div className="flex justify-center">
                              {generateStarRating(3)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Career</div>
                            <div className="flex justify-center">
                              {generateStarRating(3)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Health</div>
                            <div className="flex justify-center">
                              {generateStarRating(3)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : horoscopeError ? (
                      <div className="text-center py-8 text-red-500">
                        <p>Unable to load horoscope. Please try again later.</p>
                      </div>
                    ) : null}
                  </div>
                </TabsContent>
                
                <TabsContent value="energy">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border">
                    <h4 className="font-medium mb-3">Today's Energy Forecast</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Spiritual Energy</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                          <span className="text-sm font-medium">High</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Emotional Balance</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                          <span className="text-sm font-medium">Good</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mental Clarity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                          <span className="text-sm font-medium">Excellent</span>
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
              <Tabs defaultValue="aura" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="aura">Aura Readings</TabsTrigger>
                  <TabsTrigger value="numerology">Numerology</TabsTrigger>
                </TabsList>
                
                <TabsContent value="aura">
                  {isLoadingAura ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : Array.isArray(auraReadings) && auraReadings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No aura readings yet</p>
                      <Link to="/aura-analysis">
                        <Button className="mt-2" variant="outline">
                          Get Your First Reading
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(auraReadings) && auraReadings.map((reading: AuraReading) => (
                        <div key={reading.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: reading.dominantColor }}
                                ></div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{reading.dominantColor} Aura Reading</h3>
                                  <p className="text-sm text-gray-500">
                                    {format(new Date(reading.createdAt), "EEEE, MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white">
                                Energy: {reading.energyLevel}/10
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Dominant Color:</span>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: reading.dominantColor }}
                                  ></div>
                                  <span className="text-sm capitalize">{reading.dominantColor}</span>
                                </div>
                              </div>
                              
                              {reading.secondaryColor && (
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-700">Secondary Color:</span>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full border"
                                      style={{ backgroundColor: reading.secondaryColor }}
                                    ></div>
                                    <span className="text-sm capitalize">{reading.secondaryColor}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="pt-3 border-t">
                                <p className="text-sm text-gray-600 leading-relaxed">{reading.analysis}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="numerology">
                  {isLoadingNumerology ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : Array.isArray(numerologyReadings) && numerologyReadings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No numerology readings yet</p>
                      <Link to="/numerology">
                        <Button className="mt-2" variant="outline">
                          Get Your First Reading
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(numerologyReadings) && numerologyReadings.map((reading: NumerologyReading) => (
                        <div key={reading.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">Numerology Reading for {reading.name}</h3>
                                <p className="text-sm text-gray-500">
                                  Born: {format(new Date(reading.birthDate), "MMMM d, yyyy")} • 
                                  Created: {format(new Date(reading.createdAt), "MMM d, yyyy")}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadNumerologyPDF(reading)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{reading.lifePathNumber}</div>
                                <div className="text-xs text-purple-500">Life Path</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{reading.destinyNumber}</div>
                                <div className="text-xs text-blue-500">Destiny</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{reading.soulUrgeNumber}</div>
                                <div className="text-xs text-green-500">Soul Urge</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{reading.personalityNumber}</div>
                                <div className="text-xs text-orange-500">Personality</div>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t">
                              <p className="text-sm text-gray-600 leading-relaxed">{reading.interpretation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}