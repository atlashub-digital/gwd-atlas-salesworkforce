"use client";
import {useCallback,useEffect,useState} from "react";
import {api} from "../../lib/client";
type Post={id:string;authorName:string;own:boolean;body:string|null;state:"PUBLISHED"|"HIDDEN"|"REMOVED";createdAt:string;replies?:Post[]};
type Space={id:string;title:string;description:string};
const reasons:[string,string][]=[["SPAM","Spam ou publicidade"],["RESPEITO","Falta de respeito"],["PRIVACIDADE","Dados pessoais de terceiros"],["PROMESSA_RENDIMENTO","Promessa de rendimento"],["OUTRO","Outro motivo"]];
const when=(iso:string)=>new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));
/** Community V1 feed: real posts from the API (RLS-scoped). Empty states are honest; nothing is invented. */
export default function CommunityFeed(){
 const [spaces,setSpaces]=useState<Space[]>([]),[space,setSpace]=useState(""),[posts,setPosts]=useState<Post[]|null>(null),[draft,setDraft]=useState(""),[reply,setReply]=useState<{to:string;text:string}|null>(null),[report,setReport]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const loadPosts=useCallback(async(id:string)=>{setPosts(null);try{setPosts((await api(`community/spaces/${id}/posts`)).items);}catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar.");setPosts([]);}},[]);
 useEffect(()=>{void(async()=>{try{const data=await api("community/spaces");setSpaces(data.items);if(data.items[0]){setSpace(data.items[0].id);await loadPosts(data.items[0].id);}else setPosts([]);}catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar.");setPosts([]);}})();},[loadPosts]);
 async function run(action:()=>Promise<unknown>,ok?:string){setBusy(true);setError("");setNotice("");try{await action();if(ok)setNotice(ok);await loadPosts(space);}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 const publish=()=>run(async()=>{await api(`community/spaces/${space}/posts`,{body:draft});setDraft("");},"Publicação feita.");
 const answer=(to:string,text:string)=>run(async()=>{await api(`community/spaces/${space}/posts`,{body:text,parentId:to});setReply(null);});
 const remove=(id:string)=>run(()=>api(`community/posts/${id}/remove`,{}),"Publicação removida.");
 const flag=(id:string,reason:string)=>run(async()=>{await api(`community/posts/${id}/report`,{reason});setReport("");},"Denúncia registada. A equipa de moderação vai rever.");
 const item=(p:Post,top:boolean)=><article key={p.id} className={"feed-post"+(top?"":" feed-reply")}>
  <header><strong>{p.authorName}</strong><time dateTime={p.createdAt}>{when(p.createdAt)}</time>{p.state!=="PUBLISHED"&&<span className="muted">{p.state==="REMOVED"?"Removida por ti":"Oculta para revisão"}</span>}</header>
  {p.body&&<p className="feed-body">{p.body}</p>}
  {p.state==="PUBLISHED"&&<div className="feed-actions">
   {top&&<button className="button ghost small" disabled={busy} onClick={()=>setReply({to:p.id,text:""})}>Responder</button>}
   {p.own?<button className="button ghost small" disabled={busy} onClick={()=>void remove(p.id)}>Remover</button>
    :report===p.id?<span className="feed-report"><label className="sr-only" htmlFor={"r-"+p.id}>Motivo</label><select id={"r-"+p.id} defaultValue="" onChange={e=>e.target.value&&void flag(p.id,e.target.value)}><option value="" disabled>Motivo da denúncia</option>{reasons.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></span>
    :<button className="button ghost small" disabled={busy} onClick={()=>setReport(p.id)}>Denunciar</button>}
  </div>}
  {top&&p.replies?.map(r=>item(r,false))}
  {top&&reply?.to===p.id&&<form className="feed-compose" onSubmit={e=>{e.preventDefault();void answer(p.id,reply.text);}}><label className="sr-only" htmlFor={"a-"+p.id}>Resposta</label><textarea id={"a-"+p.id} rows={2} maxLength={2000} value={reply.text} onChange={e=>setReply({to:p.id,text:e.target.value})} placeholder="Escreve a tua resposta"/><div className="feed-actions"><button className="button small" disabled={busy||reply.text.trim().length<2}>Responder</button><button type="button" className="button ghost small" onClick={()=>setReply(null)}>Cancelar</button></div></form>}
 </article>;
 return <section className="card community-feed" aria-labelledby="feed-title">
  <div className="card-head"><h2 id="feed-title">Feed da comunidade</h2></div>
  {spaces.length>1&&<div className="feed-spaces" role="tablist" aria-label="Espaços">{spaces.map(s=><button key={s.id} role="tab" aria-selected={s.id===space} className={"chip"+(s.id===space?" active":"")} onClick={()=>{setSpace(s.id);void loadPosts(s.id);}}>{s.title}</button>)}</div>}
  {spaces.find(s=>s.id===space)&&<p className="muted">{spaces.find(s=>s.id===space)?.description}</p>}
  {error&&<p className="notice error" role="alert">{error}</p>}{notice&&<p className="notice success" role="status">{notice}</p>}
  {space&&<form className="feed-compose" onSubmit={e=>{e.preventDefault();void publish();}}><label htmlFor="feed-draft">Partilha com a comunidade</label><textarea id="feed-draft" rows={3} maxLength={2000} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Uma dúvida, uma conquista, uma dica útil…"/><div className="feed-actions"><span className="muted">Sem dados de terceiros nem promessas de rendimento.</span><button className="button" disabled={busy||draft.trim().length<2}>Publicar</button></div></form>}
  {posts===null?<p role="status">A carregar…</p>:posts.length?<div className="feed-list">{posts.map(p=>item(p,true))}</div>:space?<p className="muted">Ainda não há publicações neste espaço. Sê a primeira pessoa a partilhar.</p>:null}
 </section>;
}
