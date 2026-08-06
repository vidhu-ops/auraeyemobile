import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

function getResendFromAddress(): string {
  const email = (process.env.RESEND_FROM_EMAIL || 'teamauraeye@gmail.com').trim();
  const name = (process.env.RESEND_FROM_NAME || 'AuraEye').trim();
  if (email.includes('<') && email.includes('>')) {
    return email;
  }
  return `${name} <${email}>`;
}

export function getEmailProviderStatus(): {
  resend: boolean;
  sendgrid: boolean;
  gmail: boolean;
  resendFrom: string;
} {
  return {
    resend: !!getResendApiKey(),
    sendgrid: !!process.env.SENDGRID_API_KEY,
    gmail: !!process.env.GMAIL_APP_PASSWORD,
    resendFrom: getResendFromAddress(),
  };
}

export function logEmailProviderStatus(): void {
  const status = getEmailProviderStatus();
  console.log('📧 Email providers:', {
    gmail: status.gmail ? 'configured' : 'not set (add GMAIL_APP_PASSWORD for reliable delivery)',
    sendgrid: status.sendgrid ? 'configured' : 'not set',
    resend: status.resend ? 'configured' : 'missing RESEND_API_KEY',
    resendFrom: status.resendFrom,
  });

  if (!status.resend && !status.sendgrid && !status.gmail) {
    console.warn(
      '⚠️  No email provider configured. Add GMAIL_APP_PASSWORD, RESEND_API_KEY, or SENDGRID_API_KEY to Replit Deployment Secrets.'
    );
  }
}

async function sendViaResend(params: EmailParams): Promise<boolean> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.error('Resend skipped: RESEND_API_KEY is not set');
    return false;
  }

  const resend = new Resend(apiKey);
  const configuredFrom = (process.env.RESEND_FROM_EMAIL || 'teamauraeye@gmail.com').trim();
  const fromCandidates = [
    params.from || getResendFromAddress(),
    configuredFrom,
    `AuraEye <${configuredFrom}>`,
    'AuraEye <contact@auraeye.in>',
    'contact@auraeye.in',
    'onboarding@resend.dev',
  ].filter((value, index, array) => array.indexOf(value) === index);

  for (const fromEmail of fromCandidates) {
    console.log("\n=== SENDING EMAIL VIA RESEND ===");
    console.log("To:", params.to);
    console.log("From:", fromEmail);
    console.log("Subject:", params.subject);

    const emailData: {
      from: string;
      to: string[];
      subject: string;
      html?: string;
      text?: string;
      reply_to?: string;
      attachments?: Array<{ filename: string; content: Buffer }>;
    } = {
      from: fromEmail,
      to: [params.to],
      subject: params.subject,
      reply_to: process.env.RESEND_REPLY_TO || configuredFrom,
    };

    if (params.html) emailData.html = params.html;
    if (params.text) emailData.text = params.text;

    if (params.attachments && params.attachments.length > 0) {
      emailData.attachments = params.attachments.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
      }));
    }

    const result = await resend.emails.send(emailData as Parameters<typeof resend.emails.send>[0]);
    console.log("[DEBUG] Resend response:", JSON.stringify(result));

    if (result.error) {
      console.error(`Resend error (from ${fromEmail}):`, JSON.stringify(result.error, null, 2));
      continue;
    }

    if (!result.data?.id) {
      console.error("Resend returned no message id:", JSON.stringify(result));
      continue;
    }

    console.log("Email sent successfully via Resend! ID:", result.data.id);
    return true;
  }

  return false;
}

