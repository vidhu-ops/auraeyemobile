import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Zap, ChevronLeft, ChevronRight, Check, Wind, Focus, Flame } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const meditations = [
  {
    id: 1,
    title: "Ethereal Dawn",
    author: "Luna Etherealis",
    duration: 10,
    difficulty: "Beginner",
    description: "Begin your day with a journey with luminous breathing...",
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
    description: "Channel the energy of distant stars to enhance clarity...",
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
    description: "Flow with the gentle waves of tranquility and peace...",
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
  },
  {
    id: 5,
    title: "Starlight Meditation",
    author: "Celestial Guide",
    duration: 18,
    difficulty: "Intermediate",
    description: "Connect with the cosmic energies of the night sky...",
    category: "focus",
    color: "from-indigo-500 to-purple-600",
    tag: "Spiritual"
  }
];

export function MeditationCarousel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [completedMeditations, setCompletedMeditations] = useState<number[]>([]);

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
    onSuccess: (data, meditation) => {
      setCompletedMeditations(prev => [...prev, meditation.id]);
      queryClient.invalidateQueries({ queryKey: ["/api/soul-energy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home-stats"] });
      toast({
        title: "Meditation Completed! 🧘",
        description: `+25 Soul Energy earned from ${meditation.title}`,
      });
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-indigo-400" />
          <h2 className="text-white font-semibold">Meditations & Breathwork</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll("left")}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll("right")}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            data-testid="button-carousel-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
          data-testid="meditation-carousel"
        >
          {meditations.map((meditation) => (
            <Card
              key={meditation.id}
              className={`flex-shrink-0 w-80 bg-gradient-to-r ${meditation.color} border-0 shadow-lg hover:shadow-xl transition-all`}
              data-testid={`carousel-meditation-${meditation.id}`}
            >
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm mb-1">{meditation.title}</h3>
                    <p className="text-white/80 text-xs">{meditation.author}</p>
                  </div>
                  <button
                    onClick={() => handlePlayMeditation(meditation)}
                    disabled={completedMeditations.includes(meditation.id) || completeMeditationMutation.isPending}
                    className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all flex-shrink-0 ml-2 ${
                      completedMeditations.includes(meditation.id)
                        ? "bg-green-500/50 cursor-not-allowed"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                    data-testid={`play-carousel-${meditation.id}`}
                  >
                    {completedMeditations.includes(meditation.id) ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white fill-white" />
                    )}
                  </button>
                </div>

                <p className="text-white/90 text-xs mb-3 flex-grow line-clamp-2">{meditation.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-white/90">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{meditation.duration}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-300" />
                      <span className="text-xs text-white/90">+25</span>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white text-xs border-0 whitespace-nowrap">
                    {meditation.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        💡 Swipe to explore meditation sessions. Earn +25 Soul Energy for each completed session.
      </p>
    </div>
  );
}
