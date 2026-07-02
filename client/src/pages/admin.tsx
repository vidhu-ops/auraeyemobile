import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Gift, Users, Loader2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGranting, setIsGranting] = useState(false);
  const [lastResult, setLastResult] = useState<{ updated: number; message: string } | null>(null);

  const isAdmin = user?.username === "admin";

  async function grantCreditsToHealers() {
    setIsGranting(true);
    try {
      const res = await apiRequest("POST", "/api/admin/grant-credits-to-healers");
      const data = await res.json();
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "Credits granted",
        description: data.message,
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.message || "Could not grant credits",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Please log in first.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <h1 className="text-white text-xl font-bold">Access Denied</h1>
        <p className="text-slate-400 text-center">Only the admin account can use this page.</p>
        <Link href="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-white text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-400">Manage credits and healers from here.</p>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-400" />
              Grant Credits to Healers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-sm">
              Click the button below to add <strong>5 credits</strong> to every active healer account in the system.
            </p>
            <Button
              onClick={grantCreditsToHealers}
              disabled={isGranting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isGranting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting credits...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Grant 5 Credits to All Active Healers
                </>
              )}
            </Button>
            {lastResult && (
              <p className="text-emerald-300 text-sm">
                {lastResult.message} — {lastResult.updated} healers updated.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
