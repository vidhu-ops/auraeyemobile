import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Clock, Zap, Bell, Wifi, Sparkles, Wind, Focus, Flame, Check, Heart } from "lucide-react";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useBadgeContext } from "@/hooks/use-badge-context";
import { format } from "date-fns";

const meditationCategories = [
  { id: "all", name: "All", icon: Sparkles, color: "from-pink-500 to-rose-500" },
  { id: "breathe", name: "Breathe", icon: Wind, color: "from-red-500 to-pink-500" },
  { id: "focus", name: "Focus", icon: Focus, color: "from-purple-500 to-violet-500" },
  { id: "calm", name: "Calm", icon: Flame, color: "from-amber-500 to-orange-500" }
];

const meditations = [
  {
    id: 1,
    title: "Ethereal Dawn",
    author: "Luna Etherealis",
    duration: 10,
    difficulty: "Beginner",
    description: "Begin your day with a journey with luminous breathing that awakens yo...",
    category: "breathe",
    color: "from-cyan-400 to-blue-500",
    tag: "Breathing"
  },
  {
    id: 2,
    title: "Cosmic Focus",
    author: "Stellar Mind",
    duration: 15,
    difficulty: "Intermediate",
    description: "Channel the energy of distant stars to enhance your mental clarity an...",
    category: "focus",
    color: "from-purple-500 to-violet-600",
    tag: "Mindfulness"
  },
  {
    id: 3,
    title: "Serene Waters",
    author: "Ocean Guide",
    duration: 20,
    difficulty: "Beginner",
    description: "Flow with the gentle waves of tranquility and inner peace...",
    category: "calm",
    color: "from-blue-400 to-cyan-500",
    tag: "Relaxation"
  },
  {
    id: 4,
    title: "Sacred Flame",
    author: "Fire Keeper",
    duration: 12,
    difficulty: "Advanced",
    description: "Transform your energy through the power of inner fire...",
    category: "breathe",
    color: "from-orange-500 to-red-500",
    tag: "Energy"
  }
];

