import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingNumber} from '../app/src/booking/bookingNumber.ts';

test('public booking number uses the creation date and stable numeric groups',()=>{
 const b={id:'booking-uuid-abc',createdAt:'2026-10-07T12:00:00Z'};
 assert.match(bookingNumber(b),/^20261007-\d{5}-\d{8}$/);
 assert.equal(bookingNumber({...b}),bookingNumber(b));
 assert.notEqual(bookingNumber({...b,id:'another-booking'}),bookingNumber(b));
});
test('approved public number is retained; legacy codes get a public display number',()=>{
 const b={id:'KEYS-101-+79990000001',createdAt:'2026-10-07T12:00:00Z',number:'KEYS-101'};
 assert.match(bookingNumber(b),/^20261007-\d{5}-\d{8}$/);
 assert.equal(bookingNumber({...b,number:'20261007-17786-25756687'}),'20261007-17786-25756687');
 assert.equal(b.number,'KEYS-101');
});
