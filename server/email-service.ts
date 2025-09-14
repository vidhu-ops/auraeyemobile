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
  
  try {
    // Upload files to cloud storage instead of email attachments
    const { ObjectStorageService } = await import('./objectStorage');
    const objectStorage = new ObjectStorageService();
    
    // Upload PDF to cloud storage
    const pdfBuffer = Buffer.from(stripDataUrlPrefix(pdfBase64), 'base64');
    const pdfUrl = await objectStorage.uploadFile(fileName, pdfBuffer, 'application/pdf');
    console.log(`📁 PDF uploaded to cloud storage: ${pdfUrl}`);
    
    // Upload screenshots to cloud storage
    const screenshotUrls: Array<{ filename: string; url: string }> = [];
    if (screenshots && screenshots.length > 0) {
      for (const screenshot of screenshots) {
        const screenshotBuffer = Buffer.from(stripDataUrlPrefix(screenshot.dataUrl), 'base64');
        const screenshotUrl = await objectStorage.uploadFile(screenshot.filename, screenshotBuffer, 'image/png');
        screenshotUrls.push({ filename: screenshot.filename, url: screenshotUrl });
        console.log(`📸 Screenshot uploaded to cloud storage: ${screenshotUrl}`);
      }
    }

    // Generate email with download links instead of attachments
    const downloadLinks = `
      <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea;">
        <h3 style="color: #9333ea; margin-top: 0;">📥 Download Your Files</h3>
        <div style="margin: 15px 0;">
          <p style="margin: 10px 0;"><strong>PDF Report:</strong></p>
          <a href="${pdfUrl}" 
             style="display: inline-block; background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;"
             download="${fileName}">
            📄 Download PDF Report
          </a>
        </div>
        ${screenshotUrls.length > 0 ? `
        <div style="margin: 15px 0;">
          <p style="margin: 10px 0;"><strong>Analysis Screenshots:</strong></p>
          ${screenshotUrls.map(screenshot => `
            <div style="margin: 5px 0;">
              <a href="${screenshot.url}" 
                 style="display: inline-block; background-color: #4f46e5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 2px;"
                 download="${screenshot.filename}">
                📸 ${screenshot.filename}
              </a>
            </div>
          `).join('')}
        </div>` : ''}
        <p style="color: #666; font-size: 12px; margin-top: 15px;">
          💡 Files are stored securely in the cloud and will be available for download for 30 days.
        </p>
      </div>
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9333ea; margin: 0;">AuraEye</h1>
          <p style="color: #666; margin: 5px 0;">Your Spiritual Wellness Platform</p>
        </div>
        
        <h2 style="color: #333;">Your Aura Analysis Report is Ready!</h2>
        
        <p>Dear ${userName},</p>
        
        <p>Your personalized aura analysis report has been generated and is ready for download.</p>
        
        ${downloadLinks}
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #9333ea; margin-top: 0;">What's Included:</h3>
          <ul style="color: #555;">
            <li>Detailed aura color analysis</li>
            <li>Chakra activity assessment</li>
            <li>Spiritual guidance and insights</li>
            <li>Energy level evaluation</li>
            <li>Personalized recommendations</li>
            ${screenshotUrls.length > 0 ? '<li>High-quality analysis screenshots</li>' : ''}
          </ul>
        </div>
        
        <p>This comprehensive report provides insights into your spiritual energy and can help guide your wellness journey.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          This email was sent from your AuraEye account analysis.<br>
          Files are hosted securely and will remain available for 30 days.<br>
          For support, please contact us through your dashboard.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #9333ea; font-weight: bold;">AuraEye - Illuminating Your Spiritual Path</p>
        </div>
      </div>
    `;

    const plainTextLinks = screenshotUrls.length > 0 
      ? `\n\nDownload Links:\nPDF Report: ${pdfUrl}\n\nScreenshots:\n${screenshotUrls.map(s => `${s.filename}: ${s.url}`).join('\n')}`
      : `\n\nDownload Link:\nPDF Report: ${pdfUrl}`;

    const text = `
      AuraEye - Your Aura Analysis Report is Ready!
      
      Dear ${userName},
      
      Your personalized aura analysis report has been generated and is ready for download.
      ${plainTextLinks}
      
      What's Included:
      - Detailed aura color analysis
      - Chakra activity assessment  
      - Spiritual guidance and insights
      - Energy level evaluation
      - Personalized recommendations
      ${screenshotUrls.length > 0 ? '- High-quality analysis screenshots' : ''}
      
      This comprehensive report provides insights into your spiritual energy and can help guide your wellness journey.
      
      Files are hosted securely and will remain available for 30 days.
      
      AuraEye - Illuminating Your Spiritual Path
    `;

    // Send email with download links (no attachments)
    return await sendEmail({
      to: userEmail,
      from: 'sheeyameela@gmail.com', // Specified sender email
      subject: `Your AuraEye Aura Analysis Report - ${fileName}`,
      text,
      html
    });

  } catch (error) {
    console.error('Error in cloud storage email service:', error);
    return false;
  }
}