import {travelStyleMatch} from './swipePreferences.ts';
import {catalog,type Commerce} from './model.ts';
import {counterValue,priceMode,priceRange,roomAreaGroup} from './filterSchema.ts';
import {appliedOfferFilters,matchesHotelFilter} from './offers.ts';
import {hotelFacets,matchesRate,matchesRoom,mealIncludesBreakfast} from './searchFacets.ts';
import {hotelVisual} from './presentation.ts';
import type {PrototypeText} from '../prototypeText.ts';
import {getPrototypeVariant} from '../prototypeVariant.ts';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';

type StyleOffer=Pick<BookingQuote,'rateId'|'lodgingMinor'|'nights'>;
type StyleReason={feature:string;text:string};

const descriptions:Record<string,string>={
 'С детьми':'Можно отдохнуть всей семьёй',
 'Детская комната':'Детям есть где поиграть',
 'Бассейн':'В отеле можно поплавать в бассейне',
 'Завтрак':'Завтрак готовят в отеле',
 'Кондиционер':'В номере можно настроить комфортную температуру',
 'Анимация':'Для детей есть развлечения с аниматорами',
 'Дизайн':'Отель с интересным интерьером',
 'Кафе и кофейни':'Рядом можно зайти в кафе или кофейню',
 'Рядом с достопримечательностями':'Рядом есть достопримечательности',
 'Удобное расположение':'Отсюда удобно знакомиться с городом',
 'Спа':'После насыщенного дня можно отдохнуть в спа',
 'Вид из окна':'Из номера открывается красивый вид',
 'Ресторан':'Поужинать можно в ресторане отеля',
 'Историческое здание':'Отель находится в историческом здании',
 'Тихое место':'Спокойное место для отдыха',
 'Безопасность':'В отеле уделяют внимание безопасности',
 'В центре':'Отель в центре города',
 'Wi-Fi':'Можно оставаться на связи по Wi-Fi',
 'Для соло-поездки':'Удобно остановиться одному',
 'Фитнес-центр':'Можно продолжить тренировки в фитнес-зале',
 'Парковка':'Есть где оставить машину',
 'В горах':'Можно провести отпуск в горах',
 'Прокат инвентаря':'Спортивный инвентарь можно взять напрокат',
 'На природе':'Можно отдохнуть поближе к природе',
 'У моря':'Море рядом с отелем',
 'Парк рядом':'Рядом парк для прогулок',
 'Кухня':'Можно готовить самостоятельно',
 'Прачечная':'Вещи можно постирать во время поездки',
 'Рабочее место':'Есть место, чтобы поработать',
 'Сауна':'Можно согреться и расслабиться в сауне',
 'Бар':'Вечером можно заглянуть в бар',
 'Гастро':'Отель подойдёт для знакомства с местной кухней',
};

const editedDescriptions:Record<string,string>={
 'Удобное расположение':'Удобно гулять пешком: центр и достопримечательности в 10 минутах',
 'Ресторан':'Ресторан на территории: есть авторское и детское меню',
};
const includedBreakfastText='Завтрак включён в стоимость';

const roomGroups=['Выбор кровати','Комнаты','Удобства в номере',roomAreaGroup,'Спальни','Кровати','Ванные комнаты'];
const filterFeatures:Record<string,string>={
 'Завтрак включён':'Завтрак','Собственная кухня':'Кухня','Можно с детьми':'С детьми',
 'Есть парковка':'Парковка','Бесплатная парковка':'Парковка',
};
const filterDescriptions:Record<string,string>={
 'Завтрак включён':'Завтрак включён в тариф','Собственная кухня':'В номере есть кухня',
 'Бесплатная парковка':'Есть бесплатная парковка','Можно с питомцем':'Можно приехать с питомцем',
};

