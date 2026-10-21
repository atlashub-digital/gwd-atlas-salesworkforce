import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {allSeries, loadEpisode} from "../../../../../../lib/academy/catalog";
import {formatDuration} from "../../../../../../lib/academy/progress";
import SiteFrame from "../../../../../../components/SiteFrame";
import EpisodeSidebar from "../../../../components/EpisodeSidebar";
import {ModeChip, Poster, TierChip} from "../../../../components/bits";
import {appUrl} from "../../../../../../lib/site";
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
  const watchUrl = `${appUrl}/academy/series/${series.slug}/episodes/${episode.slug}`;
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
          </div>
          <h1 id="ac-episode-title">{episode.title}</h1>
          <p className="lead" style={{color:"var(--muted)"}}>{episode.summary}</p>
          <div className="ac-teaser">
            <Poster initials={series.posterInitials} gradient={series.posterGradient} title={series.title} slug={series.slug}/>
            <div><h2>Vê este episódio na tua área GWD</h2><p>O vídeo, a leitura e o teu progresso estão na plataforma: o acesso é verificado no servidor e retomas exatamente onde ficaste.</p><a className="button" href={watchUrl}>Ver na minha Academy ↗</a></div>
          </div>
        </div>
        <EpisodeSidebar series={series} episode={episode}/>
      </section>
    </SiteFrame>
  );
}
