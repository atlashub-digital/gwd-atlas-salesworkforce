"use client";
import {useEffect} from "react";
/** Motion V1 runtime (one listener set for the whole site):
 * - `[data-motion]` scenes run their CSS loops only while on screen (data-motion="on"|"off");
 * - `[data-parallax]` roots get --px/--py in [-1,1] from the pointer (fine pointers, motion allowed only).
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
  return ()=>{io.disconnect();window.removeEventListener("pointermove",move);cancelAnimationFrame(frame);};
 },[]);
 return null;
}
