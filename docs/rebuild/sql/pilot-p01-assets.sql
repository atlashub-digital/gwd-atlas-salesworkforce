-- PILOTO P01 v3 — NÃO APLICAR sem GO (Diana). Aplicação: Helena, com backup do schema gwd.
-- Isolado: cria UM episódio de teste NÃO PUBLICADO na série gwd-start e liga-lhe um clip de teste do Atlas Media.
-- Os episódios reais do curso não são alterados; o clip nunca aparece no catálogo nem conta para a conclusão da série.
-- Só abre para participantes de teste listados em gwd.academy_preview_participants (RLS + API).
-- Só dados (sem DDL), idempotente. Pré-requisitos: migração 2026-10-23-academy-preview.sql e API com previewAllowed().
-- Substituir <TEST_EMAIL_A>/<TEST_EMAIL_B> pelos emails das contas de teste autorizadas (fora do Git).
begin;
with target as (
  select sn.id as season_id from gwd.academy_seasons sn
  join gwd.academy_series s on s.id = sn.series_id and s.slug = 'gwd-start' where sn.position = 1),
ep as (
  insert into gwd.academy_episodes(season_id, slug, position, title, summary, episode_type, access_tier, policy_key, delivery_mode, duration_seconds, published)
  select season_id, 'teste-media-p01', 900, 'Teste técnico de vídeo (P01)', 'Episódio interno de verificação do Atlas Media. Não é conteúdo do curso.',
         'VIDEO', 'FREE', 'VIDEO_STANDARD_V1', 'WEBPLAYER', 12, false
  from target
  on conflict (season_id, slug) do update set published = false
  returning id)
insert into gwd.academy_episode_assets(episode_id, kind, provider, asset_ref, access_policy_ref, metadata, position)
select ep.id, 'VIDEO', 'ATLAS_MEDIA', '01K5D8HGF18YCW2KO6VW', 'gwd.academy.series:gwd-start',
       jsonb_build_object('pilot','P01','note','clip de teste 10–12 s','durationSeconds',12), 1
from ep
where not exists (select 1 from gwd.academy_episode_assets x where x.episode_id = ep.id and x.metadata->>'pilot' = 'P01');
insert into gwd.academy_preview_participants(participant_id, note)
select p.id, 'pilot P01 test account' from gwd.participants p join auth.users u on u.id = p.id
 where lower(u.email) in (lower('<TEST_EMAIL_A>'), lower('<TEST_EMAIL_B>'))
on conflict do nothing;
-- Verificação esperada: 1 episódio não publicado com 1 vídeo ATLAS_MEDIA ativo + contas de teste listadas.
select e.slug, e.published, a.asset_ref from gwd.academy_episodes e join gwd.academy_episode_assets a on a.episode_id = e.id where e.slug = 'teste-media-p01';
rollback; -- trocar por commit apenas após GO
-- ROLLBACK após commit: begin; delete from gwd.academy_episodes where slug = 'teste-media-p01';
--   delete from gwd.academy_preview_participants where note = 'pilot P01 test account'; commit;  (os assets caem em cascata)
