"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
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
exports.sendEmail = sendEmail;
