import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("Missing EMAIL_USER or GMAIL_APP_PASSWORD in environment variables.");
    }

    // Explicitly cast this configuration as SMTPTransport.Options
    const smtpOptions: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 587,             
      secure: false,         
      requireTLS: true,      
      family: 4,             // Forces IPv4
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    };

    const transporter = nodemailer.createTransport(smtpOptions);

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
    throw new Error(`Email System Error: ${error.message}`);
  }
};