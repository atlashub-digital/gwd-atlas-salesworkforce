import { createServer } from "node:http";
import { createHandler } from "./handler";
import { closeDatabase } from "@gwd/db";
const handle=createHandler();
const buckets=new Map<string,{count:number;until:number}>();
const server=createServer(async(req,res)=>{
 const ip=req.socket.remoteAddress??"unknown",now=Date.now();
 if(buckets.size>10000){for(const [key,value] of buckets)if(value.until<now)buckets.delete(key);if(buckets.size>10000){res.writeHead(503).end();return;}}
 let bucket=buckets.get(ip);if(!bucket||bucket.until<now){bucket={count:0,until:now+60000};buckets.set(ip,bucket);}
 if(++bucket.count>120){res.writeHead(429,{"Retry-After":"60"}).end();return;}
 const chunks:Buffer[]=[];let size=0;
 try{
  for await(const chunk of req){size+=chunk.length;if(size>16384){res.writeHead(413).end();return;}chunks.push(Buffer.from(chunk));}
  const body=Buffer.concat(chunks);
  const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(","):v);
  const request=new Request("http://gwd-api"+req.url,{method:req.method,headers,...(body.length?{body:new Uint8Array(body)}: {})});
  const response=await handle(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(400).end();}
});
server.listen(Number(process.env.PORT??8080),"0.0.0.0",()=>console.log("gwd-api listening; commerce OFF"));
async function stop(){server.close();await closeDatabase();}
process.on("SIGTERM",stop);process.on("SIGINT",stop);
