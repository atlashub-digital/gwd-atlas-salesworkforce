"use client";
import {useEffect,useState} from "react";import {Brand} from "@gwd/ui";
/** Email link return. Default Supabase links put the session in the URL fragment (never sent to a server);
 * custom templates send ?token_hash=&type=. Either way the server validates with Supabase and sets the HttpOnly session. */
export default function ConfirmEmail(){
 const [error,setError]=useState("");
 useEffect(()=>{
  const hash=new URLSearchParams(window.location.hash.slice(1)),query=new URLSearchParams(window.location.search);
  window.history.replaceState(null,"",window.location.pathname);// tokens never stay in the address bar or history
  const failure=hash.get("error_description")||query.get("error_description");
  if(failure){setError("O link expirou ou já foi usado. Pede um novo código.");return;}
  const body=query.get("token_hash")?{action:"link-session",token_hash:query.get("token_hash"),type:query.get("type")}
   :{action:"link-session",access_token:hash.get("access_token"),refresh_token:hash.get("refresh_token"),expires_in:hash.get("expires_in")};
  fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
   .then(async r=>{if(!r.ok)throw new Error((await r.json()).error);window.location.assign("/dashboard");})
   .catch(e=>setError(e instanceof Error&&e.message?e.message:"Não foi possível confirmar o acesso."));
 },[]);
 return <main className="auth-wrap card"><Brand/><span className="eyebrow" style={{display:"block",marginTop:35}}>A tua área GWD</span>
  {error?<><h1>Vamos tentar novamente.</h1><p className="notice error" role="alert">{error}</p><a className="button" href="/entrar">Voltar a entrar</a></>
   :<h1 role="status">A confirmar o teu acesso…</h1>}</main>;
}
