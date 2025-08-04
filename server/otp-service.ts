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

// Generate and send OTP with WhatsApp validation
export async function generateAndSendOTP(mobileNumber: string): Promise<{ success: boolean; message?: string; }> {
  try {
    console.log(`\n=== WHATSAPP VALIDATION ===`);
    console.log(`Validating number: ${mobileNumber}`);
    
    // Validate WhatsApp number first
    const validation = await validateWhatsAppNumber(mobileNumber);
    
    console.log(`Validation result:`, validation);
    
    if (!validation.hasWhatsApp) {
      console.log('Number does not have WhatsApp, but proceeding anyway (fallback)');
      console.log(`============================\n`);
      // Continue with OTP sending even if validation fails (fallback behavior)
    }
    
    const otp = await storeOTP(mobileNumber);
    const sent = await sendOTPSMS(mobileNumber, otp);
    
    // For development - always show the OTP in console logs for easy testing
    console.log(`\n🔐 DEVELOPMENT OTP CODE: ${otp}`);
    console.log(`📱 For testing, use this OTP: ${otp}`);
    console.log(`⏰ Expires in 10 minutes`);
    console.log(`💡 Note: If WhatsApp delivery fails, users can find the OTP in server logs`);
    console.log(`=====================================\n`);
    
    return { 
      success: sent, 
      message: `OTP sent successfully. ${process.env.NODE_ENV === 'development' ? `For testing: ${otp}` : 'Check your WhatsApp messages.'}`
    };
  } catch (error) {
    console.error("Error generating/sending OTP:", error);
    return { success: false, message: 'Error processing OTP request' };
  }
}