import Image from "next/image";
import SiteFrame from "../../components/SiteFrame";
import LeadForm from "../../components/LeadForm";
import {PageHeading} from "@gwd/ui";
import {media} from "../../lib/media";
export default function Entrar(){return <SiteFrame><div className="form-layout"><div><PageHeading eyebrow="O primeiro passo" title="Vamos descobrir o teu caminho." description="Conta-nos o que te move. Depois do registo, entra na plataforma, prepara o teu perfil e começa a jornada GWD Start."/><p>Aprendizagem e comunidade primeiro. Os percursos comerciais são ativados separadamente, com regras claras.</p><a className="link" href={(process.env.GWD_APP_URL??"http://localhost:3001")+"/entrar"}>Já tenho conta →</a><figure className="portrait"><Image src={media.maia.src} alt={media.maia.alt} width={media.maia.width} height={media.maia.height} sizes="110px"/><figcaption><strong>Maia Valente</strong><small>Persona digital GWD · Comunidade</small><small>O teu percurso começa com um primeiro passo.</small></figcaption></figure></div><LeadForm appUrl={process.env.GWD_APP_URL??"http://localhost:3001"}/></div></SiteFrame>}
