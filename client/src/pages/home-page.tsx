import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, Zap, Bell, Wifi, Menu, Volume2, Shield, Music, TrendingUp, Activity, Heart, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/new-logo.jpeg";

export default function HomePage() {
  const { user } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  
  const [meditationMusic, setMeditationMusic] = useState(true);
  const [auraDisplay, setAuraDisplay] = useState(true);
  const [energyShield, setEnergyShield] = useState(false);

  // Current spiritual state
  const spiritualState = {
    temperature: "25°",
    status: "Enlightened",
    description: "Clear aura with high spiritual visibility"
  };

  // Energy insights data
  const energyInsights = [
    {
      icon: Zap,
      title: "High",
      subtitle: "Energy",
      value: "+12%",
      color: "from-blue-500/20 to-purple-500/20",
      iconColor: "text-yellow-400",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Activity,
      title: "87%",
      subtitle: "Balance",
      value: "+3%",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30"
    },
    {
      icon: Shield,
      title: "Strong",
      subtitle: "Strength",
      value: "Stable",
      color: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30"
    }
  ];

  // Live sessions data
  const liveSessions = [
    {
      id: 1,
      title: "Daily Ritual",
      subtitle: "Morning Energy Alignment",
      duration: "15 min",
      participants: "2.3k active",
      status: "Live",
      color: "from-orange-500 to-pink-500"
    },
    {
      id: 2,
      title: "Evening Meditation",
      subtitle: "Deep Relaxation Session",
      duration: "30 min",
      participants: "1.8k active",
      status: "Live",
      color: "from-purple-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Glowing background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pb-24 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-2 flex items-center justify-center shadow-lg">
              <img src={logoImage} alt="AuraEye" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AuraEye™</h1>
              <p className="text-cyan-300 text-xs">Ethereal Wellness</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-white text-sm font-semibold">{soulEnergyLoading ? '...' : soulEnergy?.level || 0}</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center relative" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center" data-testid="button-wifi">
              <Wifi className="h-5 w-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center" data-testid="button-menu">
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border-white/20 mb-6 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-5xl font-bold text-white mb-2">{spiritualState.temperature}</h2>
                <p className="text-cyan-300 text-lg font-medium mb-4">{spiritualState.status}</p>
                <p className="text-white/80 text-sm">{spiritualState.description}</p>
              </div>
              
              <button className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 backdrop-blur-sm border-2 border-cyan-400/50 flex items-center justify-center shadow-lg hover:shadow-cyan-400/50 transition-all" data-testid="button-eye">
                <Eye className="h-12 w-12 text-cyan-300" />
                <span className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
              </button>
            </div>

            {/* Control Toggles */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-white/80" />
                  <span className="text-white font-medium">Meditation Music</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${meditationMusic ? 'bg-cyan-400/30 text-cyan-300' : 'bg-white/10 text-white/50'}`}>
                    {meditationMusic ? 'ON' : 'OFF'}
                  </span>
                  <Switch 
                    checked={meditationMusic} 
                    onCheckedChange={setMeditationMusic}
                    data-testid="switch-meditation-music"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-white/80" />
                  <span className="text-white font-medium">Aura Display</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${auraDisplay ? 'bg-cyan-400/30 text-cyan-300' : 'bg-white/10 text-white/50'}`}>
                    {auraDisplay ? 'AUTO' : 'OFF'}
                  </span>
                  <Switch 
                    checked={auraDisplay} 
                    onCheckedChange={setAuraDisplay}
                    data-testid="switch-aura-display"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-white/80" />
                  <span className="text-white font-medium">Energy Shield</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${energyShield ? 'bg-cyan-400/30 text-cyan-300' : 'bg-white/10 text-white/50'}`}>
                    {energyShield ? 'ON' : 'OFF'}
                  </span>
                  <Switch 
                    checked={energyShield} 
                    onCheckedChange={setEnergyShield}
                    data-testid="switch-energy-shield"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Insights Section */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-4">Energy Insights</h3>
          <div className="grid grid-cols-3 gap-3">
            {energyInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Card 
                  key={index} 
                  className={`bg-gradient-to-br ${insight.color} backdrop-blur-md border ${insight.borderColor} shadow-xl`}
                  data-testid={`card-insight-${index}`}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-8 w-8 ${insight.iconColor} mx-auto mb-2`} />
                    <h4 className="text-white font-bold text-lg mb-1">{insight.title}</h4>
                    <p className="text-white/70 text-xs mb-2">{insight.subtitle}</p>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-cyan-400" />
                      <span className="text-cyan-300 text-xs font-semibold">{insight.value}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Live Sessions Section */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-4">Live Sessions</h3>
          <div className="space-y-3">
            {liveSessions.map((session) => (
              <Card 
                key={session.id} 
                className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-xl"
                data-testid={`card-session-${session.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${session.color} flex items-center justify-center shadow-lg`}>
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-base mb-1">{session.title}</h4>
                      <p className="text-white/70 text-sm mb-2">{session.subtitle}</p>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {session.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {session.participants}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {session.status}
                      </span>
                      <button className="text-cyan-400 hover:text-cyan-300 transition-colors" data-testid={`button-session-${session.id}`}>
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
