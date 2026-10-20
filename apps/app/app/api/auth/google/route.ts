import {createHash,randomBytes} from "node:crypto";
import {NextResponse} from "next/server";
import {authConfig,cookieOptions} from "../../../../lib/session";
/** Google OAuth via Supabase's native provider (PKCE). The verifier lives in an httpOnly cookie, so only this browser can
 * exchange the returned code in /auth/callback; tokens never reach client JS or the URL fragment.
 * `redirect_to` must be listed in Supabase Auth → URL Configuration → Redirect URLs. */
export async function GET(request:Request){
 const origin=new URL(request.url).origin;
 try{
  const {base}=authConfig();
  const verifier=randomBytes(32).toString("base64url"),challenge=createHash("sha256").update(verifier).digest("base64url");
  const url=new URL("/auth/v1/authorize",base);
  url.search=new URLSearchParams({provider:"google",redirect_to:origin+"/auth/callback",code_challenge:challenge,code_challenge_method:"s256"}).toString();
  const response=NextResponse.redirect(url,302);
  response.cookies.set("gwd-pkce",verifier,{...cookieOptions,maxAge:600});
  return response;
 }catch{return NextResponse.redirect(origin+"/entrar?erro=google",302);}
}
