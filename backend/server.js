const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();


console.log('DEBUG MONGODB_URI:', process.env.MONGODB_URI);
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded files (images/evidence)
// Helmet sets Cross-Origin-Resource-Policy which can block images across origins (e.g. 3000 -> 5000).
app.use(
    '/uploads',
    (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
    },
    express.static(path.join(__dirname, 'uploads'))
);

// Rate limiting - only apply in production
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use('/api/', limiter);
}

// Routes
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

const bannerRoutes = require('./routes/bannerRoutes');
const newsRoutes = require('./routes/newsRoutes');

app.use('/api/profiles', profileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/marketplace', marketplaceRoutes);

app.use('/api/banners', bannerRoutes);
app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Database connection: create one connection per process and reuse in serverless
const connectDB = require('./config/database');
if (mongoose.connection.readyState === 0) {
    // Not connected yet
    connectDB().catch((err) => {
        console.error('❌ Lỗi kết nối MongoDB:', err);
    });
}

// Export Express app for both local and serverless usage
module.exports = app;

