import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: "aura" | "numerology" | "horoscope" | "general";
}

const featureDetails = {
  aura: {
    title: "Premium Aura Analysis",
    description: "Unlock detailed insights into your aura energy patterns and spiritual significance.",
    benefits: [
      "In-depth chakra analysis with personalized balancing techniques",
      "Comprehensive spiritual guidance based on your unique aura signature",
      "Detailed personality trait analysis with practical applications",
      "Monthly aura tracking to monitor your spiritual progress"
    ]
  },
  numerology: {
    title: "Advanced Numerology Reading",
    description: "Discover the profound numerical patterns influencing your life journey.",
    benefits: [
      "Comprehensive analysis of all 11 numerology chart elements",
      "Personal Year forecast with monthly breakdowns",
      "Career and relationship compatibility guidance",
      "Personalized numerology life path recommendations"
    ]
  },
  horoscope: {
    title: "Premium Horoscope Insights",
    description: "Access in-depth astrological forecasts tailored to your unique birth chart.",
    benefits: [
      "Detailed monthly horoscope with key date highlights",
      "Planetary transit analysis and their specific impact on you",
      "Relationship compatibility insights for love and friendship",
      "Career and financial opportunity forecasts"
    ]
  },
  general: {
    title: "Aurfy Premium Membership",
    description: "Elevate your spiritual journey with full access to all premium features.",
    benefits: [
      "Unlimited access to all premium readings and analyses",
      "Priority access to new features and spiritual tools",
      "Personalized spiritual growth recommendations",
      "Exclusive guided meditations and spiritual practice guides"
    ]
  }
};

export function PremiumModal({ isOpen, onClose, featureType }: PremiumModalProps) {
  const { toast } = useToast();
  const details = featureDetails[featureType];
  
  const handleContinue = () => {
    toast({
      title: "Coming Soon!",
      description: "Premium features will be available in the next update. Stay tuned!",
      variant: "default"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-background to-amber-950/10 border-amber-400/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-amber-400" />
            {details.title}
            <Sparkles className="h-4 w-4 text-amber-400" />
          </DialogTitle>
          <DialogDescription>
            {details.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Premium Benefits
          </h3>
          <ul className="space-y-2">
            {details.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
            <p className="text-sm text-center">
              Premium features are coming soon! Stay tuned for the official launch.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            <X className="h-4 w-4 mr-2" />
            Maybe Later
          </Button>
          <Button 
            className="sm:w-auto w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700" 
            onClick={handleContinue}
          >
            <Crown className="h-4 w-4 mr-2" />
            Continue to Premium
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}