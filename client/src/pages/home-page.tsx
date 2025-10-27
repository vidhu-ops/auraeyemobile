import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useCredits } from "@/hooks/use-credits";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Heart, User, TrendingUp, Mountain, Zap, Bell, Wifi, Menu, Camera, Star, Book, Calculator, Users, Home, LogOut, CreditCard, Eye, Scan, Sunrise, BookOpen, Brain, Palette, HelpCircle, Flame } from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";
import { useState } from "react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { credits, isLoading: creditsLoading } = useCredits();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Healers", href: "/healers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];
  
  // Calculate tree growth: 5% per 10 soul energy points
  const treeGrowthFromSoulEnergy = Math.floor(soulEnergy / 10) * 5;
  const baseGrowth = 50; // Starting growth percentage
  const totalTreeGrowth = Math.min(100, baseGrowth + treeGrowthFromSoulEnergy);
  
  // Calculate number of green circles based on growth level
  const numberOfCircles = Math.min(7, 3 + Math.floor(treeGrowthFromSoulEnergy / 10));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between">
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
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={closeMenu}
                    className="py-2 px-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50"
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex items-center space-x-2 px-2 py-2 bg-gray-100 rounded-lg mb-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{credits} credits</span>
                  </div>
                  <Link 
                    href={user?.userType === 'healer' ? "/healer-dashboard" : "/client-dashboard"} 
                    onClick={closeMenu}
                    className="block py-2 px-2 rounded-lg text-primary font-medium"
                  >
                    My Dashboard
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 px-2 mt-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pb-32 px-4 pt-4">
        {/* Welcome Section */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Hello, Welcome to Your Spiritual Space
          </h1>
          <p className="text-gray-300 text-sm">Your journey to inner peace and enlightenment begins here</p>
        </div>

        {/* Spiritual Illustration */}
        <div className="mb-6 flex justify-center">
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

        {/* Service Buttons Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">Explore Our Services</h2>
          
          {/* First Row - 5 icons */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            <Link href="/aura-analysis">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-900/50 to-purple-800/50 hover:from-purple-800/60 hover:to-purple-700/60 transition-all shadow-sm border border-purple-500/30" data-testid="button-aura-analysis">
                <Eye className="h-6 w-6 text-purple-300 mb-1" />
                <span className="text-xs text-purple-200 font-medium text-center">Aura</span>
              </button>
            </Link>
            
            <Link href="/vibe">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 hover:from-cyan-800/60 hover:to-cyan-700/60 transition-all shadow-sm border border-cyan-500/30" data-testid="button-vibe">
                <Flame className="h-6 w-6 text-cyan-300 mb-1" />
                <span className="text-xs text-cyan-200 font-medium text-center">Vibe</span>
              </button>
            </Link>
            
            <Link href="/object-analysis">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-pink-900/50 to-pink-800/50 hover:from-pink-800/60 hover:to-pink-700/60 transition-all shadow-sm border border-pink-500/30" data-testid="button-object-analysis">
                <Scan className="h-6 w-6 text-pink-300 mb-1" />
                <span className="text-xs text-pink-200 font-medium text-center">Object</span>
              </button>
            </Link>
            
            <Link href="/numerology">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-900/50 to-amber-800/50 hover:from-amber-800/60 hover:to-amber-700/60 transition-all shadow-sm border border-amber-500/30" data-testid="button-numerology">
                <Calculator className="h-6 w-6 text-amber-300 mb-1" />
                <span className="text-xs text-amber-200 font-medium text-center">Numbers</span>
              </button>
            </Link>
            
            <Link href="/daily-horoscope">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-orange-900/50 to-orange-800/50 hover:from-orange-800/60 hover:to-orange-700/60 transition-all shadow-sm border border-orange-500/30" data-testid="button-horoscope">
                <Sunrise className="h-6 w-6 text-orange-300 mb-1" />
                <span className="text-xs text-orange-200 font-medium text-center">Stars</span>
              </button>
            </Link>
          </div>

          {/* Second Row - 5 icons */}
          <div className="grid grid-cols-5 gap-3">
            <Link href="/journal">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-green-900/50 to-green-800/50 hover:from-green-800/60 hover:to-green-700/60 transition-all shadow-sm border border-green-500/30" data-testid="button-journal">
                <Book className="h-6 w-6 text-green-300 mb-1" />
                <span className="text-xs text-green-200 font-medium text-center">Journal</span>
              </button>
            </Link>
            
            <Link href="/meditations">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 hover:from-indigo-800/60 hover:to-indigo-700/60 transition-all shadow-sm border border-indigo-500/30" data-testid="button-meditations">
                <Brain className="h-6 w-6 text-indigo-300 mb-1" />
                <span className="text-xs text-indigo-200 font-medium text-center">Meditate</span>
              </button>
            </Link>
            
            <Link href="/healers">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-rose-900/50 to-rose-800/50 hover:from-rose-800/60 hover:to-rose-700/60 transition-all shadow-sm border border-rose-500/30" data-testid="button-healers">
                <Users className="h-6 w-6 text-rose-300 mb-1" />
                <span className="text-xs text-rose-200 font-medium text-center">Healers</span>
              </button>
            </Link>
            
            <Link href="/color-meanings">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-violet-900/50 to-violet-800/50 hover:from-violet-800/60 hover:to-violet-700/60 transition-all shadow-sm border border-violet-500/30" data-testid="button-colors">
                <Palette className="h-6 w-6 text-violet-300 mb-1" />
                <span className="text-xs text-violet-200 font-medium text-center">Colors</span>
              </button>
            </Link>
            
            <Link href="/help">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-teal-900/50 to-teal-800/50 hover:from-teal-800/60 hover:to-teal-700/60 transition-all shadow-sm border border-teal-500/30" data-testid="button-help">
                <HelpCircle className="h-6 w-6 text-teal-300 mb-1" />
                <span className="text-xs text-teal-200 font-medium text-center">Help</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Light Tree of Wisdom */}
        <Card className="bg-gradient-to-br from-green-900/30 to-cyan-900/30 border-green-500/30 mb-4 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-400" />
              <h2 className="text-green-300 font-semibold">Light Tree of Wisdom</h2>
            </div>
            
            {/* Soul Energy Display */}
            <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 rounded-xl p-4 mb-4 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-200 font-semibold">Soul Energy</span>
                </div>
                <div className="text-2xl font-bold text-purple-300">{soulEnergy}</div>
              </div>
              <div className="text-xs text-gray-300">
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
              <div className="text-green-400 text-sm font-medium mb-3">{totalTreeGrowth}% Complete</div>
              
              <div className="flex items-center gap-1 text-green-300 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Your tree is flourishing with spiritual energy!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Sources */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-purple-400" />
            <h2 className="text-white font-semibold">Energy Sources</h2>
          </div>

          {/* Meditation Sessions Card */}
          <Card className="bg-purple-900/30 border-purple-500/30 mb-3 shadow-lg">
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
          <Card className="bg-cyan-900/30 border-cyan-500/30 mb-3 shadow-lg">
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
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-white font-semibold">Quick Services</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/aura-analysis">
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer" data-testid="service-aura">
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
              <Card className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/20 transition-all cursor-pointer" data-testid="service-horoscope">
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
              <Card className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer" data-testid="service-numerology">
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
              <Card className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/20 transition-all cursor-pointer" data-testid="service-healers">
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

        {/* Energy Milestones */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 bg-amber-900/30 px-3 py-2 rounded-lg border border-amber-500/30">
            <Mountain className="h-5 w-5 text-amber-400" />
            <h2 className="text-amber-300 font-semibold">Energy Milestones</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-amber-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-white font-semibold text-sm mb-1">Energy Master</h3>
                <p className="text-xs text-gray-300 mb-2">Reach 3000 total energy</p>
                <div className="text-xs text-amber-400 font-semibold">2847/3000</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">🌳</div>
                <h3 className="text-white font-semibold text-sm mb-1">Tree Guardian</h3>
                <p className="text-xs text-gray-300 mb-2">Grow tree to 100%</p>
                <div className="text-xs text-green-400 font-semibold">68/100%</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <CardContent className="p-3">
                <div className="text-2xl mb-2">🧘</div>
                <h3 className="text-white font-semibold text-sm mb-1">Soul Enlightened</h3>
                <p className="text-xs text-gray-300 mb-2">Use all energy types</p>
                <div className="text-xs text-purple-400 font-semibold">6/6 types</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
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
