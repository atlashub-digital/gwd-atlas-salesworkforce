import test from "node:test";
import assert from "node:assert/strict";
import {atlasMediaConfig, requestPlayback, type AtlasMediaConfig} from "../apps/api/src/media";

/* Contract tests against an EXPLICIT MOCK of the Atlas Media catalog /token (shape verified on the real
   service, see docs/rebuild/MEDIA_VPS_AS_IS.md). These do not prove G4 REAL MEDIA. */
const config: AtlasMediaConfig = {tokenUrl: "https://media.mock.invalid/token", gatewayUrl: "https://media.mock.invalid/", tenant: "gwd", aroProject: "gwd"};
const mockFetch = (status: number, body: unknown, seen?: {body?: Record<string, unknown>}) =>
  (async (_url: unknown, init?: RequestInit) => { if (seen) seen.body = JSON.parse(String(init?.body)); return new Response(JSON.stringify(body), {status}); }) as typeof fetch;

test("media: sem configuração falha fechado (MEDIA_UNAVAILABLE)", async () => {
  assert.equal(atlasMediaConfig({}), null);
  const r = await requestPlayback(null, {assetRef: "01K5D8HGF18YCW2KO6VW", policyRef: "gwd.academy.series:x", email: "a@b.pt"});
  assert.equal(r.ok, false); assert.equal(!r.ok && r.code, "MEDIA_UNAVAILABLE");
});

test("media: asset do catálogo demo nunca chama o serviço", async () => {
  let called = false;
  const r = await requestPlayback(config, {assetRef: "demo-video-x", policyRef: "p", email: "a@b.pt"}, (async () => { called = true; return new Response("{}"); }) as typeof fetch);
  assert.equal(called, false); assert.equal(!r.ok && r.code, "MEDIA_NOT_LINKED");
});

test("media: ALLOW devolve manifest no gateway com token, sem paths internos", async () => {
  const seen: {body?: Record<string, unknown>} = {};
  const r = await requestPlayback(config, {assetRef: "01K5D8HGF18YCW2KO6VW", policyRef: "gwd.academy.series:gwd-start", email: "a@b.pt"},
    mockFetch(200, {token: "tok.en.sig", expires_at: 1, url: "/media/gwd/01K5D8HGF18YCW2KO6VW/master.m3u8"}, seen));
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.manifestUrl, "https://media.mock.invalid/media/gwd/01K5D8HGF18YCW2KO6VW/master.m3u8?t=tok.en.sig");
  assert.deepEqual(seen.body, {tenant: "gwd", asset_id: "01K5D8HGF18YCW2KO6VW", entitlement_ref: "gwd.academy.series:gwd-start", aro: {project: "gwd", identity: {email: "a@b.pt"}}});
});

test("media: DENY do ARO fica bloqueado e sem token", async () => {
  const r = await requestPlayback(config, {assetRef: "01K5D8HGF18YCW2KO6VW", policyRef: "p", email: "a@b.pt"}, mockFetch(403, {error: "entitlement_denied"}));
  assert.equal(r.ok, false); assert.equal(!r.ok && r.code, "ENTITLEMENT_DENIED");
});

test("media: sem email confirmado não pede token", async () => {
  const r = await requestPlayback(config, {assetRef: "01K5D8HGF18YCW2KO6VW", policyRef: "p", email: null}, mockFetch(200, {}));
  assert.equal(!r.ok && r.code, "IDENTITY_REQUIRED");
});

test("media: URL fora de /media/ é rejeitada", async () => {
  const r = await requestPlayback(config, {assetRef: "01K5D8HGF18YCW2KO6VW", policyRef: "p", email: "a@b.pt"}, mockFetch(200, {token: "t", url: "https://evil.example/x.m3u8"}));
  assert.equal(!r.ok && r.code, "MEDIA_ERROR");
});
