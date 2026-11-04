const {chromium}=require('C:/Users/Asus2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'felix-site');fs.mkdirSync(path.join(root,'assets'),{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('https://www.felix-almaty.kz/',{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(2000);
const home=await page.evaluate(()=>({links:[...document.querySelectorAll('a[href*="product-page"]')].map(a=>({name:a.innerText.trim(),url:a.href,image:a.querySelector('img')?.src})),images:[...document.images].filter(i=>i.naturalWidth>500).map(i=>({url:i.src,alt:i.alt,width:i.naturalWidth,height:i.naturalHeight}))}));
fs.writeFileSync(path.join(root,'source-home.json'),JSON.stringify(home,null,2));console.log(JSON.stringify(home));
const unique=[...new Map(home.links.map(x=>[x.url,x])).values()];
const selected=unique.filter(x=>/серия-а4|серия-loft|metal-system|yalta|onix$|ресепшен.*а4/i.test(decodeURI(x.url))).slice(0,6);
const records=[];
for(const target of selected){
 try{await page.goto(target.url,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(2000);
 const record=await page.evaluate(()=>({title:document.title,heading:[...document.querySelectorAll('h1')].map(e=>e.innerText),images:[...document.images].filter(i=>i.naturalWidth>300&&i.naturalHeight>150).map(i=>({url:i.src,width:i.naturalWidth,height:i.naturalHeight,alt:i.alt})),text:document.querySelector('[data-hook="product-description"]')?.innerText?.slice(0,450)}));
 records.push({...record,source_url:target.url});console.log(JSON.stringify(records.at(-1)));
 }catch(e){console.log('Deferred '+target.url+': '+e.message)}
}
await browser.close();fs.writeFileSync(path.join(root,'source-products.json'),JSON.stringify(records,null,2));
const assets=[];
async function save(url,name,source,role){
 try{const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>10000000)throw Error('Image too large');fs.writeFileSync(path.join(root,'assets',name),bytes);assets.push({file:'assets/'+name,url,source_url:source,role,checked_at:new Date().toISOString(),rights:'Reference for private local redesign demonstration; permission for publication not confirmed'});console.log(name+': '+bytes.length)}catch(e){console.error(name+': '+e.message)}
}
for(let i=0;i<Math.min(home.images.length,3);i++)await save(home.images[i].url,'interior-'+i+'.jpg','https://www.felix-almaty.kz/','interior');
for(let i=0;i<records.length;i++){
 const imgs=records[i].images.filter(x=>!x.alt.includes('логотип'));
 if(imgs.length)await save(imgs[0].url,'product-'+i+'.jpg',records[i].source_url,'catalog');
}
fs.writeFileSync(path.join(root,'assets-sources.json'),JSON.stringify(assets,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
