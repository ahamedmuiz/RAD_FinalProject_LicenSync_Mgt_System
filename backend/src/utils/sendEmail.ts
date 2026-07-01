import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    // 1. Check if Environment Variables actually exist on Render
    if (!process.env.EMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("Missing EMAIL_USER or GMAIL_APP_PASSWORD in Render environment variables.");
    }

    // 2. Cloud-Optimized SMTP Settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"LicenSync Admin" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.email}. Message ID: ${info.messageId}`);
    
  } catch (error: any) {
    console.error('CRITICAL ERROR: Failed to send email:', error);
    // 3. Throw the ACTUAL error message to the frontend so we can debug it easily!
    throw new Error(`Email System Error: ${error.message}`);
  }
};