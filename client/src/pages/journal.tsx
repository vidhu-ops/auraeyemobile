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
  Book
} from "lucide-react";

export default function Journal() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("new");
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                          <span className="font-medium">28</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current Streak</span>
                          <span className="font-medium">5 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Longest Streak</span>
                          <span className="font-medium">14 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg. Energy Level</span>
                          <span className="font-medium">3.8/5</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Weekly Activity</h4>
                        <div className="flex justify-between gap-1">
                          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <span className="text-xs text-gray-500 mb-1">{day}</span>
                              <div 
                                className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${
                                  i < 5 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {i < 5 ? <Star className="w-3 h-3" /> : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-primary" />
                        <span>Energy Trends</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 flex items-end gap-2">
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
                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Yesterday's Entry</h3>
                                <span className="text-xs text-gray-500">May 14, 2023</span>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Energy Level: 4/5</p>
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
                            <div className="p-4 border rounded-lg bg-primary/5">
                              <div className="flex items-start">
                                <Sparkles className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <h3 className="font-medium mb-1">Energy Pattern Observed</h3>
                                  <p className="text-sm text-gray-600">
                                    Your energy levels have been consistently higher in the mornings, especially after meditation. Consider scheduling important spiritual practices earlier in the day.
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border rounded-lg bg-secondary/5">
                              <div className="flex items-start">
                                <Sparkles className="h-5 w-5 text-secondary mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <h3 className="font-medium mb-1">Recurring Theme</h3>
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
