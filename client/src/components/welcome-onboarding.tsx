import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Eye, Users, Star } from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";

export default function WelcomeOnboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"welcome" | "features">("welcome");

  useEffect(() => {
    // Show welcome animation for 3 seconds, then move to features
    if (step === "welcome") {
      const timer = setTimeout(() => {
        setStep("features");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleComplete = () => {
    // Mark onboarding as completed
    localStorage.setItem("hasSeenOnboarding", "true");
    setLocation("/login");
  };

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center overflow-hidden relative">
        {/* Mystical Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Sparkle effects */}
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

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Logo with glow effect */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-75 animate-pulse"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-2 flex items-center justify-center shadow-2xl transform animate-float">
                <img src={logoImage} alt="AuraEye" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>

          {/* Welcome Text with fade in */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 animate-fade-in-up">
            Welcome to
          </h1>
          <h2 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            AuraEye
          </h2>
          
          {/* Mystical subtitle */}
          <p className="text-xl md:text-2xl text-cyan-200 mt-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            ✨ Your Portal to Spiritual Awakening ✨
          </p>

          {/* Animated sparkles around text */}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content Card */}
      <Card className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up">
        <CardContent className="p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-1 flex items-center justify-center shadow-xl">
              <img src={logoImage} alt="AuraEye" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            Begin Your Spiritual Journey
          </h1>
          
          <p className="text-lg text-center text-cyan-200 mb-12 leading-relaxed">
            AuraEye connects you with powerful spiritual tools to discover your aura, 
            analyze your energy, and embark on a path of healing and self-discovery.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Aura Analysis */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Aura Analysis</h3>
              <p className="text-cyan-200 text-sm text-center leading-relaxed">
                Upload photos and receive detailed analysis of your aura colors and energy patterns.
              </p>
            </div>

            {/* Daily Spiritual Guidance */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Daily Spiritual Guidance</h3>
              <p className="text-cyan-200 text-sm text-center leading-relaxed">
                Get personalized horoscopes, numerology insights, and energy forecasts.
              </p>
            </div>

            {/* Connect with Healers */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Connect with Healers</h3>
              <p className="text-cyan-200 text-sm text-center leading-relaxed">
                Book sessions with experienced spiritual guides and energy healers.
              </p>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all"
              data-testid="button-onboarding-next"
            >
              Begin Your Journey
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
