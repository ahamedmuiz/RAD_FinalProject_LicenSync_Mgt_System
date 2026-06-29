import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async (options: EmailOptions) => {

    const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'ahamedmuiz119@gmail.com',
     
      pass: process.env.GMAIL_APP_PASSWORD, 
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

  await transporter.sendMail(mailOptions);
};