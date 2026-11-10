import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancellationPreview} from '../app/src/booking/model.ts';
import {cancellationSettings,cancellationPolicyFor,bookingCancellationPolicy,policyDeadline,policyPenalty,cancellationTerms} from '../app/src/booking/bookingCancellation.ts';
const policy={daysBefore:1,time:'08:00:00',utcOffset:'+03:00',penalty:{kind:'first_night'}};
test('Точный срок и UTC смещение, как в примере пользователя',()=>{
 assert.equal(policyDeadline('2026-11-15',policy),'2026-11-14T05:00:00.000Z');
 assert.match(cancellationTerms('2026-11-15',policy)[0],/14\.11\.2026 08:00:00 \(UTC \+03:00\)/);
 assert.match(cancellationTerms('2026-11-15',policy)[1],/стоимость первых суток/);
 assert.equal(policyDeadline('2026-11-15',{...policy,utcOffset:'+05:30'}),'2026-11-14T02:30:00.000Z');
});
test('Варианты удержания: первые сутки, процент, сумма, всё проживание и бесплатно',()=>{
 for(const [penalty,want] of [[{kind:'first_night'},10000],[{kind:'percent',value:30},6000],[{kind:'fixed',value:4500},4500],[{kind:'full_stay'},20000],[{kind:'none'},0]])assert.equal(policyPenalty(20000,2,{...policy,penalty}),want);
 assert.deepEqual(cancellationTerms('2026-11-15',{...policy,penalty:{kind:'none'}}),['Бесплатная отмена бронирования возможна до заезда.']);
});
test('Приоритет тарифа, сохранение правил в брони и точная граница бесплатной отмены',()=>{
 const owner='+79990000002';let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-15',checkOut:'2026-11-17'};s=startDraft(s,'orbit-sea','policy-test');
 const rate=s.draft.rateId;
 try{
  cancellationSettings.hotels['orbit-sea']={...policy,daysBefore:2};
  cancellationSettings.rates[rate]=structuredClone(policy);
  assert.equal(cancellationPolicyFor(s.draft).daysBefore,1);
  s.draft={...s.draft,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};
  s=commitBooking(s,owner,quoteDraft(s,owner),'success','2026-11-10T12:00:00Z');const b=s.bookings[0];
  cancellationSettings.rates[rate].daysBefore=10;
  assert.equal(bookingCancellationPolicy(b).daysBefore,1);
  assert.equal(cancellationPreview(b,'2026-11-14T05:00:00.000Z').penalty,0);
  assert.equal(cancellationPreview(b,'2026-11-14T05:00:00.001Z').penalty,Math.round(b.quote.lodgingMinor/2));
  const legacy={...b,cancellationPolicy:undefined};assert.equal(bookingCancellationPolicy(legacy).daysBefore,3);
 }finally{delete cancellationSettings.hotels['orbit-sea'];delete cancellationSettings.rates[rate];}
});
