import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;

if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.log("SENDGRID_API_KEY not configured, email notifications will not work");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    console.log("\n=== EMAIL SERVICE NOT CONFIGURED ===");
    console.log("SENDGRID_API_KEY not found in environment variables");
    console.log("Would send email:", params.subject);
    console.log("To:", params.to);
    console.log("From:", params.from);
    console.log("===================================\n");
    return false;
  }

  try {
    console.log("\n=== SENDING EMAIL ===");
    console.log("To:", params.to);
    console.log("From:", params.from);
    console.log("Subject:", params.subject);
    console.log("Time:", new Date().toLocaleString());
    
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log("Email sent successfully!");
    console.log("====================\n");
    return true;
  } catch (error) {
    console.error('\n=== EMAIL ERROR ===');
    console.error('SendGrid email error:', error);
    console.error('===================\n');
    return false;
  }
}

export async function sendHealerBookingNotification(
  healerEmail: string,
  healerName: string,
  clientUsername: string,
  message?: string
): Promise<boolean> {
  const emailSubject = `New Session Booking Request - ${clientUsername}`;
  const emailText = `
Hello ${healerName},

You have received a new session booking request from ${clientUsername}.

${message ? `Message from client: ${message}` : 'No additional message provided.'}

Please respond to this request at your earliest convenience.

Best regards,
Spiritual Wellness Platform
  `;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">New Session Booking Request</h2>
      <p>Hello <strong>${healerName}</strong>,</p>
      <p>You have received a new session booking request from <strong>${clientUsername}</strong>.</p>
      ${message ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h4>Message from client:</h4>
        <p>${message}</p>
      </div>` : '<p>No additional message provided.</p>'}
      <p>Please respond to this request at your earliest convenience.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Spiritual Wellness Platform</p>
    </div>
  `;

  return await sendEmail({
    to: healerEmail,
    from: 'noreply@spiritualwellness.com', // You should use your verified sender email
    subject: emailSubject,
    text: emailText,
    html: emailHtml
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const subject = "Password Reset Request - Aurfy";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You have requested to reset your password for your Aurfy account.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Your Reset Code:</h3>
        <p style="font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 0; letter-spacing: 2px;">${resetToken}</p>
      </div>
      <p>This code will expire in 15 minutes. If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The Aurfy Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    from: "noreply@spiritualwellness.com",
    subject,
    html
  });
}