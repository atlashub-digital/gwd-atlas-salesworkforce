"use client";
import {useEffect,useRef} from "react";
import {LAND_B64,LAND_STEP} from "../../lib/globe-land";

/** Hero globe — Canvas 2D orthographic globe (no WebGL, no dependency): lit ocean with a night side, dotted continents
 * shaded by the key light, a faint graticule for volume, a two-layer atmosphere with a rim light, and glowing arcs
 * between the GWD communities (Europe ↔ Brazil ↔ world) with signals travelling along them.
 * Motion budget: one rAF loop capped at 30 fps, paused off-screen / in background tabs; reduced motion draws one
 * still frame. Colours come from the brand tokens. Purely decorative (aria-hidden on the wrapper). */

type Hub=readonly [lat:number,lon:number];
const HUBS:Hub[]=[[38.72,-9.14],[41.15,-8.61],[40.42,-3.7],[41.39,2.17],[48.86,2.35],[51.51,-0.13],[52.52,13.4],[45.46,9.19],
 [-23.55,-46.63],[-22.91,-43.17],[-15.79,-47.88],[-8.05,-34.88],[-8.84,13.23],[-25.97,32.57],[40.71,-74.0],[37.98,23.73],
 [14.69,-17.44],[25.2,55.27],[19.43,-99.13],[-34.6,-58.38]];
/** Hubs that carry the story (Lisbon, Porto, São Paulo, Rio) get a permanent glow. */
const KEY_HUBS=new Set([0,1,8,9]);
// [from, to, delay(s), weight] — Lisbon/Porto/Madrid ↔ São Paulo/Rio/Recife/Brasília carry the story (weight 1);
// the rest draws the global net (weight 0).
const ARCS:readonly (readonly [number,number,number,number])[]=[[0,8,0,1],[1,9,1.8,1],[2,10,3.6,1],[0,11,5.2,1],[1,8,7.4,1],
 [5,14,6.8,0],[4,0,2.6,0],[6,4,4.4,0],[7,3,7.6,0],[8,10,1.1,0],[9,12,8.4,0],[0,14,9.6,0],[13,12,5.9,0],[15,7,3.1,0],
 [11,0,10.4,0],[0,16,4.9,0],[16,11,8.9,0],[15,17,6.1,0],[14,18,2.1,0],[8,19,9.1,0],[0,12,3.3,0],[5,0,10.9,0]];
const SIGNAL_PERIOD=11;// seconds between two signals on the same arc (occasional, never all at once)
const TILT=26*Math.PI/180;// tilt north towards the viewer: Europe, Africa and South America face the visitor
const LIGHT:[number,number,number]=(()=>{const v=[-.55,.5,.67],n=Math.hypot(...v);return [v[0]/n,v[1]/n,v[2]/n] as [number,number,number];})();// key light, upper left, in front

type V3=[number,number,number];
const toV=(lat:number,lon:number):V3=>{const p=lat*Math.PI/180,l=lon*Math.PI/180;return [Math.cos(p)*Math.sin(l),Math.sin(p),Math.cos(p)*Math.cos(l)];};
function landPoints(step:number):V3[]{
 const bytes=Uint8Array.from(atob(LAND_B64),c=>c.charCodeAt(0)),w=360/LAND_STEP,h=180/LAND_STEP,pts:V3[]=[];
 for(let j=0;j<h;j++)for(let i=0;i<w;i+=step){const k=j*w+i;if(bytes[k>>3]&(1<<(k&7))){const lat=90-LAND_STEP/2-j*LAND_STEP;
  // thin out the poles so the dot density looks even on the sphere
  if(Math.abs(lat)>60&&(i/step)%2)continue;pts.push(toV(lat,-180+LAND_STEP/2+i*LAND_STEP));}}
 return pts;
}
/** Graticule every 30° (meridians) / 30° (parallels), sampled as polylines. */
function graticule():V3[][]{
 const lines:V3[][]=[];
 for(let lon=-180;lon<180;lon+=30)lines.push(Array.from({length:37},(_,i)=>toV(-90+i*5,lon)));
 for(let lat=-60;lat<=60;lat+=30)lines.push(Array.from({length:73},(_,i)=>toV(lat,-180+i*5)));
 return lines;
}
function slerp(a:V3,b:V3,t:number):V3{const d=Math.acos(Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));if(d<1e-6)return a;const s=Math.sin(d),x=Math.sin((1-t)*d)/s,y=Math.sin(t*d)/s;return [a[0]*x+b[0]*y,a[1]*x+b[1]*y,a[2]*x+b[2]*y];}

