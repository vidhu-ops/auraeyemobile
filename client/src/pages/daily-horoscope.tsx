import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
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
  
  // Get daily horoscope for the selected sign
  const {
    data: horoscope,
    isLoading,
    error,
    refetch
  } = useQuery<HoroscopeResult>({
    queryKey: ["/api/horoscope", selectedSign],
    queryFn: () => getDailyHoroscope(selectedSign),
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
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white py-16">
          <AuraGlow 
            colors={[
              { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-center">Daily Astrological Guidance</h1>
            <p className="text-white/80 max-w-2xl mx-auto text-center">
              Select your zodiac sign to receive personalized daily horoscope readings and cosmic insights.
            </p>
          </div>
        </section>
        
        {/* Zodiac sign selector */}
        <section className="py-12 bg-light">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading font-semibold text-xl mb-6 text-center">Select Your Zodiac Sign</h2>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
                {zodiacSigns.map((sign) => (
                  <ZodiacButton
                    key={sign.name.toLowerCase()}
                    sign={sign.name}
                    icon={<span className="text-xl">{sign.icon}</span>}
                    isSelected={selectedSign === sign.name.toLowerCase()}
                    onClick={() => handleSignSelect(sign.name.toLowerCase())}
                  />
                ))}
              </div>

              {/* Cosmic energy overview */}
              <div className="mb-8">
                <h3 className="font-heading font-semibold text-xl mb-4">Today's Cosmic Energy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Lunar Phase</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                        <div>
                          <p className="font-medium">Waxing Gibbous</p>
                          <p className="text-sm text-gray-600">78% Illuminated</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Planetary Ruler</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl">
                          ♂
                        </div>
                        <div>
                          <p className="font-medium">Mars in Taurus</p>
                          <p className="text-sm text-gray-600">Grounding Energy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Element & Quality</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center text-white text-2xl">
                          🔥
                        </div>
                        <div>
                          <p className="font-medium">Fire - Cardinal</p>
                          <p className="text-sm text-gray-600">Dynamic & Initiating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Horoscope display card */}
              <Card className="rounded-2xl shadow-xl overflow-hidden">
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="h-80 flex items-center justify-center p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-red-500 mb-2">Unable to load horoscope</h3>
                      <p className="text-gray-600">Please try again or select a different sign.</p>
                      <Button onClick={() => refetch()} className="mt-4">
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : horoscope ? (
                  <>
                    <div className="bg-primary text-white p-6">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">
                          {zodiacSigns.find(z => z.name.toLowerCase() === horoscope.sign.toLowerCase())?.icon || '★'}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-xl capitalize">{horoscope.sign}</h3>
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
                          <p className="text-xs text-gray-500 mb-1">Love</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.love)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Career</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.career)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Health</p>
                          <div className="flex justify-center">
                            {renderStarRating(horoscope.health)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Spirituality</p>
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
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8 text-center">Cosmic Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-4">Planetary Positions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Sun in {horoscope?.sign || "Aries"}</span>
                      <span className="text-primary">♈</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Moon in Cancer</span>
                      <span className="text-primary">♋</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mercury in Taurus</span>
                      <span className="text-primary">♉</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Venus in Gemini</span>
                      <span className="text-primary">♊</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mars in Pisces</span>
                      <span className="text-primary">♓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jupiter in Taurus</span>
                      <span className="text-primary">♉</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturn in Pisces</span>
                      <span className="text-primary">♓</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-4">Moon Phases</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 bg-gray-800 rounded-full overflow-hidden mb-4">
                      <div className="absolute inset-0 bg-white rounded-full right-0" style={{ clipPath: 'inset(0 16px 0 0)' }}></div>
                    </div>
                    <p className="font-medium">Waxing Gibbous</p>
                    <p className="text-sm text-gray-500 mt-1">78% illuminated</p>
                    
                    <div className="grid grid-cols-4 w-full mt-6 gap-2">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-gray-800 rounded-full mx-auto"></div>
                        <p className="text-xs mt-1">New</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-gray-800 rounded-full mx-auto overflow-hidden">
                          <div className="h-full w-1/2 bg-white float-right"></div>
                        </div>
                        <p className="text-xs mt-1">First</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-white rounded-full mx-auto"></div>
                        <p className="text-xs mt-1">Full</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-gray-800 rounded-full mx-auto overflow-hidden">
                          <div className="h-full w-1/2 bg-white float-left"></div>
                        </div>
                        <p className="text-xs mt-1">Last</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-4">Astrological Events</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Mercury Retrograde</p>
                      <p className="text-sm text-gray-500">Apr 21 - May 14</p>
                      <p className="text-xs mt-1">Communication challenges may arise. Focus on reflection rather than new initiatives.</p>
                    </div>
                    <div>
                      <p className="font-medium">Solar Eclipse in Aries</p>
                      <p className="text-sm text-gray-500">Apr 8</p>
                      <p className="text-xs mt-1">A powerful time for new beginnings and setting intentions aligned with your authentic self.</p>
                    </div>
                    <div>
                      <p className="font-medium">Venus-Jupiter Conjunction</p>
                      <p className="text-sm text-gray-500">May 23</p>
                      <p className="text-xs mt-1">A fortunate alignment bringing opportunities for love, abundance, and joy.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
