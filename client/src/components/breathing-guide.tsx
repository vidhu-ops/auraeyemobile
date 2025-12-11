import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BreathingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  duration: string;
}

export default function BreathingGuide({ isOpen, onClose, exerciseName, duration }: BreathingGuideProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Define breathing patterns for each exercise
  const breathingPatterns: { [key: string]: { phases: Array<{ type: "inhale" | "hold" | "exhale" | "rest"; duration: number; label: string }> } } = {
    "4-7-8 Breathing": {
      phases: [
        { type: "inhale", duration: 4, label: "Inhale" },
        { type: "hold", duration: 7, label: "Hold" },
        { type: "exhale", duration: 8, label: "Exhale" }
      ]
    },
    "Box Breathing": {
      phases: [
        { type: "inhale", duration: 4, label: "Inhale" },
        { type: "hold", duration: 4, label: "Hold" },
        { type: "exhale", duration: 4, label: "Exhale" },
        { type: "hold", duration: 4, label: "Hold" }
      ]
    },
    "Alternate Nostril": {
      phases: [
        { type: "inhale", duration: 4, label: "Inhale (Left)" },
        { type: "hold", duration: 4, label: "Hold & Switch" },
        { type: "exhale", duration: 4, label: "Exhale (Right)" },
        { type: "hold", duration: 4, label: "Hold & Switch" }
      ]
    },
    "Belly Breathing": {
      phases: [
        { type: "inhale", duration: 4, label: "Slow Inhale" },
        { type: "hold", duration: 2, label: "Hold" },
        { type: "exhale", duration: 6, label: "Slow Exhale" }
      ]
    }
  };

  const pattern = breathingPatterns[exerciseName] || breathingPatterns["Box Breathing"];

  useEffect(() => {
    if (!isActive || !isOpen) return;

    const totalDuration = pattern.phases.reduce((sum, p) => sum + p.duration, 0);
    let elapsed = 0;
    let currentPhaseIndex = 0;

    const interval = setInterval(() => {
      elapsed += 0.1;
      const cycleTime = elapsed % (totalDuration * 1000) / 1000;

      // Find current phase
      let timeInPhase = cycleTime;
      for (let i = 0; i < pattern.phases.length; i++) {
        if (timeInPhase < pattern.phases[i].duration) {
          currentPhaseIndex = i;
          setPhase(pattern.phases[i].type);
          setProgress((timeInPhase / pattern.phases[i].duration) * 100);
          break;
        }
        timeInPhase -= pattern.phases[i].duration;
      }

      // Update cycle count
      if (cycleTime === 0) {
        setCycleCount(c => c + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isOpen, pattern]);

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-400 to-cyan-400";
      case "hold":
        return "from-purple-400 to-violet-400";
      case "exhale":
        return "from-emerald-400 to-green-400";
      case "rest":
        return "from-gray-400 to-slate-400";
      default:
        return "from-blue-400 to-cyan-400";
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "inhale":
        return "INHALE";
      case "hold":
        return "HOLD";
      case "exhale":
        return "EXHALE";
      case "rest":
        return "REST";
      default:
        return "BREATHE";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{exerciseName}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Follow the circle below to guide your breathing
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Animated Breathing Circle */}
          <div className="relative w-40 h-40">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-80 shadow-2xl transition-all duration-100`}
              style={{
                transform: `scale(${0.5 + (progress / 100) * 0.5})`,
                opacity: 0.6 + (progress / 100) * 0.4
              }}
            />
            <div className="absolute inset-0 rounded-full border-4 border-gray-600/30" />
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-white mb-2">{getPhaseLabel()}</div>
              <div className="text-sm text-gray-300">Cycle {cycleCount + 1}</div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getPhaseColor()} transition-all duration-100`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-4">
              Follow the expanding and contracting circle to match your breathing rhythm
            </p>
            <div className="grid grid-cols-2 gap-4">
              {pattern.phases.map((p, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-semibold text-white">{p.label}</div>
                  <div className="text-gray-400">{p.duration}s</div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 ${
                isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } text-white`}
              data-testid="breathing-toggle"
            >
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800"
              data-testid="breathing-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Duration Info */}
          <div className="text-xs text-gray-400 text-center">
            Recommended duration: {duration}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
