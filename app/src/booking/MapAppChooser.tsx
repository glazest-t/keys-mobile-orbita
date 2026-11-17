import {useState} from 'react';
import {CopyIcon} from '@radix-ui/react-icons';
import {useNovember} from '../usePrototypeVariant';
import {BottomSheet} from '../mobile';
import {Icon} from '../ui';
import {catalog} from './model';
import {hotelVisual} from './presentation';
import {hotelLocation,twoGisPlaceUrl} from '../maps/locations';

export function MapAppChooser({hotelId,onClose,copyableAddress}:{hotelId:string|null;onClose:()=>void;copyableAddress?:string}){
 const [copyStatus,setCopyStatus]=useState('');
 const hotel=catalog.hotels.find(h=>h.id===hotelId),place=hotelId?hotelLocation(hotelId):undefined;
 const v=hotelId?hotelVisual(hotelId):null;
 const destination=place?`${place.coordinates[1]},${place.coordinates[0]}`:hotel?`${hotel.city}, ${v?.address}, ${hotel.name}`:'';
 const links=[
  {name:'Яндекс Карты',icon:'yandex.svg',url:'https://yandex.ru/maps/?'+new URLSearchParams({rtext:'~'+destination,rtt:'auto'})},
  {name:'2ГИС',icon:'2gis.png',url:place?`https://2gis.ru/routeSearch/rsType/car/to/${place.coordinates[0]},${place.coordinates[1]}`:hotelId?twoGisPlaceUrl(hotelId):undefined},
  {name:'Google Карты',icon:'google.ico',url:'https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',destination})},
  ...(/iPhone|iPad|Mac/i.test(navigator.userAgent)?[{name:'Карты Apple',icon:'apple.png',url:'https://maps.apple.com/?'+new URLSearchParams({daddr:destination})}]:[]),
 ];
 const address=copyableAddress||[hotel?.city,place?.address||v?.address].filter(Boolean).join(', ');
 const close=()=>{setCopyStatus('');onClose();};
 const copyAddress=async()=>{
  if(!address)return;
  try{
   await navigator.clipboard.writeText(address);
   setCopyStatus('Адрес скопирован');
  }catch{
   setCopyStatus('Выделите адрес, чтобы скопировать его вручную');
  }
 };
 return <BottomSheet open={!!hotel} onOpenChange={open=>{if(!open)close();}} title={copyableAddress?'Адрес отеля':'Открыть маршрут'} snap={copyableAddress?.8:.58}>
  <div className="sheet-body november-map-apps">
   <div className="november-map-address">
    <span>{address}</span>
    {address&&<button type="button" className="map-address-copy" aria-label="Скопировать адрес" title="Скопировать адрес" onClick={copyAddress}>
     <CopyIcon width={20} height={20} aria-hidden="true"/>
    </button>}
   </div>
   {address&&<p className="map-address-status" role="status">{copyStatus}</p>}
   {links.filter(l=>l.url).map(l=><a key={l.name} href={l.url} target="_blank" rel="noreferrer" onClick={close}>
    <span className={"november-map-app-icon "+(l.icon==='apple.png'?'apple':'')}><img src={import.meta.env.BASE_URL+'brand/map-apps/'+l.icon} alt=""/></span>
    <strong>{l.name}</strong><Icon name="chevron-right" size={18} inheritColor/>
   </a>)}
  </div>
 </BottomSheet>;
}
export function useHotelRoute(hotelId:string,fallback:()=>void){
 const november=useNovember(),[open,setOpen]=useState(false);
 return {openRoute:()=>november?setOpen(true):fallback(),routeSheet:<MapAppChooser hotelId={open?hotelId:null} onClose={()=>setOpen(false)}/>};
}
