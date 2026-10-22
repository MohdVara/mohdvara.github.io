import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";
import {loadingShell,assetWatch} from "../scripts/loader/shell.mjs";
const bootstrap = await readFile("scripts/loader/bootstrap.js", "utf8");
const markup = loadingShell();
const data = JSON.parse(markup.match(/type="application\/json">([^<]+)/)[1]);
function boot({path="/", saved=null, preferred=["en"], storageBlocked=false, staticContent=true, reduced=false, parserPending=false, resources=[]}={}) {
  let clock=0, serial=0;
  const timers=new Map(), listeners=new Map(), documentListeners=new Map();
  const element=()=>({textContent:"",setAttribute(name,value){this[name]=value;},addEventListener(name,fn){this[name]=fn;}});
  const brand=element(),message=element(),retry=element(),dismiss=element(),detail=element(),progress=element(),pendingFiles=element(),completedFiles=element();
  brand.firstChild={nodeValue:"mpv"};
  const shell={dataset:{state:"waiting"},querySelector:selector=>({".loader-brand":brand,".monogram":brand,".loader-message":message,".loader-detail":detail,".loader-progress":progress,".loader-pending":pendingFiles,".loader-completed":completedFiles,a:retry,button:dismiss})[selector],remove(){this.removed=true;}};
  const Script=class{}, Link=class{};
  const nodes=resources.map((resource,index)=>Object.assign(new (resource.kind==="script"?Script:Link)(),{rel:resource.kind==="style"?"stylesheet":resource.kind==="preload"?"modulepreload":"",state:resource.state,src:resource.kind==="script"?`https://portfolio.test/asset-${index}.js`:undefined,href:`https://portfolio.test/asset-${index}.css`}));
  const watch={states:new Map(nodes.filter(node=>node.state!=="pending").map(node=>[node,node.state])),critical:node=>nodes.includes(node),stop:()=>{}};
  const window={__portfolioAssetWatch:watch,addEventListener:(event,fn)=>listeners.set(event,fn),removeEventListener:event=>listeners.delete(event)};
  vm.runInNewContext(bootstrap,{
    document:{readyState:parserPending?"loading":"complete",addEventListener:(name,fn)=>documentListeners.set(name,fn),removeEventListener:name=>documentListeners.delete(name),querySelectorAll:()=>nodes,getElementById:id=>id==="portfolio-loader"?shell:{textContent:JSON.stringify(data)},querySelector:()=>staticContent},
    URL,location:{pathname:path,href:`https://portfolio.test${path}?x=1#contact`},navigator:{languages:preferred},
    localStorage:{getItem:()=>{if(storageBlocked)throw Error();return saved;}},window,
    setTimeout:(fn,ms)=>{timers.set(++serial,{fn,time:clock+ms});return serial;},clearTimeout:id=>timers.delete(id),matchMedia:()=>({matches:reduced}),
    MutationObserver:class{observe(){}disconnect(){}},
    HTMLScriptElement:Script,HTMLLinkElement:Link,ErrorEvent:class{},
  });
  const tick=ms=>{clock+=ms;for(const[id,t]of [...timers])if(t.time<=clock){timers.delete(id);t.fn();}};
  return {shell,message,progress,retry,dismiss,tick,load:index=>documentListeners.get("load")?.({target:nodes[index]}),error:index=>listeners.get("error")?.({target:nodes[index]}),timers,listeners,parsed:()=>{staticContent=true;documentListeners.get("DOMContentLoaded")?.();},emit:name=>listeners.get(name)?.()};
}
test("fast commit never reveals the shell; slow commit exits without minimum dwell",()=>{
  const fast=boot();fast.emit("portfolio:ready");fast.tick(20000);assert.ok(fast.shell.removed);assert.equal(fast.timers.size,0);
  const slow=boot();slow.tick(120);assert.equal(slow.shell.dataset.state,"loading");slow.emit("portfolio:ready");assert.equal(slow.shell.dataset.state,"leaving");slow.tick(180);assert.ok(slow.shell.removed);assert.equal(slow.listeners.size,0);
});
test("confirmed failures recover even when React never starts; a late commit removes recovery",()=>{
  for(const event of ["portfolio:failed","unhandledrejection"]){
    const state=boot();state.emit(event);
    assert.equal(state.shell.dataset.state,"failed");assert.equal(state.message.role,"status");assert.equal(state.shell.dataset.static,"true");
    assert.equal(state.retry.href,"https://portfolio.test/?x=1#contact");state.emit("portfolio:ready");assert.ok(state.shell.removed);
  }
  const blank=boot({staticContent:false});blank.tick(30000);assert.equal(blank.dismiss.hidden,true);
  const staticPage=boot();staticPage.emit("portfolio:failed");staticPage.dismiss.click();assert.ok(staticPage.shell.removed);assert.equal(staticPage.timers.size,0);
});
test("locale precedence, browser normalization and RTL follow the application registry",()=>{
  for(const locale of Object.keys(data))assert.equal(boot({path:`/${locale}/`,saved:"fr",preferred:["de"]}).shell.lang,locale);
  assert.equal(boot({saved:"ta",preferred:["de"]}).shell.lang,"ta");
  for(const [preferred,expected]of [[["zh-TW","ar-SA"],"ar"],[["zh-SG"],"zh-Hans"],[["pt-PT"],"pt-BR"],[["xx"],"en"]])assert.equal(boot({preferred,storageBlocked:true}).shell.lang,expected);
  assert.equal(boot({path:"/ar/"}).shell.dir,"rtl");
});
test("reduced motion removes immediately; artwork is isolated and shell needs no module or assets",()=>{
  const state=boot({reduced:true});state.tick(120);state.emit("portfolio:ready");assert.ok(state.shell.removed);
  assert.match(markup,/aria-hidden="true" dir="ltr" translate="no"/);
  assert.doesNotMatch(markup,/<canvas|https?:|requestAnimationFrame|setInterval|aria-live="assertive"/);
  assert.ok(Buffer.byteLength(markup+assetWatch())<22000,"Authored critical shell has a 22KB uncompressed budget including all locales");
});

