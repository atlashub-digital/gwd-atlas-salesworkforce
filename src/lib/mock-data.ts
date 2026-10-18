import type { Campaign, Participant } from "./domain";

export const demoParticipant: Participant = {
  id: "demo-participant",
  displayName: "Vendedor Demo",
  capabilities: ["AFFILIATE", "SELLER"],
  status: "ACTIVE",
};

export const demoCampaigns: Campaign[] = [
  {
    id: "campaign-digital-preview",
    title: "Conteúdo Digital — Piloto",
    productTitle: "Primeira campanha Novidades",
    status: "DRAFT",
    compensationMode: "COMMISSION",
    commissionRate: 20,
    currency: "BRL",
  },
];
