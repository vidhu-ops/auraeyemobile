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
  const [showAllEntries, setShowAllEntries] = useState(false);
  
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
      
      <div className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Spiritual Journal</h1>
          <p className="text-lg text-gray-700 mb-8">
            Track your spiritual journey, energy levels, and insights with your daily journal.
          </p>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                    <span>Select Date</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                          
                          // Find existing entries for this date (in a real app, this would query the DB)
                          const hasEntryForDate = weekDays.some(day => 
                            day.hasEntry && 
                            day.date.toDateString() === newDate.toDateString()
                          );
                          
                          // If an entry exists for this date, show it
                          if (hasEntryForDate) {
                            setActiveTab("previous");
                          } else if (newDate.toDateString() === new Date().toDateString()) {
                            // If it's today and no entry, go to new entry form
                            setActiveTab("new");
                          }
                        }
                      }}
                      modifiers={{
                        // Highlight days with entries (would be dynamic in a real app)
                        hasEntry: weekDays.filter(day => day.hasEntry).map(day => day.date)
                      }}
                      modifiersClassNames={{
                        hasEntry: "bg-primary/20 font-medium text-primary"
                      }}
                      className="rounded-md border"
                    />
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary/20 mr-1.5"></div>
                        <span>Has Journal Entry</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => {
                          setDate(new Date());
                          setActiveTab("new");
                        }}
                      >
                        Add Today's Entry
                      </Button>
                    </div>
                  </div>
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
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-primary/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-primary">{journalStats.totalEntries}</div>
                        <div className="text-xs text-gray-500 mt-1">Total Entries</div>
                      </div>
                      
                      <div className="relative group bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 text-center border border-amber-100">
                        <div className="text-2xl font-bold text-amber-500 flex items-center justify-center">
                          {journalStats.currentStreak}
                          {journalStats.currentStreak > 0 && (
                            <Sparkles className="h-4 w-4 ml-1" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Day Streak</div>
                        
                        {journalStats.currentStreak >= 3 && (
                          <div className="absolute -bottom-10 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-amber-50 text-amber-800 text-xs rounded-md px-2 py-1 border border-amber-200 whitespace-nowrap z-10">
                            {getStreakMessage(journalStats.currentStreak)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-secondary">{journalStats.longestStreak}</div>
                        <div className="text-xs text-gray-500 mt-1">Longest Streak</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-500">{journalStats.averageEnergy.toFixed(1)}</div>
                        <div className="text-xs text-gray-500 mt-1">Avg. Energy (of 5)</div>
                      </div>
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2 h-7 text-xs"
                              onClick={() => setShowAllEntries(!showAllEntries)}
                            >
                              {showAllEntries ? "Hide All" : "View All"}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                          </Button>
                        </div>
                        
                        {showAllEntries ? (
                          <div className="space-y-4">
                            <h3 className="text-base font-medium mb-3">All Journal Entries</h3>
                            
                            {/* Generate mock entries for the demo - in a real app, this would come from the backend */}
                            {Array.from({ length: 5 }).map((_, index) => {
                              const entryDate = new Date();
                              entryDate.setDate(entryDate.getDate() - index);
                              
                              return (
                                <div key={index} className="border rounded-lg p-3 hover:border-primary/30 transition-colors cursor-pointer">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium">
                                      {index === 0 ? "Today's Entry" : 
                                       index === 1 ? "Yesterday's Entry" : 
                                       new Intl.DateTimeFormat('en-US', { 
                                         weekday: 'long'
                                       }).format(entryDate)
                                      }
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {entryDate.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center mb-2">
                                    <span className="text-xs text-gray-500 mr-2">Energy:</span>
                                    <div className="flex space-x-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <div 
                                          key={i} 
                                          className={`w-5 h-2 ${i < 5 - index % 3 ? 'bg-primary' : 'bg-gray-200'} rounded-full`}
                                        ></div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs text-gray-600 truncate">
                                    {index === 0 
                                      ? "Today's meditation was particularly deep. I felt a strong connection to my higher self and received guidance."
                                      : index === 1 
                                        ? "I practiced gratitude journaling this morning and felt much more positive throughout the day."
                                        : "Reflecting on my spiritual journey and noticing the patterns that emerge when I stay consistent."
                                    }
                                  </p>
                                </div>
                              );
                            })}
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs mt-4"
                              onClick={() => setShowAllEntries(false)}
                            >
                              Hide All Entries
                            </Button>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="insights">
                      <div className="space-y-6">
                        <Alert className="bg-accent/10 border-accent">
                          <Book className="h-4 w-4 text-accent" />
                          <AlertTitle>Journal Insights</AlertTitle>
                          <AlertDescription>
                            Your insights have been generated based on your last 3 days of journal entries.
                            {journalStats.totalEntries < 3 ? (
                              <span className="block mt-1 text-xs text-amber-600">
                                You need at least 3 journal entries for more accurate insights. 
                                You currently have {journalStats.totalEntries} entries.
                              </span>
                            ) : (
                              <span className="block mt-1 text-xs text-emerald-600">
                                Continue journaling daily to refine these insights and discover deeper patterns.
                              </span>
                            )}
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
                          
                          {/* Aura Integration - Advanced Feature */}
                          <div className="border rounded-md p-4 bg-gradient-to-r from-violet-50 to-indigo-50">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-sm font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-violet-500"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/><path d="M12 22v-4"/></svg>
                                Aura-Journal Connection
                                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                  Advanced Feature
                                </Badge>
                              </h3>
                            </div>
                            
                            <div className="">
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}