const crypto = require('crypto');

const MUSIC_BASE = 'https://music.youtube.com/youtubei/v1';
const MUSIC_ORIGIN = 'https://music.youtube.com';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const WEB_REMIX_CLIENT_VERSION = '1.20250101.01.00';
const WEB_REMIX_CLIENT_ID = '67';

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
 * Retrieves cookies and builds auth headers from the Electron session partition.
 */
async function getAuthContext(ses) {
  if (!ses) return { headers: getDefaultHeaders(), isLoggedIn: false, cookieStr: '' };
  try {
    const cookies = await ses.cookies.get({ url: MUSIC_ORIGIN });
    const cookieMap = {};
    cookies.forEach(c => {
      cookieMap[c.name] = c.value;
    });

    const cookieStr = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
    const sapisid = cookieMap['SAPISID'] || cookieMap['__Secure-3PAPISID'] || cookieMap['__Secure-1PAPISID'];
    const isLoggedIn = !!(sapisid || cookieMap['SID'] || cookieMap['LOGIN_INFO']);

    const headers = getDefaultHeaders();
    if (cookieStr) {
      headers['Cookie'] = cookieStr;
      if (sapisid) {
        headers['Authorization'] = sapisidHash(sapisid);
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
 * Makes an authenticated request to YouTube Music InnerTube endpoint.
 */
async function postMusic(endpoint, body, ses) {
  const { headers } = await getAuthContext(ses);
  const payload = {
    context: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion: WEB_REMIX_CLIENT_VERSION,
        hl: 'en',
        gl: 'US'
      },
      user: {
        lockedSafetyMode: false
      },
      request: {
        useSsl: true
      }
    },
    ...body
  };

  const response = await fetch(`${MUSIC_BASE}/${endpoint}?prettyPrint=false`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`InnerTube HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Retrieves the user's account info from YouTube Music when logged in.
 */
async function getAccountInfo(ses) {
  try {
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
      if (node.activeAccountHeaderRenderer) {
        const h = node.activeAccountHeaderRenderer;
        name = h.accountName?.runs?.[0]?.text || name;
        handle = h.channelHandle?.runs?.[0]?.text || h.email?.runs?.[0]?.text || handle;
        const thumbs = h.accountPhoto?.thumbnails || [];
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
      handle,
      avatarUrl
    };
  } catch (err) {
    console.warn('[InnerTube] getAccountInfo error:', err.message);
    return { isLoggedIn: false };
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
 * Browses a specific playlist or album by browseId (e.g. VL..., MPREb..., etc.).
 */
async function getPlaylist(browseId, ses) {
  try {
    const data = await postMusic('browse', { browseId }, ses);
    return parsePlaylistResponse(data, browseId);
  } catch (err) {
    console.warn('[InnerTube] getPlaylist error:', err.message);
    return null;
  }
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
    return parseWatchQueue(data);
  } catch (err) {
    console.warn('[InnerTube] getNextQueue error:', err.message);
    return [];
  }
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
      title = h.title?.runs?.[0]?.text || title;
      subtitle = h.subtitle?.runs?.map(x => x.text).join('') || subtitle;
      const thumbs = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
      return;
    }
    if (node.musicEditablePlaylistDetailHeaderRenderer) {
      const h = node.musicEditablePlaylistDetailHeaderRenderer.header?.musicResponsiveHeaderRenderer;
      if (h) {
        title = h.title?.runs?.[0]?.text || title;
        subtitle = h.subtitle?.runs?.map(x => x.text).join('') || subtitle;
        const thumbs = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
        if (thumbs.length > 0) cover = thumbs[thumbs.length - 1].url;
        return;
      }
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
      if (song && song.videoId) {
        if (!song.cover && cover) song.cover = cover;
        songs.push(song);
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

function parseResponsiveItem(r) {
  const flexCols = r.flexColumns || [];
  const titleRun = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0];
  const title = titleRun?.text;
  if (!title) return null;

  const artistRun = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0];
  const artist = artistRun?.text || 'YouTube Music';

  const albumRun = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[2];
  const album = albumRun?.text || 'YouTube Music';

  const fixedCols = r.fixedColumns || [];
  const durationText = fixedCols[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text ||
                       flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.slice(-1)[0]?.text;
  const duration = parseDurationString(durationText) || 210;

  const videoId = r.playlistItemData?.videoId ||
                  r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId ||
                  r.navigationEndpoint?.watchEndpoint?.videoId ||
                  titleRun?.navigationEndpoint?.watchEndpoint?.videoId;

  const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  return {
    id: videoId ? `yt-${videoId}` : `item-${Math.random().toString(36).slice(2, 9)}`,
    type: 'song',
    videoId,
    title,
    artist,
    album,
    duration,
    durationStr: durationText || '3:30',
    cover
  };
}

function parseTwoRowItem(r) {
  const title = r.title?.runs?.[0]?.text;
  if (!title) return null;

  const subtitle = r.subtitle?.runs?.map(x => x.text).join('') || '';
  const endpoint = r.navigationEndpoint || {};
  const browseId = endpoint.browseEndpoint?.browseId;
  const videoId = endpoint.watchEndpoint?.videoId;

  const thumbs = r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  return {
    id: browseId ? `browse-${browseId}` : (videoId ? `yt-${videoId}` : `card-${Math.random().toString(36).slice(2, 9)}`),
    type: browseId ? 'browse' : 'song',
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

module.exports = {
  getAuthContext,
  getAccountInfo,
  getHomeFeed,
  getExploreFeed,
  getPlaylist,
  getNextQueue,
  search,
  rate,
  sapisidHash
};
