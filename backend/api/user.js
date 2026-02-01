// Đã gộp vào server.js
// This file is now normalized to export the server module
module.exports = require('./server');

// The previous user routes have been moved to the server module.
const connectDB = require('../config/database');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = async (req, res) => {
  await connectDB();
  // Example: GET /api/users
  if (req.method === 'GET' && req.url === '/') {
    return userController.getAllUsers(req, res);
  }
  // Example: GET /api/users/:id
  if (req.method === 'GET' && req.url.match(/^\/[a-zA-Z0-9]+$/)) {
    req.params = { id: req.url.slice(1) };
    return userController.getUserById(req, res);
  }
  // Add more user routes as needed
  res.status(404).json({ success: false, message: 'Not found' });
};
