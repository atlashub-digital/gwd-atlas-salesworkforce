/* GWD Academy Streaming V1 — catálogo mock HONESTO ("Demo catalog V1").
   3 séries demo com episódios que cobrem VIDEO/READER/HYBRID/QUIZ/TELEGRAM/EXTERNAL
   e tiers FREE/MEMBER/PREMIUM/CERTIFIED. Nenhuma media real: posters são gradientes
   CSS com iniciais (nunca fotos fake de pessoas) e providers devolvem null. */

import type {AccessTier, Episode, EpisodeAsset, Series} from "./types";

export const DEMO_CATALOG_LABEL = "Demo catalog V1";

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

/* ---------- GWD Start (FREE) — 2 temporadas, 6 episódios ---------- */
const gwdStartEpisodes: Episode[] = [
  ...build("gwd-start", 1, 1, [
    {slug: "boas-vindas-gwd", title: "Boas-vindas à GWD", summary: "Como funciona a Academy, o que esperar de cada série e como o progresso é registado.", type: "VIDEO", mode: "WEBPLAYER", provider: "ATLAS_MEDIA", tier: "FREE", seconds: 420},
    {slug: "o-teu-ponto-de-partida", title: "O teu ponto de partida no digital", summary: "Reconhece as tuas competências e escolhe um primeiro objetivo realista.", type: "READER", mode: "WEBREADER", provider: "GWD_READER", tier: "FREE", seconds: 600, resources: [{title: "Folha de objetivos (demo)", description: "Modelo simples para definir o teu primeiro objetivo."}]},
    {slug: "tres-caminhos", title: "Três caminhos, responsabilidades diferentes", summary: "Distingue Social Media, afiliação e revenda autorizada antes de escolher.", type: "HYBRID", mode: "HYBRID", provider: "ATLAS_MEDIA", tier: "FREE", seconds: 540, hybridPolicy: "ANY"},
    {slug: "verificacao-fundamentos", title: "Verificação de fundamentos", summary: "Quiz curto para confirmar que dominas a base antes de avançar.", type: "QUIZ", mode: "WEBREADER", provider: "GWD_READER", tier: "FREE", seconds: 300, withQuiz: true},
  ]),
  ...build("gwd-start", 2, 5, [
    {slug: "etica-e-confianca", title: "Conteúdo que merece confiança", summary: "Comunica com transparência e respeita pessoas e direitos.", type: "READER", mode: "WEBREADER", provider: "GWD_READER", tier: "MEMBER", seconds: 540},
    {slug: "rotina-de-aprendizagem", title: "Construir uma rotina de aprendizagem", summary: "Consistência simples: o que fazer todos os dias para avançar sem despender horas.", type: "HYBRID", mode: "HYBRID", provider: "ATLAS_MEDIA", tier: "MEMBER", seconds: 480, hybridPolicy: "ANY"},
  ]),
];

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
    id: "demo-series-gwd-start",
    slug: "gwd-start",
    title: "GWD Start",
    subtitle: "Fundamentos para começar no digital",
    description: "A série de entrada da Academy: como funciona a plataforma, reconhecer competências, escolher um caminho e construir rotina de aprendizagem.",
    category: "fundamentos",
    posterInitials: "GS",
    posterGradient: "linear-gradient(140deg,#0060f0 0%,#00e5ff 100%)",
    seasons: [
      {number: 1, title: "Fundamentos", episodeIds: gwdStartEpisodes.filter(e => e.seasonNumber === 1).map(e => e.id)},
      {number: 2, title: "Rotina e ética", episodeIds: gwdStartEpisodes.filter(e => e.seasonNumber === 2).map(e => e.id)},
    ],
    episodes: gwdStartEpisodes,
  },
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
    featured: true,
    posterInitials: "DI",
    posterGradient: "linear-gradient(140deg,#0a315c 0%,#00c8f0 100%)",
    seasons: [{number: 1, title: "Domina o Instagram", episodeIds: instagramEpisodes.map(e => e.id)}],
    episodes: instagramEpisodes,
  },
];

export const categories = ["fundamentos", "social-media", "vendas"] as const;

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
