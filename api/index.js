// Single Vercel serverless function wrapping the existing Express app
// This avoids the 12-function limit on the Hobby plan

// Load .env for local dev; on Vercel, env vars are set via dashboard
require('dotenv').config();

const app = require('../src/app');

module.exports = app;
