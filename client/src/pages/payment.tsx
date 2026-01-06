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

const CREDIT_PACKS = [
  {
    link: "https://buy.stripe.com/9B614od3JgoS9ICbbxgjC0b",
    credits: 10,
    price: 4152.69,
    badge: "Best Value",
  },
  {
    link: "https://buy.stripe.com/9B64gA7Jpb4y3ke3J5gjC0c",
    credits: 1,
    price: 125,
    badge: "Quick Buy",
  },
];

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

  const handlePayNow = (paymentLink: string) => {
    // Add user email to the payment link for tracking and redirect back to credits
    const redirectUrl = user?.email 
      ? `${paymentLink}?prefilled_email=${encodeURIComponent(user.email)}&redirect_url=${encodeURIComponent(window.location.origin + '/payment?payment=success')}`
      : `${paymentLink}?redirect_url=${encodeURIComponent(window.location.origin + '/payment?payment=success')}`;
    
    window.location.href = redirectUrl;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-cosmic pb-20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Get Credits</h1>
          <p className="text-purple-200">Power up your spiritual journey</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Credit Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 align-center">
            {CREDIT_PACKS.map((pack, index) => (
              <Card 
                key={index}
                className={`border-2 glass-ethereal relative overflow-hidden transition-all ${
                  pack.badge === "Best Value" 
                    ? "border-purple-400/70 glow-cosmic md:col-span-2 md:w-1/2 mx-auto"
                    : "border-purple-200/70"
                }`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className={`text-white px-4 py-1 ${
                    pack.badge === "Best Value"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600"
                  }`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {pack.badge}
                  </Badge>
                </div>
                
                <CardHeader className="text-center pt-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/50">
                      <Coins className="w-10 h-10 text-yellow-400" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-mystical font-bold text-white">
                    {pack.credits} Soul Credits
                  </CardTitle>
                  <CardDescription className="text-purple-200 text-lg">
                    One-time purchase • Instant activation
                  </CardDescription>
                  
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-white">₹{pack.price}</span>
                    <span className="text-purple-300 ml-2">INR</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handlePayNow(pack.link)}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    data-testid={`button-pay-now-${String(pack.credits)}`}
                  >
                    <Coins className="w-5 h-5 mr-2" />
                    Pay Now
                  </Button>
                  
                  <p className="text-center text-sm text-purple-300">
                    Secure payment powered by Stripe
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

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
