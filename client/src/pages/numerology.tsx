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

  const getLifePathMeaning = (number: number): string => {
    const meanings: { [key: number]: string } = {
      1: "Leadership and independence • Solar Plexus Chakra • Color: Yellow • Planet: Sun",
      2: "Cooperation and harmony • Heart Chakra • Color: Green and Pink • Planet: Moon",
      3: "Creativity and expression • Crown Chakra • Color: Violet",
      4: "Stability and hard work • Earth Star Chakra • Color: Crimson",
      5: "Freedom and adventure • Throat Chakra • Color: Blue",
      6: "Nurturing and responsibility • Sacral Chakra • Color: Orange",
      7: "Spirituality and analysis • Soul Star Chakra • Color: Silver",
      8: "Material success and power • Third Eye Chakra • Color: Indigo",
      9: "Humanitarian service • Root Chakra • Color: Red"
    }
    return meanings[number] || "Unique spiritual path";
  };

  const getDestinyMeaning = (number: number): string => {
    const meanings: { [key: number]: string } = {
      1: "Pioneer and innovator • Building confidence and self-worth",
      2: "Diplomat and peacemaker • Learning love, compassion, and connection",
      3: "Artist and communicator • Developing wisdom and divine connection",
      4: "Builder and organizer • Manifesting abundance and support systems",
      5: "Explorer and freedom seeker • Mastering self-expression and truth",
      6: "Healer and caretaker • Balancing creativity and emotional expression",
      7: "Seeker of truth and wisdom • Finding soul purpose and inner knowing",
      8: "Executive and achiever • Developing intuition and insight",
      9: "Humanitarian and server • Taking action with stability and passion"
    };
    return meanings[number] || "Special destiny path";
  };

  const getDetailedInfo = (number: number, type: 'life' | 'destiny') => {
    const lifePathDetails: { [key: number]: { angel: string; mantra: string; affirmation: string } } = {
      1: {
        angel: "Archangel Michael",
        mantra: "RAM (45 times daily)",
        affirmation: "I am confident and powerful. I take charge of my life."
      },
      2: {
        angel: "Archangel Raphael",
        mantra: "YAM (45 times daily)",
        affirmation: "I give and receive love freely. I forgive myself and others."
      },
      3: {
        angel: "Archangel Gabriel",
        mantra: "OM (45 times daily)",
        affirmation: "I express my creativity with joy and confidence."
      },
      4: {
        angel: "Archangel Uriel",
        mantra: "LAM (45 times daily)",
        affirmation: "I create solid foundations for my dreams."
      },
      5: {
        angel: "Archangel Gabriel",
        mantra: "HAM (45 times daily)",
        affirmation: "I speak my truth with clarity and confidence."
      },
      6: {
        angel: "Archangel Chamuel",
        mantra: "VAM (45 times daily)",
        affirmation: "I nurture others while caring for myself."
      },
      7: {
        angel: "Archangel Raziel",
        mantra: "OM MANI PADME HUM",
        affirmation: "I trust my inner wisdom and spiritual guidance."
      },
      8: {
        angel: "Archangel Metatron",
        mantra: "AUM (45 times daily)",
        affirmation: "I achieve success through integrity and wisdom."
      },
      9: {
        angel: "Archangel Michael",
        mantra: "LAM (45 times daily)",
        affirmation: "I serve others with compassion and wisdom."
      }
    };

    return lifePathDetails[number] || {
      angel: "Divine guidance",
      mantra: "OM",
      affirmation: "I am aligned with my highest purpose."
    };
  };

  if (isLoadingNumerology) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading your numerology analysis...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Numerology Analysis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the hidden meanings in your numbers and unlock insights into your life path, 
            destiny, and spiritual journey through the ancient wisdom of numerology.
          </p>
        </div>

        {!numerology || showForm ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Your Numbers
              </CardTitle>
              <CardDescription>
                Enter your details for a personalized numerology reading
              </CardDescription>
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
                          <Input placeholder="Enter your full birth name" {...field} />
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

                  <Button type="submit" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Calculate Numerology
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Your Numerological Profile</h2>
              <Button variant="outline" onClick={() => setShowForm(true)}>
                Recalculate
              </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="guidance">Spiritual Guidance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Life Path Number */}
                  <Card className="border-purple-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{numerology.lifePathNumber}</span>
                        </div>
                        <div>
                          <CardTitle className="text-purple-800">Life Path Number</CardTitle>
                          <CardDescription>Your life's journey and core purpose</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-purple-700 leading-relaxed">
                        {getLifePathMeaning(numerology.lifePathNumber)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Destiny Number */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{numerology.destinyNumber}</span>
                        </div>
                        <div>
                          <CardTitle className="text-blue-800">Destiny Number</CardTitle>
                          <CardDescription>Your life's mission and calling</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {getDestinyMeaning(numerology.destinyNumber)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Soul Urge Number */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{numerology.soulUrgeNumber}</span>
                        </div>
                        <div>
                          <CardTitle className="text-green-800">Soul Urge Number</CardTitle>
                          <CardDescription>Your inner desires and motivations</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-green-700">
                        Represents your heart's deepest desires and what truly motivates you from within.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Personality Number */}
                  <Card className="border-orange-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{numerology.personalityNumber}</span>
                        </div>
                        <div>
                          <CardTitle className="text-orange-800">Personality Number</CardTitle>
                          <CardDescription>How others perceive you</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-orange-700">
                        The impression you make on others and how you present yourself to the world.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {numerology.interpretation}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guidance" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-purple-800">Life Path Guidance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const details = getDetailedInfo(numerology.lifePathNumber, 'life');
                        return (
                          <>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-800 mb-1">Guiding Angel</h4>
                              <p className="text-sm text-gray-600">{details.angel}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-800 mb-1">Sacred Mantra</h4>
                              <p className="text-sm text-gray-600">{details.mantra}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-800 mb-1">Empowering Affirmation</h4>
                              <p className="text-sm text-gray-600 italic">"{details.affirmation}"</p>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-800">Chakra Connections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm">Life Path: Solar Plexus Chakra</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span className="text-sm">Destiny: Heart Chakra</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                        <span className="text-sm">Soul Urge: Sacral Chakra</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-indigo-400 rounded-full"></div>
                        <span className="text-sm">Personality: Third Eye Chakra</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}