import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {authFetch,saveSession} from "../../../lib/session";
/** Supabase OAuth return (Google). Exchanges the PKCE code for a session; new participants land in onboarding via /dashboard. */
export async function GET(request:Request){
 const url=new URL(request.url),jar=await cookies(),verifier=jar.get("gwd-pkce")?.value,authCode=url.searchParams.get("code");
 jar.delete("gwd-pkce");
 const failed=NextResponse.redirect(url.origin+"/entrar?erro=google",302);
 if(!verifier||!authCode||url.searchParams.has("error"))return failed;
 try{
  const response=await authFetch("token?grant_type=pkce",{auth_code:authCode,code_verifier:verifier});
  const data=await response.json();
  if(!response.ok||!data.access_token)return failed;
  await saveSession(data);return NextResponse.redirect(url.origin+"/dashboard",302);
 }catch{return failed;}
}
