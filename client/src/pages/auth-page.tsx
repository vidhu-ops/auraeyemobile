import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuraGlow } from "@/components/ui/aura-glow";
import { Loader2 } from "lucide-react";
import MobileOtpVerificationSimple from "@/components/mobile-otp-verification-simple";
import logoPath from "@/assets/eye-logo.png";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
  mobileNumber: z.string().min(10, "Mobile number verification is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [verifiedMobile, setVerifiedMobile] = useState<string>("");
  const { user, loginMutation, registerMutation } = useAuth();
  
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
      mobileNumber: "",
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    // Include verified mobile number in registration data
    const registrationData = {
      ...data,
      mobileNumber: verifiedMobile || data.mobileNumber,
    };
    registerMutation.mutate(registrationData);
  };

  const handleMobileVerified = (mobileNumber: string) => {
    setVerifiedMobile(mobileNumber);
    setShowMobileVerification(false);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-primary/5 to-secondary/5 animate-in fade-in-0 duration-1000">
      <div className="relative w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <AuraGlow 
          colors={[
            { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
            { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
          ]} 
        />
        
        <Card className="w-full max-w-md z-10 animate-in slide-in-from-bottom-8 fade-in-0 duration-800 delay-300 shadow-2xl border-primary/20 hover:shadow-primary/10 transition-all duration-500">
          <CardHeader className="animate-in slide-in-from-top-4 fade-in-0 duration-700 delay-500">
            <div className="flex items-center space-x-2 mb-2 animate-in zoom-in-50 fade-in-0 duration-600 delay-700">
              <img src={logoPath} alt="AuraEye Logo" className="w-10 h-10 rounded-full object-cover transition-transform duration-300 hover:scale-110 hover:rotate-12" />
              <span className="font-heading font-bold text-2xl text-primary bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent animate-in slide-in-from-left-4 duration-600 delay-800">AuraEye™</span>
            </div>
            <CardTitle className="text-2xl animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Welcome to AuraEye</CardTitle>
            <CardDescription className="animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-1000 text-muted-foreground">Access your spiritual wellness journey</CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-in fade-in-0 duration-600 delay-1100">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-primary/5 to-secondary/5 transition-all duration-300">
              <TabsTrigger value="login" className="transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white data-[state=active]:shadow-lg">Login</TabsTrigger>
              <TabsTrigger value="register" className="transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white data-[state=active]:shadow-lg">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-in slide-in-from-right-4 fade-in-0 duration-500">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-200">
                          <FormLabel className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              {...field} 
                              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:border-primary/50 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50 border-2"
                            />
                          </FormControl>
                          <FormMessage className="animate-in slide-in-from-left-2 fade-in-0 duration-300" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-400">
                          <FormLabel className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              {...field} 
                              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:border-primary/50 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50 border-2"
                            />
                          </FormControl>
                          <FormMessage className="animate-in slide-in-from-left-2 fade-in-0 duration-300" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter className="flex-col space-y-2 animate-in slide-in-from-bottom-4 fade-in-0 duration-600 delay-600">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          <span className="animate-pulse">Logging in...</span>
                        </>
                      ) : (
                        <span className="font-medium">Login</span>
                      )}
                    </Button>
                    <Link href="/forgot-password" className="text-sm text-center text-primary hover:text-primary-dark transition-all duration-300 hover:scale-105 animate-in fade-in-0 duration-500 delay-800">
                      Forgot your password?
                    </Link>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register" className="animate-in slide-in-from-left-4 fade-in-0 duration-500">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-right-4 fade-in-0 duration-600 delay-100">
                          <FormLabel className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              {...field} 
                              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:border-primary/50 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50 border-2"
                            />
                          </FormControl>
                          <FormMessage className="animate-in slide-in-from-right-2 fade-in-0 duration-300" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-right-4 fade-in-0 duration-600 delay-200">
                          <FormLabel className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email for password reset" 
                              {...field} 
                              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:border-primary/50 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50 border-2"
                            />
                          </FormControl>
                          <FormMessage className="animate-in slide-in-from-right-2 fade-in-0 duration-300" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-right-4 fade-in-0 duration-600 delay-300">
                          <FormLabel className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password" 
                              {...field} 
                              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:border-primary/50 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50 border-2"
                            />
                          </FormControl>
                          <FormMessage className="animate-in slide-in-from-right-2 fade-in-0 duration-300" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-right-4 fade-in-0 duration-600 delay-400">
                          <FormLabel className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">Birth Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:border-primary/50 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50 border-2"
                            />
                          </FormControl>
                          <FormMessage className="animate-in slide-in-from-right-2 fade-in-0 duration-300" />
                        </FormItem>
                      )}
                    />

                    {/* Mobile Verification Section - MANDATORY */}
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in-0 duration-600 delay-500">
                      <div className="border-t pt-4 border-gradient-to-r from-primary/20 to-secondary/20">
                        <label className="text-sm font-medium bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-2 block animate-pulse">
                          * Mobile Verification Required
                        </label>
                        
                        {!verifiedMobile ? (
                          <div className="animate-in zoom-in-95 fade-in-0 duration-500 delay-100">
                            <MobileOtpVerificationSimple
                              onVerified={handleMobileVerified}
                              initialMobileNumber={registerForm.watch("mobileNumber") || ""}
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-green-600 font-medium bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 animate-in scale-in-95 fade-in-0 duration-500">
                            <span className="inline-block animate-bounce mr-2">✓</span>
                            Mobile verified: {verifiedMobile}
                          </div>
                        )}
                      </div>
                    </div>
                    

                  </CardContent>
                  
                  <CardFooter className="animate-in slide-in-from-bottom-4 fade-in-0 duration-600 delay-700">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={registerMutation.isPending || !verifiedMobile}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          <span className="animate-pulse">Creating account...</span>
                        </>
                      ) : !verifiedMobile ? (
                        <span className="font-medium">Please verify mobile number first</span>
                      ) : (
                        <span className="font-medium">Create Account</span>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 text-gray-800 p-6 md:p-12 flex items-center animate-in slide-in-from-right-8 fade-in-0 duration-1000 delay-200">
        <div className="max-w mx-auto">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-6 bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent animate-in slide-in-from-top-4 fade-in-0 duration-800 delay-600">
            Begin Your Spiritual Journey
          </h1>
          <p className="text-lg opacity-90 mb-8 leading-relaxed animate-in slide-in-from-left-4 fade-in-0 duration-700 delay-800">
            AuraEye connects you with powerful spiritual tools to discover your aura, analyze your energy, and embark on a path of healing and self-discovery.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-1000 hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-full p-2 mr-4 shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Aura Analysis</h3>
                <p className="opacity-80 text-gray-700">Upload photos and receive detailed analysis of your aura colors and energy patterns.</p>
              </div>
            </div>
            
            <div className="flex items-start animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-1200 hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-secondary to-primary rounded-full p-2 mr-4 shadow-lg animate-pulse delay-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Daily Spiritual Guidance</h3>
                <p className="opacity-80 text-gray-700">Get personalized horoscopes, numerology insights, and energy forecasts.</p>
              </div>
            </div>
            
            <div className="flex items-start animate-in slide-in-from-left-4 fade-in-0 duration-600 delay-1400 hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-primary-dark to-secondary rounded-full p-2 mr-4 shadow-lg animate-pulse delay-500">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Connect with Healers</h3>
                <p className="opacity-80 text-gray-700">Book sessions with experienced spiritual guides and energy healers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
