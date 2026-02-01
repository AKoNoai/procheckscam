const Profile = require('../models/Profile');
const Report = require('../models/Report');


// Search profiles and scam reports by phone, facebook, bank account, name (fuzzy if no result)
exports.searchProfiles = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập thông tin tìm kiếm' 
            });
        }

        // Tìm trong Profile (chính xác)
        let profiles = await Profile.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { 'contactInfo.phone': { $regex: query, $options: 'i' } },
                { 'contactInfo.facebook.id': { $regex: query, $options: 'i' } },
                { 'contactInfo.zalo': { $regex: query, $options: 'i' } },
                { 'bankAccounts.accountNumber': { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        // Tìm trong Report (cảnh báo scam)
        let scamReports = await Report.find({
            status: 'verified',
            $or: [
                { 'targetContact.bankAccount': { $regex: query, $options: 'i' } },
                { 'targetContact.phone': { $regex: query, $options: 'i' } },
                { 'targetContact.facebook': { $regex: query, $options: 'i' } },
                { targetName: { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        // Nếu không có kết quả, thử fuzzy search bằng fuse.js
        if (profiles.length === 0 && scamReports.length === 0) {
            const Fuse = require('fuse.js');
            // Lấy tất cả profile và report (giới hạn 200)
            const allProfiles = await Profile.find({}).limit(200);
            const allReports = await Report.find({ status: 'verified' }).limit(200);
            // Fuzzy cho profile
            const profileFuse = new Fuse(allProfiles, {
                keys: ['name', 'contactInfo.phone', 'contactInfo.facebook.id', 'contactInfo.zalo', 'bankAccounts.accountNumber'],
                threshold: 0.4
            });
            profiles = profileFuse.search(query).map(r => r.item);
            // Fuzzy cho report
            const reportFuse = new Fuse(allReports, {
                keys: ['targetContact.bankAccount', 'targetContact.phone', 'targetContact.facebook', 'targetName'],
                threshold: 0.4
            });
            scamReports = reportFuse.search(query).map(r => r.item);
        }

        res.json({ 
            success: true, 
            data: profiles,
            count: profiles.length,
            scamReports
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Quick check by phone number
exports.checkPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const profile = await Profile.findOne({ 
            'contactInfo.phone': phone 
        });

        if (!profile) {
            return res.json({ 
                success: true, 
                found: false,
                message: 'Không tìm thấy thông tin' 
            });
        }

        res.json({ 
            success: true, 
            found: true,
            data: profile 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Quick check by facebook
exports.checkFacebook = async (req, res) => {
    try {
        const { fbId } = req.params;
        const profile = await Profile.findOne({ 
            'contactInfo.facebook.id': fbId 
        });

        if (!profile) {
            return res.json({ 
                success: true, 
                found: false,
                message: 'Không tìm thấy thông tin' 
            });
        }

        res.json({ 
            success: true, 
            found: true,
            data: profile 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
