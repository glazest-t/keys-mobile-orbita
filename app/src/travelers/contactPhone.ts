/** Traveler contact only: authentication keeps its existing phone rules. */
export function normalizeContactPhone(raw:string){
 const value=raw.trim();
 if(!value||!/^[+\d\s().-]+$/.test(value)||/\+/.test(value.slice(1)))return null;
 let digits=value.replace(/\D/g,'');
 if(value.startsWith('00'))digits=digits.slice(2);
 else if(!value.startsWith('+')){
  if(digits.length===10)digits='7'+digits;
  else if(digits.length===11&&digits.startsWith('8'))digits='7'+digits.slice(1);
  else return null;
 }
 if(!/^[1-9]\d{6,14}$/.test(digits)||(digits.startsWith('7')&&digits.length!==11))return null;
 return '+'+digits;
}
