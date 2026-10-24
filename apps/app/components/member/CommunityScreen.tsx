import Image from "next/image";
import {Status} from "@gwd/ui";
import {ScreenHeader} from "./bits";
import CommunityFeed from "./CommunityFeed";
import type {Community} from "./types";
/** Comunidade (target 06 / master board 08): rules, official channels and the native Community V1 feed (real posts only). */
export default function CommunityScreen({community,rules,setRules,busy,join}:{community:Community|null;rules:boolean;setRules:(v:boolean)=>void;busy:boolean;join:()=>void}){
 return <section className="member-community">
  <ScreenHeader icon="comunidade" title="Comunidade" subtitle="Conecta. Partilha. Cresce. · com Maia Valente"/>
  <div className="community-banner"><Image src="/media/gwd-community-banner-v01.webp" alt="Pessoas da comunidade GWD a criar conteúdo e a aprender, com cidades ligadas ao fundo." fill sizes="(max-width:760px) 100vw, 70vw" style={{objectFit:"cover",objectPosition:"30% 70%"}}/><div><strong>Avançar sabe melhor em conjunto.</strong><span>Um espaço de respeito, troca e aprendizagem. A ligação a grupos externos é sempre uma escolha tua.</span></div></div>
  <div className="grid two">
   <section className="card"><h2>Antes de participar</h2><p>Respeita a privacidade, não publiques dados de terceiros e evita spam. Não faças promessas de rendimento. Usa apenas materiais e canais oficiais.</p>{community?.member?<p className="notice success">A tua adesão às regras está registada.</p>:<><label className="check"><input type="checkbox" checked={rules} onChange={e=>setRules(e.target.checked)}/><span>Li e aceito as regras de participação.</span></label><button className="button" style={{marginTop:20}} disabled={!rules||busy} onClick={join}>Registar adesão</button></>}</section>
   <section className="card"><h2>Canais oficiais</h2>{community?.links.length?community.links.map(link=><p key={link.url}>{community.member?<a className="button secondary" href={link.url} target="_blank" rel="noopener noreferrer">Abrir {link.label} ↗</a>:<span className="muted">{link.label} · aceita primeiro as regras.</span>}</p>):<><Status/><p>As ligações oficiais serão disponibilizadas após validação operacional. A adesão às regras não confirma entrada num grupo externo.</p></>}</section>
  </div>
  {community?.member?<CommunityFeed/>:<section className="card community-feed"><h2>Feed da comunidade</h2><p>Aceita as regras acima para ler e publicar no feed da comunidade.</p></section>}
 </section>;
}
