import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ServiceCard from "@/components/ui/service-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Camera, BookOpen, Upload, Star, HandHelping, Book, Calculator, Clover, Box } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

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
      
      {/* Services Section */}
      <section id="services" className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-dark mb-4">Our Spiritual Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">Explore our range of metaphysical wellness services designed to help you connect with your inner self and enhance your spiritual journey.</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/services">
                View All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Upload className="h-6 w-6 text-primary" />}
              title="AI Aura Analysis"
              description="Upload your photo and receive an AI-powered analysis of your aura colors and energy patterns with personalized insights."
              link="/aura-analysis"
              linkText="Try Now"
              color="primary"
            />
            
            <ServiceCard
              icon={<Star className="h-6 w-6 text-secondary" />}
              title="Daily Horoscope"
              description="Get personalized daily astrological insights for your zodiac sign, helping you navigate life's challenges with cosmic guidance."
              link="/daily-horoscope"
              linkText="View Horoscope"
              color="secondary"
            />
            
            <ServiceCard
              icon={<Box className="h-6 w-6 text-purple-500" />}
              title="Object Analysis"
              description="Uncover the hidden energies and spiritual properties of objects in your environment through our advanced AI analysis."
              link="/object-analysis"
              linkText="Analyze Objects"
              color="secondary"
            />
            
            <ServiceCard
              icon={<HandHelping className="h-6 w-6 text-accent" />}
              title="Energy Healing"
              description="Connect with certified healers who can help balance your chakras and restore harmony to your energy field through virtual sessions."
              link={user ? (user.userType === "healer" ? "/healer-dashboard" : "/client-dashboard") : "/auth"}
              linkText="Book a Session"
              color="accent"
            />
            
            <ServiceCard
              icon={<Book className="h-6 w-6 text-primary" />}
              title="Spiritual Journaling"
              description="Track your spiritual growth with our guided journaling tools that help you document your insights, dreams, and energy shifts."
              link="/journal"
              linkText="Start Journal"
              color="primary"
            />
            
            <ServiceCard
              icon={<Calculator className="h-6 w-6 text-secondary" />}
              title="Numerology Reading"
              description="Discover the hidden meanings in your birth date and name with our comprehensive numerology analysis and life path guidance."
              link={user ? "/numerology" : "/auth"}
              linkText="Calculate Numbers"
              color="secondary"
            />
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
