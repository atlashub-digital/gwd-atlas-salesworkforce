"use server";
/* GWD Academy Streaming V1 — server actions mock.
   O invite/handoff Telegram NUNCA vive no HTML (HYBRID.md): é gerado por
   endpoint autenticado do server após validação de entitlement. Aqui mock:
   token opaco efémero, sem invite real. TODO(POST /v1/academy):
   - validar sessão do participante;
   - perguntar ao ARO o entitlement (ARO é a autoridade);
   - emitir invite per-user/limitado com expiry + revogação. */

export type TelegramHandoff = {
  ok: boolean;
  token: string | null;
  note: string;
  expiresInMinutes: number;
};

export async function createTelegramHandoff(episodeId: string): Promise<TelegramHandoff> {
  // Mock honesto: token opaco efémero, sem canal real. O evento
  // TELEGRAM_HANDOFF_OPENED é registado no cliente (ledger demo) ao usar.
  if (!episodeId.startsWith("demo-ep-")) return {ok: false, token: null, note: "Episódio desconhecido.", expiresInMinutes: 0};
  const token = `demo-tg-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  return {ok: true, token, note: "Token de handoff demo (nenhum invite real é exposto).", expiresInMinutes: 15};
}
