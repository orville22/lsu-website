const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isAllowedOrigin(request: Request, siteUrl: string, development: boolean): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    const expected = new URL(siteUrl);
    const source = new URL(origin);
    if (source.origin !== origin) return false;
    if (origin === expected.origin) return true;
    if (!development) return false;

    // Next can normalise request.url to its bind address. Host identifies the
    // address the browser actually used; forwarded headers are not trusted.
    const target = new URL(request.url);
    const host = request.headers.get('host');
    if (host) target.host = host;

    return (
      loopbackHosts.has(expected.hostname) &&
      loopbackHosts.has(source.hostname) &&
      loopbackHosts.has(target.hostname) &&
      source.protocol === expected.protocol &&
      target.protocol === expected.protocol &&
      source.port === expected.port &&
      target.port === expected.port &&
      source.origin === target.origin
    );
  } catch {
    return false;
  }
}
