// Golden-screen capture: 1440 + 390 (+ reduced motion), side-by-side with the Drive target, and an objective report.
// Usage: node golden-shot.cjs <url> <outPrefix> [targetDesktop.png] [targetMobile.png]
// Needs PLAYWRIGHT_MODULE (path to playwright) — see references/qa-loop.md.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const fs=require("node:fs"),path=require("node:path");
const [url,out,targetDesktop,targetMobile]=process.argv.slice(2);
if(!url||!out){console.error("usage: golden-shot.cjs <url> <outPrefix> [targetDesktop] [targetMobile]");process.exit(2);}
fs.mkdirSync(path.dirname(out),{recursive:true});
const views=[{name:"1440",width:1440,height:900,target:targetDesktop},{name:"390",width:390,height:844,target:targetMobile,mobile:true}];
(async()=>{
 const browser=await chromium.launch({headless:true});const report={url,at:new Date().toISOString(),views:{}};
 for(const v of views)for(const reduced of [false,...(v.mobile?[true]:[])]){
  const ctx=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,isMobile:!!v.mobile,hasTouch:!!v.mobile,reducedMotion:reduced?"reduce":"no-preference"});
  const page=await ctx.newPage(),errors=[],failed=[];
  page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>m.type()==="error"&&errors.push(m.text()));
  page.on("requestfailed",r=>failed.push(r.url()));page.on("response",r=>r.status()>=400&&failed.push(r.status()+" "+r.url()));
  await page.addInitScript(()=>{window.__lcp=null;new PerformanceObserver(l=>{const e=l.getEntries().at(-1);window.__lcp={t:Math.round(e.startTime),el:e.element?(e.element.tagName+(e.element.className?"."+String(e.element.className).split(" ")[0]:"")):null};}).observe({type:"largest-contentful-paint",buffered:true});});
  await page.goto(url,{waitUntil:"networkidle",timeout:90000});
  await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);});
  await page.waitForTimeout(reduced?300:1200);
  const key=v.name+(reduced?"-reduced":"");
  await page.screenshot({path:`${out}-${key}.png`,fullPage:true});
  await page.screenshot({path:`${out}-${key}-fold.png`});
  report.views[key]=await page.evaluate(()=>({
   overflowX:document.documentElement.scrollWidth>window.innerWidth,
   brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.currentSrc||i.src),
   imagesWithoutAlt:[...document.images].filter(i=>!i.hasAttribute("alt")&&!i.closest("[aria-hidden=true]")).length,
   buttonsWithoutName:[...document.querySelectorAll("button,a[href]")].filter(b=>!(b.getAttribute("aria-label")||b.textContent.trim()||b.querySelector("img[alt]:not([alt=''])"))).length,
   h1:[...document.querySelectorAll("h1")].map(h=>h.textContent.trim()),
   // Links leaving this origin towards localhost/vercel.app are leaks (internal links on a local server are fine).
   localLinks:[...document.querySelectorAll("a[href]")].map(a=>new URL(a.href)).filter(u=>u.origin!==location.origin&&/localhost|127\.0\.0\.1|vercel\.app/.test(u.hostname)).map(u=>u.href),
   runningAnimations:document.getAnimations().filter(a=>a.playState==="running").length,
   lcp:window.__lcp}));
  Object.assign(report.views[key],{consoleErrors:errors,failedRequests:failed.filter(u=>!/_vercel\/insights|favicon/.test(u))});
  if(v.target&&!reduced&&fs.existsSync(v.target)){
   // Side-by-side: target (scaled to the viewport width) next to the first screen of the implementation.
   const t=fs.readFileSync(v.target).toString("base64"),fold=fs.readFileSync(`${out}-${key}-fold.png`).toString("base64");
   const cmp=await browser.newPage({viewport:{width:v.width*2+48,height:v.height+64},deviceScaleFactor:1});
   await cmp.setContent(`<body style="margin:0;background:#111;color:#ddd;font:14px system-ui;display:flex;gap:16px;padding:16px">
    <figure style="margin:0;width:${v.width}px"><figcaption>TARGET (Drive)</figcaption><img style="width:100%" src="data:image/png;base64,${t}"></figure>
    <figure style="margin:0;width:${v.width}px"><figcaption>IMPLEMENTATION ${v.name}</figcaption><img style="width:100%" src="data:image/png;base64,${fold}"></figure></body>`);
   await cmp.screenshot({path:`${out}-compare-${v.name}.png`,fullPage:true});await cmp.close();
  }
  await ctx.close();
 }
 await browser.close();
 fs.writeFileSync(`${out}-report.json`,JSON.stringify(report,null,1));
 const bad=Object.entries(report.views).filter(([,r])=>r.overflowX||r.brokenImages.length||r.consoleErrors.length||r.localLinks.length);
 console.log(JSON.stringify(Object.fromEntries(Object.entries(report.views).map(([k,r])=>[k,{overflowX:r.overflowX,broken:r.brokenImages.length,errors:r.consoleErrors.length,noAlt:r.imagesWithoutAlt,unnamed:r.buttonsWithoutName,anims:r.runningAnimations,lcp:r.lcp}]))));
 console.log(bad.length?"GOLDEN-SHOT: ISSUES in "+bad.map(([k])=>k).join(", "):"GOLDEN-SHOT: OK");
 process.exit(bad.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
