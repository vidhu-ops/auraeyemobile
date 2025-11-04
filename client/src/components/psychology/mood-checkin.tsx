/**
 * Mood Check-In Component
 * Interactive mood tracking with psychological questions
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Meh, Frown, Heart, Brain, Zap, Cloud, Sun, Moon } from "lucide-react";

interface MoodCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (mood: MoodCheckInData) => void;
}

export interface MoodCheckInData {
  emotion: string;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  socialConnection: number;
  physicalActivity: number;
  insights: string[];
}

const emotions = [
  { id: 'joyful', label: 'Joyful', icon: Smile, color: 'bg-yellow-500', description: 'Feeling happy and positive' },
  { id: 'calm', label: 'Calm', icon: Cloud, color: 'bg-blue-500', description: 'Peaceful and relaxed' },
  { id: 'energized', label: 'Energized', icon: Zap, color: 'bg-orange-500', description: 'Alert and motivated' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-gray-500', description: 'Neither good nor bad' },
  { id: 'stressed', label: 'Stressed', icon: Brain, color: 'bg-red-500', description: 'Feeling overwhelmed' },
  { id: 'tired', label: 'Tired', icon: Moon, color: 'bg-purple-500', description: 'Low energy, fatigued' },
];

export function MoodCheckIn({ isOpen, onClose, onComplete }: MoodCheckInProps) {
  const [step, setStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [socialConnection, setSocialConnection] = useState(5);
  const [physicalActivity, setPhysicalActivity] = useState(5);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleComplete = () => {
    const insights = generateInsights();
    onComplete?.({
      emotion: selectedEmotion,
      energyLevel,
      stressLevel,
      sleepQuality,
      socialConnection,
      physicalActivity,
      insights
    });
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedEmotion('');
    setEnergyLevel(5);
    setStressLevel(5);
    setSleepQuality(5);
    setSocialConnection(5);
    setPhysicalActivity(5);
  };

  const generateInsights = () => {
    const insights: string[] = [];
    
    // Energy-based insights
    if (energyLevel <= 3) {
      insights.push("Your energy is low. Consider taking a short break or getting some rest.");
    } else if (energyLevel >= 8) {
      insights.push("Great energy levels! This is a good time for productive activities.");
    }
    
    // Stress insights
    if (stressLevel >= 7) {
      insights.push("High stress detected. Try deep breathing exercises or meditation.");
    }
    
    // Sleep insights
    if (sleepQuality <= 4) {
      insights.push("Poor sleep can affect your mood and energy. Prioritize better sleep tonight.");
    }
    
    // Social connection insights
    if (socialConnection <= 3) {
      insights.push("Low social connection. Reaching out to a friend might help improve your mood.");
    }
    
    // Physical activity insights
    if (physicalActivity <= 3) {
      insights.push("Low physical activity. Even a short walk can boost your energy and mood.");
    }
    
    // Emotional insights
    if (selectedEmotion === 'stressed') {
      insights.push("Stress is temporary. Focus on what you can control and let go of the rest.");
    } else if (selectedEmotion === 'joyful') {
      insights.push("Wonderful! Savor this positive feeling and note what contributed to it.");
    }
    
    if (insights.length === 0) {
      insights.push("You're doing well! Keep maintaining this balance in your life.");
    }
    
    return insights;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Mood Check-In
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Let's understand your current state
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Emotion Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">How are you feeling right now?</h3>
              <div className="grid grid-cols-2 gap-3">
                {emotions.map((emotion) => {
                  const Icon = emotion.icon;
                  return (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedEmotion === emotion.id
                          ? `${emotion.color} border-white shadow-lg scale-105`
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                      data-testid={`emotion-${emotion.id}`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-2 text-white" />
                      <div className="text-sm font-medium text-white">{emotion.label}</div>
                      <div className="text-xs text-slate-300 mt-1">{emotion.description}</div>
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedEmotion}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
                data-testid="button-next-step"
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Psychological Questions */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">A few more questions...</h3>
              
              {/* Energy Level */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Energy Level: <span className="text-cyan-400 font-semibold">{energyLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                  data-testid="slider-energy-level"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Drained</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Stress Level: <span className="text-orange-400 font-semibold">{stressLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-orange-500"
                  data-testid="slider-stress-level"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Relaxed</span>
                  <span>Very Stressed</span>
                </div>
              </div>

              {/* Sleep Quality */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Sleep Quality (last night): <span className="text-purple-400 font-semibold">{sleepQuality}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-purple-500"
                  data-testid="slider-sleep-quality"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Social Connection */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Social Connection (today): <span className="text-pink-400 font-semibold">{socialConnection}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={socialConnection}
                  onChange={(e) => setSocialConnection(Number(e.target.value))}
                  className="w-full accent-pink-500"
                  data-testid="slider-social-connection"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Isolated</span>
                  <span>Connected</span>
                </div>
              </div>

              {/* Physical Activity */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Physical Activity (today): <span className="text-green-400 font-semibold">{physicalActivity}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(Number(e.target.value))}
                  className="w-full accent-green-500"
                  data-testid="slider-physical-activity"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Sedentary</span>
                  <span>Very Active</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500"
                  data-testid="button-complete"
                >
                  Complete
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
