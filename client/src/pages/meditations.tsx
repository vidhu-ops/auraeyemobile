import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Zap, Bell, Wifi, Menu, Sparkles, Wind, Focus, Flame } from "lucide-react";
import MobileNavigation from "@/components/layout/mobile-navigation";
import logoImage from "@assets/new-logo.jpeg";

const meditationCategories = [
  { id: "all", name: "All", icon: Sparkles, color: "from-pink-500 to-rose-500" },
  { id: "breathe", name: "Breathe", icon: Wind, color: "from-red-500 to-pink-500" },
  { id: "focus", name: "Focus", icon: Focus, color: "from-purple-500 to-violet-500" },
  { id: "calm", name: "Calm", icon: Flame, color: "from-amber-500 to-orange-500" }
];

const meditations = [
  {
    id: 1,
    title: "Ethereal Dawn",
    author: "Luna Etherealis",
    duration: 10,
    difficulty: "Beginner",
    description: "Begin your day with a journey with luminous breathing that awakens yo...",
    category: "breathe",
    color: "from-cyan-400 to-blue-500",
    tag: "Breathing"
  },
  {
    id: 2,
    title: "Cosmic Focus",
    author: "Stellar Mind",
    duration: 15,
    difficulty: "Intermediate",
    description: "Channel the energy of distant stars to enhance your mental clarity an...",
    category: "focus",
    color: "from-purple-500 to-violet-600",
    tag: "Mindfulness"
  },
  {
    id: 3,
    title: "Serene Waters",
    author: "Ocean Guide",
    duration: 20,
    difficulty: "Beginner",
    description: "Flow with the gentle waves of tranquility and inner peace...",
    category: "calm",
    color: "from-blue-400 to-cyan-500",
    tag: "Relaxation"
  },
  {
    id: 4,
    title: "Sacred Flame",
    author: "Fire Keeper",
    duration: 12,
    difficulty: "Advanced",
    description: "Transform your energy through the power of inner fire...",
    category: "breathe",
    color: "from-orange-500 to-red-500",
    tag: "Energy"
  }
];

export default function MeditationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const filteredMeditations = selectedCategory === "all" 
    ? meditations 
    : meditations.filter(m => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-900 to-indigo-900 relative overflow-hidden">
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
      <div className="relative z-10 pb-32 px-4 pt-6">
        {/* Title with icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ethereal Meditations</h1>
          <p className="text-purple-200">Journey through dimensions of consciousness</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
          {meditationCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full min-w-fit flex items-center gap-2 ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} text-white border-0 shadow-md` 
                    : "bg-white/10 text-white border-white/20"
                }`}
                data-testid={`filter-${category.id}`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Meditation Cards */}
        <div className="space-y-4">
          {filteredMeditations.map((meditation) => (
            <Card 
              key={meditation.id}
              className={`bg-gradient-to-r ${meditation.color} border-0 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all`}
              data-testid={`meditation-card-${meditation.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all" data-testid={`play-${meditation.id}`}>
                    <Play className="h-6 w-6 text-white" fill="white" />
                  </button>

                  <div className="flex-1">
                    <h3 className="text-white text-lg font-bold mb-1">{meditation.title}</h3>
                    <p className="text-white/90 text-sm mb-2">by {meditation.author}</p>
                    <p className="text-white/80 text-xs mb-3">{meditation.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-white/90">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{meditation.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-300" />
                        <span className="text-xs text-white/90">{meditation.difficulty === 'Beginner' ? '4.9' : meditation.difficulty === 'Intermediate' ? '4.8' : '5.0'}</span>
                      </div>
                      <Badge className="bg-white/20 text-white text-xs border-0">
                        {meditation.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge className="bg-amber-500/90 text-white text-xs border-0 mb-2">
                      {meditation.tag}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add more meditations prompt */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            data-testid="button-load-more"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Explore More Meditations
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
