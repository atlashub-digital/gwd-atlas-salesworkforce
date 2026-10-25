import type {ReactNode,HTMLAttributes,AnchorHTMLAttributes} from "react";
type Children={children:ReactNode;className?:string};
const cx=(...names:(string|false|null|undefined)[])=>names.filter(Boolean).join(" ");
/** Live vector wordmark matching the approved GWD / GoWorld.Digital lockup. */
export function Brand({label="GoWorld.Digital",className}:{label?:string;className?:string}){return <span className={cx("brand",className)}><svg className="brand-lockup" viewBox="0 0 138 62" role="img" aria-label={label}><text x="0" y="42" style={{fontFamily:"var(--gwd-font-display)",fontWeight:900,fontSize:54,letterSpacing:-5}} fill="var(--gwd-white)">GW<tspan fill="var(--gwd-blue-500)">D</tspan></text><text x="2" y="58" style={{fontFamily:"var(--gwd-font-body)",fontWeight:600,fontSize:13,letterSpacing:-.4}} fill="var(--gwd-white)">GoWorld.<tspan fill="var(--gwd-cyan-400)">Digital</tspan></text></svg></span>}
export const BrandLockup=Brand;
export function Container({children,className=""}:Children){return <div className={"container "+className}>{children}</div>}
export function Section({children,className="",tone,...props}:HTMLAttributes<HTMLElement>&{tone?:"default"|"raised"|"bare"}){return <section className={cx("section",tone&&tone!=="default"&&"section--"+tone,className)} {...props}>{children}</section>}
export type ButtonVariant="primary"|"secondary"|"ghost";
export type ButtonSize="small"|"large";
/** Class string so framework links (next/link) render as Button without wrapping. */
export function buttonClass(variant:ButtonVariant="primary",size?:ButtonSize,className?:string){return cx("button",variant!=="primary"&&variant,size,className)}
export function Button({children,className="",variant="primary",size,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{variant?:ButtonVariant;size?:ButtonSize}){return <a className={buttonClass(variant,size,className)} {...props}>{children}</a>}
export type BadgeTone="warning"|"info"|"success"|"neutral";
export function Status({children="EM PREPARAÇÃO",tone="warning"}:{children?:ReactNode;tone?:BadgeTone}){return <span className={cx("status",tone!=="warning"&&"status--"+tone)}>{children}</span>}
export const Badge=Status;
export function Card({children,className="",...props}:HTMLAttributes<HTMLElement>){return <article className={"card "+className} {...props}>{children}</article>}
export function FeatureCard({children,className="",icon,eyebrow,title,body}:{children?:ReactNode;className?:string;icon?:ReactNode;eyebrow?:string;title?:ReactNode;body?:ReactNode}){return <Card className={"feature-card "+className}>{icon&&<span className="feature-icon" aria-hidden="true">{icon}</span>}{eyebrow&&<span className="eyebrow">{eyebrow}</span>}{title&&<h3>{title}</h3>}{body&&<p>{body}</p>}{children}</Card>}
export function SectionHeading({eyebrow,title,lead,align="start",id,children}:{eyebrow?:string;title:ReactNode;lead?:ReactNode;align?:"start"|"center"|"split";id?:string;children?:ReactNode}){return <header className={cx("section-heading","section-heading--"+align)}><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2 id={id}>{title}</h2></div>{(lead||children)&&<div className="section-heading-aside">{lead&&<p className="lead">{lead}</p>}{children}</div>}</header>}
export const OpportunityCard=FeatureCard;
export function StatCard({label,value,description}:{label:string;value:ReactNode;description?:string}){return <Card><span className="eyebrow">{label}</span><div className="stat">{value}</div>{description&&<p>{description}</p>}</Card>}
export function Hero({children,className=""}:Children){return <section className={"hero "+className}>{children}</section>}
export function MediaHero({children,className=""}:Children){return <div className={"media-hero "+className}>{children}</div>}
export function SplitSection({children,className=""}:Children){return <section className={"section split-section "+className}>{children}</section>}
export function JourneyCard({children}:Children){return <section className="welcome-card">{children}</section>}
export function Progress({value,label}:{value:number;label:string}){const percent=Math.min(100,Math.max(0,value));return <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:percent+"%"}}/></div>}
export function EmptyState({title,description,status="EM PREPARAÇÃO"}:{title:string;description:string;status?:string}){return <section className="card empty"><span className="empty-symbol" aria-hidden="true">↗</span><Status>{status}</Status><h2>{title}</h2><p>{description}</p><p className="small muted">O teu percurso de aprendizagem e comunidade continua disponível.</p><a className="button secondary" href="/jornada">Continuar a jornada</a></section>}
export const FeatureGateState=EmptyState;
export function PageHeading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){return <header className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>}
export function Navbar({children}:Children){return <header className="topbar">{children}</header>}
export function Footer({children}:Children){return <footer className="footer">{children}</footer>}
export function AppSidebar({children}:Children){return <aside className="sidebar">{children}</aside>}
export function AppTopbar({children}:Children){return <header className="app-topbar">{children}</header>}
export function Avatar({initials}:{initials:string}){return <span className="avatar" aria-hidden="true">{initials}</span>}
export function TeamMember({name,role}:{name:string;role:string}){return <article className="team-member"><Avatar initials={name.split(" ").map(n=>n[0]).join("")}/><h3>{name}</h3><p>{role}</p></article>}
export function Alert({children}:Children){return <div className="notice" role="status">{children}</div>}
export const Toast=Alert;
export function NetworkArt(){return <svg className="network-art" viewBox="0 0 400 400" fill="none" aria-hidden="true"><circle cx="200" cy="200" r="160" stroke="currentColor"/><ellipse cx="200" cy="200" rx="80" ry="160" stroke="currentColor"/><ellipse cx="200" cy="200" rx="160" ry="65" stroke="currentColor"/><path d="M60 120Q200 210 340 120M60 280Q200 190 340 280M40 200H360M200 40V360" stroke="currentColor"/><path d="M85 120Q320 70 300 290M60 240Q180 50 340 190" stroke="currentColor" strokeDasharray="4 8"/>{[[85,120],[300,290],[60,240],[340,190],[200,40],[200,200]].map(([x,y])=><circle key={x+":"+y} cx={x} cy={y} r="5" fill="currentColor"/>)}</svg>}

