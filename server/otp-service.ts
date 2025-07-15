import { db } from "./db";
import { otpVerifications } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in database for verification
export async function storeOTP(mobileNumber: string): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  
  await db.insert(otpVerifications).values({
    mobileNumber,
    otp,
    expiresAt
  });
  
  return otp;
}

// Verify OTP and mark as verified
export async function verifyOTP(mobileNumber: string, otp: string): Promise<boolean> {
  const now = new Date();
  
  // Find valid OTP
  const [otpRecord] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.mobileNumber, mobileNumber),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.verified, false),
        gt(otpVerifications.expiresAt, now)
      )
    );
  
  if (!otpRecord) {
    return false;
  }
  
  // Mark OTP as verified
  await db
    .update(otpVerifications)
    .set({ verified: true })
    .where(eq(otpVerifications.id, otpRecord.id));
  
  return true;
}

// Check if mobile number is verified
export async function isMobileVerified(mobileNumber: string): Promise<boolean> {
  const [record] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.mobileNumber, mobileNumber),
        eq(otpVerifications.verified, true)
      )
    );
  
  return !!record;
}

// Send OTP via WhatsApp
export async function sendOTPSMS(mobileNumber: string, otp: string): Promise<boolean> {
  try {
    console.log(`\n=== WHATSAPP OTP SENDING ===`);
    console.log(`WhatsApp Number: ${mobileNumber}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    
    // Import WhatsApp service
    const { sendWhatsAppOTP } = await import('./whatsapp-service');
    
    // Try to send via WhatsApp
    const sent = await sendWhatsAppOTP(mobileNumber, otp);
    
    if (sent) {
      console.log('WhatsApp OTP sent successfully!');
      console.log(`=============================\n`);
      return true;
    } else {
      // Fallback: log to console for development
      console.log('WhatsApp not available, logging OTP for development:');
      console.log(`WhatsApp Message: Your Aurfy verification code is: ${otp}. This code will expire in 10 minutes.`);
      console.log(`=============================\n`);
      return true; // Return true for development purposes
    }
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    // Fallback: log to console for development
    console.log('Fallback - logging OTP for development:');
    console.log(`WhatsApp Message: Your Aurfy verification code is: ${otp}. This code will expire in 10 minutes.`);
    console.log(`=============================\n`);
    return true; // Return true for development purposes
  }
}

// Generate and send OTP
export async function generateAndSendOTP(mobileNumber: string): Promise<boolean> {
  try {
    const otp = await storeOTP(mobileNumber);
    const sent = await sendOTPSMS(mobileNumber, otp);
    return sent;
  } catch (error) {
    console.error("Error generating/sending OTP:", error);
    return false;
  }
}