import React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { ConfirmationEmail } from '@/emails/confirmation-email';
import { WelcomeEmail } from '@/emails/welcome-email';
import { CampaignEmail } from '@/emails/campaign-email';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
  headers?: Record<string, string>;
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

  isLive(): boolean {
    return this.mode === 'live' && Boolean(this.resendClient);
  }

  getFromEmail(): string {
    return this.fromEmail;
  }

  /**
   * Sends the double opt-in confirmation email.
   */
  async sendConfirmationEmail(to: string, confirmationUrl: string): Promise<boolean> {
    const subject = 'تأكيد اشتراكك في النشرة البريدية | وايز هوبر';

    let html: string;
    let text: string;

    try {
      const element = React.createElement(ConfirmationEmail, { confirmationUrl });
      html = await render(element);
      text = await render(element, { plainText: true });
    } catch {
      // Robust fallback if template rendering ever fails
      html = `
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
      text = `مرحباً بك في مجتمع القراء الهادئ\n\nيرجى تأكيد اشتراكك عبر الرابط التالي:\n${confirmationUrl}\n\nصالح لمدة 24 ساعة.`;
    }

    return this.send({ to, subject, html, text });
  }

  /**
   * Sends the welcome email after the subscriber confirms their subscription.
   */
  async sendWelcomeEmail(
    to: string,
    manageUrl: string,
    unsubscribeUrl: string,
    topics: string[] = []
  ): Promise<boolean> {
    const subject = 'أهلاً بك في حلقة التفكير الهادئ | وايز هوبر';

    let html: string;
    let text: string;

    try {
      const element = React.createElement(WelcomeEmail, { manageUrl, unsubscribeUrl, topics });
      html = await render(element);
      text = await render(element, { plainText: true });
    } catch {
      html = `
        <div dir="rtl" style="font-family: 'IBM Plex Sans Arabic', sans-serif, system-ui; color: #242035; line-height: 1.8; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7054D4; margin-bottom: 16px;">تم تفعيل اشتراكك بنجاح ✨</h2>
          <p>أهلاً بك معنا في حلقة التفكير الهادئ. ستصلك أعدادنا البريدية المتخصصة دورياً.</p>
          <p><a href="${manageUrl}" style="color: #7054D4;">إدارة التفضيلات</a> | <a href="${unsubscribeUrl}" style="color: #706B80;">إلغاء الاشتراك</a></p>
        </div>
      `;
      text = `تم تفعيل اشتراكك بنجاح ✨\n\nأهلاً بك في حلقة التفكير الهادئ.\n\nإدارة التفضيلات: ${manageUrl}\nإلغاء الاشتراك: ${unsubscribeUrl}`;
    }

    return this.send({
      to,
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  }

  /**
   * Sends a newsletter campaign edition to a recipient with RFC 8058 headers.
   */
  async sendCampaignEmail(
    to: string,
    subject: string,
    body: string,
    unsubscribeUrl: string
  ): Promise<boolean> {
    let html: string;
    let text: string;

    try {
      const element = React.createElement(CampaignEmail, { subject, body, unsubscribeUrl });
      html = await render(element);
      text = await render(element, { plainText: true });
    } catch {
      html = `
        <div dir="rtl" style="font-family: 'IBM Plex Sans Arabic', sans-serif, system-ui; color: #242035; line-height: 1.8; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #7054D4; font-size: 24px; margin-bottom: 20px;">${subject}</h1>
          <div style="font-size: 16px; margin-bottom: 32px; white-space: pre-wrap;">${body}</div>
          <hr style="border: none; border-top: 1px solid #E8E3F5; margin: 32px 0;" />
          <p style="font-size: 12px; color: #706B80;">
            تصلك هذه الرسالة لأنك مشترك في نشرة وايز هوبر البريدية.
            <br />
            <a href="${unsubscribeUrl}" style="color: #7054D4; text-decoration: underline;">إلغاء الاشتراك من هنا</a>
          </p>
        </div>
      `;
      text = `${subject}\n\n${body}\n\n---\nلإلغاء الاشتراك: ${unsubscribeUrl}`;
    }

    return this.send({
      to,
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  }

  /**
   * Syncs contact status with Resend Audience/Contacts.
   */
  async syncContact(email: string, options: { unsubscribed: boolean; topics?: string[] }): Promise<boolean> {
    if (this.mode === 'sandbox' || !this.resendClient) {
      return true;
    }

    try {
      const { error } = await this.resendClient.contacts.create({
        email,
        unsubscribed: options.unsubscribed,
      });

      if (error) {
        // If contact already exists, perform update
        const updateRes = await this.resendClient.contacts.update({
          email,
          unsubscribed: options.unsubscribed,
        });
        if (updateRes.error) {
          console.warn('[Resend Contacts Sync]', updateRes.error.message);
        }
      }

      return true;
    } catch (err) {
      console.warn('[Resend Contacts Exception]', err);
      return false;
    }
  }

  /**
   * Dispatches the email via Resend API or logs it to memory in sandbox mode.
   */
  async send(msg: {
    to: string;
    subject: string;
    html: string;
    text: string;
    headers?: Record<string, string>;
  }): Promise<boolean> {
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
        headers: msg.headers,
      });

      if (response.error) {
        console.error('[Resend Send Error]', response.error.name, response.error.message);
        return false;
      }

      return Boolean(response.data?.id);
    } catch (err) {
      console.error('[Resend Send Exception]', err);
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
