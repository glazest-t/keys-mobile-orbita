import {useEffect,useState} from 'react';
import {hotelLocation} from './locations';
import {resolveRouteOrigin,fetchHotelRoute,type HotelRoute,type RouteOriginPoint,type TravelMode,type RouteCoordinates} from './routing';
type State={id:string;loading:boolean;origin?:RouteOriginPoint;route?:HotelRoute;error?:string};
export function useHotelRoute(hotelId:string,city:string,originText:string,mode:TravelMode){
 const [retry,setRetry]=useState(0),[state,setState]=useState<State>({id:'',loading:true});
 const id=JSON.stringify([hotelId,city,originText,mode,retry]);
 useEffect(()=>{
  const controller=new AbortController(),signal=controller.signal;
  const destination=hotelLocation(hotelId)?.coordinates as RouteCoordinates|undefined;
  setState({id,loading:true});
  if(!destination){setState({id,loading:false,error:'Для этого отеля ещё уточняется адрес. Маршрут появится после уточнения.'});return()=>controller.abort();}
  const key=import.meta.env.VITE_2GIS_MAP_KEY;
  (async()=>{
   try{
    const origin=await resolveRouteOrigin(originText,city,key,signal);if(signal.aborted)return;
    setState({id,loading:true,origin});
    const route=await fetchHotelRoute(origin.coordinates,destination,mode,key,signal);
    if(!signal.aborted)setState({id,loading:false,origin,route});
   }catch(e){if(!signal.aborted)setState(previous=>({...previous,id,loading:false,route:undefined,error:(e as Error).name==='TimeoutError'?'Расчёт занял слишком много времени. Попробуйте ещё раз.':(e as Error).message==='Failed to fetch'?'Не удалось связаться с сервисом маршрутов. Проверьте подключение.':(e as Error).message}));}
  })();
  return()=>controller.abort();
 },[id,hotelId,city,originText,mode]);
 return {...(state.id===id?state:{id,loading:true}),retry:()=>setRetry(v=>v+1)};
}
