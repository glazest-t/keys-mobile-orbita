# Уровни программы отеля — 30.10.2026

Реализованы L04 и v3: текущий уровень, баланс, скидка/начисление, прогресс и пять раскрываемых уровней с условиями и привилегиями. Композиция карточки опирается на «Все экраны»: фото с подложкой названия, числовые показатели, прогресс, список уровней и условия. Баллы отеля нейтральные, скидка зелёная; орбита кошелька «Ключей» не используется.

## Проверка

- В браузере открыты Mantera (скидка + баллы), «Орбита в лесу» (только баллы), шторка уровня «Знаток». Снимки 01–03. Кнопка «Понятно» закрывает шторку.
- 355 тестов проходят. Новые проверки: границы/высший уровень, смена года, изоляция владельца/отеля, изменение новой цены без изменения прежней брони, Friendly Rate, начисление после выезда, идемпотентность, отмена, полное списание баллов, миграция.
- Сборка TypeScript/Vite и целостность 28 файлов runtime пройдены.

## Рабочие демонстрационные правила

Пять уровней по v3: Гость, Ценитель, Знаток, Эксперт, Легенда. Пороги 0 / 40 / 80 / 150 / 300 тыс. ₽ за календарный год, начисления 3 / 5 / 7 / 10 / 15% для бонусных программ. Скидки зависят от отеля: начальная скидка из прежнего каталога, прибавки 0 / 0 / 2 / 5 / 10 п.п., предел 25%. Программы только баллов остаются без скидок, скидочные — без начислений. Привилегии тестовые и зависят от доступности/тарифа.

Прогресс считается по денежной части проживания после выезда, услуги исключены; при смешанном заказе баллы сначала уменьшают учитываемое проживание. На новом календарном году прогресс начинается заново, накопленный кошелёк сохраняется. Уровень и процент начисления фиксируются в момент нового бронирования; повышенный уровень используется для следующих броней. Начисление в целых баллах с округлением вниз. Повтор выезда не начисляет снова. Friendly Rate не участвует в программе отеля.

Начальное демо: 61 600 ₽ прогресса Mantera и 46 000 ₽ «Орбиты в лесу» за текущий год. Это отдельный однократный демопоказатель, а не дополнительные деньги или баллы. Старые брони без снимка условий задним числом не участвуют в начислении; их цена сохранена. Год/уровни и привилегии — рабочие настройки для проверки, не утверждённая коммерческая программа отелей. Реальной интеграции нет.

## Универсальный блок «Уровни отеля» — уточнение дизайна

По запросу пользователя список с буквенными монограммами заменён отдельными карточками. `HotelLevels.tsx` принимает произвольные названия, условия получения, описание и необязательные метки выгод. Компонент не задаёт валюту, пороги, названия или количество уровней. Скидка, начисление и привилегии визуально разделены; текущий уровень использует общий зелёный StatusBadge с галочкой. Карточка целиком открывает существующие подробности.

На стенде с шириной карточки 288 px проверены скидочная, бонусная, привилегированная и смешанная программы, длинное название, описание и разные формулировки условий. Это проверка универсальности представления; расчёт квалификации по ночам/приглашению в финансовую модель не добавлялся. Действующие коммерческие расчёты не менялись. Снимки 04–06: примеры наполнения, новый экран, сравнение блока до/после. Условия текущего уровня открываются из карточки. Временная страница проверки убрана из приложения; сохранён fixture для повторной визуальной проверки.

## Таймлайн поверх текущих карточек

Пользователь выбрала текущие карточки плюс линию из третьего концепта, оформленную как история поездок. Использованы общие стили узлов history-timeline-item (9 px + белое кольцо 4 px) и смысловые цвета: пройденный зелёный, текущий кобальтовый, будущий серый. Соединители по одному между карточками учитывают их высоту, после последнего узла линия отсутствует. Снимки 10–11 — исходный таймлайн истории и применение к уровням. Сборка и проверка runtime пройдены.

## Выбранный вариант выделения — 30.10.2026

Применён вариант 1: кобальтовая карточка текущего уровня, белый текст, полупрозрачные плашки скидки и баллов, зелёный статус. Проверено в браузере на Mantera: скидка, баллы и привилегия читаются, статус помещается в одну строку, таймлайн сохранён. Скриншот: `12-cobalt-current.png`. Защищённый runtime проверен.

## Mint current hotel level — 2026-10-30
Source: /Users/tatyana.glazyrina/.codex/generated_images/01a15f51-a729-7521-8664-1d3c42c39e78/exec-2c0a0e87-646e-4ee6-b0fc-a95abc928dfe.png (1086x1448).
Implementation: design/hotel-levels-qa/13-mint-current.png (1429x1223 screenshot, 393x852 phone). State: orbit-forest, current second level.
Focused normalized comparison: design/hotel-levels-qa/14-mint-comparison.png; both cards scaled/cropped to 335px width. Full screenshot checked for surrounding layout.
Typography: existing Onest sizes retained. Layout: existing card geometry and timeline retained. Colors: mint surface, green border, dark text, white benefit chip match selected direction. Assets: existing icons retained, no new raster assets needed. Copy: privilege count intentionally omitted per subsequent user decision. Fixed booking action retained.
No actionable P0/P1/P2 findings within requested color treatment. First comparison passed. Runtime integrity passed (28 files).
final result: passed

## 2026-10-30: current hotel level, selected option 3
Source: /Users/tatyana.glazyrina/.codex/generated_images/01a15f51-a729-7521-8664-1d3c42c39e78/exec-0af7d1c2-6fba-40a3-9977-5b8f38dc5262.png (1086x1448).
Rendered evidence: design/hotel-levels-qa/15-white-spine-current.png (1429x1223, phone 393x852). State: orbit-forest, second level current. Full screenshot reviewed for surrounding layout.
Focused comparison: design/hotel-levels-qa/16-white-spine-comparison.png, source and implementation card crops normalized to 335px width.
Typography: existing Onest metrics retained. Layout: existing spacing and radii retained, 5px left accent added. Colors: white surface, cobalt title/accent, neutral points chip, green status match selected direction. Assets: original UI icons retained; no new raster needed. Copy: privilege count deliberately remains absent per later instruction. Timeline and floating booking action preserved.
No actionable P0/P1/P2 findings in requested treatment. Comparison passed on first iteration. Runtime integrity passed (28 files).
final result: passed
