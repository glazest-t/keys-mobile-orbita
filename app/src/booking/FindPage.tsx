import {entryEditorialText} from '../entryEditorialText.ts';
import {isDesktop} from '../desktop/surface';
import {DesktopSearchBar} from '../desktop/DesktopSearchBar';
import {useNovember} from '../usePrototypeVariant';
import {Carousel} from '../mobile';
import {Button,Icon} from '../ui';
import {catalog,dateLabel,guestLabel,hotelPhoto,type Commerce,type Search} from './model';
import {guestCountLabel,tripFeaturesLabel} from './search';
import swipeArt from './art/swipe.html?raw';
export function compactDates(s:Search){const a=new Date(s.checkIn+'T12:00:00'),b=new Date(s.checkOut+'T12:00:00');return a.getMonth()===b.getMonth()?`${a.getDate()}–${b.toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','')}`:dateLabel(s);}
export function FindPage({commerce,onEdit,onSearch,onOpen,onSwipe,onCollection}:{commerce:Commerce;onEdit:(s:string)=>void;onSearch:(s?:Search,hotelId?:string)=>void;onOpen:(id:string)=>void;onSwipe:()=>void;onCollection:(kind:string)=>void}){
 const november=useNovember();
 const history=commerce.recentSearches||[];
 return <div className="find-page"><h1>{entryEditorialText('ДОП-016','Куда поедем?','Куда едем')}</h1><section className="find-search-card"><div className="find-search-heading"><span>{entryEditorialText("ДОП-017", "Лучшие цены напрямую от отелей", "Лучшие цены без комиссий")}</span></div>{isDesktop?<DesktopSearchBar commerce={commerce} onSearch={onSearch}/>:<><div className="find-search-fields"><button onClick={()=>onEdit('city')}><Icon name="nav-search" size={20} inheritColor/><span><small>{entryEditorialText("ДОП-018", "Куда", "Город или направление")}</small><strong>{commerce.search.city||'город или название отеля'}</strong></span></button><div><button onClick={()=>onEdit('dates')}><Icon name="calendar" size={20} inheritColor/><span><small>Даты</small><strong>{compactDates(commerce.search)}</strong></span></button><button onClick={()=>onEdit('guests')}><Icon name="guests" size={20} inheritColor/><span><small>Гости</small><strong>{commerce.search.childrenAges.length?guestCountLabel(commerce.search):`${commerce.search.adults} ${commerce.search.adults===1?'взрослый':'взрослых'}`}</strong></span></button></div></div><Button onClick={()=>onSearch()}><Icon name="nav-search" size={20} inheritColor/>Найти</Button></>}</section>

 {history.length>0&&<section className="find-section"><h2>Недавние поиски</h2><Carousel ariaLabel="Недавние поиски" contentClassName="recent-search-track">{history.map((s,i)=><button key={i} onClick={()=>onSearch(s)}><strong>{s.city}<Icon name="chevron-right" size={16}/></strong><small>{compactDates(s)} · {guestCountLabel(s)}{tripFeaturesLabel(s)&&' · '+tripFeaturesLabel(s)}</small></button>)}</Carousel></section>}
 {!november&&<><button type="button" className="find-swipe" onClick={onSwipe} aria-label="Подбор по свайпу"><div><small>Ищете вдохновение?</small><h2>Подбор по свайпу</h2><p>Смахивайте отели — запомним, что нравится</p><span className="k-button primary" aria-hidden="true">Начать<Icon name="chevron-right" size={16}/></span></div><div className="find-source-art" aria-hidden="true" dangerouslySetInnerHTML={{__html:swipeArt}}/></button>
 <button type="button" className="find-hot-deals" onClick={()=>onCollection('discount')} aria-label="Горячие скидки: от 10% на проживание — смотреть отели"><span className="find-deals-copy"><strong>Горячие<br/>скидки</strong><small>От 10% на проживание</small><span className="find-deals-action">Смотреть отели</span></span><img className="find-deals-ticket" src="/brand/illustrations/hot-deals-ticket.png" alt="" width="140" height="108" draggable={false}/></button></>}
 {!!commerce.viewedHotels?.length&&<section className="find-section"><h2>Вы недавно смотрели</h2><Carousel ariaLabel="Просмотренные отели" contentClassName="viewed-hotels">{commerce.viewedHotels.map(id=>catalog.hotels.find(h=>h.id===id)).filter(h=>!!h).map(h=><button key={h.id} onClick={()=>onOpen(h.id)}><img src={hotelPhoto(h.id)} alt=""/><strong>{h.name}</strong><small>{h.city}</small></button>)}</Carousel></section>}
 </div>;
}
