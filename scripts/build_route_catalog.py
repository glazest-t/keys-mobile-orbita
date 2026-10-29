#!/usr/bin/env python3
"""Build a reviewed functional-to-design crosswalk, preserving source IDs."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# ID | presentation | iteration | URL or owning route | mobile refs | desktop refs
# References identify visual starting points, not implemented behavior or exact parity.
MAPPING = """
A01|flow|3|/welcome|o1,o2,o3,o4,o5,o6|-
A02|screen|3|/auth/phone|a1|g3
A03|screen|3|/auth/code|a2,e3|g4
A04|screen|3|/auth/name|a3|g5
A05|screen|7|/invite/hotelier/:inviteId|z1,fr1|zd1
A06|screen|7|/hotel-status/request|z2|zd2
A07|state|7|/hotel-status|z3,z4,z5,z6|zd3,zd4
A08|sheet|7|/profile|fr2,fr6,i2|p2
A09|flow|4|/checkout/:draftId|g1|g3,g4,g5
F01|screen|4|/find|f1,k5|g1,l1,d1,s1
F02|sheet|4|/find|k3|s2
F03|sheet|4|/find|k3g,k3|s3
F04|screen|4|/search|c1,k4|d2
F05|sheet|4|/search|k1|d2
F06|screen|4|/search/map|c2,k2|d2
F07|screen|6|/discover/swipe|q3|-
F08|screen|6|/collections/:collectionId|f1|-
F09|sheet|6|/price-alerts|w1|-
F10|screen|6|/favorites|fv1,fv4,fv5|d7
F11|screen|6|/favorites/:listId|fv2,fv2a,fv3,fv6|d7
Q01|screen|6|/discover|nc1|w1
Q02|screen|6|/discover/destination|nc2,nc3|w2
Q03|screen|6|/discover/company|nc2|w2
Q04|flow|6|/discover/preferences|nc4,nc5,nc6,nc7,nc8,nc11|w3,w4,w5
Q05|screen|6|/discover/results|nc9,nc10,nc12,r1|w5,w6
Q06|screen|6|/find/advice|nc1|w1
H01|screen|4|/hotels/:hotelId|h1,fr3,h2,fr5|g2,d3,h1a,fr3d
H02|screen|4|/hotels/:hotelId/gallery|h9,gl1|h1g
H03|screen|4|/hotels/:hotelId/reviews|x1|d3
H04|screen|4|/hotels/:hotelId/map|h1|d3
B01|screen|4|/hotels/:hotelId/rooms|tv2b,fr4|g2,d3
B02|sheet|4|/hotels/:hotelId/rooms|tv2c,rm1,gl1|h1b,h1c,h1g
B03|sheet|4|/checkout/:draftId|k3,k3g|s2,s3
B04|screen|4|/checkout/:draftId/guest|h5|d4
B05|sheet|4|/checkout/:draftId/guest|h5|d4
B06|screen|4|/checkout/:draftId/summary|h6,h7,h2,fr5|d4
B07|flow|4|/checkout/:draftId/payment|h7,e4|d4
B08|screen|4|/bookings/:bookingId/confirmation|h8|-
B09|screen|4|/bookings/:bookingId|d1,u1b|d5,d5d
B10|flow|7|/loyalty/connect/:hotelId|l1|-
M01|sheet|4|/bookings/:bookingId|d1|d5d
M02|flow|4|/bookings/:bookingId/change|b3|-
M03|sheet|4|/bookings/:bookingId/cancel|d3|-
M04|state|4|/bookings/:bookingId|d3|-
M05|screen|4|/bookings/:bookingId/documents|d2|d5d
M06|screen|5|/bookings/:bookingId/documents|d2|-
T01|state|3|/trips|t0,t1|t1
T02|state|4|/trips|u1b|d5
T03|state|5|/trips|s2|-
T04|state|5|/trips|s3|-
T05|screen|5|/bookings/:bookingId|d1|d5d
T06|screen|5|/bookings/:bookingId/arrival|d4|-
T07|screen|5|/bookings/:bookingId/route|d5,d5b|d5e
T08|state|5|/trips|s4|-
U01|screen|5|/bookings/:bookingId/services|sv1|d5c
U02|flow|5|/bookings/:bookingId/services/food|sv2|-
U03|flow|5|/bookings/:bookingId/services/room|sv1,sv2|d5c
U04|screen|5|/bookings/:bookingId/bill|s5|-
U05|flow|5|/bookings/:bookingId/problem|s6|-
U06|sheet|5|/bookings/:bookingId/services/breakfast|sv3|d5b
U07|sheet|5|/bookings/:bookingId/services/time|d6,s3|-
U08|flow|5|/bookings/:bookingId/key|s2,s3|-
U09|flow|5|/bookings/:bookingId/wifi|wf1,wf1b,wf2|-
U10|screen|5|/bookings/:bookingId/nearby|n1|n1
U11|screen|5|/places/:placeId|n1|n1
R01|screen|5|/bookings/:bookingId/review|x2|-
R02|screen|5|/bookings/:bookingId/review/details|x2|-
R03|state|5|/bookings/:bookingId/review/success|x2|-
S01|sheet|4|/hotels/:hotelId|h1|d3
S02|sheet|7|/bookings/:bookingId/share|-|-
S03|screen|7|/shared/trip/:shareId|-|-
S04|action|4|/bookings/:bookingId/confirmation|h8|-
C01|screen|5|/chats|ch1|c3
C02|screen|5|/chats/:hotelId|ch2|c3
C03|screen|5|/chats/new|-|c3
N01|screen|5|/notifications|n2|-
N02|action|5|/notifications|n2,pn3|-
L01|screen|7|/rewards|v1|d6
L02|screen|7|/rewards/keys|v2,v5|d6
L03|screen|7|/rewards/hotels|v4|-
L04|screen|7|/rewards/hotels/:hotelId|v3,lp1,lp2,lp3|v7
L05|screen|7|/rewards/networks/:networkId|lp4,lp5|-
L06|sheet|7|/invite/friend|i1|-
P01|screen|3|/profile|p1,fr2|p1,p2
P02|screen|3|/profile/travelers|-|-
P03|screen|3|/profile/travelers/:travelerId|-|-
P04|flow|3|/profile/travelers/:travelerId/edit|-|-
P05|screen|5|/profile/history|p3|-
P06|screen|5|/profile/history/:bookingId|p3,d1,x2|-
P07|screen|7|/profile/notifications|p6|-
P08|screen|7|/profile/security|p6|-
P09|flow|7|/profile/security/pin|-|-
P10|screen|7|/profile/security/sessions|-|-
P11|screen|5|/support|-|-
P12|screen|5|/support/articles/:articleId|-|-
P13|flow|5|/support/new|-|-
P14|screen|5|/support/requests/:requestId|-|-
P15|screen|7|/profile/data|p6|-
P16|flow|7|/profile/data/deletion|-|-
"""

NOTES = {
    'A01': 'Две визуальные версии трёх шагов; выбор композиции в итерации 3.',
    'A03': 'Рабочая функциональная база: 123456, срок 5 мин, повтор 30 с; конфликт с UI kit фиксируется в логике.',
    'A07': 'Актуальный requestId/email; отклонять устаревшие ответы; отказ не закрывает обычные тарифы.',
    'F08': 'В макете есть точка входа, полный экран подборки надо собрать.',
    'F11': 'Рабочая функциональная база — 1000 символов; UI kit 140 не переносится автоматически.',
    'H03': 'Единая шкала отзывов 1–5; звёздность хранится отдельно.',
    'B05': 'Форма дополнительного гостя требует отдельной композиции.',
    'B10': 'Подключение программы отеля демонстрационное; пароль не сохраняется.',
    'M04': 'Успешная отмена требует нового визуального состояния.',
    'M06': 'Различать просмотр, скачивание подтверждения и сводку; не выдавать демофайл за чек.',
    'U02': 'Карточка заказа есть; корзина блюд и детализация статусов требуют расширения.',
    'U08': 'В макетах есть кнопка; подтверждение, ошибка и истечение ключа требуют расширения.',
    'U11': 'Список мест есть; подробную карточку надо спроектировать.',
    'R03': 'Подтверждение отзыва входит в итерацию 5. Чаевые — отдельный отложенный вариант, не обязательный шаг.',
    'S02': 'Только демонстрационная ссылка/QR. Реальная передача прав к ключу не входит в объём.',
    'S03': 'Обработка неизвестной/устаревшей ссылки; никакой выдачи серверных прав по URL.',
    'P01': 'Функциональный состав из документа; визуальный язык из макета, старые пункты не копировать слепо.',
    'P06': 'Единая история новых броней и общий источник отзывов вместо двух несвязанных хранилищ.',
    'P08': 'Демонстрация настроек доступа, без утверждения настоящей защиты.',
    'P16': 'Локальная модель запроса и отмены запроса; без настоящего удаления серверного аккаунта.',
}

EXTRA_DESIGNS = [
    {'platform':'mobile','id':'b2','iteration':None,'disposition':'excluded_by_user','reason':'Онлайн-регистрация исключена пользователем. Исходный макет хранится только как история.'},
    {'platform':'mobile','id':'p4','iteration':6,'disposition':'reuse_in_feature','reason':'Предпочтения редактируются в подборе; отдельный пункт корня профиля не навязывается.'},
    {'platform':'mobile','id':'p5','iteration':4,'disposition':'reuse_in_feature','reason':'Варианты оплаты используются в оформлении; хранение реальных карт не реализуется.'},
    {'platform':'mobile','id':'e1','iteration':3,'disposition':'global_state','reason':'Общее состояние отсутствия сети; доступность ключа определяется отдельно.'},
    {'platform':'mobile','id':'pn1','iteration':9,'disposition':'reference_only','reason':'Макет системного push; в браузерном прототипе проверяем уведомления внутри приложения.'},
    {'platform':'mobile','id':'pn2','iteration':9,'disposition':'reference_only','reason':'Макет системного push с действием; реальные системные уведомления вне первой версии.'},
]


def main():
    source_path = ROOT / 'docs/references/screens-flows-2026-10-21.md'
    source = source_path.read_text()
    headings = list(re.finditer(r'^### ([A-Z]\d{2})\s+(.+)$', source, re.M))
    sections = {}
    for index, match in enumerate(headings):
        end = headings[index+1].start() if index+1 < len(headings) else source.index('## 14 ')
        sections[match[1]] = {'title':match[2], 'body':source[match.end():end].strip(), 'line':source[:match.start()].count('\n')+1}
    # The last functional paragraph precedes section 13; a section heading is not part of its content.
    for value in sections.values():
        value['body'] = re.split(r'^## ', value['body'], maxsplit=1, flags=re.M)[0].strip()
    routes = []
    for row in MAPPING.strip().splitlines():
        id_, kind, iteration, route, mobile, desktop = row.split('|')
        refs = lambda value: [] if value == '-' else value.split(',')
        item = sections[id_]
        routes.append({'id':id_,'title':item['title'],'presentation':kind,'iteration':int(iteration),
                       'route':route,'mobile_refs':refs(mobile),'desktop_refs':refs(desktop),
                       'mapping_status':'needs_new_design' if mobile == '-' else 'starting_point_requires_review',
                       'source_line':item['line'],'notes':NOTES.get(id_,'Сопоставление по назначению; состояния и поведение проверять по функциональному описанию.')})
    assert {r['id'] for r in routes} == {k for k in sections if not k.startswith('J')}
    journeys = []
    for id_, item in sections.items():
        if id_.startswith('J'):
            journeys.append({'id':id_,'title':item['title'],'source_line':item['line'],
                             'source_description':item['body'],
                             'functional_refs':list(dict.fromkeys(re.findall(r'\b[A-IK-Z]\d{2}\b',item['body']))),
                             'implementation_status':'not_implemented','test_status':'planned'})
    (ROOT/'spec').mkdir(exist_ok=True)
    metadata={'version':1,'status':'iteration_1_working_baseline','source':'docs/references/screens-flows-2026-10-21.md',
              'mapping_note':'Reviewed functional grouping. References are visual starting points, not claims of equivalent behavior. Desktop implementation is iteration 8.',
              'routes':routes,'extra_designs':EXTRA_DESIGNS}
    (ROOT/'spec/routes.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'spec/journeys.json').write_text(json.dumps({'version':1,'journeys':journeys},ensure_ascii=False,indent=2)+'\n')
    lines=['# Карта экранов и сценариев','',
           '99 функциональных описаний сопоставлены с визуальными исходниками. Это карта для реализации; она не означает готовность экранов. `screen` — страница, `sheet` — слой над ней, `flow` — несколько шагов, `state` — состояние, `action` — действие без отдельной страницы.',
           '', 'Одинаковый путь у нескольких ID означает общий экран или контекст. Например, состояния «Поездок» используют `/trips`, а вложенная шторка сохраняет маршрут и инициатора. Десктоп реализуется в итерации 8; столбец итерации относится к мобильной логике.', '',
           '| ID | Экран или состояние | Тип | Итерация | Мобильные макеты | Десктопные макеты |',
           '|---|---|---|---|---|---|']
    for r in routes:
        lines.append(f"| {r['id']} | {r['title']} | {r['presentation']} | {r['iteration']} | {', '.join(r['mobile_refs']) or 'Нужен новый макет'} | {', '.join(r['desktop_refs']) or 'Нужна адаптация'} |")
    lines += ['','## Важные различия','']
    for id_,note in NOTES.items(): lines.append(f'- **{id_}:** {note}')
    lines += ['','## Дополнительные визуальные состояния','']
    for x in EXTRA_DESIGNS:
        phase = f"итерация {x['iteration']}" if x['iteration'] is not None else 'исключено из объёма'
        lines.append(f"- **{x['id']}**, {phase}: {x['reason']}")
    lines += ['','## Сквозные проверки','',
              'Исходные J01–J23 сохранены в [машинном каталоге](../../spec/journeys.json). Ожидаемое поведение новой версии уточняется в [спецификации логики](LOGIC.md); ограничения старой версии не считаются целевыми требованиями.', '',
              '| ID | Сценарий |', '|---|---|']
    for j in journeys:lines.append(f"| {j['id']} | {j['title']} |")
    (ROOT/'docs/iteration-1').mkdir(exist_ok=True)
    (ROOT/'docs/iteration-1/ROUTES.md').write_text('\n'.join(lines)+'\n')
    print(f'{len(routes)} functional descriptions, {len(journeys)} journeys')


if __name__ == '__main__':
    main()
