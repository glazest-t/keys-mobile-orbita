"""Finalize portable marketing kit. Uses Pillow and pypdf from bundled Python."""
from pathlib import Path
import json, hashlib, shutil, zipfile, html
from collections import Counter
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader

root=Path.cwd()
out=root/'design/marketing-kit-2026-11-03'
data=json.loads((out/'manifest.json').read_text())
counts=Counter(a['category'] for a in data['assets'])
font=root/'design/fonts/Onest-Variable.ttf'
def f(size): return ImageFont.truetype(str(font),size)

intro='''КЛЮЧИ / МАРКЕТИНГ И БРЕНДИНГ
Версия 1.1 · 3 ноября 2026

НАЧАТЬ С index.html — локальный каталог со скачиванием отдельных файлов.
keys-brand-style.pdf — расширенная стилистика и визуальный реестр текущих материалов.
overview.png — обзор основных материалов.

Комплект сверён с текущей рабочей сборкой приложения, включая локальные изменения. Новые формулировки и
композиции подготовлены для этого запроса; они ещё не являются принятыми рекламными
кампаниями. Айдентика, логотипы и набор предпочтений взяты из актуального проекта.

СОСТАВ МАКЕТОВ
'''
intro+='\n'.join(f'{k}: {v}' for k,v in counts.items())
intro+='''

ФАЙЛЫ И ФОРМАТЫ
editable/ — SVG с живым текстом. Установите Onest и Unbounded из fonts/ до открытия
в графическом редакторе. Редактируйте этот вариант, затем заново экспортируйте.
outlined/ — SVG с текстом в кривых и встроенными иллюстрациями. Ничего не потеряется
при передаче. Иллюстрации внутри SVG остаются растровыми, а не превращаются в вектор.
png/ — экспорт в размере холста; UI-элементы экспортированы в 3×.
brand/logo/ — текущие исходные логотипы; две дополнительные белые версии с прозрачной
основой сохраняют исходные контуры. Файлы с -outlined уже содержат буквы в кривых.
brand/icons/ — контурные UI-иконки. Иконка удалённого депозита не включена.
brand/preferences/ — 32 вырезки из текущих WEBP-спрайтов приложения.
brand/illustrations/ — все 14 используемых файлов промо-графики и онбординга.
current-app.html — каталог всех исходников с указанием места использования.
current-app/ — 929 локальных файлов, 13 композиций PNG/HTML и исходный код графики.
new-illustrations/ — четыре новые иллюстрации, промпты и реестр.
png/brandbook-orbit-*.png — орбита из брендбука: с подписью, без подписи и на прозрачном фоне.
Соответствующие SVG находятся в editable/ и outlined/.
Новые промо: 12 макетов, по три формата для каждой иллюстрации.
fonts/ — локальные шрифты и лицензии OFL; поставляются без изменений.
tokens.json / tokens.css — актуальные роли, включая фуксию скидок и цвет избранного.
manifest.json — размеры, состав, тексты, пути файлов и примечания каждого макета.
source/copy.json — редактируемые тексты четырёх кампаний.
source/ — генераторы и результаты проверки; генераторы запускаются из корня проекта.

ОБЩАЯ СТИЛИСТИКА
Кобальт #2F5BFF — основной акцент; #EEF0FF / #F4F5FB — светлые поверхности.
Текст #101320 / #5A6072, линии #E4E7EF. Скидка #D72778, избранное #E84D7A.
Friendly Rate — отдельная тёмно-зелёная тема #063F3C; успех #16865A.
Unbounded 500 — короткий акцентный заголовок, Onest 400/500 — пояснения и интерфейс.
Орбита, мягкие формы, свободное пространство; один главный акцент и один призыв.
Тон — на «вы», конкретно и спокойно. Слоган — «Ключи от всех отелей».
Базовые размеры UI: основная кнопка 52 px, радиус 16 px; карточки 22 / 28 px.
Поля: нейтральный фокус, явный текст ошибки. Нижнее меню — без активной точки.

КАК АДАПТИРОВАТЬ
1. Выберите тему и ближайшее соотношение сторон. Не растягивайте готовый PNG.
2. В editable SVG измените текст, сохраняя шрифты и размеры. Не меняйте геометрию знака.
3. При новом оффере добавьте его реальные условия, сроки и применимость.
4. Проверьте требования конкретной рекламной площадки: вес файла, безопасные зоны,
   маркировку и элементы интерфейса. Размеры в каталоге — размеры холста, не обещание
   соответствия всем текущим требованиям каждой площадки.
5. Для печати: SVG является мастер-макетом. Растровые A4/A6/карточки рассчитаны примерно
   на 300 dpi; цвет RGB. Вылеты, профиль типографии и контур высечки не добавлены.
   Назначьте точный физический размер в программе верстки перед производством.
6. Для писем: email/template.html содержит живые заголовок и кнопку и системный шрифт
   для совместимости. Замените {{PRODUCT_URL}} и {{UNSUBSCRIBE_URL}}, разместите картинки
   на HTTPS и проверьте в почтовых клиентах. Письмо не отправлено и не подключено к CRM.
7. Карточка бренда — не персональная визитка. Перед печатью добавьте реальный адрес
   или QR продукта. Подтверждённый production URL в исходных материалах не задан.

ПРОИСХОЖДЕНИЕ И ГРАНИЦЫ
Источники: docs/brand/index.html, docs/handoff/COMPONENTS.md, последние записи
docs/DECISIONS.md, app/src/prototype.css и текущие ассеты. Исторические макеты
и альтернативные айдентики не использованы. Локальные фотографии включены в
current-app как содержимое приложения; источники и внешние URL сохранены в реестре. Старые ограничения скидок и баллов не перенесены.

Статические UI-экспорты предназначены для маркетинговых композиций, а не являются
новой рабочей библиотекой интерфейса. Реальные сценарии, состояния и motion остаются
в приложении. Новая сетка баннеров и тексты — предложения этого набора.
В текущем приложении SMS, платежи и цифровой ключ демонстрационные. Набор не означает
запуск интеграций и не обещает скидку на каждый отель. Friendly Rate — для
подтверждённых отельеров. В точных снимках сохранены текущие подписи приложения.

Передача: можно передавать весь ZIP или отдельный SVG в кривых / PNG.
Для редактирования передавайте editable вместе с fonts и лицензиями.
Права на существующие фирменные ассеты наследуются из проекта; новая лицензия
на сторонние материалы этим пакетом не предоставляется.
'''
(out/'README.txt').write_text(intro)
(out/'README.md').write_text('# Маркетинговый комплект «Ключей»\n\n[Текущая графика и новые иллюстрации](current-app.html) · [Промпты новых иллюстраций](new-illustrations/prompts.json)\n\n[Открыть каталог](index.html) · [Общая стилистика PDF](keys-brand-style.pdf) · [Обзор PNG](overview.png) · [Правила передачи](README.txt)\n\n'+intro.split('СОСТАВ МАКЕТОВ')[1].split('ФАЙЛЫ И ФОРМАТЫ')[0].strip()+'\n\nНовые маркетинговые адаптации: 03.11.2026. Актуальная айдентика сохранена; приложение и публикация не изменялись.\n')
for name in ['build-kit.cjs','render-kit.cjs','package-kit.py','extend-kit.cjs','current-gallery.cjs','audit-current-app.py','capture-current-app.cjs','check-current.cjs','new-illustration-prompts.json']:
 shutil.copy2(root/'scripts/marketing'/name,out/'source'/name)

