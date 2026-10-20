# GWD Academy Streaming V1 — Data Model & Contracts (GATE REVIEW)

Status: DESIGN PROPOSAL — NENHUMA migration aplicada
Autor: Diana (nov-diana) · Fontes: Drive `08_ACADEMY_STREAMING_SYSTEM` (GAMIFICATION V1, HYBRID DELIVERY V1, DATA_MODEL_DELTA_V1.sql, MISSION), ordem PDG 2026-10-20, `packages/db/schema.sql` actual.
Base proposta: `GWD_ACADEMY_DATA_MODEL_DELTA_V1.sql` (Drive) + ajustes abaixo justificados.

---

## 1. Princípios

1. **Truth hierarchy** (GAMIFICATION §Truth): autoritativo = `academy_episode_progress`, `academy_learning_events`, `points_events`, `participant_capabilities`, `participant_badges`. Derivado = progresso de série, level, streak, dashboards. UI-local nunca é truth.
2. **Episode identity independente do provider** — progresso e entitlement ligam a `episode_id`; trocar TELEGRAM→ATLAS_MEDIA nunca toca progresso/entitlement.
3. **ARO é a autoridade de entitlement Premium.** GWD nunca guarda `paid=true` como verdade.
4. **Badge ≠ Capability.** Capability só via regra real com registo auditável.
5. **XP nunca por pagamento/compra; tudo idempotente.**

## 2. Schema delta (novas tabelas; existentes reutilizadas sem alteração de shape)

Base = SQL do Drive, com estes ajustes:

### 2.1 `gwd.academy_series` / `gwd.academy_seasons` / `gwd.academy_episodes`
Como na proposta do Drive (slug/title/status/access_tier/entitlement_ref; seasons com position; episodes com episode_type, access_tier, completion_policy, duration_seconds, published).
**Ajuste 1 — delivery no episódio** (exigido por HYBRID §Delivery model):
```sql
alter table gwd.academy_episodes add column delivery_mode text not null default 'WEBPLAYER'
  check (delivery_mode in ('WEBPLAYER','WEBREADER','HYBRID','TELEGRAM','EXTERNAL'));
```
**Ajuste 2 — índices de leitura pública:**
```sql
create index on gwd.academy_series (status, featured);
create index on gwd.academy_episodes (season_id, position) where published;
create index on gwd.academy_episode_progress (participant_id, status);
create index on gwd.academy_learning_events (participant_id, created_at desc);
```

### 2.2 `gwd.academy_episode_assets`
Como na proposta: `kind ∈ (VIDEO, READER, WORKBOOK, POSTER, SUBTITLES, TELEGRAM, RESOURCE)`, `provider ∈ (ATLAS_MEDIA, GWD_READER, TELEGRAM, EXTERNAL)`, `asset_ref` opaco por provider, `metadata jsonb`.
**Ajuste 3 — identidade técnica ≠ direito de acesso:** `asset_ref` (para ATLAS_MEDIA, o `media_asset_id` imutável) é identidade **técnica** e NÃO é entitlement. O direito de acesso do asset/recurso é referenciado à parte:
```sql
alter table gwd.academy_episode_assets add column access_policy_ref text;
```
Semântica: `media_asset_id` = onde está/como se serve; `access_policy_ref` (ou o `entitlement_ref` do episódio/série) = quem pode. Trocar/reencodar/superseder um asset **não altera o entitlement adquirido** — o entitlement referencia `gwd.academy.series:{series_id}` / episódio, nunca o asset.
**Ajuste 3b — migração de provider:** trocar provider = UPDATE nesta tabela (novo asset_ref + provider); `episode_id`, progresso e entitlement ficam intactos. Histórico: `superseded_at timestamptz` + `superseded_by uuid` (self-ref) para auditoria.
**Ownership:** Atlas Media NÃO conhece series/seasons/episodes como domínio próprio — são domínio exclusivo da GWD Academy; o Atlas Media só é referenciado via `media_asset_id` imutável.

