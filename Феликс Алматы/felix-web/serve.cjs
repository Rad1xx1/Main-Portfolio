const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'dist');
const port=Number(process.env.PORT||8770);
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 let name;try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400);res.end();return;}
 if(name==='/')name='/index.html';
 const file=path.resolve(root,'.'+name);
 const types={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.svg':'image/svg+xml'};
 if(!file.startsWith(root+path.sep)||!types[path.extname(file)]){res.writeHead(404);res.end();return;}
 let content,status=200;try{content=fs.readFileSync(file);}catch{content=fs.readFileSync(path.join(root,'404.html'));status=404;}
 res.writeHead(status,{'Content-Type':status===404?'text/html; charset=utf-8':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:content);
});
server.listen(port,'127.0.0.1',()=>console.log('Local website: http://127.0.0.1:'+port));
