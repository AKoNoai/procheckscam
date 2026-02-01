const News = require('../models/News');

// Create news article
exports.createNews = async (req, res) => {
    try {
        const body = req.body || {};
        
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/news/${req.file.filename}`;
        }

        const payload = {
            title: body.title,
            excerpt: body.excerpt,
            content: body.content,
            category: body.category || 'news',
            image: imagePath || body.image,
            author: req.user?._id,
            authorName: req.user?.fullName || 'Admin',
            status: body.status || 'published',
            isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
            publishedAt: body.publishedAt || new Date()
        };

        const news = new News(payload);
        await news.save();

        res.status(201).json({ 
            success: true, 
            data: news,
            message: 'Tạo tin tức thành công'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get public news (published only)
exports.getPublicNews = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const query = { status: 'published' };

        if (category && category !== 'all') {
            query.category = category;
        }

        const news = await News.find(query)
            .sort({ isFeatured: -1, publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await News.countDocuments(query);

        res.json({
            success: true,
            data: news,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single news article
exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
        }

        // Only show published news to public
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super-admin');
        if (news.status !== 'published' && !isAdmin) {
            return res.status(404).json({ success: false, message: 'Tin tức không tồn tại' });
        }

        // Increment view count
        if (news.status === 'published') {
            news.views += 1;
            await news.save();
        }

        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all news
exports.getAllNews = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, category } = req.query;
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }
        if (category && category !== 'all') {
            query.category = category;
        }

        const news = await News.find(query)
            .populate('author', 'fullName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await News.countDocuments(query);

        res.json({
            success: true,
            data: news,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Update news
exports.updateNews = async (req, res) => {
    try {
        const body = req.body || {};
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
        }

        // Update fields
        if (body.title) news.title = body.title;
        if (body.excerpt) news.excerpt = body.excerpt;
        if (body.content) news.content = body.content;
        if (body.category) news.category = body.category;
        if (body.status) news.status = body.status;
        if (body.isFeatured !== undefined) {
            news.isFeatured = body.isFeatured === 'true' || body.isFeatured === true;
        }
        
        // Update image if uploaded
        if (req.file) {
            news.image = `/uploads/news/${req.file.filename}`;
        } else if (body.image) {
            news.image = body.image;
        }

        await news.save();

        res.json({ 
            success: true, 
            data: news,
            message: 'Cập nhật tin tức thành công'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete news
exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
        }

        res.json({ 
            success: true, 
            message: 'Đã xóa tin tức'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get news stats
exports.getStats = async (req, res) => {
    try {
        const [publishedCount, draftCount, totalViews] = await Promise.all([
            News.countDocuments({ status: 'published' }),
            News.countDocuments({ status: 'draft' }),
            News.aggregate([
                { $group: { _id: null, totalViews: { $sum: '$views' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                published: publishedCount,
                draft: draftCount,
                totalViews: totalViews[0]?.totalViews || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
