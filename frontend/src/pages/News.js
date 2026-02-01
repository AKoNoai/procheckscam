import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { API_URL } from '../services/api';

const API_BASE_URL = API_URL.replace(/\/api$/, '');

const categoryColors = {
    'Cảnh báo': '#f44336',
    'Hướng dẫn': '#2196F3',
    'Thống kê': '#9C27B0',
    'Tin tức': '#4CAF50',
    'Thông báo': '#FF9800'
};

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [category, setCategory] = useState('');

    const fetchNews = useCallback(async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const params = new URLSearchParams();
            const limit = 6;
            params.append('page', pageNum);
            params.append('limit', limit);
            if (category) params.append('category', category);

            const response = await fetch(`${API_URL}/news/public?${params}`);
            const data = await response.json();

            if (data.success) {
                const items = data.data || [];
                if (append) {
                    setNews(prev => [...prev, ...items]);
                } else {
                    setNews(items);
                }

                // Safely handle missing pagination from API
                if (data.pagination && typeof data.pagination.page !== 'undefined' && typeof data.pagination.pages !== 'undefined') {
                    setHasMore(data.pagination.page < data.pagination.pages);
                } else {
                    // fallback: if returned items equal limit, assume there may be more
                    setHasMore(items.length === limit);
                }
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [category]);

    useEffect(() => {
        setPage(1);
        fetchNews(1, false);
    }, [fetchNews]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(nextPage, true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="news-page">
            <Header />
            
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: 'white',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px' }}>
                        <i className="fas fa-newspaper"></i> Tin Tức
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>
                        Cập nhật tin tức về lừa đảo và bảo mật mới nhất
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Category Filter */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    marginBottom: '30px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => setCategory('')}
                        style={{
                            padding: '8px 20px',
                            border: category === '' ? 'none' : '1px solid #e0e0e0',
                            borderRadius: '20px',
                            background: category === '' ? '#2196F3' : 'white',
                            color: category === '' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Tất cả
                    </button>
                    {Object.keys(categoryColors).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                padding: '8px 20px',
                                border: category === cat ? 'none' : '1px solid #e0e0e0',
                                borderRadius: '20px',
                                background: category === cat ? categoryColors[cat] : 'white',
                                color: category === cat ? 'white' : '#666',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '15px' }}></i>
                        <p>Đang tải tin tức...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                        <i className="fas fa-newspaper" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}></i>
                        <p style={{ fontSize: '18px' }}>Chưa có tin tức nào</p>
                    </div>
                ) : (
                    <>
                        {/* News Grid */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '25px' 
                        }}>
                            {news.map(item => (
                                <Link 
                                    to={`/news/${item._id}`}
                                    key={item._id}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <article 
                                        style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                            cursor: 'pointer',
                                            height: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                        }}
                                    >
                                        {/* Image */}
                                        <div style={{
                                            height: '180px',
                                            background: item.image 
                                                ? `url(${API_BASE_URL}${item.image}) center/cover`
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {!item.image && (
                                                <i className="fas fa-newspaper" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.5)' }}></i>
                                            )}
                                            {item.isFeatured && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: '#FF9800',
                                                    color: 'white',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}>
                                                    <i className="fas fa-star"></i> Nổi bật
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    background: categoryColors[item.category] || '#888',
                                                    color: 'white'
                                                }}>
                                                    {item.category}
                                                </span>
                                            </div>
                                            <h3 style={{ 
                                                fontSize: '18px', 
                                                fontWeight: '600', 
                                                marginBottom: '10px',
                                                color: '#333',
                                                lineHeight: 1.4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {item.title}
                                            </h3>
                                            <p style={{ 
                                                color: '#666', 
                                                fontSize: '14px', 
                                                lineHeight: 1.6,
                                                marginBottom: '15px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {item.excerpt || item.content.substring(0, 150)}
                                            </p>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                color: '#888',
                                                fontSize: '13px'
                                            }}>
                                                <span>
                                                    <i className="far fa-calendar"></i> {formatDate(item.createdAt)}
                                                    <span style={{ marginLeft: '15px' }}>
                                                        <i className="far fa-eye"></i> {item.views}
                                                    </span>
                                                </span>
                                                <span style={{ color: '#2196F3', fontWeight: '500' }}>
                                                    Đọc thêm <i className="fas fa-arrow-right"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {/* Load more */}
                        {hasMore && (
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <button 
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    style={{
                                        padding: '12px 40px',
                                        background: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '25px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                                        opacity: loadingMore ? 0.7 : 1
                                    }}
                                >
                                    {loadingMore ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Đang tải...</>
                                    ) : (
                                        'Xem thêm tin tức'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default News;
