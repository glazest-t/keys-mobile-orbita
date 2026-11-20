"""Extract the approved atlas assets, without executing its scripts.

Usage: python3 scripts/import-icon-atlas.py /path/to/downloaded-atlas.html
Requires Pillow only for lossless extraction of the atlas's 96px raster cells.
"""
import base64
import hashlib
import io
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://keys-soft-contour-icon-atlas.bapiwork2020.chatgpt.site/'
REVISION = 'soft-contour-v2-20261120'

class AtlasFrame(HTMLParser):
    document = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'iframe' and 'data-srcdoc' in attrs:
            self.document = attrs['data-srcdoc']

raw = Path(sys.argv[1]).read_text()
parser = AtlasFrame()
parser.feed(raw)
source = parser.document or raw
rows = json.loads(re.search(r'const rows=(\[.*?\]);', source).group(1))

def embedded(pattern):
    payload = re.search(pattern, source).group(1)
    return Image.open(io.BytesIO(base64.b64decode(payload))).convert('RGBA')

old = embedded(r'--old-img:url\(data:image/webp;base64,([^)]*)')
outline = embedded(r'--new-img:url\(data:image/webp;base64,([^)]*)')
amenities = embedded(r'data-source="amenity"\]\{--image:url\(data:image/webp;base64,([^)]*)')
heart = embedded(r'data-favorite-active\]\{[^}]*base64,([^)]*)')
points = embedded(r'data-points-mark\]\{[^}]*base64,([^)]*)')
assert old.size == outline.size == (1536, 1536)
assert amenities.size == (616, 440)
v2 = {}
for key, row in re.findall(r'<tr data-comparison="([^"]+)">(.*?)</tr>', source, re.S):
    svg = re.search(r'<td data-ver="v2"[^>]*>(<svg.*?</svg>)</td>', row, re.S).group(1)
    # Display dimensions only; the original viewBox and geometry remain exact.
    svg = re.sub(r' (?:width|height)="\d+"', '', svg, count=2)
    if '<use ' in svg:
        # The Google mark references shared gradients/masks in the atlas.
        position = source.index('id="ka-google-maps-vector"')
        definitions = re.search(r'<defs>.*?</defs>', source[source.rfind('<svg', 0, position):], re.S).group(0)
        svg = svg.replace('<use ', definitions + '<use ', 1)
    v2[key] = svg
assert len(rows) == 254 and len(v2) == 15
directories = [ROOT / 'design/assets/icons-contour', ROOT / 'app/public/brand/assets/icons-contour']
for directory in directories:
    directory.mkdir(parents=True, exist_ok=True)
assets, runtime, hashes = [], {}, {}
amenity_index = 0
for index, row in enumerate(rows):
    key = row['k']
    colored = row['g'] in ['Карточки удобств', 'Знаки приложений'] or key == 'ui-radio'
    if key in v2:
        filename, content = key + '.svg', v2[key].encode()
    else:
        if row['g'] == 'Карточки удобств':
            sheet, cell, columns, position = amenities, 88, 7, amenity_index
            amenity_index += 1
        else:
            sheet = old if row['g'] == 'Знаки приложений' or key.startswith('theme-') else outline
            cell, columns, position = 96, 16, index
        x, y = position % columns * cell, position // columns * cell
        icon = sheet.crop((x, y, x + cell, y + cell))
        if key == 'heart':
            icon = heart
        elif key in ['points', 'points-earned']:
            x = 96 if key == 'points-earned' else 0
            icon = points.crop((x, 0, x + 96, 96))
        output = io.BytesIO()
        icon.save(output, format='PNG', optimize=True)
        filename, content = key + '.png', output.getvalue()
    for directory in directories:
        (directory / filename).write_bytes(content)
    hashes[filename] = hashlib.sha256(content).hexdigest()
    runtime[key] = {'file': filename, 'color': colored}
    assets.append({'id': key, 'label': row['l'], 'group': row['g'], 'version': 'v2' if key in v2 else 'atlas'})

# Canonical names win over aliases (the atlas lists "flag" as both).
for row in rows:
    for alias in row['a']:
        runtime.setdefault(alias, runtime[row['k']])
for alias, key in {'chats':'chat-hotel', 'location':'pin',
                   'network':'hotel-network', 'profile':'nav-profile',
                   'return':'undo', 'rewards':'gift'}.items():
    runtime[alias] = runtime[key]
# No microphone is supplied by the atlas; retain the existing app asset.
filename = 'microphone.svg'
content = (ROOT / 'design/assets/icons-soft' / filename).read_bytes()
for directory in directories:
    (directory / filename).write_bytes(content)
hashes[filename] = hashlib.sha256(content).hexdigest()
runtime['microphone'] = {'file':filename, 'color':False}
manifest = {'name':'Ключи · Мягкий контур', 'revision':REVISION, 'source':SOURCE,
            'sourceSha256':hashlib.sha256(raw.encode()).hexdigest(),
            'catalogueCount':len(rows), 'v2':list(v2), 'items':assets, 'files':hashes}
(directories[0] / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'app/src/iconAtlas.json').write_text(json.dumps(runtime, ensure_ascii=False, indent=2) + '\n')
print(f'Imported {len(rows)} icons, including {len(v2)} exact v2 SVGs; {len(runtime)} names with aliases.')
