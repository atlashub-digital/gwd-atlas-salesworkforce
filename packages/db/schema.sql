-- REVIEW PROPOSAL ONLY. Helena applies to confirmed staging DB.
-- Requires Supabase auth schema. Runtime login must be explicitly granted gwd_api.
-- Access model: trusted server. Participants never connect to Postgres. apps/api verifies the
-- Supabase JWT (verifyToken), then per transaction SET LOCAL ROLE gwd_api and sets
-- request.jwt.claim.sub (and request.jwt.claim.email only for a server-confirmed email).
-- gwd_api write grants exist only for the API's parameterized, server-fixed writes
-- (capabilities COMMUNITY/LEARNING, points copied from journey_steps, audit actions);
-- RLS on claim.sub still scopes every row to the verified participant.
begin;
create schema if not exists gwd;
do $$ begin if not exists (select 1 from pg_roles where rolname='gwd_api') then create role gwd_api nologin noinherit; end if; end $$;
grant usage on schema gwd, auth to gwd_api;
grant execute on function auth.uid() to gwd_api;
-- Objects created later in gwd get no implicit privileges.
alter default privileges in schema gwd revoke all on tables from public,anon,authenticated,gwd_api;
alter default privileges in schema gwd revoke all on sequences from public,anon,authenticated,gwd_api;
alter default privileges in schema gwd revoke all on functions from anon,authenticated,gwd_api;
-- EXECUTE to PUBLIC is a global default that IN SCHEMA cannot revoke: revoke it on each future gwd function.
create table gwd.leads (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 1 and 120), email text not null,
 market text not null check(market in ('BR','EU','OTHER')), interest text not null,
 source text not null check(char_length(source) between 1 and 200), utm jsonb not null default '{}', consent_at timestamptz not null default now(),
 consent_version text not null default 'soft-launch-v1', created_at timestamptz not null default now()
);
create unique index leads_email_lower_key on gwd.leads (lower(email));
-- FK delete behaviour: participant-derived data cascades; audit history is kept (set null);
-- lead erasure unlinks (set null); commercial/financial records are RESTRICT so they are
-- never removed implicitly (referrals, seller_offers, attributed_sales, accrual_ledger).
create table gwd.participants (
 id uuid primary key references auth.users(id) on delete cascade, lead_id uuid references gwd.leads(id) on delete set null, display_name text not null, market text not null default 'OTHER',
 interest text not null default 'LEARNING', onboarding_completed boolean not null default false,
 created_at timestamptz not null default now()
);
create table gwd.participant_capabilities (
 participant_id uuid not null references gwd.participants(id) on delete cascade, capability text not null check(capability in
 ('COMMUNITY','LEARNING','SOCIAL_MEDIA','AFFILIATE','AUTHORIZED_SELLER','MENTOR','TEAM_LEAD')),
 primary key(participant_id,capability)
);
create table gwd.journeys(id text primary key,title text not null,owner text not null);
create table gwd.journey_steps(id text primary key,journey_id text not null references gwd.journeys(id),position integer not null,points integer not null check(points>=0));
create table gwd.journey_progress(participant_id uuid not null references gwd.participants(id) on delete cascade,step_id text not null references gwd.journey_steps(id),completed_at timestamptz not null default now(),primary key(participant_id,step_id));
create table gwd.academy_items(id text primary key,title text not null,body text not null,owner text not null);
create table gwd.community_memberships(participant_id uuid primary key references gwd.participants(id) on delete cascade,joined_at timestamptz not null default now());
create table gwd.campaigns(id uuid primary key default gen_random_uuid(),title text not null,status text not null default 'DRAFT' check(status in ('DRAFT','APPROVED','PAUSED')),market text not null default 'OTHER',description text not null default '');
create table gwd.campaign_participants(participant_id uuid not null references gwd.participants(id) on delete cascade,campaign_id uuid not null references gwd.campaigns(id),primary key(participant_id,campaign_id));
create table gwd.points_events(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id) on delete cascade,event_key text not null,points integer not null,created_at timestamptz not null default now(),unique(participant_id,event_key));
create table gwd.badges(id text primary key,title text not null);
create table gwd.participant_badges(participant_id uuid not null references gwd.participants(id) on delete cascade,badge_id text not null references gwd.badges(id),primary key(participant_id,badge_id));
create table gwd.feature_flags(key text primary key,enabled boolean not null default false);
create table gwd.audit_events(id uuid primary key default gen_random_uuid(),participant_id uuid references gwd.participants(id) on delete set null,action text not null,created_at timestamptz not null default now());
create table gwd.agent_bindings(participant_id uuid primary key references gwd.participants(id) on delete cascade,mode text not null default 'SHARED' check(mode in ('NONE','SHARED')),agent_key text not null default 'maia-valente');
-- Commercial structures: no runtime grants, endpoints or activation. FKs are RESTRICT by design.
create table gwd.referrals(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id) on delete restrict,code text unique not null);
create table gwd.seller_offers(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id) on delete restrict,offer_ref text not null,price_minor bigint check(price_minor>=0),currency text not null);
create table gwd.attributed_sales(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id) on delete restrict,aro_order_id text unique not null,status text not null);
create table gwd.accrual_ledger(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id) on delete restrict,aro_order_id text not null,event_key text unique not null,amount_minor bigint not null,currency text not null,status text not null default 'PENDING');
create table gwd.notification_outbox(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id) on delete cascade,kind text not null,available_at timestamptz not null default now(),processed_at timestamptz);
-- All tables protected; no Data API grants to anon/authenticated.
do $$ declare t text; begin
 for t in select tablename from pg_tables where schemaname='gwd' loop
  execute format('alter table gwd.%I enable row level security',t);
 end loop;
