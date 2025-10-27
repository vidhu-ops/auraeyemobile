import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useCredits } from "@/hooks/use-credits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  MapPin,
  Calendar,
  Camera,
  Zap,
  Bell,
  Wifi,
  Menu,
  TrendingUp,
  Heart,
  Users,
  Activity,
  Sparkles,
  Circle,
  LogOut,
  CreditCard
} from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";

export default function ClientDashboard() {
  const { user, logoutMutation } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { credits, isLoading: creditsLoading } = useCredits();
  
  const [activeTab, setActiveTab] = useState("overview");
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

  const tabs = ["Overview", "Soul Energy", "Bookings", "Activity", "Settings"];
  
  // Calculate tree growth: 5% per 10 soul energy points
  const treeGrowthFromSoulEnergy = Math.floor(soulEnergy / 10) * 5;
  const baseGrowth = 50; // Starting growth percentage
  const totalTreeGrowth = Math.min(100, baseGrowth + treeGrowthFromSoulEnergy);
  
  // Calculate number of green circles based on growth level
  const numberOfCircles = Math.min(7, 3 + Math.floor(treeGrowthFromSoulEnergy / 10));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 relative overflow-hidden">
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
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" data-testid="button-dark-mode">
            <Zap className="h-4 w-4 text-cyan-400" />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center relative" data-testid="button-notifications">
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
                    href="/client-dashboard" 
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
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-blue-500 border-0 mb-4 shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          <CardContent className="px-6 pb-6 -mt-12 relative">
            <div className="flex items-end gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-200 to-purple-400 flex items-center justify-center text-2xl font-bold text-purple-700">
                    {user?.username?.charAt(0).toUpperCase() || 'V'}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center shadow-md" data-testid="button-edit-photo">
                  <Camera className="h-3 w-3 text-white" />
                </button>
              </div>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white text-xl font-bold">{user?.username || 'vidhu.gupta'}</h2>
                  
                </div>
                <p className="text-black-600 text-sm">{user?.email || 'vidhu.gupta@gmail.com'}</p>
              </div>
            </div>

           

            <p className="text-purple-600 text-sm italic mb-4">
              "On a journey of spiritual awakening and inner healing. Passionate about meditation, energy work, and connecting with like-minded souls."
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{creditsLoading ? '...' : credits}</div>
                <div className="text-xs text-purple-100">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{soulEnergyLoading ? '...' : soulEnergy}</div>
                <div className="text-xs text-purple-100">Soul Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalTreeGrowth}%</div>
                <div className="text-xs text-purple-100">Tree Growth</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.toLowerCase()
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

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

        {/* Spiritual Journey Progress */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="text-slate-800 font-semibold">Your Spiritual Journey Progress</h2>
          </div>

          <Card className="bg-white border-slate-200 mb-3 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-sm text-slate-600 mb-2">Meditation Hours</div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">120h</div>
                  <Progress value={75} className="h-2 bg-slate-100" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-2">Healers Consulted</div>
                  <div className="text-2xl font-bold text-cyan-600 mb-1">8</div>
                  <Progress value={50} className="h-2 bg-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-2">Aura Scans</div>
                  <div className="text-2xl font-bold text-indigo-600">15</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-2">Total Sessions</div>
                  <div className="text-2xl font-bold text-pink-600">45</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/vibe" data-testid="link-vibe">
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Circle className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">What's My Vibe</div>
                <div className="text-purple-200 text-xs">Quick scan</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/aura-analysis" data-testid="link-aura-scan">
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Aura Scan</div>
                <div className="text-indigo-200 text-xs">Start reading</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/meditations" data-testid="link-meditation">
            <Card className="bg-gradient-to-br from-pink-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Meditation</div>
                <div className="text-pink-200 text-xs">5 min session</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/healers" data-testid="link-healers">
            <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Healers</div>
                <div className="text-cyan-200 text-xs">Connect now</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/journal" data-testid="link-journal">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Journal</div>
                <div className="text-amber-200 text-xs">Track progress</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
