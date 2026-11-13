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
files=['store-kit/index.html','index.html','screens.html','documentation.html','prototype/index.html','desktop/index.html','desktop/review.html','docs/brand/index.html']
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
for surface in ['prototype','desktop']:
 for p in (ROOT/surface/'assets').glob('*'):
     if p.suffix not in ['.js','.css']:continue
     text=p.read_text()
     assert not re.search(r'''["'`(]/(?:brand|assets|hotels|design-previews)/''',text),p.name
     for href in re.findall(r'''["'(]('''+BASE+surface+r'''/[^\s"'`()<>{}]+)''',text):
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
for directory in ['проект в Клоде','docs/brand/reference','prototype/design-previews','desktop/design-previews']:
    assert not (ROOT/directory).exists(), directory
print(f'OK: {len(scenes)} unique current previews; obsolete visual references absent')

# Verify both blur declarations in the actual search-overlay rules, not a
# substring match ("backdrop-filter" also occurs in "-webkit-backdrop-filter").
for surface in ['prototype','desktop']:
    css=''.join(p.read_text() for p in (ROOT/surface/'assets').glob('*.css'))
    rules=[body for selector,body in re.findall(r'([^{}]+)\{([^{}]*)\}',css)
           if '.sheet-overlay' in selector and '.search-journey' in selector]
    for prop in ['backdrop-filter','-webkit-backdrop-filter']:
        assert any(re.search(r'(?:^|;)\s*'+re.escape(prop)+r':\s*blur\(14px\)(?:;|$)',body) for body in rules), (surface, 'Missing search blur', prop)
print('OK: search backdrop blur retained for standard browsers and Safari')

# Public store gallery and downloadable bundle must be self-contained.
from zipfile import ZipFile
kit=ROOT/'store-kit'
assert not (kit/'source').exists()
with ZipFile(kit/'keys-store-kit.zip') as bundle:
    assert bundle.testzip() is None
for store,folder,total in [('rustore','screenshots',7),('google-play','screenshots',7),('app-store','iphone-large',7),('app-store','iphone-medium',7)]:
    assert len(list((kit/store/folder).glob('*.jpg')))==total
print('OK: store gallery, 28 screenshots and ZIP bundle')
