import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Eye, Users, Star, Heart, Lightbulb, TrendingUp, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { manifestIntentions, energyLevels, blocks, getPersonalizedGuidance, type ManifestIntention, type EnergyLevel, type Block } from "@shared/onboarding-presets";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

type OnboardingStep = "question1" | "question2" | "question3" | "guidance";

export default function WelcomeOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("question1");
  
  const [manifestIntention, setManifestIntention] = useState<ManifestIntention | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [biggestBlock, setBiggestBlock] = useState<Block | null>(null);

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: { manifestIntention: ManifestIntention; energyLevel: EnergyLevel; biggestBlock: Block }) => {
      return await apiRequest("PATCH", "/api/users/me/onboarding", data);
    },
    onSuccess: async () => {
      // Wait for user data to be refreshed before redirecting
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });
      // Now redirect to home page after user object is refreshed
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Onboarding save error:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGuidanceContinue = () => {
    if (manifestIntention && energyLevel && biggestBlock) {
      saveOnboardingMutation.mutate({ manifestIntention, energyLevel, biggestBlock });
    }
  };

  const getIconForIntention = (intention: string) => {
    switch (intention) {
      case "Health": return Heart;
      case "Relationships": return Users;
      case "Abundance": return TrendingUp;
      case "Clarity": return Lightbulb;
      default: return Star;
    }
  };

  if (step === "question1") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Question 1 of 3</h2>
              <p className="text-xl text-cyan-200">What's your top intention to manifest right now?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {manifestIntentions.map((intention) => {
                const Icon = getIconForIntention(intention);
                return (
                  <button
                    key={intention}
                    onClick={() => {
                      setManifestIntention(intention);
                      setStep("question2");
                    }}
                    className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      manifestIntention === intention
                        ? "bg-purple-600/30 border-purple-400"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    data-testid={`button-intention-${intention.toLowerCase()}`}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                    <h3 className="text-xl font-bold text-white">{intention}</h3>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "question2") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Question 2 of 3</h2>
              <p className="text-xl text-cyan-200">How do you feel energetically today?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {energyLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setEnergyLevel(level);
                    setStep("question3");
                  }}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    energyLevel === level
                      ? "bg-cyan-600/30 border-cyan-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  data-testid={`button-energy-${level.toLowerCase()}`}
                >
                  <div className="text-4xl mb-2">
                    {level === "Low" && "😔"}
                    {level === "Balanced" && "😌"}
                    {level === "High" && "🌟"}
                  </div>
                  <h3 className="text-xl font-bold text-white">{level}</h3>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep("question1")}
              variant="outline"
              className="w-full text-white border-white/20"
              data-testid="button-back"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "question3") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Question 3 of 3</h2>
              <p className="text-xl text-cyan-200">What's your biggest block right now?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {blocks.map((block) => (
                <button
                  key={block}
                  onClick={() => {
                    setBiggestBlock(block);
                    setStep("guidance");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    biggestBlock === block
                      ? "bg-pink-600/30 border-pink-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  data-testid={`button-block-${block.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <h3 className="text-lg font-bold text-white">{block}</h3>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep("question2")}
              variant="outline"
              className="w-full text-white border-white/20"
              data-testid="button-back"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "guidance" && manifestIntention && energyLevel && biggestBlock) {
    const guidance = getPersonalizedGuidance({ manifestIntention, energyLevel, biggestBlock });

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="relative z-10 w-full max-w-3xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-4xl font-bold text-white mb-4">{guidance.welcomeMessage}</h2>
              <p className="text-lg text-cyan-200">Based on your responses, here's your personalized guidance:</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-400/30">
                <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center">
                  <Star className="w-6 h-6 mr-2" />
                  Your Daily Affirmation
                </h3>
                <p className="text-white text-lg italic">{guidance.dailyAffirmation}</p>
              </div>

              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl p-6 border border-cyan-400/30">
                <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Breathwork Practice
                </h3>
                <p className="text-white">{guidance.breathworkRecommendation}</p>
              </div>

              <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center">
                  <Heart className="w-6 h-6 mr-2" />
                  Lifestyle Suggestions
                </h3>
                <ul className="space-y-2">
                  {guidance.lifestyleSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-white flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl p-6 border border-indigo-400/30">
                <h3 className="text-xl font-bold text-indigo-300 mb-3 flex items-center">
                  <Eye className="w-6 h-6 mr-2" />
                  Meditation Focus
                </h3>
                <p className="text-white">{guidance.meditationFocus}</p>
              </div>

              <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl p-6 border border-pink-400/30">
                <h3 className="text-xl font-bold text-pink-300 mb-3 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Chakra to Balance
                </h3>
                <p className="text-white">{guidance.chakraToBalance}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleGuidanceContinue}
                disabled={saveOnboardingMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all"
                data-testid="button-start-journey"
              >
                {saveOnboardingMutation.isPending ? "Saving..." : "Start Your Journey"}
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
