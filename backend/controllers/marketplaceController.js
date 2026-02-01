const Marketplace = require('../models/Marketplace');
const MarketplaceComment = require('../models/MarketplaceComment');

// Create new marketplace listing
exports.createListing = async (req, res) => {
    try {
        const body = req.body || {};
        
        const uploadedImages = (req.files || []).map((f) => `/uploads/marketplace/${f.filename}`);
        const bodyImages = Array.isArray(body.images) ? body.images : (typeof body.images === 'string' ? [body.images] : []);

        const contact = {
            phone: body.contactPhone || body.contact?.phone,
            facebook: body.contactFacebook || body.contact?.facebook,
            messenger: body.contactMessenger || body.contact?.messenger,
            zalo: body.contactZalo || body.contact?.zalo,
            telegram: body.contactTelegram || body.contact?.telegram,
            email: body.contactEmail || body.contact?.email
        };

        const payload = {
            title: body.title,
            description: body.description,
            price: Number(body.price) || 0,
            priceUnit: body.priceUnit || 'VND',
            images: [...bodyImages, ...uploadedImages],
            category: body.category || 'other',
            contact,
            sellerName: body.sellerName,
            sellerPhone: body.sellerPhone,
            userId: req.user?._id
        };

        const listing = new Marketplace(payload);
        await listing.save();

        res.status(201).json({ 
            success: true, 
            data: listing,
            message: 'Đăng bán thành công! Vui lòng chờ Admin phê duyệt.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get public approved listings
exports.getPublicListings = async (req, res) => {
    try {
        const { page = 1, limit = 12, category, search } = req.query;
        const query = { status: 'approved' };

        if (category && category !== 'all') {
            query.category = category;
        }

        let useTextSearch = false;
        if (search) {
            // Thử tìm kiếm bằng $text
            query.$text = { $search: search };
            useTextSearch = true;
        }

        // Chỉ lấy những bài đã được phê duyệt và chưa hết hạn
        query.expiresAt = { $gt: new Date() };

        let listings = await Marketplace.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ isFeatured: -1, createdAt: -1 });

        let count = await Marketplace.countDocuments(query);

        // Nếu có search và không ra kết quả, thử tìm gần đúng bằng regex
        if (search && listings.length === 0) {
            // Xóa $text khỏi query, thay bằng regex cho title
            delete query.$text;
            query.title = { $regex: search, $options: 'i' };
            listings = await Marketplace.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ isFeatured: -1, createdAt: -1 });
            count = await Marketplace.countDocuments(query);
        }

        res.json({
            success: true,
            data: listings,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get listing detail
exports.getListing = async (req, res) => {
    try {
        const listing = await Marketplace.findById(req.params.id).populate('userId', 'username');

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super-admin');
        const isOwner = req.user && listing.userId && listing.userId._id.toString() === req.user._id.toString();

        // Only show pending/rejected to admin or owner
        if (listing.status !== 'approved' && !isAdmin && !isOwner) {
            return res.status(404).json({ success: false, message: 'Tin đăng chưa được phê duyệt' });
        }

        // Nếu đã hết hạn và người xem không phải admin/owner => 404
        if (listing.expiresAt && listing.expiresAt < new Date() && !isAdmin && !isOwner) {
            return res.status(404).json({ success: false, message: 'Tin đăng đã hết hạn' });
        }

        // Increment view count
        if (listing.status === 'approved') {
            listing.views += 1;
            await listing.save();
        }

        res.json({ success: true, data: listing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all listings
exports.getAllListings = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = status && status !== 'all' ? { status } : {};

        const listings = await Marketplace.find(query)
            .populate('userId', 'username')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Marketplace.countDocuments(query);

        res.json({
            success: true,
            data: listings,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Approve listing
exports.approveListing = async (req, res) => {
    try {
        const listing = await Marketplace.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        listing.status = 'approved';
        listing.approvedAt = new Date();
        listing.approvedBy = req.user._id;
        // Bài đăng hết hạn sau 7 ngày kể từ khi được phê duyệt
        listing.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        listing.rejectionReason = null;
        await listing.save();

        res.json({ 
            success: true, 
            data: listing,
            message: 'Đã phê duyệt tin đăng'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Reject listing
exports.rejectListing = async (req, res) => {
    try {
        const listing = await Marketplace.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        listing.status = 'rejected';
        listing.rejectionReason = req.body.reason || 'Vi phạm quy định';
        await listing.save();

        res.json({ 
            success: true, 
            data: listing,
            message: 'Đã từ chối tin đăng'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete listing
exports.deleteListing = async (req, res) => {
    try {
        const listing = await Marketplace.findByIdAndDelete(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        // Delete related comments
        await MarketplaceComment.deleteMany({ marketplaceId: req.params.id });

        res.json({ 
            success: true, 
            message: 'Đã xóa tin đăng'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get comments for a listing
exports.getComments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const marketplaceId = req.params.id;

        const comments = await MarketplaceComment.find({ marketplaceId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await MarketplaceComment.countDocuments({ marketplaceId });

        res.json({
            success: true,
            data: comments,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add comment to listing
exports.addComment = async (req, res) => {
    try {
        const { nickname, content } = req.body;
        const marketplaceId = req.params.id;

        // Check if listing exists and is approved
        const listing = await Marketplace.findById(marketplaceId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        if (listing.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Không thể bình luận tin đăng chưa được phê duyệt' });
        }

        const comment = new MarketplaceComment({
            marketplaceId,
            nickname: nickname || 'Ẩn danh',
            content,
            userId: req.user?._id
        });

        await comment.save();

        // Update comment count
        listing.commentCount += 1;
        await listing.save();

        res.status(201).json({ 
            success: true, 
            data: comment,
            message: 'Đã thêm bình luận'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete comment (admin only)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await MarketplaceComment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }

        const listing = await Marketplace.findById(comment.marketplaceId);
        if (listing) {
            listing.commentCount = Math.max(0, listing.commentCount - 1);
            await listing.save();
        }

        await MarketplaceComment.findByIdAndDelete(req.params.commentId);

        res.json({ 
            success: true, 
            message: 'Đã xóa bình luận'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get marketplace stats
exports.getStats = async (req, res) => {
    try {
        const [approvedCount, pendingCount, soldCount, totalViews] = await Promise.all([
            Marketplace.countDocuments({ status: 'approved' }),
            Marketplace.countDocuments({ status: 'pending' }),
            Marketplace.countDocuments({ status: 'sold' }),
            Marketplace.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: null, totalViews: { $sum: '$views' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                approved: approvedCount,
                pending: pendingCount,
                sold: soldCount,
                totalViews: totalViews[0]?.totalViews || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark as sold
exports.markAsSold = async (req, res) => {
    try {
        const listing = await Marketplace.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super-admin');
        const isOwner = req.user && listing.userId && listing.userId.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ success: false, message: 'Không có quyền thực hiện' });
        }

        listing.status = 'sold';
        await listing.save();

        res.json({ 
            success: true, 
            data: listing,
            message: 'Đã đánh dấu là đã bán'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
