"""Обновление снимка достопримечательностей и пеших маршрутов для прототипа.

python3 scripts/refresh_nearby_2gis.py
Ключ: VITE_2GIS_MAP_KEY из окружения или app/.env.local. Не выводится в журнал.
Три поиска на отель, до восьми маршрутов. Существующий снимок заменяется
только после успешного получения всех поисковых ответов. Фото — отдельный
редакторский реестр spec/nearby-photos.json, Places API их не предоставляет.
"""
import concurrent.futures
import argparse
import datetime
import json
import math
import os
import hashlib
import html
import re
import tempfile
import threading
import time
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
RADIUS = 1500
QUERIES = ['Достопримечательности', 'Музеи', 'Парки']
ROUTING_LIMITED = threading.Event()
CACHE = Path(tempfile.gettempdir()) / 'keys-orbita-nearby-api'


def api(endpoint, key, params=None, body=None):
    fingerprint = hashlib.sha256(json.dumps([endpoint, params, body], sort_keys=True).encode()).hexdigest()
    cached = CACHE / (datetime.date.today().isoformat() + '-' + fingerprint + '.json')
    if cached.exists():
        return json.loads(cached.read_text())
    if 'routing.api' in endpoint and ROUTING_LIMITED.is_set():
        raise RuntimeError('2GIS Routing: лимит запросов')
    url = endpoint + '?' + urllib.parse.urlencode({'key': key, **(params or {})})
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            result = json.load(response)
            if result.get('meta', {}).get('code') == 200 or result.get('status') == 'OK':
                CACHE.mkdir(parents=True, exist_ok=True)
                cached.write_text(json.dumps(result, ensure_ascii=False))
            time.sleep(.2)
            return result
    except urllib.error.HTTPError as error:
        if error.code == 429 and 'routing.api' in endpoint:
            ROUTING_LIMITED.set()
        raise RuntimeError(f'2GIS HTTP {error.code}') from None
    except (OSError, ValueError):
        raise RuntimeError('2GIS: нет корректного ответа') from None


def distance(a, b):
    lon1, lat1, lon2, lat2 = map(math.radians, [*a, *b])
    h = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 6371000 * 2 * math.asin(min(1, math.sqrt(h)))


def normalize(item, origin):
    point = item.get('point')
    name = item.get('name')
    if not point or not name:
        return None
    coordinates = [point['lon'], point['lat']]
    meters = distance(origin, coordinates)
    if meters > RADIUS:
        return None
    rubrics = ' / '.join(r['name'] for r in item.get('rubrics', []))
    if any(word in rubrics.lower() for word in ['музе', 'галере']):
        category, icon, label = 'Музеи', 'ticket', 'Музей'
        about = 'Музейная остановка рядом с отелем. Перед посещением проверьте часы работы и доступность билетов.'
    elif any(word in rubrics.lower() for word in ['парки', 'ботаничес', 'сады', 'сквер']):
        category, icon, label = 'Прогулки', 'pin', 'Парк и сад'
        about = 'Зелёное место для прогулки недалеко от отеля. Вход на отдельные территории может быть платным.'
    elif item.get('subtype') in ['monument', 'decorative_building', 'fountain', 'street_art', 'point_of_interest'] or any(word in rubrics.lower() for word in ['памятник', 'интересные здания', 'достопримечательност', 'фонтаны', 'стрит-арт']):
        category, icon, label = 'Культура', 'ticket', item.get('subtype_name', 'Достопримечательность').capitalize()
        about = 'Городская достопримечательность, которую можно включить в прогулку от отеля.'
    else:
        return None
    if name.lower() in ['фонтан', 'аллея', 'граффити', 'мурал', 'парк', 'сквер', 'памятник', 'сооружение', 'административное здание', 'питьевая вода', 'музей']:
        return None
    return {'id': item['id'], 'name': name, 'category': category, 'categoryLabel': label,
            'icon': icon, 'about': about, 'coordinates': coordinates,
            'source': 'https://2gis.ru/' + ('firm/' if item['type'] == 'branch' else 'geo/') + item['id'],
            'radialDistanceMeters': round(meters, 2)}


