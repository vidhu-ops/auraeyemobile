import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Spiritual Wellness Platform</h3>
            <p className="text-gray-300 mb-4">
              Discover your spiritual energy through advanced AI technology. Get personalized insights 
              about your aura colors, chakra alignment, and spiritual guidance.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
              <span>for spiritual growth</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/aura-analysis" className="hover:text-white transition-colors">Aura Analysis</a></li>
              <li><a href="/object-analysis" className="hover:text-white transition-colors">Object Reading</a></li>
              <li><a href="/numerology" className="hover:text-white transition-colors">Numerology</a></li>
              <li><a href="/healers" className="hover:text-white transition-colors">Find Healers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Spiritual Wellness Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}