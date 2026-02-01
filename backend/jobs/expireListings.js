const Marketplace = require('../models/Marketplace');
const MarketplaceComment = require('../models/MarketplaceComment');

// Xóa các bài đăng đã hết hạn và xóa comment liên quan
async function deleteExpiredListings() {
    try {
        const now = new Date();

        // 1) Thiết lập expiresAt cho các bài đã phê duyệt nhưng chưa có expiresAt
        const missing = await Marketplace.find({ status: 'approved', expiresAt: { $exists: false } });
        for (const m of missing) {
            try {
                const base = m.approvedAt || m.createdAt || new Date();
                m.expiresAt = new Date(new Date(base).getTime() + 7 * 24 * 60 * 60 * 1000);
                await m.save();
                console.log(`🔧 Thiết lập expiresAt cho tin: ${m._id} => ${m.expiresAt}`);
            } catch (errSet) {
                console.error('Lỗi khi thiết lập expiresAt:', errSet);
            }
        }

        // 2) Xóa các bài đã hết hạn
        const expired = await Marketplace.find({ expiresAt: { $lte: now } });
        if (!expired.length) return;

        for (const l of expired) {
            try {
                await MarketplaceComment.deleteMany({ marketplaceId: l._id });
                await Marketplace.findByIdAndDelete(l._id);
                console.log(`✅ Đã xóa tin đăng hết hạn: ${l._id}`);
            } catch (innerErr) {
                console.error(`Lỗi khi xóa tin đăng ${l._id}:`, innerErr);
            }
        }
    } catch (err) {
        console.error('Lỗi trong job xóa bài hết hạn:', err);
    }
}

// Bắt đầu job (mặc định chạy mỗi 1 giờ)
function startExpireJob(intervalMs = 60 * 60 * 1000) {
    // Thực thi ngay khi khởi động
    deleteExpiredListings();
    // Sau đó chạy định kỳ
    setInterval(deleteExpiredListings, intervalMs);
}

module.exports = { startExpireJob, deleteExpiredListings };