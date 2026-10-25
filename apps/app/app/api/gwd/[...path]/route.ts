import {cookies} from "next/headers";
import {authFetch,clearSession,sameOrigin,saveSession} from "../../../../lib/session";
const allowed=new Set(["me","journeys","journeys/gwd-start/progress","academy","opportunities","community","gamification/summary","feature-flags",
 "academy/series","academy/progress","ops/funnel","academy/progress/heartbeat","academy/progress/complete","academy/progress/summary","academy/telegram-handoff-opened",
 "offers","partner","partner/applications","partner/terms","partner/links","ops/partners","ops/partners/review","ops/offer-programs"]);
/** Academy Streaming resources addressed by slug/id; anything else stays blocked. */
const academyPattern=/^academy\/(series\/[a-z0-9-]+|episodes\/[a-z0-9-]+(\/playback)?|quiz\/[a-z0-9-]+\/submit)$/;
/** Community V1: spaces, a space's posts, and remove/report on one post. */
const communityPattern=/^community\/(spaces|spaces\/[a-z0-9-]{2,40}\/posts|posts\/[0-9a-f-]{36}\/(remove|report))$/;
async function proxy(request:Request,{params}:{params:Promise<{path:string[]}>}){
 if(request.method!=="GET"&&!sameOrigin(request))return Response.json({error:"Origem inválida."},{status:403});
 const route=(await params).path.join("/");
 if(!allowed.has(route)&&!academyPattern.test(route)&&!communityPattern.test(route))return Response.json({error:"Recurso indisponível."},{status:404});
 const base=process.env.GWD_API_URL;if(!base)return Response.json({error:"A plataforma está em preparação."},{status:503});
 const jar=await cookies();let token=jar.get("gwd-access")?.value;
 if(!token){
  const refresh=jar.get("gwd-refresh")?.value;
  if(refresh){try{const response=await authFetch("token?grant_type=refresh_token",{refresh_token:refresh});if(response.ok){const data=await response.json();await saveSession(data);token=data.access_token;}else await clearSession();}catch{}}
 }
 if(!token)return Response.json({error:"Inicia sessão para continuar."},{status:401});
 try{
  const body=request.method==="GET"?undefined:await request.text();
  if(body&&body.length>16384)return Response.json({error:"Pedido demasiado grande."},{status:413});
  const target=new URL("/v1/"+route,base);const series=new URL(request.url).searchParams.get("series");if(route==="academy/progress"&&series)target.searchParams.set("series",series);
  const days=new URL(request.url).searchParams.get("days");if(route==="ops/funnel"&&days&&/^\d{1,3}$/.test(days))target.searchParams.set("days",days);
  const response=await fetch(target,{method:request.method,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body,cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(response.status===401)await clearSession();
  return new Response(await response.text(),{status:response.status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
 }catch{return Response.json({error:"O serviço está temporariamente indisponível. Tenta novamente."},{status:503});}
}
export const GET=proxy;export const POST=proxy;export const PATCH=proxy;
