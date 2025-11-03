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
import { Sparkles, Heart, User, TrendingUp, Mountain, Zap, Bell, Wifi, Camera, Star, Book, Calculator, Users, Home, Eye, Scan, Sunrise, BookOpen, Brain, Palette, HelpCircle, Flame, X } from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { credits, isLoading: creditsLoading } = useCredits();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Calculate tree growth: 5% per 10 soul energy points
  const treeGrowthFromSoulEnergy = Math.floor(soulEnergy / 10) * 5;
  const baseGrowth = 50; // Starting growth percentage
  const totalTreeGrowth = Math.min(100, baseGrowth + treeGrowthFromSoulEnergy);
  
  // Calculate number of green circles based on growth level
  const numberOfCircles = Math.min(7, 3 + Math.floor(treeGrowthFromSoulEnergy / 10));

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
        <div className="mb-8 flex justify-center">
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

        {/* Service Category Buttons */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">Explore Our Services</h2>
          
          {/* Three main category buttons */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <button 
              onClick={() => setActiveCategory('scan')}
              className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-purple-900/60 to-purple-700/60 hover:from-purple-800/70 hover:to-purple-600/70 transition-all shadow-lg p-6 border border-purple-500/30"
              data-testid="button-scan-category"
            >
              <Scan className="h-8 w-8 text-purple-300 mb-2" />
              <span className="text-sm text-purple-200 font-semibold">SCAN</span>
            </button>
            
            <button 
              onClick={() => setActiveCategory('connect')}
              className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-rose-900/60 to-rose-700/60 hover:from-rose-800/70 hover:to-rose-600/70 transition-all shadow-lg p-6 border border-rose-500/30"
              data-testid="button-connect-category"
            >
              <Users className="h-8 w-8 text-rose-300 mb-2" />
              <span className="text-sm text-rose-200 font-semibold">CONNECT</span>
            </button>
            
            <button 
              onClick={() => setActiveCategory('heal')}
              className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-green-900/60 to-green-700/60 hover:from-green-800/70 hover:to-green-600/70 transition-all shadow-lg p-6 border border-green-500/30"
              data-testid="button-heal-category"
            >
              <Heart className="h-8 w-8 text-green-300 mb-2" />
              <span className="text-sm text-green-200 font-semibold">HEAL</span>
            </button>
          </div>
        </div>

        {/* Bubble Overlay for SCAN */}
        {activeCategory === 'scan' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveCategory(null)}>
            <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setActiveCategory(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                data-testid="button-close-bubbles"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              <div className="grid grid-cols-5 gap-3">
                <Link href="/aura-analysis">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-purple-500/30 backdrop-blur-md border border-purple-400/40 p-4 hover:bg-purple-500/40 transition-all shadow-lg" data-testid="bubble-aura">
                    <Eye className="h-8 w-8 text-purple-200 mb-2" />
                    <span className="text-xs text-purple-100 font-medium text-center">Aura</span>
                  </div>
                </Link>
                
                <Link href="/vibe">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-cyan-500/30 backdrop-blur-md border border-cyan-400/40 p-4 hover:bg-cyan-500/40 transition-all shadow-lg" data-testid="bubble-vibe">
                    <Flame className="h-8 w-8 text-cyan-200 mb-2" />
                    <span className="text-xs text-cyan-100 font-medium text-center">Vibe</span>
                  </div>
                </Link>
                
                <Link href="/object-analysis">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-pink-500/30 backdrop-blur-md border border-pink-400/40 p-4 hover:bg-pink-500/40 transition-all shadow-lg" data-testid="bubble-object">
                    <Camera className="h-8 w-8 text-pink-200 mb-2" />
                    <span className="text-xs text-pink-100 font-medium text-center">Object</span>
                  </div>
                </Link>
                
                <Link href="/numerology">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/30 backdrop-blur-md border border-amber-400/40 p-4 hover:bg-amber-500/40 transition-all shadow-lg" data-testid="bubble-numbers">
                    <Calculator className="h-8 w-8 text-amber-200 mb-2" />
                    <span className="text-xs text-amber-100 font-medium text-center">Numbers</span>
                  </div>
                </Link>
                
                <Link href="/daily-horoscope">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-orange-500/30 backdrop-blur-md border border-orange-400/40 p-4 hover:bg-orange-500/40 transition-all shadow-lg" data-testid="bubble-stars">
                    <Star className="h-8 w-8 text-orange-200 mb-2" />
                    <span className="text-xs text-orange-100 font-medium text-center">Stars</span>
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
          <CardContent className="p-6">
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
              <div className="text-xs text-gray-200">
                {10 - (soulEnergy % 10)} more energy to grow your tree by 5%
              </div>
              <Progress value={(soulEnergy % 10) * 10} className="h-2 mt-2" />
            </div>
            
            <div className="flex flex-col items-center py-6">
              {/* Tree visualization */}
              <div className="relative mb-4">
                <div className="w-24 h-32 relative flex items-end justify-center">
                  {/* Tree trunk */}
                  <div className="w-8 h-16 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg absolute bottom-0"></div>
                  {/* Tree foliage - dynamic circles based on growth */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative w-20 h-20">
                      {/* Base circles */}
                      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-90"></div>
                      <div className="absolute top-2 right-0 w-14 h-14 bg-gradient-to-br from-lime-400 to-green-400 rounded-full opacity-90"></div>
                      <div className="absolute top-4 left-3 w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-90"></div>
                      
                      {/* Additional circles based on growth */}
                      {numberOfCircles >= 4 && (
                        <div className="absolute -top-2 left-8 w-10 h-10 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-90"></div>
                      )}
                      {numberOfCircles >= 5 && (
                        <div className="absolute top-6 right-2 w-9 h-9 bg-gradient-to-br from-lime-300 to-green-400 rounded-full opacity-90"></div>
                      )}
                      {numberOfCircles >= 6 && (
                        <div className="absolute top-8 left-1 w-8 h-8 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-90"></div>
                      )}
                      {numberOfCircles >= 7 && (
                        <div className="absolute -top-4 right-4 w-7 h-7 bg-gradient-to-br from-green-200 to-lime-300 rounded-full opacity-90"></div>
                      )}
                    </div>
                  </div>
                  {/* Sparkles */}
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute top-0 left-2 animate-pulse" />
                  <Sparkles className="h-3 w-3 text-yellow-300 absolute top-8 right-0 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <Sparkles className="h-3 w-3 text-yellow-400 absolute bottom-16 left-0 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>

              <h3 className="text-gray-200 font-semibold mb-2">Tree Growth</h3>
              <div className="text-green-100 text-sm font-medium mb-3">{totalTreeGrowth}% Complete</div>
              
              <div className="flex items-center gap-1 text-green-200 text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Your tree is flourishing with spiritual energy!</span>
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
            <CardContent className="p-4">
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

        {/* Energy Milestones */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 bg-amber-900/70 px-3 py-2 rounded-lg border border-amber-500/30">
            <Mountain className="h-5 w-5 text-amber-400" />
            <h2 className="text-amber-300 font-semibold">Energy Milestones</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-amber-900/70 to-yellow-900/70 border-amber-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-white font-semibold text-sm mb-1">Energy Master</h3>
                <p className="text-xs text-gray-300 mb-2">Reach 3000 total energy</p>
                <div className="text-xs text-amber-400 font-semibold">2847/3000</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/70 to-emerald-900/70 border-green-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">🌳</div>
                <h3 className="text-white font-semibold text-sm mb-1">Tree Guardian</h3>
                <p className="text-xs text-gray-300 mb-2">Grow tree to 100%</p>
                <div className="text-xs text-green-400 font-semibold">68/100%</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/70 to-pink-900/70 border-purple-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">🧘</div>
                <h3 className="text-white font-semibold text-sm mb-1">Soul Enlightened</h3>
                <p className="text-xs text-gray-300 mb-2">Use all energy types</p>
                <div className="text-xs text-purple-400 font-semibold">6/6 types</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/70 to-blue-900/70 border-cyan-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">⚖️</div>
                <h3 className="text-white font-semibold text-sm mb-1">Energy Harmony</h3>
                <p className="text-xs text-gray-300 mb-2">Balance all energies</p>
                <div className="text-xs text-cyan-400 font-semibold">In Progress</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
