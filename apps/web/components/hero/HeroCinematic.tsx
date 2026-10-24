import Link from "next/link";
import Image from "next/image";
import {Container,buttonClass} from "@gwd/ui";
import HeroGlobe from "./HeroGlobe";
import HeroShortcuts from "./HeroShortcuts";
import {media,objectPosition} from "../../lib/media";
import {appEntryUrl} from "../../lib/site";

/** Hero Cinematográfico V1 (Direção C — experiência híbrida).
 * Layers (back → front): 1 navy atmosphere · 2 globe + connections · 3 city panels · 4 GWD digital team · 5 interface.
 * Copy and CTAs are server-rendered and usable on first paint; motion only enhances (MotionController sets --px/--py
 * for pointer parallax and --sp for the scroll hand-off to "Escolhe o teu caminho"). */
const cities=[media.heroCityBarcelona,media.heroCityRio,media.heroCitySantorini];
export default function HeroCinematic(){
 return <section className="gwd-hero" aria-labelledby="hero-title" data-parallax data-scroll-scene>
  <div className="gwd-hero-atmos" aria-hidden="true"/>
  <Container className="gwd-hero-grid">
   <div className="gwd-hero-copy">
    <span className="eyebrow">Pessoas · Conteúdo · Vendas</span>
    <h1 id="hero-title">Comunidade <span className="gwd-hero-accent">Global</span> GWD</h1>
    <p className="gwd-hero-signature">Aprende. Conecta. Cria. Cresce.</p>
    <div className="actions"><Link className={buttonClass("primary","large")} href="/entrar">Entrar na Comunidade <span className="arrow" aria-hidden="true">→</span></Link><a className={buttonClass("secondary","large")} href={appEntryUrl}>Já participo · Entrar</a></div>
    <p className="gwd-hero-note">Gratuito. Participar não constitui vínculo de emprego nem garantia de rendimento.</p>
   </div>
  </Container>
  <div className="gwd-hero-stage">
   <div className="gwd-hero-globe" aria-hidden="true"><HeroGlobe/></div>
   <div className="gwd-hero-cities" aria-hidden="true">{cities.map((m,i)=><figure key={m.id} className={"gwd-hero-city gwd-hero-city--"+(i+1)}><Image src={m.src} alt="" fill sizes="(max-width:759px) 30vw, 15vw" style={{objectPosition:objectPosition(m)}}/></figure>)}</div>
   <figure className="gwd-hero-team">
    <Image src={media.heroTeam.src} alt={media.heroTeam.alt} fill preload sizes="(max-width:759px) min(96vw, 460px), (max-width:1179px) 55vw, 800px" quality={78} style={{objectPosition:objectPosition(media.heroTeam)}}/>
    <figcaption>Equipa digital GWD · Diana · Tomás · Elisa · Maia</figcaption>
   </figure>
  </div>
  <Container className="gwd-hero-dock"><HeroShortcuts/></Container>
  <svg className="gwd-hero-thread" viewBox="0 0 2 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1 0V120" pathLength={1}/></svg>
 </section>;
}
