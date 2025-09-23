import { Link } from "wouter";
import { ArrowRight, Camera, Book, Star, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";

// Define service card data
const services = [
  {
    id: "aura-analysis",
    title: "Aura & Chakra Analysis",
    description: "Discover your energy patterns and spiritual traits through advanced aura scanning technology.",
    icon: <Camera className="h-6 w-6 text-primary" />,
    path: "/aura-analysis",
    tags: ["Spiritual", "Energy", "Self-Discovery"]
  },
  {
    id: "object-analysis",
    title: "Object & Space Analysis",
    description: "Uncover the hidden energies and spiritual properties of objects in your environment.",
    icon: <Box className="h-6 w-6 text-purple-500" />,
    path: "/object-analysis",
    tags: ["Energy", "Artifacts", "Intuitive"]
  },
  {
    id: "vibe-check",
    title: "What's My Vibe",
    description: "Discover your dominant aura and get a comprehensive understanding.",
    icon: <Box className="h-6 w-6 text-purple-500" />,
    path: "/#vibe-check-section",
    tags: ["vibe", "aura", "energy"]
  },
  {
    id: "daily-horoscope",
    title: "Daily Horoscope",
    description: "Receive personalized astrological guidance to navigate your day with cosmic insight.",
    icon: <Star className="h-6 w-6 text-secondary" />,
    path: "/daily-horoscope",
    tags: ["Astrology", "Guidance", "Daily"]
  },
  {
    id: "numerology",
    title: "Enhanced Numerology Analysis",
    description: "Discover your Life Path Number, Destiny Number, Decision-making Chakra, and Dominant Soul Chakra for comprehensive spiritual insights.",
    icon: <span className="font-bold text-indigo-500 text-lg">#</span>,
    path: "/numerology",
    tags: ["Life Path", "Destiny", "Chakras", "Soul Analysis"]
  },
  {
    id: "spiritual-journal",
    title: "Spiritual Journal",
    description: "Track your spiritual growth and energy patterns with our intuitive journaling system.",
    icon: <Book className="h-6 w-6 text-accent" />,
    path: "/journal",
    tags: ["Reflection", "Growth", "Tracking"]
  }
];

export default function Services() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-cosmic relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-mystical font-bold mb-4 text-white glow-mystical">Our Spiritual Services</h1>
              <p className="text-xl text-purple-100 mb-8 font-cosmic">
                Discover a range of tools to enhance your spiritual journey and deepen your connection to the universe.
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="mystical" size="lg" className="font-cosmic">
                    <Link href="/auth">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ethereal" size="lg" className="font-cosmic">
                    <Link href="/about">
                      Learn More
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Services Grid */}
        <section className="py-16 bg-gradient-ethereal relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-mystical font-bold mb-12 text-center bg-gradient-mystical bg-clip-text text-transparent glow-ethereal">Explore Our Services</h2>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Card key={service.id} id={service.id} className="overflow-hidden glass-ethereal hover:glow-mystical transition-all duration-300 hover:scale-105">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="mb-4 glass-mystical w-12 h-12 rounded-full flex items-center justify-center glow-ethereal">
                          {service.icon}
                        </div>
                        <h3 className="text-xl font-mystical font-semibold mb-2 text-purple-700">{service.title}</h3>
                        <p className="text-purple-600 mb-4 font-cosmic">{service.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {service.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button asChild variant="cosmic" className="w-full font-cosmic">
                          <Link href={
                            service.id === "numerology" && !user 
                              ? "/auth" 
                              : service.id === "numerology" && user?.userType === "healer"
                                ? "/healer-dashboard?tab=tools"
                                : service.path
                          }>
                            Try {service.title}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Premium Banner */}
        <section className="py-16 bg-gradient-aurora text-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-mystical font-bold mb-4 glow-cosmic">Unlock Premium Features</h2>
              <p className="text-xl mb-8 text-purple-100 font-cosmic">
                Enhance your spiritual journey with detailed readings, advanced insights, and personalized guidance.
              </p>
              <Button asChild size="lg" variant="ethereal" className="font-cosmic">
                <Link href={user ? "/client-dashboard" : "/auth"}>
                  Discover Premium
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}