test("an asset failure before root parsing refreshes recovery when static content arrives",()=>{
 const state=boot({staticContent:false,parserPending:true});state.emit("portfolio:failed");assert.equal(state.dismiss.hidden,true);state.parsed();assert.equal(state.shell.dataset.static,"true");assert.equal(state.dismiss.hidden,false);state.dismiss.click();assert.ok(state.shell.removed);
});

test("slow connections remain animated and recoverable without being declared failed",()=>{
 const state=boot();state.tick(120);state.tick(11880);assert.equal(state.shell.dataset.state,"loading");state.tick(18000);assert.equal(state.shell.dataset.state,"slow");assert.equal(state.message.textContent,data.en[6]);assert.equal(state.dismiss.hidden,false);state.tick(120000);assert.equal(state.shell.dataset.state,"slow");state.emit("portfolio:ready");assert.equal(state.shell.dataset.state,"leaving");state.tick(180);assert.ok(state.shell.removed);assert.equal(state.timers.size,0);
 const failure=boot();failure.tick(30000);failure.emit("portfolio:failed");assert.equal(failure.shell.dataset.state,"failed");
});

test("native startup outcomes drive honest counts and assets-to-React handoff",()=>{
 const state=boot({resources:[{kind:"script",state:"pending"},{kind:"style",state:"load"}]});
 assert.equal(state.progress.textContent,"Startup files: 1 loaded · 1 pending");state.tick(120);state.load(0);assert.equal(state.progress.textContent,"Startup files: 2 loaded · 0 pending");assert.equal(state.message.textContent,data.en[9]);assert.equal(state.shell.dataset.state,"loading");state.emit("portfolio:ready");state.tick(180);assert.ok(state.shell.removed);
 const pending=boot({resources:[{kind:"script",state:"pending"}]});pending.emit("portfolio:ready");assert.ok(pending.shell.removed,"A committed usable frame wins over pending preload bookkeeping");
});
test("early stylesheet failures are confirmed; speculative preload failure alone is not fatal",()=>{
 const style=boot({resources:[{kind:"style",state:"error"}]});assert.equal(style.shell.dataset.state,"failed");style.emit("portfolio:ready");assert.ok(!style.shell.removed);style.load(0);assert.ok(style.shell.removed);
 const speculative=boot({resources:[{kind:"preload",state:"error"}]});assert.equal(speculative.shell.dataset.state,"waiting");speculative.emit("portfolio:ready");assert.ok(speculative.shell.removed);
});