/** Shared outline icons for app navigation; decorative alongside visible labels. */
export function NavIcon({name}:{name:string}){
 const paths:Record<string,string>={
 dashboard:"M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
 jornada:"M5 4h14v16H5Z M9 8h6 M9 12h6 M9 16h3",
 academy:"m2 8 10-5 10 5-10 5Z M6 11v6q6 5 12 0v-6 M22 8v9",
 comunidade:"M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M1 21v-3a7 7 0 0 1 14 0v3 M17 4a4 4 0 0 1 0 8 M18 15q5 0 5 6",
 oportunidades:"M3 8h18v13H3Z M8 8V4h8v4 M3 13h18 M10 13v3h4v-3",
 pontos:"m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z",
 perfil:"M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M3 22v-2a9 9 0 0 1 18 0v2",
 configuracoes:"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
 campanhas:"M4 10v4h3l8 4V6L7 10H4Z M18.5 9.5a3.5 3.5 0 0 1 0 5",
 toolkit:"M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-2.5-2.5 M10.5 18.5l-7-7a2.1 2.1 0 0 1 3-3l7 7",
 ranking:"M4 20V12h4v8Z M10 20V6h4v14Z M16 20v-10h4v10Z",
 vendas:"M5 8h14l-1 12H6L5 8Z M9 10V7a3 3 0 0 1 6 0v3",
 ganhos:"M3 7h18v12H3Z M3 11h18 M7 15h4",
 percursos:"M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M7 17h7a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h7",
 produtos:"M5 8h14l-1 12H6L5 8Z M9 10V7a3 3 0 0 1 6 0v3",
 afiliado:"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
 revenda:"M3 9l2-5h14l2 5 M4 9v11h16V9 M3 9h18 M9 20v-6h6v6",
 resultados:"M3 7h18v12H3Z M3 11h18 M7 15h4",
 menu:"M4 7h16 M4 12h16 M4 17h16",
 lock:"M6 11h12v10H6Z M8 11V8a4 4 0 0 1 8 0v3",
 check:"m5 12 4.5 4.5L19 7",
 play:"M8 5v14l11-7Z",
 arrow:"M5 12h14 M13 6l6 6-6 6"
 };
 return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]??paths.oportunidades}/></svg>;
}
