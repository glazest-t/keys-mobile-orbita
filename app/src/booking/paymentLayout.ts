/** Reserve a slot for overflow only when some methods do not fit. */
export function paymentLayout<T>(options:readonly T[],width:number,minCard=120,gap=10){
 const slots=Math.max(1,Math.floor((Math.max(0,width)+gap)/(minCard+gap)));
 const count=slots>=options.length?options.length:Math.max(0,slots-1);
 return {visible:options.slice(0,count),overflow:options.slice(count)};
}
