/* GWD Academy Streaming V1 — endpoints server-authoritative (doc §3, contrato ACADEMY_STREAMING_V1_DATA_MODEL.md).
   Truth: academy_episode_progress / academy_learning_events / points_events (nunca UI-local).
   Tudo em transação com set local role gwd_api + request.jwt.claim.sub (modelo trusted-server). */

import {InputError} from "@gwd/contracts";
import type {PoolClient} from "pg";
import {aroAdapter} from "./aro";
import {atlasMediaConfig,requestPlayback} from "./media";
import * as catalogModule from "../../../apps/web/lib/academy/catalog";

type CatalogSeries = {slug: string; subtitle?: string; category?: string; posterInitials?: string; posterGradient?: string};
const catalogNs = catalogModule as unknown as {series?: CatalogSeries[]; default?: {series?: CatalogSeries[]}};
const CATALOG_PRESENTATION: readonly CatalogSeries[] = catalogNs.series ?? catalogNs.default?.series ?? [];

function presentationFor(slug: string): CatalogSeries {
  return CATALOG_PRESENTATION.find(s => s.slug === slug) ?? {slug};
}

export class AcademyError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

type Json = Record<string, unknown>;
const XP_EPISODE_COMPLETED = 10;
const XP_QUIZ_PASSED = 10;
const XP_SERIES_COMPLETED = 50;
const MAX_POSITION_JUMP_SECONDS = 120; // sem engaged correspondente → salto impossível

