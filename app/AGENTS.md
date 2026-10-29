30.10.2026 · Актуальная передача мобильной версии: ../docs/handoff/README.md, MOBILE-CONTRACT.md и COMPONENTS.md. Поздние прямые решения пользователя заменяют исторические пункты ниже: мобильный вход обязателен, депозит/поиск чатов/отключение карты удалены из UI, отдельные услуги оплачиваются без переключателя баллов, ранний заезд/поздний выезд после брони добавляется сразу с оплатой в отеле. Уровень отеля — последний вариант 3 (белый с синим акцентом слева). Нельзя применять старые записи как одновременные требования. Десктоп после финальной приёмки. QA: ../docs/iteration-9/qa-mobile-2026-10-30/REPORT.md.

28.10.2026 · Мобильное завершение M1–M6: реализация и QA переданы на финальную проверку пользователя. Актуальный маршрут ../docs/MOBILE-REVIEW.md, матрица ../docs/iteration-7/MOBILE-MATRIX.md. 328 тестов, build, 28 protected файлов; отчёты qa-rewards/settings/history-support/chats/service-choices/mobile-final. Десктоп не начинать. Открытые коммерческие вопросы не выдумывать. rewards/ — общие кошельки/карты, profile/ — история/настройки/поддержка, chatThreads — диалоги по владельцу/отелю, ServiceChoicesSheet — заказы услуг. Не создавать файлы, различающиеся только регистром (SupportPage/support, ServiceChoicesSheet/serviceChoices). Scoped h1/h2/p обязательны. Общие кнопки сохраняют фокус ввода на pointerdown. FlowStack не должен прокручиваться от фокуса: scoped overflow:clip; runtime не менять.


# Mobile Prototype Agent Guide

30.10.2026: окончательное уточнение текущего уровня отеля — вариант 3 вместо мятного: белая карточка с кобальтовым акцентом слева 5 px, кобальтовое название, мягкая тень. Зелёный статус и таймлайн сохранены. Количество привилегий остаётся скрытым в списке.

30.10.2026: текущий уровень отеля — выбранный вариант 2, мятная заливка #DCF7ED, зелёная рамка #21996E, тёмный текст, белые плашки выгод. Заменяет кобальтовую карточку. Таймлайн и зелёный статус сохранены; количество привилегий не возвращать.

28.10.2026 · Уточнение D-101: в pending-экране HotelierFlow действие «Подтвердить позже» вызывает clearVerification только для текущего pending, затем onDone. Статус none, старый claim недействителен, баннер интереса остаётся. Не возвращать «Открыть в этой вкладке» и текст о блокировке вкладки. Основная ссылка кабинета остаётся.

28.10.2026 · D-102: ProfilePage следует композиции fr2: личность/статус → синяя карточка текущих баллов keys:owner → компактные группы Row. Не ставить примерный баланс или неподтверждённый уровень «Дальняя орбита». Путешественники за строкой «Документы и гости», профильный редактор «Мой стиль» переиспользует SwipePreferences, применяет только по сохранению и возвращает в профиль. Уведомления поддерживают notificationsReturnTo=profile. Приглашения и слежение за ценами сохранены. Новая платёжная интеграция, язык, поддержка не входят в этот проход.

Название тарифа в любых пользовательских текстах всегда писать **Friendly Rate** на английском, даже если пользователь пишет его кириллицей. Кнопка fr6: «К отелям с Friendly Rate».

28.10.2026 · Уточнение D-101: HotelierInfoSheet следует fr6, без дополнительных списков правил; CTA «К отелям с френдли рейтом» открывает collection=friendly с текущими параметрами поиска. В таблицах HotelPrice/Price лейбл FR только в строке скидки, не отдельным блоком под заголовком. В Summary бронирования FR обозначен названием тарифа без дублирующего бейджа.

28.10.2026 · D-101: приглашения i1/i2 выбираются по approved: гостю обычная ссылка, отельеру выбор коллеги или путешественника. Пропуск сохраняет hotelierParticipants по владельцу, показывает z4 без роли/фиктивной заявки. Шаг «Вы работаете в отеле?» удалён. z5 — успех с единственным переходом в приложение; выбранный баннер варианта 2 сохранён. FR разрешён пользователем во всех 53 отелях, −35% от соответствующего обычного тарифа (178 пар, baseRateId). Новый подбор approved по умолчанию FR; обычные тарифы доступны. Общие FriendlyRateBadge и ratePrice; зелёная карточка fr4, белая цена fr3, не фиолетовая лояльность. Старые брони не пересчитывать. Остальные коммерческие условия не выдумывать. Проверка: ../docs/iteration-7/qa-hotelier-invites/REPORT.md.

Микровзаимодействия: применять UI Kit (F4/B1/S2/N2/N4/N5 и каталог 09), функциональный DOCX и утверждённые решения при каждом новом экране. Внешний вид — «Все экраны», без смешивания с альтернативной айдентикой. Нижнее меню с подложкой без точки. Общие реакции реализованы в app/src/interactions.tsx/css (из app/ путь src/), компоненты — ui.tsx; не размножать отдельные тайминги по экранам. Онбординг следует отдельному D-011. Наличие спецификации не означает, что весь её объём уже реализован; статус — docs/iteration-3/COMPONENTS.md.

## Ключи: решения пользователя

Анимации онбординга брать из пользовательской папки `проект в Клоде/project/github-onboarding` (D-011). Используем механику варианта 1 для текущих o1–o3: заставка 2,4 с, crossfade 600 мс / сдвиг 36 px за 800 мс, орбитальные появления и полоски прогресса. Реализация в src/onboarding/. Иллюстрации должны сохранять DOM между обновлениями: использовать memo-компонент со стабильным html; повторное назначение innerHTML обрывает transitions. Холст исходной графики 343 × 356, изолировать его размеры и line-height от глобальных стилей. Сохранять тексты с согласованной логикой, поддерживать reduced motion. Статусная строка и рамка устройства не участвуют в переходах.

Эталон — «Ключи - Все экраны.dc.html». Сохранять дизайн Onest + Unbounded / #2F5BFF, исправляя ошибки. Поле телефона без синей рамки и свечения, включая фокус; фокус нейтральный серый. Иллюстрации login-art.html и o1–o3-art.html — извлечённые оригиналы, не заменять приближёнными рисунками.

Онлайн-регистрация исключена. Ключ только после заселения. Friendly Rate — подтверждённым отельерам, без программы отеля, но с баллами «Ключей». Баллами можно покрыть до 100% проживания и услуг: максимум либо ничего, кошельки раздельны.

Общие компоненты — src/ui.tsx, каталог #kit. Сохранение — src/state.ts и localStorage keys-orbita-demo-v1. Интеграции демонстрационные. Результаты этапа: ../docs/iteration-3/, визуальная проверка: design-qa.md.

## Prototype Instructions

In ChatGPT Work Mode, run `sites-preview start "$PWD"`, open `http://terminal.local:4173/` in the cloud browser, and verify the rendered app and its primary interactions. Keep that preview open and tell the user to inspect it in the cloud browser; do not present the local URL as a user-facing chat link. In Codex Desktop, run the local server yourself, open the preview in the in-app browser, and provide the clickable local URL. Do not deploy to Sites unless the user explicitly asks to share, publish, or deploy. Do not give the user server-start instructions when you can run it.

Before planning or implementing any mobile-app change, read this `AGENTS.md` in full. It is the source of truth for the template's runtime and component guidance.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Editing Boundary

- Build app-specific UI in `src/Prototype.tsx` and `src/prototype.css`.
- Treat `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`, `public/assets/iphone/`, `public/assets/android/`, `public/assets/status/`, `vite.config.ts`, `worker/index.js`, and `scripts/prepare-sites-build.mjs` as protected runtime files. Do not edit, replace, remove, or recreate them unless the user explicitly asks to change the mobile runtime itself. For an explicit runtime change, update the affected lock hashes only after verifying the new runtime behavior.
- Run `npm run check:runtime` before preview or handoff. If it fails, restore the protected runtime instead of weakening or bypassing the check.
- `npm run build` preserves the mobile runtime and prepares the static Cloudflare Worker output required by Sites. Before a Sites handoff, confirm `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json` exist, then run `npm run test:sites`. Do not replace this project with a Vinext starter.

## Runtime Contract

- Preserve the mobile device runtime unless the user's task explicitly asks otherwise. Do not replace it with a standalone page. Visual fidelity applies to app-owned content inside the device screen, not to template-owned device chrome.
- Keep `App` composed around `PhoneFrame` -> `KeyboardProvider`, with `StatusBar`, app content, `HomeIndicator`, and `KeyboardDock` mounted inside the phone frame. `StatusBar` and the iOS home indicator are overlaid device chrome. When the Android keyboard is closed, the app viewport reserves the protected navigation-bar region instead of painting behind it. When the Android keyboard is open, preserve the current full-screen keyboard layout: its asset includes the IME navigation strip and the separate black navigation bar is hidden. iOS screens continue to paint behind the home-indicator area and own their safe-area content padding.
- Preserve the `iPhone` / `Pixel 10` device picker and both calibrated device presets. The Pixel screen is `427 x 952`; its `32 x 32` camera circle and `public/assets/android/navigation-bar.svg` bottom navigation bar are protected device chrome, not app content.
- Preserve the device picker's intentionally lightweight Codex styling in the top-right corner: its trigger wrapper is borderless and transparent, its trigger sizes to content, and its right-aligned menu uses the compact 3px inset plus the specified hairline and elevation shadow layers. Keep the prototype root and default app screen white.
- Preserve `StatusBar` as live device chrome, including its platform-specific typography, source status-icon assets, and spacing. Pixel 10 uses Roboto, Android indicators, and 32px top, left, and right padding. iPhone uses its iOS indicators, system typography, and calibrated spacing. Do not hardcode screenshot times like `9:41` into the status bar, replace its real-time clock, or move status bar content into app markup unless the user explicitly asks for a fixed/mock device time.
- `PhoneFrame` owns the calibrated device frame, screen portal, device picker, camera cutout, and custom cursor. Keep device assets in `public/assets/iphone/` and `public/assets/android/`; if an asset fails to load, repair the asset path or restore the asset instead of removing the frame, keyboard, or image render.
- Use `MobileScroll` directly for simple single-screen prototypes. Use `FlowStack` for conventional multi-screen flows whose routes can own their fixed header and footer; when using it, define each route as a `FlowScreen`: `{ id, header?, headerHeight?, footer?, footerHeight?, render }`, and use `flow.push(screen)`, `flow.pop()`, and `flow.replace(screen)` from `FlowStack` render callbacks or `useFlow()` instead of introducing another router.
- Use `Carousel` for a carousel, horizontal rail, swipeable cards, image or media strip, horizontally scrollable cards, chip rail, or other horizontal collection.
- For a layered app shell—such as a persistent composer, independently presented sheet, pushed/peek sidebar, or app-wide transition—compose directly in `Prototype.tsx` rather than forcing it through `FlowStack`. Keep app-owned fixed chrome as sibling layers outside `MobileScroll`.
- When using `FlowScreen`, put route-owned fixed headers or footers in `FlowScreen.header` or `FlowScreen.footer`. Set `headerHeight` to the visible app-toolbar height; `FlowStack` adds the device's top safe-area/status-bar inset automatically. Do not include `StatusBar` or its height in the header. Set `footerHeight` to the full app-footer height. `FlowScreen.footer` is an overlay, not reserved layout space; screens using it must add their own bottom content padding such as `padding-bottom: calc(var(--flow-footer-height) + var(--mobile-safe-area-height) + 24px)` so final content can scroll above the footer while still painting behind it.
- Render only scrollable content inside `MobileScroll`; it is for content that should move with scroll and rubber-band overscroll. Keep app-owned headers, nav bars, tabs, composers, and overlays outside it. This keeps scroll physics, safe areas, keyboard insets, scrollbars, and drag click suppression active without letting content paint under fixed chrome.
- Buttons, links, cards, and images inside `MobileScroll` should still allow drag scrolling when the pointer moves beyond tap slop. Use `data-scroll-drag="ignore"` only for rare controls that must own the drag gesture themselves.
- Do not add `var(--keyboard-height)` to ordinary screen/content padding inside `MobileScroll`; the scroll viewport already shrinks above the simulated keyboard. For custom fixed composers, search bars, or toast chrome, use `useKeyboardInsets().bottomInset`. It is relative to the app viewport: Android returns `0` while the closed-keyboard viewport already reserves navigation, then returns the keyboard height while open; iOS continues to clear the home indicator while closed and ride directly above the keyboard while open. Do not pin custom bottom chrome to `bottom: 0` or only `keyboardHeight`.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for every text-entry control. A raw `input` or `textarea` disconnects focus, keyboard animation, safe-area insets, and attached surfaces.
- Use `BottomSheet` for phone-scoped sheets. Its props are `open`, `onOpenChange`, `title`, optional `description`, optional `snap`, and `children`; it renders through the phone screen portal and dismisses the keyboard before opening.

## Horizontal Carousels

- Use `Carousel` for horizontally draggable cards, images, media, chips, or other horizontal collections. Do not recreate these with `overflow-x`, custom pointer handlers, or a generic div.
- `Carousel` can be nested directly inside `MobileScroll`. It owns horizontal gestures and automatically yields vertical gestures to the parent.
- Never put `data-scroll-drag="ignore"` on or around a `Carousel`; doing so prevents vertical parent scrolling when a gesture begins inside it.
- Do not add CSS scroll snapping to `Carousel`; its runtime owns momentum and release motion.
- Use `data-scroll-drag="ignore"` only when a control must prevent parent scrolling in every drag direction.

See `src/mobile/COMPONENTS.md` for the full component and gesture contract.

## Keyboard Rule

The simulated keyboard is a separate top-layer component. Before presenting anything that behaves like iOS navigation or modal UI, dismiss it first.

Call `keyboard.hide()` before:

- pushing, popping, or replacing FlowStack routes
- opening bottom sheets, action sheets, dialogs, menus, or navigation sheets
- starting transitions where the destination should not inherit text-input focus

`FlowStack` already hides the keyboard for `push`, `pop`, and `replace`. `BottomSheet` already hides it before opening. If you add new modal/sheet/navigation primitives, follow the same rule.

When a composer, search surface, or other keyboard-attached component closes, call `keyboard.hide()` in the same event before changing that component's open state. Position attached surfaces from `useKeyboardInsets()` rather than a separate timer or visibility flag so both dismiss together.

When any text-entry control loses focus, dismiss the simulated keyboard. If the control is custom or does not use the runtime's keyboard-aware fields, handle its blur event and call `keyboard.hide()` explicitly. Keep the keyboard open only when focus is moving directly to another text-entry control that should share the same keyboard session.

## Interaction Rules

- Do not trigger buttons or inputs after a pointer has become a drag. Preserve the drag suppression behavior in `MobileScroll`.
- Do not allow native browser image/file dragging inside the phone frame. Preserve the phone-level `dragstart` suppression and non-draggable image styles so scroll drags that begin on images still scroll the prototype.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for text entry so the simulated keyboard and safe-area insets stay connected.
- Fixed phone chrome should not animate with pushed screens. Screen content can animate; the status bar, camera cutout, and preview chrome should stay put.
- Keep the keyboard below the home indicator/safe area layer in z-index, and above ordinary app UI while visible.
- Keep the home indicator as the topmost safe-area layer in the z-index above everything else in the prototype.

## Итерация 4

Первый путь поиска и брони — src/booking/, состояние keys-orbita-booking-v1, расчёт через общее ядро prototype/domain/. Даты, тариф, услуги и кошельки связаны; подтверждение и отмена идемпотентны. D-013: бесплатно за 3 дня, позже одна ночь. Детали и границы — ../docs/iteration-4/README.md. Защищённый mobile runtime не менялся.

21.10.2026, уточнение пользователя: текущие экраны слишком отличаются от макетов. Приоритет — восстановить точную композицию «Все экраны» перед расширением сценариев: размеры, порядок блоков, плотность, фото и положения цен. Нельзя заменять экран упрощённой универсальной карточкой ради логики.

22.10.2026: пользователь просит проверять не только основные экраны, но и окна полей «Куда», «Даты», «Гости», весь состав f1 и компонент нижней навигации. Не считать рабочую кнопку завершением экранного сценария. Текущее покрытие и оставшиеся ветки — docs/iteration-4/FLOW-AUDIT.md (из app/: ../docs/iteration-4/FLOW-AUDIT.md). Следующий проход — номера/тарифы tv2b/tv2c/rm1/gl1.

