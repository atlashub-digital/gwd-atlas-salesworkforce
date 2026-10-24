/** Public-site navigation and the member-app origin (never a localhost fallback). */
export const appUrl=process.env.GWD_APP_URL??"https://app.goworld.digital";
export const appEntryUrl=appUrl+"/entrar";
export const primaryNav=[
 {href:"/#equipa",label:"Pessoas"},
 {href:"/academy",label:"Academy"},
 {href:"/comunidade",label:"Comunidade"},
 {href:"/oportunidades",label:"Oportunidades"}
] as const;
