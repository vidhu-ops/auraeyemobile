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
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white">
        <AuraGlow 
          colors={[
            { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
            { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" },
            { color: "bg-accent/60", bottom: "bottom-0", left: "left-1/3", size: "w-80 h-80", delay: "2s" }
          ]} 
        />
        
        <div className="container mx-auto px-4 py-16 md:py-23 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-black">
                Discover Your <span className="text-black">Aura</span> <br />
                Embrace Your <span className="text-secondary-dark">Energy</span>
              </h1>
              <p className="text-black md:text-xl opacity-90 mb-8 max-w-lg">
                Unlock the power of your personal energy field with AI-powered aura readings, personalized spiritual guidance, and healing practices.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary-dark">
                  <Link href="/aura-analysis">
                    <Camera className="mr-2 h-5 w-5" /> Scan Your Aura
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-black hover:bg-white hover:text-primary-dark">
                  <Link href="#services">
                    <BookOpen className="mr-2 h-5 w-5" /> Explore Services
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <img 
                src="https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Person with spiritual aura" 
                className="rounded-2xl shadow-2xl z-10 relative w-full max-w-md mx-auto animate-float" 
              />
              <div className="absolute inset-0 bg-gradient-radial from-secondary-light/30 to-transparent rounded-2xl scale-110 aura-animate"></div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
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
              link="/numerology"
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

          <div className="max-w-4xl mx-auto">
            <Button asChild size="lg" className="mx-auto bg-primary hover:bg-primary-dark">
              <Link href="/aura-analysis">
                <Camera className="mr-2 h-5 w-5" /> Try Aura Analysis
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
