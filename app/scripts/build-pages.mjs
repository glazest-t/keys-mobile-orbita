#!/usr/bin/env node
/** GitHub Pages adapter. Protected runtime/source export are never rewritten. */
import {execFileSync} from 'node:child_process';
import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from 'marked';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const app=path.join(root,'app'), out=path.join(root,'_site');
const base=process.env.PAGES_BASE||'/keys-mobile-orbita/';
if(!/^\/[a-zA-Z0-9_/-]*\/$/.test(base))throw Error('PAGES_BASE must be an absolute directory path');
const repo='https://github.com/glazest-t/keys-mobile-orbita';
const appBase=base+'prototype/';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=p=>readFileSync(path.join(root,p),'utf8');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function write(name,body){const target=path.join(out,name);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,body);}
const url=p=>base+p.split('/').map(encodeURIComponent).join('/');
const sourceFile='проект в Клоде/project/Ключи - Все экраны.dc.html';
const nav=`<a class="identity" href="${base}"><img src="${base}design/assets/logo/mark-cobalt-ui.svg" alt=""/>ключи <small>проект</small></a><nav aria-label="Разделы проекта"><a href="${appBase}">Прототип</a><a href="${base}screens.html">Все экраны</a><a href="${base}docs/brand/index.html">Брендбук</a><a href="${base}documentation.html">Документация</a><a href="${repo}">GitHub ↗</a></nav>`;
function page(title,body){return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(title)} · Ключи</title><link rel="icon" href="${base}design/assets/logo/mark-cobalt-ui.svg"><link rel="stylesheet" href="${base}portal.css"></head><body><header>${nav}</header><main>${body}</main><footer>Ключи от всех отелей · Мобильный прототип<span>Данные сохраняются в этом браузере. Интеграции демонстрационные.</span></footer></body></html>`;}

execFileSync(process.execPath,['scripts/check-mobile-runtime.mjs'],{cwd:app,stdio:'inherit'});
execFileSync(path.join(app,'node_modules/.bin/tsc'),[],{cwd:app,stdio:'inherit'});
execFileSync(path.join(app,'node_modules/.bin/vite'),['build','--base',appBase],{cwd:app,stdio:'inherit'});
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
for(const name of ['docs','design','spec','prototype','проект в Клоде'])cpSync(path.join(root,name),path.join(out,name),{recursive:true,filter:p=>!['.DS_Store','__pycache__'].includes(path.basename(p))});
for(const name of ['README.md','AGENTS.md','design-qa.md'])cpSync(path.join(root,name),path.join(out,name));
cpSync(path.join(app,'dist/client'),path.join(out,'prototype'),{recursive:true});
// Legacy source references sometimes point to public files through the code directory.
cpSync(path.join(app,'public'),path.join(out,'app/public'),{recursive:true});
// Vite handles imported assets. These explicit public URLs also occur in JSON,
// inline SVG/CSS and raw HTML strings, including protected device chrome.
let relocated=0;
for(const file of walk(path.join(out,'prototype'))){
 if(!/\.(js|css|html|json)$/.test(file))continue;
 let text=readFileSync(file,'utf8');
 text=text.replace(/(["'`(])\/(brand|assets|hotels|design-previews)\//g,(_,prefix,dir)=>{relocated++;return prefix+appBase+dir+'/';});
 writeFileSync(file,text);
}
// Root-relative links in archival pages belong under this repository's site.
for(const file of walk(out)){
 if(!/\.(html|css|js)$/.test(file)||file.startsWith(path.join(out,'prototype')+path.sep))continue;
 let text=readFileSync(file,'utf8');
 text=text.replace(/http:\/\/(?:127\.0\.0\.1|localhost):5173\/?/g,appBase)
  .replace(/http:\/\/(?:127\.0\.0\.1|localhost):4173\/?/g,base)
  .replace(/(["'(])\/(проект в Клоде|design|docs|app)\//g,(_,prefix,dir)=>prefix+base+dir+'/');
 writeFileSync(file,text);
}
cpSync(path.join(root,'publish/portal.css'),path.join(out,'portal.css'));
write('.nojekyll','');

// Convert Markdown into navigable HTML; keep every original downloadable.
const markdown=walk(out).filter(p=>p.endsWith('.md'));
function documentLink(href,current){
 href=href.replace(/^http:\/\/(?:127\.0\.0\.1|localhost):5173\/?/,appBase).replace(/^http:\/\/(?:127\.0\.0\.1|localhost):4173\/?/,base);
 if(/^(?:https?:|mailto:|tel:|data:|#)/.test(href))return href;
 const [pathname,...fragment]=href.split('#');
 let decoded;try{decoded=decodeURIComponent(pathname);}catch{return href;}
 const resolved=decoded.startsWith(base)?path.join(out,decoded.slice(base.length)):decoded.startsWith(root+'/')?path.join(out,path.relative(root,decoded)):path.resolve(path.dirname(current),decoded);
 if(!resolved.startsWith(out+path.sep))return href;
 const relative=path.relative(out,resolved);
 const suffix=fragment.length?'#'+fragment.join('#'):'';
 if(existsSync(resolved))return url(relative.replace(/\.md$/,'.html'))+suffix;
 if(existsSync(path.join(root,relative)))return repo+'/blob/main/'+relative.split('/').map(encodeURIComponent).join('/')+suffix;
 return href;
}
for(const file of markdown){
 const text=readFileSync(file,'utf8'),relative=path.relative(out,file),title=(text.match(/^# (.+)$/m)||[])[1]||path.basename(file,'.md');
 const used=new Map();
 const content=marked.parse(text,{gfm:true}).replace(/<h([1-6])>(.*?)<\/h\1>/g,(_,depth,label)=>{
  const slug=label.replace(/<[^>]+>/g,'').toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').replace(/\s/g,'-');
  const count=used.get(slug)||0;used.set(slug,count+1);
  return `<h${depth} id="${escape(slug+(count?'-'+count:''))}">${label}</h${depth}>`;
 }).replace(/\b(href|src)="([^"]+)"/g,(_,key,href)=>`${key}="${escape(documentLink(href,file))}"`);
 write(relative.replace(/\.md$/,'.html'),page(title,`<div class="doc-top"><a href="${base}documentation.html">← Все документы</a><a href="${url(relative)}" download>Скачать Markdown</a></div><article class="document">${content}</article>`));
}
for(const file of walk(path.join(out,'docs/brand')).filter(p=>p.endsWith('.html'))){
 writeFileSync(file,readFileSync(file,'utf8').replace(/href="([^"#]+\.md(?:#[^"]*)?)"/g,(_,href)=>`href="${escape(documentLink(href,file))}"`));
}

const cards=[
 ['01','Мобильный прототип','Все сценарии входа, бронирования и проживания. iPhone и Pixel, живые переходы и сохранение данных.',appBase,'Открыть приложение'],
 ['02','Все экраны','117 исходных мобильных макетов и каталог из 99 функциональных описаний с актуальной матрицей реализации.',base+'screens.html','Смотреть экраны'],
 ['03','Брендбук и UI kit','Айдентика, токены, типографика, движение и компоненты из работающего приложения.',base+'docs/brand/index.html','Открыть брендбук'],
 ['04','Для разработки','Действующая логика, состояния компонентов, спецификации, источники и результаты проверок.',base+'documentation.html','Читать документы'],
];
write('index.html',page('Пространство проекта',`<section class="hero"><p class="eyebrow">МОБИЛЬНАЯ ВЕРСИЯ · ПРОЕКТ И МАТЕРИАЛЫ</p><h1>Ключи от<br/>всех отелей</h1><p class="lead">Приложение, экраны и документация — в одном месте.</p><div class="actions"><a class="primary" href="${appBase}">Смотреть прототип ↗</a><a class="secondary" href="${base}screens.html">Все экраны</a></div><div class="orbit" aria-hidden="true"><i></i><b></b></div></section><section class="cards">${cards.map(([n,title,copy,href,cta])=>`<a class="card" href="${href}"><span class="number">${n}</span><h2>${title}</h2><p>${copy}</p><strong>${cta} →</strong></a>`).join('')}</section><section class="guide"><div><p class="eyebrow">КАК ПОСМОТРЕТЬ</p><h2>Выберите сценарий<br/>в настройках демонстрации</h2></div><div><p>В приложении есть шесть вариантов входа и пять состояний поездки: без брони, до заезда, проживание, день выезда и завершённая поездка.</p><p>Код СМС: <b>123456</b> · PIN: <b>1234</b>. После входа станут доступны сценарии поездок, услуг, оплаты и уведомлений.</p><a href="${appBase}#kit">Открыть живой UI kit →</a></div></section>`));

const documents=[
 ['Начать здесь','docs/handoff/README.md','Единый комплект передачи и порядок чтения'],
 ['Логика мобильного приложения','docs/handoff/MOBILE-CONTRACT.md','Сценарии, переходы, роли и расчёты'],
 ['Компоненты и состояния','docs/handoff/COMPONENTS.md','Переиспользование, визуальные правила и анимация'],
 ['Матрица экранов','docs/iteration-7/MOBILE-MATRIX.md','99 функциональных описаний и соответствующий код'],
 ['Приёмка мобильной версии','docs/MOBILE-REVIEW.md','Что и в каком порядке проверять'],
 ['Открытые решения','docs/handoff/OPEN-QUESTIONS.md','Демонстрационные условия и будущие интеграции'],
 ['Проверка и доказательства','docs/iteration-9/qa-mobile-2026-10-30/REPORT.md','Отчёт, снимки и результаты тестов'],
 ['Дизайн-система','docs/DESIGN_SYSTEM.md','Цвет, типографика и визуальные источники'],
 ['Функциональная спецификация','docs/references/screens-flows-2026-10-21.md','Исходное описание экранов и переходов'],
 ['Источники и вложения','docs/references/README.md','DOCX, таблицы и исходные материалы'],
 ['План проекта','docs/ITERATIONS.md','Текущий статус и последующие этапы'],
 ['Журнал решений','docs/DECISIONS.md','Последние решения имеют приоритет над прежними'],
 ['Запуск и публикация','docs/DEPLOYMENT.md','Структура GitHub Pages и обновление сайта'],
];
write('documentation.html',page('Документация',`<p class="eyebrow">ДЛЯ РАЗРАБОТКИ</p><h1>Одна точка входа<br/>во все документы</h1><p class="lead">Начните с актуального контракта. Старые варианты и источники сохранены отдельно.</p><section class="doc-list">${documents.map(([title,file,description])=>`<a href="${url(file.replace(/\.md$/,'.html'))}"><div><h2>${title}</h2><p>${description}</p></div><span>↗</span></a>`).join('')}</section><details class="archive"><summary>Все документы проекта · ${markdown.length}</summary><input id="document-search" type="search" placeholder="Найти документ" aria-label="Найти документ"><ul id="documents">${markdown.map(f=>path.relative(out,f)).sort((a,b)=>a.localeCompare(b,'ru')).map(f=>`<li><a href="${url(f.replace(/\.md$/,'.html'))}">${escape(f)}</a></li>`).join('')}</ul></details><script>document.querySelector('#document-search').addEventListener('input',e=>{for(const row of document.querySelectorAll('#documents li'))row.hidden=!row.textContent.toLowerCase().includes(e.target.value.toLowerCase())})</script>`));

const routes=JSON.parse(read('spec/routes.json')).routes;
const matrix=read('docs/iteration-7/MOBILE-MATRIX.md');
const live={'A':'welcome','F':'find','H':'find','B':'find','T':'trips','S':'trips','L':'loyalty-programs','P':'profile','C':'chats','Q':'find','N':'notifications','J':'hotelier-invite','M':'trips','D':'trips','R':'rewards'};
const precise={A02:'phone',A05:'hotelier-invite',A08:'profile',F04:'results',F07:'swipe',F09:'price-watches',F10:'favorites',L01:'rewards',L02:'points'};
write('screens.html',page('Все экраны',`<p class="eyebrow">КАТАЛОГ И ВИЗУАЛЬНЫЕ ЭТАЛОНЫ</p><h1>Все экраны</h1><p class="lead">Актуальный интерфейс — в прототипе. Исходные макеты сохраняют первоначальный дизайн; поздние решения описаны в матрице.</p><div class="actions"><a class="primary" href="${appBase}">Открыть прототип ↗</a><a class="secondary" href="${url(sourceFile)}" target="_blank" rel="noopener">Макеты на весь экран ↗</a><a class="secondary" href="${base}docs/iteration-7/MOBILE-MATRIX.html">Матрица реализации</a></div><details class="source-view" open><summary>Исходные мобильные макеты · 117 экранов и состояний</summary><iframe title="Все исходные мобильные экраны" loading="lazy" src="${url(sourceFile)}"></iframe></details><section class="catalog"><div class="section-title"><h2>Функциональные экраны · ${routes.length}</h2><input id="screen-search" type="search" placeholder="Название или ID экрана" aria-label="Поиск экрана"></div><p>Кнопка открывает раздел сценария. Окна с данными брони доступны после входа и выбора поездки в настройках демонстрации.</p><div class="screen-grid">${routes.map(r=>{const line=matrix.split('\n').find(l=>l.startsWith('| '+r.id+' |'));const status=line?.split('|')[4]?.trim()||'Сверяйте с текущим контрактом';return `<article class="screen-card"><span class="number">${r.id} · ${escape(r.presentation)}</span><h3>${escape(r.title)}</h3><p>${escape(status.replace(/\*\*/g,''))}</p><small>Эталон: ${escape(r.mobile_refs.join(', ')||'нет мобильного макета')}</small><div><a href="${appBase}#${precise[r.id]||live[r.id[0]]||'trips'}">Открыть сценарий ↗</a>${r.mobile_refs[0]?`<a href="${url(sourceFile)}#${encodeURIComponent(r.mobile_refs[0])}" target="_blank" rel="noopener">Макет</a>`:''}</div></article>`;}).join('')}</div></section><script>document.querySelector('#screen-search').addEventListener('input',e=>{for(const card of document.querySelectorAll('.screen-card'))card.hidden=!card.textContent.toLowerCase().includes(e.target.value.toLowerCase())})</script>`));
write('404.html',page('Страница не найдена',`<h1>Эта страница<br/>не найдена</h1><p class="lead">Откройте проект и выберите нужный раздел.</p><a class="primary" href="${base}">К проекту</a>`));
console.log(`Pages ready: ${out}; base=${base}; ${markdown.length} documents, ${routes.length} screens; ${relocated} public URL relocations.`);
