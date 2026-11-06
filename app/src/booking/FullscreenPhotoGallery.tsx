import {BottomSheet} from '../mobile';
import {IconButton} from '../ui';

export function FullscreenPhotoGallery({title,photos,selected,onSelect,subject}:{title:string;photos:{src:string;label:string}[];selected:number|null;onSelect:(index:number|null)=>void;subject:'отеля'|'номера'}){
 const change=(direction:number)=>{if(selected!==null)onSelect((selected+direction+photos.length)%photos.length);};
 return <BottomSheet open={selected!==null} onOpenChange={open=>{if(!open)onSelect(null);}} title={title}>
  <div className="desktop-photo-gallery" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();change(event.key==='ArrowLeft'?-1:1);}}}>
   {selected!==null&&<><div className="desktop-photo-gallery-stage">
    <img src={photos[selected].src} alt={photos[selected].label}/>
    {photos.length>1&&<><IconButton name="back" label={`Предыдущее фото ${subject}`} onClick={()=>change(-1)}/><IconButton name="chevron-right" label={`Следующее фото ${subject}`} onClick={()=>change(1)}/></>}
   </div><div className="desktop-photo-gallery-footer"><span aria-live="polite">{selected+1} / {photos.length}</span><div className="desktop-photo-gallery-thumbnails" aria-label={`Фотографии ${subject}`}>
    {photos.map((photo,index)=><button type="button" key={photo.src} aria-label={`Показать фото ${index+1}`} aria-pressed={selected===index} onClick={()=>onSelect(index)}><img src={photo.src} alt=""/></button>)}
   </div></div></>}
  </div>
 </BottomSheet>;
}
