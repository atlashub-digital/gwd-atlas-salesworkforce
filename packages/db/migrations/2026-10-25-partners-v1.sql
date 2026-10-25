-- GWD partners V1 (25/10/2026): affiliate / authorized-seller applications, terms acceptance, offer programmes,
-- attributed links and verified clicks; read-only views of attributed sales and accruals.
-- Additive. REVIEW PROPOSAL: Helena applies after backup and AFTER 2026-10-24-leads-v2.sql (uses gwd.operators).
-- Rules: the Novidades.Store catalogue is the source of truth for products and prices (nothing copied here);
-- offer conditions are entered by an operator only after the direction confirms rights and terms; commissions are
-- never written by the app (gwd.attributed_sales / gwd.accrual_ledger stay service-written from ARO reconciliation).
-- Identity: the API sets request.jwt.claim.sub per transaction; no function body references auth.*.
begin;

create or replace function gwd.claim_sub() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
revoke all on function gwd.claim_sub() from public, anon, authenticated;
grant execute on function gwd.claim_sub() to gwd_api;

-- Defence in depth: members may self-insert only the base capabilities (the API grants COMMUNITY/LEARNING at
-- onboarding). Commercial capabilities come only from an operator decision (gwd.ops_review_partner_application).
drop policy if exists own_insert on gwd.participant_capabilities;
create policy own_insert on gwd.participant_capabilities for insert to gwd_api
  with check (participant_id = gwd.claim_sub() and capability in ('COMMUNITY', 'LEARNING'));

-- Which Novidades listing is open to affiliates / resellers, and under which published conditions.
create table gwd.offer_programs (
  offer_slug text not null check (offer_slug ~ '^[a-z0-9-]{2,80}$'),
  kind text not null check (kind in ('AFFILIATE', 'RESELLER')),
  status text not null default 'PENDING_CONDITIONS' check (status in ('PENDING_CONDITIONS', 'ACTIVE', 'PAUSED')),
  conditions text not null default '' check (char_length(conditions) <= 2000),
  updated_at timestamptz not null default now(),
  primary key (offer_slug, kind),
  check (status <> 'ACTIVE' or char_length(conditions) >= 20)
);

create table gwd.partner_applications (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  kind text not null check (kind in ('AFFILIATE', 'AUTHORIZED_SELLER')),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'APPROVED', 'REJECTED')),
  market text not null check (market in ('BR', 'EU', 'OTHER')),
  channels text not null check (char_length(channels) between 10 and 1000),
  motivation text not null check (char_length(motivation) between 20 and 2000),
  decision_note text not null default '' check (char_length(decision_note) <= 500),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index partner_applications_open_key on gwd.partner_applications (participant_id, kind) where status in ('SUBMITTED', 'APPROVED');

create table gwd.partner_terms (
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  kind text not null check (kind in ('AFFILIATE', 'AUTHORIZED_SELLER')),
  terms_version text not null check (terms_version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  accepted_at timestamptz not null default now(),
  primary key (participant_id, kind, terms_version)
);

-- gwd.referrals (schema V1): one opaque code per participant.
create unique index referrals_participant_key on gwd.referrals (participant_id);
alter table gwd.referrals add constraint referrals_code_format check (code ~ '^[a-z0-9]{8,16}$');

create table gwd.referral_links (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references gwd.participants(id) on delete restrict,
  offer_slug text not null check (offer_slug ~ '^[a-z0-9-]{2,80}$'),
  campaign text not null default '' check (campaign ~ '^[a-z0-9-]{0,40}$'),
  created_at timestamptz not null default now(),
  unique (participant_id, offer_slug, campaign)
);

-- Clicks: no IP, no user agent, no personal data. Link previews and bots are filtered by the API before recording.
create table gwd.referral_clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references gwd.referral_links(id) on delete cascade,
  clicked_at timestamptz not null default now()
);
create index referral_clicks_link_idx on gwd.referral_clicks (link_id, clicked_at);

alter table gwd.offer_programs enable row level security;
alter table gwd.partner_applications enable row level security;
alter table gwd.partner_terms enable row level security;
alter table gwd.referral_links enable row level security;
alter table gwd.referral_clicks enable row level security;
revoke all on gwd.offer_programs, gwd.partner_applications, gwd.partner_terms, gwd.referral_links, gwd.referral_clicks from public, anon, authenticated;

grant select on gwd.offer_programs to gwd_api;
create policy programs_read on gwd.offer_programs for select to gwd_api using (true);