/* ---------- helpers ---------- */

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function pick(body: Json, ...keys: string[]): unknown {
  for (const key of keys) if (body[key] !== undefined) return body[key];
  return undefined;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/* Unpublished episodes (technical pilots) open only through an operator-created grant for THIS participant and THIS
   episode (gwd.academy_preview_grants; RLS enforces the same rule). Never listed, never counted for completion. */
async function previewGrantFor(c: PoolClient, ref: string): Promise<boolean> {
  // to_regclass never raises: before 2026-10-23-academy-preview.sql is applied there are no grants (no aborted tx).
  if (!(await c.query<{ok: boolean}>(`select to_regclass('gwd.academy_preview_grants') is not null as ok`)).rows[0]?.ok) return false;
  const where = isUuid(ref) ? "e.id = $1" : "e.slug = $1";
  return (await c.query<{ok: boolean}>(
    `select exists (select 1 from gwd.academy_preview_grants g join gwd.academy_episodes e on e.id = g.episode_id
      where ${where} and g.participant_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid) as ok`, [ref])).rows[0]?.ok ?? false;
}

async function episodeByRef(c: PoolClient, ref: string): Promise<EpisodeRow | undefined> {
  const where = isUuid(ref) ? "e.id = $1" : "e.slug = $1";
  const preview = await previewGrantFor(c, ref);
  const result = await c.query<EpisodeRow & {series_id: string; series_slug: string; series_title: string; season_number: number}>(
    `select e.*, sn.position as season_number, s.id as series_id, s.slug as series_slug, s.title as series_title,
            s.entitlement_ref as series_entitlement_ref
       from gwd.academy_episodes e
       join gwd.academy_seasons sn on sn.id = e.season_id
       join gwd.academy_series s on s.id = sn.series_id
      where s.status = 'PUBLISHED' and (e.published or $2::boolean) and ${where} limit 1`,
    [ref, preview],
  );
  return result.rows[0];
}

type EpisodeRow = {
  id: string;
  season_id: string;
  slug: string;
  position: number;
  title: string;
  summary: string;
  episode_type: string;
  access_tier: string;
  entitlement_ref: string | null;
  policy_key: string;
  delivery_mode: string;
  duration_seconds: number | null;
  series_id: string;
  series_slug: string;
  series_title: string;
  series_entitlement_ref: string | null;
  season_number: number;
};

function hybridPolicyOf(policyKey: string): "ANY" | "BOTH" | "QUIZ" | undefined {
  if (policyKey === "HYBRID_ANY_V1") return "ANY";
  if (policyKey === "HYBRID_BOTH_V1") return "BOTH";
  if (policyKey === "HYBRID_QUIZ_V1") return "QUIZ";
  return undefined;
}

function codeOf(season: number, position: number): string {
  return `S${season}EP${String(position).padStart(2, "0")}`;
}

/* ---------- catálogo (público, published) ---------- */

type SeriesRow = {id: string; slug: string; title: string; description: string; featured: boolean; access_tier: string; entitlement_ref: string | null};

/** Private channel message (t.me/c/<channel>/<message>) or public channel message (t.me/<username>/<message>). */
export const telegramMessageUrl = /^https:\/\/t\.me\/(c\/\d{5,16}|[A-Za-z][A-Za-z0-9_]{4,31})\/\d{1,10}$/;

async function assetsForEpisodes(c: PoolClient, episodeIds: string[]): Promise<Map<string, Json[]>> {
  const assets = new Map<string, Json[]>();
  if (!episodeIds.length) return assets;
  const rows = (await c.query(
    `select episode_id, kind, provider, asset_ref, metadata from gwd.academy_episode_assets
      where episode_id = any($1::uuid[]) and superseded_at is null order by episode_id, position`,
    [episodeIds],
  )).rows as Array<{episode_id: string; kind: string; provider: string; asset_ref: string; metadata: Json}>;
  for (const row of rows) {
    const list = assets.get(row.episode_id) ?? [];
    const meta = row.metadata ?? {};
    const asset: Json = {kind: row.kind.toLowerCase(), assetId: row.asset_ref};
    // Telegram Native: only a well-formed t.me message link is ever sent to the browser (no arbitrary URLs).
    if (row.provider === "TELEGRAM" && row.kind === "TELEGRAM") {
      if (telegramMessageUrl.test(row.asset_ref)) asset.url = row.asset_ref; else asset.assetId = "telegram-unlinked";
    }
    if (meta.durationSeconds !== undefined) asset.durationSeconds = meta.durationSeconds;
    if (meta.title !== undefined) asset.title = meta.title;
    if (meta.sections !== undefined) asset.sections = meta.sections;
    if (meta.resources !== undefined) asset.resources = meta.resources;
    list.push(asset);
    assets.set(row.episode_id, list);
  }
  const quizzes = (await c.query(
    `select distinct on (episode_id) episode_id, id, version, questions from gwd.academy_quizzes
      where episode_id = any($1::uuid[]) order by episode_id, version desc`,
    [episodeIds],
  )).rows as Array<{episode_id: string; id: string; version: number; questions: Array<{id: string; prompt: string; options: string[]}>}>;
  for (const quiz of quizzes) {
    const list = assets.get(quiz.episode_id) ?? [];
    // Decisão §8.4: respostas correctas NUNCA expostas pela API de catálogo.
    list.push({kind: "quiz", assetId: `quiz-${quiz.episode_id}`, quiz: quiz.questions.map(q => ({id: q.id, prompt: q.prompt, options: q.options}))});
    assets.set(quiz.episode_id, list);
  }
  return assets;
}

function episodeJson(ep: EpisodeRow, assets: Json[]): Json {
  const presentation = presentationFor(ep.series_slug);
  const provider = ep.delivery_mode === "TELEGRAM" ? "TELEGRAM" : ep.delivery_mode === "EXTERNAL" ? "EXTERNAL"
    : assets.some(a => a.kind === "video") ? "ATLAS_MEDIA" : "GWD_READER";
  return {
    id: ep.id,
    slug: ep.slug,
    seriesId: ep.series_id,
    seriesSlug: ep.series_slug,
    seasonNumber: ep.season_number,
    number: ep.position,
    code: codeOf(ep.season_number, ep.position),
    title: ep.title,
    summary: ep.summary,
    episodeType: ep.episode_type,
    deliveryMode: ep.delivery_mode,
    provider,
    accessTier: ep.access_tier,
    hybridPolicy: hybridPolicyOf(ep.policy_key),
    durationSeconds: ep.duration_seconds ?? 0,
    assets,
    posterInitials: presentation.posterInitials,
    posterGradient: presentation.posterGradient,
  };
}

async function loadSeriesList(c: PoolClient, slug?: string): Promise<Json[]> {
  const seriesRows = (await c.query<SeriesRow>(
    `select id, slug, title, description, featured, access_tier, entitlement_ref from gwd.academy_series
      where status = 'PUBLISHED' ${slug ? "and slug = $1" : ""} order by featured desc, title`,
    slug ? [slug] : [],
  )).rows;
  if (!seriesRows.length) return [];
  const seriesIds = seriesRows.map(s => s.id);
  const seasons = (await c.query(
    `select sn.id, sn.series_id, sn.position, sn.title from gwd.academy_seasons sn
      where sn.series_id = any($1::uuid[]) order by sn.series_id, sn.position`,
    [seriesIds],
  )).rows as Array<{id: string; series_id: string; position: number; title: string}>;
  const episodes = (await c.query<EpisodeRow & {series_slug: string; series_title: string; series_entitlement_ref: string | null}>(
    `select e.*, s.id as series_id, sn.position as season_number, s.slug as series_slug, s.title as series_title, s.entitlement_ref as series_entitlement_ref
       from gwd.academy_episodes e
       join gwd.academy_seasons sn on sn.id = e.season_id
       join gwd.academy_series s on s.id = sn.series_id
      where s.id = any($1::uuid[]) and e.published
      order by s.id, sn.position, e.position`,
    [seriesIds],
  )).rows;
  const assets = await assetsForEpisodes(c, episodes.map(e => e.id));
  return seriesRows.map(s => {
    const presentation = presentationFor(s.slug);
    const seriesEpisodes = episodes.filter(e => e.series_id === s.id);
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      subtitle: presentation.subtitle ?? "",
      description: s.description,
      category: presentation.category ?? "",
      featured: s.featured,
      posterInitials: presentation.posterInitials ?? s.slug.slice(0, 2).toUpperCase(),
      posterGradient: presentation.posterGradient ?? "linear-gradient(140deg,#002040 0%,#0a84ff 100%)",
      entitlementRef: s.entitlement_ref,
      seasons: seasons.filter(sn => sn.series_id === s.id).map(sn => ({
        number: sn.position,
        title: sn.title,
        episodeIds: seriesEpisodes.filter(e => e.season_id === sn.id).map(e => e.id),
      })),
      episodes: seriesEpisodes.map(e => episodeJson(e, assets.get(e.id) ?? [])),
    };
  });
}

