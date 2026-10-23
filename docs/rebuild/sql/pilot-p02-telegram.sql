-- PILOTO P02 Telegram Native — NÃO APLICAR sem: (1) URLs completos das mensagens selecionadas, (2) confirmação de
-- direitos de utilização, (3) GO da Diana. Aplicação: Helena, com backup do schema gwd.
-- Cria até 3 episódios NÃO PUBLICADOS na série gwd-start, cada um ligado a UMA mensagem de vídeo do canal privado de formação.
-- A GWD guarda só o link da mensagem (t.me/c/<canal>/<mensagem>); não copia, extrai nem retransmite o vídeo.
-- Conclusão: TELEGRAM_QUIZ_VERIFIED_V1 (handoff registado + quiz aprovado). Abrir o Telegram não conclui o episódio.
-- Visível só às contas de teste com concessão para cada episódio (gwd.academy_preview_grants).
-- Substituir <MSG_URL_n>, <TITULO_n>, <PERGUNTA…>, <TEST_EMAIL_A/B> fora do Git.
begin;
with target as (
  select sn.id as season_id from gwd.academy_seasons sn
  join gwd.academy_series s on s.id = sn.series_id and s.slug = 'gwd-start' where sn.position = 1),
pilot(slug, position, title, msg_url) as (values
  ('teste-telegram-p02-1', 901, '<TITULO_1>', '<MSG_URL_1>'),
  ('teste-telegram-p02-2', 902, '<TITULO_2>', '<MSG_URL_2>')),
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
-- Quiz por episódio (o QUIZ_VERIFIED exige-o): ver docs/execution/CONTENT_CONTRACT_GWD_START.md §5 — inserir em gwd.academy_quizzes.
insert into gwd.academy_preview_grants(participant_id, episode_id, note)
select p.id, e.id, 'pilot P02' from gwd.participants p join auth.users u on u.id = p.id
 cross join gwd.academy_episodes e
 where e.slug like 'teste-telegram-p02-%' and lower(u.email) in (lower('<TEST_EMAIL_A>'), lower('<TEST_EMAIL_B>'))
on conflict do nothing;
rollback; -- trocar por commit apenas após GO
-- ROLLBACK após commit: begin; delete from gwd.academy_episodes where slug like 'teste-telegram-p02-%'; commit;
