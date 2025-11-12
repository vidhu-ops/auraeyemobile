import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Zap, Bell, Wifi, Calendar, TrendingUp, Sparkles, Smile, Brain } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Navbar from "@/components/layout/navbar";
import { useCredits } from "@/hooks/use-credits";
import { MoodBanner } from "@/components/psychology/mood-banner";
import { MoodCheckIn, MoodCheckInData } from "@/components/psychology/mood-checkin";

interface JournalEntry {
  id: number;
  userId: number;
  energyLevel: number;
  reflections: string;
  gratitude: string;
  createdAt: string;
}

const moodFilters = [
  { id: "all", name: "All Moods", emoji: "😊", color: "from-cyan-400 to-blue-500" },
  { id: "joyful", name: "Joyful", emoji: "😊", color: "from-yellow-400 to-amber-500" },
  { id: "peaceful", name: "Peaceful", emoji: "🌸", color: "from-pink-400 to-rose-500" },
  { id: "energized", name: "Energized", emoji: "⚡", color: "from-orange-400 to-red-500" }
];

export default function JournalPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  const { credits } = useCredits();
  const [selectedMood, setSelectedMood] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [reflections, setReflections] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [isMoodCheckInOpen, setIsMoodCheckInOpen] = useState(false);
  const [moodInsights, setMoodInsights] = useState<string[]>([]);

  // Fetch journal entries
  const { data: journalEntries = [], isLoading } = useQuery({
    queryKey: ["/api/journal"],
    enabled: isAuthenticated,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!Array.isArray(journalEntries) || journalEntries.length === 0) {
      return { entries: 0, dayStreak: 0, avgEnergy: 0 };
    }

    const entries = journalEntries as JournalEntry[];
    const avgEnergy = entries.reduce((sum, entry) => sum + entry.energyLevel, 0) / entries.length;
    
    return {
      entries: entries.length,
      dayStreak: 7, // You can calculate this based on consecutive days
      avgEnergy: avgEnergy.toFixed(1)
    };
  }, [journalEntries]);

  // Add entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          energyLevel,
          reflections,
          gratitude
        }),
      });
      if (!response.ok) throw new Error("Failed to add entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Entry Added",
        description: "Your journal entry has been saved successfully.",
      });
      setReflections("");
      setGratitude("");
      setEnergyLevel(7);
      setIsAddingEntry(false);
    },
  });

  const filteredEntries = (journalEntries as JournalEntry[]).filter(entry => {
    const matchesSearch = entry.reflections.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.gratitude.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleMoodCheckInComplete = (data: MoodCheckInData) => {
    setMoodInsights(data.insights);
    toast({
      title: "Mood Check-In Complete",
      description: "Your insights have been recorded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 relative overflow-hidden">
      <Navbar />

      {/* Main content */}
      <div className="relative z-10 pb-32 px-4 pt-6">
        {/* Title with icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Spiritual Journal</h1>
          <p className="text-purple-200">Capture your inner journey</p>
        </div>

        {/* Mood Banner */}
        <div className="bg-white mb-6">
          <MoodBanner variant="prominent" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-slate-700/50 backdrop-blur-sm border-slate-600">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{stats.entries}</div>
              <div className="text-xs text-slate-300">Entries</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-700/50 backdrop-blur-sm border-slate-600">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.dayStreak}</div>
              <div className="text-xs text-slate-300">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-700/50 backdrop-blur-sm border-slate-600">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-pink-400">{stats.avgEnergy}</div>
              <div className="text-xs text-slate-300">Avg Energy</div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Insights */}
        {moodInsights.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 backdrop-blur-sm border-purple-500/30 mb-6">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Psychological Insights
              </h3>
              <div className="space-y-2">
                {moodInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-slate-200">
                    <span className="text-cyan-400">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Check-In Button */}
        <div className="mb-6">
          <Button
            onClick={() => setIsMoodCheckInOpen(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
            data-testid="button-mood-checkin"
          >
            <Smile className="h-4 w-4 mr-2" />
            How Are You Feeling?
          </Button>
        </div>

        {/* Search and New Entry */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              data-testid="input-search"
            />
          </div>
          <Button 
            onClick={() => setIsAddingEntry(!isAddingEntry)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg"
            data-testid="button-new-entry"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Add Entry Form */}
        {isAddingEntry && (
          <Card className="bg-slate-700/50 backdrop-blur-sm border-slate-600 mb-6">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Energy Level: {energyLevel}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full"
                  data-testid="slider-energy"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Reflections</label>
                <Textarea
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
                  placeholder="What happened today..."
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  data-testid="textarea-reflections"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Gratitude</label>
                <Textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="What I'm grateful for..."
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  data-testid="textarea-gratitude"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => addEntryMutation.mutate()}
                  disabled={addEntryMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600"
                  data-testid="button-save-entry"
                >
                  {addEntryMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
                <Button
                  onClick={() => setIsAddingEntry(false)}
                  variant="outline"
                  className="border-slate-600 text-white"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
          {moodFilters.map((mood) => (
            <Button
              key={mood.id}
              variant={selectedMood === mood.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMood(mood.id)}
              className={`whitespace-nowrap rounded-full min-w-fit flex items-center gap-2 ${
                selectedMood === mood.id 
                  ? `bg-gradient-to-r ${mood.color} text-white border-0 shadow-md` 
                  : "bg-white/10 text-white border-white/20"
              }`}
              data-testid={`filter-mood-${mood.id}`}
            >
              <span>{mood.emoji}</span>
              {mood.name}
            </Button>
          ))}
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card 
              key={entry.id}
              className="bg-slate-700/50 backdrop-blur-sm border-slate-600 hover:bg-slate-700/70 transition-all cursor-pointer"
              data-testid={`entry-${entry.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">Daily Reflection</h3>
                  <Badge className="bg-amber-500/20 text-amber-300 border-0 flex items-center gap-1">
                    ⚡ {entry.energyLevel}/10
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{format(new Date(entry.createdAt), "h:mm a")}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-3">{entry.reflections.substring(0, 150)}...</p>

                {entry.gratitude && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-slate-400 text-xs mb-1">Gratitude:</p>
                    <p className="text-slate-300 text-sm">{entry.gratitude}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredEntries.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No entries found. Start journaling your spiritual journey!</p>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Mood Check-In Modal */}
      <MoodCheckIn
        isOpen={isMoodCheckInOpen}
        onClose={() => setIsMoodCheckInOpen(false)}
        onComplete={handleMoodCheckInComplete}
      />
    </div>
  );
}
