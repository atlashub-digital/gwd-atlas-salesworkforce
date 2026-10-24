"use client";
import {useEffect,useState} from "react";
import {PageHeading} from "@gwd/ui";
type Row={day:string;source:string;campaign:string;market:string;interest:string;leads:number;newsletter:number;unsubscribed:number;participants:number;onboarded:number;academy_started:number};
const keys=["leads","newsletter","unsubscribed","participants","onboarded","academy_started"] as const;
const labels:Record<(typeof keys)[number],string>={leads:"Leads",newsletter:"Newsletter",unsubscribed:"Cancelaram",participants:"Contas",onboarded:"Onboarding",academy_started:"Academy"};
const pct=(a:number,b:number)=>b?Math.round(a/b*100)+" %":"—";
/** Operator-only funnel (aggregates from gwd.ops_lead_funnel; no names or emails ever reach the browser). */
export default function OpsFunnel(){
 const [days,setDays]=useState(30),[rows,setRows]=useState<Row[]|null>(null),[error,setError]=useState("");
 useEffect(()=>{setRows(null);setError("");fetch("/api/gwd/ops/funnel?days="+days,{cache:"no-store"}).then(async r=>{const b=await r.json();if(!r.ok)throw new Error(b.error??"Indisponível.");setRows(b.rows.map((x:Record<string,unknown>)=>({...x,day:String(x.day).slice(0,10),...Object.fromEntries(keys.map(k=>[k,Number(x[k])]))})));}).catch(e=>setError(e instanceof Error?e.message:"Indisponível."));},[days]);
 const total=Object.fromEntries(keys.map(k=>[k,(rows??[]).reduce((a,r)=>a+r[k],0)])) as Record<(typeof keys)[number],number>;
 const by=(f:(r:Row)=>string)=>Object.entries((rows??[]).reduce<Record<string,Record<string,number>>>((acc,r)=>{const k=f(r);acc[k]??={leads:0,participants:0,onboarded:0};acc[k].leads+=r.leads;acc[k].participants+=r.participants;acc[k].onboarded+=r.onboarded;return acc;},{})).sort((a,b)=>b[1].leads-a[1].leads);
 return <>
  <PageHeading eyebrow="Operação GWD" title="Leads e conversão" description="Agregados por origem, campanha, mercado e interesse. Sem nomes nem emails."/>
  <div className="actions" role="group" aria-label="Período">{[7,30,90].map(d=><button key={d} className={"button small"+(d===days?"":" secondary")} aria-pressed={d===days} onClick={()=>setDays(d)}>{d} dias</button>)}</div>
  {error?<p className="notice error" role="status">{error}</p>:!rows?<p className="muted" role="status">A carregar…</p>:<>
   <section className="ops-kpis">{keys.map(k=><div className="card ops-kpi" key={k}><span className="eyebrow">{labels[k]}</span><strong>{total[k]}</strong>{k!=="leads"&&k!=="unsubscribed"&&<small className="muted">{pct(total[k],k==="onboarded"||k==="academy_started"?total.participants:total.leads)}</small>}</div>)}</section>
   {[["Por campanha",(r:Row)=>r.source+" · "+r.campaign],["Por mercado",(r:Row)=>r.market],["Por interesse",(r:Row)=>r.interest]].map(([title,f])=>
    <section className="card" key={title as string}><h2>{title as string}</h2><div className="ops-table" role="table">
     <div role="row" className="ops-row ops-head"><span role="columnheader">Segmento</span><span role="columnheader">Leads</span><span role="columnheader">Contas</span><span role="columnheader">Onboarding</span></div>
     {by(f as (r:Row)=>string).map(([k,v])=><div role="row" className="ops-row" key={k}><span role="cell">{k}</span><span role="cell">{v.leads}</span><span role="cell">{v.participants} · {pct(v.participants,v.leads)}</span><span role="cell">{v.onboarded}</span></div>)}
     {!rows.length&&<p className="muted">Ainda sem leads neste período.</p>}</div></section>)}
  </>}
 </>;
}
