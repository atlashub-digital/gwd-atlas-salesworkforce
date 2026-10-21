export async function POST(request:Request){
 try{const raw=await request.text();if(raw.length>16384)return Response.json({error:"Pedido demasiado grande."},{status:413});
 const base=process.env.GWD_API_URL;if(!base)return Response.json({error:"As inscrições estão em preparação. Tenta novamente mais tarde."},{status:503});
 const response=await fetch(new URL("/v1/leads",base),{method:"POST",headers:{"Content-Type":"application/json"},body:raw,signal:AbortSignal.timeout(10000)});
 return new Response(await response.text(),{status:response.status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
 }catch{return Response.json({error:"Não foi possível registar o interesse. Tenta novamente."},{status:503});}
}
