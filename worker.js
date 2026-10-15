// Cloudflare Worker (assets) : proxifie le blog et le sitemap vers le backend (Render), pour que
// l'URL que Google indexe reste sur notre propre domaine. Tout le reste est servi par les fichiers statiques.
const BACKEND = 'https://api.fredapay.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const isProxied = p === '/blog' || p.startsWith('/blog/') || p === '/sitemap.xml';
    if (!isProxied) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    try {
      const upstream = await fetch(BACKEND + p + url.search, {
        method: request.method,
        headers: { 'Accept': request.headers.get('Accept') || '*/*', 'Accept-Language': request.headers.get('Accept-Language') || '' },
        redirect: 'manual',
      });
      const headers = new Headers(upstream.headers);
      headers.delete('set-cookie');
      return new Response(upstream.body, { status: upstream.status, headers });
    } catch (e) {
      return new Response('Service temporairement indisponible.', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  },
};
