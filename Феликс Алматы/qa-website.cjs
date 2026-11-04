const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Asus2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.argv[2]||'http://127.0.0.1:8770';
const out='C:/Users/Asus2025/.codex/visualizations/2026/10/30/01a18d65-fd7a-7cd2-833c-296a3dab394b';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];const external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(base))external.push(r.url())});
 const manifest=await fetch(base+'/build-info.json').then(r=>r.json());const checked=[];
 for(const record of manifest.pages){
  await page.setViewportSize({width:1440,height:1000});const response=await page.goto(base+'/'+record.file);assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1,record.file);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  const links=await page.locator('a[href]').evaluateAll(items=>items.map(i=>i.getAttribute('href')).filter(u=>u&&!/^(https?:|mailto:|tel:|#)/.test(u)));
  for(const link of links){const r=await fetch(new URL(link,page.url()));assert.equal(r.status,200,record.file+' -> '+link);}
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:width===390?844:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,record.file+' overflow '+width);}
  if(['catalog.html','collection-yalta.html','contacts.html','about.html'].includes(record.file))await page.screenshot({path:path.join(out,'felix-web-'+record.file.replace('.html','')+'.jpg'),type:'jpeg',quality:90});
  checked.push(record.file);
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/index.html');await page.locator('.desktop-nav a[href="catalog.html"]').click();
 await page.locator('[data-filter=executive]').click();assert.equal(await page.locator('.product-card').count(),1);await page.locator('[data-view=yalta]').first().click();await page.waitForURL('**/collection-yalta.html');
 await page.locator('[data-detail-add=yalta]').click();assert.equal(await page.locator('[data-detail-add=yalta]').getAttribute('aria-pressed'),'true');
 await page.locator('.desktop-nav a[href="contacts.html"]').click();assert.equal(await page.locator('.header .selection-count').innerText(),'1');
 await page.goto(base+'/selection.html');await page.locator('.selection-toggle').first().click();assert.equal(await page.locator('.selection-item').count(),1);
 await page.locator('#seats').fill('8');await page.locator('#notes').fill('Подобрать кабинет и 8 рабочих мест');await page.locator('#brief-form button[type=submit]').click();assert.match(await page.locator('#request-text').inputValue(),/YALTA/);assert.match(await page.locator('#request-text').inputValue(),/Рабочих мест: 8/);await page.keyboard.press('Escape');
 await page.goto(base+'/catalog.html?category=reception');assert.equal(await page.locator('.product-title').innerText(),'Ресепшен А4');
 await page.goto(base+'/planning.html');await page.locator('.faq summary').first().click();assert.equal(await page.locator('.faq details').first().getAttribute('open'),'');
 await page.setViewportSize({width:390,height:844});await page.locator('.menu-toggle').click();await page.locator('#mobile-nav a[href="about.html"]').click();await page.waitForURL('**/about.html');
 const missing=await fetch(base+'/missing-page');assert.equal(missing.status,404);
 const rejected=await fetch(base+'/index.html',{method:'POST'});assert.equal(rejected.status,405);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const report={status:'passed',date:new Date().toISOString(),pages:checked,viewports:[390,768,1440],journey:'Главная → каталог → YALTA → добавить → контакты → подборка → текст задачи; фильтр по ссылке; FAQ; мобильная навигация',errors,externalRequests:external,server:'404 for unknown paths; 405 for writes',method:'Playwright + installed Chrome. Browser plugin not available.'};
 fs.writeFileSync(path.join(out,'felix-web-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
