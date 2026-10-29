const digits=(value:string)=>value.replace(/\D/g,'');
const twoDigitCodes=new Set('20 27 30 31 32 33 34 36 39 40 41 43 44 45 46 47 48 49 51 52 53 54 55 56 57 58 60 61 62 63 64 65 66 81 82 84 86 90 91 92 93 94 95 98'.split(' '));
export function contactPhoneDigits(value:string){
 const raw=value.trim(),d=digits(raw);if(!d)return raw.startsWith('+')?'+':'';
 if(raw.startsWith('+'))return '+'+d.slice(0,15);
 if(raw.startsWith('00'))return '+'+d.slice(2,17);
 if(d.startsWith('8'))return '+7'+d.slice(1,15);
 return '+'+(d.startsWith('7')?d:'7'+d).slice(0,15);
}
export function formatContactPhone(value:string){
 const raw=contactPhoneDigits(value),d=digits(raw);if(!d)return raw;
 const codeLength=/^[17]/.test(d)?1:twoDigitCodes.has(d.slice(0,2))?2:3;
 const code=d.slice(0,codeLength),rest=d.slice(codeLength);if(!rest)return '+'+code;
 if(code==='7')return '+7 ('+rest.slice(0,3)+(rest.length>=3?')':'')+(rest.length>3?' '+rest.slice(3,6):'')+(rest.length>6?'-'+rest.slice(6,8):'')+(rest.length>8?'-'+rest.slice(8,10):'')+(rest.length>10?' '+rest.slice(10):'');
 const sizes=code==='1'?[3,3,4]:code==='44'?[4,3,3]:code==='375'?[2,3,2,2]:[3,3,3,3];
 const groups:string[]=[];let offset=0;for(const size of sizes){if(offset>=rest.length)break;groups.push(rest.slice(offset,offset+size));offset+=size;}if(offset<rest.length)groups.push(rest.slice(offset));
 return '+'+code+' '+groups.join(' ');
}
function caretAt(value:string,count:number){if(count<=0)return value.startsWith('+')?1:0;let seen=0;for(let i=0;i<value.length;i++)if(/\d/.test(value[i])&&++seen===count)return i+1;return value.length;}
export function deleteContactPhone(value:string,start:number,end:number,backward:boolean){
 const d=digits(value);let a=digits(value.slice(0,start)).length,b=digits(value.slice(0,end)).length;
 if(start===end){if(backward)a=Math.max(0,a-1);else b=Math.min(d.length,b+1);}
 const next=d.slice(0,a)+d.slice(b),raw=next?'+'+next:'';
 return {value:raw,caret:caretAt(formatContactPhone(raw),a)};
}
export function changeContactPhone(previous:string,value:string,caret:number,inputType=''){
 if(inputType.startsWith('delete')&&digits(previous)===digits(value)&&value.length<previous.length)return deleteContactPhone(previous,caret,caret,inputType!=='deleteContentForward');
 const raw=contactPhoneDigits(value),added=digits(raw).length-digits(value).length;
 return {value:raw,caret:caretAt(formatContactPhone(raw),Math.max(0,digits(value.slice(0,caret)).length+added))};
}
