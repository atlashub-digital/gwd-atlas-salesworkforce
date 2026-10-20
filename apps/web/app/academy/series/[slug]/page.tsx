import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {allSeries, getSeries} from "../../../../lib/academy/catalog";
import {formatDuration} from "../../../../lib/academy/progress";
import {DEMO_PARTICIPANT_TIER} from "../../../../lib/academy/access";
import SiteFrame from "../../../../components/SiteFrame";
import SeriesSeasons from "../../components/SeriesSeasons";
import {DemoBadge, Poster, TierChip} from "../../components/bits";
import "../../academy.css";

export function generateStaticParams(){return allSeries().map(s => ({slug: s.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{return {title:(await params).slug.replace(/-/g," ")};}

export default async function SeriesPage({params}:{params:Promise<{slug:string}>}){
  const s = getSeries((await params).slug);
  if (!s) notFound();
  const freeCount = s.episodes.filter(e => e.accessTier === "FREE").length;
  const duration = s.episodes.reduce((a, e) => a + e.durationSeconds, 0);
  const lockedCount = s.episodes.filter(e => e.accessTier !== "FREE").length; // participante demo FREE
  return (
    <SiteFrame>
      <section className="ac-series-head" aria-labelledby="ac-series-title">
        <Poster initials={s.posterInitials} gradient={s.posterGradient} title={s.title}/>
        <div>
          <span className="eyebrow">Série · {s.category}</span>
          <h1 id="ac-series-title">{s.title}</h1>
          <p>{s.description}</p>
          <div className="ac-chip-row">
            <TierChip tier={s.episodes.some(e => e.accessTier === "CERTIFIED") ? "CERTIFIED" : s.episodes.some(e => e.accessTier === "PREMIUM") ? "PREMIUM" : s.episodes.some(e => e.accessTier === "MEMBER") ? "MEMBER" : "FREE"}/>
            <span className="ac-chip ac-chip--mode">{s.episodes.length} episódios</span>
            <span className="ac-chip ac-chip--mode">{s.seasons.length} temporada{s.seasons.length > 1 ? "s" : ""}</span>
            <span className="ac-chip ac-chip--mode">{formatDuration(duration)}</span>
          </div>
          <p className="small muted">{freeCount} episódios abertos · {lockedCount} exigem acesso (participante demo: {DEMO_PARTICIPANT_TIER}) · <DemoBadge/></p>
          <p className="small"><Link className="link" href="/academy">← Voltar à Academy</Link></p>
        </div>
      </section>
      <section aria-label="Episódios da série">
        <SeriesSeasons series={s}/>
      </section>
    </SiteFrame>
  );
}
