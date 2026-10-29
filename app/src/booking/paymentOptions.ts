import type {Draft} from './model.ts';
export const extraPaymentOptions=[
 {id:'sberpay',label:'SberPay',icon:'phone'},
 {id:'tpay',label:'T-Pay',icon:'phone'},
 {id:'yandexpay',label:'Яндекс Пэй',icon:'wallet'},
] as const;
export type OnlinePaymentOption='card'|'sbp'|typeof extraPaymentOptions[number]['id'];
export type PaymentChoice='at_hotel'|OnlinePaymentOption;
export function paymentSelection(option:PaymentChoice):Pick<Draft,'method'|'paymentOption'>{
 return {method:option==='at_hotel'?'at_hotel':'online',paymentOption:option==='at_hotel'?'sbp':option};
}
export function visibleWallets(wallets:{keysPoints:number;hotelPoints:number},friendly:boolean){
 return [
  {id:'keys',label:'«Ключи»',points:wallets.keysPoints,available:true},
  {id:'hotel',label:friendly?'Отель · недоступны на FR':'Отель',points:wallets.hotelPoints,available:!friendly},
 ].filter(w=>w.points>0);
}
