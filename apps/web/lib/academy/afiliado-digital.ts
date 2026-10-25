/* Percurso C — Afiliado Digital: funcionamento, seleção de produtos, links e atribuição, comunicação,
   transparência e conformidade, campanha prática. Sem percentagens, valores ou prazos inventados: as condições
   de cada oferta são as publicadas na própria oferta (catálogo Novidades.Store) e a venda só é confirmada pelo
   sistema de pagamentos. */

import {buildReaderEpisodes, type ReaderEpisodeSeed} from "./reader-series";

const seeds: ReaderEpisodeSeed[] = [
  {
    slug: "como-funciona-a-afiliacao",
    season: 1,
    title: "Como funciona a afiliação",
    summary: "Quem faz o quê numa venda por afiliação, e quando uma comissão passa a existir.",
    type: "READER",
    tier: "FREE",
    seconds: 600,
    sections: [
      {heading: "Os três papéis", body: "Numa venda por afiliação há três partes. O produtor ou loja (aqui, a Novidades.Store) cria o produto, define o preço e trata da venda, do pagamento e da entrega. O afiliado recomenda a oferta ao seu público com um link pessoal. O cliente compra diretamente na loja, ao preço da loja.\n\nO afiliado não cobra, não recebe pagamentos de clientes e não altera preços."},
      {heading: "O ciclo de uma comissão", body: "1. Recomendas uma oferta aprovada com o teu link.\n2. Uma pessoa clica e compra na loja.\n3. O sistema de pagamentos confirma (ou não) o pagamento.\n4. A venda fica atribuída a ti e a comissão fica pendente.\n5. Depois do prazo de garantia ou de devolução da oferta, a comissão pode ser confirmada. Se houver devolução, reembolso ou fraude, é revertida.\n\nUm clique não é uma venda, e uma venda não confirmada não é uma comissão."},
      {heading: "As condições estão sempre na oferta", body: "Cada oferta tem as suas condições: se está aberta a afiliados, o valor ou a percentagem da comissão, o prazo de confirmação e as regras de divulgação. Essas condições são as publicadas na oferta, na área Produtos e Ofertas da app.\n\nSe uma oferta não indica condições de afiliação, não está disponível para afiliados. Ninguém está autorizado a prometer-te outras condições."},
      {heading: "Como se entra na afiliação GWD", body: "A afiliação na GWD começa por uma candidatura na Área do Afiliado. A equipa analisa a candidatura e, se for aprovada, aceitas os termos de afiliado e passas a poder gerar links para ofertas elegíveis.\n\nOs pontos (XP) não aprovam ninguém automaticamente. Concluir este percurso mostra que conheces as regras, e isso conta na análise."},
    ],
  },
  {
    slug: "selecionar-produtos",
    season: 1,
    title: "Como selecionar produtos",
    summary: "Recomenda só o que conheces e o que serve mesmo ao teu público.",
    type: "READER",
    tier: "MEMBER",
    seconds: 540,
    sections: [
      {heading: "Começa pelo público, não pela comissão", body: "A pergunta certa não é \"o que paga mais?\" mas \"o que ajudaria mesmo a pessoa que me segue?\". Uma recomendação que não serve o público gera poucas vendas, mais devoluções e menos confiança.\n\nVolta à descrição do teu público (percurso Social Media) e lista os problemas que essa pessoa quer resolver."},
      {heading: "Critérios para escolher uma oferta", body: "Para cada oferta candidata, verifica:\n\n1. Resolve um problema real do teu público?\n2. Conheces o produto o suficiente para o explicar com honestidade?\n3. A descrição oficial é clara sobre o que inclui e o que não inclui?\n4. As condições de afiliação estão publicadas na oferta?\n5. A oferta está disponível no mercado do teu público (Brasil, Europa)?\n\nSe a resposta a alguma for \"não\", procura outra oferta."},
      {heading: "Conhecer antes de recomendar", body: "Lê a descrição oficial completa, as perguntas frequentes e as condições de garantia ou devolução. Sempre que possível, experimenta o produto ou estuda o conteúdo antes de o recomendar.\n\nNunca inventes funcionalidades, resultados ou bónus que a oferta não tem. Se o produto não for o que esperavas, não o recomendes, mesmo que as condições de afiliação sejam boas."},
      {heading: "O que nunca recomendar", body: "Na GWD não se divulgam ofertas sem direitos de comercialização, credenciais ou contas de terceiros, seguidores ou interações artificiais, nem produtos com promessas de rendimento, cura ou resultado garantido. Se encontrares uma oferta assim em qualquer lado, não a promovas e avisa a equipa. Na dúvida sobre uma oferta, pergunta primeiro à equipa."},
    ],
  },
  {
    slug: "links-e-atribuicao",
    season: 1,
    title: "Links e atribuição",
    summary: "O que é o teu link, o que regista, e porque não deves alterá-lo.",
    type: "READER",
    tier: "MEMBER",
    seconds: 540,
    sections: [
      {heading: "O teu link é pessoal", body: "Depois de aprovado, geras um link para cada oferta elegível. O link identifica-te como quem recomendou a oferta e leva a pessoa à página oficial da oferta na Novidades.Store.\n\nO link é pessoal e intransmissível. Não o partilhes para outras pessoas usarem em teu nome."},
      {heading: "Parâmetros de campanha (UTM)", body: "Podes acrescentar ao link uma identificação de campanha, por exemplo \"instagram-outubro\". Isso não muda a atribuição; serve para saberes que canal ou publicação trouxe cada clique.\n\nUsa nomes simples, sem dados pessoais: nunca coloques nomes, emails ou telefones de pessoas no link. Mantém uma lista simples dos nomes que usas, para leres os resultados sem confusão."},
      {heading: "Como é feita a atribuição", body: "A atribuição é registada pelo servidor quando alguém chega pelo teu link e é confirmada quando a compra é aprovada pelo sistema de pagamentos. A regra de atribuição (por exemplo, o que acontece se a mesma pessoa clicar em links de dois afiliados) é a publicada nos termos de afiliado.\n\nNão tentes contornar a atribuição: encurtadores que escondem o destino, cliques forçados ou compras em nome de outras pessoas são fraude e levam à suspensão."},
      {heading: "Cliques e conversões verificados", body: "Na Área do Afiliado vês os cliques registados e as vendas atribuídas, com o estado real de cada uma: pendente, confirmada ou revertida. Os números vêm dos registos do servidor e do sistema de pagamentos, não de estimativas.\n\nSe algo não bater certo, fala com a equipa em vez de tirar conclusões a partir de outras ferramentas."},
    ],
  },
  {
    slug: "comunicacao-e-divulgacao",
    season: 1,
    title: "Comunicação e divulgação",
    summary: "Recomendar com utilidade: contexto, prova honesta e um convite claro.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "A estrutura de uma boa recomendação", body: "1. O problema: em que situação está a pessoa que te ouve.\n2. A tua experiência: o que usaste ou estudaste, e o que aprendeste.\n3. A oferta: o que inclui e para quem é (e para quem não é).\n4. O convite: onde saber mais, com o teu link e a identificação da parceria.\n\nDizer para quem a oferta não serve aumenta a confiança e reduz devoluções."},
      {heading: "Canais e consentimento", body: "Divulga nos teus canais: perfil, stories, newsletter de quem se inscreveu, grupos que geres com consentimento dos membros. Não envies links em mensagens privadas não solicitadas, não adiciones pessoas a grupos sem autorização e não publiques links em grupos de outras pessoas sem permissão de quem os gere.\n\nSpam prejudica a tua reputação e a da GWD, e pode levar à suspensão."},
      {heading: "Materiais oficiais", body: "Usa os materiais de divulgação disponibilizados para cada oferta (imagens, textos de apoio, orientações). Foram verificados quanto a direitos e afirmações. Se criares materiais teus, mantém-te fiel à descrição oficial da oferta.\n\nNão uses logótipos, fotografias de produto ou nomes de marca em anúncios pagos sem autorização expressa. Se tiveres dúvidas sobre um material, pergunta à equipa antes de publicar."},
      {heading: "Responder a perguntas", body: "Quando alguém te pergunta sobre a oferta, responde com o que sabes e remete para a página oficial para condições, preços e garantias. Se não sabes, diz que não sabes e procura a resposta. Nunca prometas descontos, bónus ou condições que a oferta não tem."},
    ],
  },
  {
    slug: "transparencia-e-conformidade",
    season: 1,
    title: "Regras de transparência e conformidade",
    summary: "Identificar a relação comercial, proteger dados e respeitar a lei do consumidor.",
    type: "READER",
    tier: "MEMBER",
    seconds: 600,
    sections: [
      {heading: "Identifica sempre a relação comercial", body: "Sempre que publicas um link de afiliado, diz de forma clara e visível que podes receber uma comissão. Por exemplo: \"Publicidade: recebo uma comissão se comprares através deste link, sem custo extra para ti.\"\n\nA identificação vem antes do link, não escondida no fim ou numa lista de hashtags. Em Portugal, no Brasil e na União Europeia, a publicidade oculta é proibida pelas regras de proteção do consumidor."},
      {heading: "Nada de promessas", body: "Não prometas resultados, rendimentos, curas, aprovações ou transformações. Não uses \"garantido\", \"sem esforço\" ou \"enriquece rápido\". Não uses capturas de ganhos, nem tuas nem de outras pessoas.\n\nSe partilhas a tua experiência, apresenta-a como experiência pessoal e não como resultado típico. Fala do que a oferta é e do que inclui, não do que alguém vai ganhar com ela."},
      {heading: "Dados de quem te contacta", body: "Os contactos e conversas de quem te pergunta sobre uma oferta são dados pessoais. Não os partilhes, não os vendas e não os uses para outros fins sem consentimento. Pedidos de compra, pagamento e apoio pós-venda são tratados pela loja: encaminha a pessoa para os canais oficiais."},
      {heading: "O que leva à suspensão", body: "Publicidade não identificada, promessas de rendimento, spam, uso de marcas ou anúncios em nome da Novidades.Store ou da GWD sem autorização, autocompras para gerar comissão e qualquer tentativa de manipular a atribuição levam à suspensão da afiliação e à reversão das comissões afetadas. Em caso de dúvida sobre uma prática, pergunta antes de a usar."},
    ],
  },
  {
    slug: "campanha-pratica",
    season: 1,
    title: "Campanha prática",
    summary: "Planeia a tua primeira campanha de afiliado, do objetivo à revisão.",
    type: "READER",
    tier: "MEMBER",
    seconds: 720,
    sections: [
      {heading: "1. Objetivo e oferta", body: "Escolhe uma única oferta elegível na área Produtos e Ofertas, usando os critérios do episódio 2. Define um objetivo de aprendizagem para a campanha, por exemplo: \"testar dois formatos durante duas semanas e perceber qual gera mais cliques\".\n\nO objetivo mede o que aprendes, não quanto ganhas."},
      {heading: "2. Mensagem e materiais", body: "Escreve a recomendação com a estrutura do episódio 4: problema, experiência, oferta, convite. Inclui a identificação da parceria antes do link. Usa os materiais oficiais da oferta ou cria os teus, fiéis à descrição oficial. Pede a uma pessoa de confiança que leia o texto e te diga se ficou claro o que é a oferta, para quem é e que tens uma relação comercial com ela. Se houver dúvidas, reescreve."},
      {heading: "3. Link com identificação de campanha", body: "Na Área do Afiliado, gera o teu link para a oferta e acrescenta uma identificação de campanha por canal, por exemplo \"stories-semana1\" e \"carrossel-semana1\". Assim sabes que formato trouxe cada clique. Antes de publicares, abre o link num separador privado e confirma que leva à página oficial da oferta. Nunca uses encurtadores que escondam o destino."},
      {heading: "4. Publicar, medir e rever", body: "Publica segundo o teu calendário. Ao fim de uma semana, abre a Área do Afiliado e compara cliques por campanha. No fim das duas semanas, escreve três linhas: o que funcionou, o que não funcionou e o que mudas na próxima campanha.\n\nPartilha a revisão (sem dados de terceiros) no espaço Dúvidas da Academy. A aprendizagem de cada campanha ajuda toda a comunidade."},
    ],
  },
  {
    slug: "verificacao-afiliado",
    season: 1,
    title: "Verificação: Afiliado Digital",
    summary: "Quiz final do percurso Afiliado Digital.",
    type: "QUIZ",
    tier: "MEMBER",
    seconds: 360,
    sections: [
      {heading: "Antes do quiz", body: "Esta verificação tem seis perguntas sobre o percurso: papéis numa venda por afiliação, ciclo da comissão, condições das ofertas, identificação da parceria, reversões e boas práticas com links.\n\nPrecisas de 80 % (cinco respostas certas) para seres aprovado. A aprovação conclui o percurso e fica visível para a equipa quando analisa a tua candidatura a afiliado."},
    ],
    quiz: [
      {id: "q1", prompt: "Quem define o preço de uma oferta?", options: ["O afiliado, conforme o público", "A loja (Novidades.Store), que trata da venda e do pagamento", "O cliente"], correctIndex: 1},
      {id: "q2", prompt: "Quando é que uma comissão pode ser confirmada?", options: ["Logo após o clique no link", "Depois de o pagamento ser aprovado e de passar o prazo de garantia ou devolução da oferta", "Quando o afiliado pede"], correctIndex: 1},
      {id: "q3", prompt: "Onde estão as condições de afiliação de uma oferta?", options: ["Na própria oferta, na área Produtos e Ofertas", "No que outro afiliado te disser", "Não existem condições"], correctIndex: 0},
      {id: "q4", prompt: "Qual destas é uma identificação correta de parceria?", options: ["#ad no fim de trinta hashtags", "\"Publicidade: recebo uma comissão se comprares através deste link\", antes do link", "Não é preciso identificar se o produto for bom"], correctIndex: 1},
      {id: "q5", prompt: "O que acontece a uma comissão se o cliente devolver o produto dentro do prazo?", options: ["Mantém-se", "É revertida", "Duplica"], correctIndex: 1},
      {id: "q6", prompt: "Qual destas ações é permitida?", options: ["Comprar pelo teu próprio link para gerar comissão", "Acrescentar uma identificação de campanha (UTM) ao teu link", "Enviar o link em mensagens privadas a contactos que não pediram"], correctIndex: 1},
    ],
  },
];

export const afiliadoDigitalEpisodes = buildReaderEpisodes("afiliado-digital", seeds);
