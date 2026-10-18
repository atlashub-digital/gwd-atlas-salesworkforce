// Commercial gates deliberately cannot be switched on by environment variables.
export const flags = Object.freeze({
  learning: true, journeys: true, community: true, points: true,
  sellerPricing: false, referrals: false, aroProduction: false,
  payouts: false, ranking: false, copilot: false, dedicatedHermes: false,
});
export const inactiveModules: Record<string, { title: string; status: string; description: string }> = {
  campanhas: { title: "Campanhas", status: "EM PREPARAÇÃO", description: "As campanhas serão apresentadas depois da validação do catálogo e dos critérios de participação." },
  toolkit: { title: "Toolkit", status: "EM PREPARAÇÃO", description: "Aqui encontrarás materiais aprovados para criar e distribuir conteúdo com responsabilidade." },
  ranking: { title: "Ranking", status: "EM BREVE", description: "O reconhecimento da comunidade será publicado quando existirem regras homologadas e atividade real suficiente." },
  vendas: { title: "Vendas", status: "AINDA NÃO ATIVADO", description: "A atribuição de vendas depende da integração comercial validada com Novidades.Store e ARO." },
  ganhos: { title: "Ganhos", status: "AINDA NÃO ATIVADO", description: "Comissões, margens e pagamentos só estarão disponíveis após a ativação comercial. Não existe saldo financeiro disponível nesta fase." },
};
export const navigation = [
  ["dashboard","Visão geral"],["jornada","A minha jornada"],["academy","Academy"],
  ["oportunidades","Oportunidades"],["campanhas","Campanhas"],["toolkit","Toolkit"],
  ["comunidade","Comunidade"],["pontos","Os meus pontos"],["ranking","Ranking"],
  ["vendas","Vendas"],["ganhos","Ganhos"],["perfil","Perfil"],["configuracoes","Configurações"],
] as const;
