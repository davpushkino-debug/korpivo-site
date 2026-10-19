/* =========================================================
   ДАННЫЕ САЙТА — сорта, магазины, настройки.
   Здесь меняется почти всё, что меняется часто.
   Подробная инструкция — в файле README.md рядом с index.html.

   Сорт:
     id     — латиница без пробелов, уникальный (из него ссылка: сайт/#sort-id)
     name   — название на сайте
     kind   — подпись над названием («Светлое», «Тёмное · стаут»…)
     type   — для фильтра: light (светлое) | wheat (пшеничное) | dark (тёмное)
     color  — кружок цвета: straw | gold | amber | red | brown | wheat | dark
     filt   — варианты: ['f'] фильтрованное, ['u'] нефильтрованное, ['f','u'] оба
     alc    — крепость, %        og — плотность, %        ibu — горечь (можно '')
     desc   — короткое описание (в плитке)
     more   — подробное описание (в карточке), можно оставить ''
     malt, hops, yeast — состав (в карточке), можно ''
     label  — картинка в карточке (лэйбл или ценник): 'img/labels/имя.webp',
              или пара для двух вариантов: { f: '...-f.webp', u: '...-u.webp' } — в карточке появится переключатель Ф / НФ,
              или '' — тогда покажется пустая рамка
     badge  — плашка на плитке, например 'Новинка' или 'Сезонное' (можно не писать)
     star   — true, чтобы отметить звёздочкой (флагман, фирменный)
     ending — true: «последняя партия» — плитка серая, не открывается, стоит в конце и не входит в число сортов
     hidden — true, чтобы временно убрать сорт с сайта, не удаляя

   Крепость, плотность и фильтрация — строго по декларациям (гугл-таблица «Декларируемые сорта»).
   Срок годности официальный: фильтрованное 60 суток, нефильтрованное 30 (до и после вскрытия).
   ========================================================= */

