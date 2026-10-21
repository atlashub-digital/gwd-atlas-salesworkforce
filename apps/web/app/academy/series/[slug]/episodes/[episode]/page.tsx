import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {allSeries, loadEpisode} from "../../../../../../lib/academy/catalog";
import {providerFor} from "../../../../../../lib/academy/providers";
import {resolveAccess} from "../../../../../../lib/academy/access";
import {formatDuration} from "../../../../../../lib/academy/progress";
import SiteFrame from "../../../../../../components/SiteFrame";
import EpisodeWorkspace from "../../../../components/EpisodeWorkspace";
import EpisodeSidebar from "../../../../components/EpisodeSidebar";
import {DemoBadge, ModeChip, TierChip} from "../../../../components/bits";
import "../../../../academy.css";

export function generateStaticParams(){
  return allSeries().flatMap(s => s.episodes.map(e => ({slug: s.slug, episode: e.slug})));
}
export const dynamic = "force-dynamic"; // episódio: generateMetadata chama API (loadEpisode); evita bailout em geração estática
export async function generateMetadata({params}:{params:Promise<{slug:string;episode:string}>}):Promise<Metadata>{
  const p = await params;
  const found = await loadEpisode(p.slug, p.episode);
  return found ? {title: found.episode.title} : {};
}


export default async function EpisodePage({params}:{params:Promise<{slug:string;episode:string}>}){
  const p = await params;
  const found = await loadEpisode(p.slug, p.episode);
  if (!found) notFound();
  const {series, episode} = found;
  const provider = providerFor(episode);
  const access = await resolveAccess(episode);
  const locked = !access.canAccess;
  return (
    <SiteFrame>
      <p className="small" style={{paddingTop:"var(--space-5)"}}><Link className="link" href={`/academy/series/${series.slug}`}>← {series.title}</Link> · <Link className="link" href="/academy">Academy</Link></p>
      <section className="ac-episode-grid" aria-labelledby="ac-episode-title">
        <div>
          <div className="ac-chip-row">
            <span className="ac-ep-code">{episode.code}</span>
            <ModeChip mode={episode.deliveryMode}/>
            <TierChip tier={episode.accessTier}/>
            <span className="ac-chip ac-chip--mode">{formatDuration(episode.durationSeconds)}</span>
            <DemoBadge/>
          </div>
          <h1 id="ac-episode-title">{episode.title}</h1>
          <p className="lead" style={{color:"var(--muted)"}}>{episode.summary}</p>
          <EpisodeWorkspace series={series} episode={episode} locked={locked}/>
        </div>
        <EpisodeSidebar series={series} episode={episode}/>
      </section>
      <p className="small muted" style={{paddingBottom:"var(--space-6)"}}>
        Delivery: {episode.deliveryMode} · provider {provider.kind} · progresso anexado a episode_id (independente do provider). TODO(POST /v1/academy): heartbeats e conclusões serão gravados no servidor com regras idempotentes.
      </p>
    </SiteFrame>
  );
}
