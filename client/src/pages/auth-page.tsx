import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Star, Sparkles, Heart, Users, TrendingUp, Lightbulb, User } from "lucide-react";
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

type OnboardingStep = "auth" | "question1" | "question2" | "question3";

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
  const [pendingRegistration, setPendingRegistration] = useState<RegisterData | null>(null);

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

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.userType === "healer" || user.userType === "semi-healer") {
          setLocation("/healer-dashboard");
        } else {
          setLocation("/");
        }
      }
    });
  };

  const onRegisterSubmit = (data: RegisterData) => {
    // Don't register yet - save the form data and show onboarding questions first
    setPendingRegistration(data);
    setOnboardingStep("question1");
  };
  
  const handleFinalSubmit = (block: Block) => {
    // Now register with all onboarding data included
    if (pendingRegistration && manifestIntention && energyLevel && block) {
      registerMutation.mutate({
        ...pendingRegistration,
        manifestIntention,
        energyLevel,
        biggestBlock: block,
      } as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === '/api/credits' });
          
          toast({
            title: "Account Created! 🎉",
            description: "Your spiritual journey begins now.",
          });
          
          // Mark onboarding as seen and redirect to home page
          localStorage.setItem("hasSeenOnboarding", "true");
          setLocation("/");
        }
      });
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
                  disabled={registerMutation.isPending}
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : "Back"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if already logged in - go to home page which will show lights activation if needed
  // Wait for auth loading to complete before redirecting
  // Don't redirect if user is in the middle of onboarding questions
  if (!isLoading && user && onboardingStep === "auth") {
    // Always redirect to home page after login - lights activation will be shown if needed
    return <Redirect to="/" />;
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
          
          <CardDescription className="text-base text-white">Your Energy Made Visible</CardDescription>
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
                  
                  <div className="flex justify-center w-full">
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-white hover:text-purple-300 transition-colors"
                      data-testid="link-forgot-password"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  
                  <p className="text-center text-sm text-white-600 dark:text-slate-400">
                    Enter your credentials to continue your journey
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
                          <div className="text-sm text-white">
                            I agree to the{" "}
                            <button
                              type="button"
                              onClick={() => setShowTCDialog(true)}
                              className="text-purple-200 hover:text-purple-700 underline font-semibold"
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
