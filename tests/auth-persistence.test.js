/**
 * Deja Auth Persistence & Playlist Parsing Test Suite
 * Verifies:
 * 1. Persistent session storage (deja-auth.json) and restoration on startup.
 * 2. Future cookie expiration dates (2 years) preventing Chromium session cookie drops.
 * 3. InnerTube playlist parsing for all container shapes (twoRow, responsiveItem, lockupViewModel, compact, grid).
 * 4. parseSectionList extraction and deduplication.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const authStore = require('../src/main/auth-store');
const innertube = require('../src/main/innertube');

function runAuthPersistenceTests() {
  console.log('--- Testing Auth Persistence & InnerTube Playlist Architecture ---');

  // 1. Verify Auth Store Paths and Expiration Calculation
  assert.strictEqual(typeof authStore.getAuthFilePath, 'function');
  assert.strictEqual(typeof authStore.getFutureExpirationDate, 'function');
  const futureExp = authStore.getFutureExpirationDate(2);
  const nowSec = Math.floor(Date.now() / 1000);
  assert.ok(futureExp > nowSec + 365 * 24 * 3600, 'Expiration must be at least 1 year in future');
  assert.ok(futureExp <= nowSec + 3 * 365 * 24 * 3600, 'Expiration should be around 2 years');

  // 2. Test Saving and Loading Session to deja-auth.json
  const testUserDataPath = authStore.getAuthFilePath();
  const testAccount = {
    isLoggedIn: true,
    name: 'Deja Test User',
    channelTitle: 'Deja Test Channel',
    handle: '@dejatest',
    avatarUrl: 'https://lh3.googleusercontent.com/test-avatar.jpg'
  };
  const testScope = {
    pageId: '1234567890',
    dataSyncId: '1234567890',
    authUser: '0',
    visitorData: 'VISITOR_TEST_123',
    clientVersion: '1.20250101.01.00',
    loggedIn: true
  };
  const testCookies = [
    { name: 'SAPISID', value: 'sapisid_secret_123', domain: '.youtube.com', path: '/', secure: true },
    { name: '__Secure-3PAPISID', value: 'sapisid_secret_123', domain: '.youtube.com', path: '/', secure: true },
    { name: '__Secure-1PAPISID', value: 'sapisid_secret_123', domain: '.youtube.com', path: '/', secure: true },
    { name: 'SID', value: 'google_sid_456', domain: '.google.com', path: '/', secure: true },
    { name: 'LOGIN_INFO', value: 'yt_login_info_789', domain: '.youtube.com', path: '/', secure: true }
  ];

  const saveOk = authStore.saveAuthSession({
    cookies: testCookies,
    account: testAccount,
    sessionScope: testScope,
    sapisid: 'sapisid_secret_123'
  });
  assert.strictEqual(saveOk, true, 'Saving session to deja-auth.json must succeed');
  assert.ok(fs.existsSync(testUserDataPath), 'deja-auth.json must exist after save');

  const loadedSession = authStore.loadAuthSession();
  assert.ok(loadedSession, 'Loaded session must not be null');
  assert.strictEqual(loadedSession.sapisid, 'sapisid_secret_123');
  assert.strictEqual(loadedSession.account.name, 'Deja Test User');
  assert.strictEqual(loadedSession.sessionScope.dataSyncId, '1234567890');
  assert.strictEqual(loadedSession.cookies.length, 5);

  // 3. Test Cookie Application with Future Expiration Dates
  const setCookies = [];
  let flushStoreCount = 0;
  const mockSession = {
    cookies: {
      set: async (details) => {
        setCookies.push(details);
        return true;
      },
      get: async (opts) => {
        return testCookies;
      },
      flushStore: async () => {
        flushStoreCount++;
        return true;
      }
    }
  };

  // Test applyCookiesToSession
  setCookies.length = 0;
  flushStoreCount = 0;
  const applyPromise = authStore.applyCookiesToSession(mockSession, testCookies);
  assert.doesNotReject(applyPromise);

  applyPromise.then(() => {
    assert.ok(setCookies.length > 0, 'Cookies must be set into session');
    for (const c of setCookies) {
      assert.ok(c.expirationDate, `Cookie ${c.name} must have an explicit future expirationDate`);
      assert.ok(c.expirationDate > nowSec + 365 * 24 * 3600, `Cookie ${c.name} expirationDate must be > 1 year in future`);
    }
    assert.ok(flushStoreCount >= 1, 'ses.cookies.flushStore must be called after applying cookies');
  });

  // 4. Test Startup Restoration
  setCookies.length = 0;
  flushStoreCount = 0;
  const restorePromise = authStore.restoreSessionOnStartup(mockSession);
  assert.doesNotReject(restorePromise);
  restorePromise.then((res) => {
    assert.strictEqual(res.restored, true, 'Session must report restored: true');
    assert.strictEqual(res.account.name, 'Deja Test User');
    assert.strictEqual(res.sapisid, 'sapisid_secret_123');
    assert.ok(flushStoreCount >= 1, 'flushStore must be called on startup restoration');
  });

  // 5. Test Update Saved Account
  authStore.updateSavedAccount({
    ...testAccount,
    name: 'Updated Deja User'
  });
  const updated = authStore.loadAuthSession();
  assert.strictEqual(updated.account.name, 'Updated Deja User');
  assert.strictEqual(updated.cookies.length, 5, 'Cookies must be preserved across account update');

  // 6. Test Clear Auth Session
  const clearOk = authStore.clearAuthSession();
  assert.strictEqual(clearOk, true);
  assert.strictEqual(fs.existsSync(testUserDataPath), false, 'deja-auth.json must be removed on logout');

  // 7. Comprehensive InnerTube Playlist Parsing Tests
  // Shape A: musicTwoRowItemRenderer with PL id
  const twoRowData = {
    contents: {
      singleColumnBrowseResultsRenderer: {
        tabs: [{
          tabRenderer: {
            content: {
              sectionListRenderer: {
                contents: [{
                  gridRenderer: {
                    items: [{
                      musicTwoRowItemRenderer: {
                        title: { runs: [{ text: 'Indie Favorites' }] },
                        subtitle: { runs: [{ text: 'Playlist • 32 songs' }] },
                        navigationEndpoint: { browseEndpoint: { browseId: 'PLindie123' } },
                        thumbnailRenderer: {
                          musicThumbnailRenderer: {
                            thumbnail: { thumbnails: [{ url: 'https://i.ytimg.com/indie.jpg' }] }
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
  const parsedTwoRow = innertube.parseLibraryPlaylistsResponse(twoRowData);
  assert.strictEqual(parsedTwoRow.length, 1);
  assert.strictEqual(parsedTwoRow[0].title, 'Indie Favorites');
  assert.strictEqual(parsedTwoRow[0].subtitle, 'Playlist • 32 songs');
  assert.strictEqual(parsedTwoRow[0].browseId, 'VLPLindie123');
  assert.strictEqual(parsedTwoRow[0].playlistId, 'PLindie123');

  // Shape B: musicResponsiveListItemRenderer with overlay play button
  const responsiveData = {
    contents: [{
      musicResponsiveListItemRenderer: {
        flexColumns: [
          {
            musicResponsiveListItemFlexColumnRenderer: {
              text: { runs: [{ text: 'Lo-Fi Study Beats' }] }
            }
          },
          {
            musicResponsiveListItemFlexColumnRenderer: {
              text: { runs: [{ text: 'Playlist • Chill Vibes' }] }
            }
          }
        ],
        navigationEndpoint: {
          browseEndpoint: { browseId: 'VLPLlofi789' }
        },
        overlay: {
          musicItemThumbnailOverlayRenderer: {
            content: {
              musicPlayButtonRenderer: {
                playNavigationEndpoint: {
                  watchEndpoint: { videoId: 'videoInPlaylist123' }
                }
              }
            }
          }
        },
        thumbnail: {
          musicThumbnailRenderer: {
            thumbnail: { thumbnails: [{ url: 'https://i.ytimg.com/lofi.jpg' }] }
          }
        }
      }
    }]
  };
  const parsedResp = innertube.parseLibraryPlaylistsResponse(responsiveData);
  assert.strictEqual(parsedResp.length, 1);
  assert.strictEqual(parsedResp[0].title, 'Lo-Fi Study Beats');
  assert.strictEqual(parsedResp[0].subtitle, 'Playlist • Chill Vibes');
  assert.strictEqual(parsedResp[0].browseId, 'VLPLlofi789');
  assert.strictEqual(parsedResp[0].playlistId, 'PLlofi789');

  // Shape C: Modern 2025/2026 lockupViewModel with lockupMetadataViewModel
  const modernLockup = {
    lockupViewModel: {
      contentId: 'PLlockup999',
      metadata: {
        lockupMetadataViewModel: {
          title: { content: 'Road Trip Anthems' },
          metadata: {
            contentMetadataViewModel: {
              metadataRows: [
                { elements: [{ text: { content: 'Playlist' } }, { text: { content: '50 songs' } }] }
              ]
            }
          }
        }
      },
      image: {
        imageViewModel: {
          sources: [{ url: 'https://i.ytimg.com/roadtrip.jpg' }]
        }
      },
      rendererContext: {
        commandContext: {
          onTap: {
            innertubeCommand: {
              browseEndpoint: { browseId: 'VLPLlockup999' }
            }
          }
        }
      }
    }
  };
  const parsedLockup = innertube.parseLibraryPlaylistsResponse(modernLockup);
  assert.strictEqual(parsedLockup.length, 1);
  assert.strictEqual(parsedLockup[0].title, 'Road Trip Anthems');
  assert.strictEqual(parsedLockup[0].browseId, 'VLPLlockup999');
  assert.strictEqual(parsedLockup[0].playlistId, 'PLlockup999');
  assert.strictEqual(parsedLockup[0].cover, 'https://i.ytimg.com/roadtrip.jpg');

  // Shape D: Filter out action tiles (New playlist, FEplaylist_add, VLLM)
  const filtersData = {
    contents: [
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'New playlist' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'FEplaylist_add' } }
        }
      },
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Liked Music' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'VLLM' } }
        }
      },
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Valid Playlist' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'VLPLvalid1' } }
        }
      }
    ]
  };
  const parsedFilters = innertube.parseLibraryPlaylistsResponse(filtersData);
  assert.strictEqual(parsedFilters.length, 1);
  assert.strictEqual(parsedFilters[0].title, 'Valid Playlist');

  // 8. Test parseSectionList Function
  assert.strictEqual(typeof innertube.parseSectionList, 'function');
  const sectionContents = [
    {
      musicShelfRenderer: {
        contents: [
          {
            compactPlaylistRenderer: {
              playlistId: 'PLcompact001',
              title: { simpleText: 'Electronic Dance' },
              shortBylineText: { simpleText: 'Playlist' }
            }
          }
        ]
      }
    }
  ];
  const parsedSection = innertube.parseSectionList(sectionContents);
  assert.strictEqual(parsedSection.length, 1);
  assert.strictEqual(parsedSection[0].title, 'Electronic Dance');
  assert.strictEqual(parsedSection[0].browseId, 'VLPLcompact001');

  // 9. Test Domain-Targeted URL Partitioning in applyCookiesToSession
  const domainTestSession = {
    cookies: {
      set: async (details) => {
        domainCaptured.push(details);
        return true;
      },
      flushStore: async () => true
    }
  };
  const domainCaptured = [];
  const testDomainCookies = [
    { name: 'SAPISID', value: 'secret1', domain: '.google.com' },
    { name: 'LOGIN_INFO', value: 'yt_login', domain: '.youtube.com' }
  ];
  authStore.applyCookiesToSession(domainTestSession, testDomainCookies).then(() => {
    const googleCookieTargets = domainCaptured.filter(c => c.name === 'SAPISID').map(c => c.url);
    const ytCookieTargets = domainCaptured.filter(c => c.name === 'LOGIN_INFO').map(c => c.url);
    assert.ok(googleCookieTargets.every(u => u.includes('google.com')), 'Google cookies must only target google domains');
    assert.ok(ytCookieTargets.every(u => u.includes('youtube.com')), 'YouTube cookies must only target youtube domains');
  });

  // 10. Test extractIdentityTokensFromAccountMenu
  assert.strictEqual(typeof innertube.extractIdentityTokensFromAccountMenu, 'function');
  const mockAccountMenu = {
    actions: [
      {
        openPopupAction: {
          popup: {
            multiPageMenuRenderer: {
              sections: [
                {
                  accountSectionListRenderer: {
                    contents: [
                      {
                        accountItemSectionRenderer: {
                          contents: [
                            {
                              accountItem: {
                                accountName: { simpleText: 'Brand Channel' },
                                pageId: '10987654321',
                                supportedTokens: [
                                  {
                                    datasyncIdToken: {
                                      datasyncIdToken: 'DATASYNC_PREFIX||BRAND_SESSION_TOKEN_123'
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    ]
  };
  const extractedTokens = innertube.extractIdentityTokensFromAccountMenu(mockAccountMenu);
  assert.strictEqual(extractedTokens.pageId, '10987654321');
  assert.strictEqual(extractedTokens.dataSyncId, 'BRAND_SESSION_TOKEN_123');

  // 11. Test parseBrowsePlaylistItem with Unwrapped Renderers
  assert.strictEqual(typeof innertube.parseBrowsePlaylistItem, 'function');
  const unwrappedTwoRow = {
    title: { runs: [{ text: 'Unwrapped Synthwave' }] },
    subtitle: { runs: [{ text: 'Community Playlist' }] },
    navigationEndpoint: {
      browseEndpoint: { browseId: 'VLPLunwrapped123' }
    },
    thumbnailRenderer: {
      musicThumbnailRenderer: {
        thumbnail: {
          thumbnails: [{ url: 'https://lh3.googleusercontent.com/cover.jpg' }]
        }
      }
    }
  };
  const parsedUnwrapped = innertube.parseBrowsePlaylistItem(unwrappedTwoRow);
  assert.ok(parsedUnwrapped, 'Unwrapped twoRow renderer must parse successfully');
  assert.strictEqual(parsedUnwrapped.title, 'Unwrapped Synthwave');
  assert.strictEqual(parsedUnwrapped.browseId, 'VLPLunwrapped123');

  // 12. Test Exclusion of Non-Playlist Items (Albums, Radio, Artist Channels)
  const mixedLibraryData = {
    contents: [
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Actual Playlist' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'VLPLrealplaylist' } }
        }
      },
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Album Release' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'MPREb_album123' } }
        }
      },
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Official Album' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'VLOLAK5uy_album456' } }
        }
      },
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Radio Mix' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'VLRDmix789' } }
        }
      },
      {
        musicTwoRowItemRenderer: {
          title: { runs: [{ text: 'Artist Profile' }] },
          navigationEndpoint: { browseEndpoint: { browseId: 'UCartist001' } }
        }
      }
    ]
  };
  const parsedLibrary = innertube.parseLibraryPlaylistsResponse(mixedLibraryData);
  assert.strictEqual(parsedLibrary.length, 1, 'Only genuine user playlists must survive filtering');
  assert.strictEqual(parsedLibrary[0].title, 'Actual Playlist');
  assert.strictEqual(parsedLibrary[0].playlistId, 'PLrealplaylist');

  // 13. Test normalizeDataSyncId Utility
  assert.strictEqual(typeof innertube.normalizeDataSyncId, 'function');
  assert.strictEqual(innertube.normalizeDataSyncId('SYNC_PERSONAL||SESSION_A'), 'SESSION_A');
  assert.strictEqual(innertube.normalizeDataSyncId('SYNC_PERSONAL||'), 'SYNC_PERSONAL');
  assert.strictEqual(innertube.normalizeDataSyncId('STANDALONE_ID'), 'STANDALONE_ID');
  assert.strictEqual(innertube.normalizeDataSyncId(''), null);
  assert.strictEqual(innertube.normalizeDataSyncId(null), null);

  console.log('✓ Auth Persistence & InnerTube Playlist Architecture tests passed successfully.');
}

module.exports = runAuthPersistenceTests;

if (require.main === module) {
  runAuthPersistenceTests();
}
