/* Percurso A — Fundamentos do Digital (com o GWD Start): cultura e regras da comunidade, escolha de objetivos.
   Referência editorial: Elisa Duarte (formação). Sem promessas de rendimento; regras iguais às aceites no feed. */

import {buildReaderEpisodes, type ReaderEpisodeSeed} from "./reader-series";

const seeds: ReaderEpisodeSeed[] = [
  {
    slug: "cultura-da-comunidade",
    season: 1,
    title: "Cultura e regras da comunidade GWD",
    summary: "Como a comunidade funciona, o que esperamos de cada pessoa e como a moderação te protege.",
    type: "READER",
    tier: "FREE",
    seconds: 540,
    sections: [
      {heading: "Uma comunidade para aprender em conjunto", body: "A comunidade GWD existe para que ninguém aprenda o digital sozinho. Aqui fazes perguntas, partilhas o que estás a construir e ajudas quem está um passo atrás de ti.\n\nA cultura assenta em três ideias simples: respeito pelas pessoas, honestidade no que se diz e generosidade no que se partilha. Não há perguntas parvas, mas há perguntas melhores: as que mostram o que já tentaste e onde ficaste preso.\n\nNa prática, isto significa apresentar-te quando chegas, agradecer a quem te ajuda e devolver essa ajuda quando já sabes responder. Uma resposta curta e útil a quem está a começar vale tanto como uma publicação longa."},
      {heading: "As regras que aceitas para participar", body: "Antes de publicares no feed aceitas as regras de participação. São poucas e claras:\n\n1. Respeita a privacidade: não publiques dados de outras pessoas (nomes completos, contactos, moradas, conversas privadas).\n2. Não faças promessas de rendimento, nem em publicações nem em respostas.\n3. Evita spam: nada de mensagens repetidas, links em massa ou pedidos de contacto não solicitados.\n4. Usa apenas materiais e canais oficiais. Os convites oficiais estão na página Canais oficiais e na Comunidade da app.\n\nEstas regras valem também nos grupos de WhatsApp, Telegram e Discord da GWD."},
      {heading: "Como funciona a moderação", body: "Se vires uma publicação que quebra as regras, usa a opção de denúncia. A equipa analisa cada caso e pode ocultar o conteúdo. Ninguém pode apagar publicações de outros membros: a moderação é feita pela equipa, para que as decisões sejam consistentes e justas.\n\nUma denúncia não é um castigo automático. É um pedido de análise. Por isso, denuncia o que quebra regras, não o que simplesmente não te agrada; nesses casos, uma resposta educada costuma ser o melhor caminho."},
      {heading: "Pessoas e papéis na equipa digital", body: "Vais encontrar referências à equipa digital GWD. A Maia Valente acolhe e orienta a comunidade, e tem um contacto pessoal por WhatsApp para dúvidas sobre o teu percurso. A Elisa Duarte é a referência de formação e conteúdos da Academy. O Tomás Rocha acompanha a pesquisa de mercado e a Diana Matos a estratégia de produto.\n\nQuando uma função ainda não está ativa na plataforma, como o assistente de IA, dizemo-lo com clareza. Nenhuma resposta automática se faz passar por uma pessoa."},
    ],
  },
  {
    slug: "escolher-objetivos",
    season: 1,
    title: "Escolher objetivos que consegues cumprir",
    summary: "Transforma a tua folha de partida num objetivo de 30 dias e num percurso da Academy.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Do ponto de partida ao objetivo", body: "No GWD Start criaste a tua folha de partida: competências, tempo, mercado e um primeiro objetivo. Agora vais transformá-la num objetivo de 30 dias.\n\nUm objetivo de 30 dias responde a três perguntas: o que vais aprender, o que vais praticar e o que vais mostrar no fim. Por exemplo: \"aprender os fundamentos de conteúdo, publicar duas vezes por semana sobre um tema que conheço e partilhar na comunidade o que funcionou\".\n\nTrinta dias é tempo suficiente para veres resultados de aprendizagem e curto o bastante para não perderes o foco. Se o objetivo te parecer grande demais, corta-o ao meio: é melhor cumprir um objetivo pequeno do que abandonar um grande."},
      {heading: "Escolher o percurso da Academy", body: "A Academy tem percursos para cada caminho. Fundamentos do Digital é a base comum. Social Media ensina a criar e planear conteúdo. Afiliado Digital explica como recomendar ofertas com atribuição e transparência. Revendedor Autorizado prepara quem quer operar vendas com regras comerciais próprias.\n\nEscolhe um percurso de cada vez. Se ainda não sabes qual, começa por Social Media: comunicar bem é útil em todos os caminhos.\n\nConcluir um percurso não ativa nenhum papel comercial. Mostra que conheces a matéria e as regras, e isso é tido em conta quando a equipa analisa uma candidatura a afiliado ou a revendedor autorizado."},
      {heading: "Objetivos de aprendizagem, não de rendimento", body: "Nesta fase, os teus objetivos devem medir o que aprendes e o que praticas, não quanto ganhas. O rendimento num caminho comercial depende de aprovação, de ofertas publicadas, de regras próprias e do teu trabalho ao longo do tempo; não é algo que controles nos primeiros 30 dias.\n\nBons indicadores: episódios concluídos, quizzes aprovados, publicações feitas, feedback recebido na comunidade, uma candidatura submetida com tudo o que é pedido."},
      {heading: "Exercício: o teu plano de 30 dias", body: "Escreve, numa nota:\n\n1. O percurso que escolhes.\n2. O teu objetivo de 30 dias, com as três partes (aprender, praticar, mostrar).\n3. Os dias e a hora do teu bloco de estudo.\n4. A data em que vais rever o plano (dia 15).\n\nPartilha o objetivo no espaço Apresentações da comunidade. A Maia e outros membros podem ajudar-te a afiná-lo.\n\nNo dia 15, relê o plano com honestidade. Se estás adiantado, acrescenta uma prática. Se estás atrasado, reduz o objetivo em vez de desistir. O plano serve-te a ti, não o contrário."},
    ],
  },
  {
    slug: "verificacao-cultura-objetivos",
    season: 1,
    title: "Verificação: comunidade e objetivos",
    summary: "Quiz curto sobre as regras da comunidade e a escolha de objetivos.",
    type: "QUIZ",
    tier: "MEMBER",
    seconds: 240,
    sections: [
      {heading: "Antes do quiz", body: "Esta verificação tem quatro perguntas sobre os dois episódios desta série: as regras da comunidade, a moderação, os canais oficiais e a escolha de objetivos de 30 dias.\n\nPrecisas de 80 % para seres aprovado, ou seja, pelo menos três respostas certas em quatro. Se não passares à primeira, revê os episódios e tenta de novo; só a aprovação conta para o teu progresso. As respostas certas nunca são mostradas no browser. Lê cada pergunta até ao fim antes de escolheres."},
    ],
    quiz: [
      {id: "q1", prompt: "Encontras uma publicação com o contacto pessoal de outra pessoa. O que fazes?", options: ["Copias o contacto para falar com ela", "Denuncias a publicação para a equipa analisar", "Apagas a publicação"], correctIndex: 1},
      {id: "q2", prompt: "Qual destes é um bom objetivo de 30 dias?", options: ["Ganhar 500 € no primeiro mês", "Concluir o percurso Social Media e publicar duas vezes por semana sobre um tema que conheço", "Ter muitos seguidores"], correctIndex: 1},
      {id: "q3", prompt: "Onde encontras os convites oficiais dos grupos GWD?", options: ["Em mensagens privadas de outros membros", "Na página Canais oficiais e na Comunidade da app", "Em qualquer grupo com o nome GWD"], correctIndex: 1},
      {id: "q4", prompt: "O assistente de IA ainda não está ativo. Como é apresentado na plataforma?", options: ["Como \"Em preparação\", sem respostas automáticas a fazer-se passar por pessoas", "Como ativo, para não desmotivar", "Não é mencionado"], correctIndex: 0},
    ],
  },
];

export const comunidadeObjetivosEpisodes = buildReaderEpisodes("comunidade-e-objetivos", seeds);
