/** Warm only the first visible photos; broken/slow images must not block results. */
export function waitForSearchPhotos(urls:string[],signal:AbortSignal,timeoutMs=4000):Promise<void>{
 return new Promise(resolve=>{
  if(signal.aborted||!urls.length){resolve();return;}
  const images:HTMLImageElement[]=[];let remaining=urls.length,finished=false;
  const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);signal.removeEventListener('abort',finish);for(const img of images){img.onload=null;img.onerror=null;}resolve();};
  const timer=setTimeout(finish,timeoutMs);
  signal.addEventListener('abort',finish,{once:true});
  for(const url of urls){
   const img=new Image();images.push(img);let settled=false;
   const settle=()=>{if(settled||finished)return;settled=true;if(--remaining===0)finish();};
   img.onload=settle;img.onerror=settle;img.src=url;if(img.complete)settle();
  }
 });
}
