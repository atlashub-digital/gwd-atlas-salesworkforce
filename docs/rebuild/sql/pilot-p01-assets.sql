-- PROPOSTA — NÃO APLICAR sem GO (Diana: mapeamento editorial; Helena: entitlement/ARO).
-- Liga os três assets piloto do Atlas Media a episódios GWD Start (WEBPLAYER) e o EP04 ao Telegram.
-- Os assets atuais são CLIPS DE TESTE (10–12 s); substituir pelos asset_id dos episódios reais quando ingeridos.
-- Rollback: delete from gwd.academy_episode_assets where provider in ('ATLAS_MEDIA','TELEGRAM') and asset_ref in (...);
begin;
insert into gwd.academy_episode_assets(episode_id, kind, provider, asset_ref, access_policy_ref, metadata, position)
select e.id, 'VIDEO', 'ATLAS_MEDIA', v.asset_id, v.policy, jsonb_build_object('pilot','P01','code',v.code), 0
from (values
  ('boas-vindas-gwd',  '01K5D8HGF18YCW2KO6VW', 'EP01', 'gwd.academy.series:gwd-start'),
  ('tres-caminhos',    '01K5DB09D1XJY0H2O3HU', 'EP02', 'gwd.academy.series:gwd-start'),
  ('rotina-de-aprendizagem','01K5DB09D7WTZIGIIJX1G','EP03','gwd.academy.series:gwd-start')
) as v(episode_slug, asset_id, code, policy)
join gwd.academy_episodes e on e.slug = v.episode_slug;
-- EP04: o episódio Telegram mantém delivery_mode TELEGRAM; o canal/binding é configuração do telegram-provider (Helena).
rollback; -- trocar por commit apenas após GO
