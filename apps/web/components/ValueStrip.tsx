import Icon,{type IconName} from "./Icon";

export default function ValueStrip({items}:{items:readonly {icon:IconName;label:string}[]}){
 return <ul className="value-strip">{items.map(item=><li key={item.label}><span className="value-strip-icon"><Icon name={item.icon}/></span>{item.label}</li>)}</ul>;
}
