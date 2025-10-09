import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useCredits } from "@/hooks/use-credits";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Heart, User, TrendingUp, Mountain, Zap, Bell, Wifi, Menu, Camera, Star, Book, Calculator, Users, Home, LogOut, Settings } from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";
import { useState } from "react";

export default function HomePage() {
  const { user, logout } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { credits, isLoading: creditsLoading } = useCredits();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Calculate tree growth: 5% per 10 soul energy points
  const treeGrowthFromSoulEnergy = Math.floor(soulEnergy / 10) * 5;
  const baseGrowth = 50; // Starting growth percentage
  const totalTreeGrowth = Math.min(100, baseGrowth + treeGrowthFromSoulEnergy);
  
  // Calculate number of green circles based on growth level
  const numberOfCircles = Math.min(7, 3 + Math.floor(treeGrowthFromSoulEnergy / 10));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-1 flex items-center justify-center">
            <img src={logoImage} alt="AuraEye" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">AuraEye™</h1>
            <p className="text-cyan-300 text-xs">Ethereal Wellness</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" data-testid="button-notifications">
            <Zap className="h-4 w-4 text-cyan-400" />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center relative" data-testid="button-bell">
            <Bell className="h-4 w-4 text-white" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" data-testid="button-wifi">
            <Wifi className="h-4 w-4 text-green-400" />
          </button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" data-testid="button-menu">
                <Menu className="h-4 w-4 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 text-white border-l-slate-700">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-1 flex items-center justify-center">
                    <img src={logoImage} alt="AuraEye" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <span>AuraEye™</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {/* User Info */}
                {user && (
                  <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-400">Signed in as</p>
                    <p className="font-semibold text-white">{user.username}</p>
                    <div className="mt-2 flex gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Credits</p>
                        <p className="text-lg font-bold text-cyan-400">{credits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Soul Energy</p>
                        <p className="text-lg font-bold text-purple-400">{soulEnergy}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Menu Items */}
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-home">
                    <Home className="h-5 w-5 text-cyan-400" />
                    <span>Home</span>
                  </div>
                </Link>
                
                <Link href="/aura-analysis" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-aura">
                    <Camera className="h-5 w-5 text-purple-400" />
                    <span>Aura Analysis</span>
                  </div>
                </Link>
                
                <Link href="/daily-horoscope" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-horoscope">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span>Horoscope</span>
                  </div>
                </Link>
                
                <Link href="/numerology" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-numerology">
                    <Calculator className="h-5 w-5 text-indigo-400" />
                    <span>Numerology</span>
                  </div>
                </Link>
                
                <Link href="/journal" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-journal">
                    <Book className="h-5 w-5 text-green-400" />
                    <span>Spiritual Journal</span>
                  </div>
                </Link>
                
                <Link href="/healers" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-healers">
                    <Users className="h-5 w-5 text-pink-400" />
                    <span>Find Healers</span>
                  </div>
                </Link>
                
                <div className="border-t border-slate-700 my-4"></div>
                
                <Link href="/client-dashboard" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" data-testid="menu-dashboard">
                    <Settings className="h-5 w-5 text-slate-400" />
                    <span>Dashboard</span>
                  </div>
                </Link>
                
                {user && (
                  <button
                    onClick={() => {
                      logout?.();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
                    data-testid="menu-logout"
                  >
                    <LogOut className="h-5 w-5 text-red-400" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pb-32 px-4 pt-4">
        {/* Light Tree of Wisdom */}
        <Card className="bg-gradient-to-br from-green-50 to-cyan-50 border-green-200 mb-4 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-600" />
              <h2 className="text-green-800 font-semibold">Light Tree of Wisdom</h2>
            </div>
            
            {/* Soul Energy Display */}
            <div className="bg-gradient-to-r from-purple-100 to-cyan-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-slate-700 font-semibold">Soul Energy</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{soulEnergy}</div>
              </div>
              <div className="text-xs text-slate-600">
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

              <h3 className="text-slate-700 font-semibold mb-2">Tree Growth</h3>
              <div className="text-green-600 text-sm font-medium mb-3">{totalTreeGrowth}% Complete</div>
              
              <div className="flex items-center gap-1 text-green-700 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Your tree is flourishing with spiritual energy!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Sources */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-purple-600" />
            <h2 className="text-slate-800 font-semibold">Energy Sources</h2>
          </div>

          {/* Meditation Sessions Card */}
          <Card className="bg-white border-purple-100 mb-3 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-800 font-semibold mb-1">Meditation Sessions</h3>
                  <p className="text-slate-600 text-xs">Gain inner peace energy through mindful practice</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">34</div>
                  <div className="text-xs text-slate-500">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+25</div>
                  <div className="text-xs text-slate-500">Per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">850</div>
                  <div className="text-xs text-slate-500">Total Energy</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Energy Progress</span>
                  <span className="text-purple-600 font-semibold">100%</span>
                </div>
                <Progress value={100} className="h-2 bg-purple-100" />
              </div>
            </CardContent>
          </Card>

          {/* Healer Consultations Card */}
          <Card className="bg-white border-cyan-100 mb-3 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-800 font-semibold mb-1">Healer Consultations</h3>
                  <p className="text-slate-600 text-xs">Absorb healing energy from spiritual guides</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">8</div>
                  <div className="text-xs text-slate-500">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+50</div>
                  <div className="text-xs text-slate-500">Per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">400</div>
                  <div className="text-xs text-slate-500">Total Energy</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Energy Progress</span>
                  <span className="text-cyan-600 font-semibold">80%</span>
                </div>
                <Progress value={80} className="h-2 bg-cyan-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Services */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-slate-800 font-semibold">Quick Services</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/aura-analysis">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-md transition-all cursor-pointer" data-testid="service-aura">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Aura Analysis</h3>
                  <p className="text-xs text-slate-600 mt-1">15 credits</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/daily-horoscope">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-md transition-all cursor-pointer" data-testid="service-horoscope">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Horoscope</h3>
                  <p className="text-xs text-slate-600 mt-1">Free</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/numerology">
              <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200 hover:shadow-md transition-all cursor-pointer" data-testid="service-numerology">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Numerology</h3>
                  <p className="text-xs text-slate-600 mt-1">5 credits</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/healers">
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-md transition-all cursor-pointer" data-testid="service-healers">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Find Healers</h3>
                  <p className="text-xs text-slate-600 mt-1">3 credits</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* What's My Vibe - Quick Scan */}
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200 mb-4 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-purple-900 font-bold text-lg">What's My Vibe?</h2>
            </div>
            <p className="text-purple-700 text-sm mb-4">
              Quick aura color reading for just 1 credit! Upload your photo to discover your dominant energy.
            </p>
            <Link href="/aura-analysis">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700" data-testid="button-vibe-check">
                <Camera className="h-4 w-4 mr-2" />
                Start Vibe Check (1 credit)
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Energy Milestones */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 bg-amber-50 px-3 py-2 rounded-lg">
            <Mountain className="h-5 w-5 text-amber-600" />
            <h2 className="text-amber-800 font-semibold">Energy Milestones</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">Energy Master</h3>
                <p className="text-xs text-slate-600 mb-2">Reach 3000 total energy</p>
                <div className="text-xs text-amber-700 font-semibold">2847/3000</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">🌳</div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">Tree Guardian</h3>
                <p className="text-xs text-slate-600 mb-2">Grow tree to 100%</p>
                <div className="text-xs text-green-700 font-semibold">68/100%</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">🧘</div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">Soul Enlightened</h3>
                <p className="text-xs text-slate-600 mb-2">Use all energy types</p>
                <div className="text-xs text-purple-700 font-semibold">6/6 types</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">⚖️</div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">Energy Harmony</h3>
                <p className="text-xs text-slate-600 mb-2">Balance all energies</p>
                <div className="text-xs text-cyan-700 font-semibold">In Progress</div>
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
