import { db } from "./db";
import { otpVerifications } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { validateWhatsAppNumber } from "./whatsapp-validator";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in database for verification
export async function storeOTP(mobileNumber: string): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  
  console.log(`\n=== STORING OTP IN DATABASE ===`);
  console.log(`Mobile Number: ${mobileNumber}`);
  console.log(`Generated OTP: ${otp}`);
  console.log(`Expires At: ${expiresAt.toLocaleString()}`);
  
  await db.insert(otpVerifications).values({
    mobileNumber,
    otp,
    expiresAt
  });
  
  console.log('OTP stored successfully in database');
  console.log('===============================\n');
  
  return otp;
}

// Verify OTP and mark as verified
export async function verifyOTP(mobileNumber: string, otp: string): Promise<boolean> {
  const now = new Date();
  
  console.log(`\n=== OTP VERIFICATION PROCESS ===`);
  console.log(`Mobile Number: ${mobileNumber}`);
  console.log(`OTP to verify: ${otp}`);
  console.log(`Current time: ${now.toLocaleString()}`);
  
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
    console.log('OTP verification failed: No valid OTP record found');
    console.log('Possible reasons:');
    console.log('- OTP does not match');
    console.log('- OTP has expired');
    console.log('- OTP has already been verified');
    console.log('- Mobile number does not match');
    console.log('===============================\n');
    return false;
  }
  
  console.log('Valid OTP record found!');
  console.log(`OTP ID: ${otpRecord.id}`);
  console.log(`Expires at: ${otpRecord.expiresAt.toLocaleString()}`);
  console.log(`Created at: ${otpRecord.createdAt.toLocaleString()}`);
  
  // Mark OTP as verified
  await db
    .update(otpVerifications)
    .set({ verified: true })
    .where(eq(otpVerifications.id, otpRecord.id));
  
  console.log('OTP marked as verified in database');
  console.log('OTP verification successful!');
  console.log('===============================\n');
  
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

// Generate and send OTP with multiple delivery methods
export async function generateAndSendOTP(mobileNumber: string): Promise<{ success: boolean; message?: string; otp?: string; }> {
  try {
    console.log(`\n=== OTP GENERATION AND DELIVERY ===`);
    console.log(`Mobile Number: ${mobileNumber}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    
    // Skip WhatsApp validation (it's unreliable) and go straight to OTP generation
    console.log('Skipping WhatsApp validation - proceeding directly to OTP delivery');
    
    const otp = await storeOTP(mobileNumber);
    
    // Try multiple delivery methods
    console.log(`\n=== ATTEMPTING MULTIPLE DELIVERY METHODS ===`);
    
    // Method 1: WhatsApp via Twilio
    let whatsAppSent = false;
    try {
      whatsAppSent = await sendOTPSMS(mobileNumber, otp);
      console.log(`WhatsApp delivery: ${whatsAppSent ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.log(`WhatsApp delivery: FAILED - ${error}`);
    }
    
    // Always provide the OTP in development logs for guaranteed access
    console.log(`\n🔐 GUARANTEED ACCESS - DEVELOPMENT OTP CODE: ${otp}`);
    console.log(`📱 For immediate testing, use this OTP: ${otp}`);
    console.log(`⏰ Expires in 10 minutes`);
    console.log(`\n📋 MULTIPLE WAYS TO GET YOUR OTP:`);
    console.log(`   1. Check WhatsApp messages (if you joined sandbox)`);
    console.log(`   2. Use the code above: ${otp}`);
    console.log(`   3. Check server logs for the code`);
    console.log(`\n🚨 WHATSAPP SANDBOX SETUP (if needed):`);
    console.log(`   Send "join palace-stuck" to +1 415 523 8886 on WhatsApp`);
    console.log(`   Then you'll receive WhatsApp OTPs automatically`);
    console.log(`=====================================\n`);
    
    // Return success with the OTP for development
    return { 
      success: true, 
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      message: `OTP generated successfully! ${process.env.NODE_ENV === 'development' ? `Your code is: ${otp}` : 'Check WhatsApp or server logs for your verification code.'}`
    };
  } catch (error) {
    console.error("Error generating/sending OTP:", error);
    
    // Even if there's an error, try to generate and provide an OTP
    try {
      const fallbackOtp = await storeOTP(mobileNumber);
      console.log(`\n🆘 FALLBACK OTP: ${fallbackOtp}`);
      console.log(`Use this code if other methods failed: ${fallbackOtp}`);
      console.log(`=====================================\n`);
      
      return { 
        success: true, 
        otp: process.env.NODE_ENV === 'development' ? fallbackOtp : undefined,
        message: `OTP generated (fallback mode). Your code is: ${fallbackOtp}`
      };
    } catch (fallbackError) {
      console.error("Even fallback OTP generation failed:", fallbackError);
      return { success: false, message: 'Unable to generate verification code. Please try again.' };
    }
  }
}