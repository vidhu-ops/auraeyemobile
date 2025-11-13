import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useCredits } from "@/hooks/use-credits";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Heart, User, TrendingUp, Mountain, Zap, Bell, Wifi, Camera, Star, Book, Calculator, Users, Home, Eye, Scan, Sunrise, BookOpen, Brain, Palette, HelpCircle, Flame, X, Smile } from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";
import { MoodBanner } from "@/components/psychology/mood-banner";
import { MoodCheckIn, MoodCheckInData } from "@/components/psychology/mood-checkin";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import AvatarSoulTree from "@/components/avatar-soul-tree";
import { getSoulEnergyMilestone, calculateTreeGrowth } from "@/lib/soul-energy-utils";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { credits, isLoading: creditsLoading } = useCredits();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMoodCheckInOpen, setIsMoodCheckInOpen] = useState(false);
  
  // Calculate tree growth and milestone
  const milestone = getSoulEnergyMilestone(soulEnergy);
  const treeGrowth = calculateTreeGrowth(soulEnergy);

  // Mood check-in mutation
  const saveMoodSnapshotMutation = useMutation({
    mutationFn: async (data: MoodCheckInData) => {
      const response = await fetch("/api/mood-snapshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save mood snapshot");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood Check-In Saved",
        description: "Your mood has been recorded to help personalize your experience.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save mood check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodCheckInComplete = (data: MoodCheckInData) => {
    saveMoodSnapshotMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 relative overflow-hidden">
      <Navbar />

      {/* Main content */}
      <div className="relative z-10 pb-32 px-4 pt-12">
        {/* Welcome Section */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Hello, Welcome to Your
          </h1>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Spiritual Space
          </h2>
          <p className="text-gray-300 text-sm pt-2">Your journey to inner peace and enlightenment begins here</p>
        </div>

        {/* Spiritual Illustration */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 via-cyan-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-900 via-slate-900 to-cyan-900 flex items-center justify-center">
              <div className="relative">
                <Eye className="h-16 w-16 text-purple-400" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                <Sparkles className="h-4 w-4 text-cyan-400 absolute -bottom-1 -left-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Mood Banner */}
        <div className="mb-10 max-w-md mx-auto">
          <MoodBanner variant="subtle" />
        </div>

        {/* Mood Check-In Button */}
        <div className="mb-10 max-w-md mx-auto px-4">
          <Button
            onClick={() => setIsMoodCheckInOpen(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
            data-testid="button-mood-checkin"
          >
            <Smile className="h-4 w-4 mr-2" />
            How Are You Feeling?
          </Button>
        </div>

        {/* Service Category Buttons */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Explore Our Services</h2>
          
          {/* Three main category buttons */}
          <div className="grid grid-cols-3 grid-rows-2 gap-4 items-center align-center justify-center max-w-auto mx-2 px-2">
            <button 
              onClick={() => setActiveCategory('scan')}
              className="flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-purple-700/80 to-purple-200/80 hover:from-purple-400/90 hover:to-purple-600/90 transition-all shadow-lg p-4"
              data-testid="button-scan-category"
            >
              <Scan className="h-5 w-5 text-purple-200 mb-2" />
              <span className="text-base text-xs text-purple-100 font-bold uppercase">Scan</span>
            </button>
            
            <button 
              onClick={() => setActiveCategory('heal')}
              className="flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-green-900/80 to-green-700/80 hover:from-green-800/90 hover:to-green-600/90 transition-all shadow-lg p-4"
              data-testid="button-heal-category"
            >
              <Heart className="h-5 w-5 text-green-200 mb-2" />
              <span className="text-base text-xs text-green-100 font-bold uppercase">Heal</span>
            </button>
            
            <button 
              onClick={() => setActiveCategory('connect')}
              className="flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-900/80 to-rose-700/80 hover:from-rose-800/90 hover:to-rose-600/90 transition-all shadow-lg p-4"
              data-testid="button-connect-category"
            >
              <Users className="h-5 w-5 text-rose-200 mb-2" />
              <span className="text-base text-xs text-rose-100 font-bold uppercase">Connect</span>
            </button>
          </div>
        </div>

        {/* Bubble Overlay for SCAN */}
        {activeCategory === 'scan' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveCategory(null)}>
            <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setActiveCategory(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                data-testid="button-close-bubbles"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              <div className="space-y-3">
                <Link href="/aura-analysis">
                  <div className="flex items-center gap-4 rounded-2xl bg-purple-500/30 backdrop-blur-md border border-purple-400/40 p-4 hover:bg-purple-500/40 transition-all shadow-lg" data-testid="menu-aura-scanning">
                    <Eye className="h-8 w-8 text-purple-200" />
                    <span className="text-sm text-purple-100 font-semibold">Aura Scanning</span>
                  </div>
                </Link>
                
                <Link href="/vibe">
                  <div className="flex items-center gap-4 rounded-2xl bg-cyan-500/30 backdrop-blur-md border border-cyan-400/40 p-4 hover:bg-cyan-500/40 transition-all shadow-lg" data-testid="menu-whats-my-vibe">
                    <Flame className="h-8 w-8 text-cyan-200" />
                    <span className="text-sm text-cyan-100 font-semibold">What's My Vibe</span>
                  </div>
                </Link>
                
                <Link href="/object-analysis">
                  <div className="flex items-center gap-4 rounded-2xl bg-pink-500/30 backdrop-blur-md border border-pink-400/40 p-4 hover:bg-pink-500/40 transition-all shadow-lg" data-testid="menu-object-scanning">
                    <Camera className="h-8 w-8 text-pink-200" />
                    <span className="text-sm text-pink-100 font-semibold">Object Scanning</span>
                  </div>
                </Link>
                
                <Link href="/numerology">
                  <div className="flex items-center gap-4 rounded-2xl bg-amber-500/30 backdrop-blur-md border border-amber-400/40 p-4 hover:bg-amber-500/40 transition-all shadow-lg" data-testid="menu-numerology">
                    <Calculator className="h-8 w-8 text-amber-200" />
                    <span className="text-sm text-amber-100 font-semibold">Numerology</span>
                  </div>
                </Link>
                
                <Link href="/daily-horoscope">
                  <div className="flex items-center gap-4 rounded-2xl bg-orange-500/30 backdrop-blur-md border border-orange-400/40 p-4 hover:bg-orange-500/40 transition-all shadow-lg" data-testid="menu-horoscope">
                    <Star className="h-8 w-8 text-orange-200" />
                    <span className="text-sm text-orange-100 font-semibold">Horoscope</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Bubble Overlay for CONNECT */}
        {activeCategory === 'connect' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveCategory(null)}>
            <div className="relative max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setActiveCategory(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                data-testid="button-close-bubbles"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <Link href="/healers">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-rose-500/30 backdrop-blur-md border border-rose-400/40 p-6 hover:bg-rose-500/40 transition-all shadow-lg" data-testid="bubble-healers">
                    <Users className="h-10 w-10 text-rose-200 mb-2" />
                    <span className="text-sm text-rose-100 font-medium text-center">Healers</span>
                  </div>
                </Link>
                
                <Link href="/help">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-teal-500/30 backdrop-blur-md border border-teal-400/40 p-6 hover:bg-teal-500/40 transition-all shadow-lg" data-testid="bubble-help">
                    <HelpCircle className="h-10 w-10 text-teal-200 mb-2" />
                    <span className="text-sm text-teal-100 font-medium text-center">Help</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Bubble Overlay for HEAL */}
        {activeCategory === 'heal' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveCategory(null)}>
            <div className="relative max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setActiveCategory(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                data-testid="button-close-bubbles"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              <div className="grid grid-cols-3 gap-3">
                <Link href="/journal">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-green-500/30 backdrop-blur-md border border-green-400/40 p-4 hover:bg-green-500/40 transition-all shadow-lg" data-testid="bubble-journal">
                    <Book className="h-8 w-8 text-green-200 mb-2" />
                    <span className="text-xs text-green-100 font-medium text-center">Journal</span>
                  </div>
                </Link>
                
                <Link href="/color-meanings">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-500/30 backdrop-blur-md border border-violet-400/40 p-4 hover:bg-violet-500/40 transition-all shadow-lg" data-testid="bubble-colors">
                    <Palette className="h-8 w-8 text-violet-200 mb-2" />
                    <span className="text-xs text-violet-100 font-medium text-center">Colors</span>
                  </div>
                </Link>
                
                <Link href="/meditations">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-indigo-500/30 backdrop-blur-md border border-indigo-400/40 p-4 hover:bg-indigo-500/40 transition-all shadow-lg" data-testid="bubble-meditate">
                    <Brain className="h-8 w-8 text-indigo-200 mb-2" />
                    <span className="text-xs text-indigo-100 font-medium text-center">Meditate</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Light Tree of Wisdom */}
        <Card className="bg-gradient-to-br from-green-900/70 to-cyan-900/70 border-green-500/30 mb-10">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-400" />
              <h2 className="text-green-200 font-semibold">Light Tree of Wisdom</h2>
            </div>
            
            {/* Soul Energy Display */}
            <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 rounded-xl p-4 mb-4 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-100" />
                  <span className="text-gray-200 font-semibold">Soul Energy</span>
                </div>
                <div className="text-2xl font-bold text-purple-200">{soulEnergy}</div>
              </div>
              <div className="text-xs text-gray-200 mb-2">
                {milestone.level} Level - {Math.floor(treeGrowth)}% Tree Growth
              </div>
              <Progress value={treeGrowth} className="h-2" />
            </div>
            
            {/* Enhanced Soul Tree Visualization */}
            <div className="mb-4">
              <AvatarSoulTree soulEnergy={soulEnergy} />
            </div>
            
            <div className="text-center mb-4">
              <div className="flex items-center gap-1 justify-center text-green-200 text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Your soul tree grows with each spiritual practice!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Sources */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="h-5 w-5 text-purple-400" />
            <h2 className="text-white font-semibold">Energy Sources</h2>
          </div>

          {/* Meditation Sessions Card */}
          <Card className="bg-purple-900/70 border-purple-500/30 mb-3 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Meditation Sessions</h3>
                  <p className="text-gray-300 text-xs">Gain inner peace energy through mindful practice</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">34</div>
                  <div className="text-xs text-gray-400">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+25</div>
                  <div className="text-xs text-gray-400">Per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">850</div>
                  <div className="text-xs text-gray-400">Total Energy</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Energy Progress</span>
                  <span className="text-purple-400 font-semibold">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Healer Consultations Card */}
          <Card className="bg-cyan-900/70 border-cyan-500/30 mb-3 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Healer Consultations</h3>
                  <p className="text-gray-300 text-xs">Absorb healing energy from spiritual guides</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">8</div>
                  <div className="text-xs text-gray-400">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+50</div>
                  <div className="text-xs text-gray-400">Per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">400</div>
                  <div className="text-xs text-gray-400">Total Energy</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Energy Progress</span>
                  <span className="text-cyan-400 font-semibold">80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Services */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-white font-semibold">Quick Services</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/aura-analysis">
              <Card className="transition-all cursor-pointer" data-testid="service-aura">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Aura Analysis</h3>
                  <p className="text-xs text-gray-300 mt-1">15 credits</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/daily-horoscope">
              <Card className="bg-gradient-to-br from-yellow-900/70 to-amber-900/70 border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/20 transition-all cursor-pointer" data-testid="service-horoscope">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Horoscope</h3>
                  <p className="text-xs text-gray-300 mt-1">Free</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/numerology">
              <Card className="bg-gradient-to-br from-indigo-900/70 to-violet-900/70 border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer" data-testid="service-numerology">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Numerology</h3>
                  <p className="text-xs text-gray-300 mt-1">5 credits</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/healers">
              <Card className="hover:shadow-lg hover:shadow-pink-500/20 transition-all cursor-pointer" data-testid="service-healers">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Find Healers</h3>
                  <p className="text-xs text-gray-300 mt-1">3 credits</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Soul Energy Levels */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-purple-900/70 to-cyan-900/70 px-3 py-2 rounded-lg border border-purple-500/30">
            <Zap className="h-5 w-5 text-purple-400" />
            <h2 className="text-purple-300 font-semibold">Soul Energy Levels</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Awakening */}
            <Card className={`${milestone.level === 'Awakening' ? 'bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border-cyan-400 ring-2 ring-cyan-400/50' : 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/30'} transition-all`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌅</div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Awakening</h3>
                      <p className="text-xs text-gray-300">Beginner • 0-1000 soul energy</p>
                    </div>
                  </div>
                  {milestone.level === 'Awakening' && (
                    <div className="bg-cyan-400/20 px-2 py-1 rounded-full">
                      <p className="text-xs text-cyan-400 font-semibold">Current</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Balancer */}
            <Card className={`${milestone.level === 'Balancer' ? 'bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-400 ring-2 ring-purple-400/50' : 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30'} transition-all`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⚖️</div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Balancer</h3>
                      <p className="text-xs text-gray-300">Intermediate • 1001-5000 soul energy</p>
                    </div>
                  </div>
                  {milestone.level === 'Balancer' && (
                    <div className="bg-purple-400/20 px-2 py-1 rounded-full">
                      <p className="text-xs text-purple-400 font-semibold">Current</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Radiant */}
            <Card className={`${milestone.level === 'Radiant' ? 'bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-yellow-400 ring-2 ring-yellow-400/50' : 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30'} transition-all`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✨</div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Radiant</h3>
                      <p className="text-xs text-gray-300">Advanced • 5001-10000 soul energy</p>
                    </div>
                  </div>
                  {milestone.level === 'Radiant' && (
                    <div className="bg-yellow-400/20 px-2 py-1 rounded-full">
                      <p className="text-xs text-yellow-400 font-semibold">Current</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ascended */}
            <Card className={`${milestone.level === 'Ascended' ? 'bg-gradient-to-br from-white/90 to-cyan-200/90 border-white ring-2 ring-white/50' : 'bg-gradient-to-br from-slate-800/50 to-gray-900/50 border-slate-500/30'} transition-all`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👑</div>
                    <div>
                      <h3 className={`${milestone.level === 'Ascended' ? 'text-slate-900' : 'text-white'} font-semibold text-sm`}>Ascended</h3>
                      <p className={`text-xs ${milestone.level === 'Ascended' ? 'text-slate-700' : 'text-gray-300'}`}>10001+ soul energy</p>
                      <p className={`text-xs ${milestone.level === 'Ascended' ? 'text-purple-700' : 'text-purple-400'} font-semibold mt-1`}>🔓 Unlock healer mentorship with Super Elite healers</p>
                    </div>
                  </div>
                  {milestone.level === 'Ascended' && (
                    <div className="bg-white/30 px-2 py-1 rounded-full">
                      <p className="text-xs text-slate-900 font-semibold">Current</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Mood Check-In Modal */}
      <MoodCheckIn
        isOpen={isMoodCheckInOpen}
        onClose={() => setIsMoodCheckInOpen(false)}
        onComplete={handleMoodCheckInComplete}
      />
    </div>
  );
}
