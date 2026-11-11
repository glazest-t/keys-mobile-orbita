import {DialogActions} from '../dialogActions';
import {HotelMap} from '../maps/HotelMap';
import {RatingBadge} from './RatingBadge';
import {isDesktop} from '../desktop/surface';
import {DesktopFilters} from './Filters';
import {SearchFilterRail} from './SearchFilterRail';
import {useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {Button,Empty,Icon} from '../ui';
import {type Commerce,formatMoney} from './model';
import {clearFilters} from './Filters';
import {useSearchResults} from './useSearchResults';
import {SearchResultsLoading,SearchMapLoading} from './SearchResultsLoading';
import {hotelVisual} from './presentation';
export {toggleFavorite as toggleSaved} from './FavoriteSaving';
import {HotelResultCard} from './HotelResultCard';
export {SavedButton} from './SavedHotelButton';

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
 const cards=<>{shown.map(({h,q})=><HotelResultCard key={h.id} hotelId={h.id} quote={q} commerce={commerce} owner={owner} setCommerce={setCommerce} onOpen={()=>onOpen(h.id)}/>)}{isDesktop&&hotels.length>0&&!shown.length&&<Empty icon="map" title="В этой области нет отелей" action={<Button variant="secondary" onClick={resetMap}>Показать все отели</Button>}>Отдалите или переместите карту.</Empty>}{!hotels.length&&<Empty icon="nav-search" title="Нет вариантов" action={<><DialogActions><Button onClick={()=>{setCommerce(clearFilters);}}>Сбросить фильтры</Button><Button variant="secondary" onClick={()=>onEdit('dates')}>Изменить даты</Button></DialogActions></>}>Попробуйте изменить фильтры или даты.</Empty>}</>;
 const content=loading?<SearchResultsLoading mobile={!isDesktop}/>:error?<Empty icon="nav-search" title="Не удалось загрузить отели" action={<Button onClick={retry}>Попробовать снова</Button>}>Повторите поиск.</Empty>:cards;
 if(isDesktop)return <div className="desktop-results-layout">{searchHeader}<DesktopFilters commerce={commerce} setCommerce={setCommerce} owner={owner}/><section className="desktop-results-list" aria-label="Найденные отели" aria-busy={loading}><SearchFilterRail commerce={commerce} setCommerce={setCommerce} owner={owner}/>{visibleIds!==null&&<div className="desktop-map-results-status" aria-live="polite"><span>В области карты: {shown.length}</span><button className="text-action" onClick={resetMap}>Показать все</button></div>}{banner}{content}</section><aside className="desktop-results-map" aria-label="Отели на карте">{loading?<SearchMapLoading/>:map||<div className="desktop-map-empty"><Icon name="map" size={32}/><p>На карте пока нет отелей<br/>по выбранным условиям</p></div>}</aside></div>;
 return <div className="discovery-results" aria-busy={loading}>{banner}{!loading&&map}{content}</div>;
}
