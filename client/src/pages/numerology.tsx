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

const numerologySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
});

type NumerologyFormData = z.infer<typeof numerologySchema>;

export default function NumerologyPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

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
    // This would normally update the user's birth date in the database
    // For now, we'll just calculate with the provided data
    refetchNumerology();
  };

  const chakraColors = {
    root: "#E53E3E",
    sacral: "#FF8C00", 
    solarPlexus: "#FFD700",
    heart: "#38A169",
    throat: "#3182CE",
    thirdEye: "#805AD5",
    crown: "#B794F6"
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
      9: "Humanitarian service",
      11: "Spiritual insight and intuition",
      22: "Master builder and visionary",
      33: "Master teacher and healer"
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
      9: "Humanitarian and server",
      11: "Inspirational leader",
      22: "Master architect",
      33: "Universal healer"
    };
    return meanings[number] || "Special destiny path";
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
                    <div className="text-sm text-green-600">Sum of birth date digits</div>
                    <div className="text-xs text-green-500 mt-2">
                      Influences your decision-making patterns
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {numerology.soulChakraNumber}
                    </div>
                    <div className="font-semibold text-red-800 mb-1">Dominant Soul Chakra</div>
                    <div className="text-sm text-red-600">Your greatest challenge area</div>
                    <div className="text-xs text-red-500 mt-2">
                      Maximum challenges in this chakra
                    </div>
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