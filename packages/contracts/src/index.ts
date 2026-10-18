export class InputError extends Error {}
export function object(value:unknown):Record<string,unknown> {
 if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("Pedido inválido.");
 return value as Record<string,unknown>;
}
export function text(value:unknown,max=120):string {
 if(typeof value!=="string" || !value.trim() || value.trim().length>max) throw new InputError("Preenche os campos obrigatórios corretamente.");
 return value.trim();
}
export function market(value:unknown) { if(!["BR","EU","OTHER"].includes(String(value))) throw new InputError("Escolhe o mercado."); return String(value); }
export function interest(value:unknown) { if(!["LEARNING","SOCIAL_MEDIA","AFFILIATE","AUTHORIZED_SELLER"].includes(String(value))) throw new InputError("Escolhe um percurso."); return String(value); }
export function leadInput(value:unknown) {
 const v=object(value), email=text(v.email,254).toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError("Indica um email válido.");
 if(v.consent!==true) throw new InputError("É necessário aceitar o tratamento dos dados para inscrição.");
 const utm:Record<string,string>={};
 for(const key of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]) if(typeof v[key]==="string") utm[key]=(v[key] as string).slice(0,200);
 return {name:text(v.name),email,market:market(v.market),interest:interest(v.interest),source:typeof v.source==="string"?v.source.slice(0,200):"web",utm};
}
export function profileInput(value:unknown) {const v=object(value);return {name:text(v.name),market:market(v.market),interest:interest(v.interest),complete:v.complete===true};}
export function uuid(value:string) {if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))throw new InputError("Identidade inválida.");return value;}
