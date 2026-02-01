const mongoose = require('mongoose');

const marketplaceCommentSchema = new mongoose.Schema({
    marketplaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Marketplace',
        required: true,
        index: true
    },
    nickname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('MarketplaceComment', marketplaceCommentSchema);
