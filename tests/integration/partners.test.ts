import {test} from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {PGlite} from "@electric-sql/pglite";import type {PoolClient} from "pg";
import {createHandler} from "../../apps/api/src/handler";
import {resetCatalogCache,signOrderEvent} from "../../apps/api/src/partners";
import {partnerTermsVersion} from "../../packages/config/src/index";
import type {transaction} from "../../packages/db/src/index";
/* Partners V1 with real RLS (PGlite, production permission parity): Novidades catalogue → affiliate application →
 * operator approval → terms → ACTIVE programme → attributed link → verified click (previews ignored). Negative paths:
 * no link before approval/terms/programme, no ops for members, no reading or forging other members' links. */
const catalog={success:true,data:[
 {slug:"conversion-content-os",title:"Conversion Content OS",subtitle:"Sistema prático.",description:"Guia e workbook.",categorySlug:"conteudos-digitais",categoryName:"Academia Digital",image:"/images/products/conversion-content-os.svg",funnelUrl:"https://novidades.store/conteudos-digitais/conversion-content-os",priceCents:9700,currency:"BRL",fulfillmentType:"digital"},
 {slug:"social-content-os",title:"Social Content OS",subtitle:"Planner.",description:"Sistema multicanal.",categorySlug:"conteudos-digitais",categoryName:"Academia Digital",image:"/images/products/social-content-os.svg",funnelUrl:"https://novidades.store/conteudos-digitais/social-content-os",priceCents:4700,currency:"BRL",fulfillmentType:"digital"},
 {slug:"evil",title:"Redirect",funnelUrl:"https://evil.example/x",priceCents:1,currency:"BRL"}]};
