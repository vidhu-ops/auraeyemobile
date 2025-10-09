import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  Activity
} from "lucide-react";
import logoImage from "@assets/new-logo.jpeg";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = ["Overview", "Soul Energy", "Bookings", "Activity", "Settings"];

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
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" data-testid="button-menu">
            <Menu className="h-4 w-4 text-white" />
          </button>
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
                <div className="text-2xl font-bold text-pink">0</div>
                <div className="text-xs text-purple-600">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink">87%</div>
                <div className="text-xs text-purple-600">Wellness Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink">12</div>
                <div className="text-xs text-purple-600">Day Streak</div>
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
          <Link href="/aura-analysis" data-testid="link-aura-scan">
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Camera className="h-8 w-8 text-black mx-auto mb-2" />
                <div className="text-black font-semibold mb-1">Aura Scan</div>
                <div className="text-purple-600 text-xs">Start reading</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/meditations" data-testid="link-meditation">
            <Card className="bg-gradient-to-br from-pink-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-black mx-auto mb-2" />
                <div className="text-black font-semibold mb-1">Meditation</div>
                <div className="text-pink-600 text-xs">5 min session</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/healers" data-testid="link-healers">
            <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-black mx-auto mb-2" />
                <div className="text-black font-semibold mb-1">Healers</div>
                <div className="text-cyan-600 text-xs">Connect now</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/journal" data-testid="link-journal">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-black mx-auto mb-2" />
                <div className="text-black font-semibold mb-1">Journal</div>
                <div className="text-amber-600 text-xs">Track progress</div>
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
