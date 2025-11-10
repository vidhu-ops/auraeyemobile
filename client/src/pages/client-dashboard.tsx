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
  CreditCard,
  Settings,
  BookOpen,
  Eye
} from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";
import AvatarSoulTree from "@/components/avatar-soul-tree";
import { getSoulEnergyMilestone, calculateTreeGrowth, getProgressToNextMilestone, energyMilestones, SOUL_ENERGY_PER_SCAN } from "@/lib/soul-energy-utils";

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
  
  // Use new milestone and tree growth system
  const milestone = getSoulEnergyMilestone(soulEnergy);
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestoneProgress = getProgressToNextMilestone(soulEnergy);

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
                <div className="text-2xl font-bold text-white">{Math.floor(treeGrowth)}%</div>
                <div className="text-xs text-purple-100">Tree Growth</div>
              </div>
            </div>
            
            {/* Milestone Badge */}
            <div className="mt-4 flex justify-center">
              <Badge className={`bg-gradient-to-r ${milestone.gradient} text-white px-4 py-1 text-sm font-semibold`}>
                {milestone.level} Level
              </Badge>
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

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Spiritual Journey Progress */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h2 className="text-white font-semibold">Your Spiritual Journey Progress</h2>
              </div>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-3 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Meditation Hours</div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">120h</div>
                      <Progress value={75} className="h-2 bg-slate-700" />
                    </div>
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Healers Consulted</div>
                      <div className="text-2xl font-bold text-cyan-400 mb-1">8</div>
                      <Progress value={50} className="h-2 bg-slate-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Aura Scans</div>
                      <div className="text-2xl font-bold text-indigo-400">15</div>
                    </div>
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Total Sessions</div>
                      <div className="text-2xl font-bold text-pink-400">45</div>
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

          <Link href="/object-analysis" data-testid="link-object-analysis">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Object Scan</div>
                <div className="text-amber-200 text-xs">Spiritual analysis</div>
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
          </>
        )}

        {/* Soul Energy Tab */}
        {activeTab === "soul energy" && (
          <div>
            {/* Milestone Progress */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-xl">Current Milestone</h2>
                    <p className="text-cyan-300 text-sm">{milestone.level}</p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${milestone.gradient} text-white px-4 py-2`}>
                    Level {energyMilestones.findIndex(m => m.level === milestone.level) + 1}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-200">Progress to Next Level</span>
                    <span className="text-white font-semibold">{milestoneProgress.current} / {milestoneProgress.total}</span>
                  </div>
                  <Progress value={milestoneProgress.percentage} className="h-3" />
                  <p className="text-xs text-cyan-300">
                    {milestone.max === Infinity ? 
                      `You've ascended! Keep growing your spiritual energy.` :
                      `${milestone.max - soulEnergy} more energy to reach ${energyMilestones[energyMilestones.findIndex(m => m.level === milestone.level) + 1]?.level || 'max level'}`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Soul Tree */}
            <Card className="bg-transparent border-0 mb-4">
              <CardContent className="p-0">
                <AvatarSoulTree soulEnergy={soulEnergy} />
              </CardContent>
            </Card>

            {/* Tree Growth Details */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-white font-bold text-lg mb-2">Soul Tree Growth</h3>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                    {Math.floor(treeGrowth)}%
                  </div>
                  <p className="text-cyan-300 text-sm">
                    {Math.floor((100 - treeGrowth) * 100)} more energy needed to reach 100%
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-cyan-400 text-2xl font-bold">{soulEnergy}</div>
                      <div className="text-xs text-cyan-200">Total Energy</div>
                    </div>
                    <div>
                      <div className="text-purple-400 text-2xl font-bold">+{SOUL_ENERGY_PER_SCAN}</div>
                      <div className="text-xs text-cyan-200">Per Scan</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-white font-bold text-xl mb-2">Healer Bookings</h3>
              <p className="text-cyan-300">Your upcoming sessions with healers will appear here</p>
            </CardContent>
          </Card>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-white font-bold text-xl mb-2">Recent Activity</h3>
              <p className="text-cyan-300">Your spiritual journey activities and history will appear here</p>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
              <h3 className="text-white font-bold text-xl mb-2">Profile Settings</h3>
              <p className="text-cyan-300">Manage your account preferences and spiritual journey settings</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
