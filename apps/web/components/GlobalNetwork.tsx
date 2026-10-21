/** Hero backdrop: deterministic vector globe + connection arcs (no raster, no randomness). */
const nodes=[[318,212],[486,148],[640,236],[742,402],[560,470],[402,388],[860,250],[250,470]] as const;
const arcs=["M318 212Q402 110 486 148","M486 148Q600 150 640 236","M640 236Q760 260 860 250","M640 236Q720 320 742 402","M402 388Q480 470 560 470","M318 212Q330 320 402 388","M560 470Q680 470 742 402","M250 470Q300 400 402 388"];
export default function GlobalNetwork(){
 return <svg className="global-network" viewBox="0 0 1000 700" fill="none" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
  <g className="global-network-grid" stroke="currentColor">
   <circle cx="560" cy="330" r="330"/>
   <ellipse cx="560" cy="330" rx="150" ry="330"/><ellipse cx="560" cy="330" rx="260" ry="330"/>
   <ellipse cx="560" cy="330" rx="330" ry="120"/><ellipse cx="560" cy="330" rx="330" ry="230"/>
   <path d="M230 330h660"/>
  </g>
  <g className="global-network-arcs" stroke="currentColor">{arcs.map(d=><path key={d} d={d}/>)}</g>
  <g className="global-network-nodes" fill="currentColor">{nodes.map(([x,y],i)=><circle key={x+":"+y} cx={x} cy={y} r={i%3===0?4.5:3} style={{animationDelay:i*0.6+"s"}}/>)}</g>
 </svg>;
}
