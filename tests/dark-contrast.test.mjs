import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const styles=['theme.css','theme-contrast.css'].map(f=>readFileSync(new URL('../app/src/'+f,import.meta.url),'utf8')).join('\n');
function token(name){
  const matches=[...styles.matchAll(new RegExp(`${name}:\\s*(#[0-9a-f]{6})\\s*;`,'gi'))];
  assert.ok(matches.length,`Missing palette token ${name}`);
  return matches.at(-1)[1];
}
function luminance(hex){
  const channels=[1,3,5].map(i=>Number.parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return channels.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
}
function contrast(fg,bg){const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
function atLeast(fg,bg,min){assert.ok(contrast(fg,bg)>=min,`${fg} on ${bg}: ${contrast(fg,bg).toFixed(2)} < ${min}`);}

test('dark field text, placeholders and validation remain readable',()=>{
  for(const fg of ['--theme-text','--theme-secondary','--theme-placeholder','--theme-error'])
    atLeast(token(fg),token('--theme-field'),4.5);
  atLeast(token('--theme-control-border'),token('--theme-field'),3);
  atLeast(token('--theme-control-border'),token('--theme-card'),3);
  atLeast(token('--theme-link'),token('--theme-field'),3);
});
test('dark secondary actions remain readable in default and hover states',()=>{
  for(const bg of ['--theme-control','--theme-control-hover'])atLeast(token('--theme-on-control'),token(bg),4.5);
  atLeast(token('--theme-on-accent'),'#2f5bff',4.5);
  atLeast('#ffffff','#152448',4.5);
  atLeast('#ffffff','#101b37',4.5);
});

test('dark accent cards retain readable light actions',()=>{
  for(const bg of ['#264cde','#2143c7','#1c39af'])atLeast('#ffffff',bg,4.5);
  for(const bg of ['#f4f7ff','#dce8ff','#c8d9ff'])atLeast('#193979',bg,4.5);
  for(const bg of ['#f2d9a4','#ddbb78'])atLeast('#2b251a',bg,4.5);
  atLeast('#ffda8c','#44391f',3);
  atLeast('#aecaff','#243858',3);
  atLeast('#142a53','#aecaff',4.5);
});
