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

  var FONTS = ['Dancing Script', 'Great Vibes', 'Caveat', 'Allura', 'Sacramento', 'Pacifico', 'Alex Brush', 'Parisienne', 'Satisfy', 'Kaushan Script', 'Marck Script', 'Yellowtail', 'Homemade Apple', 'La Belle Aurore', 'Zeyada', 'Mr Dafoe', 'Herr Von Muellerhoff', 'Mrs Saint Delafield'];
  var FONT_CSS = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&family=Caveat:wght@600&family=Allura&family=Sacramento&family=Pacifico&family=Alex+Brush&family=Parisienne&family=Satisfy&family=Kaushan+Script&family=Marck+Script&family=Yellowtail&family=Homemade+Apple&family=La+Belle+Aurore&family=Zeyada&family=Mr+Dafoe&family=Herr+Von+Muellerhoff&family=Mrs+Saint+Delafield&display=swap';
  /** Only Dancing Script and Caveat are loaded in bold; the others have a single weight (a forced bold would look smeared). */
  function weightOf(f) { return f === 'Dancing Script' || f === 'Caveat' ? 600 : 400; }
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
    '.esg [hidden]{display:none !important}',
    '.esg-fonts{max-height:230px;overflow-y:auto;padding-right:2px}',
    '.esg-opts{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0;font-size:.8rem;color:var(--muted,#666)}',
    '.esg-sp{flex:1}',
    '.esg-seg{display:inline-flex;border:1px solid var(--line,#e5e5e5);border-radius:9px;overflow:hidden}',
    '.esg-seg button{border:0;background:#fff;color:inherit;padding:6px 12px;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;border-right:1px solid var(--line,#e5e5e5)}',
    '.esg-seg button:last-child{border-right:0}.esg-seg button.on{background:var(--gold-soft,rgba(255,64,129,.08));color:var(--gold,#ff4081)}',
    '.esg-drop{display:grid;gap:4px;place-items:center;text-align:center;border:2px dashed var(--line,#d6d6dc);border-radius:14px;padding:28px 16px;cursor:pointer;font-size:.86rem;color:var(--muted,#666)}',
    '.esg-drop strong{color:var(--gold,#ff4081);font-size:.95rem}.esg-drop input{display:none}',
    '.esg-thr{flex:1;min-width:120px;accent-color:var(--gold,#ff4081)}',
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
      if (document.fonts && document.fonts.load) return document.fonts.load(weightOf(family) + ' 64px "' + family + '"', text || 'Abc').then(function () {}, function () {});
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
    var mode = 'typed', font = FONTS[0], sizeK = 1, penK = 1, listeners = [];
    root.innerHTML =
      '<div class="esg">' +
      '<div class="esg-tabs"><button type="button" data-mode="typed" class="on">Taper mon nom</button><button type="button" data-mode="drawn">Dessiner à la main</button><button type="button" data-mode="uploaded">Importer une image</button></div>' +
      '<div data-pane="typed">' +
      '<input class="esg-name" type="text" maxlength="80" autocomplete="name" placeholder="Votre nom complet">' +
      '<div class="esg-fonts"></div>' +
      '<div class="esg-opts"><span>Taille</span><div class="esg-seg" data-seg="size"><button type="button" data-v="0.8">Petite</button><button type="button" data-v="1" class="on">Moyenne</button><button type="button" data-v="1.2">Grande</button></div></div>' +
      '<div class="esg-box"><canvas class="esg-prev" width="520" height="150"></canvas><div class="esg-hint">Votre signature apparaîtra ici</div></div>' +
      '</div>' +
      '<div data-pane="drawn" hidden>' +
      '<div class="esg-box"><canvas class="esg-pad" width="800" height="240"></canvas><div class="esg-line"></div><div class="esg-hint">Signez ici avec la souris, le doigt ou un stylet</div></div>' +
      '<div class="esg-opts"><span>Trait</span><div class="esg-seg" data-seg="pen"><button type="button" data-v="0.7">Fin</button><button type="button" data-v="1" class="on">Moyen</button><button type="button" data-v="1.5">Épais</button></div>' +
      '<span class="esg-sp"></span><button type="button" class="esg-clear esg-undo">Annuler le dernier trait</button><button type="button" class="esg-clear esg-wipe">Tout effacer</button></div>' +
      '</div>' +
      '<div data-pane="uploaded" hidden>' +
      '<label class="esg-drop"><input type="file" accept="image/png,image/jpeg,image/webp" class="esg-file"><strong>Choisir une photo de ma signature</strong><span>Signez sur une feuille blanche avec un stylo foncé, puis prenez la photo bien éclairée, de face.</span></label>' +
      '<div class="esg-box esg-upbox" hidden><canvas class="esg-up" width="800" height="240"></canvas><div class="esg-hint esg-uphint"></div></div>' +
      '<div class="esg-opts esg-upopts" hidden><span>Netteté</span><input type="range" class="esg-thr" min="-40" max="40" value="0"><span class="esg-sp"></span><button type="button" class="esg-clear esg-upclear">Changer d’image</button></div>' +
      '</div></div>';
    var nameEl = root.querySelector('.esg-name');
    var fontsEl = root.querySelector('.esg-fonts');
    var prev = root.querySelector('.esg-prev');
    var padCv = root.querySelector('.esg-pad');
    var upCv = root.querySelector('.esg-up');
    var panes = { typed: root.querySelector('[data-pane="typed"]'), drawn: root.querySelector('[data-pane="drawn"]'), uploaded: root.querySelector('[data-pane="uploaded"]') };
    var typedHint = panes.typed.querySelector('.esg-hint');
    var drawnHint = panes.drawn.querySelector('.esg-hint');
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
      var size = Math.round(84 * sizeK);
      ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      do { ctx.font = weightOf(font) + ' ' + size + 'px "' + font + '", cursive'; size -= 4; } while (ctx.measureText(text).width > prev.width - 40 && size > 20);
      ctx.fillText(text, prev.width / 2, prev.height / 2);
    }
    function renderTypedSoon() { loadFont(font, nameEl.value).then(drawTyped); }
    nameEl.addEventListener('input', function () { refreshSamples(); renderTypedSoon(); changed(); });
    refreshSamples(); renderTypedSoon();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawTyped(); });

    function bindSeg(name, onPick) {
      var seg = root.querySelector('[data-seg="' + name + '"]');
      [].forEach.call(seg.children, function (b) {
        b.addEventListener('click', function () { [].forEach.call(seg.children, function (x) { x.classList.toggle('on', x === b); }); onPick(parseFloat(b.dataset.v)); });
      });
    }
    bindSeg('size', function (v) { sizeK = v; drawTyped(); changed(); });

    // ---- drawn: pressure/speed make the line thicker or thinner like a real pen; every stroke is kept so the last one can be undone
    var pctx = padCv.getContext('2d');
    pctx.lineCap = 'round'; pctx.lineJoin = 'round'; pctx.strokeStyle = INK; pctx.fillStyle = INK;
    var strokes = [], cur = null;
    function pos(e) {
      var r = padCv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * padCv.width / r.width, y: (e.clientY - r.top) * padCv.height / r.height, t: e.timeStamp || Date.now() };
    }
    function widthFor(p, last, e) {
      var base = 3.6 * penK;
      var target;
      if (e && e.pointerType === 'pen' && e.pressure > 0) target = base * (0.45 + 1.1 * e.pressure);
      else {
        var dt = Math.max(1, p.t - last.t), v = Math.hypot(p.x - last.x, p.y - last.y) / dt; // px per ms
        target = base * (1.25 - Math.min(v, 2.2) / 2.2 * 0.75);
      }
      return last.w == null ? target : last.w * 0.72 + target * 0.28;
    }
    function drawSegment(a, b, c) {
      var m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, m2 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
      pctx.lineWidth = b.w; pctx.beginPath(); pctx.moveTo(m1.x, m1.y); pctx.quadraticCurveTo(b.x, b.y, m2.x, m2.y); pctx.stroke();
    }
    function drawDot(p) { pctx.beginPath(); pctx.arc(p.x, p.y, Math.max(1.4, p.w / 2), 0, Math.PI * 2); pctx.fill(); }
    function redraw() {
      pctx.clearRect(0, 0, padCv.width, padCv.height);
      strokes.forEach(function (s) {
        if (s.length === 1) { drawDot(s[0]); return; }
        for (var i = 1; i < s.length - 1; i++) drawSegment(s[i - 1], s[i], s[i + 1]);
        if (s.length > 1) { var l = s[s.length - 1], q = s[s.length - 2]; pctx.lineWidth = l.w; pctx.beginPath(); pctx.moveTo((q.x + l.x) / 2, (q.y + l.y) / 2); pctx.lineTo(l.x, l.y); pctx.stroke(); }
      });
    }
    function hasInk() { return strokes.length > 0; }
    padCv.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { padCv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      var p = pos(e); p.w = 3.6 * penK * (e.pointerType === 'pen' && e.pressure > 0 ? 0.45 + 1.1 * e.pressure : 1);
      cur = [p]; strokes.push(cur); drawDot(p);
      drawnHint.style.display = 'none'; changed();
    });
    padCv.addEventListener('pointermove', function (e) {
      if (!cur) return; e.preventDefault();
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      (evs && evs.length ? evs : [e]).forEach(function (ev) {
        var last = cur[cur.length - 1], p = pos(ev);
        if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) return;
        p.w = widthFor(p, last, ev);
        cur.push(p);
        if (cur.length >= 3) drawSegment(cur[cur.length - 3], cur[cur.length - 2], cur[cur.length - 1]);
      });
    });
    function stop() { if (cur && cur.length === 2) { pctx.lineWidth = cur[1].w; pctx.beginPath(); pctx.moveTo(cur[0].x, cur[0].y); pctx.lineTo(cur[1].x, cur[1].y); pctx.stroke(); } cur = null; changed(); }
    padCv.addEventListener('pointerup', stop); padCv.addEventListener('pointercancel', stop); padCv.addEventListener('pointerleave', stop);
    bindSeg('pen', function (v) { penK = v; });
    root.querySelector('.esg-undo').addEventListener('click', function () { strokes.pop(); redraw(); drawnHint.style.display = strokes.length ? 'none' : ''; changed(); });
    function wipe() { strokes = []; cur = null; pctx.clearRect(0, 0, padCv.width, padCv.height); drawnHint.style.display = ''; changed(); }
    root.querySelector('.esg-wipe').addEventListener('click', wipe);

    // ---- imported picture: the ink of a photo of a hand-written signature becomes the mask (white paper disappears)
    var fileEl = root.querySelector('.esg-file'), dropEl = root.querySelector('.esg-drop');
    var upBox = root.querySelector('.esg-upbox'), upOpts = root.querySelector('.esg-upopts'), upHint = root.querySelector('.esg-uphint'), thrEl = root.querySelector('.esg-thr');
    var srcImg = null, upInk = 0;
    function renderUpload() {
      if (!srcImg) return;
      var W = upCv.width, H = upCv.height, c = upCv.getContext('2d');
      var tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
      var t = tmp.getContext('2d'); t.fillStyle = '#fff'; t.fillRect(0, 0, W, H);
      var k = Math.min(W / srcImg.width, H / srcImg.height, 1.5), dw = srcImg.width * k, dh = srcImg.height * k;
      t.drawImage(srcImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      var data = t.getImageData(0, 0, W, H), px = data.data, n = W * H, lum = new Uint8Array(n), hist = new Array(256).fill(0);
      for (var i = 0; i < n; i++) { var l = Math.round(0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]); lum[i] = l; hist[l]++; }
      // Otsu threshold: the level that best separates dark ink from light paper
      var sum = 0; for (var s = 0; s < 256; s++) sum += s * hist[s];
      var wB = 0, sB = 0, best = 0, thr = 128;
      for (var th = 0; th < 256; th++) { wB += hist[th]; if (!wB) continue; var wF = n - wB; if (!wF) break; sB += th * hist[th]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; thr = th; } }
      thr = Math.max(40, Math.min(215, thr + parseInt(thrEl.value, 10)));
      var out = c.createImageData(W, H), o = out.data; upInk = 0;
      var hex = INK.replace('#', ''), r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
      for (var j = 0; j < n; j++) {
        var a = Math.max(0, Math.min(255, Math.round((thr - lum[j]) * 255 / 40))); // soft edge over 40 levels
        o[j * 4] = r; o[j * 4 + 1] = g; o[j * 4 + 2] = b; o[j * 4 + 3] = a; if (a > 40) upInk++;
      }
      c.clearRect(0, 0, W, H); c.putImageData(out, 0, 0);
      var ratio = upInk / n;
      upHint.style.display = ratio < 0.002 || ratio > 0.5 ? '' : 'none';
      upHint.textContent = ratio > 0.5 ? 'L’image est trop sombre : refaites la photo sur du papier blanc, bien éclairé.' : (ratio < 0.002 ? 'Aucune signature détectée : rapprochez-vous ou augmentez la netteté.' : '');
      changed();
    }
    fileEl.addEventListener('change', function () {
      var f = fileEl.files && fileEl.files[0]; if (!f) return;
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) { alert('Choisissez une image PNG, JPEG ou WebP.'); fileEl.value = ''; return; }
      if (f.size > 8 * 1024 * 1024) { alert('Image trop lourde (8 Mo maximum).'); fileEl.value = ''; return; }
      var rd = new FileReader();
      rd.onload = function () {
        var im = new Image();
        im.onload = function () { srcImg = im; dropEl.hidden = true; upBox.hidden = false; upOpts.hidden = false; thrEl.value = 0; renderUpload(); };
        im.onerror = function () { alert('Cette image ne peut pas être lue. Essayez un JPEG ou un PNG.'); };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    });
    thrEl.addEventListener('input', renderUpload);
    root.querySelector('.esg-upclear').addEventListener('click', function () {
      srcImg = null; upInk = 0; fileEl.value = ''; dropEl.hidden = false; upBox.hidden = true; upOpts.hidden = true; upCv.getContext('2d').clearRect(0, 0, upCv.width, upCv.height); changed();
    });

    root.querySelectorAll('.esg-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.mode;
        root.querySelectorAll('.esg-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
        Object.keys(panes).forEach(function (k) { panes[k].hidden = mode !== k; });
        if (mode === 'typed') renderTypedSoon();
        changed();
      });
    });

    return {
      onChange: function (fn) { listeners.push(fn); },
      setName: function (n) { if (!nameEl.value.trim()) { nameEl.value = n || ''; refreshSamples(); renderTypedSoon(); changed(); } },
      isReady: function () { return mode === 'typed' ? nameEl.value.trim().length >= 2 : mode === 'drawn' ? hasInk() : (!!srcImg && upInk > 60); },
      clear: function () { nameEl.value = ''; refreshSamples(); drawTyped(); wipe(); },
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
        if (mode === 'drawn') {
          if (!hasInk()) return Promise.resolve(null);
          var d = maskFromCanvas(padCv);
          return Promise.resolve(d ? { type: 'drawn', image: d } : null);
        }
        if (!srcImg) return Promise.resolve(null);
        var u = maskFromCanvas(upCv);
        return Promise.resolve(u ? { type: 'uploaded', image: u } : null);
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
