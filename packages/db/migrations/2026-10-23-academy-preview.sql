-- GWD Academy — preview grants for specific unpublished episodes (23/10/2026, rev. 2).
-- Purpose: technical pilots (Atlas Media clip P01, Telegram Native P02) live in UNPUBLISHED episodes. Each grant opens
-- ONE episode (and only its assets) to ONE participant. Other drafts stay invisible, even to the same participant.
-- Unpublished episodes are never listed by the catalogue API and never count towards series completion.
-- Additive: one table + two permissive SELECT policies; existing policies are unchanged.
-- Caller identity = the claim the API sets per transaction from the Supabase-verified user (never client input).
-- REVIEW PROPOSAL: Helena applies after backup. Rollback at the end of this file.
begin;
create table gwd.academy_preview_grants (
 participant_id uuid not null references gwd.participants(id) on delete cascade,
 episode_id uuid not null references gwd.academy_episodes(id) on delete cascade,
 note text not null default '' check (char_length(note) <= 200),
 created_at timestamptz not null default now(),
 primary key (participant_id, episode_id)
);
alter table gwd.academy_preview_grants enable row level security;
revoke all on gwd.academy_preview_grants from public, anon, authenticated;
grant select on gwd.academy_preview_grants to gwd_api;     -- grants are created by operators only
create policy preview_grant_own_read on gwd.academy_preview_grants for select to gwd_api
 using (participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

create policy academy_episodes_preview_read on gwd.academy_episodes for select to gwd_api using (
 not published
 and exists (select 1 from gwd.academy_preview_grants g
              where g.episode_id = academy_episodes.id and g.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid)
 and exists (select 1 from gwd.academy_seasons sn join gwd.academy_series s on s.id = sn.series_id where sn.id = academy_episodes.season_id and s.status = 'PUBLISHED'));
create policy academy_assets_preview_read on gwd.academy_episode_assets for select to gwd_api using (exists (
 select 1 from gwd.academy_preview_grants g join gwd.academy_episodes e on e.id = g.episode_id
  where g.episode_id = academy_episode_assets.episode_id and not e.published
    and g.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid));
commit;
-- ROLLBACK:
-- begin; drop policy academy_assets_preview_read on gwd.academy_episode_assets; drop policy academy_episodes_preview_read on gwd.academy_episodes;
-- drop table gwd.academy_preview_grants; commit;
