import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wind, 
  Palette, 
  Book, 
  Heart, 
  HelpCircle, 
  ChevronRight,
  Play,
  Users,
  Mail,
  Phone
} from "lucide-react";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";

const helpSections = [
  {
    id: "breathing",
    title: "Breathing Techniques",
    description: "Learn powerful breathing methods",
    icon: Wind,
    color: "from-blue-400 to-cyan-400",
    items: [
      { name: "4-7-8 Breathing", duration: "5 min", description: "Calm your nervous system" },
      { name: "Box Breathing", duration: "8 min", description: "Navy SEAL technique for focus" },
      { name: "Alternate Nostril", duration: "10 min", description: "Balance your energy" },
      { name: "Belly Breathing", duration: "6 min", description: "Deep abdominal breathing" }
    ]
  },
  {
    id: "colors",
    title: "Color Meanings",
    description: "Explore spiritual color significance",
    icon: Palette,
    color: "from-pink-400 to-rose-400",
    items: [
      { name: "Red Energy", meaning: "Passion, strength, courage", chakra: "Root" },
      { name: "Orange Vitality", meaning: "Creativity, joy, enthusiasm", chakra: "Sacral" },
      { name: "Yellow Wisdom", meaning: "Intelligence, clarity, optimism", chakra: "Solar Plexus" },
      { name: "Green Healing", meaning: "Love, growth, harmony", chakra: "Heart" },
      { name: "Blue Truth", meaning: "Communication, peace, trust", chakra: "Throat" },
      { name: "Indigo Intuition", meaning: "Wisdom, spiritual insight", chakra: "Third Eye" },
      { name: "Violet Spirituality", meaning: "Divine connection, transformation", chakra: "Crown" }
    ]
  },
  {
    id: "guides",
    title: "Meditation Guides",
    description: "Step-by-step meditation instructions",
    icon: Book,
    color: "from-purple-400 to-violet-400",
    items: [
      { name: "Beginner's Guide", level: "Starter", description: "Your first meditation journey" },
      { name: "Chakra Meditation", level: "Intermediate", description: "Balance your energy centers" },
      { name: "Aura Cleansing", level: "Advanced", description: "Purify your energy field" },
      { name: "Mindfulness Practice", level: "All levels", description: "Present moment awareness" }
    ]
  },
  {
    id: "support",
    title: "Support & Contact",
    description: "Get help and connect with us",
    icon: Heart,
    color: "from-emerald-400 to-green-400",
    items: [
      { name: "FAQ", type: "Help", description: "Common questions answered" },
      { name: "Contact Support", type: "Email", description: "support@auraeye.com" },
      { name: "Community", type: "Connect", description: "Join our healing community" },
      { name: "Live Chat", type: "Help", description: "Real-time assistance" }
    ]
  }
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 pt-12 pb-8 px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Help & Resources</h1>
          <p className="text-gray-200">Guides, techniques, and support</p>
        </div>
      </div>

      {/* Help Sections */}
      <div className="px-6 py-6">
        <div className="space-y-4">
          {helpSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <Card 
                key={section.id} 
                className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md hover:shadow-lg transition-all duration-200"
                data-testid={`help-section-${section.id}`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setActiveSection(isActive ? null : section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mr-4 shadow-sm`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white" data-testid={`section-title-${section.id}`}>
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-gray-200">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        isActive ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>

                {isActive && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {section.items.map((item, index) => (
                        <div 
                          key={index}
                          className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30"
                          data-testid={`help-item-${section.id}-${index}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-1">{item.name}</h4>
                              <p className="text-sm text-gray-200 mb-2">
                                {'description' in item 
                                  ? item.description 
                                  : 'meaning' in item 
                                    ? item.meaning 
                                    : ''
                                }
                              </p>
                              
                              {/* Dynamic badges based on section type */}
                              <div className="flex gap-2">
                                {section.id === "breathing" && (
                                  <Badge variant="outline" className="text-xs">
                                    {(item as any).duration}
                                  </Badge>
                                )}
                                {section.id === "colors" && (
                                  <Badge variant="outline" className="text-xs">
                                    {(item as any).chakra} Chakra
                                  </Badge>
                                )}
                                {section.id === "guides" && (
                                  <Badge variant="outline" className="text-xs">
                                    {(item as any).level}
                                  </Badge>
                                )}
                                {section.id === "support" && (
                                  <Badge variant="outline" className="text-xs">
                                    {(item as any).type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {(section.id === "breathing" || section.id === "guides") && (
                              <Button 
                                size="sm" 
                                className={`bg-gradient-to-r ${section.color} text-white border-0 rounded-lg ml-4`}
                                data-testid={`start-${section.id}-${index}`}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            )}
                            
                            {section.id === "colors" && (
                              <Link href="/color-meanings">
                                <Button 
                                  size="sm" 
                                  className={`bg-gradient-to-r ${section.color} text-white border-0 rounded-lg ml-4`}
                                  data-testid={`explore-color-${index}`}
                                >
                                  Explore
                                </Button>
                              </Link>
                            )}
                            
                            {section.id === "support" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="ml-4 rounded-lg"
                                data-testid={`contact-${index}`}
                              >
                                {(item as any).type === "Email" ? <Mail className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick Access Links */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link href="/meditations">
            <Card className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200" data-testid="quick-meditations">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold">Meditations</h3>
                <p className="text-sm opacity-90">Guided sessions</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/healers">
            <Card className="bg-gradient-to-br from-purple-400 to-violet-400 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200" data-testid="quick-healers">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold">Find Healers</h3>
                <p className="text-sm opacity-90">Expert guidance</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}