import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import JournalForm from "@/components/forms/journal-form";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  BarChart, 
  Star,
  Sparkles,
  Book,
  Heart,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { usePremium } from "@/hooks/use-premium";

// Type for journal entry
interface JournalEntry {
  id: number;
  date: string;
  energyLevel: number;
  reflections: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
}

// Type for journal stats
interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageEnergy: number;
}

// Type for day with entry info
interface DayWithEntry {
  date: Date;
  label: string;
  hasEntry: boolean;
  energyLevel?: number;
}

export default function Journal() {
  const { user } = useAuth();
  const { showPremiumModal } = usePremium();
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("new");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodChart, setShowMoodChart] = useState(false);
  
  // Mock journal stats - in a real app this would come from the backend
  const journalStats: JournalStats = {
    totalEntries: 28,
    currentStreak: 5,
    longestStreak: 14,
    averageEnergy: 3.8
  };
  
  // Calculate the current week days
  const getCurrentWeekDays = (): DayWithEntry[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Start with Monday
    
    // Mock entry dates - in real app this would come from the backend
    const entryDates = [0, 1, 2, 4]; // Days with entries (0=Mon, 1=Tue, etc)
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      return {
        date,
        label: "MTWTFSS"[i],
        hasEntry: entryDates.includes(i),
        energyLevel: entryDates.includes(i) ? Math.floor(Math.random() * 5) + 1 : undefined
      };
    });
  };
  
  const weekDays = getCurrentWeekDays();
  const currentDayIndex = new Date().getDay() - 1;
  
  // Get motivational message based on streak
  const getStreakMessage = (streak: number): string => {
    if (streak >= 30) return "Amazing dedication! 🏆 30+ day streak!";
    if (streak >= 21) return "You're building a powerful habit! ✨";
    if (streak >= 14) return "Two weeks strong! Keep the momentum!";
    if (streak >= 7) return "Full week streak! You're on fire! 🔥";
    if (streak >= 3) return "Three days in a row! Keep going!";
    return "";
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Helper function to generate energy data for the chart
  const getEnergyData = () => {
    return [
      { day: "Mon", level: 3 },
      { day: "Tue", level: 4 },
      { day: "Wed", level: 2 },
      { day: "Thu", level: 5 },
      { day: "Fri", level: 4 },
      { day: "Sat", level: 3 },
      { day: "Sun", level: 4 }
    ];
  };
  
  // Helper function to get energy bar color based on level
  const getEnergyBarColor = (level: number) => {
    switch (level) {
      case 1: return "bg-red-200";
      case 2: return "bg-orange-200";
      case 3: return "bg-yellow-200";
      case 4: return "bg-green-200";
      case 5: return "bg-green-400";
      default: return "bg-gray-200";
    }
  };
  
  // Helper function to get mood grid cell color
  const getMoodGridCellColor = (dayIndex: number, type: string) => {
    // Generate a deterministic but seemingly random pattern
    const hasEntry = (dayIndex + (type === "energy" ? 2 : type === "gratitude" ? 3 : 1)) % 4 !== 0;
    
    if (!hasEntry) return "bg-gray-100";
    
    const value = ((dayIndex * 3 + (type === "energy" ? 1 : type === "gratitude" ? 2 : 3)) % 5) + 1;
    
    if (value <= 1) return "bg-red-100";
    if (value <= 2) return "bg-amber-200";
    if (value <= 4) return "bg-green-200";
    return "bg-green-400";
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
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-center">Spiritual Growth Journal</h1>
            <p className="text-white/80 max-w-2xl mx-auto text-center">
              Track your spiritual journey, record insights, and monitor your energy shifts with our guided journaling tools.
            </p>
          </div>
        </section>
        
        {/* Journal section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                        <span>Select Date</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        className="rounded-md border"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        <span>Journal Stats</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Entries</span>
                          <span className="font-medium">{journalStats.totalEntries}</span>
                        </div>
                        
                        <div className="flex justify-between items-center group">
                          <span className="text-sm">Current Streak</span>
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">{journalStats.currentStreak} days</span>
                                {journalStats.currentStreak > 0 && (
                                  <Sparkles className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                              
                              {journalStats.currentStreak >= 3 && (
                                <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-amber-50 text-amber-800 text-xs rounded px-2 py-1 border border-amber-200 whitespace-nowrap">
                                  {getStreakMessage(journalStats.currentStreak)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Longest Streak</span>
                          <span className="font-medium">{journalStats.longestStreak} days</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg. Energy Level</span>
                          <span className="font-medium">{journalStats.averageEnergy.toFixed(1)}/5</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Weekly Journal Streak</h4>
                        <div className="flex justify-between gap-1">
                          {weekDays.map((day, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <span className="text-xs text-gray-500 mb-1">{day.label}</span>
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                  day.hasEntry 
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm' 
                                    : i === currentDayIndex 
                                      ? 'bg-amber-100 border border-amber-200 text-amber-600 animate-pulse' 
                                      : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {day.hasEntry ? <Star className="w-4 h-4" /> : day.date.getDate()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <BarChart className="h-5 w-5 mr-2 text-primary" />
                          <span>Energy & Mood Trends</span>
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs"
                          onClick={() => setShowMoodChart(!showMoodChart)}
                        >
                          {showMoodChart ? "Show Energy" : "Show Mood Chart"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!showMoodChart ? (
                        <>
                          <div className="h-32 flex items-end gap-2">
                            {getEnergyData().map((entry, i) => (
                              <div key={i} className="relative flex-1 flex items-end">
                                <div 
                                  className={`w-full ${getEnergyBarColor(entry.level)} rounded-t transition-all duration-300 ease-out`} 
                                  style={{ height: `${entry.level * 20}%` }}
                                >
                                  <div className="absolute -top-6 w-full text-center">
                                    <span className="text-[10px] text-gray-500">{entry.level}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            {getEnergyData().map((entry, i) => (
                              <span key={i}>{entry.day}</span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="pt-2">
                            <div className="text-xs text-center mb-1 text-gray-500">Last 14 Days Mood Tracking</div>
                            <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                              <div className="flex items-center mb-3">
                                <div className="w-1/4 text-xs text-gray-500">Energy</div>
                                <div className="flex-1">
                                  <div className="grid grid-cols-14 gap-1">
                                    {Array.from({ length: 14 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`h-4 rounded-sm ${getMoodGridCellColor(i, "energy")}`}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center mb-3">
                                <div className="w-1/4 text-xs text-gray-500">Gratitude</div>
                                <div className="flex-1">
                                  <div className="grid grid-cols-14 gap-1">
                                    {Array.from({ length: 14 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`h-4 rounded-sm ${getMoodGridCellColor(i, "gratitude")}`}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <div className="w-1/4 text-xs text-gray-500">Reflection</div>
                                <div className="flex-1">
                                  <div className="grid grid-cols-14 gap-1">
                                    {Array.from({ length: 14 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`h-4 rounded-sm ${getMoodGridCellColor(i, "reflection")}`}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-500 px-3">
                            <div>14 days ago</div>
                            <div>Today</div>
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-100 mr-1"></div>
                                <span>None</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-amber-200 mr-1"></div>
                                <span>Low</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-200 mr-1"></div>
                                <span>Medium</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 mr-1"></div>
                                <span>High</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Main content */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Spiritual Journal</CardTitle>
                        <div className="text-sm text-gray-500">
                          {formatDate(date)}
                        </div>
                      </div>
                      <CardDescription>Record your spiritual insights and energy shifts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="new">New Entry</TabsTrigger>
                          <TabsTrigger value="previous">Previous</TabsTrigger>
                          <TabsTrigger value="insights">Insights</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="new">
                          <JournalForm />
                        </TabsContent>
                        
                        <TabsContent value="previous">
                          <div className="space-y-6">
                            {/* Controls for viewing entries */}
                            <div className="flex justify-between items-center pb-2 border-b">
                              <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                                Previous
                              </Button>
                              <div className="text-sm">
                                Showing <span className="font-medium">1</span> of <span className="font-medium">{journalStats.totalEntries}</span> entries
                              </div>
                              <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                              </Button>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Yesterday's Entry</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">May 14, 2023</span>
                                  <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                                      </svg>
                                      <span className="sr-only">Share on Facebook</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428.247-.67.636-1.276 1.153-1.772a4.91 4.91 0 011.772-1.153c.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"/>
                                      </svg>
                                      <span className="sr-only">Share on Instagram</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex justify-between">
                                  <p className="text-sm text-gray-500 mb-1">Energy Level: 4/5</p>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    Share as Today's Vibe
                                  </Button>
                                </div>
                                <div className="flex space-x-1">
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-gray-200 rounded-full"></div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-1">Reflections</h4>
                                <p className="text-sm text-gray-600">
                                  Today's meditation was particularly deep. I felt a strong connection to my higher self and received guidance about the career change I've been contemplating. The message was clear: follow my intuition and trust the path that brings me joy.
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Gratitude</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li className="flex items-center">
                                    <Star className="h-3 w-3 text-accent mr-2" />
                                    The beautiful sunrise that greeted me this morning
                                  </li>
                                  <li className="flex items-center">
                                    <Star className="h-3 w-3 text-accent mr-2" />
                                    My supportive friend who listened to my concerns
                                  </li>
                                  <li className="flex items-center">
                                    <Star className="h-3 w-3 text-accent mr-2" />
                                    The delicious healthy meal I prepared for dinner
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Previous Entry</h3>
                                <span className="text-xs text-gray-500">May 13, 2023</span>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Energy Level: 3/5</p>
                                <div className="flex space-x-1">
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-primary rounded-full"></div>
                                  <div className="w-8 h-3 bg-gray-200 rounded-full"></div>
                                  <div className="w-8 h-3 bg-gray-200 rounded-full"></div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-1">Reflections</h4>
                                <p className="text-sm text-gray-600">
                                  Feeling somewhat blocked today. My energy was fluctuating and I found it difficult to center myself during meditation. I noticed recurring thoughts about past relationships and some unresolved emotional patterns.
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Gratitude</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li className="flex items-center">
                                    <Star className="h-3 w-3 text-accent mr-2" />
                                    The gentle rain that watered my garden
                                  </li>
                                  <li className="flex items-center">
                                    <Star className="h-3 w-3 text-accent mr-2" />
                                    The inspirational book I'm currently reading
                                  </li>
                                  <li className="flex items-center">
                                    <Star className="h-3 w-3 text-accent mr-2" />
                                    My comfortable home that provides shelter and peace
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            <Button variant="outline" className="w-full">
                              View All Entries
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="insights">
                          <div className="space-y-6">
                            <Alert className="bg-accent/10 border-accent">
                              <Book className="h-4 w-4 text-accent" />
                              <AlertTitle>Journal Insights</AlertTitle>
                              <AlertDescription>
                                Your insights have been generated based on {journalStats.totalEntries} journal entries.
                                Continue journaling daily to get more personalized insights.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="space-y-4">
                              {/* Energy Patterns */}
                              <div className="border rounded-md p-4">
                                <h3 className="text-sm font-medium flex items-center mb-3">
                                  <Activity className="h-4 w-4 mr-2 text-primary" />
                                  Energy Flow Patterns
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  Your energy levels tend to be highest on <span className="font-medium">Thursdays</span> and lowest on <span className="font-medium">Wednesdays</span>. 
                                  Plan your most important spiritual practices for high-energy days.
                                </p>
                                
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <h4 className="text-xs font-medium mb-2">Recommended Actions:</h4>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    <li className="flex items-start">
                                      <div className="rounded-full bg-accent w-1 h-1 mt-1.5 mr-2"></div>
                                      Try meditation in the morning on your low-energy days to boost vitality
                                    </li>
                                    <li className="flex items-start">
                                      <div className="rounded-full bg-accent w-1 h-1 mt-1.5 mr-2"></div>
                                      Schedule deep spiritual work on Thursdays when your energy is at its peak
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              
                              {/* Gratitude Themes */}
                              <div className="border rounded-md p-4">
                                <h3 className="text-sm font-medium flex items-center mb-3">
                                  <Heart className="h-4 w-4 mr-2 text-rose-500" />
                                  Gratitude Themes
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  Your gratitude entries frequently mention <span className="font-medium">nature</span> and <span className="font-medium">relationships</span>. 
                                  These are key sources of spiritual strength for you.
                                </p>
                                
                                <div className="flex mb-3 gap-2">
                                  <div className="bg-rose-100 text-rose-800 text-xs rounded px-2 py-1">nature</div>
                                  <div className="bg-amber-100 text-amber-800 text-xs rounded px-2 py-1">relationships</div>
                                  <div className="bg-emerald-100 text-emerald-800 text-xs rounded px-2 py-1">meditation</div>
                                  <div className="bg-sky-100 text-sky-800 text-xs rounded px-2 py-1">food</div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <h4 className="text-xs font-medium mb-2">Suggested Focus:</h4>
                                  <p className="text-xs text-gray-600">
                                    Consider spending more time in natural settings and deepening your meaningful connections.
                                    These appear to have the most positive impact on your spiritual wellbeing.
                                  </p>
                                </div>
                              </div>
                              
                              {/* Aura Integration - Premium Feature */}
                              <div className="border rounded-md p-4 bg-gradient-to-r from-violet-50 to-indigo-50">
                                <div className="flex justify-between items-start mb-3">
                                  <h3 className="text-sm font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-violet-500"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/><path d="M12 22v-4"/></svg>
                                    Aura-Journal Connection
                                    <Badge variant="secondary" className="ml-2 bg-primary/10 hover:bg-primary/20">
                                      Premium
                                    </Badge>
                                  </h3>
                                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => showPremiumModal("general")}>
                                    Unlock
                                  </Button>
                                </div>
                                
                                <div className="filter blur-[2px] pointer-events-none">
                                  <p className="text-sm text-gray-600 mb-3">
                                    Your journal entries reveal strong correlations with your aura readings. 
                                    On days with high energy, your aura shows more vibrant blues and purples.
                                  </p>
                                  
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-indigo-100 text-indigo-800 text-xs rounded p-2 flex items-center justify-center">
                                      <div className="w-3 h-3 rounded-full bg-indigo-400 mr-1.5"></div>
                                      Indigo strength: 78%
                                    </div>
                                    <div className="bg-violet-100 text-violet-800 text-xs rounded p-2 flex items-center justify-center">
                                      <div className="w-3 h-3 rounded-full bg-violet-400 mr-1.5"></div>
                                      Purple stability: 65%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border rounded-lg bg-secondary/5">
                              <div className="flex items-start">
                                <Sparkles className="h-5 w-5 text-secondary mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <h3 className="font-medium mb-1">Monthly Progress Summary</h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                    You've made significant progress in your spiritual journey this month. Your energy levels have been more consistent, and your gratitude practice is strengthening your resilience.
                                  </p>
                                  
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Consistency</span>
                                    <span className="text-xs font-medium">75%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                    <div className="bg-secondary h-1.5 rounded-full" style={{ width: "75%" }}></div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Energy Growth</span>
                                    <span className="text-xs font-medium">62%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                    <div className="bg-secondary h-1.5 rounded-full" style={{ width: "62%" }}></div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Mindfulness</span>
                                    <span className="text-xs font-medium">89%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                    <div className="bg-secondary h-1.5 rounded-full" style={{ width: "89%" }}></div>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    In the past month, you've mentioned "intuitive guidance" in 78% of your entries. Your intuitive abilities appear to be strengthening - consider developing this gift further.
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border rounded-lg bg-accent/5">
                              <div className="flex items-start">
                                <Sparkles className="h-5 w-5 text-accent mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <h3 className="font-medium mb-1">Gratitude Focus</h3>
                                  <p className="text-sm text-gray-600">
                                    Your gratitude practice shows a strong appreciation for nature. Consider spending more time outdoors to enhance your spiritual connection and overall wellbeing.
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-start">
                                <Book className="h-5 w-5 text-primary-dark mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <h3 className="font-medium mb-1">Recommended Practice</h3>
                                  <p className="text-sm text-gray-600">
                                    Based on your journal entries, you might benefit from a chakra balancing meditation focusing on the heart and throat chakras. These energy centers appear to be active in your spiritual journey.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8 text-center">Benefits of Spiritual Journaling</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Self-Awareness</h3>
                <p className="text-gray-600">
                  Regular journaling helps you identify patterns in your thoughts, emotions, and energy levels, leading to greater self-understanding and spiritual growth.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Manifestation</h3>
                <p className="text-gray-600">
                  Writing down your spiritual goals, intentions, and insights helps crystallize them into reality by aligning your conscious and subconscious mind.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Spiritual Connection</h3>
                <p className="text-gray-600">
                  Journaling creates a sacred space for dialogue with your higher self, spirit guides, or divine wisdom, strengthening your spiritual connection.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
