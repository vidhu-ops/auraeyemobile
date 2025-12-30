import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Coins, Sparkles, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B614od3JgoS9ICbbxgjC0b";

export default function PaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Check for success/cancel parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Processing! 🎉",
        description: "Your credits will be added shortly. Please refresh in a moment.",
      });
      // Clean URL
      window.history.replaceState({}, '', '/payment');
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. No charges were made.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, '', '/payment');
    }
  }, [location, toast]);

  const { data: transactions } = useQuery({
    queryKey: ["/api/payment-transactions"],
  });

  const handlePayNow = () => {
    // Add user email to the payment link for tracking
    const paymentUrl = user?.email 
      ? `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(user.email)}`
      : STRIPE_PAYMENT_LINK;
    
    window.location.href = paymentUrl;
  };

  const creditPackFeatures = [
    "100 Soul Credits",
    "Use for Any Service",
    "Aura Analysis Sessions",
    "Numerology Readings",
    "Object Scanning",
    "What's My Vibe Analysis",
    "Never Expires",
    "Instant Activation",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-cosmic pb-20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Get Credits</h1>
          <p className="text-purple-200">Power up your spiritual journey</p>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Single Credit Pack */}
          <Card className="border-2 border-purple-400/70 glass-ethereal glow-cosmic relative overflow-hidden">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Best Value
              </Badge>
            </div>
            
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/50">
                  <Coins className="w-10 h-10 text-yellow-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-mystical font-bold text-white">
                Soul Credits Pack
              </CardTitle>
              <CardDescription className="text-purple-200 text-lg">
                One-time purchase • Instant activation
              </CardDescription>
              
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">₹499</span>
                <span className="text-purple-300 ml-2">INR</span>
              </div>
              <p className="text-purple-300 mt-2">100 Credits included</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {creditPackFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-purple-100">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={handlePayNow}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                data-testid="button-pay-now"
              >
                <Coins className="w-5 h-5 mr-2" />
                Pay Now
              </Button>
              
              <p className="text-center text-sm text-purple-300">
                Secure payment powered by Stripe
              </p>
            </CardContent>
          </Card>

          {/* Current Credits Display */}
          {user && (
            <Card className="border-purple-200/50 glass-ethereal">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Your Current Credits</span>
                  <Badge className="bg-purple-600/30 text-purple-100 text-lg px-4 py-1">
                    {user.credits || 0} Credits
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          {transactions && Array.isArray(transactions) && transactions.length > 0 && (
            <Card className="border-purple-200/50 glass-ethereal">
              <CardHeader>
                <CardTitle className="text-white text-lg">Payment History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-purple-200/20"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div>
                        <p className="text-white font-medium">{transaction.planName || 'Credits Purchase'}</p>
                        <p className="text-xs text-purple-300">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          +{transaction.creditsAfter - (transaction.creditsBefore || 0)} credits
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-200 border-green-400/50"
                              : transaction.status === "failed"
                              ? "bg-red-500/20 text-red-200 border-red-400/50"
                              : "bg-yellow-500/20 text-yellow-200 border-yellow-400/50"
                          }`}
                        >
                          {String(transaction.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-400/50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 text-sm">
                  <strong>Secure Payment:</strong> All payments are processed securely through Stripe. Your payment information is never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
