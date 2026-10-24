"use client";
import {useEffect,useState} from "react";
/** Reads ?t= (opaque token) and confirms the unsubscribe with one click (no automatic action on link prefetch). */
export default function UnsubscribeForm(){
 const [token,setToken]=useState(""),[state,setState]=useState<"idle"|"loading"|"done"|"unknown"|"error">("idle");
 useEffect(()=>{setToken(new URL(window.location.href).searchParams.get("t")??"");},[]);
 async function submit(){setState("loading");try{const r=await fetch("/api/leads/unsubscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});const b=await r.json();if(!r.ok)throw new Error();setState(b.unsubscribed?"done":"unknown");}catch{setState("error");}}
 if(!token)return <p className="notice">Esta ligação está incompleta. Usa a ligação “Cancelar subscrição” do email que recebeste.</p>;
 if(state==="done")return <p className="notice success" role="status">Subscrição cancelada. Não vais receber mais novidades da GWD por email.</p>;
 if(state==="unknown")return <p className="notice" role="status">Não encontrámos esta subscrição. Se continuares a receber emails, responde a um deles a pedir o cancelamento.</p>;
 return <div className="actions"><button className="button" disabled={state==="loading"} onClick={()=>void submit()}>{state==="loading"?"A cancelar…":"Confirmar cancelamento"}</button>{state==="error"&&<p className="notice error" role="status">Não foi possível concluir. Tenta novamente.</p>}</div>;
}
