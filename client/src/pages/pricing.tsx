import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Users, Zap, Check, Sparkles, Award, Globe, Coins } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useState } from "react";

type BillingCycle = "monthly" | "quarterly" | "annually";

export default function PricingPage() {
  const [starterBilling, setStarterBilling] = useState<BillingCycle>("monthly");

  const pricingPlans = [
    {
      id: "free-trial",
      name: "Free Trial",
      price: "FREE",
      period: "5 Days",
      credits: "5 Credits",
      icon: Sparkles,
      popular: false,
      highlight: true,
      features: [
        "5 Credits (Valid for 5 Days)",
        "Free Personalized Numerology",
        "How Are You Feeling (Psychological Feedback)",
        "Free Breathwork Sessions",
        "Lifestyle Suggestions",
        "Affirmation Reminders (Optional)",
      ]
    },
    {
      id: "starter",
      name: "Starter Plan (Seeker)",
      price: "TBD",
      period: "Flexible Billing",
      credits: "TBD Credits",
      icon: Users,
      popular: true,
      highlight: false,
      billingOptions: true,
      features: [
        "What's My Vibe",
        "Personalized Journaling",
        "Personal Numerology (Based on DOB)",
        "Personalized Meditation Recommendations",
        "Activity-Based Meditation Suggestions",
        "Monthly Full Moon Online Meditation Circle",
        "Access to Super Elite Healers",
      ]
    },
    {
      id: "professional",
      name: "Professional Healer",
      price: "TBD",
      period: "6 Months or Yearly",
      credits: "TBD Credits",
      icon: Award,
      popular: false,
      highlight: false,
      features: [
        "Everything in Starter Plan",
        "Object/Space Scan",
        "Human Aura & Chakras Analysis",
        "Dashboard Access for Client Records",
        "AuraEye Certification Program",
        "Learn to Read Aura Scientifically",
        "Decode Aura Intuitively (Aurascope)",
        "Learn + Earn Program Access",
        "Ads, Webinars & Teaching Opportunities",
      ]
    },
    {
      id: "elite",
      name: "Elite Healer",
      price: "TBD",
      period: "Yearly",
      credits: "TBD Credits",
      icon: Globe,
      popular: false,
      highlight: false,
      elite: true,
      features: [
        "Everything in Professional Plan",
        "Listing to Global Audience",
        "Recommended Healer on Mobile App",
        "Recommended Healer on Web App",
        "Premium Profile Placement",
        "Priority Support & Consultation",
        "Exclusive Elite Healer Community",
        "Advanced Analytics Dashboard",
      ]
    },
    {
      id: "credits",
      name: "Credits Pack",
      price: "TBD",
      period: "One-Time Purchase",
      credits: "Variable",
      icon: Coins,
      popular: false,
      highlight: false,
      features: [
        "Additional Credits Anytime",
        "No Subscription Required",
        "Credits Never Expire",
        "Stackable with Any Plan",
        "Instant Activation",
        "All Services Included",
        "Flexible Top-Up Options",
      ]
    }
  ];

  const starterPlanPrices = {
    monthly: { price: "TBD", credits: "TBD", period: "/month" },
    quarterly: { price: "TBD", credits: "TBD", period: "/quarter" },
    annually: { price: "TBD", credits: "TBD", period: "/year" }
  };

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
                5 Flexible Plans to Match Your Spiritual Path
              </p>
            </div>

            {/* All 5 Pricing Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
              {pricingPlans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <Card
                    key={plan.id}
                    className={`relative glass-ethereal hover:glow-mystical transition-all duration-300 ${
                      plan.popular
                        ? "border-purple-400/70 glow-cosmic"
                        : plan.highlight
                        ? "border-2 border-yellow-400/50 glow-cosmic"
                        : plan.elite
                        ? "border-2 border-amber-400/50"
                        : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                          LIMITED TIME
                        </Badge>
                      </div>
                    )}
                    {plan.elite && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Elite
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-3">
                        <div className={`p-2 rounded-full ${
                          plan.popular ? "bg-purple-100" : 
                          plan.highlight ? "bg-yellow-100" :
                          plan.elite ? "bg-amber-100" :
                          "bg-blue-100"
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            plan.popular ? "text-purple-600" : 
                            plan.highlight ? "text-yellow-600" :
                            plan.elite ? "text-amber-600" :
                            "text-blue-600"
                          }`} />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-mystical font-bold text-purple-700">
                        {plan.name}
                      </CardTitle>
                      
                      {/* Billing Cycle Toggle for Starter Plan */}
                      {plan.billingOptions && (
                        <div className="flex flex-col gap-1 mt-3 mb-2">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant={starterBilling === "monthly" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setStarterBilling("monthly")}
                              className="text-xs px-2 py-1 h-7"
                              data-testid="button-billing-monthly"
                            >
                              Monthly
                            </Button>
                            <Button
                              variant={starterBilling === "quarterly" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setStarterBilling("quarterly")}
                              className="text-xs px-2 py-1 h-7"
                              data-testid="button-billing-quarterly"
                            >
                              Quarterly
                            </Button>
                            <Button
                              variant={starterBilling === "annually" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setStarterBilling("annually")}
                              className="text-xs px-2 py-1 h-7"
                              data-testid="button-billing-annually"
                            >
                              Annually
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <span className="text-3xl font-bold text-purple-800">
                          {plan.billingOptions ? starterPlanPrices[starterBilling].price : plan.price}
                        </span>
                      </div>
                      <CardDescription className="text-purple-600 font-cosmic text-xs">
                        {plan.period}
                      </CardDescription>
                      <CardDescription className="text-purple-700 font-cosmic font-semibold text-sm mt-1">
                        {plan.billingOptions ? starterPlanPrices[starterBilling].credits : plan.credits}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-0">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-xs text-purple-600 font-cosmic">
                            <Check className={`h-3 w-3 mr-2 flex-shrink-0 mt-0.5 ${
                              plan.highlight ? "text-yellow-500" :
                              plan.elite ? "text-amber-500" :
                              "text-purple-500"
                            }`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        variant={plan.popular ? "mystical" : "cosmic"}
                        className={`w-full font-cosmic text-sm py-2 ${
                          plan.highlight ? "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white" :
                          plan.elite ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white" :
                          ""
                        }`}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        {plan.highlight ? "Start Free Trial" : "Get Started"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features Comparison Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-8 overflow-x-auto">
              <h2 className="text-2xl font-mystical font-semibold text-purple-900 mb-6 text-center">
                Compare All Plans
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-3 px-3 font-mystical text-purple-900 text-sm">Feature</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 text-xs">Free Trial</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 text-xs">Starter</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 text-xs">Professional</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 text-xs">Elite</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 text-xs">Credits Pack</th>
                    </tr>
                  </thead>
                  <tbody className="font-cosmic text-sm">
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">What's My Vibe</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">With Credits</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Personalized Numerology</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">With Credits</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Psychological Feedback</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Breathwork Sessions</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Personalized Journaling</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Full Moon Meditation Circle</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Object/Space Scan</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">With Credits</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Human Aura & Chakras</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">With Credits</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Client Records Dashboard</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">AuraEye Certification</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Learn + Earn Program</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Global Healer Listing</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Recommended Healer Status</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3 px-3 text-purple-700">Flexible Credit Top-Up</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2 text-purple-600">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
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
                    5 different plans to match your spiritual journey, from beginner to elite healer.
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
