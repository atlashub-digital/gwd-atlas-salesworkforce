import {cookies} from "next/headers";
import {authFetch,clearSession,sameOrigin,saveSession} from "../../../lib/session";
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Origem inválida."},{status:403});
 try{
  const body=await request.json();
  if(body.action==="logout"){
   const jar=await cookies(),token=jar.get("gwd-access")?.value;
   if(token&&process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY)await fetch(new URL("/auth/v1/logout",process.env.SUPABASE_URL),{method:"POST",headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+token},signal:AbortSignal.timeout(8000)});
   await clearSession();return Response.json({ok:true});
  }
  if(typeof body.email!=="string"||body.email.length>254||!/^\S+@\S+\.\S+$/.test(body.email))return Response.json({error:"Indica um email válido."},{status:400});
  if(body.action==="request"){
   const response=await authFetch("otp",{email:body.email,create_user:true});
   if(!response.ok)return Response.json({error:"Não foi possível enviar o código. Aguarda antes de tentar novamente."},{status:response.status===429?429:400});
   return Response.json({sent:true});
  }
  if(body.action==="verify"&&typeof body.code==="string"&&/^\d{6,10}$/.test(body.code)){
   const response=await authFetch("verify",{email:body.email,token:body.code,type:"email"});
   const data=await response.json();
   if(!response.ok||!data.access_token)return Response.json({error:"Código inválido ou expirado."},{status:400});
   await saveSession(data);return Response.json({ok:true});
  }
  return Response.json({error:"Pedido inválido."},{status:400});
 }catch(error){return Response.json({error:error instanceof Error&&error.message.includes("preparação")?error.message:"Não foi possível autenticar. Tenta novamente."},{status:503});}
}
