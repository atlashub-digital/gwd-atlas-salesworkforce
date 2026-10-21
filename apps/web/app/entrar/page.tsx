import Image from "next/image";
import SiteFrame from "../../components/SiteFrame";
import LeadForm from "../../components/LeadForm";
import Icon,{type IconName} from "../../components/Icon";
import {media,objectPosition} from "../../lib/media";
import {appUrl,appEntryUrl} from "../../lib/site";
const benefits:readonly {icon:IconName;title:string;text:string}[]=[
 {icon:"learn",title:"Formação prática",text:"Aprende ao teu ritmo, com etapas claras."},
 {icon:"people",title:"Comunidade ativa",text:"Partilha e cresce com quem está no mesmo caminho."},
 {icon:"tools",title:"Ferramentas e suporte",text:"Materiais e acompanhamento para cada passo."},
 {icon:"globe",title:"Oportunidades na Europa e no Brasil",text:"Percursos ativados com regras claras."}
];
export default function Entrar(){return <SiteFrame bleed><section className="entrar">
 <figure className="entrar-media">
  <Image src={media.maia.src} alt={media.maia.alt} fill preload sizes="(max-width:1179px) 100vw, 44vw" style={{objectFit:"cover",objectPosition:objectPosition(media.maia)}}/>
  <span className="entrar-media-scrim" aria-hidden="true"/>
  <p className="entrar-note" aria-hidden="true">Aprende. Conecta.<br/>Divulga. Cresce.</p>
 </figure>
 <div className="container entrar-grid">
  <div className="entrar-copy">
   <span className="eyebrow">O primeiro passo</span>
   <h1>Dá o primeiro passo na <span className="text-gradient">GWD.</span></h1>
   <p className="lead">Junta-te a uma comunidade global de pessoas que aprendem, divulgam, vendem e crescem no mercado digital.</p>
  </div>
  <ul className="entrar-benefits">{benefits.map(b=><li key={b.title}><span className="entrar-benefit-icon"><Icon name={b.icon}/></span><div><strong>{b.title}</strong><span>{b.text}</span></div></li>)}</ul>
  <div className="entrar-card">
   <nav className="entrar-tabs" aria-label="Acesso à GWD"><span aria-current="page">Criar conta</span><a href={appEntryUrl}>Já tenho conta</a></nav>
   <LeadForm appUrl={appUrl}/>
  </div>
  <figure className="entrar-quote">
   <p>A Maia acompanha os teus primeiros passos na comunidade.</p>
   <figcaption><Image src={media.maia.src} alt="Maia Valente" width={44} height={44} sizes="44px" style={{objectFit:"cover",objectPosition:objectPosition(media.maia)}}/><span><strong>Maia</strong><small>Comunidade GWD · persona digital</small></span></figcaption>
  </figure>
 </div>
</section></SiteFrame>}
