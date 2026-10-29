export type Wallets={hotelId:string;keysPoints:number;hotelPoints:number};
export type Service={id:string;quantity:number;unitPriceMinor:number};
export type Quote={hotelId:string;lodgingMinor:number;serviceTotalMinor:number;orderTotalMinor:number;hotelBenefitsAllowed:boolean;usePoints:boolean;applied:{hotelPoints:number;keysPoints:number;pointsMinor:number};cashDueMinor:number;remaining:{hotelPoints:number;keysPoints:number}};
export type Operation={id:string;userId:string;bookingId:string;hotelId:string;status:'confirmed'|'cancelled';method:'online'|'at_hotel';orderTotalMinor:number;pointsMinor:number;debits:Record<string,number>;paidCashMinor:number;dueAtHotelMinor:number;refundCashMinor?:number;returnedPointsMinor?:number;penaltyMinor?:number;penaltyDueMinor?:number};
export type PaymentState={balances:Record<string,number>;operations:Record<string,Operation>};
export class DomainError extends Error {code:string;constructor(code:string,message:string)}
export function createPaymentState():PaymentState;
export function walletIds(userId:string,hotelId:string):{keys:string;hotel:string};
export function readWallets(state:PaymentState,userId:string,hotelId:string):Wallets;
export function calculatePayment(input:{hotelId:string;lodgingMinor:number;services?:Service[];wallets:Wallets;usePoints:boolean;hotelBenefitsAllowed?:boolean}):Quote;
export function confirmPayment(state:PaymentState,input:{userId:string;bookingId:string;quote:Quote;method:'online'|'at_hotel';outcome?:'success'|'failure'}):{state:PaymentState;operation:Operation|null;duplicate:boolean;error?:string};
export function cancelFreeBooking(state:PaymentState,input:{userId:string;bookingId:string;freeCancellationAllowed:boolean}):{state:PaymentState;operation:Operation;duplicate:boolean};