22.10.2026, D-015: даты и гости открываются отдельно. Карта c2 — ResultsMap.tsx; h9/x1/n1/d5 — HotelDetails.tsx; h2/w1 — HotelSheets.tsx. Подпись h1 «Под ваши предпочтения». Слежение сохраняет локальный порог и push-настройку, уведомления не отправляются. Реальные карты/такси не подключены. Следующий проход — номера/тарифы tv2b/tv2c/rm1/gl1.

22.10.2026, D-016: «Куда», даты и гости используют BottomSheet; календарь остаётся отдельным. Блок ребёнка — отдельная карточка k3g без разделителя под строкой «Дети». Filters.tsx — общий k1 для списка и карты; применение по кнопке, закрытие отменяет черновик. Расчёты фильтров — offers.ts. Карта раскрывается через ExpandingMap в interactions.tsx: 460/380 мс ios-push, reduced motion — opacity. Защищённый runtime не менять.

22.10.2026, D-017: фильтры и сортировка выдачи — единая фиксированная компактная шапка вне MobileScroll (ResultsHeader.tsx). Параметры поиска — явная кнопка с подписью «Изменить», городом, датами и гостями. Строку количества отелей / «цены напрямую» не возвращать.

22.10.2026, D-018: фото в карточках выдачи листаются горизонтально через общий Carousel с живым счётчиком; вертикальный жест прокручивает список. Иконки ссылок на странице отеля наследуют цвет текста (Icon inheritColor). В h2 доступные баллы обычного начертания, подсказка о применении на оплате удалена. Повторные пояснения о прототипе убраны из пользовательских экранов; сведения о симуляции — в свёрнутом блоке инструментов вне телефона. Реальные интеграции не добавлялись.

22.10.2026, D-019: избранный отель — сердечко с розовой заливкой #E84D7A; обычное состояние — тёмный контур без заливки. Единый SavedButton в выдаче и деталях отеля, исходная геометрия heart.svg.

22.10.2026, D-020: по аннотации пользователя облегчена шапка выдачи. Параметры — без белой карточки и рамки, город заголовком, даты/гости второй строкой, справа карандаш в круглой подложке. Вся строка остаётся кнопкой 44 px. Чипы 32 px, межрядный отступ 8 px, высота шапки без safe area 96 px. Это уточняет визуальное решение D-017; закрепление и редактирование сохранены.

22.10.2026: проход B01–B03 собран в booking/Rooms.tsx (из корня: app/src/booking/): категории/тарифы tv2b, условия tv2c, оснащение rm1 и галерея gl1. Общий расчёт через roomOffers.ts и quoteDraft; включённый завтрак не дублируется услугой. Демокаталог расширен по рабочему P-014. Следующий проход — B04–B05, гости/пожелания; актуальные ограничения — FLOW-AUDIT.md.


22.10.2026, D-021: выбор номера без дат/гостей и числа ночей в шапке. Оснащение/тариф используют стиль h2; фильтры — общий filters-panel/k1. Шторки RoomsSelection вынесены за MobileScroll, фон booking-scroll заполняет сцену. Фото: Mantera 7/7/6, остальные демономера по 2. h5: второй гость с сохранением в черновике и брони, карточки программы/услуг, кнопка «Продолжить». Старые ограничения баллов 20% не возвращать. Подробности: docs/iteration-4/FLOW-AUDIT.md.


22.10.2026, D-022: программа отеля перенесена с h5 на оплату перед способами оплаты. Способы — горизонтальные карточки Carousel, дополнительные скрыты в «Другое». Нулевые строки кошельков скрыты; без доступных баллов переключатель отключён. Ссылка изменения услуг с оплаты убрана, услуги остаются на первом шаге.


22.10.2026, D-023: ручной выбор путешественников из оформления убран. Основной контакт подставляется из профиля; при добавлении дополнительного гостя автоматически берётся следующий неиспользованный путешественник с именем и фамилией, без отдельного списка. Редактирование существующего гостя не перезаписывает ввод. СБП — первый способ оплаты и значение по умолчанию новой брони; явно выбранный способ сохраняется. Условия отмены — последний блок оплаты, после налогов и сборов.


22.10.2026, D-024: на выборе номера убраны ряд фильтров и их шторка; показываются доступные категории и тарифы без локальных фильтров. Фильтры выдачи отелей сохранены. Под строкой пожеланий к проживанию нет разделителя. Строки с количеством баллов в оплате видны только при включённом и доступном списании; нулевые кошельки по-прежнему скрыты.


22.10.2026, D-025: в шторке пожеланий нет разделителей между вариантами и видимого заголовка «Другие пожелания» над текстовым полем; доступное имя поля сохранено. Сортировка выдачи — компактная BottomSheet с заголовком Unbounded 20/26, строками Onest, кобальтовой отметкой и мягкой подложкой выбранного варианта, без иконок фильтра и стрелок в каждой строке. Выбор применяется сразу и закрывает шторку.


22.10.2026: выполнен проход деталей/изменения подтверждённой брони — d1 и b3/M02. BookingRecord.tsx / record.css, расчёт amendment.ts; версия и история, доплата/возврат, отказ/повтор, отмена после изменения и текстовое подтверждение. Рабочие правила P-016. 98 тестов и сквозной браузерный сценарий. Далее u1b, документы d2 и действия подготовки к заезду; итерация 4 в работе.


22.10.2026, D-026: «Особенности поездки» показываются только при поиске отеля. В окне гостей при оформлении и изменении брони остаются взрослые, дети и их возраст. GuestPicker включает особенности явно через showTripFeatures только в поиске; существующие параметры сохраняются.


22.10.2026: проход T02/T06 — UpcomingTrip.tsx (u1b), TripPreparation.tsx (d4, общий d5, услуги и локальный чат). Поездка выбирается по владельцу и bookingId, карточка читает актуальную бронь; при оплате в отеле виден остаток, после раннего заезда — 10:00. Маршрут использует снимок брони без замены независимого черновика. Вход в редактор из услуг возвращается к услугам. Переписка хранится по bookingId, только локальные сообщения без реальных отправок/ответов. Полный заказ услуг sv1–sv3, запрос времени d6, документы d2 и проживание остаются следующим объёмом. 102 теста, сборка/runtime, два браузерных сценария; qa-trip/.


22.10.2026, D-027: изменение точки отправления — отдельный d5b; добавление раннего заезда из поездки/услуг — BottomSheet d6; инструкция — d4; завтрак — sv3, разрешённый настройками отеля заказ — sv2. Ранний заезд сохраняется запросом без автоматической оплаты и смены гарантированного времени. Завтрак: дата/персоны/время/комментарий, локальная заявка с ожиданием, просмотр и отмена; включённый шведский стол не дублируется. Основной вход раннего заезда больше не ведёт в b3. Старое изменение подтверждённой услуги в b3 сохранено. Правила/границы — P-018, проверка qa-trip-services.


22.10.2026, D-028: убраны повторные ссылки «Написать в отель» из инструкции, «Чат с отелем» внизу списка услуг и «Уточнить в чате» из завтрака. Основные входы — плитка поездки и вкладка чатов — сохранены; контекстные вопросы по услугам остаются. Внутри переписки номер брони и даты заменены лейблом «С вами общается ИИ-ассистент». Это обозначение интерфейса; реальная ИИ-интеграция и ответы ещё не реализованы, сообщения сохраняются локально.


22.10.2026, D-029: кнопки d1 приведены к «Все экраны»: «Скачать документы» — основная 52 px с иконкой 20 px, «Изменить бронь» — тонированная 44 px, отмена — красная текстовая 44 px; радиус 14 px, интервал 8 px. Скачивается существующее текстовое подтверждение, PDF/комплект документов остаются отдельным этапом. Стрелка назад в d1/b3 — 22 px в общей круглой кнопке 44 px. Возврат из вложенных экранов поездки хранит последовательность: услуги → завтрак → заказ, назад в обратном порядке; чат из вкладки чатов возвращает в чаты.

Дополнение D-029: устранена коллизия React key у BookingRecord и соседней EarlyArrival: уникальные префиксы предотвращают сохранение старого экрана поверх поездок после возврата. Защищённый mobile runtime не изменялся.


22.10.2026, D-030: d1 и d3 приведены к конкретным макетам «Все экраны». d1: шапка 44 px, карточки/строки и заголовки исходной плотности, полные подписи гостей/ночей, итог оплаты Onest 14/20 вместо крупного Unbounded; нулевой остаток при заселении скрыт. В строке отмены d1 краткая дата, в d3 полный действующий срок. d3: компактная шторка, отель/даты, серая карточка расчёта, раздельный возврат баллов, условия, красная «Отменить бронь» и текстовая «Оставить бронь». Номера карты и суммы из макета не выдумываются; возврат соответствует способу оплаты. Реальные данные услуг, гостей, пожеланий и истории сохраняются дополнительными блоками d1. Расчёт отмены D-013/P-013 и общий BottomSheet не менялись.


22.10.2026: d2/M05 реализован в TripDocuments.tsx, documents.ts и лениво загружаемом documentFiles.ts. Просмотр/PDF/ZIP и локальный EML; данные из выбранной брони, до оплаты нет чека, после отмены есть возврат. Отправка письма не выполняется приложением. Правила P-019. Счёт после выезда остаётся недоступным. Исходники и protected runtime не менять.


22.10.2026, D-031: по прямому запросу пользователя «Чек на проживание» полностью исключён из прототипа — из списка d2, просмотра, PDF, ZIP и вложения EML, включая недоступное состояние до оплаты. Подтверждение брони, подтверждение отмены и счёт после выезда сохранены. Это уточняет P-019; архивные макеты и прежние QA-артефакты не изменяются.


22.10.2026, D-032: возврат за дополнительные услуги определяется условиями конкретной услуги отеля. Для демонстрационного отеля пользователь выбрала: завтрак — бесплатно до 20:00 накануне; ранний заезд — за сутки до выбранного времени; позже без возврата. Времена — мск, точная граница включительна. Условия сохраняются в заказе при подтверждении и показываются до оплаты и отмены. Деньги и баллы возвращаются исходным способом/в исходные кошельки; повторное действие не создаёт нового возврата. Эти условия действуют и при отмене всей брони.


23.10.2026, D-033: окна заказа и отправки заявки используют кнопки действий UI kit, без текстовых ссылок вместо кнопок. После отправки раннего заезда/завтрака открывается статус заявки с «Готово» и «Отменить заявку»; у подтверждённого заказа — оплата и отмена. Дублирующий заголовок услуги и лишние действия убраны. В раннем заезде изменение времени показывается только при выборе нового времени. В оформлении брони пустые фамилия/email заполняются вымышленными «Примерова» и guest@example.test; данные профиля и заполненного черновика имеют приоритет, профиль не меняется.


23.10.2026: новое направление для услуг — меньше повторяющихся пояснений и отдельных информационных карточек; строка стоимости и основная кнопка по композиции флоу бронирования (сумма отдельной строкой над широкой кнопкой). Условия, влияющие на оплату/отмену, остаются доступны. Пользователь выбрала вариант 3; реализация и уточнение заказа на всё проживание — D-034 ниже.


23.10.2026, D-034: пользователь выбрала вариант 3 из Product Design и добавила заказ завтрака на всё проживание. Заказ — BottomSheet поверх sv3; сумма отдельной строкой над широкой кнопкой, комментарий/условия раскрываются. Переключатель «Один день / Всё проживание». Рабочая детализация: утра после первой ночи до выезда включительно; прошедшие и уже заказанные даты того же типа исключаются. Включённый шведский стол повторно не продаётся. Общая заявка сохраняется атомарно с groupId и отдельными записями дней: подтверждение, оплата и отмена доступны по каждому дню, срок возврата D-032 сохраняется. После отправки — общая сумма и список дат; на sv3 — одна карточка группы. Реальных интеграций нет. Эталон/проверка: docs/iteration-4/qa-breakfast-stay/ из корня.


23.10.2026, D-035: по уточнению пользователя из формы добавления завтрака убраны комментарий и блок условий отмены. Переключатель периода использует тот же breakfast-segments, что и страница завтрака, без отдельного синего контура. В «Заявка отправлена» убраны предварительная сумма и подсказка «Оплата после подтверждения отеля»; в группе завтраков убрана общая предварительная сумма. Сумма перед отправкой и сведения об оплате/возврате подтверждённых услуг сохранены. Это уточняет D-034.


23.10.2026, D-036/P-020: обложка поездки — hotelPhoto(hotelId), первая фотография hotelVisual; Mantera использует MANTERA_COVER из общей галереи. Проживание — booking.stay, домен booking/stay.ts, UI StayExperience.tsx. Ключ появляется только после demoCheckIn, а не оплаты/даты. Демонстрационные часы хранят смещение на заезд; услуги используют stayNow. Не списывать долг при заселении. Замок/биометрия/Wi-Fi имитируются, инструменты за пределами телефона. Статус и следующий объём — ../docs/iteration-5/README.md; s2 реализован частично, далее счёт и выезд.


23.10.2026, D-037 (последнее уточнение пользователя): мобильное приложение доступно только после авторизации. Общая проверка сессии закрывает все внутренние маршруты, включая прямые ссылки и возврат истории; до входа доступны только онбординг, телефон, код и имя. Кнопок гостевого продолжения нет. Завершение онбординга ведёт во вход, выход из профиля возвращает на телефон. После входа восстанавливается целевой маршрут. Пустой блок «Недавние поиски» скрыт целиком; после выполненного поиска показывается история. Это заменяет незавершённое изменение гостевого режима из предыдущего сообщения.


23.10.2026, D-038: поле телефона на входе использует маску +7 (900) 000-00-00. Префикс +7 остаётся отдельным, редактируются 10 цифр номера. Вставка полного номера с +7 или 8 нормализуется. Поддержаны удаление через разделители и замена выделенного фрагмента с сохранением позиции курсора. Общий PhoneField применяется также в UI kit; форматирование — phoneMask.ts. Нейтральный фокус D-010 и KeyboardInput сохранены.


23.10.2026, D-039: по запросу пользователя кнопка «Готово» в подтверждении заявки на завтрак закрывает окно и открывает «Поездки». Применяется к одному дню и ко всему проживанию. Закрытие шторки жестом сохраняет прежнее поведение; другие услуги не меняются.


23.10.2026, D-040: иконка изменения поиска в выдаче открывает отдельный экран k3 «Когда и кто»: календарь, взрослые/дети и возраст, особенности поездки, нижняя кнопка с диапазоном дат и числом ночей. Изменения применяются вместе, крестик отменяет локальные правки. Вход с карты возвращает на карту. Город здесь не редактируется; отдельные окна «Куда», «Даты», «Гости» на странице «Найти» сохраняются по D-015/D-016. Реализация ResultsSearch.tsx, общие Calendar/GuestFields и FlowStack.


23.10.2026, дополнение D-040: в заголовке выбора номера добавлена кнопка с карандашом «Изменить даты и гостей». Общий экран «Когда и кто» редактирует draft.search; особенности поездки скрыты по D-026. Применение использует updateRoomSearch: пересчитывает доступность/цены, сохраняет подходящий тариф и контакты, при отсутствии номеров показывает ошибку без изменения черновика. Закрытие возвращает к прежнему списку. Проверены открытие, изменение 7 ночей на 2 и обратно, пересчёт цены 94 430 → 26 980 → 94 430 ₽. 14 тестов номеров/поиска прошли.


23.10.2026, P-021: добавлены счёт и выезд. Домен `booking/stayBill.ts`, UI `booking/StayAccount.tsx` (не переименовывать в StayBill.tsx: конфликт регистра с доменом на macOS), стили `stay-bill.css`. Общая оплата атомарна, исходная операция проживания обновляется без дублирования; услуги сохраняют собственные операции/возвраты. Выезд — запрос гостя и отдельное подтверждение отеля, с проверкой долга/заявок/выполнения услуг. Завершение хранится в stay.status checked_out, финансовая операция confirmed; ключ/новые услуги недоступны, появляется invoice в документах. 145 тестов и браузерный сценарий оплаты/отказа/повтора/выезда/перезагрузки прошли. Статус и границы — ../docs/iteration-5/README.md. Далее проблема s6 и отзыв; не объявлять весь состав s2–s4 готовым, не возвращать чек D-031.


