import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Wind } from "lucide-react";
import { MeditationPlayerModal } from "./meditation-player-modal";
import etherealDawnImg from "@assets/generated_images/ethereal_dawn_meditation_visualization.png";
import cosmicFocusImg from "@assets/generated_images/cosmic_focus_meditation_visualization.png";
import sereneWatersImg from "@assets/generated_images/serene_waters_meditation_visualization.png";
import sacredFlameImg from "@assets/generated_images/sacred_flame_meditation_visualization.png";
import starlightImg from "@assets/generated_images/starlight_meditation_visualization.png";

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
}

const meditations: Meditation[] = [
  {
    id: 1,
    title: "Ethereal Dawn",
    author: "Luna Etherealis",
    duration: 10,
    difficulty: "Beginner",
    description: "Begin your day with luminous breathing...",
    category: "breathe",
    color: "from-cyan-400 to-blue-500",
    tag: "Breathing",
    image: etherealDawnImg,
  },
  {
    id: 2,
    title: "Cosmic Focus",
    author: "Stellar Mind",
    duration: 15,
    difficulty: "Intermediate",
    description: "Channel the energy of distant stars...",
    category: "focus",
    color: "from-purple-500 to-violet-600",
    tag: "Mindfulness",
    image: cosmicFocusImg,
  },
  {
    id: 3,
    title: "Serene Waters",
    author: "Ocean Guide",
    duration: 20,
    difficulty: "Beginner",
    description: "Flow with the gentle waves of tranquility...",
    category: "calm",
    color: "from-blue-400 to-cyan-500",
    tag: "Relaxation",
    image: sereneWatersImg,
  },
  {
    id: 4,
    title: "Sacred Flame",
    author: "Fire Keeper",
    duration: 12,
    difficulty: "Advanced",
    description: "Transform your energy through inner fire...",
    category: "breathe",
    color: "from-orange-500 to-red-500",
    tag: "Energy",
    image: sacredFlameImg,
  },
  {
    id: 5,
    title: "Starlight Meditation",
    author: "Celestial Guide",
    duration: 18,
    difficulty: "Intermediate",
    description: "Connect with cosmic energies...",
    category: "focus",
    color: "from-indigo-500 to-purple-600",
    tag: "Spiritual",
    image: starlightImg,
  },
];

export function MeditationCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
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
      />
    </>
  );
}
