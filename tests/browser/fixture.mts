import {createServer} from "node:http";
import {PGlite} from "@electric-sql/pglite";
import {readFile} from "node:fs/promises";
import type {PoolClient} from "pg";
import {createHandler} from "../../apps/api/src/handler";
import type {transaction} from "../../packages/db/src/index";
import {seedStatements} from "../../packages/db/seed-academy";
const db=new PGlite();
await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;");
await db.exec(await readFile("packages/db/schema.sql","utf8"));
// Academy Streaming V1 tables + demo catalogue seed, into this throwaway PGlite only.
for(const f of ["2026-10-20-academy-v1.sql","2026-10-23-community-v1.sql","2026-10-23-community-v1-fix-claim.sql","2026-10-24-leads-v2.sql","2026-10-25-partners-v1.sql"])await db.exec(await readFile("packages/db/migrations/"+f,"utf8"));
await db.exec("revoke usage on schema auth from gwd_api");// production parity
for(const statement of seedStatements({includeDemo:true}))await db.exec(statement);
const id="00000000-0000-4000-8000-000000000099";
await db.query("insert into auth.users values($1)",[id]);
const tx:typeof transaction=async(uid,run)=>db.transaction(async c=>{await c.exec("set local role gwd_api");await c.query("select set_config('request.jwt.claim.sub',$1,true)",[uid??""]);await c.query("select set_config('request.jwt.claim.email',$1,true)",[uid?"browser@example.com":""]);return run(c as unknown as PoolClient);});
// Novidades.Store catalogue stub (same shape as the store's public /api/catalog), served by the auth stub below.
process.env.NOVIDADES_CATALOG_URL="http://localhost:3139/novidades/catalog";process.env.GWD_WEB_URL="http://localhost:3000";process.env.NOVIDADES_ASSET_ORIGIN="http://localhost:3139";
process.env.SUPABASE_URL="http://localhost:3139";process.env.SUPABASE_PUBLISHABLE_KEY="test-publishable";
const handle=createHandler(tx);
const api=createServer(async(req,res)=>{const parts:Buffer[]=[];for await(const chunk of req)parts.push(Buffer.from(chunk));const data=Buffer.concat(parts);const response=await handle(new Request("http://test"+req.url,{method:req.method,headers:req.headers as Record<string,string>,...(data.length?{body:new Uint8Array(data)}:{})}));res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());});
const auth=createServer(async(req,res)=>{const parts:Buffer[]=[];for await(const chunk of req)parts.push(Buffer.from(chunk));const body=JSON.parse(Buffer.concat(parts).toString()||"{}");res.setHeader("Content-Type","application/json");
if(req.url==="/auth/v1/user"&&req.headers.authorization==="Bearer browser-test-access"){res.end(JSON.stringify({id,email:"browser@example.com",email_confirmed_at:"2026-10-18T00:00:00Z"}));return;}
if(req.url?.startsWith("/images/products/")){res.setHeader("Content-Type","image/svg+xml");res.end('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#0a315c"/></svg>');return;}
if(req.url==="/novidades/catalog"){res.end(JSON.stringify({success:true,data:[
 {slug:"conversion-content-os",title:"Conversion Content OS",subtitle:"Sistema prático de conteúdo, persuasão e conversão.",description:"Guia, workbook, Hook Library, Prompt Library, swipe files e matriz de reaproveitamento.",categorySlug:"conteudos-digitais",categoryName:"Academia Digital",image:"/images/products/conversion-content-os.svg",funnelUrl:"https://novidades.store/conteudos-digitais/conversion-content-os",priceCents:9700,currency:"BRL",fulfillmentType:"digital"},
 {slug:"social-content-os",title:"Social Content OS",subtitle:"30/60/90-day planner, channel adaptation e creative briefs.",description:"Sistema multicanal com Content Planner, repurposing, creative briefs e learning loop.",categorySlug:"conteudos-digitais",categoryName:"Academia Digital",image:"/images/products/social-content-os.svg",funnelUrl:"https://novidades.store/conteudos-digitais/social-content-os",priceCents:4700,currency:"BRL",fulfillmentType:"digital"},
 {slug:"signum-312",title:"SIGNUM 312",subtitle:"Fé. Coragem. Propósito.",description:"Coleção contemporânea.",categorySlug:"arte-e-vida",categoryName:"Medalhas & Terços",image:"/images/products/signum-patina-real.webp",funnelUrl:"https://signum312.novidades.store",priceCents:9990,currency:"BRL",fulfillmentType:"physical"},
 {slug:"evil",title:"Open redirect attempt",funnelUrl:"https://evil.example/phish",priceCents:1,currency:"BRL"}]}));return;}
if(req.url?.startsWith("/auth/v1/otp")){res.end("{}");return;}
if(req.url==="/auth/v1/verify"&&body.token==="123456"){res.end(JSON.stringify({access_token:"browser-test-access",refresh_token:"browser-test-refresh",expires_in:3600}));return;}
if(req.url==="/auth/v1/logout"){res.end("{}");return;}
res.writeHead(401);res.end("{}");});
api.listen(3138,()=>console.log("TEST API on 3138 - isolated PGlite, commercial OFF"));
auth.listen(3139,()=>console.log("TEST Auth on 3139 - local stub only, no email sent"));
// Explicit ready signal for CI
console.log("FIXTURE_READY");
