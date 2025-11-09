import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Users, Zap, Check, Sparkles, Award, Globe } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useState } from "react";

type BillingCycle = "monthly" | "quarterly" | "annually";

export default function PricingPage() {
  const [starterBilling, setStarterBilling] = useState<BillingCycle>("monthly");

  const freeTrialFeatures = [
    "5 Credits (Valid for 5 Days)",
    "Free Personalized Numerology",
    "How Are You Feeling (Psychological Feedback)",
    "Free Breathwork Sessions",
    "Lifestyle Suggestions",
    "Affirmation Reminders (Optional)",
  ];

  const starterPlanPrices = {
    monthly: { price: "TBD", credits: "TBD", period: "/month" },
    quarterly: { price: "TBD", credits: "TBD", period: "/quarter" },
    annually: { price: "TBD", credits: "TBD", period: "/year" }
  };

  const starterFeatures = [
    "What's My Vibe",
    "Personalized Journaling",
    "Personal Numerology (Based on DOB)",
    "Personalized Meditation Recommendations",
    "Activity-Based Meditation Suggestions",
    "Monthly Full Moon Online Meditation Circle",
    "Access to Super Elite Healers",
  ];

  const professionalHealerFeatures = [
    "Everything in Starter Plan",
    "What's My Vibe",
    "Object/Space Scan",
    "Human Aura & Chakras Analysis",
    "Dashboard Access for Client Records",
    "AuraEye Certification Program",
    "Learn to Read Aura Scientifically",
    "Decode Aura Intuitively (Aurascope)",
    "Learn + Earn Program Access",
    "Ads, Webinars & Teaching Opportunities",
  ];

  const eliteHealerFeatures = [
    "Everything in Professional Plan",
    "Listing to Global Audience",
    "Recommended Healer on Mobile App",
    "Recommended Healer on Web App",
    "Premium Profile Placement",
    "Priority Support & Consultation",
    "Exclusive Elite Healer Community",
    "Advanced Analytics Dashboard",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="min-h-screen bg-gradient-cosmic relative overflow-hidden">
          <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-mystical font-bold text-white mb-4 glow-mystical">
                Choose Your Spiritual Journey
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto font-cosmic">
                Select the perfect plan to unlock your spiritual potential
              </p>
            </div>

            {/* Free Trial - Highlighted Section */}
            <div className="mb-12 max-w-4xl mx-auto">
              <Card className="glass-ethereal border-2 border-yellow-400/50 glow-cosmic relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-bl-xl font-bold">
                  LIMITED TIME
                </div>
                <CardHeader className="text-center pt-12">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Sparkles className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-mystical font-bold text-purple-700">
                    Free Trial
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-cosmic text-lg">
                    Start Your Journey - No Credit Card Required
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-purple-800">FREE</span>
                    <Badge className="ml-3 bg-yellow-500 text-white">5 Days</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-3">
                    {freeTrialFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm text-purple-600 font-cosmic">
                        <Check className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold text-lg py-6"
                    data-testid="button-start-free-trial"
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Pricing Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Starter Plan (Seeker) */}
              <Card className="relative glass-ethereal hover:glow-mystical transition-all duration-300 border-purple-400/70 glow-cosmic">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-mystical font-bold text-purple-700">
                    Starter Plan (Seeker)
                  </CardTitle>
                  
                  {/* Billing Cycle Toggle */}
                  <div className="flex justify-center gap-2 mt-4 mb-2">
                    <Button
                      variant={starterBilling === "monthly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStarterBilling("monthly")}
                      className="text-xs"
                      data-testid="button-billing-monthly"
                    >
                      Monthly
                    </Button>
                    <Button
                      variant={starterBilling === "quarterly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStarterBilling("quarterly")}
                      className="text-xs"
                      data-testid="button-billing-quarterly"
                    >
                      Quarterly
                    </Button>
                    <Button
                      variant={starterBilling === "annually" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStarterBilling("annually")}
                      className="text-xs"
                      data-testid="button-billing-annually"
                    >
                      Annually
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-purple-800">
                      {starterPlanPrices[starterBilling].price}
                    </span>
                    <span className="text-purple-500 ml-2 font-cosmic">
                      {starterPlanPrices[starterBilling].period}
                    </span>
                  </div>
                  <CardDescription className="text-purple-600 font-cosmic mt-2">
                    {starterPlanPrices[starterBilling].credits} Credits
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {starterFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-purple-600 font-cosmic">
                        <Check className="h-4 w-4 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="mystical"
                    className="w-full font-cosmic"
                    data-testid="button-subscribe-starter"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Healer Plan */}
              <Card className="relative glass-ethereal hover:glow-mystical transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-mystical font-bold text-purple-700">
                    Professional Healer
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-cosmic">
                    6 Months or Yearly
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-purple-800">TBD</span>
                    <span className="text-purple-500 ml-2 font-cosmic">/period</span>
                  </div>
                  <CardDescription className="text-purple-600 font-cosmic mt-2">
                    TBD Credits
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {professionalHealerFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-purple-600 font-cosmic">
                        <Check className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="cosmic"
                    className="w-full font-cosmic"
                    data-testid="button-subscribe-professional"
                  >
                    Become a Pro Healer
                  </Button>
                </CardContent>
              </Card>

              {/* Elite Healer Plan */}
              <Card className="relative glass-ethereal hover:glow-mystical transition-all duration-300 border-2 border-amber-400/50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Elite
                  </Badge>
                </div>
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-amber-100">
                      <Globe className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-mystical font-bold text-purple-700">
                    Elite Healer
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-cosmic">
                    Yearly Plan
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-purple-800">TBD</span>
                    <span className="text-purple-500 ml-2 font-cosmic">/year</span>
                  </div>
                  <CardDescription className="text-purple-600 font-cosmic mt-2">
                    TBD Credits
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {eliteHealerFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-purple-600 font-cosmic">
                        <Check className="h-4 w-4 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-cosmic"
                    data-testid="button-subscribe-elite"
                  >
                    Join Elite
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Features Comparison */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-mystical font-semibold text-purple-900 mb-8 text-center">
                Compare Plans
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-4 px-4 font-mystical text-purple-900">Feature</th>
                      <th className="text-center py-4 px-4 font-mystical text-purple-900">Free Trial</th>
                      <th className="text-center py-4 px-4 font-mystical text-purple-900">Starter</th>
                      <th className="text-center py-4 px-4 font-mystical text-purple-900">Professional</th>
                      <th className="text-center py-4 px-4 font-mystical text-purple-900">Elite</th>
                    </tr>
                  </thead>
                  <tbody className="font-cosmic">
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">What's My Vibe</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Personalized Numerology</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Psychological Feedback</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Breathwork Sessions</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Personalized Journaling</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Full Moon Meditation Circle</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Object/Space Scan</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Human Aura & Chakras</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Client Records Dashboard</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">AuraEye Certification</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Learn + Earn Program</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Global Healer Listing</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-4 px-4 text-purple-700">Recommended Healer Status</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-mystical font-semibold text-purple-900 mb-6 text-center">
                Why Choose Our Plans?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-mystical font-semibold mb-2 text-purple-900">Flexible Usage</h3>
                  <p className="text-purple-700 font-cosmic">
                    Use credits across different services. Choose the billing cycle that fits your journey.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-mystical font-semibold mb-2 text-purple-900">Expert Guidance</h3>
                  <p className="text-purple-700 font-cosmic">
                    Access to certified healers and comprehensive spiritual development programs.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-mystical font-semibold mb-2 text-purple-900">Premium Quality</h3>
                  <p className="text-purple-700 font-cosmic">
                    Each analysis is powered by advanced AI and authentic spiritual expertise.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Link href="/dashboard">
                <Button variant="outline" className="mr-4" data-testid="button-back-dashboard">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/login">
                <Button data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
