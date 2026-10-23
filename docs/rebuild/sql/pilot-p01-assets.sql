-- PILOTO P01 v2 — NÃO APLICAR sem GO (Diana: mapeamento editorial). Aplicação: Helena, com backup do schema gwd.
-- Liga os três assets piloto do Atlas Media (tenant gwd) aos episódios GWD Start com vídeo.
-- ATENÇÃO: os assets atuais são CLIPS DE TESTE (10–12 s); substituir pelos asset_id dos episódios reais quando ingeridos.
-- Só dados (sem DDL). Os vídeos demo-* ficam marcados como substituídos (superseded_at), não apagados.
-- Pré-requisito no código: API >= 4595473+ (assetsForEpisodes filtra superseded_at; header S2S).
begin;
with targets(episode_slug, asset_id, code) as (values
  ('boas-vindas-gwd',        '01K5D8HGF18YCW2KO6VW',  'EP01'),
  ('tres-caminhos',          '01K5DB09D1XJY0H2O3HU',  'EP02'),
  ('rotina-de-aprendizagem', '01K5DB09D7WTZIGIIJX1G', 'EP03')),
eps as (select e.id, t.asset_id, t.code from targets t
  join gwd.academy_episodes e on e.slug = t.episode_slug
  join gwd.academy_seasons sn on sn.id = e.season_id
  join gwd.academy_series s on s.id = sn.series_id and s.slug = 'gwd-start'),
superseded as (update gwd.academy_episode_assets a set superseded_at = now()
  from eps where a.episode_id = eps.id and a.kind = 'VIDEO' and a.asset_ref like 'demo-video-%' and a.superseded_at is null
  returning a.episode_id)
insert into gwd.academy_episode_assets(episode_id, kind, provider, asset_ref, access_policy_ref, metadata, position)
select eps.id, 'VIDEO', 'ATLAS_MEDIA', eps.asset_id, 'gwd.academy.series:gwd-start',
       jsonb_build_object('pilot','P01','code',eps.code,'note','clip de teste'), 1
from eps
where not exists (select 1 from gwd.academy_episode_assets x where x.episode_id = eps.id and x.metadata->>'pilot' = 'P01'); -- idempotente
-- Verificação esperada: 3 linhas ATLAS_MEDIA ativas e 0 vídeos demo ativos nesses episódios.
select e.slug, a.asset_ref, a.superseded_at is null as active from gwd.academy_episode_assets a
  join gwd.academy_episodes e on e.id = a.episode_id
 where e.slug in ('boas-vindas-gwd','tres-caminhos','rotina-de-aprendizagem') and a.kind = 'VIDEO' order by 1, 3 desc;
rollback; -- trocar por commit apenas após GO
-- ROLLBACK após commit:
-- begin; delete from gwd.academy_episode_assets where metadata->>'pilot' = 'P01';
-- update gwd.academy_episode_assets set superseded_at = null where kind='VIDEO' and asset_ref like 'demo-video-%'
--   and episode_id in (select id from gwd.academy_episodes where slug in ('boas-vindas-gwd','tres-caminhos','rotina-de-aprendizagem')); commit;
