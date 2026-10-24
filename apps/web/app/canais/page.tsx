import type {Metadata} from "next";
import Link from "next/link";
import {Container,PageHeading,Section,Status,buttonClass} from "@gwd/ui";
import SiteFrame from "../../components/SiteFrame";
import BrandIcon,{type BrandName} from "../../components/hero/BrandIcon";
import Icon from "../../components/Icon";
import {appEntryUrl} from "../../lib/site";

export const metadata:Metadata={title:"Canais oficiais",description:"Telegram, Discord, WhatsApp e o assistente GWD: o que são e quando ficam disponíveis."};
/** Destination of the hero shortcuts whose official channel is not live yet. Honest status, no invented links:
 * access is granted inside the member area when each channel is activated — never automatically by registering. */
const channels:{id:string;title:string;body:string;access:string;brand?:BrandName}[]=[
 {id:"telegram",brand:"telegram",title:"Telegram",body:"Canal oficial de formação da GWD, com aulas e materiais organizados por episódio da Academy.",access:"O acesso é dado pela equipa, a partir da tua área de participante. Abrir o link do canal não dá acesso automático."},
 {id:"discord",brand:"discord",title:"Discord",body:"Comunidade oficial GWD por temas: apresentações, dúvidas da Academy e percursos.",access:"O convite oficial aparece na tua área de participante quando a comunidade for ativada."},
 {id:"whatsapp",brand:"whatsapp",title:"WhatsApp",body:"Grupos oficiais por mercado e um contacto de suporte para dúvidas sobre o percurso.",access:"Os grupos aprovados ficam disponíveis na área de participante. Nunca adicionamos ninguém sem consentimento."},
 {id:"assistente",title:"Assistente GWD (IA)",body:"Um assistente para te orientar no percurso, responder a dúvidas da Academy e ajudar-te a navegar na plataforma.",access:"Ainda não está ativo. Até lá, as dúvidas ficam no espaço “Dúvidas da Academy” da comunidade."},
];
export default function Page(){
 return <SiteFrame>
  <PageHeading eyebrow="Canais oficiais" title="Onde a comunidade GWD conversa." description="Cada canal é ativado separadamente, com regras claras. Enquanto um canal não está ativo, dizemos-te isso aqui — sem links improvisados."/>
  <Section><ul className="channel-list">{channels.map(c=><li key={c.id} id={c.id} className={"channel-card channel-card--"+c.id}>
   <span className="channel-card-icon">{c.brand?<BrandIcon name={c.brand}/>:<Icon name="spark"/>}</span>
   <div><div className="channel-card-head"><h2>{c.title}</h2><Status tone="warning">EM PREPARAÇÃO</Status></div><p>{c.body}</p><p className="channel-card-access"><Icon name="shield"/><span>{c.access}</span></p></div>
  </li>)}</ul></Section>
  <Section><Container className="channel-cta"><p>Os canais abrem primeiro para quem já faz parte da comunidade.</p><div className="actions"><Link className={buttonClass("primary","large")} href="/entrar">Entrar na Comunidade <span className="arrow" aria-hidden="true">→</span></Link><a className={buttonClass("secondary","large")} href={appEntryUrl}>Já participo · Entrar</a></div></Container></Section>
 </SiteFrame>;
}
