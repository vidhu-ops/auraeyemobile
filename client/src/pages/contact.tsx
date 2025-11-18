import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { AuraGlow } from "@/components/ui/aura-glow";
import ContactForm from "@/components/forms/contact-form";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export default function Contact() {
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
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-black mb-4 text-center">Connect With Us</h1>
            <p className="text-black/80 max-w-2xl mx-auto text-center">
              Have questions about our services or need spiritual guidance? Reach out to our team of experts.
            </p>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="py-12 bg-gradient-to-br from-purple to-blue">
          <div className="container mx-auto px-2">
            <div className="max-w-5xl mx-auto">
              <Card className="rounded-2xl shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Contact form */}
                  <div className="md:w-7/12 p-8">
                    <h2 className="font-heading font-semibold text-xl mb-6">Send Us a Message</h2>
                    <ContactForm />
                  </div>
                  
                  {/* Contact information */}
                  <div className="md:w-8/12 bg-blue-500 to-purple-600 text-white p-8">
                    <div>
                      <h2 className="font-heading font-semibold text-xl mb-6">Contact Information</h2>
                      <div className="space-y-9">
                        <div className="flex items-start">
                          <MapPin className="mt-1 mr-3 h-5 w-5" />
                          <p>AuraEye Solutions Pvt. Ltd.  : Office address: 124 City Road, London EC1V 2NX</p>
                        </div>
                        
                        <div className="flex items-start">
                          <Mail className="mt-1 mr-3 h-5 w-5" />
                          <p>Contact@auraeyesolutions.com </p>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="font-medium mb-3">Follow Us</h3>
                        <div className="flex space-x-4">
                          <a href="#" className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-white transition-colors">
                            <Instagram className="h-5 w-5" />
                          </a>
                          <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Facebook className="h-5 w-5" />
                          </a>
                          <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Twitter className="h-5 w-5" />
                          </a>
                          <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Youtube className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <p className="py-8 font-accent italic text-white/80">"The universe is not outside of you. Look inside yourself; everything that you want, you already are." — Rumi</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-heading font-semibold text-lg mb-2">How accurate is the aura reading?</h3>
                <p className="text-gray-600">
                  Our aura analysis has been trained on thousands of readings from expert healers and has shown a high level of accuracy in detecting energy patterns. While technology continues to improve, we believe our system provides valuable insights into your energetic state.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-heading font-semibold text-lg mb-2">Is my data secure when I upload photos?</h3>
                <p className="text-gray-600">
                  Yes, we take data privacy very seriously. Your uploaded photos are processed securely and are not stored permanently unless you explicitly opt to save them in your profile. All analysis is done in a secure environment with strict access controls.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-heading font-semibold text-lg mb-2">How do I become a certified healer on the platform?</h3>
                <p className="text-gray-600">
                  We welcome experienced energy healers to join our platform. You'll need to provide proof of certification in your healing modality, references, and complete our onboarding process which includes a demonstration session. Please contact us for more information.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-heading font-semibold text-lg mb-2">Are the horoscopes personalized?</h3>
                <p className="text-gray-600">
                  Yes, our daily horoscopes take into account not just your sun sign, but also current planetary positions and their specific impact. For even more personalized readings, we offer birth chart analysis that factors in your exact birth time and location.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-heading font-semibold text-lg mb-2">Can I use AuraEye for professional spiritual guidance?</h3>
                <p className="text-gray-600">
                  While AuraEye provides valuable insights and tools for spiritual growth, we always recommend consulting with qualified professionals for serious health, financial, or legal matters. Our services are meant to complement, not replace, professional advice.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}
