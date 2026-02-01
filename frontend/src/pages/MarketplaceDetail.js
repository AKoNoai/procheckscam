import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import './MarketplaceDetail.css';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
};

const categoryLabels = {
    account: 'Tài khoản',
    item: 'Vật phẩm',
    service: 'Dịch vụ',
    other: 'Khác'
};

function MarketplaceDetail() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentForm, setCommentForm] = useState({ nickname: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    const lastFetchedId = useRef(null);

    const fetchListing = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/marketplace/${id}`);
            setListing(response.data.data);
        } catch (error) {
            console.error('Error fetching listing:', error);
            setError(error.response?.data?.message || 'Không thể tải tin đăng');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchComments = useCallback(async () => {
        try {
            const response = await api.get(`/marketplace/${id}/comments`);
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, [id]);

    useEffect(() => {
        // Prevent duplicate fetches for the same id (React StrictMode may call effects twice)
        if (lastFetchedId.current === id) return;
        lastFetchedId.current = id;

        fetchListing();
        fetchComments();
    }, [id, fetchListing, fetchComments]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentForm.content.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/marketplace/${id}/comments`, {
                nickname: commentForm.nickname || 'Ẩn danh',
                content: commentForm.content
            });
            setCommentForm({ nickname: '', content: '' });
            fetchComments();
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể gửi bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="marketplace-detail-page">
                <Header />
                <div className="detail-loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="marketplace-detail-page">
                <Header />
                <div className="detail-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <h3>{error || 'Không tìm thấy tin đăng'}</h3>
                    <Link to="/marketplace" className="detail-back-btn">
                        <i className="fas fa-arrow-left"></i> Quay lại Chợ
                    </Link>
                </div>
            </div>
        );
    }

    const images = listing.images || [];
    const contact = listing.contact || {};

    return (
        <div className="marketplace-detail-page">
            <Header />
            
            <Link to="/marketplace" className="detail-back-btn">
                <i className="fas fa-arrow-left"></i> Quay lại Chợ Buôn CS
            </Link>

            <div className="detail-container">
                {/* Image Gallery */}
                <div className="detail-gallery">
                    <div className="main-image">
                        {images.length > 0 ? (
                            <img 
                                src={getImageUrl(images[selectedImage])} 
                                alt={listing.title}
                            />
                        ) : (
                            <div className="main-image-placeholder">
                                <i className="fas fa-image"></i>
                            </div>
                        )}
                    </div>
                    
                    {images.length > 1 && (
                        <div className="image-thumbnails">
                            {images.map((img, index) => (
                                <div 
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={getImageUrl(img)} alt={`Ảnh ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Listing Info */}
                <div className="detail-info">
                    {listing.status === 'pending' && (
                        <span className="detail-status pending">
                            <i className="fas fa-clock"></i> Chờ duyệt
                        </span>
                    )}
                    {listing.status === 'sold' && (
                        <span className="detail-status sold">
                            <i className="fas fa-check"></i> Đã bán
                        </span>
                    )}
                    
                    <h1 className="detail-title">{listing.title}</h1>
                    
                    <div className="detail-price">
                        {formatPrice(listing.price)} {listing.priceUnit || 'VND'}
                    </div>

                    <span className="detail-category">
                        {categoryLabels[listing.category] || listing.category}
                    </span>

                    <div className="detail-meta">
                        <span>
                            <i className="fas fa-user"></i>
                            {listing.sellerName}
                        </span>
                        <span>
                            <i className="fas fa-calendar"></i>
                            {formatDate(listing.createdAt)}
                        </span>
                        <span>
                            <i className="fas fa-eye"></i>
                            {listing.views || 0} lượt xem
                        </span>
                        <span>
                            <i className="fas fa-comment"></i>
                            {listing.commentCount || 0} bình luận
                        </span>
                    </div>

                    <div className="detail-description">
                        <h3>Mô tả</h3>
                        <p>{listing.description}</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="detail-contact">
                    <h3>
                        <i className="fas fa-address-book"></i>
                        Thông tin liên hệ
                    </h3>
                    <div className="contact-list">
                        {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="contact-item phone">
                                <i className="fas fa-phone"></i>
                                <span>{contact.phone}</span>
                            </a>
                        )}
                        {contact.zalo && (
                            <a 
                                href={`https://zalo.me/${contact.zalo}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-item zalo"
                            >
                                <i className="fas fa-comment-dots"></i>
                                <span>Zalo: {contact.zalo}</span>
                            </a>
                        )}
                        {contact.facebook && (
                            <a 
                                href={contact.facebook.startsWith('http') ? contact.facebook : `https://facebook.com/${contact.facebook}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-item facebook"
                            >
                                <i className="fab fa-facebook"></i>
                                <span>Facebook</span>
                            </a>
                        )}
                        {contact.messenger && (
                            <a 
                                href={`https://m.me/${contact.messenger}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-item messenger"
                            >
                                <i className="fab fa-facebook-messenger"></i>
                                <span>Messenger</span>
                            </a>
                        )}
                        {contact.telegram && (
                            <a 
                                href={`https://t.me/${contact.telegram}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-item telegram"
                            >
                                <i className="fab fa-telegram"></i>
                                <span>Telegram: @{contact.telegram}</span>
                            </a>
                        )}
                        {contact.email && (
                            <a href={`mailto:${contact.email}`} className="contact-item email">
                                <i className="fas fa-envelope"></i>
                                <span>{contact.email}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="detail-comments">
                    <h3>
                        <i className="fas fa-comments"></i>
                        Bình luận ({comments.length})
                    </h3>

                    {listing.status === 'approved' && (
                        <form className="comment-form" onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                placeholder="Tên của bạn (không bắt buộc)"
                                value={commentForm.nickname}
                                onChange={(e) => setCommentForm({ ...commentForm, nickname: e.target.value })}
                                maxLength={50}
                            />
                            <textarea
                                placeholder="Viết bình luận của bạn..."
                                value={commentForm.content}
                                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                required
                                maxLength={1000}
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Đang gửi...</>
                                ) : (
                                    <><i className="fas fa-paper-plane"></i> Gửi bình luận</>
                                )}
                            </button>
                        </form>
                    )}

                    {comments.length === 0 ? (
                        <div className="no-comments">
                            <i className="fas fa-comment-slash"></i>
                            <p>Chưa có bình luận nào</p>
                        </div>
                    ) : (
                        <div className="comment-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment-item">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            <i className="fas fa-user-circle"></i> {comment.nickname}
                                        </span>
                                        <span className="comment-date">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MarketplaceDetail;
