import {swipePreferenceScore} from './swipePreferences.ts';
import {type Commerce,catalog,startDraft} from './model.ts';
import {discoveryOffers} from './offers.ts';
import {hotelVisual} from './presentation.ts';
import {saveSwipeLike,favoriteLibrary,SWIPE_LIST} from './favorites.ts';

export type SwipeAnswer='like'|'skip';
export type SwipeHistory={context:string;seen:string[];answers:Record<string,SwipeAnswer>;currentId:string|null;turn:number};
const features=(id:string)=>new Set([...hotelVisual(id).styles,...hotelVisual(id).amenities]);
// Local similarity over known catalogue properties; no external recommendation service.
function affinity(id:string,answers:SwipeHistory['answers']){
 const candidate=features(id);
 return Object.entries(answers).reduce((score,[other,answer])=>{
  if(!catalog.hotels.some(h=>h.id===other))return score;
  const reference=features(other),shared=[...candidate].filter(f=>reference.has(f)).length;
  return score+(answer==='like'?1:-.5)*shared/new Set([...candidate,...reference]).size;
 },0);
}
function context(s:Commerce){return JSON.stringify([s.search,[...(s.searchFilters||[])].sort(),s.priceRangeMinor,s.maxNightly,s.minRating,s.collection,s.searchSort,s.priceMode,s.searchDistrict]);}
export function swipeDiscovery(s:Commerce,owner:string){
 const key=context(s),stored=s.swipeHistories?.[owner];
 const history:SwipeHistory=stored?.context===key?stored:{context:key,seen:[],answers:stored?.answers||{},currentId:null,turn:stored?.turn||0};
 const offers=discoveryOffers(s,owner).map((offer,index)=>({...offer,index,score:affinity(offer.h.id,history.answers)+swipePreferenceScore(s,owner,offer.h.id)})).sort((a,b)=>b.score-a.score||a.index-b.index);
 const remaining=offers.filter(o=>!history.seen.includes(o.h.id));
 const current=remaining.length?(remaining.find(o=>o.h.id===history.currentId)||remaining[0]):undefined;
 return {history,offers,remaining,current,finished:offers.length>0&&!current};
}
export function answerSwipe(s:Commerce,owner:string,hotelId:string,answer:SwipeAnswer,expectedTurn:number):Commerce{
 const view=swipeDiscovery(s,owner);
 if(view.history.turn!==expectedTurn||view.current?.h.id!==hotelId)return s;
 const history:SwipeHistory={...view.history,seen:[...view.history.seen,hotelId],answers:{...view.history.answers,[hotelId]:answer},currentId:null,turn:expectedTurn+1};
 let next:Commerce={...s,swipeHistories:{...s.swipeHistories,[owner]:history}};
 if(answer==='like')next=saveSwipeLike(next,owner,hotelId);
 history.currentId=swipeDiscovery(next,owner).current?.h.id||null;
 return next;
}
export function restartSwipe(s:Commerce,owner:string):Commerce{
 const {history}=swipeDiscovery(s,owner);
 return {...s,swipeHistories:{...s.swipeHistories,[owner]:{...history,seen:[],currentId:null,turn:history.turn+1}}};
}
export function swipeFavoriteList(s:Commerce,owner:string){return favoriteLibrary(s,owner).lists.find(l=>l.id===SWIPE_LIST||l.name.trim().toLocaleLowerCase('ru')==='подбор по свайпу');}
export function startSwipeBooking(s:Commerce,owner:string,hotelId:string,id:string):Commerce{
 if(!discoveryOffers(s,owner).some(o=>o.h.id===hotelId))throw Error('Отель больше недоступен для выбранных условий');
 const next=startDraft(s,hotelId,id,owner);
 return {...next,draft:{...next.draft!,returnTo:'swipe'}};
}