grant select on gwd.partner_applications to gwd_api;
grant insert (participant_id, kind, market, channels, motivation) on gwd.partner_applications to gwd_api;
create policy own_select on gwd.partner_applications for select to gwd_api using (participant_id = gwd.claim_sub());
create policy own_insert on gwd.partner_applications for insert to gwd_api with check (participant_id = gwd.claim_sub());

grant select on gwd.partner_terms to gwd_api;
grant insert (participant_id, kind, terms_version) on gwd.partner_terms to gwd_api;
create policy own_select on gwd.partner_terms for select to gwd_api using (participant_id = gwd.claim_sub());
-- terms can only be accepted for an approved application
create policy own_insert on gwd.partner_terms for insert to gwd_api with check (
  participant_id = gwd.claim_sub()
  and exists (select 1 from gwd.partner_applications a where a.participant_id = gwd.claim_sub() and a.kind = partner_terms.kind and a.status = 'APPROVED'));

grant select on gwd.referrals to gwd_api;
grant insert (participant_id, code) on gwd.referrals to gwd_api;
create policy own_select on gwd.referrals for select to gwd_api using (participant_id = gwd.claim_sub());
create policy own_insert on gwd.referrals for insert to gwd_api with check (participant_id = gwd.claim_sub());

-- A link exists only for: an approved affiliate (capability) who accepted the terms, on an ACTIVE affiliate programme.
grant select on gwd.referral_links to gwd_api;
grant insert (participant_id, offer_slug, campaign) on gwd.referral_links to gwd_api;
create policy own_select on gwd.referral_links for select to gwd_api using (participant_id = gwd.claim_sub());
create policy eligible_insert on gwd.referral_links for insert to gwd_api with check (
  participant_id = gwd.claim_sub()
  and exists (select 1 from gwd.participant_capabilities c where c.participant_id = gwd.claim_sub() and c.capability = 'AFFILIATE')
  and exists (select 1 from gwd.partner_terms t where t.participant_id = gwd.claim_sub() and t.kind = 'AFFILIATE')
  and exists (select 1 from gwd.offer_programs p where p.offer_slug = referral_links.offer_slug and p.kind = 'AFFILIATE' and p.status = 'ACTIVE'));

grant select on gwd.referral_clicks to gwd_api;
create policy own_select on gwd.referral_clicks for select to gwd_api using (
  exists (select 1 from gwd.referral_links l where l.id = referral_clicks.link_id and l.participant_id = gwd.claim_sub()));

-- Sales and accruals: read-only for the participant they belong to; written only by ARO reconciliation (service role).
grant select on gwd.attributed_sales, gwd.accrual_ledger to gwd_api;
create policy own_select on gwd.attributed_sales for select to gwd_api using (participant_id = gwd.claim_sub());
create policy own_select on gwd.accrual_ledger for select to gwd_api using (participant_id = gwd.claim_sub());

-- Public redirect: returns where to send the visitor (only for ACTIVE programmes) and records one click when p_record
-- (the API passes false for link previews and bots).
create function gwd.referral_click(p_link uuid, p_record boolean)
returns table (offer_slug text, campaign text, code text)
language plpgsql security definer set search_path = gwd, pg_temp as $$
begin
  return query
  with l as (
    select rl.id, rl.offer_slug, rl.campaign, r.code from gwd.referral_links rl
      join gwd.referrals r on r.participant_id = rl.participant_id
      join gwd.offer_programs p on p.offer_slug = rl.offer_slug and p.kind = 'AFFILIATE' and p.status = 'ACTIVE'
     where rl.id = p_link),
  ins as (insert into gwd.referral_clicks (link_id) select id from l where p_record returning 1)
  select l.offer_slug, l.campaign, l.code from l;
end $$;
revoke all on function gwd.referral_click(uuid, boolean) from public, anon, authenticated;
grant execute on function gwd.referral_click(uuid, boolean) to gwd_api;

-- Operators (gwd.operators, granted by Helena): review applications and set offer programmes.
create function gwd.is_operator() returns boolean language sql stable security definer set search_path = gwd, pg_temp as
$$ select exists (select 1 from gwd.operators o where o.participant_id = gwd.claim_sub()) $$;
revoke all on function gwd.is_operator() from public, anon, authenticated;
grant execute on function gwd.is_operator() to gwd_api;

create function gwd.ops_partner_applications()
returns table (id uuid, kind text, status text, market text, display_name text, channels text, motivation text,
               decision_note text, created_at timestamptz, reviewed_at timestamptz, learning_paths_completed bigint)
