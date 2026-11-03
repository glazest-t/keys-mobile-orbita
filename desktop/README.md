# Ключи — десктопная версия

[Десктопный прототип](https://glazest-t.github.io/keys-mobile-orbita/desktop/) · [Проверка сценариев](https://glazest-t.github.io/keys-mobile-orbita/desktop/review.html) · [Мобильный прототип](https://glazest-t.github.io/keys-mobile-orbita/prototype/)

Публикация разрешена пользователем 03.11.2026. Актуальная инструкция: [десктоп для разработки](../docs/handoff/DESKTOP.md).

Установка: `npm --prefix app ci`, `npm --prefix desktop ci`. Запуск: `npm --prefix desktop run dev` (порт 5180). Сборка всего сайта: `npm --prefix app run build:pages`. TypeScript: `npm --prefix desktop run typecheck`. Доменная проверка доступа: `npm --prefix desktop run test:access`.

Общая модель и компоненты — app/src; платформенный адаптер — src/platform.tsx; стили десктопа — src/*.css. Реальная карта 2ГИС использует настройку app/.env; платежи, SMS и ключ остаются демонстрационными.

Локально порты разделяют хранилища. На Pages обе версии имеют общий origin и совместимые данные. Каталог сценариев всегда изолирован от пользовательского состояния.

[План и история](PLAN.md) · [Контракт](CONTRACT.md) · [Покрытие](COVERAGE.md). Даты старых проверок не означают повторную проверку в текущем выпуске.
