import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Eye, Users, Star, Heart, Lightbulb, TrendingUp, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { manifestIntentions, energyLevels, blocks, getPersonalizedGuidance, type ManifestIntention, type EnergyLevel, type Block } from "@shared/onboarding-presets";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

type OnboardingStep = "welcome" | "features" | "question1" | "question2" | "question3" | "guidance";

interface WelcomeOnboardingProps {
  skipWelcome?: boolean;
}

export default function WelcomeOnboarding({ skipWelcome = false }: WelcomeOnboardingProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>(skipWelcome ? "question1" : "welcome");
  
  const [manifestIntention, setManifestIntention] = useState<ManifestIntention | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [biggestBlock, setBiggestBlock] = useState<Block | null>(null);

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: { manifestIntention: ManifestIntention; energyLevel: EnergyLevel; biggestBlock: Block }) => {
      const response = await apiRequest("PATCH", "/api/users/me/onboarding", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      
      // Show success toast with credits bonus
      toast({
        title: "Welcome Bonus! 🎉",
        description: `You've received ${data.creditsAwarded || 5} free credits for completing onboarding!`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (step === "welcome") {
      const timer = setTimeout(() => {
        setStep("features");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleComplete = () => {
    // Only set hasSeenOnboarding after post-registration questionnaire
    if (skipWelcome) {
      localStorage.setItem("hasSeenOnboarding", "true");
      setLocation("/");
    } else {
      // In initial welcome flow, just redirect to login
      setLocation("/login");
    }
  };

  const handleGuidanceContinue = () => {
    if (manifestIntention && energyLevel && biggestBlock) {
      saveOnboardingMutation.mutate({ manifestIntention, energyLevel, biggestBlock });
    }
    handleComplete();
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

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 blur-3xl opacity-60 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-500 via-purple-400 to-cyan-400 blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              <div 
                className="absolute inset-8 rounded-full transform animate-float"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(168, 85, 247, 0.9), rgba(236, 72, 153, 0.9), rgba(59, 130, 246, 0.9))',
                  backgroundSize: '200% 200%',
                  animation: 'float 6s ease-in-out infinite, gradient-shift 8s ease infinite',
                  boxShadow: `
                    0 0 60px rgba(6, 182, 212, 0.8),
                    0 0 100px rgba(236, 72, 153, 0.6),
                    inset 0 0 60px rgba(255, 255, 255, 0.3),
                    inset 20px 20px 60px rgba(255, 255, 255, 0.4),
                    inset -20px -20px 60px rgba(59, 130, 246, 0.4)
                  `
                }}
              >
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent 50%)'
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.4), transparent 60%)'
                  }}
                ></div>
              </div>

              
              
            </div>
          </div>

          <h1 className="text-4xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
            Welcome to
          </h1>
          <h2 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            AuraEye
          </h2>
          
          <p className="text-xl md:text-2xl text-cyan-200 mt-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            ✨ Your Portal to Self Discovery ✨
          </p>

          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin-slow" />
          </div>
          <div className="absolute -bottom-8 left-1/4">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute -bottom-8 right-1/4">
            <Sparkles className="w-6 h-6 text-pink-400 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (step === "features") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up">
          <CardContent className="p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 blur-xl opacity-75 animate-pulse"></div>
                
                <div 
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(168, 85, 247, 0.95), rgba(236, 72, 153, 0.95))',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 8s ease infinite',
                    boxShadow: `
                      0 0 30px rgba(6, 182, 212, 0.7),
                      0 0 50px rgba(236, 72, 153, 0.5),
                      inset 0 0 30px rgba(255, 255, 255, 0.3),
                      inset 10px 10px 30px rgba(255, 255, 255, 0.4)
                    `
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent 50%)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
              Begin Your Spiritual Journey
            </h1>
            
            <p className="text-lg text-center text-black-200 mb-12 leading-relaxed">
              AuraEye connects you with powerful spiritual tools to discover your aura, 
              analyze your energy, and embark on a path of healing and self-discovery.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-3 text-center">Aura Analysis</h3>
                <p className="text-purple-600 text-sm text-center leading-relaxed">
                  Upload photos and receive detailed analysis of your aura colors and energy patterns.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-800 mb-3 text-center">Daily Spiritual Guidance</h3>
                <p className="text-blue-600 text-sm text-center leading-relaxed">
                  Get personalized horoscopes, numerology insights, and energy forecasts.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-pink-800 mb-3 text-center">Connect with Healers</h3>
                <p className="text-pink-600 text-sm text-center leading-relaxed">
                  Book sessions with experienced spiritual guides and energy healers.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  if (skipWelcome) {
                    // In post-registration flow, continue to questions
                    setStep("question1");
                  } else {
                    // In initial welcome flow, redirect to login/registration page
                    setLocation("/login");
                  }
                }}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all"
                data-testid="button-onboarding-next"
              >
                {skipWelcome ? "Continue" : "Begin Your Journey"}
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