async function sendViaGmail(params: EmailParams): Promise<boolean> {
  const user = (process.env.GMAIL_USER || process.env.RESEND_FROM_EMAIL || 'teamauraeye@gmail.com').trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!pass) {
    return false;
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  console.log("\n=== SENDING EMAIL VIA GMAIL SMTP ===");
  console.log("To:", params.to);
  console.log("From:", user);
  console.log("Subject:", params.subject);

  try {
    await transporter.sendMail({
      from: `AuraEye <${user}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    console.log("Email sent successfully via Gmail SMTP");
    return true;
  } catch (error: any) {
    console.error("Gmail SMTP error:", error?.message || error);
    return false;
  }
}

async function sendViaSendGrid(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return false;
  }

  const fromEmail = params.from || process.env.SENDGRID_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'teamauraeye@gmail.com';
  sgMail.setApiKey(apiKey);

  console.log("\n=== SENDING EMAIL VIA SENDGRID ===");
  console.log("To:", params.to);
  console.log("From:", fromEmail);
  console.log("Subject:", params.subject);

  const message = {
    to: params.to,
    from: fromEmail,
    subject: params.subject,
    html: params.html || params.text || '<p></p>',
    ...(params.text ? { text: params.text } : {}),
  } as sgMail.MailDataRequired;

  if (params.attachments && params.attachments.length > 0) {
    message.attachments = params.attachments.map((att) => ({
      content: att.content,
      filename: att.filename,
      type: att.type || 'application/octet-stream',
      disposition: att.disposition || 'attachment',
    }));
  }

  try {
    await sgMail.send(message);
    console.log("Email sent successfully via SendGrid");
    return true;
  } catch (error: any) {
    console.error("SendGrid error:", error?.response?.body || error?.message || error);
    return false;
  }
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const providers: Array<{ name: string; send: (params: EmailParams) => Promise<boolean> }> = [];

  // Gmail SMTP is most reliable for teamauraeye@gmail.com when app password is set
  if (process.env.GMAIL_APP_PASSWORD) {
    providers.push({ name: 'Gmail', send: sendViaGmail });
  }
  if (process.env.SENDGRID_API_KEY) {
    providers.push({ name: 'SendGrid', send: sendViaSendGrid });
  }
  if (getResendApiKey()) {
    providers.push({ name: 'Resend', send: sendViaResend });
  }

  if (providers.length === 0) {
    console.error('No email provider configured. Set GMAIL_APP_PASSWORD, RESEND_API_KEY, or SENDGRID_API_KEY.');
    return false;
  }

  for (const provider of providers) {
    try {
      const sent = await provider.send(params);
      if (sent) {
        return true;
      }
      console.warn(`${provider.name} failed, trying next provider if available...`);
    } catch (error) {
      console.error(`${provider.name} email error:`, error);
    }
  }

  console.error('All configured email providers failed.');
  return false;
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
    subject: emailSubject,
    text: emailText,
    html: emailHtml
  });
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  const subject = "Password Reset Request - AuraEye";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You have requested to reset your password for your AuraEye account.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Account Information:</h3>
        <p style="margin: 8px 0; color: #6b7280;"><strong>Username:</strong> ${username}</p>
        <p style="margin: 8px 0; color: #6b7280;"><strong>Email Address:</strong> ${email}</p>
        <h3 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">Your Reset Code:</h3>
        <p style="font-size: 32px; font-weight: bold; color: #6366f1; margin-bottom: 0; letter-spacing: 4px; text-align: center;">${resetToken}</p>
      </div>
      <p>This code will expire in 15 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      <p>Best regards,<br>The AuraEye Team</p>
    </div>
  `;

  const text = `
Password Reset Request - AuraEye

Hello,

You have requested to reset your password for your AuraEye account.

Account Information:
Username: ${username}
Email Address: ${email}

Your Reset Code: ${resetToken}

This code will expire in 15 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The AuraEye Team
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
}

export async function sendPasswordResetConfirmationEmail(
  email: string,
  username: string
): Promise<boolean> {
  const subject = "Password Reset Successful - AuraEye";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">✅ Password Reset Successful</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Your password has been successfully reset for your AuraEye account.</p>
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #047857;"><strong>Account Details:</strong></p>
        <p style="margin: 8px 0 0 0; color: #6b7280;">Email: ${email}</p>
        <p style="margin: 8px 0 0 0; color: #6b7280;">Username: ${username}</p>
      </div>
      <p>You can now log in to your account with your new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://auraeye.com/login" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Login</a>
      </div>
      <p style="color: #666; font-size: 13px; background: #fff3cd; padding: 12px; border-radius: 6px;">
        <strong>Security Tip:</strong> If you didn't request this password reset, your account may have been compromised. Please contact our support team immediately.
      </p>
      <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The AuraEye Team</p>
    </div>
  `;

  const text = `
✅ Password Reset Successful - AuraEye

Hello ${username},

Your password has been successfully reset for your AuraEye account.

Account Details:
- Email: ${email}
- Username: ${username}

You can now log in to your account with your new password.

Security Tip: If you didn't request this password reset, your account may have been compromised. Please contact our support team immediately.

Best regards,
The AuraEye Team
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  });
}

export async function sendPaymentConfirmationEmail(
  email: string,
  username: string,
  planName: string,
  credits: number,
  price: number
): Promise<boolean> {
  const subject = "Payment Confirmation - AuraEye Credits";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Payment Confirmed ✨</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Thank you for your purchase! Your payment has been successfully processed.</p>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h3 style="color: #047857; margin-top: 0;">Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Plan:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Credits Received:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">+${credits} credits</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">$${(price / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Date:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <p>Your new credits are immediately available in your account. You can use them to access all premium spiritual services.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://auraeye.com/dashboard" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">If you have any questions about your purchase, please contact our support team.</p>
      <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The AuraEye Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html
  });
}

export async function sendEmailConfirmationEmail(
  email: string,
  username: string
): Promise<boolean> {
  const subject = "Email Address Updated - AuraEye";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Email Address Updated ✨</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>This email confirms that your account email address has been successfully updated.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #6b7280;">New Email Address:</p>
        <p style="font-size: 16px; font-weight: bold; color: #111827;">${email}</p>
      </div>

      <p>This address will be used for all future communications, payment confirmations, and account notifications.</p>
      
      <p style="color: #6b7280; font-size: 14px;">If you did not make this change or believe your account has been compromised, please contact our support team immediately.</p>
      <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The AuraEye Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html
  });
}

function stripDataUrlPrefix(dataUrl: string): string {
  const base64Index = dataUrl.indexOf(',');
  return base64Index > -1 ? dataUrl.substring(base64Index + 1) : dataUrl;
}

export async function sendWelcomeEmail(
  email: string,
  username: string,
  password: string
): Promise<boolean> {
  const subject = "Welcome to AuraEye - Your Account Details";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9333ea; margin: 0;">AuraEye</h1>
        <p style="color: #666; margin: 5px 0;">Your Spiritual Wellness Platform</p>
      </div>

      <h2 style="color: #7c3aed;">Welcome to Your Spiritual Journey! 🌟</h2>
      
      <p>Hello <strong>${username}</strong>,</p>
      
      <p>Thank you for signing up with AuraEye! We're thrilled to have you join our spiritual wellness community. Your account has been created successfully and you're ready to start exploring your inner light.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
        <h3 style="color: #7c3aed; margin-top: 0;">Your Account Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Username:</td>
            <td style="padding: 10px 0; color: #111827; font-family: monospace; text-align: right;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Password:</td>
            <td style="padding: 10px 0; color: #111827; font-family: monospace; text-align: right;">${password}</td>
          </tr>
        </table>
      </div>

      <p style="color: #666; font-size: 13px; background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107;">
        <strong>⚠️ Important:</strong> Keep your password safe and never share it with anyone. We recommend changing your password after your first login.
      </p>

      <div style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0; color: white;">Get Started Today</h3>
        <p>Start your journey with our spiritual tools:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>✨ Aura Scanning for personalized energy insights</li>
          <li>🔮 Numerology readings to understand your destiny</li>
          <li>📖 Spiritual journaling for self-reflection</li>
          <li>🧘 Meditation sessions for inner peace</li>
          <li>👨‍⚕️ Connect with professional healers</li>
        </ul>
      </div>

      <p><strong>You start with 5 welcome credits!</strong> Use them to explore our premium services and discover your spiritual path.</p>

      <div style="text-align: center; margin: 25px 0;">
        <a href="https://auraeye.com/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      </div>

      <p>If you have any questions or need support, our team is here to help. Contact us through your dashboard or visit our help section.</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      
      <p style="color: #6b7280; font-size: 13px;">Best regards,<br><strong>The AuraEye Team</strong><br>Illuminating Your Spiritual Path ✨</p>
    </div>
  `;

  const text = `
Welcome to AuraEye - Your Account Details

Hello ${username},

Thank you for signing up with AuraEye! We're thrilled to have you join our spiritual wellness community.

Your Account Details:
- Username: ${username}
- Password: ${password}

Important: Keep your password safe and never share it. We recommend changing it after your first login.

Get Started Today:
You start with 5 welcome credits! Use them to explore:
- Aura Scanning
- Numerology readings
- Spiritual journaling
- Meditation sessions
- Connect with professional healers

If you have any questions, our team is here to help.

Best regards,
The AuraEye Team
Illuminating Your Spiritual Path ✨
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  });
}

export async function sendPDFReport(
  userEmail: string, 
  userName: string, 
  pdfBase64: string, 
  fileName: string,
  screenshots?: Array<{ filename: string; dataUrl: string }>
): Promise<boolean> {
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9333ea; margin: 0;">AuraEye</h1>
        <p style="color: #666; margin: 5px 0;">Your Spiritual Wellness Platform</p>
      </div>
      
      <h2 style="color: #333;">Your Aura Analysis Report</h2>
      
      <p>Dear ${userName},</p>
      
      <p>Your personalized aura analysis report has been generated and is attached to this email.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #9333ea; margin-top: 0;">What's Included:</h3>
        <ul style="color: #555;">
          <li>Detailed aura color analysis</li>
          <li>Chakra activity assessment</li>
          <li>Spiritual guidance and insights</li>
          <li>Energy level evaluation</li>
          <li>Personalized recommendations</li>
        </ul>
      </div>
      
      <p>This comprehensive report provides insights into your spiritual energy and can help guide your wellness journey.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        This email was sent because you downloaded a report from your AuraEye account.<br>
        For support, please contact us through your dashboard.
      </p>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #9333ea; font-weight: bold;">AuraEye - Illuminating Your Spiritual Path</p>
      </div>
    </div>
  `;

  const text = `
    AuraEye - Your Aura Analysis Report
    
    Dear ${userName},
    
    Your personalized aura analysis report has been generated and is attached to this email.
    
    What's Included:
    - Detailed aura color analysis
    - Chakra activity assessment  
    - Spiritual guidance and insights
    - Energy level evaluation
    - Personalized recommendations
    
    This comprehensive report provides insights into your spiritual energy and can help guide your wellness journey.
    
    Thank you for using AuraEye - Your Spiritual Wellness Platform.
  `;

  const attachments: Array<{ content: string; filename: string; type?: string; disposition?: string }> = [
    {
      content: stripDataUrlPrefix(pdfBase64),
      filename: fileName,
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ];

  if (screenshots && screenshots.length > 0) {
    for (const screenshot of screenshots) {
      attachments.push({
        content: stripDataUrlPrefix(screenshot.dataUrl),
        filename: screenshot.filename,
        type: 'image/png',
        disposition: 'attachment'
      });
    }
  }

  return await sendEmail({
    to: userEmail,
    subject: `Your AuraEye Aura Analysis Report - ${fileName}`,
    text,
    html,
    attachments
  });
}
