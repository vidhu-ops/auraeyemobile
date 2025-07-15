import twilio from 'twilio';

// Twilio configuration with your credentials
const accountSid = 'AC62f3864c3aa6fbaf8b051095fc873fa8';
const authToken = '706772393421c4cab860d12c61912a33';
const twilioClient = twilio(accountSid, authToken);

// WhatsApp phone number (Twilio sandbox number)
const twilioWhatsAppNumber = 'whatsapp:+14155238886';

// Initialize WhatsApp (now using Twilio)
export function initializeWhatsApp() {
  console.log('WhatsApp service initialized with Twilio');
}

// Send WhatsApp message using Twilio
export async function sendWhatsAppMessage(number: string, message: string): Promise<boolean> {
  try {
    // Format the number for WhatsApp
    const formattedNumber = number.startsWith('+') ? `whatsapp:${number}` : `whatsapp:+${number}`;
    
    console.log(`\n=== SENDING WHATSAPP MESSAGE (TWILIO) ===`);
    console.log(`To: ${formattedNumber}`);
    console.log(`From: ${twilioWhatsAppNumber}`);
    console.log(`Message: ${message}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: twilioWhatsAppNumber,
      to: formattedNumber
    });
    
    console.log(`WhatsApp message sent successfully! SID: ${twilioMessage.sid}`);
    console.log(`Status: ${twilioMessage.status}`);
    console.log(`=========================================\n`);
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Send OTP via WhatsApp
export async function sendWhatsAppOTP(number: string, otp: string): Promise<boolean> {
  const message = `Your Aurfy verification code is: ${otp}. This code will expire in 10 minutes.`;
  
  console.log(`\n=== WHATSAPP OTP SENDING ===`);
  console.log(`WhatsApp Number: ${number}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  
  const success = await sendWhatsAppMessage(number, message);
  
  if (success) {
    console.log('WhatsApp OTP sent successfully!');
    console.log('=============================\n');
  } else {
    console.error('Failed to send WhatsApp OTP');
    console.log('=============================\n');
  }
  
  return success;
}

// Get client status
export function getWhatsAppStatus(): { ready: boolean, client: any } {
  return {
    ready: true, // Twilio is always ready
    client: twilioClient
  };
}