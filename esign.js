/*!
 * Freda Pay Issuing : signature électronique interne (composants du navigateur).
 * Aucune bibliothèque externe : un bloc de signature (taper son nom dans une police cursive, ou dessiner à la
 * souris / au doigt) et l'affichage d'un contrat avec ses champs à remplir. La signature est envoyée au serveur
 * comme un masque 8 bits (une image en niveaux de transparence), que le serveur dessine dans le PDF.
 *
 * Utilisation :
 *   const pad = FredaESign.createSignaturePad(element, { name: 'Marie Jean' });
 *   const signature = await pad.getSignature();   // null si vide
 *   const doc = FredaESign.renderContract(element, contrat, { editable: true });
 *   const champs = doc.getFields();
 */
(function (global) {
  'use strict';

  var FONTS = ['Dancing Script', 'Great Vibes', 'Caveat', 'Allura', 'Sacramento', 'Pacifico'];
  var FONT_CSS = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&family=Caveat:wght@600&family=Allura&family=Sacramento&family=Pacifico&display=swap';
  var INK = '#141c5a';

  var CSS = [
    '.esg{border:1px solid var(--line,#e5e5e5);border-radius:14px;background:#fff;padding:14px;font-family:inherit}',
    '.esg *{box-sizing:border-box}',
    '.esg-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}',
    '.esg-tabs button{border:1px solid var(--line,#e5e5e5);background:#fff;color:inherit;border-radius:9px;padding:8px 14px;font:inherit;font-size:.86rem;font-weight:700;cursor:pointer}',
    '.esg-tabs button.on{border-color:var(--gold,#ff4081);background:var(--gold-soft,rgba(255,64,129,.08));color:var(--gold,#ff4081)}',
    '.esg-name{width:100%;padding:11px 13px;border-radius:10px;border:1px solid var(--line,#e5e5e5);font:inherit;font-size:.95rem;margin-bottom:10px}',
    '.esg-name:focus{outline:none;border-color:var(--gold,#ff4081)}',
    '.esg-fonts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:10px}',
    '.esg-fonts button{border:1.5px solid var(--line,#e5e5e5);background:#fff;border-radius:10px;padding:8px 10px;font-size:1.45rem;line-height:1.15;color:' + INK + ';cursor:pointer;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
    '.esg-fonts button.on{border-color:var(--gold,#ff4081);background:var(--gold-soft,rgba(255,64,129,.08))}',
    '.esg-box{border:1.5px dashed var(--line,#d6d6dc);border-radius:12px;background:#fcfcfd;position:relative;overflow:hidden}',
    '.esg-box canvas{display:block;width:100%;height:auto}',
    '.esg-pad{touch-action:none;cursor:crosshair}',
    '.esg-hint{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#a9a9b4;font-size:.9rem;pointer-events:none}',
    '.esg-line{position:absolute;left:6%;right:6%;bottom:28%;border-bottom:1px solid #d8d8e0;pointer-events:none}',
    '.esg-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px;font-size:.78rem;color:var(--muted,#666)}',
    '.esg-clear{border:0;background:none;color:var(--gold,#ff4081);font:inherit;font-weight:700;cursor:pointer;padding:4px 0}',
    '.esg-doc{border:1px solid var(--line,#e5e5e5);border-radius:14px;background:#fff;padding:26px 28px;line-height:1.65;font-size:.95rem;color:#1a1a1f;overflow-wrap:anywhere}',
    '.esg-doc h1{font-size:1.5rem;margin:0 0 14px}.esg-doc h2{font-size:1.2rem;margin:18px 0 8px}.esg-doc h3{font-size:1.02rem;margin:14px 0 6px}',
    '.esg-doc p,.esg-doc div{margin:0 0 10px}.esg-doc ul,.esg-doc ol{margin:0 0 10px;padding-left:24px}.esg-doc li{margin-bottom:4px}',
    '.esg-doc blockquote{margin:0 0 10px;padding-left:14px;border-left:3px solid var(--line,#e5e5e5);color:#555}',
    '.esg-doc hr{border:0;border-top:1px solid var(--line,#e5e5e5);margin:16px 0}',
    '.esg-doc table{border-collapse:collapse;width:100%;margin:0 0 14px;font-size:.88rem;display:block;overflow-x:auto}',
    '.esg-doc th,.esg-doc td{border:1px solid var(--line,#e5e5e5);padding:7px 10px;text-align:left;vertical-align:top}',
    '.esg-doc th{background:#f4f4f6}',
    '.esg-doc .ctr-sigmark{color:#8a8a96;font-style:italic}',
    '.esg-input{display:inline-block;min-width:170px;max-width:100%;padding:4px 9px;border:0;border-bottom:2px solid var(--gold,#ff4081);background:var(--gold-soft,rgba(255,64,129,.08));border-radius:6px 6px 0 0;font:inherit;font-weight:700;color:#111}',
    '.esg-input:focus{outline:none;background:rgba(255,64,129,.14)}',
    '.esg-input.bad{border-bottom-color:#dc2626;background:#fee2e2}',
    '.esg-filled{font-weight:700;border-bottom:1.5px solid #111;padding:0 3px}',
    '.esg-sigs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}',
    '.esg-sig{border:1px solid var(--line,#e5e5e5);border-radius:12px;padding:12px;background:#fff;min-width:0}',
    '.esg-sig .t{font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#666);margin-bottom:6px}',
    '.esg-sig img{display:block;max-width:100%;height:70px;object-fit:contain;margin:4px 0 6px}',
    '.esg-sig .n{font-weight:800;font-size:.92rem}.esg-sig .d{font-size:.78rem;color:var(--muted,#666)}',
    '.esg-sig .wait{height:70px;display:grid;place-items:center;color:#a9a9b4;font-size:.85rem;border:1px dashed var(--line,#d6d6dc);border-radius:8px;margin:4px 0 6px}',
    '@media (max-width:560px){.esg-sigs{grid-template-columns:1fr}.esg-doc{padding:18px 16px}}'
  ].join('\n');

  function injectOnce() {
    if (document.getElementById('esg-style')) return;
    var st = document.createElement('style'); st.id = 'esg-style'; st.textContent = CSS; document.head.appendChild(st);
    if (!document.getElementById('esg-fonts')) {
      var l = document.createElement('link'); l.id = 'esg-fonts'; l.rel = 'stylesheet'; l.href = FONT_CSS; document.head.appendChild(l);
    }
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function own(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function safePng(u) { return typeof u === 'string' && /^data:image\/png;base64,[A-Za-z0-9+\/=]+$/.test(u) ? u : ''; }
  function b64(bytes) {
    var s = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    return btoa(s);
  }
  function loadFont(family, text) {
    try {
      if (document.fonts && document.fonts.load) return document.fonts.load('600 64px "' + family + '"', text || 'Abc').then(function () {}, function () {});
    } catch (e) { /* fall through */ }
    return Promise.resolve();
  }

  /** Turns what is drawn on a canvas into { w, h, alpha } : cropped to the ink, scaled down, 8-bit coverage. */
  function maskFromCanvas(cv) {
    var w = cv.width, h = cv.height;
    var ctx = cv.getContext('2d');
    var data = ctx.getImageData(0, 0, w, h).data;
    var x0 = w, y0 = h, x1 = -1, y1 = -1, ink = 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 24) { ink++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
    }
    if (ink < 25 || x1 < 0) return null;
    var pad = 8;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
    var cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    var scale = Math.min(1, 440 / cw, 150 / ch);
    var tw = Math.max(40, Math.round(cw * scale)), th = Math.max(20, Math.round(ch * scale));
    var out = document.createElement('canvas'); out.width = tw; out.height = th;
    var octx = out.getContext('2d');
    octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high';
    octx.drawImage(cv, x0, y0, cw, ch, 0, 0, tw, th);
    var px = octx.getImageData(0, 0, tw, th).data;
    var alpha = new Uint8Array(tw * th);
    for (var i = 0; i < alpha.length; i++) alpha[i] = px[i * 4 + 3];
    return { w: tw, h: th, alpha: b64(alpha) };
  }

  function createSignaturePad(root, opts) {
    injectOnce();
    opts = opts || {};
    var mode = 'typed', font = FONTS[0], listeners = [];
    root.innerHTML =
      '<div class="esg">' +
      '<div class="esg-tabs"><button type="button" data-mode="typed" class="on">Taper mon nom</button><button type="button" data-mode="drawn">Dessiner à la main</button></div>' +
      '<div data-pane="typed">' +
      '<input class="esg-name" type="text" maxlength="80" autocomplete="name" placeholder="Votre nom complet">' +
      '<div class="esg-fonts"></div>' +
      '<div class="esg-box"><canvas class="esg-prev" width="520" height="150"></canvas><div class="esg-hint">Votre signature apparaîtra ici</div></div>' +
      '</div>' +
      '<div data-pane="drawn" hidden>' +
      '<div class="esg-box"><canvas class="esg-pad" width="640" height="190"></canvas><div class="esg-line"></div><div class="esg-hint">Signez ici avec la souris ou le doigt</div></div>' +
      '<div class="esg-row"><span>Dessinez votre signature dans le cadre.</span><button type="button" class="esg-clear">Effacer</button></div>' +
      '</div></div>';
    var nameEl = root.querySelector('.esg-name');
    var fontsEl = root.querySelector('.esg-fonts');
    var prev = root.querySelector('.esg-prev');
    var padCv = root.querySelector('.esg-pad');
    var typedPane = root.querySelector('[data-pane="typed"]');
    var drawnPane = root.querySelector('[data-pane="drawn"]');
    var typedHint = typedPane.querySelector('.esg-hint');
    var drawnHint = drawnPane.querySelector('.esg-hint');
    if (opts.name) nameEl.value = opts.name;

    function changed() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } }); }

    // ---- typed
    FONTS.forEach(function (f) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.font = f; b.style.fontFamily = '"' + f + '", cursive';
      b.textContent = 'Signature'; if (f === font) b.className = 'on';
      b.addEventListener('click', function () { font = f; [].forEach.call(fontsEl.children, function (c) { c.classList.toggle('on', c === b); }); drawTyped(); changed(); });
      fontsEl.appendChild(b);
    });
    function refreshSamples() {
      var t = nameEl.value.trim() || 'Signature';
      [].forEach.call(fontsEl.children, function (b) { b.textContent = t; });
    }
    function drawTyped() {
      var ctx = prev.getContext('2d');
      ctx.clearRect(0, 0, prev.width, prev.height);
      var text = nameEl.value.trim();
      typedHint.style.display = text ? 'none' : '';
      if (!text) return;
      var size = 84;
      ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      do { ctx.font = '600 ' + size + 'px "' + font + '", cursive'; size -= 4; } while (ctx.measureText(text).width > prev.width - 40 && size > 20);
      ctx.fillText(text, prev.width / 2, prev.height / 2);
    }
    function renderTypedSoon() {
      loadFont(font, nameEl.value).then(drawTyped);
    }
    nameEl.addEventListener('input', function () { refreshSamples(); renderTypedSoon(); changed(); });
    refreshSamples(); renderTypedSoon();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawTyped(); });

    // ---- drawn
    var pctx = padCv.getContext('2d');
    pctx.lineCap = 'round'; pctx.lineJoin = 'round'; pctx.strokeStyle = INK; pctx.lineWidth = 3.4;
    var drawing = false, last = null, hasInk = false;
    function pos(e) {
      var r = padCv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * padCv.width / r.width, y: (e.clientY - r.top) * padCv.height / r.height };
    }
    padCv.addEventListener('pointerdown', function (e) {
      e.preventDefault(); drawing = true; last = pos(e);
      try { padCv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      pctx.beginPath(); pctx.arc(last.x, last.y, 1.7, 0, Math.PI * 2); pctx.fillStyle = INK; pctx.fill();
      hasInk = true; drawnHint.style.display = 'none'; changed();
    });
    padCv.addEventListener('pointermove', function (e) {
      if (!drawing) return; e.preventDefault();
      var p = pos(e), mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      pctx.beginPath(); pctx.moveTo(last.x, last.y); pctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y); pctx.stroke();
      last = p;
    });
    function stop() { drawing = false; }
    padCv.addEventListener('pointerup', stop); padCv.addEventListener('pointercancel', stop); padCv.addEventListener('pointerleave', stop);
    root.querySelector('.esg-clear').addEventListener('click', function () {
      pctx.clearRect(0, 0, padCv.width, padCv.height); hasInk = false; drawnHint.style.display = ''; changed();
    });

    root.querySelectorAll('.esg-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.mode;
        root.querySelectorAll('.esg-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
        typedPane.hidden = mode !== 'typed'; drawnPane.hidden = mode !== 'drawn';
        if (mode === 'typed') renderTypedSoon();
        changed();
      });
    });

    return {
      onChange: function (fn) { listeners.push(fn); },
      setName: function (n) { if (!nameEl.value.trim()) { nameEl.value = n || ''; refreshSamples(); renderTypedSoon(); changed(); } },
      isReady: function () { return mode === 'typed' ? nameEl.value.trim().length >= 2 : hasInk; },
      clear: function () { nameEl.value = ''; refreshSamples(); drawTyped(); pctx.clearRect(0, 0, padCv.width, padCv.height); hasInk = false; drawnHint.style.display = ''; changed(); },
      /** The signature as the server expects it, or null when nothing is signed yet. */
      getSignature: function () {
        if (mode === 'typed') {
          var text = nameEl.value.trim();
          if (text.length < 2) return Promise.resolve(null);
          return loadFont(font, text).then(function () {
            drawTyped();
            var img = maskFromCanvas(prev);
            return img ? { type: 'typed', name: text, font: font, image: img } : null;
          });
        }
        if (!hasInk) return Promise.resolve(null);
        var img = maskFromCanvas(padCv);
        return Promise.resolve(img ? { type: 'drawn', image: img } : null);
      }
    };
  }

  /** Shows a contract. With { editable: true } the blanks become inputs; otherwise the filled values are shown. */
  function renderContract(root, c, opts) {
    injectOnce();
    opts = opts || {};
    root.innerHTML = '<div class="esg-doc">' + (c.body_html || '') + '</div>';
    var inputs = [];
    root.querySelectorAll('.ctr-field').forEach(function (span) {
      var label = span.getAttribute('data-field') || span.textContent;
      if (opts.editable) {
        var inp = document.createElement('input');
        inp.type = 'text'; inp.className = 'esg-input'; inp.maxLength = 200; inp.placeholder = label; inp.setAttribute('aria-label', label);
        inp.dataset.label = label; inp.value = (own(c.fields, label) && c.fields[label]) || '';
        inp.addEventListener('input', function () { inp.classList.remove('bad'); });
        span.replaceWith(inp); inputs.push(inp);
      } else {
        var v = own(c.fields, label) ? c.fields[label] : '';
        span.className = 'esg-filled'; span.textContent = v || '………………';
      }
    });
    return {
      inputs: inputs,
      getFields: function () { var o = {}; inputs.forEach(function (i) { o[i.dataset.label] = i.value.trim(); }); return o; },
      /** Marks empty blanks and returns the label of the first one missing, or null. */
      firstMissing: function () {
        var miss = null;
        inputs.forEach(function (i) { if (!i.value.trim()) { i.classList.add('bad'); if (!miss) { miss = i; } } });
        if (miss) { try { miss.scrollIntoView({ block: 'center', behavior: 'smooth' }); miss.focus(); } catch (e) { /* ignore */ } return miss.dataset.label; }
        return null;
      }
    };
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d.getTime())) return '';
    return d.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
  }

  /** The two signatures of a contract, as HTML (admin first, then the signer). */
  function sigCard(title, name, png, signedAt) {
    return '<div class="esg-sig"><div class="t">' + esc(title) + '</div>' +
      (safePng(png) ? '<img alt="Signature de ' + esc(name) + '" src="' + esc(safePng(png)) + '">' : '<div class="wait">En attente de signature</div>') +
      '<div class="n">' + esc(name) + '</div><div class="d">' + (signedAt ? 'Signé le ' + esc(fmtDate(signedAt)) : 'Pas encore signé') + '</div></div>';
  }
  /** Every signature box: Freda Pay Issuing people on the left, the other side on the right. */
  function signaturesHtml(c) {
    var extras = c.signers || [];
    var left = [sigCard('Pour Freda Pay Issuing', c.admin_name, c.admin_signature_png, c.admin_signed_at)];
    var right = [sigCard('Le signataire', c.signer_name || c.recipient_name, c.signer_signature_png, c.signed_at)];
    extras.forEach(function (x) {
      var card = sigCard(x.side === 'FREDA' ? 'Pour Freda Pay Issuing' : 'Le signataire', x.name, x.signature_png, x.signed_at);
      (x.side === 'FREDA' ? left : right).push(card);
    });
    var rows = '';
    for (var i = 0; i < Math.max(left.length, right.length); i++) rows += (left[i] || '<div></div>') + (right[i] || '<div></div>');
    return '<div class="esg-sigs">' + rows + '</div>';
  }

  global.FredaESign = { createSignaturePad: createSignaturePad, renderContract: renderContract, signaturesHtml: signaturesHtml, fmtDate: fmtDate, FONTS: FONTS };
})(window);
