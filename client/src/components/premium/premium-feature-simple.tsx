import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

type PremiumFeatureSimpleProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

export function PremiumFeatureSimple({
  title,
  description,
  icon,
  onClick
}: PremiumFeatureSimpleProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <Crown className="w-4 h-4 text-amber-500" />
        </CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={onClick}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white"
          size="sm"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade for Premium
        </Button>
      </CardContent>
    </Card>
  );
}