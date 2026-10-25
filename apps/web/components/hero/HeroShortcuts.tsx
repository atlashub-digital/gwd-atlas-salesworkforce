"use client";
import Link from "next/link";
import Icon,{type IconName} from "../Icon";
import {officialChannels} from "@gwd/config";
import BrandIcon,{type BrandName} from "./BrandIcon";

/** Six hero shortcuts (approved order). Every card leads somewhere real: the official channel invite (shared config,
 * opens in a new tab), an active area, or the honest /canais page while the assistant is not live yet.
 * Hover/focus sends a light "ping" to the globe hub of that card (decorative). */
type Shortcut={id:string;label:string;tag:string;description:string;href:string;hub:number;status?:string;external?:boolean}&({brand:BrandName}|{icon:IconName});
const official=(id:BrandName)=>officialChannels.find(c=>c.id===id)!;
const channel=(id:BrandName,tag:string,description:string,hub:number):Shortcut=>({id,label:official(id).label,tag,description,href:official(id).url,hub,brand:id,external:true});
const shortcuts:Shortcut[]=[
 channel("telegram","Comunidade","Grupo oficial da comunidade GWD.",0),
 channel("discord","Servidor","Comunidade & Academy por temas.",14),
 channel("whatsapp","Comunidade","Comunidade oficial GWD no WhatsApp.",8),
 {id:"conteudo",label:"Conteúdo",tag:"Academy",description:"Academy: GWD Start, leitura e quizzes.",href:"/academy",hub:4,icon:"book"},
 {id:"vendas",label:"Vendas",tag:"Percursos",description:"Percursos e oportunidades com regras claras.",href:"/oportunidades",hub:9,icon:"briefcase"},
 {id:"ia",label:"IA",tag:"Em preparação",description:"Assistente GWD para orientar o teu percurso.",href:"/canais#assistente",hub:6,icon:"spark",status:"Em preparação"},
];
const ping=(hub:number)=>window.dispatchEvent(new CustomEvent("gwd:globe-ping",{detail:{hub}}));
function ShortcutLink({s}:{s:Shortcut}){
 const className="gwd-shortcut gwd-shortcut--"+s.id+(s.status?" is-pending":"")+(s.external?" is-external":"");
 const events={onPointerEnter:()=>ping(s.hub),onFocus:()=>ping(s.hub)};
 const body=<><span className="gwd-shortcut-icon">{"brand" in s?<BrandIcon name={s.brand}/>:<Icon name={s.icon}/>}</span>
  <span className="gwd-shortcut-text"><strong>{s.label}{s.external&&<span className="gwd-shortcut-ext" aria-hidden="true">↗</span>}</strong>
   <span className="gwd-shortcut-meta"><span className="gwd-shortcut-tag" aria-hidden="true">{s.tag}</span><span id={"sc-"+s.id} className="gwd-shortcut-desc">{s.description}{s.status&&<span className="sr-only"> ({s.status})</span>}{s.external&&<span className="sr-only"> (abre num novo separador)</span>}</span></span></span></>;
 return s.external
  ?<a className={className} href={s.href} target="_blank" rel="noopener noreferrer" aria-describedby={"sc-"+s.id} {...events}>{body}</a>
  :<Link className={className} href={s.href} aria-describedby={"sc-"+s.id} {...events}>{body}</Link>;
}
export default function HeroShortcuts(){
 return <nav className="gwd-shortcuts" aria-label="Atalhos GWD"><ul>{shortcuts.map(s=><li key={s.id}><ShortcutLink s={s}/></li>)}</ul></nav>;
}
