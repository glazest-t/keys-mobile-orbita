#!/usr/bin/env python3
"""Check source integrity and coverage of the iteration-one specification."""
import hashlib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads((ROOT / path).read_text())


def main():
    inventory = read('docs/inventory/sources.json')
    source_root = ROOT / inventory['source']
    archived=(ROOT/'publish/archived-visuals.json').exists()
    for entry in (inventory['files'] if source_root.exists() else []):
        # Git stores NFC filenames; macOS also resolves decomposed Unicode, Linux does not.
        blob = (source_root / unicodedata.normalize('NFC', entry['path'])).read_bytes()
        assert len(blob) == entry['bytes'], entry['path']
        assert hashlib.sha256(blob).hexdigest() == entry['sha256'], entry['path']
    assert source_root.exists() or archived, 'Missing source archive without explicit archival record'
    for entry in read('docs/inventory/user-documents.json')['documents']:
        assert hashlib.sha256((ROOT / entry['file']).read_bytes()).hexdigest() == entry['sha256']

    catalog = read('spec/routes.json')
    routes = catalog['routes']
    source = (ROOT / catalog['source']).read_text()
    source_ids = set(re.findall(r'^### ([A-IK-Z]\d{2})\s', source, re.M))
    assert len(routes) == len(source_ids) == 99
    assert {r['id'] for r in routes} == source_ids
    for route in routes:
        assert 3 <= route['iteration'] <= 7
        assert route['route'].startswith('/')
        assert route['presentation'] in {'screen', 'sheet', 'flow', 'state', 'action'}
        assert source.splitlines()[route['source_line']-1].startswith('### ' + route['id'])
    for platform, filename, count in [('mobile','project/Ключи - Все экраны.dc.html',117),
                                      ('desktop','project/Ключи - Десктоп.dc.html',41)]:
        original = next(h for h in inventory['html'] if h['file'] == filename)
        ids = {screen['source_id'] for screen in original['screens']}
        mapped = {id_ for r in routes for id_ in r[platform + '_refs']}
        extras = {x['id'] for x in catalog['extra_designs'] if x['platform'] == platform}
        assert len(ids) == count
        assert mapped | extras == ids, (platform, ids - mapped - extras, mapped - ids)
    assert all('b2' not in r['mobile_refs'] for r in routes)
    assert next(x for x in catalog['extra_designs'] if x['id'] == 'b2')['disposition'] == 'excluded_by_user'
    journeys = read('spec/journeys.json')['journeys']
    assert len(journeys) == 23
    assert {j['id'] for j in journeys} == {f'J{i:02}' for i in range(1,24)}
    for journey in journeys:
        assert set(journey['functional_refs']) <= source_ids
    policies = read('spec/policies.json')['approved']
    assert policies['onlineRegistration']['enabled'] is False
    assert policies['digitalKey']['visibleBeforeCheckIn'] is False
    assert policies['points']['maxCoveragePercent'] == 100
    assert policies['friendlyRate']['hotelLoyaltyAllowed'] is False

    # Verify relative links in the deliverable, excluding heading fragments.
    for doc in (ROOT / 'docs/iteration-1').glob('*.md'):
        for target in re.findall(r'\]\(([^)]+)\)', doc.read_text()):
            target = target.split('#')[0]
            if target and '://' not in target:
                assert (doc.parent / target).exists(), (doc.name, target)
    print('OK: '+('local archive hashes; ' if source_root.exists() else 'visual sources explicitly archived; ')+'DOCX; 99 functional references; historical design mapping; 23 journeys; policies and deliverable links')


if __name__ == '__main__':
    main()
