import Link from "next/link";
import Image from "next/image";
import {NavIcon,Progress} from "@gwd/ui";
import {LevelCard,RecentActivity} from "./bits";
import type {Journey,Points} from "./types";
const explore=[
 {href:"/jornada",title:"Minha Jornada",img:"/media/maia-workspace-v02.webp",alt:"Maia Valente, responsável pelo percurso de participação GWD.",cta:"Ver jornada"},
 {href:"/academy",title:"Academy",img:"/media/gwd-team-collaboration-v02.webp",alt:"Equipa digital GWD a aprender em conjunto num portátil.",cta:"Aceder"},
 {href:"/oportunidades",title:"Oportunidades",img:"/media/gwd-market-europa-v01.webp",alt:"Equipa digital GWD com cidades europeias ao fundo.",cta:"Ver oportunidades"},
 {href:"/comunidade",title:"Comunidade",img:"/media/gwd-team-master-v02.webp",alt:"Equipa digital GWD no espaço GoWorld.Digital.",cta:"Entrar"}
] as const;
/** Dashboard (master board 10/11 + target 07): greeting banner, level, journey stepper, points activity, explore cards. */
export default function Dashboard({name,journey,points}:{name?:string|null;journey:Journey|null;points:Points|null}){
 const done=journey?.completed.length??0,total=journey?.steps.length??0,percent=total?Math.round(done/total*100):0;
 const sub={"/jornada":total?`${done} de ${total} etapas concluídas`:"GWD Start","/academy":"Formação prática","/oportunidades":"Publicadas quando aprovadas","/comunidade":"Regras e canais oficiais"} as Record<string,string>;
 return <section className="member-dashboard">
  <header className="dash-hero"><div className="dash-hero-copy"><h1>{"Olá"+(name?", "+name:"")+"."}</h1><p className="dash-hero-lead">Boas-vindas à GoWorld.Digital.</p><p>Continua a tua jornada e conquista novos pontos.</p></div><div className="dash-hero-media" aria-hidden="true"><Image src="/media/gwd-community-global-v01.webp" alt="" fill sizes="(max-width:760px) 100vw, 45vw" style={{objectFit:"cover",objectPosition:"40% 30%"}}/></div></header>
  <LevelCard points={points?.points??null} action={{href:"/jornada",label:percent===100?"Rever jornada":"Continuar jornada"}}/>
  <div className="dashboard-primary">
   <section className="card dashboard-journey"><div className="card-head"><div><h2>A tua jornada · GWD Start</h2><p className="small">{journey?.completed.length??"—"} de {journey?.steps.length??"—"} etapas concluídas</p></div><Link className="button small" href="/jornada">{percent===100?"Rever":"Continuar"} <span className="arrow" aria-hidden="true">→</span></Link></div>
    <Progress value={percent} label="Progresso GWD Start"/>
    <ol className="journey-map">{journey?.steps.map((step,index)=>{const complete=journey.completed.includes(step.id),current=!complete&&(index===0||journey.completed.includes(journey.steps[index-1].id));return <li key={step.id} className={complete?"is-complete":current?"is-current":undefined}><span aria-hidden="true">{complete?"✓":index+1}</span><div><strong>{step.title}</strong><small>{complete?"Concluído":current?"Em curso":"Pendente"}</small></div></li>})}</ol>
   </section>
   <section className="card dashboard-points"><h2>Os teus pontos</h2><div className="stat">{points?.points??"—"}</div><p className="small">Pontos GWD · reconhecimento, não saldo financeiro.</p><h3>Últimas atividades</h3><RecentActivity points={points}/><Link className="link" href="/pontos">Ver histórico →</Link></section>
  </div>
  <h2 className="dashboard-explore-title">Explora a GWD</h2>
  <div className="explore-grid">{explore.map(item=><Link className="explore-card" key={item.href} href={item.href}><span className="explore-card-media"><Image src={item.img} alt={item.alt} fill sizes="(max-width:760px) 100vw, 25vw" style={{objectFit:"cover",objectPosition:"50% 25%"}}/></span><span className="explore-card-body"><strong>{item.title}</strong><small>{sub[item.href]}</small><span className="explore-card-cta">{item.cta} <NavIcon name="arrow"/></span></span></Link>)}</div>
 </section>;
}
