# MEDIA VPS — AS-IS (auditoria read-only, 2026-10-21)

Âmbito: inspeção só de leitura da VPS de media existente (acesso administrativo SSH, não é URL de entrega).
Nenhum serviço foi reiniciado, alterado ou recriado. Sem segredos neste documento.

## Ambiente
- Ubuntu 24.04.4, 8 vCPU, 15 GiB RAM, disco 309 GB (57% usado). Host partilhado com outros produtos (RSF, atendimento, AMF, n8n, levelab…): zero regressões exigidas.
- Edge público: contentor Caddy (`platform-edge`), portas 80/443. Firewall (ufw) só abre 22022/80/443 ao público.

## Serviços Atlas Media (systemd, Node 26, git local `atlas-media-v1`, último commit "G5 wiring live")
| Serviço | Porta interna | Função | Estado |
|---|---|---|---|
| atlas-media-gateway | 8120 | HLS multi-tenant, JWT Ed25519 (kid ring), auth em manifest+init+segmentos, rewrite de playlists com child tokens (Safari), CORS por tenant | ativo; sem token → 401 |
| atlas-media-catalog | 8121 | Emissor de tokens (`POST /token`) + adapter ARO (`/v1/entitlements/resolve`) | ativo; ARO configurado só para o projeto `atlas-club` |
| atlas-media-ingest | — | watch-folder + SHA-256 + dispatch para transcode | ativo |
| worker/transcode | — | ladder HLS fMP4 360p/540p/720p | — |
| atlas-media-telegram | 8122 | Binding tokens 256-bit single-use TTL 10 min; invite single-use via tg-ops (MTProto) | ativo; bot `@DianaGWDbot`, canal de entrega configurado |

**Nenhuma destas portas está exposta ao público** (nem pelo Caddy nem pelo ufw). Só existe rota pública para o gateway RSF (outro produto).

## Contrato `/token` (verificado no código)
`POST /token {tenant, asset_id, entitlement_ref, aro:{project, customer_id | identity:{email}}}`
→ verifica que `hls/<tenant>/<asset_id>/master.m3u8` existe → ARO resolve server-side → ALLOW se existe entitlement `key === entitlement_ref` e `status === ACTIVE`.
- 200 `{token, expires_at, url:"/media/<tenant>/<asset_id>/master.m3u8"}` (TTL 300 s; claims `iss, aud, sub=customer_id, tenant, asset_id, scope=play, exp, jti`; sem PII)
- 403 `entitlement_denied` · 404 `asset_not_found` · 502 `aro_unavailable` · 400 campos em falta
- Gateway: `GET /media/<tenant>/<asset>/<path>?t=<token>`, Range/206 suportado.

## Assets piloto (tenant `gwd`) — correspondência confirmada
| Piloto | ID | Tipo de ID | HLS | Duração |
|---|---|---|---|---|
| EP01 | 01K5D8HGF18YCW2KO6VW | `asset_id` do Atlas Media (diretório de storage) | 360/540/720p | 10 s |
| EP02 | 01K5DB09D1XJY0H2O3HU | `asset_id` | 360/540/720p | 12 s |
| EP03 | 01K5DB09D7WTZIGIIJX1G | `asset_id` | 360/540/720p | 12 s |
| EP04 | — | provider TELEGRAM (binding + invite) | n/a | n/a |

Os IDs são **asset_ids**, não episode_ids nem `access_policy_ref`. Não existe um serviço de "catálogo" com listagem: o catalog é apenas emissor de tokens; a lista de assets é o storage.
**Os três assets são clipes de teste (10–12 s; originais ≈3 MB no total), não episódios reais.**

## Testes reais executados (suite existente `test/g3_test.js`, servidor→servidor)
10/10 PASS: ALLOW com entitlement ativo → token; DENY ref desconhecida → 403 sem token; DENY participante sem entitlement → 403; playback master 200 nos 3 assets; segmentos 206 com Range.
Entitlement de teste usado: `gwd.academy.series:TEST-SERIES-01` (identidade de teste e2e).

## Telegram EP04
3 bindings de teste consumidos (2026-10-20), 1 invite single-use criado com sucesso; replay corretamente recusado (409).
Boundary servidor existe e funciona em teste. Não existe ainda ligação GWD → `/binding/start`.

## Bloqueios para G4 no browser (decisão Helena)
1. Gateway e `/token` sem exposição pública → o player da Academy (Vercel) não consegue obter HLS. Precisa de rota no edge (ex.: `media.<domínio>` → gateway) e de acesso server-to-server da API GWD ao `/token`.
2. CORS do tenant `gwd` só permite `*.gwd.atlashub.si` e `novidades.store`; faltam `goworld.digital`, `app.goworld.digital` e os previews.
3. ARO do catalog só tem chave do projeto `atlas-club`; o GWD não deve misturar-se com o Atlas Club → falta projeto/chave ARO `gwd`.
4. Media real: só existem clipes de teste; faltam os episódios reais ingeridos.
