"""Verify the published marketing library under the Pages project path."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_site'; KIT=OUT/'marketing'
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  for key,value in attrs:
   if key in ['href','src'] and value:self.links.append(value)
checksums=json.loads((KIT/'SHA256SUMS.json').read_text())
for name in ['index.html','current-app.html','start.html','catalogue.css','publication.json']:
 assert hashlib.sha256((KIT/name).read_bytes()).hexdigest()==checksums[name],name
count=0
for name in ['index.html','start.html','current-app.html','brand-assets.html','guide-print.html']:
 p=KIT/name;html=p.read_text();parser=Links();parser.feed(html)
 assert 'http://127.0.0.1:' not in html and 'http://localhost:' not in html,name
 for value in parser.links:
  u=urlsplit(value)
  if u.scheme or not u.path:continue
  v=unquote(u.path)
  if v.startswith('/keys-mobile-orbita/'):target=OUT/v.removeprefix('/keys-mobile-orbita/')
  else:
   assert not v.startswith('/'),(name,value)
   target=p.parent/v
  assert target.exists(),(name,value)
  count+=1
manifest=json.loads((KIT/'manifest.json').read_text())
for a in manifest['assets']:
 for format in ['png','svg','editable']:
  assert (KIT/a[format]).is_file(),a[format];count+=1
current=json.loads((KIT/'current-app/manifest.json').read_text())
for a in current['assets']+current['preferenceCrops']:
 assert (KIT/'current-app'/a['file']).is_file(),a['file'];count+=1
for name in ['index.html','screens.html','documentation.html']:
 assert 'href="/keys-mobile-orbita/marketing/"' in (OUT/name).read_text(),name
print(f'OK: marketing portal, {len(manifest["assets"])} layouts/pages, {len(current["assets"])} app assets, {count} local links/files')
