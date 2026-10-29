> Текущие уточнения и границы: [handoff](../handoff/README.md), [QA 30 октября](../iteration-9/qa-mobile-2026-10-30/REPORT.md). «Собрано» означает реализацию; доказательства визуальной проверки указаны отдельно.

# Мобильная матрица экранов и сценариев

30.10.2026. 99 функциональных описаний и 23 сквозных пути сопоставлены с текущим кодом. Это матрица реализации, а не заявление, что каждый экран уже повторно проверен визуально. Проверенный M1–M3 — отчёты iteration-7; M4 услуг — qa-service-choices; общая проверка M5/M6 завершена в объёме qa-mobile-final/REPORT.md. Финальная приёмка пользователя и продуктовые вопросы остаются открытыми.

Приоритет: поздние прямые решения пользователя → функциональные требования → визуальная композиция «Все экраны». Отдельный маршрут из исходного файла не считается новым обязательным экраном, если вход удалён пользователем. Все деньги, авторизация, ответы отеля и доступ остаются демонстрацией.

| ID | Экран / визуальный источник | Реализация в app/src | Состояние и уточнения | Проверка логики |
|---|---|---|---|---|
| A01 | Онбординг · o1, o2, o3, o4, o5, o6 | Onboarding.tsx | **Собрано.** D-011; онбординг → обязательный вход | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| A02 | Ввод телефона · a1 | Prototype.tsx / auth | **Собрано.** Маска +7, шесть полей SMS, успех и автопереход, имя | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| A03 | Подтверждение телефона · a2, e3 | Prototype.tsx / auth | **Собрано.** Маска +7, шесть полей SMS, успех и автопереход, имя | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| A04 | Имя нового гостя · a3 | Prototype.tsx / auth | **Собрано.** Маска +7, шесть полей SMS, успех и автопереход, имя | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| A05 | Приглашение отельера · z1, fr1 | hotelier/ | **Собрано.** Приглашение, email, кабинет, позже/одобрение/отказ; статус не выдаётся ссылкой | [hotelier.test.mjs](../../tests/hotelier.test.mjs) |
| A06 | Подтверждение работы в отеле · z2 | hotelier/ | **Собрано.** Приглашение, email, кабинет, позже/одобрение/отказ; статус не выдаётся ссылкой | [hotelier.test.mjs](../../tests/hotelier.test.mjs) |
| A07 | Ожидание и результат проверки отельера · z3, z4, z5, z6 | hotelier/ | **Собрано.** Приглашение, email, кабинет, позже/одобрение/отказ; статус не выдаётся ссылкой | [hotelier.test.mjs](../../tests/hotelier.test.mjs) |
| A08 | Статус отельера и приглашение коллеги · fr2, fr6, i2 | hotelier/ | **Собрано.** Приглашение, email, кабинет, позже/одобрение/отказ; статус не выдаётся ссылкой | [hotelier.test.mjs](../../tests/hotelier.test.mjs) |
| A09 | Вход при оформлении брони · g1 | Prototype.tsx | **После мобильной проверки.** Только десктоп: мобильное приложение требует входа до поиска | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| F01 | Найти · f1, k5 | FindPage / SearchControls / SearchScreens | **Собрано.** Куда → даты → гости; отдельные шторки полей, история без пустого блока | [search.test.mjs](../../tests/search.test.mjs) |
| F02 | Даты поездки · k3 | FindPage / SearchControls / SearchScreens | **Собрано.** Куда → даты → гости; отдельные шторки полей, история без пустого блока | [search.test.mjs](../../tests/search.test.mjs) |
| F03 | Гости и условия поездки · k3g, k3 | FindPage / SearchControls / SearchScreens | **Собрано.** Куда → даты → гости; отдельные шторки полей, история без пустого блока | [search.test.mjs](../../tests/search.test.mjs) |
| F04 | Результаты поиска · c1, k4 | Catalog / Filters / ResultsMap | **Собрано.** Единые выдача/карта/цена/фильтры; сортировка и пустое состояние | [search-filters-expanded.test.mjs](../../tests/search-filters-expanded.test.mjs) |
| F05 | Фильтры выдачи · k1 | Catalog / Filters / ResultsMap | **Собрано.** Единые выдача/карта/цена/фильтры; сортировка и пустое состояние | [search-filters-expanded.test.mjs](../../tests/search-filters-expanded.test.mjs) |
| F06 | Карта результатов · c2, k2 | Catalog / Filters / ResultsMap | **Собрано.** Единые выдача/карта/цена/фильтры; сортировка и пустое состояние | [search-filters-expanded.test.mjs](../../tests/search-filters-expanded.test.mjs) |
| F07 | Отели свайпом · q3 | Discovery / SwipeWelcome / SwipeGallery | **Собрано.** Пузырьки предпочтений, орбита, свайп вверх, лайк без модалок, галерея | [swipe-discovery.test.mjs](../../tests/swipe-discovery.test.mjs) |
| F08 | Тематическая подборка · f1 | FindPage / promotions | **Собрано.** Горячие скидки от 10%; утверждённая иллюстрация варианта 2 | [promotions.test.mjs](../../tests/promotions.test.mjs) |
| F09 | Следить за ценой · w1 | HotelSheets / PriceWatches / priceEvents | **Собрано.** Наблюдение/пауза/удаление, снижение и рост локальной цены | [price-watch.test.mjs](../../tests/price-watch.test.mjs) |
| F10 | Избранные подборки · fv1, fv4, fv5 | FavoritesScreen / FavoritesMap / FavoriteSaving | **Собрано.** Подборки, заметки, перенос, карта, нет номеров; исходный возврат | [favorites.test.mjs](../../tests/favorites.test.mjs) |
| F11 | Состав подборки и заметки · fv2, fv2a, fv3, fv6 | FavoritesScreen / FavoritesMap / FavoriteSaving | **Собрано.** Подборки, заметки, перенос, карта, нет номеров; исходный возврат | [favorites.test.mjs](../../tests/favorites.test.mjs) |
| Q01 | Начало и продолжение подбора · nc1 | PreferenceJourney / PreferenceDiscovery | **Резерв без основного входа.** Сохранённая резервная ветка. Вход из пустых поездок удалён пользователем; вместо него двойная выгода. Не возвращать баннер автоматически | [preferences.test.mjs](../../tests/preferences.test.mjs) |
| Q02 | Направление и город · nc2, nc3 | PreferenceJourney / PreferenceDiscovery | **Резерв без основного входа.** Сохранённая резервная ветка. Вход из пустых поездок удалён пользователем; вместо него двойная выгода. Не возвращать баннер автоматически | [preferences.test.mjs](../../tests/preferences.test.mjs) |
| Q03 | С кем путешествуете · nc2 | PreferenceJourney / PreferenceDiscovery | **Резерв без основного входа.** Сохранённая резервная ветка. Вход из пустых поездок удалён пользователем; вместо него двойная выгода. Не возвращать баннер автоматически | [preferences.test.mjs](../../tests/preferences.test.mjs) |
| Q04 | Интересы и предпочтения · nc4, nc5, nc6, nc7, nc8, nc11 | PreferenceJourney / PreferenceDiscovery | **Резерв без основного входа.** Сохранённая резервная ветка. Вход из пустых поездок удалён пользователем; вместо него двойная выгода. Не возвращать баннер автоматически | [preferences.test.mjs](../../tests/preferences.test.mjs) |
| Q05 | Рекомендованные направления и отели · nc9, nc10, nc12, r1 | PreferenceJourney / PreferenceDiscovery | **Резерв без основного входа.** Сохранённая резервная ветка. Вход из пустых поездок удалён пользователем; вместо него двойная выгода. Не возвращать баннер автоматически | [preferences.test.mjs](../../tests/preferences.test.mjs) |
| Q06 | Подбор по свободному пожеланию · nc1 | TextSearchContent / preferenceIdeas | **Собрано.** Текст → сразу выдача, теги, общие фильтры/карта, закрытый блок Почему подходит | [text-results-filters.test.mjs](../../tests/text-results-filters.test.mjs) |
| H01 | Детали выбранного отеля · h1, fr3, h2, fr5 | HotelOverview / HotelDetails / HotelSheets | **Собрано.** h1/h2/h9/x1/n1; цена, предпочтения, фото, отзывы, маршрут; исправлены отзывы других городов | [imported-hotels.test.mjs](../../tests/imported-hotels.test.mjs) |
| H02 | Галерея отеля и номера · h9, gl1 | HotelOverview / HotelDetails / HotelSheets | **Собрано.** h1/h2/h9/x1/n1; цена, предпочтения, фото, отзывы, маршрут; исправлены отзывы других городов | [imported-hotels.test.mjs](../../tests/imported-hotels.test.mjs) |
| H03 | Отзывы об отеле · x1 | HotelOverview / HotelDetails / HotelSheets | **Собрано.** h1/h2/h9/x1/n1; цена, предпочтения, фото, отзывы, маршрут; исправлены отзывы других городов | [imported-hotels.test.mjs](../../tests/imported-hotels.test.mjs) |
| H04 | Отель на карте · h1 | HotelOverview / HotelDetails / HotelSheets | **Собрано.** h1/h2/h9/x1/n1; цена, предпочтения, фото, отзывы, маршрут; исправлены отзывы других городов | [imported-hotels.test.mjs](../../tests/imported-hotels.test.mjs) |
| B01 | Номера и тарифы · tv2b, fr4 | Rooms / roomOffers / ResultsSearch | **Собрано.** Номера/тарифы/галерея; редактирование дат/гостей, без фильтров номеров | [rooms.test.mjs](../../tests/rooms.test.mjs) |
| B02 | Описание номера и условия тарифа · tv2c, rm1, gl1 | Rooms / roomOffers / ResultsSearch | **Собрано.** Номера/тарифы/галерея; редактирование дат/гостей, без фильтров номеров | [rooms.test.mjs](../../tests/rooms.test.mjs) |
| B03 | Изменение дат и гостей при выборе · k3, k3g | Rooms / roomOffers / ResultsSearch | **Собрано.** Номера/тарифы/галерея; редактирование дат/гостей, без фильтров номеров | [rooms.test.mjs](../../tests/rooms.test.mjs) |
| B04 | Оформление и данные гостя · h5 | GuestDetails / StayTimeFields / bookingParty | **Собрано.** Основной контакт/автоподстановка второго гостя, пожелания, время заезда/выезда | [booking-party.test.mjs](../../tests/booking-party.test.mjs) |
| B05 | Дополнительный гость · h5 | GuestDetails / StayTimeFields / bookingParty | **Собрано.** Основной контакт/автоподстановка второго гостя, пожелания, время заезда/выезда | [booking-party.test.mjs](../../tests/booking-party.test.mjs) |
| B06 | Услуги баллы и способ оплаты · h6, h7, h2, fr5 | BookingFlow / ConfirmationServices | **Собрано.** Общий расчёт/баллы, СБП, отказ/повтор, подтверждение с услугами, новая поездка | [booking.test.mjs](../../tests/booking.test.mjs) |
| B07 | Оплата бронирования · h7, e4 | BookingFlow / ConfirmationServices | **Собрано.** Общий расчёт/баллы, СБП, отказ/повтор, подтверждение с услугами, новая поездка | [booking.test.mjs](../../tests/booking.test.mjs) |
| B08 | Бронирование подтверждено · h8 | BookingFlow / ConfirmationServices | **Собрано.** Общий расчёт/баллы, СБП, отказ/повтор, подтверждение с услугами, новая поездка | [booking.test.mjs](../../tests/booking.test.mjs) |
| B09 | Созданная поездка и детали новой брони · d1, u1b | BookingFlow / ConfirmationServices | **Собрано.** Общий расчёт/баллы, СБП, отказ/повтор, подтверждение с услугами, новая поездка | [booking.test.mjs](../../tests/booking.test.mjs) |
| B10 | Подключение карты лояльности отеля · l1 | rewards/HotelCardConnection / loyalty | **Собрано.** Подключение программы конкретного отеля, пересчёт и возврат | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| M01 | Управление предстоящей бронью · d1 | BookingRecord / amendment | **Собрано.** Детали/изменение/доплата/возврат/отмена: 3 дня либо ночь; идемпотентность | [amendment.test.mjs](../../tests/amendment.test.mjs) |
| M02 | Изменение существующей брони · b3 | BookingRecord / amendment | **Собрано.** Детали/изменение/доплата/возврат/отмена: 3 дня либо ночь; идемпотентность | [amendment.test.mjs](../../tests/amendment.test.mjs) |
| M03 | Отмена бронирования · d3 | BookingRecord / amendment | **Собрано.** Детали/изменение/доплата/возврат/отмена: 3 дня либо ночь; идемпотентность | [amendment.test.mjs](../../tests/amendment.test.mjs) |
| M04 | Бронь отменена · d3 | BookingRecord / amendment | **Собрано.** Детали/изменение/доплата/возврат/отмена: 3 дня либо ночь; идемпотентность | [amendment.test.mjs](../../tests/amendment.test.mjs) |
| M05 | Документы предстоящей поездки · d2 | TripDocuments / documents / documentFiles | **Собрано.** Локальные документы PDF/ZIP; чек на проживание удалён | [documents.test.mjs](../../tests/documents.test.mjs) |
| M06 | Документы проживания и завершённой поездки · d2 | TripDocuments / documents / documentFiles | **Собрано.** Локальные документы PDF/ZIP; чек на проживание удалён | [documents.test.mjs](../../tests/documents.test.mjs) |
| T01 | Поездки без брони · t0, t1 | UpcomingTrip / BenefitsBannerComparison | **Собрано.** Нет брони → портал и двойная выгода; подбор пожеланий удалён | [demo-trip-scenarios.test.mjs](../../tests/demo-trip-scenarios.test.mjs) |
| T02 | Предстоящая поездка · u1b | UpcomingTrip | **Собрано.** До заезда: актуальный отель/даты/услуги, детали и поделиться | [trip.test.mjs](../../tests/trip.test.mjs) |
| T03 | Текущее проживание · s2 | StayExperience / BookingRecord / CheckoutReminder | **Собрано.** Проживание/день выезда/детали; информационное напоминание без флоу подготовки | [stay.test.mjs](../../tests/stay.test.mjs) |
| T04 | День выезда · s3 | StayExperience / BookingRecord / CheckoutReminder | **Собрано.** Проживание/день выезда/детали; информационное напоминание без флоу подготовки | [stay.test.mjs](../../tests/stay.test.mjs) |
| T05 | Детали текущей или завершённой поездки · d1 | StayExperience / BookingRecord / CheckoutReminder | **Собрано.** Проживание/день выезда/детали; информационное напоминание без флоу подготовки | [stay.test.mjs](../../tests/stay.test.mjs) |
| T06 | Инструкция по заселению и входу · d4 | TripPreparation / RouteOrigin | **Собрано.** Инструкция без онлайн-регистрации, маршрут и откуда | [trip.test.mjs](../../tests/trip.test.mjs) |
| T07 | Маршрут до отеля · d5, d5b | TripPreparation / RouteOrigin | **Собрано.** Инструкция без онлайн-регистрации, маршрут и откуда | [trip.test.mjs](../../tests/trip.test.mjs) |
| T08 | Завершённая поездка · s4 | CompletedTrip | **Собрано.** Выезд оформляет отель; s4, отзыв в главной карточке, компактное уже оставленное мнение | [stay-review.test.mjs](../../tests/stay-review.test.mjs) |
| U01 | Все услуги отеля · sv1 | HotelServices | **Собрано.** sv1, каталог/категории/активные/история; без поиска и депозита | [hotel-service-catalog.test.mjs](../../tests/hotel-service-catalog.test.mjs) |
| U02 | Еда в номер · sv2 | ServiceChoicesSheet / serviceChoices | **Собрано.** Меню и корзина/количество; уборка/предметы/подушки; общие заказ/оплата/отмена | [service-choices.test.mjs](../../tests/service-choices.test.mjs) |
| U03 | Уборка и предметы для номера · sv1, sv2 | ServiceChoicesSheet / serviceChoices | **Собрано.** Меню и корзина/количество; уборка/предметы/подушки; общие заказ/оплата/отмена | [service-choices.test.mjs](../../tests/service-choices.test.mjs) |
| U04 | Депозит и текущий счёт · s5 | StayAccount / stayBill | **Собрано.** Депозит исключён. Счёт доступен только из деталей проживания | [stay-bill.test.mjs](../../tests/stay-bill.test.mjs) |
| U05 | Другой запрос и сообщение о проблеме · s6 | StayProblemFlow / ServiceChoicesSheet | **Собрано.** Проблема: категория/срочность/фото/отмена; другой запрос: текст/время/фото | [stay-problems.test.mjs](../../tests/stay-problems.test.mjs) |
| U06 | Добавление и изменение завтрака · sv3 | Breakfast / ServiceGroupPayment | **Собрано.** Один день/всё проживание; заказ/оплата/добавить ещё, без баллов на оплате услуги | [service-settlement.test.mjs](../../tests/service-settlement.test.mjs) |
| U07 | Ранний заезд и поздний выезд · d6, s3 | EarlyArrival / stayTimeServices | **Собрано.** Добавление сразу по доступности, оплата при заселении/выезде, отмена и системный хинт | [stay-time-services.test.mjs](../../tests/stay-time-services.test.mjs) |
| U08 | Цифровой ключ · s2, s3 | useDoorAction / doorAttempt | **Собрано.** Один клик → ожидание 1–2 с → успех/ошибка; только после заселения | [door-attempt.test.mjs](../../tests/door-attempt.test.mjs) |
| U09 | Wi Fi · wf1, wf1b, wf2 | StayWifi | **Собрано.** Демонстрационные реквизиты и копирование, без управления сетью | [stay.test.mjs](../../tests/stay.test.mjs) |
| U10 | Места рядом · n1 | NearbyPlaces | **Собрано.** Список/карта/категории; фото места и Понятно, без Маршрута от отеля | [nearby.test.mjs](../../tests/nearby.test.mjs) |
| U11 | Карточка места и маршрут · n1 | NearbyPlaces | **Собрано.** Список/карта/категории; фото места и Понятно, без Маршрута от отеля | [nearby.test.mjs](../../tests/nearby.test.mjs) |
| R01 | Оценка проживания · x2 | StayReviewFlow / stayReview | **Собрано.** Оценка/текст/темы/до 5 фото, локальное сохранение; контекст возврата | [stay-review.test.mjs](../../tests/stay-review.test.mjs) |
| R02 | Текст и фотографии отзыва · x2 | StayReviewFlow / stayReview | **Собрано.** Оценка/текст/темы/до 5 фото, локальное сохранение; контекст возврата | [stay-review.test.mjs](../../tests/stay-review.test.mjs) |
| R03 | Благодарность и чаевые · x2 | StayReviewFlow | **Частично / финальный вопрос.** Благодарность готова; чаевые и награда за отзыв отложены, нужны продуктовые условия | [stay-review.test.mjs](../../tests/stay-review.test.mjs) |
| S01 | Поделиться отелем · h1 | HotelSheets | **Собрано.** Публичная ссылка на отель/параметры, системная отправка и копирование | [search.test.mjs](../../tests/search.test.mjs) |
| S02 | Поделиться поездкой ·  | ShareBookingPanel / bookingShare | **Собрано.** Ссылка/QR: чтение либо полное управление, не выдаёт Friendly Rate | [booking-share.test.mjs](../../tests/booking-share.test.mjs) |
| S03 | Входящая ссылка на поездку ·  | ShareBookingPanel / bookingShare | **Собрано.** Ссылка/QR: чтение либо полное управление, не выдаёт Friendly Rate | [booking-share.test.mjs](../../tests/booking-share.test.mjs) |
| S04 | Поделиться подтверждением новой брони · h8 | BookingFlow / documents | **Собрано.** Отправка подтверждения созданной брони; не новая бронь | [documents.test.mjs](../../tests/documents.test.mjs) |
| C01 | Список чатов · ch1 | ChatList / chatThreads / TripChat | **Собрано.** Список с фото и приоритетом текущей поездки, непрочитанное, AI-вход; закреплённая шапка диалога, пресеты отправляются сразу. Поиск/новый диалог удалены из списка | [chat-threads.test.mjs](../../tests/chat-threads.test.mjs) |
| C02 | Диалог с отелем · ch2 | ChatList / chatThreads / TripChat | **Собрано.** Список с фото и приоритетом текущей поездки, непрочитанное, AI-вход; закреплённая шапка диалога, пресеты отправляются сразу. Поиск/новый диалог удалены из списка | [chat-threads.test.mjs](../../tests/chat-threads.test.mjs) |
| C03 | Выбор отеля для чата ·  | ChatList / chatThreads / TripChat | **Удалён вход по решению пользователя.** Резервный код не включать в обязательную мобильную навигацию | [chat-threads.test.mjs](../../tests/chat-threads.test.mjs) |
| N01 | История уведомлений · n2 | NotificationCenter / notifications | **Собрано.** Пять примеров push + цены, категории/прочтение/контекст, без названия отеля из чата | [notifications.test.mjs](../../tests/notifications.test.mjs) |
| N02 | Действие из уведомления · n2, pn3 | NotificationCenter / notifications | **Собрано.** Пять примеров push + цены, категории/прочтение/контекст, без названия отеля из чата | [notifications.test.mjs](../../tests/notifications.test.mjs) |
| L01 | Выгоды · v1 | rewards/Rewards / points | **Собрано.** Общий кошелёк и история фактических локальных операций; с приветственными 1000 и идемпотентной демоисторией | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| L02 | Баллы Ключей · v2, v5 | rewards/Rewards / points | **Собрано.** Общий кошелёк и история фактических локальных операций; с приветственными 1000 и идемпотентной демоисторией | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| L03 | Все программы отелей · v4 | rewards/Rewards / loyalty | **Собрано.** Программы: скидка/баллы/оба вида; подключение без отключения. Уровни/прогресс/условия и снимок в новой брони, начисление после выезда; текущая карточка вариант 3, CTA внизу | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| L04 | Программа конкретного отеля · v3, lp1, lp2, lp3 | rewards/Rewards / loyalty | **Собрано.** Программы: скидка/баллы/оба вида; подключение без отключения. Уровни/прогресс/условия и снимок в новой брони, начисление после выезда; текущая карточка вариант 3, CTA внизу | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| L05 | Программа сети отелей · lp4, lp5 | rewards/Rewards / loyalty | **Собрано.** Программы: скидка/баллы/оба вида; подключение без отключения. Уровни/прогресс/условия и снимок в новой брони, начисление после выезда; текущая карточка вариант 3, CTA внизу | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| L06 | Пригласить друга · i1 | hotelier/Invitation | **Собрано.** i1/i2: обычный друг или коллега; без передачи статуса | [hotelier.test.mjs](../../tests/hotelier.test.mjs) |
| P01 | Профиль · p1, fr2 | hotelier/ProfilePage | **Собрано.** fr2, общий баланс, статус отельера, приглашения, разделы профиля | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| P02 | Список путешественников ·  | Prototype / auth | **Собрано.** Путешественники, редактирование/несохранённое/удаление и правильный возврат | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| P03 | Данные путешественника ·  | Prototype / auth | **Собрано.** Путешественники, редактирование/несохранённое/удаление и правильный возврат | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| P04 | Создание и редактирование путешественника ·  | Prototype / auth | **Собрано.** Путешественники, редактирование/несохранённое/удаление и правильный возврат | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| P05 | История путешествий · p3 | profile/ProfileHistory / history | **Собрано.** История общих броней, поиск/сортировка, отзыв, повтор и поддержка | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| P06 | Прошлая поездка и отзыв из истории · p3, d1, x2 | profile/ProfileHistory / history | **Собрано.** История общих броней, поиск/сортировка, отзыв, повтор и поддержка | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| P07 | Настройки уведомлений · p6 | profile/ProfileSettings / settings | **Собрано.** Настройки уведомлений, тихие часы, локальные PIN/биометрия/сеансы | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |
| P08 | Безопасность и доступ · p6 | profile/ProfileSettings / settings | **Собрано.** Настройки уведомлений, тихие часы, локальные PIN/биометрия/сеансы | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |
| P09 | PIN код приложения ·  | profile/ProfileSettings / settings | **Собрано.** Настройки уведомлений, тихие часы, локальные PIN/биометрия/сеансы | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |
| P10 | Устройства и сеансы ·  | profile/ProfileSettings / settings | **Собрано.** Настройки уведомлений, тихие часы, локальные PIN/биометрия/сеансы | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |
| P11 | Помощь и поддержка ·  | profile/SupportPage / support | **Собрано.** Помощь, статьи/поиск, обращение с контекстом и сохранённые детали | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| P12 | Статья помощи ·  | profile/SupportPage / support | **Собрано.** Помощь, статьи/поиск, обращение с контекстом и сохранённые детали | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| P13 | Обращение в поддержку Ключей ·  | profile/SupportPage / support | **Собрано.** Помощь, статьи/поиск, обращение с контекстом и сохранённые детали | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| P14 | Детали обращения ·  | profile/SupportPage / support | **Собрано.** Помощь, статьи/поиск, обращение с контекстом и сохранённые детали | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| P15 | Управление данными · p6 | profile/ProfileSettings / settings | **Собрано.** Согласия и локальный запрос удаления с отменой, без удаления сервера | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |
| P16 | Запрос удаления аккаунта ·  | profile/ProfileSettings / settings | **Собрано.** Согласия и локальный запрос удаления с отменой, без удаления сервера | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |

