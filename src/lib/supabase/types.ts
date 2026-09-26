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
  version: number;
  draft_mdx_source: string | null;
  draft_updated_at: string | null;
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
  unsubscribe_token?: string | null;
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

type GenericRecord<T> = T & { [key: string]: Json | undefined };

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: GenericRecord<Author>;
        Insert: GenericRecord<Omit<Author, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<Author, 'id'>>>;
        Relationships: [];
      };
      topics: {
        Row: GenericRecord<Topic>;
        Insert: GenericRecord<Omit<Topic, 'id' | 'created_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<Topic, 'id'>>>;
        Relationships: [];
      };
      tags: {
        Row: GenericRecord<Tag>;
        Insert: GenericRecord<Omit<Tag, 'id' | 'created_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<Tag, 'id'>>>;
        Relationships: [];
      };
      articles: {
        Row: GenericRecord<Article>;
        Insert: GenericRecord<Omit<Article, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<Article, 'id'>>>;
        Relationships: [];
      };
      article_revisions: {
        Row: GenericRecord<ArticleRevision>;
        Insert: GenericRecord<Omit<ArticleRevision, 'id' | 'created_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<ArticleRevision, 'id'>>>;
        Relationships: [];
      };
      readers: {
        Row: GenericRecord<Reader>;
        Insert: GenericRecord<Omit<Reader, 'created_at'>>;
        Update: GenericRecord<Partial<Omit<Reader, 'id'>>>;
        Relationships: [];
      };
      subscriptions: {
        Row: GenericRecord<Subscription>;
        Insert: GenericRecord<Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<Subscription, 'id'>>>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: GenericRecord<NewsletterSubscriber>;
        Insert: GenericRecord<Omit<NewsletterSubscriber, 'id' | 'created_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<NewsletterSubscriber, 'id'>>>;
        Relationships: [];
      };
      newsletter_campaigns: {
        Row: GenericRecord<NewsletterCampaign>;
        Insert: GenericRecord<Omit<NewsletterCampaign, 'id' | 'created_at'> & { id?: string }>;
        Update: GenericRecord<Partial<Omit<NewsletterCampaign, 'id'>>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      normalize_arabic: {
        Args: { text_input: string };
        Returns: string;
      };
      search_articles: {
        Args: { query_text: string; p_limit?: number; p_offset?: number };
        Returns: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          visibility: string;
          published_at: string;
          cover_image_url: string;
          reading_time_minutes: number;
          similarity: number;
        }[];
      };
      publish_article_revision: {
        Args: {
          p_article_id: string;
          p_expected_version: number;
          p_title: string;
          p_slug: string;
          p_excerpt: string;
          p_visibility: string;
          p_topic_id: string | null;
          p_cover_image_url: string | null;
          p_cover_image_alt: string | null;
          p_seo_title: string | null;
          p_seo_description: string | null;
          p_reading_time_minutes: number;
          p_mdx_source: string;
          p_rich_html: string;
          p_markdown_derivative: string;
          p_plaintext_derivative: string;
          p_published_at?: string;
        };
        Returns: Record<string, Json>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
