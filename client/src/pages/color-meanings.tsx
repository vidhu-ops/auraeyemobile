import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Heart, Zap, Eye, Crown, MessageCircle, Sun, Star, Moon, CircleDot } from "lucide-react";
import { Link } from "wouter";
import MobileNavigation from "@/components/layout/mobile-navigation";

const colorMeanings = [
  {
    id: "red",
    name: "Red",
    chakra: "Root",
    icon: Zap,
    gradient: "from-red-400 to-red-600",
    bgGradient: "from-red-50 to-red-100",
    meaning: "Passion, Strength, Courage",
    description: "Red represents life force energy, passion, and physical strength. It's connected to survival instincts and grounding.",
    positiveTraits: ["Leadership", "Courage", "Determination", "Physical strength", "Survival instincts"],
    negativeTraits: ["Aggression", "Impatience", "Anger", "Restlessness", "Impulsiveness"],
    chakraDescription: "Root Chakra - Foundation and feeling of being grounded",
    keywords: ["Energy", "Passion", "Power", "Strength", "Vitality"]
  },
  {
    id: "orange",
    name: "Orange",
    chakra: "Sacral",
    icon: Sun,
    gradient: "from-orange-400 to-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
    meaning: "Creativity, Joy, Enthusiasm",
    description: "Orange embodies creativity, joy, and emotional balance. It represents artistic expression and social connection.",
    positiveTraits: ["Creativity", "Enthusiasm", "Joy", "Social skills", "Confidence"],
    negativeTraits: ["Restlessness", "Superficiality", "Dependency", "Exhibitionism", "Drama"],
    chakraDescription: "Sacral Chakra - Creativity and sexual energy",
    keywords: ["Creativity", "Joy", "Warmth", "Confidence", "Expression"]
  },
  {
    id: "yellow",
    name: "Yellow",
    chakra: "Solar Plexus",
    icon: Sun,
    gradient: "from-yellow-400 to-yellow-600",
    bgGradient: "from-yellow-50 to-yellow-100",
    meaning: "Intelligence, Clarity, Optimism",
    description: "Yellow represents mental clarity, wisdom, and personal power. It's the color of intellectual energy and optimism.",
    positiveTraits: ["Intelligence", "Optimism", "Mental clarity", "Personal power", "Wisdom"],
    negativeTraits: ["Criticism", "Judgment", "Overthinking", "Anxiety", "Ego"],
    chakraDescription: "Solar Plexus Chakra - Personal power and confidence",
    keywords: ["Wisdom", "Clarity", "Power", "Intelligence", "Optimism"]
  },
  {
    id: "green",
    name: "Green",
    chakra: "Heart",
    icon: Heart,
    gradient: "from-green-400 to-green-600",
    bgGradient: "from-green-50 to-green-100",
    meaning: "Love, Growth, Harmony",
    description: "Green represents love, healing, and growth. It's the color of balance, harmony, and natural healing energy.",
    positiveTraits: ["Love", "Compassion", "Growth", "Healing", "Balance"],
    negativeTraits: ["Jealousy", "Envy", "Possessiveness", "Codependency", "Stagnation"],
    chakraDescription: "Heart Chakra - Love and connection",
    keywords: ["Love", "Healing", "Growth", "Balance", "Nature"]
  },
  {
    id: "blue",
    name: "Blue",
    chakra: "Throat",
    icon: MessageCircle,
    gradient: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    meaning: "Communication, Peace, Trust",
    description: "Blue represents truth, communication, and peace. It's connected to self-expression and authentic communication.",
    positiveTraits: ["Communication", "Truth", "Peace", "Trust", "Loyalty"],
    negativeTraits: ["Sadness", "Depression", "Rigidity", "Cold", "Melancholy"],
    chakraDescription: "Throat Chakra - Communication and truth",
    keywords: ["Truth", "Communication", "Peace", "Trust", "Calm"]
  },
  {
    id: "indigo",
    name: "Indigo",
    chakra: "Third Eye",
    icon: Eye,
    gradient: "from-indigo-400 to-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100",
    meaning: "Intuition, Wisdom, Spirituality",
    description: "Indigo represents intuition, spiritual wisdom, and psychic abilities. It's the color of deep inner knowing.",
    positiveTraits: ["Intuition", "Wisdom", "Spirituality", "Psychic abilities", "Deep thinking"],
    negativeTraits: ["Confusion", "Impracticality", "Spaciness", "Withdrawal", "Dogmatism"],
    chakraDescription: "Third Eye Chakra - Intuition and insight",
    keywords: ["Intuition", "Wisdom", "Insight", "Spirituality", "Vision"]
  },
  {
    id: "violet",
    name: "Violet",
    chakra: "Crown",
    icon: Crown,
    gradient: "from-violet-400 to-violet-600",
    bgGradient: "from-violet-50 to-violet-100",
    meaning: "Divine Connection, Transformation",
    description: "Violet represents spiritual connection, transformation, and divine wisdom. It's the highest frequency color in the spectrum.",
    positiveTraits: ["Spirituality", "Transformation", "Divine connection", "Wisdom", "Enlightenment"],
    negativeTraits: ["Disconnection", "Impracticality", "Superiority", "Isolation", "Fanaticism"],
    chakraDescription: "Crown Chakra - Spiritual connection",
    keywords: ["Divine", "Spiritual", "Transformation", "Enlightenment", "Unity"]
  },
  {
    id: "gold",
    name: "Gold",
    chakra: "Solar/Crown",
    icon: Star,
    gradient: "from-yellow-400 to-amber-500",
    bgGradient: "from-amber-50 to-yellow-100",
    meaning: "Abundance, Wisdom, Success",
    description: "Gold represents divine wisdom, abundance, and spiritual illumination. It's the color of enlightenment, success, and higher consciousness.",
    positiveTraits: ["Abundance", "Wisdom", "Success", "Illumination", "Divine protection"],
    negativeTraits: ["Materialism", "Arrogance", "Obsession with status", "Greed", "Ego inflation"],
    chakraDescription: "Solar & Crown Chakra - Divine wisdom and personal power",
    keywords: ["Abundance", "Wisdom", "Success", "Illumination", "Prosperity"]
  },
  {
    id: "silver",
    name: "Silver",
    chakra: "Third Eye/Crown",
    icon: Moon,
    gradient: "from-slate-300 to-slate-400",
    bgGradient: "from-slate-50 to-gray-100",
    meaning: "Intuition, Reflection, Balance",
    description: "Silver represents lunar energy, intuition, and feminine wisdom. It's the color of reflection, mystery, and psychic sensitivity.",
    positiveTraits: ["Intuition", "Psychic abilities", "Emotional balance", "Reflection", "Feminine energy"],
    negativeTraits: ["Indecisiveness", "Emotional instability", "Illusion", "Confusion", "Over-sensitivity"],
    chakraDescription: "Third Eye & Crown Chakra - Intuition and spiritual reflection",
    keywords: ["Intuition", "Moon", "Reflection", "Mystery", "Balance"]
  },
  {
    id: "white",
    name: "White",
    chakra: "Crown/All",
    icon: CircleDot,
    gradient: "from-white to-slate-100",
    bgGradient: "from-white to-gray-50",
    meaning: "Purity, Truth, Divine Light",
    description: "White represents purity, divine light, and spiritual wholeness. It contains all colors and symbolizes the highest spiritual attainment and protection.",
    positiveTraits: ["Purity", "Truth", "Divine protection", "Clarity", "Spiritual wholeness"],
    negativeTraits: ["Coldness", "Isolation", "Emptiness", "Detachment", "Sterility"],
    chakraDescription: "Crown Chakra & All Chakras - Divine light and spiritual unity",
    keywords: ["Purity", "Light", "Truth", "Protection", "Wholeness"]
  }
];

