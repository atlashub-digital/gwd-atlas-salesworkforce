import type {Metadata} from "next";
import {Inter,Plus_Jakarta_Sans} from "next/font/google";
import "@gwd/ui/styles.css";
import "./site.css";
const display=Plus_Jakarta_Sans({subsets:["latin","latin-ext"],weight:["600","700","800"],variable:"--font-gwd-display",display:"swap"});
const body=Inter({subsets:["latin","latin-ext"],weight:["400","500","600"],variable:"--font-gwd-body",display:"swap"});
export const metadata:Metadata={title:{default:"GoWorld.Digital — Começa no digital",template:"%s | GoWorld.Digital"},description:"Pessoas. Conteúdo. Vendas. Uma comunidade global onde pessoas aprendem, encontram oportunidades e crescem no mercado digital.",};
export default function Root({children}:{children:React.ReactNode}){return <html lang="pt" className={display.variable+" "+body.variable}><body>{children}</body></html>}
