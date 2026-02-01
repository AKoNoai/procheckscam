// Dedicated endpoint to run expiry job once (for Vercel Cron)
const { deleteExpiredListings } = require('../jobs/expireListings');

module.exports = async (req, res) => {
	try {
		await deleteExpiredListings();
		res.json({ success: true });
	} catch (err) {
		console.error('Expire job error:', err);
		res.status(500).json({ success: false, message: err.message || 'Internal Error' });
	}
};
