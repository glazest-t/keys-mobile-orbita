# Покрытие локального десктопа

30 октября 2026. Статус: готов к пользовательской проверке; окончательная визуальная приёмка и публикация не выполнены.

## Проверки

- **395/395**: общие доменные тесты, авторизация, веб-доступ, упаковка.
- **9/9** браузерных регрессионных сценариев: длинный чат/позиция чтения, уведомления/возврат, непрочитанное, карты избранного и пожеланий, reduced motion/заставка, длинное имя/центрирование хинта, мобильная карта, отсутствие ошибок JS.
- **145/145** сцен при **1024 × 720**, reduced motion. Нет пустых экранов, горизонтального переполнения документа или центральных диалогов за границами окна.
- Предыдущие полные обходы: **1440 × 900**, **1280 × 900**, **1024 × 900** — по 145 сцен. Они предшествуют последним точечным правкам; изменённые состояния дополнительно проверены в последнем проходе.
- TypeScript десктопа и приложения, обе сборки, 28 защищённых файлов mobile runtime — успешно.

Каталожный обход проверяет открытие и размеры, а не все возможные действия. Сквозные действия и визуальные сравнения перечислены ниже. Финальный проход выполнен в локальном Chromium после отказа подключения встроенного браузера; ранние проходы выполнены в in-app Browser.

## Проверенные пути

| Область | Ручные / браузерные действия | Журнал |
| --- | --- | --- |
| Поиск и бронь | Публичный поиск, направление/даты/гости, фильтры/сортировка, карта, номер/тариф, вход с сохранением выбора, гости, времена, итог, баллы, СБП, подтверждение | PLAN, проходы 1–3 |
| Отель / коллекции | Галерея, карта/маркер, уровни/условия, избранное/подборка; программа → отель → обратно | Проходы 2, 6 |
| Поездки | Пустая, предстоящая, проживание, выезд, завершена; отзыв и компактное состояние после него, история/фильтр/удаление/восстановление | Проходы 2–3 |
| Бронь / деньги | Изменение гостей, история, ограничение при заказанной услуге, отмена/возврат/документы, отказ и повтор платежа | Проходы 3–4 |
| Услуги | Завтрак, еда, уборка, бельё, подушки, кроватка, трансфер, спа, парковка, другой запрос; оплата/бесплатно, отмена/возврат, повторный заказ | Проходы 3–5 |
| Проживание / доступ | Ключ: загрузка/успех; Wi-Fi; ранний/поздний заезд с оплатой в отеле, отмена и восстановление суммы/времени; счёт | Проходы 3, 5 |
| Общая бронь | Просмотр без действий; полный доступ другому локальному профилю, добавление и отмена услуги; QR/ссылка | Проход 5 |
| Аккаунт и отельер | Приглашение/регистрация/отложенное подтверждение/онбординг; локальный кабинет/подтверждение; PIN ошибка/успех/повтор/несовпадение, биометрия/fallback | Проход 4 |
| Профиль | Гражданство, дата, международный обязательный телефон, несохранённые изменения, помощь/обращение, запрос/отзыв удаления аккаунта | Проходы 4, 6 |
| Подбор | Пузырьки/предпочтения, лайк/следующий, галерея, редактирование; текст → теги → выдача/карта → отель → назад с сохранением | Проход 4 |
| Чаты / уведомления | Пресет сразу отправляется, длинная переписка, чтение старых сообщений, непрочитанное/прочитанное, контекст отеля и возврат; общий индикатор | Проходы 3, 6 |
| Клавиатура / адаптивность | Центральные диалоги, Escape и вложенная сортировка, возврат фокуса даты/гражданства, карта Tab; 1024/1280/1440, высота 720, reduced motion | Проходы 2–6 |

## Все сцены

Ссылки открывают изолированные примеры. Они не меняют сохранённые данные обычного прототипа. `ready` означает прохождение проверки открытия и границ окна.