23.10.2026, D-041: ключ открывается сразу из openTripAction через openRoom + Toast, DigitalKeySheet удалён. Срок доступа из StayCard убран, доменные проверки срока сохранены. Поделиться/QR — ShareBookingPanel.tsx (UI) и bookingShare.ts (домен); не называть UI BookingShare.tsx из-за конфликта регистра на macOS. Просмотр по умолчанию, управление по уточнению пользователя даёт все функции владельца, включая ключ. canManageBooking / ownTrips / currentBooking учитывают принятых участников, исходная бронь и операции не копируются. Ссылки непрозрачные, реестр и участники локальны; для разных устройств нужна серверная часть. D-037 не отменяется, QR не является публичным обходом входа. 149 тестов и браузерная проверка; ../docs/iteration-5/qa-sharing/REPORT.md.


23.10.2026, D-042: по запросу пользователя состояния кнопки двери приведены к B1/F4 UI kit. Нажатие: общий scale .97 / 120 мс, тонированный фон и pressed-цвет; отпускание 240 мс arrive. После успешного открытия сама кнопка становится мятной #BFF0DE с зелёной галочкой #16865A и подписью «Дверь открыта»; галочка появляется за 380 мс, состояние держится 1,5 с, затем возвращается «Открыть дверь». Общий Button получил success, стили и длительность находятся в interactions. На время успеха повторное нажатие блокируется. Дублирующий Toast успеха убран; ошибка по-прежнему использует уведомление и не окрашивает кнопку в успех. Reduced motion сохранён. Проверены вид, размеры 54 px, блокировка/возврат в браузере; сборка и 28 protected-файлов прошли.


23.10.2026, D-043: по запросу пользователя кнопка ключа использует специализированный B3, уточняя D-041/D-042. Один тап запускает «Открываем…» с кобальтовым OrbitLoader на белом фоне на 1,1 с, затем мятное «Дверь открыта» на 3 с и возврат. Высота 52 px, r16. Это задержка локального ответа замка, не новое подтверждение и не реальный BLE. Во время ожидания/успеха повторное нажатие закрыто. При отказе — тост «Поднесите телефон к замку и попробуйте снова» и активная кнопка. Перед завершением повторно проверяются профиль, текущая бронь, права, событие заселения и срок ключа. Уход с экрана/смена профиля/брони отменяют незавершённое ожидание. Общие длительности — interactions.tsx, оформление/анимации — interactions.css; hooks/domain — useDoorAction.ts / doorAttempt.ts.

C5: общие строки k-list-row для профиля, услуг, заказов и редактора брони; строки документов приведены к той же геометрии с сохранением отдельного скачивания. Минимальная высота 68 px (может расти при длинном тексте), иконка 44 r15 / графика 22, текст 15/21 + 12/17, разделитель слева 72. Нажатие меняет фон на #F4F5FB за 120 мс, без уменьшения строки. ServiceTile используется для плиток до/во время/после проживания: белая поверхность r20, иконка на тонированной подложке 44 r15, подпись 13 px. Сетка экранов и размеры контейнеров сохранены. Выход из профиля использует красную иконку на мягкой красной подложке. Недоступный документ остаётся некликабельным. Не добавлять разделители в пожелания, отменённые пользователем ранее.

Проверки: 153 теста, сборка, 28 protected-файлов; браузер — ожидание/успех/ошибка ключа, профиль, услуги и документы. QA: docs/iteration-5/qa-b3-c5/REPORT.md из корня. Общий B1.success по-прежнему допускает 1,5 с в остальных сценариях; для ключа действует специальный B3.


23.10.2026, D-044: «Поделиться бронью» и QR-код — одна цельная кнопка, одинаковая до заезда и во время проживания. Общий ShareBookingButton: QR-иконка рядом с подписью, центрированная группа на единой светлой подложке #EEF0FF, кобальтовый текст, высота 44 px, r14. Отдельной кнопки QR и отдельной зоны справа нет; вся поверхность открывает существующее окно выбора доступа и QR-кода. Общие реакции Button сохранены.


23.10.2026, D-045: выбран второй вариант Product Design с уточнением пользователя: «Детали» и «Поделиться» в одной строке. Единый BookingCardActions до заезда и во время проживания: две равные колонки, gap8, высота48/r14, полупрозрачная белая подложка и белые иконки/текст на кобальтовой карточке. QR остаётся частью кнопки «Поделиться»; доступные имена полные — «Детали брони», «Поделиться бронью». Маршрут до заезда — отдельная белая кнопка выше. Это заменяет светлую полноширинную кнопку D-044 и текстовую ссылку деталей во время проживания.


23.10.2026: по уточнению пользователя на странице «Услуги отеля» убраны название отеля, даты поездки и общее пояснение «Возможность и стоимость раннего заезда подтвердит отель». Убрана оставшаяся нижняя отбивка заголовка. Визуальный ориентир — sv1 «Все услуги отеля · вся страница». Это очистка текста, не заявление о полном покрытии sv1; каталог доступных услуг и заказы сохранены.


23.10.2026, P-022: s6 — booking/StayProblemFlow.tsx, stayProblems.ts, stay-problems.css. Владелец и полный управляющий могут отправить обращение только после заселения; просмотр по ссылке прав не даёт. Статусы и фото локальные. Не добавлять SLA, компенсации или блокировку выезда без отдельного правила. Сохранять вход «Есть проблема» и историю в поездке.
23.10.2026, D-046: полный каталог sv1 — src/booking/HotelServices.tsx и hotelServiceCatalog.ts. Бесплатные услуги не требуют оплаты; платные связаны со счётом. Сохранять поиск, категории, активные/историю и композицию источника. Новые настройки P-023 не являются утверждёнными правилами отеля. Отправленные/принятые обращения о проблеме можно отменять. Модель депозита s5 ожидает ответа пользователя.
23.10.2026, D-047: депозит реализован в booking/deposit.ts и DepositTopUp.tsx, выбирается общим PaymentChoices. Услуги с известной ценой сразу открывают оплату через confirmPricedServices; ранний заезд остаётся с ответом отеля. Группа завтраков — ServiceGroupPayment/servicePayment.ts: единая атомарная оплата, отдельные дневные операции/возвраты. Не списывать пополнение из баллов и не считать его расходом на услуги; депозит тратится только при выборе гостем. Рабочие пределы/возврат остатка — P-024. Защищённый runtime не менялся.

23.10.2026, D-048: в интерфейсе услуг не показывать строки с условиями бесплатной отмены (детали, оплата, отмена заказа и группа завтраков). Правила возврата и суммы возврата/удержания сохранены; отмена проживания не меняется.

23.10.2026, D-049/P-025: в счёте одна кнопка «Пополнить депозит», бейдж баланса не интерактивен. Отзыв после выезда — app/src/booking/StayReviewFlow.tsx, stayReview.ts, stay-review.css (из app/: src/booking/); x2, сохранение в Booking.review. Оценка 1–5, до 1500 символов и пяти фото. Повторное открытие показывает отзыв; бонусы, чаевые и серверная публикация не реализованы.


23.10.2026, D-050: экран завершённой поездки приведён к s4: оригинальная орбита, карточка оценки со звёздами, три компактные плитки и повтор отеля. В орбите текущий кошелёк «Ключей», без начисления; средняя плитка — работающий счёт вместо отложенных приглашений. Чек и обещания бонусов не возвращать. Звезда передаёт оценку в x2. Документы открываются сразу, детали брони доступны внутри. Проверка: docs/iteration-5/qa-s4/REPORT.md.


23.10.2026, D-051: в s4 блок оценки перенесён внутрь главной карточки на место кнопки «Следующая поездка»; кнопка удалена. До отправки отзыва — приглашение и пять звёзд с переходом в x2 с выбранной оценкой. После отправки — компактная строка «Ваш отзыв», оценка и стрелка для просмотра. Отдельную карточку оценки под главным блоком не возвращать. Это уточнение D-050 по прямому запросу пользователя.


23.10.2026, D-052: отель оформляет выезд без предварительного запроса гостя. «Подготовиться к выезду» — необязательный сценарий. Подтверждение отеля переводит проживание в checked_out, закрывает ключ и открывает s4; отзыв по D-051. В демонстрационных инструментах «Оформить выезд в отеле» доступно без checkoutRequestedAt. Проверки дня выезда, счёта и услуг сохранены; реальная интеграция с отелем не подключена.


23.10.2026, D-053: в s4 добавлена фирменная анимация баллов по UI Kit 09: один проход точки по орбите с выходом на внешнее кольцо и рост счётчика за 1400 мс, orbit cubic-bezier(.65,0,.35,1). После появления движение прекращается. Общий PointsBalance и токены — interactions.tsx/css; исходная геометрия и палитра s4 сохранены. При reduced motion сразу виден итог без движения. Это визуализация текущего кошелька, не новое начисление за поездку.


23.10.2026, D-054: в завершённой поездке s4 вместо плитки «Счёт» — «Связаться с отелем» с переходом в чат выбранной брони. Плитка «Выгоды» удалена; «Документы» и связь с отелем расположены в две равные колонки. Это прямое уточнение пользователя к D-050 и исключение для s4 из прежнего сокращения точек входа в чат D-028.


23.10.2026, D-055: на странице «Найти» вместо раздела «Подборки», ссылки «Все» и карусели из трёх карточек — один широкий блок «Горячие скидки». Светлая карточка f1 с радиусом 28 px, Unbounded/Onest, исходной иллюстрацией collection-0 и кобальтовой кнопкой «Смотреть отели». Кнопка открывает существующую выдачу collection=discount (от 10%); остальные разделы страницы сохранены.


23.10.2026, D-056: пользователь выбрал второй показанный вариант «Горячих скидок» (exec-3e459dad-cb54-4423-a3e1-71faa5c16e4a.png). Реализована лавандовая карточка 361 × 140 px: орбита слева, заголовок в две строки, подпись, текст действия и круглая стрелка справа. Весь блок — одна кнопка, переход collection=discount сохранён. Иллюстрация отдельно подготовлена из выбранного изображения: app/public/brand/illustrations/hot-deals-orbit.png. Уточняет D-055.


23.10.2026, D-057: блок «Подбор по пожеланиям» перенесён с «Найти» на «Поездки». Показывается только если у пользователя нет подтверждённой незавершённой брони; текущие проживания также скрывают блок. Проверяется весь список доступных пользователю броней, не только выбранная. Завершённые и отменённые поездки не блокируют показ. Исходные дизайн/иллюстрация сохранены в общем PreferencePromo; кнопка открывает существующий подбор из пяти вопросов.


23.10.2026, D-058: в карточке места «Рядом с вами» добавлено изображение; действие «Маршрут от отеля» и вложенное окно пешего ориентира убраны. Единственная основная кнопка «Понятно» закрывает карточку, сохраняя выбранную категорию списка. Фотографии демонстрационные, источник и лицензия — app/public/assets/nearby/SOURCES.md.


23.10.2026, P-026: Wi-Fi — StayWifi.tsx / stay-wifi.css, U09 и wf1/wf1b/wf2. Демонстрационное ожидание 1200 мс задаётся общим interactionMotion.wifiConnectingMs. Закрытие отменяет ожидание; успех сохраняется в текущем сеансе, смена брони/события заселения/демочасов и перезагрузка сбрасывают его. В день выезда — сразу ручные реквизиты. Hotel_Guest / welcome2026 остаются вымышленными данными P-020. Копирование сети/пароля и инструкция работают; системные настройки и подключение ОС не выполняются. Рабочая реализация по плану, не новое коммерческое решение. Проверка: docs/iteration-5/qa-wifi/REPORT.md. Следующий ограниченный проход — чат отеля ch1/ch2.

При автофокусе Wi-Fi-шторки обработчик возвращает scrollTop оболочки device-screen к 0; внутреннюю прокрутку не менять. Защищённый runtime не редактировать.


26.10.2026, D-059: по запросу пользователя на шаге h5 «Данные бронирования» добавлен блок «Заезд и выезд» после сводки отеля. Каждое время открывает отдельную BottomSheet с вариантами отеля, доплатой и предпросмотром итога; применение сохраняет одну услугу каждого типа, стандартное время убирает её. Ранний заезд и поздний выезд исключены из общего списка дополнительных услуг, чтобы не дублировать управление. Использованы существующие демонстрационные настройки Mantera: с 10:00 за 2 500 ₽ и до 15:00 за 3 000 ₽, стандарт — с 15:00 / до 12:00. Эти суммы не являются новыми утверждёнными коммерческими правилами; у других отелей без настроенной услуги доступно стандартное время. Расчёт, баллы и оплата общие; выбранные часы используются в подтверждении, деталях, документах и проживании. Послеброневой запрос раннего заезда с подтверждением отеля не изменён.


26.10.2026, D-060: строка «Итого» на шаге данных бронирования и «Сейчас» на оплате стала кнопкой со стрелкой, открывающей BottomSheet «Расчёт стоимости». Показаны проживание за выбранное число ночей, выбранные услуги (включая ранний заезд/поздний выезд), скидка программы, применённые баллы каждого кошелька, итог и включённые налоги. При оплате в отеле дополнительно разделены «Сейчас» и «При заселении». Используется общий компонент Price и quoteDraft, новых финансовых правил нет. «Понятно» закрывает окно без изменения черновика. Высота нижней панели учитывает область нажатия 44 px.


26.10.2026, D-061: по просьбе пользователя изменён дизайн раскрытия итога D-060. Нижняя строка: нейтральная подпись «Итого» / «Сейчас к оплате», пояснение «Расчёт стоимости», сумма и круглая лавандовая кнопка со стрелкой вверх; вся строка интерактивна. В шторке убрана внешняя карточка с рамкой, строки стоимости свободно расположены на белом фоне, уменьшения суммы выделены зелёным, итог и включённые налоги объединены в лавандовом блоке. Кнопка «Понятно» и финансовая логика сохранены. Изменение реализовано в BookingFlow.tsx и booking.css; вариант оформления Price detailed применяется только в шторке.


26.10.2026, уточнение D-061: цвет блока «Итого к оплате» в шторке приведён к принятой палитре. Произвольный #F0EFFF заменён на var(--k-surface-app) / #F4F5FB по нейтральной информационной подложке h2; основной текст явно var(--k-text-primary) / #101320, подпись налогов var(--k-text-secondary) / #5A6072. Компонент не интерактивен, поэтому цвет действия для него не используется. Композиция и расчёты сохранены. В браузере проверены computed styles и снимок docs/iteration-4/qa-booking-total/brand-colors.png; проверка runtime прошла.


26.10.2026, D-062: экран «Бронь подтверждена» дополнен блоком «Добавленные услуги» между деталями и оплатой. ConfirmationServices читает услуги из сохранённого booking.draft, показывает названия и стоимость по демокаталогу; для заезда/выезда — время, для завтрака — число дней и гостей. Завтрак, включённый в тариф, повторно как допуслуга не показывается. Без выбранных услуг блок скрыт. Карточка, типографика и цвета соответствуют текущему подтверждению; расчёт и списания не менялись.


26.10.2026, D-063: в день выезда вместо «Подготовиться к выезду» показывается компактное неинтерактивное напоминание «Перед выездом» о вещах, сейфе, документах и зарядных устройствах. Из счёта удалены «Готов к выезду», запрос гостя и связанные сообщения ожидания/подготовки. Оплата счёта и депозит сохранены. Завершение поездки — событие отеля без запроса гостя; после него ключ закрывается и показывается завершённая поездка. Уточняет D-052: отдельного гостевого сценария подготовки больше нет. Старый requestCheckout остаётся только в доменном коде для совместимости, из интерфейса не вызывается.


26.10.2026, D-064: пользователь выбрала третий вариант блока «Перед выездом» (exec-866afafe-cbfc-4ea0-9843-dada604e439f.png). CheckoutReminder: белая карточка радиусом 22 px, заголовок Unbounded, подсказка «Загляните в сейф и проверьте номер», три неинтерактивных пункта с кобальтовыми иконками — «Документы», «Вещи», «Зарядки». Паспорт и багаж из существующей системы; вилка Lucide с лицензией и толщиной 1.5. Условия показа D-063 сохранены, кнопок и запроса выезда нет.


