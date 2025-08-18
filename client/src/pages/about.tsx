import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuraGlow } from "@/components/ui/aura-glow";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Users, Heart, Sparkles, Brain, Palette } from "lucide-react";
import nishantImage from "@assets/WhatsApp Image 2025-08-11 at 3.52.01 AM_1755270078104.jpeg";
import aboutHeroImage from "@assets/WhatsApp Image 2025-08-18 at 3.35.45 AM_1755540582047.jpeg";
import auraAnalysisImage from "@assets/WhatsApp Image 2025-08-18 at 3.40.10 AM_1755540718923.jpeg";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white py-16 md:py-2">
          <AuraGlow 
            colors={[
              { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">About AuraEye</h1>
              <p className="text-xl opacity-90 mb-8">
                We're on a mission to make spiritual wellness and energy healing accessible to everyone through the power of technology and ancient wisdom.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our story section */}
        <section className="py-16 bg-light">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h2 className="font-heading font-bold text-3xl mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Our platform connects you with certified energy healers who can provide remote healing sessions. All our practitioners have undergone rigorous training and certification in modalities like Aurascope reading, Reiki, Quantum Healing, Chakra Balancing, and other energy medicine techniques.

                  
                </p>
                <p className="text-gray-600 mb-4">
                  Research has shown that energy healing can be effective at a distance, as energy is not bound by physical proximity. Our virtual sessions create a sacred space for healing to occur, regardless of where you're located.
                </p>
                <p className="text-gray-600">
                  Our name, AuraEye™, represents the fusion of "Aura" (the energy field that surrounds all living beings) and "Eye" (To see), embodying our mission to strengthen your spiritual well-being through deeper understanding of your energetic nature.
                </p>
              </div>
              
              <div className="relative">
                <img 
                  src={aboutHeroImage} 
                  alt="Spiritual energy and healing" 
                  className="rounded-xl shadow-xl w-full h-auto object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                  <p className="text-gray-600 italic">
                    "Our aura is not just limited to positive or negative vibes, infact it is the blueprint of our soul" 
                  </p>
                  <p className="text-right text-gray-500 mt-2">- AuraEye™ founder.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission and values */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading font-bold text-3xl mb-4">Our Mission & Values</h2>
              <p className="text-gray-600">
                At the heart of everything we do is a commitment to spiritual authenticity, personal transformation, and making metaphysical wellness accessible to all.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">Authenticity</h3>
                  <p className="text-gray-600">
                    We honor the ancient wisdom traditions while embracing modern technology, creating a spiritual practice that is both authentic and relevant for today's world.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">Accessibility</h3>
                  <p className="text-gray-600">
                    We believe spiritual wellness should be available to all, regardless of location or experience level. Our platform makes metaphysical tools accessible to everyone.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">Transformation</h3>
                  <p className="text-gray-600">
                    We're committed to facilitating real transformation in our users' lives, providing tools that catalyze personal growth and spiritual evolution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Our approach */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-heading font-bold text-3xl mb-4">Our Approach</h2>
              <p className="text-gray-600">
                We combine ancient wisdom with cutting-edge technology to provide you with accurate, personalized spiritual guidance.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="ai">Aura Analysis</TabsTrigger>
                  <TabsTrigger value="healing">Energy Healing</TabsTrigger>
                  <TabsTrigger value="research">Our Research</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ai">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="font-heading font-semibold text-2xl mb-4">Aura Analysis</h3>
                      <p className="text-gray-600 mb-4">
                        Our proprietary algorithms have been trained on thousands of aura readings performed by master healers and psychics. By analyzing the hidden energy patterns in your uploaded photos, our system can detect your aura colors and energy patterns with remarkable accuracy.
                      </p>
                      <p className="text-gray-600 mb-6">
                        We've combined this technology with deep knowledge of chakra systems, energy medicine, and metaphysical principles to provide you with insights that are not just accurate but spiritually meaningful and practical.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Certified AuraEye™ Readers, trained to pin point exact blocks in your aura & chakras
                            
                            
                            </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Convenient scheduling for sessions from anywhere</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Get complete clarity about your aura with digital reports and remedies</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Verified and experienced energy healers with specific expertise</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="relative">
                      <img 
                        src={auraAnalysisImage} 
                        alt="Aura analysis and spiritual energy reading" 
                        className="rounded-xl shadow-lg w-full h-auto object-cover"
                      />
                      <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-500 to-blue-500 text-white p-3 rounded-lg shadow-lg text-sm font-medium">
                        Powered by advanced Analysis algorithms
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="healing">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1 relative">
                      <img 
                        src="https://images.pexels.com/photos/8964915/pexels-photo-8964915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                        alt="Energy healing session" 
                        className="rounded-xl shadow-lg"
                      />
                      <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-green-500 to-teal-500 text-white p-3 rounded-lg shadow-lg text-sm font-medium">
                        Certified energy practitioners
                      </div>
                    </div>
                    
                    <div className="order-1 md:order-2">
                      <h3 className="font-heading font-semibold text-2xl mb-4">Virtual Energy Healing</h3>
                      <p className="text-gray-600 mb-4">
                        Our platform connects you with certified energy healers who can provide remote healing sessions. All our practitioners have undergone rigorous training and certification in modalities like Reiki, Quantum Healing, Chakra Balancing, and other energy medicine techniques.
                      </p>
                      <p className="text-gray-600 mb-6">
                        Research has shown that energy healing can be effective at a distance, as energy is not bound by physical proximity. Our virtual sessions create a sacred space for healing to occur, regardless of where you're located.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Verified and experienced energy healers</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Multiple healing modalities to choose from</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Convenient scheduling for sessions from anywhere</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="research">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="font-heading font-semibold text-2xl mb-4">Our Research Foundation</h3>
                      <p className="text-gray-600 mb-4">
                        The AuraEye™ approach is grounded in both ancient wisdom and contemporary research. We actively collaborate with researchers in fields such as biofield science, consciousness studies, and subtle energy medicine to ensure our platform reflects the latest scientific understanding.
                      </p>
                      <p className="text-gray-600 mb-6">
                        Our team includes not only spiritual practitioners but also data scientists, psychologists, and researchers who work together to create a holistic approach to spiritual wellness that honors tradition while embracing innovation.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Research partnerships with leading institutes</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Ongoing validation studies of our aura analysis technology</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Integration of traditional wisdom with scientific findings</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="relative">
                      <img 
                        src="https://images.pexels.com/photos/4031818/pexels-photo-4031818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                        alt="Research and development" 
                        className="rounded-xl shadow-lg"
                      />
                      <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-3 rounded-lg shadow-lg text-sm font-medium">
                        Evidence-based approach
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* Team section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-heading font-bold text-3xl mb-4">Our Team</h2>
              <p className="text-gray-600">
                We're a diverse group of spiritual practitioners, technologists, and wellness experts united by a passion for making spiritual wellness accessible.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                    <img 
                      src={nishantImage} 
                      alt="Nishant Sharma" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-1">Nishant Sharma</h3>
                  <p className="text-primary mb-3">Founder & Lead Healer</p>
                  <p className="text-gray-600 text-sm">
                    An IT Engineer with a Master’s in Applied Positive Psychology & Coaching Psychology (UEL, London) and over 20 years as a certified Energy healer, AuraEye™ blends cutting-edge technology with authentic energy healing to bring spiritual wellness into the digital age.
                  </p>
                </CardContent>
              </Card>
              
             
              
             
            </div>
            
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  Connect With Our Team
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Join us CTA */}
        <section className="py-16 bg-gradient-to-r from-secondary to-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">Join Our Spiritual Community</h2>
              <p className="text-xl opacity-90 mb-8">
                Begin your journey of spiritual discovery and energy healing with AuraEye today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  <Link href="/auth">
                    Create Free Account
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="border-white text-white hover:bg-white/10">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