end $$;
revoke all on schema gwd from public,anon,authenticated;
revoke all on all tables in schema gwd from public,anon,authenticated;
-- Grants are column-scoped to exactly what apps/api/src/handler.ts writes; ids/timestamps stay server defaults.
grant insert,select on gwd.leads to gwd_api;
-- request.jwt.claim.email is set by the API (lowercased) only when Supabase reports email_confirmed_at,
-- so email verification is enforced server-side; an empty claim matches nothing.
create policy verified_lead_read on gwd.leads for select to gwd_api using(
 lower(email)=nullif(lower(current_setting('request.jwt.claim.email',true)),''));
create policy lead_insert on gwd.leads for insert to gwd_api with check(true);
-- Onboarding upsert: lead_id is set once on insert and never updatable.
grant select on gwd.participants to gwd_api;
grant insert(id,display_name,market,interest,onboarding_completed,lead_id) on gwd.participants to gwd_api;
grant update(display_name,market,interest,onboarding_completed) on gwd.participants to gwd_api;
create policy participant_select on gwd.participants for select to gwd_api using(id=(select auth.uid()));
create policy participant_insert on gwd.participants for insert to gwd_api with check(id=(select auth.uid()));
create policy participant_update on gwd.participants for update to gwd_api using(id=(select auth.uid())) with check(id=(select auth.uid()));
-- Own-row read and insert for participant tables; no update/delete grants.
do $$ declare t text; begin
 foreach t in array array['participant_capabilities','journey_progress','community_memberships','points_events','agent_bindings','audit_events'] loop
  execute format('grant select on gwd.%I to gwd_api',t);
  execute format('create policy own_select on gwd.%I for select to gwd_api using (participant_id=(select auth.uid()))',t);
  execute format('create policy own_insert on gwd.%I for insert to gwd_api with check (participant_id=(select auth.uid()))',t);
 end loop;
end $$;
grant insert(participant_id,capability) on gwd.participant_capabilities to gwd_api;
grant insert(participant_id,step_id) on gwd.journey_progress to gwd_api;
grant insert(participant_id) on gwd.community_memberships to gwd_api;
grant insert(participant_id,event_key,points) on gwd.points_events to gwd_api;
-- agent_bindings: mode/agent_key keep their defaults (SHARED, maia-valente).
grant insert(participant_id) on gwd.agent_bindings to gwd_api;
grant insert(participant_id,action) on gwd.audit_events to gwd_api;
do $$ declare t text; begin
 foreach t in array array['journeys','journey_steps','academy_items','badges','feature_flags'] loop
  execute format('grant select on gwd.%I to gwd_api',t);
  execute format('create policy catalog_read on gwd.%I for select to gwd_api using(true)',t);
 end loop;
end $$;
grant select on gwd.campaigns to gwd_api;
create policy approved_campaigns on gwd.campaigns for select to gwd_api using(status='APPROVED');
insert into gwd.journeys values('gwd-start','GWD Start','Maia Valente') on conflict do nothing;
insert into gwd.journey_steps values('welcome','gwd-start',1,10),('learn','gwd-start',2,10),('community','gwd-start',3,10),('explore','gwd-start',4,10) on conflict do nothing;
insert into gwd.feature_flags values('sellerPricing',false),('referrals',false),('aroProduction',false),('payouts',false),('ranking',false),('copilot',false),('dedicatedHermes',false) on conflict do nothing;
commit;
