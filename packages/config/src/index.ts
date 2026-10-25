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
  ["dashboard","Início"],["jornada","A minha jornada"],["academy","Academy"],
  ["oportunidades","Oportunidades"],["campanhas","Campanhas"],["toolkit","Toolkit"],
  ["comunidade","Comunidade"],["pontos","Os meus pontos"],["ranking","Ranking"],
  ["vendas","Vendas"],["ganhos","Ganhos"],["perfil","Perfil"],["configuracoes","Configurações"],
] as const;
/** Sidebar grouping (master board 10/11): learning first, staged commercial modules apart, account last. */
export const navigationGroups = [
  { label: "A tua jornada", items: ["dashboard","jornada","academy","oportunidades","comunidade","pontos"] },
  { label: "Em preparação", items: ["campanhas","toolkit","ranking","vendas","ganhos"] },
  { label: "Conta", items: ["perfil","configuracoes"] },
] as const;

/** XP levels (GWD_ACADEMY_GAMIFICATION_V1: projection over the points ledger; thresholds live in config, not UI).
 *  Starter at 100 follows the master board ("Nível 1 Explorador · 40/100"); higher thresholds await Diana's approval. */
export const levels = [
  { key: "EXPLORER", name: "Explorador", min: 0 },
  { key: "STARTER", name: "Starter", min: 100 },
  { key: "OPERATOR", name: "Operador", min: 300 },
  { key: "BUILDER", name: "Builder", min: 700 },
  { key: "PRO", name: "Pro", min: 1500 },
] as const;
export function levelFor(points: number) {
  const index = levels.reduce((found, level, i) => (points >= level.min ? i : found), 0);
  const next = levels[index + 1];
  return { number: index + 1, ...levels[index], next: next ? { name: next.name, min: next.min } : null };
}
export * from "./channels";
