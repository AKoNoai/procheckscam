const Profile = require('../models/Profile');

// Get profile by ID
exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new profile
exports.createProfile = async (req, res) => {
    try {
        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json({ success: true, data: profile });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all profiles
exports.getAllProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 10, riskLevel } = req.query;
        const query = riskLevel ? { riskLevel } : {};
        
        const profiles = await Profile.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Profile.countDocuments(query);

        res.json({
            success: true,
            data: profiles,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
        }
        res.json({ success: true, message: 'Đã xóa hồ sơ thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
