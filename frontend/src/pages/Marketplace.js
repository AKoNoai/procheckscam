import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import './Marketplace.css';
import Banner from '../components/Banner';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'item', label: 'Vật phẩm' },
    { value: 'service', label: 'Dịch vụ' },
    { value: 'other', label: 'Khác' }
];

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
};

function Marketplace() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ approved: 0, pending: 0 });

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (category !== 'all') params.category = category;
            if (search) params.search = search;

            const response = await api.get('/marketplace/public', { params });
            setListings(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    }, [category, page, search]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/marketplace/stats');
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchListings();
        fetchStats();
    }, [fetchListings, fetchStats]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchListings();
    };

    return (
        <div className="marketplace-page">
            <Header />
            
            <div className="marketplace-header">
                <h1><i className="fas fa-store"></i> Chợ Buôn CS</h1>
                <p>Mua bán trao đổi uy tín - {stats.approved} tin đang bán</p>
            </div>

            <div className="marketplace-actions">
                <Link to="/marketplace/create" className="btn-create-listing">
                    <i className="fas fa-plus"></i>
                    Đăng tin bán
                </Link>
            </div>

            <div className="marketplace-filters">
                <div className="filter-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`filter-tab ${category === cat.value ? 'active' : ''}`}
                            onClick={() => {
                                setCategory(cat.value);
                                setPage(1);
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="marketplace-search">
                <form onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="marketplace-loading">
                    <div className="spinner"></div>
                </div>
            ) : listings.length === 0 ? (
                <div className="marketplace-empty">
                    <i className="fas fa-box-open"></i>
                    <h3>Chưa có tin đăng nào</h3>
                    <p>Hãy là người đầu tiên đăng tin bán!</p>
                </div>
            ) : (
                <>
                    <div className="marketplace-grid">
                        {listings.map(listing => (
                            <Link 
                                to={`/marketplace/${listing._id}`} 
                                key={listing._id} 
                                className="listing-card"
                            >
                                <div className="listing-image">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img 
                                            src={getImageUrl(listing.images[0])} 
                                            alt={listing.title}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="listing-image-placeholder" 
                                        style={{ display: listing.images && listing.images.length > 0 ? 'none' : 'flex' }}
                                    >
                                        <i className="fas fa-image"></i>
                                    </div>
                                    
                                    {listing.isFeatured && (
                                        <span className="listing-badge featured">
                                            <i className="fas fa-star"></i> Nổi bật
                                        </span>
                                    )}
                                    
                                    {listing.status === 'sold' && (
                                        <span className="listing-badge sold">Đã bán</span>
                                    )}
                                    
                                    {listing.images && listing.images.length > 1 && (
                                        <span className="listing-image-count">
                                            <i className="fas fa-images"></i>
                                            {listing.images.length}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="listing-content">
                                    <h3 className="listing-title">{listing.title}</h3>
                                    <div className="listing-price">
                                        {formatPrice(listing.price)} {listing.priceUnit || 'VND'}
                                    </div>
                                    <div className="listing-meta">
                                        <span className="listing-seller">
                                            <i className="fas fa-user"></i>
                                            {listing.sellerName}
                                        </span>
                                        <div className="listing-stats">
                                            <span>
                                                <i className="fas fa-eye"></i>
                                                {listing.views || 0}
                                            </span>
                                            <span>
                                                <i className="fas fa-comment"></i>
                                                {listing.commentCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setPage(p => p - 1)} 
                                disabled={page === 1}
                            >
                                <i className="fas fa-chevron-left"></i> Trước
                            </button>
                            <span>Trang {page} / {totalPages}</span>
                            <button 
                                onClick={() => setPage(p => p + 1)} 
                                disabled={page === totalPages}
                            >
                                Sau <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </>
            )}
                    {/* banners */}
                    <Banner />
                </div>
    );
}

export default Marketplace;
