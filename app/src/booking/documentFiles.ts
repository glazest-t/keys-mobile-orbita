import {PDFDocument,rgb,type PDFPage} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {zipSync,strToU8} from 'fflate';
import {documentKinds,tripDocument,validDocumentEmail,type TripDocument} from './documents.ts';
import type {Booking} from './model.ts';

let fontBytes:Promise<ArrayBuffer>|undefined;
const readFont=()=>fontBytes||=(fetch('/brand/fonts/Onest-Variable.ttf').then(r=>{if(!r.ok)throw Error('Не удалось загрузить шрифт документа');return r.arrayBuffer();}).catch(e=>{fontBytes=undefined;throw e;}));
export async function makeDocumentPdf(data:TripDocument,fontData?:ArrayBuffer|Uint8Array){
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 const font=await pdf.embedFont(fontData||await readFont(),{subset:true});
 pdf.setTitle(data.title);pdf.setAuthor('Ключи');pdf.setSubject('Демонстрационный документ, не фискальный чек');pdf.setLanguage('ru-RU');
 const ink=rgb(.063,.075,.125),muted=rgb(.35,.38,.45),blue=rgb(.184,.357,1),line=rgb(.89,.91,.94);
 let page!:PDFPage,y=0;
 const newPage=()=>{page=pdf.addPage([595.28,841.89]);y=792;page.drawText('Ключи',{x:42,y,size:22,font,color:blue});page.drawText(data.title,{x:42,y:y-32,size:17,font,color:ink});y-=61;};
 const clean=(s:string)=>s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').replace(/[‐‑–—]/g,'-');
 const lines=(text:string,width:number,size:number)=>{const result:string[]=[];let current='';for(const char of clean(text)){if(char==='\n'){result.push(current);current='';continue;}if(font.widthOfTextAtSize(current+char,size)>width&&current){const space=current.lastIndexOf(' ');if(space>0){result.push(current.slice(0,space));current=current.slice(space+1)+char;}else{result.push(current);current=char;}}else current+=char;}result.push(current);return result;};
 const text=(value:string,x:number,width:number,size=10,color=ink)=>{for(const part of lines(value,width,size)){if(y<74)newPage();page.drawText(part,{x,y,font,size,color});y-=size*1.5;}};
 newPage();text(data.hotel,42,510,12);text(`${data.dates} · ${data.status}`,42,510,10,muted);text(`Бронь ${data.bookingId} · версия ${data.revision}`,42,510,9,muted);y-=10;
 for(const section of data.sections){if(y<130)newPage();text(section.title,42,510,13,blue);y-=4;
  for(const [label,value] of section.rows){const left=lines(label,180,10),right=lines(value,300,10),count=Math.max(left.length,right.length);
   for(let i=0;i<count;i++){if(y<78)newPage();if(left[i])page.drawText(left[i],{x:42,y,font,size:10,color:muted});if(right[i])page.drawText(right[i],{x:240,y,font,size:10,color:ink});y-=15;}
   y-=7;
  }y-=12;
 }
 pdf.getPages().forEach((p,i)=>{p.drawLine({start:{x:42,y:54},end:{x:553,y:54},color:line,thickness:1});p.drawText('Демонстрационный документ. Не является фискальным чеком.',{x:42,y:37,font,size:8,color:muted});p.drawText(`${i+1} / ${pdf.getPageCount()}`,{x:518,y:37,font,size:8,color:muted});});
 return pdf.save();
}
export async function makeDocumentArchive(b:Booking){const files:Record<string,Uint8Array>={};for(const kind of documentKinds(b)){const doc=tripDocument(b,kind);files[doc.filename]=await makeDocumentPdf(doc);}return zipSync(files,{level:6});}
export function downloadFile(bytes:Uint8Array,name:string,type:string){const blob=new Blob([Uint8Array.from(bytes).buffer],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
const base64=(bytes:Uint8Array)=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
export function makeDocumentEmail(email:string,b:Booking,zip:Uint8Array){
 if(!validDocumentEmail(email))throw Error('Проверьте адрес почты');
 const boundary='keys-documents-'+crypto.randomUUID(),subject=base64(strToU8('Документы поездки · '+b.id)),body=base64(strToU8('Во вложении документы поездки. Демонстрационные документы, не фискальные чеки.'));
 return strToU8([`To: ${email}`,`Subject: =?UTF-8?B?${subject}?=`,'X-Unsent: 1','MIME-Version: 1.0',`Content-Type: multipart/mixed; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',body,`--${boundary}`,'Content-Type: application/zip','Content-Disposition: attachment; filename="trip-documents.zip"','Content-Transfer-Encoding: base64','',base64(zip).match(/.{1,76}/g)!.join('\r\n'),`--${boundary}--`,''].join('\r\n'));
}
