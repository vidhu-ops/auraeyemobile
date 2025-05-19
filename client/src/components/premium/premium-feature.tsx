import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";

type PremiumFeatureProps = {
  title: string;
  description: string;
  basicFeatures: string[];
  premiumFeatures: string[];
  ctaText?: string;
  onUpgrade?: () => void;
};

export function PremiumFeature({
  title,
  description,
  basicFeatures,
  premiumFeatures,
  ctaText = "Learn More",
  onUpgrade
}: PremiumFeatureProps) {
  return (
    <div className="my-6 grid md:grid-cols-2 gap-6">
      {/* Basic Features */}
      <Card className="relative overflow-hidden border-2 border-primary/20">
        <div className="absolute top-0 right-0 bg-primary/10 px-3 py-1 rounded-bl-md">
          <span className="text-sm font-medium">Basic</span>
        </div>
        <CardHeader>
          <CardTitle>{title} - Basic</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Includes:</h3>
          <ul className="space-y-2">
            {basicFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card className="relative overflow-hidden shadow-lg border-2 border-indigo-400/50 bg-gradient-to-br from-background to-indigo-950/10">
        <div className="absolute top-0 right-0 bg-indigo-500 px-3 py-1 rounded-bl-md">
          <span className="text-sm font-medium text-white flex items-center gap-1">
            <Sparkles size={14} /> Advanced
          </span>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title} - Advanced <Zap className="h-5 w-5 text-indigo-400" />
          </CardTitle>
          <CardDescription>Enhanced {description.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Everything in Basic, plus:</h3>
          <ul className="space-y-2">
            {basicFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
            {premiumFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 mt-0.5">
                  Advanced
                </Badge>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        {onUpgrade && (
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700" 
              onClick={onUpgrade}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {ctaText}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}