import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { AuraGlow } from "@/components/ui/aura-glow";
import { Card, CardContent } from "@/components/ui/card";
import { getDailyHoroscope, HoroscopeResult } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Calendar } from "lucide-react";
import ZodiacButton from "@/components/ui/zodiac-button";
import { useQuery } from "@tanstack/react-query";

export default function DailyHoroscope() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSign, setSelectedSign] = useState("aries");
  const [email, setEmail] = useState("");
  const [emailSign, setEmailSign] = useState("");
  
  // Get daily horoscope for the selected sign with daily cache invalidation
  const {
    data: horoscope,
    isLoading,
    error,
    refetch
  } = useQuery<HoroscopeResult>({
    queryKey: ["/api/horoscope", selectedSign, new Date().toISOString().split('T')[0]], // Include date for daily refresh
    queryFn: () => getDailyHoroscope(selectedSign),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours stale time
    gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection
  });

  // Fetch horoscope when sign changes
  useEffect(() => {
    if (selectedSign) {
      refetch();
    }
  }, [selectedSign, refetch]);

  const handleSignSelect = (sign: string) => {
    setSelectedSign(sign);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !emailSign) {
      toast({
        title: "Subscription Error",
        description: "Please enter your email and select your sign.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would send to an API endpoint
    toast({
      title: "Subscription Successful",
      description: `You will now receive daily ${emailSign} horoscopes!`,
    });
    
    setEmail("");
    setEmailSign("");
  };

  // Helper function to render star ratings
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-accent fill-accent' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Zodiac sign information
  const zodiacSigns = [
    { name: "Aries", icon: "♈", date: "Mar 21 - Apr 19" },
    { name: "Taurus", icon: "♉", date: "Apr 20 - May 20" },
    { name: "Gemini", icon: "♊", date: "May 21 - Jun 20" },
    { name: "Cancer", icon: "♋", date: "Jun 21 - Jul 22" },
    { name: "Leo", icon: "♌", date: "Jul 23 - Aug 22" },
    { name: "Virgo", icon: "♍", date: "Aug 23 - Sep 22" },
    { name: "Libra", icon: "♎", date: "Sep 23 - Oct 22" },
    { name: "Scorpio", icon: "♏", date: "Oct 23 - Nov 21" },
    { name: "Sagittarius", icon: "♐", date: "Nov 22 - Dec 21" },
    { name: "Capricorn", icon: "♑", date: "Dec 22 - Jan 19" },
    { name: "Aquarius", icon: "♒", date: "Jan 20 - Feb 18" },
    { name: "Pisces", icon: "♓", date: "Feb 19 - Mar 20" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="relative text-white py-16">
          <AuraGlow 
            colors={[
              { color: "bg-primary-dark", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-mystical font-bold text-3xl md:text-4xl mb-4 text-center glow-mystical">Daily Astrological Guidance</h1>
            <p className="text-purple-100 max-w-2xl mx-auto text-center font-cosmic">
              Select your zodiac sign to receive personalized daily horoscope readings and cosmic insights.
            </p>
          </div>
        </section>
        
        {/* Zodiac sign selector */}
        <section className="py-12 bg-gradient-ethereal">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-mystical font-semibold text-xl mb-6 text-center text-black">Select Your Zodiac Sign</h2>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 text-balck mb-10 text-black">
                {zodiacSigns.map((sign) => (
                  <ZodiacButton
                    key={sign.name.toLowerCase()}
                    sign={sign.name}
                    icon={<span className="text-xl text-black">{sign.icon}</span>}
                    isSelected={selectedSign === sign.name.toLowerCase()}
                    onClick={() => handleSignSelect(sign.name.toLowerCase())}
                  />
                ))}
              </div>

              {/* Cosmic energy overview */}
              <div className="mb-8">
                <h3 className="font-mystical font-semibold text-xl mb-4 text-black">Today's Cosmic Energy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 
                  
                  
                  
                 
                </div>
              </div>

              {/* Horoscope display card */}
              <Card className="glass-ethereal hover:glow-mystical transition-all duration-300 rounded-2xl overflow-hidden">
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="h-80 flex items-center justify-center p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-mystical text-red-400 mb-2">Unable to load horoscope</h3>
                      <p className="text-purple-600 font-cosmic">Please try again or select a different sign.</p>
                      <Button onClick={() => refetch()} variant="cosmic" className="mt-4 font-cosmic">
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : horoscope ? (
                  <>
                    <div className="bg-primary text-black p-6">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">
                          {zodiacSigns.find(z => z.name.toLowerCase() === horoscope.sign.toLowerCase())?.icon || '★'}
                        </div>
                        <div>
                          <h3 className="font-mystical font-bold text-xl capitalize">{horoscope.sign}</h3>
                          <p className="text-sm opacity-90">
                            {zodiacSigns.find(z => z.name.toLowerCase() === horoscope.sign.toLowerCase())?.date}
                          </p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm font-medium">Today's Reading</p>
                          <p className="text-sm opacity-90">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date().toLocaleDateString("en-US", { 
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="prose max-w-none space-y-4">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-medium text-lg mb-2">Daily Overview</h4>
                          <p>{horoscope.reading}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-secondary/5 rounded-lg">
                            <h4 className="font-medium text-lg mb-2">Celestial Influence</h4>
                            <p>The current planetary alignments are creating {horoscope.career > 3 ? "favorable" : "challenging"} conditions for professional growth and personal development.</p>
                          </div>
                          
                          <div className="p-4 bg-accent/5 rounded-lg">
                            <h4 className="font-medium text-lg mb-2">Energy Focus</h4>
                            <p>Channel your energy towards {horoscope.spirituality > 3 ? "spiritual growth and inner wisdom" : "practical matters and grounding activities"}. Your {horoscope.love > 3 ? "heightened emotional sensitivity" : "pragmatic approach"} will serve you well today.</p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                          <h4 className="font-medium text-lg mb-2">Daily Affirmation</h4>
                          <p className="italic text-center">"I embrace the cosmic energy flowing through me, guiding me towards my highest potential."</p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-purple-500 mb-1 font-cosmic">Love</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.love)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-purple-500 mb-1 font-cosmic">Career</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.career)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-purple-500 mb-1 font-cosmic">Health</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.health)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-purple-500 mb-1 font-cosmic">Spirituality</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.spirituality)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-medium mb-2">Select a sign to see your horoscope</h3>
                      <p className="text-gray-600">Your daily cosmic guidance awaits.</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Newsletter subscription */}
            <div className="mt-12 max-w-xl mx-auto bg-primary/5 rounded-xl p-6">
              <h3 className="font-heading font-semibold text-lg mb-3">Get Daily Horoscope Updates</h3>
              <p className="text-gray-600 text-sm mb-4">Subscribe to receive your personalized horoscope in your inbox every morning.</p>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubscribe}>
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow" 
                />
                <select 
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={emailSign}
                  onChange={(e) => setEmailSign(e.target.value)}
                >
                  <option value="">Select your sign</option>
                  {zodiacSigns.map(sign => (
                    <option key={sign.name} value={sign.name.toLowerCase()}>
                      {sign.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="bg-primary hover:bg-primary-dark text-white font-medium whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </section>
        
        {/* Astrology insights section */}
        
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}
