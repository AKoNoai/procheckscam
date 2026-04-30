require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./server');

const START_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT = 65535;

const startExpireJobWhenConnected = () => {
  if (mongoose.connection.readyState === 1) {
    const { startExpireJob } = require('./jobs/expireListings');
    startExpireJob();
    console.log('🔧 Expiry job started (local runtime)');
    return;
  }

  mongoose.connection.once('connected', () => {
    const { startExpireJob } = require('./jobs/expireListings');
    startExpireJob();
    console.log('🔧 Expiry job started (local runtime)');
  });
};

startExpireJobWhenConnected();

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server đang chạy trên port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && port < MAX_PORT) {
      console.warn(`⚠️ Port ${port} đang được dùng, thử port ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    console.error('❌ Không thể khởi động server:', error.message);
    process.exit(1);
  });
};

startServer(START_PORT);
