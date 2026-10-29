import {type Commerce} from './model.ts';
import {hotelVisual} from './presentation.ts';

export const swipeThemes=[
 {id:'family',title:'Семейный отдых',icon:'guests',features:['С детьми']},
 {id:'discover',title:'Открытия и опыт',icon:'nearby',features:['Дизайн','У моря']},
 {id:'romantic',title:'Романтический',icon:'heart',features:['Тихое место','Спа','Дизайн']},
 {id:'culture',title:'Культура и история',icon:'map',features:['Дизайн']},
 {id:'solo',title:'Соло-поездка',icon:'nav-profile',features:['Тихое место']},
 {id:'active',title:'Активный отдых',icon:'fitness',features:['Бассейн','У моря']},
 {id:'nature',title:'Природа и эко',icon:'weather',features:['Тихое место']},
 {id:'long',title:'Долгое проживание',icon:'room',features:['Рабочее место','Wi-Fi']},
 {id:'spa',title:'Спа и здоровье',icon:'spa',features:['Спа']},
 {id:'food',title:'Гастрономия',icon:'restaurant',features:['Гастро','Ресторан']},
];
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
// Soft ranking from available demo catalogue attributes, never an availability filter.
export function swipePreferenceScore(s:Commerce,owner:string,hotelId:string){
 const v=hotelVisual(hotelId),features=new Set([...v.styles,...v.amenities]);
 return (s.swipePreferences?.[owner]?.themes||[]).reduce((score,id)=>{
  const theme=swipeThemes.find(t=>t.id===id);
  return score+(theme?theme.features.filter(f=>features.has(f)).length/theme.features.length:0);
 },0);
}
