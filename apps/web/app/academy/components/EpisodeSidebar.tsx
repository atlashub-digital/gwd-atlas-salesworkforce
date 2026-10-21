"use client";
/* Sidebar do episódio: "Nesta série" com estados + painel de gamificação honesto
   (XP a zero real, badges locked, próximo desbloqueio, progresso da série). */
import {useEffect, useState} from "react";
import Link from "next/link";
import type {Episode, EpisodeProgress, Series} from "../../../lib/academy/types";
import {canAccess, demoBadges, nextUnlock, xpSummary} from "../../../lib/academy/access";
import {formatDuration, getAllProgress, seriesProgress} from "../../../lib/academy/progress";
import {DemoBadge} from "./bits";

export default function EpisodeSidebar({series, episode}:{series:Series;episode:Episode}){
  const [progress, setProgress] = useState<Record<string, EpisodeProgress> | null>(null);
  useEffect(() => {getAllProgress().then(setProgress);}, []);
  const sp = progress ? seriesProgress(series.episodes, progress) : null;
  const xp = xpSummary();
  const badges = demoBadges();

  return (
    <aside style={{display:"grid",gap:"var(--space-4)"}}>
      <div className="ac-series-side">
        <h2>Nesta série</h2>
        {sp && <div className="ac-progress-mini"><div className="progress" role="progressbar" aria-label={`Progresso da série ${series.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={sp.percent}><span style={{width:`${sp.percent}%`}}/></div><span className="ac-meta">{sp.completed}/{series.episodes.length}</span></div>}
        <ul className="ac-side-episodes">
          {series.episodes.map(ep => {
            const p = progress?.[ep.id];
            const locked = !canAccess(ep.accessTier);
            const state = p?.status === "COMPLETED" ? "✓" : p?.status === "IN_PROGRESS" ? "◐" : locked ? "🔒" : "○";
            const href = `/academy/series/${series.slug}/episodes/${ep.slug}`;
            return (
              <li key={ep.id}>
                {locked ? <span style={{display:"grid",gridTemplateColumns:"subgrid",gridColumn:"1/-1",opacity:.6}}><span className="ac-side-code">{ep.code}</span><span>{ep.title} · {formatDuration(ep.durationSeconds)}</span><span className="ac-side-state" aria-label="bloqueado">🔒</span></span>
                : <Link href={href} aria-current={ep.id === episode.id ? "page" : undefined}><span className="ac-side-code">{ep.code}</span><span>{ep.title} · {formatDuration(ep.durationSeconds)}</span><span className="ac-side-state" aria-hidden="true">{state}</span></Link>}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="ac-gamification">
        <h2>Gamificação</h2>
        <DemoBadge/>
        <div className="ac-xp"><strong>{xp.total} XP</strong><span className="small">· nível {xp.level} · valores reais a zero até existir ledger server</span></div>
        <div className="ac-badge-row" aria-label="Badges">
          {badges.map(b => <span key={b.id} className="ac-badge" data-unlocked={b.unlocked}>{b.unlocked ? "★" : "☆"} {b.label}{b.unlocked ? "" : " (locked)"}</span>)}
        </div>
        <p className="small muted">Próximo desbloqueio: {nextUnlock(series.title)}</p>
        <p className="small muted">Regras: +10 XP por episódio concluído (1×), +50 XP por série. Sem XP por compras, replay ou aberturas de Telegram.</p>
      </div>
    </aside>
  );
}
