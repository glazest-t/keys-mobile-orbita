# Слои иллюстрации «Двойная выгода»

Уточнение: плоский CSS-плюс заменён объёмным прозрачным ассетом `../../app/public/brand/illustrations/onboarding-benefits-plus.png`, восстановленным встроенным Imagegen по исходной иллюстрации. Сохранены наклон, толщина медальона, тёплая лицевая поверхность и синий рельеф. Сборка ждёт загрузки всех трёх изображений. Проверено в браузере: plus-perspective.jpg; build/runtime прошли.

Промпт плюса: Use case: background-extraction. Edit target: attached illustration. Extract ONLY the small ivory circular medallion with raised blue plus sign, exactly as it appears between the two cards. Preserve its exact 3D camera projection, oval perspective, tilted blue plus, rounded thick blue extruded strokes, warm pearl face, lavender thickness along lower-left edge, highlights and lighting. Remove both cards, orbit, background, shadows outside object. Center isolated medallion tightly in a square PNG with real transparent alpha, 8% transparent margin. No new design, no frontal flat icon: it must match this exact existing medallion perspective. No checkerboard rendered, no background, no other objects.

29.10.2026. По запросу пользователя две карточки собираются с противоположных сторон. Исходная цельная иллюстрация сохранена в архивном ассете. Карточки восстановлены встроенным Imagegen с прозрачным фоном; орбита, спутники и плюс — отдельные элементы CSS/UI kit.

- `../../app/public/brand/illustrations/onboarding-benefits-keys.png`
- `../../app/public/brand/illustrations/onboarding-benefits-hotel.png`

Карточки начинают движение после загрузки обоих изображений и только на активном шаге. Смещения ±64 px, повороты ±12°, задержки 0,1/0,2 с; длительность 0,8 с по D-011, кривая Orbit. Плюс появляется после соединения. Повторный вход повторяет сборку. Reduced motion убирает движение.

## Промпты (built-in image_gen)

### Ключи

Use case: background-extraction. Edit target: the attached onboarding illustration. Extract ONLY the foreground BLUE card as a separate fully transparent PNG animation layer. Reconstruct its right edge and surface behind the small plus disk: REMOVE plus disk, rear hotel card, orbit, balls, floor shadow and background entirely. Preserve EXACT existing card shape, camera perspective, tilt, blue material, 3D circular logo and Russian text Ключи. Entire isolated card must be visible, no cropping. Center the card tightly in a square canvas with 5% transparent margins. Actual transparent alpha, no checkerboard rendered, no background, no additional objects. The card itself may retain subtle thickness and edge highlights. This is a faithful cutout not a new design.

### Ваш отель

Use case: background-extraction. Edit target: the attached onboarding illustration. Extract ONLY the rear PEARL HOTEL card as a separate fully transparent PNG animation layer. Reconstruct the full obscured lower-left portion behind the blue card: REMOVE blue card, plus disk, orbit, balls, floor shadow and background entirely. Preserve existing hotel card silhouette, camera perspective, tilt, pearl lavender/ivory material, building icon and exact Russian text Ваш отель. Entire isolated card must be visible no cropping. Center the card tightly in a square canvas with 5% transparent margins. Actual transparent alpha, no checkerboard rendered, no background, no additional objects. This is faithful separation and reconstruction not redesign.
