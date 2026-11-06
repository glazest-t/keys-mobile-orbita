import {useState} from 'react';
import {FullscreenPhotoGallery} from './FullscreenPhotoGallery';
import {Icon,IconButton} from '../ui';
import type {RoomPhoto} from './roomVisuals';

export function RoomPhotoGallery({title,photos}:{title:string;photos:RoomPhoto[]}){
 const [selected,setSelected]=useState<number|null>(null);
 const [preview,setPreview]=useState(0);
 return <><div className="desktop-room-photo-preview">
  <div className="desktop-room-photo-main">
   <button type="button" className="desktop-room-photo-open" onClick={()=>setSelected(preview)} aria-label={`Открыть фото ${preview+1} · ${title}`}><img src={photos[preview].src} alt={photos[preview].label} loading="lazy"/><span className="desktop-room-photo-count"><Icon name="camera" size={16} inheritColor/>{preview+1} / {photos.length}</span></button>
   {photos.length>1&&<div className="desktop-room-photo-arrows"><IconButton name="back" label={`Предыдущее фото · ${title}`} onClick={()=>setPreview((preview-1+photos.length)%photos.length)}/><IconButton name="chevron-right" label={`Следующее фото · ${title}`} onClick={()=>setPreview((preview+1)%photos.length)}/></div>}
  </div>
  <div className="desktop-room-photo-strip" aria-label={`Миниатюры · ${title}`}>
   {photos.slice(0,4).map((photo,index)=>{const more=index===3&&photos.length>4;return <button type="button" key={photo.src} aria-label={more?`Все ${photos.length} фото · ${title}`:`Выбрать фото ${index+1} · ${title}`} aria-pressed={preview===index||(more&&preview>index)} onClick={()=>more?setSelected(preview>=index?preview:index):setPreview(index)}><img src={more&&preview>index?photos[preview].src:photo.src} alt="" loading="lazy"/>{more&&<span>+{photos.length-4}</span>}</button>;})}
  </div>
 </div><FullscreenPhotoGallery title={title} photos={photos} selected={selected} onSelect={setSelected} subject="номера"/></>;
}
