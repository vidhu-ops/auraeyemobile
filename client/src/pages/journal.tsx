import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, BookOpen, Calendar, TrendingUp, Heart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface JournalEntry {
  id: number;
  userId: number;
  energyLevel: number;
  reflections: string;
  gratitude: string;
  createdAt: string;
}

export default function JournalPage() {
  const { user, isAuthenticated } = useAuth();
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

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      return await apiRequest("/api/journal", {
        method: "POST",
        body: JSON.stringify(entryData),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Spiritual Journal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Document your spiritual journey, track your energy levels, and cultivate gratitude through daily reflection.
        </p>
      </div>

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
  );
}