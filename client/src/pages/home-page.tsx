import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Heart, User, TrendingUp, Mountain, Zap, Bell, Wifi, Menu } from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";

export default function HomePage() {
  const { user } = useAuth();

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
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" data-testid="button-menu">
            <Menu className="h-4 w-4 text-white" />
          </button>
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
            
            <div className="flex flex-col items-center py-6">
              {/* Tree visualization */}
              <div className="relative mb-4">
                <div className="w-24 h-32 relative flex items-end justify-center">
                  {/* Tree trunk */}
                  <div className="w-8 h-16 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg absolute bottom-0"></div>
                  {/* Tree foliage - overlapping circles */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative w-20 h-20">
                      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-90"></div>
                      <div className="absolute top-2 right-0 w-14 h-14 bg-gradient-to-br from-lime-400 to-green-400 rounded-full opacity-90"></div>
                      <div className="absolute top-4 left-3 w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-90"></div>
                    </div>
                  </div>
                  {/* Sparkles */}
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute top-0 left-2 animate-pulse" />
                  <Sparkles className="h-3 w-3 text-yellow-300 absolute top-8 right-0 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <Sparkles className="h-3 w-3 text-yellow-400 absolute bottom-16 left-0 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>

              <h3 className="text-slate-700 font-semibold mb-2">Tree Growth</h3>
              <div className="text-green-600 text-sm font-medium mb-3">68% Complete</div>
              
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
