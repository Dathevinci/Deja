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
    const cookies = await ses.cookies.get({ url: MUSIC_ORIGIN }).catch(() => []);
    const ytCookies = await ses.cookies.get({ domain: '.youtube.com' }).catch(() => []);
    const ytDomainCookies = await ses.cookies.get({ domain: 'youtube.com' }).catch(() => []);
    const googleCookies = await ses.cookies.get({ domain: '.google.com' }).catch(() => []);
    const googleDomainCookies = await ses.cookies.get({ domain: 'google.com' }).catch(() => []);
    const allCookies = [...cookies, ...ytCookies, ...ytDomainCookies, ...googleCookies, ...googleDomainCookies];
    const cookieMap = {};
    allCookies.forEach(c => {
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
      photoUrl: avatarUrl
    };
  } catch (err) {
    console.warn('[InnerTube] getAccountInfo error:', err.message);
    const auth = await getAuthContext(ses).catch(() => ({ isLoggedIn: false }));
    return {
      isLoggedIn: auth.isLoggedIn,
      name: 'Google User',
      channelTitle: 'Google User',
      handle: '',
      avatarUrl: '',
      photoUrl: ''
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
 * Fetches user's Liked Songs library playlist (FEmusic_liked_videos).
 */
async function getLibrarySongs(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_liked_videos' }, ses);
    return parsePlaylistResponse(data, 'FEmusic_liked_videos');
  } catch (err) {
    console.warn('[InnerTube] getLibrarySongs error:', err.message);
    return { songs: [] };
  }
}

/**
 * Fetches user's custom and saved playlists (FEmusic_liked_playlists).
 */
async function getLibraryPlaylists(ses) {
  try {
    const data = await postMusic('browse', { browseId: 'FEmusic_liked_playlists' }, ses);
    return parseLibraryPlaylistsResponse(data);
  } catch (err) {
    console.warn('[InnerTube] getLibraryPlaylists error:', err.message);
    return [];
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
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.musicTwoRowItemRenderer) {
      const card = parseTwoRowItem(node.musicTwoRowItemRenderer);
      if (card && card.browseId && !playlists.some(p => p.browseId === card.browseId)) {
        playlists.push(card);
      }
    } else if (node.musicResponsiveListItemRenderer) {
      const item = parseResponsiveItem(node.musicResponsiveListItemRenderer);
      if (item && item.browseId && !playlists.some(p => p.browseId === item.browseId)) {
        playlists.push(item);
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(data);
  return playlists;
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

  const browseId = r.navigationEndpoint?.browseEndpoint?.browseId ||
                   titleRun?.navigationEndpoint?.browseEndpoint?.browseId ||
                   flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId;

  const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
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
  const title = r.title?.runs?.[0]?.text;
  if (!title) return null;

  const subtitle = r.subtitle?.runs?.map(x => x.text).join('') || '';
  const endpoint = r.navigationEndpoint || {};
  let browseId = endpoint.browseEndpoint?.browseId;
  const watchPlaylist = endpoint.watchPlaylistEndpoint?.playlistId;
  if (!browseId && watchPlaylist) {
    browseId = watchPlaylist.startsWith('VL') ? watchPlaylist : `VL${watchPlaylist}`;
  }
  const videoId = endpoint.watchEndpoint?.videoId || endpoint.watchPlaylistEndpoint?.videoId;

  const thumbs = r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
                 r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
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
  return str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    .replace(/\s*[\(\[](?:official\s+)?(?:music\s+|lyric\s+|lyrics\s+)?(?:video|audio|visualizer|track|remaster(?:ed)?(?:\s+\d{4})?|live(?:\s+at\s+[^)\]]+)?)[\]\)]/gi, '')
    .replace(/\s*\(?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^)]+)?)\)?/gi, '')
    .replace(/\s*\[?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^\]]+)?)\]?/gi, '')
    .replace(/\s*(?:\||\/\/|-)\s*(?:official\s+video|official\s+audio|audio|lyric\s+video|lyrics).*$/gi, '')
    .replace(/\s*[\(\[](?:feat\.|ft\.)\s+[^)\]]+[\]\)]/gi, '')
    .replace(/\s*\(?(?:feat\.|ft\.)\s+[^)]+\)?/gi, '')
    .replace(/\s*\[?(?:feat\.|ft\.)\s+[^\]]+\]?/gi, '')
    .replace(/\s*(?:feat\.|ft\.)\s+.*$/gi, '')
    .trim();
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
  const cleanArtist = cleanSearchTerm(artist);
  if (!cleanTitle) return null;

  const durationParam = (durationSeconds && typeof durationSeconds === 'number' && durationSeconds > 0)
    ? Math.round(durationSeconds)
    : null;

  // 1. Exact match attempt
  try {
    let getUrl = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    if (durationParam) {
      getUrl += `&duration=${durationParam}`;
    }
    const res = await fetch(getUrl, {
      headers: { 'User-Agent': LRCLIB_USER_AGENT }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.syncedLyrics) {
        const parsed = parseLrcString(data.syncedLyrics);
        if (parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn('[LRCLIB] /get failed:', err.message);
  }

  // 2. Fuzzy search fallback matching closest duration
  try {
    const searchUrl = `${LRCLIB_BASE}/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
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
  getPlaylist,
  getNextQueue,
  getAudioStream,
  extractBestAudioFormat,
  getLyrics,
  fetchLrcLibLyrics,
  fetchYouTubeMusicLyrics,
  parseLrcString,
  cleanSearchTerm,
  search,
  rate,
  sapisidHash,
  parseLibraryPlaylistsResponse
};
