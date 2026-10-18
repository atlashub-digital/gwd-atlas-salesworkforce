import {cookies} from "next/headers";
import {authFetch,clearSession,sameOrigin,saveSession} from "../../../../lib/session";
const allowed=new Set(["me","journeys","journeys/gwd-start/progress","academy","opportunities","community","gamification/summary","feature-flags"]);
async function proxy(request:Request,{params}:{params:Promise<{path:string[]}>}){
 if(request.method!=="GET"&&!sameOrigin(request))return Response.json({error:"Origem inválida."},{status:403});
 const route=(await params).path.join("/");
 if(!allowed.has(route))return Response.json({error:"Recurso indisponível."},{status:404});
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
  const response=await fetch(new URL("/v1/"+route,base),{method:request.method,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body,cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(response.status===401)await clearSession();
  return new Response(await response.text(),{status:response.status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
 }catch{return Response.json({error:"O serviço está temporariamente indisponível. Tenta novamente."},{status:503});}
}
export const GET=proxy;export const POST=proxy;export const PATCH=proxy;
