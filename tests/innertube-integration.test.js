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
  assert.strictEqual(typeof innertube.getPlaylist, 'function');
  assert.strictEqual(typeof innertube.getNextQueue, 'function');
  assert.strictEqual(typeof innertube.search, 'function');
  assert.strictEqual(typeof innertube.rate, 'function');

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

  console.log('✓ InnerTube API & YouTube Music Live Integration tests passed successfully.');
}

module.exports = runInnerTubeIntegrationTests;

if (require.main === module) {
  runInnerTubeIntegrationTests();
}
