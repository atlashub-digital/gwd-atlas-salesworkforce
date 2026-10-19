import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {PageHeading,Status,Hero,MediaHero,NetworkArt,FeatureCard,Section} from "@gwd/ui";
import SiteFrame from "../../components/SiteFrame";
import {pages} from "../../lib/content";
import {media} from "../../lib/media";
export function generateStaticParams(){return Object.keys(pages).map(s=>({slug:s.split("/")}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{const p=pages[(await params).slug.join("/")];return {title:p?.title};}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const key=(await params).slug.join("/"),p=pages[key];if(!p)notFound();const market=key==="oportunidades/europa"||key==="oportunidades/brasil",br=key.endsWith("brasil"),photo=br?media.collaboration:media.team;return <SiteFrame>{market?<Hero><div className="hero-copy"><span className="eyebrow">{p.eyebrow} · Rede GWD</span><h1>{p.title}</h1><p>{p.description}</p><Status>EM BREVE</Status><div className="actions"><Link className="button" href="/entrar">Registar o meu interesse ↗</Link><Link className="button secondary" href="/oportunidades">Ver mercados</Link></div><p className="small">Aprendizagem e comunidade primeiro. Sem promessas de rendimento.</p></div><MediaHero><NetworkArt/><figure><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width:760px) 100vw, 50vw" preload/><figcaption>{br?"BRASIL":"EUROPA"} · PESSOAS, CONTEÚDO E NOVAS LIGAÇÕES</figcaption></figure></MediaHero></Hero>:<PageHeading {...p}/>}
{p.staged&&<div className="notice"><Status/> <span>As funcionalidades comerciais serão disponibilizadas após aprovação.</span></div>}
<Section><div className={p.items.length===1?"grid two":"grid"}>{p.items.map(item=><FeatureCard key={item.title}><h2 style={{fontSize:"1.3rem"}}>{item.title}</h2><p>{item.body}</p>{item.href&&<Link className="link" href={item.href}>Explorar ↗</Link>}</FeatureCard>)}{market&&<FeatureCard><span className="eyebrow">O teu ponto de partida</span><h2 style={{fontSize:"1.3rem"}}>Aprende. Participa. Prepara-te.</h2><p>Começa pela jornada GWD Start, conhece a Academy e as regras da comunidade. As condições de cada oportunidade serão apresentadas quando aprovadas.</p><Link className="link" href="/academy">Conhecer a Academy ↗</Link></FeatureCard>}</div>{!market&&<div className="actions"><Link className="button" href="/entrar">Registar o meu interesse ↗</Link></div>}</Section></SiteFrame>}
