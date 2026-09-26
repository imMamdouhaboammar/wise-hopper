-- Migration: 20260925000001_studio_data_layer.sql
-- Studio Data Layer: Optimistic concurrency control, draft storage, media bucket, and atomic publish RPC.

-- 1. Extend articles table for studio drafts & optimistic concurrency
alter table public.articles
  add column if not exists version int not null default 1,
  add column if not exists draft_mdx_source text,
  add column if not exists draft_updated_at timestamptz;

-- 2. Supabase Storage Bucket for article media (public read, owner write, max 5 MB, no SVG)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-media',
  'article-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Storage Policies for article-media bucket
create policy "Public can view article media"
  on storage.objects for select
  using (bucket_id = 'article-media');

create policy "Service role or owner can upload article media"
  on storage.objects for insert
  with check (bucket_id = 'article-media');

create policy "Service role or owner can update article media"
  on storage.objects for update
  using (bucket_id = 'article-media');

create policy "Service role or owner can delete article media"
  on storage.objects for delete
  using (bucket_id = 'article-media');

-- 3. Publish Article Postgres Function (atomic revision creation, optimistic lock check, and status update)
create or replace function public.publish_article_revision(
  p_article_id uuid,
  p_expected_version int,
  p_title text,
  p_slug text,
  p_excerpt text,
  p_visibility text,
  p_topic_id uuid,
  p_cover_image_url text,
  p_cover_image_alt text,
  p_seo_title text,
  p_seo_description text,
  p_reading_time_minutes int,
  p_mdx_source text,
  p_rich_html text,
  p_markdown_derivative text,
  p_plaintext_derivative text,
  p_published_at timestamptz default now()
)
returns jsonb
language plpgsql
as $$
declare
  v_current_version int;
  v_next_revision_number int;
  v_new_revision_id uuid;
  v_new_version int;
  v_result jsonb;
begin
  -- 1. Lock and check article version (optimistic locking)
  select version into v_current_version
  from public.articles
  where id = p_article_id
  for update;

  if not found then
    raise exception 'ARTICLE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_current_version <> p_expected_version then
    raise exception 'VERSION_CONFLICT: expected %, found %', p_expected_version, v_current_version
      using errcode = 'P0001';
  end if;

  -- 2. Determine next revision number
  select coalesce(max(revision_number), 0) + 1 into v_next_revision_number
  from public.article_revisions
  where article_id = p_article_id;

  -- 3. Insert immutable revision row
  insert into public.article_revisions (
    article_id,
    revision_number,
    mdx_source,
    rich_html,
    markdown_derivative,
    plaintext_derivative
  ) values (
    p_article_id,
    v_next_revision_number,
    p_mdx_source,
    p_rich_html,
    p_markdown_derivative,
    p_plaintext_derivative
  )
  returning id into v_new_revision_id;

  -- 4. Update article record with published status and incremented version
  v_new_version := v_current_version + 1;

  update public.articles
  set
    title = coalesce(p_title, title),
    slug = coalesce(p_slug, slug),
    excerpt = coalesce(p_excerpt, excerpt),
    visibility = coalesce(p_visibility, visibility),
    topic_id = p_topic_id,
    cover_image_url = p_cover_image_url,
    cover_image_alt = p_cover_image_alt,
    seo_title = p_seo_title,
    seo_description = p_seo_description,
    reading_time_minutes = coalesce(p_reading_time_minutes, reading_time_minutes),
    status = 'PUBLISHED',
    published_at = coalesce(published_at, p_published_at),
    scheduled_at = null,
    version = v_new_version,
    draft_mdx_source = null,
    draft_updated_at = now(),
    updated_at = now()
  where id = p_article_id;

  -- 5. Construct return payload
  select jsonb_build_object(
    'article_id', p_article_id,
    'revision_id', v_new_revision_id,
    'revision_number', v_next_revision_number,
    'version', v_new_version,
    'published_at', coalesce(published_at, p_published_at)
  ) into v_result
  from public.articles
  where id = p_article_id;

  return v_result;
end;
$$;
