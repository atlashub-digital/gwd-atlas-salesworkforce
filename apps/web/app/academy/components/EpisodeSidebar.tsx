/* Public episode sidebar: the series outline and the XP rules. Personal progress/XP is shown only in the member app. */
import Link from "next/link";
import type {Episode, Series} from "../../../lib/academy/types";
import {formatDuration} from "../../../lib/academy/progress";

export default function EpisodeSidebar({series, episode}:{series:Series;episode:Episode}){
  return (
    <aside style={{display:"grid",gap:"var(--space-4)"}}>
      <div className="ac-series-side">
        <h2>Nesta série</h2>
        <ul className="ac-side-episodes">
          {series.episodes.map(ep => (
            <li key={ep.id}><Link href={`/academy/series/${series.slug}/episodes/${ep.slug}`} aria-current={ep.id === episode.id ? "page" : undefined}><span className="ac-side-code">{ep.code}</span><span>{ep.title} · {formatDuration(ep.durationSeconds)}</span><span className="ac-side-state" aria-hidden="true">{ep.accessTier === "FREE" ? "○" : "◆"}</span></Link></li>
          ))}
        </ul>
      </div>
      <div className="ac-gamification">
        <h2>XP e badges</h2>
        <p className="small muted">+10 XP por episódio concluído (uma vez) e +50 XP por série. Sem XP por compras, replay ou aberturas de Telegram. O teu saldo de XP aparece na tua área GWD.</p>
      </div>
    </aside>
  );
}
