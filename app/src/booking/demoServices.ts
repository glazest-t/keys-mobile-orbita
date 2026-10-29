import type {Commerce} from './model.ts';

/** Demo-only reset of service orders made after booking, across all local profiles. */
export function resetDemoServices(state:Commerce):Commerce {
 if(!state.bookings.some(b=>b.serviceRequests?.length))return state;
 const balances={...state.payment.balances},operations={...state.payment.operations},seen=new Set<string>();
 const bookings=state.bookings.map(b=>{
  if(!b.serviceRequests?.length)return b;
  let depositSpent=0;
  for(const request of b.serviceRequests){
   const op=request.operation;
   if(!op||seen.has(op.id))continue;
   seen.add(op.id);
   // Service refunds return either all points or none. Do not restore them twice.
   if(!op.returnedPointsMinor)for(const [wallet,points] of Object.entries(op.debits))balances[wallet]=(balances[wallet]||0)+points;
   delete operations[op.id];
   if(request.paymentSource==='deposit')depositSpent+=op.paidCashMinor-(op.refundCashMinor||0);
  }
  return {...b,serviceRequests:[],revision:(b.revision||0)+1,
   ...(b.deposit?.returned?{deposit:{...b.deposit,returned:{...b.deposit.returned,amountMinor:b.deposit.returned.amountMinor+depositSpent}}}:{})};
 });
 return {...state,bookings,payment:{balances,operations}};
}
