import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Star, Sparkles, Heart, Users, TrendingUp, Lightbulb, User, Calculator } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { manifestIntentions, energyLevels, blocks, type ManifestIntention, type EnergyLevel, type Block } from "@shared/onboarding-presets";
import { TERMS_AND_CONDITIONS, TERMS_AND_CONDITIONS_SHORT } from "@/lib/terms-and-conditions";
import logoPath from "@assets/new-logo.jpeg";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms & Conditions to register"
  }),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

type OnboardingStep = "auth" | "numerology" | "question1" | "question2" | "question3";

type NumerologyResult = {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  personalYearNumber: number;
  interpretation: string;
};

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("auth");
  
  // Onboarding answers
  const [manifestIntention, setManifestIntention] = useState<ManifestIntention | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [biggestBlock, setBiggestBlock] = useState<Block | null>(null);
  const [showTCDialog, setShowTCDialog] = useState(false);
  
  // Numerology state
  const [numerology, setNumerology] = useState<NumerologyResult | null>(null);
  const [isLoadingNumerology, setIsLoadingNumerology] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState("");
  const [registeredBirthDate, setRegisteredBirthDate] = useState("");
  
  // No auto-trigger for onboarding questions
  // Questions will only show after registration via onRegisterSubmit
  
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      birthDate: "",
      agreeToTerms: false,
    },
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: { manifestIntention: ManifestIntention; energyLevel: EnergyLevel; biggestBlock: Block }) => {
      const response = await apiRequest("PATCH", "/api/users/me/onboarding", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      
      toast({
        title: "Welcome Bonus! 🎉",
        description: `You've received ${data.creditsAwarded || 5} free credits!`,
      });
      
      // Mark onboarding as seen and redirect to home
      localStorage.setItem("hasSeenOnboarding", "true");
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: (loggedInUser) => {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = loggedInUser.manifestIntention && loggedInUser.energyLevel && loggedInUser.biggestBlock;
        
        if (hasCompletedOnboarding) {
          // Redirect to appropriate dashboard based on user type
          const dashboardPath = loggedInUser.userType === 'healer' ? '/healer-dashboard' : '/dashboard';
          setLocation(dashboardPath);
        } else {
          // Redirect to home page (will trigger onboarding if needed)
          setLocation('/');
        }
      }
    });
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        // Store username and birth date for numerology calculation
        setRegisteredUsername(data.username);
        setRegisteredBirthDate(data.birthDate);
        // Show numerology results first
        setOnboardingStep("numerology");
        // Calculate numerology
        calculateNumerology(data.username, data.birthDate);
      }
    });
  };

  const calculateNumerology = async (name: string, birthDate: string) => {
    setIsLoadingNumerology(true);
    try {
      const response = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthDate }),
      });
      if (response.ok) {
        const data = await response.json();
        setNumerology(data);
      }
    } catch (error) {
      console.error("Error calculating numerology:", error);
      toast({
        title: "Error",
        description: "Failed to calculate numerology. Proceeding to next step.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNumerology(false);
    }
  };
  
  const handleNumerologyComplete = () => {
    setOnboardingStep("question1");
  };
  
  const handleFinalSubmit = (block: Block) => {
    if (manifestIntention && energyLevel && block) {
      saveOnboardingMutation.mutate({ manifestIntention, energyLevel, biggestBlock: block });
    }
  };
  
  const getIconForIntention = (intention: string) => {
    switch (intention) {
      case "Health": return Heart;
      case "Relationships": return Users;
      case "Abundance": return TrendingUp;
      case "Clarity": return Lightbulb;
      default: return Star;
    }
  };

  // Show numerology results after registration
  if (onboardingStep === "numerology") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Numerology Blueprint</h2>
              <p className="text-xl text-cyan-200">Based on your birth date: {new Date(registeredBirthDate).toLocaleDateString()}</p>
            </div>

            {isLoadingNumerology ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
                <p className="text-white">Calculating your spiritual numbers...</p>
              </div>
            ) : numerology ? (
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-purple-300/30">
                    <div className="text-sm text-purple-200 mb-1">Life Path</div>
                    <div className="text-4xl font-bold text-purple-300">{numerology.lifePathNumber}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-pink-300/30">
                    <div className="text-sm text-pink-200 mb-1">Destiny</div>
                    <div className="text-4xl font-bold text-pink-300">{numerology.destinyNumber}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-blue-300/30">
                    <div className="text-sm text-blue-200 mb-1">Soul Urge</div>
                    <div className="text-4xl font-bold text-blue-300">{numerology.soulUrgeNumber}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-green-300/30">
                    <div className="text-sm text-green-200 mb-1">Personality</div>
                    <div className="text-4xl font-bold text-green-300">{numerology.personalityNumber}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-cyan-300/30">
                  <div className="text-sm text-cyan-200 mb-2">Your Spiritual Interpretation</div>
                  <p className="text-white text-sm leading-relaxed">{numerology.interpretation}</p>
                </div>
              </div>
            ) : null}

            <Button
              onClick={handleNumerologyComplete}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg"
              data-testid="button-continue-numerology"
            >
              Continue to Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show onboarding questions FIRST (these take priority over redirect)
  if (onboardingStep === "question1") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Question 1 of 3</h2>
              <p className="text-xl text-cyan-200">What's your top intention to manifest right now?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {manifestIntentions.map((intention) => {
                const Icon = getIconForIntention(intention);
                return (
                  <button
                    key={intention}
                    onClick={() => {
                      setManifestIntention(intention);
                      setOnboardingStep("question2");
                    }}
                    className="p-6 rounded-xl border-2 bg-white/5 border-white/10 hover:bg-white/10 transition-all transform hover:scale-105"
                    data-testid={`button-intention-${intention.toLowerCase()}`}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                    <h3 className="text-xl font-bold text-white">{intention}</h3>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show onboarding question 2
  if (onboardingStep === "question2") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Question 2 of 3</h2>
              <p className="text-xl text-cyan-200">How do you feel energetically today?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {energyLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setEnergyLevel(level);
                    setOnboardingStep("question3");
                  }}
                  className="p-6 rounded-xl border-2 bg-white/5 border-white/10 hover:bg-white/10 transition-all transform hover:scale-105"
                  data-testid={`button-energy-${level.toLowerCase()}`}
                >
                  <div className="text-4xl mb-2">
                    {level === "Low" && "😔"}
                    {level === "Balanced" && "😌"}
                    {level === "High" && "🌟"}
                  </div>
                  <h3 className="text-xl font-bold text-white">{level}</h3>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setOnboardingStep("question1")}
              variant="outline"
              className="w-full text-white border-white/20"
              data-testid="button-back"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show onboarding question 3
  if (onboardingStep === "question3") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Question 3 of 3</h2>
              <p className="text-xl text-cyan-200">What's your biggest block right now?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {blocks.map((block) => (
                <button
                  key={block}
                  onClick={() => {
                    setBiggestBlock(block);
                    handleFinalSubmit(block);
                  }}
                  className="p-4 rounded-xl border-2 bg-white/5 border-white/10 hover:bg-white/10 transition-all transform hover:scale-105"
                  data-testid={`button-block-${block.toLowerCase().replace(/\s+/g, '-')}`}
                  disabled={saveOnboardingMutation.isPending}
                >
                  <h3 className="text-lg font-bold text-white">{block}</h3>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setOnboardingStep("question2")}
              variant="outline"
              className="w-full text-white border-white/20"
              data-testid="button-back"
              disabled={saveOnboardingMutation.isPending}
            >
              {saveOnboardingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : "Back"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if already logged in AND completed onboarding
  // Wait for auth loading to complete before redirecting
  if (!isLoading && user && onboardingStep === "auth") {
    const hasCompletedOnboarding = user.manifestIntention && user.energyLevel && user.biggestBlock;
    if (hasCompletedOnboarding && user.userType) {
      // Redirect to appropriate dashboard based on user type
      const dashboardPath = user.userType === 'healer' ? '/healer-dashboard' : '/dashboard';
      return <Redirect to={dashboardPath} />;
    }
  }

  // Show auth form by default
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 md:p-8">
      <Card className="w-full md:max-w-md lg:max-w-lg md:shadow-2xl md:border-cyan-900/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
        <CardHeader className="space-y-4 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <img src={logoPath} alt="AuraEye Logo" className="relative w-18 h-16 align-center rounded-full object-cover ring-4 ring-purple-500/30" />
            </div>
            <CardTitle className="font-heading font-bold text-white text-3xl">
              AuraEye™
            </CardTitle>
          </div>
          
          <CardDescription className="text-base text-white">Access your spiritual wellness journey</CardDescription>
        </CardHeader>
          
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
          <TabsList className="grid w-xl grid-cols-2 mx-6">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardContent className="space-y-5 pt-2">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} data-testid="input-login-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="" {...field} data-testid="input-login-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex-col space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                        Logging in...
                      </>
                    ) : "Login"}
                  </Button>
                  
                  <p className="text-center text-sm text-white-600 dark:text-slate-400">
                    Enter your credentials to continue your spiritual journey
                  </p>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <CardContent className="space-y-5 pt-2">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} data-testid="input-register-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="" {...field} data-testid="input-register-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-register-birthdate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="" {...field} data-testid="input-register-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-agree-terms"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <div className="text-sm text-slate-600">
                            I agree to the{" "}
                            <button
                              type="button"
                              onClick={() => setShowTCDialog(true)}
                              className="text-purple-600 hover:text-purple-700 underline font-semibold"
                              data-testid="button-view-terms"
                            >
                              Terms & Conditions
                            </button>
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex-col space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={registerMutation.isPending}
                    data-testid="button-register-now"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                        Creating account...
                      </>
                    ) : "Register Now"}
                  </Button>
                  
                  <p className="text-center text-sm text-white-600 dark:text-slate-400">
                    Create an account to begin your spiritual journey
                  </p>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTCDialog} onOpenChange={setShowTCDialog}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms & Conditions and Disclaimer</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {TERMS_AND_CONDITIONS}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
