const DEFAULT_DATABASE_NAME = 'checkscam';

const configureMongoDns = () => {
    const dns = require('dns');

    try {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
    } catch (error) {
        console.warn('⚠️ Không thể đặt DNS server tuỳ chỉnh, dùng DNS hệ thống:', error.message);
    }
};

const normalizeMongoUri = (rawUri) => {
    const fallbackUri = `mongodb://127.0.0.1:27017/${DEFAULT_DATABASE_NAME}`;
    const uri = (rawUri || fallbackUri).trim();

    try {
        const parsed = new URL(uri);

        if (!parsed.pathname || parsed.pathname === '/') {
            parsed.pathname = `/${DEFAULT_DATABASE_NAME}`;
        }

        return parsed.toString();
    } catch (error) {
        if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
            return `${uri.replace(/\/?$/, '')}/${DEFAULT_DATABASE_NAME}`;
        }

        return fallbackUri;
    }
};

module.exports = {
    DEFAULT_DATABASE_NAME,
    configureMongoDns,
    normalizeMongoUri
};