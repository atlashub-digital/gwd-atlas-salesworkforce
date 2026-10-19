import type {ReactNode,HTMLAttributes,AnchorHTMLAttributes} from "react";
type Children={children:ReactNode;className?:string};
export function Brand(){return <span className="brand"><span className="brand-mark" aria-hidden="true">g<span>↗</span></span><span>GoWorld<span className="brand-dot">.Digital</span></span></span>}
export const BrandLockup=Brand;
export function Container({children,className=""}:Children){return <div className={"container "+className}>{children}</div>}
export function Section({children,className="",...props}:HTMLAttributes<HTMLElement>){return <section className={"section "+className} {...props}>{children}</section>}
export function Button({children,className="",...props}:AnchorHTMLAttributes<HTMLAnchorElement>){return <a className={"button "+className} {...props}>{children}</a>}
export function Status({children="EM PREPARAÇÃO"}:{children?:ReactNode}){return <span className="status">{children}</span>}
export const Badge=Status;
export function Card({children,className="",...props}:HTMLAttributes<HTMLElement>){return <article className={"card "+className} {...props}>{children}</article>}
export function FeatureCard({children,className=""}:Children){return <Card className={"feature-card "+className}>{children}</Card>}
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
