import Image from "next/image";
import Link from "next/link";
import {Status} from "@gwd/ui";
import {ScreenHeader} from "./bits";
import type {Opportunity} from "./types";
const paths=[
 {title:"Social Media",body:"Cria, planeia e distribui conteúdo com intenção. Começa pelos fundamentos na Academy.",img:"/media/gwd-team-collaboration-v02.webp",status:"APRENDER PRIMEIRO"},
 {title:"Afiliado",body:"Divulga ofertas aprovadas com atribuição definida. Links e comissões dependem de ativação.",img:"/media/gwd-market-brasil-v01.webp",status:"EM PREPARAÇÃO"},
 {title:"Revendedor Autorizado",body:"Opera dentro de condições comerciais aprovadas. O interesse não concede o estatuto de vendedor.",img:"/media/gwd-team-group-v01.webp",status:"EM PREPARAÇÃO"}
] as const;
/** Oportunidades (target 07/09): approved opportunities only; otherwise the three paths with their real state. */
export default function OpportunitiesScreen({opportunities}:{opportunities:Opportunity[]}){
 return <section className="member-opportunities">
  <ScreenHeader icon="oportunidades" title="O teu próximo passo no digital." subtitle="Apenas oportunidades aprovadas são apresentadas. Participar não constitui emprego ou rendimento garantido."/>
  {opportunities.length?<div className="opportunity-grid">{opportunities.map(item=><article className="card opportunity-card" key={item.id}><span className="eyebrow">{item.market}</span><h2>{item.title}</h2><p>{item.description}</p><Status>PARTICIPAÇÃO AINDA NÃO ATIVADA</Status></article>)}</div>
  :<section className="card empty-inline"><Status tone="neutral">EM PREPARAÇÃO</Status><h2>Estamos a preparar as oportunidades.</h2><p>Ainda não existem oportunidades aprovadas para apresentar. Podes atualizar os teus interesses no perfil e continuar a aprender.</p></section>}
  <h2 className="dashboard-explore-title">Percursos disponíveis</h2>
  <div className="opportunity-grid">{paths.map(p=><article className="opportunity-card opportunity-card--media" key={p.title}><span className="opportunity-card-media" aria-hidden="true"><Image src={p.img} alt="" fill sizes="(max-width:760px) 100vw, 33vw" style={{objectFit:"cover",objectPosition:"50% 25%"}}/></span><div><Status tone={p.status==="APRENDER PRIMEIRO"?"info":"warning"}>{p.status}</Status><h3>{p.title}</h3><p>{p.body}</p><Link className="link" href="/perfil">Indicar interesse no perfil →</Link></div></article>)}</div>
 </section>;
}
