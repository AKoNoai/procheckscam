import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
};

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

const statusLabels = {
    pending: { label: 'Chờ duyệt', class: 'warning' },
    approved: { label: 'Đã duyệt', class: 'success' },
    rejected: { label: 'Từ chối', class: 'danger' },
    sold: { label: 'Đã bán', class: 'info' }
};

const categoryLabels = {
    account: 'Tài khoản',
    item: 'Vật phẩm',
    service: 'Dịch vụ',
    other: 'Khác'
};

function MarketplaceManagement() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({});
    const [selectedListing, setSelectedListing] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);


    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/marketplace', {
                params: { status: statusFilter, page, limit: 20 }
            });
            setListings(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => {
        fetchListings();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, page, fetchListings]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/marketplace/stats');
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Xác nhận phê duyệt tin đăng này?')) return;
        
        try {
            await api.patch(`/marketplace/${id}/approve`);
            fetchListings();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleReject = async () => {
        if (!selectedListing) return;
        
        try {
            await api.patch(`/marketplace/${selectedListing}/reject`, {
                reason: rejectReason
            });
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedListing(null);
            fetchListings();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa tin đăng này? Hành động này không thể hoàn tác.')) return;
        
        try {
            await api.delete(`/marketplace/${id}`);
            fetchListings();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <h1><i className="fas fa-store"></i> Quản lý Chợ Buôn CS</h1>
                </div>

                {/* Stats */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div className="stat-card" style={{ background: '#fff3cd', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '28px', margin: '0 0 5px', color: '#856404' }}>{stats.pending || 0}</h3>
                        <p style={{ margin: 0, color: '#856404' }}>Chờ duyệt</p>
                    </div>
                    <div className="stat-card" style={{ background: '#d4edda', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '28px', margin: '0 0 5px', color: '#155724' }}>{stats.approved || 0}</h3>
                        <p style={{ margin: 0, color: '#155724' }}>Đang bán</p>
                    </div>
                    <div className="stat-card" style={{ background: '#cce5ff', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '28px', margin: '0 0 5px', color: '#004085' }}>{stats.sold || 0}</h3>
                        <p style={{ margin: 0, color: '#004085' }}>Đã bán</p>
                    </div>
                    <div className="stat-card" style={{ background: '#e2e3e5', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '28px', margin: '0 0 5px', color: '#383d41' }}>{stats.totalViews || 0}</h3>
                        <p style={{ margin: 0, color: '#383d41' }}>Lượt xem</p>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['all', 'pending', 'approved', 'rejected', 'sold'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                background: statusFilter === status ? '#2196F3' : '#e0e0e0',
                                color: statusFilter === status ? 'white' : '#333'
                            }}
                        >
                            {status === 'all' ? 'Tất cả' : statusLabels[status]?.label || status}
                        </button>
                    ))}
                </div>

                {/* Listings Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                        Không có tin đăng nào
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Hình ảnh</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Thông tin</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Người bán</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Giá</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Trạng thái</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map(listing => (
                                    <tr key={listing._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
                                                {listing.images && listing.images.length > 0 ? (
                                                    <img 
                                                        src={getImageUrl(listing.images[0])} 
                                                        alt={listing.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>
                                                        <i className="fas fa-image"></i>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '600', marginBottom: '5px' }}>{listing.title}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>
                                                <span style={{ marginRight: '10px' }}>
                                                    <i className="fas fa-tag"></i> {categoryLabels[listing.category] || listing.category}
                                                </span>
                                                <span>
                                                    <i className="fas fa-clock"></i> {formatDate(listing.createdAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '500' }}>{listing.sellerName}</div>
                                            {listing.sellerPhone && (
                                                <div style={{ fontSize: '12px', color: '#888' }}>
                                                    <i className="fas fa-phone"></i> {listing.sellerPhone}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px', fontWeight: '600', color: '#f44336' }}>
                                            {formatPrice(listing.price)} {listing.priceUnit}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '15px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: statusLabels[listing.status]?.class === 'warning' ? '#fff3cd' :
                                                           statusLabels[listing.status]?.class === 'success' ? '#d4edda' :
                                                           statusLabels[listing.status]?.class === 'danger' ? '#f8d7da' : '#cce5ff',
                                                color: statusLabels[listing.status]?.class === 'warning' ? '#856404' :
                                                       statusLabels[listing.status]?.class === 'success' ? '#155724' :
                                                       statusLabels[listing.status]?.class === 'danger' ? '#721c24' : '#004085'
                                            }}>
                                                {statusLabels[listing.status]?.label || listing.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <Link 
                                                    to={`/marketplace/${listing._id}`}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        background: '#e3f2fd',
                                                        color: '#1976D2',
                                                        textDecoration: 'none',
                                                        fontSize: '13px'
                                                    }}
                                                    target="_blank"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                
                                                {listing.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(listing._id)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#4CAF50',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedListing(listing._id);
                                                                setShowRejectModal(true);
                                                            }}
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#ff9800',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDelete(listing._id)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: '#f44336',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                background: page === 1 ? '#e0e0e0' : '#2196F3',
                                color: page === 1 ? '#999' : 'white',
                                cursor: page === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <i className="fas fa-chevron-left"></i> Trước
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 15px' }}>
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                background: page === totalPages ? '#e0e0e0' : '#2196F3',
                                color: page === totalPages ? '#999' : 'white',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Sau <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '25px',
                            maxWidth: '400px',
                            width: '90%'
                        }}>
                            <h3 style={{ marginTop: 0 }}>Từ chối tin đăng</h3>
                            <textarea
                                placeholder="Lý do từ chối (không bắt buộc)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    minHeight: '100px',
                                    resize: 'vertical',
                                    marginBottom: '15px'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                        setSelectedListing(null);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReject}
                                    style={{
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: '#ff9800',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Xác nhận từ chối
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default MarketplaceManagement;
