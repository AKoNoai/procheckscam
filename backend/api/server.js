// Vercel serverless entry: wrap Express app with serverless-http
const serverless = require('serverless-http');
const app = require('../server');

module.exports = serverless(app);