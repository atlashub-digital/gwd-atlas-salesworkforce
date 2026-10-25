/* GWD Academy — catálogo versionado.
   `series`: catálogo publicado (GWD Start definitivo, ./gwd-start.ts).
   `demoSeries`: 2 séries demo (VIDEO/HYBRID/TELEGRAM/EXTERNAL, tiers MEMBER/PREMIUM/CERTIFIED) usadas só como
   fixtures de teste; nunca publicadas em produção (o seed marca-as DRAFT). Nenhuma media real nas demo. */

import type {AccessTier, Episode, EpisodeAsset, Season, Series} from "./types";
import {gwdStartEpisodes} from "./gwd-start";
import {comunidadeObjetivosEpisodes} from "./comunidade-e-objetivos";
import {socialMediaEpisodes} from "./social-media";
import {afiliadoDigitalEpisodes} from "./afiliado-digital";
import {revendedorAutorizadoEpisodes} from "./revendedor-autorizado";


type EpisodeSeed = {
  slug: string;
  title: string;
  summary: string;
  type: Episode["episodeType"];
  mode: Episode["deliveryMode"];
  provider: Episode["provider"];
  tier: AccessTier;
  seconds: number;
  hybridPolicy?: Episode["hybridPolicy"];
  withQuiz?: boolean;
  resources?: {title: string; description: string}[];
};

function assets(seed: EpisodeSeed): EpisodeAsset[] {
  const list: EpisodeAsset[] = [];
  if (seed.mode === "WEBPLAYER" || seed.mode === "HYBRID") {
    list.push({kind: "video", assetId: `demo-video-${seed.slug}`, durationSeconds: seed.seconds});
  }
  if (seed.mode === "WEBREADER" || seed.mode === "HYBRID") {
    list.push({
      kind: "reader",
      assetId: `demo-reader-${seed.slug}`,
      title: "Versão de leitura",
      sections: [
        {heading: "O que vais aprender", body: "Nesta leitura encontras a mesma matéria do vídeo, organizada para consulta rápida. Este conteúdo é uma versão demo do catálogo V1."},
        {heading: "Na prática", body: "Aplica o que leste num exemplo concreto do teu dia a dia. A prática consistente vale mais do que consumo passivo de conteúdo."},
        {heading: "Resumo", body: "Resume os pontos-chave e prepara o próximo episódio. O progresso de leitura é calculado pela secção mais distante que abriste."},
      ],
    });
  }
  if (seed.withQuiz) {
    list.push({
      kind: "quiz",
      assetId: `demo-quiz-${seed.slug}`,
      quiz: [{
        id: `${seed.slug}-q1`,
        prompt: "Questão de verificação (demo): o que faz avançar o teu progresso na Academy?",
        options: ["Abrir o episódio", "Completar episódios com participação real", "Comprar Premium", "Navegar no catálogo"],
        correctIndex: 1,
      }],
    });
  }
  if (seed.resources?.length) {
    list.push({kind: "resource", assetId: `demo-resources-${seed.slug}`, title: "Recursos", resources: seed.resources});
  }
  return list;
}

function build(seriesId: string, season: number, firstNumber: number, seeds: EpisodeSeed[]): Episode[] {
  return seeds.map((seed, i) => ({
    id: `demo-ep-${seed.slug}`,
    slug: seed.slug,
    seriesId,
    seasonNumber: season,
    number: firstNumber + i,
    code: `EP${String(firstNumber + i).padStart(2, "0")}`,
    title: seed.title,
    summary: seed.summary,
    episodeType: seed.type,
    deliveryMode: seed.mode,
    provider: seed.provider,
    accessTier: seed.tier,
    hybridPolicy: seed.hybridPolicy,
    durationSeconds: seed.seconds,
    assets: assets(seed),
  }));
}

/* ---------- Conecta que Converte (MEMBER) — 5 episódios ---------- */
const conectaEpisodes: Episode[] = build("conecta-que-converte", 1, 1, [
  {slug: "mensagem-clara", title: "Uma mensagem clara vende mais", summary: "Define o que dizes, a quem dizes e por que razão te ouvem.", type: "VIDEO", mode: "WEBPLAYER", provider: "ATLAS_MEDIA", tier: "FREE", seconds: 480},
  {slug: "publico-e-valor", title: "Público e proposta de valor", summary: "Identifica quem serves e que problema resolves em primeiro lugar.", type: "READER", mode: "WEBREADER", provider: "GWD_READER", tier: "MEMBER", seconds: 660},
  {slug: "conversa-que-converte", title: "A conversa que converte", summary: "Do primeiro contacto à decisão: estrutura de conversa sem pressão.", type: "VIDEO", mode: "WEBPLAYER", provider: "ATLAS_MEDIA", tier: "MEMBER", seconds: 600},
  {slug: "verificacao-conversa", title: "Verificação: conversa que converte", summary: "Quiz curto para validar a estrutura de conversa aprendida.", type: "QUIZ", mode: "WEBREADER", provider: "GWD_READER", tier: "MEMBER", seconds: 300, withQuiz: true},
  {slug: "biblioteca-de-respostas", title: "Biblioteca de respostas no Telegram", summary: "Catálogo completo de respostas pronto a usar, entregue no canal Telegram da série.", type: "VIDEO", mode: "TELEGRAM", provider: "TELEGRAM", tier: "MEMBER", seconds: 720},
]);

