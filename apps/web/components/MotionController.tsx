"use client";
import {useEffect} from "react";
/** Motion V1 runtime (one listener set for the whole site):
 * - `[data-motion]` scenes run their CSS loops only while on screen (data-motion="on"|"off");
 * - `[data-parallax]` roots get --px/--py in [-1,1] from the pointer (fine pointers, motion allowed only);
 * - `[data-scroll-scene]` roots get --sp in [0,1] as they scroll out (hero → next scene hand-off), motion allowed only.
 * Nothing here is required for content: without JS the page is complete and static. */
export default function MotionController(){
 useEffect(()=>{
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
  const scenes=[...document.querySelectorAll<HTMLElement|SVGElement>("[data-motion]")];
  const io=new IntersectionObserver(entries=>{for(const e of entries)(e.target as HTMLElement).dataset.motion=e.isIntersecting&&!reduce.matches?"on":"off";},{rootMargin:"80px"});
  scenes.forEach(s=>io.observe(s));
  const roots=[...document.querySelectorAll<HTMLElement>("[data-parallax]")];
  let frame=0,x=0,y=0;
  const fine=window.matchMedia("(pointer: fine)");
  function move(event:PointerEvent){
   if(reduce.matches||!fine.matches)return;
   x=event.clientX/window.innerWidth*2-1;y=event.clientY/window.innerHeight*2-1;
   if(!frame)frame=requestAnimationFrame(()=>{frame=0;for(const r of roots){r.style.setProperty("--px",x.toFixed(3));r.style.setProperty("--py",y.toFixed(3));}});
  }
  if(roots.length)window.addEventListener("pointermove",move,{passive:true});
  const stages=[...document.querySelectorAll<HTMLElement>("[data-scroll-scene]")];let sframe=0;
  function scroll(){if(sframe)return;sframe=requestAnimationFrame(()=>{sframe=0;for(const s of stages){if(reduce.matches){s.style.removeProperty("--sp");continue;}
   const r=s.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height*.75)));s.style.setProperty("--sp",p.toFixed(3));}});}
  if(stages.length){window.addEventListener("scroll",scroll,{passive:true});scroll();}
  return ()=>{io.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("scroll",scroll);cancelAnimationFrame(frame);cancelAnimationFrame(sframe);};
 },[]);
 return null;
}
