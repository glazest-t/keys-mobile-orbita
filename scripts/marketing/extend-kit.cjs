module.exports=({Art,C,save,guide,root,out,current,fs,path,measure})=>{
 const base=path.relative(root,out), comps=JSON.parse(fs.readFileSync(path.join(out,'current-app/compositions.json')));
 // Exact brandbook composition: source logo unchanged, original radial background.
 const orbitSource='design/assets/logo/mark-3d.svg';
 for(const [id,caption] of [['brandbook-orbit-caption',true],['brandbook-orbit-clean',false]]){
  const a=new Art(1064,800,caption?'Орбита из брендбука · с подписью':'Орбита из брендбука · без подписи','transparent');
  a.add('<defs><radialGradient id="stage-bg" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(319.2 160) scale(957.6 640)"><stop stop-color="#fff"/><stop offset=".4" stop-color="#eef0ff"/><stop offset=".7" stop-color="#dfe3ff"/><stop offset="1" stop-color="#d6f1ff"/></radialGradient></defs>');
  a.rect(1.1,1.1,1061.8,797.8,'url(#stage-bg)',70,'#FFFFFF');
  a.img(orbitSource,246,72,572,572);
  if(caption){const t='Кольцо — отели. Точка — гость.';a.text(t,(1064-measure(t,26.3))/2,674,26.3,C.slate)}
  save(id,'Графика брендбука',a,'Исходный mark-3d.svg и градиент .logo-stage из docs/brand/brandbook.css. Цвета и геометрия знака сохранены.','Экспорт текущего брендбука');
 }
 {const a=new Art(1200,1200,'Орбита · прозрачный фон','transparent');a.img(orbitSource,0,0,1200,1200);save('brandbook-orbit-transparent','Графика брендбука',a,'Исходный знак без изменения цветов; PNG на прозрачном фоне.','Экспорт текущего брендбука')}
 guide('brandbook-orbit','Орбита · цвета и фон из брендбука',a=>{a.img(base+'/outlined/brandbook-orbit-caption.svg',64,230,825,620);a.text('Оригинальная композиция',950,295,23,C.ink,'medium',410);a.lines(['Кобальтовое кольцо.','Лавандовая сфера.','Белый ореол и синяя тень.','Бело-голубой градиент.'],950,355,22,C.slate,'body',1.6,400);a.text('Варианты в каталоге:',950,570,23,C.ink,'medium',400);a.lines(['С подписью · без подписи.','Знак на прозрачном фоне.','SVG и PNG.'],950,625,22,C.slate,'body',1.6,400);a.text('Источник: mark-3d.svg + .logo-stage из актуального брендбука.',64,887,20,C.slate)});
 const prompts=JSON.parse(fs.readFileSync('scripts/marketing/new-illustration-prompts.json'));
 const fresh=[['weekend','Небольшая поездка',['Выходные','начинаются здесь.'],'Найдите отель для короткого отдыха.','Выбрать отель'],['favorites','Избранное',['Сохраните то,','что понравилось.'],'Ваши любимые отели — под рукой.','В избранное'],['nearby','Рядом с отелем',['За впечатлениями.','Рядом с вами.'],'Откройте интересные места вокруг.','Посмотреть рядом'],['breakfast','Завтрак',['Утро без','спешки.'],'Добавьте завтрак к вашей поездке.','Выбрать завтрак']];
 fs.mkdirSync(path.join(out,'new-illustrations'),{recursive:true});
 for(const p of prompts){if(!p.sourcePath)throw new Error('Missing new art: '+p.id);fs.copyFileSync(p.sourcePath,path.join(out,'new-illustrations',p.id+'.png'))}
 fs.copyFileSync('scripts/marketing/new-illustration-prompts.json',path.join(out,'new-illustrations/prompts.json'));
 const generated=[];
 for(const [id,name,lines,sub,cta]of fresh){
  for(const [format,w,h]of [['square',1080,1080],['hero',1440,640],['mobile',361,172]]){
   const a=new Art(w,h,name+' / '+format,C.white),im=base+'/new-illustrations/'+id+'.png';
   if(format==='square'){a.logo(64,70,250);a.lines(lines,64,240,60,C.ink,'display',1.2,952);a.img(im,355,360,660,550);a.text(sub,64,910,26,C.slate,'body',952);a.button(cta,64,960,360,64)}
   if(format==='hero'){a.logo(64,64,230);a.lines(lines,64,250,58,C.ink,'display',1.22,780);a.text(sub,64,420,27,C.slate,'body',740);a.button(cta,64,500,340,70);a.img(im,840,65,550,520)}
   if(format==='mobile'){a.nodes=[];a.rect(.5,.5,360,171,C.white,28,C.line);a.lines(lines,20,45,17,C.ink,'display',1.32,205);a.text(cta,20,140,14,C.blue,'medium',202);a.img(im,222,20,126,132)}
   const key='new-'+id+'-'+format;save(key,'Новые промо',a,'Новая композиция по текущему визуальному языку приложения; PNG-иллюстрация + редактируемая типографика.','Новая иллюстрация и адаптация');generated.push(key);
  }
 }
 function gridPage(id,title,items,cols,rows){guide(id,title,a=>{const cw=1312/cols,ch=650/rows;items.forEach((it,i)=>{const x=64+(i%cols)*cw,y=235+Math.floor(i/cols)*ch;a.rect(x,y,cw-16,ch-16,it.p.includes('white')?C.blue:C.white,18);a.img(it.p,x+12,y+8,cw-40,ch-68);a.text(it.title,x+14,y+ch-36,Math.min(18,cw/12),it.p.includes('white')?C.white:C.ink,'medium',cw-44)});})}
 function split(items,n){return Array.from({length:Math.ceil(items.length/n)},(_,i)=>items.slice(i*n,i*n+n))}
 for(const [i,part]of split(comps,5).entries())gridPage('live-'+i,'Текущие композиции приложения · '+(i+1),part.map(v=>({title:v.title,p:base+'/current-app/'+v.png})),3,2);
 const promo=current.assets.filter(a=>a.category==='Промо и онбординг');
 for(const [i,part]of split(promo,8).entries())gridPage('originals-'+i,'Исходная промо-графика · '+(i+1),part.map(v=>({title:path.basename(v.url),p:base+'/current-app/'+v.file})),4,2);
 for(const [i,part]of split(current.preferenceCrops,16).entries())gridPage('preferences-'+i,'Все предпочтения · '+(i+1),part.map(v=>({title:v.id,p:base+'/current-app/'+v.file})),4,4);
 for(const [i,part]of split(current.assets.filter(v=>v.category==='Контурные иконки'),50).entries())gridPage('icons-'+i,'Контурные иконки · '+(i+1),part.map(v=>({title:path.basename(v.url,'.svg'),p:base+'/current-app/'+v.file})),10,5);
 for(const category of ['Иконки приложения','Идеи отдыха','Иллюстрации мест рядом','Логотипы','Услуги','Оболочка устройства']){
 const entries=current.assets.filter(v=>v.category===category);for(const [i,part]of split(entries,12).entries())gridPage('library-'+category+'-'+i,category+(entries.length>12?' · '+(i+1):''),part.map(v=>({title:path.basename(v.url),p:base+'/current-app/'+v.file})),4,3);
 }
 gridPage('new-art','Новые иллюстрации · развитие стиля',fresh.map(([id,title])=>({title,p:base+'/new-illustrations/'+id+'.png'})),4,1);
 gridPage('new-promos','Новые баннеры · четыре сценария',fresh.map(([id,title])=>({title,p:base+'/outlined/new-'+id+'-hero.svg'})),2,2);
 guide('source-audit','Откуда взята графика',a=>{a.lines(['Эталон — текущая локальная сборка и её зависимости.','929 локальных файлов · 32 вырезки из актуальных спрайтов.','13 композиций сохранены прямо из работающего приложения.','В current-app/ лежат исходные ассеты, HTML/CSS и реестр источников.'],64,285,27,C.ink,'body',1.7,1310);a.lines(['«Горячие скидки»: актуальный билет с %, орбитой и огнём.','Старые flame / orbit исключены из текущего комплекта.','Friendly Rate: используется настоящий зелёный портал.','Новые иллюстрации и баннеры отмечены отдельно.'],64,535,25,C.slate,'body',1.7,1310);a.text('Фотографии: полный локальный архив и адреса внешних источников — в каталоге.',64,820,23,C.blue,'medium',1310);a.text('current-app.html → категория «Фотографии отелей» → исходник и место использования.',64,865,21,C.slate,'body',1310)});
 fs.writeFileSync(path.join(out,'new-illustrations/manifest.json'),JSON.stringify(fresh.map(([id,title])=>({id,title,file:id+'.png',status:'Новая иллюстрация, не существующий экран приложения',method:'imagegen',palette:'pearly white, cobalt #2F5BFF, small warm accents',banners:generated.filter(v=>v.startsWith('new-'+id+'-'))})),null,2));
};
