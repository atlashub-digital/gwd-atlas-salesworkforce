import Link from "next/link";
import Image from "next/image";
import {Container,Section,SectionHeading,Status,buttonClass} from "@gwd/ui";
import MediaPanel from "./MediaPanel";
import Icon from "./Icon";
import type {Market} from "../lib/markets";

/** Market landing (targets 05–08): market-specific hero, benefits bar, how to start, honest status. */
export default function MarketLanding({m}:{m:Market}){const br=m.key==="brasil";return <>
 <section className={"market-hero"+(br?" market-hero--br":"")} aria-labelledby="market-title">
  <Image className="market-editorial-image" src={m.photo.src} alt={m.photo.alt} fill preload sizes="100vw"/>
  <Container className="market-hero-content">
   <div className="market-hero-copy">
    <p className="market-hero-kicker">Digital Team</p>
    <h1 id="market-title">{m.name}</h1>
    <p className="lead">{m.lead[0]}<span className="text-accent">{m.lead[1]}</span></p>
    <p>{m.body}</p>
    <div className="actions"><Link className={buttonClass("primary","large")} href="/entrar">Quero fazer parte <span className="arrow" aria-hidden="true">→</span></Link><a className={buttonClass("secondary","large")} href="#como-comecar">Saber mais</a></div>
   </div>
   <ul className="market-benefits">{m.benefits.map(b=><li key={b.label}><Icon name={b.icon}/><span>{b.label}</span></li>)}</ul>
  </Container>
 </section>
 <Section className="reveal" aria-labelledby="como-comecar"><Container className="split market-start">
  <MediaPanel media={m.secondary} className="split-media-panel" glow sizes="(max-width:900px) 100vw, 55vw"/>
  <div className="split-copy">
   <SectionHeading id="como-comecar" eyebrow={"Começar no Digital Team "+(br?"Brasil":"Europa")} title="Três passos para começar com segurança."/>
   <ol className="market-steps">{m.start.map((s,i)=><li key={s.title}><span aria-hidden="true">{i+1}</span><div><h3>{s.title}</h3><p>{s.body}</p></div></li>)}</ol>
   <p className="market-status"><Status tone="neutral">EM BREVE</Status><span>As oportunidades comerciais deste mercado são publicadas após validação. Registar interesse não constitui emprego nem rendimento garantido.</span></p>
   <div className="actions"><Link className={buttonClass("primary")} href="/entrar">Registar o meu interesse <span className="arrow" aria-hidden="true">→</span></Link><Link className={buttonClass("ghost")} href={m.other.href}>{m.other.label}</Link></div>
  </div>
 </Container></Section>
</>}
