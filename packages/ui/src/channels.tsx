import type {ReactNode} from "react";
import BrandIcon,{type BrandName} from "./BrandIcon";
import {Status} from "./index";

/** One official community channel, identical on the public site and in the member app.
 *  The external invite opens in a new tab (noopener/noreferrer); the access note says what the platform will ask. */
export type ChannelCardData={id:string;label:string;title:string;url:string;description:string;access:string;status:string};
const shield=<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 5 6v5.5c0 4.3 2.9 7.9 7 9.5 4.1-1.6 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
export function ChannelCard({channel,headingLevel=2,children}:{channel:ChannelCardData;headingLevel?:2|3;children?:ReactNode}){
 const H=headingLevel===3?"h3":"h2";
 return <article id={channel.id} className={"channel-card channel-card--"+channel.id+" is-active"}>
  <span className="channel-card-icon"><BrandIcon name={channel.id as BrandName}/></span>
  <div className="channel-card-body">
   <div className="channel-card-head"><H>{channel.title}</H><Status tone="success">{channel.status}</Status></div>
   <p>{channel.description}</p>
   <p className="channel-card-access">{shield}<span>{channel.access}</span></p>
   <a className="button channel-card-action" href={channel.url} target="_blank" rel="noopener noreferrer">Entrar no {channel.label} <span aria-hidden="true">↗</span><span className="sr-only"> (abre num novo separador)</span></a>
   {children}
  </div>
 </article>;
}

/** Personal contact (e.g. Maia Valente): presented apart from the public groups, with a real person behind it. */
export function ContactCard({name,role,note,url,phone,image,headingLevel=2}:{name:string;role:string;note:string;url:string;phone:string;image?:string;headingLevel?:2|3}){
 const H=headingLevel===3?"h3":"h2";
 return <article id="maia" className="contact-card">
  {image&&<img src={image} alt={name+", persona digital GWD."} width={96} height={112} loading="lazy" decoding="async"/>}
  <div>
   <H>{name}</H><p className="contact-card-role">{role}</p>
   <p className="contact-card-phone">{phone}</p>
   <p>{note}</p>
   <a className="button secondary" href={url} target="_blank" rel="noopener noreferrer"><BrandIcon name="whatsapp"/> Falar com {name.split(" ")[0]} no WhatsApp<span className="sr-only"> ({phone}, abre num novo separador)</span></a>
  </div>
 </article>;
}
