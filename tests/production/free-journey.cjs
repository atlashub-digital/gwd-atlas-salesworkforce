// REAL production journey (not part of CI). Runs against app.goworld.digital with two real, authorized test accounts.
// Each account signs in through its real email (link or code) — no stubs, no admin-minted sessions.
//   node free-journey.cjs request <email>            → asks for the email via the real /entrar UI (one request per account)
//   node free-journey.cjs login <A|B> <link>          → opens the emailed link, stores the HttpOnly session in OUT/<A|B>.json
//   node free-journey.cjs login-wait <A|B> <email>     → real /entrar UI: asks for the code, waits for OUT/code-<A|B>.txt
//                                                     (the operator copies it from the real inbox), types it, keeps the session
//   node free-journey.cjs hls [episode]               → test episode (preview grant): playback, CORS, tampered/no token, expiry, negatives
//   WHO=A|B node free-journey.cjs telegram [episodes…]  → P02: link to the message, new window + Academy kept, completion only after handoff + passed quiz (answers in OUT/quiz-answers.json)
//   node free-journey.cjs journey                     → onboarding, Academy, video, community (A) + negatives (B), screenshots
// Needs PLAYWRIGHT_MODULE and OUT (output dir). Session files hold live cookies: keep OUT private and delete it afterwards.
// BROWSER_CHANNEL=chrome: real Chrome (H.264/AAC); Playwright's Chromium has no proprietary codecs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");const fs=require("node:fs");
const APP="https://app.goworld.digital",OUT=process.env.OUT||"/out",[cmd,...args]=process.argv.slice(2);
const results=[];const record=(name,status,detail="")=>{results.push({name,status,detail,at:new Date().toISOString()});console.log(status,name,detail);};
async function context(browser,who){return browser.newContext({viewport:{width:390,height:844},isMobile:true,...(who&&fs.existsSync(`${OUT}/${who}.json`)?{storageState:`${OUT}/${who}.json`}:{})});}
async function step(page,name,fn){try{const detail=await fn();record(name,"PASS",detail||"");return true;}catch(e){record(name,"FAIL",String(e).split("\n")[0]);await page.screenshot({path:`${OUT}/fail-${name}.png`,fullPage:true}).catch(()=>{});return false;}}
const api=(page,path,init)=>page.evaluate(async([p,i])=>{const r=await fetch("/api/gwd/"+p,i);return {status:r.status,body:await r.json().catch(()=>null)};},[path,init]);
const post=(page,path,body)=>api(page,path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
(async()=>{const browser=await chromium.launch(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{});try{
 if(cmd==="request"){const ctx=await context(browser),p=await ctx.newPage();await p.goto(APP+"/entrar",{waitUntil:"networkidle"});await p.getByRole("tab",{name:"Email"}).click();
  await p.getByRole("textbox",{name:"Email"}).fill(args[0]);await p.getByRole("button",{name:/Enviar código/}).click();
  await step(p,"request-email",async()=>{await p.getByText(/Abre o email que te enviámos/).waitFor({timeout:20000});});return;}
 if(cmd==="login"||cmd==="login-wait"){const who=args[0],ctx=await context(browser),p=await ctx.newPage();
  await step(p,"login-"+who,async()=>{
   if(cmd==="login")await p.goto(args[1]);
   else{await p.goto(APP+"/entrar");await p.getByRole("tab",{name:"Email"}).click();await p.getByRole("textbox",{name:"Email"}).fill(args[1]);await p.getByRole("button",{name:/Enviar código/}).click();
    await p.getByLabel("Código de acesso").waitFor({timeout:20000});console.log("WAITING_FOR_CODE",who);const file=`${OUT}/code-${who}.txt`;
    for(let i=0;i<120&&!fs.existsSync(file);i++)await new Promise(r=>setTimeout(r,2500));
    const code=fs.readFileSync(file,"utf8").trim();fs.unlinkSync(file);await p.getByLabel("Código de acesso").fill(code);await p.getByRole("button",{name:/Confirmar e entrar/}).click();}
   await p.waitForURL(/\/(dashboard|onboarding|jornada)/,{timeout:30000});
   if(/access_token|refresh_token|token_hash/.test(p.url()))throw Error("token left in final URL");
   const cookies=(await ctx.cookies()).filter(c=>c.name.startsWith("gwd-"));if(!cookies.length||cookies.some(c=>!c.httpOnly||!c.secure))throw Error("session cookie not HttpOnly+Secure");
   if(await p.evaluate(()=>document.cookie.includes("gwd-access")))throw Error("session readable from JS");
   await ctx.storageState({path:`${OUT}/${who}.json`});return p.url().replace(APP,"");});return;}
 if(cmd==="hls"){const ep=args[0]||"teste-media-p01",a=await context(browser,"A"),pa=await a.newPage();let r;
  await step(pa,"hls-episode-visible",async()=>{await pa.goto(APP+"/dashboard");const e=await api(pa,"academy/episodes/"+ep);if(e.status!==200)throw Error("episode "+e.status+" "+(e.body?.code||""));return e.body?.episode?.title||ep;});
  await step(pa,"hls-playback",async()=>{await pa.goto(`${APP}/academy/series/gwd-start/episodes/${ep}`);r=await post(pa,`academy/episodes/${ep}/playback`,{});if(r.status!==200)throw Error("playback "+r.status+" "+(r.body?.code||""));
   await pa.waitForFunction(()=>{const v=document.querySelector("video");return v&&v.readyState>=2;},null,{timeout:45000});await pa.evaluate(()=>{const v=document.querySelector("video");v.muted=true;return v.play();});
   await pa.waitForFunction(()=>document.querySelector("video").currentTime>2,null,{timeout:45000});await pa.screenshot({path:`${OUT}/05-hls-390.png`,fullPage:true});return "manifest host "+new URL(r.body.manifest_url).host;});
  if(r?.status===200){const m=r.body.manifest_url,t=new URL(m).searchParams.get("t")||"";
   await step(pa,"hls-cors",async()=>{const ok=await fetch(m,{headers:{Origin:APP}}),bad=await fetch(m,{headers:{Origin:"https://evil.example"}});const ao=ok.headers.get("access-control-allow-origin"),bo=bad.headers.get("access-control-allow-origin");
    if(ao!==APP)throw Error("app origin "+ao);if(bo&&bo!=="null")throw Error("foreign origin allowed "+bo);return `app → ${ao}; other → ${bo||"none"}`;});
   await step(pa,"hls-tampered-403",async()=>{const u=new URL(m),mid=Math.floor(t.length/2);u.searchParams.set("t",t.slice(0,mid)+(t[mid]==="A"?"B":"A")+t.slice(mid+1));const s=(await fetch(u)).status;if(s<400)throw Error(String(s));return String(s);});
   await step(pa,"hls-no-token-denied",async()=>{const u=new URL(m);u.searchParams.delete("t");const s=(await fetch(u)).status;if(s<400)throw Error(String(s));return String(s);});
   await step(pa,"hls-other-draft-no-token",async()=>{const x=await post(pa,"academy/episodes/teste-telegram-p02-1/playback",{});if(x.status<400||x.body?.manifest_url)throw Error(String(x.status));return x.status+" "+(x.body?.code||"");});
   await step(pa,"hls-premium-denied",async()=>{const x=await post(pa,"academy/episodes/stories-que-vendem/playback",{});if(x.status<400)throw Error(String(x.status));return x.status+" "+(x.body?.code||"");});
   await step(pa,"hls-not-in-catalogue",async()=>{const s=await api(pa,"academy/series/gwd-start");if(JSON.stringify(s.body).includes(ep))throw Error("test episode listed");return "absent";});
   const anon=await browser.newContext(),pn=await anon.newPage();await step(pn,"hls-anonymous-401",async()=>{await pn.goto(APP+"/entrar");const x=await post(pn,`academy/episodes/${ep}/playback`,{});if(x.status!==401)throw Error(String(x.status));return "401";});
   if(process.env.HLS_EXPIRY!=="0")await step(pa,"hls-expired-403",async()=>{let exp;try{exp=JSON.parse(Buffer.from(t.split(".")[0],"base64url").toString()).exp;}catch{}const wait=Math.max(0,(exp?exp*1000-Date.now():305000))+5000;
    console.log("waiting",Math.round(wait/1000),"s for token expiry");await new Promise(z=>setTimeout(z,wait));const s=(await fetch(m)).status;if(s<400)throw Error(String(s));return String(s)+" after "+Math.round(wait/1000)+" s";});}
  return;}
 if(cmd==="telegram"){// P02: OUT/quiz-answers.json = {"teste-telegram-p02-1":{"q1":0,...},...} (kept out of Git); WHO = A|B
  const who=process.env.WHO||"A",answers=JSON.parse(fs.readFileSync(`${OUT}/quiz-answers.json`,"utf8")),ctx=await context(browser,who),p=await ctx.newPage();
  for(const ep of args.length?args:Object.keys(answers)){const url=`${APP}/academy/series/gwd-start/episodes/${ep}`;let id="";
   await step(p,`tg-${who}-${ep}-link`,async()=>{await p.goto(url);const a=p.getByRole("link",{name:/Abrir a aula no Telegram/});await a.waitFor({timeout:30000});const href=await a.getAttribute("href");
    if(!/^https:\/\/t\.me\/c\/\d+\/\d+$/.test(href))throw Error("href "+href);if(await a.getAttribute("target")!=="_blank")throw Error("not a new window");id=(await api(p,"academy/episodes/"+ep)).body.episode.id;return href;});
   await step(p,`tg-${who}-${ep}-not-complete-before`,async()=>{const r=await post(p,"academy/progress/complete",{episode_id:id});if(r.status<400)throw Error("completed without handoff/quiz");return r.status+" "+(r.body?.code||"");});
   await step(p,`tg-${who}-${ep}-open-and-return`,async()=>{const [tab]=await Promise.all([ctx.waitForEvent("page"),p.getByRole("link",{name:/Abrir a aula no Telegram/}).click()]);
    await tab.waitForURL(u=>/t\.me|telegram/i.test(String(u)),{timeout:20000}).catch(()=>{});const opened=tab.url();await tab.close();if(!/t\.me|telegram/i.test(opened))throw Error("new window at "+opened);await p.getByText(/Registámos que abriste o Telegram/).waitFor({timeout:20000});
    if(!p.url().startsWith(url))throw Error("Academy tab moved: "+p.url());await p.screenshot({path:`${OUT}/tg-${who}-${ep}.png`,fullPage:true});return "telegram tab "+opened.split("?")[0]+"; Academy kept";});
   await step(p,`tg-${who}-${ep}-handoff-only-not-complete`,async()=>{const r=await post(p,"academy/progress/complete",{episode_id:id});if(r.status<400)throw Error("handoff alone completed");return String(r.status);});
   const right=answers[ep],wrong=Object.fromEntries(Object.entries(right).map(([k,v])=>[k,v===0?1:0]));
   await step(p,`tg-${who}-${ep}-wrong-quiz`,async()=>{const r=await post(p,`academy/quiz/${ep}/submit`,{answers:wrong});if(r.status!==200||r.body.passed)throw Error(JSON.stringify(r.body));
    const c=await post(p,"academy/progress/complete",{episode_id:id});if(c.status<400)throw Error("completed after failed quiz");return "score "+r.body.score+"; complete "+c.status;});
   await step(p,`tg-${who}-${ep}-quiz-ui-pass-complete`,async()=>{await p.reload();await p.getByRole("heading",{name:"Verificação"}).waitFor({timeout:30000});await p.waitForLoadState("networkidle");
    const sets=p.locator(".ac-quiz fieldset");const qids=Object.keys(right);for(let i=0;i<qids.length;i++)await sets.nth(i).getByRole("radio").nth(right[qids[i]]).check();
    await p.getByRole("button",{name:"Submeter respostas"}).click();await p.getByText(/Aprovado\./).waitFor({timeout:20000});
    await p.getByRole("button",{name:"Marcar como visto"}).click();await p.getByText("Episódio concluído.").waitFor({timeout:20000});
    const prog=await api(p,"academy/progress?series=gwd-start");const it=prog.body.items.find(i=>i.episodeSlug===ep);if(it?.status!=="COMPLETED")throw Error("progress "+JSON.stringify(it));
    await p.screenshot({path:`${OUT}/tg-${who}-${ep}-done.png`,fullPage:true});return "COMPLETED";});}
  return;}
 if(cmd!=="journey")throw Error("unknown command");
 const haveB=fs.existsSync(`${OUT}/B.json`);
 const a=await context(browser,"A"),pa=await a.newPage(),b=await context(browser,"B"),pb=await b.newPage();
 // Steps of the second account are BLOCKED (not FAIL) when it has no real session.
 const stepB=(name,fn)=>haveB?step(pb,name,fn):(record(name,"BLOCKED","no real session for account B"),Promise.resolve(false));const errors=[];pa.on("pageerror",e=>errors.push(e.message));
 for(const [p,who] of [[pa,"A"],...(haveB?[[pb,"B"]]:[])])await step(p,"onboarding-"+who,async()=>{await p.goto(APP+"/onboarding");const f=p.getByLabel("Como queres ser tratado?");await f.waitFor({timeout:30000});
  if(await f.inputValue())return "already onboarded";await p.waitForLoadState("networkidle");await f.fill("Membro Free "+who);await p.getByRole("checkbox").first().check();await p.getByRole("button",{name:/Começar GWD Start/}).click();await p.waitForURL("**/jornada",{timeout:30000});return "done";});
 await step(pa,"dashboard",async()=>{await pa.goto(APP+"/dashboard");await pa.waitForLoadState("networkidle");await pa.screenshot({path:`${OUT}/01-dashboard-390.png`,fullPage:true});});
 await step(pa,"academy",async()=>{await pa.goto(APP+"/academy");await pa.getByText("GWD Start").first().waitFor({timeout:30000});await pa.waitForLoadState("networkidle");await pa.screenshot({path:`${OUT}/02-academy-390.png`,fullPage:true});});
 const linked=(await post(pa,"academy/episodes/boas-vindas-gwd/playback",{})).body?.code!=="MEDIA_NOT_LINKED";
 if(!linked)record("video-hls","BLOCKED","episode not linked to a real asset yet (pilot SQL pending GO)");
 else await step(pa,"video-hls",async()=>{await pa.goto(APP+"/academy/series/gwd-start/episodes/boas-vindas-gwd");const r=await post(pa,"academy/episodes/boas-vindas-gwd/playback",{});
  if(r.status!==200)throw Error("playback "+r.status+" "+(r.body?.code||""));
  await pa.waitForFunction(()=>{const v=document.querySelector("video");return v&&v.readyState>=2;},null,{timeout:30000});await pa.evaluate(()=>{const v=document.querySelector("video");v.muted=true;return v.play();});
  await pa.waitForFunction(()=>document.querySelector("video").currentTime>2,null,{timeout:30000});await pa.screenshot({path:`${OUT}/03-video-390.png`,fullPage:true});
  const u=new URL(r.body.manifest_url);u.searchParams.set("t",u.searchParams.get("t").slice(0,-12)+"AAAAAAAAAAAA");const bad=await fetch(u);if(bad.status<400)throw Error("tampered token accepted "+bad.status);
  return "manifest host "+new URL(r.body.manifest_url).host+"; tampered → "+bad.status;});
 await step(pa,"premium-denied",async()=>{const r=await post(pa,"academy/episodes/stories-que-vendem/playback",{});if(r.status<400)throw Error("premium playback "+r.status);return r.status+" "+(r.body?.code||"");});
 await step(pa,"progress-persisted",async()=>{const r=await api(pa,"academy/progress?series=gwd-start");if(r.status!==200)throw Error(String(r.status));return JSON.stringify(r.body.items.map(i=>[i.episodeSlug,i.status,i.progressPercent]));});
 for(const [p,who] of [[pa,"A"],...(haveB?[[pb,"B"]]:[])])await step(p,"community-rules-"+who,async()=>{await p.goto(APP+"/comunidade");await p.waitForLoadState("networkidle");const cb=p.getByRole("checkbox");if(await cb.count()){await cb.check();await p.getByRole("button",{name:"Registar adesão"}).click();}await p.getByText("A tua adesão às regras está registada.").waitFor({timeout:30000});});
 const msg="Teste real GWD (A) "+new Date().toISOString().slice(0,16)+" UTC";let postId="";
 await step(pa,"community-post-persists",async()=>{await pa.getByLabel("Partilha com a comunidade").fill(msg);await pa.getByRole("button",{name:"Publicar"}).click();await pa.getByText("Publicação feita.").waitFor({timeout:30000});
  await pa.reload();await pa.getByText(msg).waitFor({timeout:30000});const feed=await api(pa,"community/spaces/geral/posts");postId=feed.body.items.find(i=>i.body===msg).id;await pa.screenshot({path:`${OUT}/04-community-390.png`,fullPage:true});return postId;});
 await stepB("B-sees-and-replies",async()=>{const feed=await api(pb,"community/spaces/geral/posts");const item=feed.body.items.find(i=>i.id===postId);if(!item||item.own)throw Error("B cannot see A's post");
  const r=await post(pb,"community/spaces/geral/posts",{body:"Resposta real (B)",parentId:postId});if(r.status!==201)throw Error("reply "+r.status);});
 await stepB("B-cannot-remove-A",async()=>{const r=await post(pb,`community/posts/${postId}/remove`,{});if(r.status!==403)throw Error(String(r.status));return "403";});
 await step(pa,"A-cannot-report-own",async()=>{const r=await post(pa,`community/posts/${postId}/report`,{reason:"SPAM"});if(r.status!==400)throw Error(String(r.status));return "400";});
 await stepB("B-reports-A",async()=>{const r=await post(pb,`community/posts/${postId}/report`,{reason:"OUTRO"});if(r.status!==200)throw Error(String(r.status));});
 await step(haveB?pb:pa,"capability-space-denied",async()=>{const r=await api(haveB?pb:pa,"community/spaces/mentores/posts");if(r.status!==403)throw Error(String(r.status));return "403";});
 await step(haveB?pb:pa,"private-space-not-listed",async()=>{const r=await api(haveB?pb:pa,"community/spaces");if(r.body.items.some(s=>s.id==="mentores"))throw Error("capability space listed");return r.body.items.map(s=>s.id).join(",");});
 await step(pa,"A-removes-own",async()=>{const r=await post(pa,`community/posts/${postId}/remove`,{});if(r.status!==200)throw Error(String(r.status));const feed=await api(haveB?pb:pa,"community/spaces/geral/posts");if(feed.body.items.some(i=>i.id===postId&&i.state==="PUBLISHED"&&!i.own))throw Error("removed post still visible");});
 await step(pa,"logout",async()=>{await pa.goto(APP+"/configuracoes");await pa.getByRole("button",{name:"Terminar sessão"}).click();await pa.waitForURL("**/entrar");const r=await api(pa,"me");if(r.status!==401)throw Error("session survived logout "+r.status);});
 if(errors.length)record("page-errors","FAIL",errors.join(" | "));
}finally{fs.writeFileSync(`${OUT}/results-${cmd}.json`,JSON.stringify(results,null,1));await browser.close();}
 process.exit(results.some(r=>r.status==="FAIL")?1:0);})().catch(e=>{console.error(e);process.exit(1);});
