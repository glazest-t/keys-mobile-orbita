const cards=[...document.querySelectorAll('[data-scene]')];
const search=document.querySelector('#screen-search'),group=document.querySelector('#screen-group');
const timers=new Map();
const load=card=>{const frame=card.querySelector('iframe');if(frame.getAttribute('src'))return;frame.loading="eager";frame.src=frame.dataset.src;card.dataset.loaded='true';};
const observer=new IntersectionObserver(entries=>{for(const {target:card,isIntersecting} of entries){clearTimeout(timers.get(card));if(isIntersecting&&!card.hidden)load(card);else timers.set(card,setTimeout(()=>{if(card.contains(document.activeElement))return;card.querySelector('iframe').removeAttribute('src');card.dataset.loaded='false';},1500));}},{rootMargin:'250px 0px'});
for(const card of cards)observer.observe(card);
function filter(){const query=search.value.toLocaleLowerCase('ru');let count=0;for(const card of cards){card.hidden=!!((group.value&&card.dataset.group!==group.value)||!card.dataset.search.includes(query));if(!card.hidden)count++;observer.unobserve(card);observer.observe(card);}document.querySelector('#screen-count').textContent=count;}
search.addEventListener('input',filter);group.addEventListener('change',filter);
for(const b of document.querySelectorAll('[data-reset-preview]'))b.addEventListener('click',()=>{const f=b.closest('[data-scene]').querySelector('iframe');f.src=f.dataset.src;});
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='keys-catalogue')return;const card=cards.find(c=>c.dataset.scene===event.data.id);if(!card||card.querySelector('iframe').contentWindow!==event.source)return;card.dataset.status=event.data.status;const status=card.querySelector('.preview-status');status.textContent=event.data.status==='error'?'Не удалось открыть состояние: '+event.data.detail:'';});
// Optional visible self-check for maintainers. Each recipe runs in the real app.
if(new URLSearchParams(location.search).has('verify')){
 const savedKeys=['keys-orbita-demo-v1','keys-orbita-booking-v1'];
 const readSaved=()=>{try{return JSON.stringify(savedKeys.map(key=>localStorage.getItem(key)));}catch{return null;}};
 const savedBefore=readSaved();
 observer.disconnect();const report=document.createElement('pre');report.id='catalogue-verification';document.querySelector('.catalogue-tools').after(report);
 let index=0,passed=0,failed=[],deadline;const start=()=>{if(index>=cards.length){report.textContent=`Проверка завершена: ${passed}/${cards.length}. Ошибки: ${JSON.stringify(failed)}. Данные прототипа: ${savedBefore===null?'проверка недоступна':readSaved()===savedBefore?'не изменены':'ИЗМЕНЕНЫ'}`;return;}const card=cards[index];card.hidden=false;load(card);report.textContent=`Проверка ${index+1}/${cards.length}: ${card.dataset.scene}\nГотово: ${passed}. Ошибки: ${JSON.stringify(failed)}`;deadline=setTimeout(()=>finish('timeout'),18000);};
 const finish=status=>{clearTimeout(deadline);const card=cards[index];if(status==='ready')passed++;else failed.push(card.dataset.scene+': '+status);card.querySelector('iframe').removeAttribute('src');index++;start();};
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='keys-catalogue'&&e.data.id===cards[index]?.dataset.scene&&e.source===cards[index]?.querySelector('iframe').contentWindow)finish(e.data.status==='ready'?'ready':e.data.detail);});start();
}
const requested=new URLSearchParams(location.search).get('group');if(requested){group.value=requested;filter();}
