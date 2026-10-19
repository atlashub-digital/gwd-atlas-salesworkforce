import Image from "next/image";
import type {ReactNode} from "react";
import {type ApprovedMedia,objectPosition} from "../lib/media";

/** Rounded cinematic frame for an approved media derivative. Aspect/crop lives in CSS (className); focal point comes from the manifest. */
export default function MediaPanel({media,sizes,className="",scrim,glow=false,preload=false,children}:{media:ApprovedMedia;sizes:string;className?:string;scrim?:"left"|"bottom"|"right";glow?:boolean;preload?:boolean;children?:ReactNode}){
 return <figure className={["media-panel",glow&&"media-panel--glow",className].filter(Boolean).join(" ")}>
  <div className="media-panel-frame">
   <Image src={media.src} alt={media.alt} fill sizes={sizes} preload={preload} style={{objectFit:"cover",objectPosition:objectPosition(media)}}/>
   {scrim&&<span className={"media-panel-scrim media-panel-scrim--"+scrim} aria-hidden="true"/>}
  </div>
  {children}
 </figure>;
}
