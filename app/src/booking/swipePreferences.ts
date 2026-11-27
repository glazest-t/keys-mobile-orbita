import {selectPrototypeText,type PrototypeText} from '../prototypeText.ts';
import {type Commerce} from './model.ts';
import {basicHotelPreferences,hotelPreferenceFeatures,hotelPreferenceHighlights} from './hotelPreferences.ts';

export const swipeThemes=[
 {id:'family',title:'Семейный отдых',editedTitle:'С детьми',icon:'guests',features:['С детьми','Детская комната','Бассейн','Завтрак','Кондиционер','Анимация']},
 {id:'discover',title:'Открытия и опыт',editedTitle:'Необычные места',icon:'nearby',features:['Дизайн','Кафе и кофейни','Рядом с достопримечательностями','Удобное расположение']},
 {id:'romantic',title:'Романтический',editedTitle:'Для двоих',icon:'heart',features:['Спа','Вид из окна','Ресторан','Историческое здание','Тихое место']},
 {id:'culture',title:'Культура и история',editedTitle:'Рядом с центром',icon:'map',features:['Рядом с достопримечательностями','Завтрак','Историческое здание','Удобное расположение']},
 {id:'active',title:'Активный отдых',editedTitle:'Спорт и активность',icon:'fitness',features:['Фитнес-центр','Парковка','Завтрак','В горах','Прокат инвентаря','Бассейн']},
 {id:'nature',title:'Природа и эко',editedTitle:'На природе',icon:'weather',features:['На природе','Тихое место','У моря','Парк рядом']},
 {id:'spa',title:'Спа и здоровье',editedTitle:'Спа и релакс',icon:'spa',features:['Спа','Тихое место','Бассейн','Сауна']},
 {id:'food',title:'Гастрономия',editedTitle:'Вкусная еда',icon:'restaurant',features:['Ресторан','Завтрак','Кафе и кофейни','Бар','Гастро']},
];
export function swipeThemeTitle(theme:typeof swipeThemes[number],mode:PrototypeText){return selectPrototypeText(mode,theme.title,theme.editedTitle);}

export function matchedSwipePreferences(hotelId:string,themeIds:string[]){return hotelPreferenceHighlights(hotelId,swipeThemes.filter(t=>themeIds.includes(t.id)).flatMap(t=>t.features));}
export type SwipePreferences={themes:string[];completed:boolean};
export function needsSwipePreferences(s:Commerce,owner:string){return !s.swipePreferences?.[owner]?.completed;}
export function saveSwipePreferences(s:Commerce,owner:string,selected:string[],completed=false):Commerce{
 const themes=[...new Set(selected)].filter(id=>swipeThemes.some(t=>t.id===id));
 return {...s,swipePreferences:{...s.swipePreferences,[owner]:{themes,completed}}};
}
export function applySwipePreferences(s:Commerce,owner:string,selected:string[]):Commerce{
 const next=saveSwipePreferences(s,owner,selected,true);
 const previous=[...(s.swipePreferences?.[owner]?.themes||[])].sort();
 const changed=JSON.stringify(previous)!==JSON.stringify([...next.swipePreferences![owner].themes].sort());
 const history=s.swipeHistories?.[owner];
 if(!changed||!history)return next;
 // Re-rank unseen hotels, retain likes/skips and invalidate stale card callbacks.
 return {...next,swipeHistories:{...s.swipeHistories,[owner]:{...history,currentId:null,turn:history.turn+1}}};
}
// Rank by specific preferences; shared comfort criteria do not inflate the score.
export function swipePreferenceScore(s:Commerce,owner:string,hotelId:string){
 const features=new Set(hotelPreferenceFeatures(hotelId)),basic=basicHotelPreferences(hotelId);
 return (s.swipePreferences?.[owner]?.themes||[]).reduce((score,id)=>{
  const requested=swipeThemes.find(t=>t.id===id)?.features.filter(f=>!basic.includes(f))||[];
  return score+(requested.length?requested.filter(f=>features.has(f)).length/requested.length:0);
 },0);
}

/** Unique requested features determine the percentage; shared themes never double-count them. */
export function travelStyleMatch(hotelId:string,themeIds:string[]){
 const requested=[...new Set(swipeThemes.filter(t=>themeIds.includes(t.id)).flatMap(t=>t.features))];
 const features=new Set(hotelPreferenceFeatures(hotelId));
 const matched=requested.filter(feature=>features.has(feature));
 return {total:requested.length,matched,missing:requested.filter(feature=>!features.has(feature)),percent:requested.length&&features.size?Math.round(matched.length/requested.length*100):null};
}
