import { NewsletterService } from '@/lib/newsletter/subscriber-service';
import { MailerService } from '@/lib/newsletter/mailer';

// Shared singleton — all newsletter API routes import from here, never from another route file
export const mailer = new MailerService();
export const newsletterService = new NewsletterService(mailer);
