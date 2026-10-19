import Link from "next/link";
import {Card,Status,type BadgeTone} from "@gwd/ui";
import Icon,{type IconName} from "./Icon";

/** One commercial/creative path. The activation note is mandatory: no path is switched on by registering. */
export default function PathCard({index,icon,title,body,href,status,tone="warning"}:{index:string;icon:IconName;title:string;body:string;href:string;status:string;tone?:BadgeTone}){
 return <Card className="path-card">
  <div className="path-card-top"><span className="path-card-index" aria-hidden="true">{index}</span><span className="feature-icon" aria-hidden="true"><Icon name={icon}/></span></div>
  <Status tone={tone}>{status}</Status>
  <h3>{title}</h3>
  <p>{body}</p>
  <p className="path-card-note"><Icon name="shield"/><span>Ativado separadamente, com regras claras.</span></p>
  <Link className="path-card-link" href={href}>Explorar percurso<span className="sr-only">: {title}</span><Icon name="arrow"/></Link>
 </Card>;
}
