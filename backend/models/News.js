const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    excerpt: {
        type: String,
        trim: true,
        maxlength: 500
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Cảnh báo', 'Tin tức', 'Hướng dẫn', 'Thông báo', 'Thống kê'],
        default: 'Tin tức'
    },
    image: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    authorName: {
        type: String,
        default: 'Admin'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    views: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: Date.now
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

newsSchema.index({ title: 'text', content: 'text' });
newsSchema.index({ status: 1, publishedAt: -1 });

newsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('News', newsSchema);