/** Rotas públicas de catálogo (antes de auth). Devolve Response ou null se não for rota academy pública. */
export async function publicAcademyRoute(route: string, method: string, tx: (userId: string | null, run: (c: PoolClient) => Promise<Response>) => Promise<Response>): Promise<Response | null> {
  if (method !== "GET") return null;
  if (route === "/v1/academy/series") {
    return tx(null, async c => {
      const items = await loadSeriesList(c);
      return Response.json({items, source: "db"}, {headers: {"Cache-Control": "no-store"}});
    });
  }
  const detail = /^\/v1\/academy\/series\/([^/]+)$/.exec(route);
  if (detail) {
    return tx(null, async c => {
      const items = await loadSeriesList(c, decodeURIComponent(detail[1]));
      if (!items.length) return Response.json({error: "Série indisponível."}, {status: 404});
      return Response.json({series: items[0], source: "db"}, {headers: {"Cache-Control": "no-store"}});
    });
  }
  return null;
}

/* ---------- progresso ---------- */

function progressJson(row: ProgressRow, episode: EpisodeRow): Json {
  return {
    episode_id: row.episode_id,
    series_id: episode.series_id,
    status: row.status,
    last_position_seconds: row.last_position_seconds,
    duration_seconds: episode.duration_seconds ?? 0,
    engaged_seconds: row.engaged_seconds,
    progress_percent: Number(row.progress_percent),
    completion_method: row.completion_method,
    first_started_at: row.first_started_at,
    last_seen_at: row.last_seen_at,
    completed_at: row.completed_at,
  };
}

type ProgressRow = {
  episode_id: string;
  status: string;
  last_position_seconds: number;
  engaged_seconds: number;
  progress_percent: string | number;
  last_reader_section: number | null;
  active_reading_seconds: number;
  completion_method: string | null;
  first_started_at: string | null;
  last_seen_at: string | null;
  completed_at: string | null;
};

/** Guard anti-abuse: position não salta >120s sem engaged correspondente (doc §3). */
export function impossibleJump(prevPosition: number, prevEngaged: number, position: number, engaged: number): boolean {
  const deltaPosition = position - prevPosition;
  const deltaEngaged = engaged - prevEngaged;
  return deltaPosition > MAX_POSITION_JUMP_SECONDS && deltaEngaged < deltaPosition - MAX_POSITION_JUMP_SECONDS;
}

