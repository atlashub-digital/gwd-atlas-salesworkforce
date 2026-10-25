import {randomBytes} from "node:crypto";
import {partnerTermsVersion, type PartnerKind} from "@gwd/config";
import {InputError, market, object, text, uuid} from "@gwd/contracts";
import type {PoolClient} from "pg";

/* Partners V1: Novidades.Store catalogue inside GWD (source of truth = the store's public catalogue API, prices never
   copied), offer programmes (eligibility), affiliate / authorized-seller applications, terms, attributed links with
   verified clicks, and read-only sales/accruals. Commissions are never written here (ARO reconciliation only). */

export type Offer = {slug: string; title: string; subtitle: string; description: string; category: string; categorySlug: string;
  image: string | null; priceCents: number; currency: string; fulfillment: string; url: string};
type Listing = Record<string, unknown>;

const CATALOG_URL = () => process.env.NOVIDADES_CATALOG_URL ?? "https://www.novidades.store/api/catalog";
const STORE_ORIGIN = "https://www.novidades.store";
const ASSET_ORIGIN = () => process.env.NOVIDADES_ASSET_ORIGIN ?? STORE_ORIGIN;
let cache: {at: number; offers: Offer[]} | null = null;

function absolute(path: unknown): string | null {
  if (typeof path !== "string" || !path) return null;
  try { return new URL(path, ASSET_ORIGIN()).toString(); } catch { return null; }
}
/** Only https URLs on the store's own domains can be a destination (never an arbitrary redirect). */
export function storeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && (u.hostname === "novidades.store" || u.hostname.endsWith(".novidades.store")) ? u.toString() : null;
  } catch { return null; }
}
export function mapListing(l: Listing): Offer | null {
  const slug = typeof l.slug === "string" && /^[a-z0-9-]{2,80}$/.test(l.slug) ? l.slug : null;
  const url = storeUrl(l.funnelUrl) ?? (slug && typeof l.categorySlug === "string" ? storeUrl(`${STORE_ORIGIN}/${l.categorySlug}/${slug}`) : null);
  if (!slug || !url || typeof l.title !== "string" || typeof l.priceCents !== "number") return null;
  return {slug, title: l.title, subtitle: String(l.subtitle ?? ""), description: String(l.description ?? ""), category: String(l.categoryName ?? ""),
    categorySlug: String(l.categorySlug ?? ""), image: absolute(l.image), priceCents: l.priceCents, currency: String(l.currency ?? "BRL"),
    fulfillment: String(l.fulfillmentType ?? ""), url};
}
export async function loadCatalog(fetcher: typeof fetch = fetch): Promise<Offer[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.offers;
  const response = await fetcher(CATALOG_URL(), {headers: {accept: "application/json"}, signal: AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error("CATALOG_UNAVAILABLE");
  const body = await response.json() as {data?: unknown};
  const offers = (Array.isArray(body.data) ? body.data : []).map(l => mapListing(l as Listing)).filter((o): o is Offer => o !== null);
  cache = {at: Date.now(), offers};
  return offers;
}
export function resetCatalogCache() { cache = null; }

/** Destination of an attributed link: the official offer page with the GWD attribution parameters ARO already accepts
 *  (utm_* + referrer). The store must forward them into the checkout session (integration contract, Helena). */
export function attributedUrl(offerUrl: string, code: string, campaign: string): string {
  const u = new URL(offerUrl);
  u.searchParams.set("utm_source", "gwd");
  u.searchParams.set("utm_medium", "affiliate");
  u.searchParams.set("utm_campaign", campaign || "gwd-affiliate");
  u.searchParams.set("utm_content", code);
  u.searchParams.set("gwd_ref", code);
  return u.toString();
}
/** Link previews (WhatsApp, Telegram, social networks) and crawlers are not clicks. */
export function isBot(userAgent: string | null): boolean {
  return !userAgent || /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|twitter|linkedin|embedly|curl|wget|python|headless/i.test(userAgent);
}

const kinds: Record<string, PartnerKind> = {AFFILIATE: "AFFILIATE", AUTHORIZED_SELLER: "AUTHORIZED_SELLER"};
function kindInput(value: unknown): PartnerKind {
  const k = kinds[String(value)];
  if (!k) throw new InputError("Escolhe o tipo de candidatura.");
  return k;
}
function campaignInput(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  const v = String(value).trim().toLowerCase();
  if (!/^[a-z0-9-]{1,40}$/.test(v)) throw new InputError("A identificação de campanha só pode ter letras minúsculas, números e hífenes (até 40).");
  return v;
}
type Json = (body: unknown, status?: number) => Response;
const linkBase = () => (process.env.GWD_WEB_URL ?? "https://goworld.digital").replace(/\/$/, "");

/** Public: records a verified click and returns the attributed destination. */
export async function publicReferral(route: string, method: string, request: Request,
  tx: (userId: string | null, run: (c: PoolClient) => Promise<Response>) => Promise<Response>, json: Json): Promise<Response | null> {
  const m = /^\/v1\/public\/referral\/([0-9a-f-]{36})$/i.exec(route);
  if (!m || method !== "POST") return null;
  const id = uuid(m[1]);
  const bot = isBot(request.headers.get("x-visitor-user-agent"));
  return tx(null, async c => {
    // Bots and previews resolve the destination without recording a click.
    const row = (await c.query("select * from gwd.referral_click($1, $2)", [id, !bot])).rows[0];
    if (!row) return json({error: "Ligação indisponível."}, 404);
    const offer = (await loadCatalog()).find(o => o.slug === row.offer_slug);
    if (!offer) return json({error: "Oferta indisponível."}, 404);
    return json({url: attributedUrl(offer.url, row.code, row.campaign), recorded: !bot});
  });
}

/** Authenticated member + operator routes. Returns null when the route is not a partners route. */
export async function partnerRoute({request, route, method, c, userId, json}: {request: Request; route: string; method: string; c: PoolClient; userId: string; json: Json}): Promise<Response | null> {
  if (route === "/v1/offers" && method === "GET") {
    const offers = await loadCatalog();
    // Before 2026-10-25-partners-v1.sql the catalogue is still shown, with no programme listed.
    const ready = (await c.query("select to_regclass('gwd.offer_programs') is not null as ok")).rows[0]?.ok;
    const programs = (ready ? (await c.query("select offer_slug, kind, status, conditions from gwd.offer_programs")).rows : []) as Array<{offer_slug: string; kind: string; status: string; conditions: string}>;
    return json({source: "novidades.store", items: offers.map(o => ({...o,
      programs: Object.fromEntries(["AFFILIATE", "RESELLER"].map(k => {
        const p = programs.find(x => x.offer_slug === o.slug && x.kind === k);
        return [k, p ? {status: p.status, conditions: p.status === "ACTIVE" ? p.conditions : ""} : {status: "NOT_LISTED", conditions: ""}];
      }))}))});
  }
  if (route === "/v1/partner" && method === "GET") {
    const [applications, terms, caps, referral, links, sales, accruals] = await Promise.all([
      c.query("select id, kind, status, market, decision_note, created_at, reviewed_at from gwd.partner_applications where participant_id = $1 order by created_at desc", [userId]),
      c.query("select kind, terms_version, accepted_at from gwd.partner_terms where participant_id = $1", [userId]),
      c.query("select capability from gwd.participant_capabilities where participant_id = $1", [userId]),
      c.query("select code from gwd.referrals where participant_id = $1", [userId]),
      c.query(`select l.id, l.offer_slug, l.campaign, l.created_at,
                 (select count(*)::int from gwd.referral_clicks k where k.link_id = l.id) as clicks,
                 (select max(clicked_at) from gwd.referral_clicks k where k.link_id = l.id) as last_click
                 from gwd.referral_links l where l.participant_id = $1 order by l.created_at desc`, [userId]),
      c.query("select aro_order_id, status from gwd.attributed_sales where participant_id = $1", [userId]),
      c.query("select aro_order_id, amount_minor, currency, status from gwd.accrual_ledger where participant_id = $1", [userId]),
    ]);
    return json({
      termsVersion: partnerTermsVersion,
      applications: applications.rows,
      terms: terms.rows,
      capabilities: caps.rows.map(r => r.capability),
      code: referral.rows[0]?.code ?? null,
      links: links.rows.map(l => ({...l, url: `${linkBase()}/r/${l.id}`})),
      sales: sales.rows,
      accruals: accruals.rows,
    });
  }
  if (route === "/v1/partner/applications" && method === "POST") {
    const v = object(await request.json());
    const kind = kindInput(v.kind);
    if (v.acceptRules !== true) throw new InputError("Confirma que conheces as regras de transparência e conformidade.");
    const channels = text(v.channels, 1000), motivation = text(v.motivation, 2000);
    if (channels.length < 10) throw new InputError("Descreve os canais onde vais divulgar (mínimo 10 caracteres).");
    if (motivation.length < 20) throw new InputError("Conta-nos porque te candidatas (mínimo 20 caracteres).");
    const r = await c.query("insert into gwd.partner_applications (participant_id, kind, market, channels, motivation) values ($1, $2, $3, $4, $5) on conflict do nothing returning id",
      [userId, kind, market(v.market), channels, motivation]);
    if (!r.rows.length) throw new InputError("Já tens uma candidatura deste tipo em análise ou aprovada.");
    await c.query("insert into gwd.audit_events(participant_id, action) values ($1, $2)", [userId, "partner." + kind.toLowerCase() + ".applied"]);
    return json({id: r.rows[0].id, status: "SUBMITTED"}, 201);
  }
  if (route === "/v1/partner/terms" && method === "POST") {
    const v = object(await request.json());
    const kind = kindInput(v.kind);
    if (v.version !== partnerTermsVersion) throw new InputError("Os termos foram atualizados. Lê a versão atual.");
    const approved = (await c.query("select 1 from gwd.partner_applications where participant_id = $1 and kind = $2 and status = 'APPROVED'", [userId, kind])).rows.length;
    if (!approved) return json({error: "Os termos só podem ser aceites depois de a candidatura ser aprovada.", code: "NOT_APPROVED"}, 409);
    await c.query("insert into gwd.partner_terms (participant_id, kind, terms_version) values ($1, $2, $3) on conflict do nothing", [userId, kind, partnerTermsVersion]);
    await c.query("insert into gwd.audit_events(participant_id, action) values ($1, $2)", [userId, "partner." + kind.toLowerCase() + ".terms"]);
    return json({accepted: true, version: partnerTermsVersion});
  }
  if (route === "/v1/partner/links" && method === "POST") {
    const v = object(await request.json());
    const slug = String(v.offerSlug ?? "");
    if (!/^[a-z0-9-]{2,80}$/.test(slug)) throw new InputError("Oferta inválida.");
    const campaign = campaignInput(v.campaign);
    const offer = (await loadCatalog()).find(o => o.slug === slug);
    if (!offer) throw new InputError("Esta oferta não está no catálogo da Novidades.Store.");
    // Clear reasons first; RLS enforces the same rules (approved affiliate + terms + ACTIVE programme).
    const caps = (await c.query("select 1 from gwd.participant_capabilities where participant_id = $1 and capability = 'AFFILIATE'", [userId])).rows.length;
    if (!caps) return json({error: "A afiliação ainda não foi aprovada para a tua conta.", code: "NOT_AFFILIATE"}, 403);
    const terms = (await c.query("select 1 from gwd.partner_terms where participant_id = $1 and kind = 'AFFILIATE' and terms_version = $2", [userId, partnerTermsVersion])).rows.length;
    if (!terms) return json({error: "Aceita os termos de afiliado em vigor antes de gerar links.", code: "TERMS_REQUIRED"}, 409);
    const program = (await c.query("select status from gwd.offer_programs where offer_slug = $1 and kind = 'AFFILIATE'", [slug])).rows[0];
    if (program?.status !== "ACTIVE") return json({error: "Esta oferta ainda não tem condições de afiliação ativas.", code: "PROGRAM_NOT_ACTIVE"}, 409);
    if (!(await c.query("select 1 from gwd.referrals where participant_id = $1", [userId])).rows.length)
      await c.query("insert into gwd.referrals (participant_id, code) values ($1, $2) on conflict do nothing", [userId, randomBytes(6).toString("hex")]);
    const r = await c.query("insert into gwd.referral_links (participant_id, offer_slug, campaign) values ($1, $2, $3) on conflict (participant_id, offer_slug, campaign) do nothing returning id", [userId, slug, campaign]);
    const id = r.rows[0]?.id ?? (await c.query("select id from gwd.referral_links where participant_id = $1 and offer_slug = $2 and campaign = $3", [userId, slug, campaign])).rows[0].id;
    await c.query("insert into gwd.audit_events(participant_id, action) values ($1, 'partner.link.created')", [userId]);
    return json({id, url: `${linkBase()}/r/${id}`, offerSlug: slug, campaign}, r.rows.length ? 201 : 200);
  }
  if ((route === "/v1/ops/partners" || route === "/v1/ops/partners/review" || route === "/v1/ops/offer-programs")
    && !(await c.query("select gwd.is_operator() as ok")).rows[0]?.ok)
    return json({error: "Área reservada à operação GWD.", code: "OPERATOR_ONLY"}, 403);
  if (route === "/v1/ops/partners" && method === "GET")
    return json({items: (await c.query("select * from gwd.ops_partner_applications()")).rows});
  if (route === "/v1/ops/partners/review" && method === "POST") {
    const v = object(await request.json());
    const decision = String(v.decision);
    if (!["APPROVED", "REJECTED"].includes(decision)) throw new InputError("Decisão inválida.");
    const note = typeof v.note === "string" ? v.note.slice(0, 500) : "";
    const ok = (await c.query("select gwd.ops_review_partner_application($1, $2, $3) as ok", [uuid(String(v.id)), decision, note])).rows[0]?.ok;
    return ok ? json({reviewed: true, decision}) : json({error: "Candidatura já analisada ou inexistente."}, 409);
  }
  if (route === "/v1/ops/offer-programs" && method === "POST") {
    const v = object(await request.json());
    const slug = String(v.offerSlug ?? ""), kind = String(v.kind), status = String(v.status);
    if (!/^[a-z0-9-]{2,80}$/.test(slug) || !["AFFILIATE", "RESELLER"].includes(kind) || !["PENDING_CONDITIONS", "ACTIVE", "PAUSED"].includes(status)) throw new InputError("Programa inválido.");
    if (!(await loadCatalog()).some(o => o.slug === slug)) throw new InputError("Esta oferta não está no catálogo da Novidades.Store.");
    const conditions = typeof v.conditions === "string" ? v.conditions.trim().slice(0, 2000) : "";
    if (status === "ACTIVE" && conditions.length < 20) throw new InputError("Um programa ativo precisa das condições confirmadas pela direção.");
    await c.query("select gwd.ops_set_offer_program($1, $2, $3, $4)", [slug, kind, status, conditions]);
    return json({offerSlug: slug, kind, status});
  }
  return null;
}
