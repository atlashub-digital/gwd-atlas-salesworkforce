/* GWD Academy — adapter Atlas Media (server-side). Contrato verificado no catalog real
   (docs/rebuild/MEDIA_VPS_AS_IS.md): POST {tokenUrl} {tenant, asset_id, entitlement_ref, aro:{project, identity:{email}}}
   → 200 {token, expires_at, url} | 403 entitlement_denied | 404 asset_not_found | 502 aro_unavailable.
   O browser recebe apenas um manifest URL com token curto (TTL do catalog); nunca chaves, IPs ou paths internos.
   Sem configuração → MEDIA_UNAVAILABLE (fail closed). Um media_asset_id nunca é entitlement. */

export type AtlasMediaConfig = {tokenUrl: string; gatewayUrl: string; tenant: string; aroProject: string};
export type PlaybackResult =
  | {ok: true; manifestUrl: string; expiresAt: number; provider: "ATLAS_MEDIA"}
  | {ok: false; status: number; code: "MEDIA_UNAVAILABLE" | "MEDIA_NOT_LINKED" | "ENTITLEMENT_DENIED" | "MEDIA_NOT_FOUND" | "IDENTITY_REQUIRED" | "MEDIA_ERROR"; error: string};

export function atlasMediaConfig(env: Record<string, string | undefined> = process.env): AtlasMediaConfig | null {
  const tokenUrl = env.ATLAS_MEDIA_TOKEN_URL, gatewayUrl = env.ATLAS_MEDIA_GATEWAY_URL, aroProject = env.ATLAS_MEDIA_ARO_PROJECT;
  if (!tokenUrl || !gatewayUrl || !aroProject) return null;
  return {tokenUrl, gatewayUrl: gatewayUrl.replace(/\/+$/, ""), tenant: env.ATLAS_MEDIA_TENANT ?? "gwd", aroProject};
}

/** Assets of the honest demo catalogue have no media behind them. */
export const isLinkedAsset = (assetRef: string) => !!assetRef && !assetRef.startsWith("demo-");

export async function requestPlayback(
  config: AtlasMediaConfig | null,
  input: {assetRef: string; policyRef: string; email: string | null},
  fetcher: typeof fetch = fetch,
): Promise<PlaybackResult> {
  if (!isLinkedAsset(input.assetRef)) return {ok: false, status: 409, code: "MEDIA_NOT_LINKED", error: "Este episódio ainda não tem vídeo publicado."};
  if (!config) return {ok: false, status: 503, code: "MEDIA_UNAVAILABLE", error: "O serviço de vídeo ainda não está ligado a este ambiente."};
  if (!input.email) return {ok: false, status: 403, code: "IDENTITY_REQUIRED", error: "Confirma o teu email para reproduzir este episódio."};
  let response: Response;
  try {
    response = await fetcher(config.tokenUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({tenant: config.tenant, asset_id: input.assetRef, entitlement_ref: input.policyRef, aro: {project: config.aroProject, identity: {email: input.email}}}),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return {ok: false, status: 503, code: "MEDIA_UNAVAILABLE", error: "O serviço de vídeo não respondeu. Tenta novamente."};
  }
  if (response.status === 403) return {ok: false, status: 403, code: "ENTITLEMENT_DENIED", error: "O teu acesso a este episódio não está ativo."};
  if (response.status === 404) return {ok: false, status: 404, code: "MEDIA_NOT_FOUND", error: "O vídeo deste episódio não foi encontrado."};
  if (!response.ok) return {ok: false, status: 502, code: "MEDIA_ERROR", error: "Não foi possível autorizar a reprodução agora."};
  const data = (await response.json().catch(() => null)) as {token?: string; expires_at?: number; url?: string} | null;
  if (!data?.token || !data.url || !data.url.startsWith("/media/")) return {ok: false, status: 502, code: "MEDIA_ERROR", error: "Resposta inválida do serviço de vídeo."};
  return {ok: true, provider: "ATLAS_MEDIA", expiresAt: Number(data.expires_at ?? 0), manifestUrl: `${config.gatewayUrl.replace(/\/+$/, "")}${data.url}?t=${encodeURIComponent(data.token)}`};
}
