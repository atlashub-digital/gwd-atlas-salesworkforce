/** Numbered journey stepper: horizontal rail on desktop, vertical line on mobile. */
export default function StepList({steps}:{steps:readonly {title:string;body:string}[]}){
 return <ol className="step-list">{steps.map((step,i)=><li key={step.title} className="step-list-item">
  <span className="step-list-node" aria-hidden="true">{String(i+1).padStart(2,"0")}</span>
  <div><h3>{step.title}</h3><p>{step.body}</p></div>
 </li>)}</ol>;
}
