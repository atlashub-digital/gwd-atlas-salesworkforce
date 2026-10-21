-- GWD Academy Streaming V1 — migration (APROVADA: PDG GO 2026-10-20, doc ACADEMY_STREAMING_V1_DATA_MODEL.md)
-- Ownership: GWD Academy. Sem tabelas Telegram (ownership telegram-provider/Atlas Media).
-- ARO é a autoridade de entitlement; nada de paid truth aqui.
-- NOTA: RLS adicionada no fim; runs em Supabase Management API statement-a-statement.

-- ===== Catálogo =====
create table gwd.academy_series (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  owner text,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  access_tier text not null default 'MEMBER' check (access_tier in ('FREE','MEMBER','PREMIUM','CERTIFIED')),
  entitlement_ref text,
  featured boolean not null default false,
  cover_asset_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gwd.academy_seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references gwd.academy_series(id) on delete cascade,
  position integer not null check(position > 0),
  title text not null,
  unique(series_id, position)
);

create table gwd.academy_episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references gwd.academy_seasons(id) on delete cascade,
  slug text not null,
  position integer not null check(position > 0),
  title text not null,
  summary text not null default '',
  episode_type text not null check (episode_type in ('VIDEO','READER','HYBRID','QUIZ','ASSIGNMENT','LIVE','EXTERNAL')),
  access_tier text not null default 'MEMBER' check (access_tier in ('FREE','MEMBER','PREMIUM','CERTIFIED')),
  entitlement_ref text,
  completion_policy text not null default 'DEFAULT',
  policy_key text not null,
  delivery_mode text not null default 'WEBPLAYER' check (delivery_mode in ('WEBPLAYER','WEBREADER','HYBRID','TELEGRAM','EXTERNAL')),
  duration_seconds integer check(duration_seconds is null or duration_seconds >= 0),
  published boolean not null default false,
  unique(season_id, position),
  unique(season_id, slug)
);

create table gwd.academy_episode_assets (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references gwd.academy_episodes(id) on delete cascade,
  kind text not null check (kind in ('VIDEO','READER','WORKBOOK','POSTER','SUBTITLES','TELEGRAM','RESOURCE')),
  provider text not null check (provider in ('ATLAS_MEDIA','GWD_READER','TELEGRAM','EXTERNAL')),
  asset_ref text not null,
  access_policy_ref text,
  metadata jsonb not null default '{}',
  position integer not null default 1,
  superseded_at timestamptz,
  superseded_by uuid
);

create table gwd.academy_completion_policies (
  policy_key text not null,
  version integer not null,
  rules jsonb not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (policy_key, version)
);

-- ===== Progresso / eventos =====
create table gwd.academy_episode_progress (
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  episode_id uuid not null references gwd.academy_episodes(id) on delete cascade,
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  last_position_seconds integer not null default 0,
  engaged_seconds integer not null default 0,
  progress_percent numeric(5,2) not null default 0 check(progress_percent >= 0 and progress_percent <= 100),
  last_reader_section integer,
  active_reading_seconds integer not null default 0,
  completion_method text,
  first_started_at timestamptz,
  last_seen_at timestamptz,
  completed_at timestamptz,
  primary key(participant_id, episode_id)
);

