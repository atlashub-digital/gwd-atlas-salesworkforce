"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {Status} from "@gwd/ui";
import {partnerTerms,type PartnerKind} from "@gwd/config";
import {api} from "../../lib/client";
import {ScreenHeader} from "./bits";

/* Commercial area: Novidades.Store catalogue (source of truth, prices never copied), affiliate / authorized-seller
   applications and terms, attributed links with verified clicks, materials and results. Every state is the real one:
   nothing is shown as operational before approval, an ACTIVE offer programme and ARO reconciliation. */

type Program={status:"ACTIVE"|"PENDING_CONDITIONS"|"PAUSED"|"NOT_LISTED";conditions:string};
export type Offer={slug:string;title:string;subtitle:string;description:string;category:string;image:string|null;priceCents:number;currency:string;fulfillment:string;url:string;programs:{AFFILIATE:Program;RESELLER:Program}};
type Application={id:string;kind:PartnerKind;status:"SUBMITTED"|"APPROVED"|"REJECTED";market:string;decision_note:string;created_at:string};
type PartnerLink={id:string;offer_slug:string;campaign:string;url:string;clicks:number;last_click:string|null};
type Partner={termsVersion:string;applications:Application[];terms:{kind:PartnerKind;terms_version:string}[];capabilities:string[];code:string|null;links:PartnerLink[];sales:{aro_order_id:string;status:string}[];accruals:{aro_order_id:string;amount_minor:number;currency:string;status:string}[]};

const money=(cents:number,currency:string)=>new Intl.NumberFormat(currency==="EUR"?"pt-PT":"pt-BR",{style:"currency",currency}).format(cents/100);
const marketOf=(currency:string)=>currency==="EUR"?"Europa":currency==="BRL"?"Brasil":"Outros";
const programLabel:Record<Program["status"],{text:string;tone:"success"|"warning"|"neutral"}>={
 ACTIVE:{text:"ATIVA",tone:"success"},PENDING_CONDITIONS:{text:"CONDIÇÕES EM VALIDAÇÃO",tone:"warning"},PAUSED:{text:"PAUSADA",tone:"neutral"},NOT_LISTED:{text:"SEM PROGRAMA",tone:"neutral"}};

function useLoad<T>(path:string){
 const [data,setData]=useState<T|null>(null),[error,setError]=useState(""),[code,setCode]=useState("");
 const load=useCallback(async()=>{setError("");try{setData(await api(path));}catch(e){const message=e instanceof Error?e.message:"Não foi possível carregar.";setError(message);setCode(/ativação/.test(message)?"PENDING":"");}},[path]);
 useEffect(()=>{void load();},[load]);
 return {data,error,pending:code==="PENDING",reload:load};
}
function Pending({what}:{what:string}){return <section className="card empty-inline"><Status>EM ATIVAÇÃO</Status><h2>{what} está em ativação.</h2><p>A estrutura está pronta e aguarda a ativação técnica na base de dados. Entretanto, conclui o percurso correspondente na Academy.</p><Link className="button secondary" href="/percursos">Os meus percursos</Link></section>;}

