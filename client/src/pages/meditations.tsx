import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Star, Filter } from "lucide-react";
import MobileNavigation from "@/components/layout/mobile-navigation";

const meditationCategories = [
  { id: "all", name: "All", color: "bg-gradient-to-r from-orange-400 to-pink-400" },
  { id: "breathe", name: "Breathe", color: "bg-gradient-to-r from-blue-400 to-cyan-400" },
  { id: "focus", name: "Focus", color: "bg-gradient-to-r from-purple-400 to-violet-400" },
  { id: "calm", name: "Calm", color: "bg-gradient-to-r from-green-400 to-emerald-400" },
  { id: "chakras", name: "Chakras", color: "bg-gradient-to-r from-indigo-400 to-purple-400" },
  { id: "aura", name: "Aura", color: "bg-gradient-to-r from-pink-400 to-rose-400" },
  { id: "crystals", name: "Crystals", color: "bg-gradient-to-r from-amber-400 to-yellow-400" }
];

const meditations = [
  {
    id: 1,
    title: "Morning Breathe",
    author: "Sarah Chen",
    duration: 10,
    rating: 4.9,
    category: "breathe",
    description: "Start your day with gentle breathing exercises",
    color: "from-orange-300 to-pink-200"
  },
  {
    id: 2,
    title: "Ocean Waves",
    author: "Alex River",
    duration: 15,
    rating: 4.8,
    category: "calm",
    description: "Relax with the sound of ocean waves",
    color: "from-blue-300 to-cyan-200"
  },
  {
    id: 3,
    title: "Chakra Alignment",
    author: "Luna Park",
    duration: 20,
    rating: 4.7,
    category: "chakras",
    description: "Balance your seven chakras with guided meditation",
    color: "from-purple-300 to-violet-200"
  },
  {
    id: 4,
    title: "Deep Focus",
    author: "Ocean Waves",
    duration: 30,
    rating: 4.9,
    category: "focus",
    description: "Enhance concentration and mental clarity",
    color: "from-indigo-300 to-blue-200"
  },
  {
    id: 5,
    title: "Aura Cleansing",
    author: "Forest Guide",
    duration: 12,
    rating: 4.6,
    category: "aura",
    description: "Cleanse and strengthen your energy field",
    color: "from-emerald-300 to-green-200"
  },
  {
    id: 6,
    title: "Crystal Healing",
    author: "Zen Master",
    duration: 18,
    rating: 4.5,
    category: "crystals",
    description: "Connect with crystal energies for healing",
    color: "from-pink-300 to-rose-200"
  }
];

export default function MeditationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const filteredMeditations = selectedCategory === "all" 
    ? meditations 
    : meditations.filter(m => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-100 to-pink-100 pt-12 pb-8 px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Meditations</h1>
          <p className="text-gray-600">Find your moment of peace</p>
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          {meditationCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap rounded-full min-w-fit ${
                selectedCategory === category.id 
                  ? `${category.color} text-white border-0 shadow-md` 
                  : "bg-white/70 text-gray-700 border-gray-200"
              }`}
              data-testid={`filter-${category.id}`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Meditation List */}
      <div className="px-6 py-6">
        <div className="space-y-4">
          {filteredMeditations.map((meditation) => (
            <Card key={meditation.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-200" data-testid={`meditation-${meditation.id}`}>
              <CardContent className="p-0">
                <div className="flex items-center p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meditation.color} flex items-center justify-center mr-4 shadow-sm`}>
                    <Play className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800" data-testid={`meditation-title-${meditation.id}`}>{meditation.title}</h3>
                      <span className="text-xs text-gray-500">Tap to expand</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">by {meditation.author}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {meditation.duration} min
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {meditation.rating}
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        {meditationCategories.find(c => c.id === meditation.category)?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Expandable content */}
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-600 mb-4">{meditation.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white border-0 rounded-xl" 
                    data-testid={`play-meditation-${meditation.id}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}