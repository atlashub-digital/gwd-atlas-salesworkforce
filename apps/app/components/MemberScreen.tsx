"use client";
import {useCallback,useEffect,useState} from "react";
import {PageHeading,EmptyState} from "@gwd/ui";
import {inactiveModules} from "@gwd/config";
import {api} from "../lib/client";
import ProfileForm from "./ProfileForm";
import Dashboard from "./member/Dashboard";
import JourneyScreen from "./member/JourneyScreen";
import CommunityScreen from "./member/CommunityScreen";
import OpportunitiesScreen from "./member/OpportunitiesScreen";
import PointsScreen from "./member/PointsScreen";
import type {Community,Journey,Me,Opportunity,Points} from "./member/types";
/** Loads the real API data for one member route and renders its screen. Commercial modules stay gated by config. */
export default function MemberScreen({screen}:{screen:string}){
 const [me,setMe]=useState<Me|null>(null),[journey,setJourney]=useState<Journey|null>(null),[points,setPoints]=useState<Points|null>(null),[community,setCommunity]=useState<Community|null>(null),[opportunities,setOpportunities]=useState<Opportunity[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState(false),[rules,setRules]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setError("");try{
  const profile=await api("me");setMe(profile);
  if(!profile.participant?.onboarding_completed&&screen!=="onboarding"&&screen!=="perfil"){window.location.assign("/onboarding");return;}
  if(screen==="dashboard"){const [j,p]=await Promise.all([api("journeys"),api("gamification/summary")]);setJourney(j);setPoints(p);}
  if(screen==="jornada")setJourney(await api("journeys"));
  if(screen==="pontos")setPoints(await api("gamification/summary"));
  if(screen==="comunidade")setCommunity(await api("community"));
  if(screen==="oportunidades")setOpportunities((await api("opportunities")).items);
 }catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar.");}finally{setLoading(false);}},[screen]);
 useEffect(()=>{void load();},[load]);
 async function complete(stepId:string){setBusy(true);setError("");try{await api("journeys/gwd-start/progress",{stepId});await load();}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 async function join(){setBusy(true);setError("");try{await api("community",{acceptRules:rules});await load();}catch(e){setError(e instanceof Error?e.message:"Tenta novamente.");}finally{setBusy(false);}}
 async function logout(){setBusy(true);try{const r=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logout"})});if(!r.ok)throw new Error();window.location.assign("/entrar");}catch{setError("Não foi possível terminar a sessão. Tenta novamente.");setBusy(false);}}
 if(loading)return <div className="page-heading" role="status"><span className="eyebrow">A tua área GWD</span><h1>A preparar o teu percurso…</h1></div>;
 if(!me)return <div className="page-heading"><h1>Vamos tentar novamente.</h1><p className="notice error" role="alert">{error}</p><button className="button" onClick={()=>void load()}>Tentar novamente</button></div>;
 const staged=inactiveModules[screen],participant=me.participant;
 return <>{error&&<div className="notice error" role="alert" style={{marginTop:20}}>{error}<button className="button small secondary" onClick={()=>void load()}>Tentar novamente</button></div>}
  {screen==="dashboard"&&<Dashboard name={participant?.display_name} journey={journey} points={points}/>}
  {screen==="jornada"&&<JourneyScreen journey={journey} busy={busy} complete={id=>void complete(id)}/>}
  {screen==="oportunidades"&&<OpportunitiesScreen opportunities={opportunities}/>}
  {screen==="comunidade"&&<CommunityScreen community={community} rules={rules} setRules={setRules} busy={busy} join={()=>void join()}/>}
  {screen==="pontos"&&<PointsScreen points={points}/>}
  {(screen==="perfil"||screen==="onboarding")&&<><PageHeading eyebrow={screen==="onboarding"?"Bem-vindo à GWD":"O teu perfil"} title={screen==="onboarding"?"O teu percurso começa contigo.":"Mostra-nos o teu próximo passo."} description="Escolhe os teus interesses. A comunidade e a aprendizagem são o ponto de partida; os papéis comerciais exigem aprovação."/><ProfileForm participant={participant} onboarding={screen==="onboarding"} onSaved={()=>void load()}/>{screen==="perfil"&&<p className="small">Capacidades concedidas: {me.capabilities?.map(cap=>({COMMUNITY:"Comunidade",LEARNING:"Aprendizagem",SOCIAL_MEDIA:"Social Media",AFFILIATE:"Afiliado",AUTHORIZED_SELLER:"Revendedor autorizado",MENTOR:"Mentor",TEAM_LEAD:"Líder de equipa"} as Record<string,string>)[cap]??"Em revisão").join(" · ")||"A definir após onboarding"}. Percurso: Maia Valente. Assistente dedicado ainda não ativado.</p>}</>}
  {screen==="configuracoes"&&<><PageHeading eyebrow="A tua conta" title="Tudo no teu controlo." description="Gere a sessão e conhece o estado dos módulos da plataforma."/><section className="card"><h2>Preferências e privacidade</h2><p>O teu mercado e interesses podem ser alterados no perfil. Notificações automáticas, assistente dedicado e operações comerciais ainda não estão ativados.</p><span className="status">AINDA NÃO ATIVADO</span><p className="small">Os pontos são registos de participação. Não existe processamento de pagamentos nesta versão.</p><button className="button secondary" onClick={()=>void logout()} disabled={busy}>Terminar sessão</button></section></>}
  {staged&&<><PageHeading eyebrow="A plataforma está a crescer" title={staged.title} description={staged.description}/><EmptyState title={staged.title} description={staged.description} status={staged.status}/></>}
 </>;
}
