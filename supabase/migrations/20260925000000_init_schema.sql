-- Enable Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 1. Authors Table (Owner Profile)
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text,
  social_links jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 3. Tags Table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- 4. Articles Table
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  cover_image_url text,
  cover_image_alt text,
  visibility text not null check (visibility in ('FREE', 'PREMIUM')) default 'FREE',
  status text not null check (status in ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED')) default 'DRAFT',
  topic_id uuid references public.topics(id) on delete set null,
  author_id uuid references public.authors(id) on delete set null,
  reading_time_minutes integer not null default 5,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Article Tags Junction
create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (article_id, tag_id)
);

-- 6. Immutable Article Revisions Table
create table if not exists public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade not null,
  revision_number integer not null,
  mdx_source text not null,
  rich_html text not null,
  markdown_derivative text not null,
  plaintext_derivative text not null,
  created_at timestamptz not null default now(),
  unique (article_id, revision_number)
);

-- 7. Readers Table (tied to Supabase Auth)
create table if not exists public.readers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- 8. Subscriptions & Entitlements Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references public.readers(id) on delete cascade not null,
  provider text not null check (provider in ('simulated', 'lemonsqueezy', 'paymob', 'stripe')),
  provider_subscription_id text not null,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  plan_type text not null check (plan_type in ('monthly', 'annual')),
  current_period_end timestamptz not null,
  is_complimentary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Newsletter Subscribers Table (Decoupled from Auth)
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null check (status in ('unconfirmed', 'active', 'unsubscribed')) default 'unconfirmed',
  confirmation_token text unique,
  unsubscribe_token text unique,
  token_expires_at timestamptz,
  topics text[] default array[]::text[],
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- 10. Newsletter Campaigns Table
create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  html_content text not null,
  plain_text_content text not null,
  target_segment text not null check (target_segment in ('all', 'free', 'premium')) default 'all',
  status text not null check (status in ('draft', 'scheduled', 'sent')) default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Arabic Text Normalization Function
-- Strips Harakat (diacritics), normalizes Alef forms (أ, إ, آ -> ا), Taa Marbuta (ة -> ه), and Yaa (ى -> ي)
create or replace function public.normalize_arabic(text_input text)
returns text language plpgsql immutable as $$
declare
  result text;
begin
  if text_input is null then
    return '';
  end if;

  result := text_input;
  
  -- Strip Harakat (Fatha, Damma, Kasra, Sukun, Tanween, Shadda)
  result := regexp_replace(result, '[\u064B-\u0652\u0670]', '', 'g');
  
  -- Strip Tatweel (Kashida)
  result := regexp_replace(result, '\u0640', '', 'g');
  
  -- Normalize Alef variants: أ, إ, آ -> ا
  result := regexp_replace(result, '[إأآ]', 'ا', 'g');
  
  -- Normalize Taa Marbuta: ة -> ه
  result := regexp_replace(result, 'ة', 'ه', 'g');
  
  -- Normalize Alef Maqsura: ى -> ي
  result := regexp_replace(result, 'ى', 'ي', 'g');
  
  return lower(trim(result));
end;
$$;

-- Create Indexes for Performance & Search
create index if not exists idx_articles_status_pub on public.articles (status, published_at desc);
create index if not exists idx_articles_slug on public.articles (slug);
create index if not exists idx_articles_visibility on public.articles (visibility);
create index if not exists idx_articles_topic on public.articles (topic_id);
create index if not exists idx_article_revisions_lookup on public.article_revisions (article_id, revision_number desc);
create index if not exists idx_subscriptions_reader on public.subscriptions (reader_id, status);
create index if not exists idx_newsletter_subscribers_email on public.newsletter_subscribers (email);
create index if not exists idx_newsletter_subscribers_token on public.newsletter_subscribers (confirmation_token);
create index if not exists idx_newsletter_subscribers_unsub_token on public.newsletter_subscribers (unsubscribe_token);

-- Trigram Indexes for Arabic Search
create index if not exists idx_articles_title_trgm on public.articles using gin (public.normalize_arabic(title) gin_trgm_ops);
create index if not exists idx_articles_excerpt_trgm on public.articles using gin (public.normalize_arabic(excerpt) gin_trgm_ops);

-- Search Function
create or replace function public.search_articles(query_text text, p_limit int default 20, p_offset int default 0)
returns table (
  id uuid,
  slug text,
  title text,
  excerpt text,
  visibility text,
  published_at timestamptz,
  cover_image_url text,
  reading_time_minutes int,
  similarity float
) language sql stable as $$
  select 
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.visibility,
    a.published_at,
    a.cover_image_url,
    a.reading_time_minutes,
    greatest(
      similarity(public.normalize_arabic(a.title), public.normalize_arabic(query_text)),
      similarity(public.normalize_arabic(a.excerpt), public.normalize_arabic(query_text))
    ) as similarity
  from public.articles a
  where a.status = 'PUBLISHED'
    and (
      public.normalize_arabic(a.title) % public.normalize_arabic(query_text)
      or public.normalize_arabic(a.excerpt) % public.normalize_arabic(query_text)
      or public.normalize_arabic(a.title) ilike '%' || public.normalize_arabic(query_text) || '%'
    )
  order by similarity desc, a.published_at desc
  limit p_limit offset p_offset;
$$;

-- Enable Row Level Security (RLS)
alter table public.authors enable row level security;
alter table public.topics enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_revisions enable row level security;
alter table public.readers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns enable row level security;

-- Public Read Policies
create policy "Public can read authors" on public.authors for select using (true);
create policy "Public can read topics" on public.topics for select using (true);
create policy "Public can read tags" on public.tags for select using (true);

-- Public can only read published articles
create policy "Public can read published articles" on public.articles
  for select using (status = 'PUBLISHED' and (published_at is null or published_at <= now()));

-- Readers can read their own profile
create policy "Readers can read own record" on public.readers
  for select using (auth.uid() = id);

-- Readers can read their own subscriptions
create policy "Readers can read own subscriptions" on public.subscriptions
  for select using (auth.uid() = reader_id);
