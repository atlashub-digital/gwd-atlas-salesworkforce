/* Builder for Reader/Quiz series (same engine as the GWD Start: WebReader sections, server-side quiz, XP).
   Slugs and ids are stable once published: member progress is linked to them. */

import type {Episode, EpisodeAsset, ReaderSection, QuizQuestion} from "./types";

export type ReaderEpisodeSeed = {
  slug: string;
  season: number;
  title: string;
  summary: string;
  type: "READER" | "QUIZ";
  tier: "FREE" | "MEMBER";
  seconds: number;
  sections: ReaderSection[];
  quiz?: QuizQuestion[];
};

export function buildReaderEpisodes(seriesId: string, seeds: ReaderEpisodeSeed[]): Episode[] {
  return seeds.map((ep, i) => {
    const assets: EpisodeAsset[] = [{kind: "reader", assetId: `${seriesId}-reader-${ep.slug}`, title: "Leitura", sections: ep.sections}];
    if (ep.quiz?.length) assets.push({kind: "quiz", assetId: `${seriesId}-quiz-${ep.slug}`, quiz: ep.quiz.map(q => ({...q, id: `${ep.slug}-${q.id}`}))});
    return {
      id: `${seriesId}-ep-${ep.slug}`,
      slug: ep.slug,
      seriesId,
      seasonNumber: ep.season,
      number: i + 1,
      code: `EP${String(i + 1).padStart(2, "0")}`,
      title: ep.title,
      summary: ep.summary,
      episodeType: ep.type,
      deliveryMode: "WEBREADER",
      provider: "GWD_READER",
      accessTier: ep.tier,
      durationSeconds: ep.seconds,
      assets,
    };
  });
}
