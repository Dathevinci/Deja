/**
 * Deja Cookie & Session Utilities
 * Provides robust cookie parsing and validation for YouTube Music and Google authentication.
 */

/**
 * Parses raw cookie input into an array of { name, value } objects.
 * Handles:
 * - Bare SAPISID tokens (auto-populates SAPISID, __Secure-3PAPISID, __Secure-1PAPISID)
 * - Key=value cookie pairs separated by semicolons or newlines
 * - Quoted cookie values (strips quotes)
 * - Auto-populating __Secure-3PAPISID and __Secure-1PAPISID when only SAPISID is provided
 */
function parseCookiePairs(rawCookieInput) {
  if (!rawCookieInput || typeof rawCookieInput !== 'string') {
    return [];
  }
  const cleanInput = rawCookieInput.trim();
  if (!cleanInput) {
    return [];
  }

  const cookiePairs = [];
  if (!cleanInput.includes('=') && !cleanInput.includes(';')) {
    // Single raw token, treat as SAPISID
    cookiePairs.push({ name: 'SAPISID', value: cleanInput });
    cookiePairs.push({ name: '__Secure-3PAPISID', value: cleanInput });
    cookiePairs.push({ name: '__Secure-1PAPISID', value: cleanInput });
  } else {
    // Semicolon or newline separated key=value pairs
    const items = cleanInput.split(/[\r\n;]+/);
    for (const item of items) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const name = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (name && value) {
          cookiePairs.push({ name, value });
        }
      }
    }
  }

  // If SAPISID is provided but __Secure-3PAPISID / __Secure-1PAPISID are missing, populate them
  const hasSecure3P = cookiePairs.some(c => c.name === '__Secure-3PAPISID');
  const sapisidItem = cookiePairs.find(c => c.name === 'SAPISID');
  if (sapisidItem && !hasSecure3P) {
    cookiePairs.push({ name: '__Secure-3PAPISID', value: sapisidItem.value });
    cookiePairs.push({ name: '__Secure-1PAPISID', value: sapisidItem.value });
  }

  return cookiePairs;
}

module.exports = {
  parseCookiePairs
};
