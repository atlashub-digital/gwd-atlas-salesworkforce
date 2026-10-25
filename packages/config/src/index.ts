// Commercial gates deliberately cannot be switched on by environment variables.
export const flags = Object.freeze({
  learning: true, journeys: true, community: true, points: true,
  sellerPricing: false, referrals: false, aroProduction: false,
  payouts: false, ranking: false, copilot: false, dedicatedHermes: false,
});
export const inactiveModules: Record<string, { title: string; status: string; description: string }> = {
  campanhas: { title: "Campanhas", status: "EM PREPARAÇÃO", description: "As campanhas serão apresentadas depois da validação do catálogo e dos critérios de participação." },
  ranking: { title: "Ranking", status: "EM BREVE", description: "O reconhecimento da comunidade será publicado quando existirem regras homologadas e atividade real suficiente." },
};
export const navigation = [
  ["dashboard","Início"],["percursos","Os meus percursos"],["jornada","A minha jornada"],["academy","Academy"],
  ["comunidade","Comunidade"],["pontos","Os meus pontos"],
  ["produtos","Produtos e Ofertas"],["afiliado","Área do Afiliado"],["revenda","Vendedor Autorizado"],
  ["toolkit","Materiais de Divulgação"],["resultados","Resultados e Comissões"],["oportunidades","Oportunidades"],
  ["campanhas","Campanhas"],["ranking","Ranking"],["perfil","Perfil"],["configuracoes","Configurações"],
] as const;
/** Sidebar grouping: learning first, the commercial area (catalogue, affiliate, seller, materials, results), staged
 *  modules apart, account last. Commercial screens show their real state (approval, programme, ARO), never fake data. */
export const navigationGroups = [
  { label: "A tua jornada", items: ["dashboard","percursos","jornada","academy","comunidade","pontos"] },
  { label: "Área comercial", items: ["produtos","afiliado","revenda","toolkit","resultados","oportunidades"] },
  { label: "Em preparação", items: ["campanhas","ranking"] },
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
export * from "./partners";
