import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Calculator, Sparkles } from "lucide-react";
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

  const chakraColors = {
    root: "#E53E3E",
    sacral: "#FF8C00", 
    solarPlexus: "#FFD700",
    heart: "#38A169",
    throat: "#3182CE",
    thirdEye: "#805AD5",
    crown: "#B794F6",
    earthstar: "#A0AEC0",
    soulstar: "#718096",
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
      1: "Pioneer and innovator",
      2: "Diplomat and peacemaker",
      3: "Artist and communicator",
      4: "Builder and organizer",
      5: "Explorer and freedom seeker",
      6: "Healer and caretaker",
      7: "Seeker of truth and wisdom",
      8: "Executive and achiever",
      9: "Humanitarian and server"
    };
    return meanings[number] || "Special destiny path";
  };

  const calculatePersonalYear = (birthDate: string): number => {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const currentYear = 2025; // Current year for forecast
    
    // Step 1: Add day + month
    const dayMonthSum = day + month;
    const dayMonthReduced = reduceToSingleDigit(dayMonthSum);
    
    // Step 2: Add current year digits
    const yearSum = currentYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    
    // Step 3: Combine and reduce
    const personalYear = reduceToSingleDigit(dayMonthReduced + yearSum);
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
    // Sum all digits in birth date (e.g., 01/01/1901 = 0+1+0+1+1+9+0+1 = 13 = 1+3 = 4)
    const dateStr = birthDate.replace(/\D/g, ''); // Remove non-digits
    let sum = 0;
    
    for (const digit of dateStr) {
      sum += parseInt(digit);
    }
    
    // Reduce to single digit
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    
    return sum;
  };

  const getPersonalYearMeaning = (year: number): { title: string; description: string; focus: string[] } => {
    const meanings: { [key: number]: { title: string; description: string; focus: string[] } } = {
      1: {
        title: "New Beginnings and Leadership",
        description: "Personal Year 1 is the beginning of a new 9-year cycle. Focus on independence, self-discovery, and asserting your personal power through the Solar Plexus Chakra.",
        focus: ["Set clear, achievable goals", "Say yes to new opportunities", "Focus on personal health and vitality"]
      },
      2: {
        title: "Relationships, Sensitivity, and Patience", 
        description: "Personal Year 2 emphasizes cooperation, collaboration, and harmony through the Heart Chakra. Focus on building meaningful connections.",
        focus: ["Practice active listening", "Journal about emotions daily", "Communicate boundaries clearly"]
      },
      3: {
        title: "Creativity, Expression, and Growth",
        description: "Personal Year 3 brings vibrant self-expression and creativity through the Crown Chakra. Time to share your ideas with the world.",
        focus: ["Set weekly creative goals", "Surround yourself with inspiration", "Prioritize meaningful pursuits"]
      },
      4: {
        title: "Stability, Discipline, and Building Foundations", 
        description: "Personal Year 4 emphasizes hard work and structure through the Earth Star Chakra. Focus on building solid foundations.",
        focus: ["Create clear action plans", "Establish productive routines", "Practice gratitude for progress"]
      },
      5: {
        title: "Freedom and Adaptability",
        description: "Personal Year 5 brings change and adventure through the Throat Chakra. Embrace new experiences and authentic communication.",
        focus: ["Perform daily acts of kindness", "Express yourself truthfully", "Embrace flexibility"]
      },
      6: {
        title: "Responsibility, Nurturing, and Harmony",
        description: "Personal Year 6 focuses on family, home, and caregiving through the Sacral Chakra. Balance giving with self-care.",
        focus: ["Strengthen family bonds", "Engage in creative activities", "Set healthy boundaries"]
      },
      7: {
        title: "Spirituality and Analysis", 
        description: "Personal Year 7 is about introspection and spiritual development through the Soul Star Chakra. Time for inner reflection.",
        focus: ["Take time for meditation", "Seek spiritual practices", "Trust your intuitive guidance"]
      },
      8: {
        title: "Material Success and Power",
        description: "Personal Year 8 brings focus on achievement and material success through the Third Eye Chakra. Act with clarity and vision.",
        focus: ["Set ambitious but realistic goals", "Focus on financial planning", "Trust your business instincts"]
      },
      9: {
        title: "Humanitarian Service",
        description: "Personal Year 9 completes the cycle with service and letting go through the Root Chakra. Focus on what truly matters.",
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
    const qualitiesMap: { [key: number]: string[] } = {
      1: ["Leadership", "Independence", "Initiative", "Confidence", "Ambition", "Pioneering"],
      2: ["Cooperation", "Sensitivity", "Diplomacy", "Patience", "Harmony", "Partnership"],
      3: ["Creativity", "Expression", "Communication", "Joy", "Artistic", "Inspiration"],
      4: ["Stability", "Practicality", "Organization", "Determination", "Discipline", "Reliability", "Focus", "Loyalty", "Foundation", "Persistence"],
      5: ["Freedom", "Adventure", "Curiosity", "Versatility", "Change", "Communication"],
      6: ["Nurturing", "Responsibility", "Compassion", "Service", "Healing", "Family"],
      7: ["Spirituality", "Introspection", "Analysis", "Wisdom", "Mysticism", "Research"],
      8: ["Authority", "Material Success", "Power", "Business", "Achievement", "Organization"],
      9: ["Humanitarian", "Compassion", "Universal Love", "Completion", "Service", "Wisdom"]
    };
    return qualitiesMap[number] || ["Universal Energy"];
  };

  const getNumberMeaning = (number: number, type: string): { title: string; description: string } => {
    const meanings: { [key: string]: { [key: number]: { title: string; description: string } } } = {
      lifePath: {
        1: { title: "The Leader: Independent, ambitious, pioneering, confident.", description: "Your Life Path number represents the core of who you are, including your traits, challenges, and opportunities. It's calculated from your birth date and is one of the most important numbers in your numerology chart." },
        2: { title: "The Diplomat: Cooperative, sensitive, peaceful, supportive.", description: "Your life path centers around cooperation, diplomacy, and sensitivity to others. You're naturally gifted at bringing people together and creating harmony." },
        3: { title: "The Communicator: Creative, expressive, optimistic, inspiring.", description: "Self-expression, creativity, and joy are the hallmarks of your journey. You're meant to inspire others through your natural creative abilities." },
        4: { title: "The Builder: Practical, trustworthy, disciplined, stable, hardworking.", description: "Your life purpose is aligned with building solid foundations. You excel at creating order, stability, and lasting structures in all areas of life." }
      },
      destiny: {
        1: { title: "Pioneer and innovator destiny", description: "Your destiny involves breaking new ground and leading others toward new possibilities." },
        2: { title: "Diplomat and peacemaker destiny", description: "Your destiny centers around bringing harmony and cooperation to all your endeavors." },
        3: { title: "Creative self-expression destiny, communication and artistic pursuits.", description: "Your Destiny number reveals the goals you're meant to achieve in this lifetime. Derived from your full birth name, it represents your life's work and the contribution you're meant to make to the world." },
        4: { title: "Builder and organizer destiny", description: "Building, organization, and creating order are your destined work. You're meant to create lasting foundations." }
      },
      soulUrge: {
        7: { title: "Mystical and transformative soul desires", description: "Your Soul Urge number reveals your inner desires, motivations, and what your heart truly longs for. It represents your emotional self and inner cravings. This number is calculated from the vowels in your name, representing your inner truth and what drives you at a soul level." }
      },
      personality: {
        8: { title: "Authoritative and capable outer presentation", description: "How others perceive you based on your outward personality and first impressions." }
      }
    };
    
    return meanings[type]?.[number] || { 
      title: "Unique spiritual path", 
      description: "This number carries special significance in your spiritual journey." 
    };
  };

  const getChakraPlanetInfo = (number: number): { chakra: string; planet: string; description: string; remedies: string[] } => {
    const chakraPlanetMap: { [key: number]: { chakra: string; planet: string; description: string; remedies: string[] } } = {
      1: {
        chakra: "Solar Plexus Chakra",
        planet: "Sun",
        description: "Leadership and Independence. Personal power, confidence, and willpower.",
        remedies: ["Yellow color therapy", "RAM mantra 45 times/day", "Citrine crystal", "Lemon aromatherapy", "Sacred code 451"]
      },
      2: {
        chakra: "Heart Chakra", 
        planet: "Moon",
        description: "Relationships and Sensitivity. Emotional balance and self-love.",
        remedies: ["Green/pink color therapy", "YAM mantra 45 times/day", "Rose Quartz crystal", "Rose aromatherapy", "Sacred code 741"]
      },
      3: {
        chakra: "Crown Chakra",
        planet: "Jupiter", 
        description: "Creativity and Communication. Spiritual connection and enlightenment.",
        remedies: ["Violet/white color therapy", "AUM mantra 45 times/day", "Clear Quartz crystal", "Lavender aromatherapy", "Sacred code 204"]
      },
      4: {
        chakra: "Earth Star Chakra",
        planet: "Rahu",
        description: "Stability and Discipline. Deep grounding, responsibility, and trust in life.",
        remedies: ["Brown/black color therapy", "LAM mantra 45 times/day", "Smoky Quartz crystal", "Cedarwood aromatherapy", "Sacred code 264"]
      },
      5: {
        chakra: "Throat Chakra",
        planet: "Mercury",
        description: "Freedom and Adaptability. Authentic communication and adaptability.",
        remedies: ["Blue color therapy", "HAM mantra 45 times/day", "Blue Lace Agate crystal", "Peppermint aromatherapy", "Sacred code 986"]
      },
      6: {
        chakra: "Sacral Chakra",
        planet: "Venus",
        description: "Nurturing and Responsibility. Emotional stability and creative expression.",
        remedies: ["Orange color therapy", "VAM mantra 45 times/day", "Carnelian crystal", "Ylang-ylang aromatherapy", "Sacred code 639"]
      },
      7: {
        chakra: "Soul Star Chakra",
        planet: "Ketu",
        description: "Spirituality and Analysis. Transcendence and karmic healing.",
        remedies: ["Gold/white color therapy", "OM SO HUM mantra 45 times/day", "Selenite crystal", "Lotus aromatherapy", "Sacred code 56"]
      },
      8: {
        chakra: "Third Eye Chakra",
        planet: "Saturn",
        description: "Material Success and Power. Clarity, vision, and decisive action.",
        remedies: ["Indigo color therapy", "OM mantra 45 times/day", "Amethyst crystal", "Frankincense aromatherapy", "Sacred code 852"]
      },
      9: {
        chakra: "Root Chakra",
        planet: "Mars",
        description: "Humanitarian Service. Action, grounding, and completion.",
        remedies: ["Red color therapy", "LAM mantra 45 times/day", "Red Jasper crystal", "Cedarwood aromatherapy", "Sacred code 396"]
      }
    };
    return chakraPlanetMap[number] || {
      chakra: "Universal Energy",
      planet: "Cosmic Force",
      description: "Unique spiritual path",
      remedies: ["Meditation", "White light visualization", "Clear Quartz crystal"]
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">
              <Calculator className="inline-block mr-3 h-10 w-10" />
              Numerology Analysis
            </h1>
            <p className="text-xl opacity-90">
              Discover the hidden meanings in your numbers and unlock your spiritual blueprint
            </p>
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {numerology.lifePathNumber}
                    </div>
                    <div className="font-semibold text-purple-800 mb-1">Life Path Number</div>
                    <div className="text-sm text-purple-600">Your life's journey and core purpose</div>
                    <div className="text-xs text-purple-500 mt-2">
                      {getLifePathMeaning(numerology.lifePathNumber)}
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {numerology.destinyNumber}
                    </div>
                    <div className="font-semibold text-blue-800 mb-1">Destiny Number</div>
                    <div className="text-sm text-blue-600">Your life's mission and calling</div>
                    <div className="text-xs text-blue-500 mt-2">
                      {getDestinyMeaning(numerology.destinyNumber)}
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {numerology.personalityNumber}
                    </div>
                    <div className="font-semibold text-green-800 mb-1">Decision-Making Chakra</div>
                    <div className="text-sm text-green-600">most of your decisions will
                      be based on the qualities of this chakra.</div>
                    <div className="text-xs text-green-500 mt-2">
                      Influences your decision-making patterns
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                    </div>
                    <div className="font-semibold text-red-800 mb-1">Dominant Soul Chakra</div>
                    <div className="text-sm text-red-600">Your soul wants you to operate from the positive and
                      balanced qualities of that chakra)</div>
                    <div className="text-xs text-red-500 mt-2">
                      Your greatest challenge area
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chakra-Planet Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Chakra-Planet Analysis
                </CardTitle>
                <CardDescription>Detailed spiritual insights based on your numerological profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Decision-Making Chakra */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Decision-Making Chakra</h3>
                    {(() => {
                      const info = getChakraPlanetInfo(numerology.personalityNumber);
                      return (
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="mb-3">
                            <div className="text-2xl font-bold text-green-600">{numerology.personalityNumber}</div>
                            <div className="text-sm text-green-700">{info.chakra} • {info.planet}</div>
                          </div>
                          <p className="text-sm text-green-800 mb-3">{info.description}</p>
                          <div>
                            <h4 className="font-medium text-green-800 mb-2">Recommended Remedies:</h4>
                            <ul className="text-xs text-green-700 space-y-1">
                              {info.remedies.map((remedy, index) => (
                                <li key={index}>• {remedy}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Dominant Soul Chakra */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Dominant Soul Chakra</h3>
                    {(() => {
                      const dominantSoulNumber = calculateDominantSoulChakra(user?.birthDate || "1990-01-01");
                      const info = getChakraPlanetInfo(dominantSoulNumber);
                      return (
                        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                          <div className="mb-3">
                            <div className="text-2xl font-bold text-red-600">{dominantSoulNumber}</div>
                            <div className="text-sm text-red-700">{info.chakra} • {info.planet}</div>
                          </div>
                          <p className="text-sm text-red-800 mb-3">{info.description}</p>
                          <div>
                            <h4 className="font-medium text-red-800 mb-2">Healing Remedies:</h4>
                            <ul className="text-xs text-red-700 space-y-1">
                              {info.remedies.map((remedy, index) => (
                                <li key={index}>• {remedy}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Interpretation */}
            <Card>
              <CardHeader>
                <CardTitle>Your Numerological Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{numerology.interpretation}</p>
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
                      <div className="text-sm text-gray-500 italic mb-4">
                        {getNumberColorAssociation(numerology.lifePathNumber) === 'Green' && 
                          "Balanced and nurturing, green represents growth, harmony, and practical manifestation. It encourages stability, healing, and the ability to build enduring foundations in life."
                        }
                      </div>
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

                    {/* Advanced Interpretation */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <h5 className="font-medium text-purple-800 mb-2">Advanced Life Path Interpretation</h5>
                      <p className="text-sm text-purple-700 mb-2">
                        As a Life Path {numerology.lifePathNumber}, your life purpose is aligned with building solid foundations.
                      </p>
                      <p className="text-sm text-purple-700">
                        The color vibration of {getNumberColorAssociation(numerology.lifePathNumber)} supports your life path by enhancing your natural balance and growth.
                      </p>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Your greatest challenge area</p>
                          <p className="text-xs text-red-600">Maximum challenges in this chakra</p>
                        </div>
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
                      <div className="text-sm text-gray-500 italic mb-4">
                        {getNumberColorAssociation(numerology.destinyNumber) === 'Yellow' && 
                          "Bright and uplifting, yellow represents optimism, mental clarity, and self-expression. It encourages intellectual growth, communication skills, and the ability to share ideas with confidence."
                        }
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.destinyNumber, 'destiny').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.destinyNumber, 'destiny').description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3">Vibration Qualities</h4>
                      <div className="flex flex-wrap gap-2">
                        {getVibrationQualities(numerology.destinyNumber).map((quality, index) => (
                          <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Your greatest challenge area</p>
                          <p className="text-xs text-red-600">Maximum challenges in this chakra</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Soul Urge Tab */}
                  <TabsContent value="soulUrge" className="space-y-6 mt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                           style={{ backgroundColor: getNumberColorAssociation(numerology.soulUrgeNumber).toLowerCase() === 'violet' ? '#8b5cf6' : '#6366f1' }}>
                        {numerology.soulUrgeNumber}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Soul Urge Number: {numerology.soulUrgeNumber}</h3>
                      <p className="text-gray-600 mb-2">Associated Color: <span className="font-medium">{getNumberColorAssociation(numerology.soulUrgeNumber)}</span></p>
                      <div className="text-sm text-gray-500 italic mb-4">
                        {getNumberColorAssociation(numerology.soulUrgeNumber) === 'Violet' && 
                          "Mystical and transformative, violet represents spiritual wisdom, introspection, and higher consciousness. It encourages deep analysis, inner knowing, and connection to universal truths."
                        }
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.soulUrgeNumber, 'soulUrge').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.soulUrgeNumber, 'soulUrge').description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3">Soul Qualities</h4>
                      <div className="flex flex-wrap gap-2">
                        {getVibrationQualities(numerology.soulUrgeNumber).map((quality, index) => (
                          <Badge key={index} variant="secondary" className="bg-violet-100 text-violet-800 border-violet-200">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="text-center mb-3">
                        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <p className="text-sm text-red-700 font-medium">Universal Energy • Cosmic Force</p>
                      </div>
                      <p className="text-xs text-red-600 text-center">Unique spiritual path</p>
                      
                      <div className="mt-3">
                        <h6 className="font-medium text-red-800 mb-2 text-sm">Healing Remedies:</h6>
                        <ul className="text-xs text-red-700 space-y-1">
                          <li>• Meditation</li>
                          <li>• White light visualization</li>
                          <li>• Clear Quartz crystal</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Personality Tab */}
                  <TabsContent value="personality" className="space-y-6 mt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                           style={{ backgroundColor: getNumberColorAssociation(numerology.personalityNumber).toLowerCase() === 'pink' ? '#ec4899' : '#6366f1' }}>
                        {numerology.personalityNumber}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Personality Number: {numerology.personalityNumber}</h3>
                      <p className="text-gray-600 mb-2">Associated Color: <span className="font-medium">{getNumberColorAssociation(numerology.personalityNumber)}</span></p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.personalityNumber, 'personality').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.personalityNumber, 'personality').description}</p>
                    </div>

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

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Your greatest challenge area</p>
                          <p className="text-xs text-red-600">Maximum challenges in this chakra</p>
                        </div>
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

                          {/* Personal Year Calculation */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">How Your Personal Year is Calculated</h4>
                            <div className="text-sm text-gray-700 space-y-2">
                              <p>Personal Year = (Birth Day + Birth Month + Current Year) reduced to single digit</p>
                              {(() => {
                                const birthDate = new Date(user?.birthDate || "1990-01-01");
                                const day = birthDate.getDate();
                                const month = birthDate.getMonth() + 1;
                                const currentYear = 2025;
                                return (
                                  <div className="bg-white p-3 rounded border">
                                    <p>Day: {day} + Month: {month} + Year digits: {currentYear.toString().split('').join(' + ')} = {day + month + 2 + 0 + 2 + 5}</p>
                                    <p>Reduced to single digit: <span className="font-medium text-indigo-600">{personalYear}</span></p>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Vibration Qualities for Personal Year */}
                          <div>
                            <h4 className="font-semibold text-purple-800 mb-3">2025 Energy Qualities</h4>
                            <div className="flex flex-wrap gap-2">
                              {getVibrationQualities(personalYear).map((quality, index) => (
                                <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                  {quality}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Personal Year Guidance */}
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <h4 className="font-semibold text-purple-800 mb-3">Spiritual Guidance for 2025</h4>
                            <p className="text-sm text-purple-700">
                              This Personal Year {personalYear} invites you to embrace {personalYearInfo.title.toLowerCase()} energy. 
                              Focus on the themes of {getVibrationQualities(personalYear).slice(0, 3).join(', ').toLowerCase()} 
                              as you navigate through 2025. This is a time for {personalYear === 1 ? 'new beginnings' : personalYear === 9 ? 'completion and preparation' : 'steady progress'} 
                              in your spiritual journey.
                            </p>
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

            {/* Comprehensive Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Comprehensive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Color Vibrations */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Color Vibrations</h4>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-green-100 text-green-800">Life Path: {getNumberColorAssociation(numerology.lifePathNumber)}</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">Destiny: {getNumberColorAssociation(numerology.destinyNumber)}</Badge>
                      <Badge className="bg-violet-100 text-violet-800">Soul Urge: {getNumberColorAssociation(numerology.soulUrgeNumber)}</Badge>
                      <Badge className="bg-pink-100 text-pink-800">Personality: {getNumberColorAssociation(numerology.personalityNumber)}</Badge>
                      <Badge className="bg-green-100 text-green-800">Soul Chakra: {getNumberColorAssociation(numerology.soulChakraNumber)}</Badge>
                    </div>
                  </div>

                  {/* Key Strengths and Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Key Strengths</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start"><span className="text-green-500 mr-2">•</span>Natural {getNumberColorAssociation(numerology.lifePathNumber)} energy enhances your leadership abilities</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">•</span>Your {getNumberColorAssociation(numerology.destinyNumber)} vibration amplifies your communication skills</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">•</span>The {getNumberColorAssociation(numerology.soulUrgeNumber)} influence strengthens your intuitive abilities</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Potential Challenges</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start"><span className="text-amber-500 mr-2">•</span>Balancing {getNumberColorAssociation(numerology.lifePathNumber)} intensity in daily interactions</li>
                        <li className="flex items-start"><span className="text-amber-500 mr-2">•</span>Integrating {getNumberColorAssociation(numerology.destinyNumber)} energy with practical matters</li>
                        <li className="flex items-start"><span className="text-amber-500 mr-2">•</span>Managing the sensitivity that comes with {getNumberColorAssociation(numerology.soulUrgeNumber)} vibrations</li>
                      </ul>
                    </div>
                  </div>

                  {/* Spiritual Guidance */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">Spiritual Guidance</h4>
                    <p className="text-sm text-purple-700">
                      Focus on harmonizing the {getNumberColorAssociation(numerology.lifePathNumber)} and {getNumberColorAssociation(numerology.destinyNumber)} energies in your numerological blueprint for optimal growth and spiritual development.
                    </p>
                  </div>

                  {/* Complete Interpretation */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Complete Interpretation</h4>
                    <p className="text-sm text-gray-700">{numerology.interpretation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Associations */}
            {numerology.colorAssociations && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Energy Colors</CardTitle>
                  <CardDescription>Colors that resonate with your numerological vibrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {numerology.colorAssociations.lifePathColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.lifePathColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.lifePathColor}</div>
                        <div className="text-sm text-gray-600">Life Path</div>
                      </div>
                    )}
                    {numerology.colorAssociations.destinyColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.destinyColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.destinyColor}</div>
                        <div className="text-sm text-gray-600">Destiny</div>
                      </div>
                    )}
                    {numerology.colorAssociations.soulUrgeColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.soulUrgeColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.soulUrgeColor}</div>
                        <div className="text-sm text-gray-600">Soul Urge</div>
                      </div>
                    )}
                    {numerology.colorAssociations.personalityColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.personalityColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.personalityColor}</div>
                        <div className="text-sm text-gray-600">Personality</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Challenges */}
            {(numerology.strengths || numerology.challenges) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {numerology.strengths && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Your Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {numerology.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {numerology.challenges && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">Areas for Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {numerology.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Guidance */}
            {numerology.guidance && (
              <Card>
                <CardHeader>
                  <CardTitle>Spiritual Guidance</CardTitle>
                  <CardDescription>Personalized insights for your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{numerology.guidance}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : numerologyError ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Unable to Calculate Numerology</h3>
            <p className="text-gray-600 mb-4">Please check your birth date and try again.</p>
            <Button onClick={() => setShowForm(true)}>
              Enter Information Again
            </Button>
          </div>
        ) : null}
      </main>
      
      <Footer />
    </div>
  );
}