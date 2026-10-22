import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const require = createRequire(resolve(process.env.QA_MODULES_DIR || ".", "package.json"));
const {chromium} = require("playwright");
const registry = JSON.parse(await readFile("src/i18n/languages.json","utf8"));
const english = JSON.parse(await readFile("src/i18n/locales/en.json","utf8"));
const base = process.env.QA_URL || "http://127.0.0.1:4173";
const output = process.env.QA_OUTPUT || "output/playwright/pme";
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:"chrome",headless:true});
const report = {layouts:[],scenarios:[],errors:[],translationRequests:[],missingSource:[],datePeriods:[],assistantChecks:[]};
const widths = [320,375,390,768,1024,1440,1920,3840];
try {
  for (const item of registry.filter(item => !process.env.QA_LOCALES || process.env.QA_LOCALES.split(",").includes(item.locale))) {
    const context = await browser.newContext({viewport:{width:1440,height:1000},locale:item.locale,reducedMotion:"reduce"});
    const page = await context.newPage();
    page.on("pageerror",error => report.errors.push(`${item.locale}: ${error.message}`));
    page.on("request",request => {if (/api\.openai\.com|translate\.googleapis\.com/.test(request.url())) report.translationRequests.push(request.url());});
    await page.goto(`${base}/${item.locale}/`,{waitUntil:"networkidle"});
    await page.waitForFunction(locale => document.documentElement.dataset.localeReady === locale,item.locale);
    assert.equal(await page.locator("html").getAttribute("dir"),item.direction);
    for(const width of widths) {
      await page.setViewportSize({width,height:1000});
      await page.waitForFunction(() => {const hero=document.querySelector(".hero-environment").getBoundingClientRect();const header=document.querySelector(".site-header").getBoundingClientRect();return hero.height>0 && Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"))-header.height)<=2;});
      const measure = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,bad:[...document.querySelectorAll("main *")].filter(el => {
        const box=el.getBoundingClientRect(),css=getComputedStyle(el);
        return box.width > 0 && css.position !== "absolute" && (box.left < -1 || box.right > innerWidth+1);
      }).map(el=>({tag:el.tagName,cls:typeof el.className === "string" ? el.className : "svg"})).slice(0,10)}));
      if (measure.scroll > width+1) {
        measure.outside = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(el => {const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).map(el=>({tag:el.tagName,cls:typeof el.className === "string"?el.className:"svg",rect:[el.getBoundingClientRect().left,el.getBoundingClientRect().right],position:getComputedStyle(el).position,details:el.closest("details")?.open})).slice(0,30));
        await page.screenshot({path:`${output}/overflow-${item.locale}-${width}.png`});
      }
      const hero=await page.locator(".hero-environment").boundingBox();
      const header=await page.locator(".site-header").boundingBox();
      const noticeHeight=await page.locator(".translation-notice").count() ? (await page.locator(".translation-notice").boundingBox()).height : 0;
      if(width>=1100)assert.ok(Math.abs(hero.height+header.height+noticeHeight-1000)<=2, `${item.locale} ${width}: hero + header + notice must equal viewport`);
      report.layouts.push({locale:item.locale,heroHeight:hero.height,headerHeight:header.height,noticeHeight,...measure});
      assert.equal(await page.locator(".hero").evaluate(el=>getComputedStyle(el).overflowY),"visible","no internal hero scrollbar");
      assert.ok(measure.scroll <= width+1,`${item.locale} ${width} overflow: ${JSON.stringify(measure)}`);
      if ([390,1440].includes(width)) await page.screenshot({path:`${output}/${item.locale}-${width}.png`});
    }
    if(item.locale!=="en") {
      const catalog=JSON.parse(await readFile(`src/i18n/locales/${item.locale}.json`,"utf8"));
      for (const repo of JSON.parse(await readFile("src/data/public-github.json","utf8"))) {
        for (const field of ["title","kind","description","relevance"]) assert.ok((await page.locator("#public-engineering").textContent()).includes(catalog[repo[field]]),`${item.locale}: ${field} must be translated`);
      }
      await page.locator(".translation-disclosure summary").click();
      assert.ok((await page.locator(".translation-notice").innerText()).includes(catalog["This page has been automatically translated from English. Translations may contain errors, inaccuracies, or differences in meaning. For the most accurate information about my professional experience, projects, and achievements, please refer to the original English version."]));
      await page.locator(".translation-disclosure summary").click();
    }
    if(item.direction === "rtl") {
      await page.setViewportSize({width:1440,height:1000});
      const portrait=await page.locator(".hero .portrait").boundingBox();
      const copy=await page.locator(".hero .hero-copy").boundingBox();
      assert.ok(portrait.x+portrait.width < copy.x,"Arabic portrait stays left of hero copy");
      const mask=await page.locator(".hero-environment > .ascii-forest").evaluate(el=>getComputedStyle(el).maskImage);
      assert.ok(mask.includes("to left"),"Arabic artwork visibility is weighted to the portrait side");
      await page.setViewportSize({width:390,height:844});
      await page.locator(".mobile-menu summary").click();
      assert.ok(await page.locator(".mobile-menu nav").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".mobile-menu").getAttribute("open"),null);
      assert.equal(await page.locator(".mobile-menu summary").evaluate(el=>el===document.activeElement),true);
      assert.equal(await page.locator(".monogram").evaluate(el=>getComputedStyle(el).direction),"rtl");
      assert.equal(await page.locator("#hero-title").getAttribute("lang"),"en");
      const email=page.locator('a[href="mailto:mohd@paramasvara.online"]').first();
      assert.ok((await email.getAttribute("href")).includes("mohd@paramasvara.online"));
    }
    if(item.locale==='en') {
      assert.equal(await page.locator('.translation-notice').count(),0);
      assert.equal(await page.locator('.translation-status').count(),0);
    } else {
      const disclaimer=page.locator('.translation-notice');
      const position=await disclaimer.evaluate(el=>({notice:el.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,main:document.querySelector('main').getBoundingClientRect().top,writing:getComputedStyle(el).writingMode,direction:getComputedStyle(el).direction}));
      assert.ok(position.notice>=position.header-1 && position.notice<position.main);
      assert.equal(position.writing,'horizontal-tb');
      assert.equal(position.direction,item.direction);
      assert.equal(await disclaimer.getAttribute('role'),null,'static notice is not an alert');
      await page.reload({waitUntil:'networkidle'});
      assert.equal(await page.locator('.translation-notice').count(),1,'notice persists after refresh');
      await page.locator('.language-control summary').click();
      const catalog=JSON.parse(await readFile(`src/i18n/locales/${item.locale}.json`,'utf8'));
      assert.equal(await page.locator('.translation-status').textContent(),catalog['Machine translated from English']);
      assert.ok(!(await page.locator('.language-panel').textContent()).includes(catalog['Machine Translation Notice']));
      await page.locator('.language-control summary').click();
    }
    assert.equal((await page.locator(".wordmark").innerText()).trim(),item.brandMark+".");
    if(item.writingModes.includes("vertical")) {
      await page.setViewportSize({width:1440,height:1000});
      const heroBefore=(await page.locator(".hero-environment").boundingBox()).height;
      assert.equal(await page.locator(".hero-native-column").evaluate(el=>getComputedStyle(el).writingMode),"vertical-rl");
      await page.locator(".language-control summary").click();
      await page.locator(".reading-control select").selectOption("vertical");
      assert.equal(await page.locator(".vertical-text").first().evaluate(el=>getComputedStyle(el).writingMode),"vertical-rl");
      assert.ok(await page.locator("h2 > .vertical-text").count()>=4);
      assert.equal(await page.locator(".translation-notice").evaluate(el=>getComputedStyle(el).writingMode),"horizontal-tb");
      assert.ok(Math.abs((await page.locator(".hero-environment").boundingBox()).height-heroBefore)<1);
      assert.equal(await page.locator(".hero-role").evaluate(el=>getComputedStyle(el).writingMode),"horizontal-tb");
      await page.screenshot({path:`${output}/${item.locale}-vertical-hero.png`});
      assert.equal(await page.locator(".desktop-nav").evaluate(el=>getComputedStyle(el).writingMode),"horizontal-tb");
      await page.reload({waitUntil:"networkidle"});
      await page.waitForFunction(()=>document.documentElement.dataset.writingMode === "vertical");
      assert.ok(await page.locator(".vertical-text").count());
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    }
    if(item.locale==='ta') {
      await page.setViewportSize({width:1440,height:900});
      await page.waitForTimeout(250);
      const tamil=await page.locator('.hero').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,font:getComputedStyle(el).fontFamily}));
      assert.ok(tamil.height>0,"Tamil hero retains accessible scrolling when the full notice reduces available height");
      assert.match(tamil.font,/Noto Sans Tamil/);
      const caption=await page.locator('.portrait figcaption .mono').evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)}));
      assert.ok(caption.height<=caption.line+1,'Tamil profile label stays on one line');
    }
    const periods=await page.locator('.project .project-meta, .role-period').allTextContents();
    const yearPeriod=await page.locator('#case-wensymes').locator('.project-meta').textContent();
    if(item.locale!=="en")assert.ok(!yearPeriod.includes('onward'),`${item.locale}: translated open-ended period`);
    if(item.calendar!=="gregory")assert.ok(yearPeriod.includes('[2025]'),`${item.locale}: Gregorian year retained`);
    report.datePeriods.push({locale:item.locale,periods,yearPeriod});
    await page.locator('.experience-assistant > summary').click();
    const assistant=page.locator('.pace-assistant');
    await assistant.locator('.pace-starters button').first().waitFor();
    assert.equal(await assistant.getAttribute('lang'),'en');
    assert.equal(await assistant.getAttribute('dir'),'ltr');
    assert.equal(await assistant.getAttribute('translate'),'no');
    const semantics=await assistant.evaluate(el=>({direction:getComputedStyle(el).direction,writing:getComputedStyle(el).writingMode,align:getComputedStyle(el).textAlign}));
    assert.deepEqual(semantics,{direction:'ltr',writing:'horizontal-tb',align:'left'});
    const catalog=JSON.parse(await readFile(`src/i18n/locales/${item.locale}.json`,"utf8"));
    assert.ok((await page.locator('.pace-english-boundary > p').textContent()).includes(catalog['PACE-RAG supports English questions and answers only. Please ask your question in English.']));
    await assistant.locator('textarea').fill('ما هي المشاريع التي عملت عليها؟');
    await assistant.getByRole('button',{name:'Search knowledge',exact:true}).click();
    await assistant.locator('.pace-status').filter({hasText:'Please rephrase your question in English'}).waitFor();
    await assistant.getByRole('button',{name:'Which projects used React?',exact:true}).first().click();
    const answer=await assistant.locator('.pace-answer').textContent();
    await assistant.locator('textarea').fill('Which projects used 株式会社 APIs?');
    await assistant.evaluate(el=>el.dataset.pmeIdentity='preserved');
    const next=item.locale==='en'?'ar':'en';
    await page.locator('.language-control summary').click();
    await page.locator('.language-panel > label:first-child > select').selectOption(next);
    await page.waitForFunction(locale=>document.documentElement.lang===locale,next);
    assert.equal(await assistant.getAttribute('data-pme-identity'),'preserved');
    assert.equal(await assistant.locator('textarea').inputValue(),'Which projects used 株式会社 APIs?');
    assert.equal(await assistant.locator('.pace-answer').textContent(),answer);
    report.assistantChecks.push({locale:item.locale,semantics,noticeLocalized:true,nonEnglishGuard:true,statePreserved:true});
    await context.close();
    console.log(`PASS ${item.locale}: eight widths, direction, localized static refresh`);
  }
  const context = await browser.newContext({locale:"ar-SA",viewport:{width:1440,height:1000},reducedMotion:"reduce"});
  const page = await context.newPage();
  page.on("pageerror",error=>report.errors.push(error.message));
  for (const route of ["work-with-me","no-two-mondays","pace-rag-case-study","incident-zero"]) {
    await page.goto(`${base}/ar/${route}/`,{waitUntil:"networkidle"});
    for (const landscape of await page.locator(".page-landscape .ascii-forest,.page-landscape .ascii-river").all()) {
      assert.ok((await landscape.evaluate(el=>getComputedStyle(el).maskImage)).match(/to left|270deg/),`Arabic ${route} scenery must sit left`);
    }
  }
  report.scenarios.push("left-side Arabic artwork across pages");
  await page.goto(base+"/",{waitUntil:"networkidle"});
  await page.waitForURL("**/ar/");
  report.scenarios.push("browser detection");
  await page.locator(".language-control summary").click();
  await page.locator(".language-panel > label:first-child > select").focus();
  await page.locator(".language-panel > label:first-child > select").selectOption("de");
  await page.waitForURL("**/de/");
  assert.equal(await page.evaluate(()=>localStorage.getItem("portfolio.locale.v1")),"de");
  const german=JSON.parse(await readFile("src/i18n/locales/de.json","utf8"));
  await page.waitForFunction(title=>document.title===title,german["Mohd. Paramasvara | Principal Full-Stack Engineer"]);
  report.scenarios.push("browser title updates with selected language");
  assert.equal(await page.locator(".language-panel > label:first-child > select").evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".language-control").getAttribute("open"),null);
  assert.equal(await page.locator(".language-control summary").evaluate(el=>el===document.activeElement),true);
  await page.reload({waitUntil:"networkidle"});
  assert.equal(await page.locator("html").getAttribute("lang"),"de");
  await page.goto(base+"/",{waitUntil:"networkidle"});await page.waitForURL("**/de/");
  report.scenarios.push("manual override and persistent preference");
  await page.goto(base+"/en/work-with-me/?source=qa#contact",{waitUntil:"networkidle"});
  await page.waitForFunction(()=>document.documentElement.dataset.localeReady === "en");
  assert.equal(await page.locator("html").getAttribute("lang"),"en");
  report.scenarios.push("URL overrides preference");
  const input=page.locator('input[type="text"]').first();
  if(await input.count()) await input.fill("Preserve this input");
  await page.locator(".language-control summary").click();
  await page.locator(".language-panel > label:first-child > select").selectOption("fr");
  await page.waitForURL("**/fr/work-with-me/?source=qa#contact");
  if(await input.count()) assert.equal(await input.inputValue(),"Preserve this input");
  await page.goBack();await page.waitForFunction(()=>document.documentElement.lang==="en");
  await page.goForward();await page.waitForFunction(()=>document.documentElement.lang==="fr");
  report.scenarios.push("nested route, query, fragment and history preservation");
  report.formPresent = Boolean(await input.count());
  if(await page.locator(".language-control").getAttribute("open")!==null)await page.locator(".language-control summary").click();
  await page.locator(".translation-notice .translation-original").click();await page.waitForURL("**/en/work-with-me/?source=qa#contact");
  assert.equal(await page.evaluate(()=>localStorage.getItem("portfolio.locale.v1")),"en");
  assert.equal(await page.locator(".translation-notice").count(),0);
  report.scenarios.push("English original updates saved preference and preserves route/query/fragment");
  // Audit text present in the actual English page tree, including shared data.
  for(const route of ["/en/","/en/work-with-me/","/en/no-two-mondays/","/en/pace-rag-case-study/","/en/incident-zero/"]) {
    await page.goto(base+route,{waitUntil:"networkidle"});
    const strings=await page.evaluate(()=>{
      const walker=document.createTreeWalker(document.querySelector("#root"),NodeFilter.SHOW_TEXT);const result=[];let node;
      while((node=walker.nextNode())){const parent=node.parentElement;if(parent?.closest('script,style,code,pre,[aria-hidden="true"],[lang="en"][dir="ltr"]'))continue;const value=node.textContent.trim().replace(/\s+/g," ");if(/[A-Za-z]{3,} [A-Za-z]{3,}/.test(value))result.push(value);}
      return [...new Set(result)];
    });
    report.missingSource.push(...strings.filter(value=>!Object.hasOwn(english,value)).map(value=>({route,value})));
  }
  await page.goto(base+"/ja/",{waitUntil:"networkidle"});
  await page.locator(".language-control summary").click();
  await page.locator(".reading-control select").selectOption("vertical");
  await page.locator(".language-panel > label:first-child > select").selectOption("es");
  await page.waitForFunction(()=>document.documentElement.lang==="es"&&document.documentElement.dataset.writingMode==="horizontal");
  assert.equal(await page.locator(".reading-control").count(),0);
  assert.equal(await page.locator(".vertical-text").count(),0);
  report.scenarios.push("vertical preference stays inactive in unrelated languages");
  await context.close();
  const unsupported=await browser.newContext({locale:"ko-KR"});const fallback=await unsupported.newPage();
  await fallback.goto(base+"/",{waitUntil:"networkidle"});await fallback.waitForURL("**/en/");await unsupported.close();
  report.scenarios.push("unsupported browser language falls back");
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.translationRequests,[]);
} finally {
  await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));
  await browser.close();
}
