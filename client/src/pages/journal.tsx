import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Calendar, TrendingUp, Heart, Brain, BarChart3, Sparkles, Target, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface JournalEntry {
  id: number;
  userId: number;
  energyLevel: number;
  reflections: string;
  gratitude: string;
  createdAt: string;
}

export default function JournalPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [energyLevel, setEnergyLevel] = useState([7]);
  const [reflections, setReflections] = useState("");
  const [gratitude1, setGratitude1] = useState("");
  const [gratitude2, setGratitude2] = useState("");
  const [gratitude3, setGratitude3] = useState("");

  // Fetch journal entries
  const { data: journalEntries = [], isLoading } = useQuery({
    queryKey: ["/api/journal"],
    enabled: isAuthenticated,
  });

  // Calculate mood patterns and personality insights
  const personalityInsights = useMemo(() => {
    if (!Array.isArray(journalEntries) || journalEntries.length === 0) {
      return null;
    }

    const entries = journalEntries as JournalEntry[];
    const totalEntries = entries.length;
    const averageEnergy = entries.reduce((sum, entry) => sum + entry.energyLevel, 0) / totalEntries;
    
    // Analyze energy trends (last 7 entries vs previous)
    const recentEntries = entries.slice(-7);
    const previousEntries = entries.slice(-14, -7);
    const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / recentEntries.length;
    const previousAvg = previousEntries.length > 0 
      ? previousEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / previousEntries.length 
      : recentAvg;
    
    const energyTrend = recentAvg - previousAvg;
    
    // Analyze reflection patterns
    const reflectionWords = entries.flatMap(entry => 
      entry.reflections.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );
    const wordFreq = reflectionWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Calculate consistency
    const energyVariance = entries.reduce((sum, entry) => 
      Math.pow(entry.energyLevel - averageEnergy, 2), 0
    ) / totalEntries;
    const consistency = Math.max(0, 100 - (energyVariance * 10));

    // Determine personality traits based on patterns
    const traits = [];
    if (averageEnergy >= 8) traits.push("High Energy");
    if (averageEnergy >= 6) traits.push("Optimistic");
    if (consistency >= 70) traits.push("Stable");
    if (energyTrend > 1) traits.push("Growing");
    if (topWords.some(word => ['grateful', 'thankful', 'blessed'].includes(word))) traits.push("Grateful");
    if (topWords.some(word => ['creative', 'art', 'music', 'write'].includes(word))) traits.push("Creative");
    if (topWords.some(word => ['learn', 'study', 'read', 'knowledge'].includes(word))) traits.push("Curious");

    return {
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      energyTrend,
      consistency: Math.round(consistency),
      topWords,
      traits,
      totalEntries,
      recentAvg: Math.round(recentAvg * 10) / 10
    };
  }, [journalEntries]);

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to save journal entry");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setIsAddingEntry(false);
      setReflections("");
      setGratitude1("");
      setGratitude2("");
      setGratitude3("");
      setEnergyLevel([7]);
      toast({
        title: "Journal Entry Saved",
        description: "Your spiritual journey has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitEntry = () => {
    if (!reflections.trim()) {
      toast({
        title: "Missing Information",
        description: "Please share your reflections before saving.",
        variant: "destructive",
      });
      return;
    }

    const gratitudeEntries = [gratitude1, gratitude2, gratitude3].filter(Boolean);
    
    createEntryMutation.mutate({
      energyLevel: energyLevel[0],
      reflections: reflections.trim(),
      gratitude: gratitudeEntries
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your spiritual journal.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-teal-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Spiritual Journal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Document your spiritual journey, track your energy levels, and cultivate gratitude through daily reflection.
          </p>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="journal">Journal Entries</TabsTrigger>
            <TabsTrigger value="insights">Personality Insights</TabsTrigger>
            <TabsTrigger value="analytics">Mood Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Entry */}
              <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-600" />
            New Journal Entry
          </CardTitle>
          <CardDescription>Reflect on your spiritual growth and daily experiences</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAddingEntry ? (
            <Button onClick={() => setIsAddingEntry(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Entry
            </Button>
          ) : (
            <div className="space-y-6">
              {/* Energy Level Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Energy Level: {energyLevel[0]}/10</Label>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low Energy</span>
                  <span>High Energy</span>
                </div>
              </div>

              {/* Reflections */}
              <div className="space-y-2">
                <Label htmlFor="reflections">Daily Reflections</Label>
                <Textarea
                  id="reflections"
                  placeholder="Share your thoughts, insights, and spiritual experiences from today..."
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Gratitude */}
              <div className="space-y-3">
                <Label>Three Things I'm Grateful For</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="1. What brought you joy today?"
                    value={gratitude1}
                    onChange={(e) => setGratitude1(e.target.value)}
                  />
                  <Input
                    placeholder="2. What are you thankful for?"
                    value={gratitude2}
                    onChange={(e) => setGratitude2(e.target.value)}
                  />
                  <Input
                    placeholder="3. What made you smile?"
                    value={gratitude3}
                    onChange={(e) => setGratitude3(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitEntry}
                  disabled={createEntryMutation.isPending}
                  className="flex-1"
                >
                  {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingEntry(false);
                    setReflections("");
                    setGratitude1("");
                    setGratitude2("");
                    setGratitude3("");
                    setEnergyLevel([7]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal Entries History */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          <h2 className="text-2xl font-semibold">Your Journal Entries</h2>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your journal entries...</p>
            </CardContent>
          </Card>
        ) : journalEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Journal Entries Yet</h3>
              <p className="text-gray-600 mb-4">Start your spiritual journey by creating your first journal entry.</p>
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {journalEntries.map((entry: JournalEntry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <CardTitle className="text-lg">
                        {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy")}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Energy: {entry.energyLevel}/10
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Reflections</h4>
                    <p className="text-gray-700 leading-relaxed">{entry.reflections}</p>
                  </div>
                  
                  {entry.gratitude && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <h4 className="font-medium text-gray-900">Gratitude</h4>
                      </div>
                      <div className="text-gray-700">
                        {entry.gratitude.split(';').map((item, index) => (
                          <p key={index} className="mb-1">• {item.trim()}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
              </div>
            </div>
          </TabsContent>

          {/* Personality Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {personalityInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Core Personality Traits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Personality Traits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {personalityInsights.traits.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-2">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Energy Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Energy Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Energy</span>
                          <span>{personalityInsights.averageEnergy}/10</span>
                        </div>
                        <Progress value={personalityInsights.averageEnergy * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Consistency</span>
                          <span>{personalityInsights.consistency}%</span>
                        </div>
                        <Progress value={personalityInsights.consistency} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className={`font-medium ${personalityInsights.energyTrend > 0 ? 'text-green-600' : personalityInsights.energyTrend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {personalityInsights.energyTrend > 0 ? '↗' : personalityInsights.energyTrend < 0 ? '↘' : '→'} 
                          {personalityInsights.energyTrend > 0 ? ' Growing' : personalityInsights.energyTrend < 0 ? ' Declining' : ' Stable'} trend
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-600" />
                      Common Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {personalityInsights.topWords.map((word, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm capitalize">{word}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Insights Coming Soon</h3>
                  <p className="text-gray-500">Write a few journal entries to unlock personality insights and patterns.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mood Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {personalityInsights ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Energy Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Energy Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{personalityInsights.recentAvg}</div>
                          <div className="text-sm text-green-500">Recent Average</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{personalityInsights.averageEnergy}</div>
                          <div className="text-sm text-blue-500">Overall Average</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {personalityInsights.totalEntries} journal entries
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Growth Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {personalityInsights.energyTrend > 1 && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">Your energy is growing! Continue with your current practices.</p>
                        </div>
                      )}
                      {personalityInsights.consistency < 50 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-700">Consider establishing more consistent daily routines to stabilize your energy.</p>
                        </div>
                      )}
                      {personalityInsights.averageEnergy < 5 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">Focus on activities that naturally boost your energy and mood.</p>
                        </div>
                      )}
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">Your reflections show growth in mindfulness and self-awareness.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-500">Write journal entries over time to see detailed mood analytics and trends.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}