async function upsertHeartbeat(c: PoolClient, participantId: string, episode: EpisodeRow, position: number, engaged: number, readerSection: number | null, reading: number): Promise<ProgressRow> {
  const duration = Math.max(episode.duration_seconds ?? 0, 0);
  const clamped = duration > 0 ? Math.min(Math.max(position, 0), duration) : Math.max(position, 0);
  const percent = duration > 0 ? Math.min(99, Math.round((clamped / duration) * 100)) : 0;
  const row = (await c.query<ProgressRow>(
    `insert into gwd.academy_episode_progress(participant_id,episode_id,status,last_position_seconds,engaged_seconds,progress_percent,last_reader_section,active_reading_seconds,first_started_at,last_seen_at)
     values ($1,$2,'IN_PROGRESS',$3,$4,$5,$6,$7,now(),now())
     on conflict (participant_id, episode_id) do update set
       status = case when gwd.academy_episode_progress.status = 'COMPLETED' then 'COMPLETED' else 'IN_PROGRESS' end,
       last_position_seconds = greatest(gwd.academy_episode_progress.last_position_seconds, excluded.last_position_seconds),
       engaged_seconds = greatest(gwd.academy_episode_progress.engaged_seconds, excluded.engaged_seconds),
       progress_percent = case when gwd.academy_episode_progress.status = 'COMPLETED' then 100 else excluded.progress_percent end,
       last_reader_section = greatest(coalesce(gwd.academy_episode_progress.last_reader_section, 0), coalesce(excluded.last_reader_section, 0)),
       active_reading_seconds = greatest(gwd.academy_episode_progress.active_reading_seconds, excluded.active_reading_seconds),
       first_started_at = coalesce(gwd.academy_episode_progress.first_started_at, excluded.first_started_at),
       last_seen_at = now()
     returning *`,
    [participantId, episode.id, clamped, engaged, percent, readerSection, reading],
  )).rows[0];
  await c.query(
    `insert into gwd.academy_learning_events(participant_id,episode_id,series_id,event_type,event_key)
     values ($1,$2,$3,'EPISODE_STARTED',$4) on conflict (event_key) do nothing`,
    [participantId, episode.id, episode.series_id, `academy:episode:${episode.id}:started`],
  );
  await c.query(
    `insert into gwd.academy_enrollments(participant_id,series_id) values ($1,$2) on conflict do nothing`,
    [participantId, episode.series_id],
  );
  return row;
}

async function episodeHasHandoff(c: PoolClient, participantId: string, episodeId: string): Promise<boolean> {
  return !!(await c.query(
    `select 1 from gwd.academy_learning_events where participant_id=$1 and episode_id=$2 and event_type='TELEGRAM_HANDOFF_OPENED' limit 1`,
    [participantId, episodeId],
  )).rows.length;
}

async function quizPassed(c: PoolClient, participantId: string, episodeId: string): Promise<boolean> {
  return !!(await c.query(
    `select 1 from gwd.academy_quiz_attempts a
       join gwd.academy_quizzes q on q.id = a.quiz_id
      where a.participant_id=$1 and q.episode_id=$2 and a.passed
      order by q.version desc, a.created_at desc limit 1`,
    [participantId, episodeId],
  )).rows.length;
}

async function episodeHasQuiz(c: PoolClient, episodeId: string): Promise<boolean> {
  return !!(await c.query(`select 1 from gwd.academy_quizzes where episode_id=$1 limit 1`, [episodeId])).rows.length;
}

type Rules = Record<string, unknown>;

/** Avaliação server-authoritative da policy versionada (academy_completion_policies). */
export function policySatisfied(policyKey: string, rules: Rules, state: {positionSeconds: number; durationSeconds: number; engagedSeconds: number; readingSeconds: number; handoff: boolean; quizPassed: boolean}): boolean {
  const pct = (value: number, total: number, target: unknown): boolean => total > 0 && value / total >= Number(target) / 100;
  const videoOk = pct(state.positionSeconds, state.durationSeconds, rules.position_pct ?? 90) && pct(state.engagedSeconds, state.durationSeconds, rules.engaged_pct ?? 80);
  const readerOk = pct(state.positionSeconds, state.durationSeconds, rules.reader_pct ?? 90) && state.readingSeconds >= Number(rules.min_reading_seconds ?? 180);
  if (Array.isArray(rules.any_of)) return (rules.any_of as string[]).some(key => policySatisfied(key, {}, state)) && (!rules.require_quiz || state.quizPassed);
  if (Array.isArray(rules.all_of)) return (rules.all_of as string[]).every(key => policySatisfied(key, {}, state)) && (!rules.require_quiz || state.quizPassed);
  if (rules.require_handoff) {
    if (!state.handoff) return false;
    return rules.completion_method !== "QUIZ_VERIFIED" || state.quizPassed;
  }
  if (policyKey.startsWith("VIDEO")) return videoOk && (!rules.require_quiz || state.quizPassed);
  if (policyKey.startsWith("READER")) return readerOk && (!rules.require_quiz || state.quizPassed);
  if (policyKey.startsWith("HYBRID_ANY")) return (videoOk || readerOk) && (!rules.require_quiz || state.quizPassed);
  if (policyKey.startsWith("HYBRID_BOTH")) return videoOk && readerOk && (!rules.require_quiz || state.quizPassed);
  if (policyKey.startsWith("HYBRID_QUIZ")) return (videoOk || readerOk) && state.quizPassed;
  return false;
}

