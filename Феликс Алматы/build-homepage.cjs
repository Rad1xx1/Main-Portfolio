const fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/Asus2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.join(__dirname,'felix-site');
(async()=>{
  let html=fs.readFileSync(path.join(root,'index.source.html'),'utf8');
  html=html.replace('<a href="sources.html">Материалы и источники ↗</a>','<button class="open-credits footer-link" type="button">Материалы и источники ↗</button>');
  if(!html.includes('id="credits-dialog"')) html=html.replace('  <div id="toast"',`  <dialog id="credits-dialog" class="selection-dialog" aria-labelledby="credits-title"><div class="dialog-top"><span>О демонстрации</span><button class="icon-button close-dialog" aria-label="Закрыть источники">×</button></div><div class="selection-content"><h2 id="credits-title">Материалы и источники</h2><p class="muted">Независимая концепция редизайна. Фотографии и названия коллекций — из открытого каталога компании. Публичное использование материалов и коммерческие условия нужно согласовать с владельцем.</p><p><a href="https://www.felix-almaty.kz/" target="_blank" rel="noopener noreferrer">Официальный каталог ↗</a></p><p><a href="https://www.felix-almaty.kz/contact" target="_blank" rel="noopener noreferrer">Источник контактов ↗</a></p><p class="muted">Это главная страница для обсуждения дизайна, не официальный магазин. Данные подборки остаются в браузере; заявки не отправляются.</p></div></dialog>\n  <div id="toast"`);
  html=html.replace(/\s*<link rel="stylesheet" href="polish\.css">/g,'');
  html=html.replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="polish.css">');
  fs.writeFileSync(path.join(root,'index.source.html'),html);
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage();await page.goto('about:blank');
  const images={};
  for(const name of fs.readdirSync(path.join(root,'assets')).filter(f=>f.endsWith('.jpg'))){
    const file=path.join(root,'assets',name);
    const input='data:image/jpeg;base64,'+fs.readFileSync(file).toString('base64');
    images['assets/'+name]=await page.evaluate(async({input,name})=>{
      const image=new Image();image.src=input;await image.decode();
      const max=name.startsWith('interior')?1600:1000;
      const scale=Math.min(1,max/image.naturalWidth);
      const canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      return canvas.toDataURL('image/jpeg',.87);
    },{input,name});
  }
  await browser.close();
  const css=fs.readFileSync(path.join(root,'styles.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'polish.css'),'utf8');
  let data=fs.readFileSync(path.join(root,'products.js'),'utf8');
  for(const [src,url] of Object.entries(images)){
    html=html.replaceAll('src="'+src+'"','src="'+url+'"');
    data=data.replaceAll('"'+src+'"',JSON.stringify(url));
  }
  const favicon='data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'assets/favicon.svg')).toString('base64');
  html=html.replace('href="assets/favicon.svg"','href="'+favicon+'"');
  html=html.replace(/<link rel="stylesheet" href="(?:styles|polish)\.css">\s*/g,'');
  html=html.replace(/<script src="(?:products|app)\.js" defer><\/script>\s*/g,'');
  html=html.replace('</head>','<style>\n'+css+'\n</style>\n</head>');
  const js=fs.readFileSync(path.join(root,'app.js'),'utf8').replaceAll('loading="lazy"','loading="eager" decoding="async"');
  html=html.replace('</body>',()=>'<script>\n'+data+'\n'+js+'\n</script>\n</body>');
  fs.writeFileSync(path.join(root,'index.html'),html);
  console.log('Self-contained homepage: '+Math.round(Buffer.byteLength(html)/1024)+' KB; '+Object.keys(images).length+' embedded photo assets.');
})().catch(e=>{console.error(e);process.exit(1)});
