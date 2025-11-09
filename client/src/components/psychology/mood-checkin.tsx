/**
 * Mood Check-In Component
 * Interactive mood tracking with psychological questions and personalized recommendations
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Meh, Frown, Heart, Brain, Zap, Cloud, Sun, Moon, Sparkles, Wind, Activity, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface MoodRecommendations {
  psychologicalTips: string[];
  breathingTechniques: BreathingTechnique[];
  somaticExercises: SomaticExercise[];
  affirmations: string[];
  colorTherapy: {
    color: string;
    meaning: string;
  };
}

interface BreathingTechnique {
  name: string;
  description: string;
  steps: string[];
  duration: string;
  benefits: string;
}

interface SomaticExercise {
  name: string;
  description: string;
  steps: string[];
  duration: string;
  benefits: string;
}

const emotions = [
  { id: 'joyful', label: 'Joyful', icon: Smile, color: 'bg-yellow-500', description: 'Feeling happy and positive' },
  { id: 'calm', label: 'Calm', icon: Cloud, color: 'bg-blue-500', description: 'Peaceful and relaxed' },
  { id: 'energized', label: 'Energized', icon: Zap, color: 'bg-orange-500', description: 'Alert and motivated' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-gray-500', description: 'Neither good nor bad' },
  { id: 'stressed', label: 'Stressed', icon: Brain, color: 'bg-red-500', description: 'Feeling overwhelmed' },
  { id: 'tired', label: 'Low', icon: Moon, color: 'bg-purple-500', description: 'Low energy, fatigued' },
];

export function MoodCheckIn({ isOpen, onClose, onComplete }: MoodCheckInProps) {
  const [step, setStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [socialConnection, setSocialConnection] = useState(5);
  const [physicalActivity, setPhysicalActivity] = useState(5);
  const [recommendations, setRecommendations] = useState<MoodRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);
    const insights = generateInsights();
    
    const moodData = {
      emotion: selectedEmotion,
      energyLevel,
      stressLevel,
      sleepQuality,
      socialConnection,
      physicalActivity,
      insights
    };

    try {
      // Save mood snapshot
      await apiRequest('POST', '/api/mood-snapshots', moodData);

      // Get personalized recommendations
      const response = await apiRequest('POST', '/api/mood-recommendations', {
        emotion: selectedEmotion,
        energyLevel,
        stressLevel,
        sleepQuality,
        socialConnection,
        physicalActivity
      });

      const data = await response.json();
      setRecommendations(data);
      
      // Show success toast
      toast({
        title: "Check-in Complete!",
        description: "Your mood has been saved and personalized recommendations are ready.",
      });
      
      setStep(3); // Move to recommendations view
      onComplete?.(moodData);
    } catch (error: any) {
      console.error('Error completing mood check-in:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Authentication')) {
        setError('Please log in to save your mood check-in.');
        toast({
          title: "Authentication Required",
          description: "Please log in to save your mood check-in and get personalized recommendations.",
          variant: "destructive"
        });
      } else {
        setError('Unable to save your check-in. Please try again.');
        toast({
          title: "Error",
          description: "Unable to save your check-in. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedEmotion('');
    setEnergyLevel(5);
    setStressLevel(5);
    setSleepQuality(5);
    setSocialConnection(5);
    setPhysicalActivity(5);
    setRecommendations(null);
    setError(null);
  };

  const generateInsights = () => {
    const insights: string[] = [];
    
    if (energyLevel <= 3) {
      insights.push("Your energy is low. Consider taking a short break or getting some rest.");
    } else if (energyLevel >= 8) {
      insights.push("Great energy levels! This is a good time for productive activities.");
    }
    
    if (stressLevel >= 7) {
      insights.push("High stress detected. Try deep breathing exercises or meditation.");
    }
    
    if (sleepQuality <= 4) {
      insights.push("Poor sleep can affect your mood and energy. Prioritize better sleep tonight.");
    }
    
    if (socialConnection <= 3) {
      insights.push("Low social connection. Reaching out to a friend might help improve your mood.");
    }
    
    if (physicalActivity <= 3) {
      insights.push("Low physical activity. Even a short walk can boost your energy and mood.");
    }
    
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

  const handleCloseRecommendations = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {step === 3 ? 'Your Personalized Wellness Guide' : 'Mood Check-In'}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {step === 3 ? 'Based on your responses, here are some personalized recommendations' : "Let's understand your current state"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
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

                {/* Error Display */}
                {error && (
                  <Card className="p-4 bg-red-900/20 border-red-500/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-red-200 text-sm">{error}</p>
                      </div>
                    </div>
                  </Card>
                )}

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
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500"
                    data-testid="button-complete"
                  >
                    {isLoading ? 'Processing...' : 'Get My Recommendations'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Recommendations or Error State */}
            {step === 3 && (
              <div className="space-y-6">
                {!recommendations ? (
                  // Fallback state when recommendations fail to load
                  <Card className="p-8 bg-slate-700/50 border-slate-600 text-center">
                    <AlertCircle className="h-12 w-12 text-black-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">Unable to Load Recommendations</h3>
                    <p className="text-slate-300 mb-4">
                      We couldn't generate your personalized recommendations at this time.
                    </p>
                    <p className="text-slate-400 text-sm mb-6">
                      {error || 'Please try again or contact support if the problem persists.'}
                    </p>
                    <Button
                      onClick={handleCloseRecommendations}
                      className="bg-gradient-to-r from-purple-500 to-cyan-500"
                    >
                      Close
                    </Button>
                  </Card>
                ) : (
                  // Success state with recommendations
                  <>
                {/* Color Therapy Banner */}
                <Card 
                  className="p-6 border-2" 
                  style={{ 
                    background: `linear-gradient(135deg, ${recommendations.colorTherapy.color}22, ${recommendations.colorTherapy.color}44)`,
                    borderColor: recommendations.colorTherapy.color
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6" style={{ color: recommendations.colorTherapy.color }} />
                    <h3 className="text-lg font-semibold text-white">Your Color Energy</h3>
                  </div>
                  <p className="text-slate-200">{recommendations.colorTherapy.meaning}</p>
                </Card>

                <Tabs defaultValue="tips" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
                    <TabsTrigger value="tips" data-testid="tab-tips">
                      <Heart className="h-4 w-4 mr-1" />
                      Tips
                    </TabsTrigger>
                    <TabsTrigger value="breathing" data-testid="tab-breathing">
                      <Wind className="h-4 w-4 mr-1" />
                      Breathwork
                    </TabsTrigger>
                    <TabsTrigger value="somatic" data-testid="tab-somatic">
                      <Activity className="h-4 w-4 mr-1" />
                      Exercises
                    </TabsTrigger>
                    <TabsTrigger value="affirmations" data-testid="tab-affirmations">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Affirmations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tips" className="space-y-3 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Psychological Tips for You</h3>
                    {recommendations.psychologicalTips.map((tip, index) => (
                      <Card key={index} className="p-4 bg-slate-700/50 border-slate-600">
                        <p className="text-slate-800 text-xs">{tip}</p>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="breathing" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Breathing Techniques</h3>
                    {recommendations.breathingTechniques.map((technique, index) => (
                      <Card key={index} className="p-5 bg-slate-700/50 border-slate-600">
                        <h4 className="text-lg font-semibold text-blue-600 mb-2">{technique.name}</h4>
                        <p className="text-slate-800 text-sm mb-3">{technique.description}</p>
                        <div className="mb-3">
                          <span className="text-xs text-slate-800">Duration: </span>
                          <span className="text-sm text-purple-800">{technique.duration}</span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {technique.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex gap-2">
                              <span className="text-cyan-800 font-semibold">{stepIndex + 1}.</span>
                              <p className="text-slate-800 text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-slate-600">
                          <p className="text-xs text-green-800">✓ {technique.benefits}</p>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="somatic" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Somatic Exercises</h3>
                    {recommendations.somaticExercises.map((exercise, index) => (
                      <Card key={index} className="p-5 bg-slate-700/50 border-slate-600">
                        <h4 className="text-lg font-semibold text-orange-800 mb-2">{exercise.name}</h4>
                        <p className="text-slate-800 text-sm mb-3">{exercise.description}</p>
                        <div className="mb-3">
                          <span className="text-xs text-slate-800">Duration: </span>
                          <span className="text-sm text-purple-800">{exercise.duration}</span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {exercise.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex gap-2">
                              <span className="text-orange-800 font-semibold">{stepIndex + 1}.</span>
                              <p className="text-slate-800 text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-slate-600">
                          <p className="text-xs text-green-800">✓ {exercise.benefits}</p>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="affirmations" className="space-y-3 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Affirmations for You</h3>
                    <p className="text-slate-800 text-sm mb-4">
                      Repeat these affirmations daily. Say them out loud or silently to yourself.
                    </p>
                    {recommendations.affirmations.map((affirmation, index) => (
                      <Card 
                        key={index} 
                        className="p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30"
                      >
                        <p className="text-slate-800 italic text-center">"{affirmation}"</p>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleCloseRecommendations}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  data-testid="button-close-recommendations"
                >
                  Done
                </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
