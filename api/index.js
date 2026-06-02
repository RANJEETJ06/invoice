// Vercel serverless entry. Wraps the existing Express app so we don't
// have to split every route into its own function. The Electron + local
// `node server.js` paths are untouched.
const { app } = require('../server/server');
const { connect } = require('../server/db');

let ready;
function ensureReady() {
  if (!ready) ready = connect();
  return ready;
}

module.exports = async (req, res) => {
  try {
    await ensureReady();
  } catch (err) {
    ready = null;
    console.error('[api] db connect failed:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'database unavailable' }));
    return;
  }
  return app(req, res);
};
