/* GWD Academy Streaming V1 — abstração de providers de delivery.
   Regra crítica (HYBRID.md): a identidade do episódio é independente do provider.
   O progresso é sempre anexado a episode_id (ver progress.ts) — trocar o provider
   de um episódio (TELEGRAM → ATLAS_MEDIA) não altera nem reinicia progresso. */

import type {DeliveryMode, DeliveryProviderKind, Episode, EpisodeAsset} from "./types";

export type ProviderCapabilities = {
  /** O provider suporta retomar de last_position_seconds. */
  resume: boolean;
  /** O provider permite tracking de engaged time no cliente. */
  engagedTracking: boolean;
  /** O provider entrega media de vídeo no WebPlayer. */
  video: boolean;
  /** O provider entrega texto (WebReader). */
  reader: boolean;
  /** O provider suporta handoff para fora da GWD (Telegram/URL externa). */
  handoff: boolean;
};

export interface DeliveryProvider {
  readonly kind: DeliveryProviderKind;
  readonly capabilities: ProviderCapabilities;
  /**
   * Resolve a URL reproduzível de um asset. Em produção aponta para o media
   * gateway Atlas (token curto) / reader CDN / invite Telegram / URL externa.
   * Demo V1: devolve sempre null — as UIs renderizam shells honestos "demo".
   */
  getAssetUrl(asset: EpisodeAsset): Promise<string | null>;
  /** Posição de retoma em segundos (null = sem posição guardada). */
  getResumePosition?(asset: EpisodeAsset): Promise<number | null>;
}

/** Playback must be authorized server-side by episode/access policy.
 * An asset ID is never an entitlement. Until that contract is connected,
 * fail closed; do not call a guessed public gateway from the browser.
 * Resume remains in GWD progress keyed by episode_id, never by media asset.
 */
export const AtlasMediaProvider: DeliveryProvider = {
  kind: "ATLAS_MEDIA",
  capabilities: {resume: true, engagedTracking: true, video: true, reader: false, handoff: false},
  getAssetUrl: async () => null,
};
/** WebReader first-class (HYBRID.md): texto tipográfico com progresso de leitura. */
export const ReaderProvider: DeliveryProvider = {
  kind: "GWD_READER",
  capabilities: {resume: true, engagedTracking: true, video: false, reader: true, handoff: false},
  getAssetUrl: async () => null, // Demo: o conteúdo vive no catálogo mock
  getResumePosition: async () => null,
};

/** Telegram é provider de delivery, nunca fonte de verdade (HYBRID.md). */
export const TelegramProvider: DeliveryProvider = {
  kind: "TELEGRAM",
  capabilities: {resume: false, engagedTracking: false, video: false, reader: false, handoff: true},
  getAssetUrl: async () => null, // Invite nunca exposto em HTML; gerado por server action mock
};

export const ExternalProvider: DeliveryProvider = {
  kind: "EXTERNAL",
  capabilities: {resume: false, engagedTracking: false, video: false, reader: false, handoff: true},
  getAssetUrl: async () => null,
};

const registry: Record<DeliveryProviderKind, DeliveryProvider> = {
  ATLAS_MEDIA: AtlasMediaProvider,
  GWD_READER: ReaderProvider,
  TELEGRAM: TelegramProvider,
  EXTERNAL: ExternalProvider,
};

export function getProvider(kind: DeliveryProviderKind): DeliveryProvider {
  return registry[kind];
}

/** Modo efetivo de entrega de um episódio = delivery_mode declarado no catálogo. */
export function episodeDeliveryMode(episode: Episode): DeliveryMode {
  return episode.deliveryMode;
}

export function providerFor(episode: Episode): DeliveryProvider {
  return getProvider(episode.provider);
}
