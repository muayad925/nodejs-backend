import nodemailer from "nodemailer";

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    const info = await this.transporter.sendMail({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: `Welcome, ${name}!`,
      html: `<h2>Welcome to our platform, ${name} 🎉</h2><p>We’re excited to have you here.</p>`,
    });

    console.log(
      `[EmailService] Sent welcome email to ${email} - ${info.messageId}`
    );
  }
}
