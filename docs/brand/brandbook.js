const notes={
 f1:['Кобальтовый блок поиска','Светлый фон, знак в шапке, крупный заголовок и единый блок поиска. Подбор по пожеланиям и свайпы остаются отдельными карточками.'],
 h1:['Фотография и спокойная детализация','Крупное фото, карточки номера, компактные факты и закреплённое действие. Новые данные подставляются без перестройки визуальной иерархии.'],
 s2:['Проживание — вокруг номера и ключа','Кобальтовая карточка, номер, прогресс ночей и белая кнопка ключа. Этот экран доступен после заселения; до заезда ключа нет.'],
 v1:['Выгоды с раздельными балансами','Сохраняем кобальтово-фиолетовую карту и светлые градиенты. Старые проценты начислений остаются иллюстрацией, а не утверждённым правилом.'],
 fr4:['Friendly Rate — самостоятельный тариф','Зелёная карточка из исходника. Закрытый тариф показываем подтверждённому отельеру, сохраняя возможность выбрать обычный.'],
 h7:['Оплата: тот же дизайн, согласованные цифры','Белые блоки, компактная сводка и закреплённое действие. Итог вычисляется общей логикой; тумблер баллов покрывает до 100% проживания и услуг.'],
 a1:['Вход в той же айдентике','Мягкий свет, компактный логотип и ясная форма. Лишняя синяя рамка поля убрана по замечанию пользователя. SMS в демонстрации заменены тестовым кодом.'],
 t1:['Поездки без брони','Сохраняем спокойную композицию и понятный переход к поиску. Это исходный визуальный образец, а не новый стартовый сценарий.']
};
const picker=document.querySelector('#screen-picker'), frame=document.querySelector('#reference-frame');
picker.addEventListener('change',()=>{const id=picker.value;frame.src=`reference/${id}.html`;frame.title=`Исходный экран ${picker.selectedOptions[0].text}`;document.querySelector('#reference-title').textContent=notes[id][0];document.querySelector('#reference-note').textContent=notes[id][1];document.querySelector('#reference-link').href=frame.src;});
function fitFrame(){const parent=frame.parentElement;const scale=Math.min(1,parent.clientWidth/395);frame.style.width='395px';frame.style.height=`${parent.clientHeight/scale}px`;frame.style.transform=`scale(${scale})`;}
new ResizeObserver(fitFrame).observe(frame.parentElement);
const tokensReady=fetch('../../design/tokens.json').then(r=>{if(!r.ok)throw Error('tokens');return r.json();}).then(data=>{
 const palette=[['Кобальт',data.primitive.color.brand.cobalt],['Перламутр',data.primitive.color.neutral.pearl],['Карточка',data.primitive.color.neutral.white],['Основной текст',data.primitive.color.neutral.ink],['Вторичный текст',data.primitive.color.neutral.slate],['Линии',data.primitive.color.neutral.line]];
 for(const [label,color] of palette){const item=document.createElement('article');item.className='swatch';const block=document.createElement('div');block.style.background=color;const p=document.createElement('p');const name=document.createElement('strong');name.textContent=label;const code=document.createElement('code');code.textContent=color;p.append(name,code);item.append(block,p);document.querySelector('#color-grid').append(item);}
 for(const [name,t] of Object.entries(data.primitive.type)){const row=document.createElement('tr');for(const value of [name,`${t.family==='display'?'Unbounded':'Onest'} ${t.weight}`,`${t.size} / ${t.line}`,'Ключи · 12 450 ₽']){const td=document.createElement('td');td.textContent=value;row.append(td);}row.lastChild.style.fontFamily=t.family==='display'?'Unbounded':'Onest';row.lastChild.style.fontWeight=t.weight;document.querySelector('#type-table').append(row);}
}).catch(()=>{document.querySelector('#color-grid').textContent='Для просмотра токенов откройте брендбук через локальный сервер. JSON доступен в разделе материалов.';});
for(const [name,label] of [['nav-trips','Поездки'],['nav-search','Найти'],['nav-chats','Чаты'],['nav-rewards','Выгоды'],['key','Ключ'],['calendar','Даты'],['guests','Гости'],['heart','Избранное'],['wifi','Wi-Fi'],['breakfast','Завтрак'],['room-service','В номер'],['route','Маршрут'],['bill','Счёт'],['document','Документы'],['bell','Уведомления'],['support','Помощь']].filter(x=>x[0]!=='support')){const item=document.createElement('div');item.className='icon-item';const image=document.createElement('img');image.src=`../../design/assets/icons/${name}.svg`;image.alt='';const text=document.createElement('span');text.textContent=label;item.append(image,text);document.querySelector('#icon-grid').append(item);}

const motionReady=fetch('motion.json').then(r=>r.json()).then(data=>{for(const values of data.events){const row=document.createElement('tr');for(const value of values){const td=document.createElement('td');td.textContent=value;row.append(td);}document.querySelector('#motion-table').append(row);}for(const [name,curve] of Object.entries(data.curves)){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=name;p.append(strong,document.createElement('br'),document.createTextNode(curve));document.querySelector('#motion-curves').append(p);}}).catch(()=>{document.querySelector('#motion-table').textContent='Каталог движения недоступен. Откройте motion.json из папки брендбука.';});

// JSON tables and fonts change section offsets after initial anchor navigation.
const initialHash=location.hash;
let userMoved=false;
for(const event of ['pointerdown','wheel','touchstart'])addEventListener(event,()=>{userMoved=true;},{once:true,passive:true});
Promise.allSettled([tokensReady,motionReady]).then(async()=>{
 await document.fonts.ready;
 if(initialHash&&location.hash===initialHash&&!userMoved)document.getElementById(decodeURIComponent(initialHash.slice(1)))?.scrollIntoView({block:'start',behavior:'instant'});
});
