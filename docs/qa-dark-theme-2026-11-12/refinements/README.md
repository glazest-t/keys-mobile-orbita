# Уточнение тёмной темы · 12.11.2026

По прямым замечаниям пользователя исправлены:

- Закрытый тариф программы отеля: золотистая поверхность с тёмным текстом, отдельные кнопка выбора и маркер уровня.
- Программа отеля в оплате: золотая иконка на тёмной тёплой подложке. Иконки списания баллов и общие иконки усилены.
- Маршрут и история баллов: светлая кнопка с тёмно-синим текстом, более тёмное светлое наведение.
- Детали и поделиться: белая полупрозрачная подложка 30%, тёмная подпись; hover 46%, active 38%. Проверен контраст с кобальтовым и фиолетовым концами градиента.
- Музеи: общий стиль с голубой иконкой и тёмно-синей подложкой, включая desktop nearby-place-row.
- Мои поездки: отдельная иллюстрация для тёмной темы, фотографии сохранены цветными. Светлый оригинал сохранён; смена ассета следует data-app-theme и системной теме.
- Таймлайн: яркие точки без дополнительного серого кольца.
- Лейблы баллов: без обводки, мягкая подложка аналогично скидке.
- Программы отелей: выбранный таб имеет светло-голубой фон и тёмную подпись.

Проверены в браузере: мобильные выгоды, программы отелей и подтверждение/оплата; десктопные тарифы, оплата, списание баллов, поездка, музеи, баннер и история. Скриншоты в этой папке. Изменения ограничены тёмной темой, исходные тексты сохранены.

Проверки: 5 тестов темы/контраста; TypeScript обеих версий; production-сборки обеих версий; целостность 28 защищённых файлов runtime. Публикация не выполнялась.

## Иллюстрация

Встроенный image_gen, редактирование оригинального фотоальбома. Итог: app/public/brand/illustrations/trip-history-album-dark.png. Исходный файл не заменён.

Промпт:

Use case: precise-object-edit. Edit target: attached trip-history-album.png. Produce a dark-theme companion asset for the Keys travel app. Preserve the three overlapping rounded photo tiles, their positions, rotation, proportions, the coastal hotel, St Petersburg architecture and warm hotel lobby photography. Change ONLY the pale lavender canvas behind photos to a uniform deep navy #192333, change thick white photo rims to subdued slate #536987, and keep the orbital curve and small blue sphere luminous soft cobalt/sky blue. Keep photographs bright and naturally colored, do not invert or darken their contents. No text, no added objects. Preserve framing and composition; canvas edges must be #192333 without pale halo.
