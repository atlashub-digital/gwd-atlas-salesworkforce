-- GWD Academy Streaming V1 — suplemento RLS (INSERT/UPDATE via trusted-server gwd_api)
-- A migration 2026-10-20-academy-v1.sql criou apenas policies de SELECT próprio;
-- o modelo do doc §4 exige INSERT/UPDATE via gwd_api na mesma transação da API
-- (set local role gwd_api + request.jwt.claim.sub). Sem estas policies, heartbeat/complete
-- falham com RLS violation. Escrita continua confinada à própria linha do participante.
-- Aplicar via Management API (service ops), como a migration original.

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

-- academy_quizzes ficou sem policy SELECT na migration original (doc §4: select público
-- para episódios publicados; respostas correctas nunca expostas pela API de catálogo).
create policy academy_quizzes_public_read on gwd.academy_quizzes
  for select using (exists (
    select 1 from gwd.academy_episodes e
    join gwd.academy_seasons sn on sn.id = e.season_id
    join gwd.academy_series s on s.id = sn.series_id
    where e.id = episode_id and e.published and s.status = 'PUBLISHED'));
