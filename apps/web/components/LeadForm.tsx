"use client";
import {useEffect,useState} from "react";
/** Lead registration (POST /api/leads → /v1/leads). Labels and button names are E2E contract (tests/browser/verify.cjs) — do not rename.
 * WhatsApp is visual-only and disabled: the lead contract has no phone field yet, so nothing is sent until the API supports it. */
export default function LeadForm({appUrl}:{appUrl:string}){
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 const [state,setState]=useState<"idle"|"loading"|"done"|"error">("idle"),[message,setMessage]=useState(""),[email,setEmail]=useState(""),[emailSent,setEmailSent]=useState(false);
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setState("loading");setMessage("");const form=new FormData(event.currentTarget);const data=Object.fromEntries(form);const url=new URL(window.location.href);for(const key of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"])data[key]=url.searchParams.get(key)??"";
 let referrer="";try{const r=document.referrer?new URL(document.referrer):null;if(r&&r.host!==url.host)referrer=r.hostname;}catch{}
 try{const res=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,consent:form.get("consent")==="on",newsletter:form.get("newsletter")==="on",landing_path:(url.pathname+url.search).slice(0,200),referrer_host:referrer,source:url.searchParams.get("source")??url.searchParams.get("utm_source")??"web"})});const result=await res.json();if(!res.ok)throw new Error(result.error??"Não foi possível concluir a inscrição.");setEmail(String(data.email??""));setEmailSent(result.email==="sent");setState("done");}
 catch(error){setState("error");setMessage(error instanceof Error?error.message:"Tenta novamente.");}}
 if(state==="done")return <section className="lead-done" role="status"><span className="eyebrow">Inscrição registada</span><h2>{emailSent?"Verifica o teu email.":"O próximo passo é teu."}</h2>
  {emailSent?<p>Enviámos para <strong>{email}</strong> um link de acesso e um código. Abre o email para entrares na GWD e começares o onboarding. Se não o vires em alguns minutos, procura em Promoções ou Spam.</p>
   :<p>Entra na plataforma com o teu email: recebes um código de acesso para criar a tua conta e começar o onboarding.</p>}
  <a className="button large" href={appUrl+"/entrar?email="+encodeURIComponent(email)+(emailSent?"&sent=1":"")}>{emailSent?"Já tenho o código ↗":"Continuar para a plataforma ↗"}</a></section>;
 return <form data-ready={ready} className="lead-form" onSubmit={submit}>
  <label className="field">Como te chamas?<input name="name" autoComplete="name" placeholder="Nome completo" required maxLength={120}/></label>
  <label className="field">Email<input type="email" name="email" autoComplete="email" inputMode="email" placeholder="nome@exemplo.com" required maxLength={254}/></label>
  <label className="field">O teu mercado<select name="market" required defaultValue=""><option value="" disabled>Seleciona o teu país</option><option value="BR">Brasil</option><option value="EU">Europa</option><option value="OTHER">Outro</option></select></label>
  <div className="field field--soon" title="Em breve">
   <span className="field-label" id="whatsapp-label">WhatsApp <span className="badge-soon">Em breve</span></span>
   <div className="phone-input">
    <select aria-label="Indicativo" aria-describedby="whatsapp-note" disabled defaultValue="+55"><option value="+55">🇧🇷 +55</option><option value="+351">🇵🇹 +351</option><option value="+">Outro</option></select>
    <input type="tel" aria-labelledby="whatsapp-label" aria-describedby="whatsapp-note" placeholder="Número de WhatsApp" disabled/>
   </div>
   <small id="whatsapp-note">Ainda não recolhemos o número. O contacto por WhatsApp fica disponível em breve.</small>
  </div>
  <label className="field">Por onde gostarias de começar?<select name="interest" defaultValue="LEARNING"><option value="LEARNING">Aprender e conhecer a comunidade</option><option value="SOCIAL_MEDIA">Social Media</option><option value="AFFILIATE">Afiliação</option><option value="AUTHORIZED_SELLER">Revenda autorizada</option></select></label>
  <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
  <label className="check"><input type="checkbox" name="consent" required/><span>Li e aceito a <a href="/privacidade">Política de Privacidade</a> e autorizo o tratamento dos meus dados para gerir a inscrição e o percurso na GWD.</span></label>
  <label className="check"><input type="checkbox" name="newsletter"/><span>Quero receber novidades da GWD por email (opcional). Posso cancelar em qualquer momento pela ligação incluída em cada email.</span></label>
  <button className="button large" disabled={state==="loading"}>{state==="loading"?"A registar…":"Registar interesse →"}</button>
  <p className="lead-form-legal">A inscrição não representa emprego, rendimento garantido ou autorização comercial.</p>
  <div role="status" aria-live="polite">{message&&<p className="notice error">{message}</p>}</div>
 </form>;
}
