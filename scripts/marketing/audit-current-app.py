"""Trace current application imports and export their graphic dependencies."""
from pathlib import Path
from collections import defaultdict,Counter
import re,json,hashlib,shutil
from PIL import Image

root=Path.cwd(); pub=root/'app/public'; out=root/'design/marketing-kit-2026-11-03/current-app'
out.mkdir(parents=True,exist_ok=True)
def rel(p):return str(p.relative_to(root))
seen=set(); todo=[root/'app/src/main.tsx',root/'app/index.html']
while todo:
 p=todo.pop().resolve()
 if p in seen or not p.is_file():continue
 seen.add(p)
 if p.suffix not in {'.tsx','.ts','.js','.mjs','.css','.html','.json'}:continue
 s=p.read_text()
 imports=re.findall(r'''(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']''',s)
 imports+=re.findall(r'''@import\s*["']([^"']+)["']''',s)
 for name in imports:
  if not name.startswith('.'):continue
  q=(p.parent/name.split('?')[0]).resolve()
  choices=[q]+[Path(str(q)+e) for e in ['.ts','.tsx','.js','.mjs','.json','.css']]+[q/'index.ts',q/'index.tsx']
  found=next((v for v in choices if v.is_file()),None)
  if found:todo.append(found)
texts={p:p.read_text() for p in seen if p.suffix in {'.tsx','.ts','.js','.mjs','.css','.html','.json'}}
usage=defaultdict(set); evidence=defaultdict(set);remote=defaultdict(set)
def add(url,source,kind):
 p=pub/url.lstrip('/')
 if p.is_file():usage[url].add(rel(source));evidence[url].add(kind)
for p,s in texts.items():
 for url in re.findall(r'''["'`(](\/[^"'`\s{}<>)]*?\.(?:png|jpe?g|webp|svg|gif|avif))(?:["'`)?#])''',s):add(url,p,'literal reference in reachable module')
 for url in re.findall(r'''https://[^\s"'`<>]+?\.(?:png|jpe?g|webp)(?:\?[^\s"'`<>]*)?''',s):remote[url].add(rel(p))
# Dynamic icon names are passed through Icon/Row/ServiceTile and data arrays.
for p in (pub/'brand/assets/icons').glob('*.svg'):
 name=p.stem
 for source,s in texts.items():
  if re.search(r'''["']'''+re.escape(name)+r'''["']''',s):add('/'+str(p.relative_to(pub)),source,'dynamic icon-name reference')
# Idea illustrations and photography: current data definitions resolve the URL factory.
for source in [root/'app/src/booking/preferences.ts',root/'app/src/booking/preferenceIdeas.ts']:
 if source not in seen:continue
 for kind,name in re.findall(r'''\b(art|cover)\s*:\s*['"]([^'"]+)['"]''',source.read_text()):
  add('/brand/ideas/'+('covers/' if kind=='cover' else '')+name+'.webp',source,'dynamic idea data')
# Hotel fallback factory and route transport-mode assets.
p=root/'app/src/booking/presentation.ts'
for name in re.findall(r'''asset\(['"]([^'"]+)['"]\)''',p.read_text()):add('/brand/assets/assets/'+name,p,'asset factory')
for n in range(4):add(f'/assets/details/route-mode-{n}.svg',root/'app/src/booking/TripPreparation.tsx','route mode family')
# The app icon suite is an explicit current library; it need not all be displayed at once.
for p in (pub/'brand/assets/app-icon').glob('*.svg'):add('/'+str(p.relative_to(pub)),root/'app/index.html','current app-icon library')
# Sprite source crops are exported from the exact live WebP sheets, not old PNG previews.
crop_source=root/'app/src/booking/preferenceIllustrations.ts'
crop_text=crop_source.read_text(); crops=[]
for m in re.finditer(r'"id":\s*"([^"]+)"[\s\S]*?"sheet":\s*([12])[\s\S]*?"rect":\s*\[([\d,\s]+)\]',crop_text):
 name,sheet,rect=m.groups();x,y,w,h=map(int,rect.split(','));source=pub/f'assets/preferences/set-1-{sheet}.webp'
 target=out/'preference-crops'/f'{name}.png';target.parent.mkdir(parents=True,exist_ok=True)
 Image.open(source).crop((x,y,x+w,y+h)).save(target)
 crops.append({'id':name,'file':str(target.relative_to(out)),'source':'/'+str(source.relative_to(pub)),'rect':[x,y,w,h],'definition':rel(crop_source)})
