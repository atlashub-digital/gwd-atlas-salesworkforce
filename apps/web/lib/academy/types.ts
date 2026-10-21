/* GWD Academy Streaming V1 — tipos do domínio (fonte: academy-src/GAMIFICATION.md + HYBRID.md).
   Estrutura espelha a futura shape de DB (DATA_MODEL_SQL é proposal — NÃO aplicar). */

export type EpisodeType = "VIDEO" | "READER" | "HYBRID" | "QUIZ" | "ASSIGNMENT" | "LIVE" | "EXTERNAL";
export type DeliveryMode = "WEBPLAYER" | "WEBREADER" | "HYBRID" | "TELEGRAM" | "EXTERNAL";
export type DeliveryProviderKind = "ATLAS_MEDIA" | "GWD_READER" | "TELEGRAM" | "EXTERNAL";
export type AccessTier = "FREE" | "MEMBER" | "PREMIUM" | "CERTIFIED";
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type CompletionMethod = "SEEK_GUARDED" | "SELF_ATTESTED" | "QUIZ_VERIFIED" | "MANUAL_REVIEW" | "NONE";
export type HybridPolicy = "ANY" | "BOTH" | "QUIZ";

export type ReaderSection = { heading: string; body: string };
export type QuizQuestion = { id: string; prompt: string; options: string[]; correctIndex: number };

export type EpisodeAsset = {
  kind: "video" | "reader" | "workbook" | "resource" | "quiz";
  /** Id do asset no provider — o provider resolve para URL real em produção. */
  assetId: string;
  /** Demo: nenhum asset tem media real; providers devolvem null e a UI mostra shell demo. */
  durationSeconds?: number;
  title?: string;
  url?: string;
  sections?: ReaderSection[];
  resources?: { title: string; description: string }[];
  quiz?: QuizQuestion[];
};

export type Episode = {
  id: string;
  slug: string;
  seriesId: string;
  seasonNumber: number;
  number: number; // 1-based dentro da série (EP01..EPn)
  code: string; // "EP01"
  title: string;
  summary: string;
  episodeType: EpisodeType;
  deliveryMode: DeliveryMode;
  provider: DeliveryProviderKind;
  accessTier: AccessTier;
  hybridPolicy?: HybridPolicy;
  durationSeconds: number;
  assets: EpisodeAsset[];
};

export type Season = { number: number; title: string; episodeIds: string[] };

export type Series = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string; // fundamentos | social-media | vendas
  featured?: boolean;
  posterInitials: string;
  posterGradient: string; // gradiente CSS (nunca fotos fake de pessoas)
  seasons: Season[];
  episodes: Episode[];
};

/* ---------- Progress (shape = futura tabela academy_episode_progress) ---------- */
export type EpisodeProgress = {
  episode_id: string;
  series_id: string;
  status: ProgressStatus;
  last_position_seconds: number;
  duration_seconds: number;
  engaged_seconds: number;
  progress_percent: number;
  completion_method: CompletionMethod | null;
  first_started_at: string | null;
  last_seen_at: string | null;
  completed_at: string | null;
};
