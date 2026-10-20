/* Peças partilhadas da Academy (server-safe). */
import type {AccessTier, DeliveryMode} from "../../../lib/academy/types";

export function Poster({initials, gradient, small=false, tile=false, title}:{initials:string;gradient:string;small?:boolean;tile?:boolean;title:string}){
  return <div className={"ac-poster"+(small?" ac-poster--small":"")+(tile?" ac-poster--tile":"")} style={{background:gradient}} role="img" aria-label={"Poster da série "+title}><span>{initials}</span></div>;
}

const tierClass:Record<AccessTier,string>={FREE:"ac-chip--free",MEMBER:"ac-chip--member",PREMIUM:"ac-chip--premium",CERTIFIED:"ac-chip--certified"};
export function TierChip({tier}:{tier:AccessTier}){return <span className={"ac-chip "+tierClass[tier]}>{tier}</span>;}

const modeLabel:Record<DeliveryMode,string>={WEBPLAYER:"Vídeo",WEBREADER:"Leitura",HYBRID:"Híbrido",TELEGRAM:"Telegram",EXTERNAL:"Externo"};
export function ModeChip({mode}:{mode:DeliveryMode}){return <span className="ac-chip ac-chip--mode">{modeLabel[mode]}</span>;}

export function DemoBadge(){return <span className="ac-demo-note">◈ Demo catalog V1</span>;}
