const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const cfg = require('./config');
const { connect } = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/stats', require('./routes/stats'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

async function start() {
  try {
    await connect();
    app.listen(cfg.port, () => {
      console.log(`[server] listening on http://localhost:${cfg.port}`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = { app, start };
