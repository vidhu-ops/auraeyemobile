import twilio from 'twilio';

interface SMSNotificationOptions {
  to: string;
  message: string;
}

class SMSService {
  private client: any;
  private isConfigured: boolean = false;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.isConfigured = true;
    } else {
      console.warn('Twilio not configured. SMS notifications will be disabled.');
    }
  }

  async sendSMS({ to, message }: SMSNotificationOptions): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`SMS would be sent to ${to}: ${message}`);
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendSoulEnergyUpdate(phoneNumber: string, username: string, soulEnergy: number) {
    const message = `✨ Hi ${username}! Your soul energy has reached ${soulEnergy}! Keep shining bright! 🌟`;
    return this.sendSMS({ to: phoneNumber, message });
  }

  async sendAuraAnalysisComplete(phoneNumber: string, username: string, dominantColor: string) {
    const message = `🌈 Hi ${username}! Your aura analysis is complete! Your dominant color is ${dominantColor}. Check it out in the app! ✨`;
    return this.sendSMS({ to: phoneNumber, message });
  }

  async sendLowCreditsWarning(phoneNumber: string, username: string, credits: number) {
    const message = `💫 Hi ${username}! You have ${credits} credits remaining. Top up to continue your spiritual journey! 🌟`;
    return this.sendSMS({ to: phoneNumber, message });
  }

  async sendBookingConfirmation(phoneNumber: string, username: string, healerName: string) {
    const message = `✨ Hi ${username}! Your session with ${healerName} has been confirmed. Prepare for your spiritual journey! 🙏`;
    return this.sendSMS({ to: phoneNumber, message });
  }
}

export const smsService = new SMSService();
