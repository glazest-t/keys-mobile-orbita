import test from 'node:test';
import assert from 'node:assert/strict';
import {contactPhoneDigits,formatContactPhone,deleteContactPhone,changeContactPhone} from '../app/src/travelers/contactPhoneMask.ts';
test('Маска российского и международного номера сохраняет код и все цифры',()=>{
 for(const [input,expected] of [['9991234567','+7 (999) 123-45-67'],['8 (999) 123-45-67','+7 (999) 123-45-67'],['+12025550123','+1 202 555 0123'],['+447700900123','+44 7700 900 123'],['00375291234567','+375 29 123 45 67'],['+4915112345678','+49 151 123 456 78']])assert.equal(formatContactPhone(input),expected);
 assert.equal(contactPhoneDigits('+44 7700 900 123'),'+447700900123');
 assert.equal(formatContactPhone('+'),'+');assert.equal(formatContactPhone(''),'');
});
test('Последовательный ввод, удаление разделителя и замена кода страны',()=>{
 let value='';for(const digit of '9991234567'){const display=formatContactPhone(value),raw=display+digit;value=changeContactPhone(display,raw,raw.length).value;}
 assert.equal(formatContactPhone(value),'+7 (999) 123-45-67');
 const formatted=formatContactPhone(value),pos=formatted.indexOf('-')+1;
 const removed=deleteContactPhone(formatted,pos,pos,true);assert.equal(removed.value,'+7999124567');
 assert.equal(deleteContactPhone(formatted,0,formatted.length,true).value,'');
 assert.equal(changeContactPhone('+7','+44',3).value,'+44');
});
