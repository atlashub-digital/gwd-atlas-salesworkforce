import {test} from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {PGlite} from "@electric-sql/pglite";import type {PoolClient} from "pg";import {createHandler} from "../../apps/api/src/handler";
import type {transaction} from "../../packages/db/src/index";
import {seedStatements} from "../../packages/db/seed-academy";
/* Pilot P01 v3 (isolated test episode) on the seeded catalogue (real RLS in PGlite) + playback through the API.
 * The Atlas Media catalog is an EXPLICIT MOCK here: this proves the GWD side of the contract, not G4 real media. */
test("Academy media: isolated test episode visible only to preview accounts; playback sends S2S and fails closed",async context=>{
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;");
 await db.exec(await readFile(new URL("../../packages/db/schema.sql",import.meta.url),"utf8"));
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-20-academy-v1.sql",import.meta.url),"utf8"));
 await db.exec("revoke usage on schema auth from gwd_api");// production parity
 for(const statement of seedStatements())await db.exec(statement);
 const tester="00000000-0000-4000-8000-000000000001",member="00000000-0000-4000-8000-000000000002";
 await db.exec("alter table auth.users add column email text");
 await db.query("insert into auth.users values($1,'tester@example.com'),($2,'member@example.com')",[tester,member]);
 const emails:Record<string,string>={[tester]:"tester@example.com",[member]:"member@example.com"};
 const tx:typeof transaction=async(userId,run)=>{await db.exec("begin;set local role gwd_api;");try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);const result=await run(db as unknown as PoolClient);await db.exec("commit");return result;}catch(e){await db.exec("rollback");throw e;}};
 const handle=createHandler(tx,async token=>{if(!emails[token]&&token!=="no-email")throw new Error("UNAUTHORIZED");return {id:token==="no-email"?tester:token,email:token==="no-email"?undefined:emails[token]};});
 const call=async(route:string,body?:unknown,who=tester,method?:string)=>handle(new Request("http://test"+route,{method:method??(body?"POST":"GET"),headers:{"Content-Type":"application/json",Authorization:"Bearer "+who},...(body?{body:JSON.stringify(body)}:{})}));
 const env={...process.env};context.after(()=>{for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);});
 try{
  for(const who of [tester,member])assert.equal((await call("/v1/me",{name:"P",market:"BR",interest:"LEARNING",complete:true},who,"PATCH")).status,200);
  // Before the preview migration exists the API must keep working (to_regclass guard) and hide unpublished episodes.
  assert.equal((await call("/v1/academy/episodes/boas-vindas-gwd")).status,200);
  await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-23-academy-preview.sql",import.meta.url),"utf8"));
  const pilot=(await readFile(new URL("../../docs/rebuild/sql/pilot-p01-assets.sql",import.meta.url),"utf8")).replace(/^rollback;.*$/m,"commit;").replaceAll("<TEST_EMAIL_A>","Tester@Example.com").replaceAll("<TEST_EMAIL_B>","nobody@example.com");
  await db.exec(pilot);await db.exec(pilot);// applying twice must not duplicate rows nor publish the test episode
  const rows=(await db.query<{published:boolean;n:number}>("select e.published,(select count(*)::int from gwd.academy_episode_assets a where a.episode_id=e.id) n from gwd.academy_episodes e where e.slug='teste-media-p01'")).rows;
  assert.deepEqual(rows,[{published:false,n:1}]);
  // Real course episodes untouched: still the demo video, so they never call the catalog.
  assert.deepEqual((await db.query("select asset_ref from gwd.academy_episode_assets a join gwd.academy_episodes e on e.id=a.episode_id where e.slug='boas-vindas-gwd' and a.kind='VIDEO'")).rows,[{asset_ref:"demo-video-boas-vindas-gwd"}]);
  // Never listed, for anyone.
  const {series}=await (await call("/v1/academy/series/gwd-start")).json();
  assert.ok(!series.episodes.some((e:{slug:string})=>e.slug==="teste-media-p01"));
  // Only the listed test participant opens it; RLS enforces it even on direct queries.
  assert.equal((await call("/v1/academy/episodes/teste-media-p01",undefined,member)).status,404);
  assert.equal((await call("/v1/academy/episodes/teste-media-p01/playback",{},member)).status,404);
  assert.equal(await tx(member,async c=>(await c.query("select 1 from gwd.academy_episodes where slug='teste-media-p01'")).rows.length),0);
  assert.equal(await tx(member,async c=>(await c.query("select 1 from gwd.academy_episode_assets where asset_ref='01K5D8HGF18YCW2KO6VW'")).rows.length),0);
  await assert.rejects(tx(member,c=>c.query("insert into gwd.academy_preview_participants(participant_id) values($1)",[member])),/permission denied/);
  const detail=await (await call("/v1/academy/episodes/teste-media-p01")).json();
  assert.deepEqual(detail.episode.assets.filter((a:{kind:string})=>a.kind==="video").map((a:{assetId:string})=>a.assetId),["01K5D8HGF18YCW2KO6VW"]);
  // Playback: not configured → fail closed; configured → S2S header + exact catalog request.
  for(const k of ["ATLAS_MEDIA_TOKEN_URL","ATLAS_MEDIA_GATEWAY_URL","ATLAS_MEDIA_ARO_PROJECT","ATLAS_MEDIA_S2S_SECRET"])delete process.env[k];
  assert.equal((await (await call("/v1/academy/episodes/teste-media-p01/playback",{})).json()).code,"MEDIA_UNAVAILABLE");
  Object.assign(process.env,{ATLAS_MEDIA_TOKEN_URL:"http://catalog.mock.invalid/token",ATLAS_MEDIA_GATEWAY_URL:"https://media.mock.invalid",ATLAS_MEDIA_ARO_PROJECT:"gwd",ATLAS_MEDIA_S2S_SECRET:"s2s-test"});
  let seen:{headers?:Headers;body?:Record<string,unknown>}={},reply=()=>Response.json({token:"h.p.s",expires_at:1,url:"/media/gwd/01K5D8HGF18YCW2KO6VW/master.m3u8"});
  context.mock.method(globalThis,"fetch",async(_url:unknown,init?:RequestInit)=>{seen={headers:new Headers(init?.headers),body:JSON.parse(String(init?.body))};return reply();});
  const ok=await (await call("/v1/academy/episodes/teste-media-p01/playback",{})).json();
  assert.equal(ok.manifest_url,"https://media.mock.invalid/media/gwd/01K5D8HGF18YCW2KO6VW/master.m3u8?t=h.p.s");
  assert.equal(seen.headers?.get("x-atlas-media-s2s"),"s2s-test");
  assert.deepEqual(seen.body,{tenant:"gwd",asset_id:"01K5D8HGF18YCW2KO6VW",entitlement_ref:"gwd.academy.series:gwd-start",aro:{project:"gwd",identity:{email:"tester@example.com"}}});
  assert.ok(!JSON.stringify(ok).includes("s2s-test"));
  reply=()=>new Response('{"error":"s2s_unauthorized"}',{status:401});
  assert.equal((await (await call("/v1/academy/episodes/teste-media-p01/playback",{})).json()).code,"MEDIA_UNAVAILABLE");
  reply=()=>new Response('{"error":"entitlement_denied"}',{status:403});
  assert.equal((await call("/v1/academy/episodes/teste-media-p01/playback",{})).status,403);
  let called=false;reply=()=>{called=true;return Response.json({});};
  assert.equal((await (await call("/v1/academy/episodes/boas-vindas-gwd/playback",{})).json()).code,"MEDIA_NOT_LINKED");assert.equal(called,false);
 }finally{await db.close();}
});
