"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {NavIcon} from "@gwd/ui";
import {api} from "../../lib/client";
import {ModeChip,SeriesPoster,TierChip,categoryLabel,duration,topTier} from "./presentation";
import type {ApiSeries,EpisodeState} from "./types";
/** Series page (academy master board 11): editorial hero, seasons, episode states from server progress. */
export default function SeriesDetail({slug}:{slug:string}){
 const [series,setSeries]=useState<ApiSeries|null>(null),[states,setStates]=useState<Record<string,EpisodeState>>({}),[season,setSeason]=useState(1),[tab,setTab]=useState<"episodios"|"sobre">("episodios"),[error,setError]=useState("");
 useEffect(()=>{Promise.all([api("academy/series/"+slug),api("academy/progress?series="+encodeURIComponent(slug))]).then(([s,p])=>{setSeries(s.series);setStates(Object.fromEntries((p.items as EpisodeState[]).map(i=>[i.episodeSlug,i])))}).catch(e=>setError(e instanceof Error?e.message:"Série indisponível."))},[slug]);
 if(error)return <div className="page-heading"><h1>Série indisponível</h1><p className="notice error" role="alert">{error}</p><Link className="link" href="/academy">← Voltar à Academy</Link></div>;
 if(!series)return <div className="page-heading" role="status"><span className="eyebrow">GWD Academy</span><h1>A carregar a série…</h1></div>;
 const completed=series.episodes.filter(e=>states[e.slug]?.status==="COMPLETED").length,percent=Math.round(completed/series.episodes.length*100);
 const next=series.episodes.find(e=>states[e.slug]?.status==="IN_PROGRESS")??series.episodes.find(e=>states[e.slug]?.status!=="COMPLETED")??series.episodes[0];
 const started=Object.keys(states).length>0,list=series.episodes.filter(e=>e.seasonNumber===season);
 return <section className="ac-series">
  <nav className="ac-crumbs" aria-label="Localização"><Link href="/academy">Academy</Link><span aria-hidden="true">/</span><span>{series.title}</span></nav>
  <header className="ac-series-hero">
   <div className="ac-series-hero-media" aria-hidden="true"><SeriesPoster series={series} sizes="(max-width:760px) 100vw, 60vw" priority/></div>
   <div className="ac-series-hero-copy"><span className="eyebrow">{categoryLabel[series.category]??series.category} · {series.subtitle}</span><h1>{series.title}</h1><p>{series.description}</p>
    <div className="ac-meta-row"><TierChip tier={topTier(series)}/><span>{series.episodes.length} episódios</span><span>{series.seasons.length} temporada{series.seasons.length>1?"s":""}</span><span>{duration(series.episodes.reduce((a,e)=>a+e.durationSeconds,0))}</span></div>
    {started&&<div className="ac-series-progress"><span className="ac-bar" role="progressbar" aria-label="Progresso da série" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:percent+"%"}}/></span><small>{completed} de {series.episodes.length} episódios concluídos</small></div>}
    <Link className="button" href={`/academy/series/${series.slug}/episodes/${next.slug}`}><NavIcon name="play"/> {started?"Continuar":"Começar"} · {next.code}</Link></div>
  </header>
  <div className="ac-tabs" role="tablist" aria-label="Secções da série"><button role="tab" aria-selected={tab==="episodios"} onClick={()=>setTab("episodios")}>Episódios</button><button role="tab" aria-selected={tab==="sobre"} onClick={()=>setTab("sobre")}>Sobre</button></div>
  {tab==="episodios"?<>
   {series.seasons.length>1&&<div className="ac-chips" role="group" aria-label="Temporadas">{series.seasons.map(s=><button key={s.number} type="button" aria-pressed={season===s.number} onClick={()=>setSeason(s.number)}>T{s.number} · {s.title}</button>)}</div>}
   <ol className="ac-episodes">{list.map(e=>{const st=states[e.slug];return <li key={e.id}><Link className={"ac-episode"+(st?.status==="COMPLETED"?" is-done":st?.status==="IN_PROGRESS"?" is-started":"")} href={`/academy/series/${series.slug}/episodes/${e.slug}`}>
    <span className="ac-episode-num" aria-hidden="true">{st?.status==="COMPLETED"?<NavIcon name="check"/>:String(e.number).padStart(2,"0")}</span>
    <span className="ac-episode-body"><strong>{e.code} · {e.title}</strong><small>{e.summary}</small><span className="ac-meta-row"><ModeChip mode={e.deliveryMode}/><TierChip tier={e.accessTier}/><span>{duration(e.durationSeconds)}</span>{st?.status==="IN_PROGRESS"&&<span className="ac-state">Em curso · {st.progressPercent}%</span>}{st?.status==="COMPLETED"&&<span className="ac-state ac-state--done">Concluído</span>}</span></span>
   </Link></li>})}</ol></>
  :<section className="card ac-about"><h2>Sobre esta série</h2><p>{series.description}</p><p className="small">Os episódios podem ser vídeo, leitura, híbridos ou entregues no Telegram. O progresso fica registado por episódio, independentemente do formato. Certificados só existem quando houver política aprovada.</p></section>}
 </section>;
}
