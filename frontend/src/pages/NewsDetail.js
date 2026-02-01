import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { API_URL } from '../services/api';
import './NewsDetail.css';

const API_BASE_URL = API_URL.replace(/\/api$/, '');

const categoryColors = {
    'Cảnh báo': '#f44336',
    'Hướng dẫn': '#2196F3',
    'Thống kê': '#9C27B0',
    'Tin tức': '#4CAF50',
    'Thông báo': '#FF9800'
};

const NewsDetail = () => {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);

    const lastFetchedId = useRef(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/news/${id}`);
                const data = await response.json();

                if (data.success) {
                    setNews(data.data);
                    // Fetch related news
                    fetchRelatedNews(data.data.category, data.data._id);
                } else {
                    setError(data.message || 'Không tìm thấy tin tức');
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Có lỗi xảy ra khi tải tin tức');
            } finally {
                setLoading(false);
            }
        };

        // Prevent duplicate fetches for the same id (React StrictMode may call effects twice)
        if (lastFetchedId.current === id) return;
        lastFetchedId.current = id;

        fetchNews();
    }, [id]);

    const fetchRelatedNews = async (category, excludeId) => {
        try {
            const response = await fetch(`${API_URL}/news/public?category=${category}&limit=3`);
            const data = await response.json();
            if (data.success) {
                setRelatedNews(data.data.filter(item => item._id !== excludeId).slice(0, 3));
            }
        } catch (err) {
            console.error('Error fetching related news:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="news-detail-page">
                <Header />
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Đang tải tin tức...</p>
                </div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="news-detail-page">
                <Header />
                <div className="error-container">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error || 'Không tìm thấy tin tức'}</p>
                    <Link to="/news" className="back-btn">
                        <i className="fas fa-arrow-left"></i> Quay lại trang tin tức
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="news-detail-page">
            <Header />
            
            <div className="news-detail-container">
                <div className="news-detail-content">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <i className="fas fa-chevron-right"></i>
                        <Link to="/news">Tin tức</Link>
                        <i className="fas fa-chevron-right"></i>
                        <span>{news.category}</span>
                    </div>

                    {/* Article Header */}
                    <header className="article-header">
                        <span 
                            className="category-badge"
                            style={{ background: categoryColors[news.category] || '#888' }}
                        >
                            {news.category}
                        </span>
                        {news.isFeatured && (
                            <span className="featured-badge">
                                <i className="fas fa-star"></i> Nổi bật
                            </span>
                        )}
                        <h1>{news.title}</h1>
                        <div className="article-meta">
                            <span><i className="far fa-calendar"></i> {formatDate(news.createdAt)}</span>
                            <span><i className="far fa-eye"></i> {news.views} lượt xem</span>
                            {news.author && (
                                <span><i className="far fa-user"></i> {news.author.name}</span>
                            )}
                        </div>
                    </header>

                    {/* Featured Image */}
                    {news.image && (
                        <div className="article-image">
                            <img src={`${API_BASE_URL}${news.image}`} alt={news.title} />
                        </div>
                    )}

                    {/* Excerpt */}
                    {news.excerpt && (
                        <div className="article-excerpt">
                            {news.excerpt}
                        </div>
                    )}

                    {/* Content */}
                    <div className="article-body">
                        {news.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() && <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    {/* Share */}
                    <div className="article-share">
                        <span>Chia sẻ:</span>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="share-btn facebook">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${news.title}`} target="_blank" rel="noopener noreferrer" className="share-btn twitter">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${news.title}`} target="_blank" rel="noopener noreferrer" className="share-btn linkedin">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                        <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="share-btn copy">
                            <i className="fas fa-link"></i>
                        </button>
                    </div>

                    {/* Back Button */}
                    <div className="article-nav">
                        <Link to="/news" className="back-link">
                            <i className="fas fa-arrow-left"></i> Quay lại trang tin tức
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="news-detail-sidebar">
                    {/* Related News */}
                    {relatedNews.length > 0 && (
                        <div className="sidebar-section">
                            <h3>Tin liên quan</h3>
                            <div className="related-news">
                                {relatedNews.map(item => (
                                    <Link to={`/news/${item._id}`} key={item._id} className="related-item">
                                        <div 
                                            className="related-image"
                                            style={{
                                                background: item.image 
                                                    ? `url(${API_BASE_URL}${item.image}) center/cover`
                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}
                                        >
                                            {!item.image && <i className="fas fa-newspaper"></i>}
                                        </div>
                                        <div className="related-content">
                                            <h4>{item.title}</h4>
                                            <span className="related-date">
                                                <i className="far fa-calendar"></i> {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Categories */}
                    <div className="sidebar-section">
                        <h3>Danh mục</h3>
                        <div className="category-list">
                            {Object.entries(categoryColors).map(([cat, color]) => (
                                <Link 
                                    to={`/news?category=${cat}`} 
                                    key={cat}
                                    className="category-item"
                                >
                                    <span className="cat-dot" style={{ background: color }}></span>
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default NewsDetail;
