import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {IconButton} from '../ui';
import './review-photos.css';

export function ReviewPhotos({photos=[],author}:{photos?:string[];author:string}){
 const [selected,setSelected]=useState<number|null>(null);
 if(!photos.length)return null;
 const change=(direction:number)=>setSelected(index=>index===null?null:(index+direction+photos.length)%photos.length);
 return <><section className="review-photo-strip" aria-label={`Фотографии к отзыву: ${author}`}>
  {photos.map((src,index)=><button type="button" key={src} aria-label={`Фото ${index+1} к отзыву: ${author}`} onClick={()=>setSelected(index)}><img src={src} alt="" loading="lazy"/></button>)}
 </section><BottomSheet open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}} title={`Фото к отзыву · ${author}`} snap={.85}>
  {selected!==null&&<div className="review-photo-viewer"><img src={photos[selected]} alt={`Фото ${selected+1} к отзыву: ${author}`}/>{photos.length>1&&<div><IconButton name="back" label="Предыдущее фото отзыва" onClick={()=>change(-1)}/><span aria-live="polite">{selected+1} / {photos.length}</span><IconButton name="chevron-right" label="Следующее фото отзыва" onClick={()=>change(1)}/></div>}</div>}
 </BottomSheet></>;
}
