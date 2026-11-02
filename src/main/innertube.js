const crypto = require('crypto');
const { normalizeDataSyncId, hasApiSid } = require('./cookie-utils');

const MUSIC_BASE = 'https://music.youtube.com/youtubei/v1';
const MUSIC_ORIGIN = 'https://music.youtube.com';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const WEB_REMIX_CLIENT_VERSION = '1.20250101.01.00';
const WEB_REMIX_CLIENT_ID = '67';

// BitChord Innertube shell regex extractors
const CONFIG_LOGGED_IN = /"LOGGED_IN"\s*:\s*(true|false)/i;
const CONFIG_DATASYNC_ID = /"DATASYNC_ID"\s*:\s*"([^"]+)"/;
const CONFIG_PAGE_ID = /"DELEGATED_SESSION_ID"\s*:\s*"([^"]+)"/;
const CONFIG_SESSION_INDEX = /"SESSION_INDEX"\s*:\s*"?(\d+)"?/;
const CONFIG_VISITOR_DATA = /"VISITOR_DATA"\s*:\s*"([^"]+)"/;
const CONFIG_CLIENT_VERSION = /"INNERTUBE_CLIENT_VERSION"\s*:\s*"([^"]+)"/;
const SW_VISITOR_DATA_REGEX = /Cg[A-Za-z0-9_%-]{40,}/;

/**
 * Derives SAPISIDHASH authentication authorization header from Google cookie jar
 * Exactly matching BitChord Innertube.kt implementation.
 */
function sapisidHash(sapisid, origin = MUSIC_ORIGIN) {
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = crypto.createHash('sha1').update(`${timestamp} ${sapisid} ${origin}`).digest('hex');
  return `SAPISIDHASH ${timestamp}_${digest}`;
}

/**
 * Current authenticated session scope (identity, brand channel, auth user index, visitor data)
 * Exactly mirrors BitChord Innertube.kt SessionScope and ChannelSelection architecture.
 */
let currentSessionScope = {
  pageId: null,
  dataSyncId: null,
  authUser: '0',
  visitorData: null,
  clientVersion: null,
  loggedIn: false
};

function adoptSessionScope(scope) {
  if (!scope || !scope.loggedIn) {
    currentSessionScope = {
      pageId: null,
      dataSyncId: null,
      authUser: '0',
      visitorData: null,
      clientVersion: scope?.clientVersion || null,
      loggedIn: false
    };
    return;
  }
  currentSessionScope = {
    pageId: (scope.pageId && typeof scope.pageId === 'string' && scope.pageId.trim()) ? scope.pageId.trim() : null,
    dataSyncId: (scope.dataSyncId && typeof scope.dataSyncId === 'string' && scope.dataSyncId.trim()) ? scope.dataSyncId.trim() : null,
    authUser: (scope.authUser && typeof scope.authUser === 'string' && scope.authUser.trim()) ? scope.authUser.trim() : '0',
    visitorData: (scope.visitorData && typeof scope.visitorData === 'string' && scope.visitorData.trim()) ? scope.visitorData.trim() : currentSessionScope.visitorData || null,
    clientVersion: (scope.clientVersion && typeof scope.clientVersion === 'string' && scope.clientVersion.trim()) ? scope.clientVersion.trim() : currentSessionScope.clientVersion || null,
    loggedIn: true
  };
}

function getSessionScope() {
  return { ...currentSessionScope };
}

function selectChannel(pageId, dataSyncId, authUser) {
  currentSessionScope.pageId = pageId || null;
  currentSessionScope.dataSyncId = dataSyncId || null;
  if (authUser !== undefined && authUser !== null) {
    currentSessionScope.authUser = String(authUser);
  }
}

/**
 * Mints an anonymous YouTube visitor ID token via sw.js_data if none is currently held.
 * Directly matches BitChord Innertube.kt fetchVisitorData.
 */
