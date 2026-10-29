/* =====================================================================
   PIM · Parque Industrial Minero — comportamiento
   ===================================================================== */
(function () {
  'use strict';
  var D = window.PIM_DATA || {}, C = D.config || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var lang = 'es';

  /* ══════════ Pantalla de carga ══════════
     Mismo criterio que las otras webs de ZLT (Nodo, Álamos): se queda hasta que TODAS
     las imágenes están decodificadas, las fuentes listas y el video del hero puede
     reproducirse sin cortes. La barra muestra el avance real. Tope de seguridad: 90 s.
     Con login (gate.js): mientras el login está en pantalla no termina la carga; al
     ingresar se ve la pantalla de carga hasta que todo esté listo. */
  var GATE = new Promise(function (r) {
    function ok() { try { return sessionStorage.getItem('zlt_gate_ok') === '1'; } catch (e) { return true; } }
    if (!window.__PIM_GATE || ok()) return r();
    (function chk() { if (ok() && !document.getElementById('zgate')) r(); else setTimeout(chk, 150); })();
  });
  (function () {
    var pre = document.getElementById('pre'); if (!pre) return;
    var bar = pre.querySelector('.pbar i'), done = false, total = 0, okN = 0;
    document.documentElement.classList.add('loading');
    function paint() { if (bar) bar.style.width = (total ? Math.max(4, Math.round(okN / total * 100)) : 4) + '%'; }
    function track(p) { total++; paint(); return Promise.resolve(p).catch(function () {}).then(function () { okN++; paint(); }); }
    function cap(p, ms) { return Promise.race([p, new Promise(function (r) { setTimeout(r, ms); })]); }
    function imgReady(im) {
      if (!im.getAttribute('src')) return Promise.resolve();
      var p = (im.complete && im.naturalWidth) ? Promise.resolve()
        : new Promise(function (r) { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); });
      return p.then(function () { return im.decode ? im.decode().catch(function () {}) : null; });
    }
    function vidReady(v) {
      if (v.readyState >= 4 || v.error || !v.canPlayType('video/mp4; codecs="avc1.640028"')) return Promise.resolve();   // sin H.264 no se espera
      return new Promise(function (r) { v.addEventListener('canplaythrough', r, { once: true }); v.addEventListener('error', r, { once: true }); });
    }
    function finish() {
      if (done) return; done = true; okN = total; paint();
      setTimeout(function () {
        document.body.classList.add('ready'); document.documentElement.classList.remove('loading');
        var hv = document.querySelector('.hero-v'); if (hv) { try { hv.currentTime = 0; var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
        if (window.__pimMap) { try { window.__pimMap.invalidateSize(); } catch (e) {} }
      }, 300);
    }
    setTimeout(function () {
      var all = [];
      Array.prototype.forEach.call(document.querySelectorAll('img'), function (im) { if (im.closest('#pre') || im.closest('#zgate')) return; im.loading = 'eager'; all.push(track(cap(imgReady(im), 30000))); });
      Array.prototype.forEach.call(document.querySelectorAll('image'), function (im) {   // imagen del masterplan (SVG)
        var href = im.getAttribute('href') || im.getAttribute('xlink:href'); if (!href) return;
        var i2 = new Image(); i2.src = href; all.push(track(cap(i2.decode ? i2.decode().catch(function () {}) : Promise.resolve(), 30000)));
      });
      var hv = document.querySelector('.hero-v'); if (hv) all.push(track(cap(vidReady(hv), 45000)));
      if (document.fonts && document.fonts.ready) all.push(track(cap(document.fonts.ready, 15000)));
      all.push(track(new Promise(function (r) { if (document.readyState === 'complete') r(); else addEventListener('load', r, { once: true }); })));
      GATE.then(function () { setTimeout(finish, 90000); return Promise.all(all); }).then(finish);
    }, 0);
  })();
  function t(o) { return o ? (o[lang] || o.es || '') : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bi(es, en) { return '<span class="l-es">' + es + '</span><span class="l-en">' + en + '</span>'; }

  /* ---------- idioma ---------- */
  function setLang(l) {
    lang = l === 'en' ? 'en' : 'es';
    html.lang = lang;
    html.classList.remove('lang-es', 'lang-en');
    html.classList.add('lang-' + lang);
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    $$('option[data-es]').forEach(function (o) { o.textContent = o.dataset[lang]; });
    try { localStorage.setItem('pim-lang', lang); } catch (e) {}
    if (window.__pimMapLabels) window.__pimMapLabels();
  }
  var q = (location.search.match(/[?&]lang=(es|en)/) || [])[1];
  var stored = null; try { stored = localStorage.getItem('pim-lang'); } catch (e) {}
  setLang(q || stored || 'es');
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  /* ---------- barra / menú ---------- */
  var bar = $('#bar'), burger = $('#burger');
  function onScroll() { bar.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6 - 64); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', function () {
    var o = document.body.classList.toggle('menu'); burger.setAttribute('aria-expanded', String(o));
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu'); burger.setAttribute('aria-expanded', 'false'); }); });
  // sección activa
  var links = $$('#nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) so.observe(s); });
  }

  /* ---------- reveal ---------- */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { ro.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* ---------- links de config ---------- */
  var P = C.parque || { lat: -31.5788, lng: -68.4318 };
  $('#verUbicacion').href = 'https://www.google.com/maps/search/?api=1&query=' + P.lat + ',' + P.lng;
  var wa = 'https://wa.me/' + (C.whatsapp || '');
  $('#waLink').href = wa;
  var S = C.social || {};
  $('#sYt').href = S.youtube || '#'; $('#sIg').href = S.instagram || '#'; $('#sLi').href = S.linkedin || '#';
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- estados ---------- */
  var EST = {
    'proyecto':    { c: 'tag-opp',  es: 'En proyecto', en: 'In design' },
    'en-obra':     { c: 'tag-adv',  es: 'En obra', en: 'Under construction' },
    'terminado':   { c: 'tag-done', es: 'Terminado', en: 'Completed' },
    'a-definir':   { c: 'tag-pend', es: 'A definir', en: 'To be defined' },
    'a-confirmar': { c: 'tag-pend', es: 'Estado a confirmar', en: 'Status to be confirmed' }
  };
  function tag(k) { var e = EST[k] || EST['a-confirmar']; return '<span class="tag ' + e.c + '">' + bi(e.es, e.en) + '</span>'; }

  /* ---------- obra ---------- */
  var O = D.obra || {}, oGrid = $('#oGrid');
  (O.etapas || []).forEach(function (e) {
    var el = document.createElement('article'); el.className = 'o-card';
    var h = tag(e.estado) + '<h3>' + bi(esc(e.nombre.es), esc(e.nombre.en)) + '</h3><p>' + bi(esc(e.texto.es), esc(e.texto.en)) + '</p>';
    if (typeof e.avance === 'number') {
      var p = Math.max(0, Math.min(100, e.avance));
      h += '<div class="o-pct">' + p + '%</div><div class="o-bar" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100"><i style="--p:' + (p / 100) + '"></i></div>';
    }
    if (e.hitos && e.hitos.length) {
      h += '<ul class="o-hitos">' + e.hitos.map(function (x) { return '<li class="' + (x.ok ? 'ok' : '') + '">' + bi(esc(x.es), esc(x.en || x.es)) + '</li>'; }).join('') + '</ul>';
    }
    if (e.video) h += '<a class="btn btn-ghost-d btn-sm" href="' + esc(e.video) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' + bi('Avance de obra', 'Construction progress') + '</a>';
    el.innerHTML = h; oGrid.appendChild(el);
  });
  if (O.actualizado) $('#obraUpd').innerHTML = bi('Actualizado: ' + esc(O.actualizado), 'Updated: ' + esc(O.actualizado));
  // estado general en la ficha: el de la Etapa 1
  var e1 = (O.etapas || [])[0];
  $('#estadoGeneral').innerHTML = e1 ? tag(e1.estado).replace('Estado a confirmar', 'Etapa 1 · estado a confirmar').replace('Status to be confirmed', 'Phase 1 · status to be confirmed') : '';
  if ('IntersectionObserver' in window) {
    var oo = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); oo.unobserve(x.target); } }); }, { threshold: .3 });
    $$('.o-card').forEach(function (c) { oo.observe(c); });
  } else $$('.o-card').forEach(function (c) { c.classList.add('in'); });

  /* ---------- unidades ---------- */
  var U = (D.tipologias || []).filter(function (u) { return u && u.publicar; }), uGrid = $('#uGrid');
  var TIPO = { lote: ['Lote', 'Plot'], nave: ['Nave', 'Warehouse'], modulo: ['Módulo', 'Module'], servicios: ['Servicios', 'Services'] };
  var UEST = { disponible: ['tag-func', 'Disponible', 'Available'], reservado: ['tag-adv', 'Reservado', 'Reserved'], vendido: ['tag-pend', 'Vendido', 'Sold'], proximamente: ['tag-opp', 'Próximamente', 'Coming soon'] };
  function renderU(f) {
    if (!U.length) {
      uGrid.innerHTML = '<div class="u-empty"><div><span class="tag tag-orange">' + bi('En preparación', 'Coming soon') + '</span>' +
        '<h3 style="margin-top:16px">' + bi('Tipologías y disponibilidad', 'Typologies and availability') + '</h3>' +
        '<p>' + bi('Estamos cerrando el detalle de lotes y naves de cada etapa. Dejanos tus datos y te enviamos superficies, disponibilidad y condiciones apenas estén publicadas.', 'We are finalizing the plots and warehouses for each phase. Leave your details and we’ll send you sizes, availability and terms as soon as they are released.') + '</p>' +
        '<a class="btn btn-solid" href="#contacto">' + bi('Recibir disponibilidad', 'Get availability') + '</a></div>' +
        '<ul class="u-kinds"><li><b>' + bi('Lotes industriales', 'Industrial plots') + '</b><span>' + bi('Etapas 1 y 2', 'Phases 1 and 2') + '</span></li>' +
        '<li><b>' + bi('Naves logísticas', 'Logistics warehouses') + '</b><span>' + bi('Con andenes de carga', 'With loading docks') + '</span></li>' +
        '<li><b>' + bi('Áreas de servicios', 'Service areas') + '</b><span>' + bi('A definir*', 'To be defined*') + '</span></li>' +
        '<li><b>' + bi('Operador ancla', 'Anchor operator') + '</b><span>Mercado Libre · 4.370 m²</span></li></ul></div>';
      return;
    }
    uGrid.innerHTML = U.filter(function (u) { return !f || String(u.etapa) === f; }).map(function (u) {
      var ty = TIPO[u.tipo] || ['', ''], st = UEST[u.estado] || UEST.disponible;
      var spec = '';
      if (u.superficie) spec += '<div><dt>' + bi('Superficie', 'Area') + '</dt><dd>' + esc(u.superficie) + '</dd></div>';
      if (u.frente) spec += '<div><dt>' + bi('Frente', 'Frontage') + '</dt><dd>' + esc(u.frente) + '</dd></div>';
      if (u.unidades != null) spec += '<div><dt>' + bi('Unidades', 'Units') + '</dt><dd>' + esc(u.unidades) + '</dd></div>';
      if (u.disponibles != null) spec += '<div><dt>' + bi('Disponibles', 'Available') + '</dt><dd>' + esc(u.disponibles) + '</dd></div>';
      return '<article class="u-card"><div class="u-top"><span class="u-type">' + bi(ty[0], ty[1]) + ' · ' + bi('Etapa ', 'Phase ') + esc(u.etapa) + '</span><span class="tag ' + st[0] + '">' + bi(st[1], st[2]) + '</span></div>' +
        '<h3 class="u-name">' + bi(esc(u.nombre.es), esc(u.nombre.en || u.nombre.es)) + '</h3>' +
        (spec ? '<dl class="u-spec">' + spec + '</dl>' : '') +
        (u.detalle ? '<p class="u-det">' + bi(esc(u.detalle.es), esc(u.detalle.en || u.detalle.es)) + '</p>' : '') +
        '<a class="btn btn-ghost btn-sm" href="#contacto" data-unidad="' + esc(u.id) + '">' + bi('Consultar', 'Inquire') + '</a></article>';
    }).join('');
  }
  renderU('');
  var etapas = U.map(function (u) { return String(u.etapa); }).filter(function (v, i, a) { return a.indexOf(v) === i; });
  if (etapas.length > 1) {
    var uf = $('#uFilter'); uf.hidden = false;
    uf.innerHTML = '<button class="on" data-f="">' + bi('Todas', 'All') + '</button>' + etapas.map(function (e) { return '<button data-f="' + e + '">' + bi('Etapa ' + e, 'Phase ' + e) + '</button>'; }).join('');
    uf.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; $$('button', uf).forEach(function (x) { x.classList.toggle('on', x === b); }); renderU(b.dataset.f); });
  }
  uGrid.addEventListener('click', function (ev) {
    var a = ev.target.closest('[data-unidad]'); if (!a) return;
    var m = $('#form [name=mensaje]'); m.value = (lang === 'en' ? 'Interested in unit ' : 'Me interesa la unidad ') + a.dataset.unidad + '. ';
  });

  /* ---------- masterplan ---------- */
  var mp = $('.mp');
  function hl(z) {
    mp.classList.toggle('hl', !!z);
    $$('.zn', mp).forEach(function (p) { p.classList.toggle('on', p.dataset.z === z); });
    $$('#mpList li').forEach(function (li) { li.classList.toggle('on', li.dataset.z === z); });
  }
  $$('.zn, #mpList li').forEach(function (el) {
    el.addEventListener('mouseenter', function () { hl(el.dataset.z); });
    el.addEventListener('mouseleave', function () { hl(null); });
    el.addEventListener('focus', function () { hl(el.dataset.z); });
    el.addEventListener('blur', function () { hl(null); });
    el.addEventListener('click', function () { hl(el.classList.contains('on') && mp.classList.contains('hl') ? null : el.dataset.z); });
  });

  /* ---------- galerías ---------- */
  function gallery(g) {
    var tr = $('.gtrack', g), sl = $$('.gslide', g), dots = $('.gdots', g), i = 0;
    dots.innerHTML = sl.map(function (_, k) { return '<button type="button" aria-label="' + (k + 1) + '"></button>'; }).join('');
    var db = $$('button', dots);
    function go(n) {
      i = (n + sl.length) % sl.length;
      tr.style.transform = 'translateX(' + (-100 * i) + '%)';
      db.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      sl.forEach(function (s, k) {
        var v = $('video', s); if (!v) return;
        if (k === i && !g.hidden) { if (!v.src && v.dataset.src) v.src = v.dataset.src; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else v.pause();
      });
    }
    $('.gnext', g).addEventListener('click', function () { go(i + 1); });
    $('.gprev', g).addEventListener('click', function () { go(i - 1); });
    db.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
    var x0 = null;
    g.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    g.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    g.__go = function () { go(i); };
    go(0);
  }
  var gals = $$('.gal'); gals.forEach(gallery);
  $$('.g-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.g-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      gals.forEach(function (g) { g.hidden = g.dataset.gal !== b.dataset.g; if (!g.hidden) g.__go(); else $$('video', g).forEach(function (v) { v.pause(); }); });
    });
  });

  /* ---------- modal video ---------- */
  var vm = $('#vmodal'), vv = $('#vmodalV');
  var vids = $$('.gal[data-gal=videos] video');
  $$('[data-open-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      var src = vids[+b.dataset.openVideo]; if (!src) return;
      vv.src = src.dataset.src; vm.hidden = false; document.body.style.overflow = 'hidden';
      var pr = vv.play(); if (pr && pr.catch) pr.catch(function () {});
    });
  });
  function closeV() { vv.pause(); vv.removeAttribute('src'); vv.load(); vm.hidden = true; document.body.style.overflow = ''; }
  $('.vclose', vm).addEventListener('click', closeV);
  vm.addEventListener('click', function (e) { if (e.target === vm) closeV(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !vm.hidden) closeV(); });

  /* ---------- parallax suave ---------- */
  var rbg = $('.regional-bg'), reg = $('#regional');
  if (rbg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', function () {
      var r = reg.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      rbg.style.transform = 'translateY(' + ((r.top + r.height / 2 - innerHeight / 2) * -0.08) + 'px)';
    }, { passive: true });
  }

  /* ---------- formulario ---------- */
  var form = $('#form'), msg = $('#formMsg');
  function perfil() { return (form.querySelector('[name=perfil]:checked') || {}).value || 'inversor'; }
  function syncPerfil() {
    var p = perfil();
    $$('[data-perfil]').forEach(function (el) { el.hidden = el.dataset.perfil !== p; });
  }
  $$('[name=perfil]', form).forEach(function (r) { r.addEventListener('change', syncPerfil); });
  syncPerfil();
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (form.web.value) return; // honeypot
    var p = perfil(), ok = true;
    $$('.fld, .chk', form).forEach(function (f) { f.classList.remove('err'); });
    $$('input, select, textarea', form).forEach(function (el) {
      var box = el.closest('.fld') || el.closest('.chk');
      if (box && box.hidden) return;
      var req = el.required || el.dataset.req === p;
      var bad = req && (el.type === 'checkbox' ? !el.checked : !String(el.value).trim());
      if (!bad && el.type === 'email' && el.value) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      if (bad && box) { box.classList.add('err'); ok = false; }
    });
    if (!ok) { msg.className = 'form-msg bad'; msg.innerHTML = bi('Revisá los campos marcados.', 'Please check the highlighted fields.'); return; }
    var data = { perfil: p, idioma: lang, origen: 'web-pim', fecha: new Date().toISOString() };
    $$('input, select, textarea', form).forEach(function (el) {
      var box = el.closest('.fld'); if (!el.name || el.name === 'web' || el.name === 'perfil' || (box && box.hidden)) return;
      data[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });
    var done = function () { msg.className = 'form-msg ok'; msg.innerHTML = bi('¡Gracias! Un asesor te va a contactar a la brevedad.', 'Thank you! An advisor will contact you shortly.'); form.reset(); syncPerfil(); };
    if (C.formEndpoint) {
      var btn = $('.btn-send', form); btn.disabled = true;
      fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; done(); })
        .catch(function () { msg.className = 'form-msg bad'; msg.innerHTML = bi('No pudimos enviar la consulta. Escribinos por WhatsApp.', 'We couldn’t send your inquiry. Please message us on WhatsApp.'); })
        .then(function () { btn.disabled = false; });
      return;
    }
    // sin endpoint configurado: WhatsApp con el mensaje armado
    var L = p === 'empresa' ? 'Empresa' : 'Inversor';
    var txt = 'Hola, quiero información sobre PIM · Parque Industrial Minero.\nPerfil: ' + L +
      '\nNombre: ' + data.nombre + ' ' + data.apellido + '\nEmail: ' + data.email + '\nTeléfono: ' + data.telefono +
      (p === 'empresa' ? '\nEmpresa: ' + data.empresa + '\nRubro: ' + data.rubro + '\nNecesidad: ' + data.necesidad + (data.superficie ? '\nSuperficie: ' + data.superficie + ' m²' : '') : '\nInterés: ' + data.interes) +
      (data.mensaje ? '\nMensaje: ' + data.mensaje : '');
    window.open(wa + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    done();
  });

  /* ---------- mapa ----------
     Vista regional: mapa vectorial propio, sin teselas (Natural Earth, dominio
     público: provincias y rutas principales) — limpio, solo puntos clave.
     Entorno del parque: OpenStreetMap en gris, para que resalten los puntos. */
  function initMap() {
    if (!window.L || !$('#map')) return;
    var BASE = window.PIM_MAPA_BASE || null;
    var map = L.map('map', { zoomControl: false, scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
    L.control.zoom({ position: 'topright' }).addTo(map);
    map.attributionControl.setPrefix(false);
    var box = $('#map');

    // capa regional (vectorial)
    var gBase = L.layerGroup();
    if (BASE) {
      L.geoJSON(BASE.prov, { interactive: false, style: function (f) {
        var sj = f.properties.n === 'San Juan', cl = f.properties.c === 'CHL';
        return { color: sj ? '#F28A2D' : '#ffffff', weight: sj ? 1.6 : 1, fillColor: sj ? '#FCE6D2' : (cl ? '#E9E6E0' : '#F6F3ED'), fillOpacity: 1 };
      } }).addTo(gBase);
      L.geoJSON(BASE.roads, { interactive: false, style: { color: '#CFC8BD', weight: 1, opacity: .9 } }).addTo(gBase);
    }
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, className: 'tiles-gris',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' });

    function lbl(o) { return typeof o === 'string' ? { es: o, en: o } : o; }
    function icon(cls, label, dir, size) {
      var L2 = label ? lbl(label) : null;
      return L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        html: '<div class="mk ' + cls + '"></div>' + (L2 ? '<span class="mk-lbl ' + cls + '-l ' + (dir || 'r') + '" data-es="' + esc(L2.es) + '" data-en="' + esc(L2.en) + '">' + esc(L2[lang]) + '</span>' : '') });
    }
    function mk(g, ll, cls, label, dir, size, z) { L.marker(ll, { icon: icon(cls, label, dir, size), interactive: false, keyboard: false, zIndexOffset: z || 0 }).addTo(g); }

    var pim = [P.lat, P.lng], SJ = [-31.5375, -68.5364], AIR = [-31.5715, -68.4182];
    var gReg = L.layerGroup(), gEnt = L.layerGroup();
    // vínculos logísticos referenciales (no son caminos)
    [[SJ, [-30.241, -68.746], [-30.212, -69.138], [-29.37, -69.95]],
     [[-30.212, -69.138], [-28.45, -69.6]],
     [SJ, [-31.333, -69.425], [-31.065, -70.22]],
     [[-31.333, -69.425], [-31.64, -69.472], [-31.75, -70.43]],
     [SJ, [-31.983, -68.548]]].forEach(function (l) {
      L.polyline(l, { color: '#F28A2D', weight: 1.6, dashArray: '5 6', opacity: .85, interactive: false }).addTo(gReg);
    });
    // bases de servicios (posición de etiqueta elegida para no superponer)
    [['San José de Jáchal', -30.241, -68.746, 'r'], ['Rodeo', -30.212, -69.138, 'l'], ['Iglesia', -30.411, -69.21, 'l'],
     ['Calingasta', -31.333, -69.425, 't'], ['Barreal', -31.64, -69.472, 'b'], ['Cañada Honda', -31.983, -68.548, 'r']]
      .forEach(function (b) { mk(gReg, [b[1], b[2]], 'mk-base', b[0], b[3], 10); });
    // proyectos mineros
    [['Vicuña', -28.45, -69.6, 'r'], ['Veladero', -29.37, -69.95, 'r'], ['Los Azules', -31.065, -70.22, 'l'], ['El Pachón', -31.75, -70.43, 'l']]
      .forEach(function (m) { mk(gReg, [m[1], m[2]], 'mk-mina', m[0], m[3], 11); });
    mk(gReg, SJ, 'mk-city', 'San Juan', 'l', 12, 500);
    mk(gReg, pim, 'mk-pim', 'PIM', 'r', 18, 1000);
    // entorno
    mk(gEnt, SJ, 'mk-city', { es: 'Ciudad de San Juan', en: 'San Juan city' }, 't', 14);
    mk(gEnt, AIR, 'mk-air', { es: 'Aeropuerto', en: 'Airport' }, 'r', 12);
    mk(gEnt, pim, 'mk-pim', 'PIM', 'b', 20, 1000);
    L.polyline([SJ, [-31.555, -68.48], pim], { color: '#F28A2D', weight: 2.5, dashArray: '7 7', interactive: false }).addTo(gEnt);

    var views = {
      region: { b: L.latLngBounds([[-28.25, -70.75], [-32.15, -67.9]]) },
      entorno: { b: L.latLngBounds([SJ, AIR, pim]).pad(0.45) }
    };
    var cur = null, FIT = { paddingTopLeft: [16, 64], paddingBottomRight: [16, 16] };
    function show(v) {
      [gBase, gReg, gEnt, osm].forEach(function (l) { if (map.hasLayer(l)) map.removeLayer(l); });
      if (v === 'region') { gBase.addTo(map); gReg.addTo(map); map.attributionControl.addAttribution('Natural Earth'); }
      else { map.attributionControl.removeAttribution('Natural Earth'); osm.addTo(map); gEnt.addTo(map); }
      box.classList.toggle('map-reg', v === 'region');
      cur = v; map.fitBounds(views[v].b, FIT);
      if (window.__pimMapLabels) window.__pimMapLabels();
      $$('.map-tabs button').forEach(function (b) { var on = b.dataset.view === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    }
    $$('.map-tabs button').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.view); }); });
    show('region');
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    window.__pimMapLabels = function () { $$('.mk-lbl[data-es]').forEach(function (s) { s.textContent = s.dataset[lang]; }); };
    window.__pimMap = map;
    var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { map.invalidateSize(); map.fitBounds(views[cur].b, FIT); mo.disconnect(); } });
    mo.observe(box);
  }
  initMap();
})();
