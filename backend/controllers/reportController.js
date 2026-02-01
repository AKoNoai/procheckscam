const Report = require('../models/Report');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const asNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const asBool = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
    return false;
};

const mergeTargetContact = (body) => {
    const direct = (body && typeof body.targetContact === 'object' && body.targetContact) ? body.targetContact : {};

    return {
        ...direct,
        phone: body.targetPhone ?? direct.phone,
        facebook: body.targetFacebook ?? direct.facebook,
        zalo: body.targetZalo ?? direct.zalo,
        bankAccount: body.targetBankAccount ?? direct.bankAccount,
        bankName: body.targetBankName ?? direct.bankName,
        website: body.targetWebsite ?? direct.website
    };
};

// Create new report
exports.createReport = async (req, res) => {
    try {
        const body = req.body || {};

        const uploadedEvidence = (req.files || []).map((f) => `/uploads/reports/${f.filename}`);
        const bodyEvidence = Array.isArray(body.evidence) ? body.evidence : (typeof body.evidence === 'string' ? [body.evidence] : []);

        const payload = {
            reporterName: body.reporterName,
            reporterEmail: body.reporterEmail || undefined,
            reporterZalo: body.reporterZalo || undefined,
            reporterPhone: body.reporterPhone || undefined,

            targetName: body.targetName || undefined,
            targetContact: mergeTargetContact(body),

            channel: body.channel,
            reportType: body.reportType || 'scam',
            category: body.category || undefined,
            description: body.description,
            amount: asNumber(body.amount, 0),
            agreement: asBool(body.agreement),
            evidence: [...bodyEvidence, ...uploadedEvidence]
        };

        if (body.profileId) {
            payload.profileId = body.profileId;
        }

        const report = new Report(payload);
        await report.save();

        // Note: do not affect profile counters until admin verifies the report.

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Public: get verified reports only
exports.getPublicReports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = { status: 'verified' };

        const reports = await Report.find(query)
            .populate('profileId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit * 1);

        const count = await Report.countDocuments(query);

        res.json({
            success: true,
            data: reports,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public: quick stats for homepage
exports.getReportStats = async (req, res) => {
    try {
        // Đếm số tài khoản scam (đã duyệt, channel=bank, có số tài khoản)
        const bankScamCount = await Report.countDocuments({
            status: 'verified',
            channel: 'bank',
            'targetContact.bankAccount': { $exists: true, $ne: '' }
        });
        // Đếm số fb scam (đã duyệt, channel=bank, có targetContact.facebook)
        const fbScamCount = await Report.countDocuments({
            status: 'verified',
            channel: 'bank',
            'targetContact.facebook': { $exists: true, $ne: '' }
        });
        const [verifiedCount, pendingCount, commentCount] = await Promise.all([
            Report.countDocuments({ status: 'verified' }),
            Report.countDocuments({ status: 'pending' }),
            Comment.countDocuments({})
        ]);

        res.json({
            success: true,
            data: {
                verified: verifiedCount,
                pending: pendingCount,
                comments: commentCount,
                bankScamCount,
                fbScamCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public: get reports older than 7 days (reports that have existed for at least 7 days)
exports.getReportsLast7Days = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const reports = await Report.find({
            status: 'verified',
            createdAt: { $lte: sevenDaysAgo }
        })
            .populate('profileId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const count = await Report.countDocuments({
            status: 'verified',
            createdAt: { $lte: sevenDaysAgo }
        });

        res.json({
            success: true,
            data: reports,
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reports
exports.getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};
        
        const reports = await Report.find(query)
            .populate('profileId')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Report.countDocuments(query);

        res.json({
            success: true,
            data: reports,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get report by ID
exports.getReport = async (req, res) => {
    try {
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super-admin');

        // Check if request is from admin panel (via query param or header)
        const isAdminView = req.query.adminView === 'true' || req.header('X-Admin-View') === 'true';

        // Public view: always increment views (even for logged-in admins viewing public page)
        if (!isAdminView) {
            const report = await Report.findOneAndUpdate(
                { _id: req.params.id, status: 'verified' },
                { $inc: { views: 1 } },
                { new: true }
            ).populate('profileId');

            if (!report) {
                // If not found as verified, check if admin can view it
                if (isAdmin) {
                    const adminReport = await Report.findById(req.params.id).populate('profileId');
                    if (adminReport) {
                        return res.json({ success: true, data: adminReport });
                    }
                }
                return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
            }

            return res.json({ success: true, data: report });
        }

        // Admin panel view: can view all statuses, do not increment views
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }

        const report = await Report.findById(req.params.id).populate('profileId');
        if (!report) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
        }

        return res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const generateNickname = () => {
    const animals = ['Mèo', 'Cáo', 'Sói', 'Gấu', 'Hươu', 'Thỏ', 'Cú', 'Hổ', 'Chim', 'Rái cá'];
    const colors = ['Đỏ', 'Xanh', 'Vàng', 'Tím', 'Cam', 'Hồng', 'Đen', 'Trắng'];
    const a = animals[crypto.randomInt(0, animals.length)];
    const c = colors[crypto.randomInt(0, colors.length)];
    const n = crypto.randomInt(1000, 9999);
    return `${a} ${c} ${n}`;
};

// Public: get comments for a verified report
exports.getReportComments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const safeLimit = Math.min(parseInt(limit, 10) || 20, 50);

        const report = await Report.findById(req.params.id).select('status');
        if (!report || report.status !== 'verified') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
        }

        const comments = await Comment.find({ reportId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .skip((parseInt(page, 10) - 1) * safeLimit);

        const count = await Comment.countDocuments({ reportId: req.params.id });

        res.json({
            success: true,
            data: comments,
            totalPages: Math.ceil(count / safeLimit),
            currentPage: parseInt(page, 10),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public: add a comment to a verified report (auto nickname)
exports.addReportComment = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).select('status');
        if (!report || report.status !== 'verified') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
        }

        const nickname = (req.body.nickname || '').toString().trim() || generateNickname();
        const content = (req.body.content || '').toString().trim();
        if (!content) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung bình luận' });
        }

        const comment = await Comment.create({
            reportId: req.params.id,
            nickname: nickname.slice(0, 50),
            content: content.slice(0, 1000)
        });

        await Report.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
        }

        const prevStatus = report.status;
        
        // Use findByIdAndUpdate to avoid full validation on legacy documents
        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true, runValidators: false }
        );
        
        // Update profile counters only when crossing verified boundary
        if (report.profileId) {
            if (prevStatus !== 'verified' && status === 'verified') {
                await Profile.findByIdAndUpdate(report.profileId, {
                    $inc: { 'reportCount.negative': 1 }
                });
            }
            if (prevStatus === 'verified' && status !== 'verified') {
                await Profile.findByIdAndUpdate(report.profileId, {
                    $inc: { 'reportCount.negative': -1 }
                });
            }
        }
        
        res.json({ success: true, data: updatedReport });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a report (admin)
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
        }

        // If the report was verified and linked to a profile, decrement counters
        if (report.profileId && report.status === 'verified') {
            await Profile.findByIdAndUpdate(report.profileId, {
                $inc: { 'reportCount.negative': -1 }
            });
        }

        // Remove evidence files from disk (best-effort)
        if (Array.isArray(report.evidence)) {
            for (const ev of report.evidence) {
                try {
                    const filename = path.basename(ev);
                    const filePath = path.join(__dirname, '..', 'uploads', 'reports', filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    // ignore file-level errors
                }
            }
        }

        // Remove comments linked to this report
        await Comment.deleteMany({ reportId: req.params.id });

        await report.deleteOne();

        res.json({ success: true, message: 'Đã xóa báo cáo' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get reports by profile
exports.getReportsByProfile = async (req, res) => {
    try {
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super-admin');
        const query = isAdmin
            ? { profileId: req.params.profileId }
            : { profileId: req.params.profileId, status: 'verified' };

        const reports = await Report.find(query)
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