export default function ColorMeaningsPage() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const selectedColorData = selectedColor ? colorMeanings.find(c => c.id === selectedColor) : null;

  if (selectedColorData) {
    const Icon = selectedColorData.icon;
    
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 pb-20`}>
        {/* Header */}
        <div className="pt-12 pb-8 px-6">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedColor(null)}
              className="mr-3 text-gray-200"
              data-testid="back-to-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Color Details</h1>
          </div>

          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${selectedColorData.gradient} rounded-full flex items-center justify-center shadow-lg`}>
              <Icon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedColorData.name}</h2>
            <p className="text-lg text-gray-200 mb-4">{selectedColorData.meaning}</p>
            <Badge className={`bg-gradient-to-r ${selectedColorData.gradient} text-white border-0`}>
              {selectedColorData.chakra} Chakra
            </Badge>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="px-6 space-y-6">
          {/* Description */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Meaning & Significance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 leading-relaxed">{selectedColorData.description}</p>
            </CardContent>
          </Card>

          {/* Chakra Information */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">{selectedColorData.chakra} Chakra</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 leading-relaxed">{selectedColorData.chakraDescription}</p>
            </CardContent>
          </Card>

          {/* Positive Traits */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Positive Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedColorData.positiveTraits.map((trait, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Areas to Watch */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Areas to Watch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedColorData.negativeTraits.map((trait, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Key Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedColorData.keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    className={`bg-gradient-to-r ${selectedColorData.gradient} text-white border-0`}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-950/50 to-teal-900/50 pt-12 pb-8 px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Colours</h1>
          <p className="text-gray-200">Visualise these colours in your aura during meditation.</p>
        </div>
      </div>

      {/* Color Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-4">
          {colorMeanings.map((color) => {
            const Icon = color.icon;
            
            return (
              <Card 
                key={color.id}
                className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedColor(color.id)}
                data-testid={`color-${color.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color.gradient} flex items-center justify-center mr-4 shadow-sm`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1" data-testid={`color-name-${color.id}`}>
                        {color.name}
                      </h3>
                      
                      <p className="text-gray-200 mb-2">for {color.meaning}</p>
                      <Badge variant="outline" className="text-xs">
                        {color.chakra} Chakra
                      </Badge>
                    </div>
                    
                    <div className="text-gray-400">
                      <span className="text-sm">Tap to explore</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom spacing */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm">
            Tap any color to learn more about its spiritual meaning and chakra connection
          </p>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}