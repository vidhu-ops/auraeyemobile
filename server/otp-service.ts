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

// Send OTP via SMS (simulated - logs to console with detailed information)
export async function sendOTPSMS(mobileNumber: string, otp: string): Promise<boolean> {
  // In a real implementation, this would use a service like Twilio
  console.log(`\n=== SMS OTP SENDING ===`);
  console.log(`Mobile: ${mobileNumber}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Message: Your Aurfy verification code is: ${otp}. This code will expire in 10 minutes.`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log(`======================\n`);
  
  // For demo purposes, we'll always return true
  // In production, you would integrate with SMS service like Twilio:
  // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `Your Aurfy verification code is: ${otp}. This code will expire in 10 minutes.`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: mobileNumber
  // });
  return true;
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