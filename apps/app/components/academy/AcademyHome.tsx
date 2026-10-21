"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {NavIcon} from "@gwd/ui";
import {api} from "../../lib/client";
import {SeriesPoster,TierChip,categoryLabel,duration,topTier} from "./presentation";
import type {ApiSeries,Summary} from "./types";
/** Academy Home — "Netflix da Formação" (academy master board 10/13, target 04/08). Rows come from the published
 *  catalogue; Continue Watching only from server progress. No placeholder courses fill the grid. */
export default function AcademyHome(){
 const [series,setSeries]=useState<ApiSeries[]|null>(null),[summary,setSummary]=useState<Summary|null>(null),[error,setError]=useState(""),[category,setCategory]=useState("todas"),[query,setQuery]=useState("");
 useEffect(()=>{Promise.all([api("academy/series"),api("academy/progress/summary")]).then(([s,p])=>{setSeries(s.items);setSummary(p)}).catch(e=>setError(e instanceof Error?e.message:"Não foi possível carregar a Academy."))},[]);
 const categories=useMemo(()=>[...new Set((series??[]).map(s=>s.category))],[series]);
 const visible=(series??[]).filter(s=>(category==="todas"||s.category===category)&&(!query||(s.title+" "+s.description).toLowerCase().includes(query.toLowerCase())));
 const featured=series?.find(s=>s.featured)??series?.[0];
 const progressOf=(slug:string)=>summary?.series.find(s=>s.slug===slug);
 if(error)return <div className="page-heading"><h1>Academy</h1><p className="notice error" role="alert">{error}</p></div>;
 if(!series)return <div className="page-heading" role="status"><span className="eyebrow">GWD Academy</span><h1>A preparar o catálogo…</h1></div>;
 return <section className="ac-home">
  {featured&&<header className="ac-hero">
   <div className="ac-hero-media" aria-hidden="true"><SeriesPoster series={featured} sizes="(max-width:760px) 100vw, 70vw" priority/></div>
   <div className="ac-hero-copy"><span className="eyebrow">GWD Academy</span><h1>Aprende hoje o que o mercado digital <span className="text-accent">precisa amanhã.</span></h1><p>Formações práticas, passo a passo, organizadas em séries e temporadas.</p>
    <div className="ac-hero-actions"><a className="button" href="#catalogo">Explorar formações <span className="arrow" aria-hidden="true">→</span></a><Link className="button secondary" href="/pontos">A minha progressão</Link></div></div>
   <Link className="ac-featured" href={`/academy/series/${featured.slug}`}><span className="ac-featured-kicker">Série em destaque</span><strong>{featured.title}</strong><span className="ac-featured-meta">{featured.episodes.length} episódios · {duration(featured.episodes.reduce((a,e)=>a+e.durationSeconds,0))} <TierChip tier={topTier(featured)}/></span><span className="ac-featured-cta"><NavIcon name="play"/> Ver série</span></Link>
  </header>}
  <div className="ac-toolbar" id="catalogo">
   <div className="ac-chips" role="group" aria-label="Filtrar por categoria">{["todas",...categories].map(c=><button key={c} type="button" aria-pressed={category===c} onClick={()=>setCategory(c)}>{c==="todas"?"Todas":categoryLabel[c]??c}</button>)}</div>
   <label className="ac-search"><span className="sr-only">Pesquisar formações</span><input type="search" placeholder="Pesquisar por título ou tema" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  </div>
  <section className="ac-row" aria-labelledby="ac-continue"><h2 id="ac-continue">Continuar a aprender</h2>
   {summary?.continueLearning.length?<div className="ac-rail">{summary.continueLearning.map(c=><Link className="ac-continue-card" key={c.episodeId} href={`/academy/series/${c.seriesSlug}/episodes/${c.episodeSlug}`}><span className="ac-continue-media" aria-hidden="true"><SeriesPoster series={{slug:c.seriesSlug,title:c.seriesTitle}} sizes="280px"/><span className="ac-play"><NavIcon name="play"/></span></span><span className="ac-card-text"><small>{c.seriesTitle}</small><strong>{c.episodeTitle}</strong></span><span className="ac-bar" role="progressbar" aria-label={"Progresso de "+c.episodeTitle} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progressPercent}><span style={{width:c.progressPercent+"%"}}/></span></Link>)}</div>
   :<p className="ac-empty">Ainda não começaste nenhum episódio. Quando começares, retomas aqui exatamente onde ficaste.</p>}
  </section>
  {(category==="todas"&&!query?categories:[category]).filter(c=>c!=="todas").map(c=>{const list=visible.filter(s=>s.category===c);if(!list.length)return null;return <section className="ac-row" key={c} aria-labelledby={"row-"+c}><h2 id={"row-"+c}>{categoryLabel[c]??c}</h2><div className="ac-rail">{list.map(s=>{const p=progressOf(s.slug);return <Link className="ac-series-card" key={s.slug} href={`/academy/series/${s.slug}`}><span className="ac-series-media" aria-hidden="true"><SeriesPoster series={s} sizes="(max-width:760px) 80vw, 320px"/><TierChip tier={topTier(s)}/></span><span className="ac-card-text"><strong>{s.title}</strong><small>{s.episodes.length} episódios · {s.seasons.length} temporada{s.seasons.length>1?"s":""}</small></span>{p&&p.completed>0?<span className="ac-bar" role="progressbar" aria-label={"Progresso de "+s.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.percent}><span style={{width:p.percent+"%"}}/></span>:null}</Link>})}</div></section>})}
  {query&&!visible.length&&<p className="ac-empty">Nenhuma formação corresponde a “{query}”.</p>}
  <section className="ac-xp" aria-label="O teu progresso na Academy"><div><span className="eyebrow">XP da Academy</span><strong>{summary?.xp.total??0} XP</strong></div><div className="ac-badges">{summary?.badges.length?summary.badges.map(b=><span key={b.id} className="ac-badge">{b.label}</span>):<span className="small muted">Os badges aparecem quando os desbloqueares com aprendizagem real.</span>}</div><Link className="link" href="/pontos">Ver pontos →</Link></section>
 </section>;
}
