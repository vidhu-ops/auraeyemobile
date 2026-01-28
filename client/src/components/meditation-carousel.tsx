import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Wind, Heart } from "lucide-react";
import { MeditationPlayerModal } from "./meditation-player-modal";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import etherealDawnImg from "@assets/generated_images/ethereal_dawn_meditation_visualization.png";
import cosmicFocusImg from "@assets/generated_images/cosmic_focus_meditation_visualization.png";
import sereneWatersImg from "@assets/generated_images/serene_waters_meditation_visualization.png";
import sacredFlameImg from "@assets/generated_images/sacred_flame_meditation_visualization.png";
import starlightImg from "@assets/generated_images/starlight_meditation_visualization.png";
import healingMeditationVideo from "@assets/WhatsApp_Video_2025-12-17_at_3.50.47_PM_1765966899854.mp4";
import energyFlowVideo from "@assets/WhatsApp_Video_2025-12-17_at_3.50.50_PM_1765966899853.mp4";

interface Meditation {
  id: number;
  title: string;
  author: string;
  duration: number;
  difficulty: string;
  description: string;
  category: string;
  color: string;
  tag: string;
  image: string;
  mediaUrl?: string;
  mediaType?: 'youtube' | 'video' | 'audio';
}

const meditations: Meditation[] = [
  {
    id: 1,
    title: "Sharad Poornima- 3 Wealth Codes Activation Meditation with Maha Laxmi Maa",
    author: "Healer Nishant",
    duration: 92,
    difficulty: "Beginner",
    description: "Begin your day with luminous breathing...",
    category: "breathe",
    color: "from-cyan-400 to-blue-500",
    tag: "Breathing",
    image: etherealDawnImg,
    mediaUrl: "https://www.youtube.com/watch?v=b-UNj26EEA8",
    mediaType: "youtube"
  },
  {
    id: 2,
    title: "Awaken Your Inner Sun for 2026, Guided meditation",
    author: "Healer Nishant",
      duration: 11.1,
      difficulty: "Intermediate",
      description: "Channel the energy of distant stars to enhance your mental clarity an...",
      category: "focus",
      color: "from-purple-500 to-violet-600",
      tag: "Mindfulness",
    image: etherealDawnImg,
      mediaUrl: "https://www.youtube.com/watch?v=AFDSY5kVjXI",
      mediaType: "youtube"
  },
  {
    id: 3,
    title: "How I cleared My Abundance Blocks and Manifested Abundance",
      author: "Healer Nishant",
      duration: 59,
      difficulty: "Beginner",
      description: "Flow with the gentle waves of tranquility and inner peace...",
      category: "calm",
      color: "from-blue-400 to-cyan-500",
      tag: "Relaxation",
      image: etherealDawnImg,
      mediaUrl: "https://www.youtube.com/watch?v=qxD0l4H8L94",
      mediaType: "youtube"
  },
  {
    id: 4,
    title: "Grounding & Protecting Your Energy (Guided Meditation)",
      author: "Great Mediations",
      duration: 10.01,
      difficulty: "Advanced",
      description: "Transform your energy through the power of inner fire...",
      category: "breathe",
      color: "from-orange-500 to-red-500",
      tag: "Energy",
      image: etherealDawnImg,
      mediaUrl: "https://www.youtube.com/watch?v=8vFZ-cF4ioI",
      mediaType: "youtube"
  },
  {
    id: 5,
      title: "Starlight Meditation",
      author: "Celestial Guide",
      duration: 18.00,
      difficulty: "Intermediate",
      description: "Connect with cosmic energies...",
      category: "focus",
      color: "from-indigo-500 to-purple-600",
      tag: "Spiritual",
      image: etherealDawnImg,
      mediaUrl: "https://www.youtube.com/watch?v=qXXeN49sQZA",
      mediaType: "youtube"
  },
  {
    id: 6,
    title: "Cosmic Peace Journey",
      author: "YouTube Guide",
      duration: 21.43,
      difficulty: "Beginner",
      description: "Journey through the cosmos to find inner peace...",
      category: "calm",
      color: "from-blue-600 to-purple-600",
      tag: "Relaxation",
      image: etherealDawnImg,
      mediaUrl: "https://youtu.be/hvDvJW42Yd0",
      mediaType: "youtube"
  },
  {
    id: 7,
    title: "Healing Meditation",
    author: "Wellness Expert",
    duration: 5,
    difficulty: "Intermediate",
    description: "Guided meditation for healing and restoration...",
    category: "calm",
    color: "from-emerald-400 to-teal-500",
    tag: "Healing",
    image: starlightImg,
    mediaUrl: healingMeditationVideo,
    mediaType: "video",
  },
  {
    id: 8,
    title: "Energy Flow Meditation",
    author: "Energy Guide",
    duration: 5,
    difficulty: "Intermediate",
    description: "Balance your energy centers with guided visualization...",
    category: "focus",
    color: "from-yellow-400 to-orange-500",
    tag: "Energy",
    image: starlightImg,
    mediaUrl: energyFlowVideo,
    mediaType: "video",
  },
  {
    id: 9,
      title: "GUIDED MEDITATION: White Light Protection: Warrior of Light (Epic Power-Meditation)",
      author: "The Honest Guys - Meditations - Relaxation",
      duration: 7.52,
      difficulty: "Beginner",
      description: "Journey through the cosmos to find inner peace...",
      category: "calm",
      color: "from-blue-600 to-purple-600",
      tag: "Relaxation",
      image: starlightImg,
      mediaUrl: "https://www.youtube.com/watch?v=qXXeN49sQZA",
      mediaType: "youtube"
    },
    {
      id: 10,
      title: "Guided Meditation: Energy Cleanse, Protection & Shielding | Self Healing | Soul Energy Activation",
      author: "Kenneth Soares",
      duration: 13.07,
      difficulty: "Beginner",
      description: "Journey through the cosmos to find inner peace...",
      category: "calm",
      color: "from-blue-600 to-purple-600",
      tag: "Relaxation",
      image: starlightImg,
      mediaUrl: "https://www.youtube.com/watch?v=4hdU4ABGn1c",
      mediaType: "youtube"
    }
];

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Fetch favorite meditations
  const { data: favoriteMeditations = [] } = useQuery<any[]>({
    queryKey: ["/api/favorite-meditations"],
    enabled: !!user,
  });

  const onComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/soul-energy"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/home-stats"] });
  };

  // Mutations for managing favorites
  const addFavoriteMutation = useMutation({
    mutationFn: async (meditation: Meditation) => {
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
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const onComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/soul-energy"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/home-stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/meditation-sessions"] });
  };

  const handleMeditationClick = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setIsPlayerOpen(true);
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setTimeout(() => setSelectedMeditation(null), 300);
  };

  return (
    <>
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
            className="flex gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth"
            data-testid="meditation-carousel"
          >
            {meditations.map((meditation) => (
              <div
                key={meditation.id}
                className="flex-shrink-0 w-56 cursor-pointer group transition-transform hover:scale-105"
                onClick={() => handleMeditationClick(meditation)}
                data-testid={`carousel-meditation-${meditation.id}`}
              >
                {/* Glass-like Image Container */}
                <div className="relative mb-4">
                  <div className="w-56 h-56 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shadow-lg hover:shadow-xl transition-all group-hover:bg-white/20">
                    <img
                      src={meditation.image}
                      alt={meditation.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white fill-white ml-1"
                          viewBox="0 0 24 24"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          toast({ title: "Please login", description: "You need to be logged in to favorite meditations", variant: "destructive" });
                          return;
                        }
                        const isFav = favoriteMeditations.some(f => f.meditationId === meditation.id);
                        if (isFav) {
                          removeFavoriteMutation.mutate(meditation.id);
                        } else {
                          addFavoriteMutation.mutate(meditation);
                        }
                      }}
                      className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-all"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favoriteMeditations.some(f => f.meditationId === meditation.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white/70"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Title Below Image */}
                <div className="text-center">
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                    {meditation.title}
                  </h3>
                  <p className="text-white/60 text-xs">{meditation.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          💡 Click on any meditation to start. Earn +25 Soul Energy per session.
        </p>
      </div>

      {/* Meditation Player Modal */}
      <MeditationPlayerModal
        meditation={selectedMeditation}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
        onComplete={onComplete}
      />
    </>
  );
}
