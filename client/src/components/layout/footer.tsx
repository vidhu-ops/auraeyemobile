import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-black pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-black font-heading font-bold text-xl">A</span>
              </div>
              <span className="font-heading font-bold text-2xl text-black">Aurafy</span>
            </div>
            <p className="text-black/70 mb-4">Empowering spiritual growth through modern metaphysical tools and enhanced aura analysis.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-black/70 hover:text-red transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-black/70 hover:text-red transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-black/70 hover:text-red transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-black/70 hover:text-red transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-black/70 hover:text-purple transition-colors">Home</Link></li>
              <li><Link href="/#services" className="text-black/70 hover:text-pink transition-colors">Services</Link></li>
              <li><Link href="/about" className="text-black/70 hover:text-purple transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-black/70 hover:text-pink transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/aura-analysis" className="text-black/70 hover:text-purple transition-colors">Aura Analysis</Link></li>
              <li><Link href="/daily-horoscope" className="text-black/70 hover:text-pink transition-colors">Daily Horoscope</Link></li>
              <li><Link href="/numerology" className="text-black/70 hover:text-pink transition-colors">Numerology Reading</Link></li>
              <li><Link href="/journal" className="text-black/70 hover:text-purple transition-colors">Spiritual Journal</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Subscribe</h4>
            <p className="text-black/70 mb-3">Stay updated with our latest spiritual insights and offerings.</p>
            <form className="flex flex-col space-y-3">
              <Input type="email" placeholder="Your email address" className="px-3 py-2 rounded-lg bg-dark-light border border-dark-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
              <Button className="bg-primary hover:bg-primary-dark text-white font-medium">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <hr className="border-dark-light mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-black/70 text-sm mb-4 md:mb-0">© 2023 Aurafy ™ ©.  All rights reserved.</p>
          <div className="flex space-x-4 text-sm">
            <Link href="/privacy" className="text-black/70 hover:text-gray transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-black/70 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-black/70 hover:text-grey transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