## Сквозные пути

| ID | Сценарий | Путь | Ожидаемый результат / граница | Доказательство логики |
|---|---|---|---|---|
| J01 | Первый вход | A01–A04 | SMS маска/код/автопереход; обязательный мобильный вход | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| J02 | Поиск и онлайн-бронирование | F01 → H01 → B01–B09 | Сохранённый черновик, оплата, новая поездка | [booking.test.mjs](../../tests/booking.test.mjs) |
| J03 | Оплата в отеле | B06–B09 | 0 оплачено сейчас и остаток в отеле | [payment.test.mjs](../../tests/payment.test.mjs) |
| J04 | Вход во время брони | A09 | Десктоп отложен. Мобильный вход требуется до поиска | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| J05 | Прерывание опроса | Q01–Q05 | Резервная ветка, вход с поездок удалён; черновик технически сохранён | [preferences.test.mjs](../../tests/preferences.test.mjs) |
| J06 | Уточнение рекомендаций | Q05 → H01 → Q04 | Резервный опрос; основной редактор предпочтений — свайп/отель | [swipe-preferences.test.mjs](../../tests/swipe-preferences.test.mjs) |
| J07 | Текстовый поиск | Q06 → H01 → Q06 | Прямой путь без промежуточных шагов, карта и теги | [text-results-filters.test.mjs](../../tests/text-results-filters.test.mjs) |
| J08 | Избранное | F04 → F10 → F11 → H01 | Состав, заметка, карта, исходный возврат | [favorites.test.mjs](../../tests/favorites.test.mjs) |
| J09 | Следить за ценой | H01 → F09 | Пауза/удаление/снижение/рост; локальный мониторинг | [price-events.test.mjs](../../tests/price-events.test.mjs) |
| J10 | Карта отеля | B06/L01 → B10 | Правильный отель, возврат и пересчёт без изменения старой брони | [rewards.test.mjs](../../tests/rewards.test.mjs) |
| J11 | Friendly Rate | A05–A08 → H01 → B01 | 35% во всех отелях только approved; старый ответ не выдаёт роль | [hotelier.test.mjs](../../tests/hotelier.test.mjs) |
| J12 | Изменение брони | T02 → M02 | Доплата/возврат/ошибка/идемпотентность | [amendment.test.mjs](../../tests/amendment.test.mjs) |
| J13 | Отмена брони | M03 → M04 | 3 дня либо ночь, возврат исходным способом один раз | [payment.test.mjs](../../tests/payment.test.mjs) |
| J14 | Подготовка к приезду | T02 → T06/T07 → U07/U06 | Время добавляется сразу и оплачивается в отеле; завтрак оплачивается онлайн | [stay-time-services.test.mjs](../../tests/stay-time-services.test.mjs) |
| J15 | Ошибка ключа | T03 → U08 | Один клик, ожидание, ошибка/повтор; без Face ID и промежуточного подтверждения | [door-attempt.test.mjs](../../tests/door-attempt.test.mjs) |
| J16 | Услуга и отмена | U01 → U02/U03 | Состав, количество, общая оплата, история и возврат | [service-choices.test.mjs](../../tests/service-choices.test.mjs) |
| J17 | Помощь во время проживания | T03 → U05 / P11–P14 | Проблема и поддержка — разные записи, у обеих есть контекст | [stay-problems.test.mjs](../../tests/stay-problems.test.mjs) |
| J18 | Выезд и отзыв | T04 → T08 → R01/R02 | Отель оформляет выезд, ключ закрывается, отзыв компактен после отправки; R03 вопрос | [stay-review.test.mjs](../../tests/stay-review.test.mjs) |
| J19 | Отзыв из уведомления | N01 → R01/R02 → N01 | Возврат в уведомления; отзыв после первой ночи пока не включён | [notifications.test.mjs](../../tests/notifications.test.mjs) |
| J20 | История и поддержка | P05 → P06 → P13 → P14 | Контекст выбранной поездки, локальный запрос | [profile-history-support.test.mjs](../../tests/profile-history-support.test.mjs) |
| J21 | Путешественник | P02 → P03 → P04 → P03 | Сохранить/отказаться/продолжить, старые брони не переписываются | [auth.test.mjs](../../app/tests/auth.test.mjs) |
| J22 | Настройки | P07/P08/P15/P16 | Локальные изменения, запрос удаления и отмена | [profile-settings.test.mjs](../../tests/profile-settings.test.mjs) |
| J23 | Поделиться | S02 → S03 | Чтение/полное управление, QR, проверка доступа | [booking-share.test.mjs](../../tests/booking-share.test.mjs) |

## Финальные вопросы и исключения

- Десктоп A09/J04 — только после проверки пользователя. Онлайн-регистрация, чек проживания, депозит и флоу подготовки к выезду исключены прямыми решениями.
- R03: чаевые и начисление за отзыв не реализованы. Нужны условия получателя/доступности и подтверждение, включать ли в первую мобильную версию. Подтверждение отзыва уже есть.
- Отзыв после первой ночи: текущая модель разрешает оценку после выезда. Нужна отдельная продуктовая граница для промежуточного отзыва; сейчас уведомление не обходит проверку.
- Q01–Q05/J05–J06: прежний пошаговый опрос сохранён как резервная ветка без входа из поездок. Основные доступные подборы — свайпы с предпочтениями и свободный текст. Не возвращать удалённый баннер.
- Уровни/начисления/срок баллов и бонусы приглашения не выдумывать. Рабочие скидки, балансы и возвраты остаются общими.

Следующий этап: M5 — визуальная сверка на iPhone/Pixel, состояния и навигация. Наличие строки «Собрано» не заменяет этот этап.
