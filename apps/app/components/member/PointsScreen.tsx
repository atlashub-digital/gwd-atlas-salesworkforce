import {LevelCard,eventLabel} from "./bits";
import type {Points} from "./types";
/** Os meus pontos: ledger events only; level is a projection. Never money. */
export default function PointsScreen({points}:{points:Points|null}){
 return <section className="member-points">
  <header className="page-heading"><span className="eyebrow">Reconhecimento pela participação</span><h1>Cada passo deixa uma marca.</h1><p>Pontos atribuídos apenas por eventos reais. Não são dinheiro, comissão ou crédito para levantamento.</p></header>
  <LevelCard points={points?.points??null}/>
  <section className="card"><span className="eyebrow">Os teus pontos</span><div className="stat">{points?.points??"—"}</div>{points?.events.length?<ul className="list">{points.events.map(event=><li key={event.event_key}><span>{eventLabel(event.event_key)}</span><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleDateString("pt-PT")}</time><strong>+{event.points}</strong></li>)}</ul>:<p>Ainda não existem eventos de pontos registados. Começa pela jornada GWD Start.</p>}</section>
 </section>;
}
