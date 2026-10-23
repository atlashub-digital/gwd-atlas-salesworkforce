import {test} from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {PGlite} from "@electric-sql/pglite";import type {PoolClient} from "pg";import {createHandler} from "../../apps/api/src/handler";
import type {transaction} from "../../packages/db/src/index";
test("Community V1: rules gate, posts/replies, capability spaces, remove, reports hide, rate limit, RLS negatives",async()=>{
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;");
 await db.exec(await readFile(new URL("../../packages/db/schema.sql",import.meta.url),"utf8"));
 await db.exec(await readFile(new URL("../../packages/db/migrations/2026-10-23-community-v1.sql",import.meta.url),"utf8"));
 const ids=["01","02","03","04","05"].map(n=>`00000000-0000-4000-8000-0000000000${n}`),[a,b,c3,d,e]=ids;
 for(const id of ids)await db.query("insert into auth.users values($1)",[id]);
 const tx:typeof transaction=async(userId,run)=>{await db.exec("begin;set local role gwd_api;");try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);const result=await run(db as unknown as PoolClient);await db.exec("commit");return result;}catch(err){await db.exec("rollback");throw err;}};
 const handle=createHandler(tx,async token=>{if(!ids.includes(token))throw new Error("UNAUTHORIZED");return {id:token};});
 async function call(route:string,body?:unknown,id:string=a){return handle(new Request("http://test"+route,{method:body?"POST":"GET",headers:{"Content-Type":"application/json",Authorization:"Bearer "+id},...(body?{body:JSON.stringify(body)}:{})}));}
 try{
  for(const [i,id] of ids.entries())assert.equal((await handle(new Request("http://test/v1/me",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+id},body:JSON.stringify({name:"Pessoa "+(i+1),market:"BR",interest:"LEARNING",complete:true})}))).status,200);
  // Rules not accepted yet → no spaces, posting forbidden.
  assert.deepEqual(await (await call("/v1/community/spaces")).json(),{items:[],member:false});
  assert.equal((await call("/v1/community/spaces/geral/posts")).status,403);
  assert.equal((await call("/v1/community/spaces/geral/posts",{body:"Olá a todos"})).status,403);
  for(const id of ids)assert.equal((await call("/v1/community",{acceptRules:true},id)).status,200);
  // Capability space exists but only for MENTOR holders.
  await db.query("insert into gwd.community_spaces(id,title,required_capability,position) values('mentores','Mentores','MENTOR',90)");
  const spaces=(await (await call("/v1/community/spaces")).json()).items.map((s:{id:string})=>s.id);
  assert.deepEqual(spaces,["geral","apresentacoes","academy"]);
  assert.equal((await call("/v1/community/spaces/mentores/posts")).status,403);
  assert.equal((await call("/v1/community/spaces/inexistente/posts")).status,403);
  // Post, validation, reply.
  assert.equal((await call("/v1/community/spaces/geral/posts",{body:" "})).status,400);
  assert.equal((await call("/v1/community/spaces/geral/posts",{body:"x".repeat(2001)})).status,400);
  const created=await call("/v1/community/spaces/geral/posts",{body:"Olá, comunidade! Primeira partilha.",authorName:"Forjado"});assert.equal(created.status,201);
  const post=(await created.json()).item;assert.equal(post.authorName,"Pessoa 1");assert.equal(post.own,true);
  assert.equal((await call("/v1/community/spaces/geral/posts",{body:"Bem-vinda!",parentId:post.id},b)).status,201);
  assert.equal((await call("/v1/community/spaces/apresentacoes/posts",{body:"Resposta noutro espaço",parentId:post.id},b)).status,400);
  const feed=(await (await call("/v1/community/spaces/geral/posts",undefined,b)).json()).items;
  assert.equal(feed.length,1);assert.equal(feed[0].own,false);assert.equal(feed[0].replies.length,1);assert.equal(feed[0].replies[0].authorName,"Pessoa 2");
  const replyId=feed[0].replies[0].id;
  assert.equal((await call("/v1/community/spaces/geral/posts",{body:"Resposta a resposta",parentId:replyId},c3)).status,400);
  // Only the author removes; nobody reports their own post.
  assert.equal((await call(`/v1/community/posts/${post.id}/remove`,{},b)).status,403);
  assert.equal((await call(`/v1/community/posts/${post.id}/report`,{reason:"SPAM"},a)).status,400);
  assert.equal((await call(`/v1/community/posts/${replyId}/remove`,{},b)).status,200);
  assert.equal((await (await call("/v1/community/spaces/geral/posts",undefined,c3)).json()).items[0].replies.length,0);
  // Three distinct reports hide the post for everyone except its author.
  for(const id of [b,c3])assert.equal((await call(`/v1/community/posts/${post.id}/report`,{reason:"SPAM"},id)).status,200);
  assert.equal((await call(`/v1/community/posts/${post.id}/report`,{reason:"SPAM"},b)).status,200);
  assert.equal((await (await call("/v1/community/spaces/geral/posts",undefined,e)).json()).items.length,1);
  assert.equal((await call(`/v1/community/posts/${post.id}/report`,{reason:"INVENTADO"},d)).status,400);
  assert.equal((await call(`/v1/community/posts/${post.id}/report`,{reason:"RESPEITO"},d)).status,200);
  assert.equal((await (await call("/v1/community/spaces/geral/posts",undefined,e)).json()).items.length,0);
  assert.equal((await (await call("/v1/community/spaces/geral/posts",undefined,a)).json()).items[0].state,"HIDDEN");
  // Rate limit: 10 posts per author per hour (2 already today for A? only 1) → 9 more succeed, then 429.
  for(let i=0;i<9;i++)assert.equal((await call("/v1/community/spaces/academy/posts",{body:"Dúvida número "+i})).status,201);
  assert.equal((await call("/v1/community/spaces/academy/posts",{body:"Mais uma"})).status,429);
  // RLS negatives straight on the DB role the API uses.
  await assert.rejects(tx(b,c=>c.query("insert into gwd.community_posts(space_id,author_id,author_name,body) values('geral',$1,'X','forjado')",[a])),/row-level security/);
  await assert.rejects(tx(a,c=>c.query("update gwd.community_posts set hidden_at=null where id=$1",[post.id])),/permission denied/);
  await assert.rejects(tx(b,c=>c.query("insert into gwd.community_posts(space_id,author_id,author_name,body) values('mentores',$1,'X','sem capacidade')",[b])),/row-level security/);
  await tx(b,c=>c.query("update gwd.community_posts set removed_at=now() where author_id=$1",[a]));
  assert.equal((await db.query<{n:number}>("select count(*)::int n from gwd.community_posts where author_id=$1 and removed_at is not null",[a])).rows[0].n,0);
  assert.equal(await tx(e,async c=>(await c.query("select * from gwd.community_reports")).rows.length),0);
  // Mentor capability (granted by an operator, never by XP) opens the mentor space.
  await db.query("insert into gwd.participant_capabilities values($1,'MENTOR')",[e]);
  assert.equal((await call("/v1/community/spaces/mentores/posts",{body:"Espaço de mentores ativo."},e)).status,201);
  assert.equal((await (await call("/v1/community/spaces/mentores/posts",undefined,d)).json()).code,"COMMUNITY_FORBIDDEN");
  // Posting never awards points.
  assert.equal((await (await call("/v1/gamification/summary")).json()).points,0);
 }finally{await db.close();}
});
