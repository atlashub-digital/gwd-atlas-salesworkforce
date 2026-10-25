/** Attributed affiliate link: goworld.digital/r/<id> → records a verified click (the API ignores link previews and
 * bots) → 302 to the official Novidades.Store offer page with the GWD attribution parameters. Never an open redirect:
 * the API only returns https URLs on novidades.store. */
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const fallback=new URL("/canais?link=indisponivel",request.url);
 const base=process.env.GWD_API_URL;
 if(!base||!/^[0-9a-f-]{36}$/i.test(id))return Response.redirect(fallback,302);
 try{
  const response=await fetch(new URL("/v1/public/referral/"+id,base),{method:"POST",headers:{"x-visitor-user-agent":request.headers.get("user-agent")??""},cache:"no-store",signal:AbortSignal.timeout(8000)});
  const data=await response.json() as {url?:string};
  const target=data.url?new URL(data.url):null;
  if(!response.ok||!target||target.protocol!=="https:"||!(target.hostname==="novidades.store"||target.hostname.endsWith(".novidades.store")))return Response.redirect(fallback,302);
  return new Response(null,{status:302,headers:{Location:target.toString(),"Cache-Control":"no-store","Referrer-Policy":"no-referrer-when-downgrade"}});
 }catch{return Response.redirect(fallback,302);}
}