async function fetchVisitorData() {
  try {
    const res = await fetch('https://www.youtube.com/sw.js_data', {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': '*/*'
      }
    });
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.match(SW_VISITOR_DATA_REGEX);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

async function ensureVisitorData(refresh = false) {
  if (!refresh && currentSessionScope.visitorData) {
    return currentSessionScope.visitorData;
  }
  const minted = await fetchVisitorData();
  if (minted) {
    currentSessionScope.visitorData = minted;
  }
  return currentSessionScope.visitorData;
}

/**
 * Reads ytcfg identity parameters from the live music.youtube.com shell.
 * Exactly matches BitChord Innertube.kt fetchSessionScope.
 */
async function fetchSessionScope(cookieStr, sapisid = null) {
  if (!cookieStr || typeof cookieStr !== 'string') return null;
  try {
    let resolvedSapisid = sapisid;
    if (!resolvedSapisid) {
      const parts = cookieStr.split(';');
      for (const part of parts) {
        const eq = part.indexOf('=');
        if (eq > 0) {
          const k = part.slice(0, eq).trim();
          const v = part.slice(eq + 1).trim();
          if (k === 'SAPISID' || k === '__Secure-3PAPISID' || k === '__Secure-1PAPISID') {
            resolvedSapisid = v;
            break;
          }
        }
      }
    }

    const fetchHeaders = {
      'User-Agent': CHROME_UA,
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': cookieStr,
      'Origin': MUSIC_ORIGIN,
      'Referer': `${MUSIC_ORIGIN}/`
    };
    if (resolvedSapisid) {
      fetchHeaders['Authorization'] = sapisidHash(resolvedSapisid);
    }

    const res = await fetch(`${MUSIC_ORIGIN}/`, {
      method: 'GET',
      headers: fetchHeaders
    });
    if (!res.ok) return null;
    const html = await res.text();

    const loggedInMatch = html.match(CONFIG_LOGGED_IN);
    const loggedIn = loggedInMatch ? loggedInMatch[1].toLowerCase() === 'true' : false;
    const clientVerMatch = html.match(CONFIG_CLIENT_VERSION);
    const clientVersion = clientVerMatch ? clientVerMatch[1] : null;

    // Matching BitChord Innertube.kt lines 420-426:
    // Never extract DATASYNC_ID or DELEGATED_SESSION_ID from a signed-out HTML shell,
    // because a signed-out shell's DATASYNC_ID is an anonymous visitor token (e.g. V660a5407||)
    // which causes HTTP 401 on every InnerTube request if sent as onBehalfOfUser.
    const pageIdMatch = loggedIn ? html.match(CONFIG_PAGE_ID) : null;
    const pageId = (pageIdMatch && pageIdMatch[1].trim()) ? pageIdMatch[1].trim() : null;

    const dataSyncMatch = loggedIn ? html.match(CONFIG_DATASYNC_ID) : null;
    const rawDataSyncId = (dataSyncMatch && dataSyncMatch[1].trim()) ? dataSyncMatch[1].trim() : null;
    const normalizedSync = normalizeDataSyncId(rawDataSyncId);
    const isAnonVisitorToken = normalizedSync && /^V[0-9a-f]{8}$/i.test(normalizedSync);
    const dataSyncId = pageId || (isAnonVisitorToken ? null : normalizedSync);

    const authUserMatch = loggedIn ? html.match(CONFIG_SESSION_INDEX) : null;
    const authUser = (authUserMatch && authUserMatch[1]) ? authUserMatch[1] : '0';

    const visitorMatch = html.match(CONFIG_VISITOR_DATA);
    const visitorData = (visitorMatch && visitorMatch[1].trim()) ? visitorMatch[1].trim() : null;

    const isAuthentic = loggedIn || hasApiSid(cookieStr);

    if (!isAuthentic) {
      return {
        pageId: null,
        dataSyncId: null,
        authUser: '0',
        visitorData: null,
        clientVersion: clientVersion || WEB_REMIX_CLIENT_VERSION,
        loggedIn: false
      };
    }

    return {
      pageId,
      dataSyncId,
      authUser,
      visitorData,
      clientVersion: clientVersion || WEB_REMIX_CLIENT_VERSION,
      loggedIn: true
    };
  } catch (err) {
    console.warn('[InnerTube] fetchSessionScope notice:', err.message);
    return null;
  }
}

let isScopingInProgress = false;

/**
 * Ensures the session is scoped to the authentic identity and channel in the session partition.
 * Matches BitChord Innertube.kt ensureSessionScope.
 */
async function ensureSessionScope(ses, forceRefresh = false) {
  if (!ses) return currentSessionScope;
  if (!forceRefresh && currentSessionScope.loggedIn && currentSessionScope.dataSyncId) {
    return currentSessionScope;
  }
  if (isScopingInProgress) return currentSessionScope;
  isScopingInProgress = true;
  try {
    const { isLoggedIn, cookieStr } = await getAuthContext(ses);
    if (!isLoggedIn || !cookieStr) {
      if (!currentSessionScope.visitorData) {
        await ensureVisitorData();
      }
      return currentSessionScope;
    }
    const freshScope = await fetchSessionScope(cookieStr);
    if (freshScope && freshScope.loggedIn) {
      adoptSessionScope(freshScope);
    } else if (!currentSessionScope.visitorData) {
      await ensureVisitorData();
    }
  } catch (err) {
    console.warn('[InnerTube] ensureSessionScope notice:', err.message);
  } finally {
    isScopingInProgress = false;
  }
  return currentSessionScope;
}

async function getAuthContext(ses) {
  if (!ses) return { headers: getDefaultHeaders(), isLoggedIn: false, cookieStr: '' };
  try {
    const allPartitionCookies = await ses.cookies.get({}).catch(() => []);
    const cookies = await ses.cookies.get({ url: MUSIC_ORIGIN }).catch(() => []);
    const ytCookies = await ses.cookies.get({ domain: '.youtube.com' }).catch(() => []);
    const ytDomainCookies = await ses.cookies.get({ domain: 'youtube.com' }).catch(() => []);
    const googleCookies = await ses.cookies.get({ domain: '.google.com' }).catch(() => []);
    const googleDomainCookies = await ses.cookies.get({ domain: 'google.com' }).catch(() => []);

    // Merge partition cookies while prioritizing YouTube domain cookies over generic Google cookies
    const allCookies = [...allPartitionCookies, ...googleCookies, ...googleDomainCookies, ...cookies, ...ytCookies, ...ytDomainCookies];
    const cookieMap = {};
    const ytCookieMap = {};

    allCookies.forEach(c => {
      if (c && c.name && c.value !== undefined) {
        cookieMap[c.name] = c.value;
        const dom = (c.domain || '').toLowerCase();
        if (dom.includes('youtube') || dom.includes('music.youtube') || (c.url && c.url.includes('youtube'))) {
          ytCookieMap[c.name] = c.value;
        }
      }
    });

    // YouTube specific cookies override
    [...cookies, ...ytCookies, ...ytDomainCookies].forEach(c => {
      if (c && c.name && c.value !== undefined) {
        cookieMap[c.name] = c.value;
        ytCookieMap[c.name] = c.value;
      }
    });

    const cookieStr = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
    const sapisid = ytCookieMap['SAPISID'] || ytCookieMap['__Secure-3PAPISID'] || ytCookieMap['__Secure-1PAPISID'] ||
                    cookieMap['SAPISID'] || cookieMap['__Secure-3PAPISID'] || cookieMap['__Secure-1PAPISID'];
    const isLoggedIn = !!(
      ytCookieMap['SAPISID'] ||
      ytCookieMap['LOGIN_INFO'] ||
      ytCookieMap['__Secure-3PAPISID'] ||
      ytCookieMap['__Secure-1PAPISID'] ||
      ytCookieMap['SID']
    );

    const headers = getDefaultHeaders();
    if (cookieStr) {
      headers['Cookie'] = cookieStr;
      if (sapisid) {
        headers['Authorization'] = sapisidHash(sapisid);
      }
      const authUser = currentSessionScope.authUser || '0';
      headers['X-Goog-AuthUser'] = authUser;
      headers['X-Origin'] = MUSIC_ORIGIN;
      headers['Origin'] = MUSIC_ORIGIN;
      headers['Referer'] = `${MUSIC_ORIGIN}/`;
      if (currentSessionScope.pageId) {
        headers['X-Goog-PageId'] = currentSessionScope.pageId;
      }
      if (currentSessionScope.visitorData) {
        headers['X-Goog-Visitor-Id'] = currentSessionScope.visitorData;
      }
    }
    return { headers, isLoggedIn, cookieStr };
  } catch (err) {
    console.warn('[InnerTube] getAuthContext warning:', err.message);
    return { headers: getDefaultHeaders(), isLoggedIn: false, cookieStr: '' };
  }
}

function getDefaultHeaders() {
  return {
    'Content-Type': 'application/json',
    'User-Agent': CHROME_UA,
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Origin': MUSIC_ORIGIN,
    'Origin': MUSIC_ORIGIN,
    'Referer': `${MUSIC_ORIGIN}/`,
    'X-YouTube-Client-Name': WEB_REMIX_CLIENT_ID,
    'X-YouTube-Client-Version': WEB_REMIX_CLIENT_VERSION
  };
}

/**
 * Deduplicates case-insensitive header keys so Node.js fetch (undici) never
 * concatenates duplicate keys into comma-separated values like "0, 0".
 */
function sanitizeFetchHeaders(rawHeaders) {
  const clean = {};
  const seenLower = new Map();
  for (const [k, v] of Object.entries(rawHeaders || {})) {
    if (v === undefined || v === null) continue;
    const lower = k.toLowerCase();
    if (seenLower.has(lower)) {
      delete clean[seenLower.get(lower)];
    }
    seenLower.set(lower, k);
    clean[k] = String(v);
  }
  return clean;
}

function isPublicReadEndpoint(endpoint, body = {}) {
  if (
    endpoint === 'search' ||
    endpoint === 'music/get_search_suggestions' ||
    endpoint === 'next' ||
    endpoint === 'player' ||
    endpoint === 'get_transcript'
  ) {
    return true;
  }
  if (endpoint === 'browse') {
    const bId = String(body?.browseId || '');
    if (
      bId.startsWith('FEmusic_library') ||
      bId.startsWith('FEmusic_liked') ||
      bId === 'FEmusic_history' ||
      bId === 'VLLM' ||
      bId === 'LM'
    ) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Makes an authenticated request to YouTube Music InnerTube endpoint.
 * Supports query parameters, header version alignment, and clean scope fallback.
 */
async function postMusic(endpoint, body = {}, ses = null, queryParams = null) {
  if (ses && !currentSessionScope.loggedIn) {
    await ensureSessionScope(ses).catch(() => {});
  }
  const { headers } = await getAuthContext(ses);
  const clientVersion = currentSessionScope.clientVersion || WEB_REMIX_CLIENT_VERSION;
  headers['X-YouTube-Client-Version'] = clientVersion;

  const validDataSyncId = (currentSessionScope.dataSyncId && !/^V[0-9a-f]{8}$/i.test(currentSessionScope.dataSyncId))
    ? currentSessionScope.dataSyncId
    : null;

  const buildPayload = (includeDataSync = true) => ({
    context: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion,
        hl: 'en',
        gl: 'US',
        ...(currentSessionScope.visitorData ? { visitorData: currentSessionScope.visitorData } : {})
      },
      user: {
        lockedSafetyMode: false,
        ...(includeDataSync && validDataSyncId ? { onBehalfOfUser: validDataSyncId } : {})
      },
      request: {
        useSsl: true
      }
    },
    ...body
  });

  let url = `${MUSIC_BASE}/${endpoint}?prettyPrint=false`;
  if (queryParams && typeof queryParams === 'object') {
    for (const [k, v] of Object.entries(queryParams)) {
      if (v !== undefined && v !== null) {
        url += `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      }
    }
  }

  const reqHeaders = sanitizeFetchHeaders(headers);
  let response = await fetch(url, {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify(buildPayload(true))
  });

  // If rejected with 400/401/403 and onBehalfOfUser or pageId was sent, retry once without onBehalfOfUser and X-Goog-PageId
  // (BitChord fallback for session scope mismatch where Google rejects outdated/guessed dataSyncId or brand pageId)
  if (!response.ok && (response.status === 400 || response.status === 401 || response.status === 403) && (validDataSyncId || currentSessionScope.pageId)) {
    console.warn(`[InnerTube] HTTP ${response.status} on ${endpoint}; retrying without onBehalfOfUser and X-Goog-PageId`);
    const fallbackHeaders = { ...reqHeaders };
    delete fallbackHeaders['X-Goog-PageId'];
    delete fallbackHeaders['x-goog-pageid'];
    response = await fetch(url, {
      method: 'POST',
      headers: sanitizeFetchHeaders(fallbackHeaders),
      body: JSON.stringify(buildPayload(false))
    });
  }

  // If still rejected with 400/401/403 on a public catalogue endpoint (e.g., partial/expired cookie jar),
  // retry anonymously with clean WEB_REMIX guest headers so Search / Home / Explore / Artist / Album never fail.
  if (!response.ok && (response.status === 400 || response.status === 401 || response.status === 403) && reqHeaders['Cookie'] && isPublicReadEndpoint(endpoint, body)) {
    console.warn(`[InnerTube] HTTP ${response.status} on public endpoint ${endpoint}; retrying anonymously`);
    const anonHeaders = getDefaultHeaders();
    anonHeaders['X-YouTube-Client-Version'] = clientVersion;
    if (currentSessionScope.visitorData) {
      anonHeaders['X-Goog-Visitor-Id'] = currentSessionScope.visitorData;
    }
    response = await fetch(url, {
      method: 'POST',
      headers: sanitizeFetchHeaders(anonHeaders),
      body: JSON.stringify(buildPayload(false))
    });
  }

  if (!response.ok) {
    throw new Error(`InnerTube HTTP ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  if (!currentSessionScope.visitorData && json?.responseContext?.visitorData) {
    currentSessionScope.visitorData = json.responseContext.visitorData;
  }
  return json;
}

/**
 * Extracts continuation token from any modern or legacy InnerTube response.
 * Matches BitChord InnertubeParser.continuationToken.
 */
function extractContinuationToken(data) {
  let token = null;
  function walk(node) {
    if (token || !node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
        if (token) return;
      }
      return;
    }
    if (node.continuationItemRenderer) {
      const ep = node.continuationItemRenderer.continuationEndpoint;
      token = ep?.continuationCommand?.token || ep?.browseContinuationEndpoint?.continuationCommand?.token;
      if (token) return;
    }
    if (node.continuationCommand && typeof node.continuationCommand.token === 'string') {
      token = node.continuationCommand.token;
      if (token) return;
    }
    if (node.nextContinuationData && typeof node.nextContinuationData.continuation === 'string') {
      token = node.nextContinuationData.continuation;
      if (token) return;
    }
    if (node.reloadContinuationData && typeof node.reloadContinuationData.continuation === 'string') {
      token = node.reloadContinuationData.continuation;
      if (token) return;
    }
    if (node.nextRadioContinuationData && typeof node.nextRadioContinuationData.continuation === 'string') {
      token = node.nextRadioContinuationData.continuation;
      if (token) return;
    }
    for (const val of Object.values(node)) {
      walk(val);
      if (token) return;
    }
  }
  walk(data);
  return token;
}

/**
 * Follows an InnerTube browse continuation token.
 * Exactly matches BitChord Innertube.kt browseContinuation.
 */
async function getBrowseContinuation(token, ses) {
  if (!token) return null;
  try {
    return await postMusic('browse', {
      continuation: token
    }, ses, {
      ctoken: token,
      continuation: token,
      type: 'next'
    });
  } catch (err) {
    console.warn('[InnerTube] getBrowseContinuation notice:', err.message);
    return null;
  }
}

/**
 * Parses all available account channels from account switcher or account menu responses.
 * Exactly matches BitChord InnertubeParser.parseAccountChannels architecture:
 * - Scans for accountItem renderers across the response tree
 * - Extracts accountName, channelHandle, accountByline, accountPhoto thumbnails
 * - Extracts pageId (for delegated brand accounts) and datasyncIdToken (normalized)
 * - Identifies isSelected active state
 * - Drops entries with neither pageId nor dataSyncId (unselectable)
 * - Deduplicates profiles by unique identity key
 */
function parseAccountChannels(root) {
  if (!root || typeof root !== 'object') return [];
  const channels = [];
  const seenKeys = new Set();

  function findStringVal(obj, key) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj[key] !== undefined && obj[key] !== null) {
      if (typeof obj[key] === 'string') return obj[key];
      if (typeof obj[key] === 'object' && obj[key][key] && typeof obj[key][key] === 'string') {
        return obj[key][key];
      }
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') {
        const found = findStringVal(v, key);
        if (found !== null) return found;
      }
    }
    return null;
  }

  function getText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj.trim();
    if (Array.isArray(obj.runs)) {
      return obj.runs.map(r => r.text || '').join('').trim();
    }
    if (obj.simpleText) return String(obj.simpleText).trim();
    return '';
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const el of node) walk(el);
      return;
    }

    if (node.accountItem || node.accountItemRenderer) {
      const item = node.accountItem || node.accountItemRenderer;
      const name = getText(item.accountName);
      if (name) {
        const subtitle = getText(item.channelHandle) ||
                         getText(item.accountByline) ||
                         getText(item.email) || '';
        const thumbs = item.accountPhoto?.thumbnails || item.avatar?.thumbnails || item.thumbnail?.thumbnails || [];
        const thumbnailUrl = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';

        const rawPageId = findStringVal(item, 'pageId');
        const pageId = rawPageId ? String(rawPageId).trim() : null;

        const rawDataSync = findStringVal(item, 'datasyncIdToken');
        const dataSyncId = rawDataSync ? normalizeDataSyncId(String(rawDataSync)) : null;

        if (pageId !== null || dataSyncId !== null) {
          const isSelected = item.isSelected === true ||
                             item.isSelected === 'true' ||
                             (item.isSelected && item.isSelected.content === 'true');
          const key = pageId ? `page:${pageId}` : `sync:${dataSyncId}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            channels.push({
              name,
              subtitle,
              handle: subtitle,
              thumbnailUrl,
              photoUrl: thumbnailUrl,
              pageId,
              dataSyncId,
              activeOnWeb: Boolean(isSelected),
              isSelected: Boolean(isSelected)
            });
          }
        }
      }
    }

    for (const val of Object.values(node)) {
      walk(val);
    }
  }

  walk(root);
  return channels;
}

/**
 * Extracts pageId and datasyncIdToken from account menu or account list data.
 * Matches BitChord parseAccountChannels logic.
 */
function extractIdentityTokensFromAccountMenu(root) {
  const channels = parseAccountChannels(root);
  const active = channels.find(c => c.isSelected || c.activeOnWeb) || channels[0];
  if (active) {
    return { pageId: active.pageId, dataSyncId: active.dataSyncId };
  }
  return { pageId: null, dataSyncId: null };
}

/**
 * Fetches youtube.com's account switcher endpoint as a secondary channel/profile enumerator.
 * Matches BitChord Innertube.kt accountSwitcher() lines 570-591.
 */
async function getAccountSwitcher(ses) {
  if (!ses) return null;
  try {
    const { isLoggedIn, cookieStr } = await getAuthContext(ses);
    if (!isLoggedIn || !cookieStr) return null;

    let sapisid = null;
    for (const part of cookieStr.split(';')) {
      const eq = part.indexOf('=');
      if (eq > 0) {
        const k = part.slice(0, eq).trim();
        const v = part.slice(eq + 1).trim();
        if (k === 'SAPISID' || k === '__Secure-3PAPISID' || k === '__Secure-1PAPISID') {
          sapisid = v;
          break;
        }
      }
    }

    const ytOrigin = 'https://www.youtube.com';
    const headers = {
      'User-Agent': CHROME_UA,
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Origin': ytOrigin,
      'Referer': `${ytOrigin}/`,
      'Cookie': cookieStr,
      'X-Goog-AuthUser': currentSessionScope.authUser || '0'
    };
    if (sapisid) {
      headers['Authorization'] = sapisidHash(sapisid, ytOrigin);
    }

    const res = await fetch(`${ytOrigin}/getAccountSwitcherEndpoint`, {
      method: 'GET',
      headers
    });
    if (!res.ok) return null;
    const text = await res.text();
    const cleanBody = text.includes(")]}'") ? text.slice(text.indexOf(")]}'") + 4).trim() : text.trim();
    return JSON.parse(cleanBody);
  } catch (err) {
    console.warn('[InnerTube] getAccountSwitcher notice:', err.message);
    return null;
  }
}

/**
 * Retrieves the user's account info from YouTube Music when logged in.
 */
async function getAccountInfo(ses) {
  try {
    if (ses && (!currentSessionScope.loggedIn || !currentSessionScope.dataSyncId)) {
      await ensureSessionScope(ses).catch(() => {});
    }
    const { isLoggedIn } = await getAuthContext(ses);
    if (!isLoggedIn) {
      return { isLoggedIn: false, channels: [] };
    }

    let data = null;
    try {
      data = await postMusic('account/account_menu', {}, ses);
    } catch (menuErr) {
      console.warn('[InnerTube] account_menu notice:', menuErr.message);
    }

    let name = 'Google User';
    let handle = '';
    let avatarUrl = '';

    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      const h = node.activeAccountHeaderRenderer || node.accountHeaderRenderer || node.accountItemRenderer || node.accountItem;
      if (h) {
        const candidateName = h.accountName?.runs?.[0]?.text ||
                              h.channelTitle?.runs?.[0]?.text ||
                              h.channelName?.runs?.[0]?.text ||
                              h.title?.runs?.[0]?.text ||
                              h.accountName?.simpleText ||
                              h.channelTitle?.simpleText ||
                              h.title?.simpleText;
        if (candidateName && (name === 'Google User' || h.isSelected === true || node.activeAccountHeaderRenderer)) {
          name = candidateName;
        }
        const candidateHandle = h.channelHandle?.runs?.[0]?.text ||
                                h.email?.runs?.[0]?.text ||
                                h.accountByline?.runs?.[0]?.text ||
                                h.byline?.runs?.[0]?.text ||
                                h.channelHandle?.simpleText ||
                                h.email?.simpleText ||
                                h.accountByline?.simpleText;
        if (candidateHandle && (!handle || h.isSelected === true || node.activeAccountHeaderRenderer)) {
          handle = candidateHandle;
        }
        const thumbs = h.accountPhoto?.thumbnails || h.avatar?.thumbnails || h.thumbnail?.thumbnails || h.thumbnails || [];
        if (thumbs.length > 0 && (!avatarUrl || h.isSelected === true || node.activeAccountHeaderRenderer)) {
          avatarUrl = thumbs[thumbs.length - 1].url;
        }
      }
      if (node.googleAccountHeaderRenderer) {
        const gh = node.googleAccountHeaderRenderer;
        const ghName = gh.name?.runs?.[0]?.text || gh.name?.simpleText;
        const ghEmail = gh.email?.runs?.[0]?.text || gh.email?.simpleText;
        if (ghName && name === 'Google User') name = ghName;
        if (ghEmail && !handle) handle = ghEmail;
      }
      Object.values(node).forEach(walk);
    }
    if (data) walk(data);

    // Extract channels and identity tokens from account menu & accounts_list & accountSwitcher (BitChord architecture)
    let channels = data ? parseAccountChannels(data) : [];
    let tokens = data ? extractIdentityTokensFromAccountMenu(data) : { pageId: null, dataSyncId: null };

    if (channels.length === 0) {
      try {
        const listData = await postMusic('account/accounts_list', {}, ses);
        if (listData) {
          walk(listData);
          const listChannels = parseAccountChannels(listData);
          if (listChannels.length > 0) {
            channels = listChannels;
            const listTokens = extractIdentityTokensFromAccountMenu(listData);
            if (!tokens.pageId && listTokens.pageId) tokens.pageId = listTokens.pageId;
            if (!tokens.dataSyncId && listTokens.dataSyncId) tokens.dataSyncId = listTokens.dataSyncId;
          }
        }
      } catch {}
    }

    if (channels.length === 0 || name === 'Google User') {
      try {
        const switcherData = await getAccountSwitcher(ses);
        if (switcherData) {
          walk(switcherData);
          const switcherChannels = parseAccountChannels(switcherData);
          if (switcherChannels.length > 0) {
            channels = switcherChannels;
            const switcherTokens = extractIdentityTokensFromAccountMenu(switcherData);
            if (!tokens.pageId && switcherTokens.pageId) tokens.pageId = switcherTokens.pageId;
            if (!tokens.dataSyncId && switcherTokens.dataSyncId) tokens.dataSyncId = switcherTokens.dataSyncId;
          }
        }
      } catch {}
    }

    // If neither account_menu nor getAccountSwitcher returned any valid account data, throw to trigger fallback
    if (!data && channels.length === 0 && name === 'Google User') {
      throw new Error('Could not retrieve account details from YouTube Music');
    }

    if (tokens.pageId && !currentSessionScope.pageId) {
      currentSessionScope.pageId = tokens.pageId;
    }
    if (tokens.dataSyncId && !currentSessionScope.dataSyncId) {
      currentSessionScope.dataSyncId = tokens.dataSyncId;
    }

    // Ensure active channel state reflects currentSessionScope
    if (channels.length > 0) {
      channels.forEach(ch => {
        ch.isSelected = currentSessionScope.pageId
          ? ch.pageId === currentSessionScope.pageId
          : Boolean(ch.activeOnWeb || (!ch.pageId && ch.dataSyncId === currentSessionScope.dataSyncId));
      });
      const selectedChannel = channels.find(ch => ch.isSelected);
      if (selectedChannel) {
        if (selectedChannel.name) name = selectedChannel.name;
        if (selectedChannel.handle || selectedChannel.subtitle) {
          handle = selectedChannel.handle || selectedChannel.subtitle || handle;
        }
        if (selectedChannel.thumbnailUrl || selectedChannel.photoUrl) {
          avatarUrl = selectedChannel.thumbnailUrl || selectedChannel.photoUrl || avatarUrl;
        }
      }
    } else {
      channels.push({
        name,
        subtitle: handle,
        handle,
        thumbnailUrl: avatarUrl,
        photoUrl: avatarUrl,
        pageId: currentSessionScope.pageId,
        dataSyncId: currentSessionScope.dataSyncId,
        activeOnWeb: true,
        isSelected: true
      });
    }

    return {
      isLoggedIn: true,
      name,
      channelTitle: name,
      handle,
      avatarUrl,
      photoUrl: avatarUrl,
      pageId: currentSessionScope.pageId,
      dataSyncId: currentSessionScope.dataSyncId,
      authUser: currentSessionScope.authUser,
      channels
    };
  } catch (err) {
    console.warn('[InnerTube] getAccountInfo error:', err.message);
    const auth = await getAuthContext(ses).catch(() => ({ isLoggedIn: false }));
    if (auth && auth.isLoggedIn) {
      let savedAcc = null;
      try {
        const authStore = require('./auth-store');
        const sessionData = authStore.loadAuthSession();
        if (sessionData && sessionData.account && sessionData.account.isLoggedIn) {
          savedAcc = sessionData.account;
        }
      } catch {}

      const fallbackName = (savedAcc?.name && savedAcc.name !== 'Google User') ? savedAcc.name : 'YouTube Music';
      const fallbackHandle = (savedAcc?.handle && savedAcc.handle !== '@user') ? savedAcc.handle : 'YouTube Music Account';
      return {
        isLoggedIn: true,
        name: fallbackName,
        channelTitle: (savedAcc?.channelTitle && savedAcc.channelTitle !== 'Google User') ? savedAcc.channelTitle : fallbackName,
        handle: fallbackHandle,
        avatarUrl: savedAcc?.avatarUrl || savedAcc?.photoUrl || '',
        photoUrl: savedAcc?.photoUrl || savedAcc?.avatarUrl || '',
        pageId: currentSessionScope.pageId || savedAcc?.pageId || null,
        dataSyncId: currentSessionScope.dataSyncId || savedAcc?.dataSyncId || null,
        authUser: currentSessionScope.authUser || savedAcc?.authUser || '0',
        channels: savedAcc?.channels || [{
          name: fallbackName,
          subtitle: fallbackHandle,
          handle: fallbackHandle,
          thumbnailUrl: savedAcc?.avatarUrl || '',
          photoUrl: savedAcc?.photoUrl || '',
          pageId: currentSessionScope.pageId || null,
          dataSyncId: currentSessionScope.dataSyncId || null,
          activeOnWeb: true,
          isSelected: true
        }]
      };
    }
    return {
      isLoggedIn: false,
      name: '',
      channelTitle: '',
      handle: '',
      avatarUrl: '',
      photoUrl: '',
      pageId: null,
      dataSyncId: null,
      authUser: '0',
      channels: []
    };
  }
}

/**
 * Parses YouTube Music Home Feed (Quick picks, Recommended, Trending).
 */
async function getHomeFeed(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_home' }, ses);
    return parseHomeResponse(data);
  } catch (err) {
    console.warn('[InnerTube] getHomeFeed error:', err.message);
    return { shelves: [], tracks: [] };
  }
}

/**
 * Parses YouTube Music Explore Feed (New releases, Trending, Moods & Genres).
 */
async function getExploreFeed(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_explore' }, ses);
    return parseExploreResponse(data);
  } catch (err) {
    console.warn('[InnerTube] getExploreFeed error:', err.message);
    return { shelves: [], tracks: [] };
  }
}

/**
 * Browses a specific playlist or album by browseId (e.g. VL..., PL..., MPREb..., etc.).
 * Supports continuation token paging for comprehensive track retrieval.
 */
async function getPlaylist(browseId, ses) {
  if (!browseId || typeof browseId !== 'string') return null;
  let targetId = browseId.trim();
  if (targetId.startsWith('PL')) {
    targetId = 'VL' + targetId;
  }

  async function fetchPlaylistWithContinuations(id) {
    try {
      const data = await postMusic('browse', { browseId: id }, ses);
      if (!data) return null;
      const parsed = parsePlaylistResponse(data, id);
      if (!parsed) return null;

      let token = extractContinuationToken(data);
      let page = 1;
      while (token && page < 10) {
        page++;
        const contData = await getBrowseContinuation(token, ses);
        if (!contData) break;
        const contParsed = parsePlaylistResponse(contData, id);
        if (contParsed && contParsed.songs && contParsed.songs.length > 0) {
          for (const s of contParsed.songs) {
            if (!parsed.songs.some(existing => existing.videoId === s.videoId)) {
              parsed.songs.push(s);
            }
          }
        }
        token = extractContinuationToken(contData);
      }
      return parsed;
    } catch (err) {
      console.warn(`[InnerTube] getPlaylist error for ${id}:`, err.message);
      return null;
    }
  }

  let res = await fetchPlaylistWithContinuations(targetId);
  if (res && res.songs && res.songs.length > 0) {
    return res;
  }
  if (targetId !== browseId) {
    const origRes = await fetchPlaylistWithContinuations(browseId);
    if (origRes && origRes.songs && origRes.songs.length > 0) {
      return origRes;
    }
  }
  return res || { title: 'Playlist', subtitle: 'YouTube Music', cover: '', songs: [] };
}

/**
 * Parses YouTube Music Charts (Video charts, Top artists).
 */
async function getChartsFeed(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_charts' }, ses);
    const parsed = parseChartsResponse(data);
    const videoChartsShelf = parsed.shelves.find(s => s.title && (s.title.toLowerCase().includes('chart') || s.title.toLowerCase().includes('video')));
    const firstChartItem = videoChartsShelf?.items?.find(it => it.browseId) || videoChartsShelf?.items?.[0];
    if (firstChartItem?.browseId && parsed.tracks.length === 0) {
      try {
        const chartDetail = await getPlaylist(firstChartItem.browseId, ses);
        if (chartDetail && chartDetail.songs && chartDetail.songs.length > 0) {
          parsed.tracks = chartDetail.songs;
        }
      } catch (err) {
        console.warn('[InnerTube] Top chart tracks fetch notice:', err.message);
      }
    }
    return parsed;
  } catch (err) {
    console.warn('[InnerTube] getChartsFeed error:', err.message);
    return { shelves: [], tracks: [], artists: [] };
  }
}

/**
 * Parses YouTube Music New Releases (Albums & singles, Music videos).
 */
async function getNewReleasesFeed(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_new_releases' }, ses);
    return parseNewReleasesResponse(data);
  } catch (err) {
    console.warn('[InnerTube] getNewReleasesFeed error:', err.message);
    return { shelves: [], tracks: [] };
  }
}

/**
 * Fetches user's Liked Songs library playlist (FEmusic_liked_videos, VLLM, LM).
 * Supports continuation token paging for comprehensive liked library retrieval.
 */
async function getLibrarySongs(ses) {
  async function fetchSongsWithContinuations(browseId) {
    try {
      const data = await postMusic('browse', { browseId }, ses);
      if (!data) return null;
      const res = parsePlaylistResponse(data, browseId);
      if (!res || !res.songs || res.songs.length === 0) return null;

      let token = extractContinuationToken(data);
      let page = 1;
      while (token && page < 10) {
        page++;
        const contData = await getBrowseContinuation(token, ses);
        if (!contData) break;
        const contRes = parsePlaylistResponse(contData, browseId);
        if (contRes && contRes.songs && contRes.songs.length > 0) {
          for (const s of contRes.songs) {
            if (!res.songs.some(existing => existing.videoId === s.videoId)) {
              res.songs.push(s);
            }
          }
        }
        token = extractContinuationToken(contData);
      }
      return res;
    } catch (err) {
      console.warn(`[InnerTube] getLibrarySongs (${browseId}) notice:`, err.message);
      return null;
    }
  }

  const res1 = await fetchSongsWithContinuations('FEmusic_liked_videos');
  if (res1 && res1.songs && res1.songs.length > 0) return res1;

  const res2 = await fetchSongsWithContinuations('VLLM');
  if (res2 && res2.songs && res2.songs.length > 0) return res2;

  const res3 = await fetchSongsWithContinuations('LM');
  if (res3 && res3.songs && res3.songs.length > 0) return res3;

  return { songs: [] };
}

/**
 * Fetches user's custom and saved playlists from YouTube Music:
 * Queries FEmusic_liked_playlists, FEmusic_library_playlists, and FEmusic_library_landing.
 * Merges, paginates via continuations, and deduplicates all user playlists.
 */
async function getLibraryPlaylists(ses) {
  const playlists = [];
  const seenBrowseIds = new Set();

  function addPlaylists(items) {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (!item || !item.title) continue;
      const bId = item.browseId || (item.playlistId ? (item.playlistId.startsWith('VL') ? item.playlistId : `VL${item.playlistId}`) : null);
      if (!bId) continue;
      if (bId.toLowerCase().includes('create') || bId === 'FEplaylist_add') continue;
      if (bId === 'VLLM' || bId === 'LM' || bId === 'FEmusic_liked_videos') continue;

      const cleanId = bId.replace(/^VL/, '');
      const excludedPrefixes = ['LM', 'SE', 'RD', 'OLAK', 'MPRE', 'UC'];
      if (excludedPrefixes.some(p => cleanId.startsWith(p) || bId.startsWith(p))) continue;

      let normalizedBrowseId = bId;
      if (!bId.startsWith('VL') && !bId.startsWith('FE')) {
        normalizedBrowseId = `VL${bId}`;
      }
      const key = normalizedBrowseId.replace(/^VL/, '');
      if (!seenBrowseIds.has(key) && !seenBrowseIds.has(normalizedBrowseId)) {
        seenBrowseIds.add(key);
        seenBrowseIds.add(normalizedBrowseId);
        playlists.push({
          ...item,
          browseId: normalizedBrowseId,
          playlistId: key,
          id: item.id || `browse-${normalizedBrowseId}`
        });
      }
    }
  }

  async function fetchFeedWithContinuations(browseId) {
    try {
      const data = await postMusic('browse', { browseId }, ses);
      if (!data) return;
      addPlaylists(parseLibraryPlaylistsResponse(data));

      let token = extractContinuationToken(data);
      let page = 1;
      while (token && page < 10) {
        page++;
        const contData = await getBrowseContinuation(token, ses);
        if (!contData) break;
        addPlaylists(parseLibraryPlaylistsResponse(contData));
        token = extractContinuationToken(contData);
      }
    } catch (err) {
      console.warn(`[InnerTube] getLibraryPlaylists (${browseId}) notice:`, err.message);
    }
  }

  // Concurrently query FEmusic_liked_playlists, FEmusic_library_playlists, and FEmusic_library_landing
  await Promise.allSettled([
    fetchFeedWithContinuations('FEmusic_liked_playlists'),
    fetchFeedWithContinuations('FEmusic_library_playlists'),
    fetchFeedWithContinuations('FEmusic_library_landing')
  ]);

  return playlists;
}
/**
 * Fetches user's saved albums from library (FEmusic_liked_albums).
 * Supports continuation token paging for complete library retrieval.
 */
async function getLibraryAlbums(ses) {
  const albums = [];
  const seen = new Set();
  const addItems = (items) => {
    if (!Array.isArray(items)) return;
    for (const it of items) {
      const key = it.browseId || it.playlistId || it.id || it.title;
      if (key && !seen.has(key)) {
        seen.add(key);
        albums.push(it);
      }
    }
  };

  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_liked_albums' }, ses);
    if (!data) return [];
    addItems(parseLibraryPlaylistsResponse(data));

    let token = extractContinuationToken(data);
    let page = 1;
    while (token && page < 10) {
      page++;
      const contData = await getBrowseContinuation(token, ses);
      if (!contData) break;
      addItems(parseLibraryPlaylistsResponse(contData));
      token = extractContinuationToken(contData);
    }
    return albums;
  } catch (err) {
    console.warn('[InnerTube] getLibraryAlbums notice:', err.message);
    return albums;
  }
}

/**
 * Fetches user's subscribed artists from library.
 * Paginates both library corpus endpoints via continuations.
 */
async function getLibraryArtists(ses) {
  const artists = [];
  const seen = new Set();
  const addItems = (items) => {
    if (!Array.isArray(items)) return;
    for (const it of items) {
      const key = it.browseId || it.title;
      if (key && !seen.has(key)) {
        seen.add(key);
        artists.push(it);
      }
    }
  };

  async function fetchArtistFeedWithContinuations(browseId) {
    try {
      const data = await postMusic('browse', { browseId }, ses);
      if (!data) return;
      addItems(parseLibraryPlaylistsResponse(data));

      let token = extractContinuationToken(data);
      let page = 1;
      while (token && page < 10) {
        page++;
        const contData = await getBrowseContinuation(token, ses);
        if (!contData) break;
        addItems(parseLibraryPlaylistsResponse(contData));
        token = extractContinuationToken(contData);
      }
    } catch {}
  }

  await Promise.allSettled([
    fetchArtistFeedWithContinuations('FEmusic_library_corpus_track_artists'),
    fetchArtistFeedWithContinuations('FEmusic_library_corpus_artists')
  ]);
  return artists;
}

/**
 * Fetches unified user library: playlists, liked songs, albums, and artists.
 */
async function getUserLibrary(ses) {
  const [playlists, likedData, albums, artists] = await Promise.all([
    getLibraryPlaylists(ses).catch(() => []),
    getLibrarySongs(ses).catch(() => ({ songs: [] })),
    getLibraryAlbums(ses).catch(() => []),
    getLibraryArtists(ses).catch(() => [])
  ]);
  return {
    playlists,
    songs: likedData.songs || [],
    albums,
    artists
  };
}

/**
 * Fetches the next auto-play / radio queue for a given videoId.
 * Uses RDAMVM<videoId> radio mix.
 */
async function getNextQueue(videoId, ses) {
  try {
    const data = await postMusic('next', {
      videoId,
      playlistId: `RDAMVM${videoId}`,
      isAudioOnly: true
    }, ses);
    const queue = parseWatchQueue(data);
    if (queue && queue.length > 0) {
      return queue;
    }
  } catch (err) {
    console.warn('[InnerTube] getNextQueue standard error:', err.message);
  }

  // Fallback to ANDROID_MUSIC client context for guest watch queues (BitChord architecture)
  try {
    const payload = {
      context: {
        client: {
          clientName: 'ANDROID_MUSIC',
          clientVersion: '6.20.51',
          hl: 'en',
          gl: 'US'
        }
      },
      videoId,
      playlistId: `RDAMVM${videoId}`,
      isAudioOnly: true
    };
    const res = await fetch(`${MUSIC_BASE}/next?prettyPrint=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.apps.youtube.music/6.20.51 (Linux; U; Android 11)'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return parseWatchQueue(data);
    }
  } catch (err) {
    console.warn('[InnerTube] getNextQueue Android fallback error:', err.message);
  }

  return [];
}

/**
 * BitChord InnerTube Search Filters
 * Directly matches BitChord SearchFilter enum and exact InnerTube params tokens.
 */
const SEARCH_FILTERS = {
  ALL: null,
  SONGS: 'EgWKAQIIAWoKEAkQChAFEAMQBA==',
  VIDEOS: 'EgWKAQIQAWoKEAkQChAFEAMQBA==',
  ALBUMS: 'EgWKAQIYAWoKEAkQChAFEAMQBA==',
  ARTISTS: 'EgWKAQIgAWoKEAkQChAFEAMQBA==',
  PLAYLISTS: 'EgWKAQIoAWoKEAkQChAFEAMQBA=='
};

/**
 * Typeahead queries out of a music/get_search_suggestions response (BitChord SearchScreen.kt).
 */
async function getSearchSuggestions(input, ses) {
  if (!input || typeof input !== 'string' || !input.trim()) return [];
  try {
    const data = await postMusic('music/get_search_suggestions', { input: input.trim() }, ses);
    return parseSearchSuggestions(data);
  } catch (err) {
    console.warn('[InnerTube] getSearchSuggestions error:', err.message);
    return [];
  }
}

/**
 * Live search against YouTube Music InnerTube with optional BitChord filter parameter.
 */
async function search(query, ses, filter = null) {
  let q = query;
  let resolvedFilter = filter;
  if (typeof query === 'object' && query !== null) {
    q = query.query;
    if (query.filter) resolvedFilter = query.filter;
  }
  if (!q || typeof q !== 'string' || !q.trim()) return [];

  const payload = { query: q.trim() };
  if (resolvedFilter) {
    const key = String(resolvedFilter).toUpperCase();
    if (SEARCH_FILTERS[key] !== undefined) {
      if (SEARCH_FILTERS[key]) payload.params = SEARCH_FILTERS[key];
    } else {
      payload.params = resolvedFilter;
    }
  }

  try {
    const data = await postMusic('search', payload, ses);
    return parseSearchResults(data);
  } catch (err) {
    console.warn('[InnerTube] search error:', err.message);
    return [];
  }
}

/**
 * Live Artist Details browse endpoint (BitChord DetailScreen.kt).
 * Returns artist name, avatar, bio, Top Songs, Albums, Singles & EPs, and Similar Artists.
 */
async function getArtist(browseId, ses) {
  if (!browseId || typeof browseId !== 'string') return null;
  try {
    const data = await postMusic('browse', { browseId: browseId.trim() }, ses);
    return parseArtistPage(data, browseId.trim());
  } catch (err) {
    console.warn(`[InnerTube] getArtist error for ${browseId}:`, err.message);
    return null;
  }
}

/**
 * User YouTube Music History / Recently Played (FEmusic_history).
 * Supports continuation token pagination for complete playback history.
 */
async function getHistory(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_history' }, ses);
    if (!data) return { songs: [] };
    const res = parseHistoryResponse(data);
    const songs = Array.isArray(res?.songs) ? [...res.songs] : [];

    let token = extractContinuationToken(data);
    let page = 1;
    while (token && page < 10) {
      page++;
      const contData = await getBrowseContinuation(token, ses);
      if (!contData) break;
      const contRes = parseHistoryResponse(contData);
      if (contRes && Array.isArray(contRes.songs)) {
        for (const s of contRes.songs) {
          if (!songs.some(existing => existing.videoId === s.videoId)) {
            songs.push(s);
          }
        }
      }
      token = extractContinuationToken(contData);
    }
    return { songs };
  } catch (err) {
    console.warn('[InnerTube] getHistory error:', err.message);
    return { songs: [] };
  }
}

/**
 * YouTube Music Moods & Genres categories (FEmusic_moods_and_genres).
 */
async function getMoodsAndGenres(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_moods_and_genres' }, ses);
    return parseMoodsAndGenresResponse(data);
  } catch (err) {
    console.warn('[InnerTube] getMoodsAndGenres error:', err.message);
    return { categories: [] };
  }
}

