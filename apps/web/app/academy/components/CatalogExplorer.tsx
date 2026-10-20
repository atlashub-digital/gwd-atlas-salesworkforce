"use client";
/* Home da Academy — filtros por categoria + grelha de séries + "Continuar a aprender".
   Progresso é lido de localStorage (mock) após montagem; o markup inicial é
   idêntico ao do servidor (sem progresso) para não haver mismatch de hidratação. */
import {useEffect, useState} from "react";
import Link from "next/link";
import {categories, DEMO_CATALOG_LABEL, series} from "../../../lib/academy/catalog";
import type {EpisodeProgress} from "../../../lib/academy/types";
import {continueLearning, formatDuration, getAllProgress, seriesProgress} from "../../../lib/academy/progress";
import {DemoBadge, Poster, TierChip} from "./bits";

type ContinueItem = {seriesSlug: string; seriesTitle: string; episodeSlug: string; code: string; title: string; percent: number};

export default function CatalogExplorer(){
  const [category, setCategory] = useState<string>("todas");
  const [progress, setProgress] = useState<Record<string, EpisodeProgress> | null>(null);
  const [continueItems, setContinueItems] = useState<ContinueItem[]>([]);
  useEffect(() => {
    // TODO(POST /v1/academy): substituir por GET /v1/academy/progress do participante
    getAllProgress().then(p => {
      setProgress(p);
      setContinueItems(continueLearning(series.map(s => ({seriesId: s.id, episodes: s.episodes})), p).map(it => ({
        seriesSlug: series.find(s => s.id === it.seriesId)!.slug,
        seriesTitle: series.find(s => s.id === it.seriesId)!.title,
        episodeSlug: it.episode.slug,
        code: it.episode.code,
        title: it.episode.title,
        percent: it.p!.progress_percent,
      })));
    });
  }, []);

  const visible = category === "todas" ? series : series.filter(s => s.category === category);

  return (
    <>
      <section className="ac-continue" aria-labelledby="ac-continue-title">
        <div className="ac-continue-head">
          <div>
            <span className="eyebrow">Continuar a aprender</span>
            <h2 id="ac-continue-title">Retoma onde ficaste</h2>
          </div>
          <DemoBadge/>
        </div>
        {continueItems.length === 0 ? (
          <p className="ac-empty">Ainda sem episódios em progresso. Começa por uma série abaixo — o progresso fica guardado neste dispositivo durante a demo.</p>
        ) : (
          <div className="ac-continue-grid">
            {continueItems.map(it => (
              <Link key={it.episodeSlug} className="ac-continue-card" href={`/academy/series/${it.seriesSlug}/episodes/${it.episodeSlug}`}>
                <span className="eyebrow">{it.code} · {it.seriesTitle}</span>
                <h3>{it.title}</h3>
                <span className="ac-meta">{it.percent}% concluído</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="ac-catalog-title">
        <div className="ac-continue-head">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h2 id="ac-catalog-title">Séries da Academy</h2>
          </div>
          <span className="ac-demo-note">{DEMO_CATALOG_LABEL}</span>
        </div>
        <div className="ac-filters" role="group" aria-label="Filtrar por categoria">
          {(["todas", ...categories] as string[]).map(c => (
            <button key={c} type="button" className="ac-filter" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c === "todas" ? "Todas" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="ac-series-grid">
          {visible.map(s => <SeriesCard key={s.slug} s={s} progress={progress}/>)}
        </div>
      </section>
    </>
  );
}

function SeriesCard({s, progress}:{s:(typeof series)[number];progress:Record<string, EpisodeProgress> | null}){
  const sp = progress ? seriesProgress(s.episodes, progress) : null;
  const total = s.episodes.length;
  const freeCount = s.episodes.filter(e => e.accessTier === "FREE").length;
  const duration = s.episodes.reduce((acc, e) => acc + e.durationSeconds, 0);
  const topTier = s.episodes.some(e => e.accessTier === "CERTIFIED") ? "CERTIFIED" : s.episodes.some(e => e.accessTier === "PREMIUM") ? "PREMIUM" : s.episodes.some(e => e.accessTier === "MEMBER") ? "MEMBER" : "FREE";
  return (
    <article className="ac-series-card">
      <Link href={`/academy/series/${s.slug}`} style={{textDecoration:"none",color:"inherit"}}>
        <Poster initials={s.posterInitials} gradient={s.posterGradient} tile title={s.title}/>
      </Link>
      <div className="ac-series-card-body">
        <span className="eyebrow">{s.subtitle}</span>
        <h3><Link className="ac-episode-link" href={`/academy/series/${s.slug}`}>{s.title}</Link></h3>
        <p>{s.description}</p>
        <div className="ac-chip-row">
          <TierChip tier={topTier}/>
          <span className="ac-chip ac-chip--mode">{total} episódios</span>
          <span className="ac-chip ac-chip--mode">{freeCount} grátis</span>
          <span className="ac-chip ac-chip--mode">{formatDuration(duration)} total</span>
        </div>
        <div className="ac-series-card-foot">
          {sp && sp.started ? (
            <div className="ac-progress-mini">
              <div className="progress" role="progressbar" aria-label={`Progresso da série ${s.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={sp.percent}><span style={{width:`${sp.percent}%`}}/></div>
              <span className="ac-meta">{sp.completed}/{total} concluídos</span>
            </div>
          ) : (
            <span className="ac-locked-note">Ainda não começaste esta série.</span>
          )}
        </div>
      </div>
    </article>
  );
}
