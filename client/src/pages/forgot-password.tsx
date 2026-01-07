import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";

const forgotPasswordSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  token: z.string().min(6, "Reset code must be 6 digits").max(6, "Reset code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      username: "",
      email: "",
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/forgot-password-email", data);
      const result = await response.json();
      
      if (response.ok) {
        setUsername(data.username);
        setEmail(data.email);
        resetForm.setValue("username", data.username);
        resetForm.setValue("email", data.email);
        setStep("reset");
        toast({
          title: "Reset Code Sent",
          description: "Please check your email for the reset code",
        });
      } else {
        setError(result.message || "Failed to send reset code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/reset-password-email", {
        username: data.username,
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
      });
      const result = await response.json();
      
      if (response.ok) {
        setStep("success");
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully",
        });
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStep("request");
    setError("");
    resetForm.reset();
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <Navbar />
        <div className="flex-grow bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been updated successfully. You can now login with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" data-testid="button-go-to-login">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === "request" 
              ? "Enter your username and email address and we'll send you a reset code" 
              : "Verify your details and enter the reset code sent to your email"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "request" ? (
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <FormField
                  control={forgotForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={isLoading}
                          data-testid="input-forgot-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={isLoading}
                          data-testid="input-forgot-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                  data-testid="button-send-reset-code"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4" autoComplete="off">
                {/* Hidden decoy fields to prevent browser autofill */}
                <input type="text" name="fake-email-field" style={{ display: 'none' }} tabIndex={-1} autoComplete="email" />
                <input type="password" name="fake-password-field" style={{ display: 'none' }} tabIndex={-1} autoComplete="current-password" />
                
                <FormField
                  control={resetForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Verify your username"
                          {...field}
                          disabled={isLoading}
                          data-testid="input-reset-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Verify your email address"
                          {...field}
                          disabled={isLoading}
                          data-testid="input-reset-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reset Code</FormLabel>
                      <FormControl>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="Enter 6-digit reset code"
                          maxLength={6}
                          autoComplete="off"
                          id="verification-code-field"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          disabled={isLoading}
                          data-testid="input-reset-token"
                        />
                      </FormControl>
                      <FormDescription>
                        Check your email for the reset code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                          disabled={isLoading}
                          data-testid="input-new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          disabled={isLoading}
                          data-testid="input-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                  data-testid="button-reset-password"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToRequest}
                  disabled={isLoading}
                  data-testid="button-back-to-email"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Email Entry
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
      <Footer />
      <MobileNavigation />
    </div>
  );
}
