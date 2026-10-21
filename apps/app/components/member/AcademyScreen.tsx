import Image from "next/image";
import {ScreenHeader} from "./bits";
import type {Item} from "./types";
/** Member Academy (master board 13 / target 08): streaming-style rows over the published reading items. */
export default function AcademyScreen({items}:{items:Item[]}){
 return <section className="member-academy">
  <ScreenHeader icon="academy" title="Academy" subtitle="Conteúdos para o teu crescimento · curadoria de Elisa Duarte"/>
  <div className="academy-categories" role="list"><span role="listitem" aria-current="true">Todos</span><span role="listitem">Fundamentos</span><span role="listitem">Leitura</span></div>
  <h2 className="row-title">Fundamentos para começar</h2>
  <div className="member-course-grid">{items.map((item,i)=><article className="member-course" key={item.id}><div className="course-cover" aria-hidden="true"><Image src={["/media/gwd-team-collaboration-v02.webp","/media/maia-workspace-v02.webp","/media/gwd-community-global-v01.webp"][i%3]} alt="" fill sizes="(max-width:760px) 120px, 33vw" style={{objectFit:"cover",objectPosition:"50% 25%"}}/><span className="course-cover-tag">Leitura</span></div><div className="course-content"><span className="eyebrow">Fundamentos · Leitura</span><h2>{item.title}</h2><details><summary>Ler conteúdo</summary><div className="article-body"><p>{item.body}</p></div></details><p className="small">Curadoria: {item.owner}</p></div></article>)}</div>
 </section>;
}
