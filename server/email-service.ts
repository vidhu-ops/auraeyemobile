import sgMail, { type MailDataRequired, type AttachmentData } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@auraeye.com';

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: AttachmentData[];
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log("\n=== SENDING EMAIL ===");
    console.log("To:", params.to);
    console.log("From:", params.from || FROM_EMAIL);
    console.log("Subject:", params.subject);
    console.log("Time:", new Date().toLocaleString());
    
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || FROM_EMAIL,
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments
    };
    
    await sgMail.send(msg);
    
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
    subject,
    html
  });
}

// Helper function to strip data URL prefix
function stripDataUrlPrefix(dataUrl: string): string {
  const base64Index = dataUrl.indexOf(',');
  return base64Index > -1 ? dataUrl.substring(base64Index + 1) : dataUrl;
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

  // Prepare attachments
  const attachments: AttachmentData[] = [
    {
      content: stripDataUrlPrefix(pdfBase64),
      filename: fileName,
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ];

  // Add screenshots if provided
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