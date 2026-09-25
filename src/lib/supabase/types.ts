export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ArticleVisibility = 'FREE' | 'PREMIUM';
export type ArticleStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
export type BillingProvider = 'simulated' | 'lemonsqueezy' | 'paymob' | 'stripe';
export type NewsletterStatus = 'unconfirmed' | 'active' | 'unsubscribed';

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  visibility: ArticleVisibility;
  status: ArticleStatus;
  topic_id: string | null;
  author_id: string | null;
  reading_time_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleRevision {
  id: string;
  article_id: string;
  revision_number: number;
  mdx_source: string;
  rich_html: string;
  markdown_derivative: string;
  plaintext_derivative: string;
  created_at: string;
}

export interface Reader {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  reader_id: string;
  provider: BillingProvider;
  provider_subscription_id: string;
  status: SubscriptionStatus;
  plan_type: 'monthly' | 'annual';
  current_period_end: string;
  is_complimentary: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  confirmation_token: string | null;
  token_expires_at: string | null;
  topics: string[];
  created_at: string;
  confirmed_at: string | null;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  html_content: string;
  plain_text_content: string;
  target_segment: 'all' | 'free' | 'premium';
  status: 'draft' | 'scheduled' | 'sent';
  sent_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: Author;
        Insert: Omit<Author, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Author, 'id'>>;
      };
      topics: {
        Row: Topic;
        Insert: Omit<Topic, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Topic, 'id'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Tag, 'id'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Article, 'id'>>;
      };
      article_revisions: {
        Row: ArticleRevision;
        Insert: Omit<ArticleRevision, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<ArticleRevision, 'id'>>;
      };
      readers: {
        Row: Reader;
        Insert: Omit<Reader, 'created_at'>;
        Update: Partial<Omit<Reader, 'id'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Subscription, 'id'>>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>;
      };
      newsletter_campaigns: {
        Row: NewsletterCampaign;
        Insert: Omit<NewsletterCampaign, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<NewsletterCampaign, 'id'>>;
      };
    };
  };
}
