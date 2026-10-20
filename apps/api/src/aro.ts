/* GWD Academy Streaming V1 — adapter ARO (entitlement).
   ARO é a autoridade de entitlement (DATA_MODEL §7): duração, expiração, revogação e
   refund vivem no ARO — a GWD NUNCA guarda paid=true e nunca concede por clique.
   V1 soft-launch: adapter MOCK, mas server-side e com interface clara para trocar
   pelo ARO real (GET /entitlements?participant=&resource=) sem tocar a API. */

export type AroEntitlementInput = {
  participantId: string;
  entitlementRef: string;
  tier: "FREE" | "MEMBER" | "PREMIUM" | "CERTIFIED";
};

export type AroEntitlementResult = {
  active: boolean;
  expiresAt: string | null;
  /** proveniência da decisão — nunca "paid" persistido na GWD */
  source: "aro-mock" | "aro-http";
  checkoutUrl?: string;
};

export interface AroAdapter {
  checkEntitlement(input: AroEntitlementInput): Promise<AroEntitlementResult>;
}

const TIER_RANK = {FREE: 0, MEMBER: 1, PREMIUM: 2, CERTIFIED: 3} as const;

/* Mock V1 (soft-launch): FREE/MEMBER sempre activo; PREMIUM/CERTIFIED só quando o
   entitlement_ref consta de ARO_MOCK_ACTIVE_REFS (env, lista separada por vírgulas)
   — simula uma concessão real do ARO sem a inventar por omissão. */
export const aroMock: AroAdapter = {
  async checkEntitlement(input: AroEntitlementInput): Promise<AroEntitlementResult> {
    if (TIER_RANK[input.tier] <= TIER_RANK.MEMBER) return {active: true, expiresAt: null, source: "aro-mock"};
    const granted = (process.env.ARO_MOCK_ACTIVE_REFS ?? "").split(",").map(s => s.trim()).filter(Boolean);
    const active = granted.includes(input.entitlementRef);
    return {
      active,
      expiresAt: null,
      source: "aro-mock",
      checkoutUrl: active ? undefined : "/entrar?upgrade=1",
    };
  },
};

export function aroAdapter(): AroAdapter {
  return aroMock;
}
