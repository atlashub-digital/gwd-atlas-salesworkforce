/* Percurso D — Revendedor Autorizado: diferenças face à afiliação, regras comerciais e preços, atendimento,
   processo de venda, suporte/devoluções/responsabilidade. Sem margens, preços mínimos ou limites inventados:
   as regras comerciais de cada oferta são as publicadas e aprovadas; pagamentos só pelo checkout oficial. */

import {buildReaderEpisodes, type ReaderEpisodeSeed} from "./reader-series";

const seeds: ReaderEpisodeSeed[] = [
  {
    slug: "revenda-vs-afiliacao",
    season: 1,
    title: "Diferenças face à afiliação",
    summary: "O revendedor autorizado opera vendas com regras próprias; o afiliado recomenda.",
    type: "READER",
    tier: "FREE",
    seconds: 540,
    sections: [
      {heading: "Dois papéis, responsabilidades diferentes", body: "O afiliado recomenda uma oferta e a loja trata de tudo o resto. É remunerado por comissão sobre vendas confirmadas.\n\nO revendedor autorizado vai mais longe: acompanha o cliente antes, durante e depois da compra, dentro de regras comerciais aprovadas para a sua operação. É remunerado por margem, sujeita às regras de preço definidas para cada oferta."},
      {heading: "O estatuto é concedido, não escolhido", body: "Ninguém se torna revendedor autorizado por interesse, por pontos ou por ter concluído este percurso. O estatuto é concedido pela equipa depois de uma candidatura analisada, com aceitação de termos próprios e das regras comerciais de cada oferta.\n\nAté essa aprovação, ninguém está autorizado a vender em nome da GWD ou da Novidades.Store."},
      {heading: "O que nunca muda", body: "O checkout é sempre o oficial. O revendedor não recebe pagamentos de clientes em contas pessoais, não cria checkouts paralelos e não altera preços fora das regras aprovadas. Os direitos de acesso a conteúdos e a garantia ao cliente vêm do sistema oficial de pagamentos.\n\nEsta regra protege o cliente, protege o revendedor e garante que cada venda é registada e atribuída corretamente."},
      {heading: "Para quem é este caminho", body: "A revenda autorizada é para quem quer gerir uma relação contínua com clientes: responder a dúvidas, acompanhar a decisão, ajudar no pós-venda. Exige disponibilidade, organização e conhecimento profundo das ofertas.\n\nSe preferes recomendar sem acompanhar clientes, a afiliação é o caminho mais adequado. Não há pressa: podes começar pela afiliação e candidatar-te mais tarde."},
    ],
  },
  {
    slug: "regras-comerciais-e-precos",
    season: 1,
    title: "Regras comerciais e preços",
    summary: "Preço, margem e condições: o que podes e o que não podes decidir.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Quem define as regras de preço", body: "O preço de cada oferta e as regras para a revenda (preço de referência, eventuais limites e a margem do revendedor) são definidos para cada oferta e publicados antes de a poderes vender. Não existem regras \"por defeito\" nem condições combinadas informalmente.\n\nSe uma oferta não tem regras de revenda publicadas, não está disponível para revenda."},
      {heading: "Margem não é preço livre", body: "A margem é a parte do valor da venda que te cabe segundo as regras da oferta. Não podes aumentar o preço para ganhar mais, nem baixá-lo para vender mais depressa, fora das regras aprovadas. Descontos e promoções só existem quando são oficiais.\n\nPreços consistentes protegem os clientes e os outros revendedores."},
      {heading: "Quando a margem passa a existir", body: "Como na afiliação, a margem só fica confirmada depois de o pagamento ser aprovado pelo sistema oficial e de passar o prazo de garantia ou devolução da oferta. Devoluções, reembolsos e fraudes revertem a margem correspondente.\n\nNa área Resultados e Comissões vês o estado real de cada venda: pendente, confirmada ou revertida."},
      {heading: "Obrigações legais", body: "Dependendo do teu país e da tua situação, a atividade de revenda pode exigir registo de atividade, emissão de faturas ou recibos e declaração de rendimentos. Informa-te junto de um contabilista ou das autoridades fiscais do teu país antes de começares. A GWD não presta aconselhamento fiscal."},
    ],
  },
  {
    slug: "atendimento-e-relacionamento",
    season: 1,
    title: "Atendimento e relacionamento",
    summary: "Ouvir antes de propor, responder com rigor e manter a relação depois da venda.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Ouvir primeiro", body: "Um bom atendimento começa com perguntas: o que a pessoa procura, o que já experimentou, que dúvidas tem. Só depois propões uma oferta, e só se ela servir mesmo.\n\nRecomendar a oferta errada para fechar uma venda gera devoluções e destrói a confiança. Se nenhuma oferta servir, diz isso com clareza."},
      {heading: "Responder com rigor", body: "Responde com base na descrição oficial da oferta. Se não sabes, diz que vais confirmar e volta com a resposta. Nunca inventes funcionalidades, prazos, garantias ou bónus.\n\nRegista as perguntas que se repetem: são o melhor material para melhorares a forma como apresentas cada oferta."},
      {heading: "Tempo e tom", body: "Define e comunica quando estás disponível para responder. Responde com educação, mesmo a pessoas que decidem não comprar. Uma pessoa bem atendida que hoje não compra pode voltar ou recomendar-te a outra. Se não puderes responder logo, envia uma mensagem curta a dizer quando vais responder. A previsibilidade transmite profissionalismo e evita que o cliente procure respostas em fontes pouco fiáveis."},
      {heading: "Dados dos clientes", body: "Nomes, contactos e conversas de clientes são dados pessoais. Guarda-os com segurança, usa-os apenas para o atendimento que a pessoa pediu e não os partilhes. Não envies mensagens de marketing a quem não deu consentimento para as receber. Quando uma conversa termina e já não precisas dos dados, apaga-os. Nunca guardes dados de pagamento, palavras-passe ou documentos de identificação de clientes."},
    ],
  },
  {
    slug: "processo-de-venda",
    season: 1,
    title: "Processo de venda",
    summary: "Da primeira conversa ao pagamento no checkout oficial, sem pressão.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "As etapas", body: "1. Contacto: alguém mostra interesse, por um conteúdo teu ou uma recomendação.\n2. Diagnóstico: perguntas para perceber a necessidade.\n3. Proposta: a oferta adequada, com o que inclui e o que não inclui.\n4. Dúvidas: respostas com base na informação oficial.\n5. Decisão: a pessoa compra pelo checkout oficial, através do teu link de revendedor.\n6. Pós-venda: confirmas que correu bem e ficas disponível para dúvidas."},
      {heading: "Sem pressão nem urgência falsa", body: "Não uses urgência inventada (\"só hoje\", \"últimas vagas\") se não for verdade e oficial. Não insistas depois de um \"não\". Uma decisão tomada sob pressão é a que mais facilmente acaba em devolução. Dá tempo à pessoa para pensar e ficar com a informação oficial. Se ela decidir comprar mais tarde, o teu link continua a identificar-te como quem a acompanhou, segundo as regras de atribuição publicadas."},
      {heading: "O pagamento é sempre no checkout oficial", body: "A compra é feita pelo cliente, no checkout oficial, com o teu link de revendedor. Nunca recebas transferências, PIX ou dinheiro em mão para \"comprar em nome\" do cliente. Nunca peças dados de cartão ou palavras-passe.\n\nSe alguém te pedir para pagar de outra forma, explica que a compra só pode ser feita no checkout oficial, para proteção dele."},
      {heading: "Registar e aprender", body: "Depois de cada conversa, anota (sem dados sensíveis) a etapa onde ficou e porquê. Ao fim de um mês percebes onde perdes mais pessoas e o que precisas de melhorar: o conteúdo que atrai, o diagnóstico ou a forma como respondes às dúvidas. Partilha as lições, sem dados de clientes, com outros revendedores."},
    ],
  },
  {
    slug: "suporte-devolucoes-responsabilidade",
    season: 1,
    title: "Suporte, devoluções e responsabilidade",
    summary: "Direitos do consumidor, pedidos de apoio e o que acontece quando uma venda é revertida.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Direitos do consumidor", body: "Nas compras à distância, a lei dá ao consumidor o direito de desistir dentro de um prazo: em regra 14 dias na União Europeia e 7 dias no Brasil, com regras próprias para conteúdos digitais. Cada oferta indica a sua política de garantia e devolução, que nunca pode ser inferior ao que a lei impõe.\n\nNunca digas a um cliente que não tem direito a devolução sem confirmares a política oficial da oferta."},
      {heading: "Encaminhar pedidos de apoio", body: "Problemas de acesso, pagamento, faturação ou devolução são tratados pela loja, pelos canais oficiais de apoio. O teu papel é ajudar o cliente a chegar lá, com a informação certa, e acompanhar até ficar resolvido.\n\nNão prometas soluções que não dependem de ti. Regista o pedido e a data em que encaminhaste."},
      {heading: "Quando uma venda é revertida", body: "Se uma venda for devolvida, reembolsada ou contestada, a margem ou comissão correspondente é revertida. O histórico fica visível em Resultados e Comissões. Reversões frequentes numa oferta são um sinal para rever como a apresentas e a quem. Uma reversão não é um castigo: é a aplicação das regras ao que aconteceu. Se achares que uma reversão está errada, fala com a equipa com os dados da venda."},
      {heading: "A tua responsabilidade", body: "Como revendedor autorizado representas a oferta perante o cliente. És responsável pela verdade do que dizes, pelo respeito pelos dados de quem te contacta e pelo cumprimento das regras comerciais. O incumprimento leva à suspensão do estatuto e à reversão das margens afetadas. Na dúvida sobre o que podes dizer ou fazer, pergunta antes."},
    ],
  },
  {
    slug: "verificacao-revendedor",
    season: 1,
    title: "Verificação: Revendedor Autorizado",
    summary: "Quiz final do percurso Revendedor Autorizado.",
    type: "QUIZ",
    tier: "MEMBER",
    seconds: 300,
    sections: [
      {heading: "Antes do quiz", body: "Esta verificação tem cinco perguntas sobre o percurso: estatuto, checkout oficial, regras de preço, devoluções e comunicação honesta.\n\nPrecisas de 80 % (quatro respostas certas) para seres aprovado. A aprovação conclui o percurso, mas não concede o estatuto de revendedor autorizado: esse depende de candidatura, aprovação da equipa e aceitação dos termos."},
    ],
    quiz: [
      {id: "q1", prompt: "Concluíste este percurso com o quiz aprovado. Já podes vender como revendedor autorizado?", options: ["Sim, automaticamente", "Não: o estatuto depende de candidatura, aprovação e aceitação dos termos", "Sim, se tiveres mais de 300 pontos"], correctIndex: 1},
      {id: "q2", prompt: "Um cliente quer pagar-te por PIX para comprares em nome dele. O que fazes?", options: ["Aceitas, para fechar a venda", "Explicas que a compra só pode ser feita por ele no checkout oficial, com o teu link", "Pedes os dados do cartão dele"], correctIndex: 1},
      {id: "q3", prompt: "Podes aumentar o preço de uma oferta para ter mais margem?", options: ["Sim, o revendedor define o preço", "Não: preço e margem seguem as regras publicadas para a oferta", "Só no Brasil"], correctIndex: 1},
      {id: "q4", prompt: "Um cliente pede para devolver um produto. O que fazes primeiro?", options: ["Dizes que não há devoluções", "Confirmas a política oficial da oferta e encaminhas para o apoio oficial", "Ignoras o pedido"], correctIndex: 1},
      {id: "q5", prompt: "Qual destas frases é aceitável?", options: ["\"Só hoje, últimas vagas\" (sem ser oficial)", "\"Esta oferta inclui X e não inclui Y; vê as condições na página oficial\"", "\"Resultado garantido em 7 dias\""], correctIndex: 1},
    ],
  },
];

export const revendedorAutorizadoEpisodes = buildReaderEpisodes("revendedor-autorizado", seeds);
