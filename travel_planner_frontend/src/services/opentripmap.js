const BASE = 'https://api.opentripmap.com/0.1/en/places';

/**
 * Resolve OpenTripMap API key from environment (optional but increasingly required).
 * Adds diagnostics in development to help identify misconfiguration.
 */
function getApiKey() {
  const key = process.env.REACT_APP_OPENTRIPMAP_API_KEY || '';

  // Dev diagnostics: show once per session if the key appears missing/misnamed.
  if (typeof window !== 'undefined' && process && process.env && process.env.NODE_ENV !== 'production') {
    if (!key) {
      // Common mistakes: wrong var name (missing REACT_APP_ prefix), forgot to restart dev server after editing .env
      // eslint-disable-next-line no-console
      console.warn(
        '[OpenTripMap] No API key detected at process.env.REACT_APP_OPENTRIPMAP_API_KEY.\n' +
        '- Ensure .env is placed in the project root (same folder as package.json).\n' +
        "- Variable name must start with 'REACT_APP_': REACT_APP_OPENTRIPMAP_API_KEY=<your_key>\n" + 
        '- After editing .env, restart the dev server (npm start) for CRA to load new env vars.'
      );
    } else {
      // eslint-disable-next-line no-console
      console.log('[OpenTripMap] API key detected and will be added as apikey query parameter.');
    }
  }
  return key;
}

/**
 * Fetch JSON with improved error handling for auth-required responses.
 */
async function getJson(url, { missingKeyHint } = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    throw new Error('Network error when contacting OpenTripMap: ' + err.message);
  }

  // Attempt to parse body text for better diagnostics on failure
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (!res.ok) {
    let text = '';
    try { text = await res.text(); } catch (_) { /* ignore */ }

    // Detect typical auth failures
    const bodyLower = (text || '').toLowerCase();
    const authLikely =
      res.status === 401 ||
      res.status === 403 ||
      bodyLower.includes('auth') ||
      bodyLower.includes('apikey') ||
      bodyLower.includes('api key') ||
      bodyLower.includes('requires authentication');

    if (authLikely) {
      // Provide actionable guidance
      const envLoadedKey = process?.env?.REACT_APP_OPENTRIPMAP_API_KEY ? '[present at build]' : '[missing at build]';
      const extra = (missingKeyHint || '') +
        `\n\nDetected env REACT_APP_OPENTRIPMAP_API_KEY: ${envLoadedKey}` +
        '\nCheckpoints:' +
        '\n1) Ensure the variable name is exactly REACT_APP_OPENTRIPMAP_API_KEY.' +
        '\n2) .env file must be in the project root (same directory as package.json).' +
        '\n3) After changing .env, fully restart the dev server (stop and run npm start again).' +
        '\n4) For deployed builds, rebuild the app with the env var set before running "npm run build".' +
        '\n5) Verify requests include ?apikey=... in the URL (check DevTools > Network).';

      throw new Error(`OpenTripMap authentication required (${res.status}).\n\nAction: ${extra || 'Provide a valid API key.'}`);
    }

    throw new Error(`OpenTripMap API failed (${res.status}): ${text || res.statusText}`);
  }

  try {
    return isJson ? await res.json() : JSON.parse(await res.text());
  } catch {
    throw new Error('OpenTripMap returned an invalid JSON response.');
  }
}

// PUBLIC_INTERFACE
export async function fetchAttractionsByRadius({ lat, lon, radius = 3000, kinds = 'interesting_places', limit = 30 }) {
  const apikey = getApiKey();
  const url = new URL(`${BASE}/radius`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('kinds', kinds);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  if (apikey) url.searchParams.set('apikey', apikey);

  const missingKeyHint = !apikey
    ? 'You are using OpenTripMap without an API key. Sign up for a free key at https://opentripmap.io/ and set REACT_APP_OPENTRIPMAP_API_KEY in your .env.'
    : null;

  // Dev diagnostics: log the outgoing URL sans key visibility
  if (typeof window !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
    const debugUrl = new URL(url.toString());
    if (debugUrl.searchParams.get('apikey')) {
      debugUrl.searchParams.set('apikey', '***redacted***');
    }
    // eslint-disable-next-line no-console
    console.debug('[OpenTripMap] Fetch URL:', debugUrl.toString());
  }

  const list = await getJson(url.toString(), { missingKeyHint });
  // Enrich details for each xid (optional for this version we map minimally)
  return list.map((p) => ({
    id: p.xid || `${p.point?.lat ?? p.lat},${p.point?.lon ?? p.lon}`,
    name: p.name || 'Attraction',
    lat: p.point?.lat ?? p.lat,
    lon: p.point?.lon ?? p.lon,
    kinds: p.kinds,
    rate: p.rate
  }));
}
