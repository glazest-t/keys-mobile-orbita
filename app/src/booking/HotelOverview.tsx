import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {usePrototypeCopy,usePrototypeText} from '../usePrototypeText';
import {ReviewText} from './ReviewText';
import {HotelFacilities} from './HotelFacilities';
import {GuestStyleMatchDetails,GuestStyleReasonIcon,useGuestStyleMatch} from './GuestStyleMatch';
import {useHotelRoute} from './MapAppChooser';
import {ReviewPhotos} from './ReviewPhotos';
import {NearbyPreview} from './NearbyPlaces';
import {FullscreenPhotoGallery} from './FullscreenPhotoGallery';
import {useNovember} from '../usePrototypeVariant';
import {isDesktop} from '../desktop/surface';
import {hotelAddress} from '../maps/locations';
import {PreferenceIllustration} from './PreferenceIllustration';
import {preferenceIllustrationFor} from './preferenceIllustrations';
import {RatingBadge} from './RatingBadge';
import {ratePrice} from './friendlyRate';
import {roomOffers} from './roomOffers';
import {importedHotel} from './importedHotels';
import {hotelFacets} from './searchFacets';
import {swipeThemes,swipeThemeTitle,matchedSwipePreferences} from './swipePreferences';
import {hotelPreferenceFeatures} from './hotelPreferences';
import {useState,useEffect,useRef,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {BottomSheet,Carousel,useMobileDevice} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {type Commerce,quoteDraft,catalog,formatMoney} from './model';
import {hotelVisual,hotelStarLabel,reviewExamples,hotelReviews,hotelReviewTags,hotelReviewPraise} from './presentation';
import {SavedButton,toggleSaved} from './Discovery';
import {HotelPrice,HotelPriceWatch} from './HotelSheets';
import {type HotelDetail} from './HotelDetails';
import {watchKey} from './priceWatch';
import {useHotelPhotoStatus} from './hotelPhotoStatus';
export function HotelOverview({commerce,setCommerce,owner,onBack,onDetail,onPreferences,rooms,onResults,onPushWatchSaved}:{onPushWatchSaved:(key:string)=>void;onResults?:()=>void;rooms?:ReactNode;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;onBack:()=>void;onPreferences:()=>void;onDetail:(kind:HotelDetail,nearby?:{initialPlaceId?:string;initialMapOpen?:boolean})=>void}){
 const november=useNovember();
 const d=commerce.draft!,hotel=catalog.hotels.find(h=>h.id===d.hotelId)!,v=hotelVisual(hotel.id),q=quoteDraft(commerce,owner);
 const shareUrl=new URL(location.href);shareUrl.search='';shareUrl.searchParams.set('variant','november');shareUrl.searchParams.set('hotel',hotel.id);shareUrl.hash='booking-flow';
 const [shareCopied,setShareCopied]=useState(false);
 const shareHotel=async()=>{if(november&&navigator.share){try{await navigator.share({title:hotel.name,text:[v.location,v.address].join(', '),url:shareUrl.href});return;}catch(e){if((e as Error).name==='AbortError')return;}}setSheet('share');};
 const price=ratePrice(q);
 const mode=usePrototypeText();
 const featuredStyleHeading=usePrototypeCopy('Мой стиль','Под ваши планы');
 const priceTitle=usePrototypeCopy('Общая скидка',price.discountMinor>0?'Общая скидка':'Общая цена');
 const roomPrices=isDesktop?roomOffers(commerce,owner).flatMap(offer=>offer.rates.map(({quote})=>quote.lodgingMinor)):[];
 const fromPrice=roomPrices.length?Math.min(...roomPrices):q.lodgingMinor;
 const [photoIndex,setPhotoIndex]=useState(0);
 const photoPageCount=v.photos.length;
 const [galleryPhoto,setGalleryPhoto]=useState<number|null>(null);
 const heroRef=useRef<HTMLDivElement>(null);
 const bodyRef=useRef<HTMLDivElement>(null);
 const {device}=useMobileDevice();
 useHotelPhotoStatus(heroRef,bodyRef,device.geometry.safeArea.top);
 useEffect(()=>{setPhotoIndex(0);heroRef.current?.querySelector('.hotel-hero-carousel')?.scrollTo({left:0});},[hotel.id]);
 const changePhoto=(direction:number)=>{
  const scroller=heroRef.current?.querySelector<HTMLElement>('.hotel-hero-carousel');
  if(scroller)scroller.scrollTo({left:((photoIndex+direction+photoPageCount)%photoPageCount)*scroller.clientWidth,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 const [sheet,setSheet]=useState<'price'|'share'|'watch'|'preferences'|null>(null),[tag,setTag]=useState('Все');
 const {openRoute,routeSheet}=useHotelRoute(hotel.id,()=>onDetail('route'));
 const styleReasons=useGuestStyleMatch({hotelId:hotel.id,commerce,owner,offer:d.returnTo?undefined:q})?.reasons??[];
 const preferences=commerce.swipePreferences?.[owner||'guest'];
 const themes=swipeThemes.filter(t=>preferences?.themes.includes(t.id));
 const matches=matchedSwipePreferences(hotel.id,preferences?.themes||[]);
 const sourceMatches=['preferences','wish-search'].includes(d.returnTo||'')?d.preferenceMatches||[]:[];
 const displayed=[...new Set(themes.length||sourceMatches.length?[...sourceMatches,...matches]:hotelPreferenceFeatures(hotel.id))].slice(0,5);
 const facilityPriority=['Бассейн','Спа','Свой пляж','Ресторан','Парковка','Wi-Fi'];
 const amenities=[...new Set([...v.amenities,...(hotel.id==='orbit-sea'?['Свой пляж']:[]),...(hotelFacets(hotel.id)?.amenities||[])])].filter(a=>a!=='Рабочее место').sort((a,b)=>(facilityPriority.includes(a)?facilityPriority.indexOf(a):99)-(facilityPriority.includes(b)?facilityPriority.indexOf(b):99));
 const featuredAmenities=amenities.filter(label=>preferenceIllustrationFor(label)).slice(0,6);
 const reviewPraise=hotelReviewPraise(hotel.id);
 const key=watchKey(owner,d);
 const watch=commerce.priceWatches?.[key];
 const imported=!!importedHotel(hotel.id);
 const reviews=hotelReviews(hotel.id).filter(r=>november||tag==='Все'||r.tags.includes(tag));
 const reviewCard=(r:typeof reviewExamples[number])=><article className="review-card" key={r.name}><div><span><strong>{r.name}</strong><small>{r.date}</small></span><RatingBadge value={r.score}/></div><ReviewText text={r.text}/><ReviewPhotos photos={r.photos} author={r.name}/>{isDesktop&&r.reply&&<aside className="review-hotel-reply"><strong>Ответ отеля</strong><p>{r.reply}</p></aside>}{!november&&<span className="review-tags">{r.tags.map(t=><span key={t}>{t}</span>)}</span>}</article>;
 const hotelActions=<div><SavedButton hotelId={hotel.id} saved={!!commerce.savedHotels?.[owner||'guest']?.includes(hotel.id)} onClick={()=>setCommerce(s=>toggleSaved(s,owner,hotel.id))}/><IconButton name="share" inheritColor label="Поделиться отелем" onClick={shareHotel}/></div>;
 const hero=<><div ref={heroRef} className="source-hotel-hero" onScrollCapture={event=>{const node=event.target as HTMLElement;if(node.classList.contains('hotel-hero-carousel')&&node.clientWidth)setPhotoIndex(Math.max(0,Math.min(photoPageCount-1,Math.round(node.scrollLeft/node.clientWidth))));}} onKeyDown={event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();changePhoto(event.key==='ArrowRight'?1:-1);}}}><div className={isDesktop?"desktop-hotel-main-photo":undefined} style={isDesktop?undefined:{display:'contents'}}><Carousel className={"hotel-hero-carousel"+(isDesktop?" desktop-hotel-photo-carousel":"")} contentClassName={"hotel-hero-track"+(isDesktop?" desktop-hotel-photo-track":"")} ariaLabel="Фотографии отеля">{v.photos.map((src,index)=><button key={src} className="hero-photo" tabIndex={index===photoIndex?0:-1} onClick={()=>setGalleryPhoto(index)} aria-label={`Открыть фотографии отеля · ${index+1} из ${v.photos.length}`}><img src={src} alt={`${hotel.name} · фото ${index+1}`} draggable={false}/></button>)}</Carousel><div className="hero-actions">{!isDesktop&&<IconButton name="back" inheritColor label={commerce.draft?.returnTo?.startsWith('hotel-chat/')?'Назад в чат':commerce.draft?.returnTo?.startsWith('profile-')?'Назад к истории поездок':commerce.draft?.returnTo?.startsWith('loyalty-program/')?'Назад к программе отеля':commerce.draft?.returnTo==='notifications'?'Назад к уведомлениям':commerce.draft?.returnTo==='price-watches'?'Назад к наблюдениям':'Назад к отелям'} onClick={onBack}/>}{!isDesktop&&hotelActions}</div>{isDesktop&&photoPageCount>1&&<div className="desktop-hotel-photo-controls"><IconButton name="chevron-right" mirrored label="Предыдущее фото отеля" onClick={()=>changePhoto(-1)}/><IconButton name="chevron-right" label="Следующее фото отеля" onClick={()=>changePhoto(1)}/></div>}<button className="hero-caption" onClick={()=>isDesktop?setGalleryPhoto(photoIndex):onDetail('gallery')}>{!november&&<span>{photoIndex>0?'Фото отеля':hotel.id==='orbit-sea'?'Главный корпус у моря':'Пространство для отдыха'}</span>}<span><Icon name="camera" size={16}/>{photoIndex+1} / {v.photos.length}</span></button></div>{isDesktop&&v.photos.length>1&&<div className="desktop-hotel-side-photos">{v.photos.slice(1,3).map((src,index)=><button className="hero-photo" key={src+index} onClick={()=>setGalleryPhoto(index+1)} aria-label={`Открыть фотографии отеля · ${index+2} из ${v.photos.length}`}><img src={src} alt={`${hotel.name} · фото ${index+2}`} draggable={false}/></button>)}</div>}</div></>;
 const starsLabel=hotelStarLabel(v.stars);
 const locationId='hotel-location';
 const scrollToLocation=()=>{
  const section=document.getElementById(locationId);
  section?.focus({preventScroll:true});
  section?.scrollIntoView({block:'start'});
 };
 const heading=<section className="hotel-heading">
  <h1>{hotel.name}</h1>{isDesktop&&<div className="desktop-hotel-heading-actions">{hotelActions}</div>}
  <p>{hotelFacets(hotel.id)?.type||'Отель'} {starsLabel&&<b className="hotel-star-badge">{starsLabel}</b>}{isDesktop?<button type="button" className="desktop-hotel-address" onClick={scrollToLocation}><Icon name="pin" size={16} inheritColor/>{hotelAddress(hotel.id,hotel.city)||[v.location,v.address].filter(Boolean).join(', ')}</button>:<span>{v.location}</span>}</p>
 </section>;
 const preferencesBlock=november?null:<><section className="hotel-preferences">{isDesktop?<header><button type="button" className="desktop-preferences-heading" aria-label="Под ваши предпочтения — изменить" aria-haspopup="dialog" aria-expanded={sheet==='preferences'} onClick={()=>setSheet('preferences')}><span>Под ваши предпочтения</span><span className="desktop-preferences-edit"><Icon name="edit" size={14} inheritColor/>Изменить</span></button></header>:<header><small>Под ваши предпочтения</small><button type="button" className="hotel-preferences-info" aria-label="Как подобраны предпочтения" aria-haspopup="dialog" aria-expanded={sheet==='preferences'} onClick={()=>setSheet('preferences')}><Icon name="info" size={18} inheritColor/></button></header>}<Carousel className="hotel-preferences-carousel" contentClassName="hotel-preferences-track" ariaLabel="Предпочтения и особенности отеля">{displayed.map(text=><span className="hotel-preference-tag" key={text}><PreferenceIllustration label={text}/>{text}</span>)}</Carousel>{themes.length>0&&!matches.length&&<small>У этого отеля пока нет совпадений с вашими предпочтениями</small>}</section></>;
 const hasStyleMatches=styleReasons.length>0;
 const featuredItems=hasStyleMatches?styleReasons:featuredAmenities.map(label=>({feature:label,text:label}));
 const featuredHeading=hasStyleMatches?featuredStyleHeading:novemberEditorialText("Т-1125", "Удобства отеля", "Удобства");
 const desktopFeatures=featuredItems.length>0&&<section className="desktop-hotel-featured-amenities" data-guest-style={hasStyleMatches||undefined} aria-label={hasStyleMatches?featuredHeading:'Ключевые удобства отеля'}>
  <h2>{featuredHeading}</h2>
  <ul>{featuredItems.map(({feature,text})=><li key={feature}>{hasStyleMatches?<GuestStyleReasonIcon feature={feature} size={32}/>:<PreferenceIllustration label={feature} size={32} original/>}<span>{text}</span></li>)}</ul>
 </section>;
 const ratingBlock=<button className="hotel-review-summary" onClick={()=>isDesktop?document.getElementById('hotel-reviews')?.scrollIntoView({block:'start'}):onDetail('reviews')}>
  <RatingBadge value={v.rating}/>
  <span>
   <strong>{imported?'Оценка гостей':'Очень хорошо'} <small>· {v.reviews} отзывов</small></strong>
   {reviewPraise&&<small className="hotel-review-praise">Гости хвалят {reviewPraise}</small>}
  </span>
  <Icon name="chevron-right" size={18}/>
 </button>;
 const priceBlock=<><section className="hotel-price-card"><button onClick={()=>setSheet('price')}><span><span className="personal-price"><Icon name="best-price" size={16} inheritColor/>Цена для вас</span><span className="hotel-price-value"><strong>{formatMoney(q.lodgingMinor)}</strong>{price.discountMinor>0&&<b className={price.friendly?'friendly-discount':undefined}>−{price.percent}%</b>}{price.discountMinor>0&&<s>{formatMoney(price.baseMinor)}</s>}</span></span><Icon name="chevron-right" size={18}/></button></section></>;
 const overviewSummary=<div className="hotel-overview-summary">
  {heading}
  {!isDesktop&&<><GuestStyleMatchDetails reasons={styleReasons}/>{preferencesBlock}{ratingBlock}{priceBlock}</>}
 </div>;
 const information=<><p className="hotel-description">{v.description}</p><NearbyPreview key={hotel.id} hotelId={hotel.id} showLocation locationId={isDesktop?locationId:undefined} onRoute={openRoute} onOpen={(initialPlaceId,initialMapOpen)=>onDetail('nearby',{initialPlaceId,initialMapOpen})}/><HotelFacilities key={hotel.id} amenities={amenities} hotelId={hotel.id}/><section className="hotel-section hotel-arrival-section"><h2>Правила проживания</h2><dl className="hotel-arrival-times"><div><Icon name="check-in" size={24} inheritColor/><dt>Заезд</dt><dd>с {hotel.checkInTime}</dd></div><div><Icon name="check-out" size={24} inheritColor/><dt>Выезд</dt><dd>до {hotel.checkOutTime}</dd></div></dl></section>
 <section id={isDesktop?"hotel-reviews":undefined} className="hotel-section"><div className="section-label"><h2>Отзывы гостей</h2>{!isDesktop&&<button onClick={()=>onDetail('reviews')}>Все<Icon name="chevron-right" size={14} inheritColor/></button>}</div>{isDesktop&&<div className="desktop-reviews-overview"><RatingBadge value={v.rating}/><div><strong>{imported?'Оценка гостей':'Очень хорошо'} <span>· {v.reviews} отзывов</span></strong>{reviewPraise&&<p>Гости хвалят {reviewPraise}</p>}</div></div>}<>{!november&&<Carousel ariaLabel="Темы отзывов" contentClassName="discovery-chip-track">{hotelReviewTags(hotel.id).map(t=><button key={t} className={'filter-chip '+(t===tag?'selected':'')} aria-pressed={tag===t} onClick={()=>setTag(t)}>{t}</button>)}</Carousel>}{isDesktop?<div className="desktop-hotel-reviews">{reviews.map(reviewCard)}</div>:<Carousel ariaLabel="Отзывы гостей" contentClassName="reviews-track">{reviews.map(reviewCard)}</Carousel>}</></section></>;
 return <>{isDesktop?<div className="desktop-hotel-overview">
 <button type="button" className="desktop-hotel-back" onClick={onResults||onBack}><span className="desktop-hotel-back-icon"><Icon name="back" size={20} inheritColor/></span><span>К списку отелей</span></button>
 {overviewSummary}
 <div className="desktop-hotel-top">{hero}<aside className="desktop-hotel-summary" aria-label="Ваш выбор отеля"><Button className="desktop-hotel-select-room" onClick={()=>document.getElementById('hotel-rooms')?.scrollIntoView({block:'start'})}><span>Выбрать номер</span><span>от {formatMoney(fromPrice)}</span></Button>{desktopFeatures}{preferencesBlock}{ratingBlock}{priceBlock}</aside></div>
 {rooms}<div className="source-hotel-body desktop-hotel-information">{information}</div>
 </div>:<>
  {hero}<div ref={bodyRef} className="source-hotel-body">{overviewSummary}{information}</div></>}<BottomSheet open={!!sheet} onOpenChange={o=>{if(!o)setSheet(null);}} title={{gallery:'Фото отеля',reviews:'Отзывы гостей',price:priceTitle,map:'Расположение',share:'Поделиться отелем',watch:'Следить за ценой',preferences:'Под ваши предпочтения'}[sheet||'gallery']} snap={sheet==='preferences'?.52:sheet==='price'?.56:sheet==='watch'?.78:.65}><div className="sheet-body">{sheet==='preferences'?<div className="hotel-preferences-help"><p>{themes.length?'Учитываем ваш стиль поездки и базовый комфорт: чистоту, Wi-Fi и расположение. Сначала показываем совпавшие особенности отеля, затем — базовые критерии.':sourceMatches.length?'Показываем совпадения с пожеланиями из поиска и базовые критерии комфорта: чистоту, Wi-Fi и расположение. Вы можете дополнить свой стиль путешествий.':'Вы пока не указали предпочтения отдыха. Сейчас здесь показаны особенности отеля. Выберите, что вам важно, — и мы покажем совпадения.'}</p>{themes.length>0&&<div className="hotel-preferences-selected"><small>Ваш выбор</small><p>{themes.map(t=>swipeThemeTitle(t,mode)).join(' · ')}</p></div>}<Button onClick={()=>{setSheet(null);onPreferences();}}><Icon name="preferences" size={18} inheritColor/>Изменить параметры</Button></div>:sheet==='price'?<HotelPrice commerce={commerce} owner={owner} onClose={()=>setSheet(null)}/>:sheet==='watch'?<HotelPriceWatch onPushWatchSaved={onPushWatchSaved} key={sheet} commerce={commerce} setCommerce={setCommerce} owner={owner} onClose={()=>setSheet(null)}/>:<><h2>{hotel.name}</h2><p>{v.location} · {v.distance}</p>{november?<><Button variant="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(shareUrl.href);setShareCopied(true);}catch{setShareCopied(false);}}}>{shareCopied?novemberEditorialText("Т-1137", 'Ссылка скопирована', "Скопировали ссылку"):'Скопировать ссылку'}</Button><p className="november-share-url">{shareUrl.href}</p></>:<p className="muted">Ссылка на отель пока недоступна.</p>}</>}</div></BottomSheet>{routeSheet}<FullscreenPhotoGallery title={hotel.name} photos={v.photos.map((src,index)=>({src,label:`${hotel.name} · фото ${index+1}`}))} selected={galleryPhoto} onSelect={setGalleryPhoto} subject="отеля"/></>;
}
