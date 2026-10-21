"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {NavIcon,Status} from "@gwd/ui";
import {api} from "../../lib/client";
import Player from "./Player";
import {ModeChip,TierChip,duration} from "./presentation";
import type {ApiEpisode,ApiSeries,Asset,Progress} from "./types";
type Detail={episode:ApiEpisode;progress:Progress;entitlement:{ref:string;active:boolean}};
type Tab="video"|"ler"|"recursos"|"notas"|"telegram";
/** Episode page (academy master board 11/12): player/reader/hybrid tabs, Telegram handoff, quiz, server-ruled completion. */
export default function EpisodeView({seriesSlug,episodeSlug}:{seriesSlug:string;episodeSlug:string}){
 const [detail,setDetail]=useState<Detail|null>(null),[series,setSeries]=useState<ApiSeries|null>(null),[error,setError]=useState(""),[tab,setTab]=useState<Tab>("video"),[notice,setNotice]=useState<{tone:"success"|"error"|"info";text:string}|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{setDetail(null);Promise.all([api("academy/episodes/"+episodeSlug),api("academy/series/"+seriesSlug)]).then(([d,s])=>{setDetail(d);setSeries(s.series);const e=d.episode as ApiEpisode;setTab(e.deliveryMode==="TELEGRAM"?"telegram":e.assets.some(a=>a.kind==="video")?"video":"ler")}).catch(e=>setError(e instanceof Error?e.message:"Episódio indisponível."))},[seriesSlug,episodeSlug]);
 const onProgress=useCallback((p:Progress)=>setDetail(d=>d?{...d,progress:p}:d),[]);
 if(error)return <div className="page-heading"><h1>Episódio indisponível</h1><p className="notice error" role="alert">{error}</p><Link className="link" href={"/academy/series/"+seriesSlug}>← Voltar à série</Link></div>;
 if(!detail||!series)return <div className="page-heading" role="status"><span className="eyebrow">GWD Academy</span><h1>A carregar o episódio…</h1></div>;
 const {episode:e,progress,entitlement}=detail,assets=e.assets,video=assets.find(a=>a.kind==="video"),reader=assets.find(a=>a.kind==="reader"),resources=assets.find(a=>a.kind==="resource"),quiz=assets.find(a=>a.kind==="quiz");
 const index=series.episodes.findIndex(x=>x.slug===e.slug),prev=series.episodes[index-1],next=series.episodes[index+1],done=progress.status==="COMPLETED";
 const tabs:[Tab,string][]=[...(e.deliveryMode==="TELEGRAM"?[["telegram","Telegram"]] as [Tab,string][]:[]),...(video?[["video","Vídeo"]] as [Tab,string][]:[]),...(reader?[["ler","Ler"]] as [Tab,string][]:[]),["recursos","Recursos"],["notas","Notas"]];
 async function complete(){setBusy(true);setNotice(null);try{const r=await api("academy/progress/complete",{episode_id:e.id});onProgress(r.progress);const xp=(r.xp??[]).reduce((a:number,x:{points:number})=>a+x.points,0);setNotice({tone:"success",text:"Episódio concluído."+(xp?` +${xp} XP registados.`:"")+(r.seriesCompleted?" Série concluída!":"")});}catch(err){setNotice({tone:"error",text:err instanceof Error?err.message:"Ainda não é possível concluir."});}finally{setBusy(false);}}
 async function handoff(){setBusy(true);setNotice(null);try{await api("academy/telegram-handoff-opened",{episode_id:e.id});setNotice({tone:"info",text:"Registámos que abriste o Telegram. O acesso controlado ao canal ainda não está ligado nesta plataforma — quando estiver, o convite é gerado aqui, por pessoa e com validade. Abrir o Telegram não conclui o episódio."});}catch(err){setNotice({tone:"error",text:err instanceof Error?err.message:"Tenta novamente."});}finally{setBusy(false);}}
 return <section className="ac-episode-page">
  <nav className="ac-crumbs" aria-label="Localização"><Link href="/academy">Academy</Link><span aria-hidden="true">/</span><Link href={"/academy/series/"+series.slug}>{series.title}</Link><span aria-hidden="true">/</span><span>Temporada {e.seasonNumber} · {e.code}</span></nav>
  <div className="ac-episode-grid">
   <div className="ac-episode-main">
    {!entitlement.active?<div className="ac-player ac-player--locked"><span className="ac-lock" aria-hidden="true"><NavIcon name="lock"/></span><strong>Episódio {e.accessTier==="PREMIUM"?"Premium":e.accessTier==="CERTIFIED"?"de certificação":"para membros"}</strong><p>O teu acesso a este episódio não está ativo. A autorização é verificada no servidor (ARO).</p><Status>CHECKOUT EM PREPARAÇÃO</Status></div>
     :tab==="video"&&video?<Player episodeId={e.id} title={e.title} progress={progress} onProgress={onProgress}/>
     :tab==="telegram"?<div className="ac-player ac-player--telegram"><strong>Este episódio é entregue no Telegram</strong><p>O catálogo, o teu progresso e a conclusão ficam sempre na GWD.</p><button className="button" disabled={busy} onClick={()=>void handoff()}>Continuar no Telegram</button></div>
     :<div className="ac-player ac-player--reader-hint"><strong>{e.title}</strong><p>{reader?"Episódio em formato de leitura — abre o separador Ler.":"Consulta os recursos deste episódio."}</p></div>}
    <header className="ac-episode-head"><div className="ac-meta-row"><ModeChip mode={e.deliveryMode}/><TierChip tier={e.accessTier}/><span>{duration(e.durationSeconds)}</span>{progress.status==="IN_PROGRESS"&&<span className="ac-state">Em curso · {progress.progress_percent}%</span>}{done&&<span className="ac-state ac-state--done">Concluído</span>}</div><h1>{e.code} · {e.title}</h1><p>{e.summary}</p></header>
    {entitlement.active&&<><div className="ac-tabs" role="tablist" aria-label="Formato do episódio">{tabs.map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} onClick={()=>setTab(k)}>{l}</button>)}</div>
    <div className="ac-tab-panel">
     {tab==="ler"&&reader&&<Reader episodeId={e.id} asset={reader} onProgress={onProgress}/>}
     {tab==="recursos"&&(resources?.resources?.length?<ul className="ac-resources">{resources.resources.map(r=><li key={r.title}><strong>{r.title}</strong><span>{r.description}</span></li>)}</ul>:<p className="small muted">Este episódio não tem recursos adicionais.</p>)}
     {tab==="notas"&&<div className="ac-notes"><Status tone="neutral">EM BREVE</Status><p>As notas pessoais por episódio ficam disponíveis quando forem guardadas no servidor com a tua conta.</p></div>}
     {(tab==="video"||tab==="telegram")&&<p className="small muted">{e.deliveryMode==="TELEGRAM"?"Depois de veres o episódio no Telegram, volta aqui e marca-o como visto.":"A conclusão exige ver pelo menos 90% com participação real — avançar até ao fim não conta."}</p>}
    </div>
    {quiz?.quiz?.length?<Quiz episodeId={e.id} questions={quiz.quiz}/>:null}
    <div className="ac-episode-actions">{!done&&<button className="button" disabled={busy} onClick={()=>void complete()}>{e.deliveryMode==="TELEGRAM"?"Marcar como visto":"Marcar como concluído"}</button>}{next&&<Link className="button secondary" href={`/academy/series/${series.slug}/episodes/${next.slug}`}>Próximo episódio <span className="arrow" aria-hidden="true">→</span></Link>}{prev&&<Link className="button ghost" href={`/academy/series/${series.slug}/episodes/${prev.slug}`}>← Anterior</Link>}</div>
    <div role="status" aria-live="polite">{notice&&<p className={"notice "+notice.tone}>{notice.text}</p>}</div></>}
   </div>
   <aside className="ac-episode-side" aria-label="Nesta série"><h2>Nesta série</h2><ol>{series.episodes.map(x=><li key={x.id}><Link aria-current={x.slug===e.slug?"page":undefined} href={`/academy/series/${series.slug}/episodes/${x.slug}`}><span>{String(x.number).padStart(2,"0")}</span><span><strong>{x.title}</strong><small>{duration(x.durationSeconds)} · {x.accessTier==="FREE"?"Grátis":x.accessTier==="MEMBER"?"Membro":"Premium"}</small></span></Link></li>)}</ol></aside>
  </div>
 </section>;
}