/* ---------- Produtos e Ofertas ---------- */
export function OffersScreen(){
 const {data,error}=useLoad<{items:Offer[]}>("offers");
 const [type,setType]=useState("all"),[market,setMarket]=useState("all"),[eligibility,setEligibility]=useState("all"),[open,setOpen]=useState<string|null>(null);
 const items=useMemo(()=>(data?.items??[]).filter(o=>(type==="all"||o.fulfillment===type)&&(market==="all"||marketOf(o.currency)===market)
  &&(eligibility==="all"||(eligibility==="affiliate"&&o.programs.AFFILIATE.status==="ACTIVE")||(eligibility==="reseller"&&o.programs.RESELLER.status==="ACTIVE")||(eligibility==="pilot"&&o.programs.AFFILIATE.status!=="NOT_LISTED"))),[data,type,market,eligibility]);
 return <section className="member-offers">
  <ScreenHeader icon="produtos" title="Produtos e Ofertas" subtitle="Catálogo oficial da Novidades.Store. Preços, descrições e compra são sempre os da loja."/>
  {error&&<p className="notice error" role="alert">{error}</p>}
  <div className="offer-filters" role="group" aria-label="Filtrar ofertas">
   <label className="field"><span>Tipo</span><select value={type} onChange={e=>setType(e.target.value)}><option value="all">Todos</option><option value="digital">Digital</option><option value="physical">Físico</option></select></label>
   <label className="field"><span>Mercado</span><select value={market} onChange={e=>setMarket(e.target.value)}><option value="all">Todos</option><option value="Brasil">Brasil</option><option value="Europa">Europa</option></select></label>
   <label className="field"><span>Elegibilidade</span><select value={eligibility} onChange={e=>setEligibility(e.target.value)}><option value="all">Todas</option><option value="pilot">Programa de afiliação (ativo ou em validação)</option><option value="affiliate">Afiliação ativa</option><option value="reseller">Revenda ativa</option></select></label>
  </div>
  {data===null&&!error?<p className="small muted" role="status">A carregar o catálogo da Novidades.Store…</p>:
  <><p className="small muted">{items.length} {items.length===1?"oferta":"ofertas"} · {data?.items.filter(o=>o.programs.AFFILIATE.status==="ACTIVE").length??0} com afiliação ativa</p>
  <div className="offer-grid">{items.map(o=><article className={"card offer-card"+(open===o.slug?" is-open":"")} key={o.slug}>
   {o.image&&<img className="offer-card-media" src={o.image} alt={o.title} width={320} height={200} loading="lazy" decoding="async"/>}
   <span className="eyebrow">{o.category} · {marketOf(o.currency)}</span>
   <h2>{o.title}</h2><p>{o.subtitle}</p>
   <p className="offer-price">{money(o.priceCents,o.currency)}</p>
   <dl className="offer-programs"><div><dt>Afiliação</dt><dd><Status tone={programLabel[o.programs.AFFILIATE.status].tone}>{programLabel[o.programs.AFFILIATE.status].text}</Status></dd></div><div><dt>Revenda</dt><dd><Status tone={programLabel[o.programs.RESELLER.status].tone}>{programLabel[o.programs.RESELLER.status].text}</Status></dd></div></dl>
   <button type="button" className="link offer-toggle" aria-expanded={open===o.slug} onClick={()=>setOpen(open===o.slug?null:o.slug)}>{open===o.slug?"Fechar detalhe":"Ver detalhe e condições"}</button>
   {open===o.slug&&<div className="offer-detail">
    <h3>Descrição oficial</h3><p>{o.description}</p>
    <h3>Condições comerciais</h3>
    {o.programs.AFFILIATE.status==="ACTIVE"?<p className="offer-conditions">{o.programs.AFFILIATE.conditions}</p>:<p className="small">Ainda não existem condições de afiliação publicadas para esta oferta. Não divulgues com link próprio até estarem ativas.</p>}
    {o.programs.RESELLER.status==="ACTIVE"&&<p className="offer-conditions">{o.programs.RESELLER.conditions}</p>}
    <div className="actions"><a className="button" href={o.url} target="_blank" rel="noopener noreferrer">Ver na Novidades.Store <span aria-hidden="true">↗</span><span className="sr-only"> (abre num novo separador)</span></a>{o.programs.AFFILIATE.status==="ACTIVE"&&<Link className="button secondary" href="/afiliado">Gerar o meu link</Link>}</div>
   </div>}
  </article>)}</div></>}
 </section>;
}

