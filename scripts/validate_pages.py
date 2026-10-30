#!/usr/bin/env python3
"""Check the deploy artifact (not source files) at its GitHub project subpath."""
import re
import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

ROOT=Path(__file__).resolve().parents[1]/'_site'
BASE='/keys-mobile-orbita/'

class Resources(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        for key in ['src','href']:
            if key in attrs and (tag in ['script','link','img','iframe'] or (tag=='a' and attrs[key].startswith(BASE))):
                self.links.append(attrs[key])

def target(href,parent):
    u=urlsplit(href)
    if u.scheme or u.netloc or not u.path:return None
    p=unquote(u.path)
    if p.startswith(BASE):return ROOT/p[len(BASE):]
    if p.startswith('/'):raise AssertionError('Outside GitHub project: '+href)
    return parent/p

assert (ROOT/'.nojekyll').exists()
files=['index.html','screens.html','documentation.html','prototype/index.html','docs/brand/index.html']
files += [str(p.relative_to(ROOT)) for p in (ROOT/'docs/handoff').glob('*.html')]
files += ['README.html','docs/DEPLOYMENT.html','docs/MOBILE-REVIEW.html','docs/references/README.html']
count=0
for name in files:
    p=ROOT/name; text=p.read_text();parser=Resources();parser.feed(text)
    for href in parser.links:
        assert not re.match(r'http://(?:127\.0\.0\.1|localhost):(?:5173|4173)',href),(name,href)
        q=target(href,p.parent)
        if q:
            assert q.exists(),(name,href)
            count+=1
for p in (ROOT/'prototype/assets').glob('*'):
    if p.suffix not in ['.js','.css']:continue
    text=p.read_text()
    assert not re.search(r'''["'`(]/(?:brand|assets|hotels|design-previews)/''',text),p.name
    for href in re.findall(r'''["'(]('''+BASE+r'''prototype/[^\s"'`()<>{}]+)''',text):
        # Dynamic template suffixes aren't statically resolvable; inspect concrete files.
        if '$' in href or not re.search(r'\.(?:svg|png|jpe?g|webp|woff2?|ttf|mp4)$',href):continue
        q=target(href,p.parent)
        assert q.exists(),(p.name,href)
        count+=1
print(f'OK: project base, entry pages, {count} published links/assets; no root-only app URLs')

scenes=json.loads((ROOT/'screens.json').read_text())
assert len({s['id'] for s in scenes})==len(scenes), 'Duplicate scene ID'
html=(ROOT/'screens.html').read_text()
assert len(re.findall('data-scene="',html))==len(scenes)
assert all('data-scene="'+s['id']+'"' in html for s in scenes)
for name in ['index.html','screens.html','documentation.html','docs/brand/index.html']:
    text=(ROOT/name).read_text()
    assert 'проект в Клоде' not in text and 'reference/f1.html' not in text, name
for directory in ['проект в Клоде','docs/brand/reference','prototype/design-previews']:
    assert not (ROOT/directory).exists(), directory
print(f'OK: {len(scenes)} unique current previews; obsolete visual references absent')