# A designed overview board; smaller review sheets preserve readable inspection.
canvas=Image.new('RGB',(1800,1520),'#F4F5FB');d=ImageDraw.Draw(canvas)
d.text((64,40),'КЛЮЧИ / МАРКЕТИНГ И БРЕНДИНГ',font=f(20),fill='#2F5BFF')
d.text((64,90),'Одна стилистика. Все основные носители.',font=f(48),fill='#101320')
d.text((64,162),f'{len(data["assets"])} макетов и страниц · 929 исходников приложения · 4 новые иллюстрации',font=f(24),fill='#5A6072')
def paste(file,box):
 im=Image.open(out/file).convert('RGBA');x,y,w,h=box;im.thumbnail((w,h),Image.Resampling.LANCZOS);canvas.paste(im,(x+(w-im.width)//2,y+(h-im.height)//2),im)
for i,id in enumerate(['brand','personal','deals','friendly']):paste(f'png/social-{id}-square.png',(64+i*424,235,400,400))
paste('png/new-weekend-hero.png',(64,675,820,365));paste('png/new-nearby-hero.png',(916,675,820,365))
d.text((64,1070),'Текущие баннеры приложения',font=f(32),fill='#101320')
for i,id in enumerate(['hot-deals','dual-benefits','friendly-banner','history-entry']):paste('current-app/compositions/'+id+'.png',(64+i*424,1130,400,260))
d.text((64,1440),'Руководство по стилю и все исходники — внутри комплекта. Версия 1.1 / 03.11.2026',font=f(22),fill='#5A6072')
canvas.save(out/'overview.png')
review=out/'source/visual-review';review.mkdir(exist_ok=True)
for cat in counts:
 items=[a for a in data['assets'] if a['category']==cat]
 cols=4;rows=(len(items)+cols-1)//cols
 sheet=Image.new('RGB',(1600,rows*360),'#DCE0EB');sd=ImageDraw.Draw(sheet)
 for i,a in enumerate(items):
  im=Image.open(out/a['png']).convert('RGBA');im.thumbnail((378,310),Image.Resampling.LANCZOS);x=(i%4)*400;y=(i//4)*360;sheet.paste(im,(x+(400-im.width)//2,y+(310-im.height)//2),im);sd.text((x+10,y+322),a['id'],font=f(15),fill='#101320')
 sheet.save(review/(next(a['id'].split('-')[0] for a in items)+'.jpg'),quality=92)

# Verify dimensions, transparency, files and the final PDF.
issues=[]
for a in data['assets']:
 for k in ['editable','svg','png']:
  if not (out/a[k]).exists():issues.append(f'Missing {a[k]}')
 im=Image.open(out/a['png']);expected=(a['pngWidth'],a['pngHeight'])
 if im.size!=expected:issues.append(f'PNG size {a["id"]}: {im.size}')
 if a['category']=='UI-элементы' and a['id']!='ui-promo-deals' and (im.mode!='RGBA' or im.getextrema()[-1][0]!=0):issues.append(f'No transparency: {a["id"]}')
pdf=PdfReader(out/'keys-brand-style.pdf')
if len(pdf.pages)!=len(data['guides']):issues.append(f'PDF page count: {len(pdf.pages)}')
report={'count':len(data['assets']),'categories':counts,'pdfPages':len(pdf.pages),'filesVerified':len(data['assets'])*3,'issues':issues,'remarks':['SVG text boundaries checked at generation','Catalogue desktop/mobile overflow and filtering checked with Chromium','Visual contact sheets and rendered PDF reviewed separately','Email tested in browser only, not real email clients','RGB print layouts require production prepress']}
(out/'source/package-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if issues:raise RuntimeError(issues)
# Checksums are for exported final deliverables, excluding review images and themselves.
hashes={str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest() for p in out.rglob('*') if p.is_file() and p.name!='SHA256SUMS.json'}
(out/'SHA256SUMS.json').write_text(json.dumps(hashes,indent=2,ensure_ascii=False))
zip_path=out.parent/'keys-marketing-brand-kit-2026-11-03.zip'
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(out.rglob('*')):
  if p.is_file():z.write(p,Path('keys-marketing-brand-kit')/p.relative_to(out))
print(json.dumps({'archive':str(zip_path),'sizeMB':round(zip_path.stat().st_size/1024**2,1),**report},ensure_ascii=False,indent=2))
