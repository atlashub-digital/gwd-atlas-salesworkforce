import type {Metadata} from "next";
import localFont from "next/font/local";
import "@gwd/ui/styles.css";
import "./member.css";
// Self-hosted variable fonts (build must not depend on fonts.googleapis.com reachability — CI runners are offline for it).
const display=localFont({
  src:[{path:"./fonts/pjs-var-latin.woff2",weight:"600 800",style:"normal"},{path:"./fonts/pjs-var-latin-ext.woff2",weight:"600 800",style:"normal"}],
  variable:"--font-gwd-display",display:"swap",fallback:["ui-sans-serif","system-ui","Segoe UI","Arial","sans-serif"]});
const body=localFont({
  src:[{path:"./fonts/inter-var-latin.woff2",weight:"400 600",style:"normal"},{path:"./fonts/inter-var-latin-ext.woff2",weight:"400 600",style:"normal"}],
  variable:"--font-gwd-body",display:"swap",fallback:["ui-sans-serif","system-ui","Segoe UI","Arial","sans-serif"]});
export const metadata:Metadata={title:{default:"GoWorld.Digital",template:"%s | GoWorld.Digital"},description:"Aprende, conecta-te e descobre o teu caminho no mercado digital.",robots:{index:false,follow:false},};
export default function Root({children}:{children:React.ReactNode}){return <html lang="pt" className={display.variable+" "+body.variable}><body>{children}</body></html>}
