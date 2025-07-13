import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, User, Zap, Star } from "lucide-react";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const pricingPlans = [
    {
      id: "user",
      name: "User Package",
      price: "$19.99",
      credits: 25,
      icon: User,
      popular: false,
      features: [
        "25 Analysis Credits",
        "Full Aura Analysis",
        "Object Analysis",
        "What's My Vibe Feature",
        "Spiritual Journaling",
        "Basic Numerology",
        "Daily Horoscope",
        "Email Support"
      ]
    },
    {
      id: "healer",
      name: "Healer Package",
      price: "$49.99",
      credits: 100,
      icon: Crown,
      popular: true,
      features: [
        "100 Analysis Credits",
        "Full Aura Analysis",
        "Object Analysis",
        "What's My Vibe Feature",
        "Advanced Numerology",
        "Professional Dashboard",
        "Client Management",
        "Booking System",
        "Analytics & Insights",
        "PDF Report Generation",
        "Priority Support"
      ]
    },
    {
      id: "credits",
      name: "Credits Upgrade",
      price: "$9.99",
      credits: 10,
      icon: Zap,
      popular: false,
      features: [
        "10 Additional Credits",
        "No Expiration",
        "Stackable with Plans",
        "Instant Activation",
        "All Services Included"
      ]
    }
  ];

  const creditValues = [
    { service: "Aura Analysis", credits: 1, description: "Complete aura reading with chakra analysis" },
    { service: "Object Analysis", credits: 1, description: "Spiritual analysis of objects and their energy" },
    { service: "What's My Vibe", credits: 1, description: "Quick personality color analysis" },
    { service: "Numerology", credits: 0, description: "Life path and destiny calculations" },
    { service: "Horoscope", credits: 0, description: "Daily, monthly, and yearly readings" },
    { service: "Spiritual Journaling", credits: 0, description: "Personal growth tracking" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Spiritual Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the power of spiritual insights with our comprehensive analysis packages
          </p>
        </div>

        {/* Credit Value Guide */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Credit Value Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditValues.map((item) => (
              <Card key={item.service} className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.service}</h3>
                    <Badge variant={item.credits === 0 ? "secondary" : "default"}>
                      {item.credits === 0 ? "FREE" : `${item.credits} Credit`}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  plan.popular
                    ? "border-purple-500 border-2 bg-gradient-to-b from-purple-50 to-white"
                    : "bg-white/80 backdrop-blur-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.popular ? "bg-purple-100" : "bg-gray-100"
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        plan.popular ? "text-purple-600" : "text-gray-600"
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.credits} Credits Included
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">one-time</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Why Choose Our Credit System?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Usage</h3>
              <p className="text-gray-600">
                Use credits when you need them. No monthly commitments or subscriptions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Expiration</h3>
              <p className="text-gray-600">
                Your credits never expire. Take your time with your spiritual journey.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Each analysis is powered by advanced AI and spiritual expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="outline" className="mr-4">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}