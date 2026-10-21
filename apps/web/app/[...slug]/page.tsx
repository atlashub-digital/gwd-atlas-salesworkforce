import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Link from "next/link";
import {PageHeading,Status,FeatureCard,Section} from "@gwd/ui";
import SiteFrame from "../../components/SiteFrame";
import {pages} from "../../lib/content";
import {markets} from "../../lib/markets";
import MarketLanding from "../../components/MarketLanding";
export function generateStaticParams(){return Object.keys(pages).map(s=>({slug:s.split("/")}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{const p=pages[(await params).slug.join("/")];return {title:p?.title};}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const key=(await params).slug.join("/"),p=pages[key];if(!p)notFound();
 if(key==="oportunidades/europa"||key==="oportunidades/brasil")return <SiteFrame bleed><MarketLanding m={markets[key==="oportunidades/brasil"?"brasil":"europa"]}/></SiteFrame>;
 return <SiteFrame><PageHeading {...p}/>
{p.staged&&<div className="notice"><Status/> <span>As funcionalidades comerciais serão disponibilizadas após aprovação.</span></div>}
<Section><div className={p.items.length===1?"grid two":"grid"}>{p.items.map(item=><FeatureCard key={item.title}><h2 style={{fontSize:"1.3rem"}}>{item.title}</h2><p>{item.body}</p>{item.href&&<Link className="link" href={item.href}>Explorar ↗</Link>}</FeatureCard>)}</div><div className="actions"><Link className="button" href="/entrar">Registar o meu interesse ↗</Link></div></Section></SiteFrame>}
