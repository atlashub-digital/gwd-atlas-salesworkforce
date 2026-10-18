import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Link from "next/link";
import {PageHeading,Status} from "@gwd/ui";
import SiteFrame from "../../components/SiteFrame";
import {pages} from "../../lib/content";
export function generateStaticParams(){return Object.keys(pages).map(s=>({slug:s.split("/")}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{const p=pages[(await params).slug.join("/")];return {title:p?.title};}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const key=(await params).slug.join("/"),p=pages[key];if(!p)notFound();return <SiteFrame><PageHeading {...p}/>{p.staged&&<div className="notice"><Status/> <span>As funcionalidades comerciais serão disponibilizadas após aprovação.</span></div>}<section className="section"><div className="grid">{p.items.map(item=><article className="card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p>{item.href&&<Link className="link" href={item.href}>Explorar ↗</Link>}</article>)}</div><div className="actions"><Link className="button" href="/entrar">Registar o meu interesse ↗</Link></div></section></SiteFrame>}
