const crypto = require('crypto');
const { normalizeDataSyncId } = require('./cookie-utils');

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

    if (!loggedIn) {
      return {
        pageId: null,
        dataSyncId: null,
        authUser: '0',
        visitorData: null,
        clientVersion: clientVersion || WEB_REMIX_CLIENT_VERSION,
        loggedIn: false
      };
    }

    const pageIdMatch = html.match(CONFIG_PAGE_ID);
    const pageId = (pageIdMatch && pageIdMatch[1].trim()) ? pageIdMatch[1].trim() : null;

    const dataSyncMatch = html.match(CONFIG_DATASYNC_ID);
    const rawDataSyncId = (dataSyncMatch && dataSyncMatch[1].trim()) ? dataSyncMatch[1].trim() : null;
    const dataSyncId = pageId || normalizeDataSyncId(rawDataSyncId);

    const authUserMatch = html.match(CONFIG_SESSION_INDEX);
    const authUser = (authUserMatch && authUserMatch[1]) ? authUserMatch[1] : '0';

    const visitorMatch = html.match(CONFIG_VISITOR_DATA);
    const visitorData = (visitorMatch && visitorMatch[1].trim()) ? visitorMatch[1].trim() : null;

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
      headers['x-goog-authuser'] = authUser;
      headers['X-Origin'] = MUSIC_ORIGIN;
      headers['x-origin'] = MUSIC_ORIGIN;
      headers['Origin'] = MUSIC_ORIGIN;
      headers['Referer'] = `${MUSIC_ORIGIN}/`;
      if (currentSessionScope.pageId) {
        headers['X-Goog-PageId'] = currentSessionScope.pageId;
        headers['x-goog-pageid'] = currentSessionScope.pageId;
      }
      if (currentSessionScope.visitorData) {
        headers['X-Goog-Visitor-Id'] = currentSessionScope.visitorData;
        headers['x-goog-visitor-id'] = currentSessionScope.visitorData;
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
    'x-origin': MUSIC_ORIGIN,
    'Origin': MUSIC_ORIGIN,
    'Referer': `${MUSIC_ORIGIN}/`,
    'X-YouTube-Client-Name': WEB_REMIX_CLIENT_ID,
    'X-YouTube-Client-Version': WEB_REMIX_CLIENT_VERSION
  };
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
        ...(includeDataSync && currentSessionScope.dataSyncId ? { onBehalfOfUser: currentSessionScope.dataSyncId } : {})
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

  let response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(buildPayload(true))
  });

  // If rejected with 400/401/403 and onBehalfOfUser or pageId was sent, retry once without onBehalfOfUser and X-Goog-PageId
  // (BitChord fallback for session scope mismatch where Google rejects outdated/guessed dataSyncId or brand pageId)
  if (!response.ok && (response.status === 400 || response.status === 401 || response.status === 403) && (currentSessionScope.dataSyncId || currentSessionScope.pageId)) {
    console.warn(`[InnerTube] HTTP ${response.status} on ${endpoint}; retrying without onBehalfOfUser and X-Goog-PageId`);
    const fallbackHeaders = { ...headers };
    delete fallbackHeaders['X-Goog-PageId'];
    delete fallbackHeaders['x-goog-pageid'];
    response = await fetch(url, {
      method: 'POST',
      headers: fallbackHeaders,
      body: JSON.stringify(buildPayload(false))
    });
  }

  if (!response.ok) {
    throw new Error(`InnerTube HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
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
 * Retrieves the user's account info from YouTube Music when logged in.
 */
async function getAccountInfo(ses) {
  try {
    if (ses && (!currentSessionScope.loggedIn || !currentSessionScope.dataSyncId)) {
      await ensureSessionScope(ses).catch(() => {});
    }
    const { isLoggedIn } = await getAuthContext(ses);
    if (!isLoggedIn) {
      return { isLoggedIn: false };
    }

    const data = await postMusic('account/account_menu', {}, ses);
    let name = 'Google User';
    let handle = '';
    let avatarUrl = '';

    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      const h = node.activeAccountHeaderRenderer || node.accountHeaderRenderer || node.accountItemRenderer;
      if (h) {
        name = h.accountName?.runs?.[0]?.text ||
               h.channelTitle?.runs?.[0]?.text ||
               h.channelName?.runs?.[0]?.text ||
               h.title?.runs?.[0]?.text ||
               h.accountName?.simpleText ||
               h.channelTitle?.simpleText ||
               h.title?.simpleText ||
               name;
        handle = h.channelHandle?.runs?.[0]?.text ||
                 h.email?.runs?.[0]?.text ||
                 h.byline?.runs?.[0]?.text ||
                 h.channelHandle?.simpleText ||
                 h.email?.simpleText ||
                 handle;
        const thumbs = h.accountPhoto?.thumbnails || h.avatar?.thumbnails || h.thumbnail?.thumbnails || h.thumbnails || [];
        if (thumbs.length > 0) {
          avatarUrl = thumbs[thumbs.length - 1].url;
        }
      }
      Object.values(node).forEach(walk);
    }
    walk(data);

    return {
      isLoggedIn: true,
      name,
      channelTitle: name,
      handle,
      avatarUrl,
      photoUrl: avatarUrl,
      pageId: currentSessionScope.pageId,
      dataSyncId: currentSessionScope.dataSyncId,
      authUser: currentSessionScope.authUser
    };
  } catch (err) {
    console.warn('[InnerTube] getAccountInfo error:', err.message);
    const auth = await getAuthContext(ses).catch(() => ({ isLoggedIn: false }));
    if (auth && auth.isLoggedIn) {
      return {
        isLoggedIn: true,
        name: 'Google User',
        channelTitle: 'Google User',
        handle: '@user',
        avatarUrl: '',
        photoUrl: '',
        pageId: currentSessionScope.pageId,
        dataSyncId: currentSessionScope.dataSyncId,
        authUser: currentSessionScope.authUser
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
      authUser: '0'
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

      let normalizedBrowseId = bId;
      if (!bId.startsWith('VL') && !bId.startsWith('FE') && !bId.startsWith('MPRE') && !bId.startsWith('UC')) {
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
 */
async function getLibraryAlbums(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_liked_albums' }, ses);
    return parseLibraryPlaylistsResponse(data);
  } catch (err) {
    console.warn('[InnerTube] getLibraryAlbums notice:', err.message);
    return [];
  }
}

/**
 * Fetches user's subscribed artists from library.
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
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_library_corpus_track_artists' }, ses);
    addItems(parseLibraryPlaylistsResponse(data));
  } catch {}
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_library_corpus_artists' }, ses);
    addItems(parseLibraryPlaylistsResponse(data));
  } catch {}
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
 * Live search against YouTube Music InnerTube.
 */
async function search(query, ses) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];
  try {
    const data = await postMusic('search', { query: query.trim() }, ses);
    return parseSearchResults(data);
  } catch (err) {
    console.warn('[InnerTube] search error:', err.message);
    return [];
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
  let cover = '';
  const songs = [];

  // Parse header
  function findHeader(node) {
    if (!node || typeof node !== 'object') return;
    if (node.musicResponsiveHeaderRenderer) {
      const h = node.musicResponsiveHeaderRenderer;
      title = h.title?.runs?.map(x => x.text).join('') || h.title?.simpleText || h.title?.runs?.[0]?.text || title;
      subtitle = h.subtitle?.runs?.map(x => x.text).join('') || h.subtitle?.simpleText || subtitle;
      const thumbs = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || h.thumbnail?.thumbnails || [];
      if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
      return;
    }
    if (node.musicEditablePlaylistDetailHeaderRenderer) {
      const h = node.musicEditablePlaylistDetailHeaderRenderer.header?.musicResponsiveHeaderRenderer || node.musicEditablePlaylistDetailHeaderRenderer;
      if (h) {
        title = h.title?.runs?.map(x => x.text).join('') || h.title?.simpleText || h.title?.runs?.[0]?.text || title;
        subtitle = h.subtitle?.runs?.map(x => x.text).join('') || h.subtitle?.simpleText || subtitle;
        const thumbs = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || h.thumbnail?.thumbnails || [];
        if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
        return;
      }
    }
    if (node.musicHeaderRenderer) {
      const h = node.musicHeaderRenderer;
      title = h.title?.runs?.map(x => x.text).join('') || h.title?.simpleText || title;
      subtitle = h.subtitle?.runs?.map(x => x.text).join('') || subtitle;
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

  return {
    browseId,
    title,
    subtitle,
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

function parseSearchResults(data) {
  const sections = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const results = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.musicResponsiveListItemRenderer) {
      const song = parseResponsiveItem(node.musicResponsiveListItemRenderer);
      if (song && !results.some(r => r.videoId && r.videoId === song.videoId)) {
        results.push(song);
      }
    } else if (node.musicTwoRowItemRenderer) {
      const card = parseTwoRowItem(node.musicTwoRowItemRenderer);
      if (card && !results.some(r => r.id === card.id)) {
        results.push(card);
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(sections);
  return results;
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
    // Filter out "New playlist" action tile and Liked Songs playlist (handled separately)
    const lowTitle = (item.title || '').toLowerCase();
    const lowBId = bId.toLowerCase();
    if (lowBId.includes('create') || lowBId === 'feplaylist_add' || lowTitle === 'new playlist' || lowTitle === '+ new playlist') return;
    if (bId === 'VLLM' || bId === 'LM' || bId === 'FEmusic_liked_videos' || lowBId === 'vllm' || lowBId === 'lm') return;

    let normalizedBrowseId = bId;
    if (!bId.startsWith('VL') && !bId.startsWith('FE') && !bId.startsWith('MPRE') && !bId.startsWith('UC')) {
      normalizedBrowseId = `VL${bId}`;
    }
    const key = normalizedBrowseId.replace(/^VL/, '');
    if (!seen.has(key) && !seen.has(normalizedBrowseId)) {
      seen.add(key);
      seen.add(normalizedBrowseId);
      playlists.push({
        ...item,
        id: item.id || `browse-${normalizedBrowseId}`,
        browseId: normalizedBrowseId,
        playlistId: normalizedBrowseId.replace(/^VL/, '')
      });
    }
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.musicTwoRowItemRenderer) {
      const card = parseTwoRowItem(node.musicTwoRowItemRenderer);
      if (card) addItem(card);
    } else if (node.musicResponsiveListItemRenderer) {
      const item = parseResponsiveItem(node.musicResponsiveListItemRenderer);
      if (item) addItem(item);
    } else if (node.gridPlaylistRenderer) {
      const g = node.gridPlaylistRenderer;
      const title = (Array.isArray(g.title?.runs) ? g.title.runs.map(x => x.text).join('') : g.title?.simpleText) || '';
      const bId = g.navigationEndpoint?.browseEndpoint?.browseId || (g.playlistId ? `VL${g.playlistId}` : null);
      const thumbs = g.thumbnail?.thumbnails || [];
      if (title && bId) {
        addItem({
          id: `browse-${bId}`,
          type: 'browse',
          title,
          subtitle: (Array.isArray(g.shortBylineText?.runs) ? g.shortBylineText.runs.map(x => x.text).join('') : g.shortBylineText?.simpleText) || 'Playlist',
          browseId: bId,
          cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
        });
      }
    } else if (node.playlistRenderer) {
      const p = node.playlistRenderer;
      const title = (Array.isArray(p.title?.runs) ? p.title.runs.map(x => x.text).join('') : p.title?.simpleText) || '';
      const bId = p.navigationEndpoint?.browseEndpoint?.browseId || (p.playlistId ? `VL${p.playlistId}` : null);
      const thumbs = p.thumbnails?.[0]?.thumbnails || [];
      if (title && bId) {
        addItem({
          id: `browse-${bId}`,
          type: 'browse',
          title,
          subtitle: 'Playlist',
          browseId: bId,
          cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
        });
      }
    } else if (node.compactPlaylistRenderer) {
      const cp = node.compactPlaylistRenderer;
      const title = (Array.isArray(cp.title?.runs) ? cp.title.runs.map(x => x.text).join('') : cp.title?.simpleText) || '';
      const bId = cp.navigationEndpoint?.browseEndpoint?.browseId || (cp.playlistId ? `VL${cp.playlistId}` : null);
      const thumbs = cp.thumbnails?.[0]?.thumbnails || cp.thumbnail?.thumbnails || [];
      if (title && bId) {
        addItem({
          id: `browse-${bId}`,
          type: 'browse',
          title,
          subtitle: (Array.isArray(cp.shortBylineText?.runs) ? cp.shortBylineText.runs.map(x => x.text).join('') : cp.shortBylineText?.simpleText) || 'Playlist',
          browseId: bId,
          cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
        });
      }
    } else if (node.lockupViewModel) {
      const vm = node.lockupViewModel;
      const title = vm.metadata?.title?.content || (Array.isArray(vm.metadata?.title?.runs) ? vm.metadata.title.runs.map(x => x.text).join('') : '');
      const subtitle = vm.metadata?.subtitle?.content || (Array.isArray(vm.metadata?.subtitle?.runs) ? vm.metadata.subtitle.runs.map(x => x.text).join('') : 'Playlist');
      const bId = vm.rendererContext?.commandContext?.onTap?.innertubeCommand?.browseEndpoint?.browseId ||
                  (vm.contentId ? (vm.contentId.startsWith('VL') ? vm.contentId : `VL${vm.contentId}`) : null);
      const thumbs = vm.image?.sources || [];
      if (title && bId) {
        addItem({
          id: `browse-${bId}`,
          type: 'browse',
          title,
          subtitle,
          browseId: bId,
          cover: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
        });
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);
  return playlists;
}

function parseResponsiveItem(r) {
  const flexCols = r.flexColumns || [];
  const titleCol = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const title = (Array.isArray(titleCol?.runs) ? titleCol.runs.map(x => x.text).join('') : (titleCol?.simpleText || titleCol?.runs?.[0]?.text)) || '';
  if (!title) return null;

  const col1 = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const artist = (Array.isArray(col1?.runs) ? col1.runs[0]?.text : col1?.simpleText) || 'YouTube Music';
  const album = (Array.isArray(col1?.runs) && col1.runs.length > 2 ? col1.runs[2]?.text : null) || 'YouTube Music';

  const fixedCols = r.fixedColumns || [];
  const durationText = fixedCols[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text ||
                       (Array.isArray(col1?.runs) ? col1.runs.slice(-1)[0]?.text : null);
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
    artist,
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

  return {
    id: browseId ? `browse-${browseId}` : (videoId ? `yt-${videoId}` : `card-${Math.random().toString(36).slice(2, 9)}`),
    type: browseId ? (browseId.startsWith('UC') ? 'artist' : 'browse') : 'song',
    title,
    subtitle,
    artist: subtitle.split('•')[0]?.trim() || 'YouTube Music',
    album: title,
    browseId,
    videoId,
    duration: 210,
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
    // Strip trailing unclosed or closed feature/collaboration tags (e.g. '(feat. Din...', '(feat. Dina Rae)', 'ft. Daft Punk', 'featuring ...', 'with ...')
    .replace(/\s*[\(\[](?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .replace(/\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    // Strip parenthetical/bracketed official video/audio/remaster/live tags
    .replace(/\s*[\(\[](?:official\s+)?(?:music\s+|lyric\s+|lyrics\s+)?(?:video|audio|visualizer|track|remaster(?:ed)?(?:\s+\d{4})?|live(?:\s+at\s+[^)\]]+)?)[\]\)]/gi, '')
    .replace(/\s*\(?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^)]+)?)\)?/gi, '')
    .replace(/\s*\[?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^\]]+)?)\]?/gi, '')
    // Strip trailing separators and descriptors
    .replace(/\s*(?:\||\/\/|-)\s*(?:official\s+video|official\s+audio|audio|lyric\s+video|lyrics).*$/gi, '')
    .trim();
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  return s
    // Clean leading/trailing quotes
    .replace(/^["'“‘]+|["'”’]+$/g, '')
    // Clean any trailing ellipsis or periods
    .replace(/[\.…\s]+$/, '')
    .trim();
}

/**
 * Cleans artist name for lyrics matching
 */
function cleanArtistTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    .replace(/\s*[\(\[](?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .replace(/\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .trim();
  // Strip metadata like bullet view counts or album info (e.g. "Eminem • The Eminem Show")
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  return s.replace(/^["'“‘]+|["'”’]+$/g, '').replace(/[\.…\s]+$/, '').trim();
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
 * Parses millisecond LRC formatted lyrics into [{ time: seconds, text: string }]
 * Supports [mm:ss.xx] and [mm:ss.xxx], matching BitChord's LrcLib.kt.
 */
function parseLrcString(lrcContent) {
  if (!lrcContent || typeof lrcContent !== 'string') return [];
  const lines = lrcContent.split(/\r?\n/);
  const stampRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const result = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    if (/^\[[A-Za-z]+:.*\]$/.test(trimmed)) continue;

    stampRegex.lastIndex = 0;
    const matches = [...trimmed.matchAll(stampRegex)];
    if (matches.length === 0) continue;

    const text = trimmed.replace(stampRegex, '').trim();
    const displayText = text.length > 0 ? text : '♪';

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
      const timeInSeconds = Math.round((minutes * 60 + seconds + fractionMs / 1000) * 100) / 100;
      result.push({ time: timeInSeconds, text: displayText });
    }
  }

  result.sort((a, b) => a.time - b.time);

  if (result.length > 0 && result[0].time > 5) {
    result.unshift({ time: 0, text: '♪' });
  }

  return result;
}

/**
 * Fetches millisecond synchronized lyrics from LRCLIB API
 * (BitChord LrcLib.kt provider architecture)
 */
async function fetchLrcLibLyrics(title, artist, durationSeconds) {
  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistTerm(artist);
  const primaryArtist = getPrimaryArtist(cleanArtist);
  if (!cleanTitle) return null;

  // Build title candidates (including stripped artist prefixes like "Eminem - Superman")
  const titleCandidates = [cleanTitle];
  if (cleanArtist) {
    const escaped = cleanArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  }

  const durationParam = (durationSeconds && typeof durationSeconds === 'number' && durationSeconds > 0)
    ? Math.round(durationSeconds)
    : null;

  const artistCandidates = [cleanArtist, primaryArtist].filter(Boolean);
  const uniqueArtists = [...new Set(artistCandidates)];

  const tryParseLrcResponse = async (res) => {
    if (!res || !res.ok) return null;
    try {
      const data = await res.json();
      if (data && data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
        const parsed = parseLrcString(data.syncedLyrics);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  };

  // 1. Exact match attempt via /get endpoint with title candidates
  for (const tCand of titleCandidates) {
    for (const art of (uniqueArtists.length > 0 ? uniqueArtists : [''])) {
      try {
        let getUrl = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(tCand)}`;
        if (art) getUrl += `&artist_name=${encodeURIComponent(art)}`;
        if (durationParam) getUrl += `&duration=${durationParam}`;

        const res = await fetch(getUrl, {
          headers: { 'User-Agent': LRCLIB_USER_AGENT }
        });
        const parsed = await tryParseLrcResponse(res);
        if (parsed) return parsed;
      } catch (err) {
        console.warn('[LRCLIB] /get failed:', err.message);
      }

      // Try without duration parameter if duration was provided, to avoid 404 on minor duration drift
      if (durationParam) {
        try {
          let getUrlNoDur = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(tCand)}`;
          if (art) getUrlNoDur += `&artist_name=${encodeURIComponent(art)}`;

          const res = await fetch(getUrlNoDur, {
            headers: { 'User-Agent': LRCLIB_USER_AGENT }
          });
          const parsed = await tryParseLrcResponse(res);
          if (parsed) return parsed;
        } catch (err) {
          console.warn('[LRCLIB] /get without duration failed:', err.message);
        }
      }
    }
  }

  // 2. Fuzzy search fallback via /search endpoint (supporting both ?q=... and ?track_name=...)
  const searchQueries = [];
  for (const tCand of titleCandidates) {
    for (const art of uniqueArtists) {
      searchQueries.push(`${LRCLIB_BASE}/search?q=${encodeURIComponent(tCand + ' ' + art)}`);
      searchQueries.push(`${LRCLIB_BASE}/search?track_name=${encodeURIComponent(tCand)}&artist_name=${encodeURIComponent(art)}`);
    }
    searchQueries.push(`${LRCLIB_BASE}/search?q=${encodeURIComponent(tCand)}`);
  }

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
              syncedItems.sort((a, b) => Math.abs((a.duration || 0) - durationParam) - Math.abs((b.duration || 0) - durationParam));
            }
            const parsed = parseLrcString(syncedItems[0].syncedLyrics);
            if (parsed.length > 0) return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('[LRCLIB] /search fallback failed:', err.message);
    }
  }

  return null;
}

/**
 * Fetches lyrics exposed in YouTube Music's Lyrics tab via InnerTube
 * (BitChord YouTubeLyrics.kt provider architecture)
 */
async function fetchYouTubeMusicLyrics(videoId, ses) {
  if (!videoId || typeof videoId !== 'string') return null;

  try {
    const nextData = await postMusic('next', { videoId, isAudioOnly: true }, ses);
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
    walk(nextData);

    if (!browseId) return null;

    const browsePayload = { browseId };
    if (browseParams) browsePayload.params = browseParams;
    const browseData = await postMusic('browse', browsePayload, ses);

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
    walkBrowse(browseData);

    if (!rawText || !rawText.trim()) return null;

    const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) return null;

    const step = 4;
    return rawLines.map((text, i) => ({
      time: i * step,
      text
    }));
  } catch (err) {
    console.warn('[InnerTube] fetchYouTubeMusicLyrics failed:', err.message);
    return null;
  }
}

/**
 * Unified Synced Lyrics Provider
 * Prioritizes LRCLIB millisecond synced lyrics, falls back to YouTube Music InnerTube lyrics.
 */
async function getLyrics({ videoId, title, artist, duration }, ses) {
  // 1. Try LRCLIB for millisecond synced lyrics
  if (title) {
    const lrcLibLyrics = await fetchLrcLibLyrics(title, artist || '', duration);
    if (lrcLibLyrics && lrcLibLyrics.length > 0) {
      return lrcLibLyrics;
    }
  }

  // 2. Fall back to YouTube Music InnerTube browse lyrics
  if (videoId) {
    const ytmLyrics = await fetchYouTubeMusicLyrics(videoId, ses);
    if (ytmLyrics && ytmLyrics.length > 0) {
      return ytmLyrics;
    }
  }

  return null;
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
  getLyrics,
  fetchLrcLibLyrics,
  fetchYouTubeMusicLyrics,
  parseLrcString,
  cleanSearchTerm,
  cleanArtistTerm,
  getPrimaryArtist,
  search,
  rate,
  sapisidHash,
  parseLibraryPlaylistsResponse,
  adoptSessionScope,
  getSessionScope,
  selectChannel,
  fetchSessionScope,
  ensureSessionScope,
  fetchVisitorData,
  ensureVisitorData,
  extractContinuationToken,
  getBrowseContinuation
};
