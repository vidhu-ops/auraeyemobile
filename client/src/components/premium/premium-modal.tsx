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
import { Sparkles, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: "aura" | "numerology" | "horoscope" | "general";
}

const featureDetails = {
  aura: {
    title: "Advanced Aura Analysis",
    description: "Explore detailed insights into your aura energy patterns and spiritual significance.",
    benefits: [
      "In-depth chakra analysis with personalized balancing techniques",
      "Comprehensive spiritual guidance based on your unique aura signature",
      "Detailed personality trait analysis with practical applications",
      "Aura visualization with enhanced color representations"
    ]
  },
  numerology: {
    title: "Advanced Numerology Reading",
    description: "Discover the profound numerical patterns influencing your life journey.",
    benefits: [
      "Comprehensive analysis of all numerology chart elements",
      "Color associations with each numerological number",
      "Career and relationship compatibility guidance",
      "Personalized numerology life path recommendations"
    ]
  },
  horoscope: {
    title: "Advanced Horoscope Insights",
    description: "Access in-depth astrological forecasts tailored to your unique birth chart.",
    benefits: [
      "Detailed monthly horoscope with key date highlights",
      "Planetary transit analysis and their specific impact on you",
      "Relationship compatibility insights for love and friendship",
      "Career and financial opportunity forecasts"
    ]
  },
  general: {
    title: "Advanced Features",
    description: "Enjoy full access to all advanced spiritual analysis tools.",
    benefits: [
      "Unlimited access to all advanced readings and analyses",
      "Enhanced visualizations for aura and energy patterns",
      "Personalized spiritual growth recommendations",
      "Detailed interpretations and practical guidance"
    ]
  }
};

export function PremiumModal({ isOpen, onClose, featureType }: PremiumModalProps) {
  const { toast } = useToast();
  const details = featureDetails[featureType];
  
  const handleContinue = () => {
    toast({
      title: "Features Unlocked!",
      description: "All advanced features are now freely available for you to enjoy!",
      variant: "default"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-background to-indigo-950/10 border-indigo-400/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            {details.title}
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </DialogTitle>
          <DialogDescription>
            {details.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Advanced Features
          </h3>
          <ul className="space-y-2">
            {details.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 p-3 bg-indigo-500/10 rounded-md border border-indigo-500/20">
            <p className="text-sm text-center flex items-center justify-center gap-2">
              <Info className="h-4 w-4 text-indigo-400" />
              All advanced features are now freely available!
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            className="sm:w-auto w-full bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700" 
            onClick={handleContinue}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Continue to Advanced Features
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}