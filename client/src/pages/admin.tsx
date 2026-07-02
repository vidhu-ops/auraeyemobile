import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Gift, Users, Loader2, ShieldAlert, CheckSquare, Square, Trash2, CreditCard } from "lucide-react";
import { Link } from "wouter";

const KEEP_HEALERS = [
  "Meeta.Singh", "Purti.Sadh", "Jaspaul.kalsi9", "Subramanyam.v",
  "Karthika.Madhu", "Shwweta.Sharmma", "Sweta.Verma.Rawat", "Kiran.Ajay",
  "Khushboo.rathi", "Janvi.Adesara", "Pratibha.Pandya", "Nikhil.Vashi",
  "Reema.Chopra", "Abhishek.Patel", "Darshana.Jani", "SonalMGarg",
  "Dr.AnjanaBarot", "Jahnavi.sarma", "Ashwini.Badgandi", "Manolinie",
  "Annapoorna.kumaar", "Rutima Gopala", "Arti.Chauhan", "RAVijaya",
  "Kalpana.Muralidhar", "Shweta.Singh"
];

interface Healer {
  id: number;
  username: string;
  name: string | null;
  userType: string;
  credits: number;
  isActive: boolean;
  email: string | null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: healers = [], isLoading } = useQuery<Healer[]>({
    queryKey: ["/api/admin/healers"],
    enabled: user?.username === "admin",
  });

  const [selected, setSelected] = useState<Set<string>>(new Set(KEEP_HEALERS));
  const [tab, setTab] = useState<"active" | "inactive">("active");

  const activeHealers = useMemo(() => healers.filter((h) => h.isActive !== false), [healers]);
  const inactiveHealers = useMemo(() => healers.filter((h) => h.isActive === false), [healers]);
  const displayList = tab === "active" ? activeHealers : inactiveHealers;

  const toggleHealer = (username: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const deactivateMutation = useMutation({
    mutationFn: async (keepUsernames: string[]) => {
      const res = await apiRequest("POST", "/api/admin/deactivate-others", { keepUsernames });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Done", description: `${data.deactivated} healers deactivated.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/healers"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.message || "Could not deactivate", variant: "destructive" });
    },
  });

  const creditsMutation = useMutation({
    mutationFn: async (usernames: string[]) => {
      const res = await apiRequest("POST", "/api/admin/grant-credits-to-selected", { usernames });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Done", description: `${data.updated} healers received +5 credits.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/healers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.message || "Could not grant credits", variant: "destructive" });
    },
  });

  const isAdmin = user?.username === "admin";

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
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-white text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-400">Manage healer accounts and credits.</p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Trash2 className="h-5 w-5 text-red-400" />
                Deactivate Others
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300 text-sm">
                All healers <strong>NOT</strong> checked in the list below will be deactivated (soft delete). 
                Currently <strong>{selected.size}</strong> healers selected to keep active.
              </p>
              <Button
                onClick={() => deactivateMutation.mutate(Array.from(selected))}
                disabled={deactivateMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {deactivateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Deactivate Unselected Healers
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Gift className="h-5 w-5 text-emerald-400" />
                Grant Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300 text-sm">
                Add <strong>5 credits</strong> to every checked healer in the list below.
              </p>
              <Button
                onClick={() => creditsMutation.mutate(Array.from(selected))}
                disabled={creditsMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {creditsMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Grant 5 Credits to Selected Healers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Healers Table */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-cyan-400" />
                Healers ({activeHealers.length} active, {inactiveHealers.length} inactive)
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set(KEEP_HEALERS))}>
                  Reset to 26
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set(activeHealers.map((h) => h.username)))}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
                  Deselect All
                </Button>
                <Button
                  size="sm"
                  variant={tab === "active" ? "default" : "outline"}
                  onClick={() => setTab("active")}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={tab === "inactive" ? "default" : "outline"}
                  onClick={() => setTab("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              </div>
            ) : displayList.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No healers in this category.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20 text-left text-slate-300">
                      <th className="pb-2 pr-3 w-10">Keep</th>
                      <th className="pb-2 pr-3">Username</th>
                      <th className="pb-2 pr-3">Email</th>
                      <th className="pb-2 pr-3">Credits</th>
                      <th className="pb-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayList.map((h) => (
                      <tr key={h.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-2 pr-3">
                          <button
                            onClick={() => toggleHealer(h.username)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={selected.has(h.username) ? "Unselect" : "Select"}
                          >
                            {selected.has(h.username) ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 pr-3 text-white font-medium">{h.username}</td>
                        <td className="py-2 pr-3 text-slate-300">{h.email || "—"}</td>
                        <td className="py-2 pr-3 text-emerald-300 font-mono">{h.credits}</td>
                        <td className="py-2 text-slate-400">{h.userType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
