/** GWD partner programme (affiliate / authorized seller): terms the member accepts after approval.
 *  No percentages, margins or limits here: commercial conditions live on each offer programme, entered by an operator
 *  only after the direction confirms them. Version = date; a new version requires a new acceptance. */
export type PartnerKind = "AFFILIATE" | "AUTHORIZED_SELLER";
export const partnerTermsVersion = "2026-10-25";
export const partnerTerms: Record<PartnerKind, {title: string; clauses: string[]}> = {
  AFFILIATE: {
    title: "Termos de afiliado GWD — versão piloto",
    clauses: [
      "Recomendo apenas ofertas com programa de afiliação ativo, com as condições publicadas na própria oferta.",
      "A loja (Novidades.Store) define o preço e trata da venda, do pagamento, da entrega e do apoio ao cliente. Não recebo pagamentos de clientes.",
      "Identifico sempre a relação comercial de forma clara e visível, antes do link (por exemplo: \"Publicidade: recebo uma comissão se comprares através deste link\").",
      "Não faço promessas de rendimento, resultado, cura ou aprovação, nem uso capturas de ganhos.",
      "Não envio spam, não adiciono pessoas a grupos sem consentimento e não uso marcas da GWD ou da Novidades.Store em anúncios pagos sem autorização.",
      "Uma comissão só existe depois de a venda ser aprovada pelo sistema de pagamentos e conciliada; fica pendente até ao fim do prazo de garantia ou devolução da oferta e é revertida em caso de devolução, reembolso, contestação ou fraude.",
      "Não compro pelo meu próprio link, não manipulo cliques nem a atribuição. O incumprimento leva à suspensão e à reversão das comissões afetadas.",
      "Nesta fase piloto não existem pagamentos de comissões: o histórico mostra estados reais, e a liquidação depende de homologação económica própria.",
    ],
  },
  AUTHORIZED_SELLER: {
    title: "Termos de revendedor autorizado GWD — versão piloto",
    clauses: [
      "Vendo apenas ofertas com regras de revenda publicadas e aprovadas, sem alterar preços fora dessas regras.",
      "Todas as compras são feitas pelo cliente no checkout oficial. Não recebo pagamentos de clientes em contas pessoais nem crio checkouts paralelos.",
      "Informo o cliente com base na descrição oficial e encaminho apoio, devoluções e faturação para os canais oficiais.",
      "Trato os dados dos clientes apenas para o atendimento pedido, com segurança, e não os partilho.",
      "A margem só existe depois de a venda ser aprovada e conciliada, e é revertida em caso de devolução, reembolso, contestação ou fraude.",
      "Nesta fase piloto a revenda não está operacional: a aprovação regista o estatuto, e a ativação depende de regras comerciais e homologação económica próprias.",
    ],
  },
};