create table gwd.academy_learning_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  episode_id uuid references gwd.academy_episodes(id) on delete cascade,
  series_id uuid references gwd.academy_series(id) on delete cascade,
  event_type text not null,
  event_key text unique,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table gwd.academy_enrollments (
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  series_id uuid not null references gwd.academy_series(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key(participant_id, series_id)
);

-- ===== Quizzes (QUIZ_VERIFIED / capabilities) =====
create table gwd.academy_quizzes(
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references gwd.academy_episodes(id) on delete cascade,
  version integer not null default 1,
  questions jsonb not null,
  pass_threshold numeric(5,2) not null default 80.00,
  unique(episode_id, version)
);

create table gwd.academy_quiz_attempts(
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  quiz_id uuid not null references gwd.academy_quizzes(id) on delete cascade,
  quiz_version integer not null,
  score numeric(5,2) not null,
  passed boolean not null,
  answers jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ===== Capabilities (auditável, append-only) =====
create table gwd.participant_capability_awards (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  capability text not null,
  source_type text not null,
  source_ref text,
  awarded_at timestamptz not null default now(),
  unique(participant_id, capability, source_type, source_ref)
);

-- ===== Índices =====
create index on gwd.academy_series (status, featured);
create index on gwd.academy_episodes (season_id, position) where published;
create index on gwd.academy_episode_progress (participant_id, status);
create index on gwd.academy_learning_events (participant_id, created_at desc);

-- ===== RLS =====
alter table gwd.academy_series enable row level security;
alter table gwd.academy_seasons enable row level security;
alter table gwd.academy_episodes enable row level security;
alter table gwd.academy_episode_assets enable row level security;
alter table gwd.academy_completion_policies enable row level security;
alter table gwd.academy_episode_progress enable row level security;
alter table gwd.academy_learning_events enable row level security;
alter table gwd.academy_enrollments enable row level security;
alter table gwd.academy_quizzes enable row level security;
alter table gwd.academy_quiz_attempts enable row level security;
alter table gwd.participant_capability_awards enable row level security;

-- Catálogo público: apenas publicado
create policy academy_series_public_read on gwd.academy_series
  for select using (status = 'PUBLISHED');
create policy academy_seasons_public_read on gwd.academy_seasons
  for select using (exists (select 1 from gwd.academy_series s where s.id = series_id and s.status = 'PUBLISHED'));
create policy academy_episodes_public_read on gwd.academy_episodes
  for select using (published and exists (
    select 1 from gwd.academy_seasons sn join gwd.academy_series s on s.id = sn.series_id
    where sn.id = season_id and s.status = 'PUBLISHED'));
create policy academy_assets_public_read on gwd.academy_episode_assets
  for select using (exists (
    select 1 from gwd.academy_episodes e
    join gwd.academy_seasons sn on sn.id = e.season_id
    join gwd.academy_series s on s.id = sn.series_id
    where e.id = episode_id and e.published and s.status = 'PUBLISHED'));
create policy academy_policies_read on gwd.academy_completion_policies
  for select using (active);

-- Progresso/eventos/quizzes/enrollments/awards: própria linha; escrita só via trusted-server (gwd_api)
create policy academy_progress_own_read on gwd.academy_episode_progress
  for select using (participant_id = (select auth.uid()));
create policy academy_events_own_read on gwd.academy_learning_events
  for select using (participant_id = (select auth.uid()));
create policy academy_enrollments_own_read on gwd.academy_enrollments
  for select using (participant_id = (select auth.uid()));
create policy academy_quiz_attempts_own_read on gwd.academy_quiz_attempts
  for select using (participant_id = (select auth.uid()));
create policy academy_capability_awards_own_read on gwd.participant_capability_awards
  for select using (participant_id = (select auth.uid()));

-- ===== Grants (modelo trusted-server: gwd_api NOLOGIN via set local role gwd_api) =====
grant select, insert, update, delete on gwd.academy_series, gwd.academy_seasons, gwd.academy_episodes,
  gwd.academy_episode_assets, gwd.academy_completion_policies, gwd.academy_quizzes to gwd_api;
grant select, insert, update, delete on gwd.academy_episode_progress, gwd.academy_learning_events,
  gwd.academy_enrollments, gwd.academy_quiz_attempts, gwd.participant_capability_awards to gwd_api;

-- ===== Seed: completion policies V1 =====
insert into gwd.academy_completion_policies(policy_key, version, rules, active) values
 ('VIDEO_STANDARD_V1', 1, '{"position_pct":90,"engaged_pct":80}', true),
 ('READER_STANDARD_V1', 1, '{"reader_pct":90,"min_reading_seconds":180}', true),
 ('HYBRID_ANY_V1', 1, '{"any_of":["VIDEO_STANDARD_V1","READER_STANDARD_V1"]}', true),
 ('HYBRID_BOTH_V1', 1, '{"all_of":["VIDEO_STANDARD_V1","READER_STANDARD_V1"]}', true),
 ('HYBRID_QUIZ_V1', 1, '{"any_of":["VIDEO_STANDARD_V1","READER_STANDARD_V1"],"require_quiz":true}', true),
 ('TELEGRAM_SELF_ATTESTED_V1', 1, '{"require_handoff":true,"completion_method":"SELF_ATTESTED"}', true),
 ('TELEGRAM_QUIZ_VERIFIED_V1', 1, '{"require_handoff":true,"completion_method":"QUIZ_VERIFIED"}', true)
on conflict (policy_key, version) do nothing;

-- ===== Suplemento RLS: INSERT/UPDATE via gwd_api + quizzes public read (aplicado 2026-10-20) =====
create policy academy_progress_own_insert on gwd.academy_episode_progress
  for insert to gwd_api with check (participant_id = (select auth.uid()));
create policy academy_progress_own_update on gwd.academy_episode_progress
  for update to gwd_api using (participant_id = (select auth.uid()))
  with check (participant_id = (select auth.uid()));

create policy academy_events_own_insert on gwd.academy_learning_events
  for insert to gwd_api with check (participant_id = (select auth.uid()));

create policy academy_enrollments_own_insert on gwd.academy_enrollments
  for insert to gwd_api with check (participant_id = (select auth.uid()));

create policy academy_quiz_attempts_own_insert on gwd.academy_quiz_attempts
  for insert to gwd_api with check (participant_id = (select auth.uid()));

create policy academy_capability_awards_own_insert on gwd.participant_capability_awards
  for insert to gwd_api with check (participant_id = (select auth.uid()));

create policy academy_quizzes_public_read on gwd.academy_quizzes
  for select using (exists (
    select 1 from gwd.academy_episodes e
    join gwd.academy_seasons sn on sn.id = e.season_id
    join gwd.academy_series s on s.id = sn.series_id
    where e.id = episode_id and e.published and s.status = 'PUBLISHED'));
