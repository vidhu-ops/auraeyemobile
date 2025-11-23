import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Settings, LogOut, Edit2, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Link, useLocation } from "wouter";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState(user?.email || "");

  const { data: stats } = useQuery({
    queryKey: ["/api/user-stats"],
  });

  const { data: subscription } = useQuery({
    queryKey: ["/api/user-subscription"],
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("PATCH", "/api/users/me/email", { email });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Updated! ✨",
        description: "Confirmation email sent to your new address",
      });
      setIsEditingEmail(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (!user) {
    return null;
  }

  const userLevelMap: Record<number, { name: string; emoji: string; color: string }> = {
    0: { name: "Explorer", emoji: "🌱", color: "from-blue-400 to-cyan-400" },
    1: { name: "Beginner", emoji: "🔮", color: "from-purple-400 to-pink-400" },
    2: { name: "Intermediate", emoji: "✨", color: "from-yellow-400 to-orange-400" },
    3: { name: "Advanced", emoji: "🌟", color: "from-rose-400 to-red-400" },
    4: { name: "Awakened", emoji: "👑", color: "from-amber-400 to-yellow-400" },
  };

  const currentLevel = Math.floor((user.soulEnergy || 0) / 2000);
  const levelInfo = userLevelMap[Math.min(currentLevel, 4)];
  const nextLevelEnergy = (currentLevel + 1) * 2000;
  const progressPercentage = ((user.soulEnergy || 0) % 2000) / 20;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-cosmic">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-purple-200">View and manage your account</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-400/50 text-red-200 hover:bg-red-500/20"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <Card className="border-purple-200/50 glass-ethereal">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Username</p>
                    <p className="text-white font-semibold">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm font-medium">User Type</p>
                    <Badge className="bg-indigo-500/20 text-indigo-200 capitalize">
                      {user.userType}
                    </Badge>
                  </div>
                </div>

                {/* Email with Edit */}
                <div>
                  <p className="text-purple-300 text-sm font-medium mb-2">Email</p>
                  {isEditingEmail ? (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="bg-white/10 border-purple-300/50 text-white"
                        placeholder="Enter new email"
                        data-testid="input-email"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateEmailMutation.mutate(editedEmail)}
                        disabled={updateEmailMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-confirm-email"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setEditedEmail(user.email || "");
                        }}
                        data-testid="button-cancel-email"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-purple-200/20">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-300" />
                        <p className="text-white">{user.email || "Not provided"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingEmail(true)}
                        data-testid="button-edit-email"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Other Info */}
                {user.mobileNumber && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-purple-200/20">
                    <Phone className="h-4 w-4 text-purple-300" />
                    <p className="text-white">{user.mobileNumber}</p>
                  </div>
                )}

                {user.birthDate && (
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Birth Date</p>
                    <p className="text-white">{user.birthDate}</p>
                  </div>
                )}

                {/* Spiritual Preferences */}
                {user.manifestIntention && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-purple-500/10 border border-purple-300/20">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Manifest Intention</p>
                      <Badge className="bg-purple-500/20 text-purple-200">{user.manifestIntention}</Badge>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Energy Level</p>
                      <Badge className="bg-blue-500/20 text-blue-200">{user.energyLevel}</Badge>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-purple-300 text-sm font-medium">Biggest Block</p>
                      <Badge className="bg-red-500/20 text-red-200">{user.biggestBlock}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            {stats && (
              <Card className="border-purple-200/50 glass-ethereal">
                <CardHeader>
                  <CardTitle className="text-white">Activity Stats</CardTitle>
                  <CardDescription>Your spiritual journey progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-indigo-300">{stats.auraScans}</p>
                      <p className="text-xs text-purple-300">Aura Scans</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-purple-300">{stats.vibeScans}</p>
                      <p className="text-xs text-purple-300">Vibe Scans</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-pink-300">{stats.journalEntries}</p>
                      <p className="text-xs text-purple-300">Journal Entries</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-yellow-300">{stats.numerologyReadings}</p>
                      <p className="text-xs text-purple-300">Numerology</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-green-300">{stats.healersConsulted}</p>
                      <p className="text-xs text-purple-300">Healers</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-cyan-300">{Math.floor(stats.meditationHours)}</p>
                      <p className="text-xs text-purple-300">Med. Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Soul Energy Level */}
            <Card className={`border-0 glass-ethereal bg-gradient-to-br ${levelInfo.color} bg-opacity-10`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-2xl">{levelInfo.emoji}</span>
                  {levelInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-purple-100 text-sm">Soul Energy</p>
                    <p className="text-white font-semibold">{user.soulEnergy || 0}</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 border border-white/20">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} transition-all`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-purple-200 mt-1">
                    Next level: {nextLevelEnergy} ✨
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Credits & Subscription */}
            <Card className="border-indigo-300/50 glass-ethereal">
              <CardHeader>
                <CardTitle className="text-white text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/50">
                  <p className="text-purple-300 text-sm">Available Credits</p>
                  <p className="text-2xl font-bold text-indigo-300">{user.credits || 0}</p>
                </div>
                {subscription && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/50">
                    <p className="text-purple-300 text-sm">Subscription</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-white font-semibold">{subscription.planName || "Free"}</p>
                      <Badge className="bg-green-500/20 text-green-200 text-xs">
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-purple-200/50 glass-ethereal">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/payment">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    data-testid="button-buy-credits"
                  >
                    Buy Credits
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-white hover:bg-purple-500/20"
                    data-testid="button-settings"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
