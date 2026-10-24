"use client";
import Link from "next/link";
import Icon,{type IconName} from "../Icon";
import BrandIcon,{type BrandName} from "./BrandIcon";

/** Six hero shortcuts (approved order). Every card leads somewhere real: an active area, or the honest /canais page
 * when the official channel or the assistant is not live yet (status shown on the card, never a dead control).
 * Hover/focus sends a light "ping" to the globe hub of that card (decorative). */
type Shortcut={id:string;label:string;tag:string;description:string;href:string;hub:number;status?:string}&({brand:BrandName}|{icon:IconName});
const shortcuts:Shortcut[]=[
 {id:"telegram",label:"Telegram",tag:"Em preparação",description:"Canal oficial de formação da GWD.",href:"/canais#telegram",hub:0,brand:"telegram",status:"Em preparação"},
 {id:"discord",label:"Discord",tag:"Em preparação",description:"Comunidade oficial GWD por temas.",href:"/canais#discord",hub:14,brand:"discord",status:"Em preparação"},
 {id:"whatsapp",label:"WhatsApp",tag:"Em preparação",description:"Grupos e suporte oficiais.",href:"/canais#whatsapp",hub:8,brand:"whatsapp",status:"Em preparação"},
 {id:"conteudo",label:"Conteúdo",tag:"Academy",description:"Academy: GWD Start, leitura e quizzes.",href:"/academy",hub:4,icon:"book"},
 {id:"vendas",label:"Vendas",tag:"Percursos",description:"Percursos e oportunidades com regras claras.",href:"/oportunidades",hub:9,icon:"briefcase"},
 {id:"ia",label:"IA",tag:"Em preparação",description:"Assistente GWD para orientar o teu percurso.",href:"/canais#assistente",hub:6,icon:"spark",status:"Em preparação"},
];
const ping=(hub:number)=>window.dispatchEvent(new CustomEvent("gwd:globe-ping",{detail:{hub}}));
export default function HeroShortcuts(){
 return <nav className="gwd-shortcuts" aria-label="Atalhos GWD"><ul>{shortcuts.map(s=><li key={s.id}>
  <Link className={"gwd-shortcut gwd-shortcut--"+s.id+(s.status?" is-pending":"")} href={s.href} aria-describedby={"sc-"+s.id} onPointerEnter={()=>ping(s.hub)} onFocus={()=>ping(s.hub)}>
   <span className="gwd-shortcut-icon">{"brand" in s?<BrandIcon name={s.brand}/>:<Icon name={s.icon}/>}</span>
   <span className="gwd-shortcut-text"><strong>{s.label}</strong>
    <span className="gwd-shortcut-meta"><span className="gwd-shortcut-tag" aria-hidden="true">{s.tag}</span><span id={"sc-"+s.id} className="gwd-shortcut-desc">{s.description}{s.status&&<span className="sr-only"> ({s.status})</span>}</span></span></span>
  </Link></li>)}</ul></nav>;
}
