import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import Icon from "../../components/Icon";
import {PageHeading,Status,Container,FeatureCard,Section} from "@gwd/ui";
import SiteFrame from "../../components/SiteFrame";
import {pages} from "../../lib/content";
import {media} from "../../lib/media";
export function generateStaticParams(){return Object.keys(pages).map(s=>({slug:s.split("/")}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{const p=pages[(await params).slug.join("/")];return {title:p?.title};}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const key=(await params).slug.join("/"),p=pages[key];if(!p)notFound();const market=key==="oportunidades/europa"||key==="oportunidades/brasil",br=key.endsWith("brasil"),photo=br?media.marketBrasil:media.marketEuropa;return <SiteFrame bleed={market}>{market?<section className={"market-hero"+(br?" market-hero--br":"")}>
<Image className="market-editorial-image" src={photo.src} alt={photo.alt} fill preload sizes="100vw"/>
<Container className="market-hero-content"><div className="market-hero-copy"><span className="eyebrow">Digital Team</span><h1>{br?"BRASIL":"EUROPA"}</h1><p className="lead">{br?"O digital pode ser o teu próximo passo.":"O teu país não limita os teus próximos passos."}</p><p>Aprendizagem e comunidade para explorar novos caminhos no digital.</p><div className="actions"><Link className="button large" href="/entrar">Quero fazer parte →</Link><Link className="button secondary large" href="/academy">Conhecer a Academy</Link></div><p className="small">Oportunidades comerciais: <Status>EM BREVE</Status></p></div>
<ul className="market-benefits"><li><Icon name="people"/><span>{br?"Para todo o Brasil":"Rede europeia de pessoas"}</span></li><li><Icon name="learn"/><span>Formação ao teu ritmo</span></li><li><Icon name="globe"/><span>Conexões internacionais</span></li><li><Icon name="tools"/><span>Suporte e mentoria</span></li><li><Icon name="link"/><span>Comunidade de apoio</span></li></ul></Container></section>:<PageHeading {...p}/>}
<div className={market?"container":undefined}>
{p.staged&&<div className="notice"><Status/> <span>As funcionalidades comerciais serão disponibilizadas após aprovação.</span></div>}
<Section><div className={p.items.length===1?"grid two":"grid"}>{p.items.map(item=><FeatureCard key={item.title}><h2 style={{fontSize:"1.3rem"}}>{item.title}</h2><p>{item.body}</p>{item.href&&<Link className="link" href={item.href}>Explorar ↗</Link>}</FeatureCard>)}{market&&<FeatureCard><span className="eyebrow">O teu ponto de partida</span><h2 style={{fontSize:"1.3rem"}}>Aprende. Participa. Prepara-te.</h2><p>Começa pela jornada GWD Start, conhece a Academy e as regras da comunidade. As condições de cada oportunidade serão apresentadas quando aprovadas.</p><Link className="link" href="/academy">Conhecer a Academy ↗</Link></FeatureCard>}</div>{!market&&<div className="actions"><Link className="button" href="/entrar">Registar o meu interesse ↗</Link></div>}</Section></div></SiteFrame>}
