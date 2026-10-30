/** Demonstration venue settings; replace with hotel-provided service data in production. */
export function breakfastVenue(hotelId:string){return {from:'07:00',until:'11:00',hours:'07:00–11:00',floor:'1 этаж',restaurant:hotelId==='orbit-sea'?'Ресторан «Гренадин»':'Ресторан отеля'};}
export function breakfastTime(r:{kind?:string;mode?:string;time:string}){return r.mode==='buffet'?'07:00–11:00':r.time;}
