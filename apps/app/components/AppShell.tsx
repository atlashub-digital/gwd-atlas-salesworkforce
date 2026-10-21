"use client";
import {useEffect,useState} from "react";import {usePathname} from "next/navigation";import Link from "next/link";
import {Brand,AppSidebar,AppTopbar,NavIcon} from "@gwd/ui";import {navigation,navigationGroups} from "@gwd/config";
const label=Object.fromEntries(navigation) as Record<string,string>;
const quick=[["dashboard","Início"],["academy","Academy"],["comunidade","Comunidade"],["oportunidades","Oportunidades"],["perfil","Perfil"]] as const;
/** Member shell (master board 10/11): grouped sidebar, quiet topbar, five-item bottom nav on mobile. */
export default function AppShell({children}:{children:React.ReactNode}){const path=usePathname(),[open,setOpen]=useState(false);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[open]);
 const link=(slug:string)=><Link key={slug} href={"/"+slug} aria-current={path==="/"+slug?"page":undefined} onClick={()=>setOpen(false)}><NavIcon name={slug}/><span>{label[slug]}</span></Link>;
 return <div className={"app-shell"+(open?" menu-open":"")}><a className="skip" href="#conteudo">Saltar para conteúdo</a>
  <AppSidebar><Link className="sidebar-brand" href="/dashboard" aria-label="Início GWD"><Brand/></Link>
   <nav aria-label="Área de participante">{navigationGroups.map(g=><div className="sidebar-group" key={g.label}><p className="sidebar-group-label">{g.label}</p>{g.items.map(link)}</div>)}</nav>
   <div className="sidebar-bottom"><strong>GoWorld.Digital</strong><br/>Aprende. Participa. Avança.</div></AppSidebar>
  <div className="workspace">
   <AppTopbar><button type="button" className="menu-button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Abrir navegação"><NavIcon name="menu"/></button><Link className="app-mobile-brand" href="/dashboard" aria-label="Início GWD"><Brand/></Link><span className="app-topbar-tagline">A tua comunidade. O teu próximo passo.</span><Link className="app-topbar-profile" href="/perfil"><span className="app-avatar" aria-hidden="true"><NavIcon name="perfil"/></span><span>O meu perfil</span></Link></AppTopbar>
   <main id="conteudo" className="app-content">{children}</main>
   <nav className="member-bottom-nav" aria-label="Navegação rápida">{quick.map(([slug,text])=><Link key={slug} href={"/"+slug} aria-current={path==="/"+slug?"page":undefined}><NavIcon name={slug}/>{text}</Link>)}</nav>
  </div></div>}
