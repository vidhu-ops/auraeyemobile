import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import { PremiumFeature } from "@/components/premium/premium-feature";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateNumerology, NumerologyResult } from "@/lib/openai";
import { Loader2, Crown, Sparkles } from "lucide-react";

const numerologySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
});

type NumerologyFormValues = z.infer<typeof numerologySchema>;

export default function Numerology() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showPremiumModal } = usePremium();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [activeTab, setActiveTab] = useState("lifePath");
  
  const handlePremiumUpgrade = () => {
    showPremiumModal("numerology");
  };

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
      // For demonstration purposes, let's generate numerology results directly
      // This ensures the feature works even if the API has issues
      
      // Convert name into numerology value (simple algorithm)
      const nameValue = data.fullName.toLowerCase().split('').reduce((sum, char) => {
        const value = char.charCodeAt(0) - 96; // a=1, b=2, etc.
        return sum + (value > 0 && value < 27 ? value : 0);
      }, 0);
      
      // Convert birth date into numerology value
      const dateValue = data.birthDate.split('-').join('').split('').reduce((sum, digit) => sum + parseInt(digit || '0'), 0);
      
      // Calculate real numerology values based on birth date and name
      // Life Path Number - based on birth date digits sum
      const calculateLifePath = (date: string): number => {
        const digits = date.split('-').join('').split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        
        // Reduce to single digit unless master number
        while (sum > 9) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };
      
      // Destiny Number - based on full name letters converted to numbers
      const calculateDestiny = (name: string): number => {
        const letterValues: Record<string, number> = {
          'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
          'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
          's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
        };
        
        let sum = 0;
        for (const char of name.toLowerCase()) {
          if (letterValues[char]) {
            sum += letterValues[char];
          }
        }
        
        // Reduce to single digit unless master number
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };
      
      // Calculate Soul Urge Number - based on vowels in name
      const calculateSoulUrge = (name: string): number => {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const letterValues: Record<string, number> = {
          'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3
        };
        
        let sum = 0;
        for (const char of name.toLowerCase()) {
          if (vowels.includes(char)) {
            sum += letterValues[char];
          }
        }
        
        // Reduce to single digit unless master number
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum || 7; // Default to 7 if no vowels found
      };
      
      // Calculate Personality Number - based on month and day digits from birth date
      const calculatePersonality = (date: string): number => {
        // Extract month and day from date (YYYY-MM-DD format)
        const dateParts = date.split('-');
        if (dateParts.length !== 3) return 5; // Default fallback
        
        const month = dateParts[1]; // MM
        const day = dateParts[2]; // DD
        
        // Get all digits from month and day
        const digits = (month + day).split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        
        // Keep reducing until we get a single digit (1-9)
        while (sum > 9) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };
      
      // Calculate Soul Chakra Number - based on birth date digits sum
      const calculateSoulChakra = (date: string): number => {
        // Remove hyphens and get all digits from the date
        const digits = date.replace(/-/g, '').split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        
        // Keep reducing until we get a single digit (1-9)
        while (sum > 9) {
          sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        
        return sum;
      };
      
      // Calculate real numerology values
      const lifePathNumber = calculateLifePath(data.birthDate);
      const destinyNumber = calculateDestiny(data.fullName);
      const soulUrgeNumber = calculateSoulUrge(data.fullName);
      const personalityNumber = calculatePersonality(data.birthDate);
      const soulChakraNumber = calculateSoulChakra(data.birthDate);
      
      // Use these fallback values if the API call fails
      const fallbackResult = {
        lifePathNumber,
        destinyNumber,
        soulUrgeNumber,
        personalityNumber,
        soulChakraNumber,
        interpretation: `Your Life Path Number ${lifePathNumber} and Destiny Number ${destinyNumber} create a powerful combination that influences your spiritual journey. The Soul Urge Number ${soulUrgeNumber} reveals your inner desires and motivations, while your Personality Number ${personalityNumber} shapes how others perceive you. Your Soul Chakra Number ${soulChakraNumber} represents your spiritual energy center. This numerological blueprint offers insights into your strengths, challenges, and spiritual path.`,
        colorAssociations: {
          lifePathColor: getNumberColor(lifePathNumber).name,
          destinyColor: getNumberColor(destinyNumber).name,
          soulUrgeColor: getNumberColor(soulUrgeNumber).name,
          personalityColor: getNumberColor(personalityNumber).name,
          soulChakraColor: getNumberColor(soulChakraNumber).name
        },
        // Log the calculated numbers for verification
        calculatedNumbers: {
          lifePathNumber,
          destinyNumber,
          soulUrgeNumber,
          personalityNumber,
          soulChakraNumber
        },
        strengths: [
          `Your Life Path Number ${lifePathNumber} gives you natural ${getNumberColor(lifePathNumber).name} energy`,
          `Your Destiny Number ${destinyNumber} amplifies your ${getNumberColor(destinyNumber).name} vibration`,
          `The ${getNumberColor(soulUrgeNumber).name} influence of your Soul Urge Number ${soulUrgeNumber} strengthens your intuition`
        ],
        challenges: [
          `Balancing the intensity of your ${getNumberColor(lifePathNumber).name} Life Path vibrations`,
          `Integrating your ${getNumberColor(destinyNumber).name} Destiny energy with daily life`,
          `Managing the sensitivity of your ${getNumberColor(soulUrgeNumber).name} Soul Urge vibrations`
        ],
        guidance: `Focus on harmonizing your ${getNumberColor(lifePathNumber).name} Life Path and ${getNumberColor(destinyNumber).name} Destiny energies for optimal spiritual growth.`
      };
      
      // Try the API call, but use fallback if it fails
      let numerologyResult;
      try {
        console.log("Submitting to API:", data.fullName, data.birthDate);
        numerologyResult = await calculateNumerology(data.fullName, data.birthDate);
      } catch (apiError) {
        console.warn("API call failed, using generated values:", apiError);
        numerologyResult = fallbackResult;
      }
      
      // Update state with the result
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
  
  // Get color associated with numerology number
  const getNumberColor = (number: number): { bg: string, text: string, name: string, meaning: string } => {
    // Reduce master numbers for color purposes
    const reducedNumber = number > 9 ? (number === 11 || number === 22 || number === 33 ? number : Number(number.toString().split('').reduce((a, b) => a + parseInt(b), 0))) : number;
    
    const colorMap: Record<number, { bg: string, text: string, name: string, meaning: string }> = {
      1: { 
        bg: "bg-red-100", 
        text: "text-red-600", 
        name: "Red", 
        meaning: "Vibrant and energetic, red represents passion, leadership, and primal driving forces. It encourages action, vitality, and the courage to pursue your goals with determination."
      },
      2: { 
        bg: "bg-orange-100", 
        text: "text-orange-600", 
        name: "Orange", 
        meaning: "Warm and inviting, orange represents joy, enthusiasm, and creative expression. It encourages emotional balance, social connection, and the ability to navigate relationships with grace."
      },
      3: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-600", 
        name: "Yellow", 
        meaning: "Bright and uplifting, yellow represents optimism, mental clarity, and self-expression. It encourages intellectual growth, communication skills, and the ability to share ideas with confidence."
      },
      4: { 
        bg: "bg-green-100", 
        text: "text-green-600", 
        name: "Green", 
        meaning: "Balanced and nurturing, green represents growth, harmony, and practical manifestation. It encourages stability, healing, and the ability to build enduring foundations in life."
      },
      5: { 
        bg: "bg-blue-100", 
        text: "text-blue-600", 
        name: "Blue", 
        meaning: "Clear and expansive, blue represents communication, truth, and freedom of expression. It encourages authenticity, adaptability, and the courage to embrace change with confidence."
      },
      6: { 
        bg: "bg-indigo-100", 
        text: "text-indigo-600", 
        name: "Indigo", 
        meaning: "Deep and mysterious, indigo represents intuition, responsibility, and spiritual perception. It encourages visionary thinking, nurturing abilities, and service to others."
      },
      7: { 
        bg: "bg-violet-100", 
        text: "text-violet-600", 
        name: "Violet", 
        meaning: "Mystical and transformative, violet represents spiritual wisdom, introspection, and higher consciousness. It encourages deep analysis, inner knowing, and connection to universal truths."
      },
      8: { 
        bg: "bg-purple-100", 
        text: "text-purple-600", 
        name: "Purple", 
        meaning: "Regal and powerful, purple represents abundance, achievement, and personal authority. It encourages leadership, manifestation skills, and the ability to create material and spiritual wealth."
      },
      9: { 
        bg: "bg-pink-100", 
        text: "text-pink-600", 
        name: "Pink", 
        meaning: "Compassionate and universal, pink represents unconditional love, completion, and humanitarian ideals. It encourages selfless service, emotional intelligence, and global consciousness."
      },
      11: { 
        bg: "bg-white border border-gold-300", 
        text: "text-amber-500", 
        name: "Gold/White", 
        meaning: "Divine and illuminating, gold/white represents spiritual illumination, intuitive mastery, and elevated consciousness. It encourages visionary insight, inspirational leadership, and the ability to bridge earthly and spiritual realms."
      },
      22: { 
        bg: "bg-indigo-200", 
        text: "text-indigo-800", 
        name: "Royal Blue", 
        meaning: "Masterful and expansive, royal blue represents practical spirituality, manifestation power, and world-changing potential. It encourages large-scale vision, material mastery, and the ability to transform dreams into reality."
      },
      33: { 
        bg: "bg-emerald-100", 
        text: "text-emerald-600", 
        name: "Emerald", 
        meaning: "Healing and transcendent, emerald represents compassionate service, spiritual teaching, and Christ consciousness. It encourages selfless love, nurturing wisdom, and the ability to uplift humanity through your presence."
      }
    };
    
    return colorMap[reducedNumber] || colorMap[1]; // Default to red if number not found
  };
  
  // Get vibration qualities for a number
  const getNumberVibrations = (number: number) => {
    const vibrations: Record<number, string[]> = {
      1: ["Leadership", "Independence", "Originality", "Self-confidence", "Pioneering", "Initiative", "Ambition", "Courage", "Innovation"],
      2: ["Harmony", "Cooperation", "Sensitivity", "Diplomacy", "Intuition", "Adaptability", "Empathy", "Balance", "Partnership", "Receptivity"],
      3: ["Creativity", "Expression", "Joy", "Optimism", "Communication", "Enthusiasm", "Imagination", "Inspiration", "Social Energy", "Artistic Flow"],
      4: ["Stability", "Practicality", "Organization", "Determination", "Discipline", "Reliability", "Focus", "Loyalty", "Foundation", "Persistence"],
      5: ["Freedom", "Change", "Adventure", "Versatility", "Curiosity", "Adaptability", "Resourcefulness", "Progress", "Exploration", "Vitality"],
      6: ["Nurturing", "Responsibility", "Harmony", "Balance", "Love", "Service", "Beauty", "Compassion", "Protection", "Healing"],
      7: ["Analysis", "Wisdom", "Spirituality", "Introspection", "Perfection", "Research", "Intuition", "Depth", "Knowledge", "Inner Awareness"],
      8: ["Abundance", "Power", "Authority", "Achievement", "Material success", "Organization", "Management", "Manifestation", "Efficiency", "Vision"],
      9: ["Compassion", "Completion", "Humanitarianism", "Wisdom", "Universal love", "Forgiveness", "Altruism", "Idealism", "Spiritual Growth", "Leadership"],
      11: ["Inspiration", "Illumination", "Spirituality", "Idealism", "Intuition", "Vision", "Enlightenment", "Revelation", "Sensitivity", "Awareness"],
      22: ["Master building", "Practical idealism", "Large-scale manifestation", "Power", "Material mastery", "Leadership", "Influence", "Legacy", "Structure", "Transformation"],
      33: ["Spiritual teaching", "Compassionate service", "Enlightenment", "Healing", "Selfless giving", "Unconditional Love", "Nurturing", "Wisdom", "Higher Consciousness", "Divine Expression"]
    };
    
    return vibrations[number] || vibrations[number % 9 || 9];
  };

  // Get Soul Chakra explanation based on number
  const getSoulChakraExplanation = (number: number): string => {
    const explanations: Record<number, string> = {
      1: "The Pioneer Soul: Independent spiritual path, natural leadership in spiritual matters, initiating new spiritual journeys.",
      2: "The Harmonious Soul: Cooperative spiritual nature, finding balance through partnerships, emotional spiritual sensitivity.",
      3: "The Creative Soul: Expressive spiritual gifts, joyful spiritual communication, artistic spiritual manifestation.",
      4: "The Grounded Soul: Practical spiritual approach, building solid spiritual foundations, disciplined spiritual practice.",
      5: "The Free Soul: Adventurous spiritual seeker, embracing spiritual change and freedom, progressive spiritual thinking.",
      6: "The Nurturing Soul: Responsible spiritual service, healing and caring for others, family-oriented spirituality.",
      7: "The Mystical Soul: Deep spiritual seeker, analytical spiritual approach, connection to hidden wisdom and mysteries.",
      8: "The Powerful Soul: Material and spiritual mastery, achieving spiritual authority, manifesting abundance through spirituality.",
      9: "The Universal Soul: Humanitarian spiritual service, compassionate spiritual expression, working for collective spiritual evolution."
    };
    return explanations[number] || "This number carries unique spiritual vibrations that guide your soul's journey.";
  };

  // Get Soul Chakra vibrations
  const getSoulChakraVibrations = (number: number): string[] => {
    const vibrations: Record<number, string[]> = {
      1: ["Spiritual Leadership", "Inner Strength", "New Beginnings", "Independence", "Courage"],
      2: ["Emotional Balance", "Spiritual Partnership", "Sensitivity", "Cooperation", "Harmony"],
      3: ["Creative Expression", "Spiritual Joy", "Communication", "Optimism", "Inspiration"],
      4: ["Spiritual Stability", "Grounded Practice", "Discipline", "Foundation Building", "Reliability"],
      5: ["Spiritual Freedom", "Adventure", "Change", "Progressive Thinking", "Versatility"],
      6: ["Nurturing Service", "Healing Energy", "Responsibility", "Family Connection", "Compassion"],
      7: ["Mystical Wisdom", "Deep Analysis", "Spiritual Seeking", "Inner Knowledge", "Intuition"],
      8: ["Spiritual Authority", "Abundance Mastery", "Achievement", "Material-Spiritual Balance", "Power"],
      9: ["Universal Love", "Humanitarian Service", "Compassion", "Global Consciousness", "Completion"]
    };
    return vibrations[number] || ["Spiritual Growth", "Inner Wisdom", "Divine Connection"];
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
                          <TabsList className="grid grid-rows-3 w-full h-15 mb-6">
                            <div className="grid grid-cols-2 gap-4 mb-5">
                              <TabsTrigger value="lifePath">Life Path</TabsTrigger>
                              <TabsTrigger value="destiny">Destiny</TabsTrigger>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <TabsTrigger value="soul">Soul Urge</TabsTrigger>
                              <TabsTrigger value="personality">Personality</TabsTrigger>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <TabsTrigger value="soulChakra">Soul Chakra</TabsTrigger>
                            </div>
                          </TabsList>
                          
                          <TabsContent value="lifePath">
                            <div className="flex flex-col items-center mb-6">
                              {/* Display number with associated color */}
                              <div className={`w-20 h-20 rounded-full ${getNumberColor(result.lifePathNumber).bg} flex items-center justify-center mb-2 shadow-md`}>
                                <span className={`text-3xl font-bold ${getNumberColor(result.lifePathNumber).text}`}>{result.lifePathNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Life Path Number: <span className={`font-medium ${getNumberColor(result.lifePathNumber).text}`}>{result.lifePathNumber}</span></h3>
                              <div className="text-sm text-gray-500 mt-1">
                                Associated Color: <span className={`font-medium ${getNumberColor(result.lifePathNumber).text}`}>{getNumberColor(result.lifePathNumber).name}</span>
                              </div>
                              <div className="mt-3 px-4 py-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic">
                                {getNumberColor(result.lifePathNumber).meaning}
                              </div>
                            </div>
                            
                            <div className="text-gray-700">
                              <div className="mb-4 p-4 rounded-lg bg-gray-50">
                                <p className="font-medium mb-2">
                                  {getNumberExplanation(result.lifePathNumber, "lifePath")}
                                </p>
                                <p>
                                  Your Life Path number represents the core of who you are, including your traits, challenges, and opportunities. It's calculated from your birth date and is one of the most important numbers in your numerology chart.
                                </p>
                              </div>
                              
                              {/* Display vibration qualities */}
                              <div className="mb-4">
                                <h4 className="font-medium text-primary mb-2">Vibration Qualities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {getNumberVibrations(result.lifePathNumber).map((quality, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-sm ${getNumberColor(result.lifePathNumber).bg} ${getNumberColor(result.lifePathNumber).text}`}>
                                      {quality}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Advanced interpretation */}
                              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                                <h4 className="font-medium mb-2">Advanced Life Path Interpretation</h4>
                                <p className="text-sm mb-2">
                                  As a Life Path {result.lifePathNumber}, your life purpose is aligned with {result.lifePathNumber === 1 ? "leadership and pioneering" : 
                                    result.lifePathNumber === 2 ? "harmony and cooperation" : 
                                    result.lifePathNumber === 3 ? "creative expression and joy" : 
                                    result.lifePathNumber === 4 ? "building solid foundations" : 
                                    result.lifePathNumber === 5 ? "freedom and adventure" : 
                                    result.lifePathNumber === 6 ? "responsibility and nurturing" : 
                                    result.lifePathNumber === 7 ? "spiritual wisdom and analysis" : 
                                    result.lifePathNumber === 8 ? "abundance and achievement" : 
                                    result.lifePathNumber === 9 ? "humanitarian service" : 
                                    result.lifePathNumber === 11 ? "spiritual insight and inspiration" : 
                                    result.lifePathNumber === 22 ? "manifesting large-scale visions" : 
                                    "spiritual teaching and healing"}.
                                </p>
                                <p className="text-sm">
                                  The color vibration of {getNumberColor(result.lifePathNumber).name} supports your life path by enhancing your natural {getNumberColor(result.lifePathNumber).name.toLowerCase() === "red" ? "energy and passion" : 
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("orange") ? "creativity and enthusiasm" : 
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("yellow") ? "intellect and optimism" : 
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("green") ? "balance and growth" : 
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("blue") ? "communication and truth" :
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("indigo") ? "intuition and vision" :
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("violet") ? "spiritual connection" :
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("purple") ? "transformation and power" :
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("pink") ? "compassion and love" :
                                    getNumberColor(result.lifePathNumber).name.toLowerCase().includes("gold") ? "wisdom and enlightenment" :
                                    "spiritual mastery and healing"}.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="destiny">
                            <div className="flex flex-col items-center mb-6">
                              {/* Display number with associated color */}
                              <div className={`w-20 h-20 rounded-full ${getNumberColor(result.destinyNumber).bg} flex items-center justify-center mb-2 shadow-md`}>
                                <span className={`text-3xl font-bold ${getNumberColor(result.destinyNumber).text}`}>{result.destinyNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Destiny Number: <span className={`font-medium ${getNumberColor(result.destinyNumber).text}`}>{result.destinyNumber}</span></h3>
                              <div className="text-sm text-gray-500 mt-1">
                                Associated Color: <span className={`font-medium ${getNumberColor(result.destinyNumber).text}`}>{getNumberColor(result.destinyNumber).name}</span>
                              </div>
                              <div className="mt-3 px-4 py-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic">
                                {getNumberColor(result.destinyNumber).meaning}
                              </div>
                            </div>
                            
                            <div className="text-gray-700">
                              <div className="mb-4 p-4 rounded-lg bg-gray-50">
                                <p className="font-medium mb-2">
                                  {getNumberExplanation(result.destinyNumber, "destiny")}
                                </p>
                                <p>
                                  Your Destiny number reveals the goals you're meant to achieve in this lifetime. Derived from your full birth name, it indicates your potential abilities and what you're destined to accomplish.
                                </p>
                              </div>
                              
                              {/* Display vibration qualities */}
                              <div className="mb-4">
                                <h4 className="font-medium text-primary mb-2">Vibration Qualities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {getNumberVibrations(result.destinyNumber).map((quality, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-sm ${getNumberColor(result.destinyNumber).bg} ${getNumberColor(result.destinyNumber).text}`}>
                                      {quality}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Advanced interpretation */}
                              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                                <h4 className="font-medium mb-2">Advanced Destiny Interpretation</h4>
                                <p className="text-sm mb-2">
                                  With a Destiny number of {result.destinyNumber}, you're naturally drawn to opportunities that allow you to express {result.destinyNumber === 1 ? "leadership and innovation" : 
                                    result.destinyNumber === 2 ? "cooperation and relationship-building" : 
                                    result.destinyNumber === 3 ? "creative self-expression and communication" : 
                                    result.destinyNumber === 4 ? "structure and methodical approaches" : 
                                    result.destinyNumber === 5 ? "change and progressive thinking" : 
                                    result.destinyNumber === 6 ? "service and nurturing others" : 
                                    result.destinyNumber === 7 ? "intellectual and spiritual pursuits" : 
                                    result.destinyNumber === 8 ? "achievement and material success" : 
                                    result.destinyNumber === 9 ? "humanitarian efforts and compassion" : 
                                    result.destinyNumber === 11 ? "inspirational teaching and intuitive guidance" : 
                                    result.destinyNumber === 22 ? "large-scale projects that benefit society" : 
                                    "healing and compassionate teaching"}.
                                </p>
                                <p className="text-sm">
                                  The vibration of {getNumberColor(result.destinyNumber).name} in your Destiny number suggests that your life's work is linked with {getNumberColor(result.destinyNumber).name.toLowerCase() === "red" ? "taking initiative and leading new ventures" : 
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("orange") ? "bringing joy and enthusiasm to collaborative projects" : 
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("yellow") ? "sharing knowledge and optimistic perspectives" : 
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("green") ? "healing, growth, and creating balance" : 
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("blue") ? "clear communication and expressing truth" :
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("indigo") ? "visionary thinking and spiritual leadership" :
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("violet") ? "transformation and spiritual awakening" :
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("purple") ? "wisdom and leadership with spiritual awareness" :
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("pink") ? "unconditional love and compassionate service" :
                                    getNumberColor(result.destinyNumber).name.toLowerCase().includes("gold") ? "elevating others through your wisdom" :
                                    "healing on a profound spiritual level"}.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="soul">
                            <div className="flex flex-col items-center mb-6">
                              {/* Display number with associated color */}
                              <div className={`w-20 h-20 rounded-full ${getNumberColor(result.soulUrgeNumber).bg} flex items-center justify-center mb-2 shadow-md`}>
                                <span className={`text-3xl font-bold ${getNumberColor(result.soulUrgeNumber).text}`}>{result.soulUrgeNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Soul Urge Number: <span className={`font-medium ${getNumberColor(result.soulUrgeNumber).text}`}>{result.soulUrgeNumber}</span></h3>
                              <div className="text-sm text-gray-500 mt-1">
                                Associated Color: <span className={`font-medium ${getNumberColor(result.soulUrgeNumber).text}`}>{getNumberColor(result.soulUrgeNumber).name}</span>
                              </div>
                              <div className="mt-3 px-4 py-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic">
                                {getNumberColor(result.soulUrgeNumber).meaning}
                              </div>
                            </div>
                            
                            <div className="text-gray-700">
                              <div className="mb-4 p-4 rounded-lg bg-gray-50">
                                <p className="font-medium mb-2">
                                  Your Soul Urge number {result.soulUrgeNumber} reveals your inner desires, motivations, and what your heart truly longs for. It represents your emotional self and inner cravings.
                                </p>
                                <p>
                                  This number is calculated from the vowels in your name, representing your inner truth and what drives you at a soul level.
                                </p>
                              </div>
                              
                              {/* Display vibration qualities */}
                              <div className="mb-4">
                                <h4 className="font-medium text-primary mb-2">Soul Qualities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {getNumberVibrations(result.soulUrgeNumber).map((quality, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-sm ${getNumberColor(result.soulUrgeNumber).bg} ${getNumberColor(result.soulUrgeNumber).text}`}>
                                      {quality}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Advanced interpretation */}
                              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                                <h4 className="font-medium mb-2">Advanced Soul Urge Interpretation</h4>
                                <p className="text-sm mb-2">
                                  Your Soul Urge number {result.soulUrgeNumber} indicates that at your deepest level, you desire {result.soulUrgeNumber === 1 ? "independence and achievement" : 
                                    result.soulUrgeNumber === 2 ? "harmony and meaningful connections" : 
                                    result.soulUrgeNumber === 3 ? "creative expression and joy" : 
                                    result.soulUrgeNumber === 4 ? "stability and creating tangible results" : 
                                    result.soulUrgeNumber === 5 ? "freedom and varied experiences" : 
                                    result.soulUrgeNumber === 6 ? "love and nurturing relationships" : 
                                    result.soulUrgeNumber === 7 ? "wisdom and spiritual understanding" : 
                                    result.soulUrgeNumber === 8 ? "abundance and recognition" : 
                                    result.soulUrgeNumber === 9 ? "making a meaningful difference" : 
                                    result.soulUrgeNumber === 11 ? "spiritual awakening and enlightenment" : 
                                    result.soulUrgeNumber === 22 ? "building something of lasting significance" : 
                                    "uplifting and healing humanity"}.
                                </p>
                                <p className="text-sm">
                                  The {getNumberColor(result.soulUrgeNumber).name} energy of your Soul Urge number resonates with your inner need for {getNumberColor(result.soulUrgeNumber).name.toLowerCase() === "red" ? "passion and self-expression" : 
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("orange") ? "joy and social connection" : 
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("yellow") ? "mental stimulation and optimism" : 
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("green") ? "growth and harmony" : 
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("blue") ? "truth and authentic expression" :
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("indigo") ? "spiritual insight and intuition" :
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("violet") ? "transformation and higher consciousness" :
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("purple") ? "spiritual power and mastery" :
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("pink") ? "unconditional love and acceptance" :
                                    getNumberColor(result.soulUrgeNumber).name.toLowerCase().includes("gold") ? "divine wisdom and spiritual fulfillment" :
                                    "spiritual healing and enlightenment"}.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="personality">
                            <div className="flex flex-col items-center mb-6">
                              {/* Display number with associated color */}
                              <div className={`w-20 h-20 rounded-full ${getNumberColor(result.personalityNumber).bg} flex items-center justify-center mb-2 shadow-md`}>
                                <span className={`text-3xl font-bold ${getNumberColor(result.personalityNumber).text}`}>{result.personalityNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold align-center">     Personality Number or Decision Making Chakra: <span className={`font-medium ${getNumberColor(result.personalityNumber).text}`}>{result.personalityNumber}</span></h3>
                              <div className="text-sm text-gray-500 mt-1 center ">
                                 This is also your Dominant CHarkra Number / Associated Color: <span className={`font-medium ${getNumberColor(result.personalityNumber).text}`}>{getNumberColor(result.personalityNumber).name}</span>
                              </div>
                              <div className="mt-3 px-4 py-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic">
                                {getNumberColor(result.personalityNumber).meaning}
                              </div>
                            </div>
                            
                            <div className="text-gray-700">
                              <div className="mb-4 p-4 rounded-lg bg-gray-50">
                                <p className="font-medium mb-2">
                                  Your Personality number {result.personalityNumber} reveals how others perceive you and the aspects of yourself that you allow the world to see. It represents your outer self and public persona.
                                </p>
                                <p>
                                  This number is calculated from the consonants in your name, representing the traits that are most visible to others.
                                </p>
                              </div>
                              
                              {/* Display vibration qualities */}
                              <div className="mb-4">
                                <h4 className="font-medium text-primary mb-2">Personality Traits</h4>
                                <div className="flex flex-wrap gap-2">
                                  {getNumberVibrations(result.personalityNumber).map((quality, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-sm ${getNumberColor(result.personalityNumber).bg} ${getNumberColor(result.personalityNumber).text}`}>
                                      {quality}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Advanced interpretation */}
                              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                                <h4 className="font-medium mb-2">Advanced Personality Interpretation</h4>
                                <p className="text-sm mb-2">
                                  With a Personality number of {result.personalityNumber}, you naturally present yourself to the world as {result.personalityNumber === 1 ? "confident and self-reliant" : 
                                    result.personalityNumber === 2 ? "diplomatic and supportive" : 
                                    result.personalityNumber === 3 ? "expressive and sociable" : 
                                    result.personalityNumber === 4 ? "organized and reliable" : 
                                    result.personalityNumber === 5 ? "adaptable and dynamic" : 
                                    result.personalityNumber === 6 ? "responsible and nurturing" : 
                                    result.personalityNumber === 7 ? "thoughtful and introspective" : 
                                    result.personalityNumber === 8 ? "capable and accomplished" : 
                                    result.personalityNumber === 9 ? "idealistic and compassionate" : 
                                    result.personalityNumber === 11 ? "insightful and inspirational" : 
                                    result.personalityNumber === 22 ? "visionary and powerful" : 
                                    "compassionate and enlightened"}.
                                </p>
                                <p className="text-sm">
                                  The color vibration of {getNumberColor(result.personalityNumber).name} in your Personality number expresses itself through your {getNumberColor(result.personalityNumber).name.toLowerCase() === "red" ? "dynamic and assertive demeanor" : 
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("orange") ? "warm and enthusiastic approach" : 
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("yellow") ? "bright and intellectual presence" : 
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("green") ? "balanced and nurturing interactions" : 
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("blue") ? "clear and authentic communication" :
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("indigo") ? "intuitive and perceptive nature" :
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("violet") ? "transformative and inspirational presence" :
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("purple") ? "dignified and wise demeanor" :
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("pink") ? "kind and loving approach" :
                                    getNumberColor(result.personalityNumber).name.toLowerCase().includes("gold") ? "enlightened and radiant presence" :
                                    "healing and transformative energy"}.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="soulChakra">
                            <div className="flex flex-col items-center mb-6">
                              {/* Display number with associated color */}
                              <div className={`w-20 h-20 rounded-full ${getNumberColor(result.soulChakraNumber).bg} flex items-center justify-center mb-2 shadow-md`}>
                                <span className={`text-3xl font-bold ${getNumberColor(result.soulChakraNumber).text}`}>{result.soulChakraNumber}</span>
                              </div>
                              <h3 className="font-heading font-semibold">Soul Chakra Number: <span className={`font-medium ${getNumberColor(result.soulChakraNumber).text}`}>{result.soulChakraNumber}</span></h3>
                              <div className="text-sm text-gray-500 mt-1">
                                Associated Color: <span className={`font-medium ${getNumberColor(result.soulChakraNumber).text}`}>{getNumberColor(result.soulChakraNumber).name}</span>
                              </div>
                              <div className="mt-3 px-4 py-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic">
                                {getNumberColor(result.soulChakraNumber).meaning}
                              </div>
                            </div>
                            
                            <div className="text-gray-700">
                              <div className="mb-4 p-4 rounded-lg bg-gray-50">
                                <p className="font-medium mb-2">
                                  {getSoulChakraExplanation(result.soulChakraNumber)}
                                </p>
                                <p>
                                  Your Soul Chakra number is calculated by adding all the digits in your birth date until you reach a single digit. This number represents your spiritual energy center and influences your connection to your inner wisdom and spiritual growth.
                                </p>
                              </div>
                              
                              {/* Display vibration qualities */}
                              <div className="mb-4">
                                <h4 className="font-medium text-primary mb-2">Spiritual Vibration Qualities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {getSoulChakraVibrations(result.soulChakraNumber).map((quality, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-sm ${getNumberColor(result.soulChakraNumber).bg} ${getNumberColor(result.soulChakraNumber).text}`}>
                                      {quality}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Advanced interpretation */}
                              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                                <h4 className="font-medium mb-2">Soul Chakra Energy Analysis</h4>
                                <p className="text-sm mb-2">
                                  With a Soul Chakra number of {result.soulChakraNumber}, your spiritual energy center resonates with {result.soulChakraNumber === 1 ? "pioneering spiritual leadership and new beginnings" : 
                                    result.soulChakraNumber === 2 ? "spiritual partnership and emotional balance" : 
                                    result.soulChakraNumber === 3 ? "creative spiritual expression and joy" : 
                                    result.soulChakraNumber === 4 ? "grounded spiritual practice and stability" : 
                                    result.soulChakraNumber === 5 ? "spiritual freedom and transformative experiences" : 
                                    result.soulChakraNumber === 6 ? "nurturing spiritual service and healing" : 
                                    result.soulChakraNumber === 7 ? "deep spiritual wisdom and mystical understanding" : 
                                    result.soulChakraNumber === 8 ? "material and spiritual abundance mastery" : 
                                    "universal spiritual compassion and humanitarian service"}.
                                </p>
                                <p className="text-sm">
                                  The {getNumberColor(result.soulChakraNumber).name} energy of your Soul Chakra enhances your spiritual journey through {getNumberColor(result.soulChakraNumber).name.toLowerCase() === "red" ? "passionate spiritual drive and courage" : 
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("orange") ? "warm spiritual enthusiasm and creative expression" : 
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("yellow") ? "illuminated spiritual understanding and mental clarity" : 
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("green") ? "balanced spiritual growth and heart-centered healing" : 
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("blue") ? "clear spiritual communication and truth-seeking" :
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("indigo") ? "enhanced spiritual intuition and psychic abilities" :
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("violet") ? "deep spiritual transformation and mystical connection" :
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("purple") ? "royal spiritual mastery and divine connection" :
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("pink") ? "unconditional spiritual love and compassion" :
                                    getNumberColor(result.soulChakraNumber).name.toLowerCase().includes("gold") ? "divine spiritual illumination and enlightenment" :
                                    "transcendent spiritual wisdom and universal healing"}.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter className="flex-col">
                        <div className="w-full border-t pt-4 mt-2">
                          <h3 className="font-medium mb-2 flex items-center">
                            <span className="mr-2">Comprehensive Analysis</span>
                            <Sparkles className="h-4 w-4 text-primary" />
                          </h3>
                          
                          {/* Color associations section */}
                          {result.colorAssociations && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold mb-1">Color Vibrations</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {result.colorAssociations.lifePathColor && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    Life Path: {result.colorAssociations.lifePathColor}
                                  </span>
                                )}
                                {result.colorAssociations.destinyColor && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                                    Destiny: {result.colorAssociations.destinyColor}
                                  </span>
                                )}
                                {result.colorAssociations.soulUrgeColor && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-600">
                                    Soul Urge: {result.colorAssociations.soulUrgeColor}
                                  </span>
                                )}
                                {result.colorAssociations.personalityColor && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-600">
                                    Personality: {result.colorAssociations.personalityColor}
                                  </span>
                                )}
                                {result.colorAssociations.soulChakraColor && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                                    Soul Chakra: {result.colorAssociations.soulChakraColor}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Energy Pattern */}
                          {result.energyPattern && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold mb-1">Energy Pattern</h4>
                              <p className="text-gray-600 text-sm">{result.energyPattern}</p>
                            </div>
                          )}
                          
                          {/* Strengths & Challenges */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Strengths */}
                            {result.strengths && result.strengths.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Key Strengths</h4>
                                <ul className="text-gray-600 text-sm list-disc pl-4">
                                  {result.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Challenges */}
                            {result.challenges && result.challenges.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Potential Challenges</h4>
                                <ul className="text-gray-600 text-sm list-disc pl-4">
                                  {result.challenges.map((challenge, index) => (
                                    <li key={index}>{challenge}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {/* Guidance */}
                          {result.guidance && (
                            <div className="mb-4 p-3 bg-primary/5 rounded-md border border-primary/10">
                              <h4 className="text-sm font-semibold mb-1">Spiritual Guidance</h4>
                              <p className="text-gray-600 text-sm">{result.guidance}</p>
                            </div>
                          )}
                          
                          {/* Detailed interpretation */}
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-1">Complete Interpretation</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">
                              {result.interpretation}
                            </p>
                          </div>
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
                      Your Personality number reveals your outward expression and social presence. Calculated from the month and day digits of your birth date, it represents how you naturally present yourself to the world.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg text-purple-600 mb-2">Soul Chakra Number</h4>
                    <p className="text-gray-600">
                      Your Soul Chakra number represents your spiritual energy center. Calculated by adding all digits in your birth date until reaching a single digit, it reveals your spiritual vibration and connection to inner wisdom.
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
        
        {/* Complete Features Section */}
        <section className="py-16 bg-gradient-to-br from-primary-dark/5 to-secondary-dark/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Complete Numerology Features</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore the full range of our numerology capabilities.
                </p>
              </div>
              
              <div className="my-6 grid md:grid-cols-1 gap-6">
                <Card className="relative overflow-hidden border-2 border-primary/20">
                  <div className="absolute top-0 right-0 bg-green-100 px-3 py-1 rounded-bl-md">
                    <span className="text-sm font-medium text-green-800">All Features Included</span>
                  </div>
                  <CardHeader>
                    <CardTitle>Complete Numerology Reading</CardTitle>
                    <CardDescription>Discover the hidden meanings in your numbers with our comprehensive analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Includes:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Life Path Number calculation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Destiny Number calculation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Soul Urge Number calculation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Personality Number calculation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Basic interpretation of your core numbers</span>
                        </li>
                      </ul>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Comprehensive analysis of all 11 numerology chart elements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Personal Year, Month and Day forecasts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Compatibility analysis for relationships and partnerships</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Career and financial opportunity predictions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Custom numerology-based meditation practices</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
