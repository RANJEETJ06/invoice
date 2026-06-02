const mongoose = require('mongoose');
const cfg = require('./config');

// Cache the connection across serverless invocations (Vercel reuses the
// Node.js process between requests when warm). Without this, every cold
// function would open a new Atlas connection and quickly exhaust the pool.
let cached = global.__adijaMongoose;
if (!cached) cached = global.__adijaMongoose = { conn: null, promise: null };

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(cfg.mongodbUri, {
        dbName: cfg.mongodbDb,
        serverSelectionTimeoutMS: 15000,
      })
      .then((m) => {
        console.log(`[db] connected to ${cfg.mongodbDb}`);
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect, mongoose };
