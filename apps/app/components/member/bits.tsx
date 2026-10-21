import Link from "next/link";
import {NavIcon,Progress} from "@gwd/ui";
import {levelFor} from "@gwd/config";
import {starterSteps} from "@gwd/domain";
import type {Points} from "./types";
/** Real XP level projected from the points ledger; thresholds come from @gwd/config. */
export function LevelCard({points,action}:{points:number|null;action?:{href:string;label:string}}){
 const value=points??0,level=levelFor(value),target=level.next?.min??value,pct=level.next?Math.round((value-level.min)/(level.next.min-level.min)*100):100;
 return <section className="level-card" aria-label="O teu nível">
  <span className="level-card-badge" aria-hidden="true"><NavIcon name="pontos"/></span>
  <div className="level-card-meta"><span>Nível {level.number}</span><strong>{level.name}</strong></div>
  <div className="level-card-progress"><p>{points===null?"— pontos":level.next?`${value} / ${target} pontos`:`${value} pontos`}</p><Progress value={pct} label={"Progresso até "+(level.next?.name??"o nível máximo")}/>{level.next&&<small>Próximo nível: {level.next.name}</small>}</div>
  {action&&<Link className="button" href={action.href}>{action.label} <span className="arrow" aria-hidden="true">→</span></Link>}
 </section>;
}
export function eventLabel(key:string){const step=starterSteps.find(s=>key==="journey:gwd-start:"+s.id);if(step)return "GWD Start · "+step.title;if(key.startsWith("academy:episode:"))return "Academy · episódio concluído";if(key.startsWith("academy:series:"))return "Academy · série concluída";return "Participação registada";}
export function RecentActivity({points,limit=4}:{points:Points|null;limit?:number}){
 const events=points?.events.slice(0,limit)??[];
 return events.length?<ul className="activity-list">{events.map(e=><li key={e.event_key}><span>{eventLabel(e.event_key)}</span><strong>+{e.points}</strong></li>)}</ul>:<p className="small muted">Ainda não existem atividades registadas. Começa pela jornada GWD Start.</p>;
}
export function ScreenHeader({icon,title,subtitle}:{icon:string;title:string;subtitle:string}){return <header className="screen-header"><span className="screen-header-icon" aria-hidden="true"><NavIcon name={icon}/></span><div><h1>{title}</h1><p>{subtitle}</p></div></header>}