def fetch_hotel(hotel_id, hotel, key):
    origin = hotel['coordinates']
    groups = []
    for query in QUERIES:
        response = api('https://catalog.api.2gis.com/3.0/items', key, {
            'q': query, 'point': ','.join(map(str, origin)), 'radius': RADIUS,
            'page_size': 10, 'sort': 'distance', 'fields': 'items.point,items.rubrics',
            **({'type': 'attraction'} if query == 'Достопримечательности' else {})})
        if response.get('meta', {}).get('code') == 404:
            groups.append([])
            continue
        if response.get('meta', {}).get('code') != 200:
            raise RuntimeError('2GIS: поиск недоступен')
        group = [p for i in response.get('result', {}).get('items', []) if (p := normalize(i, origin))]
        photo_ids = json.loads((ROOT / 'spec/nearby-photos.json').read_text())
        group.sort(key=lambda p: (p['id'] not in photo_ids, p['radialDistanceMeters']))
        groups.append(group)
    # Разные категории, без повторов, не только восемь ближайших памятников.
    places, names = {}, set()
    for index in range(10):
        for group in groups:
            if index >= len(group):
                continue
            p = group[index]
            if p['id'] not in places and p['name'].casefold() not in names:
                places[p['id']] = p
                names.add(p['name'].casefold())
                if len(places) == 8:
                    break
        if len(places) == 8:
            break
    rows = sorted(places.values(), key=lambda p: p['radialDistanceMeters'])
    for place in rows:
        try:
            response = api('https://routing.api.2gis.com/routing/7.0.0/global', key, body={
                'points': [{'type': 'stop', 'lon': c[0], 'lat': c[1]} for c in [origin, place['coordinates']]],
                'transport': 'walking', 'output': 'summary', 'locale': 'ru'})
            routes = [r for r in response.get('result', []) if r.get('duration', 0) > 0 and r.get('length', 0) > 0]
            if routes:
                route = min(routes, key=lambda r: r['duration'])
                place['walk'] = {'distanceMeters': route['length'], 'durationSeconds': route['duration']}
        except RuntimeError:
            pass  # Без маршрута показываем расстояние по прямой, не выдумываем минуты.
    return hotel_id, rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skip-routing', action='store_true', help='Обновить только места без запросов к Routing API')
    args = parser.parse_args()
    if args.skip_routing:
        ROUTING_LIMITED.set()
    key = os.environ.get('VITE_2GIS_MAP_KEY')
    if not key:
        env = ROOT / 'app/.env.local'
        for line in env.read_text().splitlines() if env.exists() else []:
            if line.startswith('VITE_2GIS_MAP_KEY='):
                key = line.split('=', 1)[1].strip().strip('\"\'')
    if not key:
        raise SystemExit('Укажите VITE_2GIS_MAP_KEY')
    hotels = json.loads((ROOT / 'spec/map-locations.json').read_text())
    target = ROOT / 'spec/nearby-places.json'
    previous = json.loads(target.read_text()) if target.exists() else {}
    result = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        tasks = [pool.submit(fetch_hotel, hotel_id, hotel, key) for hotel_id, hotel in hotels.items()]
        for task in concurrent.futures.as_completed(tasks):
            hotel_id, places = task.result()
            # Сохраняем ранее полученные маршруты только для тех же точек и даты.
            if previous.get('checkedAt') == datetime.date.today().isoformat() and previous.get('origins', {}).get(hotel_id) == hotels[hotel_id]['coordinates']:
                old = {p['id']: p for p in previous.get('hotels', {}).get(hotel_id, [])}
                for p in places:
                    cached = old.get(p['id'], {})
                    if 'walk' not in p and cached.get('coordinates') == p['coordinates'] and cached.get('walk'):
                        p['walk'] = cached['walk']
            result[hotel_id] = places
            print(hotel_id, len(places), 'мест', flush=True)
    identifiers = list({p['id'] for rows in result.values() for p in rows})
    descriptions = {}
    for offset in range(0, len(identifiers), 100):
        response = api('https://catalog.api.2gis.com/3.0/items/byid', key, {
            'id': ','.join(identifiers[offset:offset+100]), 'fields': 'items.description'})
        for item in response.get('result', {}).get('items', []):
            plain = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', item.get('description', '')))).strip()
            if not plain:
                continue
            ends = [m.end() for m in re.finditer(r'[а-яёa-z0-9»”")][.!?](?=\s|$)', plain)]
            end = next(iter(ends), len(plain))
            if len(ends) > 1 and ends[1] <= 300:
                end = ends[1]
            short = plain[:end]
            if len(short) > 300:
                short = short[:297].rsplit(' ', 1)[0] + '…'
            descriptions[item['id']] = short
    for rows in result.values():
        for p in rows:
            if p['id'] in descriptions:
                p['about'] = descriptions[p['id']]
                p['aboutSource'] = '2gis'
    snapshot = {'checkedAt': datetime.date.today().isoformat(), 'radiusMeters': RADIUS,
                'provider': '2GIS Places API / Routing API', 'origins': {k:v['coordinates'] for k,v in hotels.items()},
                'hotels': dict(sorted(result.items()))}
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(target)
    if ROUTING_LIMITED.is_set() and not args.skip_routing:
        print('Лимит Routing API: для мест без маршрута показано только расстояние по прямой.')


if __name__ == '__main__':
    main()
