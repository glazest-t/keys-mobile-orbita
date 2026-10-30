const examples={
 find:['Найти','Единый блок поиска, горячие скидки, история и персональный подбор.','find'],
 'booking-hotel':['Об отеле','Фото, предпочтения, цена для вас и отдельная детализация цены.','booking-flow'],
 'trip-staying':['Проживание','Ключ по одному нажатию: ожидание, успех и восстановление. До заселения ключ скрыт.','trips'],
 rewards:['Выгоды','Баллы Ключей и программы отелей — отдельные системы.','rewards'],
 'friendly-rooms':['Friendly Rate','Тариф доступен только подтверждённому отельеру. Обычные тарифы остаются.','booking-flow'],
 'booking-checkout':['Подтверждение и оплата','Лояльность над способами оплаты. СБП по умолчанию; остальные способы горизонтальными карточками.','booking-flow'],
 phone:['Вход','Телефон с маской, нейтральный фокус без синего свечения.','phone'],
 'trip-empty':['Нет брони','Иллюстрация выбранного варианта и баннер двойной выгоды.','trips'],
 'program-forest':['Уровни отеля','Текущий уровень: белая карточка, кобальтовый акцент слева, зелёный статус и таймлайн.','loyalty-program/orbit-forest'],
 profile:['Профиль','Разделы сгруппированы по смыслу. Баллы, путешественники, предпочтения и настройки.','profile'],
 chats:['Чаты','Приоритет текущего проживания, фотографии отелей, компактный вход в AI-подбор.','chats'],
 kit:['Живой UI kit','Кнопки, поля, статусы, строки, плитки, уровни и переходы из текущего приложения.','kit']
};
const picker=document.querySelector('#screen-picker'),frame=document.querySelector('#reference-frame');
const appUrl=frame.src.split('?')[0];
picker.addEventListener('change',()=>{const id=picker.value,[title,note,route]=examples[id];frame.src=appUrl+'?catalogue='+id+'#'+route;frame.title='Текущий экран: '+title;document.querySelector('#reference-title').textContent=title;document.querySelector('#reference-note').textContent=note;document.querySelector('#reference-link').href=frame.src;});
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
