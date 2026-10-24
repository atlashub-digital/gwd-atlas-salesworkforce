import type {Metadata} from "next";
import localFont from "next/font/local";
import "@gwd/ui/styles.css";
import "./site.css";
// Self-hosted variable fonts (build must not depend on fonts.googleapis.com reachability — CI runners are offline for it).
const display=localFont({
  src:[{path:"./fonts/pjs-var-latin.woff2",weight:"600 800",style:"normal"},{path:"./fonts/pjs-var-latin-ext.woff2",weight:"600 800",style:"normal"}],
  variable:"--font-gwd-display",display:"swap",fallback:["ui-sans-serif","system-ui","Segoe UI","Arial","sans-serif"]});
const body=localFont({
  src:[{path:"./fonts/inter-var-latin.woff2",weight:"400 600",style:"normal"},{path:"./fonts/inter-var-latin-ext.woff2",weight:"400 600",style:"normal"}],
  variable:"--font-gwd-body",display:"swap",fallback:["ui-sans-serif","system-ui","Segoe UI","Arial","sans-serif"]});
const siteTitle="GoWorld.Digital — Comunidade Global GWD",siteDescription="Aprende. Conecta. Cria. Cresce. Uma comunidade global onde pessoas aprendem, encontram oportunidades e crescem no mercado digital.";
export const metadata:Metadata={metadataBase:new URL("https://goworld.digital"),title:{default:siteTitle,template:"%s | GoWorld.Digital"},description:siteDescription,
 openGraph:{type:"website",locale:"pt_PT",siteName:"GoWorld.Digital",title:siteTitle,description:siteDescription,url:"/"},
 twitter:{card:"summary_large_image",title:siteTitle,description:siteDescription}};
export default function Root({children}:{children:React.ReactNode}){return <html lang="pt" className={display.variable+" "+body.variable}><body>{children}</body></html>}
