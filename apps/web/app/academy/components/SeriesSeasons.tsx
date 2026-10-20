"use client";
/* Lista de episódios por temporada com estado derivado (concluído / em progresso /
   por começar / locked). O progresso é client-mock; a série é a estrutura da verdade
   do catálogo. Estados exibidos com chips honestos. */
import {useEffect, useState} from "react";
import Link from "next/link";
import type {Episode, EpisodeProgress, Series} from "../../../lib/academy/types";
import {canAccess} from "../../../lib/academy/access";
import {getAllProgress, seriesProgress} from "../../../lib/academy/progress";
import {ModeChip, TierChip} from "./bits";

export default function SeriesSeasons({series, currentSlug}:{series:Series;currentSlug?:string}){
  const [progress, setProgress] = useState<Record<string, EpisodeProgress> | null>(null);
  useEffect(() => {getAllProgress().then(setProgress);}, []);
  const sp = progress ? seriesProgress(series.episodes, progress) : null;

  return (
    <div>
      <div className="ac-progress-mini" style={{marginBottom:"var(--space-5)"}}>
        <div className="progress" role="progressbar" aria-label={`Progresso agregado da série ${series.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={sp?.percent ?? 0}><span style={{width:`${sp?.percent ?? 0}%`}}/></div>
        <span className="ac-meta">{sp?.completed ?? 0}/{series.episodes.length} concluídos · progresso derivado dos episódios (nunca fonte de verdade)</span>
      </div>
      {series.seasons.map(season => {
        const eps = season.episodeIds.map(id => series.episodes.find(e => e.id === id)!).filter(Boolean);
        return (
          <details key={season.number} className="ac-season" open={series.seasons.length === 1}>
            <summary>
              <span>Temporada {season.number} · {season.title}</span>
              <span className="ac-season-count">{eps.length} episódios</span>
            </summary>
            <ul className="ac-episode-list">
              {eps.map(ep => <EpisodeRow key={ep.id} ep={ep} progress={progress} currentSlug={currentSlug}/>)}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function EpisodeRow({ep, progress, currentSlug}:{ep:Episode;progress:Record<string, EpisodeProgress> | null;currentSlug?:string}){
  const p = progress?.[ep.id] ?? null;
  const locked = !canAccess(ep.accessTier);
  const href = `/academy/series/${ep.seriesId}/episodes/${ep.slug}`;
  const state = p?.status === "COMPLETED" ? "✓ Concluído" : p?.status === "IN_PROGRESS" ? "Em progresso" : locked ? "🔒 Bloqueado" : "Por começar";
  const stateClass = p?.status === "COMPLETED" ? "ac-chip--state-done" : p?.status === "IN_PROGRESS" ? "ac-chip--state-progress" : locked ? "ac-chip--state-locked" : "ac-chip--state-todo";
  const body = (
    <>
      <span className="ac-ep-code">{ep.code}</span>
      <div>
        <h3>{ep.title}</h3>
        <p className="ac-ep-summary">{ep.summary}</p>
        <div className="ac-chip-row">
          <ModeChip mode={ep.deliveryMode}/>
          <span className="ac-chip ac-chip--mode">{formatDuration(ep.durationSeconds)}</span>
        </div>
      </div>
      <TierChip tier={ep.accessTier}/>
      <span className={"ac-chip "+stateClass}>{state}</span>
    </>
  );
  return (
    <li className={"ac-episode-row"+(locked?" ac-locked-row":"")+(currentSlug===ep.slug?" is-current":"")}>
      {locked ? <div className="ac-episode-link" style={{display:"grid",gridTemplateColumns:"subgrid",gridColumn:"1/-1"}}>{body}</div> : <Link className="ac-episode-link" style={{display:"grid",gridTemplateColumns:"subgrid",gridColumn:"1/-1"}} href={href} aria-current={currentSlug===ep.slug?"page":undefined}>{body}</Link>}
    </li>
  );
}

function formatDuration(seconds:number){const m=Math.floor(seconds/60);const s=Math.round(seconds%60);return `${m}:${String(s).padStart(2,"0")}`;}
