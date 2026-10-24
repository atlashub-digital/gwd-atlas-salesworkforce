import { InputError, object, text } from "@gwd/contracts";
import type { PoolClient } from "pg";
/* Community V1 (migration 2026-10-23-community-v1.sql): native spaces, posts, replies and reports.
 * RLS does the access control (rules accepted + capability spaces); this module validates input,
 * copies the author's own display name and applies a per-author posting limit. No XP for posting. */
const spaceId=/^[a-z0-9-]{2,40}$/,postId=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const reasons=new Set(["SPAM","RESPEITO","PRIVACIDADE","PROMESSA_RENDIMENTO","OUTRO"]);
const postsPerHour=10;
type Post={id:string;author_id:string;author_name:string;parent_id:string|null;body:string;created_at:string;removed_at:string|null;hidden_at:string|null};
type Json=(body:unknown,status?:number)=>Response;
const view=(p:Post,userId:string)=>({id:p.id,authorName:p.author_name,own:p.author_id===userId,body:p.removed_at?null:p.body,
 state:p.removed_at?"REMOVED":p.hidden_at?"HIDDEN":"PUBLISHED",createdAt:p.created_at});
async function isMember(c:PoolClient,userId:string){return !!(await c.query("select 1 from gwd.community_memberships where participant_id=$1",[userId])).rows.length;}
export async function communityRoute({request,route,method,c,userId,json,audit}:{request:Request;route:string;method:string;c:PoolClient;userId:string;json:Json;audit:(action:string)=>Promise<void>}):Promise<Response|null>{
 if(route==="/v1/community/spaces"&&method==="GET"){
  if(!await isMember(c,userId))return json({items:[],member:false});
  const rows=(await c.query<{id:string;title:string;description:string}>("select id,title,description from gwd.community_spaces s where gwd.community_can_access(s.id) order by position,id")).rows;
  return json({items:rows,member:true});
 }
 const spaceMatch=/^\/v1\/community\/spaces\/([^/]+)\/posts$/.exec(route);
 if(spaceMatch){
  const space=decodeURIComponent(spaceMatch[1]);if(!spaceId.test(space))throw new InputError("Espaço desconhecido.");
  const access=(await c.query<{ok:boolean}>("select gwd.community_can_access($1) as ok",[space])).rows[0]?.ok;
  if(!access)return json({error:await isMember(c,userId)?"Este espaço não está disponível para o teu perfil.":"Aceita primeiro as regras da comunidade.",code:"COMMUNITY_FORBIDDEN"},403);
  if(method==="GET"){
   const top=(await c.query<Post>("select * from gwd.community_posts where space_id=$1 and parent_id is null order by created_at desc limit 50",[space])).rows;
   const replies=top.length?(await c.query<Post>("select * from gwd.community_posts where parent_id = any($1::uuid[]) order by created_at",[top.map(p=>p.id)])).rows:[];
   return json({items:top.map(p=>({...view(p,userId),replies:replies.filter(r=>r.parent_id===p.id).map(r=>view(r,userId))}))});
  }
  if(method==="POST"){
   const body=object(await request.json()),content=typeof body.body==="string"?body.body.trim():"";
   if(content.length<2||content.length>2000)throw new InputError("A mensagem deve ter entre 2 e 2000 caracteres.");
   let parent:string|null=null;
   if(body.parentId!==undefined&&body.parentId!==null){
    parent=text(body.parentId);if(!postId.test(parent))throw new InputError("Resposta inválida.");
    const p=(await c.query<{space_id:string;parent_id:string|null}>("select space_id,parent_id from gwd.community_posts where id=$1 and removed_at is null and hidden_at is null",[parent])).rows[0];
    if(!p||p.space_id!==space||p.parent_id)throw new InputError("Só podes responder a uma publicação deste espaço.");
   }
   const recent=Number((await c.query<{n:string}>("select count(*) n from gwd.community_posts where author_id=$1 and created_at>now()-interval '1 hour'",[userId])).rows[0].n);
   if(recent>=postsPerHour)return json({error:"Atingiste o limite de publicações por hora. Tenta mais tarde.",code:"COMMUNITY_RATE_LIMIT"},429);
   const name=(await c.query<{display_name:string}>("select display_name from gwd.participants where id=$1",[userId])).rows[0]?.display_name;
   if(!name)throw new InputError("Conclui primeiro o teu perfil.");
   const post=(await c.query<Post>("insert into gwd.community_posts(space_id,author_id,author_name,parent_id,body) values($1,$2,$3,$4,$5) returning *",[space,userId,name,parent,content])).rows[0];
   await audit(parent?"community.reply":"community.post");
   return json({item:{...view(post,userId),replies:[]}},201);
  }
 }
 const postMatch=method==="POST"?/^\/v1\/community\/posts\/([^/]+)\/(remove|report)$/.exec(route):null;
 if(postMatch){
  const id=decodeURIComponent(postMatch[1]);if(!postId.test(id))throw new InputError("Publicação desconhecida.");
  const post=(await c.query<Post>("select * from gwd.community_posts where id=$1",[id])).rows[0];
  if(!post)return json({error:"Publicação indisponível."},404);
  if(postMatch[2]==="remove"){
   if(post.author_id!==userId)return json({error:"Só podes remover as tuas publicações."},403);
   await c.query("update gwd.community_posts set removed_at=coalesce(removed_at,now()) where id=$1",[id]);await audit("community.remove");
   return json({removed:true});
  }
  if(post.author_id===userId)throw new InputError("Não podes denunciar a tua própria publicação.");
  const reason=text(object(await request.json()).reason,40);if(!reasons.has(reason))throw new InputError("Indica o motivo da denúncia.");
  await c.query("insert into gwd.community_reports(post_id,reporter_id,reason) values($1,$2,$3) on conflict do nothing",[id,userId,reason]);await audit("community.report");
  return json({reported:true});
 }
 return null;
}
