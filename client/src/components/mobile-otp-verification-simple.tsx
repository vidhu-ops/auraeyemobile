import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface MobileOtpVerificationProps {
  onVerified: (mobileNumber: string) => void;
  initialMobileNumber?: string;
}

export default function MobileOtpVerificationSimple({ onVerified, initialMobileNumber = "" }: MobileOtpVerificationProps) {
  const [step, setStep] = useState<"mobile" | "otp" | "verified">("mobile");
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const validation = mobileSchema.safeParse({ mobileNumber });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const response = await apiRequest("POST", "/api/send-otp", { mobileNumber });
      const result = await response.json();
      
      if (response.ok) {
        setStep("otp");
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
          title: "WhatsApp OTP Sent",
          description: "Please check your WhatsApp for the verification code",
        });
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const validation = otpSchema.safeParse({ otp });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const response = await apiRequest("POST", "/api/verify-otp", {
        mobileNumber,
        otp,
      });
      const result = await response.json();
      
      if (response.ok && result.verified) {
        setStep("verified");
        toast({
          title: "WhatsApp Verified",
          description: "Your WhatsApp number has been verified successfully",
        });
        onVerified(mobileNumber);
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
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
          title: "WhatsApp OTP Resent",
          description: "A new verification code has been sent to your WhatsApp",
        });
      } else {
        setError(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          {step === "mobile" ? "WhatsApp Verification" : "Enter WhatsApp OTP"}
        </h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "mobile" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp Number</label>
            <Input
              type="tel"
              placeholder="Enter your WhatsApp number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              You'll receive a 6-digit verification code on WhatsApp
            </p>
          </div>

          <Button 
            type="button"
            onClick={handleSendOtp}
            className="w-full"
            disabled={isLoading || !mobileNumber}
          >
            {isLoading ? "Sending..." : "Send WhatsApp Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              WhatsApp verification code sent to {mobileNumber}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Code</label>
            <Input 
              placeholder="Enter 6-digit code" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={handleVerifyOtp}
              className="flex-1"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setStep("mobile")}
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
          
          {countdown > 0 && (
            <p className="text-sm text-center text-gray-500">
              Resend code in {countdown}s
            </p>
          )}
          
          {countdown === 0 && (
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={handleResendOtp}
              disabled={isLoading}
            >
              Resend Code
            </Button>
          )}
        </div>
      )}
    </div>
  );
}