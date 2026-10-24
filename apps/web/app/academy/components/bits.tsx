/* Peças partilhadas da Academy (server-safe). */
import Image from "next/image";
import type {AccessTier, DeliveryMode} from "../../../lib/academy/types";

/** Canonical approved media per series (05_MEDIA_CANON derivatives); gradient + initials only as fallback. */
const posterMedia:Record<string,{src:string;position:string}>={
  "gwd-start":{src:"/media/maia-workspace-v02.webp",position:"50% 22%"},
  "conecta-que-converte":{src:"/media/gwd-team-collaboration-v02.webp",position:"50% 40%"},
  "domina-instagram":{src:"/media/gwd-community-global-v01.webp",position:"60% 30%"},
};
export function Poster({initials, gradient, small=false, tile=false, title, slug}:{initials:string;gradient:string;small?:boolean;tile?:boolean;title:string;slug?:string}){
  const media = slug ? posterMedia[slug] : undefined;
  return <div className={"ac-poster"+(small?" ac-poster--small":"")+(tile?" ac-poster--tile":"")+(media?" ac-poster--photo":"")} style={media?undefined:{background:gradient}} {...(media?{}:{role:"img","aria-label":"Poster da série "+title})}>{media?<Image src={media.src} alt={"Poster da série "+title} fill sizes="(max-width:760px) 100vw, 420px" style={{objectFit:"cover",objectPosition:media.position}}/>:<span>{initials}</span>}</div>;
}

const tierClass:Record<AccessTier,string>={FREE:"ac-chip--free",MEMBER:"ac-chip--member",PREMIUM:"ac-chip--premium",CERTIFIED:"ac-chip--certified"};
export function TierChip({tier}:{tier:AccessTier}){return <span className={"ac-chip "+tierClass[tier]}>{tier}</span>;}

const modeLabel:Record<DeliveryMode,string>={WEBPLAYER:"Vídeo",WEBREADER:"Leitura",HYBRID:"Híbrido",TELEGRAM:"Telegram",EXTERNAL:"Externo"};
export function ModeChip({mode}:{mode:DeliveryMode}){return <span className="ac-chip ac-chip--mode">{modeLabel[mode]}</span>;}

