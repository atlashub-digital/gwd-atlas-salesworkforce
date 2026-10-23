import {test} from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {PGlite} from "@electric-sql/pglite";import type {PoolClient} from "pg";import {createHandler} from "../../apps/api/src/handler";
import type {transaction} from "../../packages/db/src/index";
import {seedStatements} from "../../packages/db/seed-academy";
/* Pilot P01 v2 SQL on the seeded catalogue (real RLS in PGlite) + playback through the API.
 * The Atlas Media catalog is an EXPLICIT MOCK here: this proves the GWD side of the contract, not G4 real media. */
test("Academy media: pilot P01 links one active real video per episode; playback sends S2S and fails closed",async context=>{
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;");
 await db.exec(await readFile(new URL("../../packages/db/schema.sql",import.meta.url),"utf8"));
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-20-academy-v1.sql",import.meta.url),"utf8"));
 for(const statement of seedStatements())await db.exec(statement);
 const pilot=(await readFile(new URL("../../docs/rebuild/sql/pilot-p01-assets.sql",import.meta.url),"utf8")).replace(/^rollback;.*$/m,"commit;");
 await db.exec(pilot);await db.exec(pilot);// applying twice must not duplicate rows nor reactivate demo videos
 const id="00000000-0000-4000-8000-000000000001";await db.query("insert into auth.users values($1)",[id]);
 let email="free@example.com";
 const tx:typeof transaction=async(userId,run)=>{await db.exec("begin;set local role gwd_api;");try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);const result=await run(db as unknown as PoolClient);await db.exec("commit");return result;}catch(e){await db.exec("rollback");throw e;}};
 const handle=createHandler(tx,async token=>{if(token!==id)throw new Error("UNAUTHORIZED");return {id,email};});
 const call=async(route:string,body?:unknown)=>handle(new Request("http://test"+route,{method:body?"POST":"GET",headers:{"Content-Type":"application/json",Authorization:"Bearer "+id},...(body?{body:JSON.stringify(body)}:{})}));
 const env={...process.env};context.after(()=>{for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);});
 try{
  assert.equal((await call("/v1/me",undefined)).status,200);
  await handle(new Request("http://test/v1/me",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+id},body:JSON.stringify({name:"Free",market:"BR",interest:"LEARNING",complete:true})}));
  const active=(await db.query<{slug:string;asset_ref:string}>("select e.slug,a.asset_ref from gwd.academy_episode_assets a join gwd.academy_episodes e on e.id=a.episode_id where a.kind='VIDEO' and a.superseded_at is null and e.slug in ('boas-vindas-gwd','tres-caminhos','rotina-de-aprendizagem') order by 1")).rows;
  assert.deepEqual(active,[{slug:"boas-vindas-gwd",asset_ref:"01K5D8HGF18YCW2KO6VW"},{slug:"rotina-de-aprendizagem",asset_ref:"01K5DB09D7WTZIGIIJX1G"},{slug:"tres-caminhos",asset_ref:"01K5DB09D1XJY0H2O3HU"}]);
  const {series}=await (await call("/v1/academy/series/gwd-start")).json();
  const welcome=series.episodes.find((e:{slug:string})=>e.slug==="boas-vindas-gwd");
  assert.deepEqual(welcome.assets.filter((a:{kind:string})=>a.kind==="video").map((a:{assetId:string})=>a.assetId),["01K5D8HGF18YCW2KO6VW"]);
  // Not configured → fail closed.
  for(const k of ["ATLAS_MEDIA_TOKEN_URL","ATLAS_MEDIA_GATEWAY_URL","ATLAS_MEDIA_ARO_PROJECT","ATLAS_MEDIA_S2S_SECRET"])delete process.env[k];
  assert.equal((await (await call("/v1/academy/episodes/boas-vindas-gwd/playback",{})).json()).code,"MEDIA_UNAVAILABLE");
  Object.assign(process.env,{ATLAS_MEDIA_TOKEN_URL:"http://catalog.mock.invalid/token",ATLAS_MEDIA_GATEWAY_URL:"https://media.mock.invalid",ATLAS_MEDIA_ARO_PROJECT:"gwd",ATLAS_MEDIA_S2S_SECRET:"s2s-test"});
  let seen:{headers?:Headers;body?:Record<string,unknown>}={},reply=()=>Response.json({token:"h.p.s",expires_at:1,url:"/media/gwd/01K5D8HGF18YCW2KO6VW/master.m3u8"});
  context.mock.method(globalThis,"fetch",async(_url:unknown,init?:RequestInit)=>{seen={headers:new Headers(init?.headers),body:JSON.parse(String(init?.body))};return reply();});
  const ok=await (await call("/v1/academy/episodes/boas-vindas-gwd/playback",{})).json();
  assert.equal(ok.manifest_url,"https://media.mock.invalid/media/gwd/01K5D8HGF18YCW2KO6VW/master.m3u8?t=h.p.s");
  assert.equal(seen.headers?.get("x-atlas-media-s2s"),"s2s-test");
  assert.deepEqual(seen.body,{tenant:"gwd",asset_id:"01K5D8HGF18YCW2KO6VW",entitlement_ref:"gwd.academy.series:gwd-start",aro:{project:"gwd",identity:{email:"free@example.com"}}});
  assert.ok(!JSON.stringify(ok).includes("s2s-test"));
  reply=()=>new Response('{"error":"s2s_unauthorized"}',{status:401});
  assert.equal((await (await call("/v1/academy/episodes/boas-vindas-gwd/playback",{})).json()).code,"MEDIA_UNAVAILABLE");
  reply=()=>new Response('{"error":"entitlement_denied"}',{status:403});
  assert.equal((await call("/v1/academy/episodes/boas-vindas-gwd/playback",{})).status,403);
  // Episodes still on the demo catalogue never call the catalog.
  let called=false;reply=()=>{called=true;return Response.json({});};
  assert.equal((await (await call("/v1/academy/episodes/mensagem-clara/playback",{})).json()).code,"MEDIA_NOT_LINKED");assert.equal(called,false);
  // Without a server-confirmed email no token is requested.
  email="";assert.equal((await (await call("/v1/academy/episodes/boas-vindas-gwd/playback",{})).json()).code,"IDENTITY_REQUIRED");
 }finally{await db.close();}
});