/* ---------- candidatura (afiliado / vendedor autorizado) ---------- */
function ApplicationForm({kind,onDone}:{kind:PartnerKind;onDone:()=>void}){
 const [form,setForm]=useState({market:"BR",channels:"",motivation:"",acceptRules:false}),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{await api("partner/applications",{kind,...form});onDone();}catch(err){setError(err instanceof Error?err.message:"Tenta novamente.");}finally{setBusy(false);}}
 const path=kind==="AFFILIATE"?{slug:"afiliado-digital",name:"Afiliado Digital"}:{slug:"revendedor-autorizado",name:"Revendedor Autorizado"};
 return <form className="card form partner-form" onSubmit={submit}>
  <h2>Candidatura a {kind==="AFFILIATE"?"afiliado":"vendedor autorizado"}</h2>
  <p className="small">Recomendado: conclui primeiro o percurso <Link className="link" href={"/academy/series/"+path.slug}>{path.name}</Link>. A equipa vê o teu progresso na Academy quando analisa a candidatura.</p>
  <label className="field"><span>Mercado principal</span><select value={form.market} onChange={e=>setForm({...form,market:e.target.value})}><option value="BR">Brasil</option><option value="EU">Europa</option><option value="OTHER">Outro</option></select></label>
  <label className="field"><span>Onde vais divulgar (canais e público)</span><textarea rows={3} maxLength={1000} required value={form.channels} onChange={e=>setForm({...form,channels:e.target.value})} placeholder="Ex.: Instagram sobre organização pessoal, cerca de 2 mil seguidores; newsletter com 300 inscritos."/></label>
  <label className="field"><span>Porque te candidatas</span><textarea rows={4} maxLength={2000} required value={form.motivation} onChange={e=>setForm({...form,motivation:e.target.value})} placeholder="O que conheces das ofertas, para quem as recomendarias e como."/></label>
  <label className="check"><input type="checkbox" checked={form.acceptRules} onChange={e=>setForm({...form,acceptRules:e.target.checked})}/><span>Conheço as regras de transparência: identifico sempre a relação comercial, não faço promessas de rendimento e não envio spam.</span></label>
  {error&&<p className="notice error" role="alert">{error}</p>}
  <button className="button" disabled={busy||!form.acceptRules}>{busy?"A enviar…":"Enviar candidatura"}</button>
 </form>;
}
function TermsCard({kind,version,onDone}:{kind:PartnerKind;version:string;onDone:()=>void}){
 const [ok,setOk]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");const terms=partnerTerms[kind];
 async function accept(){setBusy(true);setError("");try{await api("partner/terms",{kind,version});onDone();}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 return <section className="card partner-terms"><Status tone="success">CANDIDATURA APROVADA</Status><h2>{terms.title}</h2><p className="small muted">Versão {version}</p>
  <ol>{terms.clauses.map(c=><li key={c}>{c}</li>)}</ol>
  <label className="check"><input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)}/><span>Li e aceito estes termos.</span></label>
  {error&&<p className="notice error" role="alert">{error}</p>}
  <button className="button" disabled={!ok||busy} onClick={()=>void accept()}>Aceitar termos</button></section>;
}
function ApplicationStatus({app}:{app:Application}){
 const label={SUBMITTED:["EM ANÁLISE","warning","A equipa está a analisar a tua candidatura. Vais ver aqui a decisão."],APPROVED:["APROVADA","success","Candidatura aprovada."],REJECTED:["NÃO APROVADA","neutral","A candidatura não foi aprovada nesta fase. Podes rever o teu percurso e candidatar-te de novo."]}[app.status] as [string,"warning"|"success"|"neutral",string];
 return <section className="card"><Status tone={label[1]}>{label[0]}</Status><h2>A tua candidatura</h2><p>{label[2]}</p>{app.decision_note&&<p className="small">Nota da equipa: {app.decision_note}</p>}<p className="small muted">Enviada a {new Date(app.created_at).toLocaleDateString("pt-PT")}</p></section>;
}
function usePartner(){return useLoad<Partner>("partner");}
function stage(p:Partner|null,kind:PartnerKind){
 const app=p?.applications.find(a=>a.kind===kind&&a.status!=="REJECTED")??p?.applications.find(a=>a.kind===kind);
 const terms=!!p?.terms.some(t=>t.kind===kind&&t.terms_version===p.termsVersion);
 return {app,terms,active:app?.status==="APPROVED"&&terms};
}

