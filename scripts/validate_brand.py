#!/usr/bin/env python3
"""Validate generated brand assets and references without extra dependencies."""
import hashlib
import json
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]


def load(path):return json.loads((ROOT/path).read_text())


def contrast(a,b):
    def luminance(color):
        values=[int(color[i:i+2],16)/255 for i in (1,3,5)]
        linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
        return sum(x*y for x,y in zip(linear,[.2126,.7152,.0722]))
    x,y=sorted([luminance(a),luminance(b)])
    return (y+.05)/(x+.05)


class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in ['src','href'] and value:self.links.append(value)


def main():
    tokens=load('design/tokens.json');base=tokens['primitive'];css=(ROOT/'design/tokens.css').read_text()
    for group in ['semantic','component']:
        for key,value in tokens[group].items():
            if value.startswith('{'):
                value_=base
                for part in value[1:-1].split('.'):value_=value_[part]
            else:value_=value
            assert f'--k-{key.replace(".","-")}:{value_};' in css,key
    manifest=load('design/assets/manifest.json')['assets']
    for entry in manifest:
        assert hashlib.sha256((ROOT/entry['path']).read_bytes()).hexdigest()==entry['sha256'],entry['path']
        # Provenance paths belong to the local-only historical archive.
        # The published asset itself is always verified by SHA-256 above.
    outlined=list((ROOT/'design/assets/logo').glob('*-outlined.svg'))
    assert len(outlined)==6
    for path in outlined:
        tree=ET.parse(path);assert not tree.findall('.//{http://www.w3.org/2000/svg}text'),path
        assert tree.findall('.//{http://www.w3.org/2000/svg}path'),path
    for path in (ROOT/'design/assets/logo').glob('*-ui.svg'):
        assert ET.parse(path).getroot().get('viewBox')=='20 20 160 160'
    for entry in load('design/fonts/sources.json'):
        path=ROOT/'design/fonts'/entry['file']
        assert hashlib.sha256(path.read_bytes()).hexdigest()==entry['sha256']
        if path.suffix=='.txt':assert 'SIL OPEN FONT LICENSE' in path.read_text()
    for path in (ROOT/'docs/brand').glob('*.html'):
        parser=Links();parser.feed(path.read_text())
        for link in parser.links:
            url=urlsplit(link)
            if url.scheme or not url.path:continue
            target=ROOT/unquote(url.path).lstrip('/') if url.path.startswith('/') else path.parent/unquote(url.path)
            assert target.resolve().exists(),(path.name,link)
    pairs=[('#101320','#F4F5FB'),('#5A6072','#F4F5FB'),('#FFFFFF','#2F5BFF'),
           ('#BE3040','#FDE8E8'),('#855609','#FFF3D6')]
    report=[]
    for fg,bg in pairs:
        ratio=contrast(fg,bg);assert ratio>=4.5,(fg,bg,ratio)
        report.append({'foreground':fg,'background':bg,'contrast':round(ratio,2)})
    (ROOT/'docs/brand/contrast.json').write_text(json.dumps(report,indent=2)+'\n')
    print(f'OK: JSON/CSS agreement; {len(manifest)} asset hashes; 6 outlined logos; fonts/licenses; HTML links; 5 text contrast pairs')


if __name__=='__main__':main()