// In-memory cache for playback tracking endpoints to prevent redundant /player requests
const playbackTrackingCache = new Map();

/**
 * Registers plays against Google / YouTube Music playback history (BitChord PlaybackTracker.kt).
 * Three pings: videostatsPlaybackUrl, atrUrl, and videostatsWatchtimeUrl.
 * Supports persistent cpn, 30s watchtime intervals, and final watchtime pings.
 */
async function trackPlayback(payload, ses) {
  if (!payload || !payload.videoId) return false;
  const { videoId, cpn, state, seconds } = payload;
  const isFinal = Boolean(payload.final);
  try {
    const { isLoggedIn, cookieStr } = await getAuthContext(ses);
    if (!isLoggedIn || !cookieStr) return false;

    let tracking = playbackTrackingCache.get(videoId);
    if (!tracking) {
      const data = await postMusic('player', {
        videoId,
        contentCheckOk: true,
        racyCheckOk: true,
        playbackContext: {
          contentPlaybackContext: {
            html5Preference: 'HTML5_PREF_WANTS',
            referer: `${MUSIC_ORIGIN}/watch?v=${videoId}`
          }
        }
      }, ses);

      tracking = data?.playbackTracking;
      if (tracking) {
        playbackTrackingCache.set(videoId, tracking);
        if (playbackTrackingCache.size > 50) {
          const firstKey = playbackTrackingCache.keys().next().value;
          playbackTrackingCache.delete(firstKey);
        }
      }
    }

    if (!tracking) return false;

    const playbackUrl = tracking.videostatsPlaybackUrl?.baseUrl;
    const atrUrl = tracking.atrUrl?.baseUrl;
    const watchtimeUrl = tracking.videostatsWatchtimeUrl?.baseUrl;

    const ping = async (url, extraParams = {}) => {
      if (!url) return;
      try {
        const parsed = new URL(url);
        if (cpn) parsed.searchParams.set('cpn', cpn);
        parsed.searchParams.set('ver', '2');
        for (const [k, v] of Object.entries(extraParams)) {
          parsed.searchParams.set(k, String(v));
        }
        await fetch(parsed.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': CHROME_UA,
            'Cookie': cookieStr,
            'Origin': MUSIC_ORIGIN,
            'Referer': `${MUSIC_ORIGIN}/`
          }
        }).catch(() => {});
      } catch {}
    };

    if (state === 'start' && playbackUrl) {
      await ping(playbackUrl);
      if (atrUrl) {
        setTimeout(() => ping(atrUrl), 5000);
      }
    } else if (state === 'watchtime' && watchtimeUrl) {
      const extraParams = { state: 'playing', ctime: seconds || 0 };
      if (isFinal) extraParams.final = '1';
      await ping(watchtimeUrl, extraParams);
    }
    return true;
  } catch (err) {
    console.warn('[InnerTube] trackPlayback notice:', err.message);
    return false;
  }
}

/**
 * Like, Dislike, or remove like on a track.
 */
async function rate(videoId, status, ses) {
  const endpoint = status === 'LIKE' ? 'like/like'
    : status === 'DISLIKE' ? 'like/dislike'
    : 'like/removelike';
  try {
    return await postMusic(endpoint, { target: { videoId } }, ses);
  } catch (err) {
    console.warn('[InnerTube] rate error:', err.message);
    return null;
  }
}

// -------------------------------------------------------------
// Response Parsers (Mirrors BitChord InnertubeParser.kt)
// -------------------------------------------------------------

function parseHomeResponse(data) {
  const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
  const sectionList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const shelves = [];
  const allTracks = [];

  for (const sec of sectionList) {
    const shelf = sec.musicCarouselShelfRenderer || sec.musicShelfRenderer;
    if (!shelf) continue;

    const title = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text ||
                  shelf.title?.runs?.[0]?.text ||
                  'YouTube Music';
    const strapline = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.strapline?.runs?.[0]?.text || '';

    const items = [];
    const contents = shelf.contents || [];

    for (const item of contents) {
      if (item.musicResponsiveListItemRenderer) {
        const song = parseResponsiveItem(item.musicResponsiveListItemRenderer);
        if (song) {
          items.push(song);
          if (!allTracks.some(t => t.videoId === song.videoId)) {
            allTracks.push(song);
          }
        }
      } else if (item.musicTwoRowItemRenderer) {
        const card = parseTwoRowItem(item.musicTwoRowItemRenderer);
        if (card) {
          items.push(card);
          if (card.videoId && !allTracks.some(t => t.videoId === card.videoId)) {
            allTracks.push(card);
          }
        }
      }
    }

    if (items.length > 0) {
      shelves.push({
        title,
        strapline,
        items
      });
    }
  }

  return { shelves, tracks: allTracks };
}

function parseExploreResponse(data) {
  const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
  const sectionList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const shelves = [];
  const allTracks = [];

  for (const sec of sectionList) {
    const shelf = sec.musicCarouselShelfRenderer || sec.musicShelfRenderer;
    if (!shelf) continue;

    const title = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text ||
                  shelf.title?.runs?.[0]?.text ||
                  'Explore';
    const items = [];
    const contents = shelf.contents || [];

    for (const item of contents) {
      if (item.musicResponsiveListItemRenderer) {
        const song = parseResponsiveItem(item.musicResponsiveListItemRenderer);
        if (song) {
          items.push(song);
          if (!allTracks.some(t => t.videoId === song.videoId)) {
            allTracks.push(song);
          }
        }
      } else if (item.musicTwoRowItemRenderer) {
        const card = parseTwoRowItem(item.musicTwoRowItemRenderer);
        if (card) {
          items.push(card);
        }
      }
    }

    if (items.length > 0) {
      shelves.push({ title, items });
    }
  }

  return { shelves, tracks: allTracks };
}

function parsePlaylistResponse(data, browseId) {
  let title = 'Playlist';
  let subtitle = 'YouTube Music';
  let secondSubtitle = '';
  let cover = '';
  const songs = [];

  // Parse header
  function findHeader(node) {
    if (!node || typeof node !== 'object') return;
    if (node.musicResponsiveHeaderRenderer) {
      const h = node.musicResponsiveHeaderRenderer;
      title = h.title?.runs?.map(x => x.text).join('') || h.title?.simpleText || h.title?.runs?.[0]?.text || title;
      subtitle = h.subtitle?.runs?.map(x => x.text).join('') || h.subtitle?.simpleText || subtitle;
      const sSub = h.secondSubtitle?.runs?.map(x => x.text).join('') || h.secondSubtitle?.simpleText ||
                   h.straplineTextOne?.runs?.map(x => x.text).join('') || h.straplineTextOne?.simpleText || '';
      if (sSub) secondSubtitle = sSub;
      const thumbs = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || h.thumbnail?.thumbnails || [];
      if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
      return;
    }
    if (node.musicEditablePlaylistDetailHeaderRenderer) {
      const h = node.musicEditablePlaylistDetailHeaderRenderer.header?.musicResponsiveHeaderRenderer || node.musicEditablePlaylistDetailHeaderRenderer;
      if (h) {
        title = h.title?.runs?.map(x => x.text).join('') || h.title?.simpleText || h.title?.runs?.[0]?.text || title;
        subtitle = h.subtitle?.runs?.map(x => x.text).join('') || h.subtitle?.simpleText || subtitle;
        const sSub = h.secondSubtitle?.runs?.map(x => x.text).join('') || h.secondSubtitle?.simpleText ||
                     h.straplineTextOne?.runs?.map(x => x.text).join('') || h.straplineTextOne?.simpleText || '';
        if (sSub) secondSubtitle = sSub;
        const thumbs = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || h.thumbnail?.thumbnails || [];
        if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
        return;
      }
    }
    if (node.musicHeaderRenderer) {
      const h = node.musicHeaderRenderer;
      title = h.title?.runs?.map(x => x.text).join('') || h.title?.simpleText || title;
      subtitle = h.subtitle?.runs?.map(x => x.text).join('') || subtitle;
      const sSub = h.secondSubtitle?.runs?.map(x => x.text).join('') || h.secondSubtitle?.simpleText || '';
      if (sSub) secondSubtitle = sSub;
      const thumbs = h.thumbnail?.thumbnails || [];
      if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(findHeader);
    } else {
      Object.values(node).forEach(findHeader);
    }
  }
  findHeader(data);

  // Parse tracks deep
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.musicResponsiveListItemRenderer) {
      const song = parseResponsiveItem(node.musicResponsiveListItemRenderer);
      if (song && song.videoId && !songs.some(s => s.videoId === song.videoId)) {
        if (!song.cover && cover) song.cover = cover;
        songs.push(song);
      }
    } else if (node.playlistPanelVideoRenderer) {
      const r = node.playlistPanelVideoRenderer;
      const videoId = r.videoId;
      const t = r.title?.runs?.[0]?.text || r.title?.simpleText;
      if (videoId && t && !songs.some(s => s.videoId === videoId)) {
        const artist = r.longBylineText?.runs?.[0]?.text || r.shortBylineText?.runs?.[0]?.text || 'YouTube Music';
        const thumbs = r.thumbnail?.thumbnails || [];
        const songCover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : cover;
        songs.push({
          id: `yt-${videoId}`,
          type: 'song',
          videoId,
          title: t,
          artist,
          album: title,
          duration: parseDurationString(r.lengthText?.runs?.[0]?.text) || 210,
          durationStr: r.lengthText?.runs?.[0]?.text || '3:30',
          cover: songCover
        });
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);

  const trackCount = songs.length;
  const totalSeconds = songs.reduce((sum, s) => sum + (s.duration || 0), 0);
  const duration = totalSeconds;
  const durationMinutes = Math.floor(totalSeconds / 60);
  const durationRemainder = totalSeconds % 60;
  const durationStr = totalSeconds >= 3600
    ? `${Math.floor(totalSeconds / 3600)} hr ${Math.floor((totalSeconds % 3600) / 60)} min`
    : `${durationMinutes}:${durationRemainder < 10 ? '0' : ''}${durationRemainder}`;

  return {
    browseId,
    title,
    subtitle,
    secondSubtitle: secondSubtitle || (trackCount > 0 ? `${trackCount} songs • ${durationStr}` : ''),
    trackCount,
    duration,
    durationStr,
    cover,
    songs
  };
}

function parseWatchQueue(data) {
  const queue = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.playlistPanelVideoRenderer) {
      const r = node.playlistPanelVideoRenderer;
      const videoId = r.videoId;
      const title = r.title?.runs?.[0]?.text;
      const artist = r.longBylineText?.runs?.[0]?.text || 'YouTube Music';
      const durationStr = r.lengthText?.runs?.[0]?.text || '3:30';
      const thumbs = r.thumbnail?.thumbnails || [];
      const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
      if (title && videoId) {
        queue.push({
          id: `yt-${videoId}`,
          videoId,
          title,
          artist,
          durationStr,
          cover
        });
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);
  return queue;
}

