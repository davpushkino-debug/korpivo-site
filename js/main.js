(function () {
  'use strict';
  var root = document.documentElement;
  var DATA = window.SITE_DATA || { beers: [], shops: [], settings: {} };
  var SETTINGS = DATA.settings || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Экранирование текста из data.js перед вставкой в HTML */
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  /* Неразрывный пробел после коротких слов («в», «и», «с»…), чтобы они не висели в конце строки */
  var typo = function (s) {
    return s.replace(/(^|[\s(«])([а-яёА-ЯЁ]{1,2})\s/g, '$1$2 ').replace(/(^|[\s(«])([а-яёА-ЯЁ]{1,2})\s/g, '$1$2 ');
  };
  /* 1 сорт, 2 сорта, 5 сортов */
  var plural = function (n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
  /* Яндекс.Метрика: цель, если счётчик подключён */
  var goal = function (name) {
    if (window.ym && SETTINGS.metrika) window.ym(Number(SETTINGS.metrika), 'reachGoal', name);
  };

  var FILT = { f: 'Фильтрованное', u: 'Нефильтрованное' };
  var SHELF = { f: '60 суток', u: '30 суток' };

  /* ---------- Всплывающее сообщение ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  var toast = function (html) {
    if (!toastEl) return;
    // открытое окно (карточка сорта) лежит поверх страницы — показываем сообщение внутри него
    var host = document.querySelector('dialog[open]') || document.body;
    if (toastEl.parentNode !== host) host.appendChild(toastEl);
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-on');
      setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 5000);
  };

  /* ---------- Возрастное подтверждение ---------- */
  var pendingSort = null;
  var age = document.getElementById('age');
  if (age) {
    age.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-age]');
      if (!btn) return;
      if (btn.dataset.age === 'yes') {
        root.classList.add('age-ok');
        try { localStorage.setItem('age-ok', '1'); } catch (err) {}
        if (pendingSort) { openSort(pendingSort); pendingSort = null; }
      } else {
        age.querySelector('.age__deny').hidden = false;
        age.querySelector('.age__actions').hidden = true;
      }
    });
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var closeNav = function () {
    if (!nav) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
  }

  /* ---------- Логотип в шапке — наверх ----------
     Шапка «липкая», поэтому якорь на ней самой никуда не прокручивал. */
  document.querySelectorAll('[data-to-top]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeNav();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  /* ---------- Телефонные ссылки на компьютере ----------
     На телефоне tel: сразу звонит. На компьютере браузеру обычно нечем звонить,
     поэтому копируем номер и показываем его крупно. */
  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
      document.body.removeChild(ta);
    });
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="tel:"]');
    if (!a) return;
    goal('phone_click');
    if (!isDesktop || a.hasAttribute('data-tel-raw')) return;
    e.preventDefault();
    var raw = a.getAttribute('href').slice(4);
    var pretty = raw.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 $1 $2-$3-$4');
    var show = function (copied) {
      toast('<b>' + esc(pretty) + '</b><span>' + (copied ? 'Номер скопирован. ' : '') +
        'Звоните с телефона или <a href="tel:' + esc(raw) + '" data-tel-raw>через приложение на компьютере</a></span>');
    };
    copyText(pretty).then(function () { show(true); }, function () { show(false); });
  });

  /* ---------- Ссылка на ценники для печати (Google Диск) ---------- */
  var tagsLink = document.getElementById('tags-link');
  if (tagsLink && SETTINGS.tagsUrl) {
    tagsLink.href = SETTINGS.tagsUrl;
    tagsLink.hidden = false;
    tagsLink.addEventListener('click', function () { goal('tags_open'); });
  }

  /* ---------- Линия под шапкой при прокрутке ---------- */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Плитки сортов (из data.js) ---------- */
  // ending — «последняя партия»: показываем в конце серым, карточку не открываем и в число сортов не включаем
  var beersData = DATA.beers.filter(function (b) { return !b.hidden && !b.ending; });
  var endingData = DATA.beers.filter(function (b) { return !b.hidden && b.ending; });
  var byId = {};
  beersData.forEach(function (b) { byId[b.id] = b; });

  /* Число сортов в текстах: {n} — число, {сорта}/{сортов} — слово в нужной форме */
  var n = beersData.length;
  document.querySelectorAll('[data-count]').forEach(function (el) {
    el.innerHTML = el.dataset.count
      .replace(/\{n\}/g, n)
      .replace(/\{сорт[а-я]*\}/g, plural(n, 'сорт', 'сорта', 'сортов'));
  });

  var grid = document.getElementById('beer-grid');
  if (grid) {
    var tile = function (b) {
      var end = !!b.ending;
      var badge = end ? 'Последняя партия' : b.badge;
      return '<article class="beer' + (b.star ? ' beer--star' : '') + (end ? ' beer--ending' : '') + '" data-id="' + esc(b.id) + '" data-type="' + esc(b.type) + '" data-filt="' + esc(b.filt.join(' ')) + '" data-new="' + (b.badge === 'Новинка' && !end ? 1 : 0) + '">' +
        (badge ? '<p class="beer__badge">' + esc(badge) + '</p>' : '') +
        '<p class="beer__kind"><i style="--c:var(--t-' + esc(b.color) + ')"></i>' + esc(b.kind) + '</p>' +
        '<h3 class="beer__name">' + (end ? esc(b.name) : '<button type="button" class="beer__open" aria-haspopup="dialog">' + esc(b.name) + '</button>') + '</h3>' +
        '<p class="beer__desc">' + esc(typo(end ? 'Больше не варим — остатки в продаже, пока не закончатся.' : b.desc)) + '</p>' +
        '<p class="beer__spec"><span>Алк. <b>' + esc(b.alc) + ' %</b></span><span>Пл. <b>' + esc(b.og) + ' %</b></span>' +
          (b.ibu ? '<span>IBU <b>' + esc(b.ibu) + '</b></span>' : '') + '</p>' +
        '<p class="beer__var">' + b.filt.map(function (f) { return '<span>' + FILT[f] + '</span>'; }).join('') + '</p>' +
        (end ? '' : '<p class="beer__more" aria-hidden="true">Подробнее<span>→</span></p>') +
        '</article>';
    };
    grid.innerHTML = beersData.map(tile).join('') + endingData.map(tile).join('');

    /* Фильтр */
    var state = { type: 'all', filt: 'all' };
    var beers = grid.querySelectorAll('.beer');
    var countEl = document.getElementById('beer-count');
    var emptyEl = document.getElementById('beer-empty');

    var apply = function () {
      var shown = 0;
      beers.forEach(function (b) {
        var ok = (state.type === 'all' || b.dataset.type === state.type || (state.type === 'new' && b.dataset.new === '1')) &&
                 (state.filt === 'all' || b.dataset.filt.split(' ').indexOf(state.filt) !== -1);
        b.hidden = !ok;
        if (ok && !b.classList.contains('beer--ending')) shown++;
      });
      countEl.textContent = shown;
      emptyEl.hidden = shown !== 0;
    };
    apply();

    document.querySelectorAll('.filters__group').forEach(function (group) {
      group.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        group.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        state[group.dataset.filter] = chip.dataset.value;
        apply();
      });
    });

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.beer');
      if (card && !card.classList.contains('beer--ending')) openSort(card.dataset.id);
    });
  }

  /* ---------- Карточка сорта ---------- */
  var dlg = document.getElementById('sort');
  var currentId = null;
  var lastFocus = null;

  var visibleIds = function () {
    var cards = grid ? grid.querySelectorAll('.beer:not([hidden]):not(.beer--ending)') : [];
    return Array.prototype.map.call(cards, function (c) { return c.dataset.id; });
  };

  var tagPlaceholder = '<div class="sort__ph"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 14h8l3-5h10l3 5h8v24H8z"/><circle cx="24" cy="26" r="7"/></svg><p>Этикетка<br>скоро появится</p></div>';

  var fill = function (b) {
    document.getElementById('sort-kind').innerHTML = '<i style="--c:var(--t-' + esc(b.color) + ')"></i>' + esc(b.kind) +
      (b.badge ? '<em class="beer__badge">' + esc(b.badge) + '</em>' : '');
    document.getElementById('sort-name').textContent = b.name;
    document.getElementById('sort-name').classList.toggle('is-star', !!b.star);

    var text = '<p>' + esc(typo(b.desc)) + '</p>';
    if (b.more) text += b.more.split(/\n\s*\n/).map(function (p) { return '<p>' + esc(typo(p.trim())) + '</p>'; }).join('');
    document.getElementById('sort-desc').innerHTML = text;

    document.getElementById('sort-spec').innerHTML =
      '<div><dt>Крепость</dt><dd>' + esc(b.alc) + ' %</dd></div>' +
      '<div><dt>Плотность</dt><dd>' + esc(b.og) + ' %</dd></div>' +
      '<div><dt>Горечь, IBU</dt><dd>' + (b.ibu ? esc(b.ibu) : '—') + '</dd></div>' +
      b.filt.map(function (f) { return '<div class="wide"><dt>' + FILT[f] + '</dt><dd>срок годности ' + SHELF[f] + '</dd></div>'; }).join('');

    var recipe = [['Солод', b.malt], ['Хмель', b.hops], ['Дрожжи', b.yeast]].filter(function (r) { return r[1]; });
    var recipeEl = document.getElementById('sort-recipe');
    recipeEl.hidden = !recipe.length;
    recipeEl.innerHTML = recipe.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');

    /* Картинка: одна строка или пара { f, u } — тогда переключатель Ф / НФ */
    var tagBox = document.getElementById('sort-tag');
    var lbl = b.label;
    var variants = !lbl ? [] : typeof lbl === 'string' ? [[b.filt[0], lbl]]
      : b.filt.filter(function (f) { return lbl[f]; }).map(function (f) { return [f, lbl[f]]; });
    if (!variants.length) { tagBox.innerHTML = tagPlaceholder; return; }

    tagBox.innerHTML = '<a target="_blank" rel="noopener" title="Открыть крупно"><img alt=""></a>' +
      (variants.length > 1 ? '<div class="sort__switch">' + variants.map(function (v, i) {
        return '<button type="button" data-variant="' + i + '">' + FILT[v[0]] + '</button>';
      }).join('') + '</div>' : '');
    var link = tagBox.querySelector('a'), img = tagBox.querySelector('img');
    img.addEventListener('error', function () { tagBox.innerHTML = tagPlaceholder; });
    var showVariant = function (i) {
      link.href = img.src = variants[i][1];
      img.alt = 'Этикетка сорта «' + b.name + '», ' + FILT[variants[i][0]].toLowerCase();
      tagBox.querySelectorAll('[data-variant]').forEach(function (x) { x.classList.toggle('is-on', +x.dataset.variant === i); });
    };
    tagBox.onclick = function (e) {
      var v = e.target.closest('[data-variant]');
      if (v) showVariant(+v.dataset.variant);
    };
    // если в фильтре выбрано «Нефильтрованное» — сразу показываем этот вариант
    var pref = typeof state !== 'undefined' ? state.filt : 'all';
    var start = 0;
    variants.forEach(function (v, i) { if (v[0] === pref) start = i; });
    showVariant(start);
  };

  var openSort = function (id) {
    var b = byId[id];
    if (!b || !dlg) return;
    if (!root.classList.contains('age-ok')) { pendingSort = id; return; }
    currentId = id;
    fill(b);
    history.replaceState(null, '', '#sort-' + id);
    if (!dlg.open) {
      lastFocus = document.activeElement;
      root.classList.add('sort-open');
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      goal('sort_open');
    }
    dlg.querySelector('.sort__in').scrollTop = 0;
    dlg.querySelector('.sort__body').scrollTop = 0;
  };

  var closeSort = function () {
    if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); onClosed(); }
  };
  var onClosed = function () {
    root.classList.remove('sort-open');
    if (location.hash.indexOf('#sort-') === 0) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    currentId = null;
  };

  if (dlg) {
    dlg.addEventListener('close', onClosed);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-sort-close]')) { closeSort(); return; }
      if (e.target.closest('[data-sort-order]')) {
        var name = byId[currentId] && byId[currentId].name;
        lastFocus = null;
        closeSort();
        orderFor(name);
        return;
      }
      var step = e.target.closest('[data-sort-step]');
      if (step) {
        var ids = visibleIds();
        if (ids.indexOf(currentId) === -1) ids = beersData.map(function (b) { return b.id; });
        var i = ids.indexOf(currentId) + parseInt(step.dataset.sortStep, 10);
        openSort(ids[(i + ids.length) % ids.length]);
      }
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        dlg.querySelector('[data-sort-step="' + (e.key === 'ArrowRight' ? 1 : -1) + '"]').click();
      }
    });

    /* Ссылка вида сайт/#sort-zhigulevskoe сразу открывает карточку */
    var fromHash = function () {
      var m = location.hash.match(/^#sort-(.+)$/);
      if (m && byId[decodeURIComponent(m[1])]) openSort(decodeURIComponent(m[1]));
    };
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- Заявка от магазина ---------- */
  var form = document.getElementById('order-form');
  var orderFor = function (sortName) {
    var order = document.getElementById('order');
    if (!order) return;
    if (sortName && form) {
      var c = form.elements.comment;
      var line = 'Интересует: ' + sortName;
      if (c.value.indexOf(sortName) === -1) c.value = c.value ? c.value + '\n' + line : line;
    }
    order.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { form && form.elements.shop.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  };

  if (form) {
    var statusEl = document.getElementById('order-status');
    var startedAt = Date.now();
    var setStatus = function (text, kind) {
      statusEl.textContent = text;
      statusEl.className = 'form__status' + (kind ? ' is-' + kind : '');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = form.elements;
      var bad = ['shop', 'name', 'phone'].filter(function (k) { return !el[k].value.trim(); });
      if (el.phone.value && el.phone.value.replace(/\D/g, '').length < 10) bad.push('phone');
      form.querySelectorAll('.is-bad').forEach(function (x) { x.classList.remove('is-bad'); });
      bad.forEach(function (k) { el[k].closest('.form__field').classList.add('is-bad'); });
      if (bad.length) { setStatus('Заполните название, имя и телефон.', 'err'); el[bad[0]].focus(); return; }
      if (!el.agree.checked) { setStatus('Нужно согласие на обработку данных.', 'err'); el.agree.focus(); return; }

      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      setStatus('Отправляем…');
      var body = new FormData(form);
      body.append('elapsed', String(Math.round((Date.now() - startedAt) / 1000)));

      fetch(SETTINGS.formEndpoint || 'send.php', { method: 'POST', body: body })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error || 'fail');
          form.reset();
          setStatus('Спасибо! Заявка отправлена — скоро перезвоним.', 'ok');
          goal('order_sent');
        })
        .catch(function () {
          setStatus('Не получилось отправить. Позвоните нам: +7 985 548-63-46 или напишите на kpk.korolev@list.ru', 'err');
        })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ---------- Фото производства ---------- */
  var gallery = document.getElementById('gallery');
  var photo = document.getElementById('photo');
  if (gallery && photo && photo.showModal) {
    var shots = Array.prototype.slice.call(gallery.querySelectorAll('a'));
    var photoImg = document.getElementById('photo-img');
    var shotIdx = 0;
    var showShot = function (i) {
      shotIdx = (i + shots.length) % shots.length;
      photoImg.src = shots[shotIdx].getAttribute('href');
      photoImg.alt = shots[shotIdx].querySelector('img').alt;
    };
    gallery.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      showShot(shots.indexOf(a));
      root.classList.add('sort-open');
      photo.showModal();
    });
    photo.addEventListener('close', function () { root.classList.remove('sort-open'); });
    photo.addEventListener('click', function (e) {
      if (e.target === photo || e.target.closest('[data-photo-close]')) { photo.close(); return; }
      var s = e.target.closest('[data-photo-step]');
      if (s) showShot(shotIdx + parseInt(s.dataset.photoStep, 10));
    });
    photo.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') showShot(shotIdx + 1);
      if (e.key === 'ArrowLeft') showShot(shotIdx - 1);
    });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Магазины и карта (Яндекс Карты, без ключа API) ---------- */
  var shopList = document.getElementById('shops');
  var mapEl = document.getElementById('map');
  if (shopList && mapEl) {
    var shops = (DATA.shops || []).map(function (s) {
      var c = s.coords.split(',').map(function (x) { return parseFloat(x); });
      return { s: s, lat: c[0], lon: c[1] };
    });
    /* все точки: pm2rdl1 — красная метка с номером 1 и т. д. */
    var pts = shops.map(function (p, i) { return p.lon + ',' + p.lat + ',pm2rdl' + (i + 1); }).join('~');
    var widget = function (lon, lat, z) {
      return 'https://yandex.ru/map-widget/v1/?ll=' + (+lon).toFixed(6) + ',' + (+lat).toFixed(6) + '&z=' + z + '&pt=' + pts;
    };
    var overview = function () {
      if (!shops.length) return widget(37.83, 55.94, 10);
      var lats = shops.map(function (p) { return p.lat; }), lons = shops.map(function (p) { return p.lon; });
      var span = Math.max(Math.max.apply(null, lats) - Math.min.apply(null, lats), (Math.max.apply(null, lons) - Math.min.apply(null, lons)) / 1.8);
      var z = span < .02 ? 14 : span < .05 ? 13 : span < .1 ? 12 : span < .2 ? 11 : 10;
      return widget((Math.min.apply(null, lons) + Math.max.apply(null, lons)) / 2, (Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2, z);
    };

    shopList.innerHTML = shops.map(function (p, i) {
      var ya = 'https://yandex.ru/maps/?pt=' + p.lon + ',' + p.lat + '&z=17&l=map';
      return '<li>' +
        '<button type="button" data-shop="' + i + '"><i>' + (i + 1) + '</i><b>' + esc(p.s.city) + '</b><span>' + esc(p.s.address) + '</span>' +
        (p.s.note ? '<small>' + esc(p.s.note) + '</small>' : '') + '</button>' +
        '<a href="' + esc(ya) + '" target="_blank" rel="noopener">Открыть в Яндекс Картах ↗</a></li>';
    }).join('');

    var frame = document.createElement('iframe');
    frame.title = 'Карта магазинов';
    frame.loading = 'lazy';
    frame.allowFullscreen = true;
    frame.src = overview();
    mapEl.innerHTML = '';
    mapEl.appendChild(frame);

    shopList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-shop]');
      if (!btn) return;
      var i = +btn.dataset.shop;
      var li = btn.closest('li');
      var on = !li.classList.contains('is-on');
      shopList.querySelectorAll('li').forEach(function (x) { x.classList.toggle('is-on', x === li && on); });
      frame.src = on ? widget(shops[i].lon, shops[i].lat, 16) : overview();
      if (window.matchMedia('(max-width: 900px)').matches) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- Яндекс.Метрика (только после согласия на cookie) ---------- */
  var cookieBox = document.getElementById('cookie');
  var loadMetrika = function () {
    var id = Number(SETTINGS.metrika);
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  };
  if (SETTINGS.metrika && cookieBox) {
    var choice = null;
    try { choice = localStorage.getItem('cookie-ok'); } catch (err) {}
    if (choice === '1') loadMetrika();
    else if (choice !== '0') cookieBox.hidden = false;
    cookieBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      var yes = b.dataset.cookie === 'yes';
      try { localStorage.setItem('cookie-ok', yes ? '1' : '0'); } catch (err) {}
      cookieBox.hidden = true;
      if (yes) loadMetrika();
    });
  }
})();
