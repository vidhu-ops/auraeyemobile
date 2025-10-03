import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Scan,
  Palette,
  Heart,
  Users,
  User,
  TrendingUp,
  Settings,
  Bell,
  Zap,
  Volume2,
  HelpCircle,
  ChevronLeft,
  Eye
} from "lucide-react";

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  details: string;
  status: 'pending' | 'done';
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const [location, navigate] = useLocation();

  // Control center buttons
  const controlButtons = [
    { icon: Home, label: "Home", href: "/", testId: "control-home" },
    { icon: Scan, label: "Scan", href: "/aura-analysis", testId: "control-scan", highlight: false },
    { icon: Palette, label: "Colors", href: "/color-meanings", testId: "control-colors" },
    { icon: Heart, label: "Meditate", href: "/meditations", testId: "control-meditate" },
    { icon: Users, label: "Healers", href: "/healers", testId: "control-healers", badge: 3 },
    { icon: User, label: "Profile", href: "/client-dashboard", testId: "control-profile", highlight: true },
    { icon: TrendingUp, label: "Stats", href: "/journal", testId: "control-stats" },
    { icon: Settings, label: "Settings", href: "/help", testId: "control-settings" },
    { icon: Bell, label: "Alerts", href: "/help", testId: "control-alerts" },
    { icon: Zap, label: "Energy", href: "/", testId: "control-energy" },
    { icon: Volume2, label: "Sound", href: "/help", testId: "control-sound" },
    { icon: HelpCircle, label: "Help", href: "/help", testId: "control-help" }
  ];

  // Today's schedule
  const todaySchedule: ScheduleItem[] = [
    {
      id: 1,
      time: "7:00pm",
      title: "Evening Meditation",
      details: "3 scenes, 11 accessories",
      status: "pending"
    },
    {
      id: 2,
      time: "1:00pm",
      title: "Energy Boost",
      details: "1 scene, 2 accessories",
      status: "done"
    },
    {
      id: 3,
      time: "11:00pm",
      title: "Sleep Ritual",
      details: "2 scenes, 8 accessories",
      status: "pending"
    }
  ];

  const handleControlClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pb-24 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
            data-testid="button-back"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          
          <h1 className="text-cyan-300 text-xl font-semibold">Control Center</h1>

          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-cyan-400/50 flex items-center justify-center shadow-lg" data-testid="button-profile">
            <User className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Control Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {controlButtons.map((button, index) => {
            const Icon = button.icon;
            const isHighlighted = button.highlight || (button.href === location);
            
            return (
              <button
                key={index}
                onClick={() => handleControlClick(button.href)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                  isHighlighted
                    ? 'bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30'
                }`}
                data-testid={button.testId}
              >
                {button.badge && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {button.badge}
                  </span>
                )}
                <Icon className={`h-7 w-7 mb-2 ${isHighlighted ? 'text-cyan-300' : 'text-white/70'}`} />
                <span className={`text-xs font-medium ${isHighlighted ? 'text-white' : 'text-white/70'}`}>
                  {button.label}
                </span>
                {index === 1 && (
                  <span className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Today's Schedule Section */}
        <div className="mb-6">
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
            Today's Schedule
          </h2>
          
          <div className="space-y-3">
            {todaySchedule.map((item) => (
              <Card 
                key={item.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all"
                data-testid={`schedule-${item.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className={`w-2 h-2 rounded-full mt-2 ${
                        item.status === 'done' ? 'bg-green-400' : 'bg-cyan-400'
                      } animate-pulse`}></span>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-semibold text-lg">{item.time}</span>
                        </div>
                        <h3 className="text-white font-medium mb-1">{item.title}</h3>
                        <p className="text-white/60 text-sm">{item.details}</p>
                      </div>
                    </div>

                    <Badge 
                      variant={item.status === 'done' ? 'secondary' : 'outline'}
                      className={`${
                        item.status === 'done' 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                          : 'bg-white/5 text-white/70 border-white/20'
                      }`}
                    >
                      {item.status === 'done' ? 'Done' : 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Soul Energy Section */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-500/30 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-cyan-300 text-lg font-semibold">Soul Energy</h3>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-400" />
                <span className="text-white font-bold">
                  {soulEnergyLoading ? '...' : soulEnergy?.level || 0}
                </span>
              </div>
            </div>
            
            <Progress 
              value={soulEnergyLoading ? 0 : ((soulEnergy?.level || 0) / 10) * 100} 
              className="h-2 mb-3 bg-white/10"
            />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Level 7 Mystic</span>
              <span className="text-cyan-300 font-semibold">
                {soulEnergyLoading ? '...' : `${soulEnergy?.level || 0}/1000`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/aura-analysis" data-testid="link-quick-scan">
            <button className="w-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 text-white font-medium hover:border-purple-500/50 transition-all" data-testid="button-quick-scan">
              <Scan className="h-6 w-6 mx-auto mb-2 text-purple-400" />
              Quick Scan
            </button>
          </Link>
          
          <Link href="/meditations" data-testid="link-meditate-now">
            <button className="w-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 text-white font-medium hover:border-cyan-500/50 transition-all" data-testid="button-meditate-now">
              <Heart className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
              Meditate Now
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