function parseSearchSuggestions(data) {
  if (!data) return [];
  const suggestions = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    const rend = node.searchSuggestionRenderer || node.historySuggestionRenderer;
    if (rend) {
      const query = rend.navigationEndpoint?.searchEndpoint?.query ||
                    (Array.isArray(rend.suggestion?.runs) ? rend.suggestion.runs.map(r => r.text).join('') : (rend.suggestion?.simpleText || ''));
      if (query && typeof query === 'string' && query.trim() && !suggestions.includes(query.trim())) {
        suggestions.push(query.trim());
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);
  return suggestions;
}

function parseSearchResults(data) {
  if (!data) return [];
  const sections = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents ||
                   data.contents?.sectionListRenderer?.contents ||
                   data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents ||
                   (Array.isArray(data.contents) ? data.contents : []);
  const results = [];

  function classifyItem(item) {
    if (!item) return item;
    const bId = item.browseId || '';
    const vId = item.videoId || '';
    const sub = (item.subtitle || '').toLowerCase();
    const title = (item.title || '').toLowerCase();

    if (bId.startsWith('UC') || item.type === 'artist' || sub.includes('artist')) {
      item.resultType = 'artist';
      item.type = 'artist';
    } else if (bId.startsWith('MPRE') || sub.includes('album') || sub.includes('ep') || item.type === 'album') {
      item.resultType = 'album';
      item.type = 'album';
    } else if (bId.startsWith('VLPL') || bId.startsWith('PL') || sub.includes('playlist') || item.type === 'playlist') {
      item.resultType = 'playlist';
      item.type = 'playlist';
    } else if (vId && (sub.includes('video') || title.includes('music video') || title.includes('official video'))) {
      item.resultType = 'video';
      item.type = 'video';
    } else {
      item.resultType = 'song';
      item.type = 'song';
    }
    return item;
  }

  function parseCardShelf(card) {
    if (!card || typeof card !== 'object') return { topItem: null, cardArtist: null };
    const title = (Array.isArray(card.title?.runs) ? card.title.runs.map(x => x.text).join('') : (card.title?.simpleText || '')) || '';
    const subtitle = (Array.isArray(card.subtitle?.runs) ? card.subtitle.runs.map(x => x.text).join('') : (card.subtitle?.simpleText || '')) || '';
    const thumbs = card.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                   card.thumbnail?.thumbnails || [];
    const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';

    const onTap = card.onTap || card.title?.runs?.[0]?.navigationEndpoint || {};
    const videoId = onTap.watchEndpoint?.videoId ||
                    card.buttons?.[0]?.buttonRenderer?.command?.watchEndpoint?.videoId;
    const browseId = onTap.browseEndpoint?.browseId ||
                     card.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId;
    const pageType = onTap.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType ||
                     card.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType || '';

    const isArtistCard = pageType.includes('ARTIST') || (browseId && browseId.startsWith('UC'));
    const cardArtist = isArtistCard && title ? title : null;

    if (!title) return { topItem: null, cardArtist };

    if (videoId) {
      const parts = subtitle.split(' • ').map(s => s.trim()).filter(Boolean);
      const durPart = parts.find(p => /^\d+:\d{2}(:\d{2})?$/.test(p));
      const artistPart = parts.find(p => !/^\d+:\d{2}(:\d{2})?$/.test(p) && !SEARCH_TYPE_WORDS.has(p.toLowerCase()) && !SEARCH_TALLY_REGEX.test(p)) || 'YouTube Music';
      return {
        topItem: classifyItem({
          id: `yt-${videoId}`,
          type: 'song',
          isTopResult: true,
          videoId,
          browseId,
          title,
          artist: artistPart,
          album: 'YouTube Music',
          subtitle,
          duration: parseDurationString(durPart) || 210,
          durationStr: durPart || '3:30',
          cover
        }),
        cardArtist
      };
    }

    if (browseId) {
      return {
        topItem: classifyItem({
          id: `browse-${browseId}`,
          type: isArtistCard ? 'artist' : 'browse',
          isTopResult: true,
          browseId,
          title,
          artist: subtitle || 'Artist',
          subtitle,
          cover
        }),
        cardArtist
      };
    }

    return { topItem: null, cardArtist };
  }

  function walk(node, fallbackArtist = null) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(el => walk(el, fallbackArtist)); return; }
    if (node.musicCardShelfRenderer) {
      const { topItem, cardArtist } = parseCardShelf(node.musicCardShelfRenderer);
      if (topItem && !results.some(r => (r.videoId && r.videoId === topItem.videoId) || (r.browseId && r.browseId === topItem.browseId))) {
        results.push(topItem);
      }
      if (Array.isArray(node.musicCardShelfRenderer.contents)) {
        node.musicCardShelfRenderer.contents.forEach(child => walk(child, cardArtist || fallbackArtist));
      }
      return;
    }
    if (node.musicResponsiveListItemRenderer) {
      const song = parseResponsiveItem(node.musicResponsiveListItemRenderer, fallbackArtist);
      if (song && !results.some(r => (r.videoId && r.videoId === song.videoId) || (r.browseId && r.browseId === song.browseId))) {
        results.push(classifyItem(song));
      }
    } else if (node.musicTwoRowItemRenderer) {
      const card = parseTwoRowItem(node.musicTwoRowItemRenderer);
      if (card && !results.some(r => (r.id && r.id === card.id) || (r.browseId && r.browseId === card.browseId) || (r.videoId && r.videoId === card.videoId))) {
        results.push(classifyItem(card));
      }
    }
    Object.values(node).forEach(val => walk(val, fallbackArtist));
  }
  walk(sections.length > 0 ? sections : data);

  // Attach categorized sub-arrays onto the main array
  results.songs = results.filter(r => r.resultType === 'song');
  results.videos = results.filter(r => r.resultType === 'video');
  results.albums = results.filter(r => r.resultType === 'album');
  results.artists = results.filter(r => r.resultType === 'artist');
  results.playlists = results.filter(r => r.resultType === 'playlist');

  return results;
}

function parseArtistPage(data, browseId) {
  if (!data) return null;
  const header = data.header?.musicImmersiveHeaderRenderer ||
                 data.header?.musicVisualHeaderRenderer ||
                 data.header?.musicHeaderRenderer ||
                 {};

  const name = header.title?.runs?.[0]?.text ||
               header.title?.simpleText ||
               'Artist';

  const descRuns = header.description?.runs || [];
  const description = descRuns.map(r => r.text).join('') || (header.description?.simpleText || '');

  const thumbs = header.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 header.foregroundThumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 header.thumbnail?.thumbnails ||
                 [];
  const avatar = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';
  const headerCover = thumbs.length > 0 ? thumbs[0].url : '';

  const subRuns = header.subscriptionButton?.subscribeButtonRenderer?.subscriberCountText?.runs || [];
  const subscriberCount = subRuns.map(r => r.text).join('') ||
                          header.subscriptionButton?.subscribeButtonRenderer?.subscriberCountText?.simpleText ||
                          header.subtitle?.runs?.map(r => r.text).join('') ||
                          '';

  const sections = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents ||
                   data.contents?.sectionListRenderer?.contents ||
                   [];

  const topSongs = [];
  const albums = [];
  const singles = [];
  const similarArtists = [];

  for (const sec of sections) {
    if (sec.musicShelfRenderer) {
      const shelf = sec.musicShelfRenderer;
      const items = shelf.contents || [];
      for (const item of items) {
        if (item.musicResponsiveListItemRenderer) {
          const song = parseResponsiveItem(item.musicResponsiveListItemRenderer);
          if (song && !topSongs.some(s => s.videoId === song.videoId)) {
            topSongs.push(song);
          }
        }
      }
    } else if (sec.musicCarouselShelfRenderer) {
      const carousel = sec.musicCarouselShelfRenderer;
      const shelfTitle = (carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text ||
                          carousel.title?.runs?.[0]?.text ||
                          '').toLowerCase();
      const items = carousel.contents || [];

      for (const item of items) {
        if (item.musicTwoRowItemRenderer) {
          const card = parseTwoRowItem(item.musicTwoRowItemRenderer);
          if (card) {
            if (shelfTitle.includes('album')) {
              if (!albums.some(a => a.browseId === card.browseId)) {
                albums.push({ ...card, type: 'album' });
              }
            } else if (shelfTitle.includes('single') || shelfTitle.includes('ep')) {
              if (!singles.some(s => s.browseId === card.browseId)) {
                singles.push({ ...card, type: 'single' });
              }
            } else if (shelfTitle.includes('fan') || shelfTitle.includes('similar')) {
              if (!similarArtists.some(sa => sa.browseId === card.browseId)) {
                similarArtists.push({ ...card, type: 'artist' });
              }
            } else if (card.browseId && card.browseId.startsWith('UC')) {
              if (!similarArtists.some(sa => sa.browseId === card.browseId)) {
                similarArtists.push({ ...card, type: 'artist' });
              }
            } else {
              if (!albums.some(a => a.browseId === card.browseId)) {
                albums.push({ ...card, type: 'album' });
              }
            }
          }
        } else if (item.musicResponsiveListItemRenderer) {
          const song = parseResponsiveItem(item.musicResponsiveListItemRenderer);
          if (song && shelfTitle.includes('song') && !topSongs.some(s => s.videoId === song.videoId)) {
            topSongs.push(song);
          }
        }
      }
    }
  }

  return {
    id: browseId,
    browseId,
    name,
    description,
    avatar,
    headerCover,
    subscribers: subscriberCount,
    subscriberCount,
    topSongs,
    albums,
    singles,
    similarArtists
  };
}

function parseHistoryResponse(data) {
  if (!data) return { songs: [] };
  const songs = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.musicResponsiveListItemRenderer) {
      const item = parseResponsiveItem(node.musicResponsiveListItemRenderer);
      if (item && item.videoId && !songs.some(s => s.videoId === item.videoId)) {
        songs.push(item);
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);
  return { songs };
}

function parseMoodsAndGenresResponse(data) {
  if (!data) return { categories: [] };
  const categories = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.musicNavigationButtonRenderer) {
      const btn = node.musicNavigationButtonRenderer;
      const title = btn.buttonText?.runs?.[0]?.text || btn.buttonText?.simpleText;
      const browseId = btn.clickCommand?.browseEndpoint?.browseId;
      const params = btn.clickCommand?.browseEndpoint?.params;
      const color = btn.solid?.leftStripeColor || btn.color;
      if (title && browseId && !categories.some(c => c.title === title && c.browseId === browseId)) {
        categories.push({ title, browseId, params, color });
      }
    } else if (node.musicTwoRowItemRenderer) {
      const item = parseTwoRowItem(node.musicTwoRowItemRenderer);
      if (item && item.browseId && !categories.some(c => c.browseId === item.browseId)) {
        categories.push({ title: item.title, browseId: item.browseId, cover: item.cover });
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);
  return { categories };
}

function parseChartsResponse(data) {
  const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
  const sectionList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const shelves = [];
  const allTracks = [];
  const artists = [];

  for (const sec of sectionList) {
    const shelf = sec.musicCarouselShelfRenderer || sec.musicShelfRenderer;
    if (!shelf) continue;

    const title = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text ||
                  shelf.title?.runs?.[0]?.text;
    if (!title) continue;

    const items = [];
    const contents = shelf.contents || [];

    for (const item of contents) {
      if (item.musicResponsiveListItemRenderer) {
        const parsed = parseResponsiveItem(item.musicResponsiveListItemRenderer);
        if (parsed) {
          items.push(parsed);
          if (parsed.videoId && !allTracks.some(t => t.videoId === parsed.videoId)) {
            allTracks.push(parsed);
          }
          if (parsed.type === 'artist' || (parsed.browseId && parsed.browseId.startsWith('UC'))) {
            if (!artists.some(a => a.artist === parsed.title || a.browseId === parsed.browseId)) {
              artists.push({
                artist: parsed.title,
                subscribers: parsed.artist || '',
                cover: parsed.cover,
                browseId: parsed.browseId
              });
            }
          }
        }
      } else if (item.musicTwoRowItemRenderer) {
        const card = parseTwoRowItem(item.musicTwoRowItemRenderer);
        if (card) {
          items.push(card);
          if (card.videoId && !allTracks.some(t => t.videoId === card.videoId)) {
            allTracks.push(card);
          }
        }
      }
    }

    if (items.length > 0) {
      shelves.push({ title, items });
    }
  }

  return { shelves, tracks: allTracks, artists };
}

function parseNewReleasesResponse(data) {
  const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
  const sectionList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const shelves = [];
  const allTracks = [];

  for (const sec of sectionList) {
    const shelf = sec.musicCarouselShelfRenderer || sec.musicShelfRenderer;
    if (!shelf) continue;

    const title = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text ||
                  shelf.title?.runs?.[0]?.text;
    if (!title) continue;

    const items = [];
    const contents = shelf.contents || [];

    for (const item of contents) {
      if (item.musicTwoRowItemRenderer) {
        const card = parseTwoRowItem(item.musicTwoRowItemRenderer);
        if (card) {
          items.push(card);
          if (card.videoId && !allTracks.some(t => t.videoId === card.videoId)) {
            allTracks.push(card);
          }
        }
      } else if (item.musicResponsiveListItemRenderer) {
        const song = parseResponsiveItem(item.musicResponsiveListItemRenderer);
        if (song) {
          items.push(song);
          if (song.videoId && !allTracks.some(t => t.videoId === song.videoId)) {
            allTracks.push(song);
          }
        }
      }
    }

    if (items.length > 0) {
      shelves.push({ title, items });
    }
  }

  return { shelves, tracks: allTracks };
}

function parseBrowsePlaylistItem(node) {
  if (!node || typeof node !== 'object') return null;

  // 1. musicTwoRowItemRenderer (wrapped or unwrapped)
  const twoRow = node.musicTwoRowItemRenderer ||
    (!node.musicResponsiveListItemRenderer && !node.gridPlaylistRenderer && !node.playlistRenderer && !node.compactPlaylistRenderer && !node.lockupViewModel && !node.flexColumns && (node.title || node.subtitle) && (node.navigationEndpoint || node.thumbnailRenderer || node.thumbnail) ? node : null);

  if (twoRow) {
    const r = twoRow;
    const title = (Array.isArray(r.title?.runs) ? r.title.runs.map(x => x.text).join('') : (r.title?.simpleText || r.title?.runs?.[0]?.text)) || '';
    if (!title) return null;
    const subtitle = (Array.isArray(r.subtitle?.runs) ? r.subtitle.runs.map(x => x.text).join('') : (r.subtitle?.simpleText || 'Playlist')) || 'Playlist';

    const endpoint = r.navigationEndpoint ||
                     r.defaultNavigationEndpoint ||
                     r.title?.runs?.[0]?.navigationEndpoint ||
                     r.title?.navigationEndpoint ||
                     r.thumbnailRenderer?.musicThumbnailRenderer?.navigationEndpoint ||
                     {};

    let browseId = endpoint.browseEndpoint?.browseId ||
                   r.navigationEndpoint?.browseEndpoint?.browseId ||
                   r.defaultNavigationEndpoint?.browseEndpoint?.browseId ||
                   r.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                   r.thumbnailRenderer?.musicThumbnailRenderer?.navigationEndpoint?.browseEndpoint?.browseId;

    const watchPlaylist = endpoint.watchPlaylistEndpoint?.playlistId ||
                          endpoint.watchEndpoint?.playlistId ||
                          r.navigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                          r.navigationEndpoint?.watchEndpoint?.playlistId ||
                          r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                          r.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId;
    if (!browseId && watchPlaylist) {
      browseId = watchPlaylist.startsWith('VL') ? watchPlaylist : `VL${watchPlaylist}`;
    }

    if (!browseId && r.playlistId) {
      browseId = r.playlistId.startsWith('VL') ? r.playlistId : `VL${r.playlistId}`;
    }

    if (!browseId && r.contentId) {
      browseId = r.contentId.startsWith('VL') ? r.contentId : `VL${r.contentId}`;
    }

    const thumbs = r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                   r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                   r.thumbnailRenderer?.thumbnail?.thumbnails ||
                   r.thumbnail?.thumbnails ||
                   r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.sources || [];
    const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';

    return {
      title,
      subtitle,
      browseId,
      cover
    };
  }

  // 2. musicResponsiveListItemRenderer (wrapped or unwrapped)
  const respItem = node.musicResponsiveListItemRenderer ||
    (!node.musicTwoRowItemRenderer && node.flexColumns && (node.navigationEndpoint || node.overlay || node.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer) ? node : null);

  if (respItem) {
    const r = respItem;
    const flexCols = r.flexColumns || [];
    const titleCol = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text;
    const title = (Array.isArray(titleCol?.runs) ? titleCol.runs.map(x => x.text).join('') : (titleCol?.simpleText || titleCol?.runs?.[0]?.text)) || '';
    if (!title) return null;

    const col1 = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text;
    const subtitle = (Array.isArray(col1?.runs) ? col1.runs.map(x => x.text).join('') : (col1?.simpleText || 'Playlist')) || 'Playlist';

    let browseId = r.navigationEndpoint?.browseEndpoint?.browseId ||
                   r.defaultNavigationEndpoint?.browseEndpoint?.browseId ||
                   titleCol?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                   titleCol?.navigationEndpoint?.browseEndpoint?.browseId ||
                   col1?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId;

    if (!browseId && Array.isArray(titleCol?.runs)) {
      for (const run of titleCol.runs) {
        if (run.navigationEndpoint?.browseEndpoint?.browseId) {
          browseId = run.navigationEndpoint.browseEndpoint.browseId;
          break;
        }
      }
    }

    const watchPlaylist = r.navigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                          r.navigationEndpoint?.watchEndpoint?.playlistId ||
                          r.defaultNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                          titleCol?.runs?.[0]?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                          r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId;
    if (!browseId && watchPlaylist) {
      browseId = watchPlaylist.startsWith('VL') ? watchPlaylist : `VL${watchPlaylist}`;
    }

    if (!browseId && r.playlistId) {
      browseId = r.playlistId.startsWith('VL') ? r.playlistId : `VL${r.playlistId}`;
    }

    if (!browseId && r.contentId) {
      browseId = r.contentId.startsWith('VL') ? r.contentId : `VL${r.contentId}`;
    }

    const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                   r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                   r.thumbnail?.thumbnails || [];
    const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';

    return {
      title,
      subtitle,
      browseId,
      cover
    };
  }

  // 3. gridPlaylistRenderer
  if (node.gridPlaylistRenderer) {
    const g = node.gridPlaylistRenderer;
    const title = (Array.isArray(g.title?.runs) ? g.title.runs.map(x => x.text).join('') : g.title?.simpleText) || '';
    const subtitle = (Array.isArray(g.shortBylineText?.runs) ? g.shortBylineText.runs.map(x => x.text).join('') : g.shortBylineText?.simpleText) || 'Playlist';
    const bId = g.navigationEndpoint?.browseEndpoint?.browseId || (g.playlistId ? (g.playlistId.startsWith('VL') ? g.playlistId : `VL${g.playlistId}`) : null);
    const thumbs = g.thumbnail?.thumbnails || [];
    return {
      title,
      subtitle,
      browseId: bId,
      cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
    };
  }

  // 4. playlistRenderer
  if (node.playlistRenderer) {
    const p = node.playlistRenderer;
    const title = (Array.isArray(p.title?.runs) ? p.title.runs.map(x => x.text).join('') : p.title?.simpleText) || '';
    const subtitle = (Array.isArray(p.shortBylineText?.runs) ? p.shortBylineText.runs.map(x => x.text).join('') : p.shortBylineText?.simpleText) || 'Playlist';
    const bId = p.navigationEndpoint?.browseEndpoint?.browseId || (p.playlistId ? (p.playlistId.startsWith('VL') ? p.playlistId : `VL${p.playlistId}`) : null);
    const thumbs = p.thumbnails?.[0]?.thumbnails || p.thumbnail?.thumbnails || [];
    return {
      title,
      subtitle,
      browseId: bId,
      cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
    };
  }

  // 5. compactPlaylistRenderer
  if (node.compactPlaylistRenderer) {
    const cp = node.compactPlaylistRenderer;
    const title = (Array.isArray(cp.title?.runs) ? cp.title.runs.map(x => x.text).join('') : cp.title?.simpleText) || '';
    const subtitle = (Array.isArray(cp.shortBylineText?.runs) ? cp.shortBylineText.runs.map(x => x.text).join('') : cp.shortBylineText?.simpleText) || 'Playlist';
    const bId = cp.navigationEndpoint?.browseEndpoint?.browseId || (cp.playlistId ? (cp.playlistId.startsWith('VL') ? cp.playlistId : `VL${cp.playlistId}`) : null);
    const thumbs = cp.thumbnails?.[0]?.thumbnails || cp.thumbnail?.thumbnails || [];
    return {
      title,
      subtitle,
      browseId: bId,
      cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
    };
  }

  // 6. lockupViewModel
  if (node.lockupViewModel) {
    const vm = node.lockupViewModel;
    const meta = vm.metadata?.lockupMetadataViewModel || vm.metadata || {};
    const title = meta.title?.content ||
                  (Array.isArray(meta.title?.runs) ? meta.title.runs.map(x => x.text).join('') : '') ||
                  meta.title?.simpleText || '';

    let subtitle = meta.subtitle?.content ||
                   (Array.isArray(meta.subtitle?.runs) ? meta.subtitle.runs.map(x => x.text).join('') : '') || '';

    if (!subtitle && meta.metadata?.contentMetadataViewModel?.metadataRows) {
      subtitle = meta.metadata.contentMetadataViewModel.metadataRows
        .map(r => (r.elements || []).map(e => e.text?.content || '').join(''))
        .filter(Boolean)
        .join(' • ');
    }
    if (!subtitle) subtitle = 'Playlist';

    const bId = vm.rendererContext?.commandContext?.onTap?.innertubeCommand?.browseEndpoint?.browseId ||
                vm.onTap?.innertubeCommand?.browseEndpoint?.browseId ||
                vm.onTap?.browseEndpoint?.browseId ||
                (vm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchPlaylistEndpoint?.playlistId ? `VL${vm.rendererContext.commandContext.onTap.innertubeCommand.watchPlaylistEndpoint.playlistId}` : null) ||
                (vm.onTap?.innertubeCommand?.watchPlaylistEndpoint?.playlistId ? `VL${vm.onTap.innertubeCommand.watchPlaylistEndpoint.playlistId}` : null) ||
                (vm.contentId ? (vm.contentId.startsWith('VL') ? vm.contentId : `VL${vm.contentId}`) : null);

    const thumbs = vm.image?.imageViewModel?.sources ||
                   vm.image?.sources ||
                   vm.image?.thumbnail?.thumbnails ||
                   vm.thumbnail?.sources ||
                   vm.thumbnail?.thumbnails ||
                   vm.thumbnailRenderer?.thumbnail?.thumbnails || [];
    const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';

    return {
      title,
      subtitle,
      browseId: bId,
      cover
    };
  }

  return null;
}

