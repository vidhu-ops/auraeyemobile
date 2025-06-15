import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, Heart, Briefcase, Activity, Sparkles, Clock, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

interface ExtendedHoroscopeResult {
  sign: string;
  date: string;
  daily: {
    reading: string;
    love: number;
    career: number;
    health: number;
    spirituality: number;
    luckyNumbers: number[];
    luckyColor: string;
    guidance: string;
  };
  monthly: {
    reading: string;
    themes: string[];
    opportunities: string;
    challenges: string;
    guidance: string;
    keyDates: string[];
  };
  yearly: {
    reading: string;
    majorThemes: string[];
    growthAreas: string[];
    relationships: string;
    career: string;
    health: string;
    spirituality: string;
    guidance: string;
  };
}

export default function PersonalizedHoroscope() {
  const { data: horoscope, isLoading, error } = useQuery<ExtendedHoroscopeResult>({
    queryKey: ["/api/personalized-horoscope"],
    retry: false,
  });

  const generateStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const zodiacEmojis: Record<string, string> = {
    aries: "♈",
    taurus: "♉",
    gemini: "♊",
    cancer: "♋",
    leo: "♌",
    virgo: "♍",
    libra: "♎",
    scorpio: "♏",
    sagittarius: "♐",
    capricorn: "♑",
    aquarius: "♒",
    pisces: "♓"
  };

  const getZodiacColor = (sign: string) => {
    const colors: Record<string, string> = {
      aries: "from-red-500 to-red-600",
      taurus: "from-green-500 to-green-600",
      gemini: "from-yellow-500 to-yellow-600",
      cancer: "from-blue-500 to-blue-600",
      leo: "from-orange-500 to-orange-600",
      virgo: "from-green-600 to-green-700",
      libra: "from-pink-500 to-pink-600",
      scorpio: "from-red-600 to-red-700",
      sagittarius: "from-purple-500 to-purple-600",
      capricorn: "from-gray-600 to-gray-700",
      aquarius: "from-blue-400 to-blue-500",
      pisces: "from-teal-500 to-teal-600"
    };
    return colors[sign] || "from-primary to-primary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Unable to Load Personalized Horoscope</h2>
              <p className="text-muted-foreground mb-4">
                Please ensure you have set your birth date in your profile to receive personalized horoscope readings.
              </p>
              <p className="text-sm text-muted-foreground">
                You can update your birth date in your account settings or during the registration process.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!horoscope) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Horoscope Data Available</h2>
              <p className="text-muted-foreground">
                Please try refreshing the page or contact support if the issue persists.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${getZodiacColor(horoscope.sign)} text-white text-3xl font-bold mb-4 shadow-lg`}>
            {zodiacEmojis[horoscope.sign] || "⭐"}
          </div>
          <h1 className="text-4xl font-bold mb-2 capitalize bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your {horoscope.sign} Horoscope
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            {horoscope.date}
          </p>
        </motion.div>

        {/* Horoscope Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Yearly
              </TabsTrigger>
            </TabsList>

            {/* Daily Tab */}
            <TabsContent value="daily" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Today's Reading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed">{horoscope.daily.reading}</p>
                  
                  {/* Energy Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <Heart className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                      <p className="text-sm font-medium mb-1">Love</p>
                      <div className="flex justify-center">
                        {generateStarRating(horoscope.daily.love)}
                      </div>
                    </div>
                    <div className="text-center">
                      <Briefcase className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium mb-1">Career</p>
                      <div className="flex justify-center">
                        {generateStarRating(horoscope.daily.career)}
                      </div>
                    </div>
                    <div className="text-center">
                      <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium mb-1">Health</p>
                      <div className="flex justify-center">
                        {generateStarRating(horoscope.daily.health)}
                      </div>
                    </div>
                    <div className="text-center">
                      <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm font-medium mb-1">Spirituality</p>
                      <div className="flex justify-center">
                        {generateStarRating(horoscope.daily.spirituality)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Lucky Elements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="text-primary">🎯</span>
                        Lucky Numbers
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {horoscope.daily.luckyNumbers.map((num, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="text-secondary">🎨</span>
                        Lucky Color
                      </h4>
                      <Badge variant="outline" className="text-sm">
                        {horoscope.daily.luckyColor}
                      </Badge>
                    </div>
                  </div>

                  {/* Daily Guidance */}
                  <div className="p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-accent">✨</span>
                      Personal Guidance
                    </h4>
                    <p className="text-sm leading-relaxed">{horoscope.daily.guidance}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monthly Tab */}
            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    This Month's Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed">{horoscope.monthly.reading}</p>
                  
                  {/* Monthly Themes */}
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-primary">🌟</span>
                      Key Themes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {horoscope.monthly.themes.map((theme, index) => (
                        <Badge key={index} variant="secondary" className="text-sm justify-start">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities & Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                        <span>🚀</span>
                        Opportunities
                      </h4>
                      <p className="text-sm text-green-700 leading-relaxed">{horoscope.monthly.opportunities}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700">
                        <span>⚡</span>
                        Challenges
                      </h4>
                      <p className="text-sm text-amber-700 leading-relaxed">{horoscope.monthly.challenges}</p>
                    </div>
                  </div>

                  {/* Key Dates */}
                  <div className="p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      Important Dates
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {horoscope.monthly.keyDates.map((date, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {date}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Guidance */}
                  <div className="p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-accent">✨</span>
                      Monthly Guidance
                    </h4>
                    <p className="text-sm leading-relaxed">{horoscope.monthly.guidance}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Yearly Tab */}
            <TabsContent value="yearly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    This Year's Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed">{horoscope.yearly.reading}</p>
                  
                  {/* Major Themes */}
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-primary">🌟</span>
                      Major Themes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {horoscope.yearly.majorThemes.map((theme, index) => (
                        <Badge key={index} variant="secondary" className="text-sm justify-start">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Growth Areas */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                      <span>🌱</span>
                      Growth Areas
                    </h4>
                    <div className="space-y-2">
                      {horoscope.yearly.growthAreas.map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-sm text-green-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Life Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-pink-700">
                          <Heart className="h-4 w-4" />
                          Relationships
                        </h4>
                        <p className="text-sm text-pink-700 leading-relaxed">{horoscope.yearly.relationships}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700">
                          <Briefcase className="h-4 w-4" />
                          Career
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed">{horoscope.yearly.career}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                          <Activity className="h-4 w-4" />
                          Health
                        </h4>
                        <p className="text-sm text-green-700 leading-relaxed">{horoscope.yearly.health}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700">
                          <Sparkles className="h-4 w-4" />
                          Spirituality
                        </h4>
                        <p className="text-sm text-purple-700 leading-relaxed">{horoscope.yearly.spirituality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Guidance */}
                  <div className="p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-accent">✨</span>
                      Yearly Guidance
                    </h4>
                    <p className="text-sm leading-relaxed">{horoscope.yearly.guidance}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}