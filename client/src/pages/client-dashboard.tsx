import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useSoulEnergy } from "@/hooks/use-soul-energy";
import { useCredits } from "@/hooks/use-credits";
import { useUserStats } from "@/hooks/use-user-stats";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { AchievementsBadges } from "@/components/gamification/achievements-badge";
import { ColorCollector } from "@/components/gamification/color-collector";
import { ChakraMastery } from "@/components/gamification/chakra-mastery";
import { HealerLeaderboard } from "@/components/gamification/healer-leaderboard";
import { BadgeTargets } from "@/components/gamification/badge-targets";
import { BadgeShowcase } from "@/components/gamification/badge-showcase";
import { ProfilePictureUploadDialog } from "@/components/profile/profile-picture-upload";
import {
  MapPin,
  Calendar,
  Camera,
  TrendingUp,
  Heart,
  Users,
  Activity,
  Sparkles,
  Circle,
  BookOpen,
  Eye,
  Settings,
  Calculator,
  Crown
} from "lucide-react";
import AvatarSoulTree from "@/components/avatar-soul-tree";
import NotificationSettings from "@/components/notification-settings";
import { getSoulEnergyMilestone, calculateTreeGrowth, getProgressToNextMilestone, energyMilestones, SOUL_ENERGY_PER_SCAN } from "@/lib/soul-energy-utils";
import { BADGE_DEFINITIONS, getActivityBadges, getActivityColor, getActivityEmoji, getLevelColor } from "@/lib/badge-definitions";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { soulEnergy, isLoading: soulEnergyLoading } = useSoulEnergy();
  const { credits, isLoading: creditsLoading } = useCredits();
  const { stats, isLoading: statsLoading, hasError: statsError } = useUserStats();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0);
  const { data: streakData } = useQuery({ queryKey: ["/api/streaks"] });
  const { data: achievements = [], refetch: refetchAchievements } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
    refetchInterval: 3000, // Auto-refetch every 3 seconds
  });

  // Fetch numerology readings for upgrade prompt check
  const { data: numerologyReadings = [] } = useQuery({
    queryKey: ["/api/numerology-readings"],
    enabled: !!user && user.userType === "client",
  });
  
  // Fetch credit transactions for activity log
  const { data: creditTransactions = [] } = useQuery({
    queryKey: ["/api/credit-transactions"],
    enabled: !!user,
  });
  
  // Get tab from URL query parameter, default to "overview"
  const getInitialTab = () => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return params.get('tab') || 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Notify user when new achievement is earned
  useEffect(() => {
    if (achievements.length > previousAchievementCount) {
      const newAchievement = achievements[achievements.length - 1];
      toast({
        title: `🎉 Achievement Unlocked!`,
        description: `${newAchievement.title}: ${newAchievement.description}`,
        duration: 5000,
      });
      setPreviousAchievementCount(achievements.length);
    }
  }, [achievements.length, achievements, toast]);

  const tabs = ["Overview", "Soul Energy", "Achievements", "Badge Info", "Bookings", "Activity", "Settings"];
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(user?.profilePictureUrl || null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Use new milestone and tree growth system
  const milestone = getSoulEnergyMilestone(soulEnergy);
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestoneProgress = getProgressToNextMilestone(soulEnergy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 relative overflow-hidden">
      <Navbar />

      {/* Main content */}
      <div className="relative z-10 pb-32 px-4 pt-4">
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-blue-500 border-0 mb-4 shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          <CardContent className="px-6 pb-6 -mt-12 relative">
            <div className="flex items-end gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg overflow-hidden">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={user?.username}
                      className="w-full h-full rounded-full object-cover"
                      data-testid="img-profile-picture"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-200 to-purple-400 flex items-center justify-center text-2xl font-bold text-purple-700">
                      {user?.username?.charAt(0).toUpperCase() || 'V'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setUploadDialogOpen(true)}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center shadow-md hover:bg-pink-600 transition-colors"
                  data-testid="button-edit-photo"
                >
                  <Camera className="h-3 w-3 text-white" />
                </button>
              </div>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white text-xl font-bold">{user?.username || 'vidhu.gupta'}</h2>
                  
                </div>
                <p className="text-black-600 text-sm">{user?.email || 'vidhu.gupta@gmail.com'}</p>
              </div>
            </div>

           

            <p className="text-white text-sm italic mb-4">
              "On a journey of spiritual awakening and inner healing. Passionate about meditation, energy work, and connecting with like-minded souls."
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{creditsLoading ? '...' : credits}</div>
                <div className="text-xs text-purple-100">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{soulEnergyLoading ? '...' : soulEnergy}</div>
                <div className="text-xs text-purple-100">Soul Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.floor(treeGrowth)}%</div>
                <div className="text-xs text-purple-100">Tree Growth</div>
              </div>
            </div>
            
            {/* Milestone Badge + Achievements */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex justify-center">
                <Badge className={`bg-gradient-to-r ${milestone.gradient} text-black px-4 py-1 text-sm font-semibold`}>
                  {milestone.level} Level
                </Badge>
              </div>
              {achievements.length > 0 && (
                <div className="flex justify-center items-center gap-2 bg-yellow-900/60 rounded-lg px-3 py-2 border-2 border-yellow-400" data-testid="profile-badge-display">
                  <Trophy className="h-5 w-5 text-yellow-300 animate-bounce" />
                  <span className="text-yellow-100 font-bold text-sm">{achievements.length} Badges Earned 🏆</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === tab.toLowerCase()
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Physical Badges Showcase */}
            <div className="mb-4">
              <BadgeShowcase />
            </div>

            {/* Achievement Targets - Badge Progress */}
            <div className="mb-4">
              <BadgeTargets />
            </div>

            {/* Activity Streaks */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-orange-600" />
                <h2 className="text-white font-semibold">Activity Streaks</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Streak</span>
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">{streakData?.currentStreak || 0} days</div>
                    <p className="text-xs text-gray-600 mt-1">Keep your momentum going!</p>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Longest Streak</span>
                        <span className="text-xl">⭐</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{streakData?.longestStreak || 0} days</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">This Week</span>
                        <span className="text-xl">📅</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{streakData?.weeklyActiveDates?.length || 0}/7</div>
                    </CardContent>
                  </Card>
                </div>
                {streakData?.weeklyActiveDates && streakData.weeklyActiveDates.length > 0 && (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-cyan-200 mb-2">Active Days:</p>
                      <p className="text-sm text-white">{streakData.weeklyActiveDates.join(', ')}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Spiritual Journey Progress */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h2 className="text-white font-semibold">Your Spiritual Journey Progress</h2>
              </div>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-3 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Meditation Hours</div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {statsLoading ? '...' : `${stats.meditationHours}h`}
                      </div>
                      <Progress value={stats.meditationHours > 0 ? Math.min((stats.meditationHours / 200) * 100, 100) : 0} className="h-2 bg-slate-700" />
                    </div>
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Healers Consulted</div>
                      <div className="text-2xl font-bold text-cyan-400 mb-1">
                        {statsLoading ? '...' : stats.healersConsulted}
                      </div>
                      <Progress value={stats.healersConsulted > 0 ? Math.min((stats.healersConsulted / 10) * 100, 100) : 0} className="h-2 bg-slate-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Aura Scans</div>
                      <div className="text-2xl font-bold text-indigo-400">
                        {statsLoading ? '...' : stats.auraScans}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Total Sessions</div>
                      <div className="text-2xl font-bold text-pink-400">
                        {statsLoading ? '...' : stats.totalSessions}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Extended Numerology Info - Client View */}
            {user?.birthDate && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-5 w-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Your Numerology Profile</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-400/30">
                      <div className="text-2xl font-bold text-purple-300 mb-1 text-center">
                        {(() => {
                          const dateStr = user.birthDate.replace(/\D/g, '');
                          let sum = 0;
                          for (const digit of dateStr) sum += parseInt(digit);
                          while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
                          return sum;
                        })()}
                      </div>
                      <div className="text-xs text-purple-200 text-center">Life Path</div>
                    </div>
                    <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-400/30">
                      <div className="text-2xl font-bold text-indigo-300 mb-1 text-center">
                        {(() => {
                          let sum = 0;
                          for (const char of (user.username || '').replace(/[^a-zA-Z]/g, '')) {
                            const letterMap: Record<string, number> = {
                              'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
                              'B': 2, 'K': 2, 'R': 2,
                              'C': 3, 'G': 3, 'L': 3, 'S': 3,
                              'D': 4, 'M': 4, 'T': 4,
                              'E': 5, 'H': 5, 'N': 5, 'X': 5,
                              'F': 6, 'O': 6, 'U': 6, 'V': 6, 'W': 6,
                              'Z': 7, 'P': 8
                            };
                            sum += letterMap[char.toUpperCase()] || 0;
                          }
                          while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
                          return sum;
                        })()}
                      </div>
                      <div className="text-xs text-indigo-200 text-center">Destiny Number</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-pink-900/30 rounded-lg p-3 border border-pink-400/30">
                      <div className="text-2xl font-bold text-pink-300 mb-1 text-center">
                        {(() => {
                          let sum = 0;
                          const vowels = ['A', 'E', 'I', 'O', 'U'];
                          for (const char of (user.username || '').replace(/[^a-zA-Z]/g, '')) {
                            if (vowels.includes(char.toUpperCase())) {
                              const letterMap: Record<string, number> = {
                                'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
                                'B': 2, 'K': 2, 'R': 2,
                                'C': 3, 'G': 3, 'L': 3, 'S': 3,
                                'D': 4, 'M': 4, 'T': 4,
                                'E': 5, 'H': 5, 'N': 5, 'X': 5,
                                'F': 6, 'O': 6, 'U': 6, 'V': 6, 'W': 6,
                                'Z': 7, 'P': 8
                              };
                              sum += letterMap[char.toUpperCase()] || 0;
                            }
                          }
                          while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
                          return sum;
                        })()}
                      </div>
                      <div className="text-xs text-pink-200 text-center">Soul Urge</div>
                    </div>
                    <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-400/30">
                      <div className="text-2xl font-bold text-amber-300 mb-1 text-center">
                        {(() => {
                          const date = new Date(user.birthDate);
                          const day = date.getDate();
                          const month = date.getMonth() + 1;
                          const currentYear = new Date().getFullYear();
                          let sum = day + month + currentYear;
                          while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
                          return sum;
                        })()}
                      </div>
                      <div className="text-xs text-amber-200 text-center">Personal Year</div>
                    </div>
                  </div>
                  
                  {/* Show upgrade message for clients with no previous readings */}
                  
                  {/* Show upgrade message for clients with no previous readings */}
                  {Array.isArray(numerologyReadings) && numerologyReadings.length === 0 ? (
                    <div className="mt-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-xs mb-2 text-center">
                        🔒 Unlock full numerology chart, personal year, & guidance
                      </p>
                      <Link href="/pricing" className="block">
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-sm">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade Now
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/numerology" className="block mt-3">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        View Full Analysis
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
          <Link href="/vibe" data-testid="link-vibe">
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Circle className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">What's My Vibe</div>
                <div className="text-purple-200 text-xs">Quick scan</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/aura-analysis" data-testid="link-aura-scan">
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Aura Scan</div>
                <div className="text-indigo-200 text-xs">Start reading</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/object-analysis" data-testid="link-object-analysis">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Object Scan</div>
                <div className="text-amber-200 text-xs">Spiritual analysis</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/meditations" data-testid="link-meditation">
            <Card className="bg-gradient-to-br from-pink-500 to-purple-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Meditation</div>
                <div className="text-pink-200 text-xs">5 min session</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/healers" data-testid="link-healers">
            <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Healers</div>
                <div className="text-cyan-200 text-xs">Connect now</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/journal" data-testid="link-journal">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold mb-1">Journal</div>
                <div className="text-amber-200 text-xs">Track progress</div>
              </CardContent>
            </Card>
          </Link>
            </div>
          </>
        )}

        {/* Soul Energy Tab */}
        {activeTab === "soul energy" && (
          <div>
            {/* Milestone Progress */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-xl">Current Milestone</h2>
                    <p className="text-cyan-300 text-sm">{milestone.level}</p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${milestone.gradient} text-black px-4 py-2`}>
                    Level {energyMilestones.findIndex(m => m.level === milestone.level) + 1}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-200">Progress to Next Level</span>
                    <span className="text-white font-semibold">{milestoneProgress.current} / {milestoneProgress.total}</span>
                  </div>
                  <Progress value={milestoneProgress.percentage} className="h-3" />
                  <p className="text-xs text-cyan-300">
                    {milestone.max === Infinity ? 
                      `You've ascended! Keep growing your spiritual energy.` :
                      `${milestone.max - soulEnergy} more energy to reach ${energyMilestones[energyMilestones.findIndex(m => m.level === milestone.level) + 1]?.level || 'max level'}`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Soul Tree */}
            <Card className="bg-transparent border-0 mb-4">
              <CardContent className="p-0">
                <AvatarSoulTree soulEnergy={soulEnergy} />
              </CardContent>
            </Card>

            {/* Tree Growth Details */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-white font-bold text-lg mb-2">Soul Tree Growth</h3>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                    {Math.floor(treeGrowth)}%
                  </div>
                  <p className="text-cyan-300 text-sm">
                    {Math.floor((100 - treeGrowth) * 10)} more soul energy needed to reach 100%
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-cyan-400 text-2xl font-bold">{soulEnergy}</div>
                      <div className="text-xs text-cyan-200">Total Energy</div>
                    </div>
                    <div>
                      <div className="text-purple-400 text-2xl font-bold">+{SOUL_ENERGY_PER_SCAN}</div>
                      <div className="text-xs text-cyan-200">Per Scan</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Goals - Final State Section */}
            <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-yellow-400/30 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-white font-bold text-2xl mb-2">✨ Your Ultimate Goal ✨</h3>
                  <p className="text-yellow-200 text-sm">This is what awaits you at 100% soul energy</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Final Soul Tree */}
                  <div className="text-center space-y-3">
                    <h4 className="text-cyan-300 font-semibold">Fully Evolved Soul Tree</h4>
                    <div className="bg-black/30 rounded-lg p-4 flex justify-center">
                      <img 
                        src="/attached_assets/unnamed (13)_1763058572811.jpg" 
                        alt="100% Grown Soul Tree" 
                        className="max-h-48 object-contain rounded"
                      />
                    </div>
                    <p className="text-cyan-200 text-xs">At 100% growth, your soul tree reaches its full potential 🌳</p>
                  </div>

                  {/* Final Auri State */}
                  <div className="text-center space-y-3">
                    <h4 className="text-purple-300 font-semibold">Auri at Awakened Level</h4>
                    <div className="bg-black/30 rounded-lg p-4 flex justify-center">
                      <img 
                        src="/attached_assets/WhatsApp_Image_2025-11-15_at_10.15.23_PM-removebg-preview_1763832280129.png" 
                        alt="Auri Awakened Evolution" 
                        className="max-h-48 object-contain rounded"
                      />
                    </div>
                    <p className="text-purple-200 text-xs">Your spiritual companion reaches ultimate enlightenment 🌟</p>
                  </div>
                </div>

                <div className="mt-6 bg-white/5 rounded-lg p-4 border border-yellow-400/20">
                  <p className="text-yellow-100 text-sm text-center">
                    <span className="font-semibold">Awakened Level:</span> You've transcended the five soul energy tiers and reached spiritual mastery. Your tree flourishes in full bloom, and Auri has evolved into their highest consciousness form. Keep growing to unlock infinite spiritual potential! 🔮
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badge Info Tab - How to earn badges */}
        {activeTab === "badge info" && (
          <div className="space-y-4" data-testid="badge-info-section">
            {/* Badge Info Header */}
            <Card className="bg-gradient-to-br from-blue-400 via-cyan-500 to-green-600 border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="text-5xl animate-bounce">📚</div>
                  <div>
                    <h2 className="text-white text-3xl font-bold">Badge Progression Guide</h2>
                    <p className="text-blue-50 text-sm font-semibold">Earn badges by completing activities at different levels</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aura Badges */}
            <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-2 border-cyan-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-cyan-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎨</span> Aura Scan Badges
                </h3>
                <div className="space-y-3">
                  {getActivityBadges('aura').map((badge) => (
                    <div key={badge.type} className={`bg-gradient-to-r ${badge.color} rounded-lg p-4 border-2 border-white/30`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{badge.title}</p>
                          <p className="text-white/90 text-sm">{badge.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/90 font-semibold">{badge.requirement}</span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${badge.level === 'bronze' ? 'bg-amber-600/60 text-amber-100' : badge.level === 'silver' ? 'bg-slate-500/60 text-slate-100' : badge.level === 'gold' ? 'bg-yellow-500/60 text-yellow-100' : 'bg-cyan-400/60 text-cyan-100'}`}>{badge.level.toUpperCase()}</span>
                          </div>
                        </div>
                        {achievements.some(a => a.achievementType === badge.type) && (
                          <div className="text-2xl">✅</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vibe Check Badges */}
            <Card className="bg-gradient-to-br from-pink-900 to-rose-900 border-2 border-pink-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-pink-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Vibe Check Badges
                </h3>
                <div className="space-y-3">
                  {getActivityBadges('vibe').map((badge) => (
                    <div key={badge.type} className={`bg-gradient-to-r ${badge.color} rounded-lg p-4 border-2 border-white/30`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{badge.title}</p>
                          <p className="text-white/90 text-sm">{badge.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/90 font-semibold">{badge.requirement}</span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${badge.level === 'bronze' ? 'bg-amber-600/60 text-amber-100' : badge.level === 'silver' ? 'bg-slate-500/60 text-slate-100' : badge.level === 'gold' ? 'bg-yellow-500/60 text-yellow-100' : 'bg-cyan-400/60 text-cyan-100'}`}>{badge.level.toUpperCase()}</span>
                          </div>
                        </div>
                        {achievements.some(a => a.achievementType === badge.type) && (
                          <div className="text-2xl">✅</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journal Badges */}
            <Card className="bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-orange-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📖</span> Journal Entry Badges
                </h3>
                <div className="space-y-3">
                  {getActivityBadges('journal').map((badge) => (
                    <div key={badge.type} className={`bg-gradient-to-r ${badge.color} rounded-lg p-4 border-2 border-white/30`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{badge.title}</p>
                          <p className="text-white/90 text-sm">{badge.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/90 font-semibold">{badge.requirement}</span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${badge.level === 'bronze' ? 'bg-amber-600/60 text-amber-100' : badge.level === 'silver' ? 'bg-slate-500/60 text-slate-100' : badge.level === 'gold' ? 'bg-yellow-500/60 text-yellow-100' : 'bg-cyan-400/60 text-cyan-100'}`}>{badge.level.toUpperCase()}</span>
                          </div>
                        </div>
                        {achievements.some(a => a.achievementType === badge.type) && (
                          <div className="text-2xl">✅</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Numerology Badges */}
            <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-indigo-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔢</span> Numerology Reading Badges
                </h3>
                <div className="space-y-3">
                  {getActivityBadges('numerology').map((badge) => (
                    <div key={badge.type} className={`bg-gradient-to-r ${badge.color} rounded-lg p-4 border-2 border-white/30`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{badge.title}</p>
                          <p className="text-white/90 text-sm">{badge.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/90 font-semibold">{badge.requirement}</span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${badge.level === 'bronze' ? 'bg-amber-600/60 text-amber-100' : badge.level === 'silver' ? 'bg-slate-500/60 text-slate-100' : badge.level === 'gold' ? 'bg-yellow-500/60 text-yellow-100' : 'bg-cyan-400/60 text-cyan-100'}`}>{badge.level.toUpperCase()}</span>
                          </div>
                        </div>
                        {achievements.some(a => a.achievementType === badge.type) && (
                          <div className="text-2xl">✅</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* General Badges */}
            <Card className="bg-gradient-to-br from-slate-800 to-gray-900 border-2 border-slate-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-slate-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏆</span> Special Badges
                </h3>
                <div className="space-y-3">
                  {getActivityBadges('general').map((badge) => (
                    <div key={badge.type} className={`bg-gradient-to-r ${badge.color} rounded-lg p-4 border-2 border-white/30`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{badge.title}</p>
                          <p className="text-white/90 text-sm">{badge.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/90 font-semibold">{badge.requirement}</span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${badge.level === 'bronze' ? 'bg-amber-600/60 text-amber-100' : badge.level === 'silver' ? 'bg-slate-500/60 text-slate-100' : badge.level === 'gold' ? 'bg-yellow-500/60 text-yellow-100' : 'bg-cyan-400/60 text-cyan-100'}`}>{badge.level.toUpperCase()}</span>
                          </div>
                        </div>
                        {achievements.some(a => a.achievementType === badge.type) && (
                          <div className="text-2xl">✅</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-4" data-testid="achievements-section">
            {/* Achievements Header */}
            <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="text-5xl animate-bounce">🏆</div>
                  <div>
                    <h2 className="text-white text-3xl font-bold">Achievements</h2>
                    <p className="text-yellow-50 text-sm font-semibold">{achievements.length} badges earned! Unlock more as you progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Earned Badges */}
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-purple-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎖️</span> Your Badges ({achievements.length} earned)
                </h3>
                {achievements.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-purple-300 text-sm">Complete services to earn badges!</p>
                    <p className="text-purple-400 text-xs mt-2">Scan aura • Write journal • Check vibe • Read numerology</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-3 text-center border-2 border-yellow-300 shadow-lg animate-bounce" data-testid={`badge-${ach.achievementType}`}>
                        <div className="text-3xl mb-1">{ach.icon}</div>
                        <p className="text-white text-xs font-bold">{ach.title}</p>
                        <p className="text-yellow-100 text-xs">{ach.description}</p>
                        <p className="text-yellow-200 text-xs mt-1">✓ Earned</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Color Collector */}
            <Card className="bg-gradient-to-br from-pink-900 to-red-900 border-pink-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-pink-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌈</span> Color Collector
                </h3>
                <div className="mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-pink-300">Progress</span>
                    <span className="text-sm font-semibold text-white">2/8 Colors</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="w-12 h-12 rounded-lg bg-red-500/40 border-2 border-red-500 flex items-center justify-center" data-testid="color-red">🔴</div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/40 border-2 border-blue-500 flex items-center justify-center" data-testid="color-blue">🔵</div>
                  <div className="w-12 h-12 rounded-lg bg-gray-600/40 border border-gray-500 flex items-center justify-center opacity-50">🟡</div>
                  <div className="w-12 h-12 rounded-lg bg-gray-600/40 border border-gray-500 flex items-center justify-center opacity-50">🟢</div>
                </div>
              </CardContent>
            </Card>

            {/* Chakra Mastery */}
            <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-purple-200 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧘</span> Chakra Mastery
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3" data-testid="chakra-1">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-bold text-white text-sm">1</div>
                    <div className="flex-1">
                      <p className="text-purple-200 text-sm font-semibold">Root Chakra</p>
                      <Progress value={100} className="h-1 mt-1" />
                    </div>
                    <span>✨</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white text-sm">2</div>
                    <div className="flex-1">
                      <p className="text-purple-200 text-sm font-semibold">Sacral Chakra</p>
                      <Progress value={45} className="h-1 mt-1" />
                    </div>
                    <span className="text-xs">45%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-white text-sm">3</div>
                    <div className="flex-1">
                      <p className="text-purple-200 text-sm font-semibold">Solar Plexus</p>
                      <Progress value={10} className="h-1 mt-1" />
                    </div>
                    <span className="text-xs">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Healer Leaderboard */}
            <Card className="bg-gradient-to-br from-amber-900 to-orange-900 border-amber-600 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-yellow-300 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">👑</span> Top Healers
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-orange-800 rounded-lg border border-amber-600" data-testid="healer-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥇</span>
                      <div>
                        <p className="text-yellow-200 font-semibold text-sm">Varsha Gangrade</p>
                        <p className="text-orange-300 text-xs">Master Healer</p>
                      </div>
                    </div>
                    <p className="text-yellow-300 font-bold">45 sessions</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-800 rounded-lg border border-amber-600">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥈</span>
                      <div>
                        <p className="text-yellow-200 font-semibold text-sm">Vidhu Gupta</p>
                        <p className="text-orange-300 text-xs">Senior Healer</p>
                      </div>
                    </div>
                    <p className="text-yellow-300 font-bold">28 sessions</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-800 rounded-lg border border-amber-600">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥉</span>
                      <div>
                        <p className="text-yellow-200 font-semibold text-sm">Kalpana Muralidhar</p>
                        <p className="text-orange-300 text-xs">Healer</p>
                      </div>
                    </div>
                    <p className="text-yellow-300 font-bold">12 sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-white font-bold text-xl mb-2">Healer Bookings</h3>
              <p className="text-cyan-300">Your upcoming sessions with healers will appear here</p>
            </CardContent>
          </Card>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold text-lg">Your Activity Log</h3>
              </div>
              {creditTransactions && creditTransactions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {creditTransactions.map((tx: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{tx.description || tx.transactionType}</span>
                        <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} credits
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 text-xs capitalize">{tx.transactionType}</span>
                        <span className="text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-purple-300 text-xs mt-1">Balance: {tx.balanceAfter}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
                  <p className="text-cyan-300 text-sm">No activity yet. Start exploring!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <NotificationSettings />
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Profile Picture Upload Dialog */}
      <ProfilePictureUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={(pictureUrl) => {
          setProfilePictureUrl(pictureUrl);
        }}
      />
    </div>
  );
}
