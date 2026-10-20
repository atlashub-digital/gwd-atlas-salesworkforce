import type {Metadata} from "next";
import Link from "next/link";
import {loadAllSeries, DEMO_CATALOG_LABEL} from "../../lib/academy/catalog";
import {formatDuration} from "../../lib/academy/progress";
import SiteFrame from "../../components/SiteFrame";
import CatalogExplorer from "./components/CatalogExplorer";
import {DemoBadge, Poster, TierChip} from "./components/bits";
import "./academy.css";

export const metadata:Metadata = {title:"Academy"};

export const dynamic = "force-dynamic"; // catálogo via API (GWD_API_URL) com fallback estático

export default async function AcademyHome(){
  const {series} = await loadAllSeries();
  const featured = series.find(s => s.featured);
  const featuredFree = featured ? featured.episodes.filter(e => e.accessTier === "FREE").length : 0;
  const featuredDuration = featured ? featured.episodes.reduce((a, e) => a + e.durationSeconds, 0) : 0;
  return (
    <SiteFrame>
      <section className="ac-hero" aria-labelledby="ac-hero-title">
        <div className="ac-hero-grid">
          <div className="ac-hero-copy">
            <span className="eyebrow">GWD Academy · Aprender para avançar</span>
            <h1 id="ac-hero-title">Aprende hoje o que o mercado digital exige.</h1>
            <p className="lead">Séries organizadas por temporada, com vídeo, leitura e prática. O progresso é teu: fica registado, auditável e retoma exatamente onde ficaste.</p>
            <div className="actions">
              <Link className="button" href="/academy/series/gwd-start">Começar por GWD Start ↗</Link>
              <Link className="button secondary" href="/entrar">Registar o meu interesse ↗</Link>
            </div>
            <p className="small muted">Estados de progresso honestos — a Academy nunca apresenta números que não existam. <DemoBadge/></p>
          </div>
          {featured && (
            <div className="ac-featured">
              <div className="ac-featured-media">
                <Poster initials={featured.posterInitials} gradient={featured.posterGradient} title={featured.title}/>
              </div>
              <div className="ac-featured-body">
                <div className="ac-chip-row"><TierChip tier="PREMIUM"/><span className="ac-chip ac-chip--mode">{featured.episodes.length} episódios</span></div>
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <p className="small muted">{featuredFree} episódios grátis para experimentar · {formatDuration(featuredDuration)} de conteúdo · {DEMO_CATALOG_LABEL}</p>
                <div className="actions">
                  <Link className="button" href={`/academy/series/${featured.slug}`}>Ver a série ↗</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <CatalogExplorer/>
    </SiteFrame>
  );
}