/** WebReader: section index, active reading time (visible tab only), furthest section sent to the server. */
function Reader({episodeId,asset,onProgress}:{episodeId:string;asset:Asset;onProgress:(p:Progress)=>void}){
 const [section,setSection]=useState(0),reading=useRef(0),sections=asset.sections??[];
 useEffect(()=>{const t=window.setInterval(()=>{if(document.visibilityState==="visible")reading.current+=1},1000);return()=>window.clearInterval(t)},[]);
 useEffect(()=>{const send=()=>api("academy/progress/heartbeat",{episode_id:episodeId,reading_s:reading.current,reader_section:section+1}).then(r=>onProgress(r.progress)).catch(()=>{});const t=window.setInterval(send,25000);return()=>{window.clearInterval(t);void send()}},[episodeId,section,onProgress]);
 return <div className="ac-reader"><nav aria-label="Índice da leitura"><ol>{sections.map((s,i)=><li key={s.heading}><button type="button" aria-current={i===section?"step":undefined} onClick={()=>setSection(i)}>{s.heading}</button></li>)}</ol></nav>
  <article><span className="eyebrow">Secção {section+1} de {sections.length}</span><h2>{sections[section]?.heading}</h2><p>{sections[section]?.body}</p>{section<sections.length-1&&<button className="button secondary small" onClick={()=>setSection(section+1)}>Secção seguinte →</button>}</article></div>;
}

function Quiz({episodeId,questions}:{episodeId:string;questions:{id:string;prompt:string;options:string[]}[]}){
 const [answers,setAnswers]=useState<Record<string,number>>({}),[result,setResult]=useState<{passed:boolean;score:number}|null>(null),[error,setError]=useState("");
 async function submit(){setError("");try{setResult(await api("academy/quiz/"+episodeId+"/submit",{answers}));}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}}
 return <section className="card ac-quiz"><h2>Verificação</h2>{questions.map(q=><fieldset key={q.id}><legend>{q.prompt}</legend>{q.options.map((o,i)=><label className="check" key={o}><input type="radio" name={q.id} checked={answers[q.id]===i} onChange={()=>setAnswers({...answers,[q.id]:i})}/><span>{o}</span></label>)}</fieldset>)}
  <button className="button small" disabled={Object.keys(answers).length<questions.length} onClick={()=>void submit()}>Submeter respostas</button>
  <div role="status" aria-live="polite">{result&&<p className={"notice "+(result.passed?"success":"error")}>{result.passed?"Aprovado.":"Ainda não — revê o conteúdo e tenta de novo."} Resultado: {Math.round(result.score<=1?result.score*100:result.score)}%</p>}{error&&<p className="notice error">{error}</p>}</div></section>;
}
