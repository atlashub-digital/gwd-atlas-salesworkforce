import {test} from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {PGlite} from "@electric-sql/pglite";import type {PoolClient} from "pg";import {createHandler} from "../../apps/api/src/handler";
import type {transaction} from "../../packages/db/src/index";
/* Leads V2 with real RLS (PGlite, production permission parity): campaign lead → sign-in email → newsletter consent →
 * unsubscribe by token → operator-only aggregate funnel. The sign-in email is a stub here (Supabase is proven in production). */
test("Leads V2: campaign attribution, sign-in email, newsletter consent/unsubscribe, operator funnel",async()=>{
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;");
 await db.exec(await readFile(new URL("../../packages/db/schema.sql",import.meta.url),"utf8"));
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-20-academy-v1.sql",import.meta.url),"utf8"));
 await db.exec("revoke usage on schema auth from gwd_api");// production parity
 const member="00000000-0000-4000-8000-000000000001",operator="00000000-0000-4000-8000-000000000002";
 await db.query("insert into auth.users values($1),($2)",[member,operator]);
 const tx:typeof transaction=async(userId,run)=>{await db.exec("begin;set local role gwd_api;");try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);const result=await run(db as unknown as PoolClient);await db.exec("commit");return result;}catch(e){await db.exec("rollback");throw e;}};
 const sent:string[]=[];
 const handle=createHandler(tx,async token=>{if(token!==member&&token!==operator)throw new Error("UNAUTHORIZED");return {id:token,email:token===member?"lead@example.com":"ops@example.com"};},async email=>{sent.push(email);return email.startsWith("limit")?"rate_limited":"sent";});
 const call=async(route:string,body?:unknown,id:string|null=null,method?:string)=>handle(new Request("http://test"+route,{method:method??(body?"POST":"GET"),headers:{"Content-Type":"application/json",...(id?{Authorization:"Bearer "+id}:{})},...(body?{body:JSON.stringify(body)}:{})}));
 const lead={name:"Lead Real",email:"Lead@Example.com",market:"BR",interest:"SOCIAL_MEDIA",consent:true,source:"instagram",utm_source:"instagram",utm_medium:"social",utm_campaign:"gwd-start-out26",newsletter:true,landing_path:"/?utm_campaign=x",referrer_host:"l.instagram.com"};
 try{
  // Before the migration: leads keep working (legacy columns) and the sign-in email is still sent.
  let r=await call("/v1/leads",{...lead,email:"early@example.com"});
  assert.equal(r.status,201);assert.deepEqual(await r.json(),{accepted:true,created:true,email:"sent"});
  assert.equal((await call("/v1/leads/unsubscribe",{token:"00000000-0000-4000-8000-000000000000"})).status,503);
  await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-24-leads-v2.sql",import.meta.url),"utf8"));
  r=await call("/v1/leads",lead);
  assert.deepEqual(await r.json(),{accepted:true,created:true,email:"sent"});
  assert.deepEqual(sent,["early@example.com","lead@example.com"]);
  const row=(await db.query<{utm:Record<string,string>;news:boolean;landing_path:string;referrer_host:string;source:string;token:string}>("select utm,marketing_consent_at is not null as news,landing_path,referrer_host,source,unsubscribe_token::text as token from gwd.leads where email='lead@example.com'")).rows[0];
  assert.deepEqual([row.utm.utm_campaign,row.news,row.landing_path,row.referrer_host,row.source],["gwd-start-out26",true,"/?utm_campaign=x","l.instagram.com","instagram"]);
  // Repeated lead: not duplicated, but gets the sign-in email again (the way back in); rate limit reported, not thrown.
  assert.deepEqual(await (await call("/v1/leads",lead)).json(),{accepted:true,created:false,email:"sent"});
  assert.deepEqual(await (await call("/v1/leads",{...lead,email:"limit@example.com",newsletter:false})).json(),{accepted:true,created:true,email:"rate_limited"});
  assert.equal((await db.query<{n:number}>("select count(*)::int n from gwd.leads")).rows[0].n,3);
  // Invalid attribution is dropped, never stored.
  await call("/v1/leads",{...lead,email:"bad@example.com",landing_path:"javascript:alert(1)",referrer_host:"evil host/<x>"});
  assert.deepEqual((await db.query("select landing_path,referrer_host from gwd.leads where email='bad@example.com'")).rows,[{landing_path:null,referrer_host:null}]);
  // The API role cannot read other leads (no PII leaks through the API).
  assert.equal(await tx(null,async c=>(await c.query("select 1 from gwd.leads")).rows.length),0);
  // Unsubscribe by opaque token: idempotent; unknown token → false; malformed → 400.
  assert.deepEqual(await (await call("/v1/leads/unsubscribe",{token:row.token})).json(),{unsubscribed:true});
  assert.deepEqual(await (await call("/v1/leads/unsubscribe",{token:row.token})).json(),{unsubscribed:true});
  assert.deepEqual(await (await call("/v1/leads/unsubscribe",{token:"00000000-0000-4000-8000-000000000000"})).json(),{unsubscribed:false});
  assert.equal((await call("/v1/leads/unsubscribe",{token:"x' or 1=1"})).status,400);
  // Before onboarding, the verified lead's answers are offered as defaults (and only to that email).
  assert.deepEqual((await (await call("/v1/me",undefined,member)).json()).lead,{name:"Lead Real",market:"BR",interest:"SOCIAL_MEDIA"});
  assert.equal((await (await call("/v1/me",undefined,operator)).json()).lead,null);
  // Lead → participant attribution through onboarding (verified email claim).
  assert.equal((await call("/v1/me",{name:"Lead Real",market:"BR",interest:"SOCIAL_MEDIA",complete:true},member,"PATCH")).status,200);
  assert.equal((await call("/v1/me",{name:"Ops",market:"EU",interest:"LEARNING",complete:true},operator,"PATCH")).status,200);
  // Funnel: operators only; aggregates only.
  assert.equal((await call("/v1/ops/funnel",undefined,member)).status,403);
  await db.query("insert into gwd.operators(participant_id,note) values($1,'test')",[operator]);
  const funnel=await (await call("/v1/ops/funnel?days=7",undefined,operator)).json();
  const camp=funnel.rows.filter((x:{campaign:string;source:string})=>x.campaign==="gwd-start-out26"&&x.source==="instagram");
  const sum=(k:string)=>camp.reduce((a:number,x:Record<string,string|number>)=>a+Number(x[k]),0);
  assert.deepEqual([sum("leads"),sum("newsletter"),sum("unsubscribed"),sum("participants"),sum("onboarded")],[4,1,1,1,1]);
  assert.ok(!JSON.stringify(funnel).includes("@example.com"),"no emails in the funnel");
  // Nobody can grant themselves operator through the API role.
  await assert.rejects(tx(member,c=>c.query("insert into gwd.operators(participant_id) values($1)",[member])),/permission denied/);
 }finally{await db.close();}
});
