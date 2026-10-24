"use client";
import {useEffect,useRef} from "react";
import {LAND_B64,LAND_STEP} from "../../lib/globe-land";

/** Hero globe — Canvas 2D orthographic globe (no WebGL, no dependency): dotted continents, arcs between the GWD
 * communities (Europe ↔ Brazil ↔ world) and occasional signals travelling along them.
 * Motion budget: one rAF loop capped at 30 fps, paused off-screen / in background tabs; reduced motion draws one
 * still frame. Colours come from the brand tokens. Purely decorative (aria-hidden on the wrapper). */

type Hub=readonly [lat:number,lon:number];
const HUBS:Hub[]=[[38.72,-9.14],[41.15,-8.61],[40.42,-3.7],[41.39,2.17],[48.86,2.35],[51.51,-0.13],[52.52,13.4],[45.46,9.19],
 [-23.55,-46.63],[-22.91,-43.17],[-15.79,-47.88],[-8.05,-34.88],[-8.84,13.23],[-25.97,32.57],[40.71,-74.0],[37.98,23.73]];
// [from, to, delay(s)] — Lisbon/Porto/Madrid ↔ São Paulo/Rio/Recife/Brasília carry the story; the rest gives the global net.
const ARCS:readonly (readonly [number,number,number])[]=[[0,8,0],[1,11,1.8],[2,9,3.6],[0,12,5.2],[5,14,6.8],[4,0,2.6],[6,4,4.4],[7,3,7.6],
 [8,10,1.1],[9,12,8.4],[0,14,9.6],[13,12,5.9],[15,7,3.1],[11,0,10.4]];
const SIGNAL_PERIOD=11;// seconds between two signals on the same arc (occasional, never all at once)
const TILT=28*Math.PI/180;// tilt north towards the viewer: Europe, Africa and South America face the visitor

type V3=[number,number,number];
const toV=(lat:number,lon:number):V3=>{const p=lat*Math.PI/180,l=lon*Math.PI/180;return [Math.cos(p)*Math.sin(l),Math.sin(p),Math.cos(p)*Math.cos(l)];};
function landPoints(step:number):V3[]{
 const bytes=Uint8Array.from(atob(LAND_B64),c=>c.charCodeAt(0)),w=360/LAND_STEP,h=180/LAND_STEP,pts:V3[]=[];
 for(let j=0;j<h;j++)for(let i=0;i<w;i+=step){const k=j*w+i;if(bytes[k>>3]&(1<<(k&7))){const lat=90-LAND_STEP/2-j*LAND_STEP;
  // thin out the poles so the dot density looks even on the sphere
  if(Math.abs(lat)>60&&(i/step)%2)continue;pts.push(toV(lat,-180+LAND_STEP/2+i*LAND_STEP));}}
 return pts;
}
function slerp(a:V3,b:V3,t:number):V3{const d=Math.acos(Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));if(d<1e-6)return a;const s=Math.sin(d),x=Math.sin((1-t)*d)/s,y=Math.sin(t*d)/s;return [a[0]*x+b[0]*y,a[1]*x+b[1]*y,a[2]*x+b[2]*y];}

