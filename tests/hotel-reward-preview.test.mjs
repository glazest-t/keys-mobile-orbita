import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,catalog} from '../app/src/booking/model.ts';
import {hotelRewardPoints,hotelLoyaltySnapshot,settleHotelLoyalty,setHotelProgram,hotelLevels} from '../app/src/rewards/loyalty.ts';

const owner='+79001234567';
function fixture(){
 let state=ensureAccount(initialCommerce(),owner);
 state.search={...state.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1};
 state=startDraft(state,'orbit-sea','reward-preview');
 state.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};
 return state;
}
test('Hotel preview matches actual checkout award with and without spending points',()=>{
 for(const usePoints of [false,true]){
  let state=fixture();state.draft.usePoints=usePoints;
  const quote=quoteDraft(state,owner),loyalty=hotelLoyaltySnapshot(state,owner,state.draft.hotelId,state.draft.rateId);
  const expected=hotelRewardPoints(quote,loyalty);
  state=commitBooking(state,owner,quote,'success','2026-11-10T12:00:00Z');
  state.bookings[0].stay={status:'checked_out',checkedOutAt:'2026-11-15T12:00:00Z'};
  const settled=settleHotelLoyalty(state,owner,state.bookings[0].id);
  assert.equal(settled.hotelLoyaltyAwards[owner][0].points,expected);
 }
});
test('No hotel reward is promised for disconnected membership or Friendly Rate',()=>{
 const state=fixture(),draft=state.draft;
 assert.equal(hotelLoyaltySnapshot(setHotelProgram(state,owner,draft.hotelId,false),owner,draft.hotelId,draft.rateId),undefined);
 const friendly=catalog.rates.find(rate=>rate.hotelId===draft.hotelId&&rate.kind==='friendly_rate');
 assert.ok(friendly);
 assert.equal(hotelLoyaltySnapshot(state,owner,draft.hotelId,friendly.id),undefined);
 assert.equal(hotelRewardPoints({lodgingMinor:100000,applied:{pointsMinor:0}}),0);
});
test('Hotel reward excludes redeemed points, floors fractions, and never goes negative',()=>{
 const loyalty={levelId:'guest',levelName:'Гость',earnBasisPoints:300};
 assert.equal(hotelRewardPoints({lodgingMinor:100999,applied:{pointsMinor:10000}},loyalty),27);
 assert.equal(hotelRewardPoints({lodgingMinor:10000,applied:{pointsMinor:10000}},loyalty),0);
 assert.equal(hotelRewardPoints({lodgingMinor:10000,applied:{pointsMinor:20000}},loyalty),0);
});

test('Demo Connoisseur hotel reward differs from Keys reward',()=>{
 const level=hotelLevels('orbit-sea').find(item=>item.id==='connoisseur');
 assert.equal(level.earnBasisPoints,400);
 assert.equal(hotelRewardPoints({lodgingMinor:9443000,applied:{pointsMinor:0}},{levelId:level.id,levelName:level.name,earnBasisPoints:level.earnBasisPoints}),3777);
});
