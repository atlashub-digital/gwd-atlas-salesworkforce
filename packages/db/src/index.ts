import pg from "pg";
import type { PoolClient } from "pg";
let pool:pg.Pool | undefined;
export function database() {
 if(!process.env.DATABASE_URL) throw new Error("DATABASE_UNAVAILABLE");
 return pool ??= new pg.Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000,statement_timeout:10000});
}
export async function transaction<T>(userId:string|null,run:(client:PoolClient)=>Promise<T>):Promise<T> {
 const client=await database().connect();
 try {
  await client.query("begin");
  await client.query("set local role gwd_api");
  await client.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??""]);
  const result=await run(client);await client.query("commit");return result;
 } catch(error){await client.query("rollback");throw error;}finally{client.release();}
}
export async function closeDatabase(){await pool?.end();pool=undefined;}
