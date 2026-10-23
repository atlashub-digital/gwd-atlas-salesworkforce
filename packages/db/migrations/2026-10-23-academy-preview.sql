-- GWD Academy — preview access for unpublished episodes (23/10/2026).
-- Purpose: test media clips (pilot P01) live in an UNPUBLISHED episode that only listed test participants can open.
-- Unpublished episodes are never listed by the catalogue API and never count towards series completion.
-- Additive: one table + two permissive SELECT policies; existing policies are unchanged.
-- Caller identity = the claim the API sets per transaction (no dependency on schema auth; see community fix).
-- REVIEW PROPOSAL: Helena applies after backup. Rollback at the end of this file.
begin;
create table gwd.academy_preview_participants (
 participant_id uuid primary key references gwd.participants(id) on delete cascade,
 note text not null default '' check (char_length(note) <= 200),
 created_at timestamptz not null default now()
);
alter table gwd.academy_preview_participants enable row level security;
revoke all on gwd.academy_preview_participants from public, anon, authenticated;
grant select on gwd.academy_preview_participants to gwd_api;     -- membership is granted by operators only
create policy preview_own_read on gwd.academy_preview_participants for select to gwd_api
 using (participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

create policy academy_episodes_preview_read on gwd.academy_episodes for select to gwd_api using (
 not published
 and exists (select 1 from gwd.academy_preview_participants p where p.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid)
 and exists (select 1 from gwd.academy_seasons sn join gwd.academy_series s on s.id = sn.series_id where sn.id = season_id and s.status = 'PUBLISHED'));
create policy academy_assets_preview_read on gwd.academy_episode_assets for select to gwd_api using (exists (
 select 1 from gwd.academy_episodes e
 where e.id = episode_id and not e.published
   and exists (select 1 from gwd.academy_preview_participants p where p.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid)));
commit;
-- ROLLBACK:
-- begin; drop policy academy_assets_preview_read on gwd.academy_episode_assets; drop policy academy_episodes_preview_read on gwd.academy_episodes;
-- drop table gwd.academy_preview_participants; commit;
