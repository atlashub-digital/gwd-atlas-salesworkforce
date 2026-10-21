/* GWD Academy Streaming V1 — acesso e gamificação (UI honesta).
   Em produção o entitlement vem do server (ARO é a autoridade — HYBRID.md);
   aqui o participante demo é FREE e os estados locked mostram upsell Premium.
   XP/badges: valores ZERO reais (nunca XP inventado); quando existirem valores
   mock serão exibidos rotulados "demo". */

import type {AccessTier} from "./types";

/** Participante demo: tier FREE. TODO(POST /v1/academy): entitlement server/ARO. */
export const DEMO_PARTICIPANT_TIER: AccessTier = "FREE";

const TIER_RANK: Record<AccessTier, number> = {FREE: 0, MEMBER: 1, PREMIUM: 2, CERTIFIED: 3};

export function canAccess(episodeTier: AccessTier, participantTier: AccessTier = DEMO_PARTICIPANT_TIER): boolean {
  return TIER_RANK[episodeTier] <= TIER_RANK[participantTier];
}

/* ---------- Entitlement via API (ARO é a autoridade; check server-side) ---------- */

export type EpisodeAccess = {
  canAccess: boolean;
  /** origem da decisão: "aro-api" = endpoint do episódio; "tier-mock" = fallback demo */
  source: "aro-api" | "tier-mock";
  entitlementRef?: string;
};

function apiBase(): string | undefined {
  const base = process.env.GWD_API_URL;
  return base ? base.replace(/\/+$/, "") : undefined;
}

/** Consulta GET /v1/academy/episodes/:id (entitlement resolvido server-side via ARO mock). */
export async function fetchEpisodeAccess(episodeId: string): Promise<EpisodeAccess | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const response = await fetch(new URL(`/v1/academy/episodes/${encodeURIComponent(episodeId)}`, base), {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) return null; // 401 sem sessão → fallback demo; nunca inventar entitlement
    const data = (await response.json()) as {entitlement?: {active?: boolean; ref?: string}};
    if (typeof data.entitlement?.active !== "boolean") return null;
    return {canAccess: data.entitlement.active, source: "aro-api", entitlementRef: data.entitlement.ref};
  } catch (error) {
    if (error instanceof Error && typeof (error as {digest?: string}).digest === "string") throw error; // nunca engolir bailout do Next
    return null;
  }
}

/** API-first com fallback ao tier demo (mesmo comportamento quando a API não responde). */
export async function resolveAccess(episode: {id: string; accessTier: AccessTier}): Promise<EpisodeAccess> {
  const viaApi = await fetchEpisodeAccess(episode.id);
  if (viaApi) return viaApi;
  return {canAccess: canAccess(episode.accessTier), source: "tier-mock"};
}

export function tierLabel(tier: AccessTier): string {
  return tier;
}

/* ---------- XP (ledger real = gwd.points_events; aqui ainda não existe) ---------- */
export type XpSummary = {
  /** XP real do participante: 0 quando o ledger está vazio — nada é inventado. */
  total: number;
  level: "EXPLORER";
  source: "real-zero" | "ledger";
};

export function xpSummary(): XpSummary {
  return {total: 0, level: "EXPLORER", source: "real-zero"};
}

/** XP real do ledger (gwd.points_events) via GET /v1/academy/progress/summary; zero quando vazio. */
export async function xpSummaryFromLedger(): Promise<XpSummary> {
  const base = apiBase();
  if (!base) return xpSummary();
  try {
    const response = await fetch(new URL("/v1/academy/progress/summary", base), {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) return xpSummary();
    const data = (await response.json()) as {xp?: {total?: number}};
    const total = Number(data.xp?.total ?? 0);
    return Number.isFinite(total) && total > 0 ? {total, level: "EXPLORER", source: "ledger"} : xpSummary();
  } catch (error) {
    if (error instanceof Error && typeof (error as {digest?: string}).digest === "string") throw error; // nunca engolir bailout do Next
    return xpSummary();
  }
}

export type BadgeChip = {id: string; label: string; unlocked: boolean};

/** Badges demo: todos locked até existir ledger real (nunca fingir desbloqueio). */
export function demoBadges(): BadgeChip[] {
  return [
    {id: "FIRST_STEP", label: "Primeiro passo", unlocked: false},
    {id: "FIRST_EPISODE", label: "Primeiro episódio", unlocked: false},
    {id: "FIRST_SERIES", label: "Primeira série", unlocked: false},
    {id: "CONSISTENCY_7", label: "7 dias de constância", unlocked: false},
  ].map(b => ({...b, unlocked: false})); // demo: locked até dados reais
}

export function nextUnlock(seriesTitle: string): string {
  return `Primeira série concluída → +50 XP (regra server, demo) · série: ${seriesTitle}`;
}
