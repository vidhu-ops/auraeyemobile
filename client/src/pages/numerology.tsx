import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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

// Numerology calculation functions
const letterToNumber = (letter: string): number => {
  const upperLetter = letter.toUpperCase();
  if (upperLetter >= 'A' && upperLetter <= 'I') return upperLetter.charCodeAt(0) - 64;
  if (upperLetter >= 'J' && upperLetter <= 'R') return upperLetter.charCodeAt(0) - 73;
  if (upperLetter >= 'S' && upperLetter <= 'Z') return upperLetter.charCodeAt(0) - 82;
  return 0;
};

const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
};

const calculateLifePath = (date: string): number => {
  const cleanDate = date.replace(/\D/g, '');
  const sum = cleanDate.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return reduceNumber(sum);
};

const calculateDestiny = (fullName: string): number => {
  const sum = fullName.replace(/[^a-zA-Z]/g, '').split('').reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
};

const calculateSoulUrge = (fullName: string): number => {
  const vowels = fullName.replace(/[^aeiouAEIOU]/g, '');
  const sum = vowels.split('').reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
};

const calculatePersonality = (fullName: string): number => {
  const consonants = fullName.replace(/[aeiouAEIOU\s]/g, '');
  const sum = consonants.split('').reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
};

interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  soulChakraNumber: number;
  interpretation: string;
}

const numerologySchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().min(1, "Birth date is required")
});

type NumerologyFormData = z.infer<typeof numerologySchema>;

export default function NumerologyPage() {
  const { user } = useAuth();
  const [calculatedNumbers, setCalculatedNumbers] = useState<NumerologyResult | null>(null);
  const [isLoadingNumerology, setIsLoadingNumerology] = useState(false);

  const form = useForm<NumerologyFormData>({
    resolver: zodResolver(numerologySchema),
    defaultValues: {
      name: user?.username || "",
      birthDate: user?.birthDate || ""
    }
  });

  const calculateLocalNumerology = (name: string, birthDate: string): NumerologyResult => {
    const lifePathNumber = calculateLifePath(birthDate);
    const destinyNumber = calculateDestiny(name);
    const soulUrgeNumber = calculateSoulUrge(name);
    const personalityNumber = calculatePersonality(name);
    const soulChakraNumber = reduceNumber(lifePathNumber + destinyNumber);

    const interpretation = `Your Life Path number ${lifePathNumber} represents your core purpose and journey through life. Your Destiny number ${destinyNumber} reveals your life's mission and what you're meant to accomplish. Your Soul Urge number ${soulUrgeNumber} shows your inner desires and what truly motivates you. Your Personality number ${personalityNumber} indicates how others perceive you and your outer persona. Your Soul Chakra number ${soulChakraNumber} represents your spiritual energy center for growth and balance.`;

    return {
      lifePathNumber,
      destinyNumber,
      soulUrgeNumber,
      personalityNumber,
      soulChakraNumber,
      interpretation
    };
  };

  const onSubmit = async (data: NumerologyFormData) => {
    if (!data.name.trim() || !data.birthDate.trim()) {
      return;
    }

    setIsLoadingNumerology(true);
    
    try {
      // Calculate numerology locally
      const result = calculateLocalNumerology(data.name, data.birthDate);
      setCalculatedNumbers(result);
    } catch (error) {
      console.error("Error calculating numerology:", error);
    } finally {
      setIsLoadingNumerology(false);
    }
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
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Your Numbers</CardTitle>
              <CardDescription>
                Enter your information to discover all your numerological numbers and their meanings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  
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

          {/* Display calculated numbers when form is submitted */}
          {calculatedNumbers && (
            <div className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Your Complete Numerology Profile
                  </CardTitle>
                  <CardDescription>All your numerological numbers and their detailed meanings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Life Path Number */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">{calculatedNumbers.lifePathNumber}</span>
                        </div>
                        <h3 className="font-semibold text-green-800 mb-2">Life Path Number</h3>
                        <p className="text-sm text-green-600">Your life's journey and core purpose</p>
                        <p className="text-xs text-green-500 mt-2">Your main life lesson and path</p>
                      </div>
                    </div>

                    {/* Destiny Number */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">{calculatedNumbers.destinyNumber}</span>
                        </div>
                        <h3 className="font-semibold text-yellow-800 mb-2">Destiny Number</h3>
                        <p className="text-sm text-yellow-600">Your life's mission and calling</p>
                        <p className="text-xs text-yellow-500 mt-2">What you're meant to accomplish</p>
                      </div>
                    </div>

                    {/* Soul Urge Number */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">{calculatedNumbers.soulUrgeNumber}</span>
                        </div>
                        <h3 className="font-semibold text-purple-800 mb-2">Soul Urge Number</h3>
                        <p className="text-sm text-purple-600">Your inner desires and motivations</p>
                        <p className="text-xs text-purple-500 mt-2">What drives you from within</p>
                      </div>
                    </div>

                    {/* Personality Number */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">{calculatedNumbers.personalityNumber}</span>
                        </div>
                        <h3 className="font-semibold text-blue-800 mb-2">Personality Number</h3>
                        <p className="text-sm text-blue-600">How others perceive you</p>
                        <p className="text-xs text-blue-500 mt-2">Your outer persona and impression</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Numbers Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Soul Chakra Number */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">{calculatedNumbers.soulChakraNumber}</span>
                        </div>
                        <h3 className="font-semibold text-orange-800 mb-2">Soul Chakra Number</h3>
                        <p className="text-sm text-orange-600">Your spiritual energy center</p>
                        <p className="text-xs text-orange-500 mt-2">Key area for spiritual growth</p>
                      </div>
                    </div>

                    {/* Master Numbers Info */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Master Numbers</h3>
                        <p className="text-sm text-gray-600">11, 22, 33 carry special power</p>
                        <p className="text-xs text-gray-500 mt-2">Enhanced spiritual significance</p>
                      </div>
                    </div>
                  </div>

                  {/* Complete Interpretation */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Complete Interpretation</h4>
                    <p className="text-gray-700 leading-relaxed">{calculatedNumbers.interpretation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoadingNumerology && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Calculating Your Numbers</h3>
              <p className="text-gray-600">Analyzing your spiritual blueprint...</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}