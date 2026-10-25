"use client";
import {useCallback,useEffect,useState} from "react";
import {Status} from "@gwd/ui";
import {api} from "../../lib/client";
import type {Offer} from "./PartnerScreens";
/** Operator-only: review affiliate / authorized-seller applications and set offer programmes (conditions confirmed by
 *  the direction). Everything goes through operator-checked SQL functions; members never reach these routes. */
type Row={id:string;kind:string;status:string;market:string;display_name:string;channels:string;motivation:string;decision_note:string;created_at:string;learning_paths_completed:number};
export default function OpsPartners(){
 const [rows,setRows]=useState<Row[]|null>(null),[offers,setOffers]=useState<Offer[]>([]),[error,setError]=useState(""),[note,setNote]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false);
 const [program,setProgram]=useState({offerSlug:"",kind:"AFFILIATE",status:"ACTIVE",conditions:""}),[msg,setMsg]=useState("");
 const load=useCallback(async()=>{setError("");try{const [p,o]=await Promise.all([api("ops/partners"),api("offers")]);setRows(p.items);setOffers(o.items);}catch(e){setError(e instanceof Error?e.message:"Indisponível.");}},[]);
 useEffect(()=>{void load();},[load]);
 async function review(id:string,decision:string){setBusy(true);try{await api("ops/partners/review",{id,decision,note:note[id]??""});await load();}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");try{await api("ops/offer-programs",program);setMsg("Programa atualizado.");await load();}catch(err){setMsg(err instanceof Error?err.message:"Tenta novamente.");}finally{setBusy(false);}}
 if(error&&!rows)return <section className="card"><h2>Parceiros</h2><p className="notice error" role="alert">{error}</p></section>;
 return <>
  <section className="card"><h2>Candidaturas de parceiros</h2>
   {!rows?<p className="small muted" role="status">A carregar…</p>:rows.length?<ul className="link-list">{rows.map(r=><li key={r.id}><div>
    <strong>{r.display_name}</strong> <span className="small muted">· {r.kind==="AFFILIATE"?"Afiliado":"Vendedor autorizado"} · {r.market} · {new Date(r.created_at).toLocaleDateString("pt-PT")} · séries concluídas: {r.learning_paths_completed}</span>
    <p className="small"><strong>Canais:</strong> {r.channels}</p><p className="small"><strong>Motivação:</strong> {r.motivation}</p>
    {r.status==="SUBMITTED"?<div className="actions"><input aria-label="Nota da decisão" placeholder="Nota (visível ao membro)" value={note[r.id]??""} onChange={e=>setNote({...note,[r.id]:e.target.value})} maxLength={500}/><button className="button small" disabled={busy} onClick={()=>void review(r.id,"APPROVED")}>Aprovar</button><button className="button small secondary" disabled={busy} onClick={()=>void review(r.id,"REJECTED")}>Não aprovar</button></div>
    :<Status tone={r.status==="APPROVED"?"success":"neutral"}>{r.status==="APPROVED"?"APROVADA":"NÃO APROVADA"}</Status>}
   </div></li>)}</ul>:<p className="small muted">Sem candidaturas.</p>}
  </section>
  <section className="card"><h2>Programas por oferta</h2><p className="small">Ativa um programa só com as condições confirmadas pela direção (comissão ou margem, prazo de confirmação, regras de divulgação). Os preços vêm sempre da Novidades.Store.</p>
   <form className="form" onSubmit={save}>
    <label className="field"><span>Oferta</span><select required value={program.offerSlug} onChange={e=>setProgram({...program,offerSlug:e.target.value})}><option value="">Escolhe</option>{offers.map(o=><option key={o.slug} value={o.slug}>{o.title} · afiliação {o.programs.AFFILIATE.status}</option>)}</select></label>
    <label className="field"><span>Programa</span><select value={program.kind} onChange={e=>setProgram({...program,kind:e.target.value})}><option value="AFFILIATE">Afiliação</option><option value="RESELLER">Revenda</option></select></label>
    <label className="field"><span>Estado</span><select value={program.status} onChange={e=>setProgram({...program,status:e.target.value})}><option value="ACTIVE">Ativo</option><option value="PENDING_CONDITIONS">Condições em validação</option><option value="PAUSED">Pausado</option></select></label>
    <label className="field"><span>Condições publicadas (texto visível aos membros)</span><textarea rows={4} maxLength={2000} value={program.conditions} onChange={e=>setProgram({...program,conditions:e.target.value})}/></label>
    <button className="button" disabled={busy}>Guardar programa</button>{msg&&<p className="notice" role="status">{msg}</p>}
   </form>
  </section>
 </>;
}
