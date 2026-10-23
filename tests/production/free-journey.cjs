// REAL production journey (not part of CI). Runs against app.goworld.digital with two real, authorized test accounts.
// Each account signs in through its real email (link or code) — no stubs, no admin-minted sessions.
//   node free-journey.cjs request <email>            → asks for the email via the real /entrar UI (one request per account)
//   node free-journey.cjs login <A|B> <link>          → opens the emailed link, stores the HttpOnly session in OUT/<A|B>.json
//   node free-journey.cjs login-code <A|B> <email> <code>
//   node free-journey.cjs journey                     → onboarding, Academy, video, community (A) + negatives (B), screenshots
// Needs PLAYWRIGHT_MODULE and OUT (output dir). Session files hold live cookies: keep OUT private and delete it afterwards.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");const fs=require("node:fs");
const APP="https://app.goworld.digital",OUT=process.env.OUT||"/out",[cmd,...args]=process.argv.slice(2);
const results=[];const record=(name,status,detail="")=>{results.push({name,status,detail,at:new Date().toISOString()});console.log(status,name,detail);};
async function context(browser,who){return browser.newContext({viewport:{width:390,height:844},isMobile:true,...(who&&fs.existsSync(`${OUT}/${who}.json`)?{storageState:`${OUT}/${who}.json`}:{})});}
async function step(page,name,fn){try{const detail=await fn();record(name,"PASS",detail||"");return true;}catch(e){record(name,"FAIL",String(e).split("\n")[0]);await page.screenshot({path:`${OUT}/fail-${name}.png`,fullPage:true}).catch(()=>{});return false;}}
const api=(page,path,init)=>page.evaluate(async([p,i])=>{const r=await fetch("/api/gwd/"+p,i);return {status:r.status,body:await r.json().catch(()=>null)};},[path,init]);
const post=(page,path,body)=>api(page,path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
(async()=>{const browser=await chromium.launch();try{
 if(cmd==="request"){const ctx=await context(browser),p=await ctx.newPage();await p.goto(APP+"/entrar",{waitUntil:"networkidle"});await p.getByRole("tab",{name:"Email"}).click();
  await p.getByRole("textbox",{name:"Email"}).fill(args[0]);await p.getByRole("button",{name:/Enviar código/}).click();
  await step(p,"request-email",async()=>{await p.getByText(/Abre o email que te enviámos/).waitFor({timeout:20000});});return;}
 if(cmd==="login"||cmd==="login-code"){const who=args[0],ctx=await context(browser),p=await ctx.newPage();
  await step(p,"login-"+who,async()=>{
   if(cmd==="login")await p.goto(args[1]);
   else{await p.goto(APP+"/entrar");await p.getByRole("tab",{name:"Email"}).click();await p.getByRole("textbox",{name:"Email"}).fill(args[1]);await p.getByRole("button",{name:/Enviar código/}).click();await p.getByLabel("Código de acesso").fill(args[2]);await p.getByRole("button",{name:/Confirmar e entrar/}).click();}
   await p.waitForURL(/\/(dashboard|onboarding|jornada)/,{timeout:30000});
   if(/access_token|refresh_token|token_hash/.test(p.url()))throw Error("token left in final URL");
   const cookies=(await ctx.cookies()).filter(c=>c.name.startsWith("gwd-"));if(!cookies.length||cookies.some(c=>!c.httpOnly||!c.secure))throw Error("session cookie not HttpOnly+Secure");
   if(await p.evaluate(()=>document.cookie.includes("gwd-access")))throw Error("session readable from JS");
   await ctx.storageState({path:`${OUT}/${who}.json`});return p.url().replace(APP,"");});return;}
 if(cmd!=="journey")throw Error("unknown command");
 const a=await context(browser,"A"),pa=await a.newPage(),b=await context(browser,"B"),pb=await b.newPage();const errors=[];pa.on("pageerror",e=>errors.push(e.message));
 for(const [p,who] of [[pa,"A"],[pb,"B"]])await step(p,"onboarding-"+who,async()=>{await p.goto(APP+"/onboarding");const f=p.getByLabel("Como queres ser tratado?");await f.waitFor({timeout:30000});
  if(await f.inputValue())return "already onboarded";await f.fill("Membro Free "+who);await p.getByRole("checkbox").first().check();await p.getByRole("button",{name:/Começar GWD Start/}).click();await p.waitForURL("**/jornada",{timeout:30000});return "done";});
 await step(pa,"dashboard",async()=>{await pa.goto(APP+"/dashboard");await pa.waitForLoadState("networkidle");await pa.screenshot({path:`${OUT}/01-dashboard-390.png`,fullPage:true});});
 await step(pa,"academy",async()=>{await pa.goto(APP+"/academy");await pa.getByText("GWD Start").first().waitFor({timeout:30000});await pa.waitForLoadState("networkidle");await pa.screenshot({path:`${OUT}/02-academy-390.png`,fullPage:true});});
 await step(pa,"video-hls",async()=>{await pa.goto(APP+"/academy/series/gwd-start/episodes/boas-vindas-gwd");const r=await post(pa,"academy/episodes/boas-vindas-gwd/playback",{});
  if(r.status!==200)throw Error("playback "+r.status+" "+(r.body?.code||""));
  await pa.waitForFunction(()=>{const v=document.querySelector("video");return v&&v.readyState>=2;},null,{timeout:30000});await pa.evaluate(()=>{const v=document.querySelector("video");v.muted=true;return v.play();});
  await pa.waitForFunction(()=>document.querySelector("video").currentTime>2,null,{timeout:30000});await pa.screenshot({path:`${OUT}/03-video-390.png`,fullPage:true});
  const u=new URL(r.body.manifest_url);u.searchParams.set("t",u.searchParams.get("t").slice(0,-12)+"AAAAAAAAAAAA");const bad=await fetch(u);if(bad.status<400)throw Error("tampered token accepted "+bad.status);
  return "manifest host "+new URL(r.body.manifest_url).host+"; tampered → "+bad.status;});
 await step(pa,"premium-denied",async()=>{const r=await post(pa,"academy/episodes/stories-que-vendem/playback",{});if(r.status<400)throw Error("premium playback "+r.status);return r.status+" "+(r.body?.code||"");});
 await step(pa,"progress-persisted",async()=>{const r=await api(pa,"academy/progress?series=gwd-start");if(r.status!==200)throw Error(String(r.status));return JSON.stringify(r.body.items.map(i=>[i.episodeSlug,i.status,i.progressPercent]));});
 for(const [p,who] of [[pa,"A"],[pb,"B"]])await step(p,"community-rules-"+who,async()=>{await p.goto(APP+"/comunidade");const cb=p.getByRole("checkbox");if(await cb.count()){await cb.check();await p.getByRole("button",{name:"Registar adesão"}).click();}await p.getByText("A tua adesão às regras está registada.").waitFor({timeout:30000});});
 const msg="Teste real GWD (A) "+new Date().toISOString().slice(0,16)+" UTC";let postId="";
 await step(pa,"community-post-persists",async()=>{await pa.getByLabel("Partilha com a comunidade").fill(msg);await pa.getByRole("button",{name:"Publicar"}).click();await pa.getByText("Publicação feita.").waitFor({timeout:30000});
  await pa.reload();await pa.getByText(msg).waitFor({timeout:30000});const feed=await api(pa,"community/spaces/geral/posts");postId=feed.body.items.find(i=>i.body===msg).id;await pa.screenshot({path:`${OUT}/04-community-390.png`,fullPage:true});return postId;});
 await step(pb,"B-sees-and-replies",async()=>{const feed=await api(pb,"community/spaces/geral/posts");const item=feed.body.items.find(i=>i.id===postId);if(!item||item.own)throw Error("B cannot see A's post");
  const r=await post(pb,"community/spaces/geral/posts",{body:"Resposta real (B)",parentId:postId});if(r.status!==201)throw Error("reply "+r.status);});
 await step(pb,"B-cannot-remove-A",async()=>{const r=await post(pb,`community/posts/${postId}/remove`,{});if(r.status!==403)throw Error(String(r.status));return "403";});
 await step(pa,"A-cannot-report-own",async()=>{const r=await post(pa,`community/posts/${postId}/report`,{reason:"SPAM"});if(r.status!==400)throw Error(String(r.status));return "400";});
 await step(pb,"B-reports-A",async()=>{const r=await post(pb,`community/posts/${postId}/report`,{reason:"OUTRO"});if(r.status!==200)throw Error(String(r.status));});
 await step(pb,"capability-space-denied",async()=>{const r=await api(pb,"community/spaces/mentores/posts");if(r.status!==403)throw Error(String(r.status));return "403";});
 await step(pb,"private-space-not-listed",async()=>{const r=await api(pb,"community/spaces");if(r.body.items.some(s=>s.id==="mentores"))throw Error("capability space listed");return r.body.items.map(s=>s.id).join(",");});
 await step(pa,"A-removes-own",async()=>{const r=await post(pa,`community/posts/${postId}/remove`,{});if(r.status!==200)throw Error(String(r.status));const feed=await api(pb,"community/spaces/geral/posts");if(feed.body.items.some(i=>i.id===postId))throw Error("removed post still visible to B");});
 await step(pa,"logout",async()=>{await pa.goto(APP+"/configuracoes");await pa.getByRole("button",{name:"Terminar sessão"}).click();await pa.waitForURL("**/entrar");const r=await api(pa,"me");if(r.status!==401)throw Error("session survived logout "+r.status);});
 if(errors.length)record("page-errors","FAIL",errors.join(" | "));
}finally{fs.writeFileSync(`${OUT}/results-${cmd}.json`,JSON.stringify(results,null,1));await browser.close();}
 process.exit(results.some(r=>r.status==="FAIL")?1:0);})().catch(e=>{console.error(e);process.exit(1);});
