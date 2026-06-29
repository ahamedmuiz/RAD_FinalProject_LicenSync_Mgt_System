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
    // Explicit SMTP settings to prevent Render timeouts
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: 'ahamedmuiz119@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Pulled securely from Render Environment Variables
      },
    });

    const mailOptions = {
      from: 'LicenSync Admin <ahamedmuiz119@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.email}. Message ID: ${info.messageId}`);
    
  } catch (error) {
    console.error('CRITICAL ERROR: Failed to send email:', error);
    throw new Error('Email could not be sent. Please try again later.');
  }
};