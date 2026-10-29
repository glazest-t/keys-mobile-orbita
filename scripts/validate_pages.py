#!/usr/bin/env python3
"""Check the deploy artifact (not source files) at its GitHub project subpath."""
import re
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
count=0
for name in files:
    p=ROOT/name; text=p.read_text();parser=Resources();parser.feed(text)
    assert 'http://127.0.0.1:' not in text and 'http://localhost:' not in text,name
    for href in parser.links:
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
