export type Capability = "COMMUNITY" | "LEARNING" | "SOCIAL_MEDIA" | "AFFILIATE" | "AUTHORIZED_SELLER" | "MENTOR" | "TEAM_LEAD";
export interface Participant { id: string; display_name: string; market: string; interest: string; onboarding_completed: boolean; }
export const starterSteps = [
  { id:"welcome", title:"Conhecer a GoWorld.Digital", points:10, body:"A GWD é uma comunidade de aprendizagem e participação no mercado digital. A inscrição não constitui vínculo de emprego, remuneração garantida ou autorização automática para vender." },
  { id:"learn", title:"Aprender antes de começar", points:10, body:"Na Academy, começa pelos fundamentos do mercado digital. Distingue prestação de serviços de social media, afiliação e revenda autorizada. Cada percurso tem regras e condições próprias." },
  { id:"community", title:"Participar com responsabilidade", points:10, body:"Respeita a privacidade das outras pessoas. Evita spam, promessas de rendimento e partilha de dados de terceiros. Usa apenas canais e materiais oficiais aprovados." },
  { id:"explore", title:"Escolher o próximo passo", points:10, body:"Explora as oportunidades e regista o teu interesse no perfil. O interesse não concede a capacidade de afiliado ou vendedor autorizado. Aguarda a publicação de critérios e oportunidades aprovadas." },
] as const;
export const academy = [
 {id:"digital-foundations",title:"O teu ponto de partida no digital",owner:"Elisa Duarte",body:"O mercado digital reúne aprendizagem, criação de conteúdo, serviços e distribuição de produtos. Começa por identificar as tuas competências, o tempo disponível e o problema que queres ajudar a resolver. Não precisas de prometer resultados para demonstrar valor."},
 {id:"paths",title:"Três caminhos, responsabilidades diferentes",owner:"Elisa Duarte",body:"Social Media: planeamento e distribuição de conteúdo. Afiliado: divulgação de uma oferta através de atribuição aprovada e regras de comissão. Revendedor autorizado: operação dentro das condições comerciais aprovadas. A participação na comunidade não ativa nenhum destes papéis comerciais."},
 {id:"responsible-content",title:"Conteúdo que merece confiança",owner:"Elisa Duarte",body:"Confirma a origem das informações, respeita direitos de imagem e torna transparente qualquer relação comercial. Usa materiais aprovados e adapta a linguagem ao público. Nunca inventes testemunhos, rendimentos ou resultados."},
];
export function validStep(id:string) { return starterSteps.find(s=>s.id===id); }
