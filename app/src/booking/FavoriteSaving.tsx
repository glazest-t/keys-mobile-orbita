import {createContext,useContext,useState,type ReactNode,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,useKeyboard} from '../mobile';
import {Button,Field,Icon} from '../ui';
import {type Commerce,type Search} from './model';
import {favoriteCountLabel,favoriteLibrary,favoriteItems,saveFavoriteList,setFavorite,INBOX} from './favorites';
import './favorites.css';

const FavoriteSaving=createContext<{toggle:(hotelId:string)=>void;selectList:(id:string)=>void}|null>(null);
export const useFavoriteSaving=()=>useContext(FavoriteSaving);
type StateProps={commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;search?:Search};

export function FavoriteName({initial='',onSave}:{initial?:string;onSave:(name:string)=>void}){
 const [name,setName]=useState(initial),[error,setError]=useState('');
 return <form className="favorite-form" onSubmit={e=>{e.preventDefault();try{onSave(name);}catch(e){setError((e as Error).message);}}}>
  <Field label="Название" maxLength={60} value={name} onChange={e=>{setName(e.target.value);setError('');}} placeholder="Например, море осенью" error={error}/>
  {!initial&&<div className="favorite-suggestions">{['Море осенью','На выходные','С детьми'].map(text=><button key={text} type="button" className="filter-chip" onClick={()=>{setName(text);setError('');}}>{text}</button>)}</div>}
  <Button type="submit" disabled={!name.trim()}>Сохранить</Button>
 </form>;
}

export function FavoriteDestination({commerce,setCommerce,owner,onSelect,search}:{onSelect:(listId:string,next?:Commerce)=>void}&StateProps){
 const [creating,setCreating]=useState(false);
 const lib=favoriteLibrary(commerce,owner);
 return creating?<><p className="muted">Следующие отели попадут сюда же</p><FavoriteName onSave={name=>{const id=crypto.randomUUID(),next=saveFavoriteList(commerce,owner,id,name,search);setCommerce(next);onSelect(id,next);}}/><Button variant="ghost" onClick={()=>setCreating(false)}>К спискам</Button></>:<div className="favorite-destinations">{lib.lists.map(list=><button className="favorite-destination k-surface-action" key={list.id} onClick={()=>onSelect(list.id)}><Icon name="heart" size={20}/><span><strong>{list.name}</strong><small>{favoriteCountLabel(favoriteItems(commerce,owner,list.id).length)}</small></span><Icon name="chevron-right" size={16}/></button>)}<Button variant="secondary" onClick={()=>setCreating(true)}><Icon name="plus" size={18} inheritColor/>Новый список</Button></div>;
}

export function FavoriteSavingProvider({commerce,setCommerce,owner,children,onToast,search}:{children:ReactNode;onToast:(text:string)=>void}&StateProps){
 const [destination,setDestination]=useState<string|null>(null),[pending,setPending]=useState<string|null>(null);
 const keyboard=useKeyboard();
 const choose=(id:string,next=commerce)=>{
  if(!pending)return;setCommerce(setFavorite(next,owner,pending,id));setDestination(id);setPending(null);keyboard.hide();
  onToast('Сохранено в «'+favoriteLibrary(next,owner).lists.find(l=>l.id===id)!.name+'»');
 };
 const toggle=(hotelId:string)=>{
  if(commerce.savedHotels?.[owner]?.includes(hotelId)){setCommerce(s=>setFavorite(s,owner,hotelId,null));onToast('Отель удалён из избранного');return;}
  if(destination&&favoriteLibrary(commerce,owner).lists.some(l=>l.id===destination)){
   setCommerce(s=>setFavorite(s,owner,hotelId,destination));onToast('Сохранено в «'+favoriteLibrary(commerce,owner).lists.find(l=>l.id===destination)!.name+'»');
  }else {keyboard.hide();setPending(hotelId);}
 };
 return <FavoriteSaving.Provider value={{toggle,selectList:setDestination}}>{children}<BottomSheet open={!!pending} onOpenChange={open=>{if(!open){keyboard.hide();setPending(null);}}} title="Сохранить в список" snap={.72}><div className="sheet-body favorite-sheet">{pending&&<FavoriteDestination key={pending} commerce={commerce} setCommerce={setCommerce} owner={owner} search={search} onSelect={choose}/>}</div></BottomSheet></FavoriteSaving.Provider>;
}

// Compatibility for callers outside the application provider.
export function toggleFavorite(s:Commerce,owner:string|null,id:string){const key=owner||'guest';return setFavorite(s,key,id,s.savedHotels?.[key]?.includes(id)?null:INBOX);}
