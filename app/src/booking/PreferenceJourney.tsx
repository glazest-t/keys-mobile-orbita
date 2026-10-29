import {FriendlyRateBadge} from '../hotelier/FriendlyRateBadge';
import {ratePrice} from './friendlyRate';
import {PreferenceIdeas,PreferenceWish} from './PreferenceDiscovery';
import {selectedPreferenceIds,togglePreferenceInterest} from './preferenceIdeas';
import {createPortal} from 'react-dom';
import {ExpandingMap} from '../interactions';
import {ExpandedResultsMap} from './ResultsMap';
import {useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,KeyboardInput,useKeyboard} from '../mobile';
import {Button,Empty,Icon,IconButton} from '../ui';
import {type Commerce,dateLabel,formatMoney} from './model';
import {DatePicker,GuestPicker} from './SearchControls';
import {guestCountLabel,popularCities} from './search';
import {HotelCardPhotos} from './HotelCardPhotos';
import {SourceMap,SavedButton,toggleSaved} from './Discovery';
import {hotelVisual} from './presentation';
import {interests,parties,themes,preferenceError,preferenceOffers,preferenceSearchCommerce,type PreferenceDraft} from './preferences';
import {SearchFilterRail} from './SearchFilterRail';
import {searchOptions} from './filterSchema';
import './preferences.css';
const hotelWord=(n:number)=>n%100>=11&&n%100<=14?'отелей':n%10===1?'отель':n%10>=2&&n%10<=4?'отеля':'отелей';
const art=(name:string)=>'/brand/ideas/'+name+'.webp';
type Props={draft:PreferenceDraft;onChange:(d:PreferenceDraft)=>void;commerce:Commerce;owner:string;setCommerce:Dispatch<SetStateAction<Commerce>>;onOpen:(id:string)=>void};
export function PreferenceHeader({draft:d,onChange,onClose,textReturnLabel='Назад к поиску'}:{draft:PreferenceDraft;onChange:(d:PreferenceDraft)=>void;onClose:()=>void;textReturnLabel?:string}){
 const topic=themes.find(t=>t.id===d.topic)!;
 const back=()=>d.source==='text'?(d.stage==='direction'?onClose():onChange({...d,stage:'direction'})):d.stage==='direction'?onClose():onChange({...d,stage:d.stage==='topic'?'themes':d.stage==='results'?'themes':'direction'});
 return <header className="app-header preference-header"><IconButton name="back" label={d.stage==='direction'?(d.source==='text'?textReturnLabel:'Назад к поездкам'):'Назад к пожеланиям'} onClick={back}/><span>{d.source==='text'?'Поиск по пожеланию':d.stage==='direction'?'Шаг 1 из 2':d.stage==='results'?'Подбор':d.stage==='topic'?topic.title:'Идеи отдыха'}</span><IconButton name="close" label="Закрыть подбор" onClick={onClose}/></header>;
}
export function PreferenceContent({draft:d,onChange,commerce,owner,setCommerce,onOpen}:Props){
 const keyboard=useKeyboard();
 const mapRef=useRef<HTMLDivElement>(null);
 const [mapOpen,setMapOpen]=useState(false),[mapHotel,setMapHotel]=useState(''),[mapOrigin,setMapOrigin]=useState('inset(25% 16px 50% 16px round 22px)');
 const mapHost=mapRef.current?.closest<HTMLElement>('.keys-app');
 const openMap=(id?:string)=>{keyboard.hide();const mini=mapRef.current,host=mini?.closest<HTMLElement>('.keys-app');if(mini&&host){const a=host.getBoundingClientRect(),b=mini.getBoundingClientRect(),scale=a.width/host.clientWidth;setMapOrigin(`inset(${(b.top-a.top)/scale}px ${(a.right-b.right)/scale}px ${(a.bottom-b.bottom)/scale}px ${(b.left-a.left)/scale}px round 22px)`);}setMapHotel(id||'');setMapOpen(true);};
 const [sheet,setSheet]=useState<'dates'|'guests'|'budget'|'sort'|'wish'|null>(null);
 const patch=(value:Partial<PreferenceDraft>)=>onChange({...d,...value});
 const offers=preferenceOffers(commerce,owner,d),topic=themes.find(t=>t.id===d.topic)!;
 const selected=interests.filter(i=>selectedPreferenceIds(d).includes(i.id));
 const resultCommerce=preferenceSearchCommerce(commerce,d);
 const updateFilters:Dispatch<SetStateAction<Commerce>>=action=>{const next=typeof action==='function'?action(resultCommerce):action;patch({budgetMinor:null,resultFilters:searchOptions(next)});};
 const toggle=(id:string)=>onChange(togglePreferenceInterest(d,id));
 const cities=popularCities.filter(city=>city.toLocaleLowerCase('ru').includes(d.cityQuery.trim().toLocaleLowerCase('ru')));
 return <div className={"preference-journey "+(d.source==='text'&&d.stage==='results'?'text-search-results':'')}>
 {d.stage==='themes'&&<div className="preference-segments" role="group" aria-label="Способ выбора интересов">{(['ideas','themes'] as const).map(mode=><button key={mode} aria-pressed={(d.discoveryMode||'themes')===mode} onClick={()=>patch({discoveryMode:mode})}>{mode==='ideas'?'Идеи':'Темы'}</button>)}</div>}
 {d.stage==='direction'?<>
  <div className="preference-intro"><h1>Куда и с кем?</h1><p>Так идеи будут точнее.</p></div>
  <section><h2>Куда?</h2><div className="preference-segments" role="group" aria-label="Направление">{(['any','city'] as const).map(mode=><button key={mode} aria-pressed={d.mode===mode} onClick={()=>patch({mode})}>{mode==='any'?'Куда угодно':'В конкретный город'}</button>)}</div>
  {d.mode==='city'&&<div className="preference-city"><KeyboardInput aria-label="Город для подбора" placeholder="Введите город" value={d.cityQuery} onChange={e=>patch({cityQuery:e.target.value,city:''})}/>{(!d.city||d.cityQuery!==d.city)&&<div className="preference-city-options">{cities.map(city=><button key={city} aria-pressed={d.city===city} onClick={()=>{keyboard.hide();patch({city,cityQuery:city});}}><Icon name="pin" size={18}/><span>{city}</span>{d.city===city&&<Icon name="check" size={16} inheritColor/>}</button>)}{!cities.length&&<p>Такой город пока не найден. Выберите «Куда угодно» или измените запрос.</p>}</div>}</div>}
  </section>
  <section><h2>С кем едете?</h2><div className="preference-party" role="group" aria-label="Компания">{parties.map(p=><button key={p.id} aria-pressed={d.party===p.id} onClick={()=>patch({party:p.id})}><img src={art(p.art)} alt=""/><span>{p.title}</span>{d.party===p.id&&<i><Icon name="check" size={12} inheritColor/></i>}</button>)}</div></section>
 </>:d.stage==='themes'&&d.discoveryMode==='ideas'?<PreferenceIdeas draft={d} onChange={onChange}/>:d.stage==='themes'?<>
  <h1>Что вам интересно?</h1>
  <div className="preference-themes">{themes.map(t=><button key={t.id} onClick={()=>patch({topic:t.id,stage:'topic'})}><img src={art('covers/'+t.cover)} alt=""/><span>{t.title}{t.items.some(id=>selectedPreferenceIds(d).includes(id))&&<b>{t.items.filter(id=>selectedPreferenceIds(d).includes(id)).length}</b>}</span></button>)}</div>
  {selected.length>0&&<div className="preference-chips" aria-label="Выбранные пожелания">{selected.map(i=><button key={i.id} aria-label={'Убрать пожелание: '+i.title} onClick={()=>toggle(i.id)}>{i.title}<Icon name="close" size={12} inheritColor/></button>)}</div>}
 </>:d.stage==='topic'?<>
  <div className="preference-intro"><h1>{topic.title}</h1><p>Выберите всё, что нравится.</p></div>
  <div className="preference-interests">{topic.items.map(id=>interests.find(i=>i.id===id)!).map(i=><button key={i.id} aria-pressed={selectedPreferenceIds(d).includes(i.id)} onClick={()=>toggle(i.id)}><img src={art(i.art)} alt=""/><span>{i.title}</span><i>{selectedPreferenceIds(d).includes(i.id)&&<Icon name="check" size={14} inheritColor/>}</i></button>)}</div>
 </>:<>
  {d.source!=='text'&&<div className="preference-intro"><h1>{offers.length?`${offers.length} ${hotelWord(offers.length)} ${d.source==='text'&&!selected.length?'по условиям поиска':'по вашим пожеланиям'}`:'Пока нет подходящих отелей'}</h1></div>}
  <div className="preference-chips" aria-label="Ключевые пожелания">{d.source!=='text'&&<button onClick={()=>patch({stage:'direction'})}>{d.mode==='any'?'Куда угодно':d.city}<Icon name="edit" size={14} inheritColor/></button>}{selected.map(i=><button key={i.id} aria-label={'Убрать пожелание: '+i.title} onClick={()=>toggle(i.id)}>{i.title}<Icon name="close" size={12} inheritColor/></button>)}{d.source!=='text'&&<button onClick={()=>patch({stage:'themes'})}>+ Добавить</button>}</div>
 </>}
 {d.source==='text'&&d.stage==='results'?<SearchFilterRail commerce={resultCommerce} setCommerce={updateFilters} owner={owner} getResultCount={candidate=>preferenceOffers(candidate,owner,{...d,budgetMinor:null,resultFilters:searchOptions(candidate)}).length}/>:<div className="preference-settings">
  <button onClick={()=>setSheet('dates')}><Icon name="calendar" size={18}/><span>{dateLabel(d.search)}</span><Icon name="chevron-down" size={14}/></button>
  <button onClick={()=>setSheet('guests')}><Icon name="guests" size={18}/><span>{guestCountLabel(d.search)}</span><Icon name="chevron-down" size={14}/></button>
  {d.stage!=='direction'&&<button onClick={()=>setSheet('budget')}><Icon name="wallet" size={18}/><span>{d.budgetMinor?`До ${formatMoney(d.budgetMinor)} за ночь`:'Бюджет за ночь'}</span><Icon name="chevron-down" size={14}/></button>}
  {d.stage!=='direction'&&<button onClick={()=>setSheet('wish')}><Icon name="edit" size={18}/><span>{d.wishAppliedText?'Ваше пожелание':'Описать свой отдых'}</span><Icon name="chevron-down" size={14}/></button>}
  {d.stage==='results'&&<button onClick={()=>setSheet('sort')}><Icon name="filter" size={18}/><span>{d.sort==='match'?'По совпадениям':d.sort==='price'?'Сначала дешевле':'По оценке гостей'}</span><Icon name="chevron-down" size={14}/></button>}
 </div>}
 {preferenceError(d)&&d.stage!=='direction'&&<p className="field-error" role="alert">{preferenceError(d)}</p>}
 {d.source==='text'&&d.stage==='results'&&offers.length>0&&<div ref={mapRef}><SourceMap items={offers.map(({h,q})=>({id:h.id,price:q.cashDueMinor}))} onSelect={openMap} onExpand={()=>openMap()}/></div>}
 {mapHost&&createPortal(<ExpandingMap open={mapOpen} origin={mapOrigin}><ExpandedResultsMap commerce={resultCommerce} setCommerce={updateFilters} owner={owner} selected={mapHotel} onSelect={setMapHotel} onOpen={id=>{setMapOpen(false);onOpen(id);}} onClose={()=>setMapOpen(false)} onEdit={()=>{setMapOpen(false);patch({stage:'direction'});}} getOffers={candidate=>preferenceOffers(candidate,owner,{...d,budgetMinor:null,resultFilters:searchOptions(candidate)})}/></ExpandingMap>,mapHost)}
 {d.stage==='results'&&<div className="preference-results">{offers.map(({h,q,matched,total,missing})=>{const v=hotelVisual(h.id);return <article className="hotel-list-card preference-hotel" key={h.id}><div className="discovery-photo"><HotelCardPhotos name={h.name} photos={v.photos} onOpen={()=>onOpen(h.id)}/><SavedButton hotelId={h.id} saved={!!commerce.savedHotels?.[owner]?.includes(h.id)} onClick={()=>setCommerce(s=>toggleSaved(s,owner,h.id))}/></div><button className="hotel-list-card-info" onClick={()=>onOpen(h.id)}><h2>{h.name}</h2><div className="discovery-price"><strong>{formatMoney(q.cashDueMinor)}</strong>{q.rateKind==='friendly_rate'&&<FriendlyRateBadge percent={ratePrice(q).percent}/>}</div><p><Icon name="pin" size={14}/>{h.city} · {v.distance}</p><div className="discovery-rating"><b>{v.rating.toLocaleString('ru-RU')}</b><span>{v.reviews} отзывов</span></div></button>{total>0&&<details className="preference-match"><summary><span><strong>Почему подходит вам</strong></span><b>{Math.round(matched.length/total*100)}%</b><Icon name="chevron-down" size={16}/></summary><ul>{matched.map(i=><li key={i.id}><Icon name="check" size={15} inheritColor/>{i.text}</li>)}</ul>{missing.length>0&&<p>Не найдено в описании: {missing.join(', ').toLocaleLowerCase('ru')}.</p>}</details>}</article>;})}{!offers.length&&<Empty icon="nav-search" title="Попробуем другие условия" action={<><Button onClick={()=>patch({stage:'direction'})}>Сменить направление</Button>{d.source==='text'&&d.resultFilters&&<Button variant="secondary" onClick={()=>patch({resultFilters:undefined,budgetMinor:null})}>Сбросить фильтры</Button>}{d.budgetMinor!==null&&<Button variant="secondary" onClick={()=>patch({budgetMinor:null})}>Без ограничения бюджета</Button>}</>}>Измените даты, город или бюджет.</Empty>}</div>}
 <BottomSheet open={sheet!==null} onOpenChange={v=>{if(!v)setSheet(null);}} title={sheet==='dates'?'Даты поездки':sheet==='guests'?'Кто едет':sheet==='sort'?'Сортировка':sheet==='wish'?'Опишите свой отдых':'Сколько за ночь?'} snap={sheet==='dates'?.88:sheet==='wish'?(keyboard.visible?.65:.86):.65}>
 {sheet==='wish'?<PreferenceWish draft={d} onChange={onChange} onClose={()=>setSheet(null)}/>:sheet==='dates'?<DatePicker value={d.search} onSave={search=>{patch({search});setSheet(null);}}/>:sheet==='guests'?<GuestPicker value={d.search} onSave={search=>{patch({search});setSheet(null);}}/>:sheet==='budget'?<div className="results-sort-panel">{[1000000,2000000,3500000,null].map(v=><button className="results-sort-option" key={v||'any'} aria-pressed={d.budgetMinor===v} onClick={()=>{patch({budgetMinor:v});setSheet(null);}}><span>{v?`До ${formatMoney(v)}`:'Неважно'}</span><span className="results-sort-check">{v===d.budgetMinor&&<Icon name="check" size={14} inheritColor/>}</span></button>)}</div>:<div className="results-sort-panel">{(['match','price','rating'] as const).map(sort=><button className="results-sort-option" key={sort} aria-pressed={d.sort===sort} onClick={()=>{patch({sort});setSheet(null);}}><span>{sort==='match'?'По совпадениям':sort==='price'?'Сначала дешевле':'По оценке гостей'}</span><span className="results-sort-check">{sort===d.sort&&<Icon name="check" size={14} inheritColor/>}</span></button>)}</div>}
 </BottomSheet>
 </div>;
}
export function PreferenceFooter({draft:d,onChange,commerce,owner}:{draft:PreferenceDraft;onChange:(d:PreferenceDraft)=>void;commerce:Commerce;owner:string}){
 const error=preferenceError(d),offers=preferenceOffers(commerce,owner,d),selected=interests.filter(i=>selectedPreferenceIds(d).includes(i.id));
 if(d.stage==='results')return null;
 return <div className={'preference-footer '+(d.stage==='direction'?'preference-footer-start':'')}>
 {d.stage==='direction'?<><Button disabled={!!error} onClick={()=>onChange({...d,stage:'themes'})}>Дальше<Icon name="chevron-right" size={18} inheritColor/></Button>{error&&d.party&&<small>{error}</small>}</>:<button className="preference-orbit-cta" disabled={!!error} onClick={()=>onChange({...d,stage:'results'})}><span className="preference-orbit" aria-hidden="true"><b>{offers.length}</b>{selected.slice(0,3).map(i=><img key={i.id} src={art(i.art)} alt=""/>)}</span><span><strong>{offers.length} {hotelWord(offers.length)} под вас</strong><small>{selected.length?selected.map(i=>i.title).join(' · '):'Выберите то, что нравится'}</small></span><span className="preference-go"><Icon name="chevron-right" size={20} inheritColor/></span></button>}
 </div>;
}
