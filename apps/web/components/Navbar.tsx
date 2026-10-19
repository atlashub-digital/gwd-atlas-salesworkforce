import Link from "next/link";
import {Brand,Container,buttonClass} from "@gwd/ui";
import MobileNav from "./MobileNav";
import {appEntryUrl,primaryNav} from "../lib/site";

export default function Navbar(){return <header className="site-nav">
 <Container className="site-nav-inner">
  <Link className="site-nav-brand" href="/" aria-label="GoWorld.Digital — início"><Brand/></Link>
  <nav className="site-nav-links" aria-label="Navegação principal"><ul>{primaryNav.map(item=><li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></nav>
  <div className="site-nav-actions"><a className={buttonClass("ghost","small")} href={appEntryUrl}>Entrar</a><Link className={buttonClass("primary","small")} href="/entrar">Quero fazer parte <span className="arrow" aria-hidden="true">→</span></Link></div>
  <MobileNav appEntryUrl={appEntryUrl}/>
 </Container>
</header>}
