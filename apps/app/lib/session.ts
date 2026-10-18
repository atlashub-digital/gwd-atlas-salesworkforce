import {cookies} from "next/headers";
export const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"};
export async function saveSession(data:{access_token:string;refresh_token:string;expires_in:number}){
 const jar=await cookies();
 jar.set("gwd-access",data.access_token,{...cookieOptions,maxAge:data.expires_in});
 jar.set("gwd-refresh",data.refresh_token,{...cookieOptions,maxAge:60*60*24*30});
}
export async function clearSession(){const jar=await cookies();jar.delete("gwd-access");jar.delete("gwd-refresh");}
export async function authFetch(path:string,body:unknown){
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)throw new Error("A autenticação ainda está em preparação.");
 return fetch(new URL("/auth/v1/"+path,base),{method:"POST",headers:{"Content-Type":"application/json",apikey:key},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
}
export function sameOrigin(request:Request){return request.headers.get("origin")===new URL(request.url).origin;}
