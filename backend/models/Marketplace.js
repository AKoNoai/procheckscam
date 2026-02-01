const mongoose = require('mongoose');

const marketplaceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    priceUnit: {
        type: String,
        default: 'VND'
    },
    images: [{
        type: String // URL to images
    }],
    category: {
        type: String,
        enum: ['account', 'item', 'service', 'other'],
        default: 'other'
    },
    contact: {
        phone: String,
        facebook: String,
        messenger: String,
        zalo: String,
        telegram: String,
        email: String
    },
    sellerName: {
        type: String,
        required: true,
        trim: true
    },
    sellerPhone: {
        type: String,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'sold'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for search
marketplaceSchema.index({ title: 'text', description: 'text' });
marketplaceSchema.index({ status: 1, createdAt: -1 });
marketplaceSchema.index({ category: 1 });
marketplaceSchema.index({ expiresAt: 1 });

marketplaceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Marketplace', marketplaceSchema);
