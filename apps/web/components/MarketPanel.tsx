import Link from "next/link";
import {Status} from "@gwd/ui";
import MediaPanel from "./MediaPanel";
import Icon from "./Icon";
import type {ApprovedMedia} from "../lib/media";

/** Large market panel (Europa/Brasil). `accent="br"` switches the accent to the Brasil campaign green. */
export default function MarketPanel({media,eyebrow,title,body,href,linkLabel,accent}:{media:ApprovedMedia;eyebrow:string;title:string;body:string;href:string;linkLabel:string;accent?:"br"}){
 return <article className={"market-panel"+(accent?" market-panel--"+accent:"")}>
  <MediaPanel media={media} className="market-panel-media" scrim="bottom" sizes="(max-width:900px) 100vw, 50vw"/>
  <div className="market-panel-body">
   <span className="eyebrow">{eyebrow}</span>
   <h3>{title}</h3>
   <p>{body}</p>
   <div className="market-panel-foot"><Status tone="neutral">EM BREVE</Status><Link className="market-panel-link" href={href}>{linkLabel}<Icon name="arrow"/></Link></div>
  </div>
 </article>;
}