function offerFilterReasons(hotelId:string,commerce:Commerce,offer:StyleOffer,mode:PrototypeText):StyleReason[]{
 const rate=catalog.rates.find(rate=>rate.id===offer.rateId&&rate.hotelId===hotelId);
 if(!rate)return [];
 const reasons=appliedOfferFilters(commerce).flatMap(filter=>{
  const separator=filter.indexOf(': ');
  const group=separator<0?'':filter.slice(0,separator);
  const value=separator<0?filter:filter.slice(separator+2);
  const singleFilter={...commerce,searchFilters:[filter]};
  const matches=group==='Питание'
   ?matchesRate(singleFilter,{...rate,kind:'standard'})
   :roomGroups.includes(group)?matchesRoom(singleFilter,rate.roomId):matchesHotelFilter(commerce,hotelId,group,value);
  if(!matches)return [];
  const feature=filterFeatures[value]||value;
  const text=group===roomAreaGroup?`Площадь номера от ${value} м²`
   :['Спальни','Кровати','Ванные комнаты'].includes(group)?`${group} · от ${counterValue([filter],group)}`
   :mode==='edited'&&value==='Завтрак включён'?includedBreakfastText
   :(mode==='edited'?editedDescriptions[feature]:undefined)||filterDescriptions[value]||descriptions[feature]||value;
  return [{feature:group===roomAreaGroup||['Спальни','Кровати','Ванные комнаты'].includes(group)?group:feature,text}];
 });
 const visual=hotelVisual(hotelId),district=commerce.searchDistrict,range=priceRange(commerce);
 if(commerce.minRating&&visual.rating>=commerce.minRating)reasons.push({feature:'Оценка гостей',text:`Оценка гостей ${visual.rating.toLocaleString('ru-RU')}`});
 if(getPrototypeVariant()!=='november'&&district?.city===commerce.search.city&&hotelFacets(hotelId)?.district===district.name)reasons.push({feature:'Район',text:district.name});
 const price=priceMode(commerce)==='night'?Math.round(offer.lodgingMinor/offer.nights/100)*100:offer.lodgingMinor;
 if((range.min!==null||range.max!==null)&&price>=(range.min??0)&&(range.max===null||price<=range.max))reasons.push({feature:'Цена',text:'Цена в выбранном диапазоне'});
 return reasons;
}

/** The score stays about travel style; reasons can also explain the current search offer. */
export function travelStyleReasonItems(hotelId:string,themeIds:string[],reviewPraise='',search?:{commerce:Commerce;offer:StyleOffer},mode:PrototypeText='standard'){
 const {matched}=travelStyleMatch(hotelId,themeIds);
 const rate=search&&catalog.rates.find(rate=>rate.id===search.offer.rateId&&rate.hotelId===hotelId);
 const breakfastIncluded=!!rate&&mealIncludesBreakfast(rate.mealPlan);
 const styleReasons=matched.filter(feature=>!!descriptions[feature]).map(feature=>{
  let text=descriptions[feature];
  if(feature==='Спа'&&reviewPraise.includes('спа'))text='Гости хвалят спа';
  if(feature==='Завтрак'&&reviewPraise.includes('завтрак'))text='Гости хвалят завтраки';
  if(mode==='edited')text=feature==='Завтрак'&&breakfastIncluded?includedBreakfastText:editedDescriptions[feature]||text;
  return {feature,text};
 });
 if(!search||!themeIds.length)return styleReasons.slice(0,3);
 const unique=(reasons:StyleReason[])=>reasons.filter((item,index)=>reasons.findIndex(reason=>reason.feature===item.feature)===index);
 const filters=unique(offerFilterReasons(hotelId,search.commerce,search.offer,mode));
 return unique([...filters.slice(0,styleReasons.length?2:3),...styleReasons,...filters]).slice(0,3);
}
export function travelStyleReasons(hotelId:string,themeIds:string[],reviewPraise=''){
 return travelStyleReasonItems(hotelId,themeIds,reviewPraise).map(item=>item.text);
}
