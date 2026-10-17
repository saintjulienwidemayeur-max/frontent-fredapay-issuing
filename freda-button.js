/*!
 * Freda Pay Issuing - bouton de paiement universel
 * Usage :
 *   <div data-freda-link="lnk_XXXX" data-label="Payer" data-theme="dark"></div>
 *   <script src="https://VOTRE-DOMAINE/freda-button.js" async></script>
 * Aucun secret ici : le bouton ouvre simplement la page de paiement publique
 * du lien de paiement créé dans le tableau de bord Freda Pay Issuing.
 */
(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="freda-button.js"]');
    return s[s.length - 1];
  })();

  // La page de paiement se trouve à côté de ce script (même dossier).
  var checkoutBase = (script && script.getAttribute('data-checkout-url')) ||
    (script ? new URL(script.src.indexOf('file:') === 0 ? 'checkout.html' : 'checkout', script.src).href : 'checkout');

  var STYLE_ID = 'freda-pay-button-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.freda-pay-btn{display:inline-flex;align-items:center;gap:10px;font:700 15px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;' +
      'padding:13px 22px;border-radius:12px;border:none;cursor:pointer;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease}' +
      '.freda-pay-btn:hover{transform:translateY(-1px)}' +
      '.freda-pay-btn:focus-visible{outline:3px solid #ff80ab;outline-offset:2px}' +
      '.freda-pay-btn--dark{background:#ff4081;color:#fff;box-shadow:0 8px 20px -8px rgba(255,64,129,.6)}' +
      '.freda-pay-btn--light{background:#fff;color:#1a1216;border:1.5px solid #ff4081}' +
      '.freda-pay-btn__mark{width:22px;height:22px;border-radius:6px;background:#1a1216;color:#ff4081;display:inline-grid;place-items:center;font-size:13px;font-weight:900}' +
      '.freda-pay-btn--light .freda-pay-btn__mark{background:#ff4081;color:#fff}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function render(el) {
    if (el.getAttribute('data-freda-rendered')) return;
    var linkId = (el.getAttribute('data-freda-link') || '').trim();
    if (!/^lnk_[a-z0-9]+$/i.test(linkId)) {
      el.textContent = 'Freda Pay Issuing : identifiant de lien invalide (attendu : lnk_...).';
      return;
    }
    var theme = el.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var label = el.getAttribute('data-label') || 'Payer avec Freda Pay Issuing';

    var a = document.createElement('a');
    a.className = 'freda-pay-btn freda-pay-btn--' + theme;
    a.href = checkoutBase + (checkoutBase.indexOf('?') === -1 ? '?' : '&') + 'link=' + encodeURIComponent(linkId);
    a.target = el.getAttribute('data-target') === 'same' ? '_self' : '_blank';
    a.rel = 'noopener';

    var mark = document.createElement('span');
    mark.className = 'freda-pay-btn__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = 'F';

    a.appendChild(mark);
    a.appendChild(document.createTextNode(label));
    el.innerHTML = '';
    el.appendChild(a);
    el.setAttribute('data-freda-rendered', '1');
  }

  function init() {
    injectStyle();
    var els = document.querySelectorAll('[data-freda-link]');
    for (var i = 0; i < els.length; i++) render(els[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Pour les éditeurs qui ajoutent du contenu après le chargement (Wix, Webflow…).
  if (window.MutationObserver) {
    new MutationObserver(function () { init(); }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
