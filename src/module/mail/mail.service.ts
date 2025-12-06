import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';
    this.from = process.env.SMTP_FROM || 'no-reply@example.com';

    if (!host || !user || !pass) {
      throw new Error(
        'SMTP configuration is missing (SMTP_HOST / SMTP_USER / SMTP_PASS). Emails will not be sent.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendEventReminderEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
      });
      this.logger.log(`Sent email to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${subject} - ${(error as Error).message}`,
      );
    }
  }
}
