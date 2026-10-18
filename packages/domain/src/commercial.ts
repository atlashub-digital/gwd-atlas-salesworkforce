// Preserved Foundation V0 commercial contracts. Inactive; not imported by production V1.
export type ParticipantCapability = "AFFILIATE" | "SELLER";

export type Participant = {
  id: string;
  displayName: string;
  capabilities: ParticipantCapability[];
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
};

export type Campaign = {
  id: string;
  title: string;
  productTitle: string;
  status: "ACTIVE" | "DRAFT" | "PAUSED";
  compensationMode: "COMMISSION" | "MARGIN";
  commissionRate?: number;
  floorPriceMinor?: number;
  currency: string;
};

export type Referral = {
  id: string;
  code: string;
  participantId: string;
  campaignId: string;
};

export type AttributedSale = {
  id: string;
  aroOrderId: string;
  participantId: string;
  campaignId: string;
  amountMinor: number;
  currency: string;
  status: "APPROVED" | "REVERSED";
};

export type Accrual = {
  id: string;
  aroOrderId: string;
  participantId: string;
  kind: "COMMISSION" | "MARGIN";
  amountMinor: number;
  currency: string;
  status: "PENDING" | "AVAILABLE" | "PAID" | "REVERSED";
};