/* ---------- Domina o Instagram (PREMIUM, featured) — 8 episódios ---------- */
const instagramEpisodes: Episode[] = build("domina-instagram", 1, 1, [
  {slug: "domina-introducao", title: "Domina o Instagram: introdução", summary: "O mapa completo da série: posição, conteúdo e conversão.", type: "VIDEO", mode: "WEBPLAYER", provider: "ATLAS_MEDIA", tier: "FREE", seconds: 420},
  {slug: "posicionamento", title: "Posicionamento que se reconhece", summary: "Constrói um perfil que comunica valor em três segundos.", type: "HYBRID", mode: "HYBRID", provider: "ATLAS_MEDIA", tier: "PREMIUM", seconds: 660, hybridPolicy: "ANY", withQuiz: true},
  {slug: "planeamento-de-conteudo", title: "Planeamento de conteúdo em lotes", summary: "Produz uma semana de conteúdo num único bloco de trabalho.", type: "VIDEO", mode: "WEBPLAYER", provider: "ATLAS_MEDIA", tier: "PREMIUM", seconds: 720},
  {slug: "stories-que-vendem", title: "Stories que vendem sem forçar", summary: "Sequência de stories: atenção, valor, prova e convite.", type: "VIDEO", mode: "WEBPLAYER", provider: "ATLAS_MEDIA", tier: "PREMIUM", seconds: 600},
  {slug: "reels-alcance", title: "Reels e alcance orgânico", summary: "O que faz um reel circular e como repetir o padrão com ética.", type: "HYBRID", mode: "HYBRID", provider: "ATLAS_MEDIA", tier: "PREMIUM", seconds: 780, hybridPolicy: "ANY"},
  {slug: "canal-telegram-avancado", title: "Biblioteca avançada no Telegram", summary: "O restante arquivo da série vive no canal privado Telegram, indexado por episódio.", type: "VIDEO", mode: "TELEGRAM", provider: "TELEGRAM", tier: "PREMIUM", seconds: 900},
  {slug: "checklist-certificada", title: "Checklist final certificada", summary: "Verificação QUIZ_VERIFIED exigida para a capacidade SOCIAL_MEDIA_L1 (demo).", type: "QUIZ", mode: "WEBREADER", provider: "GWD_READER", tier: "CERTIFIED", seconds: 420, withQuiz: true},
  {slug: "recurso-externo-meta", title: "Recursos oficiais da plataforma", summary: "Referência externa oficial de boas práticas (abre fora da GWD).", type: "EXTERNAL", mode: "EXTERNAL", provider: "EXTERNAL", tier: "PREMIUM", seconds: 300},
]);

