export function ratingTone(value:number|string){const n=Number(String(value).replace(',','.'));return n>=4?'good':n>=3?'average':'poor';}
