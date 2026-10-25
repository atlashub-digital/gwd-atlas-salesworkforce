"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Progress,Status} from "@gwd/ui";
import {api} from "../../lib/client";
import {ScreenHeader} from "./bits";
/** Os meus percursos: the four learning paths (A–D), backed by the published Academy series and the member's real
 *  progress (academy/progress/summary). Completing a path never grants a commercial role by itself. */
const paths=[
 {key:"A",title:"Fundamentos do Digital",body:"A base comum: o GWD Start, a cultura e as regras da comunidade e o teu plano de 30 dias.",series:["gwd-start","comunidade-e-objetivos"],next:"Começa aqui."},
 {key:"B",title:"Social Media",body:"Fundamentos de conteúdo, plataformas e formatos, planeamento editorial, métricas, ética e direitos.",series:["social-media"],next:"Para criar e planear conteúdo com propósito."},
 {key:"C",title:"Afiliado Digital",body:"Como funciona a afiliação, escolher produtos, links e atribuição, transparência e uma campanha prática.",series:["afiliado-digital"],next:"Recomendado antes da candidatura a afiliado.",cta:{href:"/afiliado",label:"Área do Afiliado"}},
 {key:"D",title:"Revendedor Autorizado",body:"Diferenças face à afiliação, regras comerciais e preços, atendimento, venda, suporte e devoluções.",series:["revendedor-autorizado"],next:"Recomendado antes da candidatura a vendedor autorizado.",cta:{href:"/revenda",label:"Vendedor Autorizado"}},
] as const;
type SeriesProgress={slug:string;title:string;total:number;completed:number;percent:number};
export default function PathsScreen(){
 const [series,setSeries]=useState<SeriesProgress[]|null>(null),[error,setError]=useState("");
 useEffect(()=>{api("academy/progress/summary").then(d=>setSeries(d.series??[])).catch(e=>setError(e instanceof Error?e.message:"Não foi possível carregar o progresso."));},[]);
 return <section className="member-paths">
  <ScreenHeader icon="percursos" title="Os meus percursos" subtitle="Quatro percursos com leitura, exercícios e verificações. Referência de formação: Elisa Duarte."/>
  {error&&<p className="notice error" role="alert">{error}</p>}
  <div className="paths-grid">{paths.map(p=>{
   const items=p.series.map(slug=>series?.find(s=>s.slug===slug)).filter((s):s is SeriesProgress=>!!s);
   const total=items.reduce((n,s)=>n+s.total,0),done=items.reduce((n,s)=>n+s.completed,0),pct=total?Math.round(done/total*100):0;
   return <article className="card path-card" key={p.key}>
    <span className="eyebrow">Percurso {p.key}</span><h2>{p.title}</h2><p>{p.body}</p>
    {series===null?<p className="small muted">A carregar o progresso…</p>:items.length?<>
     <Progress value={pct} label={"Progresso no percurso "+p.title}/>
     <p className="small">{done} de {total} episódios concluídos{pct===100&&" · percurso concluído"}</p>
     <ul className="path-series">{items.map(s=><li key={s.slug}><Link href={"/academy/series/"+s.slug}>{s.title}</Link><span>{s.completed}/{s.total}</span></li>)}</ul>
    </>:<Status tone="neutral">EM PUBLICAÇÃO</Status>}
    <p className="small muted">{p.next}</p>
    <div className="path-actions">{items[0]&&<Link className="button" href={"/academy/series/"+(items.find(s=>s.completed<s.total)??items[0]).slug}>{done?"Continuar":"Começar"} <span className="arrow" aria-hidden="true">→</span></Link>}{"cta" in p&&<Link className="button secondary" href={p.cta.href}>{p.cta.label}</Link>}</div>
   </article>;})}</div>
  <p className="small muted">Concluir um percurso não ativa nenhum papel comercial: a afiliação e a revenda dependem de candidatura e aprovação da equipa.</p>
 </section>;
}