test("Partners V1: catalogue, application, approval, terms, attributed link, verified clicks, RLS",async()=>{
 process.env.NOVIDADES_CATALOG_URL="data:application/json,"+encodeURIComponent(JSON.stringify(catalog));process.env.GWD_WEB_URL="https://goworld.digital";resetCatalogCache();
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;");
 await db.exec(await readFile(new URL("../../packages/db/schema.sql",import.meta.url),"utf8"));
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-20-academy-v1.sql",import.meta.url),"utf8"));
 await db.exec("revoke usage on schema auth from gwd_api");// production parity
 const member="00000000-0000-4000-8000-000000000011",other="00000000-0000-4000-8000-000000000012",operator="00000000-0000-4000-8000-000000000013";
 await db.query("insert into auth.users values($1),($2),($3)",[member,other,operator]);
 const tx:typeof transaction=async(userId,run)=>{await db.exec("begin;set local role gwd_api;");try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);const result=await run(db as unknown as PoolClient);await db.exec("commit");return result;}catch(e){await db.exec("rollback");throw e;}};
 const handle=createHandler(tx,async token=>{if(![member,other,operator].includes(token))throw new Error("UNAUTHORIZED");return {id:token,email:token+"@example.com"};},async()=>"sent");
 const call=async(route:string,body?:unknown,id:string|null=null,headers:Record<string,string>={})=>handle(new Request("http://test"+route,{method:body!==undefined?"POST":"GET",headers:{"Content-Type":"application/json",...headers,...(id?{Authorization:"Bearer "+id}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})}));
 for(const [id,name] of [[member,"Ana"],[other,"Bruno"],[operator,"Ops"]])assert.equal((await handle(new Request("http://test/v1/me",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+id},body:JSON.stringify({name,market:"BR",interest:"AFFILIATE",complete:true})}))).status,200);
 const application={kind:"AFFILIATE",market:"BR",channels:"Instagram sobre produtividade, 2 mil seguidores",motivation:"Uso o Conversion Content OS e conheço bem o público.",acceptRules:true};
 // Before the migration: the catalogue still works (no programme listed); partner routes say "em ativação".
 let r=await call("/v1/offers",undefined,member);assert.equal(r.status,200);
 let offers=(await r.json()).items;assert.deepEqual(offers.map((o:{slug:string})=>o.slug),["conversion-content-os","social-content-os"],"open-redirect listing dropped");
 assert.equal(offers[0].programs.AFFILIATE.status,"NOT_LISTED");assert.equal(offers[0].image,"https://www.novidades.store/images/products/conversion-content-os.svg");
 r=await call("/v1/partner",undefined,member);assert.equal(r.status,503);assert.equal((await r.json()).code,"PARTNERS_PENDING");
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-24-leads-v2.sql",import.meta.url),"utf8"));
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-25-partners-v1.sql",import.meta.url),"utf8"));
 await db.query("insert into gwd.operators(participant_id) values($1)",[operator]);
 offers=(await (await call("/v1/offers",undefined,member)).json()).items;
 assert.deepEqual(offers.map((o:{programs:{AFFILIATE:{status:string}}})=>o.programs.AFFILIATE.status),["PENDING_CONDITIONS","PENDING_CONDITIONS"]);
 // Application; duplicates refused; nothing commercial before approval.
 assert.equal((await call("/v1/partner/applications",{...application,acceptRules:false},member)).status,400);
 assert.equal((await call("/v1/partner/applications",application,member)).status,201);
 assert.equal((await call("/v1/partner/applications",application,member)).status,400);
 assert.equal((await call("/v1/partner/terms",{kind:"AFFILIATE",version:partnerTermsVersion},member)).status,409);
 assert.equal((await call("/v1/partner/links",{offerSlug:"conversion-content-os"},member)).status,403);
 // Members cannot reach operator functions.
 assert.equal((await call("/v1/ops/partners",undefined,member)).status,403);
 assert.equal((await call("/v1/ops/offer-programs",{offerSlug:"conversion-content-os",kind:"AFFILIATE",status:"ACTIVE",conditions:"Comissão de teste"},member)).status,403);
 // Operator reviews: approval grants the AFFILIATE capability (server-side, audited).
 const items=(await (await call("/v1/ops/partners",undefined,operator)).json()).items;assert.equal(items.length,1);assert.equal(items[0].display_name,"Ana");
 assert.deepEqual(await (await call("/v1/ops/partners/review",{id:items[0].id,decision:"APPROVED",note:"Bem-vinda"},operator)).json(),{reviewed:true,decision:"APPROVED"});
 assert.equal((await call("/v1/ops/partners/review",{id:items[0].id,decision:"REJECTED"},operator)).status,409,"a decision is final");
 assert.ok((await (await call("/v1/me",undefined,member)).json()).capabilities.includes("AFFILIATE"));
 // Terms required, then an ACTIVE programme with real conditions.
 assert.equal((await (await call("/v1/partner/links",{offerSlug:"conversion-content-os"},member)).json()).code,"TERMS_REQUIRED");
 assert.equal((await call("/v1/partner/terms",{kind:"AFFILIATE",version:"2000-01-01"},member)).status,400);
 assert.equal((await call("/v1/partner/terms",{kind:"AFFILIATE",version:partnerTermsVersion},member)).status,200);
 assert.equal((await (await call("/v1/partner/links",{offerSlug:"conversion-content-os"},member)).json()).code,"PROGRAM_NOT_ACTIVE");
 assert.equal((await call("/v1/ops/offer-programs",{offerSlug:"conversion-content-os",kind:"AFFILIATE",status:"ACTIVE",conditions:"curto"},operator)).status,400);
 assert.equal((await call("/v1/ops/offer-programs",{offerSlug:"evil",kind:"AFFILIATE",status:"ACTIVE",conditions:"Condições de teste do piloto confirmadas."},operator)).status,400,"only catalogue offers");
 assert.equal((await call("/v1/ops/offer-programs",{offerSlug:"conversion-content-os",kind:"AFFILIATE",status:"ACTIVE",conditions:"Condições de teste do piloto confirmadas."},operator)).status,200);
 // Attributed link: stable per offer × campaign; bad campaign refused.
 assert.equal((await call("/v1/partner/links",{offerSlug:"conversion-content-os",campaign:"Stories Semana 1!"},member)).status,400);
 r=await call("/v1/partner/links",{offerSlug:"conversion-content-os",campaign:"stories-semana1"},member);assert.equal(r.status,201);
 const link=await r.json();assert.match(link.url,/^https:\/\/goworld\.digital\/r\/[0-9a-f-]{36}$/);
 assert.equal((await (await call("/v1/partner/links",{offerSlug:"conversion-content-os",campaign:"stories-semana1"},member)).json()).id,link.id);
 assert.equal((await call("/v1/partner/links",{offerSlug:"social-content-os"},member)).status,409,"pilot offer still pending");
 // Public redirect: previews resolve without counting; a visitor counts once per visit; destination is the store.
 r=await call("/v1/public/referral/"+link.id,{},null,{"x-visitor-user-agent":"WhatsApp/2.23.20 A"});
 let body=await r.json();assert.equal(body.recorded,false);
 const target=new URL(body.url);assert.equal(target.hostname,"novidades.store");
 assert.deepEqual(["utm_source","utm_medium","utm_campaign","gwd_ref"].map(k=>target.searchParams.get(k)),["gwd","affiliate","stories-semana1",target.searchParams.get("utm_content")]);
 body=await (await call("/v1/public/referral/"+link.id,{},null,{"x-visitor-user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"})).json();assert.equal(body.recorded,true);
 let partner=await (await call("/v1/partner",undefined,member)).json();
 assert.equal(partner.links[0].clicks,1);assert.match(partner.code,/^[a-f0-9]{12}$/);assert.deepEqual([partner.sales,partner.accruals],[[],[]]);
 assert.equal((await call("/v1/public/referral/00000000-0000-4000-8000-000000000000",{},null,{"x-visitor-user-agent":"Mozilla/5.0"})).status,404);
 // RLS: another member sees nothing and cannot forge a link (no capability, no terms) even with direct SQL.
 partner=await (await call("/v1/partner",undefined,other)).json();assert.deepEqual([partner.links,partner.applications,partner.code],[[],[],null]);
 assert.equal(await tx(other,async c=>(await c.query("select 1 from gwd.referral_links")).rows.length),0);
 assert.equal(await tx(other,async c=>(await c.query("select 1 from gwd.referral_clicks")).rows.length),0);
 await assert.rejects(tx(other,async c=>c.query("insert into gwd.referral_links(participant_id,offer_slug) values($1,'conversion-content-os')",[other])));
 await assert.rejects(tx(other,async c=>c.query("insert into gwd.referral_links(participant_id,offer_slug) values($1,'conversion-content-os')",[member])));
 await assert.rejects(tx(member,async c=>c.query("insert into gwd.participant_capabilities values($1,'AUTHORIZED_SELLER')",[member])),"capabilities are not self-granted");
 await assert.rejects(tx(member,async c=>c.query("insert into gwd.accrual_ledger(participant_id,aro_order_id,event_key,amount_minor,currency) values($1,'x','x',100,'BRL')",[member])),"commissions are never app-written");
 // Order events (Novidades checkout webhook → GWD): closed without a secret; signed, fresh, idempotent; commission only
 // with operator terms; refund reverses the commission (append-only).
 const order=(e:Record<string,unknown>,opts:{secret?:string;ts?:number}={})=>{const raw=JSON.stringify(e),ts=String(opts.ts??Date.now());
  return handle(new Request("http://test/v1/integrations/novidades/order-events",{method:"POST",headers:{"Content-Type":"application/json","x-gwd-timestamp":ts,"x-gwd-signature":signOrderEvent(opts.secret??"s".repeat(40),ts,raw)},body:raw}));};
 const memberCode=(await (await call("/v1/partner",undefined,member)).json()).code;
 const sale={event_id:"evt-approved-0001",reference:"NVD-DIGITAL-CCOS-001-1-abcd",status:"approved",product_slug:"conversion-content-os",amount_minor:9700,currency:"BRL",gwd_ref:memberCode};
 assert.equal((await order(sale)).status,503,"integration closed without a secret");
 process.env.NOVIDADES_EVENTS_SECRET="s".repeat(40);
 assert.equal((await order(sale)).status,503,"orders migration pending");
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-26-partners-orders.sql",import.meta.url),"utf8"));
 assert.equal((await order(sale,{secret:"x".repeat(40)})).status,401);
 assert.equal((await order(sale,{ts:Date.now()-600_000})).status,401,"stale event");
 assert.deepEqual(await (await order(sale)).json(),{received:true,outcome:"attributed_no_commission_terms"},"no commission without terms");
 assert.deepEqual(await (await order(sale)).json(),{received:true,outcome:"duplicate"});
 assert.equal((await call("/v1/ops/offer-programs",{offerSlug:"conversion-content-os",kind:"AFFILIATE",status:"ACTIVE",conditions:"Condições de teste do piloto confirmadas.",commissionBps:2000,confirmationDays:7},operator)).status,200);
 const sale2={...sale,event_id:"evt-approved-0002",reference:"NVD-DIGITAL-CCOS-001-2-abcd"};
 assert.deepEqual(await (await order(sale2)).json(),{received:true,outcome:"attributed_pending_commission"});
 assert.deepEqual(await (await order({...sale2,event_id:"evt-other-0003",reference:"NVD-X-3",product_slug:"social-content-os"})).json(),{received:true,outcome:"unattributed"},"no link for this offer");
 assert.deepEqual(await (await order({...sale2,event_id:"evt-unknown-0004",reference:"NVD-X-4",gwd_ref:"zzzzzzzzzzzz"})).json(),{received:true,outcome:"unattributed"});
 let mine=await (await call("/v1/partner",undefined,member)).json();
 assert.deepEqual(mine.sales.map((s:{status:string})=>s.status).sort(),["APPROVED","APPROVED"]);
 assert.deepEqual(mine.accruals.map((a:{amount_minor:string|number;status:string})=>[Number(a.amount_minor),a.status]),[[1940,"PENDING"]]);
 assert.deepEqual(await (await order({...sale2,event_id:"evt-refund-0005",status:"refunded"})).json(),{received:true,outcome:"reversed"});
 mine=await (await call("/v1/partner",undefined,member)).json();
 assert.deepEqual(mine.accruals.map((a:{amount_minor:string|number;status:string})=>[Number(a.amount_minor),a.status]).sort(),[[-1940,"REVERSED"],[1940,"REVERSED"]]);
 assert.ok(mine.sales.some((s:{status:string})=>s.status==="REFUNDED"));
 assert.equal((await (await call("/v1/partner",undefined,other)).json()).accruals.length,0,"other members see nothing");
 delete process.env.NOVIDADES_EVENTS_SECRET;
 // Pausing the programme stops the redirect (no click, no destination).
 await call("/v1/ops/offer-programs",{offerSlug:"conversion-content-os",kind:"AFFILIATE",status:"PAUSED",conditions:""},operator);
 assert.equal((await call("/v1/public/referral/"+link.id,{},null,{"x-visitor-user-agent":"Mozilla/5.0"})).status,404);
 delete process.env.NOVIDADES_CATALOG_URL;delete process.env.GWD_WEB_URL;resetCatalogCache();
});
