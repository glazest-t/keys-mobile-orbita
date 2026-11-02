import {useEffect,useRef,useState} from 'react';
import {load} from '@2gis/mapgl';
import type {Map as MapGL,HtmlMarker} from '@2gis/mapgl/types';
import {locationBounds,type Coordinates} from './locations';
import './maps.css';

type SDK=Awaited<ReturnType<typeof load>>;
let sdkPromise:Promise<SDK>|undefined;
function loadSDK(){
 if(!sdkPromise)sdkPromise=load('https://mapgl.2gis.com/api/js/v1').catch(error=>{sdkPromise=undefined;throw error;});
 return sdkPromise;
}
export type MapPoint={id:string;coordinates:number[];label:string;name:string;discountPercent?:number};
type Props={points:MapPoint[];center:Coordinates;selected?:string;onSelect?:(id:string)=>void;interactive?:boolean;expanded?:boolean;missing?:number;label?:string};
export function TwoGisMap({points,center,selected,onSelect,interactive=true,expanded=false,missing=0,label='Карта 2ГИС'}:Props){
 const canvas=useRef<HTMLDivElement>(null), mapRef=useRef<MapGL|null>(null), sdk=useRef<SDK|null>(null);
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading'),[retry,setRetry]=useState(0);
 const markers=useRef<{marker:HtmlMarker;button:HTMLButtonElement;id:string}[]>([]);
 const selectRef=useRef(onSelect);selectRef.current=onSelect;
 const initialCenter=useRef(center);initialCenter.current=center;
 const markerKey=JSON.stringify(points);
 useEffect(()=>{
  let disposed=false,observer:ResizeObserver|undefined,timer:ReturnType<typeof setTimeout>;
  setStatus('loading');
  const key=import.meta.env.VITE_2GIS_MAP_KEY;
  if(!key){setStatus('error');return;}
  timer=setTimeout(()=>{if(!disposed){sdkPromise=undefined;setStatus('error');}},18000);
  loadSDK().then(api=>{
   if(disposed||!canvas.current)return;
   sdk.current=api;
   const map=new api.Map(canvas.current,{key,lang:'ru',center:initialCenter.current,zoom:12,zoomControl:false,
    styleOptions:{stylePath:new URL(import.meta.env.BASE_URL+'maps/keys-light.json',window.location.origin).href,iconsPath:'https://disk.2gis.com/styles/assets/icons/',fontsPath:'https://mapgl.2gis.com/api/fonts/',modelsPath:'https://disk.2gis.com/styles/assets/models/'},
    disableZoomOnScroll:!interactive,disableDragging:!interactive,disablePitchByUserInteraction:true,disableRotationByUserInteraction:true,
    copyright:'bottomLeft',controlsLayoutPadding:{left:6,right:6,bottom:6,top:6},defaultBackgroundColor:'#F4F3FA'});
   mapRef.current=map;
   map.on('styleload',()=>{if(!disposed){clearTimeout(timer);setStatus('ready');}});
   map.on('styleloaderror',()=>{if(!disposed){clearTimeout(timer);setStatus('error');}});
   map.on('error',event=>{if(!disposed&&['invalidtilekey','webglcontextlost'].includes(event.type)){clearTimeout(timer);setStatus('error');}});
   observer=new ResizeObserver(()=>{if(!disposed)map.invalidateSize();});observer.observe(canvas.current);
  }).catch(()=>{if(!disposed){clearTimeout(timer);setStatus('error');}});
  return()=>{disposed=true;clearTimeout(timer);observer?.disconnect();markers.current.forEach(m=>m.marker.destroy());markers.current=[];mapRef.current?.destroy();mapRef.current=null;};
 },[retry,interactive]);
 useEffect(()=>{
  const map=mapRef.current,api=sdk.current;if(status!=='ready'||!map||!api)return;
  markers.current.forEach(m=>m.marker.destroy());
  markers.current=points.map(point=>{
   const button=document.createElement('button');button.type='button';button.className='gis-price-pin';
   button.textContent=point.label;
   if(point.discountPercent&&point.discountPercent>0){const badge=document.createElement('span');badge.className='gis-pin-discount';badge.textContent='−'+point.discountPercent+'%';button.prepend(badge);button.classList.add('has-discount');}
   button.setAttribute('aria-label',point.name+' · '+point.label+(point.discountPercent?' · скидка '+point.discountPercent+'%':''));button.dataset.hotelId=point.id;
   button.onclick=()=>selectRef.current?.(point.id);
   const marker=new api.HtmlMarker(map,{coordinates:point.coordinates,html:button,anchor:[0,0],interactive:true,zIndex:1});
   return {marker,button,id:point.id};
  });
  const bounds=locationBounds(points.map(p=>p.coordinates));
  if(bounds&&points.length>1)map.fitBounds(bounds,{padding:{top:40,bottom:48,left:55,right:55},maxZoom:16,animation:{duration:0}});
  else {map.setCenter(points[0]?.coordinates||center,{duration:0});map.setZoom(points.length?15:11,{duration:0});}
 },[status,markerKey,center[0],center[1]]);
 useEffect(()=>{markers.current.forEach(({button,marker,id})=>{const active=id===selected;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));marker.setZIndex(active?3:1);});},[selected,status,markerKey]);
 return <div className={'gis-map '+(expanded?'gis-map-expanded':'')} aria-label={label} data-map-status={status} data-scroll-drag={interactive?'ignore':undefined} onPointerDown={interactive?event=>event.stopPropagation():undefined}>
  <div className="gis-canvas" ref={canvas}/>
  {status==='loading'&&<div className="gis-state" role="status"><span className="gis-spinner"/>Загружаем карту</div>}
  {status==='error'&&<div className="gis-state gis-error" role="status"><strong>Карта недоступна</strong><span>Попробуйте загрузить ещё раз</span><button type="button" onClick={()=>setRetry(v=>v+1)}>Повторить</button></div>}
  {status==='ready'&&missing>0&&points.length===0&&<div className="gis-missing">Адрес отеля уточняется</div>}
  {status==='ready'&&interactive&&<div className="gis-zoom"><button type="button" aria-label="Приблизить карту" onClick={()=>{const m=mapRef.current;if(m)m.setZoom(m.getZoom()+1);}}>+</button><button type="button" aria-label="Отдалить карту" onClick={()=>{const m=mapRef.current;if(m)m.setZoom(m.getZoom()-1);}}>−</button></div>}
 </div>;
}
