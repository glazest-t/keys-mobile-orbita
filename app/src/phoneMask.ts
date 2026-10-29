const digits=(value:string)=>value.replace(/\D/g,'');
export function phoneDigits(value:string){const d=digits(value);return (d.length===11&&/^[78]/.test(d)?d.slice(1):d).slice(0,10);}
export function formatPhoneInput(value:string){const d=phoneDigits(value);if(!d)return '';return '('+d.slice(0,3)+(d.length>=3?')':'')+(d.length>3?' '+d.slice(3,6):'')+(d.length>6?'-'+d.slice(6,8):'')+(d.length>8?'-'+d.slice(8,10):'');}
export function phoneCaret(value:string,count:number){if(!count)return value?1:0;let seen=0;for(let i=0;i<value.length;i++)if(/\d/.test(value[i])&&++seen===count)return i+1;return value.length;}
export function deletePhone(value:string,start:number,end:number,backward:boolean){
 const d=digits(value),from=digits(value.slice(0,start)).length,to=digits(value.slice(0,end)).length;
 const a=from===to&&backward?Math.max(0,from-1):from,b=from===to&&!backward?Math.min(d.length,to+1):to;
 const next=d.slice(0,a)+d.slice(b);return {digits:next,caret:phoneCaret(formatPhoneInput(next),a)};
}
export function changePhone(previous:string,value:string,caret:number,inputType=''){
 if(inputType.startsWith('delete')&&digits(previous)===digits(value)&&value.length<previous.length)return deletePhone(previous,caret,caret,inputType!=='deleteContentForward');
 const d=phoneDigits(value),removed=digits(value).length===11&&/^[78]/.test(digits(value))?1:0;
 return {digits:d,caret:phoneCaret(formatPhoneInput(d),Math.max(0,digits(value.slice(0,caret)).length-removed))};
}
