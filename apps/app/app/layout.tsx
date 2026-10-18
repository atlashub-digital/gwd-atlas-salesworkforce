import type {Metadata} from "next";
import "@gwd/ui/styles.css";
export const metadata:Metadata={title:{default:"GoWorld.Digital",template:"%s | GoWorld.Digital"},description:"Aprende, conecta-te e descobre o teu caminho no mercado digital.",robots:{index:false,follow:false},};
export default function Root({children}:{children:React.ReactNode}){return <html lang="pt"><body>{children}</body></html>}
