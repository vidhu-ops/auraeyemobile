import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Users, Zap, Check } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function PricingPage() {
  const pricingPlans = [
    {
      id: "healer",
      name: "Healer Package",
      price: "3500",
      credits: 100,
      icon: Crown,
      popular: false,
      features: ["Monthly, Quarterly, and Annual Plans Available",
        "50 Credits Included",
        "Healer Dashboard Access",
        "Client Booking System",
        "Professional Analytics",
        "Priority Support"
      ]
    },
    {
      id: "user",
      name: "User Package",
      price: "1000",
      credits: 30,
      icon: Users,
      popular: true,
      features: [
        "30 Credits Included",
        "All Analysis Tools",
        "Personal Dashboard",
        "Reading History",
        "Montly usage only",
        "Priority Support"
      ]
    },
    {
      id: "credits",
      name: "Credits Upgrade",
      price: "3000",
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
    { service: "Aura Analysis(healers)", credits: 5, description: "Complete aura reading with chakra analysis" },
    { service: "Aura Analysis(user)", credits: 15, description: "Complete aura reading with chakra analysis" },
    { service: "Object Analysis(healers)", credits: 1, description: "Spiritual analysis of objects and their energy" },
    { service: "Object Analysis(user)", credits: 5, description: "Spiritual analysis of objects and their energy" },
    { service: "What's My Vibe", credits: 1, description: "Quick personality color analysis" },
    { service: "Numerology(healer)", credits: 3, description: "Unlimited Life path and destiny calculations" },
     { service: "Numerology(user)", credits: 1, description: "1 Life path and destiny calculation" },
    { service: "Horoscope", credits: 0, description: "Daily, monthly, and yearly readings" },
    { service: "Spiritual Journaling", credits: 0, description: "Personal growth tracking" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
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
                  <Card key={item.service} className="bg-white backdrop-blur-sm">
                    <CardContent className="p-2">
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
                        ? "border-purple-500 bg-gradient-to-b from-purple-50 to-white"
                        : "bg-white backdrop-blur-sm"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          <Star className="w-3 h-3" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`p-1 rounded-full ${
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
                      <div className="mt-1">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 ml-2">/month</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features Comparison */}
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 mb-8">
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
                    Use credits for different services throughout the month. Monthly Expriration or subscriptions.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Monthly Expiration</h3>
                  <p className="text-gray-600">
                    Your credits expire monthly. Take your time with your spiritual journey.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
                  <p className="text-gray-600">
                    Each analysis is powered by advanced and spiritual expertise.
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
      </main>
      <Footer />
    </div>
  );
}