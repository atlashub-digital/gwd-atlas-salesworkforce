-- GWD Academy — quizzes of preview-granted episodes (23/10/2026). Complements 2026-10-23-academy-preview.sql (rev. 2).
-- Defect: academy_quizzes_public_read only exposes quizzes of PUBLISHED episodes. In an unpublished pilot episode
-- (P02 Telegram, TELEGRAM_QUIZ_VERIFIED_V1) the API could not read the quiz, so submit failed ("sem quiz") and the
-- fail-closed policy made the episode impossible to complete.
-- Fix: one permissive SELECT policy, same rule as academy_assets_preview_read (grant for THAT episode, caller = claim
-- set by the API from the Supabase-verified user). Correct answers stay server-side (the catalogue API strips them).
-- Additive; existing policies unchanged. REVIEW PROPOSAL: Helena applies after backup. Rollback at the end.
begin;
create policy academy_quizzes_preview_read on gwd.academy_quizzes for select to gwd_api using (exists (
 select 1 from gwd.academy_preview_grants g join gwd.academy_episodes e on e.id = g.episode_id
  where g.episode_id = academy_quizzes.episode_id and not e.published
    and g.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid));
commit;
-- ROLLBACK:
-- begin; drop policy academy_quizzes_preview_read on gwd.academy_quizzes; commit;
