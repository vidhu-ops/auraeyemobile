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

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="relative w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <AuraGlow 
          colors={[
            { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
            { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
          ]} 
        />
        
        <Card className="w-full max-w-md z-10">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-black font-heading font-bold text-xl">A</span>
              </div>
              <span className="font-heading font-bold text-2xl text-primary">Aurafy</span>
            </div>
            <CardTitle className="text-2xl">Welcome to Aurafy</CardTitle>
            <CardDescription>Access your spiritual wellness journey</CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
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
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter className="flex-col space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Logging in...
                        </>
                      ) : "Login"}
                    </Button>
                    <Link href="/forgot-password" className="text-sm text-center text-primary hover:text-primary-dark">
                      Forgot your password?
                    </Link>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
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
                            <Input type="password" placeholder="Create a password" {...field} />
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
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mobile Verification Section - MANDATORY */}
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium text-red-600 mb-2 block">
                          * Mobile Verification Required
                        </label>
                        
                        {!verifiedMobile ? (
                          <MobileOtpVerificationSimple
                            onVerified={handleMobileVerified}
                            initialMobileNumber={registerForm.watch("mobileNumber") || ""}
                          />
                        ) : (
                          <div className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                            ✓ Mobile verified: {verifiedMobile}
                          </div>
                        )}
                      </div>
                    </div>
                    

                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={registerMutation.isPending || !verifiedMobile}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Creating account...
                        </>
                      ) : !verifiedMobile ? "Please verify mobile number first" : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="w-full md:w-1/2 bg-blue-to-br from-light-dark to-primary text-black p-6 md:p-12 flex items-center">
        <div className="max-w mx-auto">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-6">Begin Your Spiritual Journey</h1>
          <p className="text-lg opacity-90 mb-8">
            Aurafy connects you with powerful spiritual tools to discover your aura, analyze your energy, and embark on a path of healing and self-discovery.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white rounded-full p-2 mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Aura Analysis</h3>
                <p className="opacity-80">Upload photos and receive detailed analysis of your aura colors and energy patterns.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Daily Spiritual Guidance</h3>
                <p className="opacity-80">Get personalized horoscopes, numerology insights, and energy forecasts.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Connect with Healers</h3>
                <p className="opacity-80">Book sessions with experienced spiritual guides and energy healers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