language plpgsql stable security definer set search_path = gwd, pg_temp as $$
begin
  if not gwd.is_operator() then raise exception 'operator only' using errcode = '42501'; end if;
  return query
  select a.id, a.kind, a.status, a.market, p.display_name, a.channels, a.motivation, a.decision_note, a.created_at, a.reviewed_at,
         (select count(*) from gwd.points_events e where e.participant_id = a.participant_id and e.event_key like 'academy:series:%')
    from gwd.partner_applications a join gwd.participants p on p.id = a.participant_id
   order by (a.status = 'SUBMITTED') desc, a.created_at desc;
end $$;
revoke all on function gwd.ops_partner_applications() from public, anon, authenticated;
grant execute on function gwd.ops_partner_applications() to gwd_api;

create function gwd.ops_review_partner_application(p_id uuid, p_decision text, p_note text)
returns boolean language plpgsql security definer set search_path = gwd, pg_temp as $$
declare a gwd.partner_applications;
begin
  if not gwd.is_operator() then raise exception 'operator only' using errcode = '42501'; end if;
  if p_decision not in ('APPROVED', 'REJECTED') then raise exception 'invalid decision' using errcode = '22023'; end if;
  update gwd.partner_applications set status = p_decision, decision_note = left(coalesce(p_note, ''), 500), reviewed_at = now()
   where id = p_id and status = 'SUBMITTED' returning * into a;
  if a.id is null then return false; end if;
  if p_decision = 'APPROVED' then
    insert into gwd.participant_capabilities (participant_id, capability)
    values (a.participant_id, case a.kind when 'AFFILIATE' then 'AFFILIATE' else 'AUTHORIZED_SELLER' end) on conflict do nothing;
  end if;
  insert into gwd.audit_events (participant_id, action) values (a.participant_id, 'partner.' || lower(a.kind) || '.' || lower(p_decision));
  return true;
end $$;
revoke all on function gwd.ops_review_partner_application(uuid, text, text) from public, anon, authenticated;
grant execute on function gwd.ops_review_partner_application(uuid, text, text) to gwd_api;

create function gwd.ops_set_offer_program(p_slug text, p_kind text, p_status text, p_conditions text)
returns boolean language plpgsql security definer set search_path = gwd, pg_temp as $$
begin
  if not gwd.is_operator() then raise exception 'operator only' using errcode = '42501'; end if;
  insert into gwd.offer_programs (offer_slug, kind, status, conditions, updated_at) values (p_slug, p_kind, p_status, coalesce(p_conditions, ''), now())
  on conflict (offer_slug, kind) do update set status = excluded.status, conditions = excluded.conditions, updated_at = now();
  return true;
end $$;
revoke all on function gwd.ops_set_offer_program(text, text, text, text) from public, anon, authenticated;
grant execute on function gwd.ops_set_offer_program(text, text, text, text) to gwd_api;

-- Pilot offers (Conversion Content OS, Social Content OS, Email Conversion Kit): listed, conditions pending.
-- They become ACTIVE only when an operator enters the conditions confirmed by the direction.
insert into gwd.offer_programs (offer_slug, kind) values
  ('conversion-content-os', 'AFFILIATE'), ('social-content-os', 'AFFILIATE'), ('email-conversion-kit', 'AFFILIATE')
on conflict do nothing;
commit;
-- ROLLBACK (no participant data outside these tables is touched):
-- begin;
-- drop function gwd.ops_set_offer_program(text, text, text, text); drop function gwd.ops_review_partner_application(uuid, text, text);
-- drop function gwd.ops_partner_applications(); drop function gwd.is_operator(); drop function gwd.referral_click(uuid, boolean);
-- drop policy own_select on gwd.accrual_ledger; drop policy own_select on gwd.attributed_sales;
-- revoke select on gwd.attributed_sales, gwd.accrual_ledger from gwd_api;
-- drop policy own_insert on gwd.referrals; drop policy own_select on gwd.referrals; revoke all on gwd.referrals from gwd_api;
-- alter table gwd.referrals drop constraint referrals_code_format; drop index gwd.referrals_participant_key;
-- drop table gwd.referral_clicks, gwd.referral_links, gwd.partner_terms, gwd.partner_applications, gwd.offer_programs;
-- drop policy own_insert on gwd.participant_capabilities;
-- create policy own_insert on gwd.participant_capabilities for insert to gwd_api with check (participant_id = (select auth.uid()));
-- drop function gwd.claim_sub();
-- commit;
