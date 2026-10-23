"use client";
import {useEffect,useRef,useState} from "react";import {Brand} from "@gwd/ui";
/* Multichannel sign-in (ADR-0005): WhatsApp+senha (primary) · Google · Email (fallback).
 * Email labels/buttons are E2E contract (tests/browser/verify.cjs) — do not rename. Inactive tab panels are not rendered. */
type Channel="whatsapp"|"google"|"email";
const channels:readonly {id:Channel;label:string}[]=[{id:"whatsapp",label:"WhatsApp"},{id:"google",label:"Google"},{id:"email",label:"Email"}];
const dialCodes=[["+55","Brasil +55"],["+351","Portugal +351"],["+34","Espanha +34"],["+33","França +33"],["+41","Suíça +41"],["+352","Luxemburgo +352"],["+44","Reino Unido +44"],["+49","Alemanha +49"],["+39","Itália +39"],["+244","Angola +244"],["+238","Cabo Verde +238"],["+258","Moçambique +258"],["+1","EUA/Canadá +1"]] as const;
async function auth(body:Record<string,unknown>){
 const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw new Error(data.error??"Tenta novamente.");return data;
}
const Status=({error}:{error:string})=><div role="status" aria-live="polite">{error&&<p className="notice error">{error}</p>}</div>;
export default function SignIn(){
 const [channel,setChannel]=useState<Channel>("whatsapp"),[googleError,setGoogleError]=useState(false),tabs=useRef<(HTMLButtonElement|null)[]>([]);
 useEffect(()=>{if(new URLSearchParams(window.location.search).get("erro")==="google"){setChannel("google");setGoogleError(true);}},[]);
 function onTabKey(event:React.KeyboardEvent,index:number){
  const next={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:channels.length-1}[event.key];if(next===undefined)return;
  event.preventDefault();const target=(next+channels.length)%channels.length;setChannel(channels[target].id);tabs.current[target]?.focus();
 }
 return <main className="auth-wrap card"><Brand/><span className="eyebrow" style={{display:"block",marginTop:35}}>A tua área GWD</span><h1>Vamos continuar?</h1>
  <div className="auth-tabs" role="tablist" aria-label="Forma de entrar">{channels.map((c,i)=><button key={c.id} ref={el=>{tabs.current[i]=el;}} type="button" role="tab" id={"tab-"+c.id} aria-controls={channel===c.id?"panel-"+c.id:undefined} aria-selected={channel===c.id} tabIndex={channel===c.id?0:-1} onClick={()=>setChannel(c.id)} onKeyDown={e=>onTabKey(e,i)}>{c.label}</button>)}</div>
  <section role="tabpanel" id={"panel-"+channel} aria-labelledby={"tab-"+channel} className="auth-panel">
   {channel==="whatsapp"&&<WhatsAppSignIn/>}
   {channel==="google"&&<GoogleSignIn failed={googleError}/>}
   {channel==="email"&&<EmailSignIn/>}
  </section>
  <p className="small">A participação na GWD não constitui vínculo de emprego nem garantia de rendimento.</p></main>
}
/** Number → WhatsApp code → verify → (first time or reset) define password → onboarding. Returning participants: number + password. */
function WhatsAppSignIn(){
 const [mode,setMode]=useState<"code"|"password">("code"),[intent,setIntent]=useState<"access"|"reset">("access"),[step,setStep]=useState<"phone"|"code"|"set-password">("phone");
 const [dial,setDial]=useState<string>(dialCodes[0][0]),[number,setNumber]=useState(""),[code,setCode]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const digits=number.replace(/[^\d+]/g,""),phone=digits.startsWith("+")?"+"+digits.slice(1).replace(/\D/g,""):dial+digits.replace(/\D/g,"").replace(/^0+/,"");
 async function run(task:()=>Promise<void>){setBusy(true);setError("");try{await task();}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();run(async()=>{
  if(step==="set-password"){if(password!==confirm)throw new Error("As senhas não coincidem.");await auth({action:"set-password",password});window.location.assign("/onboarding");return;}
  if(mode==="password"){await auth({action:"phone-password",phone,password});window.location.assign("/dashboard");return;}
  if(step==="phone"){await auth({action:"phone-request",phone});setStep("code");return;}
  const data=await auth({action:"phone-verify",phone,code});
  if(data.needsPassword||intent==="reset"){setPassword("");setConfirm("");setStep("set-password");}else window.location.assign("/dashboard");
 });}
 function switchMode(next:"code"|"password",nextIntent:"access"|"reset"="access"){setMode(next);setIntent(nextIntent);setStep("phone");setCode("");setPassword("");setError("");}
 if(step==="set-password")return <form className="form" onSubmit={submit}><h2 className="auth-step-title">Definir a tua senha</h2><p>Número confirmado. Define uma senha para entrares nas próximas vezes com o teu número de WhatsApp.</p>
  <label className="field">Nova senha<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
  <label className="field">Repete a senha<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
  <p className="small">Pelo menos 8 caracteres. Nunca partilhes a tua senha nem códigos recebidos.</p>
  <button className="button" disabled={busy}>{busy?"A guardar…":"Guardar senha e continuar ↗"}</button><Status error={error}/></form>;
 return <form className="form" onSubmit={submit}>
  <p>{mode==="password"?"Entra com o teu número de WhatsApp e a tua senha.":step==="code"?"Introduz o código de 6 dígitos que recebeste no WhatsApp.":intent==="reset"?"Recebe um código no WhatsApp para definires uma nova senha.":"Recebe um código no WhatsApp para criar ou aceder à tua conta."}</p>
  <div className="field"><span id="wa-label">Número de WhatsApp</span><div className="phone-input">
   <select aria-label="Indicativo" value={dial} disabled={step==="code"} onChange={e=>setDial(e.target.value)}>{dialCodes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
   <input type="tel" aria-labelledby="wa-label" required autoComplete="tel-national" inputMode="tel" maxLength={20} placeholder="Número sem indicativo" value={number} readOnly={step==="code"} onChange={e=>setNumber(e.target.value)}/>
  </div></div>
  {mode==="password"&&<label className="field">Senha<input type="password" required maxLength={72} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>}
  {mode==="code"&&step==="code"&&<label className="field">Código recebido no WhatsApp<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value)}/></label>}
  <button className="button" disabled={busy}>{busy?"A aguardar…":mode==="password"?"Entrar com senha ↗":step==="code"?"Confirmar código ↗":"Receber código no WhatsApp ↗"}</button>
  {step==="code"&&<button className="button secondary" type="button" onClick={()=>switchMode("code",intent)}>Usar outro número ou pedir novo código</button>}
  <Status error={error}/>
  <div className="auth-switch">{mode==="code"
   ?<button type="button" className="link" onClick={()=>switchMode("password")}>Já definiste senha? Entrar com número e senha</button>
   :<><button type="button" className="link" onClick={()=>switchMode("code")}>Primeira vez? Receber código no WhatsApp</button><button type="button" className="link" onClick={()=>switchMode("code","reset")}>Esqueci a senha</button></>}</div>
 </form>;
}
function GoogleSignIn({failed}:{failed:boolean}){
 return <div className="form"><p>Usa a tua conta Google para criar ou aceder à tua conta GWD.</p>
  <a className="button" href="/api/auth/google">Continuar com Google ↗</a>
  <Status error={failed?"Não foi possível entrar com Google. Tenta novamente ou usa outra forma de entrar.":""}/></div>;
}
/** Email OTP fallback — unchanged flow and labels (E2E + CI auth stub). */
function EmailSignIn(){
 const [email,setEmail]=useState(""),[code,setCode]=useState(""),[sent,setSent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");
 try{await auth({action:sent?"verify":"request",email,code});if(sent)window.location.assign("/dashboard");else setSent(true);}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 return <><p>{sent?"Abre o email que te enviámos: usa o link de acesso ou, se o email trouxer um código, introdu-lo aqui.":"Recebe um código por email para criar ou aceder à tua conta."}</p><form className="form" onSubmit={submit}><label className="field">Email<input type="email" required autoComplete="email" maxLength={254} value={email} readOnly={sent} onChange={e=>setEmail(e.target.value)}/></label>{sent&&<label className="field">Código de acesso<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" value={code} onChange={e=>setCode(e.target.value)}/></label>}<button className="button" disabled={busy}>{busy?"A aguardar…":sent?"Confirmar e entrar ↗":"Enviar código ↗"}</button>{sent&&<button className="button secondary" type="button" onClick={()=>{setSent(false);setCode("");setError("");}}>Usar outro email ou pedir novo código</button>}<Status error={error}/></form></>;
}
