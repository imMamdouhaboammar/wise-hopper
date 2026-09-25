import crypto from 'crypto';
import type { MailerService } from './mailer';
import type { NewsletterSubscriber } from '../supabase/types';
import { createServerSupabaseClient } from '../supabase/server';

export class NewsletterService {
  private mailer: MailerService;
  // Local store cache for fast lookups and unit test isolation
  private subscribers: Map<string, NewsletterSubscriber> = new Map();
  private tokenIndex: Map<string, string> = new Map(); // confirmation_token -> email
  private unsubTokenIndex: Map<string, string> = new Map(); // unsubscribe_token -> email
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
      await this.persistSubscriber(existing);
      return existing;
    }

    const confirmationToken = crypto.randomBytes(24).toString('hex');
    const unsubscribeToken = existing?.unsubscribe_token || crypto.randomBytes(24).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const record: NewsletterSubscriber = {
      id: existing?.id || crypto.randomUUID(),
      email: normalizedEmail,
      status: 'unconfirmed',
      confirmation_token: confirmationToken,
      unsubscribe_token: unsubscribeToken,
      token_expires_at: tokenExpiresAt,
      topics,
      created_at: existing?.created_at || new Date().toISOString(),
      confirmed_at: null,
    };

    this.subscribers.set(normalizedEmail, record);
    this.tokenIndex.set(confirmationToken, normalizedEmail);
    this.unsubTokenIndex.set(unsubscribeToken, normalizedEmail);

    // Persist to database outside process memory
    await this.persistSubscriber(record);

    const confirmationUrl = `${this.siteUrl}/api/newsletter/confirm?token=${confirmationToken}`;
    await this.mailer.sendConfirmationEmail(normalizedEmail, confirmationUrl);

    return record;
  }

  async confirmSubscription(token: string): Promise<boolean> {
    let email = this.tokenIndex.get(token);
    let subscriber: NewsletterSubscriber | null | undefined = email ? this.subscribers.get(email) : undefined;

    // If not found in process memory (e.g. after restart or multi-instance), query database
    if (!subscriber) {
      subscriber = await this.querySubscriberByConfirmationToken(token);
      if (subscriber) {
        email = subscriber.email;
        this.subscribers.set(email, subscriber);
      }
    }

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
    await this.persistSubscriber(subscriber);

    return true;
  }

  /**
   * Unsubscribe using a secret, opaque subscriber-specific token.
   * Protects against unauthenticated URL guessing and link prefetchers.
   */
  async unsubscribeByToken(token: string): Promise<boolean> {
    if (!token || token.trim().length === 0) {
      return false;
    }

    let email = this.unsubTokenIndex.get(token);
    let subscriber: NewsletterSubscriber | null | undefined = email ? this.subscribers.get(email) : undefined;

    // Check database if not present in memory cache
    if (!subscriber) {
      subscriber = await this.querySubscriberByUnsubscribeToken(token);
      if (subscriber) {
        email = subscriber.email;
        this.subscribers.set(email, subscriber);
      }
    }

    if (!subscriber) {
      return false;
    }

    subscriber.status = 'unsubscribed';
    await this.persistSubscriber(subscriber);
    return true;
  }

  async unsubscribe(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const subscriber = this.subscribers.get(normalized);
    if (!subscriber) {
      return false;
    }

    subscriber.status = 'unsubscribed';
    await this.persistSubscriber(subscriber);
    return true;
  }

  async updateTopics(email: string, topics: string[]): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const subscriber = this.subscribers.get(normalized);
    if (!subscriber) {
      return false;
    }

    subscriber.topics = topics;
    await this.persistSubscriber(subscriber);
    return true;
  }

  async getSubscriber(email: string): Promise<NewsletterSubscriber | null> {
    const normalized = email.trim().toLowerCase();
    return this.subscribers.get(normalized) || null;
  }

  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    // Attempt database lookup first
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('status', 'active');
      if (Array.isArray(data) && data.length > 0) {
        // SAFETY: Supabase select('*') on newsletter_subscribers returns rows that
        // structurally match NewsletterSubscriber; Array.isArray confirms it is an array.
        return data as NewsletterSubscriber[];
      }
    } catch {
      // Fallback to in-memory store
    }

    return Array.from(this.subscribers.values()).filter((s) => s.status === 'active');
  }

  private async persistSubscriber(subscriber: NewsletterSubscriber): Promise<void> {
    try {
      const supabase = await createServerSupabaseClient();
      // SAFETY: newsletter_subscribers table upsert payload matches runtime schema; cast to any at DB client boundary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('newsletter_subscribers') as any).upsert({
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        confirmation_token: subscriber.confirmation_token,
        unsubscribe_token: subscriber.unsubscribe_token || null,
        token_expires_at: subscriber.token_expires_at,
        topics: subscriber.topics,
        confirmed_at: subscriber.confirmed_at,
        created_at: subscriber.created_at,
      });
    } catch {
      // In-memory fallback for local dev or testing
    }
  }

  private async querySubscriberByConfirmationToken(token: string): Promise<NewsletterSubscriber | null> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('confirmation_token', token)
        .maybeSingle();

      if (data === null || data === undefined) return null;
      // SAFETY: maybeSingle() on newsletter_subscribers returns exactly one matching row or null.
      // The null guard above ensures data is a non-null row object conforming to NewsletterSubscriber.
      return data as NewsletterSubscriber;
    } catch {
      return null;
    }
  }

  private async querySubscriberByUnsubscribeToken(token: string): Promise<NewsletterSubscriber | null> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('unsubscribe_token', token)
        .maybeSingle();

      if (data === null || data === undefined) return null;
      // SAFETY: maybeSingle() on newsletter_subscribers returns exactly one matching row or null.
      // The null guard above ensures data is a non-null row object conforming to NewsletterSubscriber.
      return data as NewsletterSubscriber;
    } catch {
      return null;
    }
  }
}
