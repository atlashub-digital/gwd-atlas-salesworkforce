/* GWD Academy Streaming V1 — serviço de progresso MOCK (client-side).
   Mesma assinatura da futura API server-authoritative; o servidor é sempre a
   fonte de verdade — aqui o estado vive apenas em localStorage (UI-local, nunca
   autoritativo — GAMIFICATION.md "Truth hierarchy").

   TODO(POST /v1/academy): substituir a persistência local por chamadas reais:
     POST /v1/academy/progress/heartbeat   → heartbeat (20–30s / pause / seek / ended)
     POST /v1/academy/progress/complete    → conclusão (regra server, idempotente)
     GET  /v1/academy/progress?episode_id= → retoma (resume)
   Completions continuam a ser emitidas SÓ pelo servidor (regra anti-abuse:
   idempotência, reject de saltos impossíveis, sem XP por replay). */

import type {CompletionMethod, Episode, EpisodeProgress} from "./types";

const STORAGE_KEY = "gwd_academy_progress_demo_v1";

export function emptyProgress(episode: Episode): EpisodeProgress {
  return {
    episode_id: episode.id,
    series_id: episode.seriesId,
    status: "NOT_STARTED",
    last_position_seconds: 0,
    duration_seconds: episode.durationSeconds,
    engaged_seconds: 0,
    progress_percent: 0,
    completion_method: null,
    first_started_at: null,
    last_seen_at: null,
    completed_at: null,
  };
}

function readAll(): Record<string, EpisodeProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, EpisodeProgress>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, EpisodeProgress>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage indisponível — progresso demo perde-se, honesto por omissão */
  }
}

export async function getProgress(episodeId: string): Promise<EpisodeProgress | null> {
  // TODO(POST /v1/academy): GET /v1/academy/progress?episode_id=…
  return readAll()[episodeId] ?? null;
}

export async function getAllProgress(): Promise<Record<string, EpisodeProgress>> {
  // TODO(POST /v1/academy): GET /v1/academy/progress (por participante)
  return readAll();
}

/** Heartbeat: chamado a cada 20–30s durante playback, em pause, seek, visibility change e ended. */
export async function sendHeartbeat(input: {
  episode: Episode;
  lastPositionSeconds: number;
  engagedSeconds: number;
  durationSeconds: number;
}): Promise<EpisodeProgress> {
  // TODO(POST /v1/academy): POST /v1/academy/progress/heartbeat
  const {episode, lastPositionSeconds, engagedSeconds, durationSeconds} = input;
  const all = readAll();
  const prev = all[episode.id] ?? emptyProgress(episode);
  const now = new Date().toISOString();
  // Guard anti-abuse (espelha a regra server): posição nunca salta para o fim.
  const safePosition = Math.max(prev.last_position_seconds, Math.min(lastPositionSeconds, durationSeconds));
  const percent = durationSeconds > 0 ? Math.round((safePosition / durationSeconds) * 100) : 0;
  const engaged = Math.max(prev.engaged_seconds, engagedSeconds);
  const next: EpisodeProgress = {
    ...prev,
    episode_id: episode.id,
    series_id: episode.seriesId,
    duration_seconds: durationSeconds,
    status: prev.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
    last_position_seconds: safePosition,
    engaged_seconds: engaged,
    progress_percent: Math.min(percent, 99), // conclusão nunca por heartbeat; só pela regra de conclusão
    first_started_at: prev.first_started_at ?? now,
    last_seen_at: now,
    completion_method: prev.completion_method,
  };
  all[episode.id] = next;
  writeAll(all);
  return next;
}

/**
 * Regra de conclusão (mock client, espelha o contrato server):
 * percent >= 90% E engaged >= 80% da duração, OU ended após envolvimento suficiente.
 * Seek-to-end NUNCA conclui por si só: engaged_seconds é o travão.
 */
export function completionRuleMet(p: EpisodeProgress, ended: boolean): boolean {
  const duration = Math.max(p.duration_seconds, 1);
  const percent = p.last_position_seconds / duration;
  const engagedRatio = p.engaged_seconds / duration;
  if (percent >= 0.9 && engagedRatio >= 0.8) return true;
  return ended && engagedRatio >= 0.8 && percent >= 0.9;
}

/** Conclusão explícita (self-attempted / quiz pass). Em produção: server-only. */
export async function markCompleted(episode: Episode, method: CompletionMethod): Promise<EpisodeProgress> {
  // TODO(POST /v1/academy): POST /v1/academy/progress/complete (idempotente, server-authoritative)
  const all = readAll();
  const prev = all[episode.id] ?? emptyProgress(episode);
  const now = new Date().toISOString();
  const next: EpisodeProgress = {
    ...prev,
    status: "COMPLETED",
    progress_percent: 100,
    completion_method: method,
    first_started_at: prev.first_started_at ?? now,
    last_seen_at: now,
    completed_at: prev.completed_at ?? now,
  };
  all[episode.id] = next;
  writeAll(all);
  return next;
}

/* ---------- Derivados (nunca fonte de verdade) ---------- */

export function seriesProgress(episodes: Episode[], progress: Record<string, EpisodeProgress>) {
  const total = episodes.length;
  const completed = episodes.filter(e => progress[e.id]?.status === "COMPLETED").length;
  const inProgress = episodes.filter(e => progress[e.id]?.status === "IN_PROGRESS").length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {total, completed, inProgress, percent, started: completed + inProgress > 0};
}

/** "Continuar a aprender": episódios IN_PROGRESS com posição > 0, mais recentes primeiro. */
export function continueLearning(
  episodesBySeries: {seriesId: string; episodes: Episode[]}[],
  progress: Record<string, EpisodeProgress>,
) {
  const items = episodesBySeries
    .flatMap(({seriesId, episodes}) => episodes.map(e => ({seriesId, episode: e, p: progress[e.id]})))
    .filter(it => it.p && it.p.status === "IN_PROGRESS" && it.p.last_position_seconds > 0)
    .sort((a, b) => (b.p!.last_seen_at ?? "").localeCompare(a.p!.last_seen_at ?? ""))
    .slice(0, 3);
  return items;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
