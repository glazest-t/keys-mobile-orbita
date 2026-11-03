import test from 'node:test';
import assert from 'node:assert/strict';
import {prototypeVersionUrl} from '../app/src/prototypeVersion.ts';
for(const [from,to,base,desktop] of [
 ['https://glazest-t.github.io/keys-mobile-orbita/prototype/?catalogue=booking-confirmation#booking-flow','https://glazest-t.github.io/keys-mobile-orbita/desktop/?catalogue=booking-confirmation#booking-flow','/keys-mobile-orbita/prototype/',true],
 ['https://glazest-t.github.io/keys-mobile-orbita/desktop/?review=mobile#trips','https://glazest-t.github.io/keys-mobile-orbita/prototype/?review=mobile#trips','/keys-mobile-orbita/desktop/',false],
 ['https://example.test/prototype/#find','https://example.test/desktop/#find','/prototype/',true],
])test('Published version link: '+from,()=>assert.equal(prototypeVersionUrl(from,base,desktop,false),to));
test('Local desktop port, selected scene retained',()=>assert.equal(prototypeVersionUrl('http://127.0.0.1:5173/?catalogue=booking-checkout#booking-flow','/',true,true),'http://127.0.0.1:5180/?catalogue=booking-checkout#booking-flow'));
