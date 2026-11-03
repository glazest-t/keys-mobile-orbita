import {catalog,searchError,type Search} from './model';
export type SharedFavoriteList={version:1;name:string;hotelIds:string[];search:Search};
export function favoriteShareUrl(value:SharedFavoriteList){
 const url=new URL(window.location.href);url.search='';url.hash='favorites';
 url.searchParams.set('favoriteShare',JSON.stringify(value));return url.href;
}
export function readFavoriteShare(url:string):SharedFavoriteList|null{
 try{
  const raw=new URL(url).searchParams.get('favoriteShare');if(!raw||raw.length>12000)return null;
  const v=JSON.parse(raw);
  if(v.version!==1||typeof v.name!=='string'||!v.name.trim()||v.name.length>60||!Array.isArray(v.hotelIds)||v.hotelIds.length>200||!v.search||searchError(v.search))return null;
  const hotelIds=[...new Set<string>(v.hotelIds.filter((id:unknown)=>typeof id==='string'&&catalog.hotels.some(h=>h.id===id)))];
  return {version:1,name:v.name,hotelIds,search:v.search};
 }catch{return null;}
}
