const fs=require('fs'),path=require('path');
const source=path.resolve('felix-web');
const dest=path.resolve('C:/Users/Asus2025/Documents/Работа/Сайты/Феликс Алматы — сайт');
const visual='C:/Users/Asus2025/.codex/visualizations/2026/10/30/01a18d65-fd7a-7cd2-833c-296a3dab394b';
fs.mkdirSync(dest,{recursive:true});fs.cpSync(source,dest,{recursive:true});
fs.mkdirSync(path.join(dest,'Проверка'),{recursive:true});
fs.copyFileSync(path.join(visual,'felix-web-qa.json'),path.join(dest,'Проверка','result.json'));
for(const name of ['catalog','collection-yalta','contacts','about'])fs.copyFileSync(path.join(visual,'felix-web-'+name+'.jpg'),path.join(dest,'Проверка',name+'.jpg'));
console.log('Website saved to '+dest);
