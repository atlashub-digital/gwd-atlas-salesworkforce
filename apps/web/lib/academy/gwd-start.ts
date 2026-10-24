/* GWD Start — conteúdo definitivo V1 (24/10/2026). Curso de entrada da GWD Academy, em leitura (Reader) com quizzes.
   Fonte dos factos: posicionamento público (apps/web/lib/content.ts), regras da comunidade, regras de progresso/XP da API
   e o contrato docs/execution/CONTENT_CONTRACT_GWD_START.md. Sem promessas de rendimento, sem vídeo inventado:
   quando houver masters autorizados, um episódio passa a HYBRID sem mudar o slug (o progresso dos membros fica ligado a ele).
   Slugs estáveis: já existem em produção. */

import type {Episode, EpisodeAsset, ReaderSection, QuizQuestion} from "./types";

type StartEpisode = {
  slug: string;
  season: 1 | 2;
  title: string;
  summary: string;
  type: "READER" | "QUIZ";
  tier: "FREE" | "MEMBER";
  seconds: number;
  sections: ReaderSection[];
  quiz?: QuizQuestion[];
};

const episodes: StartEpisode[] = [
  {
    slug: "boas-vindas-gwd",
    season: 1,
    title: "Boas-vindas à GWD",
    summary: "O que é a GWD, como funciona a Academy e como o teu progresso é registado.",
    type: "READER",
    tier: "FREE",
    seconds: 420,
    sections: [
      {heading: "O que é a GoWorld.Digital", body: "A GoWorld.Digital (GWD) é uma comunidade de aprendizagem e participação no mercado digital. Aqui aprendes fundamentos, conheces pessoas com objetivos parecidos e descobres, com tempo, caminhos de participação como Social Media, afiliação ou revenda autorizada.\n\nConvém ser claro desde o início: a inscrição na GWD não é um emprego e não garante rendimentos. A GWD não te pede pagamentos para começar. O teu avanço depende da tua aprendizagem, da tua prática e das regras de cada caminho, que são sempre apresentadas antes de participares."},
      {heading: "Como está organizada a Academy", body: "A Academy está organizada em séries, temporadas e episódios. O GWD Start é a primeira série e é gratuita: dá-te a base para tudo o resto.\n\nCada episódio pode ser de leitura (como este), de vídeo, híbrido ou de verificação (um quiz curto). Alguns episódios abrem fora da plataforma, por exemplo no Telegram, mas o catálogo, o progresso e a conclusão ficam sempre registados na GWD.\n\nLê com calma, secção a secção. Podes sair e voltar: a plataforma guarda a secção mais avançada que abriste."},
      {heading: "Como contam o progresso e os pontos", body: "Um episódio só fica concluído quando a regra dele é cumprida. Na leitura, isso significa chegar ao fim do texto com tempo real de leitura; no vídeo, ver a maior parte com participação real (avançar até ao fim não conta); na verificação, ser aprovado no quiz.\n\nOs pontos (XP) são atribuídos pelo servidor, uma única vez por conquista: +10 por episódio concluído, +10 por quiz aprovado e +50 por série concluída. Não há pontos por recarregar páginas, por compras nem por publicar na comunidade. Os pontos mostram o teu percurso; não são dinheiro nem dão acesso automático a nenhum caminho comercial."},
      {heading: "O que encontras na app", body: "Na app tens cinco áreas principais. Início: o teu ponto de situação e o próximo passo. Academy: as séries e o teu progresso. Comunidade: depois de aceitares as regras, podes ler, perguntar e partilhar no feed. Oportunidades: os caminhos publicados quando estiverem aprovados. Perfil: os teus dados e preferências.\n\nQuando uma função ainda não está ativa, a app di-lo com clareza, com estados como \"Em preparação\" ou \"Em breve\". Preferimos mostrar o estado real do que prometer o que ainda não existe."},
    ],
  },
  {
    slug: "o-teu-ponto-de-partida",
    season: 1,
    title: "O teu ponto de partida no digital",
    summary: "Reconhece as tuas competências, o teu tempo e escolhe um primeiro objetivo realista.",
    type: "READER",
    tier: "FREE",
    seconds: 600,
    sections: [
      {heading: "Começa pelo que já sabes fazer", body: "Toda a gente chega ao digital com competências. Algumas são evidentes, como escrever bem, fotografar ou conhecer uma rede social. Outras passam despercebidas: organizar o teu dia, explicar coisas com paciência, conhecer bem um produto ou uma comunidade.\n\nFaz uma lista curta com três colunas. Na primeira, escreve o que fazes bem. Na segunda, o que gostas de fazer. Na terceira, o que outras pessoas já te pediram ajuda para fazer. As competências que aparecem em mais do que uma coluna são o teu melhor ponto de partida."},
      {heading: "Conhece o teu tempo e as tuas condições", body: "Antes de escolher um objetivo, sê honesto sobre o tempo que tens. Trinta minutos por dia com regularidade valem mais do que uma tarde inteira uma vez por mês.\n\nRegista também as tuas condições: o equipamento que usas (telemóvel, computador), a ligação à internet, o mercado onde estás (Brasil, Europa ou outro) e as línguas em que comunicas. Estas condições não te limitam; ajudam-te a escolher um primeiro passo que consegues mesmo cumprir.\n\nUm exemplo: \"tenho 30 minutos ao fim do dia, uso sobretudo o telemóvel e comunico em português\" já te diz muito. Significa que episódios de leitura curtos e tarefas simples no telemóvel são o teu melhor formato para começar."},
      {heading: "Escolhe um primeiro objetivo realista", body: "Um bom primeiro objetivo é concreto, pequeno e verificável. \"Ter sucesso no digital\" não é um objetivo; \"concluir o GWD Start nas próximas duas semanas\" ou \"publicar uma apresentação na comunidade esta semana\" são.\n\nEscreve o teu objetivo numa frase com três partes: o que vais fazer, até quando e como vais saber que o cumpriste. Evita objetivos de rendimento nesta fase: ainda estás a construir a base, e o rendimento depende de caminhos e condições que só conhecerás mais à frente."},
      {heading: "Exercício: a tua folha de partida", body: "Antes de passares ao próximo episódio, escreve num caderno ou numa nota do telemóvel:\n\n1. As tuas três competências mais fortes.\n2. O tempo que tens por dia e por semana.\n3. O teu mercado e as tuas línguas.\n4. O teu primeiro objetivo, numa frase, com prazo.\n\nGuarda esta folha. Vais voltar a ela no episódio sobre rotina, no fim do curso. Se quiseres, partilha o teu objetivo no espaço Apresentações da comunidade: dizer o que queres alcançar ajuda a mantê-lo."},
    ],
  },
  {
    slug: "tres-caminhos",
    season: 1,
    title: "Três caminhos, responsabilidades diferentes",
    summary: "Distingue Social Media, afiliação e revenda autorizada antes de escolher.",
    type: "READER",
    tier: "FREE",
    seconds: 540,
    sections: [
      {heading: "Social Media: criar conteúdo com propósito", body: "O caminho de Social Media é sobre criar, planear e distribuir conteúdo para o mercado digital. Começa por perceber o público, a mensagem e a consistência, sempre com ética na comunicação.\n\nA responsabilidade principal é a qualidade e a honestidade do que publicas: usar apenas imagens, músicas e textos que tens direito a usar, não enganar quem te lê e respeitar as regras de cada plataforma. Projetos e critérios de participação neste caminho são publicados quando forem aprovados.\n\nUm bom ponto de partida é escolher um tema que conheces e publicar com regularidade, mesmo que pouco."},
      {heading: "Afiliação: recomendar com responsabilidade", body: "Um afiliado divulga ofertas aprovadas e cada recomendação tem uma atribuição definida. As condições, incluindo comissões, são apresentadas antes de participares.\n\nPontos importantes: manifestar interesse no teu perfil não ativa a afiliação; links e comissões dependem da ativação comercial e da aprovação da tua elegibilidade. Ao recomendar, és responsável por dizer a verdade sobre o produto e por indicar que tens uma relação comercial com a oferta.\n\nNa prática, só recomendas o que conheces e o que ajudaria mesmo quem te ouve. Uma recomendação honesta, mesmo que gere menos interesse no imediato, protege a tua reputação, que é o que te permite continuar a recomendar no futuro."},
      {heading: "Revenda autorizada: operar com regras próprias", body: "A revenda autorizada é o caminho com mais responsabilidades. Exige aprovação e condições comerciais próprias: catálogo, condições de oferta e responsabilidades são publicados antes da ativação.\n\nO interesse no percurso não concede o estatuto de vendedor autorizado. Preços, margens e pagamentos são tratados por sistemas próprios e só ficam ativos quando houver uma aprovação formal. Até lá, ninguém está autorizado a vender em nome da GWD.\n\nQuem segue este caminho trata diretamente com clientes: informação correta sobre o produto, prazos, apoio e respeito pelos dados de quem compra. Por isso, a aprovação avalia não só o interesse, mas também a preparação para assumir estas responsabilidades."},
      {heading: "Como escolher e o que vem a seguir", body: "Não tens de escolher já. Usa a tua folha de partida: se gostas de criar e comunicar, Social Media é um bom começo; se conheces bem produtos e pessoas que confiam em ti, a afiliação pode fazer sentido; se queres gerir uma operação com clientes, a revenda autorizada é o caminho mais exigente.\n\nEm todos os casos, os acessos são concedidos por aprovação da equipa e nunca automaticamente pelos pontos. A Academy terá séries próprias para cada caminho; o GWD Start é a base comum."},
    ],
  },
  {
    slug: "verificacao-fundamentos",
    season: 1,
    title: "Verificação de fundamentos",
    summary: "Quiz curto para confirmar a base da temporada 1 antes de avançares.",
    type: "QUIZ",
    tier: "FREE",
    seconds: 300,
    sections: [
      {heading: "Antes do quiz", body: "Esta verificação tem cinco perguntas sobre os três episódios anteriores: o que é a GWD, como contam o progresso e os pontos, o teu ponto de partida e os três caminhos.\n\nPrecisas de 80 % para ser aprovado, ou seja, quatro respostas certas em cinco. Se não passares à primeira, revê os episódios e tenta de novo; só a aprovação conta para o teu progresso. As respostas certas nunca são mostradas no browser. Lê cada pergunta até ao fim: as opções erradas costumam parecer plausíveis à primeira vista."},
    ],
    quiz: [
      {id: "q1", prompt: "A inscrição na GWD garante um emprego ou um rendimento?", options: ["Sim, depois de concluir o GWD Start", "Não: a GWD é uma comunidade de aprendizagem e participação, sem emprego nem rendimento garantido", "Sim, a partir de 100 pontos"], correctIndex: 1},
      {id: "q2", prompt: "Como fica concluído um episódio de leitura?", options: ["Ao abrir a primeira secção", "Ao chegar ao fim do texto com tempo real de leitura", "Ao clicar em \"Próximo episódio\""], correctIndex: 1},
      {id: "q3", prompt: "Qual destes é um bom primeiro objetivo?", options: ["Ter sucesso no digital", "Ganhar dinheiro rapidamente", "Concluir o GWD Start nas próximas duas semanas"], correctIndex: 2},
      {id: "q4", prompt: "Manifestar interesse na afiliação no teu perfil…", options: ["ativa imediatamente os links e as comissões", "não ativa a afiliação: depende da ativação comercial e da aprovação de elegibilidade", "dá o estatuto de vendedor autorizado"], correctIndex: 1},
      {id: "q5", prompt: "Como são concedidos os acessos aos caminhos comerciais?", options: ["Por aprovação da equipa, nunca automaticamente pelos pontos", "Automaticamente ao atingir 50 pontos", "Ao publicar na comunidade"], correctIndex: 0},
    ],
  },
  {
    slug: "etica-e-confianca",
    season: 2,
    title: "Conteúdo que merece confiança",
    summary: "Comunica com transparência e respeita pessoas, dados e direitos.",
    type: "READER",
    tier: "MEMBER",
    seconds: 540,
    sections: [
      {heading: "Transparência acima de tudo", body: "A confiança é o ativo mais importante de quem trabalha no digital, e perde-se depressa. Comunica sempre o que é verdade e verificável.\n\nNunca faças promessas de rendimento, nem a ti próprio nem a outras pessoas. Frases como \"ganha X por mês\" ou \"rendimento garantido\" são proibidas na comunidade GWD e, em muitos países, também por lei. Quando recomendas uma oferta e tens uma relação comercial com ela, di-lo de forma clara.\n\nUm teste simples antes de publicar: se a pessoa que te lê soubesse tudo o que tu sabes sobre o assunto, sentir-se-ia enganada? Se a resposta puder ser sim, reescreve."},
      {heading: "Privacidade e dados de outras pessoas", body: "Não publiques dados de terceiros: nomes completos, contactos, moradas, conversas privadas ou capturas de ecrã que identifiquem alguém sem autorização. Isto vale para a comunidade GWD, para as tuas redes e para qualquer grupo.\n\nSe precisares de mostrar um exemplo, anonimiza-o: remove nomes, números e fotografias. Trata os dados de clientes e contactos como gostarias que tratassem os teus.\n\nO mesmo cuidado aplica-se a grupos de WhatsApp, Telegram ou Facebook: adicionar alguém a um grupo, partilhar o contacto de outra pessoa ou reencaminhar uma conversa exige o consentimento dela. Na dúvida, pergunta primeiro."},
      {heading: "Direitos de imagem, música e conteúdo", body: "Usa apenas materiais que tens direito a usar: conteúdo teu, conteúdo licenciado ou materiais oficiais disponibilizados para esse fim. Copiar vídeos, imagens, músicas ou textos de outras pessoas sem autorização pode levar à remoção do conteúdo e a problemas legais.\n\nAntes de publicar, pergunta-te: de quem é isto, e tenho autorização para o usar desta forma? Se não sabes a resposta, não publiques.\n\nAtenção também às pessoas que aparecem nas tuas fotografias e vídeos: mostrar o rosto de alguém, sobretudo de crianças, exige autorização. As fotografias de bancos de imagens têm licenças com regras próprias; lê-as antes de usar."},
      {heading: "As regras da comunidade GWD", body: "Para participares no feed da comunidade aceitas regras simples: respeita a privacidade, não publiques dados de terceiros, evita spam, não faças promessas de rendimento e usa apenas materiais e canais oficiais.\n\nSe vires uma publicação que quebra estas regras, usa a opção de denúncia; a equipa analisa e pode ocultar o conteúdo. Ninguém pode remover publicações de outros membros: a moderação é feita pela equipa, de forma transparente. Estas regras protegem todos, incluindo-te a ti, e valem tanto para publicações como para respostas."},
    ],
  },
  {
    slug: "rotina-de-aprendizagem",
    season: 2,
    title: "Construir uma rotina de aprendizagem",
    summary: "Consistência simples: o que fazer todos os dias e todas as semanas para avançar.",
    type: "READER",
    tier: "MEMBER",
    seconds: 480,
    sections: [
      {heading: "Pouco, mas todos os dias", body: "A rotina é o que transforma intenção em progresso. Define um bloco curto e fixo, por exemplo 20 a 30 minutos, sempre à mesma hora. Começa com uma tarefa clara: ler um episódio, fazer um exercício ou responder a uma dúvida na comunidade.\n\nQuando falhares um dia, não tentes compensar com horas extra no dia seguinte. Retoma o bloco habitual. A regularidade vale mais do que a intensidade.\n\nAjuda ter um lugar e um gatilho fixos: por exemplo, depois do jantar, no mesmo sítio, com o telemóvel em modo de não incomodar. Ao fim de algumas semanas, o bloco deixa de exigir esforço de vontade."},
      {heading: "O plano da semana", body: "Uma vez por semana, reserva dez minutos para planear. Escolhe no máximo três tarefas para a semana: um episódio ou série para concluir, uma prática concreta e uma participação na comunidade (uma pergunta, uma partilha ou uma resposta útil a alguém).\n\nNo fim da semana, revê: o que concluíste, o que ficou por fazer e porquê. Ajusta a semana seguinte com base no que aprendeste, não no que gostarias de ter feito. Planear pouco e cumprir é melhor do que planear muito e desistir a meio."},
      {heading: "Usa a comunidade para aprender mais depressa", body: "No espaço \"Dúvidas da Academy\" podes perguntar sobre episódios, leituras e quizzes. Explicar o que aprendeste a outra pessoa é uma das formas mais eficazes de consolidar o conhecimento.\n\nPartilha também o teu progresso no espaço Geral: concluir uma série, cumprir o primeiro objetivo ou aprender algo novo. Lembra-te de que publicar não dá pontos: participa porque te ajuda a ti e aos outros.\n\nQuando perguntares, dá contexto: o episódio, o que já tentaste e onde ficaste com dúvidas. Perguntas claras recebem respostas melhores e ajudam quem tiver a mesma dúvida depois de ti."},
      {heading: "Fecha o ciclo e escolhe o próximo passo", body: "Volta à folha de partida que criaste no início do curso. Cumpriste o teu primeiro objetivo? Se sim, define o próximo, um pouco mais exigente. Se não, ajusta-o ao tempo e às condições que tens realmente.\n\nCom o GWD Start concluído tens a base comum da GWD. O próximo passo é escolher, sem pressa, o caminho que mais te interessa e acompanhar as novas séries da Academy e as oportunidades aprovadas na app. Este episódio fecha com uma verificação sobre a temporada 2: quando o concluíres, e se os episódios anteriores também estiverem concluídos, a série fica completa e recebes os pontos de série concluída."},
    ],
    quiz: [
      {id: "q1", prompt: "O que é mais eficaz para avançar?", options: ["Um bloco curto e fixo todos os dias", "Uma tarde inteira uma vez por mês", "Estudar só quando houver tempo livre"], correctIndex: 0},
      {id: "q2", prompt: "Qual destas publicações quebra as regras da comunidade?", options: ["Uma pergunta sobre um episódio da Academy", "\"Com este método ganhas 2000 € por mês, garantido\"", "A partilha de que concluíste uma série"], correctIndex: 1},
      {id: "q3", prompt: "Queres mostrar uma conversa com um cliente como exemplo. O que fazes?", options: ["Publicas a captura de ecrã tal como está", "Anonimizas: removes nomes, números e fotografias", "Publicas só o número de telefone"], correctIndex: 1},
      {id: "q4", prompt: "Encontras uma publicação de outro membro que quebra as regras. O que fazes?", options: ["Removes a publicação", "Usas a opção de denúncia para a equipa analisar", "Respondes com os dados dessa pessoa"], correctIndex: 1},
    ],
  },
];

function assetsFor(ep: StartEpisode): EpisodeAsset[] {
  const list: EpisodeAsset[] = [{kind: "reader", assetId: `gwd-start-reader-${ep.slug}`, title: "Leitura", sections: ep.sections}];
  if (ep.quiz?.length) list.push({kind: "quiz", assetId: `gwd-start-quiz-${ep.slug}`, quiz: ep.quiz.map(q => ({...q, id: `${ep.slug}-${q.id}`}))});
  return list;
}

export const gwdStartEpisodes: Episode[] = episodes.map((ep, i) => ({
  id: `gwd-start-ep-${ep.slug}`,
  slug: ep.slug,
  seriesId: "gwd-start",
  seasonNumber: ep.season,
  number: i + 1,
  code: `EP${String(i + 1).padStart(2, "0")}`,
  title: ep.title,
  summary: ep.summary,
  episodeType: ep.type,
  deliveryMode: "WEBREADER",
  provider: "GWD_READER",
  accessTier: ep.tier,
  durationSeconds: ep.seconds,
  assets: assetsFor(ep),
}));
