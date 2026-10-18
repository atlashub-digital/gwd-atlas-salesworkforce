-- REVIEW PROPOSAL ONLY. Helena applies to confirmed staging DB.
-- Requires Supabase auth schema. Runtime login must be explicitly granted gwd_api.
begin;
create schema if not exists gwd;
do $$ begin if not exists (select 1 from pg_roles where rolname='gwd_api') then create role gwd_api nologin noinherit; end if; end $$;
grant usage on schema gwd, auth to gwd_api;
grant execute on function auth.uid() to gwd_api;
create table gwd.leads (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null,
 market text not null check(market in ('BR','EU','OTHER')), interest text not null,
 source text not null, utm jsonb not null default '{}', consent_at timestamptz not null default now(),
 consent_version text not null default 'soft-launch-v1', created_at timestamptz not null default now()
);
create table gwd.participants (
 id uuid primary key references auth.users(id), lead_id uuid references gwd.leads(id), display_name text not null, market text not null default 'OTHER',
 interest text not null default 'LEARNING', onboarding_completed boolean not null default false,
 created_at timestamptz not null default now()
);
create table gwd.participant_capabilities (
 participant_id uuid not null references gwd.participants(id), capability text not null check(capability in
 ('COMMUNITY','LEARNING','SOCIAL_MEDIA','AFFILIATE','AUTHORIZED_SELLER','MENTOR','TEAM_LEAD')),
 primary key(participant_id,capability)
);
create table gwd.journeys(id text primary key,title text not null,owner text not null);
create table gwd.journey_steps(id text primary key,journey_id text not null references gwd.journeys(id),position integer not null,points integer not null check(points>=0));
create table gwd.journey_progress(participant_id uuid not null references gwd.participants(id),step_id text not null references gwd.journey_steps(id),completed_at timestamptz not null default now(),primary key(participant_id,step_id));
create table gwd.academy_items(id text primary key,title text not null,body text not null,owner text not null);
create table gwd.community_memberships(participant_id uuid primary key references gwd.participants(id),joined_at timestamptz not null default now());
create table gwd.campaigns(id uuid primary key default gen_random_uuid(),title text not null,status text not null default 'DRAFT' check(status in ('DRAFT','APPROVED','PAUSED')),market text not null default 'OTHER',description text not null default '');
create table gwd.campaign_participants(participant_id uuid not null references gwd.participants(id),campaign_id uuid not null references gwd.campaigns(id),primary key(participant_id,campaign_id));
create table gwd.points_events(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id),event_key text not null,points integer not null,created_at timestamptz not null default now(),unique(participant_id,event_key));
create table gwd.badges(id text primary key,title text not null);
create table gwd.participant_badges(participant_id uuid not null references gwd.participants(id),badge_id text not null references gwd.badges(id),primary key(participant_id,badge_id));
create table gwd.feature_flags(key text primary key,enabled boolean not null default false);
create table gwd.audit_events(id uuid primary key default gen_random_uuid(),participant_id uuid references gwd.participants(id),action text not null,created_at timestamptz not null default now());
create table gwd.agent_bindings(participant_id uuid primary key references gwd.participants(id),mode text not null default 'SHARED' check(mode in ('NONE','SHARED','DEDICATED')),agent_key text not null default 'maia-valente');
-- Commercial structures: no runtime grants, endpoints or activation.
create table gwd.referrals(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id),code text unique not null);
create table gwd.seller_offers(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id),offer_ref text not null,price_minor bigint check(price_minor>=0),currency text not null);
create table gwd.attributed_sales(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id),aro_order_id text unique not null,status text not null);
create table gwd.accrual_ledger(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id),aro_order_id text not null,event_key text unique not null,amount_minor bigint not null,currency text not null,status text not null default 'PENDING');
create table gwd.notification_outbox(id uuid primary key default gen_random_uuid(),participant_id uuid not null references gwd.participants(id),kind text not null,available_at timestamptz not null default now(),processed_at timestamptz);
-- All tables protected; no Data API grants to anon/authenticated.
do $$ declare t text; begin
 for t in select tablename from pg_tables where schemaname='gwd' loop
  execute format('alter table gwd.%I enable row level security',t);
 end loop;
end $$;
revoke all on schema gwd from public,anon,authenticated;
revoke all on all tables in schema gwd from public,anon,authenticated;
grant insert,select on gwd.leads to gwd_api;
create policy verified_lead_read on gwd.leads for select to gwd_api using(email=current_setting('request.jwt.claim.email',true));
create policy lead_insert on gwd.leads for insert to gwd_api with check(true);
grant select,insert,update on gwd.participants to gwd_api;
create policy participant_select on gwd.participants for select to gwd_api using(id=(select auth.uid()));
create policy participant_insert on gwd.participants for insert to gwd_api with check(id=(select auth.uid()));
create policy participant_update on gwd.participants for update to gwd_api using(id=(select auth.uid())) with check(id=(select auth.uid()));
do $$ declare t text; begin
 foreach t in array array['participant_capabilities','journey_progress','community_memberships','points_events','agent_bindings','audit_events'] loop
  execute format('grant select,insert on gwd.%I to gwd_api',t);
  execute format('create policy own_select on gwd.%I for select to gwd_api using (participant_id=(select auth.uid()))',t);
  execute format('create policy own_insert on gwd.%I for insert to gwd_api with check (participant_id=(select auth.uid()))',t);
 end loop;
end $$;
do $$ declare t text; begin
 foreach t in array array['journeys','journey_steps','academy_items','badges','feature_flags'] loop
  execute format('grant select on gwd.%I to gwd_api',t);
  execute format('create policy catalog_read on gwd.%I for select to gwd_api using(true)',t);
 end loop;
end $$;
grant select on gwd.campaigns to gwd_api;
create policy approved_campaigns on gwd.campaigns for select to gwd_api using(status='APPROVED');
insert into gwd.journeys values('gwd-start','GWD Start','Maia Valente');
insert into gwd.journey_steps values('welcome','gwd-start',1,10),('learn','gwd-start',2,10),('community','gwd-start',3,10),('explore','gwd-start',4,10);
insert into gwd.feature_flags values('sellerPricing',false),('referrals',false),('aroProduction',false),('payouts',false),('ranking',false),('copilot',false),('dedicatedHermes',false);
commit;
