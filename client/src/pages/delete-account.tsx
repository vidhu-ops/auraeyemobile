import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";

export default function DeleteAccountPage() {
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/user");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. You can contact support to reactivate it.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Link href="/">
          <Button variant="ghost" className="text-white mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-2xl">Delete Account</CardTitle>
            <CardDescription className="text-slate-300">
              This action will deactivate your account. Your data will be preserved for 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
              <p className="font-semibold mb-2">What happens when you delete your account:</p>
              <ul className="list-disc list-inside space-y-1 text-red-100">
                <li>Your account becomes inactive immediately</li>
                <li>You will be logged out and cannot sign in</li>
                <li>Your aura readings, journal entries, and history remain saved for 30 days</li>
                <li>Contact support if you change your mind and want to reactivate</li>
              </ul>
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="confirm"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-500 text-red-500 focus:ring-red-500 bg-slate-800"
              />
              <label htmlFor="confirm" className="text-sm text-slate-300 cursor-pointer">
                I understand this will deactivate my account and I cannot sign in until it is reactivated.
              </label>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              disabled={!confirmed || deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Yes, Delete My Account"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
