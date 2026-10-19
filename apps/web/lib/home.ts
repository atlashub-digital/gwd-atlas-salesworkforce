import type {IconName} from "../components/Icon";
/** Homepage copy. Truth layer: no numbers, testimonials, client logos or income/employment claims. */
export const values:readonly {icon:IconName;label:string}[]=[
 {icon:"learn",label:"Formação prática"},
 {icon:"globe",label:"Comunidade global"},
 {icon:"spark",label:"Oportunidades reais"},
 {icon:"tools",label:"Ferramentas e suporte"},
 {icon:"route",label:"Europa e Brasil"},
 {icon:"heart",label:"Resultados com propósito"}
];
export const pillars:readonly {icon:IconName;eyebrow:string;title:string;body:string}[]=[
 {icon:"people",eyebrow:"Comunidade",title:"Pessoas que avançam juntas.",body:"Um espaço para partilhar aprendizagens, tirar dúvidas e participar com regras claras e respeito."},
 {icon:"book",eyebrow:"Aprendizagem",title:"Fundamentos antes de tudo.",body:"A Academy organiza o ponto de partida no digital: conteúdo, distribuição e responsabilidade."},
 {icon:"briefcase",eyebrow:"Oportunidades",title:"Publicadas só quando validadas.",body:"Cada oportunidade apresenta critérios e condições antes de participares. Nada é ativado por omissão."},
 {icon:"bag",eyebrow:"Vendas",title:"Percursos comerciais com regras.",body:"Afiliação e revenda autorizada são percursos próprios, com aprovação e condições definidas à partida."}
];
export const paths=[
 {index:"01",icon:"megaphone",title:"Social Media",body:"Cria, planeia e distribui conteúdo com intenção. Começa pelos fundamentos na Academy.",href:"/social-media",status:"APRENDER PRIMEIRO",tone:"info"},
 {index:"02",icon:"link",title:"Afiliado",body:"Divulga ofertas aprovadas com atribuição definida. Links e comissões dependem de ativação e elegibilidade.",href:"/afiliados",status:"EM PREPARAÇÃO",tone:"warning"},
 {index:"03",icon:"bag",title:"Revendedor Autorizado",body:"Opera dentro de condições comerciais aprovadas. O interesse não concede o estatuto de vendedor.",href:"/revendedores",status:"EM PREPARAÇÃO",tone:"warning"}
] as const;
export const steps=[
 {title:"Interesse",body:"Regista o teu interesse e indica o teu mercado: Europa, Brasil ou outro."},
 {title:"Comunidade",body:"Conheces as regras e as pessoas com quem vais aprender."},
 {title:"Aprendizagem",body:"Completas a jornada GWD Start e os fundamentos da Academy."},
 {title:"Caminho",body:"Escolhes por onde avançar: Social Media, afiliação ou revenda autorizada."},
 {title:"Execução",body:"Quando um percurso é ativado para ti, trabalhas com materiais e regras aprovadas."},
 {title:"Crescimento",body:"Evoluis com a comunidade, ao teu ritmo e sem promessas de rendimento."}
] as const;
export const opportunities=[
 {title:"Digital Team Europa",body:"Oportunidades para o mercado europeu, publicadas após validação dos critérios.",href:"/oportunidades/europa",status:"EM BREVE"},
 {title:"Digital Team Brasil",body:"Oportunidades para o mercado brasileiro, publicadas após validação dos critérios.",href:"/oportunidades/brasil",status:"EM BREVE"},
 {title:"Afiliação e revenda autorizada",body:"Condições, catálogo e responsabilidades são apresentados antes de qualquer ativação.",href:"/oportunidades",status:"EM PREPARAÇÃO"}
] as const;
export const team=[
 {name:"Diana Matos",role:"Product, Operations & Growth"},
 {name:"Tomás Rocha",role:"Research & Content Intelligence"},
 {name:"Elisa Duarte",role:"Learning Product & Media"},
 {name:"Maia Valente",role:"Community, Seller Success & Gamification"}
] as const;
