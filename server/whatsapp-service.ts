import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let whatsappClient: Client | null = null;
let isClientReady = false;

// Initialize WhatsApp client
export function initializeWhatsApp() {
  if (whatsappClient) {
    return whatsappClient;
  }

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('\n=== WHATSAPP QR CODE ===');
    console.log('Scan this QR code with WhatsApp to connect:');
    qrcode.generate(qr, { small: true });
    console.log('======================\n');
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isClientReady = true;
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp client authenticated');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    isClientReady = false;
  });

  whatsappClient.initialize();
  return whatsappClient;
}

// Send WhatsApp message (Development mode - logs to console)
export async function sendWhatsAppMessage(number: string, message: string): Promise<boolean> {
  try {
    // For development, log the message that would be sent
    console.log(`\n=== WHATSAPP MESSAGE (DEV MODE) ===`);
    console.log(`To: ${number}`);
    console.log(`Message: ${message}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log(`================================\n`);
    
    // In production, you would uncomment the WhatsApp client code
    // and ensure Chrome/Puppeteer dependencies are installed
    
    return true; // Return true for development
  } catch (error) {
    console.error('Error in WhatsApp service:', error);
    return false;
  }
}

// Send OTP via WhatsApp
export async function sendWhatsAppOTP(number: string, otp: string): Promise<boolean> {
  const message = `Your Aurfy verification code is: ${otp}. This code will expire in 10 minutes.`;
  return await sendWhatsAppMessage(number, message);
}

// Get client status
export function getWhatsAppStatus(): { ready: boolean, client: Client | null } {
  return {
    ready: isClientReady,
    client: whatsappClient
  };
}