### 2.3 `gwd.academy_episode_progress`
Como na proposta: PK (participant_id, episode_id); status ∈ NOT_STARTED/IN_PROGRESS/COMPLETED; last_position_seconds, engaged_seconds, progress_percent (0–100), completion_method, first/last/completed_at.
**Ajuste 4 — reader fields** (WebReader precisa de posição de leitura, não segundos):
```sql
alter table gwd.academy_episode_progress
  add column last_reader_section integer,
  add column active_reading_seconds integer not null default 0;
```
Regra de completion (server-authoritative, implementada na API):
- VIDEO: `position >= 90% AND engaged >= 80%` (ou ended com engagement suficiente); **seek-to-final NUNCA completa sozinho** (engaged-time gate).
- READER: `>= 90% progressão AND active_reading_seconds >= mínimo configurável`.
- HYBRID: policy ANY | BOTH | QUIZ (default ANY; certified → QUIZ).
- TELEGRAM/EXTERNAL: nunca auto-completa; `TELEGRAM_HANDOFF_OPENED` registado; conclusão via SELF_ATTESTED | QUIZ_VERIFIED | MANUAL_REVIEW | NONE. Capability/certificação-critical → QUIZ_VERIFIED.

### 2.4 `gwd.academy_learning_events`
Como na proposta (ledger durável, event_key unique para idempotência). Event types V1: EPISODE_STARTED, VIDEO_COMPLETED, READER_STARTED, READER_COMPLETED, TELEGRAM_HANDOFF_OPENED, EXTERNAL_COMPLETION_CONFIRMED, QUIZ_STARTED, QUIZ_PASSED, QUIZ_FAILED, SERIES_COMPLETED, CAPABILITY_UNLOCKED, BADGE_UNLOCKED. Heartbeats de alta frequência ficam FORA deste ledger (compacted em academy_episode_progress via UPDATE; possível tabela separada de heartbeats com retenção curta — decisão V1: não criar, progress row basta).

### 2.5 `gwd.academy_quizzes` + `gwd.academy_quiz_attempts` (novo — necessário para QUIZ_VERIFIED e capabilities)
```sql
create table gwd.academy_quizzes(
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references gwd.academy_episodes(id) on delete cascade,
  version integer not null default 1,
  questions jsonb not null,            -- [{id, prompt, options[], correct_index, explanation}]
  pass_threshold numeric(5,2) not null default 80.00,
  unique(episode_id, version));

create table gwd.academy_quiz_attempts(
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references gwd.participants(id) on delete cascade,
  quiz_id uuid not null references gwd.academy_quizzes(id) on delete cascade,
  quiz_version integer not null,
  score numeric(5,2) not null,
  passed boolean not null,
  answers jsonb not null default '{}',
  created_at timestamptz not null default now());
```
QUIZ_PASSED XP idempotente por versão: event_key `academy:quiz:{quiz_id}:v{version}:passed`.

### 2.6 `gwd.academy_enrollments` e `gwd.participant_capability_awards`
Como na proposta. `participant_capability_awards` é append-only auditável (unique participant+capability+source_type+source_ref) — a "regra real" fica registada em source_type/source_ref (ex.: `rule`, `academy:capability:SOCIAL_MEDIA_L1:v1`).

### 2.7 Telegram Premium handoff — REMOVIDO DO SCHEMA GWD (decisão PDG 2026-10-20)
**Nenhuma tabela Telegram no GWD.** As anteriormente propostas `academy_telegram_access_tokens` e `telegram_bindings` foram **removidas** da proposta: binding de token, hash, telegram_user_id, invite, membership, auditoria de chat_member e revogação são **responsabilidade exclusiva do telegram-provider no Atlas Media**.
GWD conserva apenas o estado funcional do episódio:
- evento durável `TELEGRAM_HANDOFF_OPENED` em `academy_learning_events`;
- `completion_method` (SELF_ATTESTED / QUIZ_VERIFIED / MANUAL_REVIEW / NONE) em `academy_episode_progress`;
- `entitlement_ref` no episódio/série (referência de direito, não de token).
Nenhum token Telegram persistido no frontend ou no schema Academy.

Fluxo V1 (ownership Atlas Media):
1. Utilizador autenticado → GWD valida entitlement **ARO** server-side (episódio/série PREMIUM).
2. Com entitlement válido, GWD pede o handoff ao **telegram-provider (Atlas Media)** — é esse provider que gera o token opaco one-time, o deep-link `t.me/<bot>?start=<token>`, valida o token, cria o invite controlado e gere binding/membership.
3. GWD regista o handoff event e, no retorno, resolve a conclusão pela policy (SELF_ATTESTED / QUIZ_VERIFIED).
4. Revogação: evento ARO → recheck GWD negativo; membership sync/remove é do telegram-provider.

