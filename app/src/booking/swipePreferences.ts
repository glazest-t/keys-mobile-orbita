import {type Commerce} from './model.ts';
import {basicHotelPreferences,hotelPreferenceFeatures,hotelPreferenceHighlights} from './hotelPreferences.ts';

export const swipeThemes=[
 {id:'family',title:'Семейный отдых',icon:'guests',features:['С детьми','Детская комната','Бассейн','Завтрак','Кондиционер','Анимация']},
 {id:'discover',title:'Открытия и опыт',icon:'nearby',features:['Дизайн','Кафе и кофейни','Рядом с достопримечательностями','Удобное расположение']},
 {id:'romantic',title:'Романтический',icon:'heart',features:['Спа','Вид из окна','Ресторан','Историческое здание','Тихое место']},
 {id:'culture',title:'Культура и история',icon:'map',features:['Рядом с достопримечательностями','Завтрак','Историческое здание','Удобное расположение']},
 {id:'solo',title:'Соло-поездка',icon:'nav-profile',features:['Безопасность','В центре','Wi-Fi','Для соло-поездки','Тихое место']},
 {id:'active',title:'Активный отдых',icon:'fitness',features:['Фитнес-центр','Парковка','Завтрак','В горах','Прокат инвентаря','Бассейн']},
 {id:'nature',title:'Природа и эко',icon:'weather',features:['На природе','Тихое место','У моря','Парк рядом']},
 {id:'long',title:'Долгое проживание',icon:'room',features:['Кухня','Прачечная','Wi-Fi','Тихое место','Парковка','Рабочее место']},
 {id:'spa',title:'Спа и здоровье',icon:'spa',features:['Спа','Тихое место','Бассейн','Сауна']},
 {id:'food',title:'Гастрономия',icon:'restaurant',features:['Ресторан','Завтрак','Кафе и кофейни','Бар','Гастро']},
];
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
