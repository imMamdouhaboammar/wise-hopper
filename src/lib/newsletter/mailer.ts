import { Resend } from 'resend';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
}

export interface MailerConfig {
  mode?: 'sandbox' | 'live';
  apiKey?: string;
  fromEmail?: string;
}

export class MailerService {
  private mode: 'sandbox' | 'live';
  private fromEmail: string;
  private resendClient: Resend | null = null;
  private sentMessages: EmailMessage[] = [];

  constructor(config?: MailerConfig) {
    const key = config?.apiKey || process.env.RESEND_API_KEY;
    this.mode = config?.mode || (key ? 'live' : 'sandbox');
    this.fromEmail = config?.fromEmail || process.env.RESEND_FROM_EMAIL || 'newsletter@wisehopper.dev';

    if (this.mode === 'live' && key) {
      this.resendClient = new Resend(key);
    }
  }

  async sendConfirmationEmail(to: string, confirmationUrl: string): Promise<boolean> {
    const subject = 'تأكيد اشتراكك في النشرة البريدية | وايز هوبر';
    const html = `
      <div dir="rtl" style="font-family: 'IBM Plex Sans Arabic', sans-serif, system-ui; color: #242035; line-height: 1.8; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7054D4; margin-bottom: 16px;">مرحباً بك في مجتمع القراء الهادئ</h2>
        <p>شكراً لاهتمامك بالانضمام إلى النشرة البريدية. يرجى تأكيد رغبتك بالضغط على الزر أدناه لتفعيل اشتراكك:</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${confirmationUrl}" style="background-color: #7054D4; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            تأكيد الاشتراك
          </a>
        </div>
        <p style="color: #706B80; font-size: 14px;">إذا لم تطلب هذا الاشتراك، يمكنك تجاهل هذه الرسالة بأمان.</p>
        <p style="color: #706B80; font-size: 12px; border-top: 1px solid #E8E3F5; padding-top: 16px;">
          هذا الرابط صالح لمدة 24 ساعة فقط.
        </p>
      </div>
    `;

    const text = `مرحباً بك في مجتمع القراء الهادئ\n\nيرجى تأكيد اشتراكك عبر الرابط التالي:\n${confirmationUrl}\n\nصالح لمدة 24 ساعة.`;

    return this.send({ to, subject, html, text });
  }

  async send(msg: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
    const record: EmailMessage = {
      ...msg,
      sentAt: new Date().toISOString(),
    };

    if (this.mode === 'sandbox' || !this.resendClient) {
      this.sentMessages.push(record);
      return true;
    }

    try {
      const response = await this.resendClient.emails.send({
        from: this.fromEmail,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });

      return Boolean(response.data?.id);
    } catch {
      return false;
    }
  }

  getSentMessages(): EmailMessage[] {
    return [...this.sentMessages];
  }

  clearSentMessages(): void {
    this.sentMessages = [];
  }
}
