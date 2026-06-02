const fs = require('fs');
const path = require('path');

// Locate .env: dev (project root), packaged Electron (extraResources next to .exe),
// or via explicit env override. Real env vars always win — useful for hosting.
function loadEnvFile() {
  if (Object.keys(process.env).some((k) => k === 'MONGODB_URI' && process.env[k])) {
    return; // real env already set (e.g. PaaS, Docker, CI)
  }
  const candidates = [
    process.env.ENV_PATH,
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
    process.resourcesPath ? path.join(process.resourcesPath, '.env') : null,
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const raw = fs.readFileSync(p, 'utf8');
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
      console.log(`[config] loaded env from ${p}`);
      return;
    } catch (err) {
      console.warn('[config] failed to read', p, err.message);
    }
  }
  console.warn('[config] no .env file found, relying on process env only');
}

loadEnvFile();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required (set it in .env or as an environment variable)');
}

module.exports = {
  mongodbUri: process.env.MONGODB_URI,
  mongodbDb: process.env.MONGODB_DB || 'adija_invoice',
  port: parseInt(process.env.PORT || '4000', 10),
};