function parseLibraryPlaylistsResponse(data) {
  const playlists = [];
  const seen = new Set();

  function addItem(item) {
    if (!item || !item.title) return;
    let bId = item.browseId;
    if (!bId && item.playlistId) {
      bId = item.playlistId.startsWith('VL') ? item.playlistId : `VL${item.playlistId}`;
    }
    if (!bId) return;

    // Filter out "New playlist" action tile and Liked Songs playlist
    const lowTitle = (item.title || '').trim().toLowerCase();
    const lowBId = bId.toLowerCase();
    if (lowBId.includes('create') || lowBId === 'feplaylist_add' || lowTitle === 'new playlist' || lowTitle === '+ new playlist') return;
    if (bId === 'VLLM' || bId === 'LM' || bId === 'FEmusic_liked_videos' || lowBId === 'vllm' || lowBId === 'lm') return;

    const cleanId = bId.replace(/^VL/, '');
    const excludedPrefixes = ['LM', 'SE', 'RD', 'OLAK', 'MPRE', 'UC'];
    if (excludedPrefixes.some(p => cleanId.startsWith(p) || bId.startsWith(p))) return;

    let normalizedBrowseId = bId;
    if (!bId.startsWith('VL') && !bId.startsWith('FE')) {
      normalizedBrowseId = `VL${bId}`;
    }
    const key = normalizedBrowseId.replace(/^VL/, '');
    if (!seen.has(key) && !seen.has(normalizedBrowseId)) {
      seen.add(key);
      seen.add(normalizedBrowseId);
      playlists.push({
        id: item.id || `browse-${normalizedBrowseId}`,
        type: 'browse',
        title: item.title,
        subtitle: item.subtitle || 'Playlist',
        browseId: normalizedBrowseId,
        playlistId: key,
        cover: item.cover || ''
      });
    }
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const el of node) walk(el);
      return;
    }

    const item = parseBrowsePlaylistItem(node);
    if (item && item.title && (item.browseId || node.playlistId)) {
      addItem(item);
    }

    for (const val of Object.values(node)) {
      walk(val);
    }
  }

  walk(data);
  return playlists;
}

/**
 * Parses sectionListRenderer or array of section contents into library playlists.
 */
function parseSectionList(sectionList) {
  if (!sectionList) return [];
  return parseLibraryPlaylistsResponse(sectionList);
}

const SEARCH_TYPE_WORDS = new Set([
  'song', 'video', 'album', 'single', 'ep', 'artist', 'playlist', 'podcast', 'episode', 'profile'
]);
const SEARCH_TALLY_REGEX = /^[\d.,]+\s*[KMB]?\s+(plays|views|likes|songs|tracks|subscribers|monthly\s+audience|audience|hours?|minutes?|seconds?)\b/i;

