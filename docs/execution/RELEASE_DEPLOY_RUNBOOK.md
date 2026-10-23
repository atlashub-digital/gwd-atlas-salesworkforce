# RELEASE & DEPLOY RUNBOOK — GWD (23/10/2026)

Princípio: cada serviço corre de um **SHA imutável**, com health verificado antes de receber tráfego e rollback num comando. Nunca de uma workspace de agente.

## 1. Frontends (Vercel)
| Projeto | Domínio | Deploy | Rollback |
|---|---|---|---|
| `gwd` (apps/web) | goworld.digital | preview por push; produção por **redeploy do preview com target production** (reconstrói com env Production) | Vercel → Instant Rollback para o deployment anterior (IDs em `STATUS_LIVE.md`) |
| `gwd-app` (apps/app) | app.goworld.digital | idem | idem |
Ordem: API compatível **primeiro**, frontends depois (a app nunca chama rotas que a API publicada não tenha).

## 2. API e worker (VPS atlaslab, Docker + Caddy)
Release dir: `/opt/gwd/releases/<sha>` (só leitura para o contentor). Env: ficheiro root-only 600 no host (fora de Git; mesmas chaves do contentor atual: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, opcionais `ATLAS_MEDIA_*`, `COMMUNITY_*_URL`). Valores nunca em Git nem em logs.

```bash
SHA=<commit>; R=/opt/gwd/releases/$SHA
git -C /root/work/gwd archive $SHA | (mkdir -p $R && tar -x -C $R)
docker run --rm -v $R:/repo -w /repo node:22-slim sh -c "corepack enable && pnpm install --frozen-lockfile"
docker run -d --name gwd-api-$SHA --restart unless-stopped --network edge --env-file <env-file-600> \
  -v $R:/repo:ro -w /repo/apps/api node:22-slim sh -c "exec ./node_modules/.bin/tsx src/server.ts"
docker exec gwd-api-$SHA node -e "fetch('http://localhost:8080/ready').then(r=>process.exit(r.ok?0:1))"   # tem de passar
```
Corte (blue/green): em `/opt/platform/caddy/sites/api-goworld.caddy` trocar `reverse_proxy gwd-api:8080` → `reverse_proxy gwd-api-<sha>:8080`, depois `docker exec platform-caddy caddy reload --config /etc/caddy/Caddyfile`. Verificar `https://api.goworld.digital/health` e `/ready`.
**Rollback:** repor a linha anterior no site Caddy + `caddy reload` (o contentor antigo continua a correr até à validação; só depois `docker stop`).
Worker: mesmo padrão (`gwd-worker-<sha>`, sem Caddy).

## 3. Migrações de DB (GWD Supabase GWD)
Só migrações **aditivas**, revistas, com backup imediatamente antes:
1. Backup lógico do schema `gwd` (`pg_dump -n gwd`) ou PITR snapshot do Supabase — guardar ID/ficheiro.
2. Aplicar o ficheiro em `packages/db/migrations/` numa transação (os ficheiros já têm `begin/commit`).
3. Verificar com `/ready` e o teste de fumo da secção 4.
4. Rollback: bloco `ROLLBACK` no fim de cada migração (ou restore do backup).
Pendente: `2026-10-23-community-v1.sql` (Helena — sem acesso do Claude Code ao projeto Supabase GWD).

## 4. Teste de fumo após cada release
`/health`, `/ready`, `/v1/feature-flags`; com uma conta de teste real: `/v1/me`, `/v1/academy/series`, `/v1/academy/progress?series=gwd-start`, `/v1/community/spaces` (após a migração), e no browser `app.goworld.digital` 1440/390.

## 5. Gates que nunca abrem por release
Pagamentos/PIX/payouts (`aroProduction`, `payouts` = false), Telegram MTProto, media sem tenant `gwd`. Ver `docs/rebuild/RELEASE_GATES.md`.
