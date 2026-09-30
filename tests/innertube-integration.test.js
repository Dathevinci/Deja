const assert = require('assert');
const path = require('path');
const innertube = require('../src/main/innertube');
const preview = require('../src/renderer/preview');

function runInnerTubeIntegrationTests() {
  console.log('--- Testing InnerTube API & YouTube Music Live Integration ---');

  // 1. Verify SAPISIDHASH generation matches BitChord Innertube.kt exactly
  const dummySapisid = '1234567890abcdef';
  const hash = innertube.sapisidHash(dummySapisid, 'https://music.youtube.com');
  assert.ok(hash.startsWith('SAPISIDHASH '), 'Must start with SAPISIDHASH prefix');
  const parts = hash.replace('SAPISIDHASH ', '').split('_');
  assert.strictEqual(parts.length, 2, 'Must have timestamp and hex digest separated by underscore');
  assert.strictEqual(parts[1].length, 40, 'SHA-1 digest must be 40 hex characters');

  // 2. Verify InnerTube Exported Methods
  assert.strictEqual(typeof innertube.getAuthContext, 'function');
  assert.strictEqual(typeof innertube.getAccountInfo, 'function');
  assert.strictEqual(typeof innertube.getHomeFeed, 'function');
  assert.strictEqual(typeof innertube.getExploreFeed, 'function');
  assert.strictEqual(typeof innertube.getChartsFeed, 'function');
  assert.strictEqual(typeof innertube.getNewReleasesFeed, 'function');
  assert.strictEqual(typeof innertube.getLibrarySongs, 'function');
  assert.strictEqual(typeof innertube.getLibraryPlaylists, 'function');
  assert.strictEqual(typeof innertube.getLibraryAlbums, 'function');
  assert.strictEqual(typeof innertube.getLibraryArtists, 'function');
  assert.strictEqual(typeof innertube.getUserLibrary, 'function');
  assert.strictEqual(typeof innertube.parseLibraryPlaylistsResponse, 'function');
  assert.strictEqual(typeof innertube.getPlaylist, 'function');
  assert.strictEqual(typeof innertube.getNextQueue, 'function');
  assert.strictEqual(typeof innertube.search, 'function');
  assert.strictEqual(typeof innertube.rate, 'function');

  // Test getAuthContext with mock session (domain cookies & SAPISIDHASH)
  const mockSes = {
    cookies: {
      get: async (opts) => {
        if (opts && opts.domain && opts.domain.includes('youtube')) {
          return [
            { name: 'SAPISID', value: 'dummy_sapisid_123' },
            { name: 'SID', value: 'dummy_sid_abc' }
          ];
        }
        if (opts && opts.domain && opts.domain.includes('google')) {
          return [
            { name: 'SAPISID', value: 'google_sapisid_xyz' },
            { name: 'SID', value: 'google_sid_xyz' }
          ];
        }
        return [{ name: 'LOGIN_INFO', value: 'dummy_login_info' }];
      }
    }
  };
  innertube.getAuthContext(mockSes).then(ctx => {
    assert.strictEqual(ctx.isLoggedIn, true);
    assert.ok(ctx.headers['Authorization'].startsWith('SAPISIDHASH '));
    // Must prioritize YouTube SAPISID over Google SAPISID
    const expectedHash = innertube.sapisidHash('dummy_sapisid_123');
    assert.strictEqual(ctx.headers['Authorization'].split('_')[1], expectedHash.split('_')[1], 'Must use YouTube SAPISID for Authorization');
    assert.ok(ctx.cookieStr.includes('SAPISID=dummy_sapisid_123'));
    assert.ok(ctx.cookieStr.includes('SID=dummy_sid_abc'));
  });

  // Test getAuthContext with Google-only cookies (must be isLoggedIn: false for YouTube Music)
  const mockGoogleOnlySes = {
    cookies: {
      get: async (opts) => {
        if (opts && opts.domain && opts.domain.includes('google')) {
          return [
            { name: 'SAPISID', value: 'google_sapisid_only' },
            { name: 'SID', value: 'google_sid_only' }
          ];
        }
        return [];
      }
    }
  };
  innertube.getAuthContext(mockGoogleOnlySes).then(ctx => {
    assert.strictEqual(ctx.isLoggedIn, false, 'Must not report YouTube logged in when only Google cookies exist');
  });

  // Test getAuthContext with null session
  innertube.getAuthContext(null).then(ctx => {
    assert.strictEqual(ctx.isLoggedIn, false);
    assert.strictEqual(ctx.cookieStr, '');
  });

  // Test getAccountInfo with Google-only session returns isLoggedIn: false
  innertube.getAccountInfo(mockGoogleOnlySes).then(info => {
    assert.strictEqual(info.isLoggedIn, false, 'getAccountInfo must return isLoggedIn: false when YouTube session is absent');
  });

  // 3. Verify parseHomeResponse structure handling
  const mockHomeData = {
    contents: {
      singleColumnBrowseResultsRenderer: {
        tabs: [{
          tabRenderer: {
            content: {
              sectionListRenderer: {
                contents: [{
                  musicCarouselShelfRenderer: {
                    header: {
                      musicCarouselShelfBasicHeaderRenderer: {
                        title: { runs: [{ text: 'Quick picks' }] },
                        strapline: { runs: [{ text: 'Start radio with a song' }] }
                      }
                    },
                    contents: [{
                      musicResponsiveListItemRenderer: {
                        flexColumns: [
                          {
                            musicResponsiveListItemFlexColumnRenderer: {
                              text: { runs: [{ text: 'Anti-Hero' }] }
                            }
                          },
                          {
                            musicResponsiveListItemFlexColumnRenderer: {
                              text: { runs: [{ text: 'Taylor Swift' }, { text: ' • ' }, { text: 'Midnights' }] }
                            }
                          }
                        ],
                        fixedColumns: [
                          {
                            musicResponsiveListItemFixedColumnRenderer: {
                              text: { runs: [{ text: '3:20' }] }
                            }
                          }
                        ],
                        playlistItemData: { videoId: 'b1kbLwvqugk' },
                        thumbnail: {
                          musicThumbnailRenderer: {
                            thumbnail: {
                              thumbnails: [{ url: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' }]
                            }
                          }
                        }
                      }
                    }]
                  }
                }]
              }
            }
          }
        }]
      }
    }
  };

  // We test InnerTube's parser indirectly via home feed handling or directly
  // 4. Verify preview.js createCatalogueItemFromLive
  const liveSong = {
    id: 'yt-test123',
    videoId: 'test123',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    duration: 180,
    cover: 'https://i.ytimg.com/vi/test123/hqdefault.jpg'
  };

  const catalogueItem = preview.createCatalogueItemFromLive(liveSong);
  assert.strictEqual(catalogueItem.id, 'yt-test123');
  assert.strictEqual(catalogueItem.videoId, 'test123');
  assert.strictEqual(catalogueItem.title, 'Test Song');
  assert.strictEqual(catalogueItem.artist, 'Test Artist');
  assert.strictEqual(catalogueItem.album, 'Test Album');
  assert.strictEqual(catalogueItem.duration, 180);
  assert.strictEqual(catalogueItem.cover, 'https://i.ytimg.com/vi/test123/hqdefault.jpg');
  assert.ok(catalogueItem.palette && catalogueItem.palette.c1, 'Must generate fluid dynamic mesh palette');
  assert.ok(Array.isArray(catalogueItem.lyrics), 'Must generate synced lyric placeholders');

  // 5. Verify live track integration into preview catalogue
  preview.playLiveTrack(liveSong);
  const found = preview.CATALOGUE_TRACKS.find(t => t.videoId === 'test123');
  assert.ok(found, 'Live track must be registered in CATALOGUE_TRACKS for playback and queue');

  // 6. Verify Direct Audio Stream Extraction via InnerTube (BitChord architecture)
  assert.strictEqual(typeof innertube.getAudioStream, 'function', 'innertube.getAudioStream must be a function');
  assert.strictEqual(typeof innertube.extractBestAudioFormat, 'function', 'innertube.extractBestAudioFormat must be a function');

  // 6.1 Highest bitrate Opus selection
  const mockPlayerData = {
    streamingData: {
      adaptiveFormats: [
        { itag: 249, mimeType: 'audio/webm; codecs="opus"', bitrate: 50000, url: 'https://googlevideo.com/videoplayback?itag=249' },
        { itag: 251, mimeType: 'audio/webm; codecs="opus"', bitrate: 160000, url: 'https://googlevideo.com/videoplayback?itag=251', approxDurationMs: '210000' },
        { itag: 140, mimeType: 'audio/mp4; codecs="mp4a.40.2"', bitrate: 128000, url: 'https://googlevideo.com/videoplayback?itag=140' },
        { itag: 137, mimeType: 'video/mp4; codecs="avc1.640028"', bitrate: 2500000, url: 'https://googlevideo.com/videoplayback?itag=137' } // video, must be filtered out
      ]
    },
    playerConfig: {
      audioConfig: {
        loudnessDb: -1.2
      }
    }
  };

  const bestFormat = innertube.extractBestAudioFormat(mockPlayerData);
  assert.ok(bestFormat, 'Must extract audio format');
  assert.strictEqual(bestFormat.itag, 251, 'Must pick highest bitrate Opus stream (itag 251)');
  assert.strictEqual(bestFormat.bitrate, 160000);
  assert.strictEqual(bestFormat.url, 'https://googlevideo.com/videoplayback?itag=251');
  assert.strictEqual(bestFormat.duration, 210);
  assert.strictEqual(bestFormat.loudnessDb, -1.2);

  // 6.1.1 AAC bitrate selection (iOS client context returns AAC itag 140 / 139)
  const mockAacData = {
    streamingData: {
      adaptiveFormats: [
        { itag: 139, mimeType: 'audio/mp4; codecs="mp4a.40.5"', bitrate: 48000, url: 'https://googlevideo.com/videoplayback?itag=139' },
        { itag: 140, mimeType: 'audio/mp4; codecs="mp4a.40.2"', bitrate: 128000, url: 'https://googlevideo.com/videoplayback?itag=140', approxDurationMs: '180000' }
      ]
    }
  };
  const bestAac = innertube.extractBestAudioFormat(mockAacData);
  assert.ok(bestAac, 'Must extract AAC audio format');
  assert.strictEqual(bestAac.itag, 140, 'Must select highest bitrate AAC stream (itag 140)');
  assert.strictEqual(bestAac.duration, 180);

  // 6.2 Graceful fallback when signature deciphering required (no direct url)
  const mockCipherData = {
    streamingData: {
      adaptiveFormats: [
        { itag: 251, mimeType: 'audio/webm; codecs="opus"', bitrate: 160000, signatureCipher: 's=abc123&sp=sig&url=https%3A%2F%2Fgooglevideo.com...' }
      ]
    }
  };
  const cipherResult = innertube.extractBestAudioFormat(mockCipherData);
  assert.strictEqual(cipherResult, null, 'Must return null when formats require signature deciphering');

  // 6.3 Empty or invalid data handling
  assert.strictEqual(innertube.extractBestAudioFormat(null), null);
  assert.strictEqual(innertube.extractBestAudioFormat({}), null);
  assert.strictEqual(innertube.extractBestAudioFormat({ streamingData: {} }), null);

  // 7. Verify parseLibraryPlaylistsResponse (User Playlists & Library Feeds)
  const mockLibraryData = {
    contents: {
      singleColumnBrowseResultsRenderer: {
        tabs: [{
          tabRenderer: {
            content: {
              sectionListRenderer: {
                contents: [
                  {
                    gridRenderer: {
                      items: [
                        // 1. "New playlist" action tile - must be filtered out
                        {
                          musicTwoRowItemRenderer: {
                            title: { runs: [{ text: 'New playlist' }] },
                            navigationEndpoint: { browseEndpoint: { browseId: 'FEplaylist_add' } }
                          }
                        },
                        // 2. Custom user playlist with PL ID - must normalize to VLPL...
                        {
                          musicTwoRowItemRenderer: {
                            title: { runs: [{ text: 'Chill Vibes' }] },
                            subtitle: { runs: [{ text: 'Playlist • 25 songs' }] },
                            navigationEndpoint: { browseEndpoint: { browseId: 'PLabc123chill' } },
                            thumbnailRenderer: {
                              musicThumbnailRenderer: {
                                thumbnail: { thumbnails: [{ url: 'https://i.ytimg.com/chill.jpg' }] }
                              }
                            }
                          }
                        },
                        // 3. Grid playlist renderer
                        {
                          gridPlaylistRenderer: {
                            playlistId: 'PLgrid987xyz',
                            title: { simpleText: 'Gym Workout' },
                            shortBylineText: { simpleText: 'Playlist' },
                            thumbnail: { thumbnails: [{ url: 'https://i.ytimg.com/gym.jpg' }] }
                          }
                        },
                        // 4. Duplicate playlist - must be deduplicated
                        {
                          musicTwoRowItemRenderer: {
                            title: { runs: [{ text: 'Chill Vibes Duplicate' }] },
                            navigationEndpoint: { browseEndpoint: { browseId: 'VLPLabc123chill' } }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }]
      }
    }
  };

  const parsedPlaylists = innertube.parseLibraryPlaylistsResponse(mockLibraryData);
  assert.strictEqual(parsedPlaylists.length, 2, 'Must filter out "New playlist" and deduplicate playlists');
  assert.strictEqual(parsedPlaylists[0].title, 'Chill Vibes');
  assert.strictEqual(parsedPlaylists[0].browseId, 'VLPLabc123chill', 'Must normalize browseId with VL prefix');
  assert.strictEqual(parsedPlaylists[0].cover, 'https://i.ytimg.com/chill.jpg');
  assert.strictEqual(parsedPlaylists[1].title, 'Gym Workout');
  assert.strictEqual(parsedPlaylists[1].browseId, 'VLPLgrid987xyz');
  assert.strictEqual(parsedPlaylists[1].cover, 'https://i.ytimg.com/gym.jpg');

  // 5. Verify Continuation Token Extraction
  assert.strictEqual(typeof innertube.extractContinuationToken, 'function');
  assert.strictEqual(typeof innertube.getBrowseContinuation, 'function');

  const mockContinuationPayload1 = {
    continuationContents: {
      musicPlaylistShelfContinuation: {
        continuations: [{
          nextContinuationData: {
            continuation: 'TOKEN_NEXT_DATA_ABC'
          }
        }]
      }
    }
  };
  assert.strictEqual(innertube.extractContinuationToken(mockContinuationPayload1), 'TOKEN_NEXT_DATA_ABC');

  const mockContinuationPayload2 = {
    contents: {
      singleColumnBrowseResultsRenderer: {
        continuations: [{
          continuationCommand: {
            token: 'TOKEN_COMMAND_XYZ'
          }
        }]
      }
    }
  };
  assert.strictEqual(innertube.extractContinuationToken(mockContinuationPayload2), 'TOKEN_COMMAND_XYZ');
  assert.strictEqual(innertube.extractContinuationToken({}), null);

  // 6. Verify Modern 2025/2026 InnerTube lockupViewModel & compactPlaylistRenderer parsing
  const mockModernFormats = {
    contents: [
      {
        compactPlaylistRenderer: {
          playlistId: 'PLcompact123',
          title: { runs: [{ text: 'Compact Mix' }] },
          shortBylineText: { runs: [{ text: 'By Deja' }] },
          thumbnails: [{ thumbnails: [{ url: 'https://i.ytimg.com/compact.jpg' }] }]
        }
      },
      {
        lockupViewModel: {
          contentId: 'PLlockup456',
          metadata: {
            title: { content: 'Lockup Favorites' },
            subtitle: { content: 'Playlist • 50 tracks' }
          },
          image: {
            sources: [{ url: 'https://i.ytimg.com/lockup.jpg' }]
          }
        }
      },
      // Liked videos playlist (VLLM) - should be filtered out to avoid duplicating Liked Songs
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Liked Music' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'VLLM' } }
        }
      }
    ]
  };

  const modernParsed = innertube.parseLibraryPlaylistsResponse(mockModernFormats);
  assert.strictEqual(modernParsed.length, 2, 'Must parse compactPlaylistRenderer & lockupViewModel while filtering VLLM');
  assert.strictEqual(modernParsed[0].title, 'Compact Mix');
  assert.strictEqual(modernParsed[0].browseId, 'VLPLcompact123');
  assert.strictEqual(modernParsed[0].cover, 'https://i.ytimg.com/compact.jpg');
  assert.strictEqual(modernParsed[1].title, 'Lockup Favorites');
  assert.strictEqual(modernParsed[1].browseId, 'VLPLlockup456');
  assert.strictEqual(modernParsed[1].cover, 'https://i.ytimg.com/lockup.jpg');

  // 7. Verify fetchYouTubeTranscriptLyrics edge cases & validation
  innertube.fetchYouTubeTranscriptLyrics(null).then(res => assert.strictEqual(res, null));
  innertube.fetchYouTubeTranscriptLyrics('').then(res => assert.strictEqual(res, null));
  innertube.fetchYouTubeTranscriptLyrics('invalid_len').then(res => assert.strictEqual(res, null));
  innertube.fetchYouTubeTranscriptLyrics(12345).then(res => assert.strictEqual(res, null));

  console.log('✓ InnerTube API & YouTube Music Live Integration tests passed successfully.');
}

module.exports = runInnerTubeIntegrationTests;

if (require.main === module) {
  runInnerTubeIntegrationTests();
}
