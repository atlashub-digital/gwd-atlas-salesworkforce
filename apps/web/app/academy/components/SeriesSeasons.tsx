/* Public episode list by season (discovery). Progress/state lives in the member app (server truth). */
import Link from "next/link";
import type {Episode, Series} from "../../../lib/academy/types";
import {ModeChip, TierChip} from "./bits";

export default function SeriesSeasons({series, currentSlug}:{series:Series;currentSlug?:string}){
  return (
    <div>
      {series.seasons.map(season => {
        const eps = season.episodeIds.map(id => series.episodes.find(e => e.id === id)!).filter(Boolean);
        return (
          <details key={season.number} className="ac-season" open>
            <summary>
              <span>Temporada {season.number} · {season.title}</span>
              <span className="ac-season-count">{eps.length} episódios</span>
            </summary>
            <ul className="ac-episode-list">{eps.map(ep => <EpisodeRow key={ep.id} ep={ep} seriesSlug={series.slug} currentSlug={currentSlug}/>)}</ul>
          </details>
        );
      })}
    </div>
  );
}

function EpisodeRow({ep, seriesSlug, currentSlug}:{ep:Episode;seriesSlug:string;currentSlug?:string}){
  return (
    <li className={"ac-episode-row"+(currentSlug===ep.slug?" is-current":"")}>
      <Link className="ac-episode-link" style={{display:"grid",gridTemplateColumns:"subgrid",gridColumn:"1/-1"}} href={`/academy/series/${seriesSlug}/episodes/${ep.slug}`} aria-current={currentSlug===ep.slug?"page":undefined}>
        <span className="ac-ep-code">{ep.code}</span>
        <div>
          <h3>{ep.title}</h3>
          <p className="ac-ep-summary">{ep.summary}</p>
          <div className="ac-chip-row"><ModeChip mode={ep.deliveryMode}/><span className="ac-chip ac-chip--mode">{formatDuration(ep.durationSeconds)}</span></div>
        </div>
        <TierChip tier={ep.accessTier}/>
        <span className="ac-chip ac-chip--state-todo">Ver na app</span>
      </Link>
    </li>
  );
}

function formatDuration(seconds:number){const m=Math.floor(seconds/60);const s=Math.round(seconds%60);return `${m}:${String(s).padStart(2,"0")}`;}
