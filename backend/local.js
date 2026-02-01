require('dotenv').config();
const app = require('./server');

const PORT = process.env.PORT || 5001;

// Start scheduled job only in local/long-running server mode
try {
  const { startExpireJob } = require('./jobs/expireListings');
  startExpireJob();
  console.log('🔧 Expiry job started (local runtime)');
} catch (e) {
  console.error('Failed to start expiry job', e);
}

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
});
