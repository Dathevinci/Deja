/**
 * Deja Persistent Auth Store
 * Manages persistent YouTube Music and Google authentication in deja-auth.json.
 * 
 * Ensures session cookies are converted to persistent cookies with future expiration dates (2 years)
 * so Chromium / Electron does not discard them upon application restart.
 */

const fs = require('fs');
const path = require('path');
const { parseCookiePairs, hasApiSid, API_SID_NAMES } = require('./cookie-utils');

const AUTH_FILE_NAME = 'deja-auth.json';
const TWO_YEARS_IN_SECONDS = 2 * 365 * 24 * 60 * 60;

/**
 * Returns future Unix timestamp in seconds for persistent cookie expiration.
 */
function getFutureExpirationDate(years = 2) {
  return Math.floor(Date.now() / 1000) + (years * 365 * 24 * 60 * 60);
}

/**
 * Resolves the absolute path to deja-auth.json in userData.
 */
function getAuthFilePath() {
  try {
    const { app } = require('electron');
    if (app && typeof app.getPath === 'function') {
      return path.join(app.getPath('userData'), AUTH_FILE_NAME);
    }
  } catch {}

  // Fallback for Node.js / test environments
  const homeDir = process.env.APPDATA ||
    (process.platform === 'darwin'
      ? path.join(process.env.HOME || '', 'Library', 'Application Support')
      : path.join(process.env.HOME || '', '.config'));
  const fallbackDir = path.join(homeDir, 'deja');
  return path.join(fallbackDir, AUTH_FILE_NAME);
}

/**
 * Loads saved auth session from deja-auth.json.
 */
function loadAuthSession() {
  try {
    const filePath = getAuthFilePath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw || !raw.trim()) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (err) {
    console.warn('[AuthStore] Error loading auth session:', err.message);
    return null;
  }
}

/**
 * Saves auth session to deja-auth.json atomically.
 */
function saveAuthSession(sessionData) {
  if (!sessionData || typeof sessionData !== 'object') return false;
  try {
    const filePath = getAuthFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const payload = {
      version: 1,
      updatedAt: Date.now(),
      sapisid: sessionData.sapisid || null,
      account: sessionData.account || null,
      sessionScope: sessionData.sessionScope || null,
      cookieStr: sessionData.cookieStr || '',
      cookies: Array.isArray(sessionData.cookies) ? sessionData.cookies : []
    };

    // If cookieStr is provided but cookies is empty, parse them
    if (payload.cookieStr && (!payload.cookies || payload.cookies.length === 0)) {
      payload.cookies = parseCookiePairs(payload.cookieStr);
    }

    // Ensure sapisid is extracted if missing
    if (!payload.sapisid && payload.cookies.length > 0) {
      const sidItem = payload.cookies.find(c => API_SID_NAMES.has(c.name));
      if (sidItem) payload.sapisid = sidItem.value;
    }

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[AuthStore] Error saving auth session:', err.message);
    return false;
  }
}

/**
 * Updates the saved account metadata in deja-auth.json without altering cookies.
 */
function updateSavedAccount(account) {
  const existing = loadAuthSession();
  if (!existing) return false;
  existing.account = account;
  existing.updatedAt = Date.now();
  return saveAuthSession(existing);
}

/**
 * Clears and removes deja-auth.json upon logout.
 */
