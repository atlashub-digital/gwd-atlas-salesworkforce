import { flags } from "@gwd/config";
import { InputError, leadInput, object, profileInput, text, uuid } from "@gwd/contracts";
import { academy, starterSteps, validStep } from "@gwd/domain";
import { AcademyError, academyRoute, publicAcademyRoute } from "./academy";
import { communityRoute } from "./community";
import { partnerRoute, publicReferral } from "./partners";
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
/** Sends the Supabase sign-in email (link + code) to a new lead. Never blocks the lead: the outcome is reported, not thrown. */
export async function sendSignInEmail(email:string,name:string):Promise<"sent"|"rate_limited"|"unavailable"> {
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return "unavailable";
 const target=new URL("/auth/v1/otp",url);target.searchParams.set("redirect_to",(process.env.GWD_APP_URL??"https://app.goworld.digital")+"/auth/confirm");
 try{const response=await fetch(target,{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({email,create_user:true,data:{name}}),signal:AbortSignal.timeout(10000)});
  return response.ok?"sent":response.status===429?"rate_limited":"unavailable";}catch{return "unavailable";}
}
let leadsV2=false;// 2026-10-24-leads-v2.sql applied? (re-checked until true; the API works before and after the migration)
export function createHandler(tx:Tx=transaction,auth=verifyToken,signIn=sendSignInEmail) {
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
   const created=await tx(null,async c=>{
    if(!leadsV2)leadsV2=(await c.query("select 1 from information_schema.columns where table_schema='gwd' and table_name='leads' and column_name='marketing_consent_at'")).rows.length>0;
    const r=leadsV2
     ?await c.query("insert into gwd.leads(name,email,market,interest,source,utm,marketing_consent_at,landing_path,referrer_host) values($1,$2,$3,$4,$5,$6,case when $7 then now() end,$8,$9) on conflict do nothing",[input.name,input.email,input.market,input.interest,input.source,JSON.stringify(input.utm),input.newsletter,input.landingPath,input.referrerHost])
     :await c.query("insert into gwd.leads(name,email,market,interest,source,utm) values($1,$2,$3,$4,$5,$6) on conflict do nothing",[input.name,input.email,input.market,input.interest,input.source,JSON.stringify(input.utm)]);
    return (r.rowCount??0)>0;});
   // Confirmation = the real sign-in email (link + code). A repeated lead also gets it: it is the way back in.
   return json({accepted:true,created,email:await signIn(input.email,input.name)},201);
  }
  if(route==="/v1/leads/unsubscribe"&&method==="POST") {
   const token=text(object(await request.json()).token,64);
   if(!/^[0-9a-f-]{36}$/i.test(token))throw new InputError("Ligação inválida.");
   const done=await tx(null,async c=>(await c.query<{ok:boolean}>("select gwd.lead_unsubscribe($1::uuid) as ok",[token])).rows[0]?.ok??false);
   return json({unsubscribed:done});
  }
  const referral=await publicReferral(route,method,request,tx,json);
  if(referral)return referral;
  const publicAcademy=await publicAcademyRoute(route,method,tx);
  if(publicAcademy)return publicAcademy;
  const bearer=request.headers.get("authorization");
  if(!bearer?.startsWith("Bearer "))return json({error:"Inicia sessão para continuar."},401);
  const user=await auth(bearer.slice(7));uuid(user.id);
  return await tx(user.id,async c=>{
   await c.query("select set_config('request.jwt.claim.email',$1,true)",[user.email?.toLowerCase()??""]);
   if(route==="/v1/me"&&method==="GET") {
    const result=await c.query("select * from gwd.participants where id=$1",[user.id]);
    // Not onboarded yet: offer the verified lead's answers as defaults (RLS: only the lead with this confirmed email).
    if(!result.rows.length){const lead=(await c.query("select name,market,interest from gwd.leads where lower(email)=lower(current_setting('request.jwt.claim.email',true)) order by created_at desc limit 1")).rows[0]??null;return json({participant:null,email:user.email,lead});}
    const caps=await c.query("select capability from gwd.participant_capabilities where participant_id=$1",[user.id]);
    return json({participant:result.rows[0],capabilities:caps.rows.map(r=>r.capability),email:user.email});
   }
   if(route==="/v1/ops/funnel"&&method==="GET") {
    const days=Math.max(1,Math.min(365,Number(url.searchParams.get("days")??30)||30));
    const rows=(await c.query("select * from gwd.ops_lead_funnel($1)",[days])).rows;
    return json({days,rows});
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
   const partnerResponse=await partnerRoute({request,route,method,c,userId:user.id,json});
   if(partnerResponse)return partnerResponse;
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
   // Until 2026-10-23-community-v1.sql is applied the feed tables do not exist (42P01/42883): say so instead of a generic 503.
   const communityResponse=await communityRoute({request,route,method,c,userId:user.id,json,audit:action=>audit(c,user.id,action)})
    .catch(error=>{if(["42P01","42883"].includes((error as {code?:string}).code??""))return json({error:"O feed da comunidade está em ativação.",code:"COMMUNITY_FEED_PENDING"},503);throw error;});
   if(communityResponse)return communityResponse;
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
  const code=(error as {code?:string})?.code;
  if(route.startsWith("/v1/ops/")&&code==="42501")return json({error:"Área reservada à operação GWD.",code:"OPERATOR_ONLY"},403);
  if(error instanceof Error&&error.message==="CATALOG_UNAVAILABLE")return json({error:"O catálogo da Novidades.Store está temporariamente indisponível. Tenta novamente.",code:"CATALOG_UNAVAILABLE"},503);
  // Until 2026-10-25-partners-v1.sql is applied: say so instead of a generic 503.
  if((route.startsWith("/v1/partner")||route.startsWith("/v1/public/referral")||route.startsWith("/v1/ops/partners")||route==="/v1/ops/offer-programs")&&["42P01","42883"].includes(code??""))return json({error:"A área de parceiros está em ativação.",code:"PARTNERS_PENDING"},503);
  if((route.startsWith("/v1/ops/")||route==="/v1/leads/unsubscribe")&&code==="42883")return json({error:"Esta função está em ativação.",code:"LEADS_V2_PENDING"},503);
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
