import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, X, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  image?: string;
}

interface MeditationPlayerModalProps {
  meditation: Meditation | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function MeditationPlayerModal({ meditation, isOpen, onClose, onComplete }: MeditationPlayerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (!isPlaying || !meditation) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        const progressPercent = (newTime / (meditation.duration * 60)) * 100;
        setProgress(progressPercent);

        // Auto-complete when meditation ends
        if (newTime >= meditation.duration * 60) {
          setIsPlaying(false);
          completeMeditationMutation.mutate(meditation);
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, meditation]);

  const completeMeditationMutation = useMutation({
    mutationFn: async (med: Meditation) => {
      const response = await apiRequest("POST", "/api/meditation-sessions", {
        meditationId: med.id,
        meditationTitle: med.title,
        durationMinutes: med.duration,
        category: med.category,
        energyGained: 25,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/soul-energy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Meditation Completed! 🧘",
        description: `+25 Soul Energy earned from ${meditation?.title}`,
      });
      setElapsedTime(0);
      setProgress(0);
      onComplete?.();
      // Close the modal after successful completion
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record meditation session",
        variant: "destructive",
      });
    },
  });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipForward = () => {
    setElapsedTime(prev => Math.min(prev + 30, (meditation?.duration || 0) * 60 - 1));
  };

  const handleSkipBack = () => {
    setElapsedTime(prev => Math.max(prev - 30, 0));
  };

  const handleComplete = () => {
    setIsPlaying(false);
    completeMeditationMutation.mutate(meditation!);
    // Close the modal after completing meditation
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!meditation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-gradient-to-b ${meditation.color} border-0 shadow-2xl max-w-sm mx-auto`}>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-white text-lg">{meditation.title}</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 hover:bg-white/30 p-1"
              data-testid="button-close-player"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Album Art */}
          <div className="flex justify-center">
            <div className="w-56 h-56 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-3">🧘</div>
                <p className="text-white/80 text-sm font-semibold">{meditation.title}</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-1">{meditation.title}</h2>
            <p className="text-sm text-white/70">{meditation.author}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" data-testid="meditation-progress" />
            <div className="flex justify-between text-xs text-white/70">
              <span>{formatTime(elapsedTime)}</span>
              <span>{meditation.duration}:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleSkipBack}
              className="rounded-full bg-white/20 hover:bg-white/30 p-2 transition-all"
              data-testid="button-skip-back"
            >
              <SkipBack className="h-5 w-5 text-white" fill="white" />
            </button>

            <button
              onClick={handlePlayPause}
              className="rounded-full bg-white/30 hover:bg-white/40 p-4 transition-all"
              data-testid={`button-${isPlaying ? 'pause' : 'play'}`}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 text-white fill-white" />
              ) : (
                <Play className="h-7 w-7 text-white fill-white" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="rounded-full bg-white/20 hover:bg-white/30 p-2 transition-all"
              data-testid="button-skip-forward"
            >
              <SkipForward className="h-5 w-5 text-white" fill="white" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 px-4">
            <Volume2 className="h-4 w-4 text-white/70" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              data-testid="volume-slider"
            />
            <span className="text-xs text-white/70 w-8">{volume}%</span>
          </div>

          {/* Complete Button */}
          <Button
            onClick={handleComplete}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold transition-all"
            data-testid="button-complete-meditation"
          >
            {completeMeditationMutation.isPending ? "Saving..." : "Complete Meditation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