function clearAuthSession() {
  try {
    const filePath = getAuthFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (err) {
    console.warn('[AuthStore] Error clearing auth session:', err.message);
    return false;
  }
}

/**
 * Applies cookie pairs to an Electron session with future expiration dates (2 years)
 * and flushes the cookie store to disk.
 */
async function applyCookiesToSession(ses, cookiePairsOrRaw, expirationSeconds = TWO_YEARS_IN_SECONDS) {
  if (!ses || !ses.cookies) {
    throw new Error('Valid Electron session is required');
  }

  let cookiePairs = [];
  if (typeof cookiePairsOrRaw === 'string') {
    cookiePairs = parseCookiePairs(cookiePairsOrRaw);
  } else if (Array.isArray(cookiePairsOrRaw)) {
    cookiePairs = cookiePairsOrRaw;
  }

  if (cookiePairs.length === 0) {
    return false;
  }

  const expirationDate = Math.floor(Date.now() / 1000) + expirationSeconds;

  for (const item of cookiePairs) {
    if (!item || !item.name) continue;
    const name = item.name.trim();
    const value = String(item.value !== undefined ? item.value : '').trim();
    const isHostCookie = name.startsWith('__Host-');
    const itemDomain = (item.domain || '').toLowerCase();
    const isGoogleCookie = itemDomain.includes('google');
    const isYtCookie = itemDomain.includes('youtube');
    const isAuthSid = name.includes('SID') || name.includes('APISID') || name === 'LOGIN_INFO';

    const targets = [];
    if (isGoogleCookie) {
      const gDomain = isHostCookie ? undefined : (item.domain.startsWith('.') ? item.domain : `.${item.domain}`);
      targets.push({ url: 'https://google.com', domain: gDomain });
      targets.push({ url: 'https://accounts.google.com', domain: gDomain });
    } else if (isYtCookie) {
      const ytDomain = isHostCookie ? undefined : (item.domain.startsWith('.') ? item.domain : `.${item.domain}`);
      targets.push({ url: 'https://music.youtube.com', domain: ytDomain });
      targets.push({ url: 'https://youtube.com', domain: ytDomain });
    } else {
      // Unspecified domain (e.g. from pasted raw cookies or 1-click sync string)
      targets.push({ url: 'https://music.youtube.com', domain: isHostCookie ? undefined : '.youtube.com' });
      targets.push({ url: 'https://youtube.com', domain: isHostCookie ? undefined : '.youtube.com' });
      if (isAuthSid) {
        targets.push({ url: 'https://google.com', domain: isHostCookie ? undefined : '.google.com' });
        targets.push({ url: 'https://accounts.google.com', domain: isHostCookie ? undefined : '.google.com' });
      }
    }

    for (const t of targets) {
      try {
        const details = {
          url: t.url,
          name,
          value,
          path: item.path || '/',
          secure: true,
          httpOnly: !!item.httpOnly,
          sameSite: item.sameSite || 'no_restriction',
          expirationDate
        };

        if (t.domain && !isHostCookie) {
          details.domain = t.domain;
        }

        await ses.cookies.set(details);
      } catch {
        try {
          await ses.cookies.set({
            url: t.url,
            name,
            value,
            path: item.path || '/',
            secure: true,
            expirationDate
          });
        } catch {}
      }
    }
  }

  // Force synchronous flush to disk SQLite store
  if (typeof ses.cookies.flushStore === 'function') {
    await ses.cookies.flushStore().catch(() => {});
  }

  return true;
}

/**
 * Persists the current session's cookies from ses into deja-auth.json,
 * sets future expiration dates on all cookies in ses, and flushes to disk.
 */
async function persistCurrentSession(ses, account = null, sessionScope = null, rawInput = null) {
  if (!ses || !ses.cookies) return false;

  try {
    const ytCookies = await ses.cookies.get({ domain: '.youtube.com' }).catch(() => []);
    const ytDomainCookies = await ses.cookies.get({ domain: 'youtube.com' }).catch(() => []);
    const musicCookies = await ses.cookies.get({ url: 'https://music.youtube.com' }).catch(() => []);
    const googleCookies = await ses.cookies.get({ domain: '.google.com' }).catch(() => []);
    const googleDomainCookies = await ses.cookies.get({ domain: 'google.com' }).catch(() => []);
    const allPartitionCookies = await ses.cookies.get({}).catch(() => []);

    const all = [
      ...allPartitionCookies,
      ...ytCookies,
      ...ytDomainCookies,
      ...musicCookies,
      ...googleCookies,
      ...googleDomainCookies
    ];

    const cookieMap = new Map();
    for (const c of all) {
      if (c && c.name && c.value !== undefined) {
        cookieMap.set(c.name, c);
      }
    }

    // If rawInput was also provided, parse and merge
    if (rawInput && typeof rawInput === 'string') {
      const extraPairs = parseCookiePairs(rawInput);
      for (const p of extraPairs) {
        if (!cookieMap.has(p.name)) {
          cookieMap.set(p.name, {
            name: p.name,
            value: p.value,
            domain: '.youtube.com',
            path: '/',
            secure: true
          });
        }
      }
    }

    const cookieList = Array.from(cookieMap.values());
    if (cookieList.length === 0) return false;

    const futureExp = getFutureExpirationDate();
    const cookiePairsForStorage = [];

    // Re-set each cookie in ses with future expirationDate so Chromium treats it as persistent
    for (const c of cookieList) {
      const name = c.name;
      const value = c.value;
      const domain = c.domain || (name.startsWith('__Host-') ? undefined : '.youtube.com');
      const cookieObj = {
        name,
        value,
        domain,
        path: c.path || '/',
        secure: c.secure !== undefined ? c.secure : true,
        httpOnly: !!c.httpOnly,
        sameSite: c.sameSite || 'no_restriction',
        expirationDate: futureExp
      };
      cookiePairsForStorage.push(cookieObj);

      const targetUrl = (domain && domain.includes('google')) ? 'https://google.com' : 'https://music.youtube.com';
      try {
        const details = { ...cookieObj, url: targetUrl };
        if (name.startsWith('__Host-')) delete details.domain;
        await ses.cookies.set(details);
      } catch {}
    }

    if (typeof ses.cookies.flushStore === 'function') {
      await ses.cookies.flushStore().catch(() => {});
    }

    const cookieStr = cookieList.map(c => `${c.name}=${c.value}`).join('; ');
    const sapisidItem = cookieList.find(c => API_SID_NAMES.has(c.name));

    const sessionPayload = {
      cookies: cookiePairsForStorage,
      cookieStr,
      sapisid: sapisidItem ? sapisidItem.value : null,
      account,
      sessionScope
    };

    saveAuthSession(sessionPayload);
    return true;
  } catch (err) {
    console.warn('[AuthStore] Error in persistCurrentSession:', err.message);
    return false;
  }
}

/**
 * Restores authentication session from deja-auth.json into the partition on application startup.
 */
async function restoreSessionOnStartup(ses) {
  if (!ses || !ses.cookies) {
    return { restored: false, reason: 'No session provided' };
  }

  const saved = loadAuthSession();
  if (!saved || (!saved.cookies && !saved.cookieStr)) {
    return { restored: false, reason: 'No saved session found' };
  }

  try {
    const cookiesToApply = (Array.isArray(saved.cookies) && saved.cookies.length > 0)
      ? saved.cookies
      : parseCookiePairs(saved.cookieStr || '');

    if (cookiesToApply.length === 0) {
      return { restored: false, reason: 'No cookies to apply' };
    }

    await applyCookiesToSession(ses, cookiesToApply);

    if (typeof ses.cookies.flushStore === 'function') {
      await ses.cookies.flushStore().catch(() => {});
    }

    return {
      restored: true,
      account: saved.account || null,
      sessionScope: saved.sessionScope || null,
      sapisid: saved.sapisid || null
    };
  } catch (err) {
    console.warn('[AuthStore] Failed restoring session on startup:', err.message);
    return { restored: false, error: err.message };
  }
}

module.exports = {
  AUTH_FILE_NAME,
  TWO_YEARS_IN_SECONDS,
  getFutureExpirationDate,
  getAuthFilePath,
  loadAuthSession,
  saveAuthSession,
  updateSavedAccount,
  clearAuthSession,
  applyCookiesToSession,
  persistCurrentSession,
  restoreSessionOnStartup
};
