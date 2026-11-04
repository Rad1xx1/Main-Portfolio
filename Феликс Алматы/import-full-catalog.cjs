const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {chromium}=require('C:/Users/Asus2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('felix-web/import');fs.mkdirSync(path.join(dir,'records'),{recursive:true});fs.mkdirSync(path.join(dir,'images'),{recursive:true});
const categories=[['executive','Кабинеты руководителя','kabinet'],['work','Мебель для персонала','mebel-dlya-personala'],['executive-chairs','Кресла руководителя','kresla-dlya-rukovoditelya'],['staff-chairs','Кресла персонала','kresla-dlya-personala'],['soft','Мягкая мебель','myagkaya-mebel'],['partitions','Офисные перегородки','ofisnye-peregorodki'],['reception','Мебель для приёмных','mebel-dlya-priemnyh'],['chairs','Стулья','stulya'],['kids','Детская мебель','mebel-dlya-detskoj'],['hotel','Мебель для гостиниц','mebel-dlya-gostinic'],['acoustic','Акустические кабины','blank'],['accessories','Аксессуары','aksessuary']].map(([id,title,slug])=>({id,title,url:'https://www.felix-almaty.kz/'+slug}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const normalize=url=>{try{return decodeURI(new URL(url,'https://www.felix-almaty.kz').href).replace(/\/$/,'')}catch{return url}};
async function get(url){for(let i=0;i<3;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(r.ok)return await r.text();if(r.status===404)return null;}catch{}await sleep(1000*(i+1));}throw Error('Unable to fetch '+url)}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 for(const c of categories){
  const cached=path.join(dir,'category-'+c.id+'.json');
  if(fs.existsSync(cached)){Object.assign(c,JSON.parse(fs.readFileSync(cached)));console.log('Cached '+c.title+': '+c.products.length);continue;}
  try{
   const r=await page.goto(c.url,{waitUntil:'domcontentloaded',timeout:40000});await page.waitForTimeout(1500);
   let previous=-1;
   for(let step=0;step<30;step++){
    const count=await page.locator('a[href*="/product-page/"]').count();
    if(count===previous)break;previous=count;
    const more=page.getByText(/^(Показать еще|Показать ещё|Load More)$/i).last();
    if(!await more.count()||!await more.isVisible())break;
    await more.scrollIntoViewIfNeeded();await more.click();await page.waitForTimeout(1200);
   }
   c.products=await page.locator('a[href*="/product-page/"]').evaluateAll(as=>[...new Set(as.map(a=>a.href))]);
   c.http=r.status();c.checked_at=new Date().toISOString();
   c.emptyConfirmed=await page.getByText(/временно нет товаров|нет товаров для отображения/i).count()>0;
   c.heading=await page.locator('h2').allTextContents();
   fs.writeFileSync(cached,JSON.stringify(c,null,2));console.log(c.title+': '+c.products.length+' product links; empty='+c.emptyConfirmed);
  }catch(e){c.products=[];c.error=e.message;console.log(c.title+': '+e.message.slice(0,100));}
  await sleep(700);
 }
 await browser.close();fs.writeFileSync(path.join(dir,'categories.json'),JSON.stringify(categories,null,2));
 const sitemap=fs.readFileSync(path.join(dir,'store-products-sitemap.xml'),'utf8');
 const all=[...new Map([...sitemap.matchAll(/<loc>([^<]+)/g)].map(m=>m[1]).concat(categories.flatMap(c=>c.products)).map(url=>[normalize(url),url])).values()];
 const records=[],failures=[];let cursor=0;
 async function worker(){while(cursor<all.length){const index=cursor++,url=all[index];const id=crypto.createHash('sha256').update(normalize(url)).digest('hex').slice(0,12);const cache=path.join(dir,'records',id+'.json');
  if(fs.existsSync(cache)){records.push(JSON.parse(fs.readFileSync(cache)));continue;}
  try{const html=await get(url);if(!html)throw Error('404');
   const blocks=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{try{return [JSON.parse(m[1])]}catch{return []}});
   const p=blocks.find(b=>b['@type']==='Product');if(!p)throw Error('Product structured data absent');
   const imgs=(Array.isArray(p.image)?p.image:[p.image]).filter(Boolean).map(i=>typeof i==='string'?{url:i}:{url:i.contentUrl||i.url,width:Number(i.width),height:Number(i.height)}).filter(i=>i.url);
   const facts=[...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m=>m[1].replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<300).slice(0,30);
   const offer=Array.isArray(p.offers)?p.offers[0]:p.offers;
   const item={id:'item-'+id,title:p.name,source:url,checked_at:new Date().toISOString(),images:imgs,sku:p.sku||'',facts,
      source_price:offer?.price??null,currency:offer?.priceCurrency||'KZT',source_availability:offer?.availability||'',
      categories:categories.filter(c=>c.products.some(u=>normalize(u)===normalize(url))).map(c=>c.id)};
   // Keep product facts, not complete third-party marketing descriptions.
   const specs=(p.description||'').match(/(?:\d+(?:[.,]\d+)?\s*(?:мм|см|кг|кв\.\s*м|м²|лет|год)[^.!?\n]{0,90})/g)||[];item.published_specs=[...new Set(specs)].slice(0,12);
   fs.writeFileSync(cache,JSON.stringify(item,null,2));records.push(item);
   if(imgs[0]){const imgfile=path.join(dir,'images',item.id+'.jpg');if(!fs.existsSync(imgfile)){const r=await fetch(imgs[0].url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('Image HTTP '+r.status);const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length>5000000)throw Error('Image too large');fs.writeFileSync(imgfile,bytes);}item.local_image='images/'+item.id+'.jpg';fs.writeFileSync(cache,JSON.stringify(item,null,2));}
   console.log((index+1)+'/'+all.length+' '+item.title+' ['+item.categories.join(',')+']');
  }catch(e){failures.push({url,error:e.message});console.log('Deferred '+url+': '+e.message);}
  await sleep(600);
 }}
 await Promise.all([worker(),worker()]);
 records.sort((a,b)=>a.title.localeCompare(b.title,'ru'));
 fs.writeFileSync(path.join(dir,'products.json'),JSON.stringify(records,null,2));
 const report={checked_at:new Date().toISOString(),sitemap_count:[...sitemap.matchAll(/<loc>/g)].length,unique_urls:all.length,imported:records.length,categories:categories.map(c=>({id:c.id,title:c.title,links:c.products.length,emptyConfirmed:c.emptyConfirmed,error:c.error})),unassigned:records.filter(p=>!p.categories.length).map(p=>({id:p.id,title:p.title,source:p.source})),missing_images:records.filter(p=>!p.local_image).map(p=>p.id),failures};
 fs.writeFileSync(path.join(dir,'import-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
