import {NavIcon,Progress} from "@gwd/ui";
import {ScreenHeader} from "./bits";
import type {Journey} from "./types";
/** Minha Jornada (master board 12 / target 05): stepper with complete · current · locked states. Labels are E2E contract. */
export default function JourneyScreen({journey,busy,complete}:{journey:Journey|null;busy:boolean;complete:(id:string)=>void}){
 const done=journey?.completed.length??0,total=journey?.steps.length??0,percent=total?Math.round(done/total*100):0;
 return <section className="member-journey">
  <ScreenHeader icon="jornada" title="A minha jornada" subtitle={total?`GWD Start · ${total} etapas para começar · com Maia Valente`:"GWD Start"}/>
  <div className="journey-summary"><div><strong>{done} de {total}</strong> etapas concluídas</div><Progress value={percent} label="Progresso da jornada"/></div>
  <ol className="journey-steps">{journey?.steps.map((step,index)=>{const isDone=journey.completed.includes(step.id),available=index===0||journey.completed.includes(journey.steps[index-1].id);return <li className={"step"+(isDone?" done":available?" current":" locked")} key={step.id}>
   <span className="step-number" aria-hidden="true">{isDone?<NavIcon name="check"/>:available?index+1:<NavIcon name="lock"/>}</span>
   <div><h2>{step.title}</h2><p>{step.body}</p><p className="small">{step.points} pontos por conclusão · uma única atribuição</p>
    {isDone?<span className="status status--success">CONCLUÍDO</span>:<button className="button small" disabled={!available||busy} onClick={()=>complete(step.id)}>{busy?"A guardar…":available?"Li e concluí esta etapa":"Conclui primeiro a etapa anterior"}</button>}</div>
  </li>})}</ol>
  {percent===100&&<p className="notice success">GWD Start concluído. Continua a aprender na Academy e a participar na comunidade.</p>}
 </section>;
}