async function activePolicy(c: PoolClient, policyKey: string): Promise<{version: number; rules: Rules}> {
  const row = (await c.query(`select version, rules from gwd.academy_completion_policies where policy_key=$1 and active order by version desc limit 1`, [policyKey])).rows[0];
  if (!row) throw new AcademyError(500, "POLICY_UNAVAILABLE", `Policy ${policyKey} indisponível.`);
  return {version: row.version, rules: row.rules};
}

async function seriesCompletionState(c: PoolClient, participantId: string, seriesId: string): Promise<{total: number; completed: number}> {
  const row = (await c.query(
    `select count(*)::int as total,
            count(p.episode_id)::int as completed
       from gwd.academy_episodes e
       join gwd.academy_seasons sn on sn.id = e.season_id
       left join gwd.academy_episode_progress p
         on p.episode_id = e.id and p.participant_id = $1 and p.status = 'COMPLETED'
      where sn.series_id = $2 and e.published`,
    [participantId, seriesId],
  )).rows[0];
  return {total: row.total, completed: row.completed};
}

async function grantXp(c: PoolClient, participantId: string, eventKey: string, points: number): Promise<boolean> {
  const result = await c.query(
    `insert into gwd.points_events(participant_id,event_key,points) values ($1,$2,$3) on conflict (participant_id, event_key) do nothing`,
    [participantId, eventKey, points],
  );
  return (result.rowCount ?? 0) > 0;
}

/* ---------- rotas autenticadas (dentro da transação com jwt.claim.sub) ---------- */