### Вход и онбординг

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `launch` | [Запуск приложения](http://127.0.0.1:5180/?catalogue=launch#welcome) | ready |
| `onboarding-1` | [Управляйте номером](http://127.0.0.1:5180/?catalogue=onboarding-1#welcome) | ready |
| `onboarding-2` | [Двойная выгода](http://127.0.0.1:5180/?catalogue=onboarding-2#welcome) | ready |
| `onboarding-3` | [Персональная подборка](http://127.0.0.1:5180/?catalogue=onboarding-3#welcome) | ready |
| `phone` | [Вход по телефону](http://127.0.0.1:5180/?catalogue=phone#phone) | ready |
| `code` | [Код из СМС](http://127.0.0.1:5180/?catalogue=code#code) | ready |
| `name` | [Имя гостя](http://127.0.0.1:5180/?catalogue=name#name) | ready |
| `terms` | [Условия сервиса](http://127.0.0.1:5180/?catalogue=terms#terms) | ready |
| `pin-login` | [Вход по PIN-коду](http://127.0.0.1:5180/?catalogue=pin-login#trips) | ready |
| `biometric-login` | [Вход по биометрии](http://127.0.0.1:5180/?catalogue=biometric-login#trips) | ready |
| `biometric-failure` | [Биометрия не распознана](http://127.0.0.1:5180/?catalogue=biometric-failure#trips) | ready |

### Для отельеров

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `hotelier-invite` | [Приглашение отельера](http://127.0.0.1:5180/?catalogue=hotelier-invite#hotelier-invite) | ready |
| `hotelier-email` | [Подтверждение статуса](http://127.0.0.1:5180/?catalogue=hotelier-email#hotelier) | ready |
| `hotelier-pending` | [Ожидание подтверждения](http://127.0.0.1:5180/?catalogue=hotelier-pending#hotelier) | ready |
| `hotelier-approved` | [Статус подтверждён](http://127.0.0.1:5180/?catalogue=hotelier-approved#hotelier) | ready |
| `hotelier-rejected` | [Подтверждение отклонено](http://127.0.0.1:5180/?catalogue=hotelier-rejected#hotelier) | ready |
| `hotelier-banner` | [Приложение · статус ожидает](http://127.0.0.1:5180/?catalogue=hotelier-banner#trips) | ready |
| `hotelier-profile` | [Профиль отельера](http://127.0.0.1:5180/?catalogue=hotelier-profile#profile) | ready |
| `hotelier-share` | [Приглашение коллеги](http://127.0.0.1:5180/?catalogue=hotelier-share#hotelier-share) | ready |
| `friendly-info` | [О Friendly Rate](http://127.0.0.1:5180/?catalogue=friendly-info#profile) | ready |

### Поиск и подбор

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `find` | [Найти](http://127.0.0.1:5180/?catalogue=find#find) | ready |
| `destination` | [Куда поедем](http://127.0.0.1:5180/?catalogue=destination#find) | ready |
| `dates` | [Даты поездки](http://127.0.0.1:5180/?catalogue=dates#find) | ready |
| `guests` | [Кто едет](http://127.0.0.1:5180/?catalogue=guests#find) | ready |
| `results` | [Выдача отелей](http://127.0.0.1:5180/?catalogue=results#results) | ready |
| `results-edit` | [Изменить даты и гостей](http://127.0.0.1:5180/?catalogue=results-edit#search-params) | ready |
| `filters` | [Фильтры](http://127.0.0.1:5180/?catalogue=filters#results) | ready |
| `sort` | [Сортировка](http://127.0.0.1:5180/?catalogue=sort#results) | ready |
| `results-map` | [Карта отелей](http://127.0.0.1:5180/?catalogue=results-map#results-map) | ready |
| `hot-deals` | [Горячие скидки](http://127.0.0.1:5180/?catalogue=hot-deals#results) | ready |
| `swipe-preferences` | [Ваш стиль путешествий · первый выбор](http://127.0.0.1:5180/?catalogue=swipe-preferences#swipe) | ready |
| `swipe` | [Отели свайпом](http://127.0.0.1:5180/?catalogue=swipe#swipe) | ready |
| `wish-search` | [Подбор по пожеланию](http://127.0.0.1:5180/?catalogue=wish-search#wish-search) | ready |
| `wish-results` | [Пожелание · выдача отелей](http://127.0.0.1:5180/?catalogue=wish-results#wish-search) | ready |

### Отель и бронирование

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `booking-hotel` | [Об отеле](http://127.0.0.1:5180/?catalogue=booking-hotel#booking-flow) | ready |
| `booking-rooms` | [Выбор номера](http://127.0.0.1:5180/?catalogue=booking-rooms#booking-flow) | ready |
| `booking-guest` | [Данные бронирования](http://127.0.0.1:5180/?catalogue=booking-guest#booking-flow) | ready |
| `booking-services` | [Дополнительные услуги](http://127.0.0.1:5180/?catalogue=booking-services#booking-flow) | ready |
| `booking-checkout` | [Подтверждение и оплата](http://127.0.0.1:5180/?catalogue=booking-checkout#booking-flow) | ready |
| `booking-confirmation` | [Бронь подтверждена](http://127.0.0.1:5180/?catalogue=booking-confirmation#booking-flow) | ready |
| `hotel-gallery` | [Фото отеля](http://127.0.0.1:5180/?catalogue=hotel-gallery#booking-flow) | ready |
| `hotel-price` | [Расчёт цены отеля](http://127.0.0.1:5180/?catalogue=hotel-price#booking-flow) | ready |
| `hotel-preferences` | [Почему подходит вам](http://127.0.0.1:5180/?catalogue=hotel-preferences#booking-flow) | ready |
| `hotel-watch` | [Следить за ценой](http://127.0.0.1:5180/?catalogue=hotel-watch#booking-flow) | ready |
| `hotel-nearby` | [Расположение отеля](http://127.0.0.1:5180/?catalogue=hotel-nearby#booking-flow) | ready |
| `hotel-route` | [Маршрут до отеля](http://127.0.0.1:5180/?catalogue=hotel-route#booking-flow) | ready |
| `hotel-reviews` | [Все отзывы](http://127.0.0.1:5180/?catalogue=hotel-reviews#booking-flow) | ready |
| `hotel-share` | [Поделиться отелем](http://127.0.0.1:5180/?catalogue=hotel-share#booking-flow) | ready |
| `room-equipment` | [Оснащение номера](http://127.0.0.1:5180/?catalogue=room-equipment#booking-flow) | ready |
| `room-rate` | [Что входит в тариф](http://127.0.0.1:5180/?catalogue=room-rate#booking-flow) | ready |
| `room-gallery` | [Фото номера](http://127.0.0.1:5180/?catalogue=room-gallery#booking-flow) | ready |
| `booking-total` | [Итого · расчёт стоимости](http://127.0.0.1:5180/?catalogue=booking-total#booking-flow) | ready |
| `booking-arrival` | [Выбор времени заезда](http://127.0.0.1:5180/?catalogue=booking-arrival#booking-flow) | ready |
| `booking-departure` | [Выбор времени выезда](http://127.0.0.1:5180/?catalogue=booking-departure#booking-flow) | ready |
| `booking-wishes` | [Пожелания к проживанию](http://127.0.0.1:5180/?catalogue=booking-wishes#booking-flow) | ready |
| `booking-extra-guest` | [Дополнительный гость](http://127.0.0.1:5180/?catalogue=booking-extra-guest#booking-flow) | ready |
| `payment-methods` | [Другие способы оплаты](http://127.0.0.1:5180/?catalogue=payment-methods#booking-flow) | ready |
| `friendly-hotel` | [Об отеле · Friendly Rate](http://127.0.0.1:5180/?catalogue=friendly-hotel#booking-flow) | ready |
| `friendly-rooms` | [Номера · Friendly Rate](http://127.0.0.1:5180/?catalogue=friendly-rooms#booking-flow) | ready |
| `hotel-amenities` | [Все удобства отеля](http://127.0.0.1:5180/?catalogue=hotel-amenities#booking-flow) | ready |
| `guest-travelers` | [Выбор сохранённого путешественника](http://127.0.0.1:5180/?catalogue=guest-travelers#booking-flow) | ready |
| `room-search` | [Изменение дат и гостей · номер](http://127.0.0.1:5180/?catalogue=room-search#booking-flow) | ready |
| `payment-error` | [Ошибка оплаты брони](http://127.0.0.1:5180/?catalogue=payment-error#booking-flow) | ready |

### Поездки

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `trip-empty` | [Нет брони](http://127.0.0.1:5180/?catalogue=trip-empty#trips) | ready |
| `trip-upcoming` | [До заезда](http://127.0.0.1:5180/?catalogue=trip-upcoming#trips) | ready |
| `trip-staying` | [Во время проживания](http://127.0.0.1:5180/?catalogue=trip-staying#trips) | ready |
| `trip-departure` | [День выезда](http://127.0.0.1:5180/?catalogue=trip-departure#trips) | ready |
| `trip-completed` | [Поездка завершена](http://127.0.0.1:5180/?catalogue=trip-completed#trips) | ready |
| `record` | [Детали брони](http://127.0.0.1:5180/?catalogue=record#booking-record) | ready |
| `stay-record` | [Детали проживания](http://127.0.0.1:5180/?catalogue=stay-record#booking-record) | ready |
| `trip-bill` | [Счёт проживания](http://127.0.0.1:5180/?catalogue=trip-bill#trip-bill) | ready |
| `trip-guide` | [Как заселиться](http://127.0.0.1:5180/?catalogue=trip-guide#trip-guide) | ready |
| `trip-route` | [Маршрут](http://127.0.0.1:5180/?catalogue=trip-route#trip-route) | ready |
| `trip-nearby` | [Рядом с вами](http://127.0.0.1:5180/?catalogue=trip-nearby#trip-nearby) | ready |
| `trip-review` | [Оценить проживание](http://127.0.0.1:5180/?catalogue=trip-review#trip-review) | ready |
| `record-edit` | [Изменение брони](http://127.0.0.1:5180/?catalogue=record-edit#booking-record) | ready |
| `record-cancel` | [Отмена брони](http://127.0.0.1:5180/?catalogue=record-cancel#booking-record) | ready |
| `record-documents` | [Документы](http://127.0.0.1:5180/?catalogue=record-documents#booking-record) | ready |
| `trip-share` | [Поделиться бронью · QR](http://127.0.0.1:5180/?catalogue=trip-share#trips) | ready |
| `trip-wifi` | [Wi-Fi](http://127.0.0.1:5180/?catalogue=trip-wifi#trips) | ready |
| `route-origin` | [Маршрут · откуда](http://127.0.0.1:5180/?catalogue=route-origin#trip-route) | ready |

### Услуги отеля

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `services` | [Все услуги отеля](http://127.0.0.1:5180/?catalogue=services#trip-services) | ready |
| `breakfast` | [Завтрак](http://127.0.0.1:5180/?catalogue=breakfast#trip-breakfast) | ready |
| `breakfast-order` | [Добавить завтрак](http://127.0.0.1:5180/?catalogue=breakfast-order#trip-breakfast) | ready |
| `early-arrival` | [Ранний заезд](http://127.0.0.1:5180/?catalogue=early-arrival#trips) | ready |
| `late-departure` | [Поздний выезд](http://127.0.0.1:5180/?catalogue=late-departure#trips) | ready |
| `problem` | [Сообщить о проблеме](http://127.0.0.1:5180/?catalogue=problem#trip-problem) | ready |
| `service-food` | [Еда в номер](http://127.0.0.1:5180/?catalogue=service-food#trip-services) | ready |
| `service-cleaning` | [Уборка](http://127.0.0.1:5180/?catalogue=service-cleaning#trip-services) | ready |
| `service-pillows` | [Подушки](http://127.0.0.1:5180/?catalogue=service-pillows#trip-services) | ready |
| `service-transfer` | [Трансфер](http://127.0.0.1:5180/?catalogue=service-transfer#trip-services) | ready |
| `service-spa` | [Спа](http://127.0.0.1:5180/?catalogue=service-spa#trip-services) | ready |
| `service-parking` | [Парковка](http://127.0.0.1:5180/?catalogue=service-parking#trip-services) | ready |
| `service-request` | [Другой запрос](http://127.0.0.1:5180/?catalogue=service-request#trip-services) | ready |
| `breakfast-unpaid` | [Завтрак · к оплате](http://127.0.0.1:5180/?catalogue=breakfast-unpaid#trip-breakfast) | ready |
| `breakfast-paid` | [Завтрак · оплачено](http://127.0.0.1:5180/?catalogue=breakfast-paid#trip-breakfast) | ready |
| `service-payment` | [Оплата услуги](http://127.0.0.1:5180/?catalogue=service-payment#trip-breakfast) | ready |
| `service-order` | [Детали оплаченной услуги](http://127.0.0.1:5180/?catalogue=service-order#trip-breakfast) | ready |
| `service-towels` | [Полотенца и бельё](http://127.0.0.1:5180/?catalogue=service-towels#trip-services) | ready |
| `service-cot` | [Детская кроватка](http://127.0.0.1:5180/?catalogue=service-cot#trip-services) | ready |

### Избранное и цены

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `favorites` | [Подборки избранного](http://127.0.0.1:5180/?catalogue=favorites#favorites) | ready |
| `favorite-list` | [Отели подборки](http://127.0.0.1:5180/?catalogue=favorite-list#favorite-list) | ready |
| `favorite-map` | [Карта подборки](http://127.0.0.1:5180/?catalogue=favorite-map#favorite-map) | ready |
| `price-watches` | [Следим за ценами](http://127.0.0.1:5180/?catalogue=price-watches#price-watches) | ready |
| `favorite-create` | [Создать подборку](http://127.0.0.1:5180/?catalogue=favorite-create#favorites) | ready |
| `price-watch-delete` | [Удалить наблюдение](http://127.0.0.1:5180/?catalogue=price-watch-delete#price-watches) | ready |

### Чаты и уведомления

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `chats` | [Все чаты](http://127.0.0.1:5180/?catalogue=chats#chats) | ready |
| `trip-chat` | [Диалог с отелем](http://127.0.0.1:5180/?catalogue=trip-chat#trip-chat) | ready |
| `notifications` | [Все уведомления](http://127.0.0.1:5180/?catalogue=notifications#notifications) | ready |
| `hotel-notifications` | [Уведомления отеля](http://127.0.0.1:5180/?catalogue=hotel-notifications#notifications) | ready |

### Выгоды и программы

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `rewards` | [Выгоды](http://127.0.0.1:5180/?catalogue=rewards#rewards) | ready |
| `points` | [Баллы Ключей · история](http://127.0.0.1:5180/?catalogue=points#points) | ready |
| `programs` | [Программы отелей](http://127.0.0.1:5180/?catalogue=programs#loyalty-programs) | ready |
| `program-sea` | [Программа · скидка и баллы](http://127.0.0.1:5180/?catalogue=program-sea#loyalty-program/orbit-sea) | ready |
| `program-forest` | [Программа · только баллы](http://127.0.0.1:5180/?catalogue=program-forest#loyalty-program/orbit-forest) | ready |
| `program-camp` | [Программа · скидка](http://127.0.0.1:5180/?catalogue=program-camp#loyalty-program/kazan-camp) | ready |
| `program-network` | [Программа сети](http://127.0.0.1:5180/?catalogue=program-network#loyalty-network) | ready |
| `program-connect` | [Подключение программы](http://127.0.0.1:5180/?catalogue=program-connect#loyalty-connect/kazan-camp) | ready |
| `invite` | [Пригласить друзей](http://127.0.0.1:5180/?catalogue=invite#hotelier-share) | ready |
| `points-rules` | [Как работают баллы](http://127.0.0.1:5180/?catalogue=points-rules#points) | ready |
| `program-level` | [Условия уровня отеля](http://127.0.0.1:5180/?catalogue=program-level#loyalty-program/orbit-sea) | ready |
| `rewards-hotelier` | [Выгоды отельера](http://127.0.0.1:5180/?catalogue=rewards-hotelier#rewards) | ready |

### Профиль и история

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `profile` | [Профиль](http://127.0.0.1:5180/?catalogue=profile#profile) | ready |
| `travelers` | [Путешественники](http://127.0.0.1:5180/?catalogue=travelers#travelers) | ready |
| `profile-style` | [Ваш стиль путешествий](http://127.0.0.1:5180/?catalogue=profile-style#profile-style) | ready |
| `profile-history` | [История поездок](http://127.0.0.1:5180/?catalogue=profile-history#profile-history) | ready |
| `profile-notifications` | [Настройки уведомлений](http://127.0.0.1:5180/?catalogue=profile-notifications#profile-notifications) | ready |
| `profile-security` | [Безопасность и доступ](http://127.0.0.1:5180/?catalogue=profile-security#profile-security) | ready |
| `profile-pin` | [Установка PIN-кода](http://127.0.0.1:5180/?catalogue=profile-pin#profile-pin) | ready |
| `profile-biometric` | [Настройка биометрии](http://127.0.0.1:5180/?catalogue=profile-biometric#profile-biometric) | ready |
| `profile-sessions` | [Устройства и сеансы](http://127.0.0.1:5180/?catalogue=profile-sessions#profile-sessions) | ready |
| `profile-data` | [Управление данными](http://127.0.0.1:5180/?catalogue=profile-data#profile-data) | ready |
| `profile-deletion` | [Удаление аккаунта](http://127.0.0.1:5180/?catalogue=profile-deletion#profile-deletion) | ready |
| `help` | [Помощь и поддержка](http://127.0.0.1:5180/?catalogue=help#help) | ready |
| `traveler` | [Данные путешественника](http://127.0.0.1:5180/?catalogue=traveler#traveler) | ready |
| `edit` | [Редактирование данных](http://127.0.0.1:5180/?catalogue=edit#edit) | ready |
| `about` | [О приложении](http://127.0.0.1:5180/?catalogue=about#profile) | ready |
| `logout` | [Выход из приложения](http://127.0.0.1:5180/?catalogue=logout#profile) | ready |
| `history-add` | [Добавить бронь по номеру](http://127.0.0.1:5180/?catalogue=history-add#profile-history) | ready |
| `history-trip` | [Завершённая поездка · детали](http://127.0.0.1:5180/?catalogue=history-trip#profile-trip/KEYS-102-+79990000001) | ready |
| `help-article` | [Статья помощи](http://127.0.0.1:5180/?catalogue=help-article#help-article/change) | ready |
| `support-new` | [Обращение в поддержку](http://127.0.0.1:5180/?catalogue=support-new#support-new) | ready |
| `support-request` | [Детали обращения](http://127.0.0.1:5180/?catalogue=support-request#support-request/catalogue-support) | ready |
| `profile-pin-off` | [Отключение PIN-кода](http://127.0.0.1:5180/?catalogue=profile-pin-off#profile-pin-off) | ready |

### Компоненты

| Сцена | Открыть | 1024 × 720 |
| --- | --- | --- |
| `kit` | [UI kit · реальные компоненты](http://127.0.0.1:5180/?catalogue=kit#kit) | ready |

## Артефакты

`.desktop-work/qa/browser-targeted-pass6.json`, `browser-catalogue-pass6.json`, `tests-pass6.txt`, `types-pass6.txt`, `build-pass6.txt`, `mobile-build-pass6.txt`. Исходный неуспешный обход сохранён как `browser-catalogue-pass6-before.json`: пустая заставка при reduced motion исправлена; короткий текст успеха биометрии был ложным срабатыванием порога длины текста.

Сравнения и визуальные находки — `design-qa.md`. Продуктовые границы и вопросы на приёмку — `CONTRACT.md`.
