import {test} from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {PGlite} from "@electric-sql/pglite";import type {PoolClient} from "pg";import {createHandler} from "../../apps/api/src/handler";
import type {transaction} from "../../packages/db/src/index";
test("persisted Lead → Auth identity → Participant → Onboarding → Journey → Community → Points with RLS",async()=>{
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;");
 await db.exec(await readFile(new URL("../../packages/db/schema.sql",import.meta.url),"utf8"));
 const a="00000000-0000-4000-8000-000000000001",b="00000000-0000-4000-8000-000000000002";
 await db.query("insert into auth.users values($1),($2)",[a,b]);
 const tx:typeof transaction=async(userId,run)=>{await db.exec("begin;set local role gwd_api;");try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);const result=await run(db as unknown as PoolClient);await db.exec("commit");return result;}catch(e){await db.exec("rollback");throw e;}};
 const handle=createHandler(tx,async token=>{if(token!==a&&token!==b)throw new Error("UNAUTHORIZED");return {id:token,email:token===a?"participant@example.com":"other@example.com"};});
 async function call(route:string,body?:unknown,id:string|null=a,method?:string){return handle(new Request("http://test"+route,{method:method??(body?"POST":"GET"),headers:{"Content-Type":"application/json",...(id?{Authorization:"Bearer "+id}:{})},...(body?{body:JSON.stringify(body)}:{})}));}
 try{
 assert.equal((await call("/v1/me",undefined,null)).status,401);
 assert.equal((await call("/v1/me",undefined,"forged")).status,401);
 assert.equal((await call("/v1/leads",{name:"Participant",email:"participant@example.com",market:"BR",interest:"LEARNING",consent:false},null)).status,400);
 assert.equal((await call("/v1/leads",{name:"Participant",email:"participant@example.com",market:"BR",interest:"LEARNING",consent:true,utm_source:"instagram"},null)).status,201);
 assert.equal((await db.query<{total:number}>("select count(*)::int as total from gwd.leads")).rows[0].total,1);
 assert.equal((await call("/v1/me")).status,200);
 assert.equal((await call("/v1/journeys")).status,409);
 assert.equal((await call("/v1/me",{name:"Participant",market:"BR",interest:"AFFILIATE",complete:true,capabilities:["AUTHORIZED_SELLER"]},a,"PATCH")).status,200);
 const me=await (await call("/v1/me")).json();assert.ok(me.participant.lead_id);assert.deepEqual(me.capabilities.sort(),["COMMUNITY","LEARNING"]);
 assert.equal((await call("/v1/journeys/gwd-start/progress",{stepId:"learn"})).status,400);
 assert.equal((await call("/v1/journeys/gwd-start/progress",{stepId:"unknown"})).status,400);
 for(const stepId of ["welcome","welcome","learn","community","explore"])assert.equal((await call("/v1/journeys/gwd-start/progress",{stepId,points:99999})).status,200);
 const points=await (await call("/v1/gamification/summary")).json();assert.equal(points.points,40);assert.equal(points.events.length,4);
 assert.equal((await (await call("/v1/journeys")).json()).completed.length,4);
 assert.equal((await (await call("/v1/academy")).json()).items.length,3);
 assert.equal((await call("/v1/community",{acceptRules:false})).status,400);
 assert.equal((await call("/v1/community",{acceptRules:true})).status,200);
 assert.equal((await (await call("/v1/community")).json()).member,true);
 assert.deepEqual((await (await call("/v1/opportunities")).json()).items,[]);
 await call("/v1/me",{name:"Other",market:"EU",interest:"LEARNING",complete:true},b,"PATCH");
 assert.equal((await (await call("/v1/gamification/summary",undefined,b)).json()).points,0);
 await tx(b,async c=>{assert.equal((await c.query("select * from gwd.participants where id=$1",[a])).rows.length,0);assert.equal((await c.query("select * from gwd.points_events where participant_id=$1",[a])).rows.length,0);});
 await assert.rejects(tx(b,c=>c.query("insert into gwd.points_events(participant_id,event_key,points) values($1,'forged',99)",[a])),/row-level security/);
 await assert.rejects(tx(a,c=>c.query("select * from gwd.accrual_ledger")),/permission denied/);
 assert.equal((await call("/v1/payouts",{})).status,404);
 assert.equal((await call("/v1/aro/events",{})).status,404);
 assert.ok(Number((await db.query<{total:string}>("select count(*) as total from gwd.audit_events")).rows[0].total)>0);
 }finally{await db.close();}
});
