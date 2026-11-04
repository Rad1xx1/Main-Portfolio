# Image Gen — бриф и итоговые ассеты

Использован встроенный `image_gen.imagegen`, без CLI/API и без внешних ключей. Результаты сохранены в проекте. Все изображения иллюстративные.

## Набор концепций

1. `concept-hero.png`, 1505×1045. UI mockup Coffee Original Almaty: ivory #f4f0e8, espresso #33271f, terracotta #a45135, Georgia-like Cyrillic serif и Manrope-like sans. Открытая композиция hero 44/56, слово-знак, три ссылки навигации, заголовок «Твой день. Твой кофе. Твой Original.», две CTA, editorial photo капучино и круассана, нижняя полоса. Без hero-eyebrow, фальшивых рейтингов, цен, отзывов и сертификационных обещаний.
2. `concept-menu-atmosphere.png`, 1435×1096. Координированный средний раздел: «С чего начнётся твой день?», три колонки Кофе / Завтраки / Десерты, переход к меню и оговорка о филиалах; затем olive-gray полоса с иллюстрацией интерьера, заголовком «Место для твоего ритма.», Wi-Fi и отсутствием фоновой музыки. Фото без цветного оверлея.
3. `concept-branches.png`, 1469×1071. Финальный раздел: «Твой Original — рядом.», фильтры Все / Only for Women, поиск адреса, список филиалов, выбранная кофейня, запрос брони и маршрут, тёмный подвал с Instagram/приложением и пометкой о демо. Без выдуманной карты.

## Итоговые промпты рабочих ассетов

### coffee-morning.webp

Reference: `concept-hero.png`.

Use case precise-object-edit / standalone website photo asset. Using the reference website concept, recreate ONLY the hero photograph as a high-resolution standalone editorial photo, landscape 4:3. White ceramic cappuccino cup and saucer, perfect rosetta latte art in front lower center, golden flaky croissant on white plate behind right, brown walnut cafe table, warm natural sunlight entering left, quiet contemporary cafe soft bokeh behind. Match the image in the right half of reference closely, same lighting, viewpoint, objects, materials and colors. Fill entire output with photograph. Remove ALL website UI, headings, captions, borders, layout, logos, watermarks, words, buttons. No overlaid text. This is an illustrative cafe image for a demo site, not a factual photograph of a specific venue. Natural photoreal food photography, no color tint or gradient overlay.

### quiet-interior.webp

Reference: `concept-menu-atmosphere.png`.

Use case precise-object-edit / standalone editorial website asset. Recreate ONLY the cafe interior photograph shown in bottom left of the reference website concept. Output landscape 4:3 full-frame photoreal cafe interior. Match the exact quiet contemporary cafe, warm sunlight from tall left windows, walnut round tables and chairs with oatmeal textured upholstery, plants/olive trees near windows, beige plaster walls, pendant lights, shelves and cushioned banquette in background. Natural architectural photography, subtly cinematic, material detail. No people. Remove ALL website layout, all letters, UI, text, logos, labels, borders, frame, watermark. Fill entire image with the interior photo. No gradients or color overlays. This is an illustrative interior concept, not an actual photograph of Coffee Original.

Из PNG результатов созданы WebP 1448×1086 с качеством 88. Непрозрачный фон сохранён. UI выполнен HTML/CSS, скриншоты концептов в интерфейсе не используются.
