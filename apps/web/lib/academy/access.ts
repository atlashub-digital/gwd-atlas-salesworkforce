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

export function tierLabel(tier: AccessTier): string {
  return tier;
}

/* ---------- XP (ledger real = gwd.points_events; aqui ainda não existe) ---------- */
export type XpSummary = {
  /** XP real do participante: 0 — nada foi ganho, nada é inventado. */
  total: number;
  level: "EXPLORER";
  source: "real-zero";
};

export function xpSummary(): XpSummary {
  return {total: 0, level: "EXPLORER", source: "real-zero"};
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
