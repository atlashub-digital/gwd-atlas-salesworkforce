import { flags } from "@gwd/config";
import { InputError, leadInput, object, profileInput, text, uuid } from "@gwd/contracts";
import { academy, starterSteps, validStep } from "@gwd/domain";
import { AcademyError, academyRoute, publicAcademyRoute } from "./academy";
import { transaction } from "@gwd/db";
import type { PoolClient } from "pg";
type Tx = typeof transaction;
type User = {id:string;email?:string};
export async function verifyToken(token:string):Promise<User> {
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error("AUTH_UNAVAILABLE");
 const response=await fetch(new URL("/auth/v1/user",url),{headers:{apikey:key,Authorization:"Bearer "+token},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error("UNAUTHORIZED");
 const user=await response.json();uuid(user.id);
 // Only a server-confirmed email may claim an acquisition lead.
 return {id:user.id,email:user.email_confirmed_at?user.email:undefined};
}
export function createHandler(tx:Tx=transaction,auth=verifyToken) {
 return async function handle(request:Request):Promise<Response> {
 const url=new URL(request.url),route=url.pathname,method=request.method;
 const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
 try {
  if(route==="/health") return json({status:"ok",service:"gwd-api",commerce:"OFF"});
  if(route==="/ready") {await tx(null,async c=>c.query("select id from gwd.journeys limit 1"));return json({status:"ready"});}
  if(route==="/v1/feature-flags"&&method==="GET")return json(flags);
  if(route==="/v1/leads"&&method==="POST") {
   const body=object(await request.json());if(body.website)throw new InputError("Pedido inválido.");
   const input=leadInput(body);
   await tx(null,async c=>{await c.query("insert into gwd.leads(name,email,market,interest,source,utm) values($1,$2,$3,$4,$5,$6) on conflict do nothing",[input.name,input.email,input.market,input.interest,input.source,JSON.stringify(input.utm)]);});
   return json({accepted:true},201);
  }
  const publicAcademy=await publicAcademyRoute(route,method,tx);
  if(publicAcademy)return publicAcademy;
  const bearer=request.headers.get("authorization");
  if(!bearer?.startsWith("Bearer "))return json({error:"Inicia sessão para continuar."},401);
  const user=await auth(bearer.slice(7));uuid(user.id);
  return await tx(user.id,async c=>{
   await c.query("select set_config('request.jwt.claim.email',$1,true)",[user.email?.toLowerCase()??""]);
   if(route==="/v1/me"&&method==="GET") {
    const result=await c.query("select * from gwd.participants where id=$1",[user.id]);
    if(!result.rows.length)return json({participant:null,email:user.email});
    const caps=await c.query("select capability from gwd.participant_capabilities where participant_id=$1",[user.id]);
    return json({participant:result.rows[0],capabilities:caps.rows.map(r=>r.capability),email:user.email});
   }
   if(route==="/v1/me"&&method==="PATCH") {
    const input=profileInput(await request.json());
    const result=await c.query("insert into gwd.participants(id,display_name,market,interest,onboarding_completed,lead_id) values($1,$2,$3,$4,$5,(select id from gwd.leads where email=current_setting('request.jwt.claim.email',true) order by created_at desc limit 1)) on conflict(id) do update set display_name=excluded.display_name,market=excluded.market,interest=excluded.interest,onboarding_completed=gwd.participants.onboarding_completed or excluded.onboarding_completed returning *",[user.id,input.name,input.market,input.interest,input.complete]);
    for(const cap of ["COMMUNITY","LEARNING"])await c.query("insert into gwd.participant_capabilities values($1,$2) on conflict do nothing",[user.id,cap]);
    await c.query("insert into gwd.agent_bindings(participant_id) values($1) on conflict do nothing",[user.id]);
    await audit(c,user.id,"profile.updated");
    return json({participant:result.rows[0]});
   }
   const participant=(await c.query("select * from gwd.participants where id=$1",[user.id])).rows[0];
   if(!participant?.onboarding_completed)return json({error:"Conclui primeiro o onboarding.",code:"ONBOARDING_REQUIRED"},409);
   const academyResponse=await academyRoute({request,route,method,c,userId:user.id});
   if(academyResponse)return academyResponse;
   if(route==="/v1/journeys"&&method==="GET") {
    const result=await c.query("select step_id from gwd.journey_progress where participant_id=$1",[user.id]);
    return json({id:"gwd-start",title:"GWD Start",owner:"Maia Valente",steps:starterSteps,completed:result.rows.map(r=>r.step_id)});
   }
   if(route==="/v1/journeys/gwd-start/progress"&&method==="POST") {
    const step=validStep(text(object(await request.json()).stepId));
    if(!step)throw new InputError("Etapa desconhecida.");
    const index=starterSteps.findIndex(s=>s.id===step.id);
    if(index>0) {
     const prev=await c.query("select 1 from gwd.journey_progress where participant_id=$1 and step_id=$2",[user.id,starterSteps[index-1].id]);
     if(!prev.rows.length)throw new InputError("Conclui a etapa anterior.");
    }
    await c.query("insert into gwd.journey_progress(participant_id,step_id) values($1,$2) on conflict do nothing",[user.id,step.id]);
    await c.query("insert into gwd.points_events(participant_id,event_key,points) select $1,$2,points from gwd.journey_steps where id=$3 on conflict(participant_id,event_key) do nothing",[user.id,"journey:gwd-start:"+step.id,step.id]);
    await audit(c,user.id,"journey.progress");
    return json({completed:step.id});
   }
   if(route==="/v1/academy"&&method==="GET")return json({items:academy});
   if(route==="/v1/opportunities"&&method==="GET")return json({items:(await c.query("select id,title,market,description from gwd.campaigns where status='APPROVED' order by title")).rows});
   if(route==="/v1/community"&&method==="GET")return json({owner:"Maia Valente",links:communityLinks(),member:!!(await c.query("select 1 from gwd.community_memberships where participant_id=$1",[user.id])).rows.length});
   if(route==="/v1/community"&&method==="POST") {
    if(object(await request.json()).acceptRules!==true)throw new InputError("Aceita as regras da comunidade.");
    await c.query("insert into gwd.community_memberships(participant_id) values($1) on conflict do nothing",[user.id]);await audit(c,user.id,"community.joined");
    return json({joined:true});
   }
   if(route==="/v1/gamification/summary"&&method==="GET") {
    const events=(await c.query("select event_key,points,created_at from gwd.points_events where participant_id=$1 order by created_at",[user.id])).rows;
    return json({points:events.reduce((sum,r)=>sum+Number(r.points),0),events});
   }
   return json({error:"Recurso indisponível."},404);
  });
 }catch(error) {
  if(error instanceof AcademyError)return json({error:error.message,code:error.code},error.status);
  if(error instanceof InputError||error instanceof SyntaxError)return json({error:error instanceof SyntaxError?"Pedido inválido.":error.message},400);
  if(error instanceof Error&&error.message==="UNAUTHORIZED")return json({error:"A sessão expirou. Volta a entrar."},401);
  console.error("gwd.request.failed",error instanceof Error?error.name:"Error");
  return json({error:"O serviço está temporariamente indisponível. Tenta novamente.",code:"SERVICE_UNAVAILABLE"},503);
 }
 };
}
async function audit(c:PoolClient,id:string,action:string){await c.query("insert into gwd.audit_events(participant_id,action) values($1,$2)",[id,action]);}
function communityLinks(){
 const result:{label:string;url:string}[]=[];
 for(const [key,label] of [["COMMUNITY_WHATSAPP_URL","WhatsApp"],["COMMUNITY_FACEBOOK_URL","Facebook"]]){
  const value=process.env[key];if(!value)continue;
  try{const u=new URL(value);if(u.protocol==="https:"&&["chat.whatsapp.com","www.facebook.com","facebook.com"].includes(u.hostname))result.push({label,url:u.toString()});}catch{}
 }
 return result;
}
