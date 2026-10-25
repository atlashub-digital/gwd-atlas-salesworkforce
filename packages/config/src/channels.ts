/** Official GWD community channels — the single source for the homepage shortcuts, /canais and the member app.
 *  Public invites only: never the private Telegram channels the Academy uses to distribute episodes. Opening an invite
 *  never joins anyone automatically; each platform asks the person to confirm (and, where noted, an admin to approve). */
export type OfficialChannelId="whatsapp"|"discord"|"telegram";
export type OfficialChannel={id:OfficialChannelId;label:string;title:string;url:string;description:string;access:string;status:string};
export const officialChannels:readonly OfficialChannel[]=Object.freeze([
 {id:"whatsapp",label:"WhatsApp",title:"Comunidade WhatsApp",url:"https://chat.whatsapp.com/Jcd7Z4t5fbH2qG5tnJ1fst",
  description:"Avisos da GWD e conversa da comunidade, no telemóvel.",
  access:"Abre o convite no WhatsApp e confirma a entrada. Só entras se aceitares; o teu número fica visível para os administradores do grupo.",status:"ATIVO"},
 {id:"discord",label:"Discord",title:"Servidor Discord GWD",url:"https://discord.gg/qRwm5desFH",
  description:"Comunidade & Academy por temas: apresentações, dúvidas e partilha de trabalho.",
  access:"Convite permanente. Precisas de uma conta Discord e de aceitar o convite; algumas salas podem pedir verificação.",status:"ATIVO"},
 {id:"telegram",label:"Telegram",title:"Comunidade Telegram GWD",url:"https://t.me/+h3RxY5qntiE5NWQx",
  description:"Grupo da comunidade para novidades e conversa. Os episódios da Academy continuam dentro da plataforma.",
  access:"Abre o convite no Telegram e toca em «Entrar». Este grupo é diferente dos canais privados dos episódios da Academy.",status:"ATIVO"},
]);
/** Personal contact with Maia Valente (distinct from the public groups). A person answers; no instant AI support.
 *  Direct link to the number given by the direction: the provided QR link (wa.me/qr/DM2APA363VMAK1) answers HTTP 400 on
 *  desktop browsers and cannot be checked against the number without the app, so it is kept only as `qrUrl`. */
export const maiaContact=Object.freeze({name:"Maia Valente",role:"Community, Seller Success & Gamification",
 url:"https://wa.me/5562994432321",qrUrl:"https://wa.me/qr/DM2APA363VMAK1",phone:"+55 62 99443-2321",
 note:"Contacto pessoal por WhatsApp para dúvidas sobre o teu percurso. Responde uma pessoa da equipa — não é atendimento automático nem instantâneo."});
export const communityEmail="comunidade@goworld.digital";
