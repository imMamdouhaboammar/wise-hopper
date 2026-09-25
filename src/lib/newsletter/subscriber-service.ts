import crypto from 'crypto';
import type { MailerService } from './mailer';
import type { NewsletterSubscriber } from '../supabase/types';

export class NewsletterService {
  private mailer: MailerService;
  // Local store cache for fast lookups and unit test isolation
  private subscribers: Map<string, NewsletterSubscriber> = new Map();
  private tokenIndex: Map<string, string> = new Map(); // token -> email
  private siteUrl: string;

  constructor(mailer: MailerService, siteUrl?: string) {
    this.mailer = mailer;
    this.siteUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  async subscribe(email: string, topics: string[] = []): Promise<NewsletterSubscriber> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = this.subscribers.get(normalizedEmail);

    if (existing && existing.status === 'active') {
      // Already active, just update topics
      existing.topics = Array.from(new Set([...existing.topics, ...topics]));
      return existing;
    }

    const confirmationToken = crypto.randomBytes(24).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const record: NewsletterSubscriber = {
      id: existing?.id || crypto.randomUUID(),
      email: normalizedEmail,
      status: 'unconfirmed',
      confirmation_token: confirmationToken,
      token_expires_at: tokenExpiresAt,
      topics,
      created_at: existing?.created_at || new Date().toISOString(),
      confirmed_at: null,
    };

    this.subscribers.set(normalizedEmail, record);
    this.tokenIndex.set(confirmationToken, normalizedEmail);

    const confirmationUrl = `${this.siteUrl}/api/newsletter/confirm?token=${confirmationToken}`;
    await this.mailer.sendConfirmationEmail(normalizedEmail, confirmationUrl);

    return record;
  }

  async confirmSubscription(token: string): Promise<boolean> {
    const email = this.tokenIndex.get(token);
    if (!email) {
      return false;
    }

    const subscriber = this.subscribers.get(email);
    if (!subscriber || !subscriber.token_expires_at) {
      return false;
    }

    const expiresTime = new Date(subscriber.token_expires_at).getTime();
    if (Date.now() > expiresTime) {
      return false;
    }

    subscriber.status = 'active';
    subscriber.confirmation_token = null;
    subscriber.token_expires_at = null;
    subscriber.confirmed_at = new Date().toISOString();

    this.tokenIndex.delete(token);
    return true;
  }

  async unsubscribe(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const subscriber = this.subscribers.get(normalized);
    if (!subscriber) {
      return false;
    }

    subscriber.status = 'unsubscribed';
    return true;
  }

  async updateTopics(email: string, topics: string[]): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const subscriber = this.subscribers.get(normalized);
    if (!subscriber) {
      return false;
    }

    subscriber.topics = topics;
    return true;
  }

  async getSubscriber(email: string): Promise<NewsletterSubscriber | null> {
    const normalized = email.trim().toLowerCase();
    return this.subscribers.get(normalized) || null;
  }
}
