import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveAppTheme,effectiveAppTheme} from '../app/src/appTheme.ts';

test('theme links override saved preference, invalid values fall back safely',()=>{
  const base='https://example.test/prototype/?variant=november&text=edited';
  assert.equal(resolveAppTheme(base,null),'light');
  assert.equal(resolveAppTheme(base,'dark'),'dark');
  assert.equal(resolveAppTheme(base+'&theme=light','dark'),'light');
  assert.equal(resolveAppTheme(base+'&theme=system','light'),'system');
  assert.equal(resolveAppTheme(base+'&theme=invalid','dark'),'dark');
  assert.equal(resolveAppTheme(base,'invalid'),'light');
});

test('system appearance tracks the device; explicit appearance stays fixed',()=>{
  assert.equal(effectiveAppTheme('system',true),'dark');
  assert.equal(effectiveAppTheme('system',false),'light');
  assert.equal(effectiveAppTheme('light',true),'light');
  assert.equal(effectiveAppTheme('dark',false),'dark');
});
