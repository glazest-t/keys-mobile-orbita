import {createHash} from 'node:crypto';
import {createReadStream,createWriteStream,existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {Readable} from 'node:stream';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

export async function publishMarketing({root,out,base}){
 const info=JSON.parse(readFileSync(path.join(root,'publish/marketing.json'),'utf8'));
 const archive=process.env.MARKETING_ARCHIVE||path.join(os.tmpdir(),`keys-marketing-${info.sha256}.zip`);
 if(!existsSync(archive)){
  const response=await fetch(info.archiveUrl);if(!response.ok)throw Error(`Marketing archive download failed: ${response.status}`);
  await pipeline(Readable.fromWeb(response.body),createWriteStream(archive));
 }
 const hash=createHash('sha256');for await(const chunk of createReadStream(archive))hash.update(chunk);
 if(hash.digest('hex')!==info.sha256)throw Error('Marketing archive checksum mismatch');
 const dest=path.join(out,'marketing');mkdirSync(dest,{recursive:true});
 execFileSync('python3',[path.join(root,'publish/extract-marketing.py'),archive,dest],{stdio:'inherit'});
 const file=path.join(dest,'index.html');let html=readFileSync(file,'utf8');
 html=html.replace('<title>Ключи / маркетинг и брендинг</title>','<title>Материалы для маркетинга · Ключи</title>')
  .replace('Всё для следующей<br>истории «Ключей».','Материалы<br>для маркетинга')
  .replace('Общая стилистика, рекламные форматы и элементы бренда в одном переносимом комплекте.','Готовые материалы для сайтов, лендингов и соцсетей: баннеры, иллюстрации, UI, шрифты, цвета и редактируемые исходники.')
  .replace('<a href="keys-brand-style.pdf">Руководство PDF ↗</a>',`<a href="${info.archiveUrl}">Скачать ZIP · ${info.archiveSizeMB} МБ ↓</a><a class="secondary" href="keys-brand-style.pdf">Стилистика PDF ↗</a>`)
  .replace('<header>','<header>').replace('<main>',`<nav class="project-links" aria-label="Разделы проекта"><a href="${base}">← К проекту</a><a href="${base}prototype/">Прототип</a><a href="${base}docs/brand/index.html">Брендбук</a><a href="start.html">Как использовать материалы</a></nav><main>`)
  .replace('<section id="catalogue">',`<section class="asset-library" id="start"><h2>С чего начать</h2><div class="intro"><div><strong>Сайт и лендинг</strong><p>Возьмите шрифты, токены, логотип и широкий баннер. Собирайте текст и кнопки в HTML.</p><a href="start.html#web">Материалы для сайта →</a></div><div><strong>Соцсети и реклама</strong><p>Квадраты, вертикальные публикации, stories и широкие баннеры с редактируемым текстом.</p><a href="start.html#social">Материалы для соцсетей →</a></div><div><strong>Дизайн и разработка</strong><p>Исходные иллюстрации, UI, SVG и PNG. Реестр показывает происхождение каждого файла.</p><a href="start.html#handoff">Как передать исходники →</a></div></div></section><section id="catalogue">`)
  .replaceAll("document.querySelectorAll('.item')","document.querySelectorAll('#catalogue .item')")
  .replaceAll('Орбита — как на вашем скриншоте','Фирменная орбита')
  .replaceAll('Набор не опубликован на внешних площадках.','Комплект опубликован для работы над материалами проекта.');
 // Preview lightweight PNGs; original editable SVGs remain available for download.
 html=html.replace(/(<img\b[^>]*\bsrc=")outlined\/([^"/]+)\.svg/g,'$1png/$2.png');
 writeFileSync(file,html);
 writeFileSync(path.join(dest,'start.html'),readFileSync(path.join(root,'publish/marketing-start.html'),'utf8').replaceAll('{{BASE}}',base).replaceAll('{{ARCHIVE_URL}}',info.archiveUrl));
 let gallery=readFileSync(path.join(dest,'current-app.html'),'utf8').replace('<main>',`<main><p style="margin-bottom:16px"><a href="${base}">← К проекту</a> · <a href="start.html">Как использовать материалы</a></p>`);
 writeFileSync(path.join(dest,'current-app.html'),gallery.replaceAll('Орбита — как на вашем скриншоте','Фирменная орбита'));
 const css=path.join(dest,'catalogue.css');writeFileSync(css,readFileSync(css,'utf8')+'\n.project-links{display:flex;gap:20px;flex-wrap:wrap;padding:16px 4vw;font-size:14px;border-bottom:1px solid #e4e7ef}.intro a{display:inline-block;margin-top:16px}.hero h1{overflow-wrap:normal}@media(max-width:600px){.hero h1{font-size:30px}.project-links{gap:12px}}\n');
 writeFileSync(path.join(dest,'publication.json'),JSON.stringify({...info,source:'Archive SHA-256 verified; public navigation and getting-started page added at build time'},null,2));
 const checksumsFile=path.join(dest,'SHA256SUMS.json');
 const checksums=JSON.parse(readFileSync(checksumsFile,'utf8'));
 for(const name of ['index.html','current-app.html','start.html','catalogue.css','publication.json'])checksums[name]=createHash('sha256').update(readFileSync(path.join(dest,name))).digest('hex');
 writeFileSync(checksumsFile,JSON.stringify(checksums,null,2));
 console.log(`Marketing ready: ${info.assets} layouts/pages, ${info.originalAssets} source assets, archive SHA-256 verified`);
}
