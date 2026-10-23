-- PILOTO P02 Telegram Native — v2 (23/10/2026). Direitos: confirmados pela direção do projeto (licença dos criadores para
-- este piloto; âmbito registado pela Helena). Uso limitado ao piloto: episódios NÃO PUBLICADOS, só contas de teste.
-- Pré-requisitos: 2026-10-23-academy-preview.sql (rev. 2) e 2026-10-23-academy-preview-quiz.sql aplicados.
-- Aplicação: Helena, com backup do schema gwd. Substituir <QUIZ_n> e <TEST_EMAIL_A/B> fora do Git.
-- Cria 3 episódios NÃO PUBLICADOS na série gwd-start, cada um ligado a UMA mensagem de vídeo do canal privado de formação.
-- A GWD guarda só o link da mensagem (t.me/c/<canal>/<mensagem>); não copia, extrai nem retransmite o vídeo.
-- Conclusão: TELEGRAM_QUIZ_VERIFIED_V1 (handoff registado + quiz aprovado). Abrir o Telegram não conclui o episódio.
-- <QUIZ_n>: JSON [{"id":"q1","prompt":"…","options":["…","…","…"],"correctIndex":0}, …] (3–5 perguntas sobre a aula).
begin;
with target as (
  select sn.id as season_id from gwd.academy_seasons sn
  join gwd.academy_series s on s.id = sn.series_id and s.slug = 'gwd-start' where sn.position = 1),
pilot(slug, position, title, msg_url) as (values
  ('teste-telegram-p02-1', 901, 'Piloto Telegram · Apresentação', 'https://t.me/c/4305862304/326'),
  ('teste-telegram-p02-2', 902, 'Piloto Telegram · Conversas com o cliente', 'https://t.me/c/4305862304/334'),
  ('teste-telegram-p02-3', 903, 'Piloto Telegram · Porquê usar o BotConversa', 'https://t.me/c/4305862304/328')),
eps as (
  insert into gwd.academy_episodes(season_id, slug, position, title, summary, episode_type, access_tier, policy_key, delivery_mode, published)
  select t.season_id, p.slug, p.position, p.title, 'Piloto Telegram Native: a aula abre no canal privado de formação.',
         'VIDEO', 'FREE', 'TELEGRAM_QUIZ_VERIFIED_V1', 'TELEGRAM', false
  from target t cross join pilot p
  on conflict (season_id, slug) do update set published = false, title = excluded.title
  returning id, slug)
insert into gwd.academy_episode_assets(episode_id, kind, provider, asset_ref, metadata, position)
select eps.id, 'TELEGRAM', 'TELEGRAM', p.msg_url, jsonb_build_object('pilot','P02','title','Canal de formação'), 1
from eps join pilot p on p.slug = eps.slug
where not exists (select 1 from gwd.academy_episode_assets x where x.episode_id = eps.id and x.metadata->>'pilot' = 'P02');
-- Um quiz por episódio (o QUIZ_VERIFIED exige-o). Versão 1; reaplicar não duplica.
insert into gwd.academy_quizzes(episode_id, version, questions, pass_threshold)
select e.id, 1, q.questions::jsonb, 80.00
from (values ('teste-telegram-p02-1', '<QUIZ_1>'), ('teste-telegram-p02-2', '<QUIZ_2>'), ('teste-telegram-p02-3', '<QUIZ_3>')) q(slug, questions)
join gwd.academy_episodes e on e.slug = q.slug
on conflict (episode_id, version) do nothing;
insert into gwd.academy_preview_grants(participant_id, episode_id, note)
select p.id, e.id, 'pilot P02' from gwd.participants p join auth.users u on u.id = p.id
 cross join gwd.academy_episodes e
 where e.slug like 'teste-telegram-p02-%' and lower(u.email) in (lower('<TEST_EMAIL_A>'), lower('<TEST_EMAIL_B>'))
on conflict do nothing;
rollback; -- trocar por commit apenas depois de preencher os quizzes
-- ROLLBACK após commit: begin; delete from gwd.academy_episodes where slug like 'teste-telegram-p02-%'; commit;
