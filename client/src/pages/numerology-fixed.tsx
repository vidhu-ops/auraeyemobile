import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Calculator, Sparkles, Star, Heart, Crown, Eye, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { calculateNumerology, NumerologyResult } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const numerologySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
});

type NumerologyFormData = z.infer<typeof numerologySchema>;

export default function NumerologyPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<NumerologyFormData>({
    resolver: zodResolver(numerologySchema),
    defaultValues: {
      name: user?.username || "",
      birthDate: user?.birthDate || "",
    },
  });

  // Get numerology analysis
  const {
    data: numerology,
    isLoading: isLoadingNumerology,
    error: numerologyError,
    refetch: refetchNumerology
  } = useQuery<NumerologyResult>({
    queryKey: ["/api/numerology", user?.username, user?.birthDate],
    queryFn: () => calculateNumerology(user?.username || "", user?.birthDate || ""),
    enabled: !!(user?.birthDate && user?.username),
  });

  const onSubmit = async (data: NumerologyFormData) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access numerology analysis.",
        variant: "destructive",
      });
      // Redirect to login page
      window.location.href = "/api/login";
      return;
    }

    if (!data.name.trim() || !data.birthDate.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and birth date for analysis.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await calculateNumerology(data.name, data.birthDate);
      // Trigger a refetch with the new data
      refetchNumerology();
      setShowForm(false);
      toast({
        title: "Analysis Complete",
        description: "Your numerology analysis has been updated.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  const getLifePathMeaning = (number: number): string => {
    const meanings: { [key: number]: string } = {
      1: "Leadership and independence",
      2: "Cooperation and harmony",
      3: "Creativity and expression",
      4: "Stability and hard work",
      5: "Freedom and adventure",
      6: "Nurturing and responsibility",
      7: "Spirituality and analysis",
      8: "Material success and power",
      9: "Humanitarian service"
    };
    return meanings[number] || "Unique spiritual path";
  };

  const getDestinyMeaning = (number: number): string => {
    const meanings: { [key: number]: string } = {
      1: "To lead and inspire others",
      2: "To bring people together",
      3: "To create and communicate",
      4: "To build and organize",
      5: "To explore and educate",
      6: "To heal and nurture",
      7: "To seek truth and wisdom",
      8: "To achieve and empower",
      9: "To serve humanity"
    };
    return meanings[number] || "Special destiny path";
  };

  const calculatePersonalYear = (birthDate: string): number => {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const currentYear = 2025; // Current year for forecast
    
    // Correct calculation: current year + day + month, then reduce to single digit
    const totalSum = currentYear + day + month;
    const personalYear = reduceToSingleDigit(totalSum);
    return personalYear;
  };

  const calculatePersonalMonth = (personalYear: number, month: number): number => {
    const sum = personalYear + month;
    return reduceToSingleDigit(sum);
  };

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const calculateDominantSoulChakra = (birthDate: string): number => {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const sum = day + month + year.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return reduceToSingleDigit(sum);
  };

  const getPersonalYearMeaning = (year: number): { title: string; description: string; focus: string[] } => {
    const meanings: { [key: number]: { title: string; description: string; focus: string[] } } = {
      1: {
        title: "New Beginnings and Leadership",
        description: "Personal Year 1 is the beginning of a new 9-year cycle. Focus on independence, self-discovery, and asserting your personal power.",
        focus: ["Set clear, achievable goals", "Say yes to new opportunities", "Focus on personal health and vitality"]
      },
      2: {
        title: "Relationships, Sensitivity, and Patience", 
        description: "Personal Year 2 emphasizes cooperation, collaboration, and harmony. Focus on building meaningful connections.",
        focus: ["Practice active listening", "Journal about emotions daily", "Communicate boundaries clearly"]
      },
      3: {
        title: "Creativity, Expression, and Growth",
        description: "Personal Year 3 brings vibrant self-expression and creativity. Time to share your ideas with the world.",
        focus: ["Set weekly creative goals", "Surround yourself with inspiration", "Prioritize meaningful pursuits"]
      },
      4: {
        title: "Stability, Discipline, and Building Foundations", 
        description: "Personal Year 4 emphasizes hard work and structure. Focus on building solid foundations.",
        focus: ["Create clear action plans", "Establish productive routines", "Practice gratitude for progress"]
      },
      5: {
        title: "Freedom and Adaptability",
        description: "Personal Year 5 brings change and adventure. Embrace new experiences and authentic communication.",
        focus: ["Perform daily acts of kindness", "Express yourself truthfully", "Embrace flexibility"]
      },
      6: {
        title: "Responsibility, Nurturing, and Harmony",
        description: "Personal Year 6 focuses on family, home, and caregiving. Balance giving with self-care.",
        focus: ["Strengthen family bonds", "Engage in creative activities", "Set healthy boundaries"]
      },
      7: {
        title: "Spirituality and Analysis", 
        description: "Personal Year 7 is about introspection and spiritual development. Time for inner reflection.",
        focus: ["Take time for meditation", "Seek spiritual practices", "Trust your intuitive guidance"]
      },
      8: {
        title: "Material Success and Power",
        description: "Personal Year 8 brings focus on achievement and material success. Act with clarity and vision.",
        focus: ["Set ambitious but realistic goals", "Focus on financial planning", "Trust your business instincts"]
      },
      9: {
        title: "Humanitarian Service",
        description: "Personal Year 9 completes the cycle with service and letting go. Focus on what truly matters.",
        focus: ["Release what no longer serves", "Focus on humanitarian causes", "Prepare for new beginnings"]
      }
    };
    return meanings[year] || {
      title: "Universal Energy",
      description: "A year of unique spiritual development",
      focus: ["Trust your inner guidance", "Stay open to possibilities", "Practice mindfulness"]
    };
  };

  const getPersonalMonthMeaning = (month: number): { title: string; description: string; theme: string } => {
    const meanings: { [key: number]: { title: string; description: string; theme: string } } = {
      1: {
        title: "New Beginnings",
        description: "A month for fresh starts, new projects, and taking initiative. Focus on independence and leadership.",
        theme: "Initiative and Fresh Energy"
      },
      2: {
        title: "Cooperation and Balance",
        description: "A month for partnerships, collaboration, and building relationships. Focus on patience and diplomacy.",
        theme: "Harmony and Partnerships"
      },
      3: {
        title: "Creative Expression",
        description: "A month for artistic pursuits, communication, and social activities. Express your creativity freely.",
        theme: "Creativity and Communication"
      },
      4: {
        title: "Hard Work and Organization",
        description: "A month for building foundations, being practical, and focusing on details. Discipline brings rewards.",
        theme: "Structure and Foundation"
      },
      5: {
        title: "Freedom and Change",
        description: "A month for adventure, travel, and embracing change. Seek new experiences and variety.",
        theme: "Adventure and Flexibility"
      },
      6: {
        title: "Responsibility and Nurturing",
        description: "A month for family, home, and caring for others. Focus on service and creating harmony.",
        theme: "Service and Family"
      },
      7: {
        title: "Spiritual Reflection",
        description: "A month for introspection, research, and spiritual growth. Take time for inner development.",
        theme: "Wisdom and Introspection"
      },
      8: {
        title: "Material Achievement",
        description: "A month for business success, financial gains, and material accomplishments. Focus on practical results.",
        theme: "Success and Recognition"
      },
      9: {
        title: "Completion and Service",
        description: "A month for finishing projects, letting go, and humanitarian service. Prepare for new cycles.",
        theme: "Completion and Giving"
      }
    };
    return meanings[month] || {
      title: "Universal Flow",
      description: "A month of balanced energy and spiritual alignment",
      theme: "Harmony and Balance"
    };
  };

  const getNumberColorAssociation = (number: number): string => {
    const colorMap: { [key: number]: string } = {
      1: "Red", 2: "Orange", 3: "Yellow", 4: "Green", 5: "Blue", 
      6: "Indigo", 7: "Violet", 8: "Pink", 9: "Gold"
    };
    return colorMap[number] || "White";
  };

  const getVibrationQualities = (number: number): string[] => {
    const qualities: { [key: number]: string[] } = {
      1: ["Independent", "Leadership", "Pioneer", "Ambitious"],
      2: ["Cooperative", "Diplomatic", "Sensitive", "Peaceful"],
      3: ["Creative", "Expressive", "Optimistic", "Social"],
      4: ["Practical", "Organized", "Reliable", "Hard-working"],
      5: ["Adventurous", "Freedom-loving", "Versatile", "Progressive"],
      6: ["Nurturing", "Responsible", "Caring", "Harmonious"],
      7: ["Spiritual", "Analytical", "Introspective", "Mystical"],
      8: ["Ambitious", "Material-focused", "Powerful", "Successful"],
      9: ["Humanitarian", "Universal", "Compassionate", "Wise"]
    };
    return qualities[number] || ["Unique", "Special", "Individual"];
  };

  const getNumberMeaning = (number: number, type: string): { title: string; description: string } => {
    const meanings: { [key: string]: { [key: number]: { title: string; description: string } } } = {
      lifePath: {
        1: { title: "The Leader", description: "You are here to lead and inspire others with your independence and pioneering spirit." },
        2: { title: "The Cooperator", description: "Your path involves bringing people together and creating harmony through diplomacy." },
        3: { title: "The Creative", description: "You express yourself through creativity and bring joy to others through your optimism." },
        4: { title: "The Builder", description: "Your mission is to create stability and build lasting foundations for yourself and others." },
        5: { title: "The Explorer", description: "Freedom and adventure call to you as you seek to experience all life has to offer." },
        6: { title: "The Nurturer", description: "You are called to care for others and create harmony in family and community." },
        7: { title: "The Seeker", description: "Your path leads to spiritual wisdom and deep understanding of life's mysteries." },
        8: { title: "The Achiever", description: "Material success and personal power are your tools for making a significant impact." },
        9: { title: "The Humanitarian", description: "Your purpose is to serve humanity and contribute to the greater good." }
      },
      destiny: {
        1: { title: "Leadership Destiny", description: "You are destined to lead and inspire others through your unique vision." },
        2: { title: "Harmony Destiny", description: "Your destiny involves bringing peace and cooperation to the world." },
        3: { title: "Creative Destiny", description: "You are meant to express yourself creatively and inspire others through art." },
        4: { title: "Builder Destiny", description: "Your destiny is to create stable structures and systems that benefit many." },
        5: { title: "Freedom Destiny", description: "You are destined to explore new frontiers and share your discoveries." },
        6: { title: "Service Destiny", description: "Your purpose is to heal, nurture, and care for others in need." },
        7: { title: "Wisdom Destiny", description: "You are meant to seek and share spiritual truths and deeper understanding." },
        8: { title: "Success Destiny", description: "Your destiny involves achieving material success and empowering others." },
        9: { title: "Universal Destiny", description: "You are called to serve humanity and contribute to global healing." }
      }
    };
    return meanings[type]?.[number] || { title: "Unique Path", description: "Your journey is special and uniquely yours." };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Numerology Analysis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the hidden meanings in your numbers and unlock insights into your life path, 
          destiny, and spiritual journey through the ancient wisdom of numerology.
        </p>
      </div>

      {!user?.birthDate ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Please provide your birth date to calculate your numerology</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoadingNumerology}>
                  {isLoadingNumerology ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate My Numbers"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : isLoadingNumerology ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Calculating Your Numbers</h3>
          <p className="text-gray-600">Analyzing your spiritual blueprint...</p>
        </div>
      ) : numerology ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Core Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Your Core Numbers
              </CardTitle>
              <CardDescription>The fundamental aspects of your numerological profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">{numerology.lifePathNumber}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-purple-800 mb-1">Life Path Number</h3>
                    <p className="text-sm text-purple-600 mb-1">Your life's journey and core purpose</p>
                    <p className="text-xs text-purple-500">{getLifePathMeaning(numerology.lifePathNumber)}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">{numerology.destinyNumber}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-blue-800 mb-1">Destiny Number</h3>
                    <p className="text-sm text-blue-600 mb-1">Your life's mission and calling</p>
                    <p className="text-xs text-blue-500">{getDestinyMeaning(numerology.destinyNumber)}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">{numerology.personalityNumber}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-green-800 mb-1">Decision-Making Chakra</h3>
                    <p className="text-sm text-green-600 mb-1">Most of your decisions will be based on the qualities of this chakra</p>
                    <p className="text-xs text-green-500">Influences your decision-making patterns</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <div className="flex-shrink-0 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">{calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-red-800 mb-1">Dominant Soul Chakra</h3>
                    <p className="text-sm text-red-600 mb-1">Your soul wants you to operate from the positive and balanced qualities of that chakra</p>
                    <p className="text-xs text-red-500">Your greatest challenge area</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab-Based Numerology Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                Your Numerology Profile
              </CardTitle>
              <CardDescription>Based on your name and birth date</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="lifePath" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="lifePath">Life Path</TabsTrigger>
                  <TabsTrigger value="destiny">Destiny</TabsTrigger>
                  <TabsTrigger value="soulUrge">Soul Urge</TabsTrigger>
                  <TabsTrigger value="personality">Personality</TabsTrigger>
                  <TabsTrigger value="personalYear">Personal Year</TabsTrigger>
                </TabsList>

                {/* Life Path Tab */}
                <TabsContent value="lifePath" className="space-y-6 mt-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                         style={{ backgroundColor: getNumberColorAssociation(numerology.lifePathNumber).toLowerCase() === 'green' ? '#22c55e' : '#6366f1' }}>
                      {numerology.lifePathNumber}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Life Path Number: {numerology.lifePathNumber}</h3>
                    <p className="text-gray-600 mb-2">Associated Color: <span className="font-medium">{getNumberColorAssociation(numerology.lifePathNumber)}</span></p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.lifePathNumber, 'lifePath').title}</h4>
                    <p className="text-sm text-gray-700">{getNumberMeaning(numerology.lifePathNumber, 'lifePath').description}</p>
                  </div>

                  {/* Vibration Qualities */}
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3">Vibration Qualities</h4>
                    <div className="flex flex-wrap gap-2">
                      {getVibrationQualities(numerology.lifePathNumber).map((quality, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Destiny Tab */}
                <TabsContent value="destiny" className="space-y-6 mt-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                         style={{ backgroundColor: getNumberColorAssociation(numerology.destinyNumber).toLowerCase() === 'yellow' ? '#eab308' : '#3b82f6' }}>
                      {numerology.destinyNumber}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Destiny Number: {numerology.destinyNumber}</h3>
                    <p className="text-gray-600 mb-2">Associated Color: <span className="font-medium">{getNumberColorAssociation(numerology.destinyNumber)}</span></p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.destinyNumber, 'destiny').title}</h4>
                    <p className="text-sm text-gray-700">{getNumberMeaning(numerology.destinyNumber, 'destiny').description}</p>
                  </div>

                  {/* Vibration Qualities */}
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3">Vibration Qualities</h4>
                    <div className="flex flex-wrap gap-2">
                      {getVibrationQualities(numerology.destinyNumber).map((quality, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Soul Urge Tab */}
                <TabsContent value="soulUrge" className="space-y-6 mt-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                         style={{ backgroundColor: getNumberColorAssociation(numerology.soulUrgeNumber).toLowerCase() === 'violet' ? '#8b5cf6' : '#ec4899' }}>
                      {numerology.soulUrgeNumber}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Soul Urge Number: {numerology.soulUrgeNumber}</h3>
                    <p className="text-gray-600 mb-2">Associated Color: <span className="font-medium">{getNumberColorAssociation(numerology.soulUrgeNumber)}</span></p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Inner Desires and Motivations</h4>
                    <p className="text-sm text-gray-700">Your Soul Urge number reveals what your heart truly desires and what motivates you at the deepest level.</p>
                  </div>

                  {/* Vibration Qualities */}
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3">Vibration Qualities</h4>
                    <div className="flex flex-wrap gap-2">
                      {getVibrationQualities(numerology.soulUrgeNumber).map((quality, index) => (
                        <Badge key={index} variant="secondary" className="bg-violet-100 text-violet-800 border-violet-200">
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Personality Tab */}
                <TabsContent value="personality" className="space-y-6 mt-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                         style={{ backgroundColor: getNumberColorAssociation(numerology.personalityNumber).toLowerCase() === 'pink' ? '#ec4899' : '#f59e0b' }}>
                      {numerology.personalityNumber}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Personality Number: {numerology.personalityNumber}</h3>
                    <p className="text-gray-600 mb-2">Associated Color: <span className="font-medium">{getNumberColorAssociation(numerology.personalityNumber)}</span></p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">How Others See You</h4>
                    <p className="text-sm text-gray-700">Your Personality number represents the face you show to the world and how others perceive you.</p>
                  </div>

                  {/* Vibration Qualities */}
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3">Vibration Qualities</h4>
                    <div className="flex flex-wrap gap-2">
                      {getVibrationQualities(numerology.personalityNumber).map((quality, index) => (
                        <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Personal Year Tab */}
                <TabsContent value="personalYear" className="space-y-6 mt-6">
                  {(() => {
                    const personalYear = calculatePersonalYear(user?.birthDate || "1990-01-01");
                    const personalYearInfo = getPersonalYearMeaning(personalYear);
                    return (
                      <>
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            {personalYear}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Personal Year: {personalYear}</h3>
                          <p className="text-gray-600 mb-2">2025 Forecast</p>
                          <div className="text-sm text-gray-500 italic mb-4">
                            Based on your birth date and the current year
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                          <h4 className="font-semibold text-indigo-800 mb-3">{personalYearInfo.title}</h4>
                          <p className="text-sm text-indigo-700 mb-4">{personalYearInfo.description}</p>
                          
                          <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <h5 className="font-medium text-indigo-800 mb-3">Focus Areas for 2025</h5>
                            <ul className="space-y-2">
                              {personalYearInfo.focus.map((item, index) => (
                                <li key={index} className="flex items-start text-sm text-indigo-700">
                                  <span className="text-indigo-500 mr-2 mt-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Personal Month Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                          <h4 className="font-semibold text-blue-800 mb-4">Personal Month Forecast 2025</h4>
                          <p className="text-sm text-blue-700 mb-4">
                            Each month carries its own energy based on your Personal Year {personalYear}. The monthly cycle progresses from 1-9 and repeats.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              { name: "January", number: 1 },
                              { name: "February", number: 2 },
                              { name: "March", number: 3 },
                              { name: "April", number: 4 },
                              { name: "May", number: 5 },
                              { name: "June", number: 6 },
                              { name: "July", number: 7 },
                              { name: "August", number: 8 },
                              { name: "September", number: 9 },
                              { name: "October", number: 10 },
                              { name: "November", number: 11 },
                              { name: "December", number: 12 }
                            ].map((month) => {
                              const personalMonth = calculatePersonalMonth(personalYear, month.number);
                              const monthInfo = getPersonalMonthMeaning(personalMonth);
                              const currentMonth = new Date().getMonth() + 1;
                              const isCurrentMonth = month.number === currentMonth;
                              
                              return (
                                <div 
                                  key={month.name} 
                                  className={`bg-white rounded-lg p-4 border transition-all hover:shadow-md ${
                                    isCurrentMonth ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-blue-800">{month.name}</h5>
                                    {isCurrentMonth && (
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">Current</Badge>
                                    )}
                                  </div>
                                  
                                  <div className="text-center mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                      {personalMonth}
                                    </div>
                                    <div className="text-xs text-blue-600 font-medium">{monthInfo.theme}</div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h6 className="text-sm font-medium text-blue-800">{monthInfo.title}</h6>
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                      {monthInfo.description}
                                    </p>
                                  </div>
                                  
                                  <div className="mt-3 pt-2 border-t border-blue-100">
                                    <div className="text-xs text-blue-600">
                                      Personal Year {personalYear} + Month {month.number} = {personalMonth}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
                            <h5 className="font-medium text-blue-800 mb-2">How Personal Months Work</h5>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p>• Personal Month = Personal Year + Calendar Month (reduced to single digit)</p>
                              <p>• The cycle flows from 1-9 and repeats throughout the year</p>
                              <p>• Each month brings specific opportunities aligned with its numerological energy</p>
                              <p>• Use these monthly themes to plan important activities and decisions</p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Enter your birth date to discover your numerological profile.</p>
          <Button onClick={() => setShowForm(true)}>Get Started</Button>
        </div>
      )}
    </div>
  );
}