window.SITE_DATA = {

  /* ---------- Настройки ---------- */
  settings: {
    // Номер счётчика Яндекс.Метрики (только цифры). Пока пусто — Метрика и плашка про cookie не показываются.
    metrika: '',
    // Куда отправляется форма заявки (скрипт на хостинге, см. README)
    formEndpoint: 'send.php',
    // Ссылка на папку Google Диска с ценниками для печати (доступ «Все, у кого есть ссылка»). Пусто — ссылку не показываем.
    tagsUrl: 'https://drive.google.com/drive/folders/1iLlo3JOmenP2RLshk9gzaWsE889FJzr1'  // временно — папка дизайнера
  },

  beers: [
    { id: 'braun-el', name: 'Браун эль', kind: 'Тёмное · коричневый эль', type: 'dark', color: 'brown', filt: ['f'], alc: '4,5', og: '10,5', ibu: '', badge: 'Новинка',
      desc: 'Коричневый эль английского типа: ореховые и карамельные ноты, мягкая хлебная сладость.',
      more: '', malt: '', hops: '', yeast: '', label: 'img/tags/braun-el.webp' },

    { id: 'bremenskoe', name: 'Бременское', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f'], alc: '4,5', og: '11,5', ibu: '', badge: 'Новинка',
      desc: 'Светлое пиво в северонемецкой традиции: чистый солодовый вкус и освежающая хмелевая горчинка.',
      more: '', malt: '', hops: '', yeast: '', label: 'img/labels/bremenskoe-f.webp' },

    { id: 'zhigulevskoe', name: 'Жигулевское', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f'], alc: '4', og: '11', ibu: '16–18',
      desc: 'Лёгкое светлое пиво классической рецептуры: мягкая солодовая основа и чистый финиш.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'avtorskoe', name: 'Авторское', kind: 'Светлое · фирменный рецепт', type: 'light', color: 'gold', filt: ['f'], alc: '4,5', og: '12', ibu: '16–18', star: true,
      desc: 'Рецепт нашего пивовара: округлый солодовый вкус и деликатная хмелевая горчинка.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select, Hersbrucker', yeast: 'S-23, низовое брожение', label: 'img/labels/avtorskoe-f.webp' },

    { id: 'klassicheskoe', name: 'Классическое', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f'], alc: '4', og: '11', ibu: '16–18',
      desc: 'Понятное светлое пиво с хлебными нотами и ровной горчинкой.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select, Жатецкий (Saaz)', yeast: 'S-23, низовое брожение', label: 'img/labels/klassicheskoe-f.webp' },

    { id: 'krasnoe-barkhatnoe', name: 'Красное бархатное', kind: 'Тёмное', type: 'dark', color: 'red', filt: ['f'], alc: '4,1', og: '12', ibu: '16–18',
      desc: 'Тёмное пиво с карамельными и слегка поджаренными нотами, мягкое и бархатистое.',
      more: '', malt: 'Меланоидиновый, карамельный 120–150, светлый пилснер', hops: 'Taurus, Saphir', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'yachmennoe', name: 'Ячменное', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f', 'u'], alc: '4', og: '11', ibu: '16–18',
      desc: 'Выраженный вкус ячменного солода и лёгкая сладость.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'pilsner', name: 'Пилснер', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f', 'u'], alc: '4,7', og: '12', ibu: '16–18',
      desc: 'Светлый лагер в чешско-немецкой традиции: травянистый хмель и сухое послевкусие.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: { f: 'img/labels/pilsner-f.webp', u: 'img/labels/pilsner-u.webp' } },

    { id: 'nemetskoe', name: 'Немецкое', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f', 'u'], alc: '4,5', og: '12', ibu: '16–18',
      desc: 'Немецкая школа: чистый солодовый профиль и умеренная горчинка.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: { f: 'img/labels/nemetskoe-f.webp', u: 'img/labels/nemetskoe-u.webp' } },

    { id: 'amberg', name: 'Амберг', kind: 'Светлое', type: 'light', color: 'gold', filt: ['f', 'u'], alc: '5,5', og: '14', ibu: '18–20',
      desc: 'Плотное светлое пиво с насыщенным солодовым телом и медово-хлебными оттенками.',
      more: '', malt: 'Премиум пилснер, Кара Клэр', hops: 'Perle, Mittelfrüh', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'bavarskoe', name: 'Баварское', kind: 'Светлое', type: 'light', color: 'gold', filt: ['f', 'u'], alc: '5', og: '13', ibu: '',
      desc: 'В баварском стиле: мягкое, солодовое, с лёгкой хмелевой свежестью.',
      more: '', malt: 'Авангард пилснер', hops: 'Tradition, Tettnanger', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'korolevskoe', name: 'Королёвское', kind: 'Светлое · флагман', type: 'light', color: 'gold', filt: ['f', 'u'], alc: '6', og: '14', ibu: '', star: true,
      desc: 'Названо в честь родного города: крепкое, плотное, с глубоким солодовым вкусом.',
      more: '', malt: 'Светлый пилснер', hops: 'Hallertauer Blanc, Mandarina Bavaria', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'hop-lager', name: 'Хоп лагер', kind: 'Светлое · охмелённый лагер', type: 'light', color: 'gold', filt: ['u'], alc: '6', og: '13', ibu: '', badge: 'Новинка',
      desc: 'Лагер с щедрым охмелением: цитрусовые и тропические ноты на чистой солодовой основе.',
      more: '', malt: 'Светлый ячменный, Авангард', hops: 'Mandarina Bavaria, Hallertauer Blanc, Motueka', yeast: 'S-34/70, низовое брожение', label: 'img/labels/hop-lager-u.webp' },

    { id: 'angliyskiy-el', name: 'Английский эль', kind: 'Светлое · эль', type: 'light', color: 'amber', filt: ['u'], alc: '4,7', og: '12', ibu: '',
      desc: 'Эль верхового брожения с фруктовыми нотами и выразительным хмелем.',
      more: '', malt: 'Пейл эль, светлый пилснер', hops: 'Nugget, Centennial, Citra, Chinook, Idaho, Mosaic', yeast: 'BRY-97, верховое брожение', label: '' },

    { id: 'khofer', name: 'Хофер', kind: 'Пшеничное', type: 'wheat', color: 'wheat', filt: ['u'], alc: '4,7', og: '13', ibu: '',
      desc: 'Пшеничное пиво с нотами банана и гвоздики, мягкое и освежающее.',
      more: '', malt: 'Светлый пилснер, пшеничный (Castle Malting)', hops: 'Perle, Saphir, Spalter Select', yeast: 'Munich Classic (Lallemand), верховое брожение', label: 'img/tags/khofer.webp' },

    { id: 'belgiyskoe-pshenichnoe', name: 'Бельгийское пшеничное', kind: 'Пшеничное', type: 'wheat', color: 'wheat', filt: ['u'], alc: '4,7', og: '13', ibu: '',
      desc: 'Пшеничное пиво бельгийской традиции: мягкое, с фруктовыми и пряными нотами.',
      more: '', malt: '', hops: '', yeast: '', label: '' },

    { id: 'temnoe', name: 'Темное', kind: 'Тёмное', type: 'dark', color: 'dark', filt: ['u'], alc: '4,1', og: '12', ibu: '16–18',
      desc: 'Тона жжёного солода, хлебной корочки и карамели.',
      more: '', malt: 'Пейл эль, карамельный 150, жжёный солод', hops: 'Magnum, Perle', yeast: 'S-23, низовое брожение', label: 'img/labels/temnoe-u.webp' },

    { id: 'cheshskoe-barnoe', name: 'Чешское барное', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f'], alc: '4', og: '11', ibu: '16–18',
      desc: 'Лёгкое пиво в духе чешских пивных: сбалансированное, с хмелевой ноткой.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select, Жатецкий (Saaz)', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'helles', name: 'Хеллес', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f'], alc: '5', og: '13', ibu: '18–20',
      desc: 'Мюнхенский светлый лагер: мягкий солод, деликатный хмель, чистый вкус.',
      more: '', malt: 'Премиум пилснер, Кара Клэр', hops: 'Perle, Mittelfrüh', yeast: 'S-23, низовое брожение', label: '' },

    { id: 'yantarnoe', name: 'Янтарное', kind: 'Светлое', type: 'light', color: 'amber', filt: ['f', 'u'], alc: '4,5', og: '12', ibu: '16–18',
      desc: 'Янтарный цвет, карамельные ноты и сбалансированная горчинка.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: { f: 'img/labels/yantarnoe-f.webp', u: 'img/labels/yantarnoe-u.webp' } },

    { id: 'cheshskoe', name: 'Чешское', kind: 'Светлое', type: 'light', color: 'straw', filt: ['f', 'u'], alc: '4,5', og: '12', ibu: '16–18',
      desc: 'Чешская традиция: благородный хмель и мягкая горечь.',
      more: '', malt: 'Светлый пилснер, бельгийский карамельный 100', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: { f: 'img/labels/cheshskoe-f.webp', u: 'img/labels/cheshskoe-u.webp' } },

    { id: 'zolotoe', name: 'Золотое', kind: 'Светлое', type: 'light', color: 'gold', filt: ['f', 'u'], alc: '5', og: '13', ibu: '18–20',
      desc: 'Золотистое пиво с медовыми солодовыми тонами и плотным телом.',
      more: '', malt: 'Премиум пилснер, Кара Клэр', hops: 'Perle, Mittelfrüh', yeast: 'S-23, низовое брожение', label: { f: 'img/labels/zolotoe-f.webp', u: 'img/labels/zolotoe-u.webp' } },

    { id: 'apa', name: 'АПА', kind: 'Светлое · эль', type: 'light', color: 'gold', filt: ['u'], alc: '6', og: '14', ibu: '50',
      desc: 'Американский светлый эль: яркий цитрусовый и хвойный аромат хмеля.',
      more: '', malt: 'Пейл эль', hops: 'Nugget, Centennial, Citra, Chinook, Idaho, Mosaic', yeast: 'BRY-97, верховое брожение', label: '' },

    { id: 'dipa', name: 'ДИПА', kind: 'Светлое · эль', type: 'light', color: 'amber', filt: ['u'], alc: '7,5', og: '18', ibu: '75–80',
      desc: 'Двойной ИПА: насыщенная хмелевая ароматика, плотное тело, выразительная горечь.',
      more: '', malt: 'Пейл эль, Кара Клэр, Кристал', hops: 'Magnum, Mosaic, Chinook, Simcoe, Cascade, Атанум', yeast: 'BRY-97, верховое брожение', label: '' },

    { id: 'chervonnoe', name: 'Червонное', kind: 'Светлое · эль', type: 'light', color: 'red', filt: ['u'], alc: '6', og: '14', ibu: '',
      desc: 'Красноватый отлив, карамельный солод и мягкая горчинка.',
      more: '', malt: 'Пейл эль, Кара Клэр, Кристал, светлый пилснер', hops: 'Magnum, Mosaic, Chinook, Simcoe, Cascade, Атанум', yeast: 'BRY-97, верховое брожение', label: '' },

    { id: 'vit-bir', name: 'Вит бир', kind: 'Пшеничное', type: 'wheat', color: 'wheat', filt: ['u'], alc: '4,7', og: '13', ibu: '',
      desc: 'Пшеничное пиво в бельгийском стиле: светлое, мутное, с пряными и цитрусовыми нотами.',
      more: '', malt: 'Светлый пилснер, пшеничный (Castle Malting)', hops: 'Perle, Saphir, Spalter Select', yeast: 'Munich Classic (Lallemand), верховое брожение', label: '' },

    { id: 'staut', name: 'Стаут', kind: 'Тёмное', type: 'dark', color: 'dark', filt: ['u'], alc: '6', og: '15', ibu: '', ending: true,
      desc: 'Тона кофе, горького шоколада и жареного ячменя.',
      more: '', malt: '', hops: '', yeast: '', label: '' },

    { id: 'shvartsbir', name: 'Шварцбир', kind: 'Тёмное', type: 'dark', color: 'dark', filt: ['u'], alc: '4,7', og: '13', ibu: '',
      desc: 'Немецкое чёрное пиво: тёмное по цвету, но лёгкое, с нотами какао и поджаренного хлеба.',
      more: '', malt: 'Wheat Black, Crystal, Pale Ale', hops: 'Magnum, Spalter Select', yeast: 'S-23, низовое брожение', label: '' }
  ],

  /* Магазины.
     coords — «широта, долгота», как их показывают Яндекс Карты
     (правый клик по точке → «Что здесь?» → скопировать цифры).
     note — подпись под адресом (часы работы, «заводской магазин» и т. п.). */
  shops: [
    { city: 'Королёв', address: 'ул. Терешковой, 14', note: 'Заводской магазин', coords: '55.914499, 37.811977' },
    { city: 'Пушкино', address: 'ул. Соколовская, 17', note: 'Заводской магазин', coords: '55.985424, 37.858843' },
    { city: 'Пушкино, мкр. Клязьма', address: 'ул. Тургеневская, 1', note: 'Заводской магазин', coords: '55.97792, 37.819825' }
  ]
};
