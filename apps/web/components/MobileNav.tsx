"use client";
import {useEffect,useId,useState} from "react";
import Link from "next/link";
import {buttonClass} from "@gwd/ui";
import Icon from "./Icon";
import {primaryNav} from "../lib/site";

/** Compact navigation below the desktop breakpoint: disclosure button + full-width panel. */
export default function MobileNav({appEntryUrl}:{appEntryUrl:string}){
 const [open,setOpen]=useState(false),panelId=useId(),close=()=>setOpen(false);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[open]);
 return <div className="mobile-nav">
  <button type="button" className="mobile-nav-toggle" aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(!open)}><Icon name={open?"close":"menu"}/><span className="sr-only">{open?"Fechar menu":"Abrir menu"}</span></button>
  <div id={panelId} className="mobile-nav-panel" hidden={!open}>
   <nav aria-label="Navegação móvel"><ul>{primaryNav.map(item=><li key={item.href}><Link href={item.href} onClick={close}>{item.label}<Icon name="arrow"/></Link></li>)}</ul></nav>
   <div className="mobile-nav-actions"><a className={buttonClass("secondary")} href={appEntryUrl}>Entrar</a><Link className={buttonClass()} href="/entrar" onClick={close}>Entrar na Comunidade <span className="arrow" aria-hidden="true">→</span></Link></div>
  </div>
 </div>;
}
