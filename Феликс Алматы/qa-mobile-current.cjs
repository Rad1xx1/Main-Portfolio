const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/Asus2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='C:/Users/Asus2025/.codex/visualizations/2026/10/30/01a18d65-fd7a-7cd2-833c-296a3dab394b';
(async()=>{
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:8770/';
const pages=['index.html','catalog.html','category-soft.html','collection-yalta.html','contacts.html','selection.html'];
for(const width of [360,390,430]){await p.setViewportSize({width,height:844});for(const file of pages){await p.goto(base+file);await p.waitForFunction(()=>window.FELIX_PRODUCTS?.length===209);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,width+' '+file);}}
await p.setViewportSize({width:390,height:844});await p.goto(base+'index.html');await p.locator('.hero-photo img').evaluate(i=>i.decode());
await p.screenshot({path:path.join(out,'mobile-current-home.jpg'),type:'jpeg',quality:95});
await p.locator('.menu-toggle').tap();assert.equal(await p.locator('#mobile-nav').isVisible(),true);await p.locator('#mobile-nav a[href="category-soft.html"]').tap();await p.waitForURL('**/category-soft.html');assert.equal(await p.locator('.product-card').count(),12);
await p.locator('#products img').evaluateAll(async imgs=>{for(const i of imgs){i.loading='eager';await i.decode();}});await p.screenshot({path:path.join(out,'mobile-current-catalog.jpg'),type:'jpeg',quality:95});
await p.locator('.product-card [data-add]').first().tap();assert.equal(await p.locator('.header .selection-count').innerText(),'1');
await p.locator('.product-card .product-image-button').first().tap();await p.waitForSelector('#gallery-main');await p.locator('#gallery-main').evaluate(i=>i.decode());
await p.locator('[data-gallery]').last().tap();await p.locator('#gallery-main').evaluate(i=>i.decode());
await p.locator('.header .selection-toggle').tap();assert.equal(await p.locator('#selection-dialog').isVisible(),true);await p.locator('#purpose').selectOption('soft');await p.locator('#notes').fill('Два дивана в зону ожидания');await p.locator('#brief-form button[type=submit]').tap();assert.equal(await p.locator('#request-result').isVisible(),true);assert.match(await p.locator('#request-text').inputValue(),/Два дивана/);
await p.screenshot({path:path.join(out,'mobile-current-selection.jpg'),type:'jpeg',quality:93});await p.locator('#selection-dialog .close-dialog').tap();assert.equal(await p.locator('#selection-dialog').isVisible(),false);assert.deepEqual(errors,[]);
const report={status:'passed',date:new Date().toISOString(),browser:'Edge mobile emulation, touch enabled, DPR 2',widths:[360,390,430],pages,checks:['No horizontal overflow on 18 page/viewport combinations','Touch menu and category navigation','All 12 sofa photos decoded','Touch add and product-gallery thumbnail','Mobile selection form and draft generation','Close dialog by touch'],errors,limitation:'No physical Android or iPhone / Safari test'};
fs.writeFileSync(path.join(out,'mobile-current-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
