import {DialogActions} from '../dialogActions';
import {HotelMap} from '../maps/HotelMap';
import {RatingBadge} from './RatingBadge';
import {isDesktop} from '../desktop/surface';
import {DesktopFilters} from './Filters';
import {SearchFilterRail} from './SearchFilterRail';
import {FriendlyRateBadge} from '../hotelier/FriendlyRateBadge';
import {ratePrice} from './friendlyRate';
import {useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {Button,Empty,Icon} from '../ui';
import {type Commerce,formatMoney} from './model';
import {clearFilters} from './Filters';
import {useSearchResults} from './useSearchResults';
import {SearchResultsLoading,SearchMapLoading} from './SearchResultsLoading';
import {HotelCardPhotos} from './HotelCardPhotos';
import {hotelVisual} from './presentation';
export {toggleFavorite as toggleSaved} from './FavoriteSaving';
import {toggleFavorite as toggleSaved,useFavoriteSaving} from './FavoriteSaving';
export function SavedButton({saved,onClick,hotelId}:{saved:boolean;onClick:()=>void;hotelId?:string}){const save=useFavoriteSaving();return <button className={'save-hotel '+(saved?'is-saved':'')} aria-label={saved?'Удалить из избранного':'Сохранить отель'} aria-pressed={saved} onClick={()=>hotelId&&save?save.toggle(hotelId):onClick()}><svg className="saved-heart" width="18" height="18" viewBox="0 0 24 24" fill={saved?'currentColor':'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>;}
export function SourceMap({items,onSelect,expanded=false,onExpand,selected,onHover,onPreviewDismiss,onVisibleChange,preview}:{items:{id:string;price:number;discountPercent?:number}[];onSelect:(id:string)=>void;expanded?:boolean;onExpand?:()=>void;selected?:string;onHover?:(id:string)=>void;onPreviewDismiss?:()=>void;onVisibleChange?:(ids:string[])=>void;preview?:ReactNode}){
 return <div className={'source-map '+(expanded?'expanded':'')} aria-label="Карта отелей"><HotelMap items={items} selected={selected} onSelect={onSelect} onHover={onHover} onPreviewDismiss={onPreviewDismiss} onVisibleChange={onVisibleChange} preview={preview} interactive={expanded||isDesktop}/>{onExpand&&<button className="map-expand" onClick={onExpand}><Icon name="map" size={16}/>{expanded?'Списком':'Развернуть карту'}</button>}</div>;
}
export function DiscoveryResults({commerce,setCommerce,owner,onOpen,onEdit,onMap,searchHeader}:{searchHeader?:ReactNode;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;onOpen:(id:string)=>void;onEdit:(s:string)=>void;onMap:(id?:string)=>void}){
 const filters=commerce.searchFilters||[];
 const {hotels,loading,error,retry}=useSearchResults(commerce,owner);
 const searchKey=JSON.stringify([commerce.search,hotels.map(({h,q})=>[h.id,q.cashDueMinor])]);
 const [view,setView]=useState<{key:string;ids:string[]}|null>(null);
 const [focus,setFocus]=useState<{key:string;id:string}|null>(null);
 const [resetViewKey,setResetViewKey]=useState(0);
 const visibleIds=isDesktop&&view?.key===searchKey?view.ids:null;
 const visibleHotels=visibleIds?hotels.filter(({h})=>visibleIds.includes(h.id)):hotels;
 const focused=isDesktop&&focus?.key===searchKey?visibleHotels.find(({h})=>h.id===focus.id):undefined;
 const shown=visibleHotels;
 const selectHotel=(id:string)=>setFocus({key:searchKey,id});
 const resetMap=()=>{setView(null);setFocus(null);setResetViewKey(v=>v+1);};
 const banner=<>{(commerce.collection||commerce.maxNightly||filters.some(f=>['У моря','Тихое место','В центре'].includes(f)))&&<div className="collection-banner"><span>{commerce.collection==='friendly'?'Отели с Friendly Rate':commerce.collection==='discount'?'Горячие скидки · от 10%':commerce.collection==='weekend'?'На пару дней':commerce.collection==='anywhere'?'Куда угодно':'По вашим пожеланиям'}{commerce.maxNightly?` · до ${commerce.maxNightly.toLocaleString('ru-RU')} ₽ за ночь`:null}</span><button onClick={()=>{setCommerce(clearFilters);}}>Сбросить</button></div>}</>;
 const preview=focused&&<div className="desktop-map-preview"><button className="desktop-map-preview-open" onClick={()=>onOpen(focused.h.id)} aria-label={`Открыть отель ${focused.h.name}`}><img src={hotelVisual(focused.h.id).photos[0]} alt=""/><span><strong>{focused.h.name}</strong><span className="desktop-map-preview-rating"><RatingBadge value={hotelVisual(focused.h.id).rating}/><small>{hotelVisual(focused.h.id).reviews} отзывов</small></span><span className="desktop-map-preview-price"><b>{formatMoney(focused.q.cashDueMinor)}</b>{focused.q.hotelDiscountMinor>0&&focused.q.baseLodgingMinor>0&&<><s>{formatMoney(focused.q.baseLodgingMinor)}</s><span className="desktop-map-preview-discount" aria-label={`Скидка ${Math.round(focused.q.hotelDiscountMinor/focused.q.baseLodgingMinor*100)}%`}>−{Math.round(focused.q.hotelDiscountMinor/focused.q.baseLodgingMinor*100)}%</span></>}</span></span></button></div>;
 const map=hotels.length>0&&<SourceMap key={`${searchKey}:${resetViewKey}`} selected={focused?.h.id} preview={preview} onPreviewDismiss={isDesktop?()=>setFocus(null):undefined} onHover={isDesktop?selectHotel:undefined} onVisibleChange={isDesktop?ids=>setView({key:searchKey,ids}):undefined} items={hotels.map(v=>({id:v.h.id,price:v.q.cashDueMinor,discountPercent:v.q.baseLodgingMinor?Math.round(v.q.hotelDiscountMinor/v.q.baseLodgingMinor*100):0}))} onSelect={isDesktop?selectHotel:onMap} onExpand={()=>onMap()}/>;
 const cards=<>{shown.map(({h,q})=>{const v=hotelVisual(h.id);return <article className="hotel-list-card" key={h.id} data-hotel-id={h.id}><div className="discovery-photo"><HotelCardPhotos name={h.name} photos={v.photos} onOpen={()=>onOpen(h.id)}/><SavedButton hotelId={h.id} saved={!!commerce.savedHotels?.[owner||'guest']?.includes(h.id)} onClick={()=>setCommerce(s=>toggleSaved(s,owner,h.id))}/></div><button className="hotel-list-card-info" onClick={()=>onOpen(h.id)}><h2>{h.name}</h2><div className="discovery-price"><strong>{formatMoney(q.cashDueMinor)}</strong>{ratePrice(q).friendly?<FriendlyRateBadge percent={ratePrice(q).percent}/>:q.hotelDiscountMinor>0&&<><s>{formatMoney(q.baseLodgingMinor)}</s><b>−{Math.round(q.hotelDiscountMinor/q.baseLodgingMinor*100)}%</b></>}</div><p><Icon name="pin" size={14}/>{h.city} · {v.distance}</p><div className="discovery-rating"><RatingBadge value={v.rating}/><span>{v.reviews} отзывов</span></div></button></article>;})}{isDesktop&&hotels.length>0&&!shown.length&&<Empty icon="map" title="В этой области нет отелей" action={<Button variant="secondary" onClick={resetMap}>Показать все отели</Button>}>Отдалите или переместите карту.</Empty>}{!hotels.length&&<Empty icon="nav-search" title="Нет вариантов" action={<><DialogActions><Button onClick={()=>{setCommerce(clearFilters);}}>Сбросить фильтры</Button><Button variant="secondary" onClick={()=>onEdit('dates')}>Изменить даты</Button></DialogActions></>}>Попробуйте изменить фильтры или даты.</Empty>}</>;
 const content=loading?<SearchResultsLoading mobile={!isDesktop}/>:error?<Empty icon="nav-search" title="Не удалось загрузить отели" action={<Button onClick={retry}>Попробовать снова</Button>}>Повторите поиск.</Empty>:cards;
 if(isDesktop)return <div className="desktop-results-layout">{searchHeader}<DesktopFilters commerce={commerce} setCommerce={setCommerce} owner={owner}/><section className="desktop-results-list" aria-label="Найденные отели" aria-busy={loading}><SearchFilterRail commerce={commerce} setCommerce={setCommerce} owner={owner}/>{visibleIds!==null&&<div className="desktop-map-results-status" aria-live="polite"><span>В области карты: {shown.length}</span><button className="text-action" onClick={resetMap}>Показать все</button></div>}{banner}{content}</section><aside className="desktop-results-map" aria-label="Отели на карте">{loading?<SearchMapLoading/>:map||<div className="desktop-map-empty"><Icon name="map" size={32}/><p>На карте пока нет отелей<br/>по выбранным условиям</p></div>}</aside></div>;
 return <div className="discovery-results" aria-busy={loading}>{banner}{!loading&&map}{content}</div>;
}