### 2.8 XP / badges / capabilities (reutilização, sem alteração de shape)
- `gwd.points_events` (ledger auditável, unique(participant_id, event_key) = idempotência nativa). Chaves: `academy:episode:{episode_id}:completed`, `academy:series:{series_id}:completed`, `academy:quiz:{quiz_id}:v{version}:passed`, `academy:streak:{participant_id}:{period}:7day`.
- Recompensas V1: EPISODE_COMPLETED +10, QUIZ_PASSED +10 (por versão), SERIES_COMPLETED +50, 7_DAY_LEARNING_STREAK +25. **Nunca** XP por compra/Premium, replay, clicks ou montante.
- Levels (EXPLORER→PRO): thresholds em dados/config, não em código de UI.
- Badges V1: FIRST_STEP, GWD_START, FIRST_EPISODE, FIRST_SERIES, CONSISTENCY_7, SOCIAL_MEDIA_STARTER, SALES_FOUNDATIONS, AI_FOUNDATIONS (seed data).
- Streak: dia de aprendizagem = episódio/reader completado ou quiz passado (login não conta).
- Atribuição de XP/badges/capabilities é **transação server-side** no evento de completion (progress update + event + XP na mesma transação), nunca client-side.

### 2.9 Completion policies — versionadas, server-authoritative (decisão PDG 2026-10-20)
As regras de conclusão (90%/80%, reader, hybrid, telegram) são **baseline V1, não constantes espalhadas pelo código**. Formalização:
```sql
create table gwd.academy_completion_policies(
  policy_key text not null,
  version integer not null,
  rules jsonb not null,          -- parâmetros: position_pct, engaged_pct, reader_pct, min_reading_seconds, etc.
  active boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (policy_key, version));
```
- `academy_episodes.policy_key` → referência à policy (substitui/acompanha `completion_policy` literal do SQL do Drive — o literal mantém-se como chave, a lógica vive na tabela versionada).
- Perfis V1: `VIDEO_STANDARD_V1`, `READER_STANDARD_V1`, `HYBRID_ANY_V1`, `HYBRID_BOTH_V1`, `HYBRID_QUIZ_V1`, `TELEGRAM_SELF_ATTESTED_V1`, `TELEGRAM_QUIZ_VERIFIED_V1`.
- A API resolve a versão **active** no momento da avaliação e regista a versão usada no evento/payload (auditoria de mudanças de policy).
- Capabilities/certificação que dependam de avaliação continuam a exigir QUIZ_VERIFIED quando aplicável.

## 3. API delta (apps/api, v1 — server-authoritative)
- `GET /v1/academy/series` / `GET /v1/academy/series/:slug` — catálogo público (published; tiers visíveis, conteúdo só sinalizado).
- `GET /v1/academy/episodes/:id` — metadados + estado do participante (progress, entitlement resuelta server-side via ARO).
- `POST /v1/academy/progress/heartbeat` — {episode_id, position_s?, engaged_s?, reader_section?, reading_s?} → UPSERT em academy_episode_progress; **rejeita saltos impossíveis** (position não salta >X sem engaged correspondente; rate-limit por IP+participant).
- `POST /v1/academy/progress/complete` — server aplica a regra de completion do tipo/policy; emite eventos + XP/badges idempotentes; devolve estado.
- `POST /v1/academy/telegram-access` — GWD valida entitlement ARO e **reencaminha para o telegram-provider (Atlas Media)**, que gera o token opaco one-time e o deep-link; GWD não persiste token nem binding (ver 2.7).
- `POST /v1/academy/telegram-handoff-opened` — emite TELEGRAM_HANDOFF_OPENED (sem XP).
- `GET /v1/academy/progress/summary` — Continue learning, XP, level (projeção), badges, próximo unlock, progresso de séries (tudo derivado).
- **ARO entitlement check** — server-side: `GWD session → check entitlement ARO (por entitlement_ref) → DENIED: estado locked + checkout ARO → payment/order no ARO → entitlement → GWD recheck → unlock`. GWD pode cachear a resposta por TTL curto para UX, mas a verdade é sempre re-check à ARO no acesso ao conteúdo. **Nada de paid=true em GWD.**
- Auth: `set local role gwd_api` + `set_config('request.jwt.claim.sub')` por transação (modelo trusted-server existente, ADR-0004/spine).