export default function HeroGlobe(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext("2d");if(!ctx)return;
  const css=getComputedStyle(el),tok=(n:string)=>css.getPropertyValue(n).trim();
  const C={cyan:tok("--gwd-cyan-400"),cyanSoft:tok("--gwd-cyan-500"),blue:tok("--gwd-blue-500"),navy:tok("--gwd-navy-900"),deep:tok("--gwd-navy-950"),white:tok("--gwd-white")||"#ffffff"};
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)"),narrow=window.matchMedia("(max-width: 759px)");
  const land=landPoints(narrow.matches?2:1),hubs=HUBS.map(([a,b])=>toV(a,b)),grid=graticule();
  const arcs=ARCS.map(([f,t,delay,weight])=>{const d=Math.acos(Math.min(1,hubs[f][0]*hubs[t][0]+hubs[f][1]*hubs[t][1]+hubs[f][2]*hubs[t][2])),h=.06+.2*d/Math.PI;
   return {f,t,delay,weight,pts:Array.from({length:49},(_,i)=>{const s=i/48,p=slerp(hubs[f],hubs[t],s),lift=1+h*Math.sin(Math.PI*s);return [p[0]*lift,p[1]*lift,p[2]*lift] as V3;})};});
  let w=0,h=0,dpr=1,raf=0,visible=true,last=0,start=performance.now(),ping:{hub:number;at:number}|null=null;
  function resize(){const r=el!.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);w=r.width;h=r.height;el!.width=Math.round(w*dpr);el!.height=Math.round(h*dpr);}
  function draw(now:number){
   const t=(now-start)/1000,R=Math.min(w,h)*.4,cx=w/2,cy=h/2;// atmosphere (1.25 R) stays inside the canvas: no clipped edges
   // slow drift centred on the Atlantic (Europe ↔ Brazil), ±20° over ~90 s
   const lon0=(-16+20*Math.sin(t*2*Math.PI/90))*Math.PI/180,cl=Math.cos(lon0),sl=Math.sin(lon0),ct=Math.cos(TILT),st=Math.sin(TILT);
   const rot=(v:V3):V3=>{const x=v[0]*cl-v[2]*sl,z=v[0]*sl+v[2]*cl;return [x,v[1]*ct-z*st,v[1]*st+z*ct];};
   const lit=(v:V3)=>Math.max(0,v[0]*LIGHT[0]+v[1]*LIGHT[1]+v[2]*LIGHT[2]);
   const c=ctx!;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
   // outer atmosphere: wide soft glow, brighter towards the key light
   const halo=c.createRadialGradient(cx,cy,R*.95,cx,cy,R*1.25);halo.addColorStop(0,C.blue+"80");halo.addColorStop(.35,C.blue+"30");halo.addColorStop(1,C.blue+"00");
   c.fillStyle=halo;c.beginPath();c.arc(cx,cy,R*1.25,0,Math.PI*2);c.fill();
   // ocean: lit from the upper left, night side lower right
   const sea=c.createRadialGradient(cx-R*.42,cy-R*.4,R*.05,cx,cy,R*1.02);sea.addColorStop(0,C.blue+"9c");sea.addColorStop(.38,C.navy);sea.addColorStop(1,C.deep);
   c.fillStyle=sea;c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.fill();
   c.save();c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.clip();
   // graticule, faint, only on the near side
   c.lineWidth=.6;c.strokeStyle=C.cyanSoft;
   for(const line of grid){c.beginPath();let pen=false;for(const p of line){const v=rot(p);if(v[2]<.02){pen=false;continue;}const x=cx+v[0]*R,y=cy-v[1]*R;if(pen)c.lineTo(x,y);else{c.moveTo(x,y);pen=true;}}c.globalAlpha=.09;c.stroke();}
   // land dots, bucketed by light (few fillStyle changes); rim dots fade with depth
   const buckets:number[][]=[[],[],[],[],[],[]];
   for(const p of land){const v=rot(p);if(v[2]<=0)continue;const k=Math.min(5,Math.floor((lit(v)*.75+v[2]*.25)*6));buckets[k].push(cx+v[0]*R,cy-v[1]*R);}
   const size=Math.max(1.5,R/120);
   buckets.forEach((b,i)=>{c.fillStyle=i===5?C.white:C.cyan;c.globalAlpha=i===5?.85:.2+i*.15;for(let k=0;k<b.length;k+=2)c.fillRect(b[k]-size/2,b[k+1]-size/2,size,size);});
   // night side + specular highlight
   c.globalAlpha=1;
   const night=c.createRadialGradient(cx+R*.55,cy+R*.5,R*.1,cx+R*.35,cy+R*.3,R*1.25);night.addColorStop(0,C.deep+"d0");night.addColorStop(.6,C.deep+"40");night.addColorStop(1,C.deep+"00");
   c.fillStyle=night;c.fillRect(cx-R,cy-R,R*2,R*2);
   const spec=c.createRadialGradient(cx-R*.45,cy-R*.45,0,cx-R*.45,cy-R*.45,R*.7);spec.addColorStop(0,C.cyan+"24");spec.addColorStop(1,C.cyan+"00");
   c.fillStyle=spec;c.fillRect(cx-R,cy-R,R*2,R*2);
   c.restore();
   // rim light: thin bright edge on the lit side, inner atmosphere band
   const rim=c.createLinearGradient(cx-R,cy-R,cx+R,cy+R);rim.addColorStop(0,C.cyan+"e6");rim.addColorStop(.5,C.cyanSoft+"55");rim.addColorStop(1,C.blue+"10");
   c.strokeStyle=rim;c.lineWidth=1.6;c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.stroke();
   const band=c.createRadialGradient(cx,cy,R,cx,cy,R*1.07);band.addColorStop(0,C.cyan+"40");band.addColorStop(1,C.cyan+"00");
   c.fillStyle=band;c.beginPath();c.arc(cx,cy,R*1.07,0,Math.PI*2);c.arc(cx,cy,R,0,Math.PI*2,true);c.fill();
   // arcs (fade in from 0.7 s), additive glow, signals, hubs
   const arcIn=reduce.matches?1:Math.min(1,Math.max(0,(t-.7)/.6));
   c.lineCap="round";c.globalCompositeOperation="lighter";
   for(const a of arcs){
    const hot=ping&&(a.f===ping.hub||a.t===ping.hub)&&now-ping.at<1400;
    c.beginPath();let pen=false;
    for(const p of a.pts){const v=rot(p);if(v[2]<-.02){pen=false;continue;}const x=cx+v[0]*R,y=cy-v[1]*R;if(pen)c.lineTo(x,y);else{c.moveTo(x,y);pen=true;}}
    const base=a.weight?.55:.26;
    c.strokeStyle=C.blue;c.globalAlpha=(hot?.5:base*.45)*arcIn;c.lineWidth=(a.weight?5:3.2)+(hot?2:0);c.stroke();// glow pass
    c.strokeStyle=C.cyan;c.globalAlpha=(hot?.95:base)*arcIn;c.lineWidth=(a.weight?1.5:1)+(hot?.8:0);c.stroke();
    if(reduce.matches||arcIn<1)continue;
    const phase=((t-a.delay)%SIGNAL_PERIOD+SIGNAL_PERIOD)%SIGNAL_PERIOD/2.4;// travels in 2.4 s, then rests
    if(phase>1)continue;
    for(let k=0;k<8;k++){const s=phase-k*.022;if(s<0)break;const i=Math.min(48,Math.round(s*48)),v=rot(a.pts[i]);if(v[2]<0)continue;
     c.globalAlpha=(1-k/8)*.95;c.fillStyle=k?C.cyan:C.white;c.beginPath();c.arc(cx+v[0]*R,cy-v[1]*R,(a.weight?2.8:2.2)-k*.25,0,Math.PI*2);c.fill();}
   }
   hubs.forEach((p,i)=>{const v=rot(p);if(v[2]<=0)return;const x=cx+v[0]*R,y=cy-v[1]*R,key=KEY_HUBS.has(i);
    const gr=(key?14:8)*(narrow.matches?.75:1),g=c.createRadialGradient(x,y,0,x,y,gr);g.addColorStop(0,C.cyan+(key?"90":"60"));g.addColorStop(1,C.cyan+"00");
    c.globalAlpha=.5+.5*v[2];c.fillStyle=g;c.beginPath();c.arc(x,y,gr,0,Math.PI*2);c.fill();
    c.fillStyle=C.white;c.beginPath();c.arc(x,y,key?2.6:1.9,0,Math.PI*2);c.fill();
    if(key&&!reduce.matches){const k=((t+i*.9)%3.2)/3.2;c.globalAlpha=(1-k)*.55*v[2];c.strokeStyle=C.cyan;c.lineWidth=1.1;c.beginPath();c.arc(x,y,3+k*18,0,Math.PI*2);c.stroke();}
    if(ping&&ping.hub===i){const k=(now-ping.at)/1400;if(k<1){c.globalAlpha=1-k;c.strokeStyle=C.cyan;c.lineWidth=1.6;c.beginPath();c.arc(x,y,4+k*28,0,Math.PI*2);c.stroke();}}});
   c.globalCompositeOperation="source-over";c.globalAlpha=1;
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