/* ---------- Área do Afiliado ---------- */
export function AffiliateScreen(){
 const partner=usePartner(),offers=useLoad<{items:Offer[]}>("offers");
 const p=partner.data,{app,terms,active}=stage(p,"AFFILIATE");
 const eligible=(offers.data?.items??[]).filter(o=>o.programs.AFFILIATE.status==="ACTIVE");
 const [offer,setOffer]=useState(""),[campaign,setCampaign]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[copied,setCopied]=useState("");
 async function create(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");try{await api("partner/links",{offerSlug:offer,campaign});setCampaign("");await partner.reload();setMsg("Link pronto. Identifica sempre a parceria antes de o partilhar.");}catch(err){setMsg(err instanceof Error?err.message:"Tenta novamente.");}finally{setBusy(false);}}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setCopied(text);}catch{setCopied("");}}
 return <section className="member-affiliate">
  <ScreenHeader icon="afiliado" title="Área do Afiliado" subtitle="Candidatura, termos, links atribuídos e cliques verificados. Comissões só depois de vendas aprovadas e conciliadas."/>
  {partner.pending?<Pending what="A área de afiliados"/>:partner.error?<p className="notice error" role="alert">{partner.error}</p>:!p?<p className="small muted" role="status">A carregar…</p>:<>
   {(!app||app.status==="REJECTED")&&<>{app&&<ApplicationStatus app={app}/>}<ApplicationForm kind="AFFILIATE" onDone={()=>void partner.reload()}/></>}
   {app&&app.status!=="REJECTED"&&!active&&(app.status==="APPROVED"?<TermsCard kind="AFFILIATE" version={p.termsVersion} onDone={()=>void partner.reload()}/>:<ApplicationStatus app={app}/>)}
   {active&&<>
    <section className="card"><Status tone="success">AFILIADO ATIVO</Status><h2>Gerar link atribuído</h2>
     {eligible.length?<form className="link-form" onSubmit={create}>
      <label className="field"><span>Oferta</span><select required value={offer} onChange={e=>setOffer(e.target.value)}><option value="">Escolhe uma oferta com afiliação ativa</option>{eligible.map(o=><option key={o.slug} value={o.slug}>{o.title}</option>)}</select></label>
      <label className="field"><span>Identificação de campanha (opcional)</span><input value={campaign} onChange={e=>setCampaign(e.target.value.toLowerCase())} pattern="[a-z0-9-]{0,40}" maxLength={40} placeholder="ex.: stories-semana1"/></label>
      <button className="button" disabled={busy||!offer}>Gerar link</button>
     </form>:<p>Ainda não existem ofertas com condições de afiliação ativas. As ofertas piloto (Conversion Content OS, Social Content OS e Email Conversion Kit) ficam disponíveis assim que as condições forem confirmadas.</p>}
     {msg&&<p className="notice" role="status">{msg}</p>}
    </section>
    <section className="card"><h2>Os meus links</h2>{p.links.length?<ul className="link-list">{p.links.map(l=><li key={l.id}><div><strong>{offers.data?.items.find(o=>o.slug===l.offer_slug)?.title??l.offer_slug}</strong>{l.campaign&&<span className="small muted"> · {l.campaign}</span>}<code>{l.url}</code></div><div className="link-stats"><span><strong>{l.clicks}</strong> {l.clicks===1?"clique":"cliques"}</span><button type="button" className="button small secondary" onClick={()=>void copy(l.url)}>{copied===l.url?"Copiado":"Copiar"}</button></div></li>)}</ul>:<p className="small muted">Ainda não geraste links.</p>}
     <p className="small muted">Cliques verificados: pré-visualizações de WhatsApp, Telegram e redes sociais e acessos automáticos não contam.</p></section>
   </>}
  </>}
 </section>;
}

/* ---------- Vendedor Autorizado ---------- */
export function SellerScreen(){
 const partner=usePartner(),p=partner.data,{app,active}=stage(p,"AUTHORIZED_SELLER");
 return <section className="member-seller">
  <ScreenHeader icon="revenda" title="Vendedor Autorizado" subtitle="Margem sujeita a regras de preço por oferta. Checkout sempre oficial; nenhum pagamento passa pelo vendedor."/>
  {partner.pending?<Pending what="A candidatura a vendedor autorizado"/>:partner.error?<p className="notice error" role="alert">{partner.error}</p>:!p?<p className="small muted" role="status">A carregar…</p>:<>
   {(!app||app.status==="REJECTED")&&<>{app&&<ApplicationStatus app={app}/>}<ApplicationForm kind="AUTHORIZED_SELLER" onDone={()=>void partner.reload()}/></>}
   {app&&app.status!=="REJECTED"&&!active&&(app.status==="APPROVED"?<TermsCard kind="AUTHORIZED_SELLER" version={p.termsVersion} onDone={()=>void partner.reload()}/>:<ApplicationStatus app={app}/>)}
   {active&&<section className="card"><Status tone="success">ESTATUTO APROVADO</Status><h2>Revenda em preparação</h2><p>O teu estatuto de vendedor autorizado está registado. A revenda ainda não está operacional: as regras de preço e margem por oferta e a homologação económica com o ARO estão em preparação. Não vendas em nome da GWD até a revenda estar ativa aqui.</p></section>}
  </>}
  <section className="card"><h2>Afiliado ou vendedor autorizado?</h2><p><strong>Afiliado:</strong> recomenda ofertas com um link próprio; a loja trata da venda; recebe comissão sobre vendas confirmadas.</p><p><strong>Vendedor autorizado:</strong> acompanha clientes antes, durante e depois da compra, dentro de regras comerciais aprovadas; recebe margem sujeita às regras de preço de cada oferta.</p><Link className="link" href="/academy/series/revendedor-autorizado">Percurso Revendedor Autorizado →</Link></section>
 </section>;
}

/* ---------- Materiais de Divulgação ---------- */
export function MaterialsScreen(){
 const offers=useLoad<{items:Offer[]}>("offers");
 const active=(offers.data?.items??[]).filter(o=>o.programs.AFFILIATE.status==="ACTIVE");
 return <section className="member-materials">
  <ScreenHeader icon="toolkit" title="Materiais de Divulgação" subtitle="Textos de apoio, imagens oficiais e orientações por oferta com afiliação ativa."/>
  <section className="card"><h2>Orientações para qualquer divulgação</h2><ol className="guidelines">
   <li>Identifica a relação comercial antes do link: “Publicidade: recebo uma comissão se comprares através deste link.”</li>
   <li>Usa a descrição oficial. Não inventes funcionalidades, bónus, descontos ou resultados.</li>
   <li>Sem promessas de rendimento, cura ou resultado garantido, e sem capturas de ganhos.</li>
   <li>Divulga nos teus canais. Nada de mensagens não solicitadas nem de grupos sem consentimento.</li>
   <li>Usa uma identificação de campanha por canal para saberes o que funciona.</li>
  </ol><Link className="link" href="/academy/series/afiliado-digital">Percurso Afiliado Digital →</Link></section>
  {offers.error&&<p className="notice error" role="alert">{offers.error}</p>}
  {offers.data&&(active.length?active.map(o=><section className="card material-card" key={o.slug}>
   {o.image&&<img src={o.image} alt={o.title} width={320} height={200} loading="lazy" decoding="async"/>}
   <div><h2>{o.title}</h2><p className="small">{o.description}</p>
    <h3>Texto de apoio</h3><blockquote>Publicidade: recebo uma comissão se comprares através deste link, sem custo extra para ti.{"\n\n"}{o.title}: {o.subtitle} Inclui: {o.description} Vê todas as condições na página oficial: [o teu link]</blockquote>
    <p className="small">{o.image&&<a className="link" href={o.image} target="_blank" rel="noopener noreferrer">Imagem oficial ↗</a>} · <a className="link" href={o.url} target="_blank" rel="noopener noreferrer">Página oficial ↗</a></p></div>
  </section>):<section className="card empty-inline"><Status tone="warning">CONDIÇÕES EM VALIDAÇÃO</Status><h2>Ainda não há ofertas com afiliação ativa.</h2><p>Os materiais de cada oferta aparecem aqui quando as condições de afiliação forem confirmadas pela direção. Entretanto, prepara-te com o percurso Afiliado Digital.</p></section>)}
 </section>;
}

/* ---------- Resultados e Comissões ---------- */
const saleStatus:Record<string,string>={PENDING:"Pendente",APPROVED:"Aprovada",CONFIRMED:"Confirmada",REVERSED:"Revertida",REFUNDED:"Reembolsada",CHARGEBACK:"Contestada"};
export function ResultsScreen(){
 const partner=usePartner(),p=partner.data,clicks=p?.links.reduce((n,l)=>n+l.clicks,0)??0;
 return <section className="member-results">
  <ScreenHeader icon="resultados" title="Resultados e Comissões" subtitle="Cliques verificados, vendas atribuídas e comissões com o estado real de cada uma."/>
  {partner.pending?<Pending what="A área de resultados"/>:partner.error?<p className="notice error" role="alert">{partner.error}</p>:!p?<p className="small muted" role="status">A carregar…</p>:<>
   <div className="grid results-stats">
    <section className="card"><span className="eyebrow">Cliques verificados</span><div className="stat">{clicks}</div><p className="small">{p.links.length} {p.links.length===1?"link":"links"} gerados</p></section>
    <section className="card"><span className="eyebrow">Vendas atribuídas</span><div className="stat">{p.sales.length}</div><p className="small">Confirmadas pelo sistema de pagamentos</p></section>
    <section className="card"><span className="eyebrow">Comissões</span><div className="stat">{p.accruals.length}</div><p className="small">Pendentes, confirmadas e revertidas</p></section>
   </div>
   <section className="card"><h2>Vendas e comissões</h2>
    {p.sales.length||p.accruals.length?<table className="results-table"><thead><tr><th scope="col">Pedido</th><th scope="col">Venda</th><th scope="col">Comissão</th></tr></thead><tbody>{p.sales.map(s=>{const a=p.accruals.find(x=>x.aro_order_id===s.aro_order_id);return <tr key={s.aro_order_id}><td><code>{s.aro_order_id.slice(0,12)}</code></td><td>{saleStatus[s.status]??s.status}</td><td>{a?`${money(a.amount_minor,a.currency)} · ${saleStatus[a.status]??a.status}`:"—"}</td></tr>;})}</tbody></table>
    :<><p>Ainda não existem vendas atribuídas.</p><p className="small muted">Uma venda só aparece aqui depois de ser aprovada pelo sistema de pagamentos e conciliada com o ARO. Nesta fase piloto não há pagamento de comissões: os estados são reais, a liquidação depende de homologação económica própria.</p></>}
   </section>
  </>}
 </section>;
}
