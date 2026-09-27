/**
 * Deja Cookie & Session Utilities
 * Provides robust cookie parsing and validation for YouTube Music and Google authentication.
 */

const COOKIE_DIRECTIVES = new Set([
  'path',
  'domain',
  'expires',
  'max-age',
  'samesite',
  'secure',
  'httponly',
  'priority',
  'partitioned'
]);

function populateMissingSapisidPairs(cookiePairs) {
  const sapisidItem = cookiePairs.find(c => c.name === 'SAPISID');
  if (sapisidItem && sapisidItem.value) {
    const hasSecure3P = cookiePairs.some(c => c.name === '__Secure-3PAPISID');
    const hasSecure1P = cookiePairs.some(c => c.name === '__Secure-1PAPISID');
    if (!hasSecure3P) {
      cookiePairs.push({ name: '__Secure-3PAPISID', value: sapisidItem.value });
    }
    if (!hasSecure1P) {
      cookiePairs.push({ name: '__Secure-1PAPISID', value: sapisidItem.value });
    }
  }
}

/**
 * Parses raw cookie input into an array of { name, value } objects.
 * Handles:
 * - Bare SAPISID tokens (auto-populates SAPISID, __Secure-3PAPISID, __Secure-1PAPISID)
 * - Key=value cookie pairs separated by semicolons or newlines
 * - Quoted cookie values (strips quotes)
 * - Auto-populating __Secure-3PAPISID and __Secure-1PAPISID independently when only SAPISID is provided
 * - JSON-exported cookies from browser extensions (Cookie-Editor, EditThisCookie)
 * - Stripping "Cookie:" or "Set-Cookie:" header prefixes
 * - Filtering out HTTP cookie directives (Path, Domain, SameSite, etc.)
 */
function parseCookiePairs(rawCookieInput) {
  if (!rawCookieInput || typeof rawCookieInput !== 'string') {
    return [];
  }
  let cleanInput = rawCookieInput.trim();
  if (!cleanInput) {
    return [];
  }

  // Strip leading "Cookie:" or "Set-Cookie:" header prefix if present
  cleanInput = cleanInput.replace(/^(?:set-cookie|cookie):\s*/i, '').trim();
  if (!cleanInput) {
    return [];
  }

  // Support JSON-exported cookie arrays (e.g. from Cookie-Editor / EditThisCookie)
  if (cleanInput.startsWith('[') && cleanInput.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleanInput);
      if (Array.isArray(parsed)) {
        const cookiePairs = [];
        for (const item of parsed) {
          if (item && typeof item === 'object' && item.name && item.value !== undefined) {
            const name = String(item.name).trim();
            let value = String(item.value).trim();
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1);
            }
            if (name && !COOKIE_DIRECTIVES.has(name.toLowerCase())) {
              cookiePairs.push({ name, value });
            }
          }
        }
        if (cookiePairs.length > 0) {
          populateMissingSapisidPairs(cookiePairs);
          return cookiePairs;
        }
      }
    } catch {
      // Fall through to standard parsing if JSON parse fails
    }
  }

  const cookiePairs = [];
  if (!cleanInput.includes('=') && !cleanInput.includes(';')) {
    // Single raw token, treat as SAPISID
    let token = cleanInput;
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1).trim();
    }
    cookiePairs.push({ name: 'SAPISID', value: token });
    cookiePairs.push({ name: '__Secure-3PAPISID', value: token });
    cookiePairs.push({ name: '__Secure-1PAPISID', value: token });
    return cookiePairs;
  }

  // Semicolon or newline separated key=value pairs
  const items = cleanInput.split(/[\r\n;]+/);
  for (const item of items) {
    let trimmed = item.trim();
    if (!trimmed) continue;
    trimmed = trimmed.replace(/^(?:set-cookie|cookie):\s*/i, '').trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const name = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (name && value && !COOKIE_DIRECTIVES.has(name.toLowerCase())) {
        cookiePairs.push({ name, value });
      }
    }
  }

  populateMissingSapisidPairs(cookiePairs);

  return cookiePairs;
}

module.exports = {
  parseCookiePairs
};
