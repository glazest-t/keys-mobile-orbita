import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const approved=path.join(root,'design/assets/icons-soft');
const manifest=JSON.parse(fs.readFileSync(path.join(approved,'manifest.json'),'utf8'));
const errors=[];
for(const directory of ['app/public/brand/assets/icons','design/assets/icons']){
 const dir=path.join(root,directory);
 const files=fs.readdirSync(dir).filter(f=>f.endsWith('.svg')).sort();
 if(JSON.stringify(files)!==JSON.stringify(Object.keys(manifest.files).sort()))errors.push(`${directory}: unexpected or missing SVGs`);
 for(const [file,expected] of Object.entries(manifest.files)){
  const full=path.join(dir,file);if(!fs.existsSync(full)){errors.push(`${directory}/${file}: missing`);continue;}
  const body=fs.readFileSync(full);
  if(crypto.createHash('sha256').update(body).digest('hex')!==expected)errors.push(`${directory}/${file}: differs from approved set`);
  if(file!=='_sprite.svg'){
   const master=fs.readFileSync(path.join(approved,file),'utf8');
   if(body.toString()!==master.replace('fill="currentColor" aria-hidden=','fill="currentColor" color="#2F5BFF" aria-hidden='))errors.push(`${file}: master mismatch`);
  }
 }
}
const symbols=new Set(Object.keys(manifest.files).map(f=>f.replace('.svg','')));
const originals=JSON.parse(fs.readFileSync(path.join(root,'design/assets/icons-original/manifest.json'),'utf8'));
for(const directory of ['app/public/brand/assets/icons-original','design/assets/icons-original']){
 for(const symbol of symbols){
  if(symbol==='_sprite')continue;
  const file=symbol+'.svg',full=path.join(root,directory,file);
  if(!fs.existsSync(full)||crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex')!==originals.files[file])errors.push(`${directory}/${file}: original icon missing or altered`);
 }
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const base of ['app/src','desktop/src'])for(const file of walk(path.join(root,base)).filter(f=>f.endsWith('.tsx'))){
 if(file.includes('/mobile/'))continue; // Device/status/keyboard chrome is not an application icon.
 const source=fs.readFileSync(file,'utf8');
 if(/<svg\b|<path\b|data:image\/svg/.test(source))errors.push(`${path.relative(root,file)}: inline icon bypasses the shared set`);
 for(const match of source.matchAll(/<(?:Icon|IconButton|Row|ServiceTile|Empty)\b[^>]*?\b(?:name|icon)=["']([^"']+)["']/g))if(!symbols.has(match[1]))errors.push(`${path.relative(root,file)}: missing ${match[1]}`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Approved Soft set: ${symbols.size-1} icons + sprite, public/design copies match, no old inline application SVGs.`);
