import Image from "next/image";
import type {ApiSeries,Mode,Tier} from "./types";
/** Canonical, approved media per series (05_MEDIA_CANON derivatives). Personas only — never invented people. */
const posters:Record<string,{src:string;position:string}>={
 "gwd-start":{src:"/media/maia-workspace-v02.webp",position:"50% 22%"},
 "conecta-que-converte":{src:"/media/gwd-team-collaboration-v02.webp",position:"50% 40%"},
 "domina-instagram":{src:"/media/gwd-community-global-v01.webp",position:"60% 30%"}
};
const fallback={src:"/media/gwd-team-master-v02.webp",position:"50% 30%"};
export const categoryLabel:Record<string,string>={fundamentos:"Fundamentos","social-media":"Social Media",vendas:"Marketing e vendas"};
export function SeriesPoster({series,sizes,priority=false}:{series:Pick<ApiSeries,"slug"|"title">;sizes:string;priority?:boolean}){const p=posters[series.slug]??fallback;return <Image src={p.src} alt="" fill sizes={sizes} priority={priority} style={{objectFit:"cover",objectPosition:p.position}}/>}
export const tierLabel:Record<Tier,string>={FREE:"Grátis",MEMBER:"Membro",PREMIUM:"Premium",CERTIFIED:"Certificado"};
export function TierChip({tier}:{tier:Tier}){return <span className={"ac-tier ac-tier--"+tier.toLowerCase()}>{tierLabel[tier]}</span>}
const modeLabel:Record<Mode,string>={WEBPLAYER:"Vídeo",WEBREADER:"Leitura",HYBRID:"Vídeo + leitura",TELEGRAM:"Telegram",EXTERNAL:"Externo"};
export function ModeChip({mode}:{mode:Mode}){return <span className="ac-mode">{modeLabel[mode]}</span>}
export const duration=(s:number)=>s>=3600?`${Math.floor(s/3600)} h ${Math.round(s%3600/60)} min`:`${Math.max(1,Math.round(s/60))} min`;
export const topTier=(s:ApiSeries):Tier=>(["CERTIFIED","PREMIUM","MEMBER"] as Tier[]).find(t=>s.episodes.some(e=>e.accessTier===t))??"FREE";
