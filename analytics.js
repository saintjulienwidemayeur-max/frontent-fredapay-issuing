/* Mesure d'audience de Freda Pay Issuing : sans cookie, sans adresse IP stockée.
   Envoie seulement la page visitée et le site d'origine. Respecte "Do Not Track". */
(function () {
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    var base = window.FREDA_API_BASE_URL || 'https://api.fredapay.com';
    fetch(base + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname, referrer: document.referrer || '' }),
      keepalive: true,
    }).catch(function () {});
  } catch (e) { /* jamais d'erreur visible pour le visiteur */ }
})();