## 4. RLS plan
- `academy_series/seasons/episodes/assets`: SELECT público WHERE published (policy ` USING (published)` para anon/authenticated); escrita só service_role (Diana/Helena ops).
- `academy_episode_progress`, `academy_learning_events`, `academy_quiz_attempts`, `academy_enrollments`: participant vê/só a própria linha (`participant_id = auth.uid()` via JWT); INSERT/UPDATE via `gwd_api` trusted-server (grants como nas tabelas existentes — patrão do schema.sql actual); cliente directo: SELECT próprio, sem INSERT/UPDATE (API é o caminho).
- `academy_quizzes`: SELECT público; respostas correctas **não** expostas via API de catálogo (endpoint de quiz server-side corrige e devolve só score/pass).
- ~~`academy_telegram_access_tokens` / `telegram_bindings`~~ — **removidas do schema GWD** (ownership telegram-provider, Atlas Media; ver 2.7).
- `participant_capability_awards`: SELECT próprio; INSERT só gwd_api.
- Grants espelham o padrão existente (foreach no migration existente actualizado com as tabelas novas).

## 5. Migração de `academy_items`
Tabela actual `gwd.academy_items(id, title, body, owner)` (baselines de leitura). Plano:
1. Criar série seed "GWD Foundations" (status PUBLISHED, tier MEMBER).
2. Backfill script (idempotente, dry-run primeiro): cada academy_item → 1 episode (episode_type READER, delivery WEBREADER, provider GWD_READER, asset kind READER com asset_ref = item id) numa season 1; mapeamento old_id→episode_id guardado em tabela temp `academy_items_backfill(old_id, episode_id)`.
3. Verificação: contagens iguais, títulos iguais, smoke read de 2 episódios.
4. Drop `gwd.academy_items` + limpar grants num migration separado (só após verificação).

## 6. Atlas Media provider contract (consumo GWD — a extração é missão da Helena)
- GWD consome via `provider=ATLAS_MEDIA` asset_ref = `media_asset_id` imutável.
- Reprodução: GWD server valida entitlement → pede short-lived media token (JWT: issuer, audience, participant, tenant, media_asset_id, scope, expiry, jti — direcção Helena: assimétrico se prático) → player HLS/fMP4 (H.264/AAC, 360/540/720[/1080]).
- GWD nunca serve o ficheiro original nem guarda HLS como seu truth; originals imutáveis + SHA-256 ficam no Atlas Media.
- Troca TELEGRAM→ATLAS_MEDIA: UPDATE em academy_episode_assets; sem reset de progresso/entitlement (2.3/2.2).

## 7. ARO entitlement contract
- `entitlement_ref` por série/episódio: `gwd.academy.series:{series_id}` (entitlement a nível de série por defeito; episódios com tier superior podem ter ref própria).
- GWD → ARO: `GET /entitlements?participant={external_ref}&resource={entitlement_ref}` (server-side, com service auth) → {active, expires_at?}.
- Checkout: GWD renderiza lock + link de checkout ARO (`entitlement_ref` no payload); ARO confirma pagamento → entitlement activo → GWD recheck → unlock.
- **Duração, expiração, revogação e refund pertencem ao ARO** — GWD não assume entitlement perpétuo e não modela prazos; trata a resposta {active, expires_at?} como estado consultado, não persistido como verdade.
- Nunca: guardar paid=true, confiar no browser, conceder por clique.
- Revogação: ARO event → GWD recheck negativo no próximo acesso; Telegram sync/remove é do telegram-provider (Atlas Media).
- **`media_asset_id` NÃO é entitlement** (ver 2.2): trocar/reencodar/superseder um asset nunca altera o direito adquirido.

## 8. Decisões §8 — FECHADAS (PDG 2026-10-20)
1. **Heartbeats:** SEM tabela dedicada em V1 — heartbeats fazem UPDATE server-side em `academy_episode_progress`; `learning_events` guarda só eventos semanticamente relevantes. ✅
2. **Telegram binding:** TTL 10 min APROVADO — mas a persistência/validação do token pertence ao telegram-provider (Atlas Media); GWD sem tabelas Telegram. ✅
3. **Entitlements:** NÃO se declara "perpetual V1" — ARO é a autoridade temporal (duração/expiração/revogação/refund). ✅
4. **Quiz answers:** 100% server-side — resposta correcta nunca exposta pela API pública antes da avaliação. ✅
5. **academy_items:** drop apenas em migration posterior ao backfill, exigindo mapping completo, reconciliação 100%, zero referências restantes, checkpoint/rollback e evidência antes do DROP. ✅
6. **Ownership (novo):** GWD Academy é owner de todas as tabelas Academy (§2); Atlas Media não conhece series/seasons/episodes; telegram-provider (Atlas Media) é owner do binding/access Telegram. ✅
7. **Completion policies versionadas (novo):** `academy_completion_policies` + perfis V1 (§2.9). ✅
