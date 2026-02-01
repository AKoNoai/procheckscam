const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, isAdmin, optionalAuthenticate } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '..', 'uploads', 'reports');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadRoot);
	},
	filename: (req, file, cb) => {
		const safeBase = path
			.basename(file.originalname, path.extname(file.originalname))
			.replace(/[^a-zA-Z0-9-_]+/g, '-')
			.slice(0, 60);
		const ext = (path.extname(file.originalname) || '').toLowerCase();
		cb(null, `${Date.now()}-${safeBase}${ext}`);
	}
});

const fileFilter = (req, file, cb) => {
	const allowed = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
	const ext = (path.extname(file.originalname) || '').toLowerCase();
	if (!allowed.has(ext)) {
		return cb(new Error('Chỉ cho phép tải ảnh (jpg, jpeg, png, gif, webp).'));
	}
	cb(null, true);
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
		files: 8
	}
});

const maybeUploadEvidence = (req, res, next) => {
	if (req.is('multipart/form-data')) {
		return upload.array('evidence', 8)(req, res, next);
	}
	return next();
};

router.post('/', maybeUploadEvidence, reportController.createReport);

// Public endpoints
router.get('/stats', reportController.getReportStats);
router.get('/public', reportController.getPublicReports);
router.get('/last7days', reportController.getReportsLast7Days);
router.get('/profile/:profileId', optionalAuthenticate, reportController.getReportsByProfile);
router.get('/:id/comments', reportController.getReportComments);
router.post('/:id/comments', express.json(), reportController.addReportComment);
router.get('/:id', optionalAuthenticate, reportController.getReport);

// Admin endpoints
router.get('/', authenticate, isAdmin, reportController.getAllReports);
router.put('/:id/status', authenticate, isAdmin, reportController.updateReportStatus);
router.delete('/:id', authenticate, isAdmin, reportController.deleteReport);

module.exports = router;
