import Link from "next/link";
import {academy} from "@gwd/domain";
import {Container,Section,SectionHeading,FeatureCard,Card,Status,buttonClass} from "@gwd/ui";
import SiteFrame from "../components/SiteFrame";
import MediaPanel from "../components/MediaPanel";
import MarketPanel from "../components/MarketPanel";
import PathCard from "../components/PathCard";
import TeamStrip from "../components/TeamStrip";
import GlobalNetwork from "../components/GlobalNetwork";
import HeroCinematic from "../components/hero/HeroCinematic";
import Icon from "../components/Icon";
import {media} from "../lib/media";
import {appEntryUrl} from "../lib/site";
import {pillars,paths,steps,opportunities,team} from "../lib/home";

const academyPreview=academy.map(m=>({...m,summary:m.body.split(". ")[0]+"."}));
const Arrow=()=><span className="arrow" aria-hidden="true">→</span>;

export default function Home(){return <SiteFrame bleed>
 {/* 1. Hero Cinematográfico V1 — scene 1 (Comunidade Global) */}
 <HeroCinematic/>

 {/* 2. Escolhe o teu caminho — scene 2 (the hero thread lands here) */}
 <Section className="reveal paths-scene" aria-labelledby="caminhos"><Container>
  <SectionHeading id="caminhos" align="split" eyebrow="Escolhe o teu caminho" title="Há mais de uma forma de começar." lead="Três percursos com responsabilidades diferentes. Conhece-os, aprende os fundamentos e escolhe por onde queres avançar."/>
  <div className="path-grid">{paths.map(p=><PathCard key={p.index} {...p}/>)}</div>
 </Container></Section>

 {/* 3. O que é a GWD */}
 <Section tone="bare" className="reveal" aria-labelledby="o-que-e"><Container>
  <SectionHeading id="o-que-e" align="split" eyebrow="O que é a GWD" title="Uma comunidade para começar, aprender e avançar no digital." lead="A GoWorld.Digital junta pessoas, conteúdo e vendas num só percurso. Primeiro aprendes e participas; os percursos comerciais chegam depois, com regras claras."/>
  <div className="pillar-grid">{pillars.map(p=><FeatureCard key={p.eyebrow} icon={<Icon name={p.icon}/>} eyebrow={p.eyebrow} title={p.title} body={p.body}/>)}</div>
 </Container></Section>

 {/* 5. Europa + Brasil */}
 <Section className="reveal" aria-labelledby="mercados"><Container>
  <SectionHeading id="mercados" align="split" eyebrow="Europa e Brasil" title="Próximos de ti. Ligados ao mundo." lead="Duas equipas digitais, dois contextos. Escolhe o teu mercado para conhecer o ponto de partida."/>
  <div className="market-grid">
   <MarketPanel media={media.marketEuropa} eyebrow="Digital Team Europa" title="O teu país não limita as tuas oportunidades." body="Aprendizagem e comunidade para explorar o mercado europeu, com condições apresentadas em cada oportunidade aprovada." href="/oportunidades/europa" linkLabel="Explorar Europa"/>
   <MarketPanel media={media.marketBrasil} accent="br" eyebrow="Digital Team Brasil" title="O digital pode ser o teu próximo passo." body="Conteúdo, aprendizagem e comunidade para quem quer começar no mercado brasileiro." href="/oportunidades/brasil" linkLabel="Explorar Brasil"/>
  </div>
 </Container></Section>

 {/* 6. Como funciona — target 09 */}
 <Section id="como-funciona" className="reveal" aria-labelledby="como-funciona-title"><Container>
  <div className="how-scene"><GlobalNetwork/>
   <span className="eyebrow">Como funciona</span>
   <h2 id="como-funciona-title">Como funciona a GWD?</h2>
   <p>Um percurso simples e honesto: primeiro pertences e aprendes, depois escolhes e cresces.</p>
   <ol className="how-steps">{steps.map((step,i)=><li key={step.title}><span className="how-steps-node" aria-hidden="true">{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
  </div>
 </Container></Section>

 {/* 7. Comunidade */}
 <Section className="reveal" aria-labelledby="comunidade"><Container className="split">
  <MediaPanel media={media.collaboration} className="split-media-panel" glow sizes="(max-width:900px) 100vw, 55vw"/>
  <div className="split-copy">
   <SectionHeading id="comunidade" eyebrow="Comunidade" title="Ninguém começa sozinho."/>
   <p className="lead">Na comunidade GWD partilhas dúvidas e aprendizagens com pessoas de vários países, que estão a dar os mesmos primeiros passos no digital.</p>
   <ul className="check-list">
    <li><Icon name="people"/><span><strong>Aprender em conjunto.</strong> A comunidade começa na escuta e na partilha.</span></li>
    <li><Icon name="link"/><span><strong>Canais oficiais.</strong> Os espaços aprovados ficam disponíveis na área de participante quando ativados.</span></li>
    <li><Icon name="shield"/><span><strong>Regras claras.</strong> Sem spam, promessas de rendimento ou partilha de dados de terceiros.</span></li>
   </ul>
   <Link className={buttonClass("secondary")} href="/comunidade">Conhecer a comunidade <Arrow/></Link>
  </div>
 </Container></Section>

 {/* 8. Academy */}
 <Section className="reveal" aria-labelledby="academy"><Container>
  <SectionHeading id="academy" align="split" eyebrow="Academy" title="Aprender para avançar." lead="Os primeiros conteúdos da Academy, organizados pela Elisa Duarte. Fundamentos claros e aplicáveis."><Link className="text-link" href="/academy">Ver a Academy<Icon name="arrow"/></Link></SectionHeading>
  <ol className="academy-grid">{academyPreview.map((m,i)=><li key={m.id}><Card className="academy-card"><span className="academy-card-index">Módulo {String(i+1).padStart(2,"0")}</span><h3>{m.title}</h3><p>{m.summary}</p><span className="academy-card-owner"><Icon name="book"/>{m.owner}</span></Card></li>)}</ol>
 </Container></Section>

 {/* 9. Oportunidades */}
 <Section className="reveal" aria-labelledby="oportunidades"><Container>
  <SectionHeading id="oportunidades" align="split" eyebrow="Oportunidades" title="Publicadas quando estão prontas." lead="Ainda não há oportunidades publicadas. Cada uma chega com critérios, condições e elegibilidade visíveis antes de participares."/>
  <ul className="opportunity-list">{opportunities.map(o=><li key={o.title}><div><h3>{o.title}</h3><p>{o.body}</p></div><Status tone={o.status==="EM BREVE"?"neutral":"warning"}>{o.status}</Status><Link className="text-link" href={o.href}>Saber mais<span className="sr-only">: {o.title}</span><Icon name="arrow"/></Link></li>)}</ul>
 </Container></Section>

 {/* 10. Equipa */}
 <Section className="reveal" aria-labelledby="equipa"><Container>
  <SectionHeading id="equipa" align="split" eyebrow="A equipa digital GWD" title="Pessoas no centro. Um propósito partilhado." lead="Quatro personas digitais com responsabilidades claras no teu percurso."/>
  <MediaPanel media={media.team} className="team-media" scrim="bottom" sizes="(max-width:1280px) 100vw, 1280px"/>
  <TeamStrip members={team}/>
 </Container></Section>

 {/* 11. CTA final */}
 <section className="final-cta reveal" aria-labelledby="cta-final"><Container>
  <div className="final-cta-card">
   <MediaPanel media={media.communityBanner} className="final-cta-media" scrim="right" sizes="(max-width:900px) 100vw, 1280px"/>
   <div className="final-cta-copy">
    <span className="eyebrow">O teu próximo capítulo</span>
    <h2 id="cta-final">O teu talento pode chegar a qualquer lugar do mundo.</h2>
    <p className="lead">Regista o teu interesse, entra na comunidade e começa pela jornada GWD Start.</p>
    <div className="actions"><Link className={buttonClass("primary","large")} href="/entrar">Quero fazer parte <Arrow/></Link><a className={buttonClass("secondary","large")} href={appEntryUrl}>Já participo</a></div>
   </div>
  </div>
 </Container></section>
</SiteFrame>}