export default function MeditationsPage() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const { toast } = useToast();
  const { checkBadges } = useBadgeContext();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [completedMeditations, setCompletedMeditations] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [favoritedMeditations, setFavoritedMeditations] = useState<number[]>([]);

  // Fetch recently played meditations
  const { data: recentMeditations = [], isLoading: isLoadingRecent } = useQuery<any[]>({
    queryKey: ["/api/meditation-sessions"],
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
  });

  // Fetch favorite meditations
  const { data: favoriteMeditations = [], isLoading: isLoadingFavorites } = useQuery<any[]>({
    queryKey: ["/api/favorite-meditations"],
    enabled: !!user,
    staleTime: 30 * 1000,
  });
  
  const filteredMeditations = selectedCategory === "all" 
    ? meditations 
    : meditations.filter(m => m.category === selectedCategory);

  // Mutations for managing favorites
  const addFavoriteMutation = useMutation({
    mutationFn: async (meditation: typeof meditations[0]) => {
      const response = await apiRequest("POST", "/api/favorite-meditations", {
        meditationId: meditation.id,
        meditationTitle: meditation.title,
        category: meditation.category,
        durationMinutes: meditation.duration,
        author: meditation.author,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorite-meditations"] });
      toast({ title: "Added to favorites!", description: "Meditation bookmarked" });
    },
    onError: (error) => {
      console.error("Add favorite error:", error);
      toast({ title: "Failed to add favorite", variant: "destructive" });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (meditationId: number) => {
      const response = await apiRequest("DELETE", `/api/favorite-meditations/${meditationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorite-meditations"] });
      toast({ title: "Removed from favorites", description: "Meditation unbookmarked" });
    },
    onError: (error) => {
      console.error("Remove favorite error:", error);
      toast({ title: "Failed to remove favorite", variant: "destructive" });
    },
  });

  // Mutation to record meditation completion
  const completeMeditationMutation = useMutation({
    mutationFn: async (meditation: typeof meditations[0]) => {
      const response = await apiRequest("POST", "/api/meditation-sessions", {
        meditationId: meditation.id,
        meditationTitle: meditation.title,
        durationMinutes: meditation.duration,
        category: meditation.category,
        energyGained: 25,
      });
      return await response.json();
    },
    onSuccess: async (data, meditation) => {
      setCompletedMeditations(prev => [...prev, meditation.id]);
      queryClient.invalidateQueries({ queryKey: ["/api/soul-energy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home-stats"] });
      toast({
        title: "Meditation Completed! 🧘",
        description: `+25 Soul Energy earned from ${meditation.title}`,
      });
      
      // Check for new badges
      await checkBadges();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record meditation session",
        variant: "destructive",
      });
    },
  });

  const handlePlayMeditation = (meditation: typeof meditations[0]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your meditation sessions",
        variant: "destructive",
      });
      return;
    }
    completeMeditationMutation.mutate(meditation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 relative overflow-hidden">
      <Navbar />

      {/* Main content */}
      <div className="relative z-10 pb-32 px-4 pt-6">
        {/* Title with icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ethereal Meditations</h1>
          <p className="text-cyan-200">Journey through dimensions of consciousness</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white/10 border-white/20 w-full grid grid-cols-3">
            <TabsTrigger value="browse" className="text-xs sm:text-sm text-white">Browse</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs sm:text-sm text-white">Favorites</TabsTrigger>
            <TabsTrigger value="recently-played" className="text-xs sm:text-sm text-white">Recently Played</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "browse" && (
          <>
            {/* Category Filter */}
            <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
              {meditationCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap rounded-full min-w-fit flex items-center gap-2 ${
                      selectedCategory === category.id 
                        ? `bg-gradient-to-r ${category.color} text-white border-0 shadow-md` 
                        : "bg-white/10 text-white border-white/20"
                    }`}
                    data-testid={`filter-${category.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>

            {/* Meditation Cards */}
            <div className="space-y-4">
          {filteredMeditations.map((meditation) => (
            <Card 
              key={meditation.id}
              className={`bg-gradient-to-r ${meditation.color} border-0 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all`}
              data-testid={`meditation-card-${meditation.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => handlePlayMeditation(meditation)}
                    disabled={completedMeditations.includes(meditation.id) || completeMeditationMutation.isPending}
                    className={`w-14 h-14 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                      completedMeditations.includes(meditation.id)
                        ? 'bg-green-500/50 cursor-not-allowed'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                    data-testid={`play-${meditation.id}`}
                  >
                    {completedMeditations.includes(meditation.id) ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" fill="white" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h3 className="text-white text-lg font-bold mb-1">{meditation.title}</h3>
                    <p className="text-white/90 text-sm mb-2">by {meditation.author}</p>
                    <p className="text-white/80 text-xs mb-3">{meditation.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-white/90">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{meditation.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-300" />
                        <span className="text-xs text-white/90">{meditation.difficulty === 'Beginner' ? '4.9' : meditation.difficulty === 'Intermediate' ? '4.8' : '5.0'}</span>
                      </div>
                      <Badge className="bg-white/20 text-white text-xs border-0">
                        {meditation.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <Badge className="bg-amber-500/90 text-white text-xs border-0 mb-2 block">
                      {meditation.tag}
                    </Badge>
                    <button
                      onClick={() => {
                        const isFav = favoriteMeditations.some(f => f.meditationId === meditation.id);
                        if (isFav) {
                          removeFavoriteMutation.mutate(meditation.id);
                        } else {
                          addFavoriteMutation.mutate(meditation);
                        }
                      }}
                      disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                      className="transition-all hover:scale-110"
                      data-testid={`favorite-${meditation.id}`}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favoriteMeditations.some(f => f.meditationId === meditation.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white/70 hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add more meditations prompt */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            data-testid="button-load-more"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Explore More Meditations
          </Button>
        </div>
        </>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div>
            {isLoadingFavorites ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/10 rounded-lg h-24 mb-4"></div>
                  </div>
                ))}
              </div>
            ) : favoriteMeditations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white/50" />
                </div>
                <p className="text-white/70 mb-4">No favorite meditations yet</p>
                <p className="text-white/50 text-sm mb-6">Mark meditations as favorites to save them here for quick access</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteMeditations.map((favorite) => (
                  <Card 
                    key={favorite.id}
                    className="bg-gradient-to-r from-pink-500/20 to-red-500/20 border-white/20"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{favorite.meditationTitle}</h3>
                          <p className="text-white/70 text-sm mb-2">by {favorite.author}</p>
                          <div className="flex items-center gap-4 text-white/70 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{favorite.durationMinutes} min</span>
                            </div>
                            <Badge className="bg-white/20 text-white text-xs border-0 capitalize">
                              {favorite.category}
                            </Badge>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavoriteMutation.mutate(favorite.meditationId)}
                          disabled={removeFavoriteMutation.isPending}
                          className="transition-all hover:scale-110 mt-1"
                        >
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recently Played Tab */}
        {activeTab === "recently-played" && (
          <div>
            {isLoadingRecent ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/10 rounded-lg h-24 mb-4"></div>
                  </div>
                ))}
              </div>
            ) : recentMeditations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white/50" />
                </div>
                <p className="text-white/70 mb-4">No meditations played yet</p>
                <p className="text-white/50 text-sm mb-6">Start your spiritual journey by browsing and playing a meditation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMeditations.map((session, idx) => (
                  <Card 
                    key={idx}
                    className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-white/20"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{session.meditationTitle}</h3>
                          <div className="flex items-center gap-4 text-white/70 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.durationMinutes} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-yellow-300" />
                              <span>+{session.energyGained} energy</span>
                            </div>
                          </div>
                          <p className="text-white/50 text-xs mt-2">
                            {format(new Date(session.createdAt), "PPp")}
                          </p>
                        </div>
                        <Badge className="bg-green-500/70 text-white border-0 ml-2">
                          ✓ Completed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
