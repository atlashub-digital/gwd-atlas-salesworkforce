/* Percurso B — Social Media: fundamentos de conteúdo, plataformas e formatos, planeamento editorial,
   publicação e métricas, ética e direitos. Referência editorial: Elisa Duarte. Sem números de alcance inventados. */

import {buildReaderEpisodes, type ReaderEpisodeSeed} from "./reader-series";

const seeds: ReaderEpisodeSeed[] = [
  {
    slug: "fundamentos-de-conteudo",
    season: 1,
    title: "Fundamentos de conteúdo",
    summary: "Público, mensagem e valor: as três decisões antes de qualquer publicação.",
    type: "READER",
    tier: "FREE",
    seconds: 600,
    sections: [
      {heading: "Para quem estás a escrever", body: "Todo o conteúdo começa numa pessoa concreta. Descreve-a numa frase: quem é, o que procura e o que a preocupa. \"Mães que trabalham por conta própria e querem organizar melhor a semana\" é mais útil do que \"toda a gente\".\n\nQuando sabes para quem escreves, sabes que palavras usar, que exemplos dar e o que deixar de fora."},
      {heading: "Uma mensagem por publicação", body: "Cada publicação deve deixar uma ideia clara. Antes de criar, completa a frase: \"Depois de ver isto, a pessoa vai saber/sentir/fazer...\". Se precisares de mais do que uma frase, provavelmente tens duas publicações.\n\nA estrutura mais simples funciona em quase todas as plataformas: um início que prende a atenção, o conteúdo útil e um fecho que diz o que fazer a seguir (guardar, comentar, ler mais)."},
      {heading: "Os quatro tipos de valor", body: "Um conteúdo vale a pena quando faz pelo menos uma destas coisas: ensina (explica como fazer algo), inspira (mostra o que é possível, sem exageros), entretém (prende pela história ou pelo humor) ou ajuda a decidir (compara, esclarece dúvidas, mostra prós e contras).\n\nMistura os quatro ao longo da semana. Um perfil que só vende cansa; um perfil que só entretém raramente leva alguém a agir."},
      {heading: "Exercício: três ideias para o teu público", body: "Com a pessoa que descreveste, escreve três ideias de conteúdo, uma por tipo de valor à tua escolha. Para cada ideia, escreve a mensagem principal numa frase.\n\nGuarda as ideias: vais usá-las no episódio de planeamento editorial.\n\nSe te faltarem ideias, olha para as perguntas que te fazem com frequência, para os erros que vês outras pessoas cometer e para o que gostavas de ter sabido quando começaste."},
    ],
  },
  {
    slug: "plataformas-e-formatos",
    season: 1,
    title: "Plataformas e formatos",
    summary: "Escolhe onde publicar e em que formato, sem tentar estar em todo o lado.",
    type: "READER",
    tier: "MEMBER",
    seconds: 660,
    sections: [
      {heading: "Começa por uma plataforma principal", body: "Estar em todas as redes ao mesmo tempo é a forma mais rápida de desistir. Escolhe uma plataforma principal onde o teu público já está e onde te sentes confortável a criar.\n\nPergunta-te: onde é que a pessoa que descrevi passa tempo? Que tipo de conteúdo consome lá? Consigo produzir esse tipo de conteúdo com regularidade?"},
      {heading: "Formatos e para que servem", body: "Vídeo curto (Reels, TikTok, Shorts): bom para chegar a pessoas novas; exige um início forte nos primeiros segundos.\n\nCarrossel e imagem: bom para explicar passo a passo e para conteúdo que as pessoas guardam.\n\nStories e estados: bom para proximidade e para o dia a dia; desaparece em 24 horas.\n\nTexto longo (LinkedIn, blogue, newsletter): bom para profundidade e confiança.\n\nGrupos e canais (WhatsApp, Telegram, Discord): bom para relação contínua com quem já te conhece; exige consentimento de quem entra."},
      {heading: "Adaptar, não copiar", body: "A mesma ideia pode viver em vários formatos, mas cada plataforma tem a sua linguagem. Um vídeo pensado para TikTok com marcas de água de outra rede, ou um texto longo colado num story, perde força.\n\nReaproveita a ideia e a pesquisa; adapta o formato, a duração e o tom."},
      {heading: "Regras de cada plataforma", body: "Cada rede tem termos de utilização e regras de conteúdo comercial. Antes de publicares conteúdo patrocinado ou com links de afiliado, confirma como a plataforma pede que isso seja identificado (por exemplo, a etiqueta de parceria paga). Desrespeitar estas regras pode reduzir o alcance ou levar à suspensão da conta."},
    ],
  },
  {
    slug: "planeamento-editorial",
    season: 1,
    title: "Planeamento editorial",
    summary: "Um calendário simples que consegues manter: pilares, frequência e produção em lotes.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Pilares de conteúdo", body: "Os pilares são os três a cinco temas sobre os quais publicas com regularidade. Ajudam o público a perceber o que esperar de ti e ajudam-te a ter sempre ideias.\n\nExemplo para alguém que fala de organização pessoal: rotinas, ferramentas, erros comuns, histórias reais (com autorização) e perguntas da comunidade."},
      {heading: "Frequência realista", body: "Define uma frequência que consegues manter durante três meses, não durante uma semana. Duas publicações por semana durante três meses ensinam-te mais do que uma por dia durante dez dias.\n\nUsa o tempo que registaste na tua folha de partida para decidir. Se não tens a certeza, começa abaixo do que achas possível e sobe depois de quatro semanas cumpridas."},
      {heading: "Produzir em lotes", body: "Em vez de criar todos os dias, reserva um bloco por semana para preparar várias publicações: escrever os textos, gravar os vídeos, preparar as imagens. Noutro momento, revês e agendas.\n\nProduzir em lotes reduz o esforço de \"ter de criar agora\" e torna a qualidade mais consistente."},
      {heading: "Exercício: o teu calendário de duas semanas", body: "Cria uma tabela simples com quatro colunas: data, pilar, formato e mensagem principal. Preenche duas semanas com a frequência que escolheste, usando as três ideias do primeiro episódio.\n\nPartilha o calendário no espaço Dúvidas da Academy se quiseres feedback. No fim das duas semanas, marca o que publicaste, o que ficou por publicar e porquê. Esse registo é o ponto de partida do próximo calendário."},
    ],
  },
  {
    slug: "publicacao-e-metricas",
    season: 1,
    title: "Publicação e métricas",
    summary: "Publicar com método e ler os números certos para melhorar, sem obsessão.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Antes de publicar: a lista curta", body: "Antes de carregares em publicar, confirma: a mensagem está clara? O início prende a atenção? Tenho direito a usar todas as imagens, músicas e textos? Se é conteúdo comercial, está identificado? O apelo à ação é claro?\n\nCinco perguntas, um minuto. Evitam a maioria dos erros."},
      {heading: "As métricas que importam", body: "Alcance: quantas pessoas viram. Diz-te se o tema e o início funcionaram.\n\nInteração (gostos, comentários, partilhas, guardados): diz-te se o conteúdo teve valor. Guardados e partilhas costumam ser os sinais mais fortes.\n\nCliques e ações: diz-te se a pessoa fez o que propuseste.\n\nSeguidores ganhos ou perdidos: tendência ao longo do tempo, não de um dia."},
      {heading: "Ler os números sem obsessão", body: "Compara cada publicação com a tua própria média, não com a de outras pessoas. Olha para tendências de quatro semanas, não para o resultado de uma hora.\n\nUma vez por semana, escolhe a publicação que melhor correu e a que pior correu e pergunta: o que foi diferente? O tema, o início, o formato, a hora? Muda uma coisa de cada vez para perceberes o que funciona."},
      {heading: "Números que não deves comprar", body: "Seguidores, gostos ou visualizações comprados, grupos de troca de interações e bots de comentários são proibidos na GWD e violam as regras das plataformas. Distorcem as tuas métricas, afastam o público real e podem levar à suspensão da conta.\n\nNa GWD só contam resultados reais e verificáveis."},
    ],
  },
  {
    slug: "etica-e-direitos-no-conteudo",
    season: 1,
    title: "Ética e direitos no conteúdo",
    summary: "Direitos de autor, imagem de pessoas, publicidade identificada e verdade no que dizes.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Direitos de autor", body: "Imagens, músicas, vídeos e textos têm autor. Usar sem autorização pode levar à remoção do conteúdo, a bloqueios da conta e a problemas legais. Usa conteúdo teu, conteúdo com licença que permita o uso que vais fazer, ou bibliotecas oficiais das próprias plataformas.\n\n\"Encontrei no Google\" não é autorização."},
      {heading: "Imagem de pessoas", body: "Mostrar o rosto ou a voz de alguém exige autorização. Com crianças, exige autorização de quem tem a responsabilidade parental e muito cuidado. Em espaços públicos, evita que pessoas identificáveis sejam o centro do teu conteúdo sem saberem. Guarda as autorizações por escrito, mesmo que seja uma mensagem simples. Se alguém te pedir para retirar uma imagem, retira-a sem discussão."},
      {heading: "Publicidade identificada", body: "Quando recebes algo em troca de uma publicação (dinheiro, produto, comissão de afiliado), o teu público tem o direito de saber. Identifica de forma clara e visível, no início, com termos como \"publicidade\" ou \"parceria\" e com as ferramentas de parceria da própria plataforma.\n\nEsconder a relação comercial é enganar quem te segue, e é proibido pelas regras de proteção do consumidor em Portugal, no Brasil e na União Europeia."},
      {heading: "Verdade e responsabilidade", body: "Não afirmes o que não podes provar. Nada de promessas de resultados, rendimentos, curas ou transformações garantidas. Se partilhas a tua experiência, diz que é a tua experiência e não um resultado típico.\n\nQuando errares, corrige publicamente. A confiança do teu público é o teu ativo mais valioso."},
    ],
  },
  {
    slug: "verificacao-social-media",
    season: 1,
    title: "Verificação: Social Media",
    summary: "Quiz final do percurso Social Media.",
    type: "QUIZ",
    tier: "MEMBER",
    seconds: 300,
    sections: [
      {heading: "Antes do quiz", body: "Esta verificação tem cinco perguntas, uma por episódio do percurso: público e mensagem, plataformas e formatos, planeamento, métricas e ética.\n\nPrecisas de 80 % (quatro respostas certas) para seres aprovado. Se não passares à primeira, revê os episódios e tenta de novo. A aprovação conclui o percurso Social Media e conta para o teu progresso."},
    ],
    quiz: [
      {id: "q1", prompt: "Qual é a melhor descrição de público para planear conteúdo?", options: ["Toda a gente que usa redes sociais", "Mães que trabalham por conta própria e querem organizar melhor a semana", "Pessoas que gostam de conteúdo"], correctIndex: 1},
      {id: "q2", prompt: "Estás a começar. Qual é a abordagem mais sustentável?", options: ["Publicar em todas as redes todos os dias", "Escolher uma plataforma principal e uma frequência que consegues manter durante meses", "Publicar só quando tiveres inspiração"], correctIndex: 1},
      {id: "q3", prompt: "Que sinais costumam indicar maior valor de uma publicação?", options: ["Guardados e partilhas", "Só o número de gostos na primeira hora", "O número de hashtags usadas"], correctIndex: 0},
      {id: "q4", prompt: "Recebeste um produto para falar dele. O que fazes?", options: ["Falas dele como se o tivesses comprado", "Identificas claramente a parceria, no início, com as ferramentas da plataforma", "Mencionas a parceria só se alguém perguntar"], correctIndex: 1},
      {id: "q5", prompt: "Um serviço oferece 1000 seguidores por 10 €. O que fazes?", options: ["Compras, para ganhar credibilidade", "Recusas: números comprados são proibidos e distorcem as métricas", "Compras só uma vez"], correctIndex: 1},
    ],
  },
];

export const socialMediaEpisodes = buildReaderEpisodes("social-media", seeds);
