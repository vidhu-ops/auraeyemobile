import { Resend } from 'resend';

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

async function getResendCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable not set');
  }
  
  console.log("Using Resend with API key from environment");
  return { apiKey, fromEmail };
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const { apiKey, fromEmail } = await getResendCredentials();
    const resend = new Resend(apiKey);
    
    console.log("\n=== SENDING EMAIL VIA RESEND ===");
    console.log("To:", params.to);
    console.log("From:", params.from || fromEmail);
    console.log("Subject:", params.subject);
    console.log("Time:", new Date().toLocaleString());
    
    const emailData: any = {
      from: params.from || fromEmail,
      to: params.to,
      subject: params.subject,
    };
    
    if (params.html) {
      emailData.html = params.html;
    }
    if (params.text) {
      emailData.text = params.text;
    }
    
    if (params.attachments && params.attachments.length > 0) {
      emailData.attachments = params.attachments.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64')
      }));
    }
    
    const result = await resend.emails.send(emailData);
    
    console.log("[DEBUG] Resend response:", JSON.stringify(result));
    
    if (result.error) {
      console.error("Resend error:", result.error);
      return false;
    }
    
    console.log("Email sent successfully! ID:", result.data?.id);
    console.log("================================\n");
    return true;
  } catch (error) {
    console.error('\n=== EMAIL ERROR ===');
    console.error('Resend email error:', error);
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
      <p>You have requested to reset your password for your AuraEye™ account.</p>
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

You have requested to reset your password for your AuraEye™ account.

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
  const subject = "Payment Confirmation - AuraEye™ Credits";
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

      <p>Your new credits are immediately available in your account. You can use them to access all premium services.</p>
      
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
  const subject = "Email Address Updated - AuraEye™";
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
  const subject = "Welcome to AuraEye™ - Your Account Details";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9333ea; margin: 0;">AuraEye</h1>
        <p style="color: #666; margin: 5px 0;">Your Wellness Platform</p>
      </div>

      <h2 style="color: #7c3aed;">Welcome to Your Journey! 🌟</h2>
      
      <p>Hello <strong>${username}</strong>,</p>
      
      <p>Thank you for signing up with AuraEye! We're thrilled to have you join our wellness community. Your account has been created successfully and you're ready to start exploring your inner light.</p>
      
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
Welcome to AuraEye™ - Your Account Details

Hello ${username},

Thank you for signing up with AuraEye! We're thrilled to have you join our wellness community.

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
        <h1 style="color: #9333ea; margin: 0;">AuraEye™</h1>
        <p style="color: #666; margin: 5px 0;">Your Wellness Platform</p>
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
      
      <p>This comprehensive report provides insights into your energy and can help guide your wellness journey.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        This email was sent because you downloaded a report from your AuraEye™ account.<br>
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
    
    This comprehensive report provides insights into your energy and can help guide your wellness journey.
    
    Thank you for using AuraEye - Your Wellness Platform.
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