def category(url):
 if url.startswith('/hotels/') or '/assets/assets/' in url:return 'Фотографии отелей'
 if '/nearby/generated/' in url:return 'Иллюстрации мест рядом'
 if '/nearby/' in url:return 'Фотографии мест'
 if '/preferences/' in url:return 'Спрайты предпочтений'
 if '/brand/ideas/' in url:return 'Идеи отдыха'
 if '/brand/illustrations/' in url:return 'Промо и онбординг'
 if '/app-icon/' in url:return 'Иконки приложения'
 if '/logo/' in url:return 'Логотипы'
 if '/brand/assets/icons/' in url or '/details/' in url:return 'Контурные иконки'
 if '/services/' in url:return 'Услуги'
 return 'Оболочка устройства'
assets=[]
for url,refs in sorted(usage.items()):
 source=pub/url.lstrip('/');target=out/'assets'/url.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
 item={'url':url,'file':str(target.relative_to(out)),'category':category(url),'usedBy':sorted(refs),'evidence':sorted(evidence[url]),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size}
 if source.suffix!='.svg':
  im=Image.open(source);item.update(width=im.width,height=im.height,mode=im.mode,transparent='A' in im.getbands() and im.getextrema()[-1][0]<255)
 assets.append(item)
raw=[]
for p in sorted(seen):
 if p.suffix=='.html' and 'app/src/' in rel(p):
  target=out/'source'/p.relative_to(root/'app/src');target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);raw.append({'file':str(target.relative_to(out)),'source':rel(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
inline=[]
for p,s in texts.items():
 if '<svg' in s or 'SourceSplash' in p.name or 'SourceFinish' in p.name:
  inline.append({'source':rel(p),'inlineSvgCount':s.count('<svg'),'type':'JSX/CSS graphics; composed captures and source included'})
  target=out/'source'/p.relative_to(root/'app/src') if '/app/src/' in str(p) else None
  if target:target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
# Save definitions for the critical multi-layer compositions and provenance.
for name in ['booking/FindPage.tsx','booking/search.css','booking/BenefitsBannerComparison.tsx','booking/benefits-banner-comparison.css','onboarding/Onboarding.tsx','onboarding/RoomControlArt.tsx','onboarding/BenefitsIntro.tsx','onboarding/PersonalizationArt.tsx','onboarding/onboarding.css','onboarding/source-motion.css','profile/TripHistoryEntry.tsx','hotelier/HotelierFlow.tsx','hotelier/HotelierBenefits.tsx','hotelier/hotelier.css','booking/preferenceIllustrations.ts','booking/preference-illustrations.css']:
 p=root/'app/src'/name;target=out/'source'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
excluded=[]
for p in (pub/'brand/illustrations').rglob('*'):
 if p.is_file() and p.suffix.lower() in ['.png','.webp','.jpg'] and '/'+str(p.relative_to(pub)) not in usage:excluded.append({'path':rel(p),'reason':'No reference found in reachable current application; not exported as current'})
report={'date':'2026-11-03','authority':'Current local app/src import graph and catalogue scenes; local working tree including uncommitted changes','reachableModules':len(seen),'assets':assets,'preferenceCrops':crops,'rawArt':raw,'inlineGraphics':inline,'externalImages':[{'url':url,'usedBy':sorted(refs)}for url,refs in remote.items()],'excludedIllustrations':excluded,'scopeNote':'Static module graph identifies dependencies, not proof that every conditional branch is currently reachable by UI. Runtime captures confirm key composed graphics. Local photography is included as app content with source links, not licensed as generic campaign photography. External images and live map tiles are indexed, not downloaded.'}
(out/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
sources=[]
for name in ['docs/handoff/NEARBY-ILLUSTRATIONS.md','docs/handoff/PREFERENCE-ICONS.md','app/public/brand/ideas/SOURCES.md','app/public/assets/nearby/SOURCES.md','spec/nearby-photos.json','docs/iteration-4/PHOTO-SOURCES.md']:
 p=root/name
 if p.exists():target=out/'provenance'/p.name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);sources.append(name)
(out/'source-files.json').write_text(json.dumps({rel(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(seen)},ensure_ascii=False,indent=2))
print(json.dumps({'modules':len(seen),'assets':len(assets),'categories':Counter(x['category'] for x in assets),'preferenceCrops':len(crops),'raw':len(raw),'excluded':[Path(x['path']).name for x in excluded]},ensure_ascii=False,indent=2))
