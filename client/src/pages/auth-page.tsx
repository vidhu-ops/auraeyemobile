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
import { AuraGlow } from "@/components/ui/aura-glow";
import { Loader2 } from "lucide-react";
import logoPath from "@assets/new-logo.jpeg";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 md:p-8">
      {/* Full page on mobile, centered card on desktop */}
      <Card className="w-full md:max-w-md lg:max-w-lg md:shadow-2xl md:border-cyan-900/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
        <CardHeader className="space-y-4 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 blur-xl opacity-50 animate-pulse"></div>
              <img src={logoPath} alt="AuraEye Logo" className="relative w-16 h-16 rounded-full object-cover ring-4 ring-purple-500/30" />
            </div>
            <CardTitle className="font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-3xl">
              AuraEye™
            </CardTitle>
          </div>
          
          <CardDescription className="text-base">Access your spiritual wellness journey</CardDescription>
        </CardHeader>
          
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
                        <Input placeholder="" {...field} />
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
                        <Input type="password" placeholder="" {...field} />
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
                
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Enter your credentials to continue your spiritual journey
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
    </div>
  );
}
