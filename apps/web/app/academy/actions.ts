"use server";

export type TelegramHandoff = {
  ok: boolean;
  token: string | null;
  note: string;
  expiresInMinutes: number;
};

/** Fail closed until the authenticated Telegram boundary is connected.
 * Never manufacture a handoff token or claim an opened event.
 */
export async function createTelegramHandoff(_episodeId: string): Promise<TelegramHandoff> {
  return {ok: false, token: null, note: "AINDA NÃO ATIVADO · A ligação ao Telegram está em preparação.", expiresInMinutes: 0};
}