export async function academyRoute(ctx: {request: Request; route: string; method: string; c: PoolClient; userId: string}): Promise<Response | null> {
  const {request, route, method, c, userId} = ctx;
  const json = (body: unknown, status = 200) => Response.json(body, {status, headers: {"Cache-Control": "no-store"}});
  const body = async (): Promise<Json> => {
    try {
      return (await request.json()) as Json;
    } catch {
      throw new InputError("Pedido inválido.");
    }
  };

  /* GET /v1/academy/episodes/:id — metadados + progresso + entitlement (ARO server-side) */
  const episodeMatch = method === "GET" ? /^\/v1\/academy\/episodes\/([^/]+)$/.exec(route) : null;
  if (episodeMatch) {
    const episode = await episodeByRef(c, decodeURIComponent(episodeMatch[1]));
    if (!episode) return json({error: "Episódio indisponível."}, 404);
    const [assets, progressRows] = await Promise.all([
      assetsForEpisodes(c, [episode.id]),
      c.query<ProgressRow>(`select * from gwd.academy_episode_progress where participant_id=$1 and episode_id=$2`, [userId, episode.id]),
    ]);
    const entitlementRef = episode.entitlement_ref ?? episode.series_entitlement_ref ?? `gwd.academy.series:${episode.series_slug}`;
    const entitlement = await aroAdapter().checkEntitlement({participantId: userId, entitlementRef, tier: episode.access_tier as "FREE"});
    const progress = progressJson(progressRows.rows[0] ?? emptyProgressRow(episode.id), episode);
    return json({episode: episodeJson(episode, assets.get(episode.id) ?? []), progress, entitlement: {ref: entitlementRef, ...entitlement}});
  }

  /* POST /v1/academy/episodes/:id/playback — GWD access → ARO (via Atlas Media catalog) → short-lived HLS token. */
  const playbackMatch = method === "POST" ? /^\/v1\/academy\/episodes\/([^/]+)\/playback$/.exec(route) : null;
  if (playbackMatch) {
    const episode = await episodeByRef(c, decodeURIComponent(playbackMatch[1]));
    if (!episode) return json({error: "Episódio indisponível."}, 404);
    const entitlementRef = episode.entitlement_ref ?? episode.series_entitlement_ref ?? `gwd.academy.series:${episode.series_slug}`;
    const entitlement = await aroAdapter().checkEntitlement({participantId: userId, entitlementRef, tier: episode.access_tier as "FREE"});
    if (!entitlement.active) return json({code: "ENTITLEMENT_DENIED", error: "O teu acesso a este episódio não está ativo."}, 403);
    const video = (await c.query<{asset_ref: string; access_policy_ref: string | null}>(
      `select asset_ref, access_policy_ref from gwd.academy_episode_assets
        where episode_id=$1 and kind='VIDEO' and provider='ATLAS_MEDIA' and superseded_at is null order by position limit 1`, [episode.id])).rows[0];
    if (!video) return json({code: "MEDIA_NOT_LINKED", error: "Este episódio não tem vídeo no WebPlayer."}, 409);
    const email = (await c.query<{email: string | null}>(`select nullif(lower(current_setting('request.jwt.claim.email', true)), '') as email`)).rows[0]?.email ?? null;
    const result = await requestPlayback(atlasMediaConfig(), {assetRef: video.asset_ref, policyRef: video.access_policy_ref ?? entitlementRef, email});
    return result.ok ? json({manifest_url: result.manifestUrl, expires_at: result.expiresAt, provider: result.provider}) : json({code: result.code, error: result.error}, result.status);
  }

  if (!route.startsWith("/v1/academy/")) return null;

  if (route === "/v1/academy/progress/heartbeat" && method === "POST") {
    const input = await body();
    const episode = await episodeByRef(c, String(pick(input, "episode_id", "episodeId") ?? ""));
    if (!episode) throw new InputError("Episódio desconhecido.");
    const prevRows = await c.query<ProgressRow>(`select * from gwd.academy_episode_progress where participant_id=$1 and episode_id=$2`, [userId, episode.id]);
    const prev = prevRows.rows[0];
    const position = Math.max(0, num(pick(input, "position_s", "positionSeconds")) ?? 0);
    const engaged = Math.max(0, num(pick(input, "engaged_s", "engagedSeconds")) ?? 0);
    const reading = Math.max(0, num(pick(input, "reading_s", "readingSeconds")) ?? 0);
    const readerSection = num(pick(input, "reader_section", "readerSection")) ?? null;
    if (impossibleJump(prev?.last_position_seconds ?? 0, prev?.engaged_seconds ?? 0, position, Math.max(engaged, reading))) {
      throw new AcademyError(422, "IMPOSSIBLE_JUMP", "Salto de posição sem participação correspondente foi rejeitado.");
    }
    const row = await upsertHeartbeat(c, userId, episode, position, Math.max(engaged, reading), readerSection, reading);
    return json({progress: progressJson(row, episode)});
  }

  if (route === "/v1/academy/progress/complete" && method === "POST") {
    const input = await body();
    const episode = await episodeByRef(c, String(pick(input, "episode_id", "episodeId") ?? ""));
    if (!episode) throw new InputError("Episódio desconhecido.");
    const prevRows = await c.query<ProgressRow>(`select * from gwd.academy_episode_progress where participant_id=$1 and episode_id=$2`, [userId, episode.id]);
    const prev = prevRows.rows[0];
    const position = Math.max(0, num(pick(input, "position_s", "positionSeconds")) ?? prev?.last_position_seconds ?? 0);
    const engaged = Math.max(0, num(pick(input, "engaged_s", "engagedSeconds")) ?? prev?.engaged_seconds ?? 0);
    const reading = Math.max(0, num(pick(input, "reading_s", "readingSeconds")) ?? 0);
    if (impossibleJump(prev?.last_position_seconds ?? 0, prev?.engaged_seconds ?? 0, position, Math.max(engaged, reading))) {
      throw new AcademyError(422, "IMPOSSIBLE_JUMP", "Salto de posição sem participação correspondente foi rejeitado.");
    }
    const heartbeated = await upsertHeartbeat(c, userId, episode, position, Math.max(engaged, reading), num(pick(input, "reader_section", "readerSection")) ?? null, reading);
    if (heartbeated.status === "COMPLETED") return json({progress: progressJson(heartbeated, episode), completed: true, xp: [], seriesCompleted: false});

    const policy = await activePolicy(c, episode.policy_key);
    // QUIZ_VERIFIED policies always need a passed quiz; without a quiz the episode can never complete (fail closed).
    const needsQuiz = (await episodeHasQuiz(c, episode.id)) || Boolean(policy.rules.require_quiz) || policy.rules.completion_method === "QUIZ_VERIFIED";
    const satisfied = policySatisfied(episode.policy_key, policy.rules, {
      positionSeconds: heartbeated.last_position_seconds,
      durationSeconds: episode.duration_seconds ?? 0,
      engagedSeconds: heartbeated.engaged_seconds,
      readingSeconds: Math.max(heartbeated.active_reading_seconds, heartbeated.engaged_seconds),
      handoff: episode.delivery_mode === "TELEGRAM" || episode.delivery_mode === "EXTERNAL" ? await episodeHasHandoff(c, userId, episode.id) : true,
      quizPassed: needsQuiz ? await quizPassed(c, userId, episode.id) : true,
    });
    if (!satisfied) {
      throw new AcademyError(422, "COMPLETION_NOT_EARNED", "A regra de conclusão ainda não foi cumprida — seek-to-end não completa.");
    }
    const completionMethod = episode.delivery_mode === "TELEGRAM" || episode.delivery_mode === "EXTERNAL"
      ? String(policy.rules.completion_method ?? "SELF_ATTESTED")
      : needsQuiz ? "QUIZ_VERIFIED" : "SEEK_GUARDED";
    const row = (await c.query<ProgressRow>(
      `update gwd.academy_episode_progress set status='COMPLETED', progress_percent=100, completion_method=$3, completed_at=coalesce(completed_at, now()), last_seen_at=now()
        where participant_id=$1 and episode_id=$2 returning *`,
      [userId, episode.id, completionMethod],
    )).rows[0];
    await c.query(
      `insert into gwd.academy_learning_events(participant_id,episode_id,series_id,event_type,event_key,payload)
       values ($1,$2,$3,'EPISODE_COMPLETED',$4,$5) on conflict (event_key) do nothing`,
      [userId, episode.id, episode.series_id, `academy:episode:${episode.id}:completed`, JSON.stringify({policy_key: episode.policy_key, policy_version: policy.version})],
    );
    const xp: string[] = [];
    if (await grantXp(c, userId, `academy:episode:${episode.id}:completed`, XP_EPISODE_COMPLETED)) xp.push(`academy:episode:${episode.id}:completed`);
    const seriesState = await seriesCompletionState(c, userId, episode.series_id);
    let seriesCompleted = false;
    if (seriesState.total > 0 && seriesState.completed >= seriesState.total) {
      seriesCompleted = true;
      await c.query(
        `insert into gwd.academy_learning_events(participant_id,series_id,event_type,event_key)
         values ($1,$2,'SERIES_COMPLETED',$3) on conflict (event_key) do nothing`,
        [userId, episode.series_id, `academy:series:${episode.series_id}:completed`],
      );
      if (await grantXp(c, userId, `academy:series:${episode.series_id}:completed`, XP_SERIES_COMPLETED)) xp.push(`academy:series:${episode.series_id}:completed`);
    }
    return json({progress: progressJson(row, episode), completed: true, policy: {key: episode.policy_key, version: policy.version}, xp, seriesCompleted});
  }

  if (route === "/v1/academy/telegram-handoff-opened" && method === "POST") {
    const input = await body();
    const episode = await episodeByRef(c, String(pick(input, "episode_id", "episodeId") ?? ""));
    if (!episode) throw new InputError("Episódio desconhecido.");
    await c.query(
      `insert into gwd.academy_learning_events(participant_id,episode_id,series_id,event_type,event_key)
       values ($1,$2,$3,'TELEGRAM_HANDOFF_OPENED',$4) on conflict (event_key) do nothing`,
      [userId, episode.id, episode.series_id, `academy:episode:${episode.id}:handoff:opened`],
    );
    return json({recorded: true}); // sem XP (doc §2.8)
  }

  /* GET /v1/academy/progress?series=<slug> — this participant's per-episode state for one series (server truth). */
  if (route === "/v1/academy/progress" && method === "GET") {
    const slug = new URL(request.url).searchParams.get("series") ?? "";
    if (!slug) throw new InputError("Série em falta.");
    const rows = (await c.query<ProgressRow & {slug: string}>(
      `select p.*, e.slug from gwd.academy_episode_progress p
         join gwd.academy_episodes e on e.id = p.episode_id
         join gwd.academy_seasons sn on sn.id = e.season_id
         join gwd.academy_series s on s.id = sn.series_id
        where p.participant_id = $1 and s.slug = $2`, [userId, slug])).rows;
    return json({items: rows.map(r => ({episodeId: r.episode_id, episodeSlug: r.slug, status: r.status, lastPositionSeconds: r.last_position_seconds, progressPercent: Number(r.progress_percent)}))});
  }

  if (route === "/v1/academy/progress/summary" && method === "GET") {
    const progressRows = (await c.query<ProgressRow & {slug: string; title: string; series_slug: string; series_title: string}>(
      `select p.*, e.slug, e.title, s.slug as series_slug, s.title as series_title
         from gwd.academy_episode_progress p
         join gwd.academy_episodes e on e.id = p.episode_id
         join gwd.academy_seasons sn on sn.id = e.season_id
         join gwd.academy_series s on s.id = sn.series_id
        where p.participant_id = $1
        order by p.last_seen_at desc`,
      [userId],
    )).rows;
    const continueLearning = progressRows
      .filter(row => row.status === "IN_PROGRESS" && row.last_position_seconds > 0)
      .slice(0, 3)
      .map(row => ({episodeId: row.episode_id, episodeSlug: row.slug, episodeTitle: row.title, seriesSlug: row.series_slug, seriesTitle: row.series_title, progressPercent: Number(row.progress_percent), lastSeenAt: row.last_seen_at}));
    const xpRows = (await c.query(`select event_key, points, created_at from gwd.points_events where participant_id=$1 order by created_at`, [userId])).rows as Array<{event_key: string; points: number; created_at: string}>;
    const seriesProgressRows = (await c.query(
      `select s.id, s.slug, s.title,
              count(e.id)::int as total,
              count(p.episode_id)::int as completed
         from gwd.academy_series s
         join gwd.academy_seasons sn on sn.series_id = s.id
         join gwd.academy_episodes e on e.season_id = sn.id and e.published
         left join gwd.academy_episode_progress p on p.episode_id = e.id and p.participant_id = $1 and p.status = 'COMPLETED'
        where s.status = 'PUBLISHED'
        group by s.id, s.slug, s.title order by s.title`,
      [userId],
    )).rows as Array<{id: string; slug: string; title: string; total: number; completed: number}>;
    let badges: Array<{id: string; label: string}> = [];
    try {
      badges = (await c.query(
        `select b.id, b.label from gwd.participant_badges pb join gwd.badges b on b.id = pb.badge_id where pb.participant_id = $1`,
        [userId],
      )).rows;
    } catch {
      badges = []; // sem grant/RLS para badges neste ambiente — nunca fingir desbloqueio
    }
    return json({
      continueLearning,
      xp: {total: xpRows.reduce((sum, r) => sum + Number(r.points), 0), events: xpRows},
      badges,
      series: seriesProgressRows.map(s => ({seriesId: s.id, slug: s.slug, title: s.title, total: s.total, completed: s.completed, percent: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0})),
    });
  }

  const quizMatch = /^\/v1\/academy\/quiz\/([^/]+)\/submit$/.exec(route);
  if (quizMatch && method === "POST") {
    const episode = await episodeByRef(c, decodeURIComponent(quizMatch[1]));
    if (!episode) throw new InputError("Episódio desconhecido.");
    const quiz = (await c.query(`select id, version, questions, pass_threshold from gwd.academy_quizzes where episode_id=$1 order by version desc limit 1`, [episode.id])).rows[0];
    if (!quiz) throw new InputError("Este episódio não tem quiz.");
    const input = await body();
    const answers = (pick(input, "answers") ?? {}) as Record<string, number> | number[];
    const questions = quiz.questions as Array<{id: string; correctIndex: number}>;
    const answerFor = (questionId: string): number | undefined => Array.isArray(answers) ? answers[questions.findIndex(q => q.id === questionId)] : answers[questionId];
    const correct = questions.filter(q => answerFor(q.id) === q.correctIndex).length;
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 10000) / 100 : 0;
    const passed = score >= Number(quiz.pass_threshold);
    await c.query(
      `insert into gwd.academy_quiz_attempts(participant_id,quiz_id,quiz_version,score,passed,answers) values ($1,$2,$3,$4,$5,$6)`,
      [userId, quiz.id, quiz.version, score, passed, JSON.stringify(answers)],
    );
    if (passed) {
      await c.query(
        `insert into gwd.academy_learning_events(participant_id,episode_id,series_id,event_type,event_key)
         values ($1,$2,$3,'QUIZ_PASSED',$4) on conflict (event_key) do nothing`,
        [userId, episode.id, episode.series_id, `academy:quiz:${quiz.id}:v${quiz.version}:passed`],
      );
      await grantXp(c, userId, `academy:quiz:${quiz.id}:v${quiz.version}:passed`, XP_QUIZ_PASSED);
    }
    // Nunca devolver respostas correctas (decisão §8.4).
    return json({score, passed, threshold: Number(quiz.pass_threshold), quizId: quiz.id, quizVersion: quiz.version});
  }

  return null;
}

function emptyProgressRow(episodeId: string): ProgressRow {
  return {
    episode_id: episodeId,
    status: "NOT_STARTED",
    last_position_seconds: 0,
    engaged_seconds: 0,
    progress_percent: 0,
    last_reader_section: null,
    active_reading_seconds: 0,
    completion_method: null,
    first_started_at: null,
    last_seen_at: null,
    completed_at: null,
  };
}
