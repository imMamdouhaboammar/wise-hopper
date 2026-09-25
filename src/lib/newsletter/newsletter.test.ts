import { describe, it, expect, beforeEach } from 'vitest';
import { NewsletterService } from './subscriber-service';
import { MailerService } from './mailer';

describe('Newsletter Subsystem (Fable TDD)', () => {
  let newsletterService: NewsletterService;
  let mailer: MailerService;

  beforeEach(() => {
    mailer = new MailerService({ mode: 'sandbox' });
    newsletterService = new NewsletterService(mailer);
  });

  describe('Double Opt-In Subscription Flow', () => {
    it('creates unconfirmed subscriber with secure cryptographic token and 24h expiration', async () => {
      const email = 'subscriber@example.com';
      const topics = ['editorial-design', 'system-architecture'];

      const subscriber = await newsletterService.subscribe(email, topics);

      expect(subscriber.email).toBe(email);
      expect(subscriber.status).toBe('unconfirmed');
      expect(subscriber.confirmation_token).toBeDefined();
      expect(subscriber.confirmation_token?.length).toBeGreaterThanOrEqual(32);
      expect(subscriber.token_expires_at).toBeDefined();

      const expiration = new Date(subscriber.token_expires_at!).getTime();
      const now = Date.now();
      expect(expiration - now).toBeGreaterThan(23 * 3600 * 1000);
    });

    it('sends confirmation email with token link in sandbox mode', async () => {
      const email = 'reader@test.com';
      await newsletterService.subscribe(email, ['editorial-design']);

      const sentEmails = mailer.getSentMessages();
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe(email);
      expect(sentEmails[0].subject).toContain('تأكيد اشتراكك في النشرة البريدية');
      expect(sentEmails[0].html).toContain('تأكيد الاشتراك');
    });

    it('activates subscriber when valid confirmation token is provided', async () => {
      const subscriber = await newsletterService.subscribe('active@test.com', []);
      const token = subscriber.confirmation_token!;

      const confirmed = await newsletterService.confirmSubscription(token);
      expect(confirmed).toBe(true);

      const updated = await newsletterService.getSubscriber('active@test.com');
      expect(updated?.status).toBe('active');
      expect(updated?.confirmation_token).toBeNull();
      expect(updated?.confirmed_at).toBeDefined();
    });

    it('rejects confirmation with expired or invalid token', async () => {
      const result = await newsletterService.confirmSubscription('invalid-fake-token');
      expect(result).toBe(false);
    });
  });

  describe('Unsubscribe & Topic Preferences', () => {
    it('marks active subscriber as unsubscribed', async () => {
      const sub = await newsletterService.subscribe('unsub@test.com', []);
      await newsletterService.confirmSubscription(sub.confirmationToken!);

      const unsubResult = await newsletterService.unsubscribe('unsub@test.com');
      expect(unsubResult).toBe(true);

      const record = await newsletterService.getSubscriber('unsub@test.com');
      expect(record?.status).toBe('unsubscribed');
    });

    it('updates subscriber topic preferences', async () => {
      const sub = await newsletterService.subscribe('topics@test.com', ['editorial-design']);
      await newsletterService.confirmSubscription(sub.confirmationToken!);

      const newTopics = ['system-architecture', 'independent-publishing'];
      await newsletterService.updateTopics('topics@test.com', newTopics);

      const record = await newsletterService.getSubscriber('topics@test.com');
      expect(record?.topics).toEqual(newTopics);
    });
  });
});
