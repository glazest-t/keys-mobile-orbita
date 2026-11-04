export type RouteCoordinates=[number,number];
export type TravelMode='taxi'|'driving'|'transit'|'walking';
export type RouteOriginPoint={coordinates:RouteCoordinates;name:string};
export type HotelRoute={segments:number[][][];distance:number;duration:number};
const originCache=new Map<string,RouteOriginPoint>();
const routeCache=new Map<string,{time:number;route:HotelRoute}>();
const cacheKey='keys-route-cache-v1';
function savedRoute(id:string):{time:number;route:HotelRoute}|undefined{
 try{const entry=JSON.parse(sessionStorage.getItem(cacheKey)||'{}')[id];if(entry&&Date.now()-entry.time<300000&&Array.isArray(entry.route?.segments)&&entry.route.segments.length)return entry;}catch{/* Storage may be disabled. */}
}
function saveRoute(id:string,route:HotelRoute){
 try{const previous=JSON.parse(sessionStorage.getItem(cacheKey)||'{}');const entries=Object.entries(previous).filter(([,entry])=>Date.now()-(entry as {time:number}).time<300000).slice(-19);sessionStorage.setItem(cacheKey,JSON.stringify({...Object.fromEntries(entries),[id]:{time:Date.now(),route}}));}catch{/* In-memory cache still works. */}
}
export function coordinateOrigin(text:string):RouteOriginPoint|undefined{
 const match=text.match(/(?:^|·\s*)(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
 if(!match)return;
 const lat=Number(match[1]),lon=Number(match[2]);
 if(Math.abs(lat)>90||Math.abs(lon)>180)return;
 return {coordinates:[lon,lat],name:text.startsWith('Моё местоположение')?'Моё местоположение':text};
}
async function api(url:string,key:string,signal:AbortSignal,body?:unknown){
 if(!key)throw Error('Расчёт маршрута пока недоступен');
 const response=await fetch(url+(url.includes('?')?'&':'?')+'key='+encodeURIComponent(key),{signal:AbortSignal.any([signal,AbortSignal.timeout(18000)]),...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
 if(!response.ok)throw Error(response.status===429?'Сервис маршрутов временно занят. Попробуйте позже.':'Не удалось рассчитать маршрут. Попробуйте ещё раз.');
 return response.json();
}
export async function resolveRouteOrigin(text:string,city:string,key:string,signal:AbortSignal):Promise<RouteOriginPoint>{
 const coordinates=coordinateOrigin(text);if(coordinates)return coordinates;
 const id=city+'|'+text,cached=originCache.get(id);if(cached)return cached;
 const q=text.toLocaleLowerCase().includes(city.toLocaleLowerCase())?text:`${city}, ${text}`;
 const params=new URLSearchParams({q,fields:'items.point',page_size:'5'});
 const data=await api('https://catalog.api.2gis.com/3.0/items?'+params,key,signal);
 const item=data.result?.items?.find((item:{point?:{lon:number;lat:number}})=>Number.isFinite(item.point?.lon)&&Number.isFinite(item.point?.lat));
 if(!item)throw Error('Не нашли точку отправления. Укажите более точный адрес.');
 const result:RouteOriginPoint={coordinates:[item.point.lon,item.point.lat],name:[item.name,item.address_name].filter(Boolean).join(', ')};
 originCache.set(id,result);return result;
}
export function parseLineString(value:unknown):number[][]{
 if(typeof value!=='string')return [];
 const match=value.match(/^LINESTRING\s*\(([^)]+)\)$/i);if(!match)return [];
 const points=match[1].split(',').map(pair=>pair.trim().split(/\s+/).map(Number));
 return points.length>1&&points.every(p=>p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90)?points:[];
}
type Geometry={selection?:string};
type RouteResponse={total_distance:number;total_duration:number;begin_pedestrian_path?:{geometry:Geometry};end_pedestrian_path?:{geometry:Geometry};maneuvers?:{outcoming_path?:{geometry:Geometry[]}}[];movements?:{alternatives?:{geometry?:Geometry[]}[]}[]};
export function parseHotelRoute(data:unknown,mode:TravelMode):HotelRoute{
 const rows=(mode==='transit'?data:(data as {result?:unknown})?.result) as RouteResponse[]|undefined;
 const routes=Array.isArray(rows)?rows.filter(r=>Number.isFinite(r.total_duration)&&r.total_duration>0&&Number.isFinite(r.total_distance)&&r.total_distance>=0).sort((a,b)=>a.total_duration-b.total_duration):[];
 for(const r of routes){
  const geometry=mode==='transit'?r.movements?.flatMap(m=>m.alternatives?.[0]?.geometry||[])||[]:[r.begin_pedestrian_path?.geometry,...(r.maneuvers?.flatMap(m=>m.outcoming_path?.geometry||[])||[]),r.end_pedestrian_path?.geometry];
  const segments=geometry.flatMap(g=>{const line=parseLineString(g?.selection);return line.length?[line]:[];});
  if(segments.length)return {segments,distance:r.total_distance,duration:r.total_duration};
 }
 throw Error('Не удалось найти маршрут этим способом. Выберите другой транспорт или точку отправления.');
}
export function routeRequest(from:RouteCoordinates,to:RouteCoordinates,mode:TravelMode){
 const point=(c:RouteCoordinates)=>({lon:c[0],lat:c[1]});
 return mode==='transit'?{endpoint:'public_transport/2.0',body:{source:{point:point(from)},target:{point:point(to)},transport:['bus','shuttle_bus','trolleybus','tram','metro','suburban_train','aeroexpress','pedestrian','mcc','mcd'],locale:'ru'}}:{endpoint:'routing/7.0.0/global',body:{points:[from,to].map(c=>({...point(c),type:'walking'})),transport:mode,output:'detailed',locale:'ru'}};
}
export async function fetchHotelRoute(from:RouteCoordinates,to:RouteCoordinates,mode:TravelMode,key:string,signal:AbortSignal):Promise<HotelRoute>{
 const id=JSON.stringify([from,to,mode]),cached=routeCache.get(id);if(cached&&Date.now()-cached.time<300000)return cached.route;
 const stored=savedRoute(id);if(stored){routeCache.set(id,stored);return stored.route;}
 const request=routeRequest(from,to,mode);
 const data=await api('https://routing.api.2gis.com/'+request.endpoint,key,signal,request.body),route=parseHotelRoute(data,mode);
 routeCache.set(id,{time:Date.now(),route});saveRoute(id,route);return route;
}
export function routeDuration(seconds:number){const minutes=Math.max(1,Math.ceil(seconds/60));return minutes<60?`${minutes} мин`:`${Math.floor(minutes/60)} ч${minutes%60?` ${minutes%60} мин`:''}`;}
export function routeDistance(meters:number){return meters<1000?`${Math.round(meters)} м`:`${(meters/1000).toLocaleString('ru-RU',{maximumFractionDigits:1})} км`;}