26.10.2026, D-065: по запросу пользователя убраны депозит, его пополнение и выбор источником оплаты. Исторические операции/возвраты сохранены в домене. Блок «Счёт» удалён с поездки; вход «Счёт проживания» доступен в деталях только при наличии проживания и подтверждённой брони (включая завершённое). Назад из счёта возвращает в детали. Услуги: единый ServiceStatus с янтарным «Ожидает оплаты» и зелёным «Оплачено», в том числе в списках и деталях. На странице завтрака сводка заказов, статус и кнопки объединены в фиксированной панели по образцу итога бронирования; раскрытие показывает каждый заказ. «Добавить ещё» создаёт отдельный заказ, можно на ту же дату, включая дополнительный завтрак к включённому тарифу; исходный заказ и его оплата не меняются. В каталоге повторяемые услуги тоже разрешают новый заказ в тот же день; ранний/поздний выезд сохраняют ограничения единственного изменения времени. Сумма и действие оплаты отдельных услуг/групп завтраков объединены в нижней панели. Бесплатные услуги не помечаются оплаченными. Даты, права, возвраты, баллы и идемпотентность сохранены.


26.10.2026, D-066: по уточнению пользователя нижняя панель завтрака сокращена с 198 до 132 px: название услуги, статус оплаты и стрелка просмотра в одной строке; количество заказов и общая оплаченная сумма скрыты в деталях. Ниже — «Добавить ещё», при долге — действие оплаты с суммой. Один заказ открывается сразу, несколько — списком с отдельными статусами. Закрытие просмотра возвращает к странице завтрака; завершение нового заказа/оплаты сохраняет переход к поездкам. Onest, существующие семантические цвета и общие компоненты сохранены.


26.10.2026, D-067: по запросу пользователя из окон оплаты отдельной услуги и группы завтраков убран блок списания баллов; UI рассчитывает эти платежи с usePoints=false. Оформление проживания и история старых операций не изменены. «Даты завтраков» скрыты на шаге оплаты группы, но доступны в деталях оплаченной группы. Проверка выполнена на изолированном наборе без записи в пользовательское хранилище; сборка/runtime прошли.


26.10.2026, D-068: в инструментах демонстрации добавлена отдельная кнопка «Сбросить все услуги» с подтверждением. resetDemoServices очищает serviceRequests во всех локальных поездках и связанные отдельные платёжные операции, восстанавливает ранее списанные и ещё не возвращённые баллы. Брони, профиль, проживание и услуги в составе исходной брони сохраняются. Пустое состояние отключает кнопку; повторный сброс не меняет баланс. Это инструмент демонстрации, не отмена по правилам отеля и не реальный возврат. Проверены три доменных сценария, сборка/runtime и окно подтверждения/отмена в браузере; текущие пользовательские услуги при проверке не сбрасывались.


26.10.2026, D-069: SMS-код вводится в шесть отдельных KeyboardInput (SmsCodeField.tsx), в существующем стиле полей с нейтральным фокусом. Ввод цифры переводит фокус вперёд; Backspace очищает текущую ячейку, в пустой — предыдущую; стрелки перемещают фокус. Вставка/автозаполнение шести цифр заполняет весь код. Пустая ячейка в середине не сдвигает остальные цифры; подтверждение доступно только для шести цифр. Доступные названия «Цифра N из 6», общий текст ошибки. Правила проверки кода и повторной отправки сохранены. Проверены внешний вид, массовый ввод, удаление и доступность кнопки в браузере; вход пользователя при проверке не выполнялся.


26.10.2026, D-070: после ввода шестой цифры SMS-код проверяется автоматически через verifyCode. При успехе ячейки получают фирменное зелёное состояние, появляется «Код верный», клавиатура скрывается; через общий interactionMotion.successHoldMs (1500 мс) открывается имя нового гостя или сохранённый маршрут существующего. Кнопка подтверждения убрана. Неверный/истёкший код оставляет пользователя на вводе с ошибкой. Таймер отменяется при смене кода, запроса, маршрута и размонтировании; до окончания успешного состояния авторизация не записывается. Проверен автоматический переход нового гостя в браузере; сборка/runtime прошли.


26.10.2026, уточнение D-070: успешный SMS-код приведён к конкретному компоненту I3 «Код из SMS» исходного UI Kit. Ячейки 56 px, r14, рамка 1.5 px, цифры Unbounded 22/28. Успех: фон #BFF0DE, рамка и текст var(--k-status-success) / #16865A; сообщение с исходной галочкой того же цвета. Убраны прежний #11734D и рамка в цвет фона. Автопереход и его тайминг сохранены. Состояние проверено в браузере на изолированном экране; runtime проверен.


26.10.2026, D-071: по просьбе пользователя подтверждение SMS-кода смягчено кривой «Орбита» var(--k-ease-orbit) / cubic-bezier(.65,0,.35,1). Цвет фона, рамки и цифр меняется за общий base 400 мс; сообщение и галочка появляются через opacity и сдвиг 8 px без пружинного увеличения. Формы кода и имени используют тот же общий эффект появления в interactions.css; при reduced motion движение отключено. Тайминг автоперехода 1500 мс сохранён. На шаге имени удалено пояснение «Так к вам будут обращаться в отеле». Экран проверен в браузере; сборка/runtime пройдены.


26.10.2026, P-027: плановый проход чата ch1/ch2. TripChat.tsx / trip-chat.css сохраняют композицию «Все экраны»: белые сообщения ассистента, кобальтовые гостя, компактная капсула ввода, быстрые вопросы. Лейбл ИИ сохранён, номер и даты брони в шапку не возвращаются. chatAssistant.ts даёт локальные сценарные ответы по выбранной брони, без внешней модели или доставки в отель; заказ открывается отдельным действием и не создаётся текстом сообщения. Индикатор набора — общий chatReplyMs 1200 мс, появление — Orbit/base, reduced motion отключает движение. История раздельна по bookingId, черновик — по actor/bookingId; владелец и участник полного управления имеют доступ. Ответ идемпотентен, закрытие отменяет таймер, возврат продолжает ожидающий ответ. Старые сообщения не запускают ответы задним числом. Список показывает последнее сообщение/время и сортируется по активности. Это рабочая реализация согласованного демонстрационного объёма, не новое коммерческое правило. Поиск диалогов, непрочитанное, чат без брони C03 и симуляция подключения сотрудника пока не реализованы. Проверки: docs/iteration-5/qa-chat/REPORT.md. Следующий проход — сквозная сверка итераций 4–5.


26.10.2026, D-072: быстрый вопрос (тег-пресет) в чате сразу отправляет своё сообщение одним нажатием и запускает ответ ассистента. Дополнительное нажатие «Отправить» не требуется. Собственный черновик в поле ввода при выборе пресета сохраняется. Используется общий sendTripMessage и очередь ответов; внешний вид и анимации не менялись. Проверено в браузере на пресете «Как добраться?», сборка/runtime прошли.


26.10.2026, D-073: по просьбе пользователя напоминание «Перед выездом» переделано в компактный информационный блок. Вместо трёх крупных пиктограмм — одна исходная info.svg 20 px, заголовок Onest 15/21 и текст 13/19 «Проверьте сейф, заберите документы, вещи и зарядки». Подложка #EEF0FF из токена action-tint, радиус 16 px, без кнопок, ссылок и реакции на нажатие. Условия показа дня выезда и завершение отелем сохранены. Уточняет выбранный ранее D-064. Проверено в браузере на изолированном сценарии без изменения пользовательских броней; снимок docs/iteration-5/qa-checkout-notice/notice.png.


26.10.2026, P-029: начат первый проход итерации 6. Персональный подбор вынесен из старой шторки в #preferences: nc2/nc3 (направление/компания), nc6/nc7 (темы/интересы), результат по r1 с проверяемыми совпадениями. Черновик по владельцу, бюджет в копейках, даты/гости и сортировка сохраняются отдельно от обычного поиска; возврат из отеля после reload восстанавливает подбор. Компания не подменяет гостей бронирования. Свойства для объяснений берутся из демокаталога и сохраняются снимком в черновике отеля. Избранное и w1 используют общие данные. Лента идей, свободный текст, районы, подборки/заметки избранного — следующие проходы. Это рабочая реализация, не новые бизнес-правила. 183 теста, сборка/runtime и браузерный путь прошли. Статус/границы: docs/iteration-6/README.md; снимки: docs/iteration-6/qa-preferences/REPORT.md.


26.10.2026, P-030: выполнен ограниченный проход F10/F11 — списки избранного и заметки, fv1/fv2/fv2a/fv4/fv6. Код app/src/booking/favorites.ts, FavoritesScreen.tsx, FavoriteSaving.tsx, favorites.css. Старые savedHotels доступны в «Без списка», принадлежность спискам/заметки/даты/гости хранятся по владельцу. Первое сохранение в сессии предлагает список, следующие используют его; создание списка из шапки также выбирает контекст. Параметры списка независимы от обычного поиска, цена через quoteDraft, недоступный отель остаётся видимым. В бронь переносится поиск списка и постоянный возврат favorite-list/favoriteListId. Заметка до 1000 символов; перенос сохраняет её. Удаление списка переносит отели в «Без списка», удаление отеля не влияет на брони/платежи. Общие BottomSheet/Carousel и реакции C5 (k-surface-action в interactions.css без навязывания геометрии строки). Публичный шаринг списков и быстрый перенос из уведомления пока не реализованы. Это рабочая реализация по плану, не новое решение пользователя. 191 тест, build/runtime и браузер iPhone/Pixel прошли. Отчёт: docs/iteration-6/qa-favorites/REPORT.md. Далее — Q04/Q06, лента идей и свободное пожелание.


26.10.2026, D-074: по запросу пользователя в подборке избранного верхнее меню с тремя точками заменено кнопкой карты. #favorite-map использует только favoriteOffers выбранного списка, включая недоступные отели; метки переключают карточку, переход в отель и возврат сохраняют контекст списка/карты. Карта демонстрационная, в стиле существующего c2, без реальных геокоординат/API. Раскрытие/закрытие через общий ExpandingMap и reduced motion. Кнопки «Назад» и «Новый список» выровнены, обе высотой 44 px. В карточках вместо цены недоступного отеля — нейтральный лейбл «Нет номеров»; подпись «Изменить даты» и три точки под ценой убраны. Старые меню подборки/карточки удалены из интерфейса; заметки и удаление сердцем остаются. Операции переименования/переноса/удаления списка в слое данных сохранены, но прежних точек входа в UI больше нет. Это уточняет P-030. Проверены браузером карта, пустая подборка, доступный/недоступный отель, возврат после reload и выравнивание шапки; 8 целевых тестов и build/runtime прошли. Отчёт: docs/iteration-6/qa-favorites-map/REPORT.md.


27.10.2026, уточнение P-032: по просьбе пользователя блок «Опишите свой отдых» расположен последним на странице «Найти», после просмотренных отелей (если они есть). Переход и внешний вид сохранены. Расположение над нижней навигацией проверено в браузере; runtime integrity — 28 файлов.


27.10.2026: по прямому уточнению пользователя в шапке поискового блока f1 используется одна подпись «Лучшие цены напрямую от отелей» вместо «Знаете, куда едете» и бейджа «Цены напрямую». Проверено в браузере.


27.10.2026: по запросу пользователя сердечко в «Подборе по свайпу» — одноразовое действие лайка: saveSwipeLike автоматически сохраняет отель в «Подбор по свайпу» и открывает следующий. Нет выбора списка, тостов и aria-pressed/состояния сохранённого сердца. Кнопка постоянно #2F5BFF со свечением, белый контур без заливки. Крестик пропускает отель, не удаляя прежнее сохранение. Повторный лайк идемпотентен. Существующая одноимённая подборка используется повторно; по действующей модели одного списка сохранённый ранее отель переносится с заметкой. Обычные сердечки вне этого флоу не менялись. Проверены 11 целевых тестов, браузерный лайк/пропуск/повтор, отсутствие диалогов и сохранение после reload; сборка/runtime прошли.


27.10.2026: по запросу пользователя переход в «Подборе по свайпу» выполнен в механике Tinder: лайк уводит текущую карточку вправо, отказ — влево, с наклоном 18° и раскрытием следующей карточки из стопки. Общие SwipeCardTransition/SwipeStackPreview в interactions.tsx используют pop 380 мс и Orbit; reduced motion — opacity 200 мс. Следующий индекс меняется после завершения анимации; повторные действия на переходе блокируются ref/inert, визуальный вид синего сердца сохраняется. Существующий жест вверх по описанию вызывает тот же переход отказа; горизонтальное листание фотографий остаётся Carousel. Проверены в браузере оба направления (transform по кадрам), наклон, снятие блокировки и последовательность отелей. Реальные горизонтальные жесты лайка/отказа в этом изменении не добавлялись.


27.10.2026: в подборе по свайпу нажатие на правую половину фото/видео переключает галерею вперёд, на левую — назад. Общая SwipeGallery внутри Carousel сохраняет горизонтальное перетаскивание и подавление клика после жеста; границы не переводят к другому отелю. Переход 200 мс с общей кривой Orbit, reduced motion — сразу. При смене отеля галерея начинается с первого кадра. Компонент поддерживает mp4/webm; в текущем демокаталоге только фотографии. В браузере проверены оба направления, последний кадр и сброс при переходе к следующему отелю; ошибок консоли нет, build и runtime (28 файлов) прошли.


27.10.2026: исправлен свайп вверх в подборе отелей. Ранее обработчик был только на описании; теперь SwipeCardTransition принимает вертикальный жест по всей карточке, включая фото/видео. Pointer Events с захватом вертикального указателя, фиксацией оси и подавлением клика после вертикального перетаскивания; горизонтальный жест остаётся в Carousel. Порог перехода 56 px либо быстрый жест от 24 px; вниз и короткое движение не переключают отель. Кнопки назад/«Ещё» остаются самостоятельными. Подпись «Смахните вверх — следующий отель». Проверены настоящими браузерными drag-жестами фото → следующий отель, описание → следующий отель, горизонтальная галерея и клик назад по кадрам. Сборка и проверка 28 файлов runtime прошли.

