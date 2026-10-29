/** A single local JPEG thumbnail; no upload or EXIF data retained. */
export async function readProblemPhoto(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Выберите JPG, PNG или WebP до 5 МБ');
 const bitmap=await createImageBitmap(file);
 try{
  const scale=Math.min(1,960/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d');if(!context)throw Error('Не удалось прочитать фото');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  for(const quality of [.8,.6,.4]){const data=canvas.toDataURL('image/jpeg',quality);if(data.length<=350000)return data;}
  throw Error('Фото слишком большое. Выберите другое');
 }finally{bitmap.close();}
}
