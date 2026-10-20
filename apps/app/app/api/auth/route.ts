import {cookies} from "next/headers";
import {authFetch,clearSession,sameOrigin,saveSession} from "../../../lib/session";
/* Supabase Auth is the only credential store (ADR-0005). Channels:
 * - WhatsApp: phone OTP (GoTrue send-sms hook → WhatsApp) → verify → first time defines a password (PUT /user).
 *   Later logins use phone+password directly: GoTrue's password grant accepts `phone` as well as `email`, so no synthetic
 *   `<digits>@wa.goworld.digital` email is created — that would trigger email-change confirmations to an undeliverable
 *   domain and could be mistaken for a confirmed email by lead linking.
 * - Email OTP: fallback (and the CI auth-stub flow).
 * - Google: see ./google and /auth/callback.
 * Codes, passwords and tokens are never logged nor echoed back. */
const email=(v:unknown):v is string=>typeof v==="string"&&v.length<=254&&/^\S+@\S+\.\S+$/.test(v);
const phone=(v:unknown):v is string=>typeof v==="string"&&/^\+[1-9]\d{7,14}$/.test(v);
const code=(v:unknown):v is string=>typeof v==="string"&&/^\d{6,10}$/.test(v);
const password=(v:unknown):v is string=>typeof v==="string"&&v.length>=8&&v.length<=72;
const fail=(error:string,status=400)=>Response.json({error},{status});
/** First-time detection: a verified session whose participant has no GWD record yet (GET /v1/me → participant:null). */
async function isNewParticipant(token:string){
 const base=process.env.GWD_API_URL;if(!base)return true;
 try{const response=await fetch(new URL("/v1/me",base),{headers:{Authorization:"Bearer "+token},cache:"no-store",signal:AbortSignal.timeout(8000)});if(!response.ok)return true;return (await response.json()).participant==null;}
 catch{return true;}
}
export async function POST(request:Request){
 if(!sameOrigin(request))return fail("Origem inválida.",403);
 try{
  const body=await request.json(),jar=await cookies();
  if(body.action==="logout"){
   const token=jar.get("gwd-access")?.value;
   if(token&&process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY)await authFetch("logout",{},{token}).catch(()=>undefined);
   await clearSession();return Response.json({ok:true});
  }
  if(body.action==="phone-request"){
   if(!phone(body.phone))return fail("Indica um número de WhatsApp válido, com indicativo.");
   const response=await authFetch("otp",{phone:body.phone,create_user:true,channel:"sms"});
   if(!response.ok)return fail(response.status===429?"Já pedimos um código há pouco. Aguarda um minuto antes de pedir outro.":"Não foi possível enviar o código por WhatsApp. Confirma o número e tenta novamente.",response.status===429?429:400);
   return Response.json({sent:true});
  }
  if(body.action==="phone-verify"){
   if(!phone(body.phone)||!code(body.code))return fail("Indica o código de 6 dígitos recebido no WhatsApp.");
   const response=await authFetch("verify",{phone:body.phone,token:body.code,type:"sms"});
   const data=await response.json();
   if(!response.ok||!data.access_token)return fail("Código inválido ou expirado.");
   await saveSession(data);
   return Response.json({ok:true,needsPassword:await isNewParticipant(data.access_token)});
  }
  if(body.action==="phone-password"){
   if(!phone(body.phone)||typeof body.password!=="string"||!body.password)return fail("Indica o teu número de WhatsApp e a senha.");
   const response=await authFetch("token?grant_type=password",{phone:body.phone,password:body.password});
   const data=await response.json();
   if(!response.ok||!data.access_token)return fail(response.status===429?"Demasiadas tentativas. Aguarda um pouco e tenta novamente.":"Número ou senha incorretos.",response.status===429?429:400);
   await saveSession(data);return Response.json({ok:true});
  }
  if(body.action==="set-password"){
   if(!password(body.password))return fail("A senha deve ter entre 8 e 72 caracteres.");
   const token=jar.get("gwd-access")?.value;if(!token)return fail("A sessão terminou. Pede um novo código.",401);
   const response=await authFetch("user",{password:body.password},{method:"PUT",token});
   if(!response.ok){const data=await response.json().catch(()=>({}));return fail(data.error_code==="weak_password"||response.status===422?"Essa senha é demasiado fraca. Usa uma combinação mais longa de letras, números e símbolos.":"Não foi possível guardar a senha. Tenta novamente.");}
   return Response.json({ok:true});
  }
  if(!email(body.email))return fail("Indica um email válido.");
  if(body.action==="request"){
   const response=await authFetch("otp",{email:body.email,create_user:true});
   if(!response.ok)return fail("Não foi possível enviar o código. Aguarda antes de tentar novamente.",response.status===429?429:400);
   return Response.json({sent:true});
  }
  if(body.action==="verify"&&code(body.code)){
   const response=await authFetch("verify",{email:body.email,token:body.code,type:"email"});
   const data=await response.json();
   if(!response.ok||!data.access_token)return fail("Código inválido ou expirado.");
   await saveSession(data);return Response.json({ok:true});
  }
  return fail("Pedido inválido.");
 }catch(error){return fail(error instanceof Error&&error.message.includes("preparação")?error.message:"Não foi possível autenticar. Tenta novamente.",503);}
}