export default function HeroGlobe(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext("2d");if(!ctx)return;
  const css=getComputedStyle(el),tok=(n:string)=>css.getPropertyValue(n).trim();
  const C={cyan:tok("--gwd-cyan-400"),cyanSoft:tok("--gwd-cyan-500"),blue:tok("--gwd-blue-500"),navy:tok("--gwd-navy-900"),deep:tok("--gwd-navy-950")};
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)"),narrow=window.matchMedia("(max-width: 759px)");
  const land=landPoints(narrow.matches?2:1),hubs=HUBS.map(([a,b])=>toV(a,b));
  const arcs=ARCS.map(([f,t,delay])=>({f,t,delay,pts:Array.from({length:41},(_,i)=>{const s=i/40,p=slerp(hubs[f],hubs[t],s),lift=1+.16*Math.sin(Math.PI*s);return [p[0]*lift,p[1]*lift,p[2]*lift] as V3;})}));
  let w=0,h=0,dpr=1,raf=0,visible=true,last=0,start=performance.now(),ping:{hub:number;at:number}|null=null;
  function resize(){const r=el!.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);w=r.width;h=r.height;el!.width=Math.round(w*dpr);el!.height=Math.round(h*dpr);}
  function draw(now:number){
   const t=(now-start)/1000,R=Math.min(w,h)*.4,cx=w/2,cy=h/2;// halo (1.24 R) stays inside the canvas: no clipped edges
   // slow drift centred on the Atlantic (Europe ↔ Brazil), ±22° over ~90 s
   const lon0=(-14+22*Math.sin(t*2*Math.PI/90))*Math.PI/180,cl=Math.cos(lon0),sl=Math.sin(lon0),ct=Math.cos(TILT),st=Math.sin(TILT);
   const rot=(v:V3):V3=>{const x=v[0]*cl-v[2]*sl,z=v[0]*sl+v[2]*cl;return [x,v[1]*ct-z*st,v[1]*st+z*ct];};
   ctx!.setTransform(dpr,0,0,dpr,0,0);ctx!.clearRect(0,0,w,h);
   // atmosphere + ocean
   const halo=ctx!.createRadialGradient(cx,cy,R*.92,cx,cy,R*1.24);halo.addColorStop(0,C.blue+"66");halo.addColorStop(1,C.blue+"00");
   ctx!.fillStyle=halo;ctx!.beginPath();ctx!.arc(cx,cy,R*1.24,0,Math.PI*2);ctx!.fill();
   const sea=ctx!.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);sea.addColorStop(0,C.navy);sea.addColorStop(1,C.deep);
   ctx!.fillStyle=sea;ctx!.beginPath();ctx!.arc(cx,cy,R,0,Math.PI*2);ctx!.fill();
   ctx!.strokeStyle=C.cyanSoft+"40";ctx!.lineWidth=1;ctx!.stroke();
   // land dots, bucketed by depth (few fillStyle changes)
   const buckets:number[][]=[[],[],[],[],[]];
   for(const p of land){const v=rot(p);if(v[2]<=0)continue;buckets[Math.min(4,Math.floor(v[2]*5))].push(cx+v[0]*R,cy-v[1]*R);}
   const size=Math.max(1.6,R/115);
   buckets.forEach((b,i)=>{ctx!.fillStyle=C.cyan;ctx!.globalAlpha=.22+i*.17;for(let k=0;k<b.length;k+=2)ctx!.fillRect(b[k]-size/2,b[k+1]-size/2,size,size);});
   ctx!.globalAlpha=1;
   // arcs (fade in from 0.7 s), signals, hubs
   const arcIn=reduce.matches?1:Math.min(1,Math.max(0,(t-.7)/.6));
   ctx!.lineCap="round";
   for(const a of arcs){
    const hot=ping&&(a.f===ping.hub||a.t===ping.hub)&&now-ping.at<1400;
    ctx!.beginPath();let pen=false;
    for(const p of a.pts){const v=rot(p);if(v[2]<-.02){pen=false;continue;}const x=cx+v[0]*R,y=cy-v[1]*R;if(pen)ctx!.lineTo(x,y);else{ctx!.moveTo(x,y);pen=true;}}
    ctx!.strokeStyle=C.cyan;ctx!.globalAlpha=(hot?.85:.32)*arcIn;ctx!.lineWidth=hot?1.8:1.1;ctx!.stroke();
    if(reduce.matches||arcIn<1)continue;
    const phase=((t-a.delay)%SIGNAL_PERIOD+SIGNAL_PERIOD)%SIGNAL_PERIOD/2.4;// travels in 2.4 s, then rests
    if(phase>1)continue;
    for(let k=0;k<6;k++){const s=phase-k*.025;if(s<0)break;const i=Math.min(40,Math.round(s*40)),v=rot(a.pts[i]);if(v[2]<0)continue;
     ctx!.globalAlpha=(1-k/6)*.95;ctx!.fillStyle=C.cyan;ctx!.beginPath();ctx!.arc(cx+v[0]*R,cy-v[1]*R,2.4-k*.3,0,Math.PI*2);ctx!.fill();}
   }
   ctx!.globalAlpha=1;
   hubs.forEach((p,i)=>{const v=rot(p);if(v[2]<=0)return;const x=cx+v[0]*R,y=cy-v[1]*R;
    ctx!.fillStyle=C.cyan;ctx!.globalAlpha=.55+.45*v[2];ctx!.beginPath();ctx!.arc(x,y,2.6,0,Math.PI*2);ctx!.fill();
    if(ping&&ping.hub===i){const k=(now-ping.at)/1400;if(k<1){ctx!.globalAlpha=1-k;ctx!.strokeStyle=C.cyan;ctx!.lineWidth=1.5;ctx!.beginPath();ctx!.arc(x,y,4+k*26,0,Math.PI*2);ctx!.stroke();}}});
   ctx!.globalAlpha=1;
  }
  function loop(now:number){raf=0;if(!visible||document.hidden||reduce.matches)return;if(now-last>=33){last=now;draw(now);}raf=requestAnimationFrame(loop);}
  const kick=()=>{if(!raf&&visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(loop);};
  const still=()=>{start=performance.now()-2000;draw(performance.now());};// reduced motion: one complete frame, arcs on
  const ro=new ResizeObserver(()=>{resize();reduce.matches?still():draw(performance.now());});ro.observe(el);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;kick();},{rootMargin:"60px"});io.observe(el);
  const onVis=()=>kick();document.addEventListener("visibilitychange",onVis);
  const onMotion=()=>{reduce.matches?still():kick();};reduce.addEventListener("change",onMotion);
  const onPing=(e:Event)=>{const hub=(e as CustomEvent<{hub:number}>).detail?.hub;if(typeof hub==="number"){ping={hub,at:performance.now()};if(reduce.matches)still();else kick();}};
  window.addEventListener("gwd:globe-ping",onPing);
  resize();if(reduce.matches)still();else kick();
  el.dataset.ready="true";
  return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();document.removeEventListener("visibilitychange",onVis);reduce.removeEventListener("change",onMotion);window.removeEventListener("gwd:globe-ping",onPing);};
 },[]);
 return <canvas ref={canvas} className="gwd-globe-canvas"/>;
}
