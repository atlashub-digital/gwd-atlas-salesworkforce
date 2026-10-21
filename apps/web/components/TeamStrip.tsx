/** Canonical team names/roles. Faces come only from the approved group photo — no invented avatars. */
export default function TeamStrip({members}:{members:readonly {name:string;role:string}[]}){
 return <ul className="team-strip">{members.map(m=><li key={m.name}><h3>{m.name}</h3><p>{m.role}</p></li>)}</ul>;
}
