import type {Metadata} from "next";
import Link from "next/link";
import {loadAllSeries} from "../../lib/academy/catalog";
import {formatDuration} from "../../lib/academy/progress";
import SiteFrame from "../../components/SiteFrame";
import {appUrl} from "../../lib/site";
import CatalogExplorer from "./components/CatalogExplorer";
import {Poster, TierChip} from "./components/bits";
import "./academy.css";

export const metadata:Metadata = {title:"Academy"};


export default async function AcademyHome(){
  const {series} = await loadAllSeries();
  const featured = series.find(s => s.featured);
  const featuredFree = featured ? featured.episodes.filter(e => e.accessTier === "FREE").length : 0;
  const featuredTier = featured?.episodes.some(e => e.accessTier === "PREMIUM" || e.accessTier === "CERTIFIED") ? "PREMIUM" : "FREE";
  const featuredDuration = featured ? featured.episodes.reduce((a, e) => a + e.durationSeconds, 0) : 0;
  return (
    <SiteFrame>
      <section className="ac-hero" aria-labelledby="ac-hero-title">
        <div className="ac-hero-grid">
          <div className="ac-hero-copy">
            <span className="eyebrow">GWD Academy · Aprender para avançar</span>
            <h1 id="ac-hero-title">Aprende hoje o que o mercado digital exige.</h1>
            <p className="lead">Séries organizadas por temporada, com leitura, verificação e prática. Aprendes na tua área GWD, onde o progresso fica registado e retomas exatamente onde ficaste.</p>
            <div className="actions">
              <Link className="button" href="/academy/series/gwd-start">Começar por GWD Start ↗</Link>
              <a className="button secondary" href={appUrl+"/academy"}>A minha Academy ↗</a>
            </div>
            <p className="small muted">Estados de progresso honestos — a Academy nunca apresenta números que não existam.</p>
          </div>
          {featured && (
            <div className="ac-featured">
              <div className="ac-featured-media">
                <Poster initials={featured.posterInitials} gradient={featured.posterGradient} title={featured.title} slug={featured.slug}/>
              </div>
              <div className="ac-featured-body">
                <div className="ac-chip-row"><TierChip tier={featuredTier}/><span className="ac-chip ac-chip--mode">{featured.episodes.length} episódios</span></div>
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <p className="small muted">{featuredFree} episódios abertos sem conta · {formatDuration(featuredDuration)} de leitura e verificação</p>
                <div className="actions">
                  <Link className="button" href={`/academy/series/${featured.slug}`}>Ver a série ↗</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <CatalogExplorer appAcademyUrl={appUrl+"/academy"}/>
    </SiteFrame>
  );
}
