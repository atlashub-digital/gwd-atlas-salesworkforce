/* GWD Academy Streaming V1 — seed idempotente do catálogo (apps/web/lib/academy/catalog.ts)
   nas tabelas gwd.academy_* (migration 2026-10-20-academy-v1.sql, já aplicada).

   Idempotência: upsert por slug/position (series.slug, seasons(series_id,position),
   episodes(season_id,position), quizzes(episode_id,version)); assets são substituídos
   por episódio (delete+insert dentro da transação). Progresso de participantes nunca é tocado.

   Uso: DATABASE_URL=... npx tsx packages/db/seed-academy.ts
   (nunca guarda paid=true; quiz correctIndex fica só em academy_quizzes, nunca em assets). */

import {createHash} from "node:crypto";
import pg from "pg";
import * as catalogModule from "../../apps/web/lib/academy/catalog";
import type {Episode, EpisodeAsset, Series} from "../../apps/web/lib/academy/types";

const TIER_RANK = {FREE: 0, MEMBER: 1, PREMIUM: 2, CERTIFIED: 3} as const;

/* uuid v5 determinístico (mesmo slug → mesmo id, seed re-runnable) */
const catalogNs = catalogModule as unknown as {series?: Series[]; default?: {series?: Series[]}};
const staticSeries: Series[] = catalogNs.series ?? catalogNs.default?.series ?? [];
if (!staticSeries.length) throw new Error("catálogo estático não carregado (interop CJS/ESM)");
const NS_UUID = "6f1a0e6a-4b1d-5c2a-9d3e-7f2b8c1a4d5e";
function uuidv5(name: string): string {
  const ns = Buffer.from(NS_UUID.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(ns).update(name).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = hash.subarray(0, 16).toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function policyKeyFor(ep: Episode): string {
  switch (ep.deliveryMode) {
    case "TELEGRAM": return "TELEGRAM_SELF_ATTESTED_V1";
    case "EXTERNAL": return "TELEGRAM_SELF_ATTESTED_V1"; // sem auto-complete; sem tabela Telegram
    case "HYBRID": return ep.hybridPolicy === "BOTH" ? "HYBRID_BOTH_V1" : ep.hybridPolicy === "QUIZ" ? "HYBRID_QUIZ_V1" : "HYBRID_ANY_V1";
    case "WEBREADER": return "READER_STANDARD_V1";
    default: return "VIDEO_STANDARD_V1";
  }
}

function assetRows(ep: Episode): {kind: string; provider: string; assetRef: string; metadata: Record<string, unknown>; position: number}[] {
  const provider = ep.deliveryMode === "TELEGRAM" ? "TELEGRAM" : ep.deliveryMode === "EXTERNAL" ? "EXTERNAL" : ep.provider;
  const rows: {kind: string; provider: string; assetRef: string; metadata: Record<string, unknown>; position: number}[] = [];
  for (const asset of ep.assets) {
    if (asset.kind === "quiz") continue; // quiz vive em academy_quizzes (respostas nunca em assets expostos)
    const kind = asset.kind === "video" ? "VIDEO" : asset.kind === "reader" ? "READER" : "RESOURCE";
    const metadata: Record<string, unknown> = {};
    if (asset.durationSeconds !== undefined) metadata.durationSeconds = asset.durationSeconds;
    if (asset.title !== undefined) metadata.title = asset.title;
    if (asset.sections !== undefined) metadata.sections = asset.sections;
    if (asset.resources !== undefined) metadata.resources = asset.resources;
    rows.push({kind, provider, assetRef: asset.assetId, metadata, position: rows.length + 1});
  }
  return rows;
}

function episodeStatements(ep: Episode, seasonId: string, seriesId: string, seriesSlug: string): string[] {
  const id = uuidv5(`${seriesSlug}:${ep.slug}`);
  const policyKey = policyKeyFor(ep);
  const premium = TIER_RANK[ep.accessTier] >= TIER_RANK.PREMIUM;
  const upsert = `insert into gwd.academy_episodes(id,season_id,slug,position,title,summary,episode_type,access_tier,entitlement_ref,completion_policy,policy_key,delivery_mode,duration_seconds,published)
values ('${id}','${seasonId}','${ep.slug}',${ep.number},'${esc(ep.title)}','${esc(ep.summary)}','${ep.episodeType}','${ep.accessTier}',${premium ? `'gwd.academy.episode:${ep.slug}'` : "null"},'${policyKey}','${policyKey}','${ep.deliveryMode}',${ep.durationSeconds},true)
on conflict (season_id, position) do update set slug=excluded.slug, title=excluded.title, summary=excluded.summary,
 episode_type=excluded.episode_type, access_tier=excluded.access_tier, entitlement_ref=excluded.entitlement_ref,
 completion_policy=excluded.completion_policy, policy_key=excluded.policy_key, delivery_mode=excluded.delivery_mode,
 duration_seconds=excluded.duration_seconds, published=excluded.published;`;
  const statements = [upsert];
  const assets = assetRows(ep);
  if (assets.length) {
    const values = assets.map(a => `('${a.kind}','${a.provider}','${a.assetRef}','${esc(JSON.stringify(a.metadata))}',${a.position})`).join(",");
    statements.push(`delete from gwd.academy_episode_assets where episode_id='${id}';`);
    statements.push(`insert into gwd.academy_episode_assets(episode_id,kind,provider,asset_ref,metadata,position) select '${id}',x.kind,x.provider,x.asset_ref,x.metadata::jsonb,x.position from (values ${values}) as x(kind,provider,asset_ref,metadata,position);`);
  }
  const quizAsset = ep.assets.find((a: EpisodeAsset) => a.kind === "quiz" && a.quiz?.length);
  if (quizAsset?.quiz?.length) {
    const questions = JSON.stringify(quizAsset.quiz);
    statements.push(`insert into gwd.academy_quizzes(episode_id,version,questions,pass_threshold) values ('${id}',1,'${esc(questions)}',80.00) on conflict (episode_id, version) do update set questions=excluded.questions;`);
  }
  return statements;
}

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

export function seedStatements(): string[] {
  const statements: string[] = ["begin;"];
  for (const s of staticSeries) {
    const seriesId = uuidv5(`series:${s.slug}`);
    const topTier = s.episodes.reduce((max, e) => (TIER_RANK[e.accessTier] > TIER_RANK[max] ? e.accessTier : max), "FREE" as (typeof staticSeries)[number]["episodes"][number]["accessTier"]);
    statements.push(`insert into gwd.academy_series(id,slug,title,description,owner,status,access_tier,entitlement_ref,featured)
values ('${seriesId}','${s.slug}','${esc(s.title)}','${esc(s.description)}','GWD Academy','PUBLISHED','${topTier}','gwd.academy.series:${s.slug}',${s.featured ? "true" : "false"})
on conflict (slug) do update set title=excluded.title, description=excluded.description, status='PUBLISHED',
 access_tier=excluded.access_tier, entitlement_ref=excluded.entitlement_ref, featured=excluded.featured, updated_at=now();`);
    for (const season of s.seasons) {
      const seasonId = uuidv5(`series:${s.slug}:season:${season.number}`);
      statements.push(`insert into gwd.academy_seasons(id,series_id,position,title) values ('${seasonId}','${seriesId}',${season.number},'${esc(season.title)}') on conflict (series_id, position) do update set title=excluded.title;`);
      const seasonEpisodes = s.episodes.filter(e => e.seasonNumber === season.number);
      for (const ep of seasonEpisodes) statements.push(...episodeStatements(ep, seasonId, seriesId, s.slug));
    }
  }
  statements.push("commit;");
  return statements;
}

async function runViaDatabase(statements: string[]): Promise<string> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL em falta (não imprimir valores).");
  const client = new pg.Client({connectionString: url});
  await client.connect();
  try {
    for (const statement of statements) await client.query(statement);
    const counts = await client.query(VERIFY_QUERY);
    return `seed-academy ok: ${JSON.stringify(counts.rows[0])}`;
  } finally {
    await client.end();
  }
}

/* Modo B (comprovado): Supabase Management API, statement-a-statement — usada quando o
   acesso directo ao DB não consegue escrever (RLS do catálogo reserva escrita a service ops). */
const VERIFY_QUERY = `select
  (select count(*) from gwd.academy_series) as series,
  (select count(*) from gwd.academy_seasons) as seasons,
  (select count(*) from gwd.academy_episodes where published) as episodes,
  (select count(*) from gwd.academy_episode_assets) as assets,
  (select count(*) from gwd.academy_quizzes) as quizzes`;

async function runViaManagementApi(statements: string[]): Promise<string> {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const ref = process.env.SUPABASE_PROJECT_REF ?? "hqjljiriqdurgiffczkp";
  if (!token) throw new Error("SUPABASE_MANAGEMENT_TOKEN em falta (não imprimir valores).");
  async function query(sql: string): Promise<unknown> {
    const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      body: JSON.stringify({query: sql}),
      signal: AbortSignal.timeout(120000),
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`management api ${response.status}: ${body.slice(0, 400)}`);
    return JSON.parse(body);
  }
  await query(statements.join("\n"));
  const counts = await query(VERIFY_QUERY) as Array<Record<string, number>>;
  return `seed-academy ok (management api): ${JSON.stringify(counts[0])}`;
}

async function main(): Promise<void> {
  const statements = seedStatements();
  const result = process.env.SUPABASE_MANAGEMENT_TOKEN
    ? await runViaManagementApi(statements)
    : await runViaDatabase(statements);
  console.log(result);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => {
  console.error("seed-academy failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
