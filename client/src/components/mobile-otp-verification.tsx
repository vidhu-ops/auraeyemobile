import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Smartphone, CheckCircle } from "lucide-react";

const mobileSchema = z.object({
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type MobileForm = z.infer<typeof mobileSchema>;
type OtpForm = z.infer<typeof otpSchema>;

interface MobileOtpVerificationProps {
  onVerified: (mobileNumber: string) => void;
  initialMobileNumber?: string;
}

export default function MobileOtpVerification({ onVerified, initialMobileNumber = "" }: MobileOtpVerificationProps) {
  const [step, setStep] = useState<"mobile" | "otp" | "verified">("mobile");
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const mobileForm = useForm<MobileForm>({
    resolver: zodResolver(mobileSchema),
    defaultValues: {
      mobileNumber: initialMobileNumber,
    },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSendOtp = async (data: MobileForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/send-otp", data);
      const result = await response.json();
      
      if (response.ok) {
        setMobileNumber(data.mobileNumber);
        setStep("otp");
        setCountdown(60); // 60 second countdown
        
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast({
          title: "OTP Sent",
          description: "Please check your mobile for the verification code",
        });
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/verify-otp", {
        mobileNumber,
        otp: data.otp,
      });
      const result = await response.json();
      
      if (response.ok && result.verified) {
        setStep("verified");
        toast({
          title: "Mobile Verified",
          description: "Your mobile number has been verified successfully",
        });
        onVerified(mobileNumber);
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/send-otp", { mobileNumber });
      const result = await response.json();
      
      if (response.ok) {
        setCountdown(60);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your mobile",
        });
      } else {
        setError(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep("mobile");
    setError("");
    setCountdown(0);
    otpForm.reset();
  };

  if (step === "verified") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">Mobile Verified!</h3>
          <p className="text-sm text-gray-600">
            Your mobile number {mobileNumber} has been verified successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Smartphone className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {step === "mobile" ? "Mobile Verification" : "Enter OTP"}
        </h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "mobile" ? (
        <Form {...mobileForm}>
          <form onSubmit={mobileForm.handleSubmit(handleSendOtp)} className="space-y-4">
            <FormField
              control={mobileForm.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your mobile number"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your mobile number with country code (e.g., +1234567890)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              We've sent a verification code to <strong>{mobileNumber}</strong>
            </div>

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                      className="text-center text-lg tracking-wider"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the 6-digit code sent to your mobile number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="flex justify-between items-center text-sm">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToMobile}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                Change Number
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isLoading || countdown > 0}
                className="text-purple-600 hover:text-purple-700"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}