import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateNumerology, NumerologyResult } from "@/lib/openai";
import { Loader2 } from "lucide-react";

const numerologySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
});

type NumerologyFormValues = z.infer<typeof numerologySchema>;

export default function Numerology() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [activeTab, setActiveTab] = useState("lifePath");

  const form = useForm<NumerologyFormValues>({
    resolver: zodResolver(numerologySchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
    },
  });

  const onSubmit = async (data: NumerologyFormValues) => {
    setIsCalculating(true);
    
    try {
      const numerologyResult = await calculateNumerology(data.fullName, data.birthDate);
      setResult(numerologyResult);
      
      toast({
        title: "Numerology Calculated",
        description: "Your numerology reading is ready.",
      });
    } catch (error) {
      console.error("Error calculating numerology:", error);
      
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate your numerology. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Helper function to generate number explanation
  const getNumberExplanation = (number: number, type: string) => {
    const explanations: Record<string, Record<number, string>> = {
      lifePath: {
        1: "The Pioneer: Independent, leadership qualities, self-sufficient, ambitious.",
        2: "The Peacemaker: Diplomatic, sensitive, cooperative, supportive partner.",
        3: "The Expressive One: Creative, optimistic, inspiring, sociable, communicative.",
        4: "The Builder: Practical, trustworthy, disciplined, stable, hardworking.",
        5: "The Freedom Seeker: Adaptable, versatile, adventurous, progressive.",
        6: "The Nurturer: Responsible, caring, compassionate, protective, artistic.",
        7: "The Seeker: Analytical, introspective, perfectionist, spiritual, wisdom.",
        8: "The Achiever: Ambitious, business-minded, powerful, good judgment.",
        9: "The Humanitarian: Compassionate, romantic, selfless, healing abilities.",
        11: "The Intuitive: Highly intuitive, idealistic, inspirational, visionary.",
        22: "The Master Builder: Practical visionary, capable of large-scale projects.",
        33: "The Master Teacher: Selfless service, compassionate, nurturing to humanity.",
      },
      destiny: {
        1: "Leadership destiny, pioneering new paths, independence will be key.",
        2: "Partnership-oriented destiny, cooperation and diplomacy are your strengths.",
        3: "Creative self-expression destiny, communication and artistic pursuits.",
        4: "Practical building destiny, creating solid foundations in life.",
        5: "Progressive change destiny, freedom and versatility in life experiences.",
        6: "Service and responsibility destiny, creating harmony and nurturing others.",
        7: "Spiritual and analytical destiny, seeking wisdom and understanding.",
        8: "Material achievement destiny, business acumen and executive abilities.",
        9: "Humanitarian destiny, working for the betterment of humanity.",
        11: "Spiritual messenger destiny, inspirational teaching and high ideals.",
        22: "Practical mastery destiny, building structures that benefit many.",
        33: "Spiritual mastery destiny, healing and uplifting humanity.",
      },
    };
    
    // Return explanation or default message
    return explanations[type]?.[number] || "This number represents unique vibrations in your personal energy field.";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white py-16">
          <AuraGlow 
            colors={[
              { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-center">Numerology Reading</h1>
            <p className="text-white/80 max-w-2xl mx-auto text-center">
              Discover the hidden meanings in your birth date and name with our comprehensive numerology analysis and life path guidance.
            </p>
          </div>
        </section>
        
        {/* Numerology calculator */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input form */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Calculate Your Numbers</CardTitle>
                      <CardDescription>Enter your full name and birth date for a personalized numerology reading</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name (as on birth certificate)</FormLabel>
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
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={isCalculating}
                          >
                            {isCalculating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Calculating...
                              </>
                            ) : "Calculate Numerology"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
                    <h3 className="font-heading font-semibold text-lg mb-4">About Numerology</h3>
                    <p className="text-gray-600 mb-4">
                      Numerology is the mystical study of numbers and their influence on human life. Each number carries a unique vibration that can reveal insights about your personality, life path, and potential.
                    </p>
                    <p className="text-gray-600">
                      By analyzing the numbers derived from your name and birth date, numerology provides a deeper understanding of your innate talents, challenges, and spiritual purpose in this lifetime.
                    </p>
                  </div>
                </div>
                
                {/* Results display */}
                <div>
                  {isCalculating ? (
                    <Card className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600">Calculating your numerology profile...</p>
                        <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                      </div>
                    </Card>
                  ) : result ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Numerology Profile</CardTitle>
                        <CardDescription>Based on your name and birth date</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="lifePath">Life Path</TabsTrigger>
                            <TabsTrigger value="destiny">Destiny</TabsTrigger>
                            <TabsTrigger value="soul">Soul Urge</TabsTrigger>
                            <TabsTrigger value="personality">Personality</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="lifePath">
                            <div className="flex flex-col items-center mb-6">
                              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <span className="text-3xl font-bold text-primary">{result.lifePathNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Life Path Number</h3>
                            </div>
                            
                            <div className="text-gray-700">
                              <p className="mb-4">
                                {getNumberExplanation(result.lifePathNumber, "lifePath")}
                              </p>
                              <p>
                                Your Life Path number represents the core of who you are, including your traits, challenges, and opportunities. It's calculated from your birth date and is one of the most important numbers in your numerology chart.
                              </p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="destiny">
                            <div className="flex flex-col items-center mb-6">
                              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                                <span className="text-3xl font-bold text-secondary">{result.destinyNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Destiny Number</h3>
                            </div>
                            
                            <div className="text-gray-700">
                              <p className="mb-4">
                                {getNumberExplanation(result.destinyNumber, "destiny")}
                              </p>
                              <p>
                                Your Destiny number reveals the goals you're meant to achieve in this lifetime. Derived from your full birth name, it indicates your potential abilities and what you're destined to accomplish.
                              </p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="soul">
                            <div className="flex flex-col items-center mb-6">
                              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                                <span className="text-3xl font-bold text-accent">{result.soulUrgeNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Soul Urge Number</h3>
                            </div>
                            
                            <div className="text-gray-700">
                              <p className="mb-4">
                                Your Soul Urge number reveals your inner desires, motivations, and what your heart truly longs for. It represents your emotional self and inner cravings.
                              </p>
                              <p>
                                This number is calculated from the vowels in your name, representing your inner truth and what drives you at a soul level.
                              </p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="personality">
                            <div className="flex flex-col items-center mb-6">
                              <div className="w-20 h-20 rounded-full bg-primary-dark/10 flex items-center justify-center mb-2">
                                <span className="text-3xl font-bold text-primary-dark">{result.personalityNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Personality Number</h3>
                            </div>
                            
                            <div className="text-gray-700">
                              <p className="mb-4">
                                Your Personality number reveals how others perceive you and the aspects of yourself that you allow the world to see. It represents your outer self and public persona.
                              </p>
                              <p>
                                This number is calculated from the consonants in your name, representing the traits that are most visible to others.
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter className="flex-col">
                        <div className="w-full border-t pt-4 mt-2">
                          <h3 className="font-medium mb-2">Interpretation</h3>
                          <p className="text-gray-600 text-sm">{result.interpretation}</p>
                        </div>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center bg-white/50 border-dashed border-2">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white/70">?</span>
                        </div>
                        <p className="text-gray-600">Enter your details to see your numerology reading</p>
                        <p className="text-gray-500 text-sm mt-2">Discover the hidden patterns in your life</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Numerology explanation */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8 text-center">Understanding Your Numbers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">Core Numbers</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg text-primary mb-2">Life Path Number</h4>
                    <p className="text-gray-600">
                      Your Life Path number is like your spiritual DNA, revealing your innate traits, challenges, and opportunities. It's derived from your full birth date and represents the path you'll walk in this lifetime.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg text-secondary mb-2">Destiny Number</h4>
                    <p className="text-gray-600">
                      Also called the Expression Number, your Destiny number reveals your natural talents and abilities. It's calculated from all the letters in your full birth name and indicates what you're destined to achieve.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg text-accent mb-2">Soul Urge Number</h4>
                    <p className="text-gray-600">
                      Your Soul Urge number reveals your inner desires and what your heart truly longs for. Calculated from the vowels in your name, it represents your emotional self and true motivations.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg text-primary-dark mb-2">Personality Number</h4>
                    <p className="text-gray-600">
                      Your Personality number reveals how others perceive you. Calculated from the consonants in your name, it represents the face you show to the world and your outer personality.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">Master Numbers</h3>
                <p className="text-gray-600 mb-6">
                  In numerology, 11, 22, and 33 are considered "Master Numbers" with enhanced power and potential. When these appear in your chart, they indicate special spiritual significance and heightened abilities.
                </p>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-purple-600">11</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-purple-600 mb-1">The Intuitive</h4>
                      <p className="text-gray-600 text-sm">
                        The master number 11 represents heightened intuition, spiritual insight, and inspiration. People with this number often serve as spiritual messengers.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-blue-600">22</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-blue-600 mb-1">The Master Builder</h4>
                      <p className="text-gray-600 text-sm">
                        The master number 22 combines vision with practical action. Those with this number have the potential to manifest large-scale projects that benefit humanity.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-green-600">33</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-green-600 mb-1">The Master Teacher</h4>
                      <p className="text-gray-600 text-sm">
                        The master number 33 represents compassionate service and spiritual enlightenment. People with this number often become nurturing teachers and healers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
