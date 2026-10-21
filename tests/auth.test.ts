import test from "node:test";
import assert from "node:assert/strict";
import {verifyToken} from "../apps/api/src/handler";
test("lead linking trusts only server-confirmed email from Auth, never user metadata",async context=>{
 const previous={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY};
 process.env.SUPABASE_URL="http://auth.test";process.env.SUPABASE_PUBLISHABLE_KEY="test-publishable";
 context.after(()=>{if(previous.url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previous.url;if(previous.key===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=previous.key;});
 const id="00000000-0000-4000-8000-000000000001";
 let confirmed=false,authorized=true;
 context.mock.method(globalThis,"fetch",async(_input:unknown,init:RequestInit)=>{
  assert.equal(new Headers(init.headers).get("Authorization"),"Bearer test-token");
  return authorized?Response.json({id,email:"person@example.com",email_confirmed_at:confirmed?"2026-10-18T00:00:00Z":null,user_metadata:{email_confirmed:true,role:"ADMIN"}}):new Response(null,{status:401});
 });
 assert.equal((await verifyToken("test-token")).email,undefined);
 confirmed=true;assert.equal((await verifyToken("test-token")).email,"person@example.com");
 authorized=false;await assert.rejects(verifyToken("test-token"),/UNAUTHORIZED/);
});
