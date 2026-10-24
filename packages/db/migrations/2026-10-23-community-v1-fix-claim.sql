-- GWD Community V1 — fix (23/10/2026): gwd.community_can_access() failed in production with
-- 42501 "permission denied for schema auth". A LANGUAGE sql body is re-parsed on every call, so its
-- reference to auth.uid() needs USAGE on schema auth, which the production gwd_api role does not have
-- (RLS policies are unaffected: their expressions are stored already resolved).
-- The function now reads the same verified claim the API sets per transaction (request.jwt.claim.sub),
-- exactly what auth.uid() returns in this trusted-server model. Same signature, same grants, no data change.
-- REVIEW PROPOSAL: Helena applies after backup. Rollback: re-run the function block of 2026-10-23-community-v1.sql.
begin;
create or replace function gwd.community_can_access(space text) returns boolean language sql stable security invoker set search_path = '' as $$
 select exists (select 1 from gwd.community_memberships m
                 where m.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid)
   and exists (select 1 from gwd.community_spaces s where s.id = space and not s.archived and (s.required_capability is null
     or exists (select 1 from gwd.participant_capabilities pc
                 where pc.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
                   and pc.capability = s.required_capability)))
$$;
revoke execute on function gwd.community_can_access(text) from public, anon, authenticated;
grant execute on function gwd.community_can_access(text) to gwd_api;
commit;
