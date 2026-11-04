const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/Asus2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.argv[2]||'felix-web/dist');
const visual='C:/Users/Asus2025/.codex/visualizations/2026/10/30/01a18d65-fd7a-7cd2-833c-296a3dab394b';
(async()=>{
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'catalog-data.js'),'utf8'),sandbox);
 const sofas=sandbox.window.FELIX_PRODUCTS.filter(p=>p.categories.includes('soft'));
 const sample=sofas.find(p=>p.title.includes('Боттичелли 2'));
 const isolated=path.join(visual,'photo-regression-no-assets');fs.mkdirSync(isolated,{recursive:true});
 for(const name of ['category-soft.html','catalog-data.js','app.js','styles.css','collection-'+sample.id+'.html'])fs.copyFileSync(path.join(root,name),path.join(isolated,name));
 assert.equal(fs.existsSync(path.join(isolated,'assets')),false);
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
 async function loaded(selector){await page.locator(selector).evaluateAll(async images=>{for(const img of images){img.loading='eager';await img.decode();}});assert.equal(await page.locator(selector).evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)),true);}
 await page.goto(pathToFileURL(path.join(isolated,'category-soft.html')).href);
 await page.waitForFunction(()=>document.querySelectorAll('.product-card').length===12);
 await loaded('.product-card img');
 const decoded=await page.evaluate(async()=>{const bad=[];for(const p of window.FELIX_PRODUCTS){const i=new Image();try{i.src=p.image;await i.decode();if(!i.naturalWidth)bad.push(p.id)}catch{bad.push(p.id)}i.src='';}return {total:window.FELIX_PRODUCTS.length,bad};});
 assert.equal(decoded.total,209);assert.deepEqual(decoded.bad,[]);
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:1100});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
 await page.locator('#sort').selectOption('za');await loaded('.product-card img');
 await page.locator('#sort').selectOption('default');await page.locator('[data-add]').first().click();await loaded('.product-card img');
 await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:path.join(visual,'soft-images-fixed-edge.jpg'),type:'jpeg',quality:93});
 await page.goto(pathToFileURL(path.join(isolated,'collection-'+sample.id+'.html')).href);await loaded('#gallery-main,.gallery-thumbs img');
 const galleryCount=await page.locator('[data-gallery]').count();assert.ok(galleryCount>1);
 await page.locator('[data-gallery]').last().click();await loaded('#gallery-main');
 assert.ok((await page.locator('#gallery-main').getAttribute('src')).startsWith('data:image/'));
 await page.goto('http://127.0.0.1:8770/category-soft.html');await loaded('.product-card img');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const report={status:'passed',date:new Date().toISOString(),browser:'Installed Microsoft Edge',root,isolatedWithoutAssets:true,decodedPrimaryImages:decoded.total,softFurnitureImages:sofas.length,galleryImages:galleryCount,viewports:[390,768,1440],checks:['All 209 primary images decoded by Edge','12 soft-furniture cards work without assets directory','Photos survive sorting and adding to selection','Product gallery works without assets directory; last thumbnail decoded','Local server also loads all soft-furniture cards'],errors,failedRequests:failed};
 fs.writeFileSync(path.join(visual,'image-portability-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
