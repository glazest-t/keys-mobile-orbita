import {useLayoutEffect,type RefObject} from 'react';

type Tone='light'|'dark';

function linearColor(value:number){
 const srgb=value/255;
 return srgb<=.04045?srgb/12.92:((srgb+.055)/1.055)**2.4;
}

function photoTone(context:CanvasRenderingContext2D,photos:HTMLImageElement[],area:DOMRect):Tone|undefined{
 const center=area.left+area.width/2;
 for(const photo of photos){
  if(!photo.complete||!photo.naturalWidth)continue;
  const rect=photo.getBoundingClientRect();
  if(center<rect.left||center>=rect.right||area.top<rect.top||area.bottom>rect.bottom)continue;
  const source=new URL(photo.currentSrc);
  if(!photo.crossOrigin&&source.origin!==location.origin&&source.protocol!=='data:')return;

  // The preview uses object-fit: cover, so sample the visible crop.
  const scale=Math.max(rect.width/photo.naturalWidth,rect.height/photo.naturalHeight);
  const left=Math.max(area.left,rect.left);
  const right=Math.min(area.right,rect.right);
  const x=(left-rect.left+(photo.naturalWidth*scale-rect.width)/2)/scale;
  const y=(area.top-rect.top+(photo.naturalHeight*scale-rect.height)/2)/scale;
  const {width,height}=context.canvas;
  try{
   context.drawImage(photo,x,y,(right-left)/scale,area.height/scale,0,0,width,height);
   const {data}=context.getImageData(0,0,width,height);
   const brightness:number[]=[];
   for(let i=0;i<data.length;i+=4){
    brightness.push(.2126*linearColor(data[i])+.7152*linearColor(data[i+1])+.0722*linearColor(data[i+2]));
   }
   brightness.sort((a,b)=>a-b);
   const darkContrast=(brightness[Math.floor(brightness.length*.25)]+.05)/.05;
   const lightContrast=1.05/(brightness[Math.floor(brightness.length*.75)]+.05);
   return darkContrast>=lightContrast?'dark':'light';
  }catch{
   // If pixel access is blocked, the status bar uses the current theme's color.
   context.canvas.width=width;
   return undefined;
  }
 }
}

export function useHotelPhotoStatus(heroRef:RefObject<HTMLDivElement|null>,bodyRef:RefObject<HTMLDivElement|null>,safeAreaTop:number){
 useLayoutEffect(()=>{
  const hero=heroRef.current,body=bodyRef.current;
  const scroll=hero?.closest<HTMLElement>('.mobile-scroll');
  const screen=hero?.closest('.device-screen');
  if(!hero||!body||!scroll||!screen)return;

  const time=screen.querySelector('.status-time');
  const indicators=screen.querySelector('.status-indicators');
  const canvas=document.createElement('canvas');
  canvas.width=16;
  canvas.height=6;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  let frame=0;
  const update=()=>{
   frame=0;
   const viewport=scroll.getBoundingClientRect();
   const safeAreaEnd=viewport.top+safeAreaTop*viewport.height/scroll.clientHeight;
   const photoArea=hero.getBoundingClientRect();
   const active=photoArea.top<=viewport.top+1&&body.getBoundingClientRect().top>=safeAreaEnd;
   hero.toggleAttribute('data-photo-behind-status',active);
   if(!active||!time||!indicators)return;

   const photos=Array.from(hero.querySelectorAll<HTMLImageElement>('.hotel-hero-track .hero-photo img'));
   const timeTone=context&&photoTone(context,photos,time.getBoundingClientRect());
   const iconsTone=context&&photoTone(context,photos,indicators.getBoundingClientRect());
   hero.dataset.photoStatusTime=timeTone??'';
   hero.dataset.photoStatusIcons=iconsTone??'';
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  update();
  scroll.addEventListener('scroll',schedule,{passive:true});
  hero.addEventListener('scroll',schedule,{capture:true,passive:true});
  hero.addEventListener('load',schedule,true);
  window.addEventListener('resize',schedule);
  return ()=>{
   cancelAnimationFrame(frame);
   scroll.removeEventListener('scroll',schedule);
   hero.removeEventListener('scroll',schedule,true);
   hero.removeEventListener('load',schedule,true);
   window.removeEventListener('resize',schedule);
  };
 },[heroRef,bodyRef,safeAreaTop]);
}
