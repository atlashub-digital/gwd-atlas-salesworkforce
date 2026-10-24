-- GWD leads V2 (24/10/2026): newsletter consent + unsubscribe, landing attribution, operator funnel (aggregates only).
-- Additive. REVIEW PROPOSAL: Helena applies after backup. Rollback at the end.
-- Identity: the API sets request.jwt.claim.sub per transaction from the Supabase-verified user (never client input).
-- No function body references auth.* (production gwd_api has no USAGE on schema auth).
begin;
alter table gwd.leads
  add column marketing_consent_at timestamptz,
  add column unsubscribed_at timestamptz,
  add column unsubscribe_token uuid not null default gen_random_uuid(),
  add column landing_path text check (char_length(landing_path) <= 200),
  add column referrer_host text check (char_length(referrer_host) <= 200);
create unique index leads_unsubscribe_token_key on gwd.leads (unsubscribe_token);
-- the API writes these on insert only (ids, tokens and timestamps stay server-side)
grant insert(name, email, market, interest, source, utm, marketing_consent_at, landing_path, referrer_host) on gwd.leads to gwd_api;

-- Unsubscribe by opaque token (link in every newsletter email). Idempotent; reveals nothing about the lead.
create function gwd.lead_unsubscribe(p_token uuid) returns boolean
language sql security definer set search_path = gwd, pg_temp as $$
  with u as (update gwd.leads set unsubscribed_at = coalesce(unsubscribed_at, now()) where unsubscribe_token = p_token returning 1)
  select exists (select 1 from u);
$$;
revoke all on function gwd.lead_unsubscribe(uuid) from public, anon, authenticated;
grant execute on function gwd.lead_unsubscribe(uuid) to gwd_api;

-- Operators (granted by Helena, never by the app). Only they can read the funnel.
create table gwd.operators (
  participant_id uuid primary key references gwd.participants(id) on delete cascade,
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);
alter table gwd.operators enable row level security;
revoke all on gwd.operators from public, anon, authenticated;
grant select on gwd.operators to gwd_api;
create policy operator_own_read on gwd.operators for select to gwd_api
  using (participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

-- Funnel by day × source × campaign × market × interest. Aggregates only: no names, emails or ids leave the function.
create function gwd.ops_lead_funnel(p_days integer)
returns table(day date, source text, campaign text, market text, interest text,
              leads bigint, newsletter bigint, unsubscribed bigint, participants bigint, onboarded bigint, academy_started bigint)
language plpgsql stable security definer set search_path = gwd, pg_temp as $$
begin
  if not exists (select 1 from gwd.operators o where o.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid) then
    raise exception 'operator only' using errcode = '42501';
  end if;
  return query
  select l.created_at::date, l.source, coalesce(nullif(l.utm->>'utm_campaign', ''), '(sem campanha)'), l.market, l.interest,
         count(*), count(l.marketing_consent_at) filter (where l.unsubscribed_at is null), count(l.unsubscribed_at),
         count(p.id), count(p.id) filter (where p.onboarding_completed),
         count(p.id) filter (where exists (select 1 from gwd.academy_episode_progress ep where ep.participant_id = p.id))
    from gwd.leads l left join gwd.participants p on p.lead_id = l.id
   where l.created_at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
   group by 1, 2, 3, 4, 5
   order by 1 desc, 6 desc;
end $$;
revoke all on function gwd.ops_lead_funnel(integer) from public, anon, authenticated;
grant execute on function gwd.ops_lead_funnel(integer) to gwd_api;
commit;
-- ROLLBACK:
-- begin; drop function gwd.ops_lead_funnel(integer); drop table gwd.operators; drop function gwd.lead_unsubscribe(uuid);
-- drop index gwd.leads_unsubscribe_token_key;
-- alter table gwd.leads drop column referrer_host, drop column landing_path, drop column unsubscribe_token,
--   drop column unsubscribed_at, drop column marketing_consent_at; commit;
