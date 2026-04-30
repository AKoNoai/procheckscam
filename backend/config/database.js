const mongoose = require('mongoose');
const { normalizeMongoUri } = require('./mongoUri');

const connectDB = async () => {
    try {
        const mongoUri = normalizeMongoUri(process.env.MONGODB_URI);
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);

        // Keep the app booting in local development so the server can still start
        // even when MongoDB is unavailable.
        return null;
    }
};

module.exports = connectDB;