export const series: Series[] = [
  {
    id: "series-gwd-start",
    slug: "gwd-start",
    title: "GWD Start",
    subtitle: "Fundamentos para começar no digital",
    description: "A série de entrada da Academy: o que é a GWD, como conta o teu progresso, o teu ponto de partida, os três caminhos, ética e rotina. Gratuita e em leitura.",
    category: "fundamentos",
    featured: true,
    posterInitials: "GS",
    posterGradient: "linear-gradient(140deg,#0060f0 0%,#00e5ff 100%)",
    seasons: [
      {number: 1, title: "Fundamentos", episodeIds: gwdStartEpisodes.filter(e => e.seasonNumber === 1).map(e => e.id)},
      {number: 2, title: "Rotina e ética", episodeIds: gwdStartEpisodes.filter(e => e.seasonNumber === 2).map(e => e.id)},
    ],
    episodes: gwdStartEpisodes,
  },
  {
    id: "series-comunidade-e-objetivos",
    slug: "comunidade-e-objetivos",
    title: "Comunidade e objetivos",
    subtitle: "Fundamentos do Digital · cultura, regras e o teu plano",
    description: "Completa os Fundamentos do Digital: como a comunidade funciona, as regras que nos protegem e como transformar o teu ponto de partida num plano de 30 dias.",
    category: "fundamentos",
    posterInitials: "CO",
    posterGradient: "linear-gradient(140deg,#003a80 0%,#00c8f0 100%)",
    seasons: [{number: 1, title: "Comunidade e objetivos", episodeIds: comunidadeObjetivosEpisodes.map(e => e.id)}],
    episodes: comunidadeObjetivosEpisodes,
  },
  {
    id: "series-social-media",
    slug: "social-media",
    title: "Social Media",
    subtitle: "Conteúdo com propósito, do público às métricas",
    description: "Fundamentos de conteúdo, plataformas e formatos, planeamento editorial, publicação e métricas, ética e direitos. Percurso prático com exercícios e verificação final.",
    category: "social-media",
    posterInitials: "SM",
    posterGradient: "linear-gradient(140deg,#0a315c 0%,#00c8f0 100%)",
    seasons: [{number: 1, title: "Social Media", episodeIds: socialMediaEpisodes.map(e => e.id)}],
    episodes: socialMediaEpisodes,
  },
  {
    id: "series-afiliado-digital",
    slug: "afiliado-digital",
    title: "Afiliado Digital",
    subtitle: "Recomendar com atribuição, transparência e método",
    description: "Como funciona a afiliação, como escolher produtos, links e atribuição, comunicação, regras de transparência e uma campanha prática. Prepara a tua candidatura a afiliado.",
    category: "afiliacao",
    posterInitials: "AF",
    posterGradient: "linear-gradient(140deg,#002040 0%,#0a84ff 100%)",
    seasons: [{number: 1, title: "Afiliado Digital", episodeIds: afiliadoDigitalEpisodes.map(e => e.id)}],
    episodes: afiliadoDigitalEpisodes,
  },
  {
    id: "series-revendedor-autorizado",
    slug: "revendedor-autorizado",
    title: "Revendedor Autorizado",
    subtitle: "Regras comerciais, atendimento e responsabilidade",
    description: "Diferenças face à afiliação, regras comerciais e preços, atendimento, processo de venda, suporte e devoluções. Concluir o percurso não concede o estatuto: esse exige candidatura e aprovação.",
    category: "revenda",
    posterInitials: "RA",
    posterGradient: "linear-gradient(140deg,#001a33 0%,#0060f0 100%)",
    seasons: [{number: 1, title: "Revendedor Autorizado", episodeIds: revendedorAutorizadoEpisodes.map(e => e.id)}],
    episodes: revendedorAutorizadoEpisodes,
  },
];

/** Test fixtures only (never published in production). */
export const demoSeries: Series[] = [
  {
    id: "demo-series-conecta",
    slug: "conecta-que-converte",
    title: "Conecta que Converte",
    subtitle: "Mensagem, público e conversa",
    description: "Da mensagem clara à conversa que converte: estrutura, escuta e respostas prontas sem pressão nem promessas de rendimento.",
    category: "vendas",
    posterInitials: "CC",
    posterGradient: "linear-gradient(140deg,#002040 0%,#0a84ff 100%)",
    seasons: [{number: 1, title: "Conversa que converte", episodeIds: conectaEpisodes.map(e => e.id)}],
    episodes: conectaEpisodes,
  },
  {
    id: "demo-series-domina-instagram",
    slug: "domina-instagram",
    title: "Domina o Instagram para negócios",
    subtitle: "Posição, conteúdo e conversão",
    description: "Série premium de social media: posicionamento, planeamento em lotes, stories com estrutura e reels com alcance orgânico. Biblioteca longa entregue no Telegram.",
    category: "social-media",
    posterInitials: "DI",
    posterGradient: "linear-gradient(140deg,#0a315c 0%,#00c8f0 100%)",
    seasons: [{number: 1, title: "Domina o Instagram", episodeIds: instagramEpisodes.map(e => e.id)}],
    episodes: instagramEpisodes,
  },
];

const published = new Set(series.map(s => s.slug));
export const categories: string[] = [...new Set(series.map(s => s.category))];

/* ---------- API-first (GWD_API_URL, server components) com fallback ao estático ---------- */
/* A DB (via API) é a fonte de verdade para published/tiers/policies/assets; o catálogo
   estático mantém-se como fallback para CI/E2E sem DB e como metadados de apresentação. */

export type CatalogSource = "api" | "static";

function apiBase(): string | undefined {
  const base = process.env.GWD_API_URL;
  return base ? base.replace(/\/+$/, "") : undefined;
}

