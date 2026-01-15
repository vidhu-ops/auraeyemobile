import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Users, Zap, Check, Sparkles, Award, Globe, Coins } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

type BillingCycle = "monthly" | "quarterly" | "annually";

export default function PricingPage() {
  const { user } = useAuth();
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
        "Basic Personalized Numerology",
        "What's My Vibe",
        "Psychological Feedback",
        "Breathwork Guidance Sessions",
        "Meditation Library access",
        "Personalized Journaling",
        "Object / Space Scan",
      ]
    },
    {
      id: "seeker",
      name: "Seeker Plan",
      price: "£40",
      period: "Top Up when needed",
      credits: "10 Credits",
      icon: Users,
      popular: true,
      highlight: false,
      features: [
        "10 Credits + Top Up when needed",
        "10 credits for £40 GBP",
        "What's My Vibe",
        "Basic Personalized Numerology",
        "Psychological Feedback",
        "Breathwork Guidance Sessions",
        "Meditation Library access",
        "Personalized Journaling",
        "Full Moon Meditation Circle Invitation",
        "Object / Space Scan",
        "Connect to Auraeye Healer",
      ]
    },
    {
      id: "starter",
      name: "Starter's Plan (40K)",
      price: "£40",
      period: "Yearly License",
      credits: "40 Credits + 5/mo",
      icon: Zap,
      popular: false,
      highlight: false,
      features: [
        "Yearly License Cost",
        "40 Credits Sign up bonus",
        "5 Credits per Month",
        "Advanced Personalized Numerology",
        "Human Aura & Chakras",
        "Client Records Dashboard",
        "AuraEye Certification",
        "Healer's work on their Own",
      ]
    },
    {
      id: "elite",
      name: "Elite Healer",
      price: "Yearly",
      period: "By Selection Only",
      credits: "Yearly License",
      icon: Globe,
      popular: false,
      highlight: false,
      elite: true,
      features: [
        "India Listing",
        "Everything in Starter Plan",
        "Advanced Personalized Numerology",
        "Learn + Earn Program",
        "Recommended Healer Status",
        "Connect to Auraeye Healer",
      ]
    },
    {
      id: "super-elite",
      name: "Super Elite",
      price: "Yearly",
      period: "By Selection Only",
      credits: "Yearly License",
      icon: Crown,
      popular: false,
      highlight: false,
      elite: true,
      features: [
        "India + International Listing",
        "Advanced Personalized Numerology",
        "Learn + Earn Program",
        "Recommended Healer Status",
        "Global Healer Listing",
        "Connect to Auraeye Healer",
      ]
    }
  ];

  const starterPlanPrices = {
    monthly: { price: "TBD", credits: "TBD", period: "/month" },
    quarterly: { price: "TBD", credits: "TBD", period: "/quarter" },
    annually: { price: "TBD", credits: "TBD", period: "/year" }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
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
                      <CardDescription className="text-white font-cosmic text-xs">
                        {plan.period}
                      </CardDescription>
                      <CardDescription className="text-white font-cosmic font-semibold text-sm mt-1">
                        {plan.billingOptions ? starterPlanPrices[starterBilling].credits : plan.credits}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-2 flex flex-col">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-xs text-purple-200 font-cosmic">
                            <Check className={`h-3 w-3 mr-2 flex-shrink-0 mt-0.5 ${
                              plan.highlight ? "text-yellow-500" :
                              plan.elite ? "text-amber-500" :
                              "text-purple-200"
                            }`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link href="/" className="mt-auto pt-4">
                        <Button 
                          variant={plan.popular ? "mystical" : "cosmic"}
                          className={`w-full font-cosmic text-sm space-y-2 py-2 px-2 ${
                            plan.highlight ? "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white" :
                            plan.elite ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white" :
                            ""
                          }`}
                          data-testid={`button-subscribe-${plan.id}`}
                        >
                          {plan.highlight ? "Start Free Trial" : "Get Started"}
                        </Button>
                      </Link>
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
                    <tr className="border-b-2 border-purple-200 text-[10px] sm:text-xs">
                      <th className="text-left py-3 px-3 font-mystical text-purple-900">Service</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900">Credit Needed</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 bg-gray-50">Free Trial (5 credits)</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900">Seeker (10 credits)</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900">Starter's Plan (40K)</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 bg-yellow-100">Elite (India Listing)</th>
                      <th className="text-center py-3 px-2 font-mystical text-purple-900 bg-yellow-200">Super Elite (Global Listing)</th>
                    </tr>
                  </thead>
                  <tbody className="font-cosmic text-[11px] sm:text-xs text-black">
                    {[
                      { service: "What's My Vibe", credit: "1", free: true, seeker: true, starter: true, elite: true, super: true },
                      { service: "Personalized Numerology", credit: "3", free: "Basic", seeker: "Basic", starter: "Advanced", elite: "Advanced", super: "Advanced" },
                      { service: "Psychological Feedback", credit: "0", free: true, seeker: true, starter: true, elite: true, super: true },
                      { service: "Breathwork Guidance Sessions", credit: "0", free: true, seeker: true, starter: true, elite: true, super: true },
                      { service: "Meditation Library access", credit: "0", free: true, seeker: true, starter: true, elite: true, super: true },
                      { service: "Personalized Journaling", credit: "0", free: true, seeker: true, starter: true, elite: true, super: true },
                      { service: "Full Moon Meditation Circle Invitation", credit: "0", free: false, seeker: true, starter: true, elite: true, super: true },
                      { service: "Object / Space Scan", credit: "1", free: true, seeker: true, starter: true, elite: true, super: true },
                      { service: "Human Aura & Chakras", credit: "5", free: false, seeker: false, starter: true, elite: true, super: true },
                      { service: "Client Records Dashboard", credit: "NA", free: false, seeker: false, starter: true, elite: true, super: true },
                      { service: "AuraEye Certification", credit: "NA", free: false, seeker: false, starter: true, elite: true, super: true },
                      { service: "Learn + Earn Program", credit: "NA", free: false, seeker: false, starter: false, elite: true, super: true },
                      { service: "India Listing on Mobile Apps", credit: "NA", free: false, seeker: false, starter: false, elite: true, super: true },
                      { service: "Global Healer Listing", credit: "NA", free: false, seeker: false, starter: false, elite: false, super: true },
                      { service: "Recommended Healer Status", credit: "NA", free: false, seeker: false, starter: false, elite: true, super: true },
                      { service: "Connect to Auraeye Healer", credit: "NA", free: false, seeker: true, starter: true, elite: true, super: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-purple-100 hover:bg-purple-50/50">
                        <td className="py-2 px-3 text-purple-900 font-medium">{row.service}</td>
                        <td className="text-center py-2 px-2 text-purple-700">{row.credit}</td>
                        <td className="text-center py-2 px-2 bg-gray-50/50">
                          {typeof row.free === "boolean" ? (row.free ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-red-500">✕</span>) : row.free}
                        </td>
                        <td className="text-center py-2 px-2">
                          {typeof row.seeker === "boolean" ? (row.seeker ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-red-500">✕</span>) : row.seeker}
                        </td>
                        <td className="text-center py-2 px-2">
                          {typeof row.starter === "boolean" ? (row.starter ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-red-500">✕</span>) : row.starter}
                        </td>
                        <td className="text-center py-2 px-2 bg-yellow-50/50">
                          {typeof row.elite === "boolean" ? (row.elite ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-red-500">✕</span>) : row.elite}
                        </td>
                        <td className="text-center py-2 px-2 bg-yellow-100/30">
                          {typeof row.super === "boolean" ? (row.super ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-red-500">✕</span>) : row.super}
                        </td>
                      </tr>
                    ))}
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
                    Each analysis is powered by authentic expertise.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Link href="/dashboard">
                
              </Link>
              <Link href="/payment">
                <Button data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      {user && <MobileNavigation />}
    </div>
  );
}
