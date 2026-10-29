export function displayBirthDate(value:string){
 if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value.slice(8)+'.'+value.slice(5,7)+'.'+value.slice(0,4);
 const digits=value.replace(/\D/g,'').slice(0,8);
 return [digits.slice(0,2),digits.slice(2,4),digits.slice(4)].filter(Boolean).join('.');
}
export function storeBirthDate(display:string){
 const formatted=displayBirthDate(display),digits=formatted.replace(/\D/g,'');
 return digits.length===8?digits.slice(4)+'-'+digits.slice(2,4)+'-'+digits.slice(0,2):formatted;
}
export function birthDateCaret(formatted:string,count:number){
 if(!count)return 0;
 let seen=0;for(let i=0;i<formatted.length;i++)if(/\d/.test(formatted[i])&&++seen===count)return i+1;
 return formatted.length;
}
export function deleteBirthDate(formatted:string,start:number,end:number,backward:boolean){
 const digits=formatted.replace(/\D/g,'');
 let from=formatted.slice(0,start).replace(/\D/g,'').length,to=formatted.slice(0,end).replace(/\D/g,'').length;
 if(start===end){if(backward)from=Math.max(0,from-1);else to=Math.min(digits.length,to+1);}
 const next=displayBirthDate(digits.slice(0,from)+digits.slice(to));
 return {value:storeBirthDate(next),caret:birthDateCaret(next,from)};
}
