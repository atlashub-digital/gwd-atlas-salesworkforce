import Link from "next/link";
import {Brand,Container} from "@gwd/ui";
import {appEntryUrl,primaryNav} from "../lib/site";

export default function SiteFooter(){return <footer className="site-footer">
 <Container>
  <div className="site-footer-grid">
   <div className="site-footer-brand"><Brand/><p className="site-footer-tagline">Pessoas · Conteúdo · Vendas</p><p>Uma comunidade global que aprende, cria e cresce em conjunto no mercado digital. Uma iniciativa AtlasHub.</p></div>
   <nav aria-label="Explorar"><h2 className="site-footer-title">Explorar</h2><ul>{primaryNav.map(item=><li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></nav>
   <nav aria-label="Participar"><h2 className="site-footer-title">Participar</h2><ul><li><Link href="/entrar">Quero fazer parte</Link></li><li><a href={appEntryUrl}>Já participo</a></li><li><Link href="/academy">Academy</Link></li><li><Link href="/privacidade">Privacidade</Link></li></ul></nav>
  </div>
  <div className="site-footer-legal"><p>Participar não constitui vínculo de emprego nem garantia de rendimento.</p><p><Link href="/privacidade">Privacidade</Link> · <Link href="/entrar">Falar do meu interesse</Link></p></div>
 </Container>
</footer>}