27.10.2026, P-033: профиль → «Следим за ценами» (#price-watches), PriceWatches.tsx / price-watches.css. Общий PriceWatchEditor в HotelSheets.tsx сохраняет w1. priceWatch.ts восстанавливает параметры из прежних ключей, изолирует владельца, управляет паузой/удалением и создаёт черновик с returnTo=price-watches без изменения обычного поиска. Недоступные даты/номер/FR показываются явно, их нельзя возобновить или открыть для брони. Редактирование не возобновляет паузу. Данные избранного/броней не меняются. 212 тестов, build/runtime и браузерные сценарии iPhone/Pixel прошли. Локальные ценовые события, внутренняя лента уведомлений и выбор номера внутри w1 ещё не реализованы; push только предпочтение. Отчёт: ../docs/iteration-6/qa-price-watches/REPORT.md.


27.10.2026, уточнение P-033: по запросу пользователя карточка наблюдения сокращена до фото, названия, номера, цены и тумблера. Удаление — иконка trash 44 px с прежним подтверждением. Настройки открываются по цене. При изменении показаны старая зачёркнутая и новая цена; снижение зелёным, рост основным цветом. Исходная цена сравнения сохраняется при редактировании. В push w1 убран двойной сдвиг left + transform: бегунок 24 px, трек 50×30, отступ 3 px, ход 20 px; строка нажатия 44 px. Браузером проверены push в обоих состояниях, карточка, удаление и пауза; 10 целевых тестов, сборка/runtime прошли. Снимки: docs/iteration-6/qa-price-watches/compact-list.png и push-fixed.png.


27.10.2026: восстановлен прежний вид блока «Цена для вас» в отеле. Причина регрессии — общий класс watch-price у ссылки отеля и цены карточки наблюдения. Новый список использует изолированный watch-card-price; исходная строка отеля снова горизонтальная. Боттомшиты и их содержимое не изменены. Проверено в браузере.


27.10.2026: по просьбе пользователя добавлен визуальный пример снижения на 5 500 ₽ в списке отслеживания. Кнопка в инструментах демонстрации включает/выключает предпросмотр для доступных наблюдений с ценой выше суммы снижения. В карточках прежняя цена зачёркнута, новая зелёная. Это только пример отображения: Commerce/тарифы/брони не меняются, открытие отеля или настроек завершает предпросмотр; после reload он выключен. В браузере показаны 26 980 → 21 480 ₽ и 33 800 → 28 300 ₽. Генератор реальных локальных ценовых событий ещё не реализован.


27.10.2026: к изменившейся цене добавлен компактный лейбл точной разницы: ↓ сумма на мятной подложке при снижении, ↑ сумма на нейтральной при росте. Прежняя цена зачёркнута, снижение зелёное, выросшая цена основным цветом. В инструментах демонстрации доступны снижение, рост и сравнение рядом (±5 500 ₽), без изменения Commerce и расчётов брони. В браузере показаны одновременно Mantera 26 980 → 21 480 ₽ и Маяк 33 800 → 39 300 ₽.


27.10.2026, P-034: w1 поддерживает выбор номера/тарифа с заменой наблюдения. priceEvents.ts и PriceNotifications.tsx связывают локальное изменение цены с общим quoteDraft и историей уведомлений. Рост/пауза не уведомляют, целевая цена реагирует на пересечение порога. Подтверждённые брони не пересчитываются. Реальных push/мониторинга нет. 224 теста, build/runtime и браузер iPhone/Pixel; docs/iteration-6/qa-price-events/REPORT.md. Далее — персональный порядок подбора по свайпу.


27.10.2026, D-075: после оформления брони ранний заезд и поздний выезд добавляются сразу, без оплаты и подтверждения отеля.
Пользователь подтвердила оплату позже в отеле: confirmed + settlement=at_hotel, начисление в stayBill, без платежа и баллов.
Общая логика stayTimeServices.ts, шторка EarlyArrival.tsx. Недоступные входы скрыты в поездке и каталоге.
Время меняется сразу; ключ появляется только после заселения. Первоначальное оформление D-059 не менялось.
231 тест, build/runtime и браузер; docs/iteration-5/qa-stay-time-services/REPORT.md.
# 27.10.2026 · D-076
Общий StatusBadge в src/ui.tsx и status-badge.css; услуги используют ServiceStatus и serviceStatusPresentation. Лейбл и иконка не переносятся. Ранний заезд/поздний выезд: «Оплата в отеле» → «Оплачено», без «Выполнено»; внутреннее завершение сохранено. Не применять flex-direction:column к корню лейбла в общих селекторах строк. Общий стиль действует внутри .keys-app и .bottom-sheet. Состояния ключа/SMS/Wi-Fi не заменять лейблами заказа.
27.10.2026 · D-077: EarlyArrival сразу передаёт добавленный заказ в onOrder, не рисуя промежуточную шторку. В HotelServices нет поля поиска, сохранена фильтрация категориями. Выбор времени новой услуги и финансовые расчёты не изменены.
27.10.2026 · D-078: UpcomingTrip показывает для добавленного раннего/позднего времени «Добавлено». ServiceOrderSheet называет окно услугой; платёжная подпись находится в footer рядом с ценой: ранний — при заселении в отеле, поздний — при выезде на ресепшен. Оплаченные заказы не получают подсказку о будущей оплате; отменённые/отклонённые не помечаются добавленными.

27.10.2026 · Уточнение D-078: рядом с ценой раннего/позднего времени оставлять только «Оплата при заселении» / «Оплата при выезде». Уточнения «В отеле» и «На ресепшен» удалены по запросу пользователя.

27.10.2026 · Уточнение D-076/D-078: успешные статусы «Добавлено» и «Заказано» — tone=success, мятная подложка, зелёный текст и галочка. Не использовать для них информационный кобальтовый стиль.
27.10.2026 · D-079: src/booking/serviceLifecycle.ts — общее определение времени/доступности отмены. ServiceOrderSheet и cancelPaidService используют serviceCancellationAvailability. Будущие услуги времени со старым completed не теряют отмену; фактическое заселение/начало/выезд учитываются по stayNow. Не писать отдельные проверки допустимых статусов для кнопки отмены. Просмотр группы завтраков даёт доступ к отдельным заказам.

27.10.2026 · D-080: после добавления раннего заезда или позднего выезда окно выбора времени закрывается, общий Toast сообщает «Услуга добавлена в бронь». Детали заказа автоматически не открываются; ручной вход «Подробнее» сохранён. EarlyArrival разделяет onAdded и onOrder. Одинаковое поведение из «Поездок» и «Все услуги». Проверено в браузере на обоих входах, сборка и контроль 28 защищённых файлов прошли.

27.10.2026 · Уточнение D-080: после успешной отмены услуги ServiceOrderSheet закрывается и общий Toast показывает «Услуга отменена», без возврата к деталям заказа. Применяется ко всем услугам, включая ранний заезд, поздний выезд и отдельные завтраки. Подтверждение отмены с суммой возврата сохранено; при ошибке окно остаётся открытым без хинта успеха. Проверено в браузере: поздний выезд из поездки и оплаченный завтрак из каталога; сборка/runtime прошли.

27.10.2026 · D-081: по запросу пользователя шапки страниц больше не закреплены при прокрутке. Заголовки, кнопки назад и фильтры выдачи находятся внутри MobileScroll вместе с содержимым; это заменяет прежнее закрепление D-017/D-020. Применено к основным разделам, профилю, избранному, поиску, бронированию, деталям/документам, услугам, чату, отзыву и обращениям. Нижняя навигация и панели действий сохранены. Защищённый mobile runtime не менялся. Для экранов FlowStack с прокручиваемой шапкой headerHeight=0, класс page-scroll резервирует только верхнюю безопасную область устройства. Проверены iPhone: поездка, детали, выдача, номера, оформление; Pixel: оформление, услуги, избранное. Сборка и проверка 28 защищённых файлов прошли.

27.10.2026 · D-082: из шапки чата с отелем удалена правая иконка chat-hotel. Под именем отеля сохранена метка ИИ-ассистента и добавлена строка среднего времени ответа. Для демонстрации используется 5 минут (рабочее значение, не статистика реального отеля и не SLA). Шапка выровнена влево, остаётся прокручиваемой по D-081. Проверены браузер и сборка/runtime.

27.10.2026 · Уточнение D-082: пользователь выбрала вариант 1 шапки чата (exec-b2fc7abe-9290-415c-9eaa-266430dfb603.png). Название отеля и одна строка «ИИ-ассистент | Ответ отеля ≈ 5 мин», метка ИИ кобальтовая, время серое, тонкий разделитель. Круглая кнопка назад слева, справа нет иконок. Шапка прокручивается. Время ответа — демонстрационное. Проверены вид, отсутствие переноса строки, назад, консоль и build/runtime.

27.10.2026 · Уточнение D-081/D-082: по прямому запросу пользователя только в чате с отелем шапка с кнопкой «Назад» закреплена при прокрутке. Использован штатный header FlowStack высотой 80 px с безопасной областью; сообщения прокручиваются отдельно. Утверждённый вариант 1 шапки сохранён. Проверены прокрутка вверх/вниз и возврат на «Поездки» в браузере; production-сборка прошла.

27.10.2026 · P-035: персональный порядок F07 реализован в swipeDiscovery.ts. Реакции и прогресс изолированы по владельцу в Commerce.swipeHistories; следующий отель учитывает сходство известных стилей и удобств с лайками/пропусками. Это локальное рабочее ранжирование, не внешний ИИ. Лайк сохраняет в прежнюю подборку без шторок/тостов, пропуск не удаляет избранное. В одном проходе отели не повторяются; в конце — переход к подборке и явный повтор. Общие ограничения discoveryOffers обязательны. Даты/гости/фильтры сбрасывают проход, сохраняя реакции; текущая карточка и возврат из отеля переживают reload. Внешний вид и движения F07 сохранены. Далее — районы и резюме nc9–nc11; итерация 6 не закрыта.

27.10.2026 · D-083: по запросу пользователя в инструментах прототипа появился открытый раздел «Сценарии поездки» с пятью готовыми состояниями: «Брони ещё нет», «До заезда», «Во время проживания», «День выезда», «После выезда». Любое состояние запускается одним кликом в любом порядке и открывает «Поездки». Тестовая бронь Mantera 13–15 ноября, оплата СБП, услуги не добавлены, отзыв ещё не оставлен. Используются реальные локальные функции создания брони, заселения и выезда; ключ только in_house. Эти настройки не меняют коммерческие правила.

Примеры изолированы от прежнего Commerce: demoTripSession сохраняет единственный исходный снимок, «Вернуться к своим данным» восстанавливает его. Переключение создаёт новый пример, не накапливает брони/копии. Состояние и исходный снимок переживают reload; профиль авторизации не подменяется. До входа кнопки недоступны. Закрываются открытые шторки, старые ошибки и ожидания действий не переносятся в новую поездку. UI — TripScenarioControls.tsx, домен — demoTripScenarios.ts. Проверка: 248 тестов, build/runtime (28 файлов), браузер iPhone/Pixel, все пять состояний, открытие двери, обратное переключение, reload и точное восстановление. Отчёт: docs/iteration-5/qa-trip-scenarios/REPORT.md.

27.10.2026 · D-084: по запросу пользователя «Подбор по пожеланиям» убран со страницы «Поездки» (уточняет D-057). Когда доступных броней нет, под пустым состоянием временно стоят оба баннера «Двойная выгода» — показанные варианты 1 и 2, сверху вниз. Пользователь пока сравнивает их в интерфейсе, окончательный вариант не выбран. BenefitsBannerComparison использует исходные изображения в app/public/design-previews как визуальные превью, каждый баннер — одна доступная кнопка с переходом #rewards; это не финальная компонентная реализация. При наличии брони баннеры не показываются. Опрос по #preferences сохранён, новый вход вместо удалённого промоблока не добавлялся. Сопоставление изображений — design/double-benefits-variants/options.json. Проверены оба перехода, прокрутка и отсутствие ошибок консоли; build/runtime прошли.

27.10.2026 · Уточнение D-084: пользователь выбрала первый вариант баннера «Двойная выгода» (exec-8060904e-81f3-4399-887b-38960395acb7.png). Второй убран из интерфейса. Под пустым состоянием поездок остаётся один баннер с переходом #rewards; исходный выбранный вид сохранён. Реализация пока использует изображение с доступным именем кнопки, а не отдельные текстовые элементы.


27.10.2026 · D-085: первый вход в «Подбор по свайпу» открывает «Какой отдых вы ищете?» по пользовательскому референсу keys-mobile-new (scenario=search-swipe-first). Десять круглых вариантов с множественным выбором, орбитальные линии, Onest/Unbounded и кобальт текущей системы. Можно продолжить без выбора. Черновик и завершение сохраняются по владельцу в Commerce.swipePreferences; назад не завершает шаг, после продолжения повторного показа нет. Рабочее локальное ранжирование по известным свойствам демокаталога повышает релевантные отели, не меняя поиск, доступность, цены и лайки. UI — SwipeWelcome.tsx, домен — swipePreferences.ts. Общие motion-токены и orbit-enter, reduced motion поддержан. Сценарий «Брони ещё нет» позволяет повторно посмотреть первый вход. iPhone/Pixel, 250 тестов и build/runtime проверены. Отчёт: docs/iteration-6/qa-swipe-welcome/REPORT.md.


27.10.2026 · Уточнение D-085: все десять тем первого входа в свайп помещаются на одном экране iPhone/Pixel без прокрутки: круги 108 px, ряды 3–2–3–2. При выборе и снятии выбора общий WaterRippleButton (interactions.tsx/css) запускает две затухающие наружные волны: токен slow 700 мс, задержка instant 120 мс, Orbit; лёгкое сжатие на нажатие. Волны не перехватывают касания, повторный клик перезапускает эффект, reduced motion скрывает волны и сжатие. Логика предпочтений сохранена. Проверены оба устройства, повторное нажатие и затухание; production build/runtime прошли.


27.10.2026 · Уточнение D-085: по запросу пользователя круги первого входа переработаны в светлые объёмные поверхности с тонким ободком, мягкой лавандовой заливкой и кобальтовыми иконками в круглых подложках; исходные SVG UI kit сохранены. Выбор — кобальтовая поверхность с галочкой. Сетка 3–2–3–2 и все десять тем на одном экране сохранены. Общий BubbleOrbit в interactions.tsx: последовательное появление пузырьков (520 мс, шаг 45 мс, arrive), после CTA — сжатие и вращение 160° за 1100 мс с Orbit, контрвращение содержимого. Переход к отелям вызывается только по завершению анимации, один раз; во время неё выбор/назад/CTA недоступны. При reduced motion — только opacity 200 мс. WaterRippleButton сохранён. Проверены iPhone/Pixel, вход, выбор, переход с выбором/без него, консоль, build/runtime.


27.10.2026 · D-086: в ленте свайпа добавлена иконка preferences справа сверху, также доступная в конце ленты и при пустой выдаче. Открывает существующий экран «Какой отдых вы ищете?» с сохранённым выбором. Редактирование локальным черновиком: «Назад к отелям» отменяет изменения, «Перейти к отелям» после орбитальной анимации применяет их и возвращает в ленту. applySwipePreferences пересчитывает порядок непросмотренных отелей при изменении тем, сохраняя seen, реакции и избранное; старый callback карточки инвалидируется turn. Без изменений история сохраняется. Во время перелистывания настройки заблокированы. Проверено в браузере: вход, предзаполнение, отмена черновика, сохранение/повторный вход и возврат; 12 тестов свайпа и build/runtime прошли.


27.10.2026 · D-087: весь баннер «Подбор по свайпу» на «Найти» — одна нативная кнопка; «Начать» внутри только визуальный CTA без вложенной кнопки. В ленте постоянная шапка над карточкой: назад 44 px, заголовок «Отели свайпом» с датами commerce.search, настройки 44 px в одной строке. Даты читаются общим dateLabel. Индикаторы галереи и сама фотография ниже шапки; прежние кнопки поверх фото удалены. Шапка общая и для пустого/завершённого подбора. Проверены браузером iPhone/Pixel: клик по центру баннера, переход, смена фото/счётчик, настройки/назад; production build и runtime прошли.


27.10.2026 · Уточнение D-087: фон шапки ленты «Отели свайпом» тёмный #0D0F17, единый с нижней частью экрана. Заголовок и иконки белые, даты светло-серые, кнопки на полупрозрачной подложке. Системная строка устройства не менялась. Проверены браузер и build/runtime.


27.10.2026 · Уточнение D-087: системная строка телефона в ленте свайпа тоже тёмная (#0D0F17), часы и штатные индикаторы светлые. Оформление ограничено наличием .swipe-browser; в предпочтениях и других светлых экранах автоматически возвращается исходная тема. Изменения только в app/src/booking/search.css, защищённые компоненты/ассеты и геометрия runtime сохранены. Проверены контраст и обратный переход в браузере, build/runtime прошли.

27.10.2026 · D-088: фильтры выдачи — полный мобильный диалог с локальным черновиком (Filters.tsx), все группы DOCX, цена за период/ночь, ручные поля/бегунки, счётчики. SearchFilterRail общий для списка и карты, сортировки/районы — BottomSheet. filterSchema.ts нормализует теги/старые сортировки, цену и снимки истории; searchFacets.ts связывает характеристики отеля/номера/тарифа, offers.ts рассчитывает выдачу через общий booking engine. Новые восемь вымышленных объектов находятся в Казани (все типы), данные в ../spec/search-facets.json и demo-data.json. Не вводить условные надбавки другого прототипа. Новый возраст ребёнка -1, до явного выбора нельзя сохранить; максимум 6 взрослых / 4 ребёнка. Автомобиль и командировка не фильтруют сами. Полноэкранный портал ниже клавиатуры (z22), CTA учитывает Android safe area; общий reveal-focus в Prototype уважает scroll-padding-top. Runtime не изменён. Отчёт ../docs/iteration-4/qa-search-filters/REPORT.md.

27.10.2026 · Уточнение D-088: переключатель «За ночь» перенесён в правую часть строки заголовка цены вместо стрелки сворачивания. Цена всегда раскрыта; отдельная строка настройки убрана. Компактный Switch 36×22 px, область нажатия строки 44 px, общая анимация переключателя и reduced motion. Пересчёт диапазона не менялся. Проверено в браузере, сборка/runtime прошли.

27.10.2026 · Уточнение D-088: в «Бонусы и скидки» добавлен «Эксклюзивно только в Ключах» с контурным огоньком flame (24 px, stroke 1.5, currentColor). Иконка сохраняется в выбранном чипе выдачи/карты. Признак независим от скидки, внутри группы действует OR. Для проверки отмечены два вымышленных объекта Казани: «Апарт-отель Площадь» и «Дом у леса»; это тестовые данные. Браузер, 12 тестов фильтров и build/runtime прошли.

27.10.2026 · Уточнение D-088: видимое название эксклюзивности — «Только в Ключах», огонь — эмоджи 🔥. В фильтрах справа отдельная кнопка info раскрывает краткое пояснение под параметром и не меняет его выбор; кнопки соседние, без вложенности. Сохранённый ключ «Эксклюзивно только в Ключах» оставлен для совместимости истории и данных. В чипе выдачи также короткое имя и эмоджи. Проверены независимость подсказки/выбора, 8 → 2 результата, закрытие пояснения и build/runtime.

27.10.2026 · Уточнение D-088: кнопка info у «Только в Ключах» открывает общий BottomSheet поверх фильтров вместо встроенного пояснения. В шторке заголовок, краткий текст и кнопка «Понятно». Закрытие сохраняет черновик фильтров; проверено в браузере на выбранном параметре (два результата). Build/runtime прошли.

27.10.2026 · Уточнение D-088: сортировка в общей панели выдачи/карты — компактная кнопка только с иконкой sort (две стрелки), без подписи и шеврона. Доступное имя содержит текущий порядок; выбранное состояние и BottomSheet сохранены. Проверены открытие/выбор в браузере, внешний вид и build/runtime.

27.10.2026 · D-089: в деталях отеля добавлена info-кнопка «Под ваши предпочтения». BottomSheet объясняет совпадения выбранных тем с удобствами отеля; без тем показано пояснение об особенностях отеля. Кнопка «Изменить параметры» открывает общий SwipePreferences внутри FlowStack. «Сохранить предпочтения» применяет выбор по владельцу через applySwipePreferences и возвращает в тот же отель. Назад отменяет черновик. Совпадения обновляются, отсутствие совпадений обозначено явно. Бронь и условия поиска сохраняются. Проверены шторка, редактор, сохранение, повторное открытие, отмена через назад; 3 теста swipe-preferences и build/runtime прошли.

27.10.2026 · D-090: пользователь разрешила добавить 20 отелей из предоставленной выдачи Ozon Travel по Москве. В каталог подключены реальные названия, фото, рейтинги, опубликованные удобства и снимок цен за 27–29 октября для двух гостей. Неизвестные звёзды не приравнены к отсутствию звёзд. Недостающие параметры номеров, наличие, приём детей и правила бронирования — рабочие тестовые настройки; цены фиксированы на ночь, отмена остаётся по D-013, реальные условия Ozon не переносятся. Данные/границы: spec/imported-hotels.json. Фото отелей локальные; чужие фотографии номеров и демонстрационные тексты отзывов в новых отелях не показываются. Для ibis сохранены 3 фото стандартного номера 16 м² и тариф с завтраком. Отчёт: docs/iteration-4/qa-imported-hotels/REPORT.md.

27.10.2026 · Уточнение D-090: по запросу пользователя все 20 импортированных отелей получили по 4–6 фотографий из собственных карточек Ozon (всего 96). Дополнительные фотографии сохранены локально, URL и принадлежность — gallery-evidence.json/gallery-manifest.json в docs/references/ozon-moscow-2026-10-27/. Написаны самостоятельные описания по 1–2 предложения, без копирования описаний источника. Добавлены 59 вымышленных отзывов (обычно 3 на отель, 2 у Окружной с исходным счётчиком 2) для демонстрации; это не отзывы Ozon и не отзывы настоящих гостей. spec/hotel-editorial.json явно маркирует fictional-demo. Общие hotelReviews/hotelReviewTags используются в карточке и x1, доступны темы и сортировка. Исходные общие рейтинги и счётчики сохранены, тестовые оценки согласованы с ними. Проверены декодирование и уникальность всех 96 фото, браузерная галерея, отзывы/фильтры/сортировка, три теста импорта; build/runtime прошли.


27.10.2026 · D-091: по ссылке пользователя добавлены 20 объектов Санкт-Петербурга из выдачи Ozon за 5–8 ноября, два гостя; каталог теперь содержит 53 объекта. Подключены 99 локальных фото (4–5 на объект), опубликованные рейтинги, удобства, типы и ночные цены; описания самостоятельные, 60 отзывов вымышлены по прежнему запросу пользователя. Неизвестные поля бронирования используют тестовые настройки D-090, неизвестные звёзды -1. Цены фиксированы; округление исходной ночной цены может дать отличие итога за 3 ночи на 1 ₽. Источники: docs/references/ozon-spb-2026-10-27/. Проверки: 266 тестов, production build/runtime, декодирование и уникальность фото; браузерная выдача, фильтр бассейна и галерея. Отчёт: docs/iteration-4/qa-imported-hotels-spb/REPORT.md.


27.10.2026 · Уточнение D-056: в баннере «Горячие скидки» на «Найти» шарик на кобальтовой орбите заменён оранжево-жёлтым пламенем по прямому запросу пользователя. Новый прозрачный PNG — app/public/brand/illustrations/hot-deals-flame.png; исходник сохранён. Композиция, размеры и переход discount прежние. Промпт/происхождение: design/hot-deals-flame.md. Внешний вид проверен в браузере.

27.10.2026 · D-092: публичные горячие скидки задаются в spec/hotel-promotions.json (16/53, 10/20/30%). Не смешивать реестр с hotelDiscountBasisPoints программы лояльности. quoteDraft выбирает доступную скидку; Friendly Rate сохраняет прежние исключения. Баннер и фильтр используют promotionBasisPoints; проценты UI вычисляются из котировки, не фиксировать 5%. Новые акции вымышлены, исходные цены импорта и старые брони сохранены. Проверка: docs/iteration-4/qa-hot-deals/REPORT.md.

27.10.2026 · D-093: все 40 импортированных отелей имеют реальные категории/фото/оснащение и варианты питания: 100 категорий / 160 тарифов / 569 фото. Цены новых тарифов берутся из docs/references/ozon-rooms-2026-10-27/manifest.json, не из исторического sourcePrice отеля. Это фиксированные демонстрационные снимки; отмена/оплата/наличие сохраняют правила прототипа. Галерея Rooms.tsx выводит только существующие категории фотографий; Wi-Fi по оснащению номера, одиночная кровать поддерживается в roomBeds. Старые ID первой категории/тарифа сохранять. Проверка: 270 тестов, build/runtime и браузер; ../docs/iteration-4/qa-imported-rooms/REPORT.md.

28.10.2026 · D-094: DestinationSearch без недавних поисков; поле во всю ширину, крестик внутри заменяет «Отмена» и закрывает выбор без применения. Не путать с очисткой текста. Крестик сохраняет фокус на pointerdown до click, затем скрывает клавиатуру и закрывает шторку одним нажатием. История на FindPage остаётся. Браузер и build/runtime проверены.

28.10.2026 · D-095: NearbyDestinationCard.tsx — блок «Рядом с вами» над популярными направлениями в DestinationSearch. Предлагает один ближайший город из каталога по браузерной геолокации; nearbyDestination.ts считает расстояние до приблизительных центров четырёх городов. Не подставлять выбранный город поиска при отказе/таймауте геолокации. Нет внешнего геокодера и сохранения координат. Проверены 3 теста, build/runtime и браузерное состояние таймаута; реальная геолокация в in-app браузере при QA не пришла.

28.10.2026 · Отмена D-095 по прямому запросу пользователя: блок «Рядом с вами» удалён из окна «Куда поедем», вместе с запросом геолокации при открытии. Остались поле поиска с крестиком, результаты ввода и популярные направления по D-094.

28.10.2026 · D-096: запуск «Куда» из FindPage включает последовательность city → dates → guests; отдельные открытия дат/гостей не запускают цепочку. searchSequence/searchSequenceHotel в Prototype.tsx очищаются при закрытии; выбранный отель открывается только после применения гостей. DestinationSearch поддерживает Enter/enterKeyHint=done, выбор результата без раннего blur. .search-sheet-body даёт полноэкранную высоту шторкам с учётом safe area и положения клавиатуры; protected runtime не изменять. 270 тестов, build/runtime, браузерные цепочки Enter и клик города проверены.

28.10.2026 · D-097: FindPage — недавние поиски перед find-swipe; пустую историю не показывать. find-hot-deals без правой круглой стрелки, сетка из двух колонок (иллюстрация и текст); весь баннер остаётся кнопкой discount.


28.10.2026 · D-098: пользователь выбрала третий вариант иллюстрации пустых поездок — перламутровое арочное окно с морским пейзажем и кобальтовой орбитой. Отдельный PNG trip-empty-portal.png используется только в карточке «Здесь появится ваша поездка»; подписи, кнопка поиска, баннер двойной выгоды и условие отсутствия броней сохранены. Empty получил необязательный illustration, остальные пустые состояния не менялись. Проверены браузерный вид, переход Найти отель → Найти → Поездки, build/runtime. Источник и QA — design/trip-empty-variants/ и design-qa.md.


28.10.2026 · D-099: выбран второй вариант нового баннера «Горячие скидки» — белая карточка, текст слева, перламутровый билет с кобальтовым процентом/орбитой и янтарным пламенем справа. FindPage/search.css, новый локальный hot-deals-ticket.png. Компактный размер 361×140, вся карточка открывает collection=discount, отдельной круглой кнопки и стрелки у CTA нет. Существующие фильтры и цены сохранены. Браузерный переход/возврат и визуальный QA пройдены; build/runtime прошли. Эталон и доказательства: design/hot-deals-variants/, design-qa.md.


28.10.2026 · P-036 (рабочий проход по плану): в доступном Q06 «Опишите свой отдых» добавлены районы nc9 и резюме nc10. Районы из search-facets, счётчики по preferenceOffers с текущими интересами/датами/бюджетом, район — обязательное ограничение результата. Выбор применяется по кнопке; назад его отменяет. «Куда угодно» пропускает район. Резюме показывает фактические условия, результат, переход/редактирование. Этап/район сохраняются по владельцу, старые черновики совместимы, обычный поиск независим. Старый вход подбора в поездках не возвращён. Карта схематическая, рекомендации по районам не выдуманы. 297 тестов, build/runtime и браузер iPhone/Pixel прошли. Следующий проход: nc11 — единое редактирование условий; темп/окружение требуют признаков каталога. Отчёт: docs/iteration-6/qa-text-refinement/REPORT.md.


28.10.2026 · D-100: по прямому запросу пользователя упрощён текстовый подбор: поле пожелания → «Подобрать отели» → сразу выдача. Под заголовком — теги ключевых пожеланий, затем общий SearchFilterRail и карточки с раскрытым «Почему подходит вам». Промежуточные районы и резюме P-036 удалены из реализации; старые сохранённые этапы переводятся в results без скрытого района. Фильтры и сортировка используют общий механизм выдачи, сохраняются отдельно от обычного поиска; счётчик полного фильтра учитывает пожелания. Цена выбранного тарифа переносится в бронирование. Не возвращать nc9/nc10/nc11 в этот путь. Проверены 297 тестов, build/runtime и браузерный прямой переход, фильтры, сортировка. Подробности: docs/iteration-6/qa-direct-text/REPORT.md.


28.10.2026 · Уточнение D-100: на странице «Какой отдых хочется?» параметры города/дат/гостей объединены в белый блок find-search-fields, как на «Найти»: город сверху, даты и гости снизу. Пояснение «Пока не учтено» и предложение переформулировать текст удалены. Сокращены отступы под полем и убран стандартный верхний margin заголовка распознанных пожеланий. Логика подбора сохранена. Проверены внешний вид и календарь в браузере, build/runtime.


28.10.2026 · Уточнение D-100: из текстовой выдачи удалён крупный заголовок с количеством отелей, интервалы уменьшены до 10–12 px. Под общими фильтрами добавлен существующий SourceMap; раскрытие использует ExpandingMap и ExpandedResultsMap с тем же набором preferenceOffers, сохраняет условия и ведёт в отель из текстового контекста. Общая карта получила необязательный getOffers; обычный поиск не менялся. Строка «Совпало X из Y пожеланий» из карточек убрана. Проверены сборка/runtime, 11 тестов подбора и фильтров, браузерный вид списка/карты, выбор метки и возврат.


28.10.2026 · Уточнение D-100: «Почему подходит вам» в карточках отелей свёрнуто по умолчанию, подробности открываются нажатием. Прежнее автоматическое раскрытие отменено прямым решением пользователя. Визуальная проверка и build/runtime прошли.


28.10.2026 · P-037: новая страница уведомлений n2 — NotificationCenter.tsx/notifications.css, единая презентация уведомлений цены и AppNotice. Категории, даты, прочтение/счётчик, пагинация, пустые состояния; пять push-примеров из рабочего листа Google Sheets доступны через NotificationDemoControls. Типы: инструкция, ключ, welcome, отзыв, баллы за проживание. Регистрация не имеет push по источнику. Набор истории включается только в инструментах: в таблице стоит «История — не требуется», ответ на уточнение пока не получен. Пуши не меняют финансовые данные, доступ или статус брони; клики проверяют владельца/состояние, отзыв возвращается в историю. Реальные отправки, фоновые триггеры и начисление баллов не реализованы. Источник/границы: docs/references/notifications-2026-10-28/README.md. Проверка: 302 теста, build/runtime, браузер iPhone/Pixel; docs/iteration-6/qa-notifications/REPORT.md.


28.10.2026 · Уточнение P-037: справа в закреплённой шапке чата — звонок и уведомления отеля. Звонок через tel показывается только при собственном телефоне в hotelContacts.ts; для Mantera проверен +7 800 101 33 33 на https://manteracongress.ru/booking, другим отелям контакт не подставляется. Колокольчик открывает все категории уведомлений выбранного отеля; hotelId сохраняется в новых примерах, старые связываются по доступной брони, ценовые — по своему черновику. «Прочитать все» действует только в текущем контексте отеля. Возврат восстанавливает чат исходной брони и предыдущий путь. ИИ-ассистент и среднее время ответа сохранены. Проверены 6 тестов уведомлений, build/runtime и браузерная цепочка чат → уведомления → отзыв → уведомления → чат → поездки. Звонок фактически не совершался.


28.10.2026 · Уточнение P-037: при переходе в уведомления из чата название отеля отдельной строкой не показывается. Фильтрация по отелю, прочтение и возврат в исходный чат сохранены.


28.10.2026 · Уточнение P-037: в общей шапке основных разделов колокольчик показывает кобальтовую точку при наличии непрочитанных уведомлений, без числового счётчика. Доступное имя сообщает «есть новые». При отсутствии непрочитанных точка скрыта.


28.10.2026 · P-038: реализован пользовательский путь подтверждения отельера A05–A07/J11 по z1/z2/z3/z5/z6 «Все экраны». #hotelier-invite — публичное приглашение без выдачи роли; принятие ведёт через существующие SMS/имя в #hotelier. Входы также из профиля и Friendly Rate в выгодах. Рабочая почта → pending → approved/rejected; исправление почты отменяет прежний запрос, повтор получает новый ID. Запрос и роль сохраняются по владельцу. Отдельная демонстрационная вкладка кабинета применяет ответ только к актуальному запросу авторизованного владельца; приложение подхватывает результат через storage/focus/visibility без замены броней и балансов. При недоступном хранилище показывается ошибка, при неоткрывшейся вкладке доступно «Открыть здесь». Friendly Rate остаётся закрытым до одобрения; обычные тарифы доступны всегда. Закрытый тариф, программа отеля и баллы используют прежний расчёт. Инструменты «Отельер · сценарии» заменяют прежний двоичный переключатель: приглашение, форма, ожидание, успех, отказ и ответы на текущий запрос. Реальный TravelLine/проверка работы не подключены. A08 пока покрыт просмотром статуса; отправка коллегам остаётся следующим объёмом. Проверка: 307 тестов, build/runtime, браузер iPhone/Pixel, новая регистрация и ответы в двух вкладках. Отчёт: docs/iteration-7/qa-hotelier/REPORT.md.


28.10.2026 · Уточнение P-038: убрана избыточная минимальная высота вложенной hotelier-page. Высоту задаёт только общий main с учётом реальной safe area и шапки; внутренний экран растягивается flex. Кабинет использует ту же схему без лишнего нижнего отступа 120 px. Скролл не заблокирован: при клавиатуре/длинном содержимом остаётся доступным. Проверены приглашение (iPhone: scrollHeight=clientHeight=798; Pixel: 850) и подтверждение (798), build/runtime.
28.10.2026 · P-038, обновление по пользовательскому DOCX: приглашение → телефон/СМС/имя → «Вы работаете в отеле?» → email → ожидание → тестовый вход TravelLine → подтверждение привязки. Пропуск, отказ, повтор и возврат в исходный раздел работают. В поездках баннер статуса; скрытие успешного баннера не снимает роль. Ответ требует совпадения ID, токена, email и телефона текущего запроса. Смена почты делает старую ссылку недействительной. Приглашение коллеги не передаёт роль или токен. В инструментах повтор сценария приглашения сбрасывает проверку текущего пользователя без удаления поездок. Обязательная авторизация и постоянное локальное сохранение профиля остаются; данные существующего пользователя не удаляются. Коммерческие условия FR из документа ожидают уточнения; пока сохранены прежние тарифы. Реальная интеграция TravelLine отсутствует. Источник: docs/references/hotelier-2026-10-28/. Проверка: 310 тестов, build/runtime, браузер iPhone/Pixel.
28.10.2026 · Уточнение P-038: на успехе привязки оставлено только «Перейти в приложение». Изменение email — ссылка внутри блока адреса в ожидании/отказе. В профиле бейдж «Отельер · Friendly Rate» расположен под именем/телефоном по fr2; бейдж, баннер успеха и вход из выгод открывают единый HotelierInfoSheet по fr6. Приглашение коллеги — отдельная страница #hotelier-share из профиля, композиция i1 без обещания бонусов. Шапка и градиент z1–z6 восстановлены. Источник приглашения сохраняется отдельно по владельцу; неизвестный автор не выдумывается. Старые коммерческие условия сохранены до ответа. Новый дизайн баннера ожидает выбора из трёх вариантов. QA: docs/iteration-7/qa-hotelier-visual/REPORT.md.

28.10.2026 · Уточнение P-038: выбран и установлен вариант 2 баннера подтверждённого отельера — зелёный Friendly Rate с порталом и орбитой. Подписи: «Статус подтверждён», «Закрытые тарифы для вас», «О возможностях». Вся карточка открывает общий HotelierInfoSheet, отдельный крестик скрывает баннер без снятия статуса. Текст остаётся HTML, иллюстрация подготовлена из выбранного изображения в hotelier-friendly-portal.png. Проверены iPhone/Pixel, открытие пояснения из баннера и профиля, build/runtime.

29.10.2026 · Уточнение раздела «Выгоды»: подпись программ — «Отели, в которых у вас есть скидки». Friendly Rate виден только при accounts[owner].hotelierStatus === approved: строка возможностей, пояснение баллов и условие несовместимости в программе отеля. Для none/pending/rejected упоминания в этих экранах скрыты. Проверены браузером главный экран, правила баллов, программа и возврат; build/runtime прошли.

29.10.2026 · По запросу пользователя в «Выгоды → Ваши возможности» вместо «Двойная выгода» — «Привилегии «Ключей»», подпись «Уровни, баллы и привилегии от отелей». Нажатие открывает общую BottomSheet с двумя пояснениями: накопление баллов зависит от уровня; отели предоставляют гостям привилегии в рамках «Ключей». Конкретные названия/пороги уровней, проценты и перечень привилегий не заданы; финансовая модель не менялась. Friendly Rate по-прежнему только approved. Проверены открытие/компоновка iPhone, build и protected runtime.

29.10.2026 · Пользователь утвердила вознаграждение приглашающему: 1 000 баллов «Ключей» за каждого приглашённого друга. Подпись баннера «Пригласите друзей» в «Выгодах» обновлена. Нажатие/отправка ссылки сами по себе не начисляют баллы; критерий состоявшегося приглашения и механизм начисления этим изменением не добавлены.

29.10.2026 · Приветственное начисление: по запросу пользователя 1 000 баллов «Ключей» по умолчанию. ensureWelcomePoints вызывается при инициализации аккаунта в приложении и восстановлении примера; запись welcomePoints по владельцу сохраняет сумму/дату и защищает от повтора. Баланс увеличивается на 1 000, прежние средства не заменяются. pointHistory отображает начисление в «Все»/«Начисления», окно операции обозначает программу «Ключей», не отель/возврат. Чтение истории не меняет кошелёк. Проверены 11 целевых тестов (идемпотентность/reload, владелец, списание/возврат, демосценарии), браузерный вид и повторная загрузка, build/runtime.

29.10.2026 · По прямому запросу пользователя отключение карты отеля убрано из прототипа: нет кнопки, подтверждающей шторки и обработчика отключения. Карточка программы сохраняет действие «Забронировать», неподключённая программа — «Подключить карту». Сохранённые карты и балансы не меняются.

29.10.2026 · История путешествий: выбран вариант 2 (альбом с фотографиями). TripHistoryEntry внизу «Поездок» открывает общую историю; прежний встроенный список прошлых броней убран. Вкладки: все / предстоящие (включая текущее проживание) / завершённые / отменённые, поиск отеля/города, детали и возврат в исходный раздел. «Удалить бронь из приложения» скрывает запись только для текущего участника; не отменяет бронь, не изменяет оплату/баллы и доступ других участников. Номер позволяет вернуть скрытую запись. Для новой внешней брони действует локальный пример KEYS-2026; реальная загрузка из отеля и проверка гостя не подключены. В инструментах отдельный обратимый сценарий «История путешествий»: Mantera предстоящая, Орбита в лесу завершённая, Сосновый бор отменённая. Исходные данные сохраняются и восстанавливаются. Проверка: 334 теста, build/runtime 28 файлов, iPhone/Pixel; design-qa.md.

29.10.2026 · Пользователь выбрала вариант 1 истории с таймлайном (exec-6315040b). HistoryTimeline группирует поездки по месяцу заезда, использует фото каталога. HistoryStatus единый для списка/деталей: предстоящая — синий календарь; завершённая — зелёная галочка; отменённая — серый крестик; проживание — зелёный ключ. Статусы в одну строку. Поиск, теги, добавление, открытие, повтор и удаление сохранены. QA: design/history-timeline/, design-qa.md; iPhone/Pixel, 8 целевых тестов, build/runtime.

29.10.2026 · Чаты: выбран вариант 2 — отдельные карточки с фото отеля (hotelPhoto). Непрочитанное: белая подложка, тонкая кобальтовая рамка, тёмное полужирное сообщение, счётчик; прочтение снимает выделение через прежний readChat. Поиск/новый чат/поддержка не возвращены. Реальные данные диалогов сохранены. QA: design/chat-list-variants/, design-qa.md; iPhone/Pixel, 5 тестов, build/runtime.

29.10.2026 · Чаты для большого списка: выбран вариант 2 из design/chat-priority-variants/options.json. Единая белая группа компактных строк с фото, лавандовый AI-ассистент с исходным знаком сверху. chatThreads выделяет один диалог: подтверждённое текущее проживание, иначе ближайший будущий заезд; отменённые, завершённые и скрытые записи не получают приоритет. Остальные сортируются по последней активности. Приоритет сохраняется после прочтения; непрочитанное выделяется тёмным полужирным превью и синим счётчиком. Даты ближайшей поездки сокращены; статусы в одну строку. Переходы в диалог и свободный текстовый подбор сохранены. QA: design/chat-priority-variants/, design-qa.md; шесть диалогов, iPhone/Pixel, текущая/будущая поездка, прочтение и возврат из подбора; 6 целевых тестов, build и 28 protected файлов.

29.10.2026 · Шапка диалога: убрано демонстрационное «Ответ отеля ≈ 5 мин», поскольку сейчас отвечает ИИ. Название и «ИИ-ассистент» объединены вертикально с отступом 3 px, высота шапки и FlowScreen синхронно сокращена до 76 px. Кнопки назад, звонка и уведомлений сохранены. Проверено визуально в браузере; build/runtime пройдены.

29.10.2026 · Приглашение отельера — первый экран «Свои отели. Особые условия.» без закрытия. HotelierHeader получает onClose только на последующих шагах; back для hotelier-invite не обходит выбор. Два действия: принять → телефон/SMS/имя → подтверждение TravelLine; пропустить → обычная регистрация → «Поездки» с сохраняющимся баннером подтверждения. Прежняя модель hotelierOnboarding/registerHotelierInterest обеспечивает баннер без фиктивной заявки или роли. Браузером пройдены обе ветки до соответствующих целевых экранов, баннер проверен после reload; 11 тестов hotelier, build и runtime 28 файлов прошли.


29.10.2026 · Регистрация, условия и онбординг: по запросу пользователя в «Выгодах» убрана подпись «Карта подключена». Слово «условия» открывает публичную страницу #terms (legal/TermsPage.tsx), доступную до авторизации. Ссылка срабатывает с первого нажатия при активной клавиатуре; возврат сохраняет телефон. Пользователь разрешила составить пример соглашения: добавлены проекты соглашения и политики данных с пометкой «Проект», незаполненными реквизитами и контактами. Они требуют проверки до запуска, не подменяют отдельные согласия и не реализуют регистрацию юридического акцепта. Шапка Onboarding перемещена внутрь MobileScroll для учёта системной safe area; исходные иллюстрации и анимации D-011 сохранены. Проверены три шага iPhone, Pixel, обе вкладки документов/возврат и выгоды; тест public-terms (публичные условия и защита остальных маршрутов), build и protected runtime прошли.


29.10.2026 · По прямому запросу пользователя на экране ввода телефона отсутствует крестик закрытия страницы. В шапке остаётся только знак «Ключей»; кнопки возврата с кода и условий сохранены.


29.10.2026 · Настройки демонстрации: отдельный раздел «Сценарии входа» с тремя действиями — новый пользователь (онбординг/регистрация), отельер (вводное приглашение/регистрация/подтверждение TravelLine), уже зарегистрирован (телефон/SMS, без имени). prepareDemoEntry подбирает незанятый тестовый номер для регистрации, для повторного входа использует существующий профиль либо создаёт Анну Соколову. Переключение сбрасывает текущую авторизацию и незавершённый SMS-запрос, но не удаляет профили, брони и балансы. Вводное приглашение остаётся первым экраном отельера по прежнему решению; роль автоматически не выдаётся. Дублирующая кнопка приглашения в диагностике статуса удалена. Проверены браузером запуск трёх веток, повторный вход до поездок и регистрация отельера до рабочей почты; 4 новых теста и 11 тестов отельера, build/runtime прошли.


29.10.2026 · Повторный вход разделён по прямому запросу пользователя: сценарий 3 «Зарегистрированный отельер» выбирает только approved-профиль, сценарий 4 «Зарегистрированный гость» — none без участия/заявки на подтверждение. При отсутствии подходящего профиля создаётся отдельный демонстрационный; для сценария 3 ему задаётся имитированное подтверждение. Статусы существующих пользователей, их брони и балансы не переписываются. Оба пути идут через телефон/SMS прямо в приложение без имени. Проверены 7 тестов (включая смену сценариев, approved/pending/rejected/пропуск), build/runtime и браузером сценарий 4 до профиля без бейджа отельера. Уточняет прежнее общее поведение сценария 3.


29.10.2026 · Уточнения профиля: «Подтвердить статус отельера» видно только при hotelierParticipants[phone] и отсутствии approved. У обычного гостя без признака входа для отельера строка скрыта; подтверждённый бейдж сохранён. На странице PriceWatches удалена кнопка «Выбрать другой отель»; действие пустого состояния «Найти отель» сохранено. Помощь: исправлены нативные неоформленные кнопки категорий — общий filter-chip/Carousel; поиск без лишней подписи, с иконкой; компактные строки C5 с тематическими иконками, заголовок списка и карточка статьи. Форма обращения оформлена теми же полями/радиусами. Отдельного экрана помощи в исходном «Все экраны» нет: использованы существующие компоненты профиля p1/fr2 и приложения. Браузерная проверка до/после, фильтр/статья/форма, отсутствие строки статуса у обычного гостя; 4 теста profile-history-support и build/runtime прошли. Реальная отправка обращений не подключалась.


29.10.2026 · По запросу пользователя со страницы «Помощь и поддержка» удалён блок «Нужна помощь?» целиком, включая строки поддержки и связи с отелем. Поиск, категории, статьи и история обращений сохранены.


29.10.2026 · Управление данными: нажатие «Удалить аккаунт» открывает общий BottomSheet с коротким пояснением, «Удалить аккаунт» (danger) и «Сохранить аккаунт». Дополнительный тумблер ознакомления убран; подтверждением служит явная кнопка. После подтверждения шторка закрывается, появляется хинт «Запрос на удаление создан». Ранее созданный запрос открывается в той же шторке с отменой. Старый маршрут profile-deletion отображает управление данными с открытой шторкой вместо отдельного экрана. Сохраняется прежняя демонстрационная модель запроса без фактического удаления профиля/броней. Проверены браузером открытие и подтверждение; 4 теста настроек, build/runtime прошли.


29.10.2026 · Установка PIN: создание и повтор используют четыре отдельные ячейки с маскировкой цифр. Общая механика DigitCodeField в SmsCodeField.tsx поддерживает 4/6 ячеек: переход после ввода, вставка полного кода, удаление и стрелки. SMS остаётся шестизначным. Кнопка PIN доступна только при четырёх цифрах без пропусков; ошибка показана у полей один раз. Секрет не сохраняется: прежняя демонстрационная настройка pinEnabled не менялась. В браузере проверены компоновка, ввод/повтор, несовпадение и повторная отправка; 4 теста настроек, build/runtime прошли.


29.10.2026 · Профиль и путешественники: убрана шестерёнка справа в шапке профиля; «Документы и гости» переименованы в «Путешественники». Форма гостя использует маску даты ДД.ММ.ГГГГ с сохранением полной даты в ISO, гражданство выбирается в BottomSheet со списком стран и поиском. Телефон обязателен, вводится через общий PhoneField и нормализуется при сохранении; старые записи без телефона по-прежнему загружаются, но для их сохранения потребуется заполнить поле. Выбор страны учитывает safe area и клавиатуру. Проверены браузером выбор/поиск страны, маски, ошибка пустого телефона и сохранение нового гостя; тестовая запись после проверки удалена. Три теста формы (даты, границы, обязательный телефон), build и protected runtime прошли.


29.10.2026 · Уточнение редактора путешественника: подписи «необязательно» удалены, заголовок оставлен только в шапке. Телефон вводится целиком с изменяемым международным кодом, обязателен; normalizeContactPhone сохраняет +код без подмены на +7, принимает форматированный номер и префикс 00, прежние российские 10 цифр/8 совместимы. Правила телефона авторизации не менялись. Дата рождения открывает BottomSheet с тремя барабанами день/месяц/год, применением «Готово» и отменой черновика. Это имитация системного выбора в браузерном прототипе; поддержаны перетаскивание, колесо и клавиатура, месяцы/високосные годы и предел сегодняшней даты. Отображение ДД.ММ.ГГГГ, хранение ISO. Проверки: 18 тестов формы/авторизации, сквозной scripts/verify-traveler-editor.mjs (drag, 29 февраля, отмена, сегодняшний предел, международный номер save/reopen), визуальная проверка, build/runtime. Снимки: docs/iteration-7/qa-traveler-editor/.


29.10.2026 · По запросу пользователя возвращена маска телефона в редакторе путешественника. ContactPhoneField: российский +7 (999) 123-45-67, международный код остаётся редактируемым; другие номера группируются без подмены кода. Поддержаны ввод, вставка полного номера, удаление у разделителя и замена выделенного текста с сохранением курсора. Телефон по-прежнему обязателен, хранение нормализовано. Проверены шесть тестов формы/маски, браузерный прогон ввода/удаления/вставки +1/+44 и сохранения, build/runtime.


29.10.2026 · Бронирование для другого человека: в h5 блок «Гость» дополнен переключением «Для себя» / «Для другого» и выбором из «Путешественников» в BottomSheet. Ручной ввод остаётся доступен; в режиме другого гостя пустые поля не заполняются профилем владельца при перезагрузке. Email подписан «для подтверждения», при отсутствии email путешественника остаётся контакт владельца. Сохранённого путешественника можно выбрать и в редакторе дополнительного гостя; уже указанные гости исключены из выбора, перенос дополнительного гостя в основного убирает дубль. Сохраняется снимок контактов, не меняются профиль и owner брони; доступ к управлению/ключу не выдаётся. Телефон использует общую международную маску и проверку. Это прямое уточнение пользователя к D-023: явный выбор путешественников снова разрешён, прежняя автоматическая подстановка дополнительного гостя сохранена. Проверки: 14 тестов, browser E2E до подтверждения, build/runtime. Отчёт docs/iteration-4/qa-booking-travelers/REPORT.md.


29.10.2026 · По запросу пользователя в блоке «Гость» удалены кнопки «Для себя» и «Для другого». Поля основного гостя, выбор сохранённого путешественника и добавление других гостей сохранены. Сборка/runtime и визуальная проверка в браузере прошли.


29.10.2026 · Выбор сохранённого путешественника убран из основного блока «Гость» по запросу пользователя. Он остаётся в редакторе дополнительных гостей. У списка путешественников устранено наложение рамок: единая внешняя обводка карточки, строки без собственных рамок с согласованными крайними скруглениями. Проверены визуально основной блок, открытие списка дополнительного гостя и возврат; build/runtime прошли.


29.10.2026 · Фото профиля: нажатие на аватар с иконкой камеры открывает BottomSheet с круглым предпросмотром, выбором/заменой изображения, сохранением и удалением. JPG/PNG/WebP до 5 МБ обрабатываются существующим readProblemPhoto (сжатая JPEG-копия без EXIF); User.photo сохраняется локально отдельно для каждого аккаунта. Фото отображается в профиле и аватаре общей шапки. Закрытие не применяет черновик, удаление применяется по «Сохранить». Ошибка чтения/места показывается в окне. Реальная загрузка на сервер не подключалась. Проверки: build/runtime; изолированный браузерный сценарий scripts/verify-profile-photo.mjs — неверный формат, загрузка, предпросмотр, оба аватара, сохранение/reload и удаление/reload; визуальная проверка.


29.10.2026 · «О приложении»: вместо одной фразы — фирменный логотип, версия из app/package.json, краткое описание возможностей «Ключей», ссылки на существующие соглашение/политику данных и помощь. Документы открываются на нужной вкладке; возврат из документов профиля восстанавливает «О приложении», вход из регистрации по-прежнему возвращается к телефону. Реквизиты/контакты компании не выдумывались; прежние документы остаются проектами. Проверены в браузере композиция, обе ссылки и возврат; build/runtime прошли.


29.10.2026 · Пользователь выбрала первый вариант профиля из design/profile-navigation-variants/options.json. ProfilePage: баллы и личность сверху; далее группы «Мои поездки» (история, путешественники, стиль), «Моя выгода» (слежение, приглашение), «Настройки аккаунта» (уведомления, безопасность, данные), «О сервисе» (помощь, приложение); выход отдельно. Заголовок рядом с кнопкой назад; компактные общие строки. Подтверждение статуса видно только прежним участникам отельерского входа и находится в «Моя выгода», approved-бейдж остаётся у имени. Фото, балансы и обработчики сохранены. Проверены браузером композиция, прокрутка, путешественники/возврат и отмена выхода; build/runtime. QA: design/profile-navigation-variants/qa/design-qa.md.

29.10.2026 · P08/P09 теперь включают локальный демонстрационный вход: profile/DeviceAccess.tsx, settings.ts. Проверяемый PIN (соль/PBKDF2), четыре ячейки общего PinCodeField, биометрия остаётся симуляцией. При boot с PIN показывается DeviceUnlock; hash-переход не снимает блокировку. SMS recovery очищает доступ только подтверждённого аккаунта. Старые флаги без credential не блокируют. Не выдавать это за production-авторизацию или системную Face ID. Проверки: scripts/verify-device-access.mjs и tests/profile-settings.test.mjs.


29.10.2026 · Быстрый повторный вход: DeviceUnlock при включённой биометрии сразу показывает фирменную заставку и запускает проверку, без отдельной кнопки подтверждения. Успех — мятная галочка и автоматический переход; ошибка/недоступность — основной вход по PIN, повтор вторичным действием только при ошибке. PIN: четыре маскированные ячейки + встроенная цифровая клавиатура, автоматическая проверка, удаление и восстановление. Общие authBrandMs/authCheckMs/authSuccessMs = 200/900/420 в interactions.tsx; reduced motion без вращения. Симуляция, не системный Face ID. Проверены IAB-сценарии успеха, ошибки, резервного PIN, удаления и повтора; 33 unit-теста, build/runtime. Отчёт design/auth-entry/qa/REPORT.md. Уточняет предыдущую шторку входа; шторка первичного подключения биометрии сохранена.


29.10.2026 · Пользователь утвердила обновлённый вариант 2 первого экрана отельерского приглашения: design/hotelier-entry-variants/variant-2-revised.png. Верхняя шапка/логотип и «Для отельеров» убраны только здесь; центральная иллюстрация «Ключи · Закрытая версия», приглашение «Юра Костин · Travelline» по умолчанию, параметры реферальной ссылки имеют приоритет. Нет подписи «Статус можно подтвердить позже». Принять/пропустить продолжают прежние ветки регистрации. Общий OrbitIllustrationReveal в interactions.tsx — однократное появление после загрузки, 1,1 с orbit, reduced motion сразу показывает результат. QA: design/hotelier-entry-variants/qa/REPORT.md, 11 тестов, build/runtime, IAB обе кнопки и анимация.


29.10.2026 · По запросу пользователя после регистрации по приглашению отельера запускается существующий онбординг D-011. Завершение сохраняет ветку: принятие приглашения → рабочий email/подтверждение статуса; пропуск → «Поездки» с баннером ожидающего подтверждения. Телефон повторно не запрашивается. hotelierTourTarget хранит незавершённый переход и восстанавливает онбординг при перезагрузке; демонстрационные сценарии очищают его. В зарегистрированном режиме финальная кнопка «Продолжить», без повторного входа и подписи «Войдём в ваш профиль». Иллюстрации и анимации прежние. QA: docs/iteration-7/qa-hotelier-tour/REPORT.md; 35 тестов, build/runtime, обе ветки в IAB.


29.10.2026 · Уточнён порядок отельерского входа: общая заставка SourceSplash → приглашение → регистрация → подтверждение статуса (или отложить) → три шага онбординга → приложение. Пропуск приглашения ведёт через регистрацию и онбординг к «Поездкам» с баннером. Заставка выделена в onboarding/LaunchSplash.tsx: один запуск перед любым сценарием входа, включая повторный телефонный вход, PIN и биометрию; внутри Onboarding повторной заставки нет. Она завершается до монтирования приглашения/DeviceUnlock, поэтому их анимации не проигрываются за ней. hotelierTourTarget=hotelier хранит ожидание этапа подтверждения, trips — ожидание онбординга; повторное открытие подтверждения из профиля не запускает тур. Это заменяет предыдущий порядок, где онбординг шёл сразу после имени перед подтверждением.

29.10.2026 · Биометрический вход объединён со стартовой заставкой: один SourceSplash остаётся смонтированным, проверка идёт во время исходной анимации (2,4 с), затем на той же подложке мятный success «Вход выполнен» с галочкой и автоматический вход через общий authSuccessMs. Отдельная вторая заставка DeviceUnlock с другим круговым знаком удалена. Ошибка/недоступность показываются на той же заставке с основным действием «Ввести PIN-код»; повтор не перезапускает логотип. PIN и восстановление сохраняются. Биометрия остаётся демонстрационной.

29.10.2026 · Текущий онбординг следует исследовательскому варианту 2: design/onboarding-research/README.md. Иллюстрации research-o1.html/research-o3.html и прежняя o2.html; новые motion-ключи research-o1/research-o3. Сохранять memo-DOM, выбранную айдентику и маршруты входа. Старые o1/o3.html остаются архивом. QA: design/onboarding-research/qa/REPORT.md.


29.10.2026 · Пользователь выбрала вариант 1 из нового набора первого шага онбординга (design/onboarding-first-step-variants/room-control-options.json): «Управляйте номером» / «Все возможности — в вашем телефоне». Иллюстрация спальни и единая белая панель «Открыть номер», «Заказать в номер», «Wi-Fi в один клик». RoomControlArt.tsx использует отдельный сгенерированный webp, живые подписи и исходные UI-kit иконки. Это презентация возможностей, не управление реальной бронью. Появление панели и трёх действий следует существующим D-011 таймингам через motion.ts; reduced motion сохранён. Убран пустой вторичный ряд под кнопкой первого шага; остальные тексты/ветки входа не изменены. Проверены iPhone/Pixel, переход дальше/назад/пропуск, сборка и 28 защищённых runtime-файлов. QA: design/onboarding-first-step-variants/qa/REPORT.md.

29.10.2026 · Второй шаг — выбранный вариант 1 «Двойная выгода»: BenefitsIntro.tsx и onboarding-dual-benefits.webp; отдельные пояснения баллов Ключей и программы отеля. Старый o2.html архивный. Иконка hotel-building.svg извлечена из него без перерисовки. motion.ts: dual-benefits, memo-иллюстрация, прежние переходы и reduced motion. QA: design/onboarding-benefits-variants/qa/REPORT.md.

29.10.2026 · По запросу пользователя иллюстрация второго шага онбординга получила одноразовое орбитальное появление: подъём, поворот и мягкое возвращение в исходную позицию. Общий OrbitIllustrationReveal поддерживает active; анимация начинается только на открытом шаге после загрузки изображения и повторяется при возврате. Использованы общие bubbleOrbit (1,1 с) и orbit easing, пояснения сохраняют D-011. При reduced motion — сразу итоговая позиция. Бизнес-логика не менялась.

29.10.2026 · Уточнение анимации второго шага: пользователь попросила разделить иллюстрацию на слои. Две прозрачные карточки (onboarding-benefits-keys.png / hotel.png) теперь собираются слева и справа; орбита, спутники и плюс отдельные элементы. BenefitsArt ждёт загрузку обеих карточек и активный шаг; D-011 motion.ts, Orbit easing, reduced motion. Прежнее вращение цельного растра больше не используется на этом шаге. Ассеты и промпты: design/onboarding-benefits-variants/LAYERS.md.

29.10.2026 · По замечанию пользователя восстановлена объёмная проекция знака «+» второго шага: отдельный прозрачный onboarding-benefits-plus.png по исходному медальону вместо плоского CSS/UI-icon. Анимация и отдельный слой сохранены; сборка начинается после загрузки трёх ассетов. Проверены браузером повторный вход и итоговая композиция, build/runtime.

29.10.2026 · Пользователь выбрала третий вариант шага персонализации онбординга: «Подборка, которая понимает вас». PersonalizationArt.tsx: отдельные слои источников предпочтений, задних карточек и передней карточки с живыми пожеланиями. Последовательное появление источников → карточек → двух совпадений через motion.ts/D-011 и Orbit easing; после загрузки всех изображений, повтор при возврате, reduced motion без движения. Это презентация персонализации, не новая система слежения или рекомендаций. Исходный research-o3 сохранён в архиве. Проверка: design/onboarding-personalization-variants/qa/REPORT.md.

29.10.2026 · История баллов дополнена 10 сохранёнными демонстрационными операциями (начисления за проживание, 1000 за друга, списания и возврат). Их сумма 4860 объясняет исходный демобаланс ensureAccount и не начисляется повторно. Приветственные 1000 сохранены; их дата в демохронологии предшествует поездкам. Новые платежи/возвраты по-прежнему берутся из payment.operations, кошельки отеля не меняются. ensureDemoPointsHistory изолирован по владельцу и идемпотентен. Это тестовые суммы, не новые правила начисления. Проверены 9 тестов rewards (включая списание/отмену после наполнения), build/runtime и история/фильтр в браузере.

29.10.2026 · История баллов приведена к v5 «Все экраны»: компактная карточка баланса с исходной орбитой, сегменты вместо чипов (существующий breakfast-segments), месячные группы, Onest 15/21 для операций и Unbounded 15/21 для сумм. Начисления — мятные иконки/зелёные суммы, списания — кобальтовые иконки/тёмные суммы. Правила открываются через доступную кнопку i 44×44; данные и суммы сохранены. Проверка: design/points-history-qa/REPORT.md.

29.10.2026 · Добавлен пример балльной программы без скидки у «Орбиты в лесу» (orbit-forest). Возможность баллов отделена от процента скидки; демокошелёк 2500 создаётся однократно и не пополняется после списания. Вкладки «Баллы» и «Скидки», карточка, поиск и оплата учитывают тип программы. Проверены списание, возврат, сохранение нулевого баланса и исключение с Friendly Rate (10 rewards-тестов), build/runtime, вкладки и карточка в браузере. 2500 — тестовый баланс; автоматическое начисление за новые проживания без правил отеля не добавлялось.

29.10.2026 · В списке программ баллы показаны компактным лавандовым бейджем с кобальтовой иконкой points и числом вместо серой подписи «б.». Бейджи баллов и скидок одинаковой высоты, выровнены справа; доступное имя содержит полное число баллов. Общий ProgramRow применяется также в «Выгодах». Визуальная проверка iPhone и runtime пройдены.

29.10.2026 · По уточнению пользователя баллы отеля визуально отделены от баллов «Ключей»: в общем ProgramRow название и город сверху, под ними ряд выгод. Скидка — мятная плашка с процентом; баллы — нейтральная плашка с явной подписью «баллов отеля», без орбитального знака и кобальтового оформления. Три состояния (скидка, баллы, сочетание) проверены в IAB; одинаковая высота плашек, без переноса внутри. Общая карточка сохраняет переход, фото и подключение программы. Runtime проверен.

30.10.2026 · Уровни программы отеля: `rewards/loyalty.ts` — единый расчёт hotelProgramProgress/hotelProgramDiscount и снимок условий новой брони; `HotelProgramDetails.tsx` — v3/L04. Не брать размер скидки участника напрямую из каталога: использовать hotelProgramDiscount (также для priceEvents). Текущий остаток баллов не определяет уровень. Годовой прогресс и журнал начислений отделены от кошелька; confirmCheckout начисляет один раз по снимку брони. Friendly Rate исключён, старые брони задним числом не пересчитывать. Пороги и привилегии пока демонстрационные, подробности `../design/hotel-levels-qa/REPORT.md`.

30.10.2026 · По запросу пользователя «Уровни отеля» сделаны универсальными: отдельные карточки HotelLevels.tsx без монограмм; произвольные название/условие/описание, опциональные выгоды скидка/баллы/привилегии. Никакой фиксированной высоты/обрезки названий. Текущий уровень — общий зелёный StatusBadge с галочкой, одной строкой; при нехватке ширины переносится весь бейдж. Подробности открываются по клику всей карточки. Визуальная адаптация не означает добавление новых правил квалификации в расчёты.

30.10.2026 · Активный уровень отеля должен явно отличаться от фона: подложка #EEF0FF, кобальтовая рамка 2 px (border + inset без изменения размеров), зелёный StatusBadge «Ваш уровень» сохранён. Применяется общим .hotel-level-card.is-current во всех программах.

30.10.2026 · К текущим карточкам «Уровни отеля» добавлен таймлайн по просьбе пользователя: оформление линии и узлов переиспользует history-timeline.css из истории поездок. Пройденные уровни зелёные, текущий кобальтовый, следующие серые. Соединители учитывают произвольную высоту карточек и заканчиваются на последнем узле. Контрастная карточка текущего уровня и общие статусы сохранены.

30.10.2026 · Пользователь выбрал первый вариант выделения текущего уровня отеля: сплошная кобальтовая карточка #2F5BFF, белые подписи и полупрозрачные плашки выгод, зелёный статус «Ваш уровень». Таймлайн сохранён. Это заменяет прежнюю светлую заливку с синей рамкой; общие правила программы не меняются.

30.10.2026 · Уточнение карточек уровней отеля: подпись в сводке «Скидка» без «Ваша»; количество привилегий («1 привилегия» и подобное) в списке уровней не показывать. Полный список привилегий сохранён в BottomSheet детализации уровня. Проверены список и открытие подробностей в браузере.

30.10.2026 · В деталях программы отеля действие «Забронировать» закреплено снизу в общей app-footer вне MobileScroll; основной контент использует предусмотренный нижний отступ. Для неподключённой программы там же «Подключить карту». Дублирующая кнопка в содержимом удалена, маршруты сохранены.
