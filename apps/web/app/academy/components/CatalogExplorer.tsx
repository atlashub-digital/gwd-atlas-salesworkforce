"use client";
/* Public Academy catalogue (discovery). Watching, progress and XP live in the member app,
   where they are server-authoritative — this page never stores or shows simulated progress. */
import {useState} from "react";
import Link from "next/link";
import {categories, series} from "../../../lib/academy/catalog";
import {formatDuration} from "../../../lib/academy/progress";
import {Poster, TierChip} from "./bits";

export default function CatalogExplorer({appAcademyUrl}:{appAcademyUrl:string}){
  const [category, setCategory] = useState<string>("todas");
  const visible = category === "todas" ? series : series.filter(s => s.category === category);
  return (
    <>
      <section className="ac-continue" aria-labelledby="ac-continue-title">
        <div className="ac-continue-head">
          <div>
            <span className="eyebrow">Continuar a aprender</span>
            <h2 id="ac-continue-title">O teu progresso fica na tua área GWD</h2>
          </div>
        </div>
        <p className="ac-empty">Entra para retomar exatamente onde ficaste. O progresso e o XP são registados no servidor, por episódio. <a className="link" href={appAcademyUrl}>Abrir a minha Academy →</a></p>
      </section>
      <section aria-labelledby="ac-catalog-title">
        <div className="ac-continue-head">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h2 id="ac-catalog-title">Séries da Academy</h2>
          </div>
        </div>
        <div className="ac-filters" role="group" aria-label="Filtrar por categoria">
          {(["todas", ...categories] as string[]).map(c => (
            <button key={c} type="button" className="ac-filter" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c === "todas" ? "Todas" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="ac-series-grid">{visible.map(s => <SeriesCard key={s.slug} s={s}/>)}</div>
      </section>
    </>
  );
}

function SeriesCard({s}:{s:(typeof series)[number]}){
  const freeCount = s.episodes.filter(e => e.accessTier === "FREE").length;
  const duration = s.episodes.reduce((acc, e) => acc + e.durationSeconds, 0);
  const topTier = s.episodes.some(e => e.accessTier === "CERTIFIED") ? "CERTIFIED" : s.episodes.some(e => e.accessTier === "PREMIUM") ? "PREMIUM" : s.episodes.some(e => e.accessTier === "MEMBER") ? "MEMBER" : "FREE";
  return (
    <article className="ac-series-card">
      <Link href={`/academy/series/${s.slug}`} style={{textDecoration:"none",color:"inherit"}}>
        <Poster initials={s.posterInitials} gradient={s.posterGradient} tile title={s.title} slug={s.slug}/>
      </Link>
      <div className="ac-series-card-body">
        <span className="eyebrow">{s.subtitle}</span>
        <h3><Link className="ac-episode-link" href={`/academy/series/${s.slug}`}>{s.title}</Link></h3>
        <p>{s.description}</p>
        <div className="ac-chip-row">
          <TierChip tier={topTier}/>
          <span className="ac-chip ac-chip--mode">{s.episodes.length} episódios</span>
          <span className="ac-chip ac-chip--mode">{freeCount} grátis</span>
          <span className="ac-chip ac-chip--mode">{formatDuration(duration)} total</span>
        </div>
      </div>
    </article>
  );
}
