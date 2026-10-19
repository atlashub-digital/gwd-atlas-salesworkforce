/** Public-site navigation and the member-app origin (never a localhost fallback). */
export const appUrl=process.env.GWD_APP_URL??"https://app.goworld.digital";
export const appEntryUrl=appUrl+"/entrar";
export const primaryNav=[
 {href:"/comunidade",label:"Pessoas"},
 {href:"/academy",label:"Conteúdo"},
 {href:"/oportunidades",label:"Vendas"},
 {href:"/oportunidades/europa",label:"Europa"},
 {href:"/oportunidades/brasil",label:"Brasil"},
 {href:"/#como-funciona",label:"Como Funciona"}
] as const;