function parseResponsiveItem(r, fallbackArtist = null) {
  const flexCols = r.flexColumns || [];
  const titleCol = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const title = (Array.isArray(titleCol?.runs) ? titleCol.runs.map(x => x.text).join('') : (titleCol?.simpleText || titleCol?.runs?.[0]?.text)) || '';
  if (!title) return null;

  const col1 = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const col2 = flexCols[2]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const rawSubtitle = Array.isArray(col1?.runs)
    ? col1.runs.map(x => x.text || '').join('')
    : (col1?.simpleText || '');
  const parts = rawSubtitle.split(' • ').map(s => s.trim()).filter(Boolean);

  // Extract linked artist / album names from run browseEndpoints when present (BitChord InnertubeParser.kt creditsOf)
  let linkedArtist = null;
  let linkedAlbum = null;
  const allSubtitleRuns = [
    ...(Array.isArray(col1?.runs) ? col1.runs : []),
    ...(Array.isArray(col2?.runs) ? col2.runs : [])
  ];
  for (const run of allSubtitleRuns) {
    const bEp = run?.navigationEndpoint?.browseEndpoint;
    const bId = bEp?.browseId || '';
    const pType = bEp?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType || '';
    if (!linkedArtist && (pType.includes('ARTIST') || bId.startsWith('UC')) && run.text) {
      linkedArtist = run.text.trim();
    } else if (!linkedAlbum && (pType.includes('ALBUM') || bId.startsWith('MPRE')) && run.text) {
      linkedAlbum = run.text.trim();
    }
  }

  // Filter out type words ("Song", "Video"), durations ("3:45"), and tallies ("5.4M plays")
  const creditParts = parts.filter(p =>
    !/^\d+:\d{2}(:\d{2})?$/.test(p) &&
    !SEARCH_TYPE_WORDS.has(p.toLowerCase()) &&
    !SEARCH_TALLY_REGEX.test(p)
  );

  const artist = linkedArtist || creditParts[0] || fallbackArtist || (parts[0] && !SEARCH_TYPE_WORDS.has(parts[0].toLowerCase()) ? parts[0] : 'YouTube Music');
  const album = linkedAlbum || creditParts[1] || 'YouTube Music';

  const fixedCols = r.fixedColumns || [];
  const fixedDur = fixedCols[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text ||
                   fixedCols[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.simpleText;
  const partDur = parts.find(p => /^\d+:\d{2}(:\d{2})?$/.test(p));
  const durationText = fixedDur || partDur || null;
  const duration = parseDurationString(durationText) || 210;

  const videoId = r.playlistItemData?.videoId ||
                  r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId ||
                  r.navigationEndpoint?.watchEndpoint?.videoId ||
                  r.defaultNavigationEndpoint?.watchEndpoint?.videoId ||
                  titleCol?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId ||
                  col1?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId;

  let browseId = r.navigationEndpoint?.browseEndpoint?.browseId ||
                 r.defaultNavigationEndpoint?.browseEndpoint?.browseId ||
                 titleCol?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                 titleCol?.navigationEndpoint?.browseEndpoint?.browseId ||
                 col1?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId;

  const watchPlaylist = r.navigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                        r.navigationEndpoint?.watchEndpoint?.playlistId ||
                        r.defaultNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                        titleCol?.runs?.[0]?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                        r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId;
  if (!browseId && watchPlaylist) {
    browseId = watchPlaylist.startsWith('VL') ? watchPlaylist : `VL${watchPlaylist}`;
  }

  const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnail?.thumbnails || [];
  const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  const isArtist = browseId && browseId.startsWith('UC');

  return {
    id: videoId ? `yt-${videoId}` : (browseId ? `browse-${browseId}` : `item-${Math.random().toString(36).slice(2, 9)}`),
    type: isArtist ? 'artist' : (videoId ? 'song' : (browseId ? 'browse' : 'song')),
    videoId,
    browseId,
    title,
    artist: isArtist ? (rawSubtitle || 'Artist') : artist,
    subtitle: rawSubtitle,
    album,
    duration,
    durationStr: durationText || '3:30',
    cover
  };
}

function parseTwoRowItem(r) {
  const title = (Array.isArray(r.title?.runs) ? r.title.runs.map(x => x.text).join('') : (r.title?.simpleText || r.title?.runs?.[0]?.text)) || '';
  if (!title) return null;

  const subtitle = (Array.isArray(r.subtitle?.runs) ? r.subtitle.runs.map(x => x.text).join('') : (r.subtitle?.simpleText || '')) || '';
  const endpoint = r.navigationEndpoint ||
                   r.defaultNavigationEndpoint ||
                   r.title?.runs?.[0]?.navigationEndpoint ||
                   r.title?.navigationEndpoint ||
                   r.thumbnailRenderer?.musicThumbnailRenderer?.navigationEndpoint ||
                   {};

  let browseId = endpoint.browseEndpoint?.browseId ||
                 r.navigationEndpoint?.browseEndpoint?.browseId ||
                 r.defaultNavigationEndpoint?.browseEndpoint?.browseId ||
                 r.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                 r.thumbnailRenderer?.musicThumbnailRenderer?.navigationEndpoint?.browseEndpoint?.browseId;

  const watchPlaylist = endpoint.watchPlaylistEndpoint?.playlistId ||
                        endpoint.watchEndpoint?.playlistId ||
                        r.navigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
                        r.navigationEndpoint?.watchEndpoint?.playlistId ||
                        r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId;
  if (!browseId && watchPlaylist) {
    browseId = watchPlaylist.startsWith('VL') ? watchPlaylist : `VL${watchPlaylist}`;
  }

  let videoId = endpoint.watchEndpoint?.videoId ||
                endpoint.watchPlaylistEndpoint?.videoId ||
                r.navigationEndpoint?.watchEndpoint?.videoId ||
                r.navigationEndpoint?.watchPlaylistEndpoint?.videoId ||
                r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;

  if (!videoId && browseId && browseId.startsWith('MPED')) {
    videoId = browseId.replace(/^MPED/, '');
  }
  if (browseId && browseId.startsWith('MPED')) {
    browseId = null;
  }

  const thumbs = r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnail?.thumbnails || [];
  const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  const subParts = subtitle.split('•').map(s => s.trim()).filter(Boolean);
  const typeWords = new Set(['song', 'video', 'single', 'album', 'ep', 'playlist', 'artist', 'podcast', 'episode', 'chart']);
  let extractedArtist = '';
  for (const part of subParts) {
    if (!typeWords.has(part.toLowerCase()) && !/^\d+([.,]\d+)?[KMB]?\s*(views|plays|subscribers)/i.test(part) && !/^\d{4}$/.test(part)) {
      extractedArtist = part;
      break;
    }
  }
  if (!extractedArtist && subParts.length > 0) {
    extractedArtist = subParts[subParts.length - 1];
  }

  return {
    id: browseId ? `browse-${browseId}` : (videoId ? `yt-${videoId}` : `card-${Math.random().toString(36).slice(2, 9)}`),
    type: browseId ? (browseId.startsWith('UC') ? 'artist' : 'browse') : 'song',
    title,
    subtitle,
    artist: extractedArtist || 'YouTube Music',
    album: '',
    browseId,
    videoId,
    duration: 210,
    _durationUnverified: true,
    cover
  };
}

function parseDurationString(str) {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Extracts direct audio stream URL via InnerTube player endpoint (BitChord architecture).
 * Bypasses YouTube IFrame embed restrictions, Error 150/101, and region restrictions.
 * Tries ANDROID_MUSIC client context, IOS client context, and authenticated session context.
 * Parses streamingData.adaptiveFormats / formats (audio/webm; codecs="opus" or audio/mp4).
 */
async function getAudioStream(videoId, ses) {
  if (!videoId || typeof videoId !== 'string') return null;

  // 1. IOS client context (BitChord iOS PlayerClient.kt - high-compatibility direct stream)
  try {
    const iosVersion = '20.01.1';
    const payload = {
      context: {
        client: {
          clientName: 'IOS',
          clientVersion: iosVersion,
          deviceMake: 'Apple',
          deviceModel: 'iPhone16,2',
          hl: 'en',
          gl: 'US'
        }
      },
      videoId,
      contentCheckOk: true,
      racyCheckOk: true
    };
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `com.google.ios.youtube/${iosVersion} (iPhone16,2; U; CPU iOS 18_1_1 like Mac OS X; en_US)`,
        'X-YouTube-Client-Name': '5',
        'X-YouTube-Client-Version': iosVersion
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      const best = extractBestAudioFormat(data);
      if (best) return best;
    }
  } catch (err) {
    console.warn('[InnerTube] getAudioStream IOS attempt notice:', err.message);
  }

  // 2. ANDROID_MUSIC client context (BitChord Android PlayerClient.kt)
  try {
    const payload = {
      context: {
        client: {
          clientName: 'ANDROID_MUSIC',
          clientVersion: '6.20.51',
          androidSdkVersion: 30,
          hl: 'en',
          gl: 'US'
        }
      },
      videoId,
      contentCheckOk: true,
      racyCheckOk: true
    };
    const res = await fetch(`${MUSIC_BASE}/player?prettyPrint=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.apps.youtube.music/6.20.51 (Linux; U; Android 11)',
        'X-YouTube-Client-Name': '21',
        'X-YouTube-Client-Version': '6.20.51'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      const best = extractBestAudioFormat(data);
      if (best) return best;
    }
  } catch (err) {
    console.warn('[InnerTube] getAudioStream ANDROID_MUSIC attempt notice:', err.message);
  }

  // 3. Authenticated / WEB_REMIX session context
  try {
    const data = await postMusic('player', {
      videoId,
      contentCheckOk: true,
      racyCheckOk: true
    }, ses);
    const best = extractBestAudioFormat(data);
    if (best) return best;
  } catch (err) {
    console.warn('[InnerTube] getAudioStream session attempt notice:', err.message);
  }

  return null;
}

function extractBestAudioFormat(data) {
  if (!data || !data.streamingData) return null;
  const formats = (data.streamingData.adaptiveFormats || []).concat(data.streamingData.formats || []);
  const audioFormats = formats.filter(f => f.mimeType && f.mimeType.startsWith('audio/'));
  if (audioFormats.length === 0) return null;

  // Filter formats that have direct playable URL (no signature cipher deciphering needed)
  const direct = audioFormats.filter(f => !!f.url);
  if (direct.length === 0) return null;

  // Prioritize audio/webm; codecs="opus" (160k, 70k, 50k) or audio/mp4 (128k) by highest bitrate
  direct.sort((a, b) => {
    const aOpus = (a.mimeType && a.mimeType.includes('opus')) ? 1 : 0;
    const bOpus = (b.mimeType && b.mimeType.includes('opus')) ? 1 : 0;
    if (aOpus !== bOpus) return bOpus - aOpus;
    return (b.bitrate || 0) - (a.bitrate || 0);
  });

  const chosen = direct[0];
  return {
    url: chosen.url,
    mimeType: chosen.mimeType,
    bitrate: chosen.bitrate,
    itag: chosen.itag,
    contentLength: chosen.contentLength,
    duration: chosen.approxDurationMs ? Math.round(Number(chosen.approxDurationMs) / 1000) : null,
    loudnessDb: data.playerConfig?.audioConfig?.loudnessDb
  };
}

const LRCLIB_BASE = 'https://lrclib.net/api';
const LRCLIB_USER_AGENT = 'Deja (https://github.com/Dathevinci/Deja)';

/**
 * Cleans YouTube Music track titles and artist names for lyrics matching
 * Exactly matching BitChord's title.forLyricsSearch() and artist.artistForLyricsSearch().
 */
function cleanSearchTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    // Strip trailing unclosed feature/collaboration tags (e.g. '(feat. Din...')
    .replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    // Strip closed bracket feature tags: e.g. '(feat. Dina Rae)', '[ft. Daft Punk]', '(with Pharrell Williams)'
    .replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\b[^)\]]*[)\]]/gi, '')
    // Strip unbracketed feature tags: requires at least 1 leading whitespace to protect words like 'Swift', 'Gift', 'Left'
    .replace(/\s+(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    // Strip parenthetical/bracketed official video/audio/remaster/live tags
    .replace(/\s*[\(\[](?:official\s*)?(?:music\s+|lyric\s+|lyrics\s+)?(?:video|audio|visualizer|track|remaster(?:ed)?(?:\s+\d{4})?|live(?:\s+at\s+[^)\]]+)?)[\]\)]/gi, '')
    .replace(/\s*\(?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^)]+)?)\)?/gi, '')
    .replace(/\s*\[?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^\]]+)?)\]?/gi, '')
    // Bare official in brackets
    .replace(/\s*[(\[]\s*official\s*[)\]]/gi, '')
    // Strip trailing separators and descriptors
    .replace(/\s*(?:\||\/\/|-)\s*(?:official\s+video|official\s+audio|audio|lyric\s+video|lyrics|music\s+video).*$/gi, '')
    // Strip YouTube auto-generated channel topic tag
    .replace(/\s*-\s*Topic$/i, '')
    .trim();

  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  s = s
    // Clean leading/trailing quotes
    .replace(/^["'“‘]+|["'”’]+$/g, '')
    // Clean any trailing ellipsis, periods, dashes, or commas
    .replace(/[\.…,\s–—\-]+$/, '')
    .trim();

  return s.replace(/\s+/g, ' ').trim() || str.trim();
}

/**
 * Cleans artist name for lyrics matching
 * Matches BitChord artist.artistForLyricsSearch()
 */
function cleanArtistTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    // Strip " - Topic" suffix from YouTube's auto-generated artist channels
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .replace(/\s*[\(\[](?:feat\.?|ft\.?|featuring|with)\b[^)\]]*[)\]]/gi, '')
    .replace(/\s+(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .trim();

  // Strip metadata like bullet view counts or album info (e.g. "Eminem • The Eminem Show")
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  s = s.replace(/^["'“‘]+|["'”’]+$/g, '').replace(/[\.…,\s–—\-]+$/, '').trim();
  return s.replace(/\s+/g, ' ').trim() || str.trim();
}

/**
 * Extracts primary artist name if multiple artists are separated by comma, slash, or ampersand
 */
function getPrimaryArtist(str) {
  const clean = cleanArtistTerm(str);
  if (!clean) return '';
  return clean.split(/[,&/]/)[0].trim();
}

/**
 * Decodes HTML entities commonly returned in Enhanced LRC / TTML lyrics
 * Matches BitChord EnhancedLrc.kt decodeEntities() (numeric hex/dec entities first, &amp; last).
 */
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return '';
  if (!text.includes('&')) return text;
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&');
}

/**
 * Parses inline word timestamps `<mm:ss.xx>word` from an Enhanced LRC line body.
 * Matches BitChord LrcLib.kt parseWordRuns() & EnhancedLrc.kt.
 */
function parseWordRunsFromLine(lineBody, fileOffsetSec = 0) {
  if (!lineBody || typeof lineBody !== 'string' || !lineBody.includes('<')) return [];
  const wordRegex = /<(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?>/g;
  const matches = [...lineBody.matchAll(wordRegex)];
  if (matches.length === 0) return [];

  const parseStampSec = (m) => {
    const minutes = parseInt(m[1], 10) || 0;
    const seconds = parseInt(m[2], 10) || 0;
    let fractionMs = 0;
    if (m[3]) {
      if (m[3].length === 2) fractionMs = parseInt(m[3], 10) * 10;
      else if (m[3].length === 1) fractionMs = parseInt(m[3], 10) * 100;
      else fractionMs = parseInt(m[3].slice(0, 3), 10);
    }
    const rawSec = minutes * 60 + seconds + fractionMs / 1000;
    return Math.max(0, Math.round((rawSec + fileOffsetSec) * 1000) / 1000);
  };

  const stamps = matches.map((m) => ({
    timeSec: parseStampSec(m),
    startIdx: m.index,
    endIdx: m.index + m[0].length
  }));

  const words = [];
  for (let i = 0; i < stamps.length; i++) {
    const cur = stamps[i];
    const next = i + 1 < stamps.length ? stamps[i + 1] : null;
    const rawSlice = lineBody.slice(cur.endIdx, next ? next.startIdx : lineBody.length);
    const cleaned = decodeHtmlEntities(rawSlice).replace(/\s+/g, ' ').trim();
    if (!cleaned) continue;

    const startTime = cur.timeSec;
    const hasExplicitEnd = Boolean(next);
    const nextStampTime = next ? next.timeSec : startTime + 0.38;
    const endTime = Math.max(startTime + 0.08, Math.round(nextStampTime * 1000) / 1000);

    // Split multi-word slices if needed or keep single word token
    const parts = cleaned.split(' ').filter(Boolean);
    if (parts.length === 1) {
      words.push({ startTime, endTime, text: parts[0], _hasExplicitEnd: hasExplicitEnd });
    } else {
      const spanDur = Math.max(0.08, endTime - startTime);
      const step = spanDur / parts.length;
      for (let p = 0; p < parts.length; p++) {
        const wStart = Math.round((startTime + p * step) * 1000) / 1000;
        const wEnd = Math.round((p === parts.length - 1 ? endTime : startTime + (p + 1) * step) * 1000) / 1000;
        words.push({
          startTime: wStart,
          endTime: Math.max(wStart + 0.05, wEnd),
          text: parts[p],
          _hasExplicitEnd: p === parts.length - 1 ? hasExplicitEnd : true
        });
      }
    }
  }

  return words.length >= 1 ? words : [];
}

/**
 * Parses millisecond LRC formatted lyrics into [{ time: seconds, text: string, words?: [...] }]
 * Supports [mm:ss.xx] and [mm:ss.xxx], matching BitChord's LrcLib.kt & EnhancedLrc.kt.
 * Also parses enhanced word tags <mm:ss.xx> into word-level timing spans when present.
 */
function parseLrcString(lrcContent) {
  if (!lrcContent || typeof lrcContent !== 'string') return [];
  const lines = lrcContent.split(/\r?\n/);
  const stampRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const wordStampRegex = /<(?:\d{1,3}):(?:\d{2})(?:[.:](?:\d{1,3}))?>/g;
  const result = [];

  // Parse standard LRC [offset: +/-ms] tag (positive delays lyrics; negative advances them)
  let fileOffsetSec = 0;
  const offsetMatch = lrcContent.match(/\[offset:\s*([+-]?\s*\d+)\s*\]/i);
  if (offsetMatch) {
    const offsetMs = parseInt(offsetMatch[1].replace(/\s+/g, ''), 10);
    if (!isNaN(offsetMs)) {
      fileOffsetSec = offsetMs / 1000;
    }
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    if (/^\[[A-Za-z]+:.*\]$/.test(trimmed)) continue;

    stampRegex.lastIndex = 0;
    const matches = [...trimmed.matchAll(stampRegex)];

    const lineBody = trimmed.replace(stampRegex, '').trim();
    const words = parseWordRunsFromLine(lineBody, fileOffsetSec);
    if (matches.length === 0 && words.length === 0) continue;

    // Strip enhanced word stamps and time stamps for full line text
    let text = decodeHtmlEntities(lineBody.replace(wordStampRegex, '')).replace(/\s+/g, ' ').trim();
    if (!text && words.length > 0) {
      text = words.map(w => w.text).join(' ');
    }
    const displayText = text.length > 0 ? text : '♪';

    if (matches.length === 0 && words.length > 0) {
      result.push({
        time: words[0].startTime,
        text: displayText,
        words: words.map(w => ({ ...w }))
      });
      continue;
    }

    for (const match of matches) {
      const minutes = parseInt(match[1], 10) || 0;
      const seconds = parseInt(match[2], 10) || 0;
      let fractionMs = 0;
      if (match[3]) {
        if (match[3].length === 2) {
          fractionMs = parseInt(match[3], 10) * 10;
        } else if (match[3].length === 1) {
          fractionMs = parseInt(match[3], 10) * 100;
        } else {
          fractionMs = parseInt(match[3].slice(0, 3), 10);
        }
      }
      const rawTime = minutes * 60 + seconds + fractionMs / 1000;
      const timeInSeconds = Math.max(0, Math.round((rawTime + fileOffsetSec) * 1000) / 1000);
      if (words.length > 0) {
        result.push({
          time: timeInSeconds,
          text: displayText,
          words: words.map(w => ({ ...w }))
        });
      } else {
        result.push({ time: timeInSeconds, text: displayText });
      }
    }
  }

  result.sort((a, b) => a.time - b.time);

  // Refine endTime on the final word of word-synced lines using the next line's start time
  // Matches BitChord EnhancedLrc.kt: rawEnd.coerceIn(startMs + MIN_WORD_MS, startMs + TAIL_MS) where TAIL_MS = 1600ms
  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    if (Array.isArray(line.words) && line.words.length > 0) {
      const lastWord = line.words[line.words.length - 1];
      const nextLineTime = i + 1 < result.length ? result[i + 1].time : null;
      if (!lastWord._hasExplicitEnd && nextLineTime !== null && nextLineTime > lastWord.startTime) {
        const clampedEnd = Math.min(lastWord.startTime + 1.6, Math.max(lastWord.startTime + 0.08, nextLineTime));
        lastWord.endTime = Math.round(clampedEnd * 1000) / 1000;
      } else if (lastWord._hasExplicitEnd && nextLineTime !== null && nextLineTime > lastWord.startTime && lastWord.endTime > nextLineTime) {
        lastWord.endTime = Math.round(Math.max(lastWord.startTime + 0.08, nextLineTime) * 1000) / 1000;
      }
      for (const w of line.words) {
        delete w._hasExplicitEnd;
      }
      line.endTime = lastWord.endTime;
    }
  }

  // If first lyric line starts after 5 seconds, add an intro break cue (BitChord LrcLib.kt)
  if (result.length > 0 && result[0].time > 5) {
    result.unshift({ time: 0, text: '♪' });
  }

  return result;
}

/**
 * Parses a TTML timestamp ("01:02.345", "00:01:02.345", "12.345s", "12345ms") into seconds.
 * Matches BitChord TtmlLyrics.kt parseTtmlTimestamp().
 */
function parseTtmlTimestamp(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value) return null;
  if (value.endsWith('ms')) {
    const ms = parseFloat(value.slice(0, -2));
    return isNaN(ms) ? null : Math.round(ms) / 1000;
  }
  if (value.endsWith('s')) {
    value = value.slice(0, -1);
  }
  const parts = value.split(':');
  let seconds = 0;
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseFloat(parts[2]);
    if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
    seconds = h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseFloat(parts[1]);
    if (isNaN(m) || isNaN(s)) return null;
    seconds = m * 60 + s;
  } else if (parts.length === 1) {
    const s = parseFloat(parts[0]);
    if (isNaN(s)) return null;
    seconds = s;
  } else {
    return null;
  }
  return Math.max(0, Math.round(seconds * 1000) / 1000);
}

/**
 * Parses Apple Music / BetterLyrics TTML into synced lyric lines with word timings.
 * Matches BitChord TtmlLyrics.kt & LyricAlignments.kt (hierarchical span tree parser,
 * merges adjacent syllable spans into whole words, extracts x-bg background vocals even when
 * nested, ignores x-translation and x-roman subtrees, assigns v1/v2 duet alignment, and inserts ♪ cues).
 */
function parseTtmlLyrics(ttml) {
  if (!ttml || typeof ttml !== 'string' || !ttml.includes('<p')) return [];
  const rawLines = [];
  const pRegex = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;

  const extractAttr = (attrStr, name) => {
    const m = attrStr.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
    return m ? m[1] : null;
  };

  const buildSpanTree = (innerHtml) => {
    const root = { type: 'root', role: '', agent: null, begin: null, end: null, children: [] };
    const stack = [root];
    const tokenRegex = /<(\/?)span\b([^>]*)>|<br\s*\/?>|<[^>]+>|([^<]+)/gi;
    let m;
    while ((m = tokenRegex.exec(innerHtml)) !== null) {
      if (m[3] !== undefined) {
        stack[stack.length - 1].children.push({ type: 'text', text: m[3] });
      } else if (m[1] !== undefined) {
        const isClosing = m[1] === '/';
        const attrs = m[2] || '';
        const isSelfClosing = /\/\s*$/.test(attrs);
        if (isClosing) {
          if (stack.length > 1) stack.pop();
        } else if (!isSelfClosing) {
          const role = (extractAttr(attrs, 'ttm:role') || extractAttr(attrs, 'role') || '').trim().toLowerCase();
          const agent = extractAttr(attrs, 'ttm:agent') || extractAttr(attrs, 'agent') || null;
          const begin = parseTtmlTimestamp(extractAttr(attrs, 'begin'));
          const end = parseTtmlTimestamp(extractAttr(attrs, 'end'));
          const node = { type: 'span', role, agent, begin, end, children: [] };
          stack[stack.length - 1].children.push(node);
          stack.push(node);
        }
      } else if (/^<br/i.test(m[0])) {
        stack[stack.length - 1].children.push({ type: 'text', text: ' ' });
      }
    }
    return root;
  };

  const isIgnoredRole = (role) => role === 'x-translation' || role === 'x-roman';

  const collectPlainText = (node) => {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (node.type === 'span' && isIgnoredRole(node.role)) return '';
    return (node.children || []).map(collectPlainText).join('');
  };

  const hasTimedChild = (node) => {
    if (!node || !Array.isArray(node.children)) return false;
    return node.children.some(
      ch => ch.type === 'span' && !isIgnoredRole(ch.role) && ch.role !== 'x-bg' && (ch.begin !== null || hasTimedChild(ch))
    );
  };

  let pMatch;
  while ((pMatch = pRegex.exec(ttml)) !== null) {
    const pAttrs = pMatch[1] || '';
    const pBody = pMatch[2] || '';
    const pBegin = parseTtmlTimestamp(extractAttr(pAttrs, 'begin'));
    const pEnd = parseTtmlTimestamp(extractAttr(pAttrs, 'end'));
    let lineAgent = extractAttr(pAttrs, 'ttm:agent') || extractAttr(pAttrs, 'agent') || null;

    const root = buildSpanTree(pBody);
    const syllables = [];
    const bgChunks = [];
    const untimedLeadText = [];

    const collectNode = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      for (const child of node.children) {
        if (child.type === 'text') {
          const decoded = decodeHtmlEntities(child.text || '');
          if (!decoded) continue;
          const trimmed = decoded.trim();
          if (!trimmed) {
            if (syllables.length > 0 && /\s/.test(decoded)) {
              syllables[syllables.length - 1].endsWord = true;
            }
          } else if (syllables.length > 0) {
            // Attach trailing punctuation outside spans to the preceding syllable
            syllables[syllables.length - 1].text += trimmed;
            syllables[syllables.length - 1].endsWord = /\s$/.test(decoded);
          } else {
            untimedLeadText.push(decoded);
          }
          continue;
        }

        if (child.type === 'span') {
          if (isIgnoredRole(child.role)) continue;
          if (!lineAgent && child.agent) lineAgent = child.agent;

          if (child.role === 'x-bg') {
            const bgRaw = decodeHtmlEntities(collectPlainText(child)).replace(/\s+/g, ' ').trim();
            if (bgRaw) {
              const cleanedBg = bgRaw.replace(/^\(([\s\S]*)\)$/, '$1').trim();
              if (cleanedBg) bgChunks.push(cleanedBg);
            }
            continue;
          }

          if (child.begin !== null && !hasTimedChild(child)) {
            const rawText = decodeHtmlEntities(collectPlainText(child));
            const trimmedText = rawText.trim();
            const endsWithSpace = /\s$/.test(rawText);
            if (trimmedText) {
              if (/^\s/.test(rawText) && syllables.length > 0) {
                syllables[syllables.length - 1].endsWord = true;
              }
              syllables.push({
                text: trimmedText,
                startTime: child.begin,
                endTime: child.end !== null && child.end > child.begin ? child.end : Math.round((child.begin + 0.25) * 1000) / 1000,
                endsWord: endsWithSpace
              });
            }
          } else {
            collectNode(child);
          }
        }
      }
    };

    collectNode(root);

    // Merge adjacent syllables that belong to the same word
    const words = [];
    let current = null;
    for (const part of syllables) {
      if (!current) {
        current = { startTime: part.startTime, endTime: part.endTime, text: part.text };
      } else {
        current.text += part.text;
        current.endTime = Math.max(current.endTime, part.endTime);
      }
      if (part.endsWord) {
        words.push(current);
        current = null;
      }
    }
    if (current) words.push(current);

    const lineText = words.length > 0
      ? words.map(w => w.text).join(' ')
      : untimedLeadText.join(' ').replace(/\s+/g, ' ').trim();

    const startTime = pBegin !== null ? pBegin : (words.length > 0 ? words[0].startTime : null);
    const endTime = pEnd !== null ? pEnd : (words.length > 0 ? words[words.length - 1].endTime : (startTime !== null ? startTime + 3 : null));

    if (startTime !== null && lineText) {
      const entry = { time: startTime, text: lineText, endTime };
      if (words.length > 0) entry.words = words;
      if (bgChunks.length > 0) entry.backgroundText = bgChunks.join(' ');
      if (lineAgent) entry.agent = lineAgent.trim();
      rawLines.push(entry);
    }
  }

  if (rawLines.length === 0) return [];
  rawLines.sort((a, b) => a.time - b.time);

  // Assign duet alignment (BitChord LyricAlignments.kt: primary vocalist left, secondary right)
  const agents = [...new Set(rawLines.map(l => l.agent).filter(Boolean))];
  if (agents.length > 1) {
    const primaryAgent = agents[0];
    for (const line of rawLines) {
      line.isRightAligned = Boolean(line.agent && line.agent !== primaryAgent);
    }
  }

  const result = [];
  if (rawLines[0].time > 5) {
    result.push({ time: 0, text: '♪' });
  }
  for (let i = 0; i < rawLines.length; i++) {
    const cur = rawLines[i];
    result.push(cur);
    const next = i + 1 < rawLines.length ? rawLines[i + 1] : null;
    if (next && cur.endTime && next.time - cur.endTime >= 5) {
      result.push({ time: Math.round((cur.endTime + 0.35) * 1000) / 1000, text: '♪' });
    }
  }

  return result;
}

/**
 * Fetches word-synced or line-synced lyrics from SimpMusic API by exact YouTube videoId.
 * Matches BitChord SimpMusicLyrics.kt provider architecture.
 */
async function fetchSimpMusicLyrics(videoId, durationSeconds) {
  if (!videoId || typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(videoId.trim())) {
    return null;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`https://api-lyrics.simpmusic.org/v1/${encodeURIComponent(videoId.trim())}`, {
      headers: {
        'User-Agent': LRCLIB_USER_AGENT,
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timer));

    if (!res.ok) return null;
    const json = await res.json();
    if (!json || (json.success !== true && json.type !== 'success') || !Array.isArray(json.data) || json.data.length === 0) {
      return null;
    }

    const targetDur = (typeof durationSeconds === 'number' && durationSeconds > 0) ? durationSeconds : 0;
    const candidates = json.data.filter(item => {
      if (!item || typeof item !== 'object') return false;
      const itemDur = Number(item.duration) || 0;
      if (targetDur > 0 && itemDur > 0 && Math.abs(itemDur - targetDur) > 10) {
        return false;
      }
      return Boolean((item.richSyncLyrics && item.richSyncLyrics.trim()) || (item.syncedLyrics && item.syncedLyrics.trim()));
    });

    if (candidates.length === 0) return null;
    if (targetDur > 0) {
      candidates.sort((a, b) => Math.abs((Number(a.duration) || 0) - targetDur) - Math.abs((Number(b.duration) || 0) - targetDur));
    }

    // Prefer richSyncLyrics (word-synced Enhanced LRC) first
    for (const item of candidates) {
      if (item.richSyncLyrics && item.richSyncLyrics.trim()) {
        const parsed = parseLrcString(item.richSyncLyrics);
        if (parsed && parsed.length > 0) return parsed;
      }
    }
    for (const item of candidates) {
      if (item.syncedLyrics && item.syncedLyrics.trim()) {
        const parsed = parseLrcString(item.syncedLyrics);
        if (parsed && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    // Ignore network or timeout errors during multi-provider race
  }
  return null;
}

function sanitizeAlbumForLookup(album, title = '') {
  if (!album || typeof album !== 'string') return '';
  const trimmed = album.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (['youtube music', 'single', 'song', 'video', 'album', 'ep', 'unknown album', 'deja'].includes(lower)) {
    return '';
  }
  if (title && lower === String(title).trim().toLowerCase()) {
    return '';
  }
  return trimmed;
}

/**
 * Fetches Apple Music syllable/word-synced TTML lyrics via BiniLyrics (matching Android BiniLyrics.kt).
 */
async function fetchBiniLyrics(title, artist, durationSeconds, album = '') {
  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistTerm(artist);
  if (!cleanTitle || !cleanArtist) return null;
  const cleanAlbum = sanitizeAlbumForLookup(album, cleanTitle);

  const queryBini = async (t, a, al) => {
    try {
      let url = `https://lyrics-api.binimum.org/?track=${encodeURIComponent(t)}&artist=${encodeURIComponent(a)}`;
      if (al) url += `&album=${encodeURIComponent(al)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': LRCLIB_USER_AGENT,
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timer));
      if (!res.ok) return null;
      const json = await res.json();
      const results = Array.isArray(json?.results) ? json.results : [];
      if (results.length === 0) return null;

      const wantDurMs = durationSeconds && durationSeconds > 0 ? durationSeconds * 1000 : 0;
      const ranked = results
        .filter(r => r && typeof r.lyricsUrl === 'string' && r.lyricsUrl)
        .sort((x, y) => {
          if (wantDurMs > 0) {
            const dx = Math.abs((Number(x.durationInMillis) || wantDurMs) - wantDurMs);
            const dy = Math.abs((Number(y.durationInMillis) || wantDurMs) - wantDurMs);
            return dx - dy;
          }
          return 0;
        });

      for (const hit of ranked.slice(0, 2)) {
        if (wantDurMs > 0 && hit.durationInMillis && Math.abs(Number(hit.durationInMillis) - wantDurMs) > 15000) {
          continue;
        }
        const ttmlCtrl = new AbortController();
        const ttmlTimer = setTimeout(() => ttmlCtrl.abort(), 4500);
        const ttmlRes = await fetch(hit.lyricsUrl, {
          headers: { 'User-Agent': LRCLIB_USER_AGENT },
          signal: ttmlCtrl.signal
        }).finally(() => clearTimeout(ttmlTimer));
        if (!ttmlRes.ok) continue;
        const ttml = (await ttmlRes.text()).trim();
        if (!ttml) continue;
        const parsed = parseTtmlLyrics(ttml);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  };

  if (cleanAlbum) {
    const withAlbum = await queryBini(cleanTitle, cleanArtist, cleanAlbum);
    if (withAlbum) return withAlbum;
  }
  const withoutAlbum = await queryBini(cleanTitle, cleanArtist, '');
  if (withoutAlbum) return withoutAlbum;

  const primaryArtist = getPrimaryArtist(cleanArtist);
  if (primaryArtist && primaryArtist !== cleanArtist) {
    return await queryBini(cleanTitle, primaryArtist, '');
  }
  return null;
}

/**
 * Fetches syllable/word-synced TTML lyrics from BetterLyrics API.
 * Matches BitChord BetterLyrics.kt provider architecture.
 */
async function fetchBetterLyrics(title, artist, durationSeconds, album = '') {
  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistTerm(artist);
  if (!cleanTitle || !cleanArtist) return null;
  const cleanAlbum = sanitizeAlbumForLookup(album, cleanTitle);

  const queryOnce = async (t, a, dur, al) => {
    try {
      let url = `https://lyrics-api.boidu.dev/getLyrics?s=${encodeURIComponent(t)}&a=${encodeURIComponent(a)}`;
      if (dur && dur > 0) url += `&d=${Math.round(dur)}`;
      if (al) url += `&al=${encodeURIComponent(al)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, {
        headers: {
          'User-Agent': LRCLIB_USER_AGENT,
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timer));

      if (!res.ok) return null;
      const json = await res.json();
      const ttml = json && typeof json.ttml === 'string' ? json.ttml.trim() : '';
      if (!ttml) return null;
      const parsed = parseTtmlLyrics(ttml);
      return parsed && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  };

  const queryTitleAndArtist = async (t, a, dur) => {
    if (cleanAlbum) {
      const hitWithAlbum = await queryOnce(t, a, dur, cleanAlbum);
      if (hitWithAlbum) return hitWithAlbum;
    }
    const hitNoAlbum = await queryOnce(t, a, dur, '');
    if (hitNoAlbum) return hitNoAlbum;
    if (dur && dur > 0) {
      return await queryOnce(t, a, 0, '');
    }
    return null;
  };

  const primary = await queryTitleAndArtist(cleanTitle, cleanArtist, durationSeconds);
  if (primary) return primary;

  const primaryArtist = getPrimaryArtist(cleanArtist);
  if (primaryArtist && primaryArtist !== cleanArtist) {
    const fallback = await queryTitleAndArtist(cleanTitle, primaryArtist, durationSeconds);
    if (fallback) return fallback;
  }
  return null;
}

/**
 * Fetches word/syllable-synced lyrics from LyricsPlus mirrors.
 * Matches BitChord LyricsPlus.kt provider architecture.
 */
async function fetchLyricsPlus(title, artist, durationSeconds) {
  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistTerm(artist);
  if (!cleanTitle || !cleanArtist) return null;

  const bases = [
    'https://lyricsplus.prjktla.my.id',
    'https://lyrics-plus-backend.vercel.app'
  ];

  const parseLyricsPlusPayload = (json) => {
    if (!json || !Array.isArray(json.lyrics) || json.lyrics.length === 0) return null;
    const rawLines = [];
    for (const entry of json.lyrics) {
      if (!entry || typeof entry !== 'object') continue;
      const startMs = Number(entry.time);
      if (isNaN(startMs)) continue;
      const durMs = Number(entry.duration) || 0;

      const words = [];
      if (Array.isArray(entry.syllabus) && entry.syllabus.length > 0) {
        let curWord = null;
        for (const syl of entry.syllabus) {
          if (!syl || typeof syl.text !== 'string') continue;
          const decodedSyl = decodeHtmlEntities(syl.text);
          if (!decodedSyl.trim()) continue;
          const sMs = Number(syl.time);
          const dMs = Number(syl.duration) || 0;
          if (isNaN(sMs)) continue;
          const wStart = Math.max(0, Math.round(sMs) / 1000);
          const wEnd = Math.max(wStart + 0.08, Math.round(sMs + Math.max(dMs, 120)) / 1000);
          const leadsSpace = /^\s/.test(decodedSyl);
          const endsWithSpace = /\s$/.test(decodedSyl);
          const piece = decodedSyl.trim();

          if (curWord && leadsSpace) {
            words.push(curWord);
            curWord = null;
          }
          if (!curWord) {
            curWord = { startTime: wStart, endTime: wEnd, text: piece };
          } else {
            curWord.text += piece;
            curWord.endTime = Math.max(curWord.endTime, wEnd);
          }
          if (endsWithSpace) {
            words.push(curWord);
            curWord = null;
          }
        }
        if (curWord) words.push(curWord);
      }

      const rawText = typeof entry.text === 'string' ? decodeHtmlEntities(entry.text).trim() : '';
      const text = rawText || (words.length > 0 ? words.map(w => w.text).join(' ') : '');
      if (!text) continue;

      const rawStartSec = Math.max(0, Math.round(startMs) / 1000);
      const startTime = words.length > 0 ? Math.min(rawStartSec, words[0].startTime) : rawStartSec;
      const rawEndSec = Math.max(startTime + 0.25, Math.round(startMs + Math.max(durMs, 250)) / 1000);
      const endTime = words.length > 0 ? Math.max(rawEndSec, words[words.length - 1].endTime) : rawEndSec;

      const lineObj = { time: startTime, text, endTime };
      if (words.length > 0) lineObj.words = words;
      rawLines.push(lineObj);
    }

    if (rawLines.length === 0) return null;
    rawLines.sort((a, b) => a.time - b.time);

    const out = [];
    if (rawLines[0].time > 5) {
      out.push({ time: 0, text: '♪' });
    }
    for (let i = 0; i < rawLines.length; i++) {
      const cur = rawLines[i];
      out.push(cur);
      const next = i + 1 < rawLines.length ? rawLines[i + 1] : null;
      if (next && cur.endTime && next.time - cur.endTime >= 5) {
        out.push({ time: Math.round((cur.endTime + 0.35) * 1000) / 1000, text: '♪' });
      }
    }
    return out;
  };

  for (const base of bases) {
    try {
      let url = `${base}/v2/lyrics/get?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}`;
      if (durationSeconds && durationSeconds > 0) {
        url += `&duration=${Math.round(durationSeconds)}`;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': LRCLIB_USER_AGENT,
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timer));

      if (!res.ok) continue;
      const json = await res.json();
      const parsed = parseLyricsPlusPayload(json);
      if (parsed && parsed.length > 0) return parsed;
    } catch {
      // Try next mirror
    }
  }
  return null;
}

/**
 * Fetches millisecond synchronized lyrics from LRCLIB API
 * (BitChord LrcLib.kt provider architecture)
 * Matches track duration within ±4 seconds tolerance first (preferring word-synced Enhanced LRC),
 * with graceful fallback when track duration was an unverified estimate.
 */
async function fetchLrcLibLyrics(title, artist, durationSeconds) {
  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistTerm(artist);
  const primaryArtist = getPrimaryArtist(cleanArtist);
  if (!cleanTitle) return null;

  // Build title candidates (including stripping artist prefixes like "Taylor Swift - Cruel Summer")
  const titleCandidates = [cleanTitle];
  if (cleanArtist) {
    const escaped = cleanArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withoutArtist = cleanTitle.replace(new RegExp('^' + escaped + '\\s*[-:–—]\\s*', 'i'), '').trim();
    if (withoutArtist && !titleCandidates.includes(withoutArtist)) {
      titleCandidates.push(withoutArtist);
    }
  }
  if (primaryArtist && primaryArtist !== cleanArtist) {
    const escaped = primaryArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withoutArtist = cleanTitle.replace(new RegExp('^' + escaped + '\\s*[-:–—]\\s*', 'i'), '').trim();
    if (withoutArtist && !titleCandidates.includes(withoutArtist)) {
      titleCandidates.push(withoutArtist);
    }
  }
  if (cleanTitle.includes(' - ')) {
    const afterDash = cleanTitle.split(' - ').slice(1).join(' - ').trim();
    if (afterDash && !titleCandidates.includes(afterDash)) {
      titleCandidates.push(afterDash);
    }
    const beforeDash = cleanTitle.split(' - ')[0].trim();
    if (beforeDash && !titleCandidates.includes(beforeDash)) {
      titleCandidates.push(beforeDash);
    }
  }

  const durationParam = (durationSeconds && typeof durationSeconds === 'number' && durationSeconds > 0)
    ? Math.round(durationSeconds)
    : null;

  const artistCandidates = [cleanArtist, primaryArtist].filter(Boolean);
  const uniqueArtists = [...new Set(artistCandidates)];

  const tryParseLrcResponse = (data, toleranceSec = 4) => {
    if (!data || !data.syncedLyrics || data.syncedLyrics.trim().length === 0) return null;
    if (toleranceSec > 0 && durationParam && data.duration) {
      if (Math.abs(data.duration - durationParam) > toleranceSec) {
        return null;
      }
    }
    const parsed = parseLrcString(data.syncedLyrics);
    return (parsed && parsed.length > 0) ? parsed : null;
  };

  let looseFallbackCandidate = null;

  // 1. Exact match attempt via /get endpoint with title candidates
  for (const tCand of titleCandidates) {
    for (const art of (uniqueArtists.length > 0 ? uniqueArtists : [''])) {
      // 1a. Try /get with exact duration parameter
      if (durationParam) {
        try {
          let getUrl = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(tCand)}`;
          if (art) getUrl += `&artist_name=${encodeURIComponent(art)}`;
          getUrl += `&duration=${durationParam}`;

          const res = await fetch(getUrl, {
            headers: { 'User-Agent': LRCLIB_USER_AGENT }
          });
          if (res.ok) {
            const data = await res.json();
            const parsed = tryParseLrcResponse(data, 0);
            if (parsed) return parsed;
          }
        } catch (err) {
          console.warn('[LRCLIB] /get with duration failed:', err.message);
        }
      }

      // 1b. Try /get without duration parameter, then check ±4 seconds tolerance
      try {
        let getUrlNoDur = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(tCand)}`;
        if (art) getUrlNoDur += `&artist_name=${encodeURIComponent(art)}`;

        const res = await fetch(getUrlNoDur, {
          headers: { 'User-Agent': LRCLIB_USER_AGENT }
        });
        if (res.ok) {
          const data = await res.json();
          const parsed = tryParseLrcResponse(data, 4);
          if (parsed) return parsed;
          if (!looseFallbackCandidate) {
            looseFallbackCandidate = tryParseLrcResponse(data, 15);
          }
        }
      } catch (err) {
        console.warn('[LRCLIB] /get without duration failed:', err.message);
      }
    }
  }

  // 2. Fuzzy search fallback via /search endpoint (supporting track_name+artist and general query)
  const searchQueries = [];
  for (const tCand of titleCandidates) {
    for (const art of uniqueArtists) {
      searchQueries.push(`${LRCLIB_BASE}/search?track_name=${encodeURIComponent(tCand)}&artist_name=${encodeURIComponent(art)}`);
      searchQueries.push(`${LRCLIB_BASE}/search?q=${encodeURIComponent(tCand + ' ' + art)}`);
    }
    searchQueries.push(`${LRCLIB_BASE}/search?q=${encodeURIComponent(tCand)}`);
  }

  const hasWordTimestamps = (lrcStr) => /<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/.test(lrcStr || '');

  const seenUrls = new Set();
  for (const searchUrl of searchQueries) {
    if (seenUrls.has(searchUrl)) continue;
    seenUrls.add(searchUrl);

    try {
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': LRCLIB_USER_AGENT }
      });
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length > 0) {
          const syncedItems = items.filter(it => it && it.syncedLyrics && it.syncedLyrics.trim().length > 0);
          if (syncedItems.length > 0) {
            if (durationParam) {
              // Prefer candidates within ±4 seconds, sorting word-synced first then closest duration (BitChord LrcLib.kt)
              const closeItems = syncedItems.filter(it => Math.abs((it.duration || 0) - durationParam) <= 4);
              if (closeItems.length > 0) {
                closeItems.sort((a, b) => {
                  const aWord = hasWordTimestamps(a.syncedLyrics) ? 0 : 1;
                  const bWord = hasWordTimestamps(b.syncedLyrics) ? 0 : 1;
                  if (aWord !== bWord) return aWord - bWord;
                  return Math.abs((a.duration || 0) - durationParam) - Math.abs((b.duration || 0) - durationParam);
                });
                const parsed = parseLrcString(closeItems[0].syncedLyrics);
                if (parsed.length > 0) return parsed;
              }
              // Keep a fallback candidate if durationParam was an estimate or video edit
              if (!looseFallbackCandidate) {
                const nearItems = syncedItems
                  .slice()
                  .sort((a, b) => Math.abs((a.duration || 0) - durationParam) - Math.abs((b.duration || 0) - durationParam));
                if (Math.abs((nearItems[0].duration || 0) - durationParam) <= 15) {
                  const parsed = parseLrcString(nearItems[0].syncedLyrics);
                  if (parsed.length > 0) looseFallbackCandidate = parsed;
                }
              }
            } else {
              syncedItems.sort((a, b) => (hasWordTimestamps(b.syncedLyrics) ? 1 : 0) - (hasWordTimestamps(a.syncedLyrics) ? 1 : 0));
              const parsed = parseLrcString(syncedItems[0].syncedLyrics);
              if (parsed.length > 0) return parsed;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[LRCLIB] /search fallback failed:', err.message);
    }
  }

  return looseFallbackCandidate || null;
}

/**
 * Fetches lyrics exposed in YouTube Music's Lyrics tab via InnerTube
 * (BitChord YouTubeLyrics.kt provider architecture)
 */
async function fetchYouTubeMusicLyrics(videoId, ses) {
  if (!videoId || typeof videoId !== 'string') return null;

  try {
    let nextData = null;
    try {
      nextData = await postMusic('next', { videoId, playlistId: `RDAMVM${videoId}`, isAudioOnly: true }, ses);
    } catch {
      // Guest ANDROID_MUSIC fallback (matches getNextQueue)
      const payload = {
        context: { client: { clientName: 'ANDROID_MUSIC', clientVersion: '6.20.51', hl: 'en', gl: 'US' } },
        videoId,
        playlistId: `RDAMVM${videoId}`,
        isAudioOnly: true
      };
      const res = await fetch(`${MUSIC_BASE}/next?prettyPrint=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.android.apps.youtube.music/6.20.51 (Linux; U; Android 11)'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) nextData = await res.json();
    }

    let browseId = null;
    let browseParams = null;

    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (browseId) return;
      if (Array.isArray(node)) { node.forEach(walk); return; }

      if (node.tabRenderer) {
        const title = node.tabRenderer.title || '';
        const endpoint = node.tabRenderer.endpoint?.browseEndpoint;
        if ((typeof title === 'string' && title.toLowerCase().includes('lyric')) || node.tabRenderer.tabIdentifier === 'LYRICS') {
          if (endpoint?.browseId) {
            browseId = endpoint.browseId;
            browseParams = endpoint.params;
            return;
          }
        }
      }
      Object.values(node).forEach(walk);
    }
    if (nextData) walk(nextData);

    if (!browseId) return null;

    let browseData = null;
    try {
      const browsePayload = { browseId };
      if (browseParams) browsePayload.params = browseParams;
      browseData = await postMusic('browse', browsePayload, ses);
    } catch {
      const res = await fetch(`${MUSIC_BASE}/browse?prettyPrint=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.android.apps.youtube.music/6.20.51 (Linux; U; Android 11)'
        },
        body: JSON.stringify({
          context: { client: { clientName: 'ANDROID_MUSIC', clientVersion: '6.20.51', hl: 'en', gl: 'US' } },
          browseId
        })
      });
      if (res.ok) browseData = await res.json();
    }

    let rawText = '';
    function walkBrowse(node) {
      if (!node || typeof node !== 'object') return;
      if (rawText) return;
      if (Array.isArray(node)) { node.forEach(walkBrowse); return; }

      if (node.musicDescriptionShelfRenderer) {
        const desc = node.musicDescriptionShelfRenderer.description;
        if (desc && Array.isArray(desc.runs)) {
          rawText = desc.runs.map(r => r.text).join('');
          return;
        }
      }
      Object.values(node).forEach(walkBrowse);
    }
    if (browseData) walkBrowse(browseData);

    if (!rawText || !rawText.trim()) return null;

    // If description has LRC stamps, parse with parseLrcString
    if (/\[\d{1,2}:\d{2}/.test(rawText)) {
      const parsed = parseLrcString(rawText);
      if (parsed.length > 0) return parsed;
    }

    const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) return null;

    // BitChord LyricLine(0L, text) presentation for unsynced plain text
    return rawLines.map(text => ({
      time: 0,
      text
    }));
  } catch (err) {
    console.warn('[InnerTube] fetchYouTubeMusicLyrics failed:', err.message);
    return null;
  }
}

/**
 * Extracts and formats timed cues from transcriptCueRenderer or transcriptSegmentRenderer
 * (BitChord YouTubeLyrics.kt YouTubeTranscriptLyrics architecture)
 */
function parseTranscriptData(data) {
  if (!data || typeof data !== 'object') return null;
  const cues = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.transcriptCueRenderer) {
      const cue = node.transcriptCueRenderer;
      const startMs = parseInt(cue.startOffsetMs || cue.startMs, 10);
      let text = '';
      if (cue.cue) {
        if (typeof cue.cue === 'string') text = cue.cue;
        else if (cue.cue.simpleText) text = cue.cue.simpleText;
        else if (Array.isArray(cue.cue.runs)) text = cue.cue.runs.map(r => r.text || '').join('');
      }
      text = text.replace(/^[♪\s\n]+|[♪\s\n]+$/g, '').trim();
      if (!isNaN(startMs) && text) {
        cues.push({
          time: Math.round((startMs / 1000) * 100) / 100,
          text
        });
      }
      return;
    }
    if (node.transcriptSegmentRenderer) {
      const seg = node.transcriptSegmentRenderer;
      const startMs = parseInt(seg.startMs || seg.startOffsetMs, 10);
      let text = '';
      if (seg.snippet && Array.isArray(seg.snippet.runs)) {
        text = seg.snippet.runs.map(r => r.text || '').join('');
      } else if (seg.snippet && typeof seg.snippet.simpleText === 'string') {
        text = seg.snippet.simpleText;
      }
      text = text.replace(/^[♪\s\n]+|[♪\s\n]+$/g, '').trim();
      if (!isNaN(startMs) && text) {
        cues.push({
          time: Math.round((startMs / 1000) * 100) / 100,
          text
        });
      }
      return;
    }
    for (const val of Object.values(node)) {
      walk(val);
    }
  }

  walk(data);
  if (cues.length === 0) return null;

  cues.sort((a, b) => a.time - b.time);
  if (cues.length > 0 && cues[0].time > 5) {
    cues.unshift({ time: 0, text: '♪' });
  }

  return cues;
}

/**
 * Timed YouTube transcript / captions for the exact playing video
 * (BitChord YouTubeLyrics.kt YouTubeTranscriptLyrics architecture)
 */
async function fetchYouTubeTranscriptLyrics(videoId, ses) {
  if (!videoId || typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  // 1. BitChord get_transcript protobuf params call
  try {
    const bytes = Buffer.concat([Buffer.from([10, videoId.length]), Buffer.from(videoId)]);
    const params = bytes.toString('base64');
    const data = await postMusic('get_transcript', { params }, ses);
    const parsed = parseTranscriptData(data);
    if (parsed && parsed.length > 0) return parsed;
  } catch (err) {
    // Expected fallback if get_transcript is restricted on current client
  }

  // 2. Fetch engagement panel transcript params via next endpoint
  try {
    const nextData = await postMusic('next', { videoId, isAudioOnly: true }, ses).catch(() => null);
    if (nextData) {
      let transcriptParams = null;
      function walk(node) {
        if (!node || typeof node !== 'object') return;
        if (transcriptParams) return;
        if (node.getTranscriptEndpoint && node.getTranscriptEndpoint.params) {
          transcriptParams = node.getTranscriptEndpoint.params;
          return;
        }
        for (const v of Object.values(node)) walk(v);
      }
      walk(nextData);

      if (transcriptParams) {
        const tData = await postMusic('get_transcript', { params: transcriptParams }, ses).catch(() => null);
        const parsed = parseTranscriptData(tData);
        if (parsed && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {}

  return null;
}

/**
 * Unified Multi-Provider Synced Lyrics Resolver (BitChord LyricsRepository.kt raceProviders)
 * Races SimpMusic (by exact YouTube videoId), BetterLyrics (Apple Music TTML word-sync),
 * LyricsPlus (word/syllable sync), and LRCLIB (Enhanced + standard LRC).
 * Prefers word-synced lyrics over line-synced lyrics, then falls back to YouTube timed transcripts
 * and YouTube Music InnerTube plain lyrics.
 */
async function getLyrics({ videoId, title, artist, duration, album }, ses) {
  const hasWordSync = (lines) =>
    Array.isArray(lines) && lines.some(l => Array.isArray(l.words) && l.words.length > 0);
  const hasLineSync = (lines) =>
    Array.isArray(lines) && lines.length > 1 && lines.some(l => l.time > 0);

  const cleanAlbum = sanitizeAlbumForLookup(album, title);
  const tasks = [];
  if (videoId) {
    tasks.push(fetchSimpMusicLyrics(videoId, duration).catch(() => null));
  } else {
    tasks.push(Promise.resolve(null));
  }
  if (title) {
    tasks.push(fetchBiniLyrics(title, artist || '', duration, cleanAlbum).catch(() => null));
    tasks.push(fetchBetterLyrics(title, artist || '', duration, cleanAlbum).catch(() => null));
    tasks.push(fetchLyricsPlus(title, artist || '', duration).catch(() => null));
    tasks.push(fetchLrcLibLyrics(title, artist || '', duration).catch(() => null));
  } else {
    tasks.push(Promise.resolve(null), Promise.resolve(null), Promise.resolve(null), Promise.resolve(null));
  }

  const [simpLyrics, biniLyrics, betterLyrics, plusLyrics, lrcLibLyrics] = await Promise.all(tasks);
  // Match Android BitChord provider order: BiniLyrics -> BetterLyrics -> SimpMusic -> LyricsPlus -> LRCLIB
  const candidates = [biniLyrics, betterLyrics, simpLyrics, plusLyrics, lrcLibLyrics].filter(c => Array.isArray(c) && c.length > 0);

  // 1. Prefer word-synced lyrics from any provider (in priority order: BiniLyrics -> BetterLyrics -> SimpMusic -> LyricsPlus -> LRCLIB)
  const wordSynced = candidates.find(hasWordSync);
  if (wordSynced) return wordSynced;

  // 2. Otherwise take the highest-priority line-synced candidate
  const lineSynced = [biniLyrics, betterLyrics, lrcLibLyrics, simpLyrics, plusLyrics].find(hasLineSync);
  if (lineSynced) return lineSynced;

  if (candidates.length > 0) {
    return candidates[0];
  }

  // 3. Query YouTube native timed captions/transcripts if external providers missed
  if (videoId) {
    const transcriptLyrics = await fetchYouTubeTranscriptLyrics(videoId, ses);
    if (transcriptLyrics && transcriptLyrics.length > 0) {
      return transcriptLyrics;
    }
  }

  // 4. Fall back to YouTube Music InnerTube browse lyrics shelf
  if (videoId) {
    const ytmLyrics = await fetchYouTubeMusicLyrics(videoId, ses);
    if (ytmLyrics && ytmLyrics.length > 0) {
      return ytmLyrics;
    }
  }

  return null;
}

/**
 * Resolves a playable Music Video stream (direct MP4 video URL + official videoId)
 * for Spotify-style "Switch to Video" mode.
 */
// ============================================================================
// BitChord 4-Source Canvas & Video Thumbnail Preview Engine
// 1. Apple Music Editorial Motion Artwork (1080x1080 H.264 direct MP4)
// 2. Tidal Video Cover (1280x1280 square looping MP4)
// 3. Community Spotify Canvas Index (direct looping MP4)
// 4. Direct YouTube IOS 1080p/720p MP4 stream (with VisitorData, zero iframe)
// ============================================================================

let cachedAppleBearer = null;
let appleBearerExpiry = 0;
let cachedCommunityCanvas = null;
let communityCanvasFetchedAt = 0;
const canvasResultCache = new Map();

function normalizeCanvasMatch(str) {
  return cleanSearchTerm(String(str || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getAppleMusicWebBearer() {
  const now = Date.now();
  if (cachedAppleBearer && now < appleBearerExpiry - 60000) {
    return cachedAppleBearer;
  }
  try {
    const htmlRes = await fetch('https://music.apple.com/us/browse', {
      headers: { 'User-Agent': CHROME_UA }
    });
    if (!htmlRes.ok) return null;
    const html = await htmlRes.text();
    const scripts = [...new Set([...html.matchAll(/\/assets\/index(?:-legacy)?[~-][A-Za-z0-9_-]+\.js/g)].map(m => m[0]))];
    for (const path of scripts) {
      const jsRes = await fetch(`https://music.apple.com${path}`, {
        headers: { 'User-Agent': CHROME_UA }
      });
      if (!jsRes.ok) continue;
      const js = await jsRes.text();
      const jwts = [...new Set([...js.matchAll(/ey[A-Za-z0-9_-]+\.ey[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)/g)].map(m => m[0]))];
      for (const jwt of jwts) {
        try {
          const parts = jwt.split('.');
          const header = Buffer.from(parts[0], 'base64url').toString('utf8');
          const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
          if (header.includes('WebPlayKid') || payload.includes('AMPWebPlay')) {
            const expMatch = payload.match(/"exp"\s*:\s*(\d+)/);
            const expMs = expMatch ? Number(expMatch[1]) * 1000 : (now + 3600000);
            if (expMs > now) {
              cachedAppleBearer = jwt;
              appleBearerExpiry = expMs;
              return jwt;
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[Canvas] Apple bearer scrape notice:', err.message);
  }
  return null;
}

async function resolveAppleM3u8ToDirectMp4(m3u8Url) {
  if (!m3u8Url) return null;
  try {
    const res = await fetch(m3u8Url, { headers: { 'User-Agent': CHROME_UA } });
    if (!res.ok) return null;
    const masterTxt = await res.text();
    // Extract all variant .m3u8 URLs
    const lines = masterTxt.split(/\r?\n/).map(l => l.trim()).filter(l => l.startsWith('https://') && l.endsWith('.m3u8') && !l.includes('iframes'));
    if (lines.length === 0) return null;

    // Prefer H.264 (gr290 / gr280 / gr270 / gr265 / gr260 / gr250 / gr240) SDR square streams for universal HTML5 <video> decode
    const h264Candidates = lines.filter(l => /_gr2\d\d_sdr_/.test(l));
    const chosenVariant = h264Candidates.length > 0 ? h264Candidates[h264Candidates.length - 1] : lines[0];
    // Apple's HLS fMP4 variants store the complete contiguous video at the exact same URL ending in -.mp4
    const directMp4 = chosenVariant.replace(/\.m3u8$/, '-.mp4');
    return directMp4;
  } catch {
    return null;
  }
}

async function fetchAppleMusicCanvas(title, artist, album) {
  if (!title || !artist) return null;
  try {
    const bearer = await getAppleMusicWebBearer();
    if (!bearer) return null;
    const cleanT = cleanSearchTerm(title);
    const cleanA = cleanArtistTerm(artist);
    const cleanAl = sanitizeAlbumForLookup(album, cleanT);
    const headers = {
      'Authorization': `Bearer ${bearer}`,
      'Origin': 'https://music.apple.com',
      'Referer': 'https://music.apple.com/',
      'User-Agent': CHROME_UA
    };

    const searchAppleTerm = async (termStr) => {
      const searchUrl = `https://amp-api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(termStr)}&types=songs&limit=8&extend=editorialVideo&include=albums`;
      const sRes = await fetch(searchUrl, { headers });
      if (!sRes.ok) return null;
      const sData = await sRes.json();
      const songs = sData?.results?.songs?.data || [];
      const wantT = normalizeCanvasMatch(cleanT);
      const wantA = normalizeCanvasMatch(cleanA);
      const wantPrimaryA = normalizeCanvasMatch(getPrimaryArtist(cleanA));

      for (const song of songs) {
        const attr = song?.attributes || {};
        const gotT = normalizeCanvasMatch(attr.name || '');
        const gotA = normalizeCanvasMatch(attr.artistName || '');
        if (!gotT || !gotA) continue;
        if (!(gotT.includes(wantT) || wantT.includes(gotT))) continue;
        const artistMatches = gotA.includes(wantA) || wantA.includes(gotA) || (wantPrimaryA && (gotA.includes(wantPrimaryA) || wantPrimaryA.includes(gotA)));
        if (!artistMatches) continue;

        let edVid = attr.editorialVideo;
        if (!edVid) {
          let albumId = song?.relationships?.albums?.data?.[0]?.id;
          if (!albumId && attr.url) {
            const m = String(attr.url).match(/\/album\/[^/?]+\/(\d+)/);
            if (m) albumId = m[1];
          }
          if (albumId) {
            const aRes = await fetch(`https://amp-api.music.apple.com/v1/catalog/us/albums/${albumId}?extend=editorialVideo`, { headers });
            if (aRes.ok) {
              const aData = await aRes.json();
              edVid = aData?.data?.[0]?.attributes?.editorialVideo;
            }
          }
        }

        if (edVid) {
          const m3u8 = edVid.motionDetailSquare?.video ||
                       edVid.motionSquareVideo1x1?.video ||
                       edVid.motionDetailTall?.video ||
                       edVid.motionTallVideo3x4?.video ||
                       edVid.motionDetailRaw?.video;
          const directMp4 = await resolveAppleM3u8ToDirectMp4(m3u8);
          if (directMp4) {
            return {
              url: directMp4,
              mimeType: 'video/mp4',
              width: 1080,
              height: 1080,
              aspect: 'square',
              source: 'Apple Music Motion',
              qualityLabel: 'Apple Motion 1080p',
              isCanvas: true,
              title: attr.name || title
            };
          }
        }
      }
      return null;
    };

    if (cleanAl) {
      const hitWithAlbum = await searchAppleTerm(`${cleanA} ${cleanT} ${cleanAl}`.trim());
      if (hitWithAlbum) return hitWithAlbum;
    }
    return await searchAppleTerm(`${cleanA} ${cleanT}`.trim());
  } catch (err) {
    console.warn('[Canvas] AppleMusicCanvas notice:', err.message);
  }
  return null;
}

async function fetchTidalCanvas(title, artist, album) {
  if (!title || !artist) return null;
  try {
    const cleanT = cleanSearchTerm(title);
    const cleanA = cleanArtistTerm(artist);
    const query = `${cleanA} ${cleanT}`.trim();
    const url = `https://api.tidal.com/v1/search?query=${encodeURIComponent(query)}&limit=10&types=TRACKS&countryCode=US`;
    const res = await fetch(url, {
      headers: {
        'X-Tidal-Token': 'vNVdglQOjFJJGG2U',
        'User-Agent': CHROME_UA
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.tracks?.items || [];
    const wantT = normalizeCanvasMatch(cleanT);
    const wantA = normalizeCanvasMatch(cleanA);

    for (const track of items) {
      const gotT = normalizeCanvasMatch(track?.title || '');
      const gotArtists = (track?.artists || []).map(a => normalizeCanvasMatch(a?.name || '')).join(' ');
      if (!(gotT.includes(wantT) || wantT.includes(gotT))) continue;
      if (!(gotArtists.includes(wantA) || wantA.includes(gotArtists))) continue;
      const videoCover = track?.album?.videoCover;
      if (videoCover && typeof videoCover === 'string') {
        const parts = videoCover.split('-');
        if (parts.length === 5) {
          return {
            url: `https://resources.tidal.com/videos/${parts.join('/')}/1280x1280.mp4`,
            mimeType: 'video/mp4',
            width: 1280,
            height: 1280,
            aspect: 'square',
            source: 'Tidal Video Cover',
            qualityLabel: 'Canvas 1280p',
            isCanvas: true,
            title: track.title || title
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Canvas] TidalCanvas notice:', err.message);
  }
  return null;
}

async function fetchCommunityCanvas(title, artist) {
  if (!title || !artist) return null;
  try {
    const now = Date.now();
    if (!cachedCommunityCanvas || now - communityCanvasFetchedAt > 1800000) {
      const res = await fetch('https://vivimusicanvas.mkmdevilmi.workers.dev/canvas.json', {
        headers: { 'User-Agent': CHROME_UA }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.items)) {
          cachedCommunityCanvas = data.items;
          communityCanvasFetchedAt = now;
        }
      }
    }
    if (!Array.isArray(cachedCommunityCanvas)) return null;
    const wantT = normalizeCanvasMatch(title);
    const wantA = normalizeCanvasMatch(artist);
    const hit = cachedCommunityCanvas.find(entry => {
      const s = normalizeCanvasMatch(entry.song || '');
      const a = normalizeCanvasMatch(entry.artist || '');
      return s && a && (s.includes(wantT) || wantT.includes(s)) && (a.includes(wantA) || wantA.includes(a));
    });
    if (hit && hit.url) {
      return {
        url: hit.url,
        mimeType: 'video/mp4',
        width: 720,
        height: 1280,
        aspect: 'portrait',
        source: 'Spotify Canvas',
        qualityLabel: 'Spotify Canvas',
        isCanvas: true,
        title: hit.song || title
      };
    }
  } catch (err) {
    console.warn('[Canvas] CommunityCanvas notice:', err.message);
  }
  return null;
}

/**
 * Resolves a playable Canvas / Motion Artwork or direct MP4 Music Video stream
 * (BitChord CanvasRepository + Direct IOS MP4 with VisitorData, ZERO YouTube iframe).
 */
async function getVideoStream(videoId, ses, queryInfo = {}) {
  const title = queryInfo.title || '';
  const artist = queryInfo.artist || '';
  const album = queryInfo.album || '';
  const cacheKey = `apple-motion|${videoId || ''}|${title}|${artist}`;

  if (canvasResultCache.has(cacheKey)) {
    return canvasResultCache.get(cacheKey);
  }

  // Exclusively resolve official Apple Music Motion animated artwork (1080x1080 H.264 square loop)
  if (title && artist) {
    const appleHit = await fetchAppleMusicCanvas(title, artist, album).catch(() => null);
    if (appleHit) {
      canvasResultCache.set(cacheKey, appleHit);
      return appleHit;
    }
  }

  return null;
}

function extractBestVideoFormat(data, videoId) {
  if (!data || !data.streamingData) return null;
  const muxed = (data.streamingData.formats || []).filter(f => f.url && f.mimeType && f.mimeType.startsWith('video/'));
  const adaptive = (data.streamingData.adaptiveFormats || []).filter(f => f.url && f.mimeType && (f.mimeType.startsWith('video/mp4') || f.mimeType.startsWith('video/webm')));
  const candidates = adaptive.length > 0 ? adaptive : muxed;
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const aMp4 = (a.mimeType && a.mimeType.includes('mp4') && a.mimeType.includes('avc1')) ? 1 : 0;
    const bMp4 = (b.mimeType && b.mimeType.includes('mp4') && b.mimeType.includes('avc1')) ? 1 : 0;
    if (aMp4 !== bMp4) return bMp4 - aMp4;
    const aH = a.height || 0;
    const bH = b.height || 0;
    const aScore = aH <= 1080 ? aH : 500;
    const bScore = bH <= 1080 ? bH : 500;
    if (bScore !== aScore) return bScore - aScore;
    return (b.bitrate || 0) - (a.bitrate || 0);
  });

  const chosen = candidates[0];
  return {
    videoId: videoId || data.videoDetails?.videoId || '',
    url: chosen.url,
    mimeType: chosen.mimeType,
    width: chosen.width || 1280,
    height: chosen.height || 720,
    aspect: (chosen.width && chosen.height && chosen.width <= chosen.height) ? 'square' : 'wide',
    source: 'YouTube Music Video',
    qualityLabel: chosen.qualityLabel || '1080p HD',
    isMuxed: muxed.includes(chosen),
    isCanvas: false,
    title: data.videoDetails?.title || ''
  };
}

module.exports = {
  getAuthContext,
  getAccountInfo,
  getHomeFeed,
  getExploreFeed,
  getChartsFeed,
  getNewReleasesFeed,
  getLibrarySongs,
  getLibraryPlaylists,
  getLibraryAlbums,
  getLibraryArtists,
  getUserLibrary,
  getPlaylist,
  getNextQueue,
  getAudioStream,
  extractBestAudioFormat,
  getVideoStream,
  extractBestVideoFormat,
  getLyrics,
  fetchLrcLibLyrics,
  fetchSimpMusicLyrics,
  fetchBetterLyrics,
  fetchLyricsPlus,
  fetchYouTubeMusicLyrics,
  fetchYouTubeTranscriptLyrics,
  parseTranscriptData,
  parseLrcString,
  parseTtmlLyrics,
  parseTtmlTimestamp,
  decodeHtmlEntities,
  cleanSearchTerm,
  cleanArtistTerm,
  getPrimaryArtist,
  search,
  rate,
  sapisidHash,
  parseLibraryPlaylistsResponse,
  parseSectionList,
  adoptSessionScope,
  getSessionScope,
  selectChannel,
  fetchSessionScope,
  ensureSessionScope,
  fetchVisitorData,
  ensureVisitorData,
  extractContinuationToken,
  getBrowseContinuation,
  extractIdentityTokensFromAccountMenu,
  normalizeDataSyncId,
  parseBrowsePlaylistItem,
  SEARCH_FILTERS,
  getSearchSuggestions,
  parseSearchSuggestions,
  getArtist,
  parseArtistPage,
  getHistory,
  parseHistoryResponse,
  getMoodsAndGenres,
  parseMoodsAndGenresResponse,
  trackPlayback,
  parseAccountChannels,
  parsePlaylistResponse,
  sanitizeFetchHeaders,
  parseSearchResults,
  getAccountSwitcher
};
