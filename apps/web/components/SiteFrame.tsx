import {Container} from "@gwd/ui";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
/** `bleed` lets a page own its full-width sections (homepage); other pages stay inside the content container. */
export default function SiteFrame({children,bleed=false}:{children:React.ReactNode;bleed?:boolean}){return <div className="public-site"><a className="skip" href="#conteudo">Saltar para conteúdo</a><Navbar/><main id="conteudo">{bleed?children:<Container>{children}</Container>}</main><SiteFooter/></div>}