async function apiGetJson(path: string): Promise<Record<string, unknown> | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const response = await fetch(new URL(path, base), {signal: AbortSignal.timeout(2500), cache: "no-store"});
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    // Nunca engolir sinais internos do Next (bailout de renderização dinâmica):
    // engoli-los transforma um bailout em 500 real.
    if (error instanceof Error && typeof (error as {digest?: string}).digest === "string") throw error;
    return null;
  }
}

function mapApiEpisode(raw: Record<string, unknown>): Episode | null {
  if (typeof raw.id !== "string" || typeof raw.slug !== "string" || !Array.isArray(raw.assets)) return null;
  return {
    id: raw.id,
    slug: raw.slug,
    seriesId: String(raw.seriesId ?? ""),
    seasonNumber: Number(raw.seasonNumber ?? 1),
    number: Number(raw.number ?? 1),
    code: String(raw.code ?? ""),
    title: String(raw.title ?? ""),
    summary: String(raw.summary ?? ""),
    episodeType: (raw.episodeType as Episode["episodeType"]) ?? "VIDEO",
    deliveryMode: (raw.deliveryMode as Episode["deliveryMode"]) ?? "WEBPLAYER",
    provider: (raw.provider as Episode["provider"]) ?? "ATLAS_MEDIA",
    accessTier: (raw.accessTier as AccessTier) ?? "MEMBER",
    hybridPolicy: raw.hybridPolicy as Episode["hybridPolicy"],
    durationSeconds: Number(raw.durationSeconds ?? 0),
    assets: raw.assets as EpisodeAsset[],
  };
}

function mapApiSeries(raw: Record<string, unknown>): Series | null {
  if (typeof raw.slug !== "string" || !Array.isArray(raw.episodes)) return null;
  const episodes = raw.episodes.map(e => mapApiEpisode(e as Record<string, unknown>)).filter((e): e is Episode => e !== null);
  if (!episodes.length) return null;
  const seriesId = String(raw.id ?? episodes[0].seriesId);
  return {
    id: seriesId,
    slug: raw.slug,
    title: String(raw.title ?? raw.slug),
    subtitle: String(raw.subtitle ?? ""),
    description: String(raw.description ?? ""),
    category: String(raw.category ?? ""),
    featured: Boolean(raw.featured),
    posterInitials: String(raw.posterInitials ?? raw.slug.slice(0, 2).toUpperCase()),
    posterGradient: String(raw.posterGradient ?? "linear-gradient(140deg,#002040 0%,#0a84ff 100%)"),
    seasons: (raw.seasons as Season[]) ?? [{number: 1, title: "Temporada 1", episodeIds: episodes.map(e => e.id)}],
    episodes: episodes.map(e => ({...e, seriesId})),
  };
}

export async function loadAllSeries(): Promise<{series: Series[]; source: CatalogSource}> {
  const data = await apiGetJson("/v1/academy/series");
  const items = data && Array.isArray(data.items) ? data.items : null;
  // Public web shows only the versioned catalogue (demo fixtures never leak, whatever the DB state).
  const mapped = items ? items.map(s => mapApiSeries(s as Record<string, unknown>)).filter((s): s is Series => s !== null && published.has(s.slug)) : [];
  return mapped.length ? {series: mapped, source: "api"} : {series, source: "static"};
}

export async function loadSeries(slug: string): Promise<{series: Series; source: CatalogSource} | null> {
  if (!published.has(slug)) return null;
  const data = await apiGetJson(`/v1/academy/series/${encodeURIComponent(slug)}`);
  const raw = data && data.series ? mapApiSeries(data.series as Record<string, unknown>) : null;
  if (raw) return {series: raw, source: "api"};
  const fallback = getSeries(slug);
  return fallback ? {series: fallback, source: "static"} : null;
}

export async function loadEpisode(seriesSlug: string, episodeSlug: string): Promise<{series: Series; episode: Episode; source: CatalogSource} | null> {
  const loaded = await loadSeries(seriesSlug);
  if (!loaded) return null;
  const episode = loaded.series.episodes.find(e => e.slug === episodeSlug);
  return episode ? {series: loaded.series, episode, source: loaded.source} : null;
}

export function allSeries(): Series[] {
  return series;
}

export function getSeries(slug: string): Series | undefined {
  return series.find(s => s.slug === slug);
}

export function getEpisode(seriesSlug: string, episodeSlug: string): {series: Series; episode: Episode} | undefined {
  const s = getSeries(seriesSlug);
  const ep = s?.episodes.find(e => e.slug === episodeSlug);
  return s && ep ? {series: s, episode: ep} : undefined;
}

export function featuredSeries(): Series | undefined {
  return series.find(s => s.featured);
}
