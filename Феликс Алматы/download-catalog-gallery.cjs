const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve('felix-web/import');fs.mkdirSync(path.join(root,'gallery'),{recursive:true});
const products=JSON.parse(fs.readFileSync(path.join(root,'products.json')));
const hash=url=>crypto.createHash('sha256').update(url.split('/v1/')[0]).digest('hex').slice(0,18);
const tasks=[...new Map(products.flatMap(p=>p.images.map(i=>({key:hash(i.url),url:i.url}))).map(i=>[i.key,i])).values()];let cursor=0;const failed=[];
(async()=>{async function worker(){while(cursor<tasks.length){const i=cursor++,item=tasks[i],file=path.join(root,'gallery',item.key+'.jpg');if(fs.existsSync(file))continue;try{const r=await fetch(item.url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('HTTP '+r.status);const data=Buffer.from(await r.arrayBuffer());if(data.length>5000000)throw Error('size');fs.writeFileSync(file,data)}catch(e){failed.push({...item,error:e.message})}if(i%30===0)console.log((i+1)+'/'+tasks.length+' images');await new Promise(r=>setTimeout(r,250))}}await Promise.all([worker(),worker(),worker()]);
 for(const p of products)p.local_gallery=p.images.map(i=>({file:'gallery/'+hash(i.url)+'.jpg',source:i.url})).filter(i=>fs.existsSync(path.join(root,i.file)));
 fs.writeFileSync(path.join(root,'products.json'),JSON.stringify(products,null,2));fs.writeFileSync(path.join(root,'gallery-report.json'),JSON.stringify({unique:tasks.length,saved:tasks.length-failed.length,failed,rights:'Local reference only; publication permission not confirmed'},null,2));console.log('Gallery complete: '+tasks.length+', failed '+failed.length);
})().catch(e=>{console.error(e);process.exit(1)});
