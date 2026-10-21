"use client";
import {useEffect,useRef,useState} from "react";
import {api} from "../../lib/client";
import type {Progress} from "./types";
type Load={state:"loading"}|{state:"ready";url:string}|{state:"blocked";code:string;message:string};
const HEARTBEAT_MS=25000;
/** WebPlayer: server-issued short-lived HLS manifest (Atlas Media) → hls.js / native HLS.
 *  Heartbeats send real played seconds (engaged), never seek distance; resume from server position. */
export default function Player({episodeId,title,progress,onProgress}:{episodeId:string;title:string;progress:Progress|null;onProgress:(p:Progress)=>void}){
 const video=useRef<HTMLVideoElement>(null),engaged=useRef(progress?.engaged_seconds??0),lastTick=useRef<number|null>(null),[load,setLoad]=useState<Load>({state:"loading"});
 useEffect(()=>{let cancel=false;api("academy/episodes/"+episodeId+"/playback",{}).then(r=>{if(!cancel)setLoad({state:"ready",url:r.manifest_url})}).catch(e=>{if(!cancel)setLoad({state:"blocked",code:"",message:e instanceof Error?e.message:"Reprodução indisponível."})});return()=>{cancel=true}},[episodeId]);
 useEffect(()=>{if(load.state!=="ready"||!video.current)return;const el=video.current;let hls:{destroy:()=>void}|null=null;
  const resume=()=>{const at=progress?.last_position_seconds??0;if(at>0&&at<el.duration-5)el.currentTime=at;};
  el.addEventListener("loadedmetadata",resume,{once:true});
  if(el.canPlayType("application/vnd.apple.mpegurl"))el.src=load.url;
  else import("hls.js").then(({default:Hls})=>{if(!Hls.isSupported()){setLoad({state:"blocked",code:"UNSUPPORTED",message:"Este navegador não suporta reprodução HLS."});return;}const h=new Hls({maxBufferLength:30});h.on(Hls.Events.ERROR,(_e,d)=>{if(d.fatal)setLoad({state:"blocked",code:"EXPIRED",message:"A sessão de vídeo expirou ou falhou. Recarrega o episódio para continuar."})});h.loadSource(load.url);h.attachMedia(el);hls=h;});
  return()=>{hls?.destroy()}},[load,progress?.last_position_seconds]);
 useEffect(()=>{const el=video.current;if(!el)return;
  const tick=()=>{const now=performance.now();if(lastTick.current!==null&&!el.paused)engaged.current+=Math.min(2,(now-lastTick.current)/1000)*el.playbackRate;lastTick.current=el.paused?null:now;};
  const send=()=>{tick();if(!el.currentTime)return;api("academy/progress/heartbeat",{episode_id:episodeId,position_s:Math.round(el.currentTime),engaged_s:Math.round(engaged.current)}).then(r=>onProgress(r.progress)).catch(()=>{})};
  const timer=window.setInterval(tick,1000),beat=window.setInterval(()=>{if(!el.paused)send()},HEARTBEAT_MS);
  const onVis=()=>{if(document.visibilityState==="hidden")send()};
  el.addEventListener("pause",send);el.addEventListener("ended",send);el.addEventListener("seeked",tick);document.addEventListener("visibilitychange",onVis);
  return()=>{window.clearInterval(timer);window.clearInterval(beat);el.removeEventListener("pause",send);el.removeEventListener("ended",send);el.removeEventListener("seeked",tick);document.removeEventListener("visibilitychange",onVis)}},[episodeId,onProgress,load.state]);
 if(load.state==="blocked")return <div className="ac-player ac-player--blocked" role="status"><strong>Vídeo indisponível</strong><p>{load.message}</p></div>;
 if(load.state==="loading")return <div className="ac-player ac-player--blocked" role="status"><p>A autorizar a reprodução…</p></div>;
 return <div className="ac-player"><video ref={video} controls playsInline preload="metadata" aria-label={"Vídeo: "+title}/></div>;
}
