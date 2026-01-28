import { useState, useEffect, useRef } from "react";
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
  mediaUrl?: string;
  mediaType?: 'youtube' | 'video' | 'audio';
}

interface MeditationPlayerModalProps {
  meditation: Meditation | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function MeditationPlayerModal({ meditation, isOpen, onClose, onComplete }: MeditationPlayerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [actualDuration, setActualDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setElapsedTime(0);
      setActualDuration(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!meditation) return;

    // Handle media playback for YouTube and video
    if (meditation.mediaType === 'youtube' && isPlaying && videoRef.current) {
      videoRef.current.play().catch(() => {
        toast({ title: "Cannot autoplay", description: "Click play to start the YouTube video", variant: "default" });
      });
    } else if (meditation.mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
          toast({ title: "Playback issue", description: "Please use the video controls to play", variant: "default" });
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, meditation]);

  // Apply volume control to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle video duration when loaded
  useEffect(() => {
    if (!meditation || !videoRef.current) return;

    const handleLoadedMetadata = () => {
      if (videoRef.current && videoRef.current.duration) {
        setActualDuration(Math.floor(videoRef.current.duration));
      }
    };

    const video = videoRef.current;
    if (meditation.mediaType === 'video') {
      video?.addEventListener('loadedmetadata', handleLoadedMetadata);
      // Also check if duration is already available
      if (video?.duration && !isNaN(video.duration)) {
        setActualDuration(Math.floor(video.duration));
      }
      return () => video?.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [meditation?.mediaType]);

  useEffect(() => {
    if (!meditation) return;

    // Handle video duration sync
    if (videoRef.current && (meditation.mediaType === 'video' || meditation.mediaType === 'youtube')) {
      const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
          const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setProgress(progressPercent);
          setElapsedTime(Math.floor(videoRef.current.currentTime));

          if (videoRef.current.currentTime >= videoRef.current.duration - 1) {
            setIsPlaying(false);
            completeMeditationMutation.mutate(meditation);
          }
        }
      };

      const video = videoRef.current;
      video?.addEventListener('timeupdate', handleTimeUpdate);
      return () => video?.removeEventListener('timeupdate', handleTimeUpdate);
    }

    // Fallback timer for non-media meditations
    if (!isPlaying || !meditation) return;

    const durationSeconds = actualDuration || meditation.duration * 60;
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        const progressPercent = (newTime / durationSeconds) * 100;
        setProgress(progressPercent);

        if (newTime >= durationSeconds) {
          setIsPlaying(false);
          completeMeditationMutation.mutate(meditation);
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, meditation, actualDuration]);

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
    const maxTime = actualDuration || (meditation?.duration || 0) * 60;
    setElapsedTime(prev => Math.min(prev + 30, maxTime - 1));
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(elapsedTime + 30, maxTime - 1);
    }
  };

  const handleSkipBack = () => {
    setElapsedTime(prev => Math.max(prev - 30, 0));
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(elapsedTime - 30, 0);
    }
  };

  const handleComplete = () => {
    if (completeMeditationMutation.isPending) return;
    setIsPlaying(false);
    completeMeditationMutation.mutate(meditation!);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!meditation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-gradient-to-b ${meditation.color} border-0 shadow-2xl w-[90vw] max-w-[90vw]-auto max-h-[90vh] p-4 sm:p-6 rounded-3xl`}>
        <DialogHeader className="mb-2">
          <div className="flex items-center justify-between w-90[vw]">
            <DialogTitle className="text-white text-base sm:text-sm pr-2">{meditation.title}</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 hover:bg-white/30 p-1.5 flex-shrink-0"
              data-testid="button-close-meditation"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 align-left w-90[vw] justify-left">
          {/* Media Player or Album Art */}
          <div className="flex justify-left w-[80vw]">
            {meditation.mediaType === 'youtube' && meditation.mediaUrl ? (
              <div className="w-[90vw] rounded-2xl aspect-video shadow-lg bg-black/20">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(meditation.mediaUrl)}?autoplay=0&rel=0`}
                  title={meditation.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video"
                />
              </div>
            ) : meditation.mediaType === 'video' ? (
              <div className="w-full aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full rounded-2xl bg-black shadow-lg"
                  controls
                  playsInline
                  preload="auto"
                  onLoadedData={() => {
                    if (videoRef.current) {
                      videoRef.current.volume = volume / 100;
                    }
                  }}
                >
                  <source src={meditation.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-left justify-left shadow-lg">
                <div className="text-left">
                  <div className="text-4xl sm:text-5xl mb-2">🧘</div>
                  <p className="text-white/80 text-[10px] sm:text-xs font-semibold px-2 truncate w-12 sm:w-32">{meditation.title}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center w-70[vw] text-white">
            <h2 className="text-xs font-bold leading-tight align-center">{meditation.title}</h2>
            <p className="text-xs text-white/70 text-center">{meditation.author}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 w-80[vw]">
            
            <div className="flex justify-center text-[10px] text-white/70">
              <span>{formatTime(elapsedTime)}</span>
              <span>{formatTime(actualDuration || meditation.duration * 60)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSkipBack}
              className="rounded-full bg-white/20 hover:bg-white/30 p-1.5 transition-all"
              data-testid="button-skip-back"
            >
              <SkipBack className="h-4 w-4 text-white" fill="white" />
            </button>

            <button
              onClick={handlePlayPause}
              className="rounded-full bg-white/30 hover:bg-white/40 p-3 transition-all"
              data-testid={`button-${isPlaying ? 'pause' : 'play'}`}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white fill-white" />
              ) : (
                <Play className="h-6 w-6 text-white fill-white" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="rounded-full bg-white/20 hover:bg-white/30 p-1.5 transition-all"
              data-testid="button-skip-forward"
            >
              <SkipForward className="h-4 w-4 text-white" fill="white" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 px-2">
            <Volume2 className="h-3.5 w-3 text-white/70" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              data-testid="volume-slider"
            />
            <span className="text-[10px] text-white/70 w-6">{volume}%</span>
          </div>

          {/* Complete Button */}
          <Button
            onClick={handleComplete}
            size="sm"
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold transition-all h-9"
            data-testid="button-complete-meditation"
          >
            {completeMeditationMutation.isPending ? "Saving..." : "Complete Meditation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
