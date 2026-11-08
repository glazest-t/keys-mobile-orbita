import {Icon} from '../ui';
import {iconAsset} from '../iconAssets';
import {usePrototypeIcons} from '../usePrototypeIcons';
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {load} from '@2gis/mapgl';
import type {Map as MapGL,HtmlMarker,Polyline} from '@2gis/mapgl/types';
import {locationBounds,type Coordinates} from './locations';
import './maps.css';

type SDK=Awaited<ReturnType<typeof load>>;
let sdkPromise:Promise<SDK>|undefined;
function loadSDK(){
 if(!sdkPromise)sdkPromise=load('https://mapgl.2gis.com/api/js/v1').catch(error=>{sdkPromise=undefined;throw error;});
 return sdkPromise;
}
export type MapPoint={id:string;coordinates:number[];label:string;name:string;discountPercent?:number;icon?:string;markerOffset?:number[]};
type Props={route?:number[][][];points:MapPoint[];center:Coordinates;selected?:string;onSelect?:(id:string)=>void;onHover?:(id:string)=>void;onPreviewDismiss?:()=>void;onVisibleChange?:(ids:string[])=>void;preview?:ReactNode;interactive?:boolean;expanded?:boolean;missing?:number;label?:string};
export function TwoGisMap({points,route,center,selected,onSelect,onHover,onPreviewDismiss,onVisibleChange,preview,interactive=true,expanded=false,missing=0,label='Карта 2ГИС'}:Props){
 const iconVariant=usePrototypeIcons();
 const canvas=useRef<HTMLDivElement>(null), mapRef=useRef<MapGL|null>(null), sdk=useRef<SDK|null>(null);
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading'),[retry,setRetry]=useState(0);
 const markers=useRef<{marker:HtmlMarker;button:HTMLButtonElement;id:string}[]>([]);
 const selectRef=useRef(onSelect);selectRef.current=onSelect;
 const hoverRef=useRef(onHover);hoverRef.current=onHover;
 const dismissRef=useRef(onPreviewDismiss);dismissRef.current=onPreviewDismiss;
 const closeTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const keepPreview=()=>{clearTimeout(closeTimer.current);};
 const schedulePreviewClose=()=>{keepPreview();closeTimer.current=setTimeout(()=>{if(previewElement.current?.matches(':hover')||markers.current.some(m=>m.button.matches(':hover')))return;dismissRef.current?.();},150);};
 useEffect(()=>()=>clearTimeout(closeTimer.current),[]);
 const visibleRef=useRef(onVisibleChange);visibleRef.current=onVisibleChange;
 const pointsRef=useRef(points);pointsRef.current=points;
 const viewportChanged=useRef(false);
 const initialCenter=useRef(center);initialCenter.current=center;
 const markerKey=JSON.stringify(points),routeKey=JSON.stringify(route||[]);
 const routeRef=useRef(route);routeRef.current=route;
 const lines=useRef<Polyline[]>([]);
 const previewElement=useRef<HTMLDivElement>(null);
 const [previewPosition,setPreviewPosition]=useState<{left:number;top:number;above:boolean}|null>(null);
 useLayoutEffect(()=>{
  const map=mapRef.current,container=canvas.current;
  if(!preview||!selected||status!=='ready'||!map||!container){setPreviewPosition(null);return;}
  let frame=0;
  const measure=()=>{
   const marker=markers.current.find(m=>m.id===selected)?.button,popup=previewElement.current;
   if(!marker||!popup)return;
   const box=container.getBoundingClientRect(),pin=marker.getBoundingClientRect();
   const width=popup.offsetWidth,height=popup.offsetHeight;
   const left=Math.max(12,Math.min(box.width-width-12,pin.left-box.left+pin.width/2-width/2));
   const above=pin.top-box.top>=height+22;
   setPreviewPosition({left,top:above?pin.top-box.top-10:pin.bottom-box.top+10,above});
  };
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  update();map.on('move',update);
  const observer=new ResizeObserver(update);observer.observe(container);
  if(previewElement.current)observer.observe(previewElement.current);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();map.off('move',update);};
 },[selected,status,markerKey,!!preview]);
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
   mapRef.current=map;viewportChanged.current=false;
   map.on('moveend',event=>{if(disposed)return;if(event.isUser)viewportChanged.current=true;if(viewportChanged.current){const bounds=map.getBounds();visibleRef.current?.(pointsRef.current.filter(p=>bounds.containsPoint(p.coordinates)).map(p=>p.id));}});
   map.on('styleload',()=>{if(!disposed){clearTimeout(timer);setStatus('ready');}});
   map.on('styleloaderror',()=>{if(!disposed){clearTimeout(timer);setStatus('error');}});
   map.on('error',event=>{if(!disposed&&['invalidtilekey','webglcontextlost'].includes(event.type)){clearTimeout(timer);setStatus('error');}});
   observer=new ResizeObserver(()=>{if(!disposed)map.invalidateSize();});observer.observe(canvas.current);
  }).catch(()=>{if(!disposed){clearTimeout(timer);setStatus('error');}});
  return()=>{disposed=true;clearTimeout(timer);observer?.disconnect();markers.current.forEach(m=>m.marker.destroy());markers.current=[];lines.current.forEach(line=>line.destroy());lines.current=[];mapRef.current?.destroy();mapRef.current=null;};
 },[retry,interactive]);
 useEffect(()=>{
  const map=mapRef.current,api=sdk.current;if(status!=='ready'||!map||!api)return;
  markers.current.forEach(m=>m.marker.destroy());
  markers.current=points.map(point=>{
   const button=document.createElement('button');button.type='button';button.className='gis-price-pin';
   button.textContent=point.label;
   if(point.icon&&['spa','hotel-building','pin','park','museum'].includes(point.icon)){const icon=document.createElement('span');icon.className='gis-place-icon';icon.style.maskImage=`url(${iconAsset(point.icon,iconVariant)})`;button.replaceChildren(icon);button.classList.add('gis-place-pin');}
   if(point.discountPercent&&point.discountPercent>0){const badge=document.createElement('span');badge.className='gis-pin-discount';badge.textContent='−'+point.discountPercent+'%';button.prepend(badge);button.classList.add('has-discount');}
   button.setAttribute('aria-label',point.name+' · '+point.label+(point.discountPercent?' · скидка '+point.discountPercent+'%':''));button.dataset.hotelId=point.id;
   button.onclick=()=>{keepPreview();selectRef.current?.(point.id);};
   // Preview markers remain tappable without letting the SDK cancel page panning.
   if(!interactive){button.ontouchstart=event=>event.stopPropagation();button.ontouchmove=event=>event.stopPropagation();}
   button.onpointerenter=()=>{keepPreview();hoverRef.current?.(point.id);};
   button.onpointerleave=schedulePreviewClose;
   button.onfocus=()=>{keepPreview();hoverRef.current?.(point.id);};
   button.onblur=schedulePreviewClose;
   const marker=new api.HtmlMarker(map,{coordinates:point.coordinates,html:button,anchor:point.markerOffset||[0,0],interactive:true,zIndex:1});
   return {marker,button,id:point.id};
  });
  viewportChanged.current=false;
  const bounds=locationBounds([...points.map(p=>p.coordinates),...(routeRef.current?.flat()||[])]);
  if(bounds&&(points.length>1||routeRef.current?.length))map.fitBounds(bounds,{padding:routeRef.current?.length?{top:100,bottom:60,left:55,right:70}:{top:40,bottom:48,left:55,right:55},maxZoom:16,animation:{duration:0}});
  else {map.setCenter(points[0]?.coordinates||center,{duration:0});map.setZoom(points.length?15:11,{duration:0});}
 },[status,markerKey,routeKey,center[0],center[1]]);
 useEffect(()=>{
  // Changing the icon family must not reset the current map position or zoom.
  markers.current.forEach(({button,id})=>{
   const name=pointsRef.current.find(p=>p.id===id)?.icon;
   const icon=button.querySelector<HTMLElement>('.gis-place-icon');
   if(name&&icon)icon.style.maskImage=`url(${iconAsset(name,iconVariant)})`;
  });
 },[iconVariant]);
 useEffect(()=>{
  const map=mapRef.current,api=sdk.current;if(status!=='ready'||!map||!api)return;
  lines.current.forEach(line=>line.destroy());
  lines.current=(routeRef.current||[]).flatMap(coordinates=>[new api.Polyline(map,{coordinates,color:'#ffffff',width:9,zIndex:10}),new api.Polyline(map,{coordinates,color:'#2F5BFF',width:5,zIndex:11})]);
 },[status,routeKey]);
 useEffect(()=>{markers.current.forEach(({button,marker,id})=>{const active=id===selected;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));marker.setZIndex(active?3:1);});},[selected,status,markerKey,routeKey]);
 return <div className={'gis-map '+(expanded?'gis-map-expanded':'')+(!interactive?' gis-map-static':'')} aria-label={label} data-map-status={status} data-route-segments={route?.length||0} data-scroll-drag={interactive?'ignore':undefined} onPointerDown={interactive?event=>event.stopPropagation():undefined}>
  <div className="gis-canvas" ref={canvas}/>
  {preview&&<div ref={previewElement} className="gis-marker-preview" onPointerEnter={keepPreview} onPointerLeave={schedulePreviewClose} onFocusCapture={keepPreview} onBlurCapture={schedulePreviewClose} data-placement={previewPosition?.above?'above':'below'} style={{left:previewPosition?.left,top:previewPosition?.top,visibility:previewPosition?'visible':'hidden'}}>{preview}</div>}
  {status==='loading'&&<div className="gis-state" role="status"><span className="gis-spinner"/>Загружаем карту</div>}
  {status==='error'&&<div className="gis-state gis-error" role="status"><strong>Карта недоступна</strong><span>Попробуйте загрузить ещё раз</span><button type="button" onClick={()=>setRetry(v=>v+1)}>Повторить</button></div>}
  {status==='ready'&&missing>0&&points.length===0&&<div className="gis-missing">Адрес отеля уточняется</div>}
  {status==='ready'&&interactive&&<div className="gis-zoom"><button type="button" aria-label="Приблизить карту" onClick={()=>{const m=mapRef.current;if(m){viewportChanged.current=true;m.setZoom(m.getZoom()+1);}}}><Icon name="plus" size={20} inheritColor/></button><button type="button" aria-label="Отдалить карту" onClick={()=>{const m=mapRef.current;if(m){viewportChanged.current=true;m.setZoom(m.getZoom()-1);}}}><Icon name="minus" size={20} inheritColor/></button></div>}
 </div>;
}
