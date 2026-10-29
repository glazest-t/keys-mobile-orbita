import {catalog,startDraft,quoteDraft,searchError,type Commerce,type Search} from './model.ts';

export const INBOX='inbox';
export const SWIPE_LIST='swipe-picks';
export function saveSwipeLike(s:Commerce,owner:string,hotelId:string):Commerce{
 const lib=favoriteLibrary(s,owner);
 const list=lib.lists.find(l=>l.id===SWIPE_LIST)||lib.lists.find(l=>l.name.trim().toLocaleLowerCase('ru')==='подбор по свайпу');
 const next=list?s:saveFavoriteList(s,owner,SWIPE_LIST,'Подбор по свайпу');
 return setFavorite(next,owner,hotelId,list?.id||SWIPE_LIST);
}
export const favoriteCountLabel=(n:number)=>`${n} ${n%10===1&&n%100!==11?'отель':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'отеля':'отелей'}`;
export type FavoriteList={id:string;name:string;search:Search};
export type FavoriteLibrary={lists:FavoriteList[];assignment:Record<string,string>;notes:Record<string,string>;selectedId:string;returnTo:string};
const copySearch=(s:Search):Search=>({...s,childrenAges:[...s.childrenAges],withPet:false,businessTrip:false,byCar:false});
export function favoriteLibrary(s:Commerce,owner:string):FavoriteLibrary{
 const stored=s.favoriteLibraries?.[owner];
 const lists=stored?.lists||[{id:INBOX,name:'Без списка',search:copySearch(s.search)}];
 const ids=new Set(lists.map(l=>l.id)),assignment:Record<string,string>={};
 for(const id of s.savedHotels?.[owner]||[])assignment[id]=ids.has(stored?.assignment[id]||'')?stored!.assignment[id]:INBOX;
 return {lists,assignment,notes:stored?.notes||{},selectedId:ids.has(stored?.selectedId||'')?stored!.selectedId:INBOX,returnTo:stored?.returnTo||'find'};
}
function write(s:Commerce,owner:string,library:FavoriteLibrary):Commerce{return {...s,favoriteLibraries:{...s.favoriteLibraries,[owner]:library}};}
export function favoriteNavigation(s:Commerce,owner:string,patch:Partial<Pick<FavoriteLibrary,'selectedId'|'returnTo'>>){return write(s,owner,{...favoriteLibrary(s,owner),...patch});}
export function favoriteItems(s:Commerce,owner:string,listId:string){const lib=favoriteLibrary(s,owner);return (s.savedHotels?.[owner]||[]).filter(id=>lib.assignment[id]===listId);}
export function setFavorite(s:Commerce,owner:string,hotelId:string,listId:string|null):Commerce{
 if(!catalog.hotels.some(h=>h.id===hotelId))throw Error('Отель не найден');
 const lib=favoriteLibrary(s,owner),ids=s.savedHotels?.[owner]||[];
 if(listId!==null&&!lib.lists.some(l=>l.id===listId))throw Error('Список не найден');
 const assignment={...lib.assignment},notes={...lib.notes};
 if(listId===null){delete assignment[hotelId];delete notes[hotelId];}else assignment[hotelId]=listId;
 return write({...s,savedHotels:{...s.savedHotels,[owner]:listId===null?ids.filter(id=>id!==hotelId):[...new Set([...ids,hotelId])]}},owner,{...lib,assignment,notes});
}
export function saveFavoriteList(s:Commerce,owner:string,id:string,name:string,search=s.search):Commerce{
 const lib=favoriteLibrary(s,owner),clean=name.trim().replace(/\s+/g,' ');
 if(!clean||clean.length>60)throw Error('Введите название до 60 символов');
 if(id===INBOX)throw Error('Этот список нельзя переименовать');
 if(lib.lists.some(l=>l.id!==id&&l.name.toLocaleLowerCase('ru')===clean.toLocaleLowerCase('ru')))throw Error('Список с таким названием уже есть');
 const existing=lib.lists.some(l=>l.id===id);
 return write(s,owner,{...lib,lists:existing?lib.lists.map(l=>l.id===id?{...l,name:clean}:l):[...lib.lists,{id,name:clean,search:copySearch(search)}]});
}
export function deleteFavoriteList(s:Commerce,owner:string,id:string):Commerce{
 if(id===INBOX)throw Error('Этот список нельзя удалить');
 const lib=favoriteLibrary(s,owner);
 return write(s,owner,{...lib,lists:lib.lists.filter(l=>l.id!==id),assignment:Object.fromEntries(Object.entries(lib.assignment).map(([hotel,list])=>[hotel,list===id?INBOX:list])),selectedId:lib.selectedId===id?INBOX:lib.selectedId});
}
export function saveFavoriteNote(s:Commerce,owner:string,hotelId:string,note:string):Commerce{
 if(!s.savedHotels?.[owner]?.includes(hotelId))throw Error('Отель больше не в избранном');
 if(note.length>1000)throw Error('Не больше 1000 символов');
 const lib=favoriteLibrary(s,owner),notes={...lib.notes};
 if(note.trim())notes[hotelId]=note.trim();else delete notes[hotelId];
 return write(s,owner,{...lib,notes});
}
export function saveFavoriteSearch(s:Commerce,owner:string,listId:string,search:Search):Commerce{
 const error=searchError(search);if(error)throw Error(error);
 const lib=favoriteLibrary(s,owner);if(!lib.lists.some(l=>l.id===listId))throw Error('Список не найден');
 return write(s,owner,{...lib,lists:lib.lists.map(l=>l.id===listId?{...l,search:copySearch(search)}:l)});
}
export function startFavoriteBooking(s:Commerce,owner:string,listId:string,hotelId:string,id:string):Commerce{
 const lib=favoriteLibrary(s,owner),list=lib.lists.find(l=>l.id===listId);
 if(!list||!favoriteItems(s,owner,listId).includes(hotelId))throw Error('Отель не найден в списке');
 const hotel=catalog.hotels.find(h=>h.id===hotelId);if(!hotel)throw Error('Отель не найден');
 const next=startDraft({...s,search:{...list.search,city:hotel.city},searchFilters:[]},hotelId,id,owner);
 return {...next,search:s.search,searchFilters:s.searchFilters,draft:{...next.draft!,returnTo:'favorite-list',favoriteListId:listId}};
}
export function favoriteOffers(s:Commerce,owner:string,listId:string){return favoriteItems(s,owner,listId).flatMap<{hotel:typeof catalog.hotels[number];quote:ReturnType<typeof quoteDraft>|null}>(id=>{
 const hotel=catalog.hotels.find(h=>h.id===id);if(!hotel)return [];
 try{return [{hotel,quote:quoteDraft(startFavoriteBooking(s,owner,listId,id,'preview'),owner)}];}
 catch{return [{hotel,quote:null}];}
});}
