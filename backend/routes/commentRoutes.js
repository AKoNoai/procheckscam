const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Public: get recent comments across verified reports
router.get('/recent', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);

        const comments = await Comment.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
                path: 'reportId',
                select: 'status channel targetName targetContact createdAt'
            });

        const filtered = (comments || []).filter((c) => c.reportId && c.reportId.status === 'verified');

        res.json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
