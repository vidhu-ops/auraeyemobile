import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ServiceCard from "@/components/ui/service-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Camera, BookOpen, Upload, Star, HandHelping, Book, Calculator, Clover, Box, Loader2, Sparkles, Heart, AlertTriangle } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface QuickVibeResult {
  dominantColor: string;
  colorMeaning: {
    positive: string;
    negative: string;
  };
  energyLevel: number;
  message: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [vibeResult, setVibeResult] = useState<QuickVibeResult | null>(null);

  // Quick vibe analysis mutation
  const quickVibeMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('/api/quick-vibe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze vibe');
      }
      
      return response.json();
    },
    onSuccess: (data: QuickVibeResult) => {
      setVibeResult(data);
      toast({
        title: "Vibe Analysis Complete!",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setVibeResult(null); // Clear previous results
    }
  };

  const analyzeVibe = () => {
    if (selectedImage) {
      quickVibeMutation.mutate(selectedImage);
    }
  };

  const resetVibeCheck = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setVibeResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Color gradients for aura display - only 12 approved colors
  const getColorGradient = (color: string) => {
    const gradients = {
      'Red': 'from-red-500/30 to-red-600/10',
      'Orange': 'from-orange-500/30 to-orange-600/10',
      'Yellow': 'from-yellow-500/30 to-yellow-600/10',
      'Green': 'from-green-500/30 to-green-600/10',
      'Blue': 'from-blue-500/30 to-blue-600/10',
      'Violet': 'from-violet-500/30 to-violet-600/10',
      'Indigo': 'from-indigo-500/30 to-indigo-600/10',
      'White': 'from-white/30 to-gray-200/10',
      'Brown': 'from-amber-800/30 to-amber-900/10',
      'Gold': 'from-yellow-400/30 to-yellow-500/10',
      'Silver': 'from-gray-400/30 to-gray-500/10',
      'Black': 'from-gray-800/30 to-gray-900/10',
    };
    return gradients[color as keyof typeof gradients] || 'from-violet-500/30 to-violet-600/10';
  };

  // Color borders for result display
  const getColorBorder = (color: string) => {
    const borders = {
      'Red': 'bg-red-500',
      'Orange': 'bg-orange-500',
      'Yellow': 'bg-yellow-500',
      'Green': 'bg-green-500',
      'Blue': 'bg-blue-500',
      'Violet': 'bg-violet-500',
      'Indigo': 'bg-indigo-500',
      'White': 'bg-white border-2 border-gray-300',
      'Brown': 'bg-amber-800',
      'Gold': 'bg-yellow-400',
      'Silver': 'bg-gray-400',
      'Black': 'bg-gray-800',
    };
    return borders[color as keyof typeof borders] || 'bg-violet-500';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-indigo-900 via-purple-800 to-violet-900 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNmZmZmZmYyMCIgLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiIC8+PC9zdmc+')]"></div>
        
        <AuraGlow 
          colors={[
            { color: "bg-pink-500/30", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
            { color: "bg-cyan-500/30", bottom: "bottom-1/3", right: "right-10", size: "w-80 h-80", delay: "1.5s" },
            { color: "bg-amber-400/30", bottom: "bottom-10", left: "left-1/4", size: "w-72 h-72", delay: "3s" },
            { color: "bg-emerald-400/20", top: "top-10", right: "right-1/4", size: "w-64 h-64", delay: "4.5s" }
          ]} 
        />
        
        {/* Floating elements with animation */}
        <div className="absolute top-1/3 right-10 w-12 h-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 opacity-60 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-16 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 opacity-40 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-300 to-cyan-500 opacity-50 animate-pulse animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 animate-fade-in-down">
              <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-200">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">Aura</span> <br />
                Embrace Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Energy</span>
              </h1>
            </div>
            
            <div className="max-w-2xl mx-auto mb-10 animate-fade-in">
              <p className="text-white/90 text-xl md:text-2xl">
                Unlock the power of your personal energy field with aura readings, personalized spiritual guidance, and healing practices.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 border-0 text-white px-8 py-6 rounded-full">
                <Link href="/aura-analysis">
                  <Camera className="mr-2 h-5 w-5" /> Human Aura Analysis
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 border-0 text-white px-8 py-6 rounded-full">
                <Link href="/object-analysis">
                  <Box className="mr-2 h-5 w-5" /> Object Aura Analysis
                </Link>
              </Button>
              <Button 
                onClick={() => document.getElementById('vibe-check-section')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 text-white px-8 py-6 rounded-full"
              >
                <Sparkles className="mr-2 h-5 w-5" /> What's My Vibe?
              </Button>
            </div>
            
            {/* Visual element replacing the image */}
            <div className="mt-16 flex justify-center animate-fade-in">
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/60 to-violet-500/60 blur-lg animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-cyan-500/60 to-blue-500/60 blur-md animate-pulse animation-delay-1000"></div>
                <div className="absolute inset-16 rounded-full bg-gradient-to-r from-amber-400/60 to-orange-500/60 blur-sm animate-pulse animation-delay-2000"></div>
                <div className="absolute inset-20 rounded-full bg-black/10 backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider - updated with new color */}
        <div className="absolute bottom-0 left-0 w-0 overflow-hidden leading-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16" fill="#F7FAFC">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </svg>
        </div>
      </section>
      
      {/* What's My Vibe? Section */}
      <section id="vibe-check-section" className="py-20 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-violet-500 mr-3" />
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900">
                What's My Vibe?
              </h2>
              <Sparkles className="h-8 w-8 text-violet-500 ml-3" />
            </div>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Get an instant glimpse into your spiritual energy! Upload your photo for a quick aura color reading.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                {!imagePreview ? (
                  /* Upload Section */
                  <div className="text-center">
                    <div className="border-2 border-dashed border-violet-300 rounded-xl p-12 bg-violet-50/50 hover:bg-violet-50 transition-colors">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                          <Camera className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Upload Your Photo
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                          Choose a clear photo of yourself to discover your dominant aura color and energy signature.
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          size="lg"
                          className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          Choose Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Analysis Section */
                  <div className="space-y-8">
                    <div className="flex flex-col lg:flex-row gap-8 justify-center">
                      {/* Image Preview */}
                      <div className="flex-1 flex justify-center">
                        <div className="relative max-w-md w-full">
                          <img
                            src={imagePreview}
                            alt="Your photo"
                            className="w-full rounded-lg shadow-lg justify-center"
                          />
                          {vibeResult && (
                            <div className={`absolute inset-0 rounded-lg bg-gradient-radial ${getColorGradient(vibeResult.dominantColor)} pointer-events-none`}></div>
                          )}
                        </div>
                      </div>

                      {/* Results or Analysis Button */}
                      <div className="flex-1 space-y-6">
                        {!vibeResult ? (
                          <div className="text-center">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                              Ready to discover your vibe?
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Click analyze to reveal your dominant aura color and its spiritual meaning.
                            </p>
                            <div className="space-y-3">
                              <Button
                                onClick={analyzeVibe}
                                disabled={quickVibeMutation.isPending}
                                size="lg"
                                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                              >
                                {quickVibeMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Your Vibe...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Analyze My Vibe
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={resetVibeCheck}
                                variant="outline"
                                className="w-full"
                              >
                                Choose Different Photo
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Results Display */
                          <div className="space-y-6 text-center">
                            <div>
                              <div className="flex items-center justify-center mb-4">
                                <div className={`w-8 h-8 rounded-full mr-3 ${(() => {
                                  const borders = {
                                    'Red': 'bg-red-500',
                                    'Orange': 'bg-orange-500',
                                    'Yellow': 'bg-yellow-500',
                                    'Green': 'bg-green-500',
                                    'Blue': 'bg-blue-500',
                                    'Violet': 'bg-violet-500',
                                    'Indigo': 'bg-indigo-500',
                                    'White': 'bg-white border-2 border-gray-300',
                                    'Brown': 'bg-amber-800',
                                    'Gold': 'bg-yellow-400',
                                    'Silver': 'bg-gray-400',
                                    'Black': 'bg-gray-800',
                                  };
                                  return borders[vibeResult.dominantColor as keyof typeof borders] || 'bg-violet-500';
                                })()}`}></div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                  Your Vibe: {vibeResult.dominantColor}
                                </h3>
                              </div>
                              <p className="text-lg text-violet-600 font-medium mb-6">
                                {vibeResult.message}
                              </p>
                            </div>

                            {/* Positive & Negative Meanings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                              <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-4">
                                  <div className="flex items-start">
                                    <Heart className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                    <div>
                                      <h4 className="font-semibold text-green-800 mb-2">Positive Energy</h4>
                                      <p className="text-sm text-green-700">{vibeResult.colorMeaning.positive}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-orange-50 border-orange-200">
                                <CardContent className="p-4">
                                  <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                                    <div>
                                      <h4 className="font-semibold text-orange-800 mb-2">Areas to Balance</h4>
                                      <p className="text-sm text-orange-700">{vibeResult.colorMeaning.negative}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4">
                              <Link to="/aura-analysis">
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
                                  Get Full Aura Analysis
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                onClick={resetVibeCheck}
                                variant="outline"
                                className="w-full"
                              >
                                Try Another Photo
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Aura Upload Preview */}
      <section id="upload-preview" className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-dark mb-4">Scan Your Aura</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Upload your photo and our AI will analyze your energy field, revealing your aura colors and providing personalized insights.</p>
          </div>

          <div className="max-w-4xl mx-auto flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark">
              <Link href="/aura-analysis" className="flex items-center">
                <Camera className="mr-3 h-5 w-5" /> Try Aura Analysis
              </Link>
            </Button>
          </div>

          {/* Sample readings */}
          <div className="mt-16">
            <h3 className="font-heading font-semibold text-2xl text-center mb-8">Sample Aura Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sample 1 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img src="https://images.pexels.com/photos/3812944/pexels-photo-3812944.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Woman with purple aura" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-radial from-purple-500/30 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                    <h4 className="font-heading font-semibold">Purple Dominant</h4>
                  </div>
                  <p className="text-gray-600 text-sm">A spiritual individual with strong intuition. Your crown chakra shows high activity, indicating a deep connection to higher consciousness.</p>
                </div>
              </div>
              
              {/* Sample 2 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img src="https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Man with green-gold aura" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-radial from-green-500/30 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                    <h4 className="font-heading font-semibold">Green Dominant</h4>
                  </div>
                  <p className="text-gray-600 text-sm">A natural healer with a compassionate heart. Your heart chakra radiates strongly, showing your capacity for unconditional love and healing others.</p>
                </div>
              </div>
              
              {/* Sample 3 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Person with blue aura" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-radial from-blue-500/30 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                    <h4 className="font-heading font-semibold">Blue Dominant</h4>
                  </div>
                  <p className="text-gray-600 text-sm">A clear communicator with strong self-expression. Your throat chakra shows vibrant energy, indicating authentic expression and creative abilities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-dark text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">What Our Community Says</h2>
            <p className="text-black/80 max-w-5xl mx-auto">Hear from members who have experienced transformation through our spiritual services.</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TestimonialCard 
                rating={5}
                testimonial="The aura reading was incredibly accurate! It revealed colors I've always been drawn to and explained energy patterns that made so much sense. The guidance provided helped me focus on areas where my energy was blocked."
                name="Sarah M."
                title="Yoga Instructor"
                initials="SM"
                bgColor="primary"
              />
              
              <TestimonialCard 
                rating={5}
                testimonial="I was skeptical at first, but the numerology reading was eye-opening. The insights about my life path number explained challenges I've faced and provided clarity about my purpose. I've recommended Aurfy to all my friends."
                name="James T."
                title="Business Consultant"
                initials="JT"
                bgColor="secondary"
              />
              
              <TestimonialCard 
                rating={4.5}
                testimonial="The guided meditations have been transformative for my spiritual practice. I feel more connected to my inner self and have noticed a significant improvement in my energy levels. The journal feature helps me track my progress."
                name="Elena P."
                title="Art Therapist"
                initials="EP"
                bgColor="accent"
              />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
