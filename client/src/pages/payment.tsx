import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";

interface PaymentPlan {
  id: number;
  name: string;
  price: number;
  billingCycle: string;
  credits: number;
  features: string[];
  description: string;
}

export default function PaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery<PaymentPlan[]>({
    queryKey: ["/api/payment-plans"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/payment-transactions"],
  });

  const { data: subscription } = useQuery({
    queryKey: ["/api/user-subscription"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("POST", "/api/purchase-plan", {
        planId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout if stripe_url is provided
      if (data.stripe_url) {
        window.location.href = data.stripe_url;
      } else {
        toast({
          title: "Success! 🎉",
          description: "Credits added to your account",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user-subscription"] });
        queryClient.invalidateQueries({ queryKey: ["/api/payment-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/home-stats"] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading payment plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-cosmic">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Payment & Billing</h1>
          <p className="text-purple-200">Manage your subscription and purchase credits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Plans */}
            <Card className="border-purple-200/50 glass-ethereal">
              <CardHeader>
                <CardTitle className="text-white">Available Plans</CardTitle>
                <CardDescription>Choose a plan to purchase credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans?.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-purple-200/30 hover:border-purple-200/60"
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                      data-testid={`payment-plan-${plan.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{plan.name}</h3>
                          <p className="text-xs text-purple-300">{plan.billingCycle}</p>
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-200">
                          {plan.credits} credits
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-3">
                        ${(plan.price / 100).toFixed(2)}
                      </div>
                      <p className="text-sm text-purple-200 mb-3">{plan.description}</p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          purchaseMutation.mutate(plan.id);
                        }}
                        disabled={purchaseMutation.isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        data-testid={`button-purchase-plan-${plan.id}`}
                      >
                        {purchaseMutation.isPending ? "Processing..." : "Purchase"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {transactions && transactions.length > 0 && (
              <Card className="border-purple-200/50 glass-ethereal">
                <CardHeader>
                  <CardTitle className="text-white">Payment History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-purple-200/20"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div>
                          <p className="text-white font-medium">{transaction.planName}</p>
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
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Subscription */}
            {subscription && (
              <Card className="border-indigo-300/50 glass-ethereal">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-purple-300 text-sm">Plan Name</p>
                    <p className="text-white font-semibold">{subscription.planName || "Free"}</p>
                  </div>
                  {subscription.renewalDate && (
                    <div>
                      <p className="text-purple-300 text-sm">Renewal Date</p>
                      <p className="text-white font-semibold">
                        {new Date(subscription.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-purple-300 text-sm">Status</p>
                    <Badge
                      className={`${
                        subscription.status === "active"
                          ? "bg-green-500/20 text-green-200"
                          : "bg-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Info */}
            <Card className="border-purple-200/50 glass-ethereal">
              <CardHeader>
                <CardTitle className="text-white text-lg">Billing Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-purple-300 text-sm">Email</p>
                  <p className="text-white font-semibold">{user?.email || "Not provided"}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-white border-purple-300 hover:bg-purple-500/20"
                  data-testid="button-update-billing"
                >
                  Update Billing Info
                </Button>
              </CardContent>
            </Card>

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
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
