import type {IconName} from "../components/Icon";
import {media,type ApprovedMedia} from "./media";
/** Market landing copy (targets 05–08 + master board). Truth layer: no counts, earnings or live opportunities. */
export type Market={key:"europa"|"brasil";name:string;lead:[string,string];body:string;photo:ApprovedMedia;secondary:ApprovedMedia;benefits:readonly {icon:IconName;label:string}[];start:readonly {title:string;body:string}[];other:{href:string;label:string}};
export const markets:Record<"europa"|"brasil",Market>={
 europa:{key:"europa",name:"EUROPA",lead:["O teu país não limita ","as tuas oportunidades."],body:"Junta-te a uma comunidade europeia de pessoas que querem aprender, divulgar e vender no digital.",photo:media.marketEuropa,secondary:media.collaboration,
  benefits:[{icon:"people",label:"Rede europeia de pessoas"},{icon:"learn",label:"Formação contínua"},{icon:"globe",label:"Oportunidades internacionais"},{icon:"tools",label:"Suporte e mentoria"},{icon:"heart",label:"Comunidade ativa"}],
  start:[{title:"Indica Europa no registo",body:"O teu mercado define a comunidade, os conteúdos e as oportunidades que vais ver primeiro."},{title:"Faz a jornada GWD Start",body:"Quatro etapas para conhecer a plataforma, as regras e os percursos disponíveis."},{title:"Prepara o teu perfil",body:"Condições e elegibilidade são apresentadas em cada oportunidade europeia aprovada."}],
  other:{href:"/oportunidades/brasil",label:"Conhecer o Digital Team Brasil"}},
 brasil:{key:"brasil",name:"BRASIL",lead:["O digital pode ser ","o teu próximo passo."],body:"Aprende. Conecta. Divulga. Cresce. Com uma comunidade no Brasil.",photo:media.marketBrasil,secondary:media.team,
  benefits:[{icon:"people",label:"Comunidade de apoio"},{icon:"learn",label:"Formação passo a passo"},{icon:"spark",label:"Oportunidades aprovadas"},{icon:"tools",label:"Suporte em Português"},{icon:"route",label:"Em todo o Brasil"}],
  start:[{title:"Indica Brasil no registo",body:"O teu mercado define a comunidade, os conteúdos e as oportunidades que vais ver primeiro."},{title:"Faz a jornada GWD Start",body:"Quatro etapas para conhecer a plataforma, as regras e os percursos disponíveis."},{title:"Escolhe o teu caminho",body:"Social Media, Afiliado ou Revendedor Autorizado — cada percurso é ativado com regras próprias."}],
  other:{href:"/oportunidades/europa",label:"Conhecer o Digital Team Europa"}}
};
